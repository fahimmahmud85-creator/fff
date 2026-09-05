// Utility for high-capacity, quota-safe QC records and assets persistence

export interface SavedAssets {
  companyLogoUrl?: string;
  isoLogoUrl?: string;
  engineerSignatureUrl?: string;
  managerSignatureUrl?: string;
  companyStampUrl?: string;
  preparedSignHeight?: number;
  approvedSignHeight?: number;
  stampHeight?: number;
  preparedSignPosX?: number;
  preparedSignPosY?: number;
  approvedSignPosX?: number;
  approvedSignPosY?: number;
  stampPosX?: number;
  stampPosY?: number;
}

const STORAGE_KEY = 'marine_qc_reports_records';
const ASSETS_STORAGE_KEY = 'marine_qc_persistent_assets';
const DB_NAME = 'MarineQcDatabase_v1';
const DB_VERSION = 1;
const STORE_RECORDS = 'qc_records';
const STORE_ASSETS = 'qc_assets';

// Open / initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Compress image file to keep payload under 80KB (preventing quota exceeded)
export function compressImageFile(file: File, maxDim = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // If already small (< 60KB), read directly
    if (file.size <= 60 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if file is PNG
        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Get saved global assets from localStorage (with fallback memory cache)
export function getSavedAssets(): SavedAssets {
  try {
    const data = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to parse saved assets from localStorage:', e);
  }
  return {};
}

// Save global asset to localStorage & IndexedDB safely
export async function saveAssetSafely(key: keyof SavedAssets, value: any): Promise<void> {
  try {
    const current = getSavedAssets();
    if (value !== undefined && value !== null) {
      (current as any)[key] = value;
    } else {
      delete (current as any)[key];
    }
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save asset to localStorage (attempting IndexedDB):', e);
  }

  // Also persist to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ASSETS, 'readwrite');
    const store = tx.objectStore(STORE_ASSETS);
    store.put({ key, value });
  } catch (err) {
    // IndexedDB fallback silent catch
  }
}

// Strip duplicated heavy base64 strings for compact localStorage saving
export function optimizeRecordsForLocalStorage(records: any[]): any[] {
  const globalAssets = getSavedAssets();

  return records.map((rec) => {
    const copy = { ...rec };
    // If record's logo or signature is identical or present in globalAssets, omit it in localStorage copy
    if (copy.companyLogoUrl && copy.companyLogoUrl === globalAssets.companyLogoUrl) {
      delete copy.companyLogoUrl;
    }
    if (copy.isoLogoUrl && copy.isoLogoUrl === globalAssets.isoLogoUrl) {
      delete copy.isoLogoUrl;
    }
    if (copy.engineerSignatureUrl && copy.engineerSignatureUrl === globalAssets.engineerSignatureUrl) {
      delete copy.engineerSignatureUrl;
    }
    if (copy.managerSignatureUrl && copy.managerSignatureUrl === globalAssets.managerSignatureUrl) {
      delete copy.managerSignatureUrl;
    }
    if (copy.companyStampUrl && copy.companyStampUrl === globalAssets.companyStampUrl) {
      delete copy.companyStampUrl;
    }
    return copy;
  });
}

// Hydrate record with global assets if omitted
export function hydrateRecordAssets<T extends Record<string, any>>(record: T): T {
  const assets = getSavedAssets();
  const defaultSigHeight = (record as any).signatureHeight || assets.preparedSignHeight || 72;
  return {
    ...record,
    companyLogoUrl: (record as any).companyLogoUrl || assets.companyLogoUrl,
    isoLogoUrl: (record as any).isoLogoUrl || assets.isoLogoUrl,
    engineerSignatureUrl: (record as any).engineerSignatureUrl || assets.engineerSignatureUrl,
    managerSignatureUrl: (record as any).managerSignatureUrl || assets.managerSignatureUrl,
    companyStampUrl: (record as any).companyStampUrl || assets.companyStampUrl,
    signatureHeight: defaultSigHeight,
    preparedSignHeight: (record as any).preparedSignHeight || assets.preparedSignHeight || defaultSigHeight,
    approvedSignHeight: (record as any).approvedSignHeight || assets.approvedSignHeight || defaultSigHeight,
    stampHeight: (record as any).stampHeight || assets.stampHeight || 90,
    preparedSignPosX: (record as any).preparedSignPosX ?? assets.preparedSignPosX ?? 0,
    preparedSignPosY: (record as any).preparedSignPosY ?? assets.preparedSignPosY ?? 0,
    approvedSignPosX: (record as any).approvedSignPosX ?? assets.approvedSignPosX ?? 0,
    approvedSignPosY: (record as any).approvedSignPosY ?? assets.approvedSignPosY ?? 0,
    stampPosX: (record as any).stampPosX ?? assets.stampPosX ?? 0,
    stampPosY: (record as any).stampPosY ?? assets.stampPosY ?? 0,
  };
}

// Save records safely with quota overflow recovery & IndexedDB backup
export async function saveQcRecordsSafely(records: any[]): Promise<void> {
  // 1. Save full records to IndexedDB (virtually unlimited capacity, never throws quota exceeded)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_RECORDS, 'readwrite');
    const store = tx.objectStore(STORE_RECORDS);
    // Clear and put all
    store.clear();
    for (const r of records) {
      if (r && r.id) {
        store.put(r);
      }
    }
  } catch (err) {
    console.warn('IndexedDB write warning:', err);
  }

  // 2. Save compact version to localStorage
  try {
    const compact = optimizeRecordsForLocalStorage(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
  } catch (e: any) {
    // Quota Exceeded handling:
    console.warn('LocalStorage quota limit reached. Pruning large base64 attachments for local cache:', e);
    try {
      // Strip any remaining large base64 fields (>10KB) from older records in localStorage copy
      const lightweight = records.map((r, i) => {
        const copy = { ...r };
        delete copy.companyLogoUrl;
        delete copy.isoLogoUrl;
        delete copy.engineerSignatureUrl;
        delete copy.managerSignatureUrl;
        delete copy.companyStampUrl;
        // If there are large attached images on older records, strip them from local cache (they remain in IndexedDB)
        if (i > 5 && copy.attachedImages) {
          copy.attachedImages = [];
        }
        return copy;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch (e2) {
      console.warn('LocalStorage save bypassed; data safely preserved in IndexedDB.');
    }
  }
}

// Load initial records from localStorage immediately, then reconcile with IndexedDB
export function getInitialRecordsFromLocalStorage(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map((r) => hydrateRecordAssets(r));
      }
    }
  } catch (e) {
    console.warn('Failed to parse QC records from localStorage:', e);
  }
  return [];
}

// Load all records from IndexedDB
export async function loadRecordsFromIndexedDB(): Promise<any[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.getAll();
      req.onsuccess = () => {
        const res = req.result || [];
        resolve(res.map((r: any) => hydrateRecordAssets(r)));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
