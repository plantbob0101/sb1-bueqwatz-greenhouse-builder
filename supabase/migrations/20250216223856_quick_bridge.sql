-- Rename columns in drop_walls table
ALTER TABLE drop_walls
  RENAME COLUMN wall_location TO type;

ALTER TABLE drop_walls
  RENAME COLUMN cable_guide_system TO ns30;

ALTER TABLE drop_walls
  RENAME COLUMN reinforcement TO spacing;

ALTER TABLE drop_walls
  RENAME COLUMN weather_protection TO ati_house;

-- Update column comments to reflect new names
COMMENT ON COLUMN drop_walls.type IS 'Type of drop wall (Sidewall or Endwall)';
COMMENT ON COLUMN drop_walls.ns30 IS 'NS30 configuration for the drop wall';
COMMENT ON COLUMN drop_walls.spacing IS 'Spacing between drop wall supports';
COMMENT ON COLUMN drop_walls.ati_house IS 'ATI house configuration';