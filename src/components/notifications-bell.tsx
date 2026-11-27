import { useEffect, useState } from "react";
import { Bell, Check, Trash2, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  subscribeNotifications,
  markAllRead,
  clearNotifications,
  type AppNotification,
} from "@/lib/notify";
import { formatDateTime } from "@/lib/format";

const iconFor = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

const colorFor = {
  success: "text-emerald-500",
  error: "text-destructive",
  warning: "text-amber-500",
  info: "text-accent",
};

export function NotificationsBell() {
  const [list, setList] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => subscribeNotifications(setList), []);

  const unread = list.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) markAllRead(); }}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title="Notifications"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => clearNotifications()}
              disabled={list.length === 0}
            >
              <Trash2 className="size-3" /> Vider
            </Button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Check className="size-5" />
              Aucune notification.
            </div>
          )}
          {list.map((n) => {
            const Icon = iconFor[n.level];
            return (
              <div key={n.id} className="flex gap-3 border-b border-border/60 px-3 py-2.5 last:border-0">
                <Icon className={`mt-0.5 size-4 shrink-0 ${colorFor[n.level]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {n.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.description}</p>
                  )}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {formatDateTime(new Date(n.createdAt))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
