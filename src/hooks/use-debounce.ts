import { useState, useEffect } from "react";

/**
 * Hook qui retarde la mise à jour d'une valeur jusqu'à ce qu'aucun changement
 * n'ait eu lieu pendant `delay` millisecondes.
 *
 * Utile pour les recherches en temps réel : évite de lancer une requête
 * à chaque frappe clavier.
 *
 * @param value - La valeur à "debouncer"
 * @param delay - Délai en ms (défaut: 300ms)
 * @returns La valeur stabilisée après le délai
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 300);
 * // Utiliser debouncedSearch dans la query Supabase
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Démarrer un timer qui met à jour la valeur après le délai
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
