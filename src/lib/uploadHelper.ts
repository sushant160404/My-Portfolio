import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Add cache busting parameter to image URL to force browser refresh
 * @param url - The image URL
 * @returns URL with cache busting parameter
 */
export function addCacheBuster(url: string): string {
  if (!url) return url;
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
  try {
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
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error('Failed to upload file. Falling back to local preview.');
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
