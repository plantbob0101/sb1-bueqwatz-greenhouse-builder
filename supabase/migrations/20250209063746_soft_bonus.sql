/*
  # Fix RLS policies

  1. Changes
    - Drop existing policies first
    - Create new non-recursive policies
    - Ensure no duplicate policies

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep existing security model
*/

-- First drop all existing policies to ensure clean slate
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON structure_user_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON structure_user_entries;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON structure_user_entries;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON structure_user_entries;
DROP POLICY IF EXISTS "Users can view own projects" ON structure_user_entries;
DROP POLICY IF EXISTS "Users can create own projects" ON structure_user_entries;
DROP POLICY IF EXISTS "Users can update own projects" ON structure_user_entries;
DROP POLICY IF EXISTS "Users can delete own projects" ON structure_user_entries;

-- Create new simplified policies for structure_user_entries
CREATE POLICY "structure_user_entries_select"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    entry_id IN (
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "structure_user_entries_insert"
  ON structure_user_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "structure_user_entries_update"
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

CREATE POLICY "structure_user_entries_delete"
  ON structure_user_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id 
ON project_shares(project_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with 
ON project_shares(shared_with);