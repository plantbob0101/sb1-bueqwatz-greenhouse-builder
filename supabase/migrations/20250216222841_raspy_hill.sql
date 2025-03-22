-- First, drop the foreign key constraint
ALTER TABLE drop_walls
DROP CONSTRAINT IF EXISTS drop_walls_fabric_id_fkey;

-- Then drop the fabric_id column
ALTER TABLE drop_walls
DROP COLUMN IF EXISTS fabric_id;

-- Update table comment to reflect changes
COMMENT ON TABLE drop_walls IS 'Drop wall systems for greenhouse structures';