/*
  # Add vent drives management policies
  
  1. Changes
    - Add policies for managing vent drives (insert, update, delete)
    - Add admin role check for data management
    - Add indexes for better performance
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "vent_drives_select" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_insert" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_update" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_delete" ON vent_drives;

-- Create comprehensive policies for vent drives
CREATE POLICY "vent_drives_select"
ON vent_drives
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vent_drives_insert"
ON vent_drives
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'email' = 'bobstarnes@mac.com'
);

CREATE POLICY "vent_drives_update"
ON vent_drives
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'bobstarnes@mac.com'
);

CREATE POLICY "vent_drives_delete"
ON vent_drives
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'bobstarnes@mac.com'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vent_drives_drive_type_vent_type 
ON vent_drives(drive_type, vent_type);

COMMENT ON TABLE vent_drives IS 'Vent drive configurations for different vent types';
COMMENT ON COLUMN vent_drives.drive_type IS 'Type of drive system (Manual or Motorized)';
COMMENT ON COLUMN vent_drives.vent_type IS 'Type of vent this drive is for';
COMMENT ON COLUMN vent_drives.vent_size IS 'Maximum length in feet that this drive can operate';
COMMENT ON COLUMN vent_drives.motor_specifications IS 'Specifications for motorized drives';
COMMENT ON COLUMN vent_drives.compatible_structures IS 'List of structure models this drive is compatible with';