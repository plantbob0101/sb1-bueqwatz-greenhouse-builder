/*
  # Update rollup walls spacing field
  
  1. Changes
    - Rename weather_protection to spacing
    - Add check constraint for valid spacing values (4', 6', 12')
    - Update comments to reflect the change

  2. Security
    - Preserves existing RLS policies
*/

-- Rename weather_protection to spacing and add check constraint
ALTER TABLE rollup_walls 
  DROP COLUMN weather_protection,
  ADD COLUMN spacing text NOT NULL CHECK (spacing IN ('4''', '6''', '12''')) DEFAULT '6''';

-- Update table comments
COMMENT ON COLUMN rollup_walls.spacing IS 'Spacing between roll-up wall supports (4'', 6'', or 12'')';