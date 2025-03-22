/*
  # Add project fields to structure_user_entries

  1. Changes
    - Add project_name column
    - Add description column
    - Add status column with default value
*/

-- Add new columns to structure_user_entries
ALTER TABLE structure_user_entries
ADD COLUMN project_name text,
ADD COLUMN description text,
ADD COLUMN status text DEFAULT 'Draft';

-- Update RLS policies
CREATE POLICY "Enable read access for authenticated users"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON structure_user_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON structure_user_entries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON structure_user_entries
  FOR DELETE
  TO authenticated
  USING (true);