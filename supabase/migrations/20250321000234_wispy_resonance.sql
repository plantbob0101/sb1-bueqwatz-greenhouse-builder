/*
  # Reorder curtain fabrics columns
  
  1. Changes
    - Create new table with desired column order
    - Copy data from old table
    - Drop old table and rename new one
    - Recreate constraints and comments
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
  price_0_5000 double precision NOT NULL,
  price_5000_10000 double precision NOT NULL,
  price_10000_50000 double precision NOT NULL,
  price_50000_plus double precision NOT NULL,
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
  price_0_5000,
  price_5000_10000,
  price_10000_50000,
  price_50000_plus,
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
  price_0_5000,
  price_5000_10000,
  price_10000_50000,
  price_50000_plus,
  created_at,
  updated_at
FROM curtain_fabrics;

-- Drop old table
DROP TABLE curtain_fabrics;

-- Rename new table to original name
ALTER TABLE curtain_fabrics_new RENAME TO curtain_fabrics;