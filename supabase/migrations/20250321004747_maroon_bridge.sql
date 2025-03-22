/*
  # Fix ventilation reduction validation

  1. Changes
    - Drop existing constraint
    - Add new constraint that properly validates ventilation reduction values
    - Update comment to clarify the expected format
*/

-- Drop the conflicting constraint
ALTER TABLE curtain_fabrics
DROP CONSTRAINT IF EXISTS curtain_fabrics_new_ventilation_reduction_check1;

-- Add the correct constraint
ALTER TABLE curtain_fabrics
ADD CONSTRAINT curtain_fabrics_ventilation_reduction_check
CHECK (ventilation_reduction >= 0.0 AND ventilation_reduction <= 1.0);

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.ventilation_reduction
IS 'Ventilation reduction as a decimal between 0.0 and 1.0 (e.g., 0.45 for 45%)';