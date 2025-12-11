-- Table profiles pour permettre la connexion par nom d'utilisateur
-- Exécutez ce script dans Supabase SQL Editor

-- Créer la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par username
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent lire tous les profils (pour vérifier si username existe)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Politique: les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique: les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Optionnel: Créer des profils pour les utilisateurs existants
-- INSERT INTO profiles (id, email, username)
-- SELECT 
--   id, 
--   email, 
--   COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1))
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
