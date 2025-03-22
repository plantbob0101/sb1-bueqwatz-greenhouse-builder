-- Add new fields to rollup_walls table
ALTER TABLE rollup_walls
ADD COLUMN houses_wide_per_system integer NOT NULL DEFAULT 1 CHECK (houses_wide_per_system > 0),
ADD COLUMN frame_height integer;

-- Add comments for documentation
COMMENT ON COLUMN rollup_walls.houses_wide_per_system IS 'Number of houses wide per system';
COMMENT ON COLUMN rollup_walls.frame_height IS 'Frame height in feet';