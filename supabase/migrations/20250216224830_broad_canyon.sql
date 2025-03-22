/*
  # Reorder drop_walls table columns
  
  This migration reorders the columns in the drop_walls table to match the specified order
  by creating a new table and transferring the data.
*/

-- Create new table with desired column order
CREATE TABLE drop_walls_new (
  drop_wall_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structure_user_entries(entry_id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Sidewall', 'Endwall')),
  wall_height integer NOT NULL CHECK (wall_height > 0),
  ns30 text,
  spacing text,
  ati_house text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  wall_length integer NOT NULL CHECK (wall_length > 0),
  braking_winch_with_mount integer DEFAULT 0,
  additional_corner_pockets integer DEFAULT 0,
  drive_type text NOT NULL CHECK (drive_type IN ('Manual', 'Motorized')),
  motor_model text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data from old table to new table
INSERT INTO drop_walls_new (
  drop_wall_id,
  structure_id,
  type,
  wall_height,
  ns30,
  spacing,
  ati_house,
  quantity,
  wall_length,
  braking_winch_with_mount,
  additional_corner_pockets,
  drive_type,
  motor_model,
  notes,
  created_at,
  updated_at
)
SELECT
  drop_wall_id,
  structure_id,
  type,
  wall_height,
  ns30,
  spacing,
  ati_house,
  quantity,
  wall_length,
  braking_winch_with_mount,
  additional_corner_pockets,
  drive_type,
  motor_model,
  notes,
  created_at,
  updated_at
FROM drop_walls;

-- Drop old table
DROP TABLE drop_walls;

-- Rename new table to original name
ALTER TABLE drop_walls_new RENAME TO drop_walls;

-- Enable RLS
ALTER TABLE drop_walls ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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
CREATE INDEX idx_drop_walls_structure_id ON drop_walls(structure_id);

-- Add helpful comments
COMMENT ON TABLE drop_walls IS 'Drop wall systems for greenhouse structures';
COMMENT ON COLUMN drop_walls.type IS 'Type of drop wall (Sidewall or Endwall)';
COMMENT ON COLUMN drop_walls.wall_height IS 'Height of the drop wall in feet';
COMMENT ON COLUMN drop_walls.ns30 IS 'NS30 configuration for the drop wall';
COMMENT ON COLUMN drop_walls.spacing IS 'Spacing between drop wall supports';
COMMENT ON COLUMN drop_walls.ati_house IS 'ATI house configuration';
COMMENT ON COLUMN drop_walls.quantity IS 'Number of drop walls of this configuration';
COMMENT ON COLUMN drop_walls.wall_length IS 'Length of the drop wall in feet';
COMMENT ON COLUMN drop_walls.braking_winch_with_mount IS 'Number of braking winches with mounts';
COMMENT ON COLUMN drop_walls.additional_corner_pockets IS 'Number of additional corner pockets';
COMMENT ON COLUMN drop_walls.drive_type IS 'Type of drive system (Manual or Motorized)';
COMMENT ON COLUMN drop_walls.motor_model IS 'Model specifications for motorized drives';
COMMENT ON COLUMN drop_walls.notes IS 'Additional notes about the drop wall';