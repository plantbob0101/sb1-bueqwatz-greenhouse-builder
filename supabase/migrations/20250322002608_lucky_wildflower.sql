/*
  # Add width_size column to glazing_companies_pc8
  
  1. Changes
    - Add width_size column as text array
    - Set default empty array value
    - Add comment explaining the format
*/

-- Add width_size column as text array with default empty array
ALTER TABLE glazing_companies_pc8
ADD COLUMN width_size text[] NOT NULL DEFAULT '{}'::text[];

-- Add comment for documentation
COMMENT ON COLUMN glazing_companies_pc8.width_size
IS 'Array of width sizes in feet (stored as text to allow decimal values like "11.8")';