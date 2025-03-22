/*
  # Drop vent_automation table
  
  1. Changes
    - Drop vent_automation table and any foreign key constraints that reference it
    - No other tables or relationships are modified
*/

-- Drop the vent_automation table
DROP TABLE IF EXISTS vent_automation CASCADE;