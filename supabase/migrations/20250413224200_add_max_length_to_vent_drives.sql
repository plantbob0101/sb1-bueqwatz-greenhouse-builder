-- Check if max_length column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vent_drives' AND column_name = 'max_length'
    ) THEN
        -- Add max_length column with default value of 160
        ALTER TABLE vent_drives
        ADD COLUMN max_length integer NOT NULL DEFAULT 160;
        
        -- Add check constraint to ensure max_length is positive
        ALTER TABLE vent_drives
        ADD CONSTRAINT vent_drives_max_length_check CHECK (max_length > 0);
        
        -- Add comment to describe the column
        COMMENT ON COLUMN vent_drives.max_length IS 'Maximum length in feet that this drive can accommodate';
    END IF;
END
$$;
