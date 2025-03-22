/*
  # Add ventilation reduction field to curtain fabrics

  1. Changes
    - Add ventilation_reduction column to curtain_fabrics table
    - Add check constraint to ensure valid percentage range
    - Add comment explaining the field
*/

-- Add ventilation_reduction column
ALTER TABLE curtain_fabrics
ADD COLUMN ventilation_reduction double precision NOT NULL DEFAULT 0.0
CHECK (ventilation_reduction >= 0.0 AND ventilation_reduction <= 1.0);

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.ventilation_reduction
IS 'Ventilation reduction percentage as a decimal between 0.0 and 1.0';