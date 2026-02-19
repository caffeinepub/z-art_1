import { useState, useEffect } from 'react';
import { useCreateArtwork, useUpdateArtwork, useDeleteArtwork } from '../hooks/useQueries';
import { useRoute } from '../hooks/useRoute';
import { ExternalBlob } from '../backend';
import type { Artwork } from '../backend';
import { optimizeImage } from '../utils/imageOptimize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, ImageIcon, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUploadFormProps {
  artwork?: Artwork | null;
}

export default function AdminUploadForm({ artwork }: AdminUploadFormProps) {
  const isEditMode = !!artwork;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceGBP, setPriceGBP] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageReplaced, setImageReplaced] = useState(false);

  const { mutate: createArtwork, isPending: isCreating } = useCreateArtwork();
  const { mutate: updateArtwork, isPending: isUpdating } = useUpdateArtwork();
  const { mutate: deleteArtwork, isPending: isDeleting } = useDeleteArtwork();
  const { navigate } = useRoute();

  // Prefill form when in edit mode
  useEffect(() => {
    if (artwork) {
      setTitle(artwork.title);
      setDescription(artwork.description);
      setPriceGBP((Number(artwork.price) / 100).toFixed(2));
      setImagePreview(artwork.image.getDirectURL());
      setImageReplaced(false);
    }
  }, [artwork]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageReplaced(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageReplaced(false);
  };

  // Delete handler - intentionally immediate with no confirmation
  // This is the only place in the UI where deletion is available (edit page only)
  const handleDelete = () => {
    if (!artwork) return;
    
    deleteArtwork(artwork.id, {
      onSuccess: () => {
        toast.success('Artwork deleted successfully');
        navigate('gallery');
      },
      onError: (error) => {
        toast.error(`Failed to delete artwork: ${error.message}`);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!priceGBP || isNaN(parseFloat(priceGBP)) || parseFloat(priceGBP) < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // For create mode, image is required
    // For edit mode, image is only required if it was removed
    if (!isEditMode && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    if (isEditMode && !imagePreview) {
      toast.error('Please select an image');
      return;
    }

    try {
      const priceInPence = BigInt(Math.round(parseFloat(priceGBP) * 100));
      
      let imageBlob: ExternalBlob;
      let imageType: string;

      // If image was replaced or this is create mode, optimize and upload new image
      if (imageFile && (imageReplaced || !isEditMode)) {
        setIsOptimizing(true);
        const { bytes, mimeType } = await optimizeImage(imageFile);
        setIsOptimizing(false);

        const typedBytes = new Uint8Array(bytes.buffer) as Uint8Array<ArrayBuffer>;
        imageBlob = ExternalBlob.fromBytes(typedBytes).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        imageType = mimeType;
      } else if (isEditMode && artwork) {
        // Use existing image
        imageBlob = artwork.image;
        imageType = artwork.imageType;
      } else {
        toast.error('Image is required');
        return;
      }

      if (isEditMode && artwork) {
        // Update existing artwork
        updateArtwork(
          {
            id: artwork.id,
            artwork: {
              title: title.trim(),
              description: description.trim(),
              price: priceInPence,
              image: imageBlob,
              imageType: imageType,
            },
          },
          {
            onSuccess: () => {
              toast.success('Artwork updated successfully!');
              setUploadProgress(0);
              navigate('gallery');
            },
            onError: (error) => {
              toast.error(`Update failed: ${error.message}`);
              setUploadProgress(0);
            },
          }
        );
      } else {
        // Create new artwork
        const id = `artwork-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        createArtwork(
          {
            id,
            title: title.trim(),
            description: description.trim(),
            price: priceInPence,
            image: imageBlob,
            imageType: imageType,
          },
          {
            onSuccess: () => {
              toast.success('Artwork uploaded successfully!');
              // Reset form
              setTitle('');
              setDescription('');
              setPriceGBP('');
              setImageFile(null);
              setImagePreview(null);
              setUploadProgress(0);
              
              // Navigate to gallery to show the new artwork
              navigate('gallery');
            },
            onError: (error) => {
              toast.error(`Upload failed: ${error.message}`);
              setUploadProgress(0);
            },
          }
        );
      }
    } catch (error: any) {
      setIsOptimizing(false);
      toast.error(`Image optimization failed: ${error.message}`);
    }
  };

  const isPending = isCreating || isUpdating;
  const isSubmitting = isOptimizing || isPending;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-serif font-light">
          {isEditMode ? 'Edit Artwork' : 'Upload Artwork'}
        </CardTitle>
        <CardDescription>
          {isEditMode ? 'Update your artwork details' : 'Share your art with the gallery'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter artwork title"
                  disabled={isSubmitting || isDeleting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your artwork"
                  rows={5}
                  disabled={isSubmitting || isDeleting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (GBP) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceGBP}
                  onChange={(e) => setPriceGBP(e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting || isDeleting}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Artwork Image *</Label>
              
              {imagePreview ? (
                <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting || isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors max-w-xs mx-auto">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting || isDeleting}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload image
                    </span>
                  </label>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="flex-1"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Artwork' : 'Upload Artwork'}
                </>
              )}
            </Button>
          </div>

          {/* Delete button - only available on edit page, intentionally no confirmation */}
          {isEditMode && (
            <div className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="w-full"
              >
                {isDeleting ? (
                  <>
                    <Trash2 className="mr-2 h-4 w-4 animate-pulse" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Artwork
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
