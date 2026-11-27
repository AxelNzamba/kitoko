import { r as __exportAll } from "../_runtime.mjs";
import { Aa as setSegmentSpanCaptureStrategy, At as _INTERNAL_addFeatureFlagToActiveSpan, Ba as isStreamedBeforeSendSpanCallback, Bo as getCurrentScope, Bt as applyAggregateErrorsToEvent, Ca as startSpanManual, Cs as wrapMethod, Da as handleCallbackErrors, Do as setHttpStatus, Ds as isPrimitive, En as captureException, Eo as getSpanStatusFromHttpCode, Es as isPlainObject, Et as SpanBuffer, Fa as createEnvelope, Fs as CONSOLE_LEVELS, Ft as addConsoleInstrumentationFilter, Go as withScope, Gt as getTraceData, Ho as getIsolationScope, Hs as DEBUG_BUILD, Io as SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, It as addConsoleInstrumentationHandler, Jn as resolvedSyncPromise, Jt as getHttpSpanDetailsFromUrlObject, Ko as getAsyncContextStrategy, La as forEachEnvelopeItem, Ls as debug$1, Lt as eventFromMessage, Ms as getFramesFromEvent, Mt as _INTERNAL_insertFlagToScope, No as SEMANTIC_ATTRIBUTE_SENTRY_OP, Ns as normalizeStackTracePath, Oa as hasSpanStreamingEnabled, Os as isThenable, Po as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, Pt as severityLevelFromString, Qt as parseUrl, Ro as SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS, Rt as eventFromUnknownInput, Sa as startSpan, Sn as safeUnref, Ss as markFunctionWrapped, Ta as withActiveSpan, Ts as isObjectLike, Tt as getBreadcrumbLogLevelFromHttpStatusCode, Vs as GLOBAL_OBJ, Wo as withIsolationScope, Wt as addBreadcrumb, Xn as safeSetSpanJSONAttributes, Xt as isURLObjectRelative, Yn as captureSpan, Yo as getDefaultIsolationScope, Yt as getSanitizedUrlString, Za as getActiveSpan, Zt as parseStringToURLObject, _a as continueTrace, _s as safeDateNow, an as defaultPiiToCollectionOptions, ba as startInactiveSpan, bs as fill, cs as safeJoin, dn as makePromiseBuffer, ds as stringify, en as stripUrlQueryAndFragment, es as generateSpanId, fs as truncate, gn as _getTraceInfoFromScope, gs as setSkipNormalizationHint, hs as setNormalizationDepthOverrideHint, in as Client, io as spanToJSON, is as addExceptionMechanism, jt as _INTERNAL_copyFlagsFromScopeToEvent, ka as getSegmentSpanCaptureStrategy, mo as dsnToString, nn as filterKeyValueData, on as FILTERED_VALUE, os as uuid4, pn as _INTERNAL_captureLog, po as dsnFromString, ps as normalize, qa as hasSpansEnabled, sn as SENSITIVE_COOKIE_NAME_SNIPPETS, tn as parseCookie, to as spanIsSampled, ts as generateTraceId, us as stringMatchesSomePattern, vn as defineIntegration, vo as mergeBaggageHeaders, vs as safeMathRandom, ws as isError, xn as getEnvelopeEndpointWithUrlEncodedAuth, xs as getOriginalFunction, zo as getClient, zs as getMainCarrier, zt as exceptionFromError } from "./@sentry/browser+[...].mjs";
//#region node_modules/@sentry/core/build/esm/utils/debounce.js
function debounce(func, wait, options) {
	let callbackReturnValue;
	let timerId;
	let maxTimerId;
	const maxWait = options?.maxWait ? Math.max(options.maxWait, wait) : 0;
	const setTimeoutImpl = options?.setTimeoutImpl || setTimeout;
	function invokeFunc() {
		cancelTimers();
		callbackReturnValue = func();
		return callbackReturnValue;
	}
	function cancelTimers() {
		timerId !== void 0 && clearTimeout(timerId);
		maxTimerId !== void 0 && clearTimeout(maxTimerId);
		timerId = maxTimerId = void 0;
	}
	function flush() {
		if (timerId !== void 0 || maxTimerId !== void 0) return invokeFunc();
		return callbackReturnValue;
	}
	function debounced() {
		if (timerId) clearTimeout(timerId);
		timerId = setTimeoutImpl(invokeFunc, wait);
		if (maxWait && maxTimerId === void 0) maxTimerId = setTimeoutImpl(invokeFunc, maxWait);
		return callbackReturnValue;
	}
	debounced.cancel = cancelTimers;
	debounced.flush = flush;
	return debounced;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/deferSegmentSpanCapture.js
var CAPTURED_SPANS = /* @__PURE__ */ new WeakSet();
var isSpanAlreadyCaptured = (span) => CAPTURED_SPANS.has(span);
var markSpanCaptured = (span) => {
	CAPTURED_SPANS.add(span);
};
var CLIENT_QUEUES = /* @__PURE__ */ new WeakMap();
function _INTERNAL_setDeferSegmentSpanCapture(client) {
	if (!getSegmentSpanCaptureStrategy()) setSegmentSpanCaptureStrategy(deferredSegmentSpanCaptureStrategy);
	if (CLIENT_QUEUES.has(client)) return;
	const pendingCaptures = /* @__PURE__ */ new Set();
	const debouncedDrain = debounce(() => {
		const captures = [...pendingCaptures];
		pendingCaptures.clear();
		for (const capture of captures) capture();
	}, 1, { maxWait: 100 });
	client.on("flush", () => {
		debouncedDrain.flush();
	});
	CLIENT_QUEUES.set(client, (capture) => {
		pendingCaptures.add(capture);
		debouncedDrain();
	});
}
var deferredSegmentSpanCaptureStrategy = {
	onSegmentSpanEnded(convert, scope) {
		const client = scope.getClient();
		const enqueue = client && CLIENT_QUEUES.get(client);
		if (!enqueue) {
			const transactionEvent = convert();
			if (transactionEvent) client?.captureEvent(transactionEvent);
			return;
		}
		enqueue(() => {
			const transactionEvent = convert({
				isSpanAlreadyCaptured,
				onSpanCaptured: markSpanCaptured
			});
			if (transactionEvent) client.captureEvent(transactionEvent);
		});
	},
	onChildSpanEnded(span, rootSpan, convert, scope) {
		if (CAPTURED_SPANS.has(span) || !CAPTURED_SPANS.has(rootSpan)) return;
		const client = scope.getClient();
		const enqueue = client && CLIENT_QUEUES.get(client);
		const captureOrphan = () => {
			const transactionEvent = convert({
				isSpanAlreadyCaptured,
				onSpanCaptured: markSpanCaptured
			});
			if (transactionEvent?.contexts?.trace?.data) transactionEvent.contexts.trace.data["sentry.parent_span_already_sent"] = true;
			if (transactionEvent) client?.captureEvent(transactionEvent);
		};
		if (enqueue) enqueue(captureOrphan);
		else captureOrphan();
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/bindScopeToEmitter.js
var ADD_LISTENER_METHODS = [
	"addListener",
	"on",
	"once",
	"prependListener",
	"prependOnceListener",
	"addEventListener"
];
var REMOVE_LISTENER_METHODS = [
	"removeListener",
	"off",
	"removeEventListener"
];
var SCOPE_BOUND_LISTENERS = /* @__PURE__ */ Symbol("SentryScopeBoundListeners");
var registeringWrapper;
function isReentrantWrapperRegistration(listener) {
	return registeringWrapper !== void 0 && (listener === registeringWrapper || listener.listener === registeringWrapper);
}
function bindScopeToEmitter(emitter, scope = getCurrentScope()) {
	const ee = emitter;
	if (getPatchMap(ee)) return emitter;
	createPatchMap(ee);
	for (const methodName of ADD_LISTENER_METHODS) {
		if (typeof ee[methodName] !== "function") continue;
		ee[methodName] = patchAddListener(ee, ee[methodName], scope);
	}
	for (const methodName of REMOVE_LISTENER_METHODS) {
		if (typeof ee[methodName] !== "function") continue;
		ee[methodName] = patchRemoveListener(ee, ee[methodName]);
	}
	if (typeof ee.removeAllListeners === "function") ee.removeAllListeners = patchRemoveAllListeners(ee, ee.removeAllListeners);
	return emitter;
}
function bindListenerToScope(listener, scope) {
	return function(...args) {
		return withScope(scope, () => listener.apply(this, args));
	};
}
function isBoundListener(listener) {
	return typeof listener === "function";
}
function patchAddListener(ee, original, scope) {
	return function(...args) {
		const event = args[0];
		const listener = args[1];
		const rest = args.slice(2);
		if (!isBoundListener(listener) || isReentrantWrapperRegistration(listener)) return original.apply(this, args);
		const map = getPatchMap(ee) || createPatchMap(ee);
		let listeners = map.get(event);
		if (!listeners) {
			listeners = /* @__PURE__ */ new WeakMap();
			map.set(event, listeners);
		}
		let boundListener = listeners.get(listener);
		if (!boundListener) {
			boundListener = bindListenerToScope(listener, scope);
			listeners.set(listener, boundListener);
		}
		const previous = registeringWrapper;
		registeringWrapper = boundListener;
		try {
			return original.call(this, event, boundListener, ...rest);
		} finally {
			registeringWrapper = previous;
		}
	};
}
function patchRemoveListener(ee, original) {
	return function(...args) {
		const event = args[0];
		const listener = args[1];
		const rest = args.slice(2);
		const boundListener = isBoundListener(listener) ? getPatchMap(ee)?.get(event)?.get(listener) : void 0;
		if (!boundListener) return original.apply(this, args);
		return original.call(this, event, boundListener, ...rest);
	};
}
function patchRemoveAllListeners(ee, original) {
	return function(...args) {
		const map = getPatchMap(ee);
		if (map) if (args.length === 0) createPatchMap(ee);
		else {
			const event = args[0];
			map.delete(event);
		}
		return original.apply(this, args);
	};
}
function createPatchMap(ee) {
	const map = /* @__PURE__ */ new Map();
	ee[SCOPE_BOUND_LISTENERS] = map;
	return map;
}
function getPatchMap(ee) {
	return ee[SCOPE_BOUND_LISTENERS];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/asyncContext/tracing-channel-binding.js
function waitForTracingChannelBinding(callback, retries = 1) {
	if (getAsyncContextStrategy(getMainCarrier()).getTracingChannelBinding?.()) {
		callback();
		return;
	}
	if (!retries) return;
	safeUnref(setTimeout(() => {
		waitForTracingChannelBinding(callback, retries - 1);
	}, 1));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/transports/multiplexed.js
var MULTIPLEXED_TRANSPORT_EXTRA_KEY = "MULTIPLEXED_TRANSPORT_EXTRA_KEY";
function eventFromEnvelope(env, types) {
	let event;
	forEachEnvelopeItem(env, (item, type) => {
		if (types.includes(type)) event = Array.isArray(item) ? item[1] : void 0;
		return !!event;
	});
	return event;
}
function makeOverrideReleaseTransport(createTransport, release) {
	return (options) => {
		const transport = createTransport(options);
		return {
			...transport,
			send: async (envelope) => {
				const event = eventFromEnvelope(envelope, [
					"event",
					"transaction",
					"profile",
					"replay_event"
				]);
				if (event) event.release = release;
				return transport.send(envelope);
			}
		};
	};
}
function overrideDsn(envelope, dsn) {
	return createEnvelope(dsn ? {
		...envelope[0],
		dsn
	} : envelope[0], envelope[1]);
}
function makeMultiplexedTransport(createTransport, matcher) {
	return (options) => {
		const fallbackTransport = createTransport(options);
		const otherTransports = /* @__PURE__ */ new Map();
		const actualMatcher = matcher || ((args) => {
			const event = args.getEvent();
			if (event?.extra?.["MULTIPLEXED_TRANSPORT_EXTRA_KEY"] && Array.isArray(event.extra["MULTIPLEXED_TRANSPORT_EXTRA_KEY"])) return event.extra["MULTIPLEXED_TRANSPORT_EXTRA_KEY"];
			return [];
		});
		function getTransport(dsn, release) {
			const key = release ? `${dsn}:${release}` : dsn;
			let transport = otherTransports.get(key);
			if (!transport) {
				const validatedDsn = dsnFromString(dsn);
				if (!validatedDsn) return;
				const url = getEnvelopeEndpointWithUrlEncodedAuth(validatedDsn, options.tunnel);
				transport = release ? makeOverrideReleaseTransport(createTransport, release)({
					...options,
					url
				}) : createTransport({
					...options,
					url
				});
				otherTransports.set(key, transport);
			}
			return [dsn, transport];
		}
		async function send(envelope) {
			function getEvent(types) {
				return eventFromEnvelope(envelope, types?.length ? types : ["event"]);
			}
			const transports = actualMatcher({
				envelope,
				getEvent
			}).map((result) => {
				if (typeof result === "string") return getTransport(result, void 0);
				else return getTransport(result.dsn, result.release);
			}).filter((t) => !!t);
			const transportsWithFallback = transports.length ? transports : [["", fallbackTransport]];
			return (await Promise.all(transportsWithFallback.map(([dsn, transport]) => transport.send(overrideDsn(envelope, dsn)))))[0];
		}
		async function flush(timeout) {
			const allTransports = [...otherTransports.values(), fallbackTransport];
			return (await Promise.all(allTransports.map((transport) => transport.flush(timeout)))).every((r) => r);
		}
		return {
			send,
			flush
		};
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/ai/providerSkip.js
var SKIPPED_AI_PROVIDERS = /* @__PURE__ */ new Set();
function _INTERNAL_skipAiProviderWrapping(modules) {
	modules.forEach((module) => {
		SKIPPED_AI_PROVIDERS.add(module);
		DEBUG_BUILD && debug$1.log(`AI provider "${module}" wrapping will be skipped`);
	});
}
function _INTERNAL_shouldSkipAiProviderWrapping(module) {
	return SKIPPED_AI_PROVIDERS.has(module);
}
function _INTERNAL_clearAiProviderSkips() {
	SKIPPED_AI_PROVIDERS.clear();
	DEBUG_BUILD && debug$1.log("Cleared AI provider skip registrations");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/envToBool.js
var FALSY_ENV_VALUES = /* @__PURE__ */ new Set([
	"false",
	"f",
	"n",
	"no",
	"off",
	"0"
]);
var TRUTHY_ENV_VALUES = /* @__PURE__ */ new Set([
	"true",
	"t",
	"y",
	"yes",
	"on",
	"1"
]);
function envToBool(value, options) {
	const normalized = String(value).toLowerCase();
	if (FALSY_ENV_VALUES.has(normalized)) return false;
	if (TRUTHY_ENV_VALUES.has(normalized)) return true;
	return options?.strict ? null : Boolean(value);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/checkin.js
function createCheckInEnvelope(checkIn, dynamicSamplingContext, metadata, tunnel, dsn) {
	const headers = { sent_at: new Date(safeDateNow()).toISOString() };
	if (metadata?.sdk) headers.sdk = {
		name: metadata.sdk.name,
		version: metadata.sdk.version
	};
	if (!!tunnel && !!dsn) headers.dsn = dsnToString(dsn);
	if (dynamicSamplingContext) headers.trace = dynamicSamplingContext;
	return createEnvelope(headers, [createCheckInEnvelopeItem(checkIn)]);
}
function createCheckInEnvelopeItem(checkIn) {
	return [{ type: "check_in" }, checkIn];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/parameterize.js
function parameterize(strings, ...values) {
	const formatted = new String(String.raw(strings, ...values));
	formatted.__sentry_template_string__ = strings.join("\0").replace(/%/g, "%%").replace(/\0/g, "%s");
	formatted.__sentry_template_values__ = values;
	return formatted;
}
var fmt = parameterize;
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/tracePropagationTargets.js
var NOT_PROPAGATED_MESSAGE = "[Tracing] Not injecting trace data for url because it does not match tracePropagationTargets:";
function shouldPropagateTraceForUrl(url, tracePropagationTargets, decisionMap) {
	if (typeof url !== "string" || !tracePropagationTargets) return true;
	const cachedDecision = decisionMap?.get(url);
	if (cachedDecision !== void 0) {
		DEBUG_BUILD && !cachedDecision && debug$1.log(NOT_PROPAGATED_MESSAGE, url);
		return cachedDecision;
	}
	const decision = stringMatchesSomePattern(url, tracePropagationTargets);
	decisionMap?.set(url, decision);
	DEBUG_BUILD && !decision && debug$1.log(NOT_PROPAGATED_MESSAGE, url);
	return decision;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/meta.js
function getTraceMetaTags(traceData) {
	return Object.entries(traceData || getTraceData()).map(([key, value]) => `<meta name="${key}" content="${value}"/>`).join("");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/array.js
function uniq(input) {
	return Array.from(new Set(input));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/request.js
var MAX_BODY_BYTE_LENGTH = 1024 * 1024;
function getMaxBodyByteLength(maxRequestBodySize) {
	if (maxRequestBodySize === "small") return 1e3;
	if (maxRequestBodySize === "medium") return 1e4;
	return MAX_BODY_BYTE_LENGTH;
}
function winterCGHeadersToDict(winterCGHeaders) {
	const headers = {};
	try {
		winterCGHeaders.forEach((value, key) => {
			if (typeof value === "string") headers[key] = value;
		});
	} catch {}
	return headers;
}
function headersToDict(reqHeaders) {
	const headers = /* @__PURE__ */ Object.create(null);
	try {
		Object.entries(reqHeaders).forEach(([key, value]) => {
			if (typeof value === "string") headers[key] = value;
			else if (typeof value === "number") headers[key] = String(value);
		});
	} catch {}
	return headers;
}
function httpRequestToRequestData(request) {
	const headers = request.headers || {};
	const host = (typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0) || (typeof headers.host === "string" ? headers.host : void 0);
	const protocol = (typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0) || request.protocol || (request.socket?.encrypted ? "https" : "http");
	const url = request.url || "";
	const absoluteUrl = getAbsoluteUrl({
		url,
		host,
		protocol
	});
	const data = request.body || void 0;
	const cookies = request.cookies;
	return {
		url: absoluteUrl,
		method: request.method,
		query_string: extractQueryParamsFromUrl(url),
		headers: headersToDict(headers),
		cookies,
		data
	};
}
function getAbsoluteUrl({ url, protocol, host }) {
	if (url?.startsWith("http")) return url;
	if (url && host) return `${protocol}://${host}${url}`;
}
function httpHeadersToSpanAttributes(headers, dataCollection = false, lifecycle = "request") {
	const resolvedDataCollection = typeof dataCollection === "boolean" ? defaultPiiToCollectionOptions(dataCollection) : dataCollection;
	const headerBehavior = lifecycle === "request" ? resolvedDataCollection.httpHeaders.request : resolvedDataCollection.httpHeaders.response;
	const cookieBehavior = resolvedDataCollection.cookies;
	const prefix = `http.${lifecycle}.header.`;
	const spanAttributes = {};
	try {
		const regularHeaders = {};
		for (const [key, value] of Object.entries(headers)) {
			if (value == null) continue;
			const lowerKey = key.toLowerCase();
			if (lowerKey === "cookie" || lowerKey === "set-cookie") {
				if (cookieBehavior === false) continue;
				if (typeof value === "string" && value !== "") {
					const filtered = filterKeyValueData(parseCookieHeader(value, lowerKey === "set-cookie"), cookieBehavior, SENSITIVE_COOKIE_NAME_SNIPPETS);
					for (const [cookieKey, cookieValue] of Object.entries(filtered)) spanAttributes[`${prefix}${normalizeAttributeKey(lowerKey)}.${normalizeAttributeKey(cookieKey)}`] = cookieValue;
				} else spanAttributes[`${prefix}${normalizeAttributeKey(lowerKey)}`] = FILTERED_VALUE;
			} else {
				if (headerBehavior === false) continue;
				if (Array.isArray(value)) regularHeaders[lowerKey] = value.map((v) => v != null ? String(v) : v).join(";");
				else if (typeof value === "string") regularHeaders[lowerKey] = value;
			}
		}
		if (headerBehavior !== false) {
			const filtered = filterKeyValueData(regularHeaders, headerBehavior);
			for (const [headerKey, headerValue] of Object.entries(filtered)) spanAttributes[`${prefix}${normalizeAttributeKey(headerKey)}`] = headerValue;
		}
	} catch {}
	return spanAttributes;
}
function normalizeAttributeKey(key) {
	return key.replace(/-/g, "_");
}
function parseCookieHeader(value, isSetCookie) {
	const semicolonIndex = value.indexOf(";");
	const cookieString = isSetCookie && semicolonIndex !== -1 ? value.substring(0, semicolonIndex) : value;
	const cookies = isSetCookie ? [cookieString] : cookieString.split("; ");
	const result = {};
	for (const cookie of cookies) {
		const equalSignIndex = cookie.indexOf("=");
		const cookieKey = (equalSignIndex !== -1 ? cookie.substring(0, equalSignIndex) : cookie).toLowerCase();
		result[cookieKey] = equalSignIndex !== -1 ? cookie.substring(equalSignIndex + 1) : "";
	}
	return result;
}
function extractQueryParamsFromUrl(url) {
	if (!url) return;
	try {
		const queryParams = new URL(url, "http://s.io").search.slice(1);
		return queryParams.length ? queryParams : void 0;
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/spanKind.js
var SPAN_KIND = {
	INTERNAL: 0,
	SERVER: 1,
	CLIENT: 2,
	PRODUCER: 3,
	CONSUMER: 4
};
var SPAN_KIND_NAME = {
	[SPAN_KIND.INTERNAL]: "INTERNAL",
	[SPAN_KIND.SERVER]: "SERVER",
	[SPAN_KIND.CLIENT]: "CLIENT",
	[SPAN_KIND.PRODUCER]: "PRODUCER",
	[SPAN_KIND.CONSUMER]: "CONSUMER"
};
function spanKindToName(kind) {
	return SPAN_KIND_NAME[kind];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/linkederrors.js
var DEFAULT_KEY = "cause";
var DEFAULT_LIMIT$1 = 5;
var INTEGRATION_NAME$9 = "LinkedErrors";
var _linkedErrorsIntegration = ((options = {}) => {
	const limit = options.limit || DEFAULT_LIMIT$1;
	const key = options.key || DEFAULT_KEY;
	return {
		name: INTEGRATION_NAME$9,
		preprocessEvent(event, hint, client) {
			applyAggregateErrorsToEvent(exceptionFromError, client.getOptions().stackParser, key, limit, event, hint);
		}
	};
});
var linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/metadata.js
var filenameMetadataMap = /* @__PURE__ */ new Map();
var parsedStacks = /* @__PURE__ */ new Set();
function ensureMetadataStacksAreParsed(parser) {
	if (!GLOBAL_OBJ._sentryModuleMetadata) return;
	for (const stack of Object.keys(GLOBAL_OBJ._sentryModuleMetadata)) {
		const metadata = GLOBAL_OBJ._sentryModuleMetadata[stack];
		if (parsedStacks.has(stack)) continue;
		parsedStacks.add(stack);
		const frames = parser(stack);
		for (const frame of frames.reverse()) if (frame.filename) {
			filenameMetadataMap.set(frame.filename, metadata);
			break;
		}
	}
}
function getMetadataForUrl(parser, filename) {
	ensureMetadataStacksAreParsed(parser);
	return filenameMetadataMap.get(filename);
}
function addMetadataToStackFrames(parser, event) {
	event.exception?.values?.forEach((exception) => {
		exception.stacktrace?.frames?.forEach((frame) => {
			if (!frame.filename || frame.module_metadata) return;
			const metadata = getMetadataForUrl(parser, frame.filename);
			if (metadata) frame.module_metadata = metadata;
		});
	});
}
function stripMetadataFromStackFrames(event) {
	event.exception?.values?.forEach((exception) => {
		exception.stacktrace?.frames?.forEach((frame) => {
			delete frame.module_metadata;
		});
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/moduleMetadata.js
var moduleMetadataIntegration = defineIntegration(() => {
	return {
		name: "ModuleMetadata",
		setup(client) {
			client.on("beforeEnvelope", (envelope) => {
				forEachEnvelopeItem(envelope, (item, type) => {
					if (type === "event") {
						const event = Array.isArray(item) ? item[1] : void 0;
						if (event) {
							stripMetadataFromStackFrames(event);
							item[1] = event;
						}
					}
				});
			});
			client.on("applyFrameMetadata", (event) => {
				if (event.type) return;
				const stackParser = client.getOptions().stackParser;
				addMetadataToStackFrames(stackParser, event);
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/core/build/esm/vendor/getIpAddress.js
var ipHeaderNames = [
	"X-Client-IP",
	"X-Forwarded-For",
	"Fly-Client-IP",
	"CF-Connecting-IP",
	"Fastly-Client-Ip",
	"True-Client-Ip",
	"X-Real-IP",
	"X-Cluster-Client-IP",
	"X-Forwarded",
	"Forwarded-For",
	"Forwarded",
	"X-Vercel-Forwarded-For"
];
function getClientIPAddress(headers) {
	const lowerCaseHeaders = {};
	for (const key of Object.keys(headers)) lowerCaseHeaders[key.toLowerCase()] = headers[key];
	return ipHeaderNames.map((headerName) => {
		const rawValue = lowerCaseHeaders[headerName.toLowerCase()];
		const value = Array.isArray(rawValue) ? rawValue.join(";") : rawValue;
		if (headerName === "Forwarded") return parseForwardedHeader(value);
		return value?.split(",").map((v) => v.trim());
	}).reduce((acc, val) => {
		if (!val) return acc;
		return acc.concat(val);
	}, []).find((ip) => ip !== null && isIP(ip)) || null;
}
function parseForwardedHeader(value) {
	if (!value) return null;
	for (const part of value.split(";")) if (part.startsWith("for=")) return part.slice(4);
	return null;
}
function isIP(str) {
	return /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/.test(str);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/requestdata.js
var INTEGRATION_NAME$8 = "RequestData";
var _requestDataIntegration = ((options = {}) => {
	function resolveIncludeAndDataCollection(client) {
		const dc = client.getDataCollectionOptions();
		const dataCollection = {
			...dc,
			...options.include?.cookies === true && dc.cookies === false && { cookies: true },
			...options.include?.headers === true && dc.httpHeaders.request === false && { httpHeaders: {
				...dc.httpHeaders,
				request: true
			} }
		};
		return {
			dataCollection,
			include: {
				cookies: dataCollection.cookies !== false,
				data: true,
				headers: dataCollection.httpHeaders.request !== false,
				ip: dataCollection.userInfo,
				query_string: dataCollection.urlQueryParams !== false,
				url: true,
				...options.include
			}
		};
	}
	return {
		name: INTEGRATION_NAME$8,
		processEvent(event, _hint, client) {
			const { sdkProcessingMetadata = {} } = event;
			const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
			const { include } = resolveIncludeAndDataCollection(client);
			if (normalizedRequest) addNormalizedRequestDataToEvent(event, normalizedRequest, { ipAddress }, include);
			return event;
		},
		processSegmentSpan(span, client) {
			const { sdkProcessingMetadata = {} } = getIsolationScope().getScopeData();
			const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
			if (!normalizedRequest) return;
			const { include, dataCollection } = resolveIncludeAndDataCollection(client);
			addNormalizedRequestDataToSpan(span, normalizedRequest, ipAddress, include, dataCollection);
		}
	};
});
var requestDataIntegration = defineIntegration(_requestDataIntegration);
function addNormalizedRequestDataToEvent(event, req, additionalData, include) {
	event.request = {
		...event.request,
		...extractNormalizedRequestData(req, include)
	};
	if (include.ip) {
		const ip = req.headers && getClientIPAddress(req.headers) || additionalData.ipAddress;
		if (ip) event.user = {
			...event.user,
			ip_address: ip
		};
	}
}
function addNormalizedRequestDataToSpan(span, normalizedRequest, ipAddress, include, dataCollection) {
	const requestData = extractNormalizedRequestData(normalizedRequest, include);
	const attributes = {};
	if (requestData.url) attributes["url.full"] = requestData.url;
	if (requestData.method) attributes["http.request.method"] = requestData.method;
	if (requestData.query_string) attributes["url.query"] = normalizeQueryString(requestData.query_string);
	safeSetSpanJSONAttributes(span, attributes);
	if (requestData.cookies && Object.keys(requestData.cookies).length > 0) safeSetSpanJSONAttributes(span, httpHeadersToSpanAttributes({ cookie: Object.entries(requestData.cookies).map(([name, value]) => `${name}=${value}`).join("; ") }, dataCollection, "request"));
	if (requestData.headers) safeSetSpanJSONAttributes(span, httpHeadersToSpanAttributes(requestData.headers, dataCollection, "request"));
	if (requestData.data != null) {
		const serialized = typeof requestData.data === "string" ? requestData.data : JSON.stringify(requestData.data);
		if (serialized) safeSetSpanJSONAttributes(span, { "http.request.body.data": serialized });
	}
	if (include.ip) {
		const ip = normalizedRequest.headers && getClientIPAddress(normalizedRequest.headers) || ipAddress || void 0;
		if (ip) safeSetSpanJSONAttributes(span, { [SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS]: ip });
	}
}
function extractNormalizedRequestData(normalizedRequest, include) {
	const requestData = {};
	const headers = { ...normalizedRequest.headers };
	if (include.headers) {
		requestData.headers = headers;
		if (!include.cookies) delete headers.cookie;
		if (!include.ip) {
			const ipHeaderNamesLower = new Set(ipHeaderNames.map((name) => name.toLowerCase()));
			for (const key of Object.keys(headers)) if (ipHeaderNamesLower.has(key.toLowerCase())) delete headers[key];
		}
	}
	requestData.method = normalizedRequest.method;
	if (include.url) requestData.url = normalizedRequest.url;
	if (include.cookies) requestData.cookies = normalizedRequest.cookies || (headers?.cookie ? parseCookie(headers.cookie) : void 0) || {};
	if (include.query_string) requestData.query_string = normalizedRequest.query_string;
	if (include.data) requestData.data = normalizedRequest.data;
	return requestData;
}
function normalizeQueryString(queryString) {
	if (typeof queryString === "string") return queryString || void 0;
	return (Array.isArray(queryString) ? queryString : Object.entries(queryString)).map(([key, value]) => `${key}=${value}`).join("&") || void 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/captureconsole.js
var INTEGRATION_NAME$7 = "CaptureConsole";
var _captureConsoleIntegration = ((options = {}) => {
	const levels = options.levels || CONSOLE_LEVELS;
	const handled = options.handled ?? true;
	return {
		name: INTEGRATION_NAME$7,
		setup(client) {
			if (!("console" in GLOBAL_OBJ)) return;
			addConsoleInstrumentationHandler(({ args, level }) => {
				if (getClient() !== client || !levels.includes(level)) return;
				consoleHandler(args, level, handled);
			});
		}
	};
});
var captureConsoleIntegration = defineIntegration(_captureConsoleIntegration);
function consoleHandler(args, level, handled) {
	const severityLevel = severityLevelFromString(level);
	const syntheticException = /* @__PURE__ */ new Error();
	const captureContext = {
		level: severityLevelFromString(level),
		extra: { arguments: args }
	};
	withScope((scope) => {
		scope.addEventProcessor((event) => {
			event.logger = "console";
			addExceptionMechanism(event, {
				handled,
				type: "auto.core.capture_console"
			});
			return event;
		});
		if (level === "assert") {
			if (!args[0]) {
				const message2 = `Assertion failed: ${safeJoin(args.slice(1), " ") || "console.assert"}`;
				scope.setExtra("arguments", args.slice(1));
				scope.captureMessage(message2, severityLevel, {
					captureContext,
					syntheticException
				});
			}
			return;
		}
		const error = args.find((arg) => arg instanceof Error);
		if (error) {
			captureException(error, captureContext);
			return;
		}
		const message = safeJoin(args, " ");
		scope.captureMessage(message, severityLevel, {
			captureContext,
			syntheticException
		});
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/extraerrordata.js
var INTEGRATION_NAME$6 = "ExtraErrorData";
var _extraErrorDataIntegration = ((options = {}) => {
	const { depth = 3, captureErrorCause = true } = options;
	return {
		name: INTEGRATION_NAME$6,
		processEvent(event, hint, client) {
			const { maxValueLength } = client.getOptions();
			return _enhanceEventWithErrorData(event, hint, depth, captureErrorCause, maxValueLength);
		}
	};
});
var extraErrorDataIntegration = defineIntegration(_extraErrorDataIntegration);
function _enhanceEventWithErrorData(event, hint = {}, depth, captureErrorCause, maxValueLength) {
	if (!hint.originalException || !isError(hint.originalException)) return event;
	const exceptionName = hint.originalException.name || hint.originalException.constructor.name;
	const errorData = _extractErrorData(hint.originalException, captureErrorCause, maxValueLength);
	if (errorData) {
		const contexts = { ...event.contexts };
		const normalizedErrorData = normalize(errorData, depth);
		if (isPlainObject(normalizedErrorData)) {
			setSkipNormalizationHint(normalizedErrorData);
			contexts[exceptionName] = normalizedErrorData;
		}
		return {
			...event,
			contexts
		};
	}
	return event;
}
function _extractErrorData(error, captureErrorCause, maxValueLength) {
	try {
		const nativeKeys = [
			"name",
			"message",
			"stack",
			"line",
			"column",
			"fileName",
			"lineNumber",
			"columnNumber",
			"toJSON"
		];
		const extraErrorInfo = {};
		for (const key of Object.keys(error)) {
			if (nativeKeys.indexOf(key) !== -1) continue;
			const value = error[key];
			extraErrorInfo[key] = isError(value) || typeof value === "string" ? maxValueLength ? truncate(`${value}`, maxValueLength) : `${value}` : value;
		}
		if (captureErrorCause && error.cause !== void 0) if (isError(error.cause)) extraErrorInfo.cause = { [error.cause.name || error.cause.constructor.name]: _extractErrorData(error.cause, false, maxValueLength) };
		else extraErrorInfo.cause = error.cause;
		if (typeof error.toJSON === "function") {
			const serializedError = error.toJSON();
			for (const key of Object.keys(serializedError)) {
				const value = serializedError[key];
				extraErrorInfo[key] = isError(value) ? value.toString() : value;
			}
		}
		return extraErrorInfo;
	} catch (oO) {
		DEBUG_BUILD && debug$1.error("Unable to extract extra data from the Error object:", oO);
	}
	return null;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/path.js
function normalizeArray(parts, allowAboveRoot) {
	let up = 0;
	for (let i = parts.length - 1; i >= 0; i--) {
		const last = parts[i];
		if (last === ".") parts.splice(i, 1);
		else if (last === "..") {
			parts.splice(i, 1);
			up++;
		} else if (up) {
			parts.splice(i, 1);
			up--;
		}
	}
	if (allowAboveRoot) for (; up--;) parts.unshift("..");
	return parts;
}
var splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
function splitPath(filename) {
	const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
	const parts = splitPathRe.exec(truncated);
	return parts ? parts.slice(1) : [];
}
function resolve(...args) {
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		const path = i >= 0 ? args[i] : "/";
		if (!path) continue;
		resolvedPath = `${path}/${resolvedPath}`;
		resolvedAbsolute = path.charAt(0) === "/";
	}
	resolvedPath = normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
	return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}
function trim(arr) {
	let start = 0;
	for (; start < arr.length; start++) if (arr[start] !== "") break;
	let end = arr.length - 1;
	for (; end >= 0; end--) if (arr[end] !== "") break;
	if (start > end) return [];
	return arr.slice(start, end - start + 1);
}
function relative(from, to) {
	from = resolve(from).slice(1);
	to = resolve(to).slice(1);
	const fromParts = trim(from.split("/"));
	const toParts = trim(to.split("/"));
	const length = Math.min(fromParts.length, toParts.length);
	let samePartsLength = length;
	for (let i = 0; i < length; i++) if (fromParts[i] !== toParts[i]) {
		samePartsLength = i;
		break;
	}
	let outputParts = [];
	for (let i = samePartsLength; i < fromParts.length; i++) outputParts.push("..");
	outputParts = outputParts.concat(toParts.slice(samePartsLength));
	return outputParts.join("/");
}
function dirname(path) {
	const result = splitPath(path);
	const root = result[0] || "";
	let dir = result[1];
	if (!root && !dir) return ".";
	if (dir) dir = dir.slice(0, dir.length - 1);
	return root + dir;
}
function basename(path, ext) {
	let f = splitPath(path)[2] || "";
	if (ext && f.slice(ext.length * -1) === ext) f = f.slice(0, f.length - ext.length);
	return f;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/rewriteframes.js
var INTEGRATION_NAME$5 = "RewriteFrames";
var rewriteFramesIntegration = defineIntegration((options = {}) => {
	const root = options.root;
	const prefix = options.prefix || "app:///";
	const isBrowser = "window" in GLOBAL_OBJ && !!GLOBAL_OBJ.window;
	const iteratee = options.iteratee || generateIteratee({
		isBrowser,
		root,
		prefix
	});
	function _processExceptionsEvent(event) {
		try {
			return {
				...event,
				exception: {
					...event.exception,
					values: event.exception.values.map((value) => ({
						...value,
						...value.stacktrace && { stacktrace: _processStacktrace(value.stacktrace) }
					}))
				}
			};
		} catch {
			return event;
		}
	}
	function _processStacktrace(stacktrace) {
		return {
			...stacktrace,
			frames: stacktrace?.frames?.map((f) => iteratee(f))
		};
	}
	return {
		name: INTEGRATION_NAME$5,
		processEvent(originalEvent) {
			let processedEvent = originalEvent;
			if (originalEvent.exception && Array.isArray(originalEvent.exception.values)) processedEvent = _processExceptionsEvent(processedEvent);
			return processedEvent;
		}
	};
});
function generateIteratee({ isBrowser, root, prefix }) {
	return (frame) => {
		if (!frame.filename) return frame;
		const isWindowsFrame = /^[a-zA-Z]:\\/.test(frame.filename) || frame.filename.includes("\\") && !frame.filename.includes("/");
		const startsWithSlash = /^\//.test(frame.filename);
		if (isBrowser) {
			if (root) {
				const oldFilename = frame.filename;
				if (oldFilename.indexOf(root) === 0) frame.filename = oldFilename.replace(root, prefix);
			}
		} else if (isWindowsFrame || startsWithSlash) {
			const filename = isWindowsFrame ? frame.filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/") : frame.filename;
			frame.filename = `${prefix}${root ? relative(root, filename) : basename(filename)}`;
		}
		return frame;
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/supabase.js
var AUTH_OPERATIONS_TO_INSTRUMENT = [
	"reauthenticate",
	"signInAnonymously",
	"signInWithOAuth",
	"signInWithIdToken",
	"signInWithOtp",
	"signInWithPassword",
	"signInWithSSO",
	"signOut",
	"signUp",
	"verifyOtp"
];
var AUTH_ADMIN_OPERATIONS_TO_INSTRUMENT = [
	"createUser",
	"deleteUser",
	"listUsers",
	"getUserById",
	"updateUserById",
	"inviteUserByEmail"
];
var FILTER_MAPPINGS = {
	eq: "eq",
	neq: "neq",
	gt: "gt",
	gte: "gte",
	lt: "lt",
	lte: "lte",
	like: "like",
	"like(all)": "likeAllOf",
	"like(any)": "likeAnyOf",
	ilike: "ilike",
	"ilike(all)": "ilikeAllOf",
	"ilike(any)": "ilikeAnyOf",
	is: "is",
	in: "in",
	cs: "contains",
	cd: "containedBy",
	sr: "rangeGt",
	nxl: "rangeGte",
	sl: "rangeLt",
	nxr: "rangeLte",
	adj: "rangeAdjacent",
	ov: "overlaps",
	fts: "",
	plfts: "plain",
	phfts: "phrase",
	wfts: "websearch",
	not: "not"
};
var DB_OPERATIONS_TO_INSTRUMENT = [
	"select",
	"insert",
	"upsert",
	"update",
	"delete"
];
function markAsInstrumented(fn) {
	try {
		fn.__SENTRY_INSTRUMENTED__ = true;
	} catch {}
}
function isInstrumented(fn) {
	try {
		return fn.__SENTRY_INSTRUMENTED__;
	} catch {
		return false;
	}
}
function getMutationBodyPayloadForTelemetry(rawBody, plainBody) {
	if (Object.keys(plainBody).length > 0) return plainBody;
	if (Array.isArray(rawBody) && rawBody.length > 0) return rawBody;
}
function hasMutationBodyForDescription(rawBody, plainBody) {
	return getMutationBodyPayloadForTelemetry(rawBody, plainBody) !== void 0;
}
function extractOperation(method, headers = {}) {
	switch (method) {
		case "GET": return "select";
		case "POST": if (headers["Prefer"]?.includes("resolution=")) return "upsert";
		else return "insert";
		case "PATCH": return "update";
		case "DELETE": return "delete";
		default: return "<unknown-op>";
	}
}
function translateFiltersIntoMethods(key, query) {
	if (query === "" || query === "*") return "select(*)";
	if (key === "select") return `select(${query})`;
	if (key === "or" || key.endsWith(".or")) return `${key}${query}`;
	const [filter, ...value] = query.split(".");
	let method;
	if (filter?.startsWith("fts")) method = "textSearch";
	else if (filter?.startsWith("plfts")) method = "textSearch[plain]";
	else if (filter?.startsWith("phfts")) method = "textSearch[phrase]";
	else if (filter?.startsWith("wfts")) method = "textSearch[websearch]";
	else method = filter && FILTER_MAPPINGS[filter] || "filter";
	return `${method}(${key}, ${value.join(".")})`;
}
function instrumentAuthOperation(operation, isAdmin = false) {
	return new Proxy(operation, { apply(target, thisArg, argumentsList) {
		return startSpan({
			name: `auth ${isAdmin ? "(admin) " : ""}${operation.name}`,
			attributes: {
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.supabase",
				[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
				"db.system": "postgresql",
				"db.operation": `auth.${isAdmin ? "admin." : ""}${operation.name}`
			}
		}, (span) => {
			return Reflect.apply(target, thisArg, argumentsList).then((res) => {
				if (isObjectLike(res) && "error" in res && res.error) {
					span.setStatus({ code: 2 });
					captureException(res.error, { mechanism: {
						handled: false,
						type: "auto.db.supabase.auth"
					} });
				} else span.setStatus({ code: 1 });
				span.end();
				return res;
			}).catch((err) => {
				span.setStatus({ code: 2 });
				span.end();
				captureException(err, { mechanism: {
					handled: false,
					type: "auto.db.supabase.auth"
				} });
				throw err;
			}).then(...argumentsList);
		});
	} });
}
function instrumentSupabaseAuthClient(supabaseClientInstance) {
	const auth = supabaseClientInstance.auth;
	if (!auth || isInstrumented(supabaseClientInstance.auth)) return;
	for (const operation of AUTH_OPERATIONS_TO_INSTRUMENT) {
		const authOperation = auth[operation];
		if (!authOperation) continue;
		if (typeof supabaseClientInstance.auth[operation] === "function") supabaseClientInstance.auth[operation] = instrumentAuthOperation(authOperation);
	}
	for (const operation of AUTH_ADMIN_OPERATIONS_TO_INSTRUMENT) {
		const authOperation = auth.admin[operation];
		if (!authOperation) continue;
		if (typeof supabaseClientInstance.auth.admin[operation] === "function") supabaseClientInstance.auth.admin[operation] = instrumentAuthOperation(authOperation, true);
	}
	markAsInstrumented(supabaseClientInstance.auth);
}
function instrumentSupabaseClientConstructor(SupabaseClient, _options) {
	if (isInstrumented(SupabaseClient.prototype.from)) return;
	SupabaseClient.prototype.from = new Proxy(SupabaseClient.prototype.from, { apply(target, thisArg, argumentsList) {
		const rv = Reflect.apply(target, thisArg, argumentsList);
		const PostgRESTQueryBuilder = rv.constructor;
		instrumentPostgRESTQueryBuilder(PostgRESTQueryBuilder, _options);
		return rv;
	} });
	markAsInstrumented(SupabaseClient.prototype.from);
}
function instrumentPostgRESTFilterBuilder(PostgRESTFilterBuilder, _options) {
	if (isInstrumented(PostgRESTFilterBuilder.prototype.then)) return;
	PostgRESTFilterBuilder.prototype.then = new Proxy(PostgRESTFilterBuilder.prototype.then, { apply(target, thisArg, argumentsList) {
		const operations = DB_OPERATIONS_TO_INSTRUMENT;
		const typedThis = thisArg;
		const operation = extractOperation(typedThis.method, typedThis.headers);
		if (!operations.includes(operation)) return Reflect.apply(target, thisArg, argumentsList);
		if (!typedThis?.url?.pathname || typeof typedThis.url.pathname !== "string") return Reflect.apply(target, thisArg, argumentsList);
		const pathParts = typedThis.url.pathname.split("/");
		const table = pathParts.length > 0 ? pathParts[pathParts.length - 1] : "";
		const queryItems = [];
		for (const [key, value] of typedThis.url.searchParams.entries()) queryItems.push(translateFiltersIntoMethods(key, value));
		const body = /* @__PURE__ */ Object.create(null);
		if (isPlainObject(typedThis.body)) for (const [key, value] of Object.entries(typedThis.body)) body[key] = value;
		const client = getClient();
		const shouldSendData = _options.sendOperationData ?? client?.getDataCollectionOptions().databaseQueryData === true;
		const bodyPayload = getMutationBodyPayloadForTelemetry(typedThis.body, body);
		const mutationPart = operation === "select" ? "" : `${operation}${hasMutationBodyForDescription(typedThis.body, body) ? "(...) " : ""}`;
		const queryPart = shouldSendData ? queryItems.join(" ") : queryItems.length > 0 ? "[redacted]" : "";
		const descriptionMiddle = [mutationPart.trimEnd(), queryPart].filter(Boolean).join(" ");
		const description = descriptionMiddle ? `${descriptionMiddle} from(${table})` : `from(${table})`;
		const attributes = {
			"db.table": table,
			"db.schema": typedThis.schema,
			"db.url": typedThis.url.origin,
			"db.sdk": typedThis.headers["X-Client-Info"],
			"db.system": "postgresql",
			"db.operation": operation,
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.db.supabase",
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db"
		};
		if (queryItems.length && shouldSendData) attributes["db.query"] = queryItems;
		if (bodyPayload !== void 0 && shouldSendData) attributes["db.body"] = bodyPayload;
		return startSpan({
			name: description,
			attributes
		}, (span) => {
			return Reflect.apply(target, thisArg, []).then((res) => {
				if (span) {
					if (res && typeof res === "object" && "status" in res) setHttpStatus(span, res.status || 500);
					span.end();
				}
				if (res?.error) {
					const err = new Error(res.error.message);
					if (res.error.code) err.code = res.error.code;
					if (res.error.details) err.details = res.error.details;
					const supabaseContext = {};
					if (queryItems.length && shouldSendData) supabaseContext.query = queryItems;
					if (bodyPayload !== void 0 && shouldSendData) supabaseContext.body = bodyPayload;
					captureException(err, (scope) => {
						scope.addEventProcessor((e) => {
							addExceptionMechanism(e, {
								handled: false,
								type: "auto.db.supabase.postgres"
							});
							return e;
						});
						scope.setContext("supabase", supabaseContext);
						return scope;
					});
				}
				const breadcrumb = {
					type: "supabase",
					category: `db.${operation}`,
					message: description
				};
				const data = {};
				if (queryItems.length && shouldSendData) data.query = queryItems;
				if (bodyPayload !== void 0 && shouldSendData) data.body = bodyPayload;
				if (Object.keys(data).length) breadcrumb.data = data;
				addBreadcrumb(breadcrumb);
				return res;
			}, (err) => {
				if (span) {
					setHttpStatus(span, 500);
					span.end();
				}
				throw err;
			}).then(...argumentsList);
		});
	} });
	markAsInstrumented(PostgRESTFilterBuilder.prototype.then);
}
function instrumentPostgRESTQueryBuilder(PostgRESTQueryBuilder, _options) {
	for (const operation of DB_OPERATIONS_TO_INSTRUMENT) {
		if (isInstrumented(PostgRESTQueryBuilder.prototype[operation])) continue;
		PostgRESTQueryBuilder.prototype[operation] = new Proxy(PostgRESTQueryBuilder.prototype[operation], { apply(target, thisArg, argumentsList) {
			const rv = Reflect.apply(target, thisArg, argumentsList);
			const PostgRESTFilterBuilder = rv.constructor;
			DEBUG_BUILD && debug$1.log(`Instrumenting ${operation} operation's PostgRESTFilterBuilder`);
			instrumentPostgRESTFilterBuilder(PostgRESTFilterBuilder, _options);
			return rv;
		} });
		markAsInstrumented(PostgRESTQueryBuilder.prototype[operation]);
	}
}
var instrumentSupabaseClient = (supabaseClient, options = {}) => {
	if (!supabaseClient) {
		DEBUG_BUILD && debug$1.warn("Supabase integration was not installed because no Supabase client was provided.");
		return;
	}
	instrumentSupabaseClientConstructor(supabaseClient.constructor === Function ? supabaseClient : supabaseClient.constructor, options);
	instrumentSupabaseAuthClient(supabaseClient);
};
var INTEGRATION_NAME$4 = "Supabase";
var _supabaseIntegration = ((supabaseClient, options) => {
	return {
		setupOnce() {
			instrumentSupabaseClient(supabaseClient, options);
		},
		name: INTEGRATION_NAME$4
	};
});
var supabaseIntegration = defineIntegration((options) => {
	return _supabaseIntegration(options.supabaseClient, { sendOperationData: options.sendOperationData });
});
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/zoderrors.js
var DEFAULT_LIMIT = 10;
var INTEGRATION_NAME$3 = "ZodErrors";
function originalExceptionIsZodError(originalException) {
	return isError(originalException) && originalException.name === "ZodError" && Array.isArray(originalException.issues);
}
function flattenIssue(issue) {
	return {
		...issue,
		path: "path" in issue && Array.isArray(issue.path) ? issue.path.join(".") : void 0,
		keys: "keys" in issue ? JSON.stringify(issue.keys) : void 0,
		unionErrors: "unionErrors" in issue ? JSON.stringify(issue.unionErrors) : void 0
	};
}
function flattenIssuePath(path) {
	return path.map((p) => {
		if (typeof p === "number") return "<array>";
		else return p;
	}).join(".");
}
function formatIssueMessage(zodError) {
	const errorKeyMap = /* @__PURE__ */ new Set();
	for (const iss of zodError.issues) {
		const issuePath = flattenIssuePath(iss.path);
		if (issuePath.length > 0) errorKeyMap.add(issuePath);
	}
	const errorKeys = Array.from(errorKeyMap);
	if (errorKeys.length === 0) {
		let rootExpectedType = "variable";
		if (zodError.issues.length > 0) {
			const iss = zodError.issues[0];
			if (iss !== void 0 && "expected" in iss && typeof iss.expected === "string") rootExpectedType = iss.expected;
		}
		return `Failed to validate ${rootExpectedType}`;
	}
	return `Failed to validate keys: ${truncate(errorKeys.join(", "), 100)}`;
}
function applyZodErrorsToEvent(limit, saveZodIssuesAsAttachment = false, event, hint) {
	if (!event.exception?.values || !hint.originalException || !originalExceptionIsZodError(hint.originalException) || hint.originalException.issues.length === 0) return event;
	try {
		const flattenedIssues = (saveZodIssuesAsAttachment ? hint.originalException.issues : hint.originalException.issues.slice(0, limit)).map(flattenIssue);
		if (saveZodIssuesAsAttachment) {
			if (!Array.isArray(hint.attachments)) hint.attachments = [];
			hint.attachments.push({
				filename: "zod_issues.json",
				data: JSON.stringify({ issues: flattenedIssues })
			});
		}
		return {
			...event,
			exception: {
				...event.exception,
				values: [{
					...event.exception.values[0],
					value: formatIssueMessage(hint.originalException)
				}, ...event.exception.values.slice(1)]
			},
			extra: {
				...event.extra,
				"zoderror.issues": flattenedIssues.slice(0, limit)
			}
		};
	} catch (e) {
		return {
			...event,
			extra: {
				...event.extra,
				"zoderrors sentry integration parse error": {
					message: "an exception was thrown while processing ZodError within applyZodErrorsToEvent()",
					error: e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : "unknown"
				}
			}
		};
	}
}
var _zodErrorsIntegration = ((options = {}) => {
	const limit = options.limit ?? DEFAULT_LIMIT;
	return {
		name: INTEGRATION_NAME$3,
		processEvent(originalEvent, hint) {
			return applyZodErrorsToEvent(limit, options.saveZodIssuesAsAttachment, originalEvent, hint);
		}
	};
});
var zodErrorsIntegration = defineIntegration(_zodErrorsIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/third-party-errors-filter.js
var thirdPartyErrorFilterIntegration = defineIntegration((options) => {
	return {
		name: "ThirdPartyErrorsFilter",
		setup(client) {
			client.on("beforeEnvelope", (envelope) => {
				forEachEnvelopeItem(envelope, (item, type) => {
					if (type === "event") {
						const event = Array.isArray(item) ? item[1] : void 0;
						if (event) {
							stripMetadataFromStackFrames(event);
							item[1] = event;
						}
					}
				});
			});
			client.on("applyFrameMetadata", (event) => {
				if (event.type) return;
				const stackParser = client.getOptions().stackParser;
				addMetadataToStackFrames(stackParser, event);
			});
		},
		preprocessEvent(event) {
			if (options.ignoreSentryInternalFrames && (GLOBAL_OBJ._sentryWrappedDepth ?? 0) > 0) event.sdkProcessingMetadata = {
				...event.sdkProcessingMetadata,
				insideSentryWrapped: true
			};
		},
		processEvent(event) {
			const insideSentryWrapped = options.ignoreSentryInternalFrames ? event.sdkProcessingMetadata?.insideSentryWrapped === true && event.exception?.values?.length === 1 : false;
			const frameKeys = getBundleKeysForAllFramesWithFilenames(event, options.ignoreSentryInternalFrames, insideSentryWrapped);
			if (frameKeys) {
				if (frameKeys[options.behaviour === "drop-error-if-contains-third-party-frames" || options.behaviour === "apply-tag-if-contains-third-party-frames" ? "some" : "every"]((keys) => !keys.some((key) => options.filterKeys.includes(key)))) if (options.behaviour === "drop-error-if-contains-third-party-frames" || options.behaviour === "drop-error-if-exclusively-contains-third-party-frames") return null;
				else event.tags = {
					...event.tags,
					third_party_code: true
				};
			}
			return event;
		}
	};
});
function isSentryInternalFrame(frame, frameIndex, insideSentryWrapped) {
	if (frameIndex !== 0) return false;
	if (insideSentryWrapped && isLikelyMinifiedSentryWrappedFrame(frame)) return true;
	if (frame.function === "sentryWrapped") return true;
	if (!frame.context_line || !frame.filename) return false;
	if (!frame.filename.includes("sentry") || !frame.filename.includes("helpers") || !frame.context_line.includes(SENTRY_INTERNAL_FN_APPLY)) return false;
	if (frame.pre_context) {
		const len = frame.pre_context.length;
		for (let i = 0; i < len; i++) if (frame.pre_context[i]?.includes(SENTRY_INTERNAL_COMMENT)) return true;
	}
	return false;
}
function getBundleKeysForAllFramesWithFilenames(event, ignoreSentryInternalFrames, insideSentryWrapped) {
	const frames = getFramesFromEvent(event);
	if (!frames) return;
	return frames.filter((frame, index) => {
		if (!frame.filename) return false;
		if (frame.lineno == null && frame.colno == null && frame.instruction_addr == null) return false;
		return !ignoreSentryInternalFrames || !isSentryInternalFrame(frame, index, !!insideSentryWrapped);
	}).map((frame) => {
		if (!frame.module_metadata) return [];
		return Object.keys(frame.module_metadata).filter((key) => key.startsWith(BUNDLER_PLUGIN_APP_KEY_PREFIX)).map((key) => key.slice(BUNDLER_PLUGIN_APP_KEY_PREFIX.length));
	});
}
function isLikelyMinifiedSentryWrappedFrame(frame) {
	return !frame.context_line && !frame.pre_context && !!frame.function && frame.function.length <= 2;
}
var BUNDLER_PLUGIN_APP_KEY_PREFIX = "_sentryBundlerPluginAppKey:";
var SENTRY_INTERNAL_COMMENT = "Attempt to invoke user-land function";
var SENTRY_INTERNAL_FN_APPLY = "fn.apply(this, wrappedArguments)";
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/console.js
var INTEGRATION_NAME$2 = "Console";
var consoleIntegration = defineIntegration((options = {}) => {
	const levels = new Set(options.levels || CONSOLE_LEVELS);
	return {
		name: INTEGRATION_NAME$2,
		setup(client) {
			const unsubscribe = addConsoleInstrumentationHandler(({ args, level }) => {
				if (getClient() !== client || !levels.has(level)) return;
				addConsoleBreadcrumb(level, args);
			});
			client.registerCleanup(unsubscribe);
			if (options.filter) {
				const unsubscribe2 = addConsoleInstrumentationFilter(options.filter);
				client.registerCleanup(unsubscribe2);
			}
		}
	};
});
function addConsoleBreadcrumb(level, args) {
	const breadcrumb = {
		category: "console",
		data: {
			arguments: args,
			logger: "console"
		},
		level: severityLevelFromString(level),
		message: formatConsoleArgs$1(args)
	};
	if (level === "assert") if (args[0] === false) {
		const assertionArgs = args.slice(1);
		breadcrumb.message = assertionArgs.length > 0 ? `Assertion failed: ${formatConsoleArgs$1(assertionArgs)}` : "Assertion failed";
		breadcrumb.data.arguments = assertionArgs;
	} else return;
	addBreadcrumb(breadcrumb, {
		input: args,
		level
	});
}
function formatConsoleArgs$1(values) {
	return "util" in GLOBAL_OBJ && typeof GLOBAL_OBJ.util.format === "function" ? GLOBAL_OBJ.util.format(...values) : safeJoin(values, " ");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/featureFlags/featureFlagsIntegration.js
var featureFlagsIntegration = defineIntegration(() => {
	return {
		name: "FeatureFlags",
		processEvent(event, _hint, _client) {
			return _INTERNAL_copyFlagsFromScopeToEvent(event);
		},
		addFeatureFlag(name, value) {
			_INTERNAL_insertFlagToScope(name, value);
			_INTERNAL_addFeatureFlagToActiveSpan(name, value);
		}
	};
});
//#endregion
//#region node_modules/@sentry/core/build/esm/profiling.js
function isProfilingIntegrationWithProfiler(integration) {
	return !!integration && typeof integration["_profiler"] !== "undefined" && typeof integration["_profiler"]["start"] === "function" && typeof integration["_profiler"]["stop"] === "function";
}
function startProfiler() {
	const client = getClient();
	if (!client) {
		DEBUG_BUILD && debug$1.warn("No Sentry client available, profiling is not started");
		return;
	}
	const integration = client.getIntegrationByName("ProfilingIntegration");
	if (!integration) {
		DEBUG_BUILD && debug$1.warn("ProfilingIntegration is not available");
		return;
	}
	if (!isProfilingIntegrationWithProfiler(integration)) {
		DEBUG_BUILD && debug$1.warn("Profiler is not available on profiling integration.");
		return;
	}
	integration._profiler.start();
}
function stopProfiler() {
	const client = getClient();
	if (!client) {
		DEBUG_BUILD && debug$1.warn("No Sentry client available, profiling is not started");
		return;
	}
	const integration = client.getIntegrationByName("ProfilingIntegration");
	if (!integration) {
		DEBUG_BUILD && debug$1.warn("ProfilingIntegration is not available");
		return;
	}
	if (!isProfilingIntegrationWithProfiler(integration)) {
		DEBUG_BUILD && debug$1.warn("Profiler is not available on profiling integration.");
		return;
	}
	integration._profiler.stop();
}
var profiler = {
	startProfiler,
	stopProfiler
};
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/public-api.js
var public_api_exports = /* @__PURE__ */ __exportAll({
	debug: () => debug,
	error: () => error,
	fatal: () => fatal,
	fmt: () => fmt,
	info: () => info,
	trace: () => trace,
	warn: () => warn
});
function captureLog(level, message, attributes, scope, severityNumber) {
	_INTERNAL_captureLog({
		level,
		message,
		attributes,
		severityNumber
	}, scope);
}
function trace(message, attributes, { scope } = {}) {
	captureLog("trace", message, attributes, scope);
}
function debug(message, attributes, { scope } = {}) {
	captureLog("debug", message, attributes, scope);
}
function info(message, attributes, { scope } = {}) {
	captureLog("info", message, attributes, scope);
}
function warn(message, attributes, { scope } = {}) {
	captureLog("warn", message, attributes, scope);
}
function error(message, attributes, { scope } = {}) {
	captureLog("error", message, attributes, scope);
}
function fatal(message, attributes, { scope } = {}) {
	captureLog("fatal", message, attributes, scope);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/utils.js
function formatConsoleArgs(values, normalizeDepth, normalizeMaxBreadth) {
	return "util" in GLOBAL_OBJ && typeof GLOBAL_OBJ.util.format === "function" ? GLOBAL_OBJ.util.format(...values) : safeJoinConsoleArgs(values, normalizeDepth, normalizeMaxBreadth);
}
function safeJoinConsoleArgs(values, normalizeDepth, normalizeMaxBreadth) {
	return values.map((value) => isPrimitive(value) ? String(value) : JSON.stringify(normalize(value, normalizeDepth, normalizeMaxBreadth))).join(" ");
}
function hasConsoleSubstitutions(str) {
	return /%[sdifocO]/.test(str);
}
function createConsoleTemplateAttributes(firstArg, followingArgs) {
	const attributes = {};
	attributes["sentry.message.template"] = `${firstArg} ${new Array(followingArgs.length).fill("{}").join(" ")}`;
	followingArgs.forEach((arg, index) => {
		attributes[`sentry.message.parameter.${index}`] = arg;
	});
	return attributes;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/console-integration.js
var INTEGRATION_NAME$1 = "ConsoleLogs";
var DEFAULT_ATTRIBUTES = { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.log.console" };
var _consoleLoggingIntegration = ((options = {}) => {
	const levels = options.levels || CONSOLE_LEVELS;
	return {
		name: INTEGRATION_NAME$1,
		setup(client) {
			const { enableLogs, normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = client.getOptions();
			if (!enableLogs) {
				DEBUG_BUILD && debug$1.warn("`enableLogs` is not enabled, ConsoleLogs integration disabled");
				return;
			}
			const unsubscribe = addConsoleInstrumentationHandler(({ args, level }) => {
				if (getClient() !== client || !levels.includes(level)) return;
				const firstArg = args[0];
				const followingArgs = args.slice(1);
				if (level === "assert") {
					if (!firstArg) _INTERNAL_captureLog({
						level: "error",
						message: followingArgs.length > 0 ? `Assertion failed: ${formatConsoleArgs(followingArgs, normalizeDepth, normalizeMaxBreadth)}` : "Assertion failed",
						attributes: DEFAULT_ATTRIBUTES
					});
					return;
				}
				const isLevelLog = level === "log";
				const attributes = { ...DEFAULT_ATTRIBUTES };
				if (isPlainObject(firstArg)) {
					Object.assign(attributes, normalize(firstArg, normalizeDepth, normalizeMaxBreadth));
					const remainingArgsStartIndex = typeof args[1] === "string" ? 2 : 1;
					args.slice(remainingArgsStartIndex).forEach((arg, index) => {
						attributes[`sentry.message.parameter.${index}`] = normalize(arg, normalizeDepth, normalizeMaxBreadth);
					});
				} else if (followingArgs.length > 0 && typeof firstArg === "string" && !hasConsoleSubstitutions(firstArg)) {
					const templateAttrs = createConsoleTemplateAttributes(firstArg, followingArgs);
					for (const [key, value] of Object.entries(templateAttrs)) attributes[key] = key.startsWith("sentry.message.parameter.") ? normalize(value, normalizeDepth, normalizeMaxBreadth) : value;
				}
				_INTERNAL_captureLog({
					level: isLevelLog ? "info" : level,
					message: formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth),
					severityNumber: isLevelLog ? 10 : void 0,
					attributes
				});
			});
			client.registerCleanup(unsubscribe);
		}
	};
});
var consoleLoggingIntegration = defineIntegration(_consoleLoggingIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/consola.js
var DEFAULT_CAPTURED_LEVELS = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"fatal"
];
function createConsolaReporter(options = {}) {
	const levels = new Set(options.levels ?? DEFAULT_CAPTURED_LEVELS);
	const providedClient = options.client;
	return { log(logObj) {
		const { type, level, message: consolaMessage, args, tag, date: _date, ...rest } = logObj;
		const client = providedClient || getClient();
		if (!client) return;
		const logSeverityLevel = getLogSeverityLevel(type, level);
		if (!levels.has(logSeverityLevel)) return;
		const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = client.getOptions();
		const attributes = {};
		for (const [key, value] of Object.entries(rest)) attributes[key] = normalize(value, normalizeDepth, normalizeMaxBreadth);
		attributes["sentry.origin"] = "auto.log.consola";
		if (tag) attributes["consola.tag"] = tag;
		if (type) attributes["consola.type"] = type;
		if (level != null && typeof level === "number") attributes["consola.level"] = level;
		const extractionResult = processExtractedAttributes(defaultExtractAttributes(args, normalizeDepth, normalizeMaxBreadth), normalizeDepth, normalizeMaxBreadth);
		if (extractionResult?.attributes) Object.assign(attributes, extractionResult.attributes);
		_INTERNAL_captureLog({
			level: logSeverityLevel,
			message: extractionResult?.message || consolaMessage || args && formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth) || "",
			attributes
		});
	} };
}
var CONSOLA_TYPE_TO_LOG_SEVERITY_LEVEL_MAP = {
	silent: "trace",
	fatal: "fatal",
	error: "error",
	warn: "warn",
	log: "info",
	info: "info",
	success: "info",
	fail: "error",
	ready: "info",
	start: "info",
	box: "info",
	debug: "debug",
	trace: "trace",
	verbose: "debug",
	critical: "fatal",
	notice: "info"
};
var CONSOLA_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP = {
	0: "fatal",
	1: "warn",
	2: "info",
	3: "info",
	4: "debug",
	5: "trace"
};
function getLogSeverityLevel(type, level) {
	if (type === "verbose") return "debug";
	if (type === "silent") return "trace";
	if (type) {
		const mappedLevel = CONSOLA_TYPE_TO_LOG_SEVERITY_LEVEL_MAP[type];
		if (mappedLevel) return mappedLevel;
	}
	if (typeof level === "number") {
		const mappedLevel = CONSOLA_LEVEL_TO_LOG_SEVERITY_LEVEL_MAP[level];
		if (mappedLevel) return mappedLevel;
	}
	return "info";
}
function defaultExtractAttributes(args, normalizeDepth, normalizeMaxBreadth) {
	if (!args?.length) return { message: "" };
	const message = formatConsoleArgs(args, normalizeDepth, normalizeMaxBreadth);
	const firstArg = args[0];
	if (isPlainObject(firstArg)) {
		const remainingArgsStartIndex = typeof args[1] === "string" ? 2 : 1;
		return {
			message,
			attributes: firstArg,
			messageParameters: args.slice(remainingArgsStartIndex)
		};
	} else {
		const followingArgs = args.slice(1);
		const shouldAddTemplateAttr = followingArgs.length > 0 && typeof firstArg === "string" && !hasConsoleSubstitutions(firstArg);
		return {
			message,
			messageTemplate: shouldAddTemplateAttr ? firstArg : void 0,
			messageParameters: shouldAddTemplateAttr ? followingArgs : void 0
		};
	}
}
function processExtractedAttributes(extractionResult, normalizeDepth, normalizeMaxBreadth) {
	const { message, attributes, messageTemplate, messageParameters } = extractionResult;
	const messageParamAttributes = {};
	if (messageTemplate && messageParameters) {
		const templateAttrs = createConsoleTemplateAttributes(messageTemplate, messageParameters);
		for (const [key, value] of Object.entries(templateAttrs)) messageParamAttributes[key] = key.startsWith("sentry.message.parameter.") ? normalize(value, normalizeDepth, normalizeMaxBreadth) : value;
	} else if (messageParameters && messageParameters.length > 0) messageParameters.forEach((arg, index) => {
		messageParamAttributes[`sentry.message.parameter.${index}`] = normalize(arg, normalizeDepth, normalizeMaxBreadth);
	});
	return {
		message,
		attributes: {
			...normalize(attributes, normalizeDepth, normalizeMaxBreadth),
			...messageParamAttributes
		}
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/ai/gen-ai-attributes.js
var GEN_AI_PROMPT_ATTRIBUTE = "gen_ai.prompt";
var GEN_AI_SYSTEM_ATTRIBUTE = "gen_ai.system";
var GEN_AI_REQUEST_MODEL_ATTRIBUTE = "gen_ai.request.model";
var GEN_AI_REQUEST_STREAM_ATTRIBUTE = "gen_ai.request.stream";
var GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE = "gen_ai.request.temperature";
var GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE = "gen_ai.request.max_tokens";
var GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE = "gen_ai.request.frequency_penalty";
var GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE = "gen_ai.request.presence_penalty";
var GEN_AI_REQUEST_TOP_P_ATTRIBUTE = "gen_ai.request.top_p";
var GEN_AI_REQUEST_TOP_K_ATTRIBUTE = "gen_ai.request.top_k";
var GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE = "gen_ai.request.encoding_format";
var GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE = "gen_ai.request.dimensions";
var GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE = "gen_ai.response.finish_reasons";
var GEN_AI_RESPONSE_MODEL_ATTRIBUTE = "gen_ai.response.model";
var GEN_AI_RESPONSE_ID_ATTRIBUTE = "gen_ai.response.id";
var GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE = "gen_ai.response.stop_reason";
var GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.input_tokens";
var GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.output_tokens";
var GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE = "gen_ai.usage.total_tokens";
var GEN_AI_OPERATION_NAME_ATTRIBUTE = "gen_ai.operation.name";
var GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE = "sentry.sdk_meta.gen_ai.input.messages.original_length";
var GEN_AI_INPUT_MESSAGES_ATTRIBUTE = "gen_ai.input.messages";
var GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE = "gen_ai.output.messages";
var GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE = "gen_ai.system_instructions";
var GEN_AI_RESPONSE_TEXT_ATTRIBUTE = "gen_ai.response.text";
var GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE = "gen_ai.request.available_tools";
var GEN_AI_RESPONSE_STREAMING_ATTRIBUTE = "gen_ai.response.streaming";
var GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "gen_ai.response.tool_calls";
var GEN_AI_AGENT_NAME_ATTRIBUTE = "gen_ai.agent.name";
var GEN_AI_PIPELINE_NAME_ATTRIBUTE = "gen_ai.pipeline.name";
var GEN_AI_CONVERSATION_ID_ATTRIBUTE = "gen_ai.conversation.id";
var GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_creation_input_tokens";
var GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_read_input_tokens";
var GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE = "gen_ai.usage.input_tokens.cache_write";
var GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE = "gen_ai.usage.input_tokens.cached";
var GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE = "gen_ai.invoke_agent";
var GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE = "gen_ai.embeddings.input";
var GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE = "gen_ai.embeddings";
var GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE = "gen_ai.execute_tool";
var GEN_AI_TOOL_NAME_ATTRIBUTE = "gen_ai.tool.name";
var GEN_AI_TOOL_CALL_ID_ATTRIBUTE = "gen_ai.tool.call.id";
var GEN_AI_TOOL_TYPE_ATTRIBUTE = "gen_ai.tool.type";
var GEN_AI_TOOL_INPUT_ATTRIBUTE = "gen_ai.tool.input";
var GEN_AI_TOOL_OUTPUT_ATTRIBUTE = "gen_ai.tool.output";
var GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE = "gen_ai.tool.description";
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/ai/mediaStripping.js
function isContentMedia(part) {
	if (!part || typeof part !== "object") return false;
	return isContentMediaSource(part) || hasInlineData(part) || hasImageUrl(part) || hasInputAudio(part) || hasFileData(part) || hasMediaTypeData(part) || hasVercelFileData(part) || hasVercelImageData(part) || hasBlobOrBase64Type(part) || hasB64Json(part) || hasImageGenerationResult(part) || hasDataUri(part);
}
function hasImageUrl(part) {
	if (!("image_url" in part)) return false;
	if (typeof part.image_url === "string") return part.image_url.startsWith("data:");
	return hasNestedImageUrl(part);
}
function hasNestedImageUrl(part) {
	return "image_url" in part && !!part.image_url && typeof part.image_url === "object" && "url" in part.image_url && typeof part.image_url.url === "string" && part.image_url.url.startsWith("data:");
}
function isContentMediaSource(part) {
	return "type" in part && typeof part.type === "string" && "source" in part && isContentMedia(part.source);
}
function hasInlineData(part) {
	return "inlineData" in part && !!part.inlineData && typeof part.inlineData === "object" && "data" in part.inlineData && typeof part.inlineData.data === "string";
}
function hasInputAudio(part) {
	return "type" in part && part.type === "input_audio" && "input_audio" in part && !!part.input_audio && typeof part.input_audio === "object" && "data" in part.input_audio && typeof part.input_audio.data === "string";
}
function hasFileData(part) {
	return "type" in part && part.type === "file" && "file" in part && !!part.file && typeof part.file === "object" && "file_data" in part.file && typeof part.file.file_data === "string";
}
function hasMediaTypeData(part) {
	return "media_type" in part && typeof part.media_type === "string" && "data" in part;
}
function hasVercelFileData(part) {
	return "type" in part && part.type === "file" && "mediaType" in part && typeof part.mediaType === "string" && "data" in part && typeof part.data === "string" && !part.data.startsWith("http://") && !part.data.startsWith("https://");
}
function hasVercelImageData(part) {
	return "type" in part && part.type === "image" && "image" in part && typeof part.image === "string" && !part.image.startsWith("http://") && !part.image.startsWith("https://");
}
function hasBlobOrBase64Type(part) {
	return "type" in part && (part.type === "blob" || part.type === "base64");
}
function hasB64Json(part) {
	return "b64_json" in part;
}
function hasImageGenerationResult(part) {
	return "type" in part && "result" in part && part.type === "image_generation";
}
function hasDataUri(part) {
	return "uri" in part && typeof part.uri === "string" && part.uri.startsWith("data:");
}
var REMOVED_STRING = "[Blob substitute]";
var MEDIA_FIELDS = [
	"image_url",
	"data",
	"content",
	"b64_json",
	"result",
	"uri",
	"image"
];
function stripInlineMediaFromSingleMessage(part) {
	const strip = { ...part };
	if (isContentMedia(strip.source)) strip.source = stripInlineMediaFromSingleMessage(strip.source);
	if (hasInlineData(part)) strip.inlineData = {
		...part.inlineData,
		data: REMOVED_STRING
	};
	if (hasNestedImageUrl(part)) strip.image_url = {
		...part.image_url,
		url: REMOVED_STRING
	};
	if (hasInputAudio(part)) strip.input_audio = {
		...part.input_audio,
		data: REMOVED_STRING
	};
	if (hasFileData(part)) strip.file = {
		...part.file,
		file_data: REMOVED_STRING
	};
	for (const field of MEDIA_FIELDS) if (typeof strip[field] === "string") strip[field] = REMOVED_STRING;
	return strip;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/ai/messageTruncation.js
var DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT = 2e4;
var utf8Bytes = (text) => {
	return new TextEncoder().encode(text).length;
};
var jsonBytes = (value) => {
	return utf8Bytes(JSON.stringify(value));
};
function truncateTextByBytes(text, maxBytes) {
	if (utf8Bytes(text) <= maxBytes) return text;
	let low = 0;
	let high = text.length;
	let bestFit = "";
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const candidate = text.slice(0, mid);
		if (utf8Bytes(candidate) <= maxBytes) {
			bestFit = candidate;
			low = mid + 1;
		} else high = mid - 1;
	}
	return bestFit;
}
function getItemText(item) {
	if (typeof item === "string") return item;
	if ("text" in item && typeof item.text === "string") return item.text;
	return "";
}
function withItemText(item, text) {
	if (typeof item === "string") return text;
	return {
		...item,
		text
	};
}
function isContentMessage(message) {
	return message !== null && typeof message === "object" && "content" in message && typeof message.content === "string";
}
function isContentArrayMessage(message) {
	return message !== null && typeof message === "object" && "content" in message && Array.isArray(message.content);
}
function isPartsMessage(message) {
	return message !== null && typeof message === "object" && "parts" in message && Array.isArray(message.parts) && message.parts.length > 0;
}
function truncateContentMessage(message, maxBytes) {
	const availableForContent = maxBytes - jsonBytes({
		...message,
		content: ""
	});
	if (availableForContent <= 0) return [];
	const truncatedContent = truncateTextByBytes(message.content, availableForContent);
	return [{
		...message,
		content: truncatedContent
	}];
}
function getArrayItems(message) {
	if ("parts" in message && Array.isArray(message.parts)) return {
		key: "parts",
		items: message.parts
	};
	if ("content" in message && Array.isArray(message.content)) return {
		key: "content",
		items: message.content
	};
	return {
		key: null,
		items: []
	};
}
function truncateArrayMessage(message, maxBytes) {
	const { key, items } = getArrayItems(message);
	if (key === null || items.length === 0) return [];
	const emptyItems = items.map((item) => withItemText(item, ""));
	let remainingBytes = maxBytes - jsonBytes({
		...message,
		[key]: emptyItems
	});
	if (remainingBytes <= 0) return [];
	const includedItems = [];
	for (const item of items) {
		const text = getItemText(item);
		const textSize = utf8Bytes(text);
		if (textSize <= remainingBytes) {
			includedItems.push(item);
			remainingBytes -= textSize;
		} else if (includedItems.length === 0) {
			const truncated = truncateTextByBytes(text, remainingBytes);
			if (truncated) includedItems.push(withItemText(item, truncated));
			break;
		} else break;
	}
	if (includedItems.length <= 0) return [];
	else return [{
		...message,
		[key]: includedItems
	}];
}
function truncateSingleMessage(message, maxBytes) {
	if (!message) return [];
	if (typeof message === "string") {
		const truncated = truncateTextByBytes(message, maxBytes);
		return truncated ? [truncated] : [];
	}
	if (typeof message !== "object") return [];
	if (isContentMessage(message)) return truncateContentMessage(message, maxBytes);
	if (isContentArrayMessage(message) || isPartsMessage(message)) return truncateArrayMessage(message, maxBytes);
	return [];
}
function stripInlineMediaFromMessages(messages) {
	return messages.map((message) => {
		let newMessage = void 0;
		if (!!message && typeof message === "object") {
			if (isContentArrayMessage(message)) newMessage = {
				...message,
				content: stripInlineMediaFromMessages(message.content)
			};
			else if ("content" in message && isContentMedia(message.content)) newMessage = {
				...message,
				content: stripInlineMediaFromSingleMessage(message.content)
			};
			if (isPartsMessage(message)) newMessage = {
				...newMessage ?? message,
				parts: stripInlineMediaFromMessages(message.parts)
			};
			if (isContentMedia(newMessage)) newMessage = stripInlineMediaFromSingleMessage(newMessage);
			else if (isContentMedia(message)) newMessage = stripInlineMediaFromSingleMessage(message);
		}
		return newMessage ?? message;
	});
}
function truncateMessagesByBytes(messages, maxBytes) {
	if (!Array.isArray(messages) || messages.length === 0) return messages;
	const effectiveMaxBytes = maxBytes - 2;
	const lastMessage = messages[messages.length - 1];
	const stripped = stripInlineMediaFromMessages([lastMessage]);
	const strippedMessage = stripped[0];
	if (jsonBytes(strippedMessage) <= effectiveMaxBytes) return stripped;
	return truncateSingleMessage(strippedMessage, effectiveMaxBytes);
}
function truncateGenAiMessages(messages) {
	return truncateMessagesByBytes(messages, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
}
function truncateGenAiStringInput(input) {
	return truncateTextByBytes(input, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/ai/utils.js
function resolveAIRecordingOptions(options) {
	const genAI = getClient()?.getDataCollectionOptions().genAI;
	return {
		...options,
		recordInputs: options?.recordInputs ?? genAI?.inputs ?? false,
		recordOutputs: options?.recordOutputs ?? genAI?.outputs ?? false
	};
}
function shouldEnableTruncation(enableTruncation) {
	if (enableTruncation !== void 0) return enableTruncation;
	const client = getClient();
	if (!client) return true;
	return !hasSpanStreamingEnabled(client) && client.getOptions().streamGenAiSpans === false;
}
function buildMethodPath(currentPath, prop) {
	return currentPath ? `${currentPath}.${prop}` : prop;
}
function setTokenUsageAttributes(span, promptTokens, completionTokens, cachedInputTokens, cachedOutputTokens) {
	if (promptTokens !== void 0) span.setAttributes({ [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: promptTokens });
	if (completionTokens !== void 0) span.setAttributes({ [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: completionTokens });
	if (promptTokens !== void 0 || completionTokens !== void 0 || cachedInputTokens !== void 0 || cachedOutputTokens !== void 0) {
		const totalTokens = (promptTokens ?? 0) + (completionTokens ?? 0) + (cachedInputTokens ?? 0) + (cachedOutputTokens ?? 0);
		span.setAttributes({ [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: totalTokens });
	}
}
function endStreamSpan(span, state, recordOutputs) {
	if (!span.isRecording()) return;
	const attrs = { [GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true };
	if (state.responseId) attrs[GEN_AI_RESPONSE_ID_ATTRIBUTE] = state.responseId;
	if (state.responseModel) attrs[GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = state.responseModel;
	if (state.promptTokens !== void 0) attrs[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = state.promptTokens;
	if (state.completionTokens !== void 0) attrs[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = state.completionTokens;
	if (state.totalTokens !== void 0) attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = state.totalTokens;
	else if (state.promptTokens !== void 0 || state.completionTokens !== void 0 || state.cacheCreationInputTokens !== void 0 || state.cacheReadInputTokens !== void 0) attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = (state.promptTokens ?? 0) + (state.completionTokens ?? 0) + (state.cacheCreationInputTokens ?? 0) + (state.cacheReadInputTokens ?? 0);
	if (state.finishReasons.length) attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(state.finishReasons);
	if (recordOutputs && state.responseTexts.length) attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = state.responseTexts.join("");
	if (recordOutputs && state.toolCalls.length) attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(state.toolCalls);
	span.setAttributes(attrs);
	span.end();
}
function getTruncatedJsonString(value) {
	if (typeof value === "string") return truncateGenAiStringInput(value);
	try {
		return JSON.stringify(Array.isArray(value) ? truncateGenAiMessages(value) : value);
	} catch {
		return "[unserializable]";
	}
}
function extractSystemInstructions(messages) {
	if (!Array.isArray(messages)) return {
		systemInstructions: void 0,
		filteredMessages: messages
	};
	const systemMessageIndex = messages.findIndex((msg) => msg && typeof msg === "object" && "role" in msg && msg.role === "system");
	if (systemMessageIndex === -1) return {
		systemInstructions: void 0,
		filteredMessages: messages
	};
	const systemMessage = messages[systemMessageIndex];
	const systemContent = typeof systemMessage.content === "string" ? systemMessage.content : systemMessage.content !== void 0 ? JSON.stringify(systemMessage.content) : void 0;
	if (!systemContent) return {
		systemInstructions: void 0,
		filteredMessages: messages
	};
	return {
		systemInstructions: JSON.stringify([{
			type: "text",
			content: systemContent
		}]),
		filteredMessages: [...messages.slice(0, systemMessageIndex), ...messages.slice(systemMessageIndex + 1)]
	};
}
async function createWithResponseWrapper(originalWithResponse, instrumentedPromise, mechanismType) {
	const safeOriginalWithResponse = originalWithResponse.catch((error) => {
		captureException(error, { mechanism: {
			handled: false,
			type: mechanismType
		} });
		throw error;
	});
	const instrumentedResult = await instrumentedPromise;
	const originalWrapper = await safeOriginalWithResponse;
	if (originalWrapper && typeof originalWrapper === "object" && "data" in originalWrapper) return {
		...originalWrapper,
		data: instrumentedResult
	};
	return instrumentedResult;
}
function wrapPromiseWithMethods(originalPromiseLike, instrumentedPromise, mechanismType) {
	if (!isThenable(originalPromiseLike)) return instrumentedPromise;
	return new Proxy(originalPromiseLike, { get(target, prop) {
		const source = prop in Promise.prototype || prop === Symbol.toStringTag ? instrumentedPromise : target;
		const value = Reflect.get(source, prop);
		if (prop === "withResponse" && typeof value === "function") return function wrappedWithResponse() {
			return createWithResponseWrapper(value.call(target), instrumentedPromise, mechanismType);
		};
		return typeof value === "function" ? value.bind(source) : value;
	} });
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/vercel-ai/constants.js
var toolCallSpanContextMap = /* @__PURE__ */ new Map();
var toolDescriptionMap = /* @__PURE__ */ new Map();
var SPAN_TO_OPERATION_NAME = /* @__PURE__ */ new Map([
	["ai.generateText", "invoke_agent"],
	["ai.streamText", "invoke_agent"],
	["ai.generateObject", "invoke_agent"],
	["ai.streamObject", "invoke_agent"],
	["ai.generateText.doGenerate", "generate_content"],
	["ai.streamText.doStream", "generate_content"],
	["ai.generateObject.doGenerate", "generate_content"],
	["ai.streamObject.doStream", "generate_content"],
	["ai.embed.doEmbed", "embeddings"],
	["ai.embedMany.doEmbed", "embeddings"],
	["ai.rerank.doRerank", "rerank"],
	["ai.toolCall", "execute_tool"]
]);
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/vercel-ai/vercel-ai-attributes.js
var OPERATION_NAME_ATTRIBUTE = "operation.name";
var AI_OPERATION_ID_ATTRIBUTE = "ai.operationId";
var AI_PROMPT_ATTRIBUTE = "ai.prompt";
var AI_SCHEMA_ATTRIBUTE = "ai.schema";
var AI_RESPONSE_OBJECT_ATTRIBUTE = "ai.response.object";
var AI_VALUES_ATTRIBUTE = "ai.values";
var AI_RESPONSE_TEXT_ATTRIBUTE = "ai.response.text";
var AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "ai.response.toolCalls";
var AI_RESPONSE_FINISH_REASON_ATTRIBUTE = "ai.response.finishReason";
var AI_PROMPT_MESSAGES_ATTRIBUTE = "ai.prompt.messages";
var AI_PROMPT_TOOLS_ATTRIBUTE = "ai.prompt.tools";
var AI_MODEL_ID_ATTRIBUTE = "ai.model.id";
var AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE = "ai.response.providerMetadata";
var AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE = "ai.usage.cachedInputTokens";
var AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE = "ai.telemetry.functionId";
var AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "ai.usage.completionTokens";
var AI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "ai.usage.promptTokens";
var AI_USAGE_TOKENS_ATTRIBUTE = "ai.usage.tokens";
var AI_TOOL_CALL_NAME_ATTRIBUTE = "ai.toolCall.name";
var AI_TOOL_CALL_ID_ATTRIBUTE = "ai.toolCall.id";
var AI_TOOL_CALL_ARGS_ATTRIBUTE = "ai.toolCall.args";
var AI_TOOL_CALL_RESULT_ATTRIBUTE = "ai.toolCall.result";
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/vercel-ai/utils.js
function accumulateTokensForParent(span, tokenAccumulator) {
	const parentSpanId = span.parent_span_id;
	if (!parentSpanId) return;
	const inputTokens = span.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
	const outputTokens = span.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE];
	if (typeof inputTokens === "number" || typeof outputTokens === "number") {
		const existing = tokenAccumulator.get(parentSpanId) || {
			inputTokens: 0,
			outputTokens: 0
		};
		if (typeof inputTokens === "number") existing.inputTokens += inputTokens;
		if (typeof outputTokens === "number") existing.outputTokens += outputTokens;
		tokenAccumulator.set(parentSpanId, existing);
	}
}
function applyAccumulatedTokens(spanOrTrace, tokenAccumulator) {
	const accumulated = tokenAccumulator.get(spanOrTrace.span_id);
	if (!accumulated || !spanOrTrace.data) return;
	if (accumulated.inputTokens > 0) spanOrTrace.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = accumulated.inputTokens;
	if (accumulated.outputTokens > 0) spanOrTrace.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = accumulated.outputTokens;
	if (accumulated.inputTokens > 0 || accumulated.outputTokens > 0) spanOrTrace.data["gen_ai.usage.total_tokens"] = accumulated.inputTokens + accumulated.outputTokens;
}
function buildToolDescriptionMap(spans) {
	const toolDescriptions = /* @__PURE__ */ new Map();
	for (const span of spans) {
		const availableTools = span.data[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE];
		if (typeof availableTools !== "string") continue;
		try {
			const tools = JSON.parse(availableTools);
			for (const tool of tools) if (tool.name && tool.description && !toolDescriptions.has(tool.name)) toolDescriptions.set(tool.name, tool.description);
		} catch {}
	}
	return toolDescriptions;
}
function applyToolDescriptionsAndTokens(spans, tokenAccumulator) {
	const toolDescriptions = buildToolDescriptionMap(spans);
	for (const span of spans) {
		if (span.op === "gen_ai.execute_tool") {
			const toolName = span.data[GEN_AI_TOOL_NAME_ATTRIBUTE];
			if (typeof toolName === "string") {
				const description = toolDescriptions.get(toolName);
				if (description) span.data[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = description;
			}
		}
		if (span.op === "gen_ai.invoke_agent") applyAccumulatedTokens(span, tokenAccumulator);
	}
}
function _INTERNAL_getSpanContextForToolCallId(toolCallId) {
	return toolCallSpanContextMap.get(toolCallId);
}
function _INTERNAL_cleanupToolCallSpanContext(toolCallId) {
	toolCallSpanContextMap.delete(toolCallId);
}
function convertAvailableToolsToJsonString(tools) {
	const toolObjects = tools.map((tool) => {
		if (typeof tool === "string") try {
			return JSON.parse(tool);
		} catch {
			return tool;
		}
		return tool;
	});
	return JSON.stringify(toolObjects);
}
function filterMessagesArray(input) {
	return input.filter((m) => !!m && typeof m === "object" && "role" in m && "content" in m);
}
function convertUserInputToMessagesFormat(userInput) {
	try {
		const p = JSON.parse(userInput);
		if (!!p && typeof p === "object") {
			let { messages } = p;
			const { prompt, system } = p;
			const result = [];
			if (typeof system === "string") result.push({
				role: "system",
				content: system
			});
			if (typeof messages === "string") try {
				messages = JSON.parse(messages);
			} catch {}
			if (Array.isArray(messages)) {
				result.push(...filterMessagesArray(messages));
				return result;
			}
			if (Array.isArray(prompt)) {
				result.push(...filterMessagesArray(prompt));
				return result;
			}
			if (typeof prompt === "string") result.push({
				role: "user",
				content: prompt
			});
			if (result.length > 0) return result;
		}
	} catch {}
	return [];
}
function requestMessagesFromPrompt(span, attributes, enableTruncation) {
	if (typeof attributes["ai.prompt"] === "string" && !attributes["gen_ai.input.messages"] && !attributes["ai.prompt.messages"]) {
		const userInput = attributes[AI_PROMPT_ATTRIBUTE];
		const messages = convertUserInputToMessagesFormat(userInput);
		if (messages.length) {
			const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
			if (systemInstructions) span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
			const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
			const messagesJson = enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages);
			span.setAttributes({
				[AI_PROMPT_ATTRIBUTE]: messagesJson,
				[GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: messagesJson,
				[GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
			});
		}
	} else if (typeof attributes["ai.prompt.messages"] === "string") {
		const originalMessagesJson = attributes[AI_PROMPT_MESSAGES_ATTRIBUTE];
		try {
			const messages = JSON.parse(originalMessagesJson);
			if (Array.isArray(messages)) {
				const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
				if (systemInstructions) span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
				const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
				const messagesJson = !enableTruncation && filteredMessages === messages ? originalMessagesJson : enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages);
				span.setAttributes({
					[AI_PROMPT_MESSAGES_ATTRIBUTE]: messagesJson,
					[GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: messagesJson,
					[GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
				});
			}
		} catch {}
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/vercel-ai/index.js
function onVercelAiSpanStart(span) {
	const { data: attributes, description: name } = spanToJSON(span);
	if (!name) return;
	if (attributes["ai.toolCall.name"] && attributes["ai.toolCall.id"] && name === "ai.toolCall") {
		processToolCallSpan(span, attributes);
		return;
	}
	if (!attributes["ai.operationId"] && !name.startsWith("ai.")) return;
	const integration = getClient()?.getIntegrationByName("VercelAI");
	processGenerateSpan(span, name, attributes, shouldEnableTruncation(integration?.options?.enableTruncation));
}
function vercelAiEventProcessor(event) {
	if (event.type === "transaction" && event.spans) {
		const tokenAccumulator = /* @__PURE__ */ new Map();
		for (const span of event.spans) {
			processEndedVercelAiSpan(span);
			accumulateTokensForParent(span, tokenAccumulator);
		}
		applyToolDescriptionsAndTokens(event.spans, tokenAccumulator);
		const trace = event.contexts?.trace;
		if (trace?.op === "gen_ai.invoke_agent") applyAccumulatedTokens(trace, tokenAccumulator);
	}
	return event;
}
function normalizeFinishReason(finishReason) {
	if (typeof finishReason !== "string") return "stop";
	switch (finishReason) {
		case "tool-calls": return "tool_call";
		case "stop":
		case "length":
		case "content_filter":
		case "error": return finishReason;
		default: return finishReason;
	}
}
function buildOutputMessages(attributes) {
	const responseText = attributes[AI_RESPONSE_TEXT_ATTRIBUTE];
	const responseToolCalls = attributes[AI_RESPONSE_TOOL_CALLS_ATTRIBUTE];
	const finishReason = attributes[AI_RESPONSE_FINISH_REASON_ATTRIBUTE];
	if (responseText == null && responseToolCalls == null) return;
	const parts = [];
	if (typeof responseText === "string" && responseText.length > 0) parts.push({
		type: "text",
		content: responseText
	});
	if (responseToolCalls != null) try {
		const toolCalls = typeof responseToolCalls === "string" ? JSON.parse(responseToolCalls) : responseToolCalls;
		if (Array.isArray(toolCalls)) {
			for (const toolCall of toolCalls) {
				const args = toolCall.input ?? toolCall.args;
				parts.push({
					type: "tool_call",
					id: toolCall.toolCallId,
					name: toolCall.toolName,
					arguments: typeof args === "string" ? args : JSON.stringify(args ?? {})
				});
			}
			delete attributes[AI_RESPONSE_TOOL_CALLS_ATTRIBUTE];
		}
	} catch {}
	if (parts.length > 0) {
		const outputMessage = {
			role: "assistant",
			parts,
			finish_reason: normalizeFinishReason(finishReason)
		};
		attributes[GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE] = JSON.stringify([outputMessage]);
		delete attributes[AI_RESPONSE_TEXT_ATTRIBUTE];
	}
}
function processVercelAiSpanAttributes(attributes) {
	renameAttributeKey(attributes, AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
	renameAttributeKey(attributes, AI_USAGE_PROMPT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
	renameAttributeKey(attributes, AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE);
	renameAttributeKey(attributes, "ai.usage.inputTokens", GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
	renameAttributeKey(attributes, "ai.usage.outputTokens", GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
	renameAttributeKey(attributes, AI_USAGE_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
	renameAttributeKey(attributes, "ai.response.avgOutputTokensPerSecond", "ai.response.avgCompletionTokensPerSecond");
	if (!Object.keys(attributes).some((key) => key.startsWith("ai.usage.inputTokenDetails.")) && typeof attributes["gen_ai.usage.input_tokens"] === "number" && typeof attributes["gen_ai.usage.input_tokens.cached"] === "number") attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] + attributes[GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE];
	if (typeof attributes["gen_ai.usage.input_tokens"] === "number") attributes[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = (typeof attributes["gen_ai.usage.output_tokens"] === "number" ? attributes[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] : 0) + attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
	if (attributes["ai.prompt.tools"] && Array.isArray(attributes["ai.prompt.tools"])) attributes[AI_PROMPT_TOOLS_ATTRIBUTE] = convertAvailableToolsToJsonString(attributes[AI_PROMPT_TOOLS_ATTRIBUTE]);
	if (attributes["operation.name"]) {
		const rawOperationName = attributes["ai.operationId"] ? attributes[AI_OPERATION_ID_ATTRIBUTE] : attributes[OPERATION_NAME_ATTRIBUTE];
		attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE] = SPAN_TO_OPERATION_NAME.get(rawOperationName) ?? rawOperationName;
		delete attributes[OPERATION_NAME_ATTRIBUTE];
	}
	renameAttributeKey(attributes, AI_PROMPT_MESSAGES_ATTRIBUTE, GEN_AI_INPUT_MESSAGES_ATTRIBUTE);
	buildOutputMessages(attributes);
	renameAttributeKey(attributes, AI_RESPONSE_OBJECT_ATTRIBUTE, "gen_ai.response.object");
	renameAttributeKey(attributes, AI_PROMPT_TOOLS_ATTRIBUTE, "gen_ai.request.available_tools");
	renameAttributeKey(attributes, AI_TOOL_CALL_ARGS_ATTRIBUTE, GEN_AI_TOOL_INPUT_ATTRIBUTE);
	renameAttributeKey(attributes, AI_TOOL_CALL_RESULT_ATTRIBUTE, GEN_AI_TOOL_OUTPUT_ATTRIBUTE);
	renameAttributeKey(attributes, AI_SCHEMA_ATTRIBUTE, "gen_ai.request.schema");
	renameAttributeKey(attributes, AI_MODEL_ID_ATTRIBUTE, GEN_AI_REQUEST_MODEL_ATTRIBUTE);
	if (Array.isArray(attributes["ai.values"])) {
		const parsed = attributes[AI_VALUES_ATTRIBUTE].map((v) => {
			try {
				return JSON.parse(v);
			} catch {
				return v;
			}
		});
		attributes[GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE] = parsed.length === 1 ? parsed[0] : JSON.stringify(parsed);
	}
	addProviderMetadataToAttributes(attributes);
	for (const key of Object.keys(attributes)) {
		if (Array.isArray(attributes[key])) attributes[key] = JSON.stringify(attributes[key]);
		if (key.startsWith("ai.")) renameAttributeKey(attributes, key, `vercel.${key}`);
	}
}
function processEndedVercelAiSpan(span) {
	const { data: attributes, origin } = span;
	if (origin !== "auto.vercelai.otel") return;
	if (span.status && span.status !== "ok") span.status = "internal_error";
	processVercelAiSpanAttributes(attributes);
}
function processVercelAiStreamedSpan(span) {
	const attributes = span.attributes;
	if (attributes?.["sentry.origin"] !== "auto.vercelai.otel") return;
	processVercelAiSpanAttributes(attributes);
	if (attributes["sentry.op"] === "gen_ai.execute_tool" && span.parent_span_id) {
		const descriptions = toolDescriptionMap.get(span.parent_span_id);
		if (descriptions) {
			const toolName = attributes[GEN_AI_TOOL_NAME_ATTRIBUTE];
			if (typeof toolName === "string") {
				const desc = descriptions.get(toolName);
				if (desc) attributes[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = desc;
			}
		}
	}
	toolDescriptionMap.delete(span.span_id);
}
function renameAttributeKey(attributes, oldKey, newKey) {
	if (attributes[oldKey] != null) {
		attributes[newKey] = attributes[oldKey];
		delete attributes[oldKey];
	}
}
function processToolCallSpan(span, attributes) {
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.vercelai.otel");
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.execute_tool");
	span.setAttribute(GEN_AI_OPERATION_NAME_ATTRIBUTE, "execute_tool");
	renameAttributeKey(attributes, AI_TOOL_CALL_NAME_ATTRIBUTE, GEN_AI_TOOL_NAME_ATTRIBUTE);
	renameAttributeKey(attributes, AI_TOOL_CALL_ID_ATTRIBUTE, GEN_AI_TOOL_CALL_ID_ATTRIBUTE);
	const toolCallId = attributes[GEN_AI_TOOL_CALL_ID_ATTRIBUTE];
	if (typeof toolCallId === "string") toolCallSpanContextMap.set(toolCallId, span.spanContext());
	if (!attributes["gen_ai.tool.type"]) span.setAttribute(GEN_AI_TOOL_TYPE_ATTRIBUTE, "function");
	const toolName = attributes[GEN_AI_TOOL_NAME_ATTRIBUTE];
	if (toolName) span.updateName(`execute_tool ${toolName}`);
}
function processGenerateSpan(span, name, attributes, enableTruncation) {
	span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.vercelai.otel");
	const nameWthoutAi = name.replace("ai.", "");
	span.setAttribute("ai.pipeline.name", nameWthoutAi);
	span.updateName(nameWthoutAi);
	const functionId = attributes[AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE];
	if (functionId && typeof functionId === "string") span.setAttribute("gen_ai.function_id", functionId);
	requestMessagesFromPrompt(span, attributes, enableTruncation);
	if (attributes["ai.model.id"] && !attributes["gen_ai.response.model"]) span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, attributes[AI_MODEL_ID_ATTRIBUTE]);
	span.setAttribute("ai.streaming", name.includes("stream"));
	const operationName = SPAN_TO_OPERATION_NAME.get(name);
	if (operationName) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `gen_ai.${operationName}`);
	else if (name.startsWith("ai.stream")) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "ai.run");
	if (operationName === "invoke_agent") {
		if (functionId && typeof functionId === "string") span.updateName(`invoke_agent ${functionId}`);
		else span.updateName("invoke_agent");
		return;
	}
	const modelId = attributes[AI_MODEL_ID_ATTRIBUTE];
	if (modelId && operationName) span.updateName(`${operationName} ${modelId}`);
	const client = getClient();
	if (client && hasSpanStreamingEnabled(client) && attributes["ai.prompt.tools"] && Array.isArray(attributes["ai.prompt.tools"])) {
		const descriptions = /* @__PURE__ */ new Map();
		for (const toolStr of attributes[AI_PROMPT_TOOLS_ATTRIBUTE]) try {
			const parsed = typeof toolStr === "string" ? JSON.parse(toolStr) : toolStr;
			if (parsed?.name && parsed?.description) descriptions.set(parsed.name, parsed.description);
		} catch {}
		if (descriptions.size > 0) {
			const parentSpanId = spanToJSON(span).parent_span_id;
			if (parentSpanId) toolDescriptionMap.set(parentSpanId, descriptions);
		}
	}
}
function addVercelAiProcessors(client) {
	client.on("spanStart", onVercelAiSpanStart);
	client.addEventProcessor(Object.assign(vercelAiEventProcessor, { id: "VercelAiEventProcessor" }));
	client.on("processSpan", (span) => {
		processVercelAiStreamedSpan(span);
	});
}
function getProviderMetadataAttributes(providerMetadata) {
	const attributes = {};
	if (!providerMetadata || typeof providerMetadata !== "object") return attributes;
	const metadata = providerMetadata;
	const openaiMetadata = metadata.openai ?? metadata.azure;
	if (openaiMetadata) {
		setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, openaiMetadata.cachedPromptTokens);
		setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.reasoning", openaiMetadata.reasoningTokens);
		setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.prediction_accepted", openaiMetadata.acceptedPredictionTokens);
		setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.prediction_rejected", openaiMetadata.rejectedPredictionTokens);
		setAttributeIfDefined(attributes, GEN_AI_CONVERSATION_ID_ATTRIBUTE, openaiMetadata.responseId);
	}
	if (metadata.anthropic) {
		setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, metadata.anthropic.usage?.cache_read_input_tokens ?? metadata.anthropic.cacheReadInputTokens);
		setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE, metadata.anthropic.usage?.cache_creation_input_tokens ?? metadata.anthropic.cacheCreationInputTokens);
	}
	if (metadata.bedrock?.usage) {
		setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, metadata.bedrock.usage.cacheReadInputTokens);
		setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE, metadata.bedrock.usage.cacheWriteInputTokens);
	}
	if (metadata.deepseek) {
		setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, metadata.deepseek.promptCacheHitTokens);
		setAttributeIfDefined(attributes, "gen_ai.usage.input_tokens.cache_miss", metadata.deepseek.promptCacheMissTokens);
	}
	return attributes;
}
function addProviderMetadataToAttributes(attributes) {
	const providerMetadata = attributes[AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE];
	if (!providerMetadata) return;
	try {
		const derived = getProviderMetadataAttributes(JSON.parse(providerMetadata));
		for (const [key, value] of Object.entries(derived)) {
			if (key === "gen_ai.conversation.id" && attributes[key]) continue;
			attributes[key] = value;
		}
	} catch {}
}
function setAttributeIfDefined(attributes, key, value) {
	if (value != null) attributes[key] = value;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/openai/constants.js
var OPENAI_INTEGRATION_NAME = "OpenAI";
var OPENAI_METHOD_REGISTRY = {
	"responses.create": { operation: "chat" },
	"chat.completions.create": { operation: "chat" },
	"embeddings.create": { operation: "embeddings" },
	"conversations.create": { operation: "chat" }
};
var RESPONSE_EVENT_TYPES = [
	"response.created",
	"response.in_progress",
	"response.failed",
	"response.completed",
	"response.incomplete",
	"response.queued",
	"response.output_text.delta",
	...[
		"response.output_item.added",
		"response.function_call_arguments.delta",
		"response.function_call_arguments.done",
		"response.output_item.done"
	]
];
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/openai/utils.js
function isResponsesApiStreamEvent(event) {
	return event !== null && typeof event === "object" && "type" in event && typeof event.type === "string" && event.type.startsWith("response.");
}
function isChatCompletionChunk(event) {
	return event !== null && typeof event === "object" && "object" in event && event.object === "chat.completion.chunk";
}
function addResponseAttributes$2(span, result, recordOutputs) {
	if (!result || typeof result !== "object") return;
	const response = result;
	const attrs = {};
	if (typeof response.id === "string") attrs[GEN_AI_RESPONSE_ID_ATTRIBUTE] = response.id;
	if (typeof response.model === "string") attrs[GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = response.model;
	if (response.object === "conversation" && typeof response.id === "string") attrs[GEN_AI_CONVERSATION_ID_ATTRIBUTE] = response.id;
	if (response.usage && typeof response.usage === "object") {
		const usage = response.usage;
		const inputTokens = usage.prompt_tokens ?? usage.input_tokens;
		if (typeof inputTokens === "number") attrs[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = inputTokens;
		const outputTokens = usage.completion_tokens ?? usage.output_tokens;
		if (typeof outputTokens === "number") attrs[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = outputTokens;
		if (typeof usage.total_tokens === "number") attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = usage.total_tokens;
	}
	if (Array.isArray(response.choices)) {
		const choices = response.choices;
		const finishReasons = choices.map((choice) => choice.finish_reason).filter((reason) => typeof reason === "string");
		if (finishReasons.length > 0) attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(finishReasons);
		if (recordOutputs) {
			const responseTexts = choices.map((choice) => {
				return choice.message?.content || "";
			});
			attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = JSON.stringify(responseTexts);
			const toolCalls = choices.map((choice) => {
				return choice.message?.tool_calls;
			}).filter((calls) => Array.isArray(calls) && calls.length > 0).flat();
			if (toolCalls.length > 0) attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(toolCalls);
		}
	}
	if (typeof response.status === "string") {
		if (!attrs["gen_ai.response.finish_reasons"]) attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify([response.status]);
	}
	if (recordOutputs) {
		if (typeof response.output_text === "string" && !attrs["gen_ai.response.text"]) attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = response.output_text;
		if (Array.isArray(response.output) && response.output.length > 0 && !attrs["gen_ai.response.tool_calls"]) {
			const functionCalls = response.output.filter((item) => item?.type === "function_call");
			if (functionCalls.length > 0) attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(functionCalls);
		}
	}
	span.setAttributes(attrs);
}
function extractConversationId(params) {
	if ("conversation" in params && typeof params.conversation === "string") return params.conversation;
	if ("previous_response_id" in params && typeof params.previous_response_id === "string") return params.previous_response_id;
}
function extractRequestParameters(params) {
	const attributes = { [GEN_AI_REQUEST_MODEL_ATTRIBUTE]: params.model ?? "unknown" };
	if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
	if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
	if ("frequency_penalty" in params) attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
	if ("presence_penalty" in params) attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = params.presence_penalty;
	if ("stream" in params) attributes[GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
	if ("encoding_format" in params) attributes[GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = params.encoding_format;
	if ("dimensions" in params) attributes[GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = params.dimensions;
	const conversationId = extractConversationId(params);
	if (conversationId) attributes[GEN_AI_CONVERSATION_ID_ATTRIBUTE] = conversationId;
	return attributes;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/openai/streaming.js
function processChatCompletionToolCalls(toolCalls, state) {
	for (const toolCall of toolCalls) {
		const index = toolCall.index;
		if (index === void 0 || !toolCall.function) continue;
		if (!(index in state.chatCompletionToolCalls)) state.chatCompletionToolCalls[index] = {
			...toolCall,
			function: {
				name: toolCall.function.name,
				arguments: toolCall.function.arguments || ""
			}
		};
		else {
			const existingToolCall = state.chatCompletionToolCalls[index];
			if (toolCall.function.arguments && existingToolCall?.function) existingToolCall.function.arguments += toolCall.function.arguments;
		}
	}
}
function processChatCompletionChunk(chunk, state, recordOutputs) {
	state.responseId = chunk.id ?? state.responseId;
	state.responseModel = chunk.model ?? state.responseModel;
	if (chunk.usage) {
		state.promptTokens = chunk.usage.prompt_tokens;
		state.completionTokens = chunk.usage.completion_tokens;
		state.totalTokens = chunk.usage.total_tokens;
	}
	for (const choice of chunk.choices ?? []) {
		if (recordOutputs) {
			if (choice.delta?.content) state.responseTexts.push(choice.delta.content);
			if (choice.delta?.tool_calls) processChatCompletionToolCalls(choice.delta.tool_calls, state);
		}
		if (choice.finish_reason) state.finishReasons.push(choice.finish_reason);
	}
}
function processResponsesApiEvent(streamEvent, state, recordOutputs, span) {
	if (!(streamEvent && typeof streamEvent === "object")) {
		state.eventTypes.push("unknown:non-object");
		return;
	}
	if (streamEvent instanceof Error) {
		span.setStatus({
			code: 2,
			message: "internal_error"
		});
		captureException(streamEvent, { mechanism: {
			handled: false,
			type: "auto.ai.openai.stream-response"
		} });
		return;
	}
	if (!("type" in streamEvent)) return;
	const event = streamEvent;
	if (!RESPONSE_EVENT_TYPES.includes(event.type)) {
		state.eventTypes.push(event.type);
		return;
	}
	if (recordOutputs) {
		if (event.type === "response.output_item.done" && "item" in event) state.responsesApiToolCalls.push(event.item);
		if (event.type === "response.output_text.delta" && "delta" in event && event.delta) {
			state.responseTexts.push(event.delta);
			return;
		}
	}
	if ("response" in event) {
		const { response } = event;
		state.responseId = response.id ?? state.responseId;
		state.responseModel = response.model ?? state.responseModel;
		if (response.usage) {
			state.promptTokens = response.usage.input_tokens;
			state.completionTokens = response.usage.output_tokens;
			state.totalTokens = response.usage.total_tokens;
		}
		if (response.status) state.finishReasons.push(response.status);
		if (recordOutputs && response.output_text) state.responseTexts.push(response.output_text);
	}
}
async function* instrumentStream$1(stream, span, recordOutputs) {
	const state = {
		eventTypes: [],
		responseTexts: [],
		finishReasons: [],
		responseId: "",
		responseModel: "",
		promptTokens: void 0,
		completionTokens: void 0,
		totalTokens: void 0,
		chatCompletionToolCalls: {},
		responsesApiToolCalls: []
	};
	try {
		for await (const event of stream) {
			if (isChatCompletionChunk(event)) processChatCompletionChunk(event, state, recordOutputs);
			else if (isResponsesApiStreamEvent(event)) processResponsesApiEvent(event, state, recordOutputs, span);
			yield event;
		}
	} finally {
		const allToolCalls = [...Object.values(state.chatCompletionToolCalls), ...state.responsesApiToolCalls];
		endStreamSpan(span, {
			...state,
			toolCalls: allToolCalls
		}, recordOutputs);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/openai/index.js
function extractAvailableTools(params) {
	const tools = Array.isArray(params.tools) ? params.tools : [];
	const webSearchOptions = params.web_search_options && typeof params.web_search_options === "object" ? [{
		type: "web_search_options",
		...params.web_search_options
	}] : [];
	const availableTools = [...tools, ...webSearchOptions];
	if (availableTools.length === 0) return;
	try {
		return JSON.stringify(availableTools);
	} catch (error) {
		DEBUG_BUILD && debug$1.error("Failed to serialize OpenAI tools:", error);
		return;
	}
}
function extractRequestAttributes$2(args, operationName) {
	const attributes = {
		[GEN_AI_SYSTEM_ATTRIBUTE]: "openai",
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.openai"
	};
	if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
		const params = args[0];
		const availableTools = extractAvailableTools(params);
		if (availableTools) attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = availableTools;
		Object.assign(attributes, extractRequestParameters(params));
	} else attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
	return attributes;
}
function addRequestAttributes(span, params, operationName, enableTruncation) {
	if (operationName === "embeddings" && "input" in params) {
		const input = params.input;
		if (input == null) return;
		if (typeof input === "string" && input.length === 0) return;
		if (Array.isArray(input) && input.length === 0) return;
		span.setAttribute(GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE, typeof input === "string" ? input : JSON.stringify(input));
		return;
	}
	const src = "input" in params ? params.input : "messages" in params ? params.messages : void 0;
	if (!src) return;
	if (Array.isArray(src) && src.length === 0) return;
	const { systemInstructions, filteredMessages } = extractSystemInstructions(src);
	if (systemInstructions) span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
	span.setAttribute(GEN_AI_INPUT_MESSAGES_ATTRIBUTE, enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages));
	if (Array.isArray(filteredMessages)) span.setAttribute(GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredMessages.length);
	else span.setAttribute(GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, 1);
}
function instrumentMethod$2(originalMethod, methodPath, instrumentedMethod, context, options) {
	return function instrumentedCall(...args) {
		const operationName = instrumentedMethod.operation || "unknown";
		const requestAttributes = extractRequestAttributes$2(args, operationName);
		const model = requestAttributes["gen_ai.request.model"] || "unknown";
		const params = args[0];
		const isStreamRequested = params && typeof params === "object" && params.stream === true;
		const spanConfig = {
			name: `${operationName} ${model}`,
			op: `gen_ai.${operationName}`,
			attributes: requestAttributes
		};
		if (isStreamRequested) {
			let originalResult2;
			const instrumentedPromise2 = startSpanManual(spanConfig, (span) => {
				originalResult2 = originalMethod.apply(context, args);
				if (options.recordInputs && params) addRequestAttributes(span, params, operationName, shouldEnableTruncation(options.enableTruncation));
				return (async () => {
					try {
						return instrumentStream$1(await originalResult2, span, options.recordOutputs ?? false);
					} catch (error) {
						span.setStatus({
							code: 2,
							message: "internal_error"
						});
						captureException(error, { mechanism: {
							handled: false,
							type: "auto.ai.openai.stream",
							data: { function: methodPath }
						} });
						span.end();
						throw error;
					}
				})();
			});
			return wrapPromiseWithMethods(originalResult2, instrumentedPromise2, "auto.ai.openai");
		}
		let originalResult;
		const instrumentedPromise = startSpan(spanConfig, (span) => {
			originalResult = originalMethod.apply(context, args);
			if (options.recordInputs && params) addRequestAttributes(span, params, operationName, shouldEnableTruncation(options.enableTruncation));
			return originalResult.then((result) => {
				addResponseAttributes$2(span, result, options.recordOutputs);
				return result;
			}, (error) => {
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.openai",
					data: { function: methodPath }
				} });
				throw error;
			});
		});
		return wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.openai");
	};
}
function createDeepProxy$2(target, currentPath = "", options) {
	return new Proxy(target, { get(obj, prop) {
		const value = obj[prop];
		const methodPath = buildMethodPath(currentPath, String(prop));
		const instrumentedMethod = OPENAI_METHOD_REGISTRY[methodPath];
		if (typeof value === "function" && instrumentedMethod) return instrumentMethod$2(value, methodPath, instrumentedMethod, obj, options);
		if (typeof value === "function") return value.bind(obj);
		if (value && typeof value === "object") return createDeepProxy$2(value, methodPath, options);
		return value;
	} });
}
function instrumentOpenAiClient(client, options) {
	return createDeepProxy$2(client, "", resolveAIRecordingOptions(options));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/anthropic-ai/constants.js
var ANTHROPIC_AI_INTEGRATION_NAME = "Anthropic_AI";
var ANTHROPIC_METHOD_REGISTRY = {
	"messages.create": { operation: "chat" },
	"messages.stream": {
		operation: "chat",
		streaming: true
	},
	"messages.countTokens": { operation: "chat" },
	"models.get": { operation: "models" },
	"completions.create": { operation: "chat" },
	"models.retrieve": { operation: "models" },
	"beta.messages.create": { operation: "chat" }
};
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/anthropic-ai/utils.js
function setMessagesAttribute(span, messages, enableTruncation) {
	if (Array.isArray(messages) && messages.length === 0) return;
	const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
	if (systemInstructions) span.setAttributes({ [GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE]: systemInstructions });
	const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 1;
	span.setAttributes({
		[GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages),
		[GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
	});
}
var ANTHROPIC_ERROR_TYPE_TO_SPAN_STATUS = {
	invalid_request_error: "invalid_argument",
	authentication_error: "unauthenticated",
	permission_error: "permission_denied",
	not_found_error: "not_found",
	request_too_large: "failed_precondition",
	rate_limit_error: "resource_exhausted",
	api_error: "internal_error",
	overloaded_error: "unavailable"
};
function mapAnthropicErrorToStatusMessage(errorType) {
	if (!errorType) return "internal_error";
	return ANTHROPIC_ERROR_TYPE_TO_SPAN_STATUS[errorType] || "internal_error";
}
function handleResponseError(span, response) {
	if (response.error) {
		span.setStatus({
			code: 2,
			message: mapAnthropicErrorToStatusMessage(response.error.type)
		});
		captureException(response.error, { mechanism: {
			handled: false,
			type: "auto.ai.anthropic.anthropic_error"
		} });
	}
}
function messagesFromParams(params) {
	const { system, messages, input } = params;
	const systemMessages = typeof system === "string" ? [{
		role: "system",
		content: params.system
	}] : [];
	const userMessages = (Array.isArray(input) ? input : input != null ? [input] : void 0) ?? (Array.isArray(messages) ? messages : messages != null ? [messages] : []);
	return [...systemMessages, ...userMessages];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/anthropic-ai/streaming.js
function isErrorEvent(event, span) {
	if ("type" in event && typeof event.type === "string") {
		if (event.type === "error") {
			span.setStatus({
				code: 2,
				message: mapAnthropicErrorToStatusMessage(event.error?.type)
			});
			captureException(event.error, { mechanism: {
				handled: false,
				type: "auto.ai.anthropic.anthropic_error"
			} });
			return true;
		}
	}
	return false;
}
function handleMessageMetadata(event, state) {
	if (event.type === "message_delta") {
		if (event.usage && typeof event.usage.output_tokens === "number") state.completionTokens = event.usage.output_tokens;
		if (event.delta?.stop_reason) state.finishReasons.push(event.delta.stop_reason);
	}
	if (event.message) {
		const message = event.message;
		if (message.id) state.responseId = message.id;
		if (message.model) state.responseModel = message.model;
		if (message.usage) {
			if (typeof message.usage.input_tokens === "number") state.promptTokens = message.usage.input_tokens;
			if (typeof message.usage.cache_creation_input_tokens === "number") state.cacheCreationInputTokens = message.usage.cache_creation_input_tokens;
			if (typeof message.usage.cache_read_input_tokens === "number") state.cacheReadInputTokens = message.usage.cache_read_input_tokens;
		}
	}
}
function handleContentBlockStart(event, state) {
	if (event.type !== "content_block_start" || typeof event.index !== "number" || !event.content_block) return;
	if (event.content_block.type === "tool_use" || event.content_block.type === "server_tool_use") state.activeToolBlocks[event.index] = {
		id: event.content_block.id,
		name: event.content_block.name,
		inputJsonParts: []
	};
}
function handleContentBlockDelta(event, state, recordOutputs) {
	if (event.type !== "content_block_delta" || !event.delta) return;
	if (typeof event.index === "number" && "partial_json" in event.delta && typeof event.delta.partial_json === "string") {
		const active = state.activeToolBlocks[event.index];
		if (active) active.inputJsonParts.push(event.delta.partial_json);
	}
	if (recordOutputs && typeof event.delta.text === "string") state.responseTexts.push(event.delta.text);
}
function handleContentBlockStop(event, state) {
	if (event.type !== "content_block_stop" || typeof event.index !== "number") return;
	const active = state.activeToolBlocks[event.index];
	if (!active) return;
	const raw = active.inputJsonParts.join("");
	let parsedInput;
	try {
		parsedInput = raw ? JSON.parse(raw) : {};
	} catch {
		parsedInput = { __unparsed: raw };
	}
	state.toolCalls.push({
		type: "tool_use",
		id: active.id,
		name: active.name,
		input: parsedInput
	});
	delete state.activeToolBlocks[event.index];
}
function processEvent(event, state, recordOutputs, span) {
	if (!(event && typeof event === "object")) return;
	if (isErrorEvent(event, span)) return;
	handleMessageMetadata(event, state);
	handleContentBlockStart(event, state);
	handleContentBlockDelta(event, state, recordOutputs);
	handleContentBlockStop(event, state);
}
async function* instrumentAsyncIterableStream(stream, span, recordOutputs) {
	const state = {
		responseTexts: [],
		finishReasons: [],
		responseId: "",
		responseModel: "",
		promptTokens: void 0,
		completionTokens: void 0,
		cacheCreationInputTokens: void 0,
		cacheReadInputTokens: void 0,
		toolCalls: [],
		activeToolBlocks: {}
	};
	try {
		for await (const event of stream) {
			processEvent(event, state, recordOutputs, span);
			yield event;
		}
	} finally {
		endStreamSpan(span, state, recordOutputs);
	}
}
function instrumentMessageStream(stream, span, recordOutputs) {
	const state = {
		responseTexts: [],
		finishReasons: [],
		responseId: "",
		responseModel: "",
		promptTokens: void 0,
		completionTokens: void 0,
		cacheCreationInputTokens: void 0,
		cacheReadInputTokens: void 0,
		toolCalls: [],
		activeToolBlocks: {}
	};
	stream.on("streamEvent", (event) => {
		processEvent(event, state, recordOutputs, span);
	});
	stream.on("message", () => {
		endStreamSpan(span, state, recordOutputs);
	});
	stream.on("error", (error) => {
		captureException(error, { mechanism: {
			handled: false,
			type: "auto.ai.anthropic.stream_error"
		} });
		if (span.isRecording()) {
			span.setStatus({
				code: 2,
				message: "internal_error"
			});
			span.end();
		}
	});
	return stream;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/anthropic-ai/index.js
function extractRequestAttributes$1(args, methodPath, operationName) {
	const attributes = {
		[GEN_AI_SYSTEM_ATTRIBUTE]: "anthropic",
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.anthropic"
	};
	if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
		const params = args[0];
		if (params.tools && Array.isArray(params.tools)) attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(params.tools);
		attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = params.model ?? "unknown";
		if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
		if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
		if ("stream" in params) attributes[GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
		if ("top_k" in params) attributes[GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = params.top_k;
		if ("frequency_penalty" in params) attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
		if ("max_tokens" in params) attributes[GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = params.max_tokens;
	} else if (methodPath === "models.retrieve" || methodPath === "models.get") attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = args[0];
	else attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
	return attributes;
}
function addPrivateRequestAttributes$1(span, params, enableTruncation) {
	setMessagesAttribute(span, messagesFromParams(params), enableTruncation);
	if ("prompt" in params) span.setAttributes({ [GEN_AI_PROMPT_ATTRIBUTE]: JSON.stringify(params.prompt) });
}
function addContentAttributes(span, response) {
	if ("content" in response) {
		if (Array.isArray(response.content)) {
			span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.content.map((item) => item.text).filter((text) => !!text).join("") });
			const toolCalls = [];
			for (const item of response.content) if (item.type === "tool_use" || item.type === "server_tool_use") toolCalls.push(item);
			if (toolCalls.length > 0) span.setAttributes({ [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(toolCalls) });
		}
	}
	if ("completion" in response) span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.completion });
	if ("input_tokens" in response) span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: JSON.stringify(response.input_tokens) });
}
function addMetadataAttributes(span, response) {
	if ("id" in response && "model" in response) {
		span.setAttributes({
			[GEN_AI_RESPONSE_ID_ATTRIBUTE]: response.id,
			[GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: response.model
		});
		if ("usage" in response && response.usage) setTokenUsageAttributes(span, response.usage.input_tokens, response.usage.output_tokens, response.usage.cache_creation_input_tokens, response.usage.cache_read_input_tokens);
	}
}
function addResponseAttributes$1(span, response, recordOutputs) {
	if (!response || typeof response !== "object") return;
	if ("type" in response && response.type === "error") {
		handleResponseError(span, response);
		return;
	}
	if (recordOutputs) addContentAttributes(span, response);
	addMetadataAttributes(span, response);
}
function handleStreamingError(error, span, methodPath) {
	captureException(error, { mechanism: {
		handled: false,
		type: "auto.ai.anthropic",
		data: { function: methodPath }
	} });
	if (span.isRecording()) {
		span.setStatus({
			code: 2,
			message: "internal_error"
		});
		span.end();
	}
	throw error;
}
function handleStreamingRequest(originalMethod, target, context, args, requestAttributes, operationName, methodPath, params, options, isStreamRequested, isStreamingMethod) {
	const spanConfig = {
		name: `${operationName} ${requestAttributes["gen_ai.request.model"] ?? "unknown"}`,
		op: `gen_ai.${operationName}`,
		attributes: requestAttributes
	};
	if (isStreamRequested && !isStreamingMethod) {
		let originalResult;
		const instrumentedPromise = startSpanManual(spanConfig, (span) => {
			originalResult = originalMethod.apply(context, args);
			if (options.recordInputs && params) addPrivateRequestAttributes$1(span, params, shouldEnableTruncation(options.enableTruncation));
			return (async () => {
				try {
					return instrumentAsyncIterableStream(await originalResult, span, options.recordOutputs ?? false);
				} catch (error) {
					return handleStreamingError(error, span, methodPath);
				}
			})();
		});
		return wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.anthropic");
	} else return startSpanManual(spanConfig, (span) => {
		try {
			if (options.recordInputs && params) addPrivateRequestAttributes$1(span, params, shouldEnableTruncation(options.enableTruncation));
			return instrumentMessageStream(target.apply(context, args), span, options.recordOutputs ?? false);
		} catch (error) {
			return handleStreamingError(error, span, methodPath);
		}
	});
}
function instrumentMethod$1(originalMethod, methodPath, instrumentedMethod, context, options) {
	return new Proxy(originalMethod, { apply(target, thisArg, args) {
		const operationName = instrumentedMethod.operation || "unknown";
		const requestAttributes = extractRequestAttributes$1(args, methodPath, operationName);
		const model = requestAttributes["gen_ai.request.model"] ?? "unknown";
		const params = typeof args[0] === "object" ? args[0] : void 0;
		const isStreamRequested = Boolean(params?.stream);
		const isStreamingMethod = instrumentedMethod.streaming === true;
		if (isStreamRequested || isStreamingMethod) return handleStreamingRequest(originalMethod, target, context, args, requestAttributes, operationName, methodPath, params, options, isStreamRequested, isStreamingMethod);
		let originalResult;
		const instrumentedPromise = startSpan({
			name: `${operationName} ${model}`,
			op: `gen_ai.${operationName}`,
			attributes: requestAttributes
		}, (span) => {
			originalResult = target.apply(context, args);
			if (options.recordInputs && params) addPrivateRequestAttributes$1(span, params, shouldEnableTruncation(options.enableTruncation));
			return originalResult.then((result) => {
				addResponseAttributes$1(span, result, options.recordOutputs);
				return result;
			}, (error) => {
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.anthropic",
					data: { function: methodPath }
				} });
				throw error;
			});
		});
		return wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.anthropic");
	} });
}
function createDeepProxy$1(target, currentPath = "", options) {
	return new Proxy(target, { get(obj, prop) {
		const value = obj[prop];
		const methodPath = buildMethodPath(currentPath, String(prop));
		const instrumentedMethod = ANTHROPIC_METHOD_REGISTRY[methodPath];
		if (typeof value === "function" && instrumentedMethod) return instrumentMethod$1(value, methodPath, instrumentedMethod, obj, options);
		if (typeof value === "function") return value.bind(obj);
		if (value && typeof value === "object") return createDeepProxy$1(value, methodPath, options);
		return value;
	} });
}
function instrumentAnthropicAiClient(anthropicAiClient, options) {
	return createDeepProxy$1(anthropicAiClient, "", resolveAIRecordingOptions(options));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/google-genai/constants.js
var GOOGLE_GENAI_INTEGRATION_NAME = "Google_GenAI";
var GOOGLE_GENAI_METHOD_REGISTRY = {
	"models.generateContent": { operation: "generate_content" },
	"models.generateContentStream": {
		operation: "generate_content",
		streaming: true
	},
	"models.embedContent": { operation: "embeddings" },
	"chats.create": { proxyResultPath: "chat" },
	"chat.sendMessage": { operation: "chat" },
	"chat.sendMessageStream": {
		operation: "chat",
		streaming: true
	}
};
var GOOGLE_GENAI_SYSTEM_NAME = "google_genai";
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/google-genai/streaming.js
function isErrorChunk(chunk, span) {
	const feedback = chunk?.promptFeedback;
	if (feedback?.blockReason) {
		const message = feedback.blockReasonMessage ?? feedback.blockReason;
		span.setStatus({
			code: 2,
			message: "internal_error"
		});
		captureException(`Content blocked: ${message}`, { mechanism: {
			handled: false,
			type: "auto.ai.google_genai"
		} });
		return true;
	}
	return false;
}
function handleResponseMetadata(chunk, state) {
	if (typeof chunk.responseId === "string") state.responseId = chunk.responseId;
	if (typeof chunk.modelVersion === "string") state.responseModel = chunk.modelVersion;
	const usage = chunk.usageMetadata;
	if (usage) {
		if (typeof usage.promptTokenCount === "number") state.promptTokens = usage.promptTokenCount;
		if (typeof usage.candidatesTokenCount === "number") state.completionTokens = usage.candidatesTokenCount;
		if (typeof usage.totalTokenCount === "number") state.totalTokens = usage.totalTokenCount;
	}
}
function handleCandidateContent(chunk, state, recordOutputs) {
	if (Array.isArray(chunk.functionCalls)) state.toolCalls.push(...chunk.functionCalls);
	for (const candidate of chunk.candidates ?? []) {
		if (candidate?.finishReason && !state.finishReasons.includes(candidate.finishReason)) state.finishReasons.push(candidate.finishReason);
		for (const part of candidate?.content?.parts ?? []) {
			if (recordOutputs && part.text) state.responseTexts.push(part.text);
			if (part.functionCall) state.toolCalls.push({
				type: "function",
				id: part.functionCall.id,
				name: part.functionCall.name,
				arguments: part.functionCall.args
			});
		}
	}
}
function processChunk(chunk, state, recordOutputs, span) {
	if (!chunk || isErrorChunk(chunk, span)) return;
	handleResponseMetadata(chunk, state);
	handleCandidateContent(chunk, state, recordOutputs);
}
async function* instrumentStream(stream, span, recordOutputs) {
	const state = {
		responseTexts: [],
		finishReasons: [],
		toolCalls: []
	};
	try {
		for await (const chunk of stream) {
			processChunk(chunk, state, recordOutputs, span);
			yield chunk;
		}
	} finally {
		endStreamSpan(span, state, recordOutputs);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/google-genai/utils.js
function contentUnionToMessages(content, role = "user") {
	if (typeof content === "string") return [{
		role,
		content
	}];
	if (Array.isArray(content)) return content.flatMap((content2) => contentUnionToMessages(content2, role));
	if (typeof content !== "object" || !content) return [];
	if ("role" in content && typeof content.role === "string") return [content];
	if ("parts" in content) return [{
		...content,
		role
	}];
	return [{
		role,
		content
	}];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/google-genai/index.js
function extractModel(params, context) {
	if ("model" in params && typeof params.model === "string") return params.model;
	if (context && typeof context === "object") {
		const contextObj = context;
		if ("model" in contextObj && typeof contextObj.model === "string") return contextObj.model;
		if ("modelVersion" in contextObj && typeof contextObj.modelVersion === "string") return contextObj.modelVersion;
	}
	return "unknown";
}
function extractConfigAttributes(config) {
	const attributes = {};
	if ("temperature" in config && typeof config.temperature === "number") attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = config.temperature;
	if ("topP" in config && typeof config.topP === "number") attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = config.topP;
	if ("topK" in config && typeof config.topK === "number") attributes[GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = config.topK;
	if ("maxOutputTokens" in config && typeof config.maxOutputTokens === "number") attributes[GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = config.maxOutputTokens;
	if ("frequencyPenalty" in config && typeof config.frequencyPenalty === "number") attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = config.frequencyPenalty;
	if ("presencePenalty" in config && typeof config.presencePenalty === "number") attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = config.presencePenalty;
	return attributes;
}
function extractRequestAttributes(operationName, params, context) {
	const attributes = {
		[GEN_AI_SYSTEM_ATTRIBUTE]: GOOGLE_GENAI_SYSTEM_NAME,
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.google_genai"
	};
	if (params) {
		attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel(params, context);
		if ("config" in params && typeof params.config === "object" && params.config) {
			const config = params.config;
			Object.assign(attributes, extractConfigAttributes(config));
			if ("tools" in config && Array.isArray(config.tools)) {
				const functionDeclarations = config.tools.flatMap((tool) => tool.functionDeclarations);
				attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(functionDeclarations);
			}
		}
	} else attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel({}, context);
	return attributes;
}
function addPrivateRequestAttributes(span, params, operationName, enableTruncation) {
	if (operationName === "embeddings") {
		const contents = params.contents;
		if (contents != null) span.setAttribute(GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE, typeof contents === "string" ? contents : JSON.stringify(contents));
		return;
	}
	const messages = [];
	if ("config" in params && params.config && typeof params.config === "object" && "systemInstruction" in params.config && params.config.systemInstruction) messages.push(...contentUnionToMessages(params.config.systemInstruction, "system"));
	if ("history" in params) messages.push(...contentUnionToMessages(params.history, "user"));
	if ("contents" in params) messages.push(...contentUnionToMessages(params.contents, "user"));
	if ("message" in params) messages.push(...contentUnionToMessages(params.message, "user"));
	if (Array.isArray(messages) && messages.length) {
		const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
		if (systemInstructions) span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
		const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
		span.setAttributes({
			[GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength,
			[GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages)
		});
	}
}
function addResponseAttributes(span, response, recordOutputs) {
	if (!response || typeof response !== "object") return;
	if (response.modelVersion) span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, response.modelVersion);
	if (response.usageMetadata && typeof response.usageMetadata === "object") {
		const usage = response.usageMetadata;
		if (typeof usage.promptTokenCount === "number") span.setAttributes({ [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: usage.promptTokenCount });
		if (typeof usage.candidatesTokenCount === "number") span.setAttributes({ [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: usage.candidatesTokenCount });
		if (typeof usage.totalTokenCount === "number") span.setAttributes({ [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: usage.totalTokenCount });
	}
	if (recordOutputs && Array.isArray(response.candidates) && response.candidates.length > 0) {
		const responseTexts = response.candidates.map((candidate) => {
			if (candidate.content?.parts && Array.isArray(candidate.content.parts)) return candidate.content.parts.map((part) => typeof part.text === "string" ? part.text : "").filter((text) => text.length > 0).join("");
			return "";
		}).filter((text) => text.length > 0);
		if (responseTexts.length > 0) span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: responseTexts.join("") });
	}
	if (recordOutputs && response.functionCalls) {
		const functionCalls = response.functionCalls;
		if (Array.isArray(functionCalls) && functionCalls.length > 0) span.setAttributes({ [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(functionCalls) });
	}
}
function instrumentMethod(originalMethod, methodPath, instrumentedMethod, context, options) {
	const isEmbeddings = instrumentedMethod.operation === "embeddings";
	return new Proxy(originalMethod, { apply(target, _, args) {
		const operationName = instrumentedMethod.operation || "unknown";
		const params = args[0];
		const requestAttributes = extractRequestAttributes(operationName, params, context);
		const model = requestAttributes["gen_ai.request.model"] ?? "unknown";
		if (instrumentedMethod.streaming) return startSpanManual({
			name: `${operationName} ${model}`,
			op: `gen_ai.${operationName}`,
			attributes: requestAttributes
		}, async (span) => {
			try {
				if (options.recordInputs && params) addPrivateRequestAttributes(span, params, operationName, shouldEnableTruncation(options.enableTruncation));
				return instrumentStream(await target.apply(context, args), span, Boolean(options.recordOutputs));
			} catch (error) {
				span.setStatus({
					code: 2,
					message: "internal_error"
				});
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.google_genai",
					data: { function: methodPath }
				} });
				span.end();
				throw error;
			}
		});
		return startSpan({
			name: `${operationName} ${model}`,
			op: `gen_ai.${operationName}`,
			attributes: requestAttributes
		}, (span) => {
			if (options.recordInputs && params) addPrivateRequestAttributes(span, params, operationName, shouldEnableTruncation(options.enableTruncation));
			return handleCallbackErrors(() => target.apply(context, args), (error) => {
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.google_genai",
					data: { function: methodPath }
				} });
			}, () => {}, (result) => {
				if (!isEmbeddings) addResponseAttributes(span, result, options.recordOutputs);
			});
		});
	} });
}
function createDeepProxy(target, currentPath = "", options) {
	return new Proxy(target, { get: (t, prop, receiver) => {
		const value = Reflect.get(t, prop, receiver);
		const methodPath = buildMethodPath(currentPath, String(prop));
		const instrumentedMethod = GOOGLE_GENAI_METHOD_REGISTRY[methodPath];
		if (typeof value === "function" && instrumentedMethod) {
			const wrappedMethod = instrumentedMethod.operation ? instrumentMethod(value, methodPath, instrumentedMethod, t, options) : value.bind(t);
			if (!instrumentedMethod.proxyResultPath) return wrappedMethod;
			return function(...args) {
				const result = wrappedMethod(...args);
				if (result && typeof result === "object") return createDeepProxy(result, instrumentedMethod.proxyResultPath, options);
				return result;
			};
		}
		if (typeof value === "function") return value.bind(t);
		if (value && typeof value === "object") return createDeepProxy(value, methodPath, options);
		return value;
	} });
}
function instrumentGoogleGenAIClient(client, options) {
	return createDeepProxy(client, "", resolveAIRecordingOptions(options));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langchain/constants.js
var LANGCHAIN_INTEGRATION_NAME = "LangChain";
var LANGCHAIN_ORIGIN = "auto.ai.langchain";
var ROLE_MAP = {
	human: "user",
	ai: "assistant",
	assistant: "assistant",
	system: "system",
	function: "function",
	tool: "tool"
};
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langchain/utils.js
var setIfDefined = (target, key, value) => {
	if (value != null) target[key] = value;
};
var setNumberIfDefined = (target, key, value) => {
	const n = Number(value);
	if (!Number.isNaN(n)) target[key] = n;
};
function normalizeContent(v) {
	if (Array.isArray(v)) try {
		const stripped = v.map((part) => part && typeof part === "object" && isContentMedia(part) ? stripInlineMediaFromSingleMessage(part) : part);
		return JSON.stringify(stripped);
	} catch {
		return String(v);
	}
	return stringify(v, String);
}
function normalizeMessageRole(role) {
	const normalized = role.toLowerCase();
	return ROLE_MAP[normalized] ?? normalized;
}
function normalizeRoleNameFromCtor(name) {
	if (name.includes("System")) return "system";
	if (name.includes("Human")) return "user";
	if (name.includes("AI") || name.includes("Assistant")) return "assistant";
	if (name.includes("Function")) return "function";
	if (name.includes("Tool")) return "tool";
	return "user";
}
function getInvocationParams(tags) {
	if (!tags || Array.isArray(tags)) return void 0;
	return tags.invocation_params;
}
function normalizeLangChainMessages(messages) {
	return messages.map((message) => {
		const maybeGetType = message._getType;
		if (typeof maybeGetType === "function") return {
			role: normalizeMessageRole(maybeGetType.call(message)),
			content: normalizeContent(message.content)
		};
		if (message.lc === 1 && message.kwargs) {
			const id = message.id;
			const messageType = Array.isArray(id) && id.length > 0 ? id[id.length - 1] : "";
			return {
				role: normalizeMessageRole(typeof messageType === "string" ? normalizeRoleNameFromCtor(messageType) : "user"),
				content: normalizeContent(message.kwargs?.content)
			};
		}
		if (message.type) return {
			role: normalizeMessageRole(String(message.type).toLowerCase()),
			content: normalizeContent(message.content)
		};
		if (message.role) return {
			role: normalizeMessageRole(String(message.role)),
			content: normalizeContent(message.content)
		};
		const ctor = message.constructor?.name;
		if (ctor && ctor !== "Object") return {
			role: normalizeMessageRole(normalizeRoleNameFromCtor(ctor)),
			content: normalizeContent(message.content)
		};
		return {
			role: "user",
			content: normalizeContent(message.content)
		};
	});
}
function extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata) {
	const attrs = {};
	const kwargs = "kwargs" in serialized ? serialized.kwargs : void 0;
	setNumberIfDefined(attrs, GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE, invocationParams?.temperature ?? langSmithMetadata?.ls_temperature ?? kwargs?.temperature);
	setNumberIfDefined(attrs, GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE, invocationParams?.max_tokens ?? langSmithMetadata?.ls_max_tokens ?? kwargs?.max_tokens);
	setNumberIfDefined(attrs, GEN_AI_REQUEST_TOP_P_ATTRIBUTE, invocationParams?.top_p ?? kwargs?.top_p);
	const frequencyPenalty = invocationParams?.frequency_penalty;
	setNumberIfDefined(attrs, GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE, frequencyPenalty);
	const presencePenalty = invocationParams?.presence_penalty;
	setNumberIfDefined(attrs, GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE, presencePenalty);
	if (invocationParams && "stream" in invocationParams) setIfDefined(attrs, GEN_AI_REQUEST_STREAM_ATTRIBUTE, Boolean(invocationParams.stream));
	return attrs;
}
function baseRequestAttributes(system, modelName, serialized, invocationParams, langSmithMetadata) {
	return {
		[GEN_AI_SYSTEM_ATTRIBUTE]: stringify(system ?? "langchain", String),
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: "chat",
		[GEN_AI_REQUEST_MODEL_ATTRIBUTE]: stringify(modelName, String),
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
		...extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata)
	};
}
function extractLLMRequestAttributes(llm, prompts, recordInputs, enableTruncation, invocationParams, langSmithMetadata) {
	const system = langSmithMetadata?.ls_provider;
	const attrs = baseRequestAttributes(system, invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown", llm, invocationParams, langSmithMetadata);
	if (recordInputs && Array.isArray(prompts) && prompts.length > 0) {
		setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, prompts.length);
		const messages = prompts.map((p) => ({
			role: "user",
			content: p
		}));
		setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ATTRIBUTE, enableTruncation ? getTruncatedJsonString(messages) : stringify(messages));
	}
	return attrs;
}
function extractChatModelRequestAttributes(llm, langChainMessages, recordInputs, enableTruncation, invocationParams, langSmithMetadata) {
	const attrs = baseRequestAttributes(langSmithMetadata?.ls_provider ?? llm.id?.[2], invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown", llm, invocationParams, langSmithMetadata);
	if (recordInputs && Array.isArray(langChainMessages) && langChainMessages.length > 0) {
		const { systemInstructions, filteredMessages } = extractSystemInstructions(normalizeLangChainMessages(langChainMessages.flat()));
		if (systemInstructions) setIfDefined(attrs, GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
		setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, Array.isArray(filteredMessages) ? filteredMessages.length : 0);
		setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ATTRIBUTE, enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages));
	}
	return attrs;
}
function addToolCallsAttributes(generations, attrs) {
	const toolCalls = [];
	const flatGenerations = generations.flat();
	for (const gen of flatGenerations) {
		const msgToolCalls = gen.message?.tool_calls;
		if (Array.isArray(msgToolCalls) && msgToolCalls.length > 0) toolCalls.push(...msgToolCalls);
		else {
			const content = gen.message?.content;
			if (Array.isArray(content)) for (const item of content) {
				const t = item;
				if (t.type === "tool_use") toolCalls.push(t);
			}
		}
	}
	if (toolCalls.length > 0) setIfDefined(attrs, GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, stringify(toolCalls, String));
}
function addTokenUsageAttributes(llmOutput, attrs) {
	if (!llmOutput) return;
	const tokenUsage = llmOutput.tokenUsage;
	const anthropicUsage = llmOutput.usage;
	if (tokenUsage) {
		setNumberIfDefined(attrs, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, tokenUsage.promptTokens);
		setNumberIfDefined(attrs, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, tokenUsage.completionTokens);
		setNumberIfDefined(attrs, GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, tokenUsage.totalTokens);
	} else if (anthropicUsage) {
		setNumberIfDefined(attrs, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.input_tokens);
		setNumberIfDefined(attrs, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, anthropicUsage.output_tokens);
		const input = Number(anthropicUsage.input_tokens);
		const output = Number(anthropicUsage.output_tokens);
		const total = (Number.isNaN(input) ? 0 : input) + (Number.isNaN(output) ? 0 : output);
		if (total > 0) setNumberIfDefined(attrs, GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, total);
		if (anthropicUsage.cache_creation_input_tokens !== void 0) setNumberIfDefined(attrs, GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.cache_creation_input_tokens);
		if (anthropicUsage.cache_read_input_tokens !== void 0) setNumberIfDefined(attrs, GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.cache_read_input_tokens);
	}
}
function extractLlmResponseAttributes(llmResult, recordOutputs) {
	if (!llmResult) return;
	const attrs = {};
	if (Array.isArray(llmResult.generations)) {
		const finishReasons = llmResult.generations.flat().map((g) => {
			if (g.generationInfo?.finish_reason) return g.generationInfo.finish_reason;
			if (g.generation_info?.finish_reason) return g.generation_info.finish_reason;
			return null;
		}).filter((r) => typeof r === "string");
		if (finishReasons.length > 0) setIfDefined(attrs, GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, stringify(finishReasons, String));
		addToolCallsAttributes(llmResult.generations, attrs);
		if (recordOutputs) {
			const texts = llmResult.generations.flat().map((gen) => gen.text ?? gen.message?.content).filter((t) => typeof t === "string");
			if (texts.length > 0) setIfDefined(attrs, GEN_AI_RESPONSE_TEXT_ATTRIBUTE, stringify(texts, String));
		}
	}
	addTokenUsageAttributes(llmResult.llmOutput, attrs);
	const llmOutput = llmResult.llmOutput;
	const v1Message = (llmResult.generations?.[0]?.[0])?.message;
	const modelName = llmOutput?.model_name ?? llmOutput?.model ?? v1Message?.response_metadata?.model_name;
	if (modelName) setIfDefined(attrs, GEN_AI_RESPONSE_MODEL_ATTRIBUTE, modelName);
	const responseId = llmOutput?.id ?? v1Message?.id;
	if (responseId) setIfDefined(attrs, GEN_AI_RESPONSE_ID_ATTRIBUTE, responseId);
	const stopReason = llmOutput?.stop_reason ?? v1Message?.response_metadata?.finish_reason;
	if (stopReason) setIfDefined(attrs, GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE, stringify(stopReason, String));
	return attrs;
}
function getAgentNameFromMetadata(metadata) {
	const attrs = {};
	const agentName = metadata?.lc_agent_name;
	if (typeof agentName === "string") attrs[GEN_AI_AGENT_NAME_ATTRIBUTE] = agentName;
	return attrs;
}
function extractToolDefinitions(extraParams) {
	const tools = extraParams?.invocation_params?.tools ?? extraParams?.options?.tools;
	if (!Array.isArray(tools) || tools.length === 0) return void 0;
	const toolDefs = tools.map((tool) => {
		const fn = tool.function;
		return {
			type: "function",
			name: tool.name ?? fn?.name ?? "",
			description: tool.description ?? fn?.description
		};
	});
	return JSON.stringify(toolDefs);
}
function isCallbackManager(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return typeof candidate.addHandler === "function" && typeof candidate.copy === "function";
}
function isSentryHandler(handler) {
	return typeof handler === "object" && handler?.name === "SentryCallbackHandler";
}
function containsSentryHandler(handlers) {
	return handlers.some(isSentryHandler);
}
function _INTERNAL_mergeLangChainCallbackHandler(existing, sentryHandler) {
	if (!existing) return [sentryHandler];
	if (isCallbackManager(existing)) {
		if (containsSentryHandler(existing.handlers ?? [])) return existing;
		const copied = existing.copy();
		copied.addHandler(sentryHandler, true);
		return copied;
	}
	const handlers = Array.isArray(existing) ? existing : [existing];
	if (containsSentryHandler(handlers)) return existing;
	return [...handlers, sentryHandler];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langchain/index.js
function createLangChainCallbackHandler(options = {}) {
	const { recordInputs, recordOutputs } = resolveAIRecordingOptions(options);
	const enableTruncation = shouldEnableTruncation(options.enableTruncation);
	const spanMap = /* @__PURE__ */ new Map();
	const exitSpan = (runId) => {
		const span = spanMap.get(runId);
		if (span?.isRecording()) {
			span.end();
			spanMap.delete(runId);
		}
	};
	const handler = {
		lc_serializable: false,
		lc_namespace: [
			"langchain_core",
			"callbacks",
			"sentry"
		],
		lc_secrets: void 0,
		lc_attributes: void 0,
		lc_aliases: void 0,
		lc_serializable_keys: void 0,
		lc_id: [
			"langchain_core",
			"callbacks",
			"sentry"
		],
		lc_kwargs: {},
		name: "SentryCallbackHandler",
		ignoreLLM: false,
		ignoreChain: false,
		ignoreAgent: false,
		ignoreRetriever: false,
		ignoreCustomEvent: false,
		raiseError: false,
		awaitHandlers: true,
		handleLLMStart(llm, prompts, runId, _parentRunId, _extraParams, tags, metadata, _runName) {
			const invocationParams = getInvocationParams(tags);
			const attributes = extractLLMRequestAttributes(llm, prompts, recordInputs, enableTruncation, invocationParams, metadata);
			const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE];
			const operationName = attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE];
			startSpanManual({
				name: `${operationName} ${modelName}`,
				op: "gen_ai.chat",
				attributes: {
					...getAgentNameFromMetadata(metadata),
					...attributes,
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
				}
			}, (span) => {
				spanMap.set(runId, span);
				return span;
			});
		},
		handleChatModelStart(llm, messages, runId, _parentRunId, extraParams, tags, metadata, _runName) {
			const invocationParams = getInvocationParams(tags);
			const attributes = extractChatModelRequestAttributes(llm, messages, recordInputs, enableTruncation, invocationParams, metadata);
			const toolDefsJson = extractToolDefinitions(extraParams);
			if (toolDefsJson) attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = toolDefsJson;
			const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE];
			const operationName = attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE];
			startSpanManual({
				name: `${operationName} ${modelName}`,
				op: "gen_ai.chat",
				attributes: {
					...getAgentNameFromMetadata(metadata),
					...attributes,
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
				}
			}, (span) => {
				spanMap.set(runId, span);
				return span;
			});
		},
		handleLLMEnd(output, runId, _parentRunId, _tags, _extraParams) {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				const attributes = extractLlmResponseAttributes(output, recordOutputs);
				if (attributes) span.setAttributes(attributes);
				exitSpan(runId);
			}
		},
		handleLLMError(error, runId) {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				span.setStatus({
					code: 2,
					message: "internal_error"
				});
				exitSpan(runId);
			}
			captureException(error, { mechanism: {
				handled: false,
				type: `${LANGCHAIN_ORIGIN}.llm_error_handler`
			} });
		},
		handleChainStart(chain, inputs, runId, _parentRunId, _tags, metadata, _runType, runName) {
			if (metadata?.__sentry_langgraph__) return;
			const chainName = runName || chain.name || "unknown_chain";
			const attributes = {
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.langchain",
				"langchain.chain.name": chainName
			};
			if (recordInputs) attributes["langchain.chain.inputs"] = JSON.stringify(inputs);
			startSpanManual({
				name: `chain ${chainName}`,
				op: "gen_ai.invoke_agent",
				attributes: {
					...attributes,
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.invoke_agent"
				}
			}, (span) => {
				spanMap.set(runId, span);
				return span;
			});
		},
		handleChainEnd(outputs, runId) {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				if (recordOutputs) span.setAttributes({ "langchain.chain.outputs": JSON.stringify(outputs) });
				exitSpan(runId);
			}
		},
		handleChainError(error, runId) {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				span.setStatus({
					code: 2,
					message: "internal_error"
				});
				exitSpan(runId);
			}
			captureException(error, { mechanism: {
				handled: false,
				type: `${LANGCHAIN_ORIGIN}.chain_error_handler`
			} });
		},
		handleToolStart(tool, input, runId, _parentRunId, _tags, metadata, runName) {
			if (metadata?.__sentry_langgraph__) return;
			const toolName = runName || tool.name || "unknown_tool";
			const attributes = {
				...getAgentNameFromMetadata(metadata),
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
				[GEN_AI_OPERATION_NAME_ATTRIBUTE]: "execute_tool",
				[GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName
			};
			if (recordInputs) attributes[GEN_AI_TOOL_INPUT_ATTRIBUTE] = input;
			startSpanManual({
				name: `execute_tool ${toolName}`,
				op: "gen_ai.execute_tool",
				attributes: {
					...attributes,
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.execute_tool"
				}
			}, (span) => {
				spanMap.set(runId, span);
				return span;
			});
		},
		handleToolEnd(output, runId) {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				if (recordOutputs) {
					const outputObj = output;
					const content = outputObj && typeof outputObj === "object" && "content" in outputObj ? outputObj.content : output;
					span.setAttributes({ [GEN_AI_TOOL_OUTPUT_ATTRIBUTE]: typeof content === "string" ? content : JSON.stringify(content) });
				}
				exitSpan(runId);
			}
		},
		handleToolError(error, runId) {
			const span = spanMap.get(runId);
			if (span?.isRecording()) {
				span.setStatus({
					code: 2,
					message: "internal_error"
				});
				exitSpan(runId);
			}
			captureException(error, { mechanism: {
				handled: false,
				type: `${LANGCHAIN_ORIGIN}.tool_error_handler`
			} });
		},
		copy() {
			return handler;
		},
		toJSON() {
			return {
				lc: 1,
				type: "not_implemented",
				id: handler.lc_id
			};
		},
		toJSONNotImplemented() {
			return {
				lc: 1,
				type: "not_implemented",
				id: handler.lc_id
			};
		}
	};
	return handler;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langchain/embeddings.js
function inferSystemFromInstance(instance) {
	const name = instance.constructor?.name ?? "";
	if (name.includes("OpenAI")) return "openai";
	if (name.includes("Google")) return "google_genai";
	if (name.includes("Mistral")) return "mistralai";
	if (name.includes("Vertex")) return "google_vertexai";
	if (name.includes("Bedrock")) return "aws_bedrock";
	if (name.includes("Ollama")) return "ollama";
	if (name.includes("Cloudflare")) return "cloudflare";
	if (name.includes("Cohere")) return "cohere";
	return "langchain";
}
function extractEmbeddingAttributes(instance) {
	const embeddingsInstance = instance ?? {};
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE,
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: "embeddings",
		[GEN_AI_REQUEST_MODEL_ATTRIBUTE]: embeddingsInstance.model ?? "unknown"
	};
	attributes[GEN_AI_SYSTEM_ATTRIBUTE] = inferSystemFromInstance(embeddingsInstance);
	if ("dimensions" in embeddingsInstance) attributes[GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = embeddingsInstance.dimensions;
	if ("encodingFormat" in embeddingsInstance) attributes[GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = embeddingsInstance.encodingFormat;
	return attributes;
}
function _INTERNAL_getLangChainEmbeddingsSpanOptions(instance, input, options = {}) {
	const { recordInputs } = resolveAIRecordingOptions(options);
	const attributes = extractEmbeddingAttributes(instance);
	const modelName = attributes["gen_ai.request.model"] || "unknown";
	if (recordInputs && input != null) attributes[GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE] = typeof input === "string" ? input : JSON.stringify(input);
	return {
		name: `embeddings ${modelName}`,
		op: GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE,
		attributes
	};
}
function instrumentEmbeddingMethod(originalMethod, options = {}) {
	return new Proxy(originalMethod, { apply(target, thisArg, args) {
		return startSpan(_INTERNAL_getLangChainEmbeddingsSpanOptions(thisArg, args[0], options), () => {
			return Reflect.apply(target, thisArg, args).then(void 0, (error) => {
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.langchain"
				} });
				throw error;
			});
		});
	} });
}
function instrumentLangChainEmbeddings(instance, options) {
	const embeddingsInstance = instance;
	if (typeof embeddingsInstance.embedQuery === "function") embeddingsInstance.embedQuery = instrumentEmbeddingMethod(embeddingsInstance.embedQuery, options);
	if (typeof embeddingsInstance.embedDocuments === "function") embeddingsInstance.embedDocuments = instrumentEmbeddingMethod(embeddingsInstance.embedDocuments, options);
	return instance;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langgraph/constants.js
var LANGGRAPH_INTEGRATION_NAME = "LangGraph";
var LANGGRAPH_ORIGIN = "auto.ai.langgraph";
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langgraph/utils.js
function extractLLMFromParams(args) {
	const arg = args[0];
	if (typeof arg !== "object" || !arg || !("llm" in arg) || !arg.llm || typeof arg.llm !== "object") return null;
	const llm = arg.llm;
	if (typeof llm.modelName !== "string" && typeof llm.model !== "string") return null;
	return llm;
}
function extractAgentNameFromParams(args) {
	const arg = args[0];
	if (typeof arg === "object" && !!arg && "name" in arg && typeof arg.name === "string") return arg.name;
	return null;
}
function wrapToolsWithSpans(tools, options, agentName) {
	const SENTRY_WRAPPED = "__sentry_tool_wrapped__";
	for (const tool of tools) {
		if (!tool || typeof tool !== "object") continue;
		const t = tool;
		const originalInvoke = t.invoke;
		if (typeof originalInvoke !== "function" || Object.prototype.hasOwnProperty.call(t, SENTRY_WRAPPED)) continue;
		const toolName = typeof t.name === "string" ? t.name : "unknown_tool";
		const toolDescription = typeof t.description === "string" ? t.description : void 0;
		t.invoke = new Proxy(originalInvoke, { apply(target, thisArg, args) {
			const spanAttributes = {
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
				[SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE,
				[GEN_AI_OPERATION_NAME_ATTRIBUTE]: "execute_tool",
				[GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName,
				[GEN_AI_TOOL_TYPE_ATTRIBUTE]: "function"
			};
			const callAgentName = args[1]?.metadata?.lc_agent_name ?? agentName;
			if (typeof callAgentName === "string") spanAttributes[GEN_AI_AGENT_NAME_ATTRIBUTE] = callAgentName;
			if (toolDescription) spanAttributes[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = toolDescription;
			const input = args[0];
			if (typeof input === "object" && !!input) {
				if ("id" in input && typeof input.id === "string") spanAttributes[GEN_AI_TOOL_CALL_ID_ATTRIBUTE] = input.id;
				if (options.recordInputs) {
					const toolArgs = "args" in input && typeof input.args === "object" ? input.args : input;
					try {
						spanAttributes[GEN_AI_TOOL_INPUT_ATTRIBUTE] = JSON.stringify(toolArgs);
					} catch {}
				}
			}
			return startSpan({
				op: GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE,
				name: `execute_tool ${toolName}`,
				attributes: spanAttributes
			}, async (span) => {
				try {
					const result = await Reflect.apply(target, thisArg, args);
					if (options.recordOutputs) try {
						const resultObj = result;
						const content = resultObj && typeof resultObj === "object" && "content" in resultObj ? resultObj.content : result;
						span.setAttribute(GEN_AI_TOOL_OUTPUT_ATTRIBUTE, typeof content === "string" ? content : JSON.stringify(content));
					} catch {}
					return result;
				} catch (error) {
					span.setStatus({
						code: 2,
						message: "internal_error"
					});
					captureException(error, { mechanism: {
						handled: false,
						type: "auto.ai.langgraph.error"
					} });
					throw error;
				}
			});
		} });
		Object.defineProperty(t, SENTRY_WRAPPED, {
			value: true,
			enumerable: false
		});
	}
	return tools;
}
function extractToolCalls(messages) {
	if (!messages || messages.length === 0) return null;
	const toolCalls = [];
	for (const message of messages) if (message && typeof message === "object") {
		const msgToolCalls = message.tool_calls;
		if (msgToolCalls && Array.isArray(msgToolCalls)) toolCalls.push(...msgToolCalls);
	}
	return toolCalls.length > 0 ? toolCalls : null;
}
function extractTokenUsageFromMessage(message) {
	const msg = message;
	let inputTokens = 0;
	let outputTokens = 0;
	let totalTokens = 0;
	if (msg.usage_metadata && typeof msg.usage_metadata === "object") {
		const usage = msg.usage_metadata;
		if (typeof usage.input_tokens === "number") inputTokens = usage.input_tokens;
		if (typeof usage.output_tokens === "number") outputTokens = usage.output_tokens;
		if (typeof usage.total_tokens === "number") totalTokens = usage.total_tokens;
		return {
			inputTokens,
			outputTokens,
			totalTokens
		};
	}
	if (msg.response_metadata && typeof msg.response_metadata === "object") {
		const metadata = msg.response_metadata;
		if (metadata.tokenUsage && typeof metadata.tokenUsage === "object") {
			const tokenUsage = metadata.tokenUsage;
			if (typeof tokenUsage.promptTokens === "number") inputTokens = tokenUsage.promptTokens;
			if (typeof tokenUsage.completionTokens === "number") outputTokens = tokenUsage.completionTokens;
			if (typeof tokenUsage.totalTokens === "number") totalTokens = tokenUsage.totalTokens;
		}
	}
	return {
		inputTokens,
		outputTokens,
		totalTokens
	};
}
function extractModelMetadata(span, message) {
	const msg = message;
	if (msg.response_metadata && typeof msg.response_metadata === "object") {
		const metadata = msg.response_metadata;
		if (metadata.model_name && typeof metadata.model_name === "string") span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, metadata.model_name);
		if (metadata.finish_reason && typeof metadata.finish_reason === "string") span.setAttribute(GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, [metadata.finish_reason]);
	}
}
function extractToolsFromCompiledGraph(compiledGraph) {
	if (!compiledGraph.builder?.nodes?.tools?.runnable?.tools) return null;
	const tools = compiledGraph.builder?.nodes?.tools?.runnable?.tools;
	if (!tools || !Array.isArray(tools) || tools.length === 0) return null;
	return tools.map((tool) => ({
		name: tool.lc_kwargs?.name,
		description: tool.lc_kwargs?.description,
		schema: tool.lc_kwargs?.schema
	}));
}
function setResponseAttributes(span, inputMessages, result) {
	const outputMessages = result?.messages;
	if (!outputMessages || !Array.isArray(outputMessages)) return;
	const inputCount = inputMessages?.length ?? 0;
	const newMessages = outputMessages.length > inputCount ? outputMessages.slice(inputCount) : [];
	if (newMessages.length === 0) return;
	const toolCalls = extractToolCalls(newMessages);
	if (toolCalls) span.setAttribute(GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, JSON.stringify(toolCalls));
	const normalizedNewMessages = normalizeLangChainMessages(newMessages);
	span.setAttribute(GEN_AI_RESPONSE_TEXT_ATTRIBUTE, JSON.stringify(normalizedNewMessages));
	let totalInputTokens = 0;
	let totalOutputTokens = 0;
	let totalTokens = 0;
	for (const message of newMessages) {
		const tokens = extractTokenUsageFromMessage(message);
		totalInputTokens += tokens.inputTokens;
		totalOutputTokens += tokens.outputTokens;
		totalTokens += tokens.totalTokens;
		extractModelMetadata(span, message);
	}
	if (totalInputTokens > 0) span.setAttribute(GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, totalInputTokens);
	if (totalOutputTokens > 0) span.setAttribute(GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, totalOutputTokens);
	if (totalTokens > 0) span.setAttribute(GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, totalTokens);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/langgraph/index.js
var _insideCreateReactAgent = false;
var SENTRY_PATCHED = "__sentry_patched__";
function _INTERNAL_getLangGraphCreateAgentSpanOptions(agentName) {
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.create_agent",
		[GEN_AI_OPERATION_NAME_ATTRIBUTE]: "create_agent"
	};
	if (agentName) attributes[GEN_AI_AGENT_NAME_ATTRIBUTE] = agentName;
	return {
		op: "gen_ai.create_agent",
		name: agentName ? `create_agent ${agentName}` : "create_agent",
		attributes
	};
}
function instrumentStateGraphCompile(originalCompile, options) {
	if (Object.prototype.hasOwnProperty.call(originalCompile, SENTRY_PATCHED)) return originalCompile;
	const sentryHandler = createLangChainCallbackHandler(options);
	const wrapped = new Proxy(originalCompile, { apply(target, thisArg, args) {
		if (_insideCreateReactAgent) return Reflect.apply(target, thisArg, args);
		return startSpan(_INTERNAL_getLangGraphCreateAgentSpanOptions(), (span) => {
			try {
				const compiledGraph = Reflect.apply(target, thisArg, args);
				const compileOptions = args.length > 0 ? args[0] : {};
				if (compileOptions?.name && typeof compileOptions.name === "string") {
					span.setAttribute(GEN_AI_AGENT_NAME_ATTRIBUTE, compileOptions.name);
					span.updateName(`create_agent ${compileOptions.name}`);
				}
				const originalInvoke = compiledGraph.invoke;
				if (originalInvoke && typeof originalInvoke === "function") compiledGraph.invoke = instrumentCompiledGraphInvoke(originalInvoke.bind(compiledGraph), compiledGraph, compileOptions, options, void 0, sentryHandler);
				return compiledGraph;
			} catch (error) {
				span.setStatus({
					code: 2,
					message: "internal_error"
				});
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.langgraph.error"
				} });
				throw error;
			}
		});
	} });
	Object.defineProperty(wrapped, SENTRY_PATCHED, {
		value: true,
		enumerable: false
	});
	return wrapped;
}
function instrumentCompiledGraphInvoke(originalInvoke, graphInstance, compileOptions, options, llm, sentryCallbackHandler) {
	return new Proxy(originalInvoke, { apply(target, thisArg, args) {
		const modelName = llm?.modelName ?? llm?.model;
		return startSpan({
			op: "gen_ai.invoke_agent",
			name: "invoke_agent",
			attributes: {
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
				[SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE,
				[GEN_AI_OPERATION_NAME_ATTRIBUTE]: "invoke_agent"
			}
		}, async (span) => {
			try {
				const graphName = compileOptions?.name;
				if (graphName && typeof graphName === "string") {
					span.setAttribute(GEN_AI_PIPELINE_NAME_ATTRIBUTE, graphName);
					span.setAttribute(GEN_AI_AGENT_NAME_ATTRIBUTE, graphName);
					span.updateName(`invoke_agent ${graphName}`);
				}
				if (modelName) span.setAttribute(GEN_AI_REQUEST_MODEL_ATTRIBUTE, modelName);
				const threadId = ((args.length > 1 ? args[1] : void 0)?.configurable)?.thread_id;
				if (threadId && typeof threadId === "string") span.setAttribute(GEN_AI_CONVERSATION_ID_ATTRIBUTE, threadId);
				if (sentryCallbackHandler) {
					const invokeConfig = args[1] ?? {};
					args[1] = invokeConfig;
					invokeConfig.metadata = {
						...invokeConfig.metadata ?? {},
						__sentry_langgraph__: true,
						...typeof graphName === "string" ? { lc_agent_name: graphName } : {}
					};
					invokeConfig.callbacks = _INTERNAL_mergeLangChainCallbackHandler(invokeConfig.callbacks, sentryCallbackHandler);
				}
				const tools = extractToolsFromCompiledGraph(graphInstance);
				if (tools) span.setAttribute(GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE, JSON.stringify(tools));
				const recordInputs = options.recordInputs;
				const recordOutputs = options.recordOutputs;
				const inputMessages = args.length > 0 ? args[0]?.messages ?? [] : [];
				if (inputMessages && recordInputs) {
					const { systemInstructions, filteredMessages } = extractSystemInstructions(normalizeLangChainMessages(inputMessages));
					if (systemInstructions) span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
					const enableTruncation = shouldEnableTruncation(options.enableTruncation);
					const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
					span.setAttributes({
						[GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? getTruncatedJsonString(filteredMessages) : stringify(filteredMessages),
						[GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
					});
				}
				const result = await Reflect.apply(target, thisArg, args);
				if (recordOutputs) setResponseAttributes(span, inputMessages ?? null, result);
				return result;
			} catch (error) {
				span.setStatus({
					code: 2,
					message: "internal_error"
				});
				captureException(error, { mechanism: {
					handled: false,
					type: "auto.ai.langgraph.error"
				} });
				throw error;
			}
		});
	} });
}
function instrumentCreateReactAgent(originalCreateReactAgent, options) {
	if (Object.prototype.hasOwnProperty.call(originalCreateReactAgent, SENTRY_PATCHED)) return originalCreateReactAgent;
	const resolvedOptions = resolveAIRecordingOptions(options);
	const sentryHandler = createLangChainCallbackHandler(resolvedOptions);
	const wrapped = new Proxy(originalCreateReactAgent, { apply(target, thisArg, args) {
		const llm = extractLLMFromParams(args);
		const agentName = extractAgentNameFromParams(args);
		const params = args[0];
		if (params && Array.isArray(params.tools) && params.tools.length > 0) wrapToolsWithSpans(params.tools, resolvedOptions, agentName ?? void 0);
		_insideCreateReactAgent = true;
		let compiledGraph;
		try {
			compiledGraph = Reflect.apply(target, thisArg, args);
		} finally {
			_insideCreateReactAgent = false;
		}
		const originalInvoke = compiledGraph.invoke;
		if (originalInvoke && typeof originalInvoke === "function") {
			const compileOptions = {};
			if (agentName) compileOptions.name = agentName;
			compiledGraph.invoke = instrumentCompiledGraphInvoke(originalInvoke.bind(compiledGraph), compiledGraph, compileOptions, resolvedOptions, llm, sentryHandler);
		}
		return compiledGraph;
	} });
	Object.defineProperty(wrapped, SENTRY_PATCHED, {
		value: true,
		enumerable: false
	});
	return wrapped;
}
function instrumentLangGraph(stateGraph, options) {
	stateGraph.compile = instrumentStateGraphCompile(stateGraph.compile, resolveAIRecordingOptions(options));
	return stateGraph;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/spanStreaming.js
var spanStreamingIntegration = defineIntegration(() => {
	return {
		name: "SpanStreaming",
		setup(client) {
			const initialMessage = "SpanStreaming integration requires";
			const fallbackMsg = "Falling back to static trace lifecycle.";
			const clientOptions = client.getOptions();
			if (!hasSpanStreamingEnabled(client)) {
				clientOptions.traceLifecycle = "static";
				DEBUG_BUILD && debug$1.warn(`${initialMessage} \`traceLifecycle\` to be set to "stream"! ${fallbackMsg}`);
				return;
			}
			const beforeSendSpan = clientOptions.beforeSendSpan;
			if (beforeSendSpan && !isStreamedBeforeSendSpanCallback(beforeSendSpan)) {
				clientOptions.traceLifecycle = "static";
				DEBUG_BUILD && debug$1.warn(`${initialMessage} a beforeSendSpan callback using \`withStreamedSpan\`! ${fallbackMsg}`);
				return;
			}
			const buffer = new SpanBuffer(client);
			client.on("afterSpanEnd", (span) => {
				if (!spanIsSampled(span)) return;
				buffer.add(captureSpan(span, client));
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/exports.js
function replaceExports(exports, exportName, wrappedConstructor) {
	const original = exports[exportName];
	if (typeof original !== "function") return;
	try {
		exports[exportName] = wrappedConstructor;
	} catch {
		Object.defineProperty(exports, exportName, {
			value: wrappedConstructor,
			writable: true,
			configurable: true,
			enumerable: true
		});
	}
	if (exports.default === original) try {
		exports.default = wrappedConstructor;
	} catch {
		Object.defineProperty(exports, "default", {
			value: wrappedConstructor,
			writable: true,
			configurable: true,
			enumerable: true
		});
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/lru.js
var LRUMap = class {
	constructor(_maxSize) {
		this._maxSize = _maxSize;
		this._cache = /* @__PURE__ */ new Map();
	}
	/** Get the current size of the cache */
	get size() {
		return this._cache.size;
	}
	/** Get an entry or undefined if it was not in the cache. Re-inserts to update the recently used order */
	get(key) {
		const value = this._cache.get(key);
		if (value === void 0) return;
		this._cache.delete(key);
		this._cache.set(key, value);
		return value;
	}
	/** Insert an entry and evict an older entry if we've reached maxSize */
	set(key, value) {
		if (this._cache.size >= this._maxSize) {
			const nextKey = this._cache.keys().next().value;
			this._cache.delete(nextKey);
		}
		this._cache.set(key, value);
	}
	/** Remove an entry and return the entry if it was in the cache */
	remove(key) {
		const value = this._cache.get(key);
		if (value) this._cache.delete(key);
		return value;
	}
	/** Clear all entries */
	clear() {
		this._cache.clear();
	}
	/** Get all the keys */
	keys() {
		return Array.from(this._cache.keys());
	}
	/** Get all the values */
	values() {
		const values = [];
		this._cache.forEach((value) => values.push(value));
		return values;
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/transports/userAgent.js
function addUserAgentToTransportHeaders(options) {
	const sdkMetadata = options._metadata?.sdk;
	const sdkUserAgent = sdkMetadata?.name && sdkMetadata?.version ? `${sdkMetadata?.name}/${sdkMetadata?.version}` : void 0;
	options.transportOptions = {
		...options.transportOptions,
		headers: {
			...sdkUserAgent && { "user-agent": sdkUserAgent },
			...options.transportOptions?.headers
		}
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/server-runtime-client.js
var ServerRuntimeClient = class extends Client {
	/**
	* Creates a new Edge SDK instance.
	* @param options Configuration options for this SDK.
	*/
	constructor(options) {
		addUserAgentToTransportHeaders(options);
		if (options.traceLifecycle === "stream" && !options.integrations.some((i) => i.name === "SpanStreaming")) options.integrations.push(spanStreamingIntegration());
		super(options);
		this._disposeCallbacks = [];
		this._setUpMetricsProcessing();
	}
	/**
	* @inheritDoc
	*/
	eventFromException(exception, hint) {
		const event = eventFromUnknownInput(this, this._options.stackParser, exception, hint);
		event.level = "error";
		return resolvedSyncPromise(event);
	}
	/**
	* @inheritDoc
	*/
	eventFromMessage(message, level = "info", hint) {
		return resolvedSyncPromise(eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace));
	}
	/**
	* @inheritDoc
	*/
	captureException(exception, hint, scope) {
		setCurrentRequestSessionErroredOrCrashed(hint);
		return super.captureException(exception, hint, scope);
	}
	/**
	* @inheritDoc
	*/
	captureEvent(event, hint, scope) {
		if (!event.type && event.exception?.values && event.exception.values.length > 0) setCurrentRequestSessionErroredOrCrashed(hint);
		return super.captureEvent(event, hint, scope);
	}
	/**
	* Create a cron monitor check in and send it to Sentry.
	*
	* @param checkIn An object that describes a check in.
	* @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
	* to create a monitor automatically when sending a check in.
	*/
	captureCheckIn(checkIn, monitorConfig, scope) {
		const id = "checkInId" in checkIn && checkIn.checkInId ? checkIn.checkInId : uuid4();
		if (!this._isEnabled()) {
			DEBUG_BUILD && debug$1.warn("SDK not enabled, will not capture check-in.");
			return id;
		}
		const { release, environment, tunnel } = this.getOptions();
		const serializedCheckIn = {
			check_in_id: id,
			monitor_slug: checkIn.monitorSlug,
			status: checkIn.status,
			release,
			environment
		};
		if ("duration" in checkIn) serializedCheckIn.duration = checkIn.duration;
		if (monitorConfig) serializedCheckIn.monitor_config = {
			schedule: monitorConfig.schedule,
			checkin_margin: monitorConfig.checkinMargin,
			max_runtime: monitorConfig.maxRuntime,
			timezone: monitorConfig.timezone,
			failure_issue_threshold: monitorConfig.failureIssueThreshold,
			recovery_threshold: monitorConfig.recoveryThreshold
		};
		const [dynamicSamplingContext, traceContext] = _getTraceInfoFromScope(this, scope);
		if (traceContext) serializedCheckIn.contexts = { trace: traceContext };
		const envelope = createCheckInEnvelope(serializedCheckIn, dynamicSamplingContext, this.getSdkMetadata(), tunnel, this.getDsn());
		DEBUG_BUILD && debug$1.log("Sending checkin:", checkIn.monitorSlug, checkIn.status);
		this.sendEnvelope(envelope);
		return id;
	}
	/**
	* @inheritDoc
	*/
	registerCleanup(callback) {
		this._disposeCallbacks.push(callback);
	}
	/**
	* Disposes of the client and releases all resources.
	*
	* This method clears all internal state to allow the client to be garbage collected.
	* It clears hooks, event processors, integrations, transport, and other internal references.
	*
	* Call this method after flushing to allow the client to be garbage collected.
	* After calling dispose(), the client should not be used anymore.
	*
	* Subclasses should override this method to clean up their own resources and call `super.dispose()`.
	*/
	dispose() {
		DEBUG_BUILD && debug$1.log("Disposing client...");
		for (const callback of this._disposeCallbacks) try {
			callback();
		} catch {}
		this._disposeCallbacks.length = 0;
		for (const hookName of Object.keys(this._hooks)) this._hooks[hookName]?.clear();
		this._hooks = {};
		this._eventProcessors.length = 0;
		this._integrations = {};
		this._outcomes = {};
		this._transport = void 0;
		this._promiseBuffer = makePromiseBuffer(64);
	}
	/**
	* @inheritDoc
	*/
	_prepareEvent(event, hint, currentScope, isolationScope) {
		if (this._options.platform) event.platform = event.platform || this._options.platform;
		if (this._options.runtime) event.contexts = {
			...event.contexts,
			runtime: event.contexts?.runtime || this._options.runtime
		};
		if (this._options.serverName) event.server_name = event.server_name || this._options.serverName;
		return super._prepareEvent(event, hint, currentScope, isolationScope);
	}
	/**
	* Process a server-side metric before it is captured.
	*/
	_setUpMetricsProcessing() {
		this.on("processMetric", (metric) => {
			if (this._options.serverName) metric.attributes = {
				"server.address": this._options.serverName,
				...metric.attributes
			};
		});
	}
};
function setCurrentRequestSessionErroredOrCrashed(eventHint) {
	const requestSession = getIsolationScope().getScopeData().sdkProcessingMetadata.requestSession;
	if (requestSession) {
		const isHandledException = eventHint?.mechanism?.handled ?? true;
		if (isHandledException && requestSession.status !== "crashed") requestSession.status = "errored";
		else if (!isHandledException) requestSession.status = "crashed";
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/trpc.js
var trpcCaptureContext = { mechanism: {
	handled: false,
	type: "auto.rpc.trpc.middleware"
} };
function captureIfError(nextResult) {
	if (typeof nextResult === "object" && nextResult !== null && "ok" in nextResult && !nextResult.ok && "error" in nextResult) captureException(nextResult.error, trpcCaptureContext);
}
function trpcMiddleware(options = {}) {
	return async function(opts) {
		const { path, type, next, rawInput, getRawInput } = opts;
		const client = getClient();
		const clientOptions = client?.getOptions();
		const dataCollection = client?.getDataCollectionOptions();
		const trpcContext = {
			procedure_path: path,
			procedure_type: type
		};
		setNormalizationDepthOverrideHint(trpcContext, 1 + (clientOptions?.normalizeDepth ?? 5));
		if (options.attachRpcInput !== void 0 ? options.attachRpcInput : dataCollection?.httpBodies.includes("incomingRequest")) {
			if (rawInput !== void 0) trpcContext.input = normalize(rawInput);
			if (getRawInput !== void 0 && typeof getRawInput === "function") try {
				trpcContext.input = normalize(await getRawInput());
			} catch {}
		}
		return withIsolationScope((scope) => {
			scope.setContext("trpc", trpcContext);
			return startSpanManual({
				name: `trpc/${path}`,
				op: "rpc.server",
				attributes: {
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
					[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.rpc.trpc"
				},
				forceTransaction: !!options.forceTransaction
			}, async (span) => {
				try {
					const nextResult = await next();
					captureIfError(nextResult);
					span.end();
					return nextResult;
				} catch (e) {
					captureException(e, trpcCaptureContext);
					span.end();
					throw e;
				}
			});
		});
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/errorCapture.js
function captureError(error, errorType, extraData) {
	try {
		if (!getClient()) return;
		const activeSpan = getActiveSpan();
		if (activeSpan?.isRecording()) activeSpan.setStatus({
			code: 2,
			message: "internal_error"
		});
		captureException(error, { mechanism: {
			type: "auto.ai.mcp_server",
			handled: false,
			data: {
				error_type: errorType || "handler_execution",
				...extraData
			}
		} });
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/handlers.js
function wrapMethodHandler(serverInstance, methodName) {
	fill(serverInstance, methodName, (originalMethod) => {
		return function(name, ...args) {
			const handler = args[args.length - 1];
			if (typeof handler !== "function") return originalMethod.call(this, name, ...args);
			const wrappedHandler = createWrappedHandler(handler, methodName, name);
			return originalMethod.call(this, name, ...args.slice(0, -1), wrappedHandler);
		};
	});
}
function createWrappedHandler(originalHandler, methodName, handlerName) {
	return function(...handlerArgs) {
		try {
			return createErrorCapturingHandler.call(this, originalHandler, methodName, handlerName, handlerArgs);
		} catch (error) {
			DEBUG_BUILD && debug$1.warn("MCP handler wrapping failed:", error);
			return originalHandler.apply(this, handlerArgs);
		}
	};
}
function createErrorCapturingHandler(originalHandler, methodName, handlerName, handlerArgs) {
	try {
		const result = originalHandler.apply(this, handlerArgs);
		if (isObjectLike(result) && typeof result.then === "function") return Promise.resolve(result).catch((error) => {
			captureHandlerError(error, methodName, handlerName);
			throw error;
		});
		return result;
	} catch (error) {
		captureHandlerError(error, methodName, handlerName);
		throw error;
	}
}
function captureHandlerError(error, methodName, handlerName) {
	try {
		const extraData = {};
		if (methodName === "tool" || methodName === "registerTool") {
			extraData.tool_name = handlerName;
			if (error.name === "ProtocolValidationError" || error.message.includes("validation") || error.message.includes("protocol")) captureError(error, "validation", extraData);
			else if (error.name === "ServerTimeoutError" || error.message.includes("timed out") || error.message.includes("timeout")) captureError(error, "timeout", extraData);
			else captureError(error, "tool_execution", extraData);
		} else if (methodName === "resource" || methodName === "registerResource") {
			extraData.resource_uri = handlerName;
			captureError(error, "resource_execution", extraData);
		} else if (methodName === "prompt" || methodName === "registerPrompt") {
			extraData.prompt_name = handlerName;
			captureError(error, "prompt_execution", extraData);
		}
	} catch (_captureErr) {}
}
function wrapToolHandlers(serverInstance) {
	if (typeof serverInstance.tool === "function") wrapMethodHandler(serverInstance, "tool");
	if (typeof serverInstance.registerTool === "function") wrapMethodHandler(serverInstance, "registerTool");
}
function wrapResourceHandlers(serverInstance) {
	if (typeof serverInstance.resource === "function") wrapMethodHandler(serverInstance, "resource");
	if (typeof serverInstance.registerResource === "function") wrapMethodHandler(serverInstance, "registerResource");
}
function wrapPromptHandlers(serverInstance) {
	if (typeof serverInstance.prompt === "function") wrapMethodHandler(serverInstance, "prompt");
	if (typeof serverInstance.registerPrompt === "function") wrapMethodHandler(serverInstance, "registerPrompt");
}
function wrapAllMCPHandlers(serverInstance) {
	wrapToolHandlers(serverInstance);
	wrapResourceHandlers(serverInstance);
	wrapPromptHandlers(serverInstance);
}
function wrapExistingHandlers(serverInstance) {
	const server = serverInstance;
	const registeredTools = server["_registeredTools"];
	if (isObjectLike(registeredTools)) {
		for (const [name, tool] of Object.entries(registeredTools)) if (typeof tool["executor"] === "function") tool["executor"] = createWrappedHandler(tool["executor"], "registerTool", name);
	}
	const registeredResources = server["_registeredResources"];
	if (isObjectLike(registeredResources)) {
		for (const [name, resource] of Object.entries(registeredResources)) if (typeof resource["readCallback"] === "function") resource["readCallback"] = createWrappedHandler(resource["readCallback"], "registerResource", name);
	}
	const registeredResourceTemplates = server["_registeredResourceTemplates"];
	if (isObjectLike(registeredResourceTemplates)) {
		for (const [name, template] of Object.entries(registeredResourceTemplates)) if (typeof template["readCallback"] === "function") template["readCallback"] = createWrappedHandler(template["readCallback"], "registerResource", name);
	}
	const registeredPrompts = server["_registeredPrompts"];
	if (isObjectLike(registeredPrompts)) {
		for (const [name, prompt] of Object.entries(registeredPrompts)) if (typeof prompt["handler"] === "function") prompt["handler"] = createWrappedHandler(prompt["handler"], "registerPrompt", name);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/attributes.js
var MCP_METHOD_NAME_ATTRIBUTE = "mcp.method.name";
var MCP_TRANSPORT_ATTRIBUTE = "mcp.transport";
var MCP_SERVER_NAME_ATTRIBUTE = "mcp.server.name";
var MCP_SERVER_TITLE_ATTRIBUTE = "mcp.server.title";
var MCP_SERVER_VERSION_ATTRIBUTE = "mcp.server.version";
var MCP_PROTOCOL_VERSION_ATTRIBUTE = "mcp.protocol.version";
var MCP_TOOL_NAME_ATTRIBUTE = "mcp.tool.name";
var MCP_RESOURCE_URI_ATTRIBUTE = "mcp.resource.uri";
var MCP_PROMPT_NAME_ATTRIBUTE = "mcp.prompt.name";
var MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE = "mcp.tool.result.is_error";
var MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE = "mcp.tool.result.content_count";
var MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE = "mcp.prompt.result.description";
var MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE = "mcp.prompt.result.message_count";
var MCP_REQUEST_ARGUMENT = "mcp.request.argument";
var MCP_LOGGING_LEVEL_ATTRIBUTE = "mcp.logging.level";
var MCP_LOGGING_LOGGER_ATTRIBUTE = "mcp.logging.logger";
var MCP_LOGGING_DATA_TYPE_ATTRIBUTE = "mcp.logging.data_type";
var MCP_LOGGING_MESSAGE_ATTRIBUTE = "mcp.logging.message";
var NETWORK_TRANSPORT_ATTRIBUTE = "network.transport";
var NETWORK_PROTOCOL_VERSION_ATTRIBUTE = "network.protocol.version";
var CLIENT_ADDRESS_ATTRIBUTE = "client.address";
var CLIENT_PORT_ATTRIBUTE = "client.port";
var MCP_SERVER_OP_VALUE = "mcp.server";
var MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE = "mcp.notification.client_to_server";
var MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE = "mcp.notification.server_to_client";
var MCP_FUNCTION_ORIGIN_VALUE = "auto.function.mcp_server";
var MCP_NOTIFICATION_ORIGIN_VALUE = "auto.mcp.notification";
var MCP_ROUTE_SOURCE_VALUE = "route";
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/validation.js
function isJsonRpcRequest(message) {
	return isObjectLike(message) && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && "id" in message;
}
function isJsonRpcNotification(message) {
	return isObjectLike(message) && "jsonrpc" in message && message.jsonrpc === "2.0" && "method" in message && !("id" in message);
}
function isJsonRpcResponse(message) {
	return isObjectLike(message) && "jsonrpc" in message && message.jsonrpc === "2.0" && "id" in message && ("result" in message || "error" in message);
}
function validateMcpServerInstance(instance) {
	if (isObjectLike(instance) && "connect" in instance && ("tool" in instance && "resource" in instance && "prompt" in instance || "registerTool" in instance && "registerResource" in instance && "registerPrompt" in instance)) return true;
	DEBUG_BUILD && debug$1.warn("Did not patch MCP server. Interface is incompatible.");
	return false;
}
function isValidContentItem(item) {
	return isObjectLike(item);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/resultExtraction.js
function buildAllContentItemAttributes(content, includeContent) {
	const attributes = { [MCP_TOOL_RESULT_CONTENT_COUNT_ATTRIBUTE]: content.length };
	for (const [i, item] of content.entries()) {
		if (!isValidContentItem(item)) continue;
		const prefix = content.length === 1 ? "mcp.tool.result" : `mcp.tool.result.${i}`;
		if (typeof item.type === "string") attributes[`${prefix}.content_type`] = item.type;
		if (includeContent) {
			const safeSet = (key, value) => {
				if (typeof value === "string") attributes[`${prefix}.${key}`] = value;
			};
			safeSet("mime_type", item.mimeType);
			safeSet("uri", item.uri);
			safeSet("name", item.name);
			if (typeof item.text === "string") attributes[`${prefix}.content`] = item.text;
			if (typeof item.data === "string") attributes[`${prefix}.data_size`] = item.data.length;
			const resource = item.resource;
			if (isValidContentItem(resource)) {
				safeSet("resource_uri", resource.uri);
				safeSet("resource_mime_type", resource.mimeType);
			}
		}
	}
	return attributes;
}
function extractToolResultAttributes(result, recordOutputs) {
	if (!isValidContentItem(result)) return {};
	const attributes = Array.isArray(result.content) ? buildAllContentItemAttributes(result.content, recordOutputs) : {};
	if (typeof result.isError === "boolean") attributes[MCP_TOOL_RESULT_IS_ERROR_ATTRIBUTE] = result.isError;
	return attributes;
}
function extractPromptResultAttributes(result, recordOutputs) {
	const attributes = {};
	if (!isValidContentItem(result)) return attributes;
	if (recordOutputs && typeof result.description === "string") attributes[MCP_PROMPT_RESULT_DESCRIPTION_ATTRIBUTE] = result.description;
	if (Array.isArray(result.messages)) {
		attributes[MCP_PROMPT_RESULT_MESSAGE_COUNT_ATTRIBUTE] = result.messages.length;
		if (recordOutputs) {
			const messages = result.messages;
			for (const [i, message] of messages.entries()) {
				if (!isValidContentItem(message)) continue;
				const prefix = messages.length === 1 ? "mcp.prompt.result" : `mcp.prompt.result.${i}`;
				const safeSet = (key, value) => {
					if (typeof value === "string") {
						const attrName = messages.length === 1 ? `${prefix}.message_${key}` : `${prefix}.${key}`;
						attributes[attrName] = value;
					}
				};
				safeSet("role", message.role);
				if (isValidContentItem(message.content)) {
					const content = message.content;
					if (typeof content.text === "string") {
						const attrName = messages.length === 1 ? `${prefix}.message_content` : `${prefix}.content`;
						attributes[attrName] = content.text;
					}
				}
			}
		}
	}
	return attributes;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/sessionManagement.js
var sessionToSessionData = /* @__PURE__ */ new Map();
var statelessSessionData = /* @__PURE__ */ new WeakMap();
function getSessionData(transport) {
	const sessionId = transport.sessionId;
	if (sessionId) return sessionToSessionData.get(sessionId);
	return statelessSessionData.get(transport);
}
function setSessionData(transport, data) {
	const sessionId = transport.sessionId;
	if (sessionId) sessionToSessionData.set(sessionId, data);
	else statelessSessionData.set(transport, data);
}
function storeSessionDataForTransport(transport, sessionData) {
	setSessionData(transport, sessionData);
}
function updateSessionDataForTransport(transport, partialSessionData) {
	setSessionData(transport, {
		...getSessionData(transport) || {},
		...partialSessionData
	});
}
function getClientInfoForTransport(transport) {
	return getSessionData(transport)?.clientInfo;
}
function getProtocolVersionForTransport(transport) {
	return getSessionData(transport)?.protocolVersion;
}
function getSessionDataForTransport(transport) {
	return getSessionData(transport);
}
function cleanupSessionDataForTransport(transport) {
	const sessionId = transport.sessionId;
	if (sessionId) sessionToSessionData.delete(sessionId);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/sessionExtraction.js
function extractPartyInfo(obj) {
	const partyInfo = {};
	if (isValidContentItem(obj)) {
		if (typeof obj.name === "string") partyInfo.name = obj.name;
		if (typeof obj.title === "string") partyInfo.title = obj.title;
		if (typeof obj.version === "string") partyInfo.version = obj.version;
	}
	return partyInfo;
}
function extractSessionDataFromInitializeRequest(request) {
	const sessionData = {};
	if (isValidContentItem(request.params)) {
		if (typeof request.params.protocolVersion === "string") sessionData.protocolVersion = request.params.protocolVersion;
		if (request.params.clientInfo) sessionData.clientInfo = extractPartyInfo(request.params.clientInfo);
	}
	return sessionData;
}
function extractSessionDataFromInitializeResponse(result) {
	const sessionData = {};
	if (isValidContentItem(result)) {
		if (typeof result.protocolVersion === "string") sessionData.protocolVersion = result.protocolVersion;
		if (result.serverInfo) sessionData.serverInfo = extractPartyInfo(result.serverInfo);
	}
	return sessionData;
}
function getClientAttributes(transport) {
	const clientInfo = getClientInfoForTransport(transport);
	const attributes = {};
	if (clientInfo?.name) attributes["mcp.client.name"] = clientInfo.name;
	if (clientInfo?.title) attributes["mcp.client.title"] = clientInfo.title;
	if (clientInfo?.version) attributes["mcp.client.version"] = clientInfo.version;
	return attributes;
}
function buildClientAttributesFromInfo(clientInfo) {
	const attributes = {};
	if (clientInfo?.name) attributes["mcp.client.name"] = clientInfo.name;
	if (clientInfo?.title) attributes["mcp.client.title"] = clientInfo.title;
	if (clientInfo?.version) attributes["mcp.client.version"] = clientInfo.version;
	return attributes;
}
function getServerAttributes(transport) {
	const serverInfo = getSessionDataForTransport(transport)?.serverInfo;
	const attributes = {};
	if (serverInfo?.name) attributes[MCP_SERVER_NAME_ATTRIBUTE] = serverInfo.name;
	if (serverInfo?.title) attributes[MCP_SERVER_TITLE_ATTRIBUTE] = serverInfo.title;
	if (serverInfo?.version) attributes[MCP_SERVER_VERSION_ATTRIBUTE] = serverInfo.version;
	return attributes;
}
function buildServerAttributesFromInfo(serverInfo) {
	const attributes = {};
	if (serverInfo?.name) attributes[MCP_SERVER_NAME_ATTRIBUTE] = serverInfo.name;
	if (serverInfo?.title) attributes[MCP_SERVER_TITLE_ATTRIBUTE] = serverInfo.title;
	if (serverInfo?.version) attributes[MCP_SERVER_VERSION_ATTRIBUTE] = serverInfo.version;
	return attributes;
}
function extractClientInfo(extra) {
	return {
		address: extra?.requestInfo?.remoteAddress || extra?.clientAddress || extra?.request?.ip || extra?.request?.connection?.remoteAddress,
		port: extra?.requestInfo?.remotePort || extra?.clientPort || extra?.request?.connection?.remotePort
	};
}
function getTransportTypes(transport) {
	if (!transport?.constructor) return {
		mcpTransport: "unknown",
		networkTransport: "unknown"
	};
	const transportName = typeof transport.constructor?.name === "string" ? transport.constructor.name : "unknown";
	let networkTransport = "unknown";
	const lowerTransportName = transportName.toLowerCase();
	if (lowerTransportName.includes("stdio")) networkTransport = "pipe";
	else if (lowerTransportName.includes("http") || lowerTransportName.includes("sse")) networkTransport = "tcp";
	return {
		mcpTransport: transportName,
		networkTransport
	};
}
function buildTransportAttributes(transport, extra) {
	const sessionId = transport && "sessionId" in transport ? transport.sessionId : void 0;
	const clientInfo = extra ? extractClientInfo(extra) : {};
	const { mcpTransport, networkTransport } = getTransportTypes(transport);
	const clientAttributes = getClientAttributes(transport);
	const serverAttributes = getServerAttributes(transport);
	const protocolVersion = getProtocolVersionForTransport(transport);
	return {
		...sessionId && { ["mcp.session.id"]: sessionId },
		...clientInfo.address && { ["client.address"]: clientInfo.address },
		...clientInfo.port && { ["client.port"]: clientInfo.port },
		[MCP_TRANSPORT_ATTRIBUTE]: mcpTransport,
		[NETWORK_TRANSPORT_ATTRIBUTE]: networkTransport,
		[NETWORK_PROTOCOL_VERSION_ATTRIBUTE]: "2.0",
		...protocolVersion && { ["mcp.protocol.version"]: protocolVersion },
		...clientAttributes,
		...serverAttributes
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/correlation.js
var sessionToSpanMap = /* @__PURE__ */ new Map();
var statelessSpanMap = /* @__PURE__ */ new WeakMap();
function getOrCreateSpanMap(transport) {
	const sessionId = transport.sessionId;
	if (sessionId) {
		let spanMap2 = sessionToSpanMap.get(sessionId);
		if (!spanMap2) {
			spanMap2 = /* @__PURE__ */ new Map();
			sessionToSpanMap.set(sessionId, spanMap2);
		}
		return spanMap2;
	}
	let spanMap = statelessSpanMap.get(transport);
	if (!spanMap) {
		spanMap = /* @__PURE__ */ new Map();
		statelessSpanMap.set(transport, spanMap);
	}
	return spanMap;
}
function storeSpanForRequest(transport, requestId, span, method) {
	getOrCreateSpanMap(transport).set(requestId, {
		span,
		method,
		startTime: Date.now()
	});
}
function completeSpanWithResults(transport, requestId, result, options, hasError = false) {
	const spanMap = getOrCreateSpanMap(transport);
	const spanData = spanMap.get(requestId);
	if (spanData) {
		const { span, method } = spanData;
		if (hasError) span.setStatus({
			code: 2,
			message: "internal_error"
		});
		else if (method === "initialize") {
			const sessionData = extractSessionDataFromInitializeResponse(result);
			const initAttributes = { ...buildServerAttributesFromInfo(sessionData.serverInfo) };
			if (sessionData.protocolVersion) initAttributes[MCP_PROTOCOL_VERSION_ATTRIBUTE] = sessionData.protocolVersion;
			span.setAttributes(initAttributes);
		} else if (method === "tools/call") {
			const toolAttributes = extractToolResultAttributes(result, options.recordOutputs);
			span.setAttributes(toolAttributes);
		} else if (method === "prompts/get") {
			const promptAttributes = extractPromptResultAttributes(result, options.recordOutputs);
			span.setAttributes(promptAttributes);
		}
		span.end();
		spanMap.delete(requestId);
	}
}
function cleanupPendingSpansForTransport(transport) {
	const sessionId = transport.sessionId;
	if (sessionId) {
		const spanMap2 = sessionToSpanMap.get(sessionId);
		if (spanMap2) {
			for (const [, spanData] of spanMap2) {
				spanData.span.setStatus({
					code: 2,
					message: "cancelled"
				});
				spanData.span.end();
			}
			sessionToSpanMap.delete(sessionId);
		}
		return;
	}
	const spanMap = statelessSpanMap.get(transport);
	if (spanMap) {
		for (const [, spanData] of spanMap) {
			spanData.span.setStatus({
				code: 2,
				message: "cancelled"
			});
			spanData.span.end();
		}
		spanMap.clear();
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/methodConfig.js
var METHOD_CONFIGS = {
	"tools/call": {
		targetField: "name",
		targetAttribute: MCP_TOOL_NAME_ATTRIBUTE,
		captureArguments: true,
		argumentsField: "arguments"
	},
	"resources/read": {
		targetField: "uri",
		targetAttribute: MCP_RESOURCE_URI_ATTRIBUTE,
		captureUri: true
	},
	"resources/subscribe": {
		targetField: "uri",
		targetAttribute: MCP_RESOURCE_URI_ATTRIBUTE
	},
	"resources/unsubscribe": {
		targetField: "uri",
		targetAttribute: MCP_RESOURCE_URI_ATTRIBUTE
	},
	"prompts/get": {
		targetField: "name",
		targetAttribute: MCP_PROMPT_NAME_ATTRIBUTE,
		captureName: true,
		captureArguments: true,
		argumentsField: "arguments"
	}
};
function extractTargetInfo(method, params) {
	const config = METHOD_CONFIGS[method];
	if (!config) return { attributes: {} };
	const target = config.targetField && typeof params?.[config.targetField] === "string" ? params[config.targetField] : void 0;
	return {
		target,
		attributes: target && config.targetAttribute ? { [config.targetAttribute]: target } : {}
	};
}
function getRequestArguments(method, params) {
	const args = {};
	const config = METHOD_CONFIGS[method];
	if (!config) return args;
	if (config.captureArguments && config.argumentsField && params?.[config.argumentsField]) {
		const argumentsObj = params[config.argumentsField];
		if (isObjectLike(argumentsObj)) for (const [key, value] of Object.entries(argumentsObj)) args[`${MCP_REQUEST_ARGUMENT}.${key.toLowerCase()}`] = JSON.stringify(value);
	}
	if (config.captureUri && params?.uri) args[`${MCP_REQUEST_ARGUMENT}.uri`] = JSON.stringify(params.uri);
	if (config.captureName && params?.name) args[`${MCP_REQUEST_ARGUMENT}.name`] = JSON.stringify(params.name);
	return args;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/attributeExtraction.js
function formatLoggingData(data) {
	return typeof data === "string" ? data : JSON.stringify(data);
}
function getNotificationAttributes(method, params, recordInputs) {
	const attributes = {};
	switch (method) {
		case "notifications/cancelled":
			if (params?.requestId) attributes["mcp.cancelled.request_id"] = String(params.requestId);
			if (params?.reason) attributes["mcp.cancelled.reason"] = String(params.reason);
			break;
		case "notifications/message":
			if (params?.level) attributes[MCP_LOGGING_LEVEL_ATTRIBUTE] = String(params.level);
			if (params?.logger) attributes[MCP_LOGGING_LOGGER_ATTRIBUTE] = String(params.logger);
			if (params?.data !== void 0) {
				attributes[MCP_LOGGING_DATA_TYPE_ATTRIBUTE] = typeof params.data;
				if (recordInputs) attributes[MCP_LOGGING_MESSAGE_ATTRIBUTE] = formatLoggingData(params.data);
			}
			break;
		case "notifications/progress":
			if (params?.progressToken) attributes["mcp.progress.token"] = String(params.progressToken);
			if (typeof params?.progress === "number") attributes["mcp.progress.current"] = params.progress;
			if (typeof params?.total === "number") {
				attributes["mcp.progress.total"] = params.total;
				if (typeof params?.progress === "number") attributes["mcp.progress.percentage"] = params.progress / params.total * 100;
			}
			if (params?.message) attributes["mcp.progress.message"] = String(params.message);
			break;
		case "notifications/resources/updated":
			if (params?.uri) {
				attributes[MCP_RESOURCE_URI_ATTRIBUTE] = String(params.uri);
				const urlObject = parseStringToURLObject(String(params.uri));
				if (urlObject && !isURLObjectRelative(urlObject)) attributes["mcp.resource.protocol"] = urlObject.protocol.replace(":", "");
			}
			break;
		case "notifications/initialized":
			attributes["mcp.lifecycle.phase"] = "initialization_complete";
			attributes["mcp.protocol.ready"] = 1;
			break;
	}
	return attributes;
}
function buildTypeSpecificAttributes(type, message, params, recordInputs) {
	if (type === "request") {
		const request = message;
		const targetInfo = extractTargetInfo(request.method, params || {});
		return {
			...request.id !== void 0 && { ["mcp.request.id"]: String(request.id) },
			...targetInfo.attributes,
			...recordInputs ? getRequestArguments(request.method, params || {}) : {}
		};
	}
	return getNotificationAttributes(message.method, params || {}, recordInputs);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/piiFiltering.js
var NETWORK_PII_ATTRIBUTES = /* @__PURE__ */ new Set([
	CLIENT_ADDRESS_ATTRIBUTE,
	CLIENT_PORT_ATTRIBUTE,
	MCP_RESOURCE_URI_ATTRIBUTE
]);
function isNetworkPiiAttribute(key) {
	return NETWORK_PII_ATTRIBUTES.has(key);
}
function filterMcpPiiFromSpanData(spanData, userInfo) {
	if (userInfo) return spanData;
	return Object.entries(spanData).reduce((acc, [key, value]) => {
		if (!isNetworkPiiAttribute(key)) acc[key] = value;
		return acc;
	}, {});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/spans.js
function createSpanName(method, target) {
	return target ? `${method} ${target}` : method;
}
function buildSentryAttributes(type) {
	let op;
	let origin;
	switch (type) {
		case "request":
			op = MCP_SERVER_OP_VALUE;
			origin = MCP_FUNCTION_ORIGIN_VALUE;
			break;
		case "notification-incoming":
			op = MCP_NOTIFICATION_CLIENT_TO_SERVER_OP_VALUE;
			origin = MCP_NOTIFICATION_ORIGIN_VALUE;
			break;
		case "notification-outgoing":
			op = MCP_NOTIFICATION_SERVER_TO_CLIENT_OP_VALUE;
			origin = MCP_NOTIFICATION_ORIGIN_VALUE;
			break;
	}
	return {
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
		[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: MCP_ROUTE_SOURCE_VALUE
	};
}
function createMcpSpan(config) {
	const { type, message, transport, extra, callback, options } = config;
	const { method } = message;
	const params = message.params;
	let spanName;
	if (type === "request") spanName = createSpanName(method, extractTargetInfo(method, params || {}).target);
	else spanName = method;
	const rawAttributes = {
		...buildTransportAttributes(transport, extra),
		[MCP_METHOD_NAME_ATTRIBUTE]: method,
		...buildTypeSpecificAttributes(type, message, params, options?.recordInputs),
		...buildSentryAttributes(type)
	};
	const client = getClient();
	const attributes = filterMcpPiiFromSpanData(rawAttributes, Boolean(client?.getDataCollectionOptions().userInfo));
	return startSpan({
		name: spanName,
		forceTransaction: true,
		attributes
	}, callback);
}
function createMcpNotificationSpan(jsonRpcMessage, transport, extra, options, callback) {
	return createMcpSpan({
		type: "notification-incoming",
		message: jsonRpcMessage,
		transport,
		extra,
		callback,
		options
	});
}
function createMcpOutgoingNotificationSpan(jsonRpcMessage, transport, options, callback) {
	return createMcpSpan({
		type: "notification-outgoing",
		message: jsonRpcMessage,
		transport,
		options,
		callback
	});
}
function buildMcpServerSpanConfig(jsonRpcMessage, transport, extra, options) {
	const { method } = jsonRpcMessage;
	const params = jsonRpcMessage.params;
	const spanName = createSpanName(method, extractTargetInfo(method, params || {}).target);
	const rawAttributes = {
		...buildTransportAttributes(transport, extra),
		[MCP_METHOD_NAME_ATTRIBUTE]: method,
		...buildTypeSpecificAttributes("request", jsonRpcMessage, params, options?.recordInputs),
		...buildSentryAttributes("request")
	};
	const client = getClient();
	return {
		name: spanName,
		op: MCP_SERVER_OP_VALUE,
		forceTransaction: true,
		attributes: filterMcpPiiFromSpanData(rawAttributes, Boolean(client?.getDataCollectionOptions().userInfo))
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/transport.js
function wrapTransportOnMessage(transport, options) {
	if (transport.onmessage) fill(transport, "onmessage", (originalOnMessage) => {
		return function(message, extra) {
			if (isJsonRpcRequest(message)) {
				const isInitialize = message.method === "initialize";
				let initSessionData;
				if (isInitialize) try {
					initSessionData = extractSessionDataFromInitializeRequest(message);
					storeSessionDataForTransport(transport, initSessionData);
				} catch {}
				return withIsolationScope(getIsolationScope().clone(), () => {
					const span = startInactiveSpan(buildMcpServerSpanConfig(message, transport, extra, options));
					if (isInitialize && initSessionData) span.setAttributes({
						...buildClientAttributesFromInfo(initSessionData.clientInfo),
						...initSessionData.protocolVersion && { ["mcp.protocol.version"]: initSessionData.protocolVersion }
					});
					storeSpanForRequest(transport, message.id, span, message.method);
					return withActiveSpan(span, () => {
						return originalOnMessage.call(this, message, extra);
					});
				});
			}
			if (isJsonRpcNotification(message)) return createMcpNotificationSpan(message, transport, extra, options, () => {
				return originalOnMessage.call(this, message, extra);
			});
			return originalOnMessage.call(this, message, extra);
		};
	});
}
function wrapTransportSend(transport, options) {
	if (transport.send) fill(transport, "send", (originalSend) => {
		return async function(...args) {
			const [message] = args;
			if (isJsonRpcNotification(message)) return createMcpOutgoingNotificationSpan(message, transport, options, () => {
				return originalSend.call(this, ...args);
			});
			if (isJsonRpcResponse(message)) {
				if (message.id !== null && message.id !== void 0) {
					if (message.error) captureJsonRpcErrorResponse(message.error);
					if (isValidContentItem(message.result)) {
						if (message.result.protocolVersion || message.result.serverInfo) try {
							updateSessionDataForTransport(transport, extractSessionDataFromInitializeResponse(message.result));
						} catch {}
					}
					completeSpanWithResults(transport, message.id, message.result, options, !!message.error);
				}
			}
			return originalSend.call(this, ...args);
		};
	});
}
function wrapTransportOnClose(transport) {
	if (transport.onclose) fill(transport, "onclose", (originalOnClose) => {
		return function(...args) {
			cleanupPendingSpansForTransport(transport);
			cleanupSessionDataForTransport(transport);
			return originalOnClose.call(this, ...args);
		};
	});
}
function wrapTransportError(transport) {
	if (transport.onerror) fill(transport, "onerror", (originalOnError) => {
		return function(error) {
			captureTransportError(error);
			return originalOnError.call(this, error);
		};
	});
}
function captureJsonRpcErrorResponse(errorResponse) {
	try {
		if (isObjectLike(errorResponse) && "code" in errorResponse && "message" in errorResponse) {
			const jsonRpcError = errorResponse;
			if (jsonRpcError.code === -32603 || jsonRpcError.code >= -32099 && jsonRpcError.code <= -32e3) {
				const error = new Error(jsonRpcError.message);
				error.name = `JsonRpcError_${jsonRpcError.code}`;
				captureError(error, "protocol");
			}
		}
	} catch {}
}
function captureTransportError(error) {
	try {
		captureError(error, "transport");
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/mcp-server/index.js
var wrappedMcpServerInstances = /* @__PURE__ */ new WeakSet();
function wrapMcpServerWithSentry(mcpServerInstance, options) {
	if (wrappedMcpServerInstances.has(mcpServerInstance)) return mcpServerInstance;
	if (!validateMcpServerInstance(mcpServerInstance)) return mcpServerInstance;
	const serverInstance = mcpServerInstance;
	const genAI = getClient()?.getDataCollectionOptions().genAI;
	const resolvedOptions = {
		recordInputs: options?.recordInputs ?? genAI?.inputs ?? false,
		recordOutputs: options?.recordOutputs ?? genAI?.outputs ?? false
	};
	fill(serverInstance, "connect", (originalConnect) => {
		return async function(transport, ...restArgs) {
			const result = await originalConnect.call(this, transport, ...restArgs);
			wrapTransportOnMessage(transport, resolvedOptions);
			wrapTransportSend(transport, resolvedOptions);
			wrapTransportOnClose(transport);
			wrapTransportError(transport);
			return result;
		};
	});
	wrapAllMCPHandlers(serverInstance);
	wrapExistingHandlers(serverInstance);
	wrappedMcpServerInstances.add(mcpServerInstance);
	return mcpServerInstance;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/node-stack-trace.js
function filenameIsInApp(filename, isNative = false) {
	return !(isNative || filename && !filename.startsWith("/") && !filename.match(/^[A-Z]:/) && !filename.startsWith(".") && !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//)) && filename !== void 0 && !filename.includes("node_modules/");
}
function node(getModule) {
	const FILENAME_MATCH = /^\s*[-]{4,}$/;
	const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;
	const DATA_URI_MATCH = /at (?:async )?(.+?) \(data:(.*?),/;
	return (line) => {
		const dataUriMatch = line.match(DATA_URI_MATCH);
		if (dataUriMatch) return {
			filename: `<data:${dataUriMatch[2]}>`,
			function: dataUriMatch[1]
		};
		const lineMatch = line.match(FULL_MATCH);
		if (lineMatch) {
			let object;
			let method;
			let functionName;
			let typeName;
			let methodName;
			if (lineMatch[1]) {
				functionName = lineMatch[1];
				let methodStart = functionName.lastIndexOf(".");
				if (functionName[methodStart - 1] === ".") methodStart--;
				if (methodStart > 0) {
					object = functionName.slice(0, methodStart);
					method = functionName.slice(methodStart + 1);
					const objectEnd = object.indexOf(".Module");
					if (objectEnd > 0) {
						functionName = functionName.slice(objectEnd + 1);
						object = object.slice(0, objectEnd);
					}
				}
				typeName = void 0;
			}
			if (method) {
				typeName = object;
				methodName = method;
			}
			if (method === "<anonymous>") {
				methodName = void 0;
				functionName = void 0;
			}
			if (functionName === void 0) {
				methodName = methodName || "?";
				functionName = typeName ? `${typeName}.${methodName}` : methodName;
			}
			let filename = normalizeStackTracePath(lineMatch[2]);
			const isNative = lineMatch[5] === "native";
			if (!filename && lineMatch[5] && !isNative) filename = lineMatch[5];
			const maybeDecodedFilename = filename ? _safeDecodeURI(filename) : void 0;
			return {
				filename: maybeDecodedFilename ?? filename,
				module: maybeDecodedFilename && getModule?.(maybeDecodedFilename),
				function: functionName,
				lineno: _parseIntOrUndefined(lineMatch[3]),
				colno: _parseIntOrUndefined(lineMatch[4]),
				in_app: filenameIsInApp(filename || "", isNative)
			};
		}
		if (line.match(FILENAME_MATCH)) return { filename: line };
	};
}
function nodeStackLineParser(getModule) {
	return [90, node(getModule)];
}
function _parseIntOrUndefined(input) {
	return parseInt(input || "", 10) || void 0;
}
function _safeDecodeURI(filename) {
	try {
		return decodeURI(filename);
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/express/request-layer-store.js
var requestLayerStore = /* @__PURE__ */ new WeakMap();
var storeLayer = (req, layer) => {
	const store = requestLayerStore.get(req);
	if (!store) requestLayerStore.set(req, [layer]);
	else store.push(layer);
};
var getStoredLayers = (req) => {
	let store = requestLayerStore.get(req);
	if (!store) {
		store = [];
		requestLayerStore.set(req, store);
	}
	return store;
};
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/express/types.js
var ATTR_EXPRESS_NAME = "express.name";
var ATTR_HTTP_ROUTE = "http.route";
var ATTR_EXPRESS_TYPE = "express.type";
var ExpressLayerType_ROUTER = "router";
var ExpressLayerType_MIDDLEWARE = "middleware";
var ExpressLayerType_REQUEST_HANDLER = "request_handler";
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/express/utils.js
var asErrorAndMessage = (error) => error instanceof Error ? [error, error.message] : [String(error), String(error)];
function isRoutePattern(route) {
	return route.includes(":") || route.includes("*");
}
var getLayerMetadata = (route, layer, layerPath) => {
	if (layer.name === "router") {
		const maybeRouterPath = getRouterPath("", layer);
		const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
		return {
			attributes: {
				[ATTR_EXPRESS_NAME]: extractedRouterPath,
				[ATTR_EXPRESS_TYPE]: ExpressLayerType_ROUTER
			},
			name: `router - ${extractedRouterPath}`
		};
	} else if (layer.name === "bound dispatch" || layer.name === "handle") return {
		attributes: {
			[ATTR_EXPRESS_NAME]: (route || layerPath) ?? "request handler",
			[ATTR_EXPRESS_TYPE]: ExpressLayerType_REQUEST_HANDLER
		},
		name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
	};
	else return {
		attributes: {
			[ATTR_EXPRESS_NAME]: layer.name,
			[ATTR_EXPRESS_TYPE]: ExpressLayerType_MIDDLEWARE
		},
		name: `middleware - ${layer.name}`
	};
};
var getRouterPath = (path, layer) => {
	const stackLayer = Array.isArray(layer.handle?.stack) ? layer.handle?.stack?.[0] : void 0;
	if (stackLayer?.route?.path) return `${path}${stackLayer.route.path}`;
	if (stackLayer && Array.isArray(stackLayer?.handle?.stack)) return getRouterPath(path, stackLayer);
	return path;
};
var isLayerIgnored = (name, type, config) => {
	if (Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type)) return true;
	if (!Array.isArray(config?.ignoreLayers)) return false;
	try {
		return stringMatchesSomePattern(name, config.ignoreLayers, true);
	} catch {}
	return false;
};
function getActualMatchedRoute(req, constructedRoute) {
	const layersStore = getStoredLayers(req);
	if (layersStore.length === 0) return;
	if (layersStore.every((path) => path === "/")) return req.originalUrl === "/" ? "/" : void 0;
	if (constructedRoute === "*") return constructedRoute;
	if (constructedRoute.includes("/") && (constructedRoute.includes(",") || constructedRoute.includes("\\") || constructedRoute.includes("*") || constructedRoute.includes("["))) return constructedRoute;
	const normalizedRoute = constructedRoute.startsWith("/") ? constructedRoute : `/${constructedRoute}`;
	return normalizedRoute.length > 0 && (req.originalUrl === normalizedRoute || req.originalUrl.startsWith(normalizedRoute) || isRoutePattern(normalizedRoute)) ? normalizedRoute : void 0;
}
function getConstructedRoute(req) {
	const layersStore = getStoredLayers(req);
	let constructedRoute = "";
	for (const path of layersStore) {
		if (path === "/" || path === "/*") continue;
		constructedRoute += !constructedRoute || constructedRoute.endsWith("/") ? path : `/${path}`;
	}
	return constructedRoute.replace(/\/{2,}/g, "/");
}
var getLayerPath = (args) => {
	const firstArg = args[0];
	if (Array.isArray(firstArg)) return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
	return extractLayerPathSegment(firstArg);
};
var extractLayerPathSegment = (arg) => typeof arg === "string" ? arg : arg instanceof RegExp || typeof arg === "number" ? String(arg) : void 0;
var isExpressWithRouterPrototype = (express) => isExpressRouterPrototype(express?.Router?.prototype);
var isExpressRouterPrototype = (routerProto) => (typeof routerProto === "object" || typeof routerProto === "function") && !!routerProto && "route" in routerProto && typeof routerProto.route === "function";
var isExpressWithoutRouterPrototype = (express) => isExpressRouterPrototype(express.Router) && !isExpressWithRouterPrototype(express);
function getStatusCodeFromResponse(error) {
	const statusCode = error.status || error.statusCode || error.status_code || error.output?.statusCode;
	return statusCode ? parseInt(statusCode, 10) : 500;
}
function defaultShouldHandleError(error) {
	return getStatusCodeFromResponse(error) >= 500;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/express/set-sdk-processing-metadata.js
function setSDKProcessingMetadata(request) {
	if (!(getIsolationScope()?.getScopeData()?.sdkProcessingMetadata)?.normalizedRequest) {
		const normalizedRequest = httpRequestToRequestData(request);
		getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/express/patch-layer.js
function patchLayer(getOptions, maybeLayer, layerPath) {
	if (!maybeLayer?.handle) return;
	const layer = maybeLayer;
	const layerHandleOriginal = layer.handle;
	if (getOriginalFunction(layerHandleOriginal)) return;
	if (layerHandleOriginal.length === 4) return;
	function layerHandlePatched(req, res, ...otherArgs) {
		const options = getOptions();
		setSDKProcessingMetadata(req);
		const parentSpan = getActiveSpan();
		if (!parentSpan) return layerHandleOriginal.apply(this, [
			req,
			res,
			...otherArgs
		]);
		if (layerPath) storeLayer(req, layerPath);
		const storedLayers = getStoredLayers(req);
		const isLayerPathStored = !!layerPath;
		const constructedRoute = getConstructedRoute(req);
		const actualMatchedRoute = getActualMatchedRoute(req, constructedRoute);
		options.onRouteResolved?.(actualMatchedRoute);
		const metadata = getLayerMetadata(constructedRoute, layer, layerPath);
		const name = metadata.attributes[ATTR_EXPRESS_NAME];
		const type = metadata.attributes[ATTR_EXPRESS_TYPE];
		const attributes = Object.assign(metadata.attributes, {
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.express",
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.express`
		});
		if (actualMatchedRoute) attributes[ATTR_HTTP_ROUTE] = actualMatchedRoute;
		if (isLayerIgnored(metadata.attributes["express.name"], type, options)) {
			if (isLayerPathStored) storedLayers.pop();
			return layerHandleOriginal.apply(this, [
				req,
				res,
				...otherArgs
			]);
		}
		const currentScope = getIsolationScope();
		if (currentScope !== getDefaultIsolationScope()) {
			if (type === "request_handler") {
				const method = req.method ? req.method.toUpperCase() : "GET";
				currentScope.setTransactionName(`${method} ${constructedRoute}`);
			}
		} else DEBUG_BUILD && debug$1.warn("Isolation scope is still default isolation scope - skipping setting transactionName");
		return startSpanManual({
			name,
			attributes
		}, (span) => {
			let spanHasEnded = false;
			if (metadata.attributes["express.type"] === "router") {
				span.end();
				spanHasEnded = true;
			}
			const onResponseFinish = () => {
				if (!spanHasEnded) {
					spanHasEnded = true;
					span.end();
				}
			};
			for (let i = 0; i < otherArgs.length; i++) {
				const callback = otherArgs[i];
				if (typeof callback !== "function") continue;
				otherArgs[i] = function(...args) {
					const maybeError = args[0];
					const isError = !!maybeError && maybeError !== "route" && maybeError !== "router";
					if (!spanHasEnded && isError) {
						const [_, message] = asErrorAndMessage(maybeError);
						span.setStatus({
							code: 2,
							message
						});
					}
					if (!spanHasEnded) {
						spanHasEnded = true;
						res.removeListener("finish", onResponseFinish);
						span.end();
					}
					if (!(req.route && isError) && isLayerPathStored) storedLayers.pop();
					return withActiveSpan(parentSpan, () => callback.apply(this, args));
				};
				break;
			}
			try {
				return layerHandleOriginal.apply(this, [
					req,
					res,
					...otherArgs
				]);
			} catch (anyError) {
				const [_, message] = asErrorAndMessage(anyError);
				span.setStatus({
					code: 2,
					message
				});
				throw anyError;
			} finally {
				if (!spanHasEnded) res.once("finish", onResponseFinish);
			}
		});
	}
	for (const key in layerHandleOriginal) {
		if (key in layerHandlePatched) continue;
		Object.defineProperty(layerHandlePatched, key, {
			get() {
				return layerHandleOriginal[key];
			},
			set(value) {
				layerHandleOriginal[key] = value;
			}
		});
	}
	markFunctionWrapped(layerHandlePatched, layerHandleOriginal);
	Object.defineProperty(layer, "handle", {
		enumerable: true,
		configurable: true,
		writable: true,
		value: layerHandlePatched
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/get-default-export.js
function getDefaultExport(moduleExport) {
	return !!moduleExport && typeof moduleExport === "object" && "default" in moduleExport && moduleExport.default || moduleExport;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/express/index.js
function isLegacyOptions(options) {
	return !!options.express;
}
var didLegacyDeprecationWarning = false;
function deprecationWarning() {
	if (!didLegacyDeprecationWarning) {
		didLegacyDeprecationWarning = true;
		DEBUG_BUILD && debug$1.warn("[Express] `patchExpressModule(options)` is deprecated. Use `patchExpressModule(moduleExports, getOptions)` instead.");
	}
}
function patchExpressModule(optionsOrExports, maybeGetOptions) {
	let getOptions;
	let moduleExports;
	if (!maybeGetOptions && isLegacyOptions(optionsOrExports)) {
		const { express: express2, ...options } = optionsOrExports;
		moduleExports = express2;
		getOptions = () => options;
		deprecationWarning();
	} else if (typeof maybeGetOptions !== "function") throw new TypeError("`patchExpressModule(moduleExports, getOptions)` requires a `getOptions` callback");
	else {
		getOptions = maybeGetOptions;
		moduleExports = optionsOrExports;
	}
	const express = getDefaultExport(moduleExports);
	const routerProto = isExpressWithRouterPrototype(express) ? express.Router.prototype : isExpressWithoutRouterPrototype(express) ? express.Router : void 0;
	if (!routerProto) throw new TypeError("no valid Express route function to instrument");
	const originalRouteMethod = routerProto.route;
	try {
		wrapMethod(routerProto, "route", function routeTrace(...args) {
			const route = originalRouteMethod.apply(this, args);
			const layer = this.stack[this.stack.length - 1];
			patchLayer(getOptions, layer, getLayerPath(args));
			return route;
		});
	} catch (e) {
		DEBUG_BUILD && debug$1.error("Failed to patch express route method:", e);
	}
	const originalRouterUse = routerProto.use;
	try {
		wrapMethod(routerProto, "use", function useTrace(...args) {
			const route = originalRouterUse.apply(this, args);
			const layer = this.stack[this.stack.length - 1];
			if (!layer) return route;
			patchLayer(getOptions, layer, getLayerPath(args));
			return route;
		});
	} catch (e) {
		DEBUG_BUILD && debug$1.error("Failed to patch express use method:", e);
	}
	const { application } = express;
	const originalApplicationUse = application.use;
	try {
		wrapMethod(application, "use", function appUseTrace(...args) {
			const route = originalApplicationUse.apply(this, args);
			const router = isExpressWithRouterPrototype(express) ? this.router : this._router;
			if (router) {
				const layer = router.stack[router.stack.length - 1];
				if (layer) patchLayer(getOptions, layer, getLayerPath(args));
			}
			return route;
		});
	} catch (e) {
		DEBUG_BUILD && debug$1.error("Failed to patch express application.use method:", e);
	}
	return express;
}
function expressErrorHandler(options) {
	return function sentryErrorMiddleware(error, request, res, next) {
		setSDKProcessingMetadata(request);
		if ((options?.shouldHandleError || defaultShouldHandleError)(error)) res.sentry = captureException(error, { mechanism: {
			type: "auto.middleware.express",
			handled: false
		} });
		next(error);
	};
}
function setupExpressErrorHandler(app, options) {
	app.use(expressRequestHandler());
	app.use(expressErrorHandler(options));
}
function expressRequestHandler() {
	return function sentryRequestMiddleware(request, _res, next) {
		setSDKProcessingMetadata(request);
		next();
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/postgresjs.js
var SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
var CONNECTION_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol("sentryPostgresConnectionContext");
var INSTRUMENTED_MARKER = /* @__PURE__ */ Symbol.for("sentry.instrumented.postgresjs");
var QUERY_FROM_INSTRUMENTED_SQL = /* @__PURE__ */ Symbol.for("sentry.query.from.instrumented.sql");
function instrumentPostgresJsSql(sql, options) {
	if (!sql || typeof sql !== "function") {
		DEBUG_BUILD && debug$1.warn("instrumentPostgresJsSql: provided value is not a valid postgres.js sql instance");
		return sql;
	}
	return _instrumentSqlInstance(sql, {
		requireParentSpan: true,
		...options
	});
}
function _instrumentSqlInstance(sql, options, parentConnectionContext) {
	if (sql[INSTRUMENTED_MARKER]) return sql;
	const proxiedSql = new Proxy(sql, {
		apply(target, thisArg, argumentsList) {
			const query = Reflect.apply(target, thisArg, argumentsList);
			if (isObjectLike(query) && "handle" in query) _wrapSingleQueryHandle(query, proxiedSql, options);
			return query;
		},
		get(target, prop) {
			const original = target[prop];
			if (typeof prop !== "string" || typeof original !== "function") return original;
			if (prop === "unsafe" || prop === "file") return _wrapQueryMethod(original, target, proxiedSql, options);
			if (prop === "begin" || prop === "reserve") return _wrapCallbackMethod(original, target, proxiedSql, options);
			return original;
		}
	});
	if (parentConnectionContext) proxiedSql[CONNECTION_CONTEXT_SYMBOL] = parentConnectionContext;
	else _attachConnectionContext(sql, proxiedSql);
	sql[INSTRUMENTED_MARKER] = true;
	proxiedSql[INSTRUMENTED_MARKER] = true;
	return proxiedSql;
}
function _wrapQueryMethod(original, target, proxiedSql, options) {
	return function(...args) {
		const query = Reflect.apply(original, target, args);
		if (isObjectLike(query) && "handle" in query) _wrapSingleQueryHandle(query, proxiedSql, options);
		return query;
	};
}
function _wrapCallbackMethod(original, target, parentSqlInstance, options) {
	return function(...args) {
		const parentContext = parentSqlInstance[CONNECTION_CONTEXT_SYMBOL];
		if (!(typeof args[args.length - 1] === "function")) {
			const result = Reflect.apply(original, target, args);
			if (result && typeof result.then === "function") return result.then((sqlInstance) => {
				return _instrumentSqlInstance(sqlInstance, options, parentContext);
			});
			return result;
		}
		const callback = args.length === 1 ? args[0] : args[1];
		const wrappedCallback = function(sqlInstance) {
			const instrumentedSql = _instrumentSqlInstance(sqlInstance, options, parentContext);
			return callback(instrumentedSql);
		};
		const newArgs = args.length === 1 ? [wrappedCallback] : [args[0], wrappedCallback];
		return Reflect.apply(original, target, newArgs);
	};
}
function _wrapSingleQueryHandle(query, sqlInstance, options) {
	if (query.handle?.__sentryWrapped) return;
	query[QUERY_FROM_INSTRUMENTED_SQL] = true;
	const originalHandle = query.handle;
	const wrappedHandle = async function(...args) {
		if (this.executed || !_shouldCreateSpans(options)) return originalHandle.apply(this, args);
		const sanitizedSqlQuery = _sanitizeSqlQuery(_reconstructQuery(query.strings));
		return startSpanManual({
			name: sanitizedSqlQuery || "postgresjs.query",
			op: "db"
		}, (span) => {
			span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.postgresjs");
			span.setAttributes({
				"db.system.name": "postgres",
				"db.query.text": sanitizedSqlQuery
			});
			const connectionContext = sqlInstance ? sqlInstance[CONNECTION_CONTEXT_SYMBOL] : void 0;
			_setConnectionAttributes(span, connectionContext);
			if (options.requestHook) try {
				options.requestHook(span, sanitizedSqlQuery, connectionContext);
			} catch (e) {
				span.setAttribute("sentry.hook.error", "requestHook failed");
				DEBUG_BUILD && debug$1.error("Error in requestHook for PostgresJs instrumentation:", e);
			}
			const queryWithCallbacks = this;
			queryWithCallbacks.resolve = new Proxy(queryWithCallbacks.resolve, { apply: (resolveTarget, resolveThisArg, resolveArgs) => {
				try {
					_setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
					span.end();
				} catch (e) {
					DEBUG_BUILD && debug$1.error("Error ending span in resolve callback:", e);
				}
				return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
			} });
			queryWithCallbacks.reject = new Proxy(queryWithCallbacks.reject, { apply: (rejectTarget, rejectThisArg, rejectArgs) => {
				try {
					span.setStatus({
						code: 2,
						message: rejectArgs?.[0]?.message || "unknown_error"
					});
					span.setAttribute("db.response.status_code", rejectArgs?.[0]?.code || "unknown");
					span.setAttribute("error.type", rejectArgs?.[0]?.name || "unknown");
					_setOperationName(span, sanitizedSqlQuery);
					span.end();
				} catch (e) {
					DEBUG_BUILD && debug$1.error("Error ending span in reject callback:", e);
				}
				return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
			} });
			try {
				return originalHandle.apply(this, args);
			} catch (e) {
				span.setStatus({
					code: 2,
					message: e instanceof Error ? e.message : "unknown_error"
				});
				span.end();
				throw e;
			}
		});
	};
	wrappedHandle.__sentryWrapped = true;
	query.handle = wrappedHandle;
}
function _shouldCreateSpans(options) {
	return getActiveSpan() !== void 0 || !options.requireParentSpan;
}
function _reconstructQuery(strings) {
	if (!strings?.length) return;
	if (strings.length === 1) return strings[0] || void 0;
	return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
}
var integerLiteralRE;
function _sanitizeSqlQuery(sqlQuery) {
	if (!sqlQuery) return "Unknown SQL Query";
	if (!integerLiteralRE) integerLiteralRE = /* @__PURE__ */ new RegExp("(?<!\\$)-?\\b\\d+\\b", "g");
	return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(integerLiteralRE, "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
}
function _setConnectionAttributes(span, connectionContext) {
	if (!connectionContext) return;
	if (connectionContext.ATTR_DB_NAMESPACE) span.setAttribute("db.namespace", connectionContext.ATTR_DB_NAMESPACE);
	if (connectionContext.ATTR_SERVER_ADDRESS) span.setAttribute("server.address", connectionContext.ATTR_SERVER_ADDRESS);
	if (connectionContext.ATTR_SERVER_PORT !== void 0) {
		const portNumber = parseInt(connectionContext.ATTR_SERVER_PORT, 10);
		if (!isNaN(portNumber)) span.setAttribute("server.port", portNumber);
	}
}
function _setOperationName(span, sanitizedQuery, command) {
	if (command) {
		span.setAttribute("db.operation.name", command);
		return;
	}
	const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
	if (operationMatch?.[1]) span.setAttribute("db.operation.name", operationMatch[1].toUpperCase());
}
function _buildConnectionContext(options) {
	const host = options.host?.[0] || "localhost";
	const port = options.port?.[0] || 5432;
	return {
		ATTR_DB_NAMESPACE: typeof options.database === "string" && options.database !== "" ? options.database : void 0,
		ATTR_SERVER_ADDRESS: host,
		ATTR_SERVER_PORT: String(port)
	};
}
function _attachConnectionContext(sql, proxiedSql) {
	const sqlInstance = sql;
	if (!sqlInstance.options || typeof sqlInstance.options !== "object") return;
	proxiedSql[CONNECTION_CONTEXT_SYMBOL] = _buildConnectionContext(sqlInstance.options);
}
var HTTP_ON_CLIENT_REQUEST = "http.client.request.created";
var HTTP_ON_SERVER_REQUEST = "http.server.request.start";
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/get-request-url.js
function getRequestOptions(request) {
	const hostWithPort = request.host || "";
	const portInHost = /^(.*):(\d+)$/.exec(hostWithPort);
	const hostname = portInHost ? portInHost[1] : hostWithPort;
	const port = request.port ?? (portInHost ? Number(portInHost[2]) : void 0);
	return {
		method: request.method,
		port,
		protocol: request.protocol,
		host: request.host,
		hostname,
		path: request.path,
		headers: request.getHeaders()
	};
}
function getRequestUrl(requestOptions) {
	try {
		return String(getRequestUrlObject(requestOptions));
	} catch {
		return "";
	}
}
function getRequestUrlObject(requestOptions) {
	const protocol = requestOptions.protocol || "http:";
	const hostname = requestOptions.headers?.host && String(requestOptions.headers?.host) || requestOptions.hostname || requestOptions.host || "";
	const port = !requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`;
	const path = requestOptions.path ? requestOptions.path : "/";
	const base = `${protocol}//${hostname}${port}`;
	return new URL(path.startsWith("//") ? `${base}${path}` : path, base);
}
function getRequestUrlFromClientRequest(request) {
	return String(getRequestUrl(getRequestOptions(request)));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/add-outgoing-request-breadcrumb.js
function addOutgoingRequestBreadcrumb(request, response) {
	const parsedUrl = parseUrl(getRequestUrlFromClientRequest(request));
	const statusCode = response?.statusCode;
	const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
	addBreadcrumb({
		category: "http",
		data: {
			status_code: statusCode,
			url: getSanitizedUrlString(parsedUrl),
			"http.method": request.method || "GET",
			...parsedUrl.search ? { "http.query": parsedUrl.search } : {},
			...parsedUrl.hash ? { "http.fragment": parsedUrl.hash } : {}
		},
		type: "http",
		level
	}, {
		event: "response",
		request,
		response
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/get-outgoing-span-data.js
function getOutgoingRequestSpanData(request) {
	const url = getRequestUrlFromClientRequest(request);
	const [name, attributes] = getHttpSpanDetailsFromUrlObject(parseStringToURLObject(url), "client", "auto.http.client", request);
	const userAgent = request.getHeader("user-agent");
	return {
		name,
		attributes: {
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client",
			"otel.kind": "CLIENT",
			"http.url": url,
			"http.method": request.method,
			"http.target": request.path || "/",
			"net.peer.name": request.host,
			"http.host": request.getHeader("host"),
			...userAgent ? { "user_agent.original": userAgent } : {},
			...attributes
		},
		onlyIfParent: true
	};
}
function setIncomingResponseSpanData(response, span) {
	const { statusCode, statusMessage, httpVersion, socket } = response;
	const transport = httpVersion?.toUpperCase() !== "QUIC" ? "ip_tcp" : "ip_udp";
	span.setAttributes({
		"http.response.status_code": statusCode,
		"network.protocol.version": httpVersion,
		"http.flavor": httpVersion,
		"network.transport": transport,
		"net.transport": transport,
		"http.status_text": statusMessage?.toUpperCase(),
		"http.status_code": statusCode,
		...getResponseContentLengthAttributes(response),
		...getSocketAttrs(socket)
	});
}
function getSocketAttrs(socket) {
	if (!socket) return {};
	const { remoteAddress, remotePort } = socket;
	return {
		"network.peer.address": remoteAddress,
		"network.peer.port": remotePort,
		"net.peer.ip": remoteAddress,
		"net.peer.port": remotePort
	};
}
function getResponseContentLengthAttributes(response) {
	const { headers } = response;
	const contentLengthHeader = headers["content-length"];
	const length = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : -1;
	const encoding = headers["content-encoding"];
	return length >= 0 ? encoding && encoding !== "identity" ? { "http.response_content_length": length } : { "http.response_content_length_uncompressed": length } : {};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/inject-trace-propagation-headers.js
function injectTracePropagationHeaders(request, propagationDecisionMap) {
	const url = getRequestUrlFromClientRequest(request);
	const { tracePropagationTargets, propagateTraceparent } = getClient()?.getOptions() ?? {};
	if (!shouldPropagateTraceForUrl(url, tracePropagationTargets, propagationDecisionMap)) return;
	if (!!request.getHeader("sentry-trace")) return;
	const traceData = getTraceData({ propagateTraceparent });
	if (!traceData) return;
	const { "sentry-trace": sentryTrace, baggage, traceparent } = traceData;
	if (sentryTrace) try {
		request.setHeader("sentry-trace", sentryTrace);
		DEBUG_BUILD && debug$1.log("@sentry/instrumentation-http", "Added sentry-trace header");
	} catch (e) {
		DEBUG_BUILD && debug$1.error("@sentry/instrumentation-http", "Failed to set sentry-trace header:", isError(e) ? e.message : "Unknown error");
	}
	if (traceparent && !request.getHeader("traceparent")) try {
		request.setHeader("traceparent", traceparent);
		DEBUG_BUILD && debug$1.log("@sentry/instrumentation-http", "Added traceparent header");
	} catch (e) {
		DEBUG_BUILD && debug$1.error("@sentry/instrumentation-http", "Failed to set traceparent header:", isError(e) ? e.message : "Unknown error");
	}
	if (baggage) {
		const merged = mergeBaggageHeaders(request.getHeader("baggage"), baggage);
		if (merged) try {
			request.setHeader("baggage", merged);
			DEBUG_BUILD && debug$1.log("@sentry/instrumentation-http", "Added baggage header");
		} catch (e) {
			DEBUG_BUILD && debug$1.error("@sentry/instrumentation-http", "Failed to set baggage header:", isError(e) ? e.message : "Unknown error");
		}
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/double-wrap-warning.js
var isOtelWrapped = (fn) => typeof fn.__unwrap === "function";
var warning = "Double-wrapped http.client detected. Either disable spans in Sentry.httpIntegration, or disable the OpenTelemetry HTTP instrumentation. See: https://docs.sentry.io/platforms/javascript/guides/express/opentelemetry/custom-setup/#custom-http-instrumentation";
var didDoubleWrapWarning = false;
var doubleWrapWarning = DEBUG_BUILD ? (http) => {
	if (!didDoubleWrapWarning) {
		if (isOtelWrapped(http.request) || isOtelWrapped(http.get)) {
			didDoubleWrapWarning = true;
			debug$1.warn(warning);
		}
	}
} : () => {};
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/client-subscriptions.js
function getHttpClientSubscriptions(options) {
	const propagationDecisionMap = new LRUMap(100);
	const getConfig = () => getClient()?.getOptions();
	const onHttpClientRequestCreated = (data) => {
		if (getCurrentScope().getScopeData().sdkProcessingMetadata["__SENTRY_SUPPRESS_TRACING__"] === true) return;
		const clientOptions = getConfig();
		const { errorMonitor = "error", spans: createSpans = clientOptions ? hasSpansEnabled(clientOptions) : true, propagateTrace = false, breadcrumbs = true, http, https, suppressOtelWarning = false } = options;
		const { request } = data;
		if (options.ignoreOutgoingRequests?.(getRequestUrlFromClientRequest(request), request)) return;
		let addedBreadcrumbs = false;
		function addBreadcrumbs(request2, response) {
			if (!addedBreadcrumbs) {
				addedBreadcrumbs = true;
				addOutgoingRequestBreadcrumb(request2, response);
			}
		}
		function breadcrumbsOnly(request2) {
			request2.on(errorMonitor, () => addBreadcrumbs(request2, void 0));
			request2.prependListener("response", (response) => {
				if (request2.listenerCount("response") <= 1) response.resume();
				response.on("end", () => addBreadcrumbs(request2, response));
				response.on(errorMonitor, () => addBreadcrumbs(request2, response));
			});
		}
		if (!createSpans) {
			if (breadcrumbs) breadcrumbsOnly(request);
			if (propagateTrace) injectTracePropagationHeaders(request, propagationDecisionMap);
			return;
		}
		if (!suppressOtelWarning) {
			if (http) doubleWrapWarning(http);
			if (https) doubleWrapWarning(https);
		}
		const span = startInactiveSpan(getOutgoingRequestSpanData(request));
		options.outgoingRequestHook?.(span, request);
		if (propagateTrace) if (span.isRecording()) withActiveSpan(span, () => {
			injectTracePropagationHeaders(request, propagationDecisionMap);
		});
		else injectTracePropagationHeaders(request, propagationDecisionMap);
		let spanEnded = false;
		function endSpan(status) {
			if (!spanEnded) {
				spanEnded = true;
				span.setStatus(status);
				span.end();
			}
		}
		const requestOnClose = () => endSpan({ code: 0 });
		request.on("close", requestOnClose);
		request.on(errorMonitor, (error) => {
			DEBUG_BUILD && debug$1.log("@sentry/instrumentation-http", "outgoingRequest on request error()", error);
			if (breadcrumbs) addBreadcrumbs(request, void 0);
			endSpan({ code: 2 });
		});
		request.prependListener("response", (response) => {
			request.removeListener("close", requestOnClose);
			if (request.listenerCount("response") <= 1) response.resume();
			setIncomingResponseSpanData(response, span);
			bindScopeToEmitter(response);
			options.outgoingResponseHook?.(span, response);
			let finished = false;
			function finishWithResponse(error) {
				if (!finished) {
					finished = true;
					if (error) DEBUG_BUILD && debug$1.log("@sentry/instrumentation-http", "outgoingRequest on response error()", error);
					if (breadcrumbs) addBreadcrumbs(request, response);
					const aborted = response.aborted && !response.complete;
					const status = error || typeof response.statusCode !== "number" || aborted ? { code: 2 } : getSpanStatusFromHttpCode(response.statusCode);
					options.applyCustomAttributesOnSpan?.(span, request, response);
					endSpan(status);
				}
			}
			response.on("end", () => finishWithResponse());
			response.on(errorMonitor, finishWithResponse);
		});
	};
	return { [HTTP_ON_CLIENT_REQUEST]: onHttpClientRequestCreated };
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/client-patch.js
var onHttpClientRequestCreated;
function patchClientRequest(httpModule, options) {
	const proto = httpModule.ClientRequest?.prototype;
	if (typeof proto?._storeHeader !== "function") return;
	onHttpClientRequestCreated = getHttpClientSubscriptions({
		...options,
		http: httpModule
	})[HTTP_ON_CLIENT_REQUEST];
	if (getOriginalFunction(proto._storeHeader)) return;
	const originalStoreHeader = proto._storeHeader;
	wrapMethod(proto, "_storeHeader", function patchedStoreHeader(...args) {
		try {
			onHttpClientRequestCreated({ request: this }, HTTP_ON_CLIENT_REQUEST);
		} catch {}
		return originalStoreHeader.apply(this, args);
	});
}
function patchModule(httpModuleExport, options = {}) {
	patchClientRequest(getDefaultExport(httpModuleExport), options);
	return httpModuleExport;
}
var patchHttpModuleClient = (httpModuleExport, options = {}) => patchModule(httpModuleExport, options);
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/patch-request-to-capture-body.js
function patchRequestToCaptureBody(req, isolationScope, maxIncomingRequestBodySize, integrationName) {
	let bodyByteLength = 0;
	const chunks = [];
	DEBUG_BUILD && debug$1.log(integrationName, "Patching request.on");
	const callbackMap = /* @__PURE__ */ new WeakMap();
	const maxBodySize = getMaxBodyByteLength(maxIncomingRequestBodySize);
	try {
		req.on = req.addListener = new Proxy(req.on, { apply: (target, thisArg, args) => {
			const [event, listener, ...restArgs] = args;
			if (event === "data") {
				DEBUG_BUILD && debug$1.log(integrationName, `Handling request.on("data") with maximum body size of ${maxBodySize}b`);
				const callback = new Proxy(listener, { apply: (target2, thisArg2, args2) => {
					try {
						const chunk = args2[0];
						const bufferifiedChunk = Buffer.from(chunk);
						if (bodyByteLength < maxBodySize) {
							chunks.push(bufferifiedChunk);
							bodyByteLength += bufferifiedChunk.byteLength;
						} else if (DEBUG_BUILD) debug$1.log(integrationName, `Dropping request body chunk because maximum body length of ${maxBodySize}b is exceeded.`);
					} catch (_err) {
						DEBUG_BUILD && debug$1.error(integrationName, "Encountered error while storing body chunk.");
					}
					return Reflect.apply(target2, thisArg2, args2);
				} });
				callbackMap.set(listener, callback);
				return Reflect.apply(target, thisArg, [
					event,
					callback,
					...restArgs
				]);
			}
			return Reflect.apply(target, thisArg, args);
		} });
		req.off = req.removeListener = new Proxy(req.off, { apply: (target, thisArg, args) => {
			const [, listener] = args;
			const callback = callbackMap.get(listener);
			if (callback) {
				callbackMap.delete(listener);
				const modifiedArgs = args.slice();
				modifiedArgs[1] = callback;
				return Reflect.apply(target, thisArg, modifiedArgs);
			}
			return Reflect.apply(target, thisArg, args);
		} });
		req.on("end", () => {
			try {
				const body = Buffer.concat(chunks).toString("utf-8");
				if (body) {
					const truncatedBody = Buffer.byteLength(body, "utf-8") > maxBodySize ? `${Buffer.from(body).subarray(0, maxBodySize - 3).toString("utf-8")}...` : body;
					isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
				}
			} catch (error) {
				if (DEBUG_BUILD) debug$1.error(integrationName, "Error building captured request body", error);
			}
		});
	} catch (error) {
		if (DEBUG_BUILD) debug$1.error(integrationName, "Error patching request to capture body", error);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/record-request-session.js
var clientToRequestSessionAggregatesMap = /* @__PURE__ */ new WeakMap();
function recordRequestSession(client, { requestIsolationScope, response, sessionFlushingDelayMS }) {
	requestIsolationScope.setSDKProcessingMetadata({ requestSession: { status: "ok" } });
	response.once("close", () => {
		const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
		if (client && requestSession) {
			DEBUG_BUILD && debug$1.log(`Recorded request session with status: ${requestSession.status}`);
			const roundedDate = new Date(safeDateNow());
			roundedDate.setSeconds(0, 0);
			const dateBucketKey = roundedDate.toISOString();
			const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
			const bucket = existingClientAggregate?.[dateBucketKey] || {
				exited: 0,
				crashed: 0,
				errored: 0
			};
			bucket[{
				ok: "exited",
				crashed: "crashed",
				errored: "errored"
			}[requestSession.status]]++;
			if (existingClientAggregate) existingClientAggregate[dateBucketKey] = bucket;
			else {
				DEBUG_BUILD && debug$1.log("Opened new request session aggregate.");
				const newClientAggregate = { [dateBucketKey]: bucket };
				clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
				const flushPendingClientAggregates = () => {
					clearTimeout(timeout);
					unregisterClientFlushHook();
					clientToRequestSessionAggregatesMap.delete(client);
					const aggregatePayload = Object.entries(newClientAggregate).map(([timestamp, value]) => ({
						started: timestamp,
						exited: value.exited,
						errored: value.errored,
						crashed: value.crashed
					}));
					client.sendSession({ aggregates: aggregatePayload });
				};
				const unregisterClientFlushHook = client.on("flush", () => {
					DEBUG_BUILD && debug$1.log("Sending request session aggregate due to client flush");
					flushPendingClientAggregates();
				});
				const timeout = setTimeout(() => {
					DEBUG_BUILD && debug$1.log("Sending request session aggregate due to flushing schedule");
					flushPendingClientAggregates();
				}, sessionFlushingDelayMS);
				safeUnref(timeout);
			}
		}
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/http/server-subscription.js
var INTEGRATION_NAME = "Http.Server";
var SPANS_INTEGRATION_NAME = "Http.SentryServerSpans";
var lastSentryEmitMap = /* @__PURE__ */ new WeakMap();
var kRequestMark = /* @__PURE__ */ Symbol.for("sentry_http_server_instrumented");
function markRequest(request) {
	return !request[kRequestMark] && (request[kRequestMark] = true);
}
function instrumentServer(options, server) {
	const currentEmit = server.emit;
	if (currentEmit === lastSentryEmitMap.get(server)) return;
	const newEmit = new Proxy(currentEmit, { apply(target, thisArg, args) {
		const [event, ...data] = args;
		if (event !== "request") return target.apply(thisArg, args);
		const client = getClient();
		const [request, response] = data;
		if (!client || !markRequest(request)) return target.apply(thisArg, args);
		DEBUG_BUILD && debug$1.log(INTEGRATION_NAME, "Handling incoming request");
		const isolationScope = getIsolationScope().clone();
		isolationScope.setClient(client);
		const ipAddress = request.socket?.remoteAddress;
		const url = request.url || "/";
		const normalizedRequest = httpRequestToRequestData(request);
		const { maxRequestBodySize = "medium", ignoreRequestBody, sessions = true, sessionFlushingDelayMS = 6e4 } = options;
		if (maxRequestBodySize !== "none" && !ignoreRequestBody?.(url, request)) patchRequestToCaptureBody(request, isolationScope, maxRequestBodySize, INTEGRATION_NAME);
		isolationScope.setSDKProcessingMetadata({
			normalizedRequest,
			ipAddress
		});
		const bestEffortTransactionName = `${(request.method || "GET").toUpperCase()} ${stripUrlQueryAndFragment(url)}`;
		isolationScope.setTransactionName(bestEffortTransactionName);
		if (sessions) recordRequestSession(client, {
			requestIsolationScope: isolationScope,
			response,
			sessionFlushingDelayMS: sessionFlushingDelayMS ?? 6e4
		});
		return withIsolationScope(isolationScope, () => {
			const sentryTrace = normalizedRequest.headers?.["sentry-trace"];
			const baggage = normalizedRequest.headers?.["baggage"];
			const sentryTraceValue = Array.isArray(sentryTrace) ? sentryTrace[0] : sentryTrace;
			return continueTrace({
				sentryTrace: sentryTraceValue,
				baggage: Array.isArray(baggage) ? baggage[0] : baggage
			}, () => {
				const propagationContext = getCurrentScope().getPropagationContext();
				propagationContext.propagationSpanId = generateSpanId();
				if (!sentryTraceValue) {
					propagationContext.traceId = generateTraceId();
					propagationContext.sampleRand = safeMathRandom();
				}
				response.once("close", () => {
					isolationScope.setContext("response", { status_code: response.statusCode });
				});
				const wrap = options.wrapServerEmitRequest;
				let emitResult = false;
				if (wrap) wrap(request, response, normalizedRequest, () => {
					emitResult = target.apply(thisArg, args);
				});
				else emitResult = target.apply(thisArg, args);
				return emitResult;
			});
		});
	} });
	lastSentryEmitMap.set(server, newEmit);
	server.emit = newEmit;
}
function getHttpServerSubscriptions(options) {
	const userWrap = options.wrapServerEmitRequest;
	const spanWrap = buildServerSpanWrap(options);
	const effectiveOptions = {
		...options,
		wrapServerEmitRequest(request, response, normalizedRequest, next) {
			const clientOptions = getClient()?.getOptions();
			if (options.spans ?? (clientOptions ? hasSpansEnabled(clientOptions) : false)) spanWrap(request, response, normalizedRequest, next);
			else if (userWrap) userWrap(request, response, normalizedRequest, next);
			else next();
		}
	};
	const onHttpServerRequest = (data) => {
		const { server } = data;
		instrumentServer(effectiveOptions, server);
	};
	return { [HTTP_ON_SERVER_REQUEST]: onHttpServerRequest };
}
function buildServerSpanWrap(options) {
	const { wrapServerEmitRequest: userWrap, ignoreIncomingRequests, ignoreStaticAssets = true, onSpanCreated, errorMonitor = "error", onSpanEnd } = options;
	return (request, response, normalizedRequest, next) => {
		if (typeof __SENTRY_TRACING__ !== "undefined" && !__SENTRY_TRACING__) return next();
		return userWrap ? userWrap(request, response, normalizedRequest, createSpan) : createSpan();
		function createSpan() {
			const client = getIsolationScope().getClient();
			if (!client) return next();
			if (shouldIgnoreSpansForIncomingRequest(request, {
				ignoreStaticAssets,
				ignoreIncomingRequests
			})) {
				DEBUG_BUILD && debug$1.log(SPANS_INTEGRATION_NAME, "Skipping span creation for incoming request", request.url);
				return next();
			}
			const fullUrl = normalizedRequest.url || request.url || "/";
			const urlObj = parseStringToURLObject(fullUrl);
			const httpTargetWithoutQueryFragment = urlObj ? urlObj.pathname : stripUrlQueryAndFragment(fullUrl);
			const method = (request.method || "GET").toUpperCase();
			const name = `${method} ${httpTargetWithoutQueryFragment}`;
			const headers = request.headers;
			const userAgent = headers["user-agent"];
			const ips = headers["x-forwarded-for"];
			const httpVersion = request.httpVersion;
			const host = headers.host;
			const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
			const scheme = fullUrl.startsWith("https") ? "https" : "http";
			const { socket } = request;
			const { localAddress, localPort, remoteAddress, remotePort } = socket ?? {};
			return startSpanManual({
				name,
				kind: SPAN_KIND.SERVER,
				attributes: {
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.server",
					[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.server",
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
					"http.route": httpTargetWithoutQueryFragment,
					"otel.kind": "SERVER",
					"net.host.ip": localAddress,
					"net.host.port": localPort,
					"net.peer.ip": remoteAddress,
					"net.peer.port": remotePort,
					"sentry.http.prefetch": isKnownPrefetchRequest(request) || void 0,
					"http.url": fullUrl,
					"http.method": method,
					"http.target": urlObj ? `${urlObj.pathname}${urlObj.search}` : httpTargetWithoutQueryFragment,
					"http.host": host,
					"net.host.name": hostname,
					"http.client_ip": typeof ips === "string" ? ips.split(",")[0] : void 0,
					"http.user_agent": userAgent,
					"http.scheme": scheme,
					"http.flavor": httpVersion,
					"net.transport": httpVersion?.toUpperCase() === "QUIC" ? "ip_udp" : "ip_tcp",
					...getRequestContentLengthAttribute(request),
					...httpHeadersToSpanAttributes(normalizedRequest.headers || {}, client.getDataCollectionOptions())
				}
			}, (span) => {
				onSpanCreated?.(span, request, response);
				let isEnded = false;
				function endSpan(status) {
					if (isEnded) return;
					isEnded = true;
					span.setAttributes({
						"http.status_text": response.statusMessage?.toUpperCase(),
						"http.response.status_code": response.statusCode,
						"http.status_code": response.statusCode,
						...httpHeadersToSpanAttributes(headersToDict(response.headers), client?.getDataCollectionOptions() ?? false, "response")
					});
					span.setStatus(status);
					onSpanEnd?.(span, request, response);
					span.end();
				}
				response.once("close", () => {
					endSpan(getSpanStatusFromHttpCode(response.statusCode));
				});
				response.once(errorMonitor, () => {
					const httpStatus = getSpanStatusFromHttpCode(response.statusCode);
					endSpan(httpStatus.code === 2 ? httpStatus : { code: 2 });
				});
				next();
			});
		}
	};
}
function shouldIgnoreSpansForIncomingRequest(request, { ignoreStaticAssets, ignoreIncomingRequests }) {
	const urlPath = request.url;
	const method = request.method?.toUpperCase();
	if (method === "OPTIONS" || method === "HEAD" || !urlPath) return true;
	if (ignoreStaticAssets && method === "GET" && isStaticAssetRequest(urlPath)) return true;
	if (ignoreIncomingRequests?.(urlPath, request)) return true;
	return false;
}
function isStaticAssetRequest(urlPath) {
	const path = stripUrlQueryAndFragment(urlPath);
	if (path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webp|avif)$/)) return true;
	if (path.match(/^\/(robots\.txt|sitemap\.xml|manifest\.json|browserconfig\.xml)$/)) return true;
	return false;
}
function isKnownPrefetchRequest(req) {
	return req.headers["next-router-prefetch"] === "1";
}
function getRequestContentLengthAttribute(request) {
	const { headers } = request;
	const contentLengthHeader = headers["content-length"];
	const length = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : -1;
	const encoding = headers["content-encoding"];
	return length >= 0 ? encoding && encoding !== "identity" ? { "http.request_content_length": length } : { "http.request_content_length_uncompressed": length } : {};
}
//#endregion
export { instrumentOpenAiClient as $, extractLLMFromParams as A, SPAN_KIND as At, extractRequestAttributes as B, envToBool as Bt, spanStreamingIntegration as C, rewriteFramesIntegration as Ct, instrumentLangGraph as D, requestDataIntegration as Dt, instrumentCreateReactAgent as E, captureConsoleIntegration as Et, createLangChainCallbackHandler as F, uniq as Ft, addResponseAttributes$1 as G, makeMultiplexedTransport as Gt, instrumentStream as H, _INTERNAL_shouldSkipAiProviderWrapping as Ht, _INTERNAL_mergeLangChainCallbackHandler as I, getTraceMetaTags as It, instrumentAsyncIterableStream as J, _INTERNAL_setDeferSegmentSpanCapture as Jt, extractRequestAttributes$1 as K, waitForTracingChannelBinding as Kt, LANGCHAIN_INTEGRATION_NAME as L, shouldPropagateTraceForUrl as Lt, LANGGRAPH_INTEGRATION_NAME as M, httpHeadersToSpanAttributes as Mt, _INTERNAL_getLangChainEmbeddingsSpanOptions as N, httpRequestToRequestData as Nt, instrumentStateGraphCompile as O, moduleMetadataIntegration as Ot, instrumentLangChainEmbeddings as P, winterCGHeadersToDict as Pt, extractRequestAttributes$2 as Q, addPrivateRequestAttributes as R, fmt as Rt, replaceExports as S, supabaseIntegration as St, instrumentCompiledGraphInvoke as T, extraErrorDataIntegration as Tt, GOOGLE_GENAI_INTEGRATION_NAME as U, _INTERNAL_skipAiProviderWrapping as Ut, instrumentGoogleGenAIClient as V, _INTERNAL_clearAiProviderSkips as Vt, addPrivateRequestAttributes$1 as W, MULTIPLEXED_TRANSPORT_EXTRA_KEY as Wt, ANTHROPIC_AI_INTEGRATION_NAME as X, instrumentMessageStream as Y, debounce as Yt, addRequestAttributes as Z, nodeStackLineParser as _, featureFlagsIntegration as _t, getRequestUrlFromClientRequest as a, _INTERNAL_cleanupToolCallSpanContext as at, ServerRuntimeClient as b, zodErrorsIntegration as bt, _buildConnectionContext as c, resolveAIRecordingOptions as ct, _setConnectionAttributes as d, GEN_AI_REQUEST_MODEL_ATTRIBUTE as dt, instrumentStream$1 as et, _setOperationName as f, GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE as ft, setupExpressErrorHandler as g, profiler as gt, patchExpressModule as h, public_api_exports as ht, getRequestOptions as i, getProviderMetadataAttributes as it, wrapToolsWithSpans as j, spanKindToName as jt, extractAgentNameFromParams as k, linkedErrorsIntegration as kt, _reconstructQuery as l, shouldEnableTruncation as lt, expressErrorHandler as m, consoleLoggingIntegration as mt, patchHttpModuleClient as n, OPENAI_INTEGRATION_NAME as nt, HTTP_ON_CLIENT_REQUEST as o, _INTERNAL_getSpanContextForToolCallId as ot, instrumentPostgresJsSql as p, createConsolaReporter as pt, instrumentAnthropicAiClient as q, bindScopeToEmitter as qt, getHttpClientSubscriptions as r, addVercelAiProcessors as rt, HTTP_ON_SERVER_REQUEST as s, getTruncatedJsonString as st, getHttpServerSubscriptions as t, addResponseAttributes$2 as tt, _sanitizeSqlQuery as u, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE as ut, wrapMcpServerWithSentry as v, consoleIntegration as vt, _INTERNAL_getLangGraphCreateAgentSpanOptions as w, dirname as wt, LRUMap as x, instrumentSupabaseClient as xt, trpcMiddleware as y, thirdPartyErrorFilterIntegration as yt, addResponseAttributes as z, parameterize as zt };
