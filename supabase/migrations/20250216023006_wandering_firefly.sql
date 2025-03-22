-- Drop existing check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Add new check constraint that allows decimal values for both wall types
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    WHEN wall_location = 'Sidewall' THEN wall_height > 0 AND wall_height <= 14
    WHEN wall_location = 'Endwall' THEN wall_height > 0 AND wall_height <= frame_height
    ELSE false
  END
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT rollup_walls_wall_height_check ON rollup_walls
IS 'Wall height validation: Sidewalls must be between 0 and 14 feet, Endwalls must be between 0 and frame height';

-- Add comment on column
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet (allows decimal values, max 14ft for sidewalls, frame height for endwalls)';

-- Add comment on frame_height column
COMMENT ON COLUMN rollup_walls.frame_height
IS 'Frame height in feet, used as maximum height limit for endwalls';