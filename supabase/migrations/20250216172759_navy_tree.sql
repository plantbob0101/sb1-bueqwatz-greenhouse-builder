-- First, temporarily disable the check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_length_check;

-- Update any existing invalid wall lengths
UPDATE rollup_walls
SET wall_length = 1
WHERE wall_length <= 0 OR wall_length IS NULL;

-- Add wall length validation
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_length_check
CHECK (wall_length > 0);

-- Add comment for documentation
COMMENT ON COLUMN rollup_walls.wall_length
IS 'Length of the roll-up wall in feet. Must be greater than 0.';