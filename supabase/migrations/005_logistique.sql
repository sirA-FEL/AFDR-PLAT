-- Table des demandes d'achat
CREATE TABLE IF NOT EXISTS demandes_achat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_demandeur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  id_projet UUID REFERENCES projets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bien', 'service')),
  description TEXT NOT NULL,
  quantite INTEGER DEFAULT 1,
  justification TEXT,
  urgence TEXT NOT NULL DEFAULT 'normale' CHECK (urgence IN ('normale', 'urgente', 'tres_urgente')),
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'soumis', 'en_attente', 'approuve', 'rejete', 'traite')),
  commentaire_rejet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des véhicules
CREATE TABLE IF NOT EXISTS vehicules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  immatriculation TEXT UNIQUE NOT NULL,
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  annee INTEGER,
  kilometrage_actuel INTEGER DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible', 'en_mission', 'en_entretien', 'hors_service')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des affectations de véhicules
CREATE TABLE IF NOT EXISTS affectations_vehicules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordre_mission UUID NOT NULL REFERENCES ordres_mission(id) ON DELETE CASCADE,
  id_vehicule UUID NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
  kilometrage_depart INTEGER,
  kilometrage_retour INTEGER,
  distance_parcourue INTEGER GENERATED ALWAYS AS (kilometrage_retour - kilometrage_depart) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (kilometrage_retour IS NULL OR kilometrage_retour >= kilometrage_depart)
);

-- Table des entretiens de véhicules
CREATE TABLE IF NOT EXISTS entretiens_vehicules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_vehicule UUID NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
  type_entretien TEXT NOT NULL CHECK (type_entretien IN ('vidange', 'revision', 'reparation', 'autre')),
  date_entretien DATE NOT NULL,
  kilometrage INTEGER NOT NULL,
  cout DECIMAL(10, 2),
  prestataire TEXT,
  description TEXT,
  prochain_entretien_km INTEGER,
  prochain_entretien_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_demandes_achat_demandeur ON demandes_achat(id_demandeur);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_statut ON demandes_achat(statut);
CREATE INDEX IF NOT EXISTS idx_vehicules_statut ON vehicules(statut);
CREATE INDEX IF NOT EXISTS idx_affectations_vehicules ON affectations_vehicules(id_ordre_mission, id_vehicule);
CREATE INDEX IF NOT EXISTS idx_entretiens_vehicules ON entretiens_vehicules(id_vehicule);

-- Trigger pour updated_at
CREATE TRIGGER update_demandes_achat_updated_at
  BEFORE UPDATE ON demandes_achat
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicules_updated_at
  BEFORE UPDATE ON vehicules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affectations_vehicules_updated_at
  BEFORE UPDATE ON affectations_vehicules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


