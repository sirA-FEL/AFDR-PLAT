-- Champs complémentaires pour aligner les ordres de mission
-- sur le modèle AFDR (exécutants, lieu d'émission, moyen de transport).

ALTER TABLE ordres_mission
  ADD COLUMN IF NOT EXISTS executants TEXT,
  ADD COLUMN IF NOT EXISTS lieu_emission TEXT,
  ADD COLUMN IF NOT EXISTS moyen_transport TEXT;

-- Étendre la fonction insert_ordre_mission pour accepter ces champs optionnels.
CREATE OR REPLACE FUNCTION public.insert_ordre_mission(
  p_destination TEXT,
  p_date_debut DATE,
  p_date_fin DATE,
  p_motif TEXT,
  p_activites_prevues TEXT DEFAULT NULL,
  p_budget_estime DECIMAL DEFAULT NULL,
  p_executants TEXT DEFAULT NULL,
  p_lieu_emission TEXT DEFAULT NULL,
  p_moyen_transport TEXT DEFAULT NULL
)
RETURNS SETOF ordres_mission
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  RETURN QUERY
  INSERT INTO ordres_mission (
    id_demandeur,
    destination,
    date_debut,
    date_fin,
    motif,
    activites_prevues,
    budget_estime,
    executants,
    lieu_emission,
    moyen_transport,
    statut
  )
  VALUES (
    uid,
    p_destination,
    p_date_debut,
    p_date_fin,
    p_motif,
    p_activites_prevues,
    p_budget_estime,
    p_executants,
    p_lieu_emission,
    p_moyen_transport,
    'brouillon'
  )
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_ordre_mission(
  TEXT,
  DATE,
  DATE,
  TEXT,
  TEXT,
  DECIMAL,
  TEXT,
  TEXT,
  TEXT
) TO authenticated;

