export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cooling_calculations: {
        Row: {
          cfm_basic: number
          cfm_per_sqft: number
          cfm_total_other_houses: number
          cfm_total_short_distance: number
          cooling_calc_id: string
          created_at: string | null
          length_ft: number
          structure_id: string | null
          updated_at: string | null
          width_ft: number
        }
        Insert: {
          cfm_basic: number
          cfm_per_sqft: number
          cfm_total_other_houses: number
          cfm_total_short_distance: number
          cooling_calc_id?: string
          created_at?: string | null
          length_ft: number
          structure_id?: string | null
          updated_at?: string | null
          width_ft: number
        }
        Update: {
          cfm_basic?: number
          cfm_per_sqft?: number
          cfm_total_other_houses?: number
          cfm_total_short_distance?: number
          cooling_calc_id?: string
          created_at?: string | null
          length_ft?: number
          structure_id?: string | null
          updated_at?: string | null
          width_ft?: number
        }
        Relationships: [
          {
            foreignKeyName: "cooling_calculations_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      cooling_equipment: {
        Row: {
          created_at: string | null
          distribution_pipe_size: number
          equipment_id: string
          evaporative_pad_type: string
          pad_height: number
          pad_length: number
          pad_thickness: number
          pump_size: number
          structure_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          distribution_pipe_size: number
          equipment_id?: string
          evaporative_pad_type: string
          pad_height: number
          pad_length: number
          pad_thickness: number
          pump_size: number
          structure_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          distribution_pipe_size?: number
          equipment_id?: string
          evaporative_pad_type?: string
          pad_height?: number
          pad_length?: number
          pad_thickness?: number
          pump_size?: number
          structure_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooling_equipment_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      cooling_factors: {
        Row: {
          factor_id: string
          factor_type: string
          factor_value: number
        }
        Insert: {
          factor_id?: string
          factor_type: string
          factor_value: number
        }
        Update: {
          factor_id?: string
          factor_type?: string
          factor_value?: number
        }
        Relationships: []
      }
      cooling_systems: {
        Row: {
          cfm_05: number
          cfm_10: number
          cfm_15: number
          cooling_id: string
          created_at: string | null
          distance_to_pad: number
          elevation: number
          exhaust_fan_model: string
          fan_manufacturer: string
          fan_size: number
          horse_power: number
          max_light_intensity: number
          pad_fan_temp_variation: number
          structure_id: string | null
          updated_at: string | null
        }
        Insert: {
          cfm_05: number
          cfm_10: number
          cfm_15: number
          cooling_id?: string
          created_at?: string | null
          distance_to_pad: number
          elevation: number
          exhaust_fan_model: string
          fan_manufacturer: string
          fan_size: number
          horse_power: number
          max_light_intensity: number
          pad_fan_temp_variation: number
          structure_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cfm_05?: number
          cfm_10?: number
          cfm_15?: number
          cooling_id?: string
          created_at?: string | null
          distance_to_pad?: number
          elevation?: number
          exhaust_fan_model?: string
          fan_manufacturer?: string
          fan_size?: number
          horse_power?: number
          max_light_intensity?: number
          pad_fan_temp_variation?: number
          structure_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooling_systems_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      cooling_user_entries: {
        Row: {
          created_at: string | null
          distribution_system: string
          elevation: string
          ex_fan_screen_box: string | null
          ex_fans: string
          fan_mount: string
          fantastic_quote: string | null
          light_traps: string | null
          pad_vent_dimensions: string
          pad_vent_drive: string
          pressure_type: string
          screen_fan_box: string | null
          structure_id: string | null
          updated_at: string | null
          user_cooling_id: string
        }
        Insert: {
          created_at?: string | null
          distribution_system: string
          elevation: string
          ex_fan_screen_box?: string | null
          ex_fans: string
          fan_mount: string
          fantastic_quote?: string | null
          light_traps?: string | null
          pad_vent_dimensions: string
          pad_vent_drive: string
          pressure_type: string
          screen_fan_box?: string | null
          structure_id?: string | null
          updated_at?: string | null
          user_cooling_id?: string
        }
        Update: {
          created_at?: string | null
          distribution_system?: string
          elevation?: string
          ex_fan_screen_box?: string | null
          ex_fans?: string
          fan_mount?: string
          fantastic_quote?: string | null
          light_traps?: string | null
          pad_vent_dimensions?: string
          pad_vent_drive?: string
          pressure_type?: string
          screen_fan_box?: string | null
          structure_id?: string | null
          updated_at?: string | null
          user_cooling_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooling_user_entries_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      cooling_zones: {
        Row: {
          created_at: string | null
          structure_id: string | null
          updated_at: string | null
          zone_cfm: number
          zone_fan_quantity: number
          zone_id: string
          zone_name: string
          zone_pad_size: number
        }
        Insert: {
          created_at?: string | null
          structure_id?: string | null
          updated_at?: string | null
          zone_cfm: number
          zone_fan_quantity: number
          zone_id?: string
          zone_name: string
          zone_pad_size: number
        }
        Update: {
          created_at?: string | null
          structure_id?: string | null
          updated_at?: string | null
          zone_cfm?: number
          zone_fan_quantity?: number
          zone_id?: string
          zone_name?: string
          zone_pad_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "cooling_zones_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      curtain_drives: {
        Row: {
          compatible_curtain_types: string[]
          created_at: string | null
          drive_id: string
          drive_type: string
          motor_specifications: string | null
          updated_at: string | null
        }
        Insert: {
          compatible_curtain_types: string[]
          created_at?: string | null
          drive_id?: string
          drive_type: string
          motor_specifications?: string | null
          updated_at?: string | null
        }
        Update: {
          compatible_curtain_types?: string[]
          created_at?: string | null
          drive_id?: string
          drive_type?: string
          motor_specifications?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      curtain_fabrics: {
        Row: {
          created_at: string | null
          energy_savings: number
          fabric_id: string
          fabric_name: string
          fabric_type: string
          price_0_5000: number
          price_20000_plus: number
          price_5000_20000: number
          shade_percentage: number
          updated_at: string | null
          ventilation_reduction: number
          width_size: number[]
        }
        Insert: {
          created_at?: string | null
          energy_savings: number
          fabric_id?: string
          fabric_name: string
          fabric_type: string
          price_0_5000: number
          price_20000_plus: number
          price_5000_20000: number
          shade_percentage: number
          updated_at?: string | null
          ventilation_reduction: number
          width_size?: number[]
        }
        Update: {
          created_at?: string | null
          energy_savings?: number
          fabric_id?: string
          fabric_name?: string
          fabric_type?: string
          price_0_5000?: number
          price_20000_plus?: number
          price_5000_20000?: number
          shade_percentage?: number
          updated_at?: string | null
          ventilation_reduction?: number
          width_size?: number[]
        }
        Relationships: []
      }
      drop_walls: {
        Row: {
          additional_corner_pockets: number | null
          ati_house: string | null
          braking_winch_with_mount: number | null
          created_at: string | null
          drive_type: string
          drop_wall_id: string
          motor_model: string | null
          notes: string | null
          ns30: string | null
          quantity: number
          spacing: string | null
          structure_id: string | null
          type: string
          updated_at: string | null
          wall_height: number
          wall_length: number
        }
        Insert: {
          additional_corner_pockets?: number | null
          ati_house?: string | null
          braking_winch_with_mount?: number | null
          created_at?: string | null
          drive_type: string
          drop_wall_id?: string
          motor_model?: string | null
          notes?: string | null
          ns30?: string | null
          quantity?: number
          spacing?: string | null
          structure_id?: string | null
          type: string
          updated_at?: string | null
          wall_height: number
          wall_length: number
        }
        Update: {
          additional_corner_pockets?: number | null
          ati_house?: string | null
          braking_winch_with_mount?: number | null
          created_at?: string | null
          drive_type?: string
          drop_wall_id?: string
          motor_model?: string | null
          notes?: string | null
          ns30?: string | null
          quantity?: number
          spacing?: string | null
          structure_id?: string | null
          type?: string
          updated_at?: string | null
          wall_height?: number
          wall_length?: number
        }
        Relationships: [
          {
            foreignKeyName: "drop_walls_new_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structure_user_entries"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      energy_curtains: {
        Row: {
          created_at: string | null
          curtain_id: string
          curtain_type: string
          drive_id: string | null
          es2_1212_type: string | null
          house_size: string
          secondary_type: string | null
          structure_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curtain_id?: string
          curtain_type: string
          drive_id?: string | null
          es2_1212_type?: string | null
          house_size: string
          secondary_type?: string | null
          structure_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curtain_id?: string
          curtain_type?: string
          drive_id?: string | null
          es2_1212_type?: string | null
          house_size?: string
          secondary_type?: string | null
          structure_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "energy_curtains_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      glazing_companies_pc8: {
        Row: {
          company_id: string
          company_name: string
          created_at: string | null
          light_diffusion: number
          light_transmittance: number
          price_0_5000: number
          price_10000_50000: number
          price_5000_10000: number
          price_50000_plus: number
          product: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string
          company_name: string
          created_at?: string | null
          light_diffusion?: number
          light_transmittance: number
          price_0_5000: number
          price_10000_50000: number
          price_5000_10000: number
          price_50000_plus: number
          product?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          company_name?: string
          created_at?: string | null
          light_diffusion?: number
          light_transmittance?: number
          price_0_5000?: number
          price_10000_50000?: number
          price_5000_10000?: number
          price_50000_plus?: number
          product?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      glazing_companies_poly: {
        Row: {
          company_id: string
          company_name: string
          created_at: string | null
          light_diffusion: number
          light_transmittance: number
          price_2000lbs_plus: number
          price_400lbs_less: number
          price_401_2000lbs: number
          type: string
          updated_at: string | null
          widths_available: string[]
        }
        Insert: {
          company_id?: string
          company_name: string
          created_at?: string | null
          light_diffusion?: number
          light_transmittance: number
          price_2000lbs_plus: number
          price_400lbs_less: number
          price_401_2000lbs: number
          type: string
          updated_at?: string | null
          widths_available: string[]
        }
        Update: {
          company_id?: string
          company_name?: string
          created_at?: string | null
          light_diffusion?: number
          light_transmittance?: number
          price_2000lbs_plus?: number
          price_400lbs_less?: number
          price_401_2000lbs?: number
          type?: string
          updated_at?: string | null
          widths_available?: string[]
        }
        Relationships: []
      }
      glazing_materials: {
        Row: {
          created_at: string | null
          endwall_glazing: string
          gable_glazing: string
          glazing_id: string
          glazing_type: string
          roof_glazing: string
          sidewall_glazing: string
          structure_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          endwall_glazing: string
          gable_glazing: string
          glazing_id?: string
          glazing_type: string
          roof_glazing: string
          sidewall_glazing: string
          structure_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          endwall_glazing?: string
          gable_glazing?: string
          glazing_id?: string
          glazing_type?: string
          roof_glazing?: string
          sidewall_glazing?: string
          structure_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glazing_materials_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      glazing_panel_calculations: {
        Row: {
          created_at: string | null
          endwall_only_panels: number
          gable_endwall_panels: number
          gable_only_panels: number
          gutter_partition_panels: number
          panel_calc_id: string
          roof_panel_count: number
          roof_vent_panel_count: number
          sidewall_panel_count: number
          structure_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          endwall_only_panels: number
          gable_endwall_panels: number
          gable_only_panels: number
          gutter_partition_panels: number
          panel_calc_id?: string
          roof_panel_count: number
          roof_vent_panel_count: number
          sidewall_panel_count: number
          structure_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          endwall_only_panels?: number
          gable_endwall_panels?: number
          gable_only_panels?: number
          gutter_partition_panels?: number
          panel_calc_id?: string
          roof_panel_count?: number
          roof_vent_panel_count?: number
          sidewall_panel_count?: number
          structure_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glazing_panel_calculations_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      glazing_panel_sizes: {
        Row: {
          created_at: string | null
          glazing_id: string | null
          material_type: string
          panel_length: number
          panel_size_id: string
          quantity: number
          section: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          glazing_id?: string | null
          material_type: string
          panel_length: number
          panel_size_id?: string
          quantity: number
          section: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          glazing_id?: string | null
          material_type?: string
          panel_length?: number
          panel_size_id?: string
          quantity?: number
          section?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glazing_panel_sizes_glazing_id_fkey"
            columns: ["glazing_id"]
            isOneToOne: false
            referencedRelation: "glazing_materials"
            referencedColumns: ["glazing_id"]
          },
        ]
      }
      heating_calculations: {
        Row: {
          btu_loss_endwalls: number
          btu_loss_gables: number
          btu_loss_roof: number
          btu_loss_sidewalls: number
          created_at: string | null
          delta_t: number
          elevation_factor: number
          exposed_surface_endwalls: number
          exposed_surface_gables: number
          exposed_surface_roof: number
          exposed_surface_sidewalls: number
          glazing_factor: number
          heating_calc_id: string
          structure_id: string | null
          total_btu: number
          updated_at: string | null
          wind_factor: number
        }
        Insert: {
          btu_loss_endwalls: number
          btu_loss_gables: number
          btu_loss_roof: number
          btu_loss_sidewalls: number
          created_at?: string | null
          delta_t: number
          elevation_factor: number
          exposed_surface_endwalls: number
          exposed_surface_gables: number
          exposed_surface_roof: number
          exposed_surface_sidewalls: number
          glazing_factor: number
          heating_calc_id?: string
          structure_id?: string | null
          total_btu: number
          updated_at?: string | null
          wind_factor: number
        }
        Update: {
          btu_loss_endwalls?: number
          btu_loss_gables?: number
          btu_loss_roof?: number
          btu_loss_sidewalls?: number
          created_at?: string | null
          delta_t?: number
          elevation_factor?: number
          exposed_surface_endwalls?: number
          exposed_surface_gables?: number
          exposed_surface_roof?: number
          exposed_surface_sidewalls?: number
          glazing_factor?: number
          heating_calc_id?: string
          structure_id?: string | null
          total_btu?: number
          updated_at?: string | null
          wind_factor?: number
        }
        Relationships: [
          {
            foreignKeyName: "heating_calculations_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      heating_factors: {
        Row: {
          factor_id: string
          factor_type: string
          factor_value: number
        }
        Insert: {
          factor_id?: string
          factor_type: string
          factor_value: number
        }
        Update: {
          factor_id?: string
          factor_type?: string
          factor_value?: number
        }
        Relationships: []
      }
      heating_systems: {
        Row: {
          btu_loss_endwalls: number
          btu_loss_gables: number
          btu_loss_roof: number
          btu_loss_roof_vent: number | null
          btu_loss_sidewalls: number
          coldest_outside_temp: number
          created_at: string | null
          delta_t: number
          desired_temp: number
          heating_id: string
          structure_id: string | null
          total_btu_requirement_exterior: number
          total_btu_requirement_interior: number
          total_btu_requirement_quonset: number
          total_btu_requirement_single: number
          updated_at: string | null
        }
        Insert: {
          btu_loss_endwalls: number
          btu_loss_gables: number
          btu_loss_roof: number
          btu_loss_roof_vent?: number | null
          btu_loss_sidewalls: number
          coldest_outside_temp: number
          created_at?: string | null
          delta_t: number
          desired_temp: number
          heating_id?: string
          structure_id?: string | null
          total_btu_requirement_exterior: number
          total_btu_requirement_interior: number
          total_btu_requirement_quonset: number
          total_btu_requirement_single: number
          updated_at?: string | null
        }
        Update: {
          btu_loss_endwalls?: number
          btu_loss_gables?: number
          btu_loss_roof?: number
          btu_loss_roof_vent?: number | null
          btu_loss_sidewalls?: number
          coldest_outside_temp?: number
          created_at?: string | null
          delta_t?: number
          desired_temp?: number
          heating_id?: string
          structure_id?: string | null
          total_btu_requirement_exterior?: number
          total_btu_requirement_interior?: number
          total_btu_requirement_quonset?: number
          total_btu_requirement_single?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heating_systems_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      heating_user_entries: {
        Row: {
          boiler_type: string | null
          created_at: string | null
          delta_t: number
          elevation: string
          fantastic_quote: string | null
          gas_type: string
          hangers_exterior: string | null
          hangers_interior: string | null
          horizontal_air_flow_fans: number
          in_slab_on_slab_rows: number | null
          structure_id: string | null
          unit_heater_exterior: string | null
          unit_heater_interior: string | null
          updated_at: string | null
          user_heating_id: string
        }
        Insert: {
          boiler_type?: string | null
          created_at?: string | null
          delta_t: number
          elevation: string
          fantastic_quote?: string | null
          gas_type: string
          hangers_exterior?: string | null
          hangers_interior?: string | null
          horizontal_air_flow_fans: number
          in_slab_on_slab_rows?: number | null
          structure_id?: string | null
          unit_heater_exterior?: string | null
          unit_heater_interior?: string | null
          updated_at?: string | null
          user_heating_id?: string
        }
        Update: {
          boiler_type?: string | null
          created_at?: string | null
          delta_t?: number
          elevation?: string
          fantastic_quote?: string | null
          gas_type?: string
          hangers_exterior?: string | null
          hangers_interior?: string | null
          horizontal_air_flow_fans?: number
          in_slab_on_slab_rows?: number | null
          structure_id?: string | null
          unit_heater_exterior?: string | null
          unit_heater_interior?: string | null
          updated_at?: string | null
          user_heating_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heating_user_entries_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_shares: {
        Row: {
          created_at: string | null
          permission: string
          project_id: string | null
          share_id: string
          shared_with: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          permission: string
          project_id?: string | null
          share_id?: string
          shared_with?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          permission?: string
          project_id?: string | null
          share_id?: string
          shared_with?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "structure_user_entries"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      rollup_drop_drives: {
        Row: {
          compatible_structures: string[]
          created_at: string | null
          drive_id: string
          drive_type: string
          max_length: number
          motor_model: string | null
          updated_at: string | null
          wall_type: string
        }
        Insert: {
          compatible_structures: string[]
          created_at?: string | null
          drive_id?: string
          drive_type: string
          max_length: number
          motor_model?: string | null
          updated_at?: string | null
          wall_type: string
        }
        Update: {
          compatible_structures?: string[]
          created_at?: string | null
          drive_id?: string
          drive_type?: string
          max_length?: number
          motor_model?: string | null
          updated_at?: string | null
          wall_type?: string
        }
        Relationships: []
      }
      rollup_walls: {
        Row: {
          created_at: string | null
          drive_id: string | null
          drive_type: string
          frame_height: number | null
          gearbox_pocket: number | null
          house_width: number | null
          houses_wide_per_system: number
          motor_model: string | null
          notes: string | null
          ns30: string
          quantity: number
          ridder_mount_guttered: number | null
          ridder_mount_quonset: number | null
          rollup_wall_id: string
          simu_winch: number | null
          spacing: string
          structure_id: string | null
          type: string
          updated_at: string | null
          wall_height: number
          wall_length: number
          wall_location: string
        }
        Insert: {
          created_at?: string | null
          drive_id?: string | null
          drive_type: string
          frame_height?: number | null
          gearbox_pocket?: number | null
          house_width?: number | null
          houses_wide_per_system?: number
          motor_model?: string | null
          notes?: string | null
          ns30?: string
          quantity?: number
          ridder_mount_guttered?: number | null
          ridder_mount_quonset?: number | null
          rollup_wall_id?: string
          simu_winch?: number | null
          spacing?: string
          structure_id?: string | null
          type: string
          updated_at?: string | null
          wall_height: number
          wall_length: number
          wall_location: string
        }
        Update: {
          created_at?: string | null
          drive_id?: string | null
          drive_type?: string
          frame_height?: number | null
          gearbox_pocket?: number | null
          house_width?: number | null
          houses_wide_per_system?: number
          motor_model?: string | null
          notes?: string | null
          ns30?: string
          quantity?: number
          ridder_mount_guttered?: number | null
          ridder_mount_quonset?: number | null
          rollup_wall_id?: string
          simu_winch?: number | null
          spacing?: string
          structure_id?: string | null
          type?: string
          updated_at?: string | null
          wall_height?: number
          wall_length?: number
          wall_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "rollup_walls_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "rollup_drop_drives"
            referencedColumns: ["drive_id"]
          },
          {
            foreignKeyName: "rollup_walls_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structure_user_entries"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      structure_user_entries: {
        Row: {
          covering_endwalls: string
          covering_gables: string
          covering_roof: string
          covering_sidewalls: string
          created_at: string | null
          description: string | null
          eave_height: number
          elevation: string
          entry_id: string
          gable_partitions: number
          gutter_partitions: number
          houses: number | null
          length_ft: number
          project_name: string | null
          ranges: number | null
          roof_glazing: string
          status: string | null
          structural_upgrades: string | null
          structure_id: string | null
          updated_at: string | null
          user_id: string
          width_ft: number
          zones: number
        }
        Insert: {
          covering_endwalls: string
          covering_gables: string
          covering_roof: string
          covering_sidewalls: string
          created_at?: string | null
          description?: string | null
          eave_height: number
          elevation: string
          entry_id?: string
          gable_partitions: number
          gutter_partitions: number
          houses?: number | null
          length_ft: number
          project_name?: string | null
          ranges?: number | null
          roof_glazing: string
          status?: string | null
          structural_upgrades?: string | null
          structure_id?: string | null
          updated_at?: string | null
          user_id: string
          width_ft: number
          zones: number
        }
        Update: {
          covering_endwalls?: string
          covering_gables?: string
          covering_roof?: string
          covering_sidewalls?: string
          created_at?: string | null
          description?: string | null
          eave_height?: number
          elevation?: string
          entry_id?: string
          gable_partitions?: number
          gutter_partitions?: number
          houses?: number | null
          length_ft?: number
          project_name?: string | null
          ranges?: number | null
          roof_glazing?: string
          status?: string | null
          structural_upgrades?: string | null
          structure_id?: string | null
          updated_at?: string | null
          user_id?: string
          width_ft?: number
          zones?: number
        }
        Relationships: [
          {
            foreignKeyName: "structure_user_entries_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["structure_id"]
          },
        ]
      }
      structures: {
        Row: {
          covering_endwalls: string | null
          covering_gables: string | null
          covering_roof: string | null
          covering_sidewalls: string | null
          created_at: string | null
          description: string | null
          eave_height: number
          elevation: string
          gable_partitions: number
          gutter_partitions: number
          houses: number | null
          load_rating: string
          model: string
          project_name: string | null
          ranges: number | null
          roof_glazing: string
          spacing: number
          status: string | null
          structural_upgrades: string | null
          structure_id: string
          updated_at: string | null
          width: number
          zones: number
        }
        Insert: {
          covering_endwalls?: string | null
          covering_gables?: string | null
          covering_roof?: string | null
          covering_sidewalls?: string | null
          created_at?: string | null
          description?: string | null
          eave_height: number
          elevation: string
          gable_partitions: number
          gutter_partitions: number
          houses?: number | null
          load_rating: string
          model: string
          project_name?: string | null
          ranges?: number | null
          roof_glazing: string
          spacing: number
          status?: string | null
          structural_upgrades?: string | null
          structure_id?: string
          updated_at?: string | null
          width: number
          zones: number
        }
        Update: {
          covering_endwalls?: string | null
          covering_gables?: string | null
          covering_roof?: string | null
          covering_sidewalls?: string | null
          created_at?: string | null
          description?: string | null
          eave_height?: number
          elevation?: string
          gable_partitions?: number
          gutter_partitions?: number
          houses?: number | null
          load_rating?: string
          model?: string
          project_name?: string | null
          ranges?: number | null
          roof_glazing?: string
          spacing?: number
          status?: string | null
          structural_upgrades?: string | null
          structure_id?: string
          updated_at?: string | null
          width?: number
          zones?: number
        }
        Relationships: []
      }
      vent_drives: {
        Row: {
          compatible_structures: string[]
          created_at: string | null
          drive_id: string
          drive_type: string
          max_length: number
          motor_specifications: string | null
          updated_at: string | null
          vent_size: number
          vent_type: string
        }
        Insert: {
          compatible_structures: string[]
          created_at?: string | null
          drive_id?: string
          drive_type: string
          max_length?: number
          motor_specifications?: string | null
          updated_at?: string | null
          vent_size: number
          vent_type: string
        }
        Update: {
          compatible_structures?: string[]
          created_at?: string | null
          drive_id?: string
          drive_type?: string
          max_length?: number
          motor_specifications?: string | null
          updated_at?: string | null
          vent_size?: number
          vent_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vent_drives_vent_type_fkey"
            columns: ["vent_type"]
            isOneToOne: false
            referencedRelation: "vent_types"
            referencedColumns: ["vent_type"]
          },
        ]
      }
      vent_insect_screen: {
        Row: {
          created_at: string | null
          length: number
          notes: string | null
          quantity: number
          screen_id: string
          type: string
          updated_at: string | null
          vent_id: string | null
        }
        Insert: {
          created_at?: string | null
          length: number
          notes?: string | null
          quantity: number
          screen_id?: string
          type: string
          updated_at?: string | null
          vent_id?: string | null
        }
        Update: {
          created_at?: string | null
          length?: number
          notes?: string | null
          quantity?: number
          screen_id?: string
          type?: string
          updated_at?: string | null
          vent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vent_insect_screen_vent_id_fkey"
            columns: ["vent_id"]
            isOneToOne: false
            referencedRelation: "vents"
            referencedColumns: ["vent_id"]
          },
        ]
      }
      vent_types: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          updated_at: string | null
          vent_type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order: number
          updated_at?: string | null
          vent_type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          updated_at?: string | null
          vent_type?: string
        }
        Relationships: []
      }
      vents: {
        Row: {
          ati_house: string
          created_at: string | null
          drive_id: string | null
          notes: string | null
          single_double: string
          structure_id: string | null
          updated_at: string | null
          vent_id: string
          vent_length: number
          vent_quantity: number
          vent_size: number
          vent_type: string | null
        }
        Insert: {
          ati_house: string
          created_at?: string | null
          drive_id?: string | null
          notes?: string | null
          single_double: string
          structure_id?: string | null
          updated_at?: string | null
          vent_id?: string
          vent_length: number
          vent_quantity: number
          vent_size: number
          vent_type?: string | null
        }
        Update: {
          ati_house?: string
          created_at?: string | null
          drive_id?: string | null
          notes?: string | null
          single_double?: string
          structure_id?: string | null
          updated_at?: string | null
          vent_id?: string
          vent_length?: number
          vent_quantity?: number
          vent_size?: number
          vent_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vents_drive_id_fkey"
            columns: ["drive_id"]
            isOneToOne: false
            referencedRelation: "vent_drives"
            referencedColumns: ["drive_id"]
          },
          {
            foreignKeyName: "vents_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structure_user_entries"
            referencedColumns: ["entry_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_first_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_project_access: {
        Args: {
          project_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

