import { o as __toESM } from "../../_runtime.mjs";
import { u as require_react } from "../@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../@radix-ui/react-alert-dialog+[...].mjs";
import { i as QueryClientProvider, r as IsRestoringProvider } from "../tanstack__react-query.mjs";
import { n as persistQueryClientSubscribe, t as persistQueryClientRestore } from "./query-persist-client-core+[...].mjs";
//#region node_modules/@tanstack/react-query-persist-client/build/modern/PersistQueryClientProvider.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PersistQueryClientProvider = ({ children, persistOptions, onSuccess, onError, ...props }) => {
	const [isRestoring, setIsRestoring] = import_react.useState(true);
	const refs = import_react.useRef({
		persistOptions,
		onSuccess,
		onError
	});
	const didRestore = import_react.useRef(false);
	import_react.useEffect(() => {
		refs.current = {
			persistOptions,
			onSuccess,
			onError
		};
	});
	import_react.useEffect(() => {
		const options = {
			...refs.current.persistOptions,
			queryClient: props.client
		};
		if (!didRestore.current) {
			didRestore.current = true;
			persistQueryClientRestore(options).then(() => refs.current.onSuccess?.()).catch(() => refs.current.onError?.()).finally(() => {
				setIsRestoring(false);
			});
		}
		return isRestoring ? void 0 : persistQueryClientSubscribe(options);
	}, [props.client, isRestoring]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IsRestoringProvider, {
			value: isRestoring,
			children
		})
	});
};
//#endregion
export { PersistQueryClientProvider as t };
