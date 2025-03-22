export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      structures: {
        Row: {
          project_name: string | null
          description: string | null
          status: string
          project_name?: string | null
          description?: string | null
          status?: string
          structure_id: string
          model: string
          width: number
          spacing: number
          eave_height: number
          load_rating: string
          roof_glazing: 'CPC' | 'PC8' | 'Poly'
          elevation: string
          zones: number
          gutter_partitions: number
          gable_partitions: number
          structural_upgrades: string | null
          ranges: number
          houses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          structure_id?: string
          model: string
          width: number
          spacing: number
          eave_height: number
          load_rating: string
          roof_glazing: 'CPC' | 'PC8' | 'Poly'
          elevation: string
          zones: number
          gutter_partitions: number
          gable_partitions: number
          structural_upgrades?: string | null
          ranges?: number
          houses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          structure_id?: string
          model?: string
          width?: number
          spacing?: number
          eave_height?: number
          load_rating?: string
          roof_glazing?: 'CPC' | 'PC8' | 'Poly'
          elevation?: string
          zones?: number
          gutter_partitions?: number
          gable_partitions?: number
          structural_upgrades?: string | null
          ranges?: number
          houses?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}