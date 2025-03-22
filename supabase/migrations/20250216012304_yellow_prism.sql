/*
  # Add wall vent types and update constraints
  
  1. Changes
    - Drop existing vent_type constraint from vent_drives
    - Add "Roll-up Wall" and "Drop Wall" to valid vent types
    - Recreate constraint with new values
*/

-- First remove the foreign key constraint
ALTER TABLE vent_drives
DROP CONSTRAINT IF EXISTS vent_drives_vent_type_fkey;

-- Add new vent types if they don't exist
INSERT INTO vent_types (vent_type) VALUES
  ('Roll-up Wall'),
  ('Drop Wall')
ON CONFLICT (vent_type) DO NOTHING;

-- Add the foreign key constraint back
ALTER TABLE vent_drives
ADD CONSTRAINT vent_drives_vent_type_fkey
FOREIGN KEY (vent_type)
REFERENCES vent_types(vent_type);