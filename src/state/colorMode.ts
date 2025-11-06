import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/**
 * Color mode atom - persisted to localStorage
 * Defaults to 'light' mode
 */
export const colorModeAtom = atomWithStorage<'light' | 'dark'>(
  'chesspoint-color-mode',
  'light'
);

/**
 * Derived atom for toggling color mode
 */
export const toggleColorModeAtom = atom(
  null,
  (get, set) => {
    const current = get(colorModeAtom);
    set(colorModeAtom, current === 'light' ? 'dark' : 'light');
  }
);
