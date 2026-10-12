const ENABLE_KEYS = ["perf", "stats", "fps", "debug", "meter"];

function hasEnabledTag(get: (key: string) => string | null): boolean {
  for (const key of ENABLE_KEYS) {
    const raw = get(key);
    if (raw === null) continue;
    const v = raw.trim().toLowerCase();
    if (v === "" || v === "1" || v === "true" || v === "on" || v === "yes") return true;
  }
  return false;
}

export function formatLoadTime(loadMs: number | null | undefined): string {
  if (loadMs == null) return "loading…";
  if (loadMs < 1000) return `${Math.round(loadMs)} ms`;
  return `${(loadMs / 1000).toFixed(1)} s`;
}

export function isPerfEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (hasEnabledTag((k) => params.get(k))) return true;
    const hash = window.location.hash.replace(/^#/, "").toLowerCase();
    if (hash === "") return false;
    if (ENABLE_KEYS.includes(hash)) return true;
    const hashParams = new URLSearchParams(hash);
    if (hasEnabledTag((k) => hashParams.get(k))) return true;
  } catch {
    return false;
  }
  return false;
}
