interface OptimizedImage {
  bytes: Uint8Array;
  mimeType: string;
}

const MAX_DIMENSION = 2048;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const JPEG_QUALITY = 0.85;

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    img.onload = async () => {
      try {
        const { width, height } = img;
        
        // Check if resizing is needed
        const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION || file.size > MAX_FILE_SIZE;

        if (!needsResize && file.size <= MAX_FILE_SIZE) {
          // Image is already within limits, use original
          const arrayBuffer = await file.arrayBuffer();
          resolve({
            bytes: new Uint8Array(arrayBuffer),
            mimeType: file.type || 'image/jpeg',
          });
          return;
        }

        // Calculate new dimensions while preserving aspect ratio
        let newWidth = width;
        let newHeight = height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            newWidth = MAX_DIMENSION;
            newHeight = Math.round((height * MAX_DIMENSION) / width);
          }
        } else {
          if (height > MAX_DIMENSION) {
            newHeight = MAX_DIMENSION;
            newWidth = Math.round((width * MAX_DIMENSION) / height);
          }
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const arrayBuffer = await blob.arrayBuffer();
            resolve({
              bytes: new Uint8Array(arrayBuffer),
              mimeType: 'image/jpeg',
            });
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}
