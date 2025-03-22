/*
  # Update wall height validation for endwalls

  1. Changes
    - Modifies wall height validation to properly handle endwall heights
    - Ensures endwall height cannot exceed frame height
    - Maintains sidewall height limit of 14 feet
    - Adds validation to ensure frame height is set for endwalls

  2. Validation Rules
    - Sidewalls: Height must be between 0 and 14 feet
    - Endwalls: Height must be between 0 and frame height
    - Frame height must be set when wall_location is 'Endwall'
*/

-- Drop existing check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Add new check constraint with proper validation
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    WHEN wall_location = 'Sidewall' THEN 
      wall_height > 0 AND wall_height <= 14
    WHEN wall_location = 'Endwall' THEN 
      wall_height > 0 
      AND frame_height IS NOT NULL 
      AND frame_height > 0
      AND wall_height <= frame_height
    ELSE false
  END
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT rollup_walls_wall_height_check ON rollup_walls
IS 'Wall height validation: Sidewalls must be between 0 and 14 feet, Endwalls must be between 0 and frame height. Frame height is required for endwalls.';

-- Add comment on columns
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet (allows decimal values, max 14ft for sidewalls, frame height for endwalls)';

COMMENT ON COLUMN rollup_walls.frame_height
IS 'Frame height in feet, required for endwalls and used as their maximum height limit';