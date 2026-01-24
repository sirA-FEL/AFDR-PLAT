import { createClient } from "../client"

export interface DemandeAchat {
  id: string
  id_demandeur: string
  id_projet?: string
  objet: string
  description?: string
  montant_estime?: number
  urgence: "faible" | "normale" | "elevee" | "critique"
  statut: "brouillon" | "en_attente" | "en_cours" | "approuvee" | "rejetee" | "terminee"
  id_validateur?: string
  commentaire_validation?: string
  date_besoin?: string
  created_at: string
  updated_at?: string
}

export interface ArticleDemandeAchat {
  id: string
  id_demande_achat: string
  designation: string
  quantite: number
  unite?: string
  prix_unitaire?: number
  montant_total: number
  created_at: string
}

export const demandesAchatService = {
  // Créer une demande d'achat
  async create(data: Omit<DemandeAchat, "id" | "created_at" | "statut" | "id_demandeur">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data: demande, error } = await supabase
      .from("demandes_achat")
      .insert({
        ...data,
        id_demandeur: user.id,
        statut: "brouillon",
      })
      .select()
      .single()

    if (error) throw error
    return demande as DemandeAchat
  },

  // Récupérer toutes les demandes d'achat
  async getAll(filters?: {
    statut?: DemandeAchat["statut"]
    urgence?: DemandeAchat["urgence"]
    id_demandeur?: string
    id_projet?: string
  }) {
    const supabase = createClient()
    let query = supabase.from("demandes_achat").select("*")

    if (filters?.statut) {
      query = query.eq("statut", filters.statut)
    }

    if (filters?.urgence) {
      query = query.eq("urgence", filters.urgence)
    }

    if (filters?.id_demandeur) {
      query = query.eq("id_demandeur", filters.id_demandeur)
    }

    if (filters?.id_projet) {
      query = query.eq("id_projet", filters.id_projet)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as DemandeAchat[]
  },

  // Récupérer une demande d'achat par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("demandes_achat")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as DemandeAchat
  },

  // Mettre à jour une demande d'achat
  async update(id: string, updates: Partial<DemandeAchat>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("demandes_achat")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as DemandeAchat
  },

  // Soumettre une demande (passe de brouillon à en_attente)
  async submit(id: string) {
    return this.update(id, { statut: "en_attente" })
  },

  // Approuver une demande
  async approve(id: string, commentaire?: string) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    return this.update(id, {
      statut: "approuvee",
      id_validateur: user.id,
      commentaire_validation: commentaire,
    })
  },

  // Rejeter une demande
  async reject(id: string, commentaire: string) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    return this.update(id, {
      statut: "rejetee",
      id_validateur: user.id,
      commentaire_validation: commentaire,
    })
  },

  // Marquer comme en cours
  async markInProgress(id: string) {
    return this.update(id, { statut: "en_cours" })
  },

  // Marquer comme terminée
  async markAsCompleted(id: string) {
    return this.update(id, { statut: "terminee" })
  },

  // Supprimer une demande (seulement si brouillon)
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("demandes_achat")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Gestion des articles
  async addArticle(id_demande_achat: string, article: Omit<ArticleDemandeAchat, "id" | "id_demande_achat" | "created_at" | "montant_total">) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("articles_demande_achat")
      .insert({
        ...article,
        id_demande_achat,
      })
      .select()
      .single()

    if (error) throw error
    return data as ArticleDemandeAchat
  },

  async getArticles(id_demande_achat: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("articles_demande_achat")
      .select("*")
      .eq("id_demande_achat", id_demande_achat)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data as ArticleDemandeAchat[]
  },

  async updateArticle(id: string, updates: Partial<ArticleDemandeAchat>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("articles_demande_achat")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as ArticleDemandeAchat
  },

  async deleteArticle(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("articles_demande_achat")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Calculer le montant total d'une demande
  async calculateTotal(id_demande_achat: string) {
    const articles = await this.getArticles(id_demande_achat)
    return articles.reduce((total, article) => total + (article.montant_total || 0), 0)
  },
}
