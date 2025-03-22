/*
  # Rename price column in curtain fabrics table
  
  1. Changes
    - Rename price_5000_10000 to price_5000_20000
    - Update comment to reflect new range
*/

-- Rename the column
ALTER TABLE curtain_fabrics
RENAME COLUMN price_5000_10000 TO price_5000_20000;

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.price_5000_20000
IS 'Price per unit for orders between 5,000 and 20,000 units';