-- Table des projets MEAL
CREATE TABLE IF NOT EXISTS projets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  code_projet TEXT UNIQUE NOT NULL,
  objectifs TEXT,
  zones_intervention TEXT,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  budget_total DECIMAL(12, 2) NOT NULL,
  id_responsable UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE,
  CHECK (date_debut <= date_fin),
  CHECK (budget_total >= 0)
);

-- Table des activités de projet
CREATE TABLE IF NOT EXISTS activites_projet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  date_debut DATE,
  date_fin DATE,
  budget_alloue DECIMAL(12, 2) DEFAULT 0,
  taux_realisation_physique INTEGER DEFAULT 0 CHECK (taux_realisation_physique >= 0 AND taux_realisation_physique <= 100),
  taux_realisation_financiere DECIMAL(5, 2) DEFAULT 0 CHECK (taux_realisation_financiere >= 0 AND taux_realisation_financiere <= 100),
  depenses_reelles DECIMAL(12, 2) DEFAULT 0,
  ordre INTEGER DEFAULT 0,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE,
  CHECK (date_debut IS NULL OR date_fin IS NULL OR date_debut <= date_fin)
);

-- Table des indicateurs de projet
CREATE TABLE IF NOT EXISTS indicateurs_projet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  id_activite UUID REFERENCES activites_projet(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  valeur_cible DECIMAL(12, 2),
  valeur_actuelle DECIMAL(12, 2) DEFAULT 0,
  unite TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projets_responsable ON projets(id_responsable);
CREATE INDEX IF NOT EXISTS idx_projets_code ON projets(code_projet);
CREATE INDEX IF NOT EXISTS idx_activites_projet ON activites_projet(id_projet);
CREATE INDEX IF NOT EXISTS idx_activites_ordre ON activites_projet(id_projet, ordre);
CREATE INDEX IF NOT EXISTS idx_indicateurs_projet ON indicateurs_projet(id_projet);
CREATE INDEX IF NOT EXISTS idx_indicateurs_activite ON indicateurs_projet(id_activite);

-- Trigger pour updated_at
CREATE TRIGGER update_projets_updated_at
  BEFORE UPDATE ON projets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activites_projet_updated_at
  BEFORE UPDATE ON activites_projet
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

