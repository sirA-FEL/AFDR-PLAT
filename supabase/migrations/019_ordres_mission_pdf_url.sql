-- Add pdf_url and signature/validation columns if missing on ordres_mission

ALTER TABLE ordres_mission ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE ordres_mission ADD COLUMN IF NOT EXISTS signature_validation_url TEXT;
ALTER TABLE ordres_mission ADD COLUMN IF NOT EXISTS date_validation TIMESTAMPTZ;
