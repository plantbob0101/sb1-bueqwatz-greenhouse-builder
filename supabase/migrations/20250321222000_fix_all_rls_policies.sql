/*
  # Fix RLS policies for all tables
  
  1. Changes
    - Drop existing policies
    - Add comprehensive policies for all operations (select, insert, update, delete)
    - Ensure authenticated users can perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON curtain_fabrics;
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON glazing_companies_pc8;
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON glazing_companies_poly;
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON vent_drives;
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON rollup_drop_drives;

-- Add comprehensive policies for curtain_fabrics
CREATE POLICY "enable_all_operations_for_authenticated"
ON curtain_fabrics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comprehensive policies for glazing_companies_pc8
CREATE POLICY "enable_all_operations_for_authenticated"
ON glazing_companies_pc8
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comprehensive policies for glazing_companies_poly
CREATE POLICY "enable_all_operations_for_authenticated"
ON glazing_companies_poly
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comprehensive policies for vent_drives
CREATE POLICY "enable_all_operations_for_authenticated"
ON vent_drives
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comprehensive policies for rollup_drop_drives
CREATE POLICY "enable_all_operations_for_authenticated"
ON rollup_drop_drives
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE curtain_fabrics IS 'Curtain fabric specifications and pricing. All operations allowed for authenticated users.';
COMMENT ON TABLE glazing_companies_pc8 IS 'PC8 glazing company specifications and pricing. All operations allowed for authenticated users.';
COMMENT ON TABLE glazing_companies_poly IS 'Poly glazing company specifications and pricing. All operations allowed for authenticated users.';
COMMENT ON TABLE vent_drives IS 'Vent drive specifications. All operations allowed for authenticated users.';
COMMENT ON TABLE rollup_drop_drives IS 'Roll-up and drop wall drive specifications. All operations allowed for authenticated users.';
