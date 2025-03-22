/*
  # Add RLS policies for vents table

  1. Security
    - Enable RLS on vents table
    - Add policies for authenticated users to:
      - View vents for structures they have access to
      - Create vents for structures they have access to
      - Update vents for structures they have access to
      - Delete vents for structures they have access to
*/

-- Create policies for vents table
CREATE POLICY "Enable read access for vents"
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

CREATE POLICY "Enable insert access for vents"
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

CREATE POLICY "Enable update access for vents"
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

CREATE POLICY "Enable delete access for vents"
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

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_vents_structure_id 
ON vents(structure_id);