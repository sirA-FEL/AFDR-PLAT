/**
 * Script TypeScript pour créer un utilisateur de test dans Supabase
 * 
 * Usage:
 * 1. Assurez-vous d'avoir les variables d'environnement configurées dans .env.local
 * 2. Exécutez: npx tsx scripts/create-test-user.ts
 * 
 * OU utilisez directement l'interface Supabase:
 * 1. Allez dans Authentication > Users > Add User
 * 2. Créez l'utilisateur avec email: test@afdr.org, password: Test123456!
 * 3. Exécutez le script SQL: scripts/create-test-user.sql (après avoir remplacé l'UUID)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Lire les variables d'environnement depuis .env.local
const envPath = path.join(process.cwd(), '.env.local')
let envVars: Record<string, string> = {}

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      envVars[key] = value
    }
  })
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local')
  process.exit(1)
}

// Utiliser la clé service role si disponible, sinon utiliser anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey

if (!supabaseKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  const testUser = {
    email: 'test@afdr.org',
    password: 'Test123456!',
  }

  const testProfile = {
    nom: 'Test',
    prenom: 'Utilisateur',
    departement: 'Administration',
    poste: 'Chef de Projet',
  }

  const testRole = 'PM' // Project Manager - vous pouvez changer: DIR, MEAL, FIN, LOG, GRH, PM, USER

  try {
    console.log('🔄 Création de l\'utilisateur de test...')
    
    // Si on a la clé service role, on peut créer l'utilisateur directement
    if (supabaseServiceKey) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
      })

      let userId: string

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          console.log('⚠️  L\'utilisateur existe déjà, récupération des informations...')
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const user = existingUsers?.users?.find((u: any) => u.email === testUser.email)
          if (!user) {
            throw new Error('Utilisateur existe mais impossible de le récupérer')
          }
          userId = user.id
        } else {
          throw authError
        }
      } else {
        if (!authData?.user) {
          throw new Error('Utilisateur créé mais impossible de récupérer les données')
        }
        userId = authData.user.id
      }

      console.log('✅ Utilisateur créé avec l\'ID:', userId)

      // Créer le profil
      console.log('🔄 Création du profil...')
      const { data: profileData, error: profileError } = await supabase
        .from('profils')
        .upsert({
          id: userId,
          email: testUser.email,
          ...testProfile,
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (profileError) {
        throw profileError
      }
      console.log('✅ Profil créé:', profileData)

      // Assigner le rôle
      console.log('🔄 Attribution du rôle...')
      const { data: roleData, error: roleError } = await supabase
        .from('roles_utilisateurs')
        .upsert({
          id_utilisateur: userId,
          role: testRole,
        }, {
          onConflict: 'id_utilisateur,role'
        })
        .select()
        .single()

      if (roleError) {
        throw roleError
      }
      console.log('✅ Rôle assigné:', roleData)

      console.log('\n🎉 Utilisateur de test créé avec succès!')
      console.log('\n📋 Informations de connexion:')
      console.log('   Email:', testUser.email)
      console.log('   Mot de passe:', testUser.password)
      console.log('   Rôle:', testRole)
      console.log('\n💡 Vous pouvez maintenant vous connecter à http://localhost:3000/login')
    } else {
      // Si on n'a pas la clé service role, on donne des instructions
      console.log('⚠️  Clé service role non disponible.')
      console.log('\n📝 Instructions pour créer l\'utilisateur manuellement:')
      console.log('\n1. Allez dans votre dashboard Supabase:')
      console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1]?.split('.')[0])
      console.log('\n2. Allez dans Authentication > Users')
      console.log('\n3. Cliquez sur "Add User"')
      console.log('\n4. Entrez les informations suivantes:')
      console.log('   Email:', testUser.email)
      console.log('   Password:', testUser.password)
      console.log('   Auto Confirm User: ✓ (coché)')
      console.log('\n5. Cliquez sur "Create User"')
      console.log('\n6. Copiez l\'UUID de l\'utilisateur créé')
      console.log('\n7. Exécutez le script SQL: scripts/create-test-user.sql')
      console.log('   (N\'oubliez pas de remplacer l\'UUID dans le script)')
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de la création:', error.message)
    if (error.details) {
      console.error('   Détails:', error.details)
    }
    if (error.hint) {
      console.error('   Indice:', error.hint)
    }
    process.exit(1)
  }
}

createTestUser()
