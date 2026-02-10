import { Loader2, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  isAdmin: boolean;
  showUploadShortcut: boolean;
  onArtworkClick: (artwork: Artwork) => void;
  soldDisplayMode: SoldDisplayMode;
  onSoldDisplayModeChange: (mode: SoldDisplayMode) => void;
}

export default function GalleryView({ 
  artworks, 
  isLoading, 
  isAdmin, 
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

      {/* Upload Shortcut - available to all authenticated users */}
      {showUploadShortcut && (
        <Card className="mb-8 border-2 border-primary bg-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden ring-2 ring-primary/20 hover:ring-primary/30">
          {/* Animated gradient background overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"
            aria-hidden="true"
          />
          
          {/* Decorative pulse indicator */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-10" aria-hidden="true">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary shadow-lg"></span>
            </span>
          </div>
          
          <CardContent className="p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Add New Artwork</h3>
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Upload and showcase your latest pieces to the gallery
                </p>
              </div>
              <Button 
                onClick={() => navigate('upload')}
                size="lg"
                className="gap-2 w-full sm:w-auto shadow-md hover:shadow-lg transition-all font-semibold text-base px-6 py-6 sm:py-3"
              >
                <Upload className="h-5 w-5" />
                Go to Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {artworks.length === 0 
              ? `No artworks yet. ${showUploadShortcut ? 'Use the upload form above to add your first piece!' : ''}`
              : 'No artworks to display. Toggle "Show sold" to see sold items.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
