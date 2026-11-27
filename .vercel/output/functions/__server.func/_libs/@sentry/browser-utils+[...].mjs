import { r as __exportAll } from "../../_runtime.mjs";
import { fn as _INTERNAL_captureMetric, ft as addPerformanceInstrumentationHandler, ns as browserPerformanceTimeOrigin, pt as WINDOW, st as getBrowserPerformanceAPI, vn as defineIntegration } from "./browser+[...].mjs";
//#region node_modules/@sentry/core/build/esm/metrics/public-api.js
var public_api_exports = /* @__PURE__ */ __exportAll({
	count: () => count,
	distribution: () => distribution,
	gauge: () => gauge
});
function captureMetric(type, name, value, options) {
	_INTERNAL_captureMetric({
		type,
		name,
		value,
		unit: options?.unit,
		attributes: options?.attributes
	}, { scope: options?.scope });
}
function count(name, value = 1, options) {
	captureMetric("counter", name, value, options);
}
function gauge(name, value, options) {
	captureMetric("gauge", name, value, options);
}
function distribution(name, value, options) {
	captureMetric("distribution", name, value, options);
}
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/metrics/elementTiming.js
var INTEGRATION_NAME = "ElementTiming";
var _elementTimingIntegration = (() => {
	return {
		name: INTEGRATION_NAME,
		setup() {
			if (!getBrowserPerformanceAPI() || !browserPerformanceTimeOrigin()) return;
			addPerformanceInstrumentationHandler("element", ({ entries }) => {
				for (const entry of entries) {
					const elementEntry = entry;
					if (!elementEntry.identifier) continue;
					const identifier = elementEntry.identifier;
					const paintType = elementEntry.name;
					const renderTime = elementEntry.renderTime;
					const loadTime = elementEntry.loadTime;
					const metricAttributes = {
						"sentry.origin": "auto.ui.browser.element_timing",
						"ui.element.identifier": identifier
					};
					if (paintType) metricAttributes["ui.element.paint_type"] = paintType;
					if (elementEntry.id) metricAttributes["ui.element.id"] = elementEntry.id;
					if (elementEntry.element) metricAttributes["ui.element.type"] = elementEntry.element.tagName.toLowerCase();
					if (elementEntry.url) metricAttributes["ui.element.url"] = elementEntry.url;
					if (elementEntry.naturalWidth) metricAttributes["ui.element.width"] = elementEntry.naturalWidth;
					if (elementEntry.naturalHeight) metricAttributes["ui.element.height"] = elementEntry.naturalHeight;
					if (renderTime > 0) distribution(`ui.element.render_time`, renderTime, {
						unit: "millisecond",
						attributes: metricAttributes
					});
					if (loadTime > 0) distribution(`ui.element.load_time`, loadTime, {
						unit: "millisecond",
						attributes: metricAttributes
					});
				}
			});
		}
	};
});
var elementTimingIntegration = defineIntegration(_elementTimingIntegration);
//#endregion
//#region node_modules/@sentry/browser-utils/build/esm/instrument/location.js
function getAbsoluteUrl(urlOrPath) {
	try {
		return new URL(urlOrPath, WINDOW.location.origin).toString();
	} catch {
		return urlOrPath;
	}
}
//#endregion
export { public_api_exports as a, gauge as i, elementTimingIntegration as n, count as r, getAbsoluteUrl as t };
