/*
  # Fix vent types and drives
  
  1. Changes
    - Clear and recreate vent types
    - Add sample vent drives for all types
*/

-- First clear out all vent drives and types
TRUNCATE vent_drives CASCADE;
TRUNCATE vent_types CASCADE;

-- Insert all vent types in the correct order
INSERT INTO vent_types (vent_type) VALUES
  ('Continental Roof'),
  ('Drop Wall'),
  ('Gothic Roof'),
  ('Insulator Roof'),
  ('Oxnard Vent'),
  ('Pad Vent'),
  ('Roll-up Wall'),
  ('Solar Light Roof'),
  ('Wall Vent');

-- Add sample vent drives for all types
INSERT INTO vent_drives (
  drive_type,
  vent_type,
  vent_size,
  motor_specifications,
  compatible_structures
) VALUES
  -- Roll-up Wall drives
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
  -- Drop Wall drives
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
  ),
  -- Sample drives for other vent types
  (
    'Motorized',
    'Continental Roof',
    48,
    'Standard Motor',
    ARRAY['SL36', 'SL42']
  ),
  (
    'Motorized',
    'Gothic Roof',
    48,
    'Standard Motor',
    ARRAY['SL36', 'SL42']
  ),
  (
    'Motorized',
    'Insulator Roof',
    48,
    'Heavy Duty Motor',
    ARRAY['IN30', 'IN35']
  ),
  (
    'Motorized',
    'Oxnard Vent',
    30,
    'Standard Motor',
    ARRAY['SL30', 'SL36']
  ),
  (
    'Manual',
    'Pad Vent',
    48,
    'Manual Chain',
    ARRAY['SL36', 'SL42']
  ),
  (
    'Motorized',
    'Solar Light Roof',
    54,
    'Solar Motor',
    ARRAY['SL42', 'SL48']
  ),
  (
    'Manual',
    'Wall Vent',
    48,
    'Manual Chain',
    ARRAY['SL36', 'SL42']
  );