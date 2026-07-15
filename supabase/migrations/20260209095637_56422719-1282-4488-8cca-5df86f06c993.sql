-- Add DELETE protection policies to prevent unauthorized data deletion
-- This addresses the MISSING_RLS finding for DELETE operations

-- Prevent all deletes on governance_projects
CREATE POLICY "Prevent public deletes on projects"
  ON public.governance_projects
  FOR DELETE
  USING (false);

-- Prevent all deletes on canvas_sections
CREATE POLICY "Prevent public deletes on sections"
  ON public.canvas_sections
  FOR DELETE
  USING (false);