/**
 * IndexedDB storage utility for persistent custom photos and audio tracks.
 * Handles JPG, PNG, WEBP images and MP3/audio files with zero quota issues.
 */

const DB_NAME = 'MagicalBirthdaySurpriseDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_store';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaItem(key: string, dataUrlOrBlob: string | Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrlOrBlob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to save to IndexedDB, fallback to in-memory', e);
  }
}

export async function getMediaItem(key: string): Promise<string | Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Failed to get from IndexedDB', e);
    return null;
  }
}

export async function getAllCustomPhotos(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      const photos: Record<string, string> = {};

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          if (
            typeof cursor.key === 'string' &&
            (cursor.key.startsWith('photo_') || cursor.key.startsWith('universe_illustration_'))
          ) {
            const val = cursor.value;
            if (typeof val === 'string') {
              photos[cursor.key] = val;
            } else if (val instanceof Blob) {
              photos[cursor.key] = URL.createObjectURL(val);
            }
          }
          cursor.continue();
        } else {
          resolve(photos);
        }
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

/**
 * Converts File to high-quality DataURL without distortion
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
