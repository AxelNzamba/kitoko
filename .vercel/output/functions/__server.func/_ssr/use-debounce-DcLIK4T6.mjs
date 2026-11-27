import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-debounce-DcLIK4T6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
function useDebounce(value, delay = 300) {
	const [debouncedValue, setDebouncedValue] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);
	return debouncedValue;
}
//#endregion
export { useDebounce as t };
