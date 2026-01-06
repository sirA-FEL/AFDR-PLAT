export type Role = 'DIR' | 'MEAL' | 'FIN' | 'LOG' | 'GRH' | 'PM' | 'USER'

export interface UserProfile {
  id: string
  email: string
  nom: string
  prenom?: string
  photo?: string
  departement?: string
  poste?: string
  role: Role
  id_manager?: string
  created_at: string
  updated_at: string
}


