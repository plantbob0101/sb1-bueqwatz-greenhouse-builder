-- Add quantity column to drop_walls table
ALTER TABLE drop_walls
ADD COLUMN quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0);

-- Add comment for new column
COMMENT ON COLUMN drop_walls.quantity IS 'Number of drop walls of this configuration';