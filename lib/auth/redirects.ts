const DEFAULT_REDIRECT_FALLBACK = "/dashboard";
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const PROTOCOL_PATTERN = /[a-zA-Z][a-zA-Z\d+.-]*:/;

function isSafeInternalPath(value: string) {
  if (!value) return false;
  if (value !== value.trim()) return false;
  if (CONTROL_CHARACTER_PATTERN.test(value)) return false;
  if (value.includes("\\")) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (PROTOCOL_PATTERN.test(value)) return false;

  const url = new URL(value, "https://healtech.local");
  return url.origin === "https://healtech.local";
}

function decodeRedirectValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function getSafeFallback(fallback: string) {
  return isSafeInternalPath(fallback) ? fallback : DEFAULT_REDIRECT_FALLBACK;
}

export function getSafeRedirectPath(input: string | null | undefined, fallback: string) {
  const safeFallback = getSafeFallback(fallback);
  if (typeof input !== "string" || !input) return safeFallback;

  const decodedInput = decodeRedirectValue(input);
  if (decodedInput === null) return safeFallback;

  return isSafeInternalPath(input) && isSafeInternalPath(decodedInput) ? input : safeFallback;
}
