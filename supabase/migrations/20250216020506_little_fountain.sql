-- Add drive_id column to rollup_walls table
ALTER TABLE rollup_walls
ADD COLUMN drive_id uuid REFERENCES rollup_drop_drives(drive_id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_rollup_walls_drive_id 
ON rollup_walls(drive_id);

-- Add helpful comments
COMMENT ON COLUMN rollup_walls.drive_id IS 'Reference to the drive configuration used for this wall';