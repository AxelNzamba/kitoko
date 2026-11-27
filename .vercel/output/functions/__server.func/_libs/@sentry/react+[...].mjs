import { o as __toESM, r as __exportAll } from "../../_runtime.mjs";
import { u as require_react } from "../@floating-ui/react-dom+[...].mjs";
import { $ as getBodyString, $a as getSpanDescendants, A as showReportDialog, An as endSession, B as browserSessionIntegration, Bn as setExtras, Bo as getCurrentScope, Bs as SDK_VERSION, C as defaultRequestInstrumentationOptions, Ca as startSpanManual, Cn as addEventProcessor, Ct as sendFeedback, D as contextLinesIntegration, Dn as captureMessage, Do as setHttpStatus, Dt as captureFeedback, E as graphqlClientIntegration, En as captureException, Eo as getSpanStatusFromHttpCode, Er as Jl, Es as isPlainObject, F as normalizeStringifyValue$1, Fa as createEnvelope, Fi as ju, Fn as setAttribute, Fo as SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, G as defaultStackLineParsers, Go as withScope, Gt as getTraceData, H as breadcrumbsIntegration, Hn as setTags, Ho as getIsolationScope, Ht as inboundFiltersIntegration, I as linkedErrorsIntegration, Ia as createEventEnvelopeHeaders, In as setAttributes, Io as SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, Is as consoleSandbox, J as opera10StackLineParser, Ja as registerSpanErrorInstrumentation, K as defaultStackParser, Kn as prepareEvent, Kt as applySdkMetadata, L as httpContextIntegration, Ln as setContext, Ls as debug$1, M as getDefaultIntegrations, Mn as isEnabled, N as init$1, Nn as isInitialized, No as SEMANTIC_ATTRIBUTE_SENTRY_OP, Nt as dedupeIntegration, O as httpClientIntegration, On as captureSession, Os as isThenable, P as onLoad, Pn as lastEventId, Po as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, Pt as severityLevelFromString, Q as makeFetchTransport, Qa as getRootSpan, R as globalHandlersIntegration, Ra as getSdkMetadataForEnvelopeHeader, Rn as setConversationId, S as fetchStreamPerformanceIntegration, Sa as startSpan, St as getFeedback, T as viewHierarchyIntegration, Ta as withActiveSpan, Tn as captureEvent, Ts as isObjectLike, U as createUserFeedbackEnvelope, Ua as getDynamicSamplingContextFromSpan, Un as setUser, Ut as functionToStringIntegration, V as browserApiErrorsIntegration, Va as withStreamedSpan, Vn as setTag, Vo as getGlobalScope, Vs as GLOBAL_OBJ, Vt as eventFiltersIntegration, W as chromeStackLineParser, Wa as spanToBaggageHeader, Wn as startSession, Wo as withIsolationScope, Wt as addBreadcrumb, X as winjsStackLineParser, Xn as safeSetSpanJSONAttributes, Xo as Scope, Y as opera11StackLineParser, Z as uiProfiler, Za as getActiveSpan, _ as browserTracingIntegration, _a as continueTrace, _n as addIntegration, _t as exceptionFromError, a as growthbookIntegration, ai as Vu, at as addHistoryInstrumentationHandler, b as startBrowserTracingPageLoadSpan, ba as startInactiveSpan, bs as fill, bt as lazyLoadIntegration, c as openFeatureIntegration, cn as createTransport, ct as htmlTreeAsString, d as spotlightBrowserIntegration, dt as addLcpInstrumentationHandler, et as getFetchRequestArgBody, f as browserProfilingIntegration, fo as parseSampleRate, fr as Fu, ft as addPerformanceInstrumentationHandler, g as reportPageLoaded, gi as Yu, gt as eventFromMessage, h as setActiveSpanInBrowser, hn as isBrowser, hs as setNormalizationDepthOverrideHint, ht as eventFromException, i as statsigIntegration, io as spanToJSON, it as setTimeout$3, j as forceLoad, ja as setMeasurement, jn as flush, k as reportingObserverIntegration, kn as close, l as buildLaunchDarklyFlagUsedHandler, ln as isRateLimited, lt as addClsInstrumentationHandler, m as spanStreamingIntegration, ms as setNormalizeStringifier, mt as BrowserClient, n as webWorkerIntegration, ns as browserPerformanceTimeOrigin, nt as serializeFormData, o as unleashIntegration, oo as spanToTraceHeader, os as uuid4, ot as addClickKeypressInstrumentationHandler, p as makeBrowserOfflineTransport, ps as normalize, q as geckoStackLineParser, qt as isSentryRequestUrl, r as diagnoseSdkConnectivity, rn as setCurrentClient, rs as timestampInSeconds, rt as SENTRY_XHR_DATA_KEY, s as OpenFeatureIntegrationHook, so as updateSpanName, t as registerWebWorker, tt as parseXhrResponseHeaders, u as launchDarklyIntegration, un as updateRateLimits, us as stringMatchesSomePattern, ut as addInpInstrumentationHandler, v as isBotUserAgent, vn as defineIntegration, vt as feedbackSyncIntegration, w as instrumentOutgoingRequests, wa as suppressTracing, ws as isError, wt as getLocationHref, x as webVitalsIntegration, xa as startNewTrace, xt as WINDOW$1, y as startBrowserTracingNavigationSpan, ys as addNonEnumerableProperty, yt as feedbackAsyncIntegration, z as cultureContextIntegration, zn as setExtra, zo as getClient } from "./browser+[...].mjs";
import { $ as instrumentOpenAiClient, Ct as rewriteFramesIntegration, D as instrumentLangGraph, E as instrumentCreateReactAgent, Et as captureConsoleIntegration, F as createLangChainCallbackHandler, Gt as makeMultiplexedTransport, Ot as moduleMetadataIntegration, P as instrumentLangChainEmbeddings, St as supabaseIntegration, Tt as extraErrorDataIntegration, V as instrumentGoogleGenAIClient, Wt as MULTIPLEXED_TRANSPORT_EXTRA_KEY, Yt as debounce$1, _t as featureFlagsIntegration, bt as zodErrorsIntegration, ht as public_api_exports, mt as consoleLoggingIntegration, pt as createConsolaReporter, q as instrumentAnthropicAiClient, qt as bindScopeToEmitter, xt as instrumentSupabaseClient, yt as thirdPartyErrorFilterIntegration, zt as parameterize } from "../sentry__core.mjs";
import { a as public_api_exports$1, n as elementTimingIntegration, t as getAbsoluteUrl } from "./browser-utils+[...].mjs";
//#region node_modules/@sentry/replay/build/npm/esm/index.js
var WINDOW = GLOBAL_OBJ;
var REPLAY_SESSION_KEY = "sentryReplaySession";
var REPLAY_EVENT_NAME = "replay_event";
var UNABLE_TO_SEND_REPLAY = "Unable to send Replay";
var SESSION_IDLE_PAUSE_DURATION = 3e5;
var SESSION_IDLE_EXPIRE_DURATION = 9e5;
var DEFAULT_FLUSH_MIN_DELAY = 5e3;
var DEFAULT_FLUSH_MAX_DELAY = 5500;
var BUFFER_CHECKOUT_TIME = 6e4;
var RETRY_BASE_INTERVAL = 5e3;
var RETRY_MAX_COUNT = 3;
var NETWORK_BODY_MAX_SIZE = 15e4;
var CONSOLE_ARG_MAX_SIZE = 5e3;
var SLOW_CLICK_THRESHOLD = 3e3;
var SLOW_CLICK_SCROLL_TIMEOUT = 300;
var REPLAY_MAX_EVENT_BUFFER_SIZE = 2e7;
var MIN_REPLAY_DURATION = 4999;
var MIN_REPLAY_DURATION_LIMIT = 5e4;
var MAX_REPLAY_DURATION = 36e5;
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var NodeType$1 = /* @__PURE__ */ ((NodeType2) => {
	NodeType2[NodeType2["Document"] = 0] = "Document";
	NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
	NodeType2[NodeType2["Element"] = 2] = "Element";
	NodeType2[NodeType2["Text"] = 3] = "Text";
	NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
	NodeType2[NodeType2["Comment"] = 5] = "Comment";
	return NodeType2;
})(NodeType$1 || {});
function isElement$1(n) {
	return n.nodeType === n.ELEMENT_NODE;
}
function isShadowRoot(n) {
	const host = n?.host;
	return Boolean(host?.shadowRoot === n);
}
function isNativeShadowDom(shadowRoot) {
	return Object.prototype.toString.call(shadowRoot) === "[object ShadowRoot]";
}
function fixBrowserCompatibilityIssuesInCSS(cssText) {
	if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) cssText = cssText.replace(/\sbackground-clip:\s*text;/g, " -webkit-background-clip: text; background-clip: text;");
	return cssText;
}
function escapeImportStatement(rule) {
	const { cssText } = rule;
	if (cssText.split("\"").length < 3) return cssText;
	const statement = ["@import", `url(${JSON.stringify(rule.href)})`];
	if (rule.layerName === "") statement.push(`layer`);
	else if (rule.layerName) statement.push(`layer(${rule.layerName})`);
	if (rule.supportsText) statement.push(`supports(${rule.supportsText})`);
	if (rule.media.length) statement.push(rule.media.mediaText);
	return statement.join(" ") + ";";
}
function stringifyStylesheet(s) {
	try {
		const rules = s.rules || s.cssRules;
		return rules ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules, stringifyRule).join("")) : null;
	} catch (error) {
		return null;
	}
}
function fixAllCssProperty(rule) {
	let styles = "";
	for (let i2 = 0; i2 < rule.style.length; i2++) {
		const styleDeclaration = rule.style;
		const attribute = styleDeclaration[i2];
		const isImportant = styleDeclaration.getPropertyPriority(attribute);
		styles += `${attribute}:${styleDeclaration.getPropertyValue(attribute)}${isImportant ? ` !important` : ""};`;
	}
	return `${rule.selectorText} { ${styles} }`;
}
function stringifyRule(rule) {
	let importStringified;
	if (isCSSImportRule(rule)) try {
		importStringified = stringifyStylesheet(rule.styleSheet) || escapeImportStatement(rule);
	} catch (error) {}
	else if (isCSSStyleRule(rule)) {
		let cssText = rule.cssText;
		const needsSafariColonFix = rule.selectorText.includes(":");
		const needsAllFix = typeof rule.style["all"] === "string" && rule.style["all"];
		if (needsAllFix) cssText = fixAllCssProperty(rule);
		if (needsSafariColonFix) cssText = fixSafariColons(cssText);
		if (needsSafariColonFix || needsAllFix) return cssText;
	}
	return importStringified || rule.cssText;
}
function fixSafariColons(cssStringified) {
	return cssStringified.replace(/(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm, "$1\\$2");
}
function isCSSImportRule(rule) {
	return "styleSheet" in rule;
}
function isCSSStyleRule(rule) {
	return "selectorText" in rule;
}
var Mirror$1 = class {
	constructor() {
		__publicField$1(this, "idNodeMap", /* @__PURE__ */ new Map());
		__publicField$1(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
	}
	getId(n) {
		if (!n) return -1;
		return this.getMeta(n)?.id ?? -1;
	}
	getNode(id) {
		return this.idNodeMap.get(id) || null;
	}
	getIds() {
		return Array.from(this.idNodeMap.keys());
	}
	getMeta(n) {
		return this.nodeMetaMap.get(n) || null;
	}
	removeNodeFromMap(n) {
		const id = this.getId(n);
		this.idNodeMap.delete(id);
		if (n.childNodes) n.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
	}
	has(id) {
		return this.idNodeMap.has(id);
	}
	hasNode(node) {
		return this.nodeMetaMap.has(node);
	}
	add(n, meta) {
		const id = meta.id;
		this.idNodeMap.set(id, n);
		this.nodeMetaMap.set(n, meta);
	}
	replace(id, n) {
		const oldNode = this.getNode(id);
		if (oldNode) {
			const meta = this.nodeMetaMap.get(oldNode);
			if (meta) this.nodeMetaMap.set(n, meta);
		}
		this.idNodeMap.set(id, n);
	}
	reset() {
		this.idNodeMap = /* @__PURE__ */ new Map();
		this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
	}
};
function createMirror$1() {
	return new Mirror$1();
}
function shouldMaskInput({ maskInputOptions, tagName, type }) {
	if (tagName === "OPTION") tagName = "SELECT";
	return Boolean(maskInputOptions[tagName.toLowerCase()] || type && maskInputOptions[type] || type === "password" || tagName === "INPUT" && !type && maskInputOptions["text"]);
}
function maskInputValue({ isMasked, element, value, maskInputFn }) {
	let text = value || "";
	if (!isMasked) return text;
	if (maskInputFn) text = maskInputFn(text, element);
	return "*".repeat(text.length);
}
function toLowerCase(str) {
	return str.toLowerCase();
}
function toUpperCase(str) {
	return str.toUpperCase();
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(canvas) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return true;
	const chunkSize = 50;
	for (let x = 0; x < canvas.width; x += chunkSize) for (let y = 0; y < canvas.height; y += chunkSize) {
		const getImageData = ctx.getImageData;
		const originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
		if (new Uint32Array(originalGetImageData.call(ctx, x, y, Math.min(chunkSize, canvas.width - x), Math.min(chunkSize, canvas.height - y)).data.buffer).some((pixel) => pixel !== 0)) return false;
	}
	return true;
}
function getInputType(element) {
	const type = element.type;
	return element.hasAttribute("data-rr-is-password") ? "password" : type ? toLowerCase(type) : null;
}
function getInputValue(el, tagName, type) {
	if (tagName === "INPUT" && (type === "radio" || type === "checkbox")) return el.getAttribute("value") || "";
	return el.value;
}
function extractFileExtension(path, baseURL) {
	let url;
	try {
		url = new URL(path, baseURL ?? window.location.href);
	} catch (err) {
		return null;
	}
	return url.pathname.match(/\.([0-9a-z]+)(?:$)/i)?.[1] ?? null;
}
var cachedImplementations$1 = {};
function getImplementation$1(name) {
	const cached = cachedImplementations$1[name];
	if (cached) return cached;
	const document2 = window.document;
	let impl = window[name];
	if (document2 && typeof document2.createElement === "function") try {
		const sandbox = document2.createElement("iframe");
		sandbox.hidden = true;
		document2.head.appendChild(sandbox);
		const contentWindow = sandbox.contentWindow;
		if (contentWindow && contentWindow[name]) impl = contentWindow[name];
		document2.head.removeChild(sandbox);
	} catch (e) {}
	return cachedImplementations$1[name] = impl.bind(window);
}
function setTimeout$1$1(...rest) {
	return getImplementation$1("setTimeout")(...rest);
}
function clearTimeout$1(...rest) {
	return getImplementation$1("clearTimeout")(...rest);
}
function getIFrameContentDocument$1(iframe) {
	try {
		return iframe.contentDocument;
	} catch {}
}
function getIFrameContentWindow$1(iframe) {
	try {
		return iframe.contentWindow;
	} catch {}
}
var _id = 1;
var tagNameRegex = /* @__PURE__ */ new RegExp("[^a-z0-9-_:]");
var IGNORED_NODE = -2;
function genId() {
	return _id++;
}
function getValidTagName(element) {
	if (element instanceof HTMLFormElement) return "form";
	const processedTagName = toLowerCase(element.tagName);
	if (tagNameRegex.test(processedTagName)) return "div";
	return processedTagName;
}
function extractOrigin(url) {
	let origin = "";
	if (url.indexOf("//") > -1) origin = url.split("/").slice(0, 3).join("/");
	else origin = url.split("/")[0];
	origin = origin.split("?")[0];
	return origin;
}
var canvasService;
var canvasCtx;
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
var URL_WWW_MATCH = /^www\..*/i;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function filterCSSPropertiesFromInlineStyle(cssText, ignoredProperties) {
	if (!cssText || ignoredProperties.size === 0) return cssText;
	try {
		const properties = cssText.split(";");
		const filteredProperties = [];
		for (let property of properties) {
			property = property.trim();
			if (!property) continue;
			const colonIndex = property.indexOf(":");
			if (colonIndex === -1) {
				filteredProperties.push(property);
				continue;
			}
			const propertyName = property.slice(0, colonIndex).trim();
			if (!ignoredProperties.has(propertyName)) filteredProperties.push(property);
		}
		return filteredProperties.join("; ") + (filteredProperties.length > 0 && cssText.endsWith(";") ? ";" : "");
	} catch (error) {
		console.warn("Error filtering CSS properties:", error);
		return cssText;
	}
}
function absoluteToStylesheet(cssText, href) {
	return (cssText || "").replace(URL_IN_CSS_REF, (origin, quote1, path1, quote2, path2, path3) => {
		const filePath = path1 || path2 || path3;
		const maybeQuote = quote1 || quote2 || "";
		if (!filePath) return origin;
		if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) return `url(${maybeQuote}${filePath}${maybeQuote})`;
		if (DATA_URI.test(filePath)) return `url(${maybeQuote}${filePath}${maybeQuote})`;
		if (filePath[0] === "/") return `url(${maybeQuote}${extractOrigin(href) + filePath}${maybeQuote})`;
		const stack = href.split("/");
		const parts = filePath.split("/");
		stack.pop();
		for (const part of parts) if (part === ".") continue;
		else if (part === "..") stack.pop();
		else stack.push(part);
		return `url(${maybeQuote}${stack.join("/")}${maybeQuote})`;
	});
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
	if (attributeValue.trim() === "") return attributeValue;
	let pos = 0;
	function collectCharacters(regEx) {
		let chars2;
		const match = regEx.exec(attributeValue.substring(pos));
		if (match) {
			chars2 = match[0];
			pos += chars2.length;
			return chars2;
		}
		return "";
	}
	const output = [];
	while (true) {
		collectCharacters(SRCSET_COMMAS_OR_SPACES);
		if (pos >= attributeValue.length) break;
		let url = collectCharacters(SRCSET_NOT_SPACES);
		if (url.slice(-1) === ",") {
			url = absoluteToDoc(doc, url.substring(0, url.length - 1));
			output.push(url);
		} else {
			let descriptorsStr = "";
			url = absoluteToDoc(doc, url);
			let inParens = false;
			while (true) {
				const c = attributeValue.charAt(pos);
				if (c === "") {
					output.push((url + descriptorsStr).trim());
					break;
				} else if (!inParens) {
					if (c === ",") {
						pos += 1;
						output.push((url + descriptorsStr).trim());
						break;
					} else if (c === "(") inParens = true;
				} else if (c === ")") inParens = false;
				descriptorsStr += c;
				pos += 1;
			}
		}
	}
	return output.join(", ");
}
var cachedDocument = /* @__PURE__ */ new WeakMap();
function absoluteToDoc(doc, attributeValue) {
	if (!attributeValue || attributeValue.trim() === "") return attributeValue;
	return getHref(doc, attributeValue);
}
function isSVGElement(el) {
	return Boolean(el.tagName === "svg" || el.ownerSVGElement);
}
function getHref(doc, customHref) {
	let a = cachedDocument.get(doc);
	if (!a) {
		a = doc.createElement("a");
		cachedDocument.set(doc, a);
	}
	if (!customHref) customHref = "";
	else if (customHref.startsWith("blob:") || customHref.startsWith("data:")) return customHref;
	a.setAttribute("href", customHref);
	return a.href;
}
function transformAttribute(doc, tagName, name, value, element, maskAttributeFn, ignoreCSSAttributes) {
	if (!value) return value;
	if (name === "src" || name === "href" && !(tagName === "use" && value[0] === "#")) return absoluteToDoc(doc, value);
	else if (name === "xlink:href" && value[0] !== "#") return absoluteToDoc(doc, value);
	else if (name === "background" && (tagName === "table" || tagName === "td" || tagName === "th")) return absoluteToDoc(doc, value);
	else if (name === "srcset") return getAbsoluteSrcsetString(doc, value);
	else if (name === "style") {
		let processedStyle = absoluteToStylesheet(value, getHref(doc));
		if (ignoreCSSAttributes && ignoreCSSAttributes.size > 0) processedStyle = filterCSSPropertiesFromInlineStyle(processedStyle, ignoreCSSAttributes);
		return processedStyle;
	} else if (tagName === "object" && name === "data") return absoluteToDoc(doc, value);
	if (typeof maskAttributeFn === "function") return maskAttributeFn(name, value, element);
	return value;
}
function ignoreAttribute(tagName, name, _value) {
	return (tagName === "video" || tagName === "audio") && name === "autoplay";
}
function _isBlockedElement(element, blockClass, blockSelector, unblockSelector) {
	try {
		if (unblockSelector && element.matches(unblockSelector)) return false;
		if (typeof blockClass === "string") {
			if (element.classList.contains(blockClass)) return true;
		} else for (let eIndex = element.classList.length; eIndex--;) {
			const className = element.classList[eIndex];
			if (blockClass.test(className)) return true;
		}
		if (blockSelector) return element.matches(blockSelector);
	} catch (e) {}
	return false;
}
function elementClassMatchesRegex$1(el, regex) {
	for (let eIndex = el.classList.length; eIndex--;) {
		const className = el.classList[eIndex];
		if (regex.test(className)) return true;
	}
	return false;
}
function distanceToMatch$1(node, matchPredicate, limit = Infinity, distance = 0) {
	if (!node) return -1;
	if (node.nodeType !== node.ELEMENT_NODE) return -1;
	if (distance > limit) return -1;
	if (matchPredicate(node)) return distance;
	return distanceToMatch$1(node.parentNode, matchPredicate, limit, distance + 1);
}
function createMatchPredicate$1(className, selector) {
	return (node) => {
		const el = node;
		if (el === null) return false;
		try {
			if (className) {
				if (typeof className === "string") {
					if (el.matches(`.${className}`)) return true;
				} else if (elementClassMatchesRegex$1(el, className)) return true;
			}
			if (selector && el.matches(selector)) return true;
			return false;
		} catch {
			return false;
		}
	};
}
function needMaskingText(node, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, maskAllText) {
	try {
		const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
		if (el === null) return false;
		if (el.tagName === "INPUT") {
			const autocomplete = el.getAttribute("autocomplete");
			if ([
				"current-password",
				"new-password",
				"cc-number",
				"cc-exp",
				"cc-exp-month",
				"cc-exp-year",
				"cc-csc"
			].includes(autocomplete)) return true;
		}
		let maskDistance = -1;
		let unmaskDistance = -1;
		if (maskAllText) {
			unmaskDistance = distanceToMatch$1(el, createMatchPredicate$1(unmaskTextClass, unmaskTextSelector));
			if (unmaskDistance < 0) return true;
			maskDistance = distanceToMatch$1(el, createMatchPredicate$1(maskTextClass, maskTextSelector), unmaskDistance >= 0 ? unmaskDistance : Infinity);
		} else {
			maskDistance = distanceToMatch$1(el, createMatchPredicate$1(maskTextClass, maskTextSelector));
			if (maskDistance < 0) return false;
			unmaskDistance = distanceToMatch$1(el, createMatchPredicate$1(unmaskTextClass, unmaskTextSelector), maskDistance >= 0 ? maskDistance : Infinity);
		}
		return maskDistance >= 0 ? unmaskDistance >= 0 ? maskDistance <= unmaskDistance : true : unmaskDistance >= 0 ? false : !!maskAllText;
	} catch (e) {}
	return !!maskAllText;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
	const win = getIFrameContentWindow$1(iframeEl);
	if (!win) return;
	let fired = false;
	let readyState;
	try {
		readyState = win.document.readyState;
	} catch (error) {
		return;
	}
	if (readyState !== "complete") {
		const timer = setTimeout$1$1(() => {
			if (!fired) {
				listener();
				fired = true;
			}
		}, iframeLoadTimeout);
		iframeEl.addEventListener("load", () => {
			clearTimeout$1(timer);
			fired = true;
			listener();
		});
		return;
	}
	const blankUrl = "about:blank";
	if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
		setTimeout$1$1(listener, 0);
		return iframeEl.addEventListener("load", listener);
	}
	iframeEl.addEventListener("load", listener);
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
	let fired = false;
	let styleSheetLoaded;
	try {
		styleSheetLoaded = link.sheet;
	} catch (error) {
		styleSheetLoaded = null;
	}
	if (styleSheetLoaded) return;
	const timer = setTimeout$1$1(() => {
		if (!fired) {
			listener();
			fired = true;
		}
	}, styleSheetLoadTimeout);
	link.addEventListener("load", () => {
		clearTimeout$1(timer);
		fired = true;
		listener();
	});
}
function serializeNode(n, options) {
	const { doc, mirror, blockClass, blockSelector, unblockSelector, maskAllText, maskAttributeFn, maskTextClass, unmaskTextClass, maskTextSelector, unmaskTextSelector, inlineStylesheet, maskInputOptions = {}, maskTextFn, maskInputFn, dataURLOptions = {}, inlineImages, recordCanvas, keepIframeSrcFn, newlyAddedElement = false, ignoreCSSAttributes } = options;
	const rootId = getRootId(doc, mirror);
	switch (n.nodeType) {
		case n.DOCUMENT_NODE: if (n.compatMode !== "CSS1Compat") return {
			type: NodeType$1.Document,
			childNodes: [],
			compatMode: n.compatMode
		};
		else return {
			type: NodeType$1.Document,
			childNodes: []
		};
		case n.DOCUMENT_TYPE_NODE: return {
			type: NodeType$1.DocumentType,
			name: n.name,
			publicId: n.publicId,
			systemId: n.systemId,
			rootId
		};
		case n.ELEMENT_NODE: return serializeElementNode(n, {
			doc,
			blockClass,
			blockSelector,
			unblockSelector,
			inlineStylesheet,
			maskAttributeFn,
			maskInputOptions,
			maskInputFn,
			dataURLOptions,
			inlineImages,
			recordCanvas,
			keepIframeSrcFn,
			newlyAddedElement,
			rootId,
			maskTextClass,
			unmaskTextClass,
			maskTextSelector,
			unmaskTextSelector,
			ignoreCSSAttributes
		});
		case n.TEXT_NODE: return serializeTextNode(n, {
			doc,
			maskAllText,
			maskTextClass,
			unmaskTextClass,
			maskTextSelector,
			unmaskTextSelector,
			maskTextFn,
			maskInputOptions,
			maskInputFn,
			rootId
		});
		case n.CDATA_SECTION_NODE: return {
			type: NodeType$1.CDATA,
			textContent: "",
			rootId
		};
		case n.COMMENT_NODE: return {
			type: NodeType$1.Comment,
			textContent: n.textContent || "",
			rootId
		};
		default: return false;
	}
}
function getRootId(doc, mirror) {
	if (!mirror.hasNode(doc)) return void 0;
	const docId = mirror.getId(doc);
	return docId === 1 ? void 0 : docId;
}
function serializeTextNode(n, options) {
	const { maskAllText, maskTextClass, unmaskTextClass, maskTextSelector, unmaskTextSelector, maskTextFn, maskInputOptions, maskInputFn, rootId } = options;
	const parentTagName = n.parentNode && n.parentNode.tagName;
	let textContent = n.textContent;
	const isStyle = parentTagName === "STYLE" ? true : void 0;
	const isScript = parentTagName === "SCRIPT" ? true : void 0;
	const isTextarea = parentTagName === "TEXTAREA" ? true : void 0;
	if (isStyle && textContent) {
		try {
			if (n.nextSibling || n.previousSibling) {} else if (n.parentNode.sheet?.cssRules) textContent = stringifyStylesheet(n.parentNode.sheet);
		} catch (err) {
			console.warn(`Cannot get CSS styles from text's parentNode. Error: ${err}`, n);
		}
		textContent = absoluteToStylesheet(textContent, getHref(options.doc));
	}
	if (isScript) textContent = "SCRIPT_PLACEHOLDER";
	const forceMask = needMaskingText(n, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, maskAllText);
	if (!isStyle && !isScript && !isTextarea && textContent && forceMask) textContent = maskTextFn ? maskTextFn(textContent, n.parentElement) : textContent.replace(/[\S]/g, "*");
	if (isTextarea && textContent && (maskInputOptions.textarea || forceMask)) textContent = maskInputFn ? maskInputFn(textContent, n.parentNode) : textContent.replace(/[\S]/g, "*");
	if (parentTagName === "OPTION" && textContent) textContent = maskInputValue({
		isMasked: needMaskingText(n, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, shouldMaskInput({
			type: null,
			tagName: parentTagName,
			maskInputOptions
		})),
		element: n,
		value: textContent,
		maskInputFn
	});
	return {
		type: NodeType$1.Text,
		textContent: textContent || "",
		isStyle,
		rootId
	};
}
function serializeElementNode(n, options) {
	const { doc, blockClass, blockSelector, unblockSelector, inlineStylesheet, maskInputOptions = {}, maskAttributeFn, maskInputFn, dataURLOptions = {}, inlineImages, recordCanvas, keepIframeSrcFn, newlyAddedElement = false, rootId, maskTextClass, unmaskTextClass, maskTextSelector, unmaskTextSelector, ignoreCSSAttributes } = options;
	const needBlock = _isBlockedElement(n, blockClass, blockSelector, unblockSelector);
	const tagName = getValidTagName(n);
	let attributes2 = {};
	const len = n.attributes.length;
	for (let i2 = 0; i2 < len; i2++) {
		const attr = n.attributes[i2];
		if (attr.name && !ignoreAttribute(tagName, attr.name, attr.value)) attributes2[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value, n, maskAttributeFn, ignoreCSSAttributes);
	}
	if (tagName === "link" && inlineStylesheet) {
		const stylesheet = Array.from(doc.styleSheets).find((s) => {
			return s.href === n.href;
		});
		let cssText = null;
		if (stylesheet) cssText = stringifyStylesheet(stylesheet);
		if (cssText) {
			attributes2.rel = null;
			attributes2.href = null;
			attributes2.crossorigin = null;
			attributes2._cssText = absoluteToStylesheet(cssText, stylesheet.href);
		}
	}
	if (tagName === "style" && n.sheet && !(n.innerText || n.textContent || "").trim().length) {
		const cssText = stringifyStylesheet(n.sheet);
		if (cssText) attributes2._cssText = absoluteToStylesheet(cssText, getHref(doc));
	}
	if (tagName === "input" || tagName === "textarea" || tagName === "select" || tagName === "option") {
		const el = n;
		const type = getInputType(el);
		const value = getInputValue(el, toUpperCase(tagName), type);
		const checked = el.checked;
		if (type !== "submit" && type !== "button" && value) {
			const forceMask = needMaskingText(el, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, shouldMaskInput({
				type,
				tagName: toUpperCase(tagName),
				maskInputOptions
			}));
			attributes2.value = maskInputValue({
				isMasked: forceMask,
				element: el,
				value,
				maskInputFn
			});
		}
		if (checked) attributes2.checked = checked;
	}
	if (tagName === "option") if (n.selected && !maskInputOptions["select"]) attributes2.selected = true;
	else delete attributes2.selected;
	if (tagName === "canvas" && recordCanvas) {
		if (n.__context === "2d") {
			if (!is2DCanvasBlank(n)) attributes2.rr_dataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
		} else if (!("__context" in n)) {
			const canvasDataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
			const blankCanvas = doc.createElement("canvas");
			blankCanvas.width = n.width;
			blankCanvas.height = n.height;
			if (canvasDataURL !== blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality)) attributes2.rr_dataURL = canvasDataURL;
		}
	}
	if (tagName === "img" && inlineImages) {
		if (!canvasService) {
			canvasService = doc.createElement("canvas");
			canvasCtx = canvasService.getContext("2d");
		}
		const image = n;
		const imageSrc = image.currentSrc || image.getAttribute("src") || "<unknown-src>";
		const priorCrossOrigin = image.crossOrigin;
		const recordInlineImage = () => {
			image.removeEventListener("load", recordInlineImage);
			try {
				canvasService.width = image.naturalWidth;
				canvasService.height = image.naturalHeight;
				canvasCtx.drawImage(image, 0, 0);
				attributes2.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
			} catch (err) {
				if (image.crossOrigin !== "anonymous") {
					image.crossOrigin = "anonymous";
					if (image.complete && image.naturalWidth !== 0) recordInlineImage();
					else image.addEventListener("load", recordInlineImage);
					return;
				} else console.warn(`Cannot inline img src=${imageSrc}! Error: ${err}`);
			}
			if (image.crossOrigin === "anonymous") priorCrossOrigin ? attributes2.crossOrigin = priorCrossOrigin : image.removeAttribute("crossorigin");
		};
		if (image.complete && image.naturalWidth !== 0) recordInlineImage();
		else image.addEventListener("load", recordInlineImage);
	}
	if (tagName === "audio" || tagName === "video") {
		attributes2.rr_mediaState = n.paused ? "paused" : "played";
		attributes2.rr_mediaCurrentTime = n.currentTime;
	}
	if (!newlyAddedElement) {
		if (n.scrollLeft) attributes2.rr_scrollLeft = n.scrollLeft;
		if (n.scrollTop) attributes2.rr_scrollTop = n.scrollTop;
	}
	if (needBlock) {
		const { width, height } = n.getBoundingClientRect();
		attributes2 = {
			class: attributes2.class,
			rr_width: `${width}px`,
			rr_height: `${height}px`
		};
	}
	if (tagName === "iframe" && !keepIframeSrcFn(attributes2.src)) {
		if (!needBlock && !getIFrameContentDocument$1(n)) attributes2.rr_src = attributes2.src;
		delete attributes2.src;
	}
	let isCustomElement;
	try {
		if (customElements.get(tagName)) isCustomElement = true;
	} catch (e) {}
	return {
		type: NodeType$1.Element,
		tagName,
		attributes: attributes2,
		childNodes: [],
		isSVG: isSVGElement(n) || void 0,
		needBlock,
		rootId,
		isCustom: isCustomElement
	};
}
function lowerIfExists(maybeAttr) {
	if (maybeAttr === void 0 || maybeAttr === null) return "";
	else return maybeAttr.toLowerCase();
}
function slimDOMExcluded(sn, slimDOMOptions) {
	if (slimDOMOptions.comment && sn.type === NodeType$1.Comment) return true;
	else if (sn.type === NodeType$1.Element) {
		if (slimDOMOptions.script && (sn.tagName === "script" || sn.tagName === "link" && (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") || sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && extractFileExtension(sn.attributes.href) === "js")) return true;
		else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) return true;
		else if (sn.tagName === "meta") {
			if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) return true;
			else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) return true;
			else if (slimDOMOptions.headMetaRobots && (lowerIfExists(sn.attributes.name) === "robots" || lowerIfExists(sn.attributes.name) === "googlebot" || lowerIfExists(sn.attributes.name) === "bingbot")) return true;
			else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== void 0) return true;
			else if (slimDOMOptions.headMetaAuthorship && (lowerIfExists(sn.attributes.name) === "author" || lowerIfExists(sn.attributes.name) === "generator" || lowerIfExists(sn.attributes.name) === "framework" || lowerIfExists(sn.attributes.name) === "publisher" || lowerIfExists(sn.attributes.name) === "progid" || lowerIfExists(sn.attributes.property).match(/^article:/) || lowerIfExists(sn.attributes.property).match(/^product:/))) return true;
			else if (slimDOMOptions.headMetaVerification && (lowerIfExists(sn.attributes.name) === "google-site-verification" || lowerIfExists(sn.attributes.name) === "yandex-verification" || lowerIfExists(sn.attributes.name) === "csrf-token" || lowerIfExists(sn.attributes.name) === "p:domain_verify" || lowerIfExists(sn.attributes.name) === "verify-v1" || lowerIfExists(sn.attributes.name) === "verification" || lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")) return true;
		}
	}
	return false;
}
function serializeNodeWithId(n, options) {
	const { doc, mirror, blockClass, blockSelector, unblockSelector, maskAllText, maskTextClass, unmaskTextClass, maskTextSelector, unmaskTextSelector, skipChild = false, inlineStylesheet = true, maskInputOptions = {}, maskAttributeFn, maskTextFn, maskInputFn, slimDOMOptions, dataURLOptions = {}, inlineImages = false, recordCanvas = false, onSerialize, onIframeLoad, iframeLoadTimeout = 5e3, onBlockedImageLoad, onStylesheetLoad, stylesheetLoadTimeout = 5e3, keepIframeSrcFn = () => false, newlyAddedElement = false, ignoreCSSAttributes } = options;
	let { preserveWhiteSpace = true } = options;
	const _serializedNode = serializeNode(n, {
		doc,
		mirror,
		blockClass,
		blockSelector,
		maskAllText,
		unblockSelector,
		maskTextClass,
		unmaskTextClass,
		maskTextSelector,
		unmaskTextSelector,
		inlineStylesheet,
		maskInputOptions,
		maskAttributeFn,
		maskTextFn,
		maskInputFn,
		dataURLOptions,
		inlineImages,
		recordCanvas,
		keepIframeSrcFn,
		newlyAddedElement,
		ignoreCSSAttributes
	});
	if (!_serializedNode) {
		console.warn(n, "not serialized");
		return null;
	}
	let id;
	if (mirror.hasNode(n)) id = mirror.getId(n);
	else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType$1.Text && !_serializedNode.isStyle && !_serializedNode.textContent.trim().length) id = IGNORED_NODE;
	else id = genId();
	const serializedNode2 = Object.assign(_serializedNode, { id });
	mirror.add(n, serializedNode2);
	if (id === IGNORED_NODE) return null;
	if (onSerialize) onSerialize(n);
	let recordChild = !skipChild;
	if (serializedNode2.type === NodeType$1.Element) {
		recordChild = recordChild && !serializedNode2.needBlock;
		const shadowRoot = n.shadowRoot;
		if (shadowRoot && isNativeShadowDom(shadowRoot)) serializedNode2.isShadowHost = true;
	}
	if ((serializedNode2.type === NodeType$1.Document || serializedNode2.type === NodeType$1.Element) && recordChild) {
		if (slimDOMOptions.headWhitespace && serializedNode2.type === NodeType$1.Element && serializedNode2.tagName === "head") preserveWhiteSpace = false;
		const bypassOptions = {
			doc,
			mirror,
			blockClass,
			blockSelector,
			maskAllText,
			unblockSelector,
			maskTextClass,
			unmaskTextClass,
			maskTextSelector,
			unmaskTextSelector,
			skipChild,
			inlineStylesheet,
			maskInputOptions,
			maskAttributeFn,
			maskTextFn,
			maskInputFn,
			slimDOMOptions,
			dataURLOptions,
			inlineImages,
			recordCanvas,
			preserveWhiteSpace,
			onSerialize,
			onIframeLoad,
			iframeLoadTimeout,
			onBlockedImageLoad,
			onStylesheetLoad,
			stylesheetLoadTimeout,
			keepIframeSrcFn,
			ignoreCSSAttributes
		};
		const childNodes = n.childNodes ? Array.from(n.childNodes) : [];
		for (const childN of childNodes) {
			const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
			if (serializedChildNode) serializedNode2.childNodes.push(serializedChildNode);
		}
		if (isElement$1(n) && n.shadowRoot) for (const childN of Array.from(n.shadowRoot.childNodes)) {
			const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
			if (serializedChildNode) {
				isNativeShadowDom(n.shadowRoot) && (serializedChildNode.isShadow = true);
				serializedNode2.childNodes.push(serializedChildNode);
			}
		}
	}
	if (n.parentNode && isShadowRoot(n.parentNode) && isNativeShadowDom(n.parentNode)) serializedNode2.isShadow = true;
	if (serializedNode2.type === NodeType$1.Element && serializedNode2.tagName === "iframe" && !serializedNode2.needBlock) onceIframeLoaded(n, () => {
		const iframeDoc = getIFrameContentDocument$1(n);
		if (iframeDoc && onIframeLoad) {
			const serializedIframeNode = serializeNodeWithId(iframeDoc, {
				doc: iframeDoc,
				mirror,
				blockClass,
				blockSelector,
				unblockSelector,
				maskAllText,
				maskTextClass,
				unmaskTextClass,
				maskTextSelector,
				unmaskTextSelector,
				skipChild: false,
				inlineStylesheet,
				maskInputOptions,
				maskAttributeFn,
				maskTextFn,
				maskInputFn,
				slimDOMOptions,
				dataURLOptions,
				inlineImages,
				recordCanvas,
				preserveWhiteSpace,
				onSerialize,
				onIframeLoad,
				iframeLoadTimeout,
				onStylesheetLoad,
				stylesheetLoadTimeout,
				keepIframeSrcFn,
				ignoreCSSAttributes
			});
			if (serializedIframeNode) onIframeLoad(n, serializedIframeNode);
		}
	}, iframeLoadTimeout);
	if (serializedNode2.type === NodeType$1.Element && serializedNode2.tagName === "img" && !n.complete && serializedNode2.needBlock) {
		const image = n;
		const updateImageDimensions = () => {
			if (image.isConnected && !image.complete && onBlockedImageLoad) try {
				const rect = image.getBoundingClientRect();
				if (rect.width > 0 && rect.height > 0) onBlockedImageLoad(image, serializedNode2, rect);
			} catch (error) {}
			image.removeEventListener("load", updateImageDimensions);
		};
		if (image.isConnected) image.addEventListener("load", updateImageDimensions);
	}
	if (serializedNode2.type === NodeType$1.Element && serializedNode2.tagName === "link" && typeof serializedNode2.attributes.rel === "string" && (serializedNode2.attributes.rel === "stylesheet" || serializedNode2.attributes.rel === "preload" && typeof serializedNode2.attributes.href === "string" && extractFileExtension(serializedNode2.attributes.href) === "css")) onceStylesheetLoaded(n, () => {
		if (onStylesheetLoad) {
			const serializedLinkNode = serializeNodeWithId(n, {
				doc,
				mirror,
				blockClass,
				blockSelector,
				unblockSelector,
				maskAllText,
				maskTextClass,
				unmaskTextClass,
				maskTextSelector,
				unmaskTextSelector,
				skipChild: false,
				inlineStylesheet,
				maskInputOptions,
				maskAttributeFn,
				maskTextFn,
				maskInputFn,
				slimDOMOptions,
				dataURLOptions,
				inlineImages,
				recordCanvas,
				preserveWhiteSpace,
				onSerialize,
				onIframeLoad,
				iframeLoadTimeout,
				onStylesheetLoad,
				stylesheetLoadTimeout,
				keepIframeSrcFn,
				ignoreCSSAttributes
			});
			if (serializedLinkNode) onStylesheetLoad(n, serializedLinkNode);
		}
	}, stylesheetLoadTimeout);
	if (serializedNode2.type === NodeType$1.Element) delete serializedNode2.needBlock;
	return serializedNode2;
}
function snapshot(n, options) {
	const { mirror = new Mirror$1(), blockClass = "rr-block", blockSelector = null, unblockSelector = null, maskAllText = false, maskTextClass = "rr-mask", unmaskTextClass = null, maskTextSelector = null, unmaskTextSelector = null, inlineStylesheet = true, inlineImages = false, recordCanvas = false, maskAllInputs = false, maskAttributeFn, maskTextFn, maskInputFn, slimDOM = false, dataURLOptions, preserveWhiteSpace, onSerialize, onIframeLoad, iframeLoadTimeout, onBlockedImageLoad, onStylesheetLoad, stylesheetLoadTimeout, keepIframeSrcFn = () => false, ignoreCSSAttributes = /* @__PURE__ */ new Set([]) } = options || {};
	return serializeNodeWithId(n, {
		doc: n,
		mirror,
		blockClass,
		blockSelector,
		unblockSelector,
		maskAllText,
		maskTextClass,
		unmaskTextClass,
		maskTextSelector,
		unmaskTextSelector,
		skipChild: false,
		inlineStylesheet,
		maskInputOptions: maskAllInputs === true ? {
			color: true,
			date: true,
			"datetime-local": true,
			email: true,
			month: true,
			number: true,
			range: true,
			search: true,
			tel: true,
			text: true,
			time: true,
			url: true,
			week: true,
			textarea: true,
			select: true
		} : maskAllInputs === false ? {} : maskAllInputs,
		maskAttributeFn,
		maskTextFn,
		maskInputFn,
		slimDOMOptions: slimDOM === true || slimDOM === "all" ? {
			script: true,
			comment: true,
			headFavicon: true,
			headWhitespace: true,
			headMetaDescKeywords: slimDOM === "all",
			headMetaSocial: true,
			headMetaRobots: true,
			headMetaHttpEquiv: true,
			headMetaAuthorship: true,
			headMetaVerification: true
		} : slimDOM === false ? {} : slimDOM,
		dataURLOptions,
		inlineImages,
		recordCanvas,
		preserveWhiteSpace,
		onSerialize,
		onIframeLoad,
		iframeLoadTimeout,
		onBlockedImageLoad,
		onStylesheetLoad,
		stylesheetLoadTimeout,
		keepIframeSrcFn,
		newlyAddedElement: false,
		ignoreCSSAttributes
	});
}
function on(type, fn, target = document) {
	const options = {
		capture: true,
		passive: true
	};
	target.addEventListener(type, fn, options);
	return () => target.removeEventListener(type, fn, options);
}
var DEPARTED_MIRROR_ACCESS_WARNING$1 = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
var _mirror$1 = {
	map: {},
	getId() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING$1);
		return -1;
	},
	getNode() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING$1);
		return null;
	},
	removeNodeFromMap() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING$1);
	},
	has() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING$1);
		return false;
	},
	reset() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING$1);
	}
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) _mirror$1 = new Proxy(_mirror$1, { get(target, prop, receiver) {
	if (prop === "map") console.error(DEPARTED_MIRROR_ACCESS_WARNING$1);
	return Reflect.get(target, prop, receiver);
} });
function throttle$1(func, wait, options = {}) {
	let timeout = null;
	let previous = 0;
	return function(...args) {
		const now = Date.now();
		if (!previous && options.leading === false) previous = now;
		const remaining = wait - (now - previous);
		const context = this;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout$2(timeout);
				timeout = null;
			}
			previous = now;
			func.apply(context, args);
		} else if (!timeout && options.trailing !== false) timeout = setTimeout$2(() => {
			previous = options.leading === false ? 0 : Date.now();
			timeout = null;
			func.apply(context, args);
		}, remaining);
	};
}
function hookSetter$1(target, key, d, isRevoked, win = window) {
	const original = win.Object.getOwnPropertyDescriptor(target, key);
	win.Object.defineProperty(target, key, isRevoked ? d : { set(value) {
		setTimeout$2(() => {
			d.set.call(this, value);
		}, 0);
		if (original && original.set) original.set.call(this, value);
	} });
	return () => hookSetter$1(target, key, original || {}, true);
}
function patch$1(source, name, replacement) {
	try {
		if (!(name in source)) return () => {};
		const original = source[name];
		const wrapped = replacement(original);
		if (typeof wrapped === "function") {
			wrapped.prototype = wrapped.prototype || {};
			Object.defineProperties(wrapped, { __rrweb_original__: {
				enumerable: false,
				value: original
			} });
		}
		source[name] = wrapped;
		return () => {
			source[name] = original;
		};
	} catch {
		return () => {};
	}
}
var nowTimestamp = Date.now;
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString())) nowTimestamp = () => (/* @__PURE__ */ new Date()).getTime();
function getWindowScroll(win) {
	const doc = win.document;
	return {
		left: doc.scrollingElement ? doc.scrollingElement.scrollLeft : win.pageXOffset !== void 0 ? win.pageXOffset : doc?.documentElement.scrollLeft || doc?.body?.parentElement?.scrollLeft || doc?.body?.scrollLeft || 0,
		top: doc.scrollingElement ? doc.scrollingElement.scrollTop : win.pageYOffset !== void 0 ? win.pageYOffset : doc?.documentElement.scrollTop || doc?.body?.parentElement?.scrollTop || doc?.body?.scrollTop || 0
	};
}
function getWindowHeight() {
	return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
	return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function closestElementOfNode$1(node) {
	if (!node) return null;
	try {
		return node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
	} catch (error) {
		return null;
	}
}
function isBlocked$1(node, blockClass, blockSelector, unblockSelector, checkAncestors) {
	if (!node) return false;
	const el = closestElementOfNode$1(node);
	if (!el) return false;
	const blockedPredicate = createMatchPredicate$1(blockClass, blockSelector);
	if (!checkAncestors) {
		const isUnblocked = unblockSelector && el.matches(unblockSelector);
		return blockedPredicate(el) && !isUnblocked;
	}
	const blockDistance = distanceToMatch$1(el, blockedPredicate);
	let unblockDistance = -1;
	if (blockDistance < 0) return false;
	if (unblockSelector) unblockDistance = distanceToMatch$1(el, createMatchPredicate$1(null, unblockSelector));
	if (blockDistance > -1 && unblockDistance < 0) return true;
	return blockDistance < unblockDistance;
}
function isSerialized(n, mirror) {
	return mirror.getId(n) !== -1;
}
function isIgnored(n, mirror) {
	return mirror.getId(n) === IGNORED_NODE;
}
function isAncestorRemoved(target, mirror) {
	if (isShadowRoot(target)) return false;
	const id = mirror.getId(target);
	if (!mirror.has(id)) return true;
	if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) return false;
	if (!target.parentNode) return true;
	return isAncestorRemoved(target.parentNode, mirror);
}
function legacy_isTouchEvent(event) {
	return Boolean(event.changedTouches);
}
function polyfill(win = window) {
	if ("NodeList" in win && !win.NodeList.prototype.forEach) win.NodeList.prototype.forEach = Array.prototype.forEach;
	if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
	if (!Node.prototype.contains) Node.prototype.contains = (...args) => {
		let node = args[0];
		if (!(0 in args)) throw new TypeError("1 argument is required");
		do
			if (this === node) return true;
		while (node = node && node.parentNode);
		return false;
	};
}
function isSerializedIframe(n, mirror) {
	return Boolean(n.nodeName === "IFRAME" && mirror.getMeta(n));
}
function isSerializedStylesheet(n, mirror) {
	return Boolean(n.nodeName === "LINK" && n.nodeType === n.ELEMENT_NODE && n.getAttribute && n.getAttribute("rel") === "stylesheet" && mirror.getMeta(n));
}
function hasShadowRoot(n) {
	return Boolean(n?.shadowRoot);
}
var StyleSheetMirror = class {
	constructor() {
		this.id = 1;
		this.styleIDMap = /* @__PURE__ */ new WeakMap();
		this.idStyleMap = /* @__PURE__ */ new Map();
	}
	getId(stylesheet) {
		return this.styleIDMap.get(stylesheet) ?? -1;
	}
	has(stylesheet) {
		return this.styleIDMap.has(stylesheet);
	}
	/**
	* @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
	*/
	add(stylesheet, id) {
		if (this.has(stylesheet)) return this.getId(stylesheet);
		let newId;
		if (id === void 0) newId = this.id++;
		else newId = id;
		this.styleIDMap.set(stylesheet, newId);
		this.idStyleMap.set(newId, stylesheet);
		return newId;
	}
	getStyle(id) {
		return this.idStyleMap.get(id) || null;
	}
	reset() {
		this.styleIDMap = /* @__PURE__ */ new WeakMap();
		this.idStyleMap = /* @__PURE__ */ new Map();
		this.id = 1;
	}
	generateId() {
		return this.id++;
	}
};
function getShadowHost(n) {
	let shadowHost = null;
	if (n.getRootNode?.()?.nodeType === Node.DOCUMENT_FRAGMENT_NODE && n.getRootNode().host) shadowHost = n.getRootNode().host;
	return shadowHost;
}
function getRootShadowHost(n) {
	let rootShadowHost = n;
	let shadowHost;
	while (shadowHost = getShadowHost(rootShadowHost)) rootShadowHost = shadowHost;
	return rootShadowHost;
}
function shadowHostInDom(n) {
	const doc = n.ownerDocument;
	if (!doc) return false;
	const shadowHost = getRootShadowHost(n);
	return doc.contains(shadowHost);
}
function inDom(n) {
	const doc = n.ownerDocument;
	if (!doc) return false;
	return doc.contains(n) || shadowHostInDom(n);
}
var cachedImplementations$2 = {};
function getImplementation$2(name) {
	const cached = cachedImplementations$2[name];
	if (cached) return cached;
	const document2 = window.document;
	let impl = window[name];
	if (document2 && typeof document2.createElement === "function") try {
		const sandbox = document2.createElement("iframe");
		sandbox.hidden = true;
		document2.head.appendChild(sandbox);
		const contentWindow = sandbox.contentWindow;
		if (contentWindow && contentWindow[name]) impl = contentWindow[name];
		document2.head.removeChild(sandbox);
	} catch (e) {}
	return cachedImplementations$2[name] = impl.bind(window);
}
function onRequestAnimationFrame$1(...rest) {
	return getImplementation$2("requestAnimationFrame")(...rest);
}
function setTimeout$2(...rest) {
	return getImplementation$2("setTimeout")(...rest);
}
function clearTimeout$2(...rest) {
	return getImplementation$2("clearTimeout")(...rest);
}
var EventType = /* @__PURE__ */ ((EventType2) => {
	EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
	EventType2[EventType2["Load"] = 1] = "Load";
	EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
	EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
	EventType2[EventType2["Meta"] = 4] = "Meta";
	EventType2[EventType2["Custom"] = 5] = "Custom";
	EventType2[EventType2["Plugin"] = 6] = "Plugin";
	return EventType2;
})(EventType || {});
var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
	IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
	IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
	IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
	IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
	IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
	IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
	IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
	IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
	IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
	IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
	IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
	IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
	IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
	IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
	IncrementalSource2[IncrementalSource2["Selection"] = 14] = "Selection";
	IncrementalSource2[IncrementalSource2["AdoptedStyleSheet"] = 15] = "AdoptedStyleSheet";
	IncrementalSource2[IncrementalSource2["CustomElement"] = 16] = "CustomElement";
	return IncrementalSource2;
})(IncrementalSource || {});
var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
	MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
	MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
	MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
	MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
	MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
	MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
	MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
	MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
	MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
	MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
	MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
	return MouseInteractions2;
})(MouseInteractions || {});
var PointerTypes = /* @__PURE__ */ ((PointerTypes2) => {
	PointerTypes2[PointerTypes2["Mouse"] = 0] = "Mouse";
	PointerTypes2[PointerTypes2["Pen"] = 1] = "Pen";
	PointerTypes2[PointerTypes2["Touch"] = 2] = "Touch";
	return PointerTypes2;
})(PointerTypes || {});
var MediaInteractions = /* @__PURE__ */ ((MediaInteractions2) => {
	MediaInteractions2[MediaInteractions2["Play"] = 0] = "Play";
	MediaInteractions2[MediaInteractions2["Pause"] = 1] = "Pause";
	MediaInteractions2[MediaInteractions2["Seeked"] = 2] = "Seeked";
	MediaInteractions2[MediaInteractions2["VolumeChange"] = 3] = "VolumeChange";
	MediaInteractions2[MediaInteractions2["RateChange"] = 4] = "RateChange";
	return MediaInteractions2;
})(MediaInteractions || {});
var errorHandler$1;
function registerErrorHandler$1(handler) {
	errorHandler$1 = handler;
}
function unregisterErrorHandler() {
	errorHandler$1 = void 0;
}
var callbackWrapper$1 = (cb) => {
	if (!errorHandler$1) return cb;
	const rrwebWrapped = ((...rest) => {
		try {
			return cb(...rest);
		} catch (error) {
			if (errorHandler$1 && errorHandler$1(error) === true) return () => {};
			throw error;
		}
	});
	return rrwebWrapped;
};
var chars$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup$1 = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
for (var i$1 = 0; i$1 < chars$1.length; i$1++) lookup$1[chars$1.charCodeAt(i$1)] = i$1;
var CanvasManagerNoop = class {
	reset() {}
	freeze() {}
	unfreeze() {}
	lock() {}
	unlock() {}
	snapshot() {}
	addWindow() {}
	addShadowRoot() {}
	resetShadowRoots() {}
};
function getIFrameContentDocument(iframe) {
	try {
		return iframe.contentDocument;
	} catch (e2) {}
}
function getIFrameContentWindow(iframe) {
	try {
		return iframe.contentWindow;
	} catch (e2) {}
}
var StyleDeclarationParser = class {
	constructor(doc) {
		this.doc = doc;
		this.unattachedDoc = null;
	}
	parse(styleText) {
		return this.parseWithConstructableStylesheet(styleText) || this.parseWithDetachedElement(styleText);
	}
	parseWithConstructableStylesheet(styleText) {
		if (typeof CSSStyleSheet === "undefined" || typeof CSSStyleSheet.prototype.replaceSync !== "function") return null;
		try {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(`x { ${styleText} }`);
			const rule = sheet.cssRules[0];
			if (!rule || rule.type !== CSSRule.STYLE_RULE) return null;
			return rule.style;
		} catch {
			return null;
		}
	}
	parseWithDetachedElement(styleText) {
		const old = this.getUnattachedDoc().createElement("span");
		old.setAttribute("style", styleText);
		return old.style;
	}
	getUnattachedDoc() {
		if (!this.unattachedDoc) try {
			this.unattachedDoc = document.implementation.createHTMLDocument();
		} catch {
			this.unattachedDoc = this.doc;
		}
		return this.unattachedDoc;
	}
};
function isNodeInLinkedList(n2) {
	return "__ln" in n2;
}
var DoubleLinkedList = class {
	constructor() {
		this.length = 0;
		this.head = null;
		this.tail = null;
	}
	get(position) {
		if (position >= this.length) throw new Error("Position outside of list range");
		let current = this.head;
		for (let index = 0; index < position; index++) current = current?.next || null;
		return current;
	}
	addNode(n2) {
		const node = {
			value: n2,
			previous: null,
			next: null
		};
		n2.__ln = node;
		if (n2.previousSibling && isNodeInLinkedList(n2.previousSibling)) {
			const current = n2.previousSibling.__ln.next;
			node.next = current;
			node.previous = n2.previousSibling.__ln;
			n2.previousSibling.__ln.next = node;
			if (current) current.previous = node;
		} else if (n2.nextSibling && isNodeInLinkedList(n2.nextSibling) && n2.nextSibling.__ln.previous) {
			const current = n2.nextSibling.__ln.previous;
			node.previous = current;
			node.next = n2.nextSibling.__ln;
			n2.nextSibling.__ln.previous = node;
			if (current) current.next = node;
		} else {
			if (this.head) this.head.previous = node;
			node.next = this.head;
			this.head = node;
		}
		if (node.next === null) this.tail = node;
		this.length++;
	}
	removeNode(n2) {
		const current = n2.__ln;
		if (!this.head) return;
		if (!current.previous) {
			this.head = current.next;
			if (this.head) this.head.previous = null;
			else this.tail = null;
		} else {
			current.previous.next = current.next;
			if (current.next) current.next.previous = current.previous;
			else this.tail = current.previous;
		}
		if (n2.__ln) delete n2.__ln;
		this.length--;
	}
};
var moveKey = (id, parentId) => `${id}@${parentId}`;
var MutationBuffer = class {
	constructor() {
		this.frozen = false;
		this.locked = false;
		this.texts = [];
		this.attributes = [];
		this.attributeMap = /* @__PURE__ */ new WeakMap();
		this.removes = [];
		this.mapRemoves = [];
		this.movedMap = {};
		this.addedSet = /* @__PURE__ */ new Set();
		this.movedSet = /* @__PURE__ */ new Set();
		this.droppedSet = /* @__PURE__ */ new Set();
		this.processMutations = (mutations) => {
			mutations.forEach(this.processMutation);
			this.emit();
		};
		this.emit = () => {
			if (this.frozen || this.locked) return;
			const adds = [];
			const addedIds = /* @__PURE__ */ new Set();
			const addList = new DoubleLinkedList();
			const getNextId = (n2) => {
				let ns = n2;
				let nextId = IGNORED_NODE;
				while (nextId === IGNORED_NODE) {
					ns = ns && ns.nextSibling;
					nextId = ns && this.mirror.getId(ns);
				}
				return nextId;
			};
			const pushAdd = (n2) => {
				if (!n2.parentNode || !inDom(n2)) return;
				const parentId = isShadowRoot(n2.parentNode) ? this.mirror.getId(getShadowHost(n2)) : this.mirror.getId(n2.parentNode);
				const nextId = getNextId(n2);
				if (parentId === -1 || nextId === -1) return addList.addNode(n2);
				const sn = serializeNodeWithId(n2, {
					doc: this.doc,
					mirror: this.mirror,
					blockClass: this.blockClass,
					blockSelector: this.blockSelector,
					maskAllText: this.maskAllText,
					unblockSelector: this.unblockSelector,
					maskTextClass: this.maskTextClass,
					unmaskTextClass: this.unmaskTextClass,
					maskTextSelector: this.maskTextSelector,
					unmaskTextSelector: this.unmaskTextSelector,
					skipChild: true,
					newlyAddedElement: true,
					inlineStylesheet: this.inlineStylesheet,
					maskInputOptions: this.maskInputOptions,
					maskAttributeFn: this.maskAttributeFn,
					maskTextFn: this.maskTextFn,
					maskInputFn: this.maskInputFn,
					slimDOMOptions: this.slimDOMOptions,
					dataURLOptions: this.dataURLOptions,
					recordCanvas: this.recordCanvas,
					inlineImages: this.inlineImages,
					onSerialize: (currentN) => {
						if (isSerializedIframe(currentN, this.mirror) && !isBlocked$1(currentN, this.blockClass, this.blockSelector, this.unblockSelector, false)) this.iframeManager.addIframe(currentN);
						if (isSerializedStylesheet(currentN, this.mirror)) this.stylesheetManager.trackLinkElement(currentN);
						if (hasShadowRoot(n2)) this.shadowDomManager.addShadowRoot(n2.shadowRoot, this.doc);
					},
					onIframeLoad: (iframe, childSn) => {
						if (isBlocked$1(iframe, this.blockClass, this.blockSelector, this.unblockSelector, false)) return;
						this.iframeManager.attachIframe(iframe, childSn);
						const contentWindow = getIFrameContentWindow(iframe);
						if (contentWindow) this.canvasManager.addWindow(contentWindow);
						this.shadowDomManager.observeAttachShadow(iframe);
					},
					onStylesheetLoad: (link, childSn) => {
						this.stylesheetManager.attachLinkElement(link, childSn);
					},
					onBlockedImageLoad: (_imageEl, serializedNode, { width, height }) => {
						this.mutationCb({
							adds: [],
							removes: [],
							texts: [],
							attributes: [{
								id: serializedNode.id,
								attributes: { style: {
									width: `${width}px`,
									height: `${height}px`
								} }
							}]
						});
					},
					ignoreCSSAttributes: this.ignoreCSSAttributes
				});
				if (sn) {
					adds.push({
						parentId,
						nextId,
						node: sn
					});
					addedIds.add(sn.id);
				}
			};
			while (this.mapRemoves.length) this.mirror.removeNodeFromMap(this.mapRemoves.shift());
			for (const n2 of this.movedSet) {
				if (isParentRemoved(this.removes, n2, this.mirror) && !this.movedSet.has(n2.parentNode)) continue;
				pushAdd(n2);
			}
			for (const n2 of this.addedSet) if (!isAncestorInSet(this.droppedSet, n2) && !isParentRemoved(this.removes, n2, this.mirror)) pushAdd(n2);
			else if (isAncestorInSet(this.movedSet, n2)) pushAdd(n2);
			else this.droppedSet.add(n2);
			let candidate = null;
			while (addList.length) {
				let node = null;
				if (candidate) {
					const parentId = this.mirror.getId(candidate.value.parentNode);
					const nextId = getNextId(candidate.value);
					if (parentId !== -1 && nextId !== -1) node = candidate;
				}
				if (!node) {
					let tailNode = addList.tail;
					while (tailNode) {
						const _node = tailNode;
						tailNode = tailNode.previous;
						if (_node) {
							const parentId = this.mirror.getId(_node.value.parentNode);
							if (getNextId(_node.value) === -1) continue;
							else if (parentId !== -1) {
								node = _node;
								break;
							} else {
								const unhandledNode = _node.value;
								if (unhandledNode.parentNode && unhandledNode.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
									const shadowHost = unhandledNode.parentNode.host;
									if (this.mirror.getId(shadowHost) !== -1) {
										node = _node;
										break;
									}
								}
							}
						}
					}
				}
				if (!node) {
					while (addList.head) addList.removeNode(addList.head.value);
					break;
				}
				candidate = node.previous;
				addList.removeNode(node.value);
				pushAdd(node.value);
			}
			const payload = {
				texts: this.texts.map((text) => ({
					id: this.mirror.getId(text.node),
					value: text.value
				})).filter((text) => !addedIds.has(text.id)).filter((text) => this.mirror.has(text.id)),
				attributes: this.attributes.map((attribute) => {
					const { attributes } = attribute;
					if (typeof attributes.style === "string") {
						const diffAsStr = JSON.stringify(attribute.styleDiff);
						const unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
						if (diffAsStr.length < attributes.style.length) {
							if ((diffAsStr + unchangedAsStr).split("var(").length === attributes.style.split("var(").length) attributes.style = attribute.styleDiff;
						}
					}
					return {
						id: this.mirror.getId(attribute.node),
						attributes
					};
				}).filter((attribute) => !addedIds.has(attribute.id)).filter((attribute) => this.mirror.has(attribute.id)),
				removes: this.removes,
				adds
			};
			if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) return;
			this.texts = [];
			this.attributes = [];
			this.attributeMap = /* @__PURE__ */ new WeakMap();
			this.removes = [];
			this.addedSet = /* @__PURE__ */ new Set();
			this.movedSet = /* @__PURE__ */ new Set();
			this.droppedSet = /* @__PURE__ */ new Set();
			this.movedMap = {};
			this.mutationCb(payload);
		};
		this.processMutation = (m) => {
			if (isIgnored(m.target, this.mirror)) return;
			switch (m.type) {
				case "characterData": {
					const value = m.target.textContent;
					if (!isBlocked$1(m.target, this.blockClass, this.blockSelector, this.unblockSelector, false) && value !== m.oldValue) this.texts.push({
						value: needMaskingText(m.target, this.maskTextClass, this.maskTextSelector, this.unmaskTextClass, this.unmaskTextSelector, this.maskAllText) && value ? this.maskTextFn ? this.maskTextFn(value, closestElementOfNode$1(m.target)) : value.replace(/[\S]/g, "*") : value,
						node: m.target
					});
					break;
				}
				case "attributes": {
					const target = m.target;
					let attributeName = m.attributeName;
					let value = m.target.getAttribute(attributeName);
					if (attributeName === "value") {
						const type = getInputType(target);
						const tagName = target.tagName;
						value = getInputValue(target, tagName, type);
						const isInputMasked = shouldMaskInput({
							maskInputOptions: this.maskInputOptions,
							tagName,
							type
						});
						value = maskInputValue({
							isMasked: needMaskingText(m.target, this.maskTextClass, this.maskTextSelector, this.unmaskTextClass, this.unmaskTextSelector, isInputMasked),
							element: target,
							value,
							maskInputFn: this.maskInputFn
						});
					}
					if (isBlocked$1(m.target, this.blockClass, this.blockSelector, this.unblockSelector, false) || value === m.oldValue) return;
					let item = this.attributeMap.get(m.target);
					if (target.tagName === "IFRAME" && attributeName === "src" && !this.keepIframeSrcFn(value)) if (!getIFrameContentDocument(target)) attributeName = "rr_src";
					else return;
					if (!item) {
						item = {
							node: m.target,
							attributes: {},
							styleDiff: {},
							_unchangedStyles: {}
						};
						this.attributes.push(item);
						this.attributeMap.set(m.target, item);
					}
					if (attributeName === "type" && target.tagName === "INPUT" && (m.oldValue || "").toLowerCase() === "password") target.setAttribute("data-rr-is-password", "true");
					if (!ignoreAttribute(target.tagName, attributeName)) {
						item.attributes[attributeName] = transformAttribute(this.doc, toLowerCase(target.tagName), toLowerCase(attributeName), value, target, this.maskAttributeFn);
						if (attributeName === "style") {
							const oldStyle = m.oldValue ? this.styleDeclarationParser.parse(m.oldValue) : null;
							for (const pname of Array.from(target.style)) {
								const newValue = target.style.getPropertyValue(pname);
								const newPriority = target.style.getPropertyPriority(pname);
								if (newValue !== (oldStyle?.getPropertyValue(pname) || "") || newPriority !== (oldStyle?.getPropertyPriority(pname) || "")) if (newPriority === "") item.styleDiff[pname] = newValue;
								else item.styleDiff[pname] = [newValue, newPriority];
								else item._unchangedStyles[pname] = [newValue, newPriority];
							}
							if (oldStyle) {
								for (const pname of Array.from(oldStyle)) if (target.style.getPropertyValue(pname) === "") item.styleDiff[pname] = false;
							}
						}
					}
					break;
				}
				case "childList":
					if (isBlocked$1(m.target, this.blockClass, this.blockSelector, this.unblockSelector, true)) return;
					m.addedNodes.forEach((n2) => this.genAdds(n2, m.target));
					m.removedNodes.forEach((n2) => {
						const nodeId = this.mirror.getId(n2);
						const parentId = isShadowRoot(m.target) ? this.mirror.getId(m.target.host) : this.mirror.getId(m.target);
						if (isBlocked$1(m.target, this.blockClass, this.blockSelector, this.unblockSelector, false) || isIgnored(n2, this.mirror) || !isSerialized(n2, this.mirror)) return;
						if (this.addedSet.has(n2)) {
							deepDelete(this.addedSet, n2);
							this.droppedSet.add(n2);
						} else if (this.addedSet.has(m.target) && nodeId === -1);
						else if (isAncestorRemoved(m.target, this.mirror));
						else if (this.movedSet.has(n2) && this.movedMap[moveKey(nodeId, parentId)]) deepDelete(this.movedSet, n2);
						else this.removes.push({
							parentId,
							id: nodeId,
							isShadow: isShadowRoot(m.target) && isNativeShadowDom(m.target) ? true : void 0
						});
						this.mapRemoves.push(n2);
					});
					break;
			}
		};
		this.genAdds = (n2, target) => {
			if (this.processedNodeManager.inOtherBuffer(n2, this)) return;
			if (this.addedSet.has(n2) || this.movedSet.has(n2)) return;
			if (this.mirror.hasNode(n2)) {
				if (isIgnored(n2, this.mirror)) return;
				this.movedSet.add(n2);
				let targetId = null;
				if (target && this.mirror.hasNode(target)) targetId = this.mirror.getId(target);
				if (targetId && targetId !== -1) this.movedMap[moveKey(this.mirror.getId(n2), targetId)] = true;
			} else {
				this.addedSet.add(n2);
				this.droppedSet.delete(n2);
			}
			if (!isBlocked$1(n2, this.blockClass, this.blockSelector, this.unblockSelector, false)) {
				if (n2.childNodes) n2.childNodes.forEach((childN) => this.genAdds(childN));
				if (hasShadowRoot(n2)) n2.shadowRoot.childNodes.forEach((childN) => {
					this.processedNodeManager.add(childN, this);
					this.genAdds(childN, n2);
				});
			}
		};
	}
	init(options) {
		[
			"mutationCb",
			"blockClass",
			"blockSelector",
			"unblockSelector",
			"maskAllText",
			"maskTextClass",
			"unmaskTextClass",
			"maskTextSelector",
			"unmaskTextSelector",
			"inlineStylesheet",
			"maskInputOptions",
			"maskAttributeFn",
			"maskTextFn",
			"maskInputFn",
			"keepIframeSrcFn",
			"recordCanvas",
			"inlineImages",
			"slimDOMOptions",
			"dataURLOptions",
			"doc",
			"mirror",
			"iframeManager",
			"stylesheetManager",
			"shadowDomManager",
			"canvasManager",
			"processedNodeManager",
			"ignoreCSSAttributes"
		].forEach((key) => {
			this[key] = options[key];
		});
		this.styleDeclarationParser = new StyleDeclarationParser(this.doc);
	}
	freeze() {
		this.frozen = true;
		this.canvasManager.freeze();
	}
	unfreeze() {
		this.frozen = false;
		this.canvasManager.unfreeze();
		this.emit();
	}
	isFrozen() {
		return this.frozen;
	}
	lock() {
		this.locked = true;
		this.canvasManager.lock();
	}
	unlock() {
		this.locked = false;
		this.canvasManager.unlock();
		this.emit();
	}
	reset() {
		this.shadowDomManager.reset();
		this.canvasManager.reset();
	}
};
function deepDelete(addsSet, n2) {
	addsSet.delete(n2);
	n2.childNodes?.forEach((childN) => deepDelete(addsSet, childN));
}
function isParentRemoved(removes, n2, mirror2) {
	if (removes.length === 0) return false;
	return _isParentRemoved(removes, n2, mirror2);
}
function _isParentRemoved(removes, n2, mirror2) {
	let node = n2.parentNode;
	while (node) {
		const parentId = mirror2.getId(node);
		if (removes.some((r2) => r2.id === parentId)) return true;
		node = node.parentNode;
	}
	return false;
}
function isAncestorInSet(set, n2) {
	if (set.size === 0) return false;
	return _isAncestorInSet(set, n2);
}
function _isAncestorInSet(set, n2) {
	const { parentNode } = n2;
	if (!parentNode) return false;
	if (set.has(parentNode)) return true;
	return _isAncestorInSet(set, parentNode);
}
var mutationBuffers = [];
function getEventTarget(event) {
	try {
		if ("composedPath" in event) {
			const path = event.composedPath();
			if (path.length) return path[0];
		} else if ("path" in event && event.path.length) return event.path[0];
	} catch {}
	return event && event.target;
}
function initMutationObserver(options, rootEl) {
	const mutationBuffer = new MutationBuffer();
	mutationBuffers.push(mutationBuffer);
	mutationBuffer.init(options);
	let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
	const angularZoneSymbol = window?.Zone?.__symbol__?.("MutationObserver");
	if (angularZoneSymbol && window[angularZoneSymbol]) mutationObserverCtor = window[angularZoneSymbol];
	const observer = new mutationObserverCtor(callbackWrapper$1((mutations) => {
		if (options.onMutation && options.onMutation(mutations) === false) return;
		mutationBuffer.processMutations.bind(mutationBuffer)(mutations);
	}));
	observer.observe(rootEl, {
		attributes: true,
		attributeOldValue: true,
		characterData: true,
		characterDataOldValue: true,
		childList: true,
		subtree: true
	});
	return observer;
}
function initMoveObserver({ mousemoveCb, sampling, doc, mirror: mirror2 }) {
	if (sampling.mousemove === false) return () => {};
	const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
	const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
	let positions = [];
	let timeBaseline;
	const wrappedCb = throttle$1(callbackWrapper$1((source) => {
		const totalOffset = Date.now() - timeBaseline;
		mousemoveCb(positions.map((p) => {
			p.timeOffset -= totalOffset;
			return p;
		}), source);
		positions = [];
		timeBaseline = null;
	}), callbackThreshold);
	const updatePosition = callbackWrapper$1(throttle$1(callbackWrapper$1((evt) => {
		const target = getEventTarget(evt);
		const { clientX, clientY } = legacy_isTouchEvent(evt) ? evt.changedTouches[0] : evt;
		if (!timeBaseline) timeBaseline = nowTimestamp();
		positions.push({
			x: clientX,
			y: clientY,
			id: mirror2.getId(target),
			timeOffset: nowTimestamp() - timeBaseline
		});
		wrappedCb(typeof DragEvent !== "undefined" && evt instanceof DragEvent ? IncrementalSource.Drag : evt instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
	}), threshold, { trailing: false }));
	const handlers = [
		on("mousemove", updatePosition, doc),
		on("touchmove", updatePosition, doc),
		on("drag", updatePosition, doc)
	];
	return callbackWrapper$1(() => {
		handlers.forEach((h) => h());
	});
}
function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror: mirror2, blockClass, blockSelector, unblockSelector, sampling }) {
	if (sampling.mouseInteraction === false) return () => {};
	const disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
	const handlers = [];
	let currentPointerType = null;
	const getHandler = (eventKey) => {
		return (event) => {
			const target = getEventTarget(event);
			if (isBlocked$1(target, blockClass, blockSelector, unblockSelector, true)) return;
			let pointerType = null;
			let thisEventKey = eventKey;
			if ("pointerType" in event) {
				switch (event.pointerType) {
					case "mouse":
						pointerType = PointerTypes.Mouse;
						break;
					case "touch":
						pointerType = PointerTypes.Touch;
						break;
					case "pen":
						pointerType = PointerTypes.Pen;
						break;
				}
				if (pointerType === PointerTypes.Touch) {
					if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) thisEventKey = "TouchStart";
					else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) thisEventKey = "TouchEnd";
				} else if (pointerType === PointerTypes.Pen);
			} else if (legacy_isTouchEvent(event)) pointerType = PointerTypes.Touch;
			if (pointerType !== null) {
				currentPointerType = pointerType;
				if (thisEventKey.startsWith("Touch") && pointerType === PointerTypes.Touch || thisEventKey.startsWith("Mouse") && pointerType === PointerTypes.Mouse) pointerType = null;
			} else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
				pointerType = currentPointerType;
				currentPointerType = null;
			}
			const e2 = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
			if (!e2) return;
			const id = mirror2.getId(target);
			const { clientX, clientY } = e2;
			callbackWrapper$1(mouseInteractionCb)({
				type: MouseInteractions[thisEventKey],
				id,
				x: clientX,
				y: clientY,
				...pointerType !== null && { pointerType }
			});
		};
	};
	Object.keys(MouseInteractions).filter((key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false).forEach((eventKey) => {
		let eventName = toLowerCase(eventKey);
		const handler = getHandler(eventKey);
		if (window.PointerEvent) switch (MouseInteractions[eventKey]) {
			case MouseInteractions.MouseDown:
			case MouseInteractions.MouseUp:
				eventName = eventName.replace("mouse", "pointer");
				break;
			case MouseInteractions.TouchStart:
			case MouseInteractions.TouchEnd: return;
		}
		handlers.push(on(eventName, handler, doc));
	});
	return callbackWrapper$1(() => {
		handlers.forEach((h) => h());
	});
}
function initScrollObserver({ scrollCb, doc, mirror: mirror2, blockClass, blockSelector, unblockSelector, sampling }) {
	return on("scroll", callbackWrapper$1(throttle$1(callbackWrapper$1((evt) => {
		const target = getEventTarget(evt);
		if (!target || isBlocked$1(target, blockClass, blockSelector, unblockSelector, true)) return;
		const id = mirror2.getId(target);
		if (target === doc && doc.defaultView) {
			const scrollLeftTop = getWindowScroll(doc.defaultView);
			scrollCb({
				id,
				x: scrollLeftTop.left,
				y: scrollLeftTop.top
			});
		} else scrollCb({
			id,
			x: target.scrollLeft,
			y: target.scrollTop
		});
	}), sampling.scroll || 100)), doc);
}
function initViewportResizeObserver({ viewportResizeCb }, { win }) {
	let lastH = -1;
	let lastW = -1;
	return on("resize", callbackWrapper$1(throttle$1(callbackWrapper$1(() => {
		const height = getWindowHeight();
		const width = getWindowWidth();
		if (lastH !== height || lastW !== width) {
			viewportResizeCb({
				width: Number(width),
				height: Number(height)
			});
			lastH = height;
			lastW = width;
		}
	}), 200)), win);
}
var INPUT_TAGS = [
	"INPUT",
	"TEXTAREA",
	"SELECT"
];
var lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({ inputCb, doc, mirror: mirror2, blockClass, blockSelector, unblockSelector, ignoreClass, ignoreSelector, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput, maskTextClass, unmaskTextClass, maskTextSelector, unmaskTextSelector }) {
	function eventHandler(event) {
		let target = getEventTarget(event);
		const userTriggered = event.isTrusted;
		const tagName = target && toUpperCase(target.tagName);
		if (tagName === "OPTION") target = target.parentElement;
		if (!target || !tagName || INPUT_TAGS.indexOf(tagName) < 0 || isBlocked$1(target, blockClass, blockSelector, unblockSelector, true)) return;
		const el = target;
		if (el.classList.contains(ignoreClass) || ignoreSelector && el.matches(ignoreSelector)) return;
		const type = getInputType(target);
		let text = getInputValue(el, tagName, type);
		let isChecked = false;
		const isInputMasked = shouldMaskInput({
			maskInputOptions,
			tagName,
			type
		});
		const forceMask = needMaskingText(target, maskTextClass, maskTextSelector, unmaskTextClass, unmaskTextSelector, isInputMasked);
		if (type === "radio" || type === "checkbox") isChecked = target.checked;
		text = maskInputValue({
			isMasked: forceMask,
			element: target,
			value: text,
			maskInputFn
		});
		cbWithDedup(target, userTriggeredOnInput ? {
			text,
			isChecked,
			userTriggered
		} : {
			text,
			isChecked
		});
		const name = target.name;
		if (type === "radio" && name && isChecked) doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el2) => {
			if (el2 !== target) {
				const text2 = maskInputValue({
					isMasked: forceMask,
					element: el2,
					value: getInputValue(el2, tagName, type),
					maskInputFn
				});
				cbWithDedup(el2, userTriggeredOnInput ? {
					text: text2,
					isChecked: !isChecked,
					userTriggered: false
				} : {
					text: text2,
					isChecked: !isChecked
				});
			}
		});
	}
	function cbWithDedup(target, v2) {
		const lastInputValue = lastInputValueMap.get(target);
		if (!lastInputValue || lastInputValue.text !== v2.text || lastInputValue.isChecked !== v2.isChecked) {
			lastInputValueMap.set(target, v2);
			const id = mirror2.getId(target);
			callbackWrapper$1(inputCb)({
				...v2,
				id
			});
		}
	}
	const handlers = (sampling.input === "last" ? ["change"] : ["input", "change"]).map((eventName) => on(eventName, callbackWrapper$1(eventHandler), doc));
	const currentWindow = doc.defaultView;
	if (!currentWindow) return () => {
		handlers.forEach((h) => h());
	};
	const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(currentWindow.HTMLInputElement.prototype, "value");
	const hookProperties = [
		[currentWindow.HTMLInputElement.prototype, "value"],
		[currentWindow.HTMLInputElement.prototype, "checked"],
		[currentWindow.HTMLSelectElement.prototype, "value"],
		[currentWindow.HTMLTextAreaElement.prototype, "value"],
		[currentWindow.HTMLSelectElement.prototype, "selectedIndex"],
		[currentWindow.HTMLOptionElement.prototype, "selected"]
	];
	if (propertyDescriptor && propertyDescriptor.set) handlers.push(...hookProperties.map((p) => hookSetter$1(p[0], p[1], { set() {
		callbackWrapper$1(eventHandler)({
			target: this,
			isTrusted: false
		});
	} }, false, currentWindow)));
	return callbackWrapper$1(() => {
		handlers.forEach((h) => h());
	});
}
function getNestedCSSRulePositions(rule) {
	const positions = [];
	function recurse(childRule, pos) {
		if (hasNestedCSSRule("CSSGroupingRule") && childRule.parentRule instanceof CSSGroupingRule || hasNestedCSSRule("CSSMediaRule") && childRule.parentRule instanceof CSSMediaRule || hasNestedCSSRule("CSSSupportsRule") && childRule.parentRule instanceof CSSSupportsRule || hasNestedCSSRule("CSSConditionRule") && childRule.parentRule instanceof CSSConditionRule) {
			const index = Array.from(childRule.parentRule.cssRules).indexOf(childRule);
			pos.unshift(index);
		} else if (childRule.parentStyleSheet) {
			const index = Array.from(childRule.parentStyleSheet.cssRules).indexOf(childRule);
			pos.unshift(index);
		}
		return pos;
	}
	return recurse(rule, positions);
}
function getIdAndStyleId(sheet, mirror2, styleMirror) {
	let id, styleId;
	if (!sheet) return {};
	if (sheet.ownerNode) id = mirror2.getId(sheet.ownerNode);
	else styleId = styleMirror.getId(sheet);
	return {
		styleId,
		id
	};
}
function initStyleSheetObserver({ styleSheetRuleCb, mirror: mirror2, stylesheetManager }, { win }) {
	if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) return () => {};
	const insertRule = win.CSSStyleSheet.prototype.insertRule;
	win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
		const [rule, index] = argumentsList;
		const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
		if (id && id !== -1 || styleId && styleId !== -1) styleSheetRuleCb({
			id,
			styleId,
			adds: [{
				rule,
				index
			}]
		});
		return target.apply(thisArg, argumentsList);
	}) });
	const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
	win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
		const [index] = argumentsList;
		const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
		if (id && id !== -1 || styleId && styleId !== -1) styleSheetRuleCb({
			id,
			styleId,
			removes: [{ index }]
		});
		return target.apply(thisArg, argumentsList);
	}) });
	let replace;
	if (win.CSSStyleSheet.prototype.replace) {
		replace = win.CSSStyleSheet.prototype.replace;
		win.CSSStyleSheet.prototype.replace = new Proxy(replace, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
			const [text] = argumentsList;
			const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
			if (id && id !== -1 || styleId && styleId !== -1) styleSheetRuleCb({
				id,
				styleId,
				replace: text
			});
			return target.apply(thisArg, argumentsList);
		}) });
	}
	let replaceSync;
	if (win.CSSStyleSheet.prototype.replaceSync) {
		replaceSync = win.CSSStyleSheet.prototype.replaceSync;
		win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
			const [text] = argumentsList;
			const { id, styleId } = getIdAndStyleId(thisArg, mirror2, stylesheetManager.styleMirror);
			if (id && id !== -1 || styleId && styleId !== -1) styleSheetRuleCb({
				id,
				styleId,
				replaceSync: text
			});
			return target.apply(thisArg, argumentsList);
		}) });
	}
	const supportedNestedCSSRuleTypes = {};
	if (canMonkeyPatchNestedCSSRule("CSSGroupingRule")) supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
	else {
		if (canMonkeyPatchNestedCSSRule("CSSMediaRule")) supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
		if (canMonkeyPatchNestedCSSRule("CSSConditionRule")) supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
		if (canMonkeyPatchNestedCSSRule("CSSSupportsRule")) supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
	}
	const unmodifiedFunctions = {};
	Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
		unmodifiedFunctions[typeKey] = {
			insertRule: type.prototype.insertRule,
			deleteRule: type.prototype.deleteRule
		};
		type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
			const [rule, index] = argumentsList;
			const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
			if (id && id !== -1 || styleId && styleId !== -1) styleSheetRuleCb({
				id,
				styleId,
				adds: [{
					rule,
					index: [...getNestedCSSRulePositions(thisArg), index || 0]
				}]
			});
			return target.apply(thisArg, argumentsList);
		}) });
		type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
			const [index] = argumentsList;
			const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
			if (id && id !== -1 || styleId && styleId !== -1) styleSheetRuleCb({
				id,
				styleId,
				removes: [{ index: [...getNestedCSSRulePositions(thisArg), index] }]
			});
			return target.apply(thisArg, argumentsList);
		}) });
	});
	return callbackWrapper$1(() => {
		win.CSSStyleSheet.prototype.insertRule = insertRule;
		win.CSSStyleSheet.prototype.deleteRule = deleteRule;
		replace && (win.CSSStyleSheet.prototype.replace = replace);
		replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
		Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
			type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
			type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
		});
	});
}
function initAdoptedStyleSheetObserver({ mirror: mirror2, stylesheetManager }, host) {
	let hostId = null;
	if (host.nodeName === "#document") hostId = mirror2.getId(host);
	else hostId = mirror2.getId(host.host);
	const patchTarget = host.nodeName === "#document" ? host.defaultView?.Document : host.ownerDocument?.defaultView?.ShadowRoot;
	const originalPropertyDescriptor = patchTarget?.prototype ? Object.getOwnPropertyDescriptor(patchTarget?.prototype, "adoptedStyleSheets") : void 0;
	if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor) return () => {};
	Object.defineProperty(host, "adoptedStyleSheets", {
		configurable: originalPropertyDescriptor.configurable,
		enumerable: originalPropertyDescriptor.enumerable,
		get() {
			return originalPropertyDescriptor.get?.call(this);
		},
		set(sheets) {
			const result = originalPropertyDescriptor.set?.call(this, sheets);
			if (hostId !== null && hostId !== -1) try {
				stylesheetManager.adoptStyleSheets(sheets, hostId);
			} catch (e2) {}
			return result;
		}
	});
	return callbackWrapper$1(() => {
		Object.defineProperty(host, "adoptedStyleSheets", {
			configurable: originalPropertyDescriptor.configurable,
			enumerable: originalPropertyDescriptor.enumerable,
			get: originalPropertyDescriptor.get,
			set: originalPropertyDescriptor.set
		});
	});
}
function initStyleDeclarationObserver({ styleDeclarationCb, mirror: mirror2, ignoreCSSAttributes, stylesheetManager }, { win }) {
	const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
	win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
		const [property, value, priority] = argumentsList;
		if (ignoreCSSAttributes.has(property)) return setProperty.apply(thisArg, [
			property,
			value,
			priority
		]);
		const { id, styleId } = getIdAndStyleId(thisArg.parentRule?.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
		if (id && id !== -1 || styleId && styleId !== -1) styleDeclarationCb({
			id,
			styleId,
			set: {
				property,
				value,
				priority
			},
			index: getNestedCSSRulePositions(thisArg.parentRule)
		});
		return target.apply(thisArg, argumentsList);
	}) });
	const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
	win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, { apply: callbackWrapper$1((target, thisArg, argumentsList) => {
		const [property] = argumentsList;
		if (ignoreCSSAttributes.has(property)) return removeProperty.apply(thisArg, [property]);
		const { id, styleId } = getIdAndStyleId(thisArg.parentRule?.parentStyleSheet, mirror2, stylesheetManager.styleMirror);
		if (id && id !== -1 || styleId && styleId !== -1) styleDeclarationCb({
			id,
			styleId,
			remove: { property },
			index: getNestedCSSRulePositions(thisArg.parentRule)
		});
		return target.apply(thisArg, argumentsList);
	}) });
	return callbackWrapper$1(() => {
		win.CSSStyleDeclaration.prototype.setProperty = setProperty;
		win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
	});
}
function initMediaInteractionObserver({ mediaInteractionCb, blockClass, blockSelector, unblockSelector, mirror: mirror2, sampling, doc }) {
	const handler = callbackWrapper$1((type) => throttle$1(callbackWrapper$1((event) => {
		const target = getEventTarget(event);
		if (!target || isBlocked$1(target, blockClass, blockSelector, unblockSelector, true)) return;
		const { currentTime, volume, muted, playbackRate } = target;
		mediaInteractionCb({
			type,
			id: mirror2.getId(target),
			currentTime,
			volume,
			muted,
			playbackRate
		});
	}), sampling.media || 500));
	const handlers = [
		on("play", handler(MediaInteractions.Play), doc),
		on("pause", handler(MediaInteractions.Pause), doc),
		on("seeked", handler(MediaInteractions.Seeked), doc),
		on("volumechange", handler(MediaInteractions.VolumeChange), doc),
		on("ratechange", handler(MediaInteractions.RateChange), doc)
	];
	return callbackWrapper$1(() => {
		handlers.forEach((h) => h());
	});
}
function initFontObserver({ fontCb, doc }) {
	const win = doc.defaultView;
	if (!win) return () => {};
	const handlers = [];
	const fontMap = /* @__PURE__ */ new WeakMap();
	const originalFontFace = win.FontFace;
	win.FontFace = function FontFace2(family, source, descriptors) {
		const fontFace = new originalFontFace(family, source, descriptors);
		fontMap.set(fontFace, {
			family,
			buffer: typeof source !== "string",
			descriptors,
			fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source)))
		});
		return fontFace;
	};
	const restoreHandler = patch$1(doc.fonts, "add", function(original) {
		return function(fontFace) {
			setTimeout$2(callbackWrapper$1(() => {
				const p = fontMap.get(fontFace);
				if (p) {
					fontCb(p);
					fontMap.delete(fontFace);
				}
			}), 0);
			return original.apply(this, [fontFace]);
		};
	});
	handlers.push(() => {
		win.FontFace = originalFontFace;
	});
	handlers.push(restoreHandler);
	return callbackWrapper$1(() => {
		handlers.forEach((h) => h());
	});
}
function initSelectionObserver(param) {
	const { doc, mirror: mirror2, blockClass, blockSelector, unblockSelector, selectionCb } = param;
	let collapsed = true;
	const updateSelection = callbackWrapper$1(() => {
		const selection = doc.getSelection();
		if (!selection || collapsed && selection?.isCollapsed) return;
		collapsed = selection.isCollapsed || false;
		const ranges = [];
		const count = selection.rangeCount || 0;
		for (let i2 = 0; i2 < count; i2++) {
			const { startContainer, startOffset, endContainer, endOffset } = selection.getRangeAt(i2);
			if (isBlocked$1(startContainer, blockClass, blockSelector, unblockSelector, true) || isBlocked$1(endContainer, blockClass, blockSelector, unblockSelector, true)) continue;
			ranges.push({
				start: mirror2.getId(startContainer),
				startOffset,
				end: mirror2.getId(endContainer),
				endOffset
			});
		}
		selectionCb({ ranges });
	});
	updateSelection();
	return on("selectionchange", updateSelection);
}
function initCustomElementObserver({ doc, customElementCb }) {
	const win = doc.defaultView;
	if (!win || !win.customElements) return () => {};
	return patch$1(win.customElements, "define", function(original) {
		return function(name, constructor, options) {
			try {
				customElementCb({ define: { name } });
			} catch (e2) {}
			return original.apply(this, [
				name,
				constructor,
				options
			]);
		};
	});
}
function initObservers(o2, _hooks = {}) {
	const currentWindow = o2.doc.defaultView;
	if (!currentWindow) return () => {};
	let mutationObserver;
	if (o2.recordDOM) mutationObserver = initMutationObserver(o2, o2.doc);
	const mousemoveHandler = initMoveObserver(o2);
	const mouseInteractionHandler = initMouseInteractionObserver(o2);
	const scrollHandler = initScrollObserver(o2);
	const viewportResizeHandler = initViewportResizeObserver(o2, { win: currentWindow });
	const inputHandler = initInputObserver(o2);
	const mediaInteractionHandler = initMediaInteractionObserver(o2);
	let styleSheetObserver = () => {};
	let adoptedStyleSheetObserver = () => {};
	let styleDeclarationObserver = () => {};
	let fontObserver = () => {};
	if (o2.recordDOM) {
		styleSheetObserver = initStyleSheetObserver(o2, { win: currentWindow });
		adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o2, o2.doc);
		styleDeclarationObserver = initStyleDeclarationObserver(o2, { win: currentWindow });
		if (o2.collectFonts) fontObserver = initFontObserver(o2);
	}
	const selectionObserver = initSelectionObserver(o2);
	const customElementObserver = initCustomElementObserver(o2);
	const pluginHandlers = [];
	for (const plugin of o2.plugins) pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
	return callbackWrapper$1(() => {
		mutationBuffers.forEach((b) => b.reset());
		mutationObserver?.disconnect();
		mousemoveHandler();
		mouseInteractionHandler();
		scrollHandler();
		viewportResizeHandler();
		inputHandler();
		mediaInteractionHandler();
		styleSheetObserver();
		adoptedStyleSheetObserver();
		styleDeclarationObserver();
		fontObserver();
		selectionObserver();
		customElementObserver();
		pluginHandlers.forEach((h) => h());
	});
}
function hasNestedCSSRule(prop) {
	return typeof window[prop] !== "undefined";
}
function canMonkeyPatchNestedCSSRule(prop) {
	return Boolean(typeof window[prop] !== "undefined" && window[prop].prototype && "insertRule" in window[prop].prototype && "deleteRule" in window[prop].prototype);
}
var CrossOriginIframeMirror = class {
	constructor(generateIdFn) {
		this.generateIdFn = generateIdFn;
		this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
		this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
	}
	getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
		const idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
		const remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
		let id = idToRemoteIdMap.get(remoteId);
		if (!id) {
			id = this.generateIdFn();
			idToRemoteIdMap.set(remoteId, id);
			remoteIdToIdMap.set(id, remoteId);
		}
		return id;
	}
	getIds(iframe, remoteId) {
		const idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
		const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
		return remoteId.map((id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap));
	}
	getRemoteId(iframe, id, map) {
		const remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
		if (typeof id !== "number") return id;
		const remoteId = remoteIdToIdMap.get(id);
		if (!remoteId) return -1;
		return remoteId;
	}
	getRemoteIds(iframe, ids) {
		const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
		return ids.map((id) => this.getRemoteId(iframe, id, remoteIdToIdMap));
	}
	reset(iframe) {
		if (!iframe) {
			this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap();
			this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
			return;
		}
		this.iframeIdToRemoteIdMap.delete(iframe);
		this.iframeRemoteIdToIdMap.delete(iframe);
	}
	getIdToRemoteIdMap(iframe) {
		let idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
		if (!idToRemoteIdMap) {
			idToRemoteIdMap = /* @__PURE__ */ new Map();
			this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
		}
		return idToRemoteIdMap;
	}
	getRemoteIdToIdMap(iframe) {
		let remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
		if (!remoteIdToIdMap) {
			remoteIdToIdMap = /* @__PURE__ */ new Map();
			this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
		}
		return remoteIdToIdMap;
	}
};
var IframeManagerNoop = class {
	constructor() {
		this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
		this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
	}
	addIframe() {}
	addLoadListener() {}
	attachIframe() {}
};
var IframeManager = class {
	constructor(options) {
		this.iframes = /* @__PURE__ */ new WeakMap();
		this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap();
		this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
		this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
		this.mutationCb = options.mutationCb;
		this.wrappedEmit = options.wrappedEmit;
		this.stylesheetManager = options.stylesheetManager;
		this.recordCrossOriginIframes = options.recordCrossOriginIframes;
		this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror));
		this.mirror = options.mirror;
		if (this.recordCrossOriginIframes) window.addEventListener("message", this.handleMessage.bind(this));
	}
	addIframe(iframeEl) {
		this.iframes.set(iframeEl, true);
		const contentWindow = getIFrameContentWindow(iframeEl);
		if (contentWindow) this.crossOriginIframeMap.set(contentWindow, iframeEl);
	}
	addLoadListener(cb) {
		this.loadListener = cb;
	}
	attachIframe(iframeEl, childSn) {
		this.mutationCb({
			adds: [{
				parentId: this.mirror.getId(iframeEl),
				nextId: null,
				node: childSn
			}],
			removes: [],
			texts: [],
			attributes: [],
			isAttachIframe: true
		});
		if (this.recordCrossOriginIframes) getIFrameContentWindow(iframeEl)?.addEventListener("message", this.handleMessage.bind(this));
		this.loadListener?.(iframeEl);
		const iframeDoc = getIFrameContentDocument(iframeEl);
		if (iframeDoc && iframeDoc.adoptedStyleSheets && iframeDoc.adoptedStyleSheets.length > 0) this.stylesheetManager.adoptStyleSheets(iframeDoc.adoptedStyleSheets, this.mirror.getId(iframeDoc));
	}
	handleMessage(message) {
		const crossOriginMessageEvent = message;
		if (crossOriginMessageEvent.data.type !== "rrweb" || crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin) return;
		if (!message.source) return;
		const iframeEl = this.crossOriginIframeMap.get(message.source);
		if (!iframeEl) return;
		const transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
		if (transformedEvent) this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
	}
	transformCrossOriginEvent(iframeEl, e2) {
		switch (e2.type) {
			case EventType.FullSnapshot: {
				this.crossOriginIframeMirror.reset(iframeEl);
				this.crossOriginIframeStyleMirror.reset(iframeEl);
				this.replaceIdOnNode(e2.data.node, iframeEl);
				const rootId = e2.data.node.id;
				this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
				this.patchRootIdOnNode(e2.data.node, rootId);
				return {
					timestamp: e2.timestamp,
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.Mutation,
						adds: [{
							parentId: this.mirror.getId(iframeEl),
							nextId: null,
							node: e2.data.node
						}],
						removes: [],
						texts: [],
						attributes: [],
						isAttachIframe: true
					}
				};
			}
			case EventType.Meta:
			case EventType.Load:
			case EventType.DomContentLoaded: return false;
			case EventType.Plugin: return e2;
			case EventType.Custom:
				this.replaceIds(e2.data.payload, iframeEl, [
					"id",
					"parentId",
					"previousId",
					"nextId"
				]);
				return e2;
			case EventType.IncrementalSnapshot: switch (e2.data.source) {
				case IncrementalSource.Mutation:
					e2.data.adds.forEach((n2) => {
						this.replaceIds(n2, iframeEl, [
							"parentId",
							"nextId",
							"previousId"
						]);
						this.replaceIdOnNode(n2.node, iframeEl);
						const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
						rootId && this.patchRootIdOnNode(n2.node, rootId);
					});
					e2.data.removes.forEach((n2) => {
						this.replaceIds(n2, iframeEl, ["parentId", "id"]);
					});
					e2.data.attributes.forEach((n2) => {
						this.replaceIds(n2, iframeEl, ["id"]);
					});
					e2.data.texts.forEach((n2) => {
						this.replaceIds(n2, iframeEl, ["id"]);
					});
					return e2;
				case IncrementalSource.Drag:
				case IncrementalSource.TouchMove:
				case IncrementalSource.MouseMove:
					e2.data.positions.forEach((p) => {
						this.replaceIds(p, iframeEl, ["id"]);
					});
					return e2;
				case IncrementalSource.ViewportResize: return false;
				case IncrementalSource.MediaInteraction:
				case IncrementalSource.MouseInteraction:
				case IncrementalSource.Scroll:
				case IncrementalSource.CanvasMutation:
				case IncrementalSource.Input:
					this.replaceIds(e2.data, iframeEl, ["id"]);
					return e2;
				case IncrementalSource.StyleSheetRule:
				case IncrementalSource.StyleDeclaration:
					this.replaceIds(e2.data, iframeEl, ["id"]);
					this.replaceStyleIds(e2.data, iframeEl, ["styleId"]);
					return e2;
				case IncrementalSource.Font: return e2;
				case IncrementalSource.Selection:
					e2.data.ranges.forEach((range) => {
						this.replaceIds(range, iframeEl, ["start", "end"]);
					});
					return e2;
				case IncrementalSource.AdoptedStyleSheet:
					this.replaceIds(e2.data, iframeEl, ["id"]);
					this.replaceStyleIds(e2.data, iframeEl, ["styleIds"]);
					e2.data.styles?.forEach((style) => {
						this.replaceStyleIds(style, iframeEl, ["styleId"]);
					});
					return e2;
			}
		}
		return false;
	}
	replace(iframeMirror, obj, iframeEl, keys) {
		for (const key of keys) {
			if (!Array.isArray(obj[key]) && typeof obj[key] !== "number") continue;
			if (Array.isArray(obj[key])) obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
			else obj[key] = iframeMirror.getId(iframeEl, obj[key]);
		}
		return obj;
	}
	replaceIds(obj, iframeEl, keys) {
		return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
	}
	replaceStyleIds(obj, iframeEl, keys) {
		return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
	}
	replaceIdOnNode(node, iframeEl) {
		this.replaceIds(node, iframeEl, ["id", "rootId"]);
		if ("childNodes" in node) node.childNodes.forEach((child) => {
			this.replaceIdOnNode(child, iframeEl);
		});
	}
	patchRootIdOnNode(node, rootId) {
		if (node.type !== NodeType$1.Document && !node.rootId) node.rootId = rootId;
		if ("childNodes" in node) node.childNodes.forEach((child) => {
			this.patchRootIdOnNode(child, rootId);
		});
	}
};
var ShadowDomManagerNoop = class {
	init() {}
	addShadowRoot() {}
	observeAttachShadow() {}
	reset() {}
};
var ShadowDomManager = class {
	constructor(options) {
		this.shadowDoms = /* @__PURE__ */ new WeakSet();
		this.restoreHandlers = [];
		this.mutationCb = options.mutationCb;
		this.scrollCb = options.scrollCb;
		this.bypassOptions = options.bypassOptions;
		this.mirror = options.mirror;
		this.init();
	}
	init() {
		this.reset();
		this.patchAttachShadow(Element, document);
	}
	addShadowRoot(shadowRoot, doc) {
		if (!isNativeShadowDom(shadowRoot)) return;
		if (this.shadowDoms.has(shadowRoot)) return;
		this.shadowDoms.add(shadowRoot);
		this.bypassOptions.canvasManager.addShadowRoot(shadowRoot);
		const observer = initMutationObserver({
			...this.bypassOptions,
			doc,
			mutationCb: this.mutationCb,
			mirror: this.mirror,
			shadowDomManager: this
		}, shadowRoot);
		this.restoreHandlers.push(() => observer.disconnect());
		this.restoreHandlers.push(initScrollObserver({
			...this.bypassOptions,
			scrollCb: this.scrollCb,
			doc: shadowRoot,
			mirror: this.mirror
		}));
		setTimeout$2(() => {
			if (shadowRoot.adoptedStyleSheets && shadowRoot.adoptedStyleSheets.length > 0) this.bypassOptions.stylesheetManager.adoptStyleSheets(shadowRoot.adoptedStyleSheets, this.mirror.getId(shadowRoot.host));
			this.restoreHandlers.push(initAdoptedStyleSheetObserver({
				mirror: this.mirror,
				stylesheetManager: this.bypassOptions.stylesheetManager
			}, shadowRoot));
		}, 0);
	}
	/**
	* Monkey patch 'attachShadow' of an IFrameElement to observe newly added shadow doms.
	*/
	observeAttachShadow(iframeElement) {
		const iframeDoc = getIFrameContentDocument(iframeElement);
		const iframeWindow = getIFrameContentWindow(iframeElement);
		if (!iframeDoc || !iframeWindow) return;
		this.patchAttachShadow(iframeWindow.Element, iframeDoc);
	}
	/**
	* Patch 'attachShadow' to observe newly added shadow doms.
	*/
	patchAttachShadow(element, doc) {
		const manager = this;
		this.restoreHandlers.push(patch$1(element.prototype, "attachShadow", function(original) {
			return function(option) {
				const shadowRoot = original.call(this, option);
				if (this.shadowRoot && inDom(this)) manager.addShadowRoot(this.shadowRoot, doc);
				return shadowRoot;
			};
		}));
	}
	reset() {
		this.restoreHandlers.forEach((handler) => {
			try {
				handler();
			} catch (e2) {}
		});
		this.restoreHandlers = [];
		this.shadowDoms = /* @__PURE__ */ new WeakSet();
		this.bypassOptions.canvasManager.resetShadowRoots();
	}
};
var StylesheetManager = class {
	constructor(options) {
		this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
		this.styleMirror = new StyleSheetMirror();
		this.mutationCb = options.mutationCb;
		this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
	}
	attachLinkElement(linkEl, childSn) {
		if ("_cssText" in childSn.attributes) this.mutationCb({
			adds: [],
			removes: [],
			texts: [],
			attributes: [{
				id: childSn.id,
				attributes: childSn.attributes
			}]
		});
		this.trackLinkElement(linkEl);
	}
	trackLinkElement(linkEl) {
		if (this.trackedLinkElements.has(linkEl)) return;
		this.trackedLinkElements.add(linkEl);
		this.trackStylesheetInLinkElement(linkEl);
	}
	adoptStyleSheets(sheets, hostId) {
		if (sheets.length === 0) return;
		const adoptedStyleSheetData = {
			id: hostId,
			styleIds: []
		};
		const styles = [];
		for (const sheet of sheets) {
			let styleId;
			if (!this.styleMirror.has(sheet)) {
				styleId = this.styleMirror.add(sheet);
				styles.push({
					styleId,
					rules: Array.from(sheet.rules || CSSRule, (r2, index) => ({
						rule: stringifyRule(r2),
						index
					}))
				});
			} else styleId = this.styleMirror.getId(sheet);
			adoptedStyleSheetData.styleIds.push(styleId);
		}
		if (styles.length > 0) adoptedStyleSheetData.styles = styles;
		this.adoptedStyleSheetCb(adoptedStyleSheetData);
	}
	reset() {
		this.styleMirror.reset();
		this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
	}
	trackStylesheetInLinkElement(_linkEl) {}
};
var ProcessedNodeManager = class {
	constructor() {
		this.nodeMap = /* @__PURE__ */ new WeakMap();
		this.active = false;
	}
	inOtherBuffer(node, thisBuffer) {
		const buffers = this.nodeMap.get(node);
		return buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer);
	}
	add(node, buffer) {
		if (!this.active) {
			this.active = true;
			onRequestAnimationFrame$1(() => {
				this.nodeMap = /* @__PURE__ */ new WeakMap();
				this.active = false;
			});
		}
		this.nodeMap.set(node, (this.nodeMap.get(node) || /* @__PURE__ */ new Set()).add(buffer));
	}
	destroy() {}
};
var wrappedEmit;
var _takeFullSnapshot;
try {
	if (Array.from([1], (x) => x * 2)[0] !== 2) {
		const cleanFrame = document.createElement("iframe");
		document.body.appendChild(cleanFrame);
		Array.from = cleanFrame.contentWindow?.Array.from || Array.from;
		document.body.removeChild(cleanFrame);
	}
} catch (err) {
	console.debug("Unable to override Array.from", err);
}
var mirror = createMirror$1();
function record(options = {}) {
	const { emit, checkoutEveryNms, checkoutEveryNth, blockClass = "rr-block", blockSelector = null, unblockSelector = null, ignoreClass = "rr-ignore", ignoreSelector = null, maskAllText = false, maskTextClass = "rr-mask", unmaskTextClass = null, maskTextSelector = null, unmaskTextSelector = null, inlineStylesheet = true, maskAllInputs, maskInputOptions: _maskInputOptions, slimDOMOptions: _slimDOMOptions, maskAttributeFn, maskInputFn, maskTextFn, maxCanvasSize = null, packFn, sampling = {}, dataURLOptions = {}, mousemoveWait, recordDOM = true, recordCanvas = false, recordCrossOriginIframes = false, recordAfter = options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load", userTriggeredOnInput = false, collectFonts = false, inlineImages = false, plugins, keepIframeSrcFn = () => false, ignoreCSSAttributes = /* @__PURE__ */ new Set([]), errorHandler, onMutation, getCanvasManager } = options;
	registerErrorHandler$1(errorHandler);
	const inEmittingFrame = recordCrossOriginIframes ? window.parent === window : true;
	let passEmitsToParent = false;
	if (!inEmittingFrame) try {
		if (window.parent.document) passEmitsToParent = false;
	} catch (e2) {
		passEmitsToParent = true;
	}
	if (inEmittingFrame && !emit) throw new Error("emit function is required");
	if (!inEmittingFrame && !passEmitsToParent) return () => {};
	if (mousemoveWait !== void 0 && sampling.mousemove === void 0) sampling.mousemove = mousemoveWait;
	mirror.reset();
	const maskInputOptions = maskAllInputs === true ? {
		color: true,
		date: true,
		"datetime-local": true,
		email: true,
		month: true,
		number: true,
		range: true,
		search: true,
		tel: true,
		text: true,
		time: true,
		url: true,
		week: true,
		textarea: true,
		select: true,
		radio: true,
		checkbox: true
	} : _maskInputOptions !== void 0 ? _maskInputOptions : {};
	const slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === "all" ? {
		script: true,
		comment: true,
		headFavicon: true,
		headWhitespace: true,
		headMetaSocial: true,
		headMetaRobots: true,
		headMetaHttpEquiv: true,
		headMetaVerification: true,
		headMetaAuthorship: _slimDOMOptions === "all",
		headMetaDescKeywords: _slimDOMOptions === "all"
	} : _slimDOMOptions ? _slimDOMOptions : {};
	polyfill();
	let lastFullSnapshotEvent;
	let incrementalSnapshotCount = 0;
	const eventProcessor = (e2) => {
		for (const plugin of plugins || []) if (plugin.eventProcessor) e2 = plugin.eventProcessor(e2);
		if (packFn && !passEmitsToParent) e2 = packFn(e2);
		return e2;
	};
	wrappedEmit = (r2, isCheckout) => {
		const e2 = r2;
		e2.timestamp = nowTimestamp();
		if (mutationBuffers[0]?.isFrozen() && e2.type !== EventType.FullSnapshot && !(e2.type === EventType.IncrementalSnapshot && e2.data.source === IncrementalSource.Mutation)) mutationBuffers.forEach((buf) => buf.unfreeze());
		if (inEmittingFrame) emit?.(eventProcessor(e2), isCheckout);
		else if (passEmitsToParent) {
			const message = {
				type: "rrweb",
				event: eventProcessor(e2),
				origin: window.location.origin,
				isCheckout
			};
			window.parent.postMessage(message, "*");
		}
		if (e2.type === EventType.FullSnapshot) {
			lastFullSnapshotEvent = e2;
			incrementalSnapshotCount = 0;
		} else if (e2.type === EventType.IncrementalSnapshot) {
			if (e2.data.source === IncrementalSource.Mutation && e2.data.isAttachIframe) return;
			incrementalSnapshotCount++;
			const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
			const exceedTime = checkoutEveryNms && lastFullSnapshotEvent && e2.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
			if (exceedCount || exceedTime) takeFullSnapshot2(true);
		}
	};
	const wrappedMutationEmit = (m) => {
		wrappedEmit({
			type: EventType.IncrementalSnapshot,
			data: {
				source: IncrementalSource.Mutation,
				...m
			}
		});
	};
	const wrappedScrollEmit = (p) => wrappedEmit({
		type: EventType.IncrementalSnapshot,
		data: {
			source: IncrementalSource.Scroll,
			...p
		}
	});
	const wrappedCanvasMutationEmit = (p) => wrappedEmit({
		type: EventType.IncrementalSnapshot,
		data: {
			source: IncrementalSource.CanvasMutation,
			...p
		}
	});
	const wrappedAdoptedStyleSheetEmit = (a2) => wrappedEmit({
		type: EventType.IncrementalSnapshot,
		data: {
			source: IncrementalSource.AdoptedStyleSheet,
			...a2
		}
	});
	const stylesheetManager = new StylesheetManager({
		mutationCb: wrappedMutationEmit,
		adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit
	});
	const iframeManager = typeof __RRWEB_EXCLUDE_IFRAME__ === "boolean" && __RRWEB_EXCLUDE_IFRAME__ ? new IframeManagerNoop() : new IframeManager({
		mirror,
		mutationCb: wrappedMutationEmit,
		stylesheetManager,
		recordCrossOriginIframes,
		wrappedEmit
	});
	for (const plugin of plugins || []) if (plugin.getMirror) plugin.getMirror({
		nodeMirror: mirror,
		crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
		crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror
	});
	const processedNodeManager = new ProcessedNodeManager();
	const canvasManager = _getCanvasManager(getCanvasManager, {
		mirror,
		win: window,
		mutationCb: (p) => wrappedEmit({
			type: EventType.IncrementalSnapshot,
			data: {
				source: IncrementalSource.CanvasMutation,
				...p
			}
		}),
		recordCanvas,
		blockClass,
		blockSelector,
		unblockSelector,
		maxCanvasSize,
		sampling: sampling["canvas"],
		dataURLOptions,
		errorHandler
	});
	const shadowDomManager = typeof __RRWEB_EXCLUDE_SHADOW_DOM__ === "boolean" && __RRWEB_EXCLUDE_SHADOW_DOM__ ? new ShadowDomManagerNoop() : new ShadowDomManager({
		mutationCb: wrappedMutationEmit,
		scrollCb: wrappedScrollEmit,
		bypassOptions: {
			onMutation,
			blockClass,
			blockSelector,
			unblockSelector,
			maskAllText,
			maskTextClass,
			unmaskTextClass,
			maskTextSelector,
			unmaskTextSelector,
			inlineStylesheet,
			maskInputOptions,
			dataURLOptions,
			maskAttributeFn,
			maskTextFn,
			maskInputFn,
			recordCanvas,
			inlineImages,
			sampling,
			slimDOMOptions,
			iframeManager,
			stylesheetManager,
			canvasManager,
			keepIframeSrcFn,
			processedNodeManager,
			ignoreCSSAttributes
		},
		mirror
	});
	const takeFullSnapshot2 = (isCheckout = false) => {
		if (!recordDOM) return;
		wrappedEmit({
			type: EventType.Meta,
			data: {
				href: window.location.href,
				width: getWindowWidth(),
				height: getWindowHeight()
			}
		}, isCheckout);
		stylesheetManager.reset();
		shadowDomManager.init();
		mutationBuffers.forEach((buf) => buf.lock());
		const node = snapshot(document, {
			mirror,
			blockClass,
			blockSelector,
			unblockSelector,
			maskAllText,
			maskTextClass,
			unmaskTextClass,
			maskTextSelector,
			unmaskTextSelector,
			inlineStylesheet,
			maskAllInputs: maskInputOptions,
			maskAttributeFn,
			maskInputFn,
			maskTextFn,
			slimDOM: slimDOMOptions,
			dataURLOptions,
			recordCanvas,
			inlineImages,
			onSerialize: (n2) => {
				if (isSerializedIframe(n2, mirror)) iframeManager.addIframe(n2);
				if (isSerializedStylesheet(n2, mirror)) stylesheetManager.trackLinkElement(n2);
				if (hasShadowRoot(n2)) shadowDomManager.addShadowRoot(n2.shadowRoot, document);
			},
			onIframeLoad: (iframe, childSn) => {
				iframeManager.attachIframe(iframe, childSn);
				const contentWindow = getIFrameContentWindow(iframe);
				if (contentWindow) canvasManager.addWindow(contentWindow);
				shadowDomManager.observeAttachShadow(iframe);
			},
			onStylesheetLoad: (linkEl, childSn) => {
				stylesheetManager.attachLinkElement(linkEl, childSn);
			},
			onBlockedImageLoad: (_imageEl, serializedNode, { width, height }) => {
				wrappedMutationEmit({
					adds: [],
					removes: [],
					texts: [],
					attributes: [{
						id: serializedNode.id,
						attributes: { style: {
							width: `${width}px`,
							height: `${height}px`
						} }
					}]
				});
			},
			keepIframeSrcFn,
			ignoreCSSAttributes
		});
		if (!node) return console.warn("Failed to snapshot the document");
		wrappedEmit({
			type: EventType.FullSnapshot,
			data: {
				node,
				initialOffset: getWindowScroll(window)
			}
		});
		mutationBuffers.forEach((buf) => buf.unlock());
		if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0) stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
	};
	_takeFullSnapshot = takeFullSnapshot2;
	try {
		const handlers = [];
		const observe = (doc) => {
			return callbackWrapper$1(initObservers)({
				onMutation,
				mutationCb: wrappedMutationEmit,
				mousemoveCb: (positions, source) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source,
						positions
					}
				}),
				mouseInteractionCb: (d) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.MouseInteraction,
						...d
					}
				}),
				scrollCb: wrappedScrollEmit,
				viewportResizeCb: (d) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.ViewportResize,
						...d
					}
				}),
				inputCb: (v2) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.Input,
						...v2
					}
				}),
				mediaInteractionCb: (p) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.MediaInteraction,
						...p
					}
				}),
				styleSheetRuleCb: (r2) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.StyleSheetRule,
						...r2
					}
				}),
				styleDeclarationCb: (r2) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.StyleDeclaration,
						...r2
					}
				}),
				canvasMutationCb: wrappedCanvasMutationEmit,
				fontCb: (p) => wrappedEmit({
					type: EventType.IncrementalSnapshot,
					data: {
						source: IncrementalSource.Font,
						...p
					}
				}),
				selectionCb: (p) => {
					wrappedEmit({
						type: EventType.IncrementalSnapshot,
						data: {
							source: IncrementalSource.Selection,
							...p
						}
					});
				},
				customElementCb: (c2) => {
					wrappedEmit({
						type: EventType.IncrementalSnapshot,
						data: {
							source: IncrementalSource.CustomElement,
							...c2
						}
					});
				},
				blockClass,
				ignoreClass,
				ignoreSelector,
				maskAllText,
				maskTextClass,
				unmaskTextClass,
				maskTextSelector,
				unmaskTextSelector,
				maskInputOptions,
				inlineStylesheet,
				sampling,
				recordDOM,
				recordCanvas,
				inlineImages,
				userTriggeredOnInput,
				collectFonts,
				doc,
				maskAttributeFn,
				maskInputFn,
				maskTextFn,
				keepIframeSrcFn,
				blockSelector,
				unblockSelector,
				slimDOMOptions,
				dataURLOptions,
				mirror,
				iframeManager,
				stylesheetManager,
				shadowDomManager,
				processedNodeManager,
				canvasManager,
				ignoreCSSAttributes,
				plugins: plugins?.filter((p) => p.observer)?.map((p) => ({
					observer: p.observer,
					options: p.options,
					callback: (payload) => wrappedEmit({
						type: EventType.Plugin,
						data: {
							plugin: p.name,
							payload
						}
					})
				})) || []
			}, {});
		};
		iframeManager.addLoadListener((iframeEl) => {
			try {
				handlers.push(observe(iframeEl.contentDocument));
			} catch (error) {
				console.warn(error);
			}
		});
		const init = () => {
			takeFullSnapshot2();
			handlers.push(observe(document));
		};
		if (document.readyState === "interactive" || document.readyState === "complete") init();
		else {
			handlers.push(on("DOMContentLoaded", () => {
				wrappedEmit({
					type: EventType.DomContentLoaded,
					data: {}
				});
				if (recordAfter === "DOMContentLoaded") init();
			}));
			handlers.push(on("load", () => {
				wrappedEmit({
					type: EventType.Load,
					data: {}
				});
				if (recordAfter === "load") init();
			}, window));
		}
		return () => {
			handlers.forEach((h) => h());
			processedNodeManager.destroy();
			_takeFullSnapshot = void 0;
			unregisterErrorHandler();
		};
	} catch (error) {
		console.warn(error);
	}
}
function takeFullSnapshot(isCheckout) {
	if (!_takeFullSnapshot) throw new Error("please take full snapshot after start recording");
	_takeFullSnapshot(isCheckout);
}
record.mirror = mirror;
record.takeFullSnapshot = takeFullSnapshot;
function _getCanvasManager(getCanvasManagerFn, options) {
	try {
		return getCanvasManagerFn ? getCanvasManagerFn(options) : new CanvasManagerNoop();
	} catch {
		console.warn("Unable to initialize CanvasManager");
		return new CanvasManagerNoop();
	}
}
var n$1;
(function(t2) {
	t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
})(n$1 || (n$1 = {}));
var ReplayEventTypeIncrementalSnapshot = 3;
var ReplayEventTypeCustom = 5;
function timestampToMs(timestamp) {
	return timestamp > 9999999999 ? timestamp : timestamp * 1e3;
}
function timestampToS(timestamp) {
	return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
}
function addBreadcrumbEvent(replay, breadcrumb) {
	if (breadcrumb.category === "sentry.transaction") return;
	if (["ui.click", "ui.input"].includes(breadcrumb.category)) replay.triggerUserActivity();
	else replay.checkAndHandleExpiredSession();
	replay.addUpdate(() => {
		replay.throttledAddEvent({
			type: EventType.Custom,
			timestamp: (breadcrumb.timestamp || 0) * 1e3,
			data: {
				tag: "breadcrumb",
				payload: normalize(breadcrumb, 10, 1e3)
			}
		});
		return breadcrumb.category === "console";
	});
}
var INTERACTIVE_SELECTOR = "button,a";
function getClosestInteractive(element) {
	return element.closest(INTERACTIVE_SELECTOR) || element;
}
function getClickTargetNode(event) {
	const target = getTargetNode(event);
	if (!target || !(target instanceof Element)) return target;
	return getClosestInteractive(target);
}
function getTargetNode(event) {
	if (isEventWithTarget(event)) return event.target;
	return event;
}
function isEventWithTarget(event) {
	return isObjectLike(event) && "target" in event;
}
var handlers;
function onWindowOpen(cb) {
	if (!handlers) {
		handlers = [];
		monkeyPatchWindowOpen();
	}
	handlers.push(cb);
	return () => {
		const pos = handlers ? handlers.indexOf(cb) : -1;
		if (pos > -1) handlers.splice(pos, 1);
	};
}
function monkeyPatchWindowOpen() {
	fill(WINDOW, "open", function(originalWindowOpen) {
		return function(...args) {
			if (handlers) try {
				handlers.forEach((handler) => handler());
			} catch {}
			return originalWindowOpen.apply(WINDOW, args);
		};
	});
}
var IncrementalMutationSources = /* @__PURE__ */ new Set([
	IncrementalSource.Mutation,
	IncrementalSource.StyleSheetRule,
	IncrementalSource.StyleDeclaration,
	IncrementalSource.AdoptedStyleSheet,
	IncrementalSource.CanvasMutation,
	IncrementalSource.Selection,
	IncrementalSource.MediaInteraction
]);
function handleClick(clickDetector, clickBreadcrumb, node) {
	clickDetector.handleClick(clickBreadcrumb, node);
}
var ClickDetector = class {
	constructor(replay, slowClickConfig, _addBreadcrumbEvent = addBreadcrumbEvent) {
		this._lastMutation = 0;
		this._lastScroll = 0;
		this._clicks = [];
		this._timeout = slowClickConfig.timeout / 1e3;
		this._threshold = slowClickConfig.threshold / 1e3;
		this._scrollTimeout = slowClickConfig.scrollTimeout / 1e3;
		this._replay = replay;
		this._ignoreSelector = slowClickConfig.ignoreSelector;
		this._addBreadcrumbEvent = _addBreadcrumbEvent;
	}
	/** Register click detection handlers on mutation or scroll. */
	addListeners() {
		const cleanupWindowOpen = onWindowOpen(() => {
			this._lastMutation = nowInSeconds();
		});
		this._teardown = () => {
			cleanupWindowOpen();
			this._clicks = [];
			this._lastMutation = 0;
			this._lastScroll = 0;
		};
	}
	/** Clean up listeners. */
	removeListeners() {
		if (this._teardown) this._teardown();
		if (this._checkClickTimeout) clearTimeout(this._checkClickTimeout);
	}
	/** @inheritDoc */
	handleClick(breadcrumb, node) {
		if (ignoreElement(node, this._ignoreSelector) || !isClickBreadcrumb(breadcrumb)) return;
		const newClick = {
			timestamp: timestampToS(breadcrumb.timestamp),
			clickBreadcrumb: breadcrumb,
			clickCount: 0,
			node
		};
		if (this._clicks.some((click) => click.node === newClick.node && Math.abs(click.timestamp - newClick.timestamp) < 1)) return;
		this._clicks.push(newClick);
		if (this._clicks.length === 1) this._scheduleCheckClicks();
	}
	/** @inheritDoc */
	registerMutation(timestamp = Date.now()) {
		this._lastMutation = timestampToS(timestamp);
	}
	/** @inheritDoc */
	registerScroll(timestamp = Date.now()) {
		this._lastScroll = timestampToS(timestamp);
	}
	/** @inheritDoc */
	registerClick(element) {
		const node = getClosestInteractive(element);
		this._handleMultiClick(node);
	}
	/** Count multiple clicks on elements. */
	_handleMultiClick(node) {
		this._getClicks(node).forEach((click) => {
			click.clickCount++;
		});
	}
	/** Get all pending clicks for a given node. */
	_getClicks(node) {
		return this._clicks.filter((click) => click.node === node);
	}
	/** Check the clicks that happened. */
	_checkClicks() {
		const timedOutClicks = [];
		const now = nowInSeconds();
		this._clicks.forEach((click) => {
			if (!click.mutationAfter && this._lastMutation) click.mutationAfter = click.timestamp <= this._lastMutation ? this._lastMutation - click.timestamp : void 0;
			if (!click.scrollAfter && this._lastScroll) click.scrollAfter = click.timestamp <= this._lastScroll ? this._lastScroll - click.timestamp : void 0;
			if (click.timestamp + this._timeout <= now) timedOutClicks.push(click);
		});
		for (const click of timedOutClicks) {
			const pos = this._clicks.indexOf(click);
			if (pos > -1) {
				this._generateBreadcrumbs(click);
				this._clicks.splice(pos, 1);
			}
		}
		if (this._clicks.length) this._scheduleCheckClicks();
	}
	/** Generate matching breadcrumb(s) for the click. */
	_generateBreadcrumbs(click) {
		const replay = this._replay;
		const hadScroll = click.scrollAfter && click.scrollAfter <= this._scrollTimeout;
		const hadMutation = click.mutationAfter && click.mutationAfter <= this._threshold;
		const isSlowClick = !hadScroll && !hadMutation;
		const { clickCount, clickBreadcrumb } = click;
		if (isSlowClick) {
			const timeAfterClickMs = Math.min(click.mutationAfter || this._timeout, this._timeout) * 1e3;
			const endReason = timeAfterClickMs < this._timeout * 1e3 ? "mutation" : "timeout";
			const breadcrumb = {
				type: "default",
				message: clickBreadcrumb.message,
				timestamp: clickBreadcrumb.timestamp,
				category: "ui.slowClickDetected",
				data: {
					...clickBreadcrumb.data,
					url: WINDOW.location.href,
					route: replay.getCurrentRoute(),
					timeAfterClickMs,
					endReason,
					clickCount: clickCount || 1
				}
			};
			this._addBreadcrumbEvent(replay, breadcrumb);
			return;
		}
		if (clickCount > 1) {
			const breadcrumb = {
				type: "default",
				message: clickBreadcrumb.message,
				timestamp: clickBreadcrumb.timestamp,
				category: "ui.multiClick",
				data: {
					...clickBreadcrumb.data,
					url: WINDOW.location.href,
					route: replay.getCurrentRoute(),
					clickCount,
					metric: true
				}
			};
			this._addBreadcrumbEvent(replay, breadcrumb);
		}
	}
	/** Schedule to check current clicks. */
	_scheduleCheckClicks() {
		if (this._checkClickTimeout) clearTimeout(this._checkClickTimeout);
		this._checkClickTimeout = setTimeout$3(() => this._checkClicks(), 1e3);
	}
};
var SLOW_CLICK_TAGS = [
	"A",
	"BUTTON",
	"INPUT"
];
function ignoreElement(node, ignoreSelector) {
	if (!SLOW_CLICK_TAGS.includes(node.tagName)) return true;
	if (node.tagName === "INPUT" && !["submit", "button"].includes(node.getAttribute("type") || "")) return true;
	if (node.tagName === "A" && (node.hasAttribute("download") || node.hasAttribute("target") && node.getAttribute("target") !== "_self")) return true;
	if (ignoreSelector && node.matches(ignoreSelector)) return true;
	return false;
}
function isClickBreadcrumb(breadcrumb) {
	return !!(breadcrumb.data && typeof breadcrumb.data.nodeId === "number" && breadcrumb.timestamp);
}
function nowInSeconds() {
	return Date.now() / 1e3;
}
function updateClickDetectorForRecordingEvent(clickDetector, event) {
	try {
		if (!isIncrementalEvent(event)) return;
		const { source } = event.data;
		if (IncrementalMutationSources.has(source)) clickDetector.registerMutation(event.timestamp);
		if (source === IncrementalSource.Scroll) clickDetector.registerScroll(event.timestamp);
		if (isIncrementalMouseInteraction(event)) {
			const { type, id } = event.data;
			const node = record.mirror.getNode(id);
			if (node instanceof HTMLElement && type === MouseInteractions.Click) clickDetector.registerClick(node);
		}
	} catch {}
}
function isIncrementalEvent(event) {
	return event.type === ReplayEventTypeIncrementalSnapshot;
}
function isIncrementalMouseInteraction(event) {
	return event.data.source === IncrementalSource.MouseInteraction;
}
function createBreadcrumb(breadcrumb) {
	return {
		timestamp: Date.now() / 1e3,
		type: "default",
		...breadcrumb
	};
}
var NodeType = /* @__PURE__ */ ((NodeType2) => {
	NodeType2[NodeType2["Document"] = 0] = "Document";
	NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
	NodeType2[NodeType2["Element"] = 2] = "Element";
	NodeType2[NodeType2["Text"] = 3] = "Text";
	NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
	NodeType2[NodeType2["Comment"] = 5] = "Comment";
	return NodeType2;
})(NodeType || {});
var ATTRIBUTES_TO_RECORD = /* @__PURE__ */ new Set([
	"id",
	"class",
	"aria-label",
	"role",
	"name",
	"alt",
	"title",
	"data-test-id",
	"data-testid",
	"disabled",
	"aria-disabled",
	"data-sentry-component"
]);
function getAttributesToRecord(attributes) {
	const obj = {};
	if (!attributes["data-sentry-component"] && attributes["data-sentry-element"]) attributes["data-sentry-component"] = attributes["data-sentry-element"];
	for (const key in attributes) if (ATTRIBUTES_TO_RECORD.has(key)) {
		let normalizedKey = key;
		if (key === "data-testid" || key === "data-test-id") normalizedKey = "testId";
		obj[normalizedKey] = attributes[key];
	}
	return obj;
}
var handleDomListener = (replay) => {
	return (handlerData) => {
		if (!replay.isEnabled()) return;
		const result = handleDom(handlerData);
		if (!result) return;
		const isClick = handlerData.name === "click";
		const event = isClick ? handlerData.event : void 0;
		if (isClick && replay.clickDetector && event?.target && !event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) handleClick(replay.clickDetector, result, getClickTargetNode(handlerData.event));
		addBreadcrumbEvent(replay, result);
	};
};
function getBaseDomBreadcrumb(target, message) {
	const nodeId = record.mirror.getId(target);
	const node = nodeId && record.mirror.getNode(nodeId);
	const meta = node && record.mirror.getMeta(node);
	const element = meta && isElement(meta) ? meta : null;
	return {
		message,
		data: element ? {
			nodeId,
			node: {
				id: nodeId,
				tagName: element.tagName,
				textContent: Array.from(element.childNodes).map((node2) => node2.type === NodeType.Text && node2.textContent).filter(Boolean).map((text) => text.trim()).join(""),
				attributes: getAttributesToRecord(element.attributes)
			}
		} : {}
	};
}
function handleDom(handlerData) {
	const { target, message } = getDomTarget(handlerData);
	return createBreadcrumb({
		category: `ui.${handlerData.name}`,
		...getBaseDomBreadcrumb(target, message)
	});
}
function getDomTarget(handlerData) {
	const isClick = handlerData.name === "click";
	let message;
	let target = null;
	try {
		target = isClick ? getClickTargetNode(handlerData.event) : getTargetNode(handlerData.event);
		message = htmlTreeAsString(target, { maxStringLength: 200 }) || "<unknown>";
	} catch {
		message = "<unknown>";
	}
	return {
		target,
		message
	};
}
function isElement(node) {
	return node.type === NodeType.Element;
}
function handleKeyboardEvent(replay, event) {
	if (!replay.isEnabled()) return;
	replay.updateUserActivity();
	const breadcrumb = getKeyboardBreadcrumb(event);
	if (!breadcrumb) return;
	addBreadcrumbEvent(replay, breadcrumb);
}
function getKeyboardBreadcrumb(event) {
	const { metaKey, shiftKey, ctrlKey, altKey, key, target } = event;
	if (!target || isInputElement(target) || !key) return null;
	const hasModifierKey = metaKey || ctrlKey || altKey;
	const isCharacterKey = key.length === 1;
	if (!hasModifierKey && isCharacterKey) return null;
	const message = htmlTreeAsString(target, { maxStringLength: 200 }) || "<unknown>";
	return createBreadcrumb({
		category: "ui.keyDown",
		message,
		data: {
			...getBaseDomBreadcrumb(target, message).data,
			metaKey,
			shiftKey,
			ctrlKey,
			altKey,
			key
		}
	});
}
function isInputElement(target) {
	return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}
var ENTRY_TYPES = {
	resource: createResourceEntry,
	paint: createPaintEntry,
	navigation: createNavigationEntry
};
function webVitalHandler(getter, replay) {
	return ({ metric }) => void replay.replayPerformanceEntries.push(getter(metric));
}
function createPerformanceEntries(entries) {
	return entries.map(createPerformanceEntry).filter(Boolean);
}
function createPerformanceEntry(entry) {
	const entryType = ENTRY_TYPES[entry.entryType];
	if (!entryType) return null;
	return entryType(entry);
}
function getAbsoluteTime(time) {
	return ((browserPerformanceTimeOrigin() || WINDOW.performance.timeOrigin) + time) / 1e3;
}
function createPaintEntry(entry) {
	const { duration, entryType, name, startTime } = entry;
	const start = getAbsoluteTime(startTime);
	return {
		type: entryType,
		name,
		start,
		end: start + duration,
		data: void 0
	};
}
function createNavigationEntry(entry) {
	const { entryType, name, decodedBodySize, duration, domComplete, encodedBodySize, domContentLoadedEventStart, domContentLoadedEventEnd, domInteractive, loadEventStart, loadEventEnd, redirectCount, startTime, transferSize, type } = entry;
	if (duration === 0) return null;
	return {
		type: `${entryType}.${type}`,
		start: getAbsoluteTime(startTime),
		end: getAbsoluteTime(domComplete),
		name,
		data: {
			size: transferSize,
			decodedBodySize,
			encodedBodySize,
			duration,
			domInteractive,
			domContentLoadedEventStart,
			domContentLoadedEventEnd,
			loadEventStart,
			loadEventEnd,
			domComplete,
			redirectCount
		}
	};
}
function createResourceEntry(entry) {
	const { entryType, initiatorType, name, responseEnd, startTime, decodedBodySize, encodedBodySize, responseStatus, transferSize } = entry;
	if (["fetch", "xmlhttprequest"].includes(initiatorType)) return null;
	return {
		type: `${entryType}.${initiatorType}`,
		start: getAbsoluteTime(startTime),
		end: getAbsoluteTime(responseEnd),
		name,
		data: {
			size: transferSize,
			statusCode: responseStatus,
			decodedBodySize,
			encodedBodySize
		}
	};
}
function getLargestContentfulPaint(metric) {
	const lastEntry = metric.entries[metric.entries.length - 1];
	return getWebVital(metric, "largest-contentful-paint", lastEntry?.element ? [lastEntry.element] : void 0);
}
function isLayoutShift(entry) {
	return entry.sources !== void 0;
}
function getCumulativeLayoutShift(metric) {
	const layoutShifts = [];
	const nodes = [];
	for (const entry of metric.entries) if (isLayoutShift(entry)) {
		const nodeIds = [];
		for (const source of entry.sources) if (source.node) {
			nodes.push(source.node);
			const nodeId = record.mirror.getId(source.node);
			if (nodeId) nodeIds.push(nodeId);
		}
		layoutShifts.push({
			value: entry.value,
			nodeIds: nodeIds.length ? nodeIds : void 0
		});
	}
	return getWebVital(metric, "cumulative-layout-shift", nodes, layoutShifts);
}
function getInteractionToNextPaint(metric) {
	const lastEntry = metric.entries[metric.entries.length - 1];
	return getWebVital(metric, "interaction-to-next-paint", lastEntry?.target ? [lastEntry.target] : void 0);
}
function getWebVital(metric, name, nodes, attributions) {
	const value = metric.value;
	const rating = metric.rating;
	const end = getAbsoluteTime(value);
	return {
		type: "web-vital",
		name,
		start: end,
		end,
		data: {
			value,
			size: value,
			rating,
			nodeIds: nodes ? nodes.map((node) => record.mirror.getId(node)) : void 0,
			attributions
		}
	};
}
function setupPerformanceObserver(replay) {
	function addPerformanceEntry(entry) {
		if (!replay.performanceEntries.includes(entry)) replay.performanceEntries.push(entry);
	}
	function onEntries({ entries }) {
		entries.forEach(addPerformanceEntry);
	}
	const clearCallbacks = [];
	[
		"navigation",
		"paint",
		"resource"
	].forEach((type) => {
		clearCallbacks.push(addPerformanceInstrumentationHandler(type, onEntries));
	});
	clearCallbacks.push(addLcpInstrumentationHandler(webVitalHandler(getLargestContentfulPaint, replay)), addClsInstrumentationHandler(webVitalHandler(getCumulativeLayoutShift, replay)), addInpInstrumentationHandler(webVitalHandler(getInteractionToNextPaint, replay)));
	return () => {
		clearCallbacks.forEach((clearCallback) => clearCallback());
	};
}
var DEBUG_BUILD$1 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
var r$1 = `var t=Uint8Array,n=Uint16Array,r=Int32Array,e=new t([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),i=new t([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),s=new t([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),a=function(t,e){for(var i=new n(31),s=0;s<31;++s)i[s]=e+=1<<t[s-1];var a=new r(i[30]);for(s=1;s<30;++s)for(var o=i[s];o<i[s+1];++o)a[o]=o-i[s]<<5|s;return{b:i,r:a}},o=a(e,2),h=o.b,f=o.r;h[28]=258,f[258]=28;for(var l=a(i,0).r,u=new n(32768),c=0;c<32768;++c){var v=(43690&c)>>1|(21845&c)<<1;v=(61680&(v=(52428&v)>>2|(13107&v)<<2))>>4|(3855&v)<<4,u[c]=((65280&v)>>8|(255&v)<<8)>>1}var d=function(t,r,e){for(var i=t.length,s=0,a=new n(r);s<i;++s)t[s]&&++a[t[s]-1];var o,h=new n(r);for(s=1;s<r;++s)h[s]=h[s-1]+a[s-1]<<1;if(e){o=new n(1<<r);var f=15-r;for(s=0;s<i;++s)if(t[s])for(var l=s<<4|t[s],c=r-t[s],v=h[t[s]-1]++<<c,d=v|(1<<c)-1;v<=d;++v)o[u[v]>>f]=l}else for(o=new n(i),s=0;s<i;++s)t[s]&&(o[s]=u[h[t[s]-1]++]>>15-t[s]);return o},p=new t(288);for(c=0;c<144;++c)p[c]=8;for(c=144;c<256;++c)p[c]=9;for(c=256;c<280;++c)p[c]=7;for(c=280;c<288;++c)p[c]=8;var g=new t(32);for(c=0;c<32;++c)g[c]=5;var w=d(p,9,0),y=d(g,5,0),m=function(t){return(t+7)/8|0},b=function(n,r,e){return(null==e||e>n.length)&&(e=n.length),new t(n.subarray(r,e))},M=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],E=function(t,n,r){var e=new Error(n||M[t]);if(e.code=t,Error.captureStackTrace&&Error.captureStackTrace(e,E),!r)throw e;return e},z=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8},_=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8,t[e+2]|=r>>16},x=function(r,e){for(var i=[],s=0;s<r.length;++s)r[s]&&i.push({s:s,f:r[s]});var a=i.length,o=i.slice();if(!a)return{t:F,l:0};if(1==a){var h=new t(i[0].s+1);return h[i[0].s]=1,{t:h,l:1}}i.sort(function(t,n){return t.f-n.f}),i.push({s:-1,f:25001});var f=i[0],l=i[1],u=0,c=1,v=2;for(i[0]={s:-1,f:f.f+l.f,l:f,r:l};c!=a-1;)f=i[i[u].f<i[v].f?u++:v++],l=i[u!=c&&i[u].f<i[v].f?u++:v++],i[c++]={s:-1,f:f.f+l.f,l:f,r:l};var d=o[0].s;for(s=1;s<a;++s)o[s].s>d&&(d=o[s].s);var p=new n(d+1),g=A(i[c-1],p,0);if(g>e){s=0;var w=0,y=g-e,m=1<<y;for(o.sort(function(t,n){return p[n.s]-p[t.s]||t.f-n.f});s<a;++s){var b=o[s].s;if(!(p[b]>e))break;w+=m-(1<<g-p[b]),p[b]=e}for(w>>=y;w>0;){var M=o[s].s;p[M]<e?w-=1<<e-p[M]++-1:++s}for(;s>=0&&w;--s){var E=o[s].s;p[E]==e&&(--p[E],++w)}g=e}return{t:new t(p),l:g}},A=function(t,n,r){return-1==t.s?Math.max(A(t.l,n,r+1),A(t.r,n,r+1)):n[t.s]=r},D=function(t){for(var r=t.length;r&&!t[--r];);for(var e=new n(++r),i=0,s=t[0],a=1,o=function(t){e[i++]=t},h=1;h<=r;++h)if(t[h]==s&&h!=r)++a;else{if(!s&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(s),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(s);a=1,s=t[h]}return{c:e.subarray(0,i),n:r}},T=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},k=function(t,n,r){var e=r.length,i=m(n+2);t[i]=255&e,t[i+1]=e>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var s=0;s<e;++s)t[i+s+4]=r[s];return 8*(i+4+e)},U=function(t,r,a,o,h,f,l,u,c,v,m){z(r,m++,a),++h[256];for(var b=x(h,15),M=b.t,E=b.l,A=x(f,15),U=A.t,C=A.l,F=D(M),I=F.c,S=F.n,L=D(U),O=L.c,j=L.n,q=new n(19),B=0;B<I.length;++B)++q[31&I[B]];for(B=0;B<O.length;++B)++q[31&O[B]];for(var G=x(q,7),H=G.t,J=G.l,K=19;K>4&&!H[s[K-1]];--K);var N,P,Q,R,V=v+5<<3,W=T(h,p)+T(f,g)+l,X=T(h,M)+T(f,U)+l+14+3*K+T(q,H)+2*q[16]+3*q[17]+7*q[18];if(c>=0&&V<=W&&V<=X)return k(r,m,t.subarray(c,c+v));if(z(r,m,1+(X<W)),m+=2,X<W){N=d(M,E,0),P=M,Q=d(U,C,0),R=U;var Y=d(H,J,0);z(r,m,S-257),z(r,m+5,j-1),z(r,m+10,K-4),m+=14;for(B=0;B<K;++B)z(r,m+3*B,H[s[B]]);m+=3*K;for(var Z=[I,O],$=0;$<2;++$){var tt=Z[$];for(B=0;B<tt.length;++B){var nt=31&tt[B];z(r,m,Y[nt]),m+=H[nt],nt>15&&(z(r,m,tt[B]>>5&127),m+=tt[B]>>12)}}}else N=w,P=p,Q=y,R=g;for(B=0;B<u;++B){var rt=o[B];if(rt>255){_(r,m,N[(nt=rt>>18&31)+257]),m+=P[nt+257],nt>7&&(z(r,m,rt>>23&31),m+=e[nt]);var et=31&rt;_(r,m,Q[et]),m+=R[et],et>3&&(_(r,m,rt>>5&8191),m+=i[et])}else _(r,m,N[rt]),m+=P[rt]}return _(r,m,N[256]),m+P[256]},C=new r([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),F=new t(0),I=function(){for(var t=new Int32Array(256),n=0;n<256;++n){for(var r=n,e=9;--e;)r=(1&r&&-306674912)^r>>>1;t[n]=r}return t}(),S=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,s=0|r.length,a=0;a!=s;){for(var o=Math.min(a+2655,s);a<o;++a)i+=e+=r[a];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return(255&(t%=65521))<<24|(65280&t)<<8|(255&(n%=65521))<<8|n>>8}}},L=function(s,a,o,h,u){if(!u&&(u={l:1},a.dictionary)){var c=a.dictionary.subarray(-32768),v=new t(c.length+s.length);v.set(c),v.set(s,c.length),s=v,u.w=c.length}return function(s,a,o,h,u,c){var v=c.z||s.length,d=new t(h+v+5*(1+Math.ceil(v/7e3))+u),p=d.subarray(h,d.length-u),g=c.l,w=7&(c.r||0);if(a){w&&(p[0]=c.r>>3);for(var y=C[a-1],M=y>>13,E=8191&y,z=(1<<o)-1,_=c.p||new n(32768),x=c.h||new n(z+1),A=Math.ceil(o/3),D=2*A,T=function(t){return(s[t]^s[t+1]<<A^s[t+2]<<D)&z},F=new r(25e3),I=new n(288),S=new n(32),L=0,O=0,j=c.i||0,q=0,B=c.w||0,G=0;j+2<v;++j){var H=T(j),J=32767&j,K=x[H];if(_[J]=K,x[H]=J,B<=j){var N=v-j;if((L>7e3||q>24576)&&(N>423||!g)){w=U(s,p,0,F,I,S,O,q,G,j-G,w),q=L=O=0,G=j;for(var P=0;P<286;++P)I[P]=0;for(P=0;P<30;++P)S[P]=0}var Q=2,R=0,V=E,W=J-K&32767;if(N>2&&H==T(j-W))for(var X=Math.min(M,N)-1,Y=Math.min(32767,j),Z=Math.min(258,N);W<=Y&&--V&&J!=K;){if(s[j+Q]==s[j+Q-W]){for(var $=0;$<Z&&s[j+$]==s[j+$-W];++$);if($>Q){if(Q=$,R=W,$>X)break;var tt=Math.min(W,$-2),nt=0;for(P=0;P<tt;++P){var rt=j-W+P&32767,et=rt-_[rt]&32767;et>nt&&(nt=et,K=rt)}}}W+=(J=K)-(K=_[J])&32767}if(R){F[q++]=268435456|f[Q]<<18|l[R];var it=31&f[Q],st=31&l[R];O+=e[it]+i[st],++I[257+it],++S[st],B=j+Q,++L}else F[q++]=s[j],++I[s[j]]}}for(j=Math.max(j,B);j<v;++j)F[q++]=s[j],++I[s[j]];w=U(s,p,g,F,I,S,O,q,G,j-G,w),g||(c.r=7&w|p[w/8|0]<<3,w-=7,c.h=x,c.p=_,c.i=j,c.w=B)}else{for(j=c.w||0;j<v+g;j+=65535){var at=j+65535;at>=v&&(p[w/8|0]=g,at=v),w=k(p,w+1,s.subarray(j,at))}c.i=v}return b(d,0,h+m(w)+u)}(s,null==a.level?6:a.level,null==a.mem?u.l?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(s.length)))):20:12+a.mem,o,h,u)},O=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},j=function(){function n(n,r){if("function"==typeof n&&(r=n,n={}),this.ondata=r,this.o=n||{},this.s={l:0,i:32768,w:32768,z:32768},this.b=new t(98304),this.o.dictionary){var e=this.o.dictionary.subarray(-32768);this.b.set(e,32768-e.length),this.s.i=32768-e.length}}return n.prototype.p=function(t,n){this.ondata(L(t,this.o,0,0,this.s),n)},n.prototype.push=function(n,r){this.ondata||E(5),this.s.l&&E(4);var e=n.length+this.s.z;if(e>this.b.length){if(e>2*this.b.length-32768){var i=new t(-32768&e);i.set(this.b.subarray(0,this.s.z)),this.b=i}var s=this.b.length-this.s.z;this.b.set(n.subarray(0,s),this.s.z),this.s.z=this.b.length,this.p(this.b,!1),this.b.set(this.b.subarray(-32768)),this.b.set(n.subarray(s),32768),this.s.z=n.length-s+32768,this.s.i=32766,this.s.w=32768}else this.b.set(n,this.s.z),this.s.z+=n.length;this.s.l=1&r,(this.s.z>this.s.w+8191||r)&&(this.p(this.b,r||!1),this.s.w=this.s.i,this.s.i-=2)},n.prototype.flush=function(){this.ondata||E(5),this.s.l&&E(4),this.p(this.b,!1),this.s.w=this.s.i,this.s.i-=2},n}();function q(t,n){n||(n={});var r=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=I[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}}(),e=t.length;r.p(t);var i,s=L(t,n,10+((i=n).filename?i.filename.length+1:0),8),a=s.length;return function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&O(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}}(s,n),O(s,a-8,r.d()),O(s,a-4,e),s}var B=function(){function t(t,n){this.c=S(),this.v=1,j.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),j.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=L(t,this.o,this.v&&(this.o.dictionary?6:2),n&&4,this.s);this.v&&(function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;if(t[0]=120,t[1]=e<<6|(n.dictionary&&32),t[1]|=31-(t[0]<<8|t[1])%31,n.dictionary){var i=S();i.p(n.dictionary),O(t,2,i.d())}}(r,this.o),this.v=0),n&&O(r,r.length-4,this.c.d()),this.ondata(r,n)},t.prototype.flush=function(){j.prototype.flush.call(this)},t}(),G="undefined"!=typeof TextEncoder&&new TextEncoder,H="undefined"!=typeof TextDecoder&&new TextDecoder;try{H.decode(F,{stream:!0})}catch(t){}var J=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){this.ondata||E(5),this.d&&E(4),this.ondata(K(t),this.d=n||!1)},t}();function K(n,r){if(G)return G.encode(n);for(var e=n.length,i=new t(n.length+(n.length>>1)),s=0,a=function(t){i[s++]=t},o=0;o<e;++o){if(s+5>i.length){var h=new t(s+8+(e-o<<1));h.set(i),i=h}var f=n.charCodeAt(o);f<128||r?a(f):f<2048?(a(192|f>>6),a(128|63&f)):f>55295&&f<57344?(a(240|(f=65536+(1047552&f)|1023&n.charCodeAt(++o))>>18),a(128|f>>12&63),a(128|f>>6&63),a(128|63&f)):(a(224|f>>12),a(128|f>>6&63),a(128|63&f))}return b(i,0,s)}const N=new class{constructor(){this._init()}clear(){this._init()}addEvent(t){if(!t)throw new Error("Adding invalid event");const n=this._hasEvents?",":"";this.stream.push(n+t),this._hasEvents=!0}finish(){this.stream.push("]",!0);const t=function(t){let n=0;for(const r of t)n+=r.length;const r=new Uint8Array(n);for(let n=0,e=0,i=t.length;n<i;n++){const i=t[n];r.set(i,e),e+=i.length}return r}(this._deflatedData);return this._init(),t}_init(){this._hasEvents=!1,this._deflatedData=[],this.deflate=new B,this.deflate.ondata=(t,n)=>{this._deflatedData.push(t)},this.stream=new J((t,n)=>{this.deflate.push(t,n)}),this.stream.push("[")}},P={clear:()=>{N.clear()},addEvent:t=>N.addEvent(t),finish:()=>N.finish(),compress:t=>function(t){return q(K(t))}(t)};addEventListener("message",function(t){const n=t.data.method,r=t.data.id,e=t.data.arg;if(n in P&&"function"==typeof P[n])try{const t=P[n](e);postMessage({id:r,method:n,success:!0,response:t})}catch(t){postMessage({id:r,method:n,success:!1,response:t.message}),console.error(t)}}),postMessage({id:void 0,method:"init",success:!0,response:void 0});`;
function e() {
	const e2 = new Blob([r$1]);
	return URL.createObjectURL(e2);
}
var CONSOLE_LEVELS = [
	"log",
	"warn",
	"error"
];
var PREFIX = "[Replay] ";
function _addBreadcrumb(message, level = "info") {
	addBreadcrumb({
		category: "console",
		data: { logger: "replay" },
		level,
		message: `${PREFIX}${message}`
	}, { level });
}
function makeReplayDebugLogger() {
	let _capture = false;
	let _trace = false;
	const _debug = {
		exception: () => void 0,
		infoTick: () => void 0,
		setConfig: (opts) => {
			_capture = !!opts.captureExceptions;
			_trace = !!opts.traceInternals;
		}
	};
	if (DEBUG_BUILD$1) {
		CONSOLE_LEVELS.forEach((name) => {
			_debug[name] = (...args) => {
				debug$1[name](PREFIX, ...args);
				if (_trace) _addBreadcrumb(args.join(""), severityLevelFromString(name));
			};
		});
		_debug.exception = (error, ...message) => {
			if (message.length && _debug.error) _debug.error(...message);
			debug$1.error(PREFIX, error);
			if (_capture) captureException(error, { mechanism: {
				handled: true,
				type: "auto.function.replay.debug"
			} });
			else if (_trace) _addBreadcrumb(error, "error");
		};
		_debug.infoTick = (...args) => {
			debug$1.log(PREFIX, ...args);
			if (_trace) setTimeout(() => _addBreadcrumb(args[0]), 0);
		};
	} else CONSOLE_LEVELS.forEach((name) => {
		_debug[name] = () => void 0;
	});
	return _debug;
}
var debug = makeReplayDebugLogger();
var EventBufferSizeExceededError = class extends Error {
	constructor() {
		super(`Event buffer exceeded maximum size of ${REPLAY_MAX_EVENT_BUFFER_SIZE}.`);
	}
};
var EventBufferArray = class {
	constructor() {
		this.events = [];
		this._totalSize = 0;
		this.hasCheckout = false;
		this.waitForCheckout = false;
	}
	/** @inheritdoc */
	get hasEvents() {
		return this.events.length > 0;
	}
	/** @inheritdoc */
	get type() {
		return "sync";
	}
	/** @inheritdoc */
	destroy() {
		this.events = [];
	}
	/** @inheritdoc */
	async addEvent(event) {
		const eventSize = JSON.stringify(event).length;
		this._totalSize += eventSize;
		if (this._totalSize > REPLAY_MAX_EVENT_BUFFER_SIZE) throw new EventBufferSizeExceededError();
		this.events.push(event);
	}
	/** @inheritdoc */
	finish() {
		return new Promise((resolve) => {
			const eventsRet = this.events;
			this.clear();
			resolve(JSON.stringify(eventsRet));
		});
	}
	/** @inheritdoc */
	clear() {
		this.events = [];
		this._totalSize = 0;
		this.hasCheckout = false;
	}
	/** @inheritdoc */
	getEarliestTimestamp() {
		let ts = null;
		for (const { timestamp } of this.events) if (ts === null || timestamp < ts) ts = timestamp;
		return ts === null ? ts : timestampToMs(ts);
	}
};
var WorkerHandler = class {
	constructor(worker) {
		this._onMessage = ({ data }) => {
			const response = data;
			if (typeof response.id !== "number") return;
			const pending = this._pending.get(response.id);
			if (!pending || pending.method !== response.method) return;
			this._pending.delete(response.id);
			if (!response.success) {
				DEBUG_BUILD$1 && debug.error("Error in compression worker: ", response.response);
				pending.reject(/* @__PURE__ */ new Error("Error in compression worker"));
				return;
			}
			pending.resolve(response.response);
		};
		this._worker = worker;
		this._id = 0;
		this._pending = /* @__PURE__ */ new Map();
		this._worker.addEventListener("message", this._onMessage);
	}
	/**
	* Ensure the worker is ready (or not).
	* This will either resolve when the worker is ready, or reject if an error occurred.
	*/
	ensureReady() {
		if (this._ensureReadyPromise) return this._ensureReadyPromise;
		this._ensureReadyPromise = new Promise((resolve, reject) => {
			this._worker.addEventListener("message", ({ data }) => {
				if (data.success) resolve();
				else {
					DEBUG_BUILD$1 && debug.warn("Received worker message with unsuccessful status", data);
					reject(/* @__PURE__ */ new Error("Received worker message with unsuccessful status"));
				}
			}, { once: true });
			this._worker.addEventListener("error", (error) => {
				DEBUG_BUILD$1 && debug.warn("Failed to load Replay compression worker", error);
				reject(/* @__PURE__ */ new Error(`Failed to load Replay compression worker: ${error instanceof ErrorEvent && error.message ? error.message : "Unknown error. This can happen due to CSP policy restrictions, network issues, or the worker script failing to load."}`));
			}, { once: true });
		});
		return this._ensureReadyPromise;
	}
	/**
	* Destroy the worker.
	*/
	destroy() {
		DEBUG_BUILD$1 && debug.log("Destroying compression worker");
		this._worker.removeEventListener("message", this._onMessage);
		this._pending.forEach((pending) => pending.reject(/* @__PURE__ */ new Error("Worker destroyed")));
		this._pending.clear();
		this._worker.terminate();
	}
	/**
	* Post message to worker and wait for response before resolving promise.
	*/
	postMessage(method, arg) {
		const id = this._getAndIncrementId();
		return new Promise((resolve, reject) => {
			this._pending.set(id, {
				method,
				resolve,
				reject
			});
			try {
				this._worker.postMessage({
					id,
					method,
					arg
				});
			} catch (error) {
				this._pending.delete(id);
				reject(error);
			}
		});
	}
	/** Get the current ID and increment it for the next call. */
	_getAndIncrementId() {
		return this._id++;
	}
};
var EventBufferCompressionWorker = class {
	constructor(worker) {
		this._worker = new WorkerHandler(worker);
		this._earliestTimestamp = null;
		this._totalSize = 0;
		this.hasCheckout = false;
		this.waitForCheckout = false;
	}
	/** @inheritdoc */
	get hasEvents() {
		return !!this._earliestTimestamp;
	}
	/** @inheritdoc */
	get type() {
		return "worker";
	}
	/**
	* Ensure the worker is ready (or not).
	* This will either resolve when the worker is ready, or reject if an error occurred.
	*/
	ensureReady() {
		return this._worker.ensureReady();
	}
	/**
	* Destroy the event buffer.
	*/
	destroy() {
		this._worker.destroy();
	}
	/**
	* Add an event to the event buffer.
	*
	* Returns true if event was successfully received and processed by worker.
	*/
	addEvent(event) {
		const timestamp = timestampToMs(event.timestamp);
		if (!this._earliestTimestamp || timestamp < this._earliestTimestamp) this._earliestTimestamp = timestamp;
		const data = JSON.stringify(event);
		this._totalSize += data.length;
		if (this._totalSize > REPLAY_MAX_EVENT_BUFFER_SIZE) return Promise.reject(new EventBufferSizeExceededError());
		return this._sendEventToWorker(data);
	}
	/**
	* Finish the event buffer and return the compressed data.
	*/
	finish() {
		return this._finishRequest();
	}
	/** @inheritdoc */
	clear() {
		this._earliestTimestamp = null;
		this._totalSize = 0;
		this.hasCheckout = false;
		this._worker.postMessage("clear").then(null, (e) => {
			DEBUG_BUILD$1 && debug.exception(e, "Sending \"clear\" message to worker failed", e);
		});
	}
	/** @inheritdoc */
	getEarliestTimestamp() {
		return this._earliestTimestamp;
	}
	/**
	* Send the event to the worker.
	*/
	_sendEventToWorker(data) {
		return this._worker.postMessage("addEvent", data);
	}
	/**
	* Finish the request and return the compressed data from the worker.
	*/
	async _finishRequest() {
		const response = await this._worker.postMessage("finish");
		this._earliestTimestamp = null;
		this._totalSize = 0;
		return response;
	}
};
var EventBufferProxy = class {
	constructor(worker) {
		this._fallback = new EventBufferArray();
		this._compression = new EventBufferCompressionWorker(worker);
		this._used = this._fallback;
		this._ensureWorkerIsLoadedPromise = this._ensureWorkerIsLoaded();
	}
	/** @inheritdoc */
	get waitForCheckout() {
		return this._used.waitForCheckout;
	}
	/** @inheritdoc */
	get type() {
		return this._used.type;
	}
	/** @inheritDoc */
	get hasEvents() {
		return this._used.hasEvents;
	}
	/** @inheritdoc */
	get hasCheckout() {
		return this._used.hasCheckout;
	}
	/** @inheritdoc */
	set hasCheckout(value) {
		this._used.hasCheckout = value;
	}
	/** @inheritdoc */
	set waitForCheckout(value) {
		this._used.waitForCheckout = value;
	}
	/** @inheritDoc */
	destroy() {
		this._fallback.destroy();
		this._compression.destroy();
	}
	/** @inheritdoc */
	clear() {
		return this._used.clear();
	}
	/** @inheritdoc */
	getEarliestTimestamp() {
		return this._used.getEarliestTimestamp();
	}
	/**
	* Add an event to the event buffer.
	*
	* Returns true if event was successfully added.
	*/
	addEvent(event) {
		return this._used.addEvent(event);
	}
	/** @inheritDoc */
	async finish() {
		await this.ensureWorkerIsLoaded();
		return this._used.finish();
	}
	/** Ensure the worker has loaded. */
	ensureWorkerIsLoaded() {
		return this._ensureWorkerIsLoadedPromise;
	}
	/** Actually check if the worker has been loaded. */
	async _ensureWorkerIsLoaded() {
		try {
			await this._compression.ensureReady();
		} catch (error) {
			DEBUG_BUILD$1 && debug.exception(error, "Failed to load the compression worker, falling back to simple buffer");
			return;
		}
		await this._switchToCompressionWorker();
	}
	/** Switch the used buffer to the compression worker. */
	async _switchToCompressionWorker() {
		const { events, hasCheckout, waitForCheckout } = this._fallback;
		const addEventPromises = [];
		for (const event of events) addEventPromises.push(this._compression.addEvent(event));
		this._compression.hasCheckout = hasCheckout;
		this._compression.waitForCheckout = waitForCheckout;
		this._used = this._compression;
		try {
			await Promise.all(addEventPromises);
			this._fallback.clear();
		} catch (error) {
			DEBUG_BUILD$1 && debug.exception(error, "Failed to add events when switching buffers.");
		}
	}
};
function createEventBuffer({ useCompression, workerUrl: customWorkerUrl }) {
	if (useCompression && window.Worker) {
		const worker = _loadWorker(customWorkerUrl);
		if (worker) return worker;
	}
	DEBUG_BUILD$1 && debug.log("Using simple buffer");
	return new EventBufferArray();
}
function _loadWorker(customWorkerUrl) {
	try {
		const workerUrl = customWorkerUrl || _getWorkerUrl();
		if (!workerUrl) return;
		DEBUG_BUILD$1 && debug.log(`Using compression worker${customWorkerUrl ? ` from ${customWorkerUrl}` : ""}`);
		return new EventBufferProxy(new Worker(workerUrl));
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "Failed to create compression worker");
	}
}
function _getWorkerUrl() {
	if (typeof __SENTRY_EXCLUDE_REPLAY_WORKER__ === "undefined" || !__SENTRY_EXCLUDE_REPLAY_WORKER__) return e();
	return "";
}
function hasSessionStorage() {
	try {
		return "sessionStorage" in WINDOW && !!WINDOW.sessionStorage;
	} catch {
		return false;
	}
}
function clearSession(replay) {
	deleteSession();
	replay.session = void 0;
}
function deleteSession() {
	if (!hasSessionStorage()) return;
	try {
		WINDOW.sessionStorage.removeItem(REPLAY_SESSION_KEY);
	} catch {}
}
function isSampled(sampleRate) {
	if (sampleRate === void 0) return false;
	return Math.random() < sampleRate;
}
function saveSession(session) {
	if (!hasSessionStorage()) return;
	try {
		WINDOW.sessionStorage.setItem(REPLAY_SESSION_KEY, JSON.stringify(session));
	} catch {}
}
function makeSession(session) {
	const now = Date.now();
	return {
		id: session.id || uuid4(),
		started: session.started || now,
		lastActivity: session.lastActivity || now,
		segmentId: session.segmentId || 0,
		sampled: session.sampled,
		previousSessionId: session.previousSessionId,
		dirty: session.dirty || false
	};
}
function getSessionSampleType(sessionSampleRate, allowBuffering) {
	return isSampled(sessionSampleRate) ? "session" : allowBuffering ? "buffer" : false;
}
function createSession({ sessionSampleRate, allowBuffering, stickySession = false }, { previousSessionId } = {}) {
	const session = makeSession({
		sampled: getSessionSampleType(sessionSampleRate, allowBuffering),
		previousSessionId
	});
	if (stickySession) saveSession(session);
	return session;
}
function fetchSession() {
	if (!hasSessionStorage()) return null;
	try {
		const sessionStringFromStorage = WINDOW.sessionStorage.getItem(REPLAY_SESSION_KEY);
		if (!sessionStringFromStorage) return null;
		const sessionObj = JSON.parse(sessionStringFromStorage);
		DEBUG_BUILD$1 && debug.infoTick("Loading existing session");
		return makeSession(sessionObj);
	} catch {
		return null;
	}
}
function isExpired(initialTime, expiry, targetTime = +/* @__PURE__ */ new Date()) {
	if (initialTime === null || expiry === void 0 || expiry < 0) return true;
	if (expiry === 0) return false;
	return initialTime + expiry <= targetTime;
}
function isSessionExpired(session, { maxReplayDuration, sessionIdleExpire, targetTime = Date.now() }) {
	return isExpired(session.started, maxReplayDuration, targetTime) || isExpired(session.lastActivity, sessionIdleExpire, targetTime);
}
function shouldRefreshSession(session, { sessionIdleExpire, maxReplayDuration }) {
	if (!isSessionExpired(session, {
		sessionIdleExpire,
		maxReplayDuration
	})) return false;
	if (session.sampled === "buffer" && session.segmentId === 0) return false;
	return true;
}
function loadOrCreateSession({ sessionIdleExpire, maxReplayDuration, previousSessionId }, sessionOptions) {
	const existingSession = sessionOptions.stickySession && fetchSession();
	if (!existingSession) {
		DEBUG_BUILD$1 && debug.infoTick("Creating new session");
		return createSession(sessionOptions, { previousSessionId });
	}
	if (!shouldRefreshSession(existingSession, {
		sessionIdleExpire,
		maxReplayDuration
	})) return existingSession;
	DEBUG_BUILD$1 && debug.infoTick("Session in sessionStorage is expired, creating new one...");
	return createSession(sessionOptions, { previousSessionId: existingSession.id });
}
function isCustomEvent(event) {
	return event.type === EventType.Custom;
}
function addEventSync(replay, event, isCheckout) {
	if (!shouldAddEvent(replay, event)) return false;
	_addEvent(replay, event, isCheckout);
	return true;
}
function addEvent(replay, event, isCheckout) {
	if (!shouldAddEvent(replay, event)) return Promise.resolve(null);
	return _addEvent(replay, event, isCheckout);
}
async function _addEvent(replay, event, isCheckout) {
	const { eventBuffer } = replay;
	if (!eventBuffer || eventBuffer.waitForCheckout && !isCheckout) return null;
	const isBufferMode = replay.recordingMode === "buffer";
	try {
		if (isCheckout && isBufferMode) eventBuffer.clear();
		if (isCheckout) {
			eventBuffer.hasCheckout = true;
			eventBuffer.waitForCheckout = false;
		}
		const eventAfterPossibleCallback = maybeApplyCallback(event, replay.getOptions().beforeAddRecordingEvent);
		if (!eventAfterPossibleCallback) return;
		return await eventBuffer.addEvent(eventAfterPossibleCallback);
	} catch (error) {
		if (!replay.isEnabled()) {
			replay.handleException(error);
			return null;
		}
		const isExceeded = error && error instanceof EventBufferSizeExceededError;
		const reason = isExceeded ? "eventBufferOverflow" : "eventBufferError";
		const client = getClient();
		if (client) {
			const dropReason = isExceeded ? "buffer_overflow" : "internal_sdk_error";
			client.recordDroppedEvent(dropReason, "replay");
		}
		if (isExceeded && isBufferMode) {
			eventBuffer.clear();
			eventBuffer.waitForCheckout = true;
			return null;
		}
		replay.handleException(error);
		await replay.stop({ reason });
	}
}
function shouldAddEvent(replay, event) {
	if (!replay.eventBuffer || replay.isPaused() || !replay.isEnabled()) return false;
	const timestampInMs = timestampToMs(event.timestamp);
	if (timestampInMs + replay.timeouts.sessionIdlePause < Date.now()) return false;
	if (timestampInMs > replay.getContext().initialTimestamp + replay.getOptions().maxReplayDuration) {
		DEBUG_BUILD$1 && debug.infoTick(`Skipping event with timestamp ${timestampInMs} because it is after maxReplayDuration`);
		return false;
	}
	return true;
}
function maybeApplyCallback(event, callback) {
	try {
		if (typeof callback === "function" && isCustomEvent(event)) return callback(event);
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "An error occurred in the `beforeAddRecordingEvent` callback, skipping the event...");
		return null;
	}
	return event;
}
var MAX_CONTEXT_VALUES = 100;
function addSegmentDetailsToContext(replay, traceId, segmentName) {
	const replayContext = replay.getContext();
	if (traceId && replayContext.traceIds.size < MAX_CONTEXT_VALUES) replayContext.traceIds.add(traceId);
	if (segmentName && replayContext.segmentNames.size < MAX_CONTEXT_VALUES) replayContext.segmentNames.add(segmentName);
}
function handleProcessSegmentSpan(replay) {
	return (spanJSON) => {
		if (!replay.isEnabled()) return;
		addSegmentDetailsToContext(replay, spanJSON.trace_id, spanJSON.name || void 0);
	};
}
function isErrorEvent(event) {
	return !event.type;
}
function isTransactionEvent(event) {
	return event.type === "transaction";
}
function isReplayEvent(event) {
	return event.type === "replay_event";
}
function isFeedbackEvent(event) {
	return event.type === "feedback";
}
function handleAfterSendEvent(replay) {
	return (event, sendResponse) => {
		if (!replay.isEnabled() || !isErrorEvent(event) && !isTransactionEvent(event)) return;
		const statusCode = sendResponse.statusCode;
		if (!statusCode || statusCode < 200 || statusCode >= 300) return;
		if (isTransactionEvent(event)) {
			handleTransactionEvent(replay, event);
			return;
		}
		handleErrorEvent(replay, event);
	};
}
function handleTransactionEvent(replay, event) {
	addSegmentDetailsToContext(replay, event.contexts?.trace?.trace_id, event.transaction);
}
function handleErrorEvent(replay, event) {
	const replayContext = replay.getContext();
	if (event.event_id && replayContext.errorIds.size < 100) replayContext.errorIds.add(event.event_id);
	if (replay.recordingMode !== "buffer" || !event.tags?.replayId) return;
	const { beforeErrorSampling } = replay.getOptions();
	if (typeof beforeErrorSampling === "function" && !beforeErrorSampling(event)) return;
	setTimeout$3(async () => {
		try {
			await replay.sendBufferedReplayOrFlush();
		} catch (err) {
			replay.handleException(err);
		}
	});
}
function handleBeforeSendEvent(replay) {
	return (event) => {
		if (!replay.isEnabled() || !isErrorEvent(event)) return;
		handleHydrationError(replay, event);
	};
}
function handleHydrationError(replay, event) {
	const exceptionValue = event.exception?.values?.[0]?.value;
	if (typeof exceptionValue !== "string") return;
	if (exceptionValue.match(/(reactjs\.org\/docs\/error-decoder\.html\?invariant=|react\.dev\/errors\/)(418|419|422|423|425)/) || exceptionValue.match(/(does not match server-rendered HTML|Hydration failed because)/i)) addBreadcrumbEvent(replay, createBreadcrumb({
		category: "replay.hydrate-error",
		data: { url: getLocationHref() }
	}));
}
function handleBreadcrumbs(replay) {
	const client = getClient();
	if (!client) return;
	client.on("beforeAddBreadcrumb", (breadcrumb) => beforeAddBreadcrumb(replay, breadcrumb));
}
function beforeAddBreadcrumb(replay, breadcrumb) {
	if (!replay.isEnabled() || !isBreadcrumbWithCategory(breadcrumb)) return;
	const result = normalizeBreadcrumb(breadcrumb);
	if (result) addBreadcrumbEvent(replay, result);
}
function normalizeBreadcrumb(breadcrumb) {
	if (!isBreadcrumbWithCategory(breadcrumb) || [
		"fetch",
		"xhr",
		"sentry.event",
		"sentry.transaction"
	].includes(breadcrumb.category) || breadcrumb.category.startsWith("ui.")) return null;
	if (breadcrumb.category === "console") return normalizeConsoleBreadcrumb(breadcrumb);
	return createBreadcrumb(breadcrumb);
}
function normalizeConsoleBreadcrumb(breadcrumb) {
	const args = breadcrumb.data?.arguments;
	if (!Array.isArray(args) || args.length === 0) return createBreadcrumb(breadcrumb);
	let isTruncated = false;
	const normalizedArgs = args.map((arg) => {
		if (!arg) return arg;
		if (typeof arg === "string") {
			if (arg.length > CONSOLE_ARG_MAX_SIZE) {
				isTruncated = true;
				return `${arg.slice(0, CONSOLE_ARG_MAX_SIZE)}\u2026`;
			}
			return arg;
		}
		if (typeof arg === "object") try {
			const normalizedArg = normalize(arg, 7);
			if (JSON.stringify(normalizedArg).length > CONSOLE_ARG_MAX_SIZE) {
				isTruncated = true;
				return `${JSON.stringify(normalizedArg, null, 2).slice(0, CONSOLE_ARG_MAX_SIZE)}\u2026`;
			}
			return normalizedArg;
		} catch {}
		return arg;
	});
	return createBreadcrumb({
		...breadcrumb,
		data: {
			...breadcrumb.data,
			arguments: normalizedArgs,
			...isTruncated ? { _meta: { warnings: ["CONSOLE_ARG_TRUNCATED"] } } : {}
		}
	});
}
function isBreadcrumbWithCategory(breadcrumb) {
	return !!breadcrumb.category;
}
function isRrwebError(event, hint) {
	if (event.type || !event.exception?.values?.length) return false;
	if (hint.originalException?.__rrweb__) return true;
	return false;
}
function resetReplayIdOnDynamicSamplingContext() {
	const dsc = getCurrentScope().getPropagationContext().dsc;
	if (dsc) delete dsc.replay_id;
	const activeSpan = getActiveSpan();
	if (activeSpan) {
		const dsc2 = getDynamicSamplingContextFromSpan(activeSpan);
		delete dsc2.replay_id;
	}
}
function setReplayIdOnDynamicSamplingContext(replayId) {
	const dsc = getCurrentScope().getPropagationContext().dsc;
	if (dsc) dsc.replay_id = replayId;
	const activeSpan = getActiveSpan();
	if (activeSpan) {
		const dsc2 = getDynamicSamplingContextFromSpan(activeSpan);
		dsc2.replay_id = replayId;
	}
}
function addFeedbackBreadcrumb(replay, event) {
	replay.triggerUserActivity();
	replay.addUpdate(() => {
		if (!event.timestamp) return true;
		replay.throttledAddEvent({
			type: EventType.Custom,
			timestamp: event.timestamp * 1e3,
			data: {
				tag: "breadcrumb",
				payload: {
					timestamp: event.timestamp,
					type: "default",
					category: "sentry.feedback",
					data: { feedbackId: event.event_id }
				}
			}
		});
		return false;
	});
}
function shouldSampleForBufferEvent(replay, event) {
	if (replay.recordingMode !== "buffer") return false;
	if (event.message === UNABLE_TO_SEND_REPLAY) return false;
	if (!event.exception || event.type) return false;
	return isSampled(replay.getOptions().errorSampleRate);
}
function handleGlobalEventListener(replay) {
	return Object.assign((event, hint) => {
		if (replay.session && shouldRefreshSession(replay.session, {
			maxReplayDuration: replay.getOptions().maxReplayDuration,
			sessionIdleExpire: replay.timeouts.sessionIdleExpire
		})) resetReplayIdOnDynamicSamplingContext();
		if (!replay.isEnabled() || replay.isPaused()) return event;
		if (isReplayEvent(event)) {
			delete event.breadcrumbs;
			return event;
		}
		if (!isErrorEvent(event) && !isTransactionEvent(event) && !isFeedbackEvent(event)) return event;
		if (!replay.checkAndHandleExpiredSession()) {
			resetReplayIdOnDynamicSamplingContext();
			return event;
		}
		if (isFeedbackEvent(event)) {
			replay.flush();
			event.contexts.feedback.replay_id = replay.getSessionId();
			addFeedbackBreadcrumb(replay, event);
			return event;
		}
		if (isRrwebError(event, hint) && !replay.getOptions()._experiments.captureExceptions) {
			DEBUG_BUILD$1 && debug.log("Ignoring error from rrweb internals", event);
			return null;
		}
		const isErrorEventSampled = shouldSampleForBufferEvent(replay, event);
		if (isErrorEventSampled || replay.recordingMode === "session") event.tags = {
			...event.tags,
			replayId: replay.getSessionId()
		};
		if (isErrorEventSampled && replay.recordingMode === "buffer" && replay.session?.sampled === "buffer") {
			const session = replay.session;
			session.dirty = true;
			if (replay.getOptions().stickySession) saveSession(session);
		}
		return event;
	}, { id: "Replay" });
}
function createPerformanceSpans(replay, entries) {
	return entries.map(({ type, start, end, name, data }) => {
		const response = replay.throttledAddEvent({
			type: EventType.Custom,
			timestamp: start,
			data: {
				tag: "performanceSpan",
				payload: {
					op: type,
					description: name,
					startTimestamp: start,
					endTimestamp: end,
					data
				}
			}
		});
		return typeof response === "string" ? Promise.resolve(null) : response;
	});
}
function handleHistory(handlerData) {
	const { from, to } = handlerData;
	const now = Date.now() / 1e3;
	return {
		type: "navigation.push",
		start: now,
		end: now,
		name: to,
		data: { previous: from }
	};
}
function handleHistorySpanListener(replay) {
	return (handlerData) => {
		if (!replay.isEnabled()) return;
		const result = handleHistory(handlerData);
		if (result === null) return;
		replay.getContext().urls.push(result.name);
		replay.triggerUserActivity();
		replay.addUpdate(() => {
			createPerformanceSpans(replay, [result]);
			return false;
		});
	};
}
function shouldFilterRequest(replay, url) {
	if (DEBUG_BUILD$1 && replay.getOptions()._experiments.traceInternals) return false;
	return isSentryRequestUrl(url, getClient());
}
function addNetworkBreadcrumb(replay, result) {
	if (!replay.isEnabled()) return;
	if (result === null) return;
	if (shouldFilterRequest(replay, result.name)) return;
	replay.addUpdate(() => {
		createPerformanceSpans(replay, [result]);
		return true;
	});
}
function getBodySize(body) {
	if (!body) return;
	const textEncoder = new TextEncoder();
	try {
		if (typeof body === "string") return textEncoder.encode(body).length;
		if (body instanceof URLSearchParams) return textEncoder.encode(body.toString()).length;
		if (body instanceof FormData) {
			const formDataStr = serializeFormData(body);
			return textEncoder.encode(formDataStr).length;
		}
		if (body instanceof Blob) return body.size;
		if (body instanceof ArrayBuffer) return body.byteLength;
	} catch {}
}
function parseContentLengthHeader(header) {
	if (!header) return;
	const size = parseInt(header, 10);
	return isNaN(size) ? void 0 : size;
}
function mergeWarning(info, warning) {
	if (!info) return {
		headers: {},
		size: void 0,
		_meta: { warnings: [warning] }
	};
	const newMeta = { ...info._meta };
	newMeta.warnings = [...newMeta.warnings || [], warning];
	info._meta = newMeta;
	return info;
}
function makeNetworkReplayBreadcrumb(type, data) {
	if (!data) return null;
	const { startTimestamp, endTimestamp, url, method, statusCode, request, response } = data;
	return {
		type,
		start: startTimestamp / 1e3,
		end: endTimestamp / 1e3,
		name: url,
		data: {
			method,
			statusCode,
			request,
			response
		}
	};
}
function buildSkippedNetworkRequestOrResponse(bodySize) {
	return {
		headers: {},
		size: bodySize,
		_meta: { warnings: ["URL_SKIPPED"] }
	};
}
function buildNetworkRequestOrResponse(headers, bodySize, body) {
	if (!bodySize && Object.keys(headers).length === 0) return;
	if (!bodySize) return { headers };
	if (!body) return {
		headers,
		size: bodySize
	};
	const info = {
		headers,
		size: bodySize
	};
	const { body: normalizedBody, warnings } = normalizeNetworkBody(body);
	info.body = normalizedBody;
	if (warnings?.length) info._meta = { warnings };
	return info;
}
function getAllowedHeaders(headers, allowedHeaders) {
	return Object.entries(headers).reduce((filteredHeaders, [key, value]) => {
		const normalizedKey = key.toLowerCase();
		if (allowedHeaders.includes(normalizedKey) && headers[key]) filteredHeaders[normalizedKey] = value;
		return filteredHeaders;
	}, {});
}
function normalizeNetworkBody(body) {
	if (!body || typeof body !== "string") return { body };
	const exceedsSizeLimit = body.length > NETWORK_BODY_MAX_SIZE;
	const isProbablyJson = _strIsProbablyJson(body);
	if (exceedsSizeLimit) {
		const truncatedBody = body.slice(0, NETWORK_BODY_MAX_SIZE);
		if (isProbablyJson) return {
			body: truncatedBody,
			warnings: ["MAYBE_JSON_TRUNCATED"]
		};
		return {
			body: `${truncatedBody}\u2026`,
			warnings: ["TEXT_TRUNCATED"]
		};
	}
	if (isProbablyJson) try {
		return { body: JSON.parse(body) };
	} catch {}
	return { body };
}
function _strIsProbablyJson(str) {
	const first = str[0];
	const last = str[str.length - 1];
	return first === "[" && last === "]" || first === "{" && last === "}";
}
function urlMatches(url, urls) {
	return stringMatchesSomePattern(getFullUrl(url), urls);
}
function getFullUrl(url, baseURI = WINDOW.document.baseURI) {
	if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith(WINDOW.location.origin)) return url;
	const fixedUrl = new URL(url, baseURI);
	if (fixedUrl.origin !== new URL(baseURI).origin) return url;
	const fullUrl = fixedUrl.href;
	if (!url.endsWith("/") && fullUrl.endsWith("/")) return fullUrl.slice(0, -1);
	return fullUrl;
}
async function captureFetchBreadcrumbToReplay(breadcrumb, hint, options) {
	try {
		const result = makeNetworkReplayBreadcrumb("resource.fetch", await _prepareFetchData(breadcrumb, hint, options));
		addNetworkBreadcrumb(options.replay, result);
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "Failed to capture fetch breadcrumb");
	}
}
function enrichFetchBreadcrumb(breadcrumb, hint) {
	const { input, response } = hint;
	const reqSize = getBodySize(input ? getFetchRequestArgBody(input) : void 0);
	const resSize = response ? parseContentLengthHeader(response.headers.get("content-length")) : void 0;
	if (reqSize !== void 0) breadcrumb.data.request_body_size = reqSize;
	if (resSize !== void 0) breadcrumb.data.response_body_size = resSize;
}
async function _prepareFetchData(breadcrumb, hint, options) {
	const now = Date.now();
	const { startTimestamp = now, endTimestamp = now } = hint;
	const { url, method, status_code: statusCode = 0, request_body_size: requestBodySize, response_body_size: responseBodySize } = breadcrumb.data;
	const captureDetails = urlMatches(url, options.networkDetailAllowUrls) && !urlMatches(url, options.networkDetailDenyUrls);
	return {
		startTimestamp,
		endTimestamp,
		url,
		method,
		statusCode,
		request: captureDetails ? _getRequestInfo(options, hint.input, requestBodySize) : buildSkippedNetworkRequestOrResponse(requestBodySize),
		response: await _getResponseInfo(captureDetails, options, hint.response, responseBodySize)
	};
}
function _getRequestInfo({ networkCaptureBodies, networkRequestHeaders }, input, requestBodySize) {
	const headers = input ? getRequestHeaders(input, networkRequestHeaders) : {};
	if (!networkCaptureBodies) return buildNetworkRequestOrResponse(headers, requestBodySize, void 0);
	const [bodyStr, warning] = getBodyString(getFetchRequestArgBody(input), debug);
	const data = buildNetworkRequestOrResponse(headers, requestBodySize, bodyStr);
	if (warning) return mergeWarning(data, warning);
	return data;
}
async function _getResponseInfo(captureDetails, { networkCaptureBodies, networkResponseHeaders }, response, responseBodySize) {
	if (!captureDetails && responseBodySize !== void 0) return buildSkippedNetworkRequestOrResponse(responseBodySize);
	const headers = response ? getAllHeaders(response.headers, networkResponseHeaders) : {};
	if (!response || !networkCaptureBodies && responseBodySize !== void 0) return buildNetworkRequestOrResponse(headers, responseBodySize, void 0);
	const [bodyText, warning] = await _parseFetchResponseBody(response);
	const result = getResponseData(bodyText, {
		networkCaptureBodies,
		responseBodySize,
		captureDetails,
		headers
	});
	if (warning) return mergeWarning(result, warning);
	return result;
}
function getResponseData(bodyText, { networkCaptureBodies, responseBodySize, captureDetails, headers }) {
	try {
		const size = bodyText?.length && responseBodySize === void 0 ? getBodySize(bodyText) : responseBodySize;
		if (!captureDetails) return buildSkippedNetworkRequestOrResponse(size);
		if (networkCaptureBodies) return buildNetworkRequestOrResponse(headers, size, bodyText);
		return buildNetworkRequestOrResponse(headers, size, void 0);
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "Failed to serialize response body");
		return buildNetworkRequestOrResponse(headers, responseBodySize, void 0);
	}
}
async function _parseFetchResponseBody(response) {
	const res = _tryCloneResponse(response);
	if (!res) return [void 0, "BODY_PARSE_ERROR"];
	try {
		return [await _tryGetResponseText(res)];
	} catch (error) {
		if (error instanceof Error && error.message.indexOf("Timeout") > -1) {
			DEBUG_BUILD$1 && debug.warn("Parsing text body from response timed out");
			return [void 0, "BODY_PARSE_TIMEOUT"];
		}
		DEBUG_BUILD$1 && debug.exception(error, "Failed to get text body from response");
		return [void 0, "BODY_PARSE_ERROR"];
	}
}
function getAllHeaders(headers, allowedHeaders) {
	const allHeaders = {};
	allowedHeaders.forEach((header) => {
		if (headers.get(header)) allHeaders[header] = headers.get(header);
	});
	return allHeaders;
}
function getRequestHeaders(fetchArgs, allowedHeaders) {
	if (fetchArgs.length === 1 && typeof fetchArgs[0] !== "string") return getHeadersFromOptions(fetchArgs[0], allowedHeaders);
	if (fetchArgs.length === 2) return getHeadersFromOptions(fetchArgs[1], allowedHeaders);
	return {};
}
function getHeadersFromOptions(input, allowedHeaders) {
	if (!input) return {};
	const headers = input.headers;
	if (!headers) return {};
	if (headers instanceof Headers) return getAllHeaders(headers, allowedHeaders);
	if (Array.isArray(headers)) return {};
	return getAllowedHeaders(headers, allowedHeaders);
}
function _tryCloneResponse(response) {
	try {
		return response.clone();
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "Failed to clone response body");
	}
}
function _tryGetResponseText(response) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout$3(() => reject(/* @__PURE__ */ new Error("Timeout while trying to read response body")), 500);
		_getResponseText(response).then((txt) => resolve(txt), (reason) => reject(reason)).finally(() => clearTimeout(timeout));
	});
}
async function _getResponseText(response) {
	return await response.text();
}
async function captureXhrBreadcrumbToReplay(breadcrumb, hint, options) {
	try {
		const result = makeNetworkReplayBreadcrumb("resource.xhr", _prepareXhrData(breadcrumb, hint, options));
		addNetworkBreadcrumb(options.replay, result);
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "Failed to capture xhr breadcrumb");
	}
}
function enrichXhrBreadcrumb(breadcrumb, hint) {
	const { xhr, input } = hint;
	if (!xhr) return;
	const reqSize = getBodySize(input);
	const resSize = xhr.getResponseHeader("content-length") ? parseContentLengthHeader(xhr.getResponseHeader("content-length")) : _getBodySize(xhr.response, xhr.responseType);
	if (reqSize !== void 0) breadcrumb.data.request_body_size = reqSize;
	if (resSize !== void 0) breadcrumb.data.response_body_size = resSize;
}
function _prepareXhrData(breadcrumb, hint, options) {
	const now = Date.now();
	const { startTimestamp = now, endTimestamp = now, input, xhr } = hint;
	const { url, method, status_code: statusCode = 0, request_body_size: requestBodySize, response_body_size: responseBodySize } = breadcrumb.data;
	if (!url) return null;
	if (!xhr || !urlMatches(url, options.networkDetailAllowUrls) || urlMatches(url, options.networkDetailDenyUrls)) return {
		startTimestamp,
		endTimestamp,
		url,
		method,
		statusCode,
		request: buildSkippedNetworkRequestOrResponse(requestBodySize),
		response: buildSkippedNetworkRequestOrResponse(responseBodySize)
	};
	const xhrInfo = xhr[SENTRY_XHR_DATA_KEY];
	const networkRequestHeaders = xhrInfo ? getAllowedHeaders(xhrInfo.request_headers, options.networkRequestHeaders) : {};
	const networkResponseHeaders = getAllowedHeaders(parseXhrResponseHeaders(xhr), options.networkResponseHeaders);
	const [requestBody, requestWarning] = options.networkCaptureBodies ? getBodyString(input, debug) : [void 0];
	const [responseBody, responseWarning] = options.networkCaptureBodies ? _getXhrResponseBody(xhr) : [void 0];
	const request = buildNetworkRequestOrResponse(networkRequestHeaders, requestBodySize, requestBody);
	const response = buildNetworkRequestOrResponse(networkResponseHeaders, responseBodySize, responseBody);
	return {
		startTimestamp,
		endTimestamp,
		url,
		method,
		statusCode,
		request: requestWarning ? mergeWarning(request, requestWarning) : request,
		response: responseWarning ? mergeWarning(response, responseWarning) : response
	};
}
function _getXhrResponseBody(xhr) {
	const errors = [];
	try {
		return [xhr.responseText];
	} catch (e) {
		errors.push(e);
	}
	try {
		return _parseXhrResponse(xhr.response, xhr.responseType);
	} catch (e) {
		errors.push(e);
	}
	DEBUG_BUILD$1 && debug.warn("Failed to get xhr response body", ...errors);
	return [void 0];
}
function _parseXhrResponse(body, responseType) {
	try {
		if (typeof body === "string") return [body];
		if (body instanceof Document) return [body.body.outerHTML];
		if (responseType === "json" && isObjectLike(body)) return [JSON.stringify(body)];
		if (!body) return [void 0];
	} catch (error) {
		DEBUG_BUILD$1 && debug.exception(error, "Failed to serialize body", body);
		return [void 0, "BODY_PARSE_ERROR"];
	}
	DEBUG_BUILD$1 && debug.log("Skipping network body because of body type", body);
	return [void 0, "UNPARSEABLE_BODY_TYPE"];
}
function _getBodySize(body, responseType) {
	try {
		return getBodySize(responseType === "json" && isObjectLike(body) ? JSON.stringify(body) : body);
	} catch {
		return;
	}
}
function handleNetworkBreadcrumbs(replay) {
	const client = getClient();
	try {
		const { networkDetailAllowUrls, networkDetailDenyUrls, networkCaptureBodies, networkRequestHeaders, networkResponseHeaders } = replay.getOptions();
		const options = {
			replay,
			networkDetailAllowUrls,
			networkDetailDenyUrls,
			networkCaptureBodies,
			networkRequestHeaders,
			networkResponseHeaders
		};
		if (client) client.on("beforeAddBreadcrumb", (breadcrumb, hint) => beforeAddNetworkBreadcrumb(options, breadcrumb, hint));
	} catch {}
}
function beforeAddNetworkBreadcrumb(options, breadcrumb, hint) {
	if (!breadcrumb.data) return;
	try {
		if (_isXhrBreadcrumb(breadcrumb) && _isXhrHint(hint)) {
			enrichXhrBreadcrumb(breadcrumb, hint);
			captureXhrBreadcrumbToReplay(breadcrumb, hint, options);
		}
		if (_isFetchBreadcrumb(breadcrumb) && _isFetchHint(hint)) {
			enrichFetchBreadcrumb(breadcrumb, hint);
			captureFetchBreadcrumbToReplay(breadcrumb, hint, options);
		}
	} catch (e) {
		DEBUG_BUILD$1 && debug.exception(e, "Error when enriching network breadcrumb");
	}
}
function _isXhrBreadcrumb(breadcrumb) {
	return breadcrumb.category === "xhr";
}
function _isFetchBreadcrumb(breadcrumb) {
	return breadcrumb.category === "fetch";
}
function _isXhrHint(hint) {
	return hint?.xhr;
}
function _isFetchHint(hint) {
	return hint?.input !== void 0;
}
function addGlobalListeners(replay) {
	const client = getClient();
	addClickKeypressInstrumentationHandler(handleDomListener(replay));
	addHistoryInstrumentationHandler(handleHistorySpanListener(replay));
	handleBreadcrumbs(replay);
	handleNetworkBreadcrumbs(replay);
	addEventProcessor(handleGlobalEventListener(replay));
	if (client) {
		client.on("beforeSendEvent", handleBeforeSendEvent(replay));
		client.on("afterSendEvent", handleAfterSendEvent(replay));
		client.on("createDsc", (dsc) => {
			const replayId = replay.getSessionId();
			if (replayId && replay.isEnabled() && replay.recordingMode === "session") {
				if (replay.checkAndHandleExpiredSession()) dsc.replay_id = replayId;
			}
		});
		client.on("processSegmentSpan", handleProcessSegmentSpan(replay));
		client.on("spanStart", (span) => {
			replay.lastActiveSpan = span;
		});
		client.on("spanEnd", (span) => {
			replay.lastActiveSpan = span;
		});
		client.on("beforeSendFeedback", async (feedbackEvent, options) => {
			const replayId = replay.getSessionId();
			if (options?.includeReplay && replay.isEnabled() && replayId && feedbackEvent.contexts?.feedback) {
				if (feedbackEvent.contexts.feedback.source === "api") await replay.sendBufferedReplayOrFlush();
				feedbackEvent.contexts.feedback.replay_id = replayId;
			}
		});
		client.on("openFeedbackWidget", async () => {
			await replay.sendBufferedReplayOrFlush();
		});
	}
}
async function addMemoryEntry(replay) {
	try {
		return Promise.all(createPerformanceSpans(replay, [createMemoryEntry(WINDOW.performance.memory)]));
	} catch {
		return [];
	}
}
function createMemoryEntry(memoryEntry) {
	const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = memoryEntry;
	const time = Date.now() / 1e3;
	return {
		type: "memory",
		name: "memory",
		start: time,
		end: time,
		data: { memory: {
			jsHeapSizeLimit,
			totalJSHeapSize,
			usedJSHeapSize
		} }
	};
}
function debounce(func, wait, options) {
	return debounce$1(func, wait, {
		...options,
		setTimeoutImpl: setTimeout$3
	});
}
var NAVIGATOR = GLOBAL_OBJ.navigator;
function getRecordingSamplingOptions() {
	if (/iPhone|iPad|iPod/i.test(NAVIGATOR?.userAgent ?? "") || /Macintosh/i.test(NAVIGATOR?.userAgent ?? "") && NAVIGATOR?.maxTouchPoints && NAVIGATOR?.maxTouchPoints > 1) return { sampling: { mousemove: false } };
	return {};
}
function getHandleRecordingEmit(replay) {
	let hadFirstEvent = false;
	return (event, _isCheckout) => {
		try {
			if (!replay.checkAndHandleExpiredSession()) {
				DEBUG_BUILD$1 && debug.warn("Received replay event after session expired.");
				return;
			}
			const isCheckout = _isCheckout || !hadFirstEvent;
			hadFirstEvent = true;
			syncMirrorAttributesFromMutationEvent(event);
			if (replay.clickDetector) updateClickDetectorForRecordingEvent(replay.clickDetector, event);
			replay.addUpdate(() => {
				if (replay.recordingMode === "buffer" && isCheckout) replay.setInitialState();
				if (!addEventSync(replay, event, isCheckout)) return true;
				if (!isCheckout) return false;
				const session = replay.session;
				addSettingsEvent(replay, isCheckout);
				if (replay.recordingMode === "buffer" && session && replay.eventBuffer && !session.dirty) {
					const earliestEvent = replay.eventBuffer.getEarliestTimestamp();
					if (earliestEvent) {
						DEBUG_BUILD$1 && debug.log(`Updating session start time to earliest event in buffer to ${new Date(earliestEvent)}`);
						session.started = earliestEvent;
						if (replay.getOptions().stickySession) saveSession(session);
					}
				}
				if (session?.previousSessionId) return true;
				if (replay.recordingMode === "session") replay.flush();
				return true;
			});
		} catch (error) {
			replay.handleException(error);
		}
	};
}
function syncMirrorAttributesFromMutationEvent(event) {
	const data = event.data;
	if (event.type !== EventType.IncrementalSnapshot || !data || typeof data !== "object" || !("source" in data) || data.source !== IncrementalSource.Mutation || !("attributes" in data) || !Array.isArray(data.attributes)) return;
	for (const mutation of data.attributes) {
		const node = record.mirror.getNode(mutation.id);
		const meta = node && record.mirror.getMeta(node);
		if (meta?.type !== NodeType.Element) continue;
		for (const [attributeName, value] of Object.entries(mutation.attributes)) if (value === null) delete meta.attributes[attributeName];
		else meta.attributes[attributeName] = value;
	}
}
function createOptionsEvent(replay) {
	const options = replay.getOptions();
	return {
		type: EventType.Custom,
		timestamp: Date.now(),
		data: {
			tag: "options",
			payload: {
				shouldRecordCanvas: replay.isRecordingCanvas(),
				sessionSampleRate: options.sessionSampleRate,
				errorSampleRate: options.errorSampleRate,
				useCompressionOption: options.useCompression,
				blockAllMedia: options.blockAllMedia,
				maskAllText: options.maskAllText,
				maskAllInputs: options.maskAllInputs,
				useCompression: replay.eventBuffer ? replay.eventBuffer.type === "worker" : false,
				networkDetailHasUrls: options.networkDetailAllowUrls.length > 0,
				networkCaptureBodies: options.networkCaptureBodies,
				networkRequestHasHeaders: options.networkRequestHeaders.length > 0,
				networkResponseHasHeaders: options.networkResponseHeaders.length > 0
			}
		}
	};
}
function addSettingsEvent(replay, isCheckout) {
	if (!isCheckout || replay.session?.segmentId !== 0) return;
	addEventSync(replay, createOptionsEvent(replay), false);
}
function closestElementOfNode$2(node) {
	if (!node) return null;
	try {
		return node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
	} catch {
		return null;
	}
}
function createReplayEnvelope(replayEvent, recordingData, dsn, tunnel) {
	return createEnvelope(createEventEnvelopeHeaders(replayEvent, getSdkMetadataForEnvelopeHeader(replayEvent), tunnel, dsn), [[{ type: "replay_event" }, replayEvent], [{
		type: "replay_recording",
		length: typeof recordingData === "string" ? new TextEncoder().encode(recordingData).length : recordingData.length
	}, recordingData]]);
}
function prepareRecordingData({ recordingData, headers }) {
	let payloadWithSequence;
	const replayHeaders = `${JSON.stringify(headers)}
`;
	if (typeof recordingData === "string") payloadWithSequence = `${replayHeaders}${recordingData}`;
	else {
		const sequence = new TextEncoder().encode(replayHeaders);
		payloadWithSequence = new Uint8Array(sequence.length + recordingData.length);
		payloadWithSequence.set(sequence);
		payloadWithSequence.set(recordingData, sequence.length);
	}
	return payloadWithSequence;
}
async function prepareReplayEvent({ client, scope, replayId: event_id, event }) {
	const eventHint = {
		event_id,
		integrations: typeof client["_integrations"] === "object" && client["_integrations"] !== null && !Array.isArray(client["_integrations"]) ? Object.keys(client["_integrations"]) : void 0
	};
	client.emit("preprocessEvent", event, eventHint);
	const preparedEvent = await prepareEvent(client.getOptions(), event, eventHint, scope, client, getIsolationScope());
	if (!preparedEvent) return null;
	client.emit("postprocessEvent", preparedEvent, eventHint);
	preparedEvent.platform = preparedEvent.platform || "javascript";
	const { name, version, settings } = client.getSdkMetadata()?.sdk || {};
	preparedEvent.sdk = {
		...preparedEvent.sdk,
		name: name || "sentry.javascript.unknown",
		version: version || "0.0.0",
		settings
	};
	return preparedEvent;
}
async function sendReplayRequest({ recordingData, replayId, segmentId: segment_id, eventContext, timestamp, session }) {
	const preparedRecordingData = prepareRecordingData({
		recordingData,
		headers: { segment_id }
	});
	const { urls, errorIds, traceIds, segmentNames, initialTimestamp } = eventContext;
	const client = getClient();
	const scope = getCurrentScope();
	const transport = client?.getTransport();
	const dsn = client?.getDsn();
	if (!client || !transport || !dsn || !session.sampled) return Promise.resolve({});
	const replayEvent = await prepareReplayEvent({
		scope,
		client,
		replayId,
		event: {
			type: REPLAY_EVENT_NAME,
			replay_start_timestamp: initialTimestamp / 1e3,
			timestamp: timestamp / 1e3,
			error_ids: errorIds,
			trace_ids: traceIds,
			segment_names: segmentNames,
			urls,
			replay_id: replayId,
			segment_id,
			replay_type: session.sampled
		}
	});
	if (!replayEvent) {
		client.recordDroppedEvent("event_processor", "replay");
		DEBUG_BUILD$1 && debug.log("An event processor returned `null`, will not send event.");
		return Promise.resolve({});
	}
	delete replayEvent.sdkProcessingMetadata;
	const envelope = createReplayEnvelope(replayEvent, preparedRecordingData, dsn, client.getOptions().tunnel);
	let response;
	try {
		response = await transport.send(envelope);
	} catch (err) {
		const error = /* @__PURE__ */ new Error(UNABLE_TO_SEND_REPLAY);
		try {
			error.cause = err;
		} catch {}
		throw error;
	}
	const rateLimits = updateRateLimits({}, response);
	if (isRateLimited(rateLimits, "replay")) throw new RateLimitError(rateLimits);
	if (typeof response.statusCode === "number" && (response.statusCode < 200 || response.statusCode >= 300)) throw new TransportStatusCodeError(response.statusCode);
	return response;
}
var TransportStatusCodeError = class extends Error {
	constructor(statusCode) {
		super(`Transport returned status code ${statusCode}`);
	}
};
var RateLimitError = class extends Error {
	constructor(rateLimits) {
		super("Rate limit hit");
		this.rateLimits = rateLimits;
	}
};
var ReplayDurationLimitError = class extends Error {
	constructor() {
		super("Session is too long, not sending replay");
	}
};
async function sendReplay(replayData, retryConfig = {
	count: 0,
	interval: RETRY_BASE_INTERVAL
}) {
	const { recordingData, onError } = replayData;
	if (!recordingData.length) return;
	try {
		await sendReplayRequest(replayData);
		return true;
	} catch (err) {
		if (err instanceof TransportStatusCodeError || err instanceof RateLimitError) throw err;
		setContext("Replays", { _retryCount: retryConfig.count });
		if (onError) onError(err);
		if (retryConfig.count >= RETRY_MAX_COUNT) {
			const error = /* @__PURE__ */ new Error(`${UNABLE_TO_SEND_REPLAY} - max retries exceeded`);
			try {
				error.cause = err;
			} catch {}
			throw error;
		}
		retryConfig.interval *= ++retryConfig.count;
		return new Promise((resolve, reject) => {
			setTimeout$3(async () => {
				try {
					await sendReplay(replayData, retryConfig);
					resolve(true);
				} catch (err2) {
					reject(err2);
				}
			}, retryConfig.interval);
		});
	}
}
var THROTTLED = "__THROTTLED";
var SKIPPED = "__SKIPPED";
function throttle(fn, maxCount, durationSeconds) {
	const counter = /* @__PURE__ */ new Map();
	const _cleanup = (now) => {
		const threshold = now - durationSeconds;
		counter.forEach((_value, key) => {
			if (key < threshold) counter.delete(key);
		});
	};
	const _getTotalCount = () => {
		return [...counter.values()].reduce((a, b) => a + b, 0);
	};
	let isThrottled = false;
	return (...rest) => {
		const now = Math.floor(Date.now() / 1e3);
		_cleanup(now);
		if (_getTotalCount() >= maxCount) {
			const wasThrottled = isThrottled;
			isThrottled = true;
			return wasThrottled ? SKIPPED : THROTTLED;
		}
		isThrottled = false;
		const count = counter.get(now) || 0;
		counter.set(now, count + 1);
		return fn(...rest);
	};
}
var ReplayContainer = class {
	constructor({ options, recordingOptions }) {
		this.eventBuffer = null;
		this.performanceEntries = [];
		this.replayPerformanceEntries = [];
		this.recordingMode = "session";
		this.timeouts = {
			sessionIdlePause: SESSION_IDLE_PAUSE_DURATION,
			sessionIdleExpire: SESSION_IDLE_EXPIRE_DURATION
		};
		this._lastActivity = Date.now();
		this._isEnabled = false;
		this._isPaused = false;
		this._requiresManualStart = false;
		this._hasInitializedCoreListeners = false;
		this._context = {
			errorIds: /* @__PURE__ */ new Set(),
			traceIds: /* @__PURE__ */ new Set(),
			segmentNames: /* @__PURE__ */ new Set(),
			urls: [],
			initialTimestamp: Date.now(),
			initialUrl: ""
		};
		this._recordingOptions = recordingOptions;
		this._options = options;
		this._debouncedFlush = debounce(() => this._flush(), this._options.flushMinDelay, { maxWait: this._options.flushMaxDelay });
		this._throttledAddEvent = throttle((event, isCheckout) => addEvent(this, event, isCheckout), 300, 5);
		const { slowClickTimeout, slowClickIgnoreSelectors } = this.getOptions();
		const slowClickConfig = slowClickTimeout ? {
			threshold: Math.min(SLOW_CLICK_THRESHOLD, slowClickTimeout),
			timeout: slowClickTimeout,
			scrollTimeout: SLOW_CLICK_SCROLL_TIMEOUT,
			ignoreSelector: slowClickIgnoreSelectors ? slowClickIgnoreSelectors.join(",") : ""
		} : void 0;
		if (slowClickConfig) this.clickDetector = new ClickDetector(this, slowClickConfig);
		if (DEBUG_BUILD$1) {
			const experiments = options._experiments;
			debug.setConfig({
				captureExceptions: !!experiments.captureExceptions,
				traceInternals: !!experiments.traceInternals
			});
		}
		this._handleVisibilityChange = () => {
			if (WINDOW.document.visibilityState === "visible") this._doChangeToForegroundTasks();
			else this._doChangeToBackgroundTasks();
		};
		this._handleWindowBlur = () => {
			const breadcrumb = createBreadcrumb({ category: "ui.blur" });
			this._doChangeToBackgroundTasks(breadcrumb);
		};
		this._handleWindowFocus = () => {
			const breadcrumb = createBreadcrumb({ category: "ui.focus" });
			this._doChangeToForegroundTasks(breadcrumb);
		};
		this._handleKeyboardEvent = (event) => {
			handleKeyboardEvent(this, event);
		};
	}
	/** Get the event context. */
	getContext() {
		return this._context;
	}
	/** If recording is currently enabled. */
	isEnabled() {
		return this._isEnabled;
	}
	/** If recording is currently paused. */
	isPaused() {
		return this._isPaused;
	}
	/**
	* Determine if canvas recording is enabled
	*/
	isRecordingCanvas() {
		return Boolean(this._canvas);
	}
	/** Get the replay integration options. */
	getOptions() {
		return this._options;
	}
	/** A wrapper to conditionally capture exceptions. */
	handleException(error) {
		DEBUG_BUILD$1 && debug.exception(error);
		if (this._options.onError) this._options.onError(error);
	}
	/**
	* Initializes the plugin based on sampling configuration. Should not be
	* called outside of constructor.
	*/
	initializeSampling(previousSessionId) {
		const { errorSampleRate, sessionSampleRate } = this._options;
		const requiresManualStart = errorSampleRate <= 0 && sessionSampleRate <= 0;
		this._requiresManualStart = requiresManualStart;
		if (requiresManualStart) return;
		this._initializeSessionForSampling(previousSessionId);
		if (!this.session) {
			DEBUG_BUILD$1 && debug.exception(/* @__PURE__ */ new Error("Unable to initialize and create session"));
			return;
		}
		if (this.session.sampled === false) return;
		this.recordingMode = this.session.sampled === "buffer" && this.session.segmentId === 0 ? "buffer" : "session";
		DEBUG_BUILD$1 && debug.infoTick(`Starting replay in ${this.recordingMode} mode`);
		this._initializeRecording();
	}
	/**
	* Start a replay regardless of sampling rate. Calling this will always
	* create a new session. Will log a message if replay is already in progress.
	*
	* Creates or loads a session, attaches listeners to varying events (DOM,
	* _performanceObserver, Recording, Sentry SDK, etc)
	*/
	start() {
		if (this._isEnabled && this.recordingMode === "session") {
			DEBUG_BUILD$1 && debug.log("Recording is already in progress");
			return;
		}
		if (this._isEnabled && this.recordingMode === "buffer") {
			DEBUG_BUILD$1 && debug.log("Buffering is in progress, call `flush()` to save the replay");
			return;
		}
		DEBUG_BUILD$1 && debug.infoTick("Starting replay in session mode");
		this._updateUserActivity();
		const session = loadOrCreateSession({
			maxReplayDuration: this._options.maxReplayDuration,
			sessionIdleExpire: this.timeouts.sessionIdleExpire
		}, {
			stickySession: this._options.stickySession,
			sessionSampleRate: 1,
			allowBuffering: false
		});
		this.session = session;
		this.recordingMode = "session";
		this._initializeRecording();
	}
	/**
	* Start replay buffering. Buffers until `flush()` is called or, if
	* `replaysOnErrorSampleRate` > 0, an error occurs.
	*/
	startBuffering() {
		if (this._isEnabled) {
			DEBUG_BUILD$1 && debug.log("Buffering is in progress, call `flush()` to save the replay");
			return;
		}
		DEBUG_BUILD$1 && debug.infoTick("Starting replay in buffer mode");
		const session = loadOrCreateSession({
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			maxReplayDuration: this._options.maxReplayDuration
		}, {
			stickySession: this._options.stickySession,
			sessionSampleRate: 0,
			allowBuffering: true
		});
		this.session = session;
		this.recordingMode = "buffer";
		this._initializeRecording();
	}
	/**
	* Start recording.
	*
	* Note that this will cause a new DOM checkout
	*/
	startRecording() {
		try {
			const canvasOptions = this._canvas;
			this._stopRecording = record({
				...this._recordingOptions,
				...this.recordingMode === "buffer" ? { checkoutEveryNms: BUFFER_CHECKOUT_TIME } : this._options._experiments.continuousCheckout && { checkoutEveryNms: Math.max(36e4, this._options._experiments.continuousCheckout) },
				emit: getHandleRecordingEmit(this),
				...getRecordingSamplingOptions(),
				onMutation: this._onMutationHandler.bind(this),
				...canvasOptions ? {
					recordCanvas: canvasOptions.recordCanvas,
					getCanvasManager: canvasOptions.getCanvasManager,
					sampling: canvasOptions.sampling,
					dataURLOptions: canvasOptions.dataURLOptions
				} : {}
			});
		} catch (err) {
			this.handleException(err);
		}
	}
	/**
	* Stops the recording, if it was running.
	*
	* Returns true if it was previously stopped, or is now stopped,
	* otherwise false.
	*/
	stopRecording() {
		try {
			if (this._stopRecording) {
				this._stopRecording();
				this._stopRecording = void 0;
			}
			return true;
		} catch (err) {
			this.handleException(err);
			return false;
		}
	}
	/**
	* Currently, this needs to be manually called (e.g. for tests). Sentry SDK
	* does not support a teardown
	*/
	async stop({ forceFlush = false, reason } = {}) {
		if (!this._isEnabled) return;
		this._isEnabled = false;
		this.recordingMode = "buffer";
		const stopReason = reason ?? "manual";
		getClient()?.emit("replayEnd", {
			sessionId: this.session?.id,
			reason: stopReason
		});
		try {
			DEBUG_BUILD$1 && debug.log(`Stopping Replay triggered by ${stopReason}`);
			resetReplayIdOnDynamicSamplingContext();
			this._removeListeners();
			this.stopRecording();
			this._debouncedFlush.cancel();
			if (forceFlush) await this._flush({ force: true });
			this.eventBuffer?.destroy();
			this.eventBuffer = null;
			clearSession(this);
		} catch (err) {
			this.handleException(err);
		}
	}
	/**
	* Pause some replay functionality. See comments for `_isPaused`.
	* This differs from stop as this only stops DOM recording, it is
	* not as thorough of a shutdown as `stop()`.
	*/
	pause() {
		if (this._isPaused) return;
		this._isPaused = true;
		this.stopRecording();
		DEBUG_BUILD$1 && debug.log("Pausing replay");
	}
	/**
	* Resumes recording, see notes for `pause().
	*
	* Note that calling `startRecording()` here will cause a
	* new DOM checkout.`
	*/
	resume() {
		if (!this._isPaused || !this._checkSession()) return;
		this._isPaused = false;
		this.startRecording();
		DEBUG_BUILD$1 && debug.log("Resuming replay");
	}
	/**
	* If not in "session" recording mode, flush event buffer which will create a new replay.
	* Unless `continueRecording` is false, the replay will continue to record and
	* behave as a "session"-based replay.
	*
	* Otherwise, queue up a flush.
	*/
	async sendBufferedReplayOrFlush({ continueRecording = true } = {}) {
		if (this.recordingMode === "session") return this.flushImmediate();
		const activityTime = Date.now();
		DEBUG_BUILD$1 && debug.log("Converting buffer to session");
		await this.flushImmediate();
		const hasStoppedRecording = this.stopRecording();
		if (!continueRecording || !hasStoppedRecording) return;
		if (this.recordingMode === "session") return;
		this.recordingMode = "session";
		if (this.session) {
			this.session.dirty = false;
			this._updateUserActivity(activityTime);
			this._updateSessionActivity(activityTime);
			this._maybeSaveSession();
			setReplayIdOnDynamicSamplingContext(this.session.id);
		}
		this.startRecording();
	}
	/**
	* We want to batch uploads of replay events. Save events only if
	* `<flushMinDelay>` milliseconds have elapsed since the last event
	* *OR* if `<flushMaxDelay>` milliseconds have elapsed.
	*
	* Accepts a callback to perform side-effects and returns true to stop batch
	* processing and hand back control to caller.
	*/
	addUpdate(cb) {
		const cbResult = cb();
		if (this.recordingMode === "buffer" || !this._isEnabled) return;
		if (cbResult === true) return;
		this._debouncedFlush();
	}
	/**
	* Updates the user activity timestamp and resumes recording. This should be
	* called in an event handler for a user action that we consider as the user
	* being "active" (e.g. a mouse click).
	*/
	triggerUserActivity() {
		this._updateUserActivity();
		if (!this._stopRecording) {
			if (!this._checkSession()) return;
			this.resume();
			return;
		}
		this.checkAndHandleExpiredSession();
		this._updateSessionActivity();
	}
	/**
	* Updates the user activity timestamp *without* resuming
	* recording. Some user events (e.g. keydown) can be create
	* low-value replays that only contain the keypress as a
	* breadcrumb. Instead this would require other events to
	* create a new replay after a session has expired.
	*/
	updateUserActivity() {
		this._updateUserActivity();
		this._updateSessionActivity();
	}
	/**
	* Only flush if `this.recordingMode === 'session'`
	*/
	conditionalFlush() {
		if (this.recordingMode === "buffer") return Promise.resolve();
		return this.flushImmediate();
	}
	/**
	* Flush using debounce flush
	*/
	flush() {
		return this._debouncedFlush();
	}
	/**
	* Always flush via `_debouncedFlush` so that we do not have flushes triggered
	* from calling both `flush` and `_debouncedFlush`. Otherwise, there could be
	* cases of multiple flushes happening closely together.
	*/
	flushImmediate() {
		this._debouncedFlush();
		return this._debouncedFlush.flush();
	}
	/**
	* Cancels queued up flushes.
	*/
	cancelFlush() {
		this._debouncedFlush.cancel();
	}
	/** Get the current session (=replay) ID
	*
	* @param onlyIfSampled - If true, will only return the session ID if the session is sampled.
	*/
	getSessionId(onlyIfSampled) {
		if (onlyIfSampled && this.session?.sampled === false) return;
		return this.session?.id;
	}
	/**
	* Checks if recording should be stopped due to user inactivity. Otherwise
	* check if session is expired and create a new session if so. Triggers a new
	* full snapshot on new session.
	*
	* Returns true if session is not expired, false otherwise.
	* @hidden
	*/
	checkAndHandleExpiredSession() {
		if (this._lastActivity && isExpired(this._lastActivity, this.timeouts.sessionIdlePause) && this.session?.sampled === "session") {
			this.pause();
			return;
		}
		if (!this._checkSession()) return false;
		return true;
	}
	/**
	* Capture some initial state that can change throughout the lifespan of the
	* replay. This is required because otherwise they would be captured at the
	* first flush.
	*/
	setInitialState() {
		const urlPath = `${WINDOW.location.pathname}${WINDOW.location.hash}${WINDOW.location.search}`;
		const url = `${WINDOW.location.origin}${urlPath}`;
		this.performanceEntries = [];
		this.replayPerformanceEntries = [];
		this._clearContext();
		this._context.initialUrl = url;
		this._context.initialTimestamp = Date.now();
		this._context.urls.push(url);
	}
	/**
	* Add a breadcrumb event, that may be throttled.
	* If it was throttled, we add a custom breadcrumb to indicate that.
	*/
	throttledAddEvent(event, isCheckout) {
		const res = this._throttledAddEvent(event, isCheckout);
		if (res === THROTTLED) {
			const breadcrumb = createBreadcrumb({ category: "replay.throttled" });
			this.addUpdate(() => {
				return !addEventSync(this, {
					type: ReplayEventTypeCustom,
					timestamp: breadcrumb.timestamp || 0,
					data: {
						tag: "breadcrumb",
						payload: breadcrumb,
						metric: true
					}
				});
			});
		}
		return res;
	}
	/**
	* This will get the parametrized route name of the current page.
	* This is only available if performance is enabled, and if an instrumented router is used.
	*/
	getCurrentRoute() {
		const lastActiveSpan = this.lastActiveSpan || getActiveSpan();
		const lastRootSpan = lastActiveSpan && getRootSpan(lastActiveSpan);
		const source = (lastRootSpan && spanToJSON(lastRootSpan).data || {})[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		if (!lastRootSpan || !source || !["route", "custom"].includes(source)) return;
		return spanToJSON(lastRootSpan).description;
	}
	/**
	* Initialize and start all listeners to varying events (DOM,
	* Performance Observer, Recording, Sentry SDK, etc)
	*/
	_initializeRecording() {
		this.setInitialState();
		this._updateSessionActivity();
		this.eventBuffer = createEventBuffer({
			useCompression: this._options.useCompression,
			workerUrl: this._options.workerUrl
		});
		this._removeListeners();
		this._addListeners();
		this._isEnabled = true;
		this._isPaused = false;
		if (this.session) getClient()?.emit("replayStart", {
			sessionId: this.session.id,
			recordingMode: this.recordingMode
		});
		this.startRecording();
		if (this.recordingMode === "session" && this.session) setReplayIdOnDynamicSamplingContext(this.session.id);
	}
	/**
	* Loads (or refreshes) the current session.
	*/
	_initializeSessionForSampling(previousSessionId) {
		const allowBuffering = this._options.errorSampleRate > 0;
		const session = loadOrCreateSession({
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			maxReplayDuration: this._options.maxReplayDuration,
			previousSessionId
		}, {
			stickySession: this._options.stickySession,
			sessionSampleRate: this._options.sessionSampleRate,
			allowBuffering
		});
		this.session = session;
	}
	/**
	* Checks and potentially refreshes the current session.
	* Returns false if session is not recorded.
	*/
	_checkSession() {
		if (!this.session) return false;
		const currentSession = this.session;
		if (shouldRefreshSession(currentSession, {
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			maxReplayDuration: this._options.maxReplayDuration
		})) {
			this._refreshSession(currentSession);
			return false;
		}
		return true;
	}
	/**
	* Refresh a session with a new one.
	* This stops the current session (without forcing a flush, as that would never work since we are expired),
	* and then does a new sampling based on the refreshed session.
	*/
	async _refreshSession(session) {
		if (!this._isEnabled) return;
		await this.stop({ reason: "sessionExpired" });
		this.initializeSampling(session.id);
	}
	/**
	* Adds listeners to record events for the replay
	*/
	_addListeners() {
		try {
			WINDOW.document.addEventListener("visibilitychange", this._handleVisibilityChange);
			WINDOW.addEventListener("blur", this._handleWindowBlur);
			WINDOW.addEventListener("focus", this._handleWindowFocus);
			WINDOW.addEventListener("keydown", this._handleKeyboardEvent);
			if (this.clickDetector) this.clickDetector.addListeners();
			if (!this._hasInitializedCoreListeners) {
				addGlobalListeners(this);
				this._hasInitializedCoreListeners = true;
			}
		} catch (err) {
			this.handleException(err);
		}
		this._performanceCleanupCallback = setupPerformanceObserver(this);
	}
	/**
	* Cleans up listeners that were created in `_addListeners`
	*/
	_removeListeners() {
		try {
			WINDOW.document.removeEventListener("visibilitychange", this._handleVisibilityChange);
			WINDOW.removeEventListener("blur", this._handleWindowBlur);
			WINDOW.removeEventListener("focus", this._handleWindowFocus);
			WINDOW.removeEventListener("keydown", this._handleKeyboardEvent);
			if (this.clickDetector) this.clickDetector.removeListeners();
			if (this._performanceCleanupCallback) this._performanceCleanupCallback();
		} catch (err) {
			this.handleException(err);
		}
	}
	/**
	* Tasks to run when we consider a page to be hidden (via blurring and/or visibility)
	*/
	_doChangeToBackgroundTasks(breadcrumb) {
		if (!this.session) return;
		if (shouldRefreshSession(this.session, {
			maxReplayDuration: this._options.maxReplayDuration,
			sessionIdleExpire: this.timeouts.sessionIdleExpire
		})) {
			resetReplayIdOnDynamicSamplingContext();
			return;
		}
		if (breadcrumb) this._createCustomBreadcrumb(breadcrumb);
		this.conditionalFlush();
	}
	/**
	* Tasks to run when we consider a page to be visible (via focus and/or visibility)
	*/
	_doChangeToForegroundTasks(breadcrumb) {
		if (!this.session) return;
		if (!this.checkAndHandleExpiredSession()) {
			DEBUG_BUILD$1 && debug.log("Document has become active, but session has expired");
			return;
		}
		if (breadcrumb) this._createCustomBreadcrumb(breadcrumb);
	}
	/**
	* Update user activity (across session lifespans)
	*/
	_updateUserActivity(_lastActivity = Date.now()) {
		this._lastActivity = _lastActivity;
	}
	/**
	* Updates the session's last activity timestamp
	*/
	_updateSessionActivity(_lastActivity = Date.now()) {
		if (this.session) {
			this.session.lastActivity = _lastActivity;
			this._maybeSaveSession();
		}
	}
	/**
	* Helper to create (and buffer) a replay breadcrumb from a core SDK breadcrumb
	*/
	_createCustomBreadcrumb(breadcrumb) {
		this.addUpdate(() => {
			this.throttledAddEvent({
				type: EventType.Custom,
				timestamp: breadcrumb.timestamp || 0,
				data: {
					tag: "breadcrumb",
					payload: breadcrumb
				}
			});
		});
	}
	/**
	* Observed performance events are added to `this.performanceEntries`. These
	* are included in the replay event before it is finished and sent to Sentry.
	*/
	_addPerformanceEntries() {
		let performanceEntries = createPerformanceEntries(this.performanceEntries).concat(this.replayPerformanceEntries);
		this.performanceEntries = [];
		this.replayPerformanceEntries = [];
		if (this._requiresManualStart) {
			const initialTimestampInSeconds = this._context.initialTimestamp / 1e3;
			performanceEntries = performanceEntries.filter((entry) => entry.start >= initialTimestampInSeconds);
		}
		return Promise.all(createPerformanceSpans(this, performanceEntries));
	}
	/**
	* Clear _context
	*/
	_clearContext() {
		this._context.errorIds.clear();
		this._context.traceIds.clear();
		this._context.segmentNames.clear();
		this._context.urls = [];
	}
	/** Update the initial timestamp based on the buffer content. */
	_updateInitialTimestampFromEventBuffer() {
		const { session, eventBuffer } = this;
		if (!session || !eventBuffer || this._requiresManualStart) return;
		if (session.segmentId) return;
		const earliestEvent = eventBuffer.getEarliestTimestamp();
		if (earliestEvent && earliestEvent < this._context.initialTimestamp) this._context.initialTimestamp = earliestEvent;
	}
	/**
	* Return and clear _context
	*/
	_popEventContext() {
		const _context = {
			initialTimestamp: this._context.initialTimestamp,
			initialUrl: this._context.initialUrl,
			errorIds: Array.from(this._context.errorIds),
			traceIds: Array.from(this._context.traceIds),
			segmentNames: Array.from(this._context.segmentNames),
			urls: this._context.urls
		};
		this._clearContext();
		return _context;
	}
	/**
	* Flushes replay event buffer to Sentry.
	*
	* Performance events are only added right before flushing - this is
	* due to the buffered performance observer events.
	*
	* Should never be called directly, only by `flush`
	*/
	async _runFlush() {
		const replayId = this.getSessionId();
		if (!this.session || !this.eventBuffer || !replayId) {
			DEBUG_BUILD$1 && debug.error("No session or eventBuffer found to flush.");
			return;
		}
		await this._addPerformanceEntries();
		if (!this.eventBuffer?.hasEvents) return;
		await addMemoryEntry(this);
		if (!this.eventBuffer) return;
		if (replayId !== this.getSessionId()) return;
		try {
			this._updateInitialTimestampFromEventBuffer();
			const timestamp = Date.now();
			if (timestamp - this._context.initialTimestamp > this._options.maxReplayDuration + 3e4) throw new ReplayDurationLimitError();
			const eventContext = this._popEventContext();
			const segmentId = this.session.segmentId++;
			this._maybeSaveSession();
			await sendReplay({
				replayId,
				recordingData: await this.eventBuffer.finish(),
				segmentId,
				eventContext,
				session: this.session,
				timestamp,
				onError: (err) => this.handleException(err)
			});
		} catch (err) {
			this.handleException(err);
			this.stop({ reason: "sendError" });
			const client = getClient();
			if (client) {
				let dropReason;
				if (err instanceof RateLimitError) dropReason = "ratelimit_backoff";
				else if (err instanceof ReplayDurationLimitError) dropReason = "invalid";
				else dropReason = "send_error";
				client.recordDroppedEvent(dropReason, "replay");
			}
		}
	}
	/**
	* Flush recording data to Sentry. Creates a lock so that only a single flush
	* can be active at a time. Do not call this directly.
	*/
	async _flush({ force = false } = {}) {
		if (!this._isEnabled && !force) return;
		if (!this.checkAndHandleExpiredSession()) {
			DEBUG_BUILD$1 && debug.error("Attempting to finish replay event after session expired.");
			return;
		}
		if (!this.session) return;
		const start = this.session.started;
		const duration = Date.now() - start;
		this._debouncedFlush.cancel();
		const tooShort = duration < this._options.minReplayDuration;
		const tooLong = duration > this._options.maxReplayDuration + 5e3;
		if (tooShort || tooLong) {
			DEBUG_BUILD$1 && debug.log(`Session duration (${Math.floor(duration / 1e3)}s) is too ${tooShort ? "short" : "long"}, not sending replay.`);
			if (tooShort) this._debouncedFlush();
			return;
		}
		const eventBuffer = this.eventBuffer;
		if (eventBuffer && this.session.segmentId === 0 && !eventBuffer.hasCheckout) DEBUG_BUILD$1 && debug.log("Flushing initial segment without checkout.");
		const _flushInProgress = !!this._flushLock;
		if (!this._flushLock) this._flushLock = this._runFlush();
		try {
			await this._flushLock;
		} catch (err) {
			this.handleException(err);
		} finally {
			this._flushLock = void 0;
			if (_flushInProgress) this._debouncedFlush();
		}
	}
	/** Save the session, if it is sticky */
	_maybeSaveSession() {
		if (this.session && this._options.stickySession) saveSession(this.session);
	}
	/** Handler for rrweb.record.onMutation */
	_onMutationHandler(mutations) {
		const { ignoreMutations } = this._options._experiments;
		if (ignoreMutations?.length) {
			if (mutations.some((mutation) => {
				const el = closestElementOfNode$2(mutation.target);
				const selector = ignoreMutations.join(",");
				return el?.matches(selector);
			})) return false;
		}
		const count = mutations.length;
		const mutationLimit = this._options.mutationLimit;
		const mutationBreadcrumbLimit = this._options.mutationBreadcrumbLimit;
		const overMutationLimit = mutationLimit && count > mutationLimit;
		if (count > mutationBreadcrumbLimit || overMutationLimit) {
			const breadcrumb = createBreadcrumb({
				category: "replay.mutations",
				data: {
					count,
					limit: overMutationLimit
				}
			});
			this._createCustomBreadcrumb(breadcrumb);
		}
		if (overMutationLimit) {
			this.stop({
				reason: "mutationLimit",
				forceFlush: this.recordingMode === "session"
			});
			return false;
		}
		return true;
	}
};
function getOption(selectors, defaultSelectors) {
	return [...selectors, ...defaultSelectors].join(",");
}
function getPrivacyOptions({ mask, unmask, block, unblock, ignore }) {
	return {
		maskTextSelector: getOption(mask, [".sentry-mask", "[data-sentry-mask]"]),
		unmaskTextSelector: getOption(unmask, []),
		blockSelector: getOption(block, [
			".sentry-block",
			"[data-sentry-block]",
			...["base", "iframe[srcdoc]:not([src])"]
		]),
		unblockSelector: getOption(unblock, []),
		ignoreSelector: getOption(ignore, [
			".sentry-ignore",
			"[data-sentry-ignore]",
			"input[type=\"file\"]"
		])
	};
}
function maskAttribute({ el, key, maskAttributes, maskAllText, privacyOptions, value }) {
	if (privacyOptions.unmaskTextSelector && el.matches(privacyOptions.unmaskTextSelector)) return value;
	const masksNamedAttribute = maskAttributes.includes(key);
	const masksSubmitButtonValue = maskAllText && key === "value" && el.tagName === "INPUT" && ["submit", "button"].includes(el.getAttribute("type") || "");
	if (masksNamedAttribute || masksSubmitButtonValue) return value.replace(/[\S]/g, "*");
	return value;
}
var MEDIA_SELECTORS = "img,image,svg,video,object,picture,embed,map,audio,link[rel=\"icon\"],link[rel=\"apple-touch-icon\"]";
var DEFAULT_NETWORK_HEADERS = [
	"content-length",
	"content-type",
	"accept"
];
var ORIGINAL_BODY = /* @__PURE__ */ Symbol.for("sentry__originalRequestBody");
var _initialized = false;
var _isRequestInstrumented = false;
function _INTERNAL_instrumentRequestInterface() {
	if (typeof Request === "undefined" || _isRequestInstrumented) return;
	const OriginalRequest = Request;
	try {
		const SentryRequest = function(input, init) {
			const request = new OriginalRequest(input, init);
			if (init?.body != null) request[ORIGINAL_BODY] = init.body;
			return request;
		};
		SentryRequest.prototype = OriginalRequest.prototype;
		GLOBAL_OBJ.Request = SentryRequest;
		_isRequestInstrumented = true;
	} catch {}
}
var replayIntegration = ((options) => {
	return new Replay(options);
});
var Replay = class {
	constructor({ flushMinDelay = DEFAULT_FLUSH_MIN_DELAY, flushMaxDelay = DEFAULT_FLUSH_MAX_DELAY, minReplayDuration = MIN_REPLAY_DURATION, maxReplayDuration = MAX_REPLAY_DURATION, stickySession = true, useCompression = true, workerUrl, _experiments = {}, maskAllText = true, maskAllInputs = true, blockAllMedia = true, mutationBreadcrumbLimit = 750, mutationLimit = 1e4, slowClickTimeout = 7e3, slowClickIgnoreSelectors = [], networkDetailAllowUrls = [], networkDetailDenyUrls = [], networkCaptureBodies = true, networkRequestHeaders = [], networkResponseHeaders = [], mask = [], maskAttributes = [
		"title",
		"placeholder",
		"aria-label"
	], unmask = [], block = [], unblock = [], ignore = [], maskFn, beforeAddRecordingEvent, beforeErrorSampling, onError, attachRawBodyFromRequest = false } = {}) {
		this.name = "Replay";
		const privacyOptions = getPrivacyOptions({
			mask,
			unmask,
			block,
			unblock,
			ignore
		});
		this._recordingOptions = {
			maskAllInputs,
			maskAllText,
			maskInputOptions: { password: true },
			maskTextFn: maskFn,
			maskInputFn: maskFn,
			maskAttributeFn: (key, value, el) => maskAttribute({
				maskAttributes,
				maskAllText,
				privacyOptions,
				key,
				value,
				el
			}),
			...privacyOptions,
			slimDOMOptions: "all",
			inlineStylesheet: true,
			inlineImages: false,
			collectFonts: true,
			errorHandler: (err) => {
				try {
					err.__rrweb__ = true;
				} catch {}
			},
			recordCrossOriginIframes: Boolean(_experiments.recordCrossOriginIframes)
		};
		this._initialOptions = {
			flushMinDelay,
			flushMaxDelay,
			minReplayDuration: Math.min(minReplayDuration, MIN_REPLAY_DURATION_LIMIT),
			maxReplayDuration: Math.min(maxReplayDuration, MAX_REPLAY_DURATION),
			stickySession,
			useCompression,
			workerUrl,
			blockAllMedia,
			maskAllInputs,
			maskAllText,
			mutationBreadcrumbLimit,
			mutationLimit,
			slowClickTimeout,
			slowClickIgnoreSelectors,
			networkDetailAllowUrls,
			networkDetailDenyUrls,
			networkCaptureBodies,
			networkRequestHeaders: _getMergedNetworkHeaders(networkRequestHeaders),
			networkResponseHeaders: _getMergedNetworkHeaders(networkResponseHeaders),
			beforeAddRecordingEvent,
			beforeErrorSampling,
			onError,
			attachRawBodyFromRequest,
			_experiments
		};
		if (this._initialOptions.blockAllMedia) {
			this._recordingOptions.blockSelector = !this._recordingOptions.blockSelector ? MEDIA_SELECTORS : `${this._recordingOptions.blockSelector},${MEDIA_SELECTORS}`;
			this._recordingOptions.ignoreCSSAttributes = /* @__PURE__ */ new Set(["background-image"]);
		}
		if (this._isInitialized && isBrowser()) throw new Error("Multiple Sentry Session Replay instances are not supported");
		this._isInitialized = true;
	}
	/** If replay has already been initialized */
	get _isInitialized() {
		return _initialized;
	}
	/** Update _isInitialized */
	set _isInitialized(value) {
		_initialized = value;
	}
	/**
	* Setup and initialize replay container
	*/
	afterAllSetup(client) {
		if (!isBrowser() || this._replay) return;
		if (this._initialOptions.attachRawBodyFromRequest) _INTERNAL_instrumentRequestInterface();
		this._setup(client);
		this._initialize(client);
	}
	/**
	* Start a replay regardless of sampling rate. Calling this will always
	* create a new session. Will log a message if replay is already in progress.
	*
	* Creates or loads a session, attaches listeners to varying events (DOM,
	* PerformanceObserver, Recording, Sentry SDK, etc)
	*/
	start() {
		if (!this._replay) return;
		this._replay.start();
	}
	/**
	* Start replay buffering. Buffers until `flush()` is called or, if
	* `replaysOnErrorSampleRate` > 0, until an error occurs.
	*/
	startBuffering() {
		if (!this._replay) return;
		this._replay.startBuffering();
	}
	/**
	* Currently, this needs to be manually called (e.g. for tests). Sentry SDK
	* does not support a teardown
	*
	* @param options.flush - Whether to flush the pending replay segment when stopping.
	* When recording in `session` mode, `stop()` flushes the buffered-but-unsent segment by
	* default (`flush: true`), matching the previous behavior. Pass `flush: false` to stop
	* recording without sending that pending segment — useful when a user withdraws consent
	* and no further data should leave the browser.
	*
	* Note: `flush: false` only prevents the *pending* (final) segment from being sent. It does
	* **not** retract segments that were already sent earlier during `session` recording.
	*/
	stop(options) {
		if (!this._replay) return Promise.resolve();
		return this._replay.stop({
			forceFlush: options?.flush ?? this._replay.recordingMode === "session",
			reason: "manual"
		});
	}
	/**
	* If not in "session" recording mode, flush event buffer which will create a new replay.
	* If replay is not enabled, a new session replay is started.
	* Unless `continueRecording` is false, the replay will continue to record and
	* behave as a "session"-based replay.
	*
	* Otherwise, queue up a flush.
	*/
	flush(options) {
		if (!this._replay) return Promise.resolve();
		if (!this._replay.isEnabled()) {
			this._replay.start();
			return Promise.resolve();
		}
		return this._replay.sendBufferedReplayOrFlush(options);
	}
	/**
	* Get the current session ID.
	*
	* @param onlyIfSampled - If true, will only return the session ID if the session is sampled.
	*
	*/
	getReplayId(onlyIfSampled) {
		if (!this._replay?.isEnabled()) return;
		return this._replay.getSessionId(onlyIfSampled);
	}
	/**
	* Get the current recording mode. This can be either `session` or `buffer`.
	*
	* `session`: Recording the whole session, sending it continuously
	* `buffer`: Always keeping the last 60s of recording, requires:
	*   - having replaysOnErrorSampleRate > 0 to capture replay when an error occurs
	*   - or calling `flush()` to send the replay
	*/
	getRecordingMode() {
		if (!this._replay?.isEnabled()) return;
		return this._replay.recordingMode;
	}
	processSpan(span) {
		const replayId = this.getReplayId(true);
		if (replayId) {
			safeSetSpanJSONAttributes(span, { "sentry.replay_id": replayId });
			if (this.getRecordingMode() === "buffer") safeSetSpanJSONAttributes(span, { "sentry._internal.replay_is_buffering": true });
		}
	}
	/**
	* Initializes replay.
	*/
	_initialize(client) {
		if (!this._replay) return;
		this._maybeLoadFromReplayCanvasIntegration(client);
		this._replay.initializeSampling();
	}
	/** Setup the integration. */
	_setup(client) {
		const finalOptions = loadReplayOptionsFromClient(this._initialOptions, client);
		this._replay = new ReplayContainer({
			options: finalOptions,
			recordingOptions: this._recordingOptions
		});
	}
	/** Get canvas options from ReplayCanvas integration, if it is also added. */
	_maybeLoadFromReplayCanvasIntegration(client) {
		try {
			const canvasIntegration = client.getIntegrationByName("ReplayCanvas");
			if (!canvasIntegration) return;
			this._replay["_canvas"] = canvasIntegration.getOptions();
		} catch {}
	}
};
function loadReplayOptionsFromClient(initialOptions, client) {
	const opt = client.getOptions();
	const finalOptions = {
		sessionSampleRate: 0,
		errorSampleRate: 0,
		...initialOptions
	};
	const replaysSessionSampleRate = parseSampleRate(opt.replaysSessionSampleRate);
	const replaysOnErrorSampleRate = parseSampleRate(opt.replaysOnErrorSampleRate);
	if (replaysSessionSampleRate == null && replaysOnErrorSampleRate == null) consoleSandbox(() => {
		console.warn("Replay is disabled because neither `replaysSessionSampleRate` nor `replaysOnErrorSampleRate` are set.");
	});
	if (replaysSessionSampleRate != null) finalOptions.sessionSampleRate = replaysSessionSampleRate;
	if (replaysOnErrorSampleRate != null) finalOptions.errorSampleRate = replaysOnErrorSampleRate;
	return finalOptions;
}
function _getMergedNetworkHeaders(headers) {
	return [...DEFAULT_NETWORK_HEADERS, ...headers.map((header) => header.toLowerCase())];
}
function getReplay() {
	return getClient()?.getIntegrationByName("Replay");
}
//#endregion
//#region node_modules/@sentry/replay-canvas/build/npm/esm/index.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var Mirror = class {
	constructor() {
		__publicField(this, "idNodeMap", /* @__PURE__ */ new Map());
		__publicField(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
	}
	getId(n) {
		if (!n) return -1;
		return this.getMeta(n)?.id ?? -1;
	}
	getNode(id) {
		return this.idNodeMap.get(id) || null;
	}
	getIds() {
		return Array.from(this.idNodeMap.keys());
	}
	getMeta(n) {
		return this.nodeMetaMap.get(n) || null;
	}
	removeNodeFromMap(n) {
		const id = this.getId(n);
		this.idNodeMap.delete(id);
		if (n.childNodes) n.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
	}
	has(id) {
		return this.idNodeMap.has(id);
	}
	hasNode(node) {
		return this.nodeMetaMap.has(node);
	}
	add(n, meta) {
		const id = meta.id;
		this.idNodeMap.set(id, n);
		this.nodeMetaMap.set(n, meta);
	}
	replace(id, n) {
		const oldNode = this.getNode(id);
		if (oldNode) {
			const meta = this.nodeMetaMap.get(oldNode);
			if (meta) this.nodeMetaMap.set(n, meta);
		}
		this.idNodeMap.set(id, n);
	}
	reset() {
		this.idNodeMap = /* @__PURE__ */ new Map();
		this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
	}
};
function createMirror() {
	return new Mirror();
}
function elementClassMatchesRegex(el, regex) {
	for (let eIndex = el.classList.length; eIndex--;) {
		const className = el.classList[eIndex];
		if (regex.test(className)) return true;
	}
	return false;
}
function distanceToMatch(node, matchPredicate, limit = Infinity, distance = 0) {
	if (!node) return -1;
	if (node.nodeType !== node.ELEMENT_NODE) return -1;
	if (distance > limit) return -1;
	if (matchPredicate(node)) return distance;
	return distanceToMatch(node.parentNode, matchPredicate, limit, distance + 1);
}
function createMatchPredicate(className, selector) {
	return (node) => {
		const el = node;
		if (el === null) return false;
		try {
			if (className) {
				if (typeof className === "string") {
					if (el.matches(`.${className}`)) return true;
				} else if (elementClassMatchesRegex(el, className)) return true;
			}
			if (selector && el.matches(selector)) return true;
			return false;
		} catch {
			return false;
		}
	};
}
var DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
var _mirror = {
	map: {},
	getId() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING);
		return -1;
	},
	getNode() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING);
		return null;
	},
	removeNodeFromMap() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING);
	},
	has() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING);
		return false;
	},
	reset() {
		console.error(DEPARTED_MIRROR_ACCESS_WARNING);
	}
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) _mirror = new Proxy(_mirror, { get(target, prop, receiver) {
	if (prop === "map") console.error(DEPARTED_MIRROR_ACCESS_WARNING);
	return Reflect.get(target, prop, receiver);
} });
function hookSetter(target, key, d, isRevoked, win = window) {
	const original = win.Object.getOwnPropertyDescriptor(target, key);
	win.Object.defineProperty(target, key, isRevoked ? d : { set(value) {
		setTimeout$1(() => {
			d.set.call(this, value);
		}, 0);
		if (original && original.set) original.set.call(this, value);
	} });
	return () => hookSetter(target, key, original || {}, true);
}
function patch(source, name, replacement) {
	try {
		if (!(name in source)) return () => {};
		const original = source[name];
		const wrapped = replacement(original);
		if (typeof wrapped === "function") {
			wrapped.prototype = wrapped.prototype || {};
			Object.defineProperties(wrapped, { __rrweb_original__: {
				enumerable: false,
				value: original
			} });
		}
		source[name] = wrapped;
		return () => {
			source[name] = original;
		};
	} catch {
		return () => {};
	}
}
if (!/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()));
function closestElementOfNode(node) {
	if (!node) return null;
	try {
		return node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
	} catch (error) {
		return null;
	}
}
function isBlocked(node, blockClass, blockSelector, unblockSelector, checkAncestors) {
	if (!node) return false;
	const el = closestElementOfNode(node);
	if (!el) return false;
	const blockedPredicate = createMatchPredicate(blockClass, blockSelector);
	if (!checkAncestors) {
		const isUnblocked = unblockSelector && el.matches(unblockSelector);
		return blockedPredicate(el) && !isUnblocked;
	}
	const blockDistance = distanceToMatch(el, blockedPredicate);
	let unblockDistance = -1;
	if (blockDistance < 0) return false;
	if (unblockSelector) unblockDistance = distanceToMatch(el, createMatchPredicate(null, unblockSelector));
	if (blockDistance > -1 && unblockDistance < 0) return true;
	return blockDistance < unblockDistance;
}
var cachedImplementations = {};
function getImplementation(name) {
	const cached = cachedImplementations[name];
	if (cached) return cached;
	const document2 = window.document;
	let impl = window[name];
	if (document2 && typeof document2.createElement === "function") try {
		const sandbox = document2.createElement("iframe");
		sandbox.hidden = true;
		document2.head.appendChild(sandbox);
		const contentWindow = sandbox.contentWindow;
		if (contentWindow && contentWindow[name]) impl = contentWindow[name];
		document2.head.removeChild(sandbox);
	} catch (e) {}
	return cachedImplementations[name] = impl.bind(window);
}
function onRequestAnimationFrame(...rest) {
	return getImplementation("requestAnimationFrame")(...rest);
}
function setTimeout$1(...rest) {
	return getImplementation("setTimeout")(...rest);
}
var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
	CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
	CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
	CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
	return CanvasContext2;
})(CanvasContext || {});
var errorHandler;
function registerErrorHandler(handler) {
	errorHandler = handler;
}
var callbackWrapper = (cb) => {
	if (!errorHandler) return cb;
	const rrwebWrapped = ((...rest) => {
		try {
			return cb(...rest);
		} catch (error) {
			if (errorHandler && errorHandler(error) === true) return () => {};
			throw error;
		}
	});
	return rrwebWrapped;
};
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
for (var i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
var encode = function(arraybuffer) {
	var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
	for (i2 = 0; i2 < len; i2 += 3) {
		base64 += chars[bytes[i2] >> 2];
		base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
		base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
		base64 += chars[bytes[i2 + 2] & 63];
	}
	if (len % 3 === 2) base64 = base64.substring(0, base64.length - 1) + "=";
	else if (len % 3 === 1) base64 = base64.substring(0, base64.length - 2) + "==";
	return base64;
};
var canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
	let contextMap = canvasVarMap.get(ctx);
	if (!contextMap) {
		contextMap = /* @__PURE__ */ new Map();
		canvasVarMap.set(ctx, contextMap);
	}
	if (!contextMap.has(ctor)) contextMap.set(ctor, []);
	return contextMap.get(ctor);
}
var saveWebGLVar = (value, win, ctx) => {
	if (!value || !(isInstanceOfWebGLObject(value, win) || typeof value === "object")) return;
	const name = value.constructor.name;
	const list = variableListFor(ctx, name);
	let index = list.indexOf(value);
	if (index === -1) {
		index = list.length;
		list.push(value);
	}
	return index;
};
function serializeArg(value, win, ctx) {
	if (value instanceof Array) return value.map((arg) => serializeArg(arg, win, ctx));
	else if (value === null) return value;
	else if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Uint8Array || value instanceof Uint16Array || value instanceof Int16Array || value instanceof Int8Array || value instanceof Uint8ClampedArray) return {
		rr_type: value.constructor.name,
		args: [Object.values(value)]
	};
	else if (value instanceof ArrayBuffer) return {
		rr_type: value.constructor.name,
		base64: encode(value)
	};
	else if (value instanceof DataView) return {
		rr_type: value.constructor.name,
		args: [
			serializeArg(value.buffer, win, ctx),
			value.byteOffset,
			value.byteLength
		]
	};
	else if (value instanceof HTMLImageElement) {
		const name = value.constructor.name;
		const { src } = value;
		return {
			rr_type: name,
			src
		};
	} else if (value instanceof HTMLCanvasElement) return {
		rr_type: "HTMLImageElement",
		src: value.toDataURL()
	};
	else if (value instanceof ImageData) return {
		rr_type: value.constructor.name,
		args: [
			serializeArg(value.data, win, ctx),
			value.width,
			value.height
		]
	};
	else if (isInstanceOfWebGLObject(value, win) || typeof value === "object") return {
		rr_type: value.constructor.name,
		index: saveWebGLVar(value, win, ctx)
	};
	return value;
}
var serializeArgs = (args, win, ctx) => {
	return args.map((arg) => serializeArg(arg, win, ctx));
};
var isInstanceOfWebGLObject = (value, win) => {
	const supportedWebGLConstructorNames = [
		"WebGLActiveInfo",
		"WebGLBuffer",
		"WebGLFramebuffer",
		"WebGLProgram",
		"WebGLRenderbuffer",
		"WebGLShader",
		"WebGLShaderPrecisionFormat",
		"WebGLTexture",
		"WebGLUniformLocation",
		"WebGLVertexArrayObject",
		"WebGLVertexArrayObjectOES"
	].filter((name) => typeof win[name] === "function");
	return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
};
function initCanvas2DMutationObserver(cb, win, blockClass2, blockSelector, unblockSelector) {
	const handlers = [];
	const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
	for (const prop of props2D) try {
		if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") continue;
		const restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function(original) {
			return function(...args) {
				if (!isBlocked(this.canvas, blockClass2, blockSelector, unblockSelector, true)) setTimeout$1(() => {
					const recordArgs = serializeArgs(args, win, this);
					cb(this.canvas, {
						type: CanvasContext["2D"],
						property: prop,
						args: recordArgs
					});
				}, 0);
				return original.apply(this, args);
			};
		});
		handlers.push(restoreHandler);
	} catch {
		const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, { set(v) {
			cb(this.canvas, {
				type: CanvasContext["2D"],
				property: prop,
				args: [v],
				setter: true
			});
		} });
		handlers.push(hookHandler);
	}
	return () => {
		handlers.forEach((h) => h());
	};
}
function getNormalizedContextName(contextType) {
	return contextType === "experimental-webgl" ? "webgl" : contextType;
}
function initCanvasContextObserver(win, blockClass, blockSelector, unblockSelector, setPreserveDrawingBufferToTrue) {
	const handlers = [];
	try {
		const restoreHandler = patch(win.HTMLCanvasElement.prototype, "getContext", function(original) {
			return function(contextType, ...args) {
				if (!isBlocked(this, blockClass, blockSelector, unblockSelector, true)) {
					const ctxName = getNormalizedContextName(contextType);
					if (!("__context" in this)) this.__context = ctxName;
					if (setPreserveDrawingBufferToTrue && ["webgl", "webgl2"].includes(ctxName)) if (args[0] && typeof args[0] === "object") {
						const contextAttributes = args[0];
						if (!contextAttributes.preserveDrawingBuffer) contextAttributes.preserveDrawingBuffer = true;
					} else args.splice(0, 1, { preserveDrawingBuffer: true });
				}
				return original.apply(this, [contextType, ...args]);
			};
		});
		handlers.push(restoreHandler);
	} catch {
		console.error("failed to patch HTMLCanvasElement.prototype.getContext");
	}
	return () => {
		handlers.forEach((h) => h());
	};
}
function patchGLPrototype(prototype, type, cb, blockClass2, blockSelector, unblockSelector, _mirror2, win) {
	const handlers = [];
	const props = Object.getOwnPropertyNames(prototype);
	for (const prop of props) {
		if ([
			"isContextLost",
			"canvas",
			"drawingBufferWidth",
			"drawingBufferHeight"
		].includes(prop)) continue;
		try {
			if (typeof prototype[prop] !== "function") continue;
			const restoreHandler = patch(prototype, prop, function(original) {
				return function(...args) {
					const result = original.apply(this, args);
					saveWebGLVar(result, win, this);
					if ("tagName" in this.canvas && !isBlocked(this.canvas, blockClass2, blockSelector, unblockSelector, true)) {
						const recordArgs = serializeArgs(args, win, this);
						const mutation = {
							type,
							property: prop,
							args: recordArgs
						};
						cb(this.canvas, mutation);
					}
					return result;
				};
			});
			handlers.push(restoreHandler);
		} catch {
			const hookHandler = hookSetter(prototype, prop, { set(v) {
				cb(this.canvas, {
					type,
					property: prop,
					args: [v],
					setter: true
				});
			} });
			handlers.push(hookHandler);
		}
	}
	return handlers;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass2, blockSelector, unblockSelector, mirror) {
	const handlers = [];
	handlers.push(...patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass2, blockSelector, unblockSelector, mirror, win));
	if (typeof win.WebGL2RenderingContext !== "undefined") handlers.push(...patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass2, blockSelector, unblockSelector, mirror, win));
	return () => {
		handlers.forEach((h) => h());
	};
}
var r = `for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",t="undefined"==typeof Uint8Array?[]:new Uint8Array(256),a=0;a<64;a++)t[e.charCodeAt(a)]=a;var n=function(t){var a,n=new Uint8Array(t),r=n.length,s="";for(a=0;a<r;a+=3)s+=e[n[a]>>2],s+=e[(3&n[a])<<4|n[a+1]>>4],s+=e[(15&n[a+1])<<2|n[a+2]>>6],s+=e[63&n[a+2]];return r%3==2?s=s.substring(0,s.length-1)+"=":r%3==1&&(s=s.substring(0,s.length-2)+"=="),s};const r=new Map,s=new Map;const i=self;i.onmessage=async function(e){if(!("OffscreenCanvas"in globalThis))return i.postMessage({id:e.data.id});{const{id:t,bitmap:a,width:o,height:f,maxCanvasSize:c,dataURLOptions:g}=e.data,u=async function(e,t,a){const r=e+"-"+t;if("OffscreenCanvas"in globalThis){if(s.has(r))return s.get(r);const i=new OffscreenCanvas(e,t);i.getContext("2d");const o=await i.convertToBlob(a),f=await o.arrayBuffer(),c=n(f);return s.set(r,c),c}return""}(o,f,g),[h,d]=function(e,t,a){if(!a)return[e,t];const[n,r]=a;if(e<=n&&t<=r)return[e,t];let s=e,i=t;return s>n&&(i=Math.floor(n*t/e),s=n),i>r&&(s=Math.floor(r*e/t),i=r),[s,i]}(o,f,c),l=new OffscreenCanvas(h,d),w=l.getContext("bitmaprenderer"),p=h===o&&d===f?a:await createImageBitmap(a,{resizeWidth:h,resizeHeight:d,resizeQuality:"low"});w?.transferFromImageBitmap(p),a.close();const y=await l.convertToBlob(g),v=y.type,b=await y.arrayBuffer(),m=n(b);if(p.close(),!r.has(t)&&await u===m)return r.set(t,m),i.postMessage({id:t});if(r.get(t)===m)return i.postMessage({id:t});i.postMessage({id:t,type:v,base64:m,width:o,height:f}),r.set(t,m)}};`;
function t() {
	const t2 = new Blob([r]);
	return URL.createObjectURL(t2);
}
var CanvasManager = class {
	constructor(options) {
		this.pendingCanvasMutations = /* @__PURE__ */ new Map();
		this.rafStamps = {
			latestId: 0,
			invokeId: null
		};
		this.shadowDoms = /* @__PURE__ */ new Set();
		this.windowsSet = /* @__PURE__ */ new WeakSet();
		this.windows = [];
		this.restoreHandlers = [];
		this.frozen = false;
		this.locked = false;
		this.snapshotInProgressMap = /* @__PURE__ */ new Map();
		this.worker = null;
		this.lastSnapshotTime = 0;
		this.processMutation = (target, mutation) => {
			if (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) this.rafStamps.invokeId = this.rafStamps.latestId;
			if (!this.pendingCanvasMutations.has(target)) this.pendingCanvasMutations.set(target, []);
			this.pendingCanvasMutations.get(target).push(mutation);
		};
		const { enableManualSnapshot, sampling = "all", win, recordCanvas, errorHandler: errorHandler2 } = options;
		options.sampling = sampling;
		this.mutationCb = options.mutationCb;
		this.mirror = options.mirror;
		this.options = options;
		if (errorHandler2) registerErrorHandler(errorHandler2);
		if (recordCanvas && typeof sampling === "number" || enableManualSnapshot) this.worker = this.initFPSWorker();
		this.addWindow(win);
		if (enableManualSnapshot) return;
		callbackWrapper(() => {
			if (recordCanvas && sampling === "all") {
				this.startRAFTimestamping();
				this.startPendingCanvasMutationFlusher();
			}
			if (recordCanvas && typeof sampling === "number") this.initCanvasFPSObserver();
		})();
	}
	reset() {
		this.pendingCanvasMutations.clear();
		this.restoreHandlers.forEach((handler) => {
			try {
				handler();
			} catch (e) {}
		});
		this.restoreHandlers = [];
		this.windowsSet = /* @__PURE__ */ new WeakSet();
		this.windows = [];
		this.shadowDoms = /* @__PURE__ */ new Set();
		this.worker?.terminate();
		this.worker = null;
		this.snapshotInProgressMap = /* @__PURE__ */ new Map();
	}
	freeze() {
		this.frozen = true;
	}
	unfreeze() {
		this.frozen = false;
	}
	lock() {
		this.locked = true;
	}
	unlock() {
		this.locked = false;
	}
	addWindow(win) {
		const { sampling = "all", blockClass, blockSelector, unblockSelector, recordCanvas, enableManualSnapshot } = this.options;
		if (this.windowsSet.has(win)) return;
		if (enableManualSnapshot) {
			this.windowsSet.add(win);
			this.windows.push(new WeakRef(win));
			return;
		}
		callbackWrapper(() => {
			if (recordCanvas && sampling === "all") this.initCanvasMutationObserver(win, blockClass, blockSelector, unblockSelector);
			if (recordCanvas && typeof sampling === "number") {
				const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, unblockSelector, true);
				this.restoreHandlers.push(() => {
					canvasContextReset();
				});
			}
		})();
		this.windowsSet.add(win);
		this.windows.push(new WeakRef(win));
	}
	addShadowRoot(shadowRoot) {
		this.shadowDoms.add(new WeakRef(shadowRoot));
	}
	resetShadowRoots() {
		this.shadowDoms = /* @__PURE__ */ new Set();
	}
	snapshot(canvasElement, options) {
		if (options?.skipRequestAnimationFrame) {
			this.takeSnapshot(performance.now(), true, canvasElement);
			return;
		}
		onRequestAnimationFrame((timestamp) => this.takeSnapshot(timestamp, true, canvasElement));
	}
	initFPSWorker() {
		const worker = new Worker(t());
		worker.onmessage = (e) => {
			const data = e.data;
			const { id } = data;
			this.snapshotInProgressMap.set(id, false);
			if (!("base64" in data)) return;
			const { base64, type, width, height } = data;
			this.mutationCb({
				id,
				type: CanvasContext["2D"],
				commands: [{
					property: "clearRect",
					args: [
						0,
						0,
						width,
						height
					]
				}, {
					property: "drawImage",
					args: [
						{
							rr_type: "ImageBitmap",
							args: [{
								rr_type: "Blob",
								data: [{
									rr_type: "ArrayBuffer",
									base64
								}],
								type
							}]
						},
						0,
						0,
						width,
						height
					]
				}]
			});
		};
		return worker;
	}
	initCanvasFPSObserver() {
		let rafId;
		if (!this.windows.length && !this.shadowDoms.size) return;
		const rafCallback = (timestamp) => {
			this.takeSnapshot(timestamp, false);
			rafId = onRequestAnimationFrame(rafCallback);
		};
		rafId = onRequestAnimationFrame(rafCallback);
		this.restoreHandlers.push(() => {
			if (rafId) cancelAnimationFrame(rafId);
		});
	}
	initCanvasMutationObserver(win, blockClass, blockSelector, unblockSelector) {
		const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, unblockSelector, false);
		const canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, unblockSelector);
		const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, blockSelector, unblockSelector, this.mirror);
		this.restoreHandlers.push(() => {
			canvasContextReset();
			canvas2DReset();
			canvasWebGL1and2Reset();
		});
	}
	/**
	* Returns all `canvas` elements that are not blocked by the given selectors. Searches all windows and shadow roots.
	*/
	getCanvasElements(blockClass, blockSelector, unblockSelector) {
		const matchedCanvas = [];
		const searchCanvas = (root) => {
			root.querySelectorAll("canvas").forEach((canvas) => {
				if (!isBlocked(canvas, blockClass, blockSelector, unblockSelector, true)) matchedCanvas.push(canvas);
			});
		};
		for (const item of this.windows) {
			const window2 = item.deref();
			let _document;
			try {
				_document = window2 && window2.document;
			} catch {}
			if (_document) searchCanvas(_document);
		}
		for (const item of this.shadowDoms) {
			const shadowRoot = item.deref();
			if (shadowRoot) searchCanvas(shadowRoot);
		}
		return matchedCanvas;
	}
	/**
	* Takes a snapshot of the provided canvas element, or will search all windows/shadow roots for canvases. Will self-throttle based on `options.sampling`.
	*
	* @returns `true` if the snapshot was taken, `false` if it was throttled.
	*/
	takeSnapshot(timestamp, isManualSnapshot, canvasElement) {
		const { sampling, blockClass, blockSelector, unblockSelector, dataURLOptions, maxCanvasSize } = this.options;
		const timeBetweenSnapshots = 1e3 / (sampling === "all" ? 2 : sampling || 2);
		if (this.lastSnapshotTime && timestamp - this.lastSnapshotTime < timeBetweenSnapshots) return false;
		this.lastSnapshotTime = timestamp;
		(canvasElement ? [canvasElement] : this.getCanvasElements(blockClass, blockSelector, unblockSelector)).forEach((canvas) => {
			const id = this.mirror.getId(canvas);
			if (!this.mirror.hasNode(canvas) || !canvas.width || !canvas.height || this.snapshotInProgressMap.get(id)) return;
			this.snapshotInProgressMap.set(id, true);
			if (!isManualSnapshot && ["webgl", "webgl2"].includes(canvas.__context)) {
				const context = canvas.getContext(canvas.__context);
				if (context?.getContextAttributes()?.preserveDrawingBuffer === false) context.clear(context.COLOR_BUFFER_BIT);
			}
			createImageBitmap(canvas).then((bitmap) => {
				this.worker?.postMessage({
					id,
					bitmap,
					width: canvas.width,
					height: canvas.height,
					dataURLOptions,
					maxCanvasSize
				}, [bitmap]);
			}).catch((error) => {
				callbackWrapper(() => {
					this.snapshotInProgressMap.delete(id);
					throw error;
				})();
			});
		});
		return true;
	}
	startPendingCanvasMutationFlusher() {
		onRequestAnimationFrame(() => this.flushPendingCanvasMutations());
	}
	startRAFTimestamping() {
		const setLatestRAFTimestamp = (timestamp) => {
			this.rafStamps.latestId = timestamp;
			onRequestAnimationFrame(setLatestRAFTimestamp);
		};
		onRequestAnimationFrame(setLatestRAFTimestamp);
	}
	flushPendingCanvasMutations() {
		this.pendingCanvasMutations.forEach((_values, canvas) => {
			const id = this.mirror.getId(canvas);
			this.flushPendingCanvasMutationFor(canvas, id);
		});
		onRequestAnimationFrame(() => this.flushPendingCanvasMutations());
	}
	flushPendingCanvasMutationFor(canvas, id) {
		if (this.frozen || this.locked) return;
		const valuesWithType = this.pendingCanvasMutations.get(canvas);
		if (!valuesWithType || id === -1) return;
		const values = valuesWithType.map((value) => {
			const { type: type2, ...rest } = value;
			return rest;
		});
		const { type } = valuesWithType[0];
		this.mutationCb({
			id,
			type,
			commands: values
		});
		this.pendingCanvasMutations.delete(canvas);
	}
};
try {
	if (Array.from([1], (x) => x * 2)[0] !== 2) {
		const cleanFrame = document.createElement("iframe");
		document.body.appendChild(cleanFrame);
		Array.from = cleanFrame.contentWindow?.Array.from || Array.from;
		document.body.removeChild(cleanFrame);
	}
} catch (err) {
	console.debug("Unable to override Array.from", err);
}
createMirror();
var n;
(function(t2) {
	t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
})(n || (n = {}));
var CANVAS_QUALITY = {
	low: {
		sampling: { canvas: 1 },
		dataURLOptions: {
			type: "image/webp",
			quality: .25
		}
	},
	medium: {
		sampling: { canvas: 2 },
		dataURLOptions: {
			type: "image/webp",
			quality: .4
		}
	},
	high: {
		sampling: { canvas: 4 },
		dataURLOptions: {
			type: "image/webp",
			quality: .5
		}
	}
};
var INTEGRATION_NAME = "ReplayCanvas";
var DEFAULT_MAX_CANVAS_SIZE = 1280;
var _replayCanvasIntegration = ((options = {}) => {
	const [maxCanvasWidth, maxCanvasHeight] = options.maxCanvasSize || [];
	const _canvasOptions = {
		quality: options.quality || "medium",
		enableManualSnapshot: options.enableManualSnapshot,
		maxCanvasSize: [maxCanvasWidth ? Math.min(maxCanvasWidth, DEFAULT_MAX_CANVAS_SIZE) : DEFAULT_MAX_CANVAS_SIZE, maxCanvasHeight ? Math.min(maxCanvasHeight, DEFAULT_MAX_CANVAS_SIZE) : DEFAULT_MAX_CANVAS_SIZE]
	};
	let currentCanvasManager;
	let canvasManagerResolve;
	const _canvasManager = new Promise((resolve) => canvasManagerResolve = resolve);
	return {
		name: INTEGRATION_NAME,
		getOptions() {
			const { quality, enableManualSnapshot, maxCanvasSize } = _canvasOptions;
			return {
				enableManualSnapshot,
				recordCanvas: true,
				getCanvasManager: (getCanvasManagerOptions) => {
					const manager = new CanvasManager({
						...getCanvasManagerOptions,
						enableManualSnapshot,
						maxCanvasSize,
						errorHandler: (err) => {
							try {
								if (typeof err === "object") err.__rrweb__ = true;
							} catch {}
						}
					});
					currentCanvasManager = manager;
					canvasManagerResolve(manager);
					return manager;
				},
				...CANVAS_QUALITY[quality] || CANVAS_QUALITY.medium
			};
		},
		async snapshot(canvasElement, options2) {
			(currentCanvasManager || await _canvasManager).snapshot(canvasElement, options2);
		}
	};
});
var replayCanvasIntegration = defineIntegration(_replayCanvasIntegration);
//#endregion
//#region node_modules/@sentry/react/build/esm/isSyntheticEvent.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function isSyntheticEvent(wat) {
	return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
}
//#endregion
//#region node_modules/@sentry/react/build/esm/sdk.js
function init(options) {
	const opts = { ...options };
	applySdkMetadata(opts, "react");
	setContext("react", { version: import_react.version });
	const client = init$1(opts);
	setNormalizeStringifier(normalizeStringifyValue);
	return client;
}
function normalizeStringifyValue(value) {
	if (isSyntheticEvent(value)) return "[SyntheticEvent]";
	return normalizeStringifyValue$1(value);
}
//#endregion
//#region node_modules/@sentry/react/build/esm/error.js
function isAtLeastReact17(reactVersion) {
	const reactMajor = reactVersion.match(/^([^.]+)/);
	return reactMajor !== null && parseInt(reactMajor[0]) >= 17;
}
function setCause(error, cause) {
	const seenErrors = /* @__PURE__ */ new WeakSet();
	function recurse(error2, cause2) {
		if (seenErrors.has(error2)) return;
		if (error2.cause) {
			seenErrors.add(error2);
			return recurse(error2.cause, cause2);
		}
		error2.cause = cause2;
	}
	recurse(error, cause);
}
function captureReactException(error, { componentStack }, hint) {
	if (isAtLeastReact17(import_react.version) && isError(error) && componentStack) {
		const errorBoundaryError = new Error(error.message);
		errorBoundaryError.name = `React ErrorBoundary ${error.name}`;
		errorBoundaryError.stack = componentStack;
		setCause(error, errorBoundaryError);
	}
	return captureException(error, hint);
}
function reactErrorHandler(callback) {
	return (error, errorInfo) => {
		const hasCallback = !!callback;
		const eventId = captureReactException(error, errorInfo, { mechanism: {
			handled: hasCallback,
			type: "auto.function.react.error_handler"
		} });
		if (hasCallback) callback(error, errorInfo, eventId);
	};
}
//#endregion
//#region node_modules/@sentry/react/build/esm/constants.js
var REACT_RENDER_OP = "ui.react.render";
var REACT_UPDATE_OP = "ui.react.update";
var REACT_MOUNT_OP = "ui.react.mount";
//#endregion
//#region node_modules/@sentry/react/build/esm/hoist-non-react-statics.js
var REACT_STATICS = {
	childContextTypes: true,
	contextType: true,
	contextTypes: true,
	defaultProps: true,
	displayName: true,
	getDefaultProps: true,
	getDerivedStateFromError: true,
	getDerivedStateFromProps: true,
	mixins: true,
	propTypes: true,
	type: true
};
var KNOWN_STATICS = {
	name: true,
	length: true,
	prototype: true,
	caller: true,
	callee: true,
	arguments: true,
	arity: true
};
var FORWARD_REF_STATICS = {
	$$typeof: true,
	render: true,
	defaultProps: true,
	displayName: true,
	propTypes: true
};
var MEMO_STATICS = {
	$$typeof: true,
	compare: true,
	defaultProps: true,
	displayName: true,
	propTypes: true,
	type: true
};
var ForwardRefType = /* @__PURE__ */ Symbol.for("react.forward_ref");
var MemoType = /* @__PURE__ */ Symbol.for("react.memo");
function isMemo(component) {
	return typeof component === "object" && component !== null && component.$$typeof === MemoType;
}
var TYPE_STATICS = {};
TYPE_STATICS[ForwardRefType] = FORWARD_REF_STATICS;
TYPE_STATICS[MemoType] = MEMO_STATICS;
function getStatics(component) {
	if (isMemo(component)) return MEMO_STATICS;
	const componentType = component.$$typeof;
	return componentType && TYPE_STATICS[componentType] || REACT_STATICS;
}
var defineProperty = Object.defineProperty.bind(Object);
var getOwnPropertyNames = Object.getOwnPropertyNames.bind(Object);
var getOwnPropertySymbols = Object.getOwnPropertySymbols?.bind(Object);
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor.bind(Object);
var getPrototypeOf = Object.getPrototypeOf.bind(Object);
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent, excludelist) {
	if (typeof sourceComponent !== "string") {
		if (objectPrototype) {
			const inheritedComponent = getPrototypeOf(sourceComponent);
			if (inheritedComponent && inheritedComponent !== objectPrototype) hoistNonReactStatics(targetComponent, inheritedComponent);
		}
		let keys = getOwnPropertyNames(sourceComponent);
		if (getOwnPropertySymbols) keys = keys.concat(getOwnPropertySymbols(sourceComponent));
		const targetStatics = getStatics(targetComponent);
		const sourceStatics = getStatics(sourceComponent);
		for (const key of keys) if (!KNOWN_STATICS[key] && !sourceStatics?.[key] && !targetStatics?.[key] && !getOwnPropertyDescriptor(targetComponent, key)) {
			const descriptor = getOwnPropertyDescriptor(sourceComponent, key);
			if (descriptor) try {
				defineProperty(targetComponent, key, descriptor);
			} catch (_e) {}
		}
	}
	return targetComponent;
}
var Profiler = class extends import_react.Component {
	constructor(props) {
		super(props);
		const { name, disabled = false } = this.props;
		if (disabled) return;
		this._mountSpan = startInactiveSpan({
			name: `<${name}>`,
			onlyIfParent: true,
			op: REACT_MOUNT_OP,
			attributes: {
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.react.profiler",
				"ui.component_name": name
			}
		});
	}
	componentDidMount() {
		if (this._mountSpan) this._mountSpan.end();
	}
	shouldComponentUpdate({ updateProps, includeUpdates = true }) {
		if (includeUpdates && this._mountSpan && updateProps !== this.props.updateProps) {
			const changedProps = Object.keys(updateProps).filter((k) => updateProps[k] !== this.props.updateProps[k]);
			if (changedProps.length > 0) {
				const now = timestampInSeconds();
				this._updateSpan = withActiveSpan(this._mountSpan, () => {
					return startInactiveSpan({
						name: `<${this.props.name}>`,
						onlyIfParent: true,
						op: REACT_UPDATE_OP,
						startTime: now,
						attributes: {
							[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.react.profiler",
							"ui.component_name": this.props.name,
							"ui.react.changed_props": changedProps
						}
					});
				});
			}
		}
		return true;
	}
	componentDidUpdate() {
		if (this._updateSpan) {
			this._updateSpan.end();
			this._updateSpan = void 0;
		}
	}
	componentWillUnmount() {
		const endTimestamp = timestampInSeconds();
		const { name, includeRender = true } = this.props;
		if (this._mountSpan && includeRender) {
			const startTime = spanToJSON(this._mountSpan).timestamp;
			withActiveSpan(this._mountSpan, () => {
				const renderSpan = startInactiveSpan({
					onlyIfParent: true,
					name: `<${name}>`,
					op: REACT_RENDER_OP,
					startTime,
					attributes: {
						[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.react.profiler",
						"ui.component_name": name
					}
				});
				if (renderSpan) renderSpan.end(endTimestamp);
			});
		}
	}
	render() {
		return this.props.children;
	}
};
Object.assign(Profiler, { defaultProps: {
	disabled: false,
	includeRender: true,
	includeUpdates: true
} });
function withProfiler(WrappedComponent, options) {
	const componentDisplayName = options?.name || WrappedComponent.displayName || WrappedComponent.name || "unknown";
	const Wrapped = (props) => /* @__PURE__ */ import_react.createElement(Profiler, {
		...options,
		name: componentDisplayName,
		updateProps: props
	}, /* @__PURE__ */ import_react.createElement(WrappedComponent, { ...props }));
	Wrapped.displayName = `profiler(${componentDisplayName})`;
	hoistNonReactStatics(Wrapped, WrappedComponent);
	return Wrapped;
}
function useProfiler(name, options = {
	disabled: false,
	hasRenderSpan: true
}) {
	const [mountSpan] = import_react.useState(() => {
		if (options?.disabled) return;
		return startInactiveSpan({
			name: `<${name}>`,
			onlyIfParent: true,
			op: REACT_MOUNT_OP,
			attributes: {
				[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.react.profiler",
				"ui.component_name": name
			}
		});
	});
	import_react.useEffect(() => {
		if (mountSpan) mountSpan.end();
		return () => {
			if (mountSpan && options.hasRenderSpan) {
				const startTime = spanToJSON(mountSpan).timestamp;
				const endTimestamp = timestampInSeconds();
				const renderSpan = startInactiveSpan({
					name: `<${name}>`,
					onlyIfParent: true,
					op: REACT_RENDER_OP,
					startTime,
					attributes: {
						[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.react.profiler",
						"ui.component_name": name
					}
				});
				if (renderSpan) renderSpan.end(endTimestamp);
			}
		};
	}, []);
}
//#endregion
//#region node_modules/@sentry/react/build/esm/debug-build.js
var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
var INITIAL_STATE = {
	componentStack: null,
	error: null,
	eventId: null
};
var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = INITIAL_STATE;
		this._openFallbackReportDialog = true;
		const client = getClient();
		if (client && props.showDialog) {
			this._openFallbackReportDialog = false;
			this._cleanupHook = client.on("afterSendEvent", (event) => {
				if (!event.type && this._lastEventId && event.event_id === this._lastEventId) showReportDialog({
					...props.dialogOptions,
					eventId: this._lastEventId
				});
			});
		}
	}
	componentDidCatch(error, errorInfo) {
		const { componentStack } = errorInfo;
		const { beforeCapture, onError, showDialog, dialogOptions } = this.props;
		withScope((scope) => {
			if (beforeCapture) beforeCapture(scope, error, componentStack);
			const eventId = captureReactException(error, errorInfo, { mechanism: {
				handled: this.props.handled != null ? this.props.handled : !!this.props.fallback,
				type: "auto.function.react.error_boundary"
			} });
			if (onError) onError(error, componentStack, eventId);
			if (showDialog) {
				this._lastEventId = eventId;
				if (this._openFallbackReportDialog) showReportDialog({
					...dialogOptions,
					eventId
				});
			}
			this.setState({
				error,
				componentStack,
				eventId
			});
		});
	}
	componentDidMount() {
		const { onMount } = this.props;
		if (onMount) onMount();
	}
	componentWillUnmount() {
		const { error, componentStack, eventId } = this.state;
		const { onUnmount } = this.props;
		if (onUnmount) if (this.state === INITIAL_STATE) onUnmount(null, null, null);
		else onUnmount(error, componentStack, eventId);
		if (this._cleanupHook) {
			this._cleanupHook();
			this._cleanupHook = void 0;
		}
	}
	resetErrorBoundary() {
		const { onReset } = this.props;
		const { error, componentStack, eventId } = this.state;
		if (onReset) onReset(error, componentStack, eventId);
		this.setState(INITIAL_STATE);
	}
	render() {
		const { fallback, children } = this.props;
		const state = this.state;
		if (state.componentStack === null) return typeof children === "function" ? children() : children;
		const element = typeof fallback === "function" ? import_react.createElement(fallback, {
			error: state.error,
			componentStack: state.componentStack,
			resetError: () => this.resetErrorBoundary(),
			eventId: state.eventId
		}) : fallback;
		if (import_react.isValidElement(element)) return element;
		if (fallback) DEBUG_BUILD && debug$1.warn("fallback did not produce a valid ReactElement");
		return null;
	}
};
function withErrorBoundary(WrappedComponent, errorBoundaryOptions) {
	const componentDisplayName = WrappedComponent.displayName || WrappedComponent.name || "unknown";
	const Wrapped = import_react.memo((props) => /* @__PURE__ */ import_react.createElement(ErrorBoundary, { ...errorBoundaryOptions }, /* @__PURE__ */ import_react.createElement(WrappedComponent, { ...props })));
	Wrapped.displayName = `errorBoundary(${componentDisplayName})`;
	hoistNonReactStatics(Wrapped, WrappedComponent);
	return Wrapped;
}
//#endregion
//#region node_modules/@sentry/react/build/esm/redux.js
var ACTION_BREADCRUMB_CATEGORY = "redux.action";
var ACTION_BREADCRUMB_TYPE = "info";
var defaultOptions = {
	attachReduxState: true,
	actionTransformer: (action) => action,
	stateTransformer: (state) => state || null
};
function createReduxEnhancer(enhancerOptions) {
	const options = {
		...defaultOptions,
		...enhancerOptions
	};
	return (next) => (reducer, initialState) => {
		options.attachReduxState && getGlobalScope().addEventProcessor((event, hint) => {
			try {
				if (event.type === void 0 && event.contexts.state.state.type === "redux") hint.attachments = [...hint.attachments || [], {
					filename: "redux_state.json",
					data: JSON.stringify(event.contexts.state.state.value)
				}];
			} catch {}
			return event;
		});
		function sentryWrapReducer(reducer2) {
			return (state, action) => {
				const newState = reducer2(state, action);
				const scope = getCurrentScope();
				const transformedAction = options.actionTransformer(action);
				if (typeof transformedAction !== "undefined" && transformedAction !== null) addBreadcrumb({
					category: ACTION_BREADCRUMB_CATEGORY,
					data: transformedAction,
					type: ACTION_BREADCRUMB_TYPE
				});
				const transformedState = options.stateTransformer(newState);
				if (typeof transformedState !== "undefined" && transformedState !== null) {
					const normalizationDepth = (getClient()?.getOptions())?.normalizeDepth || 3;
					const newStateContext = { state: {
						type: "redux",
						value: transformedState
					} };
					setNormalizationDepthOverrideHint(newStateContext, 3 + normalizationDepth);
					scope.setContext("state", newStateContext);
				} else scope.setContext("state", null);
				const { configureScopeWithState } = options;
				if (typeof configureScopeWithState === "function") configureScopeWithState(scope, newState);
				return newState;
			};
		}
		const store = next(sentryWrapReducer(reducer), initialState);
		store.replaceReducer = new Proxy(store.replaceReducer, { apply: function(target, thisArg, args) {
			target.apply(thisArg, [sentryWrapReducer(args[0])]);
		} });
		return store;
	};
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouterv3.js
function reactRouterV3BrowserTracingIntegration(options) {
	const integration = browserTracingIntegration({
		...options,
		instrumentPageLoad: false,
		instrumentNavigation: false
	});
	const { history, routes, match, instrumentPageLoad = true, instrumentNavigation = true } = options;
	return {
		...integration,
		afterAllSetup(client) {
			integration.afterAllSetup(client);
			if (instrumentPageLoad && WINDOW$1.location) normalizeTransactionName(routes, WINDOW$1.location, match, (localName, source = "url") => {
				startBrowserTracingPageLoadSpan(client, {
					name: localName,
					attributes: {
						[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "pageload",
						[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.pageload.react.reactrouter_v3",
						[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
						...source === "route" && { ["url.template"]: localName }
					}
				});
			});
			if (instrumentNavigation && history.listen) history.listen((location) => {
				if (location.action === "PUSH" || location.action === "POP") normalizeTransactionName(routes, location, match, (localName, source = "url") => {
					startBrowserTracingNavigationSpan(client, {
						name: localName,
						attributes: {
							[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "navigation",
							[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.react.reactrouter_v3",
							[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
							...source === "route" && { ["url.template"]: localName }
						}
					});
				});
			});
		}
	};
}
function normalizeTransactionName(appRoutes, location, match, callback) {
	let name = location.pathname;
	match({
		location,
		routes: appRoutes
	}, (error, _redirectLocation, renderProps) => {
		if (error || !renderProps) return callback(name);
		const routePath = getRouteStringFromRoutes(renderProps.routes || []);
		if (routePath.length === 0 || routePath === "/*") return callback(name);
		name = routePath;
		return callback(name, "route");
	});
}
function getRouteStringFromRoutes(routes) {
	if (!Array.isArray(routes) || routes.length === 0) return "";
	const routesWithPaths = routes.filter((route) => !!route.path);
	let index = -1;
	for (let x = routesWithPaths.length - 1; x >= 0; x--) if (routesWithPaths[x].path?.startsWith("/")) {
		index = x;
		break;
	}
	return routesWithPaths.slice(index).reduce((acc, { path }) => {
		return `${acc}${acc === "/" || acc === "" ? path : `/${path}`}`;
	}, "");
}
//#endregion
//#region node_modules/@sentry/react/build/esm/tanstackrouter.js
function tanstackRouterBrowserTracingIntegration(router, options = {}) {
	const castRouterInstance = router;
	const browserTracingIntegrationInstance = browserTracingIntegration({
		...options,
		instrumentNavigation: false,
		instrumentPageLoad: false
	});
	const { instrumentPageLoad = true, instrumentNavigation = true } = options;
	return {
		...browserTracingIntegrationInstance,
		afterAllSetup(client) {
			browserTracingIntegrationInstance.afterAllSetup(client);
			const resolveRouteMatch = (pathname, search) => {
				const matchedRoutes = castRouterInstance.matchRoutes(pathname, search, {
					preload: false,
					throwOnError: false
				});
				const lastMatch = matchedRoutes[matchedRoutes.length - 1];
				return lastMatch?.routeId !== "__root__" ? lastMatch : void 0;
			};
			const applyRouteMatch = (span, match, toLocation, fallbackName) => {
				span.updateName(match ? match.routeId : fallbackName);
				span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, match ? "route" : "url");
				span.setAttributes({
					...match && { ["url.template"]: match.routeId },
					...locationToSpanUrlAttributes(castRouterInstance, toLocation),
					...routeMatchToParamSpanAttributes(match)
				});
			};
			const initialWindowLocation = WINDOW$1.location;
			if (instrumentPageLoad && initialWindowLocation) {
				const routeMatch = resolveRouteMatch(initialWindowLocation.pathname, castRouterInstance.options.parseSearch(initialWindowLocation.search));
				const pageloadSpan = startBrowserTracingPageLoadSpan(client, {
					name: routeMatch ? routeMatch.routeId : initialWindowLocation.pathname,
					attributes: {
						[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "pageload",
						[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.pageload.react.tanstack_router",
						[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: routeMatch ? "route" : "url",
						...routeMatch && { ["url.template"]: routeMatch.routeId },
						...routeMatchToParamSpanAttributes(routeMatch)
					}
				});
				const unsubscribePageloadResolved = castRouterInstance.subscribe("onResolved", (onResolvedArgs) => {
					unsubscribePageloadResolved();
					if (!pageloadSpan) return;
					const { toLocation } = onResolvedArgs;
					const resolvedMatch = resolveRouteMatch(toLocation.pathname, toLocation.search);
					applyRouteMatch(pageloadSpan, resolvedMatch, toLocation, toLocation.pathname);
				});
			}
			if (instrumentNavigation) {
				let inFlightNavigationSpan;
				castRouterInstance.subscribe("onBeforeLoad", (onBeforeLoadArgs) => {
					const { toLocation, fromLocation } = onBeforeLoadArgs;
					if (!fromLocation || toLocation.state === fromLocation.state) return;
					const routeMatch = resolveRouteMatch(toLocation.pathname, toLocation.search);
					const fallbackName = WINDOW$1.location?.pathname || toLocation.pathname;
					if (inFlightNavigationSpan) {
						applyRouteMatch(inFlightNavigationSpan, routeMatch, toLocation, fallbackName);
						return;
					}
					inFlightNavigationSpan = startBrowserTracingNavigationSpan(client, {
						name: routeMatch ? routeMatch.routeId : fallbackName,
						attributes: {
							[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "navigation",
							[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.react.tanstack_router",
							[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: routeMatch ? "route" : "url",
							...routeMatch && { ["url.template"]: routeMatch.routeId },
							...routeMatchToParamSpanAttributes(routeMatch)
						}
					}, { url: locationToAbsoluteUrl(castRouterInstance, toLocation) });
				});
				castRouterInstance.subscribe("onResolved", (onResolvedArgs) => {
					const span = inFlightNavigationSpan;
					inFlightNavigationSpan = void 0;
					if (!span) return;
					const { toLocation } = onResolvedArgs;
					const resolvedMatch = resolveRouteMatch(toLocation.pathname, toLocation.search);
					if (resolvedMatch) applyRouteMatch(span, resolvedMatch, toLocation, WINDOW$1.location?.pathname || toLocation.pathname);
				});
			}
		}
	};
}
function locationToAbsoluteUrl(router, location) {
	const search = router.options.stringifySearch?.(location.search) ?? "";
	return getAbsoluteUrl(`${location.pathname}${search && search !== "?" ? search : ""}`);
}
function locationToSpanUrlAttributes(router, location) {
	const absoluteUrl = locationToAbsoluteUrl(router, location);
	return {
		[Vu]: location.pathname,
		[Yu]: absoluteUrl
	};
}
function routeMatchToParamSpanAttributes(match) {
	if (!match) return {};
	const paramAttributes = {};
	Object.entries(match.params).forEach(([key, value]) => {
		paramAttributes[`url.path.params.${key}`] = value;
		paramAttributes[`${Fu}.${key}`] = value;
		paramAttributes[`${Jl}.${key}`] = value;
	});
	return paramAttributes;
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouter.js
function reactRouterV4BrowserTracingIntegration(options) {
	const integration = browserTracingIntegration({
		...options,
		instrumentPageLoad: false,
		instrumentNavigation: false
	});
	const { history, routes, matchPath, instrumentPageLoad = true, instrumentNavigation = true } = options;
	return {
		...integration,
		afterAllSetup(client) {
			integration.afterAllSetup(client);
			instrumentReactRouter(client, instrumentPageLoad, instrumentNavigation, history, "reactrouter_v4", routes, matchPath);
		}
	};
}
function reactRouterV5BrowserTracingIntegration(options) {
	const integration = browserTracingIntegration({
		...options,
		instrumentPageLoad: false,
		instrumentNavigation: false
	});
	const { history, routes, matchPath, instrumentPageLoad = true, instrumentNavigation = true } = options;
	return {
		...integration,
		afterAllSetup(client) {
			integration.afterAllSetup(client);
			instrumentReactRouter(client, instrumentPageLoad, instrumentNavigation, history, "reactrouter_v5", routes, matchPath);
		}
	};
}
function instrumentReactRouter(client, instrumentPageLoad, instrumentNavigation, history, instrumentationName, allRoutes = [], matchPath) {
	function getInitPathName() {
		if (history.location) return history.location.pathname;
		if (WINDOW$1.location) return WINDOW$1.location.pathname;
	}
	function normalizeTransactionName(pathname) {
		if (allRoutes.length === 0 || !matchPath) return [pathname, "url"];
		const branches = matchRoutes(allRoutes, pathname, matchPath);
		for (const branch of branches) if (branch.match.isExact) return [branch.match.path, "route"];
		return [pathname, "url"];
	}
	if (instrumentPageLoad) {
		const initPathName = getInitPathName();
		if (initPathName) {
			const [name, source] = normalizeTransactionName(initPathName);
			startBrowserTracingPageLoadSpan(client, {
				name,
				attributes: {
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "pageload",
					[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: `auto.pageload.react.${instrumentationName}`,
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
					...source === "route" && { ["url.template"]: name }
				}
			});
		}
	}
	if (instrumentNavigation && history.listen) history.listen((location, action) => {
		if (action && (action === "PUSH" || action === "POP")) {
			const [name, source] = normalizeTransactionName(location.pathname);
			startBrowserTracingNavigationSpan(client, {
				name,
				attributes: {
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "navigation",
					[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: `auto.navigation.react.${instrumentationName}`,
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
					...source === "route" && { ["url.template"]: name }
				}
			});
		}
	});
}
function matchRoutes(routes, pathname, matchPath, branch = []) {
	routes.some((route) => {
		const match = route.path ? matchPath(pathname, route) : branch.length ? branch[branch.length - 1].match : computeRootMatch(pathname);
		if (match) {
			branch.push({
				route,
				match
			});
			if (route.routes) matchRoutes(route.routes, pathname, matchPath, branch);
		}
		return !!match;
	});
	return branch;
}
function computeRootMatch(pathname) {
	return {
		path: "/",
		url: "/",
		params: {},
		isExact: pathname === "/"
	};
}
function withSentryRouting(Route) {
	const componentDisplayName = Route.displayName || Route.name;
	const WrappedRoute = (props) => {
		if (props?.computedMatch?.isExact) {
			const route = props.computedMatch.path;
			const activeRootSpan = getActiveRootSpan$1();
			getCurrentScope().setTransactionName(route);
			if (activeRootSpan) {
				activeRootSpan.updateName(route);
				activeRootSpan.setAttributes({
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
					[ju]: route
				});
			}
		}
		return /* @__PURE__ */ import_react.createElement(Route, { ...props });
	};
	WrappedRoute.displayName = `sentryRoute(${componentDisplayName})`;
	hoistNonReactStatics(WrappedRoute, Route);
	return WrappedRoute;
}
function getActiveRootSpan$1() {
	const span = getActiveSpan();
	const rootSpan = span && getRootSpan(span);
	if (!rootSpan) return;
	const op = spanToJSON(rootSpan).op;
	return op === "navigation" || op === "pageload" ? rootSpan : void 0;
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouter-compat-utils/route-manifest.js
function stripBasenameFromPathname(pathname, basename) {
	if (!basename || basename === "/") return pathname;
	if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) return pathname;
	const startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
	const nextChar = pathname.charAt(startIndex);
	if (nextChar && nextChar !== "/") return pathname;
	return pathname.slice(startIndex) || "/";
}
var SORTED_MANIFEST_CACHE = /* @__PURE__ */ new WeakMap();
function matchRouteManifest(pathname, manifest, basename) {
	if (!pathname || !manifest?.length) return null;
	const normalizedPathname = basename ? stripBasenameFromPathname(pathname, basename) : pathname;
	let sorted = SORTED_MANIFEST_CACHE.get(manifest);
	if (!sorted) {
		sorted = sortBySpecificity(manifest);
		SORTED_MANIFEST_CACHE.set(manifest, sorted);
		DEBUG_BUILD && debug$1.log("[React Router] Sorted route manifest by specificity:", sorted.length, "patterns");
	}
	for (const pattern of sorted) if (matchesPattern(normalizedPathname, pattern)) {
		DEBUG_BUILD && debug$1.log("[React Router] Matched pathname", normalizedPathname, "to pattern", pattern);
		return pattern;
	}
	DEBUG_BUILD && debug$1.log("[React Router] No manifest match found for pathname:", normalizedPathname);
	return null;
}
function matchesPattern(pathname, pattern) {
	if (pattern === "/") return pathname === "/" || pathname === "";
	const pathSegments = splitPath(pathname);
	const patternSegments = splitPath(pattern);
	if (patternSegments.length > 0 && patternSegments[patternSegments.length - 1] === "*") {
		const patternSegmentsWithoutWildcard = patternSegments.slice(0, -1);
		if (pathSegments.length < patternSegmentsWithoutWildcard.length) return false;
		for (const [i, patternSegment] of patternSegmentsWithoutWildcard.entries()) if (!segmentMatches(pathSegments[i], patternSegment)) return false;
		return true;
	}
	if (pathSegments.length !== patternSegments.length) return false;
	for (const [i, patternSegment] of patternSegments.entries()) if (!segmentMatches(pathSegments[i], patternSegment)) return false;
	return true;
}
function segmentMatches(pathSegment, patternSegment) {
	if (pathSegment === void 0 || patternSegment === void 0) return false;
	if (PARAM_RE.test(patternSegment)) return true;
	return pathSegment === patternSegment;
}
function splitPath(path) {
	return path.split("/").filter(Boolean);
}
var PARAM_RE = /^:[\w-]+$/;
var STATIC_SEGMENT_SCORE = 10;
var DYNAMIC_SEGMENT_SCORE = 3;
var EMPTY_SEGMENT_SCORE = 1;
var SPLAT_PENALTY = -2;
function computeScore(pattern) {
	const segments = pattern.split("/");
	let score = segments.length;
	if (segments.includes("*")) score += SPLAT_PENALTY;
	for (const segment of segments) if (segment === "*") continue;
	else if (PARAM_RE.test(segment)) score += DYNAMIC_SEGMENT_SCORE;
	else if (segment === "") score += EMPTY_SEGMENT_SCORE;
	else score += STATIC_SEGMENT_SCORE;
	return score;
}
function sortBySpecificity(manifest) {
	return [...manifest].sort((a, b) => {
		const aScore = computeScore(a);
		return computeScore(b) - aScore;
	});
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouter-compat-utils/utils.js
var _matchRoutes$1;
var _stripBasename = false;
var _navigationContextStack = [];
var MAX_CONTEXT_STACK_SIZE = 10;
function setNavigationContext(targetPath, span) {
	const token = {};
	if (_navigationContextStack.length >= MAX_CONTEXT_STACK_SIZE) {
		DEBUG_BUILD && debug$1.warn("[React Router] Navigation context stack overflow - removing oldest context");
		_navigationContextStack.shift();
	}
	_navigationContextStack.push({
		token,
		targetPath,
		span
	});
	return token;
}
function clearNavigationContext(token) {
	if (_navigationContextStack[_navigationContextStack.length - 1]?.token === token) _navigationContextStack.pop();
}
function getNavigationContext() {
	const length = _navigationContextStack.length;
	return length > 0 ? _navigationContextStack[length - 1] ?? null : null;
}
function initializeRouterUtils(matchRoutes, stripBasename = false) {
	_matchRoutes$1 = matchRoutes;
	_stripBasename = stripBasename;
}
function pickPath(match) {
	return trimWildcard(match.route.path || "");
}
function pickSplat(match) {
	return match.params["*"] || "";
}
function trimWildcard(path) {
	return path[path.length - 1] === "*" ? path.slice(0, -1) : path;
}
function trimSlash(path) {
	return path[path.length - 1] === "/" ? path.slice(0, -1) : path;
}
function pathEndsWithWildcard(path) {
	return path.endsWith("*");
}
function transactionNameHasWildcard(name) {
	return name.includes("/*") || name.endsWith("*");
}
function pathIsWildcardAndHasChildren(path, branch) {
	return pathEndsWithWildcard(path) && !!branch.route.children?.length || false;
}
function routeIsDescendant(route) {
	return !!(!route.children && route.element && route.path?.endsWith("/*"));
}
function sendIndexPath(pathBuilder, pathname, basename) {
	const reconstructedPath = pathBuilder && pathBuilder.length > 0 ? pathBuilder : _stripBasename ? stripBasenameFromPathname(pathname, basename) : pathname;
	let formattedPath = reconstructedPath.slice(-2) === "/*" ? reconstructedPath.slice(0, -2) : reconstructedPath;
	if (formattedPath.length > 1 && formattedPath[formattedPath.length - 1] === "/") formattedPath = formattedPath.slice(0, -1);
	return [formattedPath, "route"];
}
function getNumberOfUrlSegments(url) {
	return url.split(/\\?\//).filter((s) => s.length > 0 && s !== ",").length;
}
function prefixWithSlash(path) {
	return path[0] === "/" ? path : `/${path}`;
}
function rebuildRoutePathFromAllRoutes(allRoutes, location) {
	const matchedRoutes = _matchRoutes$1(allRoutes, location);
	if (!matchedRoutes || matchedRoutes.length === 0) return "";
	for (const match of matchedRoutes) if (match.route.path && match.route.path !== "*") {
		const path = pickPath(match);
		const strippedPath = stripBasenameFromPathname(location.pathname, prefixWithSlash(match.pathnameBase));
		if (location.pathname === strippedPath) return trimSlash(strippedPath);
		return trimSlash(trimSlash(path || "") + prefixWithSlash(rebuildRoutePathFromAllRoutes(allRoutes.filter((route) => route !== match.route), { pathname: strippedPath })));
	}
	return "";
}
function reconstructNameFromDescendantParent(location, allRoutes, currentName) {
	const descendantParents = allRoutes.filter(routeIsDescendant);
	if (!descendantParents.length) return;
	const matchedParents = _matchRoutes$1(descendantParents, location);
	const parentMatch = matchedParents?.[matchedParents.length - 1];
	if (!parentMatch || !pickSplat(parentMatch)) return;
	const parentTemplate = trimSlash(trimWildcard(parentMatch.route.path || ""));
	if (!parentTemplate) return;
	const expectedPrefix = prefixWithSlash(parentTemplate);
	const firstElement = parentTemplate.split("/")[0];
	const hasDynamicLead = firstElement?.startsWith(":") && currentName?.split("/").includes(firstElement);
	if (currentName === expectedPrefix || currentName?.startsWith(`${expectedPrefix}/`) || hasDynamicLead) return;
	const remainingPathname = stripBasenameFromPathname(location.pathname, prefixWithSlash(parentMatch.pathnameBase)) || "/";
	const remainingName = rebuildRoutePathFromAllRoutes(allRoutes.filter((route) => route !== parentMatch.route), { pathname: remainingPathname });
	return remainingName ? prefixWithSlash(`${parentTemplate}${prefixWithSlash(remainingName)}`) : void 0;
}
function locationIsInsideDescendantRoute(location, routes) {
	const matchedRoutes = _matchRoutes$1(routes, location);
	if (matchedRoutes) {
		for (const match of matchedRoutes) if (routeIsDescendant(match.route) && pickSplat(match)) return true;
	}
	return false;
}
function getFallbackTransactionName(location, basename) {
	return _stripBasename ? stripBasenameFromPathname(location.pathname, basename) : location.pathname || "";
}
function getNormalizedName(routes, location, branches, basename = "") {
	if (!routes || routes.length === 0) return [_stripBasename ? stripBasenameFromPathname(location.pathname, basename) : location.pathname, "url"];
	if (!branches) return [getFallbackTransactionName(location, basename), "url"];
	let pathBuilder = "";
	for (const branch of branches) {
		const route = branch.route;
		if (!route) continue;
		if (route.index) return sendIndexPath(pathBuilder, branch.pathname, basename);
		const path = route.path;
		if (!path || pathIsWildcardAndHasChildren(path, branch)) continue;
		const newPath = path[0] === "/" || pathBuilder[pathBuilder.length - 1] === "/" ? path : `/${path}`;
		pathBuilder = trimSlash(pathBuilder) + prefixWithSlash(newPath);
		if (trimSlash(location.pathname) !== trimSlash(basename + branch.pathname)) continue;
		if (getNumberOfUrlSegments(pathBuilder) !== getNumberOfUrlSegments(branch.pathname) && !pathEndsWithWildcard(pathBuilder)) return [(_stripBasename ? "" : basename) + newPath, "route"];
		if (pathIsWildcardAndHasChildren(pathBuilder, branch)) pathBuilder = pathBuilder.slice(0, -1);
		return [(_stripBasename ? "" : basename) + pathBuilder, "route"];
	}
	return [getFallbackTransactionName(location, basename), "url"];
}
function resolveRouteNameAndSource(location, routes, allRoutes, branches, basename = "", lazyRouteManifest, enableAsyncRouteHandlers) {
	if (enableAsyncRouteHandlers && lazyRouteManifest && lazyRouteManifest.length > 0) {
		const manifestMatch = matchRouteManifest(location.pathname, lazyRouteManifest, basename);
		if (manifestMatch) return [(_stripBasename ? "" : basename) + manifestMatch, "route"];
	}
	let name;
	let source = "url";
	const isInDescendantRoute = locationIsInsideDescendantRoute(location, allRoutes);
	if (isInDescendantRoute) {
		name = prefixWithSlash(rebuildRoutePathFromAllRoutes(allRoutes, location));
		source = "route";
	}
	if (!isInDescendantRoute || !name) [name, source] = getNormalizedName(routes, location, branches, basename);
	const anchoredName = reconstructNameFromDescendantParent(location, allRoutes, name);
	if (anchoredName) return [anchoredName, "route"];
	return [name || location.pathname, source];
}
function getActiveRootSpan() {
	const span = getActiveSpan();
	const rootSpan = span ? getRootSpan(span) : void 0;
	if (!rootSpan) return;
	const op = spanToJSON(rootSpan).op;
	return op === "navigation" || op === "pageload" ? rootSpan : void 0;
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouter-compat-utils/lazy-routes.js
function captureCurrentLocation() {
	const navContext = getNavigationContext();
	if (navContext) {
		if (navContext.targetPath) return {
			pathname: navContext.targetPath,
			search: "",
			hash: "",
			state: null,
			key: "default"
		};
		return null;
	}
	if (typeof WINDOW$1 !== "undefined") try {
		const windowLocation = WINDOW$1.location;
		if (windowLocation) return {
			pathname: windowLocation.pathname,
			search: windowLocation.search || "",
			hash: windowLocation.hash || "",
			state: null,
			key: "default"
		};
	} catch {
		DEBUG_BUILD && debug$1.warn("[React Router] Could not access window.location");
	}
	return null;
}
function captureActiveSpan() {
	const navContext = getNavigationContext();
	if (navContext) return navContext.span;
	return getActiveRootSpan();
}
function createAsyncHandlerProxy(originalFunction, route, handlerKey, processResolvedRoutes) {
	const proxy = new Proxy(originalFunction, { apply(target, thisArg, argArray) {
		const locationAtInvocation = captureCurrentLocation();
		const spanAtInvocation = captureActiveSpan();
		const result = target.apply(thisArg, argArray);
		handleAsyncHandlerResult(result, route, handlerKey, processResolvedRoutes, locationAtInvocation, spanAtInvocation);
		return result;
	} });
	addNonEnumerableProperty(proxy, "__sentry_proxied__", true);
	return proxy;
}
function handleAsyncHandlerResult(result, route, handlerKey, processResolvedRoutes, currentLocation, capturedSpan) {
	if (isThenable(result)) result.then((resolvedRoutes) => {
		if (Array.isArray(resolvedRoutes)) processResolvedRoutes(resolvedRoutes, route, currentLocation ?? void 0, capturedSpan);
	}).catch((e) => {
		DEBUG_BUILD && debug$1.warn(`Error resolving async handler '${handlerKey}' for route`, route, e);
	});
	else if (Array.isArray(result)) processResolvedRoutes(result, route, currentLocation ?? void 0, capturedSpan);
}
function checkRouteForAsyncHandler(route, processResolvedRoutes) {
	if (route.handle && typeof route.handle === "object") for (const key of Object.keys(route.handle)) {
		const maybeFn = route.handle[key];
		if (typeof maybeFn === "function" && !maybeFn.__sentry_proxied__) route.handle[key] = createAsyncHandlerProxy(maybeFn, route, key, processResolvedRoutes);
	}
	if (Array.isArray(route.children)) for (const child of route.children) checkRouteForAsyncHandler(child, processResolvedRoutes);
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouter-compat-utils/instrumentation.js
var _useEffect;
var _useLocation;
var _useNavigationType;
var _createRoutesFromChildren;
var _matchRoutes;
var _enableAsyncRouteHandlers = false;
var _lazyRouteTimeout = 3e3;
var _lazyRouteManifest;
var _basename = "";
var CLIENTS_WITH_INSTRUMENT_NAVIGATION = /* @__PURE__ */ new WeakSet();
var useIsomorphicLayoutEffect = WINDOW$1?.document ? import_react.useLayoutEffect : import_react.useEffect;
var activeNavigationSpans = /* @__PURE__ */ new WeakMap();
var allRoutes = /* @__PURE__ */ new Set();
var pendingLazyRouteLoads = /* @__PURE__ */ new WeakMap();
var deferredLazyRouteResolvers = /* @__PURE__ */ new WeakMap();
function scheduleCallback(callback) {
	if (WINDOW$1?.requestAnimationFrame) return WINDOW$1.requestAnimationFrame(callback);
	return setTimeout(callback, 0);
}
function cancelScheduledCallback(id) {
	if (WINDOW$1?.cancelAnimationFrame) WINDOW$1.cancelAnimationFrame(id);
	else clearTimeout(id);
}
function computeLocationKey(location) {
	return `${location.pathname}${location.search || ""}${location.hash || ""}`;
}
function isParameterizedRoute(routeName) {
	return routeName.includes(":") || routeName.includes("*");
}
function shouldSkipNavigation(trackedNav, locationKey, proposedName, spanHasEnded) {
	if (!trackedNav) return {
		skip: false,
		shouldUpdate: false
	};
	if (trackedNav.locationKey === locationKey && (trackedNav.isPlaceholder || !spanHasEnded)) {
		const currentHasWildcard = !!trackedNav.routeName && transactionNameHasWildcard(trackedNav.routeName);
		const proposedHasWildcard = transactionNameHasWildcard(proposedName);
		const currentIsParameterized = !!trackedNav.routeName && isParameterizedRoute(trackedNav.routeName);
		const proposedIsParameterized = isParameterizedRoute(proposedName);
		const isWildcardUpgrade = currentHasWildcard && !proposedHasWildcard;
		const isRawToParameterized = !currentIsParameterized && proposedIsParameterized;
		const isMoreSpecific = proposedName !== trackedNav.routeName && proposedName.length > (trackedNav.routeName?.length || 0) && !proposedHasWildcard;
		return {
			skip: true,
			shouldUpdate: !!(trackedNav.routeName && (isWildcardUpgrade || isRawToParameterized || isMoreSpecific))
		};
	}
	return {
		skip: false,
		shouldUpdate: false
	};
}
function addResolvedRoutesToParent(resolvedRoutes, parentRoute) {
	const existingChildren = parentRoute.children || [];
	const newRoutes = resolvedRoutes.filter((newRoute) => !existingChildren.some((existing) => existing === newRoute || newRoute.path && existing.path === newRoute.path || newRoute.id && existing.id === newRoute.id));
	if (newRoutes.length > 0) parentRoute.children = [...existingChildren, ...newRoutes];
}
function trackLazyRouteLoad(span, promise) {
	let promises = pendingLazyRouteLoads.get(span);
	if (!promises) {
		promises = /* @__PURE__ */ new Set();
		pendingLazyRouteLoads.set(span, promises);
	}
	promises.add(promise);
	promise.finally(() => {
		const currentPromises = pendingLazyRouteLoads.get(span);
		if (currentPromises) currentPromises.delete(promise);
	});
}
function createDeferredLazyRoutePromise(span) {
	trackLazyRouteLoad(span, new Promise((resolve) => {
		deferredLazyRouteResolvers.set(span, resolve);
	}));
}
function resolveDeferredLazyRoutePromise(span) {
	const resolver = deferredLazyRouteResolvers.get(span);
	if (resolver) {
		resolver();
		deferredLazyRouteResolvers.delete(span);
		if (span.__sentry_may_have_lazy_routes__) span.__sentry_may_have_lazy_routes__ = false;
	}
}
function processResolvedRoutes(resolvedRoutes, parentRoute, currentLocation = null, capturedSpan) {
	resolvedRoutes.forEach((child) => {
		allRoutes.add(child);
		if (_enableAsyncRouteHandlers) checkRouteForAsyncHandler(child, processResolvedRoutes);
	});
	if (parentRoute) addResolvedRoutesToParent(resolvedRoutes, parentRoute);
	const targetSpan = capturedSpan ?? getActiveRootSpan();
	if (targetSpan) {
		const spanJson = spanToJSON(targetSpan);
		if (spanJson.timestamp) {
			DEBUG_BUILD && debug$1.warn("[React Router] Lazy handler resolved after span ended - skipping update");
			return;
		}
		const spanOp = spanJson.op;
		let location = currentLocation;
		if (!location && !capturedSpan) {
			if (typeof WINDOW$1 !== "undefined") {
				const globalLocation = WINDOW$1.location;
				if (globalLocation?.pathname) location = { pathname: globalLocation.pathname };
			}
		}
		if (location) {
			if (spanOp === "pageload") updatePageloadTransaction({
				activeRootSpan: targetSpan,
				location: { pathname: location.pathname },
				routes: Array.from(allRoutes),
				allRoutes: Array.from(allRoutes)
			});
			else if (spanOp === "navigation") updateNavigationSpan(targetSpan, location, Array.from(allRoutes), false, _matchRoutes);
		}
	}
}
function updateNavigationSpan(activeRootSpan, location, allRoutes2, forceUpdate = false, matchRoutes) {
	const spanJson = spanToJSON(activeRootSpan);
	const currentName = spanJson.description;
	const hasBeenNamed = activeRootSpan?.__sentry_navigation_name_set__;
	const currentNameHasWildcard = currentName && transactionNameHasWildcard(currentName);
	if ((!hasBeenNamed || forceUpdate || currentNameHasWildcard) && !spanJson.timestamp) {
		const [name, source] = resolveRouteNameAndSource(location, allRoutes2, allRoutes2, matchRoutes(allRoutes2, location) || [], _basename, _lazyRouteManifest, _enableAsyncRouteHandlers);
		const currentSource = spanJson.data?.[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		if (name && (!currentName || !hasBeenNamed && (currentSource !== "route" || source === "route") || currentSource !== "route" && source === "route" || currentSource === "route" && source === "route" && currentNameHasWildcard)) {
			activeRootSpan.updateName(name);
			activeRootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, source);
			if (source === "route") activeRootSpan.setAttribute(ju, name);
			if (!transactionNameHasWildcard(name) && source === "route") addNonEnumerableProperty(activeRootSpan, "__sentry_navigation_name_set__", true);
		}
	}
}
function setupRouterSubscription(router, routes, version, basename, activeRootSpan) {
	let isInitialPageloadComplete = false;
	let hasSeenPageloadSpan = !!activeRootSpan && spanToJSON(activeRootSpan).op === "pageload";
	let hasSeenPopAfterPageload = false;
	let scheduledNavigationHandler = null;
	let lastHandledPathname = null;
	router.subscribe((state) => {
		if (!isInitialPageloadComplete) {
			const currentRootSpan = getActiveRootSpan();
			if (currentRootSpan && spanToJSON(currentRootSpan).op === "pageload") hasSeenPageloadSpan = true;
			else if (hasSeenPageloadSpan) if (state.historyAction === "POP" && !hasSeenPopAfterPageload) hasSeenPopAfterPageload = true;
			else isInitialPageloadComplete = true;
		}
		if (state.historyAction === "PUSH" || state.historyAction === "POP" && isInitialPageloadComplete) {
			const currentLocationKey = computeLocationKey(state.location);
			const navigationHandler = () => {
				if (lastHandledPathname === currentLocationKey) return;
				lastHandledPathname = currentLocationKey;
				scheduledNavigationHandler = null;
				handleNavigation({
					location: state.location,
					routes,
					navigationType: state.historyAction,
					version,
					basename,
					allRoutes: Array.from(allRoutes)
				});
			};
			if (state.navigation.state !== "idle") {
				if (lastHandledPathname !== currentLocationKey) lastHandledPathname = null;
				if (scheduledNavigationHandler !== null) cancelScheduledCallback(scheduledNavigationHandler);
				scheduledNavigationHandler = scheduleCallback(navigationHandler);
			} else {
				if (scheduledNavigationHandler !== null) {
					cancelScheduledCallback(scheduledNavigationHandler);
					scheduledNavigationHandler = null;
				}
				navigationHandler();
			}
		}
	});
}
function createV6CompatibleWrapCreateBrowserRouter(createRouterFunction, version) {
	if (!_useEffect || !_useLocation || !_useNavigationType || !_matchRoutes) {
		DEBUG_BUILD && debug$1.warn(`reactRouter${version ? `V${version}` : ""}Instrumentation was unable to wrap the \`createRouter\` function because of one or more missing parameters.`);
		return createRouterFunction;
	}
	return function(routes, opts) {
		addRoutesToAllRoutes(routes);
		if (_enableAsyncRouteHandlers) for (const route of routes) checkRouteForAsyncHandler(route, processResolvedRoutes);
		const activeRootSpan = getActiveRootSpan();
		if (opts && "patchRoutesOnNavigation" in opts && typeof opts.patchRoutesOnNavigation === "function" && activeRootSpan) {
			addNonEnumerableProperty(activeRootSpan, "__sentry_may_have_lazy_routes__", true);
			createDeferredLazyRoutePromise(activeRootSpan);
		}
		const router = createRouterFunction(routes, wrapPatchRoutesOnNavigation(opts, false, activeRootSpan));
		const basename = opts?.basename;
		if (router.state.historyAction === "POP" && activeRootSpan) updatePageloadTransaction({
			activeRootSpan,
			location: router.state.location,
			routes,
			basename,
			allRoutes: Array.from(allRoutes)
		});
		_basename = basename || "";
		setupRouterSubscription(router, routes, version, basename, activeRootSpan);
		return router;
	};
}
function createV6CompatibleWrapCreateMemoryRouter(createRouterFunction, version) {
	if (!_useEffect || !_useLocation || !_useNavigationType || !_matchRoutes) {
		DEBUG_BUILD && debug$1.warn(`reactRouter${version ? `V${version}` : ""}Instrumentation was unable to wrap the \`createMemoryRouter\` function because of one or more missing parameters.`);
		return createRouterFunction;
	}
	return function(routes, opts) {
		addRoutesToAllRoutes(routes);
		if (_enableAsyncRouteHandlers) for (const route of routes) checkRouteForAsyncHandler(route, processResolvedRoutes);
		const memoryActiveRootSpanEarly = getActiveRootSpan();
		if (opts && "patchRoutesOnNavigation" in opts && typeof opts.patchRoutesOnNavigation === "function" && memoryActiveRootSpanEarly) {
			addNonEnumerableProperty(memoryActiveRootSpanEarly, "__sentry_may_have_lazy_routes__", true);
			createDeferredLazyRoutePromise(memoryActiveRootSpanEarly);
		}
		const router = createRouterFunction(routes, wrapPatchRoutesOnNavigation(opts, true, memoryActiveRootSpanEarly));
		const basename = opts?.basename;
		let initialEntry = void 0;
		const initialEntries = opts?.initialEntries;
		const initialIndex = opts?.initialIndex;
		const hasOnlyOneInitialEntry = initialEntries?.length === 1;
		const hasIndexedEntry = initialIndex !== void 0 && initialEntries?.[initialIndex];
		initialEntry = hasOnlyOneInitialEntry ? initialEntries[0] : hasIndexedEntry ? initialEntries[initialIndex] : void 0;
		const location = initialEntry ? typeof initialEntry === "string" ? { pathname: initialEntry } : initialEntry : router.state.location;
		const memoryActiveRootSpan = getActiveRootSpan();
		if (router.state.historyAction === "POP" && memoryActiveRootSpan) updatePageloadTransaction({
			activeRootSpan: memoryActiveRootSpan,
			location,
			routes,
			basename,
			allRoutes: Array.from(allRoutes)
		});
		_basename = basename || "";
		setupRouterSubscription(router, routes, version, basename, memoryActiveRootSpan);
		return router;
	};
}
function createReactRouterV6CompatibleTracingIntegration(options, version) {
	const integration = browserTracingIntegration({
		...options,
		instrumentPageLoad: false,
		instrumentNavigation: false
	});
	const { useEffect, useLocation, useNavigationType, createRoutesFromChildren, matchRoutes, stripBasename, enableAsyncRouteHandlers = false, instrumentPageLoad = true, instrumentNavigation = true, lazyRouteTimeout, lazyRouteManifest } = options;
	return {
		...integration,
		setup(client) {
			integration.setup(client);
			const finalTimeout = options.finalTimeout ?? 3e4;
			const defaultMaxWait = (options.idleTimeout ?? 1e3) * 3;
			const configuredMaxWait = lazyRouteTimeout ?? defaultMaxWait;
			if (configuredMaxWait === Infinity) {
				_lazyRouteTimeout = finalTimeout;
				DEBUG_BUILD && debug$1.log("[React Router] lazyRouteTimeout set to Infinity, capping at finalTimeout:", finalTimeout, "ms to prevent indefinite hangs");
			} else if (Number.isNaN(configuredMaxWait)) {
				DEBUG_BUILD && debug$1.warn("[React Router] lazyRouteTimeout must be a number, falling back to default:", defaultMaxWait);
				_lazyRouteTimeout = defaultMaxWait;
			} else if (configuredMaxWait < 0) {
				DEBUG_BUILD && debug$1.warn("[React Router] lazyRouteTimeout must be non-negative or Infinity, got:", configuredMaxWait, "falling back to:", defaultMaxWait);
				_lazyRouteTimeout = defaultMaxWait;
			} else _lazyRouteTimeout = configuredMaxWait;
			_useEffect = useEffect;
			_useLocation = useLocation;
			_useNavigationType = useNavigationType;
			_matchRoutes = matchRoutes;
			_createRoutesFromChildren = createRoutesFromChildren;
			_enableAsyncRouteHandlers = enableAsyncRouteHandlers;
			_lazyRouteManifest = lazyRouteManifest;
			initializeRouterUtils(matchRoutes, stripBasename || false);
		},
		afterAllSetup(client) {
			integration.afterAllSetup(client);
			const initPathName = WINDOW$1.location?.pathname;
			if (instrumentPageLoad && initPathName) startBrowserTracingPageLoadSpan(client, {
				name: initPathName,
				attributes: {
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "pageload",
					[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: `auto.pageload.react.reactrouter${version ? `_v${version}` : ""}`
				}
			});
			if (instrumentNavigation) CLIENTS_WITH_INSTRUMENT_NAVIGATION.add(client);
		}
	};
}
function createV6CompatibleWrapUseRoutes(origUseRoutes, version) {
	if (!_useEffect || !_useLocation || !_useNavigationType || !_matchRoutes) {
		DEBUG_BUILD && debug$1.warn("reactRouterV6Instrumentation was unable to wrap `useRoutes` because of one or more missing parameters.");
		return origUseRoutes;
	}
	const SentryRoutes = (props) => {
		const isMountRenderPass = import_react.useRef(true);
		const { routes, locationArg } = props;
		const Routes = origUseRoutes(routes, locationArg);
		const location = _useLocation();
		const navigationType = _useNavigationType();
		const stableLocationParam = typeof locationArg === "string" || locationArg?.pathname ? locationArg : location;
		useIsomorphicLayoutEffect(() => {
			const normalizedLocation = typeof stableLocationParam === "string" ? { pathname: stableLocationParam } : stableLocationParam;
			if (isMountRenderPass.current) {
				addRoutesToAllRoutes(routes);
				updatePageloadTransaction({
					activeRootSpan: getActiveRootSpan(),
					location: normalizedLocation,
					routes,
					allRoutes: Array.from(allRoutes)
				});
				isMountRenderPass.current = false;
			} else handleNavigation({
				location: normalizedLocation,
				routes,
				navigationType,
				version,
				allRoutes: Array.from(allRoutes)
			});
		}, [navigationType, stableLocationParam]);
		return Routes;
	};
	return (routes, locationArg) => {
		return /* @__PURE__ */ import_react.createElement(SentryRoutes, {
			routes,
			locationArg
		});
	};
}
function wrapPatchRoutesOnNavigation(opts, isMemoryRouter = false, capturedSpan) {
	if (!opts || !("patchRoutesOnNavigation" in opts) || typeof opts.patchRoutesOnNavigation !== "function") return opts || {};
	const originalPatchRoutes = opts.patchRoutesOnNavigation;
	return {
		...opts,
		patchRoutesOnNavigation: async (args) => {
			const targetPath = args?.path;
			const activeRootSpan = getActiveRootSpan() ?? capturedSpan;
			if (!isMemoryRouter) {
				const originalPatch = args?.patch;
				const matches = args?.matches;
				if (originalPatch) args.patch = (routeId, children) => {
					addRoutesToAllRoutes(children);
					if (matches && matches.length > 0) {
						const leafRoute = matches[matches.length - 1]?.route;
						if (leafRoute) {
							const matchingRoute = Array.from(allRoutes).find((route) => {
								const idMatches = route.id !== void 0 && route.id === routeId;
								const referenceMatches = route === leafRoute;
								const pathMatches = route.path !== void 0 && leafRoute.path !== void 0 && route.path === leafRoute.path;
								return idMatches || referenceMatches || pathMatches;
							});
							if (matchingRoute) addResolvedRoutesToParent(children, matchingRoute);
						}
					}
					const spanJson = activeRootSpan ? spanToJSON(activeRootSpan) : void 0;
					if (targetPath && activeRootSpan && spanJson && !spanJson.timestamp && spanJson.op === "navigation") updateNavigationSpan(activeRootSpan, {
						pathname: targetPath,
						search: "",
						hash: "",
						state: null,
						key: "default"
					}, Array.from(allRoutes), true, _matchRoutes);
					return originalPatch(routeId, children);
				};
			}
			const lazyLoadPromise = (async () => {
				const contextToken = setNavigationContext(targetPath, activeRootSpan);
				let result;
				try {
					result = await originalPatchRoutes(args);
				} finally {
					clearNavigationContext(contextToken);
					if (activeRootSpan) resolveDeferredLazyRoutePromise(activeRootSpan);
				}
				const spanJson = activeRootSpan ? spanToJSON(activeRootSpan) : void 0;
				if (activeRootSpan && spanJson && !spanJson.timestamp && spanJson.op === "navigation") {
					const pathname = targetPath;
					if (pathname) updateNavigationSpan(activeRootSpan, {
						pathname,
						search: "",
						hash: "",
						state: null,
						key: "default"
					}, Array.from(allRoutes), false, _matchRoutes);
				}
				return result;
			})();
			if (activeRootSpan) trackLazyRouteLoad(activeRootSpan, lazyLoadPromise);
			return lazyLoadPromise;
		}
	};
}
function handleNavigation(opts) {
	const { location, routes, navigationType, version, matches, basename, allRoutes: allRoutes2 } = opts;
	const branches = Array.isArray(matches) ? matches : _matchRoutes(allRoutes2 || routes, location, basename);
	const client = getClient();
	if (!client || !CLIENTS_WITH_INSTRUMENT_NAVIGATION.has(client)) return;
	const activeRootSpan = getActiveRootSpan();
	if (activeRootSpan && spanToJSON(activeRootSpan).op === "pageload" && navigationType === "POP") return;
	if ((navigationType === "PUSH" || navigationType === "POP") && branches) {
		const [name, source] = resolveRouteNameAndSource(location, allRoutes2 || routes, allRoutes2 || routes, branches, basename, _lazyRouteManifest, _enableAsyncRouteHandlers);
		const locationKey = computeLocationKey(location);
		const trackedNav = activeNavigationSpans.get(client);
		const { skip, shouldUpdate } = shouldSkipNavigation(trackedNav, locationKey, name, trackedNav && !trackedNav.isPlaceholder ? !!spanToJSON(trackedNav.span).timestamp : false);
		if (skip) {
			if (shouldUpdate && trackedNav) {
				const oldName = trackedNav.routeName;
				if (trackedNav.isPlaceholder) {
					trackedNav.routeName = name;
					DEBUG_BUILD && debug$1.log(`[Tracing] Updated placeholder navigation name from "${oldName}" to "${name}" (will apply to real span)`);
				} else {
					trackedNav.span.updateName(name);
					trackedNav.span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, source);
					if (source === "route") trackedNav.span.setAttribute(ju, name);
					addNonEnumerableProperty(trackedNav.span, "__sentry_navigation_name_set__", true);
					trackedNav.routeName = name;
					DEBUG_BUILD && debug$1.log(`[Tracing] Updated navigation span name from "${oldName}" to "${name}"`);
				}
			} else DEBUG_BUILD && debug$1.log(`[Tracing] Skipping duplicate navigation for location: ${locationKey}`);
			return;
		}
		const placeholderEntry = {
			span: { end: () => {} },
			routeName: name,
			pathname: location.pathname,
			locationKey,
			isPlaceholder: true
		};
		activeNavigationSpans.set(client, placeholderEntry);
		let navigationSpan;
		try {
			navigationSpan = startBrowserTracingNavigationSpan(client, {
				name: placeholderEntry.routeName,
				attributes: {
					[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
					[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "navigation",
					[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: `auto.navigation.react.reactrouter${version ? `_v${version}` : ""}`,
					...source === "route" && { ["url.template"]: placeholderEntry.routeName }
				}
			});
		} catch (e) {
			activeNavigationSpans.delete(client);
			throw e;
		}
		if (navigationSpan) {
			activeNavigationSpans.set(client, {
				span: navigationSpan,
				routeName: placeholderEntry.routeName,
				pathname: location.pathname,
				locationKey
			});
			patchSpanEnd(navigationSpan, location, routes, basename, "navigation");
		} else activeNavigationSpans.delete(client);
	}
}
function addRoutesToAllRoutes(routes) {
	routes.forEach((route) => {
		getChildRoutesRecursively(route).forEach((r) => {
			allRoutes.add(r);
		});
	});
}
function getChildRoutesRecursively(route, allRoutes2 = /* @__PURE__ */ new Set()) {
	if (!allRoutes2.has(route)) {
		allRoutes2.add(route);
		if (route.children && !route.index) route.children.forEach((child) => {
			getChildRoutesRecursively(child, allRoutes2).forEach((r) => {
				allRoutes2.add(r);
			});
		});
	}
	return allRoutes2;
}
function updatePageloadTransaction({ activeRootSpan, location, routes, matches, basename, allRoutes: allRoutes2 }) {
	const branches = Array.isArray(matches) ? matches : _matchRoutes(allRoutes2 || routes, location, basename);
	if (branches) {
		const [name, source] = resolveRouteNameAndSource(location, allRoutes2 || routes, allRoutes2 || routes, branches, basename, _lazyRouteManifest, _enableAsyncRouteHandlers);
		getCurrentScope().setTransactionName(name || "/");
		if (activeRootSpan) {
			activeRootSpan.updateName(name);
			activeRootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, source);
			if (source === "route") activeRootSpan.setAttribute(ju, name);
			patchSpanEnd(activeRootSpan, location, routes, basename, "pageload");
		}
	} else if (activeRootSpan) patchSpanEnd(activeRootSpan, location, routes, basename, "pageload");
}
function shouldUpdateWildcardSpanName(currentName, currentSource, newName, newSource, allowNoCurrentName = false) {
	if (!newName) return false;
	if (!currentName && allowNoCurrentName) return true;
	if (currentName && transactionNameHasWildcard(currentName) && newSource === "route" && !transactionNameHasWildcard(newName)) return true;
	if (currentSource !== "route" && newSource === "route") return true;
	return false;
}
function tryUpdateSpanNameBeforeEnd(span, spanJson, currentName, location, routes, basename, spanType, allRoutes2) {
	try {
		const currentSource = spanJson.data?.[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		if (currentSource === "route" && currentName && !transactionNameHasWildcard(currentName)) return;
		const currentAllRoutes = Array.from(allRoutes2);
		const routesToUse = currentAllRoutes.length > 0 ? currentAllRoutes : routes;
		const branches = _matchRoutes(routesToUse, location, basename);
		if (!branches) return;
		const [name, source] = resolveRouteNameAndSource(location, routesToUse, routesToUse, branches, basename, _lazyRouteManifest, _enableAsyncRouteHandlers);
		const isImprovement = shouldUpdateWildcardSpanName(currentName, currentSource, name, source, true);
		const spanNotEnded = spanType === "pageload" || !spanJson.timestamp;
		if (isImprovement && spanNotEnded) {
			span.updateName(name);
			span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, source);
			if (source === "route") span.setAttribute(ju, name);
		}
	} catch (error) {
		DEBUG_BUILD && debug$1.warn(`Error updating span details before ending: ${error}`);
	}
}
function patchSpanEnd(span, location, routes, basename, spanType) {
	const patchedPropertyName = `__sentry_${spanType}_end_patched__`;
	if (span?.[patchedPropertyName] || !span.end) return;
	const originalEnd = span.end.bind(span);
	let endCalled = false;
	span.end = function patchedEnd(...args) {
		if (endCalled) return;
		endCalled = true;
		const endTimestamp = args.length > 0 ? args[0] : Date.now() / 1e3;
		const spanJson = spanToJSON(span);
		const currentName = spanJson.description;
		const currentSource = spanJson.data?.[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		const cleanupNavigationSpan = () => {
			const client = getClient();
			if (client && spanType === "navigation") {
				const trackedNav = activeNavigationSpans.get(client);
				if (trackedNav && trackedNav.span === span) activeNavigationSpans.delete(client);
			}
		};
		const pendingPromises = pendingLazyRouteLoads.get(span);
		const mayHaveLazyRoutes = span.__sentry_may_have_lazy_routes__;
		if ((pendingPromises && pendingPromises.size > 0 || mayHaveLazyRoutes) && currentName && (transactionNameHasWildcard(currentName) || currentSource !== "route")) {
			if (_lazyRouteTimeout === 0) {
				tryUpdateSpanNameBeforeEnd(span, spanJson, currentName, location, routes, basename, spanType, allRoutes);
				cleanupNavigationSpan();
				originalEnd(endTimestamp);
				return;
			}
			const timeoutPromise = new Promise((r) => setTimeout(r, _lazyRouteTimeout));
			let waitPromise;
			if (pendingPromises && pendingPromises.size > 0) {
				const allSettled = Promise.allSettled(pendingPromises).then(() => {});
				waitPromise = _lazyRouteTimeout === Infinity ? allSettled : Promise.race([allSettled, timeoutPromise]);
			} else waitPromise = timeoutPromise;
			waitPromise.then(() => {
				const updatedSpanJson = spanToJSON(span);
				tryUpdateSpanNameBeforeEnd(span, updatedSpanJson, updatedSpanJson.description, location, routes, basename, spanType, allRoutes);
				cleanupNavigationSpan();
				originalEnd(endTimestamp);
			}).catch(() => {
				cleanupNavigationSpan();
				originalEnd(endTimestamp);
			});
			return;
		}
		tryUpdateSpanNameBeforeEnd(span, spanJson, currentName, location, routes, basename, spanType, allRoutes);
		cleanupNavigationSpan();
		originalEnd(endTimestamp);
	};
	addNonEnumerableProperty(span, patchedPropertyName, true);
}
function createV6CompatibleWithSentryReactRouterRouting(Routes, version) {
	if (!_useEffect || !_useLocation || !_useNavigationType || !_createRoutesFromChildren || !_matchRoutes) {
		DEBUG_BUILD && debug$1.warn(`reactRouterV6Instrumentation was unable to wrap Routes because of one or more missing parameters.
      useEffect: ${_useEffect}. useLocation: ${_useLocation}. useNavigationType: ${_useNavigationType}.
      createRoutesFromChildren: ${_createRoutesFromChildren}. matchRoutes: ${_matchRoutes}.`);
		return Routes;
	}
	const SentryRoutes = (props) => {
		const isMountRenderPass = import_react.useRef(true);
		const location = _useLocation();
		const navigationType = _useNavigationType();
		useIsomorphicLayoutEffect(() => {
			const routes = _createRoutesFromChildren(props.children);
			if (isMountRenderPass.current) {
				addRoutesToAllRoutes(routes);
				updatePageloadTransaction({
					activeRootSpan: getActiveRootSpan(),
					location,
					routes,
					allRoutes: Array.from(allRoutes)
				});
				isMountRenderPass.current = false;
			} else handleNavigation({
				location,
				routes,
				navigationType,
				version,
				allRoutes: Array.from(allRoutes)
			});
		}, [location, navigationType]);
		return /* @__PURE__ */ import_react.createElement(Routes, { ...props });
	};
	hoistNonReactStatics(SentryRoutes, Routes);
	return SentryRoutes;
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouterv6.js
function reactRouterV6BrowserTracingIntegration(options) {
	return createReactRouterV6CompatibleTracingIntegration(options, "6");
}
function wrapUseRoutesV6(origUseRoutes) {
	return createV6CompatibleWrapUseRoutes(origUseRoutes, "6");
}
function wrapCreateBrowserRouterV6(createRouterFunction) {
	return createV6CompatibleWrapCreateBrowserRouter(createRouterFunction, "6");
}
function wrapCreateMemoryRouterV6(createMemoryRouterFunction) {
	return createV6CompatibleWrapCreateMemoryRouter(createMemoryRouterFunction, "6");
}
function withSentryReactRouterV6Routing(routes) {
	return createV6CompatibleWithSentryReactRouterRouting(routes, "6");
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouterv7.js
function reactRouterV7BrowserTracingIntegration(options) {
	return createReactRouterV6CompatibleTracingIntegration(options, "7");
}
function withSentryReactRouterV7Routing(routes) {
	return createV6CompatibleWithSentryReactRouterRouting(routes, "7");
}
function wrapCreateBrowserRouterV7(createRouterFunction) {
	return createV6CompatibleWrapCreateBrowserRouter(createRouterFunction, "7");
}
function wrapCreateMemoryRouterV7(createMemoryRouterFunction) {
	return createV6CompatibleWrapCreateMemoryRouter(createMemoryRouterFunction, "7");
}
function wrapUseRoutesV7(origUseRoutes) {
	return createV6CompatibleWrapUseRoutes(origUseRoutes, "7");
}
//#endregion
//#region node_modules/@sentry/react/build/esm/reactrouter.compat.js
function reactRouterBrowserTracingIntegration(options) {
	return createReactRouterV6CompatibleTracingIntegration(options, "");
}
function wrapReactRouterRouting(routes) {
	return createV6CompatibleWithSentryReactRouterRouting(routes, "");
}
function wrapCreateBrowserRouter(createRouterFunction) {
	return createV6CompatibleWrapCreateBrowserRouter(createRouterFunction, "");
}
function wrapCreateMemoryRouter(createMemoryRouterFunction) {
	return createV6CompatibleWrapCreateMemoryRouter(createMemoryRouterFunction, "");
}
function wrapUseRoutes(origUseRoutes) {
	return createV6CompatibleWrapUseRoutes(origUseRoutes, "");
}
//#endregion
//#region node_modules/@sentry/react/build/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({
	BrowserClient: () => BrowserClient,
	ErrorBoundary: () => ErrorBoundary,
	MULTIPLEXED_TRANSPORT_EXTRA_KEY: () => MULTIPLEXED_TRANSPORT_EXTRA_KEY,
	OpenFeatureIntegrationHook: () => OpenFeatureIntegrationHook,
	Profiler: () => Profiler,
	SDK_VERSION: () => SDK_VERSION,
	SEMANTIC_ATTRIBUTE_SENTRY_OP: () => SEMANTIC_ATTRIBUTE_SENTRY_OP,
	SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN: () => SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
	SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE: () => SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE,
	SEMANTIC_ATTRIBUTE_SENTRY_SOURCE: () => SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
	Scope: () => Scope,
	WINDOW: () => WINDOW$1,
	addBreadcrumb: () => addBreadcrumb,
	addEventProcessor: () => addEventProcessor,
	addIntegration: () => addIntegration,
	bindScopeToEmitter: () => bindScopeToEmitter,
	breadcrumbsIntegration: () => breadcrumbsIntegration,
	browserApiErrorsIntegration: () => browserApiErrorsIntegration,
	browserProfilingIntegration: () => browserProfilingIntegration,
	browserSessionIntegration: () => browserSessionIntegration,
	browserTracingIntegration: () => browserTracingIntegration,
	buildLaunchDarklyFlagUsedHandler: () => buildLaunchDarklyFlagUsedHandler,
	captureConsoleIntegration: () => captureConsoleIntegration,
	captureEvent: () => captureEvent,
	captureException: () => captureException,
	captureFeedback: () => captureFeedback,
	captureMessage: () => captureMessage,
	captureReactException: () => captureReactException,
	captureSession: () => captureSession,
	chromeStackLineParser: () => chromeStackLineParser,
	close: () => close,
	consoleLoggingIntegration: () => consoleLoggingIntegration,
	contextLinesIntegration: () => contextLinesIntegration,
	continueTrace: () => continueTrace,
	createConsolaReporter: () => createConsolaReporter,
	createLangChainCallbackHandler: () => createLangChainCallbackHandler,
	createReduxEnhancer: () => createReduxEnhancer,
	createTransport: () => createTransport,
	createUserFeedbackEnvelope: () => createUserFeedbackEnvelope,
	cultureContextIntegration: () => cultureContextIntegration,
	dedupeIntegration: () => dedupeIntegration,
	defaultRequestInstrumentationOptions: () => defaultRequestInstrumentationOptions,
	defaultStackLineParsers: () => defaultStackLineParsers,
	defaultStackParser: () => defaultStackParser,
	diagnoseSdkConnectivity: () => diagnoseSdkConnectivity,
	elementTimingIntegration: () => elementTimingIntegration,
	endSession: () => endSession,
	eventFiltersIntegration: () => eventFiltersIntegration,
	eventFromException: () => eventFromException,
	eventFromMessage: () => eventFromMessage,
	exceptionFromError: () => exceptionFromError,
	extraErrorDataIntegration: () => extraErrorDataIntegration,
	featureFlagsIntegration: () => featureFlagsIntegration,
	feedbackAsyncIntegration: () => feedbackAsyncIntegration,
	feedbackIntegration: () => feedbackSyncIntegration,
	feedbackSyncIntegration: () => feedbackSyncIntegration,
	fetchStreamPerformanceIntegration: () => fetchStreamPerformanceIntegration,
	flush: () => flush,
	forceLoad: () => forceLoad,
	functionToStringIntegration: () => functionToStringIntegration,
	geckoStackLineParser: () => geckoStackLineParser,
	getAbsoluteUrl: () => getAbsoluteUrl,
	getActiveSpan: () => getActiveSpan,
	getClient: () => getClient,
	getCurrentScope: () => getCurrentScope,
	getDefaultIntegrations: () => getDefaultIntegrations,
	getFeedback: () => getFeedback,
	getGlobalScope: () => getGlobalScope,
	getIsolationScope: () => getIsolationScope,
	getReplay: () => getReplay,
	getRootSpan: () => getRootSpan,
	getSpanDescendants: () => getSpanDescendants,
	getSpanStatusFromHttpCode: () => getSpanStatusFromHttpCode,
	getTraceData: () => getTraceData,
	globalHandlersIntegration: () => globalHandlersIntegration,
	graphqlClientIntegration: () => graphqlClientIntegration,
	growthbookIntegration: () => growthbookIntegration,
	httpClientIntegration: () => httpClientIntegration,
	httpContextIntegration: () => httpContextIntegration,
	inboundFiltersIntegration: () => inboundFiltersIntegration,
	init: () => init,
	instrumentAnthropicAiClient: () => instrumentAnthropicAiClient,
	instrumentCreateReactAgent: () => instrumentCreateReactAgent,
	instrumentGoogleGenAIClient: () => instrumentGoogleGenAIClient,
	instrumentLangChainEmbeddings: () => instrumentLangChainEmbeddings,
	instrumentLangGraph: () => instrumentLangGraph,
	instrumentOpenAiClient: () => instrumentOpenAiClient,
	instrumentOutgoingRequests: () => instrumentOutgoingRequests,
	instrumentSupabaseClient: () => instrumentSupabaseClient,
	isBotUserAgent: () => isBotUserAgent,
	isEnabled: () => isEnabled,
	isInitialized: () => isInitialized,
	lastEventId: () => lastEventId,
	launchDarklyIntegration: () => launchDarklyIntegration,
	lazyLoadIntegration: () => lazyLoadIntegration,
	linkedErrorsIntegration: () => linkedErrorsIntegration,
	logger: () => public_api_exports,
	makeBrowserOfflineTransport: () => makeBrowserOfflineTransport,
	makeFetchTransport: () => makeFetchTransport,
	makeMultiplexedTransport: () => makeMultiplexedTransport,
	metrics: () => public_api_exports$1,
	moduleMetadataIntegration: () => moduleMetadataIntegration,
	normalizeStringifyValue: () => normalizeStringifyValue$1,
	onLoad: () => onLoad,
	openFeatureIntegration: () => openFeatureIntegration,
	opera10StackLineParser: () => opera10StackLineParser,
	opera11StackLineParser: () => opera11StackLineParser,
	parameterize: () => parameterize,
	reactErrorHandler: () => reactErrorHandler,
	reactRouterBrowserTracingIntegration: () => reactRouterBrowserTracingIntegration,
	reactRouterV3BrowserTracingIntegration: () => reactRouterV3BrowserTracingIntegration,
	reactRouterV4BrowserTracingIntegration: () => reactRouterV4BrowserTracingIntegration,
	reactRouterV5BrowserTracingIntegration: () => reactRouterV5BrowserTracingIntegration,
	reactRouterV6BrowserTracingIntegration: () => reactRouterV6BrowserTracingIntegration,
	reactRouterV7BrowserTracingIntegration: () => reactRouterV7BrowserTracingIntegration,
	registerSpanErrorInstrumentation: () => registerSpanErrorInstrumentation,
	registerWebWorker: () => registerWebWorker,
	replayCanvasIntegration: () => replayCanvasIntegration,
	replayIntegration: () => replayIntegration,
	reportPageLoaded: () => reportPageLoaded,
	reportingObserverIntegration: () => reportingObserverIntegration,
	rewriteFramesIntegration: () => rewriteFramesIntegration,
	sendFeedback: () => sendFeedback,
	setActiveSpanInBrowser: () => setActiveSpanInBrowser,
	setAttribute: () => setAttribute,
	setAttributes: () => setAttributes,
	setContext: () => setContext,
	setConversationId: () => setConversationId,
	setCurrentClient: () => setCurrentClient,
	setExtra: () => setExtra,
	setExtras: () => setExtras,
	setHttpStatus: () => setHttpStatus,
	setMeasurement: () => setMeasurement,
	setTag: () => setTag,
	setTags: () => setTags,
	setUser: () => setUser,
	showReportDialog: () => showReportDialog,
	spanStreamingIntegration: () => spanStreamingIntegration,
	spanToBaggageHeader: () => spanToBaggageHeader,
	spanToJSON: () => spanToJSON,
	spanToTraceHeader: () => spanToTraceHeader,
	spotlightBrowserIntegration: () => spotlightBrowserIntegration,
	startBrowserTracingNavigationSpan: () => startBrowserTracingNavigationSpan,
	startBrowserTracingPageLoadSpan: () => startBrowserTracingPageLoadSpan,
	startInactiveSpan: () => startInactiveSpan,
	startNewTrace: () => startNewTrace,
	startSession: () => startSession,
	startSpan: () => startSpan,
	startSpanManual: () => startSpanManual,
	statsigIntegration: () => statsigIntegration,
	supabaseIntegration: () => supabaseIntegration,
	suppressTracing: () => suppressTracing,
	tanstackRouterBrowserTracingIntegration: () => tanstackRouterBrowserTracingIntegration,
	thirdPartyErrorFilterIntegration: () => thirdPartyErrorFilterIntegration,
	uiProfiler: () => uiProfiler,
	unleashIntegration: () => unleashIntegration,
	updateSpanName: () => updateSpanName,
	useProfiler: () => useProfiler,
	viewHierarchyIntegration: () => viewHierarchyIntegration,
	webVitalsIntegration: () => webVitalsIntegration,
	webWorkerIntegration: () => webWorkerIntegration,
	winjsStackLineParser: () => winjsStackLineParser,
	withActiveSpan: () => withActiveSpan,
	withErrorBoundary: () => withErrorBoundary,
	withIsolationScope: () => withIsolationScope,
	withProfiler: () => withProfiler,
	withScope: () => withScope,
	withSentryReactRouterV6Routing: () => withSentryReactRouterV6Routing,
	withSentryReactRouterV7Routing: () => withSentryReactRouterV7Routing,
	withSentryRouting: () => withSentryRouting,
	withStreamedSpan: () => withStreamedSpan,
	wrapCreateBrowserRouter: () => wrapCreateBrowserRouter,
	wrapCreateBrowserRouterV6: () => wrapCreateBrowserRouterV6,
	wrapCreateBrowserRouterV7: () => wrapCreateBrowserRouterV7,
	wrapCreateMemoryRouter: () => wrapCreateMemoryRouter,
	wrapCreateMemoryRouterV6: () => wrapCreateMemoryRouterV6,
	wrapCreateMemoryRouterV7: () => wrapCreateMemoryRouterV7,
	wrapReactRouterRouting: () => wrapReactRouterRouting,
	wrapUseRoutes: () => wrapUseRoutes,
	wrapUseRoutesV6: () => wrapUseRoutesV6,
	wrapUseRoutesV7: () => wrapUseRoutesV7,
	zodErrorsIntegration: () => zodErrorsIntegration
});
//#endregion
export { esm_exports as t };
