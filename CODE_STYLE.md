# 📐 Code Style — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15
> **Version** : 1.0.0

---

## 📋 Vue d'ensemble

Ce document définit les normes de codage à respecter pour maintenir une base de code cohérente, lisible et maintenable.

---

## ✍️ Langage

- **TypeScript strict** uniquement — pas de JavaScript (`.js`, `.jsx`)
- `strict: true` dans `tsconfig.json`
- `noUncheckedSideEffectImports: true`

---

## 📁 Organisation des fichiers

```
module/
├── component.tsx           # Composant principal
├── component.test.tsx      # Tests (futur)
└── component.utils.ts      # Utilitaires (si nécessaire)
```

---

## 🏗 Structure des composants

### Composants React

```tsx
// 1. Imports (groupés par type)
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// 2. Route (si fichier de route)
export const Route = createFileRoute("/route")({
  component: ComponentName,
  // ...
});

// 3. Composant principal (nommé export)
function ComponentName() {
  // Hooks d'abord
  const [state, setState] = useState();

  // Rendu ensuite
  return <div>...</div>;
}

// 4. Sous-composants (dans le même fichier si simple)
function SubComponent() {
  return <div>...</div>;
}
```

### Règles
- **Exports nommés** uniquement (pas de `export default`)
- **Fonctions fléchées** pour les callbacks
- **Fonctions nommées** pour les composants et hooks
- **Props typées** avec interface (dans le fichier)

---

## 🎯 Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Composants | PascalCase | `ProductCard`, `UserList` |
| Fonctions | camelCase | `formatPrice`, `getProducts` |
| Variables | camelCase | `productName`, `totalAmount` |
| Constantes | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `API_URL` |
| Types/Interfaces | PascalCase | `ProductType`, `UserRole` |
| Enums | PascalCase | `MovementType`, `AppRole` |
| Fichiers | kebab-case | `product-card.tsx`, `use-auth.ts` |
| Dossiers | kebab-case | `ui/`, `supabase/` |
| Hooks | camelCase, préfixe `use` | `useProducts`, `useCurrentUser` |
| Hooks personnalisés | camelCase, préfixe `use` | `useDebounce`, `useMediaQuery` |

---

## 📦 Imports

### Ordre
```tsx
// 1. Bibliothèques externes
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

// 2. Composants internes
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 3. Hooks
import { useCurrentUser } from "@/hooks/use-current-user";

// 4. Utilitaires
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

// 5. Styles
import styles from "./component.module.css"; // futur
```

### Alias
- `@/` → `src/`

---

## 🧮 Types

### Toujours typer
```tsx
// ✅ Bien
const user: User = { id: "1", name: "Jean" };

// ✅ Bien (inféré)
const userName = user.name; // type: string

// ❌ Mal
const user: any = { id: "1" };
```

### Éviter `any`
```tsx
// ✅ Bien
type Product = {
  id: string;
  name: string;
  price: number;
};

// ❌ Mal
const product: any = { id: "1" };
```

### Interfaces vs Types
- **Interfaces** pour les objets/publics
- **Types** pour les unions, intersections, utilitaires

---

## ⚛️ Composants

### Structure
```tsx
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div onClick={() => onSelect(product.id)}>
      {product.name}
    </div>
  );
}
```

### Règles
- Props destructurées
- Interface définie avant le composant
- Composants atomiques (shadcn/ui)
- Pas de classes CSS custom (Tailwind uniquement)

---

## 🎨 Styles (Tailwind CSS)

```tsx
// ✅ Bien — classes Tailwind
<div className="flex items-center gap-2 rounded-md bg-primary p-4 text-primary-foreground">

// ✅ Bien — classes conditionnelles avec clsx (via cn())
import { cn } from "@/lib/utils";
<div className={cn("base-class", active && "active-class")}>

// ❌ Mal — CSS-in-JS
<div style={{ color: "red" }}>
```

---

## 🔄 États React

### TanStack Query
```tsx
// Lecture
const { data, isLoading, error } = useQuery({
  queryKey: ["products"],
  queryFn: async () => {
    const { data } = await supabase.from("products").select("*");
    return data;
  },
});

// Écriture
const mutation = useMutation({
  mutationFn: async (newProduct: Product) => {
    const { data } = await supabase.from("products").insert(newProduct);
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

### État local
```tsx
// ✅ Bien
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>(initialData);

// ❌ Mal (trop d'états séparés quand ils sont liés)
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
```

---

## ✅ Validation (Zod)

```tsx
const productSchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  price: z.number().positive("Prix positif"),
  category_id: z.string().uuid(),
});

// Validation
const result = productSchema.safeParse(input);
if (!result.success) {
  // Gérer les erreurs
}
```

---

## 🔒 Sécurité

- Ne jamais exposer les tokens ou secrets
- Toujours valider les entrées utilisateur (Zod)
- Utiliser RLS côté Supabase
- Vérifier les rôles avant les opérations sensibles

---

## 📝 Commentaires

```tsx
// ✅ Bien — Pourquoi, pas quoi
// Calcule le prix TTC à partir du prix HT et du taux de TVA

// ❌ Mal — Redondant
// Additionne a et b
function add(a: number, b: number) { return a + b; }

// ✅ Bien — JSDoc pour les fonctions publiques
/**
 * Formate un nombre en monnaie locale (CDF).
 * @param amount - Montant à formater
 * @returns Chaîne formatée (ex: "1 500,00 FC")
 */
```

---

## 🧪 Tests (futur)

```tsx
// À venir — Jest / Vitest
```

---

## 📏 Linting & Formatage

```bash
# Linting
bun run lint

# Formatage
bun run format
```

Configuration ESLint + Prettier déjà en place.

---

## 🚫 Ce qu'il ne faut PAS faire

```tsx
// ❌ any
const data: any = await fetchData();

// ❌ any cast
const user = data as any;

// ❌ @ts-ignore
// @ts-ignore
const x = someFunction();

// ❌ console.log en production (sauf pour debug temporaire)
console.log("debug");

// ❌ Imports circulaires

// ❌ Mutations directes
data.name = "new name";

// ❌ États locaux redondants (qui peuvent être calculés)
const [isEven, setIsEven] = useState(false);
useEffect(() => { setIsEven(count % 2 === 0); }, [count]);
// ✅ const isEven = count % 2 === 0;
```
