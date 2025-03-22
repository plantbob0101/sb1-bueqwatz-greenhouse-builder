/*
  # Fix curtain_fabrics table policies
  
  1. Changes
    - Add proper RLS policies for all operations (insert, update, delete)
    - Ensure authenticated users can perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON curtain_fabrics;

-- Create comprehensive policies for all operations
CREATE POLICY "enable_all_operations_for_authenticated"
ON curtain_fabrics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE curtain_fabrics
IS 'Curtain fabric specifications and pricing. All operations allowed for authenticated users.';
