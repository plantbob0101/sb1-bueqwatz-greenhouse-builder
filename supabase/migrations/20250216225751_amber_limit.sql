-- First, update any existing data to use new type values
UPDATE drop_walls
SET type = 'Guttered'
WHERE type = 'Sidewall';

UPDATE drop_walls
SET type = 'Quonset'
WHERE type = 'Endwall';

-- Drop existing check constraint
ALTER TABLE drop_walls
DROP CONSTRAINT IF EXISTS drop_walls_type_check;

-- Add new check constraint with updated values
ALTER TABLE drop_walls
ADD CONSTRAINT drop_walls_type_check
CHECK (type IN ('Guttered', 'Quonset'));

-- Update column comment to reflect new values
COMMENT ON COLUMN drop_walls.type IS 'Type of drop wall (Guttered or Quonset)';