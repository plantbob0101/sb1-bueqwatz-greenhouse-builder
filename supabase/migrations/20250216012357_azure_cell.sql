/*
  # Ensure wall vent types are properly added
  
  1. Changes
    - Clear and repopulate vent_types table
    - Ensure all required types are present
*/

-- First, recreate all vent types to ensure proper order
TRUNCATE vent_types CASCADE;

-- Insert all vent types in proper order
INSERT INTO vent_types (vent_type) VALUES
  ('Continental Roof'),
  ('Gothic Roof'),
  ('Insulator Roof'),
  ('Oxnard Vent'),
  ('Pad Vent'),
  ('Roll-up Wall'),
  ('Drop Wall'),
  ('Solar Light Roof'),
  ('Wall Vent');

-- Recreate the foreign key constraint
ALTER TABLE vent_drives
DROP CONSTRAINT IF EXISTS vent_drives_vent_type_fkey;

ALTER TABLE vent_drives
ADD CONSTRAINT vent_drives_vent_type_fkey
FOREIGN KEY (vent_type)
REFERENCES vent_types(vent_type);