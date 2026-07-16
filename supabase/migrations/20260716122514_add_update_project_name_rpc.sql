-- Add RPC to rename a project via its access code (guest-editable, like the
-- other *_by_access_code RPCs). Owner-only RLS blocks direct anon UPDATEs, so
-- renaming must go through a SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.update_project_name_by_access_code(
  p_code TEXT,
  p_project_id UUID,
  p_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate access code matches the project
  IF NOT EXISTS (
    SELECT 1 FROM public.governance_projects
    WHERE id = p_project_id AND access_code = UPPER(p_code)
  ) THEN
    RETURN FALSE;
  END IF;

  -- Reject empty/blank names and names longer than 120 characters
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RETURN FALSE;
  END IF;

  IF char_length(btrim(p_name)) > 120 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.governance_projects
  SET name = btrim(p_name), updated_at = now()
  WHERE id = p_project_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_project_name_by_access_code TO anon, authenticated;
