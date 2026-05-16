create or replace function public.get_operational_reports()
returns jsonb
language plpgsql
stable
set search_path = public
as $$
begin
  if public.get_current_role() <> 'admin' then
    raise exception 'not authorized';
  end if;

  return jsonb_build_object(
    'visits', jsonb_build_object(
      'today', (
        select count(*)::int
        from public.visits
        where created_at::date = current_date
      ),
      'pending', (
        select count(*)::int
        from public.visits
        where status in ('queued', 'in_progress', 'waiting_lab', 'waiting_pharmacy')
      ),
      'completed', (
        select count(*)::int
        from public.visits
        where status = 'completed'
      ),
      'by_doctor', coalesce((
        select jsonb_agg(jsonb_build_object('doctor_name', doctor_name, 'total', total) order by total desc, doctor_name)
        from (
          select coalesce(p.full_name, 'Unassigned') as doctor_name, count(*)::int as total
          from public.visits v
          left join public.profiles p on p.id = v.doctor_id
          group by coalesce(p.full_name, 'Unassigned')
          order by total desc, doctor_name
          limit 8
        ) rows
      ), '[]'::jsonb)
    ),
    'lab', jsonb_build_object(
      'pending_results', (
        select count(*)::int
        from public.lab_results
        where status in ('pending', 'entered', 'submitted')
      ),
      'completed_results', (
        select count(*)::int
        from public.lab_results
        where status = 'reviewed'
      ),
      'top_tests', coalesce((
        select jsonb_agg(jsonb_build_object('test_name', test_name, 'total', total) order by total desc, test_name)
        from (
          select coalesce(lt.name, 'Unknown test') as test_name, count(*)::int as total
          from public.lab_results lr
          left join public.lab_tests lt on lt.id = lr.lab_test_id
          group by coalesce(lt.name, 'Unknown test')
          order by total desc, test_name
          limit 8
        ) rows
      ), '[]'::jsonb)
    ),
    'pharmacy', jsonb_build_object(
      'low_stock_medicines', (
        select count(*)::int
        from public.medicine_batches
        where quantity <= 10
          and status = 'in_stock'
      ),
      'expired_medicines', (
        select count(*)::int
        from public.medicine_batches
        where expiry_date < current_date
      ),
      'stock_levels', coalesce((
        select jsonb_agg(jsonb_build_object('medicine_name', medicine_name, 'quantity', quantity) order by quantity asc, medicine_name)
        from (
          select coalesce(m.name, mn.name, 'Unknown medicine') as medicine_name, sum(mb.quantity)::int as quantity
          from public.medicine_batches mb
          left join public.medicines m on m.id = mb.medicine_id
          left join public.medicine_names mn on mn.id = mb.medicine_name_id
          group by coalesce(m.name, mn.name, 'Unknown medicine')
          order by quantity asc, medicine_name
          limit 8
        ) rows
      ), '[]'::jsonb),
      'top_medicines', coalesce((
        select jsonb_agg(jsonb_build_object('medicine_name', medicine_name, 'total', total) order by total desc, medicine_name)
        from (
          select coalesce(m.name, 'Unknown medicine') as medicine_name, sum(pi.requested_quantity)::int as total
          from public.prescription_items pi
          left join public.medicines m on m.id = pi.medicine_id
          group by coalesce(m.name, 'Unknown medicine')
          order by total desc, medicine_name
          limit 8
        ) rows
      ), '[]'::jsonb)
    ),
    'admin', jsonb_build_object(
      'active_employees', (
        select count(*)::int
        from public.employees
        where status = 'active'
      ),
      'pending_leave_requests', (
        select count(*)::int
        from public.leave_requests
        where status = 'pending'
      ),
      'pending_store_requests', (
        select count(*)::int
        from public.store_requests
        where status = 'pending'
      ),
      'audit_logs_today', (
        select count(*)::int
        from public.audit_logs
        where created_at::date = current_date
      )
    )
  );
end;
$$;

revoke execute on function public.get_operational_reports() from public, anon, authenticated;
grant execute on function public.get_operational_reports() to authenticated;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'appointment_requests',
    'audit_logs',
    'departments',
    'employees',
    'lab_order_items',
    'lab_orders',
    'lab_results',
    'lab_tests',
    'leave_requests',
    'medicine_batches',
    'medicine_names',
    'medicine_order_items',
    'medicine_orders',
    'medicines',
    'patients',
    'prescription_items',
    'prescriptions',
    'profiles',
    'store_assignments',
    'store_item_batches',
    'store_items',
    'store_requests',
    'visits'
  ]
  loop
    if to_regclass(format('public.%I', target_table)) is not null
      and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = target_table
      )
    then
      execute format('alter publication supabase_realtime add table public.%I', target_table);
    end if;
  end loop;
end $$;
