import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useDebounce } from "./use-debounce-DcLIK4T6.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { L as require_jsx_runtime, M as Slot, d as DialogClose, f as DialogContent, g as DialogTitle, h as DialogPortal, m as DialogOverlay, p as DialogDescription, u as Dialog } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { At as Check, C as Shield, Dt as ChevronRight, F as QrCode, Ft as Boxes, H as Package, It as Bell, K as Minimize2, N as RefreshCcw, O as Search, P as Receipt, Pt as Building2, St as CircleCheck, Tt as CircleAlert, V as PanelLeft, X as LogOut, Z as LoaderCircle, a as Warehouse, c as Users, d as Truck, et as LayoutDashboard, f as TriangleAlert, h as Trash2, ht as CloudOff, i as WifiOff, nt as Info, q as Maximize2, r as Wifi, t as X, v as Star, y as StarOff, yt as Circle } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as formatDateTime } from "./format-DUkOQpcu.mjs";
import { a as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { f as Outlet, g as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as DialogContent$1, t as Dialog$1 } from "./dialog-B8mBdC_P.mjs";
import { i as subscribeNotifications, n as markAllRead, r as notify, t as clearNotifications } from "./notify-UKmo-VDh.mjs";
import { n as useWarehouse, t as WarehouseProvider } from "./use-warehouse-CcCp6zte.mjs";
import { t as useSmartAlerts } from "./use-smart-alerts-D96ssWXG.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Separator } from "./separator-B3hsz7IR.mjs";
import { i as saveCachedRoles, n as isOffline, r as readCachedRoles, t as clearCachedRoles } from "./session-cache-CesiV_L5.mjs";
import { t as useLiveQuery } from "../_libs/dexie-react-hooks.mjs";
import { a as syncNow, c as useSyncEngine, o as useModuleSyncStatus, r as getSyncDB, s as useOnlineStatus, t as MODULE_TABLES } from "./hooks-RLyvvVA0.mjs";
import { n as roleLabels, t as modules } from "./modules-ZARKXi77.mjs";
import { i as Trigger$1, n as Portal, r as Root2$1, t as Content2$1 } from "../_libs/radix-ui__react-popover.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
import { a as Trigger$2, i as Root3, n as Portal$1, r as Provider, t as Content2$2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-3nCQrjhM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Popover = Root2$1;
var PopoverTrigger = Trigger$1;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2$1.displayName;
var iconFor = {
	success: CircleCheck,
	error: CircleAlert,
	warning: TriangleAlert,
	info: Info
};
var colorFor = {
	success: "text-emerald-500",
	error: "text-destructive",
	warning: "text-amber-500",
	info: "text-accent"
};
function NotificationsBell() {
	const [list, setList] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => subscribeNotifications(setList), []);
	const unread = list.filter((n) => !n.read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: (o) => {
			setOpen(o);
			if (o) markAllRead();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground",
				title: "Notifications",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground",
					children: unread > 9 ? "9+" : unread
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
			align: "end",
			className: "w-96 p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "h-7 gap-1 text-xs",
						onClick: () => notify.info("Test", "Le son de notification fonctionne"),
						children: "Tester"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "h-7 gap-1 text-xs",
						onClick: () => clearNotifications(),
						disabled: list.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), " Vider"]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-96 overflow-y-auto",
				children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5" }), "Aucune notification."]
				}), list.map((n) => {
					const Icon = iconFor[n.level];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 border-b border-border/60 px-3 py-2.5 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `mt-0.5 size-4 shrink-0 ${colorFor[n.level]}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-foreground",
									children: n.title
								}),
								n.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: n.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70",
									children: formatDateTime(new Date(n.createdAt))
								})
							]
						})]
					}, n.id);
				})]
			})]
		})]
	});
}
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
/**
* Panneau global de synchronisation, ouvert depuis le header.
* Montre l'état module par module, un bouton "Forcer la synchro" et
* le journal des conflits résolus automatiquement.
*/
function SyncPanel() {
	const online = useOnlineStatus();
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const conflicts = useLiveQuery(async () => getSyncDB().conflicts.orderBy("resolved_at").reverse().limit(20).toArray(), [], []);
	const totalPending = useLiveQuery(async () => getSyncDB().outbox.count(), [], 0);
	const handleSync = async () => {
		setSyncing(true);
		try {
			const r = await syncNow();
			if (r.errors.length > 0) toast.error(`Synchronisation partielle: ${r.errors.length} erreur(s)`);
			else toast.success(`Synchronisation OK — ${r.pushed} envoyé(s), ${r.pulled} reçu(s)`);
		} finally {
			setSyncing(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			className: "relative h-9 gap-1.5 px-2",
			title: "Synchronisation",
			children: [online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-4 text-red-500" }), totalPending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]",
				children: totalPending
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "w-96 p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Synchronisation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [online ? "En ligne" : "Hors ligne", totalPending > 0 && ` • ${totalPending} mutation(s) en attente`]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: handleSync,
				disabled: syncing || !online,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: `size-3.5 mr-1 ${syncing ? "animate-spin" : ""}` }), "Synchroniser"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "max-h-[400px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
						children: "Par module"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-1",
						children: MODULE_TABLES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleRow, { moduleKey: m.key }, m.key))
					}),
					conflicts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
						children: [
							"Conflits résolus (",
							conflicts.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-1 px-2",
						children: conflicts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border p-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono",
									children: c.table
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: new Date(c.resolved_at).toLocaleTimeString("fr-FR")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 text-muted-foreground",
								children: ["Champs gardés : ", c.winning_fields.join(", ") || "—"]
							})]
						}, c.id))
					})] })
				]
			})
		})]
	})] });
}
function ModuleRow({ moduleKey }) {
	const s = useModuleSyncStatus(moduleKey);
	const label = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-2 rounded-full ${s.state === "ok" ? "bg-emerald-500" : s.state === "pending" ? "bg-orange-500" : s.state === "error" ? "bg-red-500" : s.state === "offline" ? "bg-muted-foreground/40" : "bg-muted-foreground/20"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-muted-foreground",
			children: [
				s.pending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mr-2 text-orange-600",
					children: [s.pending, " en attente"]
				}),
				s.errors > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mr-2 text-red-600",
					children: [s.errors, " erreur(s)"]
				}),
				s.lastPullAt && s.state === "ok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(s.lastPullAt).toLocaleTimeString("fr-FR", {
					hour: "2-digit",
					minute: "2-digit"
				}) })
			]
		})]
	});
}
/**
* Bandeau global d'état réseau.
* - Hors-ligne : message permanent rassurant (les saisies sont conservées).
* - Retour en ligne : confirmation brève (3 s) puis disparition.
*/
function OfflineBanner() {
	const online = useOnlineStatus();
	const [showBack, setShowBack] = (0, import_react.useState)(false);
	const [wasOffline, setWasOffline] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!online) {
			setWasOffline(true);
			setShowBack(false);
			return;
		}
		if (wasOffline) {
			setShowBack(true);
			const id = setTimeout(() => setShowBack(false), 3e3);
			return () => clearTimeout(id);
		}
	}, [online, wasOffline]);
	if (!online) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		className: "flex items-center justify-center gap-2 bg-warning px-3 py-2 text-center text-sm font-medium text-warning-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mode hors-ligne — vous pouvez continuer à travailler, vos saisies seront synchronisées au retour du réseau." })]
	});
	if (showBack) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		className: "flex items-center justify-center gap-2 bg-success px-3 py-1.5 text-center text-sm font-medium text-success-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Connexion rétablie — synchronisation en cours…" })]
	});
	return null;
}
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger$2;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2$2.displayName;
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 3600 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = import_react.createContext(null);
function useSidebar() {
	const context = import_react.useContext(SidebarContext);
	if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
	return context;
}
var SidebarProvider = import_react.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = import_react.useState(false);
	const [_open, _setOpen] = import_react.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = import_react.useCallback((value) => {
		const openState = typeof value === "function" ? value(open) : value;
		if (setOpenProp) setOpenProp(openState);
		else _setOpen(openState);
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}, [setOpenProp, open]);
	const toggleSidebar = import_react.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [
		isMobile,
		setOpen,
		setOpenMobile
	]);
	import_react.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);
	const state = open ? "expanded" : "collapsed";
	const contextValue = import_react.useMemo(() => ({
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	}), [
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
			delayDuration: 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					"--sidebar-width": SIDEBAR_WIDTH,
					"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
					...style
				},
				className: cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className),
				ref,
				...props,
				children
			})
		})
	});
});
SidebarProvider.displayName = "SidebarProvider";
var Sidebar = import_react.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	if (collapsible === "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className),
		ref,
		...props,
		children
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: openMobile,
		onOpenChange: setOpenMobile,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			"data-sidebar": "sidebar",
			"data-mobile": "true",
			className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
			style: { "--sidebar-width": SIDEBAR_WIDTH_MOBILE },
			side,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "sr-only",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Sidebar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Displays the mobile sidebar." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-full flex-col",
				children
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "group peer hidden text-sidebar-foreground md:block",
		"data-state": state,
		"data-collapsible": state === "collapsed" ? collapsible : "",
		"data-variant": variant,
		"data-side": side,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className),
			...props,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-sidebar": "sidebar",
				className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
				children
			})
		})]
	});
});
Sidebar.displayName = "Sidebar";
var SidebarTrigger = import_react.forwardRef(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref,
		"data-sidebar": "trigger",
		variant: "ghost",
		size: "icon",
		className: cn("h-7 w-7", className),
		onClick: (event) => {
			onClick?.(event);
			toggleSidebar();
		},
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Toggle Sidebar"
		})]
	});
});
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = import_react.forwardRef(({ className, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		"data-sidebar": "rail",
		"aria-label": "Toggle Sidebar",
		tabIndex: -1,
		onClick: toggleSidebar,
		title: "Toggle Sidebar",
		className: cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className),
		...props
	});
});
SidebarRail.displayName = "SidebarRail";
var SidebarInset = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		ref,
		className: cn("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className),
		...props
	});
});
SidebarInset.displayName = "SidebarInset";
var SidebarInput = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		ref,
		"data-sidebar": "input",
		className: cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className),
		...props
	});
});
SidebarInput.displayName = "SidebarInput";
var SidebarHeader = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "header",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarHeader.displayName = "SidebarHeader";
var SidebarFooter = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "footer",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarFooter.displayName = "SidebarFooter";
var SidebarSeparator = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
		ref,
		"data-sidebar": "separator",
		className: cn("mx-2 w-auto bg-sidebar-border", className),
		...props
	});
});
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "content",
		className: cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
		...props
	});
});
SidebarContent.displayName = "SidebarContent";
var SidebarGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "group",
		className: cn("relative flex w-full min-w-0 flex-col p-2", className),
		...props
	});
});
SidebarGroup.displayName = "SidebarGroup";
var SidebarGroupLabel = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "div", {
		ref,
		"data-sidebar": "group-label",
		className: cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className),
		...props
	});
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
var SidebarGroupAction = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "group-action",
		className: cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarGroupAction.displayName = "SidebarGroupAction";
var SidebarGroupContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "group-content",
	className: cn("w-full text-sm", className),
	...props
}));
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu",
	className: cn("flex w-full min-w-0 flex-col gap-1", className),
	...props
}));
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	"data-sidebar": "menu-item",
	className: cn("group/menu-item relative", className),
	...props
}));
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var SidebarMenuButton = import_react.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();
	const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		ref,
		"data-sidebar": "menu-button",
		"data-size": size,
		"data-active": isActive,
		className: cn(sidebarMenuButtonVariants({
			variant,
			size
		}), className),
		...props
	});
	if (!tooltip) return button;
	if (typeof tooltip === "string") tooltip = { children: tooltip };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: button
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "right",
		align: "center",
		hidden: state !== "collapsed" || isMobile,
		...tooltip
	})] });
});
SidebarMenuButton.displayName = "SidebarMenuButton";
var SidebarMenuAction = import_react.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "menu-action",
		className: cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className),
		...props
	});
});
SidebarMenuAction.displayName = "SidebarMenuAction";
var SidebarMenuBadge = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "menu-badge",
	className: cn("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuBadge.displayName = "SidebarMenuBadge";
var SidebarMenuSkeleton = import_react.forwardRef(({ className, showIcon = false, ...props }, ref) => {
	const width = import_react.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		"data-sidebar": "menu-skeleton",
		className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
		...props,
		children: [showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "size-4 rounded-md",
			"data-sidebar": "menu-skeleton-icon"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "h-4 max-w-(--skeleton-width) flex-1",
			"data-sidebar": "menu-skeleton-text",
			style: { "--skeleton-width": width }
		})]
	});
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
var SidebarMenuSub = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu-sub",
	className: cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuSub.displayName = "SidebarMenuSub";
var SidebarMenuSubItem = import_react.forwardRef(({ ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	...props
}));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = import_react.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "a", {
		ref,
		"data-sidebar": "menu-sub-button",
		"data-size": size,
		"data-active": isActive,
		className: cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
/**
* Badge d'état de synchro pour un module (visible dans la sidebar).
*/
function SyncStatusBadge({ moduleKey, compact }) {
	const s = useModuleSyncStatus(moduleKey);
	const cfg = {
		ok: {
			icon: CircleCheck,
			color: "text-emerald-500",
			label: "Synchronisé"
		},
		pending: {
			icon: LoaderCircle,
			color: "text-orange-500 animate-spin",
			label: `${s.pending} en attente`
		},
		error: {
			icon: TriangleAlert,
			color: "text-red-500",
			label: `${s.errors} en erreur`
		},
		offline: {
			icon: CloudOff,
			color: "text-muted-foreground",
			label: "Hors ligne"
		},
		idle: {
			icon: Circle,
			color: "text-muted-foreground/40",
			label: "Non synchronisé"
		}
	}[s.state];
	const Icon = cfg.icon;
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		title: cfg.label,
		className: cn("inline-flex", cfg.color),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", cfg.color),
		title: cfg.label,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }), (s.pending > 0 || s.errors > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.pending + s.errors })]
	});
}
function AppSidebar({ fullName, email, roles }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const canAccess = (allowed) => roles.length === 0 || roles.some((r) => allowed.includes(r));
	const primaryRole = roles[0];
	async function handleSignOut() {
		await supabase.auth.signOut();
		toast.success("Déconnexion réussie");
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sidebar, {
		collapsible: "icon",
		className: "border-sidebar-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarHeader, {
				className: "border-b border-sidebar-border/60 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground font-bold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
							className: "size-4",
							strokeWidth: 2.5
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col leading-tight group-data-[collapsible=icon]:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold tracking-tight text-sidebar-foreground",
							children: "INDUS-ERP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50",
							children: "Stock industriel"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {
				className: "py-2",
				children: modules.map((group) => {
					const visibleItems = group.items.filter((i) => canAccess(i.roles));
					if (visibleItems.length === 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupLabel, {
						className: "text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40",
						children: group.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenu, { children: visibleItems.map((item) => {
						const active = pathname === item.to || pathname.startsWith(item.to + "/");
						const Icon = item.icon;
						const modKey = item.to.replace(/^\//, "");
						const hasSync = MODULE_TABLES.some((m) => m.key === modKey);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuButton, {
							asChild: true,
							isActive: active,
							tooltip: item.title,
							className: "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1",
										children: item.title
									}),
									hasSync && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "group-data-[collapsible=icon]:hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncStatusBadge, { moduleKey: modKey })
									})
								]
							})
						}) }, item.to);
					}) }) })] }, group.label);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFooter, {
				className: "border-t border-sidebar-border/60 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-md p-2 group-data-[collapsible=icon]:justify-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground",
							children: (fullName || email || "?").slice(0, 2).toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-hidden group-data-[collapsible=icon]:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs font-semibold text-sidebar-foreground",
								children: fullName || email || "Utilisateur"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[10px] font-medium uppercase tracking-wider text-accent",
								children: primaryRole ? roleLabels[primaryRole] : "—"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleSignOut,
							className: "rounded p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group-data-[collapsible=icon]:hidden",
							title: "Déconnexion",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
						})
					]
				})
			})
		]
	});
}
/**
* Utilisateur courant + rôles.
*
* Résilient hors-ligne :
* - la session est lue localement (`getSession`) et non via le réseau ;
* - les rôles sont mis en cache et réutilisés si la requête échoue
*   (coupure réseau). Les droits réels restent contrôlés côté serveur.
*/
function useCurrentUser() {
	const [state, setState] = (0, import_react.useState)({
		user: null,
		roles: [],
		loading: true
	});
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function load(user) {
			if (!user) {
				clearCachedRoles();
				if (!cancelled) setState({
					user: null,
					roles: [],
					loading: false
				});
				return;
			}
			const cached = readCachedRoles(user.id);
			if (cached && !cancelled) setState({
				user,
				roles: cached,
				loading: false
			});
			if (isOffline() && cached) return;
			try {
				const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
				if (cancelled) return;
				if (error) throw error;
				const roles = (data ?? []).map((r) => r.role);
				saveCachedRoles(user.id, roles);
				setState({
					user,
					roles,
					loading: false
				});
			} catch {
				if (cancelled) return;
				setState({
					user,
					roles: cached ?? [],
					loading: false
				});
			}
		}
		supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			load(session?.user ?? null);
		});
		return () => {
			cancelled = true;
			sub.subscription.unsubscribe();
		};
	}, []);
	return state;
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function WarehouseSelector() {
	const { warehouses, selectedWarehouseId, setSelectedWarehouseId, isLoading } = useWarehouse();
	const { roles } = useCurrentUser();
	const isProprio = roles.includes("proprietaire");
	const selected = warehouses.find((w) => w.id === selectedWarehouseId);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		disabled: true,
		className: "h-9 gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Warehouse, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: "Chargement…"
		})]
	});
	if (warehouses.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		disabled: true,
		className: "h-9 gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Warehouse, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: "Aucun entrepôt"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			className: "h-9 gap-2 px-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden min-w-0 truncate sm:inline max-w-[140px]",
				children: selectedWarehouseId === "all" && isProprio ? "Tous les entrepôts" : selected?.name ?? "Entrepôt"
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-64",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Filtrer par entrepôt" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			isProprio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: () => setSelectedWarehouseId("all"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex-1",
					children: "Tous les entrepôts"
				}), selectedWarehouseId === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })]
			}),
			warehouses.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: () => setSelectedWarehouseId(w.id),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarehouseItem, { w }), selectedWarehouseId === w.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })]
			}, w.id))
		]
	})] });
}
function WarehouseItem({ w }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate font-medium",
			children: w.name
		}), w.code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-[10px] text-muted-foreground",
			children: w.code
		})]
	});
}
var STORAGE_KEY = "indus-erp:kiosk-mode";
/** Écrans autorisés en mode kiosque (caissier). */
var KIOSK_ROUTES = ["/ventes", "/scanner"];
var KioskContext = (0, import_react.createContext)(null);
function KioskProvider({ children }) {
	const [kiosk, setKioskState] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		setKioskState(localStorage.getItem(STORAGE_KEY) === "1");
	}, []);
	const setKiosk = (0, import_react.useCallback)((v) => {
		setKioskState(v);
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
			if (v) document.documentElement.requestFullscreen?.().catch(() => {});
			else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
		}
	}, []);
	const toggleKiosk = (0, import_react.useCallback)(() => setKiosk(!kiosk), [kiosk, setKiosk]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskContext.Provider, {
		value: {
			kiosk,
			setKiosk,
			toggleKiosk
		},
		children
	});
}
function useKiosk() {
	const ctx = (0, import_react.useContext)(KioskContext);
	if (!ctx) throw new Error("useKiosk must be used within KioskProvider");
	return ctx;
}
/**
* Favoris et raccourcis d'un utilisateur, filtrés par rôle actif et par
* entrepôt sélectionné. Un favori sans entrepôt est global (tous entrepôts).
*/
function useFavorites() {
	const qc = useQueryClient();
	const { user, roles } = useCurrentUser();
	const { selectedWarehouseId } = useWarehouse();
	const role = roles[0] ?? null;
	const { data: all = [], isLoading } = useQuery({
		queryKey: ["user-favorites", user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			const { data, error } = await supabase.from("user_favorites").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	const favorites = all.filter((f) => {
		const roleOk = !f.role || !role || f.role === role;
		const whOk = !f.warehouse_id || selectedWarehouseId === "all" || f.warehouse_id === selectedWarehouseId;
		return roleOk && whOk;
	});
	const add = useMutation({
		mutationFn: async (fav) => {
			if (!user?.id) throw new Error("Non authentifié");
			const { error } = await supabase.from("user_favorites").insert({
				user_id: user.id,
				type: fav.type,
				target: fav.target,
				label: fav.label,
				role,
				warehouse_id: fav.scopeWarehouse && selectedWarehouseId !== "all" ? selectedWarehouseId : null,
				sort_order: all.length
			});
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["user-favorites"] })
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("user_favorites").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["user-favorites"] })
	});
	function findByTarget(target) {
		return favorites.find((f) => f.target === target) ?? null;
	}
	return {
		favorites,
		allFavorites: all,
		isLoading,
		add,
		remove,
		findByTarget,
		role
	};
}
function currentModuleTitle(pathname) {
	return modules.flatMap((g) => g.items).find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.title ?? pathname;
}
/** Bouton d'épinglage de l'écran courant (global ou lié à l'entrepôt actif). */
function PinCurrentPageButton() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { add, remove, findByTarget, role } = useFavorites();
	const { selectedWarehouseId, selectedWarehouse } = useWarehouse();
	const existing = findByTarget(pathname);
	const label = currentModuleTitle(pathname);
	if (existing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "sm",
		className: "h-9 px-2 text-accent",
		title: "Retirer des favoris",
		onClick: () => remove.mutate(existing.id, {
			onSuccess: () => toast.success("Retiré des favoris"),
			onError: (e) => toast.error(e.message ?? "Erreur")
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-current" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			className: "h-9 px-2 text-muted-foreground",
			title: "Ajouter aux favoris",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarOff, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-64",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
				className: "text-xs font-normal text-muted-foreground",
				children: [
					"Épingler « ",
					label,
					" »",
					role ? ` pour ${roleLabels[role]}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				onClick: () => add.mutate({
					type: "page",
					target: pathname,
					label
				}, { onSuccess: () => toast.success("Ajouté aux favoris") }),
				children: "Tous les entrepôts"
			}),
			selectedWarehouseId !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: () => add.mutate({
					type: "page",
					target: pathname,
					label: `${label} — ${selectedWarehouse?.name ?? ""}`,
					scopeWarehouse: true
				}, { onSuccess: () => toast.success("Ajouté aux favoris") }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mr-2 size-4" }),
					"Uniquement ",
					selectedWarehouse?.name
				]
			})
		]
	})] });
}
/** Barre « Accès rapide » : favoris de l'utilisateur pour son rôle / entrepôt. */
function FavoritesBar({ className }) {
	const { favorites, remove } = useFavorites();
	if (favorites.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
				children: "Accès rapide"
			}), favorites.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "group inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium transition hover:border-accent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: f.target,
					className: "flex items-center gap-1",
					children: [f.warehouse_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3 text-accent" }), f.label]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Retirer ${f.label}`,
					className: "text-muted-foreground opacity-0 transition group-hover:opacity-100",
					onClick: () => remove.mutate(f.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
				})]
			}, f.id))]
		})
	});
}
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent$1, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command$1, {
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children
			})
		})
	});
};
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
function GlobalCommandPalette({ open, onOpenChange }) {
	const navigate = useNavigate();
	const [rawQuery, setRawQuery] = (0, import_react.useState)("");
	const query = useDebounce(rawQuery, 200);
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const pageResults = (0, import_react.useMemo)(() => modules.flatMap((g) => g.items).filter((m) => m.title.toLowerCase().includes(rawQuery.toLowerCase())).map((m) => ({
		id: `page-${m.to}`,
		type: "page",
		title: m.title,
		to: m.to
	})), [rawQuery]);
	(0, import_react.useEffect)(() => {
		if (!open) {
			setResults([]);
			setRawQuery("");
			return;
		}
		const q = query.trim();
		if (q.length < 2) {
			setResults(pageResults);
			return;
		}
		let cancelled = false;
		setLoading(true);
		async function search() {
			const pattern = `%${q}%`;
			const [{ data: products }, { data: lots }, { data: clients }, { data: suppliers }] = await Promise.all([
				supabase.from("products").select("id, name, sku, barcode").or(`name.ilike.${pattern},sku.ilike.${pattern},barcode.ilike.${pattern}`).limit(5),
				supabase.from("lots").select("id, lot_number, products(name)").ilike("lot_number", pattern).limit(5),
				supabase.from("clients").select("id, name, phone, company").or(`name.ilike.${pattern},phone.ilike.${pattern},company.ilike.${pattern}`).limit(5),
				supabase.from("suppliers").select("id, name, phone").or(`name.ilike.${pattern},phone.ilike.${pattern}`).limit(5)
			]);
			if (cancelled) return;
			const mapped = [
				...(products ?? []).map((p) => ({
					id: p.id,
					type: "product",
					title: p.name,
					subtitle: p.sku || p.barcode,
					to: `/produits`
				})),
				...(lots ?? []).map((l) => ({
					id: l.id,
					type: "lot",
					title: l.lot_number,
					subtitle: l.products?.name,
					to: `/lots`
				})),
				...(clients ?? []).map((c) => ({
					id: c.id,
					type: "client",
					title: c.name,
					subtitle: c.company || c.phone,
					to: `/clients`
				})),
				...(suppliers ?? []).map((s) => ({
					id: s.id,
					type: "supplier",
					title: s.name,
					subtitle: s.phone,
					to: `/fournisseurs`
				}))
			];
			setResults([...mapped, ...pageResults]);
			setLoading(false);
		}
		search();
		return () => {
			cancelled = true;
		};
	}, [
		open,
		query,
		pageResults
	]);
	const handleSelect = (result) => {
		onOpenChange(false);
		if (result.to) navigate({ to: result.to });
	};
	const grouped = (0, import_react.useMemo)(() => {
		const groups = {};
		for (const r of results) {
			const key = r.type;
			if (!groups[key]) groups[key] = [];
			groups[key].push(r);
		}
		return groups;
	}, [results]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open,
		onOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
			placeholder: "Rechercher un produit, lot, client, fournisseur ou page…",
			value: rawQuery,
			onValueChange: setRawQuery
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-6 text-center text-sm text-muted-foreground",
				children: "Recherche…"
			}),
			!loading && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Aucun résultat." }),
			grouped.page?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Pages",
				children: grouped.page.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => handleSelect(r),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "mr-2 size-4" }), r.title]
				}, r.id))
			}),
			grouped.product?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Produits",
				children: grouped.product.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => handleSelect(r),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mr-2 size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1",
							children: r.title
						}),
						r.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: r.subtitle
						})
					]
				}, r.id))
			}),
			grouped.lot?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Lots",
				children: grouped.lot.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => handleSelect(r),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, { className: "mr-2 size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1",
							children: r.title
						}),
						r.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: r.subtitle
						})
					]
				}, r.id))
			}),
			grouped.client?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Clients",
				children: grouped.client.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => handleSelect(r),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1",
							children: r.title
						}),
						r.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: r.subtitle
						})
					]
				}, r.id))
			}),
			grouped.supplier?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Fournisseurs",
				children: grouped.supplier.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => handleSelect(r),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "mr-2 size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1",
							children: r.title
						}),
						r.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: r.subtitle
						})
					]
				}, r.id))
			})
		] })]
	});
}
function SearchTrigger({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "relative hidden h-9 w-64 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 size-4" }),
			"Rechercher…",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
				className: "pointer-events-none absolute right-2 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium lg:inline",
				children: "⌘K"
			})
		]
	});
}
function AuthenticatedLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarehouseProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutShell, {}) }) });
}
function LayoutShell() {
	const { user, roles } = useCurrentUser();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [paletteOpen, setPaletteOpen] = (0, import_react.useState)(false);
	const { kiosk } = useKiosk();
	useSyncEngine();
	useSmartAlerts();
	(0, import_react.useEffect)(() => {
		const down = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", down);
		return () => window.removeEventListener("keydown", down);
	}, []);
	const fullName = user?.user_metadata?.full_name ?? null;
	const email = user?.email ?? null;
	const currentTitle = modules.flatMap((g) => g.items).find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.title ?? "INDUS-ERP";
	if (kiosk) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskShell, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {
			fullName,
			email,
			roles
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarInset, {
			className: "flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineBanner, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, { className: "text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-px bg-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold tracking-tight text-foreground",
							children: currentTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinCurrentPageButton, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchTrigger, { onClick: () => setPaletteOpen(true) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarehouseSelector, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskToggle, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncPanel, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsBell, {})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalCommandPalette, {
					open: paletteOpen,
					onOpenChange: setPaletteOpen
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "flex-1 p-4 md:p-6 lg:p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavoritesBar, { className: "mb-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
				})
			]
		})]
	}) });
}
function KioskToggle() {
	const { setKiosk } = useKiosk();
	const { roles } = useCurrentUser();
	if (!(roles.length === 0 || roles.includes("caissier") || roles.includes("proprietaire"))) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		size: "sm",
		className: "h-9 gap-2",
		title: "Activer le mode kiosque (caisse plein écran)",
		onClick: () => {
			setKiosk(true);
			toast.success("Mode kiosque activé");
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: "Kiosque"
		})]
	});
}
/**
* Mode kiosque : plein écran, sans menus, limité aux écrans vente et scan.
*/
function KioskShell() {
	const { setKiosk } = useKiosk();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const allowed = KIOSK_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
	(0, import_react.useEffect)(() => {
		if (!allowed) navigate({
			to: "/ventes",
			replace: true
		});
	}, [allowed, navigate]);
	async function handleSignOut() {
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-16 items-center gap-2 border-b border-border bg-card px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold uppercase tracking-widest text-accent",
						children: "Caisse"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "ml-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskLink, {
							to: "/ventes",
							icon: Receipt,
							label: "Vente",
							active: pathname.startsWith("/ventes")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KioskLink, {
							to: "/scanner",
							icon: QrCode,
							label: "Scan",
							active: pathname.startsWith("/scanner")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsBell, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "lg",
								className: "h-12 gap-2",
								onClick: () => {
									setKiosk(false);
									toast.success("Mode kiosque désactivé");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Quitter le kiosque"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "lg",
								className: "h-12",
								onClick: handleSignOut,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 p-3 md:p-6",
				children: allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) : null
			})
		]
	});
}
function KioskLink({ to, icon: Icon, label, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: `flex h-12 items-center gap-2 rounded-md px-5 text-base font-semibold transition ${active ? "bg-accent text-accent-foreground" : "border border-border text-foreground hover:bg-muted"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
	});
}
//#endregion
export { AuthenticatedLayout as component };
