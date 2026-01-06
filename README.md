# Plateforme AFDR

Plateforme de gestion complète pour l'AFDR avec 7 modules : Ordres de Mission, MEAL, Finance, Logistique, TdRs, GRH et Rapportage.

## Technologies

- **Frontend** : Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Formulaires** : React Hook Form + Zod
- **Graphiques** : Recharts
- **PDF** : jsPDF + html2canvas
- **Notifications** : Supabase Edge Functions

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd afdr-platform
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.local.example .env.local
```

Remplir `.env.local` avec vos credentials Supabase :
```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

4. Configurer Supabase

- Créer un projet Supabase
- Exécuter les migrations SQL dans l'ordre :
  - `supabase/migrations/001_schema_initial.sql`
  - `supabase/migrations/002_ordres_mission.sql`
  - `supabase/migrations/003_meal.sql`
  - `supabase/migrations/004_finance.sql`
  - `supabase/migrations/005_logistique.sql`
  - `supabase/migrations/006_tdr_grh_rapportage.sql`
  - `supabase/migrations/007_notifications.sql`
  - `supabase/migrations/008_policies_storage.sql`
  - `supabase/migrations/009_policies_rls.sql`
  - `supabase/migrations/010_fonctions.sql`

- Créer les buckets Storage :
  - `documents-ordre-mission`
  - `documents-projets`
  - `justificatifs-depenses`
  - `tdrs`
  - `documents-grh`
  - `rapports`

- Déployer les Edge Functions :
  - `supabase/functions/alertes-meal`
  - `supabase/functions/relances-rapports`
  - `supabase/functions/envoi-email`

5. Lancer le serveur de développement
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
src/
├── app/                    # Routes Next.js
│   ├── (auth)/            # Routes authentification
│   ├── (dashboard)/       # Routes protégées
│   │   ├── ordres-mission/
│   │   ├── meal/
│   │   ├── finance/
│   │   ├── logistique/
│   │   ├── tdr/
│   │   ├── grh/
│   │   └── rapportage/
│   └── api/               # API routes
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   ├── forms/            # Composants formulaires
│   ├── layout/           # Composants layout
│   └── notifications/    # Composants notifications
├── lib/                   # Utilitaires et configurations
│   ├── supabase/         # Client Supabase
│   ├── api/              # Services API
│   ├── auth/             # Authentification et RBAC
│   ├── validations/      # Schémas Zod
│   └── utils/            # Fonctions utilitaires
└── types/                 # Types TypeScript
```

## Modules

### 1. Ordres de Mission
- Soumission d'ordres de mission
- Circuit de validation (Chef → Finance → Direction)
- Consultation et suivi
- Génération PDF

### 2. MEAL
- Gestion des projets
- Gestion des activités
- Suivi de réalisation (physique/financier)
- Dashboards et alertes

### 3. Finance
- Gestion des budgets
- Enregistrement des dépenses
- Suivi financier
- Reporting

### 4. Logistique
- Expression de besoins
- Gestion des véhicules
- Planification des entretiens

### 5. TdRs
- Soumission de TdRs
- Validation
- Recherche et archive

### 6. GRH
- Gestion du personnel
- Gestion des congés
- Calendrier des absences

### 7. Rapportage
- Soumission de rapports
- Suivi des délais
- Relances automatiques
- Archive

## Rôles

- **DIR** : Direction
- **MEAL** : Suivi des projets
- **FIN** : Finance
- **LOG** : Logistique
- **GRH** : Ressources Humaines
- **PM** : Project Manager
- **USER** : Utilisateur standard

## Scripts

- `npm run dev` : Lancer le serveur de développement
- `npm run build` : Construire pour la production
- `npm run start` : Lancer le serveur de production
- `npm run lint` : Vérifier le code avec ESLint

## Notes

- Toutes les tables de la base de données utilisent des noms en français
- L'interface est entièrement en français
- Les Edge Functions doivent être configurées avec les variables d'environnement appropriées
- Les policies RLS sont activées sur toutes les tables pour la sécurité

## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement.
