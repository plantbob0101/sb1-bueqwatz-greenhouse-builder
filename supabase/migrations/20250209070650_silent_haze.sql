/*
  # Fix project shares relationships

  1. Changes
    - Drop existing foreign key constraints
    - Recreate foreign key relationship to auth.users
    - Update policies for proper access control
    - Add missing indexes
*/

-- Drop existing foreign key if it exists
ALTER TABLE project_shares
DROP CONSTRAINT IF EXISTS project_shares_shared_with_fkey;

-- Drop existing policies
DROP POLICY IF EXISTS "project_shares_select" ON project_shares;
DROP POLICY IF EXISTS "project_shares_insert" ON project_shares;
DROP POLICY IF EXISTS "project_shares_delete" ON project_shares;
DROP POLICY IF EXISTS "profiles_access" ON profiles;

-- Recreate the foreign key relationship to auth.users
ALTER TABLE project_shares
ADD CONSTRAINT project_shares_shared_with_fkey
FOREIGN KEY (shared_with)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create simplified policies for project_shares
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

-- Create simplified policy for profiles
CREATE POLICY "profiles_access"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM project_shares 
    WHERE (user_id = auth.uid() AND shared_with = profiles.id)
    OR (shared_with = auth.uid() AND user_id = profiles.id)
  )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with_user_id 
ON project_shares(shared_with, user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_project_id_user_id 
ON project_shares(project_id, user_id);