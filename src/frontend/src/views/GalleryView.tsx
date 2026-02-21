import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArtworkCard from '../components/ArtworkCard';
import { useRoute } from '../hooks/useRoute';
import type { Artwork } from '../backend';
import type { SoldDisplayMode } from '../hooks/useSoldDisplayPreference';
import { useState } from 'react';

interface GalleryViewProps {
  artworks: Artwork[];
  isLoading: boolean;
  showUploadShortcut: boolean;
  onArtworkClick: (artwork: Artwork) => void;
  soldDisplayMode: SoldDisplayMode;
  onSoldDisplayModeChange: (mode: SoldDisplayMode) => void;
}

export default function GalleryView({ 
  artworks, 
  isLoading, 
  showUploadShortcut, 
  onArtworkClick,
  soldDisplayMode,
  onSoldDisplayModeChange
}: GalleryViewProps) {
  const { navigate } = useRoute();
  const [showSold, setShowSold] = useState(false);

  // Filter artworks based on sold status
  const filteredArtworks = showSold ? artworks : artworks.filter(artwork => !artwork.isSold);

  return (
    <section>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-light tracking-wide text-foreground">Gallery</h2>
          <p className="text-muted-foreground mt-2">Explore our curated collection of artworks</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Switch
              id="show-sold"
              checked={showSold}
              onCheckedChange={setShowSold}
            />
            <Label htmlFor="show-sold" className="cursor-pointer text-sm font-medium">
              Show sold
            </Label>
          </div>
          
          <div className="flex items-center gap-3">
            <Label htmlFor="sold-display" className="text-sm font-medium whitespace-nowrap">
              Sold display:
            </Label>
            <Select value={soldDisplayMode} onValueChange={(value) => onSoldDisplayModeChange(value as SoldDisplayMode)}>
              <SelectTrigger id="sold-display" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="badge">Badge</SelectItem>
                <SelectItem value="watermark">Watermark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Upload Shortcut - compact button for authenticated users */}
      {showUploadShortcut && (
        <div className="mb-8">
          <Button 
            onClick={() => navigate('upload')}
            variant="default"
            size="default"
            className="font-medium"
          >
            Add Artwork
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {artworks.length === 0 
              ? `No artworks yet. ${showUploadShortcut ? 'Use the upload button above to add your first piece!' : ''}`
              : 'No artworks to display. Toggle "Show sold" to see sold items.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => onArtworkClick(artwork)}
              soldDisplayMode={soldDisplayMode}
            />
          ))}
        </div>
      )}
    </section>
  );
}
