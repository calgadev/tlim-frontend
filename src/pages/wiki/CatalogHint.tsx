import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** Shown when the catalog looks empty: it is filled by the TibiaWiki scraper. */
export function CatalogHint({ what }: { what: 'items' | 'creatures' }) {
  const { isAdmin } = useAuth();
  return isAdmin ? (
    <>
      If the catalog has not been imported yet,{' '}
      <Link to="/admin/scraper" className="link-gold">
        run the TibiaWiki scraper
      </Link>{' '}
      for {what}.
    </>
  ) : (
    <>If the catalog has not been imported yet, ask an admin to run the TibiaWiki scraper.</>
  );
}
