//#region node_modules/@sentry/core/build/esm/debug-build.js
var DEBUG_BUILD$3 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/worldwide.js
var GLOBAL_OBJ = globalThis;
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/version.js
var SDK_VERSION = "10.67.0";
//#endregion
//#region node_modules/@sentry/core/build/esm/carrier.js
function getMainCarrier() {
	getSentryCarrier(GLOBAL_OBJ);
	return GLOBAL_OBJ;
}
function getSentryCarrier(carrier) {
	const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
	__SENTRY__.version = __SENTRY__.version || "10.67.0";
	return __SENTRY__[SDK_VERSION] = __SENTRY__["10.67.0"] || {};
}
function getGlobalSingleton(name, creator, obj = GLOBAL_OBJ) {
	const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
	const carrier = __SENTRY__[SDK_VERSION] = __SENTRY__["10.67.0"] || {};
	return carrier[name] || (carrier[name] = creator());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debug-logger.js
var CONSOLE_LEVELS = [
	"debug",
	"info",
	"warn",
	"error",
	"log",
	"assert",
	"trace"
];
var PREFIX = "Sentry Logger ";
var originalConsoleMethods = {};
function consoleSandbox(callback) {
	if (!("console" in GLOBAL_OBJ)) return callback();
	const console = GLOBAL_OBJ.console;
	const wrappedFuncs = {};
	const wrappedLevels = Object.keys(originalConsoleMethods);
	wrappedLevels.forEach((level) => {
		const originalConsoleMethod = originalConsoleMethods[level];
		wrappedFuncs[level] = console[level];
		console[level] = originalConsoleMethod;
	});
	try {
		return callback();
	} finally {
		wrappedLevels.forEach((level) => {
			console[level] = wrappedFuncs[level];
		});
	}
}
function enable() {
	_getLoggerSettings().enabled = true;
}
function disable() {
	_getLoggerSettings().enabled = false;
}
function isEnabled$1() {
	return _getLoggerSettings().enabled;
}
function log(...args) {
	_maybeLog("log", ...args);
}
function warn(...args) {
	_maybeLog("warn", ...args);
}
function error(...args) {
	_maybeLog("error", ...args);
}
function _maybeLog(level, ...args) {
	if (!DEBUG_BUILD$3) return;
	if (isEnabled$1()) consoleSandbox(() => {
		GLOBAL_OBJ.console[level](`${PREFIX}[${level}]:`, ...args);
	});
}
function _getLoggerSettings() {
	if (!DEBUG_BUILD$3) return { enabled: false };
	return getGlobalSingleton("loggerSettings", () => ({ enabled: false }));
}
var debug = {
	/** Enable logging. */
	enable,
	/** Disable logging. */
	disable,
	/** Check if logging is enabled. */
	isEnabled: isEnabled$1,
	/** Log a message. */
	log,
	/** Log a warning. */
	warn,
	/** Log an error. */
	error
};
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/stacktrace.js
var STACKTRACE_FRAME_LIMIT = 50;
var WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
var STRIP_FRAME_REGEXP = /captureMessage|captureException/;
function createStackParser(...parsers) {
	const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
	return (stack, skipFirstLines = 0, framesToPop = 0) => {
		const frames = [];
		const lines = stack.split("\n");
		for (let i = skipFirstLines; i < lines.length; i++) {
			let line = lines[i];
			if (line.length > 1024) line = line.slice(0, 1024);
			const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
			if (cleanedLine.includes("Error: ")) continue;
			for (const parser of sortedParsers) {
				const frame = parser(cleanedLine);
				if (frame) {
					frames.push(frame);
					break;
				}
			}
			if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) break;
		}
		return stripSentryFramesAndReverse(frames.slice(framesToPop));
	};
}
function stackParserFromStackParserOptions(stackParser) {
	if (Array.isArray(stackParser)) return createStackParser(...stackParser);
	return stackParser;
}
function stripSentryFramesAndReverse(stack) {
	if (!stack.length) return [];
	const localStack = Array.from(stack);
	if (/sentryWrapped/.test(getLastStackFrame(localStack).function || "")) localStack.pop();
	localStack.reverse();
	if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
		localStack.pop();
		if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) localStack.pop();
	}
	return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
		...frame,
		filename: frame.filename || getLastStackFrame(localStack).filename,
		function: frame.function || "?"
	}));
}
function getLastStackFrame(arr) {
	return arr[arr.length - 1] || {};
}
var defaultFunctionName = "<anonymous>";
function getFunctionName(fn) {
	try {
		if (!fn || typeof fn !== "function") return defaultFunctionName;
		return fn.name || defaultFunctionName;
	} catch {
		return defaultFunctionName;
	}
}
function getFramesFromEvent(event) {
	const exception = event.exception;
	if (exception) {
		const frames = [];
		try {
			exception.values.forEach((value) => {
				if (value.stacktrace.frames) frames.push(...value.stacktrace.frames);
			});
			return frames;
		} catch {
			return;
		}
	}
}
function normalizeStackTracePath(path) {
	let filename = path?.startsWith("file://") ? path.slice(7) : path;
	if (filename?.match(/\/[A-Z]:/)) filename = filename.slice(1);
	return filename;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/handlers.js
var handlers$1 = {};
var instrumented$1 = {};
function addHandler$1(type, handler) {
	handlers$1[type] = handlers$1[type] || [];
	handlers$1[type].push(handler);
	return () => {
		const typeHandlers = handlers$1[type];
		if (typeHandlers) {
			const index = typeHandlers.indexOf(handler);
			if (index !== -1) typeHandlers.splice(index, 1);
		}
	};
}
function maybeInstrument(type, instrumentFn) {
	if (!instrumented$1[type]) {
		instrumented$1[type] = true;
		try {
			instrumentFn();
		} catch (e) {
			DEBUG_BUILD$3 && debug.error(`Error while instrumenting ${type}`, e);
		}
	}
}
function triggerHandlers$1(type, data) {
	const typeHandlers = type && handlers$1[type];
	if (!typeHandlers) return;
	for (const handler of typeHandlers) try {
		handler(data);
	} catch (e) {
		DEBUG_BUILD$3 && debug.error(`Error while triggering instrumentation handler.
Type: ${type}
Name: ${getFunctionName(handler)}
Error:`, e);
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/globalError.js
var _oldOnErrorHandler = null;
function addGlobalErrorInstrumentationHandler(handler) {
	const type = "error";
	addHandler$1(type, handler);
	maybeInstrument(type, instrumentError);
}
function instrumentError() {
	_oldOnErrorHandler = GLOBAL_OBJ.onerror;
	GLOBAL_OBJ.onerror = function(msg, url, line, column, error) {
		triggerHandlers$1("error", {
			column,
			error,
			line,
			msg,
			url
		});
		if (_oldOnErrorHandler) return _oldOnErrorHandler.apply(this, arguments);
		return false;
	};
	GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/globalUnhandledRejection.js
var _oldOnUnhandledRejectionHandler = null;
function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
	const type = "unhandledrejection";
	addHandler$1(type, handler);
	maybeInstrument(type, instrumentUnhandledRejection);
}
function instrumentUnhandledRejection() {
	_oldOnUnhandledRejectionHandler = GLOBAL_OBJ.onunhandledrejection;
	GLOBAL_OBJ.onunhandledrejection = function(e) {
		triggerHandlers$1("unhandledrejection", e);
		if (_oldOnUnhandledRejectionHandler) return _oldOnUnhandledRejectionHandler.apply(this, arguments);
		return true;
	};
	GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/is.js
var objectToString = Object.prototype.toString;
function isError(wat) {
	switch (objectToString.call(wat)) {
		case "[object Error]":
		case "[object Exception]":
		case "[object DOMException]":
		case "[object WebAssembly.Exception]": return true;
		default: return isInstanceOf(wat, Error);
	}
}
function isBuiltin(wat, className) {
	return objectToString.call(wat) === `[object ${className}]`;
}
function isErrorEvent$1(wat) {
	return isBuiltin(wat, "ErrorEvent");
}
function isDOMError(wat) {
	return isBuiltin(wat, "DOMError");
}
function isDOMException(wat) {
	return isBuiltin(wat, "DOMException");
}
function isString(wat) {
	return isBuiltin(wat, "String");
}
function isParameterizedString(wat) {
	return typeof wat === "object" && wat !== null && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
}
function isPrimitive(wat) {
	return wat === null || isParameterizedString(wat) || typeof wat !== "object" && typeof wat !== "function";
}
function isPlainObject(wat) {
	return isBuiltin(wat, "Object");
}
function isObjectLike(wat) {
	return typeof wat === "object" && wat !== null;
}
function isEvent(wat) {
	return typeof Event !== "undefined" && isInstanceOf(wat, Event);
}
function isRegExp(wat) {
	return isBuiltin(wat, "RegExp");
}
function isThenable(wat) {
	return Boolean(wat?.then && typeof wat.then === "function");
}
function isInstanceOf(wat, base) {
	try {
		return wat instanceof base;
	} catch {
		return false;
	}
}
function isRequest(request) {
	return typeof Request !== "undefined" && isInstanceOf(request, Request);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/object.js
function fill(source, name, replacementFactory) {
	if (!(name in source)) return;
	const original = source[name];
	if (typeof original !== "function") return;
	const wrapped = replacementFactory(original);
	if (typeof wrapped === "function") markFunctionWrapped(wrapped, original);
	try {
		source[name] = wrapped;
	} catch {
		DEBUG_BUILD$3 && debug.log(`Failed to replace method "${name}" in object`, source);
	}
}
function addNonEnumerableProperty(obj, name, value) {
	try {
		Object.defineProperty(obj, name, {
			value,
			writable: true,
			configurable: true
		});
	} catch {
		DEBUG_BUILD$3 && debug.log(`Failed to add non-enumerable property "${String(name)}" to object`, obj);
	}
}
function markFunctionWrapped(wrapped, original) {
	try {
		wrapped.prototype = original.prototype = original.prototype || {};
		addNonEnumerableProperty(wrapped, "__sentry_original__", original);
	} catch {}
}
function wrapMethod(obj, field, wrapped, enumerable = true) {
	const original = obj[field];
	if (typeof original !== "function") throw new Error(`Cannot wrap method: ${field} is not a function`);
	if (getOriginalFunction(original)) throw new Error(`Attempting to wrap method ${field} multiple times`);
	markFunctionWrapped(wrapped, original);
	Object.defineProperty(obj, field, {
		writable: true,
		configurable: true,
		enumerable,
		value: wrapped
	});
}
function getOriginalFunction(func) {
	return func.__sentry_original__;
}
function convertToPlainObject(value) {
	if (isError(value)) return {
		message: value.message,
		name: value.name,
		stack: value.stack,
		...getOwnProperties(value)
	};
	if (isEvent(value)) {
		const { type, target, currentTarget, detail } = value;
		return {
			type,
			target,
			currentTarget,
			...detail ? { detail } : {},
			...getOwnProperties(value)
		};
	}
	return value;
}
function getOwnProperties(obj) {
	if (isObjectLike(obj)) return Object.fromEntries(Object.entries(obj));
	return {};
}
function extractExceptionKeysForMessage(exception) {
	const keys = Object.keys(convertToPlainObject(exception));
	keys.sort();
	return !keys[0] ? "[object has no keys]" : keys.join(", ");
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/randomSafeContext.js
var RESOLVED_RUNNER;
function withRandomSafeContext(cb) {
	if (RESOLVED_RUNNER !== void 0) return RESOLVED_RUNNER ? RESOLVED_RUNNER(cb) : cb();
	const sym = /* @__PURE__ */ Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__");
	const globalWithSymbol = GLOBAL_OBJ;
	if (sym in globalWithSymbol && typeof globalWithSymbol[sym] === "function") {
		RESOLVED_RUNNER = globalWithSymbol[sym];
		return RESOLVED_RUNNER(cb);
	}
	RESOLVED_RUNNER = null;
	return cb();
}
function safeMathRandom() {
	return withRandomSafeContext(() => Math.random());
}
function safeDateNow() {
	return withRandomSafeContext(() => Date.now());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/normalizationHints.js
var SENTRY_SKIP_NORMALIZATION = /* @__PURE__ */ Symbol.for("sentry.skipNormalization");
var SENTRY_OVERRIDE_NORMALIZATION_DEPTH = /* @__PURE__ */ Symbol.for("sentry.overrideNormalizationDepth");
function setSkipNormalizationHint(obj) {
	addNonEnumerableProperty(obj, SENTRY_SKIP_NORMALIZATION, true);
}
function setNormalizationDepthOverrideHint(obj, depth) {
	addNonEnumerableProperty(obj, SENTRY_OVERRIDE_NORMALIZATION_DEPTH, depth);
}
function hasSkipNormalizationHint(value) {
	return Boolean(value[SENTRY_SKIP_NORMALIZATION]);
}
function getNormalizationDepthOverrideHint(value) {
	const v = value[SENTRY_OVERRIDE_NORMALIZATION_DEPTH];
	return typeof v === "number" ? v : void 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/normalize.js
var stringifier;
function setNormalizeStringifier(newStringifier) {
	stringifier = newStringifier;
}
function normalize(input, depth = 100, maxProperties = Infinity) {
	try {
		return visit("", input, depth, maxProperties);
	} catch (err) {
		return { ERROR: `**non-serializable** (${err})` };
	}
}
function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
	const normalized = normalize(object, depth);
	if (jsonSize(normalized) > maxSize) return normalizeToSize(object, depth - 1, maxSize);
	return normalized;
}
function visit(key, value, depth = Infinity, maxProperties = Infinity, memo = memoBuilder()) {
	const [memoize, unmemoize] = memo;
	if (value == null || ["boolean", "string"].includes(typeof value) || typeof value === "number" && Number.isFinite(value)) return value;
	const stringified = stringifyValue(key, value);
	if (!stringified.startsWith("[object ")) return stringified;
	if (hasSkipNormalizationHint(value)) return value;
	const overrideDepth = getNormalizationDepthOverrideHint(value);
	const remainingDepth = overrideDepth !== void 0 ? overrideDepth : depth;
	if (remainingDepth === 0) return stringified.replace("object ", "");
	if (memoize(value)) return "[Circular ~]";
	const valueWithToJSON = value;
	if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") try {
		return visit("", valueWithToJSON.toJSON(), remainingDepth - 1, maxProperties, memo);
	} catch {}
	const normalized = Array.isArray(value) ? [] : {};
	let numAdded = 0;
	const visitable = convertToPlainObject(value);
	for (const visitKey in visitable) {
		if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) continue;
		if (numAdded >= maxProperties) {
			normalized[visitKey] = "[MaxProperties ~]";
			break;
		}
		const visitValue = visitable[visitKey];
		normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
		numAdded++;
	}
	unmemoize(value);
	return normalized;
}
function stringifyValue(key, value) {
	try {
		if (stringifier) {
			const stringified = stringifier(value);
			if (stringified) return stringified;
		}
		if (typeof global !== "undefined" && value === global) return "[Global]";
		if (typeof value === "number" && !Number.isFinite(value)) return `[${value}]`;
		if (typeof value === "function") return `[Function: ${getFunctionName(value)}]`;
		if (typeof value === "symbol") return `[${String(value)}]`;
		if (typeof value === "bigint") return `[BigInt: ${String(value)}]`;
		return `[object ${getConstructorName$1(value)}]`;
	} catch (err) {
		return `**non-serializable** (${err})`;
	}
}
function getConstructorName$1(value) {
	const prototype = Object.getPrototypeOf(value);
	return prototype?.constructor ? prototype.constructor.name : "null prototype";
}
function utf8Length(value) {
	return ~-encodeURI(value).split(/%..|./).length;
}
function jsonSize(value) {
	return utf8Length(JSON.stringify(value));
}
function memoBuilder() {
	const inner = /* @__PURE__ */ new WeakSet();
	function memoize(obj) {
		if (inner.has(obj)) return true;
		inner.add(obj);
		return false;
	}
	function unmemoize(obj) {
		inner.delete(obj);
	}
	return [memoize, unmemoize];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/string.js
function stringify(value, fallback = "[unserializable]") {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return typeof fallback === "function" ? fallback(value) : fallback;
	}
}
function truncate(str, max = 0) {
	if (typeof str !== "string" || max === 0) return str;
	return str.length <= max ? str : `${str.slice(0, max)}...`;
}
function snipLine(line, colno) {
	let newLine = line;
	const lineLength = newLine.length;
	if (lineLength <= 150) return newLine;
	if (colno > lineLength) colno = lineLength;
	let start = Math.max(colno - 60, 0);
	if (start < 5) start = 0;
	let end = Math.min(start + 140, lineLength);
	if (end > lineLength - 5) end = lineLength;
	if (end === lineLength) start = Math.max(end - 140, 0);
	newLine = newLine.slice(start, end);
	if (start > 0) newLine = `'{snip} ${newLine}`;
	if (end < lineLength) newLine += " {snip}";
	return newLine;
}
function safeJoin(input, delimiter) {
	if (!Array.isArray(input)) return "";
	const output = [];
	for (let i = 0; i < input.length; i++) {
		const value = input[i];
		if (isPrimitive(value)) output.push(String(value));
		else if (value instanceof Error) output.push(value.message ? `${value.name}: ${value.message}` : value.name);
		else output.push(stringifyValue(void 0, value));
	}
	return output.join(delimiter);
}
function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
	if (!isString(value)) return false;
	if (isRegExp(pattern)) return pattern.test(value);
	if (isString(pattern)) return requireExactStringMatch ? value === pattern : value.includes(pattern);
	if (typeof pattern === "function") return pattern(value);
	return false;
}
function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
	for (const pattern of patterns) if (isMatchingPattern(testString, pattern, requireExactStringMatch)) return true;
	return false;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/misc.js
function getCrypto() {
	const gbl = GLOBAL_OBJ;
	return gbl.crypto || gbl.msCrypto;
}
var emptyUuid;
function getRandomByte() {
	return safeMathRandom() * 16;
}
function uuid4(crypto = getCrypto()) {
	try {
		if (crypto?.randomUUID) return withRandomSafeContext(() => crypto.randomUUID()).replace(/-/g, "");
	} catch {}
	if (!emptyUuid) emptyUuid = "10000000100040008000100000000000";
	return emptyUuid.replace(/[018]/g, (c) => (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
}
function getFirstException(event) {
	return event.exception?.values?.[0];
}
function getEventDescription(event) {
	const { message, event_id: eventId } = event;
	if (message) return message;
	const firstException = getFirstException(event);
	if (firstException) {
		if (firstException.type && firstException.value) return `${firstException.type}: ${firstException.value}`;
		return firstException.type || firstException.value || eventId || "<unknown>";
	}
	return eventId || "<unknown>";
}
function addExceptionTypeValue(event, value, type) {
	const exception = event.exception = event.exception || {};
	const values = exception.values = exception.values || [];
	const firstException = values[0] = values[0] || {};
	if (!firstException.value) firstException.value = value || "";
	if (!firstException.type) firstException.type = type || "Error";
}
function addExceptionMechanism(event, newMechanism) {
	const firstException = getFirstException(event);
	if (!firstException) return;
	const defaultMechanism = {
		type: "generic",
		handled: true
	};
	const currentMechanism = firstException.mechanism;
	firstException.mechanism = {
		...defaultMechanism,
		...currentMechanism,
		...newMechanism
	};
	if (newMechanism && "data" in newMechanism) {
		const mergedData = {
			...currentMechanism?.data,
			...newMechanism.data
		};
		firstException.mechanism.data = mergedData;
	}
}
var SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
function _parseInt(input) {
	return parseInt(input || "", 10);
}
function parseSemver(input) {
	const match = input.match(SEMVER_REGEXP) || [];
	const major = _parseInt(match[1]);
	const minor = _parseInt(match[2]);
	const patch = _parseInt(match[3]);
	return {
		buildmetadata: match[5],
		major: isNaN(major) ? void 0 : major,
		minor: isNaN(minor) ? void 0 : minor,
		patch: isNaN(patch) ? void 0 : patch,
		prerelease: match[4]
	};
}
function addContextToFrame(lines, frame, linesOfContext = 5) {
	if (frame.lineno === void 0) return;
	const maxLines = lines.length;
	const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
	frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map((line) => snipLine(line, 0));
	frame.context_line = snipLine(lines[Math.min(maxLines - 1, sourceLine)], frame.colno || 0);
	frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map((line) => snipLine(line, 0));
}
function checkOrSetAlreadyCaught(exception) {
	if (isAlreadyCaptured(exception)) return true;
	try {
		addNonEnumerableProperty(exception, "__sentry_captured__", true);
	} catch {}
	return false;
}
function isAlreadyCaptured(exception) {
	try {
		return exception.__sentry_captured__;
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/time.js
var ONE_SECOND_IN_MS = 1e3;
function dateTimestampInSeconds() {
	return safeDateNow() / ONE_SECOND_IN_MS;
}
function createUnixTimestampInSecondsFunc() {
	const { performance } = GLOBAL_OBJ;
	if (!performance?.now || !performance.timeOrigin) return dateTimestampInSeconds;
	const timeOrigin = performance.timeOrigin;
	return () => {
		return (timeOrigin + withRandomSafeContext(() => performance.now())) / ONE_SECOND_IN_MS;
	};
}
var _cachedTimestampInSeconds;
function timestampInSeconds() {
	return (_cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc()))();
}
var cachedTimeOrigin = null;
function getBrowserTimeOrigin() {
	const { performance } = GLOBAL_OBJ;
	if (!performance?.now) return;
	const threshold = 3e5;
	const performanceNow = withRandomSafeContext(() => performance.now());
	const dateNow = safeDateNow();
	const timeOrigin = performance.timeOrigin;
	if (typeof timeOrigin === "number") {
		if (Math.abs(timeOrigin + performanceNow - dateNow) < threshold) return timeOrigin;
	}
	const navigationStart = performance.timing?.navigationStart;
	if (typeof navigationStart === "number") {
		if (Math.abs(navigationStart + performanceNow - dateNow) < threshold) return navigationStart;
	}
	return dateNow - performanceNow;
}
function browserPerformanceTimeOrigin() {
	if (cachedTimeOrigin === null) cachedTimeOrigin = getBrowserTimeOrigin();
	return cachedTimeOrigin;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/session.js
function makeSession(context) {
	const startingTime = timestampInSeconds();
	const session = {
		sid: uuid4(),
		init: true,
		timestamp: startingTime,
		started: startingTime,
		duration: 0,
		status: "ok",
		errors: 0,
		ignoreDuration: false,
		toJSON: () => sessionToJSON(session)
	};
	if (context) updateSession(session, context);
	return session;
}
function updateSession(session, context = {}) {
	if (context.user) {
		if (!session.ipAddress && context.user.ip_address) session.ipAddress = context.user.ip_address;
		if (!session.did && !context.did) session.did = context.user.id || context.user.email || context.user.username;
	}
	session.timestamp = context.timestamp || timestampInSeconds();
	if (context.abnormal_mechanism) session.abnormal_mechanism = context.abnormal_mechanism;
	if (context.ignoreDuration) session.ignoreDuration = context.ignoreDuration;
	if (context.sid) session.sid = context.sid.length === 32 ? context.sid : uuid4();
	if (context.init !== void 0) session.init = context.init;
	if (!session.did && context.did) session.did = `${context.did}`;
	if (typeof context.started === "number") session.started = context.started;
	if (session.ignoreDuration) session.duration = void 0;
	else if (typeof context.duration === "number") session.duration = context.duration;
	else {
		const duration = session.timestamp - session.started;
		session.duration = duration >= 0 ? duration : 0;
	}
	if (context.release) session.release = context.release;
	if (context.environment) session.environment = context.environment;
	if (!session.ipAddress && context.ipAddress) session.ipAddress = context.ipAddress;
	if (!session.userAgent && context.userAgent) session.userAgent = context.userAgent;
	if (typeof context.errors === "number") session.errors = context.errors;
	if (context.status) session.status = context.status;
}
function closeSession(session, status) {
	let context = {};
	if (status) context = { status };
	else if (session.status === "ok") context = { status: "exited" };
	updateSession(session, context);
}
function sessionToJSON(session) {
	return {
		sid: `${session.sid}`,
		init: session.init,
		started: (/* @__PURE__ */ new Date(session.started * 1e3)).toISOString(),
		timestamp: (/* @__PURE__ */ new Date(session.timestamp * 1e3)).toISOString(),
		status: session.status,
		errors: session.errors,
		did: typeof session.did === "number" || typeof session.did === "string" ? `${session.did}` : void 0,
		duration: session.duration,
		abnormal_mechanism: session.abnormal_mechanism,
		attrs: {
			release: session.release,
			environment: session.environment,
			ip_address: session.ipAddress,
			user_agent: session.userAgent
		}
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/merge.js
function merge(initialObj, mergeObj, levels = 2) {
	if (!mergeObj || typeof mergeObj !== "object" || levels <= 0) return mergeObj;
	if (initialObj && Object.keys(mergeObj).length === 0) return initialObj;
	const output = { ...initialObj };
	for (const key in mergeObj) if (Object.prototype.hasOwnProperty.call(mergeObj, key)) output[key] = merge(output[key], mergeObj[key], levels - 1);
	return output;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/propagationContext.js
function generateTraceId() {
	return uuid4();
}
function generateSpanId() {
	return uuid4().substring(16);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/weakRef.js
function makeWeakRef(value) {
	try {
		const WeakRefImpl = GLOBAL_OBJ.WeakRef;
		if (typeof WeakRefImpl === "function") return new WeakRefImpl(value);
	} catch {}
	return value;
}
function derefWeakRef(ref) {
	if (!ref) return;
	if (typeof ref === "object" && "deref" in ref && typeof ref.deref === "function") try {
		return ref.deref();
	} catch {
		return;
	}
	return ref;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/spanOnScope.js
var SCOPE_SPAN_FIELD = "_sentrySpan";
function _setSpanForScope(scope, span) {
	if (span) addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, makeWeakRef(span));
	else delete scope[SCOPE_SPAN_FIELD];
}
function _getSpanForScope(scope) {
	return derefWeakRef(scope[SCOPE_SPAN_FIELD]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/scope.js
var DEFAULT_MAX_BREADCRUMBS = 100;
var Scope = class Scope {
	constructor() {
		this._notifyingListeners = false;
		this._scopeListeners = [];
		this._eventProcessors = [];
		this._breadcrumbs = [];
		this._attachments = [];
		this._user = {};
		this._tags = {};
		this._attributes = {};
		this._extra = {};
		this._contexts = {};
		this._sdkProcessingMetadata = {};
		this._propagationContext = {
			traceId: generateTraceId(),
			sampleRand: safeMathRandom()
		};
	}
	/**
	* Clone all data from this scope into a new scope.
	*/
	clone() {
		const newScope = new Scope();
		newScope._breadcrumbs = [...this._breadcrumbs];
		newScope._tags = { ...this._tags };
		newScope._attributes = { ...this._attributes };
		newScope._extra = { ...this._extra };
		newScope._contexts = { ...this._contexts };
		if (this._contexts.flags) newScope._contexts.flags = { values: [...this._contexts.flags.values] };
		newScope._user = this._user;
		newScope._level = this._level;
		newScope._session = this._session;
		newScope._transactionName = this._transactionName;
		newScope._fingerprint = this._fingerprint;
		newScope._eventProcessors = [...this._eventProcessors];
		newScope._attachments = [...this._attachments];
		newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
		newScope._propagationContext = { ...this._propagationContext };
		newScope._client = this._client;
		newScope._lastEventId = this._lastEventId;
		newScope._conversationId = this._conversationId;
		_setSpanForScope(newScope, _getSpanForScope(this));
		return newScope;
	}
	/**
	* Update the client assigned to this scope.
	* Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
	* as well as manually created scopes.
	*/
	setClient(client) {
		this._client = client;
	}
	/**
	* Set the ID of the last captured error event.
	* This is generally only captured on the isolation scope.
	*/
	setLastEventId(lastEventId) {
		this._lastEventId = lastEventId;
	}
	/**
	* Get the client assigned to this scope.
	*/
	getClient() {
		return this._client;
	}
	/**
	* Get the ID of the last captured error event.
	* This is generally only available on the isolation scope.
	*/
	lastEventId() {
		return this._lastEventId;
	}
	/**
	* @inheritDoc
	*/
	addScopeListener(callback) {
		this._scopeListeners.push(callback);
	}
	/**
	* Add an event processor that will be called before an event is sent.
	*/
	addEventProcessor(callback) {
		this._eventProcessors.push(callback);
		return this;
	}
	/**
	* Set the user for this scope.
	* Set to `null` to unset the user.
	*/
	setUser(user) {
		this._user = user || {
			email: void 0,
			id: void 0,
			ip_address: void 0,
			username: void 0
		};
		if (this._session) updateSession(this._session, { user });
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Get the user from this scope.
	*/
	getUser() {
		return this._user;
	}
	/**
	* Set the conversation ID for this scope.
	* Set to `null` to unset the conversation ID.
	*/
	setConversationId(conversationId) {
		this._conversationId = conversationId || void 0;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set an object that will be merged into existing tags on the scope,
	* and will be sent as tags data with the event.
	*/
	setTags(tags) {
		this._tags = {
			...this._tags,
			...tags
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set a single tag that will be sent as tags data with the event.
	*/
	setTag(key, value) {
		return this.setTags({ [key]: value });
	}
	/**
	* Sets attributes onto the scope.
	*
	* These attributes are applied to logs, metrics and streamed spans.
	*
	* Supported attribute value types are `string`, `number`, `boolean`, `string[]`, `number[]` and `boolean[]`.
	*
	* @param newAttributes - The attributes to set on the scope, as key-value pairs.
	*
	* @example
	* ```typescript
	* scope.setAttributes({
	*   is_admin: true,
	*   payment_selection: 'credit_card',
	*   render_duration: 150,
	* });
	* ```
	*/
	setAttributes(newAttributes) {
		this._attributes = {
			...this._attributes,
			...newAttributes
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets an attribute onto the scope.
	*
	* These attributes are applied to logs, metrics and streamed spans.
	*
	* Supported attribute value types are `string`, `number`, `boolean`, `string[]`, `number[]` and `boolean[]`.
	*
	* @param key - The attribute key.
	* @param value - The attribute value.
	*
	* @example
	* ```typescript
	* scope.setAttribute('is_admin', true);
	* scope.setAttribute('render_duration', 150);
	* ```
	*/
	setAttribute(key, value) {
		return this.setAttributes({ [key]: value });
	}
	/**
	* Removes the attribute with the given key from the scope.
	*
	* @param key - The attribute key.
	*
	* @example
	* ```typescript
	* scope.removeAttribute('is_admin');
	* ```
	*/
	removeAttribute(key) {
		if (key in this._attributes) {
			delete this._attributes[key];
			this._notifyScopeListeners();
		}
		return this;
	}
	/**
	* Set an object that will be merged into existing extra on the scope,
	* and will be sent as extra data with the event.
	*/
	setExtras(extras) {
		this._extra = {
			...this._extra,
			...extras
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set a single key:value extra entry that will be sent as extra data with the event.
	*/
	setExtra(key, extra) {
		this._extra = {
			...this._extra,
			[key]: extra
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets the fingerprint on the scope to send with the events.
	* @param {string[]} fingerprint Fingerprint to group events in Sentry.
	*/
	setFingerprint(fingerprint) {
		this._fingerprint = fingerprint;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets the level on the scope for future events.
	*/
	setLevel(level) {
		this._level = level;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets the transaction name on the scope so that the name of e.g. taken server route or
	* the page location is attached to future events.
	*
	* IMPORTANT: Calling this function does NOT change the name of the currently active
	* root span. If you want to change the name of the active root span, use
	* `Sentry.updateSpanName(rootSpan, 'new name')` instead.
	*
	* By default, the SDK updates the scope's transaction name automatically on sensible
	* occasions, such as a page navigation or when handling a new request on the server.
	*/
	setTransactionName(name) {
		this._transactionName = name;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Sets context data with the given name.
	* Data passed as context will be normalized. You can also pass `null` to unset the context.
	* Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
	*/
	setContext(key, context) {
		if (context === null) delete this._contexts[key];
		else this._contexts[key] = context;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Set the session for the scope.
	*/
	setSession(session) {
		if (!session) delete this._session;
		else this._session = session;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Get the session from the scope.
	*/
	getSession() {
		return this._session;
	}
	/**
	* Updates the scope with provided data. Can work in three variations:
	* - plain object containing updatable attributes
	* - Scope instance that'll extract the attributes from
	* - callback function that'll receive the current scope as an argument and allow for modifications
	*/
	update(captureContext) {
		if (!captureContext) return this;
		const scopeToMerge = typeof captureContext === "function" ? captureContext(this) : captureContext;
		const { tags, attributes, extra, user, contexts, level, fingerprint = [], propagationContext, conversationId } = (scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : isPlainObject(scopeToMerge) ? captureContext : void 0) || {};
		this._tags = {
			...this._tags,
			...tags
		};
		this._attributes = {
			...this._attributes,
			...attributes
		};
		this._extra = {
			...this._extra,
			...extra
		};
		this._contexts = {
			...this._contexts,
			...contexts
		};
		if (user && Object.keys(user).length) this._user = user;
		if (level) this._level = level;
		if (fingerprint.length) this._fingerprint = fingerprint;
		if (propagationContext) this._propagationContext = propagationContext;
		if (conversationId) this._conversationId = conversationId;
		return this;
	}
	/**
	* Clears the current scope and resets its properties.
	* Note: The client will not be cleared.
	*/
	clear() {
		this._breadcrumbs = [];
		this._tags = {};
		this._attributes = {};
		this._extra = {};
		this._user = {};
		this._contexts = {};
		this._level = void 0;
		this._transactionName = void 0;
		this._fingerprint = void 0;
		this._session = void 0;
		this._conversationId = void 0;
		_setSpanForScope(this, void 0);
		this._attachments = [];
		this.setPropagationContext({
			traceId: generateTraceId(),
			sampleRand: safeMathRandom()
		});
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Adds a breadcrumb to the scope.
	* By default, the last 100 breadcrumbs are kept.
	*/
	addBreadcrumb(breadcrumb, maxBreadcrumbs) {
		const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
		if (maxCrumbs <= 0) return this;
		const mergedBreadcrumb = {
			timestamp: dateTimestampInSeconds(),
			...breadcrumb,
			message: breadcrumb.message ? truncate(breadcrumb.message, 2048) : breadcrumb.message
		};
		this._breadcrumbs.push(mergedBreadcrumb);
		if (this._breadcrumbs.length > maxCrumbs) {
			this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
			this._client?.recordDroppedEvent("buffer_overflow", "log_item");
		}
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Get the last breadcrumb of the scope.
	*/
	getLastBreadcrumb() {
		return this._breadcrumbs[this._breadcrumbs.length - 1];
	}
	/**
	* Clear all breadcrumbs from the scope.
	*/
	clearBreadcrumbs() {
		this._breadcrumbs = [];
		this._notifyScopeListeners();
		return this;
	}
	/**
	* Add an attachment to the scope.
	*/
	addAttachment(attachment) {
		this._attachments.push(attachment);
		return this;
	}
	/**
	* Clear all attachments from the scope.
	*/
	clearAttachments() {
		this._attachments = [];
		return this;
	}
	/**
	* Get the data of this scope, which should be applied to an event during processing.
	*/
	getScopeData() {
		return {
			breadcrumbs: this._breadcrumbs,
			attachments: this._attachments,
			contexts: this._contexts,
			tags: this._tags,
			attributes: this._attributes,
			extra: this._extra,
			user: this._user,
			level: this._level,
			fingerprint: this._fingerprint || [],
			eventProcessors: this._eventProcessors,
			propagationContext: this._propagationContext,
			sdkProcessingMetadata: this._sdkProcessingMetadata,
			transactionName: this._transactionName,
			span: _getSpanForScope(this),
			conversationId: this._conversationId
		};
	}
	/**
	* Add data which will be accessible during event processing but won't get sent to Sentry.
	*/
	setSDKProcessingMetadata(newData) {
		this._sdkProcessingMetadata = merge(this._sdkProcessingMetadata, newData, 2);
		return this;
	}
	/**
	* Add propagation context to the scope, used for distributed tracing
	*/
	setPropagationContext(context) {
		this._propagationContext = context;
		return this;
	}
	/**
	* Get propagation context from the scope, used for distributed tracing
	*/
	getPropagationContext() {
		return this._propagationContext;
	}
	/**
	* Capture an exception for this scope.
	*
	* @returns {string} The id of the captured Sentry event.
	*/
	captureException(exception, hint) {
		const eventId = hint?.event_id || uuid4();
		if (!this._client) {
			DEBUG_BUILD$3 && debug.warn("No client configured on scope - will not capture exception!");
			return eventId;
		}
		const syntheticException = /* @__PURE__ */ new Error("Sentry syntheticException");
		this._client.captureException(exception, {
			originalException: exception,
			syntheticException,
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* Capture a message for this scope.
	*
	* @returns {string} The id of the captured message.
	*/
	captureMessage(message, level, hint) {
		const eventId = hint?.event_id || uuid4();
		if (!this._client) {
			DEBUG_BUILD$3 && debug.warn("No client configured on scope - will not capture message!");
			return eventId;
		}
		const syntheticException = hint?.syntheticException ?? new Error(message);
		this._client.captureMessage(message, level, {
			originalException: message,
			syntheticException,
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* Capture a Sentry event for this scope.
	*
	* @returns {string} The id of the captured event.
	*/
	captureEvent(event, hint) {
		const eventId = event.event_id || hint?.event_id || uuid4();
		if (!this._client) {
			DEBUG_BUILD$3 && debug.warn("No client configured on scope - will not capture event!");
			return eventId;
		}
		this._client.captureEvent(event, {
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* This will be called on every set call.
	*/
	_notifyScopeListeners() {
		if (!this._notifyingListeners) {
			this._notifyingListeners = true;
			this._scopeListeners.forEach((callback) => {
				callback(this);
			});
			this._notifyingListeners = false;
		}
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/defaultScopes.js
function getDefaultCurrentScope() {
	return getGlobalSingleton("defaultCurrentScope", () => new Scope());
}
function getDefaultIsolationScope() {
	return getGlobalSingleton("defaultIsolationScope", () => new Scope());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/chain-and-copy-promiselike.js
var isActualPromise = (p) => p instanceof Promise && !p[kChainedCopy];
var kChainedCopy = /* @__PURE__ */ Symbol("chained PromiseLike");
var chainAndCopyPromiseLike = (original, onSuccess, onError) => {
	const chained = original.then((value) => {
		onSuccess(value);
		return value;
	}, (err) => {
		onError(err);
		throw err;
	});
	return isActualPromise(chained) && isActualPromise(original) ? chained : copyProps(original, chained);
};
var copyProps = (original, chained) => {
	if (!chained) return original;
	let mutated = false;
	for (const key in original) {
		if (key in chained) continue;
		mutated = true;
		const value = original[key];
		if (typeof value === "function") Object.defineProperty(chained, key, {
			value: (...args) => value.apply(original, args),
			enumerable: true,
			configurable: true,
			writable: true
		});
		else chained[key] = value;
	}
	if (mutated) Object.assign(chained, { [kChainedCopy]: true });
	return chained;
};
//#endregion
//#region node_modules/@sentry/core/build/esm/asyncContext/stackStrategy.js
var AsyncContextStack = class {
	constructor(scope, isolationScope) {
		let assignedScope;
		if (!scope) assignedScope = new Scope();
		else assignedScope = scope;
		let assignedIsolationScope;
		if (!isolationScope) assignedIsolationScope = new Scope();
		else assignedIsolationScope = isolationScope;
		this._stack = [{ scope: assignedScope }];
		this._isolationScope = assignedIsolationScope;
	}
	/**
	* Fork a scope for the stack.
	*/
	withScope(callback) {
		const scope = this._pushScope();
		let maybePromiseResult;
		try {
			maybePromiseResult = callback(scope);
		} catch (e) {
			this._popScope();
			throw e;
		}
		if (isThenable(maybePromiseResult)) return chainAndCopyPromiseLike(maybePromiseResult, () => this._popScope(), () => this._popScope());
		this._popScope();
		return maybePromiseResult;
	}
	/**
	* Get the client of the stack.
	*/
	getClient() {
		return this.getStackTop().client;
	}
	/**
	* Returns the scope of the top stack.
	*/
	getScope() {
		return this.getStackTop().scope;
	}
	/**
	* Get the isolation scope for the stack.
	*/
	getIsolationScope() {
		return this._isolationScope;
	}
	/**
	* Returns the topmost scope layer in the order domain > local > process.
	*/
	getStackTop() {
		return this._stack[this._stack.length - 1];
	}
	/**
	* Push a scope to the stack.
	*/
	_pushScope() {
		const scope = this.getScope().clone();
		this._stack.push({
			client: this.getClient(),
			scope
		});
		return scope;
	}
	/**
	* Pop a scope from the stack.
	*/
	_popScope() {
		if (this._stack.length <= 1) return false;
		return !!this._stack.pop();
	}
};
function getAsyncContextStack() {
	const sentry = getSentryCarrier(getMainCarrier());
	return sentry.stack = sentry.stack || new AsyncContextStack(getDefaultCurrentScope(), getDefaultIsolationScope());
}
function withScope$1(callback) {
	return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
	const stack = getAsyncContextStack();
	return stack.withScope(() => {
		stack.getStackTop().scope = scope;
		return callback(scope);
	});
}
function withIsolationScope$1(callback) {
	return getAsyncContextStack().withScope(() => {
		return callback(getAsyncContextStack().getIsolationScope());
	});
}
function getStackAsyncContextStrategy() {
	return {
		withIsolationScope: withIsolationScope$1,
		withScope: withScope$1,
		withSetScope,
		withSetIsolationScope: (_isolationScope, callback) => {
			return withIsolationScope$1(callback);
		},
		getCurrentScope: () => getAsyncContextStack().getScope(),
		getIsolationScope: () => getAsyncContextStack().getIsolationScope()
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/asyncContext/index.js
function setAsyncContextStrategy(strategy) {
	const sentry = getSentryCarrier(getMainCarrier());
	sentry.acs = strategy;
}
function getAsyncContextStrategy(carrier) {
	const sentry = getSentryCarrier(carrier);
	if (sentry.acs) return sentry.acs;
	return getStackAsyncContextStrategy();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/attributes.js
function isAttributeObject(maybeObj) {
	return typeof maybeObj === "object" && maybeObj != null && !Array.isArray(maybeObj) && Object.keys(maybeObj).includes("value");
}
function attributeValueToTypedAttributeValue(rawValue, useFallback) {
	const { value, unit } = isAttributeObject(rawValue) ? rawValue : {
		value: rawValue,
		unit: void 0
	};
	const attributeValue = getTypedAttributeValue(value);
	const checkedUnit = unit && typeof unit === "string" ? { unit } : {};
	if (attributeValue) return {
		...attributeValue,
		...checkedUnit
	};
	if (!useFallback || useFallback === "skip-undefined" && value === void 0) return;
	let stringValue = "";
	try {
		stringValue = JSON.stringify(value) ?? "";
	} catch {}
	return {
		value: stringValue,
		type: "string",
		...checkedUnit
	};
}
function serializeAttributes(attributes, fallback = false) {
	const serializedAttributes = {};
	for (const [key, value] of Object.entries(attributes ?? {})) {
		const typedValue = attributeValueToTypedAttributeValue(value, fallback);
		if (typedValue) serializedAttributes[key] = typedValue;
	}
	return serializedAttributes;
}
function estimateTypedAttributesSizeInBytes(attributes) {
	if (!attributes) return 0;
	let weight = 0;
	for (const [key, attr] of Object.entries(attributes)) {
		weight += key.length * 2;
		weight += attr.type.length * 2;
		weight += (attr.unit?.length ?? 0) * 2;
		const val = attr.value;
		if (Array.isArray(val)) weight += estimatePrimitiveSizeInBytes$1(val[0]) * val.length;
		else if (isPrimitive(val)) weight += estimatePrimitiveSizeInBytes$1(val);
		else weight += 100;
	}
	return weight;
}
function estimatePrimitiveSizeInBytes$1(value) {
	if (typeof value === "string") return value.length * 2;
	else if (typeof value === "boolean") return 4;
	else if (typeof value === "number") return 8;
	return 0;
}
function getTypedAttributeValue(value) {
	if (Array.isArray(value)) return {
		value,
		type: "array"
	};
	const primitiveType = typeof value === "string" ? "string" : typeof value === "boolean" ? "boolean" : typeof value === "number" && !Number.isNaN(value) ? Number.isInteger(value) ? "integer" : "double" : null;
	if (primitiveType) return {
		value,
		type: primitiveType
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/currentScopes.js
var _externalPropagationContextProvider;
function getExternalPropagationContext() {
	return _externalPropagationContextProvider?.();
}
function hasExternalPropagationContext() {
	return _externalPropagationContextProvider !== void 0;
}
function getCurrentScope() {
	return getAsyncContextStrategy(getMainCarrier()).getCurrentScope();
}
function getIsolationScope() {
	return getAsyncContextStrategy(getMainCarrier()).getIsolationScope();
}
function getGlobalScope() {
	return getGlobalSingleton("globalScope", () => new Scope());
}
function withScope(...rest) {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (rest.length === 2) {
		const [scope, callback] = rest;
		if (!scope) return acs.withScope(callback);
		return acs.withSetScope(scope, callback);
	}
	return acs.withScope(rest[0]);
}
function withIsolationScope(...rest) {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (rest.length === 2) {
		const [isolationScope, callback] = rest;
		if (!isolationScope) return acs.withIsolationScope(callback);
		return acs.withSetIsolationScope(isolationScope, callback);
	}
	return acs.withIsolationScope(rest[0]);
}
function getClient() {
	return getCurrentScope().getClient();
}
function getTraceContextFromScope(scope) {
	const externalContext = getExternalPropagationContext();
	if (externalContext) return {
		trace_id: externalContext.traceId,
		span_id: externalContext.spanId
	};
	const { traceId, parentSpanId, propagationSpanId } = scope.getPropagationContext();
	const traceContext = {
		trace_id: traceId,
		span_id: propagationSpanId || generateSpanId()
	};
	if (parentSpanId) traceContext.parent_span_id = parentSpanId;
	return traceContext;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/semanticAttributes.js
var SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = "sentry.source";
var SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = "sentry.sample_rate";
var SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = "sentry.previous_trace_sample_rate";
var SEMANTIC_ATTRIBUTE_SENTRY_OP = "sentry.op";
var SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = "sentry.origin";
var SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON = "sentry.idle_span_finish_reason";
var SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = "sentry.measurement_unit";
var SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = "sentry.measurement_value";
var SEMANTIC_ATTRIBUTE_SENTRY_RELEASE = "sentry.release";
var SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT = "sentry.environment";
var SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS = "sentry.sdk.integrations";
var SEMANTIC_ATTRIBUTE_USER_ID = "user.id";
var SEMANTIC_ATTRIBUTE_USER_EMAIL = "user.email";
var SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS = "user.ip_address";
var SEMANTIC_ATTRIBUTE_USER_USERNAME = "user.name";
var SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = "sentry.custom_span_name";
var SEMANTIC_ATTRIBUTE_PROFILE_ID = "sentry.profile_id";
var SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = "sentry.exclusive_time";
var SEMANTIC_ATTRIBUTE_CACHE_HIT = "cache.hit";
var SEMANTIC_ATTRIBUTE_CACHE_KEY = "cache.key";
var SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = "cache.item_size";
var SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = "http.request.method";
var SEMANTIC_ATTRIBUTE_URL_FULL = "url.full";
var SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE = "sentry.link.type";
var GEN_AI_CONVERSATION_ID_ATTRIBUTE = "gen_ai.conversation.id";
function getSpanStatusFromHttpCode(httpStatus) {
	if (httpStatus < 400 && httpStatus >= 100) return { code: 1 };
	if (httpStatus >= 400 && httpStatus < 500) switch (httpStatus) {
		case 401: return {
			code: 2,
			message: "unauthenticated"
		};
		case 403: return {
			code: 2,
			message: "permission_denied"
		};
		case 404: return {
			code: 2,
			message: "not_found"
		};
		case 409: return {
			code: 2,
			message: "already_exists"
		};
		case 413: return {
			code: 2,
			message: "failed_precondition"
		};
		case 429: return {
			code: 2,
			message: "resource_exhausted"
		};
		case 499: return {
			code: 2,
			message: "cancelled"
		};
		default: return {
			code: 2,
			message: "invalid_argument"
		};
	}
	if (httpStatus >= 500 && httpStatus < 600) switch (httpStatus) {
		case 501: return {
			code: 2,
			message: "unimplemented"
		};
		case 503: return {
			code: 2,
			message: "unavailable"
		};
		case 504: return {
			code: 2,
			message: "deadline_exceeded"
		};
		default: return {
			code: 2,
			message: "internal_error"
		};
	}
	return {
		code: 2,
		message: "internal_error"
	};
}
function setHttpStatus(span, httpStatus) {
	span.setAttribute("http.response.status_code", httpStatus);
	const spanStatus = getSpanStatusFromHttpCode(httpStatus);
	if (spanStatus.message !== "unknown_error") span.setStatus(spanStatus);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/utils.js
var SCOPE_ON_START_SPAN_FIELD = "_sentryScope";
var ISOLATION_SCOPE_ON_START_SPAN_FIELD = "_sentryIsolationScope";
var OTEL_SOURCE_INFERENCE_SPAN_FIELD = /* @__PURE__ */ Symbol.for("sentry.otelSourceInference");
var OTEL_SOURCE_EXPLICITLY_SET_SPAN_FIELD = /* @__PURE__ */ Symbol.for("sentry.otelSourceExplicitlySet");
var TRACER_PROVIDER_SPAN_FIELD = /* @__PURE__ */ Symbol.for("sentry.tracerProviderSpan");
function setCapturedScopesOnSpan(span, scope, isolationScope) {
	if (span) {
		addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, makeWeakRef(isolationScope));
		addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
	}
}
function getCapturedScopesOnSpan(span) {
	const spanWithScopes = span;
	return {
		scope: spanWithScopes[SCOPE_ON_START_SPAN_FIELD],
		isolationScope: derefWeakRef(spanWithScopes[ISOLATION_SCOPE_ON_START_SPAN_FIELD])
	};
}
function markSpanForOtelSourceInference(span) {
	addNonEnumerableProperty(span, OTEL_SOURCE_INFERENCE_SPAN_FIELD, true);
}
function spanShouldInferOtelSource(span) {
	return span[OTEL_SOURCE_INFERENCE_SPAN_FIELD] === true;
}
function markSpanSourceAsExplicit(span) {
	addNonEnumerableProperty(span, OTEL_SOURCE_EXPLICITLY_SET_SPAN_FIELD, true);
}
function spanSourceWasExplicitlySet(span) {
	return span[OTEL_SOURCE_EXPLICITLY_SET_SPAN_FIELD] === true;
}
function markSpanAsTracerProviderSpan(span) {
	addNonEnumerableProperty(span, TRACER_PROVIDER_SPAN_FIELD, true);
}
function spanIsTracerProviderSpan(span) {
	return span[TRACER_PROVIDER_SPAN_FIELD] === true;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/baggage.js
var SENTRY_BAGGAGE_KEY_PREFIX = "sentry-";
function baggageHeaderToDynamicSamplingContext(baggageHeader) {
	const baggageObject = parseBaggageHeader(baggageHeader);
	if (!baggageObject) return;
	const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
		if (key.startsWith("sentry-")) {
			const nonPrefixedKey = key.slice(7);
			acc[nonPrefixedKey] = value;
		}
		return acc;
	}, {});
	if (Object.keys(dynamicSamplingContext).length > 0) return dynamicSamplingContext;
	else return;
}
function dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext) {
	if (!dynamicSamplingContext) return;
	return objectToBaggageHeader(Object.entries(dynamicSamplingContext).reduce((acc, [dscKey, dscValue]) => {
		if (dscValue) acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
		return acc;
	}, {}));
}
function parseBaggageHeader(baggageHeader) {
	if (!baggageHeader || !isString(baggageHeader) && !Array.isArray(baggageHeader)) return;
	if (Array.isArray(baggageHeader)) return baggageHeader.reduce((acc, curr) => {
		const currBaggageObject = baggageHeaderToObject(curr);
		Object.entries(currBaggageObject).forEach(([key, value]) => {
			acc[key] = value;
		});
		return acc;
	}, {});
	return baggageHeaderToObject(baggageHeader);
}
function baggageHeaderToObject(baggageHeader) {
	return baggageHeader.split(",").map((baggageEntry) => {
		const eqIdx = baggageEntry.indexOf("=");
		if (eqIdx === -1) return [];
		return [baggageEntry.slice(0, eqIdx), baggageEntry.slice(eqIdx + 1)].map((keyOrValue) => {
			try {
				return decodeURIComponent(keyOrValue.trim());
			} catch {
				return;
			}
		});
	}).reduce((acc, [key, value]) => {
		if (key && value) acc[key] = value;
		return acc;
	}, {});
}
function objectToBaggageHeader(object) {
	if (Object.keys(object).length === 0) return;
	return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
		const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
		const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
		if (newBaggageHeader.length > 8192) {
			DEBUG_BUILD$3 && debug.warn(`Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`);
			return baggageHeader;
		} else return newBaggageHeader;
	}, "");
}
function mergeBaggageHeaders(existing, incoming) {
	if (!existing) return incoming;
	const existingEntries = parseBaggageHeader(existing);
	const incomingEntries = parseBaggageHeader(incoming);
	if (!incomingEntries) return existing;
	const merged = {};
	let hasNewSentryEntries = false;
	const newSentryEntries = {};
	const newNonSentryEntries = {};
	for (const [key, value] of Object.entries(incomingEntries)) if (key.startsWith("sentry-")) {
		newSentryEntries[key] = value;
		hasNewSentryEntries = true;
	} else newNonSentryEntries[key] = value;
	if (existingEntries) {
		for (const [key, value] of Object.entries(existingEntries)) if (!hasNewSentryEntries || !key.startsWith("sentry-")) merged[key] = value;
	}
	if (hasNewSentryEntries) Object.assign(merged, newSentryEntries);
	for (const [key, value] of Object.entries(newNonSentryEntries)) merged[key] ?? (merged[key] = value);
	return objectToBaggageHeader(merged);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/dsn.js
var ORG_ID_REGEX = /^o(\d+)\./;
var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)((?:\[[:.%\w]+\]|[\w.-]+))(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
	return protocol === "http" || protocol === "https";
}
function dsnToString(dsn, withPassword = false) {
	const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
	return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
}
function dsnFromString(str) {
	const match = DSN_REGEX.exec(str);
	if (!match) {
		consoleSandbox(() => {
			console.error(`Invalid Sentry Dsn: ${str}`);
		});
		return;
	}
	const [protocol, publicKey, pass = "", host = "", port = "", lastPath = ""] = match.slice(1);
	let path = "";
	let projectId = lastPath;
	const split = projectId.split("/");
	if (split.length > 1) {
		path = split.slice(0, -1).join("/");
		projectId = split.pop();
	}
	if (projectId) {
		const projectMatch = projectId.match(/^\d+/);
		if (projectMatch) projectId = projectMatch[0];
	}
	return dsnFromComponents({
		host,
		pass,
		path,
		projectId,
		port,
		protocol,
		publicKey
	});
}
function dsnFromComponents(components) {
	return {
		protocol: components.protocol,
		publicKey: components.publicKey || "",
		pass: components.pass || "",
		host: components.host,
		port: components.port || "",
		path: components.path || "",
		projectId: components.projectId
	};
}
function validateDsn(dsn) {
	if (!DEBUG_BUILD$3) return true;
	const { port, projectId, protocol } = dsn;
	if ([
		"protocol",
		"publicKey",
		"host",
		"projectId"
	].find((component) => {
		if (!dsn[component]) {
			debug.error(`Invalid Sentry Dsn: ${component} missing`);
			return true;
		}
		return false;
	})) return false;
	if (!projectId.match(/^\d+$/)) {
		debug.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
		return false;
	}
	if (!isValidProtocol(protocol)) {
		debug.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
		return false;
	}
	if (port && isNaN(parseInt(port, 10))) {
		debug.error(`Invalid Sentry Dsn: Invalid port ${port}`);
		return false;
	}
	return true;
}
function extractOrgIdFromDsnHost(host) {
	return host.match(ORG_ID_REGEX)?.[1];
}
function extractOrgIdFromClient(client) {
	const options = client.getOptions();
	const { host } = client.getDsn() || {};
	let org_id;
	if (options.orgId) org_id = String(options.orgId);
	else if (host) org_id = extractOrgIdFromDsnHost(host);
	return org_id;
}
function makeDsn(from) {
	const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
	if (!components || !validateDsn(components)) return;
	return components;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/parseSampleRate.js
function parseSampleRate(sampleRate) {
	if (typeof sampleRate === "boolean") return Number(sampleRate);
	const rate = typeof sampleRate === "string" ? parseFloat(sampleRate) : sampleRate;
	if (typeof rate !== "number" || isNaN(rate) || rate < 0 || rate > 1) return;
	return rate;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/tracing.js
var TRACEPARENT_REGEXP = /* @__PURE__ */ new RegExp("^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$");
function extractTraceparentData(traceparent) {
	if (!traceparent) return;
	const matches = traceparent.match(TRACEPARENT_REGEXP);
	if (!matches) return;
	let parentSampled;
	if (matches[3] === "1") parentSampled = true;
	else if (matches[3] === "0") parentSampled = false;
	return {
		traceId: matches[1],
		parentSampled,
		parentSpanId: matches[2]
	};
}
function propagationContextFromHeaders(sentryTrace, baggage) {
	const traceparentData = extractTraceparentData(sentryTrace);
	const dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
	if (!traceparentData?.traceId) return {
		traceId: generateTraceId(),
		sampleRand: safeMathRandom()
	};
	const sampleRand = getSampleRandFromTraceparentAndDsc(traceparentData, dynamicSamplingContext);
	if (dynamicSamplingContext) dynamicSamplingContext.sample_rand = sampleRand.toString();
	const { traceId, parentSpanId, parentSampled } = traceparentData;
	return {
		traceId,
		parentSpanId,
		sampled: parentSampled,
		dsc: dynamicSamplingContext || {},
		sampleRand
	};
}
function generateSentryTraceHeader(traceId = generateTraceId(), spanId = generateSpanId(), sampled) {
	let sampledString = "";
	if (sampled !== void 0) sampledString = sampled ? "-1" : "-0";
	return `${traceId}-${spanId}${sampledString}`;
}
function generateTraceparentHeader(traceId = generateTraceId(), spanId = generateSpanId(), sampled) {
	return `00-${traceId}-${spanId}-${sampled ? "01" : "00"}`;
}
function getSampleRandFromTraceparentAndDsc(traceparentData, dsc) {
	const parsedSampleRand = parseSampleRate(dsc?.sample_rand);
	if (parsedSampleRand !== void 0) return parsedSampleRand;
	const parsedSampleRate = parseSampleRate(dsc?.sample_rate);
	if (parsedSampleRate && traceparentData?.parentSampled !== void 0) return traceparentData.parentSampled ? safeMathRandom() * parsedSampleRate : parsedSampleRate + safeMathRandom() * (1 - parsedSampleRate);
	else return safeMathRandom();
}
function shouldContinueTrace(client, baggageOrgId) {
	const clientOrgId = extractOrgIdFromClient(client);
	if (baggageOrgId && clientOrgId && baggageOrgId !== clientOrgId) {
		debug.log(`Won't continue trace because org IDs don't match (incoming baggage: ${baggageOrgId}, SDK options: ${clientOrgId})`);
		return false;
	}
	if (client.getOptions().strictTraceContinuation || false) {
		if (baggageOrgId && !clientOrgId || !baggageOrgId && clientOrgId) {
			debug.log(`Starting a new trace because strict trace continuation is enabled but one org ID is missing (incoming baggage: ${baggageOrgId}, Sentry client: ${clientOrgId})`);
			return false;
		}
	}
	return true;
}
var hasShownSpanDropWarning = false;
function spanToTransactionTraceContext(span) {
	const { spanId: span_id, traceId: trace_id } = span.spanContext();
	const { data, op, parent_span_id, status, origin, links } = spanToJSON(span);
	return {
		parent_span_id,
		span_id,
		trace_id,
		data,
		op,
		status,
		origin,
		links
	};
}
function spanToTraceContext(span) {
	const { spanId, traceId: trace_id, isRemote } = span.spanContext();
	const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
	const scope = getCapturedScopesOnSpan(span).scope;
	return {
		parent_span_id,
		span_id: isRemote ? scope?.getPropagationContext().propagationSpanId || generateSpanId() : spanId,
		trace_id
	};
}
function spanToTraceHeader(span) {
	const { traceId, spanId } = span.spanContext();
	return generateSentryTraceHeader(traceId, spanId, spanIsSampled(span));
}
function spanToTraceparentHeader(span) {
	const { traceId, spanId } = span.spanContext();
	return generateTraceparentHeader(traceId, spanId, spanIsSampled(span));
}
function convertSpanLinksForEnvelope(links) {
	if (links && links.length > 0) return links.map(({ context: { spanId, traceId, traceFlags, ...restContext }, attributes }) => ({
		span_id: spanId,
		trace_id: traceId,
		sampled: traceFlags === 1,
		attributes,
		...restContext
	}));
	else return;
}
function getStreamedSpanLinks(links) {
	if (links?.length) return links.map(({ context: { spanId, traceId, traceFlags }, attributes }) => ({
		span_id: spanId,
		trace_id: traceId,
		sampled: traceFlags === 1,
		attributes
	}));
	else return;
}
function spanTimeInputToSeconds(input) {
	if (typeof input === "number") return ensureTimestampInSeconds(input);
	if (Array.isArray(input)) return input[0] + input[1] / 1e9;
	if (input instanceof Date) return ensureTimestampInSeconds(input.getTime());
	return timestampInSeconds();
}
function ensureTimestampInSeconds(timestamp) {
	return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
}
function spanToJSON(span) {
	if (spanIsSentrySpan(span)) return span.getSpanJSON();
	const { spanId: span_id, traceId: trace_id } = span.spanContext();
	if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
		const { attributes, startTime, name, endTime, status, links } = span;
		return {
			span_id,
			trace_id,
			data: attributes,
			description: name,
			parent_span_id: getOtelParentSpanId(span),
			start_timestamp: spanTimeInputToSeconds(startTime),
			timestamp: spanTimeInputToSeconds(endTime) || void 0,
			status: getStatusMessage(status),
			op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
			origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
			links: convertSpanLinksForEnvelope(links)
		};
	}
	return {
		span_id,
		trace_id,
		start_timestamp: 0,
		data: {}
	};
}
function spanToStreamedSpanJSON(span) {
	if (spanIsSentrySpan(span)) return span.getStreamedSpanJSON();
	const { spanId: span_id, traceId: trace_id } = span.spanContext();
	if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
		const { attributes, startTime, name, endTime, status, links } = span;
		return {
			name,
			span_id,
			trace_id,
			parent_span_id: getOtelParentSpanId(span),
			start_timestamp: spanTimeInputToSeconds(startTime),
			end_timestamp: spanTimeInputToSeconds(endTime),
			is_segment: span === INTERNAL_getSegmentSpan(span),
			status: getSimpleStatus(status),
			attributes: addStatusMessageAttribute(attributes, status),
			links: getStreamedSpanLinks(links)
		};
	}
	return {
		span_id,
		trace_id,
		start_timestamp: 0,
		name: "",
		end_timestamp: 0,
		status: "ok",
		is_segment: span === INTERNAL_getSegmentSpan(span)
	};
}
function getOtelParentSpanId(span) {
	return "parentSpanId" in span ? span.parentSpanId : "parentSpanContext" in span ? span.parentSpanContext?.spanId : void 0;
}
function streamedSpanJsonToSerializedSpan(spanJson) {
	return {
		...spanJson,
		attributes: serializeAttributes(spanJson.attributes),
		links: spanJson.links?.map((link) => ({
			...link,
			attributes: serializeAttributes(link.attributes)
		}))
	};
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
	const castSpan = span;
	return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}
function spanIsSentrySpan(span) {
	return typeof span.getSpanJSON === "function";
}
function spanIsSampled(span) {
	const { traceFlags } = span.spanContext();
	return traceFlags === 1;
}
function getStatusMessage(status) {
	if (!status || status.code === 0) return;
	if (status.code === 1) return "ok";
	return status.message || "internal_error";
}
function getSimpleStatus(status) {
	return !status || status.code === 1 || status.code === 0 || status.message === "cancelled" ? "ok" : "error";
}
function addStatusMessageAttribute(attributes, status) {
	const statusMessage = getSimpleStatus(status) === "error" ? status?.message : void 0;
	return {
		...statusMessage && { ["sentry.status.message"]: statusMessage },
		...attributes
	};
}
var CHILD_SPANS_FIELD = "_sentryChildSpans";
var ROOT_SPAN_FIELD = "_sentryRootSpan";
function addChildSpanToSpan(span, childSpan) {
	addNonEnumerableProperty(childSpan, ROOT_SPAN_FIELD, span[ROOT_SPAN_FIELD] || span);
	if (span[CHILD_SPANS_FIELD]) span[CHILD_SPANS_FIELD].add(childSpan);
	else addNonEnumerableProperty(span, CHILD_SPANS_FIELD, /* @__PURE__ */ new Set([childSpan]));
}
function removeChildSpanFromSpan(span, childSpan) {
	if (span[CHILD_SPANS_FIELD]) span[CHILD_SPANS_FIELD].delete(childSpan);
}
function getSpanDescendants(span) {
	const resultSet = /* @__PURE__ */ new Set();
	function addSpanChildren(span2) {
		if (resultSet.has(span2)) return;
		else if (spanIsSampled(span2)) {
			resultSet.add(span2);
			const childSpans = span2[CHILD_SPANS_FIELD] ? Array.from(span2[CHILD_SPANS_FIELD]) : [];
			for (const childSpan of childSpans) addSpanChildren(childSpan);
		}
	}
	addSpanChildren(span);
	return Array.from(resultSet);
}
var getRootSpan = INTERNAL_getSegmentSpan;
function INTERNAL_getSegmentSpan(span) {
	return span[ROOT_SPAN_FIELD] || span;
}
function getActiveSpan() {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (acs.getActiveSpan) return acs.getActiveSpan();
	return _getSpanForScope(getCurrentScope());
}
function showSpanDropWarning() {
	if (!hasShownSpanDropWarning) {
		consoleSandbox(() => {
			console.warn("[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.");
		});
		hasShownSpanDropWarning = true;
	}
}
function updateSpanName(span, name) {
	span.updateName(name);
	span.setAttributes({
		[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom",
		[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME]: name
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/errors.js
var errorsInstrumented = false;
function registerSpanErrorInstrumentation() {
	if (errorsInstrumented) return;
	function errorCallback() {
		const activeSpan = getActiveSpan();
		const rootSpan = activeSpan && getRootSpan(activeSpan);
		if (rootSpan) {
			const message = "internal_error";
			DEBUG_BUILD$3 && debug.log(`[Tracing] Root span: ${message} -> Global error occurred`);
			rootSpan.setStatus({
				code: 2,
				message
			});
		}
	}
	errorsInstrumented = true;
	addGlobalErrorInstrumentationHandler(errorCallback);
	addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/hasSpansEnabled.js
function hasSpansEnabled(maybeOptions) {
	if (typeof __SENTRY_TRACING__ === "boolean" && !__SENTRY_TRACING__) return false;
	const options = maybeOptions || getClient()?.getOptions();
	return !!options && (options.tracesSampleRate != null || !!options.tracesSampler);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/should-ignore-span.js
function logIgnoredSpan(droppedSpan) {
	debug.log(`Ignoring span ${droppedSpan.op} - ${droppedSpan.description} because it matches \`ignoreSpans\`.`);
}
function shouldIgnoreSpan(span, ignoreSpans) {
	if (!ignoreSpans?.length) return false;
	for (const pattern of ignoreSpans) {
		if (isStringOrRegExp(pattern)) {
			if (span.description && isMatchingPattern(span.description, pattern)) {
				DEBUG_BUILD$3 && logIgnoredSpan(span);
				return true;
			}
			continue;
		}
		const hasAttributes = !!pattern.attributes && Object.keys(pattern.attributes).length > 0;
		if (!pattern.name && !pattern.op && !hasAttributes) continue;
		const nameMatches = pattern.name ? span.description && isMatchingPattern(span.description, pattern.name) : true;
		const opMatches = pattern.op ? span.op && isMatchingPattern(span.op, pattern.op) : true;
		const attrsMatch = pattern.attributes ? Object.entries(pattern.attributes).every(([key, valuePattern]) => _matchesAttributeValue(span.attributes?.[key], valuePattern)) : true;
		if (nameMatches && opMatches && attrsMatch) {
			DEBUG_BUILD$3 && logIgnoredSpan(span);
			return true;
		}
	}
	return false;
}
function _matchesAttributeValue(actual, pat) {
	if (typeof actual === "string" && (typeof pat === "string" || pat instanceof RegExp)) return isMatchingPattern(actual, pat);
	if (Array.isArray(actual) && Array.isArray(pat)) return actual.length === pat.length && actual.every((v, i) => v === pat[i]);
	return actual === pat;
}
function reparentChildSpans(spans, dropSpan) {
	const droppedSpanParentId = dropSpan.parent_span_id;
	const droppedSpanId = dropSpan.span_id;
	if (!droppedSpanParentId) return;
	for (const span of spans) if (span.parent_span_id === droppedSpanId) span.parent_span_id = droppedSpanParentId;
}
function isStringOrRegExp(value) {
	return typeof value === "string" || value instanceof RegExp;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/sentryNonRecordingSpan.js
var NON_RECORDING_SPAN_FIELD = /* @__PURE__ */ Symbol.for("sentry.nonRecordingSpan");
var SentryNonRecordingSpan = class {
	constructor(spanContext = {}) {
		this._traceId = spanContext.traceId || generateTraceId();
		this._spanId = spanContext.spanId || generateSpanId();
		this.dropReason = spanContext.dropReason;
		addNonEnumerableProperty(this, NON_RECORDING_SPAN_FIELD, true);
	}
	/** @inheritdoc */
	spanContext() {
		return {
			spanId: this._spanId,
			traceId: this._traceId,
			traceFlags: 0
		};
	}
	/** @inheritdoc */
	end(_timestamp) {}
	/** @inheritdoc */
	setAttribute(_key, _value) {
		return this;
	}
	/** @inheritdoc */
	setAttributes(_values) {
		return this;
	}
	/** @inheritdoc */
	setStatus(_status) {
		return this;
	}
	/** @inheritdoc */
	updateName(_name) {
		return this;
	}
	/** @inheritdoc */
	isRecording() {
		return false;
	}
	/** @inheritdoc */
	addEvent(_name, _attributesOrStartTime, _startTime) {
		return this;
	}
	/** @inheritDoc */
	addLink(_link) {
		return this;
	}
	/** @inheritDoc */
	addLinks(_links) {
		return this;
	}
	/**
	* This should generally not be used,
	* but we need it for being compliant with the OTEL Span interface.
	*
	* @hidden
	* @internal
	*/
	recordException(_exception, _time) {}
};
function spanIsNonRecordingSpan(span) {
	return !!span && span[NON_RECORDING_SPAN_FIELD] === true;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/constants.js
var DEFAULT_ENVIRONMENT = "production";
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/dynamicSamplingContext.js
var FROZEN_DSC_FIELD = "_frozenDsc";
function freezeDscOnSpan(span, dsc) {
	addNonEnumerableProperty(span, FROZEN_DSC_FIELD, dsc);
}
function getDynamicSamplingContextFromClient(trace_id, client) {
	const options = client.getOptions();
	const { publicKey: public_key } = client.getDsn() || {};
	const dsc = {
		environment: options.environment || "production",
		release: options.release,
		public_key,
		trace_id,
		org_id: extractOrgIdFromClient(client)
	};
	client.emit("createDsc", dsc);
	return dsc;
}
function getDynamicSamplingContextFromScope(client, scope) {
	const propagationContext = scope.getPropagationContext();
	return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
}
function getDynamicSamplingContextFromSpan(span) {
	const client = getClient();
	if (!client) return {};
	const rootSpan = getRootSpan(span);
	const rootSpanJson = spanToJSON(rootSpan);
	const rootSpanAttributes = rootSpanJson.data;
	const traceState = rootSpan.spanContext().traceState;
	const rootSpanSampleRate = traceState?.get("sentry.sample_rate") ?? rootSpanAttributes["sentry.sample_rate"] ?? rootSpanAttributes["sentry.previous_trace_sample_rate"];
	function applyLocalSampleRateToDsc(dsc2) {
		if (typeof rootSpanSampleRate === "number" || typeof rootSpanSampleRate === "string") dsc2.sample_rate = `${rootSpanSampleRate}`;
		return dsc2;
	}
	const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
	if (frozenDsc) return applyLocalSampleRateToDsc(frozenDsc);
	const isNonRecordingRoot = spanIsNonRecordingSpan(rootSpan);
	const isIgnoredRoot = isNonRecordingRoot && rootSpan.dropReason === "ignored";
	if (isNonRecordingRoot && (!hasSpansEnabled(client.getOptions()) || isIgnoredRoot)) {
		const capturedScope = getCapturedScopesOnSpan(rootSpan).scope;
		if (capturedScope) {
			const dsc2 = { ...getDynamicSamplingContextFromScope(client, capturedScope) };
			if (isIgnoredRoot) dsc2.sampled = "false";
			return applyLocalSampleRateToDsc(dsc2);
		}
	}
	const traceStateDsc = traceState?.get("sentry.dsc");
	const dscOnTraceState = traceStateDsc && baggageHeaderToDynamicSamplingContext(traceStateDsc);
	if (dscOnTraceState) return applyLocalSampleRateToDsc(dscOnTraceState);
	const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);
	const source = rootSpanAttributes["sentry.source"] ?? rootSpanAttributes["sentry.segment.name.source"];
	const name = rootSpanJson.description;
	if (source !== "url" && name) dsc.transaction = name;
	if (hasSpansEnabled()) {
		dsc.sampled = String(spanIsSampled(rootSpan));
		dsc.sample_rand = traceState?.get("sentry.sample_rand") ?? getCapturedScopesOnSpan(rootSpan).scope?.getPropagationContext().sampleRand.toString();
	}
	applyLocalSampleRateToDsc(dsc);
	client.emit("createDsc", dsc, rootSpan);
	return dsc;
}
function spanToBaggageHeader(span) {
	return dynamicSamplingContextToSentryBaggageHeader(getDynamicSamplingContextFromSpan(span));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/beforeSendSpan.js
function withStreamedSpan(callback) {
	addNonEnumerableProperty(callback, "_streamed", true);
	return callback;
}
function isStreamedBeforeSendSpanCallback(callback) {
	return !!callback && typeof callback === "function" && "_streamed" in callback && !!callback._streamed;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/envelope.js
function createEnvelope(headers, items = []) {
	return [headers, items];
}
function addItemToEnvelope(envelope, newItem) {
	const [headers, items] = envelope;
	return [headers, [...items, newItem]];
}
function forEachEnvelopeItem(envelope, callback) {
	const envelopeItems = envelope[1];
	for (const envelopeItem of envelopeItems) {
		const envelopeItemType = envelopeItem[0].type;
		if (callback(envelopeItem, envelopeItemType)) return true;
	}
	return false;
}
function envelopeContainsItemType(envelope, types) {
	return forEachEnvelopeItem(envelope, (_, type) => types.includes(type));
}
function encodeUTF8(input) {
	const carrier = getSentryCarrier(GLOBAL_OBJ);
	return carrier.encodePolyfill ? carrier.encodePolyfill(input) : new TextEncoder().encode(input);
}
function decodeUTF8(input) {
	const carrier = getSentryCarrier(GLOBAL_OBJ);
	return carrier.decodePolyfill ? carrier.decodePolyfill(input) : new TextDecoder().decode(input);
}
function serializeEnvelope(envelope) {
	const [envHeaders, items] = envelope;
	let parts = JSON.stringify(envHeaders);
	function append(next) {
		if (typeof parts === "string") parts = typeof next === "string" ? parts + next : [encodeUTF8(parts), next];
		else parts.push(typeof next === "string" ? encodeUTF8(next) : next);
	}
	for (const item of items) {
		const [itemHeaders, payload] = item;
		append(`
${JSON.stringify(itemHeaders)}
`);
		if (typeof payload === "string" || payload instanceof Uint8Array) append(payload);
		else {
			let stringifiedPayload;
			try {
				stringifiedPayload = JSON.stringify(payload);
			} catch {
				stringifiedPayload = JSON.stringify(normalize(payload));
			}
			append(stringifiedPayload);
		}
	}
	return typeof parts === "string" ? parts : concatBuffers(parts);
}
function concatBuffers(buffers) {
	const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
	const merged = new Uint8Array(totalLength);
	let offset = 0;
	for (const buffer of buffers) {
		merged.set(buffer, offset);
		offset += buffer.length;
	}
	return merged;
}
function parseEnvelope(env) {
	let buffer = typeof env === "string" ? encodeUTF8(env) : env;
	function readBinary(length) {
		const bin = buffer.subarray(0, length);
		buffer = buffer.subarray(length + 1);
		return bin;
	}
	function readJson() {
		let i = buffer.indexOf(10);
		if (i < 0) i = buffer.length;
		return JSON.parse(decodeUTF8(readBinary(i)));
	}
	const envelopeHeader = readJson();
	const items = [];
	while (buffer.length) {
		const itemHeader = readJson();
		const binaryLength = typeof itemHeader.length === "number" ? itemHeader.length : void 0;
		items.push([itemHeader, binaryLength ? readBinary(binaryLength) : readJson()]);
	}
	return [envelopeHeader, items];
}
function createSpanEnvelopeItem(spanJson) {
	return [{ type: "span" }, spanJson];
}
function createAttachmentEnvelopeItem(attachment) {
	const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data) : attachment.data;
	return [{
		type: "attachment",
		length: buffer.length,
		filename: attachment.filename,
		content_type: attachment.contentType,
		attachment_type: attachment.attachmentType
	}, buffer];
}
var DATA_CATEGORY_OVERRIDES = {
	sessions: "session",
	event: "error",
	client_report: "internal",
	user_report: "default",
	profile_chunk: "profile",
	replay_event: "replay",
	replay_recording: "replay",
	check_in: "monitor",
	raw_security: "security",
	log: "log_item",
	trace_metric: "metric"
};
function _isOverriddenType(type) {
	return type in DATA_CATEGORY_OVERRIDES;
}
function envelopeItemTypeToDataCategory(type) {
	return _isOverriddenType(type) ? DATA_CATEGORY_OVERRIDES[type] : type;
}
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
	if (!metadataOrEvent?.sdk) return;
	const { name, version } = metadataOrEvent.sdk;
	return {
		name,
		version
	};
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
	const dynamicSamplingContext = event.sdkProcessingMetadata?.dynamicSamplingContext;
	return {
		event_id: event.event_id,
		sent_at: new Date(safeDateNow()).toISOString(),
		...sdkInfo && { sdk: sdkInfo },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) },
		...dynamicSamplingContext && { trace: dynamicSamplingContext }
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/envelope.js
function _enhanceEventWithSdkInfo(event, newSdkInfo) {
	if (!newSdkInfo) return event;
	const eventSdkInfo = event.sdk || {};
	event.sdk = {
		...eventSdkInfo,
		name: eventSdkInfo.name || newSdkInfo.name,
		version: eventSdkInfo.version || newSdkInfo.version,
		integrations: [...event.sdk?.integrations || [], ...newSdkInfo.integrations || []],
		packages: [...event.sdk?.packages || [], ...newSdkInfo.packages || []],
		settings: event.sdk?.settings || newSdkInfo.settings ? {
			...event.sdk?.settings,
			...newSdkInfo.settings
		} : void 0
	};
	return event;
}
function createSessionEnvelope(session, dsn, metadata, tunnel) {
	const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
	return createEnvelope({
		sent_at: new Date(safeDateNow()).toISOString(),
		...sdkInfo && { sdk: sdkInfo },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) }
	}, ["aggregates" in session ? [{ type: "sessions" }, session] : [{ type: "session" }, session.toJSON()]]);
}
function createEventEnvelope(event, dsn, metadata, tunnel) {
	const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
	const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
	_enhanceEventWithSdkInfo(event, metadata?.sdk);
	const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
	delete event.sdkProcessingMetadata;
	return createEnvelope(envelopeHeaders, [[{ type: eventType }, event]]);
}
function createSpanEnvelope(spans, client) {
	function dscHasRequiredProps(dsc2) {
		return !!dsc2.trace_id && !!dsc2.public_key;
	}
	const dsc = getDynamicSamplingContextFromSpan(spans[0]);
	const dsn = client?.getDsn();
	const tunnel = client?.getOptions().tunnel;
	const headers = {
		sent_at: new Date(safeDateNow()).toISOString(),
		...dscHasRequiredProps(dsc) && { trace: dsc },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) }
	};
	const { beforeSendSpan, ignoreSpans } = client?.getOptions() || {};
	const filteredSpans = ignoreSpans?.length ? spans.filter((span) => {
		const json = spanToJSON(span);
		return !shouldIgnoreSpan({
			description: json.description,
			op: json.op,
			attributes: json.data
		}, ignoreSpans);
	}) : spans;
	const droppedSpans = spans.length - filteredSpans.length;
	if (droppedSpans) client?.recordDroppedEvent("before_send", "span", droppedSpans);
	const convertToSpanJSON = beforeSendSpan ? (span) => {
		const spanJson = spanToJSON(span);
		const processedSpan = !isStreamedBeforeSendSpanCallback(beforeSendSpan) ? beforeSendSpan(spanJson) : spanJson;
		if (!processedSpan) {
			showSpanDropWarning();
			return spanJson;
		}
		return processedSpan;
	} : spanToJSON;
	const items = [];
	for (const span of filteredSpans) {
		const spanJson = convertToSpanJSON(span);
		if (spanJson) items.push(createSpanEnvelopeItem(spanJson));
	}
	return createEnvelope(headers, items);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/logSpans.js
function logSpanStart(span) {
	if (!DEBUG_BUILD$3) return;
	const { description = "< unknown name >", op = "< unknown op >", parent_span_id: parentSpanId } = spanToJSON(span);
	const { spanId } = span.spanContext();
	const sampled = spanIsSampled(span);
	const rootSpan = getRootSpan(span);
	const isRootSpan = rootSpan === span;
	const header = `[Tracing] Starting ${sampled ? "sampled" : "unsampled"} ${isRootSpan ? "root " : ""}span`;
	const infoParts = [
		`op: ${op}`,
		`name: ${description}`,
		`ID: ${spanId}`
	];
	if (parentSpanId) infoParts.push(`parent ID: ${parentSpanId}`);
	if (!isRootSpan) {
		const { op: op2, description: description2 } = spanToJSON(rootSpan);
		infoParts.push(`root ID: ${rootSpan.spanContext().spanId}`);
		if (op2) infoParts.push(`root op: ${op2}`);
		if (description2) infoParts.push(`root description: ${description2}`);
	}
	debug.log(`${header}
  ${infoParts.join("\n  ")}`);
}
function logSpanEnd(span) {
	if (!DEBUG_BUILD$3) return;
	const { description = "< unknown name >", op = "< unknown op >" } = spanToJSON(span);
	const { spanId } = span.spanContext();
	const msg = `[Tracing] Finishing "${op}" ${getRootSpan(span) === span ? "root " : ""}span "${description}" with ID ${spanId}`;
	debug.log(msg);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/measurement.js
function setMeasurement(name, value, unit, activeSpan = getActiveSpan()) {
	const rootSpan = activeSpan && getRootSpan(activeSpan);
	if (rootSpan) {
		DEBUG_BUILD$3 && debug.log(`[Measurement] Setting measurement on root span: ${name} = ${value} ${unit}`);
		rootSpan.addEvent(name, {
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: value,
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: unit
		});
	}
}
function timedEventsToMeasurements(events) {
	if (!events || events.length === 0) return;
	const measurements = {};
	events.forEach((event) => {
		const attributes = event.attributes || {};
		const unit = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT];
		const value = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE];
		if (typeof unit === "string" && typeof value === "number") measurements[event.name] = {
			value,
			unit
		};
	});
	return measurements;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/segmentSpanCaptureStrategy.js
function setSegmentSpanCaptureStrategy(strategy) {
	getSentryCarrier(getMainCarrier()).segmentSpanCaptureStrategy = strategy;
}
function getSegmentSpanCaptureStrategy() {
	return getSentryCarrier(getMainCarrier()).segmentSpanCaptureStrategy;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/hasSpanStreamingEnabled.js
function hasSpanStreamingEnabled(client) {
	return client.getOptions().traceLifecycle === "stream";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/sentrySpan.js
var MAX_SPAN_COUNT = 1e3;
var SentrySpan = class {
	/**
	* You should never call the constructor manually, always use `Sentry.startSpan()`
	* or other span methods.
	* @internal
	* @hideconstructor
	* @hidden
	*/
	constructor(spanContext = {}) {
		this._traceId = spanContext.traceId || generateTraceId();
		this._spanId = spanContext.spanId || generateSpanId();
		this._startTime = spanContext.startTimestamp || timestampInSeconds();
		this._links = spanContext.links;
		this._attributes = {};
		this.setAttributes({
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "manual",
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: spanContext.op,
			...spanContext.attributes
		});
		this._name = spanContext.name;
		if (spanContext.parentSpanId) this._parentSpanId = spanContext.parentSpanId;
		if ("sampled" in spanContext) this._sampled = spanContext.sampled;
		if (spanContext.endTimestamp) this._endTime = spanContext.endTimestamp;
		this._events = [];
		this._isStandaloneSpan = spanContext.isStandalone;
		if (this._endTime) this._onSpanEnded();
	}
	/** @inheritDoc */
	addLink(link) {
		if (this._frozen) return this;
		if (this._links) this._links.push(link);
		else this._links = [link];
		return this;
	}
	/** @inheritDoc */
	addLinks(links) {
		if (this._frozen) return this;
		if (this._links) this._links.push(...links);
		else this._links = links;
		return this;
	}
	/**
	* This should generally not be used,
	* but it is needed for being compliant with the OTEL Span interface.
	*
	* @hidden
	* @internal
	*/
	recordException(_exception, _time) {}
	/** @inheritdoc */
	spanContext() {
		const { _spanId: spanId, _traceId: traceId, _sampled: sampled } = this;
		return {
			spanId,
			traceId,
			traceFlags: sampled ? 1 : 0
		};
	}
	/** @inheritdoc */
	setAttribute(key, value) {
		if (this._frozen) return this;
		if (value === void 0) delete this._attributes[key];
		else this._attributes[key] = value;
		if (key === "sentry.source" && value !== void 0 && spanShouldInferOtelSource(this)) markSpanSourceAsExplicit(this);
		return this;
	}
	/** @inheritdoc */
	setAttributes(attributes) {
		Object.keys(attributes).forEach((key) => this.setAttribute(key, attributes[key]));
		return this;
	}
	/**
	* This should generally not be used,
	* but we need it for browser tracing where we want to adjust the start time afterwards.
	* USE THIS WITH CAUTION!
	*
	* @hidden
	* @internal
	*/
	updateStartTime(timeInput) {
		if (this._frozen) return;
		this._startTime = spanTimeInputToSeconds(timeInput);
	}
	/**
	* @inheritDoc
	*/
	setStatus(value) {
		if (this._frozen) return this;
		this._status = value;
		return this;
	}
	/**
	* @inheritDoc
	*/
	updateName(name) {
		if (this._frozen) return this;
		this._name = name;
		if (!spanShouldInferOtelSource(this)) this.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "custom");
		return this;
	}
	/** @inheritdoc */
	end(endTimestamp) {
		if (this._endTime) {
			this._frozen = spanIsTracerProviderSpan(this);
			return;
		}
		this._endTime = spanTimeInputToSeconds(endTimestamp);
		logSpanEnd(this);
		this._onSpanEnded();
		this._frozen = spanIsTracerProviderSpan(this);
	}
	/**
	* Get JSON representation of this span.
	*
	* @hidden
	* @internal This method is purely for internal purposes and should not be used outside
	* of SDK code. If you need to get a JSON representation of a span,
	* use `spanToJSON(span)` instead.
	*/
	getSpanJSON() {
		return {
			data: this._attributes,
			description: this._name,
			op: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
			parent_span_id: this._parentSpanId,
			span_id: this._spanId,
			start_timestamp: this._startTime,
			status: getStatusMessage(this._status),
			timestamp: this._endTime,
			trace_id: this._traceId,
			origin: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
			profile_id: this._attributes[SEMANTIC_ATTRIBUTE_PROFILE_ID],
			exclusive_time: this._attributes[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
			measurements: timedEventsToMeasurements(this._events),
			is_segment: this._isStandaloneSpan && getRootSpan(this) === this || void 0,
			segment_id: this._isStandaloneSpan ? getRootSpan(this).spanContext().spanId : void 0,
			links: convertSpanLinksForEnvelope(this._links)
		};
	}
	/**
	* Get {@link StreamedSpanJSON} representation of this span.
	*
	* @hidden
	* @internal This method is purely for internal purposes and should not be used outside
	* of SDK code. If you need to get a JSON representation of a span,
	* use `spanToStreamedSpanJSON(span)` instead.
	*/
	getStreamedSpanJSON() {
		return {
			name: this._name ?? "",
			span_id: this._spanId,
			trace_id: this._traceId,
			parent_span_id: this._parentSpanId,
			start_timestamp: this._startTime,
			end_timestamp: this._endTime ?? this._startTime,
			is_segment: this._isStandaloneSpan || this === getRootSpan(this),
			status: getSimpleStatus(this._status),
			attributes: addStatusMessageAttribute(this._attributes, this._status),
			links: getStreamedSpanLinks(this._links)
		};
	}
	/** @inheritdoc */
	isRecording() {
		return !this._endTime && !!this._sampled;
	}
	/**
	* @inheritdoc
	*/
	addEvent(name, attributesOrStartTime, startTime) {
		if (this._frozen) return this;
		DEBUG_BUILD$3 && debug.log("[Tracing] Adding an event to span:", name);
		const time = isSpanTimeInput(attributesOrStartTime) ? attributesOrStartTime : startTime || timestampInSeconds();
		const attributes = isSpanTimeInput(attributesOrStartTime) ? {} : attributesOrStartTime || {};
		const event = {
			name,
			time: spanTimeInputToSeconds(time),
			attributes
		};
		this._events.push(event);
		return this;
	}
	/**
	* This method should generally not be used,
	* but for now we need a way to publicly check if the `_isStandaloneSpan` flag is set.
	* USE THIS WITH CAUTION!
	* @internal
	* @hidden
	* @experimental
	*/
	isStandaloneSpan() {
		return !!this._isStandaloneSpan;
	}
	/** Emit `spanEnd` when the span is ended. */
	_onSpanEnded() {
		const client = getClient();
		if (client) {
			client.emit("spanEnd", this);
			if (!this._isStandaloneSpan) client.emit("afterSpanEnd", this);
		}
		const rootSpan = getRootSpan(this);
		const isSegmentSpan = this._isStandaloneSpan || this === rootSpan;
		if (this._isStandaloneSpan) {
			if (this._sampled) sendSpanEnvelope(createSpanEnvelope([this], client));
			else {
				DEBUG_BUILD$3 && debug.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled.");
				if (client) client.recordDroppedEvent("sample_rate", "span");
			}
			return;
		}
		if (!isSegmentSpan) {
			const strategy2 = getSegmentSpanCaptureStrategy();
			if (strategy2) {
				const scope2 = getCapturedScopesOnSpan(this).scope || getCurrentScope();
				strategy2.onChildSpanEnded(this, rootSpan, (options) => this._convertSpanToTransaction(options), scope2);
			}
			return;
		}
		if (client && hasSpanStreamingEnabled(client)) {
			client.emit("afterSegmentSpanEnd", this);
			return;
		}
		const scope = getCapturedScopesOnSpan(this).scope || getCurrentScope();
		const strategy = getSegmentSpanCaptureStrategy();
		if (strategy) strategy.onSegmentSpanEnded((options) => this._convertSpanToTransaction(options), scope);
		else {
			const transactionEvent = this._convertSpanToTransaction();
			if (transactionEvent) scope.captureEvent(transactionEvent);
		}
	}
	/**
	* Finish the transaction & prepare the event to send to Sentry.
	*/
	_convertSpanToTransaction(options = {}) {
		if (!isFullFinishedSpan(spanToJSON(this))) return;
		if (!this._name) {
			DEBUG_BUILD$3 && debug.warn("Transaction has no name, falling back to `<unlabeled transaction>`.");
			this._name = "<unlabeled transaction>";
		}
		const { scope: capturedSpanScope, isolationScope: capturedSpanIsolationScope } = getCapturedScopesOnSpan(this);
		const normalizedRequest = capturedSpanScope?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
		if (this._sampled !== true) return;
		options.onSpanCaptured?.(this);
		const spans = [];
		for (const descendant of getSpanDescendants(this)) {
			if (descendant === this || isStandaloneSpan(descendant) || options.isSpanAlreadyCaptured?.(descendant)) continue;
			const spanJSON = spanToJSON(descendant);
			if (!isFullFinishedSpan(spanJSON)) continue;
			options.onSpanCaptured?.(descendant);
			spans.push(spanJSON);
		}
		const source = this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		delete this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
		let hasGenAiSpans = false;
		spans.forEach((span) => {
			delete span.data[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
			if (span.op?.startsWith("gen_ai.")) hasGenAiSpans = true;
		});
		const transaction = {
			contexts: { trace: spanToTransactionTraceContext(this) },
			spans: spans.length > MAX_SPAN_COUNT ? spans.sort((a, b) => a.start_timestamp - b.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans,
			start_timestamp: this._startTime,
			timestamp: this._endTime,
			transaction: this._name,
			type: "transaction",
			sdkProcessingMetadata: {
				capturedSpanScope,
				capturedSpanIsolationScope,
				dynamicSamplingContext: getDynamicSamplingContextFromSpan(this),
				hasGenAiSpans
			},
			request: normalizedRequest,
			...source && { transaction_info: { source } }
		};
		const measurements = timedEventsToMeasurements(this._events);
		if (measurements && Object.keys(measurements).length) {
			DEBUG_BUILD$3 && debug.log("[Measurements] Adding measurements to transaction event", JSON.stringify(measurements, void 0, 2));
			transaction.measurements = measurements;
		}
		return transaction;
	}
};
function isSpanTimeInput(value) {
	return value && typeof value === "number" || value instanceof Date || Array.isArray(value);
}
function isFullFinishedSpan(input) {
	return !!input.start_timestamp && !!input.timestamp && !!input.span_id && !!input.trace_id;
}
function isStandaloneSpan(span) {
	return span instanceof SentrySpan && span.isStandaloneSpan();
}
function sendSpanEnvelope(envelope) {
	const client = getClient();
	if (!client) return;
	const spanItems = envelope[1];
	if (!spanItems || spanItems.length === 0) {
		client.recordDroppedEvent("before_send", "span");
		return;
	}
	client.sendEnvelope(envelope);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/handleCallbackErrors.js
function handleCallbackErrors(fn, onError, onFinally = () => {}, onSuccess = () => {}) {
	let maybePromiseResult;
	try {
		maybePromiseResult = fn();
	} catch (e) {
		onError(e);
		onFinally();
		throw e;
	}
	return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally, onSuccess);
}
function maybeHandlePromiseRejection(value, onError, onFinally, onSuccess) {
	if (isThenable(value)) return chainAndCopyPromiseLike(value, (result) => {
		onFinally();
		onSuccess(result);
	}, (err) => {
		onError(err);
		onFinally();
	});
	onFinally();
	onSuccess(value);
	return value;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/sampling.js
function sampleSpan(options, samplingContext, sampleRand) {
	if (!hasSpansEnabled(options)) return [false];
	let localSampleRateWasApplied = void 0;
	let sampleRate;
	if (typeof options.tracesSampler === "function") {
		sampleRate = options.tracesSampler({
			...samplingContext,
			inheritOrSampleWith: (fallbackSampleRate) => {
				if (typeof samplingContext.parentSampleRate === "number") return samplingContext.parentSampleRate;
				if (typeof samplingContext.parentSampled === "boolean") return Number(samplingContext.parentSampled);
				return fallbackSampleRate;
			}
		});
		localSampleRateWasApplied = true;
	} else if (samplingContext.parentSampled !== void 0) sampleRate = samplingContext.parentSampled;
	else if (typeof options.tracesSampleRate !== "undefined") {
		sampleRate = options.tracesSampleRate;
		localSampleRateWasApplied = true;
	}
	const parsedSampleRate = parseSampleRate(sampleRate);
	if (parsedSampleRate === void 0) {
		DEBUG_BUILD$3 && debug.warn(`[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
		return [false];
	}
	if (!parsedSampleRate) {
		DEBUG_BUILD$3 && debug.log(`[Tracing] Discarding transaction because ${typeof options.tracesSampler === "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`);
		return [
			false,
			parsedSampleRate,
			localSampleRateWasApplied
		];
	}
	const shouldSample = sampleRand < parsedSampleRate;
	if (!shouldSample) DEBUG_BUILD$3 && debug.log(`[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(sampleRate)})`);
	return [
		shouldSample,
		parsedSampleRate,
		localSampleRateWasApplied
	];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/trace.js
var SUPPRESS_TRACING_KEY = "__SENTRY_SUPPRESS_TRACING__";
function startSpan(options, callback) {
	const acs = getAcs();
	if (acs.startSpan) return acs.startSpan(options, callback);
	const spanArguments = parseSentrySpanArguments(options);
	const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
	const customForkedScope = customScope?.clone();
	return withScope(customForkedScope, () => {
		return getActiveSpanWrapper(customParentSpan)(() => {
			const scope = getCurrentScope();
			const parentSpan = getParentSpan(scope, customParentSpan);
			const client = getClient();
			const activeSpan = options.onlyIfParent && !parentSpan ? startMissingRequiredParentSpan(scope, client) : createChildOrRootSpan({
				parentSpan,
				spanArguments,
				forceTransaction,
				scope
			});
			if (!spanIsIgnored(activeSpan) || !parentSpan) _setSpanForScope(scope, activeSpan);
			return handleCallbackErrors(() => callback(activeSpan), () => {
				const { status } = spanToJSON(activeSpan);
				if (activeSpan.isRecording() && (!status || status === "ok")) activeSpan.setStatus({
					code: 2,
					message: "internal_error"
				});
			}, () => {
				activeSpan.end();
			});
		});
	});
}
function startSpanManual(options, callback) {
	const acs = getAcs();
	if (acs.startSpanManual) return acs.startSpanManual(options, callback);
	const spanArguments = parseSentrySpanArguments(options);
	const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
	const customForkedScope = customScope?.clone();
	return withScope(customForkedScope, () => {
		return getActiveSpanWrapper(customParentSpan)(() => {
			const scope = getCurrentScope();
			const parentSpan = getParentSpan(scope, customParentSpan);
			const activeSpan = options.onlyIfParent && !parentSpan ? startMissingRequiredParentSpan(scope, getClient()) : createChildOrRootSpan({
				parentSpan,
				spanArguments,
				forceTransaction,
				scope
			});
			if (!spanIsIgnored(activeSpan) || !parentSpan) _setSpanForScope(scope, activeSpan);
			return handleCallbackErrors(() => callback(activeSpan, () => activeSpan.end()), () => {
				const { status } = spanToJSON(activeSpan);
				if (activeSpan.isRecording() && (!status || status === "ok")) activeSpan.setStatus({
					code: 2,
					message: "internal_error"
				});
			});
		});
	});
}
function startInactiveSpan(options) {
	const acs = getAcs();
	if (acs.startInactiveSpan) return acs.startInactiveSpan(options);
	return _startInactiveSpanImpl(options);
}
function _INTERNAL_startInactiveSpan(options) {
	return _startInactiveSpanImpl(options);
}
function _startInactiveSpanImpl(options) {
	const spanArguments = parseSentrySpanArguments(options);
	const { forceTransaction, parentSpan: customParentSpan } = options;
	return (options.scope ? (callback) => withScope(options.scope, callback) : customParentSpan !== void 0 ? (callback) => withActiveSpan(customParentSpan, callback) : (callback) => callback())(() => {
		const scope = getCurrentScope();
		const parentSpan = getParentSpan(scope, customParentSpan);
		const client = getClient();
		if (options.onlyIfParent && !parentSpan) return startMissingRequiredParentSpan(scope, client);
		return createChildOrRootSpan({
			parentSpan,
			spanArguments,
			forceTransaction,
			scope
		});
	});
}
var continueTrace = (options, callback) => {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (acs.continueTrace) return acs.continueTrace(options, callback);
	const { sentryTrace, baggage } = options;
	const client = getClient();
	const incomingDsc = baggageHeaderToDynamicSamplingContext(baggage);
	if (client && !shouldContinueTrace(client, incomingDsc?.org_id)) return startNewTrace(callback);
	return withScope((scope) => {
		const propagationContext = propagationContextFromHeaders(sentryTrace, baggage);
		scope.setPropagationContext(propagationContext);
		_setSpanForScope(scope, void 0);
		return callback();
	});
};
function withActiveSpan(span, callback) {
	const acs = getAcs();
	if (acs.withActiveSpan) return acs.withActiveSpan(span, callback);
	return withScope((scope) => {
		_setSpanForScope(scope, span || void 0);
		return callback(scope);
	});
}
function suppressTracing(callback) {
	const acs = getAcs();
	if (acs.suppressTracing) return acs.suppressTracing(callback);
	return withScope((scope) => {
		scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: true });
		const res = callback();
		scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: void 0 });
		return res;
	});
}
function isTracingSuppressed(scope = getCurrentScope()) {
	const acs = getAcs();
	if (acs.isTracingSuppressed) return acs.isTracingSuppressed(scope);
	return scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] === true;
}
function startNewTrace(callback) {
	const acs = getAcs();
	if (acs.startNewTrace) return acs.startNewTrace(callback);
	return withScope((scope) => {
		scope.setPropagationContext({
			traceId: generateTraceId(),
			sampleRand: safeMathRandom()
		});
		DEBUG_BUILD$3 && debug.log(`Starting a new trace with id ${scope.getPropagationContext().traceId}`);
		return withActiveSpan(null, callback);
	});
}
function startMissingRequiredParentSpan(scope, client) {
	client?.recordDroppedEvent("no_parent_span", "span");
	const span = new SentryNonRecordingSpan({ traceId: scope.getPropagationContext().traceId });
	setCapturedScopesOnSpan(span, scope, getIsolationScope());
	return span;
}
function createChildOrRootSpan({ parentSpan, spanArguments, forceTransaction, scope }) {
	const isolationScope = getIsolationScope();
	if (!hasSpansEnabled()) {
		const scopePropagationContext = {
			...isolationScope.getPropagationContext(),
			...scope.getPropagationContext()
		};
		const span2 = new SentryNonRecordingSpan({ traceId: parentSpan ? parentSpan.spanContext().traceId : scopePropagationContext.traceId });
		if (parentSpan && !forceTransaction) addChildSpanToSpan(parentSpan, span2);
		setCapturedScopesOnSpan(span2, scope, isolationScope);
		return span2;
	}
	const client = getClient();
	if (_shouldIgnoreStreamedSpan(client, spanArguments)) {
		if (!isTracingSuppressed(scope)) client?.recordDroppedEvent("ignored", "span");
		const ignoredSpan = new SentryNonRecordingSpan({
			dropReason: "ignored",
			traceId: parentSpan?.spanContext().traceId ?? scope.getPropagationContext().traceId
		});
		if (parentSpan && !forceTransaction) addChildSpanToSpan(parentSpan, ignoredSpan);
		setCapturedScopesOnSpan(ignoredSpan, scope, isolationScope);
		return ignoredSpan;
	}
	let span;
	if (parentSpan && !forceTransaction) {
		span = _startChildSpan(parentSpan, scope, spanArguments, isolationScope);
		addChildSpanToSpan(parentSpan, span);
	} else if (parentSpan) {
		const dsc = getDynamicSamplingContextFromSpan(parentSpan);
		const { traceId, spanId: parentSpanId } = parentSpan.spanContext();
		const parentSampled = spanIsSampled(parentSpan);
		span = _startRootSpan({
			traceId,
			parentSpanId,
			...spanArguments
		}, scope, isolationScope, parentSampled);
		freezeDscOnSpan(span, dsc);
	} else {
		const { traceId, dsc, parentSpanId, sampled: parentSampled } = {
			...isolationScope.getPropagationContext(),
			...scope.getPropagationContext()
		};
		span = _startRootSpan({
			traceId,
			parentSpanId,
			...spanArguments
		}, scope, isolationScope, parentSampled);
		if (dsc) freezeDscOnSpan(span, dsc);
	}
	logSpanStart(span);
	return span;
}
function parseSentrySpanArguments(options) {
	const initialCtx = {
		isStandalone: (options.experimental || {}).standalone,
		...options
	};
	if (options.startTime) {
		const ctx = { ...initialCtx };
		ctx.startTimestamp = spanTimeInputToSeconds(options.startTime);
		delete ctx.startTime;
		return ctx;
	}
	return initialCtx;
}
function getAcs() {
	return getAsyncContextStrategy(getMainCarrier());
}
function _startRootSpan(spanArguments, scope, isolationScope, parentSampled) {
	const client = getClient();
	const options = client?.getOptions() || {};
	const { name = "" } = spanArguments;
	const mutableSpanSamplingData = {
		spanAttributes: { ...spanArguments.attributes },
		spanName: name,
		parentSampled
	};
	client?.emit("beforeSampling", mutableSpanSamplingData, { decision: false });
	const finalParentSampled = mutableSpanSamplingData.parentSampled ?? parentSampled;
	const finalAttributes = mutableSpanSamplingData.spanAttributes;
	const currentPropagationContext = scope.getPropagationContext();
	const _isTracingSuppressed = isTracingSuppressed(scope);
	const [sampled, sampleRate, localSampleRateWasApplied] = _isTracingSuppressed ? [false] : sampleSpan(options, {
		name,
		parentSampled: finalParentSampled,
		attributes: finalAttributes,
		normalizedRequest: isolationScope.getScopeData().sdkProcessingMetadata.normalizedRequest,
		parentSampleRate: parseSampleRate(currentPropagationContext.dsc?.sample_rate)
	}, currentPropagationContext.sampleRand);
	const rootSpan = new SentrySpan({
		...spanArguments,
		attributes: {
			[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom",
			[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: sampleRate !== void 0 && localSampleRateWasApplied ? sampleRate : void 0,
			...finalAttributes
		},
		sampled
	});
	if (!sampled && client && !_isTracingSuppressed) {
		DEBUG_BUILD$3 && debug.log("[Tracing] Discarding root span because its trace was not chosen to be sampled.");
		client.recordDroppedEvent("sample_rate", hasSpanStreamingEnabled(client) ? "span" : "transaction");
	}
	setCapturedScopesOnSpan(rootSpan, scope, isolationScope);
	if (client) client.emit("spanStart", rootSpan);
	return rootSpan;
}
function _startChildSpan(parentSpan, scope, spanArguments, isolationScope) {
	const { spanId, traceId } = parentSpan.spanContext();
	const _isTracingSuppressed = isTracingSuppressed(scope);
	const sampled = _isTracingSuppressed ? false : spanIsSampled(parentSpan);
	const childSpan = sampled ? new SentrySpan({
		...spanArguments,
		parentSpanId: spanId,
		traceId,
		sampled
	}) : new SentryNonRecordingSpan({ traceId });
	addChildSpanToSpan(parentSpan, childSpan);
	setCapturedScopesOnSpan(childSpan, scope, isolationScope);
	const client = getClient();
	if (!client) return childSpan;
	if (hasSpanStreamingEnabled(client) && spanIsNonRecordingSpan(childSpan)) {
		if (spanIsNonRecordingSpan(parentSpan) && parentSpan.dropReason) {
			childSpan.dropReason = parentSpan.dropReason;
			client.recordDroppedEvent(parentSpan.dropReason, "span");
		} else if (!_isTracingSuppressed) {
			childSpan.dropReason = "sample_rate";
			client.recordDroppedEvent("sample_rate", "span");
		}
	}
	client.emit("spanStart", childSpan);
	if (spanArguments.endTimestamp) {
		client.emit("spanEnd", childSpan);
		client.emit("afterSpanEnd", childSpan);
	}
	return childSpan;
}
function getParentSpan(scope, customParentSpan) {
	if (customParentSpan) return customParentSpan;
	if (customParentSpan === null) return;
	const span = _getSpanForScope(scope);
	if (!span) return;
	const client = getClient();
	if ((client ? client.getOptions() : {}).parentSpanIsAlwaysRootSpan) return getRootSpan(span);
	return span;
}
function getActiveSpanWrapper(parentSpan) {
	return parentSpan !== void 0 ? (callback) => {
		return withActiveSpan(parentSpan, callback);
	} : (callback) => callback();
}
function _shouldIgnoreStreamedSpan(client, spanArguments) {
	const ignoreSpans = client?.getOptions().ignoreSpans;
	if (!client || !hasSpanStreamingEnabled(client) || !ignoreSpans?.length) return false;
	return shouldIgnoreSpan({
		description: spanArguments.name || "",
		op: spanArguments.attributes?.["sentry.op"] || spanArguments.op,
		attributes: spanArguments.attributes
	}, ignoreSpans);
}
function spanIsIgnored(span) {
	return spanIsNonRecordingSpan(span) && span.dropReason === "ignored";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/idleSpan.js
var TRACING_DEFAULTS = {
	idleTimeout: 1e3,
	finalTimeout: 3e4,
	childSpanTimeout: 15e3
};
var FINISH_REASON_HEARTBEAT_FAILED = "heartbeatFailed";
var FINISH_REASON_IDLE_TIMEOUT = "idleTimeout";
var FINISH_REASON_FINAL_TIMEOUT = "finalTimeout";
var FINISH_REASON_EXTERNAL_FINISH = "externalFinish";
function startIdleSpan(startSpanOptions, options = {}) {
	const activities = /* @__PURE__ */ new Map();
	let _finished = false;
	let _idleTimeoutID;
	let _finishReason = FINISH_REASON_EXTERNAL_FINISH;
	let _autoFinishAllowed = !options.disableAutoFinish;
	const _cleanupHooks = [];
	const { idleTimeout = TRACING_DEFAULTS.idleTimeout, finalTimeout = TRACING_DEFAULTS.finalTimeout, childSpanTimeout = TRACING_DEFAULTS.childSpanTimeout, beforeSpanEnd, trimIdleSpanEndTimestamp = true } = options;
	const client = getClient();
	const scope = getCurrentScope();
	if (!client || !hasSpansEnabled()) {
		const span2 = new SentryNonRecordingSpan({ traceId: scope.getPropagationContext().traceId });
		setCapturedScopesOnSpan(span2, scope, getIsolationScope());
		return span2;
	}
	const previousActiveSpan = getActiveSpan();
	const span = _startIdleSpan(startSpanOptions);
	span.end = new Proxy(span.end, { apply(target, thisArg, args) {
		if (beforeSpanEnd) beforeSpanEnd(span);
		if (spanIsNonRecordingSpan(thisArg)) return;
		const [definedEndTimestamp, ...rest] = args;
		const spanEndTimestamp = spanTimeInputToSeconds(definedEndTimestamp || timestampInSeconds());
		const spans = getSpanDescendants(span).filter((child) => child !== span);
		const spanJson = spanToJSON(span);
		if (!spans.length || !trimIdleSpanEndTimestamp) {
			onIdleSpanEnded(spanEndTimestamp);
			return Reflect.apply(target, thisArg, [spanEndTimestamp, ...rest]);
		}
		const ignoreSpans = client.getOptions().ignoreSpans;
		const latestSpanEndTimestamp = spans?.reduce((acc, current) => {
			const currentSpanJson = spanToJSON(current);
			if (!currentSpanJson.timestamp) return acc;
			if (ignoreSpans && shouldIgnoreSpan({
				description: currentSpanJson.description,
				op: currentSpanJson.op,
				attributes: currentSpanJson.data
			}, ignoreSpans)) return acc;
			return acc ? Math.max(acc, currentSpanJson.timestamp) : currentSpanJson.timestamp;
		}, void 0);
		const spanStartTimestamp = spanJson.start_timestamp;
		const endTimestamp = Math.min(spanStartTimestamp ? spanStartTimestamp + finalTimeout / 1e3 : Infinity, Math.max(spanStartTimestamp || -Infinity, Math.min(spanEndTimestamp, latestSpanEndTimestamp || Infinity)));
		onIdleSpanEnded(endTimestamp);
		return Reflect.apply(target, thisArg, [endTimestamp, ...rest]);
	} });
	function _cancelIdleTimeout() {
		if (_idleTimeoutID) {
			clearTimeout(_idleTimeoutID);
			_idleTimeoutID = void 0;
		}
	}
	function _restartIdleTimeout(endTimestamp) {
		_cancelIdleTimeout();
		_idleTimeoutID = setTimeout(() => {
			if (!_finished && activities.size === 0 && _autoFinishAllowed) {
				_finishReason = FINISH_REASON_IDLE_TIMEOUT;
				span.end(endTimestamp);
			}
		}, idleTimeout);
	}
	function _restartChildSpanTimeout(endTimestamp) {
		_idleTimeoutID = setTimeout(() => {
			if (!_finished && _autoFinishAllowed) {
				_finishReason = FINISH_REASON_HEARTBEAT_FAILED;
				span.end(endTimestamp);
			}
		}, childSpanTimeout);
	}
	function _pushActivity(spanId) {
		_cancelIdleTimeout();
		activities.set(spanId, true);
		_restartChildSpanTimeout(timestampInSeconds() + childSpanTimeout / 1e3);
	}
	function _popActivity(spanId) {
		if (activities.has(spanId)) activities.delete(spanId);
		if (activities.size === 0) _restartIdleTimeout(timestampInSeconds() + idleTimeout / 1e3);
	}
	function onIdleSpanEnded(endTimestamp) {
		_finished = true;
		activities.clear();
		_cleanupHooks.forEach((cleanup) => cleanup());
		_setSpanForScope(scope, previousActiveSpan);
		const spanJSON = spanToJSON(span);
		const { start_timestamp: startTimestamp } = spanJSON;
		if (!startTimestamp) return;
		if (!spanJSON.data["sentry.idle_span_finish_reason"]) span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, _finishReason);
		const currentStatus = spanJSON.status;
		if (!currentStatus || currentStatus === "unknown") span.setStatus({ code: 1 });
		debug.log(`[Tracing] Idle span "${spanJSON.op}" finished`);
		const childSpans = getSpanDescendants(span).filter((child) => child !== span);
		let discardedSpans = 0;
		childSpans.forEach((childSpan) => {
			if (childSpan.isRecording()) {
				childSpan.setStatus({
					code: 2,
					message: "cancelled"
				});
				childSpan.end(endTimestamp);
				DEBUG_BUILD$3 && debug.log("[Tracing] Cancelling span since span ended early", JSON.stringify(childSpan, void 0, 2));
			}
			const { timestamp: childEndTimestamp = 0, start_timestamp: childStartTimestamp = 0 } = spanToJSON(childSpan);
			const spanStartedBeforeIdleSpanEnd = childStartTimestamp <= endTimestamp;
			const timeoutWithMarginOfError = (finalTimeout + idleTimeout) / 1e3;
			const spanEndedBeforeFinalTimeout = childEndTimestamp - childStartTimestamp <= timeoutWithMarginOfError;
			if (DEBUG_BUILD$3) {
				const stringifiedSpan = JSON.stringify(childSpan, void 0, 2);
				if (!spanStartedBeforeIdleSpanEnd) debug.log("[Tracing] Discarding span since it happened after idle span was finished", stringifiedSpan);
				else if (!spanEndedBeforeFinalTimeout) debug.log("[Tracing] Discarding span since it finished after idle span final timeout", stringifiedSpan);
			}
			if (!spanEndedBeforeFinalTimeout || !spanStartedBeforeIdleSpanEnd) {
				removeChildSpanFromSpan(span, childSpan);
				discardedSpans++;
			}
		});
		if (discardedSpans > 0) span.setAttribute("sentry.idle_span_discarded_spans", discardedSpans);
	}
	_cleanupHooks.push(client.on("spanStart", (startedSpan) => {
		if (_finished || startedSpan === span || !!spanToJSON(startedSpan).timestamp || startedSpan instanceof SentrySpan && startedSpan.isStandaloneSpan()) return;
		if (getSpanDescendants(span).includes(startedSpan)) _pushActivity(startedSpan.spanContext().spanId);
	}));
	_cleanupHooks.push(client.on("spanEnd", (endedSpan) => {
		if (_finished) return;
		_popActivity(endedSpan.spanContext().spanId);
	}));
	_cleanupHooks.push(client.on("idleSpanEnableAutoFinish", (spanToAllowAutoFinish) => {
		if (spanToAllowAutoFinish === span) {
			_autoFinishAllowed = true;
			_restartIdleTimeout();
			if (activities.size) _restartChildSpanTimeout();
		}
	}));
	if (!options.disableAutoFinish) _restartIdleTimeout();
	setTimeout(() => {
		if (!_finished) {
			span.setStatus({
				code: 2,
				message: "deadline_exceeded"
			});
			_finishReason = FINISH_REASON_FINAL_TIMEOUT;
			span.end();
		}
	}, finalTimeout);
	return span;
}
function _startIdleSpan(options) {
	const span = startInactiveSpan(options);
	_setSpanForScope(getCurrentScope(), span);
	DEBUG_BUILD$3 && debug.log("[Tracing] Started span is an idle span");
	return span;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/scopeData.js
function applyScopeDataToEvent(event, data) {
	const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
	applyDataToEvent(event, data);
	if (span) applySpanToEvent(event, span);
	applyFingerprintToEvent(event, fingerprint);
	applyBreadcrumbsToEvent(event, breadcrumbs);
	applySdkMetadataToEvent(event, sdkProcessingMetadata);
}
function mergeScopeData(data, mergeData) {
	const { extra, tags, attributes, user, contexts, level, sdkProcessingMetadata, breadcrumbs, fingerprint, eventProcessors, attachments, propagationContext, transactionName, span } = mergeData;
	mergeAndOverwriteScopeData(data, "extra", extra);
	mergeAndOverwriteScopeData(data, "tags", tags);
	mergeAndOverwriteScopeData(data, "attributes", attributes);
	mergeAndOverwriteScopeData(data, "user", user);
	mergeAndOverwriteScopeData(data, "contexts", contexts);
	data.sdkProcessingMetadata = merge(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
	if (level) data.level = level;
	if (transactionName) data.transactionName = transactionName;
	if (span) data.span = span;
	if (breadcrumbs.length) data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
	if (fingerprint.length) data.fingerprint = [...data.fingerprint, ...fingerprint];
	if (eventProcessors.length) data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
	if (attachments.length) data.attachments = [...data.attachments, ...attachments];
	data.propagationContext = {
		...data.propagationContext,
		...propagationContext
	};
}
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
	data[prop] = merge(data[prop], mergeVal, 1);
}
function getCombinedScopeData(isolationScope, currentScope) {
	const scopeData = getGlobalScope().getScopeData();
	isolationScope && mergeScopeData(scopeData, isolationScope.getScopeData());
	currentScope && mergeScopeData(scopeData, currentScope.getScopeData());
	return scopeData;
}
function applyDataToEvent(event, data) {
	const { extra, tags, user, contexts, level, transactionName } = data;
	if (Object.keys(extra).length) event.extra = {
		...extra,
		...event.extra
	};
	if (Object.keys(tags).length) event.tags = {
		...tags,
		...event.tags
	};
	if (Object.keys(user).length) event.user = {
		...user,
		...event.user
	};
	if (Object.keys(contexts).length) event.contexts = {
		...contexts,
		...event.contexts
	};
	if (level) event.level = level;
	if (transactionName && event.type !== "transaction") event.transaction = transactionName;
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
	const mergedBreadcrumbs = [...event.breadcrumbs || [], ...breadcrumbs];
	event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
	event.sdkProcessingMetadata = {
		...event.sdkProcessingMetadata,
		...sdkProcessingMetadata
	};
}
function applySpanToEvent(event, span) {
	event.contexts = {
		trace: spanToTraceContext(span),
		...event.contexts
	};
	event.sdkProcessingMetadata = {
		dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
		...event.sdkProcessingMetadata
	};
	const transactionName = spanToJSON(getRootSpan(span)).description;
	if (transactionName && !event.transaction && event.type === "transaction") event.transaction = transactionName;
}
function applyFingerprintToEvent(event, fingerprint) {
	event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];
	if (fingerprint) event.fingerprint = event.fingerprint.concat(fingerprint);
	if (!event.fingerprint.length) delete event.fingerprint;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/scopeContextAttributes.js
function scopeContextsToSpanAttributes(contexts) {
	const attrs = {};
	const { response, profile, cloud_resource, culture, state } = contexts;
	if (response) {
		if (response.status_code != null) attrs["http.response.status_code"] = response.status_code;
		if (response.body_size != null) attrs["http.response.body.size"] = response.body_size;
	}
	if (profile) {
		if (profile.profile_id) attrs["sentry.profile_id"] = profile.profile_id;
		if (profile.profiler_id) attrs["sentry.profiler_id"] = profile.profiler_id;
	}
	if (cloud_resource) {
		for (const [key, value] of Object.entries(cloud_resource)) if (value != null) attrs[key] = value;
	}
	if (culture) {
		if (culture.locale) attrs["culture.locale"] = culture.locale;
		if (culture.timezone) attrs["culture.timezone"] = culture.timezone;
	}
	if (state?.state && typeof state.state.type === "string") attrs["state.type"] = state.state.type;
	const angular = contexts["angular"];
	if (angular) {
		const version = angular["version"];
		if (typeof version === "string" || typeof version === "number") attrs["angular.version"] = version;
	}
	const react = contexts["react"];
	if (react) {
		const version = react["version"];
		if (typeof version === "string" || typeof version === "number") attrs["react.version"] = version;
	}
	return attrs;
}
//#endregion
//#region node_modules/@sentry/conventions/dist/attributes.mjs
var fe = "aws.dynamodb.attribute_definitions";
var Se = "aws.dynamodb.consistent_read";
var Ee = "aws.dynamodb.consumed_capacity";
var Te = "aws.dynamodb.count";
var Ie = "aws.dynamodb.exclusive_start_table";
var Oe = "aws.dynamodb.global_secondary_indexes";
var ke = "aws.dynamodb.global_secondary_index_updates";
var Ae = "aws.dynamodb.index_name";
var xe = "aws.dynamodb.item_collection_metrics";
var we = "aws.dynamodb.limit";
var Re = "aws.dynamodb.local_secondary_indexes";
var Ne = "aws.dynamodb.projection";
var Ce = "aws.dynamodb.provisioned_read_capacity";
var Pe = "aws.dynamodb.provisioned_write_capacity";
var De = "aws.dynamodb.scanned_count";
var Le = "aws.dynamodb.scan_forward";
var Ue = "aws.dynamodb.segment";
var Me = "aws.dynamodb.select";
var qe = "aws.dynamodb.table_count";
var Ge = "aws.dynamodb.table_names";
var Ye = "aws.dynamodb.total_segments";
var Fe = "aws.kinesis.stream.name";
var $e = "aws.request.extended_id";
var ii = "aws.request.id";
var ti = "aws.s3.bucket";
var ni = "aws.secretsmanager.secret.arn";
var ri = "aws.sns.topic.arn";
var ai = "aws.step_functions.activity.arn";
var si = "aws.step_functions.state_machine.arn";
var ct = "cloud.region";
var ht = "code.function.name";
var wt = "db.collection.name";
var Nt = "db.name";
var Ct = "db.namespace";
var Pt = "db.operation";
var Dt = "db.operation.batch.size";
var Lt = "db.operation.name";
var Gt = "db.query.text";
var Ht = "db.statement";
var Kt = "db.system";
var jt = "db.system.name";
var Qt = "db.user";
var Gn = "error.type";
var Xn = "faas.execution";
var er = "faas.invoked_name";
var ir = "faas.invoked_provider";
var tr = "faas.invoked_region";
var ar = "faas.trigger";
var qr = "gen_ai.embeddings.input";
var Gr = "gen_ai.function_id";
var Yr = "gen_ai.input.messages";
var Vr = "gen_ai.operation.name";
var Fr = "gen_ai.output.messages";
var jr = "gen_ai.request.available_tools";
var Xr = "gen_ai.request.max_tokens";
var Zr = "gen_ai.request.model";
var ta = "gen_ai.request.stop_sequences";
var na = "gen_ai.request.temperature";
var aa = "gen_ai.request.top_p";
var sa = "gen_ai.response.finish_reasons";
var oa = "gen_ai.response.id";
var la = "gen_ai.response.model";
var pa = "gen_ai.response.streaming";
var ma = "gen_ai.system";
var Ea = "gen_ai.tool.input";
var Ia = "gen_ai.tool.name";
var Oa = "gen_ai.tool.output";
var ka = "gen_ai.tool.type";
var Ra = "gen_ai.usage.input_tokens";
var Pa = "gen_ai.usage.output_tokens";
var Ma = "gen_ai.usage.total_tokens";
var qa = "graphql.document";
var Ga = "graphql.operation.name";
var Ya = "graphql.operation.type";
var Wa = "http.client_ip";
var Ba = "http.flavor";
var za = "http.host";
var Ka = "http.method";
var ns = "http.request.method";
var Ss = "http.response.status_code";
var Ts = "http.route";
var Is = "http.scheme";
var As = "http.status_code";
var xs = "http.target";
var ws = "http.url";
var Rs = "http.user_agent";
var Vs = "koa.name";
var Ws = "koa.type";
var Go = "messaging.batch.message_count";
var Yo = "messaging.destination";
var Wo = "messaging.destination.name";
var zo = "messaging.message.id";
var Qo = "messaging.operation.name";
var Xo = "messaging.operation.type";
var Zo = "messaging.system";
var dl = "network.peer.address";
var ml = "network.peer.port";
var yl = "network.protocol.name";
var _l = "network.protocol.version";
var fl = "net.host.ip";
var Sl = "net.host.name";
var El = "net.host.port";
var Tl = "net.peer.ip";
var Il = "net.peer.name";
var Ol = "net.peer.port";
var Dl = "net.transport";
var Jl = "params";
var fp = "rpc.grpc.status_code";
var Sp = "rpc.method";
var Tp = "rpc.service";
var Ip = "rpc.system";
var tc = "sentry.graphql.operation";
var rc = "sentry.http.prefetch";
var Ec = "sentry.origin";
var Nc = "sentry.sdk.name";
var Cc = "sentry.sdk.version";
var Pc = "sentry.segment.id";
var Lc = "sentry.segment.name";
var Kc = "sentry.trace_lifecycle";
var Xc = "sentry.transaction";
var au = "server.address";
var ou = "server.port";
var lu = "service.name";
var pu = "service.version";
var Yu = "url.full";
var Vu = "url.path";
var Fu = "url.path.parameter";
var Hu = "url.query";
var Ku = "url.scheme";
var ju = "url.template";
var Qu = "user_agent.original";
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/captureSpan.js
function captureSpan(span, client) {
	const spanJSON = spanToStreamedSpanJSON(span);
	const segmentSpan = INTERNAL_getSegmentSpan(span);
	const serializedSegmentSpan = spanToStreamedSpanJSON(segmentSpan);
	const { isolationScope: spanIsolationScope, scope: spanScope } = getCapturedScopesOnSpan(span);
	const finalScopeData = getCombinedScopeData(spanIsolationScope, spanScope);
	applyCommonSpanAttributes(spanJSON, serializedSegmentSpan, client, finalScopeData);
	const spanKind = span.kind;
	client.emit("preprocessSpan", spanJSON, { spanKind });
	if (spanJSON.is_segment) {
		applyScopeToSegmentSpan(spanJSON, finalScopeData);
		applySdkMetadataToSegmentSpan(spanJSON, client);
		client.emit("processSegmentSpan", spanJSON);
	}
	client.emit("processSpan", spanJSON);
	const { beforeSendSpan } = client.getOptions();
	const processedSpan = beforeSendSpan && isStreamedBeforeSendSpanCallback(beforeSendSpan) ? applyBeforeSendSpanCallback(spanJSON, beforeSendSpan) : spanJSON;
	const spanNameSource = processedSpan.attributes?.[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
	if (spanJSON.is_segment && spanNameSource) safeSetSpanJSONAttributes(processedSpan, { ["sentry.segment.name.source"]: spanNameSource });
	return {
		...streamedSpanJsonToSerializedSpan(processedSpan),
		_segmentSpan: segmentSpan
	};
}
function applyScopeToSegmentSpan(segmentSpanJSON, scopeData) {
	safeSetSpanJSONAttributes(segmentSpanJSON, scopeContextsToSpanAttributes(scopeData.contexts));
}
function safeSetSpanJSONAttributes(spanJSON, newAttributes) {
	const originalAttributes = spanJSON.attributes ?? (spanJSON.attributes = {});
	Object.entries(newAttributes).forEach(([key, value]) => {
		if (value != null && !(key in originalAttributes)) originalAttributes[key] = value;
	});
}
function applySdkMetadataToSegmentSpan(segmentSpanJSON, client) {
	const integrationNames = client.getIntegrationNames();
	if (!integrationNames.length) return;
	safeSetSpanJSONAttributes(segmentSpanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS]: integrationNames });
}
function applyCommonSpanAttributes(spanJSON, serializedSegmentSpan, client, scopeData) {
	const sdk = client.getSdkMetadata();
	const { release, environment } = client.getOptions();
	safeSetSpanJSONAttributes(spanJSON, {
		[Kc]: "stream",
		[Lc]: serializedSegmentSpan.name,
		[Pc]: serializedSegmentSpan.span_id,
		[Nc]: sdk?.sdk?.name,
		[Cc]: sdk?.sdk?.version,
		[SEMANTIC_ATTRIBUTE_SENTRY_RELEASE]: release,
		[SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT]: environment || "production",
		[SEMANTIC_ATTRIBUTE_USER_ID]: scopeData.user?.id,
		[SEMANTIC_ATTRIBUTE_USER_EMAIL]: scopeData.user?.email,
		[SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS]: scopeData.user?.ip_address,
		[SEMANTIC_ATTRIBUTE_USER_USERNAME]: scopeData.user?.username,
		...scopeData.attributes
	});
}
function applyBeforeSendSpanCallback(span, beforeSendSpan) {
	const modifedSpan = beforeSendSpan(span);
	if (!modifedSpan) {
		showSpanDropWarning();
		return span;
	}
	return modifedSpan;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/syncpromise.js
var STATE_PENDING = 0;
var STATE_RESOLVED = 1;
var STATE_REJECTED = 2;
function resolvedSyncPromise(value) {
	return new SyncPromise((resolve) => {
		resolve(value);
	});
}
function rejectedSyncPromise(reason) {
	return new SyncPromise((_, reject) => {
		reject(reason);
	});
}
var SyncPromise = class SyncPromise {
	constructor(executor) {
		this._state = STATE_PENDING;
		this._handlers = [];
		this._runExecutor(executor);
	}
	/** @inheritdoc */
	then(onfulfilled, onrejected) {
		return new SyncPromise((resolve, reject) => {
			this._handlers.push([
				false,
				(result) => {
					if (!onfulfilled) resolve(result);
					else try {
						resolve(onfulfilled(result));
					} catch (e) {
						reject(e);
					}
				},
				(reason) => {
					if (!onrejected) reject(reason);
					else try {
						resolve(onrejected(reason));
					} catch (e) {
						reject(e);
					}
				}
			]);
			this._executeHandlers();
		});
	}
	/** @inheritdoc */
	catch(onrejected) {
		return this.then((val) => val, onrejected);
	}
	/** @inheritdoc */
	finally(onfinally) {
		return new SyncPromise((resolve, reject) => {
			let val;
			let isRejected;
			return this.then((value) => {
				isRejected = false;
				val = value;
				if (onfinally) onfinally();
			}, (reason) => {
				isRejected = true;
				val = reason;
				if (onfinally) onfinally();
			}).then(() => {
				if (isRejected) {
					reject(val);
					return;
				}
				resolve(val);
			});
		});
	}
	/** Excute the resolve/reject handlers. */
	_executeHandlers() {
		if (this._state === STATE_PENDING) return;
		const cachedHandlers = this._handlers.slice();
		this._handlers = [];
		cachedHandlers.forEach((handler) => {
			if (handler[0]) return;
			if (this._state === STATE_RESOLVED) handler[1](this._value);
			if (this._state === STATE_REJECTED) handler[2](this._value);
			handler[0] = true;
		});
	}
	/** Run the executor for the SyncPromise. */
	_runExecutor(executor) {
		const setResult = (state, value) => {
			if (this._state !== STATE_PENDING) return;
			if (isThenable(value)) {
				value.then(resolve, reject);
				return;
			}
			this._state = state;
			this._value = value;
			this._executeHandlers();
		};
		const resolve = (value) => {
			setResult(STATE_RESOLVED, value);
		};
		const reject = (reason) => {
			setResult(STATE_REJECTED, reason);
		};
		try {
			executor(resolve, reject);
		} catch (e) {
			reject(e);
		}
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/eventProcessors.js
function notifyEventProcessors(processors, event, hint, index = 0) {
	try {
		const result = _notifyEventProcessors(event, hint, processors, index);
		return isThenable(result) ? result : resolvedSyncPromise(result);
	} catch (error) {
		return rejectedSyncPromise(error);
	}
}
function _notifyEventProcessors(event, hint, processors, index) {
	const processor = processors[index];
	if (!event || !processor) return event;
	const result = processor({ ...event }, hint);
	DEBUG_BUILD$3 && result === null && debug.log(`Event processor "${processor.id || "?"}" dropped event`);
	if (isThenable(result)) return result.then((final) => _notifyEventProcessors(final, hint, processors, index + 1));
	return _notifyEventProcessors(result, hint, processors, index + 1);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/debug-ids.js
var parsedStackResults;
var lastSentryKeysCount;
var lastNativeKeysCount;
var cachedFilenameDebugIds;
function getFilenameToDebugIdMap(stackParser) {
	const sentryDebugIdMap = GLOBAL_OBJ._sentryDebugIds;
	const nativeDebugIdMap = GLOBAL_OBJ._debugIds;
	if (!sentryDebugIdMap && !nativeDebugIdMap) return {};
	const sentryDebugIdKeys = sentryDebugIdMap ? Object.keys(sentryDebugIdMap) : [];
	const nativeDebugIdKeys = nativeDebugIdMap ? Object.keys(nativeDebugIdMap) : [];
	if (cachedFilenameDebugIds && sentryDebugIdKeys.length === lastSentryKeysCount && nativeDebugIdKeys.length === lastNativeKeysCount) return cachedFilenameDebugIds;
	lastSentryKeysCount = sentryDebugIdKeys.length;
	lastNativeKeysCount = nativeDebugIdKeys.length;
	cachedFilenameDebugIds = {};
	if (!parsedStackResults) parsedStackResults = {};
	const processDebugIds = (debugIdKeys, debugIdMap) => {
		for (const key of debugIdKeys) {
			const debugId = debugIdMap[key];
			const result = parsedStackResults?.[key];
			if (result && cachedFilenameDebugIds && debugId) {
				cachedFilenameDebugIds[result[0]] = debugId;
				if (parsedStackResults) parsedStackResults[key] = [result[0], debugId];
			} else if (debugId) {
				const parsedStack = stackParser(key);
				for (let i = parsedStack.length - 1; i >= 0; i--) {
					const filename = parsedStack[i]?.filename;
					if (filename && cachedFilenameDebugIds && parsedStackResults) {
						cachedFilenameDebugIds[filename] = debugId;
						parsedStackResults[key] = [filename, debugId];
						break;
					}
				}
			}
		}
	};
	if (sentryDebugIdMap) processDebugIds(sentryDebugIdKeys, sentryDebugIdMap);
	if (nativeDebugIdMap) processDebugIds(nativeDebugIdKeys, nativeDebugIdMap);
	return cachedFilenameDebugIds;
}
function getDebugImagesForResources(stackParser, resource_paths) {
	const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
	if (!filenameDebugIdMap) return [];
	const images = [];
	for (const path of resource_paths) {
		const normalizedPath = normalizeStackTracePath(path);
		if (normalizedPath && filenameDebugIdMap[normalizedPath]) images.push({
			type: "sourcemap",
			code_file: path,
			debug_id: filenameDebugIdMap[normalizedPath]
		});
	}
	return images;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/prepareEvent.js
function prepareEvent(options, event, hint, scope, client, isolationScope) {
	const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = options;
	const prepared = {
		...event,
		event_id: event.event_id || hint.event_id || uuid4(),
		timestamp: event.timestamp || dateTimestampInSeconds()
	};
	const integrations = hint.integrations || options.integrations.map((i) => i.name);
	applyClientOptions(prepared, options);
	applyIntegrationsMetadata(prepared, integrations);
	if (client) client.emit("applyFrameMetadata", event);
	if (event.type === void 0) applyDebugIds(prepared, options.stackParser);
	const finalScope = getFinalScope(scope, hint.captureContext);
	if (hint.mechanism) addExceptionMechanism(prepared, hint.mechanism);
	const clientEventProcessors = client ? client.getEventProcessors() : [];
	const data = getCombinedScopeData(isolationScope, finalScope);
	const attachments = [...hint.attachments || [], ...data.attachments];
	if (attachments.length) hint.attachments = attachments;
	applyScopeDataToEvent(prepared, data);
	const eventProcessors = [...clientEventProcessors, ...data.eventProcessors];
	return (hint.data && hint.data.__sentry__ === true ? resolvedSyncPromise(prepared) : notifyEventProcessors(eventProcessors, prepared, hint)).then((evt) => {
		if (evt) applyDebugMeta(evt);
		if (typeof normalizeDepth === "number" && normalizeDepth > 0) return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
		return evt;
	});
}
function applyClientOptions(event, options) {
	const { environment, release, dist, maxValueLength } = options;
	event.environment = event.environment || environment || "production";
	if (!event.release && release) event.release = release;
	if (!event.dist && dist) event.dist = dist;
	const request = event.request;
	if (request?.url && maxValueLength) request.url = truncate(request.url, maxValueLength);
	if (maxValueLength) event.exception?.values?.forEach((exception) => {
		if (exception.value) exception.value = truncate(exception.value, maxValueLength);
	});
}
function applyDebugIds(event, stackParser) {
	const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
	event.exception?.values?.forEach((exception) => {
		exception.stacktrace?.frames?.forEach((frame) => {
			if (frame.filename) frame.debug_id = filenameDebugIdMap[frame.filename];
		});
	});
}
function applyDebugMeta(event) {
	const filenameDebugIdMap = {};
	event.exception?.values?.forEach((exception) => {
		exception.stacktrace?.frames?.forEach((frame) => {
			if (frame.debug_id) {
				if (frame.abs_path) filenameDebugIdMap[frame.abs_path] = frame.debug_id;
				else if (frame.filename) filenameDebugIdMap[frame.filename] = frame.debug_id;
				delete frame.debug_id;
			}
		});
	});
	if (Object.keys(filenameDebugIdMap).length === 0) return;
	event.debug_meta = event.debug_meta || {};
	event.debug_meta.images = event.debug_meta.images || [];
	const images = event.debug_meta.images;
	Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
		images.push({
			type: "sourcemap",
			code_file: filename,
			debug_id
		});
	});
}
function applyIntegrationsMetadata(event, integrationNames) {
	if (integrationNames.length > 0) {
		event.sdk = event.sdk || {};
		event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
	}
}
function normalizeEvent(event, depth, maxBreadth) {
	if (!event) return null;
	const normalized = {
		...event,
		...event.breadcrumbs && { breadcrumbs: event.breadcrumbs.map((b) => ({
			...b,
			...b.data && { data: normalize(b.data, depth, maxBreadth) }
		})) },
		...event.user && { user: normalize(event.user, depth, maxBreadth) },
		...event.contexts && { contexts: normalize(event.contexts, depth, maxBreadth) },
		...event.extra && { extra: normalize(event.extra, depth, maxBreadth) }
	};
	if (event.contexts?.trace && normalized.contexts) {
		normalized.contexts.trace = event.contexts.trace;
		if (event.contexts.trace.data) normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
	}
	if (event.spans) normalized.spans = event.spans.map((span) => {
		return {
			...span,
			...span.data && { data: normalize(span.data, depth, maxBreadth) }
		};
	});
	if (event.contexts?.flags && normalized.contexts) normalized.contexts.flags = normalize(event.contexts.flags, 3, maxBreadth);
	return normalized;
}
function getFinalScope(scope, captureContext) {
	if (!captureContext) return scope;
	const finalScope = scope ? scope.clone() : new Scope();
	finalScope.update(captureContext);
	return finalScope;
}
function parseEventHintOrCaptureContext(hint) {
	if (!hint) return;
	if (hintIsScopeOrFunction(hint)) return { captureContext: hint };
	if (hintIsScopeContext(hint)) return { captureContext: hint };
	return hint;
}
function hintIsScopeOrFunction(hint) {
	return hint instanceof Scope || typeof hint === "function";
}
var captureContextKeys = [
	"user",
	"level",
	"extra",
	"contexts",
	"tags",
	"fingerprint",
	"propagationContext"
];
function hintIsScopeContext(hint) {
	return Object.keys(hint).some((key) => captureContextKeys.includes(key));
}
//#endregion
//#region node_modules/@sentry/core/build/esm/exports.js
function captureException(exception, hint) {
	return getCurrentScope().captureException(exception, parseEventHintOrCaptureContext(hint));
}
function captureMessage(message, captureContext) {
	const level = typeof captureContext === "string" ? captureContext : void 0;
	const hint = typeof captureContext !== "string" ? { captureContext } : void 0;
	return getCurrentScope().captureMessage(message, level, hint);
}
function captureEvent(event, hint) {
	return getCurrentScope().captureEvent(event, hint);
}
function setContext(name, context) {
	getIsolationScope().setContext(name, context);
}
function setExtras(extras) {
	getIsolationScope().setExtras(extras);
}
function setExtra(key, extra) {
	getIsolationScope().setExtra(key, extra);
}
function setTags(tags) {
	getIsolationScope().setTags(tags);
}
function setTag(key, value) {
	getIsolationScope().setTag(key, value);
}
function setAttributes(attributes) {
	getIsolationScope().setAttributes(attributes);
}
function setAttribute(key, value) {
	getIsolationScope().setAttribute(key, value);
}
function setUser(user) {
	getIsolationScope().setUser(user);
}
function setConversationId(conversationId) {
	getIsolationScope().setConversationId(conversationId);
}
function lastEventId() {
	return getIsolationScope().lastEventId();
}
function captureCheckIn(checkIn, upsertMonitorConfig) {
	const scope = getCurrentScope();
	const client = getClient();
	if (!client) DEBUG_BUILD$3 && debug.warn("Cannot capture check-in. No client defined.");
	else if (!client.captureCheckIn) DEBUG_BUILD$3 && debug.warn("Cannot capture check-in. Client does not support sending check-ins.");
	else return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
	return uuid4();
}
function withMonitor(monitorSlug, callback, upsertMonitorConfig) {
	function runCallback() {
		const checkInId = captureCheckIn({
			monitorSlug,
			status: "in_progress"
		}, upsertMonitorConfig);
		const now = timestampInSeconds();
		function finishCheckIn(status) {
			captureCheckIn({
				monitorSlug,
				status,
				checkInId,
				duration: timestampInSeconds() - now
			});
		}
		let maybePromiseResult;
		try {
			maybePromiseResult = callback();
		} catch (e) {
			finishCheckIn("error");
			throw e;
		}
		if (isThenable(maybePromiseResult)) return maybePromiseResult.then((r) => {
			finishCheckIn("ok");
			return r;
		}, (e) => {
			finishCheckIn("error");
			throw e;
		});
		finishCheckIn("ok");
		return maybePromiseResult;
	}
	return withIsolationScope(() => upsertMonitorConfig?.isolateTrace ? startNewTrace(runCallback) : runCallback());
}
async function flush(timeout) {
	const client = getClient();
	if (client) return client.flush(timeout);
	DEBUG_BUILD$3 && debug.warn("Cannot flush events. No client defined.");
	return Promise.resolve(false);
}
async function close(timeout) {
	const client = getClient();
	if (client) return client.close(timeout);
	DEBUG_BUILD$3 && debug.warn("Cannot flush events and disable SDK. No client defined.");
	return Promise.resolve(false);
}
function isInitialized() {
	return !!getClient();
}
function isEnabled() {
	const client = getClient();
	return client?.getOptions().enabled !== false && !!client?.getTransport();
}
function addEventProcessor(callback) {
	getIsolationScope().addEventProcessor(callback);
}
function startSession(context) {
	const isolationScope = getIsolationScope();
	const { user } = getCombinedScopeData(isolationScope, getCurrentScope());
	const { userAgent } = GLOBAL_OBJ.navigator || {};
	const session = makeSession({
		user,
		...userAgent && { userAgent },
		...context
	});
	const currentSession = isolationScope.getSession();
	if (currentSession?.status === "ok") updateSession(currentSession, { status: "exited" });
	endSession();
	isolationScope.setSession(session);
	return session;
}
function endSession() {
	const isolationScope = getIsolationScope();
	const session = getCurrentScope().getSession() || isolationScope.getSession();
	if (session) closeSession(session);
	_sendSessionUpdate();
	isolationScope.setSession();
}
function _sendSessionUpdate() {
	const isolationScope = getIsolationScope();
	const client = getClient();
	const session = isolationScope.getSession();
	if (session && client) client.captureSession(session);
}
function captureSession(end = false) {
	if (end) {
		endSession();
		return;
	}
	_sendSessionUpdate();
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/timer.js
function safeUnref(timer) {
	if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
	return timer;
}
function getBaseApiEndpoint(dsn) {
	const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
	const port = dsn.port ? `:${dsn.port}` : "";
	return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
}
function _getIngestEndpoint(dsn) {
	return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}
function _encodedAuth(dsn, sdkInfo) {
	const params = { sentry_version: "7" };
	if (dsn.publicKey) params.sentry_key = dsn.publicKey;
	if (sdkInfo) params.sentry_client = `${sdkInfo.name}/${sdkInfo.version}`;
	return new URLSearchParams(params).toString();
}
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
	return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}
function getReportDialogEndpoint(dsnLike, dialogOptions) {
	const dsn = makeDsn(dsnLike);
	if (!dsn) return "";
	const endpoint = `${getBaseApiEndpoint(dsn)}embed/error-page/`;
	let encodedOptions = `dsn=${dsnToString(dsn)}`;
	for (const key in dialogOptions) {
		if (key === "dsn") continue;
		if (key === "onClose") continue;
		if (key === "user") {
			const user = dialogOptions.user;
			if (!user) continue;
			if (user.name) encodedOptions += `&name=${encodeURIComponent(user.name)}`;
			if (user.email) encodedOptions += `&email=${encodeURIComponent(user.email)}`;
		} else encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`;
	}
	return `${endpoint}?${encodedOptions}`;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integration.js
var installedIntegrations = [];
function filterDuplicates(integrations) {
	const integrationsByName = {};
	integrations.forEach((currentInstance) => {
		const { name } = currentInstance;
		const existingInstance = integrationsByName[name];
		if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) return;
		integrationsByName[name] = currentInstance;
	});
	return Object.values(integrationsByName);
}
function getIntegrationsToSetup(options) {
	const defaultIntegrations = options.defaultIntegrations || [];
	const userIntegrations = options.integrations;
	defaultIntegrations.forEach((integration) => {
		integration.isDefaultInstance = true;
	});
	let integrations;
	if (Array.isArray(userIntegrations)) integrations = [...defaultIntegrations, ...userIntegrations];
	else if (typeof userIntegrations === "function") {
		const resolvedUserIntegrations = userIntegrations(defaultIntegrations);
		integrations = Array.isArray(resolvedUserIntegrations) ? resolvedUserIntegrations : [resolvedUserIntegrations];
	} else integrations = defaultIntegrations;
	return filterDuplicates(integrations);
}
function setupIntegrations(client, integrations) {
	const integrationIndex = {};
	integrations.forEach((integration) => {
		if (integration?.beforeSetup) integration.beforeSetup(client);
	});
	integrations.forEach((integration) => {
		if (integration) setupIntegration(client, integration, integrationIndex);
	});
	return integrationIndex;
}
function afterSetupIntegrations(client, integrations) {
	for (const integration of integrations) if (integration?.afterAllSetup) integration.afterAllSetup(client);
}
function setupIntegration(client, integration, integrationIndex) {
	if (integrationIndex[integration.name]) {
		DEBUG_BUILD$3 && debug.log(`Integration skipped because it was already installed: ${integration.name}`);
		return;
	}
	integrationIndex[integration.name] = integration;
	if (!installedIntegrations.includes(integration.name) && typeof integration.setupOnce === "function") {
		integration.setupOnce();
		installedIntegrations.push(integration.name);
	}
	if (integration.setup && typeof integration.setup === "function") integration.setup(client);
	if (typeof integration.preprocessEvent === "function") {
		const callback = integration.preprocessEvent.bind(integration);
		client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
	}
	if (typeof integration.processEvent === "function") {
		const callback = integration.processEvent.bind(integration);
		const processor = Object.assign((event, hint) => callback(event, hint, client), { id: integration.name });
		client.addEventProcessor(processor);
	}
	["processSpan", "processSegmentSpan"].forEach((hook) => {
		const callback = integration[hook];
		if (typeof callback === "function") client.on(hook, (span) => callback.call(integration, span, client));
	});
	DEBUG_BUILD$3 && debug.log(`Integration installed: ${integration.name}`);
}
function addIntegration(integration) {
	const client = getClient();
	if (!client) {
		DEBUG_BUILD$3 && debug.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
		return;
	}
	client.addIntegration(integration);
}
function defineIntegration(fn) {
	return fn;
}
function extendIntegration(integration, extendedIntegration) {
	const wrappedIntegration = {
		...integration,
		...extendedIntegration
	};
	for (const key in extendedIntegration) {
		const baseValue = integration[key];
		const extendedValue = extendedIntegration[key];
		if (typeof baseValue === "function" && typeof extendedValue === "function") wrappedIntegration[key] = new Proxy(baseValue, { apply: (target, thisArg, args) => {
			Reflect.apply(target, thisArg, args);
			return Reflect.apply(extendedValue, thisArg, args);
		} });
	}
	return wrappedIntegration;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/timestampSequence.js
var SEQUENCE_ATTR_KEY = "sentry.timestamp.sequence";
var _sequenceNumber = 0;
var _previousTimestampMs;
function getSequenceAttribute(timestampInSeconds) {
	const nowMs = Math.floor(timestampInSeconds * 1e3);
	if (_previousTimestampMs !== void 0 && nowMs !== _previousTimestampMs) _sequenceNumber = 0;
	const value = _sequenceNumber;
	_sequenceNumber++;
	_previousTimestampMs = nowMs;
	return {
		key: SEQUENCE_ATTR_KEY,
		value: {
			value,
			type: "integer"
		}
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/trace-info.js
function _getTraceInfoFromScope(client, scope) {
	if (!scope) return [void 0, void 0];
	return withScope(scope, () => {
		const span = getActiveSpan();
		const traceContext = span ? spanToTraceContext(span) : getTraceContextFromScope(scope);
		return [span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope), traceContext];
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/constants.js
var SEVERITY_TEXT_TO_SEVERITY_NUMBER = {
	trace: 1,
	debug: 5,
	info: 9,
	warn: 13,
	error: 17,
	fatal: 21
};
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/env.js
function isBrowserBundle() {
	return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
}
function getSDKSource() {
	/*! __SENTRY_SDK_SOURCE__ */
	return "npm";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/node.js
function isNodeEnv() {
	return !isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/isBrowser.js
function isBrowser() {
	return typeof window !== "undefined" && (!isNodeEnv() || isElectronNodeRenderer());
}
function isElectronNodeRenderer() {
	return GLOBAL_OBJ.process?.type === "renderer";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/envelope.js
function createLogContainerEnvelopeItem(items, inferUserData) {
	const inferSetting = inferUserData ? "auto" : "never";
	return [{
		type: "log",
		item_count: items.length,
		content_type: "application/vnd.sentry.items.log+json"
	}, {
		version: 2,
		...isBrowser() && { ingest_settings: {
			infer_ip: inferSetting,
			infer_user_agent: inferSetting
		} },
		items
	}];
}
function createLogEnvelope(logs, metadata, tunnel, dsn, inferUserData) {
	const headers = {};
	if (metadata?.sdk) headers.sdk = {
		name: metadata.sdk.name,
		version: metadata.sdk.version
	};
	if (!!tunnel && !!dsn) headers.dsn = dsnToString(dsn);
	return createEnvelope(headers, [createLogContainerEnvelopeItem(logs, inferUserData)]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/logs/internal.js
var MAX_LOG_BUFFER_SIZE = 100;
function setLogAttribute(logAttributes, key, value, setEvenIfPresent = true) {
	if (value && (!logAttributes[key] || setEvenIfPresent)) logAttributes[key] = value;
}
function _INTERNAL_captureSerializedLog(client, serializedLog) {
	const bufferMap = _getBufferMap$1();
	const logBuffer = _INTERNAL_getLogBuffer(client);
	if (logBuffer === void 0) bufferMap.set(client, [serializedLog]);
	else if (logBuffer.length >= MAX_LOG_BUFFER_SIZE) {
		_INTERNAL_flushLogsBuffer(client, logBuffer);
		bufferMap.set(client, [serializedLog]);
	} else bufferMap.set(client, [...logBuffer, serializedLog]);
}
function _INTERNAL_captureLog(beforeLog, currentScope = getCurrentScope(), captureSerializedLog = _INTERNAL_captureSerializedLog) {
	const client = currentScope?.getClient() ?? getClient();
	if (!client) {
		DEBUG_BUILD$3 && debug.warn("No client available to capture log.");
		return;
	}
	const { release, environment, enableLogs = false, beforeSendLog } = client.getOptions();
	if (!enableLogs) {
		DEBUG_BUILD$3 && debug.warn("logging option not enabled, log will not be captured.");
		return;
	}
	const [, traceContext] = _getTraceInfoFromScope(client, currentScope);
	const processedLogAttributes = { ...beforeLog.attributes };
	const { user: { id, email, username }, attributes: scopeAttributes = {} } = getCombinedScopeData(getIsolationScope(), currentScope);
	setLogAttribute(processedLogAttributes, "user.id", id, false);
	setLogAttribute(processedLogAttributes, "user.email", email, false);
	setLogAttribute(processedLogAttributes, "user.name", username, false);
	setLogAttribute(processedLogAttributes, "sentry.release", release);
	setLogAttribute(processedLogAttributes, "sentry.environment", environment);
	const { name, version } = client.getSdkMetadata()?.sdk ?? {};
	setLogAttribute(processedLogAttributes, "sentry.sdk.name", name);
	setLogAttribute(processedLogAttributes, "sentry.sdk.version", version);
	const replay = client.getIntegrationByName("Replay");
	const replayId = replay?.getReplayId(true);
	setLogAttribute(processedLogAttributes, "sentry.replay_id", replayId);
	if (replayId && replay?.getRecordingMode() === "buffer") setLogAttribute(processedLogAttributes, "sentry._internal.replay_is_buffering", true);
	const beforeLogMessage = beforeLog.message;
	if (isParameterizedString(beforeLogMessage)) {
		const { __sentry_template_string__, __sentry_template_values__ = [] } = beforeLogMessage;
		if (__sentry_template_values__?.length) processedLogAttributes["sentry.message.template"] = __sentry_template_string__;
		__sentry_template_values__.forEach((param, index) => {
			processedLogAttributes[`sentry.message.parameter.${index}`] = param;
		});
	}
	setLogAttribute(processedLogAttributes, "sentry.trace.parent_span_id", _getSpanForScope(currentScope)?.spanContext().spanId);
	const processedLog = {
		...beforeLog,
		attributes: processedLogAttributes
	};
	client.emit("beforeCaptureLog", processedLog);
	const log = beforeSendLog ? consoleSandbox(() => beforeSendLog(processedLog)) : processedLog;
	if (!log) {
		client.recordDroppedEvent("before_send", "log_item", 1);
		DEBUG_BUILD$3 && debug.warn("beforeSendLog returned null, log will not be captured.");
		return;
	}
	const { level, message, attributes: logAttributes = {}, severityNumber } = log;
	const timestamp = timestampInSeconds();
	const sequenceAttr = getSequenceAttribute(timestamp);
	captureSerializedLog(client, {
		timestamp,
		level,
		body: _removeLoneSurrogates(String(message)),
		trace_id: traceContext?.trace_id,
		severity_number: severityNumber ?? SEVERITY_TEXT_TO_SEVERITY_NUMBER[level],
		attributes: sanitizeLogAttributes({
			...serializeAttributes(scopeAttributes),
			...serializeAttributes(logAttributes, true),
			[sequenceAttr.key]: sequenceAttr.value
		})
	});
	client.emit("afterCaptureLog", log);
}
function _INTERNAL_flushLogsBuffer(client, maybeLogBuffer) {
	const logBuffer = maybeLogBuffer ?? _INTERNAL_getLogBuffer(client) ?? [];
	if (logBuffer.length === 0) return;
	const clientOptions = client.getOptions();
	const envelope = createLogEnvelope(logBuffer, clientOptions._metadata, clientOptions.tunnel, client.getDsn(), client.getDataCollectionOptions().userInfo);
	_getBufferMap$1().set(client, []);
	client.emit("flushLogs");
	client.sendEnvelope(envelope);
}
function _INTERNAL_getLogBuffer(client) {
	return _getBufferMap$1().get(client);
}
function _getBufferMap$1() {
	return getGlobalSingleton("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function sanitizeLogAttributes(attributes) {
	const sanitized = {};
	for (const [key, attr] of Object.entries(attributes)) {
		const sanitizedKey = _removeLoneSurrogates(key);
		if (attr.type === "string") sanitized[sanitizedKey] = {
			...attr,
			value: _removeLoneSurrogates(attr.value)
		};
		else sanitized[sanitizedKey] = attr;
	}
	return sanitized;
}
function _removeLoneSurrogates(str) {
	const strObj = Object(str);
	const isWellFormed = strObj["isWellFormed"];
	const toWellFormed = strObj["toWellFormed"];
	if (typeof isWellFormed === "function" && typeof toWellFormed === "function") return isWellFormed.call(str) ? str : toWellFormed.call(str);
	return str;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/metrics/envelope.js
function createMetricContainerEnvelopeItem(items, inferUserData) {
	const inferSetting = inferUserData ? "auto" : "never";
	return [{
		type: "trace_metric",
		item_count: items.length,
		content_type: "application/vnd.sentry.items.trace-metric+json"
	}, {
		version: 2,
		...isBrowser() && { ingest_settings: {
			infer_ip: inferSetting,
			infer_user_agent: inferSetting
		} },
		items
	}];
}
function createMetricEnvelope(metrics, metadata, tunnel, dsn, inferUserData) {
	const headers = {};
	if (metadata?.sdk) headers.sdk = {
		name: metadata.sdk.name,
		version: metadata.sdk.version
	};
	if (!!tunnel && !!dsn) headers.dsn = dsnToString(dsn);
	return createEnvelope(headers, [createMetricContainerEnvelopeItem(metrics, inferUserData)]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/metrics/internal.js
var MAX_METRIC_BUFFER_SIZE = 1e3;
function setMetricAttribute(metricAttributes, key, value, setEvenIfPresent = true) {
	if (value && (setEvenIfPresent || !(key in metricAttributes))) metricAttributes[key] = value;
}
function _INTERNAL_captureSerializedMetric(client, serializedMetric) {
	const bufferMap = _getBufferMap();
	const metricBuffer = _INTERNAL_getMetricBuffer(client);
	if (metricBuffer === void 0) bufferMap.set(client, [serializedMetric]);
	else if (metricBuffer.length >= MAX_METRIC_BUFFER_SIZE) {
		_INTERNAL_flushMetricsBuffer(client, metricBuffer);
		bufferMap.set(client, [serializedMetric]);
	} else bufferMap.set(client, [...metricBuffer, serializedMetric]);
}
function _enrichMetricAttributes(beforeMetric, client, user) {
	const { release, environment } = client.getOptions();
	const processedMetricAttributes = { ...beforeMetric.attributes };
	setMetricAttribute(processedMetricAttributes, "user.id", user.id, false);
	setMetricAttribute(processedMetricAttributes, "user.email", user.email, false);
	setMetricAttribute(processedMetricAttributes, "user.name", user.username, false);
	setMetricAttribute(processedMetricAttributes, "sentry.release", release);
	setMetricAttribute(processedMetricAttributes, "sentry.environment", environment);
	const { name, version } = client.getSdkMetadata()?.sdk ?? {};
	setMetricAttribute(processedMetricAttributes, "sentry.sdk.name", name);
	setMetricAttribute(processedMetricAttributes, "sentry.sdk.version", version);
	const replay = client.getIntegrationByName("Replay");
	const replayId = replay?.getReplayId(true);
	setMetricAttribute(processedMetricAttributes, "sentry.replay_id", replayId);
	if (replayId && replay?.getRecordingMode() === "buffer") setMetricAttribute(processedMetricAttributes, "sentry._internal.replay_is_buffering", true);
	return {
		...beforeMetric,
		attributes: processedMetricAttributes
	};
}
function _buildSerializedMetric(metric, client, currentScope, scopeAttributes) {
	const [, traceContext] = _getTraceInfoFromScope(client, currentScope);
	const span = _getSpanForScope(currentScope);
	const traceId = span ? span.spanContext().traceId : traceContext?.trace_id;
	const spanId = span ? span.spanContext().spanId : void 0;
	const timestamp = timestampInSeconds();
	const sequenceAttr = getSequenceAttribute(timestamp);
	return {
		timestamp,
		trace_id: traceId ?? "",
		span_id: spanId,
		name: metric.name,
		type: metric.type,
		unit: metric.unit,
		value: metric.value,
		attributes: {
			...serializeAttributes(scopeAttributes),
			...serializeAttributes(metric.attributes, "skip-undefined"),
			[sequenceAttr.key]: sequenceAttr.value
		}
	};
}
function _INTERNAL_captureMetric(beforeMetric, options) {
	const currentScope = options?.scope ?? getCurrentScope();
	const captureSerializedMetric = options?.captureSerializedMetric ?? _INTERNAL_captureSerializedMetric;
	const client = currentScope?.getClient() ?? getClient();
	if (!client) {
		DEBUG_BUILD$3 && debug.warn("No client available to capture metric.");
		return;
	}
	const { _experiments, enableMetrics, beforeSendMetric } = client.getOptions();
	if (!(enableMetrics ?? _experiments?.enableMetrics ?? true)) {
		DEBUG_BUILD$3 && debug.warn("metrics option not enabled, metric will not be captured.");
		return;
	}
	const { user, attributes: scopeAttributes } = getCombinedScopeData(getIsolationScope(), currentScope);
	const enrichedMetric = _enrichMetricAttributes(beforeMetric, client, user);
	client.emit("processMetric", enrichedMetric);
	const beforeSendCallback = beforeSendMetric || _experiments?.beforeSendMetric;
	const processedMetric = beforeSendCallback ? beforeSendCallback(enrichedMetric) : enrichedMetric;
	if (!processedMetric) {
		DEBUG_BUILD$3 && debug.log("`beforeSendMetric` returned `null`, will not send metric.");
		return;
	}
	const serializedMetric = _buildSerializedMetric(processedMetric, client, currentScope, scopeAttributes);
	DEBUG_BUILD$3 && debug.log("[Metric]", serializedMetric);
	captureSerializedMetric(client, serializedMetric);
	client.emit("afterCaptureMetric", processedMetric);
}
function _INTERNAL_flushMetricsBuffer(client, maybeMetricBuffer) {
	const metricBuffer = maybeMetricBuffer ?? _INTERNAL_getMetricBuffer(client) ?? [];
	if (metricBuffer.length === 0) return;
	const clientOptions = client.getOptions();
	const envelope = createMetricEnvelope(metricBuffer, clientOptions._metadata, clientOptions.tunnel, client.getDsn(), client.getDataCollectionOptions().userInfo);
	_getBufferMap().set(client, []);
	client.emit("flushMetrics");
	client.sendEnvelope(envelope);
}
function _INTERNAL_getMetricBuffer(client) {
	return _getBufferMap().get(client);
}
function _getBufferMap() {
	return getGlobalSingleton("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/spanJsonToStreamedSpan.js
function spanJsonToSerializedStreamedSpan(span) {
	return streamedSpanJsonToSerializedSpan({
		trace_id: span.trace_id,
		span_id: span.span_id,
		parent_span_id: span.parent_span_id,
		name: span.description || "",
		start_timestamp: span.start_timestamp,
		end_timestamp: span.timestamp || span.start_timestamp,
		status: !span.status || span.status === "ok" || span.status === "cancelled" ? "ok" : "error",
		is_segment: false,
		attributes: { ...span.data },
		links: span.links
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/extractGenAiSpans.js
function extractGenAiSpansFromEvent(event, client) {
	if (event.type !== "transaction" || !event.spans?.length || !event.sdkProcessingMetadata?.hasGenAiSpans || client.getOptions().streamGenAiSpans === false || hasSpanStreamingEnabled(client)) return;
	const genAiSpans = [];
	const remainingSpans = [];
	for (const span of event.spans) if (span.op?.startsWith("gen_ai.")) genAiSpans.push(spanJsonToSerializedStreamedSpan(span));
	else remainingSpans.push(span);
	if (genAiSpans.length === 0) return;
	event.spans = remainingSpans;
	const inferSetting = client.getDataCollectionOptions().userInfo ? "auto" : "never";
	return [{
		type: "span",
		item_count: genAiSpans.length,
		content_type: "application/vnd.sentry.items.span.v2+json"
	}, {
		version: 2,
		...isBrowser() && { ingest_settings: {
			infer_ip: inferSetting,
			infer_user_agent: inferSetting
		} },
		items: genAiSpans
	}];
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/promisebuffer.js
var SENTRY_BUFFER_FULL_ERROR = /* @__PURE__ */ Symbol.for("SentryBufferFullError");
function makePromiseBuffer(limit = 100) {
	const buffer = /* @__PURE__ */ new Set();
	function isReady() {
		return buffer.size < limit;
	}
	function remove(task) {
		buffer.delete(task);
	}
	function add(taskProducer) {
		if (!isReady()) return rejectedSyncPromise(SENTRY_BUFFER_FULL_ERROR);
		const task = taskProducer();
		buffer.add(task);
		task.then(() => remove(task), () => remove(task));
		return task;
	}
	function drain(timeout) {
		if (!buffer.size) return resolvedSyncPromise(true);
		const drainPromise = Promise.allSettled(Array.from(buffer)).then(() => true);
		if (!timeout) return drainPromise;
		const promises = [drainPromise, new Promise((resolve) => safeUnref(setTimeout(() => resolve(false), timeout)))];
		return Promise.race(promises);
	}
	return {
		get $() {
			return Array.from(buffer);
		},
		add,
		drain
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/ratelimit.js
var DEFAULT_RETRY_AFTER = 60 * 1e3;
function parseRetryAfterHeader(header, now = safeDateNow()) {
	const headerDelay = parseInt(`${header}`, 10);
	if (!isNaN(headerDelay)) return headerDelay * 1e3;
	const headerDate = Date.parse(`${header}`);
	if (!isNaN(headerDate)) return headerDate - now;
	return DEFAULT_RETRY_AFTER;
}
function disabledUntil(limits, dataCategory) {
	return limits[dataCategory] || limits.all || 0;
}
function isRateLimited(limits, dataCategory, now = safeDateNow()) {
	return disabledUntil(limits, dataCategory) > now;
}
function updateRateLimits(limits, { statusCode, headers }, now = safeDateNow()) {
	const updatedRateLimits = { ...limits };
	const rateLimitHeader = headers?.["x-sentry-rate-limits"];
	const retryAfterHeader = headers?.["retry-after"];
	if (rateLimitHeader) for (const limit of rateLimitHeader.trim().split(",")) {
		const [retryAfter, categories, , , namespaces] = limit.split(":", 5);
		const headerDelay = parseInt(retryAfter, 10);
		const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
		if (!categories) updatedRateLimits.all = now + delay;
		else for (const category of categories.split(";")) if (category === "metric_bucket") {
			if (!namespaces || namespaces.split(";").includes("custom")) updatedRateLimits[category] = now + delay;
		} else updatedRateLimits[category] = now + delay;
	}
	else if (retryAfterHeader) updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
	else if (statusCode === 429) updatedRateLimits.all = now + 60 * 1e3;
	return updatedRateLimits;
}
function createTransport(options, makeRequest, buffer = makePromiseBuffer(options.bufferSize || 64)) {
	let rateLimits = {};
	const flush = (timeout) => buffer.drain(timeout);
	function send(envelope) {
		const filteredEnvelopeItems = [];
		forEachEnvelopeItem(envelope, (item, type) => {
			const dataCategory = envelopeItemTypeToDataCategory(type);
			if (isRateLimited(rateLimits, dataCategory)) options.recordDroppedEvent("ratelimit_backoff", dataCategory);
			else filteredEnvelopeItems.push(item);
		});
		if (filteredEnvelopeItems.length === 0) return Promise.resolve({});
		const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
		const recordEnvelopeLoss = (reason) => {
			if (envelopeContainsItemType(filteredEnvelope, ["client_report"])) {
				DEBUG_BUILD$3 && debug.warn(`Dropping client report. Will not send outcomes (reason: ${reason}).`);
				return;
			}
			forEachEnvelopeItem(filteredEnvelope, (item, type) => {
				options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type));
			});
		};
		const requestTask = () => makeRequest({ body: serializeEnvelope(filteredEnvelope) }).then((response) => {
			if (response.statusCode === 413) {
				DEBUG_BUILD$3 && debug.error("Sentry responded with status code 413. Envelope was discarded due to exceeding size limits.");
				recordEnvelopeLoss("send_error");
				return response;
			}
			if (DEBUG_BUILD$3 && response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) debug.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
			rateLimits = updateRateLimits(rateLimits, response);
			return response;
		}, (error) => {
			recordEnvelopeLoss("network_error");
			DEBUG_BUILD$3 && debug.error("Encountered error running transport request:", error);
			throw error;
		});
		return buffer.add(requestTask).then((result) => result, (error) => {
			if (error === SENTRY_BUFFER_FULL_ERROR) {
				DEBUG_BUILD$3 && debug.error("Skipped sending event because buffer is full.");
				recordEnvelopeLoss("queue_overflow");
				return Promise.resolve({});
			} else throw error;
		});
	}
	return {
		send,
		flush
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/clientreport.js
function createClientReportEnvelope(discarded_events, dsn, timestamp) {
	const clientReportItem = [{ type: "client_report" }, {
		timestamp: timestamp || dateTimestampInSeconds(),
		discarded_events
	}];
	return createEnvelope(dsn ? { dsn } : {}, [clientReportItem]);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/eventUtils.js
function getPossibleEventMessages(event) {
	const possibleMessages = [];
	if (event.message) possibleMessages.push(event.message);
	try {
		const lastException = event.exception.values[event.exception.values.length - 1];
		if (lastException?.value) {
			possibleMessages.push(lastException.value);
			if (lastException.type) possibleMessages.push(`${lastException.type}: ${lastException.value}`);
		}
	} catch {}
	return possibleMessages;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/transactionEvent.js
function convertTransactionEventToSpanJson(event) {
	const { trace_id, parent_span_id, span_id, status, origin, data, op } = event.contexts?.trace ?? {};
	return {
		data: data ?? {},
		description: event.transaction,
		op,
		parent_span_id,
		span_id: span_id ?? "",
		start_timestamp: event.start_timestamp ?? 0,
		status,
		timestamp: event.timestamp,
		trace_id: trace_id ?? "",
		origin,
		profile_id: data?.[SEMANTIC_ATTRIBUTE_PROFILE_ID],
		exclusive_time: data?.[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
		measurements: event.measurements,
		is_segment: true
	};
}
function convertSpanJsonToTransactionEvent(span) {
	return {
		type: "transaction",
		timestamp: span.timestamp,
		start_timestamp: span.start_timestamp,
		transaction: span.description,
		contexts: { trace: {
			trace_id: span.trace_id,
			span_id: span.span_id,
			parent_span_id: span.parent_span_id,
			op: span.op,
			status: span.status,
			origin: span.origin,
			data: {
				...span.data,
				...span.profile_id && { ["sentry.profile_id"]: span.profile_id },
				...span.exclusive_time && { ["sentry.exclusive_time"]: span.exclusive_time }
			}
		} },
		measurements: span.measurements
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filtering-snippets.js
var FILTERED_VALUE = "[Filtered]";
var PII_HEADER_SNIPPETS = [
	"forwarded",
	"-ip",
	"remote-",
	"via",
	"-user"
];
var SENSITIVE_KEY_SNIPPETS = [
	"auth",
	"token",
	"secret",
	"session",
	"password",
	"passwd",
	"pwd",
	"key",
	"jwt",
	"bearer",
	"sso",
	"saml",
	"csrf",
	"xsrf",
	"credentials",
	"sid",
	"identity",
	"set-cookie",
	"cookie"
];
var SENSITIVE_COOKIE_NAME_SNIPPETS = [
	".sid",
	"sessid",
	"remember",
	"oidc",
	"pkce",
	"nonce",
	"__secure-",
	"__host-",
	"awsalb",
	"awselb",
	"akamai",
	"__stripe",
	"cognito",
	"firebase",
	"supabase",
	"sb-",
	"mfa",
	"2fa"
];
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/defaultPiiToCollectionOptions.js
function defaultPiiToCollectionOptions(sendDefaultPii) {
	return sendDefaultPii === true ? {
		userInfo: true,
		cookies: true,
		httpHeaders: {
			request: true,
			response: true
		},
		httpBodies: [
			"incomingRequest",
			"outgoingRequest",
			"incomingResponse",
			"outgoingResponse"
		],
		urlQueryParams: true,
		graphQL: {
			document: true,
			variables: true
		},
		genAI: {
			inputs: true,
			outputs: true
		},
		databaseQueryData: true,
		stackFrameVariables: true,
		frameContextLines: 7
	} : {
		userInfo: false,
		cookies: { deny: PII_HEADER_SNIPPETS },
		httpHeaders: {
			request: { deny: PII_HEADER_SNIPPETS },
			response: { deny: PII_HEADER_SNIPPETS }
		},
		httpBodies: [],
		urlQueryParams: { deny: PII_HEADER_SNIPPETS },
		graphQL: {
			document: true,
			variables: true
		},
		genAI: {
			inputs: false,
			outputs: false
		},
		databaseQueryData: false,
		stackFrameVariables: true,
		frameContextLines: 7
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/resolveDataCollectionOptions.js
var DEFAULTS = {
	userInfo: true,
	cookies: true,
	httpHeaders: {
		request: true,
		response: true
	},
	httpBodies: [
		"incomingRequest",
		"outgoingRequest",
		"incomingResponse",
		"outgoingResponse"
	],
	urlQueryParams: true,
	graphQL: {
		document: true,
		variables: true
	},
	genAI: {
		inputs: true,
		outputs: true
	},
	databaseQueryData: true,
	stackFrameVariables: true,
	frameContextLines: 5
};
function resolveDataCollectionOptions(options) {
	const base = options.dataCollection != null ? DEFAULTS : defaultPiiToCollectionOptions(options.sendDefaultPii);
	const dc = options.dataCollection ?? {};
	return {
		userInfo: dc.userInfo ?? base.userInfo,
		cookies: dc.cookies ?? base.cookies,
		httpHeaders: {
			request: dc.httpHeaders?.request ?? base.httpHeaders.request,
			response: dc.httpHeaders?.response ?? base.httpHeaders.response
		},
		httpBodies: dc.httpBodies ?? base.httpBodies,
		urlQueryParams: dc.urlQueryParams ?? dc.queryParams ?? base.urlQueryParams,
		graphQL: {
			document: dc.graphQL?.document ?? base.graphQL.document,
			variables: dc.graphQL?.variables ?? base.graphQL.variables
		},
		genAI: {
			inputs: dc.genAI?.inputs ?? base.genAI.inputs,
			outputs: dc.genAI?.outputs ?? base.genAI.outputs
		},
		databaseQueryData: dc.databaseQueryData ?? base.databaseQueryData,
		stackFrameVariables: dc.stackFrameVariables ?? base.stackFrameVariables,
		frameContextLines: dc.frameContextLines ?? base.frameContextLines
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/client.js
var ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
var MISSING_RELEASE_FOR_SESSION_ERROR = "Discarded session because of missing or non-string release";
var INTERNAL_ERROR_SYMBOL = /* @__PURE__ */ Symbol.for("SentryInternalError");
var DO_NOT_SEND_EVENT_SYMBOL = /* @__PURE__ */ Symbol.for("SentryDoNotSendEventError");
var DEFAULT_FLUSH_INTERVAL = 5e3;
function _makeInternalError(message) {
	return {
		message,
		[INTERNAL_ERROR_SYMBOL]: true
	};
}
function _makeDoNotSendEventError(message) {
	return {
		message,
		[DO_NOT_SEND_EVENT_SYMBOL]: true
	};
}
function _isInternalError(error) {
	return isObjectLike(error) && INTERNAL_ERROR_SYMBOL in error;
}
function _isDoNotSendEventError(error) {
	return isObjectLike(error) && DO_NOT_SEND_EVENT_SYMBOL in error;
}
function setupWeightBasedFlushing(client, afterCaptureHook, flushHook, estimateSizeFn, flushFn) {
	let weight = 0;
	let flushTimeout;
	let isTimerActive = false;
	client.on(flushHook, () => {
		weight = 0;
		clearTimeout(flushTimeout);
		isTimerActive = false;
	});
	client.on(afterCaptureHook, (item) => {
		weight += estimateSizeFn(item);
		if (weight >= 8e5) flushFn(client);
		else if (!isTimerActive) {
			const flushInterval = client.getOptions()._flushInterval ?? DEFAULT_FLUSH_INTERVAL;
			if (flushInterval > 0) {
				isTimerActive = true;
				flushTimeout = safeUnref(setTimeout(() => {
					flushFn(client);
				}, flushInterval));
			}
		}
	});
	client.on("flush", () => {
		flushFn(client);
	});
}
var Client = class {
	/**
	* Initializes this client instance.
	*
	* @param options Options for the client.
	*/
	constructor(options) {
		this._options = options;
		this._integrations = {};
		this._numProcessing = 0;
		this._outcomes = {};
		this._hooks = {};
		this._eventProcessors = [];
		this._promiseBuffer = makePromiseBuffer(options.transportOptions?.bufferSize ?? 64);
		this._dataCollection = resolveDataCollectionOptions(options);
		if (options.dsn) this._dsn = makeDsn(options.dsn);
		else DEBUG_BUILD$3 && debug.warn("No DSN provided, client will not send events.");
		if (this._dsn) {
			const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : void 0);
			this._transport = options.transport({
				tunnel: this._options.tunnel,
				recordDroppedEvent: this.recordDroppedEvent.bind(this),
				...options.transportOptions,
				url
			});
		}
		this._options.enableLogs = this._options.enableLogs ?? this._options._experiments?.enableLogs;
		if (this._options.enableLogs) setupWeightBasedFlushing(this, "afterCaptureLog", "flushLogs", estimateLogSizeInBytes, _INTERNAL_flushLogsBuffer);
		if (this._options.enableMetrics ?? this._options._experiments?.enableMetrics ?? true) setupWeightBasedFlushing(this, "afterCaptureMetric", "flushMetrics", estimateMetricSizeInBytes, _INTERNAL_flushMetricsBuffer);
	}
	/**
	* Captures an exception event and sends it to Sentry.
	*
	* Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
	*/
	captureException(exception, hint, scope) {
		const eventId = uuid4();
		if (checkOrSetAlreadyCaught(exception)) {
			DEBUG_BUILD$3 && debug.log(ALREADY_SEEN_ERROR);
			return eventId;
		}
		const hintWithEventId = {
			event_id: eventId,
			...hint
		};
		this._process(() => this.eventFromException(exception, hintWithEventId).then((event) => this._captureEvent(event, hintWithEventId, scope)).then((res) => res), "error");
		return hintWithEventId.event_id;
	}
	/**
	* Captures a message event and sends it to Sentry.
	*
	* Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
	*/
	captureMessage(message, level, hint, currentScope) {
		const hintWithEventId = {
			event_id: uuid4(),
			...hint
		};
		const eventMessage = isParameterizedString(message) ? message : String(message);
		const isMessage = isPrimitive(message);
		const promisedEvent = isMessage ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
		this._process(() => promisedEvent.then((event) => this._captureEvent(event, hintWithEventId, currentScope)), isMessage ? "unknown" : "error");
		return hintWithEventId.event_id;
	}
	/**
	* Captures a manually created event and sends it to Sentry.
	*
	* Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
	*/
	captureEvent(event, hint, currentScope) {
		const eventId = uuid4();
		if (hint?.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
			DEBUG_BUILD$3 && debug.log(ALREADY_SEEN_ERROR);
			return eventId;
		}
		const hintWithEventId = {
			event_id: eventId,
			...hint
		};
		const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
		const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
		const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
		const dataCategory = getDataCategoryByType(event.type);
		this._process(() => this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope, capturedSpanIsolationScope), dataCategory);
		return hintWithEventId.event_id;
	}
	/**
	* Captures a session.
	*/
	captureSession(session) {
		this.sendSession(session);
		updateSession(session, { init: false });
	}
	/**
	* Get the current Dsn.
	*/
	getDsn() {
		return this._dsn;
	}
	/**
	* Get the current options.
	*/
	getOptions() {
		return this._options;
	}
	/**
	* Get the resolved data collection configuration.
	*/
	getDataCollectionOptions() {
		return this._dataCollection;
	}
	/**
	* Get the SDK metadata.
	* @see SdkMetadata
	*/
	getSdkMetadata() {
		return this._options._metadata;
	}
	/**
	* Returns the transport that is used by the client.
	* Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
	*/
	getTransport() {
		return this._transport;
	}
	/**
	* Wait for all events to be sent or the timeout to expire, whichever comes first.
	*
	* @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
	*   cause the client to wait until all events are sent before resolving the promise.
	* @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
	* still events in the queue when the timeout is reached.
	*/
	async flush(timeout) {
		const transport = this._transport;
		this.emit("flush");
		if (!transport) return true;
		const clientFinished = await this._isClientDoneProcessing(timeout);
		const transportFlushed = await transport.flush(timeout);
		return clientFinished && transportFlushed;
	}
	/**
	* Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
	*
	* @param {number} timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
	*   the client to wait until all events are sent before disabling itself.
	* @returns {Promise<boolean>} A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
	* it doesn't.
	*/
	async close(timeout) {
		const result = await this.flush(timeout);
		this.getOptions().enabled = false;
		this.emit("close");
		return result;
	}
	/**
	* Get all installed event processors.
	*/
	getEventProcessors() {
		return this._eventProcessors;
	}
	/**
	* Adds an event processor that applies to any event processed by this client.
	*/
	addEventProcessor(eventProcessor) {
		this._eventProcessors.push(eventProcessor);
	}
	/**
	* Initialize this client.
	* Call this after the client was set on a scope.
	*/
	init() {
		if (this._isEnabled() || this._options.integrations.some(({ name }) => name.startsWith("Spotlight"))) this._setupIntegrations();
	}
	/**
	* Gets an installed integration by its name.
	*
	* @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
	*/
	getIntegrationByName(integrationName) {
		return this._integrations[integrationName];
	}
	/**
	* Returns the names of all installed integrations.
	*/
	getIntegrationNames() {
		return Object.keys(this._integrations);
	}
	/**
	* Add an integration to the client.
	* This can be used to e.g. lazy load integrations.
	* In most cases, this should not be necessary,
	* and you're better off just passing the integrations via `integrations: []` at initialization time.
	* However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
	*/
	addIntegration(integration) {
		const isAlreadyInstalled = this._integrations[integration.name];
		if (!isAlreadyInstalled && integration.beforeSetup) integration.beforeSetup(this);
		setupIntegration(this, integration, this._integrations);
		if (!isAlreadyInstalled) afterSetupIntegrations(this, [integration]);
	}
	/**
	* Send a fully prepared event to Sentry.
	*/
	sendEvent(event, hint = {}) {
		this.emit("beforeSendEvent", event, hint);
		const genAiSpanItem = extractGenAiSpansFromEvent(event, this);
		let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
		for (const attachment of hint.attachments || []) env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
		if (genAiSpanItem) env = addItemToEnvelope(env, genAiSpanItem);
		this.sendEnvelope(env).then((sendResponse) => this.emit("afterSendEvent", event, sendResponse));
	}
	/**
	* Send a session or session aggregrates to Sentry.
	*/
	sendSession(session) {
		const { release: clientReleaseOption, environment: clientEnvironmentOption = DEFAULT_ENVIRONMENT } = this._options;
		if ("aggregates" in session) {
			const sessionAttrs = session.attrs || {};
			if (!sessionAttrs.release && !clientReleaseOption) {
				DEBUG_BUILD$3 && debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
				return;
			}
			sessionAttrs.release = sessionAttrs.release || clientReleaseOption;
			sessionAttrs.environment = sessionAttrs.environment || clientEnvironmentOption;
			session.attrs = sessionAttrs;
		} else {
			if (!session.release && !clientReleaseOption) {
				DEBUG_BUILD$3 && debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
				return;
			}
			session.release = session.release || clientReleaseOption;
			session.environment = session.environment || clientEnvironmentOption;
		}
		this.emit("beforeSendSession", session);
		const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
		this.sendEnvelope(env);
	}
	/**
	* Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
	*/
	recordDroppedEvent(reason, category, count = 1) {
		if (this._options.sendClientReports) {
			const key = `${reason}:${category}`;
			DEBUG_BUILD$3 && debug.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`);
			this._outcomes[key] = (this._outcomes[key] || 0) + count;
		}
	}
	/**
	* Register a hook on this client.
	*/
	on(hook, callback) {
		const hookCallbacks = this._hooks[hook] = this._hooks[hook] || /* @__PURE__ */ new Set();
		const uniqueCallback = (...args) => callback(...args);
		hookCallbacks.add(uniqueCallback);
		return () => {
			hookCallbacks.delete(uniqueCallback);
		};
	}
	/**
	* Emit a hook that was previously registered via `on()`.
	*/
	emit(hook, ...rest) {
		const callbacks = this._hooks[hook];
		if (callbacks) callbacks.forEach((callback) => callback(...rest));
	}
	/**
	* Send an envelope to Sentry.
	*/
	async sendEnvelope(envelope) {
		this.emit("beforeEnvelope", envelope);
		if (this._isEnabled() && this._transport) try {
			return await this._transport.send(envelope);
		} catch (reason) {
			DEBUG_BUILD$3 && debug.error("Error while sending envelope:", reason);
			return {};
		}
		DEBUG_BUILD$3 && debug.error("Transport disabled");
		return {};
	}
	/**
	* Register a cleanup function to be called when the client is disposed.
	* This is useful for integrations that need to clean up global state.
	*
	* NOTE: This is a no-op in the base `Client` class. Subclasses like `ServerRuntimeClient`
	* override this method to actually register and execute cleanup callbacks.
	*/
	registerCleanup(callback) {}
	/**
	* Disposes of the client and releases all resources.
	*
	* Subclasses should override this method to clean up their own resources, including invoking
	* any callbacks registered via {@link Client.registerCleanup}. The base implementation is a
	* no-op and does NOT execute registered cleanup callbacks.
	*
	* After calling dispose(), the client should not be used anymore.
	*/
	dispose() {}
	/** Setup integrations for this client. */
	_setupIntegrations() {
		const { integrations } = this._options;
		this._integrations = setupIntegrations(this, integrations);
		afterSetupIntegrations(this, integrations);
	}
	/** Updates existing session based on the provided event */
	_updateSessionFromEvent(session, event) {
		let crashed = event.level === "fatal";
		let errored = false;
		const exceptions = event.exception?.values;
		if (exceptions) {
			errored = true;
			crashed = false;
			for (const ex of exceptions) if (ex.mechanism?.handled === false) {
				crashed = true;
				break;
			}
		}
		const sessionNonTerminal = session.status === "ok";
		if (sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed) {
			updateSession(session, {
				...crashed && { status: "crashed" },
				errors: session.errors || Number(errored || crashed)
			});
			this.captureSession(session);
		}
	}
	/**
	* Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
	* "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
	*
	* @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
	* passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
	* `true`.
	* @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
	* `false` otherwise
	*/
	async _isClientDoneProcessing(timeout) {
		let ticked = 0;
		while (!timeout || ticked < timeout) {
			await new Promise((resolve) => setTimeout(resolve, 1));
			if (!this._numProcessing) return true;
			ticked++;
		}
		return false;
	}
	/** Determines whether this SDK is enabled and a transport is present. */
	_isEnabled() {
		return this.getOptions().enabled !== false && this._transport !== void 0;
	}
	/**
	* Adds common information to events.
	*
	* The information includes release and environment from `options`,
	* breadcrumbs and context (extra, tags and user) from the scope.
	*
	* Information that is already present in the event is never overwritten. For
	* nested objects, such as the context, keys are merged.
	*
	* @param event The original event.
	* @param hint May contain additional information about the original exception.
	* @param currentScope A scope containing event metadata.
	* @returns A new event with more information.
	*/
	_prepareEvent(event, hint, currentScope, isolationScope) {
		const options = this.getOptions();
		const integrations = this.getIntegrationNames();
		if (!hint.integrations && integrations.length) hint.integrations = integrations;
		this.emit("preprocessEvent", event, hint);
		if (!event.type) isolationScope.setLastEventId(event.event_id || hint.event_id);
		return prepareEvent(options, event, hint, currentScope, this, isolationScope).then((evt) => {
			if (evt === null) return evt;
			this.emit("postprocessEvent", evt, hint);
			evt.contexts = {
				trace: {
					...evt.contexts?.trace,
					...getTraceContextFromScope(currentScope)
				},
				...evt.contexts
			};
			evt.sdkProcessingMetadata = {
				dynamicSamplingContext: getDynamicSamplingContextFromScope(this, currentScope),
				...evt.sdkProcessingMetadata
			};
			return evt;
		});
	}
	/**
	* Processes the event and logs an error in case of rejection
	* @param event
	* @param hint
	* @param scope
	*/
	_captureEvent(event, hint = {}, currentScope = getCurrentScope(), isolationScope = getIsolationScope()) {
		if (DEBUG_BUILD$3 && isErrorEvent(event)) debug.log(`Captured error event \`${getPossibleEventMessages(event)[0] || "<unknown>"}\``);
		return this._processEvent(event, hint, currentScope, isolationScope).then((finalEvent) => {
			return finalEvent.event_id;
		}, (reason) => {
			if (DEBUG_BUILD$3) if (_isDoNotSendEventError(reason)) debug.log(reason.message);
			else if (_isInternalError(reason)) debug.warn(reason.message);
			else debug.warn(reason);
		});
	}
	/**
	* Processes an event (either error or message) and sends it to Sentry.
	*
	* This also adds breadcrumbs and context information to the event. However,
	* platform specific meta data (such as the User's IP address) must be added
	* by the SDK implementor.
	*
	*
	* @param event The event to send to Sentry.
	* @param hint May contain additional information about the original exception.
	* @param currentScope A scope containing event metadata.
	* @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
	*/
	_processEvent(event, hint, currentScope, isolationScope) {
		const options = this.getOptions();
		const { sampleRate } = options;
		const isTransaction = isTransactionEvent(event);
		const isError = isErrorEvent(event);
		const beforeSendLabel = `before send for type \`${event.type || "error"}\``;
		const parsedSampleRate = typeof sampleRate === "undefined" ? void 0 : parseSampleRate(sampleRate);
		if (isError && typeof parsedSampleRate === "number" && safeMathRandom() > parsedSampleRate) {
			this.recordDroppedEvent("sample_rate", "error");
			return rejectedSyncPromise(_makeDoNotSendEventError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`));
		}
		const dataCategory = getDataCategoryByType(event.type);
		return this._prepareEvent(event, hint, currentScope, isolationScope).then((prepared) => {
			if (prepared === null) {
				this.recordDroppedEvent("event_processor", dataCategory);
				throw _makeDoNotSendEventError("An event processor returned `null`, will not send event.");
			}
			if (hint.data?.__sentry__ === true) return prepared;
			return _validateBeforeSendResult(processBeforeSend(this, options, prepared, hint), beforeSendLabel);
		}).then((processedEvent) => {
			if (processedEvent === null) {
				this.recordDroppedEvent("before_send", dataCategory);
				if (isTransaction) {
					const spanCount = 1 + (event.spans || []).length;
					this.recordDroppedEvent("before_send", "span", spanCount);
				}
				throw _makeDoNotSendEventError(`${beforeSendLabel} returned \`null\`, will not send event.`);
			}
			const session = currentScope.getSession() || isolationScope.getSession();
			if (isError && session) this._updateSessionFromEvent(session, processedEvent);
			if (isTransaction) {
				const droppedSpanCount = (processedEvent.sdkProcessingMetadata?.spanCountBeforeProcessing || 0) - (processedEvent.spans ? processedEvent.spans.length : 0);
				if (droppedSpanCount > 0) this.recordDroppedEvent("before_send", "span", droppedSpanCount);
			}
			const transactionInfo = processedEvent.transaction_info;
			if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
				const source = "custom";
				processedEvent.transaction_info = {
					...transactionInfo,
					source
				};
			}
			this.sendEvent(processedEvent, hint);
			return processedEvent;
		}).then(null, (reason) => {
			if (_isDoNotSendEventError(reason) || _isInternalError(reason)) throw reason;
			this.captureException(reason, {
				mechanism: {
					handled: false,
					type: "internal"
				},
				data: { __sentry__: true },
				originalException: reason
			});
			throw _makeInternalError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${reason}`);
		});
	}
	/**
	* Occupies the client with processing and event
	*/
	_process(taskProducer, dataCategory) {
		this._numProcessing++;
		this._promiseBuffer.add(taskProducer).then((value) => {
			this._numProcessing--;
			return value;
		}, (reason) => {
			this._numProcessing--;
			if (reason === SENTRY_BUFFER_FULL_ERROR) this.recordDroppedEvent("queue_overflow", dataCategory);
			return reason;
		});
	}
	/**
	* Clears outcomes on this client and returns them.
	*/
	_clearOutcomes() {
		const outcomes = this._outcomes;
		this._outcomes = {};
		return Object.entries(outcomes).map(([key, quantity]) => {
			const [reason, category] = key.split(":");
			return {
				reason,
				category,
				quantity
			};
		});
	}
	/**
	* Sends client reports as an envelope.
	*/
	_flushOutcomes() {
		DEBUG_BUILD$3 && debug.log("Flushing outcomes...");
		const outcomes = this._clearOutcomes();
		if (outcomes.length === 0) {
			DEBUG_BUILD$3 && debug.log("No outcomes to send");
			return;
		}
		if (!this._dsn) {
			DEBUG_BUILD$3 && debug.log("No dsn provided, will not send outcomes");
			return;
		}
		DEBUG_BUILD$3 && debug.log("Sending outcomes:", outcomes);
		const envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
		this.sendEnvelope(envelope);
	}
};
function getDataCategoryByType(type) {
	return type === "replay_event" ? "replay" : type || "error";
}
function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
	const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
	if (isThenable(beforeSendResult)) return beforeSendResult.then((event) => {
		if (!isPlainObject(event) && event !== null) throw _makeInternalError(invalidValueError);
		return event;
	}, (e) => {
		throw _makeInternalError(`${beforeSendLabel} rejected with ${e}`);
	});
	else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) throw _makeInternalError(invalidValueError);
	return beforeSendResult;
}
function processBeforeSend(client, options, event, hint) {
	const { beforeSend, beforeSendTransaction, ignoreSpans } = options;
	const beforeSendSpan = !isStreamedBeforeSendSpanCallback(options.beforeSendSpan) && options.beforeSendSpan;
	let processedEvent = event;
	if (isErrorEvent(processedEvent) && beforeSend) return beforeSend(processedEvent, hint);
	if (isTransactionEvent(processedEvent)) {
		if (beforeSendSpan || ignoreSpans) {
			const rootSpanJson = convertTransactionEventToSpanJson(processedEvent);
			if (ignoreSpans?.length && shouldIgnoreSpan({
				description: rootSpanJson.description,
				op: rootSpanJson.op,
				attributes: rootSpanJson.data
			}, ignoreSpans)) return null;
			if (beforeSendSpan) {
				const processedRootSpanJson = beforeSendSpan(rootSpanJson);
				if (!processedRootSpanJson) showSpanDropWarning();
				else processedEvent = merge(event, convertSpanJsonToTransactionEvent(processedRootSpanJson));
			}
			if (processedEvent.spans) {
				const processedSpans = [];
				const initialSpans = processedEvent.spans;
				for (const span of initialSpans) {
					if (ignoreSpans?.length && shouldIgnoreSpan({
						description: span.description,
						op: span.op,
						attributes: span.data
					}, ignoreSpans)) {
						reparentChildSpans(initialSpans, span);
						continue;
					}
					if (beforeSendSpan) {
						const processedSpan = beforeSendSpan(span);
						if (!processedSpan) {
							showSpanDropWarning();
							processedSpans.push(span);
						} else processedSpans.push(processedSpan);
					} else processedSpans.push(span);
				}
				const droppedSpans = processedEvent.spans.length - processedSpans.length;
				if (droppedSpans) client.recordDroppedEvent("before_send", "span", droppedSpans);
				processedEvent.spans = processedSpans;
			}
		}
		if (beforeSendTransaction) {
			if (processedEvent.spans) {
				const spanCountBefore = processedEvent.spans.length;
				processedEvent.sdkProcessingMetadata = {
					...event.sdkProcessingMetadata,
					spanCountBeforeProcessing: spanCountBefore
				};
			}
			return beforeSendTransaction(processedEvent, hint);
		}
	}
	return processedEvent;
}
function isErrorEvent(event) {
	return event.type === void 0;
}
function isTransactionEvent(event) {
	return event.type === "transaction";
}
function estimateMetricSizeInBytes(metric) {
	let weight = 0;
	if (metric.name) weight += metric.name.length * 2;
	weight += 8;
	return weight + estimateAttributesSizeInBytes(metric.attributes);
}
function estimateLogSizeInBytes(log) {
	let weight = 0;
	if (log.message) weight += log.message.length * 2;
	return weight + estimateAttributesSizeInBytes(log.attributes);
}
function estimateAttributesSizeInBytes(attributes) {
	if (!attributes) return 0;
	let weight = 0;
	Object.values(attributes).forEach((value) => {
		if (Array.isArray(value)) weight += value.length * estimatePrimitiveSizeInBytes(value[0]);
		else if (isPrimitive(value)) weight += estimatePrimitiveSizeInBytes(value);
		else weight += 100;
	});
	return weight;
}
function estimatePrimitiveSizeInBytes(value) {
	if (typeof value === "string") return value.length * 2;
	else if (typeof value === "number") return 8;
	else if (typeof value === "boolean") return 4;
	return 0;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/sdk.js
function initAndBind(clientClass, options) {
	if (options.debug === true) if (DEBUG_BUILD$3) debug.enable();
	else consoleSandbox(() => {
		console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
	});
	getCurrentScope().update(options.initialScope);
	const client = new clientClass(options);
	setCurrentClient(client);
	client.init();
	return client;
}
function setCurrentClient(client) {
	getCurrentScope().setClient(client);
}
var START_DELAY = 5e3;
var MAX_DELAY = 36e5;
function makeOfflineTransport(createTransport) {
	function log(...args) {
		DEBUG_BUILD$3 && debug.log("[Offline]:", ...args);
	}
	return (options) => {
		const transport = createTransport(options);
		if (!options.createStore) throw new Error("No `createStore` function was provided");
		const store = options.createStore(options);
		let retryDelay = START_DELAY;
		let flushTimer;
		function shouldQueue(env, error, retryDelay2) {
			if (envelopeContainsItemType(env, ["client_report"])) return false;
			if (options.shouldStore) return options.shouldStore(env, error, retryDelay2);
			return true;
		}
		function flushIn(delay) {
			if (flushTimer) clearTimeout(flushTimer);
			flushTimer = safeUnref(setTimeout(async () => {
				flushTimer = void 0;
				const found = await store.shift();
				if (found) {
					log("Attempting to send previously queued event");
					found[0].sent_at = new Date(safeDateNow()).toISOString();
					send(found, true).catch((e) => {
						log("Failed to retry sending", e);
					});
				}
			}, delay));
		}
		function flushWithBackOff() {
			if (flushTimer) return;
			flushIn(retryDelay);
			retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
		}
		async function send(envelope, isRetry = false) {
			if (!isRetry && envelopeContainsItemType(envelope, ["replay_event", "replay_recording"])) {
				await store.push(envelope);
				flushIn(100);
				return {};
			}
			try {
				if (options.shouldSend && await options.shouldSend(envelope) === false) throw new Error("Envelope not sent because `shouldSend` callback returned false");
				const result = await transport.send(envelope);
				let delay = 100;
				if (result) {
					if (result.headers?.["retry-after"]) delay = parseRetryAfterHeader(result.headers["retry-after"]);
					else if (result.headers?.["x-sentry-rate-limits"]) delay = 6e4;
					else if ((result.statusCode || 0) >= 400) return result;
				}
				flushIn(delay);
				retryDelay = START_DELAY;
				return result;
			} catch (e) {
				if (await shouldQueue(envelope, e, retryDelay)) {
					if (isRetry) await store.unshift(envelope);
					else await store.push(envelope);
					flushWithBackOff();
					log("Error sending. Event queued.", e);
					return {};
				} else throw e;
			}
		}
		if (options.flushAtStartup) flushWithBackOff();
		return {
			send,
			flush: (timeout) => {
				if (timeout === void 0) {
					retryDelay = START_DELAY;
					flushIn(100);
				}
				return transport.flush(timeout);
			}
		};
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filterKeyValueData.js
function isSensitiveKey(lower, denySnippets) {
	return denySnippets.some((snippet) => lower.includes(snippet));
}
function filterKeyValueData(data, behavior, additionalDenyTerms) {
	if (behavior === false) return {};
	const denySnippets = additionalDenyTerms != null ? [...SENSITIVE_KEY_SNIPPETS, ...additionalDenyTerms] : SENSITIVE_KEY_SNIPPETS;
	const result = {};
	if (behavior === true) {
		for (const key of Object.keys(data)) result[key] = isSensitiveKey(key.toLowerCase(), denySnippets) ? FILTERED_VALUE : data[key];
		return result;
	}
	if ("deny" in behavior) {
		const lowerTerms2 = behavior.deny.map((t) => t.toLowerCase());
		for (const key of Object.keys(data)) {
			const lower = key.toLowerCase();
			result[key] = isSensitiveKey(lower, denySnippets) || lowerTerms2.some((term) => lower.includes(term)) ? FILTERED_VALUE : data[key];
		}
		return result;
	}
	const lowerTerms = behavior.allow.map((t) => t.toLowerCase());
	for (const key of Object.keys(data)) {
		const lower = key.toLowerCase();
		if (isSensitiveKey(lower, denySnippets)) result[key] = FILTERED_VALUE;
		else result[key] = lowerTerms.some((term) => lower.includes(term)) ? data[key] : FILTERED_VALUE;
	}
	return result;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/cookie.js
function parseCookie(str) {
	const obj = {};
	let index = 0;
	while (index < str.length) {
		const eqIdx = str.indexOf("=", index);
		if (eqIdx === -1) break;
		let endIdx = str.indexOf(";", index);
		if (endIdx === -1) endIdx = str.length;
		else if (endIdx < eqIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = str.slice(index, eqIdx).trim();
		if (void 0 === obj[key]) {
			let val = str.slice(eqIdx + 1, endIdx).trim();
			if (val.charCodeAt(0) === 34) val = val.slice(1, -1);
			try {
				obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
			} catch {
				obj[key] = val;
			}
		}
		index = endIdx + 1;
	}
	return obj;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/data-collection/filterCookies.js
function filterCookies(cookieString, behavior) {
	if (behavior === false) return {};
	try {
		const parsed = parseCookie(cookieString);
		if (Object.keys(parsed).length === 0) return {};
		return filterKeyValueData(parsed, behavior, SENSITIVE_COOKIE_NAME_SNIPPETS);
	} catch {
		return FILTERED_VALUE;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/url.js
var DEFAULT_BASE_URL = "thismessage:/";
function isURLObjectRelative(url) {
	return "isRelative" in url;
}
function parseStringToURLObject(url, urlBase) {
	const isRelative = url.indexOf("://") <= 0 && url.indexOf("//") !== 0;
	const base = urlBase ?? (isRelative ? DEFAULT_BASE_URL : void 0);
	try {
		if ("canParse" in URL && !URL.canParse(url, base)) return;
		const fullUrlObject = new URL(url, base);
		if (isRelative) return {
			isRelative,
			pathname: fullUrlObject.pathname,
			search: fullUrlObject.search,
			hash: fullUrlObject.hash
		};
		return fullUrlObject;
	} catch {}
}
function getSanitizedUrlStringFromUrlObject(url) {
	if (isURLObjectRelative(url)) return url.pathname;
	const newUrl = new URL(url);
	newUrl.search = "";
	newUrl.hash = "";
	if (["80", "443"].includes(newUrl.port)) newUrl.port = "";
	if (newUrl.password) newUrl.password = "%filtered%";
	if (newUrl.username) newUrl.username = "%filtered%";
	return newUrl.toString();
}
function getHttpSpanNameFromUrlObject(urlObject, kind, request, routeName) {
	return `${request?.method?.toUpperCase() ?? "GET"} ${routeName ? routeName : urlObject ? kind === "client" ? getSanitizedUrlStringFromUrlObject(urlObject) : urlObject.pathname : "/"}`;
}
function getHttpSpanDetailsFromUrlObject(urlObject, kind, spanOrigin, request, routeName) {
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
		[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url"
	};
	if (routeName) {
		attributes[kind === "server" ? "http.route" : "url.template"] = routeName;
		attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "route";
	}
	if (request?.method) attributes[SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD] = request.method.toUpperCase();
	if (urlObject) {
		if (urlObject.search) attributes["url.query"] = urlObject.search;
		if (urlObject.hash) attributes["url.fragment"] = urlObject.hash;
		if (urlObject.pathname) {
			attributes["url.path"] = urlObject.pathname;
			if (urlObject.pathname === "/") attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "route";
		}
		if (!isURLObjectRelative(urlObject)) {
			attributes[SEMANTIC_ATTRIBUTE_URL_FULL] = urlObject.href;
			if (urlObject.port) attributes["url.port"] = urlObject.port;
			if (urlObject.protocol) attributes["url.scheme"] = urlObject.protocol;
			if (urlObject.hostname) attributes[kind === "server" ? "server.address" : "url.domain"] = urlObject.hostname;
		}
	}
	return [getHttpSpanNameFromUrlObject(urlObject, kind, request, routeName), attributes];
}
function parseUrl(url) {
	if (!url) return {};
	const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
	if (!match) return {};
	const query = match[6] || "";
	const fragment = match[8] || "";
	return {
		host: match[4],
		path: match[5],
		protocol: match[2],
		search: query,
		hash: fragment,
		relative: match[5] + query + fragment
	};
}
function stripUrlQueryAndFragment(urlPath) {
	return urlPath.split(/[?#]/, 1)[0];
}
function getSanitizedUrlString(url) {
	const { protocol, host, path } = url;
	const filteredHost = host?.replace(/^.*@/, "[filtered]:[filtered]@").replace(/(:80)$/, "").replace(/(:443)$/, "") || "";
	return `${protocol ? `${protocol}://` : ""}${filteredHost}${path}`;
}
function stripDataUrlContent(url, includeDataPrefix = true) {
	if (url.startsWith("data:")) {
		const match = url.match(/^data:([^;,]+)/);
		const mimeType = match ? match[1] : "text/plain";
		const isBase64 = url.includes(";base64,");
		const dataStart = url.indexOf(",");
		let dataPrefix = "";
		if (includeDataPrefix && dataStart !== -1) {
			const data = url.slice(dataStart + 1);
			dataPrefix = data.length > 10 ? `${data.slice(0, 10)}... [truncated]` : data;
		}
		return `data:${mimeType}${isBase64 ? ",base64" : ""}${dataPrefix ? `,${dataPrefix}` : ""}`;
	}
	return url;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/isSentryRequestUrl.js
function isSentryRequestUrl(url, client) {
	const dsn = client?.getDsn();
	const tunnel = client?.getOptions().tunnel;
	return checkDsn(url, dsn) || checkTunnel(url, tunnel);
}
function checkTunnel(url, tunnel) {
	if (!tunnel) return false;
	return removeTrailingSlash(url) === removeTrailingSlash(tunnel);
}
function checkDsn(url, dsn) {
	const urlParts = parseStringToURLObject(url);
	if (!urlParts || isURLObjectRelative(urlParts)) return false;
	if (!dsn) return false;
	return hostnameMatchesDsnHost(urlParts.hostname, dsn.host) && /(^|&|\?)sentry_key=/.test(urlParts.search);
}
function hostnameMatchesDsnHost(hostname, dsnHost) {
	return hostname === dsnHost || dsnHost.length > 0 && hostname.endsWith(`.${dsnHost}`);
}
function removeTrailingSlash(str) {
	return str[str.length - 1] === "/" ? str.slice(0, -1) : str;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/ipAddress.js
function addAutoIpAddressToSession(session) {
	if ("aggregates" in session) {
		if (session.attrs?.["ip_address"] === void 0) session.attrs = {
			...session.attrs,
			ip_address: "{{auto}}"
		};
	} else if (session.ipAddress === void 0) session.ipAddress = "{{auto}}";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/sdkMetadata.js
function applySdkMetadata(options, name, names = [name], source = "npm") {
	const sdk = (options._metadata = options._metadata || {}).sdk = options._metadata.sdk || {};
	if (!sdk.name) {
		sdk.name = `sentry.javascript.${name}`;
		sdk.packages = names.map((name2) => ({
			name: `${source}:@sentry/${name2}`,
			version: SDK_VERSION
		}));
		sdk.version = SDK_VERSION;
	}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/traceData.js
function getTraceData(options = {}) {
	const client = options.client || getClient();
	if (!isEnabled() || !client) return {};
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (acs.getTraceData) return acs.getTraceData(options);
	const scope = options.scope || getCurrentScope();
	const span = options.span || getActiveSpan();
	const isTwpPlaceholder = spanIsNonRecordingSpan(span) && !hasSpansEnabled(client.getOptions());
	if (!span && hasExternalPropagationContext()) return {};
	const sentryTrace = span && !isTwpPlaceholder ? spanToTraceHeader(span) : scopeToTraceHeader(scope);
	const baggage = dynamicSamplingContextToSentryBaggageHeader(span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope));
	if (!TRACEPARENT_REGEXP.test(sentryTrace)) {
		debug.warn("Invalid sentry-trace data. Cannot generate trace data");
		return {};
	}
	const traceData = {
		"sentry-trace": sentryTrace,
		baggage
	};
	if (options.propagateTraceparent) traceData.traceparent = span && !isTwpPlaceholder ? spanToTraceparentHeader(span) : scopeToTraceparentHeader(scope);
	return traceData;
}
function scopeToTraceHeader(scope) {
	const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
	return generateSentryTraceHeader(traceId, propagationSpanId, sampled);
}
function scopeToTraceparentHeader(scope) {
	const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
	return generateTraceparentHeader(traceId, propagationSpanId, sampled);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/breadcrumbs.js
var DEFAULT_BREADCRUMBS = 100;
function addBreadcrumb(breadcrumb, hint) {
	const client = getClient();
	const isolationScope = getIsolationScope();
	if (!client) return;
	const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = client.getOptions();
	if (maxBreadcrumbs <= 0) return;
	const mergedBreadcrumb = {
		timestamp: dateTimestampInSeconds(),
		...breadcrumb
	};
	const finalBreadcrumb = beforeBreadcrumb ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
	if (finalBreadcrumb === null) return;
	if (client.emit) client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint);
	isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/functiontostring.js
var INTEGRATION_NAME$15 = "FunctionToString";
var SETUP_CLIENTS$1 = /* @__PURE__ */ new WeakMap();
var _functionToStringIntegration = (() => {
	return {
		name: INTEGRATION_NAME$15,
		setupOnce() {
			const originalFunctionToString = Function.prototype.toString;
			try {
				Function.prototype.toString = new Proxy(originalFunctionToString, { apply(target, thisArg, args) {
					const originalFunction = getOriginalFunction(thisArg);
					let context = thisArg;
					try {
						if (SETUP_CLIENTS$1.has(getClient()) && originalFunction) context = originalFunction;
					} catch {}
					return Reflect.apply(target, context, args);
				} });
			} catch {}
		},
		setup(client) {
			SETUP_CLIENTS$1.set(client, true);
		}
	};
});
var functionToStringIntegration = defineIntegration(_functionToStringIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/eventFilters.js
var DEFAULT_IGNORE_ERRORS = [
	/^Script error\.?$/,
	/^Javascript error: Script error\.? on line 0$/,
	/^ResizeObserver loop completed with undelivered notifications.$/,
	/^Cannot redefine property: googletag$/,
	/^Can't find variable: gmo$/,
	/^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
	/can't redefine non-configurable property "solana"/,
	/vv\(\)\.getRestrictions is not a function/,
	/Can't find variable: _AutofillCallbackHandler/,
	/Object Not Found Matching Id:\d+, MethodName:simulateEvent/,
	/^Java exception was raised during method invocation$/
];
var INTEGRATION_NAME$14 = "EventFilters";
var eventFiltersIntegration = defineIntegration((options = {}) => {
	let mergedOptions;
	return {
		name: INTEGRATION_NAME$14,
		setup(client) {
			mergedOptions = _mergeOptions(options, client.getOptions());
		},
		processEvent(event, _hint, client) {
			if (!mergedOptions) mergedOptions = _mergeOptions(options, client.getOptions());
			return _shouldDropEvent$1(event, mergedOptions) ? null : event;
		}
	};
});
var inboundFiltersIntegration = defineIntegration(((options = {}) => {
	return {
		...eventFiltersIntegration(options),
		name: "InboundFilters"
	};
}));
function _mergeOptions(internalOptions = {}, clientOptions = {}) {
	return {
		allowUrls: [...internalOptions.allowUrls || [], ...clientOptions.allowUrls || []],
		denyUrls: [...internalOptions.denyUrls || [], ...clientOptions.denyUrls || []],
		ignoreErrors: [
			...internalOptions.ignoreErrors || [],
			...clientOptions.ignoreErrors || [],
			...internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS
		],
		ignoreTransactions: [...internalOptions.ignoreTransactions || [], ...clientOptions.ignoreTransactions || []]
	};
}
function _shouldDropEvent$1(event, options) {
	if (!event.type) {
		if (_isIgnoredError(event, options.ignoreErrors)) {
			DEBUG_BUILD$3 && debug.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${getEventDescription(event)}`);
			return true;
		}
		if (_isUselessError(event)) {
			DEBUG_BUILD$3 && debug.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${getEventDescription(event)}`);
			return true;
		}
		if (_isDeniedUrl(event, options.denyUrls)) {
			DEBUG_BUILD$3 && debug.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${getEventDescription(event)}.
Url: ${_getEventFilterUrl(event)}`);
			return true;
		}
		if (!_isAllowedUrl(event, options.allowUrls)) {
			DEBUG_BUILD$3 && debug.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${getEventDescription(event)}.
Url: ${_getEventFilterUrl(event)}`);
			return true;
		}
	} else if (event.type === "transaction") {
		if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
			DEBUG_BUILD$3 && debug.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${getEventDescription(event)}`);
			return true;
		}
	}
	return false;
}
function _isIgnoredError(event, ignoreErrors) {
	if (!ignoreErrors?.length) return false;
	return getPossibleEventMessages(event).some((message) => stringMatchesSomePattern(message, ignoreErrors));
}
function _isIgnoredTransaction(event, ignoreTransactions) {
	if (!ignoreTransactions?.length) return false;
	const name = event.transaction;
	return name ? stringMatchesSomePattern(name, ignoreTransactions) : false;
}
function _isDeniedUrl(event, denyUrls) {
	if (!denyUrls?.length) return false;
	const url = _getEventFilterUrl(event);
	return !url ? false : stringMatchesSomePattern(url, denyUrls);
}
function _isAllowedUrl(event, allowUrls) {
	if (!allowUrls?.length) return true;
	const url = _getEventFilterUrl(event);
	return !url ? true : stringMatchesSomePattern(url, allowUrls);
}
function _getLastValidUrl(frames = []) {
	for (let i = frames.length - 1; i >= 0; i--) {
		const frame = frames[i];
		if (frame && frame.filename !== "<anonymous>" && frame.filename !== "[native code]") return frame.filename || null;
	}
	return null;
}
function _getEventFilterUrl(event) {
	try {
		const frames = [...event.exception?.values ?? []].reverse().find((value) => value.mechanism?.parent_id === void 0 && value.stacktrace?.frames?.length)?.stacktrace?.frames;
		return frames ? _getLastValidUrl(frames) : null;
	} catch {
		DEBUG_BUILD$3 && debug.error(`Cannot extract url for event ${getEventDescription(event)}`);
		return null;
	}
}
function _isUselessError(event) {
	if (!event.exception?.values?.length) return false;
	return !event.message && !event.exception.values.some((value) => value.stacktrace || value.type && value.type !== "Error" || value.value);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/aggregate-errors.js
function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, key, limit, event, hint) {
	if (!event.exception?.values || !hint || !isInstanceOf(hint.originalException, Error)) return;
	const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
	if (originalException) event.exception.values = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, hint.originalException, key, event.exception.values, originalException, 0);
}
function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
	if (prevExceptions.length >= limit + 1) return prevExceptions;
	let newExceptions = [...prevExceptions];
	if (isInstanceOf(error[key], Error)) {
		applyExceptionGroupFieldsForParentException(exception, exceptionId, error);
		const newException = exceptionFromErrorImplementation(parser, error[key]);
		const newExceptionId = newExceptions.length;
		applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
		newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error[key], key, [newException, ...newExceptions], newException, newExceptionId);
	}
	if (isExceptionGroup(error)) error.errors.forEach((childError, i) => {
		if (isInstanceOf(childError, Error)) {
			applyExceptionGroupFieldsForParentException(exception, exceptionId, error);
			const newException = exceptionFromErrorImplementation(parser, childError);
			const newExceptionId = newExceptions.length;
			applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
			newExceptions = aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, childError, key, [newException, ...newExceptions], newException, newExceptionId);
		}
	});
	return newExceptions;
}
function isExceptionGroup(error) {
	return Array.isArray(error.errors);
}
function applyExceptionGroupFieldsForParentException(exception, exceptionId, error) {
	exception.mechanism = {
		handled: true,
		type: "auto.core.linked_errors",
		...isExceptionGroup(error) && { is_exception_group: true },
		...exception.mechanism,
		exception_id: exceptionId
	};
}
function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
	exception.mechanism = {
		handled: true,
		...exception.mechanism,
		type: "chained",
		source,
		exception_id: exceptionId,
		parent_id: parentId
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/eventbuilder.js
function parseStackFrames$1(stackParser, error) {
	return stackParser(error.stack || "", 1);
}
function hasSentryFetchUrlHost(error) {
	return isError(error) && "__sentry_fetch_url_host__" in error && typeof error.__sentry_fetch_url_host__ === "string";
}
function _enhanceErrorWithSentryInfo(error) {
	if (hasSentryFetchUrlHost(error)) return `${error.message} (${error.__sentry_fetch_url_host__})`;
	return error.message;
}
function exceptionFromError$1(stackParser, error) {
	const exception = {
		type: error.name || error.constructor.name,
		value: _enhanceErrorWithSentryInfo(error)
	};
	const frames = parseStackFrames$1(stackParser, error);
	if (frames.length) exception.stacktrace = { frames };
	return exception;
}
function getErrorPropertyFromObject$1(obj) {
	for (const prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) {
		const value = obj[prop];
		if (value instanceof Error) return value;
	}
}
function getMessageForObject(exception) {
	if ("name" in exception && typeof exception.name === "string") {
		let message = `'${exception.name}' captured as exception`;
		if ("message" in exception && typeof exception.message === "string") message += ` with message '${exception.message}'`;
		return message;
	} else if ("message" in exception && typeof exception.message === "string") return exception.message;
	const keys = extractExceptionKeysForMessage(exception);
	if (isErrorEvent$1(exception)) return `Event \`ErrorEvent\` captured as exception with message \`${exception.message}\``;
	const className = getObjectClassName$1(exception);
	return `${className && className !== "Object" ? `'${className}'` : "Object"} captured as exception with keys: ${keys}`;
}
function getObjectClassName$1(obj) {
	try {
		const prototype = Object.getPrototypeOf(obj);
		return prototype ? prototype.constructor.name : void 0;
	} catch {}
}
function getException(client, mechanism, exception, hint) {
	if (isError(exception)) return [exception, void 0];
	mechanism.synthetic = true;
	if (isPlainObject(exception)) {
		const normalizeDepth = client?.getOptions().normalizeDepth;
		const extras = { ["__serialized__"]: normalizeToSize(exception, normalizeDepth) };
		const errorFromProp = getErrorPropertyFromObject$1(exception);
		if (errorFromProp) return [errorFromProp, extras];
		const message = getMessageForObject(exception);
		const ex2 = hint?.syntheticException || new Error(message);
		ex2.message = message;
		return [ex2, extras];
	}
	const ex = hint?.syntheticException || new Error(exception);
	ex.message = `${exception}`;
	return [ex, void 0];
}
function eventFromUnknownInput$1(client, stackParser, exception, hint) {
	const mechanism = hint?.data && hint.data.mechanism || {
		handled: true,
		type: "generic"
	};
	const [ex, extras] = getException(client, mechanism, exception, hint);
	const event = { exception: { values: [exceptionFromError$1(stackParser, ex)] } };
	if (extras) event.extra = extras;
	addExceptionTypeValue(event, void 0, void 0);
	addExceptionMechanism(event, mechanism);
	return {
		...event,
		event_id: hint?.event_id
	};
}
function eventFromMessage$1(stackParser, message, level = "info", hint, attachStacktrace) {
	const event = {
		event_id: hint?.event_id,
		level
	};
	if (attachStacktrace && hint?.syntheticException) {
		const frames = parseStackFrames$1(stackParser, hint.syntheticException);
		if (frames.length) {
			event.exception = { values: [{
				value: message,
				stacktrace: { frames }
			}] };
			addExceptionMechanism(event, { synthetic: true });
		}
	}
	if (isParameterizedString(message)) {
		const { __sentry_template_string__, __sentry_template_values__ } = message;
		event.logentry = {
			message: __sentry_template_string__,
			params: __sentry_template_values__
		};
		return event;
	}
	event.message = message;
	return event;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/console.js
var _filter = /* @__PURE__ */ new Set([]);
function addConsoleInstrumentationHandler(handler) {
	const type = "console";
	const removeHandler = addHandler$1(type, handler);
	maybeInstrument(type, instrumentConsole);
	return removeHandler;
}
function addConsoleInstrumentationFilter(filter) {
	for (const f of filter) _filter.add(f);
	return () => {
		for (const f of filter) _filter.delete(f);
	};
}
var instrumentedLevels = /* @__PURE__ */ new Set();
function instrumentConsole() {
	if (!("console" in GLOBAL_OBJ)) return;
	CONSOLE_LEVELS.forEach(function(level) {
		if (instrumentedLevels.has(level) || !(level in GLOBAL_OBJ.console)) return;
		instrumentedLevels.add(level);
		fill(GLOBAL_OBJ.console, level, function(originalConsoleMethod) {
			originalConsoleMethods[level] = originalConsoleMethod;
			return function(...args) {
				const firstArg = args[0];
				const log = originalConsoleMethods[level];
				const isFiltered = _filter.size && typeof firstArg === "string" && stringMatchesSomePattern(firstArg, _filter);
				if (!isFiltered) triggerHandlers$1("console", {
					args,
					level
				});
				if (!isFiltered || DEBUG_BUILD$3 && debug.isEnabled()) log?.apply(GLOBAL_OBJ.console, args);
			};
		});
	});
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/severity.js
function severityLevelFromString(level) {
	return level === "warn" ? "warning" : [
		"fatal",
		"error",
		"warning",
		"log",
		"info",
		"debug"
	].includes(level) ? level : "log";
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/dedupe.js
var INTEGRATION_NAME$13 = "Dedupe";
var _dedupeIntegration = (() => {
	let previousEvent;
	return {
		name: INTEGRATION_NAME$13,
		processEvent(currentEvent) {
			if (currentEvent.type) return currentEvent;
			try {
				if (_shouldDropEvent(currentEvent, previousEvent)) {
					DEBUG_BUILD$3 && debug.warn("Event dropped due to being a duplicate of previously captured event.");
					return null;
				}
			} catch {}
			return previousEvent = currentEvent;
		}
	};
});
var dedupeIntegration = defineIntegration(_dedupeIntegration);
function _shouldDropEvent(currentEvent, previousEvent) {
	if (!previousEvent) return false;
	if (_isSameMessageEvent(currentEvent, previousEvent)) return true;
	if (_isSameExceptionEvent(currentEvent, previousEvent)) return true;
	return false;
}
function _isSameMessageEvent(currentEvent, previousEvent) {
	const currentMessage = currentEvent.message;
	const previousMessage = previousEvent.message;
	if (!currentMessage && !previousMessage) return false;
	if (currentMessage && !previousMessage || !currentMessage && previousMessage) return false;
	if (currentMessage !== previousMessage) return false;
	if (!_isSameFingerprint(currentEvent, previousEvent)) return false;
	if (!_isSameStacktrace(currentEvent, previousEvent)) return false;
	return true;
}
function _isSameExceptionEvent(currentEvent, previousEvent) {
	const previousException = _getExceptionFromEvent(previousEvent);
	const currentException = _getExceptionFromEvent(currentEvent);
	if (!previousException || !currentException) return false;
	if (previousException.type !== currentException.type || previousException.value !== currentException.value) return false;
	if (!_isSameFingerprint(currentEvent, previousEvent)) return false;
	if (!_isSameStacktrace(currentEvent, previousEvent)) return false;
	return true;
}
function _isSameStacktrace(currentEvent, previousEvent) {
	let currentFrames = getFramesFromEvent(currentEvent);
	let previousFrames = getFramesFromEvent(previousEvent);
	if (!currentFrames && !previousFrames) return true;
	if (currentFrames && !previousFrames || !currentFrames && previousFrames) return false;
	currentFrames = currentFrames;
	previousFrames = previousFrames;
	if (previousFrames.length !== currentFrames.length) return false;
	for (let i = 0; i < previousFrames.length; i++) {
		const frameA = previousFrames[i];
		const frameB = currentFrames[i];
		if (frameA.filename !== frameB.filename || frameA.lineno !== frameB.lineno || frameA.colno !== frameB.colno || frameA.function !== frameB.function) return false;
	}
	return true;
}
function _isSameFingerprint(currentEvent, previousEvent) {
	let currentFingerprint = currentEvent.fingerprint;
	let previousFingerprint = previousEvent.fingerprint;
	if (!currentFingerprint && !previousFingerprint) return true;
	if (currentFingerprint && !previousFingerprint || !currentFingerprint && previousFingerprint) return false;
	currentFingerprint = currentFingerprint;
	previousFingerprint = previousFingerprint;
	try {
		return !!(currentFingerprint.join("") === previousFingerprint.join(""));
	} catch {
		return false;
	}
}
function _getExceptionFromEvent(event) {
	return event.exception?.values?.[0];
}
var SPAN_FLAG_ATTRIBUTE_PREFIX = "flag.evaluation.";
function _INTERNAL_copyFlagsFromScopeToEvent(event) {
	if (event.type) return event;
	const flagContext = getCurrentScope().getScopeData().contexts.flags;
	const flagBuffer = flagContext ? flagContext.values : [];
	if (!flagBuffer.length) return event;
	if (event.contexts === void 0) event.contexts = {};
	event.contexts.flags = { values: [...flagBuffer] };
	return event;
}
function _INTERNAL_insertFlagToScope(name, value, maxSize = 100) {
	const scopeContexts = getCurrentScope().getScopeData().contexts;
	if (!scopeContexts.flags) scopeContexts.flags = { values: [] };
	const flags = scopeContexts.flags.values;
	_INTERNAL_insertToFlagBuffer(flags, name, value, maxSize);
}
function _INTERNAL_insertToFlagBuffer(flags, name, value, maxSize) {
	if (typeof value !== "boolean") return;
	if (flags.length > maxSize) {
		DEBUG_BUILD$3 && debug.error(`[Feature Flags] insertToFlagBuffer called on a buffer larger than maxSize=${maxSize}`);
		return;
	}
	const index = flags.findIndex((f) => f.flag === name);
	if (index !== -1) flags.splice(index, 1);
	if (flags.length === maxSize) flags.shift();
	flags.push({
		flag: name,
		result: value
	});
}
function _INTERNAL_addFeatureFlagToActiveSpan(name, value, maxFlagsPerSpan = 10) {
	if (typeof value !== "boolean") return;
	const span = getActiveSpan();
	if (!span) return;
	const attributes = spanToJSON(span).data;
	if (`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name}` in attributes) {
		span.setAttribute(`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name}`, value);
		return;
	}
	if (Object.keys(attributes).filter((key) => key.startsWith(SPAN_FLAG_ATTRIBUTE_PREFIX)).length < maxFlagsPerSpan) span.setAttribute(`${SPAN_FLAG_ATTRIBUTE_PREFIX}${name}`, value);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/featureFlags/growthbook.js
var growthbookIntegration$1 = defineIntegration(({ growthbookClass }) => {
	return {
		name: "GrowthBook",
		setupOnce() {
			const proto = growthbookClass.prototype;
			if (typeof proto.isOn === "function") fill(proto, "isOn", _wrapAndCaptureBooleanResult);
			if (typeof proto.getFeatureValue === "function") fill(proto, "getFeatureValue", _wrapAndCaptureBooleanResult);
		},
		processEvent(event, _hint, _client) {
			return _INTERNAL_copyFlagsFromScopeToEvent(event);
		}
	};
});
function _wrapAndCaptureBooleanResult(original) {
	return function(...args) {
		const flagName = args[0];
		const result = original.apply(this, args);
		if (typeof flagName === "string" && typeof result === "boolean") {
			_INTERNAL_insertFlagToScope(flagName, result);
			_INTERNAL_addFeatureFlagToActiveSpan(flagName, result);
		}
		return result;
	};
}
//#endregion
//#region node_modules/@sentry/core/build/esm/integrations/conversationId.js
var INTEGRATION_NAME$12 = "ConversationId";
var _conversationIdIntegration = (() => {
	return {
		name: INTEGRATION_NAME$12,
		setup(client) {
			client.on("spanStart", (span) => {
				const scopeData = getCurrentScope().getScopeData();
				const isolationScopeData = getIsolationScope().getScopeData();
				const conversationId = scopeData.conversationId || isolationScopeData.conversationId;
				if (conversationId) {
					const { op, data: attributes, description: name } = spanToJSON(span);
					if (!op?.startsWith("gen_ai.") && !attributes["ai.operationId"] && !name?.startsWith("ai.")) return;
					span.setAttribute(GEN_AI_CONVERSATION_ID_ATTRIBUTE, conversationId);
				}
			});
		}
	};
});
var conversationIdIntegration = defineIntegration(_conversationIdIntegration);
//#endregion
//#region node_modules/@sentry/core/build/esm/fetch.js
function instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeaders, spans, spanOriginOrOptions) {
	if (!handlerData.fetchData) return;
	const { method, url } = handlerData.fetchData;
	const shouldCreateSpanResult = hasSpansEnabled() && shouldCreateSpan(url);
	if (handlerData.endTimestamp) {
		const spanId = handlerData.fetchData.__span;
		if (!spanId) return;
		const span2 = spans[spanId];
		if (span2) {
			if (shouldCreateSpanResult) {
				endSpan(span2, handlerData);
				_callOnRequestSpanEnd(span2, handlerData, spanOriginOrOptions);
			}
			delete spans[spanId];
		}
		return;
	}
	const { spanOrigin = "auto.http.browser", propagateTraceparent = false } = typeof spanOriginOrOptions === "object" ? spanOriginOrOptions : { spanOrigin: spanOriginOrOptions };
	const client = getClient();
	const hasParent = !!getActiveSpan();
	const shouldEmitSpan = hasParent || !!client && hasSpanStreamingEnabled(client);
	const span = shouldCreateSpanResult && shouldEmitSpan ? startInactiveSpan(getSpanStartOptions(url, method, spanOrigin)) : new SentryNonRecordingSpan();
	const spanForTraceHeaders = spanIsIgnored(span) && hasParent ? void 0 : span;
	if (shouldCreateSpanResult && !shouldEmitSpan) client?.recordDroppedEvent("no_parent_span", "span");
	handlerData.fetchData.__span = span.spanContext().spanId;
	spans[span.spanContext().spanId] = span;
	if (shouldAttachHeaders(handlerData.fetchData.url)) {
		const request = handlerData.args[0];
		const options = { ...handlerData.args[1] || {} };
		const headers = _INTERNAL_getTracingHeadersForFetchRequest(request, options, hasSpansEnabled() && shouldEmitSpan ? spanForTraceHeaders : void 0, propagateTraceparent);
		if (headers) {
			handlerData.args[1] = options;
			options.headers = headers;
		}
	}
	if (client) {
		const fetchHint = {
			input: handlerData.args,
			response: handlerData.response,
			startTimestamp: handlerData.startTimestamp,
			endTimestamp: handlerData.endTimestamp
		};
		client.emit("beforeOutgoingRequestSpan", span, fetchHint);
	}
	return span;
}
function _callOnRequestSpanEnd(span, handlerData, spanOriginOrOptions) {
	(typeof spanOriginOrOptions === "object" && spanOriginOrOptions !== null ? spanOriginOrOptions.onRequestSpanEnd : void 0)?.(span, {
		headers: handlerData.response?.headers,
		error: handlerData.error
	});
}
function _INTERNAL_getTracingHeadersForFetchRequest(request, fetchOptionsObj, span, propagateTraceparent) {
	const traceHeaders = getTraceData({
		span,
		propagateTraceparent
	});
	const sentryTrace = traceHeaders["sentry-trace"];
	const baggage = traceHeaders.baggage;
	const traceparent = traceHeaders.traceparent;
	if (!sentryTrace) return;
	const originalHeaders = fetchOptionsObj.headers || (isRequest(request) ? request.headers : void 0);
	if (!originalHeaders) return { ...traceHeaders };
	else if (isHeaders(originalHeaders)) {
		const newHeaders = new Headers(originalHeaders);
		if (!newHeaders.get("sentry-trace")) newHeaders.set("sentry-trace", sentryTrace);
		if (propagateTraceparent && traceparent && !newHeaders.get("traceparent")) newHeaders.set("traceparent", traceparent);
		if (baggage) {
			const prevBaggageHeader = newHeaders.get("baggage");
			if (!prevBaggageHeader) newHeaders.set("baggage", baggage);
			else if (!baggageHeaderHasSentryBaggageValues(prevBaggageHeader)) newHeaders.set("baggage", `${prevBaggageHeader},${baggage}`);
		}
		return newHeaders;
	} else if (isHeadersInitTupleArray(originalHeaders)) {
		const newHeaders = [...originalHeaders];
		if (!newHeaders.find((header) => header[0] === "sentry-trace")) newHeaders.push(["sentry-trace", sentryTrace]);
		if (propagateTraceparent && traceparent && !newHeaders.find((header) => header[0] === "traceparent")) newHeaders.push(["traceparent", traceparent]);
		const prevBaggageHeaderWithSentryValues = originalHeaders.find((header) => header[0] === "baggage" && typeof header[1] === "string" && baggageHeaderHasSentryBaggageValues(header[1]));
		if (baggage && !prevBaggageHeaderWithSentryValues) newHeaders.push(["baggage", baggage]);
		return newHeaders;
	} else {
		const existingSentryTraceHeader = "sentry-trace" in originalHeaders ? originalHeaders["sentry-trace"] : void 0;
		const existingTraceparentHeader = "traceparent" in originalHeaders ? originalHeaders.traceparent : void 0;
		const existingBaggageHeader = "baggage" in originalHeaders ? originalHeaders.baggage : void 0;
		const newBaggageHeaders = existingBaggageHeader ? Array.isArray(existingBaggageHeader) ? [...existingBaggageHeader] : [existingBaggageHeader] : [];
		const prevBaggageHeaderWithSentryValues = existingBaggageHeader && (Array.isArray(existingBaggageHeader) ? existingBaggageHeader.find((headerItem) => baggageHeaderHasSentryBaggageValues(headerItem)) : baggageHeaderHasSentryBaggageValues(existingBaggageHeader));
		if (baggage && !prevBaggageHeaderWithSentryValues) newBaggageHeaders.push(baggage);
		const newHeaders = Object.assign({}, originalHeaders, {
			"sentry-trace": existingSentryTraceHeader ?? sentryTrace,
			baggage: newBaggageHeaders.length > 0 ? newBaggageHeaders.join(",") : void 0
		});
		if (propagateTraceparent && traceparent && !existingTraceparentHeader) newHeaders.traceparent = traceparent;
		return newHeaders;
	}
}
function endSpan(span, handlerData) {
	if (handlerData.response) {
		setHttpStatus(span, handlerData.response.status);
		const contentLength = handlerData.response?.headers?.get("content-length");
		if (contentLength) {
			const contentLengthNum = parseInt(contentLength);
			if (contentLengthNum > 0) span.setAttribute("http.response_content_length", contentLengthNum);
		}
	} else if (handlerData.error) span.setStatus({
		code: 2,
		message: "internal_error"
	});
	span.end();
}
function baggageHeaderHasSentryBaggageValues(baggageHeader) {
	if (typeof baggageHeader !== "string") return false;
	return baggageHeader.split(",").some((baggageEntry) => baggageEntry.trim().startsWith(SENTRY_BAGGAGE_KEY_PREFIX));
}
function isHeaders(headers) {
	return typeof Headers !== "undefined" && isInstanceOf(headers, Headers);
}
function isHeadersInitTupleArray(headers) {
	if (!Array.isArray(headers)) return false;
	return headers.every((item) => Array.isArray(item) && item.length === 2 && typeof item[0] === "string");
}
function getSpanStartOptions(url, method, spanOrigin) {
	if (url.startsWith("data:")) return {
		name: `${method} ${stripDataUrlContent(url)}`,
		attributes: getFetchSpanAttributes(url, void 0, method, spanOrigin)
	};
	const parsedUrl = parseStringToURLObject(url);
	return {
		name: `${method} ${parsedUrl ? getSanitizedUrlStringFromUrlObject(parsedUrl) : url}`,
		attributes: getFetchSpanAttributes(url, parsedUrl, method, spanOrigin)
	};
}
function getFetchSpanAttributes(url, parsedUrl, method, spanOrigin) {
	const attributes = {
		url: stripDataUrlContent(url),
		type: "fetch",
		"http.method": method,
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client"
	};
	if (parsedUrl) {
		if (!isURLObjectRelative(parsedUrl)) {
			attributes["http.url"] = stripDataUrlContent(parsedUrl.href);
			attributes["server.address"] = parsedUrl.host;
		}
		if (parsedUrl.search) attributes["http.query"] = parsedUrl.search;
		if (parsedUrl.hash) attributes["http.fragment"] = parsedUrl.hash;
	}
	return attributes;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/feedback.js
function captureFeedback(params, hint = {}, scope = getCurrentScope()) {
	const { message, name, email, url, source, associatedEventId, tags } = params;
	const feedbackEvent = {
		contexts: { feedback: {
			contact_email: email,
			name,
			message,
			url,
			source,
			associated_event_id: associatedEventId
		} },
		type: "feedback",
		level: "info",
		tags
	};
	const client = scope?.getClient() || getClient();
	if (client) client.emit("beforeSendFeedback", feedbackEvent, hint);
	return scope.captureEvent(feedbackEvent, hint);
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/envelope.js
function createStreamedSpanEnvelope(serializedSpans, dsc, client) {
	const options = client.getOptions();
	const dsn = client.getDsn();
	const tunnel = options.tunnel;
	const sdk = getSdkMetadataForEnvelopeHeader(options._metadata);
	const headers = {
		sent_at: new Date(safeDateNow()).toISOString(),
		...dscHasRequiredProps(dsc) && { trace: dsc },
		...sdk && { sdk },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) }
	};
	const inferSetting = client.getDataCollectionOptions().userInfo ? "auto" : "never";
	return createEnvelope(headers, [[{
		type: "span",
		item_count: serializedSpans.length,
		content_type: "application/vnd.sentry.items.span.v2+json"
	}, {
		version: 2,
		...isBrowser() && { ingest_settings: {
			infer_ip: inferSetting,
			infer_user_agent: inferSetting
		} },
		items: serializedSpans
	}]]);
}
function dscHasRequiredProps(dsc) {
	return !!dsc.trace_id && !!dsc.public_key;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/estimateSize.js
function estimateSerializedSpanSizeInBytes(span) {
	let weight = 156;
	weight += span.name.length * 2;
	weight += estimateTypedAttributesSizeInBytes(span.attributes);
	if (span.links && span.links.length > 0) {
		const attributes = span.links[0]?.attributes;
		const linkWeight = 100 + (attributes ? estimateTypedAttributesSizeInBytes(attributes) : 0);
		weight += linkWeight * span.links.length;
	}
	return weight;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/tracing/spans/spanBuffer.js
var MAX_SPANS_PER_ENVELOPE = 1e3;
var MAX_TRACE_WEIGHT_IN_BYTES = 5e6;
var SpanBuffer = class {
	constructor(client, options) {
		this._traceBuckets = /* @__PURE__ */ new Map();
		this._client = client;
		const { maxSpanLimit, flushInterval, maxTraceWeightInBytes } = options ?? {};
		this._maxSpanLimit = maxSpanLimit && maxSpanLimit > 0 && maxSpanLimit <= MAX_SPANS_PER_ENVELOPE ? maxSpanLimit : MAX_SPANS_PER_ENVELOPE;
		this._flushInterval = flushInterval && flushInterval > 0 ? flushInterval : 5e3;
		this._maxTraceWeight = maxTraceWeightInBytes && maxTraceWeightInBytes > 0 ? maxTraceWeightInBytes : MAX_TRACE_WEIGHT_IN_BYTES;
		this._client.on("flush", () => {
			this.drain();
		});
		this._client.on("close", () => {
			this._traceBuckets.forEach((bucket) => {
				clearTimeout(bucket.timeout);
			});
			this._traceBuckets.clear();
		});
	}
	/**
	* Add a span to the buffer.
	*/
	add(spanJSON) {
		const traceId = spanJSON.trace_id;
		let bucket = this._traceBuckets.get(traceId);
		if (!bucket) {
			bucket = {
				spans: /* @__PURE__ */ new Set(),
				size: 0,
				timeout: safeUnref(setTimeout(() => {
					this.flush(traceId);
				}, this._flushInterval))
			};
			this._traceBuckets.set(traceId, bucket);
		}
		bucket.spans.add(spanJSON);
		bucket.size += estimateSerializedSpanSizeInBytes(spanJSON);
		if (bucket.spans.size >= this._maxSpanLimit || bucket.size >= this._maxTraceWeight) this.flush(traceId);
	}
	/**
	* Drain and flush all buffered traces.
	*/
	drain() {
		if (!this._traceBuckets.size) return;
		DEBUG_BUILD$3 && debug.log(`Flushing span tree map with ${this._traceBuckets.size} traces`);
		this._traceBuckets.forEach((_, traceId) => {
			this.flush(traceId);
		});
	}
	/**
	* Flush spans of a specific trace.
	* In contrast to {@link SpanBuffer.drain}, this method does not flush all traces, but only the one with the given traceId.
	*/
	flush(traceId) {
		const bucket = this._traceBuckets.get(traceId);
		if (!bucket) return;
		if (!bucket.spans.size) {
			this._removeTrace(traceId);
			return;
		}
		const spans = Array.from(bucket.spans);
		const segmentSpan = spans[0]?._segmentSpan;
		if (!segmentSpan) {
			DEBUG_BUILD$3 && debug.warn("No segment span reference found on span JSON, cannot compute DSC");
			this._removeTrace(traceId);
			return;
		}
		const dsc = getDynamicSamplingContextFromSpan(segmentSpan);
		const cleanedSpans = spans.map((spanJSON) => {
			const { _segmentSpan, ...cleanSpanJSON } = spanJSON;
			return cleanSpanJSON;
		});
		const envelope = createStreamedSpanEnvelope(cleanedSpans, dsc, this._client);
		DEBUG_BUILD$3 && debug.log(`Sending span envelope for trace ${traceId} with ${cleanedSpans.length} spans`);
		this._client.sendEnvelope(envelope).then(null, (reason) => {
			DEBUG_BUILD$3 && debug.error("Error while sending streamed span envelope:", reason);
		});
		this._removeTrace(traceId);
	}
	_removeTrace(traceId) {
		const bucket = this._traceBuckets.get(traceId);
		if (bucket) clearTimeout(bucket.timeout);
		this._traceBuckets.delete(traceId);
	}
};
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/breadcrumb-log-level.js
function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
	if (statusCode === void 0) return;
	else if (statusCode >= 400 && statusCode < 500) return "warning";
	else if (statusCode >= 500) return "error";
	else return;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/supports.js
var WINDOW$6 = GLOBAL_OBJ;
function supportsHistory() {
	return "history" in WINDOW$6 && !!WINDOW$6.history;
}
function _isFetchSupported() {
	if (!("fetch" in WINDOW$6)) return false;
	try {
		new Headers();
		new Request("data:,");
		new Response();
		return true;
	} catch {
		return false;
	}
}
function isNativeFunction(func) {
	return func && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
}
function supportsNativeFetch() {
	if (typeof EdgeRuntime === "string") return true;
	if (!_isFetchSupported()) return false;
	if (isNativeFunction(WINDOW$6.fetch)) return true;
	let result = false;
	const doc = WINDOW$6.document;
	if (doc && typeof doc.createElement === "function") try {
		const sandbox = doc.createElement("iframe");
		sandbox.hidden = true;
		doc.head.appendChild(sandbox);
		if (sandbox.contentWindow?.fetch) result = isNativeFunction(sandbox.contentWindow.fetch);
		doc.head.removeChild(sandbox);
	} catch (err) {
		DEBUG_BUILD$3 && debug.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", err);
	}
	return result;
}
function supportsReportingObserver() {
	return "ReportingObserver" in WINDOW$6;
}
//#endregion
//#region node_modules/@sentry/core/build/esm/instrument/fetch.js
function addFetchInstrumentationHandler(handler, skipNativeFetchCheck) {
	const type = "fetch";
	const removeHandler = addHandler$1(type, handler);
	maybeInstrument(type, () => instrumentFetch(void 0, skipNativeFetchCheck));
	return removeHandler;
}
function addFetchEndInstrumentationHandler(handler) {
	const type = "fetch-body-resolved";
	const removeHandler = addHandler$1(type, handler);
	maybeInstrument(type, () => instrumentFetch(streamHandler));
	return removeHandler;
}
function instrumentFetch(onFetchResolved, skipNativeFetchCheck = false) {
	if (skipNativeFetchCheck && !supportsNativeFetch()) return;
	fill(GLOBAL_OBJ, "fetch", function(originalFetch) {
		return function(...args) {
			const virtualError = /* @__PURE__ */ new Error();
			const { method, url } = parseFetchArgs(args);
			const handlerData = {
				args,
				fetchData: {
					method,
					url
				},
				startTimestamp: timestampInSeconds() * 1e3,
				virtualError,
				headers: getHeadersFromFetchArgs(args)
			};
			if (!onFetchResolved) triggerHandlers$1("fetch", { ...handlerData });
			return originalFetch.apply(GLOBAL_OBJ, args).then(async (response) => {
				if (onFetchResolved) onFetchResolved(response);
				else triggerHandlers$1("fetch", {
					...handlerData,
					endTimestamp: timestampInSeconds() * 1e3,
					response
				});
				return response;
			}, (error) => {
				triggerHandlers$1("fetch", {
					...handlerData,
					endTimestamp: timestampInSeconds() * 1e3,
					error
				});
				if (isError(error) && error.stack === void 0) {
					error.stack = virtualError.stack;
					addNonEnumerableProperty(error, "framesToPop", 1);
				}
				const enhanceOption = getClient()?.getOptions().enhanceFetchErrorMessages ?? "always";
				if (enhanceOption !== false && error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "Load failed" || error.message === "NetworkError when attempting to fetch resource.")) try {
					const hostname = new URL(handlerData.fetchData.url).host;
					if (enhanceOption === "always") error.message = `${error.message} (${hostname})`;
					else addNonEnumerableProperty(error, "__sentry_fetch_url_host__", hostname);
				} catch {}
				throw error;
			});
		};
	});
}
async function resolveResponse(res, onFinishedResolving) {
	if (res?.body) {
		const body = res.body;
		const responseReader = body.getReader();
		const maxFetchDurationTimeout = setTimeout(() => {
			body.cancel().then(null, () => {});
		}, 90 * 1e3);
		let readingActive = true;
		while (readingActive) {
			let chunkTimeout;
			try {
				chunkTimeout = setTimeout(() => {
					body.cancel().then(null, () => {});
				}, 5e3);
				const { done } = await responseReader.read();
				clearTimeout(chunkTimeout);
				if (done) {
					onFinishedResolving();
					readingActive = false;
				}
			} catch {
				readingActive = false;
			} finally {
				clearTimeout(chunkTimeout);
			}
		}
		clearTimeout(maxFetchDurationTimeout);
		responseReader.releaseLock();
		body.cancel().then(null, () => {});
	}
}
function streamHandler(response) {
	let clonedResponseForResolving;
	try {
		clonedResponseForResolving = response.clone();
	} catch {
		return;
	}
	resolveResponse(clonedResponseForResolving, () => {
		triggerHandlers$1("fetch-body-resolved", {
			endTimestamp: timestampInSeconds() * 1e3,
			response
		});
	});
}
function hasProp(obj, prop) {
	return isObjectLike(obj) && !!obj[prop];
}
function getUrlFromResource(resource) {
	if (typeof resource === "string") return resource;
	if (!resource) return "";
	if (hasProp(resource, "url")) return resource.url;
	if (resource.toString) return resource.toString();
	return "";
}
function parseFetchArgs(fetchArgs) {
	if (fetchArgs.length === 0) return {
		method: "GET",
		url: ""
	};
	if (fetchArgs.length === 2) {
		const [resource, options] = fetchArgs;
		return {
			url: getUrlFromResource(resource),
			method: hasProp(options, "method") ? String(options.method).toUpperCase() : isRequest(resource) && hasProp(resource, "method") ? String(resource.method).toUpperCase() : "GET"
		};
	}
	const arg = fetchArgs[0];
	return {
		url: getUrlFromResource(arg),
		method: hasProp(arg, "method") ? String(arg.method).toUpperCase() : "GET"
	};
}
function getHeadersFromFetchArgs(fetchArgs) {
	const [requestArgument, optionsArgument] = fetchArgs;
	try {
		if (typeof optionsArgument === "object" && optionsArgument !== null && "headers" in optionsArgument && optionsArgument.headers) return new Headers(optionsArgument.headers);
		if (isRequest(requestArgument)) return new Headers(requestArgument.headers);
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/build/esm/utils/browser.js
var WINDOW$5 = GLOBAL_OBJ;
function getLocationHref() {
	try {
		return WINDOW$5.document.location.href;
	} catch {
		return "";
	}
}
function getComponentName(elem, maxTraverseHeight = 5) {
	if (!WINDOW$5.HTMLElement) return null;
	let currentElem = elem;
	for (let i = 0; i < maxTraverseHeight; i++) {
		if (!currentElem) return null;
		if (currentElem instanceof HTMLElement) {
			if (currentElem.dataset["sentryComponent"]) return currentElem.dataset["sentryComponent"];
			if (currentElem.dataset["sentryElement"]) return currentElem.dataset["sentryElement"];
		}
		currentElem = currentElem.parentNode;
	}
	return null;
}
//#endregion
//#region node_modules/@sentry/feedback/build/npm/esm/index.js
var WINDOW$4 = GLOBAL_OBJ;
var DOCUMENT = WINDOW$4.document;
var NAVIGATOR = WINDOW$4.navigator;
var TRIGGER_LABEL = "Report a Bug";
var CANCEL_BUTTON_LABEL = "Cancel";
var SUBMIT_BUTTON_LABEL = "Send Bug Report";
var CONFIRM_BUTTON_LABEL = "Confirm";
var FORM_TITLE = "Report a Bug";
var EMAIL_PLACEHOLDER = "your.email@example.org";
var EMAIL_LABEL = "Email";
var MESSAGE_PLACEHOLDER = "What's the bug? What did you expect?";
var MESSAGE_LABEL = "Description";
var NAME_PLACEHOLDER = "Your Name";
var NAME_LABEL = "Name";
var SUCCESS_MESSAGE_TEXT = "Thank you for your report!";
var IS_REQUIRED_LABEL = "(required)";
var ADD_SCREENSHOT_LABEL = "Add a screenshot";
var REMOVE_SCREENSHOT_LABEL = "Remove screenshot";
var HIGHLIGHT_TOOL_TEXT = "Highlight";
var HIDE_TOOL_TEXT = "Hide";
var REMOVE_HIGHLIGHT_TEXT = "Remove";
var ERROR_EMPTY_MESSAGE_TEXT = "Unable to submit feedback with empty message";
var ERROR_NO_CLIENT_TEXT = "No client setup, cannot send feedback.";
var ERROR_TIMEOUT_TEXT = "Unable to determine if Feedback was correctly sent.";
var ERROR_FORBIDDEN_TEXT = "Unable to send feedback. This could be because this domain is not in your list of allowed domains.";
var ERROR_GENERIC_TEXT = "Unable to send feedback. This could be because of network issues, or because you are using an ad-blocker.";
var FEEDBACK_WIDGET_SOURCE = "widget";
var FEEDBACK_API_SOURCE = "api";
var SUCCESS_MESSAGE_TIMEOUT = 5e3;
var DEFAULT_MESSAGES = {
	ERROR_EMPTY_MESSAGE: ERROR_EMPTY_MESSAGE_TEXT,
	ERROR_NO_CLIENT: ERROR_NO_CLIENT_TEXT,
	ERROR_TIMEOUT: ERROR_TIMEOUT_TEXT,
	ERROR_FORBIDDEN: ERROR_FORBIDDEN_TEXT,
	ERROR_GENERIC: ERROR_GENERIC_TEXT
};
function resolveFeedbackErrorMessage(code, messages) {
	return messages?.[code] ?? DEFAULT_MESSAGES[code];
}
function createFeedbackError(code, messages) {
	return new Error(resolveFeedbackErrorMessage(code, messages));
}
var sendFeedback = (params, hint = { includeReplay: true }) => {
	const errorMessages = hint.errorMessages;
	if (!params.message) throw createFeedbackError("ERROR_EMPTY_MESSAGE", errorMessages);
	const client = getClient();
	if (!client) throw createFeedbackError("ERROR_NO_CLIENT", errorMessages);
	if (params.tags && Object.keys(params.tags).length) getCurrentScope().setTags(params.tags);
	const eventId = captureFeedback({
		source: FEEDBACK_API_SOURCE,
		url: getLocationHref(),
		...params
	}, hint);
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			cleanup();
			reject(resolveFeedbackErrorMessage("ERROR_TIMEOUT", errorMessages));
		}, 3e4);
		const cleanup = client.on("afterSendEvent", (event, response) => {
			if (event.event_id !== eventId) return;
			clearTimeout(timeout);
			cleanup();
			if (response?.statusCode && response.statusCode >= 200 && response.statusCode < 300) return resolve(eventId);
			if (response?.statusCode === 403) return reject(resolveFeedbackErrorMessage("ERROR_FORBIDDEN", errorMessages));
			return reject(resolveFeedbackErrorMessage("ERROR_GENERIC", errorMessages));
		});
	});
};
var DEBUG_BUILD$2 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
function isScreenshotSupported() {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(NAVIGATOR.userAgent)) return false;
	if (/Macintosh/i.test(NAVIGATOR.userAgent) && NAVIGATOR.maxTouchPoints && NAVIGATOR.maxTouchPoints > 1) return false;
	if (!isSecureContext) return false;
	return true;
}
function mergeOptions(defaultOptions, optionOverrides) {
	return {
		...defaultOptions,
		...optionOverrides,
		tags: {
			...defaultOptions.tags,
			...optionOverrides.tags
		},
		onFormOpen: () => {
			optionOverrides.onFormOpen?.();
			defaultOptions.onFormOpen?.();
		},
		onFormClose: () => {
			optionOverrides.onFormClose?.();
			defaultOptions.onFormClose?.();
		},
		onSubmitSuccess: (data, eventId) => {
			optionOverrides.onSubmitSuccess?.(data, eventId);
			defaultOptions.onSubmitSuccess?.(data, eventId);
		},
		onSubmitError: (error) => {
			optionOverrides.onSubmitError?.(error);
			defaultOptions.onSubmitError?.(error);
		},
		onFormSubmitted: () => {
			optionOverrides.onFormSubmitted?.();
			defaultOptions.onFormSubmitted?.();
		},
		themeDark: {
			...defaultOptions.themeDark,
			...optionOverrides.themeDark
		},
		themeLight: {
			...defaultOptions.themeLight,
			...optionOverrides.themeLight
		}
	};
}
function createActorStyles(styleNonce) {
	const style = DOCUMENT.createElement("style");
	style.textContent = `
.widget__actor {
  position: fixed;
  z-index: var(--z-index);
  margin: var(--page-margin);
  inset: var(--actor-inset);

  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;

  font-family: inherit;
  font-size: var(--font-size);
  font-weight: 600;
  line-height: 1.14em;
  text-decoration: none;

  background: var(--actor-background, var(--background));
  border-radius: var(--actor-border-radius, 1.7em/50%);
  border: var(--actor-border, var(--border));
  box-shadow: var(--actor-box-shadow, var(--box-shadow));
  color: var(--actor-color, var(--foreground));
  fill: var(--actor-color, var(--foreground));
  cursor: pointer;
  opacity: 1;
  transition: transform 0.2s ease-in-out;
  transform: translate(0, 0) scale(1);
}
.widget__actor[aria-hidden="true"] {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transform: translate(0, 16px) scale(0.98);
}

.widget__actor:hover {
  background: var(--actor-hover-background, var(--background));
  filter: var(--interactive-filter);
}

.widget__actor svg {
  width: 1.14em;
  height: 1.14em;
}

@media (max-width: 600px) {
  .widget__actor span {
    display: none;
  }
}
`;
	if (styleNonce) style.setAttribute("nonce", styleNonce);
	return style;
}
function setAttributesNS(el, attributes) {
	Object.entries(attributes).forEach(([key, val]) => {
		el.setAttributeNS(null, key, val);
	});
	return el;
}
var SIZE = 20;
var XMLNS$2 = "http://www.w3.org/2000/svg";
function FeedbackIcon() {
	const createElementNS = (tagName) => WINDOW$4.document.createElementNS(XMLNS$2, tagName);
	const svg = setAttributesNS(createElementNS("svg"), {
		width: `${SIZE}`,
		height: `${SIZE}`,
		viewBox: `0 0 ${SIZE} ${SIZE}`,
		fill: "var(--actor-color, var(--foreground))"
	});
	const g = setAttributesNS(createElementNS("g"), { clipPath: "url(#clip0_57_80)" });
	const path = setAttributesNS(createElementNS("path"), {
		["fill-rule"]: "evenodd",
		["clip-rule"]: "evenodd",
		d: "M15.6622 15H12.3997C12.2129 14.9959 12.031 14.9396 11.8747 14.8375L8.04965 12.2H7.49956V19.1C7.4875 19.3348 7.3888 19.5568 7.22256 19.723C7.05632 19.8892 6.83435 19.9879 6.59956 20H2.04956C1.80193 19.9968 1.56535 19.8969 1.39023 19.7218C1.21511 19.5467 1.1153 19.3101 1.11206 19.0625V12.2H0.949652C0.824431 12.2017 0.700142 12.1783 0.584123 12.1311C0.468104 12.084 0.362708 12.014 0.274155 11.9255C0.185602 11.8369 0.115689 11.7315 0.0685419 11.6155C0.0213952 11.4995 -0.00202913 11.3752 -0.00034808 11.25V3.75C-0.00900498 3.62067 0.0092504 3.49095 0.0532651 3.36904C0.0972798 3.24712 0.166097 3.13566 0.255372 3.04168C0.344646 2.94771 0.452437 2.87327 0.571937 2.82307C0.691437 2.77286 0.82005 2.74798 0.949652 2.75H8.04965L11.8747 0.1625C12.031 0.0603649 12.2129 0.00407221 12.3997 0H15.6622C15.9098 0.00323746 16.1464 0.103049 16.3215 0.278167C16.4966 0.453286 16.5964 0.689866 16.5997 0.9375V3.25269C17.3969 3.42959 18.1345 3.83026 18.7211 4.41679C19.5322 5.22788 19.9878 6.32796 19.9878 7.47502C19.9878 8.62209 19.5322 9.72217 18.7211 10.5333C18.1345 11.1198 17.3969 11.5205 16.5997 11.6974V14.0125C16.6047 14.1393 16.5842 14.2659 16.5395 14.3847C16.4948 14.5035 16.4268 14.6121 16.3394 14.7042C16.252 14.7962 16.147 14.8698 16.0307 14.9206C15.9144 14.9714 15.7891 14.9984 15.6622 15ZM1.89695 10.325H1.88715V4.625H8.33715C8.52423 4.62301 8.70666 4.56654 8.86215 4.4625L12.6872 1.875H14.7247V13.125H12.6872L8.86215 10.4875C8.70666 10.3835 8.52423 10.327 8.33715 10.325H2.20217C2.15205 10.3167 2.10102 10.3125 2.04956 10.3125C1.9981 10.3125 1.94708 10.3167 1.89695 10.325ZM2.98706 12.2V18.1625H5.66206V12.2H2.98706ZM16.5997 9.93612V5.01393C16.6536 5.02355 16.7072 5.03495 16.7605 5.04814C17.1202 5.13709 17.4556 5.30487 17.7425 5.53934C18.0293 5.77381 18.2605 6.06912 18.4192 6.40389C18.578 6.73866 18.6603 7.10452 18.6603 7.47502C18.6603 7.84552 18.578 8.21139 18.4192 8.54616C18.2605 8.88093 18.0293 9.17624 17.7425 9.41071C17.4556 9.64518 17.1202 9.81296 16.7605 9.90191C16.7072 9.91509 16.6536 9.9265 16.5997 9.93612Z"
	});
	svg.appendChild(g).appendChild(path);
	const speakerDefs = createElementNS("defs");
	const speakerClipPathDef = setAttributesNS(createElementNS("clipPath"), { id: "clip0_57_80" });
	const speakerRect = setAttributesNS(createElementNS("rect"), {
		width: `${SIZE}`,
		height: `${SIZE}`,
		fill: "white"
	});
	speakerClipPathDef.appendChild(speakerRect);
	speakerDefs.appendChild(speakerClipPathDef);
	svg.appendChild(speakerDefs).appendChild(speakerClipPathDef).appendChild(speakerRect);
	return svg;
}
function Actor({ triggerLabel, triggerAriaLabel, shadow, styleNonce }) {
	const el = DOCUMENT.createElement("button");
	el.type = "button";
	el.className = "widget__actor";
	el.ariaHidden = "false";
	el.ariaLabel = triggerAriaLabel || triggerLabel || TRIGGER_LABEL;
	el.appendChild(FeedbackIcon());
	if (triggerLabel) {
		const label = DOCUMENT.createElement("span");
		label.appendChild(DOCUMENT.createTextNode(triggerLabel));
		el.appendChild(label);
	}
	const style = createActorStyles(styleNonce);
	return {
		el,
		appendToDom() {
			shadow.appendChild(style);
			shadow.appendChild(el);
		},
		removeFromDom() {
			el.remove();
			style.remove();
		},
		show() {
			el.ariaHidden = "false";
		},
		hide() {
			el.ariaHidden = "true";
		}
	};
}
var PURPLE = "rgba(88, 74, 192, 1)";
var DEFAULT_LIGHT = {
	foreground: "#2b2233",
	background: "#ffffff",
	accentForeground: "white",
	accentBackground: PURPLE,
	successColor: "#268d75",
	errorColor: "#df3338",
	border: "1.5px solid rgba(41, 35, 47, 0.13)",
	boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
	outline: "1px auto var(--accent-background)",
	interactiveFilter: "brightness(95%)"
};
var DEFAULT_DARK = {
	foreground: "#ebe6ef",
	background: "#29232f",
	accentForeground: "white",
	accentBackground: PURPLE,
	successColor: "#2da98c",
	errorColor: "#f55459",
	border: "1.5px solid rgba(235, 230, 239, 0.15)",
	boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
	outline: "1px auto var(--accent-background)",
	interactiveFilter: "brightness(150%)"
};
function getThemedCssVariables(theme) {
	return `
  --foreground: ${theme.foreground};
  --background: ${theme.background};
  --accent-foreground: ${theme.accentForeground};
  --accent-background: ${theme.accentBackground};
  --success-color: ${theme.successColor};
  --error-color: ${theme.errorColor};
  --border: ${theme.border};
  --box-shadow: ${theme.boxShadow};
  --outline: ${theme.outline};
  --interactive-filter: ${theme.interactiveFilter};
  `;
}
function createMainStyles({ colorScheme, themeDark, themeLight, styleNonce }) {
	const style = DOCUMENT.createElement("style");
	style.textContent = `
:host {
  --font-family: system-ui, 'Helvetica Neue', Arial, sans-serif;
  --font-size: 14px;
  --z-index: 100000;

  --page-margin: 16px;
  --inset: auto 0 0 auto;
  --actor-inset: var(--inset);

  font-family: var(--font-family);
  font-size: var(--font-size);

  ${colorScheme !== "system" ? `color-scheme: only ${colorScheme};` : ""}

  ${getThemedCssVariables(colorScheme === "dark" ? {
		...DEFAULT_DARK,
		...themeDark
	} : {
		...DEFAULT_LIGHT,
		...themeLight
	})}
}

${colorScheme === "system" ? `
@media (prefers-color-scheme: dark) {
  :host {
    color-scheme: only dark;

    ${getThemedCssVariables({
		...DEFAULT_DARK,
		...themeDark
	})}
  }
}` : ""}
`;
	if (styleNonce) style.setAttribute("nonce", styleNonce);
	return style;
}
var buildFeedbackIntegration = ({ lazyLoadIntegration, getModalIntegration, getScreenshotIntegration }) => {
	const feedbackIntegration = (({ id = "sentry-feedback", autoInject = true, showBranding = true, isEmailRequired = false, isNameRequired = false, showEmail = true, showName = true, enableScreenshot = true, useSentryUser = {
		email: "email",
		name: "username"
	}, tags, styleNonce, scriptNonce, colorScheme = "system", themeLight = {}, themeDark = {}, addScreenshotButtonLabel = ADD_SCREENSHOT_LABEL, cancelButtonLabel = CANCEL_BUTTON_LABEL, confirmButtonLabel = CONFIRM_BUTTON_LABEL, emailLabel = EMAIL_LABEL, emailPlaceholder = EMAIL_PLACEHOLDER, formTitle = FORM_TITLE, isRequiredLabel = IS_REQUIRED_LABEL, messageLabel = MESSAGE_LABEL, messagePlaceholder = MESSAGE_PLACEHOLDER, nameLabel = NAME_LABEL, namePlaceholder = NAME_PLACEHOLDER, removeScreenshotButtonLabel = REMOVE_SCREENSHOT_LABEL, submitButtonLabel = SUBMIT_BUTTON_LABEL, successMessageText = SUCCESS_MESSAGE_TEXT, triggerLabel = TRIGGER_LABEL, triggerAriaLabel = "", highlightToolText = HIGHLIGHT_TOOL_TEXT, hideToolText = HIDE_TOOL_TEXT, removeHighlightText = REMOVE_HIGHLIGHT_TEXT, errorEmptyMessageText = ERROR_EMPTY_MESSAGE_TEXT, errorNoClientText = ERROR_NO_CLIENT_TEXT, errorTimeoutText = ERROR_TIMEOUT_TEXT, errorForbiddenText = ERROR_FORBIDDEN_TEXT, errorGenericText = ERROR_GENERIC_TEXT, onFormOpen, onFormClose, onSubmitSuccess, onSubmitError, onFormSubmitted } = {}) => {
		const _options = {
			id,
			autoInject,
			showBranding,
			isEmailRequired,
			isNameRequired,
			showEmail,
			showName,
			enableScreenshot,
			useSentryUser,
			tags,
			styleNonce,
			scriptNonce,
			colorScheme,
			themeDark,
			themeLight,
			triggerLabel,
			triggerAriaLabel,
			cancelButtonLabel,
			submitButtonLabel,
			confirmButtonLabel,
			formTitle,
			emailLabel,
			emailPlaceholder,
			messageLabel,
			messagePlaceholder,
			nameLabel,
			namePlaceholder,
			successMessageText,
			isRequiredLabel,
			addScreenshotButtonLabel,
			removeScreenshotButtonLabel,
			highlightToolText,
			hideToolText,
			removeHighlightText,
			errorEmptyMessageText,
			errorNoClientText,
			errorTimeoutText,
			errorForbiddenText,
			errorGenericText,
			onFormClose,
			onFormOpen,
			onSubmitError,
			onSubmitSuccess,
			onFormSubmitted
		};
		let _shadow = null;
		let _mainStyle = null;
		let _subscriptions = [];
		const _createShadow = (options) => {
			if (!_shadow) {
				const host = DOCUMENT.createElement("div");
				host.id = String(options.id);
				DOCUMENT.body.appendChild(host);
				_shadow = host.attachShadow({ mode: "open" });
				_mainStyle = createMainStyles(options);
				_shadow.appendChild(_mainStyle);
			}
			return _shadow;
		};
		const _loadAndRenderDialog = async (options) => {
			const screenshotRequired = options.enableScreenshot && isScreenshotSupported();
			let modalIntegration;
			let screenshotIntegration;
			try {
				modalIntegration = (getModalIntegration ? getModalIntegration() : await lazyLoadIntegration("feedbackModalIntegration", scriptNonce))();
				addIntegration(modalIntegration);
			} catch {
				DEBUG_BUILD$2 && debug.error("[Feedback] Error when trying to load feedback integrations. Try using `feedbackSyncIntegration` in your `Sentry.init`.");
				throw new Error("[Feedback] Missing feedback modal integration!");
			}
			try {
				const screenshotIntegrationFn = screenshotRequired ? getScreenshotIntegration ? getScreenshotIntegration() : await lazyLoadIntegration("feedbackScreenshotIntegration", scriptNonce) : void 0;
				if (screenshotIntegrationFn) {
					screenshotIntegration = screenshotIntegrationFn();
					addIntegration(screenshotIntegration);
				}
			} catch {
				DEBUG_BUILD$2 && debug.error("[Feedback] Missing feedback screenshot integration. Proceeding without screenshots.");
			}
			const errorMessages = {
				ERROR_EMPTY_MESSAGE: options.errorEmptyMessageText,
				ERROR_NO_CLIENT: options.errorNoClientText,
				ERROR_TIMEOUT: options.errorTimeoutText,
				ERROR_FORBIDDEN: options.errorForbiddenText,
				ERROR_GENERIC: options.errorGenericText
			};
			const wrappedSendFeedback = (params, hint) => sendFeedback(params, {
				includeReplay: true,
				...hint,
				errorMessages
			});
			const dialog = modalIntegration.createDialog({
				options: {
					...options,
					onFormClose: () => {
						dialog?.close();
						options.onFormClose?.();
					},
					onFormSubmitted: () => {
						dialog?.close();
						options.onFormSubmitted?.();
					}
				},
				screenshotIntegration,
				sendFeedback: wrappedSendFeedback,
				shadow: _createShadow(options)
			});
			return dialog;
		};
		const _attachTo = (el, optionOverrides = {}) => {
			const mergedOptions = mergeOptions(_options, optionOverrides);
			const targetEl = typeof el === "string" ? DOCUMENT.querySelector(el) : typeof el.addEventListener === "function" ? el : null;
			if (!targetEl) {
				DEBUG_BUILD$2 && debug.error("[Feedback] Unable to attach to target element");
				throw new Error("Unable to attach to target element");
			}
			let dialog = null;
			const handleClick = async () => {
				if (!dialog) dialog = await _loadAndRenderDialog({
					...mergedOptions,
					onFormSubmitted: () => {
						dialog?.removeFromDom();
						mergedOptions.onFormSubmitted?.();
					}
				});
				dialog.appendToDom();
				dialog.open();
			};
			targetEl.addEventListener("click", handleClick);
			const unsubscribe = () => {
				_subscriptions = _subscriptions.filter((sub) => sub !== unsubscribe);
				dialog?.removeFromDom();
				dialog = null;
				targetEl.removeEventListener("click", handleClick);
			};
			_subscriptions.push(unsubscribe);
			return unsubscribe;
		};
		const _createActor = (optionOverrides = {}) => {
			const mergedOptions = mergeOptions(_options, optionOverrides);
			const shadow = _createShadow(mergedOptions);
			const actor = Actor({
				triggerLabel: mergedOptions.triggerLabel,
				triggerAriaLabel: mergedOptions.triggerAriaLabel,
				shadow,
				styleNonce
			});
			_attachTo(actor.el, {
				...mergedOptions,
				onFormOpen() {
					actor.hide();
				},
				onFormClose() {
					actor.show();
				},
				onFormSubmitted() {
					actor.show();
				}
			});
			return actor;
		};
		return {
			name: "Feedback",
			setupOnce() {
				if (!isBrowser() || !_options.autoInject) return;
				if (DOCUMENT.readyState === "loading") DOCUMENT.addEventListener("DOMContentLoaded", () => _createActor().appendToDom());
				else _createActor().appendToDom();
			},
			/**
			* Adds click listener to the element to open a feedback dialog
			*
			* The returned function can be used to remove the click listener
			*/
			attachTo: _attachTo,
			/**
			* Creates a new widget which is composed of a Button which triggers a Dialog.
			* Accepts partial options to override any options passed to constructor.
			*/
			createWidget(optionOverrides = {}) {
				const actor = _createActor(mergeOptions(_options, optionOverrides));
				actor.appendToDom();
				return actor;
			},
			/**
			* Creates a new Form which you can
			* Accepts partial options to override any options passed to constructor.
			*/
			async createForm(optionOverrides = {}) {
				return _loadAndRenderDialog(mergeOptions(_options, optionOverrides));
			},
			/**
			* Updates the color scheme of the feedback widget at runtime.
			*/
			setTheme(colorScheme2) {
				_options.colorScheme = colorScheme2;
				if (_shadow) {
					const newStyle = createMainStyles(_options);
					if (_mainStyle) _shadow.replaceChild(newStyle, _mainStyle);
					else _shadow.prepend(newStyle);
					_mainStyle = newStyle;
				}
			},
			/**
			* Removes the Feedback integration (including host, shadow DOM, and all widgets)
			*/
			remove() {
				if (_shadow) {
					_shadow.parentElement?.remove();
					_shadow = null;
					_mainStyle = null;
				}
				_subscriptions.forEach((sub) => sub());
				_subscriptions = [];
			}
		};
	});
	return feedbackIntegration;
};
function getFeedback() {
	return getClient()?.getIntegrationByName("Feedback");
}
var n;
var l$1;
var u$1;
var i$1;
var o$1;
var r$1;
var f$1;
var c$1 = {};
var s$1 = [];
var a$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var h$1 = Array.isArray;
function v$1(n, l) {
	for (var u in l) n[u] = l[u];
	return n;
}
function p$1(n) {
	var l = n.parentNode;
	l && l.removeChild(n);
}
function y$1(l, u, t) {
	var i, o, r, f = {};
	for (r in u) "key" == r ? i = u[r] : "ref" == r ? o = u[r] : f[r] = u[r];
	if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t), "function" == typeof l && null != l.defaultProps) for (r in l.defaultProps) void 0 === f[r] && (f[r] = l.defaultProps[r]);
	return d$1(l, f, i, o, null);
}
function d$1(n, t, i, o, r) {
	var f = {
		type: n,
		props: t,
		key: i,
		ref: o,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__d: void 0,
		__c: null,
		constructor: void 0,
		__v: null == r ? ++u$1 : r,
		__i: -1,
		__u: 0
	};
	return null == r && null != l$1.vnode && l$1.vnode(f), f;
}
function g$1(n) {
	return n.children;
}
function b$1(n, l) {
	this.props = n, this.context = l;
}
function m$1(n, l) {
	if (null == l) return n.__ ? m$1(n.__, n.__i + 1) : null;
	for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
	return "function" == typeof n.type ? m$1(n) : null;
}
function w$1(n, u, t) {
	var i, o = n.__v, r = o.__e, f = n.__P;
	if (f) return (i = v$1({}, o)).__v = o.__v + 1, l$1.vnode && l$1.vnode(i), M(f, i, o, n.__n, void 0 !== f.ownerSVGElement, 32 & o.__u ? [r] : null, u, null == r ? m$1(o) : r, !!(32 & o.__u), t), i.__.__k[i.__i] = i, i.__d = void 0, i.__e != r && k$1(i), i;
}
function k$1(n) {
	var l, u;
	if (null != (n = n.__) && null != n.__c) {
		for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
			n.__e = n.__c.base = u.__e;
			break;
		}
		return k$1(n);
	}
}
function x$1(n) {
	(!n.__d && (n.__d = true) && i$1.push(n) && !C$1.__r++ || o$1 !== l$1.debounceRendering) && ((o$1 = l$1.debounceRendering) || r$1)(C$1);
}
function C$1() {
	var n, u, t, o = [], r = [];
	for (i$1.sort(f$1); n = i$1.shift();) n.__d && (t = i$1.length, u = w$1(n, o, r) || u, 0 === t || i$1.length > t ? (j$1(o, u, r), r.length = o.length = 0, u = void 0, i$1.sort(f$1)) : u && l$1.__c && l$1.__c(u, s$1));
	u && j$1(o, u, r), C$1.__r = 0;
}
function P$1(n, l, u, t, i, o, r, f, e, a, h) {
	var v, p, y, d, _, g = t && t.__k || s$1, b = l.length;
	for (u.__d = e, S(u, l, g), e = u.__d, v = 0; v < b; v++) null != (y = u.__k[v]) && "boolean" != typeof y && "function" != typeof y && (p = -1 === y.__i ? c$1 : g[y.__i] || c$1, y.__i = v, M(n, y, p, i, o, r, f, e, a, h), d = y.__e, y.ref && p.ref != y.ref && (p.ref && N(p.ref, null, y), h.push(y.ref, y.__c || d, y)), null == _ && null != d && (_ = d), 65536 & y.__u || p.__k === y.__k ? e = $(y, e, n) : "function" == typeof y.type && void 0 !== y.__d ? e = y.__d : d && (e = d.nextSibling), y.__d = void 0, y.__u &= -196609);
	u.__d = e, u.__e = _;
}
function S(n, l, u) {
	var t, i, o, r, f, e = l.length, c = u.length, s = c, a = 0;
	for (n.__k = [], t = 0; t < e; t++) null != (i = n.__k[t] = null == (i = l[t]) || "boolean" == typeof i || "function" == typeof i ? null : "string" == typeof i || "number" == typeof i || "bigint" == typeof i || i.constructor == String ? d$1(null, i, null, null, i) : h$1(i) ? d$1(g$1, { children: i }, null, null, null) : void 0 === i.constructor && i.__b > 0 ? d$1(i.type, i.props, i.key, i.ref ? i.ref : null, i.__v) : i) ? (i.__ = n, i.__b = n.__b + 1, f = I(i, u, r = t + a, s), i.__i = f, o = null, -1 !== f && (s--, (o = u[f]) && (o.__u |= 131072)), null == o || null === o.__v ? (-1 == f && a--, "function" != typeof i.type && (i.__u |= 65536)) : f !== r && (f === r + 1 ? a++ : f > r ? s > e - r ? a += f - r : a-- : a = f < r && f == r - 1 ? f - r : 0, f !== t + a && (i.__u |= 65536))) : (o = u[t]) && null == o.key && o.__e && (o.__e == n.__d && (n.__d = m$1(o)), O(o, o, false), u[t] = null, s--);
	if (s) for (t = 0; t < c; t++) null != (o = u[t]) && 0 == (131072 & o.__u) && (o.__e == n.__d && (n.__d = m$1(o)), O(o, o));
}
function $(n, l, u) {
	var t, i;
	if ("function" == typeof n.type) {
		for (t = n.__k, i = 0; t && i < t.length; i++) t[i] && (t[i].__ = n, l = $(t[i], l, u));
		return l;
	}
	n.__e != l && (u.insertBefore(n.__e, l || null), l = n.__e);
	do
		l = l && l.nextSibling;
	while (null != l && 8 === l.nodeType);
	return l;
}
function I(n, l, u, t) {
	var i = n.key, o = n.type, r = u - 1, f = u + 1, e = l[u];
	if (null === e || e && i == e.key && o === e.type) return u;
	if (t > (null != e && 0 == (131072 & e.__u) ? 1 : 0)) for (; r >= 0 || f < l.length;) {
		if (r >= 0) {
			if ((e = l[r]) && 0 == (131072 & e.__u) && i == e.key && o === e.type) return r;
			r--;
		}
		if (f < l.length) {
			if ((e = l[f]) && 0 == (131072 & e.__u) && i == e.key && o === e.type) return f;
			f++;
		}
	}
	return -1;
}
function T$1(n, l, u) {
	"-" === l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || a$1.test(l) ? u : u + "px";
}
function A$1(n, l, u, t, i) {
	var o;
	n: if ("style" === l) if ("string" == typeof u) n.style.cssText = u;
	else {
		if ("string" == typeof t && (n.style.cssText = t = ""), t) for (l in t) u && l in u || T$1(n.style, l, "");
		if (u) for (l in u) t && u[l] === t[l] || T$1(n.style, l, u[l]);
	}
	else if ("o" === l[0] && "n" === l[1]) o = l !== (l = l.replace(/(PointerCapture)$|Capture$/i, "$1")), l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + o] = u, u ? t ? u.u = t.u : (u.u = Date.now(), n.addEventListener(l, o ? L : D$1, o)) : n.removeEventListener(l, o ? L : D$1, o);
	else {
		if (i) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if ("width" !== l && "height" !== l && "href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && "rowSpan" !== l && "colSpan" !== l && "role" !== l && l in n) try {
			n[l] = null == u ? "" : u;
			break n;
		} catch (n) {}
		"function" == typeof u || (null == u || false === u && "-" !== l[4] ? n.removeAttribute(l) : n.setAttribute(l, u));
	}
}
function D$1(n) {
	if (this.l) {
		var u = this.l[n.type + false];
		if (n.t) {
			if (n.t <= u.u) return;
		} else n.t = Date.now();
		return u(l$1.event ? l$1.event(n) : n);
	}
}
function L(n) {
	if (this.l) return this.l[n.type + true](l$1.event ? l$1.event(n) : n);
}
function M(n, u, t, i, o, r, f, e, c, s) {
	var a, p, y, d, _, m, w, k, x, C, S, $, H, I, T, A = u.type;
	if (void 0 !== u.constructor) return null;
	128 & t.__u && (c = !!(32 & t.__u), r = [e = u.__e = t.__e]), (a = l$1.__b) && a(u);
	n: if ("function" == typeof A) try {
		if (k = u.props, x = (a = A.contextType) && i[a.__c], C = a ? x ? x.props.value : a.__ : i, t.__c ? w = (p = u.__c = t.__c).__ = p.__E : ("prototype" in A && A.prototype.render ? u.__c = p = new A(k, C) : (u.__c = p = new b$1(k, C), p.constructor = A, p.render = q$1), x && x.sub(p), p.props = k, p.state || (p.state = {}), p.context = C, p.__n = i, y = p.__d = !0, p.__h = [], p._sb = []), p.__s ?? (p.__s = p.state), null != A.getDerivedStateFromProps && (p.__s == p.state && (p.__s = v$1({}, p.__s)), v$1(p.__s, A.getDerivedStateFromProps(k, p.__s))), d = p.props, _ = p.state, p.__v = u, y) null == A.getDerivedStateFromProps && null != p.componentWillMount && p.componentWillMount(), null != p.componentDidMount && p.__h.push(p.componentDidMount);
		else {
			if (null == A.getDerivedStateFromProps && k !== d && null != p.componentWillReceiveProps && p.componentWillReceiveProps(k, C), !p.__e && (null != p.shouldComponentUpdate && !1 === p.shouldComponentUpdate(k, p.__s, C) || u.__v === t.__v)) {
				for (u.__v !== t.__v && (p.props = k, p.state = p.__s, p.__d = !1), u.__e = t.__e, u.__k = t.__k, u.__k.forEach(function(n) {
					n && (n.__ = u);
				}), S = 0; S < p._sb.length; S++) p.__h.push(p._sb[S]);
				p._sb = [], p.__h.length && f.push(p);
				break n;
			}
			null != p.componentWillUpdate && p.componentWillUpdate(k, p.__s, C), null != p.componentDidUpdate && p.__h.push(function() {
				p.componentDidUpdate(d, _, m);
			});
		}
		if (p.context = C, p.props = k, p.__P = n, p.__e = !1, $ = l$1.__r, H = 0, "prototype" in A && A.prototype.render) {
			for (p.state = p.__s, p.__d = !1, $ && $(u), a = p.render(p.props, p.state, p.context), I = 0; I < p._sb.length; I++) p.__h.push(p._sb[I]);
			p._sb = [];
		} else do
			p.__d = !1, $ && $(u), a = p.render(p.props, p.state, p.context), p.state = p.__s;
		while (p.__d && ++H < 25);
		p.state = p.__s, null != p.getChildContext && (i = v$1(v$1({}, i), p.getChildContext())), y || null == p.getSnapshotBeforeUpdate || (m = p.getSnapshotBeforeUpdate(d, _)), P$1(n, h$1(T = null != a && a.type === g$1 && null == a.key ? a.props.children : a) ? T : [T], u, t, i, o, r, f, e, c, s), p.base = u.__e, u.__u &= -161, p.__h.length && f.push(p), w && (p.__E = p.__ = null);
	} catch (n) {
		u.__v = null, c || null != r ? (u.__e = e, u.__u |= c ? 160 : 32, r[r.indexOf(e)] = null) : (u.__e = t.__e, u.__k = t.__k), l$1.__e(n, u, t);
	}
	else null == r && u.__v === t.__v ? (u.__k = t.__k, u.__e = t.__e) : u.__e = z$1(t.__e, u, t, i, o, r, f, c, s);
	(a = l$1.diffed) && a(u);
}
function j$1(n, u, t) {
	for (var i = 0; i < t.length; i++) N(t[i], t[++i], t[++i]);
	l$1.__c && l$1.__c(u, n), n.some(function(u) {
		try {
			n = u.__h, u.__h = [], n.some(function(n) {
				n.call(u);
			});
		} catch (n) {
			l$1.__e(n, u.__v);
		}
	});
}
function z$1(l, u, t, i, o, r, f, e, s) {
	var a, v, y, d, _, g, b, w = t.props, k = u.props, x = u.type;
	if ("svg" === x && (o = true), null != r) {
		for (a = 0; a < r.length; a++) if ((_ = r[a]) && "setAttribute" in _ == !!x && (x ? _.localName === x : 3 === _.nodeType)) {
			l = _, r[a] = null;
			break;
		}
	}
	if (null == l) {
		if (null === x) return document.createTextNode(k);
		l = o ? document.createElementNS("http://www.w3.org/2000/svg", x) : document.createElement(x, k.is && k), r = null, e = false;
	}
	if (null === x) w === k || e && l.data === k || (l.data = k);
	else {
		if (r = r && n.call(l.childNodes), w = t.props || c$1, !e && null != r) for (w = {}, a = 0; a < l.attributes.length; a++) w[(_ = l.attributes[a]).name] = _.value;
		for (a in w) _ = w[a], "children" == a || ("dangerouslySetInnerHTML" == a ? y = _ : "key" === a || a in k || A$1(l, a, null, _, o));
		for (a in k) _ = k[a], "children" == a ? d = _ : "dangerouslySetInnerHTML" == a ? v = _ : "value" == a ? g = _ : "checked" == a ? b = _ : "key" === a || e && "function" != typeof _ || w[a] === _ || A$1(l, a, _, w[a], o);
		if (v) e || y && (v.__html === y.__html || v.__html === l.innerHTML) || (l.innerHTML = v.__html), u.__k = [];
		else if (y && (l.innerHTML = ""), P$1(l, h$1(d) ? d : [d], u, t, i, o && "foreignObject" !== x, r, f, r ? r[0] : t.__k && m$1(t, 0), e, s), null != r) for (a = r.length; a--;) null != r[a] && p$1(r[a]);
		e || (a = "value", void 0 !== g && (g !== l[a] || "progress" === x && !g || "option" === x && g !== w[a]) && A$1(l, a, g, w[a], false), a = "checked", void 0 !== b && b !== l[a] && A$1(l, a, b, w[a], false));
	}
	return l;
}
function N(n, u, t) {
	try {
		"function" == typeof n ? n(u) : n.current = u;
	} catch (n) {
		l$1.__e(n, t);
	}
}
function O(n, u, t) {
	var i, o;
	if (l$1.unmount && l$1.unmount(n), (i = n.ref) && (i.current && i.current !== n.__e || N(i, null, u)), null != (i = n.__c)) {
		if (i.componentWillUnmount) try {
			i.componentWillUnmount();
		} catch (n) {
			l$1.__e(n, u);
		}
		i.base = i.__P = null, n.__c = void 0;
	}
	if (i = n.__k) for (o = 0; o < i.length; o++) i[o] && O(i[o], u, t || "function" != typeof n.type);
	t || null == n.__e || p$1(n.__e), n.__ = n.__e = n.__d = void 0;
}
function q$1(n, l, u) {
	return this.constructor(n, u);
}
function B$1(u, t, i) {
	var o, r, f, e;
	l$1.__ && l$1.__(u, t), r = (o = false) ? null : t.__k, f = [], e = [], M(t, u = t.__k = y$1(g$1, null, [u]), r || c$1, c$1, void 0 !== t.ownerSVGElement, r ? null : t.firstChild ? n.call(t.childNodes) : null, f, r ? r.__e : t.firstChild, o, e), u.__d = void 0, j$1(f, u, e);
}
n = s$1.slice, l$1 = { __e: function(n, l, u, t) {
	for (var i, o, r; l = l.__;) if ((i = l.__c) && !i.__) try {
		if ((o = i.constructor) && null != o.getDerivedStateFromError && (i.setState(o.getDerivedStateFromError(n)), r = i.__d), null != i.componentDidCatch && (i.componentDidCatch(n, t || {}), r = i.__d), r) return i.__E = i;
	} catch (l) {
		n = l;
	}
	throw n;
} }, u$1 = 0, b$1.prototype.setState = function(n, l) {
	var u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = v$1({}, this.state);
	"function" == typeof n && (n = n(v$1({}, u), this.props)), n && v$1(u, n), null != n && this.__v && (l && this._sb.push(l), x$1(this));
}, b$1.prototype.forceUpdate = function(n) {
	this.__v && (this.__e = true, n && this.__h.push(n), x$1(this));
}, b$1.prototype.render = g$1, i$1 = [], r$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f$1 = function(n, l) {
	return n.__v.__b - l.__v.__b;
}, C$1.__r = 0;
var t;
var r;
var u;
var i;
var o = 0;
var f = [];
var c = [];
var e = l$1;
var a = e.__b;
var v = e.__r;
var l = e.diffed;
var m = e.__c;
var s = e.unmount;
var d = e.__;
function h(n, t) {
	e.__h && e.__h(r, n, o || t), o = 0;
	var u = r.__H || (r.__H = {
		__: [],
		__h: []
	});
	return n >= u.__.length && u.__.push({ __V: c }), u.__[n];
}
function p(n) {
	return o = 1, y(D, n);
}
function y(n, u, i) {
	var o = h(t++, 2);
	if (o.t = n, !o.__c && (o.__ = [i ? i(u) : D(void 0, u), function(n) {
		var t = o.__N ? o.__N[0] : o.__[0], r = o.t(t, n);
		t !== r && (o.__N = [r, o.__[1]], o.__c.setState({}));
	}], o.__c = r, !r.u)) {
		var f = function(n, t, r) {
			if (!o.__c.__H) return true;
			var u = o.__c.__H.__.filter(function(n) {
				return !!n.__c;
			});
			if (u.every(function(n) {
				return !n.__N;
			})) return !c || c.call(this, n, t, r);
			var i = false;
			return u.forEach(function(n) {
				if (n.__N) {
					var t = n.__[0];
					n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = true);
				}
			}), !(!i && o.__c.props === n) && (!c || c.call(this, n, t, r));
		};
		r.u = true;
		var c = r.shouldComponentUpdate, e = r.componentWillUpdate;
		r.componentWillUpdate = function(n, t, r) {
			if (this.__e) {
				var u = c;
				c = void 0, f(n, t, r), c = u;
			}
			e && e.call(this, n, t, r);
		}, r.shouldComponentUpdate = f;
	}
	return o.__N || o.__;
}
function _(n, u) {
	var i = h(t++, 3);
	!e.__s && C(i.__H, u) && (i.__ = n, i.i = u, r.__H.__h.push(i));
}
function A(n, u) {
	var i = h(t++, 4);
	!e.__s && C(i.__H, u) && (i.__ = n, i.i = u, r.__h.push(i));
}
function F(n) {
	return o = 5, q(function() {
		return { current: n };
	}, []);
}
function T(n, t, r) {
	o = 6, A(function() {
		return "function" == typeof n ? (n(t()), function() {
			return n(null);
		}) : n ? (n.current = t(), function() {
			return n.current = null;
		}) : void 0;
	}, null == r ? r : r.concat(n));
}
function q(n, r) {
	var u = h(t++, 7);
	return C(u.__H, r) ? (u.__V = n(), u.i = r, u.__h = n, u.__V) : u.__;
}
function x(n, t) {
	return o = 8, q(function() {
		return n;
	}, t);
}
function P(n) {
	var u = r.context[n.__c], i = h(t++, 9);
	return i.c = n, u ? (i.__ ?? (i.__ = true, u.sub(r)), u.props.value) : n.__;
}
function V(n, t) {
	e.useDebugValue && e.useDebugValue(t ? t(n) : n);
}
function b(n) {
	var u = h(t++, 10), i = p();
	return u.__ = n, r.componentDidCatch || (r.componentDidCatch = function(n, t) {
		u.__ && u.__(n, t), i[1](n);
	}), [i[0], function() {
		i[1](void 0);
	}];
}
function g() {
	var n = h(t++, 11);
	if (!n.__) {
		for (var u = r.__v; null !== u && !u.__m && null !== u.__;) u = u.__;
		var i = u.__m || (u.__m = [0, 0]);
		n.__ = "P" + i[0] + "-" + i[1]++;
	}
	return n.__;
}
function j() {
	for (var n; n = f.shift();) if (n.__P && n.__H) try {
		n.__H.__h.forEach(z), n.__H.__h.forEach(B), n.__H.__h = [];
	} catch (t) {
		n.__H.__h = [], e.__e(t, n.__v);
	}
}
e.__b = function(n) {
	r = null, a && a(n);
}, e.__ = function(n, t) {
	t.__k && t.__k.__m && (n.__m = t.__k.__m), d && d(n, t);
}, e.__r = function(n) {
	v && v(n), t = 0;
	var i = (r = n.__c).__H;
	i && (u === r ? (i.__h = [], r.__h = [], i.__.forEach(function(n) {
		n.__N && (n.__ = n.__N), n.__V = c, n.__N = n.i = void 0;
	})) : (i.__h.forEach(z), i.__h.forEach(B), i.__h = [], t = 0)), u = r;
}, e.diffed = function(n) {
	l && l(n);
	var t = n.__c;
	t && t.__H && (t.__H.__h.length && (1 !== f.push(t) && i === e.requestAnimationFrame || ((i = e.requestAnimationFrame) || w)(j)), t.__H.__.forEach(function(n) {
		n.i && (n.__H = n.i), n.__V !== c && (n.__ = n.__V), n.i = void 0, n.__V = c;
	})), u = r = null;
}, e.__c = function(n, t) {
	t.some(function(n) {
		try {
			n.__h.forEach(z), n.__h = n.__h.filter(function(n) {
				return !n.__ || B(n);
			});
		} catch (r) {
			t.some(function(n) {
				n.__h && (n.__h = []);
			}), t = [], e.__e(r, n.__v);
		}
	}), m && m(n, t);
}, e.unmount = function(n) {
	s && s(n);
	var t, r = n.__c;
	r && r.__H && (r.__H.__.forEach(function(n) {
		try {
			z(n);
		} catch (n) {
			t = n;
		}
	}), r.__H = void 0, t && e.__e(t, r.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w(n) {
	var t, r = function() {
		clearTimeout(u), k && cancelAnimationFrame(t), setTimeout(n);
	}, u = setTimeout(r, 100);
	k && (t = requestAnimationFrame(r));
}
function z(n) {
	var t = r, u = n.__c;
	"function" == typeof u && (n.__c = void 0, u()), r = t;
}
function B(n) {
	var t = r;
	n.__c = n.__(), r = t;
}
function C(n, t) {
	return !n || n.length !== t.length || t.some(function(t, r) {
		return t !== n[r];
	});
}
function D(n, t) {
	return "function" == typeof t ? t(n) : t;
}
var hooks = /*#__PURE__*/ Object.defineProperty({
	__proto__: null,
	useCallback: x,
	useContext: P,
	useDebugValue: V,
	useEffect: _,
	useErrorBoundary: b,
	useId: g,
	useImperativeHandle: T,
	useLayoutEffect: A,
	useMemo: q,
	useReducer: y,
	useRef: F,
	useState: p
}, Symbol.toStringTag, { value: "Module" });
var XMLNS$1 = "http://www.w3.org/2000/svg";
function SentryLogo() {
	const createElementNS = (tagName) => DOCUMENT.createElementNS(XMLNS$1, tagName);
	const svg = setAttributesNS(createElementNS("svg"), {
		width: "32",
		height: "30",
		viewBox: "0 0 72 66",
		fill: "inherit"
	});
	const path = setAttributesNS(createElementNS("path"), {
		transform: "translate(11, 11)",
		d: "M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z"
	});
	svg.appendChild(path);
	return svg;
}
function DialogHeader({ options }) {
	const logoHtml = q(() => ({ __html: SentryLogo().outerHTML }), []);
	return /* @__PURE__ */ y$1("h2", { class: "dialog__header" }, /* @__PURE__ */ y$1("span", { class: "dialog__title" }, options.formTitle), options.showBranding ? /* @__PURE__ */ y$1("a", {
		class: "brand-link",
		target: "_blank",
		href: "https://sentry.io/welcome/",
		title: "Powered by Sentry",
		rel: "noopener noreferrer",
		dangerouslySetInnerHTML: logoHtml
	}) : null);
}
function getMissingFields(feedback, props) {
	const emptyFields = [];
	if (props.isNameRequired && !feedback.name) emptyFields.push(props.nameLabel);
	if (props.isEmailRequired && !feedback.email) emptyFields.push(props.emailLabel);
	if (!feedback.message) emptyFields.push(props.messageLabel);
	return emptyFields;
}
function retrieveStringValue(formData, key) {
	const value = formData.get(key);
	if (typeof value === "string") return value.trim();
	return "";
}
function Form({ options, defaultEmail, defaultName, onFormClose, onSubmit, onSubmitSuccess, onSubmitError, showEmail, showName, screenshotInput }) {
	const { tags, addScreenshotButtonLabel, removeScreenshotButtonLabel, cancelButtonLabel, emailLabel, emailPlaceholder, isEmailRequired, isNameRequired, messageLabel, messagePlaceholder, nameLabel, namePlaceholder, submitButtonLabel, isRequiredLabel } = options;
	const [isSubmitting, setIsSubmitting] = p(false);
	const [error, setError] = p(null);
	const [showScreenshotInput, setShowScreenshotInput] = p(false);
	const ScreenshotInputComponent = screenshotInput?.input;
	const [screenshotError, setScreenshotError] = p(null);
	const onScreenshotError = x((error2) => {
		setScreenshotError(error2);
		setShowScreenshotInput(false);
	}, []);
	const hasAllRequiredFields = x((data) => {
		const missingFields = getMissingFields(data, {
			emailLabel,
			isEmailRequired,
			isNameRequired,
			messageLabel,
			nameLabel
		});
		if (missingFields.length > 0) setError(`Please enter in the following required fields: ${missingFields.join(", ")}`);
		else setError(null);
		return missingFields.length === 0;
	}, [
		emailLabel,
		isEmailRequired,
		isNameRequired,
		messageLabel,
		nameLabel
	]);
	return /* @__PURE__ */ y$1("form", {
		class: "form",
		onSubmit: x(async (e) => {
			setIsSubmitting(true);
			try {
				e.preventDefault();
				if (!(e.target instanceof HTMLFormElement)) return;
				const formData = new FormData(e.target);
				const attachment = await (screenshotInput && showScreenshotInput ? screenshotInput.value() : void 0);
				const data = {
					name: retrieveStringValue(formData, "name"),
					email: retrieveStringValue(formData, "email"),
					message: retrieveStringValue(formData, "message"),
					attachments: attachment ? [attachment] : void 0
				};
				if (!hasAllRequiredFields(data)) return;
				try {
					onSubmitSuccess(data, await onSubmit({
						name: data.name,
						email: data.email,
						message: data.message,
						source: FEEDBACK_WIDGET_SOURCE,
						tags
					}, { attachments: data.attachments }));
				} catch (error2) {
					DEBUG_BUILD$2 && debug.error(error2);
					const err = error2 instanceof Error ? error2 : new Error(String(error2));
					setError(err.message);
					onSubmitError(err);
				}
			} finally {
				setIsSubmitting(false);
			}
		}, [
			screenshotInput && showScreenshotInput,
			onSubmitSuccess,
			onSubmitError
		])
	}, ScreenshotInputComponent && showScreenshotInput ? /* @__PURE__ */ y$1(ScreenshotInputComponent, { onError: onScreenshotError }) : null, /* @__PURE__ */ y$1("fieldset", {
		class: "form__right",
		"data-sentry-feedback": true,
		disabled: isSubmitting
	}, /* @__PURE__ */ y$1("div", { class: "form__top" }, error ? /* @__PURE__ */ y$1("div", { class: "form__error-container" }, error) : null, showName ? /* @__PURE__ */ y$1("label", {
		for: "name",
		class: "form__label"
	}, /* @__PURE__ */ y$1(LabelText, {
		label: nameLabel,
		isRequiredLabel,
		isRequired: isNameRequired
	}), /* @__PURE__ */ y$1("input", {
		class: "form__input",
		defaultValue: defaultName,
		id: "name",
		name: "name",
		placeholder: namePlaceholder,
		required: isNameRequired,
		type: "text"
	})) : /* @__PURE__ */ y$1("input", {
		"aria-hidden": true,
		value: defaultName,
		name: "name",
		type: "hidden"
	}), showEmail ? /* @__PURE__ */ y$1("label", {
		for: "email",
		class: "form__label"
	}, /* @__PURE__ */ y$1(LabelText, {
		label: emailLabel,
		isRequiredLabel,
		isRequired: isEmailRequired
	}), /* @__PURE__ */ y$1("input", {
		class: "form__input",
		defaultValue: defaultEmail,
		id: "email",
		name: "email",
		placeholder: emailPlaceholder,
		required: isEmailRequired,
		type: "email"
	})) : /* @__PURE__ */ y$1("input", {
		"aria-hidden": true,
		value: defaultEmail,
		name: "email",
		type: "hidden"
	}), /* @__PURE__ */ y$1("label", {
		for: "message",
		class: "form__label"
	}, /* @__PURE__ */ y$1(LabelText, {
		label: messageLabel,
		isRequiredLabel,
		isRequired: true
	}), /* @__PURE__ */ y$1("textarea", {
		autoFocus: true,
		class: "form__input form__input--textarea",
		id: "message",
		name: "message",
		placeholder: messagePlaceholder,
		required: true,
		rows: 5
	})), ScreenshotInputComponent ? /* @__PURE__ */ y$1("label", {
		for: "screenshot",
		class: "form__label"
	}, /* @__PURE__ */ y$1("button", {
		class: "btn btn--default",
		disabled: isSubmitting,
		type: "button",
		onClick: () => {
			setScreenshotError(null);
			setShowScreenshotInput((prev) => !prev);
		}
	}, showScreenshotInput ? removeScreenshotButtonLabel : addScreenshotButtonLabel), screenshotError ? /* @__PURE__ */ y$1("div", { class: "form__error-container" }, screenshotError.message) : null) : null), /* @__PURE__ */ y$1("div", { class: "btn-group" }, /* @__PURE__ */ y$1("button", {
		class: "btn btn--primary",
		disabled: isSubmitting,
		type: "submit"
	}, submitButtonLabel), /* @__PURE__ */ y$1("button", {
		class: "btn btn--default",
		disabled: isSubmitting,
		type: "button",
		onClick: onFormClose
	}, cancelButtonLabel))));
}
function LabelText({ label, isRequired, isRequiredLabel }) {
	return /* @__PURE__ */ y$1("span", { class: "form__label__text" }, label, isRequired && /* @__PURE__ */ y$1("span", { class: "form__label__text--required" }, isRequiredLabel));
}
var WIDTH = 16;
var HEIGHT = 17;
var XMLNS = "http://www.w3.org/2000/svg";
function SuccessIcon() {
	const createElementNS = (tagName) => WINDOW$4.document.createElementNS(XMLNS, tagName);
	const svg = setAttributesNS(createElementNS("svg"), {
		width: `${WIDTH}`,
		height: `${HEIGHT}`,
		viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
		fill: "inherit"
	});
	const g = setAttributesNS(createElementNS("g"), { clipPath: "url(#clip0_57_156)" });
	const path2 = setAttributesNS(createElementNS("path"), {
		["fill-rule"]: "evenodd",
		["clip-rule"]: "evenodd",
		d: "M3.55544 15.1518C4.87103 16.0308 6.41775 16.5 8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.91775 15.5308 5.37103 14.6518 4.05544C13.7727 2.73985 12.5233 1.71447 11.0615 1.10897C9.59966 0.503466 7.99113 0.34504 6.43928 0.653721C4.88743 0.962403 3.46197 1.72433 2.34315 2.84315C1.22433 3.96197 0.462403 5.38743 0.153721 6.93928C-0.15496 8.49113 0.00346625 10.0997 0.608967 11.5615C1.21447 13.0233 2.23985 14.2727 3.55544 15.1518ZM4.40546 3.1204C5.46945 2.40946 6.72036 2.03 8 2.03C9.71595 2.03 11.3616 2.71166 12.575 3.92502C13.7883 5.13838 14.47 6.78405 14.47 8.5C14.47 9.77965 14.0905 11.0306 13.3796 12.0945C12.6687 13.1585 11.6582 13.9878 10.476 14.4775C9.29373 14.9672 7.99283 15.0953 6.73777 14.8457C5.48271 14.596 4.32987 13.9798 3.42502 13.075C2.52018 12.1701 1.90397 11.0173 1.65432 9.76224C1.40468 8.50718 1.5328 7.20628 2.0225 6.02404C2.5122 4.8418 3.34148 3.83133 4.40546 3.1204Z"
	});
	const path = setAttributesNS(createElementNS("path"), { d: "M6.68775 12.4297C6.78586 12.4745 6.89218 12.4984 7 12.5C7.11275 12.4955 7.22315 12.4664 7.32337 12.4145C7.4236 12.3627 7.51121 12.2894 7.58 12.2L12 5.63999C12.0848 5.47724 12.1071 5.28902 12.0625 5.11098C12.0178 4.93294 11.9095 4.77744 11.7579 4.67392C11.6064 4.57041 11.4221 4.52608 11.24 4.54931C11.0579 4.57254 10.8907 4.66173 10.77 4.79999L6.88 10.57L5.13 8.56999C5.06508 8.49566 4.98613 8.43488 4.89768 8.39111C4.80922 8.34735 4.713 8.32148 4.61453 8.31498C4.51605 8.30847 4.41727 8.32147 4.32382 8.35322C4.23038 8.38497 4.14413 8.43484 4.07 8.49999C3.92511 8.63217 3.83692 8.81523 3.82387 9.01092C3.81083 9.2066 3.87393 9.39976 4 9.54999L6.43 12.24C6.50187 12.3204 6.58964 12.385 6.68775 12.4297Z" });
	svg.appendChild(g).append(path, path2);
	const speakerDefs = createElementNS("defs");
	const speakerClipPathDef = setAttributesNS(createElementNS("clipPath"), { id: "clip0_57_156" });
	const speakerRect = setAttributesNS(createElementNS("rect"), {
		width: `${WIDTH}`,
		height: `${WIDTH}`,
		fill: "white",
		transform: "translate(0 0.5)"
	});
	speakerClipPathDef.appendChild(speakerRect);
	speakerDefs.appendChild(speakerClipPathDef);
	svg.appendChild(speakerDefs).appendChild(speakerClipPathDef).appendChild(speakerRect);
	return svg;
}
function Dialog({ open, onFormSubmitted, ...props }) {
	const options = props.options;
	const successIconHtml = q(() => ({ __html: SuccessIcon().outerHTML }), []);
	const [timeoutId, setTimeoutId] = p(null);
	const handleOnSuccessClick = x(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			setTimeoutId(null);
		}
		onFormSubmitted();
	}, [timeoutId]);
	const onSubmitSuccess = x((data, eventId) => {
		props.onSubmitSuccess(data, eventId);
		setTimeoutId(setTimeout(() => {
			onFormSubmitted();
			setTimeoutId(null);
		}, SUCCESS_MESSAGE_TIMEOUT));
	}, [onFormSubmitted]);
	return /* @__PURE__ */ y$1(g$1, null, timeoutId ? /* @__PURE__ */ y$1("div", {
		class: "success__position",
		onClick: handleOnSuccessClick
	}, /* @__PURE__ */ y$1("div", { class: "success__content" }, options.successMessageText, /* @__PURE__ */ y$1("span", {
		class: "success__icon",
		dangerouslySetInnerHTML: successIconHtml
	}))) : /* @__PURE__ */ y$1("dialog", {
		class: "dialog",
		onClick: options.onFormClose,
		open
	}, /* @__PURE__ */ y$1("div", { class: "dialog__position" }, /* @__PURE__ */ y$1("div", {
		class: "dialog__content",
		onClick: (e) => {
			e.stopPropagation();
		}
	}, /* @__PURE__ */ y$1(DialogHeader, { options }), /* @__PURE__ */ y$1(Form, {
		...props,
		onSubmitSuccess
	})))));
}
var DIALOG = `
.dialog {
  position: fixed;
  z-index: var(--z-index);
  margin: 0;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 100vh;
  width: 100vw;

  color: var(--dialog-color, var(--foreground));
  fill: var(--dialog-color, var(--foreground));
  line-height: 1.75em;

  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  inset: 0;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.dialog__position {
  position: fixed;
  z-index: var(--z-index);
  inset: var(--dialog-inset);
  padding: var(--page-margin);
  display: flex;
  max-height: calc(100vh - (2 * var(--page-margin)));
}
@media (max-width: 600px) {
  .dialog__position {
    inset: var(--page-margin);
    padding: 0;
  }
}

.dialog__position:has(.editor) {
  inset: var(--page-margin);
  padding: 0;
}

.dialog:not([open]) {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.dialog:not([open]) .dialog__content {
  transform: translate(0, -16px) scale(0.98);
}

.dialog__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: var(--dialog-padding, 24px);
  max-width: 100%;
  width: 100%;
  max-height: 100%;
  overflow: auto;

  background: var(--dialog-background, var(--background));
  border-radius: var(--dialog-border-radius, 20px);
  border: var(--dialog-border, var(--border));
  box-shadow: var(--dialog-box-shadow, var(--box-shadow));
  transform: translate(0, 0) scale(1);
  transition: transform 0.2s ease-in-out;
}

`;
var DIALOG_HEADER = `
.dialog__header {
  display: flex;
  gap: 4px;
  justify-content: space-between;
  font-weight: var(--dialog-header-weight, 600);
  margin: 0;
}
.dialog__title {
  align-self: center;
  width: var(--form-width, 272px);
}

@media (max-width: 600px) {
  .dialog__title {
    width: auto;
  }
}

.dialog__position:has(.editor) .dialog__title {
  width: auto;
}


.brand-link {
  display: inline-flex;
}
.brand-link:focus-visible {
  outline: var(--outline);
}
`;
var FORM = `
.form {
  display: flex;
  overflow: auto;
  flex-direction: row;
  gap: 16px;
  flex: 1 0;
}

.form fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

.form__right {
  flex: 0 0 auto;
  display: flex;
  overflow: auto;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  width: var(--form-width, 100%);
}

.dialog__position:has(.editor) .form__right {
  width: var(--form-width, 272px);
}

.form__top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form__error-container {
  color: var(--error-color);
  fill: var(--error-color);
}

.form__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0px;
}

.form__label__text {
  display: flex;
  gap: 4px;
  align-items: center;
}

.form__label__text--required {
  font-size: 0.85em;
}

.form__input {
  font-family: inherit;
  line-height: inherit;
  background: transparent;
  box-sizing: border-box;
  border: var(--input-border, var(--border));
  border-radius: var(--input-border-radius, 6px);
  color: var(--input-color, inherit);
  fill: var(--input-color, inherit);
  font-size: var(--input-font-size, inherit);
  font-weight: var(--input-font-weight, 500);
  padding: 6px 12px;
}

.form__input::placeholder {
  opacity: 0.65;
  color: var(--input-placeholder-color, inherit);
  filter: var(--interactive-filter);
}

.form__input:focus-visible {
  outline: var(--input-focus-outline, var(--outline));
}

.form__input--textarea {
  font-family: inherit;
  resize: vertical;
}

.error {
  color: var(--error-color);
  fill: var(--error-color);
}
`;
var BUTTON = `
.btn-group {
  display: grid;
  gap: 8px;
}

.btn {
  line-height: inherit;
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--button-font-size, inherit);
  font-weight: var(--button-font-weight, 600);
  padding: var(--button-padding, 6px 16px);
}
.btn[disabled] {
  opacity: 0.6;
  pointer-events: none;
}

.btn--primary {
  color: var(--button-primary-color, var(--accent-foreground));
  fill: var(--button-primary-color, var(--accent-foreground));
  background: var(--button-primary-background, var(--accent-background));
  border: var(--button-primary-border, var(--border));
  border-radius: var(--button-primary-border-radius, 6px);
  font-weight: var(--button-primary-font-weight, 500);
}
.btn--primary:hover {
  color: var(--button-primary-hover-color, var(--accent-foreground));
  fill: var(--button-primary-hover-color, var(--accent-foreground));
  background: var(--button-primary-hover-background, var(--accent-background));
  filter: var(--interactive-filter);
}
.btn--primary:focus-visible {
  background: var(--button-primary-hover-background, var(--accent-background));
  filter: var(--interactive-filter);
  outline: var(--button-primary-focus-outline, var(--outline));
}

.btn--default {
  color: var(--button-color, var(--foreground));
  fill: var(--button-color, var(--foreground));
  background: var(--button-background, var(--background));
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  font-weight: var(--button-font-weight, 500);
}
.btn--default:hover {
  color: var(--button-color, var(--foreground));
  fill: var(--button-color, var(--foreground));
  background: var(--button-hover-background, var(--background));
  filter: var(--interactive-filter);
}
.btn--default:focus-visible {
  background: var(--button-hover-background, var(--background));
  filter: var(--interactive-filter);
  outline: var(--button-focus-outline, var(--outline));
}
`;
var SUCCESS = `
.success__position {
  position: fixed;
  inset: var(--dialog-inset);
  padding: var(--page-margin);
  z-index: var(--z-index);
}
.success__content {
  background: var(--success-background, var(--background));
  border: var(--success-border, var(--border));
  border-radius: var(--success-border-radius, 1.7em/50%);
  box-shadow: var(--success-box-shadow, var(--box-shadow));
  font-weight: var(--success-font-weight, 600);
  color: var(--success-color);
  fill: var(--success-color);
  padding: 12px 24px;
  line-height: 1.75em;

  display: grid;
  align-items: center;
  grid-auto-flow: column;
  gap: 6px;
  cursor: default;
}

.success__icon {
  display: flex;
}
`;
function createDialogStyles(styleNonce) {
	const style = DOCUMENT.createElement("style");
	style.textContent = `
:host {
  --dialog-inset: var(--inset);
}

${DIALOG}
${DIALOG_HEADER}
${FORM}
${BUTTON}
${SUCCESS}
`;
	if (styleNonce) style.setAttribute("nonce", styleNonce);
	return style;
}
function getUser() {
	const currentUser = getCurrentScope().getUser();
	const isolationUser = getIsolationScope().getUser();
	const globalUser = getGlobalScope().getUser();
	if (currentUser && Object.keys(currentUser).length) return currentUser;
	if (isolationUser && Object.keys(isolationUser).length) return isolationUser;
	return globalUser;
}
var feedbackModalIntegration = (() => {
	return {
		name: "FeedbackModal",
		setupOnce() {},
		createDialog: ({ options, screenshotIntegration, sendFeedback, shadow }) => {
			const shadowRoot = shadow;
			const userKey = options.useSentryUser;
			const user = getUser();
			const el = DOCUMENT.createElement("div");
			const style = createDialogStyles(options.styleNonce);
			let originalOverflow = "";
			const dialog = {
				get el() {
					return el;
				},
				appendToDom() {
					if (!shadowRoot.contains(style) && !shadowRoot.contains(el)) {
						shadowRoot.appendChild(style);
						shadowRoot.appendChild(el);
					}
				},
				removeFromDom() {
					el.remove();
					style.remove();
					DOCUMENT.body.style.overflow = originalOverflow;
				},
				open() {
					renderContent(true);
					options.onFormOpen?.();
					getClient()?.emit("openFeedbackWidget");
					originalOverflow = DOCUMENT.body.style.overflow;
					DOCUMENT.body.style.overflow = "hidden";
				},
				close() {
					renderContent(false);
					DOCUMENT.body.style.overflow = originalOverflow;
				}
			};
			const screenshotInput = screenshotIntegration?.createInput({
				h: y$1,
				hooks,
				dialog,
				options
			});
			const renderContent = (open) => {
				B$1(/* @__PURE__ */ y$1(Dialog, {
					options,
					screenshotInput,
					showName: options.showName || options.isNameRequired,
					showEmail: options.showEmail || options.isEmailRequired,
					defaultName: String(userKey && user?.[userKey.name] || ""),
					defaultEmail: String(userKey && user?.[userKey.email] || ""),
					onFormClose: () => {
						renderContent(false);
						options.onFormClose?.();
					},
					onSubmit: sendFeedback,
					onSubmitSuccess: (data, eventId) => {
						renderContent(false);
						options.onSubmitSuccess?.(data, eventId);
					},
					onSubmitError: (error) => {
						options.onSubmitError?.(error);
					},
					onFormSubmitted: () => {
						options.onFormSubmitted?.();
					},
					open
				}), el);
			};
			return dialog;
		}
	};
});
function IconCloseFactory({ h }) {
	return function IconClose() {
		return /* @__PURE__ */ h("svg", {
			"data-test-id": "icon-close",
			viewBox: "0 0 16 16",
			fill: "#2B2233",
			height: "25px",
			width: "25px"
		}, /* @__PURE__ */ h("circle", {
			r: "7",
			cx: "8",
			cy: "8",
			fill: "white"
		}), /* @__PURE__ */ h("path", {
			strokeWidth: "1.5",
			d: "M8,16a8,8,0,1,1,8-8A8,8,0,0,1,8,16ZM8,1.53A6.47,6.47,0,1,0,14.47,8,6.47,6.47,0,0,0,8,1.53Z"
		}), /* @__PURE__ */ h("path", {
			strokeWidth: "1.5",
			d: "M5.34,11.41a.71.71,0,0,1-.53-.22.74.74,0,0,1,0-1.06l5.32-5.32a.75.75,0,0,1,1.06,1.06L5.87,11.19A.74.74,0,0,1,5.34,11.41Z"
		}), /* @__PURE__ */ h("path", {
			strokeWidth: "1.5",
			d: "M10.66,11.41a.74.74,0,0,1-.53-.22L4.81,5.87A.75.75,0,0,1,5.87,4.81l5.32,5.32a.74.74,0,0,1,0,1.06A.71.71,0,0,1,10.66,11.41Z"
		}));
	};
}
function createScreenshotInputStyles(styleNonce) {
	const style = DOCUMENT.createElement("style");
	const surface200 = "#1A141F";
	const gray100 = "#302735";
	style.textContent = `
.editor {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}

.editor__image-container {
  justify-items: center;
  padding: 15px;
  position: relative;
  height: 100%;
  border-radius: var(--menu-border-radius, 6px);

  background-color: ${surface200};
  background-image: repeating-linear-gradient(
      -145deg,
      transparent,
      transparent 8px,
      ${surface200} 8px,
      ${surface200} 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 15px,
      ${gray100} 15px,
      ${gray100} 16px
    );
}

.editor__canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor__canvas-container > * {
  object-fit: contain;
  position: absolute;
}

.editor__tool-container {
  padding-top: 8px;
  display: flex;
  justify-content: center;
}

.editor__tool-bar {
  display: flex;
  gap: 8px;
}

.editor__tool {
  display: flex;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  background: var(--button-background, var(--background));
  color: var(--button-color, var(--foreground));
}

.editor__tool--active {
  background: var(--button-primary-background, var(--accent-background));
  color: var(--button-primary-color, var(--accent-foreground));
}

.editor__rect {
  position: absolute;
  z-index: 2;
}

.editor__rect button {
  opacity: 0;
  position: absolute;
  top: -12px;
  right: -12px;
  cursor: pointer;
  padding: 0;
  z-index: 3;
  border: none;
  background: none;
}

.editor__rect:hover button {
  opacity: 1;
}
`;
	if (styleNonce) style.setAttribute("nonce", styleNonce);
	return style;
}
function ToolbarFactory({ h }) {
	return function Toolbar({ action, setAction, options }) {
		return /* @__PURE__ */ h("div", { class: "editor__tool-container" }, /* @__PURE__ */ h("div", { class: "editor__tool-bar" }, /* @__PURE__ */ h("button", {
			type: "button",
			class: `editor__tool ${action === "highlight" ? "editor__tool--active" : ""}`,
			onClick: () => {
				setAction(action === "highlight" ? "" : "highlight");
			}
		}, options.highlightToolText), /* @__PURE__ */ h("button", {
			type: "button",
			class: `editor__tool ${action === "hide" ? "editor__tool--active" : ""}`,
			onClick: () => {
				setAction(action === "hide" ? "" : "hide");
			}
		}, options.hideToolText)));
	};
}
function useTakeScreenshotFactory({ hooks }) {
	function useDpi() {
		const [dpi, setDpi] = hooks.useState(WINDOW$4.devicePixelRatio ?? 1);
		hooks.useEffect(() => {
			const onChange = () => {
				setDpi(WINDOW$4.devicePixelRatio);
			};
			const media = matchMedia(`(resolution: ${WINDOW$4.devicePixelRatio}dppx)`);
			media.addEventListener("change", onChange);
			return () => {
				media.removeEventListener("change", onChange);
			};
		}, []);
		return dpi;
	}
	return function useTakeScreenshot({ onBeforeScreenshot, onScreenshot, onAfterScreenshot, onError }) {
		const dpi = useDpi();
		hooks.useEffect(() => {
			const takeScreenshot = async () => {
				onBeforeScreenshot();
				const stream = await NAVIGATOR.mediaDevices.getDisplayMedia({
					video: {
						width: WINDOW$4.innerWidth * dpi,
						height: WINDOW$4.innerHeight * dpi
					},
					audio: false,
					monitorTypeSurfaces: "exclude",
					preferCurrentTab: true,
					selfBrowserSurface: "include",
					surfaceSwitching: "exclude"
				});
				const video = DOCUMENT.createElement("video");
				await new Promise((resolve, reject) => {
					video.srcObject = stream;
					video.onloadedmetadata = () => {
						onScreenshot(video, dpi);
						stream.getTracks().forEach((track) => track.stop());
						resolve();
					};
					video.play().catch(reject);
				});
				onAfterScreenshot();
			};
			takeScreenshot().catch(onError);
		}, []);
	};
}
function drawRect(command, ctx, color) {
	switch (command.type) {
		case "highlight":
			ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
			ctx.shadowBlur = 50;
			ctx.fillStyle = color;
			ctx.fillRect(command.x - 1, command.y - 1, command.w + 2, command.h + 2);
			ctx.clearRect(command.x, command.y, command.w, command.h);
			break;
		case "hide":
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(command.x, command.y, command.w, command.h);
			break;
	}
}
function with2dContext(canvas, options, callback) {
	if (!canvas) return;
	const ctx = canvas.getContext("2d", options);
	if (!ctx) return;
	callback(canvas, ctx);
}
function paintImage(maybeDest, source) {
	with2dContext(maybeDest, { alpha: true }, (destCanvas, destCtx) => {
		destCtx.drawImage(source, 0, 0, source.width, source.height, 0, 0, destCanvas.width, destCanvas.height);
	});
}
function paintForeground(maybeCanvas, strokeColor, drawCommands) {
	with2dContext(maybeCanvas, { alpha: true }, (canvas, ctx) => {
		if (drawCommands.length) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		drawCommands.forEach((command) => {
			drawRect(command, ctx, strokeColor);
		});
	});
}
function ScreenshotEditorFactory({ h: h2, hooks, outputBuffer, dialog, options }) {
	const useTakeScreenshot = useTakeScreenshotFactory({ hooks });
	const Toolbar = ToolbarFactory({ h: h2 });
	const IconClose = IconCloseFactory({ h: h2 });
	const editorStyleInnerText = { __html: createScreenshotInputStyles(options.styleNonce).innerText };
	const dialogStyle = dialog.el.style;
	const ScreenshotEditor = ({ screenshot }) => {
		const [action, setAction] = hooks.useState("highlight");
		const [drawCommands, setDrawCommands] = hooks.useState([]);
		const measurementRef = hooks.useRef(null);
		const backgroundRef = hooks.useRef(null);
		const foregroundRef = hooks.useRef(null);
		const mouseRef = hooks.useRef(null);
		const [scaleFactor, setScaleFactor] = hooks.useState(1);
		const strokeColor = hooks.useMemo(() => {
			const sentryFeedback = DOCUMENT.getElementById(options.id);
			if (!sentryFeedback) return "white";
			const computedStyle = getComputedStyle(sentryFeedback);
			return computedStyle.getPropertyValue("--button-primary-background") || computedStyle.getPropertyValue("--accent-background");
		}, [options.id]);
		hooks.useLayoutEffect(() => {
			const handleResize = () => {
				const measurementDiv = measurementRef.current;
				if (!measurementDiv) return;
				with2dContext(screenshot.canvas, { alpha: false }, (canvas) => {
					const scale = Math.min(measurementDiv.clientWidth / canvas.width, measurementDiv.clientHeight / canvas.height);
					setScaleFactor(scale);
				});
				if (measurementDiv.clientHeight === 0 || measurementDiv.clientWidth === 0) setTimeout(handleResize, 0);
			};
			handleResize();
			WINDOW$4.addEventListener("resize", handleResize);
			return () => {
				WINDOW$4.removeEventListener("resize", handleResize);
			};
		}, [screenshot]);
		const setCanvasSize = hooks.useCallback((maybeCanvas, scale) => {
			with2dContext(maybeCanvas, { alpha: true }, (canvas, ctx) => {
				ctx.scale(scale, scale);
				canvas.width = screenshot.canvas.width;
				canvas.height = screenshot.canvas.height;
			});
		}, [screenshot]);
		hooks.useEffect(() => {
			setCanvasSize(backgroundRef.current, screenshot.dpi);
			paintImage(backgroundRef.current, screenshot.canvas);
		}, [screenshot]);
		hooks.useEffect(() => {
			setCanvasSize(foregroundRef.current, screenshot.dpi);
			with2dContext(foregroundRef.current, { alpha: true }, (canvas, ctx) => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			});
			paintForeground(foregroundRef.current, strokeColor, drawCommands);
		}, [drawCommands, strokeColor]);
		hooks.useEffect(() => {
			setCanvasSize(outputBuffer, screenshot.dpi);
			paintImage(outputBuffer, screenshot.canvas);
			with2dContext(DOCUMENT.createElement("canvas"), { alpha: true }, (foreground, ctx) => {
				ctx.scale(screenshot.dpi, screenshot.dpi);
				foreground.width = screenshot.canvas.width;
				foreground.height = screenshot.canvas.height;
				paintForeground(foreground, strokeColor, drawCommands);
				paintImage(outputBuffer, foreground);
			});
		}, [
			drawCommands,
			screenshot,
			strokeColor
		]);
		const handleMouseDown = (e) => {
			if (!action || !mouseRef.current) return;
			const boundingRect = mouseRef.current.getBoundingClientRect();
			const startingPoint = {
				type: action,
				x: e.offsetX / scaleFactor,
				y: e.offsetY / scaleFactor
			};
			const getDrawCommand = (startingPoint2, e2) => {
				const x = (e2.clientX - boundingRect.x) / scaleFactor;
				const y = (e2.clientY - boundingRect.y) / scaleFactor;
				return {
					type: startingPoint2.type,
					x: Math.min(startingPoint2.x, x),
					y: Math.min(startingPoint2.y, y),
					w: Math.abs(x - startingPoint2.x),
					h: Math.abs(y - startingPoint2.y)
				};
			};
			const handleMouseMove = (e2) => {
				with2dContext(foregroundRef.current, { alpha: true }, (canvas, ctx) => {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				});
				paintForeground(foregroundRef.current, strokeColor, [...drawCommands, getDrawCommand(startingPoint, e2)]);
			};
			const handleMouseUp = (e2) => {
				const drawCommand = getDrawCommand(startingPoint, e2);
				if (drawCommand.w * scaleFactor >= 1 && drawCommand.h * scaleFactor >= 1) setDrawCommands((prev) => [...prev, drawCommand]);
				DOCUMENT.removeEventListener("mousemove", handleMouseMove);
				DOCUMENT.removeEventListener("mouseup", handleMouseUp);
			};
			DOCUMENT.addEventListener("mousemove", handleMouseMove);
			DOCUMENT.addEventListener("mouseup", handleMouseUp);
		};
		const deleteRect = hooks.useCallback((index) => {
			return (e) => {
				e.preventDefault();
				e.stopPropagation();
				setDrawCommands((prev) => {
					const updatedRects = [...prev];
					updatedRects.splice(index, 1);
					return updatedRects;
				});
			};
		}, []);
		const dimensions = {
			width: `${screenshot.canvas.width * scaleFactor}px`,
			height: `${screenshot.canvas.height * scaleFactor}px`
		};
		const handleStopPropagation = (e) => {
			e.stopPropagation();
		};
		return /* @__PURE__ */ h2("div", { class: "editor" }, /* @__PURE__ */ h2("style", {
			nonce: options.styleNonce,
			dangerouslySetInnerHTML: editorStyleInnerText
		}), /* @__PURE__ */ h2("div", { class: "editor__image-container" }, /* @__PURE__ */ h2("div", {
			class: "editor__canvas-container",
			ref: measurementRef
		}, /* @__PURE__ */ h2("canvas", {
			ref: backgroundRef,
			id: "background",
			style: dimensions
		}), /* @__PURE__ */ h2("canvas", {
			ref: foregroundRef,
			id: "foreground",
			style: dimensions
		}), /* @__PURE__ */ h2("div", {
			ref: mouseRef,
			onMouseDown: handleMouseDown,
			style: dimensions
		}, drawCommands.map((rect, index) => /* @__PURE__ */ h2("div", {
			key: index,
			class: "editor__rect",
			style: {
				top: `${rect.y * scaleFactor}px`,
				left: `${rect.x * scaleFactor}px`,
				width: `${rect.w * scaleFactor}px`,
				height: `${rect.h * scaleFactor}px`
			}
		}, /* @__PURE__ */ h2("button", {
			"aria-label": options.removeHighlightText,
			onClick: deleteRect(index),
			onMouseDown: handleStopPropagation,
			onMouseUp: handleStopPropagation,
			type: "button"
		}, /* @__PURE__ */ h2(IconClose, null))))))), /* @__PURE__ */ h2(Toolbar, {
			options,
			action,
			setAction
		}));
	};
	return function Wrapper({ onError }) {
		const [screenshot, setScreenshot] = hooks.useState();
		useTakeScreenshot({
			onBeforeScreenshot: hooks.useCallback(() => {
				dialogStyle.display = "none";
			}, []),
			onScreenshot: hooks.useCallback((screenshotVideo, dpi) => {
				with2dContext(DOCUMENT.createElement("canvas"), { alpha: false }, (canvas, ctx) => {
					ctx.scale(dpi, dpi);
					canvas.width = screenshotVideo.videoWidth;
					canvas.height = screenshotVideo.videoHeight;
					ctx.drawImage(screenshotVideo, 0, 0, canvas.width, canvas.height);
					setScreenshot({
						canvas,
						dpi
					});
				});
				outputBuffer.width = screenshotVideo.videoWidth;
				outputBuffer.height = screenshotVideo.videoHeight;
			}, []),
			onAfterScreenshot: hooks.useCallback(() => {
				dialogStyle.display = "block";
			}, []),
			onError: hooks.useCallback((error) => {
				dialogStyle.display = "block";
				onError(error);
			}, [])
		});
		if (screenshot) return /* @__PURE__ */ h2(ScreenshotEditor, { screenshot });
		return /* @__PURE__ */ h2("div", null);
	};
}
var feedbackScreenshotIntegration = (() => {
	return {
		name: "FeedbackScreenshot",
		setupOnce() {},
		createInput: ({ h, hooks, dialog, options }) => {
			const outputBuffer = DOCUMENT.createElement("canvas");
			return {
				input: ScreenshotEditorFactory({
					h,
					hooks,
					outputBuffer,
					dialog,
					options
				}),
				value: async () => {
					const blob = await new Promise((resolve) => {
						outputBuffer.toBlob(resolve, "image/png");
					});
					if (blob) return {
						data: new Uint8Array(await blob.arrayBuffer()),
						filename: "screenshot.png",
						contentType: "application/png"
					};
				}
			};
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/helpers.js
var WINDOW$3 = GLOBAL_OBJ;
var ignoreOnError = 0;
function shouldIgnoreOnError() {
	return ignoreOnError > 0;
}
function ignoreNextOnError() {
	ignoreOnError++;
	setTimeout(() => {
		ignoreOnError--;
	});
}
function wrap(fn, options = {}) {
	function isFunction(fn2) {
		return typeof fn2 === "function";
	}
	if (!isFunction(fn)) return fn;
	try {
		if (Object.prototype.hasOwnProperty.call(fn, "__sentry_wrapped__")) {
			const wrapper = fn.__sentry_wrapped__;
			if (typeof wrapper === "function") return wrapper;
			else return fn;
		}
		if (getOriginalFunction(fn)) return fn;
	} catch {
		return fn;
	}
	const sentryWrapped = function(...args) {
		GLOBAL_OBJ._sentryWrappedDepth = (GLOBAL_OBJ._sentryWrappedDepth || 0) + 1;
		try {
			const wrappedArguments = args.map((arg) => wrap(arg, options));
			return fn.apply(this, wrappedArguments);
		} catch (ex) {
			ignoreNextOnError();
			withScope((scope) => {
				scope.addEventProcessor((event) => {
					if (options.mechanism) {
						addExceptionTypeValue(event, void 0, void 0);
						addExceptionMechanism(event, options.mechanism);
					}
					event.extra = {
						...event.extra,
						arguments: args
					};
					return event;
				});
				captureException(ex);
			});
			throw ex;
		} finally {
			GLOBAL_OBJ._sentryWrappedDepth = (GLOBAL_OBJ._sentryWrappedDepth || 0) - 1;
		}
	};
	try {
		for (const property in fn) if (Object.prototype.hasOwnProperty.call(fn, property)) sentryWrapped[property] = fn[property];
	} catch {}
	markFunctionWrapped(sentryWrapped, fn);
	addNonEnumerableProperty(fn, "__sentry_wrapped__", sentryWrapped);
	try {
		if (Object.getOwnPropertyDescriptor(sentryWrapped, "name").configurable) Object.defineProperty(sentryWrapped, "name", { get() {
			return fn.name;
		} });
	} catch {}
	return sentryWrapped;
}
function getHttpRequestData() {
	const url = getLocationHref();
	const { referrer } = WINDOW$3.document || {};
	const { userAgent } = WINDOW$3.navigator || {};
	return {
		url,
		headers: {
			...referrer && { Referer: referrer },
			...userAgent && { "User-Agent": userAgent }
		}
	};
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/utils/lazyLoadIntegration.js
var LAZY_LOADABLE_NAMES = [
	"replayIntegration",
	"replayCanvasIntegration",
	"feedbackIntegration",
	"feedbackModalIntegration",
	"feedbackScreenshotIntegration",
	"captureConsoleIntegration",
	"contextLinesIntegration",
	"linkedErrorsIntegration",
	"dedupeIntegration",
	"extraErrorDataIntegration",
	"graphqlClientIntegration",
	"httpClientIntegration",
	"reportingObserverIntegration",
	"rewriteFramesIntegration",
	"browserProfilingIntegration",
	"moduleMetadataIntegration",
	"instrumentAnthropicAiClient",
	"instrumentOpenAiClient",
	"instrumentGoogleGenAIClient",
	"instrumentLangGraph",
	"createLangChainCallbackHandler",
	"instrumentLangChainEmbeddings"
];
var HYPHENATED_BUNDLES = {
	replayCanvasIntegration: "replay-canvas",
	feedbackModalIntegration: "feedback-modal",
	feedbackScreenshotIntegration: "feedback-screenshot"
};
function getBundleName(name) {
	return HYPHENATED_BUNDLES[name] || name.replace("Integration", "").toLowerCase();
}
var WindowWithMaybeIntegration = WINDOW$3;
async function lazyLoadIntegration(name, scriptNonce) {
	const bundle = LAZY_LOADABLE_NAMES.includes(name) ? getBundleName(name) : void 0;
	const sentryOnWindow = WindowWithMaybeIntegration.Sentry = WindowWithMaybeIntegration.Sentry || {};
	if (!bundle) throw new Error(`Cannot lazy load integration: ${name}`);
	const existing = sentryOnWindow[name];
	if (typeof existing === "function" && !("_isShim" in existing)) return existing;
	const url = getScriptURL(bundle);
	const script = WINDOW$3.document.createElement("script");
	script.src = url;
	script.crossOrigin = "anonymous";
	script.referrerPolicy = "strict-origin";
	if (scriptNonce) script.setAttribute("nonce", scriptNonce);
	const waitForLoad = new Promise((resolve, reject) => {
		script.addEventListener("load", () => resolve());
		script.addEventListener("error", reject);
	});
	const currentScript = WINDOW$3.document.currentScript;
	const parent = WINDOW$3.document.body || WINDOW$3.document.head || currentScript?.parentElement;
	if (parent) parent.appendChild(script);
	else throw new Error(`Could not find parent element to insert lazy-loaded ${name} script`);
	try {
		await waitForLoad;
	} catch {
		throw new Error(`Error when loading integration: ${name}`);
	}
	const integrationFn = sentryOnWindow[name];
	if (typeof integrationFn !== "function") throw new Error(`Could not load integration: ${name}`);
	return integrationFn;
}
function getScriptURL(bundle) {
	const baseURL = getClient()?.getOptions()?.cdnBaseUrl || "https://browser.sentry-cdn.com";
	return new URL(`/${SDK_VERSION}/${bundle}.min.js`, baseURL).toString();
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/feedbackAsync.js
var feedbackAsyncIntegration = buildFeedbackIntegration({ lazyLoadIntegration });
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/feedbackSync.js
var feedbackSyncIntegration = buildFeedbackIntegration({
	getModalIntegration: () => feedbackModalIntegration,
	getScreenshotIntegration: () => feedbackScreenshotIntegration
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/eventbuilder.js
function exceptionFromError(stackParser, ex) {
	const frames = parseStackFrames(stackParser, ex);
	const exception = {
		type: extractType(ex),
		value: extractMessage(ex)
	};
	if (frames.length) exception.stacktrace = { frames };
	if (exception.type === void 0 && exception.value === "") exception.value = "Unrecoverable error caught";
	return exception;
}
function eventFromPlainObject(stackParser, exception, syntheticException, isUnhandledRejection) {
	const normalizeDepth = getClient()?.getOptions().normalizeDepth;
	const errorFromProp = getErrorPropertyFromObject(exception);
	const extra = { __serialized__: normalizeToSize(exception, normalizeDepth) };
	if (errorFromProp) return {
		exception: { values: [exceptionFromError(stackParser, errorFromProp)] },
		extra
	};
	const event = {
		exception: { values: [{
			type: isEvent(exception) ? exception.constructor.name : isUnhandledRejection ? "UnhandledRejection" : "Error",
			value: getNonErrorObjectExceptionValue(exception, { isUnhandledRejection })
		}] },
		extra
	};
	if (syntheticException) {
		const frames = parseStackFrames(stackParser, syntheticException);
		if (frames.length) event.exception.values[0].stacktrace = { frames };
	}
	return event;
}
function eventFromError(stackParser, ex) {
	return { exception: { values: [exceptionFromError(stackParser, ex)] } };
}
function parseStackFrames(stackParser, ex) {
	const stacktrace = ex.stacktrace || ex.stack || "";
	const skipLines = getSkipFirstStackStringLines(ex);
	const framesToPop = getPopFirstTopFrames(ex);
	try {
		return stackParser(stacktrace, skipLines, framesToPop);
	} catch {}
	return [];
}
var reactMinifiedRegexp = /Minified React error #\d+;/i;
function getSkipFirstStackStringLines(ex) {
	if (ex && reactMinifiedRegexp.test(ex.message)) return 1;
	return 0;
}
function getPopFirstTopFrames(ex) {
	if (typeof ex.framesToPop === "number") return ex.framesToPop;
	return 0;
}
function isWebAssemblyException(exception) {
	if (typeof WebAssembly !== "undefined" && typeof WebAssembly.Exception !== "undefined") return exception instanceof WebAssembly.Exception;
	else return false;
}
function extractType(ex) {
	const name = ex?.name;
	if (!name && isWebAssemblyException(ex)) return ex.message && Array.isArray(ex.message) && ex.message.length == 2 ? ex.message[0] : "WebAssembly.Exception";
	return name;
}
function extractMessage(ex) {
	const message = ex?.message;
	if (isWebAssemblyException(ex)) {
		if (Array.isArray(ex.message) && ex.message.length == 2) return ex.message[1];
		return "wasm exception";
	}
	if (!message) return "No error message";
	if (message.error && typeof message.error.message === "string") return _enhanceErrorWithSentryInfo(message.error);
	return _enhanceErrorWithSentryInfo(ex);
}
function eventFromException(stackParser, exception, hint, attachStacktrace) {
	const event = eventFromUnknownInput(stackParser, exception, hint?.syntheticException || void 0, attachStacktrace);
	addExceptionMechanism(event);
	event.level = "error";
	if (hint?.event_id) event.event_id = hint.event_id;
	return resolvedSyncPromise(event);
}
function eventFromMessage(stackParser, message, level = "info", hint, attachStacktrace) {
	const event = eventFromString(stackParser, message, hint?.syntheticException || void 0, attachStacktrace);
	event.level = level;
	if (hint?.event_id) event.event_id = hint.event_id;
	return resolvedSyncPromise(event);
}
function eventFromUnknownInput(stackParser, exception, syntheticException, attachStacktrace, isUnhandledRejection) {
	let event;
	if (isErrorEvent$1(exception) && exception.error) return eventFromError(stackParser, exception.error);
	if (isDOMError(exception) || isDOMException(exception)) {
		const domException = exception;
		if ("stack" in exception) {
			event = eventFromError(stackParser, exception);
			const firstException = event.exception?.values?.[0];
			if (attachStacktrace && syntheticException && firstException && !firstException.stacktrace) {
				const frames = parseStackFrames(stackParser, syntheticException);
				if (frames.length) {
					firstException.stacktrace = { frames };
					addExceptionMechanism(event, { synthetic: true });
				}
			}
		} else {
			const name = domException.name || (isDOMError(domException) ? "DOMError" : "DOMException");
			const message = domException.message ? `${name}: ${domException.message}` : name;
			event = eventFromString(stackParser, message, syntheticException, attachStacktrace);
			addExceptionTypeValue(event, message);
		}
		if ("code" in domException) event.tags = {
			...event.tags,
			"DOMException.code": `${domException.code}`
		};
		return event;
	}
	if (isError(exception)) return eventFromError(stackParser, exception);
	if (isPlainObject(exception) || isEvent(exception)) {
		event = eventFromPlainObject(stackParser, exception, syntheticException, isUnhandledRejection);
		addExceptionMechanism(event, { synthetic: true });
		return event;
	}
	event = eventFromString(stackParser, exception, syntheticException, attachStacktrace);
	addExceptionTypeValue(event, `${exception}`, void 0);
	addExceptionMechanism(event, { synthetic: true });
	return event;
}
function eventFromString(stackParser, message, syntheticException, attachStacktrace) {
	const event = {};
	if (attachStacktrace && syntheticException) {
		const frames = parseStackFrames(stackParser, syntheticException);
		if (frames.length) event.exception = { values: [{
			value: message,
			stacktrace: { frames }
		}] };
		addExceptionMechanism(event, { synthetic: true });
	}
	if (isParameterizedString(message)) {
		const { __sentry_template_string__, __sentry_template_values__ } = message;
		event.logentry = {
			message: __sentry_template_string__,
			params: __sentry_template_values__
		};
		return event;
	}
	event.message = message;
	return event;
}
function getNonErrorObjectExceptionValue(exception, { isUnhandledRejection }) {
	const keys = extractExceptionKeysForMessage(exception);
	const captureType = isUnhandledRejection ? "promise rejection" : "exception";
	if (isErrorEvent$1(exception)) return `Event \`ErrorEvent\` captured as ${captureType} with message \`${exception.message}\``;
	if (isEvent(exception)) return `Event \`${getObjectClassName(exception)}\` (type=${exception.type}) captured as ${captureType}`;
	return `Object captured as ${captureType} with keys: ${keys}`;
}
function getObjectClassName(obj) {
	try {
		const prototype = Object.getPrototypeOf(obj);
		return prototype ? prototype.constructor.name : void 0;
	} catch {}
}
function getErrorPropertyFromObject(obj) {
	return Object.values(obj).find((v) => v instanceof Error);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/client.js
var BrowserClient = class extends Client {
	/**
	* Creates a new Browser SDK instance.
	*
	* @param options Configuration options for this SDK.
	*/
	constructor(options) {
		const opts = applyDefaultOptions(options);
		applySdkMetadata(opts, "browser", ["browser"], WINDOW$3.SENTRY_SDK_SOURCE || getSDKSource());
		super(opts);
		const { userInfo } = this.getDataCollectionOptions();
		if (opts._metadata?.sdk) opts._metadata.sdk.settings = {
			infer_ip: userInfo ? "auto" : "never",
			...opts._metadata.sdk.settings
		};
		const { sendClientReports } = this._options;
		if (WINDOW$3.document) WINDOW$3.document.addEventListener("visibilitychange", () => {
			if (WINDOW$3.document.visibilityState === "hidden") {
				if (sendClientReports) this._flushOutcomes();
				queueMicrotask(() => {
					this.flush();
				});
			}
		});
		if (userInfo) this.on("beforeSendSession", addAutoIpAddressToSession);
	}
	/**
	* @inheritDoc
	*/
	eventFromException(exception, hint) {
		return eventFromException(this._options.stackParser, exception, hint, this._options.attachStacktrace);
	}
	/**
	* @inheritDoc
	*/
	eventFromMessage(message, level = "info", hint) {
		return eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace);
	}
	/**
	* @inheritDoc
	*/
	_prepareEvent(event, hint, currentScope, isolationScope) {
		event.platform = event.platform || "javascript";
		return super._prepareEvent(event, hint, currentScope, isolationScope);
	}
};
function applyDefaultOptions(optionsArg) {
	return {
		release: typeof __SENTRY_RELEASE__ === "string" ? __SENTRY_RELEASE__ : WINDOW$3.SENTRY_RELEASE?.id,
		sendClientReports: true,
		parentSpanIsAlwaysRootSpan: true,
		...optionsArg
	};
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/debug-build.js
var DEBUG_BUILD$1 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/types.js
var WINDOW$2 = GLOBAL_OBJ;
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/bindReporter.js
var getRating = (value, thresholds) => {
	if (value > thresholds[1]) return "poor";
	if (value > thresholds[0]) return "needs-improvement";
	return "good";
};
var bindReporter = (callback, metric, thresholds, reportAllChanges) => {
	let prevValue;
	let delta;
	return (forceReport) => {
		if (metric.value >= 0) {
			if (forceReport || reportAllChanges) {
				delta = metric.value - (prevValue ?? 0);
				if (delta || prevValue === void 0) {
					prevValue = metric.value;
					metric.delta = delta;
					metric.rating = getRating(metric.value, thresholds);
					callback(metric);
				}
			}
		}
	};
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/getNavigationEntry.js
var getNavigationEntry = (checkResponseStart = true) => {
	const navigationEntry = WINDOW$2.performance?.getEntriesByType?.("navigation")[0];
	if (!checkResponseStart || navigationEntry && navigationEntry.responseStart > 0 && navigationEntry.responseStart < performance.now()) return navigationEntry;
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/getActivationStart.js
var getActivationStart = () => {
	return getNavigationEntry()?.activationStart ?? 0;
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/globalListeners.js
function addPageListener(type, listener, options) {
	if (WINDOW$2.document) WINDOW$2.addEventListener(type, listener, options);
}
function removePageListener(type, listener, options) {
	if (WINDOW$2.document) WINDOW$2.removeEventListener(type, listener, options);
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/getVisibilityWatcher.js
var firstHiddenTime = -1;
var onHiddenFunctions = /* @__PURE__ */ new Set();
var initHiddenTime = () => {
	return WINDOW$2.document?.visibilityState === "hidden" && !WINDOW$2.document?.prerendering ? 0 : Infinity;
};
var onVisibilityUpdate = (event) => {
	if (isPageHidden(event) && firstHiddenTime > -1) {
		if (event.type === "visibilitychange" || event.type === "pagehide") for (const onHiddenFunction of onHiddenFunctions) onHiddenFunction();
		if (!isFinite(firstHiddenTime)) {
			firstHiddenTime = event.type === "visibilitychange" ? event.timeStamp : 0;
			removePageListener("prerenderingchange", onVisibilityUpdate, true);
		}
	}
};
var getVisibilityWatcher = () => {
	if (WINDOW$2.document && firstHiddenTime < 0) {
		const activationStart = getActivationStart();
		firstHiddenTime = (!WINDOW$2.document.prerendering ? globalThis.performance.getEntriesByType("visibility-state").filter((e) => e.name === "hidden" && e.startTime > activationStart)[0]?.startTime : void 0) ?? initHiddenTime();
		addPageListener("visibilitychange", onVisibilityUpdate, true);
		addPageListener("pagehide", onVisibilityUpdate, true);
		addPageListener("prerenderingchange", onVisibilityUpdate, true);
	}
	return {
		get firstHiddenTime() {
			return firstHiddenTime;
		},
		onHidden(cb) {
			onHiddenFunctions.add(cb);
		}
	};
};
function isPageHidden(event) {
	return event.type === "pagehide" || WINDOW$2.document?.visibilityState === "hidden";
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/generateUniqueID.js
var generateUniqueID = () => {
	return `v5-${Date.now()}-${Math.floor(Math.random() * 8999999999999) + 0xe8d4a51000}`;
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/initMetric.js
var initMetric = (name, value = -1) => {
	const navEntry = getNavigationEntry();
	let navigationType = "navigate";
	if (navEntry) {
		if (WINDOW$2.document?.prerendering || getActivationStart() > 0) navigationType = "prerender";
		else if (WINDOW$2.document?.wasDiscarded) navigationType = "restore";
		else if (navEntry.type) navigationType = navEntry.type.replace(/_/g, "-");
	}
	return {
		name,
		value,
		rating: "good",
		delta: 0,
		entries: [],
		id: generateUniqueID(),
		navigationType
	};
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/initUnique.js
var instanceMap = /* @__PURE__ */ new WeakMap();
function initUnique(identityObj, ClassObj) {
	try {
		if (!instanceMap.get(identityObj)) instanceMap.set(identityObj, new ClassObj());
		return instanceMap.get(identityObj);
	} catch (_e) {
		return new ClassObj();
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/LayoutShiftManager.js
var LayoutShiftManager = class {
	constructor() {
		this._sessionValue = 0;
		this._sessionEntries = [];
	}
	_processEntry(entry) {
		if (entry.hadRecentInput) return;
		const firstSessionEntry = this._sessionEntries[0];
		const lastSessionEntry = this._sessionEntries[this._sessionEntries.length - 1];
		if (this._sessionValue && firstSessionEntry && lastSessionEntry && entry.startTime - lastSessionEntry.startTime < 1e3 && entry.startTime - firstSessionEntry.startTime < 5e3) {
			this._sessionValue += entry.value;
			this._sessionEntries.push(entry);
		} else {
			this._sessionValue = entry.value;
			this._sessionEntries = [entry];
		}
		this._onAfterProcessingUnexpectedShift?.(entry);
	}
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/observe.js
var observe = (type, callback, opts = {}) => {
	try {
		if (PerformanceObserver.supportedEntryTypes.includes(type)) {
			const po = new PerformanceObserver((list) => {
				Promise.resolve().then(() => {
					callback(list.getEntries());
				});
			});
			po.observe({
				type,
				buffered: true,
				...opts
			});
			return po;
		}
	} catch {}
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/runOnce.js
var runOnce = (cb) => {
	let called = false;
	return () => {
		if (!called) {
			cb();
			called = true;
		}
	};
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/whenActivated.js
var whenActivated = (callback) => {
	if (WINDOW$2.document?.prerendering) addEventListener("prerenderingchange", () => callback(), true);
	else callback();
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/onFCP.js
var FCPThresholds = [1800, 3e3];
var onFCP = (onReport, opts = {}) => {
	whenActivated(() => {
		const visibilityWatcher = getVisibilityWatcher();
		const metric = initMetric("FCP");
		let report;
		const handleEntries = (entries) => {
			for (const entry of entries) if (entry.name === "first-contentful-paint") {
				po.disconnect();
				if (entry.startTime < visibilityWatcher.firstHiddenTime) {
					metric.value = Math.max(entry.startTime - getActivationStart(), 0);
					metric.entries.push(entry);
					report(true);
				}
			}
		};
		const po = observe("paint", handleEntries);
		if (po) report = bindReporter(onReport, metric, FCPThresholds, opts.reportAllChanges);
	});
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/getCLS.js
var CLSThresholds = [.1, .25];
var onCLS = (onReport, opts = {}) => {
	onFCP(runOnce(() => {
		const metric = initMetric("CLS", 0);
		let report;
		const visibilityWatcher = getVisibilityWatcher();
		const layoutShiftManager = initUnique(opts, LayoutShiftManager);
		const handleEntries = (entries) => {
			for (const entry of entries) layoutShiftManager._processEntry(entry);
			if (layoutShiftManager._sessionValue > metric.value) {
				metric.value = layoutShiftManager._sessionValue;
				metric.entries = layoutShiftManager._sessionEntries;
				report();
			}
		};
		const po = observe("layout-shift", handleEntries);
		if (po) {
			report = bindReporter(onReport, metric, CLSThresholds, opts.reportAllChanges);
			visibilityWatcher.onHidden(() => {
				handleEntries(po.takeRecords());
				report(true);
			});
			WINDOW$2?.setTimeout?.(report);
		}
	}));
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/polyfills/interactionCountPolyfill.js
var interactionCountEstimate = 0;
var minKnownInteractionId = Infinity;
var maxKnownInteractionId = 0;
var updateEstimate = (entries) => {
	entries.forEach((e) => {
		if (e.interactionId) {
			minKnownInteractionId = Math.min(minKnownInteractionId, e.interactionId);
			maxKnownInteractionId = Math.max(maxKnownInteractionId, e.interactionId);
			interactionCountEstimate = maxKnownInteractionId ? (maxKnownInteractionId - minKnownInteractionId) / 7 + 1 : 0;
		}
	});
};
var po;
var getInteractionCount = () => {
	return po ? interactionCountEstimate : performance.interactionCount || 0;
};
var initInteractionCountPolyfill = () => {
	if ("interactionCount" in performance || po) return;
	po = observe("event", updateEstimate, {
		type: "event",
		buffered: true,
		durationThreshold: 0
	});
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/InteractionManager.js
var MAX_INTERACTIONS_TO_CONSIDER = 10;
var prevInteractionCount = 0;
var getInteractionCountForNavigation = () => {
	return getInteractionCount() - prevInteractionCount;
};
var InteractionManager = class {
	constructor() {
		/**
		* A list of longest interactions on the page (by latency) sorted so the
		* longest one is first. The list is at most MAX_INTERACTIONS_TO_CONSIDER
		* long.
		*/
		this._longestInteractionList = [];
		/**
		* A mapping of longest interactions by their interaction ID.
		* This is used for faster lookup.
		*/
		this._longestInteractionMap = /* @__PURE__ */ new Map();
	}
	_resetInteractions() {
		prevInteractionCount = getInteractionCount();
		this._longestInteractionList.length = 0;
		this._longestInteractionMap.clear();
	}
	/**
	* Returns the estimated p98 longest interaction based on the stored
	* interaction candidates and the interaction count for the current page.
	*/
	_estimateP98LongestInteraction() {
		const candidateInteractionIndex = Math.min(this._longestInteractionList.length - 1, Math.floor(getInteractionCountForNavigation() / 50));
		return this._longestInteractionList[candidateInteractionIndex];
	}
	/**
	* Takes a performance entry and adds it to the list of worst interactions
	* if its duration is long enough to make it among the worst. If the
	* entry is part of an existing interaction, it is merged and the latency
	* and entries list is updated as needed.
	*/
	_processEntry(entry) {
		this._onBeforeProcessingEntry?.(entry);
		if (!(entry.interactionId || entry.entryType === "first-input")) return;
		const minLongestInteraction = this._longestInteractionList.at(-1);
		let interaction = this._longestInteractionMap.get(entry.interactionId);
		if (interaction || this._longestInteractionList.length < MAX_INTERACTIONS_TO_CONSIDER || entry.duration > minLongestInteraction._latency) {
			if (interaction) {
				if (entry.duration > interaction._latency) {
					interaction.entries = [entry];
					interaction._latency = entry.duration;
				} else if (entry.duration === interaction._latency && entry.startTime === interaction.entries[0].startTime) interaction.entries.push(entry);
			} else {
				interaction = {
					id: entry.interactionId,
					entries: [entry],
					_latency: entry.duration
				};
				this._longestInteractionMap.set(interaction.id, interaction);
				this._longestInteractionList.push(interaction);
			}
			this._longestInteractionList.sort((a, b) => b._latency - a._latency);
			if (this._longestInteractionList.length > MAX_INTERACTIONS_TO_CONSIDER) {
				const removedInteractions = this._longestInteractionList.splice(MAX_INTERACTIONS_TO_CONSIDER);
				for (const interaction2 of removedInteractions) this._longestInteractionMap.delete(interaction2.id);
			}
			this._onAfterProcessingINPCandidate?.(interaction);
		}
	}
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/whenIdleOrHidden.js
var whenIdleOrHidden = (cb) => {
	const rIC = WINDOW$2.requestIdleCallback || WINDOW$2.setTimeout;
	if (WINDOW$2.document?.visibilityState === "hidden") cb();
	else {
		cb = runOnce(cb);
		addPageListener("visibilitychange", cb, {
			once: true,
			capture: true
		});
		addPageListener("pagehide", cb, {
			once: true,
			capture: true
		});
		rIC(() => {
			cb();
			removePageListener("visibilitychange", cb, { capture: true });
			removePageListener("pagehide", cb, { capture: true });
		});
	}
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/getINP.js
var INPThresholds = [200, 500];
var DEFAULT_DURATION_THRESHOLD = 40;
var onINP = (onReport, opts = {}) => {
	if (!(globalThis.PerformanceEventTiming && "interactionId" in PerformanceEventTiming.prototype)) return;
	const visibilityWatcher = getVisibilityWatcher();
	whenActivated(() => {
		initInteractionCountPolyfill();
		const metric = initMetric("INP");
		let report;
		const interactionManager = initUnique(opts, InteractionManager);
		const handleEntries = (entries) => {
			whenIdleOrHidden(() => {
				for (const entry of entries) interactionManager._processEntry(entry);
				const inp = interactionManager._estimateP98LongestInteraction();
				if (inp && inp._latency !== metric.value) {
					metric.value = inp._latency;
					metric.entries = inp.entries;
					report();
				}
			});
		};
		const po = observe("event", handleEntries, { durationThreshold: opts.durationThreshold ?? DEFAULT_DURATION_THRESHOLD });
		report = bindReporter(onReport, metric, INPThresholds, opts.reportAllChanges);
		if (po) {
			po.observe({
				type: "first-input",
				buffered: true
			});
			visibilityWatcher.onHidden(() => {
				handleEntries(po.takeRecords());
				report(true);
			});
		}
	});
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/LCPEntryManager.js
var LCPEntryManager = class {
	_processEntry(entry) {
		this._onBeforeProcessingEntry?.(entry);
	}
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/getLCP.js
var LCPThresholds = [2500, 4e3];
var onLCP = (onReport, opts = {}) => {
	whenActivated(() => {
		const visibilityWatcher = getVisibilityWatcher();
		const metric = initMetric("LCP");
		let report;
		const lcpEntryManager = initUnique(opts, LCPEntryManager);
		const handleEntries = (entries) => {
			if (!opts.reportAllChanges) entries = entries.slice(-1);
			for (const entry of entries) {
				lcpEntryManager._processEntry(entry);
				if (entry.startTime < visibilityWatcher.firstHiddenTime) {
					metric.value = Math.max(entry.startTime - getActivationStart(), 0);
					metric.entries = [entry];
					report();
				}
			}
		};
		const po = observe("largest-contentful-paint", handleEntries);
		if (po) {
			report = bindReporter(onReport, metric, LCPThresholds, opts.reportAllChanges);
			const stopListening = runOnce(() => {
				handleEntries(po.takeRecords());
				po.disconnect();
				report(true);
			});
			const stopListeningWrapper = (event) => {
				if (event.isTrusted) {
					whenIdleOrHidden(stopListening);
					removePageListener(event.type, stopListeningWrapper, { capture: true });
				}
			};
			for (const type of [
				"keydown",
				"click",
				"visibilitychange"
			]) addPageListener(type, stopListeningWrapper, { capture: true });
		}
	});
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/onTTFB.js
var TTFBThresholds = [800, 1800];
var whenReady = (callback) => {
	if (WINDOW$2.document?.prerendering) whenActivated(() => whenReady(callback));
	else if (WINDOW$2.document?.readyState !== "complete") addEventListener("load", () => whenReady(callback), true);
	else setTimeout(callback);
};
var onTTFB = (onReport, opts = {}) => {
	const metric = initMetric("TTFB");
	const report = bindReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges);
	whenReady(() => {
		const navigationEntry = getNavigationEntry();
		if (navigationEntry) {
			metric.value = Math.max(navigationEntry.responseStart - getActivationStart(), 0);
			metric.entries = [navigationEntry];
			report(true);
		}
	});
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/instrument.js
var handlers = {};
var instrumented = {};
var _previousCls;
var _previousLcp;
var _previousTtfb;
var _previousInp;
function addClsInstrumentationHandler(callback, stopOnCallback = false) {
	return addMetricObserver("cls", callback, instrumentCls, _previousCls, stopOnCallback);
}
function addLcpInstrumentationHandler(callback, stopOnCallback = false) {
	return addMetricObserver("lcp", callback, instrumentLcp, _previousLcp, stopOnCallback);
}
function addTtfbInstrumentationHandler(callback) {
	return addMetricObserver("ttfb", callback, instrumentTtfb, _previousTtfb);
}
function addInpInstrumentationHandler(callback) {
	return addMetricObserver("inp", callback, instrumentInp, _previousInp);
}
function addPerformanceInstrumentationHandler(type, callback) {
	addHandler(type, callback);
	if (!instrumented[type]) {
		instrumentPerformanceObserver(type);
		instrumented[type] = true;
	}
	return getCleanupCallback(type, callback);
}
function triggerHandlers(type, data) {
	const typeHandlers = handlers[type];
	if (!typeHandlers?.length) return;
	for (const handler of typeHandlers) try {
		handler(data);
	} catch (e) {
		DEBUG_BUILD$1 && debug.error(`Error while triggering instrumentation handler.
Type: ${type}
Name: ${getFunctionName(handler)}
Error:`, e);
	}
}
function instrumentCls() {
	return onCLS((metric) => {
		triggerHandlers("cls", { metric });
		_previousCls = metric;
	}, { reportAllChanges: true });
}
function instrumentLcp() {
	return onLCP((metric) => {
		triggerHandlers("lcp", { metric });
		_previousLcp = metric;
	}, { reportAllChanges: true });
}
function instrumentTtfb() {
	return onTTFB((metric) => {
		triggerHandlers("ttfb", { metric });
		_previousTtfb = metric;
	});
}
function instrumentInp() {
	return onINP((metric) => {
		triggerHandlers("inp", { metric });
		_previousInp = metric;
	});
}
function addMetricObserver(type, callback, instrumentFn, previousValue, stopOnCallback = false) {
	addHandler(type, callback);
	let stopListening;
	if (!instrumented[type]) {
		stopListening = instrumentFn();
		instrumented[type] = true;
	}
	if (previousValue) callback({ metric: previousValue });
	return getCleanupCallback(type, callback, stopOnCallback ? stopListening : void 0);
}
function instrumentPerformanceObserver(type) {
	const options = {};
	if (type === "event") options.durationThreshold = 0;
	observe(type, (entries) => {
		triggerHandlers(type, { entries });
	}, options);
}
function addHandler(type, handler) {
	handlers[type] = handlers[type] || [];
	handlers[type].push(handler);
}
function getCleanupCallback(type, callback, stopListening) {
	return () => {
		if (stopListening) stopListening();
		const typeHandlers = handlers[type];
		if (!typeHandlers) return;
		const index = typeHandlers.indexOf(callback);
		if (index !== -1) typeHandlers.splice(index, 1);
	};
}
function isPerformanceEventTiming(entry) {
	return "duration" in entry;
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/htmlTreeAsString.js
var DEFAULT_MAX_STRING_LENGTH = 80;
var accessors = {};
try {
	if (typeof Node !== "undefined") accessors.parentNode = Object.getOwnPropertyDescriptor(Node.prototype, "parentNode").get;
	if (typeof Element !== "undefined") {
		accessors.tagName = Object.getOwnPropertyDescriptor(Element.prototype, "tagName").get;
		accessors.id = Object.getOwnPropertyDescriptor(Element.prototype, "id").get;
		accessors.className = Object.getOwnPropertyDescriptor(Element.prototype, "className").get;
		accessors.getAttribute = Element.prototype.getAttribute;
	}
	if (typeof HTMLElement !== "undefined") accessors.dataset = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "dataset").get;
} catch {}
function _safeRead(el, prop, arg) {
	const fn = accessors[prop];
	if (fn) try {
		return fn.call(el, arg);
	} catch {}
	const val = el[prop];
	return typeof val === "function" ? val.call(el, arg) : val;
}
function htmlTreeAsString(elem, options = {}) {
	if (!elem) return "<unknown>";
	try {
		let currentElem = elem;
		const MAX_TRAVERSE_HEIGHT = 5;
		const out = [];
		let height = 0;
		let len = 0;
		const separator = " > ";
		const sepLength = 3;
		let nextStr;
		const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
		const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
		while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
			nextStr = _htmlElementAsString(currentElem, keyAttrs);
			if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) break;
			out.push(nextStr);
			len += nextStr.length;
			currentElem = _safeRead(currentElem, "parentNode");
		}
		return out.reverse().join(separator);
	} catch {
		return "<unknown>";
	}
}
function _htmlElementAsString(el, keyAttrs) {
	const out = [];
	const tagName = _safeRead(el, "tagName");
	if (!tagName) return "";
	if (typeof HTMLElement !== "undefined") {
		if (el instanceof HTMLElement) {
			const dataset = _safeRead(el, "dataset");
			if (dataset) {
				if (dataset["sentryComponent"]) return dataset["sentryComponent"];
				if (dataset["sentryElement"]) return dataset["sentryElement"];
			}
		}
	}
	out.push(tagName.toLowerCase());
	const keyAttrPairs = keyAttrs?.length ? keyAttrs.filter((keyAttr) => _safeRead(el, "getAttribute", keyAttr)).map((keyAttr) => [keyAttr, _safeRead(el, "getAttribute", keyAttr)]) : null;
	if (keyAttrPairs?.length) keyAttrPairs.forEach((keyAttrPair) => {
		out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
	});
	else {
		const id = _safeRead(el, "id");
		if (id) out.push(`#${id}`);
		const className = _safeRead(el, "className");
		if (className && isString(className)) {
			const classes = className.split(/\s+/);
			for (const c of classes) out.push(`.${c}`);
		}
	}
	for (const k of [
		"aria-label",
		"type",
		"name",
		"title",
		"alt"
	]) {
		const attr = _safeRead(el, "getAttribute", k);
		if (attr) out.push(`[${k}="${attr}"]`);
	}
	return out.join("");
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/web-vitals/lib/onHidden.js
var onHidden = (cb) => {
	const onHiddenOrPageHide = (event) => {
		if (event.type === "pagehide" || WINDOW$2.document?.visibilityState === "hidden") cb(event);
	};
	addPageListener("visibilitychange", onHiddenOrPageHide, {
		capture: true,
		once: true
	});
	addPageListener("pagehide", onHiddenOrPageHide, {
		capture: true,
		once: true
	});
};
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/utils.js
function isMeasurementValue(value) {
	return typeof value === "number" && isFinite(value);
}
function startAndEndSpan(parentSpan, startTimeInSeconds, endTime, { ...ctx }) {
	const parentStartTime = spanToJSON(parentSpan).start_timestamp;
	if (parentStartTime && parentStartTime > startTimeInSeconds) {
		if (typeof parentSpan.updateStartTime === "function") parentSpan.updateStartTime(startTimeInSeconds);
	}
	return withActiveSpan(parentSpan, () => {
		const span = startInactiveSpan({
			startTime: startTimeInSeconds,
			...ctx
		});
		if (span) span.end(endTime);
		return span;
	});
}
function startStandaloneWebVitalSpan(options) {
	const client = getClient();
	if (!client) return;
	const { name, transaction, attributes: passedAttributes, startTime } = options;
	const { release, environment } = client.getOptions();
	const { userInfo } = client.getDataCollectionOptions();
	const replayId = client.getIntegrationByName("Replay")?.getReplayId();
	const scope = getCurrentScope();
	const user = scope.getUser();
	const userDisplay = user !== void 0 ? user.email || user.id || user.ip_address : void 0;
	let profileId;
	try {
		profileId = scope.getScopeData().contexts.profile.profile_id;
	} catch {}
	return startInactiveSpan({
		name,
		attributes: {
			release,
			environment,
			user: userDisplay || void 0,
			profile_id: profileId || void 0,
			replay_id: replayId || void 0,
			transaction,
			"user_agent.original": WINDOW$2.navigator?.userAgent,
			"client.address": userInfo ? "{{auto}}" : void 0,
			...passedAttributes
		},
		startTime,
		experimental: { standalone: true }
	});
}
function getBrowserPerformanceAPI() {
	return WINDOW$2.addEventListener && WINDOW$2.performance;
}
function msToSec(time) {
	return time / 1e3;
}
function extractNetworkProtocol(nextHopProtocol) {
	let name = "unknown";
	let version = "unknown";
	let _name = "";
	for (const char of nextHopProtocol) {
		if (char === "/") {
			[name, version] = nextHopProtocol.split("/");
			break;
		}
		if (!isNaN(Number(char))) {
			name = _name === "h" ? "http" : _name;
			version = nextHopProtocol.split(_name)[1];
			break;
		}
		_name += char;
	}
	if (_name === nextHopProtocol) name = _name;
	return {
		name,
		version
	};
}
function supportsWebVital(entryType) {
	try {
		return PerformanceObserver.supportedEntryTypes.includes(entryType);
	} catch {
		return false;
	}
}
function listenForWebVitalReportEvents(client, collectorCallback) {
	let pageloadSpan;
	let collected = false;
	function _runCollectorCallbackOnce(event) {
		if (!collected && pageloadSpan) collectorCallback(event, pageloadSpan.spanContext().spanId, pageloadSpan);
		collected = true;
	}
	onHidden(() => {
		_runCollectorCallbackOnce("pagehide");
	});
	const unsubscribeStartNavigation = client.on("beforeStartNavigationSpan", (_, options) => {
		if (!options?.isRedirect) {
			_runCollectorCallbackOnce("navigation");
			unsubscribeStartNavigation();
			unsubscribeAfterStartPageLoadSpan();
		}
	});
	const unsubscribeAfterStartPageLoadSpan = client.on("afterStartPageLoadSpan", (span) => {
		pageloadSpan = span;
		unsubscribeAfterStartPageLoadSpan();
	});
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/cls.js
function trackClsAsStandaloneSpan(client) {
	let standaloneCLsValue = 0;
	let standaloneClsEntry;
	if (!supportsWebVital("layout-shift")) return;
	const cleanupClsHandler = addClsInstrumentationHandler(({ metric }) => {
		const entry = metric.entries[metric.entries.length - 1];
		if (!entry) return;
		standaloneCLsValue = metric.value;
		standaloneClsEntry = entry;
	}, true);
	listenForWebVitalReportEvents(client, (reportEvent, pageloadSpanId) => {
		_sendStandaloneClsSpan(standaloneCLsValue, standaloneClsEntry, pageloadSpanId, reportEvent);
		cleanupClsHandler();
	});
}
function _sendStandaloneClsSpan(clsValue, entry, pageloadSpanId, reportEvent) {
	DEBUG_BUILD$1 && debug.log(`Sending CLS span (${clsValue})`);
	const startTime = entry ? msToSec((browserPerformanceTimeOrigin() || 0) + entry.startTime) : timestampInSeconds();
	const routeName = getCurrentScope().getScopeData().transactionName;
	const name = entry ? htmlTreeAsString(entry.sources[0]?.node) : "Layout shift";
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser.cls",
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "ui.webvital.cls",
		[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: 0,
		"sentry.pageload.span_id": pageloadSpanId,
		"sentry.report_event": reportEvent
	};
	if (entry?.sources) entry.sources.forEach((source, index) => {
		attributes[`cls.source.${index + 1}`] = htmlTreeAsString(source.node);
	});
	const span = startStandaloneWebVitalSpan({
		name,
		transaction: routeName,
		attributes,
		startTime
	});
	if (span) {
		span.addEvent("cls", {
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: "",
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: clsValue
		});
		span.end(startTime);
	}
}
function isValidLcpMetric(lcpValue) {
	return lcpValue != null && lcpValue > 0 && lcpValue <= 6e4;
}
function trackLcpAsStandaloneSpan(client) {
	let standaloneLcpValue = 0;
	let standaloneLcpEntry;
	if (!supportsWebVital("largest-contentful-paint")) return;
	const cleanupLcpHandler = addLcpInstrumentationHandler(({ metric }) => {
		const entry = metric.entries[metric.entries.length - 1];
		if (!entry || !isValidLcpMetric(metric.value)) return;
		standaloneLcpValue = metric.value;
		standaloneLcpEntry = entry;
	}, true);
	listenForWebVitalReportEvents(client, (reportEvent, pageloadSpanId) => {
		_sendStandaloneLcpSpan(standaloneLcpValue, standaloneLcpEntry, pageloadSpanId, reportEvent);
		cleanupLcpHandler();
	});
}
function _sendStandaloneLcpSpan(lcpValue, entry, pageloadSpanId, reportEvent) {
	if (!isValidLcpMetric(lcpValue)) return;
	DEBUG_BUILD$1 && debug.log(`Sending LCP span (${lcpValue})`);
	const startTime = msToSec((browserPerformanceTimeOrigin() || 0) + (entry?.startTime || 0));
	const routeName = getCurrentScope().getScopeData().transactionName;
	const name = entry ? htmlTreeAsString(entry.element) : "Largest contentful paint";
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser.lcp",
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "ui.webvital.lcp",
		[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: 0,
		"sentry.pageload.span_id": pageloadSpanId,
		"sentry.report_event": reportEvent
	};
	if (entry) {
		entry.element && (attributes["lcp.element"] = htmlTreeAsString(entry.element));
		entry.id && (attributes["lcp.id"] = entry.id);
		entry.url && (attributes["lcp.url"] = entry.url);
		entry.loadTime != null && (attributes["lcp.loadTime"] = entry.loadTime);
		entry.renderTime != null && (attributes["lcp.renderTime"] = entry.renderTime);
		entry.size != null && (attributes["lcp.size"] = entry.size);
	}
	const span = startStandaloneWebVitalSpan({
		name,
		transaction: routeName,
		attributes,
		startTime
	});
	if (span) {
		span.addEvent("lcp", {
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: "millisecond",
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: lcpValue
		});
		span.end(startTime);
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/resourceTiming.js
function getAbsoluteTime(time) {
	return time ? ((browserPerformanceTimeOrigin() || performance.timeOrigin) + time) / 1e3 : time;
}
function resourceTimingToSpanAttributes(resourceTiming) {
	const timingSpanData = {};
	if (resourceTiming.nextHopProtocol != void 0) {
		const { name, version } = extractNetworkProtocol(resourceTiming.nextHopProtocol);
		timingSpanData["network.protocol.version"] = version;
		timingSpanData["network.protocol.name"] = name;
	}
	if (!(browserPerformanceTimeOrigin() || getBrowserPerformanceAPI()?.timeOrigin)) return timingSpanData;
	return dropUndefinedKeysFromObject({
		...timingSpanData,
		"http.request.redirect_start": getAbsoluteTime(resourceTiming.redirectStart),
		"http.request.redirect_end": getAbsoluteTime(resourceTiming.redirectEnd),
		"http.request.worker_start": getAbsoluteTime(resourceTiming.workerStart),
		"http.request.fetch_start": getAbsoluteTime(resourceTiming.fetchStart),
		"http.request.domain_lookup_start": getAbsoluteTime(resourceTiming.domainLookupStart),
		"http.request.domain_lookup_end": getAbsoluteTime(resourceTiming.domainLookupEnd),
		"http.request.connect_start": getAbsoluteTime(resourceTiming.connectStart),
		"http.request.secure_connection_start": getAbsoluteTime(resourceTiming.secureConnectionStart),
		"http.request.connection_end": getAbsoluteTime(resourceTiming.connectEnd),
		"http.request.request_start": getAbsoluteTime(resourceTiming.requestStart),
		"http.request.response_start": getAbsoluteTime(resourceTiming.responseStart),
		"http.request.response_end": getAbsoluteTime(resourceTiming.responseEnd),
		"http.request.time_to_first_byte": resourceTiming.responseStart != null ? resourceTiming.responseStart / 1e3 : void 0
	});
}
function dropUndefinedKeysFromObject(attrs) {
	return Object.fromEntries(Object.entries(attrs).filter(([, value]) => value != null));
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/browserMetrics.js
var MAX_INT_AS_BYTES = 2147483647;
var _performanceCursor = 0;
var _measurements = {};
var _lcpEntry;
var _clsEntry;
function startTrackingWebVitals({ recordClsStandaloneSpans, recordLcpStandaloneSpans, client }) {
	const performance = getBrowserPerformanceAPI();
	if (performance && browserPerformanceTimeOrigin()) {
		if (performance.mark) WINDOW$2.performance.mark("sentry-tracing-init");
		const lcpCleanupCallback = recordLcpStandaloneSpans ? trackLcpAsStandaloneSpan(client) : recordLcpStandaloneSpans === false ? _trackLCP() : void 0;
		const clsCleanupCallback = recordClsStandaloneSpans ? trackClsAsStandaloneSpan(client) : recordClsStandaloneSpans === false ? _trackCLS() : void 0;
		const ttfbCleanupCallback = _trackTtfb();
		const fpFcpCleanupCallback = _trackFpFcp();
		return () => {
			ttfbCleanupCallback();
			fpFcpCleanupCallback();
			lcpCleanupCallback?.();
			clsCleanupCallback?.();
		};
	}
	return () => void 0;
}
function startTrackingLongTasks() {
	addPerformanceInstrumentationHandler("longtask", ({ entries }) => {
		const parent = getActiveSpan();
		if (!parent) return;
		const { op: parentOp, start_timestamp: parentStartTimestamp } = spanToJSON(parent);
		for (const entry of entries) {
			const startTime = msToSec(browserPerformanceTimeOrigin() + entry.startTime);
			const duration = msToSec(entry.duration);
			if (parentOp === "navigation" && parentStartTimestamp && startTime < parentStartTimestamp) continue;
			startAndEndSpan(parent, startTime, startTime + duration, {
				name: "Main UI thread blocked",
				op: "ui.long-task",
				attributes: { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics" }
			});
		}
	});
}
function startTrackingLongAnimationFrames() {
	new PerformanceObserver((list) => {
		const parent = getActiveSpan();
		if (!parent) return;
		for (const entry of list.getEntries()) {
			if (!entry.scripts[0]) continue;
			const startTime = msToSec(browserPerformanceTimeOrigin() + entry.startTime);
			const { start_timestamp: parentStartTimestamp, op: parentOp } = spanToJSON(parent);
			if (parentOp === "navigation" && parentStartTimestamp && startTime < parentStartTimestamp) continue;
			const duration = msToSec(entry.duration);
			const attributes = { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics" };
			const { invoker, invokerType, sourceURL, sourceFunctionName, sourceCharPosition } = entry.scripts[0];
			attributes["browser.script.invoker"] = invoker;
			attributes["browser.script.invoker_type"] = invokerType;
			if (sourceURL) attributes["code.filepath"] = sourceURL;
			if (sourceFunctionName) attributes["code.function"] = sourceFunctionName;
			if (sourceCharPosition !== -1) attributes["browser.script.source_char_position"] = sourceCharPosition;
			startAndEndSpan(parent, startTime, startTime + duration, {
				name: "Main UI thread blocked",
				op: "ui.long-animation-frame",
				attributes
			});
		}
	}).observe({
		type: "long-animation-frame",
		buffered: true
	});
}
function startTrackingInteractions() {
	addPerformanceInstrumentationHandler("event", ({ entries }) => {
		const parent = getActiveSpan();
		if (!parent) return;
		for (const entry of entries) if (entry.name === "click") {
			const startTime = msToSec(browserPerformanceTimeOrigin() + entry.startTime);
			const duration = msToSec(entry.duration);
			const spanOptions = {
				name: htmlTreeAsString(entry.target),
				op: `ui.interaction.${entry.name}`,
				startTime,
				attributes: { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics" }
			};
			const componentName = getComponentName(entry.target);
			if (componentName) spanOptions.attributes["ui.component_name"] = componentName;
			startAndEndSpan(parent, startTime, startTime + duration, spanOptions);
		}
	});
}
function _trackCLS() {
	return addClsInstrumentationHandler(({ metric }) => {
		const entry = metric.entries[metric.entries.length - 1];
		if (!entry) return;
		_measurements["cls"] = {
			value: metric.value,
			unit: ""
		};
		_clsEntry = entry;
	}, true);
}
function _trackLCP() {
	return addLcpInstrumentationHandler(({ metric }) => {
		const entry = metric.entries[metric.entries.length - 1];
		if (!entry || !isValidLcpMetric(metric.value)) return;
		_measurements["lcp"] = {
			value: metric.value,
			unit: "millisecond"
		};
		_lcpEntry = entry;
	}, true);
}
function _trackTtfb() {
	return addTtfbInstrumentationHandler(({ metric }) => {
		if (!metric.entries[metric.entries.length - 1]) return;
		_measurements["ttfb"] = {
			value: metric.value,
			unit: "millisecond"
		};
	});
}
function _trackFpFcp() {
	return addPerformanceInstrumentationHandler("paint", ({ entries }) => {
		const firstHidden = getVisibilityWatcher();
		for (const entry of entries) {
			const shouldRecord = entry.startTime < firstHidden.firstHiddenTime;
			if (entry.name === "first-paint" && shouldRecord) _measurements["fp"] = {
				value: entry.startTime,
				unit: "millisecond"
			};
			if (entry.name === "first-contentful-paint" && shouldRecord) _measurements["fcp"] = {
				value: entry.startTime,
				unit: "millisecond"
			};
		}
	});
}
function addPerformanceEntries(span, options) {
	const performance = getBrowserPerformanceAPI();
	const origin = browserPerformanceTimeOrigin();
	if (!performance?.getEntries || !origin) return;
	const { spanStreamingEnabled, ignorePerformanceApiSpans, ignoreResourceSpans } = options;
	const timeOrigin = msToSec(origin);
	const performanceEntries = performance.getEntries();
	const { op, start_timestamp: transactionStartTime } = spanToJSON(span);
	performanceEntries.slice(_performanceCursor).forEach((entry) => {
		const startTime = msToSec(entry.startTime);
		const duration = msToSec(Math.max(0, entry.duration));
		if (op === "navigation" && transactionStartTime && timeOrigin + startTime < transactionStartTime) return;
		switch (entry.entryType) {
			case "navigation":
				_addNavigationSpans(span, entry, timeOrigin);
				break;
			case "mark":
			case "paint":
			case "measure":
				_addMeasureSpans(span, entry, startTime, duration, timeOrigin, ignorePerformanceApiSpans);
				break;
			case "resource":
				_addResourceSpans(span, entry, entry.name, startTime, duration, timeOrigin, ignoreResourceSpans);
				break;
		}
	});
	_performanceCursor = Math.max(performanceEntries.length - 1, 0);
	_trackNavigator(span, spanStreamingEnabled);
}
function addWebVitalsToSpan(span, options) {
	const origin = browserPerformanceTimeOrigin();
	if (!getBrowserPerformanceAPI()?.getEntries || !origin) {
		resetWebVitalState();
		return;
	}
	const { spanStreamingEnabled, recordClsOnPageloadSpan, recordLcpOnPageloadSpan } = options;
	const timeOrigin = msToSec(origin);
	if (spanToJSON(span).op === "pageload") {
		_addTtfbRequestTimeToMeasurements(_measurements);
		if (spanStreamingEnabled) {
			const setAttr = (shortWebVitalName, value, customAttrName) => {
				const attrKey = customAttrName ?? `browser.web_vital.${shortWebVitalName}.value`;
				span.setAttribute(attrKey, value);
				DEBUG_BUILD$1 && debug.log("Setting web vital attribute", { [attrKey]: value }, "on pageload span");
			};
			[
				"ttfb",
				"fp",
				"fcp"
			].forEach((measurementName) => {
				if (_measurements[measurementName]) setAttr(measurementName, _measurements[measurementName].value);
			});
			if (_measurements["ttfb.requestTime"]) setAttr("ttfb.requestTime", _measurements["ttfb.requestTime"].value, "browser.web_vital.ttfb.request_time");
		} else {
			if (!recordClsOnPageloadSpan) delete _measurements.cls;
			if (!recordLcpOnPageloadSpan) delete _measurements.lcp;
			Object.entries(_measurements).forEach(([measurementName, measurement]) => {
				setMeasurement(measurementName, measurement.value, measurement.unit, span);
			});
			_setWebVitalAttributes(span, options);
		}
		span.setAttribute(spanStreamingEnabled ? "browser.performance.time_origin" : "performance.timeOrigin", timeOrigin);
		span.setAttribute(spanStreamingEnabled ? "browser.performance.navigation.activation_start" : "performance.activationStart", getActivationStart());
	}
	resetWebVitalState();
}
function resetWebVitalState() {
	_lcpEntry = void 0;
	_clsEntry = void 0;
	_measurements = {};
}
function isReact19MeasureEntry(entry) {
	if (entry?.entryType !== "measure") return;
	try {
		return entry.detail.devtools.track === "Components ⚛";
	} catch {
		return;
	}
}
function _addMeasureSpans(span, entry, startTime, duration, timeOrigin, ignorePerformanceApiSpans) {
	if (isReact19MeasureEntry(entry)) return;
	if (["mark", "measure"].includes(entry.entryType) && stringMatchesSomePattern(entry.name, ignorePerformanceApiSpans)) return;
	const navEntry = getNavigationEntry(false);
	const requestTime = msToSec(navEntry ? navEntry.requestStart : 0);
	const measureStartTimestamp = timeOrigin + Math.max(startTime, requestTime);
	const startTimeStamp = timeOrigin + startTime;
	const measureEndTimestamp = startTimeStamp + duration;
	const attributes = { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.resource.browser.metrics" };
	if (measureStartTimestamp !== startTimeStamp) {
		attributes["sentry.browser.measure_happened_before_request"] = true;
		attributes["sentry.browser.measure_start_time"] = measureStartTimestamp;
	}
	_addDetailToSpanAttributes(attributes, entry);
	if (measureStartTimestamp <= measureEndTimestamp) startAndEndSpan(span, measureStartTimestamp, measureEndTimestamp, {
		name: entry.name,
		op: entry.entryType,
		attributes
	});
}
function _addDetailToSpanAttributes(attributes, performanceMeasure) {
	try {
		const detail = performanceMeasure.detail;
		if (!detail) return;
		if (typeof detail === "object") {
			for (const [key, value] of Object.entries(detail)) if (value && isPrimitive(value)) attributes[`sentry.browser.measure.detail.${key}`] = value;
			else if (value !== void 0) try {
				attributes[`sentry.browser.measure.detail.${key}`] = JSON.stringify(value);
			} catch {}
			return;
		}
		if (isPrimitive(detail)) {
			attributes["sentry.browser.measure.detail"] = detail;
			return;
		}
		try {
			attributes["sentry.browser.measure.detail"] = JSON.stringify(detail);
		} catch {}
	} catch {}
}
function _addNavigationSpans(span, entry, timeOrigin) {
	[
		"unloadEvent",
		"redirect",
		"domContentLoadedEvent",
		"loadEvent",
		"connect"
	].forEach((event) => {
		_addPerformanceNavigationTiming(span, entry, event, timeOrigin);
	});
	_addPerformanceNavigationTiming(span, entry, "secureConnection", timeOrigin, "TLS/SSL");
	_addPerformanceNavigationTiming(span, entry, "fetch", timeOrigin, "cache");
	_addPerformanceNavigationTiming(span, entry, "domainLookup", timeOrigin, "DNS");
	_addRequest(span, entry, timeOrigin);
}
function _addPerformanceNavigationTiming(span, entry, event, timeOrigin, name = event) {
	const end = entry[_getEndPropertyNameForNavigationTiming(event)];
	const start = entry[`${event}Start`];
	if (!start || !end) return;
	startAndEndSpan(span, timeOrigin + msToSec(start), timeOrigin + msToSec(end), {
		op: `browser.${name}`,
		name: entry.name,
		attributes: {
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics",
			...event === "redirect" && entry.redirectCount != null ? { "http.redirect_count": entry.redirectCount } : {}
		}
	});
}
function _getEndPropertyNameForNavigationTiming(event) {
	if (event === "secureConnection") return "connectEnd";
	if (event === "fetch") return "domainLookupStart";
	return `${event}End`;
}
function _addRequest(span, entry, timeOrigin) {
	const requestStartTimestamp = timeOrigin + msToSec(entry.requestStart);
	const responseEndTimestamp = timeOrigin + msToSec(entry.responseEnd);
	const responseStartTimestamp = timeOrigin + msToSec(entry.responseStart);
	if (entry.responseEnd) {
		startAndEndSpan(span, requestStartTimestamp, responseEndTimestamp, {
			op: "browser.request",
			name: entry.name,
			attributes: { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics" }
		});
		startAndEndSpan(span, responseStartTimestamp, responseEndTimestamp, {
			op: "browser.response",
			name: entry.name,
			attributes: { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ui.browser.metrics" }
		});
	}
}
function _addResourceSpans(span, entry, resourceUrl, startTime, duration, timeOrigin, ignoredResourceSpanOps) {
	if (entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "fetch") return;
	const op = entry.initiatorType ? `resource.${entry.initiatorType}` : "resource.other";
	if (ignoredResourceSpanOps?.includes(op)) return;
	const attributes = { [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.resource.browser.metrics" };
	const parsedUrl = parseUrl(resourceUrl);
	if (parsedUrl.protocol) attributes["url.scheme"] = parsedUrl.protocol.split(":").pop();
	if (parsedUrl.host) attributes["server.address"] = parsedUrl.host;
	attributes["url.same_origin"] = resourceUrl.includes(WINDOW$2.location.origin);
	attributes[SEMANTIC_ATTRIBUTE_URL_FULL] = resourceUrl;
	_setResourceRequestAttributes(entry, attributes, [
		["responseStatus", "http.response.status_code"],
		["transferSize", "http.response_transfer_size"],
		["encodedBodySize", "http.response_content_length"],
		["decodedBodySize", "http.decoded_response_content_length"],
		["renderBlockingStatus", "resource.render_blocking_status"],
		["deliveryType", "http.response_delivery_type"]
	]);
	const attributesWithResourceTiming = {
		...attributes,
		...resourceTimingToSpanAttributes(entry)
	};
	const startTimestamp = timeOrigin + startTime;
	startAndEndSpan(span, startTimestamp, startTimestamp + duration, {
		name: resourceUrl.replace(WINDOW$2.location.origin, ""),
		op,
		attributes: attributesWithResourceTiming
	});
}
function _trackNavigator(span, spanStreamingEnabled) {
	const navigator = WINDOW$2.navigator;
	if (!navigator) return;
	const connection = navigator.connection;
	if (connection) {
		if (connection.effectiveType) span.setAttribute(spanStreamingEnabled ? "network.connection.effective_type" : "effectiveConnectionType", connection.effectiveType);
		if (connection.type) span.setAttribute(spanStreamingEnabled ? "network.connection.type" : "connectionType", connection.type);
		if (isMeasurementValue(connection.rtt)) {
			if (spanStreamingEnabled) span.setAttribute("network.connection.rtt", connection.rtt);
			else if (spanToJSON(span).op === "pageload") setMeasurement("connection.rtt", connection.rtt, "millisecond");
		}
	}
	if (isMeasurementValue(navigator.deviceMemory)) if (spanStreamingEnabled) span.setAttribute("device.memory.estimated_capacity", navigator.deviceMemory);
	else span.setAttribute("deviceMemory", `${navigator.deviceMemory} GB`);
	if (isMeasurementValue(navigator.hardwareConcurrency)) if (spanStreamingEnabled) span.setAttribute("device.processor_count", navigator.hardwareConcurrency);
	else span.setAttribute("hardwareConcurrency", String(navigator.hardwareConcurrency));
}
function _setWebVitalAttributes(span, options) {
	if (_lcpEntry && options.recordLcpOnPageloadSpan) {
		if (_lcpEntry.element) span.setAttribute("lcp.element", htmlTreeAsString(_lcpEntry.element));
		if (_lcpEntry.id) span.setAttribute("lcp.id", _lcpEntry.id);
		if (_lcpEntry.url) span.setAttribute("lcp.url", _lcpEntry.url.trim().slice(0, 200));
		if (_lcpEntry.loadTime != null) span.setAttribute("lcp.loadTime", _lcpEntry.loadTime);
		if (_lcpEntry.renderTime != null) span.setAttribute("lcp.renderTime", _lcpEntry.renderTime);
		span.setAttribute("lcp.size", _lcpEntry.size);
	}
	if (_clsEntry?.sources && options.recordClsOnPageloadSpan) _clsEntry.sources.forEach((source, index) => span.setAttribute(`cls.source.${index + 1}`, htmlTreeAsString(source.node)));
}
function _setResourceRequestAttributes(entry, attributes, properties) {
	properties.forEach(([entryKey, attributeKey]) => {
		const entryVal = entry[entryKey];
		if (entryVal != null && (typeof entryVal === "number" && entryVal < MAX_INT_AS_BYTES || typeof entryVal === "string")) attributes[attributeKey] = entryVal;
	});
}
function _addTtfbRequestTimeToMeasurements(_measurements2) {
	const navEntry = getNavigationEntry(false);
	if (!navEntry) return;
	const { responseStart, requestStart } = navEntry;
	if (requestStart <= responseStart) _measurements2["ttfb.requestTime"] = {
		value: responseStart - requestStart,
		unit: "millisecond"
	};
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/inp.js
var LAST_INTERACTIONS = [];
var INTERACTIONS_SPAN_MAP = /* @__PURE__ */ new Map();
var ELEMENT_NAME_TIMESTAMP_MAP = /* @__PURE__ */ new Map();
function startTrackingINP() {
	if (getBrowserPerformanceAPI() && browserPerformanceTimeOrigin()) {
		const inpCallback = _trackINP();
		return () => {
			inpCallback();
		};
	}
	return () => void 0;
}
var INP_ENTRY_MAP = {
	click: "click",
	pointerdown: "click",
	pointerup: "click",
	mousedown: "click",
	mouseup: "click",
	touchstart: "click",
	touchend: "click",
	mouseover: "hover",
	mouseout: "hover",
	mouseenter: "hover",
	mouseleave: "hover",
	pointerover: "hover",
	pointerout: "hover",
	pointerenter: "hover",
	pointerleave: "hover",
	dragstart: "drag",
	dragend: "drag",
	drag: "drag",
	dragenter: "drag",
	dragleave: "drag",
	dragover: "drag",
	drop: "drag",
	keydown: "press",
	keyup: "press",
	keypress: "press",
	input: "press"
};
function _trackINP() {
	return addInpInstrumentationHandler(_onInp);
}
var _onInp = ({ metric }) => {
	if (metric.value == void 0) return;
	const duration = msToSec(metric.value);
	if (duration > 60) return;
	const entry = metric.entries.find((entry2) => entry2.duration === metric.value && INP_ENTRY_MAP[entry2.name]);
	if (!entry) return;
	const { interactionId } = entry;
	const interactionType = INP_ENTRY_MAP[entry.name];
	const startTime = msToSec(browserPerformanceTimeOrigin() + entry.startTime);
	const activeSpan = getActiveSpan();
	const rootSpan = activeSpan ? getRootSpan(activeSpan) : void 0;
	const cachedInteractionContext = interactionId != null ? INTERACTIONS_SPAN_MAP.get(interactionId) : void 0;
	const spanToUse = cachedInteractionContext?.span || rootSpan;
	const routeName = spanToUse ? spanToJSON(spanToUse).description : getCurrentScope().getScopeData().transactionName;
	const span = startStandaloneWebVitalSpan({
		name: cachedInteractionContext?.elementName || htmlTreeAsString(entry.target),
		transaction: routeName,
		attributes: {
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser.inp",
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: `ui.interaction.${interactionType}`,
			[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: entry.duration
		},
		startTime
	});
	if (span) {
		span.addEvent("inp", {
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT]: "millisecond",
			[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE]: metric.value
		});
		span.end(startTime + duration);
	}
};
function getCachedInteractionContext(interactionId) {
	return interactionId != null ? INTERACTIONS_SPAN_MAP.get(interactionId) : void 0;
}
function registerInpInteractionListener() {
	const interactionEvents = Object.keys(INP_ENTRY_MAP);
	if (isBrowser()) interactionEvents.forEach((eventType) => {
		WINDOW$2.addEventListener(eventType, captureElementFromEvent, {
			capture: true,
			passive: true
		});
	});
	function captureElementFromEvent(event) {
		const target = event.target;
		if (!target) return;
		const elementName = htmlTreeAsString(target);
		const timestamp = Math.round(event.timeStamp);
		ELEMENT_NAME_TIMESTAMP_MAP.set(timestamp, elementName);
		if (ELEMENT_NAME_TIMESTAMP_MAP.size > 50) {
			const firstKey = ELEMENT_NAME_TIMESTAMP_MAP.keys().next().value;
			if (firstKey !== void 0) ELEMENT_NAME_TIMESTAMP_MAP.delete(firstKey);
		}
	}
	function resolveElementNameFromEntry(entry) {
		const timestamp = Math.round(entry.startTime);
		let elementName = ELEMENT_NAME_TIMESTAMP_MAP.get(timestamp);
		if (!elementName) for (let offset = -5; offset <= 5; offset++) {
			const nearbyName = ELEMENT_NAME_TIMESTAMP_MAP.get(timestamp + offset);
			if (nearbyName) {
				elementName = nearbyName;
				break;
			}
		}
		return elementName || "<unknown>";
	}
	const handleEntries = ({ entries }) => {
		const activeSpan = getActiveSpan();
		const activeRootSpan = activeSpan && getRootSpan(activeSpan);
		entries.forEach((entry) => {
			if (!isPerformanceEventTiming(entry)) return;
			const interactionId = entry.interactionId;
			if (interactionId == null) return;
			if (INTERACTIONS_SPAN_MAP.has(interactionId)) return;
			const elementName = entry.target ? htmlTreeAsString(entry.target) : resolveElementNameFromEntry(entry);
			if (LAST_INTERACTIONS.length > 10) {
				const last = LAST_INTERACTIONS.shift();
				INTERACTIONS_SPAN_MAP.delete(last);
			}
			LAST_INTERACTIONS.push(interactionId);
			INTERACTIONS_SPAN_MAP.set(interactionId, {
				span: activeRootSpan,
				elementName
			});
		});
	};
	addPerformanceInstrumentationHandler("event", handleEntries);
	addPerformanceInstrumentationHandler("first-input", handleEntries);
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/webVitalSpans.js
function _emitWebVitalSpan(options) {
	const { name, op, origin, metricName, value, attributes: passedAttributes, parentSpan, reportEvent, startTime, endTime } = options;
	const routeName = getCurrentScope().getScopeData().transactionName;
	const attributes = {
		[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: origin,
		[SEMANTIC_ATTRIBUTE_SENTRY_OP]: op,
		[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: 0,
		[`browser.web_vital.${metricName}.value`]: value,
		[Xc]: routeName,
		[Lc]: routeName,
		"user_agent.original": WINDOW$2.navigator?.userAgent,
		...passedAttributes
	};
	if (parentSpan && spanToStreamedSpanJSON(parentSpan).attributes?.["sentry.op"] === "pageload") attributes["sentry.pageload.span_id"] = parentSpan.spanContext().spanId;
	if (reportEvent) attributes[`browser.web_vital.${metricName}.report_event`] = reportEvent;
	const span = startInactiveSpan({
		name,
		attributes,
		startTime,
		parentSpan
	});
	if (span) span.end(endTime ?? startTime);
}
function trackLcpAsSpan(client) {
	let lcpValue = 0;
	let lcpEntry;
	if (!supportsWebVital("largest-contentful-paint")) return;
	const cleanupLcpHandler = addLcpInstrumentationHandler(({ metric }) => {
		const entry = metric.entries[metric.entries.length - 1];
		if (!entry || !isValidLcpMetric(metric.value)) return;
		lcpValue = metric.value;
		lcpEntry = entry;
	}, true);
	listenForWebVitalReportEvents(client, (reportEvent, _, pageloadSpan) => {
		_sendLcpSpan(lcpValue, lcpEntry, pageloadSpan, reportEvent);
		cleanupLcpHandler();
	});
}
function _sendLcpSpan(lcpValue, entry, pageloadSpan, reportEvent) {
	if (!isValidLcpMetric(lcpValue)) return;
	DEBUG_BUILD$1 && debug.log(`Sending LCP span (${lcpValue})`);
	const performanceTimeOrigin = browserPerformanceTimeOrigin() || 0;
	const timeOrigin = msToSec(performanceTimeOrigin);
	const endTime = msToSec(performanceTimeOrigin + (entry?.startTime || 0));
	const name = entry ? htmlTreeAsString(entry.element) : "Largest contentful paint";
	const attributes = {};
	entry?.element && (attributes["browser.web_vital.lcp.element"] = htmlTreeAsString(entry.element));
	entry?.id && (attributes["browser.web_vital.lcp.id"] = entry.id);
	entry?.url && (attributes["browser.web_vital.lcp.url"] = entry.url);
	entry?.loadTime != null && (attributes["browser.web_vital.lcp.load_time"] = entry.loadTime);
	entry?.renderTime != null && (attributes["browser.web_vital.lcp.render_time"] = entry.renderTime);
	entry?.size != null && (attributes["browser.web_vital.lcp.size"] = entry.size);
	_emitWebVitalSpan({
		name,
		op: "ui.webvital.lcp",
		origin: "auto.http.browser.lcp",
		metricName: "lcp",
		value: lcpValue,
		attributes,
		parentSpan: pageloadSpan,
		reportEvent,
		startTime: timeOrigin,
		endTime
	});
}
function trackClsAsSpan(client) {
	let clsValue = 0;
	let clsEntry;
	if (!supportsWebVital("layout-shift")) return;
	const cleanupClsHandler = addClsInstrumentationHandler(({ metric }) => {
		const entry = metric.entries[metric.entries.length - 1];
		if (!entry) return;
		clsValue = metric.value;
		clsEntry = entry;
	}, true);
	listenForWebVitalReportEvents(client, (reportEvent, _, pageloadSpan) => {
		_sendClsSpan(clsValue, clsEntry, pageloadSpan, reportEvent);
		cleanupClsHandler();
	});
}
function _sendClsSpan(clsValue, entry, pageloadSpan, reportEvent) {
	DEBUG_BUILD$1 && debug.log(`Sending CLS span (${clsValue})`);
	const startTime = entry ? msToSec((browserPerformanceTimeOrigin() || 0) + entry.startTime) : timestampInSeconds();
	const name = entry ? htmlTreeAsString(entry.sources[0]?.node) : "Layout shift";
	const attributes = {};
	if (entry?.sources) entry.sources.forEach((source, index) => {
		attributes[`browser.web_vital.cls.source.${index + 1}`] = htmlTreeAsString(source.node);
	});
	_emitWebVitalSpan({
		name,
		op: "ui.webvital.cls",
		origin: "auto.http.browser.cls",
		metricName: "cls",
		value: clsValue,
		attributes,
		parentSpan: pageloadSpan,
		reportEvent,
		startTime
	});
}
function trackInpAsSpan() {
	if (!getBrowserPerformanceAPI() || !browserPerformanceTimeOrigin()) return;
	const onInp = ({ metric }) => {
		if (metric.value == null) return;
		if (msToSec(metric.value) > 60) return;
		const entry = metric.entries.find((e) => e.duration === metric.value && INP_ENTRY_MAP[e.name]);
		if (!entry) return;
		_sendInpSpan(metric.value, entry);
	};
	addInpInstrumentationHandler(onInp);
}
function _sendInpSpan(inpValue, entry) {
	DEBUG_BUILD$1 && debug.log(`Sending INP span (${inpValue})`);
	const startTime = msToSec(browserPerformanceTimeOrigin() + entry.startTime);
	const duration = msToSec(inpValue);
	const interactionType = INP_ENTRY_MAP[entry.name];
	const cachedContext = getCachedInteractionContext(entry.interactionId);
	const activeSpan = getActiveSpan();
	const rootSpan = activeSpan ? getRootSpan(activeSpan) : void 0;
	const spanToUse = cachedContext?.span || rootSpan;
	const routeName = spanToUse ? spanToStreamedSpanJSON(spanToUse).name : getCurrentScope().getScopeData().transactionName;
	_emitWebVitalSpan({
		name: cachedContext?.elementName || htmlTreeAsString(entry.target),
		op: `ui.interaction.${interactionType}`,
		origin: "auto.http.browser.inp",
		metricName: "inp",
		value: inpValue,
		attributes: {
			[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: entry.duration,
			[Xc]: routeName,
			[Lc]: routeName
		},
		startTime,
		endTime: startTime + duration,
		parentSpan: spanToUse
	});
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrument/dom.js
var DEBOUNCE_DURATION = 1e3;
var debounceTimerID;
var lastCapturedEventType;
var lastCapturedEventTargetId;
function addClickKeypressInstrumentationHandler(handler) {
	const type = "dom";
	addHandler$1(type, handler);
	maybeInstrument(type, instrumentDOM);
}
function instrumentDOM() {
	if (!WINDOW$2.document) return;
	const triggerDOMHandler = triggerHandlers$1.bind(null, "dom");
	const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
	WINDOW$2.document.addEventListener("click", globalDOMEventHandler, false);
	WINDOW$2.document.addEventListener("keypress", globalDOMEventHandler, false);
	["EventTarget", "Node"].forEach((target) => {
		const proto = WINDOW$2[target]?.prototype;
		if (!proto?.hasOwnProperty?.("addEventListener")) return;
		fill(proto, "addEventListener", function(originalAddEventListener) {
			return function(type, listener, options) {
				if (type === "click" || type == "keypress") try {
					const handlers = this.__sentry_instrumentation_handlers__ = this.__sentry_instrumentation_handlers__ || {};
					const handlerForType = handlers[type] = handlers[type] || { refCount: 0 };
					if (!handlerForType.handler) {
						const handler = makeDOMEventHandler(triggerDOMHandler);
						handlerForType.handler = handler;
						originalAddEventListener.call(this, type, handler, options);
					}
					handlerForType.refCount++;
				} catch {}
				return originalAddEventListener.call(this, type, listener, options);
			};
		});
		fill(proto, "removeEventListener", function(originalRemoveEventListener) {
			return function(type, listener, options) {
				if (type === "click" || type == "keypress") try {
					const handlers = this.__sentry_instrumentation_handlers__ || {};
					const handlerForType = handlers[type];
					if (handlerForType) {
						handlerForType.refCount--;
						if (handlerForType.refCount <= 0) {
							originalRemoveEventListener.call(this, type, handlerForType.handler, options);
							handlerForType.handler = void 0;
							delete handlers[type];
						}
						if (Object.keys(handlers).length === 0) delete this.__sentry_instrumentation_handlers__;
					}
				} catch {}
				return originalRemoveEventListener.call(this, type, listener, options);
			};
		});
	});
}
function isSimilarToLastCapturedEvent(event) {
	if (event.type !== lastCapturedEventType) return false;
	try {
		if (!event.target || event.target._sentryId !== lastCapturedEventTargetId) return false;
	} catch {}
	return true;
}
function shouldSkipDOMEvent(eventType, target) {
	if (eventType !== "keypress") return false;
	if (!target?.tagName) return true;
	if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return false;
	return true;
}
function makeDOMEventHandler(handler, globalListener = false) {
	return (event) => {
		if (!event || event["_sentryCaptured"]) return;
		const target = getEventTarget(event);
		if (shouldSkipDOMEvent(event.type, target)) return;
		addNonEnumerableProperty(event, "_sentryCaptured", true);
		if (target && !target._sentryId) addNonEnumerableProperty(target, "_sentryId", uuid4());
		const name = event.type === "keypress" ? "input" : event.type;
		if (!isSimilarToLastCapturedEvent(event)) {
			handler({
				event,
				name,
				global: globalListener
			});
			lastCapturedEventType = event.type;
			lastCapturedEventTargetId = target ? target._sentryId : void 0;
		}
		clearTimeout(debounceTimerID);
		debounceTimerID = WINDOW$2.setTimeout(() => {
			lastCapturedEventTargetId = void 0;
			lastCapturedEventType = void 0;
		}, DEBOUNCE_DURATION);
	};
}
function getEventTarget(event) {
	try {
		return event.target;
	} catch {
		return null;
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrument/history.js
var lastHref;
function addHistoryInstrumentationHandler(handler) {
	const type = "history";
	addHandler$1(type, handler);
	maybeInstrument(type, instrumentHistory);
}
function instrumentHistory() {
	WINDOW$2.addEventListener("popstate", () => {
		const to = WINDOW$2.location.href;
		const from = lastHref;
		lastHref = to;
		if (from === to) return;
		triggerHandlers$1("history", {
			from,
			to
		});
	});
	if (!supportsHistory()) return;
	function historyReplacementFunction(originalHistoryFunction) {
		return function(...args) {
			const url = args.length > 2 ? args[2] : void 0;
			if (url) {
				const from = lastHref;
				const to = getAbsoluteUrl(String(url));
				lastHref = to;
				if (from === to) return originalHistoryFunction.apply(this, args);
				triggerHandlers$1("history", {
					from,
					to
				});
			}
			return originalHistoryFunction.apply(this, args);
		};
	}
	fill(WINDOW$2.history, "pushState", historyReplacementFunction);
	fill(WINDOW$2.history, "replaceState", historyReplacementFunction);
}
function getAbsoluteUrl(urlOrPath) {
	try {
		return new URL(urlOrPath, WINDOW$2.location.origin).toString();
	} catch {
		return urlOrPath;
	}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/getNativeImplementation.js
var cachedImplementations = {};
function getNativeImplementation(name) {
	const cached = cachedImplementations[name];
	if (cached) return cached;
	let impl = WINDOW$2[name];
	if (isNativeFunction(impl)) return cachedImplementations[name] = impl.bind(WINDOW$2);
	const document = WINDOW$2.document;
	if (document && typeof document.createElement === "function") try {
		const sandbox = document.createElement("iframe");
		sandbox.hidden = true;
		document.head.appendChild(sandbox);
		const contentWindow = sandbox.contentWindow;
		if (contentWindow?.[name]) impl = contentWindow[name];
		document.head.removeChild(sandbox);
	} catch (e) {
		DEBUG_BUILD$1 && debug.warn(`Could not create sandbox iframe for ${name} check, bailing to window.${name}: `, e);
	}
	if (!impl) return impl;
	return cachedImplementations[name] = impl.bind(WINDOW$2);
}
function clearCachedImplementation(name) {
	cachedImplementations[name] = void 0;
}
function setTimeout$1(...rest) {
	return getNativeImplementation("setTimeout")(...rest);
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrument/xhr.js
var SENTRY_XHR_DATA_KEY = "__sentry_xhr_v3__";
function addXhrInstrumentationHandler(handler) {
	const type = "xhr";
	addHandler$1(type, handler);
	maybeInstrument(type, instrumentXHR);
}
function instrumentXHR() {
	if (!WINDOW$2.XMLHttpRequest) return;
	const xhrproto = XMLHttpRequest.prototype;
	xhrproto.open = new Proxy(xhrproto.open, { apply(originalOpen, xhrOpenThisArg, xhrOpenArgArray) {
		const virtualError = /* @__PURE__ */ new Error();
		const startTimestamp = timestampInSeconds() * 1e3;
		const method = isString(xhrOpenArgArray[0]) ? xhrOpenArgArray[0].toUpperCase() : void 0;
		const url = parseXhrUrlArg(xhrOpenArgArray[1]);
		if (!method || !url) return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
		xhrOpenThisArg[SENTRY_XHR_DATA_KEY] = {
			method,
			url,
			request_headers: {}
		};
		if (method === "POST" && url.match(/sentry_key/)) xhrOpenThisArg.__sentry_own_request__ = true;
		const onreadystatechangeHandler = () => {
			const xhrInfo = xhrOpenThisArg[SENTRY_XHR_DATA_KEY];
			if (!xhrInfo) return;
			if (xhrOpenThisArg.readyState === 4) {
				try {
					xhrInfo.status_code = xhrOpenThisArg.status;
				} catch {}
				triggerHandlers$1("xhr", {
					endTimestamp: timestampInSeconds() * 1e3,
					startTimestamp,
					xhr: xhrOpenThisArg,
					virtualError
				});
				xhrOpenThisArg.removeEventListener("readystatechange", onreadystatechangeHandler);
			}
		};
		if ("onreadystatechange" in xhrOpenThisArg && typeof xhrOpenThisArg.onreadystatechange === "function") xhrOpenThisArg.onreadystatechange = new Proxy(xhrOpenThisArg.onreadystatechange, { apply(originalOnreadystatechange, onreadystatechangeThisArg, onreadystatechangeArgArray) {
			onreadystatechangeHandler();
			return originalOnreadystatechange.apply(onreadystatechangeThisArg, onreadystatechangeArgArray);
		} });
		else xhrOpenThisArg.addEventListener("readystatechange", onreadystatechangeHandler);
		xhrOpenThisArg.setRequestHeader = new Proxy(xhrOpenThisArg.setRequestHeader, { apply(originalSetRequestHeader, setRequestHeaderThisArg, setRequestHeaderArgArray) {
			const [header, value] = setRequestHeaderArgArray;
			const xhrInfo = setRequestHeaderThisArg[SENTRY_XHR_DATA_KEY];
			if (xhrInfo && isString(header) && isString(value)) xhrInfo.request_headers[header.toLowerCase()] = value;
			return originalSetRequestHeader.apply(setRequestHeaderThisArg, setRequestHeaderArgArray);
		} });
		return originalOpen.apply(xhrOpenThisArg, xhrOpenArgArray);
	} });
	xhrproto.send = new Proxy(xhrproto.send, { apply(originalSend, sendThisArg, sendArgArray) {
		const sentryXhrData = sendThisArg[SENTRY_XHR_DATA_KEY];
		if (!sentryXhrData) return originalSend.apply(sendThisArg, sendArgArray);
		if (sendArgArray[0] !== void 0) sentryXhrData.body = sendArgArray[0];
		triggerHandlers$1("xhr", {
			startTimestamp: timestampInSeconds() * 1e3,
			xhr: sendThisArg
		});
		return originalSend.apply(sendThisArg, sendArgArray);
	} });
}
function parseXhrUrlArg(url) {
	if (isString(url)) return url;
	try {
		return url.toString();
	} catch {}
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/networkUtils.js
var ORIGINAL_REQ_BODY = /* @__PURE__ */ Symbol.for("sentry__originalRequestBody");
function serializeFormData(formData) {
	return new URLSearchParams(formData).toString();
}
function getBodyString(body, _debug = debug) {
	try {
		if (typeof body === "string") return [body];
		if (body instanceof URLSearchParams) return [body.toString()];
		if (body instanceof FormData) return [serializeFormData(body)];
		if (!body) return [void 0];
	} catch (error) {
		DEBUG_BUILD$1 && _debug.error(error, "Failed to serialize body", body);
		return [void 0, "BODY_PARSE_ERROR"];
	}
	DEBUG_BUILD$1 && _debug.log("Skipping network body because of body type", body);
	return [void 0, "UNPARSEABLE_BODY_TYPE"];
}
function getFetchRequestArgBody(fetchArgs = []) {
	if (fetchArgs.length >= 2 && fetchArgs[1] && typeof fetchArgs[1] === "object" && "body" in fetchArgs[1]) return fetchArgs[1].body;
	if (fetchArgs.length >= 1 && fetchArgs[0] instanceof Request) {
		const originalBody = fetchArgs[0][ORIGINAL_REQ_BODY];
		if (originalBody !== void 0) return originalBody;
		return;
	}
}
function parseXhrResponseHeaders(xhr) {
	let headers;
	try {
		headers = xhr.getAllResponseHeaders();
	} catch (error) {
		DEBUG_BUILD$1 && debug.error(error, "Failed to get xhr response headers", xhr);
		return {};
	}
	if (!headers) return {};
	return headers.split("\r\n").reduce((acc, line) => {
		const [key, value] = line.split(": ");
		if (value) acc[key.toLowerCase()] = value;
		return acc;
	}, {});
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/is.js
function isElement(wat) {
	if (typeof Element === "undefined") return false;
	try {
		return wat instanceof Element;
	} catch {
		return false;
	}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/transports/fetch.js
var DEFAULT_BROWSER_TRANSPORT_BUFFER_SIZE = 40;
function makeFetchTransport(options, nativeFetch = getNativeImplementation("fetch")) {
	let pendingBodySize = 0;
	let pendingCount = 0;
	async function makeRequest(request) {
		const requestSize = request.body.length;
		pendingBodySize += requestSize;
		pendingCount++;
		const requestOptions = {
			body: request.body,
			method: "POST",
			referrerPolicy: "strict-origin",
			headers: options.headers,
			keepalive: pendingBodySize <= 6e4 && pendingCount < 15,
			...options.fetchOptions
		};
		try {
			const response = await nativeFetch(options.url, requestOptions);
			return {
				statusCode: response.status,
				headers: {
					"x-sentry-rate-limits": response.headers.get("X-Sentry-Rate-Limits"),
					"retry-after": response.headers.get("Retry-After")
				}
			};
		} catch (e) {
			clearCachedImplementation("fetch");
			throw e;
		} finally {
			pendingBodySize -= requestSize;
			pendingCount--;
		}
	}
	return createTransport(options, makeRequest, makePromiseBuffer(options.bufferSize || DEFAULT_BROWSER_TRANSPORT_BUFFER_SIZE));
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/debug-build.js
var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/profiling/index.js
function startProfiler() {
	const client = getClient();
	if (!client) {
		DEBUG_BUILD && debug.warn("No Sentry client available, profiling is not started");
		return;
	}
	if (!client.getIntegrationByName("BrowserProfiling")) {
		DEBUG_BUILD && debug.warn("BrowserProfiling integration is not available");
		return;
	}
	client.emit("startUIProfiler");
}
function stopProfiler() {
	const client = getClient();
	if (!client) {
		DEBUG_BUILD && debug.warn("No Sentry client available, profiling is not started");
		return;
	}
	if (!client.getIntegrationByName("BrowserProfiling")) {
		DEBUG_BUILD && debug.warn("ProfilingIntegration is not available");
		return;
	}
	client.emit("stopUIProfiler");
}
var uiProfiler = {
	startProfiler,
	stopProfiler
};
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/stack-parsers.js
var OPERA10_PRIORITY = 10;
var OPERA11_PRIORITY = 20;
var CHROME_PRIORITY = 30;
var WINJS_PRIORITY = 40;
var GECKO_PRIORITY = 50;
function createFrame(filename, func, lineno, colno) {
	const frame = {
		filename,
		function: func === "<anonymous>" ? "?" : func,
		in_app: true
	};
	if (lineno !== void 0) frame.lineno = lineno;
	if (colno !== void 0) frame.colno = colno;
	return frame;
}
var chromeRegexNoFnName = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;
var chromeRegex = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
var chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;
var chromeDataUriRegex = /at (.+?) ?\(data:(.+?),/;
var chromeStackParserFn = (line) => {
	const dataUriMatch = line.match(chromeDataUriRegex);
	if (dataUriMatch) return {
		filename: `<data:${dataUriMatch[2]}>`,
		function: dataUriMatch[1]
	};
	const noFnParts = chromeRegexNoFnName.exec(line);
	if (noFnParts) {
		const [, filename, line2, col] = noFnParts;
		return createFrame(filename, "?", +line2, +col);
	}
	const parts = chromeRegex.exec(line);
	if (parts) {
		if (parts[2]?.indexOf("eval") === 0) {
			const subMatch = chromeEvalRegex.exec(parts[2]);
			if (subMatch) {
				parts[2] = subMatch[1];
				parts[3] = subMatch[2];
				parts[4] = subMatch[3];
			}
		}
		const [func, filename] = extractSafariExtensionDetails(parts[1] || "?", parts[2]);
		return createFrame(filename, func, parts[3] ? +parts[3] : void 0, parts[4] ? +parts[4] : void 0);
	}
};
var chromeStackLineParser = [CHROME_PRIORITY, chromeStackParserFn];
var geckoREgex = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
var geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
var gecko = (line) => {
	const parts = geckoREgex.exec(line);
	if (parts) {
		if (parts[3] && parts[3].indexOf(" > eval") > -1) {
			const subMatch = geckoEvalRegex.exec(parts[3]);
			if (subMatch) {
				parts[1] = parts[1] || "eval";
				parts[3] = subMatch[1];
				parts[4] = subMatch[2];
				parts[5] = "";
			}
		}
		let filename = parts[3];
		let func = parts[1] || "?";
		[func, filename] = extractSafariExtensionDetails(func, filename);
		return createFrame(filename, func, parts[4] ? +parts[4] : void 0, parts[5] ? +parts[5] : void 0);
	}
};
var geckoStackLineParser = [GECKO_PRIORITY, gecko];
var winjsRegex = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
var winjs = (line) => {
	const parts = winjsRegex.exec(line);
	return parts ? createFrame(parts[2], parts[1] || "?", +parts[3], parts[4] ? +parts[4] : void 0) : void 0;
};
var winjsStackLineParser = [WINJS_PRIORITY, winjs];
var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
var opera10 = (line) => {
	const parts = opera10Regex.exec(line);
	return parts ? createFrame(parts[2], parts[3] || "?", +parts[1]) : void 0;
};
var opera10StackLineParser = [OPERA10_PRIORITY, opera10];
var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i;
var opera11 = (line) => {
	const parts = opera11Regex.exec(line);
	return parts ? createFrame(parts[5], parts[3] || parts[4] || "?", +parts[1], +parts[2]) : void 0;
};
var opera11StackLineParser = [OPERA11_PRIORITY, opera11];
var defaultStackLineParsers = [chromeStackLineParser, geckoStackLineParser];
var defaultStackParser = createStackParser(...defaultStackLineParsers);
var extractSafariExtensionDetails = (func, filename) => {
	const isSafariExtension = func.indexOf("safari-extension") !== -1;
	const isSafariWebExtension = func.indexOf("safari-web-extension") !== -1;
	return isSafariExtension || isSafariWebExtension ? [func.indexOf("@") !== -1 ? func.split("@")[0] : "?", isSafariExtension ? `safari-extension:${filename}` : `safari-web-extension:${filename}`] : [func, filename];
};
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/userfeedback.js
function createUserFeedbackEnvelope(feedback, { metadata, tunnel, dsn }) {
	return createEnvelope({
		event_id: feedback.event_id,
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...metadata?.sdk && { sdk: {
			name: metadata.sdk.name,
			version: metadata.sdk.version
		} },
		...!!tunnel && !!dsn && { dsn: dsnToString(dsn) }
	}, [createUserFeedbackEnvelopeItem(feedback)]);
}
function createUserFeedbackEnvelopeItem(feedback) {
	return [{ type: "user_report" }, feedback];
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/breadcrumbs.js
var MAX_ALLOWED_STRING_LENGTH = 1024;
var INTEGRATION_NAME$11 = "Breadcrumbs";
var _breadcrumbsIntegration = ((options = {}) => {
	const _options = {
		console: true,
		dom: true,
		fetch: true,
		history: true,
		sentry: true,
		xhr: true,
		...options
	};
	return {
		name: INTEGRATION_NAME$11,
		setup(client) {
			if (_options.console) addConsoleInstrumentationHandler(_getConsoleBreadcrumbHandler(client));
			if (_options.dom) addClickKeypressInstrumentationHandler(_getDomBreadcrumbHandler(client, _options.dom));
			if (_options.xhr) addXhrInstrumentationHandler(_getXhrBreadcrumbHandler(client));
			if (_options.fetch) addFetchInstrumentationHandler(_getFetchBreadcrumbHandler(client));
			if (_options.history) addHistoryInstrumentationHandler(_getHistoryBreadcrumbHandler(client));
			if (_options.sentry) client.on("beforeSendEvent", _getSentryBreadcrumbHandler(client));
		}
	};
});
var breadcrumbsIntegration = defineIntegration(_breadcrumbsIntegration);
function _getSentryBreadcrumbHandler(client) {
	return function addSentryBreadcrumb(event) {
		if (getClient() !== client) return;
		addBreadcrumb({
			category: `sentry.${event.type === "transaction" ? "transaction" : "event"}`,
			event_id: event.event_id,
			level: event.level,
			message: getEventDescription(event)
		}, { event });
	};
}
function _getDomBreadcrumbHandler(client, dom) {
	return function _innerDomBreadcrumb(handlerData) {
		if (getClient() !== client) return;
		let target;
		let componentName;
		let keyAttrs = typeof dom === "object" ? dom.serializeAttribute : void 0;
		let maxStringLength = typeof dom === "object" && typeof dom.maxStringLength === "number" ? dom.maxStringLength : void 0;
		if (maxStringLength && maxStringLength > MAX_ALLOWED_STRING_LENGTH) {
			DEBUG_BUILD && debug.warn(`\`dom.maxStringLength\` cannot exceed ${MAX_ALLOWED_STRING_LENGTH}, but a value of ${maxStringLength} was configured. Sentry will use ${MAX_ALLOWED_STRING_LENGTH} instead.`);
			maxStringLength = MAX_ALLOWED_STRING_LENGTH;
		}
		if (typeof keyAttrs === "string") keyAttrs = [keyAttrs];
		try {
			const event = handlerData.event;
			const element = _isEvent(event) ? event.target : event;
			target = htmlTreeAsString(element, {
				keyAttrs,
				maxStringLength
			});
			componentName = getComponentName(element);
		} catch {
			target = "<unknown>";
		}
		if (target.length === 0) return;
		const breadcrumb = {
			category: `ui.${handlerData.name}`,
			message: target
		};
		if (componentName) breadcrumb.data = { "ui.component_name": componentName };
		addBreadcrumb(breadcrumb, {
			event: handlerData.event,
			name: handlerData.name,
			global: handlerData.global
		});
	};
}
function _getConsoleBreadcrumbHandler(client) {
	return function _consoleBreadcrumb(handlerData) {
		if (getClient() !== client) return;
		const breadcrumb = {
			category: "console",
			data: {
				arguments: handlerData.args,
				logger: "console"
			},
			level: severityLevelFromString(handlerData.level),
			message: safeJoin(handlerData.args, " ")
		};
		if (handlerData.level === "assert") if (handlerData.args[0] === false) {
			breadcrumb.message = `Assertion failed: ${safeJoin(handlerData.args.slice(1), " ") || "console.assert"}`;
			breadcrumb.data.arguments = handlerData.args.slice(1);
		} else return;
		addBreadcrumb(breadcrumb, {
			input: handlerData.args,
			level: handlerData.level
		});
	};
}
function _getXhrBreadcrumbHandler(client) {
	return function _xhrBreadcrumb(handlerData) {
		if (getClient() !== client) return;
		const { startTimestamp, endTimestamp } = handlerData;
		const sentryXhrData = handlerData.xhr[SENTRY_XHR_DATA_KEY];
		if (!startTimestamp || !endTimestamp || !sentryXhrData) return;
		const { method, url, status_code, body } = sentryXhrData;
		const data = {
			method,
			url,
			status_code
		};
		const hint = {
			xhr: handlerData.xhr,
			input: body,
			startTimestamp,
			endTimestamp
		};
		const breadcrumb = {
			category: "xhr",
			data,
			type: "http",
			level: getBreadcrumbLogLevelFromHttpStatusCode(status_code)
		};
		client.emit("beforeOutgoingRequestBreadcrumb", breadcrumb, hint);
		addBreadcrumb(breadcrumb, hint);
	};
}
function _getFetchBreadcrumbHandler(client) {
	return function _fetchBreadcrumb(handlerData) {
		if (getClient() !== client) return;
		const { startTimestamp, endTimestamp } = handlerData;
		if (!endTimestamp) return;
		if (handlerData.fetchData.url.match(/sentry_key/) && handlerData.fetchData.method === "POST") return;
		if (handlerData.error) {
			const hint = {
				data: handlerData.error,
				input: handlerData.args,
				startTimestamp,
				endTimestamp
			};
			const breadcrumb = {
				category: "fetch",
				data: handlerData.fetchData,
				level: "error",
				type: "http"
			};
			client.emit("beforeOutgoingRequestBreadcrumb", breadcrumb, hint);
			addBreadcrumb(breadcrumb, hint);
		} else {
			const response = handlerData.response;
			const data = {
				...handlerData.fetchData,
				status_code: response?.status
			};
			const hint = {
				input: handlerData.args,
				response,
				startTimestamp,
				endTimestamp
			};
			const breadcrumb = {
				category: "fetch",
				data,
				type: "http",
				level: getBreadcrumbLogLevelFromHttpStatusCode(data.status_code)
			};
			client.emit("beforeOutgoingRequestBreadcrumb", breadcrumb, hint);
			addBreadcrumb(breadcrumb, hint);
		}
	};
}
function _getHistoryBreadcrumbHandler(client) {
	return function _historyBreadcrumb(handlerData) {
		if (getClient() !== client) return;
		let from = handlerData.from;
		let to = handlerData.to;
		const parsedLoc = parseUrl(WINDOW$3.location.href);
		let parsedFrom = from ? parseUrl(from) : void 0;
		const parsedTo = parseUrl(to);
		if (!parsedFrom?.path) parsedFrom = parsedLoc;
		if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) to = parsedTo.relative;
		if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) from = parsedFrom.relative;
		addBreadcrumb({
			category: "navigation",
			data: {
				from,
				to
			}
		});
	};
}
function _isEvent(event) {
	return !!event && !!event.target;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/browserapierrors.js
var DEFAULT_EVENT_TARGET = "EventTarget,Window,Node,ApplicationCache,AudioTrackList,BroadcastChannel,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,SharedWorker,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");
var INTEGRATION_NAME$10 = "BrowserApiErrors";
var _browserApiErrorsIntegration = ((options = {}) => {
	const _options = {
		XMLHttpRequest: true,
		eventTarget: true,
		requestAnimationFrame: true,
		setInterval: true,
		setTimeout: true,
		unregisterOriginalCallbacks: false,
		...options
	};
	return {
		name: INTEGRATION_NAME$10,
		setupOnce() {
			if (_options.setTimeout) fill(WINDOW$3, "setTimeout", _wrapTimeFunction);
			if (_options.setInterval) fill(WINDOW$3, "setInterval", _wrapTimeFunction);
			if (_options.requestAnimationFrame) fill(WINDOW$3, "requestAnimationFrame", _wrapRAF);
			if (_options.XMLHttpRequest && "XMLHttpRequest" in WINDOW$3) fill(XMLHttpRequest.prototype, "send", _wrapXHR$1);
			const eventTargetOption = _options.eventTarget;
			if (eventTargetOption) (Array.isArray(eventTargetOption) ? eventTargetOption : DEFAULT_EVENT_TARGET).forEach((target) => _wrapEventTarget(target, _options));
		}
	};
});
var browserApiErrorsIntegration = defineIntegration(_browserApiErrorsIntegration);
function _wrapTimeFunction(original) {
	return function(...args) {
		const originalCallback = args[0];
		args[0] = wrap(originalCallback, { mechanism: {
			handled: false,
			type: `auto.browser.browserapierrors.${getFunctionName(original)}`
		} });
		return original.apply(this, args);
	};
}
function _wrapRAF(original) {
	return function(callback) {
		return original.apply(this, [wrap(callback, { mechanism: {
			data: { handler: getFunctionName(original) },
			handled: false,
			type: "auto.browser.browserapierrors.requestAnimationFrame"
		} })]);
	};
}
function _wrapXHR$1(originalSend) {
	return function(...args) {
		const xhr = this;
		[
			"onload",
			"onerror",
			"onprogress",
			"onreadystatechange"
		].forEach((prop) => {
			if (prop in xhr && typeof xhr[prop] === "function") fill(xhr, prop, function(original) {
				const wrapOptions = { mechanism: {
					data: { handler: getFunctionName(original) },
					handled: false,
					type: `auto.browser.browserapierrors.xhr.${prop}`
				} };
				const originalFunction = getOriginalFunction(original);
				if (originalFunction) wrapOptions.mechanism.data.handler = getFunctionName(originalFunction);
				return wrap(original, wrapOptions);
			});
		});
		return originalSend.apply(this, args);
	};
}
function _wrapEventTarget(target, integrationOptions) {
	const proto = WINDOW$3[target]?.prototype;
	if (!proto?.hasOwnProperty?.("addEventListener")) return;
	fill(proto, "addEventListener", function(original) {
		return function(eventName, fn, options) {
			try {
				if (isEventListenerObject(fn)) fn.handleEvent = wrap(fn.handleEvent, { mechanism: {
					data: {
						handler: getFunctionName(fn),
						target
					},
					handled: false,
					type: "auto.browser.browserapierrors.handleEvent"
				} });
			} catch {}
			if (integrationOptions.unregisterOriginalCallbacks) unregisterOriginalCallback(this, eventName, fn);
			return original.apply(this, [
				eventName,
				wrap(fn, { mechanism: {
					data: {
						handler: getFunctionName(fn),
						target
					},
					handled: false,
					type: "auto.browser.browserapierrors.addEventListener"
				} }),
				options
			]);
		};
	});
	fill(proto, "removeEventListener", function(originalRemoveEventListener) {
		return function(eventName, fn, options) {
			try {
				if (Object.prototype.hasOwnProperty.call(fn, "__sentry_wrapped__")) {
					const originalEventHandler = fn.__sentry_wrapped__;
					if (originalEventHandler) originalRemoveEventListener.call(this, eventName, originalEventHandler, options);
				}
			} catch {}
			return originalRemoveEventListener.call(this, eventName, fn, options);
		};
	});
}
function isEventListenerObject(obj) {
	return typeof obj.handleEvent === "function";
}
function unregisterOriginalCallback(target, eventName, fn) {
	if (target && typeof target === "object" && "removeEventListener" in target && typeof target.removeEventListener === "function") target.removeEventListener(eventName, fn);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/browsersession.js
var browserSessionIntegration = defineIntegration((options = {}) => {
	const lifecycle = options.lifecycle ?? "route";
	return {
		name: "BrowserSession",
		setupOnce() {
			if (typeof WINDOW$3.document === "undefined") {
				DEBUG_BUILD && debug.warn("Using the `browserSessionIntegration` in non-browser environments is not supported.");
				return;
			}
			startSession({ ignoreDuration: true });
			let initialSessionSent = false;
			whenIdleOrHidden(() => {
				if (!initialSessionSent) {
					captureSession();
					initialSessionSent = true;
				}
			});
			const isolationScope = getIsolationScope();
			let previousUser = isolationScope.getUser();
			isolationScope.addScopeListener((scope) => {
				const maybeNewUser = scope.getUser();
				if (previousUser?.id !== maybeNewUser?.id || previousUser?.ip_address !== maybeNewUser?.ip_address) {
					previousUser = maybeNewUser;
					if (initialSessionSent) captureSession();
				}
			});
			if (lifecycle === "route") addHistoryInstrumentationHandler(({ from, to }) => {
				if (from !== to) {
					startSession({ ignoreDuration: true });
					captureSession();
					initialSessionSent = true;
				}
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/culturecontext.js
var INTEGRATION_NAME$9 = "CultureContext";
var _cultureContextIntegration = (() => {
	return {
		name: INTEGRATION_NAME$9,
		preprocessEvent(event) {
			const culture = getCultureContext();
			if (culture) event.contexts = {
				...event.contexts,
				culture: {
					...culture,
					...event.contexts?.culture
				}
			};
		},
		processSegmentSpan(span) {
			const culture = getCultureContext();
			if (culture) safeSetSpanJSONAttributes(span, {
				"culture.locale": culture.locale,
				"culture.timezone": culture.timezone,
				"culture.calendar": culture.calendar
			});
		}
	};
});
var cultureContextIntegration = defineIntegration(_cultureContextIntegration);
function getCultureContext() {
	try {
		const intl = WINDOW$3.Intl;
		if (!intl) return;
		const options = intl.DateTimeFormat().resolvedOptions();
		return {
			locale: options.locale,
			timezone: options.timeZone,
			calendar: options.calendar
		};
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/globalhandlers.js
var INTEGRATION_NAME$8 = "GlobalHandlers";
var _globalHandlersIntegration = ((options = {}) => {
	const _options = {
		onerror: true,
		onunhandledrejection: true,
		...options
	};
	return {
		name: INTEGRATION_NAME$8,
		setupOnce() {
			Error.stackTraceLimit = 50;
		},
		setup(client) {
			if (_options.onerror) {
				_installGlobalOnErrorHandler(client);
				globalHandlerLog("onerror");
			}
			if (_options.onunhandledrejection) {
				_installGlobalOnUnhandledRejectionHandler(client);
				globalHandlerLog("onunhandledrejection");
			}
		}
	};
});
var globalHandlersIntegration = defineIntegration(_globalHandlersIntegration);
function _installGlobalOnErrorHandler(client) {
	addGlobalErrorInstrumentationHandler((data) => {
		const { stackParser, attachStacktrace } = getOptions();
		if (getClient() !== client || shouldIgnoreOnError()) return;
		const { msg, url, line, column, error } = data;
		const event = _enhanceEventWithInitialFrame(eventFromUnknownInput(stackParser, error || msg, void 0, attachStacktrace, false), url, line, column);
		event.level = "error";
		captureEvent(event, {
			originalException: error,
			mechanism: {
				handled: false,
				type: "auto.browser.global_handlers.onerror"
			}
		});
	});
}
function _installGlobalOnUnhandledRejectionHandler(client) {
	addGlobalUnhandledRejectionInstrumentationHandler((e) => {
		const { stackParser, attachStacktrace } = getOptions();
		if (getClient() !== client || shouldIgnoreOnError()) return;
		const error = _getUnhandledRejectionError(e);
		const event = isPrimitive(error) ? _eventFromRejectionWithPrimitive(error) : eventFromUnknownInput(stackParser, error, void 0, attachStacktrace, true);
		event.level = "error";
		captureEvent(event, {
			originalException: error,
			mechanism: {
				handled: false,
				type: "auto.browser.global_handlers.onunhandledrejection"
			}
		});
	});
}
function _getUnhandledRejectionError(error) {
	if (isPrimitive(error)) return error;
	try {
		if ("reason" in error) return error.reason;
		if ("detail" in error && "reason" in error.detail) return error.detail.reason;
	} catch {}
	return error;
}
function _eventFromRejectionWithPrimitive(reason) {
	return { exception: { values: [{
		type: "UnhandledRejection",
		value: `Non-Error promise rejection captured with value: ${String(reason)}`
	}] } };
}
function _enhanceEventWithInitialFrame(event, url, lineno, colno) {
	const e = event.exception = event.exception || {};
	const ev = e.values = e.values || [];
	const ev0 = ev[0] = ev[0] || {};
	const ev0s = ev0.stacktrace = ev0.stacktrace || {};
	const ev0sf = ev0s.frames = ev0s.frames || [];
	if (ev0sf.length === 0) ev0sf.push({
		colno,
		lineno,
		filename: getFilenameFromUrl(url) ?? getLocationHref(),
		function: "?",
		in_app: true
	});
	return event;
}
function globalHandlerLog(type) {
	DEBUG_BUILD && debug.log(`Global Handler attached: ${type}`);
}
function getOptions() {
	return getClient()?.getOptions() || {
		stackParser: () => [],
		attachStacktrace: false
	};
}
function getFilenameFromUrl(url) {
	if (!isString(url) || url.length === 0) return;
	if (url.startsWith("data:")) return `<${stripDataUrlContent(url, false)}>`;
	return url;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/httpcontext.js
var httpContextIntegration = defineIntegration(() => {
	return {
		name: "HttpContext",
		preprocessEvent(event) {
			if (!WINDOW$3.navigator && !WINDOW$3.location && !WINDOW$3.document) return;
			const reqData = getHttpRequestData();
			const headers = {
				...reqData.headers,
				...event.request?.headers
			};
			event.request = {
				...reqData,
				...event.request,
				headers
			};
		},
		processSegmentSpan(span) {
			const spanOp = span.attributes?.[SEMANTIC_ATTRIBUTE_SENTRY_OP];
			if (!WINDOW$3.navigator && !WINDOW$3.location && !WINDOW$3.document) return;
			const reqData = getHttpRequestData();
			safeSetSpanJSONAttributes(span, {
				"url.full": spanOp !== "http.client" ? reqData.url : void 0,
				"http.request.header.user_agent": reqData.headers["User-Agent"],
				"http.request.header.referer": reqData.headers["Referer"]
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/linkederrors.js
var DEFAULT_KEY = "cause";
var DEFAULT_LIMIT = 5;
var INTEGRATION_NAME$7 = "LinkedErrors";
var _linkedErrorsIntegration = ((options = {}) => {
	const limit = options.limit || DEFAULT_LIMIT;
	const key = options.key || DEFAULT_KEY;
	return {
		name: INTEGRATION_NAME$7,
		preprocessEvent(event, hint, client) {
			applyAggregateErrorsToEvent(exceptionFromError, client.getOptions().stackParser, key, limit, event, hint);
		}
	};
});
var linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/normalizeStringifyValue.js
var HTML_ELEMENT_CONSTRUCTOR_NAME_REGEX = /^HTML(\w*)Element$/;
function normalizeStringifyValue(value) {
	if (typeof window !== "undefined" && value === window) return "[Window]";
	if (typeof document !== "undefined" && value === document) return "[Document]";
	if (isElement(value)) {
		const objName = getConstructorName(value);
		if (HTML_ELEMENT_CONSTRUCTOR_NAME_REGEX.test(objName)) return `[HTMLElement: ${htmlTreeAsString(value)}]`;
	}
}
function getConstructorName(value) {
	const prototype = Object.getPrototypeOf(value);
	return prototype?.constructor ? prototype.constructor.name : "null prototype";
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/utils/detectBrowserExtension.js
function checkAndWarnIfIsEmbeddedBrowserExtension() {
	if (_isEmbeddedBrowserExtension()) {
		if (DEBUG_BUILD) consoleSandbox(() => {
			console.error("[Sentry] You cannot use Sentry.init() in a browser extension, see: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/");
		});
		return true;
	}
	return false;
}
function _isEmbeddedBrowserExtension() {
	if (typeof WINDOW$3.window === "undefined") return false;
	const _window = WINDOW$3;
	if (_window.nw) return false;
	if (!(_window["chrome"] || _window["browser"])?.runtime?.id) return false;
	const href = getLocationHref();
	return !(WINDOW$3 === WINDOW$3.top && /^(?:chrome-extension|moz-extension|ms-browser-extension|safari-web-extension):\/\//.test(href));
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/sdk.js
function getDefaultIntegrations(_options) {
	return [
		inboundFiltersIntegration(),
		functionToStringIntegration(),
		conversationIdIntegration(),
		browserApiErrorsIntegration(),
		breadcrumbsIntegration(),
		globalHandlersIntegration(),
		linkedErrorsIntegration(),
		dedupeIntegration(),
		httpContextIntegration(),
		cultureContextIntegration(),
		browserSessionIntegration()
	];
}
function init(options = {}) {
	const shouldDisableBecauseIsBrowserExtenstion = !options.skipBrowserExtensionCheck && checkAndWarnIfIsEmbeddedBrowserExtension();
	let defaultIntegrations = options.defaultIntegrations == null ? getDefaultIntegrations() : options.defaultIntegrations;
	const clientOptions = {
		...options,
		enabled: shouldDisableBecauseIsBrowserExtenstion ? false : options.enabled,
		stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
		integrations: getIntegrationsToSetup({
			integrations: options.integrations,
			defaultIntegrations
		}),
		transport: options.transport || makeFetchTransport
	};
	setNormalizeStringifier(normalizeStringifyValue);
	return initAndBind(BrowserClient, clientOptions);
}
function forceLoad() {}
function onLoad(callback) {
	callback();
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/report-dialog.js
function showReportDialog(options = {}) {
	const optionalDocument = WINDOW$3.document;
	const injectionPoint = optionalDocument?.head || optionalDocument?.body;
	if (!injectionPoint) {
		DEBUG_BUILD && debug.error("[showReportDialog] Global document not defined");
		return;
	}
	const scope = getCurrentScope();
	const dsn = getClient()?.getDsn();
	if (!dsn) {
		DEBUG_BUILD && debug.error("[showReportDialog] DSN not configured");
		return;
	}
	const mergedOptions = {
		...options,
		user: {
			...scope.getUser(),
			...options.user
		},
		eventId: options.eventId || lastEventId()
	};
	const script = WINDOW$3.document.createElement("script");
	script.async = true;
	script.crossOrigin = "anonymous";
	script.src = getReportDialogEndpoint(dsn, mergedOptions);
	const { onLoad, onClose } = mergedOptions;
	if (onLoad) script.onload = onLoad;
	if (onClose) {
		const reportDialogClosedMessageHandler = (event) => {
			if (event.data === "__sentry_reportdialog_closed__") try {
				onClose();
			} finally {
				WINDOW$3.removeEventListener("message", reportDialogClosedMessageHandler);
			}
		};
		WINDOW$3.addEventListener("message", reportDialogClosedMessageHandler);
	}
	injectionPoint.appendChild(script);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/reportingobserver.js
var WINDOW$1 = GLOBAL_OBJ;
var INTEGRATION_NAME$6 = "ReportingObserver";
var SETUP_CLIENTS = /* @__PURE__ */ new WeakMap();
var _reportingObserverIntegration = ((options = {}) => {
	const types = options.types || [
		"crash",
		"deprecation",
		"intervention"
	];
	function handler(reports) {
		if (!SETUP_CLIENTS.has(getClient())) return;
		for (const report of reports) withScope((scope) => {
			scope.setExtra("url", report.url);
			const label = `ReportingObserver [${report.type}]`;
			let details = "No details available";
			if (report.body) {
				const plainBody = {};
				for (const prop in report.body) plainBody[prop] = report.body[prop];
				scope.setExtra("body", plainBody);
				if (report.type === "crash") {
					const body = report.body;
					details = [body.crashId || "", body.reason || ""].join(" ").trim() || details;
				} else details = report.body.message || details;
			}
			captureMessage(`${label}: ${details}`);
		});
	}
	return {
		name: INTEGRATION_NAME$6,
		setupOnce() {
			if (!supportsReportingObserver()) return;
			new WINDOW$1.ReportingObserver(handler, {
				buffered: true,
				types
			}).observe();
		},
		setup(client) {
			SETUP_CLIENTS.set(client, true);
		}
	};
});
var reportingObserverIntegration = defineIntegration(_reportingObserverIntegration);
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/httpclient.js
var INTEGRATION_NAME$5 = "HttpClient";
var _httpClientIntegration = ((options = {}) => {
	const _options = {
		failedRequestStatusCodes: [[500, 599]],
		failedRequestTargets: [/.*/],
		...options
	};
	return {
		name: INTEGRATION_NAME$5,
		setup(client) {
			_wrapFetch(client, _options);
			_wrapXHR(client, _options);
		}
	};
});
var httpClientIntegration = defineIntegration(_httpClientIntegration);
function _fetchResponseHandler(options, requestInfo, response, requestInit, error) {
	if (_shouldCaptureResponse(options, response.status, response.url)) {
		const request = _getRequest(requestInfo, requestInit);
		let requestHeaders, responseHeaders, requestCookies, responseCookies;
		const dc = _getDataCollectionSettings();
		if (dc.requestHeaders !== false) requestHeaders = filterKeyValueData(_extractFetchHeaders(request.headers), dc.requestHeaders);
		if (dc.responseHeaders !== false) responseHeaders = filterKeyValueData(_extractFetchHeaders(response.headers), dc.responseHeaders);
		if (dc.cookies !== false) {
			const reqCookieStr = request.headers.get("Cookie") || void 0;
			if (reqCookieStr) {
				const filtered = filterCookies(reqCookieStr, dc.cookies);
				if (typeof filtered === "object") requestCookies = filtered;
			}
			const resCookieStr = response.headers.get("Set-Cookie") || void 0;
			if (resCookieStr) {
				const filtered = filterCookies(resCookieStr, dc.cookies);
				if (typeof filtered === "object") responseCookies = filtered;
			}
		}
		captureEvent(_createEvent({
			url: request.url,
			method: request.method,
			status: response.status,
			requestHeaders,
			responseHeaders,
			requestCookies,
			responseCookies,
			error,
			type: "fetch"
		}));
	}
}
function _xhrResponseHandler(options, xhr, method, headers, error) {
	if (_shouldCaptureResponse(options, xhr.status, xhr.responseURL)) {
		let requestHeaders, responseCookies, responseHeaders;
		const dc = _getDataCollectionSettings();
		if (dc.cookies !== false) try {
			const cookieString = xhr.getResponseHeader("Set-Cookie") || xhr.getResponseHeader("set-cookie") || void 0;
			if (cookieString) {
				const filtered = filterCookies(cookieString, dc.cookies);
				if (typeof filtered === "object") responseCookies = filtered;
			}
		} catch {}
		if (dc.responseHeaders !== false) try {
			responseHeaders = filterKeyValueData(_getXHRResponseHeaders(xhr), dc.responseHeaders);
		} catch {}
		if (dc.requestHeaders !== false) requestHeaders = filterKeyValueData(headers, dc.requestHeaders);
		captureEvent(_createEvent({
			url: xhr.responseURL,
			method,
			status: xhr.status,
			requestHeaders,
			responseHeaders,
			responseCookies,
			error,
			type: "xhr"
		}));
	}
}
function _getResponseSizeFromHeaders(headers) {
	if (headers) {
		const contentLength = headers["Content-Length"] || headers["content-length"];
		if (contentLength) return parseInt(contentLength, 10);
	}
}
function _extractFetchHeaders(headers) {
	const result = {};
	headers.forEach((value, key) => {
		result[key] = value;
	});
	return result;
}
function _getXHRResponseHeaders(xhr) {
	const headers = xhr.getAllResponseHeaders();
	if (!headers) return {};
	return headers.split("\r\n").reduce((acc, line) => {
		const [key, value] = line.split(": ");
		if (key && value) acc[key] = value;
		return acc;
	}, {});
}
function _isInGivenRequestTargets(failedRequestTargets, target) {
	return failedRequestTargets.some((givenRequestTarget) => {
		if (typeof givenRequestTarget === "string") return target.includes(givenRequestTarget);
		return givenRequestTarget.test(target);
	});
}
function _isInGivenStatusRanges(failedRequestStatusCodes, status) {
	return failedRequestStatusCodes.some((range) => {
		if (typeof range === "number") return range === status;
		return status >= range[0] && status <= range[1];
	});
}
function _wrapFetch(client, options) {
	if (!supportsNativeFetch()) return;
	addFetchInstrumentationHandler((handlerData) => {
		if (getClient() !== client) return;
		const { response, args, error, virtualError } = handlerData;
		const [requestInfo, requestInit] = args;
		if (!response) return;
		_fetchResponseHandler(options, requestInfo, response, requestInit, error || virtualError);
	}, false);
}
function _wrapXHR(client, options) {
	if (!("XMLHttpRequest" in GLOBAL_OBJ)) return;
	addXhrInstrumentationHandler((handlerData) => {
		if (getClient() !== client) return;
		const { error, virtualError } = handlerData;
		const xhr = handlerData.xhr;
		const sentryXhrData = xhr[SENTRY_XHR_DATA_KEY];
		if (!sentryXhrData) return;
		const { method, request_headers: headers } = sentryXhrData;
		try {
			_xhrResponseHandler(options, xhr, method, headers, error || virtualError);
		} catch (e) {
			DEBUG_BUILD && debug.warn("Error while extracting response event form XHR response", e);
		}
	});
}
function _shouldCaptureResponse(options, status, url) {
	return _isInGivenStatusRanges(options.failedRequestStatusCodes, status) && _isInGivenRequestTargets(options.failedRequestTargets, url) && !isSentryRequestUrl(url, getClient());
}
function _createEvent(data) {
	const client = getClient();
	const virtualStackTrace = client && data.error && data.error instanceof Error ? data.error.stack : void 0;
	const stack = virtualStackTrace && client ? client.getOptions().stackParser(virtualStackTrace, 0, 1) : void 0;
	const message = `HTTP Client Error with status code: ${data.status}`;
	const event = {
		message,
		exception: { values: [{
			type: "Error",
			value: message,
			stacktrace: stack ? { frames: stack } : void 0
		}] },
		request: {
			url: data.url,
			method: data.method,
			headers: data.requestHeaders,
			cookies: data.requestCookies
		},
		contexts: { response: {
			status_code: data.status,
			headers: data.responseHeaders,
			cookies: data.responseCookies,
			body_size: _getResponseSizeFromHeaders(data.responseHeaders)
		} }
	};
	addExceptionMechanism(event, {
		type: `auto.http.client.${data.type}`,
		handled: false
	});
	return event;
}
function _getRequest(requestInfo, requestInit) {
	if (!requestInit && requestInfo instanceof Request) return requestInfo;
	if (requestInfo instanceof Request && requestInfo.bodyUsed) return requestInfo;
	return new Request(requestInfo, requestInit);
}
function _getDataCollectionSettings() {
	const client = getClient();
	if (!client) return {
		cookies: false,
		requestHeaders: false,
		responseHeaders: false
	};
	const options = client.getOptions();
	if (options.dataCollection == null) {
		const enabled = Boolean(options.sendDefaultPii);
		return {
			cookies: enabled,
			requestHeaders: enabled,
			responseHeaders: enabled
		};
	}
	const { cookies, httpHeaders } = client.getDataCollectionOptions();
	return {
		cookies,
		requestHeaders: httpHeaders.request,
		responseHeaders: httpHeaders.response
	};
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/contextlines.js
var WINDOW = GLOBAL_OBJ;
var DEFAULT_LINES_OF_CONTEXT = 7;
var INTEGRATION_NAME$4 = "ContextLines";
var _contextLinesIntegration = ((options = {}) => {
	return {
		name: INTEGRATION_NAME$4,
		processEvent(event, _hint, client) {
			return addSourceContext(event, options.frameContextLines ?? client?.getDataCollectionOptions().frameContextLines ?? DEFAULT_LINES_OF_CONTEXT);
		}
	};
});
var contextLinesIntegration = defineIntegration(_contextLinesIntegration);
function addSourceContext(event, contextLines) {
	const doc = WINDOW.document;
	const htmlFilename = WINDOW.location && stripUrlQueryAndFragment(WINDOW.location.href);
	if (!doc || !htmlFilename) return event;
	const exceptions = event.exception?.values;
	if (!exceptions?.length) return event;
	const html = doc.documentElement.innerHTML;
	if (!html) return event;
	const htmlLines = [
		"<!DOCTYPE html>",
		"<html>",
		...html.split("\n"),
		"</html>"
	];
	exceptions.forEach((exception) => {
		const stacktrace = exception.stacktrace;
		if (stacktrace?.frames) stacktrace.frames = stacktrace.frames.map((frame) => applySourceContextToFrame(frame, htmlLines, htmlFilename, contextLines));
	});
	return event;
}
function applySourceContextToFrame(frame, htmlLines, htmlFilename, linesOfContext) {
	if (frame.filename !== htmlFilename || !frame.lineno || !htmlLines.length) return frame;
	addContextToFrame(htmlLines, frame, linesOfContext);
	return frame;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/graphqlClient.js
var INTEGRATION_NAME$3 = "GraphQLClient";
var _graphqlClientIntegration = ((options) => {
	return {
		name: INTEGRATION_NAME$3,
		setup(client) {
			_updateSpanWithGraphQLData(client, options);
			_updateBreadcrumbWithGraphQLData(client, options);
		}
	};
});
function _updateSpanWithGraphQLData(client, options) {
	client.on("beforeOutgoingRequestSpan", (span, hint) => {
		const spanAttributes = spanToJSON(span).data || {};
		if (!(spanAttributes["sentry.op"] === "http.client")) return;
		const httpUrl = spanAttributes["url.full"] || spanAttributes["http.url"] || spanAttributes["url"];
		const httpMethod = spanAttributes["http.request.method"] || spanAttributes["http.method"];
		if (!isString(httpUrl) || !isString(httpMethod)) return;
		const { endpoints } = options;
		const isTracedGraphqlEndpoint = stringMatchesSomePattern(httpUrl, endpoints);
		const payload = getRequestPayloadXhrOrFetch(hint);
		if (isTracedGraphqlEndpoint && payload) {
			const graphqlBody = getGraphQLRequestPayload(payload);
			if (graphqlBody) {
				const operationInfo = _getGraphQLOperation(graphqlBody);
				span.updateName(`${httpMethod} ${httpUrl} (${operationInfo})`);
				if (isStandardRequest(graphqlBody) && client.getDataCollectionOptions().graphQL.document === true) span.setAttribute(qa, graphqlBody.query);
				if (isPersistedRequest(graphqlBody)) {
					span.setAttribute("graphql.persisted_query.hash.sha256", graphqlBody.extensions.persistedQuery.sha256Hash);
					span.setAttribute("graphql.persisted_query.version", graphqlBody.extensions.persistedQuery.version);
				}
			}
		}
	});
}
function _updateBreadcrumbWithGraphQLData(client, options) {
	client.on("beforeOutgoingRequestBreadcrumb", (breadcrumb, handlerData) => {
		const { category, type, data } = breadcrumb;
		if (type === "http" && (category === "fetch" || category === "xhr")) {
			const httpUrl = data?.url;
			const { endpoints } = options;
			const isTracedGraphqlEndpoint = stringMatchesSomePattern(httpUrl, endpoints);
			const payload = getRequestPayloadXhrOrFetch(handlerData);
			if (isTracedGraphqlEndpoint && data && payload) {
				const graphqlBody = getGraphQLRequestPayload(payload);
				if (!data.graphql && graphqlBody) {
					data["graphql.operation"] = _getGraphQLOperation(graphqlBody);
					if (isStandardRequest(graphqlBody) && client.getDataCollectionOptions().graphQL.document === true) data[qa] = graphqlBody.query;
					if (isPersistedRequest(graphqlBody)) {
						data["graphql.persisted_query.hash.sha256"] = graphqlBody.extensions.persistedQuery.sha256Hash;
						data["graphql.persisted_query.version"] = graphqlBody.extensions.persistedQuery.version;
					}
				}
			}
		}
	});
}
function _getGraphQLOperation(requestBody) {
	if (isPersistedRequest(requestBody)) return `persisted ${requestBody.operationName}`;
	if (isStandardRequest(requestBody)) {
		const { query: graphqlQuery, operationName: graphqlOperationName } = requestBody;
		const { operationName = graphqlOperationName, operationType } = parseGraphQLQuery(graphqlQuery);
		return operationName ? `${operationType} ${operationName}` : `${operationType}`;
	}
	return "unknown";
}
function getRequestPayloadXhrOrFetch(hint) {
	const isXhr = "xhr" in hint;
	let body;
	if (isXhr) {
		const sentryXhrData = hint.xhr[SENTRY_XHR_DATA_KEY];
		body = sentryXhrData && getBodyString(sentryXhrData.body)[0];
	} else body = getBodyString(getFetchRequestArgBody(hint.input))[0];
	return body;
}
function parseGraphQLQuery(query) {
	const namedQueryRe = /^(?:\s*)(query|mutation|subscription)(?:\s*)(\w+)(?:\s*)[{(]/;
	const unnamedQueryRe = /^(?:\s*)(query|mutation|subscription)(?:\s*)[{(]/;
	const namedMatch = query.match(namedQueryRe);
	if (namedMatch) return {
		operationType: namedMatch[1],
		operationName: namedMatch[2]
	};
	const unnamedMatch = query.match(unnamedQueryRe);
	if (unnamedMatch) return {
		operationType: unnamedMatch[1],
		operationName: void 0
	};
	return {
		operationType: void 0,
		operationName: void 0
	};
}
function isStandardRequest(payload) {
	return isObjectLike(payload) && typeof payload.query === "string";
}
function isPersistedRequest(payload) {
	return isObjectLike(payload) && typeof payload.operationName === "string" && isObjectLike(payload.extensions) && isObjectLike(payload.extensions.persistedQuery) && typeof payload.extensions.persistedQuery.sha256Hash === "string" && typeof payload.extensions.persistedQuery.version === "number";
}
function getGraphQLRequestPayload(payload) {
	try {
		const requestBody = JSON.parse(payload);
		if (isStandardRequest(requestBody) || isPersistedRequest(requestBody)) return requestBody;
		return;
	} catch {
		return;
	}
}
var graphqlClientIntegration = defineIntegration(_graphqlClientIntegration);
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/view-hierarchy.js
var viewHierarchyIntegration = defineIntegration((options = {}) => {
	const skipHtmlTags = ["script"];
	function walk(element, windows, depth = 0) {
		if (!element) return;
		const children = "shadowRoot" in element && element.shadowRoot ? element.shadowRoot.children : element.children;
		for (const child of children) {
			if (!(child instanceof HTMLElement)) continue;
			const componentName = getComponentName(child, 1) || void 0;
			const tagName = child.tagName.toLowerCase();
			if (skipHtmlTags.includes(tagName)) continue;
			const result = options.onElement?.({
				element: child,
				componentName,
				tagName,
				depth
			}) || {};
			if (result === "skip") continue;
			if (result === "children") {
				walk(child, windows, depth + 1);
				continue;
			}
			const { x, y, width, height } = child.getBoundingClientRect();
			const window = {
				identifier: child.id || void 0,
				type: componentName || tagName,
				visible: true,
				alpha: 1,
				height,
				width,
				x,
				y,
				...result
			};
			window.children = [];
			walk(child, window.children, depth + 1);
			windows.push(window);
		}
	}
	return {
		name: "ViewHierarchy",
		processEvent: (event, hint) => {
			if (event.type !== void 0 || options.shouldAttach?.(event, hint) === false) return event;
			const root = {
				rendering_system: "DOM",
				positioning: "absolute",
				windows: []
			};
			walk(options.rootElement?.() || WINDOW$3.document.body, root.windows);
			const attachment = {
				filename: "view-hierarchy.json",
				attachmentType: "event.view_hierarchy",
				contentType: "application/json",
				data: JSON.stringify(root)
			};
			hint.attachments = hint.attachments || [];
			hint.attachments.push(attachment);
			return event;
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/tracing/utils.js
function baggageHeaderHasSentryValues(baggageHeader) {
	return baggageHeader.split(",").some((value) => value.trim().startsWith("sentry-"));
}
function getFullURL(url) {
	try {
		return new URL(url, WINDOW$3.location.origin).href;
	} catch {
		return;
	}
}
function isPerformanceResourceTiming(entry) {
	return entry.entryType === "resource" && "initiatorType" in entry && typeof entry.nextHopProtocol === "string" && (entry.initiatorType === "fetch" || entry.initiatorType === "xmlhttprequest");
}
function createHeadersSafely(headers) {
	try {
		return new Headers(headers);
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/tracing/request.js
var defaultRequestInstrumentationOptions = {
	traceFetch: true,
	traceXHR: true,
	enableHTTPTimings: true,
	trackFetchStreamPerformance: false
};
function instrumentOutgoingRequests(client, _options) {
	const { traceFetch, traceXHR, shouldCreateSpanForRequest, enableHTTPTimings, tracePropagationTargets, onRequestSpanStart, onRequestSpanEnd } = {
		...defaultRequestInstrumentationOptions,
		..._options
	};
	const shouldCreateSpan = typeof shouldCreateSpanForRequest === "function" ? shouldCreateSpanForRequest : (_) => true;
	const shouldAttachHeadersWithTargets = (url) => shouldAttachHeaders(url, tracePropagationTargets);
	const spans = {};
	const propagateTraceparent = client.getOptions().propagateTraceparent;
	if (traceFetch) addFetchInstrumentationHandler((handlerData) => {
		const createdSpan = instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans, {
			propagateTraceparent,
			onRequestSpanEnd
		});
		if (createdSpan) {
			const fullUrl = getFullURL(handlerData.fetchData.url);
			const host = fullUrl ? parseUrl(fullUrl).host : void 0;
			const sanitizedFullUrl = fullUrl ? stripDataUrlContent(fullUrl) : void 0;
			createdSpan.setAttributes({
				"http.url": sanitizedFullUrl,
				"url.full": sanitizedFullUrl,
				"server.address": host
			});
			if (enableHTTPTimings) addHTTPTimings(createdSpan, client);
			onRequestSpanStart?.(createdSpan, { headers: handlerData.headers });
		}
	});
	if (traceXHR) addXhrInstrumentationHandler((handlerData) => {
		const createdSpan = xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans, propagateTraceparent, onRequestSpanEnd);
		if (createdSpan) {
			if (enableHTTPTimings) addHTTPTimings(createdSpan, client);
			onRequestSpanStart?.(createdSpan, { headers: createHeadersSafely(handlerData.xhr.__sentry_xhr_v3__?.request_headers) });
		}
	});
}
var HTTP_TIMING_WAIT_MS = 300;
function addHTTPTimings(span, client) {
	const { url } = spanToJSON(span).data;
	if (!url || typeof url !== "string") return;
	let onEntryFound = () => void setTimeout(unsubscribePerformanceObsever);
	if (hasSpanStreamingEnabled(client)) {
		const originalEnd = span.end.bind(span);
		span.end = (endTimestamp) => {
			const capturedEndTimestamp = endTimestamp ?? timestampInSeconds();
			let isEnded = false;
			const endSpanAndCleanup = () => {
				if (isEnded) return;
				isEnded = true;
				setTimeout(unsubscribePerformanceObsever);
				originalEnd(capturedEndTimestamp);
				clearTimeout(fallbackTimeout);
			};
			onEntryFound = endSpanAndCleanup;
			const fallbackTimeout = setTimeout(endSpanAndCleanup, HTTP_TIMING_WAIT_MS);
		};
	}
	const unsubscribePerformanceObsever = addPerformanceInstrumentationHandler("resource", ({ entries }) => {
		entries.forEach((entry) => {
			if (isPerformanceResourceTiming(entry) && entry.name.endsWith(url)) {
				span.setAttributes(resourceTimingToSpanAttributes(entry));
				onEntryFound();
			}
		});
	});
}
function shouldAttachHeaders(targetUrl, tracePropagationTargets) {
	const href = getLocationHref();
	if (!href) {
		const isRelativeSameOriginRequest = !!targetUrl.match(/^\/(?!\/)/);
		if (!tracePropagationTargets) return isRelativeSameOriginRequest;
		else return stringMatchesSomePattern(targetUrl, tracePropagationTargets);
	} else {
		let resolvedUrl;
		let currentOrigin;
		try {
			resolvedUrl = new URL(targetUrl, href);
			currentOrigin = new URL(href).origin;
		} catch {
			return false;
		}
		const isSameOriginRequest = resolvedUrl.origin === currentOrigin;
		if (!tracePropagationTargets) return isSameOriginRequest;
		else return stringMatchesSomePattern(resolvedUrl.toString(), tracePropagationTargets) || isSameOriginRequest && stringMatchesSomePattern(resolvedUrl.pathname, tracePropagationTargets);
	}
}
function xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeaders2, spans, propagateTraceparent, onRequestSpanEnd) {
	const xhr = handlerData.xhr;
	const sentryXhrData = xhr?.[SENTRY_XHR_DATA_KEY];
	if (!xhr || xhr.__sentry_own_request__ || !sentryXhrData) return;
	const { url, method } = sentryXhrData;
	const shouldCreateSpanResult = hasSpansEnabled() && shouldCreateSpan(url);
	if (handlerData.endTimestamp) {
		const spanId = xhr.__sentry_xhr_span_id__;
		if (!spanId) return;
		const span2 = spans[spanId];
		if (span2) {
			if (shouldCreateSpanResult && sentryXhrData.status_code !== void 0) {
				setHttpStatus(span2, sentryXhrData.status_code);
				span2.end();
				onRequestSpanEnd?.(span2, {
					headers: createHeadersSafely(parseXhrResponseHeaders(xhr)),
					error: handlerData.error
				});
			}
			delete spans[spanId];
		}
		return;
	}
	const fullUrl = getFullURL(url);
	const parsedUrl = fullUrl ? parseUrl(fullUrl) : parseUrl(url);
	const sanitizedFullUrl = fullUrl ? stripDataUrlContent(fullUrl) : void 0;
	const urlForSpanName = stripDataUrlContent(stripUrlQueryAndFragment(url));
	const client = getClient();
	const hasParent = !!getActiveSpan();
	const shouldEmitSpan = hasParent || !!client && hasSpanStreamingEnabled(client);
	const span = shouldCreateSpanResult && shouldEmitSpan ? startInactiveSpan({
		name: `${method} ${urlForSpanName}`,
		attributes: {
			url: stripDataUrlContent(url),
			type: "xhr",
			"http.method": method,
			"http.url": sanitizedFullUrl,
			"url.full": sanitizedFullUrl,
			"server.address": parsedUrl?.host,
			[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser",
			[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client",
			...parsedUrl?.search && { "http.query": parsedUrl?.search },
			...parsedUrl?.hash && { "http.fragment": parsedUrl?.hash }
		}
	}) : new SentryNonRecordingSpan();
	const spanForTraceHeaders = spanIsIgnored(span) && hasParent ? void 0 : span;
	if (shouldCreateSpanResult && !shouldEmitSpan) client?.recordDroppedEvent("no_parent_span", "span");
	xhr.__sentry_xhr_span_id__ = span.spanContext().spanId;
	spans[xhr.__sentry_xhr_span_id__] = span;
	if (shouldAttachHeaders2(url)) addTracingHeadersToXhrRequest(xhr, hasSpansEnabled() && shouldEmitSpan ? spanForTraceHeaders : void 0, propagateTraceparent);
	if (client) client.emit("beforeOutgoingRequestSpan", span, handlerData);
	return span;
}
function addTracingHeadersToXhrRequest(xhr, span, propagateTraceparent) {
	const { "sentry-trace": sentryTrace, baggage, traceparent } = getTraceData({
		span,
		propagateTraceparent
	});
	if (sentryTrace) setHeaderOnXhr(xhr, sentryTrace, baggage, traceparent);
}
function setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader, traceparentHeader) {
	const originalHeaders = xhr.__sentry_xhr_v3__?.request_headers;
	if (originalHeaders?.["sentry-trace"] || !xhr.setRequestHeader) return;
	try {
		xhr.setRequestHeader("sentry-trace", sentryTraceHeader);
		if (traceparentHeader && !originalHeaders?.["traceparent"]) xhr.setRequestHeader("traceparent", traceparentHeader);
		if (sentryBaggageHeader) {
			const originalBaggageHeader = originalHeaders?.["baggage"];
			if (!originalBaggageHeader || !baggageHeaderHasSentryValues(originalBaggageHeader)) xhr.setRequestHeader("baggage", sentryBaggageHeader);
		}
	} catch {}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/fetchStreamPerformance.js
var responseToStreamSpan = /* @__PURE__ */ new WeakMap();
var responseToFallbackTimeout = /* @__PURE__ */ new WeakMap();
var STREAM_RESOLVE_FALLBACK_MS = 9e4;
var STREAMING_CONTENT_TYPES = [
	"text/event-stream",
	"application/x-ndjson",
	"application/stream+json"
];
var fetchStreamPerformanceIntegration = defineIntegration(() => {
	return {
		name: "FetchStreamPerformance",
		setup() {
			addFetchEndInstrumentationHandler((handlerData) => {
				if (handlerData.response) {
					const streamSpan = responseToStreamSpan.get(handlerData.response);
					if (streamSpan && handlerData.endTimestamp) {
						streamSpan.end(handlerData.endTimestamp);
						const fallbackTimeout = responseToFallbackTimeout.get(handlerData.response);
						if (fallbackTimeout) clearTimeout(fallbackTimeout);
					}
				}
			});
			addFetchInstrumentationHandler((handlerData) => {
				if (handlerData.endTimestamp && handlerData.response) {
					const contentType = handlerData.response.headers?.get("content-type") || "";
					if (handlerData.response.headers?.get("content-length") || !STREAMING_CONTENT_TYPES.some((t) => contentType.startsWith(t))) return;
					const url = handlerData.fetchData?.url || "";
					const method = handlerData.fetchData?.method || "GET";
					const parsedUrl = parseStringToURLObject(url);
					const streamSpan = startInactiveSpan({
						name: `${method} ${url.startsWith("data:") ? stripDataUrlContent(url) : parsedUrl ? getSanitizedUrlStringFromUrlObject(parsedUrl) : url}`,
						startTime: handlerData.endTimestamp,
						attributes: {
							url: stripDataUrlContent(url),
							"http.method": method,
							type: "fetch",
							[SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client.stream",
							[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.browser.stream"
						}
					});
					responseToStreamSpan.set(handlerData.response, streamSpan);
					const fallbackTimeout = setTimeout(() => {
						if (streamSpan.isRecording()) streamSpan.end();
					}, STREAM_RESOLVE_FALLBACK_MS);
					responseToFallbackTimeout.set(handlerData.response, fallbackTimeout);
				}
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/webVitals.js
var WEB_VITALS_INTEGRATION_NAME = "WebVitals";
var webVitalsIntegration = defineIntegration((options = {}) => {
	const ignored = new Set(options.ignore ?? []);
	return {
		name: WEB_VITALS_INTEGRATION_NAME,
		setup(client) {
			const spanStreamingEnabled = hasSpanStreamingEnabled(client);
			const { enableStandaloneClsSpans, enableStandaloneLcpSpans } = options._experiments ?? {};
			const recordClsStandaloneSpans = spanStreamingEnabled || ignored.has("cls") ? void 0 : enableStandaloneClsSpans || false;
			const recordLcpStandaloneSpans = spanStreamingEnabled || ignored.has("lcp") ? void 0 : enableStandaloneLcpSpans || false;
			const finalizeWebVitals = startTrackingWebVitals({
				recordClsStandaloneSpans,
				recordLcpStandaloneSpans,
				client
			});
			const pageloadSpans = /* @__PURE__ */ new WeakSet();
			client.on("afterStartPageLoadSpan", (span) => {
				pageloadSpans.add(span);
			});
			client.on("spanEnd", (span) => {
				if (!pageloadSpans.delete(span)) return;
				finalizeWebVitals();
				addWebVitalsToSpan(span, {
					recordClsOnPageloadSpan: recordClsStandaloneSpans === false,
					recordLcpOnPageloadSpan: recordLcpStandaloneSpans === false,
					spanStreamingEnabled
				});
			});
			if (spanStreamingEnabled) {
				if (!ignored.has("lcp")) trackLcpAsSpan(client);
				if (!ignored.has("cls")) trackClsAsSpan(client);
				if (!ignored.has("inp")) trackInpAsSpan();
			} else if (!ignored.has("inp")) startTrackingINP();
		},
		afterAllSetup() {
			if (!ignored.has("inp")) registerInpInteractionListener();
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/tracing/backgroundtab.js
function registerBackgroundTabDetection() {
	if (WINDOW$3.document) WINDOW$3.document.addEventListener("visibilitychange", () => {
		const activeSpan = getActiveSpan();
		if (!activeSpan) return;
		const rootSpan = getRootSpan(activeSpan);
		if (WINDOW$3.document.hidden && rootSpan) {
			const cancelledStatus = "cancelled";
			const { op, status } = spanToJSON(rootSpan);
			if (DEBUG_BUILD) debug.log(`[Tracing] Transaction: ${cancelledStatus} -> since tab moved to the background, op: ${op}`);
			if (!status) rootSpan.setStatus({
				code: 2,
				message: cancelledStatus
			});
			rootSpan.setAttribute("sentry.cancellation_reason", "document.hidden");
			rootSpan.end();
		}
	});
	else DEBUG_BUILD && debug.warn("[Tracing] Could not set up background tab detection due to lack of global document");
}
var PREVIOUS_TRACE_KEY = "sentry_previous_trace";
var PREVIOUS_TRACE_TMP_SPAN_ATTRIBUTE = "sentry.previous_trace";
function linkTraces(client, { linkPreviousTrace, consistentTraceSampling }) {
	const useSessionStorage = linkPreviousTrace === "session-storage";
	let inMemoryPreviousTraceInfo = useSessionStorage ? getPreviousTraceFromSessionStorage() : void 0;
	client.on("spanStart", (span) => {
		if (getRootSpan(span) !== span) return;
		const oldPropagationContext = getCurrentScope().getPropagationContext();
		inMemoryPreviousTraceInfo = addPreviousTraceSpanLink(inMemoryPreviousTraceInfo, span, oldPropagationContext);
		if (useSessionStorage) storePreviousTraceInSessionStorage(inMemoryPreviousTraceInfo);
	});
	let isFirstTraceOnPageload = true;
	if (consistentTraceSampling) client.on("beforeSampling", (mutableSamplingContextData) => {
		if (!inMemoryPreviousTraceInfo) return;
		const scope = getCurrentScope();
		const currentPropagationContext = scope.getPropagationContext();
		if (isFirstTraceOnPageload && currentPropagationContext.parentSpanId) {
			isFirstTraceOnPageload = false;
			return;
		}
		scope.setPropagationContext({
			...currentPropagationContext,
			dsc: {
				...currentPropagationContext.dsc,
				sample_rate: String(inMemoryPreviousTraceInfo.sampleRate),
				sampled: String(spanContextSampled(inMemoryPreviousTraceInfo.spanContext))
			},
			sampleRand: inMemoryPreviousTraceInfo.sampleRand
		});
		mutableSamplingContextData.parentSampled = spanContextSampled(inMemoryPreviousTraceInfo.spanContext);
		mutableSamplingContextData.parentSampleRate = inMemoryPreviousTraceInfo.sampleRate;
		mutableSamplingContextData.spanAttributes = {
			...mutableSamplingContextData.spanAttributes,
			[SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE]: inMemoryPreviousTraceInfo.sampleRate
		};
	});
}
function addPreviousTraceSpanLink(previousTraceInfo, span, oldPropagationContext) {
	const spanJson = spanToJSON(span);
	function getSampleRate() {
		try {
			const oldSampleRate = Number(spanJson.data?.["sentry.sample_rate"] ?? oldPropagationContext.dsc?.sample_rate);
			return Number.isNaN(oldSampleRate) ? 0 : oldSampleRate;
		} catch {
			return 0;
		}
	}
	const updatedPreviousTraceInfo = {
		spanContext: span.spanContext(),
		startTimestamp: spanJson.start_timestamp,
		sampleRate: getSampleRate(),
		sampleRand: oldPropagationContext.sampleRand
	};
	if (!previousTraceInfo) return updatedPreviousTraceInfo;
	const previousTraceSpanCtx = previousTraceInfo.spanContext;
	if (previousTraceSpanCtx.traceId === spanJson.trace_id) return previousTraceInfo;
	if (Date.now() / 1e3 - previousTraceInfo.startTimestamp <= 3600) {
		if (DEBUG_BUILD) debug.log(`Adding previous_trace \`${JSON.stringify(previousTraceSpanCtx)}\` link to span \`${JSON.stringify({
			op: spanJson.op,
			...span.spanContext()
		})}\``);
		span.addLink({
			context: previousTraceSpanCtx,
			attributes: { [SEMANTIC_LINK_ATTRIBUTE_LINK_TYPE]: "previous_trace" }
		});
		span.setAttribute(PREVIOUS_TRACE_TMP_SPAN_ATTRIBUTE, `${previousTraceSpanCtx.traceId}-${previousTraceSpanCtx.spanId}-${spanContextSampled(previousTraceSpanCtx) ? 1 : 0}`);
	}
	return updatedPreviousTraceInfo;
}
function storePreviousTraceInSessionStorage(previousTraceInfo) {
	try {
		WINDOW$3.sessionStorage.setItem(PREVIOUS_TRACE_KEY, JSON.stringify(previousTraceInfo));
	} catch (e) {
		DEBUG_BUILD && debug.warn("Could not store previous trace in sessionStorage", e);
	}
}
function getPreviousTraceFromSessionStorage() {
	try {
		const previousTraceInfo = WINDOW$3.sessionStorage?.getItem(PREVIOUS_TRACE_KEY);
		return JSON.parse(previousTraceInfo);
	} catch {
		return;
	}
}
function spanContextSampled(ctx) {
	return ctx.traceFlags === 1;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/tracing/browserTracingIntegration.js
var BROWSER_TRACING_INTEGRATION_ID = "BrowserTracing";
var BOT_USER_AGENT_RE = /Googlebot|Google-InspectionTool|Storebot-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Facebot|facebookexternalhit|LinkedInBot|Twitterbot|Applebot/i;
function isBotUserAgent() {
	const nav = WINDOW$3.navigator;
	if (!nav?.userAgent) return false;
	return BOT_USER_AGENT_RE.test(nav.userAgent);
}
var DEFAULT_BROWSER_TRACING_OPTIONS = {
	...TRACING_DEFAULTS,
	instrumentNavigation: true,
	instrumentPageLoad: true,
	markBackgroundSpan: true,
	enableLongTask: true,
	enableLongAnimationFrame: true,
	enableInp: true,
	ignoreResourceSpans: [],
	ignorePerformanceApiSpans: [],
	detectRedirects: true,
	linkPreviousTrace: "in-memory",
	consistentTraceSampling: false,
	enableReportPageLoaded: false,
	_experiments: {},
	...defaultRequestInstrumentationOptions
};
var browserTracingIntegration = ((options = {}) => {
	if ("enableElementTiming" in options) consoleSandbox(() => {
		console.warn("[Sentry] `enableElementTiming` is deprecated and no longer has any effect. Use the standalone `elementTimingIntegration` instead.");
	});
	const latestRoute = {
		name: void 0,
		source: void 0
	};
	const optionalWindowDocument = WINDOW$3.document;
	const { enableInp, enableLongTask, enableLongAnimationFrame, _experiments: { enableInteractions, enableStandaloneClsSpans, enableStandaloneLcpSpans }, beforeStartSpan, idleTimeout, finalTimeout, childSpanTimeout, markBackgroundSpan, traceFetch, traceXHR, trackFetchStreamPerformance, shouldCreateSpanForRequest, enableHTTPTimings, ignoreResourceSpans, ignorePerformanceApiSpans, instrumentPageLoad, instrumentNavigation, detectRedirects, linkPreviousTrace, consistentTraceSampling, enableReportPageLoaded, onRequestSpanStart, onRequestSpanEnd } = {
		...DEFAULT_BROWSER_TRACING_OPTIONS,
		...options
	};
	const _isBot = isBotUserAgent();
	let lastInteractionTimestamp;
	let _pageloadSpan;
	function _createRouteSpan(client, startSpanOptions, makeActive = true, url) {
		const isPageloadSpan = startSpanOptions.op === "pageload";
		const initialSpanName = startSpanOptions.name;
		const finalStartSpanOptions = beforeStartSpan ? beforeStartSpan(startSpanOptions) : startSpanOptions;
		const urlObject = parseStringToURLObject(url || getLocationHref());
		const attributes = {
			...urlObject?.pathname && { ["url.path"]: urlObject.pathname },
			...urlObject && !isURLObjectRelative(urlObject) && { ["url.full"]: urlObject.href },
			...finalStartSpanOptions.attributes
		};
		if (initialSpanName !== finalStartSpanOptions.name) attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "custom";
		finalStartSpanOptions.attributes = attributes;
		if (!makeActive) {
			const now = dateTimestampInSeconds();
			startInactiveSpan({
				...finalStartSpanOptions,
				startTime: now
			}).end(now);
			return;
		}
		latestRoute.name = finalStartSpanOptions.name;
		latestRoute.source = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
		const idleSpan = startIdleSpan(finalStartSpanOptions, {
			idleTimeout,
			finalTimeout,
			childSpanTimeout,
			disableAutoFinish: isPageloadSpan,
			beforeSpanEnd: (span) => {
				addPerformanceEntries(span, {
					ignoreResourceSpans,
					ignorePerformanceApiSpans,
					spanStreamingEnabled: hasSpanStreamingEnabled(client)
				});
				setActiveIdleSpan(client, void 0);
				const scope = getCurrentScope();
				const oldPropagationContext = scope.getPropagationContext();
				scope.setPropagationContext({
					...oldPropagationContext,
					traceId: idleSpan.spanContext().traceId,
					sampled: spanIsSampled(idleSpan),
					dsc: getDynamicSamplingContextFromSpan(span)
				});
				if (isPageloadSpan) _pageloadSpan = void 0;
			},
			trimIdleSpanEndTimestamp: !enableReportPageLoaded
		});
		if (isPageloadSpan && enableReportPageLoaded) _pageloadSpan = idleSpan;
		setActiveIdleSpan(client, idleSpan);
		function emitFinish() {
			if (optionalWindowDocument && ["interactive", "complete"].includes(optionalWindowDocument.readyState)) {
				client.emit("idleSpanEnableAutoFinish", idleSpan);
				optionalWindowDocument.removeEventListener("readystatechange", emitFinish);
			}
		}
		if (isPageloadSpan && !enableReportPageLoaded && optionalWindowDocument) {
			optionalWindowDocument.addEventListener("readystatechange", emitFinish);
			emitFinish();
		}
	}
	return {
		name: BROWSER_TRACING_INTEGRATION_ID,
		setup(client) {
			if (_isBot) {
				DEBUG_BUILD && debug.log("[Tracing] Skipping browserTracingIntegration setup for bot user agent.");
				return;
			}
			registerSpanErrorInstrumentation();
			if (enableLongAnimationFrame && GLOBAL_OBJ.PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")) startTrackingLongAnimationFrames();
			else if (enableLongTask) startTrackingLongTasks();
			if (enableInteractions) startTrackingInteractions();
			if (detectRedirects && optionalWindowDocument) {
				const interactionHandler = () => {
					lastInteractionTimestamp = timestampInSeconds();
				};
				addEventListener("click", interactionHandler, { capture: true });
				addEventListener("keydown", interactionHandler, {
					capture: true,
					passive: true
				});
			}
			function maybeEndActiveSpan() {
				const activeSpan = getActiveIdleSpan(client);
				if (activeSpan && !spanToJSON(activeSpan).timestamp) {
					DEBUG_BUILD && debug.log(`[Tracing] Finishing current active span with op: ${spanToJSON(activeSpan).op}`);
					activeSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, "cancelled");
					activeSpan.end();
				}
			}
			client.on("startNavigationSpan", (startSpanOptions, navigationOptions) => {
				if (getClient() !== client) return;
				if (navigationOptions?.isRedirect) {
					DEBUG_BUILD && debug.warn("[Tracing] Detected redirect, navigation span will not be the root span, but a child span.");
					_createRouteSpan(client, {
						op: "navigation.redirect",
						...startSpanOptions
					}, false, navigationOptions.url);
					return;
				}
				lastInteractionTimestamp = void 0;
				maybeEndActiveSpan();
				getIsolationScope().setPropagationContext({
					traceId: generateTraceId(),
					sampleRand: Math.random(),
					propagationSpanId: hasSpansEnabled() ? void 0 : generateSpanId()
				});
				const scope = getCurrentScope();
				scope.setPropagationContext({
					traceId: generateTraceId(),
					sampleRand: Math.random(),
					propagationSpanId: hasSpansEnabled() ? void 0 : generateSpanId()
				});
				scope.setSDKProcessingMetadata({ normalizedRequest: void 0 });
				_createRouteSpan(client, {
					op: "navigation",
					...startSpanOptions,
					parentSpan: null,
					forceTransaction: true
				}, true, navigationOptions?.url);
			});
			client.on("startPageLoadSpan", (startSpanOptions, traceOptions = {}) => {
				if (getClient() !== client) return;
				maybeEndActiveSpan();
				const propagationContext = propagationContextFromHeaders(traceOptions.sentryTrace || getMetaContent("sentry-trace") || getServerTiming("sentry-trace"), traceOptions.baggage || getMetaContent("baggage") || getServerTiming("baggage"));
				const scope = getCurrentScope();
				scope.setPropagationContext(propagationContext);
				if (!hasSpansEnabled()) scope.getPropagationContext().propagationSpanId = generateSpanId();
				scope.setSDKProcessingMetadata({ normalizedRequest: getHttpRequestData() });
				_createRouteSpan(client, {
					op: "pageload",
					...startSpanOptions
				});
			});
			client.on("endPageloadSpan", () => {
				if (enableReportPageLoaded && _pageloadSpan) {
					_pageloadSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, "reportPageLoaded");
					_pageloadSpan.end();
				}
			});
		},
		afterAllSetup(client) {
			if (_isBot) return;
			if (client.addIntegration && !client.getIntegrationByName?.("WebVitals")) client.addIntegration(webVitalsIntegration({
				ignore: enableInp ? [] : ["inp"],
				_experiments: {
					enableStandaloneClsSpans,
					enableStandaloneLcpSpans
				}
			}));
			let startingUrl = getLocationHref();
			if (linkPreviousTrace !== "off") linkTraces(client, {
				linkPreviousTrace,
				consistentTraceSampling
			});
			if (WINDOW$3.location) {
				if (instrumentPageLoad) {
					const origin = browserPerformanceTimeOrigin();
					startBrowserTracingPageLoadSpan(client, {
						name: WINDOW$3.location.pathname,
						startTime: origin ? origin / 1e3 : void 0,
						attributes: {
							[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
							[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.pageload.browser"
						}
					});
				}
				if (instrumentNavigation) addHistoryInstrumentationHandler(({ to, from }) => {
					if (from === void 0 && startingUrl?.indexOf(to) !== -1) {
						startingUrl = void 0;
						return;
					}
					startingUrl = void 0;
					const parsed = parseStringToURLObject(to);
					const activeSpan = getActiveIdleSpan(client);
					const navigationIsRedirect = activeSpan && detectRedirects && isRedirect(activeSpan, lastInteractionTimestamp);
					startBrowserTracingNavigationSpan(client, {
						name: parsed?.pathname || WINDOW$3.location.pathname,
						attributes: {
							[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
							[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.browser"
						}
					}, {
						url: to,
						isRedirect: navigationIsRedirect
					});
				});
			}
			if (markBackgroundSpan) registerBackgroundTabDetection();
			if (enableInteractions) registerInteractionListener(client, idleTimeout, finalTimeout, childSpanTimeout, latestRoute);
			instrumentOutgoingRequests(client, {
				traceFetch,
				traceXHR,
				tracePropagationTargets: client.getOptions().tracePropagationTargets,
				shouldCreateSpanForRequest,
				enableHTTPTimings,
				onRequestSpanStart,
				onRequestSpanEnd
			});
			if (trackFetchStreamPerformance) client.addIntegration(fetchStreamPerformanceIntegration());
		}
	};
});
function startBrowserTracingPageLoadSpan(client, spanOptions, traceOptions) {
	client.emit("startPageLoadSpan", spanOptions, traceOptions);
	getCurrentScope().setTransactionName(spanOptions.name);
	const pageloadSpan = getActiveIdleSpan(client);
	if (pageloadSpan) client.emit("afterStartPageLoadSpan", pageloadSpan);
	return pageloadSpan;
}
function startBrowserTracingNavigationSpan(client, spanOptions, options) {
	const { url, isRedirect: isRedirect2 } = options || {};
	client.emit("beforeStartNavigationSpan", spanOptions, {
		isRedirect: isRedirect2,
		url
	});
	client.emit("startNavigationSpan", spanOptions, {
		isRedirect: isRedirect2,
		url
	});
	const scope = getCurrentScope();
	scope.setTransactionName(spanOptions.name);
	if (url && !isRedirect2) scope.setSDKProcessingMetadata({ normalizedRequest: {
		...getHttpRequestData(),
		url
	} });
	return getActiveIdleSpan(client);
}
function getMetaContent(metaName) {
	return (WINDOW$3.document?.querySelector(`meta[name=${metaName}]`))?.getAttribute("content") || void 0;
}
function getServerTiming(name) {
	return ((WINDOW$3.performance?.getEntriesByType?.("navigation")[0])?.serverTiming?.find((entry2) => entry2.name === name))?.description;
}
function registerInteractionListener(client, idleTimeout, finalTimeout, childSpanTimeout, latestRoute) {
	const optionalWindowDocument = WINDOW$3.document;
	let inflightInteractionSpan;
	const registerInteractionTransaction = () => {
		const op = "ui.action.click";
		const activeIdleSpan = getActiveIdleSpan(client);
		if (activeIdleSpan) {
			const currentRootSpanOp = spanToJSON(activeIdleSpan).op;
			if (["navigation", "pageload"].includes(currentRootSpanOp)) {
				DEBUG_BUILD && debug.warn(`[Tracing] Did not create ${op} span because a pageload or navigation span is in progress.`);
				return;
			}
		}
		if (inflightInteractionSpan) {
			inflightInteractionSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_IDLE_SPAN_FINISH_REASON, "interactionInterrupted");
			inflightInteractionSpan.end();
			inflightInteractionSpan = void 0;
		}
		if (!latestRoute.name) {
			DEBUG_BUILD && debug.warn(`[Tracing] Did not create ${op} transaction because _latestRouteName is missing.`);
			return;
		}
		inflightInteractionSpan = startIdleSpan({
			name: latestRoute.name,
			op,
			attributes: { [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: latestRoute.source || "url" }
		}, {
			idleTimeout,
			finalTimeout,
			childSpanTimeout
		});
	};
	if (optionalWindowDocument) addEventListener("click", registerInteractionTransaction, { capture: true });
}
var ACTIVE_IDLE_SPAN_PROPERTY = "_sentry_idleSpan";
function getActiveIdleSpan(client) {
	return client[ACTIVE_IDLE_SPAN_PROPERTY];
}
function setActiveIdleSpan(client, span) {
	addNonEnumerableProperty(client, ACTIVE_IDLE_SPAN_PROPERTY, span);
}
var REDIRECT_THRESHOLD = 1.5;
function isRedirect(activeSpan, lastInteractionTimestamp) {
	const spanData = spanToJSON(activeSpan);
	const now = dateTimestampInSeconds();
	if (now - spanData.start_timestamp > REDIRECT_THRESHOLD) return false;
	if (lastInteractionTimestamp && now - lastInteractionTimestamp <= REDIRECT_THRESHOLD) return false;
	return true;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/tracing/reportPageLoaded.js
function reportPageLoaded(client = getClient()) {
	client?.emit("endPageloadSpan");
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/tracing/setActiveSpan.js
function setActiveSpanInBrowser(span) {
	const maybePreviousActiveSpan = getActiveSpan();
	if (maybePreviousActiveSpan === span) return;
	const scope = getCurrentScope();
	span.end = new Proxy(span.end, { apply(target, thisArg, args) {
		_setSpanForScope(scope, maybePreviousActiveSpan);
		return Reflect.apply(target, thisArg, args);
	} });
	_setSpanForScope(scope, span);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/spanstreaming.js
var spanStreamingIntegration = defineIntegration(() => {
	return {
		name: "SpanStreaming",
		beforeSetup(client) {
			const clientOptions = client.getOptions();
			if (!clientOptions.traceLifecycle) {
				DEBUG_BUILD && debug.log("[SpanStreaming] setting `traceLifecycle` to \"stream\"");
				clientOptions.traceLifecycle = "stream";
			}
		},
		setup(client) {
			const initialMessage = "SpanStreaming integration requires";
			const fallbackMsg = "Falling back to static trace lifecycle.";
			const clientOptions = client.getOptions();
			if (!hasSpanStreamingEnabled(client)) {
				clientOptions.traceLifecycle = "static";
				DEBUG_BUILD && debug.warn(`${initialMessage} \`traceLifecycle\` to be set to "stream"! ${fallbackMsg}`);
				return;
			}
			const beforeSendSpan = clientOptions.beforeSendSpan;
			if (beforeSendSpan && !isStreamedBeforeSendSpanCallback(beforeSendSpan)) {
				clientOptions.traceLifecycle = "static";
				DEBUG_BUILD && debug.warn(`${initialMessage} a beforeSendSpan callback using \`withStreamedSpan\`! ${fallbackMsg}`);
				return;
			}
			const buffer = new SpanBuffer(client);
			client.on("afterSpanEnd", (span) => {
				if (!spanIsSampled(span)) return;
				buffer.add(captureSpan(span, client));
			});
			client.on("afterSegmentSpanEnd", (segmentSpan) => {
				const traceId = segmentSpan.spanContext().traceId;
				setTimeout(() => {
					buffer.flush(traceId);
				}, 500);
			});
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/transports/offline.js
function promisifyRequest(request) {
	return new Promise((resolve, reject) => {
		request.oncomplete = request.onsuccess = () => resolve(request.result);
		request.onabort = request.onerror = () => reject(request.error);
	});
}
function createStore(dbName, storeName) {
	const request = indexedDB.open(dbName);
	request.onupgradeneeded = () => request.result.createObjectStore(storeName);
	const dbp = promisifyRequest(request);
	return (callback) => dbp.then((db) => callback(db.transaction(storeName, "readwrite").objectStore(storeName)));
}
function keys(store) {
	return promisifyRequest(store.getAllKeys());
}
function push(store, value, maxQueueSize) {
	return store((store2) => {
		return keys(store2).then((keys2) => {
			if (keys2.length >= maxQueueSize) return;
			store2.put(value, Math.max(...keys2, 0) + 1);
			return promisifyRequest(store2.transaction);
		});
	});
}
function unshift(store, value, maxQueueSize) {
	return store((store2) => {
		return keys(store2).then((keys2) => {
			if (keys2.length >= maxQueueSize) return;
			store2.put(value, Math.min(...keys2, 0) - 1);
			return promisifyRequest(store2.transaction);
		});
	});
}
function shift(store) {
	return store((store2) => {
		return keys(store2).then((keys2) => {
			const firstKey = keys2[0];
			if (firstKey == null) return;
			return promisifyRequest(store2.get(firstKey)).then((value) => {
				store2.delete(firstKey);
				return promisifyRequest(store2.transaction).then(() => value);
			});
		});
	});
}
function createIndexedDbStore(options) {
	let store;
	function getStore() {
		if (store == void 0) store = createStore(options.dbName || "sentry-offline", options.storeName || "queue");
		return store;
	}
	return {
		push: async (env) => {
			try {
				const serialized = serializeEnvelope(env);
				await push(getStore(), serialized, options.maxQueueSize || 30);
			} catch {}
		},
		unshift: async (env) => {
			try {
				const serialized = serializeEnvelope(env);
				await unshift(getStore(), serialized, options.maxQueueSize || 30);
			} catch {}
		},
		shift: async () => {
			try {
				const deserialized = await shift(getStore());
				if (deserialized) return parseEnvelope(deserialized);
			} catch {}
		}
	};
}
function makeIndexedDbOfflineTransport(createTransport) {
	return (options) => {
		const transport = createTransport({
			...options,
			createStore: createIndexedDbStore
		});
		WINDOW$3.addEventListener("online", async (_) => {
			await transport.flush();
		});
		return transport;
	};
}
function makeBrowserOfflineTransport(createTransport = makeFetchTransport) {
	return makeIndexedDbOfflineTransport(makeOfflineTransport(createTransport));
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/profiling/utils.js
var MS_TO_NS = 1e6;
var isMainThread = "window" in GLOBAL_OBJ && GLOBAL_OBJ.window === GLOBAL_OBJ && typeof importScripts === "undefined";
var PROFILER_THREAD_ID_STRING = String(0);
var PROFILER_THREAD_NAME = isMainThread ? "main" : "worker";
var navigator = WINDOW$3.navigator;
var OS_PLATFORM = "";
var OS_PLATFORM_VERSION = "";
var OS_ARCH = "";
var OS_BROWSER = navigator?.userAgent || "";
var OS_MODEL = "";
var OS_LOCALE = navigator?.language || navigator?.languages?.[0] || "";
function isUserAgentData(data) {
	return typeof data === "object" && data !== null && "getHighEntropyValues" in data;
}
var userAgentData = navigator?.userAgentData;
if (isUserAgentData(userAgentData)) userAgentData.getHighEntropyValues([
	"architecture",
	"model",
	"platform",
	"platformVersion",
	"fullVersionList"
]).then((ua) => {
	OS_PLATFORM = ua.platform || "";
	OS_ARCH = ua.architecture || "";
	OS_MODEL = ua.model || "";
	OS_PLATFORM_VERSION = ua.platformVersion || "";
	if (ua.fullVersionList?.length) {
		const firstUa = ua.fullVersionList[ua.fullVersionList.length - 1];
		OS_BROWSER = `${firstUa.brand} ${firstUa.version}`;
	}
}).catch((e) => void 0);
function isProcessedJSSelfProfile(profile) {
	return !("thread_metadata" in profile);
}
function enrichWithThreadInformation(profile) {
	if (!isProcessedJSSelfProfile(profile)) return profile;
	return convertJSSelfProfileToSampledFormat(profile);
}
function getTraceId(event) {
	const traceId = event.contexts?.trace?.trace_id;
	if (typeof traceId === "string" && traceId.length !== 32) {
		if (DEBUG_BUILD) debug.log(`[Profiling] Invalid traceId: ${traceId} on profiled event`);
	}
	if (typeof traceId !== "string") return "";
	return traceId;
}
function createProfilePayload(profile_id, start_timestamp, processed_profile, event) {
	if (event.type !== "transaction") throw new TypeError("Profiling events may only be attached to transactions, this should never occur.");
	if (processed_profile === void 0 || processed_profile === null) throw new TypeError(`Cannot construct profiling event envelope without a valid profile. Got ${processed_profile} instead.`);
	const traceId = getTraceId(event);
	const enrichedThreadProfile = enrichWithThreadInformation(processed_profile);
	const transactionStartMs = start_timestamp ? start_timestamp : typeof event.start_timestamp === "number" ? event.start_timestamp * 1e3 : timestampInSeconds() * 1e3;
	const transactionEndMs = typeof event.timestamp === "number" ? event.timestamp * 1e3 : timestampInSeconds() * 1e3;
	return {
		event_id: profile_id,
		timestamp: new Date(transactionStartMs).toISOString(),
		platform: "javascript",
		version: "1",
		release: event.release || "",
		environment: event.environment || "production",
		runtime: {
			name: "javascript",
			version: WINDOW$3.navigator.userAgent
		},
		os: {
			name: OS_PLATFORM,
			version: OS_PLATFORM_VERSION,
			build_number: OS_BROWSER
		},
		device: {
			locale: OS_LOCALE,
			model: OS_MODEL,
			manufacturer: OS_BROWSER,
			architecture: OS_ARCH,
			is_emulator: false
		},
		debug_meta: { images: applyDebugMetadata(processed_profile.resources) },
		profile: enrichedThreadProfile,
		transactions: [{
			name: event.transaction || "",
			id: event.event_id || uuid4(),
			trace_id: traceId,
			active_thread_id: PROFILER_THREAD_ID_STRING,
			relative_start_ns: "0",
			relative_end_ns: ((transactionEndMs - transactionStartMs) * 1e6).toFixed(0)
		}]
	};
}
function createProfileChunkPayload(jsSelfProfile, client, profilerId) {
	if (jsSelfProfile == null) throw new TypeError(`Cannot construct profiling event envelope without a valid profile. Got ${jsSelfProfile} instead.`);
	const continuousProfile = convertToContinuousProfile(jsSelfProfile);
	const options = client.getOptions();
	const sdk = client.getSdkMetadata?.()?.sdk;
	return {
		chunk_id: uuid4(),
		client_sdk: {
			name: sdk?.name ?? "sentry.javascript.browser",
			version: sdk?.version ?? "0.0.0"
		},
		profiler_id: profilerId || uuid4(),
		platform: "javascript",
		version: "2",
		release: options.release ?? "",
		environment: options.environment ?? "production",
		debug_meta: { images: applyDebugMetadata(jsSelfProfile.resources) },
		profile: continuousProfile
	};
}
function validateProfileChunk(chunk) {
	try {
		if (!chunk || typeof chunk !== "object") return { reason: "chunk is not an object" };
		const isHex32 = (val) => typeof val === "string" && /^[a-f0-9]{32}$/.test(val);
		if (!isHex32(chunk.profiler_id)) return { reason: "missing or invalid profiler_id" };
		if (!isHex32(chunk.chunk_id)) return { reason: "missing or invalid chunk_id" };
		if (!chunk.client_sdk) return { reason: "missing client_sdk metadata" };
		const profile = chunk.profile;
		if (!profile) return { reason: "missing profile data" };
		if (!Array.isArray(profile.frames) || !profile.frames.length) return { reason: "profile has no frames" };
		if (!Array.isArray(profile.stacks) || !profile.stacks.length) return { reason: "profile has no stacks" };
		if (!Array.isArray(profile.samples) || !profile.samples.length) return { reason: "profile has no samples" };
		return { valid: true };
	} catch (e) {
		return { reason: `unknown validation error: ${e}` };
	}
}
function convertToContinuousProfile(input) {
	const frames = [];
	for (let i = 0; i < input.frames.length; i++) {
		const frame = input.frames[i];
		if (!frame) continue;
		frames[i] = {
			function: frame.name,
			abs_path: typeof frame.resourceId === "number" ? input.resources[frame.resourceId] : void 0,
			lineno: frame.line,
			colno: frame.column
		};
	}
	const stacks = [];
	for (let i = 0; i < input.stacks.length; i++) {
		const stackHead = input.stacks[i];
		if (!stackHead) continue;
		const list = [];
		let current = stackHead;
		while (current) {
			list.push(current.frameId);
			current = current.parentId === void 0 ? void 0 : input.stacks[current.parentId];
		}
		stacks[i] = list;
	}
	const perfOrigin = browserPerformanceTimeOrigin();
	const origin = typeof performance.timeOrigin === "number" ? performance.timeOrigin : perfOrigin || 0;
	const adjustForOriginChange = origin - (perfOrigin || origin);
	const samples = [];
	for (let i = 0; i < input.samples.length; i++) {
		const sample = input.samples[i];
		if (!sample) continue;
		const timestampSeconds = (origin + (sample.timestamp - adjustForOriginChange)) / 1e3;
		samples[i] = {
			stack_id: sample.stackId ?? 0,
			thread_id: PROFILER_THREAD_ID_STRING,
			timestamp: timestampSeconds
		};
	}
	return {
		frames,
		stacks,
		samples,
		thread_metadata: { [PROFILER_THREAD_ID_STRING]: { name: PROFILER_THREAD_NAME } }
	};
}
function isAutomatedPageLoadSpan(span) {
	return spanToJSON(span).op === "pageload";
}
function convertJSSelfProfileToSampledFormat(input) {
	let EMPTY_STACK_ID = void 0;
	let STACK_ID = 0;
	const profile = {
		samples: [],
		stacks: [],
		frames: [],
		thread_metadata: { [PROFILER_THREAD_ID_STRING]: { name: PROFILER_THREAD_NAME } }
	};
	const firstSample = input.samples[0];
	if (!firstSample) return profile;
	const start = firstSample.timestamp;
	const perfOrigin = browserPerformanceTimeOrigin();
	const origin = typeof performance.timeOrigin === "number" ? performance.timeOrigin : perfOrigin || 0;
	const adjustForOriginChange = origin - (perfOrigin || origin);
	input.samples.forEach((jsSample, i) => {
		if (jsSample.stackId === void 0) {
			if (EMPTY_STACK_ID === void 0) {
				EMPTY_STACK_ID = STACK_ID;
				profile.stacks[EMPTY_STACK_ID] = [];
				STACK_ID++;
			}
			profile["samples"][i] = {
				elapsed_since_start_ns: ((jsSample.timestamp + adjustForOriginChange - start) * MS_TO_NS).toFixed(0),
				stack_id: EMPTY_STACK_ID,
				thread_id: PROFILER_THREAD_ID_STRING
			};
			return;
		}
		let stackTop = input.stacks[jsSample.stackId];
		const stack = [];
		while (stackTop) {
			stack.push(stackTop.frameId);
			const frame = input.frames[stackTop.frameId];
			if (frame && profile.frames[stackTop.frameId] === void 0) profile.frames[stackTop.frameId] = {
				function: frame.name,
				abs_path: typeof frame.resourceId === "number" ? input.resources[frame.resourceId] : void 0,
				lineno: frame.line,
				colno: frame.column
			};
			stackTop = stackTop.parentId === void 0 ? void 0 : input.stacks[stackTop.parentId];
		}
		const sample = {
			elapsed_since_start_ns: ((jsSample.timestamp + adjustForOriginChange - start) * MS_TO_NS).toFixed(0),
			stack_id: STACK_ID,
			thread_id: PROFILER_THREAD_ID_STRING
		};
		profile["stacks"][STACK_ID] = stack;
		profile["samples"][i] = sample;
		STACK_ID++;
	});
	return profile;
}
function addProfilesToEnvelope(envelope, profiles) {
	if (!profiles.length) return envelope;
	for (const profile of profiles) envelope[1].push([{ type: "profile" }, profile]);
	return envelope;
}
function findProfiledTransactionsFromEnvelope(envelope) {
	const events = [];
	forEachEnvelopeItem(envelope, (item, type) => {
		if (type !== "transaction") return;
		for (let j = 1; j < item.length; j++) if (item[j]?.contexts?.profile?.profile_id) events.push(item[j]);
	});
	return events;
}
function applyDebugMetadata(resource_paths) {
	const stackParser = (getClient()?.getOptions())?.stackParser;
	if (!stackParser) return [];
	return getDebugImagesForResources(stackParser, resource_paths);
}
function isValidSampleRate(rate) {
	if (typeof rate !== "number" && typeof rate !== "boolean" || typeof rate === "number" && isNaN(rate)) {
		DEBUG_BUILD && debug.warn(`[Profiling] Invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(rate)} of type ${JSON.stringify(typeof rate)}.`);
		return false;
	}
	if (rate === true || rate === false) return true;
	if (rate < 0 || rate > 1) {
		DEBUG_BUILD && debug.warn(`[Profiling] Invalid sample rate. Sample rate must be between 0 and 1. Got ${rate}.`);
		return false;
	}
	return true;
}
function isValidProfile(profile) {
	if (profile.samples.length < 2) {
		if (DEBUG_BUILD) debug.log("[Profiling] Discarding profile because it contains less than 2 samples");
		return false;
	}
	if (!profile.frames.length) {
		if (DEBUG_BUILD) debug.log("[Profiling] Discarding profile because it contains no frames");
		return false;
	}
	return true;
}
var PROFILING_CONSTRUCTOR_FAILED = false;
var MAX_PROFILE_DURATION_MS = 3e4;
function isJSProfilerSupported(maybeProfiler) {
	return typeof maybeProfiler === "function";
}
function startJSSelfProfile() {
	const JSProfilerConstructor = WINDOW$3.Profiler;
	if (!isJSProfilerSupported(JSProfilerConstructor)) {
		if (DEBUG_BUILD) debug.log("[Profiling] Profiling is not supported by this browser, Profiler interface missing on window object.");
		return;
	}
	const samplingIntervalMS = 10;
	const maxSamples = Math.floor(MAX_PROFILE_DURATION_MS / samplingIntervalMS);
	try {
		return new JSProfilerConstructor({
			sampleInterval: samplingIntervalMS,
			maxBufferSize: maxSamples
		});
	} catch (_e) {
		if (DEBUG_BUILD) {
			debug.log("[Profiling] Failed to initialize the Profiling constructor, this is likely due to a missing 'Document-Policy': 'js-profiling' header.");
			debug.log("[Profiling] Disabling profiling for current user session.");
		}
		PROFILING_CONSTRUCTOR_FAILED = true;
	}
}
function shouldProfileSpanLegacy(span) {
	if (PROFILING_CONSTRUCTOR_FAILED) {
		if (DEBUG_BUILD) debug.log("[Profiling] Profiling has been disabled for the duration of the current user session.");
		return false;
	}
	if (!span.isRecording()) {
		DEBUG_BUILD && debug.log("[Profiling] Discarding profile because root span was not sampled.");
		return false;
	}
	const options = getClient()?.getOptions();
	if (!options) {
		DEBUG_BUILD && debug.log("[Profiling] Profiling disabled, no options found.");
		return false;
	}
	const profilesSampleRate = options.profilesSampleRate;
	if (!isValidSampleRate(profilesSampleRate)) {
		DEBUG_BUILD && debug.warn("[Profiling] Discarding profile because of invalid sample rate.");
		return false;
	}
	if (!profilesSampleRate) {
		DEBUG_BUILD && debug.log("[Profiling] Discarding profile because a negative sampling decision was inherited or profileSampleRate is set to 0");
		return false;
	}
	if (!(profilesSampleRate === true ? true : Math.random() < profilesSampleRate)) {
		DEBUG_BUILD && debug.log(`[Profiling] Discarding profile because it's not included in the random sample (sampling rate = ${Number(profilesSampleRate)})`);
		return false;
	}
	return true;
}
function shouldProfileSession(options) {
	if (PROFILING_CONSTRUCTOR_FAILED) {
		if (DEBUG_BUILD) debug.log("[Profiling] Profiling has been disabled for the duration of the current user session as the JS Profiler could not be started.");
		return false;
	}
	if (options.profileLifecycle !== "trace" && options.profileLifecycle !== "manual") {
		DEBUG_BUILD && debug.warn("[Profiling] Session not sampled. Invalid `profileLifecycle` option.");
		return false;
	}
	const profileSessionSampleRate = options.profileSessionSampleRate;
	if (!isValidSampleRate(profileSessionSampleRate)) {
		DEBUG_BUILD && debug.warn("[Profiling] Discarding profile because of invalid profileSessionSampleRate.");
		return false;
	}
	if (!profileSessionSampleRate) {
		DEBUG_BUILD && debug.log("[Profiling] Discarding profile because profileSessionSampleRate is not defined or set to 0");
		return false;
	}
	return Math.random() <= profileSessionSampleRate;
}
function hasLegacyProfiling(options) {
	return typeof options.profilesSampleRate !== "undefined";
}
function createProfilingEvent(profile_id, start_timestamp, profile, event) {
	if (!isValidProfile(profile)) return null;
	return createProfilePayload(profile_id, start_timestamp, profile, event);
}
var PROFILE_MAP = /* @__PURE__ */ new Map();
function getActiveProfilesCount() {
	return PROFILE_MAP.size;
}
function takeProfileFromGlobalCache(profile_id) {
	const profile = PROFILE_MAP.get(profile_id);
	if (profile) PROFILE_MAP.delete(profile_id);
	return profile;
}
function addProfileToGlobalCache(profile_id, profile) {
	PROFILE_MAP.set(profile_id, profile);
	if (PROFILE_MAP.size > 30) {
		const last = PROFILE_MAP.keys().next().value;
		if (last !== void 0) PROFILE_MAP.delete(last);
	}
}
var PROFILED_ROOT_SPANS = /* @__PURE__ */ new WeakSet();
function setThreadAttributes(span) {
	span.setAttribute("thread.id", PROFILER_THREAD_ID_STRING);
	span.setAttribute("thread.name", PROFILER_THREAD_NAME);
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/profiling/startProfileForSpan.js
function startProfileForSpan(span) {
	let startTimestamp;
	if (isAutomatedPageLoadSpan(span)) startTimestamp = timestampInSeconds() * 1e3;
	const profiler = startJSSelfProfile();
	if (!profiler) return;
	if (DEBUG_BUILD) debug.log(`[Profiling] started profiling span: ${spanToJSON(span).description}`);
	const profileId = uuid4();
	let processedProfile = null;
	getCurrentScope().setContext("profile", {
		profile_id: profileId,
		start_timestamp: startTimestamp
	});
	PROFILED_ROOT_SPANS.add(span);
	setThreadAttributes(span);
	async function onProfileHandler() {
		if (!span) return;
		if (!profiler) return;
		if (processedProfile) {
			if (DEBUG_BUILD) debug.log("[Profiling] profile for:", spanToJSON(span).description, "already exists, returning early");
			return;
		}
		return profiler.stop().then((profile) => {
			if (maxDurationTimeoutID) {
				WINDOW$3.clearTimeout(maxDurationTimeoutID);
				maxDurationTimeoutID = void 0;
			}
			if (DEBUG_BUILD) debug.log(`[Profiling] stopped profiling of span: ${spanToJSON(span).description}`);
			if (!profile) {
				if (DEBUG_BUILD) debug.log(`[Profiling] profiler returned null profile for: ${spanToJSON(span).description}`, "this may indicate an overlapping span or a call to stopProfiling with a profile title that was never started");
				return;
			}
			processedProfile = profile;
			addProfileToGlobalCache(profileId, profile);
		}).catch((error) => {
			if (DEBUG_BUILD) debug.log("[Profiling] error while stopping profiler:", error);
		});
	}
	let maxDurationTimeoutID = WINDOW$3.setTimeout(() => {
		if (DEBUG_BUILD) debug.log("[Profiling] max profile duration elapsed, stopping profiling for:", spanToJSON(span).description);
		onProfileHandler();
	}, MAX_PROFILE_DURATION_MS);
	const originalEnd = span.end.bind(span);
	function profilingWrappedSpanEnd() {
		if (!span) return originalEnd();
		onProfileHandler().then(() => {
			originalEnd();
		}, () => {
			originalEnd();
		});
		return span;
	}
	span.end = profilingWrappedSpanEnd;
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/profiling/UIProfiler.js
var CHUNK_INTERVAL_MS = 6e4;
var MAX_ROOT_SPAN_PROFILE_MS = 3e5;
var UIProfiler = class {
	constructor() {
		this._client = void 0;
		this._profiler = void 0;
		this._chunkTimer = void 0;
		this._profilerId = void 0;
		this._isRunning = false;
		this._sessionSampled = false;
		this._lifecycleMode = void 0;
		this._activeRootSpanIds = /* @__PURE__ */ new Set();
		this._rootSpanTimeouts = /* @__PURE__ */ new Map();
	}
	/**
	* Initialize the profiler with client, session sampling and lifecycle mode.
	*/
	initialize(client) {
		const lifecycleMode = client.getOptions().profileLifecycle;
		const sessionSampled = shouldProfileSession(client.getOptions());
		DEBUG_BUILD && debug.log(`[Profiling] Initializing profiler (lifecycle='${lifecycleMode}').`);
		if (!sessionSampled) DEBUG_BUILD && debug.log("[Profiling] Session not sampled. Skipping lifecycle profiler initialization.");
		this._profilerId = uuid4();
		this._client = client;
		this._sessionSampled = sessionSampled;
		this._lifecycleMode = lifecycleMode;
		if (lifecycleMode === "trace") this._setupTraceLifecycleListeners(client);
		client.on("spanStart", (span) => {
			if (this._isRunning) setThreadAttributes(span);
		});
	}
	/** Starts UI profiling (only effective in 'manual' mode and when sampled). */
	start() {
		if (this._lifecycleMode === "trace") {
			DEBUG_BUILD && debug.warn("[Profiling] `profileLifecycle` is set to \"trace\". Calls to `uiProfiler.start()` are ignored in trace mode.");
			return;
		}
		if (this._isRunning) {
			DEBUG_BUILD && debug.warn("[Profiling] Profile session is already running, `uiProfiler.start()` is a no-op.");
			return;
		}
		if (!this._sessionSampled) {
			DEBUG_BUILD && debug.warn("[Profiling] Session is not sampled, `uiProfiler.start()` is a no-op.");
			return;
		}
		this._beginProfiling();
	}
	/** Stops UI profiling (only effective in 'manual' mode). */
	stop() {
		if (this._lifecycleMode === "trace") {
			DEBUG_BUILD && debug.warn("[Profiling] `profileLifecycle` is set to \"trace\". Calls to `uiProfiler.stop()` are ignored in trace mode.");
			return;
		}
		if (!this._isRunning) {
			DEBUG_BUILD && debug.warn("[Profiling] Profiler is not running, `uiProfiler.stop()` is a no-op.");
			return;
		}
		this._endProfiling();
	}
	/** Handle an already-active root span at integration setup time (used only in trace mode). */
	notifyRootSpanActive(rootSpan) {
		if (this._lifecycleMode !== "trace" || !this._sessionSampled) return;
		const spanId = rootSpan.spanContext().spanId;
		if (!spanId || this._activeRootSpanIds.has(spanId)) return;
		this._registerTraceRootSpan(spanId);
		const rootSpanCount = this._activeRootSpanIds.size;
		if (rootSpanCount === 1) {
			DEBUG_BUILD && debug.log("[Profiling] Detected already active root span during setup. Active root spans now:", rootSpanCount);
			this._beginProfiling();
		}
		if (this._isRunning) setThreadAttributes(rootSpan);
	}
	/**
	* Begin profiling if not already running.
	*/
	_beginProfiling() {
		if (this._isRunning) return;
		this._isRunning = true;
		DEBUG_BUILD && debug.log("[Profiling] Started profiling with profiler ID:", this._profilerId);
		getGlobalScope().setContext("profile", { profiler_id: this._profilerId });
		this._startProfilerInstance();
		if (!this._profiler) {
			DEBUG_BUILD && debug.log("[Profiling] Failed to start JS Profiler; stopping.");
			this._resetProfilerInfo();
			return;
		}
		this._startPeriodicChunking();
	}
	/** End profiling session; final chunk will be collected and sent. */
	_endProfiling() {
		if (!this._isRunning) return;
		this._isRunning = false;
		if (this._chunkTimer) {
			clearTimeout(this._chunkTimer);
			this._chunkTimer = void 0;
		}
		this._clearAllRootSpanTimeouts();
		this._collectCurrentChunk().catch((e) => {
			DEBUG_BUILD && debug.error("[Profiling] Failed to collect current profile chunk on `stop()`:", e);
		});
		if (this._lifecycleMode === "manual") getGlobalScope().setContext("profile", {});
	}
	/** Trace-mode: attach spanStart/spanEnd listeners. */
	_setupTraceLifecycleListeners(client) {
		client.on("spanStart", (span) => {
			if (!this._sessionSampled) {
				DEBUG_BUILD && debug.log("[Profiling] Span not profiled because of negative sampling decision for user session.");
				return;
			}
			if (span !== getRootSpan(span)) return;
			if (!span.isRecording()) {
				DEBUG_BUILD && debug.log("[Profiling] Discarding profile because root span was not sampled.");
				return;
			}
			const spanId = span.spanContext().spanId;
			if (!spanId || this._activeRootSpanIds.has(spanId)) return;
			this._registerTraceRootSpan(spanId);
			const rootSpanCount = this._activeRootSpanIds.size;
			if (rootSpanCount === 1) {
				DEBUG_BUILD && debug.log(`[Profiling] Root span ${spanId} started. Profiling active while there are active root spans (count=${rootSpanCount}).`);
				this._beginProfiling();
			}
		});
		client.on("spanEnd", (span) => {
			if (!this._sessionSampled) return;
			const spanId = span.spanContext().spanId;
			if (!spanId || !this._activeRootSpanIds.has(spanId)) return;
			this._activeRootSpanIds.delete(spanId);
			const rootSpanCount = this._activeRootSpanIds.size;
			DEBUG_BUILD && debug.log(`[Profiling] Root span with ID ${spanId} ended. Will continue profiling for as long as there are active root spans (currently: ${rootSpanCount}).`);
			if (rootSpanCount === 0) {
				this._collectCurrentChunk().catch((e) => {
					DEBUG_BUILD && debug.error("[Profiling] Failed to collect current profile chunk on last `spanEnd`:", e);
				});
				this._endProfiling();
			}
		});
	}
	/**
	* Resets profiling information from scope and resets running state (used on failure)
	*/
	_resetProfilerInfo() {
		this._isRunning = false;
		getGlobalScope().setContext("profile", {});
	}
	/**
	* Clear and reset all per-root-span timeouts.
	*/
	_clearAllRootSpanTimeouts() {
		this._rootSpanTimeouts.forEach((timeout) => clearTimeout(timeout));
		this._rootSpanTimeouts.clear();
	}
	/** Keep track of root spans and schedule safeguard timeout (trace mode). */
	_registerTraceRootSpan(spanId) {
		this._activeRootSpanIds.add(spanId);
		const timeout = setTimeout(() => this._onRootSpanTimeout(spanId), MAX_ROOT_SPAN_PROFILE_MS);
		this._rootSpanTimeouts.set(spanId, timeout);
	}
	/**
	* Start a profiler instance if needed.
	*/
	_startProfilerInstance() {
		if (this._profiler?.stopped === false) return;
		const profiler = startJSSelfProfile();
		if (!profiler) {
			DEBUG_BUILD && debug.log("[Profiling] Failed to start JS Profiler.");
			return;
		}
		this._profiler = profiler;
	}
	/**
	* Schedule the next 60s chunk while running.
	* Each tick collects a chunk and restarts the profiler.
	* A chunk should be closed when there are no active root spans anymore OR when the maximum chunk interval is reached.
	*/
	_startPeriodicChunking() {
		if (!this._isRunning) return;
		this._chunkTimer = setTimeout(() => {
			this._collectCurrentChunk().catch((e) => {
				DEBUG_BUILD && debug.error("[Profiling] Failed to collect current profile chunk during periodic chunking:", e);
			});
			if (this._isRunning) {
				this._startProfilerInstance();
				if (!this._profiler) {
					this._resetProfilerInfo();
					return;
				}
				this._startPeriodicChunking();
			}
		}, CHUNK_INTERVAL_MS);
	}
	/**
	* Handle timeout for a specific root span ID to avoid indefinitely running profiler if `spanEnd` never fires.
	* If this was the last active root span, collect the current chunk and stop profiling.
	*/
	_onRootSpanTimeout(rootSpanId) {
		if (!this._rootSpanTimeouts.has(rootSpanId)) return;
		this._rootSpanTimeouts.delete(rootSpanId);
		if (!this._activeRootSpanIds.has(rootSpanId)) return;
		DEBUG_BUILD && debug.log(`[Profiling] Reached 5-minute timeout for root span ${rootSpanId}. You likely started a manual root span that never called \`.end()\`.`);
		this._activeRootSpanIds.delete(rootSpanId);
		if (this._activeRootSpanIds.size === 0) this._endProfiling();
	}
	/**
	* Stop current profiler instance, convert profile to chunk & send.
	*/
	async _collectCurrentChunk() {
		const prevProfiler = this._profiler;
		this._profiler = void 0;
		if (!prevProfiler) return;
		try {
			const chunk = createProfileChunkPayload(await prevProfiler.stop(), this._client, this._profilerId);
			const validationReturn = validateProfileChunk(chunk);
			if ("reason" in validationReturn) {
				DEBUG_BUILD && debug.log("[Profiling] Discarding invalid profile chunk (this is probably a bug in the SDK):", validationReturn.reason);
				return;
			}
			this._sendProfileChunk(chunk);
			DEBUG_BUILD && debug.log("[Profiling] Collected browser profile chunk.");
		} catch (e) {
			DEBUG_BUILD && debug.log("[Profiling] Error while stopping JS Profiler for chunk:", e);
		}
	}
	/**
	* Send a profile chunk as a standalone envelope.
	*/
	_sendProfileChunk(chunk) {
		const client = this._client;
		const sdkInfo = getSdkMetadataForEnvelopeHeader(client.getSdkMetadata?.());
		const dsn = client.getDsn();
		const tunnel = client.getOptions().tunnel;
		const envelope = createEnvelope({
			event_id: uuid4(),
			sent_at: (/* @__PURE__ */ new Date()).toISOString(),
			...sdkInfo && { sdk: sdkInfo },
			...!!tunnel && dsn && { dsn: dsnToString(dsn) }
		}, [[{
			type: "profile_chunk",
			platform: "javascript"
		}, chunk]]);
		client.sendEnvelope(envelope).then(null, (reason) => {
			DEBUG_BUILD && debug.error("Error while sending profile chunk envelope:", reason);
		});
	}
};
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/profiling/integration.js
var INTEGRATION_NAME$2 = "BrowserProfiling";
var _browserProfilingIntegration = (() => {
	return {
		name: INTEGRATION_NAME$2,
		setup(client) {
			const options = client.getOptions();
			const profiler = new UIProfiler();
			if (!hasLegacyProfiling(options) && !options.profileLifecycle) options.profileLifecycle = "manual";
			if (hasLegacyProfiling(options) && !options.profilesSampleRate) {
				DEBUG_BUILD && debug.log("[Profiling] Profiling disabled, no profiling options found.");
				return;
			}
			const activeSpan = getActiveSpan();
			const rootSpan = activeSpan && getRootSpan(activeSpan);
			if (hasLegacyProfiling(options) && options.profileSessionSampleRate !== void 0) DEBUG_BUILD && debug.warn("[Profiling] Both legacy profiling (`profilesSampleRate`) and UI profiling settings are defined. `profileSessionSampleRate` has no effect when legacy profiling is enabled.");
			if (!hasLegacyProfiling(options)) {
				const lifecycleMode = options.profileLifecycle;
				client.on("startUIProfiler", () => profiler.start());
				client.on("stopUIProfiler", () => profiler.stop());
				if (lifecycleMode === "manual") profiler.initialize(client);
				else if (lifecycleMode === "trace") {
					if (!hasSpansEnabled(options)) {
						DEBUG_BUILD && debug.warn("[Profiling] `profileLifecycle` is 'trace' but tracing is disabled. Set a `tracesSampleRate` or `tracesSampler` to enable span tracing.");
						return;
					}
					profiler.initialize(client);
					if (rootSpan) profiler.notifyRootSpanActive(rootSpan);
					WINDOW$3.setTimeout(() => {
						const laterActiveSpan = getActiveSpan();
						const laterRootSpan = laterActiveSpan && getRootSpan(laterActiveSpan);
						if (laterRootSpan) profiler.notifyRootSpanActive(laterRootSpan);
					}, 0);
				}
			} else {
				if (rootSpan && isAutomatedPageLoadSpan(rootSpan)) {
					if (shouldProfileSpanLegacy(rootSpan)) startProfileForSpan(rootSpan);
				}
				client.on("spanStart", (span) => {
					const rootSpan2 = getRootSpan(span);
					if (span === rootSpan2) {
						if (shouldProfileSpanLegacy(span)) startProfileForSpan(span);
					} else if (PROFILED_ROOT_SPANS.has(rootSpan2)) setThreadAttributes(span);
				});
				client.on("beforeEnvelope", (envelope) => {
					if (!getActiveProfilesCount()) return;
					const profiledTransactionEvents = findProfiledTransactionsFromEnvelope(envelope);
					if (!profiledTransactionEvents.length) return;
					const profilesToAddToEnvelope = [];
					for (const profiledTransaction of profiledTransactionEvents) {
						const context = profiledTransaction?.contexts;
						const profile_id = context?.profile?.["profile_id"];
						const start_timestamp = context?.profile?.["start_timestamp"];
						if (typeof profile_id !== "string") {
							DEBUG_BUILD && debug.log("[Profiling] cannot find profile for a span without a profile context");
							continue;
						}
						if (!profile_id) {
							DEBUG_BUILD && debug.log("[Profiling] cannot find profile for a span without a profile context");
							continue;
						}
						if (context?.profile) delete context.profile;
						const profile = takeProfileFromGlobalCache(profile_id);
						if (!profile) {
							DEBUG_BUILD && debug.log(`[Profiling] Could not retrieve profile for span: ${profile_id}`);
							continue;
						}
						const profileEvent = createProfilingEvent(profile_id, start_timestamp, profile, profiledTransaction);
						if (profileEvent) profilesToAddToEnvelope.push(profileEvent);
					}
					addProfilesToEnvelope(envelope, profilesToAddToEnvelope);
				});
			}
		}
	};
});
var browserProfilingIntegration = defineIntegration(_browserProfilingIntegration);
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/spotlight.js
var INTEGRATION_NAME$1 = "SpotlightBrowser";
var SPOTLIGHT_IGNORE_SPANS = [{
	op: "ui.interaction.click",
	name: "#sentry-spotlight"
}];
var _spotlightIntegration = ((options = {}) => {
	const sidecarUrl = options.sidecarUrl || "http://localhost:8969/stream";
	return {
		name: INTEGRATION_NAME$1,
		setup: () => {
			DEBUG_BUILD && debug.log("Using Sidecar URL", sidecarUrl);
		},
		beforeSetup(client) {
			const opts = client.getOptions();
			opts.ignoreSpans = [...opts.ignoreSpans || [], ...SPOTLIGHT_IGNORE_SPANS];
		},
		afterAllSetup: (client) => {
			setupSidecarForwarding(client, sidecarUrl);
		}
	};
});
function setupSidecarForwarding(client, sidecarUrl) {
	const makeFetch = getNativeImplementation("fetch");
	let failCount = 0;
	client.on("beforeEnvelope", (envelope) => {
		if (failCount > 3) {
			debug.warn("[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests:", failCount);
			return;
		}
		makeFetch(sidecarUrl, {
			method: "POST",
			body: serializeEnvelope(envelope),
			headers: { "Content-Type": "application/x-sentry-envelope" },
			mode: "cors"
		}).then((res) => {
			if (res.status >= 200 && res.status < 400) failCount = 0;
		}, (err) => {
			failCount++;
			debug.error("Sentry SDK can't connect to Sidecar is it running? See: https://spotlightjs.com/sidecar/npx/", err);
		});
	});
}
var spotlightBrowserIntegration = defineIntegration(_spotlightIntegration);
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/featureFlags/launchdarkly/integration.js
var launchDarklyIntegration = defineIntegration(() => {
	return {
		name: "LaunchDarkly",
		processEvent(event, _hint, _client) {
			return _INTERNAL_copyFlagsFromScopeToEvent(event);
		}
	};
});
function buildLaunchDarklyFlagUsedHandler() {
	return {
		name: "sentry-flag-auditor",
		type: "flag-used",
		synchronous: true,
		/**
		* Handle a flag evaluation by storing its name and value on the current scope.
		*/
		method: (flagKey, flagDetail, _context) => {
			_INTERNAL_insertFlagToScope(flagKey, flagDetail.value);
			_INTERNAL_addFeatureFlagToActiveSpan(flagKey, flagDetail.value);
		}
	};
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/featureFlags/openfeature/integration.js
var openFeatureIntegration = defineIntegration(() => {
	return {
		name: "OpenFeature",
		processEvent(event, _hint, _client) {
			return _INTERNAL_copyFlagsFromScopeToEvent(event);
		}
	};
});
var OpenFeatureIntegrationHook = class {
	/**
	* Successful evaluation result.
	*/
	after(_hookContext, evaluationDetails) {
		_INTERNAL_insertFlagToScope(evaluationDetails.flagKey, evaluationDetails.value);
		_INTERNAL_addFeatureFlagToActiveSpan(evaluationDetails.flagKey, evaluationDetails.value);
	}
	/**
	* On error evaluation result.
	*/
	error(hookContext, _error, _hookHints) {
		_INTERNAL_insertFlagToScope(hookContext.flagKey, hookContext.defaultValue);
		_INTERNAL_addFeatureFlagToActiveSpan(hookContext.flagKey, hookContext.defaultValue);
	}
};
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/featureFlags/unleash/integration.js
var unleashIntegration = defineIntegration(({ featureFlagClientClass: unleashClientClass }) => {
	return {
		name: "Unleash",
		setupOnce() {
			const unleashClientPrototype = unleashClientClass.prototype;
			fill(unleashClientPrototype, "isEnabled", _wrappedIsEnabled);
		},
		processEvent(event, _hint, _client) {
			return _INTERNAL_copyFlagsFromScopeToEvent(event);
		}
	};
});
function _wrappedIsEnabled(original) {
	return function(...args) {
		const toggleName = args[0];
		const result = original.apply(this, args);
		if (typeof toggleName === "string" && typeof result === "boolean") {
			_INTERNAL_insertFlagToScope(toggleName, result);
			_INTERNAL_addFeatureFlagToActiveSpan(toggleName, result);
		} else if (DEBUG_BUILD) debug.error(`[Feature Flags] UnleashClient.isEnabled does not match expected signature. arg0: ${toggleName} (${typeof toggleName}), result: ${result} (${typeof result})`);
		return result;
	};
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/featureFlags/growthbook/integration.js
var growthbookIntegration = (({ growthbookClass }) => growthbookIntegration$1({ growthbookClass }));
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/featureFlags/statsig/integration.js
var statsigIntegration = defineIntegration(({ featureFlagClient: statsigClient }) => {
	return {
		name: "Statsig",
		setup(_client) {
			statsigClient.on("gate_evaluation", (event) => {
				_INTERNAL_insertFlagToScope(event.gate.name, event.gate.value);
				_INTERNAL_addFeatureFlagToActiveSpan(event.gate.name, event.gate.value);
			});
		},
		processEvent(event, _hint, _client) {
			return _INTERNAL_copyFlagsFromScopeToEvent(event);
		}
	};
});
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/diagnose-sdk.js
async function diagnoseSdkConnectivity() {
	const client = getClient();
	if (!client) return "no-client-active";
	if (!client.getDsn()) return "no-dsn-configured";
	const url = client.getOptions().tunnel || "https://o447951.ingest.sentry.io/api/4509632503087104/envelope/?sentry_version=7&sentry_key=c1dfb07d783ad5325c245c1fd3725390&sentry_client=sentry.javascript.browser%2F1.33.7";
	try {
		await suppressTracing(() => fetch(url, {
			body: "{}",
			method: "POST",
			mode: "cors",
			credentials: "omit"
		}));
	} catch {
		return "sentry-unreachable";
	}
}
//#endregion
//#region node_modules/@sentry/browser/build/npm/esm/prod/integrations/webWorker.js
var INTEGRATION_NAME = "WebWorker";
var webWorkerIntegration = defineIntegration(({ worker }) => ({
	name: INTEGRATION_NAME,
	setupOnce: () => {
		(Array.isArray(worker) ? worker : [worker]).forEach((w) => listenForSentryMessages(w));
	},
	addWorker: (worker2) => listenForSentryMessages(worker2)
}));
function listenForSentryMessages(worker) {
	worker.addEventListener("message", (event) => {
		if (isSentryMessage(event.data)) {
			event.stopImmediatePropagation();
			if (event.data._sentryDebugIds) {
				DEBUG_BUILD && debug.log("Sentry debugId web worker message received", event.data);
				WINDOW$3._sentryDebugIds = {
					...event.data._sentryDebugIds,
					...WINDOW$3._sentryDebugIds
				};
			}
			if (event.data._sentryModuleMetadata) {
				DEBUG_BUILD && debug.log("Sentry module metadata web worker message received", event.data);
				WINDOW$3._sentryModuleMetadata = {
					...event.data._sentryModuleMetadata,
					...WINDOW$3._sentryModuleMetadata
				};
			}
			if (event.data._sentryWasmImages) {
				DEBUG_BUILD && debug.log("Sentry WASM images web worker message received", event.data);
				const existingImages = WINDOW$3._sentryWasmImages || [];
				const newImages = event.data._sentryWasmImages.filter((newImg) => isPlainObject(newImg) && typeof newImg.code_file === "string" && !existingImages.some((existing) => existing.code_file === newImg.code_file));
				WINDOW$3._sentryWasmImages = [...existingImages, ...newImages];
			}
			if (event.data._sentryWorkerError) {
				DEBUG_BUILD && debug.log("Sentry worker rejection message received", event.data._sentryWorkerError);
				handleForwardedWorkerRejection(event.data._sentryWorkerError);
			}
		}
	});
}
function handleForwardedWorkerRejection(workerError) {
	const client = getClient();
	if (!client) return;
	const stackParser = client.getOptions().stackParser;
	const attachStacktrace = client.getOptions().attachStacktrace;
	const error = workerError.reason;
	const event = isPrimitive(error) ? _eventFromRejectionWithPrimitive(error) : eventFromUnknownInput(stackParser, error, void 0, attachStacktrace, true);
	event.level = "error";
	if (workerError.filename) event.contexts = {
		...event.contexts,
		worker: { filename: workerError.filename }
	};
	captureEvent(event, {
		originalException: error,
		mechanism: {
			handled: false,
			type: "auto.browser.web_worker.onunhandledrejection"
		}
	});
	DEBUG_BUILD && debug.log("Captured worker unhandled rejection", error);
}
function registerWebWorker({ self }) {
	self.postMessage({
		_sentryMessage: true,
		_sentryDebugIds: self._sentryDebugIds ?? void 0,
		_sentryModuleMetadata: self._sentryModuleMetadata ?? void 0
	});
	self.addEventListener("unhandledrejection", (event) => {
		const serializedError = {
			reason: _getUnhandledRejectionError(event),
			filename: self.location?.href
		};
		self.postMessage({
			_sentryMessage: true,
			_sentryWorkerError: serializedError
		});
		DEBUG_BUILD && debug.log("[Sentry Worker] Forwarding unhandled rejection to parent", serializedError);
	});
	DEBUG_BUILD && debug.log("[Sentry Worker] Registered worker with unhandled rejection handling");
}
function isSentryMessage(eventData) {
	if (!isPlainObject(eventData) || eventData._sentryMessage !== true) return false;
	const hasDebugIds = "_sentryDebugIds" in eventData;
	const hasModuleMetadata = "_sentryModuleMetadata" in eventData;
	const hasWorkerError = "_sentryWorkerError" in eventData;
	const hasWasmImages = "_sentryWasmImages" in eventData;
	if (!hasDebugIds && !hasModuleMetadata && !hasWorkerError && !hasWasmImages) return false;
	if (hasDebugIds && !(isPlainObject(eventData._sentryDebugIds) || eventData._sentryDebugIds === void 0)) return false;
	if (hasModuleMetadata && !(isPlainObject(eventData._sentryModuleMetadata) || eventData._sentryModuleMetadata === void 0)) return false;
	if (hasWorkerError && !isPlainObject(eventData._sentryWorkerError)) return false;
	if (hasWasmImages && (!Array.isArray(eventData._sentryWasmImages) || !eventData._sentryWasmImages.every((img) => isPlainObject(img) && typeof img.code_file === "string"))) return false;
	return true;
}
//#endregion
export { getBodyString as $, getSpanDescendants as $a, ri as $i, As as $n, makeWeakRef as $o, Tl as $r, stripDataUrlContent as $t, showReportDialog as A, setSegmentSpanCaptureStrategy as Aa, ht as Ai, endSession as An, SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE as Ao, Le as Ar, triggerHandlers$1 as As, _INTERNAL_addFeatureFlagToActiveSpan as At, browserSessionIntegration as B, isStreamedBeforeSendSpanCallback as Ba, ma as Bi, setExtras as Bn, getCurrentScope as Bo, Pe as Br, SDK_VERSION as Bs, applyAggregateErrorsToEvent as Bt, defaultRequestInstrumentationOptions as C, startSpanManual as Ca, au as Ci, addEventProcessor as Cn, setCapturedScopesOnSpan as Co, Il as Cr, wrapMethod as Cs, sendFeedback as Ct, contextLinesIntegration as D, handleCallbackErrors as Da, fe as Di, captureMessage as Dn, setHttpStatus as Do, Ka as Dr, isPrimitive as Ds, captureFeedback as Dt, graphqlClientIntegration as E, sampleSpan as Ea, er as Ei, captureException as En, getSpanStatusFromHttpCode as Eo, Jl as Er, isPlainObject as Es, SpanBuffer as Et, normalizeStringifyValue as F, createEnvelope as Fa, ju as Fi, setAttribute as Fn, SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE as Fo, Nt as Fr, CONSOLE_LEVELS as Fs, addConsoleInstrumentationFilter as Ft, defaultStackLineParsers as G, SentryNonRecordingSpan as Ga, oa as Gi, withMonitor as Gn, withScope as Go, Ra as Gr, getTraceData as Gt, breadcrumbsIntegration as H, getDynamicSamplingContextFromScope as Ha, na as Hi, setTags as Hn, getIsolationScope as Ho, Qo as Hr, DEBUG_BUILD$3 as Hs, inboundFiltersIntegration as Ht, linkedErrorsIntegration as I, createEventEnvelopeHeaders as Ia, ka as Ii, setAttributes as In, SEMANTIC_ATTRIBUTE_SENTRY_SOURCE as Io, Oa as Ir, consoleSandbox as Is, addConsoleInstrumentationHandler as It, opera10StackLineParser as J, registerSpanErrorInstrumentation as Ja, pu as Ji, resolvedSyncPromise as Jn, getDefaultCurrentScope as Jo, Se as Jr, getHttpSpanDetailsFromUrlObject as Jt, defaultStackParser as K, shouldIgnoreSpan as Ka, ou as Ki, prepareEvent as Kn, getAsyncContextStrategy as Ko, Re as Kr, applySdkMetadata as Kt, httpContextIntegration as L, forEachEnvelopeItem as La, ke as Li, setContext as Ln, SEMANTIC_ATTRIBUTE_URL_FULL as Lo, Oe as Lr, debug as Ls, eventFromMessage$1 as Lt, getDefaultIntegrations as M, timedEventsToMeasurements as Ma, ir as Mi, isEnabled as Mn, SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME as Mo, Ma as Mr, getFramesFromEvent as Ms, _INTERNAL_insertFlagToScope as Mt, init as N, logSpanEnd as Na, jr as Ni, isInitialized as Nn, SEMANTIC_ATTRIBUTE_SENTRY_OP as No, Me as Nr, normalizeStackTracePath as Ns, dedupeIntegration as Nt, httpClientIntegration as O, hasSpanStreamingEnabled as Oa, fl as Oi, captureSession as On, GEN_AI_CONVERSATION_ID_ATTRIBUTE as Oo, Kt as Or, isThenable as Os, conversationIdIntegration as Ot, onLoad as P, logSpanStart as Pa, jt as Pi, lastEventId as Pn, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN as Po, Ne as Pr, stackParserFromStackParserOptions as Ps, severityLevelFromString as Pt, makeFetchTransport as Q, getRootSpan as Qa, rc as Qi, Ae as Qn, derefWeakRef as Qo, Te as Qr, parseUrl as Qt, globalHandlersIntegration as R, getSdkMetadataForEnvelopeHeader as Ra, la as Ri, setConversationId as Rn, SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS as Ro, Ol as Rr, originalConsoleMethods as Rs, eventFromUnknownInput$1 as Rt, fetchStreamPerformanceIntegration as S, startSpan as Sa, ar as Si, safeUnref as Sn, markSpanForOtelSourceInference as So, Ie as Sr, markFunctionWrapped as Ss, getFeedback as St, viewHierarchyIntegration as T, withActiveSpan as Ta, dl as Ti, captureEvent as Tn, spanSourceWasExplicitlySet as To, Is as Tr, isObjectLike as Ts, getBreadcrumbLogLevelFromHttpStatusCode as Tt, createUserFeedbackEnvelope as U, getDynamicSamplingContextFromSpan as Ua, ni as Ui, setUser as Un, getTraceContextFromScope as Uo, Qt as Ur, functionToStringIntegration as Ut, browserApiErrorsIntegration as V, withStreamedSpan as Va, ml as Vi, setTag as Vn, getGlobalScope as Vo, Pt as Vr, GLOBAL_OBJ as Vs, eventFiltersIntegration as Vt, chromeStackLineParser as W, spanToBaggageHeader as Wa, ns as Wi, startSession as Wn, withIsolationScope as Wo, Qu as Wr, addBreadcrumb as Wt, winjsStackLineParser as X, convertSpanLinksForEnvelope as Xa, qe as Xi, safeSetSpanJSONAttributes as Xn, Scope as Xo, Sp as Xr, isURLObjectRelative as Xt, opera11StackLineParser as Y, addChildSpanToSpan as Ya, qa as Yi, captureSpan as Yn, getDefaultIsolationScope as Yo, Sl as Yr, getSanitizedUrlString as Yt, uiProfiler as Z, getActiveSpan as Za, qr as Zi, $e as Zn, _setSpanForScope as Zo, Ss as Zr, parseStringToURLObject as Zt, browserTracingIntegration as _, continueTrace as _a, Zo as _i, addIntegration as _n, dynamicSamplingContextToSentryBaggageHeader as _o, Gr as _r, safeDateNow as _s, exceptionFromError as _t, growthbookIntegration as a, tr as aa, Vu as ai, defaultPiiToCollectionOptions as an, spanToTraceContext as ao, Dt as ar, parseSemver as as, addHistoryInstrumentationHandler as at, startBrowserTracingPageLoadSpan as b, startInactiveSpan as ba, aa as bi, getIntegrationsToSetup as bn, getCapturedScopesOnSpan as bo, Hu as br, fill as bs, lazyLoadIntegration as bt, openFeatureIntegration as c, wt as ca, Ws as ci, createTransport as cn, generateSentryTraceHeader as co, Ee as cr, safeJoin as cs, htmlTreeAsString as ct, spotlightBrowserIntegration as d, yl as da, Xr as di, makePromiseBuffer as dn, shouldContinueTrace as do, Fr as dr, stringify as ds, addLcpInstrumentationHandler as dt, sa as ea, Tp as ei, stripUrlQueryAndFragment as en, getStatusMessage as eo, Ba as er, generateSpanId as es, getFetchRequestArgBody as et, browserProfilingIntegration as f, za as fa, Ya as fi, _INTERNAL_captureMetric as fn, parseSampleRate as fo, Fu as fr, truncate as fs, addPerformanceInstrumentationHandler as ft, reportPageLoaded as g, _INTERNAL_startInactiveSpan as ga, Yu as gi, _getTraceInfoFromScope as gn, baggageHeaderToDynamicSamplingContext as go, Go as gr, setSkipNormalizationHint as gs, eventFromMessage as gt, setActiveSpanInBrowser as h, SUPPRESS_TRACING_KEY as ha, Yr as hi, isBrowser as hn, SENTRY_BAGGAGE_KEY_PREFIX as ho, Gn as hr, setNormalizationDepthOverrideHint as hs, eventFromException as ht, statsigIntegration as i, ti as ia, Vs as ii, Client as in, spanToJSON as io, Dl as ir, addExceptionMechanism as is, setTimeout$1 as it, forceLoad as j, setMeasurement as ja, ii as ji, flush as jn, SEMANTIC_ATTRIBUTE_CACHE_KEY as jo, Lt as jr, createStackParser as js, _INTERNAL_copyFlagsFromScopeToEvent as jt, reportingObserverIntegration as k, getSegmentSpanCaptureStrategy as ka, fp as ki, close as kn, SEMANTIC_ATTRIBUTE_CACHE_HIT as ko, Ku as kr, maybeInstrument as ks, growthbookIntegration$1 as kt, buildLaunchDarklyFlagUsedHandler as l, xe as la, Xn as li, isRateLimited as ln, generateTraceparentHeader as lo, El as lr, snipLine as ls, addClsInstrumentationHandler as lt, spanStreamingIntegration as m, getCombinedScopeData as ma, Yo as mi, _INTERNAL_flushLogsBuffer as mn, dsnToString as mo, Ge as mr, setNormalizeStringifier as ms, BrowserClient as mt, webWorkerIntegration as n, ta as na, Ue as ni, filterKeyValueData as nn, spanIsSentrySpan as no, Ct as nr, browserPerformanceTimeOrigin as ns, serializeFormData as nt, unleashIntegration as o, we as oa, Wa as oi, FILTERED_VALUE as on, spanToTraceHeader as oo, Ea as or, uuid4 as os, addClickKeypressInstrumentationHandler as ot, makeBrowserOfflineTransport as p, zo as pa, Ye as pi, _INTERNAL_captureLog as pn, dsnFromString as po, Ga as pr, normalize as ps, WINDOW$2 as pt, geckoStackLineParser as q, hasSpansEnabled as qa, pa as qi, getFilenameToDebugIdMap as qn, setAsyncContextStrategy as qo, Rs as qr, isSentryRequestUrl as qt, diagnoseSdkConnectivity as r, tc as ra, Vr as ri, setCurrentClient as rn, spanTimeInputToSeconds as ro, De as rr, timestampInSeconds as rs, SENTRY_XHR_DATA_KEY as rt, OpenFeatureIntegrationHook as s, ws as sa, Wo as si, SENSITIVE_COOKIE_NAME_SNIPPETS as sn, updateSpanName as so, Ec as sr, isMatchingPattern as ss, getBrowserPerformanceAPI as st, registerWebWorker as t, si as ta, Ts as ti, parseCookie as tn, spanIsSampled as to, Ce as tr, generateTraceId as ts, parseXhrResponseHeaders as tt, launchDarklyIntegration as u, xs as ua, Xo as ui, updateRateLimits as un, propagationContextFromHeaders as uo, Fe as ur, stringMatchesSomePattern as us, addInpInstrumentationHandler as ut, isBotUserAgent as v, isTracingSuppressed as va, Zr as vi, defineIntegration as vn, mergeBaggageHeaders as vo, Gt as vr, safeMathRandom as vs, feedbackSyncIntegration as vt, instrumentOutgoingRequests as w, suppressTracing as wa, ct as wi, captureCheckIn as wn, spanShouldInferOtelSource as wo, Ip as wr, isError as ws, getLocationHref as wt, webVitalsIntegration as x, startNewTrace as xa, ai as xi, getEnvelopeEndpointWithUrlEncodedAuth as xn, markSpanAsTracerProviderSpan as xo, Ia as xr, getOriginalFunction as xs, WINDOW$3 as xt, startBrowserTracingNavigationSpan as y, spanIsIgnored as ya, _l as yi, extendIntegration as yn, parseBaggageHeader as yo, Ht as yr, addNonEnumerableProperty as ys, feedbackAsyncIntegration as yt, cultureContextIntegration as z, serializeEnvelope as za, lu as zi, setExtra as zn, getClient as zo, Pa as zr, getMainCarrier as zs, exceptionFromError$1 as zt };
