-- Script pour créer un utilisateur de test
-- IMPORTANT: Vous devez d'abord créer l'utilisateur via l'interface Supabase Auth
-- ou via l'API, puis exécuter ce script pour créer le profil et le rôle

-- Étape 1: Créer l'utilisateur dans auth.users (à faire via l'interface Supabase ou l'API)
-- Pour créer via l'interface Supabase:
-- 1. Allez dans Authentication > Users > Add User
-- 2. Entrez l'email: test@afdr.org
-- 3. Entrez le mot de passe: Test123456!
-- 4. Désactivez "Auto Confirm User" si vous voulez confirmer manuellement
-- 5. Cliquez sur "Create User"
-- 6. Copiez l'UUID de l'utilisateur créé

-- Étape 2: Remplacer l'UUID ci-dessous par l'UUID de l'utilisateur créé
-- Vous pouvez trouver l'UUID dans Authentication > Users après avoir créé l'utilisateur

-- Exemple: Remplacez '00000000-0000-0000-0000-000000000000' par l'UUID réel
-- DO NOT RUN: Ceci est un exemple, remplacez l'UUID avant d'exécuter

-- Créer le profil
INSERT INTO profils (id, email, nom, prenom, departement, poste)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Remplacez par l'UUID de l'utilisateur
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

-- Assigner le rôle PM (Project Manager) - vous pouvez changer le rôle
INSERT INTO roles_utilisateurs (id_utilisateur, role)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Remplacez par l'UUID de l'utilisateur
  'PM'
)
ON CONFLICT (id_utilisateur, role) DO NOTHING;

-- Vérifier que tout est créé
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

