-- Create profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add user_id column to governance_projects (nullable for guest projects)
ALTER TABLE public.governance_projects
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups (only user_id, access_code index already exists)
CREATE INDEX IF NOT EXISTS idx_governance_projects_user_id ON public.governance_projects(user_id);

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Anyone can view projects" ON public.governance_projects;
DROP POLICY IF EXISTS "Prevent public deletes on projects" ON public.governance_projects;

DROP POLICY IF EXISTS "Anyone can create sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Anyone can update sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Anyone can view sections" ON public.canvas_sections;
DROP POLICY IF EXISTS "Prevent public deletes on sections" ON public.canvas_sections;

-- New RLS policies for governance_projects
-- SELECT: Owner can view their projects OR anyone with access code
CREATE POLICY "View own projects or by access code"
  ON public.governance_projects
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR access_code IS NOT NULL
  );

-- INSERT: Anyone can create projects (authenticated users get ownership)
CREATE POLICY "Anyone can create projects"
  ON public.governance_projects
  FOR INSERT
  WITH CHECK (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid() OR user_id IS NULL
      ELSE user_id IS NULL
    END
  );

-- UPDATE: Owner can update OR anyone can update (for access code collaboration)
CREATE POLICY "Owner or collaborator can update projects"
  ON public.governance_projects
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR access_code IS NOT NULL
  );

-- DELETE: Only owner can delete their projects
CREATE POLICY "Only owner can delete projects"
  ON public.governance_projects
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- New RLS policies for canvas_sections
-- SELECT: Can view sections of accessible projects
CREATE POLICY "View sections of accessible projects"
  ON public.canvas_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.governance_projects p
      WHERE p.id = project_id
      AND (auth.uid() = p.user_id OR p.access_code IS NOT NULL)
    )
  );

-- INSERT: Can create sections for accessible projects
CREATE POLICY "Create sections for accessible projects"
  ON public.canvas_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.governance_projects p
      WHERE p.id = project_id
      AND (auth.uid() = p.user_id OR p.access_code IS NOT NULL)
    )
  );

-- UPDATE: Can update sections of accessible projects
CREATE POLICY "Update sections of accessible projects"
  ON public.canvas_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.governance_projects p
      WHERE p.id = project_id
      AND (auth.uid() = p.user_id OR p.access_code IS NOT NULL)
    )
  );

-- DELETE: Only project owner can delete sections
CREATE POLICY "Only owner can delete sections"
  ON public.canvas_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.governance_projects p
      WHERE p.id = project_id
      AND auth.uid() IS NOT NULL 
      AND auth.uid() = p.user_id
    )
  );

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();