/**
 * Politique de mot de passe — source unique de vérité (Zod).
 *
 * Règles (équilibre robustesse/simplicité pour les PME visées) :
 *   - 8 caractères minimum
 *   - au moins une majuscule
 *   - au moins un chiffre
 *
 * Côté Supabase, `minimum_password_length = 8` est configuré dans
 * supabase/config.toml — la validation Zod donne un message FR clair AVANT
 * l'appel réseau, le serveur reste le garant ultime.
 *
 * ⚠️ À n'appliquer QUE sur inscription et réinitialisation : JAMAIS sur la
 * connexion, sinon les comptes existants (mot de passe plus faible) seraient
 * bloqués sans possibilité de le changer.
 */
import { z } from "zod";

export const PASSWORD_POLICY_MESSAGE =
  "8 caractères minimum, avec au moins une majuscule et un chiffre";

/**
 * Mot de passe conforme à la politique :
 * min 8 caractères, ≥ 1 majuscule, ≥ 1 chiffre.
 * (Pas d'exigence de caractère spécial ni de classe maximale — la longueur
 * reste le facteur dominant selon NIST SP 800-63B.)
 */
export const passwordSchema = z
  .string()
  .min(8, PASSWORD_POLICY_MESSAGE)
  .max(128, "128 caractères maximum")
  .regex(/[A-Z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/\d/, PASSWORD_POLICY_MESSAGE);

/** Deux mots de passe identiques, conformes à la politique. */
export const passwordWithConfirmSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

/** Jauge de robustesse (0-4) affichée sous les champs mot de passe. */
export function passwordStrength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
  return { score, label: labels[score] };
}
