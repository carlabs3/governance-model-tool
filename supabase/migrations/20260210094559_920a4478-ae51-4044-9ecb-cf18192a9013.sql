
-- Create rate limiting table for access code attempts
CREATE TABLE public.access_code_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.access_code_attempts ENABLE ROW LEVEL SECURITY;

-- No one should read this directly
CREATE POLICY "No direct access" ON public.access_code_attempts FOR ALL USING (false);

CREATE INDEX idx_attempts_ip_time ON public.access_code_attempts(ip_address, attempted_at);

-- Auto-cleanup old attempts (keep 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.access_code_attempts
  WHERE attempted_at < now() - interval '24 hours';
END;
$$;

-- Modify get_project_by_access_code to include rate limiting
CREATE OR REPLACE FUNCTION public.get_project_by_access_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project RECORD;
  v_sections JSONB;
  v_ip TEXT;
  v_failed_count INT;
BEGIN
  -- Get client IP
  v_ip := COALESCE(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    'unknown'
  );

  -- Check rate limit: max 10 failed attempts per hour per IP
  SELECT COUNT(*) INTO v_failed_count
  FROM public.access_code_attempts
  WHERE ip_address = v_ip
    AND attempted_at > now() - interval '1 hour'
    AND success = false;

  IF v_failed_count >= 10 THEN
    RAISE EXCEPTION 'Too many attempts. Please try again later.';
  END IF;

  SELECT * INTO v_project
  FROM public.governance_projects
  WHERE access_code = UPPER(p_code);

  IF NOT FOUND THEN
    -- Log failed attempt
    INSERT INTO public.access_code_attempts (ip_address, success)
    VALUES (v_ip, false);
    RETURN NULL;
  END IF;

  -- Log successful attempt
  INSERT INTO public.access_code_attempts (ip_address, success)
  VALUES (v_ip, true);

  SELECT jsonb_agg(jsonb_build_object(
    'section_id', cs.section_id,
    'title', cs.title,
    'description', cs.description,
    'content', cs.content,
    'icon', cs.icon,
    'category', cs.category,
    'grid_span_cols', cs.grid_span_cols,
    'grid_span_rows', cs.grid_span_rows,
    'status', cs.status
  )) INTO v_sections
  FROM public.canvas_sections cs
  WHERE cs.project_id = v_project.id;

  RETURN jsonb_build_object(
    'id', v_project.id,
    'name', v_project.name,
    'access_code', v_project.access_code,
    'template_id', v_project.template_id,
    'status', v_project.status,
    'created_at', v_project.created_at,
    'updated_at', v_project.updated_at,
    'sections', COALESCE(v_sections, '[]'::jsonb)
  );
END;
$$;
