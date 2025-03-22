/*
  # Add vent insect screen table

  1. New Tables
    - `vent_insect_screen`
      - `screen_id` (uuid, primary key)
      - `vent_id` (uuid, references vents)
      - `type` (text)
      - `quantity` (integer)
      - `length` (numeric)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add proper indexes
*/

-- Create vent_insect_screen table
CREATE TABLE vent_insect_screen (
  screen_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vent_id uuid REFERENCES vents(vent_id) ON DELETE CASCADE,
  type text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  length numeric(10,2) NOT NULL CHECK (length > 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vent_insect_screen ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "vent_insect_screen_select"
ON vent_insect_screen
FOR SELECT
TO authenticated
USING (
  vent_id IN (
    SELECT vent_id FROM vents
    WHERE structure_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
      UNION
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
    )
  )
);

CREATE POLICY "vent_insect_screen_insert"
ON vent_insect_screen
FOR INSERT
TO authenticated
WITH CHECK (
  vent_id IN (
    SELECT vent_id FROM vents
    WHERE structure_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "vent_insect_screen_update"
ON vent_insect_screen
FOR UPDATE
TO authenticated
USING (
  vent_id IN (
    SELECT vent_id FROM vents
    WHERE structure_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
      UNION
      SELECT project_id 
      FROM project_shares 
      WHERE shared_with = auth.uid()
      AND permission = 'edit'
    )
  )
);

CREATE POLICY "vent_insect_screen_delete"
ON vent_insect_screen
FOR DELETE
TO authenticated
USING (
  vent_id IN (
    SELECT vent_id FROM vents
    WHERE structure_id IN (
      SELECT entry_id 
      FROM structure_user_entries 
      WHERE user_id = auth.uid()
    )
  )
);

-- Add indexes for better performance
CREATE INDEX idx_vent_insect_screen_vent_id 
ON vent_insect_screen(vent_id);

-- Add helpful comments
COMMENT ON TABLE vent_insect_screen IS 'Insect screen configurations for vents';
COMMENT ON COLUMN vent_insect_screen.screen_id IS 'Unique identifier for the insect screen';
COMMENT ON COLUMN vent_insect_screen.vent_id IS 'Reference to the associated vent';
COMMENT ON COLUMN vent_insect_screen.type IS 'Type of insect screen material';
COMMENT ON COLUMN vent_insect_screen.quantity IS 'Number of screens of this configuration';
COMMENT ON COLUMN vent_insect_screen.length IS 'Length of the screen in feet';
COMMENT ON COLUMN vent_insect_screen.notes IS 'Additional notes about the insect screen';