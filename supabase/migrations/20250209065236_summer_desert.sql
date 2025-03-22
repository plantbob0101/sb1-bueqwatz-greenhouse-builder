/*
  # Fix project shares and profiles relationships

  1. Changes
    - Drop and recreate foreign key relationships
    - Simplify policies to avoid recursion
    - Add proper indexes for performance

  2. Security
    - Maintain RLS policies with proper access control
    - Ensure data integrity with cascading deletes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "project_shares_access" ON project_shares;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_shared_select" ON profiles;

-- Drop existing foreign key if it exists
ALTER TABLE project_shares
DROP CONSTRAINT IF EXISTS project_shares_shared_with_fkey;

-- Recreate the foreign key relationship properly
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

-- Create simplified policies for profiles
CREATE POLICY "profiles_access"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  id IN (
    SELECT shared_with FROM project_shares WHERE user_id = auth.uid()
  ) OR
  id IN (
    SELECT user_id FROM project_shares WHERE shared_with = auth.uid()
  )
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with_user_id 
ON project_shares(shared_with, user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_project_id_user_id 
ON project_shares(project_id, user_id);