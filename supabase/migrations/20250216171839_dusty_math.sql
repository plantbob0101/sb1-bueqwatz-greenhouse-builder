-- First, modify the frame_height column to use numeric type as well
ALTER TABLE rollup_walls
ALTER COLUMN frame_height TYPE numeric(4,1);

-- Drop existing check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Add new check constraint with specific height validations
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    WHEN wall_location = 'Sidewall' AND type = 'Guttered' THEN 
      wall_height = ANY (ARRAY[8, 10, 12, 14]::numeric[])
    WHEN wall_location = 'Sidewall' AND type = 'Quonset' THEN 
      wall_height = ANY (ARRAY[0.8, 3.5, 4.5, 5, 6]::numeric[])
    WHEN wall_location = 'Endwall' AND type = 'Guttered' THEN
      frame_height = ANY (ARRAY[8, 10, 12, 14]::numeric[])
      AND wall_height > 0 
      AND wall_height <= frame_height
    WHEN wall_location = 'Endwall' AND type = 'Quonset' THEN
      frame_height = ANY (ARRAY[0.8, 3.5, 4.5, 5, 6]::numeric[])
      AND wall_height > 0 
      AND wall_height <= frame_height
    ELSE false
  END
);

-- Update column comments to reflect validation rules
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet. For sidewalls: Guttered type must be 8, 10, 12, or 14 feet; Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet. For endwalls: must not exceed frame height.';

COMMENT ON COLUMN rollup_walls.frame_height
IS 'Frame height in feet. For Guttered type must be 8, 10, 12, or 14 feet; for Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet.';