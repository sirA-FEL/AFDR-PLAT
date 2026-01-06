// Types générés depuis Supabase
// Ces types seront générés automatiquement avec supabase gen types typescript
// Pour l'instant, définissons les types de base

export interface Database {
  public: {
    Tables: {
      profils: {
        Row: {
          id: string
          email: string
          nom: string
          prenom: string | null
          photo: string | null
          departement: string | null
          poste: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nom: string
          prenom?: string | null
          photo?: string | null
          departement?: string | null
          poste?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string
          prenom?: string | null
          photo?: string | null
          departement?: string | null
          poste?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Ajouter d'autres tables selon les besoins
    }
  }
}


