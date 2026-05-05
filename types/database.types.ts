export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_requests: {
        Row: {
          admin_comment: string | null
          created_at: string
          id: string
          patient_id: string
          preferred_date: string | null
          reason: string | null
          requested_department_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["appointment_request_status"]
          updated_at: string
        }
        Insert: {
          admin_comment?: string | null
          created_at?: string
          id?: string
          patient_id: string
          preferred_date?: string | null
          reason?: string | null
          requested_department_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["appointment_request_status"]
          updated_at?: string
        }
        Update: {
          admin_comment?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          preferred_date?: string | null
          reason?: string | null
          requested_department_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["appointment_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_requested_department_id_fkey"
            columns: ["requested_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department_id: string | null
          employee_code: string | null
          hire_date: string | null
          id: string
          job_title: string | null
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          employee_code?: string | null
          hire_date?: string | null
          id?: string
          job_title?: string | null
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          employee_code?: string | null
          hire_date?: string | null
          id?: string
          job_title?: string | null
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_order_items: {
        Row: {
          created_at: string
          entered_at: string | null
          entered_by: string | null
          id: string
          lab_order_id: string
          lab_test_id: string
          result_notes: string | null
          result_value: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["lab_result_status"]
          updated_at: string
          visible_to_patient: boolean
        }
        Insert: {
          created_at?: string
          entered_at?: string | null
          entered_by?: string | null
          id?: string
          lab_order_id: string
          lab_test_id: string
          result_notes?: string | null
          result_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["lab_result_status"]
          updated_at?: string
          visible_to_patient?: boolean
        }
        Update: {
          created_at?: string
          entered_at?: string | null
          entered_by?: string | null
          id?: string
          lab_order_id?: string
          lab_test_id?: string
          result_notes?: string | null
          result_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["lab_result_status"]
          updated_at?: string
          visible_to_patient?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lab_order_items_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_order_items_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_order_items_lab_test_id_fkey"
            columns: ["lab_test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_order_items_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          doctor_id: string
          doctor_notes: string | null
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["lab_order_status"]
          updated_at: string
          visit_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          doctor_id: string
          doctor_notes?: string | null
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["lab_order_status"]
          updated_at?: string
          visit_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          doctor_id?: string
          doctor_notes?: string | null
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["lab_order_status"]
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          normal_range: string | null
          status: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          normal_range?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          normal_range?: string | null
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          admin_comment: string | null
          created_at: string
          employee_profile_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_request_status"]
          updated_at: string
        }
        Insert: {
          admin_comment?: string | null
          created_at?: string
          employee_profile_id: string
          end_date: string
          id?: string
          leave_type: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_request_status"]
          updated_at?: string
        }
        Update: {
          admin_comment?: string | null
          created_at?: string
          employee_profile_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_profile_id_fkey"
            columns: ["employee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_batches: {
        Row: {
          batch_number: string | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          id: string
          manufacturer: string | null
          medicine_name_id: string
          quantity: number
          receipt_number: string | null
          status: Database["public"]["Enums"]["medicine_batch_status"]
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          manufacturer?: string | null
          medicine_name_id: string
          quantity?: number
          receipt_number?: string | null
          status?: Database["public"]["Enums"]["medicine_batch_status"]
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          manufacturer?: string | null
          medicine_name_id?: string
          quantity?: number
          receipt_number?: string | null
          status?: Database["public"]["Enums"]["medicine_batch_status"]
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_batches_medicine_name_id_fkey"
            columns: ["medicine_name_id"]
            isOneToOne: false
            referencedRelation: "medicine_names"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_names: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      medicine_order_items: {
        Row: {
          created_at: string
          dispensed_at: string | null
          dispensed_by: string | null
          dispensed_quantity: number
          dosage_instructions: string | null
          id: string
          medicine_name_id: string
          medicine_order_id: string
          requested_quantity: number
          status: Database["public"]["Enums"]["medicine_order_item_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          dispensed_quantity?: number
          dosage_instructions?: string | null
          id?: string
          medicine_name_id: string
          medicine_order_id: string
          requested_quantity: number
          status?: Database["public"]["Enums"]["medicine_order_item_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          dispensed_quantity?: number
          dosage_instructions?: string | null
          id?: string
          medicine_name_id?: string
          medicine_order_id?: string
          requested_quantity?: number
          status?: Database["public"]["Enums"]["medicine_order_item_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_order_items_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_order_items_medicine_name_id_fkey"
            columns: ["medicine_name_id"]
            isOneToOne: false
            referencedRelation: "medicine_names"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_order_items_medicine_order_id_fkey"
            columns: ["medicine_order_id"]
            isOneToOne: false
            referencedRelation: "medicine_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          doctor_id: string
          doctor_notes: string | null
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["medicine_order_status"]
          updated_at: string
          visit_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          doctor_id: string
          doctor_notes?: string | null
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["medicine_order_status"]
          updated_at?: string
          visit_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          doctor_id?: string
          doctor_notes?: string | null
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["medicine_order_status"]
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_orders_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          blood_type: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          dorm_info: string | null
          emergency_phone: string | null
          full_name: string
          gender: string | null
          id: string
          mrn: string | null
          nationality: string | null
          phone: string | null
          profile_id: string | null
          status: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          dorm_info?: string | null
          emergency_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          mrn?: string | null
          nationality?: string | null
          phone?: string | null
          profile_id?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          dorm_info?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          mrn?: string | null
          nationality?: string | null
          phone?: string | null
          profile_id?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          profile_photo_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      store_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_to: string
          created_at: string
          id: string
          notes: string | null
          quantity: number
          returned_at: string | null
          status: Database["public"]["Enums"]["store_assignment_status"]
          store_item_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity: number
          returned_at?: string | null
          status?: Database["public"]["Enums"]["store_assignment_status"]
          store_item_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          returned_at?: string | null
          status?: Database["public"]["Enums"]["store_assignment_status"]
          store_item_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_assignments_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      store_item_batches: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          quantity: number
          receipt_number: string | null
          store_item_id: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          quantity: number
          receipt_number?: string | null
          store_item_id: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          quantity?: number
          receipt_number?: string | null
          store_item_id?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_item_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_item_batches_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          manufacturer: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_requests: {
        Row: {
          admin_comment: string | null
          created_at: string
          id: string
          quantity: number
          reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["store_request_status"]
          store_item_id: string
          updated_at: string
        }
        Insert: {
          admin_comment?: string | null
          created_at?: string
          id?: string
          quantity: number
          reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["store_request_status"]
          store_item_id: string
          updated_at?: string
        }
        Update: {
          admin_comment?: string | null
          created_at?: string
          id?: string
          quantity?: number
          reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["store_request_status"]
          store_item_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_requests_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          chief_complaint: string | null
          completed_at: string | null
          created_at: string
          diagnosis: string | null
          disease: string | null
          doctor_id: string
          doctor_instructions: string | null
          id: string
          notes: string | null
          patient_id: string
          priority: Database["public"]["Enums"]["visit_priority"]
          reception_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["visit_status"]
          symptoms: string | null
          updated_at: string
          visit_code: string
        }
        Insert: {
          chief_complaint?: string | null
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          disease?: string | null
          doctor_id: string
          doctor_instructions?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          priority?: Database["public"]["Enums"]["visit_priority"]
          reception_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          symptoms?: string | null
          updated_at?: string
          visit_code: string
        }
        Update: {
          chief_complaint?: string | null
          completed_at?: string | null
          created_at?: string
          diagnosis?: string | null
          disease?: string | null
          doctor_id?: string
          doctor_instructions?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: Database["public"]["Enums"]["visit_priority"]
          reception_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          symptoms?: string | null
          updated_at?: string
          visit_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_patient: {
        Args: { target_patient_id: string }
        Returns: boolean
      }
      can_read_visit: { Args: { target_visit_id: string }; Returns: boolean }
      complete_visit: {
        Args: { actor: string; target_visit_id: string }
        Returns: Json
      }
      dispense_medicine_item: {
        Args: {
          actor: string
          quantity_to_dispense: number
          target_item_id: string
        }
        Returns: Json
      }
      generate_visit_code: { Args: never; Returns: string }
      get_available_medicine_stock: {
        Args: { target_medicine_name_id: string }
        Returns: number
      }
      get_available_store_stock: {
        Args: { target_store_item_id: string }
        Returns: number
      }
      get_current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_dashboard_counters: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      appointment_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "completed"
      lab_order_status:
        | "ordered"
        | "in_progress"
        | "pending_review"
        | "completed"
        | "cancelled"
      lab_result_status: "pending" | "entered" | "submitted" | "reviewed"
      leave_request_status: "pending" | "approved" | "rejected" | "cancelled"
      medicine_batch_status:
        | "in_stock"
        | "out_of_stock"
        | "expired"
        | "inactive"
      medicine_order_item_status:
        | "pending"
        | "dispensed"
        | "unavailable"
        | "cancelled"
      medicine_order_status:
        | "ordered"
        | "partially_dispensed"
        | "dispensed"
        | "cancelled"
      store_assignment_status: "assigned" | "returned" | "damaged" | "lost"
      store_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "fulfilled"
        | "cancelled"
      user_role:
        | "admin"
        | "reception"
        | "doctor"
        | "lab"
        | "pharmacy"
        | "patient"
      user_status: "active" | "inactive" | "suspended"
      visit_priority: "low" | "normal" | "high" | "urgent"
      visit_status:
        | "queued"
        | "in_progress"
        | "waiting_lab"
        | "lab_completed"
        | "waiting_pharmacy"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_request_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      lab_order_status: [
        "ordered",
        "in_progress",
        "pending_review",
        "completed",
        "cancelled",
      ],
      lab_result_status: ["pending", "entered", "submitted", "reviewed"],
      leave_request_status: ["pending", "approved", "rejected", "cancelled"],
      medicine_batch_status: [
        "in_stock",
        "out_of_stock",
        "expired",
        "inactive",
      ],
      medicine_order_item_status: [
        "pending",
        "dispensed",
        "unavailable",
        "cancelled",
      ],
      medicine_order_status: [
        "ordered",
        "partially_dispensed",
        "dispensed",
        "cancelled",
      ],
      store_assignment_status: ["assigned", "returned", "damaged", "lost"],
      store_request_status: [
        "pending",
        "approved",
        "rejected",
        "fulfilled",
        "cancelled",
      ],
      user_role: ["admin", "reception", "doctor", "lab", "pharmacy", "patient"],
      user_status: ["active", "inactive", "suspended"],
      visit_priority: ["low", "normal", "high", "urgent"],
      visit_status: [
        "queued",
        "in_progress",
        "waiting_lab",
        "lab_completed",
        "waiting_pharmacy",
        "completed",
        "cancelled",
      ],
    },
  },
} as const

