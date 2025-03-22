/*
  # Fix project access control

  1. Changes
    - Add user_id column to structure_user_entries with proper default value
    - Update RLS policies for proper access control
    - Add proper ownership tracking

  2. Security
    - Ensure users can only see their own projects and shared projects
    - Maintain proper access control
    - Add proper ownership tracking
*/

-- Create a function to get the first user ID from auth.users
CREATE OR REPLACE FUNCTION get_first_user_id()
RETURNS uuid AS $$
DECLARE
  first_user_id uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  RETURN first_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user_id column with a default value
ALTER TABLE structure_user_entries
ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT get_first_user_id();

-- Drop the default after adding the column
ALTER TABLE structure_user_entries
ALTER COLUMN user_id DROP DEFAULT;

-- Make user_id required
ALTER TABLE structure_user_entries
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON structure_user_entries;

-- Create proper access policies for structure_user_entries
CREATE POLICY "Users can view own projects"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.project_id = entry_id
      AND project_shares.shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can create own projects"
  ON structure_user_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON structure_user_entries
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_shares.project_id = entry_id
      AND project_shares.shared_with = auth.uid()
      AND project_shares.permission = 'edit'
    )
  );

CREATE POLICY "Users can delete own projects"
  ON structure_user_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_user_id 
ON structure_user_entries(user_id);