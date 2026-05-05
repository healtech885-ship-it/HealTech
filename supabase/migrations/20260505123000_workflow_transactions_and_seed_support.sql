create or replace function create_visit_tx(
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
begin
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

create or replace function order_lab_tests_tx(actor uuid, target_visit_id uuid, target_lab_test_ids uuid[], target_doctor_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  visit_row visits;
  order_row lab_orders;
  requested_count integer;
  active_count integer;
begin
  requested_count := coalesce(array_length(target_lab_test_ids, 1), 0);
  if requested_count = 0 then
    raise exception 'At least one lab test is required';
  end if;

  select * into visit_row from visits where id = target_visit_id for update;
  if not found then
    raise exception 'Visit not found';
  end if;
  if visit_row.status in ('completed', 'cancelled') then
    raise exception 'Visit is closed';
  end if;

  select count(*) into active_count from lab_tests where id = any(target_lab_test_ids) and status = 'active';
  if active_count <> requested_count then
    raise exception 'One or more lab tests are inactive or missing';
  end if;

  insert into lab_orders(visit_id, patient_id, doctor_id, doctor_notes)
  values(visit_row.id, visit_row.patient_id, visit_row.doctor_id, target_doctor_notes)
  returning * into order_row;

  insert into lab_order_items(lab_order_id, lab_test_id)
  select order_row.id, unnest(target_lab_test_ids);

  update visits set status = 'waiting_lab' where id = visit_row.id;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(actor, 'lab_order.created', 'lab_order', order_row.id, jsonb_build_object('visit_id', visit_row.id, 'lab_test_ids', target_lab_test_ids));

  return jsonb_build_object('lab_order_id', order_row.id);
end;
$$;

create or replace function order_medicines_tx(actor uuid, target_visit_id uuid, target_items jsonb, target_doctor_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  visit_row visits;
  order_row medicine_orders;
  item jsonb;
  requested_count integer;
begin
  if jsonb_typeof(target_items) <> 'array' or jsonb_array_length(target_items) = 0 then
    raise exception 'At least one medicine is required';
  end if;

  select * into visit_row from visits where id = target_visit_id for update;
  if not found then
    raise exception 'Visit not found';
  end if;
  if visit_row.status in ('completed', 'cancelled') then
    raise exception 'Visit is closed';
  end if;

  insert into medicine_orders(visit_id, patient_id, doctor_id, doctor_notes)
  values(visit_row.id, visit_row.patient_id, visit_row.doctor_id, target_doctor_notes)
  returning * into order_row;

  for item in select * from jsonb_array_elements(target_items)
  loop
    requested_count := nullif(item->>'requested_quantity', '')::integer;
    if requested_count is null or requested_count <= 0 then
      raise exception 'Medicine quantity must be positive';
    end if;
    if not exists (select 1 from medicine_names where id = (item->>'medicine_name_id')::uuid and status = 'active') then
      raise exception 'Medicine is inactive or missing';
    end if;

    insert into medicine_order_items(medicine_order_id, medicine_name_id, requested_quantity, dosage_instructions)
    values(order_row.id, (item->>'medicine_name_id')::uuid, requested_count, item->>'dosage_instructions');
  end loop;

  update visits set status = 'waiting_pharmacy' where id = visit_row.id;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(actor, 'medicine_order.created', 'medicine_order', order_row.id, jsonb_build_object('visit_id', visit_row.id, 'count', jsonb_array_length(target_items)));

  return jsonb_build_object('medicine_order_id', order_row.id);
end;
$$;

create or replace function submit_lab_results_tx(actor uuid, target_lab_order_id uuid, target_results jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result_item jsonb;
  order_row lab_orders;
  remaining_count integer;
begin
  if jsonb_typeof(target_results) <> 'array' or jsonb_array_length(target_results) = 0 then
    raise exception 'At least one result is required';
  end if;

  select * into order_row from lab_orders where id = target_lab_order_id for update;
  if not found then
    raise exception 'Lab order not found';
  end if;

  for result_item in select * from jsonb_array_elements(target_results)
  loop
    if coalesce(result_item->>'id', '') = '' or (coalesce(result_item->>'result_value', '') = '' and coalesce(result_item->>'result_notes', '') = '') then
      raise exception 'Every submitted result needs a value or note';
    end if;

    update lab_order_items
    set result_value = nullif(result_item->>'result_value', ''),
        result_notes = nullif(result_item->>'result_notes', ''),
        status = 'submitted',
        entered_by = actor,
        entered_at = now()
    where id = (result_item->>'id')::uuid and lab_order_id = target_lab_order_id;

    if not found then
      raise exception 'Lab order item not found';
    end if;
  end loop;

  select count(*) into remaining_count
  from lab_order_items
  where lab_order_id = target_lab_order_id and status = 'pending';

  if remaining_count = 0 then
    update lab_orders
    set status = 'completed', completed_at = now()
    where id = target_lab_order_id;

    update visits set status = 'lab_completed' where id = order_row.visit_id;
  else
    update lab_orders set status = 'in_progress' where id = target_lab_order_id;
  end if;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(actor, 'lab_result.submitted', 'lab_order', target_lab_order_id, jsonb_build_object('count', jsonb_array_length(target_results)));

  return jsonb_build_object('lab_order_id', target_lab_order_id);
end;
$$;

create or replace function assign_store_item_tx(
  actor uuid,
  target_store_item_id uuid,
  target_assigned_to uuid,
  target_quantity integer,
  target_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  available integer;
  assignment_row store_assignments;
begin
  if target_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select get_available_store_stock(target_store_item_id) into available;
  if available < target_quantity then
    raise exception 'Store stock is not enough';
  end if;

  if not exists (select 1 from profiles where id = target_assigned_to and status = 'active') then
    raise exception 'Assigned employee profile is not active';
  end if;

  insert into store_assignments(store_item_id, assigned_to, assigned_by, quantity, notes)
  values(target_store_item_id, target_assigned_to, actor, target_quantity, target_notes)
  returning * into assignment_row;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(actor, 'store_item.assigned', 'store_assignment', assignment_row.id, jsonb_build_object('store_item_id', target_store_item_id, 'assigned_to', target_assigned_to, 'quantity', target_quantity));

  return jsonb_build_object('store_assignment_id', assignment_row.id);
end;
$$;
