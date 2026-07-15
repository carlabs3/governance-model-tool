
-- Fix: Correct syntax order (AS RESTRICTIVE before FOR command)
-- Re-create all policies that were dropped + create RPC functions

-- governance_projects policies
CREATE POLICY "Owner can view own projects"
  ON public.governance_projects
  AS RESTRICTIVE
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Owner can update own projects"
  ON public.governance_projects
  AS RESTRICTIVE
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can create projects"
  ON public.governance_projects
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (
    CASE
      WHEN auth.uid() IS NOT NULL THEN (user_id = auth.uid() OR user_id IS NULL)
      ELSE user_id IS NULL
    END
  );

CREATE POLICY "Owner can delete own projects"
  ON public.governance_projects
  AS RESTRICTIVE
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- canvas_sections policies
CREATE POLICY "Owner can view own sections"
  ON public.canvas_sections
  AS RESTRICTIVE
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

CREATE POLICY "Owner can update own sections"
  ON public.canvas_sections
  AS RESTRICTIVE
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

CREATE POLICY "Owner can insert own sections"
  ON public.canvas_sections
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND (
        (auth.uid() IS NOT NULL AND auth.uid() = p.user_id)
        OR p.user_id IS NULL
      )
  ));

CREATE POLICY "Owner can delete own sections"
  ON public.canvas_sections
  AS RESTRICTIVE
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

-- RPC: Create project with sections
CREATE OR REPLACE FUNCTION public.create_project_with_sections(
  p_name TEXT,
  p_access_code TEXT,
  p_template_id TEXT DEFAULT NULL,
  p_sections JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_section JSONB;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();

  INSERT INTO public.governance_projects (name, access_code, template_id, user_id)
  VALUES (p_name, p_access_code, p_template_id, v_user_id)
  RETURNING id INTO v_project_id;

  FOR v_section IN SELECT * FROM jsonb_array_elements(p_sections)
  LOOP
    INSERT INTO public.canvas_sections (
      project_id, section_id, title, description, content,
      icon, category, grid_span_cols, grid_span_rows, status
    ) VALUES (
      v_project_id,
      v_section->>'section_id',
      v_section->>'title',
      v_section->>'description',
      COALESCE(v_section->>'content', ''),
      v_section->>'icon',
      v_section->>'category',
      (v_section->>'grid_span_cols')::int,
      (v_section->>'grid_span_rows')::int,
      COALESCE(v_section->>'status', 'empty')
    );
  END LOOP;

  SELECT jsonb_build_object(
    'id', v_project_id,
    'created_at', gp.created_at,
    'updated_at', gp.updated_at
  ) INTO v_result
  FROM public.governance_projects gp WHERE gp.id = v_project_id;

  RETURN v_result;
END;
$$;

-- RPC: Get project by access code
CREATE OR REPLACE FUNCTION public.get_project_by_access_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project RECORD;
  v_sections JSONB;
BEGIN
  SELECT * INTO v_project
  FROM public.governance_projects
  WHERE access_code = UPPER(p_code);

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

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
    'user_id', v_project.user_id,
    'created_at', v_project.created_at,
    'updated_at', v_project.updated_at,
    'sections', COALESCE(v_sections, '[]'::jsonb)
  );
END;
$$;

-- RPC: Save section by access code
CREATE OR REPLACE FUNCTION public.save_section_by_access_code(
  p_code TEXT,
  p_project_id UUID,
  p_section_id TEXT,
  p_content TEXT,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.governance_projects
    WHERE id = p_project_id AND access_code = UPPER(p_code)
  ) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.canvas_sections
  SET content = p_content, status = p_status, updated_at = now()
  WHERE project_id = p_project_id AND section_id = p_section_id;

  UPDATE public.governance_projects
  SET updated_at = now()
  WHERE id = p_project_id;

  RETURN TRUE;
END;
$$;

-- RPC: Apply template by access code
CREATE OR REPLACE FUNCTION public.apply_template_by_access_code(
  p_code TEXT,
  p_project_id UUID,
  p_template_id TEXT,
  p_sections JSONB DEFAULT '[]'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_section JSONB;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.governance_projects
    WHERE id = p_project_id AND access_code = UPPER(p_code)
  ) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.governance_projects
  SET template_id = p_template_id, updated_at = now()
  WHERE id = p_project_id;

  FOR v_section IN SELECT * FROM jsonb_array_elements(p_sections)
  LOOP
    UPDATE public.canvas_sections
    SET content = COALESCE(v_section->>'content', ''),
        status = COALESCE(v_section->>'status', 'empty'),
        updated_at = now()
    WHERE project_id = p_project_id
      AND section_id = v_section->>'section_id';
  END LOOP;

  RETURN TRUE;
END;
$$;

-- RPC: Update project status by access code
CREATE OR REPLACE FUNCTION public.update_project_status_by_access_code(
  p_code TEXT,
  p_project_id UUID,
  p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.governance_projects
    WHERE id = p_project_id AND access_code = UPPER(p_code)
  ) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.governance_projects
  SET status = p_status, updated_at = now()
  WHERE id = p_project_id;

  RETURN TRUE;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.create_project_with_sections TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_by_access_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_section_by_access_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_template_by_access_code TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_project_status_by_access_code TO anon, authenticated;
