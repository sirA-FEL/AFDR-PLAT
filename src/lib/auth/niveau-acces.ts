/**
 * Niveaux d'accès de la plateforme AFDR.
 * Niveau 1 = Utilisateur (USER), Niveau 2 = Responsable (PM, FIN, LOG, GRH), Niveau 3 = Direction / Admin (DIR, MEAL).
 * PART = Partenaire (accès limité à l'espace partenaire, projets partagés uniquement).
 */

export type Role = "DIR" | "MEAL" | "FIN" | "LOG" | "GRH" | "PM" | "USER" | "PART"

export type NiveauAcces = 1 | 2 | 3

const ROLES_NIVEAU_3: Role[] = ["DIR", "MEAL"]
const ROLES_NIVEAU_2: Role[] = ["PM", "FIN", "LOG", "GRH"]
const ROLES_NIVEAU_1: Role[] = ["USER"]

/**
 * Dérive le niveau d'accès effectif à partir des rôles de l'utilisateur.
 */
export function getNiveauAcces(roles: string[]): NiveauAcces {
  if (!roles || roles.length === 0) return 1
  if (roles.includes("PART")) return 1 // Partenaire : accès restreint, géré à part
  if (roles.some((r) => ROLES_NIVEAU_3.includes(r as Role))) return 3
  if (roles.some((r) => ROLES_NIVEAU_2.includes(r as Role))) return 2
  return 1
}

/** True si l'utilisateur a uniquement (ou inclut) le rôle Partenaire. */
export function isPartenaire(roles: string[]): boolean {
  return roles?.includes("PART") ?? false
}

/**
 * Indique si l'utilisateur a au moins le niveau demandé.
 */
export function hasNiveauMin(niveauAcces: NiveauAcces, niveauMin: NiveauAcces): boolean {
  return niveauAcces >= niveauMin
}

/**
 * Indique si l'utilisateur a un des rôles donnés.
 */
export function hasRole(roles: string[], role: Role | Role[]): boolean {
  const list = Array.isArray(role) ? role : [role]
  return list.some((r) => roles.includes(r))
}
