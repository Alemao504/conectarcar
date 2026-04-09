/**
 * Generates a stable device fingerprint using browser/OS/hardware signals.
 * Silent background operation — no user interaction required.
 */

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("ConectarCar🚗", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("device-fp", 4, 35);
    return canvas.toDataURL().slice(-50);
  } catch {
    return "canvas-blocked";
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (!gl) return "no-webgl";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "no-debug-info";
    const renderer = gl.getParameter(
      debugInfo.UNMASKED_RENDERER_WEBGL,
    ) as string;
    return renderer.slice(0, 40);
  } catch {
    return "webgl-blocked";
  }
}

export async function generateDeviceFingerprint(): Promise<string> {
  const signals: string[] = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(window.devicePixelRatio),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency ?? 0),
    String(
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0,
    ),
    navigator.platform,
    String(new Date().getTimezoneOffset()),
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    navigator.cookieEnabled ? "cookies-on" : "cookies-off",
  ];

  const raw = signals.join("|");
  const hash1 = hashString(raw);
  const hash2 = hashString(raw.split("").reverse().join(""));
  const hash3 = hashString(signals.slice(0, 7).join("-"));

  return `fp-${hash1}-${hash2}-${hash3}`;
}
