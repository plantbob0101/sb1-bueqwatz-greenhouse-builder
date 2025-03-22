/*
  # Add wall vent types
  
  1. Changes
    - Add "Roll-up Wall" and "Drop Wall" to vent_types table
*/

-- Insert new vent types
INSERT INTO vent_types (vent_type) VALUES
  ('Roll-up Wall'),
  ('Drop Wall')
ON CONFLICT (vent_type) DO NOTHING;