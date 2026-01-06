-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profils (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT,
  photo TEXT,
  departement TEXT,
  poste TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS roles_utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('DIR', 'MEAL', 'FIN', 'LOG', 'GRH', 'PM', 'USER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_utilisateur, role)
);

-- Table des hiérarchies (structure managériale)
CREATE TABLE IF NOT EXISTS hierarchies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_manager UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  id_utilisateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_manager, id_utilisateur),
  CHECK (id_manager != id_utilisateur)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_roles_utilisateur ON roles_utilisateurs(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_hierarchies_manager ON hierarchies(id_manager);
CREATE INDEX IF NOT EXISTS idx_hierarchies_utilisateur ON hierarchies(id_utilisateur);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour profils
CREATE TRIGGER update_profils_updated_at
  BEFORE UPDATE ON profils
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

