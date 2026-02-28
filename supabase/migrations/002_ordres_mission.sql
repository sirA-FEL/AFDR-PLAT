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
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente', 'approuve', 'rejete', 'en_cours', 'termine')),
  id_validateur_chef UUID REFERENCES profils(id) ON DELETE SET NULL,
  id_validateur_finance UUID REFERENCES profils(id) ON DELETE SET NULL,
  id_validateur_direction UUID REFERENCES profils(id) ON DELETE SET NULL,
  commentaire_validation TEXT,
  pdf_url TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE,
  CHECK (date_debut <= date_fin)
);

-- Table des documents justificatifs des ordres de mission
CREATE TABLE IF NOT EXISTS documents_ordres_mission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordre_mission UUID NOT NULL REFERENCES ordres_mission(id) ON DELETE CASCADE,
  nom_fichier TEXT NOT NULL,
  chemin_fichier TEXT NOT NULL,
  type_fichier TEXT,
  taille_fichier INTEGER,
  date_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ordres_mission_demandeur ON ordres_mission(id_demandeur);
CREATE INDEX IF NOT EXISTS idx_ordres_mission_statut ON ordres_mission(statut);
CREATE INDEX IF NOT EXISTS idx_ordres_mission_dates ON ordres_mission(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_documents_ordre ON documents_ordres_mission(id_ordre_mission);

-- Trigger pour updated_at (idempotent)
DROP TRIGGER IF EXISTS update_ordres_mission_updated_at ON ordres_mission;
CREATE TRIGGER update_ordres_mission_updated_at
  BEFORE UPDATE ON ordres_mission
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



