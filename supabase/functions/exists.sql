create or replace function public.exists(schema_name text, tbl_name text)
returns boolean as $$
begin
  return exists (
    select 1 from information_schema.tables t
    where t.table_schema = schema_name
      and t.table_name = tbl_name
  );
end;
$$ language plpgsql security definer;