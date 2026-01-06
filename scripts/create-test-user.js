/**
 * Script Node.js pour créer un utilisateur de test dans Supabase
 * 
 * Usage:
 * 1. Assurez-vous d'avoir les variables d'environnement configurées dans .env.local
 * 2. Exécutez: node scripts/create-test-user.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

// Utiliser la clé service role pour avoir les permissions admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  const testUser = {
    email: 'test@afdr.org',
    password: 'Test123456!',
    email_confirm: true, // Confirmer automatiquement l'email
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
    
    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: testUser.email_confirm,
    })

    if (authError) {
      // Si l'utilisateur existe déjà, on continue
      if (authError.message.includes('already registered')) {
        console.log('⚠️  L\'utilisateur existe déjà, récupération des informations...')
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const user = existingUser.users.find(u => u.email === testUser.email)
        if (!user) {
          throw new Error('Utilisateur existe mais impossible de le récupérer')
        }
        authData.user = user
      } else {
        throw authError
      }
    }

    const userId = authData.user.id
    console.log('✅ Utilisateur créé avec l\'ID:', userId)

    // 2. Créer le profil
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

    // 3. Assigner le rôle
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

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message)
    if (error.details) {
      console.error('   Détails:', error.details)
    }
    process.exit(1)
  }
}

createTestUser()

