-- ==========================================
-- TABLE FRIENDSHIPS - Système d'amis
-- À exécuter dans Supabase SQL Editor
-- ==========================================

-- 1. Créer la table friendships
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Empêcher les auto-demandes
  CONSTRAINT no_self_friendship CHECK (requester_id != receiver_id)
);

-- 2. Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS friendships_receiver_idx ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- 3. Contrainte unique pour éviter les doublons (A->B ou B->A)
-- On utilise LEAST/GREATEST pour normaliser l'ordre
CREATE UNIQUE INDEX IF NOT EXISTS friendships_unique_pair_idx 
ON public.friendships(LEAST(requester_id, receiver_id), GREATEST(requester_id, receiver_id));

-- 4. Activer RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Les utilisateurs peuvent voir leurs propres demandes d'amitié
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships" 
ON public.friendships FOR SELECT 
USING (
  auth.uid() = requester_id OR 
  auth.uid() = receiver_id
);

-- 6. Policy: Les utilisateurs peuvent créer des demandes d'amitié
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friendships;
CREATE POLICY "Users can create friend requests" 
ON public.friendships FOR INSERT 
WITH CHECK (
  auth.uid() = requester_id AND
  status = 'pending'
);

-- 7. Policy: Le receiver peut accepter/bloquer, le requester peut annuler
DROP POLICY IF EXISTS "Users can update own friendships" ON public.friendships;
CREATE POLICY "Users can update own friendships" 
ON public.friendships FOR UPDATE 
USING (
  auth.uid() = requester_id OR 
  auth.uid() = receiver_id
);

-- 8. Policy: Les deux parties peuvent supprimer l'amitié
DROP POLICY IF EXISTS "Users can delete own friendships" ON public.friendships;
CREATE POLICY "Users can delete own friendships" 
ON public.friendships FOR DELETE 
USING (
  auth.uid() = requester_id OR 
  auth.uid() = receiver_id
);

-- 9. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.handle_friendship_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_friendship_updated ON public.friendships;
CREATE TRIGGER on_friendship_updated
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.handle_friendship_updated();

-- 10. Vérifier la création
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'friendships' 
AND table_schema = 'public';
