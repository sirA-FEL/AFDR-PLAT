import { createClient } from "../client"

export interface Employe {
  id: string
  id_utilisateur?: string // Référence vers profils(id)
  date_embauche: string
  type_contrat: "cdi" | "cdd" | "stage" | "consultant" | "autre"
  salaire?: number
  chemin_cv?: string
  chemin_contrat?: string
  solde_conges: number
  date_creation: string
  date_modification?: string
  // Données jointes depuis profils
  nom?: string
  prenom?: string
  email?: string
  poste?: string
  departement?: string
  photo?: string
}

export const employesService = {
  // Créer un employé (nécessite d'abord créer le profil utilisateur)
  async create(data: {
    // Données profil
    nom: string
    prenom: string
    email: string
    poste?: string
    departement?: string
    photo?: string
    // Données employé
    date_embauche: string
    type_contrat: Employe["type_contrat"]
    salaire?: number
  }) {
    const supabase = createClient()

    // 1. Créer d'abord le profil utilisateur (ou le récupérer s'il existe)
    const { data: profil, error: profilError } = await supabase
      .from("profils")
      .upsert({
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        poste: data.poste,
        departement: data.departement,
        photo: data.photo,
      })
      .select()
      .single()

    if (profilError) throw profilError

    // 2. Créer la fiche employé
    const { data: employe, error } = await supabase
      .from("employes")
      .insert({
        id_utilisateur: profil.id,
        date_embauche: data.date_embauche,
        type_contrat: data.type_contrat,
        salaire: data.salaire,
        solde_conges: 0,
      })
      .select()
      .single()

    if (error) throw error

    // 3. Retourner avec les données du profil jointes
    return {
      ...employe,
      nom: profil.nom,
      prenom: profil.prenom,
      email: profil.email,
      poste: profil.poste,
      departement: profil.departement,
      photo: profil.photo,
    } as Employe
  },

  // Récupérer tous les employés avec jointure sur profils
  async getAll(searchTerm?: string) {
    const supabase = createClient()
    let query = supabase
      .from("employes")
      .select(`
        *,
        profils:profils!employes_id_utilisateur_fkey (
          nom,
          prenom,
          email,
          poste,
          departement,
          photo
        )
      `)

    if (searchTerm) {
      // Recherche dans les profils via la jointure
      query = query.or(
        `profils.nom.ilike.%${searchTerm}%,profils.prenom.ilike.%${searchTerm}%,profils.email.ilike.%${searchTerm}%,profils.poste.ilike.%${searchTerm}%,profils.departement.ilike.%${searchTerm}%`
      )
    }

    const { data, error } = await query

    if (error) throw error

    // Transformer les données pour correspondre à l'interface
    return (data || []).map((emp: any) => ({
      ...emp,
      nom: emp.profils?.nom,
      prenom: emp.profils?.prenom,
      email: emp.profils?.email,
      poste: emp.profils?.poste,
      departement: emp.profils?.departement,
      photo: emp.profils?.photo,
    })) as Employe[]
  },

  // Récupérer un employé par ID avec jointure
  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("employes")
      .select(`
        *,
        profils:profils!employes_id_utilisateur_fkey (
          nom,
          prenom,
          email,
          poste,
          departement,
          photo
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return {
      ...data,
      nom: data.profils?.nom,
      prenom: data.profils?.prenom,
      email: data.profils?.email,
      poste: data.profils?.poste,
      departement: data.profils?.departement,
      photo: data.profils?.photo,
    } as Employe
  },

  // Mettre à jour un employé
  async update(id: string, updates: Partial<Employe>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("employes")
      .update({
        ...updates,
        date_modification: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Employe
  },

  // Supprimer un employé
  async delete(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("employes")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Upload photo (met à jour le profil utilisateur)
  async uploadPhoto(id: string, file: File) {
    const supabase = createClient()
    
    // Récupérer l'id_utilisateur
    const employe = await this.getById(id)
    if (!employe.id_utilisateur) throw new Error("Employé sans utilisateur associé")

    const fileExt = file.name.split(".").pop()
    const fileName = `${employe.id_utilisateur}-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("photos-employes")
      .upload(fileName, file)

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos-employes").getPublicUrl(fileName)

    // Mettre à jour la photo dans le profil
    const { error: updateError } = await supabase
      .from("profils")
      .update({ photo: publicUrl })
      .eq("id", employe.id_utilisateur)

    if (updateError) throw updateError

    return publicUrl
  },
}

