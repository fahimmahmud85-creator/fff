import { DataSheetRecord, DimensionalInspectionRow, MultiSizeInspectionRow } from './dataSheetTypes';

export const CHEMICAL_DEFAULT_HEADERS = [
  '%C', '%Si', '%Mn', '%P', '%S', '%Cr', '%Ni', '%Mo', '%Cu', '%V', '%N', '%Al', '%Ti', '%B'
];

export const MECHANICAL_DEFAULT_HEADERS = [
  'TENSILE STRENGTH (UTS)',
  'YIELD STRENGTH (YS)',
  'ELONGATION (EL)',
  'REDUCTION OF AREA (RA)',
  'PROOFLOAD',
  'HARDNESS',
  'HEAT TREATMENT',
  'HARDNESS AFTER TREATMENT',
  'QUENCHING TEMP',
  'HOLDING TIME (QUENCH)',
  'QUENCHING MEDIUM',
  'STRESS RELIEVED',
  'IMPACT IN J',
  'AVERAGE IMPACT IN J',
  'IMPACT TEST TEMP'
];

export const MULTI_SIZE_DEFAULT_HEADERS = [
  'ITEM',
  'SIZE / DIA',
  'LENGTH (mm)',
  'ACROSS FLAT (s)',
  'ACROSS CORNER (e)',
  'THICKNESS (m)',
  'THREAD / PITCH',
  'STANDARD / GR',
  'QTY / LOT',
  'FINISH',
  'REMARKS'
];

export const MULTI_SIZE_DEFAULT_SELECTED_COLUMNS = [
  true, true, true, true, true, true, true, true, true, true, true
];

export const MULTI_SIZE_FIELDS: (keyof MultiSizeInspectionRow)[] = [
  'itemNo',
  'size',
  'length',
  'acrossFlat',
  'acrossCorner',
  'thickness',
  'threadPitch',
  'standardGrade',
  'sampleQty',
  'visualFinish',
  'remarks'
];

export const DEFAULT_MULTI_SIZE_ROWS: MultiSizeInspectionRow[] = [
  {
    id: 'ms-1',
    itemNo: '01',
    size: 'M6',
    length: '—',
    acrossFlat: '9.78 - 10.00',
    acrossCorner: 'MIN 11.05',
    thickness: '4.70 - 5.00',
    threadPitch: '1.00 (6H)',
    standardGrade: 'DIN 934 / GR 8',
    sampleQty: '20 PCS',
    visualFinish: 'HDG / PASS',
    remarks: 'CONFORMS'
  },
  {
    id: 'ms-2',
    itemNo: '02',
    size: 'M8',
    length: '—',
    acrossFlat: '12.73 - 13.00',
    acrossCorner: 'MIN 14.38',
    thickness: '6.14 - 6.50',
    threadPitch: '1.25 (6H)',
    standardGrade: 'DIN 934 / GR 8',
    sampleQty: '20 PCS',
    visualFinish: 'HDG / PASS',
    remarks: 'CONFORMS'
  },
  {
    id: 'ms-3',
    itemNo: '03',
    size: 'M10',
    length: '—',
    acrossFlat: '16.73 - 17.00',
    acrossCorner: 'MIN 18.90',
    thickness: '7.64 - 8.00',
    threadPitch: '1.50 (6H)',
    standardGrade: 'DIN 934 / GR 8',
    sampleQty: '20 PCS',
    visualFinish: 'HDG / PASS',
    remarks: 'CONFORMS'
  },
  {
    id: 'ms-4',
    itemNo: '04',
    size: 'M12',
    length: '—',
    acrossFlat: '18.67 - 19.00',
    acrossCorner: 'MIN 21.10',
    thickness: '9.64 - 10.00',
    threadPitch: '1.75 (6H)',
    standardGrade: 'DIN 934 / GR 8',
    sampleQty: '20 PCS',
    visualFinish: 'HDG / PASS',
    remarks: 'CONFORMS'
  },
  {
    id: 'ms-5',
    itemNo: '05',
    size: 'M16',
    length: '—',
    acrossFlat: '23.67 - 24.00',
    acrossCorner: 'MIN 26.75',
    thickness: '12.57 - 13.00',
    threadPitch: '2.00 (6H)',
    standardGrade: 'DIN 934 / GR 8',
    sampleQty: '20 PCS',
    visualFinish: 'HDG / PASS',
    remarks: 'CONFORMS'
  },
  {
    id: 'ms-6',
    itemNo: '06',
    size: 'M20',
    length: '—',
    acrossFlat: '29.16 - 30.00',
    acrossCorner: 'MIN 32.95',
    thickness: '15.57 - 16.00',
    threadPitch: '2.50 (6H)',
    standardGrade: 'DIN 934 / GR 8',
    sampleQty: '20 PCS',
    visualFinish: 'HDG / PASS',
    remarks: 'CONFORMS'
  }
];

// Presets for Fasteners
export const DEFAULT_DIN934_HEX_NUT_RECORD: DataSheetRecord = {
  id: 'ds-din934-m8',
  dataSheetNo: 'DS/2026/159648',
  date: '—',
  customer: 'ZAMIL HEAVY INDUSTRIES LTD',
  subject: 'DIMENSIONAL INSPECTIONS & TECHNICAL REQUIREMENTS FOR DIN 934 HEX NUT',
  
  templateType: 'template1',
  printOrientation: 'landscape', // User requested HORIZONTAL PRINT PDF

  // Editable Header (Dynamically hydrated from saved branding or active company)
  headerCompanyName: '',
  headerCompanySub: '',
  headerCompanyAddress: '',
  headerCompanyContact: '',
  headerPrintEmailAndWeb: true,
  headerLogoText: '',
  headerLogoInitials: '',
  headerIsoText: '',
  headerDocTitle: 'DATA SHEET',
  page1Title: 'DATA SHEET',
  page2Title: 'DATA SHEET',
  customLogoImage: '',
  customIsoImage: '',

  showObjective: true,
  objectiveContent: 'To verify dimensional tolerances and conforming standard specifications as per client purchase requirements.',

  showDrawings: true,
  leftDrawingTitle: 'DRAWING',
  leftDrawingRef: 'DWG-QC-001',
  leftDrawingCaption: 'TECHNICAL DRAWING: DWG-QC-001',
  leftDrawingType: 'preset_hex_nut',
  leftDrawingImage: '',

  rightDrawingTitle: 'DRAWING',
  rightDrawingRef: '',
  rightDrawingCaption: 'HEAD STAMP / IDENTIFICATION MARKING',
  rightDrawingType: 'stamp_mfi_8',
  rightDrawingImage: '',

  showDimensionalInspection: true,
  dimensionalInspectionTitle: 'DIMENSIONAL INSPECTIONS',
  dimensionalInspections: [
    { id: 'di-1', selected: true, characteristic: 'Across Flat (mm)', requirements: '9.780 - 10.000' },
    { id: 'di-2', selected: true, characteristic: 'Across Corner (mm)', requirements: 'MIN 11.05' },
    { id: 'di-3', selected: true, characteristic: 'Thickness (mm)', requirements: '4.700 - 5.000' },
    { id: 'di-4', selected: true, characteristic: 'Bearing Face Dia (mm)', requirements: 'MIN 8.80' },
    { id: 'di-5', selected: true, characteristic: 'Countersink Dia (mm)', requirements: '6.00 - 6.75' },
    { id: 'di-6', selected: true, characteristic: 'Perpendicularity (mm)', requirements: 'MAX 0.15' },
    { id: 'di-7', selected: true, characteristic: 'Minor Dia.', requirements: 'Coarse 6H' },
    { id: 'di-8', selected: true, characteristic: 'Minor Diameter (mm)', requirements: '4.917 - 5.153' },
    { id: 'di-9', selected: true, characteristic: 'Functional Dia.', requirements: 'Coarse 6H' },
    { id: 'di-10', selected: true, characteristic: 'Visual Appearance', requirements: '—' }
  ],

  // Multi Product (Multi-Size Matrix)
  multiSizeHeaders: [...MULTI_SIZE_DEFAULT_HEADERS],
  multiSizeSelectedColumns: [...MULTI_SIZE_DEFAULT_SELECTED_COLUMNS],
  multiSizeRows: [...DEFAULT_MULTI_SIZE_ROWS],

  includeMtcPage: true,
  chemicalSpecName: 'CARBON STEEL CLASS 8 / 10',
  chemicalHeaders: [...CHEMICAL_DEFAULT_HEADERS],
  chemicalMin: ['0.25', '0.15', '0.60', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—', '—'],
  chemicalMax: ['0.58', '0.35', '0.90', '0.048', '0.048', '—', '—', '—', '—', '—', '—', '—', '—', '—'],
  chemicalObserved: ['0.42', '0.22', '0.75', '0.018', '0.012', '0.05', '0.02', '—', '0.01', '—', '—', '—', '—', '—'],

  mechanicalSpecName: 'DIN 267-4 CLASS 8',
  mechanicalHeaders: [...MECHANICAL_DEFAULT_HEADERS],
  mechanicalMin: ['800', '640', '12', '—', '800', '180', '—', '—', '—', '—', '—', '—', '—', '—', '—'],
  mechanicalMax: ['1000', '—', '—', '—', '—', '302', '—', '—', '—', '—', '—', '—', '—', '—', '—'],
  mechanicalObserved: ['880', '710', '16', '54', '850', '245', 'Q&T', '245', '860°C', '45 min', 'OIL', '550°C', '45', '48', '20°C'],

  preparedByName: 'Prepared By.',
  preparedByTitle: '',
  approvedByName: 'Approved By.',
  approvedByTitle: '',
  approvedByCompany: '',
  preparedBySignatureImage: '',
  approvedBySignatureImage: '',
  stampSealImage: '',
  showSeal: true,
  preparedSignHeight: 48,
  approvedSignHeight: 48,
  stampHeight: 134,
  preparedSignPosX: 0,
  preparedSignPosY: 0,
  approvedSignPosX: 0,
  approvedSignPosY: 0,
  stampPosX: 0,
  stampPosY: 0,

  standard: 'DIN 934',
  category: 'HEAVY HEX NUTS',
  status: 'ACTIVE',
  createdAt: '2026-08-20T06:00:00.000Z',
  updatedAt: '2026-08-20T06:00:00.000Z'
};

export const PRESET_FASTENERS: { id: string; name: string; standard: string; record: Partial<DataSheetRecord> }[] = [
  {
    id: 'din934-m8',
    name: 'DIN 934 Hex Nut (M8 Class 8)',
    standard: 'DIN 934',
    record: DEFAULT_DIN934_HEX_NUT_RECORD
  },
  {
    id: 'din933-m10',
    name: 'DIN 933 / ISO 4017 Hex Bolt (M10 x 50 Gr 8.8)',
    standard: 'DIN 933',
    record: {
      dataSheetNo: 'MFI/2026/160240',
      subject: 'DIMENSIONAL INSPECTIONS & TECHNICAL REQUIREMENTS FOR DIN 933 HEX BOLT',
      objectiveContent: 'To verify thread pitch, across flats width, shank length and head markings for structural fasteners.',
      leftDrawingRef: 'DWG-MFI-BLT-002',
      leftDrawingCaption: 'TECHNICAL DRAWING: DWG-MFI-BLT-002',
      leftDrawingType: 'preset_bolt',
      rightDrawingCaption: 'MFI 8.8 / ISO 4017',
      rightDrawingType: 'stamp_mfi_8_8',
      dimensionalInspections: [
        { id: 'di-1', selected: true, characteristic: 'Across Flat (mm)', requirements: '16.73 - 17.00' },
        { id: 'di-2', selected: true, characteristic: 'Across Corner (mm)', requirements: 'MIN 18.72' },
        { id: 'di-3', selected: true, characteristic: 'Head Height (mm)', requirements: '6.22 - 6.58' },
        { id: 'di-4', selected: true, characteristic: 'Total Length (mm)', requirements: '49.00 - 51.00' },
        { id: 'di-5', selected: true, characteristic: 'Thread Pitch (mm)', requirements: '1.50' },
        { id: 'di-6', selected: true, characteristic: 'Thread Tolerance', requirements: '6g' },
        { id: 'di-7', selected: true, characteristic: 'Straightness (mm)', requirements: 'MAX 0.20' },
        { id: 'di-8', selected: true, characteristic: 'Bearing Face Runout', requirements: 'MAX 0.15' },
        { id: 'di-9', selected: true, characteristic: 'Surface Coating', requirements: 'Hot Dip Galvanized (ASTM A153)' },
        { id: 'di-10', selected: true, characteristic: 'Visual Appearance', requirements: 'Clean, no burrs or dross' }
      ]
    }
  },
  {
    id: 'astm-a193-b7',
    name: 'ASTM A193 Gr. B7 Heavy Flange Stud Bolt (3/4" x 120mm)',
    standard: 'ASTM A193 B7',
    record: {
      dataSheetNo: 'MFI/2026/161450',
      subject: 'TECHNICAL DATA SHEET & INSPECTION FOR ASTM A193 B7 STUD BOLTS',
      objectiveContent: 'To certify tensile strength, hardness, thread profile class 2A and chamfer bevels for high-pressure pipeline flanges.',
      leftDrawingRef: 'DWG-MFI-STD-003',
      leftDrawingCaption: 'TECHNICAL DRAWING: DWG-MFI-STD-003',
      leftDrawingType: 'preset_stud',
      rightDrawingCaption: 'MFI B7 / ASTM A193',
      rightDrawingType: 'stamp_mfi_b7',
      dimensionalInspections: [
        { id: 'di-1', selected: true, characteristic: 'Major Diameter (in)', requirements: '0.742 - 0.748' },
        { id: 'di-2', selected: true, characteristic: 'Overall Length (mm)', requirements: '118.5 - 121.5' },
        { id: 'di-3', selected: true, characteristic: 'Thread Pitch (TPI)', requirements: '10 UNC' },
        { id: 'di-4', selected: true, characteristic: 'Thread Fit Class', requirements: '2A' },
        { id: 'di-5', selected: true, characteristic: 'Point Chamfer Angle', requirements: '45° ± 5°' },
        { id: 'di-6', selected: true, characteristic: 'Straightness Deviation', requirements: 'MAX 0.002 in/in' },
        { id: 'di-7', selected: true, characteristic: 'Surface Finish', requirements: 'Xylan 1424 PTFE Blue' },
        { id: 'di-8', selected: true, characteristic: 'Visual Appearance', requirements: 'Uniform coating, 25-35 µm' }
      ]
    }
  },
  {
    id: 'multi-size-fasteners',
    name: 'Multi-Size Hex Fasteners Matrix (Template 2)',
    standard: 'DIN 934 / ISO 4032',
    record: {
      templateType: 'template2',
      printOrientation: 'landscape',
      dataSheetNo: 'MFI/2026/168800',
      subject: 'MULTIPLEX DIMENSIONAL INSPECTION MATRIX FOR RANGE OF HEX FASTENERS',
      objectiveContent: 'Comprehensive dimensional QA audit across production batch sizes M6 through M20.'
    }
  }
];

export const INITIAL_ARCHIVES_LIST: DataSheetRecord[] = [
  DEFAULT_DIN934_HEX_NUT_RECORD,
  {
    ...DEFAULT_DIN934_HEX_NUT_RECORD,
    id: 'ds-din933-m10',
    dataSheetNo: 'MFI/2026/160240',
    date: '2026-08-15',
    customer: 'DUBAI DRY DOCKS WORLD LLC',
    subject: 'TECHNICAL DATA SHEET FOR DIN 933 FULL THREAD HEX BOLT',
    standard: 'DIN 933',
    leftDrawingType: 'preset_bolt',
    rightDrawingType: 'stamp_mfi_8_8'
  },
  {
    ...DEFAULT_DIN934_HEX_NUT_RECORD,
    id: 'ds-astm-b7',
    dataSheetNo: 'MFI/2026/161450',
    date: '2026-08-18',
    customer: 'NATIONAL PETROLEUM CONSTRUCTION CO (NPCC)',
    subject: 'INSPECTION DATA SHEET FOR ASTM A193 B7 ALL THREAD STUD BOLTS',
    standard: 'ASTM A193 B7',
    leftDrawingType: 'preset_stud',
    rightDrawingType: 'stamp_mfi_b7'
  },
  {
    ...DEFAULT_DIN934_HEX_NUT_RECORD,
    id: 'ds-multi-matrix',
    templateType: 'template2',
    printOrientation: 'landscape',
    dataSheetNo: 'MFI/2026/168800',
    date: '2026-08-20',
    customer: 'EMIRATES GLOBAL ALUMINIUM (EGA)',
    subject: 'MULTIPLEX MULTI-SIZE DIMENSIONAL INSPECTIONS FOR HEX FASTENERS',
    standard: 'DIN 934 / ISO 4032'
  }
];

import { getActiveCompany, isMarineFastenersCompany, CompanyProfile } from '../../utils/companyProfile';

export const getBrandingStorageKey = (companyId?: string) => {
  const compId = companyId || getActiveCompany().id || 'comp-mfi';
  return `DATA_SHEET_BRANDING_${compId.toUpperCase()}`;
};

export const BRANDING_STORAGE_KEY = 'MFI_DATA_SHEET_BRANDING_V2';

export const extractBranding = (rec?: Partial<DataSheetRecord>, targetCompany?: CompanyProfile) => {
  const activeCompany = targetCompany || getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBoltMaster = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUnitedMetal = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');

  const defaultSub = isMfi ? '(SOLE PROPRIETORSHIP)' : (activeCompany.subtitle || '');
  const defaultAddress = activeCompany.phone 
    ? `${activeCompany.address}, Tel: ${activeCompany.phone}` 
    : activeCompany.address;
  const defaultContact = `${activeCompany.email || ''} | ${activeCompany.website || ''}`;
  const defaultLogoText = isMfi ? 'MARINE FASTENERS' : isBoltMaster ? 'BOLT MASTER' : isUnitedMetal ? 'UNITED METAL' : (activeCompany.shortName || activeCompany.name);
  const defaultLogoInitials = isMfi ? 'MF' : isBoltMaster ? 'BM' : isUnitedMetal ? 'UMI' : (activeCompany.code || 'CO');

  return {
    customLogoImage: rec?.customLogoImage !== undefined ? rec.customLogoImage : (activeCompany.logoUrl && activeCompany.logoUrl !== '/logo.png' ? activeCompany.logoUrl : ''),
    customIsoImage: rec?.customIsoImage !== undefined ? rec.customIsoImage : '',
    headerLogoText: rec?.headerLogoText || defaultLogoText,
    headerLogoInitials: rec?.headerLogoInitials || defaultLogoInitials,
    headerCompanyName: rec?.headerCompanyName || activeCompany.name,
    headerCompanySub: rec?.headerCompanySub !== undefined ? rec.headerCompanySub : defaultSub,
    headerCompanyAddress: rec?.headerCompanyAddress || defaultAddress,
    headerCompanyContact: rec?.headerCompanyContact || defaultContact,
    headerPrintEmailAndWeb: rec?.headerPrintEmailAndWeb ?? true,
    headerIsoText: rec?.headerIsoText || (activeCompany.isoText || 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018'),
    preparedByName: rec?.preparedByName || 'Prepared By.',
    preparedByTitle: rec?.preparedByTitle || '',
    approvedByName: rec?.approvedByName || 'Approved By.',
    approvedByTitle: rec?.approvedByTitle || '',
    approvedByCompany: rec?.approvedByCompany || activeCompany.name,
    preparedBySignatureImage: rec?.preparedBySignatureImage !== undefined ? rec.preparedBySignatureImage : '',
    approvedBySignatureImage: rec?.approvedBySignatureImage !== undefined ? rec.approvedBySignatureImage : '',
    stampSealImage: rec?.stampSealImage !== undefined ? rec.stampSealImage : (activeCompany.stampUrl || ''),
    showSeal: rec?.showSeal ?? true,
    preparedSignHeight: rec?.preparedSignHeight ?? 48,
    approvedSignHeight: rec?.approvedSignHeight ?? 48,
    stampHeight: rec?.stampHeight ?? 134,
    preparedSignPosX: rec?.preparedSignPosX ?? 0,
    preparedSignPosY: rec?.preparedSignPosY ?? 0,
    approvedSignPosX: rec?.approvedSignPosX ?? 0,
    approvedSignPosY: rec?.approvedSignPosY ?? 0,
    stampPosX: rec?.stampPosX ?? 0,
    stampPosY: rec?.stampPosY ?? 0
  };
};

export const getPersistedBranding = (currentRecord?: Partial<DataSheetRecord>, company?: CompanyProfile) => {
  const activeCompany = company || getActiveCompany();
  let saved: any = {};
  try {
    const key = getBrandingStorageKey(activeCompany.id);
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      saved = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load branding from storage', e);
  }

  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBoltMaster = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUnitedMetal = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');

  const defaultLogoText = isMfi ? 'MARINE FASTENERS' : isBoltMaster ? 'BOLT MASTER' : isUnitedMetal ? 'UNITED METAL' : (activeCompany.shortName || activeCompany.name);
  const defaultLogoInitials = isMfi ? 'MF' : isBoltMaster ? 'BM' : isUnitedMetal ? 'UMI' : (activeCompany.code || 'CO');

  return {
    customLogoImage: saved.customLogoImage !== undefined ? saved.customLogoImage : (currentRecord?.customLogoImage || (activeCompany.logoUrl && activeCompany.logoUrl !== '/logo.png' ? activeCompany.logoUrl : '')),
    customIsoImage: saved.customIsoImage !== undefined ? saved.customIsoImage : (currentRecord?.customIsoImage || ''),
    headerLogoText: saved.headerLogoText || currentRecord?.headerLogoText || defaultLogoText,
    headerLogoInitials: saved.headerLogoInitials || currentRecord?.headerLogoInitials || defaultLogoInitials,
    headerCompanyName: saved.headerCompanyName || currentRecord?.headerCompanyName || activeCompany.name,
    headerCompanySub: saved.headerCompanySub !== undefined ? saved.headerCompanySub : (currentRecord?.headerCompanySub !== undefined ? currentRecord.headerCompanySub : (isMfi ? '(SOLE PROPRIETORSHIP)' : (activeCompany.subtitle || ''))),
    headerCompanyAddress: saved.headerCompanyAddress || currentRecord?.headerCompanyAddress || (activeCompany.phone ? `${activeCompany.address}, Tel: ${activeCompany.phone}` : activeCompany.address),
    headerCompanyContact: saved.headerCompanyContact || currentRecord?.headerCompanyContact || `${activeCompany.email || ''} | ${activeCompany.website || ''}`,
    headerPrintEmailAndWeb: saved.headerPrintEmailAndWeb !== undefined ? saved.headerPrintEmailAndWeb : (currentRecord?.headerPrintEmailAndWeb ?? true),
    headerIsoText: saved.headerIsoText || currentRecord?.headerIsoText || (activeCompany.isoText || 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018'),
    preparedByName: saved.preparedByName || currentRecord?.preparedByName || 'Prepared By.',
    preparedByTitle: saved.preparedByTitle || currentRecord?.preparedByTitle || '',
    approvedByName: saved.approvedByName || currentRecord?.approvedByName || 'Approved By.',
    approvedByTitle: saved.approvedByTitle || currentRecord?.approvedByTitle || '',
    approvedByCompany: saved.approvedByCompany || currentRecord?.approvedByCompany || activeCompany.name,
    preparedBySignatureImage: saved.preparedBySignatureImage !== undefined ? saved.preparedBySignatureImage : (currentRecord?.preparedBySignatureImage || ''),
    approvedBySignatureImage: saved.approvedBySignatureImage !== undefined ? saved.approvedBySignatureImage : (currentRecord?.approvedBySignatureImage || ''),
    stampSealImage: saved.stampSealImage !== undefined ? saved.stampSealImage : (currentRecord?.stampSealImage !== undefined ? currentRecord.stampSealImage : (activeCompany.stampUrl || '')),
    showSeal: saved.showSeal !== undefined ? saved.showSeal : (currentRecord?.showSeal ?? true),
    preparedSignHeight: saved.preparedSignHeight ?? currentRecord?.preparedSignHeight ?? 48,
    approvedSignHeight: saved.approvedSignHeight ?? currentRecord?.approvedSignHeight ?? 48,
    stampHeight: saved.stampHeight ?? currentRecord?.stampHeight ?? 134,
    preparedSignPosX: saved.preparedSignPosX ?? currentRecord?.preparedSignPosX ?? 0,
    preparedSignPosY: saved.preparedSignPosY ?? currentRecord?.preparedSignPosY ?? 0,
    approvedSignPosX: saved.approvedSignPosX ?? currentRecord?.approvedSignPosX ?? 0,
    approvedSignPosY: saved.approvedSignPosY ?? currentRecord?.approvedSignPosY ?? 0,
    stampPosX: saved.stampPosX ?? currentRecord?.stampPosX ?? 0,
    stampPosY: saved.stampPosY ?? currentRecord?.stampPosY ?? 0
  };
};

export const sanitizeCaptionText = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    trimmed === 'M8 / DIN 934 (CONFORMING)' ||
    trimmed === 'DIN 934 (CONFORMING)' ||
    trimmed === 'M8 / DIN 934' ||
    trimmed === '(CONFORMING)'
  ) {
    return '';
  }
  return val.replace(/\s*\(CONFORMING\)/gi, '').trim();
};

export const sanitizeDataSheetRecord = (rec: DataSheetRecord): DataSheetRecord => {
  if (!rec) return rec;
  const sanitizedRightCaption = sanitizeCaptionText(rec.rightDrawingCaption);
  const sanitizedLeftCaption = sanitizeCaptionText(rec.leftDrawingCaption);
  const sanitizedSheets = (rec.sheets && Array.isArray(rec.sheets))
    ? rec.sheets.map(sh => ({
        ...sh,
        rightDrawingCaption: sanitizeCaptionText(sh.rightDrawingCaption),
        leftDrawingCaption: sanitizeCaptionText(sh.leftDrawingCaption),
      }))
    : undefined;

  return {
    ...rec,
    rightDrawingCaption: sanitizedRightCaption,
    leftDrawingCaption: sanitizedLeftCaption,
    ...(sanitizedSheets ? { sheets: sanitizedSheets } : {})
  };
};

export const savePersistedBranding = (record: Partial<DataSheetRecord>, company?: CompanyProfile) => {
  const activeCompany = company || getActiveCompany();
  try {
    if (typeof window !== 'undefined') {
      const branding = extractBranding(record, activeCompany);
      const key = getBrandingStorageKey(activeCompany.id);
      localStorage.setItem(key, JSON.stringify(branding));
    }
  } catch (e) {
    console.warn('Failed to save branding to localStorage (quota limit reached); saved in session/IndexedDB.', e);
  }
};

