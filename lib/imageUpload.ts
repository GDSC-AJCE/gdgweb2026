import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Resizes and compresses an image File to a maximum dimension, returning a base64 data URL and Blob.
 */
export async function processImageFile(
  file: File,
  maxDimension = 500,
  quality = 0.85
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ dataUrl, blob });
            } else {
              reject(new Error("Failed to convert canvas to blob"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file:
 * 1. Resizes & compresses image to max 500x500 JPEG (~30-60KB)
 * 2. Attempts to upload to Firebase Storage at folder/filename
 * 3. If Firebase Storage is unavailable or errors, falls back to the compressed base64 data URL.
 */
export async function uploadCustomImage(
  file: File,
  folder = "execom"
): Promise<{ url: string; method: "storage" | "dataUrl" }> {
  const { dataUrl, blob } = await processImageFile(file, 500, 0.85);

  try {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: "image/jpeg",
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { url: downloadUrl, method: "storage" };
  } catch (storageError) {
    console.warn("Firebase Storage upload failed, falling back to compressed base64 data URL:", storageError);
    return { url: dataUrl, method: "dataUrl" };
  }
}
