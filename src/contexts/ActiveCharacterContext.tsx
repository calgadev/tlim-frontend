import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCharacters } from '@/hooks/useCharacters';
import type { CharacterResponse } from '@/types';

// Remembered per browser so the Inventory / Hunts shortcuts open the last character used.
const STORAGE_KEY = 'tlim.activeCharacterId';

function readStoredId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const id = raw ? Number(raw) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

interface ActiveCharacterValue {
  /** null while loading or when the user has no characters */
  character: CharacterResponse | null;
  characters: CharacterResponse[];
  isLoading: boolean;
  setActiveId: (id: number) => void;
}

const ActiveCharacterContext = createContext<ActiveCharacterValue | null>(null);

export function ActiveCharacterProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useCharacters();
  const [storedId, setStoredId] = useState<number | null>(readStoredId);

  const setActiveId = useCallback((id: number) => {
    setStoredId(id);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // ignore: the choice just won't survive a reload
    }
  }, []);

  const value = useMemo<ActiveCharacterValue>(() => {
    const characters = data ?? [];
    // A deleted or foreign id falls back to the first character
    const character = characters.find((c) => c.id === storedId) ?? characters[0] ?? null;
    return { character, characters, isLoading, setActiveId };
  }, [data, storedId, isLoading, setActiveId]);

  return <ActiveCharacterContext.Provider value={value}>{children}</ActiveCharacterContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveCharacter() {
  const ctx = useContext(ActiveCharacterContext);
  if (!ctx) throw new Error('useActiveCharacter must be used inside ActiveCharacterProvider');
  return ctx;
}
