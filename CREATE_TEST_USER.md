# Guide pour créer un utilisateur de test

Il existe plusieurs méthodes pour créer un utilisateur de test dans la plateforme AFDR.

## Méthode 1 : Via l'interface Supabase (Recommandé)

### Étape 1 : Créer l'utilisateur dans Supabase Auth

1. Allez sur votre [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Users**
4. Cliquez sur **Add User** (ou **Invite User**)
5. Remplissez le formulaire :
   - **Email** : `test@afdr.org`
   - **Password** : `Test123456!`
   - Cochez **Auto Confirm User** (pour éviter de confirmer l'email)
6. Cliquez sur **Create User**
7. **Copiez l'UUID** de l'utilisateur créé (vous en aurez besoin pour l'étape suivante)

### Étape 2 : Créer le profil et assigner un rôle

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Ouvrez le fichier `scripts/create-test-user.sql`
3. **Remplacez** `'00000000-0000-0000-0000-000000000000'` par l'UUID que vous avez copié
4. Exécutez le script SQL

**OU** exécutez directement ce SQL (en remplaçant l'UUID) :

```sql
-- Remplacez l'UUID ci-dessous par l'UUID de l'utilisateur créé
INSERT INTO profils (id, email, nom, prenom, departement, poste)
VALUES (
  'VOTRE-UUID-ICI', -- Remplacez par l'UUID de l'utilisateur
  'test@afdr.org',
  'Test',
  'Utilisateur',
  'Administration',
  'Chef de Projet'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nom = EXCLUDED.nom,
  prenom = EXCLUDED.prenom,
  departement = EXCLUDED.departement,
  poste = EXCLUDED.poste;

-- Assigner le rôle PM (Project Manager)
INSERT INTO roles_utilisateurs (id_utilisateur, role)
VALUES (
  'VOTRE-UUID-ICI', -- Remplacez par l'UUID de l'utilisateur
  'PM'
)
ON CONFLICT (id_utilisateur, role) DO NOTHING;
```

### Étape 3 : Vérifier

Vous pouvez vérifier que tout est créé correctement :

```sql
SELECT 
  p.id,
  p.email,
  p.nom,
  p.prenom,
  p.departement,
  p.poste,
  r.role
FROM profils p
LEFT JOIN roles_utilisateurs r ON p.id = r.id_utilisateur
WHERE p.email = 'test@afdr.org';
```

## Méthode 2 : Via le script TypeScript (Si vous avez la clé Service Role)

Si vous avez configuré `SUPABASE_SERVICE_ROLE_KEY` dans votre `.env.local` :

```bash
# Installer tsx si ce n'est pas déjà fait
npm install -g tsx

# Exécuter le script
npx tsx scripts/create-test-user.ts
```

**Note** : La clé Service Role est sensible et ne doit jamais être exposée côté client. Elle est uniquement nécessaire pour créer des utilisateurs via l'API.

## Méthode 3 : Via l'interface de l'application (À venir)

Une page d'inscription sera ajoutée dans une future version.

## Rôles disponibles

Vous pouvez assigner l'un des rôles suivants :
- `DIR` : Directeur
- `MEAL` : Responsable MEAL
- `FIN` : Responsable Finance
- `LOG` : Responsable Logistique
- `GRH` : Responsable GRH
- `PM` : Project Manager (Chef de Projet)
- `USER` : Utilisateur standard

## Connexion

Une fois l'utilisateur créé, vous pouvez vous connecter avec :
- **Email** : `test@afdr.org`
- **Password** : `Test123456!`

Allez sur : http://localhost:3000/login

## Dépannage

### L'utilisateur existe déjà
Si vous obtenez une erreur "already registered", l'utilisateur existe déjà. Vous pouvez :
1. Soit utiliser un autre email
2. Soit supprimer l'utilisateur existant dans Supabase Auth
3. Soit simplement exécuter le script SQL pour créer le profil (l'utilisateur auth existe déjà)

### Erreur de permissions
Assurez-vous que les politiques RLS (Row Level Security) permettent l'insertion dans les tables `profils` et `roles_utilisateurs`. Les migrations devraient avoir configuré cela automatiquement.

