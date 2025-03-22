/*
  # Update width_size to support array of values

  1. Changes
    - Create temporary table with array type
    - Copy data with proper array conversion
    - Drop and recreate table with array type
*/

-- Create temporary table with array type
CREATE TABLE curtain_fabrics_temp (LIKE curtain_fabrics);

ALTER TABLE curtain_fabrics_temp
ALTER COLUMN width_size TYPE double precision[] USING ARRAY[width_size];

-- Copy data from old table
INSERT INTO curtain_fabrics_temp
SELECT * FROM curtain_fabrics;

-- Drop old table and rename temp table
DROP TABLE curtain_fabrics;
ALTER TABLE curtain_fabrics_temp RENAME TO curtain_fabrics;

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.width_size
IS 'Array of width sizes in feet for the curtain fabric';