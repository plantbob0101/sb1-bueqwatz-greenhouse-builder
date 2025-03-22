/*
  # Fix vent types and drives
  
  1. Changes
    - Ensure vent types exist
    - Add sample vent drives for Roll-up Wall and Drop Wall
*/

-- First ensure all vent types exist
INSERT INTO vent_types (vent_type) VALUES
  ('Continental Roof'),
  ('Gothic Roof'),
  ('Insulator Roof'),
  ('Oxnard Vent'),
  ('Pad Vent'),
  ('Roll-up Wall'),
  ('Drop Wall'),
  ('Solar Light Roof'),
  ('Wall Vent')
ON CONFLICT (vent_type) DO NOTHING;

-- Add sample vent drives for Roll-up Wall and Drop Wall
INSERT INTO vent_drives (
  drive_type,
  vent_type,
  vent_size,
  motor_specifications,
  compatible_structures
) VALUES
  (
    'Motorized',
    'Roll-up Wall',
    100,
    'Ridder RW100 Drive',
    ARRAY['SL36', 'SL42', 'SL48']
  ),
  (
    'Manual',
    'Roll-up Wall',
    50,
    'Manual Gear Drive',
    ARRAY['SL24', 'SL30', 'SL36']
  ),
  (
    'Motorized',
    'Drop Wall',
    100,
    'Ridder DW100 Drive',
    ARRAY['SL36', 'SL42', 'SL48']
  ),
  (
    'Manual',
    'Drop Wall',
    50,
    'Manual Chain Drive',
    ARRAY['SL24', 'SL30', 'SL36']
  )
ON CONFLICT (drive_id) DO NOTHING;