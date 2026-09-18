export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          created_at: string | null;
          details: Json | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          source: string;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          details?: Json | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          source: string;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          details?: Json | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          source?: string;
        };
      };
      clients: {
        Row: {
          company: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          status: "active" | "inactive" | "lead" | null;
          updated_at: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: "active" | "inactive" | "lead" | null;
          updated_at?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: "active" | "inactive" | "lead" | null;
          updated_at?: string | null;
        };
      };
      documents: {
        Row: {
          client_id: string;
          created_at: string | null;
          id: string;
          number: string;
          project_id: string | null;
          template_data: Json;
          total_amount: number | null;
          type: "invoice" | "delivery";
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          id?: string;
          number: string;
          project_id?: string | null;
          template_data: Json;
          total_amount?: number | null;
          type: "invoice" | "delivery";
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          id?: string;
          number?: string;
          project_id?: string | null;
          template_data?: Json;
          total_amount?: number | null;
          type?: "invoice" | "delivery";
        };
      };
      projects: {
        Row: {
          budget: number | null;
          client_id: string;
          created_at: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          name: string;
          start_date: string | null;
          status: "pending" | "development" | "review" | "published" | "maintenance" | null;
          updated_at: string | null;
        };
        Insert: {
          budget?: number | null;
          client_id: string;
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          start_date?: string | null;
          status?: "pending" | "development" | "review" | "published" | "maintenance" | null;
          updated_at?: string | null;
        };
        Update: {
          budget?: number | null;
          client_id?: string;
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          start_date?: string | null;
          status?: "pending" | "development" | "review" | "published" | "maintenance" | null;
          updated_at?: string | null;
        };
      };
    };
    Enums: {
      client_status: "active" | "inactive" | "lead";
      document_type: "invoice" | "delivery";
      project_status: "pending" | "development" | "review" | "published" | "maintenance";
    };
  };
}
