-- =============================================
-- SETUP BUCKET AVATARS POUR LES PHOTOS DE PROFIL
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- 1. Créer le bucket pour les avatars (si pas déjà fait via l'interface)
-- Note: Les buckets se créent généralement via l'interface Supabase Storage
-- Allez dans Storage > New Bucket > Nom: "avatars" > Public: ON

-- 2. Policies pour le bucket avatars
-- Permettre à tout le monde de voir les avatars (bucket public)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permettre aux utilisateurs connectés d'uploader leur avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- INSTRUCTIONS MANUELLES (Interface Supabase)
-- =============================================
-- 1. Allez dans Storage dans votre projet Supabase
-- 2. Cliquez sur "New Bucket"
-- 3. Nom: avatars
-- 4. Cochez "Public bucket" pour que les images soient accessibles
-- 5. Cliquez sur "Create bucket"
-- 6. Ensuite exécutez les policies ci-dessus dans SQL Editor
