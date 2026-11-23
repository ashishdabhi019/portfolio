/**
 * Generates an SVG Data URI for the geometric arrow cursor matching the site accent color.
 */
export function lightenHex(hex: string, percent: number = 22): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return "#FB923C";
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100)));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round((255 - ((num >> 8) & 0xff)) * (percent / 100)));
  const b = Math.min(255, (num & 0xff) + Math.round((255 - (num & 0xff)) * (percent / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function buildCursorSvgUri(primaryHex: string, lightHex?: string): string {
  const primary = primaryHex || "#F97316";
  const light = lightHex || lightenHex(primary, 22);

  const encPrimary = encodeURIComponent(primary);
  const encLight = encodeURIComponent(light);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='32' viewBox='0 0 24 32' fill='none'><defs><clipPath id='c'><path d='M1 1L1 27L8.5 16.5L21 18Z'/></clipPath></defs><g clip-path='url(%23c)'><rect width='24' height='32' fill='${encPrimary}'/><polygon points='-2,10.2 10.2,-2 12.6,-2 -2,12.6' fill='%23FFFFFF'/><polygon points='-2,12.6 12.6,-2 20.8,-2 -2,20.8' fill='${encLight}'/><polygon points='-2,20.8 20.8,-2 23.2,-2 -2,23.2' fill='%23FFFFFF'/></g><path d='M1 1L1 27L8.5 16.5L21 18Z' fill='none' stroke='%2318191C' stroke-width='1.25' stroke-linejoin='round' stroke-linecap='round'/></svg>`;

  return `url("data:image/svg+xml,${svg}")`;
}

export function applyCursorAccent(hex: string) {
  if (typeof document === "undefined") return;
  const uri = buildCursorSvgUri(hex);
  document.documentElement.style.setProperty("--custom-cursor", `${uri} 1 1, auto`);
  document.documentElement.style.setProperty("--custom-cursor-pointer", `${uri} 1 1, pointer`);
}
