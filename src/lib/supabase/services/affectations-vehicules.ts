import { createClient } from "../client"
import { vehiculesService } from "./vehicules"

export type StatutAffectation = "active" | "terminee" | "annulee"

export interface AffectationVehicule {
  id: string
  id_vehicule: string
  id_ordre_mission: string | null
  id_conducteur: string | null
  date_debut: string
  date_fin: string | null
  kilometrage_debut: number
  kilometrage_fin: number | null
  motif: string | null
  statut: StatutAffectation
  created_at: string
  updated_at?: string
}

export interface AffectationVehiculeWithRelations extends AffectationVehicule {
  vehicule?: { immatriculation: string; marque: string; modele: string }
  ordre_mission?: { id: string; destination: string; date_debut: string; date_fin: string; statut: string }
  conducteur?: { nom: string; prenom: string }
}

export const affectationsVehiculesService = {
  async getByVehicule(id_vehicule: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("affectations_vehicules")
      .select("*")
      .eq("id_vehicule", id_vehicule)
      .order("date_debut", { ascending: false })
    if (error) throw error
    return (data ?? []) as AffectationVehicule[]
  },

  async getByOrdreMission(id_ordre_mission: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("affectations_vehicules")
      .select("*")
      .eq("id_ordre_mission", id_ordre_mission)
      .order("date_debut", { ascending: false })
    if (error) throw error
    return (data ?? []) as AffectationVehicule[]
  },

  async create(data: {
    id_vehicule: string
    id_ordre_mission?: string | null
    id_conducteur?: string | null
    date_debut: string
    date_fin?: string | null
    kilometrage_debut: number
    kilometrage_fin?: number | null
    motif?: string | null
    statut?: StatutAffectation
  }) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const statut = data.statut ?? "active"
    const { data: row, error } = await supabase
      .from("affectations_vehicules")
      .insert({
        id_vehicule: data.id_vehicule,
        id_ordre_mission: data.id_ordre_mission ?? null,
        id_conducteur: data.id_conducteur ?? null,
        date_debut: data.date_debut,
        date_fin: data.date_fin ?? null,
        kilometrage_debut: data.kilometrage_debut,
        kilometrage_fin: data.kilometrage_fin ?? null,
        motif: data.motif ?? null,
        statut,
      })
      .select()
      .single()
    if (error) throw error
    const affectation = row as AffectationVehicule
    if (statut === "active") {
      try {
        await vehiculesService.update(affectation.id_vehicule, { etat: "en_mission" })
      } catch {
        // best effort: affectation is created
      }
    }
    return affectation
  },

  async update(id: string, data: Partial<Omit<AffectationVehicule, "id" | "created_at">>) {
    const supabase = createClient()
    const { data: existing } = await supabase
      .from("affectations_vehicules")
      .select("id_vehicule, statut")
      .eq("id", id)
      .single()
    const { data: row, error } = await supabase
      .from("affectations_vehicules")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const affectation = row as AffectationVehicule
    if (existing && data.statut === "terminee" && data.kilometrage_fin != null) {
      try {
        await vehiculesService.update(existing.id_vehicule, {
          etat: "disponible",
          kilometrage: data.kilometrage_fin,
        })
      } catch {
        // best effort
      }
    }
    return affectation
  },
}
