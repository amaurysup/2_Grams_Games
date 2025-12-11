-- ==========================================
-- SYNCHRONISATION PROFILES <-> AUTH.USERS
-- À exécuter dans Supabase SQL Editor
-- ==========================================

-- Cette table ne stocke QUE les infos nécessaires pour la recherche d'amis
-- Elle est automatiquement synchronisée avec auth.users

-- 1. Créer la table profiles minimale (juste pour la recherche)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index pour recherche rapide par username
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_username_search_idx ON public.profiles USING gin(username gin_trgm_ops);

-- Activer l'extension pour recherche floue (optionnel mais recommandé)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Tout le monde peut lire (pour recherche d'amis)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 5. Les utilisateurs peuvent modifier leur propre profil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 6. Insertion automatique
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 7. Fonction pour synchroniser le username depuis auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction pour mettre à jour quand l'utilisateur modifie ses métadonnées
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    username = COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger à l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Trigger à la mise à jour
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 11. MIGRATION: Synchroniser les utilisateurs existants
INSERT INTO public.profiles (id, username)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'username',
    split_part(email, '@', 1)
  ) as username
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  updated_at = NOW();

-- 12. Vérifier le résultat
SELECT p.id, p.username, u.email 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id;
