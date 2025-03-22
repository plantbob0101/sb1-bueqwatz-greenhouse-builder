/*
  # Update rollup walls NS30 field
  
  1. Changes
    - Rename reinforcement to NS30
    - Add check constraint for Yes/No values
    - Update comments to reflect the change

  2. Security
    - Preserves existing RLS policies
*/

-- Rename reinforcement to NS30 and add check constraint
ALTER TABLE rollup_walls 
  DROP COLUMN reinforcement,
  ADD COLUMN NS30 text NOT NULL CHECK (NS30 IN ('Yes', 'No')) DEFAULT 'No';

-- Update table comments
COMMENT ON COLUMN rollup_walls.NS30 IS 'Whether the wall has NS30 configuration (Yes/No)';