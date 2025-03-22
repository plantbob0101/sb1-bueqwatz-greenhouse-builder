/*
  # Update vent_size to use feet as unit
  
  1. Changes
    - Add comment to vent_size column to indicate feet as unit
    - No structural changes needed since integer type is appropriate for feet
*/

COMMENT ON COLUMN vent_drives.vent_size IS 'Maximum length in feet that this drive can operate';