/*
  # Update roll-up wall height validations

  1. Changes
    - Adds specific height validations for sidewall configurations:
      - Guttered type: 8, 10, 12, 14 feet
      - Quonset type: 0.8, 3.5, 4.5, 5, 6 feet
    - Maintains existing endwall validation rules

  2. Validation Rules
    - Sidewalls:
      - Guttered: Must be one of: 8, 10, 12, 14 feet
      - Quonset: Must be one of: 0.8, 3.5, 4.5, 5, 6 feet
    - Endwalls: Height must be between 0 and frame height
*/

-- Drop existing check constraint
ALTER TABLE rollup_walls
DROP CONSTRAINT IF EXISTS rollup_walls_wall_height_check;

-- Add new check constraint with specific height validations
ALTER TABLE rollup_walls
ADD CONSTRAINT rollup_walls_wall_height_check
CHECK (
  CASE 
    WHEN wall_location = 'Sidewall' AND type = 'Guttered' THEN 
      wall_height = ANY (ARRAY[8, 10, 12, 14])
    WHEN wall_location = 'Sidewall' AND type = 'Quonset' THEN 
      wall_height = ANY (ARRAY[0.8, 3.5, 4.5, 5, 6])
    WHEN wall_location = 'Endwall' THEN 
      wall_height > 0 
      AND frame_height IS NOT NULL 
      AND frame_height > 0
      AND wall_height <= frame_height
    ELSE false
  END
);

-- Update column comment to reflect new validation rules
COMMENT ON COLUMN rollup_walls.wall_height
IS 'Height of the roll-up wall in feet. For sidewalls: Guttered type must be 8, 10, 12, or 14 feet; Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet. For endwalls: must not exceed frame height.';