-- Éviter la récursion infinie : les politiques RLS ne doivent pas lire roles_utilisateurs
-- via une sous-requête (sinon la vérification RLS sur roles_utilisateurs relit la table).
-- Fonction SECURITY DEFINER qui lit roles_utilisateurs sans passer par RLS.
CREATE OR REPLACE FUNCTION public.current_user_has_roles(roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.roles_utilisateurs
    WHERE id_utilisateur = auth.uid() AND role = ANY(roles)
  );
$$;

-- Remplacer la politique "admins" sur roles_utilisateurs pour utiliser la fonction
DROP POLICY IF EXISTS "Les admins peuvent gérer les rôles" ON roles_utilisateurs;
CREATE POLICY "Les admins peuvent gérer les rôles"
  ON roles_utilisateurs FOR ALL
  TO authenticated
  USING (public.current_user_has_roles(ARRAY['DIR', 'GRH']))
  WITH CHECK (public.current_user_has_roles(ARRAY['DIR', 'GRH']));
