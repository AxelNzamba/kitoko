import { Construction } from "lucide-react";

type Props = {
  title: string;
  description: string;
  features?: string[];
};

export function ModulePlaceholder({ title, description, features }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Construction className="size-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                Module en construction
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Prochainement disponible
              </h2>
            </div>
            {features && features.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fonctionnalités prévues
                </p>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <span className="size-1.5 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
