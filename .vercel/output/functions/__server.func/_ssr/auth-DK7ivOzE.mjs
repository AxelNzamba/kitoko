import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-65E2KTpn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { C as Shield } from "../_libs/lucide-react.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as objectType, o as stringType } from "../_libs/zod.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DK7ivOzE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var loginSchema = objectType({
	email: stringType().trim().email("Email invalide").max(255),
	password: stringType().min(6, "Minimum 6 caractères").max(128)
});
var signupSchema = loginSchema.extend({ fullName: stringType().trim().min(2, "Nom trop court").max(100) });
function AuthPage() {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({
				to: "/dashboard",
				replace: true
			});
		});
	}, [navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
								className: "size-5",
								strokeWidth: 2.5
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold tracking-tight",
							children: "INDUS-ERP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] uppercase tracking-widest text-primary-foreground/60",
							children: "Gestion de stock industriel"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-semibold leading-tight tracking-tight",
								children: "Gérez toute votre entreprise depuis un seul écran."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-primary-foreground/70 leading-relaxed",
								children: "Stock, ventes, achats, inventaire, QR codes, certificats et rapports — conçu pour les entreprises industrielles modernes."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-4 pt-4 border-t border-primary-foreground/10",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										value: "17",
										label: "Modules"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										value: "72",
										label: "Écrans"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										value: "3",
										label: "Rôles"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-widest text-primary-foreground/40",
						children: "Version 1.0 — Terminal sécurisé"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 md:p-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
							className: "size-5",
							strokeWidth: 2.5
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm font-bold",
						children: "INDUS-ERP"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "login",
					className: "w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid w-full grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "login",
								children: "Connexion"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								children: "Créer un compte"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "login",
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, { onSuccess: () => navigate({
								to: "/dashboard",
								replace: true
							}) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signup",
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignupForm, { onSuccess: () => navigate({
								to: "/dashboard",
								replace: true
							}) })
						})
					]
				})]
			})]
		})
	});
}
function Metric({ value, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-2xl font-bold text-accent",
		children: value
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[10px] uppercase tracking-widest text-primary-foreground/50",
		children: label
	})] });
}
function LoginForm({ onSuccess }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		const parsed = loginSchema.safeParse({
			email,
			password
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword(parsed.data);
		setLoading(false);
		if (error) {
			toast.error(error.message === "Invalid login credentials" ? "Identifiants incorrects" : error.message);
			return;
		}
		toast.success("Connexion réussie");
		onSuccess();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold tracking-tight",
				children: "Se connecter"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Accédez à votre console de gestion."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "login-email",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "login-email",
					type: "email",
					autoComplete: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "nom@entreprise.cd",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "login-password",
					children: "Mot de passe"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "login-password",
					type: "password",
					autoComplete: "current-password",
					value: password,
					onChange: (e) => setPassword(e.target.value),
					placeholder: "••••••••",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				disabled: loading,
				children: loading ? "Connexion..." : "Se connecter"
			})
		]
	});
}
function SignupForm({ onSuccess }) {
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		const parsed = signupSchema.safeParse({
			fullName,
			email,
			password
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.signUp({
			email: parsed.data.email,
			password: parsed.data.password,
			options: {
				emailRedirectTo: window.location.origin,
				data: { full_name: parsed.data.fullName }
			}
		});
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Compte créé — bienvenue !");
		onSuccess();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold tracking-tight",
				children: "Créer un compte"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					"Le premier compte créé sera le ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-accent",
						children: "Propriétaire"
					}),
					"."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "signup-name",
					children: "Nom complet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "signup-name",
					value: fullName,
					onChange: (e) => setFullName(e.target.value),
					placeholder: "Jean Mukendi",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "signup-email",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "signup-email",
					type: "email",
					autoComplete: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "nom@entreprise.cd",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "signup-password",
					children: "Mot de passe"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "signup-password",
					type: "password",
					autoComplete: "new-password",
					value: password,
					onChange: (e) => setPassword(e.target.value),
					placeholder: "Minimum 6 caractères",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				disabled: loading,
				children: loading ? "Création..." : "Créer mon compte"
			})
		]
	});
}
//#endregion
export { AuthPage as component };
