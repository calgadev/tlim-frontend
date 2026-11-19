import type { ComponentType } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Swords, BookOpen, Globe, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: ComponentType<{ size?: number }>;
  href: string;
  /** false: only the exact path is active */
  prefixMatch?: boolean;
}

// /inventory and /hunts resolve to the active character (see ActiveCharacterRedirect).
const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', prefixMatch: false },
  { label: 'Characters', icon: Users, href: '/characters' },
  { label: 'Inventory', icon: Package, href: '/inventory' },
  { label: 'Hunts', icon: Swords, href: '/hunts' },
  { label: 'Wiki', icon: BookOpen, href: '/wiki' },
  { label: 'Servers', icon: Globe, href: '/servers' },
];

const ADMIN_NAV_ITEM: NavItem = { label: 'Admin', icon: Shield, href: '/admin' };

export function Sidebar() {
  // isAdmin comes from the login response (AuthContext). It only hides UI; the API enforces access.
  const { username, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;
  const avatarInitial = (username?.[0] ?? '?').toUpperCase();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-gradient text-sm font-bold text-gold-ink">
          T
        </div>
        <div>
          <span className="text-base font-semibold text-gold-light">TLIM</span>
          <span className="ml-2 text-xs text-fg-muted">Loot &amp; Inventory</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {navItems.map(({ label, icon: Icon, href, prefixMatch = true }) => (
          <NavLink
            key={label}
            to={href}
            end={!prefixMatch}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-2xl px-4 text-sm transition-all duration-150',
                isActive
                  ? 'bg-gold-gradient font-semibold text-gold-ink'
                  : 'font-medium text-fg-secondary hover:bg-white/5 hover:text-fg'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-xs font-bold text-gold-ink">
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{username ?? '—'}</p>
            <p className="text-xs text-fg-muted">{isAdmin ? 'Administrator' : 'Player'}</p>
          </div>
          <button
            type="button"
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 p-1 text-fg-muted transition-colors duration-150 hover:text-danger"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
