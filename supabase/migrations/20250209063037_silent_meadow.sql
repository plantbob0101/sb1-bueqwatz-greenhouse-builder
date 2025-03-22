/*
  # Fix project shares relationships

  1. Changes
    - Add policy to allow users to view profiles of shared users
    - Fix query relationship between project_shares and profiles
    - Add policy to allow shared users to view projects

  2. Security
    - Maintain RLS on all tables
    - Ensure proper access control for shared projects
*/

-- Add policy to allow viewing profiles of users who share projects
CREATE POLICY "Users can view profiles of shared users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT shared_with FROM project_shares
      WHERE project_id IN (
        SELECT entry_id FROM structure_user_entries
      )
    ) OR
    id IN (
      SELECT shared_with FROM project_shares
      WHERE shared_with = auth.uid()
    )
  );

-- Update structure_user_entries policy to include shared projects
DROP POLICY IF EXISTS "Users can access shared projects" ON structure_user_entries;
CREATE POLICY "Users can access shared projects"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.project_id = entry_id
      AND project_shares.shared_with = auth.uid()
    )
  );

-- Update project_shares policies to ensure proper access
DROP POLICY IF EXISTS "Users can view their shared projects" ON project_shares;
CREATE POLICY "Users can view shared projects"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (
    shared_with = auth.uid() OR
    EXISTS (
      SELECT 1 FROM structure_user_entries
      WHERE entry_id = project_id
    )
  );