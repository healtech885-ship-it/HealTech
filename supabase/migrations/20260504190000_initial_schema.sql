create extension if not exists pgcrypto;

create type user_role as enum ('admin', 'reception', 'doctor', 'lab', 'pharmacy', 'patient');
create type user_status as enum ('active', 'inactive', 'suspended');
create type visit_status as enum ('queued', 'in_progress', 'waiting_lab', 'lab_completed', 'waiting_pharmacy', 'completed', 'cancelled');
create type visit_priority as enum ('low', 'normal', 'high', 'urgent');
create type lab_order_status as enum ('ordered', 'in_progress', 'pending_review', 'completed', 'cancelled');
create type lab_result_status as enum ('pending', 'entered', 'submitted', 'reviewed');
create type medicine_batch_status as enum ('in_stock', 'out_of_stock', 'expired', 'inactive');
create type medicine_order_status as enum ('ordered', 'partially_dispensed', 'dispensed', 'cancelled');
create type medicine_order_item_status as enum ('pending', 'dispensed', 'unavailable', 'cancelled');
create type leave_request_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type store_assignment_status as enum ('assigned', 'returned', 'damaged', 'lost');
create type store_request_status as enum ('pending', 'approved', 'rejected', 'fulfilled', 'cancelled');
create type appointment_request_status as enum ('pending', 'approved', 'rejected', 'cancelled', 'completed');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role user_role not null,
  status user_status not null default 'active',
  profile_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  department_id uuid references departments(id),
  job_title text,
  employee_code text unique,
  hire_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete set null,
  student_id text unique,
  mrn text unique,
  full_name text not null,
  gender text,
  birth_date date check (birth_date is null or birth_date <= current_date),
  department_id uuid references departments(id),
  dorm_info text,
  phone text,
  emergency_phone text,
  nationality text,
  blood_type text,
  address text,
  status text not null default 'active',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_identifier_required check (student_id is not null or mrn is not null)
);

create table visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  reception_id uuid references profiles(id),
  visit_code text not null unique,
  chief_complaint text,
  symptoms text,
  diagnosis text,
  disease text,
  doctor_instructions text,
  notes text,
  status visit_status not null default 'queued',
  priority visit_priority not null default 'normal',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lab_tests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  description text,
  normal_range text,
  unit text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lab_orders (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  status lab_order_status not null default 'ordered',
  doctor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table lab_order_items (
  id uuid primary key default gen_random_uuid(),
  lab_order_id uuid not null references lab_orders(id) on delete cascade,
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

create table medicine_names (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table medicine_batches (
  id uuid primary key default gen_random_uuid(),
  medicine_name_id uuid not null references medicine_names(id),
  batch_number text,
  receipt_number text,
  manufacturer text,
  quantity integer not null default 0 check (quantity >= 0),
  unit_price numeric(10,2) check (unit_price is null or unit_price >= 0),
  expiry_date date,
  status medicine_batch_status not null default 'in_stock',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table medicine_orders (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null references profiles(id),
  status medicine_order_status not null default 'ordered',
  doctor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table medicine_order_items (
  id uuid primary key default gen_random_uuid(),
  medicine_order_id uuid not null references medicine_orders(id) on delete cascade,
  medicine_name_id uuid not null references medicine_names(id),
  requested_quantity integer not null check (requested_quantity > 0),
  dispensed_quantity integer not null default 0 check (dispensed_quantity >= 0),
  dosage_instructions text,
  status medicine_order_item_status not null default 'pending',
  dispensed_by uuid references profiles(id),
  dispensed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dispensed_not_more_than_requested check (dispensed_quantity <= requested_quantity)
);

create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_profile_id uuid not null references profiles(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status leave_request_status not null default 'pending',
  admin_comment text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_date_order check (end_date >= start_date)
);

create table store_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  manufacturer text,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table store_item_batches (
  id uuid primary key default gen_random_uuid(),
  store_item_id uuid not null references store_items(id) on delete cascade,
  receipt_number text,
  quantity integer not null check (quantity >= 0),
  unit_price numeric(10,2) check (unit_price is null or unit_price >= 0),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table store_assignments (
  id uuid primary key default gen_random_uuid(),
  store_item_id uuid not null references store_items(id),
  assigned_to uuid not null references profiles(id),
  assigned_by uuid references profiles(id),
  quantity integer not null check (quantity > 0),
  status store_assignment_status not null default 'assigned',
  notes text,
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table store_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references profiles(id),
  store_item_id uuid not null references store_items(id),
  quantity integer not null check (quantity > 0),
  reason text,
  status store_request_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  admin_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table appointment_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  requested_department_id uuid references departments(id),
  preferred_date date,
  reason text,
  status appointment_request_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  admin_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);
create index idx_patients_profile_id on patients(profile_id);
create index idx_visits_patient_id on visits(patient_id);
create index idx_visits_doctor_status on visits(doctor_id, status);
create index idx_lab_orders_status on lab_orders(status);
create index idx_medicine_orders_status on medicine_orders(status);
create index idx_medicine_batches_stock on medicine_batches(medicine_name_id, expiry_date, quantity);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_departments_updated before update on departments for each row execute function set_updated_at();
create trigger trg_employees_updated before update on employees for each row execute function set_updated_at();
create trigger trg_patients_updated before update on patients for each row execute function set_updated_at();
create trigger trg_visits_updated before update on visits for each row execute function set_updated_at();
create trigger trg_lab_tests_updated before update on lab_tests for each row execute function set_updated_at();
create trigger trg_lab_orders_updated before update on lab_orders for each row execute function set_updated_at();
create trigger trg_lab_order_items_updated before update on lab_order_items for each row execute function set_updated_at();
create trigger trg_medicine_names_updated before update on medicine_names for each row execute function set_updated_at();
create trigger trg_medicine_batches_updated before update on medicine_batches for each row execute function set_updated_at();
create trigger trg_medicine_orders_updated before update on medicine_orders for each row execute function set_updated_at();
create trigger trg_medicine_order_items_updated before update on medicine_order_items for each row execute function set_updated_at();
create trigger trg_leave_requests_updated before update on leave_requests for each row execute function set_updated_at();
create trigger trg_store_items_updated before update on store_items for each row execute function set_updated_at();
create trigger trg_store_item_batches_updated before update on store_item_batches for each row execute function set_updated_at();
create trigger trg_store_requests_updated before update on store_requests for each row execute function set_updated_at();
create trigger trg_store_assignments_updated before update on store_assignments for each row execute function set_updated_at();
create trigger trg_appointment_requests_updated before update on appointment_requests for each row execute function set_updated_at();

create or replace function get_current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
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

create or replace function generate_visit_code()
returns text
language plpgsql
as $$
begin
  return 'V-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

create or replace function get_available_medicine_stock(target_medicine_name_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(quantity), 0)::integer
  from medicine_batches
  where medicine_name_id = target_medicine_name_id
    and status = 'in_stock'
    and quantity > 0
    and (expiry_date is null or expiry_date >= current_date);
$$;

create or replace function get_available_store_stock(target_store_item_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(quantity), 0)::integer
       - coalesce((select sum(quantity)::integer from store_assignments where store_item_id = target_store_item_id and status = 'assigned'), 0)
  from store_item_batches
  where store_item_id = target_store_item_id;
$$;

create or replace function get_dashboard_counters()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'employees', (select count(*) from employees),
    'patients', (select count(*) from patients),
    'visitsToday', (select count(*) from visits where created_at::date = current_date),
    'queuedVisits', (select count(*) from visits where status = 'queued'),
    'pendingLabOrders', (select count(*) from lab_orders where status in ('ordered', 'in_progress', 'pending_review')),
    'pendingMedicineOrders', (select count(*) from medicine_orders where status in ('ordered', 'partially_dispensed')),
    'lowStockMedicines', (select count(*) from medicine_batches where quantity <= 10 and status = 'in_stock'),
    'expiredMedicines', (select count(*) from medicine_batches where expiry_date < current_date)
  );
$$;

create or replace function dispense_medicine_item(target_item_id uuid, quantity_to_dispense integer, actor uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  batch record;
  remaining integer;
begin
  if quantity_to_dispense <= 0 then
    raise exception 'quantity_to_dispense must be positive';
  end if;

  select * into item
  from medicine_order_items
  where id = target_item_id
  for update;

  if not found then
    raise exception 'medicine order item not found';
  end if;

  remaining := quantity_to_dispense;
  if item.dispensed_quantity + remaining > item.requested_quantity then
    raise exception 'dispensed quantity exceeds requested quantity';
  end if;

  for batch in
    select * from medicine_batches
    where medicine_name_id = item.medicine_name_id
      and status = 'in_stock'
      and quantity > 0
      and (expiry_date is null or expiry_date >= current_date)
    order by expiry_date nulls last, created_at
    for update
  loop
    exit when remaining = 0;
    if batch.quantity >= remaining then
      update medicine_batches set quantity = quantity - remaining where id = batch.id;
      remaining := 0;
    else
      update medicine_batches set quantity = 0, status = 'out_of_stock' where id = batch.id;
      remaining := remaining - batch.quantity;
    end if;
  end loop;

  if remaining > 0 then
    raise exception 'medicine stock is not enough';
  end if;

  update medicine_order_items
  set dispensed_quantity = dispensed_quantity + quantity_to_dispense,
      status = case when dispensed_quantity + quantity_to_dispense >= requested_quantity then 'dispensed'::medicine_order_item_status else status end,
      dispensed_by = actor,
      dispensed_at = now()
  where id = target_item_id;

  update medicine_orders mo
  set status = case
      when not exists (select 1 from medicine_order_items moi where moi.medicine_order_id = mo.id and moi.status <> 'dispensed') then 'dispensed'::medicine_order_status
      else 'partially_dispensed'::medicine_order_status
    end,
    completed_at = case
      when not exists (select 1 from medicine_order_items moi where moi.medicine_order_id = mo.id and moi.status <> 'dispensed') then now()
      else completed_at
    end
  where mo.id = item.medicine_order_id;

  return jsonb_build_object('ok', true, 'item_id', target_item_id);
end;
$$;

alter table profiles enable row level security;
alter table departments enable row level security;
alter table employees enable row level security;
alter table patients enable row level security;
alter table visits enable row level security;
alter table lab_tests enable row level security;
alter table lab_orders enable row level security;
alter table lab_order_items enable row level security;
alter table medicine_names enable row level security;
alter table medicine_batches enable row level security;
alter table medicine_orders enable row level security;
alter table medicine_order_items enable row level security;
alter table leave_requests enable row level security;
alter table store_items enable row level security;
alter table store_item_batches enable row level security;
alter table store_assignments enable row level security;
alter table store_requests enable row level security;
alter table appointment_requests enable row level security;
alter table audit_logs enable row level security;

create policy profiles_select on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_insert_admin on profiles for insert with check (is_admin());
create policy profiles_update_admin_or_self on profiles for update using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());

create policy departments_read_internal on departments for select using (get_current_role() in ('admin','reception','doctor','lab','pharmacy','patient'));
create policy departments_admin_write on departments for all using (is_admin()) with check (is_admin());

create policy employees_read_admin_or_self on employees for select using (is_admin() or profile_id = auth.uid());
create policy employees_admin_write on employees for all using (is_admin()) with check (is_admin());

create policy patients_read_by_role on patients for select using (
  is_admin()
  or get_current_role() = 'reception'
  or profile_id = auth.uid()
  or exists (select 1 from visits v where v.patient_id = patients.id and v.doctor_id = auth.uid())
  or exists (select 1 from lab_orders lo where lo.patient_id = patients.id and get_current_role() = 'lab')
  or exists (select 1 from medicine_orders mo where mo.patient_id = patients.id and get_current_role() = 'pharmacy')
);
create policy patients_reception_insert on patients for insert with check (is_admin() or get_current_role() = 'reception');
create policy patients_reception_update on patients for update using (is_admin() or get_current_role() = 'reception' or profile_id = auth.uid()) with check (is_admin() or get_current_role() = 'reception' or profile_id = auth.uid());

create policy visits_read_by_role on visits for select using (
  is_admin()
  or get_current_role() = 'reception'
  or doctor_id = auth.uid()
  or exists (select 1 from patients p where p.id = visits.patient_id and p.profile_id = auth.uid())
  or exists (select 1 from lab_orders lo where lo.visit_id = visits.id and get_current_role() = 'lab')
  or exists (select 1 from medicine_orders mo where mo.visit_id = visits.id and get_current_role() = 'pharmacy')
);
create policy visits_reception_insert on visits for insert with check (is_admin() or get_current_role() = 'reception');
create policy visits_doctor_update on visits for update using (is_admin() or doctor_id = auth.uid()) with check (is_admin() or doctor_id = auth.uid());

create policy lab_tests_read_internal on lab_tests for select using (get_current_role() in ('admin','doctor','lab'));
create policy lab_tests_admin_lab_write on lab_tests for all using (get_current_role() in ('admin','lab')) with check (get_current_role() in ('admin','lab'));

create policy lab_orders_read_by_role on lab_orders for select using (
  is_admin() or get_current_role() = 'lab' or doctor_id = auth.uid()
  or exists (select 1 from patients p where p.id = lab_orders.patient_id and p.profile_id = auth.uid())
);
create policy lab_orders_doctor_insert on lab_orders for insert with check (is_admin() or doctor_id = auth.uid());
create policy lab_orders_lab_update on lab_orders for update using (is_admin() or get_current_role() = 'lab' or doctor_id = auth.uid()) with check (is_admin() or get_current_role() = 'lab' or doctor_id = auth.uid());

create policy lab_items_read_by_role on lab_order_items for select using (
  is_admin()
  or get_current_role() = 'lab'
  or exists (select 1 from lab_orders lo where lo.id = lab_order_items.lab_order_id and lo.doctor_id = auth.uid())
  or (visible_to_patient and exists (
    select 1 from lab_orders lo join patients p on p.id = lo.patient_id
    where lo.id = lab_order_items.lab_order_id and p.profile_id = auth.uid()
  ))
);
create policy lab_items_insert_doctor on lab_order_items for insert with check (is_admin() or exists (select 1 from lab_orders lo where lo.id = lab_order_items.lab_order_id and lo.doctor_id = auth.uid()));
create policy lab_items_update_lab_doctor on lab_order_items for update using (is_admin() or get_current_role() = 'lab' or exists (select 1 from lab_orders lo where lo.id = lab_order_items.lab_order_id and lo.doctor_id = auth.uid())) with check (is_admin() or get_current_role() = 'lab' or exists (select 1 from lab_orders lo where lo.id = lab_order_items.lab_order_id and lo.doctor_id = auth.uid()));

create policy medicine_names_read_internal on medicine_names for select using (get_current_role() in ('admin','doctor','pharmacy'));
create policy medicine_names_pharmacy_write on medicine_names for all using (get_current_role() in ('admin','pharmacy')) with check (get_current_role() in ('admin','pharmacy'));
create policy medicine_batches_read_internal on medicine_batches for select using (get_current_role() in ('admin','doctor','pharmacy'));
create policy medicine_batches_pharmacy_write on medicine_batches for all using (get_current_role() in ('admin','pharmacy')) with check (get_current_role() in ('admin','pharmacy'));

create policy medicine_orders_read_by_role on medicine_orders for select using (
  is_admin() or get_current_role() = 'pharmacy' or doctor_id = auth.uid()
  or exists (select 1 from patients p where p.id = medicine_orders.patient_id and p.profile_id = auth.uid())
);
create policy medicine_orders_doctor_insert on medicine_orders for insert with check (is_admin() or doctor_id = auth.uid());
create policy medicine_orders_pharmacy_update on medicine_orders for update using (is_admin() or get_current_role() = 'pharmacy' or doctor_id = auth.uid()) with check (is_admin() or get_current_role() = 'pharmacy' or doctor_id = auth.uid());

create policy medicine_items_read_by_role on medicine_order_items for select using (
  is_admin() or get_current_role() = 'pharmacy'
  or exists (select 1 from medicine_orders mo where mo.id = medicine_order_items.medicine_order_id and mo.doctor_id = auth.uid())
  or exists (select 1 from medicine_orders mo join patients p on p.id = mo.patient_id where mo.id = medicine_order_items.medicine_order_id and p.profile_id = auth.uid())
);
create policy medicine_items_insert_doctor on medicine_order_items for insert with check (is_admin() or exists (select 1 from medicine_orders mo where mo.id = medicine_order_items.medicine_order_id and mo.doctor_id = auth.uid()));
create policy medicine_items_update_pharmacy on medicine_order_items for update using (is_admin() or get_current_role() = 'pharmacy') with check (is_admin() or get_current_role() = 'pharmacy');

create policy leave_requests_read on leave_requests for select using (is_admin() or employee_profile_id = auth.uid());
create policy leave_requests_insert_self on leave_requests for insert with check (employee_profile_id = auth.uid() or is_admin());
create policy leave_requests_update on leave_requests for update using (is_admin() or (employee_profile_id = auth.uid() and status = 'pending')) with check (is_admin() or employee_profile_id = auth.uid());

create policy store_items_read_internal on store_items for select using (get_current_role() in ('admin','reception','doctor','lab','pharmacy'));
create policy store_items_admin_write on store_items for all using (is_admin()) with check (is_admin());
create policy store_batches_admin_write on store_item_batches for all using (is_admin()) with check (is_admin());
create policy store_batches_admin_read on store_item_batches for select using (is_admin());
create policy store_assignments_read on store_assignments for select using (is_admin() or assigned_to = auth.uid());
create policy store_assignments_admin_write on store_assignments for all using (is_admin()) with check (is_admin());
create policy store_requests_read on store_requests for select using (is_admin() or requested_by = auth.uid());
create policy store_requests_insert_self on store_requests for insert with check (requested_by = auth.uid() or is_admin());
create policy store_requests_admin_update on store_requests for update using (is_admin()) with check (is_admin());

create policy appointment_requests_read on appointment_requests for select using (
  is_admin() or get_current_role() = 'reception'
  or exists (select 1 from patients p where p.id = appointment_requests.patient_id and p.profile_id = auth.uid())
);
create policy appointment_requests_patient_insert on appointment_requests for insert with check (
  is_admin() or get_current_role() = 'reception'
  or exists (select 1 from patients p where p.id = appointment_requests.patient_id and p.profile_id = auth.uid())
);
create policy appointment_requests_review on appointment_requests for update using (is_admin() or get_current_role() = 'reception') with check (is_admin() or get_current_role() = 'reception');

create policy audit_logs_read_admin on audit_logs for select using (is_admin());
create policy audit_logs_insert_internal on audit_logs for insert with check (auth.uid() is not null);
