/*
  # Add Roll-up and Drop Walls Tables

  1. New Tables
    - `rollup_walls`
      - Core fields for roll-up wall systems
      - Links to structures and curtain fabrics
      - Includes drive and weather protection details
    - `drop_walls`
      - Core fields for drop wall systems
      - Links to structures and curtain fabrics
      - Includes drive and weather protection details

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Ensure proper access control based on structure ownership

  3. Relationships
    - Foreign keys to structure_user_entries
    - Foreign keys to curtain_fabrics
*/

-- Create Roll-up Walls Table
CREATE TABLE rollup_walls (
  rollup_wall_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structure_user_entries(entry_id) ON DELETE CASCADE,
  wall_location text NOT NULL CHECK (wall_location IN ('Sidewall', 'Endwall')),
  wall_length integer NOT NULL CHECK (wall_length > 0),
  wall_height integer NOT NULL CHECK (wall_height > 0),
  fabric_id uuid REFERENCES curtain_fabrics(fabric_id) ON DELETE RESTRICT,
  drive_type text NOT NULL CHECK (drive_type IN ('Manual', 'Motorized')),
  motor_model text,
  roll_bar_size text,
  guide_system text,
  reinforcement text,
  weather_protection text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Drop Walls Table
CREATE TABLE drop_walls (
  drop_wall_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structure_user_entries(entry_id) ON DELETE CASCADE,
  wall_location text NOT NULL CHECK (wall_location IN ('Sidewall', 'Endwall')),
  wall_length integer NOT NULL CHECK (wall_length > 0),
  wall_height integer NOT NULL CHECK (wall_height > 0),
  fabric_id uuid REFERENCES curtain_fabrics(fabric_id) ON DELETE RESTRICT,
  drive_type text NOT NULL CHECK (drive_type IN ('Manual', 'Motorized')),
  motor_model text,
  cable_guide_system text,
  reinforcement text,
  weather_protection text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rollup_walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_walls ENABLE ROW LEVEL SECURITY;

-- Create policies for rollup_walls
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

-- Create policies for drop_walls
CREATE POLICY "drop_walls_select"
ON drop_walls
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

CREATE POLICY "drop_walls_insert"
ON drop_walls
FOR INSERT
TO authenticated
WITH CHECK (
  structure_id IN (
    SELECT entry_id 
    FROM structure_user_entries 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "drop_walls_update"
ON drop_walls
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

CREATE POLICY "drop_walls_delete"
ON drop_walls
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
CREATE INDEX idx_rollup_walls_fabric_id ON rollup_walls(fabric_id);
CREATE INDEX idx_drop_walls_structure_id ON drop_walls(structure_id);
CREATE INDEX idx_drop_walls_fabric_id ON drop_walls(fabric_id);

-- Add comments for documentation
COMMENT ON TABLE rollup_walls IS 'Roll-up wall systems for greenhouse structures';
COMMENT ON TABLE drop_walls IS 'Drop wall systems for greenhouse structures';

COMMENT ON COLUMN rollup_walls.wall_location IS 'Location of the roll-up wall (Sidewall or Endwall)';
COMMENT ON COLUMN rollup_walls.wall_length IS 'Length of the roll-up wall in feet';
COMMENT ON COLUMN rollup_walls.wall_height IS 'Height of the roll-up wall in feet';
COMMENT ON COLUMN rollup_walls.drive_type IS 'Type of drive system (Manual or Motorized)';
COMMENT ON COLUMN rollup_walls.roll_bar_size IS 'Size and material of the roll bar';
COMMENT ON COLUMN rollup_walls.guide_system IS 'Type of guide system used';
COMMENT ON COLUMN rollup_walls.reinforcement IS 'Type of wind reinforcement';
COMMENT ON COLUMN rollup_walls.weather_protection IS 'Weather protection features';

COMMENT ON COLUMN drop_walls.wall_location IS 'Location of the drop wall (Sidewall or Endwall)';
COMMENT ON COLUMN drop_walls.wall_length IS 'Length of the drop wall in feet';
COMMENT ON COLUMN drop_walls.wall_height IS 'Height of the drop wall in feet';
COMMENT ON COLUMN drop_walls.drive_type IS 'Type of drive system (Manual or Motorized)';
COMMENT ON COLUMN drop_walls.cable_guide_system IS 'Type of cable guide system used';
COMMENT ON COLUMN drop_walls.reinforcement IS 'Type of wind reinforcement';
COMMENT ON COLUMN drop_walls.weather_protection IS 'Weather protection features';