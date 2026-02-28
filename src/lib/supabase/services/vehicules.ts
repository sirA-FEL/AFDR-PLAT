import { createClient } from "../client"

export type TypeVehicule = "voiture" | "moto" | "camion" | "bus" | "autre"
export type Carburant = "essence" | "diesel" | "electrique" | "hybride"
export type EtatVehicule = "disponible" | "en_mission" | "en_entretien" | "hors_service"

export interface Vehicule {
  id: string
  immatriculation: string
  marque: string
  modele: string
  annee?: number
  type_vehicule: TypeVehicule
  carburant?: Carburant
  kilometrage: number
  etat: EtatVehicule
  date_achat?: string
  date_dernier_entretien?: string
  prochain_entretien_km?: number
  prochain_entretien_date?: string
  created_at: string
  updated_at?: string
}

export const vehiculesService = {
  async getAll(filters?: { etat?: EtatVehicule }) {
    const supabase = createClient()
    let query = supabase.from("vehicules").select("*").order("immatriculation", { ascending: true })
    if (filters?.etat) {
      query = query.eq("etat", filters.etat)
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Vehicule[]
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("vehicules").select("*").eq("id", id).single()
    if (error) throw error
    return data as Vehicule
  },

  async create(data: Omit<Vehicule, "id" | "created_at" | "updated_at">) {
    if (typeof window === "undefined") {
      throw new Error("Cette fonction ne peut être appelée que côté client")
    }
    const supabase = createClient()
    const { data: row, error } = await supabase
      .from("vehicules")
      .insert({
        immatriculation: data.immatriculation,
        marque: data.marque,
        modele: data.modele,
        annee: data.annee ?? null,
        type_vehicule: data.type_vehicule,
        carburant: data.carburant ?? null,
        kilometrage: data.kilometrage ?? 0,
        etat: data.etat ?? "disponible",
        date_achat: data.date_achat ?? null,
        date_dernier_entretien: data.date_dernier_entretien ?? null,
        prochain_entretien_km: data.prochain_entretien_km ?? null,
        prochain_entretien_date: data.prochain_entretien_date ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return row as Vehicule
  },

  async update(id: string, data: Partial<Omit<Vehicule, "id" | "created_at">>) {
    const supabase = createClient()
    const { data: row, error } = await supabase
      .from("vehicules")
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return row as Vehicule
  },
}
