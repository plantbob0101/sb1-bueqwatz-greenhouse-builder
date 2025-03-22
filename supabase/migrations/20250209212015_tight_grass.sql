/*
  # Add drive_id to vents table

  1. Changes
    - Add drive_id column to vents table
    - Add foreign key constraint to vent_drives table
    - Add index for better performance
*/

-- Add drive_id column to vents table
ALTER TABLE vents
ADD COLUMN drive_id uuid REFERENCES vent_drives(drive_id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_vents_drive_id 
ON vents(drive_id);

COMMENT ON COLUMN vents.drive_id IS 'Reference to the vent drive used for this vent';