/*
  # Add RLS policies for vent_drives table

  1. Security
    - Enable RLS on vent_drives table
    - Add policies for CRUD operations
    - Allow authenticated users to manage vent drives
*/

-- Enable RLS
ALTER TABLE vent_drives ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for vent drives" ON vent_drives;
DROP POLICY IF EXISTS "Enable insert access for vent drives" ON vent_drives;
DROP POLICY IF EXISTS "Enable update access for vent drives" ON vent_drives;
DROP POLICY IF EXISTS "Enable delete access for vent drives" ON vent_drives;

-- Create new policies
CREATE POLICY "vent_drives_select"
ON vent_drives
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vent_drives_insert"
ON vent_drives
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "vent_drives_update"
ON vent_drives
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "vent_drives_delete"
ON vent_drives
FOR DELETE
TO authenticated
USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_vent_drives_vent_type 
ON vent_drives(vent_type);

CREATE INDEX IF NOT EXISTS idx_vent_drives_drive_type 
ON vent_drives(drive_type);