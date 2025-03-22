/*
  # Fix width_size column in glazing_companies_pc8
  
  1. Changes
    - Drop existing width_size column
    - Add new width_size column as text array to handle decimal values
    - Add comment explaining the format
*/

-- Drop existing column if it exists
ALTER TABLE glazing_companies_pc8
DROP COLUMN IF EXISTS width_size;

-- Add width_size column as text array with default empty array
ALTER TABLE glazing_companies_pc8
ADD COLUMN width_size text[] NOT NULL DEFAULT '{}'::text[];

-- Add comment for documentation
COMMENT ON COLUMN glazing_companies_pc8.width_size
IS 'Array of width sizes in feet (stored as text to allow decimal values like "11.8")';