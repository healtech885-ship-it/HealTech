drop policy if exists profiles_select on profiles;
create policy profiles_select
on profiles for select
using (
  id = auth.uid()
  or public.is_admin()
  or (
    public.get_current_role() = 'reception'
    and role = 'doctor'
    and status = 'active'
  )
);
