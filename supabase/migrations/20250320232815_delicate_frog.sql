/*
  # Fix structure relationship query

  1. Changes
    - Add proper join query for structure relationship
    - Update RLS policies to use proper join syntax
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_all_access" ON structure_user_entries;

-- Create new policy with proper join syntax
CREATE POLICY "enable_all_access"
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

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_structure_id 
ON structure_user_entries(structure_id);

-- Add index for the foreign key
CREATE INDEX IF NOT EXISTS idx_structures_structure_id
ON structures(structure_id);