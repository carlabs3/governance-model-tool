-- Create keep_alive table used solely to keep the Supabase project active.
-- The free tier pauses a project after inactivity, and only external API
-- requests count as activity. A scheduled GitHub Action does an anon REST
-- SELECT against this table every few days. RLS is owner-only on every other
-- table, so we need one table that the anon role is explicitly allowed to read.
CREATE TABLE public.keep_alive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including the anon role) to read this table. It holds no
-- sensitive data; its only purpose is to answer a health-check SELECT.
CREATE POLICY "Anyone can read keep_alive"
  ON public.keep_alive
  FOR SELECT
  USING (true);

-- PostgREST needs the table-level SELECT privilege in addition to the RLS
-- policy for the anon role to read it over the REST API.
GRANT SELECT ON public.keep_alive TO anon, authenticated;

-- Seed one row so the health-check query returns data.
INSERT INTO public.keep_alive DEFAULT VALUES;
