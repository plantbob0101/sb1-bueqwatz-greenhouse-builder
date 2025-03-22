/*
  # Fix structure relationship query

  1. Changes
    - Add proper join syntax for structure relationship
    - Update RLS policy to handle structure joins
*/

-- Drop existing policy
DROP POLICY IF EXISTS "enable_all_access" ON structure_user_entries;

-- Create new policy with proper join syntax
CREATE POLICY "enable_all_access"
ON structure_user_entries
FOR ALL
TO authenticated
USING (
  (user_id = auth.uid() OR
   entry_id IN (
     SELECT project_id 
     FROM project_shares 
     WHERE shared_with = auth.uid()
   ))
);

-- Add proper join indexes
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_structure_id 
ON structure_user_entries(structure_id);

CREATE INDEX IF NOT EXISTS idx_structures_structure_id
ON structures(structure_id);

-- Add comment for documentation
COMMENT ON TABLE structure_user_entries IS 'User-defined structure parameters with base template reference';
COMMENT ON COLUMN structure_user_entries.structure_id IS 'Reference to the base structure template';