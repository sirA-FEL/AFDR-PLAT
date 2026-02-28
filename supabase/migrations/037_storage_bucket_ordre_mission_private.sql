-- Bucket documents-ordre-mission : passer en privé et politiques RLS pour accès contrôlé

-- Rendre le bucket privé (accès uniquement via URL signées ou RLS)
UPDATE storage.buckets SET public = false WHERE name = 'documents-ordre-mission';

-- Politique SELECT : lecture des fichiers pour les utilisateurs autorisés à voir l'ordre
-- (demandeur, validateur direction, ou rôles DIR/MEAL)
DROP POLICY IF EXISTS "Lecture documents ordre mission autorisés" ON storage.objects;
CREATE POLICY "Lecture documents ordre mission autorisés"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'documents-ordre-mission')
    AND EXISTS (
      SELECT 1 FROM ordres_mission o
      WHERE o.id::text = (storage.foldername(name))[1]
      AND (
        o.id_demandeur = auth.uid()
        OR EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL'))
      )
    )
  );

-- Politique INSERT : seuls DIR/MEAL peuvent déposer des fichiers (signature, PDF)
DROP POLICY IF EXISTS "Insertion documents ordre mission DIR MEAL" ON storage.objects;
CREATE POLICY "Insertion documents ordre mission DIR MEAL"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'documents-ordre-mission')
    AND EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL'))
  );

-- Politique UPDATE : même rôle pour upsert (première signature = insert, pas d'écrasement géré en app)
DROP POLICY IF EXISTS "Update documents ordre mission DIR MEAL" ON storage.objects;
CREATE POLICY "Update documents ordre mission DIR MEAL"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = (SELECT id FROM storage.buckets WHERE name = 'documents-ordre-mission')
    AND EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL'))
  );
