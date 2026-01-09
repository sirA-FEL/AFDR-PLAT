#!/bin/bash

# Script bash pour configurer les variables d'environnement Vercel
# Usage: ./scripts/setup-vercel-env.sh

set -e

echo "🚀 Configuration des variables d'environnement Vercel"
echo "=================================================="
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "   Installez-le avec: npm i -g vercel"
    exit 1
fi

# Vérifier la connexion
if ! vercel whoami &> /dev/null; then
    echo "❌ Vous devez être connecté à Vercel CLI"
    echo "   Exécutez: vercel login"
    exit 1
fi

echo "✅ Connecté à Vercel CLI"
echo ""

# Charger les variables depuis .env.local si disponible
if [ -f .env.local ]; then
    echo "📖 Lecture de .env.local..."
    source .env.local
    echo "✅ Variables chargées depuis .env.local"
    echo ""
fi

# Fonction pour ajouter une variable
add_env_var() {
    local var_name=$1
    var_value=$2
    shift 2
    local environments=("$@")
    
    if [ -z "$var_value" ]; then
        echo "⚠️  $var_name non définie, ignorée"
        return
    fi
    
    echo "🔄 Configuration de $var_name..."
    for env in "${environments[@]}"; do
        echo "$var_value" | vercel env add "$var_name" "$env" || {
            echo "   ⚠️  Erreur pour $env (peut-être déjà définie)"
        }
    done
    echo "   ✅ $var_name configurée"
    echo ""
}

# Variables requises
echo "📝 Configuration des variables..."
echo ""

add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" production preview development
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" production preview development
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" production

echo "=================================================="
echo "✅ Configuration terminée!"
echo ""
echo "📋 Vérifiez les variables avec: vercel env ls"
echo "🌐 Ou dans le dashboard: https://vercel.com/dashboard"
echo ""

