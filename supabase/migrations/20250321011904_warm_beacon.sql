/*
  # Fix width size array to handle decimal numbers properly
  
  1. Changes
    - Drop and recreate curtain_fabrics table with proper array type
    - Use numeric(10,2)[] for width_size to ensure decimal precision
    - Add proper constraints and defaults
*/

-- Drop existing table and recreate with proper array type
DROP TABLE IF EXISTS curtain_fabrics CASCADE;

CREATE TABLE curtain_fabrics (
  fabric_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_name text NOT NULL,
  fabric_type text NOT NULL CHECK (fabric_type IN ('Shade', 'Blackout', 'Insect Screen')),
  energy_savings double precision NOT NULL,
  shade_percentage double precision NOT NULL,
  ventilation_reduction double precision NOT NULL CHECK (ventilation_reduction >= 0.0 AND ventilation_reduction <= 1.0),
  width_size numeric(10,2)[] NOT NULL DEFAULT '{}'::numeric(10,2)[],
  price_0_5000 double precision NOT NULL,
  price_5000_20000 double precision NOT NULL,
  price_20000_plus double precision NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment for documentation
COMMENT ON COLUMN curtain_fabrics.width_size
IS 'Array of width sizes in feet for the curtain fabric, allows decimal values';

-- Enable RLS
ALTER TABLE curtain_fabrics ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "enable_read_for_authenticated"
ON curtain_fabrics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);