
-- =============================================
-- Clean up ALL RLS policies and create one clean set
-- Architecture: RLS = owner-only, RPCs = access code validation
-- =============================================

-- === governance_projects: Drop ALL existing policies ===
DROP POLICY IF EXISTS "Anyone can create projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.governance_projects;
DROP POLICY IF EXISTS "View own projects or by access code" ON public.governance_projects;
DROP POLICY IF EXISTS "Owner or collaborator can update projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Owner can view own projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Owner can update own projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Owner can delete own projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Only owner can delete projects" ON public.governance_projects;

-- === governance_projects: Create clean owner-only policies ===
CREATE POLICY "Owner can view own projects"
  ON public.governance_projects
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON public.governance_projects
  FOR INSERT
  WITH CHECK (
    CASE
      WHEN auth.uid() IS NOT NULL THEN (user_id = auth.uid() OR user_id IS NULL)
      ELSE user_id IS NULL
    END
  );

CREATE POLICY "Owner can update own projects"
  ON public.governance_projects
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Owner can delete own projects"
  ON public.governance_projects
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- === canvas_sections: Drop ALL existing policies ===
DROP POLICY IF EXISTS "View sections of accessible projects" ON public.canvas_sections;
DROP POLICY IF EXISTS "Create sections for accessible projects" ON public.canvas_sections;
DROP POLICY IF EXISTS "Update sections of accessible projects" ON public.canvas_sections;
DROP POLICY IF EXISTS "Owner can view own sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Owner can insert own sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Owner can update own sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Owner can delete own sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Only owner can delete sections" ON public.canvas_sections;

-- === canvas_sections: Create clean owner-only policies ===
CREATE POLICY "Owner can view own sections"
  ON public.canvas_sections
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

CREATE POLICY "Owner can insert own sections"
  ON public.canvas_sections
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

CREATE POLICY "Owner can update own sections"
  ON public.canvas_sections
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

CREATE POLICY "Owner can delete own sections"
  ON public.canvas_sections
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.governance_projects p
    WHERE p.id = canvas_sections.project_id
      AND auth.uid() IS NOT NULL AND auth.uid() = p.user_id
  ));

-- === profiles: Add explicit deny for anonymous access ===
-- Existing policies are already owner-only, but let's ensure no anonymous access
-- Current policies already use auth.uid() = user_id which denies anonymous access
-- No changes needed for profiles - policies are correct
