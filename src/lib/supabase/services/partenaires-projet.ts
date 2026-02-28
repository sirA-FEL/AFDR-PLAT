import { createClient } from "../client"

export interface PartenaireProjet {
  id: string
  id_projet: string
  id_partenaire: string
  date_partage: string
  actif: boolean
}

export const partenairesProjetService = {
  /** Projets partagés avec l'utilisateur connecté (pour espace partenaire). */
  async getProjetsPartagesPourUtilisateur() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data: rows, error } = await supabase
      .from("partenaires_projet")
      .select("id_projet")
      .eq("id_partenaire", user.id)
      .eq("actif", true)
    if (error) throw error
    if (!rows?.length) return []
    const ids = rows.map((r) => r.id_projet)
    const { data: projets, error: err2 } = await supabase
      .from("projets")
      .select("*")
      .in("id", ids)
      .order("date_creation", { ascending: false })
    if (err2) throw err2
    return projets ?? []
  },

  /** Partenaires ayant accès à un projet (pour fiche projet MEAL). */
  async getPartenairesPourProjet(idProjet: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("partenaires_projet")
      .select("id, id_partenaire, date_partage, actif")
      .eq("id_projet", idProjet)
      .eq("actif", true)
    if (error) throw error
    return (data ?? []) as PartenaireProjet[]
  },

  async ajouter(idProjet: string, idPartenaire: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("partenaires_projet")
      .upsert(
        { id_projet: idProjet, id_partenaire: idPartenaire, actif: true },
        { onConflict: "id_projet,id_partenaire" }
      )
      .select()
      .single()
    if (error) throw error
    return data as PartenaireProjet
  },

  async retirer(idProjet: string, idPartenaire: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("partenaires_projet")
      .update({ actif: false })
      .eq("id_projet", idProjet)
      .eq("id_partenaire", idPartenaire)
    if (error) throw error
  },

  /** Liste des utilisateurs avec rôle PART (pour le select "Partager avec"). */
  async getUtilisateursPartenaire() {
    const supabase = createClient()
    const { data: roles, error: errRoles } = await supabase
      .from("roles_utilisateurs")
      .select("id_utilisateur")
      .eq("role", "PART")
    if (errRoles) throw errRoles
    if (!roles?.length) return []
    const ids = roles.map((r) => r.id_utilisateur)
    const { data: profils } = await supabase
      .from("profils")
      .select("id, nom, prenom, email")
      .in("id", ids)
    return (profils ?? []).map((p) => ({
      id: p.id,
      nom: [p.prenom, p.nom].filter(Boolean).join(" ") || p.email,
      email: p.email,
    }))
  },
}
