/*
  # Update width_size to support array of values

  1. Changes
    - First drop the default value
    - Then change column type to array
    - Add proper comment
*/

-- First remove the default value
ALTER TABLE curtain_fabrics 
ALTER COLUMN width_size DROP DEFAULT;

-- Then change to array type
ALTER TABLE curtain_fabrics
ALTER COLUMN width_size TYPE double precision[] USING ARRAY[width_size];

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.width_size
IS 'Array of width sizes in feet for the curtain fabric';