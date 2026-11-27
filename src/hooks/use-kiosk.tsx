import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "indus-erp:kiosk-mode";

/** Écrans autorisés en mode kiosque (caissier). */
export const KIOSK_ROUTES = ["/ventes", "/scanner"] as const;

export type KioskContextValue = {
  kiosk: boolean;
  setKiosk: (v: boolean) => void;
  toggleKiosk: () => void;
};

const KioskContext = createContext<KioskContextValue | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [kiosk, setKioskState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setKioskState(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const setKiosk = useCallback((v: boolean) => {
    setKioskState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
      if (v) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, []);

  const toggleKiosk = useCallback(() => setKiosk(!kiosk), [kiosk, setKiosk]);

  return (
    <KioskContext.Provider value={{ kiosk, setKiosk, toggleKiosk }}>
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk(): KioskContextValue {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error("useKiosk must be used within KioskProvider");
  return ctx;
}
