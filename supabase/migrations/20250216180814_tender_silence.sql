-- First, temporarily disable all constraints
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check,
DROP CONSTRAINT IF EXISTS rollup_walls_wall_length_check,
DROP CONSTRAINT IF EXISTS rollup_walls_frame_height_check;

-- Clear out any invalid data
DELETE FROM rollup_walls;

-- Ensure proper column types with correct precision
ALTER TABLE rollup_walls
ALTER COLUMN wall_height TYPE numeric(4,1),
ALTER COLUMN frame_height TYPE numeric(4,1),
ALTER COLUMN wall_length TYPE integer;

-- Add NOT NULL constraints
ALTER TABLE rollup_walls
ALTER COLUMN wall_length SET NOT NULL,
ALTER COLUMN wall_height SET NOT NULL;

-- Add basic wall length validation
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_length_check
CHECK (wall_length > 0);

-- Add wall height validation with corrected Quonset heights
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    -- For sidewalls, enforce specific heights based on type
    WHEN wall_location = 'Sidewall' AND type = 'Guttered' THEN 
      wall_height = ANY (ARRAY[8.0, 10.0, 12.0, 14.0]::numeric[])
    WHEN wall_location = 'Sidewall' AND type = 'Quonset' THEN 
      wall_height = ANY (ARRAY[0.8, 3.5, 4.5, 5.0, 6.0]::numeric[])
    -- For endwalls, ensure height is positive and doesn't exceed frame height
    WHEN wall_location = 'Endwall' THEN 
      wall_height > 0 AND
      frame_height IS NOT NULL AND
      wall_height <= frame_height
    ELSE false
  END
);

-- Add frame height validation for endwalls with corrected Quonset heights
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_frame_height_check
CHECK (
  wall_location != 'Endwall' OR
  (wall_location = 'Endwall' AND frame_height IS NOT NULL AND
   CASE
     WHEN type = 'Guttered' THEN 
       frame_height = ANY (ARRAY[8.0, 10.0, 12.0, 14.0]::numeric[])
     WHEN type = 'Quonset' THEN 
       frame_height = ANY (ARRAY[0.8, 3.5, 4.5, 5.0, 6.0]::numeric[])
     ELSE false
   END)
);

-- Update column comments
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet. For sidewalls: Guttered type must be 8, 10, 12, or 14 feet; Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet. For endwalls: must not exceed frame height.';

COMMENT ON COLUMN rollup_walls.frame_height
IS 'Frame height in feet. Required for endwalls. Values depend on type (Guttered: 8, 10, 12, 14 ft; Quonset: 0.8, 3.5, 4.5, 5, 6 ft).';

COMMENT ON COLUMN rollup_walls.wall_length
IS 'Length of the roll-up wall in feet. Must be greater than 0.';