import { createClient } from "../client"

export interface Projet {
  id: string
  nom: string
  code_projet: string
  objectifs?: string
  zones_intervention?: string
  date_debut: string
  date_fin: string
  budget_total: number
  id_responsable: string
  date_creation: string
  date_modification?: string
}

export const projetsService = {
  // Créer un projet
  async create(data: Omit<Projet, "id" | "date_creation" | "code_projet"> & { code_projet?: string }) {
    const supabase = createClient()

    // Générer le code projet si non fourni
    const codeProjet = data.code_projet || this.generateCodeProjet(data.nom)

    const { data: projet, error } = await supabase
      .from("projets")
      .insert({
        ...data,
        code_projet: codeProjet,
      })
      .select()
      .single()

    if (error) throw error
    return projet as Projet
  },

  // Générer un code projet automatique
  generateCodeProjet(nom: string): string {
    const prefix = "PROJ"
    const code = nom
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 8)
    const timestamp = Date.now().toString().slice(-6)
    return code.length >= 3 ? `${code}-${timestamp}` : `${prefix}-${timestamp}`
  },

  // Récupérer tous les projets
  async getAll(filters?: { id_responsable?: string }) {
    const supabase = createClient()
    let query = supabase.from("projets").select("*")

    if (filters?.id_responsable) {
      query = query.eq("id_responsable", filters.id_responsable)
    }

    query = query.order("date_creation", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as Projet[]
  },

  // Récupérer un projet par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("projets")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Projet
  },

  // Mettre à jour un projet
  async update(id: string, updates: Partial<Projet>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("projets")
      .update({
        ...updates,
        date_modification: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Projet
  },

  // Supprimer un projet
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("projets")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}



