import { ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Swords, BookOpen, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type IconComponent = ComponentType<{ size?: number }>;

interface NavItem {
  label: string;
  icon: IconComponent;
  href: string;
  // prefixMatch: true for sections with sub-routes (e.g. /characters/:id)
  prefixMatch?: boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Characters', icon: Users, href: '/characters', prefixMatch: true },
  // characterId placeholder — resolved in Phase 4 when character selection is implemented
  { label: 'Inventory', icon: Package, href: '/inventory/1', prefixMatch: true },
  { label: 'Hunts', icon: Swords, href: '/hunts/1', prefixMatch: true },
  { label: 'Wiki', icon: BookOpen, href: '/wiki', prefixMatch: true },
];

const ADMIN_NAV_ITEM: NavItem = {
  label: 'Admin',
  icon: Shield,
  href: '/admin',
  prefixMatch: true,
};

export function Sidebar() {
  // isAdmin is sourced exclusively from AuthContext, which reads it from the login API response.
  // Never derive admin visibility from a separate variable or from decoding the JWT manually.
  const { username, isAdmin, logout } = useAuth();
  const location = useLocation();

  const navItems = isAdmin ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;

  function isActive(item: NavItem): boolean {
    const prefix = item.prefixMatch
      ? item.href.split('/').slice(0, 2).join('/')  // e.g. '/inventory/1' → '/inventory'
      : item.href;
    return item.prefixMatch
      ? location.pathname.startsWith(prefix)
      : location.pathname === item.href;
  }

  const avatarInitial = (username?.[0] ?? '?').toUpperCase();

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-screen"
      style={{ width: 260, backgroundColor: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #D9B35B, #F4D27A)', color: '#221607' }}
        >
          T
        </div>
        <div>
          <span className="text-base font-semibold" style={{ color: '#F4D27A' }}>TLIM</span>
          <span className="text-xs ml-2" style={{ color: '#64748B' }}>v0.1</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return active ? (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-3 px-4 rounded-2xl text-sm font-semibold"
              style={{
                height: 44,
                background: 'linear-gradient(135deg, #D9B35B, #F4D27A)',
                color: '#221607',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          ) : (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-3 px-4 rounded-2xl text-sm font-medium transition-all duration-150"
              style={{
                height: 44,
                color: '#94A3B8',
                textDecoration: 'none',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #D9B35B, #F4D27A)', color: '#221607' }}
          >
            {avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>{username ?? '—'}</p>
            <p className="text-xs" style={{ color: '#64748B' }}>Online</p>
          </div>
          <button
            className="flex-shrink-0 transition-colors duration-150 p-1"
            style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Logout"
            onClick={logout}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
