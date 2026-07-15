-- Add status column to canvas_sections table for tracking completion
ALTER TABLE public.canvas_sections 
ADD COLUMN status text NOT NULL DEFAULT 'empty' 
CHECK (status IN ('empty', 'in_progress', 'completed'));

-- Add project status column to governance_projects table
ALTER TABLE public.governance_projects 
ADD COLUMN status text NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'in_progress', 'completed'));

-- Create index for faster status queries
CREATE INDEX idx_canvas_sections_status ON public.canvas_sections(status);
CREATE INDEX idx_governance_projects_status ON public.governance_projects(status);