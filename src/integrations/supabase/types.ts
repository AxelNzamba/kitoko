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
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          label: string | null
          module: string | null
          record_id: string | null
          severity: string
          table_name: string | null
          user_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          label?: string | null
          module?: string | null
          record_id?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          label?: string | null
          module?: string | null
          record_id?: string | null
          severity?: string
          table_name?: string | null
          user_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json
          created_at: string
          id: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json
          created_at?: string
          id?: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string
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
      categories: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_debts: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          notes: string | null
          sale_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          notes?: string | null
          sale_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_debts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_debts_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          address: string | null
          company: string | null
          created_at: string
          credit_limit: number
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          address?: string | null
          company?: string | null
          created_at?: string
          credit_limit?: number
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          address?: string | null
          company?: string | null
          created_at?: string
          credit_limit?: number
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          client_name: string | null
          created_at: string | null
          created_by: string | null
          credit_number: string
          id: string
          reason: string
          sale_id: string | null
          total_ht: number
          total_ttc: number
          total_tva: number
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_number: string
          id?: string
          reason?: string
          sale_id?: string | null
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_number?: string
          id?: string
          reason?: string
          sale_id?: string | null
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      data_backups: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          row_count: number
          size_bytes: number
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          kind?: string
          row_count?: number
          size_bytes?: number
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          row_count?: number
          size_bytes?: number
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_by: string | null
          debt_id: string
          id: string
          method: string
          paid_at: string
        }
        Insert: {
          amount: number
          created_by?: string | null
          debt_id: string
          id?: string
          method?: string
          paid_at?: string
        }
        Update: {
          amount?: number
          created_by?: string | null
          debt_id?: string
          id?: string
          method?: string
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "client_debts"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          resolved: boolean
          source: string | null
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          resolved?: boolean
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          amount: number
          category: string
          created_at: string
          created_by: string | null
          expense_date: string
          id: string
          label: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          expense_date?: string
          id?: string
          label: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          expense_date?: string
          id?: string
          label?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hotel_charges: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string
          product_id: string | null
          quantity: number
          reservation_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          product_id?: string | null
          quantity?: number
          reservation_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          product_id?: string | null
          quantity?: number
          reservation_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotel_charges_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_charges_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "hotel_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_housekeeping: {
        Row: {
          assigned_to: string | null
          created_at: string
          done_at: string | null
          due_date: string
          id: string
          room_id: string
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          done_at?: string | null
          due_date?: string
          id?: string
          room_id: string
          status?: string
          task?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          done_at?: string | null
          due_date?: string
          id?: string
          room_id?: string
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_housekeeping_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_reservations: {
        Row: {
          adults: number
          check_in: string
          check_out: string
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          created_by: string | null
          deposit: number
          guest_email: string | null
          guest_id_doc: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          nightly_rate: number
          notes: string | null
          payment_mode: string | null
          reservation_number: string
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          adults?: number
          check_in: string
          check_out: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          created_by?: string | null
          deposit?: number
          guest_email?: string | null
          guest_id_doc?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          nightly_rate?: number
          notes?: string | null
          payment_mode?: string | null
          reservation_number?: string
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          adults?: number
          check_in?: string
          check_out?: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          created_by?: string | null
          deposit?: number
          guest_email?: string | null
          guest_id_doc?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          nightly_rate?: number
          notes?: string | null
          payment_mode?: string | null
          reservation_number?: string
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_room_types: {
        Row: {
          base_price: number
          capacity: number
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotel_rooms: {
        Row: {
          created_at: string
          floor: string | null
          id: string
          notes: string | null
          number: string
          price_override: number | null
          room_type_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor?: string | null
          id?: string
          notes?: string | null
          number: string
          price_override?: number | null
          room_type_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor?: string | null
          id?: string
          notes?: string | null
          number?: string
          price_override?: number | null
          room_type_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "hotel_room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_counts: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          counted_quantity: number
          created_at: string
          id: string
          location_id: string | null
          lot_id: string
          session_id: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          counted_quantity?: number
          created_at?: string
          id?: string
          location_id?: string | null
          lot_id: string
          session_id: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          counted_quantity?: number
          created_at?: string
          id?: string
          location_id?: string | null
          lot_id?: string
          session_id?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_counts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "inventory_counts_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock_by_warehouse"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "inventory_counts_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "inventory_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_sessions: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          closed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sessions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          certificate_url: string | null
          created_at: string
          id: string
          location_id: string | null
          lot_number: string
          notes: string | null
          product_id: string
          quantity: number
          reception_date: string
          supplier_id: string | null
          unit_purchase_price: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          certificate_url?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          lot_number: string
          notes?: string | null
          product_id: string
          quantity?: number
          reception_date?: string
          supplier_id?: string | null
          unit_purchase_price?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          certificate_url?: string | null
          created_at?: string
          id?: string
          location_id?: string | null
          lot_number?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reception_date?: string
          supplier_id?: string | null
          unit_purchase_price?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          barcode: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          photo_url: string | null
          purchase_price: number
          sale_price: number
          sku: string
          stock_min: number
          tva: number
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_url?: string | null
          purchase_price?: number
          sale_price?: number
          sku: string
          stock_min?: number
          tva?: number
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          purchase_price?: number
          sale_price?: number
          sku?: string
          stock_min?: number
          tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity_ordered?: number
          quantity_received?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["po_status"]
          supplier_id: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"]
          supplier_id?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          id: string
          lot_id: string | null
          product_id: string
          quantity: number
          sale_id: string
          tva: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          id?: string
          lot_id?: string | null
          product_id: string
          quantity: number
          sale_id: string
          tva?: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          id?: string
          lot_id?: string | null
          product_id?: string
          quantity?: number
          sale_id?: string
          tva?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "sale_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock_by_warehouse"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "sale_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          client_name: string | null
          created_at: string
          created_by: string | null
          id: string
          number: string
          payment_mode: string
          total_ht: number
          total_ttc: number
          total_tva: number
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          number: string
          payment_mode: string
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          client_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          number?: string
          payment_mode?: string
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string
        }
        Relationships: []
      }
      sav_intervention_serials: {
        Row: {
          created_at: string
          id: string
          intervention_id: string
          notes: string | null
          outcome: string
          serial_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intervention_id: string
          notes?: string | null
          outcome?: string
          serial_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intervention_id?: string
          notes?: string | null
          outcome?: string
          serial_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sav_intervention_serials_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "sav_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sav_intervention_serials_serial_id_fkey"
            columns: ["serial_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      sav_interventions: {
        Row: {
          cost: number
          created_at: string
          created_by: string | null
          description: string
          id: string
          intervention_date: string
          technician: string | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          intervention_date?: string
          technician?: string | null
          ticket_id: string
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          intervention_date?: string
          technician?: string | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sav_interventions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "sav_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      sav_tickets: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          product_id: string | null
          resolution: string | null
          serial_id: string | null
          status: Database["public"]["Enums"]["sav_status"]
          ticket_number: string
          type: Database["public"]["Enums"]["sav_type"]
          updated_at: string
          warranty_end: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          product_id?: string | null
          resolution?: string | null
          serial_id?: string | null
          status?: Database["public"]["Enums"]["sav_status"]
          ticket_number: string
          type?: Database["public"]["Enums"]["sav_type"]
          updated_at?: string
          warranty_end?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          product_id?: string | null
          resolution?: string | null
          serial_id?: string | null
          status?: Database["public"]["Enums"]["sav_status"]
          ticket_number?: string
          type?: Database["public"]["Enums"]["sav_type"]
          updated_at?: string
          warranty_end?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sav_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sav_tickets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sav_tickets_serial_id_fkey"
            columns: ["serial_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      serial_numbers: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          location_id: string | null
          lot_id: string
          notes: string | null
          product_id: string
          sale_id: string | null
          serial: string
          status: Database["public"]["Enums"]["serial_status"]
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          lot_id: string
          notes?: string | null
          product_id: string
          sale_id?: string | null
          serial: string
          status?: Database["public"]["Enums"]["serial_status"]
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          lot_id?: string
          notes?: string | null
          product_id?: string
          sale_id?: string | null
          serial?: string
          status?: Database["public"]["Enums"]["serial_status"]
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serial_numbers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "serial_numbers_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock_by_warehouse"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "serial_numbers_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_locations: {
        Row: {
          aisle: string | null
          bay: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: string | null
          name: string
          rack: string | null
          updated_at: string | null
          warehouse_id: string | null
          zone: string | null
        }
        Insert: {
          aisle?: string | null
          bay?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name: string
          rack?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          zone?: string | null
        }
        Update: {
          aisle?: string | null
          bay?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name?: string
          rack?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          created_at: string
          created_by: string | null
          id: string
          location_id: string | null
          lot_id: string | null
          product_id: string
          quantity: number
          reason: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_price: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          lot_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_price?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          lot_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          unit_price?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock_by_warehouse"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          created_at: string
          id: string
          lot_id: string | null
          product_id: string
          quantity: number
          quantity_received: number
          transfer_id: string
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          id?: string
          lot_id?: string | null
          product_id: string
          quantity?: number
          quantity_received?: number
          transfer_id: string
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          id?: string
          lot_id?: string | null
          product_id?: string
          quantity?: number
          quantity_received?: number
          transfer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "stock_transfer_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock_by_warehouse"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "stock_transfer_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          created_at: string
          created_by: string | null
          dest_warehouse_id: string | null
          id: string
          notes: string | null
          received_at: string | null
          received_by: string | null
          sent_at: string | null
          sent_by: string | null
          source_warehouse_id: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          transfer_number: string
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          created_by?: string | null
          dest_warehouse_id?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          received_by?: string | null
          sent_at?: string | null
          sent_by?: string | null
          source_warehouse_id?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          transfer_number: string
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          created_at?: string
          created_by?: string | null
          dest_warehouse_id?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          received_by?: string | null
          sent_at?: string | null
          sent_by?: string | null
          source_warehouse_id?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_dest_warehouse_id_fkey"
            columns: ["dest_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_source_warehouse_id_fkey"
            columns: ["source_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_returns: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          lot_id: string | null
          product_id: string | null
          quantity: number
          reason: string
          return_date: string
          return_number: string
          status: string
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lot_id?: string | null
          product_id?: string | null
          quantity: number
          reason?: string
          return_date?: string
          return_number: string
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lot_id?: string | null
          product_id?: string | null
          quantity?: number
          reason?: string
          return_date?: string
          return_number?: string
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_returns_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "supplier_returns_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lot_stock_by_warehouse"
            referencedColumns: ["lot_id"]
          },
          {
            foreignKeyName: "supplier_returns_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_returns_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          _client_id: string | null
          _deleted: boolean
          _field_versions: Json
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          _client_id?: string | null
          _deleted?: boolean
          _field_versions?: Json
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          label: string
          role: Database["public"]["Enums"]["app_role"] | null
          sort_order: number
          target: string
          type: string
          user_id: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          role?: Database["public"]["Enums"]["app_role"] | null
          sort_order?: number
          target: string
          type: string
          user_id: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          sort_order?: number
          target?: string
          type?: string
          user_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      audit_module_usage: {
        Row: {
          actions: number | null
          day: string | null
          module: string | null
          users: number | null
        }
        Relationships: []
      }
      lot_stock: {
        Row: {
          current_quantity: number | null
          delta: number | null
          initial_quantity: number | null
          lot_id: string | null
          lot_number: string | null
          product_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_stock_by_warehouse: {
        Row: {
          current_quantity: number | null
          lot_id: string | null
          product_id: string | null
          warehouse_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_credit_number: { Args: never; Returns: string }
      generate_po_number: { Args: never; Returns: string }
      generate_return_number: { Args: never; Returns: string }
      generate_sav_number: { Args: never; Returns: string }
      generate_transfer_number: { Args: never; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hotel_minibar_catalog: {
        Args: never
        Returns: {
          id: string
          name: string
          sale_price: number
        }[]
      }
      is_hotel_staff: { Args: { _uid: string }; Returns: boolean }
      run_data_backup: { Args: { _kind?: string }; Returns: string }
      set_staff_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "proprietaire" | "magasinier" | "caissier" | "receptionniste"
      movement_type: "entree" | "sortie" | "inventaire"
      po_status:
        | "brouillon"
        | "envoyee"
        | "partielle"
        | "receptionnee"
        | "annulee"
      sav_status: "ouvert" | "en_cours" | "resolu" | "refuse"
      sav_type: "garantie" | "retour" | "intervention"
      serial_status: "en_stock" | "vendu" | "retourne" | "sav" | "rebut"
      transfer_status: "brouillon" | "en_transit" | "recu" | "annule"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["proprietaire", "magasinier", "caissier", "receptionniste"],
      movement_type: ["entree", "sortie", "inventaire"],
      po_status: [
        "brouillon",
        "envoyee",
        "partielle",
        "receptionnee",
        "annulee",
      ],
      sav_status: ["ouvert", "en_cours", "resolu", "refuse"],
      sav_type: ["garantie", "retour", "intervention"],
      serial_status: ["en_stock", "vendu", "retourne", "sav", "rebut"],
      transfer_status: ["brouillon", "en_transit", "recu", "annule"],
    },
  },
} as const
