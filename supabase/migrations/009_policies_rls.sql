-- Activation de RLS sur toutes les tables

-- Profils
ALTER TABLE profils ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profils;
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON profils FOR SELECT
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON profils;
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON profils FOR UPDATE
  USING (auth.uid() = id);

-- Roles utilisateurs
ALTER TABLE roles_utilisateurs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre rôle" ON roles_utilisateurs;
CREATE POLICY "Les utilisateurs peuvent voir leur propre rôle"
  ON roles_utilisateurs FOR SELECT
  USING (auth.uid() = id_utilisateur);
DROP POLICY IF EXISTS "Les admins peuvent gérer les rôles" ON roles_utilisateurs;
CREATE POLICY "Les admins peuvent gérer les rôles"
  ON roles_utilisateurs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('DIR', 'GRH')
    )
  );

-- Hierarchies
ALTER TABLE hierarchies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur hiérarchie" ON hierarchies;
CREATE POLICY "Les utilisateurs peuvent voir leur hiérarchie"
  ON hierarchies FOR SELECT
  USING (auth.uid() = id_utilisateur OR auth.uid() = id_manager);

-- Ordres de mission
ALTER TABLE ordres_mission ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres ordres" ON ordres_mission;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres ordres"
  ON ordres_mission FOR SELECT
  USING (auth.uid() = id_demandeur);
DROP POLICY IF EXISTS "Les managers peuvent voir les ordres de leur équipe" ON ordres_mission;
CREATE POLICY "Les managers peuvent voir les ordres de leur équipe"
  ON ordres_mission FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hierarchies
      WHERE id_manager = auth.uid() AND id_utilisateur = ordres_mission.id_demandeur
    )
  );
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres ordres" ON ordres_mission;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres ordres"
  ON ordres_mission FOR INSERT
  WITH CHECK (auth.uid() = id_demandeur);
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres ordres en brouillon" ON ordres_mission;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres ordres en brouillon"
  ON ordres_mission FOR UPDATE
  USING (auth.uid() = id_demandeur AND statut = 'brouillon');

-- Documents ordre mission (table: documents_ordres_mission en 002)
ALTER TABLE documents_ordres_mission ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux documents des ordres de mission" ON documents_ordres_mission;
CREATE POLICY "Accès aux documents des ordres de mission"
  ON documents_ordres_mission FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ordres_mission
      WHERE ordres_mission.id = documents_ordres_mission.id_ordre_mission
      AND (
        ordres_mission.id_demandeur = auth.uid()
        OR EXISTS (
          SELECT 1 FROM hierarchies
          WHERE id_manager = auth.uid() AND id_utilisateur = ordres_mission.id_demandeur
        )
      )
    )
  );

-- Validations ordre mission (skip if table does not exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'validations_ordre_mission') THEN
    ALTER TABLE validations_ordre_mission ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "Accès aux validations des ordres de mission" ON validations_ordre_mission';
    EXECUTE 'CREATE POLICY "Accès aux validations des ordres de mission" ON validations_ordre_mission FOR SELECT USING (EXISTS (SELECT 1 FROM ordres_mission WHERE ordres_mission.id = validations_ordre_mission.id_ordre_mission AND (ordres_mission.id_demandeur = auth.uid() OR EXISTS (SELECT 1 FROM hierarchies WHERE id_manager = auth.uid() AND id_utilisateur = ordres_mission.id_demandeur))))';
  END IF;
END $$;

-- Projets
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tous les utilisateurs authentifiés peuvent voir les projets" ON projets;
CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir les projets"
  ON projets FOR SELECT
  USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "MEAL et PM peuvent créer des projets" ON projets;
CREATE POLICY "MEAL et PM peuvent créer des projets"
  ON projets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role IN ('MEAL', 'PM')
    )
  );

-- Activités
ALTER TABLE activites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux activités des projets" ON activites;
CREATE POLICY "Accès aux activités des projets"
  ON activites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projets
      WHERE projets.id = activites.id_projet
    )
  );

-- Avancement activité
ALTER TABLE avancement_activite ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès à l'avancement des activités" ON avancement_activite;
CREATE POLICY "Accès à l'avancement des activités"
  ON avancement_activite FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activites
      WHERE activites.id = avancement_activite.id_activite
    )
  );

-- Lignes budgétaires
ALTER TABLE lignes_budgetaires ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux lignes budgétaires" ON lignes_budgetaires;
CREATE POLICY "Accès aux lignes budgétaires"
  ON lignes_budgetaires FOR SELECT
  USING (
    id_projet IS NULL OR EXISTS (
      SELECT 1 FROM projets WHERE projets.id = lignes_budgetaires.id_projet
    )
  );

-- Dépenses
ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "FIN peut gérer les dépenses" ON depenses;
CREATE POLICY "FIN peut gérer les dépenses"
  ON depenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role = 'FIN'
    )
  );

-- Demandes achat
ALTER TABLE demandes_achat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres demandes" ON demandes_achat;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres demandes"
  ON demandes_achat FOR SELECT
  USING (auth.uid() = id_demandeur);
DROP POLICY IF EXISTS "LOG peut voir toutes les demandes" ON demandes_achat;
CREATE POLICY "LOG peut voir toutes les demandes"
  ON demandes_achat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role = 'LOG'
    )
  );

-- Véhicules
ALTER TABLE vehicules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "LOG peut gérer les véhicules" ON vehicules;
CREATE POLICY "LOG peut gérer les véhicules"
  ON vehicules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role = 'LOG'
    )
  );

-- Affectations véhicules
ALTER TABLE affectations_vehicules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux affectations de véhicules" ON affectations_vehicules;
CREATE POLICY "Accès aux affectations de véhicules"
  ON affectations_vehicules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ordres_mission
      WHERE ordres_mission.id = affectations_vehicules.id_ordre_mission
    )
  );

-- Entretiens véhicules
ALTER TABLE entretiens_vehicules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "LOG peut gérer les entretiens" ON entretiens_vehicules;
CREATE POLICY "LOG peut gérer les entretiens"
  ON entretiens_vehicules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role = 'LOG'
    )
  );

-- TdRs
ALTER TABLE tdrs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux TdRs" ON tdrs;
CREATE POLICY "Accès aux TdRs"
  ON tdrs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Validations TdR
ALTER TABLE validations_tdr ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux validations TdR" ON validations_tdr;
CREATE POLICY "Accès aux validations TdR"
  ON validations_tdr FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tdrs WHERE tdrs.id = validations_tdr.id_tdr
    )
  );

-- Employés
ALTER TABLE employes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "GRH peut gérer les employés" ON employes;
CREATE POLICY "GRH peut gérer les employés"
  ON employes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role = 'GRH'
    )
  );

-- Demandes congés
ALTER TABLE demandes_conges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres demandes" ON demandes_conges;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres demandes"
  ON demandes_conges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employes
      WHERE employes.id = demandes_conges.id_employe
      AND employes.id_utilisateur = auth.uid()
    )
  );

-- Validations congés
ALTER TABLE validations_conges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux validations de congés" ON validations_conges;
CREATE POLICY "Accès aux validations de congés"
  ON validations_conges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM demandes_conges
      WHERE demandes_conges.id = validations_conges.id_demande_conge
    )
  );

-- Rapports
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux rapports" ON rapports;
CREATE POLICY "Accès aux rapports"
  ON rapports FOR SELECT
  USING (auth.role() = 'authenticated');

-- Relances rapports
ALTER TABLE relances_rapports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "MEAL peut gérer les relances" ON relances_rapports;
CREATE POLICY "MEAL peut gérer les relances"
  ON relances_rapports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM roles_utilisateurs
      WHERE id_utilisateur = auth.uid() AND role = 'MEAL'
    )
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres notifications" ON notifications;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = id_utilisateur);
DROP POLICY IF EXISTS "Les utilisateurs peuvent marquer leurs notifications comme lues" ON notifications;
CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues"
  ON notifications FOR UPDATE
  USING (auth.uid() = id_utilisateur);

-- Téléchargements fichiers
ALTER TABLE telechargements_fichiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Accès aux téléchargements de fichiers" ON telechargements_fichiers;
CREATE POLICY "Accès aux téléchargements de fichiers"
  ON telechargements_fichiers FOR SELECT
  USING (auth.role() = 'authenticated');

