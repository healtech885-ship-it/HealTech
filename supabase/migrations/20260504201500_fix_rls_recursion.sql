create or replace function can_read_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.get_current_role() = 'reception'
    or exists (
      select 1 from patients p
      where p.id = target_patient_id and p.profile_id = auth.uid()
    )
    or exists (
      select 1 from visits v
      where v.patient_id = target_patient_id and v.doctor_id = auth.uid()
    )
    or (
      public.get_current_role() = 'lab'
      and exists (select 1 from lab_orders lo where lo.patient_id = target_patient_id)
    )
    or (
      public.get_current_role() = 'pharmacy'
      and exists (select 1 from medicine_orders mo where mo.patient_id = target_patient_id)
    );
$$;

create or replace function can_read_visit(target_visit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or public.get_current_role() = 'reception'
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
      and exists (select 1 from lab_orders lo where lo.visit_id = target_visit_id)
    )
    or (
      public.get_current_role() = 'pharmacy'
      and exists (select 1 from medicine_orders mo where mo.visit_id = target_visit_id)
    );
$$;

drop policy if exists patients_read_by_role on patients;
create policy patients_read_by_role
on patients for select
using (public.can_read_patient(id));

drop policy if exists visits_read_by_role on visits;
create policy visits_read_by_role
on visits for select
using (public.can_read_visit(id));
