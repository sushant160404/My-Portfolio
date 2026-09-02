import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Add cache busting parameter to image URL to force browser refresh
 * @param url - The image URL
 * @returns URL with cache busting parameter
 */
export function addCacheBuster(url: string): string {
  if (!url) return url;
  // Data/blob URLs are self-contained — appending a query param corrupts them.
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

/**
 * Upload a file to Firebase Storage and return the download URL
 * @param file - The file to upload
 * @param folder - The storage folder path (e.g., 'images', 'cv')
 * @returns Promise with the download URL
 */
export async function uploadFileToStorage(
  file: File,
  folder: string = 'images'
): Promise<string> {
  // Reject files larger than 5MB before attempting upload
  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    throw new Error('File size exceeds 5 MB limit. Please use a smaller image.');
  }

  // Abort the upload if it hasn't completed within 30 seconds
  const TIMEOUT_MS = 30_000;
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Upload timed out. Check your internet connection and try again.')), TIMEOUT_MS)
  );

  const uploadPromise = (async () => {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}_${sanitizedName}`;

    // Create a storage reference
    const storageRef = ref(storage, fileName);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  })();

  try {
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error instanceof Error ? error : new Error('Failed to upload file. Falling back to local preview.');
  }
}

/**
 * Convert file to base64 data URL (fallback option)
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Downscale/compress an image file into a compact JPEG data URL using a canvas.
 * Used for an instant local preview and as an inline fallback when cloud
 * upload is unavailable — kept small enough to store in a Firestore field
 * (which has a ~1MB per-document limit). Falls back to the raw data URL if
 * the browser can't decode or redraw the image (e.g. SVG, exotic formats).
 * @param file - The image file
 * @param maxDim - Maximum width/height in pixels (aspect ratio preserved)
 * @param quality - JPEG quality between 0 and 1
 */
export function compressImageToDataURL(
  file: File,
  maxDim: number = 1000,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const fallback = () => fileToDataURL(file).then(resolve).catch(() => resolve(''));
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          try {
            let { width, height } = img;
            if (!width || !height) return fallback();
            if (width > maxDim || height > maxDim) {
              const scale = Math.min(maxDim / width, maxDim / height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return fallback();
            ctx.drawImage(img, 0, 0, width, height);
            const out = canvas.toDataURL('image/jpeg', quality);
            resolve(out && out.startsWith('data:image') ? out : '');
          } catch {
            fallback();
          }
        };
        img.onerror = () => fallback();
        img.src = reader.result as string;
      };
      reader.onerror = () => fallback();
      reader.readAsDataURL(file);
    } catch {
      fallback();
    }
  });
}
