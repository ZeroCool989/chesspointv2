import { PrimitiveAtom, SetStateAction, useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";

export function useAtomLocalStorage<T>(
  key: string,
  atom: PrimitiveAtom<T>
): [T, (value: SetStateAction<T>) => void] {
  const [keyTemp, setKeyTemp] = useState("");
  const [storedValue, setStoredValue] = useAtom(atom);
  const prevValueRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    setKeyTemp(key);
    const item = window.localStorage.getItem(key);
    if (!item) return;
    const value = parseJSON<T>(item);
    if (value) setStoredValue(value);
  }, [key, setStoredValue]);

  useEffect(() => {
    if (keyTemp !== key || prevValueRef.current === storedValue) return;
    prevValueRef.current = storedValue;
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, keyTemp, storedValue]);

  return [storedValue, setStoredValue];
}

function parseJSON<T>(value: string): T | undefined {
  return value === "undefined" ? undefined : JSON.parse(value);
}
