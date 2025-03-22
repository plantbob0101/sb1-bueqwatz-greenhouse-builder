/*
  # Drop vent_sizes table
  
  1. Changes
    - Drop vent_sizes table and any foreign key constraints that reference it
    - No other tables or relationships are modified
*/

-- Drop the vent_sizes table
DROP TABLE IF EXISTS vent_sizes CASCADE;