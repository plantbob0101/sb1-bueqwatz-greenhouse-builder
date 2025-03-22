/*
  # Rename price column in curtain fabrics table
  
  1. Changes
    - Rename price_50000_plus to price_20000_plus
    - Update comment to reflect new price range
*/

-- Rename the column
ALTER TABLE curtain_fabrics
RENAME COLUMN price_50000_plus TO price_20000_plus;

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.price_20000_plus
IS 'Price per unit for orders over 20,000 units';