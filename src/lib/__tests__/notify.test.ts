/**
 * Tests du bus de notifications (src/lib/notify.ts) — composant critique
 * transverse (utilisé par le POS, le stock, les alertes…).
 *
 * Le module manipule localStorage + window (son Web Audio, toasts Sonner) :
 * on les stubbe pour tester la logique du bus (pub/sub, persistance, quota).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Stub du son Web Audio (jsdom n'a pas AudioContext)
vi.stubGlobal(
  "AudioContext",
  class {
    currentTime = 0;
    destination = {};
    createOscillator() {
      return {
        type: "",
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
    }
    close() {
      return Promise.resolve();
    }
  },
);

// Stub du toast Sonner (composant UI hors de portée des tests unitaires)
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import { toast } from "sonner";
import {
  notify,
  subscribeNotifications,
  markAllRead,
  clearNotifications,
  type AppNotification,
} from "../notify";

describe("bus de notifications (notify.ts)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    clearNotifications();
  });

  it("push ajoute une notification, persiste et notifie les abonnés", () => {
    const seen: AppNotification[][] = [];
    subscribeNotifications((l) => seen.push(l));

    notify.info("Titre info", "Détail");

    expect(seen.at(-1)).toHaveLength(1);
    const item = seen.at(-1)![0];
    expect(item.level).toBe("info");
    expect(item.title).toBe("Titre info");
    expect(item.description).toBe("Détail");
    expect(item.read).toBe(false);
    expect(JSON.parse(window.localStorage.getItem("indus-erp-notifications")!)).toHaveLength(1);
  });

  it("chaque niveau route vers le toast Sonner correspondant", () => {
    notify.success("s");
    notify.error("e");
    notify.warning("w");
    notify.info("i");

    expect(toast.success).toHaveBeenCalledWith("s", undefined);
    expect(toast.error).toHaveBeenCalledWith("e", undefined);
    expect(toast.warning).toHaveBeenCalledWith("w", undefined);
    expect(toast.info).toHaveBeenCalledWith("i", undefined);
  });

  it("les plus récentes sont en tête de liste", () => {
    notify.info("première");
    notify.info("deuxième");

    const last = vi.fn();
    subscribeNotifications(last);
    const list = last.mock.calls.at(-1)![0] as AppNotification[];
    expect(list[0].title).toBe("deuxième");
    expect(list[1].title).toBe("première");
  });

  it("le quota de 30 notifications est respecté (FIFO)", () => {
    for (let i = 0; i < 35; i++) notify.info(`n${i}`);
    const seen: AppNotification[][] = [];
    subscribeNotifications((l) => seen.push(l));
    const list = seen.at(-1)!;
    expect(list).toHaveLength(30);
    expect(list[0].title).toBe("n34");
    expect(list.some((n) => n.title === "n0")).toBe(false);
  });

  it("markAllRead marque tout comme lu", () => {
    notify.info("a");
    notify.error("b");
    markAllRead();

    const seen: AppNotification[][] = [];
    subscribeNotifications((l) => seen.push(l));
    expect(seen.at(-1)!.every((n) => n.read)).toBe(true);
  });

  it("clearNotifications vide la liste et le stockage", () => {
    notify.info("a");
    clearNotifications();

    const seen: AppNotification[][] = [];
    subscribeNotifications((l) => seen.push(l));
    expect(seen.at(-1)!).toHaveLength(0);
    expect(window.localStorage.getItem("indus-erp-notifications")).toBe("[]");
  });

  it("unsubscribe arrête la réception", () => {
    const seen: AppNotification[][] = [];
    const unsub = subscribeNotifications((l) => seen.push(l));
    unsub();

    notify.info("après unsub");
    expect(seen).toHaveLength(1); // seulement l'appel initial de synchronisation
  });

  it("le stockage corrompu ne fait pas planter le module", () => {
    window.localStorage.setItem("indus-erp-notifications", "{invalid json");
    const seen: AppNotification[][] = [];
    expect(() => subscribeNotifications((l) => seen.push(l))).not.toThrow();
    expect(seen.at(-1)!).toHaveLength(0);
  });
});
