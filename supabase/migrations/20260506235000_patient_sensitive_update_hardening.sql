create or replace function prevent_patient_self_sensitive_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.profile_id and not (public.get_current_role() in ('admin', 'reception')) then
    if new.profile_id is distinct from old.profile_id
      or new.full_name is distinct from old.full_name
      or new.student_id is distinct from old.student_id
      or new.mrn is distinct from old.mrn
      or new.gender is distinct from old.gender
      or new.birth_date is distinct from old.birth_date
      or new.blood_type is distinct from old.blood_type
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
