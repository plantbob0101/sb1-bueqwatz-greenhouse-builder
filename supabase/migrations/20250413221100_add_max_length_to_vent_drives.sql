-- Drop existing policies if they exist
DO $$ BEGIN
    EXECUTE 'DROP POLICY IF EXISTS enable_all_operations_for_authenticated ON vent_drives';
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Add max_length column to vent_drives table
ALTER TABLE vent_drives
ADD COLUMN IF NOT EXISTS max_length integer NOT NULL DEFAULT 160 CHECK (max_length > 0);

-- Update existing drives with appropriate max lengths
UPDATE vent_drives
SET max_length = CASE
    WHEN drive_type = 'Motorized' THEN 160  -- Default max length for motorized drives
    WHEN drive_type = 'Manual' THEN 80      -- Default max length for manual drives
    ELSE 160                                -- Fallback default
END;

-- Recreate the policy
CREATE POLICY enable_all_operations_for_authenticated
ON vent_drives
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
