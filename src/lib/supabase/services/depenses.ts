import { createClient } from "../client"

export interface Depense {
  id: string
  id_ligne_budgetaire?: string
  id_projet?: string
  id_ordre_mission?: string
  libelle: string
  montant: number
  date_depense: string
  type_depense: "personnel" | "fonctionnement" | "equipement" | "mission" | "autre"
  justificatif?: string
  statut: "en_attente" | "validee" | "rejetee" | "payee"
  id_validateur?: string
  commentaire_validation?: string
  created_at: string
  updated_at?: string
}

export const depensesService = {
  // Créer une dépense
  async create(data: Omit<Depense, "id" | "created_at" | "statut">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()

    const { data: depense, error } = await supabase
      .from("depenses")
      .insert({
        ...data,
        statut: "en_attente",
      })
      .select()
      .single()

    if (error) throw error

    // Mettre à jour le montant engagé de la ligne budgétaire si applicable
    if (data.id_ligne_budgetaire) {
      const { budgetsService } = await import("./budgets")
      const ligne = await budgetsService.getById(data.id_ligne_budgetaire)
      await budgetsService.update(data.id_ligne_budgetaire, {
        montant_engage: ligne.montant_engage + data.montant,
      })
    }

    return depense as Depense
  },

  // Récupérer toutes les dépenses
  async getAll(filters?: {
    statut?: Depense["statut"]
    type_depense?: Depense["type_depense"]
    id_projet?: string
    id_ligne_budgetaire?: string
    id_ordre_mission?: string
    date_debut?: string
    date_fin?: string
  }) {
    const supabase = createClient()
    let query = supabase.from("depenses").select("*")

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    if (filters?.type_depense) {
      query = query.eq("type_depense", filters.type_depense)
    }

    if (filters?.id_projet) {
      query = query.eq("id_projet", filters.id_projet)
    }

    if (filters?.id_ligne_budgetaire) {
      query = query.eq("id_ligne_budgetaire", filters.id_ligne_budgetaire)
    }

    if (filters?.id_ordre_mission) {
      query = query.eq("id_ordre_mission", filters.id_ordre_mission)
    }

    if (filters?.date_debut) {
      query = query.gte("date_depense", filters.date_debut)
    }

    if (filters?.date_fin) {
      query = query.lte("date_depense", filters.date_fin)
    }

    query = query.order("date_depense", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as Depense[]
  },

  // Récupérer une dépense par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("depenses")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Depense
  },

  // Mettre à jour une dépense
  async update(id: string, updates: Partial<Depense>) {
    const supabase = createClient()
    
    // Si le montant change, mettre à jour la ligne budgétaire
    if (updates.montant !== undefined) {
      const depense = await this.getById(id)
      const difference = updates.montant - depense.montant

      if (depense.id_ligne_budgetaire) {
        const { budgetsService } = await import("./budgets")
        const ligne = await budgetsService.getById(depense.id_ligne_budgetaire)
        await budgetsService.update(depense.id_ligne_budgetaire, {
          montant_engage: ligne.montant_engage + difference,
        })
      }
    }

    const { data, error } = await supabase
      .from("depenses")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Depense
  },

  // Valider une dépense
  async validate(id: string, commentaire?: string) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    return this.update(id, {
      statut: "validee",
      id_validateur: user.id,
      commentaire_validation: commentaire,
    })
  },

  // Rejeter une dépense
  async reject(id: string, commentaire: string) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const depense = await this.getById(id)

    // Retirer le montant engagé de la ligne budgétaire
    if (depense.id_ligne_budgetaire) {
      const { budgetsService } = await import("./budgets")
      const ligne = await budgetsService.getById(depense.id_ligne_budgetaire)
      await budgetsService.update(depense.id_ligne_budgetaire, {
        montant_engage: Math.max(0, ligne.montant_engage - depense.montant),
      })
    }

    return this.update(id, {
      statut: "rejetee",
      id_validateur: user.id,
      commentaire_validation: commentaire,
    })
  },

  // Marquer une dépense comme payée
  async markAsPaid(id: string) {
    const depense = await this.getById(id)

    if (depense.statut !== "validee") {
      throw new Error("Seules les dépenses validées peuvent être marquées comme payées")
    }

    // Mettre à jour le montant payé de la ligne budgétaire
    if (depense.id_ligne_budgetaire) {
      const { budgetsService } = await import("./budgets")
      const ligne = await budgetsService.getById(depense.id_ligne_budgetaire)
      await budgetsService.update(depense.id_ligne_budgetaire, {
        montant_paye: ligne.montant_paye + depense.montant,
      })
    }

    return this.update(id, { statut: "payee" })
  },

  // Supprimer une dépense
  async delete(id: string) {
    const supabase = createClient()
    const depense = await this.getById(id)

    // Retirer le montant engagé de la ligne budgétaire
    if (depense.id_ligne_budgetaire && depense.statut !== "rejetee") {
      const { budgetsService } = await import("./budgets")
      const ligne = await budgetsService.getById(depense.id_ligne_budgetaire)
      await budgetsService.update(depense.id_ligne_budgetaire, {
        montant_engage: Math.max(0, ligne.montant_engage - depense.montant),
        montant_paye: Math.max(0, ligne.montant_paye - (depense.statut === "payee" ? depense.montant : 0)),
      })
    }

    const { data, error } = await supabase
      .from("depenses")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Calculer le total des dépenses par projet
  async getTotalByProject(id_projet: string, filters?: { statut?: Depense["statut"] }) {
    const supabase = createClient()
    let query = supabase
      .from("depenses")
      .select("montant")
      .eq("id_projet", id_projet)

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    const { data, error } = await query

    if (error) throw error

    return data.reduce((total, depense) => total + (depense.montant || 0), 0)
  },
}
