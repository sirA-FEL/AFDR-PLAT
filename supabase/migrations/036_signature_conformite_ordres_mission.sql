-- Conformité signature numérique : hash de la signature + journal d'audit des validations

-- Colonne empreinte SHA-256 de l'image de signature (intégrité, non-répudiation)
ALTER TABLE ordres_mission ADD COLUMN IF NOT EXISTS signature_validation_hash TEXT;

-- Table d'audit des actions de validation (approbation avec signature, rejet)
CREATE TABLE IF NOT EXISTS audit_validation_ordres_mission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ordre_mission UUID NOT NULL REFERENCES ordres_mission(id) ON DELETE CASCADE,
  id_validateur UUID NOT NULL REFERENCES profils(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('approuve_avec_signature', 'rejete')),
  signature_hash TEXT,
  date_action TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_validation_ordre ON audit_validation_ordres_mission(id_ordre_mission);
CREATE INDEX IF NOT EXISTS idx_audit_validation_date ON audit_validation_ordres_mission(date_action);

-- RLS : lecture réservée aux rôles qui peuvent voir les ordres (DIR, MEAL, demandeur, etc.)
ALTER TABLE audit_validation_ordres_mission ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture audit validation ordres mission" ON audit_validation_ordres_mission;
CREATE POLICY "Lecture audit validation ordres mission"
  ON audit_validation_ordres_mission FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ordres_mission o
      WHERE o.id = audit_validation_ordres_mission.id_ordre_mission
      AND (
        o.id_demandeur = auth.uid()
        OR EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL'))
      )
    )
  );

-- Insertion : seul le validateur (DIR/MEAL) peut enregistrer une action d'audit lors de l'approbation/rejet
DROP POLICY IF EXISTS "Insertion audit par validateur" ON audit_validation_ordres_mission;
CREATE POLICY "Insertion audit par validateur"
  ON audit_validation_ordres_mission FOR INSERT
  TO authenticated
  WITH CHECK (
    id_validateur = auth.uid()
    AND EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL'))
  );
