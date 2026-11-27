import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      gap={10}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:data-[type=success]:border-emerald-500/30 group-[.toaster]:data-[type=error]:border-destructive/30 group-[.toaster]:data-[type=warning]:border-amber-500/30",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-muted/80",
          icon: "group-[.toast]:size-4",
          closeButton:
            "group-[.toast]:text-muted-foreground/50 group-[.toast]:hover:text-foreground group-[.toast]:transition-colors",
        },
      }}
      closeButton
      richColors
      {...props}
    />
  );
};

export { Toaster };
