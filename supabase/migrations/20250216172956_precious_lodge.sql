-- First, temporarily disable all constraints
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check,
DROP CONSTRAINT IF EXISTS rollup_walls_wall_length_check;

-- Update any existing invalid data
UPDATE rollup_walls
SET wall_length = 1
WHERE wall_length <= 0 OR wall_length IS NULL;

-- Add wall length validation with proper type casting
ALTER TABLE rollup_walls
ALTER COLUMN wall_length TYPE integer USING wall_length::integer;

ALTER TABLE rollup_walls
ALTER COLUMN wall_length SET NOT NULL,
ADD CONSTRAINT rollup_walls_wall_length_check
CHECK (wall_length > 0);

-- Add wall height validation
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    WHEN wall_location = 'Sidewall' AND type = 'Guttered' THEN 
      wall_height::numeric = ANY (ARRAY[8.0, 10.0, 12.0, 14.0]::numeric[])
    WHEN wall_location = 'Sidewall' AND type = 'Quonset' THEN 
      wall_height::numeric = ANY (ARRAY[8.0, 3.5, 4.5, 5.0, 6.0]::numeric[])
    WHEN wall_location = 'Endwall' AND type = 'Guttered' THEN
      frame_height::numeric = ANY (ARRAY[8.0, 10.0, 12.0, 14.0]::numeric[])
      AND wall_height > 0 
      AND wall_height <= frame_height
    WHEN wall_location = 'Endwall' AND type = 'Quonset' THEN
      frame_height::numeric = ANY (ARRAY[8.0, 3.5, 4.5, 5.0, 6.0]::numeric[])
      AND wall_height > 0 
      AND wall_height <= frame_height
    ELSE false
  END
);

-- Update column comments
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet. For sidewalls: Guttered type must be 8, 10, 12, or 14 feet; Quonset type must be 8, 3.5, 4.5, 5, or 6 feet. For endwalls: must not exceed frame height.';

COMMENT ON COLUMN rollup_walls.frame_height
IS 'Frame height in feet. For Guttered type must be 8, 10, 12, or 14 feet; for Quonset type must be 8, 3.5, 4.5, 5, or 6 feet.';

COMMENT ON COLUMN rollup_walls.wall_length
IS 'Length of the roll-up wall in feet. Must be greater than 0.';