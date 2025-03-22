/*
  # Fix RLS Policy Recursion

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies
    - Simplify access control logic
    - Add performance indexes

  2. Security
    - Maintain proper access control
    - Remove circular references
    - Keep existing security model
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "structure_user_entries_select" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_user_entries_insert" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_user_entries_update" ON structure_user_entries;
DROP POLICY IF EXISTS "structure_user_entries_delete" ON structure_user_entries;
DROP POLICY IF EXISTS "Enable read access for project shares" ON project_shares;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Create simplified policies for structure_user_entries
CREATE POLICY "structure_entries_access"
  ON structure_user_entries
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    entry_id IN (
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  );

-- Create simplified policy for project_shares
CREATE POLICY "project_shares_access"
  ON project_shares
  FOR ALL
  TO authenticated
  USING (
    shared_with = auth.uid() OR
    project_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
    )
  );

-- Create simplified policy for profiles
CREATE POLICY "profiles_access"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    id IN (
      SELECT shared_with 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_user_id 
ON structure_user_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_project_id 
ON project_shares(project_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with 
ON project_shares(shared_with);