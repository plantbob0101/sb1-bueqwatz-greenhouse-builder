/*
  # Add width size field to curtain fabrics table
  
  1. Changes
    - Create new table with desired column order including width_size
    - Copy data from old table to new table
    - Drop old table and rename new table
*/

-- Create new table with desired column order
CREATE TABLE curtain_fabrics_new (
  fabric_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_name text NOT NULL,
  fabric_type text NOT NULL CHECK (fabric_type IN (
    'Insect Screen',
    'Ground Cover',
    'Weather Protection',
    'Horticultural Textiles'
  )),
  energy_savings double precision NOT NULL,
  shade_percentage double precision NOT NULL,
  ventilation_reduction double precision NOT NULL DEFAULT 0.0 CHECK (ventilation_reduction >= 0.0 AND ventilation_reduction <= 1.0),
  width_size double precision NOT NULL DEFAULT 0.0,
  price_0_5000 double precision NOT NULL,
  price_5000_20000 double precision NOT NULL,
  price_20000_plus double precision NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data from old table to new table
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
  0.0 as width_size,  -- Default value for existing records
  price_0_5000,
  price_5000_20000,
  price_20000_plus,
  created_at,
  updated_at
FROM curtain_fabrics;

-- Drop old table
DROP TABLE curtain_fabrics;

-- Rename new table to original name
ALTER TABLE curtain_fabrics_new RENAME TO curtain_fabrics;

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.width_size
IS 'Width size of the curtain fabric in feet';