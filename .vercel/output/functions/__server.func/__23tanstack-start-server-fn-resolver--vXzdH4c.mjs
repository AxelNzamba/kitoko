//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver--vXzdH4c.js
var manifest = {
	"154b8633eea94111b40f7036631572cb49e5f458d27dce468c3338ae0c0dc0db": {
		functionName: "deleteProduct_createServerFn_handler",
		importer: () => import("./_ssr/products.functions-D8s_eodA.mjs")
	},
	"3b4a3c54812b4c0b1ed31ec62bbf2a64c77b8c36025f31e942058a97a061226e": {
		functionName: "upsertProduct_createServerFn_handler",
		importer: () => import("./_ssr/products.functions-D8s_eodA.mjs")
	},
	"51ad93d03c52987e0e52d0164e41771f8765a8919d8a537367eaf795dff9b9d8": {
		functionName: "listProducts_createServerFn_handler",
		importer: () => import("./_ssr/products.functions-D8s_eodA.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
