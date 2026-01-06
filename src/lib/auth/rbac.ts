import type { Role } from '@/types/auth'

export function hasRole(userRole: Role | undefined, requiredRole: Role | Role[]): boolean {
  if (!userRole) return false
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  
  return userRole === requiredRole
}

export function canAccess(userRole: Role | undefined, requiredRoles: Role | Role[]): boolean {
  return hasRole(userRole, requiredRoles)
}

// Hiérarchie des rôles pour les permissions
const roleHierarchy: Record<Role, number> = {
  DIR: 7,
  MEAL: 6,
  FIN: 5,
  LOG: 4,
  GRH: 4,
  PM: 3,
  USER: 1,
}

export function hasMinimumRole(userRole: Role | undefined, minimumRole: Role): boolean {
  if (!userRole) return false
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}


