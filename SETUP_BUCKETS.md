# Guide de Création des Buckets Storage

## Prérequis

1. **Installer Supabase CLI** :
   ```bash
   npm install -g supabase
   ```

2. **Se connecter à Supabase** :
   ```bash
   supabase login
   ```

3. **Lier votre projet** :
   ```bash
   supabase link --project-ref foxxnqckwkdwgbjfjetm
   ```
   (Remplacez `foxxnqckwkdwgbjfjetm` par votre project ref si différent)

## Création des Buckets

### Option 1 : Script automatique (Windows PowerShell)

```powershell
.\create-buckets.ps1
```

### Option 2 : Script automatique (Linux/Mac)

```bash
chmod +x create-buckets.sh
./create-buckets.sh
```

### Option 3 : Création manuelle

Exécutez ces commandes une par une :

```bash
# Buckets pour les documents
supabase storage create documents-ordre-mission --public false
supabase storage create documents-projets --public false
supabase storage create justificatifs-depenses --public false
supabase storage create tdrs --public false
supabase storage create documents-grh --public false
supabase storage create rapports --public false
```

## Vérification

Pour lister tous les buckets créés :

```bash
supabase storage list
```

## Buckets à créer

1. ✅ **documents-ordre-mission** - Documents justificatifs des ordres de mission
2. ✅ **documents-projets** - Documents liés aux projets MEAL
3. ✅ **justificatifs-depenses** - Justificatifs de dépenses financières
4. ✅ **tdrs** - Documents des Termes de Référence
5. ✅ **documents-grh** - Documents RH (CV, contrats, etc.)
6. ✅ **rapports** - Rapports périodiques

Tous les buckets sont créés en mode **Private** pour la sécurité.

## Configuration des Policies RLS

Après la création des buckets, vous devrez configurer les policies RLS dans le dashboard Supabase :

1. Allez dans **Storage** > Sélectionnez un bucket
2. Allez dans l'onglet **Policies**
3. Créez les policies selon vos besoins de sécurité

## Alternative : Création via Dashboard

Si vous préférez utiliser l'interface web :

1. Allez dans votre dashboard Supabase
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **"New bucket"**
4. Pour chaque bucket :
   - **Name** : Le nom du bucket
   - **Public bucket** : Décochez (Private)
   - Cliquez sur **"Create bucket"**


