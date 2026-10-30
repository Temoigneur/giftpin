import QRCode from "qrcode";
import { escapeAttr } from "./layout";

/**
 * A QR code as inline SVG, drawn here so the manage page needs no script or
 * outside service to show one. One path of dark squares on a white square
 * with the standard four-module quiet zone, so a phone camera reads it on a
 * dark theme too. Error correction "M" survives a printed card being a bit
 * smudged without making the code much denser.
 */
export function qrSvg(text: string, label: string): string {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  const quiet = 4;
  const size = modules.size + quiet * 2;
  let d = "";
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) d += `M${col + quiet} ${row + quiet}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="${escapeAttr(label)}"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

