import { useEffect } from "react";
import { toast } from "sonner";
import { Speaker } from "lucide-react";

/** Pulse haptique + bip sonore à chaque scan QR réussi en mode terrain */
export function HapticPulse({
  success,
  sound = true,
  vibrate = true,
  message,
}: {
  success: boolean;
  sound?: boolean;
  vibrate?: boolean;
  message?: string;
}) {
  useEffect(() => {
    if (!success) return;
    if (vibrate) {
      // Touch Vibration API (mobile) — actif uniquement sur appareils mobiles
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          // 90ms buzz, 50ms pause, 80ms buzz — léger mais perceptible
          navigator.vibrate?.([90, 50, 80]);
        } catch {
          /* ignore */
        }
      }
    }
    if (sound) {
      // Bip court (220 Hz, 0.12s) — léger, utile en entrepôt bruyant
      try {
        const AudioCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtor) return;
        const osc = new AudioCtor();
        const oscNode = osc.createOscillator();
        const gain = osc.createGain();
        oscNode.type = "sine";
        oscNode.frequency.value = 220;
        gain.gain.setValueAtTime(0.08, osc.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, osc.currentTime + 0.12);
        oscNode.connect(gain);
        gain.connect(osc.destination);
        oscNode.start();
        oscNode.stop(osc.currentTime + 0.12);
      } catch {
        // Silencieux si l'audio n'est pas autorisé
      }
    }
    if (message) {
      toast.success(message, { duration: 1500 });
    }
  }, [success, sound, vibrate, message]);

  return null;
}
