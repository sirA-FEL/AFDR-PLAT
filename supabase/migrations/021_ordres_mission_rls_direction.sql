-- Les utilisateurs niveau 3 (DIR, MEAL) voient TOUS les ordres de mission soumis
-- et peuvent les valider (mise à jour statut, signature, commentaire).

-- SELECT : la direction peut voir tous les ordres (pour la page Validation)
CREATE POLICY "La direction peut voir tous les ordres de mission"
  ON ordres_mission FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('DIR', 'MEAL')
    )
  );

-- UPDATE : la direction peut valider/rejeter les ordres (en_attente -> approuve/rejete)
CREATE POLICY "La direction peut valider ou rejeter les ordres en attente"
  ON ordres_mission FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('DIR', 'MEAL')
    )
  );
