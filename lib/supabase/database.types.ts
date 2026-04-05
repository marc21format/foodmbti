export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          category_id: number;
          category_name: string;
          category_desc: string | null;
          created_at: string;
        };
        Insert: {
          category_id?: number;
          category_name: string;
          category_desc?: string | null;
          created_at?: string;
        };
        Update: {
          category_id?: number;
          category_name?: string;
          category_desc?: string | null;
          created_at?: string;
        };
      };
      cat_types: {
        Row: {
          cat_type_id: number;
          cat_type_name: string;
          category_id: number;
          created_at: string;
        };
        Insert: {
          cat_type_id?: number;
          cat_type_name: string;
          category_id: number;
          created_at?: string;
        };
        Update: {
          cat_type_id?: number;
          cat_type_name?: string;
          category_id?: number;
          created_at?: string;
        };
      };
      archetype_personas: {
        Row: {
          archetype_persona_id: number;
          archetype_name: string;
          archetype_desc: string | null;
          created_at: string;
        };
        Insert: {
          archetype_persona_id?: number;
          archetype_name: string;
          archetype_desc?: string | null;
          created_at?: string;
        };
        Update: {
          archetype_persona_id?: number;
          archetype_name?: string;
          archetype_desc?: string | null;
          created_at?: string;
        };
      };
      archetype_components: {
        Row: {
          archetype_component_id: number;
          cat_type_id: number;
          archetype_persona_id: number;
          created_at: string;
        };
        Insert: {
          archetype_component_id?: number;
          cat_type_id: number;
          archetype_persona_id: number;
          created_at?: string;
        };
        Update: {
          archetype_component_id?: number;
          cat_type_id?: number;
          archetype_persona_id?: number;
          created_at?: string;
        };
      };
      users: {
        Row: {
          user_id: number;
          user_name: string;
          user_password: string;
          created_at: string;
        };
        Insert: {
          user_id?: number;
          user_name: string;
          user_password: string;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          user_name?: string;
          user_password?: string;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          question_id: number;
          question_text: string;
          category_id: number;
          user_id: number;
          created_at: string;
        };
        Insert: {
          question_id?: number;
          question_text: string;
          category_id: number;
          user_id: number;
          created_at?: string;
        };
        Update: {
          question_id?: number;
          question_text?: string;
          category_id?: number;
          user_id?: number;
          created_at?: string;
        };
      };
      examinees: {
        Row: {
          examinee_id: number;
          examinee_name: string;
          created_at: string;
        };
        Insert: {
          examinee_id?: number;
          examinee_name: string;
          created_at?: string;
        };
        Update: {
          examinee_id?: number;
          examinee_name?: string;
          created_at?: string;
        };
      };
      answers: {
        Row: {
          answer_id: number;
          answer_value: number;
          examinee_id: number;
          question_id: number;
          created_at: string;
        };
        Insert: {
          answer_id?: number;
          answer_value: number;
          examinee_id: number;
          question_id: number;
          created_at?: string;
        };
        Update: {
          answer_id?: number;
          answer_value?: number;
          examinee_id?: number;
          question_id?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
