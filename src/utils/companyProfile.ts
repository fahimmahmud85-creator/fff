export interface CompanyProfile {
  id: string;
  name: string;
  shortName?: string;
  code?: string;
  subtitle?: string;
  tagline?: string;
  arabicName?: string;
  address: string;
  trn: string;
  phone: string;
  email: string;
  website: string;
  showIso?: boolean; // Only true for Marine Fasteners by default
  isoText?: string; // "ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018"
  isoLogoUrl?: string;
  qcDepartmentName?: string; // "INDUSTRIES QC HEAD" for MFI
  deliveryDepartmentName?: string; // "MFI LOGISTICS & DISPATCH"
  showLogo?: boolean;
  logoUrl?: string;
  showStamp?: boolean;
  stampUrl?: string;
  stampX?: number; // percentage X (0-100)
  stampY?: number; // percentage Y (0-100)
  stampScale?: number; // scale ratio e.g. 1
  stampLayer?: 'front' | 'behind'; // Layering position: front (on top with pass-through) or behind text
  showSignatures?: boolean;
  isDefault?: boolean;
  authorizedUsers?: string[]; // IDs of users authorized for this company (if empty or contains 'all', all users with access can access)
  // Bank Account & Wire Details
  bankBeneficiary?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  bankIban?: string;
  bankSwiftCode?: string;
  bankCountry?: string;
  // Seller / Sales Executive Contact Details
  sellerName?: string;
  sellerDesignation?: string;
  sellerPhone?: string;
  sellerMobile?: string;
  sellerEmail?: string;
  sellerWebsite?: string;
  // UAE FTA E-Invoicing Configuration
  eInvoicingEnabled?: boolean;
  eInvoiceScheme?: string; // '0208' (UAE TRN)
  peppolParticipantId?: string; // e.g. '0208:100440509600003'
  defaultCurrency?: string; // 'AED'
  vatRate?: number; // 5
  taxOffice?: string; // 'Federal Tax Authority (FTA), UAE'
  ftaGiban?: string; // e.g. 'AE820330000001004405096'
  arabicAddress?: string;
}

export const DEFAULT_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-mfi',
    name: 'MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP)',
    shortName: 'MARINE FASTENERS',
    code: 'MFI',
    subtitle: 'MANUFACTURERS & STOCKISTS OF HIGH TENSILE FASTENERS, FOUNDATION BOLTS & STRUCTURAL STEEL',
    address: 'Plot Number #0654, Shed No # 31, New Industrial Area, Ajman, UAE',
    trn: '100440509600003',
    phone: '+971 6 525 0526',
    email: 'sales@marinefasteners.co',
    website: 'www.marinefasteners.co',
    sellerName: 'Mr. Fahim',
    sellerDesignation: 'Sales Executive',
    sellerPhone: '+971 6 525 0526',
    sellerMobile: '+971-52-3627048 / 056-4857501',
    sellerEmail: 'sales@marinefasteners.co',
    sellerWebsite: 'www.marinefasteners.co',
    showIso: true,
    isoText: 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018',
    qcDepartmentName: 'INDUSTRIES QC HEAD',
    deliveryDepartmentName: 'MFI LOGISTICS & DISPATCH',
    showLogo: false,
    logoUrl: '/logo.png',
    showStamp: true,
    stampUrl: '',
    stampX: 30,
    stampY: 70,
    stampScale: 1,
    stampLayer: 'front',
    showSignatures: true,
    isDefault: true,
    bankBeneficiary: 'MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP)',
    bankName: 'RAK BANK',
    bankBranch: 'KING FAISAL STREET, SHARJAH, UAE',
    bankAccountNo: '0242715908001',
    bankIban: 'AE 940400000242715908001',
    bankSwiftCode: 'NRAKAEAK',
    bankCountry: 'UAE',
    ftaGiban: 'AE820330000001004405096'
  },
  {
    id: 'comp-bmm',
    name: 'BOLTMASTER BUILDING MATERIALS LLC',
    shortName: 'BOLT MASTER',
    code: 'BMM',
    subtitle: 'DEALERS IN INDUSTRIAL FASTENERS, HARDWARE & FIXINGS',
    address: 'Plot #108, Industrial Area 3, Al Quoz, Dubai / Ajman, UAE',
    trn: '100288371900003',
    phone: '+971 4 338 1200',
    email: 'info@boltmaster.ae',
    website: 'www.boltmaster.ae',
    sellerName: 'Mr. Tariq',
    sellerDesignation: 'Senior Sales Representative',
    sellerPhone: '+971 4 338 1200',
    sellerMobile: '+971 50 123 4567',
    sellerEmail: 'info@boltmaster.ae',
    sellerWebsite: 'www.boltmaster.ae',
    showIso: true,
    isoText: 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018',
    qcDepartmentName: 'BOLTMASTER QC HEAD',
    deliveryDepartmentName: 'BOLTMASTER LOGISTICS & DELIVERY',
    showLogo: false,
    logoUrl: '/logo.png',
    showStamp: true,
    stampUrl: '',
    stampX: 30,
    stampY: 70,
    stampScale: 1,
    stampLayer: 'front',
    showSignatures: true,
    isDefault: false,
    bankBeneficiary: 'BOLTMASTER BUILDING MATERIALS LLC',
    bankName: 'EMIRATES NBD',
    bankBranch: 'AL QUOZ BRANCH, DUBAI, UAE',
    bankAccountNo: '1012883719001',
    bankIban: 'AE 4800300001012883719001',
    bankSwiftCode: 'EBBKAEAD',
    bankCountry: 'UAE',
    ftaGiban: 'AE820330000001002883719'
  },
  {
    id: 'comp-umi',
    name: 'UNITED METAL INDUSTRIES (SPS-L.L.C)',
    shortName: 'UNITED METAL',
    code: 'UMI',
    subtitle: 'FABRICATION, GALVANIZING & HEAVY METAL PRODUCTS DIVISION',
    address: 'Jurph Industrial Area 2, P.O. Box 8421, Ajman, UAE',
    trn: '100391448200003',
    phone: '+971 6 748 3321',
    email: 'contact@unitedmetal.ae',
    website: 'www.unitedmetal.ae',
    sellerName: 'Mr. Rashid',
    sellerDesignation: 'Technical Sales Manager',
    sellerPhone: '+971 6 748 3321',
    sellerMobile: '+971 55 987 6543',
    sellerEmail: 'contact@unitedmetal.ae',
    sellerWebsite: 'www.unitedmetal.ae',
    showIso: true,
    isoText: 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018',
    qcDepartmentName: 'UNITED METAL QC HEAD',
    deliveryDepartmentName: 'UMI DISPATCH & FLEET',
    showLogo: false,
    logoUrl: '/logo.png',
    showStamp: true,
    stampUrl: '',
    stampX: 30,
    stampY: 70,
    stampScale: 1,
    stampLayer: 'front',
    showSignatures: true,
    isDefault: false,
    bankBeneficiary: 'UNITED METAL INDUSTRIES (SPS-L.L.C)',
    bankName: 'ADCB (ABU DHABI COMMERCIAL BANK)',
    bankBranch: 'AJMAN CORNICHE BRANCH, UAE',
    bankAccountNo: '0204918237001',
    bankIban: 'AE 550210000204918237001',
    bankSwiftCode: 'ADCBAEAA',
    bankCountry: 'UAE',
    ftaGiban: 'AE820330000001003914482'
  }
];

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = DEFAULT_COMPANIES[0];

const COMPANIES_LIST_STORAGE_KEY = 'MFI_COMPANIES_LIST_V3';
const ACTIVE_COMPANY_ID_KEY = 'MFI_ACTIVE_COMPANY_ID_V3';
const LEGACY_STORAGE_KEY = 'MFI_COMPANY_PROFILE_V2';

/**
 * Filter available companies according to logged in user permissions.
 * If Marine Fasteners logs in -> shows only Marine Fasteners
 * If Bolt Master logs in -> shows only Bolt Master
 * If United Metal logs in -> shows only United Metal
 */
export function getUserCompanies(user?: any, allCompanies?: CompanyProfile[]): CompanyProfile[] {
  const fullList = allCompanies && allCompanies.length > 0 ? allCompanies : getCompaniesList();
  
  let targetUser = user;
  if (!targetUser) {
    try {
      const savedUserStr = localStorage.getItem('mf_current_user');
      if (savedUserStr) {
        targetUser = JSON.parse(savedUserStr);
      }
    } catch (e) {}
  }

  // All admins, managers, and directors have access to all companies in the ERP
  if (!targetUser || 
      (targetUser.role && (targetUser.role.toLowerCase() === 'admin' || targetUser.role.toLowerCase() === 'super admin' || targetUser.role.toLowerCase() === 'manager')) ||
      targetUser.canViewSystemRegistry ||
      targetUser.id === 'user-admin' ||
      targetUser.id === 'user-fhm-02'
  ) {
    return fullList;
  }

  // Direct allowedCompanies list if specifically restricted
  if (Array.isArray(targetUser.allowedCompanies) && targetUser.allowedCompanies.length > 0) {
    if (targetUser.allowedCompanies.includes('all')) return fullList;
    const filtered = fullList.filter(c => targetUser.allowedCompanies.includes(c.id));
    if (filtered.length > 0) return filtered;
  }

  // Default to full list so users can switch between companies in F3
  return fullList;
}

/**
 * Check if the active company is Bolt Master
 */
export function isBoltMasterCompany(comp?: CompanyProfile): boolean {
  const c = comp || getActiveCompany();
  if (!c) return false;
  const name = (c.name || '').toLowerCase();
  const code = (c.code || '').toUpperCase();
  const id = (c.id || '').toLowerCase();
  return code === 'BMM' || id === 'comp-bmm' || name.includes('bolt');
}

/**
 * Check if the active company is United Metal
 */
export function isUnitedMetalCompany(comp?: CompanyProfile): boolean {
  const c = comp || getActiveCompany();
  if (!c) return false;
  const name = (c.name || '').toLowerCase();
  const code = (c.code || '').toUpperCase();
  const id = (c.id || '').toLowerCase();
  return code === 'UMI' || id === 'comp-umi' || name.includes('united') || name.includes('metal');
}

/**
 * Check if the active company is Marine Fasteners
 */
export function isMarineFastenersCompany(comp?: CompanyProfile): boolean {
  const c = comp || getActiveCompany();
  if (!c) return true;
  const name = (c.name || '').toLowerCase();
  const code = (c.code || '').toUpperCase();
  const id = (c.id || '').toLowerCase();
  return code === 'MFI' || id.includes('mfi') || name.includes('marine fasteners');
}

/**
 * Get dynamic vector QC Stamp SVG for any company
 */
export function getCompanyQcStampSvg(comp?: CompanyProfile): string {
  const c = comp || getActiveCompany();
  const compName = (c.shortName || c.name || 'ENTERPRISE QC').toUpperCase();
  const compLoc = c.address ? (c.address.split(',').slice(-2).join(' - ').trim().toUpperCase() || 'AJMAN - U.A.E.') : 'AJMAN - U.A.E.';
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <path id="textPathTop" d="M 30,120 A 90,90 0 0,1 210,120" />
    <path id="textPathBottom" d="M 210,120 A 90,90 0 0,1 30,120" />
  </defs>
  <circle cx="120" cy="120" r="114" fill="none" stroke="#1e3a8a" stroke-width="4.5" stroke-dasharray="8 4" opacity="0.9"/>
  <circle cx="120" cy="120" r="106" fill="#f8fafc" fill-opacity="0.08" stroke="#1e3a8a" stroke-width="3" opacity="0.95"/>
  <circle cx="120" cy="120" r="76" fill="none" stroke="#1e3a8a" stroke-width="2" opacity="0.9"/>
  
  <text fill="#1e3a8a" font-family="Arial, sans-serif" font-size="10.5" font-weight="900" letter-spacing="1.5">
    <textPath href="#textPathTop" startOffset="50%" text-anchor="middle">
      ${compName}
    </textPath>
  </text>
  
  <text fill="#1e3a8a" font-family="Arial, sans-serif" font-size="10" font-weight="800" letter-spacing="2">
    <textPath href="#textPathBottom" startOffset="50%" text-anchor="middle">
      ★ ${compLoc} ★
    </textPath>
  </text>
  
  <g transform="translate(120, 120)" text-anchor="middle">
    <rect x="-62" y="-18" width="124" height="36" rx="4" fill="#1e3a8a" fill-opacity="0.12" stroke="#1e3a8a" stroke-width="1.5"/>
    <text y="-2" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="13" font-weight="900" letter-spacing="1">QA / QC</text>
    <text y="12" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="10" font-weight="800" letter-spacing="1.5">APPROVED</text>
  </g>
</svg>
`)}`;
}

/**
 * Get dynamic legal clause for QC reports
 */
export function getCompanyLegalClause(comp?: CompanyProfile): string {
  const c = comp || getActiveCompany();
  const name = (c.name || 'THIS COMPANY').toUpperCase();
  return `THIS CERTIFICATE IS FOR THE EXCLUSIVE USE TO WHOM IT IS ADDRESSED AND ${name} NEITHER MAKES NOR ASSUMES RESPONSIBILITY FOR AND REPRESENTATION OR CERTIFICATION TO ANY OTHER PARTY. THIS REPORT APPLIES ONLY TO THE ACTUAL SAMPLES TESTED AND THE HEAT OR LOT THEY REPRESENT. TESTS CONFORM TO THE REQUIREMENTS OF THE SPECIFICATION LISTED. THIS REPORT MAY NOT BE REPRODUCED EXCEPT IN FULL, WITHOUT THE WRITTEN APPROVAL OF ${name}. THE RESULTS REPORTED ON THIS TEST REPORT REPRESENT THE ACTUAL ATTRIBUTES OF THE MATERIAL FURNISHED AND INDICATE FULL COMPLIANCE WITH ALL APPLICABLE SPECIFICATION AND CONTRACT REQUIREMENTS.`;
}

/**
 * Get dynamic Country of Origin declaration text
 */
export function getCompanyCooDeclaration(comp?: CompanyProfile): string {
  const c = comp || getActiveCompany();
  return `We hereby declare and certify that the goods described below have been manufactured, processed and produced in the UNITED ARAB EMIRATES by ${c.name} and strictly conform to the purchase order and technical specifications.`;
}

/**
 * Get ISO text for the given or active company.
 * Only returns ISO certification text if company is Marine Fasteners or has showIso enabled.
 */
export function getCompanyIsoText(comp?: CompanyProfile): string {
  const c = comp || getActiveCompany();
  if (!c) return 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018';
  
  if (c.showIso || isMarineFastenersCompany(c)) {
    return c.isoText || 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018';
  }
  return '';
}

/**
 * Get QC Department / Head title for company
 */
export function getCompanyQcHead(comp?: CompanyProfile): string {
  const c = comp || getActiveCompany();
  if (!c) return 'INDUSTRIES QC HEAD';
  if (c.qcDepartmentName) return c.qcDepartmentName;
  if (isMarineFastenersCompany(c)) return 'INDUSTRIES QC HEAD';
  return `${(c.shortName || c.name || 'QC').toUpperCase()} QC HEAD`;
}

/**
 * Get Delivery Department title for company
 */
export function getCompanyDeliveryDept(comp?: CompanyProfile): string {
  const c = comp || getActiveCompany();
  if (!c) return 'MFI LOGISTICS & DISPATCH';
  if (c.deliveryDepartmentName) return c.deliveryDepartmentName;
  if (isMarineFastenersCompany(c)) return 'MFI LOGISTICS & DISPATCH';
  return `${(c.shortName || c.name || 'LOGISTICS').toUpperCase()} DISPATCH DIVISION`;
}

/**
 * Get the list of all registered companies from localStorage
 */
export function getCompaniesList(): CompanyProfile[] {
  try {
    const saved = localStorage.getItem(COMPANIES_LIST_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure base default fields exist if undefined, but NEVER overwrite user-saved edits
        const list = parsed.map((c: CompanyProfile) => {
          const matchingDef = DEFAULT_COMPANIES.find(d => d.id === c.id);
          if (matchingDef) {
            return {
              ...matchingDef,
              ...c, // Saved user edits ALWAYS take precedence and stay stable!
            };
          }
          return c;
        });
        DEFAULT_COMPANIES.forEach(def => {
          if (!list.some(c => c.id === def.id)) {
            list.push(def);
          }
        });
        return list;
      }
    }

    // Check legacy single-company profile to migrate
    const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacySaved) {
      try {
        const legacyParsed = JSON.parse(legacySaved);
        const migratedList = DEFAULT_COMPANIES.map(comp => {
          if (comp.id === 'comp-mfi') {
            return {
              ...comp,
              ...legacyParsed,
              id: 'comp-mfi',
              code: 'MFI'
            };
          }
          return comp;
        });
        localStorage.setItem(COMPANIES_LIST_STORAGE_KEY, JSON.stringify(migratedList));
        return migratedList;
      } catch (e) {
        console.error('Failed to migrate legacy company profile', e);
      }
    }
  } catch (e) {
    console.error('Failed to load companies list from localStorage', e);
  }

  localStorage.setItem(COMPANIES_LIST_STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
  return DEFAULT_COMPANIES;
}

/**
 * Save companies list to localStorage
 */
export function saveCompaniesList(list: CompanyProfile[]): void {
  try {
    localStorage.setItem(COMPANIES_LIST_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('companies_list_updated', { detail: list }));
  } catch (e: any) {
    console.error('Failed to save companies list', e);
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.toString().toLowerCase().includes('quota')) {
      alert('Storage quota exceeded. Image file in company logo/stamp is too large. Please upload smaller images.');
    }
  }
}

/**
 * Get active company ID
 */
export function getActiveCompanyId(): string {
  try {
    const list = getCompaniesList();
    const saved = localStorage.getItem(ACTIVE_COMPANY_ID_KEY);
    if (saved && list.some(c => c.id === saved)) {
      return saved;
    }
    const savedUser = localStorage.getItem('mf_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const allowed = getUserCompanies(user, list);
      if (allowed.length > 0) {
        return allowed[0].id;
      }
    }
    if (list.length > 0) return list[0].id;
  } catch (e) {
    // Ignore
  }
  return DEFAULT_COMPANIES[0].id;
}

/**
 * Set active company ID and notify all subscribers
 */
export function setActiveCompanyId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_COMPANY_ID_KEY, id);
    const active = getActiveCompany();
    window.dispatchEvent(new CustomEvent('active_company_changed', { detail: active }));
    window.dispatchEvent(new CustomEvent('company_profile_updated', { detail: active }));
  } catch (e) {
    console.error('Failed to set active company id', e);
  }
}

/**
 * Get the currently active company profile
 */
export function getActiveCompany(): CompanyProfile {
  const list = getCompaniesList();
  const activeId = getActiveCompanyId();
  const found = list.find(c => c.id === activeId);
  return found || list[0] || DEFAULT_COMPANY_PROFILE;
}

/**
 * Add a new company to the list
 */
export function addCompany(data: Partial<CompanyProfile>): CompanyProfile {
  const list = getCompaniesList();
  const code = (data.code || data.name?.substring(0, 3) || 'CMP').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const newCompany: CompanyProfile = {
    id: `comp-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: data.name || 'New Company LLC',
    shortName: data.shortName || data.name?.split(' ')[0] || 'Company',
    code: code || 'CMP',
    subtitle: data.subtitle || 'INDUSTRIAL TRADING & MANUFACTURING DIVISION',
    address: data.address || 'Industrial Area, UAE',
    trn: data.trn || '100000000000003',
    phone: data.phone || '+971 6 000 0000',
    email: data.email || 'info@company.ae',
    website: data.website || 'www.company.ae',
    showIso: data.showIso !== undefined ? data.showIso : false,
    isoText: data.isoText || '',
    qcDepartmentName: data.qcDepartmentName || `${(data.shortName || data.name?.split(' ')[0] || 'QC').toUpperCase()} QC HEAD`,
    deliveryDepartmentName: data.deliveryDepartmentName || `${(data.shortName || data.name?.split(' ')[0] || 'LOGISTICS').toUpperCase()} DISPATCH`,
    showLogo: data.showLogo !== undefined ? data.showLogo : false,
    logoUrl: data.logoUrl || '/logo.png',
    showStamp: data.showStamp !== undefined ? data.showStamp : true,
    stampUrl: data.stampUrl || '',
    stampX: data.stampX ?? 30,
    stampY: data.stampY ?? 70,
    stampScale: data.stampScale ?? 1,
    stampLayer: data.stampLayer || 'front',
    showSignatures: data.showSignatures !== undefined ? data.showSignatures : true,
    isDefault: false,
    authorizedUsers: data.authorizedUsers || []
  };

  const updatedList = [...list, newCompany];
  saveCompaniesList(updatedList);
  return newCompany;
}

/**
 * Update an existing company
 */
export function updateCompany(companyOrId: CompanyProfile | string, maybePartial?: Partial<CompanyProfile>): void {
  if (typeof companyOrId === 'string') {
    const list = getCompaniesList();
    const existing = list.find(c => c.id === companyOrId);
    if (existing && maybePartial) {
      updateCompany({ ...existing, ...maybePartial, id: companyOrId });
    }
    return;
  }
  const company = companyOrId;
  const list = getCompaniesList();
  const updatedList = list.map(c => c.id === company.id ? { ...c, ...company } : c);
  saveCompaniesList(updatedList);
  
  if (getActiveCompanyId() === company.id) {
    window.dispatchEvent(new CustomEvent('active_company_changed', { detail: company }));
    window.dispatchEvent(new CustomEvent('company_profile_updated', { detail: company }));
  }
}

/**
 * Delete a company (cannot delete if it's the only one or default)
 */
export function deleteCompany(id: string): boolean {
  const list = getCompaniesList();
  if (list.length <= 1) {
    alert('Cannot delete the last remaining company.');
    return false;
  }
  const updatedList = list.filter(c => c.id !== id);
  saveCompaniesList(updatedList);

  if (getActiveCompanyId() === id) {
    setActiveCompanyId(updatedList[0].id);
  }
  return true;
}

/**
 * Backward compatibility: get active company profile
 */
export function getCompanyProfile(): CompanyProfile {
  return getActiveCompany();
}

/**
 * Backward compatibility: save company profile
 */
export function getCompanyById(id: string): CompanyProfile | undefined {
  const list = getCompaniesList();
  return list.find(c => c.id === id);
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  const list = getCompaniesList();
  const idToSave = profile.id || getActiveCompanyId();
  const existing = list.find(c => c.id === idToSave);
  if (existing) {
    updateCompany({ ...existing, ...profile, id: idToSave });
  } else {
    updateCompany(profile);
  }
}

export function compressImage(dataUrl: string, maxDimension = 500, removeWhiteBg = false): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      if (removeWhiteBg) {
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 40) {
              data[i + 3] = 0;
              continue;
            }

            const brightness = (r + g + b) / 3;
            if (brightness > 160 || (r > 150 && g > 150 && b > 150)) {
              data[i + 3] = 0;
            } else {
              data[i + 3] = a > 200 ? 255 : a;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {
          console.warn('White background removal skipped:', e);
        }
      }

      try {
        const compressed = canvas.toDataURL('image/png');
        resolve(compressed);
      } catch (err) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function cleanAndEnhanceStampImage(dataUrl: string): Promise<string> {
  return compressImage(dataUrl, 500, true);
}

/**
 * Returns dynamic purchase and GRN categories customized for the active company
 */
export function getCompanyPurchaseCategories(company?: CompanyProfile | null): string[] {
  const code = (company?.code || 'MFI').toUpperCase();
  if (code === 'BMM') {
    return [
      "Trading Hardware & Fasteners (BMM)",
      "Building Materials & Fixings (BMM)",
      "Packaging Boxes & Labels (BMM)",
      "Warehouse Handling Equipment (BMM)",
      "Local Logistics & Transport (BMM)",
      "Showroom Overheads & Store Consumables (BMM)",
      "Import Freight & Custom Clearance (BMM)",
      "General Trading Expenses (BMM)"
    ];
  } else if (code === 'UMI') {
    return [
      "Sheet Metal Coils & Heavy Billets (UMI)",
      "Galvanizing Zinc & Chemical Baths (UMI)",
      "Heavy Fabrication Steel Profiles (UMI)",
      "CNC Cutting Tools & Inserts (UMI)",
      "Crane & Hydraulic Spares (UMI)",
      "Flatbed Haulage & Heavy Transport (UMI)",
      "Plant Industrial Power & Gas (UMI)",
      "Subcontract Work & Engineering Services (UMI)",
      "General Fabrication Expenses (UMI)"
    ];
  }
  // Default to Marine Fasteners Industries
  return [
    "Steel Wire Rods / Raw Materials (MFI)",
    "Cold Heading & Tooling Dies (MFI)",
    "Threading & Hot Dip Chemicals (MFI)",
    "Industrial Packaging Materials (MFI)",
    "Machinery Spare Parts (MFI)",
    "Freight & Logistics Charges (MFI)",
    "Factory Overheads & Consumables (MFI)",
    "Work Order / Job Work (MFI)",
    "Other Operational Expenses (MFI)"
  ];
}

/**
 * Returns dynamic fixed asset categories customized for the active company
 */
export function getCompanyFixedAssetCategories(company?: CompanyProfile | null): string[] {
  const companyId = company?.id || getActiveCompanyId();
  try {
    const saved = localStorage.getItem(`MFI_FIXED_ASSET_CATEGORIES_${companyId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  const code = (company?.code || 'MFI').toUpperCase();
  if (code === 'BMM') {
    return [
      "Trading Logistics & Fleet",
      "Warehouse Heavy Racking & Shelving",
      "Showroom Display & Fixtures",
      "Material Handling Forklifts & Stackers",
      "Point of Sale & IT Infrastructure",
      "Store & Office Properties"
    ];
  } else if (code === 'UMI') {
    return [
      "Hydraulic Stamping Presses & Shears",
      "CNC Machining & Milling Centers",
      "Galvanizing Tanks & Surface Treatment Lines",
      "Overhead Gantry Cranes & Hoists",
      "Metallurgical Lab & Quality Testing Systems",
      "Industrial Plant Facilities"
    ];
  }
  // Default to MFI
  return [
    "Machinery",
    "Cold Heading & Threading",
    "Production Tooling & Dies",
    "Packaging Lines",
    "Coating & Galvanizing",
    "Delivery & Logistics Vehicles",
    "Warehouse Equipment",
    "Office & IT",
    "Factory Properties"
  ];
}

/**
 * Saves customized fixed asset categories for a company
 */
export function saveCompanyFixedAssetCategories(companyId: string, categories: string[]): void {
  try {
    localStorage.setItem(`MFI_FIXED_ASSET_CATEGORIES_${companyId}`, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('fixed_asset_categories_updated', { detail: { companyId, categories } }));
  } catch (e) {
    console.error('Failed to save fixed asset categories', e);
  }
}

/**
 * Returns dynamic financial daybook / ledger categories customized for the active company
 */
export function getCompanyFinancialCategories(company?: CompanyProfile | null): string[] {
  const code = (company?.code || 'MFI').toUpperCase();
  if (code === 'BMM') {
    return [
      "Finished Goods Trading Purchases",
      "Wholesale Logistics & Transport",
      "Showroom Rental & Utilities",
      "Commercial Sales Commission",
      "Retail Packaging & Bags",
      "Trading Operating Expenses"
    ];
  } else if (code === 'UMI') {
    return [
      "Heavy Metal Coils & Direct Materials",
      "Galvanizing Plant Chemical Costs",
      "Industrial Gas & Plant Power Consumption",
      "Heavy Haulage & Flatbed Logistics",
      "Fabrication Tooling & Maintenance",
      "Plant Operating Expenses"
    ];
  }
  // Default to MFI
  return [
    "Raw Material Direct Purchases",
    "Manufacturing Plant Overheads",
    "Hot-Dip Galvanizing & Coating Expenses",
    "Freight Inward / Transport",
    "Factory Utility & Power",
    "Machinery Maintenance & Tooling",
    "Administrative & Office Operating Expenses"
  ];
}

/**
 * Returns dynamic GRN / Goods Inward categories customized for the active company
 */
export function getCompanyGrnCategories(company?: CompanyProfile | null): string[] {
  const code = (company?.code || 'MFI').toUpperCase();
  if (code === 'BMM') {
    return [
      "Hardware Stock Goods Receipt",
      "Fixings & Wall Plugs Material Inward",
      "Direct Commercial Shipments",
      "Packaging & Carton Deliveries",
      "Customer Return / Restock Inward"
    ];
  } else if (code === 'UMI') {
    return [
      "Steel Plate & Coil Receiving",
      "Galvanizing Chemicals & Zinc Inward",
      "Heavy Profile Billet Inward",
      "Subcontract Machined Parts GRN",
      "Fabrication Raw Materials Inward"
    ];
  }
  return [
    "Raw Steel Wire Rod Inward",
    "Heat Treatment / Coating Material Receipt",
    "Tooling & Die Inward GRN",
    "Packaging & Pallet Deliveries",
    "Consumable Goods Receipt"
  ];
}

/**
 * Returns dynamic Operations / Work Orders / Workflow categories customized for the active company
 */
export function getCompanyOpsCategories(company?: CompanyProfile | null): string[] {
  const code = (company?.code || 'MFI').toUpperCase();
  if (code === 'BMM') {
    return [
      "Retail Batch Sorting & Repacking",
      "Warehouse Bulk De-kitting & Labeling",
      "Hardware Quality Inspection & Tagging",
      "Customer Custom Kit Assembly",
      "Order Fulfillment & Dispatch Operations"
    ];
  } else if (code === 'UMI') {
    return [
      "CNC Plasma & Laser Cutting Works",
      "Heavy Hydraulic Press & Stamping",
      "Hot-Dip Galvanizing & Acid Pickling",
      "Structural Welding & Frame Assembly",
      "Precision Milling & Quality Testing"
    ];
  }
  return [
    "Cold Heading & Wire Drawing",
    "High-Speed Thread Rolling",
    "Heat Treatment & Tempering",
    "Surface Treatment & Passivation",
    "Final Inspection & Automated Packaging"
  ];
}

/**
 * Returns dynamic Inventory product groups / categories customized for the active company
 */
export function getCompanyInventoryCategories(company?: CompanyProfile | null): string[] {
  const code = (company?.code || 'MFI').toUpperCase();
  if (code === 'BMM') {
    return [
      "Commercial Hex Bolts & Nuts",
      "Masonry Anchors & Wall Fixings",
      "Drywall & Self-Drilling Screws",
      "Power Tool Bits & Hardware Accessories",
      "Washers, Spacers & Shims",
      "Plumbing & HVAC Clamps",
      "Structural Rigging Hardware"
    ];
  } else if (code === 'UMI') {
    return [
      "Galvanized Structural Base Plates",
      "Heavy Foundation Anchor Cages",
      "Fabricated Pipe Hangers & Strut Channels",
      "Custom CNC Machined Steel Components",
      "T-Head Bolts & Heavy Duty Brackets",
      "Industrial Galvanized Flanges"
    ];
  }
  return [
    "HEX BOLTS (FULL THREAD)",
    "HEX BOLTS (HALF THREAD)",
    "ALL THREAD ROD",
    "STUD BOLTS",
    "HEX NUTS & HEAVY HEX NUTS",
    "FLAT & SPRING WASHERS",
    "ANCHOR BOLTS & CHEMICAL ANCHORS",
    "SOCKET CAP SCREWS",
    "MACHINE SCREWS",
    "SELF TAPPING & DRILLING SCREWS",
    "PIPE SUPPORT CLAMPS & BRACKETS"
  ];
}

