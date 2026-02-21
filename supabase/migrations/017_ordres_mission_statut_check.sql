-- Align statut check constraint with app values: brouillon, en_attente, approuve, rejete, en_cours, termine

ALTER TABLE ordres_mission
  DROP CONSTRAINT IF EXISTS ordres_mission_statut_check;

ALTER TABLE ordres_mission
  ADD CONSTRAINT ordres_mission_statut_check
  CHECK (statut IN ('brouillon', 'en_attente', 'approuve', 'rejete', 'en_cours', 'termine'));
