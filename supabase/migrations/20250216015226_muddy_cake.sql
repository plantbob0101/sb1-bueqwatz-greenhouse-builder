/*
  # Create rollup and drop wall drives table

  1. New Tables
    - `rollup_drop_drives`
      - `drive_id` (uuid, primary key)
      - `drive_type` (text, 'Manual' or 'Motorized')
      - `wall_type` (text, 'Roll-up Wall' or 'Drop Wall')
      - `motor_model` (text, nullable)
      - `max_length` (integer)
      - `compatible_structures` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users to read drives
    - Add indexes for better performance

  3. Initial Data
    - Sample drives for both roll-up and drop walls
*/

-- Create rollup_drop_drives table
CREATE TABLE rollup_drop_drives (
  drive_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_type text NOT NULL CHECK (drive_type IN ('Manual', 'Motorized')),
  wall_type text NOT NULL CHECK (wall_type IN ('Roll-up Wall', 'Drop Wall')),
  motor_model text,
  max_length integer NOT NULL CHECK (max_length > 0),
  compatible_structures text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rollup_drop_drives ENABLE ROW LEVEL SECURITY;

-- Create policy for reading drives
CREATE POLICY "enable_read_for_authenticated"
ON rollup_drop_drives
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_rollup_drop_drives_lookup 
ON rollup_drop_drives(wall_type, drive_type);

-- Add helpful comments
COMMENT ON TABLE rollup_drop_drives IS 'Available drive configurations for roll-up and drop walls';
COMMENT ON COLUMN rollup_drop_drives.drive_type IS 'Type of drive mechanism (Manual or Motorized)';
COMMENT ON COLUMN rollup_drop_drives.wall_type IS 'Type of wall this drive is designed for';
COMMENT ON COLUMN rollup_drop_drives.motor_model IS 'Model number/specifications for motorized drives';
COMMENT ON COLUMN rollup_drop_drives.max_length IS 'Maximum length in feet that this drive can operate';
COMMENT ON COLUMN rollup_drop_drives.compatible_structures IS 'Array of structure model codes this drive is compatible with';

-- Insert initial drive configurations
INSERT INTO rollup_drop_drives (
  drive_type,
  wall_type,
  motor_model,
  max_length,
  compatible_structures
) VALUES
  -- Roll-up Wall drives
  (
    'Motorized',
    'Roll-up Wall',
    'Ridder RW100',
    100,
    ARRAY['SL36', 'SL42', 'SL48']
  ),
  (
    'Motorized',
    'Roll-up Wall',
    'Ridder RW75',
    75,
    ARRAY['SL30', 'SL36', 'SL42']
  ),
  (
    'Manual',
    'Roll-up Wall',
    'Gear Drive',
    50,
    ARRAY['SL24', 'SL30', 'SL36']
  ),
  -- Drop Wall drives
  (
    'Motorized',
    'Drop Wall',
    'Ridder DW100',
    100,
    ARRAY['SL36', 'SL42', 'SL48']
  ),
  (
    'Motorized',
    'Drop Wall',
    'Ridder DW75',
    75,
    ARRAY['SL30', 'SL36', 'SL42']
  ),
  (
    'Manual',
    'Drop Wall',
    'Chain Drive',
    50,
    ARRAY['SL24', 'SL30', 'SL36']
  );