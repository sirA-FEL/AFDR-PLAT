import { createClient } from "@/lib/supabase/server"
import type { OrdreMissionFormData } from "@/lib/validations/ordre-mission"

export async function createOrdreMission(data: OrdreMissionFormData & { id_demandeur: string; statut?: string }) {
  const supabase = await createClient()
  
  const { data: ordre, error } = await supabase
    .from("ordres_mission")
    .insert({
      id_demandeur: data.id_demandeur,
      destination: data.destination,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      motif: data.motif,
      activites_prevues: data.activites_prevues,
      budget_estime: data.budget_estime,
      statut: data.statut || "brouillon",
    })
    .select()
    .single()

  if (error) throw error
  return ordre
}

export async function getOrdresMission(filters?: {
  id_demandeur?: string
  statut?: string
  date_debut?: string
  date_fin?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from("ordres_mission")
    .select("*")
    .order("created_at", { ascending: false })

  if (filters?.id_demandeur) {
    query = query.eq("id_demandeur", filters.id_demandeur)
  }
  if (filters?.statut) {
    query = query.eq("statut", filters.statut)
  }
  if (filters?.date_debut) {
    query = query.gte("date_debut", filters.date_debut)
  }
  if (filters?.date_fin) {
    query = query.lte("date_fin", filters.date_fin)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getOrdreMissionById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("ordres_mission")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function updateOrdreMission(id: string, data: Partial<OrdreMissionFormData> & { statut?: string }) {
  const supabase = await createClient()
  
  const { data: ordre, error } = await supabase
    .from("ordres_mission")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return ordre
}

export async function deleteOrdreMission(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("ordres_mission")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function validerOrdreMission(
  id: string,
  id_validateur: string,
  niveau_validation: "chef" | "finance" | "direction",
  decision: "approuve" | "rejete",
  commentaire?: string,
  montant_approuve?: number
) {
  const supabase = await createClient()
  
  // Créer l'enregistrement de validation
  const { data: validation, error: validationError } = await supabase
    .from("validations_ordre_mission")
    .insert({
      id_ordre_mission: id,
      id_validateur,
      niveau_validation,
      decision,
      commentaire,
      montant_approuve,
    })
    .select()
    .single()

  if (validationError) throw validationError

  // Mettre à jour le statut de l'ordre de mission
  let nouveauStatut = ""
  if (decision === "rejete") {
    nouveauStatut = "rejete"
  } else {
    if (niveau_validation === "chef") {
      nouveauStatut = "en_attente_finance"
    } else if (niveau_validation === "finance") {
      nouveauStatut = "en_attente_direction"
    } else if (niveau_validation === "direction") {
      nouveauStatut = "approuve"
    }
  }

  const { data: ordre, error: ordreError } = await supabase
    .from("ordres_mission")
    .update({
      statut: nouveauStatut,
      commentaire_rejet: decision === "rejete" ? commentaire : null,
    })
    .eq("id", id)
    .select()
    .single()

  if (ordreError) throw ordreError

  return { ordre, validation }
}


