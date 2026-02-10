import AdminUploadForm from '../components/AdminUploadForm';
import { useGetArtwork } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface UploadViewProps {
  editArtworkId?: string;
}

export default function UploadView({ editArtworkId }: UploadViewProps) {
  const { data: artwork, isLoading } = useGetArtwork(editArtworkId || '');
  
  const isEditMode = !!editArtworkId;
  
  if (isEditMode && isLoading) {
    return (
      <section>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }
  
  if (isEditMode && !artwork) {
    return (
      <section>
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Artwork not found</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-light tracking-wide text-foreground">
          {isEditMode ? 'Edit Artwork' : 'Upload Artwork'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isEditMode ? 'Update your artwork details' : 'Share your art with the gallery community'}
        </p>
      </div>
      <AdminUploadForm artwork={artwork} />
    </section>
  );
}
