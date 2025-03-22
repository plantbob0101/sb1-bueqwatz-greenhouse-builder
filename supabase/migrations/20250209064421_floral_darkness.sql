/*
  # Simplify project sharing

  1. Changes
    - Simplify RLS policies to avoid circular dependencies
    - Add user_id to project_shares for direct ownership checks
    - Create simple, direct policies without complex joins

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
    - Enable sharing functionality
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "structure_entries_select" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_shared_select" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_insert" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_update" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_delete" ON structure_user_entries;
DROP POLICY IF EXISTS "project_shares_select" ON project_shares;
DROP POLICY IF EXISTS "project_shares_owner_select" ON project_shares;
DROP POLICY IF EXISTS "project_shares_insert" ON project_shares;
DROP POLICY IF EXISTS "project_shares_delete" ON project_shares;

-- Add user_id to project_shares for direct ownership
ALTER TABLE project_shares 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing shares with the user_id from structure_user_entries
UPDATE project_shares ps
SET user_id = sue.user_id
FROM structure_user_entries sue
WHERE ps.project_id = sue.entry_id;

-- Make user_id required
ALTER TABLE project_shares
ALTER COLUMN user_id SET NOT NULL;

-- Simple policy for structure_user_entries
CREATE POLICY "enable_all_access"
  ON structure_user_entries
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR  -- User owns the project
    entry_id IN (            -- Or project is shared with user
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  );

-- Simple policies for project_shares
CREATE POLICY "enable_shares_access"
  ON project_shares
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR      -- User created the share
    shared_with = auth.uid()     -- Or share is for this user
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_project_shares_user_id 
ON project_shares(user_id);