/*
  # Fix relationship between vents and vent drives
  
  1. Changes
    - Add drive_id column to vents table
    - Create proper foreign key relationship
    - Add index for performance
*/

-- Add drive_id column to vents table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vents' AND column_name = 'drive_id'
  ) THEN
    ALTER TABLE vents
    ADD COLUMN drive_id uuid REFERENCES vent_drives(drive_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_vents_drive_id 
ON vents(drive_id);

-- Add comment for documentation
COMMENT ON COLUMN vents.drive_id IS 'Reference to the vent drive used for this vent';