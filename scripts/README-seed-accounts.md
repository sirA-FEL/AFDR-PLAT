# Scripts de création de comptes (Niveau 1, 2, 3, Partenaires, Validateurs)

Ces scripts permettent de créer des comptes utilisateurs avec les rôles appropriés pour la plateforme AFDR. Ils utilisent l’API Admin Supabase et nécessitent la **clé service_role**.

## Prérequis

1. Récupérer la clé **service_role** : Supabase Dashboard → Project Settings → API → `service_role` (secret).
2. Variables d’environnement requises :
   - `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Vous pouvez les définir dans `.env.local` et charger avec `node -r dotenv/config scripts/seed-account.mjs`, ou les passer en ligne de commande.

## Script générique : `seed-account.mjs`

Un seul script crée n’importe quel type de compte en fonction du rôle.

**Variables d’environnement :**

| Variable   | Obligatoire | Description                                      |
|-----------|-------------|--------------------------------------------------|
| `ROLE`    | Oui         | Rôle du compte (voir tableau des types ci‑dessous) |
| `EMAIL`   | Non         | Email (valeur par défaut selon le rôle)          |
| `PASSWORD`| Non         | Mot de passe (valeur par défaut selon le rôle)   |
| `NOM`     | Non         | Nom affiché (profil)                             |
| `PRENOM`  | Non         | Prénom affiché (profil)                          |

**Exemple minimal (Niveau 1 avec valeurs par défaut) :**
```bash
ROLE=USER node scripts/seed-account.mjs
```

**Exemple avec email et mot de passe personnalisés :**
```bash
ROLE=USER EMAIL=monuser@test.com PASSWORD=MonMotDePasse node scripts/seed-account.mjs
```

## Types de comptes

| Type de compte        | Rôle  | Droits principaux                                      | Exemple de commande |
|-----------------------|-------|--------------------------------------------------------|----------------------|
| **Niveau 1**          | `USER`| Créer et soumettre des ordres de mission               | `ROLE=USER EMAIL=niveau1@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Niveau 2**          | `PM`  | Projets MEAL, responsable projet                       | `ROLE=PM EMAIL=niveau2-pm@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Niveau 2**          | `FIN` | Finance                                                | `ROLE=FIN EMAIL=niveau2-fin@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Niveau 2**          | `LOG` | Logistique                                             | `ROLE=LOG EMAIL=niveau2-log@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Niveau 2**          | `GRH` | GRH                                                    | `ROLE=GRH EMAIL=niveau2-grh@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Niveau 3**          | `DIR` | Direction, accès complet, validation ordres de mission | `ROLE=DIR EMAIL=niveau3-dir@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Niveau 3**          | `MEAL`| MEAL, accès complet, validation ordres de mission     | `ROLE=MEAL EMAIL=niveau3-meal@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Partenaire**        | `PART`| Espace partenaire uniquement (projets partagés)        | `ROLE=PART EMAIL=partenaire@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |
| **Validateur ordres** | `DIR` ou `MEAL` | Même que Niveau 3 ; page « Validation des ordres » | `ROLE=MEAL EMAIL=validateur@afdr.local PASSWORD=xxx node scripts/seed-account.mjs` |

## Exemples par type

### Niveau 1 (soumet les ordres de mission)
```bash
ROLE=USER EMAIL=niveau1@afdr.local PASSWORD=Niveau1-Mission-2025! node scripts/seed-account.mjs
```
Équivalent au script dédié : `scripts/seed-niveau1-user.mjs` (qui fait la même chose avec `ROLE=USER` par défaut).

### Niveau 2 (PM, Finance, Logistique, GRH)
```bash
ROLE=PM EMAIL=niveau2-pm@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
ROLE=FIN EMAIL=niveau2-fin@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
```

### Niveau 3 (Direction / MEAL)
```bash
ROLE=DIR EMAIL=niveau3-dir@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
ROLE=MEAL EMAIL=niveau3-meal@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
```

### Partenaire
```bash
ROLE=PART EMAIL=partenaire@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
```

### Validateur des ordres de mission (DIR ou MEAL)
```bash
ROLE=MEAL EMAIL=validateur@afdr.local PASSWORD=xxx node scripts/seed-account.mjs
```

## Personnalisation du profil (NOM, PRENOM)

```bash
ROLE=USER EMAIL=jean@afdr.local PASSWORD=xxx NOM=Dupont PRENOM=Jean node scripts/seed-account.mjs
```

## Utilisateur déjà existant

Si l’email existe déjà dans Supabase Auth, le script met à jour le profil et assure la présence du rôle demandé (sans erreur si le rôle est déjà attribué).

## Scripts existants

- **seed-niveau1-user.mjs** : crée uniquement un compte Niveau 1 (USER). Pour un compte USER, `seed-account.mjs` avec `ROLE=USER` fait la même chose.
- **create-test-user.ts** : crée un utilisateur de test (rôle PM par défaut) en lisant `.env.local` ; utile en dev avec `npx tsx scripts/create-test-user.ts`.
