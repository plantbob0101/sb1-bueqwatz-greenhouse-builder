/*
  # Fix vent structure reference

  1. Changes
    - Drop existing foreign key constraint on vents table
    - Create new foreign key constraint referencing structure_user_entries
    - Update RLS policies for vents table
*/

-- Drop existing foreign key constraint
ALTER TABLE vents
DROP CONSTRAINT IF EXISTS vents_structure_id_fkey;

-- Add new foreign key constraint referencing structure_user_entries
ALTER TABLE vents
ADD CONSTRAINT vents_structure_id_fkey
FOREIGN KEY (structure_id)
REFERENCES structure_user_entries(entry_id)
ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for vents" ON vents;
DROP POLICY IF EXISTS "Enable insert access for vents" ON vents;
DROP POLICY IF EXISTS "Enable update access for vents" ON vents;
DROP POLICY IF EXISTS "Enable delete access for vents" ON vents;

-- Create new policies
CREATE POLICY "vents_select"
ON vents
FOR SELECT
TO authenticated
USING (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
    UNION
    SELECT project_id 
    FROM project_shares 
    WHERE shared_with = auth.uid()
  )
);

CREATE POLICY "vents_insert"
ON vents
FOR INSERT
TO authenticated
WITH CHECK (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "vents_update"
ON vents
FOR UPDATE
TO authenticated
USING (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
    UNION
    SELECT project_id 
    FROM project_shares 
    WHERE shared_with = auth.uid()
    AND permission = 'edit'
  )
);

CREATE POLICY "vents_delete"
ON vents
FOR DELETE
TO authenticated
USING (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
  )
);