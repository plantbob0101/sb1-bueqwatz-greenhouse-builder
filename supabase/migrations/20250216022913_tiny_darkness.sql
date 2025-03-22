-- Drop existing check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Add new check constraint that allows decimal values
ALTER TABLE rollup_walls
ALTER COLUMN wall_height TYPE numeric(4,1);

ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (wall_height > 0 AND wall_height <= 14);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT rollup_walls_wall_height_check ON rollup_walls
IS 'Wall height must be greater than 0 and less than or equal to 14 feet, allows decimal values';

-- Add comment on column
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet (allows decimal values up to 14 feet)';