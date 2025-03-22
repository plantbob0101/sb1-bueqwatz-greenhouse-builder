-- Enable RLS on glazing tables
ALTER TABLE glazing_companies_pc8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_companies_poly ENABLE ROW LEVEL SECURITY;

-- Create policies for PC8 glazing companies
CREATE POLICY "enable_read_for_authenticated"
ON glazing_companies_pc8
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for Poly glazing companies
CREATE POLICY "enable_read_for_authenticated"
ON glazing_companies_poly
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_glazing_companies_pc8_type 
ON glazing_companies_pc8(type);

CREATE INDEX IF NOT EXISTS idx_glazing_companies_poly_type 
ON glazing_companies_poly(type);

-- Add helpful comments
COMMENT ON TABLE glazing_companies_pc8 IS 'PC8 and CPC glazing material suppliers';
COMMENT ON TABLE glazing_companies_poly IS 'Poly glazing material suppliers';