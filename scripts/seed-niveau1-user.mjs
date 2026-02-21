/**
 * Crée un utilisateur de test NIVEAU 1 (rôle USER) pour soumettre des ordres de mission.
 * À exécuter une seule fois, avec la clé service_role.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-niveau1-user.mjs
 *   Ou avec .env.local : node -r dotenv/config scripts/seed-niveau1-user.mjs
 *
 * Vous pouvez modifier EMAIL et PASSWORD ci-dessous.
 */

import { createClient } from "@supabase/supabase-js"

const EMAIL = process.env.SEED_NIVEAU1_EMAIL || "niveau1@afdr.local"
const PASSWORD = process.env.SEED_NIVEAU1_PASSWORD || "Niveau1-Mission-2025!"

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error(
    "Variables requises : SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY."
  )
  console.error("La clé service_role se trouve dans : Supabase Dashboard > Project Settings > API.")
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

async function main() {
  console.log("Création de l'utilisateur niveau 1 (USER)...", EMAIL)

  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { nom: "Utilisateur", prenom: "Niveau 1" },
  })

  if (authError) {
    if (authError.message?.includes("already been registered")) {
      console.log("Un utilisateur avec cet email existe déjà. Vérification profil et rôle USER...")
      const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const u = list?.users?.find((x) => x.email === EMAIL)
      if (u) {
        await supabase.from("profils").upsert(
          { id: u.id, email: EMAIL, nom: "Utilisateur", prenom: "Niveau 1" },
          { onConflict: "id" }
        )
        const { error: roleErr } = await supabase
          .from("roles_utilisateurs")
          .insert({ id_utilisateur: u.id, role: "USER" })
        if (roleErr && roleErr.code !== "23505") console.error("Rôle:", roleErr.message)
        else console.log("Profil et rôle USER OK pour", EMAIL)
      }
      return
    }
    console.error("Erreur auth:", authError.message)
    process.exit(1)
  }

  if (!user?.user?.id) {
    console.error("Utilisateur non créé.")
    process.exit(1)
  }

  const userId = user.user.id

  const { error: profilError } = await supabase.from("profils").upsert(
    {
      id: userId,
      email: EMAIL,
      nom: "Utilisateur",
      prenom: "Niveau 1",
    },
    { onConflict: "id" }
  )

  if (profilError) {
    console.error("Erreur profil:", profilError.message)
    process.exit(1)
  }

  const { error: roleError } = await supabase
    .from("roles_utilisateurs")
    .insert({ id_utilisateur: userId, role: "USER" })

  if (roleError) {
    if (roleError.code === "23505") {
      console.log("Rôle USER déjà présent pour cet utilisateur.")
    } else {
      console.error("Erreur rôle:", roleError.message)
      process.exit(1)
    }
  }

  console.log("Profil niveau 1 créé avec succès.")
  console.log("  Email:", EMAIL)
  console.log("  Mot de passe:", PASSWORD)
  console.log("  Rôle: USER (niveau 1) — peut créer et soumettre des ordres de mission.")
  console.log("Connectez-vous avec ce compte pour soumettre un ordre, puis validez avec un compte DIR/MEAL.")
}

main()
