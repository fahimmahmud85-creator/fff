export interface DimensionalInspectionRow {
  id: string;
  selected: boolean;
  characteristic: string;
  requirements: string;
}

export interface MultiSizeInspectionRow {
  id: string;
  itemNo: string;
  size: string;
  length: string;
  acrossFlat: string;
  acrossCorner: string;
  thickness: string;
  threadPitch: string;
  standardGrade: string;
  sampleQty: string;
  visualFinish: string;
  remarks: string;
  // Dynamic cells for custom columns
  cells?: string[];
}

export interface ChemicalElementSpec {
  element: string;
  min: string;
  max: string;
  observed: string;
}

export interface MechanicalPropertySpec {
  property: string;
  min: string;
  max: string;
  observed: string;
}

export interface DataSheetRecord {
  id: string;
  dataSheetNo: string; // e.g. "MFI/2026/159648"
  date: string; // e.g. "2026-08-20" or "—"
  customer: string; // e.g. "ZAMIL HEAVY INDUSTRIES LTD"
  subject: string; // e.g. "DIMENSIONAL INSPECTIONS & TECHNICAL REQUIREMENTS FOR DIN 934 HEX NUT"
  
  // Template & Print Orientation
  templateType: 'template1' | 'template2'; // Template 1: Single Item Detailed | Template 2: Multi-Size Matrix
  printOrientation: 'landscape' | 'portrait'; // Landscape is recommended for wide multi-size & data sheets

  // Editable Header & Branding
  headerCompanyName: string; // Active company or user custom name
  headerCompanySub: string; // Legal subtitle / status
  headerCompanyAddress: string; // Address & Tel
  headerCompanyContact?: string; // Email & Website
  headerPrintEmailAndWeb?: boolean; // true
  headerLogoText?: string; // Text ribbon inside logo (e.g. "MARINE FASTENERS", "BOLT MASTER", "UNITED METAL")
  headerLogoInitials?: string; // Main badge lettering inside logo (e.g. "MF", "BM", "UMI")
  headerIsoText: string; // "ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018"
  headerDocTitle: string; // "DATA SHEET"
  page1Title?: string; // "DATA SHEET"
  page2Title?: string; // "DATA SHEET"
  customLogoImage?: string; // Uploaded Logo Data URL
  customIsoImage?: string; // Uploaded ISO Badge Data URL

  // Objective section
  showObjective: boolean; // Checkbox toggle
  objectiveContent: string; // Text / checklist in objective box

  // Left drawing
  showDrawings?: boolean; // Checkbox toggle
  leftDrawingTitle: string; // "DRAWING"
  leftDrawingRef: string; // "DWG-MFI-QC-001"
  leftDrawingCaption: string; // "TECHNICAL DRAWING: DWG-MFI-QC-001"
  leftDrawingType: string; // 'preset_hex_nut' | 'preset_bolt' | 'preset_stud' | 'preset_washer' | 'preset_socket' | 'custom'
  leftDrawingImage: string; // Data URL or custom SVG

  // Right drawing
  rightDrawingTitle: string; // "DRAWING"
  rightDrawingRef: string; // ""
  rightDrawingCaption: string; // "HEAD STAMP" or custom caption (without CONFORMING)
  rightDrawingType: string; // 'stamp_mfi_8' | 'stamp_mfi_8_8' | 'stamp_mfi_10_9' | 'stamp_mfi_2h' | 'stamp_mfi_b7' | 'stamp_mfi_a4_80' | 'custom'
  rightDrawingImage: string; // Data URL or custom SVG

  // Template 1: Dimensional inspection section
  showDimensionalInspection: boolean; // Checkbox toggle
  dimensionalInspectionTitle: string; // "DIMENSIONAL INSPECTIONS"
  dimensionalInspections: DimensionalInspectionRow[];

  // Template 2: Multi-Size / Multi Product Dimensional Inspection Matrix
  multiSizeHeaders: string[]; // ['ITEM', 'SIZE / DIA', 'LENGTH (mm)', 'ACROSS FLAT (s)', 'ACROSS CORNER (e)', 'THICKNESS (m)', 'THREAD / PITCH', 'STANDARD / GR', 'QTY / LOT', 'FINISH', 'REMARKS']
  multiSizeSelectedColumns?: boolean[]; // Checkbox for each column: if true -> show in Print PDF, if false -> omit from Print PDF
  multiSizeRows: MultiSizeInspectionRow[];

  // Optional Page 2 (Data Sheet Chemical & Mechanical Specs)
  includeMtcPage: boolean; // Checkbox toggle
  chemicalSpecName: string; // e.g. "CARBON STEEL CLASS 8 / 10"
  chemicalHeaders: string[]; // ['%C', '%Si', '%Mn', '%P', '%S', '%Cr', '%Ni', '%Mo', '%Cu', '%V', '%N', '%Al', '%Ti', '%B']
  chemicalMin: string[];
  chemicalMax: string[];
  chemicalObserved: string[];

  mechanicalSpecName: string; // e.g. "CLASS 8 / DIN 267-4"
  mechanicalHeaders: string[]; // ['TENSILE STRENGTH (UTS)', 'YIELD STRENGTH (YS)', 'ELONGATION (EL)', 'REDUCTION OF AREA (RA)', 'PROOFLOAD', 'HARDNESS', 'HEAT TREATMENT', 'HARDNESS AFTER TREATMENT', 'QUENCHING TEMP', 'HOLDING TIME (QUENCH)', 'QUENCHING MEDIUM', 'STRESS RELIEVED', 'IMPACT IN J', 'AVERAGE IMPACT IN J', 'IMPACT TEST TEMP']
  mechanicalMin: string[];
  mechanicalMax: string[];
  mechanicalObserved: string[];
  mechanicalSelectedColumns?: boolean[]; // Checkbox state for each column in Mechanical Properties

  // Signatures & Stamp Uploads
  preparedByName: string; // "Prepared By."
  preparedByTitle?: string; // "Engineer QA/QC"
  approvedByName: string; // "Approved By."
  approvedByTitle?: string; // "Quality Manager" or "Authorized Signatory"
  approvedByCompany: string; // "Marine Fasteners Industries L.L.C. (Sole Proprietorship)"
  preparedBySignatureImage?: string; // Uploaded Signature
  approvedBySignatureImage?: string; // Uploaded Approved Signature
  stampSealImage?: string; // Uploaded Stamp / Seal
  showSeal: boolean;
  preparedSignHeight?: number; // default 48
  approvedSignHeight?: number; // default 48
  stampHeight?: number; // default 134
  preparedSignPosX?: number; // 0
  preparedSignPosY?: number; // 0
  approvedSignPosX?: number; // 0
  approvedSignPosY?: number; // 0
  stampPosX?: number; // 0
  stampPosY?: number; // 0

  // Metadata
  standard?: string;
  category?: string;
  notes?: string;
  status: 'ACTIVE' | 'APPROVED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;

  // Multi-Sheet / Multi-Page support (Single Product & Multi Product sheets)
  sheets?: DataSheetRecord[];
  activeSheetIndex?: number;
}

export interface DataSheetArchiveItem {
  id: string;
  dataSheetNo: string;
  date: string;
  customer: string;
  subject: string;
  category?: string;
  standard?: string;
  status: 'ACTIVE' | 'APPROVED' | 'DRAFT' | 'ARCHIVED';
  includeMtcPage: boolean;
  updatedAt: string;
  record: DataSheetRecord;
}

export interface CellCoord {
  table: string;
  r: number;
  c: number;
}

export interface CellRange {
  table: string;
  startR: number;
  startC: number;
  endR: number;
  endC: number;
}
