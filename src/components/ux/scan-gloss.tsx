import { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, ScanBarcode as Scanner, CheckCircle } from "lucide-react";
import { HapticPulse } from "@/components/ux/haptic-pulse";

/**
 * Mode "Scan Continu"
 * - Le champ code-barres reste actif sans qu'il soit nécessaire de cliquer
 *   entre chaque bip de la douchette.
 * - On offre un champ texte pour le saisi manuel, mais le mode 'continu' reste
 *   préférentiel.
 */
export function ScanGloss({
  onScan,
  initialCode = "",
  placeholder = "Code-barres ou SKU...",
  autoFocus = true,
  haptic = true,
  allowedProductTypes,
}: {
  onScan: (code: string) => Promise<void>;
  initialCode?: string;
  placeholder?: string;
  autoFocus?: boolean;
  haptic?: boolean;
  /** Si fourni, seules les lignes dont le type est dans la liste sont acceptées */
  allowedProductTypes?: string[];
}) {
  const [code, setCode] = useState(initialCode);
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  const stop = async () => {
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        /* ignore */
      }
      setScanner(null);
    }
    setScanning(false);
  };

  const start = async () => {
    if (scanner) return;
    setScanning(true);
    setScanSuccess(false);
    const div = document.getElementById("scan-gloss-camera");
    if (!div) {
      setScanning(false);
      return;
    }
    try {
      const s = new Html5Qrcode(div.id);
      setScanner(s);
      await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 280, height: 280 } }, async (decoded) => {
        const c = decoded.trim();
        if (!c) return;
        setCode(c);
        setScanSuccess(true);
        try {
          await onScan(c);
        } catch (e) {
          /* on consomme l'erreur, le tone/mouvement est déjà émis */
        }
        if (haptic) setScanSuccess(false);
      }, () => {});
    } catch {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <CardTitle className="text-sm font-semibold">Scan Continu</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => (scanning ? stop() : void start())} aria-label={scanning ? "Arrêter le scan" : "Démarrer le scan"}>
            {scanning ? <X className="size-4" /> : <Scanner className="size-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div id="scan-gloss-camera" className="overflow-hidden rounded-lg bg-black" />
          {scanSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="size-4" />
              Scan réussi
            </div>
          )}
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.trim()) void onScan(code);
            }}
            className="mt-2 font-mono text-sm"
          />
          {scanning && <div className="flex justify-center"><div className="size-5 animate-spin rounded-full border-b-2 border-primary" /></div>}
        </CardContent>
      </Card>
    </div>
  );
}
