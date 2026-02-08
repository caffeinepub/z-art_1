import type { Artwork } from '../backend';
import { formatGBP } from '../utils/formatGBP';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArtworkDetailDialogProps {
  artwork: Artwork;
  open: boolean;
  onClose: () => void;
}

export default function ArtworkDetailDialog({ artwork, open, onClose }: ArtworkDetailDialogProps) {
  const imageUrl = artwork.image.getDirectURL();

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
        
        <ScrollArea className="max-h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="bg-muted flex items-center justify-center p-8">
              <img
                src={imageUrl}
                alt={artwork.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
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
