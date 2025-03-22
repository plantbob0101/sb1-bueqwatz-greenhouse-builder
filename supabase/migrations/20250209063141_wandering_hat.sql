/*
  # Fix project shares and profiles relationships

  1. Changes
    - Drop existing policies that cause relationship issues
    - Create new policies with proper joins
    - Add foreign key constraints to ensure data integrity

  2. Security
    - Maintain proper access control
    - Ensure data consistency
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable read access for project shares" ON project_shares;
DROP POLICY IF EXISTS "Enable read access for profiles" ON profiles;

-- Create new policy for project shares with proper join conditions
CREATE POLICY "Enable read access for project shares"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (
    shared_with = auth.uid() OR
    EXISTS (
      SELECT 1 FROM structure_user_entries
      WHERE structure_user_entries.entry_id = project_shares.project_id
    )
  );

-- Create policy for profiles with proper join conditions
CREATE POLICY "Enable read access for profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.shared_with = profiles.id
    )
  );

-- Add index to improve join performance
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with ON project_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Ensure referential integrity
ALTER TABLE project_shares
  DROP CONSTRAINT IF EXISTS project_shares_shared_with_fkey,
  ADD CONSTRAINT project_shares_shared_with_fkey
  FOREIGN KEY (shared_with) REFERENCES profiles(id)
  ON DELETE CASCADE;