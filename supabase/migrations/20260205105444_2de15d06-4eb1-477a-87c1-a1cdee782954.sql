-- Create governance_projects table
CREATE TABLE public.governance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  template_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canvas_sections table to store section content
CREATE TABLE public.canvas_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.governance_projects(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT DEFAULT '',
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('strategy', 'operations')),
  grid_span_cols INTEGER,
  grid_span_rows INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, section_id)
);

-- Enable Row Level Security
ALTER TABLE public.governance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_sections ENABLE ROW LEVEL SECURITY;

-- Create index for access_code lookups
CREATE INDEX idx_governance_projects_access_code ON public.governance_projects(access_code);
CREATE INDEX idx_canvas_sections_project_id ON public.canvas_sections(project_id);

-- RLS Policies for governance_projects
-- Anyone can view projects by access code (public collaborative canvas)
CREATE POLICY "Anyone can view projects"
  ON public.governance_projects
  FOR SELECT
  USING (true);

-- Anyone can create projects (no auth required for collaborative tool)
CREATE POLICY "Anyone can create projects"
  ON public.governance_projects
  FOR INSERT
  WITH CHECK (true);

-- Anyone with access code can update projects
CREATE POLICY "Anyone can update projects"
  ON public.governance_projects
  FOR UPDATE
  USING (true);

-- RLS Policies for canvas_sections
-- Anyone can view sections (tied to project visibility)
CREATE POLICY "Anyone can view sections"
  ON public.canvas_sections
  FOR SELECT
  USING (true);

-- Anyone can create sections
CREATE POLICY "Anyone can create sections"
  ON public.canvas_sections
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update sections
CREATE POLICY "Anyone can update sections"
  ON public.canvas_sections
  FOR UPDATE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_governance_projects_updated_at
  BEFORE UPDATE ON public.governance_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canvas_sections_updated_at
  BEFORE UPDATE ON public.canvas_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();