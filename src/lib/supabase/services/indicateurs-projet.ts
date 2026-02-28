import { createClient } from "../client"

export interface IndicateurProjet {
  id: string
  id_projet: string
  id_activite?: string
  nom: string
  description?: string
  valeur_cible?: number
  valeur_actuelle?: number
  unite?: string
  date_creation: string
}

export const indicateursProjetService = {
  async create(data: Omit<IndicateurProjet, "id" | "date_creation">) {
    const supabase = createClient()
    const { data: row, error } = await supabase
      .from("indicateurs_projet")
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return row as IndicateurProjet
  },

  async getByProjet(idProjet: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("indicateurs_projet")
      .select("*")
      .eq("id_projet", idProjet)
      .order("date_creation", { ascending: true })
    if (error) throw error
    return data as IndicateurProjet[]
  },

  async getByActivite(idActivite: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("indicateurs_projet")
      .select("*")
      .eq("id_activite", idActivite)
      .order("date_creation", { ascending: true })
    if (error) throw error
    return data as IndicateurProjet[]
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("indicateurs_projet")
      .select("*")
      .eq("id", id)
      .single()
    if (error) throw error
    return data as IndicateurProjet
  },

  async update(id: string, updates: Partial<Omit<IndicateurProjet, "id" | "id_projet" | "date_creation">>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("indicateurs_projet")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as IndicateurProjet
  },

  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("indicateurs_projet")
      .delete()
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}
