import type { VideoMetadata } from "../types";

const DB_NAME = "streamverse-offline";
const DB_VERSION = 2;
const STORE_NAME = "videos";

/** Extended metadata stored in IndexedDB */
export interface StoredVideo extends VideoMetadata {
  savedAt: number;
  fileSize?: number;
  videoData?: ArrayBuffer;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "videoId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVideo(
  video: VideoMetadata,
  videoData?: ArrayBuffer,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const record: StoredVideo = {
      ...video,
      savedAt: Date.now(),
      fileSize: videoData?.byteLength,
      videoData,
    };
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getVideos(): Promise<StoredVideo[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as StoredVideo[]);
    req.onerror = () => reject(req.error);
  });
}

export async function removeVideo(videoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(videoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeMultipleVideos(videoIds: string[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const id of videoIds) store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function isVideoSaved(videoId: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getKey(videoId);
    req.onsuccess = () => resolve(req.result !== undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function getVideoBlobUrl(videoId: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(videoId);
    req.onsuccess = () => {
      const record = req.result as StoredVideo | undefined;
      if (record?.videoData) {
        const blob = new Blob([record.videoData], { type: "video/mp4" });
        resolve(URL.createObjectURL(blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getStorageUsage(): Promise<{
  usedMB: number;
  totalMB: number;
  percent: number;
}> {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return {
        usedMB: Math.round((usage / 1024 / 1024) * 10) / 10,
        totalMB: Math.round((quota / 1024 / 1024) * 10) / 10,
        percent: quota > 0 ? Math.round((usage / quota) * 100) : 0,
      };
    }
  } catch {
    // ignore
  }
  return { usedMB: 0, totalMB: 0, percent: 0 };
}

/** Ask the service worker to cache a thumbnail URL */
export function cacheThumbnail(url: string): void {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_THUMBNAIL",
      url,
    });
  }
}
