create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type appointment_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'completed');
  end if;
  if not exists (select 1 from pg_type where typname = 'prescription_status') then
    create type prescription_status as enum ('ordered', 'partially_dispensed', 'dispensed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'prescription_item_status') then
    create type prescription_item_status as enum ('pending', 'dispensed', 'unavailable', 'cancelled');
  end if;
end $$;

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id) on delete set null,
  name text not null unique,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  price numeric(10,2) check (price is null or price >= 0),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinic_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  doctor_id uuid references profiles(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  visitor_full_name text,
  visitor_email text,
  visitor_phone text,
  preferred_date date,
  preferred_time time,
  reason text,
  status appointment_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  admin_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_person_required check (patient_id is not null or (visitor_full_name is not null and visitor_phone is not null))
);

create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  diagnosis text not null,
  disease text,
  symptoms text,
  notes text,
  instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table medicine_batches add column if not exists medicine_id uuid references medicines(id);
alter table medicine_batches alter column medicine_name_id drop not null;

create table if not exists lab_results (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  lab_test_id uuid not null references lab_tests(id),
  result_value text,
  result_notes text,
  status lab_result_status not null default 'pending',
  entered_by uuid references profiles(id),
  entered_at timestamptz,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  visible_to_patient boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  status prescription_status not null default 'ordered',
  doctor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references prescriptions(id) on delete cascade,
  medicine_id uuid not null references medicines(id),
  requested_quantity integer not null check (requested_quantity > 0),
  dispensed_quantity integer not null default 0 check (dispensed_quantity >= 0),
  dosage_instructions text,
  status prescription_item_status not null default 'pending',
  dispensed_by uuid references profiles(id),
  dispensed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prescription_dispensed_not_more_than_requested check (dispensed_quantity <= requested_quantity)
);

insert into medicines (id, name, category, description, status, created_at, updated_at)
select id, name, category, description, status, created_at, updated_at
from medicine_names
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    status = excluded.status,
    updated_at = now();

update medicine_batches mb
set medicine_id = mb.medicine_name_id
where mb.medicine_id is null
  and exists (select 1 from medicines m where m.id = mb.medicine_name_id);

insert into appointments (id, patient_id, department_id, preferred_date, reason, status, reviewed_by, reviewed_at, admin_comment, created_at, updated_at)
select id, patient_id, requested_department_id, preferred_date, reason, status::text::appointment_status, reviewed_by, reviewed_at, admin_comment, created_at, updated_at
from appointment_requests
on conflict (id) do nothing;

insert into diagnoses (visit_id, patient_id, doctor_id, diagnosis, disease, symptoms, notes, instructions, created_at, updated_at)
select id, patient_id, doctor_id, coalesce(diagnosis, 'Clinical assessment pending'), disease, symptoms, notes, doctor_instructions, created_at, updated_at
from visits
where diagnosis is not null or disease is not null or notes is not null or doctor_instructions is not null
on conflict do nothing;

insert into lab_results (id, visit_id, patient_id, doctor_id, lab_test_id, result_value, result_notes, status, entered_by, entered_at, reviewed_by, reviewed_at, visible_to_patient, created_at, updated_at)
select loi.id, lo.visit_id, lo.patient_id, lo.doctor_id, loi.lab_test_id, loi.result_value, loi.result_notes, loi.status, loi.entered_by, loi.entered_at, loi.reviewed_by, loi.reviewed_at, loi.visible_to_patient, loi.created_at, loi.updated_at
from lab_order_items loi
join lab_orders lo on lo.id = loi.lab_order_id
on conflict (id) do update
set result_value = excluded.result_value,
    result_notes = excluded.result_notes,
    status = excluded.status,
    visible_to_patient = excluded.visible_to_patient,
    updated_at = now();

insert into prescriptions (id, visit_id, patient_id, doctor_id, status, doctor_notes, created_at, updated_at, completed_at)
select id, visit_id, patient_id, doctor_id, status::text::prescription_status, doctor_notes, created_at, updated_at, completed_at
from medicine_orders
on conflict (id) do nothing;

insert into prescription_items (id, prescription_id, medicine_id, requested_quantity, dispensed_quantity, dosage_instructions, status, dispensed_by, dispensed_at, created_at, updated_at)
select id, medicine_order_id, medicine_name_id, requested_quantity, dispensed_quantity, dosage_instructions, status::text::prescription_item_status, dispensed_by, dispensed_at, created_at, updated_at
from medicine_order_items
on conflict (id) do update
set dispensed_quantity = excluded.dispensed_quantity,
    status = excluded.status,
    updated_at = now();

create index if not exists idx_appointments_patient on appointments(patient_id);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_diagnoses_visit on diagnoses(visit_id);
create index if not exists idx_lab_results_visit on lab_results(visit_id);
create index if not exists idx_lab_results_status on lab_results(status);
create index if not exists idx_prescriptions_visit on prescriptions(visit_id);
create index if not exists idx_prescription_items_prescription on prescription_items(prescription_id);
create index if not exists idx_medicine_batches_medicine on medicine_batches(medicine_id);

alter table services enable row level security;
alter table clinic_settings enable row level security;
alter table appointments enable row level security;
alter table diagnoses enable row level security;
alter table medicines enable row level security;
alter table lab_results enable row level security;
alter table prescriptions enable row level security;
alter table prescription_items enable row level security;

drop policy if exists services_public_read on services;
create policy services_public_read on services for select using (status = 'active' or get_current_role() in ('admin','reception','doctor','lab','pharmacy'));
drop policy if exists services_admin_write on services;
create policy services_admin_write on services for all using (is_admin()) with check (is_admin());

drop policy if exists clinic_settings_admin_all on clinic_settings;
create policy clinic_settings_admin_all on clinic_settings for all using (is_admin()) with check (is_admin());
drop policy if exists clinic_settings_internal_read on clinic_settings;
create policy clinic_settings_internal_read on clinic_settings for select using (get_current_role() in ('admin','reception','doctor','lab','pharmacy'));

drop policy if exists appointments_public_insert on appointments;
create policy appointments_public_insert on appointments for insert with check (true);
drop policy if exists appointments_read_by_role on appointments;
create policy appointments_read_by_role on appointments for select using (
  is_admin()
  or get_current_role() = 'reception'
  or doctor_id = auth.uid()
  or exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
);
drop policy if exists appointments_reception_update on appointments;
create policy appointments_reception_update on appointments for update using (is_admin() or get_current_role() = 'reception') with check (is_admin() or get_current_role() = 'reception');

drop policy if exists diagnoses_read_by_role on diagnoses;
create policy diagnoses_read_by_role on diagnoses for select using (
  is_admin()
  or doctor_id = auth.uid()
  or get_current_role() in ('reception')
  or exists (select 1 from patients p where p.id = diagnoses.patient_id and p.profile_id = auth.uid())
);
drop policy if exists diagnoses_doctor_write on diagnoses;
create policy diagnoses_doctor_write on diagnoses for all using (is_admin() or doctor_id = auth.uid()) with check (is_admin() or doctor_id = auth.uid());

drop policy if exists medicines_read_internal on medicines;
create policy medicines_read_internal on medicines for select using (status = 'active' or get_current_role() in ('admin','doctor','pharmacy'));
drop policy if exists medicines_pharmacy_write on medicines;
create policy medicines_pharmacy_write on medicines for all using (get_current_role() in ('admin','pharmacy')) with check (get_current_role() in ('admin','pharmacy'));

drop policy if exists lab_results_read_by_role on lab_results;
create policy lab_results_read_by_role on lab_results for select using (
  is_admin()
  or get_current_role() = 'lab'
  or doctor_id = auth.uid()
  or exists (select 1 from patients p where p.id = lab_results.patient_id and p.profile_id = auth.uid() and lab_results.visible_to_patient)
);
drop policy if exists lab_results_doctor_insert on lab_results;
create policy lab_results_doctor_insert on lab_results for insert with check (is_admin() or doctor_id = auth.uid());
drop policy if exists lab_results_lab_doctor_update on lab_results;
create policy lab_results_lab_doctor_update on lab_results for update using (is_admin() or get_current_role() = 'lab' or doctor_id = auth.uid()) with check (is_admin() or get_current_role() = 'lab' or doctor_id = auth.uid());

drop policy if exists prescriptions_read_by_role on prescriptions;
create policy prescriptions_read_by_role on prescriptions for select using (
  is_admin()
  or get_current_role() = 'pharmacy'
  or doctor_id = auth.uid()
  or exists (select 1 from patients p where p.id = prescriptions.patient_id and p.profile_id = auth.uid())
);
drop policy if exists prescriptions_doctor_insert on prescriptions;
create policy prescriptions_doctor_insert on prescriptions for insert with check (is_admin() or doctor_id = auth.uid());
drop policy if exists prescriptions_pharmacy_update on prescriptions;
create policy prescriptions_pharmacy_update on prescriptions for update using (is_admin() or get_current_role() = 'pharmacy' or doctor_id = auth.uid()) with check (is_admin() or get_current_role() = 'pharmacy' or doctor_id = auth.uid());

drop policy if exists prescription_items_read_by_role on prescription_items;
create policy prescription_items_read_by_role on prescription_items for select using (
  is_admin()
  or get_current_role() = 'pharmacy'
  or exists (select 1 from prescriptions pr where pr.id = prescription_items.prescription_id and pr.doctor_id = auth.uid())
  or exists (select 1 from prescriptions pr join patients p on p.id = pr.patient_id where pr.id = prescription_items.prescription_id and p.profile_id = auth.uid())
);
drop policy if exists prescription_items_doctor_insert on prescription_items;
create policy prescription_items_doctor_insert on prescription_items for insert with check (is_admin() or exists (select 1 from prescriptions pr where pr.id = prescription_items.prescription_id and pr.doctor_id = auth.uid()));
drop policy if exists prescription_items_pharmacy_update on prescription_items;
create policy prescription_items_pharmacy_update on prescription_items for update using (is_admin() or get_current_role() = 'pharmacy') with check (is_admin() or get_current_role() = 'pharmacy');

create or replace function get_role_dashboard_counters(target_role user_role default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
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
$$;

create or replace function get_dashboard_counters()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select get_role_dashboard_counters(get_current_role());
$$;

create or replace function create_visit_from_appointment_tx(
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
begin
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

create or replace function add_diagnosis_tx(
  actor uuid,
  target_visit_id uuid,
  target_diagnosis text,
  target_disease text default null,
  target_symptoms text default null,
  target_notes text default null,
  target_instructions text default null,
  mark_completed boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v visits;
  d diagnoses;
begin
  select * into v
  from visits
  where id = target_visit_id
    and (doctor_id = actor or exists (select 1 from profiles where id = actor and role = 'admin'));
  if not found then
    raise exception 'visit not found for doctor';
  end if;

  insert into diagnoses(visit_id, patient_id, doctor_id, diagnosis, disease, symptoms, notes, instructions)
  values (v.id, v.patient_id, actor, target_diagnosis, target_disease, target_symptoms, target_notes, target_instructions)
  returning * into d;

  update visits
  set diagnosis = target_diagnosis,
      disease = target_disease,
      symptoms = coalesce(target_symptoms, symptoms),
      notes = coalesce(target_notes, notes),
      doctor_instructions = coalesce(target_instructions, doctor_instructions),
      status = case when mark_completed then 'completed'::visit_status else 'in_progress'::visit_status end,
      completed_at = case when mark_completed then now() else completed_at end,
      updated_at = now()
  where id = v.id;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'diagnosis.created', 'diagnosis', d.id, jsonb_build_object('visit_id', v.id));

  return to_jsonb(d);
end;
$$;

create or replace function request_lab_tests_tx(actor uuid, target_visit_id uuid, target_lab_test_ids uuid[], target_doctor_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v visits;
  test_id uuid;
  created_ids uuid[] := '{}';
  lr lab_results;
begin
  select * into v
  from visits
  where id = target_visit_id
    and (doctor_id = actor or exists (select 1 from profiles where id = actor and role = 'admin'));
  if not found then
    raise exception 'visit not found for doctor';
  end if;

  foreach test_id in array target_lab_test_ids loop
    insert into lab_results(visit_id, patient_id, doctor_id, lab_test_id, result_notes)
    values (v.id, v.patient_id, actor, test_id, target_doctor_notes)
    returning * into lr;
    created_ids := array_append(created_ids, lr.id);
  end loop;

  update visits set status = 'waiting_lab', updated_at = now() where id = v.id;
  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'lab_results.requested', 'visit', v.id, jsonb_build_object('lab_result_ids', created_ids));
  return jsonb_build_object('lab_result_ids', created_ids);
end;
$$;

create or replace function submit_lab_result_tx(actor uuid, target_lab_result_id uuid, target_result_value text, target_result_notes text default null)
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
  returning * into lr;

  if not found then
    raise exception 'lab result not found';
  end if;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'lab_result.submitted', 'lab_result', lr.id, '{}'::jsonb);
  return to_jsonb(lr);
end;
$$;

create or replace function approve_lab_result_tx(actor uuid, target_lab_result_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update lab_results
  set status = 'reviewed',
      visible_to_patient = true,
      reviewed_by = actor,
      reviewed_at = now(),
      updated_at = now()
  where id = any(target_lab_result_ids)
    and (doctor_id = actor or exists (select 1 from profiles where id = actor and role = 'admin'));

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (actor, 'lab_results.approved_for_patient', 'lab_result', null, jsonb_build_object('ids', target_lab_result_ids));
  return jsonb_build_object('approved_ids', target_lab_result_ids);
end;
$$;

create or replace function create_prescription_tx(actor uuid, target_visit_id uuid, target_items jsonb, target_doctor_notes text default null)
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
  select * into v
  from visits
  where id = target_visit_id
    and (doctor_id = actor or exists (select 1 from profiles where id = actor and role = 'admin'));
  if not found then
    raise exception 'visit not found for doctor';
  end if;

  insert into prescriptions(visit_id, patient_id, doctor_id, doctor_notes)
  values (v.id, v.patient_id, actor, target_doctor_notes)
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
  values (actor, 'prescription.created', 'prescription', pr.id, '{}'::jsonb);
  return to_jsonb(pr);
end;
$$;

create or replace function dispense_prescription_item_tx(target_item_id uuid, quantity_to_dispense integer, actor uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item prescription_items;
  batch medicine_batches;
  remaining integer := quantity_to_dispense;
begin
  select * into item from prescription_items where id = target_item_id for update;
  if not found then
    raise exception 'prescription item not found';
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
  values (actor, 'prescription_item.dispensed', 'prescription_item', item.id, jsonb_build_object('quantity', quantity_to_dispense));

  return jsonb_build_object('item_id', item.id, 'dispensed_quantity', quantity_to_dispense);
end;
$$;
