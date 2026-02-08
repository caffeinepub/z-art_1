import type { Artwork } from '../backend';
import { formatGBP } from '../utils/formatGBP';
import { Card, CardContent } from '@/components/ui/card';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

export default function ArtworkCard({ artwork, onClick }: ArtworkCardProps) {
  const imageUrl = artwork.image.getDirectURL();

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-serif text-lg font-medium line-clamp-1 mb-1">{artwork.title}</h3>
        <p className="text-xl font-semibold text-primary">{formatGBP(artwork.price)}</p>
      </CardContent>
    </Card>
  );
}
