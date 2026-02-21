import type { Artwork } from '../backend';
import type { SoldDisplayMode } from '../hooks/useSoldDisplayPreference';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
  soldDisplayMode: SoldDisplayMode;
}

export default function ArtworkCard({ artwork, onClick, soldDisplayMode }: ArtworkCardProps) {
  const imageUrl = artwork.image.getDirectURL();

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:bg-accent/5"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="w-full h-80 overflow-hidden bg-muted relative">
            <img
              src={imageUrl}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            {artwork.isSold && soldDisplayMode === 'badge' && (
              <Badge 
                variant="secondary" 
                className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground font-semibold shadow-lg border border-border text-sm px-3 py-1"
              >
                SOLD
              </Badge>
            )}
            {artwork.isSold && soldDisplayMode === 'watermark' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="text-5xl font-bold text-background/80 transform rotate-[-30deg] select-none"
                  style={{
                    textShadow: '0 0 10px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)',
                    letterSpacing: '0.1em'
                  }}
                >
                  SOLD
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-serif text-xl font-medium">{artwork.title}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
