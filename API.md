# 🌐 API — INDUS-ERP

> **Dernière mise à jour** : 2026-09-15
> **Version** : 1.0.0

---

## 📋 Vue d'ensemble

INDUS-ERP n'expose pas d'API REST traditionnelle. Les données sont accessibles directement via le **client Supabase SDK** côté client (après hydratation) ou via les **Server Functions** TanStack Start côté serveur.

Ce document décrit les patterns d'accès aux données utilisés dans l'application.

---

## 🔌 Connexion

### Client Supabase

```typescript
import { supabase } from "@/integrations/supabase/client";

// Lecture
const { data, error } = await supabase
  .from("products")
  .select("*")
  .order("created_at", { ascending: false });

// Écriture
const { data, error } = await supabase
  .from("products")
  .insert({ name: "Produit", sku: "PRD-001", ... });
```

### TanStack Query

```typescript
// Hook personnalisé pour la lecture
function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      return data;
    },
  });
}

// Hook personnalisé pour l'écriture
function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

---

## 📡 Endpoints Supabase

### Produits

| Opération | Méthode | Code |
|-----------|---------|------|
| Liste produits | `supabase.from("products").select("*, categories(name)")` | Voir `produits.tsx` |
| Produit par ID | `supabase.from("products").select("*").eq("id", id).single()` | Voir `lots.tsx` |
| Créer produit | `supabase.from("products").insert(data).select().single()` | Voir `produits.tsx` |
| Rechercher produit | `supabase.from("products").select("*").ilike("name", \`%${q}%\`)` | Voir `ventes.tsx` |

### Lots

| Opération | Méthode |
|-----------|---------|
| Liste lots | `supabase.from("lots").select("*, products(name), suppliers(name)").order(...)` |
| Lot par ID | `supabase.from("lots").select("*").eq("id", id).single()` |
| Créer lot | `supabase.from("lots").insert(data).select().single()` |
| Stock par lot | `supabase.from("lot_stock").select("*").eq("lot_id", id)` |

### Stock

| Opération | Méthode |
|-----------|---------|
| Mouvements | `supabase.from("stock_movements").select("*, products(name), lots(lot_number)")` |
| Créer mouvement | `supabase.from("stock_movements").insert(data)` |

### Ventes

| Opération | Méthode |
|-----------|---------|
| Liste ventes | `supabase.from("sales").select("*, sale_items(*)").order(...)` |
| Créer vente | `supabase.from("sales").insert(data).select().single()` |
| Créer items | `supabase.from("sale_items").insert(items)` |

### Inventaire

| Opération | Méthode |
|-----------|---------|
| Sessions | `supabase.from("inventory_sessions").select("*, inventory_counts(*)")` |
| Créer session | `supabase.from("inventory_sessions").insert(data).select().single()` |
| Ajouter count | `supabase.from("inventory_counts").insert(data)` |

### Upload Storage

```typescript
// Photo produit
const { data } = await supabase.storage
  .from("product-photos")
  .upload(`products/${productId}/${fileName}`, file);

// Certificat PDF
const { data } = await supabase.storage
  .from("certificats")
  .upload(`lots/${lotId}/${fileName}`, file);
```

---

## 🔐 Authentification

Les appels Supabase sont automatiquement authentifiés via le client SDK qui gère le token JWT.

### Exemple
```typescript
const { data: { session } } = await supabase.auth.getSession();
// session.access_token est injecté automatiquement dans les headers
```

---

## 🛡 Sécurité (RLS)

Toutes les requêtes passent par les politiques RLS Supabase.

- **SELECT** : Tout utilisateur authentifié
- **INSERT/UPDATE/DELETE** : Restreint selon le rôle

```sql
-- Exemple : Seuls proprietaire et magasinier peuvent insérer des produits
CREATE POLICY "Insert for owner and storekeeper"
ON products FOR INSERT
TO authenticated
WITH CHECK (has_role('proprietaire', auth.uid()) OR has_role('magasinier', auth.uid()));
```

---

## 📝 Validation

### Zod Schemas

```typescript
const productSchema = z.object({
  name: z.string().min(1, "Nom requis").max(255),
  sku: z.string().min(1, "SKU requis").max(50),
  category_id: z.string().uuid().nullable(),
  purchase_price: z.number().min(0),
  sale_price: z.number().min(0),
  tva: z.number().min(0).max(100).default(16),
});
```

Toutes les entrées sont validées côté client avant envoi à Supabase.

---

## 📊 Codes HTTP (Supabase)

| Code | Signification | Action |
|------|---------------|--------|
| 200 | Succès | Données retournées |
| 201 | Créé | Insertion réussie |
| 204 | Pas de contenu | DELETE réussi |
| 400 | Requête invalide | Vérifier les paramètres |
| 401 | Non authentifié | Rediriger vers /auth |
| 403 | Non autorisé | Vérifier les rôles RLS |
| 404 | Introuvable | Vérifier l'ID |
| 409 | Conflit | Doublon (SKU, etc.) |
| 429 | Rate limit | Attendre avant réessayer |
| 500 | Erreur serveur | Contacter le support |

---

## 🚨 Gestion des erreurs

```typescript
try {
  const { data, error } = await supabase.from("products").insert(product);
  if (error) throw error;
  return data;
} catch (error) {
  console.error("Erreur lors de la création du produit:", error);
  toast.error("Impossible de créer le produit");
}
```


## Livraison Hôtel — 2026-11-10
RPC set_staff_role : authentifié, Propriétaire uniquement, cible non Propriétaire, rôle magasinier/caissier/receptionniste. RPC hotel_minibar_catalog : personnel hôtel uniquement, projection id/name/sale_price. Les écritures ordinaires utilisent le client sous RLS.
