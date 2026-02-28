/**
 * Crée un compte utilisateur avec le rôle demandé (Niveau 1, 2, 3, Partenaire ou Validateur).
 * À exécuter avec la clé service_role.
 *
 * Usage:
 *   ROLE=USER EMAIL=niveau1@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
 *   ROLE=PM EMAIL=niveau2@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
 *   ROLE=DIR EMAIL=validateur@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
 *   ROLE=PART EMAIL=partenaire@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
 *
 * Variables d'environnement: ROLE (obligatoire), EMAIL, PASSWORD, NOM, PRENOM.
 * Voir scripts/README-seed-accounts.md pour les exemples par type de compte.
 */

import { createClient } from "@supabase/supabase-js"

const VALID_ROLES = ["USER", "PM", "FIN", "LOG", "GRH", "DIR", "MEAL", "PART"]

const roleDefaults = {
  USER: { email: "niveau1@afdr.local", password: "Niveau1-Mission-2025!", nom: "Utilisateur", prenom: "Niveau 1" },
  PM: { email: "niveau2-pm@afdr.local", password: "Niveau2-2025!", nom: "Utilisateur", prenom: "Niveau 2 PM" },
  FIN: { email: "niveau2-fin@afdr.local", password: "Niveau2-2025!", nom: "Utilisateur", prenom: "Niveau 2 FIN" },
  LOG: { email: "niveau2-log@afdr.local", password: "Niveau2-2025!", nom: "Utilisateur", prenom: "Niveau 2 LOG" },
  GRH: { email: "niveau2-grh@afdr.local", password: "Niveau2-2025!", nom: "Utilisateur", prenom: "Niveau 2 GRH" },
  DIR: { email: "niveau3-dir@afdr.local", password: "Niveau3-2025!", nom: "Direction", prenom: "Utilisateur" },
  MEAL: { email: "niveau3-meal@afdr.local", password: "Niveau3-2025!", nom: "MEAL", prenom: "Utilisateur" },
  PART: { email: "partenaire@afdr.local", password: "Partenaire-2025!", nom: "Partenaire", prenom: "Utilisateur" },
}

const role = (process.env.ROLE || "").toUpperCase().trim()
if (!role || !VALID_ROLES.includes(role)) {
  console.error("ROLE obligatoire. Valeurs autorisées:", VALID_ROLES.join(", "))
  console.error("Exemple: ROLE=USER EMAIL=user@test.com PASSWORD=xxx node scripts/seed-account.mjs")
  process.exit(1)
}

const defaults = roleDefaults[role]
const EMAIL = process.env.EMAIL || defaults.email
const PASSWORD = process.env.PASSWORD || defaults.password
const NOM = process.env.NOM || defaults.nom
const PRENOM = process.env.PRENOM || defaults.prenom

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error("Variables requises : SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY.")
  console.error("La clé service_role se trouve dans : Supabase Dashboard > Project Settings > API.")
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

async function main() {
  console.log(`Création du compte (rôle ${role})...`, EMAIL)

  const { data: userData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { nom: NOM, prenom: PRENOM },
  })

  let userId

  if (authError) {
    if (authError.message?.includes("already been registered") || authError.message?.includes("already exists")) {
      console.log("Un utilisateur avec cet email existe déjà. Mise à jour profil et rôle...")
      const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const u = list?.users?.find((x) => x.email === EMAIL)
      if (!u) {
        console.error("Utilisateur introuvable dans la liste.")
        process.exit(1)
      }
      userId = u.id
    } else {
      console.error("Erreur auth:", authError.message)
      process.exit(1)
    }
  } else {
    if (!userData?.user?.id) {
      console.error("Utilisateur non créé.")
      process.exit(1)
    }
    userId = userData.user.id
  }

  const { error: profilError } = await supabase.from("profils").upsert(
    {
      id: userId,
      email: EMAIL,
      nom: NOM,
      prenom: PRENOM,
    },
    { onConflict: "id" }
  )

  if (profilError) {
    console.error("Erreur profil:", profilError.message)
    process.exit(1)
  }

  const { error: roleError } = await supabase
    .from("roles_utilisateurs")
    .insert({ id_utilisateur: userId, role })

  if (roleError) {
    if (roleError.code === "23505") {
      console.log(`Rôle ${role} déjà présent pour cet utilisateur.`)
    } else {
      console.error("Erreur rôle:", roleError.message)
      process.exit(1)
    }
  }

  console.log("Compte créé avec succès.")
  console.log("  Email:", EMAIL)
  console.log("  Mot de passe:", PASSWORD)
  console.log("  Rôle:", role)
  if (["DIR", "MEAL"].includes(role)) {
    console.log("  — Accès complet et validation des ordres de mission.")
  } else if (role === "USER") {
    console.log("  — Peut créer et soumettre des ordres de mission.")
  } else if (role === "PART") {
    console.log("  — Accès à l'espace partenaire (projets partagés uniquement).")
  }
  console.log("Connexion : http://localhost:3000/login")
}

main()
