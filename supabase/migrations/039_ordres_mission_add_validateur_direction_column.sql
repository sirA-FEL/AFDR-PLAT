-- Ajout sécurisé de la colonne id_validateur_direction sur ordres_mission
-- (compatible si la colonne existe déjà).

ALTER TABLE ordres_mission
ADD COLUMN IF NOT EXISTS id_validateur_direction UUID REFERENCES profils(id) ON DELETE SET NULL;

