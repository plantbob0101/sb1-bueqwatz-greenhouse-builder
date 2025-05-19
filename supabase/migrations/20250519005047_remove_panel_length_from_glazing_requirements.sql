-- This migration removes the panel_length field from the glazing_requirements table

DO $$
BEGIN
  -- Check if the column exists before trying to drop it
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'glazing_requirements'
    AND column_name = 'panel_length'
  ) THEN
    -- Create a backup of the table before modifying
    RAISE NOTICE 'Creating backup of glazing_requirements before removing column...';
    
    CREATE TABLE IF NOT EXISTS glazing_requirements_backup AS
      SELECT * FROM glazing_requirements;
    
    -- Drop the column
    RAISE NOTICE 'Removing panel_length column from glazing_requirements table...';
    ALTER TABLE glazing_requirements DROP COLUMN panel_length;
    
    RAISE NOTICE 'Successfully removed panel_length column from glazing_requirements table.';
    RAISE NOTICE 'A backup of the original table is available as: glazing_requirements_backup';
  ELSE
    RAISE NOTICE 'Column panel_length does not exist in glazing_requirements table. No changes needed.';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in migration: %', SQLERRM;
  RAISE;
END $$;