/*
  # Add project sharing functionality
  
  1. New Tables
    - `project_shares`
      - `share_id` (uuid, primary key)
      - `project_id` (uuid, references structure_user_entries)
      - `shared_with` (uuid, references auth.users)
      - `permission` (text, either 'view' or 'edit')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `project_shares` table
    - Add policies for sharing and accessing shared projects
*/

-- Create project shares table
CREATE TABLE project_shares (
  share_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES structure_user_entries(entry_id) ON DELETE CASCADE,
  shared_with uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

-- Policies for project_shares
CREATE POLICY "Users can view their shared projects"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() = shared_with);

CREATE POLICY "Users can share projects they have access to"
  ON project_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM structure_user_entries
      WHERE entry_id = project_id
    )
  );

CREATE POLICY "Users can manage their project shares"
  ON project_shares
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM structure_user_entries
      WHERE entry_id = project_id
    )
  );

-- Add policy to structure_user_entries to allow access to shared projects
CREATE POLICY "Users can access shared projects"
  ON structure_user_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_shares
      WHERE project_id = entry_id
      AND shared_with = auth.uid()
    )
  );

-- Function to check if user has access to a project
CREATE OR REPLACE FUNCTION has_project_access(project_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM structure_user_entries
    WHERE entry_id = project_id
  ) OR EXISTS (
    SELECT 1 FROM project_shares
    WHERE project_id = project_shares.project_id 
    AND shared_with = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;