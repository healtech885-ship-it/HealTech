export type TextDirection = "ltr" | "rtl" | "auto";

const RTL_STRONG_CHARACTER = /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufeff]/u;
const LTR_STRONG_CHARACTER = /[A-Za-z\u00c0-\u024f]/u;

export function resolveTextDirection(value: string): TextDirection {
  for (const character of value) {
    if (RTL_STRONG_CHARACTER.test(character)) return "rtl";
    if (LTR_STRONG_CHARACTER.test(character)) return "ltr";
  }
  return "auto";
}
