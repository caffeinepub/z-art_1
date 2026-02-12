import { useState } from 'react';
import type { Artwork } from '../backend';
import type { SoldDisplayMode } from '../hooks/useSoldDisplayPreference';
import { formatGBP } from '../utils/formatGBP';
import { useSetArtworkSoldStatus } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArtworkDetailDialogProps {
  artwork: Artwork;
  open: boolean;
  onClose: () => void;
  onEdit?: (artwork: Artwork) => void;
  canToggleSold?: boolean;
  soldDisplayMode: SoldDisplayMode;
}

export default function ArtworkDetailDialog({ 
  artwork, 
  open, 
  onClose, 
  onEdit,
  canToggleSold = false,
  soldDisplayMode 
}: ArtworkDetailDialogProps) {
  const imageUrl = artwork.image.getDirectURL();
  const { mutate: setSoldStatus, isPending: isSoldPending } = useSetArtworkSoldStatus();
  
  // Local state for optimistic UI updates
  const [optimisticSoldStatus, setOptimisticSoldStatus] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use optimistic state if available, otherwise use actual artwork status
  const displayedSoldStatus = optimisticSoldStatus !== null ? optimisticSoldStatus : artwork.isSold;

  const handleSoldToggle = (checked: boolean) => {
    // Clear any previous errors
    setError(null);
    
    // Optimistically update the UI
    setOptimisticSoldStatus(checked);
    
    // Call the backend
    setSoldStatus(
      { artworkId: artwork.id, isSold: checked },
      {
        onSuccess: () => {
          // Clear optimistic state on success (real data will come from query invalidation)
          setOptimisticSoldStatus(null);
        },
        onError: (err) => {
          // Revert optimistic update on error
          setOptimisticSoldStatus(null);
          setError('Failed to update sold status. Please try again.');
          console.error('Error updating sold status:', err);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-16 top-4 z-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={() => onEdit(artwork)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        
        <ScrollArea className="max-h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="bg-muted flex items-center justify-center p-8 relative">
              <img
                src={imageUrl}
                alt={artwork.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              {displayedSoldStatus && soldDisplayMode === 'badge' && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-6 right-6 bg-background/90 backdrop-blur-sm text-foreground font-semibold shadow-lg border border-border text-base px-4 py-2"
                >
                  SOLD
                </Badge>
              )}
              {displayedSoldStatus && soldDisplayMode === 'watermark' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="text-7xl sm:text-8xl md:text-9xl font-bold text-background/70 transform rotate-[-30deg] select-none"
                    style={{
                      textShadow: '0 0 30px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.3)',
                      letterSpacing: '0.15em'
                    }}
                  >
                    SOLD
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif font-light">{artwork.title}</DialogTitle>
                <DialogDescription className="text-2xl font-semibold text-primary pt-2">
                  {formatGBP(artwork.price)}
                </DialogDescription>
              </DialogHeader>

              {artwork.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Description</h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{artwork.description}</p>
                </div>
              )}

              {canToggleSold && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sold-toggle" className="text-sm font-medium cursor-pointer">
                      Mark as Sold
                    </Label>
                    <Switch
                      id="sold-toggle"
                      checked={displayedSoldStatus}
                      onCheckedChange={handleSoldToggle}
                      disabled={isSoldPending}
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Added {new Date(Number(artwork.createdAt) / 1000000).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
