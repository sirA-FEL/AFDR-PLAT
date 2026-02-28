-- Fallback INSERT sur projets : tout utilisateur authentifié qui a un profil peut créer un projet.
-- Les rôles MEAL/PM/DIR restent autorisés via la politique existante ; celle-ci évite le blocage
-- si roles_utilisateurs n'est pas encore renseigné pour l'utilisateur.
DROP POLICY IF EXISTS "Utilisateurs avec profil peuvent créer des projets" ON projets;
CREATE POLICY "Utilisateurs avec profil peuvent créer des projets"
  ON projets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profils WHERE id = auth.uid())
  );
