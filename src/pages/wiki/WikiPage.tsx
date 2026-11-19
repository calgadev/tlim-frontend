import { Link } from 'react-router-dom';
import { Bug, Gem, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const SECTIONS = [
  {
    to: '/wiki/items',
    icon: Gem,
    title: 'Items',
    description: 'Search items by name or category and see which NPCs buy them, and for how much.',
  },
  {
    to: '/wiki/creatures',
    icon: Bug,
    title: 'Creatures',
    description: 'HP, experience, damage modifiers per element and the loot table of each creature.',
  },
];

export function WikiPage() {
  return (
    <>
      <PageHeader
        title="TibiaWiki catalog"
        description="Imported from TibiaWiki by the admin scraper. It is the data the hunt import and the sale engine rely on."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTIONS.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-card transition-colors hover:border-gold/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Icon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-fg group-hover:text-gold-light">{title}</h3>
              <p className="text-sm text-fg-secondary">{description}</p>
            </div>
            <ChevronRight size={18} className="text-fg-muted" aria-hidden />
          </Link>
        ))}
      </div>
    </>
  );
}
