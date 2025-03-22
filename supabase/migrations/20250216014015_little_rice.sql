/*
  # Fix vent drives RLS policies

  1. Changes
    - Drop existing policies
    - Create new simplified read-only policy
    - Add better indexes for performance
    
  2. Security
    - Enable RLS
    - Allow all authenticated users to read vent drives
    - Remove write policies since they're not needed
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_access_for_authenticated_users" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_select" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_insert" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_update" ON vent_drives;
DROP POLICY IF EXISTS "vent_drives_delete" ON vent_drives;

-- Create single, simple policy for reading vent drives
CREATE POLICY "allow_read_for_authenticated"
ON vent_drives
FOR SELECT 
TO authenticated
USING (true);

-- Add indexes for better performance
DROP INDEX IF EXISTS idx_vent_drives_vent_type_drive_type;
CREATE INDEX idx_vent_drives_lookup 
ON vent_drives(vent_type, drive_type);

-- Add helpful comments
COMMENT ON TABLE vent_drives IS 'Available drive configurations for different vent types';
COMMENT ON COLUMN vent_drives.drive_type IS 'Type of drive mechanism (Manual or Motorized)';
COMMENT ON COLUMN vent_drives.vent_type IS 'Type of vent this drive is designed for';
COMMENT ON COLUMN vent_drives.vent_size IS 'Maximum length in feet that this drive can operate';
COMMENT ON COLUMN vent_drives.motor_specifications IS 'Technical specifications for motorized drives';
COMMENT ON COLUMN vent_drives.compatible_structures IS 'Array of structure model codes this drive is compatible with';