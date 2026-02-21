# Utilisateur de test niveau 1 (ordres de mission)

Un **profil niveau 1** (rôle `USER`) peut créer et **soumettre** des ordres de mission.  
Un **profil niveau 3** (rôle `DIR` ou `MEAL`) voit **tous** les ordres soumis et peut les **valider** (signature) ou les rejeter.

## Créer un utilisateur niveau 1

1. Récupérez la **clé service_role** : Supabase Dashboard → Project Settings → API → `service_role` (secret).

2. Exécutez le script (une seule fois) :

```bash
SUPABASE_URL=https://VOTRE_PROJECT.supabase.co SUPABASE_SERVICE_ROLE_KEY=votre_cle node scripts/seed-niveau1-user.mjs
```

3. Optionnel : personnaliser email et mot de passe :

```bash
SEED_NIVEAU1_EMAIL=monuser@test.com SEED_NIVEAU1_PASSWORD=MonMotDePasse node scripts/seed-niveau1-user.mjs
```

Par défaut : `niveau1@afdr.local` / `Niveau1-Mission-2025!`

## Scénario de test

1. Connectez-vous avec le compte **niveau 1** → créez un ordre de mission, enregistrez en brouillon, puis cliquez **Soumettre**.
2. Déconnectez-vous et connectez-vous avec un compte **niveau 3** (DIR ou MEAL).
3. Allez dans **Ordres de mission** → **Validation** : vous devez voir l’ordre soumis.
4. Sélectionnez-le, consultez le PDF si besoin, puis **Approuver avec signature** ou **Rejeter**.

## RLS

La migration `021_ordres_mission_rls_direction.sql` permet aux utilisateurs ayant le rôle **DIR** ou **MEAL** de voir tous les ordres de mission et de les mettre à jour (validation). Pensez à appliquer les migrations si ce n’est pas déjà fait.
