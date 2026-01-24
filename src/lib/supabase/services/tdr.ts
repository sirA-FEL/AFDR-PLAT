import { createClient } from "../client"

export interface TDR {
  id: string
  id_demandeur: string
  id_projet?: string
  titre: string
  type_tdr: "consultant" | "prestation"
  budget?: number
  delai_jours?: number
  chemin_document: string
  statut: "en_attente" | "en_revision" | "approuve" | "rejete"
  favori: boolean
  created_at: string
  updated_at?: string
}

export interface ValidationTDR {
  id: string
  id_tdr: string
  id_validateur: string
  decision: "approuve" | "rejete" | "revision_requise"
  commentaire?: string
  created_at: string
}

export const tdrService = {
  // Créer un TdR
  async create(data: Omit<TDR, "id" | "created_at" | "statut" | "favori" | "id_demandeur">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data: tdr, error } = await supabase
      .from("tdrs")
      .insert({
        ...data,
        id_demandeur: user.id,
        statut: "en_attente",
        favori: false,
      })
      .select()
      .single()

    if (error) throw error
    return tdr as TDR
  },

  // Récupérer tous les TdRs
  async getAll(filters?: {
    statut?: TDR["statut"]
    id_demandeur?: string
    id_projet?: string
    favori?: boolean
  }) {
    const supabase = createClient()
    let query = supabase.from("tdrs").select("*")

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    if (filters?.id_demandeur) {
      query = query.eq("id_demandeur", filters.id_demandeur)
    }

    if (filters?.id_projet) {
      query = query.eq("id_projet", filters.id_projet)
    }

    if (filters?.favori !== undefined) {
      query = query.eq("favori", filters.favori)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as TDR[]
  },

  // Récupérer un TdR par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tdrs")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as TDR
  },

  // Mettre à jour un TdR
  async update(id: string, updates: Partial<TDR>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tdrs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as TDR
  },

  // Basculer le statut favori
  async toggleFavori(id: string) {
    const supabase = createClient()
    const { data: tdr } = await this.getById(id)
    return this.update(id, { favori: !tdr.favori })
  },

  // Valider un TdR
  async validate(id: string, decision: ValidationTDR["decision"], commentaire?: string) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    // Créer la validation
    const { error: validationError } = await supabase
      .from("validations_tdr")
      .insert({
        id_tdr: id,
        id_validateur: user.id,
        decision,
        commentaire,
      })

    if (validationError) throw validationError

    // Mettre à jour le statut du TdR
    const statutMap: Record<ValidationTDR["decision"], TDR["statut"]> = {
      approuve: "approuve",
      rejete: "rejete",
      revision_requise: "en_revision",
    }

    return this.update(id, { statut: statutMap[decision] })
  },

  // Supprimer un TdR
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tdrs")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Upload du document TdR
  async uploadDocument(file: File, tdrId?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const fileName = tdrId ? `tdr-${tdrId}-${Date.now()}.${file.name.split('.').pop()}` : `tdr-${Date.now()}.${file.name.split('.').pop()}`
    const filePath = `tdrs/${fileName}`

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
