/**
 * Script pour configurer les variables d'environnement Vercel
 * 
 * Usage:
 * 1. Assurez-vous d'être connecté à Vercel CLI: vercel login
 * 2. Lisez les variables depuis .env.local ou entrez-les manuellement
 * 3. Exécutez: npx tsx scripts/setup-vercel-env.ts
 * 
 * OU utilisez directement le CLI Vercel:
 * vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// Lire les variables d'environnement depuis .env.local
const envPath = path.join(process.cwd(), '.env.local')
let envVars: Record<string, string> = {}

if (fs.existsSync(envPath)) {
  console.log('📖 Lecture de .env.local...')
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      envVars[key] = value
    }
  })
  console.log(`✅ ${Object.keys(envVars).length} variables trouvées dans .env.local\n`)
} else {
  console.log('⚠️  Fichier .env.local non trouvé\n')
}

// Variables requises pour Vercel
const requiredVars = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'URL de votre projet Supabase',
    environments: ['production', 'preview', 'development'] as const
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Clé anonyme Supabase (publique)',
    environments: ['production', 'preview', 'development'] as const
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Clé service role Supabase (privée, optionnelle)',
    environments: ['production'] as const,
    optional: true
  }
]

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function getValue(varName: string, description: string, defaultValue?: string): Promise<string> {
  if (defaultValue) {
    const useDefault = await question(`📝 ${varName} (${description})\n   Valeur trouvée: ${defaultValue.substring(0, 20)}...\n   Utiliser cette valeur? (O/n): `)
    if (useDefault.toLowerCase() !== 'n') {
      return defaultValue
    }
  }
  
  const value = await question(`📝 ${varName} (${description})\n   Entrez la valeur: `)
  if (!value.trim()) {
    throw new Error(`La valeur pour ${varName} est requise`)
  }
  return value.trim()
}

async function setupEnvironmentVariables() {
  console.log('🚀 Configuration des variables d\'environnement Vercel\n')
  console.log('=' .repeat(60))
  console.log('')

  // Vérifier la connexion Vercel
  try {
    execSync('vercel whoami', { stdio: 'pipe' })
    console.log('✅ Connecté à Vercel CLI\n')
  } catch (error) {
    console.error('❌ Erreur: Vous devez être connecté à Vercel CLI')
    console.error('   Exécutez: vercel login')
    process.exit(1)
  }

  const varsToAdd: Array<{ key: string; value: string; environments: string[] }> = []

  // Collecter les valeurs
  for (const varConfig of requiredVars) {
    const existingValue = envVars[varConfig.key]
    
    if (!existingValue && !varConfig.optional) {
      console.log(`\n⚠️  Variable requise: ${varConfig.key}`)
    }

    try {
      const value = await getValue(
        varConfig.key,
        varConfig.description,
        existingValue
      )
      
      varsToAdd.push({
        key: varConfig.key,
        value: value,
        environments: varConfig.environments as string[]
      })
    } catch (error: any) {
      if (varConfig.optional) {
        console.log(`   ⏭️  Variable optionnelle ignorée: ${varConfig.key}`)
      } else {
        console.error(`❌ ${error.message}`)
        process.exit(1)
      }
    }
  }

  rl.close()

  // Ajouter les variables à Vercel
  console.log('\n' + '='.repeat(60))
  console.log('📤 Ajout des variables à Vercel...\n')

  for (const varToAdd of varsToAdd) {
    console.log(`\n🔄 Configuration de ${varToAdd.key}...`)
    
    for (const env of varToAdd.environments) {
      try {
        // Utiliser echo pour passer la valeur à vercel env add
        const command = `echo "${varToAdd.value}" | vercel env add ${varToAdd.key} ${env}`
        execSync(command, { 
          stdio: 'inherit',
          shell: true
        })
        console.log(`   ✅ ${varToAdd.key} ajouté pour ${env}`)
      } catch (error: any) {
        console.error(`   ⚠️  Erreur lors de l'ajout de ${varToAdd.key} pour ${env}:`)
        console.error(`      ${error.message}`)
        console.error(`   💡 Vous pouvez l'ajouter manuellement avec:`)
        console.error(`      vercel env add ${varToAdd.key} ${env}`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Configuration terminée!\n')
  console.log('📋 Vérifiez les variables avec: vercel env ls')
  console.log('🌐 Ou dans le dashboard: https://vercel.com/dashboard\n')
}

// Alternative: script non-interactif qui génère les commandes
function generateCommands() {
  console.log('📝 Commandes Vercel CLI à exécuter:\n')
  console.log('# Copiez-collez ces commandes une par une\n')
  
  for (const varConfig of requiredVars) {
    const value = envVars[varConfig.key]
    if (!value && !varConfig.optional) {
      console.log(`# ⚠️  ${varConfig.key} manquant dans .env.local`)
      console.log(`echo "VOTRE_VALEUR" | vercel env add ${varConfig.key} production preview development\n`)
    } else if (value) {
      console.log(`# ${varConfig.description}`)
      for (const env of varConfig.environments) {
        console.log(`echo "${value}" | vercel env add ${varConfig.key} ${env}`)
      }
      console.log('')
    }
  }
}

// Exécuter
const args = process.argv.slice(2)
if (args.includes('--generate') || args.includes('-g')) {
  generateCommands()
} else {
  setupEnvironmentVariables().catch(error => {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  })
}





