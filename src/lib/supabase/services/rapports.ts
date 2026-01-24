import { createClient } from "../client"

export interface Rapport {
  id: string
  id_projet?: string
  id_departement?: string
  id_responsable: string
  type_rapport: "mensuel" | "trimestriel" | "annuel" | "final"
  periode: string
  chemin_document?: string
  date_limite: string
  statut: "en_attente" | "soumis" | "en_retard"
  created_at: string
  updated_at?: string
}

export const rapportsService = {
  // Créer un rapport
  async create(data: Omit<Rapport, "id" | "created_at" | "statut" | "id_responsable">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    // Déterminer le statut initial basé sur la date limite
    const dateLimite = new Date(data.date_limite)
    const aujourdhui = new Date()
    const statut: Rapport["statut"] = dateLimite < aujourdhui ? "en_retard" : "en_attente"

    const { data: rapport, error } = await supabase
      .from("rapports")
      .insert({
        ...data,
        id_responsable: user.id,
        statut,
      })
      .select()
      .single()

    if (error) throw error
    return rapport as Rapport
  },

  // Récupérer tous les rapports
  async getAll(filters?: {
    statut?: Rapport["statut"]
    type_rapport?: Rapport["type_rapport"]
    id_responsable?: string
    id_projet?: string
    id_departement?: string
  }) {
    const supabase = createClient()
    let query = supabase.from("rapports").select("*")

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    if (filters?.type_rapport) {
      query = query.eq("type_rapport", filters.type_rapport)
    }

    if (filters?.id_responsable) {
      query = query.eq("id_responsable", filters.id_responsable)
    }

    if (filters?.id_projet) {
      query = query.eq("id_projet", filters.id_projet)
    }

    if (filters?.id_departement) {
      query = query.eq("id_departement", filters.id_departement)
    }

    query = query.order("date_limite", { ascending: true })

    const { data, error } = await query

    if (error) throw error
    return data as Rapport[]
  },

  // Récupérer un rapport par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("rapports")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Rapport
  },

  // Mettre à jour un rapport
  async update(id: string, updates: Partial<Rapport>) {
    const supabase = createClient()
    
    // Si la date limite change, recalculer le statut
    if (updates.date_limite) {
      const dateLimite = new Date(updates.date_limite)
      const aujourdhui = new Date()
      if (dateLimite < aujourdhui && updates.statut !== "soumis") {
        updates.statut = "en_retard"
      }
    }

    const { data, error } = await supabase
      .from("rapports")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Rapport
  },

  // Soumettre un rapport (upload document et changement de statut)
  async submit(id: string, documentUrl: string) {
    return this.update(id, {
      statut: "soumis",
      chemin_document: documentUrl,
    })
  },

  // Marquer un rapport comme en retard
  async markAsOverdue(id: string) {
    return this.update(id, { statut: "en_retard" })
  },

  // Supprimer un rapport
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("rapports")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Récupérer les rapports en retard
  async getOverdue() {
    const supabase = createClient()
    const aujourdhui = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("rapports")
      .select("*")
      .lt("date_limite", aujourdhui)
      .neq("statut", "soumis")
      .order("date_limite", { ascending: true })

    if (error) throw error
    return data as Rapport[]
  },

  // Récupérer les rapports à venir (dans les 7 prochains jours)
  async getUpcoming(days: number = 7) {
    const supabase = createClient()
    const aujourdhui = new Date()
    const dateLimite = new Date()
    dateLimite.setDate(aujourdhui.getDate() + days)

    const { data, error } = await supabase
      .from("rapports")
      .select("*")
      .gte("date_limite", aujourdhui.toISOString().split("T")[0])
      .lte("date_limite", dateLimite.toISOString().split("T")[0])
      .neq("statut", "soumis")
      .order("date_limite", { ascending: true })

    if (error) throw error
    return data as Rapport[]
  },

  // Upload du document rapport
  async uploadDocument(file: File, rapportId?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const fileName = rapportId 
      ? `rapport-${rapportId}-${Date.now()}.${file.name.split('.').pop()}` 
      : `rapport-${Date.now()}.${file.name.split('.').pop()}`
    const filePath = `rapports/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath)

    return publicUrl
  },
}
