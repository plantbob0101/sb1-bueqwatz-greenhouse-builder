/*
  # Fix width_size array field

  1. Changes
    - Drop existing table and recreate with proper array type
    - Add proper constraints and defaults
    - Ensure array values are preserved
*/

-- Create new table with proper array type
CREATE TABLE curtain_fabrics_new (
  fabric_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_name text NOT NULL,
  fabric_type text NOT NULL CHECK (fabric_type IN ('Shade', 'Blackout', 'Insect Screen')),
  energy_savings double precision NOT NULL,
  shade_percentage double precision NOT NULL,
  ventilation_reduction double precision NOT NULL CHECK (ventilation_reduction >= 0.0 AND ventilation_reduction <= 1.0),
  width_size double precision[] NOT NULL DEFAULT '{}'::double precision[],
  price_0_5000 double precision NOT NULL,
  price_5000_20000 double precision NOT NULL,
  price_20000_plus double precision NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data from old table
INSERT INTO curtain_fabrics_new (
  fabric_id,
  fabric_name,
  fabric_type,
  energy_savings,
  shade_percentage,
  ventilation_reduction,
  width_size,
  price_0_5000,
  price_5000_20000,
  price_20000_plus,
  created_at,
  updated_at
)
SELECT
  fabric_id,
  fabric_name,
  fabric_type,
  energy_savings,
  shade_percentage,
  ventilation_reduction,
  ARRAY[width_size]::double precision[],
  price_0_5000,
  price_5000_20000,
  price_20000_plus,
  created_at,
  updated_at
FROM curtain_fabrics;

-- Drop old table and rename new table
DROP TABLE curtain_fabrics;
ALTER TABLE curtain_fabrics_new RENAME TO curtain_fabrics;

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.width_size
IS 'Array of width sizes in feet for the curtain fabric';