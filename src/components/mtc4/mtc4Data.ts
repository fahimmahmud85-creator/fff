import { QcChemicalItem, QcRecordItem } from '../QcReportsComponent';

export interface AdditionalTechInfoLine {
  id: string;
  checked: boolean;
  title: string;
  value: string;
}

export interface Mtc4MechRow {
  testItem: string;
  testStandard: string;
  spec: string;
  results: string;
  sampling: string;
  checked?: boolean;
}

export interface Mtc4DimRow {
  testItem: string;
  spec: string;
  results: string;
  sampling: string;
  remark: string;
  checked?: boolean;
}

export interface Mtc4CoatingRow {
  testItem: string;
  testSpec: string;
  standard: string;
  results: string;
  sampling: string;
  pass: string;
  checked?: boolean;
}

export interface Mtc4HtRow {
  testItem: string;
  results: string;
  checked?: boolean;
}

export interface Mtc4SheetData {
  id: string;
  sheetNo: number;
  title: string;
  customerName?: string;
  customerPoNum?: string;
  invoiceNum?: string;
  workOrderNum?: string;
  certNo?: string;
  heatNo?: string;
  lotNo?: string;
  partNo?: string;
  productDescription?: string;
  qty?: string;
  specStandard?: string;
  yearRevision?: string;
  material?: string;
  marking?: string;
  markingImage?: string;
  finish?: string;
  items?: QcRecordItem[];
  chemicalData?: QcChemicalItem[];
  chemSpecMin?: Record<string, string>;
  chemSpecMax?: Record<string, string>;
  chemHeaderOverrides?: Record<string, string>;
  mtc4MechRows?: Mtc4MechRow[];
  mtc4DimRows?: Mtc4DimRow[];
  mtc4CoatingRows?: Mtc4CoatingRow[];
  mtc4HtRows?: Mtc4HtRow[];
  showChemAnalysis?: boolean;
  showMechTest?: boolean;
  showMacroEtch?: boolean;
  showDimInspection?: boolean;
  showCoating?: boolean;
  showHeatTreatment?: boolean;
  macroEtchSpecSurface?: string;
  macroEtchSpecRandom?: string;
  macroEtchSpecCenter?: string;
  macroEtchSpecTestMethod?: string;
  macroEtchResultSurface?: string;
  macroEtchResultRandom?: string;
  macroEtchResultCenter?: string;
  macroEtchResultMethod?: string;
  additionalTechInfo?: AdditionalTechInfoLine[];
  declarationText?: string;
}

export const DEFAULT_MTC4_MECH_ROWS: Mtc4MechRow[] = [
  { testItem: 'Core Hardness (HRC)', testStandard: 'ASTM F606', spec: '35max', results: '27-28', sampling: '1' },
  { testItem: 'Tensile Strength (KSI)', testStandard: 'ASTM F606', spec: '125 min.', results: '131', sampling: '1' },
  { testItem: 'Yield Strength(KSI)', testStandard: 'ASTM F606', spec: '105 min.', results: '123', sampling: '1' },
  { testItem: 'Reduction Area (%)', testStandard: 'ASTM F606', spec: '50 min.', results: '58', sampling: '1' },
  { testItem: 'Elongation 4D (%)', testStandard: 'ASTM F606', spec: '16 min.', results: '20', sampling: '1' }
];

export const DEFAULT_MTC4_DIM_ROWS: Mtc4DimRow[] = [
  { testItem: 'Major Diameter (mm)', spec: '12.386-12.661', results: '12.50-12.56', sampling: '11', remark: 'OK' },
  { testItem: 'Thread Length (mm)', spec: '62.968-65.032', results: '65-66', sampling: '11', remark: 'OK' },
  { testItem: 'Go Gauge(Before Coating)', spec: '2A', results: 'OK', sampling: '11', remark: 'OK' },
  { testItem: 'No-Go Gauge(Before Coating)', spec: '2A', results: 'OK', sampling: '11', remark: 'OK' },
  { testItem: 'Appearance', spec: '—', results: 'OK', sampling: '—', remark: 'OK' }
];

export const DEFAULT_MTC4_COATING_ROWS: Mtc4CoatingRow[] = [
  { testItem: 'Thickness((μm)', testSpec: '09-SAMSS-107', standard: '20-30(μm)', results: '25-29(μm)', sampling: '80', pass: 'OK' },
  { testItem: 'Adhesion(B)', testSpec: 'ASTM D3359', standard: '4-5(B)', results: '4-5(B)', sampling: '2', pass: 'OK' },
  { testItem: 'Cure Test', testSpec: '09-SAMSS-107', standard: '>20', results: 'OK', sampling: '2', pass: 'OK' },
  { testItem: 'Visual Inspection', testSpec: '09-SAMSS-107', standard: 'OK', results: 'OK', sampling: '640', pass: 'OK' }
];

export const DEFAULT_MTC4_HT_ROWS: Mtc4HtRow[] = [
  { testItem: 'Quenching temperature (Celsius)', results: '840' },
  { testItem: 'Holding time', results: '1hour' },
  { testItem: 'Tempering temperature (Celsius)', results: '630' },
  { testItem: 'Holding time', results: '2hour' },
  { testItem: 'Stress relived (Celsius)', results: '575' },
  { testItem: 'Quenching medium', results: 'Oil' }
];

export const DEFAULT_ADDITIONAL_TECH_INFO: AdditionalTechInfoLine[] = [
  { id: 'tech_1', checked: true, title: 'Visual Inspection', value: 'Found to be free from crack, flaws, sharp edges and other defects.' },
  { id: 'tech_2', checked: true, title: 'Thread acceptability', value: 'has been inspected as per ASME B1.1 CL 2A and found ok.' },
  { id: 'tech_3', checked: true, title: 'Gauge Fit', value: 'Inspection using 6g GO gauge and 6g NO GO gauge,' },
  { id: 'tech_4', checked: true, title: 'Dimensions', value: 'Found Satisfactory/ As per Standard requirement.' },
  { id: 'tech_5', checked: true, title: 'Heat Treatment', value: 'Quenched Liquid & tempered.' },
  { id: 'tech_6', checked: true, title: 'HDG', value: 'As per ASTM A153 CL-C found satisfactory.' },
  { id: 'tech_7', checked: false, title: 'GI', value: 'As per ASTM B633 Found satisfactory' },
  { id: 'tech_8', checked: false, title: 'Galv', value: 'As per ASTM B633 Found satisfactory' },
  { id: 'tech_9', checked: false, title: 'Self', value: 'Found satisfactory' },
  { id: 'tech_10', checked: false, title: 'Yellow', value: 'Found Satisfactory' },
  { id: 'tech_11', checked: false, title: 'Cadmium Plating', value: 'Found satisfactory' },
  { id: 'tech_12', checked: false, title: 'Nickel Plating', value: 'Found satisfactory' },
  { id: 'tech_13', checked: false, title: 'Fluropolymer coating', value: 'Found satisfactory' },
  { id: 'tech_14', checked: false, title: 'Title: PTFE BLUE (XYLAN 1070)', value: 'XYLAN 1424 BLUE AS PER ASTM D3359 / 09-SAMSS-107 found satisfactory.' },
  { id: 'tech_15', checked: false, title: 'NACE Compliance', value: 'We hereby confirm that the material Complies to NACE MR/0175/ ISO 15156-2 requirements.' }
];

export const DEFAULT_DECLARATION_TEXT = '"We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer\'s specification(s), and that they satisfy the requirements."';

export const CHEM_ELEMENTS = [
  { k: 'c', label: 'C' },
  { k: 'mn', label: 'Mn' },
  { k: 'p', label: 'P' },
  { k: 's', label: 'S' },
  { k: 'si', label: 'Si' },
  { k: 'cr', label: 'Cr' },
  { k: 'ni', label: 'Ni' },
  { k: 'cu', label: 'Cu' },
  { k: 'mo', label: 'Mo' },
  { k: 'v', label: 'V' },
  { k: 'al', label: 'Al' }
];

export function createDefaultMtc4Sheet(sheetNo: number, title?: string): Mtc4SheetData {
  return {
    id: `sheet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sheetNo,
    title: title || `Sheet ${sheetNo}`,
    productDescription: '',
    specStandard: '',
    yearRevision: '2023',
    material: '',
    marking: '',
    markingImage: '',
    finish: '',
    heatNo: '',
    lotNo: '1',
    partNo: '',
    qty: '',
    chemicalData: [{
      c: '',
      mn: '',
      p: '',
      s: '',
      si: '',
      cr: '',
      ni: '',
      cu: '',
      mo: '',
      v: '',
      al: '',
      heatNo: ''
    }],
    chemSpecMin: {},
    chemSpecMax: {},
    mtc4MechRows: JSON.parse(JSON.stringify(DEFAULT_MTC4_MECH_ROWS)),
    mtc4DimRows: JSON.parse(JSON.stringify(DEFAULT_MTC4_DIM_ROWS)),
    mtc4CoatingRows: JSON.parse(JSON.stringify(DEFAULT_MTC4_COATING_ROWS)),
    mtc4HtRows: JSON.parse(JSON.stringify(DEFAULT_MTC4_HT_ROWS)),
    showChemAnalysis: true,
    showMechTest: true,
    showMacroEtch: true,
    showDimInspection: true,
    showCoating: true,
    showHeatTreatment: true,
    macroEtchSpecSurface: 'S2',
    macroEtchSpecRandom: 'R2',
    macroEtchSpecCenter: 'C3',
    macroEtchSpecTestMethod: 'ASTM A962/A962M-19',
    macroEtchResultSurface: 'S2',
    macroEtchResultRandom: 'R2',
    macroEtchResultCenter: 'C3',
    macroEtchResultMethod: 'OK',
    additionalTechInfo: JSON.parse(JSON.stringify(DEFAULT_ADDITIONAL_TECH_INFO)),
    declarationText: DEFAULT_DECLARATION_TEXT
  };
}
