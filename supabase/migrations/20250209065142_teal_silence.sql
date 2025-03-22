/*
  # Fix project shares relationship

  1. Changes
    - Drop and recreate foreign key relationship between project_shares and profiles
    - Update policies to use proper joins
    - Add missing indexes for performance

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Drop existing foreign key if it exists
ALTER TABLE project_shares
DROP CONSTRAINT IF EXISTS project_shares_shared_with_fkey;

-- Recreate the foreign key relationship properly
ALTER TABLE project_shares
ADD CONSTRAINT project_shares_shared_with_fkey
FOREIGN KEY (shared_with)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "enable_shares_access" ON project_shares;

-- Create new simplified policies
CREATE POLICY "project_shares_access"
ON project_shares
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR      -- User owns the share
  shared_with = auth.uid()     -- Or is shared with the user
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_with_user_id 
ON project_shares(shared_with, user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_project_id_user_id 
ON project_shares(project_id, user_id);