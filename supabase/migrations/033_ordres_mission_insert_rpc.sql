-- Insertion ordre de mission via RPC pour éviter les blocages RLS
-- (la fonction s'exécute avec les droits du propriétaire et impose id_demandeur = auth.uid())
CREATE OR REPLACE FUNCTION public.insert_ordre_mission(
  p_destination TEXT,
  p_date_debut DATE,
  p_date_fin DATE,
  p_motif TEXT,
  p_activites_prevues TEXT DEFAULT NULL,
  p_budget_estime DECIMAL DEFAULT NULL
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
    id_demandeur, destination, date_debut, date_fin, motif,
    activites_prevues, budget_estime, statut
  )
  VALUES (
    uid, p_destination, p_date_debut, p_date_fin, p_motif,
    p_activites_prevues, p_budget_estime, 'brouillon'
  )
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_ordre_mission TO authenticated;
