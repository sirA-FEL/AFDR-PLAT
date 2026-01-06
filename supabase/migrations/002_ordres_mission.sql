-- Table des ordres de mission
CREATE TABLE IF NOT EXISTS ordres_mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_demandeur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  motif TEXT NOT NULL,
  activites_prevues TEXT,
  budget_estime DECIMAL(12, 2),
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente_chef', 'en_attente_finance', 'en_attente_direction', 'approuve', 'rejete')),
  commentaire_rejet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (date_debut <= date_fin)
);

-- Table des documents justificatifs des ordres de mission
CREATE TABLE IF NOT EXISTS documents_ordre_mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordre_mission UUID NOT NULL REFERENCES ordres_mission(id) ON DELETE CASCADE,
  nom_fichier TEXT NOT NULL,
  chemin_fichier TEXT NOT NULL,
  type_fichier TEXT,
  taille_fichier BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des validations des ordres de mission
CREATE TABLE IF NOT EXISTS validations_ordre_mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordre_mission UUID NOT NULL REFERENCES ordres_mission(id) ON DELETE CASCADE,
  id_validateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  niveau_validation TEXT NOT NULL CHECK (niveau_validation IN ('chef', 'finance', 'direction')),
  decision TEXT NOT NULL CHECK (decision IN ('approuve', 'rejete')),
  commentaire TEXT,
  montant_approuve DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ordres_mission_demandeur ON ordres_mission(id_demandeur);
CREATE INDEX IF NOT EXISTS idx_ordres_mission_statut ON ordres_mission(statut);
CREATE INDEX IF NOT EXISTS idx_ordres_mission_dates ON ordres_mission(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_documents_ordre_mission ON documents_ordre_mission(id_ordre_mission);
CREATE INDEX IF NOT EXISTS idx_validations_ordre_mission ON validations_ordre_mission(id_ordre_mission);

-- Trigger pour updated_at
CREATE TRIGGER update_ordres_mission_updated_at
  BEFORE UPDATE ON ordres_mission
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


