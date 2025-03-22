/*
  # Rename light_transmission to energy_savings in curtain_fabrics table

  1. Changes
    - Rename light_transmission column to energy_savings
    - Keep existing data
    - Update column comment
*/

-- Rename the column
ALTER TABLE curtain_fabrics
RENAME COLUMN light_transmission TO energy_savings;

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.energy_savings
IS 'Energy savings percentage as a decimal between 0.0 and 1.0';