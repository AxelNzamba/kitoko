import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Warehouse = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  is_active: boolean;
};

export type WarehouseContextValue = {
  warehouses: Warehouse[];
  selectedWarehouseId: string | "all";
  setSelectedWarehouseId: (id: string | "all") => void;
  selectedWarehouse: Warehouse | null;
  isLoading: boolean;
};

const STORAGE_KEY = "indus-erp:selected-warehouse";
const WAREHOUSES_CACHE_KEY = "indus-erp:warehouses-cache";

// Contexte unique conservé entre rechargements à chaud (évite un 2e contexte
// orphelin qui provoque « must be used within WarehouseProvider »).
const g = globalThis as unknown as {
  __warehouseCtx?: React.Context<WarehouseContextValue | null>;
};
const WarehouseContext = (g.__warehouseCtx ??=
  createContext<WarehouseContextValue | null>(null));

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ["warehouses"],
    networkMode: "always",
    queryFn: async () => {
      // Copie locale : la liste reste disponible sans connexion
      const fromCache = (): Warehouse[] => {
        try { return JSON.parse(localStorage.getItem(WAREHOUSES_CACHE_KEY) ?? "[]"); } catch { return []; }
      };
      if (typeof navigator !== "undefined" && !navigator.onLine) return fromCache();
      try {
        const { data, error } = await (supabase as any)
          .from("warehouses")
          .select("id, name, code, address, is_active")
          .eq("is_active", true)
          .order("name");
        if (error) throw error;
        const list = (data ?? []) as Warehouse[];
        localStorage.setItem(WAREHOUSES_CACHE_KEY, JSON.stringify(list));
        return list;
      } catch (e) {
        const cached = fromCache();
        if (cached.length > 0) return cached;
        throw e;
      }
    },
  });

  const [selectedWarehouseId, setSelectedWarehouseIdState] = useState<string | "all">(() => {
    if (typeof window === "undefined") return "all";
    return localStorage.getItem(STORAGE_KEY) ?? "all";
  });

  const setSelectedWarehouseId = useCallback((id: string | "all") => {
    setSelectedWarehouseIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  // Si l'entrepôt sélectionné disparaît (supprimé/désactivé), rebasculer sur "all"
  useEffect(() => {
    if (selectedWarehouseId === "all") return;
    const stillExists = warehouses.some((w) => w.id === selectedWarehouseId);
    if (!stillExists && warehouses.length > 0) {
      setSelectedWarehouseId("all");
    }
  }, [warehouses, selectedWarehouseId, setSelectedWarehouseId]);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === selectedWarehouseId) ?? null,
    [warehouses, selectedWarehouseId],
  );

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouseId,
        setSelectedWarehouseId,
        selectedWarehouse,
        isLoading,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse(): WarehouseContextValue {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error("useWarehouse must be used within WarehouseProvider");
  return ctx;
}
