-- RLS pour activites_projet et indicateurs_projet (MEAL)
-- PRÉREQUIS : exécuter 003_projets_meal.sql avant (crée les tables activites_projet, indicateurs_projet).
-- SELECT : tout utilisateur authentifié (cohérent avec projets)
-- INSERT / UPDATE / DELETE : MEAL, PM, DIR

-- activites_projet
ALTER TABLE activites_projet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs authentifiés peuvent voir les activités projet"
  ON activites_projet FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MEAL PM DIR peuvent gérer les activités projet"
  ON activites_projet FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'PM', 'DIR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'PM', 'DIR')
    )
  );

-- indicateurs_projet
ALTER TABLE indicateurs_projet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs authentifiés peuvent voir les indicateurs projet"
  ON indicateurs_projet FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "MEAL PM DIR peuvent gérer les indicateurs projet"
  ON indicateurs_projet FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'PM', 'DIR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'PM', 'DIR')
    )
  );
