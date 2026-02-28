import { createClient } from "../client"

export interface ActiviteProjet {
  id: string
  id_projet: string
  nom: string
  description?: string
  date_debut?: string
  date_fin?: string
  budget_alloue?: number
  taux_realisation_physique?: number
  taux_realisation_financiere?: number
  depenses_reelles?: number
  ordre?: number
  date_creation: string
  date_modification?: string
}

export const activitesProjetService = {
  async create(data: Omit<ActiviteProjet, "id" | "date_creation" | "date_modification">) {
    const supabase = createClient()
    const { data: row, error } = await supabase
      .from("activites_projet")
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return row as ActiviteProjet
  },

  async getByProjet(idProjet: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activites_projet")
      .select("*")
      .eq("id_projet", idProjet)
      .order("ordre", { ascending: true })
      .order("date_creation", { ascending: true })
    if (error) throw error
    return data as ActiviteProjet[]
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activites_projet")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw error
    return data as ActiviteProjet
  },

  async update(id: string, updates: Partial<Omit<ActiviteProjet, "id" | "id_projet" | "date_creation">>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activites_projet")
      .update({
        ...updates,
        date_modification: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as ActiviteProjet
  },

  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("activites_projet")
      .delete()
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
