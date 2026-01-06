// Types partagés pour la plateforme AFDR

export type StatutOrdreMission =
  | "brouillon"
  | "en_attente_chef"
  | "en_attente_finance"
  | "en_attente_direction"
  | "approuve"
  | "rejete"

export type StatutProjet = "actif" | "suspendu" | "termine" | "annule"

export type StatutDemandeAchat =
  | "brouillon"
  | "soumis"
  | "en_attente"
  | "approuve"
  | "rejete"
  | "traite"

export type StatutTdr = "en_attente" | "en_revision" | "approuve" | "rejete"

export type StatutRapport = "en_attente" | "soumis" | "en_retard"

export type StatutDemandeConge = "en_attente" | "approuve" | "rejete"

export type TypeNotification =
  | "validation_requise"
  | "approbation"
  | "alerte"
  | "mention"


