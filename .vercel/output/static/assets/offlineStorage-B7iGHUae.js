import { c as createLucideIcon } from "./index-B4P1PGaK.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "14", x: "3", y: "5", rx: "2", ry: "2", key: "12ruh7" }],
  ["path", { d: "M7 15h4M15 15h2M7 11h2M13 11h4", key: "1ueiar" }]
];
const Captions = createLucideIcon("captions", __iconNode);
const DB_NAME = "streamverse-offline";
const DB_VERSION = 2;
const STORE_NAME = "videos";
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "videoId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveVideo(video, videoData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const record = {
      ...video,
      savedAt: Date.now(),
      fileSize: videoData == null ? void 0 : videoData.byteLength,
      videoData
    };
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function getVideos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function removeVideo(videoId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(videoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function removeMultipleVideos(videoIds) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const id of videoIds) store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function isVideoSaved(videoId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getKey(videoId);
    req.onsuccess = () => resolve(req.result !== void 0);
    req.onerror = () => reject(req.error);
  });
}
async function getVideoBlobUrl(videoId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(videoId);
    req.onsuccess = () => {
      const record = req.result;
      if (record == null ? void 0 : record.videoData) {
        const blob = new Blob([record.videoData], { type: "video/mp4" });
        resolve(URL.createObjectURL(blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}
async function getStorageUsage() {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      return {
        usedMB: Math.round(usage / 1024 / 1024 * 10) / 10,
        totalMB: Math.round(quota / 1024 / 1024 * 10) / 10,
        percent: quota > 0 ? Math.round(usage / quota * 100) : 0
      };
    }
  } catch {
  }
  return { usedMB: 0, totalMB: 0, percent: 0 };
}
function cacheThumbnail(url) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_THUMBNAIL",
      url
    });
  }
}
export {
  Captions as C,
  removeMultipleVideos as a,
  getStorageUsage as b,
  cacheThumbnail as c,
  getVideos as d,
  getVideoBlobUrl as g,
  isVideoSaved as i,
  removeVideo as r,
  saveVideo as s
};
