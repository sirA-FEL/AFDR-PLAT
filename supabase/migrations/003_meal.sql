-- Table des projets
CREATE TABLE IF NOT EXISTS projets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  code_projet TEXT UNIQUE,
  objectifs TEXT,
  zones_intervention TEXT[],
  date_debut DATE,
  date_fin DATE,
  budget_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  id_responsable UUID REFERENCES profils(id) ON DELETE SET NULL,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu', 'termine', 'annule')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des activités
CREATE TABLE IF NOT EXISTS activites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  date_debut_prevue DATE,
  date_fin_prevue DATE,
  indicateurs TEXT,
  budget_alloue DECIMAL(12, 2) DEFAULT 0,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de suivi de l'avancement des activités
CREATE TABLE IF NOT EXISTS avancement_activite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_activite UUID NOT NULL REFERENCES activites(id) ON DELETE CASCADE,
  taux_realisation_physique DECIMAL(5, 2) CHECK (taux_realisation_physique >= 0 AND taux_realisation_physique <= 100),
  taux_realisation_financier DECIMAL(5, 2) CHECK (taux_realisation_financier >= 0 AND taux_realisation_financier <= 100),
  depenses_reelles DECIMAL(12, 2) DEFAULT 0,
  commentaire TEXT,
  date_mise_a_jour DATE NOT NULL DEFAULT CURRENT_DATE,
  id_utilisateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des budgets par projet
CREATE TABLE IF NOT EXISTS budgets_projet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL,
  montant_alloue DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projets_responsable ON projets(id_responsable);
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_activites_projet ON activites(id_projet);
CREATE INDEX IF NOT EXISTS idx_avancement_activite ON avancement_activite(id_activite);
CREATE INDEX IF NOT EXISTS idx_budgets_projet ON budgets_projet(id_projet);

-- Trigger pour updated_at
CREATE TRIGGER update_projets_updated_at
  BEFORE UPDATE ON projets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activites_updated_at
  BEFORE UPDATE ON activites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_projet_updated_at
  BEFORE UPDATE ON budgets_projet
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


