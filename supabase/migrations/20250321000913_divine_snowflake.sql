/*
  # Remove price_10000_50000 column from curtain fabrics table
  
  1. Changes
    - Drop price_10000_50000 column
*/

-- Remove the column
ALTER TABLE curtain_fabrics
DROP COLUMN price_10000_50000;