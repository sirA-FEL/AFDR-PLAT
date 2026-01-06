-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_utilisateur UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('validation_requise', 'approbation', 'alerte', 'mention')),
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  lu BOOLEAN DEFAULT FALSE,
  lien_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des téléchargements de fichiers
CREATE TABLE IF NOT EXISTS telechargements_fichiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chemin TEXT NOT NULL,
  type_fichier TEXT,
  taille BIGINT,
  id_uploader UUID NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_utilisateur ON notifications(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(id_utilisateur, lu);
CREATE INDEX IF NOT EXISTS idx_telechargements_uploader ON telechargements_fichiers(id_uploader);


