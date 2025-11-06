// src/hooks/useIsoLayoutEffect.ts
import { useEffect, useLayoutEffect } from "react";

export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
