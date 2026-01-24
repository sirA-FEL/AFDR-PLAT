import { createClient } from "../client"

export interface Notification {
  id: string
  id_utilisateur: string
  titre: string
  message: string
  type_notification: "info" | "success" | "warning" | "error" | "validation"
  lien?: string
  lue: boolean
  date_lecture?: string
  created_at: string
}

export const notificationsService = {
  // Créer une notification
  async create(data: Omit<Notification, "id" | "created_at" | "lue" | "date_lecture">) {
    const supabase = createClient()
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        ...data,
        lue: false,
      })
      .select()
      .single()

    if (error) throw error
    return notification as Notification
  },

  // Créer une notification pour plusieurs utilisateurs
  async createForUsers(userIds: string[], data: Omit<Notification, "id" | "created_at" | "lue" | "date_lecture" | "id_utilisateur">) {
    const supabase = createClient()
    const notifications = userIds.map(id_utilisateur => ({
      ...data,
      id_utilisateur: id_utilisateur,
      lue: false,
    }))

    const { data: created, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select()

    if (error) throw error
    return created as Notification[]
  },

  // Récupérer toutes les notifications d'un utilisateur
  async getAll(filters?: {
    lue?: boolean
    type_notification?: Notification["type_notification"]
  }) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("id_utilisateur", user.id)

    if (filters?.lue !== undefined) {
      query = query.eq("lue", filters.lue)
    }

    if (filters?.type_notification) {
      query = query.eq("type_notification", filters.type_notification)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data as Notification[]
  },

  // Récupérer une notification par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Notification
  },

  // Marquer une notification comme lue
  async markAsRead(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notifications")
      .update({
        lue: true,
        date_lecture: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data, error } = await supabase
      .from("notifications")
      .update({
        lue: true,
        date_lecture: new Date().toISOString(),
      })
      .eq("id_utilisateur", user.id)
      .eq("lue", false)
      .select()

    if (error) throw error
    return data as Notification[]
  },

  // Marquer une notification comme non lue
  async markAsUnread(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notifications")
      .update({
        lue: false,
        date_lecture: null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  // Supprimer une notification
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Supprimer toutes les notifications lues
  async deleteAllRead() {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("id_utilisateur", user.id)
      .eq("lue", true)
      .select()

    if (error) throw error
    return data
  },

  // Compter les notifications non lues
  async countUnread() {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("id_utilisateur", user.id)
      .eq("lue", false)

    if (error) throw error
    return count || 0
  },
}
