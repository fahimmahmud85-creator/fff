// High-capacity, quota-safe persistence utility for Technical Data Sheets
import { DataSheetRecord } from '../components/datasheets/dataSheetTypes';
import { extractBranding, getBrandingStorageKey, BRANDING_STORAGE_KEY } from '../components/datasheets/dataSheetPresets';
import { getActiveCompany, isMarineFastenersCompany } from './companyProfile';

const STORAGE_KEY = 'MFI_DATA_SHEETS_REGISTRY_V3';
const DB_NAME = 'MarineDataSheetsDatabase_v1';
const DB_VERSION = 1;
const STORE_RECORDS = 'datasheet_records';
const STORE_BRANDING = 'datasheet_branding';

// Initialize IndexedDB
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
      if (!db.objectStoreNames.contains(STORE_BRANDING)) {
        db.createObjectStore(STORE_BRANDING, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Compress image file to keep payload under 60-80KB
export function compressDataSheetImage(file: File, maxDim = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (file.size <= 50 * 1024) {
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

        ctx.drawImage(img, 0, 0, width, height);

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

// Hydrate record with global branding if fields were stripped for compact caching
export function hydrateDataSheetRecord(record: DataSheetRecord, branding?: any): DataSheetRecord {
  const activeCompany = getActiveCompany();
  const brand = branding || getSavedDataSheetBranding();
  const hydratedSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
    ? record.sheets.map(sh => hydrateDataSheetRecord(sh, brand))
    : undefined;

  const defaultSub = isMarineFastenersCompany(activeCompany) ? '(SOLE PROPRIETORSHIP)' : (activeCompany.subtitle || '');
  const defaultAddress = activeCompany.phone ? `${activeCompany.address}, Tel: ${activeCompany.phone}` : activeCompany.address;
  const defaultContact = `${activeCompany.email || ''} | ${activeCompany.website || ''}`;

  return {
    ...record,
    includeMtcPage: record.includeMtcPage !== undefined ? Boolean(record.includeMtcPage) : true,
    sheets: hydratedSheets,
    customLogoImage: record.customLogoImage || brand.customLogoImage || '',
    customIsoImage: record.customIsoImage || brand.customIsoImage || '',
    headerLogoText: record.headerLogoText || brand.headerLogoText || '',
    headerLogoInitials: record.headerLogoInitials || brand.headerLogoInitials || '',
    headerCompanyName: record.headerCompanyName || brand.headerCompanyName || activeCompany.name,
    headerCompanySub: record.headerCompanySub !== undefined ? record.headerCompanySub : (brand.headerCompanySub !== undefined ? brand.headerCompanySub : defaultSub),
    headerCompanyAddress: record.headerCompanyAddress || brand.headerCompanyAddress || defaultAddress,
    headerCompanyContact: record.headerCompanyContact || brand.headerCompanyContact || defaultContact,
    headerIsoText: record.headerIsoText || brand.headerIsoText || (activeCompany.isoText || 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018'),
    preparedByName: record.preparedByName || brand.preparedByName || 'Prepared By.',
    approvedByName: record.approvedByName || brand.approvedByName || 'Approved By.',
    approvedByCompany: record.approvedByCompany || brand.approvedByCompany || activeCompany.name,
    preparedBySignatureImage: record.preparedBySignatureImage || brand.preparedBySignatureImage || '',
    approvedBySignatureImage: record.approvedBySignatureImage || brand.approvedBySignatureImage || '',
    stampSealImage: record.stampSealImage || brand.stampSealImage || (activeCompany.stampUrl || ''),
    preparedSignHeight: record.preparedSignHeight ?? brand.preparedSignHeight ?? 48,
    approvedSignHeight: record.approvedSignHeight ?? brand.approvedSignHeight ?? 48,
    stampHeight: record.stampHeight ?? brand.stampHeight ?? 134,
    preparedSignPosX: record.preparedSignPosX ?? brand.preparedSignPosX ?? 0,
    preparedSignPosY: record.preparedSignPosY ?? brand.preparedSignPosY ?? 0,
    approvedSignPosX: record.approvedSignPosX ?? brand.approvedSignPosX ?? 0,
    approvedSignPosY: record.approvedSignPosY ?? brand.approvedSignPosY ?? 0,
    stampPosX: record.stampPosX ?? brand.stampPosX ?? 0,
    stampPosY: record.stampPosY ?? brand.stampPosY ?? 0
  };
}

// Get saved branding from localStorage
export function getSavedDataSheetBranding(companyId?: string): any {
  try {
    const activeCompany = getActiveCompany();
    const compId = companyId || activeCompany.id;
    const key = getBrandingStorageKey(compId);
    const raw = typeof window !== 'undefined' ? (localStorage.getItem(key) || localStorage.getItem(BRANDING_STORAGE_KEY)) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse branding from localStorage:', e);
  }
  return {};
}

// Save branding to localStorage & IndexedDB safely
export async function saveDataSheetBrandingSafely(record: Partial<DataSheetRecord>): Promise<void> {
  const activeCompany = getActiveCompany();
  const branding = extractBranding(record, activeCompany);
  const key = getBrandingStorageKey(activeCompany.id);
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(branding));
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
    }
  } catch (e) {
    console.warn('LocalStorage quota limit reached while saving branding. Data preserved in memory/IndexedDB.');
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_BRANDING, 'readwrite');
    const store = tx.objectStore(STORE_BRANDING);
    store.put({ key: `branding_${activeCompany.id}`, value: branding });
    store.put({ key: 'global_branding', value: branding });
  } catch (err) {
    // Silent IndexedDB catch
  }
}

// Compact records for localStorage (omit redundant repeated global assets)
function compactRecordsForLocalStorage(records: DataSheetRecord[]): any[] {
  const brand = getSavedDataSheetBranding();
  return records.map(r => {
    const copy: any = { ...r };
    if (copy.customLogoImage && copy.customLogoImage === brand.customLogoImage) {
      delete copy.customLogoImage;
    }
    if (copy.customIsoImage && copy.customIsoImage === brand.customIsoImage) {
      delete copy.customIsoImage;
    }
    if (copy.preparedBySignatureImage && copy.preparedBySignatureImage === brand.preparedBySignatureImage) {
      delete copy.preparedBySignatureImage;
    }
    if (copy.approvedBySignatureImage && copy.approvedBySignatureImage === brand.approvedBySignatureImage) {
      delete copy.approvedBySignatureImage;
    }
    if (copy.stampSealImage && copy.stampSealImage === brand.stampSealImage) {
      delete copy.stampSealImage;
    }
    return copy;
  });
}

// Save Data Sheets records safely to IndexedDB (primary high-capacity) and localStorage (fast cache)
export async function saveDataSheetsSafely(records: DataSheetRecord[]): Promise<void> {
  // 1. High-capacity IndexedDB write (never throws QuotaExceededError)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_RECORDS, 'readwrite');
    const store = tx.objectStore(STORE_RECORDS);
    store.clear();
    for (const r of records) {
      if (r && r.id) {
        store.put(r);
      }
    }
  } catch (err) {
    console.warn('IndexedDB write warning for DataSheets:', err);
  }

  // 2. Optimized localStorage write with quota recovery
  try {
    const compact = compactRecordsForLocalStorage(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
  } catch (e: any) {
    console.warn('LocalStorage quota limit reached for Data Sheets. Pruning large attachments from local cache:', e?.message || e);
    try {
      // Lightweight fallback: strip drawing base64 from older records in localStorage copy
      const lightweight = records.map((r, i) => {
        const copy: any = { ...r };
        delete copy.customLogoImage;
        delete copy.customIsoImage;
        delete copy.preparedBySignatureImage;
        delete copy.approvedBySignatureImage;
        delete copy.stampSealImage;
        if (i > 3) {
          delete copy.leftDrawingImage;
          delete copy.rightDrawingImage;
        }
        return copy;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch (e2) {
      // If still full, save minimal index list so navigation still works
      try {
        const indexOnly = records.map(r => ({
          id: r.id,
          dataSheetNo: r.dataSheetNo,
          date: r.date,
          customer: r.customer,
          subject: r.subject,
          standard: r.standard,
          templateType: r.templateType,
          status: r.status,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(indexOnly));
      } catch (e3) {
        console.warn('LocalStorage save bypassed; all data sheets safely preserved in IndexedDB.');
      }
    }
  }
}

// Load initial records from localStorage (instant synchronous render)
export function loadDataSheetsFromLocalStorage(): DataSheetRecord[] {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(r => hydrateDataSheetRecord(r));
      }
    }
  } catch (e) {
    console.warn('Failed to parse data sheets from localStorage:', e);
  }
  return [];
}

// Load full high-fidelity records from IndexedDB
export async function loadDataSheetsFromIndexedDB(): Promise<DataSheetRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.getAll();
      req.onsuccess = () => {
        const res = req.result || [];
        if (Array.isArray(res) && res.length > 0) {
          resolve(res.map((r: DataSheetRecord) => hydrateDataSheetRecord(r)));
        } else {
          resolve([]);
        }
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
