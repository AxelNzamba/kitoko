# ✨ Fonctionnalités — INDUS-ERP

> **Dernière mise à jour** : 2026-11-06

---

## ✅ Terminées

### Multi-entrepôts
- [x] Gestion de plusieurs entrepôts/sites (`warehouses`)
- [x] Sélecteur d'entrepôt persistant dans le header
- [x] Filtrage automatique des listes (Stock, Lots, Inventaire) par entrepôt actif
- [x] Calcul du stock par entrepôt via `lot_stock_by_warehouse`
- [x] Gestion hiérarchique des emplacements (zone/allée/rack/baie/niveau)
- [x] Transferts de stock entre emplacements

### Mode terrain (mobile)
- [x] Route `/terrain` optimisée mobile
- [x] Scanner QR caméra intégré
- [x] Entrée/Sortie de stock rapide
- [x] Comptage inventaire rapide lié à une session
- [x] Réception fournisseur simplifiée

### Recherche globale
- [x] Palette de commande Cmd+K
- [x] Recherche produits, lots, clients, fournisseurs et pages

### Aide & prise en main
- [x] Centre d'aide intégré (bouton d'en-tête + touche `?`)
- [x] Aide contextuelle par module avec actions filtrées par rôle
- [x] Parcours de démarrage par rôle (propriétaire, magasinier, caissier)
- [x] Raccourcis clavier réels et FAQ métier (avoir, stock, hors-ligne, rôles, mot de passe)
- [x] Carte « Premiers pas » sur le tableau de bord d'une installation vide



### Authentification
- [x] Connexion email/mot de passe
- [x] Inscription avec création de compte
- [x] Attribution automatique du rôle propriétaire
- [x] Protection des routes authentifiées
- [x] Redirection intelligente (connecté → dashboard, pas connecté → auth)
- [x] Mot de passe oublié : demande d'email + route `/reset-password` (nouveau mot de
  passe via lien `/auth/v1/verify?type=recovery`)
- [x] Confirmation d'email à l'inscription (écran dédié, connexion refusée avant clic
  sur le lien reçu)
- [x] Politique de mot de passe : 8+ caractères, majuscule et chiffre (inscription et
  réinitialisation)
- [x] Afficher/masquer le mot de passe, jauge de robustesse, confirmation du mot de passe

### Dashboard
- [x] Vue d'ensemble
- [x] KPIs principaux (CA jour/mois, ventes, dépenses, bénéfice, valeur stock)
- [x] Sparklines 7 jours sur chaque KPI
- [x] Comparaison mois précédent / année N-1
- [x] Graphique évolution CA sur 30 jours
- [x] Alertes stock temps réel
- [x] Dernières transactions
- [x] Export PDF du dashboard
- [x] Top 5 produits du mois

### Produits
- [x] Liste des produits avec photo, SKU, catégorie, prix, stock
- [x] Création de produit avec upload photo
- [x] SKU auto-généré (PRD-XXXXXX)
- [x] Code-barres auto-généré (13 chiffres, EAN-like)
- [x] QR code généré à partir du SKU
- [x] Affichage QR + barcode imprimables

### Catégories
- [x] Liste des catégories
- [x] Création de catégorie
- [x] Structure arborescente (parent/enfant)

### Lots
- [x] Liste des lots par produit
- [x] Création de lot (produit, fournisseur, n° lot, date, quantité, prix)
- [x] Upload PDF certificat
- [x] Consultation certificat
- [x] Quantité restante calculée par lot

### Fournisseurs
- [x] Liste des fournisseurs
- [x] Création rapide de fournisseur

### Stock
- [x] Vue mouvements filtrable
- [x] Filtre par emplacement de stock
- [x] Colonne emplacement dans le tableau
- [x] Action entrée/sortie
- [x] Sélection produit → lot → emplacement → quantité → prix → motif
- [x] Écriture dans stock_movements
- [x] Mise à jour quantité restante
- [x] Export CSV des mouvements

### Ventes (POS)
- [x] Recherche produit (nom/SKU)
- [x] Scan QR code produit
- [x] Panier avec quantité et TVA
- [x] Total HT/TVA/TTC en temps réel
- [x] Choix mode paiement (espèces, mobile money, carte, virement)
- [x] Validation → sales + sale_items + mouvements sortie FIFO
- [x] Facture PDF téléchargeable (jsPDF)

### Achats
- [x] Liste des achats
- [x] Création d'achat

### Clients
- [x] Liste des clients
- [x] Création de client

### Dépenses
- [x] Liste des dépenses
- [x] Création de dépense

### Inventaire
- [x] Création de session d'inventaire
- [x] Scan QR code (html5-qrcode)
- [x] Saisie quantité comptée
- [x] Calcul écarts (compté vs théorique)

### Scanner
- [x] Scan QR code universel

### Rapports
- [x] Tableaux de bord avec graphiques (Recharts)
- [x] Analyses

### Utilisateurs
- [x] Liste des utilisateurs
- [x] Gestion des rôles (proprietaire, magasinier, caissier)

### Paramètres
- [x] Configuration générale

### Emplacements (Multi-location)
- [x] CRUD emplacements de stock (entrepôts, zones)
- [x] Activation/désactivation d'emplacement
- [x] Transferts entre emplacements (double mouvement)

### Retours fournisseurs
- [x] CRUD retours
- [x] Numéro automatique (RET-YYYYMMDD-XXXX)
- [x] Motifs prédéfinis (défectueux, erreur, périmé, etc.)
- [x] Création automatique de mouvement de sortie
- [x] Statuts (en attente, effectué, annulé)

### Avoirs
- [x] CRUD avoirs
- [x] Numéro automatique (AV-YYYYMMDD-XXXX)
- [x] Lien vers une vente existante
- [x] Motifs prédéfinis
- [x] Envoi par email

### PWA / Mode hors-ligne
- [x] Service Worker (cache-first assets, network-first données)
- [x] Manifest (icône SVG, thème orange, standalone)
- [x] Page hors-ligne stylée
- [x] Favicon SVG personnalisé

### Infrastructure
- [x] Composants shadcn/ui (60+)
- [x] Hooks React Query
- [x] Validation Zod
- [x] Génération PDF (jsPDF)
- [x] Scan QR (html5-qrcode)
- [x] Génération QR/barcode (qrcode.react, JsBarcode)
- [x] Export CSV (BOM UTF-8 pour Excel)
- [x] Thème clair/sombre
- [x] Design system cohérent
- [x] Gestion des erreurs SSR
- [x] Documentation complète (30+ fichiers .md)
- [x] Notifications in-app (sonner + cloche + localStorage)
- [x] Animations UI (keyframes CSS, micro-interactions)
- [x] Rate limiting (5 endpoints)
- [x] Logger structuré (6 niveaux)
- [x] Sentry (monitoring erreurs client + serveur)
- [x] CI/CD (GitHub Actions)
- [x] Dependabot (alertes sécurité automatiques)

### Temps réel (Supabase Realtime)
- [x] Hook `useRealtimeSubscription` générique (table, event, filter)
- [x] Composant `LiveBadge` avec indicateur visuel (vert/orange/rouge)
- [x] Dashboard temps réel (souscriptions sales + stock_movements)
- [x] Stock temps réel (souscription stock_movements)
- [x] Nettoyage automatique des canaux au démontage

### Déploiement & Build
- [x] Configuration Vercel (vercel.json) avec headers sécurité
- [x] Cache immutable pour assets statiques (1 an)
- [x] Secrets d'environnement Vercel documentés
- [x] Script `analyze:bundle` (vite-bundle-visualizer)
- [x] Rapport d'analyse de bundle (jspdf 399 kB, dashboard 408 kB)

---

## 🔄 En développement

- Aucune — toutes les tâches sont terminées

---

## 📅 À développer

Voir [ROADMAP.md](./ROADMAP.md) pour les idées futures.

- ✅ Liaison des interventions SAV aux numéros de série + historique par série
- ✅ Timeline unifiée par produit (`/historique-produit`) avec exports CSV/PDF
- ✅ Résolution de conflits guidée champ par champ dans le Centre de synchronisation

## Ajouts 2026-11-06
- Double devise : stockage en devise de base (CDF/XOF/XAF/USD/EUR), taux configurable et bascule d'affichage dans l'en-tête.
- Tickets thermiques 58/80 mm imprimés en une action, auto-impression optionnelle, pied de ticket personnalisable.
- Partage WhatsApp du ticket de vente et contact direct depuis la fiche client.
- Caisse tactile : pavé numérique, coupures rapides, montant reçu et monnaie rendue.
- Journal d'activité `/activite` : onglets « Actions métier » et « Modifications » (qui a modifié quoi, filtres, CSV).
- Jeu de données de démonstration `supabase/seed.sql`.
- Scripts `backup.sh` / `restore.sh` et objectifs RPO/RTO documentés.

## Ajouts 2026-08-08
- Favoris et raccourcis par rôle / entrepôt (épinglage depuis le header, barre d'accès rapide).
- Mode kiosque caissier plein écran (vente + scan uniquement).
- Emplacements : arborescence, recherche auto-complétée, création rapide.
- Notifications intelligentes par entrepôt (stock critique, commandes en retard, garanties).
- Transferts entre entrepôts avec bon de transfert, scan QR et validation source/destination.

## Activité & audit (2026-10-05) — terminé
- Journal d'audit automatique de toutes les écritures métier + événements métier explicites.
- Page « Activité » réservée au Propriétaire, export CSV, détail avant/après.


## Livraison Hôtel — 2026-11-10
Kitoko Hôtel : chambres/types/tarifs, état, planning 14 jours, réservation, arrivée/départ, folio avec acompte et consommations, facture PDF, ménage automatique. Sélecteur d’applications et rôle Réceptionniste dédié.
