/*
  # Fix RLS policies to prevent infinite recursion

  1. Changes
    - Drop existing problematic policies
    - Create simplified policies that avoid circular references
    - Add proper indexes for performance

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
    - Enable sharing functionality
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "base_structure_entries_access" ON structure_user_entries;
DROP POLICY IF EXISTS "shared_structure_entries_access" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_insert" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_update" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_entries_delete" ON structure_user_entries;
DROP POLICY IF EXISTS "project_shares_select" ON project_shares;
DROP POLICY IF EXISTS "project_shares_insert" ON project_shares;
DROP POLICY IF EXISTS "project_shares_delete" ON project_shares;
DROP POLICY IF EXISTS "profiles_select" ON profiles;

-- Create simplified policies for structure_user_entries
CREATE POLICY "structure_entries_select"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "structure_entries_shared_select"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (
    entry_id IN (
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "structure_entries_insert"
  ON structure_user_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "structure_entries_update"
  ON structure_user_entries
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    entry_id IN (
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
      AND permission = 'edit'
    )
  );

CREATE POLICY "structure_entries_delete"
  ON structure_user_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create simplified policies for project_shares
CREATE POLICY "project_shares_select"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid());

CREATE POLICY "project_shares_owner_select"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "project_shares_insert"
  ON project_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "project_shares_delete"
  ON project_shares
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
    )
  );

-- Create simplified policy for profiles
CREATE POLICY "profiles_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_shared_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT shared_with 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_user_id 
ON structure_user_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_project_id 
ON project_shares(project_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with 
ON project_shares(shared_with);

CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id);