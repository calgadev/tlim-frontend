import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon={<Compass size={40} />}
        title="Page not found"
        description="This address doesn't exist in TLIM."
        action={<ButtonLink to="/dashboard">Go to dashboard</ButtonLink>}
      />
    </Card>
  );
}
