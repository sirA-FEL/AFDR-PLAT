-- Fonction pour calculer le taux de réalisation global d'un projet
CREATE OR REPLACE FUNCTION calculer_taux_realisation_projet(id_projet_uuid UUID)
RETURNS DECIMAL(5, 2) AS $$
DECLARE
  taux_moyen DECIMAL(5, 2);
BEGIN
  SELECT COALESCE(AVG(aa.taux_realisation_physique), 0)
  INTO taux_moyen
  FROM activites a
  LEFT JOIN avancement_activite aa ON a.id = aa.id_activite
  WHERE a.id_projet = id_projet_uuid
  AND aa.id = (
    SELECT id FROM avancement_activite
    WHERE id_activite = a.id
    ORDER BY date_mise_a_jour DESC
    LIMIT 1
  );
  
  RETURN COALESCE(taux_moyen, 0);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les alertes MEAL
CREATE OR REPLACE FUNCTION verifier_alertes_meal()
RETURNS TABLE (
  id_activite UUID,
  nom_activite TEXT,
  id_projet UUID,
  nom_projet TEXT,
  type_alerte TEXT,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Alertes pour activités en retard de +7 jours
  SELECT 
    a.id,
    a.nom,
    a.id_projet,
    p.nom,
    'retard'::TEXT,
    'L''activité est en retard de plus de 7 jours'::TEXT
  FROM activites a
  JOIN projets p ON a.id_projet = p.id
  WHERE a.date_fin_prevue < CURRENT_DATE - INTERVAL '7 days'
  AND a.id NOT IN (
    SELECT DISTINCT id_activite 
    FROM avancement_activite 
    WHERE taux_realisation_physique >= 100
  )
  
  UNION ALL
  
  -- Alertes pour taux de réalisation < 50% à mi-parcours
  SELECT 
    a.id,
    a.nom,
    a.id_projet,
    p.nom,
    'taux_bas'::TEXT,
    'Le taux de réalisation est inférieur à 50% à mi-parcours'::TEXT
  FROM activites a
  JOIN projets p ON a.id_projet = p.id
  JOIN avancement_activite aa ON a.id = aa.id_activite
  WHERE a.date_debut_prevue IS NOT NULL
  AND a.date_fin_prevue IS NOT NULL
  AND CURRENT_DATE >= a.date_debut_prevue + (a.date_fin_prevue - a.date_debut_prevue) / 2
  AND aa.taux_realisation_physique < 50
  AND aa.id = (
    SELECT id FROM avancement_activite
    WHERE id_activite = a.id
    ORDER BY date_mise_a_jour DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le statut des rapports en retard
CREATE OR REPLACE FUNCTION mettre_a_jour_statut_rapports_retard()
RETURNS void AS $$
BEGIN
  UPDATE rapports
  SET statut = 'en_retard'
  WHERE date_limite < CURRENT_DATE
  AND statut = 'en_attente';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le budget restant d'une ligne budgétaire
CREATE OR REPLACE FUNCTION calculer_budget_restant(id_ligne_budgetaire_uuid UUID)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  montant_alloue DECIMAL(12, 2);
  montant_consomme DECIMAL(12, 2);
BEGIN
  SELECT montant_alloue INTO montant_alloue
  FROM lignes_budgetaires
  WHERE id = id_ligne_budgetaire_uuid;
  
  SELECT COALESCE(SUM(montant), 0) INTO montant_consomme
  FROM depenses
  WHERE id_ligne_budgetaire = id_ligne_budgetaire_uuid;
  
  RETURN montant_alloue - montant_consomme;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le montant consommé
CREATE OR REPLACE FUNCTION update_montant_consomme()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lignes_budgetaires
  SET montant_consomme = (
    SELECT COALESCE(SUM(montant), 0)
    FROM depenses
    WHERE id_ligne_budgetaire = NEW.id_ligne_budgetaire
  )
  WHERE id = NEW.id_ligne_budgetaire;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_montant_consomme
  AFTER INSERT OR UPDATE OR DELETE ON depenses
  FOR EACH ROW
  EXECUTE FUNCTION update_montant_consomme();


