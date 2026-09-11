/**
 * Tipos do schema do Supabase.
 *
 * ARQUIVO GERADO — não edite à mão. Para atualizar depois de uma migration:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 *
 * Versão enxuta: mantém `Database` (o que o createClient consome) e o helper
 * `Tables<'nome'>`, que é o que a aplicação de fato usa.
 */

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { created_at: string; user_id: string }
        Insert: { created_at?: string; user_id: string }
        Update: { created_at?: string; user_id?: string }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string
          created_at: string
          id: string
          photo_url: string
          published: boolean
          sort_order: number
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          photo_url: string
          published?: boolean
          sort_order?: number
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          photo_url?: string
          published?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      menu_categories: {
        Row: { label: string; slug: string; sort_order: number }
        Insert: { label: string; slug: string; sort_order?: number }
        Update: { label?: string; slug?: string; sort_order?: number }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean
          bestseller: boolean
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          ingredients: string[]
          name: string
          photo_url: string | null
          price_cents: number
          sort_order: number
          tag: string | null
        }
        Insert: {
          available?: boolean
          bestseller?: boolean
          category: string
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          ingredients?: string[]
          name: string
          photo_url?: string | null
          price_cents: number
          sort_order?: number
          tag?: string | null
        }
        Update: {
          available?: boolean
          bestseller?: boolean
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          ingredients?: string[]
          name?: string
          photo_url?: string | null
          price_cents?: number
          sort_order?: number
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_fkey'
            columns: ['category']
            isOneToOne: false
            referencedRelation: 'menu_categories'
            referencedColumns: ['slug']
          },
        ]
      }
      opening_hours: {
        Row: { closed: boolean; closes: string; opens: string; weekday: number }
        Insert: { closed?: boolean; closes?: string; opens?: string; weekday: number }
        Update: { closed?: boolean; closes?: string; opens?: string; weekday?: number }
        Relationships: []
      }
      site_config: {
        Row: {
          accepts_orders: boolean
          address_city: string
          address_street: string
          allow_theme_toggle: boolean
          brand_color: string
          cover_photo_url: string | null
          default_theme: string
          delivery_fee_cents: number
          delivery_time: string
          description: string
          id: boolean
          instagram_url: string | null
          logo_url: string | null
          maps_url: string | null
          min_order_cents: number
          notice: string | null
          payment_methods: string[]
          phone: string
          restaurant_name: string
          show_bestsellers: boolean
          show_contact: boolean
          show_faq: boolean
          show_gallery: boolean
          show_highlights: boolean
          show_hours: boolean
          show_info_cards: boolean
          show_menu_search: boolean
          show_reviews: boolean
          show_status: boolean
          tagline: string
          timezone: string
          updated_at: string
          whatsapp_display: string
          whatsapp_number: string
        }
        Insert: {
          accepts_orders?: boolean
          address_city?: string
          address_street?: string
          allow_theme_toggle?: boolean
          brand_color?: string
          cover_photo_url?: string | null
          default_theme?: string
          delivery_fee_cents?: number
          delivery_time?: string
          description?: string
          id?: boolean
          instagram_url?: string | null
          logo_url?: string | null
          maps_url?: string | null
          min_order_cents?: number
          notice?: string | null
          payment_methods?: string[]
          phone?: string
          restaurant_name?: string
          show_bestsellers?: boolean
          show_contact?: boolean
          show_faq?: boolean
          show_gallery?: boolean
          show_highlights?: boolean
          show_hours?: boolean
          show_info_cards?: boolean
          show_menu_search?: boolean
          show_reviews?: boolean
          show_status?: boolean
          tagline?: string
          timezone?: string
          updated_at?: string
          whatsapp_display?: string
          whatsapp_number?: string
        }
        Update: {
          accepts_orders?: boolean
          address_city?: string
          address_street?: string
          allow_theme_toggle?: boolean
          brand_color?: string
          cover_photo_url?: string | null
          default_theme?: string
          delivery_fee_cents?: number
          delivery_time?: string
          description?: string
          id?: boolean
          instagram_url?: string | null
          logo_url?: string | null
          maps_url?: string | null
          min_order_cents?: number
          notice?: string | null
          payment_methods?: string[]
          phone?: string
          restaurant_name?: string
          show_bestsellers?: boolean
          show_contact?: boolean
          show_faq?: boolean
          show_gallery?: boolean
          show_highlights?: boolean
          show_hours?: boolean
          show_info_cards?: boolean
          show_menu_search?: boolean
          show_reviews?: boolean
          show_status?: boolean
          tagline?: string
          timezone?: string
          updated_at?: string
          whatsapp_display?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          comment: string
          created_at: string
          id: string
          published: boolean
          rating: number
          sort_order: number
        }
        Insert: {
          author: string
          comment: string
          created_at?: string
          id?: string
          published?: boolean
          rating?: number
          sort_order?: number
        }
        Update: {
          author?: string
          comment?: string
          created_at?: string
          id?: string
          published?: boolean
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
