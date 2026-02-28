-- S'assurer que tout utilisateur authentifié peut créer un ordre de mission
-- dont il est le demandeur (id_demandeur = auth.uid()).
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres ordres" ON ordres_mission;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres ordres"
  ON ordres_mission FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND id_demandeur = auth.uid());
