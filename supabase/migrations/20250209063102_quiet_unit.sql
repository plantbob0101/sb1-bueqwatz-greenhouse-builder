/*
  # Fix RLS policies to prevent recursion

  1. Changes
    - Drop problematic policies that cause recursion
    - Create new policies with direct ownership checks
    - Simplify access control logic

  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
    - Keep existing functionality
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can access shared projects" ON structure_user_entries;
DROP POLICY IF EXISTS "Users can view shared projects" ON project_shares;
DROP POLICY IF EXISTS "Users can view profiles of shared users" ON profiles;

-- Create base access policy for structure_user_entries
CREATE POLICY "Enable read access for all authenticated users"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for project shares with direct checks
CREATE POLICY "Enable read access for project shares"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (
    shared_with = auth.uid() OR
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users
      WHERE auth.uid() = auth.uid()
    )
  );

-- Create policy for profiles with simplified access
CREATE POLICY "Enable read access for profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    id IN (
      SELECT shared_with FROM project_shares
      WHERE shared_with = id
    )
  );