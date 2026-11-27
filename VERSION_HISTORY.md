# 📜 Historique des Versions — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## [1.14.0] — 2026-09-15
- Flux « mot de passe oublié » complet + route `/reset-password`
- Inscription : confirmation email (production-like), confirmation mdp, jauge robustesse
- Politique de mot de passe : 8+ caractères, majuscule, chiffre (Zod + GoTrue)
- Setup intégration auto-suffisant (ping health, création user de test)
- E2E auth : 13 scénarios + helpers Mailpit partagés ; Playwright séquentiel
- Retrait du bouton « Tester » du panneau de notifications

## [1.13.0] — 2026-09-15

Performance — les 6 axes d'optimisation traités (voir [CHANGELOG.md](./CHANGELOG.md)) :
pagination serveur généralisée (SAV, commandes, transferts), debounce sur toutes les recherches,
memoization des lignes de liste, code splitting recharts + jspdf, staleTime différencié.

## [1.0.0] — 2026-07-21

Version initiale — MVP complet.

### Modules
- 14 modules métier
- Authentification
- Dashboard
- Infrastructure technique complète
- Documentation complète

Voir [RELEASE_NOTES.md](./RELEASE_NOTES.md) pour les détails.
