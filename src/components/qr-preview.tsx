import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";

export function QrPreview({ value, size = 128 }: { value: string; size?: number }) {
  return <QRCodeSVG value={value} size={size} level="M" includeMargin />;
}

export function BarcodePreview({ value, height = 60 }: { value: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current && value) {
      try {
        JsBarcode(ref.current, value, {
          format: "CODE128",
          height,
          displayValue: true,
          fontSize: 12,
          margin: 4,
        });
      } catch {
        /* noop */
      }
    }
  }, [value, height]);
  return <svg ref={ref} />;
}
