/*
  # Final fix for vent types and drives
  
  1. Changes
    - Drop and recreate vent types table with proper constraints
    - Drop and recreate vent drives table with proper constraints
    - Insert all vent types with descriptions
    - Insert comprehensive set of vent drives
*/

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS vent_drives CASCADE;
DROP TABLE IF EXISTS vent_types CASCADE;

-- Create vent types table with proper constraints
CREATE TABLE vent_types (
  vent_type text PRIMARY KEY,
  description text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vent drives table with proper constraints
CREATE TABLE vent_drives (
  drive_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_type text NOT NULL CHECK (drive_type IN ('Motorized', 'Manual')),
  vent_type text NOT NULL REFERENCES vent_types(vent_type) ON DELETE CASCADE,
  vent_size integer NOT NULL CHECK (vent_size > 0),
  motor_specifications text,
  compatible_structures text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert all vent types with descriptions and explicit ordering
INSERT INTO vent_types (vent_type, description, display_order) VALUES
  ('Continental Roof', 'Standard continental roof vent system', 1),
  ('Drop Wall', 'Drop wall ventilation system', 2),
  ('Gothic Roof', 'Gothic style roof vent system', 3),
  ('Insulator Roof', 'Insulated roof vent system', 4),
  ('Oxnard Vent', 'Oxnard style ventilation system', 5),
  ('Pad Vent', 'Evaporative pad ventilation system', 6),
  ('Roll-up Wall', 'Roll-up wall ventilation system', 7),
  ('Solar Light Roof', 'Solar light roof vent system', 8),
  ('Wall Vent', 'Standard wall ventilation system', 9);

-- Insert comprehensive set of vent drives
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
  -- Continental Roof drives
  (
    'Motorized',
    'Continental Roof',
    48,
    'Standard Motor',
    ARRAY['SL36', 'SL42']
  ),
  -- Gothic Roof drives
  (
    'Motorized',
    'Gothic Roof',
    48,
    'Standard Motor',
    ARRAY['SL36', 'SL42']
  ),
  -- Insulator Roof drives
  (
    'Motorized',
    'Insulator Roof',
    48,
    'Heavy Duty Motor',
    ARRAY['IN30', 'IN35']
  ),
  -- Oxnard Vent drives
  (
    'Motorized',
    'Oxnard Vent',
    30,
    'Standard Motor',
    ARRAY['SL30', 'SL36']
  ),
  -- Pad Vent drives
  (
    'Manual',
    'Pad Vent',
    48,
    'Manual Chain',
    ARRAY['SL36', 'SL42']
  ),
  -- Solar Light Roof drives
  (
    'Motorized',
    'Solar Light Roof',
    54,
    'Solar Motor',
    ARRAY['SL42', 'SL48']
  ),
  -- Wall Vent drives
  (
    'Manual',
    'Wall Vent',
    48,
    'Manual Chain',
    ARRAY['SL36', 'SL42']
  );

-- Enable RLS
ALTER TABLE vent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_drives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "vent_types_select"
ON vent_types
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vent_drives_select"
ON vent_drives
FOR SELECT
TO authenticated
USING (true);

-- Add indexes for better performance
CREATE INDEX idx_vent_types_display_order ON vent_types(display_order);
CREATE INDEX idx_vent_drives_vent_type ON vent_drives(vent_type);
CREATE INDEX idx_vent_drives_drive_type ON vent_drives(drive_type);