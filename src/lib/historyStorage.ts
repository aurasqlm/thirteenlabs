import { GeneratedAudioItem } from '@/types';

const DB_NAME = 'thirteenlabs_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredAudioRecord {
  id: string;
  text: string;
  voice: any;
  provider: string;
  format: string;
  audioData: ArrayBuffer;
  durationSeconds: number;
  timestamp: number;
  settings: any;
}

export async function saveAudioToStorage(item: GeneratedAudioItem, audioBlob: Blob): Promise<void> {
  try {
    const db = await openDB();
    const arrayBuffer = await audioBlob.arrayBuffer();

    const record: StoredAudioRecord = {
      id: item.id,
      text: item.text,
      voice: item.voice,
      provider: item.provider,
      format: item.format,
      audioData: arrayBuffer,
      durationSeconds: item.durationSeconds,
      timestamp: item.timestamp,
      settings: item.settings,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to persist audio into IndexedDB', err);
  }
}

export async function loadAudioHistoryFromStorage(): Promise<GeneratedAudioItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = (req.result || []) as StoredAudioRecord[];
        // Sort newest first
        records.sort((a, b) => b.timestamp - a.timestamp);

        const items: GeneratedAudioItem[] = records.map((rec) => {
          const blob = new Blob([rec.audioData], {
            type: rec.format === 'wav' ? 'audio/wav' : 'audio/mpeg',
          });
          const url = URL.createObjectURL(blob);
          return {
            id: rec.id,
            text: rec.text,
            voice: rec.voice,
            provider: rec.provider,
            format: rec.format as any,
            audioUrl: url,
            durationSeconds: rec.durationSeconds,
            timestamp: rec.timestamp,
            settings: rec.settings,
          };
        });

        resolve(items);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load audio history from IndexedDB', err);
    return [];
  }
}

export async function deleteAudioFromStorage(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete item from IndexedDB', err);
  }
}

export async function clearAllAudioFromStorage(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB history', err);
  }
}
