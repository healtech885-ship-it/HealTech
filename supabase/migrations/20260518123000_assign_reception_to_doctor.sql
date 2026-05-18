alter table public.employees
  add column if not exists assigned_doctor_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_employees_assigned_doctor_id
  on public.employees(assigned_doctor_id);

with first_doctor as (
  select p.id
  from public.profiles p
  where p.role = 'doctor'
    and p.status = 'active'
  order by p.created_at asc
  limit 1
)
update public.employees e
set assigned_doctor_id = first_doctor.id
from first_doctor, public.profiles ep
where ep.role = 'reception'
  and ep.id = e.profile_id
  and e.assigned_doctor_id is null;

create or replace function public.get_reception_assigned_doctor_id(actor uuid default auth.uid())
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.assigned_doctor_id
  from public.employees e
  join public.profiles p on p.id = e.profile_id
  where e.profile_id = actor
    and e.status = 'active'
    and p.role = 'reception'
    and p.status = 'active'
  limit 1;
$$;

create or replace function public.reception_can_access_doctor(target_doctor_id uuid, actor uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employees e
    join public.profiles p on p.id = e.profile_id
    where e.profile_id = actor
      and e.status = 'active'
      and p.role = 'reception'
      and p.status = 'active'
      and target_doctor_id is not null
      and target_doctor_id = e.assigned_doctor_id
  )
$$;

create or replace function public.get_reception_assigned_doctor_department_id(actor uuid default auth.uid())
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select de.department_id
  from public.employees re
  join public.profiles rp on rp.id = re.profile_id
  join public.employees de on de.profile_id = re.assigned_doctor_id
  where re.profile_id = actor
    and re.status = 'active'
    and rp.role = 'reception'
    and rp.status = 'active'
  limit 1;
$$;

create or replace function public.reception_can_access_appointment_request(target_request_id uuid, actor uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointment_requests ar
    join public.employees e on e.profile_id = actor
    join public.profiles p on p.id = e.profile_id
    where ar.id = target_request_id
      and e.status = 'active'
      and p.role = 'reception'
      and p.status = 'active'
      and (
        ar.requested_department_id = public.get_reception_assigned_doctor_department_id(actor)
        or exists (
          select 1
          from public.visits v
          where v.patient_id = ar.patient_id
            and v.doctor_id = e.assigned_doctor_id
        )
      )
  );
$$;

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

drop policy if exists profiles_select on public.profiles;
create policy profiles_select
on public.profiles for select
using (
  id = auth.uid()
  or public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and role = 'doctor'
    and status = 'active'
    and id = public.get_reception_assigned_doctor_id()
  )
);

drop policy if exists patients_reception_update on public.patients;
create policy patients_reception_update
on public.patients for update
using (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and public.can_read_patient(id)
  )
  or (public.current_user_is_active() and profile_id = auth.uid())
)
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and public.can_read_patient(id)
  )
  or (public.current_user_is_active() and profile_id = auth.uid())
);

drop policy if exists visits_reception_insert on public.visits;
create policy visits_reception_insert
on public.visits for insert
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and public.reception_can_access_doctor(doctor_id)
  )
);

drop policy if exists appointments_read_by_role on public.appointments;
create policy appointments_read_by_role
on public.appointments for select
using (
  public.is_admin()
  or public.reception_can_access_doctor(doctor_id)
  or doctor_id = auth.uid()
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists appointments_reception_update on public.appointments;
create policy appointments_reception_update
on public.appointments for update
using (
  public.is_admin()
  or public.reception_can_access_doctor(doctor_id)
)
with check (
  public.is_admin()
  or public.reception_can_access_doctor(doctor_id)
);

drop policy if exists appointment_requests_read on public.appointment_requests;
create policy appointment_requests_read
on public.appointment_requests for select
using (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and (
      requested_department_id = public.get_reception_assigned_doctor_department_id()
      or exists (
        select 1
        from public.visits v
        where v.patient_id = appointment_requests.patient_id
          and public.reception_can_access_doctor(v.doctor_id)
      )
    )
  )
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = appointment_requests.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists appointment_requests_patient_insert on public.appointment_requests;
create policy appointment_requests_patient_insert
on public.appointment_requests for insert
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and public.can_read_patient(patient_id)
  )
  or (
    public.current_user_is_active()
    and exists (select 1 from patients p where p.id = appointment_requests.patient_id and p.profile_id = auth.uid())
  )
);

drop policy if exists appointment_requests_review on public.appointment_requests;
create policy appointment_requests_review
on public.appointment_requests for update
using (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and (
      requested_department_id = public.get_reception_assigned_doctor_department_id()
      or exists (
        select 1
        from public.visits v
        where v.patient_id = appointment_requests.patient_id
          and public.reception_can_access_doctor(v.doctor_id)
      )
    )
  )
)
with check (
  public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and (
      requested_department_id = public.get_reception_assigned_doctor_department_id()
      or exists (
        select 1
        from public.visits v
        where v.patient_id = appointment_requests.patient_id
          and public.reception_can_access_doctor(v.doctor_id)
      )
    )
  )
);

create or replace function public.create_visit_tx(
  actor uuid,
  target_patient_id uuid,
  target_doctor_id uuid,
  target_chief_complaint text default null,
  target_priority visit_priority default 'normal'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  doctor_row profiles;
  patient_row patients;
  new_visit visits;
  actor_role user_role;
begin
  select role into actor_role from profiles where id = actor and status = 'active';
  if actor_role not in ('admin', 'reception') then
    raise exception 'Only admin or reception can create visits';
  end if;

  if actor_role = 'reception' and not public.reception_can_access_doctor(target_doctor_id, actor) then
    raise exception 'Reception account is not assigned to the selected doctor';
  end if;

  select * into patient_row from patients where id = target_patient_id and status = 'active';
  if not found then
    raise exception 'Patient not found or inactive';
  end if;

  select * into doctor_row from profiles where id = target_doctor_id and role = 'doctor' and status = 'active';
  if not found then
    raise exception 'Selected doctor is not active';
  end if;

  insert into visits(patient_id, doctor_id, reception_id, visit_code, chief_complaint, priority, status)
  values(target_patient_id, target_doctor_id, actor, generate_visit_code(), target_chief_complaint, coalesce(target_priority, 'normal'), 'queued')
  returning * into new_visit;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(actor, 'visit.created', 'visit', new_visit.id, jsonb_build_object('patient_id', target_patient_id, 'doctor_id', target_doctor_id));

  return jsonb_build_object('id', new_visit.id, 'visit_code', new_visit.visit_code);
end;
$$;

create or replace function public.create_visit_from_appointment_tx(
  actor uuid,
  target_appointment_id uuid,
  target_patient_id uuid,
  target_doctor_id uuid,
  target_chief_complaint text default null,
  target_priority visit_priority default 'normal'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_visit visits;
  actor_role user_role;
begin
  select role into actor_role from profiles where id = actor and status = 'active';
  if actor_role not in ('admin', 'reception') then
    raise exception 'Only admin or reception can create visits';
  end if;

  if actor_role = 'reception' and not public.reception_can_access_doctor(target_doctor_id, actor) then
    raise exception 'Reception account is not assigned to the selected doctor';
  end if;

  insert into visits (patient_id, doctor_id, reception_id, visit_code, chief_complaint, priority)
  values (target_patient_id, target_doctor_id, actor, generate_visit_code(), target_chief_complaint, target_priority)
  returning * into new_visit;

  update appointments
  set patient_id = target_patient_id,
      doctor_id = target_doctor_id,
      status = 'approved',
      reviewed_by = actor,
      reviewed_at = now(),
      updated_at = now()
  where id = target_appointment_id;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'visit.created_from_appointment', 'visit', new_visit.id, jsonb_build_object('appointment_id', target_appointment_id));

  return to_jsonb(new_visit);
end;
$$;

create or replace function public.get_role_dashboard_counters(target_role user_role default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  role_value user_role := coalesce(target_role, public.get_current_role());
  assigned_doctor uuid := public.get_reception_assigned_doctor_id();
begin
  if role_value = 'reception' then
    return jsonb_build_object(
      'assignedDoctors', case when assigned_doctor is null then 0 else 1 end,
      'patients', (
        select count(distinct p.id)
        from patients p
        where public.can_read_patient(p.id)
      ),
      'visitsToday', (
        select count(*) from visits
        where doctor_id = assigned_doctor
          and created_at::date = current_date
      ),
      'queuedVisits', (
        select count(*) from visits
        where doctor_id = assigned_doctor
          and status = 'queued'
      ),
      'appointmentsPending', (
        select count(*) from appointment_requests
        where status = 'pending'
          and (
            requested_department_id = public.get_reception_assigned_doctor_department_id()
            or exists (
              select 1
              from visits v
              where v.patient_id = appointment_requests.patient_id
                and v.doctor_id = assigned_doctor
            )
          )
      ),
      'pendingLabResults', (
        select count(*) from lab_results
        where doctor_id = assigned_doctor
          and status in ('pending','entered','submitted')
      ),
      'pendingPrescriptions', (
        select count(*) from prescriptions
        where doctor_id = assigned_doctor
          and status in ('ordered','partially_dispensed')
      )
    );
  end if;

  return jsonb_build_object(
    'employees', (select count(*) from employees),
    'doctors', (select count(*) from profiles where role = 'doctor'),
    'patients', (select count(*) from patients),
    'appointmentsPending', (select count(*) from appointments where status = 'pending'),
    'visitsToday', (select count(*) from visits where created_at::date = current_date),
    'queuedVisits', (select count(*) from visits where status = 'queued'),
    'pendingLabResults', (select count(*) from lab_results where status in ('pending','entered','submitted')),
    'pendingPrescriptions', (select count(*) from prescriptions where status in ('ordered','partially_dispensed')),
    'lowStockMedicines', (select count(*) from medicine_batches where quantity <= 10 and status = 'in_stock'),
    'expiredMedicines', (select count(*) from medicine_batches where expiry_date < current_date)
  );
end;
$$;

create or replace function public.get_dashboard_counters()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.get_role_dashboard_counters(public.get_current_role());
$$;
