/**
 * One-time redirect to the visitor's browser/OS language on their first visit.
 *
 * - Runs only in the browser, only once ever (guarded by localStorage), so a
 *   manual language choice or a return visit is always respected.
 * - English is the default locale (served at the root); the others live under
 *   /<locale>/. The visitor's primary language subtag (e.g. "fr-FR" -> "fr") is
 *   matched against the supported locales; the current path is preserved.
 */
// All non-default locales that exist (used to detect/strip the current path's
// locale prefix).
const ALL_LOCALES = ["ar", "de", "es", "fr", "it", "ja", "ko", "ro", "tr"] as const;
// Locales whose content is actually translated — the only ones we auto-redirect
// to (so we never send a visitor to a locale that would just show English).
// Add a locale here once its docs are translated.
const TRANSLATED_LOCALES: readonly string[] = [
  "ar",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "ro",
  "tr",
];
const DEFAULT_LOCALE = "en";
const STORAGE_KEY = "qore-locale-redirected";

if (typeof window !== "undefined") {
  try {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      // Mark first so we never auto-redirect more than once.
      window.localStorage.setItem(STORAGE_KEY, "1");

      const path = window.location.pathname;
      const firstSeg = path.split("/")[1] ?? "";
      const isLocaleSeg = (ALL_LOCALES as readonly string[]).includes(firstSeg);
      const currentLocale = isLocaleSeg ? firstSeg : DEFAULT_LOCALE;

      const nav =
        (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        "";
      const want = nav.toLowerCase().split("-")[0];
      // Only redirect to a locale we have actually translated.
      const target = TRANSLATED_LOCALES.includes(want) ? want : DEFAULT_LOCALE;

      if (target !== currentLocale) {
        // Locale-less path (strip an existing /<locale> prefix).
        const rest = isLocaleSeg
          ? path.slice(firstSeg.length + 1) || "/"
          : path;
        const dest =
          (target === DEFAULT_LOCALE ? "" : "/" + target) +
          (rest.startsWith("/") ? rest : "/" + rest);
        window.location.replace(
          dest + window.location.search + window.location.hash,
        );
      }
    }
  } catch {
    /* localStorage unavailable (private mode, etc.) — skip auto-redirect. */
  }
}

export {};
