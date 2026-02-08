import { useRoute } from '../hooks/useRoute';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';

export default function AppHeaderNav() {
  const { route, navigate } = useRoute();

  return (
    <nav className="flex items-center gap-2">
      <Button
        variant={route === 'gallery' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => navigate('gallery')}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Gallery
      </Button>
    </nav>
  );
}
