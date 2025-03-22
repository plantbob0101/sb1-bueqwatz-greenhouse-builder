/*
  # Initial Schema for Greenhouse Builder

  1. New Tables
    - structures: Core greenhouse structure information
    - structure_user_entries: User-defined structure parameters
    - vents: Ventilation system details
    - vent_types: Lookup table for vent types
    - vent_sizes: Lookup table for vent dimensions
    - vent_glazing: Glazing specifications for vents
    - vent_automation: Automation and drive systems
    - vent_structural: Structural considerations for vents
    - glazing_companies_pc8: PC8 glazing supplier details
    - glazing_companies_poly: Polyethylene glazing supplier info
    - glazing_materials: Material selection for different sections
    - glazing_panel_calculations: Panel quantity calculations
    - glazing_panel_sizes: Specific panel dimensions
    - cooling_systems: Core cooling system information
    - cooling_calculations: Cooling requirement calculations
    - cooling_factors: Lookup table for cooling adjustment factors
    - cooling_equipment: Specific cooling equipment details
    - cooling_zones: Zone-specific cooling requirements
    - cooling_user_entries: User input for cooling systems
    - heating_systems: Core heating system information
    - heating_calculations: Heating requirement calculations
    - heating_factors: Lookup table for heating adjustment factors
    - heating_user_entries: User input for heating systems
    - energy_curtains: Curtain system specifications
    - curtain_fabrics: Fabric specifications and pricing
    - curtain_drives: Drive systems for curtains
    - vent_drives: Drive systems for vents

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vent Types Lookup Table (Added before vents table)
CREATE TABLE vent_types (
  vent_type text PRIMARY KEY,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert standard vent types
INSERT INTO vent_types (vent_type) VALUES
  ('Continental Roof'),
  ('Gothic Roof'),
  ('Insulator Roof'),
  ('Oxnard Vent'),
  ('Pad Vent'),
  ('Solar Light Roof'),
  ('Wall Vent');

-- Core Structures Table
CREATE TABLE structures (
  structure_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model text NOT NULL,
  width integer NOT NULL,
  spacing integer NOT NULL,
  eave_height integer NOT NULL,
  load_rating text NOT NULL,
  roof_glazing text NOT NULL CHECK (roof_glazing IN ('CPC', 'PC8', 'Poly')),
  elevation text NOT NULL,
  zones integer NOT NULL,
  gutter_partitions integer NOT NULL,
  gable_partitions integer NOT NULL,
  structural_upgrades text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Structure User Entry Table
CREATE TABLE structure_user_entries (
  entry_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  width_ft integer NOT NULL,
  length_ft integer NOT NULL,
  eave_height integer NOT NULL,
  elevation text NOT NULL,
  zones integer NOT NULL,
  gutter_partitions integer NOT NULL,
  gable_partitions integer NOT NULL,
  structural_upgrades text,
  roof_glazing text NOT NULL CHECK (roof_glazing IN ('CPC', 'PC8', 'Poly')),
  covering_roof text NOT NULL,
  covering_sidewalls text NOT NULL,
  covering_endwalls text NOT NULL,
  covering_gables text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vents Table (Modified to reference vent_types)
CREATE TABLE vents (
  vent_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  vent_type text REFERENCES vent_types(vent_type),
  single_double text NOT NULL CHECK (single_double IN ('Single', 'Double')),
  vent_size integer NOT NULL,
  vent_quantity integer NOT NULL,
  vent_length integer NOT NULL,
  ati_house text NOT NULL CHECK (ati_house IN ('Yes', 'No')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vent Sizes Lookup Table
CREATE TABLE vent_sizes (
  vent_type text REFERENCES vent_types(vent_type),
  vent_size integer NOT NULL,
  PRIMARY KEY (vent_type, vent_size)
);

-- Insert standard vent sizes
INSERT INTO vent_sizes (vent_type, vent_size) VALUES
  ('Continental Roof', 48),
  ('Gothic Roof', 48),
  ('Insulator Roof', 36),
  ('Insulator Roof', 48),
  ('Oxnard Vent', 21),
  ('Oxnard Vent', 27),
  ('Oxnard Vent', 30),
  ('Oxnard Vent', 35),
  ('Pad Vent', 36),
  ('Pad Vent', 48),
  ('Pad Vent', 60),
  ('Solar Light Roof', 54),
  ('Wall Vent', 36),
  ('Wall Vent', 48),
  ('Wall Vent', 60);

-- Vent Glazing Table
CREATE TABLE vent_glazing (
  vent_glazing_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vent_id uuid REFERENCES vents ON DELETE CASCADE,
  vent_glazing text NOT NULL CHECK (vent_glazing IN ('CPC', 'PC8', 'Poly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vent Automation & Drives Table
CREATE TABLE vent_automation (
  drive_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vent_id uuid REFERENCES vents ON DELETE CASCADE,
  drive_type text NOT NULL,
  motor_model text,
  size integer NOT NULL,
  compatible_vent_types text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vent Structural Considerations Table
CREATE TABLE vent_structural (
  vent_structure_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vent_id uuid REFERENCES vents ON DELETE CASCADE,
  vent_load_rating text NOT NULL,
  structural_reinforcement text,
  gutter_partitions_needed integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glazing Company PC8 Table
CREATE TABLE glazing_companies_pc8 (
  company_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('PC8', 'CPC')),
  light_transmittance float NOT NULL,
  price_0_5000 float NOT NULL,
  price_5000_10000 float NOT NULL,
  price_10000_50000 float NOT NULL,
  price_50000_plus float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glazing Company Poly Table
CREATE TABLE glazing_companies_poly (
  company_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  type text NOT NULL,
  light_transmittance float NOT NULL,
  widths_available text[] NOT NULL,
  price_400lbs_less float NOT NULL,
  price_401_2000lbs float NOT NULL,
  price_2000lbs_plus float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glazing Material Selection Table
CREATE TABLE glazing_materials (
  glazing_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  glazing_type text NOT NULL CHECK (glazing_type IN ('PC8', 'CPC', 'Poly')),
  roof_glazing text NOT NULL CHECK (roof_glazing IN ('CPC', 'PC8', 'Poly')),
  sidewall_glazing text NOT NULL CHECK (sidewall_glazing IN ('CPC', 'PC8', 'Poly', 'Single Poly', 'Double Poly')),
  endwall_glazing text NOT NULL CHECK (endwall_glazing IN ('CPC', 'PC8', 'Poly', 'Single Poly', 'Double Poly')),
  gable_glazing text NOT NULL CHECK (gable_glazing IN ('CPC', 'PC8', 'Poly', 'Single Poly', 'Double Poly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glazing Panel Calculation Table
CREATE TABLE glazing_panel_calculations (
  panel_calc_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  roof_panel_count integer NOT NULL,
  roof_vent_panel_count integer NOT NULL,
  sidewall_panel_count integer NOT NULL,
  gutter_partition_panels integer NOT NULL,
  gable_endwall_panels integer NOT NULL,
  gable_only_panels integer NOT NULL,
  endwall_only_panels integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glazing Panel Sizes Table
CREATE TABLE glazing_panel_sizes (
  panel_size_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  glazing_id uuid REFERENCES glazing_materials ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN ('Roof', 'Roof Vent', 'Sidewall', 'Endwall', 'Gable', 'Gutter Partition')),
  material_type text NOT NULL CHECK (material_type IN ('PC8', 'CPC', 'Poly')),
  quantity integer NOT NULL,
  panel_length float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cooling Core Table
CREATE TABLE cooling_systems (
  cooling_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  fan_manufacturer text NOT NULL,
  exhaust_fan_model text NOT NULL,
  fan_size integer NOT NULL,
  horse_power float NOT NULL,
  cfm_05 float NOT NULL,
  cfm_10 float NOT NULL,
  cfm_15 float NOT NULL,
  distance_to_pad integer NOT NULL,
  elevation integer NOT NULL,
  max_light_intensity integer NOT NULL,
  pad_fan_temp_variation float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cooling Calculation Table
CREATE TABLE cooling_calculations (
  cooling_calc_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  cfm_per_sqft float NOT NULL CHECK (cfm_per_sqft BETWEEN 9 AND 12),
  width_ft integer NOT NULL,
  length_ft integer NOT NULL,
  cfm_basic float NOT NULL,
  cfm_total_short_distance float NOT NULL,
  cfm_total_other_houses float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cooling Factors Lookup Table
CREATE TABLE cooling_factors (
  factor_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  factor_type text NOT NULL CHECK (factor_type IN (
    'Pad to Fan Distance',
    'Elevation',
    'Light Intensity',
    'Temperature Variation'
  )),
  factor_value float NOT NULL
);

-- Cooling Equipment Table
CREATE TABLE cooling_equipment (
  equipment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  evaporative_pad_type text NOT NULL CHECK (evaporative_pad_type IN ('CELdek', 'KoolCel', 'Other')),
  pad_thickness float NOT NULL,
  pad_height float NOT NULL,
  pad_length float NOT NULL,
  pump_size float NOT NULL,
  distribution_pipe_size float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cooling Zone Table
CREATE TABLE cooling_zones (
  zone_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  zone_name text NOT NULL,
  zone_cfm float NOT NULL,
  zone_pad_size float NOT NULL,
  zone_fan_quantity integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Entry Cooling Table
CREATE TABLE cooling_user_entries (
  user_cooling_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  fantastic_quote text,
  elevation text NOT NULL,
  pressure_type text NOT NULL CHECK (pressure_type IN ('Negative', 'Positive')),
  ex_fans text NOT NULL,
  light_traps text,
  fan_mount text NOT NULL,
  ex_fan_screen_box text,
  screen_fan_box text,
  distribution_system text NOT NULL,
  pad_vent_dimensions text NOT NULL,
  pad_vent_drive text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Heating Core Table
CREATE TABLE heating_systems (
  heating_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  desired_temp integer NOT NULL,
  coldest_outside_temp integer NOT NULL,
  delta_t integer NOT NULL,
  btu_loss_roof float NOT NULL,
  btu_loss_roof_vent float,
  btu_loss_gables float NOT NULL,
  btu_loss_endwalls float NOT NULL,
  btu_loss_sidewalls float NOT NULL,
  total_btu_requirement_interior float NOT NULL,
  total_btu_requirement_exterior float NOT NULL,
  total_btu_requirement_single float NOT NULL,
  total_btu_requirement_quonset float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Heating Calculation Table
CREATE TABLE heating_calculations (
  heating_calc_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  delta_t integer NOT NULL,
  glazing_factor float NOT NULL,
  wind_factor float NOT NULL,
  elevation_factor float NOT NULL,
  exposed_surface_roof integer NOT NULL,
  exposed_surface_gables integer NOT NULL,
  exposed_surface_endwalls integer NOT NULL,
  exposed_surface_sidewalls integer NOT NULL,
  btu_loss_roof float NOT NULL,
  btu_loss_gables float NOT NULL,
  btu_loss_endwalls float NOT NULL,
  btu_loss_sidewalls float NOT NULL,
  total_btu float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Heating Factors Lookup Table
CREATE TABLE heating_factors (
  factor_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  factor_type text NOT NULL CHECK (factor_type IN ('Glazing', 'Wind', 'Elevation')),
  factor_value float NOT NULL
);

-- User Entry Heating Table
CREATE TABLE heating_user_entries (
  user_heating_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  fantastic_quote text,
  delta_t integer NOT NULL,
  gas_type text NOT NULL,
  elevation text NOT NULL,
  unit_heater_exterior text,
  unit_heater_interior text,
  hangers_exterior text,
  hangers_interior text,
  boiler_type text CHECK (boiler_type IN ('Perimeter', 'Under Bench', 'In Floor')),
  in_slab_on_slab_rows integer,
  horizontal_air_flow_fans integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Energy Curtain System Table
CREATE TABLE energy_curtains (
  curtain_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  structure_id uuid REFERENCES structures ON DELETE CASCADE,
  curtain_type text NOT NULL CHECK (curtain_type IN ('ES2 ATI Curtain', 'ES2-1212 Curtain')),
  house_size text NOT NULL CHECK (house_size IN (
    'SL18', 'SL24', 'SL30', 'SL36', 'SL42', 'SL48', 'SL50',
    'IN18', 'IN21', 'IN24', 'IN27', 'IN30', 'IN35',
    'CT40', 'CT42', 'NS30', 'NS24'
  )),
  es2_1212_type text CHECK (es2_1212_type IN ('Flat Blackout', 'Hi-Vent', 'Interior')),
  secondary_type text,
  drive_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Curtain Fabric Table
CREATE TABLE curtain_fabrics (
  fabric_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_name text NOT NULL,
  fabric_type text NOT NULL CHECK (fabric_type IN (
    'Insect Screen',
    'Ground Cover',
    'Weather Protection',
    'Horticultural Textiles'
  )),
  light_transmission float NOT NULL,
  shade_percentage float NOT NULL,
  price_0_5000 float NOT NULL,
  price_5000_10000 float NOT NULL,
  price_10000_50000 float NOT NULL,
  price_50000_plus float NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Energy Curtain Drive System Table
CREATE TABLE curtain_drives (
  drive_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_type text NOT NULL CHECK (drive_type IN ('Motorized', 'Manual')),
  compatible_curtain_types text[] NOT NULL,
  motor_specifications text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vents Drive Table (Modified to reference vent_types)
CREATE TABLE vent_drives (
  drive_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_type text NOT NULL CHECK (drive_type IN ('Motorized', 'Manual')),
  vent_type text REFERENCES vent_types(vent_type),
  vent_size integer NOT NULL,
  motor_specifications text,
  compatible_structures text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (vent_type, vent_size) REFERENCES vent_sizes(vent_type, vent_size)
);

-- Enable Row Level Security
ALTER TABLE structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE structure_user_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_glazing ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_structural ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_companies_pc8 ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_companies_poly ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_panel_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glazing_panel_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooling_user_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE heating_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE heating_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE heating_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE heating_user_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_curtains ENABLE ROW LEVEL SECURITY;
ALTER TABLE curtain_fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE curtain_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE vent_drives ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read their own data"
  ON structures
  FOR SELECT
  TO authenticated
  USING (auth.uid() = structure_id);