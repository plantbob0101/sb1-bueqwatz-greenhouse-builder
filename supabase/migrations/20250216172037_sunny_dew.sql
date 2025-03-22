-- Drop existing check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Add new check constraint with more precise validation
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    WHEN wall_location = 'Sidewall' AND type = 'Guttered' THEN 
      wall_height = ANY (ARRAY[8.0, 10.0, 12.0, 14.0]::numeric[])
    WHEN wall_location = 'Sidewall' AND type = 'Quonset' THEN 
      wall_height = ANY (ARRAY[0.8, 3.5, 4.5, 5.0, 6.0]::numeric[])
    WHEN wall_location = 'Endwall' AND type = 'Guttered' THEN
      frame_height = ANY (ARRAY[8.0, 10.0, 12.0, 14.0]::numeric[])
      AND wall_height > 0 
      AND wall_height <= frame_height
    WHEN wall_location = 'Endwall' AND type = 'Quonset' THEN
      frame_height = ANY (ARRAY[0.8, 3.5, 4.5, 5.0, 6.0]::numeric[])
      AND wall_height > 0 
      AND wall_height <= frame_height
    ELSE false
  END
);

-- Ensure both columns are numeric with proper precision
ALTER TABLE rollup_walls
  ALTER COLUMN wall_height TYPE numeric(4,1) USING COALESCE(wall_height, 0)::numeric(4,1),
  ALTER COLUMN frame_height TYPE numeric(4,1) USING COALESCE(frame_height, 0)::numeric(4,1);

-- Update column comments
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet. For sidewalls: Guttered type must be 8, 10, 12, or 14 feet; Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet. For endwalls: must not exceed frame height.';

COMMENT ON COLUMN rollup_walls.frame_height
IS 'Frame height in feet. For Guttered type must be 8, 10, 12, or 14 feet; for Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet.';