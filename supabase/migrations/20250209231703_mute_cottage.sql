/*
  # Fix rollup_walls table schema

  1. Changes
    - Drop and recreate table with all required columns
    - Add proper constraints and defaults
    - Ensure all fields are present in correct order
*/

-- Drop existing table
DROP TABLE IF EXISTS rollup_walls CASCADE;

-- Create rollup_walls table with all required fields
CREATE TABLE rollup_walls (
  rollup_wall_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structure_user_entries(entry_id) ON DELETE CASCADE,
  wall_location text NOT NULL CHECK (wall_location IN ('Sidewall', 'Endwall')),
  type text NOT NULL CHECK (type IN ('Quonset', 'Guttered')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  wall_height integer NOT NULL CHECK (wall_height > 0),
  NS30 text NOT NULL CHECK (NS30 IN ('Yes', 'No')) DEFAULT 'No',
  spacing text NOT NULL CHECK (spacing IN ('4''', '6''', '12''')) DEFAULT '6''',
  wall_length integer NOT NULL CHECK (wall_length > 0),
  drive_type text NOT NULL CHECK (drive_type IN ('Manual', 'Motorized')),
  motor_model text,
  gearbox_pocket integer,
  simu_winch integer,
  ridder_mount_guttered integer,
  ridder_mount_quonset integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rollup_walls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "rollup_walls_select"
ON rollup_walls
FOR SELECT
TO authenticated
USING (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
    UNION
    SELECT project_id 
    FROM project_shares 
    WHERE shared_with = auth.uid()
  )
);

CREATE POLICY "rollup_walls_insert"
ON rollup_walls
FOR INSERT
TO authenticated
WITH CHECK (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "rollup_walls_update"
ON rollup_walls
FOR UPDATE
TO authenticated
USING (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
    UNION
    SELECT project_id 
    FROM project_shares 
    WHERE shared_with = auth.uid()
    AND permission = 'edit'
  )
);

CREATE POLICY "rollup_walls_delete"
ON rollup_walls
FOR DELETE
TO authenticated
USING (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX idx_rollup_walls_structure_id ON rollup_walls(structure_id);

-- Add comments for documentation
COMMENT ON TABLE rollup_walls IS 'Roll-up wall systems for greenhouse structures';
COMMENT ON COLUMN rollup_walls.wall_location IS 'Location of the roll-up wall (Sidewall or Endwall)';
COMMENT ON COLUMN rollup_walls.type IS 'Type of roll-up wall (Quonset or Guttered)';
COMMENT ON COLUMN rollup_walls.quantity IS 'Number of roll-up walls of this configuration';
COMMENT ON COLUMN rollup_walls.wall_height IS 'Height of the roll-up wall in feet';
COMMENT ON COLUMN rollup_walls.NS30 IS 'Whether the wall has NS30 configuration (Yes/No)';
COMMENT ON COLUMN rollup_walls.spacing IS 'Spacing between roll-up wall supports (4'', 6'', or 12'')';
COMMENT ON COLUMN rollup_walls.wall_length IS 'Length of the roll-up wall in feet';
COMMENT ON COLUMN rollup_walls.drive_type IS 'Type of drive system (Manual or Motorized)';
COMMENT ON COLUMN rollup_walls.motor_model IS 'Model number/details of the motor (for motorized drives)';
COMMENT ON COLUMN rollup_walls.gearbox_pocket IS 'Number of gearbox pockets';
COMMENT ON COLUMN rollup_walls.simu_winch IS 'Number of Simu winches';
COMMENT ON COLUMN rollup_walls.ridder_mount_guttered IS 'Number of Ridder mounts for guttered walls';
COMMENT ON COLUMN rollup_walls.ridder_mount_quonset IS 'Number of Ridder mounts for quonset walls';
COMMENT ON COLUMN rollup_walls.notes IS 'Additional notes about the roll-up wall';