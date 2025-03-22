/*
  # Add light diffusion field to PC8 glazing companies

  1. Changes
    - Add light_diffusion column to glazing_companies_pc8 table
    - Add comment explaining the field
*/

-- Add light_diffusion column
ALTER TABLE glazing_companies_pc8
ADD COLUMN light_diffusion float NOT NULL DEFAULT 0.0
CHECK (light_diffusion >= 0.0 AND light_diffusion <= 1.0);

-- Add comment for documentation
COMMENT ON COLUMN glazing_companies_pc8.light_diffusion
IS 'Light diffusion percentage as a decimal between 0.0 and 1.0';