import { useState } from 'react';
import { useCreateArtwork } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { optimizeImage } from '../utils/imageOptimize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUploadForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceGBP, setPriceGBP] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: createArtwork, isPending } = useCreateArtwork();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setIsOptimizing(true);
      const { bytes, mimeType } = await optimizeImage(imageFile);
      setIsOptimizing(false);

      const priceInPence = BigInt(Math.round(parseFloat(priceGBP) * 100));
      const id = `artwork-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Convert to the correct Uint8Array type expected by ExternalBlob
      const typedBytes = new Uint8Array(bytes.buffer) as Uint8Array<ArrayBuffer>;
      const blob = ExternalBlob.fromBytes(typedBytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      createArtwork(
        {
          id,
          title: title.trim(),
          description: description.trim(),
          price: priceInPence,
          image: blob,
          imageType: mimeType,
        },
        {
          onSuccess: () => {
            toast.success('Artwork uploaded successfully!');
            setTitle('');
            setDescription('');
            setPriceGBP('');
            setImageFile(null);
            setImagePreview(null);
            setUploadProgress(0);
          },
          onError: (error) => {
            toast.error(`Upload failed: ${error.message}`);
            setUploadProgress(0);
          },
        }
      );
    } catch (error: any) {
      setIsOptimizing(false);
      toast.error(`Image optimization failed: ${error.message}`);
    }
  };

  const isSubmitting = isOptimizing || isPending;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl font-serif font-light">Upload Artwork</CardTitle>
        <CardDescription>Share your art with the gallery</CardDescription>
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the artwork"
                  rows={4}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                {imagePreview ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2"
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center aspect-square cursor-pointer"
                  >
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">
                      Click to select an image
                    </span>
                  </label>
                )}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing image...
              </>
            ) : isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Artwork
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
