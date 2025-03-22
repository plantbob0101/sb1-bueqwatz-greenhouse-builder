-- Add house_width field to rollup_walls table
ALTER TABLE rollup_walls
ADD COLUMN house_width integer;

-- Add comment for documentation
COMMENT ON COLUMN rollup_walls.house_width IS 'Width of each house in feet';