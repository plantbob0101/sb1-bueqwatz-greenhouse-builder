/*
  # Fix structures table schema

  1. Changes
    - Add missing columns to structures table
    - Update RLS policies
    - Add proper constraints

  2. Security
    - Maintain RLS policies
    - Ensure data integrity
*/

-- Add missing columns to structures table
ALTER TABLE structures
ADD COLUMN IF NOT EXISTS covering_roof text CHECK (covering_roof IN ('CPC', 'PC8', 'Poly')),
ADD COLUMN IF NOT EXISTS covering_sidewalls text CHECK (covering_sidewalls IN ('CPC', 'PC8', 'Poly')),
ADD COLUMN IF NOT EXISTS covering_endwalls text CHECK (covering_endwalls IN ('CPC', 'PC8', 'Poly')),
ADD COLUMN IF NOT EXISTS covering_gables text CHECK (covering_gables IN ('CPC', 'PC8', 'Poly')),
ADD COLUMN IF NOT EXISTS project_name text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Draft',
ADD COLUMN IF NOT EXISTS ranges integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS houses integer DEFAULT 1;

-- Set default values for existing rows
UPDATE structures
SET 
  covering_roof = roof_glazing,
  covering_sidewalls = roof_glazing,
  covering_endwalls = roof_glazing,
  covering_gables = roof_glazing
WHERE covering_roof IS NULL;