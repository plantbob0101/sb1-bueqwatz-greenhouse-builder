/*
  # Update vent_drives compatible_structures field
  
  1. Changes
    - Add comment to compatible_structures column to indicate comma-separated format
    - No structural changes needed since text[] already supports comma-separated values
*/

COMMENT ON COLUMN vent_drives.compatible_structures IS 'Comma-separated list of compatible structure models';