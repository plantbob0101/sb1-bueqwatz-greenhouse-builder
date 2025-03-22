-- First, temporarily remove the check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Update any existing data to use 8.0 instead of 0.8
UPDATE rollup_walls
SET wall_height = 8.0
WHERE wall_height = 0.8;

UPDATE rollup_walls
SET frame_height = 8.0
WHERE frame_height = 0.8;

-- Add new check constraint with updated height validations
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