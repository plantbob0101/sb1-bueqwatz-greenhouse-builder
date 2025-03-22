/*
  # Drop vent_glazing table
  
  1. Changes
    - Drop vent_glazing table and any foreign key constraints that reference it
    - No other tables or relationships are modified
*/

-- Drop the vent_glazing table
DROP TABLE IF EXISTS vent_glazing CASCADE;