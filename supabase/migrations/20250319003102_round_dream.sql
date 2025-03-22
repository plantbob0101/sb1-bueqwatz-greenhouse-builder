/*
  # Add structure relationship to structure_user_entries if it doesn't exist

  1. Changes
    - Check if foreign key exists before adding
    - Add foreign key relationship between structure_user_entries and structures
    - Update comments to reflect the relationship
*/

-- First check if the constraint exists and drop it if it does
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'structure_user_entries_structure_id_fkey'
    AND table_name = 'structure_user_entries'
  ) THEN
    ALTER TABLE structure_user_entries
    DROP CONSTRAINT structure_user_entries_structure_id_fkey;
  END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE structure_user_entries
ADD CONSTRAINT structure_user_entries_structure_id_fkey
FOREIGN KEY (structure_id)
REFERENCES structures(structure_id)
ON DELETE CASCADE;

-- Add helpful comments
COMMENT ON CONSTRAINT structure_user_entries_structure_id_fkey ON structure_user_entries
IS 'Links user entries to their base structure template';