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
  signature_validation_url?: string
  signature_validation_hash?: string
  date_validation?: string
  documents?: Array<{ nom: string; url: string }>
}

/** Calcule l'empreinte SHA-256 d'un Blob (conformité signature). */
async function sha256Blob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export const ordresMissionService = {
  // Créer un ordre de mission (via RPC pour éviter les blocages RLS)
  async create(data: Omit<OrdreMission, "id" | "date_creation" | "statut" | "id_demandeur">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) throw new Error("Session expirée. Veuillez vous reconnecter.")

    const { data: rows, error } = await supabase.rpc("insert_ordre_mission", {
      p_destination: data.destination,
      p_date_debut: data.date_debut,
      p_date_fin: data.date_fin,
      p_motif: data.motif,
      p_activites_prevues: data.activites_prevues ?? null,
      p_budget_estime: data.budget_estime ?? null,
    })

    if (error) {
      const msg = (error as { message?: string; details?: string }).message
        || (error as { details?: string }).details
        || JSON.stringify(error)
      throw new Error(msg)
    }
    const ordre = Array.isArray(rows) ? rows[0] : rows
    if (!ordre) throw new Error("Erreur lors de la création de l'ordre de mission")
    return ordre as OrdreMission
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

  // Mettre à jour un ordre (même client que la session pour que RLS auth.uid() soit défini)
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

  // Soumettre un ordre (passe de brouillon à en_attente, via RPC pour éviter RLS)
  async submit(id: string) {
    const supabase = createClient()
    const { data: rows, error } = await supabase.rpc("submit_ordre_mission", { p_id: id })
    if (error) throw error
    const updated = Array.isArray(rows) ? rows[0] : rows
    if (!updated) throw new Error("Ordre introuvable ou déjà soumis.")
    return updated as OrdreMission
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

  /** Approuver avec signature numérique (validateur direction). Hash SHA-256, upload, audit, pas d'écrasement. */
  async approveWithSignature(id: string, signatureBlob: Blob, commentaire?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Utilisateur non authentifié")

    const existing = await this.getById(id)
    if (existing.signature_validation_url) {
      throw new Error("Cet ordre possède déjà une signature ; l'écrasement n'est pas autorisé.")
    }

    const signatureHash = await sha256Blob(signatureBlob)
    const path = `${id}/signature.png`
    const { error: uploadError } = await supabase.storage
      .from("documents-ordre-mission")
      .upload(path, signatureBlob, { contentType: "image/png", upsert: false })
    if (uploadError) throw new Error(uploadError.message || "Échec de l'upload de la signature")

    const updated = await this.update(id, {
      id_validateur_direction: user.id,
      signature_validation_url: path,
      signature_validation_hash: signatureHash,
      date_validation: new Date().toISOString(),
      statut: "approuve",
      commentaire_validation: commentaire,
    })

    const metadata =
      typeof navigator !== "undefined"
        ? { user_agent: navigator.userAgent }
        : undefined
    await supabase.from("audit_validation_ordres_mission").insert({
      id_ordre_mission: id,
      id_validateur: user.id,
      action: "approuve_avec_signature",
      signature_hash: signatureHash,
      metadata: metadata ?? null,
    })

    return updated
  },

  /** URL signée pour l'image de signature (bucket privé). */
  async getSignedSignatureUrl(ordreId: string, expiresIn = 3600): Promise<string> {
    const supabase = createClient()
    const ordre = await this.getById(ordreId)
    const path =
      ordre.signature_validation_url && !ordre.signature_validation_url.startsWith("http")
        ? ordre.signature_validation_url
        : `${ordreId}/signature.png`
    const { data, error } = await supabase.storage
      .from("documents-ordre-mission")
      .createSignedUrl(path, expiresIn)
    if (error) throw new Error(error.message || "Impossible de générer l'URL de la signature")
    const url = data?.signedUrl ?? (data as { signed_url?: string })?.signed_url
    if (!url) throw new Error("URL signée non retournée")
    return url
  },

  // Rejeter un ordre (avec entrée d'audit)
  async reject(id: string, commentaire: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const updated = await this.update(id, {
      statut: "rejete",
      commentaire_validation: commentaire,
    })

    const metadata =
      typeof navigator !== "undefined"
        ? { user_agent: navigator.userAgent }
        : undefined
    await supabase.from("audit_validation_ordres_mission").insert({
      id_ordre_mission: id,
      id_validateur: user.id,
      action: "rejete",
      metadata: metadata ?? null,
    })

    return updated
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

  // Upload du PDF dans le bucket (privé) ; on stocke le chemin dans pdf_url
  async uploadPdf(ordreId: string, blob: Blob): Promise<string> {
    const supabase = createClient()
    const path = `${ordreId}/ordre-mission.pdf`
    const { error: uploadError } = await supabase.storage
      .from("documents-ordre-mission")
      .upload(path, blob, { contentType: "application/pdf", upsert: true })

    if (uploadError) throw new Error(uploadError.message || "Échec de l'upload du PDF")
    return path
  },

  async setPdfUrl(ordreId: string, pdfPathOrUrl: string) {
    return this.update(ordreId, { pdf_url: pdfPathOrUrl })
  },

  /** Génère une URL signée pour ouvrir le PDF (bucket privé). Valide 1 h par défaut. */
  async getSignedPdfUrl(ordreId: string, expiresIn = 3600): Promise<string> {
    const supabase = createClient()
    const ordre = await this.getById(ordreId)
    const path =
      ordre.pdf_url && !ordre.pdf_url.startsWith("http")
        ? ordre.pdf_url
        : `${ordreId}/ordre-mission.pdf`
    const { data, error } = await supabase.storage
      .from("documents-ordre-mission")
      .createSignedUrl(path, expiresIn)
    if (error) throw new Error(error.message || "Impossible de générer l'URL du PDF")
    const url = data?.signedUrl ?? (data as { signed_url?: string })?.signed_url
    if (!url) throw new Error("URL signée non retournée")
    return url
  },
}

