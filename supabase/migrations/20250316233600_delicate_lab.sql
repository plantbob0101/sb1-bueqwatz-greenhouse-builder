/*
  # Fix project shares and profiles relationship

  1. Changes
    - Add user_id to project_shares to track who created the share
    - Update RLS policies to use proper joins
    - Fix foreign key relationships
    - Add indexes for better performance
*/

-- First ensure the profiles table exists and has proper indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Add user_id column to project_shares if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_shares' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE project_shares
    ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "project_shares_select" ON project_shares;
DROP POLICY IF EXISTS "project_shares_insert" ON project_shares;
DROP POLICY IF EXISTS "project_shares_delete" ON project_shares;

-- Create new policies with proper access control
CREATE POLICY "project_shares_select"
ON project_shares
FOR SELECT
TO authenticated
USING (
  shared_with = auth.uid() OR
  user_id = auth.uid()
);

CREATE POLICY "project_shares_insert"
ON project_shares
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "project_shares_delete"
ON project_shares
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id_user_id 
ON project_shares(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with_user_id 
ON project_shares(shared_with, user_id);