import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetAllArtworks, useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { useIsAdmin } from './hooks/useIsAdmin';
import { useRoute } from './hooks/useRoute';
import LoginButton from './components/LoginButton';
import AppHeaderNav from './components/AppHeaderNav';
import GalleryView from './views/GalleryView';
import UploadView from './views/UploadView';
import AccessDenied from './components/AccessDenied';
import ArtworkDetailDialog from './components/ArtworkDetailDialog';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import type { Artwork } from './backend';

export default function App() {
  const { identity } = useInternetIdentity();
  const { route } = useRoute();
  const { data: artworks = [], isLoading: artworksLoading } = useGetAllArtworks();
  const { data: isAdmin } = useIsAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile } = useSaveCallerUserProfile();

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;

  // Show profile setup if authenticated, profile loaded, and no profile exists
  useEffect(() => {
    if (isAuthenticated && !profileLoading && profileFetched && userProfile === null) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, profileLoading, profileFetched, userProfile]);

  const handleProfileSave = (name: string) => {
    saveProfile({ name }, {
      onSuccess: () => {
        setShowProfileSetup(false);
      }
    });
  };

  // Render appropriate view based on route
  const renderView = () => {
    if (route === 'upload') {
      if (!isAuthenticated) {
        return <AccessDenied />;
      }
      return <UploadView />;
    }
    
    return (
      <GalleryView
        artworks={artworks}
        isLoading={artworksLoading}
        isAdmin={!!isAdmin}
        showUploadShortcut={isAuthenticated}
        onArtworkClick={setSelectedArtwork}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background texture */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/gallery-bg-texture.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/assets/generated/zart-wordmark.dim_512x256.png" 
              alt="Z'art" 
              className="h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <AppHeaderNav />
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto px-4 py-12">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a></p>
        </div>
      </footer>

      {/* Artwork detail dialog */}
      {selectedArtwork && (
        <ArtworkDetailDialog
          artwork={selectedArtwork}
          open={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}

      {/* Profile setup dialog */}
      <ProfileSetupDialog
        open={showProfileSetup}
        onSave={handleProfileSave}
      />
    </div>
  );
}
