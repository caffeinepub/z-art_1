import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useRoute } from '../hooks/useRoute';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Upload } from 'lucide-react';

export default function AppHeaderNav() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { route, navigate } = useRoute();

  const isAuthenticated = !!identity;
  const showUploadNav = isAuthenticated && isAdmin && !adminLoading;

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
      {showUploadNav && (
        <Button
          variant={route === 'upload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate('upload')}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      )}
    </nav>
  );
}
