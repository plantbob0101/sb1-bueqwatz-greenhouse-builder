-- First, temporarily disable all constraints
ALTER TABLE drop_walls
DROP CONSTRAINT IF EXISTS drop_walls_type_check,
DROP CONSTRAINT IF EXISTS drop_walls_wall_height_check;

-- Ensure wall_height is numeric type with proper precision
ALTER TABLE drop_walls
ALTER COLUMN wall_height TYPE numeric(4,1) USING wall_height::numeric(4,1);

-- Add type check constraint
ALTER TABLE drop_walls
ADD CONSTRAINT drop_walls_type_check
CHECK (type IN ('Guttered', 'Quonset'));

-- Add wall height validation with specific heights based on type
ALTER TABLE drop_walls
ADD CONSTRAINT drop_walls_wall_height_check
CHECK (
  CASE 
    WHEN type = 'Guttered' THEN 
      wall_height::numeric = ANY (ARRAY[8.0, 10.0, 12.0]::numeric[])
    WHEN type = 'Quonset' THEN 
      wall_height::numeric = ANY (ARRAY[0.8, 3.5, 4.5, 5.0, 6.0]::numeric[])
    ELSE false
  END
);

-- Update column comments to reflect validation rules
COMMENT ON COLUMN drop_walls.type
IS 'Type of drop wall (Guttered or Quonset)';

COMMENT ON COLUMN drop_walls.wall_height
IS 'Height of the drop wall in feet. For Guttered type must be 8, 10, or 12 feet; for Quonset type must be 0.8, 3.5, 4.5, 5, or 6 feet.';