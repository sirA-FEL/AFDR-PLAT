-- Parc automobile : accès réservé à LOG et DIR uniquement (vehicules, affectations, entretiens)

-- Véhicules : LOG et DIR
DROP POLICY IF EXISTS "LOG peut gérer les véhicules" ON vehicules;
CREATE POLICY "LOG et DIR peuvent gérer les véhicules"
  ON vehicules FOR ALL
  TO authenticated
  USING (public.current_user_has_roles(ARRAY['LOG', 'DIR']))
  WITH CHECK (public.current_user_has_roles(ARRAY['LOG', 'DIR']));

-- Affectations véhicules : remplacer la politique SELECT permissive par LOG+DIR uniquement
DROP POLICY IF EXISTS "Accès aux affectations de véhicules" ON affectations_vehicules;
CREATE POLICY "LOG et DIR peuvent gérer les affectations véhicules"
  ON affectations_vehicules FOR ALL
  TO authenticated
  USING (public.current_user_has_roles(ARRAY['LOG', 'DIR']))
  WITH CHECK (public.current_user_has_roles(ARRAY['LOG', 'DIR']));

-- Entretiens véhicules : LOG et DIR
DROP POLICY IF EXISTS "LOG peut gérer les entretiens" ON entretiens_vehicules;
CREATE POLICY "LOG et DIR peuvent gérer les entretiens véhicules"
  ON entretiens_vehicules FOR ALL
  TO authenticated
  USING (public.current_user_has_roles(ARRAY['LOG', 'DIR']))
  WITH CHECK (public.current_user_has_roles(ARRAY['LOG', 'DIR']));
