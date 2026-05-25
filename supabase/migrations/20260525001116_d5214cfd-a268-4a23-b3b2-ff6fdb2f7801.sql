-- Restore EXECUTE on has_role so RLS policies referencing it work for end users.
-- (Previous revoke caused all queries on tables with has_role-based policies to fail,
-- which broke admin detection and subscription loading.)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;