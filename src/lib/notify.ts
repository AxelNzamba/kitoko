import { toast } from "sonner";

export type NotificationLevel = "success" | "error" | "warning" | "info";

export type AppNotification = {
  id: string;
  level: NotificationLevel;
  title: string;
  description?: string;
  createdAt: number;
  read: boolean;
};

const STORAGE_KEY = "indus-erp-notifications";
const MAX = 30;

type Listener = (list: AppNotification[]) => void;
const listeners = new Set<Listener>();

function load(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

function save(list: AppNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  listeners.forEach((l) => l(list));
}

export function subscribeNotifications(l: Listener) {
  listeners.add(l);
  l(load());
  return () => {
    listeners.delete(l);
  };
}

export function markAllRead() {
  save(load().map((n) => ({ ...n, read: true })));
}

export function clearNotifications() {
  save([]);
}

/** Petit son généré via Web Audio API — pas de fichier requis. */
function playSound(level: NotificationLevel) {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();
    const now = ctx.currentTime;

    // Fréquences selon le niveau
    const freqs: Record<NotificationLevel, number[]> = {
      success: [660, 880],
      info: [520, 700],
      warning: [500, 400],
      error: [400, 260, 200],
    };
    const notes = freqs[level];

    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.0001, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.18);
    });

    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    // ignore
  }
}

function push(level: NotificationLevel, title: string, description?: string) {
  const list = load();
  const item: AppNotification = {
    id: crypto.randomUUID(),
    level,
    title,
    description,
    createdAt: Date.now(),
    read: false,
  };
  save([item, ...list].slice(0, MAX));
  playSound(level);

  const opts = description ? { description } : undefined;
  if (level === "success") toast.success(title, opts);
  else if (level === "error") toast.error(title, opts);
  else if (level === "warning") toast.warning(title, opts);
  else toast.info(title, opts);
}

export const notify = {
  success: (title: string, description?: string) =>
    push("success", title, description),
  error: (title: string, description?: string) =>
    push("error", title, description),
  warning: (title: string, description?: string) =>
    push("warning", title, description),
  info: (title: string, description?: string) => push("info", title, description),
};
