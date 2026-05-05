create or replace function prevent_profile_privilege_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    if new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.email is distinct from old.email then
      raise exception 'Only an admin can change profile role, status, or email';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_prevent_privilege_self_change on profiles;
create trigger trg_profiles_prevent_privilege_self_change
before update on profiles
for each row execute function prevent_profile_privilege_self_change();

drop policy if exists profiles_update_admin_or_self on profiles;
create policy profiles_admin_update
on profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy profiles_self_contact_update
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists lab_items_update_lab_doctor on lab_order_items;
create policy lab_items_update_lab
on lab_order_items for update
using (public.is_admin() or public.get_current_role() = 'lab')
with check (public.is_admin() or public.get_current_role() = 'lab');

drop policy if exists medicine_orders_pharmacy_update on medicine_orders;
create policy medicine_orders_pharmacy_update
on medicine_orders for update
using (public.is_admin() or public.get_current_role() = 'pharmacy')
with check (public.is_admin() or public.get_current_role() = 'pharmacy');

create or replace function complete_visit(target_visit_id uuid, actor uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  visit_row visits;
begin
  select * into visit_row
  from visits
  where id = target_visit_id
  for update;

  if not found then
    raise exception 'Visit not found';
  end if;

  if visit_row.status in ('completed', 'cancelled') then
    raise exception 'Visit is already closed';
  end if;

  if visit_row.diagnosis is null or length(trim(visit_row.diagnosis)) = 0 then
    raise exception 'Diagnosis is required before completing visit';
  end if;

  update visits
  set status = 'completed',
      completed_at = now()
  where id = target_visit_id;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(actor, 'visit.completed', 'visit', target_visit_id, jsonb_build_object('patient_id', visit_row.patient_id));

  return jsonb_build_object('ok', true, 'visit_id', target_visit_id);
end;
$$;
