-- zones_intervention : passer en text[] pour éviter "malformed array literal"
-- lorsque l'app envoie un tableau (ex. une région sélectionnée).
-- Données existantes : une chaîne devient un tableau à un élément.
-- Exécuté seulement si la colonne est encore en TEXT.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projets' AND column_name = 'zones_intervention'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE projets
    ALTER COLUMN zones_intervention TYPE text[] USING (
      CASE
        WHEN zones_intervention IS NULL THEN NULL
        WHEN trim(zones_intervention::text) = '' THEN NULL
        ELSE array[zones_intervention::text]
      END
    );
  END IF;
END $$;
