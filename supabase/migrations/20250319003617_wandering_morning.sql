/*
  # Fix structure relationship

  1. Changes
    - Drop and recreate foreign key relationship between structure_user_entries and structures
    - Add proper comments and indexes
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

-- Add comment on the foreign key column instead of the constraint
COMMENT ON COLUMN structure_user_entries.structure_id
IS 'Links user entries to their base structure template';

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_structure_user_entries_structure_id 
ON structure_user_entries(structure_id);