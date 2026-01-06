#!/bin/bash
# Script bash pour créer les buckets Storage Supabase
# Prérequis: Supabase CLI installé et projet lié

echo "Création des buckets Storage Supabase..."
echo ""

# Liste des buckets à créer (tous en mode Private)
buckets=(
    "documents-ordre-mission"
    "documents-projets"
    "justificatifs-depenses"
    "tdrs"
    "documents-grh"
    "rapports"
)

for bucket in "${buckets[@]}"; do
    echo "Création du bucket: $bucket"
    
    # Créer le bucket avec Supabase CLI
    if supabase storage create "$bucket" --public false 2>/dev/null; then
        echo "  ✓ Bucket '$bucket' créé avec succès"
    else
        # Vérifier si le bucket existe déjà
        if supabase storage list | grep -q "$bucket"; then
            echo "  ⚠ Bucket '$bucket' existe déjà"
        else
            echo "  ✗ Erreur lors de la création"
        fi
    fi
    echo ""
done

echo "Terminé !"
echo ""
echo "Vérification des buckets créés:"
supabase storage list


