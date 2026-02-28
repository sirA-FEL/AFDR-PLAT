-- Ajouter date_creation et date_modification à projets si absents (schéma créé avant 003 complet)
ALTER TABLE projets ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE projets ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP WITH TIME ZONE;

-- Renseigner date_creation pour les lignes existantes
UPDATE projets SET date_creation = COALESCE(date_creation, NOW()) WHERE date_creation IS NULL;
