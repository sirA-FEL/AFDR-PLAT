import { createClient } from "../client"

export interface LigneBudgetaire {
  id: string
  id_projet?: string
  nom: string
  description?: string
  montant_alloue: number
  montant_engage: number
  montant_paye: number
  annee: number
  trimestre?: number
  statut: "actif" | "cloture" | "suspendu"
  created_at: string
  updated_at?: string
}

export const budgetsService = {
  // Créer une ligne budgétaire
  async create(data: Omit<LigneBudgetaire, "id" | "created_at" | "montant_engage" | "montant_paye">) {
    const supabase = createClient()
    const { data: ligne, error } = await supabase
      .from("lignes_budgetaires")
      .insert({
        ...data,
        montant_engage: 0,
        montant_paye: 0,
      })
      .select()
      .single()

    if (error) throw error
    return ligne as LigneBudgetaire
  },

  // Récupérer toutes les lignes budgétaires
  async getAll(filters?: {
    id_projet?: string
    annee?: number
    trimestre?: number
    statut?: LigneBudgetaire["statut"]
  }) {
    const supabase = createClient()
    let query = supabase.from("lignes_budgetaires").select("*")

    if (filters?.id_projet) {
      query = query.eq("id_projet", filters.id_projet)
    }

    if (filters?.annee) {
      query = query.eq("annee", filters.annee)
    }

    if (filters?.trimestre) {
      query = query.eq("trimestre", filters.trimestre)
    }

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    query = query.order("annee", { ascending: false }).order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as LigneBudgetaire[]
  },

  // Récupérer une ligne budgétaire par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lignes_budgetaires")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as LigneBudgetaire
  },

  // Mettre à jour une ligne budgétaire
  async update(id: string, updates: Partial<LigneBudgetaire>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lignes_budgetaires")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as LigneBudgetaire
  },

  // Supprimer une ligne budgétaire
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lignes_budgetaires")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Calculer le total des budgets par projet
  async getTotalByProject(id_projet: string, annee?: number) {
    const supabase = createClient()
    let query = supabase
      .from("lignes_budgetaires")
      .select("montant_alloue, montant_engage, montant_paye")
      .eq("id_projet", id_projet)
      .eq("statut", "actif")

    if (annee) {
      query = query.eq("annee", annee)
    }

    const { data, error } = await query

    if (error) throw error

    const totals = data.reduce(
      (acc, ligne) => ({
        alloue: acc.alloue + (ligne.montant_alloue || 0),
        engage: acc.engage + (ligne.montant_engage || 0),
        paye: acc.paye + (ligne.montant_paye || 0),
      }),
      { alloue: 0, engage: 0, paye: 0 }
    )

    return totals
  },

  // Calculer le total des budgets généraux (sans projet)
  async getTotalGeneral(annee?: number) {
    const supabase = createClient()
    let query = supabase
      .from("lignes_budgetaires")
      .select("montant_alloue, montant_engage, montant_paye")
      .is("id_projet", null)
      .eq("statut", "actif")

    if (annee) {
      query = query.eq("annee", annee)
    }

    const { data, error } = await query

    if (error) throw error

    const totals = data.reduce(
      (acc, ligne) => ({
        alloue: acc.alloue + (ligne.montant_alloue || 0),
        engage: acc.engage + (ligne.montant_engage || 0),
        paye: acc.paye + (ligne.montant_paye || 0),
      }),
      { alloue: 0, engage: 0, paye: 0 }
    )

    return totals
  },
}
