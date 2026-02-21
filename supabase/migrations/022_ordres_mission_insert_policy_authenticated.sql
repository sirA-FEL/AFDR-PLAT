-- Corriger l'INSERT sur ordres_mission : s'assurer que la politique s'applique au rôle "authenticated"
-- (auth.uid() est défini quand la requête est faite avec un JWT valide)

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres ordres" ON ordres_mission;

CREATE POLICY "Les utilisateurs peuvent créer leurs propres ordres"
  ON ordres_mission FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id_demandeur);
