-- RLS vue partenaire : les partenaires ne voient que les projets qui leur sont partagés

-- projets : remplacer la politique SELECT pour restreindre les partenaires
DROP POLICY IF EXISTS "Tous les utilisateurs authentifiés peuvent voir les projets" ON projets;

CREATE POLICY "Internes voient tous les projets partenaires voient partages"
  ON projets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs r
      WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL', 'FIN', 'LOG', 'GRH', 'PM', 'USER')
    )
    OR
    EXISTS (
      SELECT 1 FROM partenaires_projet pp
      WHERE pp.id_projet = projets.id AND pp.id_partenaire = auth.uid() AND pp.actif = true
    )
  );

-- activites_projet : internes voient tout, partenaires seulement projets partagés
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent voir les activités projet" ON activites_projet;

CREATE POLICY "Activites visibles internes ou partenaires partages"
  ON activites_projet FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL', 'FIN', 'LOG', 'GRH', 'PM', 'USER'))
    OR EXISTS (SELECT 1 FROM partenaires_projet pp WHERE pp.id_projet = activites_projet.id_projet AND pp.id_partenaire = auth.uid() AND pp.actif = true)
  );

-- indicateurs_projet : idem
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent voir les indicateurs projet" ON indicateurs_projet;

CREATE POLICY "Indicateurs visibles internes ou partenaires partages"
  ON indicateurs_projet FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM roles_utilisateurs r WHERE r.id_utilisateur = auth.uid() AND r.role IN ('DIR', 'MEAL', 'FIN', 'LOG', 'GRH', 'PM', 'USER'))
    OR EXISTS (SELECT 1 FROM partenaires_projet pp WHERE pp.id_projet = indicateurs_projet.id_projet AND pp.id_partenaire = auth.uid() AND pp.actif = true)
  );

-- partenaires_projet : lecture pour le partenaire (ses lignes) et pour MEAL/DIR (gestion)
ALTER TABLE partenaires_projet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partenaires voient leurs acces MEAL DIR voient tout"
  ON partenaires_projet FOR SELECT
  TO authenticated
  USING (
    id_partenaire = auth.uid()
    OR EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'DIR')
    )
  );

CREATE POLICY "MEAL DIR peuvent gerer partenaires_projet"
  ON partenaires_projet FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'DIR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'DIR')
    )
  );
