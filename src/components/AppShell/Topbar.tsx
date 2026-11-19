import { useActiveCharacter } from '@/contexts/ActiveCharacterContext';
import { Link } from 'react-router-dom';
import { ChevronDown, UserRound } from 'lucide-react';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-topbar px-6">
      <h1 className="truncate text-xl font-semibold leading-tight text-fg">{title}</h1>
      <CharacterSwitcher />
    </header>
  );
}

/** Picks the character the Inventory and Hunts shortcuts open. */
function CharacterSwitcher() {
  const { character, characters, isLoading, setActiveId } = useActiveCharacter();

  if (isLoading) return <div className="h-9 w-48 animate-pulse rounded-xl bg-white/[0.04]" />;

  if (characters.length === 0) {
    return (
      <Link to="/characters/new" className="link-gold text-sm">
        Create your first character
      </Link>
    );
  }

  return (
    <label className="relative flex items-center gap-2">
      <span className="sr-only">Active character</span>
      <UserRound size={16} className="pointer-events-none absolute left-3 text-gold" aria-hidden />
      <select
        value={character?.id ?? ''}
        onChange={(e) => setActiveId(Number(e.target.value))}
        className="h-9 max-w-64 cursor-pointer appearance-none truncate rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-9 text-sm text-fg outline-none transition-all focus:ring-2 focus:ring-gold/30 [&>option]:bg-overlay"
      >
        {characters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {c.serverName}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 text-fg-muted" aria-hidden />
    </label>
  );
}
