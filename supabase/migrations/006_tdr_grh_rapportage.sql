-- Table des TdRs (Termes de Référence)
CREATE TABLE IF NOT EXISTS tdrs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_demandeur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  id_projet UUID REFERENCES projets(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  type_tdr TEXT NOT NULL CHECK (type_tdr IN ('consultant', 'prestation')),
  budget DECIMAL(12, 2),
  delai_jours INTEGER,
  chemin_document TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_revision', 'approuve', 'rejete')),
  favori BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des validations TdR
CREATE TABLE IF NOT EXISTS validations_tdr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tdr UUID NOT NULL REFERENCES tdrs(id) ON DELETE CASCADE,
  id_validateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approuve', 'rejete', 'revision_requise')),
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des employés (GRH)
CREATE TABLE IF NOT EXISTS employes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID UNIQUE REFERENCES profils(id) ON DELETE CASCADE,
  date_embauche DATE NOT NULL,
  type_contrat TEXT NOT NULL CHECK (type_contrat IN ('cdi', 'cdd', 'stage', 'consultant', 'autre')),
  salaire DECIMAL(10, 2),
  chemin_cv TEXT,
  chemin_contrat TEXT,
  solde_conges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes de congés
CREATE TABLE IF NOT EXISTS demandes_conges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_employe UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
  type_conge TEXT NOT NULL CHECK (type_conge IN ('annuel', 'maladie', 'permission', 'autre')),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  nombre_jours INTEGER GENERATED ALWAYS AS (date_fin - date_debut + 1) STORED,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete')),
  commentaire_rejet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (date_debut <= date_fin)
);

-- Table des validations de congés
CREATE TABLE IF NOT EXISTS validations_conges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_demande_conge UUID NOT NULL REFERENCES demandes_conges(id) ON DELETE CASCADE,
  id_validateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  niveau_validation TEXT NOT NULL CHECK (niveau_validation IN ('manager', 'grh')),
  decision TEXT NOT NULL CHECK (decision IN ('approuve', 'rejete')),
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rapports
CREATE TABLE IF NOT EXISTS rapports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID REFERENCES projets(id) ON DELETE SET NULL,
  id_departement TEXT,
  id_responsable UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  type_rapport TEXT NOT NULL CHECK (type_rapport IN ('mensuel', 'trimestriel', 'annuel', 'final')),
  periode TEXT NOT NULL,
  chemin_document TEXT,
  date_limite DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'soumis', 'en_retard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des relances de rapports
CREATE TABLE IF NOT EXISTS relances_rapports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_rapport UUID NOT NULL REFERENCES rapports(id) ON DELETE CASCADE,
  type_relance TEXT NOT NULL CHECK (type_relance IN ('j_7', 'j_1', 'quotidien')),
  date_relance TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  envoye BOOLEAN DEFAULT FALSE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tdrs_demandeur ON tdrs(id_demandeur);
CREATE INDEX IF NOT EXISTS idx_tdrs_statut ON tdrs(statut);
CREATE INDEX IF NOT EXISTS idx_validations_tdr ON validations_tdr(id_tdr);
CREATE INDEX IF NOT EXISTS idx_employes_utilisateur ON employes(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_demandes_conges_employe ON demandes_conges(id_employe);
CREATE INDEX IF NOT EXISTS idx_demandes_conges_dates ON demandes_conges(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_validations_conges ON validations_conges(id_demande_conge);
CREATE INDEX IF NOT EXISTS idx_rapports_responsable ON rapports(id_responsable);
CREATE INDEX IF NOT EXISTS idx_rapports_date_limite ON rapports(date_limite);
CREATE INDEX IF NOT EXISTS idx_relances_rapports ON relances_rapports(id_rapport);

-- Triggers pour updated_at (idempotents)
DROP TRIGGER IF EXISTS update_tdrs_updated_at ON tdrs;
CREATE TRIGGER update_tdrs_updated_at
  BEFORE UPDATE ON tdrs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employes_updated_at ON employes;
CREATE TRIGGER update_employes_updated_at
  BEFORE UPDATE ON employes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_demandes_conges_updated_at ON demandes_conges;
CREATE TRIGGER update_demandes_conges_updated_at
  BEFORE UPDATE ON demandes_conges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rapports_updated_at ON rapports;
CREATE TRIGGER update_rapports_updated_at
  BEFORE UPDATE ON rapports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

