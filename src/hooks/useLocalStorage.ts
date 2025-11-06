// src/hooks/useLocalStorage.ts
import { useEffect, useState } from "react";

function safeParse<T>(raw: string): T | string {
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Not JSON — return the raw string
    return raw;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  // Load once on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return;
    const parsed = safeParse<T>(raw);
    setValue((parsed as T) ?? initialValue);
  }, [key]);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (typeof value === "string") {
        window.localStorage.setItem(key, value as unknown as string);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      /* ignore quota/permission errors */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
