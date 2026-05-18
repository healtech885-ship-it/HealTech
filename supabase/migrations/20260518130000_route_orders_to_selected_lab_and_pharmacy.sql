alter table public.lab_results
  add column if not exists target_lab_id uuid references public.profiles(id) on delete set null;

alter table public.prescriptions
  add column if not exists target_pharmacy_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_lab_results_target_lab_id
  on public.lab_results(target_lab_id);

create index if not exists idx_prescriptions_target_pharmacy_id
  on public.prescriptions(target_pharmacy_id);

with first_lab as (
  select id
  from public.profiles
  where role = 'lab'
    and status = 'active'
  order by created_at asc
  limit 1
)
update public.lab_results lr
set target_lab_id = first_lab.id
from first_lab
where lr.target_lab_id is null;

with first_pharmacy as (
  select id
  from public.profiles
  where role = 'pharmacy'
    and status = 'active'
  order by created_at asc
  limit 1
)
update public.prescriptions pr
set target_pharmacy_id = first_pharmacy.id
from first_pharmacy
where pr.target_pharmacy_id is null;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select
on public.profiles for select
using (
  id = auth.uid()
  or public.is_admin()
  or (
    public.get_current_role() = 'doctor'
    and role in ('lab', 'pharmacy')
    and status = 'active'
  )
  or (
    public.get_current_role() = 'reception'
    and role = 'doctor'
    and status = 'active'
    and id = public.get_reception_assigned_doctor_id()
  )
);

create or replace function public.can_read_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_active()
    and (
      public.is_admin()
      or exists (
        select 1 from patients p
        where p.id = target_patient_id and p.profile_id = auth.uid()
      )
      or exists (
        select 1 from visits v
        where v.patient_id = target_patient_id and v.doctor_id = auth.uid()
      )
      or (
        public.get_current_role() = 'reception'
        and (
          exists (
            select 1
            from patients p
            where p.id = target_patient_id
              and p.created_by = auth.uid()
          )
          or exists (
            select 1
            from visits v
            where v.patient_id = target_patient_id
              and public.reception_can_access_doctor(v.doctor_id)
          )
        )
      )
      or (
        public.get_current_role() = 'lab'
        and exists (
          select 1
          from lab_results lr
          where lr.patient_id = target_patient_id
            and lr.target_lab_id = auth.uid()
        )
      )
      or (
        public.get_current_role() = 'pharmacy'
        and exists (
          select 1
          from prescriptions pr
          where pr.patient_id = target_patient_id
            and pr.target_pharmacy_id = auth.uid()
        )
      )
    );
$$;

create or replace function public.can_read_visit(target_visit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_active()
    and (
      public.is_admin()
      or exists (
        select 1 from visits v
        where v.id = target_visit_id
          and public.reception_can_access_doctor(v.doctor_id)
      )
      or exists (
        select 1 from visits v
        where v.id = target_visit_id and v.doctor_id = auth.uid()
      )
      or exists (
        select 1
        from visits v
        join patients p on p.id = v.patient_id
        where v.id = target_visit_id and p.profile_id = auth.uid()
      )
      or (
        public.get_current_role() = 'lab'
        and exists (
          select 1
          from lab_results lr
          where lr.visit_id = target_visit_id
            and lr.target_lab_id = auth.uid()
        )
      )
      or (
        public.get_current_role() = 'pharmacy'
        and exists (
          select 1
          from prescriptions pr
          where pr.visit_id = target_visit_id
            and pr.target_pharmacy_id = auth.uid()
        )
      )
    );
$$;

drop policy if exists lab_results_read_by_role on public.lab_results;
create policy lab_results_read_by_role
on public.lab_results for select
using (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.get_current_role() = 'lab'
    and target_lab_id = auth.uid()
  )
  or (
    public.current_user_is_active()
    and visible_to_patient
    and exists (select 1 from patients p where p.id = lab_results.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists lab_results_doctor_insert on public.lab_results;
create policy lab_results_doctor_insert
on public.lab_results for insert
with check (
  public.is_admin()
  or (
    doctor_id = auth.uid()
    and target_lab_id is not null
  )
);

drop policy if exists lab_results_lab_doctor_update on public.lab_results;
create policy lab_results_lab_doctor_update
on public.lab_results for update
using (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.get_current_role() = 'lab'
    and target_lab_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.get_current_role() = 'lab'
    and target_lab_id = auth.uid()
  )
);

drop policy if exists prescriptions_read_by_role on public.prescriptions;
create policy prescriptions_read_by_role
on public.prescriptions for select
using (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.get_current_role() = 'pharmacy'
    and target_pharmacy_id = auth.uid()
  )
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = prescriptions.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists prescriptions_doctor_insert on public.prescriptions;
create policy prescriptions_doctor_insert
on public.prescriptions for insert
with check (
  public.is_admin()
  or (
    doctor_id = auth.uid()
    and target_pharmacy_id is not null
  )
);

drop policy if exists prescriptions_pharmacy_update on public.prescriptions;
create policy prescriptions_pharmacy_update
on public.prescriptions for update
using (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.get_current_role() = 'pharmacy'
    and target_pharmacy_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.get_current_role() = 'pharmacy'
    and target_pharmacy_id = auth.uid()
  )
);

drop policy if exists prescription_items_read_by_role on public.prescription_items;
create policy prescription_items_read_by_role
on public.prescription_items for select
using (
  public.is_admin()
  or exists (
    select 1 from prescriptions pr
    where pr.id = prescription_items.prescription_id
      and pr.doctor_id = auth.uid()
  )
  or exists (
    select 1 from prescriptions pr
    where pr.id = prescription_items.prescription_id
      and public.get_current_role() = 'pharmacy'
      and pr.target_pharmacy_id = auth.uid()
  )
  or exists (
    select 1
    from prescriptions pr
    join patients p on p.id = pr.patient_id
    where pr.id = prescription_items.prescription_id
      and p.profile_id = auth.uid()
  )
);

drop policy if exists prescription_items_pharmacy_update on public.prescription_items;
create policy prescription_items_pharmacy_update
on public.prescription_items for update
using (
  public.is_admin()
  or exists (
    select 1
    from prescriptions pr
    where pr.id = prescription_items.prescription_id
      and public.get_current_role() = 'pharmacy'
      and pr.target_pharmacy_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from prescriptions pr
    where pr.id = prescription_items.prescription_id
      and public.get_current_role() = 'pharmacy'
      and pr.target_pharmacy_id = auth.uid()
  )
);

drop function if exists public.request_lab_tests_tx(uuid, uuid, uuid[], text);
create or replace function public.request_lab_tests_tx(
  actor uuid,
  target_visit_id uuid,
  target_lab_test_ids uuid[],
  target_lab_id uuid,
  target_doctor_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v visits;
  test_id uuid;
  lr lab_results;
  created_ids uuid[] := '{}';
begin
  if target_lab_id is null then
    raise exception 'Target lab is required';
  end if;

  if not exists (select 1 from profiles where id = target_lab_id and role = 'lab' and status = 'active') then
    raise exception 'Selected lab account is not active';
  end if;

  select * into v
  from visits
  where id = target_visit_id
    and (doctor_id = actor or exists (select 1 from profiles where id = actor and role = 'admin'));
  if not found then
    raise exception 'visit not found for doctor';
  end if;

  foreach test_id in array target_lab_test_ids loop
    insert into lab_results(visit_id, patient_id, doctor_id, target_lab_id, lab_test_id, result_notes)
    values (v.id, v.patient_id, v.doctor_id, target_lab_id, test_id, target_doctor_notes)
    returning * into lr;
    created_ids := array_append(created_ids, lr.id);
  end loop;

  update visits set status = 'waiting_lab', updated_at = now() where id = v.id;
  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'lab_results.requested', 'visit', v.id, jsonb_build_object('lab_result_ids', created_ids, 'target_lab_id', target_lab_id));
  return jsonb_build_object('lab_result_ids', created_ids, 'target_lab_id', target_lab_id);
end;
$$;

create or replace function public.submit_lab_result_tx(actor uuid, target_lab_result_id uuid, target_result_value text, target_result_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  lr lab_results;
begin
  update lab_results
  set result_value = target_result_value,
      result_notes = target_result_notes,
      status = 'submitted',
      entered_by = actor,
      entered_at = now(),
      updated_at = now()
  where id = target_lab_result_id
    and (
      target_lab_id = actor
      or exists (select 1 from profiles where id = actor and role = 'admin')
    )
  returning * into lr;

  if not found then
    raise exception 'lab result not found for this lab account';
  end if;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'lab_result.submitted', 'lab_result', lr.id, jsonb_build_object('target_lab_id', lr.target_lab_id));
  return to_jsonb(lr);
end;
$$;

drop function if exists public.create_prescription_tx(uuid, uuid, jsonb, text);
create or replace function public.create_prescription_tx(
  actor uuid,
  target_visit_id uuid,
  target_items jsonb,
  target_pharmacy_id uuid,
  target_doctor_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v visits;
  pr prescriptions;
  item jsonb;
begin
  if target_pharmacy_id is null then
    raise exception 'Target pharmacy is required';
  end if;

  if not exists (select 1 from profiles where id = target_pharmacy_id and role = 'pharmacy' and status = 'active') then
    raise exception 'Selected pharmacy account is not active';
  end if;

  select * into v
  from visits
  where id = target_visit_id
    and (doctor_id = actor or exists (select 1 from profiles where id = actor and role = 'admin'));
  if not found then
    raise exception 'visit not found for doctor';
  end if;

  insert into prescriptions(visit_id, patient_id, doctor_id, target_pharmacy_id, doctor_notes)
  values (v.id, v.patient_id, v.doctor_id, target_pharmacy_id, target_doctor_notes)
  returning * into pr;

  for item in select * from jsonb_array_elements(target_items) loop
    insert into prescription_items(prescription_id, medicine_id, requested_quantity, dosage_instructions)
    values (
      pr.id,
      (item->>'medicine_id')::uuid,
      (item->>'requested_quantity')::integer,
      item->>'dosage_instructions'
    );
  end loop;

  update visits set status = 'waiting_pharmacy', updated_at = now() where id = v.id;
  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'prescription.created', 'prescription', pr.id, jsonb_build_object('target_pharmacy_id', target_pharmacy_id));
  return to_jsonb(pr);
end;
$$;

create or replace function public.dispense_prescription_item_tx(target_item_id uuid, quantity_to_dispense integer, actor uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item prescription_items;
  prescription prescriptions;
  batch medicine_batches;
  remaining integer := quantity_to_dispense;
begin
  select * into item from prescription_items where id = target_item_id for update;
  if not found then
    raise exception 'prescription item not found';
  end if;

  select * into prescription from prescriptions where id = item.prescription_id for update;
  if not found then
    raise exception 'prescription not found';
  end if;

  if prescription.target_pharmacy_id is distinct from actor
    and not exists (select 1 from profiles where id = actor and role = 'admin') then
    raise exception 'prescription is not assigned to this pharmacy account';
  end if;

  if quantity_to_dispense <= 0 or item.dispensed_quantity + quantity_to_dispense > item.requested_quantity then
    raise exception 'invalid dispense quantity';
  end if;

  for batch in
    select * from medicine_batches
    where medicine_id = item.medicine_id and status = 'in_stock' and quantity > 0 and (expiry_date is null or expiry_date >= current_date)
    order by expiry_date nulls last, created_at
    for update
  loop
    exit when remaining <= 0;
    if batch.quantity >= remaining then
      update medicine_batches set quantity = quantity - remaining, updated_at = now() where id = batch.id;
      remaining := 0;
    else
      remaining := remaining - batch.quantity;
      update medicine_batches set quantity = 0, status = 'out_of_stock', updated_at = now() where id = batch.id;
    end if;
  end loop;

  if remaining > 0 then
    raise exception 'medicine stock is not enough';
  end if;

  update prescription_items
  set dispensed_quantity = dispensed_quantity + quantity_to_dispense,
      status = case when dispensed_quantity + quantity_to_dispense >= requested_quantity then 'dispensed'::prescription_item_status else status end,
      dispensed_by = actor,
      dispensed_at = now(),
      updated_at = now()
  where id = item.id;

  update prescriptions pr
  set status = case
      when not exists (select 1 from prescription_items pi where pi.prescription_id = pr.id and pi.status <> 'dispensed') then 'dispensed'::prescription_status
      else 'partially_dispensed'::prescription_status
    end,
      completed_at = case
        when not exists (select 1 from prescription_items pi where pi.prescription_id = pr.id and pi.status <> 'dispensed') then now()
        else completed_at
      end,
      updated_at = now()
  where pr.id = item.prescription_id;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'prescription_item.dispensed', 'prescription_item', item.id, jsonb_build_object('quantity', quantity_to_dispense, 'target_pharmacy_id', prescription.target_pharmacy_id));

  return jsonb_build_object('item_id', item.id, 'dispensed_quantity', quantity_to_dispense);
end;
$$;

revoke execute on function public.request_lab_tests_tx(uuid, uuid, uuid[], uuid, text) from public, anon, authenticated;
revoke execute on function public.create_prescription_tx(uuid, uuid, jsonb, uuid, text) from public, anon, authenticated;
grant execute on function public.request_lab_tests_tx(uuid, uuid, uuid[], uuid, text) to service_role;
grant execute on function public.submit_lab_result_tx(uuid, uuid, text, text) to service_role;
grant execute on function public.create_prescription_tx(uuid, uuid, jsonb, uuid, text) to service_role;
grant execute on function public.dispense_prescription_item_tx(uuid, integer, uuid) to service_role;
