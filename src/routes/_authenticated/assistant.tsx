import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

import { askAssistant } from "@/lib/assistant.functions";
import { track } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/assistant")({
  component: AssistantPage,
  head: () => ({ meta: [
    { title: "Assistant intelligent — INDUS-ERP" },
    { name: "description", content: "Posez vos questions sur le stock, les ventes et les crédits." },
  
      { property: "og:title", content: "Assistant intelligent — INDUS-ERP" },
      { property: "og:description", content: "Posez vos questions sur le stock, les ventes et les crédits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }] }),
});

const suggestions = [
  "Quels produits vont tomber en rupture cette semaine ?",
  "Que dois-je commander et en quelle quantité ?",
  "Quels produits se vendent le moins ?",
  "Quels clients me doivent le plus d'argent ?",
];

function AssistantPage() {
  const ask = useServerFn(askAssistant);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const m = useMutation({
    mutationFn: async (q: string) => (await ask({ data: { question: q } })).answer,
    onSuccess: (a, q) => { setHistory((h) => [{ q, a }, ...h]); setQuestion(""); track({ module: "assistant", action: "question", label: q.slice(0, 80) }); },
  });

  const send = (q: string) => { if (q.trim().length >= 2 && !m.isPending) m.mutate(q.trim()); };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center gap-2"><Sparkles className="size-6 text-accent" /><h1 className="text-2xl font-bold">Assistant intelligent</h1></div>
      <p className="text-sm text-muted-foreground">Il lit votre stock, vos ventes des 30 derniers jours et vos crédits clients pour vous répondre.</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => send(s)} disabled={m.isPending}>{s}</Button>)}
      </div>
      <div className="flex gap-2">
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Posez votre question…" rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(question); } }} />
        <Button onClick={() => send(question)} disabled={m.isPending} aria-label="Envoyer">
          {m.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
      {m.isPending && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Analyse de vos données…</p>}
      {m.error && <p className="text-sm text-destructive">{(m.error as Error).message}</p>}
      <div className="space-y-3">
        {history.map((h, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <p className="mb-2 font-semibold">{h.q}</p>
            <p className="whitespace-pre-wrap text-sm">{h.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
