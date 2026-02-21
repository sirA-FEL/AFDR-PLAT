-- Add date_creation and date_modification if missing (table may have been created without them)

ALTER TABLE ordres_mission
  ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP WITH TIME ZONE;

-- Backfill date_creation for existing rows that have NULL (e.g. column was just added)
UPDATE ordres_mission
SET date_creation = COALESCE(date_creation, NOW())
WHERE date_creation IS NULL;
