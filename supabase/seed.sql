insert into departments (id, name, description) values
  ('00000000-0000-0000-0000-000000000101', 'General Medicine', 'Primary clinical care'),
  ('00000000-0000-0000-0000-000000000102', 'Laboratory', 'Diagnostic testing'),
  ('00000000-0000-0000-0000-000000000103', 'Pharmacy', 'Medicine stock and dispensing'),
  ('00000000-0000-0000-0000-000000000104', 'Administration', 'Clinic operations')
on conflict (id) do update set name = excluded.name, description = excluded.description;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@healtech.local', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin"}', false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'reception@healtech.local', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Reception Lead"}', false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'doctor@healtech.local', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Ahmed Hassan"}', false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'lab@healtech.local', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lab Specialist"}', false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'pharmacy@healtech.local', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pharmacy Lead"}', false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'patient@healtech.local', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Omar Patient"}', false)
on conflict (id) do update
set email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@healtech.local"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub":"00000000-0000-0000-0000-000000000002","email":"reception@healtech.local"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub":"00000000-0000-0000-0000-000000000003","email":"doctor@healtech.local"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub":"00000000-0000-0000-0000-000000000004","email":"lab@healtech.local"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub":"00000000-0000-0000-0000-000000000005","email":"pharmacy@healtech.local"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub":"00000000-0000-0000-0000-000000000006","email":"patient@healtech.local"}', 'email', now(), now(), now())
on conflict (provider, provider_id) do update
set identity_data = excluded.identity_data,
    updated_at = now();

insert into profiles (id, full_name, email, phone, role, status) values
  ('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@healtech.local', '+201000000001', 'admin', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Reception Lead', 'reception@healtech.local', '+201000000002', 'reception', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'Dr. Ahmed Hassan', 'doctor@healtech.local', '+201000000003', 'doctor', 'active'),
  ('00000000-0000-0000-0000-000000000004', 'Lab Specialist', 'lab@healtech.local', '+201000000004', 'lab', 'active'),
  ('00000000-0000-0000-0000-000000000005', 'Pharmacy Lead', 'pharmacy@healtech.local', '+201000000005', 'pharmacy', 'active'),
  ('00000000-0000-0000-0000-000000000006', 'Omar Patient', 'patient@healtech.local', '+201000000006', 'patient', 'active')
on conflict (id) do update
set full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    status = excluded.status;

insert into employees (id, profile_id, department_id, job_title, employee_code, hire_date, status) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104', 'System Administrator', 'EMP-ADMIN', '2024-01-01', 'active'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000104', 'Reception Lead', 'EMP-REC', '2024-01-01', 'active'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000101', 'General Doctor', 'EMP-DOC', '2024-01-01', 'active'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000102', 'Lab Specialist', 'EMP-LAB', '2024-01-01', 'active'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000103', 'Pharmacist', 'EMP-PHAR', '2024-01-01', 'active')
on conflict (id) do update
set department_id = excluded.department_id,
    job_title = excluded.job_title,
    employee_code = excluded.employee_code,
    status = excluded.status;

insert into patients (id, profile_id, student_id, mrn, full_name, gender, birth_date, department_id, phone, emergency_phone, blood_type, address, status, created_by) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000006', 'STU-1001', 'MRN-1001', 'Omar Patient', 'male', '2002-03-10', '00000000-0000-0000-0000-000000000101', '+201011111111', '+201022222222', 'O+', 'Cairo dorm A', 'active', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000302', null, 'STU-1002', 'MRN-1002', 'Mariam Samir', 'female', '2001-07-22', '00000000-0000-0000-0000-000000000101', '+201033333333', '+201044444444', 'A+', 'Cairo dorm B', 'active', '00000000-0000-0000-0000-000000000002')
on conflict (id) do update
set profile_id = excluded.profile_id,
    full_name = excluded.full_name,
    phone = excluded.phone,
    emergency_phone = excluded.emergency_phone,
    status = excluded.status;

insert into lab_tests (id, name, code, normal_range, unit) values
  ('00000000-0000-0000-0000-000000000401', 'Complete Blood Count', 'CBC', 'Reference range varies', null),
  ('00000000-0000-0000-0000-000000000402', 'Fasting Blood Glucose', 'FBG', '70-99', 'mg/dL'),
  ('00000000-0000-0000-0000-000000000403', 'Urine Analysis', 'UA', 'Normal', null)
on conflict (id) do update
set name = excluded.name,
    code = excluded.code,
    normal_range = excluded.normal_range,
    unit = excluded.unit;

insert into medicine_names (id, name, category, description) values
  ('00000000-0000-0000-0000-000000000501', 'Paracetamol 500mg', 'Analgesic', 'Pain and fever relief'),
  ('00000000-0000-0000-0000-000000000502', 'Amoxicillin 500mg', 'Antibiotic', 'Prescription antibiotic'),
  ('00000000-0000-0000-0000-000000000503', 'Oral Rehydration Salts', 'Supportive care', 'Hydration support')
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description;

insert into medicine_batches (id, medicine_name_id, batch_number, receipt_number, manufacturer, quantity, unit_price, expiry_date, status, created_by) values
  ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000501', 'PARA-A1', 'REC-001', 'Generic', 120, 1.50, current_date + interval '18 months', 'in_stock', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000512', '00000000-0000-0000-0000-000000000502', 'AMOX-A1', 'REC-002', 'Generic', 8, 4.25, current_date + interval '12 months', 'in_stock', '00000000-0000-0000-0000-000000000005')
on conflict (id) do update
set quantity = excluded.quantity,
    status = excluded.status,
    expiry_date = excluded.expiry_date;

insert into visits (id, patient_id, doctor_id, reception_id, visit_code, chief_complaint, status, priority, started_at, created_at) values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'V-SEED-001', 'Headache and fever', 'queued', 'normal', null, now())
on conflict (id) do update
set chief_complaint = excluded.chief_complaint,
    status = excluded.status,
    priority = excluded.priority;

insert into store_items (id, name, category, manufacturer, description) values
  ('00000000-0000-0000-0000-000000000701', 'Digital Thermometer', 'Clinical Equipment', 'Generic', 'Reusable patient thermometer'),
  ('00000000-0000-0000-0000-000000000702', 'Blood Pressure Cuff', 'Clinical Equipment', 'Generic', 'Manual BP cuff'),
  ('00000000-0000-0000-0000-000000000703', 'Laptop', 'IT Equipment', 'Generic', 'Administrative workstation')
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    manufacturer = excluded.manufacturer,
    description = excluded.description;

insert into store_item_batches (id, store_item_id, receipt_number, quantity, unit_price, created_by) values
  ('00000000-0000-0000-0000-000000000711', '00000000-0000-0000-0000-000000000701', 'STORE-001', 25, 90, '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000712', '00000000-0000-0000-0000-000000000702', 'STORE-002', 10, 350, '00000000-0000-0000-0000-000000000001')
on conflict (id) do update
set quantity = excluded.quantity,
    unit_price = excluded.unit_price;

insert into audit_logs (actor_id, action, entity_type, entity_id, metadata) values
  ('00000000-0000-0000-0000-000000000002', 'seed.loaded', 'system', null, '{"scope":"local-demo"}')
on conflict do nothing;
