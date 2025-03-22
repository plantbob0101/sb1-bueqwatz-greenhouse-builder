/*
  # Add Range and Houses fields

  1. Changes
    - Add `ranges` column to structure_user_entries table for number of greenhouse ranges
    - Add `houses` column to structure_user_entries table for number of greenhouse models
*/

ALTER TABLE structure_user_entries
ADD COLUMN ranges integer DEFAULT 1,
ADD COLUMN houses integer DEFAULT 1;