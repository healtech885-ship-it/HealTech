insert into departments (name, description) values
  ('General Medicine', 'Primary clinical care'),
  ('Laboratory', 'Diagnostic testing'),
  ('Pharmacy', 'Medicine stock and dispensing'),
  ('Administration', 'Clinic operations')
on conflict (name) do nothing;

insert into lab_tests (name, code, normal_range, unit) values
  ('Complete Blood Count', 'CBC', 'Reference range varies', null),
  ('Fasting Blood Glucose', 'FBG', '70-99', 'mg/dL'),
  ('Urine Analysis', 'UA', 'Normal', null)
on conflict (code) do nothing;

insert into medicine_names (name, category, description) values
  ('Paracetamol 500mg', 'Analgesic', 'Pain and fever relief'),
  ('Amoxicillin 500mg', 'Antibiotic', 'Prescription antibiotic'),
  ('Oral Rehydration Salts', 'Supportive care', 'Hydration support')
on conflict (name) do nothing;

insert into store_items (name, category, manufacturer, description) values
  ('Digital Thermometer', 'Clinical Equipment', 'Generic', 'Reusable patient thermometer'),
  ('Blood Pressure Cuff', 'Clinical Equipment', 'Generic', 'Manual BP cuff'),
  ('Laptop', 'IT Equipment', 'Generic', 'Administrative workstation')
on conflict do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('profile-photos', 'profile-photos', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('lab-attachments', 'lab-attachments', false, 10485760, array['image/png', 'image/jpeg', 'application/pdf']),
  ('medical-reports', 'medical-reports', false, 10485760, array['application/pdf']),
  ('leave-attachments', 'leave-attachments', false, 10485760, array['image/png', 'image/jpeg', 'application/pdf']),
  ('store-documents', 'store-documents', false, 10485760, array['image/png', 'image/jpeg', 'application/pdf'])
on conflict (id) do nothing;

create policy "profile photos owner read"
on storage.objects for select
using (
  bucket_id = 'profile-photos'
  and (owner = auth.uid() or public.is_admin())
);

create policy "profile photos owner write"
on storage.objects for insert
with check (
  bucket_id = 'profile-photos'
  and (owner = auth.uid() or public.is_admin())
);

create policy "clinical files internal read"
on storage.objects for select
using (
  bucket_id in ('lab-attachments', 'medical-reports', 'leave-attachments', 'store-documents')
  and public.get_current_role() in ('admin', 'doctor', 'lab', 'pharmacy', 'reception')
);

create policy "clinical files internal write"
on storage.objects for insert
with check (
  bucket_id in ('lab-attachments', 'medical-reports', 'leave-attachments', 'store-documents')
  and public.get_current_role() in ('admin', 'doctor', 'lab', 'pharmacy', 'reception')
);
