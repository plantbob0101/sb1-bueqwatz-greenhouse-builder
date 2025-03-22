/*
  # Fix structure relationship

  1. Changes
    - Add proper foreign key relationship between structure_user_entries and structures
    - Update query to use proper join syntax
*/

-- Drop existing foreign key if it exists
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

-- Add foreign key constraint with proper name
ALTER TABLE structure_user_entries
ADD CONSTRAINT structure_user_entries_structure_id_fkey
FOREIGN KEY (structure_id)
REFERENCES structures(structure_id)
ON DELETE CASCADE;

-- Add helpful comments
COMMENT ON CONSTRAINT structure_user_entries_structure_id_fkey ON structure_user_entries
IS 'Links user entries to their base structure template';

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_structure_id 
ON structure_user_entries(structure_id);