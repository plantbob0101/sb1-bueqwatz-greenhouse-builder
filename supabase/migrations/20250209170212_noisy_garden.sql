/*
  # Add vent sizes data

  1. Changes
    - Insert all vent sizes for each vent type
    - Ensure Solar Light Roof has 54" size
*/

-- First, clear existing vent sizes to avoid duplicates
DELETE FROM vent_sizes;

-- Insert all vent sizes for each type
INSERT INTO vent_sizes (vent_type, vent_size) VALUES
  ('Continental Roof', 48),
  ('Gothic Roof', 48),
  ('Insulator Roof', 36),
  ('Insulator Roof', 48),
  ('Oxnard Vent', 21),
  ('Oxnard Vent', 27),
  ('Oxnard Vent', 30),
  ('Oxnard Vent', 35),
  ('Pad Vent', 36),
  ('Pad Vent', 48),
  ('Pad Vent', 60),
  ('Solar Light Roof', 54),
  ('Wall Vent', 36),
  ('Wall Vent', 48),
  ('Wall Vent', 60);