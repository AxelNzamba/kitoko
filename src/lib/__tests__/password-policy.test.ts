import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  passwordWithConfirmSchema,
  passwordStrength,
  PASSWORD_POLICY_MESSAGE,
} from "../password-policy";

describe("passwordSchema", () => {
  it("accepte un mot de passe conforme", () => {
    expect(passwordSchema.safeParse("Abcdef12").success).toBe(true);
    expect(passwordSchema.safeParse("Bright2026!").success).toBe(true);
  });

  it("refuse moins de 8 caractères", () => {
    const r = passwordSchema.safeParse("Ab1x");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe(PASSWORD_POLICY_MESSAGE);
  });

  it("refuse sans majuscule", () => {
    const r = passwordSchema.safeParse("abcdef12");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe(PASSWORD_POLICY_MESSAGE);
  });

  it("refuse sans chiffre", () => {
    const r = passwordSchema.safeParse("Abcdefgh");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe(PASSWORD_POLICY_MESSAGE);
  });

  it("refuse vide et espaces seuls", () => {
    expect(passwordSchema.safeParse("").success).toBe(false);
    expect(passwordSchema.safeParse("        ").success).toBe(false);
  });

  it("refuse au-delà de 128 caractères", () => {
    expect(passwordSchema.safeParse("A1" + "a".repeat(128)).success).toBe(false);
  });
});

describe("passwordWithConfirmSchema", () => {
  it("accepte deux valeurs identiques conformes", () => {
    expect(
      passwordWithConfirmSchema.safeParse({ password: "Abcdef12", confirm: "Abcdef12" })
        .success,
    ).toBe(true);
  });

  it("refuse des valeurs différentes", () => {
    const r = passwordWithConfirmSchema.safeParse({
      password: "Abcdef12",
      confirm: "Abcdef13",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.message).toBe("Les mots de passe ne correspondent pas");
      expect(r.error.issues[0]?.path).toEqual(["confirm"]);
    }
  });

  it("refuse un mot de passe non conforme même si identiques", () => {
    expect(
      passwordWithConfirmSchema.safeParse({ password: "faible", confirm: "faible" }).success,
    ).toBe(false);
  });
});

describe("passwordStrength", () => {
  it("retourne score 0 et label vide pour une chaîne vide", () => {
    expect(passwordStrength("")).toEqual({ score: 0, label: "" });
  });

  it("score minimal pour un mot de passe court simple", () => {
    expect(passwordStrength("abc").score).toBe(0);
  });

  it("atteint 4 avec longueur + casse + chiffre + spécial", () => {
    expect(passwordStrength("Abcdef12!").score).toBe(4);
  });

  it("compte la longueur seule à partir de 8", () => {
    expect(passwordStrength("abcdefgh").score).toBe(1);
  });
});
