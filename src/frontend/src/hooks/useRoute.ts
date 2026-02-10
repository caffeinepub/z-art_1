import { useState, useEffect } from 'react';

export type Route = 'gallery' | 'upload';

export interface RouteParams {
  editArtworkId?: string;
}

export function useRoute() {
  const getRouteFromHash = (): { route: Route; params: RouteParams } => {
    const hash = window.location.hash.slice(1);
    
    if (hash.startsWith('upload')) {
      const searchParams = new URLSearchParams(hash.split('?')[1] || '');
      const editArtworkId = searchParams.get('edit') || undefined;
      return { route: 'upload', params: { editArtworkId } };
    }
    
    return { route: 'gallery', params: {} };
  };

  const [routeState, setRouteState] = useState(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute: Route, params?: RouteParams) => {
    if (newRoute === 'gallery') {
      window.location.hash = '';
    } else if (newRoute === 'upload') {
      if (params?.editArtworkId) {
        window.location.hash = `upload?edit=${encodeURIComponent(params.editArtworkId)}`;
      } else {
        window.location.hash = 'upload';
      }
    }
    setRouteState(getRouteFromHash());
  };

  return { route: routeState.route, params: routeState.params, navigate };
}
