-- Soumission ordre de mission via RPC pour éviter les blocages RLS sur UPDATE
CREATE OR REPLACE FUNCTION public.submit_ordre_mission(p_id UUID)
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
  UPDATE ordres_mission
  SET statut = 'en_attente', date_modification = NOW()
  WHERE id = p_id AND id_demandeur = uid AND statut = 'brouillon'
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_ordre_mission TO authenticated;
