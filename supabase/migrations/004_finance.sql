-- Table des lignes budgétaires
CREATE TABLE IF NOT EXISTS lignes_budgetaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_projet UUID REFERENCES projets(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL,
  montant_alloue DECIMAL(12, 2) NOT NULL,
  montant_engage DECIMAL(12, 2) DEFAULT 0,
  montant_consomme DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS depenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ligne_budgetaire UUID NOT NULL REFERENCES lignes_budgetaires(id) ON DELETE CASCADE,
  id_activite UUID REFERENCES activites(id) ON DELETE SET NULL,
  montant DECIMAL(12, 2) NOT NULL,
  date_depense DATE NOT NULL,
  justificatif TEXT,
  chemin_justificatif TEXT,
  beneficiaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_lignes_budgetaires_projet ON lignes_budgetaires(id_projet);
CREATE INDEX IF NOT EXISTS idx_depenses_ligne_budgetaire ON depenses(id_ligne_budgetaire);
CREATE INDEX IF NOT EXISTS idx_depenses_activite ON depenses(id_activite);
CREATE INDEX IF NOT EXISTS idx_depenses_date ON depenses(date_depense);

-- Trigger pour updated_at
CREATE TRIGGER update_lignes_budgetaires_updated_at
  BEFORE UPDATE ON lignes_budgetaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_depenses_updated_at
  BEFORE UPDATE ON depenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


