-- Remplacer les politiques MEAL/PM/DIR sur activites_projet et indicateurs_projet
-- par current_user_has_roles pour éviter toute récursion RLS (alignement avec 027/028).

-- activites_projet
DROP POLICY IF EXISTS "MEAL PM DIR peuvent gérer les activités projet" ON activites_projet;
CREATE POLICY "MEAL PM DIR peuvent gérer les activités projet"
  ON activites_projet FOR ALL
  TO authenticated
  USING (public.current_user_has_roles(ARRAY['MEAL', 'PM', 'DIR']))
  WITH CHECK (public.current_user_has_roles(ARRAY['MEAL', 'PM', 'DIR']));

-- indicateurs_projet
DROP POLICY IF EXISTS "MEAL PM DIR peuvent gérer les indicateurs projet" ON indicateurs_projet;
CREATE POLICY "MEAL PM DIR peuvent gérer les indicateurs projet"
  ON indicateurs_projet FOR ALL
  TO authenticated
  USING (public.current_user_has_roles(ARRAY['MEAL', 'PM', 'DIR']))
  WITH CHECK (public.current_user_has_roles(ARRAY['MEAL', 'PM', 'DIR']));
