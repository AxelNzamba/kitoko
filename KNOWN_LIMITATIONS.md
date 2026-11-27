# ⚠️ Limites Connues — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 🧩 Fonctionnelles

| # | Limite | Impact | Contournement |
|---|--------|--------|---------------|
| 1 | Pas d'édition/suppression des produits créés | Moyen | Créer un nouveau produit |
| 2 | Pas d'édition/suppression des lots créés | Moyen | Créer un nouveau lot |
| 3 | Pas de modification des mouvements de stock | Moyen | Créer un mouvement inverse |
| 4 | Pas d'annulation de vente | Haut | Aucun |
| 5 | Pas de multi-emplacement stock | Moyen | Aucun |
| 6 | Pas de transferts entre emplacements | Moyen | Aucun |
| 7 | Pas de retours fournisseurs | Moyen | Aucun |
| 8 | Pas d'avoirs | Moyen | Aucun |
| 9 | TVA unique par produit (pas de multi-taux) | Faible | Augmenter le prix de vente |
| 10 | Pas de mode hors-ligne | Haut | Connexion Internet requise |

## 🛠 Techniques

| # | Limite | Impact | Contournement |
|---|--------|--------|---------------|
| 11 | Aucun test automatisé | Critique | Tests manuels uniquement |
| 12 | Pas de CI/CD | Haut | Déploiement manuel |
| 13 | Pas de monitoring | Haut | Aucune visibilité erreurs |
| 14 | Logging console.log uniquement | Moyen | Aucune centralisation |
| 15 | ~~Pas de pagination sur listes~~ | ✅ Résolu (2026-09-15) | 13 listes paginées côté serveur (range + count exact) |
| 16 | ~~Images non optimisées~~ | ✅ Résolu (2026-07-21) | Compression WebP automatique à l'upload |
| 17 | ~~Pas de debounce recherche~~ | ✅ Résolu (2026-09-15) | useDebounce sur toutes les recherches |

## 🔒 Sécurité

| # | Limite | Impact | Contournement |
|---|--------|--------|---------------|
| 18 | Pas de Rate Limiting | Moyen | Protéger manuellement |
| 19 | Pas de vérification email obligatoire | Moyen | Vérification manuelle |
| 20 | Pas d'audit de sécurité complet | Moyen | Aucun |

## 🔌 Hors-ligne (mise à jour 2026-09-04)

| # | Limite | Impact | Contournement |
|---|--------|--------|---------------|
| 1 | Le mode terrain hors-ligne s'appuie sur les données déjà synchronisées : un appareil jamais connecté n'a rien à afficher | Élevé au premier usage | Ouvrir l'application une fois en ligne avant l'intervention |
| 2 | La réception fournisseur est indisponible hors-ligne (mise à jour de la commande et de ses lignes non rejouable en sécurité) | Moyen | Enregistrer la marchandise via « Entrée », réceptionner la commande à la reconnexion |
| 3 | Le rechargement complet de l'application hors-ligne dépend du Service Worker, non vérifiable en développement | Moyen | À valider sur le site publié |

- Réception fournisseur hors-ligne : seules les commandes consultées avec le réseau sur l'appareil sont disponibles. Ouverture de l'application sans internet à vérifier sur le site publié (le service worker n'agit pas en développement).


## Livraison Hôtel — 2026-11-10
Hôtel : fonctionnement en ligne uniquement ; facture PDF de séjour non certifiée DGI ; pas de comptabilité des règlements finale dédiée. Minibar prélève un lot ayant quantité suffisante ; aucun choix d’entrepôt ni fractionnement entre lots dans cette version. Les articles QA de vérification sont explicitement nommés QA/Essai hôtel.
