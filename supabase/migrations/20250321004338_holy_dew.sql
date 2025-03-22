/*
  # Fix curtain fabrics fabric_type constraint

  1. Changes
    - Drop conflicting constraint
    - Add correct constraint for fabric types
*/

-- Drop the conflicting constraint
ALTER TABLE curtain_fabrics
DROP CONSTRAINT IF EXISTS curtain_fabrics_new_fabric_type_check1;

-- Add the correct constraint
ALTER TABLE curtain_fabrics
DROP CONSTRAINT IF EXISTS curtain_fabrics_fabric_type_check;

ALTER TABLE curtain_fabrics
ADD CONSTRAINT curtain_fabrics_fabric_type_check
CHECK (fabric_type IN ('Shade', 'Blackout', 'Insect Screen'));

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.fabric_type
IS 'Type of curtain fabric (Shade, Blackout, or Insect Screen)';