-- Rôle Partenaire (PART) et table de partage projet / partenaire

-- Étendre la contrainte des rôles pour accepter PART
ALTER TABLE roles_utilisateurs
  DROP CONSTRAINT IF EXISTS roles_utilisateurs_role_check;

ALTER TABLE roles_utilisateurs
  ADD CONSTRAINT roles_utilisateurs_role_check
  CHECK (role IN ('DIR', 'MEAL', 'FIN', 'LOG', 'GRH', 'PM', 'USER', 'PART'));

-- Table : quels partenaires ont accès à quels projets
CREATE TABLE IF NOT EXISTS partenaires_projet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_projet UUID NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  id_partenaire UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  date_partage TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actif BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(id_projet, id_partenaire)
);

CREATE INDEX IF NOT EXISTS idx_partenaires_projet_projet ON partenaires_projet(id_projet);
CREATE INDEX IF NOT EXISTS idx_partenaires_projet_partenaire ON partenaires_projet(id_partenaire);
