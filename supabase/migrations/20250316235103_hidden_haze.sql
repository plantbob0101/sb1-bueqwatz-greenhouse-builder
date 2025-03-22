/*
  # Drop vent_structural table
  
  1. Changes
    - Drop vent_structural table and its foreign key relationship with vents table
    - No other tables or relationships are modified
*/

-- Drop the vent_structural table
DROP TABLE IF EXISTS vent_structural CASCADE;