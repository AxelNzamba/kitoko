# 📦 Dépendances — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15

---

## 🚀 Production

### Framework & UI
| Package | Version | Rôle | Alternative(s) |
|---------|---------|------|----------------|
| `react` | ^19.2.0 | Bibliothèque UI | - |
| `react-dom` | ^19.2.0 | Rendu DOM | - |
| `@tanstack/react-start` | ^1.168.26 | Framework SSR | Next.js, Remix |
| `@tanstack/react-router` | ^1.170.16 | Routage | React Router, Next Router |
| `@tanstack/react-query` | ^5.101.1 | Gestion état serveur | SWR, RTK Query |
| `@tanstack/router-plugin` | ^1.168.18 | Plugin Vite routage | - |

### Styles & UI
| Package | Version | Rôle | Alternative(s) |
|---------|---------|------|----------------|
| `tailwindcss` | ^4.2.1 | CSS utility-first | SCSS, Styled Components |
| `tw-animate-css` | ^1.3.4 | Animations Tailwind | - |
| `@tailwindcss/vite` | ^4.2.1 | Plugin Vite Tailwind | - |
| `class-variance-authority` | ^0.7.1 | Variantes CSS | - |
| `clsx` | ^2.1.1 | Classes conditionnelles | - |
| `tailwind-merge` | ^3.5.0 | Fusion classes Tailwind | - |
| `lucide-react` | ^0.575.0 | Icônes | Heroicons, Phosphor |

### Composants (shadcn/ui basés sur Radix)
| Package | Version | Rôle |
|---------|---------|------|
| `@radix-ui/react-*` | Multiples | Primitives UI accessibles |
| `cmdk` | ^1.1.1 | Command palette |
| `embla-carousel-react` | ^8.6.0 | Carrousel |
| `input-otp` | ^1.4.2 | Input OTP |
| `react-day-picker` | ^9.14.0 | Calendrier |
| `react-resizable-panels` | ^4.6.5 | Panneaux redimensionnables |
| `sonner` | ^2.0.7 | Notifications toast |
| `vaul` | ^1.1.2 | Drawer |

### Formulaires & Validation
| Package | Version | Rôle | Alternative(s) |
|---------|---------|------|----------------|
| `react-hook-form` | ^7.71.2 | Gestion formulaires | Formik |
| `@hookform/resolvers` | ^5.2.2 | Résolveurs Zod | - |
| `zod` | ^3.24.2 | Validation schémas | Yup, Joi |

### Base de données & Auth
| Package | Version | Rôle | Alternative(s) |
|---------|---------|------|----------------|
| `@supabase/supabase-js` | ^2.110.5 | Client Supabase | Firebase, Appwrite |

### Utilitaires
| Package | Version | Rôle | Alternative(s) |
|---------|---------|------|----------------|
| `date-fns` | ^4.1.0 | Manipulation dates | Day.js, Luxon |
| `qrcode.react` | ^4.2.0 | QR codes | - |
| `jsbarcode` | ^3.12.3 | Codes-barres | - |
| `html5-qrcode` | ^2.3.8 | Scan QR | - |
| `jspdf` | ^4.2.1 | Génération PDF | pdf-lib |
| `jspdf-autotable` | ^5.0.8 | Tableaux PDF | - |
| `recharts` | ^2.15.4 | Graphiques | Chart.js, Nivo |

---

## 🛠 Développement

| Package | Version | Rôle |
|---------|---------|------|
| `typescript` | ^5.8.3 | Langage |
| `vite` | ^8.0.16 | Bundler |
| `@vitejs/plugin-react` | ^5.2.0 | Plugin React Vite |
| `vite-tsconfig-paths` | ^6.0.2 | Alias TypeScript |
| `@lovable.dev/vite-tanstack-config` | ^2.7.6 | Configuration Lovable |
| `eslint` | ^9.32.0 | Linter |
| `prettier` | ^3.7.3 | Formateur |
| `nitro` | 3.0.260603-beta | Serveur SSR |
| `@types/react` | ^19.2.0 | Types React |
| `@types/react-dom` | ^19.2.0 | Types React DOM |
| `@types/node` | ^22.16.5 | Types Node |

---

## 📊 Statistiques

- **Nombre de dépendances production** : ~45
- **Nombre de dépendances développement** : ~15
- **Taille bundle estimée** : ~250 KB (JS gzippé)
