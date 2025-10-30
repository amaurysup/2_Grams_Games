# 🍺 2 Grams Games - Configuration Supabase

## 📋 Ce qui a été implémenté

### ✅ Architecture complète d'authentification

#### 1. **Client Supabase** (`src/lib/supabase.ts`)
- Configuration du client Supabase avec variables d'environnement
- Vérification des clés au démarrage

#### 2. **AuthContext** (`src/context/AuthContext.ts`)
- Pattern singleton pour gérer l'état d'authentification global
- Hook-like `useAuth()` pour accéder aux méthodes d'auth
- Écoute `auth.onAuthStateChange()` pour synchronisation automatique
- Méthodes :
  - `signUp(email, password, username)` - Inscription
  - `signIn(email, password)` - Connexion
  - `signOut()` - Déconnexion
  - `authState` - État actuel (user, loading, isAuthenticated)

#### 3. **AuthForm Component** (`src/components/AuthForm.ts`)
- Composant réutilisable avec onglets Connexion/Inscription
- Validation côté client (email, password min 6 chars, confirmation)
- Messages d'erreur en temps réel par champ
- Messages de succès/erreur globaux
- Gestion du loading state

#### 4. **Navbar mise à jour** (`src/components/Navbar.ts`)
- Affiche l'email de l'utilisateur connecté
- Bouton de déconnexion fonctionnel
- Réactivité via subscription au AuthContext

#### 5. **Pages Auth**
- **LoginPage** : Utilise AuthForm en mode 'login'
- **RegisterPage** : Utilise AuthForm en mode 'signup'
- Routes : `/login` et `/signup` (ou `/register`)

#### 6. **HomePage**
- CTA "Commencer maintenant" vers `/signup`
- Encouragement à l'inscription

---

## 🚀 Configuration requise

### 1. Variables d'environnement (.env)

Mettez à jour votre fichier `.env` avec vos vraies clés Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
```

### 2. Configuration Supabase

Dans votre projet Supabase :

1. **Activer Email Auth** :
   - Dashboard → Authentication → Providers
   - Activer "Email"

2. **Configuration Email (optionnel)** :
   - En développement : Supabase envoie des emails de confirmation
   - En production : Configurez votre propre SMTP

3. **Policies** (sécurité - optionnel pour l'instant) :
   ```sql
   -- Aucune table n'est créée pour l'instant
   -- Les utilisateurs sont stockés dans auth.users automatiquement
   ```

---

## 🎯 Fonctionnement

### Flow d'inscription
1. Utilisateur remplit le formulaire (email, password, username)
2. AuthForm valide les données
3. Appel à `authContext.signUp()`
4. Supabase crée l'utilisateur dans `auth.users`
5. Email de confirmation envoyé (si activé)
6. AuthContext notifie tous les composants
7. Navbar se met à jour automatiquement

### Flow de connexion
1. Utilisateur entre email/password
2. AuthForm valide
3. Appel à `authContext.signIn()`
4. Supabase vérifie les credentials
5. Session créée automatiquement
6. AuthContext notifie les composants
7. Redirection vers `/`

### Persistance de session
- Supabase gère automatiquement le localStorage
- Refresh token automatique
- onAuthStateChange() synchronise l'état au chargement

---

## 🧪 Test

1. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Tester l'inscription** :
   - Aller sur http://localhost:3000
   - Cliquer sur "Commencer maintenant"
   - Remplir le formulaire d'inscription
   - Vérifier l'email dans le Dashboard Supabase (Authentication → Users)

3. **Tester la connexion** :
   - Se déconnecter
   - Cliquer sur "Se connecter"
   - Entrer les credentials

4. **Vérifier la persistance** :
   - Rafraîchir la page
   - L'utilisateur doit rester connecté

---

## 📁 Structure des fichiers créés/modifiés

```
src/
├── lib/
│   └── supabase.ts          # Client Supabase
├── context/
│   └── AuthContext.ts       # Gestion état auth avec onAuthStateChange
├── components/
│   ├── AuthForm.ts          # Formulaire avec onglets + validation
│   └── Navbar.ts            # Affiche email + déconnexion
├── pages/
│   ├── HomePage.ts          # CTA vers signup
│   ├── LoginPage.ts         # Utilise AuthForm
│   └── RegisterPage.ts      # Utilise AuthForm
├── router.ts                # Routes /login et /signup
├── main.ts                  # Initialisation sans AuthService
└── types.ts                 # Types mis à jour

.env                          # Variables Supabase
.gitignore                    # Protège .env
```

---

## 🔒 Sécurité

- ✅ `.env` dans `.gitignore` (ne sera jamais commité)
- ✅ Validation côté client
- ✅ Supabase gère la sécurité côté serveur
- ✅ Passwords hashés automatiquement par Supabase
- ⚠️ À faire : Ajouter Row Level Security (RLS) quand vous créerez des tables

---

## 🎨 Prochaines étapes

1. **Confirmer les emails** :
   - Configurer l'URL de redirection dans Supabase
   - Gérer la confirmation d'email

2. **Profil utilisateur** :
   - Créer table `profiles` liée à `auth.users`
   - Stocker username, avatar, isPremium

3. **Abonnement premium** :
   - Intégrer Stripe
   - Gérer les plans payants

4. **Fonctionnalités premium** :
   - Favoris
   - Jeux personnalisés
   - Stats

---

## ❓ Résolution de problèmes

**Erreur "Missing Supabase environment variables"** :
- Vérifiez que `.env` existe à la racine
- Vérifiez les noms des variables : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- Redémarrez le serveur après modification du `.env`

**Email non reçu** :
- Vérifiez les spams
- En développement, regardez dans Dashboard Supabase → Authentication → Users
- Désactivez temporairement la confirmation email dans Settings → Auth

**Session non persistante** :
- Vérifiez que localStorage n'est pas bloqué
- Testez en navigation privée pour éliminer les extensions
