import { useState, useEffect } from 'react';

export type Route = 'gallery' | 'upload';

export function useRoute() {
  const getRouteFromHash = (): Route => {
    const hash = window.location.hash.slice(1);
    return hash === 'upload' ? 'upload' : 'gallery';
  };

  const [route, setRoute] = useState<Route>(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute: Route) => {
    window.location.hash = newRoute === 'gallery' ? '' : newRoute;
    setRoute(newRoute);
  };

  return { route, navigate };
}
