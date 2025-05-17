-- SQL Script to update the glazing_requirements table schema
-- 1. Remove the length column
-- 2. Rename panel_count to panel_width

-- Start a transaction so that all changes are atomic
BEGIN;

-- First, make a backup of the current data (optional but recommended)
CREATE TABLE IF NOT EXISTS glazing_requirements_backup AS
SELECT * FROM glazing_requirements;

-- Step 1: Remove the length column
ALTER TABLE glazing_requirements DROP COLUMN length;

-- Step 2: Rename panel_count to panel_width
ALTER TABLE glazing_requirements RENAME COLUMN panel_count TO panel_width;

-- Commit the transaction
COMMIT;

-- Verify the changes
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'glazing_requirements' 
ORDER BY 
  ordinal_position;
