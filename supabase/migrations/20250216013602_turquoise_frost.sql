/*
  # Fix vent types and drives
  
  1. Changes
    - Clear out existing vent drives
    - Reset vent types to correct set
    - Add proper vent drives for each type
*/

-- Clear out existing data
TRUNCATE vent_drives CASCADE;

-- Reset vent types to correct set
TRUNCATE vent_types CASCADE;

-- Insert correct vent types
INSERT INTO vent_types (vent_type, description, display_order) VALUES
  ('Continental Roof', 'Standard continental roof vent system', 1),
  ('Gothic Roof', 'Gothic style roof vent system', 2),
  ('Insulator Roof', 'Insulated roof vent system', 3),
  ('Oxnard Vent', 'Oxnard style ventilation system', 4),
  ('Pad Vent', 'Evaporative pad ventilation system', 5),
  ('Solar Light Roof', 'Solar light roof vent system', 6),
  ('Wall Vent', 'Standard wall ventilation system', 7);

-- Insert correct vent drives
INSERT INTO vent_drives (
  drive_type,
  vent_type,
  vent_size,
  motor_specifications,
  compatible_structures
) VALUES
  -- Continental Roof drives
  (
    'Motorized',
    'Continental Roof',
    48,
    'Ridder RW Drive',
    ARRAY['SL36', 'SL42', 'SL48']
  ),
  -- Gothic Roof drives
  (
    'Motorized',
    'Gothic Roof',
    48,
    'Ridder RW Drive',
    ARRAY['SL36', 'SL42', 'SL48']
  ),
  -- Insulator Roof drives
  (
    'Motorized',
    'Insulator Roof',
    48,
    'Ridder RW Drive',
    ARRAY['IN30', 'IN35', 'IN36']
  ),
  -- Oxnard Vent drives
  (
    'Motorized',
    'Oxnard Vent',
    30,
    'Ridder RW Drive',
    ARRAY['SL30', 'SL36']
  ),
  -- Pad Vent drives
  (
    'Motorized',
    'Pad Vent',
    48,
    'Ridder RW Drive',
    ARRAY['SL36', 'SL42']
  ),
  -- Solar Light Roof drives
  (
    'Motorized',
    'Solar Light Roof',
    54,
    'Ridder RW Drive',
    ARRAY['SL42', 'SL48']
  ),
  -- Wall Vent drives
  (
    'Motorized',
    'Wall Vent',
    48,
    'Ridder RW Drive',
    ARRAY['SL36', 'SL42']
  );