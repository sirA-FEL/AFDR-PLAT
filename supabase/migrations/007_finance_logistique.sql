-- Table des lignes budgétaires
CREATE TABLE IF NOT EXISTS lignes_budgetaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID REFERENCES projets(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  description TEXT,
  montant_alloue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  montant_engage DECIMAL(12, 2) DEFAULT 0,
  montant_paye DECIMAL(12, 2) DEFAULT 0,
  annee INTEGER NOT NULL,
  trimestre INTEGER CHECK (trimestre IN (1, 2, 3, 4)),
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'cloture', 'suspendu')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (montant_alloue >= 0),
  CHECK (montant_engage >= 0),
  CHECK (montant_paye >= 0),
  CHECK (montant_engage <= montant_alloue),
  CHECK (montant_paye <= montant_engage)
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS depenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ligne_budgetaire UUID REFERENCES lignes_budgetaires(id) ON DELETE SET NULL,
  id_projet UUID REFERENCES projets(id) ON DELETE SET NULL,
  id_ordre_mission UUID REFERENCES ordres_mission(id) ON DELETE SET NULL,
  libelle TEXT NOT NULL,
  montant DECIMAL(12, 2) NOT NULL,
  date_depense DATE NOT NULL,
  type_depense TEXT NOT NULL CHECK (type_depense IN ('personnel', 'fonctionnement', 'equipement', 'mission', 'autre')),
  justificatif TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'validee', 'rejetee', 'payee')),
  id_validateur UUID REFERENCES profils(id) ON DELETE SET NULL,
  commentaire_validation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (montant > 0)
);

-- Table des demandes d'achat
CREATE TABLE IF NOT EXISTS demandes_achat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_demandeur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  id_projet UUID REFERENCES projets(id) ON DELETE SET NULL,
  objet TEXT NOT NULL,
  description TEXT,
  montant_estime DECIMAL(12, 2),
  urgence TEXT NOT NULL DEFAULT 'normale' CHECK (urgence IN ('faible', 'normale', 'elevee', 'critique')),
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente', 'en_cours', 'approuvee', 'rejetee', 'terminee')),
  id_validateur UUID REFERENCES profils(id) ON DELETE SET NULL,
  commentaire_validation TEXT,
  date_besoin DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles/services des demandes d'achat
CREATE TABLE IF NOT EXISTS articles_demande_achat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_demande_achat UUID NOT NULL REFERENCES demandes_achat(id) ON DELETE CASCADE,
  designation TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  unite TEXT,
  prix_unitaire DECIMAL(12, 2),
  montant_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantite * COALESCE(prix_unitaire, 0)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (quantite > 0),
  CHECK (prix_unitaire >= 0)
);

-- Table des véhicules
CREATE TABLE IF NOT EXISTS vehicules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  immatriculation TEXT UNIQUE NOT NULL,
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  annee INTEGER,
  type_vehicule TEXT NOT NULL CHECK (type_vehicule IN ('voiture', 'moto', 'camion', 'bus', 'autre')),
  carburant TEXT CHECK (carburant IN ('essence', 'diesel', 'electrique', 'hybride')),
  kilometrage INTEGER DEFAULT 0,
  etat TEXT NOT NULL DEFAULT 'disponible' CHECK (etat IN ('disponible', 'en_mission', 'en_entretien', 'hors_service')),
  date_achat DATE,
  date_dernier_entretien DATE,
  prochain_entretien_km INTEGER,
  prochain_entretien_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (kilometrage >= 0)
);

-- Table des affectations de véhicules
CREATE TABLE IF NOT EXISTS affectations_vehicules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_vehicule UUID NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
  id_ordre_mission UUID REFERENCES ordres_mission(id) ON DELETE SET NULL,
  id_conducteur UUID REFERENCES profils(id) ON DELETE SET NULL,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE,
  kilometrage_debut INTEGER NOT NULL,
  kilometrage_fin INTEGER,
  motif TEXT,
  statut TEXT NOT NULL DEFAULT 'active' CHECK (statut IN ('active', 'terminee', 'annulee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (kilometrage_debut >= 0),
  CHECK (kilometrage_fin IS NULL OR kilometrage_fin >= kilometrage_debut)
);

-- Table des entretiens de véhicules
CREATE TABLE IF NOT EXISTS entretiens_vehicules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_vehicule UUID NOT NULL REFERENCES vehicules(id) ON DELETE CASCADE,
  type_entretien TEXT NOT NULL CHECK (type_entretien IN ('vidange', 'revision', 'reparation', 'controle_technique', 'autre')),
  date_entretien DATE NOT NULL,
  kilometrage INTEGER NOT NULL,
  cout DECIMAL(10, 2),
  description TEXT,
  prestataire TEXT,
  facture_url TEXT,
  prochain_entretien_km INTEGER,
  prochain_entretien_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (kilometrage >= 0),
  CHECK (cout >= 0)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type_notification TEXT NOT NULL DEFAULT 'info' CHECK (type_notification IN ('info', 'success', 'warning', 'error', 'validation')),
  lien TEXT,
  lue BOOLEAN DEFAULT FALSE,
  date_lecture TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des téléchargements de fichiers
CREATE TABLE IF NOT EXISTS telechargements_fichiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom_fichier TEXT NOT NULL,
  chemin_fichier TEXT NOT NULL,
  type_fichier TEXT,
  taille_fichier INTEGER,
  id_utilisateur UUID REFERENCES profils(id) ON DELETE SET NULL,
  categorie TEXT,
  description TEXT,
  nombre_telechargements INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (taille_fichier >= 0),
  CHECK (nombre_telechargements >= 0)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_lignes_budgetaires_projet ON lignes_budgetaires(id_projet);
CREATE INDEX IF NOT EXISTS idx_lignes_budgetaires_annee ON lignes_budgetaires(annee);
CREATE INDEX IF NOT EXISTS idx_depenses_ligne_budgetaire ON depenses(id_ligne_budgetaire);
CREATE INDEX IF NOT EXISTS idx_depenses_projet ON depenses(id_projet);
CREATE INDEX IF NOT EXISTS idx_depenses_date ON depenses(date_depense);
CREATE INDEX IF NOT EXISTS idx_depenses_statut ON depenses(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_demandeur ON demandes_achat(id_demandeur);
CREATE INDEX IF NOT EXISTS idx_demandes_achat_statut ON demandes_achat(statut);
CREATE INDEX IF NOT EXISTS idx_articles_demande_achat ON articles_demande_achat(id_demande_achat);
CREATE INDEX IF NOT EXISTS idx_vehicules_etat ON vehicules(etat);
CREATE INDEX IF NOT EXISTS idx_affectations_vehicule ON affectations_vehicules(id_vehicule);
CREATE INDEX IF NOT EXISTS idx_affectations_ordre_mission ON affectations_vehicules(id_ordre_mission);
CREATE INDEX IF NOT EXISTS idx_entretiens_vehicule ON entretiens_vehicules(id_vehicule);
CREATE INDEX IF NOT EXISTS idx_notifications_utilisateur ON notifications(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON notifications(id_utilisateur, lue);
CREATE INDEX IF NOT EXISTS idx_telechargements_utilisateur ON telechargements_fichiers(id_utilisateur);

-- Triggers pour updated_at
CREATE TRIGGER update_lignes_budgetaires_updated_at
  BEFORE UPDATE ON lignes_budgetaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_depenses_updated_at
  BEFORE UPDATE ON depenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

CREATE TRIGGER update_entretiens_vehicules_updated_at
  BEFORE UPDATE ON entretiens_vehicules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telechargements_fichiers_updated_at
  BEFORE UPDATE ON telechargements_fichiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
