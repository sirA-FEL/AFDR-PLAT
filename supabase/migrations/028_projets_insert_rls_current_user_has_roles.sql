-- INSERT sur projets : utiliser current_user_has_roles pour éviter toute récursion RLS
-- et autoriser MEAL, PM et DIR (cohérent avec activites_projet / indicateurs_projet).
DROP POLICY IF EXISTS "MEAL et PM peuvent créer des projets" ON projets;
CREATE POLICY "MEAL PM DIR peuvent créer des projets"
  ON projets FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_has_roles(ARRAY['MEAL', 'PM', 'DIR']));
