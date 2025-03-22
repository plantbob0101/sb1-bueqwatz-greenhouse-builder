-- Add new columns to drop_walls table
ALTER TABLE drop_walls
ADD COLUMN braking_winch_with_mount integer DEFAULT 0,
ADD COLUMN additional_corner_pockets integer DEFAULT 0;

-- Add comments for new columns
COMMENT ON COLUMN drop_walls.braking_winch_with_mount IS 'Number of braking winches with mounts';
COMMENT ON COLUMN drop_walls.additional_corner_pockets IS 'Number of additional corner pockets';