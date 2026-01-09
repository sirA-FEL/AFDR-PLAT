import { createClient } from "../client"

export interface OrdreMission {
  id: string
  destination: string
  date_debut: string
  date_fin: string
  motif: string
  activites_prevues?: string
  budget_estime?: number
  statut: "brouillon" | "en_attente" | "approuve" | "rejete" | "en_cours" | "termine"
  id_demandeur: string
  id_validateur_chef?: string
  id_validateur_finance?: string
  id_validateur_direction?: string
  commentaire_validation?: string
  date_creation: string
  date_modification?: string
  pdf_url?: string
  documents?: Array<{ nom: string; url: string }>
}

export const ordresMissionService = {
  // Créer un ordre de mission
  async create(data: Omit<OrdreMission, "id" | "date_creation" | "statut" | "id_demandeur">) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data: ordre, error } = await supabase
      .from("ordres_mission")
      .insert({
        ...data,
        id_demandeur: user.id,
        statut: "brouillon",
      })
      .select()
      .single()

    if (error) throw error
    return ordre
  },

  // Récupérer tous les ordres de mission
  async getAll(filters?: {
    statut?: OrdreMission["statut"]
    id_demandeur?: string
    periode?: "mois" | "trimestre" | "annee"
  }) {
    const supabase = createClient()
    let query = supabase.from("ordres_mission").select("*")

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    if (filters?.id_demandeur) {
      query = query.eq("id_demandeur", filters.id_demandeur)
    }

    if (filters?.periode) {
      const now = new Date()
      let dateLimit = new Date()
      if (filters.periode === "mois") {
        dateLimit.setMonth(now.getMonth() - 1)
      } else if (filters.periode === "trimestre") {
        dateLimit.setMonth(now.getMonth() - 3)
      } else if (filters.periode === "annee") {
        dateLimit.setFullYear(now.getFullYear() - 1)
      }
      query = query.gte("date_creation", dateLimit.toISOString())
    }

    query = query.order("date_creation", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as OrdreMission[]
  },

  // Récupérer un ordre par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("ordres_mission")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as OrdreMission
  },

  // Mettre à jour un ordre
  async update(id: string, updates: Partial<OrdreMission>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("ordres_mission")
      .update({
        ...updates,
        date_modification: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as OrdreMission
  },

  // Soumettre un ordre (passe de brouillon à en_attente)
  async submit(id: string) {
    return this.update(id, { statut: "en_attente" })
  },

  // Approuver un ordre (par chef, finance ou direction)
  async approve(id: string, validateurType: "chef" | "finance" | "direction", commentaire?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const updates: any = {
      commentaire_validation: commentaire,
    }

    if (validateurType === "chef") {
      updates.id_validateur_chef = user.id
      updates.statut = "approuve" // Après validation chef, passe à Finance
    } else if (validateurType === "finance") {
      updates.id_validateur_finance = user.id
      updates.statut = "approuve" // Après validation finance, passe à Direction
    } else if (validateurType === "direction") {
      updates.id_validateur_direction = user.id
      updates.statut = "approuve" // Approbation finale
    }

    return this.update(id, updates)
  },

  // Rejeter un ordre
  async reject(id: string, commentaire: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    return this.update(id, {
      statut: "rejete",
      commentaire_validation: commentaire,
    })
  },

  // Supprimer un ordre (seulement si brouillon)
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("ordres_mission")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Récupérer les ordres en attente de validation
  async getPendingValidation(managerId?: string) {
    const supabase = createClient()
    let query = supabase
      .from("ordres_mission")
      .select("*")
      .eq("statut", "en_attente")

    if (managerId) {
      // Filtrer par équipe du manager (via hierarchies)
      query = query.eq("id_demandeur", managerId) // Simplifié - à améliorer avec jointure hierarchies
    }

    const { data, error } = await query.order("date_creation", { ascending: false })

    if (error) throw error
    return data as OrdreMission[]
  },
}

