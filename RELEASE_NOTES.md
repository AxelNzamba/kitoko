# 📝 Notes de Version — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## Version 1.14.0 — Authentification production-like (2026-09-15)

### ✨ Nouveautés
- **Mot de passe oublié** : lien « Mot de passe oublié ? » sur /auth → email (Mailpit en
  local) → clic sur le lien → `/reset-password` pour définir le nouveau mot de passe.
- **Inscription renforcée** : confirmation d'email activée (connexion refusée avant clic),
  confirmation du mot de passe, jauge de robustesse, afficher/masquer.
- **Politique de mot de passe** : 8 caractères min, majuscule et chiffre (appliquée à
  l'inscription et la réinitialisation ; comptes existants non impactés).

### 🔧 Corrections
- Liens email redirigés vers l'application (allow-list GoTrue à wildcards)
- Stack locale réparée (analytics désactivé, données restaurées)
- Test d'intégration produits au verdict non déterministe corrigé
- Tests E2E rendus séquentiels (course sur Mailpit)
- Bouton « Tester » retiré du panneau de notifications

### ✅ Qualité
- 90 tests unitaires+intégration, 13 tests E2E auth, typecheck propre

---

## Version 1.0.0 — MVP Fondateur

**Date** : 2026-07-21

### ✨ Nouveautés
- Application complète de gestion de stock
- 14 modules métier
- Authentification sécurisée (Supabase Auth)
- Design system professionnel (Navy + Orange)
- Thème clair/sombre
- Génération de documents (QR codes, codes-barres, factures PDF)
- Scan QR code via caméra
- Validation Zod de toutes les entrées
- Cache TanStack Query

### 🔧 Corrections
- Aucune (première version)

### ⚠️ Problèmes connus
- Voir [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)

### 📦 Dépendances
- Voir [DEPENDENCIES.md](./DEPENDENCIES.md)

### 📚 Documentation
- Documentation complète du projet (30+ fichiers .md)


## Livraison Hôtel — 2026-11-10
Kitoko Hôtel disponible depuis Applications : réservation, accueil, facture et ménage. Propriétaire attribue le rôle Réceptionniste dans Utilisateurs. Accès produits/emplacements/avoirs renforcés.
