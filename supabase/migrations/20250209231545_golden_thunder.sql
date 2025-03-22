/*
  # Add additional fields to rollup_walls table

  1. New Fields
    - gearbox_pocket (number)
    - simu_winch (number)
    - ridder_mount_guttered (number)
    - ridder_mount_quonset (number)

  2. Changes
    - Added after the length field
    - All fields are nullable numbers
*/

-- Add new columns to rollup_walls table
ALTER TABLE rollup_walls
ADD COLUMN gearbox_pocket integer,
ADD COLUMN simu_winch integer,
ADD COLUMN ridder_mount_guttered integer,
ADD COLUMN ridder_mount_quonset integer;

-- Add comments for documentation
COMMENT ON COLUMN rollup_walls.gearbox_pocket IS 'Number of gearbox pockets';
COMMENT ON COLUMN rollup_walls.simu_winch IS 'Number of Simu winches';
COMMENT ON COLUMN rollup_walls.ridder_mount_guttered IS 'Number of Ridder mounts for guttered walls';
COMMENT ON COLUMN rollup_walls.ridder_mount_quonset IS 'Number of Ridder mounts for quonset walls';