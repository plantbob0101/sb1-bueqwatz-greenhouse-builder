/*
  # Update rollup walls type field
  
  1. Changes
    - Rename roll_bar_size to type
    - Add check constraint for type values
    - Update comments to reflect the change

  2. Security
    - Preserves existing RLS policies
*/

-- Rename roll_bar_size to type and add check constraint
ALTER TABLE rollup_walls 
  DROP COLUMN roll_bar_size,
  ADD COLUMN type text NOT NULL CHECK (type IN ('Quonset', 'Guttered')) DEFAULT 'Guttered';

-- Update table comments
COMMENT ON COLUMN rollup_walls.type IS 'Type of roll-up wall (Quonset or Guttered)';