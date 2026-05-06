create or replace function review_store_request_tx(
  actor uuid,
  target_store_request_id uuid,
  target_decision text,
  target_admin_comment text default null,
  target_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row store_requests;
  assignment_result jsonb := null;
  next_status store_request_status;
begin
  select * into request_row
  from store_requests
  where id = target_store_request_id
  for update;

  if not found then
    raise exception 'Store request not found';
  end if;

  if target_decision = 'approved' then
    if request_row.status <> 'pending' then
      raise exception 'Only pending store requests can be approved';
    end if;
    next_status := 'approved';
  elsif target_decision = 'rejected' then
    if request_row.status <> 'pending' then
      raise exception 'Only pending store requests can be rejected';
    end if;
    next_status := 'rejected';
  elsif target_decision = 'fulfilled' then
    if request_row.status <> 'approved' then
      raise exception 'Only approved store requests can be fulfilled';
    end if;
    assignment_result := assign_store_item_tx(
      actor,
      request_row.store_item_id,
      request_row.requested_by,
      request_row.quantity,
      coalesce(target_notes, target_admin_comment)
    );
    next_status := 'fulfilled';
  else
    raise exception 'Decision must be approved, rejected, or fulfilled';
  end if;

  update store_requests
  set status = next_status,
      reviewed_by = actor,
      reviewed_at = now(),
      admin_comment = coalesce(target_admin_comment, admin_comment)
  where id = target_store_request_id
  returning * into request_row;

  insert into audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    'store_request.' || target_decision,
    'store_request',
    target_store_request_id,
    jsonb_build_object(
      'store_item_id', request_row.store_item_id,
      'requested_by', request_row.requested_by,
      'quantity', request_row.quantity,
      'admin_comment', target_admin_comment,
      'notes', target_notes,
      'assignment', assignment_result
    )
  );

  return jsonb_build_object(
    'store_request_id', request_row.id,
    'status', request_row.status,
    'assignment', assignment_result
  );
end;
$$;

revoke execute on function public.review_store_request_tx(uuid, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.review_store_request_tx(uuid, uuid, text, text, text) to service_role;
