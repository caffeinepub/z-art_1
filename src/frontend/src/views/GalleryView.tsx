import { Loader2 } from 'lucide-react';
import ArtworkCard from '../components/ArtworkCard';
import type { Artwork } from '../backend';

interface GalleryViewProps {
  artworks: Artwork[];
  isLoading: boolean;
  isAdmin: boolean;
  onArtworkClick: (artwork: Artwork) => void;
}

export default function GalleryView({ artworks, isLoading, isAdmin, onArtworkClick }: GalleryViewProps) {
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-light tracking-wide text-foreground">Gallery</h2>
        <p className="text-muted-foreground mt-2">Explore our curated collection of artworks</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No artworks yet. {isAdmin && 'Visit the Upload page to add your first piece!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => onArtworkClick(artwork)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
