/*
  # Fix vent and vent drives relationship
  
  1. Changes
    - Add proper foreign key relationship between vents and vent_drives
    - Update vents table schema to support drive relationship
    - Add indexes for better performance
*/

-- First ensure the drive_id column exists and has proper foreign key
ALTER TABLE vents
DROP CONSTRAINT IF EXISTS vents_drive_id_fkey;

-- Add or update drive_id column with proper foreign key
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vents' AND column_name = 'drive_id'
  ) THEN
    ALTER TABLE vents ADD COLUMN drive_id uuid;
  END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE vents
ADD CONSTRAINT vents_drive_id_fkey
FOREIGN KEY (drive_id)
REFERENCES vent_drives(drive_id)
ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_vents_drive_id 
ON vents(drive_id);

-- Add comment for documentation
COMMENT ON COLUMN vents.drive_id IS 'Reference to the vent drive used for this vent';

-- Update the vents select policy to include drive information
DROP POLICY IF EXISTS "vents_select" ON vents;
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