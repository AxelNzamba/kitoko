import { X, Archive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrayPending() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="size-4" />
          <CardTitle className="text-sm">En attente</CardTitle>
        </div>
        <Button variant="ghost" size="icon">
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          Aucun ticket en attente
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full">
          <Plus className="size-3.5 mr-1.5" /> Nouveau
        </Button>
      </CardContent>
    </Card>
  );
}
