/*
  # Update fabric type enum values

  1. Changes
    - Update fabric_type check constraint with new values
    - Add comment explaining valid fabric types
*/

-- Drop existing check constraint
ALTER TABLE curtain_fabrics
DROP CONSTRAINT IF EXISTS curtain_fabrics_fabric_type_check;

-- Add new check constraint with updated values
ALTER TABLE curtain_fabrics
ADD CONSTRAINT curtain_fabrics_fabric_type_check
CHECK (fabric_type IN ('Shade', 'Blackout', 'Insect Screen'));

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.fabric_type
IS 'Type of curtain fabric (Shade, Blackout, or Insect Screen)';