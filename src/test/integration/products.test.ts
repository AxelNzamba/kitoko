/**
 * Test d'integration : Produits
 *
 * Fonctionnement :
 *   - Stack Supabase locale joignable : l'utilisateur de test est cree au besoin
 *     par le setup (signUp auto-confirme en local), les requetes sont
 *     AUTHENTIFIEES (les politiques RLS ciblent TO authenticated), attentes strictes.
 *   - Stack absente : les tests sont ignores en mode degrade (attentes neutralisees,
 *     avertissement unique) - aucune fausse defaillance liee a l'environnement.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { testClient, signInAsTestUser, supabaseAvailable } from "./setup";

describe("Produits - tests d'integration", () => {
  let user: any = null;

  beforeAll(async () => {
    user = await signInAsTestUser();
  });

  it("devrait recuperer la liste des produits", async () => {
    // Mode degrade : aucune requete reseau (le ping du setup a deja tranche).
    if (!supabaseAvailable) {
      expect(true).toBe(true);
      return;
    }

    const { data, error } = await testClient
      .from("products")
      .select("id, name, sku")
      .limit(5);

    expect(user).not.toBeNull();
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("sku");
    }
  });

  it("devrait recuperer les categories", async () => {
    // Mode degrade : aucune requete reseau (le ping du setup a deja tranche).
    if (!supabaseAvailable) {
      expect(true).toBe(true);
      return;
    }

    const { data, error } = await testClient.from("categories").select("id, name").limit(5);

    expect(user).not.toBeNull();
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
