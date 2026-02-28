import { createClient } from "../client"

export interface Profil {
  id: string
  email: string
  nom: string
  prenom?: string
  photo?: string
  departement?: string
  poste?: string
  created_at: string
  updated_at?: string
}

export const profilService = {
  // Récupérer le profil de l'utilisateur connecté
  async getCurrent() {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data, error } = await supabase
      .from("profils")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      // Si le profil n'existe pas, le créer avec les données de l'utilisateur
      if (error.code === "PGRST116") {
        return this.create({
          email: user.email || "",
          nom: user.user_metadata?.nom || user.email?.split("@")[0] || "Utilisateur",
          prenom: user.user_metadata?.prenom,
        })
      }
      throw error
    }

    return data as Profil
  },

  // Créer un profil
  async create(data: Omit<Profil, "id" | "created_at" | "updated_at">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data: profil, error } = await supabase
      .from("profils")
      .insert({
        id: user.id,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return profil as Profil
  },

  // Mettre à jour le profil
  async update(updates: Partial<Omit<Profil, "id" | "created_at">>) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const { data, error } = await supabase
      .from("profils")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) throw error
    return data as Profil
  },

  // Upload de la photo de profil
  async uploadPhoto(file: File) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `photos-profil/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("photos-employes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from("photos-employes")
      .getPublicUrl(filePath)

    // Mettre à jour le profil avec l'URL de la photo
    await this.update({ photo: publicUrl })

    return publicUrl
  },

  // Récupérer tous les profils (pour listes déroulantes ex. responsable de projet)
  async getAll() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profils")
      .select("id, nom, prenom, email")
      .order("nom", { ascending: true })

    if (error) throw error
    return data as Pick<Profil, "id" | "nom" | "prenom" | "email">[]
  },

  // Récupérer un profil par ID
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profils")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Profil
  },

  // Récupérer plusieurs profils par IDs
  async getByIds(ids: string[]) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profils")
      .select("*")
      .in("id", ids)

    if (error) throw error
    return data as Profil[]
  },

  // Rechercher des profils
  async search(searchTerm: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profils")
      .select("*")
      .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(20)

    if (error) throw error
    return data as Profil[]
  },

  // Récupérer les rôles d'un utilisateur
  async getRoles(userId?: string) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Utilisateur non authentifié")

    const targetUserId = userId || user.id

    const { data, error } = await supabase
      .from("roles_utilisateurs")
      .select("role")
      .eq("id_utilisateur", targetUserId)

    if (error) throw error
    return data.map((r: any) => r.role) as string[]
  },
}
