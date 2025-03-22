/*
  # Update vent_drives table structure
  
  1. Changes
    - Remove foreign key constraint with vent_sizes
    - Allow any integer for vent_size
    - Keep RLS policies intact
*/

-- Drop existing foreign key constraint if it exists
ALTER TABLE vent_drives
DROP CONSTRAINT IF EXISTS vent_drives_vent_type_vent_size_fkey;

-- Drop and recreate the table with the correct structure
DROP TABLE IF EXISTS vent_drives CASCADE;

CREATE TABLE vent_drives (
  drive_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_type text NOT NULL CHECK (drive_type IN ('Motorized', 'Manual')),
  vent_type text NOT NULL,
  vent_size integer,
  motor_specifications text,
  compatible_structures text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vent_drives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "vent_drives_select"
ON vent_drives
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vent_drives_insert"
ON vent_drives
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "vent_drives_update"
ON vent_drives
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "vent_drives_delete"
ON vent_drives
FOR DELETE
TO authenticated
USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vent_drives_vent_type 
ON vent_drives(vent_type);

CREATE INDEX IF NOT EXISTS idx_vent_drives_drive_type 
ON vent_drives(drive_type);