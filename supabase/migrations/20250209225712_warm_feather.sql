/*
  # Update rollup walls schema
  
  1. Changes
    - Rename guide_system to quantity
    - Add check constraint to ensure quantity is positive
    - Update comments to reflect the change

  2. Security
    - Preserves existing RLS policies
*/

-- Rename guide_system to quantity and add check constraint
ALTER TABLE rollup_walls 
  DROP COLUMN guide_system,
  ADD COLUMN quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0);

-- Update table comments
COMMENT ON COLUMN rollup_walls.quantity IS 'Number of roll-up walls of this configuration';