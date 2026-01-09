# Guide d'intégration Supabase

## ✅ Ce qui a été créé

### 1. Clients Supabase
- **`src/lib/supabase/client.ts`** : Client pour Client Components (déjà existant)
- **`src/lib/supabase/server.ts`** : Client pour Server Components (nouveau)

### 2. Services CRUD
- **`src/lib/supabase/services/ordres-mission.ts`** : Gestion des ordres de mission
- **`src/lib/supabase/services/projets.ts`** : Gestion des projets MEAL
- **`src/lib/supabase/services/employes.ts`** : Gestion des employés (GRH)

### 3. Migrations SQL
- **`supabase/migrations/002_ordres_mission.sql`** : Tables ordres_mission et documents
- **`supabase/migrations/003_projets_meal.sql`** : Tables projets, activités, indicateurs

## 📋 Prochaines étapes

### 1. Appliquer les migrations dans Supabase

```bash
# Option 1 : Via Supabase CLI
supabase db push

# Option 2 : Via Dashboard Supabase
# Allez dans SQL Editor et exécutez les fichiers de migration dans l'ordre :
# - 002_ordres_mission.sql
# - 003_projets_meal.sql
```

### 2. Configurer le Storage pour les documents

Dans le Dashboard Supabase :
1. Allez dans **Storage**
2. Créez un bucket `photos-employes` (public)
3. Créez un bucket `documents-ordres-mission` (public ou privé selon besoin)

### 3. Configurer les RLS (Row Level Security)

Les politiques RLS doivent être configurées dans `supabase/migrations/009_policies_rls.sql` ou via le Dashboard.

Exemple pour ordres_mission :
```sql
-- Les utilisateurs peuvent voir leurs propres ordres
CREATE POLICY "Users can view own orders"
ON ordres_mission FOR SELECT
USING (auth.uid() = id_demandeur);

-- Les managers peuvent voir les ordres de leur équipe
CREATE POLICY "Managers can view team orders"
ON ordres_mission FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hierarchies
    WHERE id_manager = auth.uid()
    AND id_utilisateur = ordres_mission.id_demandeur
  )
);
```

## 🔧 Utilisation dans les pages

### Exemple : Page "Nouvel ordre de mission"

```typescript
"use client"

import { ordresMissionService } from "@/lib/supabase/services"

export default function NouvelOrdreMissionPage() {
  const handleSubmit = async (formData) => {
    try {
      // Créer l'ordre de mission
      const ordre = await ordresMissionService.create({
        destination: formData.destination,
        date_debut: formData.dateDebut,
        date_fin: formData.dateFin,
        motif: formData.motif,
        activites_prevues: formData.activitesPrevues,
        budget_estime: parseFloat(formData.budgetEstime),
      })

      // Soumettre (passe de brouillon à en_attente)
      await ordresMissionService.submit(ordre.id)

      router.push("/ordres-mission/mes-ordres")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la création")
    }
  }
}
```

### Exemple : Page "Mes ordres"

```typescript
"use client"

import { useState, useEffect } from "react"
import { ordresMissionService } from "@/lib/supabase/services"

export default function MesOrdresPage() {
  const [ordres, setOrdres] = useState([])

  useEffect(() => {
    loadOrdres()
  }, [])

  const loadOrdres = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const data = await ordresMissionService.getAll({
        id_demandeur: user.id,
        periode: "annee"
      })
      setOrdres(data)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }
}
```

### Exemple : Page "Validation"

```typescript
"use client"

import { ordresMissionService } from "@/lib/supabase/services"

const handleApprouver = async (ordreId: string, commentaire: string) => {
  try {
    await ordresMissionService.approve(ordreId, "chef", commentaire)
    // Notification envoyée automatiquement
    alert("Ordre approuvé")
  } catch (error) {
    console.error("Erreur:", error)
  }
}
```

## 📝 Notes importantes

1. **Authentification** : Toutes les opérations nécessitent un utilisateur authentifié
2. **RLS** : Les politiques de sécurité doivent être configurées
3. **Types** : Les interfaces TypeScript correspondent aux tables Supabase
4. **Erreurs** : Tous les services lancent des erreurs à gérer avec try/catch

## 🚀 Intégration dans les pages existantes

Les pages créées (`ordres-mission/page.tsx`, `ordres-mission/nouveau/page.tsx`, etc.) ont des `TODO` à remplacer par les appels aux services Supabase.

Cherchez `// TODO: Intégrer avec Supabase` dans les fichiers et remplacez par les appels aux services appropriés.

