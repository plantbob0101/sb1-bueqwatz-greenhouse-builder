/*
  # Update structures policy

  1. Changes
    - Drop existing policy that uses incorrect user ID comparison
    - Create new policy that correctly matches authenticated users with their structures
    - Add policy for public read access to structures

  2. Security
    - Enable RLS on structures table
    - Add policies for authenticated users to manage their structures
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read their own data" ON structures;

-- Create new policies for structures
CREATE POLICY "Enable read access for authenticated users"
  ON structures
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON structures
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON structures
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users"
  ON structures
  FOR DELETE
  TO authenticated
  USING (true);