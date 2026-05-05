-- RLS hardening pass:
-- - Treat inactive/suspended profiles as having no application role.
-- - Keep workflow SECURITY DEFINER RPCs behind Edge Functions/service role.
-- - Remove public/broad direct-write policies for sensitive tables.

create or replace function current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function get_current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from profiles
  where id = auth.uid()
    and status = 'active';
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(get_current_role() = 'admin', false);
$$;

create or replace function can_read_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_active()
    and (
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
      )
      or (
        public.get_current_role() = 'lab'
        and exists (select 1 from lab_results lr where lr.patient_id = target_patient_id)
      )
      or (
        public.get_current_role() = 'pharmacy'
        and exists (select 1 from prescriptions pr where pr.patient_id = target_patient_id)
      )
    );
$$;

create or replace function can_read_visit(target_visit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_is_active()
    and (
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
        and (
          exists (select 1 from lab_orders lo where lo.visit_id = target_visit_id)
          or exists (select 1 from lab_results lr where lr.visit_id = target_visit_id)
        )
      )
      or (
        public.get_current_role() = 'pharmacy'
        and (
          exists (select 1 from medicine_orders mo where mo.visit_id = target_visit_id)
          or exists (select 1 from prescriptions pr where pr.visit_id = target_visit_id)
        )
      )
    );
$$;

create or replace function prevent_patient_self_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.profile_id and not (public.get_current_role() in ('admin', 'reception')) then
    if new.profile_id is distinct from old.profile_id
      or new.student_id is distinct from old.student_id
      or new.mrn is distinct from old.mrn
      or new.gender is distinct from old.gender
      or new.birth_date is distinct from old.birth_date
      or new.department_id is distinct from old.department_id
      or new.dorm_info is distinct from old.dorm_info
      or new.nationality is distinct from old.nationality
      or new.status is distinct from old.status
      or new.created_by is distinct from old.created_by then
      raise exception 'Patients can only update their own contact fields';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_patients_prevent_self_sensitive_update on patients;
create trigger trg_patients_prevent_self_sensitive_update
before update on patients
for each row execute function prevent_patient_self_sensitive_update();

-- Patients may update only their own active contact row; reception/admin can manage patient demographics.
drop policy if exists patients_reception_update on patients;
create policy patients_reception_update
on patients for update
using (
  public.is_admin()
  or public.get_current_role() = 'reception'
  or (public.current_user_is_active() and profile_id = auth.uid())
)
with check (
  public.is_admin()
  or public.get_current_role() = 'reception'
  or (public.current_user_is_active() and profile_id = auth.uid())
);

-- Direct visit writes are limited to admins and assigned active doctors; Edge Functions enforce field-level workflows.
drop policy if exists visits_doctor_update on visits;
create policy visits_doctor_update
on visits for update
using (
  public.is_admin()
  or (public.get_current_role() = 'doctor' and doctor_id = auth.uid() and status not in ('completed', 'cancelled'))
)
with check (
  public.is_admin()
  or (public.get_current_role() = 'doctor' and doctor_id = auth.uid())
);

-- Lab order updates are a lab/admin workflow; doctors create orders through Edge Functions.
drop policy if exists lab_orders_lab_update on lab_orders;
create policy lab_orders_lab_update
on lab_orders for update
using (public.is_admin() or public.get_current_role() = 'lab')
with check (public.is_admin() or public.get_current_role() = 'lab');

-- Patient/self branches must require an active profile.
drop policy if exists lab_orders_read_by_role on lab_orders;
create policy lab_orders_read_by_role
on lab_orders for select
using (
  public.is_admin()
  or public.get_current_role() = 'lab'
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = lab_orders.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists medicine_orders_read_by_role on medicine_orders;
create policy medicine_orders_read_by_role
on medicine_orders for select
using (
  public.is_admin()
  or public.get_current_role() = 'pharmacy'
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = medicine_orders.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists lab_items_read_by_role on lab_order_items;
create policy lab_items_read_by_role
on lab_order_items for select
using (
  public.is_admin()
  or public.get_current_role() = 'lab'
  or exists (select 1 from lab_orders lo where lo.id = lab_order_items.lab_order_id and lo.doctor_id = auth.uid())
  or (
    public.current_user_is_active()
    and visible_to_patient
    and exists (
      select 1
      from lab_orders lo
      join patients p on p.id = lo.patient_id
      where lo.id = lab_order_items.lab_order_id
        and p.profile_id = auth.uid()
    )
  )
);

drop policy if exists medicine_items_read_by_role on medicine_order_items;
create policy medicine_items_read_by_role
on medicine_order_items for select
using (
  public.is_admin()
  or public.get_current_role() = 'pharmacy'
  or exists (select 1 from medicine_orders mo where mo.id = medicine_order_items.medicine_order_id and mo.doctor_id = auth.uid())
  or (
    public.current_user_is_active()
    and exists (
      select 1
      from medicine_orders mo
      join patients p on p.id = mo.patient_id
      where mo.id = medicine_order_items.medicine_order_id
        and p.profile_id = auth.uid()
    )
  )
);

drop policy if exists appointment_requests_read on appointment_requests;
create policy appointment_requests_read
on appointment_requests for select
using (
  public.is_admin()
  or public.get_current_role() = 'reception'
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = appointment_requests.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists appointment_requests_patient_insert on appointment_requests;
create policy appointment_requests_patient_insert
on appointment_requests for insert
with check (
  public.is_admin()
  or public.get_current_role() = 'reception'
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = appointment_requests.patient_id and p.profile_id = auth.uid())
  )
);

-- Public visitor appointments are not currently used by the app; disallow anonymous spam writes.
drop policy if exists appointments_public_insert on appointments;
create policy appointments_authenticated_insert
on appointments for insert
with check (
  public.is_admin()
  or public.get_current_role() = 'reception'
  or (
    public.current_user_is_active()
    and patient_id is not null
    and exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists appointments_read_by_role on appointments;
create policy appointments_read_by_role
on appointments for select
using (
  public.is_admin()
  or public.get_current_role() = 'reception'
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
  )
);

-- Reception should not read diagnoses; doctors and patients see only related records.
drop policy if exists diagnoses_read_by_role on diagnoses;
create policy diagnoses_read_by_role
on diagnoses for select
using (
  public.is_admin()
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = diagnoses.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists diagnoses_doctor_write on diagnoses;
create policy diagnoses_doctor_insert
on diagnoses for insert
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'doctor'
    and doctor_id = auth.uid()
    and exists (
      select 1 from visits v
      where v.id = diagnoses.visit_id
        and v.patient_id = diagnoses.patient_id
        and v.doctor_id = auth.uid()
        and v.status not in ('completed', 'cancelled')
    )
  )
);

create policy diagnoses_doctor_update
on diagnoses for update
using (
  public.is_admin()
  or (
    public.get_current_role() = 'doctor'
    and doctor_id = auth.uid()
    and exists (
      select 1 from visits v
      where v.id = diagnoses.visit_id
        and v.doctor_id = auth.uid()
        and v.status not in ('completed', 'cancelled')
    )
  )
)
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'doctor'
    and doctor_id = auth.uid()
    and exists (
      select 1 from visits v
      where v.id = diagnoses.visit_id
        and v.patient_id = diagnoses.patient_id
        and v.doctor_id = auth.uid()
    )
  )
);

-- Medicine catalog is internal clinical/inventory data, not public data.
drop policy if exists medicines_read_internal on medicines;
create policy medicines_read_internal
on medicines for select
using (public.get_current_role() in ('admin', 'doctor', 'pharmacy'));

drop policy if exists medicines_pharmacy_write on medicines;
create policy medicines_pharmacy_insert
on medicines for insert
with check (public.get_current_role() in ('admin', 'pharmacy'));
create policy medicines_pharmacy_update
on medicines for update
using (public.get_current_role() in ('admin', 'pharmacy'))
with check (public.get_current_role() in ('admin', 'pharmacy'));

drop policy if exists lab_results_read_by_role on lab_results;
create policy lab_results_read_by_role
on lab_results for select
using (
  public.is_admin()
  or public.get_current_role() = 'lab'
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and visible_to_patient
    and exists (select 1 from patients p where p.id = lab_results.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists lab_results_doctor_insert on lab_results;
create policy lab_results_doctor_insert
on lab_results for insert
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'doctor'
    and doctor_id = auth.uid()
    and exists (
      select 1 from visits v
      where v.id = lab_results.visit_id
        and v.patient_id = lab_results.patient_id
        and v.doctor_id = auth.uid()
        and v.status not in ('completed', 'cancelled')
    )
  )
);

drop policy if exists lab_results_lab_doctor_update on lab_results;
create policy lab_results_lab_update
on lab_results for update
using (public.is_admin() or public.get_current_role() = 'lab')
with check (public.is_admin() or public.get_current_role() = 'lab');

drop policy if exists prescriptions_read_by_role on prescriptions;
create policy prescriptions_read_by_role
on prescriptions for select
using (
  public.is_admin()
  or public.get_current_role() = 'pharmacy'
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = prescriptions.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists prescriptions_doctor_insert on prescriptions;
create policy prescriptions_doctor_insert
on prescriptions for insert
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'doctor'
    and doctor_id = auth.uid()
    and exists (
      select 1 from visits v
      where v.id = prescriptions.visit_id
        and v.patient_id = prescriptions.patient_id
        and v.doctor_id = auth.uid()
        and v.status not in ('completed', 'cancelled')
    )
  )
);

drop policy if exists prescriptions_pharmacy_update on prescriptions;
create policy prescriptions_pharmacy_update
on prescriptions for update
using (public.is_admin() or public.get_current_role() = 'pharmacy')
with check (public.is_admin() or public.get_current_role() = 'pharmacy');

drop policy if exists prescription_items_read_by_role on prescription_items;
create policy prescription_items_read_by_role
on prescription_items for select
using (
  public.is_admin()
  or public.get_current_role() = 'pharmacy'
  or exists (select 1 from prescriptions pr where pr.id = prescription_items.prescription_id and pr.doctor_id = auth.uid())
  or (
    public.current_user_is_active()
    and exists (
      select 1
      from prescriptions pr
      join patients p on p.id = pr.patient_id
      where pr.id = prescription_items.prescription_id
        and p.profile_id = auth.uid()
    )
  )
);

-- Split broad write policies into insert/update only. Deletes remain unavailable to authenticated clients.
drop policy if exists lab_tests_admin_lab_write on lab_tests;
create policy lab_tests_admin_lab_insert
on lab_tests for insert
with check (public.get_current_role() in ('admin', 'lab'));
create policy lab_tests_admin_lab_update
on lab_tests for update
using (public.get_current_role() in ('admin', 'lab'))
with check (public.get_current_role() in ('admin', 'lab'));

drop policy if exists medicine_names_pharmacy_write on medicine_names;
create policy medicine_names_pharmacy_insert
on medicine_names for insert
with check (public.get_current_role() in ('admin', 'pharmacy'));
create policy medicine_names_pharmacy_update
on medicine_names for update
using (public.get_current_role() in ('admin', 'pharmacy'))
with check (public.get_current_role() in ('admin', 'pharmacy'));

drop policy if exists medicine_batches_pharmacy_write on medicine_batches;
create policy medicine_batches_pharmacy_insert
on medicine_batches for insert
with check (public.get_current_role() in ('admin', 'pharmacy'));
create policy medicine_batches_pharmacy_update
on medicine_batches for update
using (public.get_current_role() in ('admin', 'pharmacy'))
with check (public.get_current_role() in ('admin', 'pharmacy'));

drop policy if exists leave_requests_read on leave_requests;
create policy leave_requests_read
on leave_requests for select
using (public.is_admin() or (public.current_user_is_active() and employee_profile_id = auth.uid()));

drop policy if exists leave_requests_insert_self on leave_requests;
create policy leave_requests_insert_self
on leave_requests for insert
with check (public.is_admin() or (public.current_user_is_active() and employee_profile_id = auth.uid()));

drop policy if exists leave_requests_update on leave_requests;
create policy leave_requests_update
on leave_requests for update
using (
  public.is_admin()
  or (public.current_user_is_active() and employee_profile_id = auth.uid() and status = 'pending')
)
with check (
  public.is_admin()
  or (public.current_user_is_active() and employee_profile_id = auth.uid())
);

drop policy if exists store_assignments_read on store_assignments;
create policy store_assignments_read
on store_assignments for select
using (public.is_admin() or (public.current_user_is_active() and assigned_to = auth.uid()));

drop policy if exists store_requests_read on store_requests;
create policy store_requests_read
on store_requests for select
using (public.is_admin() or (public.current_user_is_active() and requested_by = auth.uid()));

drop policy if exists store_requests_insert_self on store_requests;
create policy store_requests_insert_self
on store_requests for insert
with check (public.is_admin() or (public.current_user_is_active() and requested_by = auth.uid()));

-- Audit logs are written by trusted server-side code; clients should not forge audit records.
drop policy if exists audit_logs_insert_internal on audit_logs;

-- Workflow RPCs are executed through Edge Functions after JWT + role checks.
revoke execute on function public.dispense_medicine_item(uuid, integer, uuid) from public, anon, authenticated;
revoke execute on function public.complete_visit(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.create_visit_tx(uuid, uuid, uuid, text, visit_priority) from public, anon, authenticated;
revoke execute on function public.order_lab_tests_tx(uuid, uuid, uuid[], text) from public, anon, authenticated;
revoke execute on function public.order_medicines_tx(uuid, uuid, jsonb, text) from public, anon, authenticated;
revoke execute on function public.submit_lab_results_tx(uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.assign_store_item_tx(uuid, uuid, uuid, integer, text) from public, anon, authenticated;
revoke execute on function public.create_visit_from_appointment_tx(uuid, uuid, uuid, uuid, text, visit_priority) from public, anon, authenticated;
revoke execute on function public.add_diagnosis_tx(uuid, uuid, text, text, text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.request_lab_tests_tx(uuid, uuid, uuid[], text) from public, anon, authenticated;
revoke execute on function public.submit_lab_result_tx(uuid, uuid, text, text) from public, anon, authenticated;
revoke execute on function public.approve_lab_result_tx(uuid, uuid[]) from public, anon, authenticated;
revoke execute on function public.create_prescription_tx(uuid, uuid, jsonb, text) from public, anon, authenticated;
revoke execute on function public.dispense_prescription_item_tx(uuid, integer, uuid) from public, anon, authenticated;

grant execute on function public.dispense_medicine_item(uuid, integer, uuid) to service_role;
grant execute on function public.complete_visit(uuid, uuid) to service_role;
grant execute on function public.create_visit_tx(uuid, uuid, uuid, text, visit_priority) to service_role;
grant execute on function public.order_lab_tests_tx(uuid, uuid, uuid[], text) to service_role;
grant execute on function public.order_medicines_tx(uuid, uuid, jsonb, text) to service_role;
grant execute on function public.submit_lab_results_tx(uuid, uuid, jsonb) to service_role;
grant execute on function public.assign_store_item_tx(uuid, uuid, uuid, integer, text) to service_role;
grant execute on function public.create_visit_from_appointment_tx(uuid, uuid, uuid, uuid, text, visit_priority) to service_role;
grant execute on function public.add_diagnosis_tx(uuid, uuid, text, text, text, text, text, boolean) to service_role;
grant execute on function public.request_lab_tests_tx(uuid, uuid, uuid[], text) to service_role;
grant execute on function public.submit_lab_result_tx(uuid, uuid, text, text) to service_role;
grant execute on function public.approve_lab_result_tx(uuid, uuid[]) to service_role;
grant execute on function public.create_prescription_tx(uuid, uuid, jsonb, text) to service_role;
grant execute on function public.dispense_prescription_item_tx(uuid, integer, uuid) to service_role;
