/*
  # Fix vent drives data and types
  
  1. Changes
    - Ensure vent types exist without losing data
    - Add missing vent types while preserving existing data
*/

-- First ensure the vent types exist without truncating
INSERT INTO vent_types (vent_type) VALUES
  ('Roll-up Wall'),
  ('Drop Wall')
ON CONFLICT (vent_type) DO NOTHING;

-- Create temporary table to store existing vent drives
CREATE TEMP TABLE temp_vent_drives AS 
SELECT * FROM vent_drives;

-- Drop and recreate the constraint
ALTER TABLE vent_drives
DROP CONSTRAINT IF EXISTS vent_drives_vent_type_fkey;

ALTER TABLE vent_drives
ADD CONSTRAINT vent_drives_vent_type_fkey
FOREIGN KEY (vent_type)
REFERENCES vent_types(vent_type);

-- Restore data from temp table
INSERT INTO vent_drives
SELECT * FROM temp_vent_drives
ON CONFLICT (drive_id) DO UPDATE
SET
  drive_type = EXCLUDED.drive_type,
  vent_type = EXCLUDED.vent_type,
  vent_size = EXCLUDED.vent_size,
  motor_specifications = EXCLUDED.motor_specifications,
  compatible_structures = EXCLUDED.compatible_structures,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;