import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, 
  Plus, 
  Sliders, 
  RotateCcw,
  FileSpreadsheet,
  Trash2,
  Copy,
  ArrowDownToLine,
  ClipboardPaste,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Layers,
  X
} from 'lucide-react';
import { QcReportRecord, QcRecordItem, MtcSheetData, incrementCertNo } from './QcReportsComponent';
import { 
  getActiveCompany, 
  isMarineFastenersCompany, 
  isBoltMasterCompany,
  isUnitedMetalCompany,
  getCompanyIsoText, 
  getCompanyQcHead, 
  getCompanyQcStampSvg,
  getCompanyLegalClause,
  getCompanyCooDeclaration,
  CompanyProfile 
} from '../utils/companyProfile';

export interface XylanObservationRow {
  test: string;
  method: string;
  specified: string;
  observed: string;
}

export interface XylanData {
  descriptionLabel?: string;
  descriptionText?: string;
  surfacePrepLabel?: string;
  gritBlast?: string;
  solventLabel?: string;
  solventValue?: string;
  zincNiLabel?: string;
  zincNiValue?: string;
  othersLabel?: string;
  othersValue?: string;
  coatingColourLabel?: string;
  coatingColourValue?: string;
  coat1Label?: string;
  coat1Value?: string;
  coat2Label?: string;
  coat2Value?: string;
  coat3Label?: string;
  coat3Value?: string;
  xylanTypeLabel?: string;
  xylanTypeValue?: string;
  temperatureLabel?: string;
  temperatureValue?: string;
  humidityLabel?: string;
  humidityValue?: string;
  observationsLabel?: string;
  flashOffLabel?: string;
  flashOffValue?: string;
  cureTempLabel?: string;
  cureTempValue?: string;
  observationRows?: XylanObservationRow[];
  remarks?: string;
  conclusionLabel?: string;
  conclusionText?: string;
}

export const DEFAULT_XYLAN_OBSERVATIONS: XylanObservationRow[] = [
  {
    test: 'Appearance',
    method: 'Visual',
    specified: 'Smooth',
    observed: 'Smooth, coating is free from runs, sags, misses etc.'
  },
  {
    test: 'Dry Film Thicknes',
    method: 'ASTM D7091',
    specified: '30+ Microns',
    observed: '30+ Microns'
  },
  {
    test: 'Hardness Testing',
    method: 'ASTM D3363, Method',
    specified: '2H Min',
    observed: 'Ok, 2H'
  },
  {
    test: 'Solvent Test',
    method: 'ASTM D5402\n20double Rubs',
    specified: 'No Removal of coating',
    observed: 'Ok, No removal of coating,    Cured'
  },
  {
    test: 'Adhesion',
    method: 'ASTM D3359, Method',
    specified: '4 or better',
    observed: 'Ok, 4'
  },
  {
    test: 'Salt Spray Test',
    method: 'ASTM B117',
    specified: '1000 Hrs (Min)',
    observed: 'Satisfactory, after 1000 Hrs'
  }
];

export const DEFAULT_XYLAN_REMARKS = `Remarks: Cured\nCoating Applied as per ASTM D823\nHardness Test & Adhesion test was carried out on the bolt ends & nut faces\nCoating is Fully compliance with MESC SPE 81/007`;

export const getXylanReportData = (record: Partial<QcReportRecord>): {
  descriptionLabel: string;
  descriptionText: string;
  surfacePrepLabel: string;
  gritBlast: string;
  solventLabel: string;
  solventValue: string;
  zincNiLabel: string;
  zincNiValue: string;
  othersLabel: string;
  othersValue: string;
  coatingColourLabel: string;
  coatingColourValue: string;
  coat1Label: string;
  coat1Value: string;
  coat2Label: string;
  coat2Value: string;
  coat3Label: string;
  coat3Value: string;
  xylanTypeLabel: string;
  xylanTypeValue: string;
  temperatureLabel: string;
  temperatureValue: string;
  humidityLabel: string;
  humidityValue: string;
  observationsLabel: string;
  flashOffLabel: string;
  flashOffValue: string;
  cureTempLabel: string;
  cureTempValue: string;
  observationRows: XylanObservationRow[];
  remarks: string;
  conclusionLabel: string;
  conclusionText: string;
} => {
  const x = (record as any)?.xylanData || {};
  return {
    descriptionLabel: x.descriptionLabel ?? 'Decription',
    descriptionText: (x.descriptionText !== undefined && x.descriptionText !== '')
      ? x.descriptionText
      : ((record.additionalInfo && !record.additionalInfo.includes('LADLE'))
          ? record.additionalInfo
          : 'For the list of items, pls refer to metioned certificate- MFI:1089/01/2026 (Item 1-4)'),
    surfacePrepLabel: x.surfacePrepLabel ?? 'Surface Preperation',
    gritBlast: x.gritBlast ?? (record.gritBlast || 'Grit Blast/ Comp. Air'),
    solventLabel: x.solventLabel ?? 'Solvent',
    solventValue: x.solventValue ?? (record.solvent96 || '96'),
    zincNiLabel: x.zincNiLabel ?? 'Zink-Ni Plating',
    zincNiValue: x.zincNiValue ?? (record.zinkNiPlating || 'OK'),
    othersLabel: x.othersLabel ?? 'Others',
    othersValue: x.othersValue ?? '',
    coatingColourLabel: x.coatingColourLabel ?? 'Coating Colour',
    coatingColourValue: x.coatingColourValue ?? (record.coatingColour || 'BLUE / B7M-2HM'),
    coat1Label: x.coat1Label ?? '1st Coat',
    coat1Value: x.coat1Value ?? 'Xylan 1070',
    coat2Label: x.coat2Label ?? '2nd Coat',
    coat2Value: x.coat2Value ?? 'Xylan 1070',
    coat3Label: x.coat3Label ?? '3rd Coat',
    coat3Value: x.coat3Value ?? '',
    xylanTypeLabel: x.xylanTypeLabel ?? 'XYLAN Type',
    xylanTypeValue: x.xylanTypeValue ?? (record.xylanType || '1070'),
    temperatureLabel: x.temperatureLabel ?? 'Temperature °C',
    temperatureValue: x.temperatureValue ?? (record.temperatureC || '35°'),
    humidityLabel: x.humidityLabel ?? 'Humidity',
    humidityValue: x.humidityValue ?? (record.humidityPct || '43%'),
    observationsLabel: x.observationsLabel ?? 'Observations',
    flashOffLabel: x.flashOffLabel ?? 'Flash off Temp. °C',
    flashOffValue: x.flashOffValue ?? (record.flashOffTempC || '100°C'),
    cureTempLabel: x.cureTempLabel ?? 'Cure Temp. °C',
    cureTempValue: x.cureTempValue ?? (record.cureTempC || '205°C'),
    observationRows: Array.isArray(x.observationRows) && x.observationRows.length > 0
      ? x.observationRows
      : DEFAULT_XYLAN_OBSERVATIONS,
    remarks: x.remarks ?? (record.remarks || DEFAULT_XYLAN_REMARKS),
    conclusionLabel: x.conclusionLabel ?? 'Conclusion :',
    conclusionText: x.conclusionText ?? (record.conclusion || 'Above test found satisfactory')
  };
};

export interface NickelCobaltCorrosionRow {
  part: string;
  rate: string;
}

export interface NickelCobaltData {
  sectionTitle?: string;
  acceptanceTitle?: string;
  appearanceLabel?: string;
  appearanceValue?: string;
  adhesionLabel?: string;
  adhesionValue?: string;
  thicknessLabel?: string;
  thicknessValue?: string;
  thicknessUnit?: string;
  thicknessMethod?: string;
  
  qualificationTitle?: string;
  chemTitle?: string;
  chemNiLabel?: string;
  chemNiValue?: string;
  chemCoLabel?: string;
  chemCoValue?: string;
  
  gallingLabel?: string;
  gallingValue?: string;
  
  hydrogenLabel?: string;
  hydrogenValue?: string;
  
  envTitle?: string;
  cassLabel?: string;
  cassValue?: string;
  saltFogLabel?: string;
  saltFogValue?: string;
  modSaltFogLabel?: string;
  modSaltFogValue?: string;
  envObservation?: string;
  
  depositLotLabel?: string;
  depositLotValue?: string;
  
  corrosionTitle?: string;
  corrosionRateHeader?: string;
  corrosionRows?: NickelCobaltCorrosionRow[];
  
  samplingClause?: string;
  footnote1?: string;
  footnote2?: string;
  footnote3?: string;
  
  legalClause?: string;
  qaAgentTitle?: string;
  qaAgentName?: string;
}

export const DEFAULT_NICKEL_COBALT_CORROSION_ROWS: NickelCobaltCorrosionRow[] = [
  { part: '***STUD', rate: '0.825995447' },
  { part: '***INTERIOR THREAD OF NUT', rate: '0.8619' },
  { part: '***NUT WRENCHING FLAT', rate: '0.847999999' },
  { part: '**COUPON', rate: '0.824100000' }
];

export const getNickelCobaltReportData = (record: Partial<QcReportRecord>): {
  sectionTitle: string;
  acceptanceTitle: string;
  appearanceLabel: string;
  appearanceValue: string;
  adhesionLabel: string;
  adhesionValue: string;
  thicknessLabel: string;
  thicknessValue: string;
  thicknessUnit: string;
  thicknessMethod: string;
  qualificationTitle: string;
  chemTitle: string;
  chemNiLabel: string;
  chemNiValue: string;
  chemCoLabel: string;
  chemCoValue: string;
  gallingLabel: string;
  gallingValue: string;
  hydrogenLabel: string;
  hydrogenValue: string;
  envTitle: string;
  cassLabel: string;
  cassValue: string;
  saltFogLabel: string;
  saltFogValue: string;
  modSaltFogLabel: string;
  modSaltFogValue: string;
  envObservation: string;
  depositLotLabel: string;
  depositLotValue: string;
  corrosionTitle: string;
  corrosionRateHeader: string;
  corrosionRows: NickelCobaltCorrosionRow[];
  samplingClause: string;
  footnote1: string;
  footnote2: string;
  footnote3: string;
  legalClause: string;
  qaAgentTitle: string;
  qaAgentName: string;
} => {
  const n = (record as any)?.nickelCobaltData || {};
  return {
    sectionTitle: n.sectionTitle ?? '*COATING CHARACTERISTICS ACCORDING TO ASTM B994',
    acceptanceTitle: n.acceptanceTitle ?? 'ACCEPTANCE TESTS',
    appearanceLabel: n.appearanceLabel ?? 'APPEARANCE',
    appearanceValue: n.appearanceValue ?? 'FREE OF VISIBLE COATING DEFECTS, SUCH AS BLISTERS, PITS, ROUGHNESS NODULES, BURNING, CRACKS OR UNPLATED AREAS AND OTHER DEFECT THAT WOULD AFFECT THE FUNTION OF THE COATING.',
    adhesionLabel: n.adhesionLabel ?? 'ADHESION',
    adhesionValue: n.adhesionValue ?? 'THE COATING DOES NOT SHOW SEPARATION FROM THE BASE METAL, TEST METHOD ASTM B571-10',
    thicknessLabel: n.thicknessLabel ?? 'THICKNESS',
    thicknessValue: n.thicknessValue ?? '19.33071722',
    thicknessUnit: n.thicknessUnit ?? 'µm',
    thicknessMethod: n.thicknessMethod ?? 'TEST METHOD ASTM B568',
    qualificationTitle: n.qualificationTitle ?? 'QUALIFICATION TESTS',
    chemTitle: n.chemTitle ?? 'CHEMICAL COMPOSITION',
    chemNiLabel: n.chemNiLabel ?? '%Ni',
    chemNiValue: n.chemNiValue ?? '60.79999999',
    chemCoLabel: n.chemCoLabel ?? '%Co',
    chemCoValue: n.chemCoValue ?? '39.20000000',
    gallingLabel: n.gallingLabel ?? 'GALLING',
    gallingValue: n.gallingValue ?? 'LOADED SPECIMENS HAVE PASSED 120 DAYS OF EVALUATION WITH TORQUE RATIO OF 1.0',
    hydrogenLabel: n.hydrogenLabel ?? 'HYDROGEN EMBRITTLEMENT',
    hydrogenValue: n.hydrogenValue ?? 'NO FAILURE AFTER 200 HOURS AT 75% UTS',
    envTitle: n.envTitle ?? 'ENVIRONMENTAL TESTING',
    cassLabel: n.cassLabel ?? 'CASS (ASTM B368)',
    cassValue: n.cassValue ?? '120 HOURS',
    saltFogLabel: n.saltFogLabel ?? 'SALT FOG TEST (ASTM B117)',
    saltFogValue: n.saltFogValue ?? '500 HOURS',
    modSaltFogLabel: n.modSaltFogLabel ?? 'MODIFIED SALT FOG TEST (ASTM G85-A2)',
    modSaltFogValue: n.modSaltFogValue ?? '200 HOURS',
    envObservation: n.envObservation ?? 'NO RED RUST AFTER THE EXPOSURE PERIOD FOR ALL ENVIRONMENTAL TESTS DESCRIBED ABOVE.',
    depositLotLabel: n.depositLotLabel ?? 'DEPOSIT LOT:',
    depositLotValue: n.depositLotValue ?? '053018-4108',
    corrosionTitle: n.corrosionTitle ?? 'CORROSION TESTING',
    corrosionRateHeader: n.corrosionRateHeader ?? 'CORROSION RATE (µm/y)',
    corrosionRows: Array.isArray(n.corrosionRows) && n.corrosionRows.length > 0 ? n.corrosionRows : DEFAULT_NICKEL_COBALT_CORROSION_ROWS,
    samplingClause: n.samplingClause ?? 'SAMPLING FOR THE ACCEPTANCE AND QUALIFICATION TESTS WAS MADE UNDER ASTM F1470',
    footnote1: n.footnote1 ?? '*THE INFO CONTAINED IN THIS DOCUMENT IS OBTAINED FROM QUALITY CONTROL TEST PERFORMED ACCORDING TO ASTM B994',
    footnote2: n.footnote2 ?? '**THIS TEST IS PERFORMED IN COUPONS ACCORDING TO THE REQUIREMENTS OF ASTM B994',
    footnote3: n.footnote3 ?? '***THIS TEST IS PERFORMED ON OBJECTS DESCRIBED WITH THE PURPOSE OF MONITOR THE QUALITY CONTROL',
    legalClause: n.legalClause ?? getCompanyLegalClause(),
    qaAgentTitle: n.qaAgentTitle ?? 'QUALITY ASSURANCE:',
    qaAgentName: n.qaAgentName ?? 'ARTURO UGALDE, QUALITY CONTROL AGENT'
  };
};

export interface NeoprenePhysicalSubRow {
  srNo: string;
  property: string;
  testMethod: string;
  unit: string;
  specification: string;
}

export interface NeoprenePhysicalPropertyRow {
  srNo: string;
  property: string;
  testMethod: string;
  unit: string;
  specification: string;
  subRows?: NeoprenePhysicalSubRow[];
}

export interface NeopreneGeneralPropertyRow {
  srNo: string;
  property: string;
  value: string;
}

export interface NeopreneSleeveData {
  basePolymer: string;
  colour: string;
  physicalProperties: NeoprenePhysicalPropertyRow[];
  generalProperties: NeopreneGeneralPropertyRow[];
  note: string;
}

export const DEFAULT_NEOPRENE_PHYSICAL_PROPERTIES: NeoprenePhysicalPropertyRow[] = [
  { srNo: '1', property: 'Hardness', testMethod: 'ASTM D 2240', unit: 'Shore A', specification: '70 ± 5' },
  { srNo: '2', property: 'Tensile Strength, Min', testMethod: 'ASTM D 412', unit: 'MPa', specification: '9' },
  { srNo: '3', property: 'Elongation at Break, Min', testMethod: 'ASTM D 412', unit: '%', specification: '220' },
  { srNo: '4', property: 'Tear Strength, Min', testMethod: 'ASTM D 624', unit: 'kN/m', specification: '25' },
  { srNo: '5', property: 'Specific Gravity', testMethod: 'ASTM D 792', unit: 'g/cc', specification: '1.25 ± 0.05' },
  { srNo: '6', property: 'Compression Set, Max (22hrs@100 ⁰C)', testMethod: 'ASTM D 395', unit: '%', specification: '28' },
  {
    srNo: '7',
    property: 'After Aging Properties\n(Hot Air Aging 70 hrs at 100 ⁰C)',
    testMethod: 'ASTM D 573',
    unit: '-',
    specification: '-',
    subRows: [
      { srNo: 'a', property: 'Change In Hardness', testMethod: 'ASTM D 2240', unit: 'Shore A', specification: '± 10' },
      { srNo: 'b', property: 'Change In Tensile Strength, Max', testMethod: 'ASTM D 412', unit: '%', specification: '-20' },
      { srNo: 'c', property: 'Change in Elongation at Break, Max', testMethod: 'ASTM D 412', unit: '%', specification: '-25' }
    ]
  }
];

export const DEFAULT_NEOPRENE_GENERAL_PROPERTIES: NeopreneGeneralPropertyRow[] = [
  { srNo: '1', property: 'Resistance to UV & Ozone', value: 'Excellent' },
  { srNo: '2', property: 'Resistance to Weather', value: 'Excellent' },
  { srNo: '3', property: 'Water swell Resistance', value: 'Very Good' },
  { srNo: '4', property: 'Resistance to Thermal Ageing', value: 'Excellent' },
  { srNo: '5', property: 'Resistance to Chemicals', value: 'Excellent' },
  { srNo: '6', property: 'Resistance to Mild acids', value: 'Good' },
  { srNo: '7', property: 'Resistance to Alcohol', value: 'Good' },
  { srNo: '8', property: 'Resistance to Petrolium Oil and Mineral Oils', value: 'Poor' },
  { srNo: '9', property: 'Temperature Range', value: '- 40 to +130 Deg C' }
];

export const DEFAULT_NEOPRENE_NOTE = 'Note: The information shown above is correct and true to the best of our knowledge and is based on tests or in some cases taken from internationally used reference guides.';

export const getNeopreneSleeveReportData = (record: Partial<QcReportRecord>): NeopreneSleeveData => {
  const n = (record as any)?.neopreneData || {};
  return {
    basePolymer: record.neopreneBasePolymer ?? (n.basePolymer ?? 'EPDM'),
    colour: record.neopreneColour ?? (n.colour ?? 'Black'),
    physicalProperties: (Array.isArray(record.neoprenePhysicalProperties) && record.neoprenePhysicalProperties.length > 0)
      ? record.neoprenePhysicalProperties
      : ((Array.isArray(n.physicalProperties) && n.physicalProperties.length > 0) ? n.physicalProperties : DEFAULT_NEOPRENE_PHYSICAL_PROPERTIES),
    generalProperties: (Array.isArray(record.neopreneGeneralProperties) && record.neopreneGeneralProperties.length > 0)
      ? record.neopreneGeneralProperties
      : ((Array.isArray(n.generalProperties) && n.generalProperties.length > 0) ? n.generalProperties : DEFAULT_NEOPRENE_GENERAL_PROPERTIES),
    note: record.neopreneNote !== undefined ? record.neopreneNote : (n.note !== undefined ? n.note : DEFAULT_NEOPRENE_NOTE)
  };
};

export interface TeflonPropertyRow {
  property: string;
  standard: string;
  dryHumid: string;
  unit: string;
}

export interface TeflonData {
  material: string;
  abbreviation: string;
  shortDescriptionLabel: string;
  shortDescriptionText: string;
  mechanicalValues: TeflonPropertyRow[];
  thermalValues: TeflonPropertyRow[];
  electricalValues: TeflonPropertyRow[];
  miscellaneousValues: TeflonPropertyRow[];
  footnotes: string[];
  conversions: string[];
  disclaimerNote: string;
}

export const DEFAULT_TEFLON_MECHANICAL_VALUES: TeflonPropertyRow[] = [
  { property: 'Coating Thickness (DFT)', standard: 'ASTM D7091 / ISO 2808', dryHumid: '35 - 55', unit: 'µm' },
  { property: 'Adhesion Test (Cross-Hatch)', standard: 'ASTM D3359 / ISO 2409', dryHumid: 'Class 4B - 5B', unit: 'Pass' },
  { property: 'Pencil Hardness', standard: 'ASTM D3363', dryHumid: '2H - 4H', unit: 'Pass' },
  { property: 'Salt Spray Resistance', standard: 'ASTM B117 / ISO 9227', dryHumid: '1000+ Hours', unit: 'No Rust' },
  { property: 'Coefficient of Friction', standard: 'ASTM D1894', dryHumid: '0.08 - 0.12', unit: '—' },
  { property: 'Tensile Strength', standard: 'ASTM D638 / ISO 527', dryHumid: '25 - 35', unit: 'MPa' },
  { property: 'Elongation at Break', standard: 'ASTM D638', dryHumid: '250 - 350', unit: '%' }
];

export const DEFAULT_TEFLON_THERMAL_VALUES: TeflonPropertyRow[] = [
  { property: 'Continuous Service Temperature', standard: 'ASTM D3418', dryHumid: '-40 to +260', unit: '°C' },
  { property: 'Maximum Intermittent Temperature', standard: 'ASTM D3418', dryHumid: '+290', unit: '°C' },
  { property: 'Melting Point (Crystalline)', standard: 'ASTM D3418 / ISO 3146', dryHumid: '+327', unit: '°C' },
  { property: 'Thermal Conductivity', standard: 'ASTM C177', dryHumid: '0.25', unit: 'W/(m·K)' },
  { property: 'Flammability Rating', standard: 'UL 94', dryHumid: 'V-0', unit: '—' }
];

export const DEFAULT_TEFLON_ELECTRICAL_VALUES: TeflonPropertyRow[] = [
  { property: 'Dielectric Strength', standard: 'ASTM D149 / IEC 243', dryHumid: '20 - 30', unit: 'kV/mm' },
  { property: 'Dielectric Constant (1 MHz)', standard: 'ASTM D150 / IEC 250', dryHumid: '2.1', unit: '—' },
  { property: 'Surface Resistivity', standard: 'ASTM D257 / IEC 93', dryHumid: '> 10¹⁶', unit: 'Ω' },
  { property: 'Volume Resistivity', standard: 'ASTM D257 / IEC 93', dryHumid: '> 10¹⁷', unit: 'Ω·cm' }
];

export const DEFAULT_TEFLON_MISCELLANEOUS_VALUES: TeflonPropertyRow[] = [
  { property: 'Water Absorption (24h immersion)', standard: 'ASTM D570 / ISO 62', dryHumid: '< 0.01', unit: '%' },
  { property: 'Chemical / Acid Resistance', standard: 'ASTM D543', dryHumid: 'Excellent (Inert)', unit: 'Pass' }
];

export const DEFAULT_TEFLON_FOOTNOTES: string[] = [
  '1. Fasteners are pre-treated with grit blasting to Sa 2.5 and zinc/phosphate conversion prior to PTFE coating.',
  '2. PTFE fluoropolymer coating is cured at 380°C - 400°C for optimal cross-linking and substrate adhesion.',
  '3. Dry film thickness (DFT) measured with calibrated electromagnetic thickness gauges as per ASTM D7091.'
];

export const DEFAULT_TEFLON_CONVERSIONS: string[] = [
  '1 µm = 0.001 mm',
  '1 MPa = 1 N/mm²',
  '1 kV/mm = 1 MV/m',
  '°F = (°C × 9/5) + 32'
];

export const DEFAULT_TEFLON_DISCLAIMER: string = 'This technical report confirms that fasteners have been coated with industrial-grade PTFE (Teflon) fluoropolymer system in accordance with standard application procedures. Values are representative of average production quality control testing.';

export const getTeflonReportData = (record: Partial<QcReportRecord>): TeflonData => {
  const t = (record as any)?.teflonData || {};
  return {
    material: t.material ?? 'PTFE Fluoropolymer (Teflon)',
    abbreviation: t.abbreviation ?? 'PTFE',
    shortDescriptionLabel: t.shortDescriptionLabel ?? 'Short description of material:',
    shortDescriptionText: t.shortDescriptionText ?? 'PTFE (Teflon) fluoropolymer coating applied to fasteners provides extreme corrosion protection, ultra-low coefficient of friction, high thermal resistance (-40°C to +260°C), and chemical inertness.',
    mechanicalValues: (Array.isArray(t.mechanicalValues) && t.mechanicalValues.length > 0) ? t.mechanicalValues : DEFAULT_TEFLON_MECHANICAL_VALUES,
    thermalValues: (Array.isArray(t.thermalValues) && t.thermalValues.length > 0) ? t.thermalValues : DEFAULT_TEFLON_THERMAL_VALUES,
    electricalValues: (Array.isArray(t.electricalValues) && t.electricalValues.length > 0) ? t.electricalValues : DEFAULT_TEFLON_ELECTRICAL_VALUES,
    miscellaneousValues: (Array.isArray(t.miscellaneousValues) && t.miscellaneousValues.length > 0) ? t.miscellaneousValues : DEFAULT_TEFLON_MISCELLANEOUS_VALUES,
    footnotes: (Array.isArray(t.footnotes) && t.footnotes.length > 0) ? t.footnotes : DEFAULT_TEFLON_FOOTNOTES,
    conversions: (Array.isArray(t.conversions) && t.conversions.length > 0) ? t.conversions : DEFAULT_TEFLON_CONVERSIONS,
    disclaimerNote: t.disclaimerNote ?? DEFAULT_TEFLON_DISCLAIMER
  };
};

export interface FluropolymerTableRow {
  id: string;
  parameter: string;
  specification: string;
  isFullWidth?: boolean;
}

export interface FluropolymerData {
  descriptionLabel?: string;
  descriptionText?: string;
  rows?: FluropolymerTableRow[];
  certificationText?: string;
  remarks?: string;
}

export const DEFAULT_FLUROPOLYMER_ROWS: FluropolymerTableRow[] = [
  { id: '1', parameter: 'Surface Finish', specification: 'Fluropolymer Coating (BLUE), (DFT Thickness 35-55 Microns) (Ceramic-Fluoropolymer)' },
  { id: '2', parameter: 'Coating Specification', specification: '09-SAMSS-107' },
  { id: '3', parameter: 'Fit Test', specification: 'As per clause 6.1.2 of 09-SAMSS-107 Specification' },
  { id: '4', parameter: 'Visual Inspection', specification: 'As per clause 6.1.3 of 09-SAMSS-107 Specification' },
  { id: '5', parameter: 'Dry Film Thickness', specification: 'As per clause 6.1.4 of 09-SAMSS-107 Specification' },
  { id: '6', parameter: 'Cure Test', specification: 'As per clause 6.1.5 of 09-SAMSS-107 Specification' },
  { id: '7', parameter: 'Adhesion Test', specification: 'As per clause 6.2 of 09-SAMSS-107 Specification' },
  { id: '8', parameter: 'Sampling Frequency', specification: 'As per the Table 1 of 09-SAMSS-107 Specification' },
  { id: '9', parameter: 'Microscopic Analysis', specification: 'As per clause 6.3 of 09-SAMSS-107 Specification' },
  { id: '10', parameter: 'Salt Spray Test', specification: 'As per ASTM B117 at 95°F (35°C) and ASTM D5894 for cyclic salt fog/UV Exposure pf Painted Metal as per NACE 02107 at the combine duration of 5040 Hours with no visible corrosion.' },
  { id: '11', parameter: 'Visual Inspection', specification: 'Cracks & Stamp edges not observed' },
  { id: '12', parameter: 'Rotational Capacity Test', specification: 'Passed, Tension type & Upto4D 240degree' },
  { id: '13', parameter: '*', specification: 'Yield strength Method' },
  { id: '14', parameter: 'Threads', specification: 'Found Satisfactory, as per ASME B1.13M,6g/6H prior to coating' },
  { id: '15', parameter: 'Dimensions', specification: 'Found Satisfactory' },
  { id: '16', parameter: 'Material Testing', specification: 'Testing Sample as per ASTM F1470' },
  { id: '17', parameter: 'Note', specification: 'Steel heats having elements such as Bismuth, selenium, tellurium or lead intentionally added were not used.', isFullWidth: true },
  { id: '18', parameter: 'SELF', specification: 'Found satisfactory' }
];

export const DEFAULT_FLUROPOLYMER_CERTIFICATION: string = "We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer's specification(s), and that they satisfy the requirements.";

export const getFluropolymerReportData = (record: Partial<QcReportRecord>): Required<FluropolymerData> => {
  const f = (record as any)?.fluropolymerData || {};
  return {
    descriptionLabel: f.descriptionLabel ?? 'Decription',
    descriptionText: (f.descriptionText !== undefined && f.descriptionText !== '')
      ? f.descriptionText
      : ((record.additionalInfo && !record.additionalInfo.includes('LADLE'))
          ? record.additionalInfo
          : 'For the list of items, pls refer to metioned certificate- MFI:1089/01/2026 (Item 1-4)'),
    rows: (Array.isArray(f.rows) && f.rows.length > 0) ? f.rows : DEFAULT_FLUROPOLYMER_ROWS,
    certificationText: f.certificationText ?? (record.certificationText || DEFAULT_FLUROPOLYMER_CERTIFICATION),
    remarks: f.remarks ?? (record.remarks || 'CHECKED & FOUND ACCEPTABLE.')
  };
};

export interface CooData {
  certificateTitle?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  countryOfOrigin?: string;
  portOfLoading?: string;
  finalDestination?: string;
  transportMode?: string;
  goodsDescription?: string;
  packingInfo?: string;
  declarationClause?: string;
  exporterDeclaration?: string;
  remarks?: string;
}

export const DEFAULT_COO_DECLARATION: string = getCompanyCooDeclaration();

export const getCooReportData = (record: Partial<QcReportRecord>): Required<CooData> => {
  const c = (record as any)?.cooData || {};
  const activeComp = getActiveCompany();
  return {
    certificateTitle: c.certificateTitle ?? ((record as any).reportTitle || 'COUNTRY OF ORIGIN CERTIFICATE'),
    manufacturerName: c.manufacturerName ?? ((record as any).companyName || activeComp.name),
    manufacturerAddress: c.manufacturerAddress ?? ((record as any).companyAddress || (activeComp.address ? `P.O. BOX: 525026, ${activeComp.address.toUpperCase()}` : 'NEW INDUSTRIAL AREA, AJMAN, UNITED ARAB EMIRATES')),
    countryOfOrigin: c.countryOfOrigin ?? 'UNITED ARAB EMIRATES (MADE IN UAE)',
    portOfLoading: c.portOfLoading ?? 'UAE PORTS / JEBEL ALI / AJMAN',
    finalDestination: c.finalDestination ?? 'GCC / WORLDWIDE',
    transportMode: c.transportMode ?? 'BY ROAD / SEA FREIGHT',
    goodsDescription: c.goodsDescription ?? 'MANUFACTURED INDUSTRIAL FASTENERS, BOLTS, STUDS & NUTS',
    packingInfo: c.packingInfo ?? 'PACKED IN WOODEN BOXES / PALLETIZED',
    declarationClause: c.declarationClause ?? (record.certificationText || getCompanyCooDeclaration(activeComp)),
    exporterDeclaration: c.exporterDeclaration ?? 'The exporter of the products covered by this document declares that these products are of UAE preferential origin.',
    remarks: c.remarks ?? (record.remarks || 'GOODS OF UAE ORIGIN. CHECKED & FOUND SATISFACTORY.')
  };
};

export interface InspectionParameterRow {
  id: string;
  parameter: string;
  customerRequirement: string;
  supplyData: string;
  status: string;
  checked?: boolean;
}

export interface InspectionDimensionalRow {
  id: string;
  isSectionHeader?: boolean;
  sectionTitle?: string;
  characteristic: string;
  requirements: string;
  results: string;
  sampleSize: string; // S/S
  passQty: string; // Pass
  rejQty: string; // Rej
  specification: string; // Specification
  testMethod: string; // Test Method / [Device*1] / (Sample Plan*2)
  ssChecked?: boolean;
  passChecked?: boolean;
  rejChecked?: boolean;
  specChecked?: boolean;
  testMethodChecked?: boolean;
  checked?: boolean;
}

export interface InspectionPhoto {
  id: string;
  url?: string;
  imageUrl?: string;
  title?: string;
  caption?: string;
}

export interface InspectionReportData {
  inspectionStandard?: string;
  showInspectionStandard?: boolean; // UNCHECKED BY DEFAULT
  inspectionStage?: string;
  samplingPlan?: string;
  showSamplingPlan?: boolean; // UNCHECKED BY DEFAULT
  totalQtyOrdered?: string;
  totalQtySupplied?: string;
  totalQtyInspected?: string;
  overallDisposition?: string;
  dispositionStatus?: string;
  showGeneralQuality?: boolean;
  parameters?: InspectionParameterRow[];
  dimensionalSectionTitle?: string;
  dimensionalRows?: InspectionDimensionalRow[];
  showSsColumn?: boolean;
  showPassColumn?: boolean;
  showRejColumn?: boolean;
  showSpecColumn?: boolean;
  showTestMethodColumn?: boolean;
  certificationText?: string;
  remarks?: string;
  drawingImageUrl?: string;
  drawingNumber?: string;
  drawingNotes?: string;
  showDrawing?: boolean;
  markingImageUrl?: string;
  markingText?: string;
  markingNotes?: string;
  showMarking?: boolean;
  additionalPhotos?: InspectionPhoto[];
  moveCharacteristicsToPage2?: boolean;
  pdfImageSize?: 'standard' | 'large' | 'extralarge' | 'full';
  drawingFullWidth?: boolean;
  markingFullWidth?: boolean;
}

export const DEFAULT_INSPECTION_PARAMETERS: InspectionParameterRow[] = [
  { id: '1', parameter: '1. VISUAL & SURFACE FINISH', customerRequirement: 'Clean, smooth, uniform coating free from burrs, cracks, bare spots and defects', supplyData: 'Satisfactory. 100% visual inspection verified without surface imperfections', status: 'ACCEPTED', checked: true },
  { id: '2', parameter: '2. DIMENSIONAL VERIFICATION', customerRequirement: 'As per ASME B18.2.1 / ASME B18.2.2 / ASME B18.31.2 / DIN standards & tolerances', supplyData: 'Major diameter, length, across flats and hex dimensions verified within permissible limits', status: 'ACCEPTED', checked: true },
  { id: '3', parameter: '3. THREAD FIT & PITCH CHECK', customerRequirement: 'Class 2A / 2B fit, 6g / 6H fit. Ring & plug gauge verification', supplyData: 'GO gauge passed freely along full length; NO-GO gauge did not enter', status: 'ACCEPTED', checked: true },
  { id: '4', parameter: '4. COATING / PLATING THICKNESS', customerRequirement: 'Hot Dip Galvanized ASTM A153 Class C / 53 µm min average thickness', supplyData: 'Observed DFT: 65 – 88 µm (Average: 74 µm). Meets specified requirement', status: 'ACCEPTED', checked: true },
  { id: '5', parameter: '5. MARKING & IDENTIFICATION', customerRequirement: "Manufacturer logo 'MFI' and material grade stamp (e.g. 'B7', '2H', '8.8', 'GRADE 8')", supplyData: "Legible raised / indented head marking 'B7 MFI' & '2H MFI' verified", status: 'ACCEPTED', checked: true },
  { id: '6', parameter: '6. PACKAGING & PRESERVATION', customerRequirement: 'Seaworthy heavy-duty wooden boxes / palletized with moisture protection & tags', supplyData: 'Packed in secure wooden crates with weatherproof item tags & heat numbers', status: 'ACCEPTED', checked: true }
];

export const DEFAULT_INSPECTION_DIMENSIONAL_ROWS: InspectionDimensionalRow[] = [
  { id: '1', characteristic: 'Across Flat (mm)', requirements: '9.780 - 10.000', results: '9.823 - 9.846', sampleSize: '6', passQty: '6', rejQty: '0', specification: 'DIN 934-1987', testMethod: '[Mcr] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '2', characteristic: 'Across Corner (mm)', requirements: 'MIN 11.05', results: '11.18 - 11.19', sampleSize: '6', passQty: '6', rejQty: '0', specification: 'DIN 934-1987', testMethod: '[Cal] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '3', characteristic: 'Thickness (mm)', requirements: '4.700 - 5.000', results: '4.837 - 4.842', sampleSize: '6', passQty: '6', rejQty: '0', specification: 'DIN 934-1987', testMethod: '[Mcr] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '4', characteristic: 'Bearing Face Dia (mm)', requirements: 'MIN 8.80', results: '9.80 - 9.81', sampleSize: '6', passQty: '6', rejQty: '0', specification: 'DIN 934-1987', testMethod: '[Cal] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '5', characteristic: 'Countersink Dia (mm)', requirements: '6.00 - 6.75', results: '6.25 - 6.26', sampleSize: '6', passQty: '6', rejQty: '0', specification: 'DIN 934-1987', testMethod: '[Cal] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '6', characteristic: 'Perpendicularity (mm)', requirements: 'MAX 0.15', results: '0.05 - 0.05', sampleSize: '6', passQty: '6', rejQty: '0', specification: 'DIN 934-1987', testMethod: '[Twf] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '7', characteristic: 'Minor Dia.', requirements: 'Coarse 6H', results: 'PASSED', sampleSize: '15', passQty: '15', rejQty: '0', specification: 'ISO 965-2:1998', testMethod: '[Ppg] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '8', characteristic: 'Minor Diameter (mm)', requirements: '4.917 - 5.153', results: '5.08 - 5.09', sampleSize: '15', passQty: '15', rejQty: '0', specification: 'ISO 965-2:1998', testMethod: '[Cal] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '9', characteristic: 'Functional Dia.', requirements: 'Coarse 6H', results: 'PASSED', sampleSize: '15', passQty: '15', rejQty: '0', specification: 'ISO 965-2:1998', testMethod: '[Tpg] (18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true },
  { id: '10', characteristic: 'Visual Appearance', requirements: '', results: 'PASSED', sampleSize: '29', passQty: '29', rejQty: '0', specification: 'ISO 6157-2:1995', testMethod: '(18)', ssChecked: true, passChecked: true, rejChecked: true, specChecked: true, testMethodChecked: true, checked: true }
];

export const DEFAULT_INSPECTION_CERTIFICATION: string = "WE HEREBY CERTIFY THAT THE MATERIALS DESCRIBED ABOVE HAVE BEEN SUBJECTED TO PRE-SHIPMENT QUALITY INSPECTION IN ACCORDANCE WITH THE PURCHASE ORDER, DRAWINGS AND APPLICABLE STANDARDS, AND ARE FOUND TO BE STRICTLY CONFORMING.";

export const getInspectionReportData = (record: Partial<QcReportRecord>): Required<InspectionReportData> => {
  const ins = (record as any)?.inspectionData || {};
  return {
    inspectionStandard: ins.inspectionStandard ?? (record.specStandard || 'ISO 3269 / ASME B18.18 / ISO 2859-1'),
    showInspectionStandard: ins.showInspectionStandard ?? false, // UNCHECKED BY DEFAULT
    inspectionStage: ins.inspectionStage ?? 'FINAL PRE-SHIPMENT QUALITY INSPECTION',
    samplingPlan: ins.samplingPlan ?? 'ISO 2859-1 General Inspection Level II / AQL 1.0',
    showSamplingPlan: ins.showSamplingPlan ?? false, // UNCHECKED BY DEFAULT
    totalQtyOrdered: ins.totalQtyOrdered ?? 'AS PER PO',
    totalQtySupplied: ins.totalQtySupplied ?? 'AS PER DELIVERY NOTE',
    totalQtyInspected: ins.totalQtyInspected ?? '100% VISUAL / SAMPLING DIMENSIONAL',
    overallDisposition: ins.overallDisposition ?? 'CONFORMING / ACCEPTED FOR DISPATCH',
    dispositionStatus: ins.dispositionStatus ?? ins.overallDisposition ?? 'CONFORMING / ACCEPTED FOR DISPATCH',
    showGeneralQuality: ins.showGeneralQuality ?? true,
    parameters: (Array.isArray(ins.parameters) && ins.parameters.length > 0)
      ? ins.parameters.map((p: any) => ({ ...p, checked: p.checked ?? true }))
      : DEFAULT_INSPECTION_PARAMETERS,
    dimensionalSectionTitle: ins.dimensionalSectionTitle ?? 'Dimensional inspections',
    dimensionalRows: (Array.isArray(ins.dimensionalRows) && ins.dimensionalRows.length > 0)
      ? ins.dimensionalRows.map((r: any) => ({
          ...r,
          ssChecked: r.ssChecked ?? true,
          passChecked: r.passChecked ?? true,
          rejChecked: r.rejChecked ?? true,
          specChecked: r.specChecked ?? true,
          testMethodChecked: r.testMethodChecked ?? true,
          checked: r.checked ?? true
        }))
      : DEFAULT_INSPECTION_DIMENSIONAL_ROWS,
    showSsColumn: ins.showSsColumn ?? true,
    showPassColumn: ins.showPassColumn ?? true,
    showRejColumn: ins.showRejColumn ?? true,
    showSpecColumn: ins.showSpecColumn ?? true,
    showTestMethodColumn: ins.showTestMethodColumn ?? true,
    certificationText: ins.certificationText ?? (record.certificationText || DEFAULT_INSPECTION_CERTIFICATION),
    remarks: ins.remarks ?? (record.remarks || 'INSPECTION SATISFACTORY. RELEASED FOR DISPATCH.'),
    drawingImageUrl: ins.drawingImageUrl ?? '',
    drawingNumber: ins.drawingNumber ?? 'DWG-MFI-QC-001',
    drawingNotes: ins.drawingNotes ?? 'All dimensions inspected in mm as per approved manufacturing drawings & standard tolerances.',
    showDrawing: ins.showDrawing ?? true,
    markingImageUrl: ins.markingImageUrl ?? '',
    markingText: ins.markingText ?? 'MFI 8 / DIN 934',
    markingNotes: ins.markingNotes ?? "Legible manufacturer head stamp 'MFI' and property class '8' clearly verified.",
    showMarking: ins.showMarking ?? true,
    additionalPhotos: Array.isArray(ins.additionalPhotos) ? ins.additionalPhotos : [],
    moveCharacteristicsToPage2: ins.moveCharacteristicsToPage2 ?? (Boolean(ins.drawingImageUrl || ins.markingImageUrl || (ins.additionalPhotos && ins.additionalPhotos.length > 0)) || true),
    pdfImageSize: ins.pdfImageSize ?? 'extralarge',
    drawingFullWidth: ins.drawingFullWidth ?? false,
    markingFullWidth: ins.markingFullWidth ?? false
  };
};

export interface CocData {
  introText?: string;
  conformanceText?: string;
}

export const getCocReportData = (record: Partial<QcReportRecord>): Required<CocData> => {
  const c = (record as any)?.cocData || {};
  const activeComp = getActiveCompany();
  const company = (record as any)?.companyName || activeComp.name;
  const customer = record.customerName || 'Cabtech Trading & Contracting WLL';
  const po = record.customerPoNum || 'PO/24/01-004328';
  const date = record.date || new Date().toLocaleDateString('en-GB');

  const defaultIntro = `We hereby certify that ${company} has supplied the material dated ${date} to ${customer} as specified in the Purchase Order No: ${po}`;
  const defaultConformance = `Fasteners manufactured in UAE, ${company} are sampled, tested and inspected in accordance with the above specification and meets all of its requirements.`;

  return {
    introText: c.introText ?? (record.certificationText || defaultIntro),
    conformanceText: c.conformanceText ?? ((record as any)?.additionalNotes || record.remarks || defaultConformance)
  };
};

export interface ComplianceData {
  introText?: string;
  conformanceText?: string;
}

export const getComplianceReportData = (record: Partial<QcReportRecord>): Required<ComplianceData> => {
  const c = (record as any)?.complianceData || {};
  const activeComp = getActiveCompany();
  const company = (record as any)?.companyName || activeComp.name;
  const customer = record.customerName || 'HEAVY ENGINEERING INDUSTRIES AND SHIPBUILDING';
  const wo = record.workOrderNum || `${activeComp.code || 'MF'}24254`;
  const inv = record.invoiceNum || `${activeComp.code || 'MFI'}_2400354`;

  const defaultIntro = `We hereby certify that ${company} has supplied the material against Work order Ref: ${wo} to ${customer} as specified in the Invoice No. ${inv}`;
  const defaultConformance = `The above material complies with the scpecification mentioned in the above purchase order`;

  return {
    introText: c.introText ?? (record.certificationText || defaultIntro),
    conformanceText: c.conformanceText ?? ((record as any)?.additionalNotes || record.remarks || defaultConformance)
  };
};

export interface WarrantyData {
  introText?: string;
  warrantyPeriodText?: string;
}

export const getWarrantyReportData = (record: Partial<QcReportRecord>): Required<WarrantyData> => {
  const w = (record as any)?.warrantyData || {};
  const activeComp = getActiveCompany();
  const company = (record as any)?.companyName || activeComp.name;
  const defaultIntro = `We M/s. ${company} warrant that everything furnished here under shall be free from defects and faults in design, material, workmanship and manufacture and shall be of the highest grade and consistent with the established and generally accepted standard for goods of the type ordered and in full conformity, with the PO specifications.`;
  const defaultPeriod = `The fasteners are warranted for 12 months from the date of supply as per general terms & conditions above purchase order.`;

  return {
    introText: w.introText ?? (record.certificationText || defaultIntro),
    warrantyPeriodText: w.warrantyPeriodText ?? ((record as any)?.additionalNotes || record.remarks || defaultPeriod)
  };
};

export interface ItpActivityRow {
  id?: string;
  itemNo: string;
  processStage: string;
  referenceDoc: string;
  acceptanceCriteria: string;
  verifyingDoc: string;
  mfgIntervention: 'H' | 'W' | 'R' | 'S' | string;
  tpiIntervention: 'H' | 'W' | 'R' | 'S' | string;
  clientIntervention: 'H' | 'W' | 'R' | 'S' | string;
  remarks: string;
}

export interface ItpData {
  projectName?: string;
  clientName?: string;
  contractorPo?: string;
  workOrderRef?: string;
  productDescription?: string;
  specStandard?: string;
  itpRevision?: string;
  revisionDate?: string;
  legendText?: string;
  preparedByTitle?: string;
  reviewedByTitle?: string;
  approvedByTitle?: string;
  tpiApprovalTitle?: string;
  activityRows?: ItpActivityRow[];
  generalNotes?: string;
}

export const DEFAULT_ITP_ACTIVITIES: ItpActivityRow[] = [
  {
    id: 'itp-act-1',
    itemNo: '1.0',
    processStage: 'Raw Material Receiving Inspection & Heat Traceability Verification',
    referenceDoc: 'BS EN 10204 3.1 / ASTM A193 / ASTM A320 / ISO 898-1',
    acceptanceCriteria: 'Verification of Manufacturer MTC, heat number physical stamping on bars, 100% visual check for surface defects/cracks',
    verifyingDoc: 'Mill Test Certificate (MTC) / Material Inward Inspection Report',
    mfgIntervention: 'H',
    tpiIntervention: 'R',
    clientIntervention: 'R',
    remarks: 'Mandatory hold point before releasing raw stock for cutting/heading'
  },
  {
    id: 'itp-act-2',
    itemNo: '2.0',
    processStage: 'Chemical Composition & Spectro Optical Emission Analysis',
    referenceDoc: 'ASTM A751 / ASTM A193 / Product Material Spec',
    acceptanceCriteria: 'C, Mn, P, S, Si, Cr, Ni, Mo, V within ASTM standard threshold percentages per heat lot',
    verifyingDoc: 'Spectrochemical Lab Analysis Report / MTC',
    mfgIntervention: 'W',
    tpiIntervention: 'R',
    clientIntervention: 'R',
    remarks: '1 test per heat number / master melt'
  },
  {
    id: 'itp-act-3',
    itemNo: '3.0',
    processStage: 'Mechanical Tensile, 0.2% Yield & Elongation / Reduction Testing',
    referenceDoc: 'ASTM F606M / ASTM A370 / ISO 6892-1',
    acceptanceCriteria: 'Tensile and 0.2% Proof Yield Strength meet or exceed minimum ASTM grade requirements (e.g. B7/L7: 860 MPa min tensile)',
    verifyingDoc: 'Mechanical Test Certificate (Approved Lab)',
    mfgIntervention: 'H',
    tpiIntervention: 'W',
    clientIntervention: 'R',
    remarks: 'Tested on full-size fasteners / machined specimen'
  },
  {
    id: 'itp-act-4',
    itemNo: '4.0',
    processStage: 'Surface & Core Hardness Testing (Rockwell HRC/HRB & Brinell)',
    referenceDoc: 'ASTM E18 / ASTM E10 / ISO 6508-1',
    acceptanceCriteria: 'Hardness values within specified grade range (e.g. B7: 28–35 HRC; B7M/L7M: 99 HRB / 22 HRC max; 2H: 24–35 HRC)',
    verifyingDoc: 'Hardness Test Log & Inspection Record',
    mfgIntervention: 'W',
    tpiIntervention: 'S',
    clientIntervention: 'R',
    remarks: 'Sampled per ISO 3269 / ASME B18.18 sampling plan'
  },
  {
    id: 'itp-act-5',
    itemNo: '5.0',
    processStage: 'Charpy V-Notch Sub-Zero Impact Testing (Low Temp Service)',
    referenceDoc: 'ASTM A320 / ASTM A370 (at -46°C / -101°C)',
    acceptanceCriteria: 'Absorbed impact energy average ≥ 27 Joules (20 ft-lbf), no single value below 20 Joules at -46°C (Grade L7/L7M)',
    verifyingDoc: 'Sub-Zero Impact Test Report',
    mfgIntervention: 'H',
    tpiIntervention: 'W',
    clientIntervention: 'R',
    remarks: 'Mandatory for ASTM A320 low temperature fasteners'
  },
  {
    id: 'itp-act-6',
    itemNo: '6.0',
    processStage: 'Hot Forging / Heading, Machining & Thread Rolling Process Check',
    referenceDoc: 'ISO 4014 / ASME B18.2.1 / ASME B1.1 Class 2A/2B/6g',
    acceptanceCriteria: 'Continuous grain flow on rolled threads; pitch, lead angle, major/minor diameters comply with go/no-go ring gauges',
    verifyingDoc: 'In-Process Dimensional Inspection Record',
    mfgIntervention: 'H',
    tpiIntervention: 'S',
    clientIntervention: 'S',
    remarks: 'Thread rolled after heat treatment or per PO requirement'
  },
  {
    id: 'itp-act-7',
    itemNo: '7.0',
    processStage: 'Heat Treatment (Quenching & Tempering Cycle Monitoring)',
    referenceDoc: 'API 20E / AMS 2750 / Internal HT Furnace Calibration SOP',
    acceptanceCriteria: 'Furnace temperature calibrated per pyrometry standard; soak time, quench medium & temper temperature strictly logged',
    verifyingDoc: 'Calibrated HT Time-Temperature Chart & Record',
    mfgIntervention: 'H',
    tpiIntervention: 'R',
    clientIntervention: 'R',
    remarks: 'Furnace surveyed per API 20E / AMS 2750 Class 2 requirements'
  },
  {
    id: 'itp-act-8',
    itemNo: '8.0',
    processStage: 'Surface Coating / Galvanizing & Dry Film Thickness (DFT) Check',
    referenceDoc: 'ASTM A153 / ASTM B633 / ASTM D7091 / ASTM B117',
    acceptanceCriteria: 'Uniform finish, free of blisters/bare spots; HDG DFT ≥ 53µm; PTFE DFT ≥ 30µm; 1000h salt spray resistance verified',
    verifyingDoc: 'Coating Quality & Salt Spray Inspection Certificate',
    mfgIntervention: 'H',
    tpiIntervention: 'W',
    clientIntervention: 'R',
    remarks: 'Bake-out hydrogen embrittlement relief applied if hardness > 32 HRC'
  },
  {
    id: 'itp-act-9',
    itemNo: '9.0',
    processStage: 'Positive Material Identification (PMI Alloy Spectroscopy)',
    referenceDoc: 'API RP 578 / ASTM E1476',
    acceptanceCriteria: '100% of alloy fasteners verified with calibrated handheld XRF analyzer matching ASTM composition tolerances',
    verifyingDoc: 'PMI Inspection Report & Calibration Certificate',
    mfgIntervention: 'W',
    tpiIntervention: 'W',
    clientIntervention: 'R',
    remarks: '100% verification for stainless/super duplex/alloy orders'
  },
  {
    id: 'itp-act-10',
    itemNo: '10.0',
    processStage: 'Final 100% Visual, Dimensional & Product Marking Audit',
    referenceDoc: 'ISO 3269 / ASME B18.18 / MSS SP-25 / ASTM A193 Marking',
    acceptanceCriteria: 'Manufacturer logo (MFI), Grade identification (e.g. B7/B7M/2H) and Heat Lot physically stamped, clean burr-free threads',
    verifyingDoc: 'Final Quality Inspection Report (FQIR)',
    mfgIntervention: 'H',
    tpiIntervention: 'W',
    clientIntervention: 'W',
    remarks: 'Final hold point prior to packing release'
  },
  {
    id: 'itp-act-11',
    itemNo: '11.0',
    processStage: 'Preservation, Weatherproof Packaging, Tagging & Barcode Labeling',
    referenceDoc: 'MIL-STD-2073 / Client Project Packaging Specification',
    acceptanceCriteria: 'Thread caps/sleeves fitted, heavy-duty wooden boxes strapped, weatherproof VCI wrapping, durable weather-resistant labeling',
    verifyingDoc: 'Packing Inspection Report & Release Note',
    mfgIntervention: 'H',
    tpiIntervention: 'S',
    clientIntervention: 'R',
    remarks: 'Corrosion inhibitor oil applied on unplated/machined threads'
  },
  {
    id: 'itp-act-12',
    itemNo: '12.0',
    processStage: 'QA/QC Documentation Dossier Review & Final Release Sign-Off',
    referenceDoc: 'BS EN 10204 Type 3.1 / ISO 9001:2015 Clause 8.6',
    acceptanceCriteria: 'Complete dossier containing raw material MTR, mechanical/chemical test certs, coating test logs, NDT reports compiled',
    verifyingDoc: 'EN 10204 3.1 Inspection Certificate & Shipping Release',
    mfgIntervention: 'H',
    tpiIntervention: 'R',
    clientIntervention: 'H',
    remarks: 'Final release and shipping authorization'
  }
];

export const getItpReportData = (record: Partial<QcReportRecord>): Required<ItpData> => {
  const itp = (record as any)?.itpData || {};
  const activeComp = getActiveCompany();
  const company = (record as any)?.companyName || activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
  const customer = record.customerName || 'CLIENT / CONTRACTOR NAME';
  const po = record.customerPoNum || 'PO-2026-MFI-0089';
  const wo = record.workOrderNum || 'WO-24098';

  return {
    projectName: itp.projectName ?? ((record as any).projectName || 'DUBAI COMMERCIAL EXPANSION & MARINE JETTY PROJECT'),
    clientName: itp.clientName ?? customer,
    contractorPo: itp.contractorPo ?? po,
    workOrderRef: itp.workOrderRef ?? wo,
    productDescription: itp.productDescription ?? ((record as any).itemDescription || 'HEAVY HEX HIGH TENSILE STRUCTURAL BOLTS, STUDS, NUTS & ANCHORAGE ASSEMBLIES'),
    specStandard: itp.specStandard ?? ((record as any).specStandard || 'ASTM A193 B7 / A194 2H / ASTM A320 L7 / ISO 4014 / EN 10204 3.1'),
    itpRevision: itp.itpRevision ?? 'REV 00',
    revisionDate: itp.revisionDate ?? (record.date || new Date().toLocaleDateString('en-GB')),
    legendText: itp.legendText ?? 'INTERVENTION LEGEND:  H = Hold Point (Mandatory Witness - Proceed only upon signoff) | W = Witness Point (Advance notification required) | R = Review of Inspection Documents/Records | S = Surveillance / Random Spot Check',
    preparedByTitle: itp.preparedByTitle ?? 'QA/QC Engineer',
    reviewedByTitle: itp.reviewedByTitle ?? 'QC Manager',
    approvedByTitle: itp.approvedByTitle ?? 'Technical Director / General Manager',
    tpiApprovalTitle: itp.tpiApprovalTitle ?? 'Client / Third Party Inspector (TPI)',
    activityRows: Array.isArray(itp.activityRows) && itp.activityRows.length > 0 ? itp.activityRows : DEFAULT_ITP_ACTIVITIES,
    generalNotes: itp.generalNotes ?? '1. All testing and inspections shall strictly adhere to approved Project Specifications & International Standards.\n2. Calibration certificates of all measuring tools, gauges and testing equipment shall be valid and available for review.\n3. Third Party Inspection (TPI) notifications must be given at least 48 hours in advance for witness/hold points.\n4. Final dispatch is subject to full verification and acceptance of the EN 10204 3.1 QC Dossier.'
  };
};

/**
 * Renders declaration statements with Supplier Name and Customer Name in BOLD.
 * Supports both explicit markdown **bold text** and automatic detection of Supplier & Customer names.
 */
export const renderDeclarationWithBolds = (
  text?: string,
  companyName?: string,
  customerName?: string
): React.ReactNode => {
  if (!text) return null;

  // 1. If explicit markdown **bold** is present, parse it
  if (text.includes('**')) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const clean = part.slice(2, -2);
            return (
              <strong key={i} className="font-black text-black">
                {clean}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }

  // 2. Otherwise, auto-detect Supplier, Customer, and key reference names to bold
  const boldPhrases: string[] = [];

  if (companyName && companyName.trim().length > 2) {
    boldPhrases.push(companyName.trim());
  }

  // Standard supplier variations
  [
    'Marine Fasteners Industries L.L.C Ajman U.A.E',
    'Marine Fasteners Industries L.L.C.',
    'Marine Fasteners Industries L.L.C',
    'MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP)',
    'MARINE FASTENERS INDUSTRIES L.L.C.',
    'MARINE FASTENERS INDUSTRIES L.L.C',
    'Marine Fasteners Industries'
  ].forEach(p => {
    if (!boldPhrases.some(existing => existing.toLowerCase() === p.toLowerCase())) {
      boldPhrases.push(p);
    }
  });

  if (customerName && customerName.trim().length > 2) {
    if (!boldPhrases.some(existing => existing.toLowerCase() === customerName.trim().toLowerCase())) {
      boldPhrases.push(customerName.trim());
    }
  }

  // Standard customer defaults
  [
    'HEAVY ENGINEERING INDUSTRIES AND SHIPBUILDING',
    'Cabtech Trading & Contracting WLL'
  ].forEach(p => {
    if (!boldPhrases.some(existing => existing.toLowerCase() === p.toLowerCase())) {
      boldPhrases.push(p);
    }
  });

  // Filter phrases present in text and sort longest first
  const activePhrases = boldPhrases
    .filter(p => text.toLowerCase().includes(p.toLowerCase()))
    .sort((a, b) => b.length - a.length);

  if (activePhrases.length === 0) {
    return <span>{text}</span>;
  }

  const escaped = activePhrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const isBoldMatch = activePhrases.some(p => p.toLowerCase() === part.toLowerCase());
        if (isBoldMatch) {
          return (
            <strong key={i} className="font-black text-black">
              {part}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export const DEFAULT_COMPANY_STAMP_URL = getCompanyQcStampSvg();

export const DEFAULT_PREPARED_SIGN_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 70" width="200" height="70">
  <path d="M 20,45 Q 40,15 65,30 T 110,35 T 145,25 Q 165,20 180,40 M 45,35 Q 70,55 120,48 Q 155,42 175,32 M 85,20 Q 95,50 100,55" 
        fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);

interface DraggableImageProps {
  src: string;
  alt: string;
  height: number;
  posX: number;
  posY: number;
  onPositionChange: (x: number, y: number) => void;
  className?: string;
  title?: string;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  src,
  alt,
  height,
  posX,
  posY,
  onPositionChange,
  className = '',
  title = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: posX, y: posY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    onPositionChange(Math.round(initialPos.x + dx), Math.round(initialPos.y + dy));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, initialPos]);

  return (
    <img
      src={src}
      alt={alt}
      onMouseDown={handleMouseDown}
      style={{
        height: `${height}px`,
        transform: `translate(${posX}px, ${posY}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      className={`${className} transition-none select-none hover:ring-1 hover:ring-amber-500 rounded`}
      title={title}
    />
  );
};

export interface SpecializedQcReportCanvasProps {
  formData: QcReportRecord;
  setFormData: React.Dispatch<React.SetStateAction<QcReportRecord>>;
  isFullscreenEditor: boolean;
  onUploadLogo: (type: 'company' | 'iso' | 'engineer' | 'manager' | 'stamp', file: File) => void;
  onSaveAsset: (key: string, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string, index?: number) => void;
  onPoOrInvoiceChange: (field: 'customerPoNum' | 'invoiceNum' | 'workOrderNum', value: string) => void;
  isSampleCert: (record: Partial<QcReportRecord>) => boolean;
  DEFAULT_ISO_LOGO_URL: string;
  onOpenExcelModal?: (target: 'items' | 'chemical' | 'mechanical') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const getSpecializedReportDetails = (type?: string) => {
  const normType = (type || 'HDG_REPORT').toUpperCase();
  if (normType.includes('HDG') || normType.includes('HOT_DIP') || normType.includes('GALVANIZ')) {
    return {
      title: 'HOT DIP COATING TEST REPORT',
      badge: '',
      defaultStandard: 'ASTM A153 CL-C',
      certPrefix: 'HDG',
      bannerText: '',
      colCoatType: 'COAT TYPE',
      defaultCoatType: 'HDG',
      colCriteria: 'COATING ACCEPTABLE CRITERIA',
      defaultCriteria: '53 MICRONS MIN',
      colObserved: 'OBSERVED COATING',
      defaultObserved: '106 - 110',
      colAvg: 'AVG.',
      defaultAvg: '108',
      colMass: 'MASS OF ZINC COATING (gm/ m2)',
      defaultMass: '777.6',
      appearanceNote: 'ZINC COATING IS FREE OF GROSS SURFACE IMPERFECTIONS, BARE SPOTS HEAVY LUMPS AND BLISTERS.',
      thicknessNote: 'AS MENTIONED ABOVE. THE READINGS ARE TAKEN ON RANDOM PIECES AND FOUND WITHIN THE RANGE AS MENTIONED ABOVE',
      adhesionNote: 'COATING DOES NOT PEEL OFF TO EXPOSE THE UNDERLYING STEEL WHEN TESTED WITH STOUT KNIFE, AS PER ASTM A153 CL-C',
      certificationText: 'WE CERTIFY THAT THE ABOVE MENTIONED MATERIAL HAS BEEN HOT DIP GALVANIZED AS PER ASTM A153 CL-C',
      defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
    };
  }

  switch (normType) {
    case 'GI_REPORT':
    case 'GI':
    case 'ELECTRO_GALVANIZED':
      return {
        title: 'ELECTRO-GALVANIZED (GI) TEST REPORT',
        badge: '',
        defaultStandard: 'ASTM B633 Class Fe/Zn 8 / ISO 2081',
        certPrefix: 'GI',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'GI',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '8 MICRONS MIN',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '9.5 – 11.2',
        colAvg: 'AVG.',
        defaultAvg: '10.4',
        colMass: 'PASSIVATION / FINISH',
        defaultMass: 'Clear Blue / Trivalent',
        appearanceNote: 'PLATING IS UNIFORM, SMOOTH, FREE FROM BLISTERS, PITS AND NODULES.',
        thicknessNote: 'THE READINGS ARE TAKEN ON RANDOM PIECES AND CONFORM TO ASTM B633.',
        adhesionNote: 'COATING SATISFIES BURNISHING & ADHESION TEST WITHOUT FLAKING.',
        certificationText: 'WE CERTIFY THAT THE ABOVE MENTIONED MATERIAL HAS BEEN ELECTRO-GALVANIZED AS PER ASTM B633',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'NICKEL_REPORT':
      return {
        title: 'NICKEL PLATING TEST REPORT',
        badge: '',
        defaultStandard: 'ASTM B733 / ASTM B689',
        certPrefix: 'NIC',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'NICKEL',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '15 MICRONS MIN',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '18 – 22',
        colAvg: 'AVG.',
        defaultAvg: '20',
        colMass: 'HARDNESS (HRC)',
        defaultMass: '48 - 52 HRC',
        appearanceNote: 'NICKEL COATING IS CONTINUOUS, SMOOTH, PORE-FREE AND UNIFORM.',
        thicknessNote: 'MEASURED VIA MAGNETIC / EDDY CURRENT GAUGE AND FOUND SATISFACTORY.',
        adhesionNote: 'PASSED CHISEL / THERMAL SHOCK ADHESION TEST AS PER ASTM B571.',
        certificationText: 'WE CERTIFY THAT THE MATERIAL HAS BEEN NICKEL PLATED AS PER ASTM B733',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'YELLOW_PASSIVATED_REPORT':
      return {
        title: 'YELLOW PASSIVATED ZINC TEST REPORT',
        badge: '',
        defaultStandard: 'ASTM B633 Type II',
        certPrefix: 'YP',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'YELLOW ZINC',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '8 MICRONS MIN',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '10 – 12',
        colAvg: 'AVG.',
        defaultAvg: '11',
        colMass: 'CHROMATE FILM',
        defaultMass: 'Iridescent Yellow Passivation',
        appearanceNote: 'UNIFORM IRIDESCENT YELLOW CHROMATE COATING FREE OF DEFECTS.',
        thicknessNote: 'MEASURED AS PER ASTM B633 AND FOUND WITHIN PERMISSIBLE LIMITS.',
        adhesionNote: 'PASSES CORROSION & DRY RUN ADHESION TEST SATISFACTORILY.',
        certificationText: 'WE CERTIFY THAT THE ABOVE MATERIAL HAS BEEN YELLOW PASSIVATED AS PER ASTM B633',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'CADMIUM_REPORT':
      return {
        title: 'CADMIUM PLATING TEST REPORT',
        badge: '',
        defaultStandard: 'ASTM B766 Class 8 Type II / AMS-QQ-P-416',
        certPrefix: 'CAD',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'CADMIUM',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '8 MICRONS MIN',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '10 – 14',
        colAvg: 'AVG.',
        defaultAvg: '12',
        colMass: 'SALT SPRAY RESISTANCE',
        defaultMass: '96 Hours Passed',
        appearanceNote: 'FINE GRAINED UNIFORM CADMIUM LAYER DEVOID OF BURNING OR VOIDS.',
        thicknessNote: 'TESTED VIA X-RAY FLUORESCENCE / MAGNETIC METHOD AS PER ASTM B766.',
        adhesionNote: 'NO FLAKING OR BLISTERING DETECTED AFTER PLATING BEND / SCRATCH TEST.',
        certificationText: 'WE CERTIFY THAT THE ABOVE MATERIAL HAS BEEN CADMIUM PLATED AS PER SPECIFICATION',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'PTFE_REPORT':
      return {
        title: 'XYLAN COATING TEST REPORT',
        badge: '',
        defaultStandard: 'Whitford / Xylan 1070 / 1424 / ISO 10683',
        certPrefix: 'XYL',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'PTFE / XYLAN',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '30+ MICRONS',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '30+ Microns',
        colAvg: 'AVG.',
        defaultAvg: '32',
        colMass: 'COLOUR & FINISH',
        defaultMass: 'Blue / Smooth Fluoropolymer',
        appearanceNote: 'SMOOTH CONTINUOUS FLUOROPOLYMER FILM FREE OF PINHOLES AND BLISTERS.',
        thicknessNote: 'DFT READINGS VERIFIED VIA DIGITAL GAUGE SATISFYING SPECIFICATION.',
        adhesionNote: 'CROSS HATCH ADHESION TEST CLASS 4 OR BETTER AS PER ASTM D3359 PASSED.',
        certificationText: 'WE CERTIFY THAT THE MATERIAL HAS BEEN PTFE / XYLAN COATED AS PER SPECIFICATION',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'NICKEL_COBALT_REPORT':
    case 'NICKEL_COBALT':
      return {
        title: 'NICKEL COBALT COATING TEST REPORT',
        badge: '',
        defaultStandard: 'ASTM B994',
        certPrefix: 'NIC-CO',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'NICKEL COBALT',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '15 MICRONS MIN',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '18 – 22',
        colAvg: 'AVG.',
        defaultAvg: '20',
        colMass: 'HARDNESS / ALLOY',
        defaultMass: 'Ni-Co Alloy / Pass',
        appearanceNote: 'NICKEL COBALT COATING IS CONTINUOUS, SMOOTH, PORE-FREE AND UNIFORM.',
        thicknessNote: 'MEASURED VIA MAGNETIC / EDDY CURRENT GAUGE AS PER ASTM B994 AND FOUND SATISFACTORY.',
        adhesionNote: 'PASSED CHISEL / THERMAL SHOCK ADHESION TEST AS PER APPLICABLE SPECIFICATION.',
        certificationText: 'WE CERTIFY THAT THE MATERIAL HAS BEEN NICKEL COBALT COATED AS PER ASTM B994',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'NEOPRENE_SLEEVE_REPORT':
    case 'NEOPRENE_SLEEVE':
    case 'NEOPRENE':
      return {
        title: 'NEOPRENE SLEEVE',
        badge: '',
        defaultStandard: 'ASTM D 2240 / ASTM D 412',
        certPrefix: 'NS',
        bannerText: '',
        colCoatType: 'MATERIAL',
        defaultCoatType: 'EPDM',
        colCriteria: 'COMPOUND CODE',
        defaultCriteria: 'EPDM-70',
        colObserved: 'OBSERVED',
        defaultObserved: 'Pass',
        colAvg: 'AVG.',
        defaultAvg: '—',
        colMass: 'POLYMER',
        defaultMass: 'EPDM / Black',
        appearanceNote: 'UNIFORM SMOOTH FINISH FREE OF PINHOLES AND DEFECTS.',
        thicknessNote: 'DIMENSIONAL & PHYSICAL PROPERTIES CONFORM TO ASTM SPECIFICATIONS.',
        adhesionNote: 'PASSED PHYSICAL AND AGING PROPERTY TESTS AS PER ASTM D 573.',
        certificationText: 'WE CERTIFY THAT THE MATERIAL HAS BEEN TESTED AND CONFORMS TO SPECIFIED EPDM / NEOPRENE PROPERTIES',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'FLUROPOLYMER_REPORT':
    case 'FLUROPOLYMER':
    case 'FLURO_POLYMER':
    case 'FLUOROPOLYMER':
      return {
        title: 'FLUROPOLYMER COATING',
        badge: '',
        defaultStandard: '09-SAMSS-107',
        certPrefix: 'FL-POLY',
        bannerText: '',
        colCoatType: 'FINISH',
        defaultCoatType: 'FLUROPOLYMER',
        colCriteria: 'SPECIFICATION',
        defaultCriteria: '09-SAMSS-107',
        colObserved: 'OBSERVED',
        defaultObserved: 'Satisfactory',
        colAvg: 'AVG.',
        defaultAvg: '45 µm',
        colMass: 'DFT (µm)',
        defaultMass: '35-55 Microns',
        appearanceNote: 'Cracks & Stamp edges not observed. Visual inspection satisfactory as per clause 6.1.3 of 09-SAMSS-107.',
        thicknessNote: 'Dry Film Thickness 35-55 Microns as per clause 6.1.4 of 09-SAMSS-107 Specification.',
        adhesionNote: 'Adhesion test as per clause 6.2 of 09-SAMSS-107 Specification passed.',
        certificationText: "We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer's specification(s), and that they satisfy the requirements.",
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'TEFLON_REPORT':
    case 'TEFLON':
      return {
        title: 'TEFLON COATING TEST REPORT',
        badge: '',
        defaultStandard: 'ASTM D7091 / ISO 2808',
        certPrefix: 'TEF',
        bannerText: '',
        colCoatType: 'COLOR',
        defaultCoatType: 'BLACK',
        colCriteria: 'SPECIFICATION',
        defaultCriteria: 'PTFE / TEFLON',
        colObserved: 'OBSERVED',
        defaultObserved: 'Pass',
        colAvg: 'AVG.',
        defaultAvg: '45 µm',
        colMass: 'DFT (µm)',
        defaultMass: '35-55 Microns',
        appearanceNote: 'Uniform continuous PTFE / Teflon fluoropolymer coating free of pinholes, sags or defects.',
        thicknessNote: 'Dry film thickness verified within specified tolerance (35-55 µm) as per ASTM D7091.',
        adhesionNote: 'Adhesion test cross-hatch class 4B/5B passed conforming to ASTM D3359.',
        certificationText: 'WE CERTIFY THAT THE MATERIAL HAS BEEN TREATED WITH TEFLON / PTFE COATING AS PER SPECIFICATION',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
    case 'COO_CERTIFICATE':
    case 'COO':
    case 'COUNTRY_OF_ORIGIN':
    case 'CERTIFICATE_OF_ORIGIN': {
      const activeComp = getActiveCompany();
      const compName = activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
      return {
        title: 'COUNTRY OF ORIGIN CERTIFICATE',
        badge: '',
        defaultStandard: 'UNITED ARAB EMIRATES RULES OF ORIGIN',
        certPrefix: isBoltMasterCompany(activeComp) ? 'BMM-COO' : isUnitedMetalCompany(activeComp) ? 'UMI-COO' : 'COO',
        bannerText: '',
        colCoatType: 'ORIGIN',
        defaultCoatType: 'UAE',
        colCriteria: 'HEAT NUMBER',
        defaultCriteria: '—',
        colObserved: 'OBSERVED',
        defaultObserved: 'Pass',
        colAvg: 'AVG.',
        defaultAvg: '—',
        colMass: 'PACKING',
        defaultMass: 'Wooden Crates',
        appearanceNote: `MANUFACTURED IN UNITED ARAB EMIRATES, ${compName.toUpperCase()}.`,
        thicknessNote: 'STRICTLY COMPLIANT WITH UAE RULES OF ORIGIN AND INDUSTRIAL LICENSING.',
        adhesionNote: 'FABRICATED UNDER QUALITY MANAGEMENT SYSTEM.',
        certificationText: `WE HEREBY DECLARE AND CERTIFY THAT THE GOODS DESCRIBED BELOW HAVE BEEN MANUFACTURED, PROCESSED AND PRODUCED IN THE UNITED ARAB EMIRATES BY ${compName.toUpperCase()}.`,
        defaultRemarks: 'GOODS OF UAE ORIGIN. CHECKED & FOUND SATISFACTORY.'
      };
    }
    case 'INSPECTION_REPORT':
    case 'INSPECTION':
    case 'FINAL_INSPECTION':
    case 'QC_INSPECTION':
      return {
        title: 'QUALITY INSPECTION REPORT',
        badge: '',
        defaultStandard: 'ISO 3269 / ASME B18.18 / ISO 2859-1',
        certPrefix: 'INSP',
        bannerText: '',
        colCoatType: 'FINISH',
        defaultCoatType: 'HDG',
        colCriteria: 'CUSTOMER REQUIRED DATA',
        defaultCriteria: 'SPECIFICATION AS PER PO',
        colObserved: 'SUPPLY DATA (OBSERVED)',
        defaultObserved: 'CONFORMS TO SPECIFICATION',
        colAvg: 'AVG.',
        defaultAvg: 'PASS',
        colMass: 'DISPOSITION',
        defaultMass: 'ACCEPTED',
        appearanceNote: '100% VISUAL AND DIMENSIONAL SAMPLING INSPECTION CARRIED OUT.',
        thicknessNote: 'CALIBRATED MEASURING INSTRUMENTS AND GAUGES USED ACCORDING TO ISO 3269.',
        adhesionNote: 'ALL LOTS VERIFIED AND FOUND CONFORMING TO PURCHASE ORDER REQUIREMENTS.',
        certificationText: 'WE HEREBY CERTIFY THAT THE MATERIALS LISTED HAVE BEEN INSPECTED AND MEET ALL CUSTOMER REQUIRED DATA AND SPECIFICATIONS.',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE. RELEASED FOR DISPATCH.'
      };
    case 'COC_REPORT':
    case 'COC':
    case 'CERTIFICATE_OF_CONFORMITY':
    case 'CONFORMITY_CERTIFICATE': {
      const activeComp = getActiveCompany();
      const compName = activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
      return {
        title: 'CERTIFICATE OF CONFORMITY',
        badge: '',
        defaultStandard: 'BS EN 10204 2.1 / 2.2',
        certPrefix: isBoltMasterCompany(activeComp) ? 'BMM-COC' : isUnitedMetalCompany(activeComp) ? 'UMI-COC' : 'COC',
        bannerText: '',
        colCoatType: 'FINISH',
        defaultCoatType: 'SELF',
        colCriteria: 'HEAT NUMBER',
        defaultCriteria: '—',
        colObserved: 'OBSERVED',
        defaultObserved: 'CONFORMS',
        colAvg: 'AVG.',
        defaultAvg: '—',
        colMass: 'SPECIFICATION',
        defaultMass: 'PO SPECIFICATION',
        appearanceNote: `MANUFACTURED IN UAE, ${compName.toUpperCase()}.`,
        thicknessNote: 'SAMPLED, TESTED AND INSPECTED IN ACCORDANCE WITH SPECIFICATIONS.',
        adhesionNote: 'FABRICATED UNDER QUALITY MANAGEMENT SYSTEM.',
        certificationText: 'WE HEREBY CERTIFY THAT THE MATERIALS DESCRIBED HEREIN CONFORM TO THE PURCHASE ORDER AND APPLICABLE SPECIFICATIONS.',
        defaultRemarks: 'CONFORMS TO SPECIFICATION.'
      };
    }
    case 'COMPLIANCE_REPORT':
    case 'COMPLIANCE':
    case 'COMPLIANCE_LETTER':
    case 'LETTER_OF_COMPLIANCE': {
      const activeComp = getActiveCompany();
      const compName = activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
      return {
        title: 'LETTER OF COMPLIANCE',
        badge: '2.1 (EN 10204-Ed 2004)',
        defaultStandard: '2.1 (EN 10204-Ed 2004)',
        certPrefix: 'LOC',
        bannerText: '',
        colCoatType: 'FINISH',
        defaultCoatType: 'HDG',
        colCriteria: 'SPECIFICATION',
        defaultCriteria: 'ISO 7089/200 HV',
        colObserved: 'OBSERVED',
        defaultObserved: 'CONFORMS',
        colAvg: 'AVG.',
        defaultAvg: '—',
        colMass: 'SIZE',
        defaultMass: 'DIN 125',
        appearanceNote: `MANUFACTURED IN UAE, ${compName.toUpperCase()}.`,
        thicknessNote: 'SAMPLED, TESTED AND INSPECTED IN ACCORDANCE WITH SPECIFICATIONS.',
        adhesionNote: 'FABRICATED UNDER QUALITY MANAGEMENT SYSTEM.',
        certificationText: 'WE HEREBY CERTIFY THAT THE MATERIAL SUPPLIED COMPLIES WITH THE SPECIFICATION MENTIONED IN THE PURCHASE ORDER.',
        defaultRemarks: 'The above material complies with the specification mentioned in the above purchase order.'
      };
    }
    case 'INSPECTION_TEST_PLAN':
    case 'ITP_REPORT':
    case 'ITP':
    case 'INSPECTION_PLAN': {
      return {
        title: 'INSPECTION AND TEST PLAN (ITP)',
        badge: 'QUALITY SURVEILLANCE MATRIX',
        defaultStandard: 'ISO 9001 / ASTM A193 / ASTM A194 / BS EN 10204 3.1',
        certPrefix: 'ITP',
        bannerText: 'PROJECT QUALITY SURVEILLANCE & INSPECTION PLAN',
        colCoatType: 'STAGE',
        defaultCoatType: 'RECEIVING / MFG',
        colCriteria: 'ACCEPTANCE CRITERIA',
        defaultCriteria: 'ASTM / ISO SPECIFICATION',
        colObserved: 'OBSERVED / VERIFIED',
        defaultObserved: 'CONFORMS TO QUALITY PLAN',
        colAvg: 'INTERVENTION',
        defaultAvg: 'H / W / R',
        colMass: 'DOC REF',
        defaultMass: 'MTC 3.1 / ITR',
        appearanceNote: '100% VISUAL & DIMENSIONAL VERIFICATION AS PER QUALITY PLAN.',
        thicknessNote: 'ALL HOLD, WITNESS AND REVIEW POINTS STRICTLY COMPLIED WITH.',
        adhesionNote: 'THIRD PARTY & CLIENT INTERVENTION ENDORSED ACCORDING TO SPECIFICATION.',
        certificationText: 'WE HEREBY CERTIFY THAT THE MANUFACTURING, TESTING AND INSPECTION ACTIVITIES HAVE BEEN PLANNED AND EXECUTED IN STRICT ACCORDANCE WITH THIS INSPECTION AND TEST PLAN (ITP).',
        defaultRemarks: 'INSPECTION AND TEST PLAN FULLY ENDORSED AND SATISFIED.'
      };
    }
    case 'WARRANTY_CERTIFICATE':
    case 'WARRANTY':
    case 'WARRANTY_REPORT': {
      const activeComp = getActiveCompany();
      const compName = activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
      return {
        title: 'WARRANTY CERTIFICATE',
        badge: '',
        defaultStandard: '',
        certPrefix: 'WC',
        bannerText: '',
        colCoatType: 'FINISH',
        defaultCoatType: 'SELF',
        colCriteria: 'HEAT NUMBER',
        defaultCriteria: '—',
        colObserved: 'OBSERVED',
        defaultObserved: 'CONFORMS',
        colAvg: 'AVG.',
        defaultAvg: '—',
        colMass: 'SIZE',
        defaultMass: '',
        appearanceNote: `MANUFACTURED IN UAE, ${compName.toUpperCase()}.`,
        thicknessNote: 'FREE FROM DEFECTS AND FAULTS IN DESIGN, MATERIAL AND WORKMANSHIP.',
        adhesionNote: 'WARRANTED FOR 12 MONTHS FROM DATE OF SUPPLY.',
        certificationText: `We M/s. ${compName} warrant that everything furnished here under shall be free from defects and faults in design, material, workmanship and manufacture and shall be of the highest grade and consistent with the established and generally accepted standard for goods of the type ordered and in full conformity, with the PO specifications.`,
        defaultRemarks: 'The fasteners are warranted for 12 months from the date of supply as per general terms & conditions above purchase order.'
      };
    }
    case 'INSPECTION_TEST_PLAN':
    case 'ITP_REPORT':
    case 'ITP':
    case 'INSPECTION_PLAN': {
      const activeComp = getActiveCompany();
      const compName = activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
      return {
        title: 'INSPECTION AND TEST PLAN (ITP)',
        badge: 'QA/QC QUALITY PLAN',
        defaultStandard: 'ISO 9001:2015 / ASTM / BS EN 10204 3.1',
        certPrefix: isBoltMasterCompany(activeComp) ? 'BMM-ITP' : isUnitedMetalCompany(activeComp) ? 'UMI-ITP' : 'ITP',
        bannerText: 'QUALITY ASSURANCE & SURVEILLANCE MATRIX',
        colCoatType: 'PROCESS STAGE',
        defaultCoatType: 'MANUFACTURING & TESTING',
        colCriteria: 'ACCEPTANCE STANDARD',
        defaultCriteria: 'PROJECT SPECIFICATION / ASTM',
        colObserved: 'OBSERVED',
        defaultObserved: 'CONFORMS',
        colAvg: 'AVG.',
        defaultAvg: '—',
        colMass: 'INTERVENTION',
        defaultMass: 'H / W / R / S',
        appearanceNote: `MANUFACTURED UNDER STRICT ISO 9001:2015 QA/QC PROTOCOL BY ${compName.toUpperCase()}.`,
        thicknessNote: 'ALL QUALITY SURVEILLANCE & HOLD POINTS DULY NOTIFIED AND MONITORED.',
        adhesionNote: 'COMPLIANT WITH CUSTOMER PROJECT SPECIFICATIONS AND INTERNATIONAL STANDARDS.',
        certificationText: 'WE HEREBY CONFIRM THAT THE INSPECTION AND TEST ACTIVITIES WILL BE CONDUCTED IN FULL COMPLIANCE WITH THIS APPROVED ITP MATRIX.',
        defaultRemarks: 'ALL TESTING & INSPECTION POINTS SHALL BE DOCUMENTED IN FINAL QC DOSSIER PRIOR TO DISPATCH.'
      };
    }
    default:
      return {
        title: 'QUALITY INSPECTION REPORT',
        badge: '',
        defaultStandard: 'BS EN 10204 3.1',
        certPrefix: 'MFI',
        bannerText: '',
        colCoatType: 'COAT TYPE',
        defaultCoatType: 'HDG',
        colCriteria: 'ACCEPTABLE CRITERIA',
        defaultCriteria: '53 MICRONS MIN',
        colObserved: 'OBSERVED COATING',
        defaultObserved: '106 - 110',
        colAvg: 'AVG.',
        defaultAvg: '108',
        colMass: 'MASS OF ZINC COATING (gm/ m2)',
        defaultMass: '777.6',
        appearanceNote: 'FREE OF SURFACE IMPERFECTIONS, BARE SPOTS, HEAVY LUMPS AND BLISTERS.',
        thicknessNote: 'AS MENTIONED ABOVE. THE READINGS ARE TAKEN ON RANDOM PIECES AND FOUND SATISFACTORY.',
        adhesionNote: 'COATING SATISFIES ADHESION TEST AS PER APPLICABLE SPECIFICATION.',
        certificationText: 'WE CERTIFY THAT THE ABOVE MENTIONED MATERIAL HAS BEEN INSPECTED & TESTED AS PER STANDARD',
        defaultRemarks: 'CHECKED & FOUND ACCEPTABLE.'
      };
  }
};

export const parseObservedNumbers = (str?: string): number[] => {
  if (!str) return [];
  const matches = str.match(/\d+(?:\.\d+)?/g);
  if (!matches) return [];
  return matches.map(n => parseFloat(n)).filter(n => !isNaN(n));
};

export const calculateAverageFromObserved = (observedStr?: string): string => {
  const nums = parseObservedNumbers(observedStr);
  if (nums.length === 0) return '';
  const sum = nums.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / nums.length;
  if (Math.abs(avg - Math.round(avg)) < 0.001) {
    return Math.round(avg).toString();
  }
  return (Math.round(avg * 10) / 10).toFixed(1);
};

export const calcZincMass = (avgVal?: string | number): string => {
  if (avgVal === undefined || avgVal === null || avgVal === '') return '';
  const cleanStr = String(avgVal).trim();
  if (!cleanStr) return '';
  const num = parseFloat(cleanStr);
  if (isNaN(num)) return '';
  const calculated = Math.round(num * 7.2 * 10) / 10;
  return calculated.toFixed(1);
};

export const calcShortageQty = (orderedStr?: string, suppliedStr?: string): string => {
  if (!orderedStr && !suppliedStr) return '';
  if (!orderedStr?.trim() && !suppliedStr?.trim()) return '';
  if (!orderedStr?.trim()) return '';
  if (!suppliedStr?.trim()) return orderedStr?.trim() || '';

  const parseNum = (s: string) => {
    const cleaned = s.replace(/,/g, '').trim();
    const match = cleaned.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : NaN;
  };
  const extractUnit = (s: string) => {
    const match = s.replace(/[\d.,]/g, '').trim();
    return match || '';
  };

  const ord = parseNum(orderedStr);
  const sup = parseNum(suppliedStr);
  const unit = extractUnit(suppliedStr) || extractUnit(orderedStr) || '';

  if (isNaN(ord) || isNaN(sup)) {
    return '';
  }

  const diff = ord - sup;
  if (diff <= 0) {
    return 'NIL';
  }
  const formatted = diff.toLocaleString();
  return unit ? `${formatted} ${unit}` : formatted;
};

export const SpecializedQcReportCanvas: React.FC<SpecializedQcReportCanvasProps> = ({
  formData,
  setFormData,
  isFullscreenEditor,
  onUploadLogo,
  onSaveAsset,
  onAddItem,
  onRemoveItem,
  onPoOrInvoiceChange,
  isSampleCert,
  DEFAULT_ISO_LOGO_URL,
  onOpenExcelModal,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const [showSignStampDrawer, setShowSignStampDrawer] = useState(false);
  const [selectedCells, setSelectedCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);

  useEffect(() => {
    const handleCompanyUpdate = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('active_company_changed', handleCompanyUpdate);
    window.addEventListener('company_profile_updated', handleCompanyUpdate);
    window.addEventListener('companies_list_updated', handleCompanyUpdate);
    return () => {
      window.removeEventListener('active_company_changed', handleCompanyUpdate);
      window.removeEventListener('company_profile_updated', handleCompanyUpdate);
      window.removeEventListener('companies_list_updated', handleCompanyUpdate);
    };
  }, []);

  const isPtfe = formData.templateType === 'PTFE_REPORT';
  const isNickelCobalt = formData.templateType === 'NICKEL_COBALT_REPORT' || (formData.templateType as string) === 'NICKEL_COBALT';
  const isNeopreneSleeve = formData.templateType === 'NEOPRENE_SLEEVE_REPORT' || (formData.templateType as string) === 'NEOPRENE_SLEEVE' || (formData.templateType as string) === 'NEOPRENE';
  const isTeflon = formData.templateType === 'TEFLON_REPORT' || (formData.templateType as string) === 'TEFLON';
  const isFluropolymer = formData.templateType === 'FLUROPOLYMER_REPORT' || (formData.templateType as string) === 'FLUROPOLYMER' || (formData.templateType as string) === 'FLURO_POLYMER' || (formData.templateType as string) === 'FLUOROPOLYMER';
  const isCoo = formData.templateType === 'COO_CERTIFICATE' || formData.templateType === 'COO' || (formData.templateType as string) === 'COUNTRY_OF_ORIGIN' || (formData.templateType as string) === 'CERTIFICATE_OF_ORIGIN';
  const isCoc = formData.templateType === 'COC_REPORT' || formData.templateType === 'COC' || (formData.templateType as string) === 'CERTIFICATE_OF_CONFORMITY' || (formData.templateType as string) === 'CONFORMITY_CERTIFICATE';
  const isCompliance = formData.templateType === 'COMPLIANCE_REPORT' || formData.templateType === 'COMPLIANCE' || (formData.templateType as string) === 'COMPLIANCE_LETTER' || (formData.templateType as string) === 'LETTER_OF_COMPLIANCE';
  const isWarranty = formData.templateType === 'WARRANTY_CERTIFICATE' || (formData.templateType as string) === 'WARRANTY' || (formData.templateType as string) === 'WARRANTY_REPORT';
  const isInspection = formData.templateType === 'INSPECTION_REPORT' || formData.templateType === 'INSPECTION' || (formData.templateType as string) === 'FINAL_INSPECTION' || (formData.templateType as string) === 'QC_INSPECTION';
  const isItp = formData.templateType === 'INSPECTION_TEST_PLAN' || (formData.templateType as string) === 'ITP_REPORT' || (formData.templateType as string) === 'ITP' || (formData.templateType as string) === 'INSPECTION_PLAN';
  const xylanData = getXylanReportData(formData);
  const nickelData = getNickelCobaltReportData(formData);
  const neopreneData = getNeopreneSleeveReportData(formData);
  const teflonData = getTeflonReportData(formData);
  const fluropolymerData = getFluropolymerReportData(formData);
  const cooData = getCooReportData(formData);
  const cocData = getCocReportData(formData);
  const complianceData = getComplianceReportData(formData);
  const warrantyData = getWarrantyReportData(formData);
  const inspectionData = getInspectionReportData(formData);
  const itpData = getItpReportData(formData);

  // Initialize sheets array if empty for multi-sheet templates (such as Inspection Report)
  useEffect(() => {
    if (isInspection) {
      if (!formData.sheets || formData.sheets.length === 0) {
        setFormData(prev => ({
          ...prev,
          sheets: [
            {
              id: 'sheet-1',
              sheetNo: 1,
              title: 'SHEET 1',
              items: prev.items || [],
              inspectionData: prev.inspectionData
            }
          ]
        }));
      }
    }
  }, [isInspection]);

  const handleAddSheet = () => {
    const currentSheets = (formData.sheets && formData.sheets.length > 0)
      ? [...formData.sheets]
      : [{
          id: 'sheet-1',
          sheetNo: 1,
          title: 'SHEET 1',
          items: formData.items || [],
          inspectionData: formData.inspectionData
        }];

    // Save active sheet state first
    currentSheets[activeSheetIndex] = {
      ...currentSheets[activeSheetIndex],
      items: formData.items || [],
      inspectionData: formData.inspectionData
    };

    const newSheetNo = currentSheets.length + 1;
    const newBlankItems: QcRecordItem[] = [
      {
        id: `insp-item-${Date.now()}-1`,
        itemNo: '1',
        description: '',
        size: '',
        standard: '',
        orderedQty: '',
        qty: '',
        observedCoating: '',
        finish: 'HDG',
        marking: '',
        markingImage: '',
        remark: 'ACCEPTED'
      },
      {
        id: `insp-item-${Date.now()}-2`,
        itemNo: '2',
        description: '',
        size: '',
        standard: '',
        orderedQty: '',
        qty: '',
        observedCoating: '',
        finish: 'HDG',
        marking: '',
        markingImage: '',
        remark: 'ACCEPTED'
      },
      {
        id: `insp-item-${Date.now()}-3`,
        itemNo: '3',
        description: '',
        size: '',
        standard: '',
        orderedQty: '',
        qty: '',
        observedCoating: '',
        finish: 'HDG',
        marking: '',
        markingImage: '',
        remark: 'ACCEPTED'
      },
      {
        id: `insp-item-${Date.now()}-4`,
        itemNo: '4',
        description: '',
        size: '',
        standard: '',
        orderedQty: '',
        qty: '',
        observedCoating: '',
        finish: 'HDG',
        marking: '',
        markingImage: '',
        remark: 'ACCEPTED'
      }
    ];

    const newSheetInspectionData: InspectionReportData = {
      ...formData.inspectionData,
      drawingImageUrl: '',
      markingImageUrl: '',
      additionalPhotos: []
    };

    const prevCert = currentSheets[currentSheets.length - 1]?.certNo || formData.reportNo || formData.certNo || '';
    const newCertNo = incrementCertNo(prevCert, 1);

    const newSheet: MtcSheetData = {
      id: `sheet-${Date.now()}`,
      sheetNo: newSheetNo,
      title: `SHEET ${newSheetNo}`,
      certNo: newCertNo,
      items: newBlankItems,
      inspectionData: newSheetInspectionData as any
    };

    const updatedSheets = [...currentSheets, newSheet];
    setFormData(prev => ({
      ...prev,
      sheets: updatedSheets,
      items: newBlankItems,
      inspectionData: newSheetInspectionData as any
    }));
    setActiveSheetIndex(updatedSheets.length - 1);
  };

  const handleSwitchSheet = (targetIdx: number) => {
    if (targetIdx === activeSheetIndex) return;
    const currentSheets = (formData.sheets && formData.sheets.length > 0)
      ? [...formData.sheets]
      : [{
          id: 'sheet-1',
          sheetNo: 1,
          title: 'SHEET 1',
          items: formData.items || [],
          inspectionData: formData.inspectionData
        }];

    currentSheets[activeSheetIndex] = {
      ...currentSheets[activeSheetIndex],
      items: formData.items || [],
      inspectionData: formData.inspectionData
    };

    const targetSheet = currentSheets[targetIdx];
    if (!targetSheet) return;

    setFormData(prev => ({
      ...prev,
      sheets: currentSheets,
      items: targetSheet.items || [],
      inspectionData: (targetSheet.inspectionData || prev.inspectionData) as any
    }));
    setActiveSheetIndex(targetIdx);
  };

  const handleRemoveSheet = (removeIdx: number) => {
    const currentSheets = formData.sheets || [];
    if (currentSheets.length <= 1) return;

    const nextSheets = currentSheets.filter((_, idx) => idx !== removeIdx).map((s, idx) => ({
      ...s,
      sheetNo: idx + 1,
      title: s.title?.startsWith('SHEET') ? `SHEET ${idx + 1}` : s.title
    }));
    const nextActiveIdx = Math.min(activeSheetIndex, nextSheets.length - 1);
    const nextSheet = nextSheets[nextActiveIdx];

    setFormData(prev => ({
      ...prev,
      sheets: nextSheets,
      items: nextSheet?.items || [],
      inspectionData: (nextSheet?.inspectionData || prev.inspectionData) as any
    }));
    setActiveSheetIndex(nextActiveIdx);
  };

  // Column definitions for Excel navigation based on active template
  const specCols = useMemo(() => {
    if (isNickelCobalt) {
      return ['finish', 'description', 'size', 'qty', 'observedCoating', 'remark'];
    }
    if (isNeopreneSleeve) {
      return ['description', 'size', 'qty', 'material', 'observedCoating'];
    }
    if (isTeflon) {
      return ['description', 'size', 'qty', 'finish'];
    }
    if (isFluropolymer) {
      return ['finish', 'description', 'size', 'qty', 'heatNo', 'remark'];
    }
    if (isCoo) {
      return ['description', 'size', 'qty', 'heatNo', 'finish', 'remark'];
    }
    if (isCoc) {
      return ['description', 'size', 'finish', 'qty', 'heatNo'];
    }
    if (isCompliance) {
      return ['description', 'size', 'standard', 'finish', 'qty'];
    }
    if (isWarranty) {
      return ['description', 'size', 'finish', 'qty', 'heatNo'];
    }
    if (isInspection) {
      return ['description', 'finish', 'size', 'standard', 'orderedQty', 'qty', 'observedCoating', 'marking'];
    }
    return [
      'finish',
      'description',
      'size',
      'qty',
      'coatingMicronsMin',
      'observedCoating',
      'avgMicrons',
      'massOfZincGmM2'
    ];
  }, [isNickelCobalt, isNeopreneSleeve, isTeflon, isFluropolymer, isCoo, isCoc, isCompliance, isWarranty, isInspection]);

  const reportInfo = getSpecializedReportDetails(formData.templateType);
  const isSample = isSampleCert(formData);

  // Insert a clean blank row without unwanted text
  const handleInsertRow = (targetIndex: number, position: 'above' | 'below' = 'below') => {
    const updated = [...formData.items];
    const insertIdx = position === 'above' ? targetIndex : targetIndex + 1;
    
    const newBlankItem: QcRecordItem = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      itemNo: (insertIdx + 1).toString(),
      finish: '',
      description: '',
      size: '',
      qty: '',
      coatingMicronsMin: '',
      observedCoating: '',
      avgMicrons: '',
      massOfZincGmM2: '',
      standard: '',
      material: '',
      heatNo: '',
      marking: '',
      remark: ''
    };

    updated.splice(insertIdx, 0, newBlankItem);

    // Re-index item numbers
    const reindexed = updated.map((it, idx) => ({
      ...it,
      itemNo: (idx + 1).toString()
    }));

    setFormData(prev => {
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, items: reindexed } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        items: reindexed
      };
    });
    focusCell(insertIdx, 'description');
  };

  const handleDuplicateRow = (idx: number) => {
    const updated = [...formData.items];
    const sourceItem = updated[idx];
    if (!sourceItem) return;

    const clonedItem: QcRecordItem = {
      ...sourceItem,
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      itemNo: (idx + 2).toString()
    };

    updated.splice(idx + 1, 0, clonedItem);

    const reindexed = updated.map((it, i) => ({
      ...it,
      itemNo: (i + 1).toString()
    }));

    setFormData(prev => {
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, items: reindexed } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        items: reindexed
      };
    });
  };

  const handleDeleteRow = (idx: number) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, i) => i !== idx);
    const reindexed = updated.map((it, i) => ({
      ...it,
      itemNo: (i + 1).toString()
    }));
    setFormData(prev => {
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, items: reindexed } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        items: reindexed
      };
    });
  };

  // Focus cell helper for Excel navigation
  const focusCell = (rowIndex: number, colKey: string) => {
    setTimeout(() => {
      const el = document.getElementById(`spec-cell-${rowIndex}-${colKey}`) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        if (typeof el.select === 'function') {
          el.select();
        }
      }
    }, 20);
  };

  const isCellSelected = (rIdx: number, cIdx: number) => {
    if (!selectedCells) return false;
    const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
    const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
    const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
    const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  // Change handlers for row cells
  const handleCellChange = (idx: number, colKey: string, val: string) => {
    const updated = [...formData.items];
    const item = { ...updated[idx] };

    if (colKey === 'finish') {
      item.finish = val;
      if (isTeflon) item.marking = val;
    } else if (colKey === 'description') {
      item.description = val;
    } else if (colKey === 'size') {
      item.size = val;
    } else if (colKey === 'qty') {
      item.qty = val;
      if (isInspection) {
        item.observedCoating = calcShortageQty(item.orderedQty || '', val);
      }
    } else if (colKey === 'material') {
      item.material = val;
      item.finish = val;
    } else if (colKey === 'coatingMicronsMin') {
      item.coatingMicronsMin = val;
      item.marking = val;
    } else if (colKey === 'marking') {
      item.marking = val;
      item.coatingMicronsMin = val;
    } else if (colKey === 'observedCoating') {
      item.observedCoating = val;
      item.heatNo = val;
      if (!isNickelCobalt && !isNeopreneSleeve && !isTeflon && !isInspection) {
        // Auto-calculate average from observed readings
        const calculatedAvg = calculateAverageFromObserved(val);
        if (calculatedAvg) {
          item.avgMicrons = calculatedAvg;
          if (formData.templateType === 'HDG_REPORT' || !formData.templateType) {
            const mass = calcZincMass(calculatedAvg);
            item.massOfZincGmM2 = mass;
            item.remark = mass;
          }
        } else if (!val.trim()) {
          item.avgMicrons = '';
          item.massOfZincGmM2 = '';
          item.remark = '';
        }
      }
    } else if (colKey === 'avgMicrons') {
      item.avgMicrons = val;
      if (formData.templateType === 'HDG_REPORT' || !formData.templateType) {
        if (val.trim()) {
          const mass = calcZincMass(val);
          item.massOfZincGmM2 = mass;
          item.remark = mass;
        } else {
          item.massOfZincGmM2 = '';
          item.remark = '';
        }
      }
    } else if (colKey === 'standard') {
      item.standard = val;
    } else if (colKey === 'massOfZincGmM2') {
      item.massOfZincGmM2 = val;
      item.remark = val;
    } else if (colKey === 'remark' || colKey === 'manufacturer') {
      item.remark = val;
      (item as any).manufacturer = val;
    } else if (colKey === 'heatNo') {
      item.heatNo = val;
    } else if (colKey === 'orderedQty') {
      item.orderedQty = val;
      if (isInspection) {
        item.observedCoating = calcShortageQty(val, item.qty ? String(item.qty) : '');
      }
    }

    updated[idx] = item;
    setFormData(prev => {
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, items: updated } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        items: updated
      };
    });
  };

  // Keyboard navigation for Excel-style table
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number,
    colKey: string
  ) => {
    const colIndex = specCols.indexOf(colKey);
    const inputEl = e.currentTarget;

    // Escape clears selection
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedCells(null);
      return;
    }

    // Ctrl+D / Cmd+D -> Fill Down from row above
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedItems = [...formData.items];

      if (selectedCells) {
        const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
        const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
        const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
        const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);

        if (minR === maxR && minR > 0) {
          for (let c = minC; c <= maxC; c++) {
            const cKey = specCols[c];
            if (cKey) {
              const srcVal = (updatedItems[minR - 1] as any)?.[cKey] || '';
              (updatedItems[minR] as any)[cKey] = srcVal;
              if (cKey === 'finish' && isTeflon) updatedItems[minR].marking = srcVal;
              if (cKey === 'material') { updatedItems[minR].material = srcVal; updatedItems[minR].finish = srcVal; }
              if (cKey === 'coatingMicronsMin') updatedItems[minR].marking = srcVal;
              if (cKey === 'observedCoating') updatedItems[minR].heatNo = srcVal;
              if (cKey === 'massOfZincGmM2') updatedItems[minR].remark = srcVal;
              if (cKey === 'remark' || cKey === 'manufacturer') {
                updatedItems[minR].remark = srcVal;
                (updatedItems[minR] as any).manufacturer = srcVal;
              }
              if (cKey === 'heatNo') updatedItems[minR].heatNo = srcVal;
            }
          }
        } else if (maxR > minR) {
          for (let r = minR + 1; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              const cKey = specCols[c];
              if (cKey) {
                const srcVal = (updatedItems[minR] as any)?.[cKey] || '';
                (updatedItems[r] as any)[cKey] = srcVal;
                if (cKey === 'finish' && isTeflon) updatedItems[r].marking = srcVal;
                if (cKey === 'material') { updatedItems[r].material = srcVal; updatedItems[r].finish = srcVal; }
                if (cKey === 'coatingMicronsMin') updatedItems[r].marking = srcVal;
                if (cKey === 'observedCoating') updatedItems[r].heatNo = srcVal;
                if (cKey === 'massOfZincGmM2') updatedItems[r].remark = srcVal;
                if (cKey === 'remark' || cKey === 'manufacturer') {
                  updatedItems[r].remark = srcVal;
                  (updatedItems[r] as any).manufacturer = srcVal;
                }
                if (cKey === 'heatNo') updatedItems[r].heatNo = srcVal;
              }
            }
          }
        }
      } else if (rowIndex > 0) {
        const srcVal = (updatedItems[rowIndex - 1] as any)?.[colKey] || '';
        (updatedItems[rowIndex] as any)[colKey] = srcVal;
        if (colKey === 'finish' && isTeflon) updatedItems[rowIndex].marking = srcVal;
        if (colKey === 'material') { updatedItems[rowIndex].material = srcVal; updatedItems[rowIndex].finish = srcVal; }
        if (colKey === 'coatingMicronsMin') updatedItems[rowIndex].marking = srcVal;
        if (colKey === 'observedCoating') updatedItems[rowIndex].heatNo = srcVal;
        if (colKey === 'massOfZincGmM2') updatedItems[rowIndex].remark = srcVal;
        if (colKey === 'remark' || colKey === 'manufacturer') {
          updatedItems[rowIndex].remark = srcVal;
          (updatedItems[rowIndex] as any).manufacturer = srcVal;
        }
        if (colKey === 'heatNo') updatedItems[rowIndex].heatNo = srcVal;
      }

      setFormData({ ...formData, items: updatedItems });
      return;
    }

    // Delete / Backspace clears selected range
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCells) {
      const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
      const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
      const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
      const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);

      if (minR !== maxR || minC !== maxC) {
        e.preventDefault();
        const updatedItems = [...formData.items];
        for (let r = minR; r <= maxR; r++) {
          if (!updatedItems[r]) continue;
          for (let c = minC; c <= maxC; c++) {
            const cKey = specCols[c];
            if (cKey) {
              (updatedItems[r] as any)[cKey] = '';
              if (cKey === 'coatingMicronsMin') updatedItems[r].marking = '';
              if (cKey === 'observedCoating') updatedItems[r].heatNo = '';
              if (cKey === 'massOfZincGmM2') updatedItems[r].remark = '';
              if (cKey === 'finish' && isTeflon) updatedItems[r].marking = '';
              if (cKey === 'material') { updatedItems[r].material = ''; updatedItems[r].finish = ''; }
              if (cKey === 'remark') updatedItems[r].remark = '';
            }
          }
        }
        setFormData({ ...formData, items: updatedItems });
        return;
      }
    }

    // Ctrl+C / Cmd+C -> Copy TSV of selected cells
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      const hasMultiCell = selectedCells && (
        selectedCells.startRow !== selectedCells.endRow ||
        selectedCells.startCol !== selectedCells.endCol
      );

      if (!hasMultiCell && inputEl.selectionStart !== inputEl.selectionEnd) {
        return;
      }

      e.preventDefault();
      let copyVal = '';
      if (selectedCells) {
        const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
        const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
        const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
        const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);
        const rowsData: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const it = formData.items[r] || {};
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const cKey = specCols[c];
            rowVals.push((it as any)?.[cKey] || '');
          }
          rowsData.push(rowVals.join('\t'));
        }
        copyVal = rowsData.join('\n');
      } else {
        const it = formData.items[rowIndex] || {};
        copyVal = (it as any)?.[colKey] || '';
      }

      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
      }
      return;
    }

    // Shift + Arrow Keys -> Multi-cell range selection
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedCells?.endRow ?? rowIndex;
      let endC = selectedCells?.endCol ?? colIndex;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(formData.items.length - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(specCols.length - 1, endC + 1);

      setSelectedCells({
        startRow: selectedCells?.startRow ?? rowIndex,
        startCol: selectedCells?.startCol ?? colIndex,
        endRow: endR,
        endCol: endC
      });

      focusCell(endR, specCols[endC]);
      return;
    }

    // Enter or Tab navigation
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();

      if (e.shiftKey) {
        if (colIndex > 0) {
          focusCell(rowIndex, specCols[colIndex - 1]);
        } else if (rowIndex > 0) {
          focusCell(rowIndex - 1, specCols[specCols.length - 1]);
        }
      } else {
        if (colIndex < specCols.length - 1) {
          focusCell(rowIndex, specCols[colIndex + 1]);
        } else {
          if (rowIndex < formData.items.length - 1) {
            focusCell(rowIndex + 1, specCols[0]);
          } else {
            handleInsertRow(formData.items.length - 1, 'below');
          }
        }
      }
      return;
    }

    // Directional Arrow Keys Navigation
    if (!e.shiftKey) {
      if (e.key === 'ArrowUp') {
        if (rowIndex > 0) {
          e.preventDefault();
          setSelectedCells(null);
          focusCell(rowIndex - 1, colKey);
        }
      } else if (e.key === 'ArrowDown') {
        if (rowIndex < formData.items.length - 1) {
          e.preventDefault();
          setSelectedCells(null);
          focusCell(rowIndex + 1, colKey);
        }
      } else if (e.key === 'ArrowLeft') {
        if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
          e.preventDefault();
          setSelectedCells(null);
          if (colIndex > 0) {
            focusCell(rowIndex, specCols[colIndex - 1]);
          } else if (rowIndex > 0) {
            focusCell(rowIndex - 1, specCols[specCols.length - 1]);
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (inputEl.selectionStart === inputEl.value.length) {
          e.preventDefault();
          setSelectedCells(null);
          if (colIndex < specCols.length - 1) {
            focusCell(rowIndex, specCols[colIndex + 1]);
          } else if (rowIndex < formData.items.length - 1) {
            focusCell(rowIndex + 1, specCols[0]);
          }
        }
      }
    }
  };

  // Excel Multi-Cell Paste Handler
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const hasDelimiters = text.includes('\t') || text.includes('\n');
    if (!hasDelimiters && !selectedCells) {
      return;
    }

    e.preventDefault();
    const startColIndex = specCols.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));
    const updatedItems = [...formData.items];

    const applyCellData = (rIdx: number, cIdx: number, val: string) => {
      const cKey = specCols[cIdx];
      if (!cKey) return;
      (updatedItems[rIdx] as any)[cKey] = val.trim();
      
      if (cKey === 'finish' && isTeflon) {
        updatedItems[rIdx].marking = val.trim();
      } else if (cKey === 'material') {
        updatedItems[rIdx].material = val.trim();
        updatedItems[rIdx].finish = val.trim();
      } else if (cKey === 'remark' || cKey === 'manufacturer') {
        updatedItems[rIdx].remark = val.trim();
        (updatedItems[rIdx] as any).manufacturer = val.trim();
      } else if (cKey === 'heatNo') {
        updatedItems[rIdx].heatNo = val.trim();
      } else if (cKey === 'coatingMicronsMin') {
        updatedItems[rIdx].marking = val.trim();
      } else if (cKey === 'observedCoating') {
        updatedItems[rIdx].heatNo = val.trim();
        if (!isNickelCobalt && !isNeopreneSleeve && !isTeflon) {
          const autoAvg = calculateAverageFromObserved(val.trim());
          if (autoAvg) {
            updatedItems[rIdx].avgMicrons = autoAvg;
            if (formData.templateType === 'HDG_REPORT' || !formData.templateType) {
              const autoMass = calcZincMass(autoAvg);
              updatedItems[rIdx].massOfZincGmM2 = autoMass;
              updatedItems[rIdx].remark = autoMass;
            }
          }
        }
      } else if (cKey === 'avgMicrons') {
        if (formData.templateType === 'HDG_REPORT' || !formData.templateType) {
          const autoMass = calcZincMass(val.trim());
          updatedItems[rIdx].massOfZincGmM2 = autoMass;
          updatedItems[rIdx].remark = autoMass;
        }
      } else if (cKey === 'standard') {
        updatedItems[rIdx].standard = val.trim();
      } else if (cKey === 'orderedQty') {
        updatedItems[rIdx].orderedQty = val.trim();
      } else if (cKey === 'massOfZincGmM2') {
        updatedItems[rIdx].remark = val.trim();
      }
    };

    if (selectedCells) {
      const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
      const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
      const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
      const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);

      if (!hasDelimiters) {
        const val = text.trim();
        for (let r = minR; r <= maxR; r++) {
          if (!updatedItems[r]) {
            updatedItems[r] = {
              id: (Date.now() + r).toString(),
              itemNo: (r + 1).toString(),
              finish: isNickelCobalt ? 'Ni-Co' : (isTeflon ? 'BLACK' : (isNeopreneSleeve ? 'EPDM' : (formData.templateType === 'HDG_REPORT' ? 'HDG' : ''))),
              description: '',
              size: '',
              qty: '',
              coatingMicronsMin: '',
              observedCoating: '',
              avgMicrons: '',
              massOfZincGmM2: '',
              standard: '',
              material: isNeopreneSleeve ? 'EPDM' : '',
              heatNo: '',
              marking: isTeflon ? 'BLACK' : '',
              remark: isNickelCobalt ? 'SATISFACTORY' : ''
            };
          }
          for (let c = minC; c <= maxC; c++) {
            applyCellData(r, c, val);
          }
        }
      } else {
        rows.forEach((rowStr, rOffset) => {
          const targetR = minR + rOffset;
          while (updatedItems.length <= targetR) {
            const rIdx = updatedItems.length;
            updatedItems.push({
              id: (Date.now() + rIdx).toString(),
              itemNo: (rIdx + 1).toString(),
              finish: isNickelCobalt ? 'Ni-Co' : (isTeflon ? 'BLACK' : (isNeopreneSleeve ? 'EPDM' : (formData.templateType === 'HDG_REPORT' ? 'HDG' : ''))),
              description: '',
              size: '',
              qty: '',
              coatingMicronsMin: '',
              observedCoating: '',
              avgMicrons: '',
              massOfZincGmM2: '',
              standard: '',
              material: isNeopreneSleeve ? 'EPDM' : '',
              heatNo: '',
              marking: isTeflon ? 'BLACK' : '',
              remark: isNickelCobalt ? 'SATISFACTORY' : ''
            });
          }
          const cellVals = rowStr.split('\t');
          cellVals.forEach((val, cOffset) => {
            const targetC = minC + cOffset;
            if (targetC < specCols.length) {
              applyCellData(targetR, targetC, val);
            }
          });
        });
      }
    } else {
      rows.forEach((rowStr, rOffset) => {
        const targetR = startRow + rOffset;
        while (updatedItems.length <= targetR) {
          const rIdx = updatedItems.length;
          updatedItems.push({
            id: (Date.now() + rIdx).toString(),
            itemNo: (rIdx + 1).toString(),
            finish: isNickelCobalt ? 'Ni-Co' : (isTeflon ? 'BLACK' : (isNeopreneSleeve ? 'EPDM' : (formData.templateType === 'HDG_REPORT' ? 'HDG' : ''))),
            description: '',
            size: '',
            qty: '',
            coatingMicronsMin: '',
            observedCoating: '',
            avgMicrons: '',
            massOfZincGmM2: '',
            standard: '',
            material: isNeopreneSleeve ? 'EPDM' : '',
            heatNo: '',
            marking: isTeflon ? 'BLACK' : '',
            remark: isNickelCobalt ? 'SATISFACTORY' : ''
          });
        }
        const cellVals = rowStr.split('\t');
        colsLoop: for (let cOffset = 0; cOffset < cellVals.length; cOffset++) {
          const val = cellVals[cOffset];
          const targetC = startColIndex + cOffset;
          if (targetC < specCols.length) {
            applyCellData(targetR, targetC, val);
          }
        }
      });
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const updateTeflonField = (field: keyof TeflonData, value: any) => {
    setFormData(prev => {
      const current = getTeflonReportData(prev);
      return {
        ...prev,
        teflonData: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const updateTeflonPropertyRow = (
    category: 'mechanicalValues' | 'thermalValues' | 'electricalValues' | 'miscellaneousValues',
    rowIdx: number,
    field: keyof TeflonPropertyRow,
    value: string
  ) => {
    setFormData(prev => {
      const current = getTeflonReportData(prev);
      const rows = [...current[category]];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };
      }
      return {
        ...prev,
        teflonData: {
          ...current,
          [category]: rows
        }
      };
    });
  };

  const updateTeflonFootnote = (idx: number, value: string) => {
    setFormData(prev => {
      const current = getTeflonReportData(prev);
      const notes = [...current.footnotes];
      notes[idx] = value;
      return {
        ...prev,
        teflonData: {
          ...current,
          footnotes: notes
        }
      };
    });
  };

  const updateTeflonConversion = (idx: number, value: string) => {
    setFormData(prev => {
      const current = getTeflonReportData(prev);
      const convs = [...current.conversions];
      convs[idx] = value;
      return {
        ...prev,
        teflonData: {
          ...current,
          conversions: convs
        }
      };
    });
  };

  const updateItpField = (field: keyof ItpData, value: any) => {
    setFormData(prev => {
      const current = getItpReportData(prev);
      return {
        ...prev,
        itpData: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const updateItpActivityRow = (
    rowIdx: number,
    field: keyof ItpActivityRow,
    value: string
  ) => {
    setFormData(prev => {
      const current = getItpReportData(prev);
      const rows = [...current.activityRows];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };
      }
      return {
        ...prev,
        itpData: {
          ...current,
          activityRows: rows
        }
      };
    });
  };

  const addItpActivityRow = (afterIndex?: number) => {
    setFormData(prev => {
      const current = getItpReportData(prev);
      const rows = [...current.activityRows];
      const newRow: ItpActivityRow = {
        id: 'itp-act-' + Date.now(),
        itemNo: `${rows.length + 1}.0`,
        processStage: 'Visual / Dimensional / Quality Testing Activity',
        referenceDoc: 'ASTM / Project Standard Specification',
        acceptanceCriteria: 'Conforms to required tolerances and material specifications',
        verifyingDoc: 'Inspection Test Report / Record',
        mfgIntervention: 'H',
        tpiIntervention: 'W',
        clientIntervention: 'R',
        remarks: 'Mandatory verification before subsequent operation'
      };

      if (typeof afterIndex === 'number' && afterIndex >= 0 && afterIndex < rows.length) {
        rows.splice(afterIndex + 1, 0, newRow);
      } else {
        rows.push(newRow);
      }

      const reindexed = rows.map((r, i) => ({
        ...r,
        itemNo: `${i + 1}.0`
      }));

      return {
        ...prev,
        itpData: {
          ...current,
          activityRows: reindexed
        }
      };
    });
  };

  const deleteItpActivityRow = (rowIdx: number) => {
    setFormData(prev => {
      const current = getItpReportData(prev);
      if (current.activityRows.length <= 1) return prev;
      const rows = current.activityRows.filter((_, i) => i !== rowIdx);
      const reindexed = rows.map((r, i) => ({
        ...r,
        itemNo: `${i + 1}.0`
      }));
      return {
        ...prev,
        itpData: {
          ...current,
          activityRows: reindexed
        }
      };
    });
  };

  const duplicateItpActivityRow = (rowIdx: number) => {
    setFormData(prev => {
      const current = getItpReportData(prev);
      const rows = [...current.activityRows];
      const src = rows[rowIdx];
      if (!src) return prev;
      const copy: ItpActivityRow = {
        ...src,
        id: 'itp-act-' + Date.now(),
        itemNo: `${rowIdx + 2}.0`
      };
      rows.splice(rowIdx + 1, 0, copy);
      const reindexed = rows.map((r, i) => ({
        ...r,
        itemNo: `${i + 1}.0`
      }));
      return {
        ...prev,
        itpData: {
          ...current,
          activityRows: reindexed
        }
      };
    });
  };

  const resetItpToDefault = () => {
    setFormData(prev => ({
      ...prev,
      itpData: {
        ...getItpReportData(prev),
        activityRows: DEFAULT_ITP_ACTIVITIES
      }
    }));
  };

  const updateNeopreneField = (field: keyof NeopreneSleeveData, value: any) => {
    setFormData(prev => {
      const current = getNeopreneSleeveReportData(prev);
      return {
        ...prev,
        neopreneData: {
          ...current,
          [field]: value
        },
        ...(field === 'basePolymer' ? { neopreneBasePolymer: value } : {}),
        ...(field === 'colour' ? { neopreneColour: value } : {}),
        ...(field === 'note' ? { neopreneNote: value } : {}),
        ...(field === 'physicalProperties' ? { neoprenePhysicalProperties: value } : {}),
        ...(field === 'generalProperties' ? { neopreneGeneralProperties: value } : {})
      };
    });
  };

  const updateNeoprenePhysicalRow = (rowIdx: number, field: keyof NeoprenePhysicalPropertyRow, value: any) => {
    setFormData(prev => {
      const current = getNeopreneSleeveReportData(prev);
      const rows = [...current.physicalProperties];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };
      }
      return {
        ...prev,
        neopreneData: {
          ...current,
          physicalProperties: rows
        },
        neoprenePhysicalProperties: rows
      };
    });
  };

  const updateNeopreneSubRow = (rowIdx: number, subIdx: number, field: keyof NeoprenePhysicalSubRow, value: any) => {
    setFormData(prev => {
      const current = getNeopreneSleeveReportData(prev);
      const rows = [...current.physicalProperties];
      if (rows[rowIdx] && rows[rowIdx].subRows && rows[rowIdx].subRows![subIdx]) {
        const subRows = [...rows[rowIdx].subRows!];
        subRows[subIdx] = { ...subRows[subIdx], [field]: value };
        rows[rowIdx] = { ...rows[rowIdx], subRows };
      }
      return {
        ...prev,
        neopreneData: {
          ...current,
          physicalProperties: rows
        },
        neoprenePhysicalProperties: rows
      };
    });
  };

  const updateNeopreneGeneralRow = (rowIdx: number, field: keyof NeopreneGeneralPropertyRow, value: any) => {
    setFormData(prev => {
      const current = getNeopreneSleeveReportData(prev);
      const rows = [...current.generalProperties];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };
      }
      return {
        ...prev,
        neopreneData: {
          ...current,
          generalProperties: rows
        },
        neopreneGeneralProperties: rows
      };
    });
  };

  const updateXylanField = (field: keyof XylanData, value: any) => {
    setFormData(prev => {
      const current = getXylanReportData(prev);
      return {
        ...prev,
        xylanData: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const updateNickelField = (field: keyof NickelCobaltData, value: any) => {
    setFormData(prev => {
      const current = getNickelCobaltReportData(prev);
      return {
        ...prev,
        nickelCobaltData: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const updateCorrosionRow = (index: number, field: 'part' | 'rate', value: string) => {
    setFormData(prev => {
      const current = getNickelCobaltReportData(prev);
      const rows = [...current.corrosionRows];
      rows[index] = { ...rows[index], [field]: value };
      return {
        ...prev,
        nickelCobaltData: {
          ...current,
          corrosionRows: rows
        }
      };
    });
  };

  const addCorrosionRow = () => {
    setFormData(prev => {
      const current = getNickelCobaltReportData(prev);
      return {
        ...prev,
        nickelCobaltData: {
          ...current,
          corrosionRows: [...current.corrosionRows, { part: '***NUT', rate: '0.850000000' }]
        }
      };
    });
  };

  const removeCorrosionRow = (index: number) => {
    setFormData(prev => {
      const current = getNickelCobaltReportData(prev);
      if (current.corrosionRows.length <= 1) return prev;
      return {
        ...prev,
        nickelCobaltData: {
          ...current,
          corrosionRows: current.corrosionRows.filter((_, i) => i !== index)
        }
      };
    });
  };

  const updateXylanObservationRow = (index: number, col: keyof XylanObservationRow, value: string) => {
    setFormData(prev => {
      const current = getXylanReportData(prev);
      const updatedRows = [...current.observationRows];
      if (updatedRows[index]) {
        updatedRows[index] = { ...updatedRows[index], [col]: value };
      }
      return {
        ...prev,
        xylanData: {
          ...current,
          observationRows: updatedRows
        }
      };
    });
  };

  const addXylanObservationRow = () => {
    setFormData(prev => {
      const current = getXylanReportData(prev);
      return {
        ...prev,
        xylanData: {
          ...current,
          observationRows: [
            ...current.observationRows,
            { test: 'New Test', method: 'ASTM Standard', specified: 'Specified Criteria', observed: 'Observed Result' }
          ]
        }
      };
    });
  };

  const removeXylanObservationRow = (index: number) => {
    setFormData(prev => {
      const current = getXylanReportData(prev);
      if (current.observationRows.length <= 1) return prev;
      const updatedRows = current.observationRows.filter((_, i) => i !== index);
      return {
        ...prev,
        xylanData: {
          ...current,
          observationRows: updatedRows
        }
      };
    });
  };

  const updateFluropolymerField = (field: keyof FluropolymerData, value: any) => {
    setFormData(prev => {
      const current = getFluropolymerReportData(prev);
      return {
        ...prev,
        fluropolymerData: {
          ...current,
          [field]: value
        },
        ...(field === 'certificationText' ? { certificationText: value } : {}),
        ...(field === 'remarks' ? { remarks: value } : {})
      };
    });
  };

  const updateFluropolymerRow = (rowIdx: number, field: keyof FluropolymerTableRow, value: any) => {
    setFormData(prev => {
      const current = getFluropolymerReportData(prev);
      const rows = [...current.rows];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };
      }
      return {
        ...prev,
        fluropolymerData: {
          ...current,
          rows
        }
      };
    });
  };

  const addFluropolymerRow = (afterIdx?: number) => {
    setFormData(prev => {
      const current = getFluropolymerReportData(prev);
      const rows = [...current.rows];
      const newRow: FluropolymerTableRow = {
        id: `fluro-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        parameter: '',
        specification: ''
      };
      if (afterIdx !== undefined && afterIdx >= 0 && afterIdx < rows.length) {
        rows.splice(afterIdx + 1, 0, newRow);
      } else {
        rows.push(newRow);
      }
      return {
        ...prev,
        fluropolymerData: {
          ...current,
          rows
        }
      };
    });
  };

  const removeFluropolymerRow = (rowIdx: number) => {
    setFormData(prev => {
      const current = getFluropolymerReportData(prev);
      if (current.rows.length <= 1) return prev;
      const rows = current.rows.filter((_, idx) => idx !== rowIdx);
      return {
        ...prev,
        fluropolymerData: {
          ...current,
          rows
        }
      };
    });
  };

  const moveFluropolymerRow = (rowIdx: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const current = getFluropolymerReportData(prev);
      const rows = [...current.rows];
      const targetIdx = direction === 'up' ? rowIdx - 1 : rowIdx + 1;
      if (targetIdx < 0 || targetIdx >= rows.length) return prev;
      const temp = rows[rowIdx];
      rows[rowIdx] = rows[targetIdx];
      rows[targetIdx] = temp;
      return {
        ...prev,
        fluropolymerData: {
          ...current,
          rows
        }
      };
    });
  };

  const resetFluropolymerRows = () => {
    setFormData(prev => {
      const current = getFluropolymerReportData(prev);
      return {
        ...prev,
        fluropolymerData: {
          ...current,
          rows: [...DEFAULT_FLUROPOLYMER_ROWS]
        }
      };
    });
  };

  const updateCooField = (field: keyof CooData, value: any) => {
    setFormData(prev => {
      const current = getCooReportData(prev);
      return {
        ...prev,
        cooData: {
          ...current,
          [field]: value
        },
        ...(field === 'declarationClause' ? { certificationText: value } : {}),
        ...(field === 'remarks' ? { remarks: value } : {})
      };
    });
  };

  const updateInspectionField = (field: keyof InspectionReportData, value: any) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const updatedInspectionData = {
        ...current,
        [field]: value
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData,
        ...(field === 'certificationText' ? { certificationText: value } : {}),
        ...(field === 'remarks' ? { remarks: value } : {})
      };
    });
  };

  const updateInspectionParameterRow = (rowIdx: number, field: keyof InspectionParameterRow, value: any) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const params = [...current.parameters];
      if (params[rowIdx]) {
        params[rowIdx] = { ...params[rowIdx], [field]: value };
      }
      const updatedInspectionData = {
        ...current,
        parameters: params
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const addInspectionParameterRow = (afterIdx?: number) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const params = [...current.parameters];
      const newRow: InspectionParameterRow = {
        id: `insp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        parameter: 'NEW INSPECTION PARAMETER',
        customerRequirement: 'Customer specification / drawing reference',
        supplyData: 'Actual measured / observed data',
        status: 'ACCEPTED'
      };
      if (afterIdx !== undefined && afterIdx >= 0 && afterIdx < params.length) {
        params.splice(afterIdx + 1, 0, newRow);
      } else {
        params.push(newRow);
      }
      const updatedInspectionData = {
        ...current,
        parameters: params
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const removeInspectionParameterRow = (rowIdx: number) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      if (current.parameters.length <= 1) return prev;
      const params = current.parameters.filter((_, idx) => idx !== rowIdx);
      const updatedInspectionData = {
        ...current,
        parameters: params
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const resetInspectionParameters = () => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const updatedInspectionData = {
        ...current,
        parameters: [...DEFAULT_INSPECTION_PARAMETERS]
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const updateInspectionDimensionalRow = (rowIdx: number, field: keyof InspectionDimensionalRow, value: any) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const rows = [...current.dimensionalRows];
      if (rows[rowIdx]) {
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };
      }
      const updatedInspectionData = {
        ...current,
        dimensionalRows: rows
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const addInspectionDimensionalRow = (afterIdx?: number) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const rows = [...current.dimensionalRows];
      const newRow: InspectionDimensionalRow = {
        id: `dim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        characteristic: 'New Inspection Characteristic',
        requirements: 'Tolerance / Min-Max',
        results: 'Measured Value / Passed',
        sampleSize: '6',
        passQty: '6',
        rejQty: '0',
        specification: 'DIN 934 / ISO',
        testMethod: '[Cal] (18)'
      };
      if (afterIdx !== undefined && afterIdx >= 0 && afterIdx < rows.length) {
        rows.splice(afterIdx + 1, 0, newRow);
      } else {
        rows.push(newRow);
      }
      const updatedInspectionData = {
        ...current,
        dimensionalRows: rows
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const removeInspectionDimensionalRow = (rowIdx: number) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      if (current.dimensionalRows.length <= 1) return prev;
      const rows = current.dimensionalRows.filter((_, idx) => idx !== rowIdx);
      const updatedInspectionData = {
        ...current,
        dimensionalRows: rows
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const addAdditionalPhoto = (defaultTitle?: string) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const photos = current.additionalPhotos || [];
      const newPhoto: InspectionPhoto = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: '',
        imageUrl: '',
        title: defaultTitle || `INSPECTION PHOTO ${photos.length + 1}`,
        caption: ''
      };
      const updatedInspectionData = {
        ...current,
        additionalPhotos: [...photos, newPhoto],
        // If 2 or more photos, recommend moving characteristics to page 2 to keep layout neat
        moveCharacteristicsToPage2: photos.length >= 1 ? true : current.moveCharacteristicsToPage2
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const updateAdditionalPhoto = (idx: number, field: keyof InspectionPhoto, value: string) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const photos = [...(current.additionalPhotos || [])];
      if (photos[idx]) {
        photos[idx] = { ...photos[idx], [field]: value };
      }
      const updatedInspectionData = {
        ...current,
        additionalPhotos: photos
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const removeAdditionalPhoto = (idx: number) => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const photos = (current.additionalPhotos || []).filter((_, i) => i !== idx);
      const updatedInspectionData = {
        ...current,
        additionalPhotos: photos
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const resetInspectionDimensionalRows = () => {
    setFormData(prev => {
      const current = getInspectionReportData(prev);
      const updatedInspectionData = {
        ...current,
        dimensionalRows: [...DEFAULT_INSPECTION_DIMENSIONAL_ROWS]
      };
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, inspectionData: updatedInspectionData } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        inspectionData: updatedInspectionData
      };
    });
  };

  const autoGenerateCertificationNo = () => {
    const currentYear = new Date().getFullYear();
    const rand6 = Math.floor(100000 + Math.random() * 900000);
    const prefix = reportInfo.certPrefix || 'QC';
    const newCertNo = `${prefix}/${currentYear}/${rand6}`;
    setFormData(prev => ({
      ...prev,
      reportNo: newCertNo,
      certNo: newCertNo,
      issueNo: newCertNo
    }));
    return newCertNo;
  };

  // Auto-initialize certification numbering if missing
  useEffect(() => {
    if (!formData.reportNo && !formData.certNo) {
      const currentYear = new Date().getFullYear();
      const rand6 = Math.floor(100000 + Math.random() * 900000);
      const prefix = reportInfo.certPrefix || 'QC';
      const newCertNo = `${prefix}/${currentYear}/${rand6}`;
      setFormData(prev => ({
        ...prev,
        reportNo: prev.reportNo || newCertNo,
        certNo: prev.certNo || newCertNo,
        issueNo: prev.issueNo || newCertNo
      }));
    }
  }, [formData.templateType, reportInfo.certPrefix]);

  const handleAddMultipleRows = (count: number) => {
    let newItems = [...formData.items];
    const isFirstRowBlank = newItems.length === 1 && !newItems[0]?.description && !newItems[0]?.size && !newItems[0]?.qty && !newItems[0]?.observedCoating;
    if (isFirstRowBlank && count === 20) {
      newItems = [];
    }
    const baseFinish = (isCoo || isCoc || isInspection || isCompliance || isWarranty) ? '' : (formData.items[0]?.finish || 'HDG');
    const baseMin = (isCoo || isCoc || isInspection || isCompliance || isWarranty) ? '' : (formData.items[0]?.coatingMicronsMin || '45 MICRONS MIN');
    for (let i = 0; i < count; i++) {
      const rIdx = newItems.length;
      newItems.push({
        id: `${Date.now()}-${rIdx}-${Math.random().toString(36).substr(2, 4)}`,
        itemNo: (rIdx + 1).toString(),
        finish: baseFinish,
        description: '',
        size: '',
        standard: '',
        orderedQty: '',
        qty: '',
        coatingMicronsMin: baseMin,
        observedCoating: '',
        marking: '',
        markingImage: undefined,
        avgMicrons: '',
        massOfZincGmM2: '',
        remark: ''
      });
    }
    setFormData(prev => {
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, items: newItems } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        items: newItems
      };
    });
  };

  const handleClearEmptyRows = () => {
    if (formData.items.length <= 1) return;
    const nonEmpty = formData.items.filter((item, idx) => {
      if (idx === 0) return true; // keep at least first row
      return Boolean(item.description?.trim() || item.size?.trim() || item.qty?.trim() || item.observedCoating?.trim());
    });
    const renumbered = nonEmpty.map((it, i) => ({ ...it, itemNo: (i + 1).toString() }));
    setFormData(prev => {
      let updatedSheets = prev.sheets;
      if (isInspection && prev.sheets && prev.sheets.length > 0) {
        updatedSheets = prev.sheets.map((sheet, sIdx) =>
          sIdx === activeSheetIndex ? { ...sheet, items: renumbered } : sheet
        );
      }
      return {
        ...prev,
        sheets: updatedSheets,
        items: renumbered
      };
    });
  };

  const currentSheetsList: MtcSheetData[] = (formData.sheets && formData.sheets.length > 0)
    ? formData.sheets
    : [
        {
          id: 'sheet-1',
          sheetNo: 1,
          title: 'SHEET 1',
          items: formData.items || [],
          inspectionData: formData.inspectionData
        }
      ];

  return (
    <div id="specialized-report-canvas-wrapper" className="w-full flex flex-col items-center justify-start py-1 print:p-0 print:m-0">
      {/* MULTI-SHEET CONTROLS (INSPECTION REPORT MULTI-PAGE SHEETS) */}
      {isInspection && (
        <div className="w-full max-w-[1020px] mb-2 flex items-center justify-between bg-slate-900 text-white px-3 py-2 rounded-lg shadow-md border border-slate-800 print:hidden">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 pr-2 border-r border-slate-700 shrink-0">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>SHEETS ({currentSheetsList.length}):</span>
            </div>
            {currentSheetsList.map((sh, sIdx) => {
              const isActive = sIdx === activeSheetIndex;
              const itemCount = (sh.items || []).filter(it => Boolean(it.description || it.size || it.qty)).length || (isActive ? formData.items.filter(it => Boolean(it.description || it.size || it.qty)).length : 0);
              return (
                <div key={sh.id || sIdx} className="flex items-center group shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSwitchSheet(sIdx)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 shadow-xs ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-2 ring-emerald-400' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span>{sh.title || `SHEET ${sIdx + 1}`}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      ({itemCount} items)
                    </span>
                  </button>
                  {currentSheetsList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${sh.title || `Sheet ${sIdx + 1}`}?`)) {
                          handleRemoveSheet(sIdx);
                        }
                      }}
                      className="ml-1 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Delete this Sheet"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleAddSheet}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-md shadow-xs transition-all shrink-0 ml-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sheet</span>
          </button>
        </div>
      )}

      {/* MAIN HIGH-PRECISION REPORT SHEET (SCREEN & PRINT IDENTICAL) */}
      <div 
        id="specialized-report-canvas-sheet"
        className="w-full max-w-[1020px] bg-white border-2 border-black shadow-xl p-3 space-y-1 text-slate-900 font-sans relative print:border-2 print:border-black print:shadow-none print:p-3 print:w-full print:max-w-none"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* WATERMARK IF SAMPLE */}
        {isSample && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15 overflow-hidden select-none">
            <div className="text-[64px] sm:text-[84px] font-black tracking-widest text-rose-700 transform -rotate-30 select-none uppercase border-8 border-rose-700 p-6 sm:p-8 rounded-3xl">
              SAMPLE MTC
            </div>
          </div>
        )}

        {/* 1. TOP HEADER BLOCK WITH COMPANY DETAILS & ISO LOGO */}
        <div className="border-b-2 border-black pb-1 mb-0.5 flex items-start justify-between gap-2 bg-white">
          {/* LEFT: COMPANY LOGO & DETAILS */}
          <div className="flex items-start gap-2 shrink-0 max-w-[48%]">
            {/* COMPANY LOGO */}
            <div className="relative group flex flex-col items-center shrink-0">
              {formData.companyLogoUrl ? (
                <div className="relative">
                  <img src={formData.companyLogoUrl} alt="Company Logo" className="h-12 max-w-[140px] object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, companyLogoUrl: undefined }));
                      onSaveAsset('companyLogoUrl', undefined);
                    }}
                    className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <label className="p-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded cursor-pointer transition-all flex items-center gap-1 text-[8.5px] font-bold print:hidden" title="Upload Company Logo">
                  <Upload className="w-3 h-3 text-amber-700" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onUploadLogo('company', e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={formData.companyName ?? (activeCompany?.name || 'COMPANY NAME')}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="font-black text-[12px] uppercase tracking-tight text-black leading-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                placeholder="Company Name"
                title="Click to edit Company Name"
              />
              <input
                type="text"
                value={formData.companyTagline ?? (activeCompany?.subtitle || '')}
                onChange={(e) => setFormData(prev => ({ ...prev, companyTagline: e.target.value }))}
                className="text-[8px] font-bold text-slate-800 uppercase tracking-tight leading-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5 mt-0.5"
                placeholder="Tagline"
                title="Click to edit Tagline"
              />
              <input
                type="text"
                value={formData.companyAddress ?? (activeCompany?.address || '')}
                onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                className="text-[7.5px] font-medium text-slate-800 leading-tight mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                placeholder="Address & Tel"
                title="Click to edit Address"
              />
              <div className="flex items-center gap-1 mt-0.5">
                <label className="flex items-center gap-1 text-[7px] text-slate-700 cursor-pointer select-none bg-slate-100 px-1 py-0.5 rounded border border-slate-200 hover:bg-slate-200 shrink-0 print:hidden" title="Toggle email and website printing on PDF">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.showCompanyContact)}
                    onChange={(e) => setFormData(prev => ({ ...prev, showCompanyContact: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">Print Email/Web</span>
                </label>
                <input
                  type="text"
                  value={formData.companyContact ?? ((activeCompany?.email ? activeCompany.email + ' | ' + (activeCompany.website || '') : ''))}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyContact: e.target.value }))}
                  className="text-[7.5px] font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                  placeholder="Email & Website"
                  title="Click to edit Contact"
                />
              </div>
            </div>
          </div>

          {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only for companies with ISO certification enabled) */}
          {(activeCompany.showIso !== false && (isMarineFastenersCompany(activeCompany) || activeCompany.showIso)) ? (
            <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
              <div className="relative group flex flex-col items-center">
                <label className="cursor-pointer" title="Click to Upload Custom ISO Logo">
                  <img 
                    src={formData.isoLogoUrl || DEFAULT_ISO_LOGO_URL} 
                    alt="ISO Certification Logos" 
                    className="h-9 sm:h-10 max-w-[260px] sm:max-w-[300px] object-contain transition-all hover:opacity-90 cursor-pointer" 
                    referrerPolicy="no-referrer"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[7.5px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none">
                  <span>{getCompanyIsoText(activeCompany) || 'ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018'}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 print:hidden bg-slate-50 px-2 py-0.5 rounded shadow-2xs border border-slate-300 z-20">
                  <label className="cursor-pointer text-[8px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                    <Upload className="w-2.5 h-2.5" />
                    <span>Upload ISO</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {formData.isoLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, isoLogoUrl: undefined }));
                        onSaveAsset('isoLogoUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 text-[8px] font-bold ml-1 border-l pl-1 border-slate-200 cursor-pointer"
                      title="Reset ISO Logo"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
              <div className="text-center font-bold text-[9.5px] text-slate-700 uppercase tracking-wider">
                {activeCompany.subtitle || 'QUALITY ASSURANCE & TESTING DIVISION'}
              </div>
            </div>
          )}

          {/* RIGHT: REPORT TITLE BOX */}
          <div className="shrink-0 text-right max-w-[32%] flex flex-col items-end">
            {reportInfo.badge && reportInfo.badge.trim().length > 0 && (
              <div className="border border-black bg-slate-100 px-1.5 py-0.5 font-black text-[8.5px] uppercase tracking-wider text-black rounded-xs mb-0.5">
                {reportInfo.badge}
              </div>
            )}
            <input
              type="text"
              value={formData.customReportTitle ?? formData.reportTitle ?? reportInfo.title}
              onChange={(e) => setFormData(prev => ({ ...prev, customReportTitle: e.target.value, reportTitle: e.target.value }))}
              className="font-black text-[12px] text-black uppercase tracking-tight leading-tight text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
              placeholder={reportInfo.title}
              title="Click to edit Report Title"
            />
            {isCompliance && (
              <input
                type="text"
                value={formData.specStandard ?? '2.1 (EN 10204-Ed 2004)'}
                onChange={(e) => setFormData(prev => ({ ...prev, specStandard: e.target.value }))}
                className="font-bold text-[9px] text-black uppercase tracking-tight text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                placeholder="2.1 (EN 10204-Ed 2004)"
                title="Click to edit Standard reference"
              />
            )}
            <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] font-bold text-slate-700">
              <span>PAGE NO :</span>
              <input
                type="text"
                value={formData.pageNo ?? '1 OF 1'}
                onChange={(e) => setFormData(prev => ({ ...prev, pageNo: e.target.value }))}
                className="font-bold text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right p-0 max-w-[90px] uppercase"
                placeholder="1 OF 1"
              />
            </div>
          </div>
        </div>

        {/* 2. METADATA 2-ROW GRID */}
        <div className="border border-black bg-white text-[9.5px]">
          <div className="grid grid-cols-3 divide-x divide-black">
            {/* ROW 1 / COL 1 */}
            <div className="flex items-center px-1.5 py-0.5 justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <span className="font-bold text-black shrink-0 mr-1.5">Cert No :</span>
                <input
                  type="text"
                  value={isInspection && activeSheetIndex > 0 ? (formData.sheets?.[activeSheetIndex]?.certNo || incrementCertNo(formData.reportNo || formData.certNo, activeSheetIndex)) : (formData.reportNo || formData.certNo || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isInspection) {
                      setFormData(prev => {
                        const sheets = [...(prev.sheets || [])];
                        if (sheets[activeSheetIndex]) {
                          sheets[activeSheetIndex] = { ...sheets[activeSheetIndex], certNo: val };
                        }
                        return {
                          ...prev,
                          reportNo: activeSheetIndex === 0 ? val : prev.reportNo,
                          certNo: activeSheetIndex === 0 ? val : prev.certNo,
                          sheets
                        };
                      });
                    } else {
                      setFormData(prev => ({ ...prev, reportNo: val, certNo: val }));
                    }
                  }}
                  className="font-black text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                  placeholder={`${reportInfo.certPrefix}-${new Date().getFullYear()}-001`}
                />
              </div>
              <button
                type="button"
                onClick={autoGenerateCertificationNo}
                title="Generate automatic certification number"
                className="shrink-0 ml-1 text-[8px] font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 px-1 py-0.2 rounded print:hidden cursor-pointer flex items-center gap-0.5"
              >
                <span>⚡ Auto</span>
              </button>
            </div>
            {/* ROW 1 / COL 2 */}
            <div className="flex items-center px-1.5 py-0.5">
              <span className="font-bold text-black shrink-0 mr-1.5">Work Order No :</span>
              <input
                type="text"
                value={formData.workOrderNum || ''}
                onChange={(e) => onPoOrInvoiceChange('workOrderNum', e.target.value)}
                className="font-bold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                placeholder="WO-10492"
              />
            </div>
            {/* ROW 1 / COL 3 */}
            <div className="flex items-center px-1.5 py-0.5">
              <span className="font-bold text-black shrink-0 mr-1.5">Customer :</span>
              <input
                type="text"
                value={formData.customerName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="font-bold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                placeholder="CLIENT NAME / COMPANY"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-black border-t border-black">
            {/* ROW 2 / COL 1 */}
            <div className="flex items-center px-1.5 py-0.5">
              <span className="font-bold text-black shrink-0 mr-1.5">Date :</span>
              <input
                type="text"
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="font-bold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                placeholder="DD/MM/YYYY"
              />
            </div>
            {/* ROW 2 / COL 2 */}
            <div className="flex items-center px-1.5 py-0.5">
              <span className="font-bold text-black shrink-0 mr-1.5">Invoice Number :</span>
              <input
                type="text"
                value={formData.invoiceNum || ''}
                onChange={(e) => onPoOrInvoiceChange('invoiceNum', e.target.value)}
                className="font-bold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                placeholder="INV-9901"
              />
            </div>
            {/* ROW 2 / COL 3 */}
            <div className="flex items-center px-1.5 py-0.5">
              <span className="font-bold text-black shrink-0 mr-1.5">PO Number :</span>
              <input
                type="text"
                value={formData.customerPoNum || ''}
                onChange={(e) => onPoOrInvoiceChange('customerPoNum', e.target.value)}
                className="font-bold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                placeholder="PO-2024-889"
              />
            </div>
          </div>
        </div>

        {/* 3. MAIN INSPECTION BODY (XYLAN VS NICKEL COBALT ASTM B994 VS STANDARD COATING TABLE) */}
        {isPtfe ? (
          <div className="space-y-1">
            {/* 1. DESCRIPTION BOX */}
            <div className="border border-black flex text-[9.5px] bg-white">
              <div className="w-[18%] font-bold text-black border-r border-black p-1 bg-slate-50 flex items-center">
                <input
                  type="text"
                  value={xylanData.descriptionLabel}
                  onChange={(e) => updateXylanField('descriptionLabel', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                />
              </div>
              <div className="flex-1 p-1 font-semibold text-black">
                <input
                  type="text"
                  value={xylanData.descriptionText}
                  onChange={(e) => updateXylanField('descriptionText', e.target.value)}
                  className="font-semibold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  placeholder="For the list of items, pls refer to metioned certificate- MFI:1089/01/2026 (Item 1-4)"
                />
              </div>
            </div>

            {/* 2. SURFACE PREPARATION BOX */}
            <div className="border border-black text-[9.5px] bg-white">
              <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 font-bold text-black text-[10px] flex items-center justify-between">
                <input
                  type="text"
                  value={xylanData.surfacePrepLabel}
                  onChange={(e) => updateXylanField('surfacePrepLabel', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[10px] focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                />
              </div>
              
              {/* ROW 1: 4 COLS */}
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black">
                <div className="p-1 flex items-center">
                  <input
                    type="text"
                    value={xylanData.gritBlast}
                    onChange={(e) => updateXylanField('gritBlast', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.solventLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.solventValue}
                    onChange={(e) => updateXylanField('solventValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.zincNiLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.zincNiValue}
                    onChange={(e) => updateXylanField('zincNiValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.othersLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.othersValue}
                    onChange={(e) => updateXylanField('othersValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
              </div>

              {/* ROW 2: 4 COLS */}
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black">
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.coatingColourLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.coatingColourValue}
                    onChange={(e) => updateXylanField('coatingColourValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.coat1Label} :</span>
                  <input
                    type="text"
                    value={xylanData.coat1Value}
                    onChange={(e) => updateXylanField('coat1Value', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.coat2Label} :</span>
                  <input
                    type="text"
                    value={xylanData.coat2Value}
                    onChange={(e) => updateXylanField('coat2Label', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.coat3Label} :</span>
                  <input
                    type="text"
                    value={xylanData.coat3Value}
                    onChange={(e) => updateXylanField('coat3Label', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
              </div>

              {/* ROW 3: FULL WIDTH XYLAN TYPE */}
              <div className="p-1 flex items-center gap-1 border-b border-black">
                <span className="font-bold text-black shrink-0">{xylanData.xylanTypeLabel} :</span>
                <input
                  type="text"
                  value={xylanData.xylanTypeValue}
                  onChange={(e) => updateXylanField('xylanTypeValue', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                />
              </div>

              {/* ROW 4: 2 COLS TEMPERATURE & HUMIDITY */}
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.temperatureLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.temperatureValue}
                    onChange={(e) => updateXylanField('temperatureValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.humidityLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.humidityValue}
                    onChange={(e) => updateXylanField('humidityValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
              </div>
            </div>

            {/* 3. OBSERVATIONS BOX */}
            <div className="border border-black text-[9.5px] bg-white">
              <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 font-bold text-black text-[10px] flex items-center justify-between">
                <input
                  type="text"
                  value={xylanData.observationsLabel}
                  onChange={(e) => updateXylanField('observationsLabel', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[10px] focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                />
                <button
                  type="button"
                  onClick={addXylanObservationRow}
                  className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[8px] font-bold flex items-center gap-1 print:hidden cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-600" /> Add Test
                </button>
              </div>

              {/* PARAMETER SUB-ROW: FLASH OFF TEMP & CURE TEMP */}
              <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.flashOffLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.flashOffValue}
                    onChange={(e) => updateXylanField('flashOffValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
                <div className="p-1 flex items-center gap-1">
                  <span className="font-bold text-black shrink-0">{xylanData.cureTempLabel} :</span>
                  <input
                    type="text"
                    value={xylanData.cureTempValue}
                    onChange={(e) => updateXylanField('cureTempValue', e.target.value)}
                    className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  />
                </div>
              </div>

              {/* OBSERVATION TESTS TABLE */}
              <table className="w-full text-left border-collapse text-[9.5px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-black text-black text-[9.5px]">
                    <th className="border-r border-black p-1 w-[20%]">Test</th>
                    <th className="border-r border-black p-1 w-[24%]">Method</th>
                    <th className="border-r border-black p-1 w-[24%]">Specified</th>
                    <th className="p-1 w-[32%]">Observed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {xylanData.observationRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-amber-50/40 transition-colors group">
                      <td className="border-r border-black p-1 font-bold text-black align-top">
                        <textarea
                          rows={row.test.includes('\n') ? 2 : 1}
                          value={row.test}
                          onChange={(e) => updateXylanObservationRow(rIdx, 'test', e.target.value)}
                          className="w-full p-0 bg-transparent border-0 text-[9.5px] font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                        />
                      </td>
                      <td className="border-r border-black p-1 font-medium text-black align-top">
                        <textarea
                          rows={row.method.includes('\n') ? 2 : 1}
                          value={row.method}
                          onChange={(e) => updateXylanObservationRow(rIdx, 'method', e.target.value)}
                          className="w-full p-0 bg-transparent border-0 text-[9.5px] font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                        />
                      </td>
                      <td className="border-r border-black p-1 font-medium text-black align-top">
                        <textarea
                          rows={row.specified.includes('\n') ? 2 : 1}
                          value={row.specified}
                          onChange={(e) => updateXylanObservationRow(rIdx, 'specified', e.target.value)}
                          className="w-full p-0 bg-transparent border-0 text-[9.5px] font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                        />
                      </td>
                      <td className="p-1 font-semibold text-black align-top relative">
                        <div className="flex items-start justify-between gap-1">
                          <textarea
                            rows={row.observed.includes('\n') ? 2 : 1}
                            value={row.observed}
                            onChange={(e) => updateXylanObservationRow(rIdx, 'observed', e.target.value)}
                            className="w-full p-0 bg-transparent border-0 text-[9.5px] font-semibold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                          />
                          {xylanData.observationRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeXylanObservationRow(rIdx)}
                              className="text-rose-500 hover:text-rose-700 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity print:hidden shrink-0 cursor-pointer"
                              title="Remove Test Row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. REMARKS & CONCLUSION BOX */}
            <div className="border border-black bg-white p-1.5 space-y-1 text-[9.5px]">
              <textarea
                rows={4}
                value={xylanData.remarks}
                onChange={(e) => updateXylanField('remarks', e.target.value)}
                className="w-full p-0.5 bg-transparent border-0 font-medium text-black text-[9.5px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-normal whitespace-pre-line"
                placeholder="Remarks lines..."
              />
              <div className="flex items-center gap-1 border-t border-black pt-1">
                <span className="font-bold text-black shrink-0">{xylanData.conclusionLabel}</span>
                <input
                  type="text"
                  value={xylanData.conclusionText}
                  onChange={(e) => updateXylanField('conclusionText', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[10px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                />
              </div>
            </div>
          </div>
        ) : isNickelCobalt ? (
          /* NICKEL COBALT COATING TEST REPORT ACCORDING TO ASTM B994 */
          <div className="space-y-1">
            {/* FASTENERS ITEMS TABLE (OPTIONAL / STANDARD LIST) */}
            {formData.items.length > 0 && (
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[5%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[8%]">FINISH</th>
                      <th className="border-r border-black p-1 w-[32%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[15%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[10%]">QTY</th>
                      <th className="border-r border-black p-1 w-[15%]">HEAT / BATCH NO</th>
                      <th className="border-r border-black p-1 w-[15%]">REMARKS</th>
                      <th className="p-1 w-[6%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* SL NO */}
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                          {idx + 1}
                        </td>

                        {/* FINISH (col 0) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || 'Ni-Co'}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>

                        {/* DESCRIPTION (col 1) */}
                        <td className={`border-r border-black p-0.5 text-left ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                            placeholder="STUD BOLTS / HEAVY HEX NUTS"
                          />
                        </td>

                        {/* SIZE (col 2) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="M24 X 180 MM"
                          />
                        </td>

                        {/* QTY (col 3) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="100 PCS"
                          />
                        </td>

                        {/* HEAT / BATCH NO (col 4 -> observedCoating) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-observedCoating`}
                            type="text"
                            value={item.observedCoating ?? (item.heatNo || '')}
                            onChange={(e) => handleCellChange(idx, 'observedCoating', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'observedCoating')}
                            onPaste={(e) => handlePaste(e, idx, 'observedCoating')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="HEAT NO"
                          />
                        </td>

                        {/* REMARKS (col 5 -> remark) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 5) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-remark`}
                            type="text"
                            value={item.remark || ''}
                            onChange={(e) => handleCellChange(idx, 'remark', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'remark')}
                            onPaste={(e) => handlePaste(e, idx, 'remark')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 5, endRow: idx, endCol: 5 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="SATISFACTORY"
                          />
                        </td>
                        <td className="p-0.5 print:hidden text-center">
                          <div className="flex items-center justify-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded hover:bg-emerald-50 cursor-pointer"
                              title="Insert Row"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id, idx)}
                              className="text-rose-600 hover:text-rose-800 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* COATING CHARACTERISTICS ACCORDING TO ASTM B994 */}
            <div className="border border-black bg-white text-[9.5px]">
              {/* SECTION HEADER BANNER */}
              <div className="bg-slate-100 border-b border-black p-1 font-black text-[10.5px] text-black text-center uppercase tracking-wider flex items-center justify-center">
                <input
                  type="text"
                  value={nickelData.sectionTitle}
                  onChange={(e) => updateNickelField('sectionTitle', e.target.value)}
                  className="font-black text-[10.5px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase tracking-wider"
                />
              </div>

              {/* 2-COLUMN MAIN TEST SUITE: ACCEPTANCE TESTS VS QUALIFICATION TESTS */}
              <div className="grid grid-cols-2 divide-x divide-black">
                {/* LEFT COLUMN: ACCEPTANCE TESTS */}
                <div className="flex flex-col divide-y divide-black">
                  <div className="bg-slate-50 p-1 font-black text-[10px] text-black text-center uppercase tracking-wide">
                    <input
                      type="text"
                      value={nickelData.acceptanceTitle}
                      onChange={(e) => updateNickelField('acceptanceTitle', e.target.value)}
                      className="font-black text-[10px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    />
                  </div>

                  {/* APPEARANCE */}
                  <div className="p-1.5 space-y-0.5">
                    <div className="font-bold text-[9.5px] text-black uppercase">
                      <input
                        type="text"
                        value={nickelData.appearanceLabel}
                        onChange={(e) => updateNickelField('appearanceLabel', e.target.value)}
                        className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={nickelData.appearanceValue}
                      onChange={(e) => updateNickelField('appearanceValue', e.target.value)}
                      className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug uppercase"
                    />
                  </div>

                  {/* ADHESION */}
                  <div className="p-1.5 space-y-0.5">
                    <div className="font-bold text-[9.5px] text-black uppercase">
                      <input
                        type="text"
                        value={nickelData.adhesionLabel}
                        onChange={(e) => updateNickelField('adhesionLabel', e.target.value)}
                        className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={nickelData.adhesionValue}
                      onChange={(e) => updateNickelField('adhesionValue', e.target.value)}
                      className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug uppercase"
                    />
                  </div>

                  {/* THICKNESS */}
                  <div className="p-1.5 space-y-0.5 mt-auto">
                    <div className="font-bold text-[9.5px] text-black uppercase">
                      <input
                        type="text"
                        value={nickelData.thicknessLabel}
                        onChange={(e) => updateNickelField('thicknessLabel', e.target.value)}
                        className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={nickelData.thicknessValue}
                          onChange={(e) => updateNickelField('thicknessValue', e.target.value)}
                          className="font-black text-[10px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded w-24"
                        />
                        <input
                          type="text"
                          value={nickelData.thicknessUnit}
                          onChange={(e) => updateNickelField('thicknessUnit', e.target.value)}
                          className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded w-8"
                        />
                      </div>
                      <input
                        type="text"
                        value={nickelData.thicknessMethod}
                        onChange={(e) => updateNickelField('thicknessMethod', e.target.value)}
                        className="font-bold text-[9px] text-right text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: QUALIFICATION TESTS */}
                <div className="flex flex-col divide-y divide-black">
                  <div className="bg-slate-50 p-1 font-black text-[10px] text-black text-center uppercase tracking-wide">
                    <input
                      type="text"
                      value={nickelData.qualificationTitle}
                      onChange={(e) => updateNickelField('qualificationTitle', e.target.value)}
                      className="font-black text-[10px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    />
                  </div>

                  {/* CHEMICAL COMPOSITION */}
                  <div className="divide-y divide-black">
                    <div className="bg-slate-50/70 p-0.5 font-bold text-[9.5px] text-black text-center uppercase">
                      <input
                        type="text"
                        value={nickelData.chemTitle}
                        onChange={(e) => updateNickelField('chemTitle', e.target.value)}
                        className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black text-center">
                      <div className="p-0.5 font-bold text-[9.5px] bg-slate-50/50">
                        <input
                          type="text"
                          value={nickelData.chemNiLabel}
                          onChange={(e) => updateNickelField('chemNiLabel', e.target.value)}
                          className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full"
                        />
                      </div>
                      <div className="p-0.5 font-bold text-[9.5px] bg-slate-50/50">
                        <input
                          type="text"
                          value={nickelData.chemCoLabel}
                          onChange={(e) => updateNickelField('chemCoLabel', e.target.value)}
                          className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black text-center">
                      <div className="p-0.5 font-bold text-[9.5px]">
                        <input
                          type="text"
                          value={nickelData.chemNiValue}
                          onChange={(e) => updateNickelField('chemNiValue', e.target.value)}
                          className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                        />
                      </div>
                      <div className="p-0.5 font-bold text-[9.5px]">
                        <input
                          type="text"
                          value={nickelData.chemCoValue}
                          onChange={(e) => updateNickelField('chemCoValue', e.target.value)}
                          className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GALLING */}
                  <div className="p-1 space-y-0.5">
                    <div className="font-bold text-[9.5px] text-black uppercase">
                      <input
                        type="text"
                        value={nickelData.gallingLabel}
                        onChange={(e) => updateNickelField('gallingLabel', e.target.value)}
                        className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <textarea
                      rows={1}
                      value={nickelData.gallingValue}
                      onChange={(e) => updateNickelField('gallingValue', e.target.value)}
                      className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug uppercase"
                    />
                  </div>

                  {/* HYDROGEN EMBRITTLEMENT */}
                  <div className="p-1 space-y-0.5">
                    <div className="font-bold text-[9.5px] text-black uppercase">
                      <input
                        type="text"
                        value={nickelData.hydrogenLabel}
                        onChange={(e) => updateNickelField('hydrogenLabel', e.target.value)}
                        className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <input
                      type="text"
                      value={nickelData.hydrogenValue}
                      onChange={(e) => updateNickelField('hydrogenValue', e.target.value)}
                      className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    />
                  </div>

                  {/* ENVIRONMENTAL TESTING */}
                  <div className="divide-y divide-black">
                    <div className="bg-slate-50/70 p-0.5 font-bold text-[9.5px] text-black text-center uppercase">
                      <input
                        type="text"
                        value={nickelData.envTitle}
                        onChange={(e) => updateNickelField('envTitle', e.target.value)}
                        className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black text-center text-[8.5px]">
                      <div className="p-0.5 font-bold bg-slate-50/50">
                        <input
                          type="text"
                          value={nickelData.cassLabel}
                          onChange={(e) => updateNickelField('cassLabel', e.target.value)}
                          className="font-bold text-[8.5px] text-center text-black bg-transparent border-0 p-0 w-full uppercase"
                        />
                      </div>
                      <div className="p-0.5 font-bold bg-slate-50/50">
                        <input
                          type="text"
                          value={nickelData.saltFogLabel}
                          onChange={(e) => updateNickelField('saltFogLabel', e.target.value)}
                          className="font-bold text-[8.5px] text-center text-black bg-transparent border-0 p-0 w-full uppercase"
                        />
                      </div>
                      <div className="p-0.5 font-bold bg-slate-50/50">
                        <input
                          type="text"
                          value={nickelData.modSaltFogLabel}
                          onChange={(e) => updateNickelField('modSaltFogLabel', e.target.value)}
                          className="font-bold text-[8.5px] text-center text-black bg-transparent border-0 p-0 w-full uppercase"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black text-center text-[9px]">
                      <div className="p-0.5 font-bold">
                        <input
                          type="text"
                          value={nickelData.cassValue}
                          onChange={(e) => updateNickelField('cassValue', e.target.value)}
                          className="font-bold text-[9px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                        />
                      </div>
                      <div className="p-0.5 font-bold">
                        <input
                          type="text"
                          value={nickelData.saltFogValue}
                          onChange={(e) => updateNickelField('saltFogValue', e.target.value)}
                          className="font-bold text-[9px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                        />
                      </div>
                      <div className="p-0.5 font-bold">
                        <input
                          type="text"
                          value={nickelData.modSaltFogValue}
                          onChange={(e) => updateNickelField('modSaltFogValue', e.target.value)}
                          className="font-bold text-[9px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                        />
                      </div>
                    </div>
                    <div className="p-1 text-center bg-white">
                      <textarea
                        rows={2}
                        value={nickelData.envObservation}
                        onChange={(e) => updateNickelField('envObservation', e.target.value)}
                        className="w-full p-0.5 bg-transparent border-0 text-[8.5px] font-bold text-center text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight uppercase"
                      />
                    </div>
                  </div>

                  {/* DEPOSIT LOT */}
                  <div className="p-1 flex items-center gap-1 bg-slate-50/40">
                    <input
                      type="text"
                      value={nickelData.depositLotLabel}
                      onChange={(e) => updateNickelField('depositLotLabel', e.target.value)}
                      className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 w-28 uppercase"
                    />
                    <input
                      type="text"
                      value={nickelData.depositLotValue}
                      onChange={(e) => updateNickelField('depositLotValue', e.target.value)}
                      className="font-bold text-[10px] text-black bg-transparent border-0 p-0 flex-1 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    />
                  </div>

                  {/* CORROSION TESTING TABLE */}
                  <div className="divide-y divide-black">
                    <div className="bg-slate-50/70 px-1 py-0.5 font-bold text-[9.5px] text-black flex items-center justify-between uppercase">
                      <input
                        type="text"
                        value={nickelData.corrosionTitle}
                        onChange={(e) => updateNickelField('corrosionTitle', e.target.value)}
                        className="font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                      <button
                        type="button"
                        onClick={addCorrosionRow}
                        className="px-1 py-0.2 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[7.5px] font-bold flex items-center gap-0.5 print:hidden cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5 text-emerald-600" /> Add
                      </button>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black text-center text-[9px] font-bold bg-slate-50/50">
                      <div className="p-0.5">PART</div>
                      <div className="p-0.5">
                        <input
                          type="text"
                          value={nickelData.corrosionRateHeader}
                          onChange={(e) => updateNickelField('corrosionRateHeader', e.target.value)}
                          className="font-bold text-[9px] text-center text-black bg-transparent border-0 p-0 w-full uppercase"
                        />
                      </div>
                    </div>
                    {nickelData.corrosionRows.map((row, crIdx) => (
                      <div key={crIdx} className="grid grid-cols-2 divide-x divide-black text-[9.5px] group hover:bg-amber-50/40">
                        <div className="p-0.5 flex items-center justify-between">
                          <input
                            type="text"
                            value={row.part}
                            onChange={(e) => updateCorrosionRow(crIdx, 'part', e.target.value)}
                            className="font-semibold text-[9.5px] text-black bg-transparent border-0 p-0 w-full focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                          />
                        </div>
                        <div className="p-0.5 flex items-center justify-between">
                          <input
                            type="text"
                            value={row.rate}
                            onChange={(e) => updateCorrosionRow(crIdx, 'rate', e.target.value)}
                            className="font-bold text-[9.5px] text-center text-black bg-transparent border-0 p-0 w-full focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                          {nickelData.corrosionRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCorrosionRow(crIdx)}
                              className="text-rose-500 hover:text-rose-700 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SAMPLING & FOOTNOTES BOX */}
            <div className="border border-black p-1.5 space-y-0.5 bg-white text-[9px] leading-tight font-medium text-black">
              <input
                type="text"
                value={nickelData.samplingClause}
                onChange={(e) => updateNickelField('samplingClause', e.target.value)}
                className="w-full font-bold text-black bg-transparent border-0 p-0 text-[9px] focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
              />
              <input
                type="text"
                value={nickelData.footnote1}
                onChange={(e) => updateNickelField('footnote1', e.target.value)}
                className="w-full text-slate-800 bg-transparent border-0 p-0 text-[8.5px] focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
              />
              <input
                type="text"
                value={nickelData.footnote2}
                onChange={(e) => updateNickelField('footnote2', e.target.value)}
                className="w-full text-slate-800 bg-transparent border-0 p-0 text-[8.5px] focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
              />
              <input
                type="text"
                value={nickelData.footnote3}
                onChange={(e) => updateNickelField('footnote3', e.target.value)}
                className="w-full text-slate-800 bg-transparent border-0 p-0 text-[8.5px] focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
              />
            </div>

            {/* LEGAL & COMPLIANCE CLAUSE */}
            <div className="border border-black p-1.5 bg-slate-50/40">
              <textarea
                rows={3}
                value={nickelData.legalClause}
                onChange={(e) => updateNickelField('legalClause', e.target.value)}
                className="w-full p-0 bg-transparent border-0 text-[9px] font-bold uppercase text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
              />
              <div className="flex items-center gap-1 border-t border-black pt-1 mt-1 text-[9.5px]">
                <span className="font-black text-black shrink-0">{nickelData.qaAgentTitle}</span>
                <input
                  type="text"
                  value={nickelData.qaAgentName}
                  onChange={(e) => updateNickelField('qaAgentName', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                />
              </div>
            </div>
          </div>
        ) : isNeopreneSleeve ? (
          /* NEOPRENE SLEEVE TEST REPORT INTERACTIVE CANVAS */
          <div className="space-y-1.5">
            {/* 1. FASTENERS / SLEEVES ITEMS TABLE (6 COLUMNS + ACTIONS) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[5%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[35%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[15%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[10%]">QTY</th>
                      <th className="border-r border-black p-1 w-[15%]">MATERIAL</th>
                      <th className="border-r border-black p-1 w-[15%]">COMPOUND CODE</th>
                      <th className="p-1 w-[5%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* SL. NO. */}
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                          {item.itemNo || idx + 1}
                        </td>

                        {/* DESCRIPTION (col 0) */}
                        <td className={`border-r border-black p-0.5 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-semibold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                            placeholder="Description..."
                          />
                        </td>

                        {/* SIZE (col 1) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="Size..."
                          />
                        </td>

                        {/* QTY (col 2) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="Qty..."
                          />
                        </td>

                        {/* MATERIAL (col 3) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-material`}
                            type="text"
                            value={item.material || item.finish || 'EPDM'}
                            onChange={(e) => {
                              handleCellChange(idx, 'material', e.target.value);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'material')}
                            onPaste={(e) => handlePaste(e, idx, 'material')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="Material..."
                          />
                        </td>

                        {/* COMPOUND CODE (col 4 -> observedCoating) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-observedCoating`}
                            type="text"
                            value={item.observedCoating ?? (item.heatNo ?? '')}
                            onChange={(e) => {
                              handleCellChange(idx, 'observedCoating', e.target.value);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'observedCoating')}
                            onPaste={(e) => handlePaste(e, idx, 'observedCoating')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder="Compound Code..."
                          />
                        </td>

                        {/* ACTIONS */}
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(idx)}
                              title="Clone row"
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id, idx)}
                                title="Delete row"
                                className="p-1 hover:bg-rose-100 rounded text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTION TOOLBAR UNDER ITEMS TABLE */}
              <div className="flex items-center justify-between text-xs py-0.5 px-1 bg-slate-50 border border-t-0 border-black rounded-b">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onAddItem}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-[9.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(5)}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-[9.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3 h-3 text-blue-600" /> +5 Rows
                  </button>
                </div>
                <div className="text-[9.5px] font-bold text-slate-700">
                  Total Items: {formData.items.length}
                </div>
              </div>
            </div>

            {/* 2. SPECIFICATIONS & TEST RESULTS TABLE */}
            <div className="border border-black bg-white text-[9.5px]">
              <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                <thead>
                  <tr className="bg-slate-100 font-bold italic border-b border-black text-black text-[9.5px] leading-tight">
                    <th className="border-r border-black p-1 w-[6%] font-bold italic">Sr No</th>
                    <th className="border-r border-black p-1 w-[38%] font-bold italic text-left px-2">Properties</th>
                    <th className="border-r border-black p-1 w-[20%] font-bold italic">Test Method</th>
                    <th className="border-r border-black p-1 w-[16%] font-bold italic">Unit</th>
                    <th className="p-1 w-[20%] font-bold italic">Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {/* BASE POLYMER */}
                  <tr className="hover:bg-amber-50/30">
                    <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9.5px]">1</td>
                    <td className="border-r border-black p-1 text-left font-bold italic text-black px-2">Base Polymer</td>
                    <td className="border-r border-black p-1 text-center font-medium text-slate-500">—</td>
                    <td colSpan={2} className="p-1 text-center font-bold text-black">
                      <input
                        type="text"
                        value={neopreneData.basePolymer}
                        onChange={(e) => updateNeopreneField('basePolymer', e.target.value)}
                        className="w-full text-center font-bold text-[10px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                      />
                    </td>
                  </tr>

                  {/* COLOUR */}
                  <tr className="hover:bg-amber-50/30">
                    <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9.5px]">2</td>
                    <td className="border-r border-black p-1 text-left font-bold italic text-black px-2">Colour</td>
                    <td className="border-r border-black p-1 text-center font-medium text-slate-500">—</td>
                    <td colSpan={2} className="p-1 text-center font-bold text-black">
                      <input
                        type="text"
                        value={neopreneData.colour}
                        onChange={(e) => updateNeopreneField('colour', e.target.value)}
                        className="w-full text-center font-bold text-[10px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                      />
                    </td>
                  </tr>

                  {/* PHYSICAL PROPERTIES SECTION HEADER */}
                  <tr className="bg-slate-100/80 border-t border-b border-black">
                    <td colSpan={5} className="p-1 font-bold italic text-[10px] text-black text-center tracking-wide">
                      Physical Properties
                    </td>
                  </tr>

                  {/* PHYSICAL PROPERTY ROWS */}
                  {neopreneData.physicalProperties.map((row, pIdx) => {
                    const hasSubRows = Array.isArray(row.subRows) && row.subRows.length > 0;
                    return (
                      <React.Fragment key={pIdx}>
                        <tr className="hover:bg-amber-50/30">
                          <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                            <input
                              type="text"
                              value={row.srNo}
                              onChange={(e) => updateNeoprenePhysicalRow(pIdx, 'srNo', e.target.value)}
                              className="w-full text-center font-bold text-[9.5px] text-slate-800 bg-transparent border-0 p-0"
                            />
                          </td>
                          <td className="border-r border-black p-1 text-left px-2">
                            <textarea
                              rows={hasSubRows ? 2 : 1}
                              value={row.property}
                              onChange={(e) => updateNeoprenePhysicalRow(pIdx, 'property', e.target.value)}
                              className="w-full font-bold italic text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                            />
                          </td>
                          <td className="border-r border-black p-1 text-center">
                            <input
                              type="text"
                              value={row.testMethod}
                              onChange={(e) => updateNeoprenePhysicalRow(pIdx, 'testMethod', e.target.value)}
                              className="w-full text-center font-semibold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            />
                          </td>
                          <td className="border-r border-black p-1 text-center">
                            <input
                              type="text"
                              value={row.unit}
                              onChange={(e) => updateNeoprenePhysicalRow(pIdx, 'unit', e.target.value)}
                              className="w-full text-center font-semibold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <input
                              type="text"
                              value={row.specification}
                              onChange={(e) => updateNeoprenePhysicalRow(pIdx, 'specification', e.target.value)}
                              className="w-full text-center font-bold text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            />
                          </td>
                        </tr>

                        {/* SUB ROWS IF APPLICABLE (e.g. Row 7 a, b, c) */}
                        {hasSubRows && row.subRows!.map((sub, sIdx) => (
                          <tr key={`${pIdx}-sub-${sIdx}`} className="hover:bg-amber-50/30 bg-slate-50/20">
                            <td className="border-r border-black p-0.5 text-center font-bold text-[9px] text-slate-700">
                              <input
                                type="text"
                                value={sub.srNo}
                                onChange={(e) => updateNeopreneSubRow(pIdx, sIdx, 'srNo', e.target.value)}
                                className="w-full text-center font-bold text-[9px] text-slate-700 bg-transparent border-0 p-0"
                              />
                            </td>
                            <td className="border-r border-black p-0.5 text-left px-3">
                              <input
                                type="text"
                                value={sub.property}
                                onChange={(e) => updateNeopreneSubRow(pIdx, sIdx, 'property', e.target.value)}
                                className="w-full font-bold italic text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              />
                            </td>
                            <td className="border-r border-black p-0.5 text-center">
                              <input
                                type="text"
                                value={sub.testMethod}
                                onChange={(e) => updateNeopreneSubRow(pIdx, sIdx, 'testMethod', e.target.value)}
                                className="w-full text-center font-semibold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              />
                            </td>
                            <td className="border-r border-black p-0.5 text-center">
                              <input
                                type="text"
                                value={sub.unit}
                                onChange={(e) => updateNeopreneSubRow(pIdx, sIdx, 'unit', e.target.value)}
                                className="w-full text-center font-semibold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              />
                            </td>
                            <td className="p-0.5 text-center">
                              <input
                                type="text"
                                value={sub.specification}
                                onChange={(e) => updateNeopreneSubRow(pIdx, sIdx, 'specification', e.target.value)}
                                className="w-full text-center font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}

                  {/* GENERAL PROPERTIES SECTION HEADER */}
                  <tr className="bg-slate-100/80 border-t border-b border-black">
                    <td colSpan={5} className="p-1 font-bold italic text-[10px] text-black text-center tracking-wide">
                      General Properties
                    </td>
                  </tr>

                  {/* GENERAL PROPERTY ROWS */}
                  {neopreneData.generalProperties.map((gen, gIdx) => (
                    <tr key={`gen-${gIdx}`} className="hover:bg-amber-50/30">
                      <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                        <input
                          type="text"
                          value={gen.srNo}
                          onChange={(e) => updateNeopreneGeneralRow(gIdx, 'srNo', e.target.value)}
                          className="w-full text-center font-bold text-[9.5px] text-slate-800 bg-transparent border-0 p-0"
                        />
                      </td>
                      <td className="border-r border-black p-1 text-left px-2">
                        <input
                          type="text"
                          value={gen.property}
                          onChange={(e) => updateNeopreneGeneralRow(gIdx, 'property', e.target.value)}
                          className="w-full font-bold italic text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                        />
                      </td>
                      <td colSpan={3} className="p-1 text-center">
                        <input
                          type="text"
                          value={gen.value}
                          onChange={(e) => updateNeopreneGeneralRow(gIdx, 'value', e.target.value)}
                          className="w-full text-center font-bold italic text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3. NOTE BOX */}
            <div className="border border-black p-1.5 bg-white">
              <textarea
                rows={2}
                value={neopreneData.note}
                onChange={(e) => updateNeopreneField('note', e.target.value)}
                className="w-full p-0 bg-transparent border-0 text-[9px] italic text-black focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                placeholder="Note..."
              />
            </div>
          </div>
        ) : isTeflon ? (
          /* TEFLON COATING TEST REPORT INTERACTIVE CANVAS */
          <div className="space-y-1.5">
            {/* 1. FASTENERS / SLEEVES ITEMS TABLE (5 COLUMNS + ACTIONS) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[6%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[46%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[18%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[12%]">QTY</th>
                      <th className="border-r border-black p-1 w-[12%]">COLOR</th>
                      <th className="p-1 w-[6%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* SL. NO. */}
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                          {item.itemNo || idx + 1}
                        </td>

                        {/* DESCRIPTION (col 0) */}
                        <td className={`border-r border-black p-0.5 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-description`}
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            placeholder=""
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>

                        {/* SIZE (col 1) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            placeholder=""
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>

                        {/* QTY (col 2) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            placeholder=""
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>

                        {/* COLOR / FINISH (col 3) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || item.marking || ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            placeholder=""
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>

                        {/* ROW ACTIONS */}
                        <td className="p-0.5 print:hidden text-center">
                          <div className="flex items-center justify-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded hover:bg-emerald-50 cursor-pointer"
                              title="Insert Clean Row Below"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(idx)}
                              className="text-slate-600 hover:text-slate-900 p-0.5 rounded hover:bg-slate-100 cursor-pointer"
                              title="Duplicate Row"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id, idx)}
                              className="text-rose-600 hover:text-rose-800 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ACTION TOOLBAR BELOW TABLE */}
              <div className="flex items-center justify-between pt-0.5 print:hidden">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onAddItem}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = Array.from({ length: 5 }, (_, i) => ({
                        id: `item-${Date.now()}-${i}`,
                        itemNo: (formData.items.length + i + 1).toString(),
                        description: '',
                        size: '',
                        standard: '',
                        qty: '',
                        heatNo: '',
                        finish: '',
                        material: ''
                      }));
                      setFormData(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
                    }}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-700 hover:bg-slate-800 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> +5 Rows
                  </button>
                </div>
                <span className="text-[9px] font-bold text-slate-500">
                  Total Items: {formData.items.length}
                </span>
              </div>
            </div>

            {/* 2. MATERIAL OVERVIEW & SHORT DESCRIPTION */}
            <div className="border border-black bg-white p-1.5 space-y-1 text-[9.5px]">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-slate-200 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-black">Material:</span>
                  <input
                    type="text"
                    value={teflonData.material}
                    onChange={(e) => updateTeflonField('material', e.target.value)}
                    className="font-bold text-black bg-transparent border-b border-slate-300 focus:border-amber-500 focus:bg-amber-50/40 px-1 py-0.2 text-[9.5px] rounded"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-black">Abbreviation:</span>
                  <input
                    type="text"
                    value={teflonData.abbreviation}
                    onChange={(e) => updateTeflonField('abbreviation', e.target.value)}
                    className="font-bold text-black bg-transparent border-b border-slate-300 focus:border-amber-500 focus:bg-amber-50/40 px-1 py-0.2 text-[9.5px] rounded"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold italic text-black text-[9px]">
                  {teflonData.shortDescriptionLabel}
                </div>
                <textarea
                  rows={2}
                  value={teflonData.shortDescriptionText}
                  onChange={(e) => updateTeflonField('shortDescriptionText', e.target.value)}
                  className="w-full p-1 bg-slate-50/50 border border-slate-200 text-[9px] text-black focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                />
              </div>
            </div>

            {/* 3. TECHNICAL PROPERTIES TABLES (BALANCED 2-COLUMN GRID) */}
            <div className="border border-black bg-white overflow-hidden grid grid-cols-2 divide-x divide-black text-[9px]">
              {/* LEFT COLUMN: MECHANICAL VALUES */}
              <div className="flex flex-col">
                <table className="w-full border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px]">
                      <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Mechanical values</th>
                      <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                      <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                      <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {teflonData.mechanicalValues.map((row, rIdx) => (
                      <tr key={`mech-${rIdx}`} className="hover:bg-amber-50/30">
                        <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                          <input
                            type="text"
                            value={row.property}
                            onChange={(e) => updateTeflonPropertyRow('mechanicalValues', rIdx, 'property', e.target.value)}
                            className="w-full font-medium text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.standard}
                            onChange={(e) => updateTeflonPropertyRow('mechanicalValues', rIdx, 'standard', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.dryHumid}
                            onChange={(e) => updateTeflonPropertyRow('mechanicalValues', rIdx, 'dryHumid', e.target.value)}
                            className="w-full text-center font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="p-0.5 text-center">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => updateTeflonPropertyRow('mechanicalValues', rIdx, 'unit', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RIGHT COLUMN: THERMAL, ELECTRICAL & MISCELLANEOUS VALUES */}
              <div className="flex flex-col divide-y divide-black">
                {/* THERMAL VALUES */}
                <table className="w-full border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px]">
                      <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Thermal values</th>
                      <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                      <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                      <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {teflonData.thermalValues.map((row, rIdx) => (
                      <tr key={`therm-${rIdx}`} className="hover:bg-amber-50/30">
                        <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                          <input
                            type="text"
                            value={row.property}
                            onChange={(e) => updateTeflonPropertyRow('thermalValues', rIdx, 'property', e.target.value)}
                            className="w-full font-medium text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.standard}
                            onChange={(e) => updateTeflonPropertyRow('thermalValues', rIdx, 'standard', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.dryHumid}
                            onChange={(e) => updateTeflonPropertyRow('thermalValues', rIdx, 'dryHumid', e.target.value)}
                            className="w-full text-center font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="p-0.5 text-center">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => updateTeflonPropertyRow('thermalValues', rIdx, 'unit', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ELECTRICAL VALUES */}
                <table className="w-full border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px]">
                      <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Electrical values</th>
                      <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                      <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                      <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {teflonData.electricalValues.map((row, rIdx) => (
                      <tr key={`elec-${rIdx}`} className="hover:bg-amber-50/30">
                        <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                          <input
                            type="text"
                            value={row.property}
                            onChange={(e) => updateTeflonPropertyRow('electricalValues', rIdx, 'property', e.target.value)}
                            className="w-full font-medium text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.standard}
                            onChange={(e) => updateTeflonPropertyRow('electricalValues', rIdx, 'standard', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.dryHumid}
                            onChange={(e) => updateTeflonPropertyRow('electricalValues', rIdx, 'dryHumid', e.target.value)}
                            className="w-full text-center font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="p-0.5 text-center">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => updateTeflonPropertyRow('electricalValues', rIdx, 'unit', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* MISCELLANEOUS DATA */}
                <table className="w-full border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px]">
                      <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Miscellaneous data</th>
                      <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                      <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                      <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {teflonData.miscellaneousValues.map((row, rIdx) => (
                      <tr key={`misc-${rIdx}`} className="hover:bg-amber-50/30">
                        <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                          <input
                            type="text"
                            value={row.property}
                            onChange={(e) => updateTeflonPropertyRow('miscellaneousValues', rIdx, 'property', e.target.value)}
                            className="w-full font-medium text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.standard}
                            onChange={(e) => updateTeflonPropertyRow('miscellaneousValues', rIdx, 'standard', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="border-r border-black p-0.5 text-center">
                          <input
                            type="text"
                            value={row.dryHumid}
                            onChange={(e) => updateTeflonPropertyRow('miscellaneousValues', rIdx, 'dryHumid', e.target.value)}
                            className="w-full text-center font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="p-0.5 text-center">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => updateTeflonPropertyRow('miscellaneousValues', rIdx, 'unit', e.target.value)}
                            className="w-full text-center font-semibold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. FOOTNOTES & CONVERSIONS */}
            <div className="border border-black p-1.5 bg-white space-y-1 text-[8.5px]">
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {teflonData.footnotes.map((fn, fIdx) => (
                  <div key={`fn-${fIdx}`} className="flex items-start gap-1">
                    <textarea
                      rows={2}
                      value={fn}
                      onChange={(e) => updateTeflonFootnote(fIdx, e.target.value)}
                      className="w-full p-0.5 bg-slate-50/50 border border-slate-200 text-[8px] italic text-black focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 pt-1 border-t border-slate-200">
                {teflonData.conversions.map((cv, cIdx) => (
                  <input
                    key={`cv-${cIdx}`}
                    type="text"
                    value={cv}
                    onChange={(e) => updateTeflonConversion(cIdx, e.target.value)}
                    className="font-bold text-[8px] text-black bg-transparent border-b border-slate-300 focus:border-amber-500 focus:bg-amber-50 px-1 py-0.5 rounded"
                  />
                ))}
              </div>
            </div>

            {/* 5. DISCLAIMER NOTE */}
            <div className="border border-black p-1.5 bg-white">
              <textarea
                rows={2}
                value={teflonData.disclaimerNote}
                onChange={(e) => updateTeflonField('disclaimerNote', e.target.value)}
                className="w-full p-1 bg-slate-50/40 border border-slate-200 text-[8px] text-justify text-black focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                placeholder="Disclaimer note..."
              />
            </div>
          </div>
        ) : isFluropolymer ? (
          /* FLUROPOLYMER COATING TEST REPORT INTERACTIVE CANVAS */
          <div className="space-y-1.5">
            {/* 1. DESCRIPTION BOX */}
            <div className="border border-black flex text-[9.5px] bg-white">
              <div className="w-[18%] font-bold text-black border-r border-black p-1 bg-slate-50 flex items-center">
                <input
                  type="text"
                  value={fluropolymerData.descriptionLabel}
                  onChange={(e) => updateFluropolymerField('descriptionLabel', e.target.value)}
                  className="font-bold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  placeholder="Description"
                />
              </div>
              <div className="flex-1 p-1 font-semibold text-black">
                <input
                  type="text"
                  value={fluropolymerData.descriptionText}
                  onChange={(e) => updateFluropolymerField('descriptionText', e.target.value)}
                  className="font-semibold text-black bg-transparent border-0 p-0 text-[9.5px] w-full focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                  placeholder="For the list of items, pls refer to metioned certificate- MFI:1089/01/2026 (Item 1-4)"
                />
              </div>
            </div>

            {/* 2. FASTENERS ITEMS TABLE */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[5%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[11%]">FINISH</th>
                      <th className="border-r border-black p-1 w-[26%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[13%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[8%]">QTY</th>
                      <th className="border-r border-black p-1 w-[18%]">HEAT NUMBER</th>
                      <th className="border-r border-black p-1 w-[15%]">REMARKS</th>
                      <th className="p-1 w-[4%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                          {item.itemNo || idx + 1}
                        </td>
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish ?? 'FLUROPOLYMER'}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className={`border-r border-black p-0.5 text-left ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-description`}
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            placeholder="e.g. STUD BOLTS / HEAVY HEX NUTS"
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            placeholder='e.g. 1-1/8" X 180MM'
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            placeholder="e.g. 50 SETS"
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-heatNo`}
                            type="text"
                            value={item.heatNo || ''}
                            onChange={(e) => handleCellChange(idx, 'heatNo', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'heatNo')}
                            onPaste={(e) => handlePaste(e, idx, 'heatNo')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            placeholder="e.g. BATCH-01"
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 5) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-remark`}
                            type="text"
                            value={item.remark || 'SATISFACTORY'}
                            onChange={(e) => handleCellChange(idx, 'remark', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'remark')}
                            onPaste={(e) => handlePaste(e, idx, 'remark')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 5, endRow: idx, endCol: 5 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          />
                        </td>
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              title="Insert row below"
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(idx)}
                              title="Duplicate row"
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(idx)}
                              disabled={formData.items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-0.5 print:hidden">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onAddItem}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = Array.from({ length: 5 }, (_, i) => ({
                        id: `item-${Date.now()}-${i}`,
                        itemNo: (formData.items.length + i + 1).toString(),
                        description: '',
                        size: '',
                        standard: '',
                        qty: '',
                        heatNo: '',
                        finish: 'FLUROPOLYMER',
                        material: '',
                        remark: 'SATISFACTORY'
                      }));
                      setFormData(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
                    }}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-700 hover:bg-slate-800 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> +5 Items
                  </button>
                </div>
                <span className="text-[9px] font-bold text-slate-500">
                  Fasteners Items: {formData.items.length}
                </span>
              </div>
            </div>

            {/* 3. TECHNICAL EVALUATION & SPECIFICATION MATRIX (09-SAMSS-107) */}
            <div className="border border-black bg-white overflow-hidden text-[9px]">
              <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 flex items-center justify-between">
                <span className="uppercase tracking-wide font-black text-[9.5px]">
                  TECHNICAL EVALUATION & SPECIFICATION MATRIX (09-SAMSS-107 / ASTM B117 / ASTM D5894)
                </span>
                <div className="flex items-center gap-1.5 print:hidden">
                  <button
                    type="button"
                    onClick={() => addFluropolymerRow()}
                    className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Parameter Row
                  </button>
                  <button
                    type="button"
                    onClick={resetFluropolymerRows}
                    className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Reset to Aramco 09-SAMSS-107
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse text-[9px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-black text-black text-[9px]">
                    <th className="border-r border-black p-1 w-[6%] text-center font-bold">SR NO</th>
                    <th className="border-r border-black p-1 w-[28%] text-left px-2 font-bold">PARAMETER / TEST</th>
                    <th className="border-r border-black p-1 w-[56%] text-left px-2 font-bold">SPECIFICATION / INSPECTION RESULTS</th>
                    <th className="p-1 w-[10%] text-center print:hidden font-bold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {fluropolymerData.rows.map((row, rIdx) => (
                    <tr key={row.id || `fluro-${rIdx}`} className="hover:bg-amber-50/30 group">
                      {row.isFullWidth ? (
                        <>
                          <td className="border-r border-black p-1 text-center font-bold bg-slate-50 text-slate-800 text-[9px]">
                            {rIdx + 1}
                          </td>
                          <td colSpan={2} className="border-r border-black p-1 px-2 text-left bg-slate-50/50">
                            <div className="flex items-start gap-1">
                              <input
                                type="text"
                                value={row.parameter}
                                onChange={(e) => updateFluropolymerRow(rIdx, 'parameter', e.target.value)}
                                className="font-bold text-[9px] text-black bg-transparent border-b border-slate-300 focus:bg-white focus:border-amber-500 w-24 shrink-0 rounded px-1"
                                placeholder="Label"
                              />
                              <span className="font-bold text-black">:</span>
                              <textarea
                                rows={2}
                                value={row.specification}
                                onChange={(e) => updateFluropolymerRow(rIdx, 'specification', e.target.value)}
                                className="w-full font-medium text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none"
                              />
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border-r border-black p-1 text-center font-bold bg-slate-50 text-slate-800 text-[9px]">
                            {rIdx + 1}
                          </td>
                          <td className="border-r border-black p-1 px-2 text-left">
                            <input
                              type="text"
                              value={row.parameter}
                              onChange={(e) => updateFluropolymerRow(rIdx, 'parameter', e.target.value)}
                              className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            />
                          </td>
                          <td className="border-r border-black p-1 px-2 text-left">
                            <textarea
                              rows={row.specification.length > 80 ? 3 : (row.specification.length > 40 ? 2 : 1)}
                              value={row.specification}
                              onChange={(e) => updateFluropolymerRow(rIdx, 'specification', e.target.value)}
                              className="w-full font-medium text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                            />
                          </td>
                        </>
                      )}
                      <td className="p-1 text-center print:hidden">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveFluropolymerRow(rIdx, 'up')}
                            disabled={rIdx === 0}
                            title="Move Up"
                            className="p-0.5 text-slate-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFluropolymerRow(rIdx, 'down')}
                            disabled={rIdx === fluropolymerData.rows.length - 1}
                            title="Move Down"
                            className="p-0.5 text-slate-500 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateFluropolymerRow(rIdx, 'isFullWidth', !row.isFullWidth)}
                            title={row.isFullWidth ? "Standard 2-Column" : "Full Width Row"}
                            className={`p-0.5 text-[8px] font-bold rounded cursor-pointer ${row.isFullWidth ? 'text-amber-700 bg-amber-100' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            W
                          </button>
                          <button
                            type="button"
                            onClick={() => addFluropolymerRow(rIdx)}
                            title="Insert Row Below"
                            className="p-0.5 text-slate-500 hover:text-emerald-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFluropolymerRow(rIdx)}
                            disabled={fluropolymerData.rows.length <= 1}
                            title="Delete Row"
                            className="p-0.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. OFFICIAL CERTIFICATION & REMARKS */}
            <div className="border border-black bg-slate-50/50 p-1.5 space-y-1 text-[9.5px]">
              <div>
                <textarea
                  rows={2}
                  value={fluropolymerData.certificationText}
                  onChange={(e) => updateFluropolymerField('certificationText', e.target.value)}
                  className="w-full p-1 bg-white border border-slate-300 font-bold uppercase text-[9px] text-black focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                  placeholder="Certification text..."
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black uppercase text-black shrink-0">REMARKS:</span>
                <input
                  type="text"
                  value={fluropolymerData.remarks}
                  onChange={(e) => updateFluropolymerField('remarks', e.target.value)}
                  className="w-full p-0.5 font-bold uppercase text-[9.5px] text-black bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded"
                  placeholder="CHECKED & FOUND ACCEPTABLE."
                />
              </div>
            </div>
          </div>
        ) : isCoo ? (
          /* COUNTRY OF ORIGIN (COO) CERTIFICATE INTERACTIVE CANVAS */
          <div className="space-y-1.5">
            {/* COO ITEMS TABLE */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[5%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[23%] text-left px-2">DESCRIPTION OF GOODS</th>
                      <th className="border-r border-black p-1 w-[13%]">SIZE / DIMENSION</th>
                      <th className="border-r border-black p-1 w-[8%]">QTY</th>
                      <th className="border-r border-black p-1 w-[14%]">HEAT / BATCH NO.</th>
                      <th className="border-r border-black p-1 w-[8%]">ORIGIN</th>
                      <th className="border-r border-black p-1 w-[24%]">MANUFACTURER</th>
                      <th className="p-1 w-[5%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* SL NO */}
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                          {idx + 1}
                        </td>
                        {/* DESCRIPTION */}
                        <td className={`border-r border-black p-0.5 px-1.5 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={item.description && item.description.length > 50 ? 2 : 1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-left font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                            placeholder=""
                          />
                        </td>
                        {/* SIZE */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-semibold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* QTY */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* HEAT / BATCH NO */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-heatNo`}
                            type="text"
                            value={item.heatNo || ''}
                            onChange={(e) => handleCellChange(idx, 'heatNo', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'heatNo')}
                            onPaste={(e) => handlePaste(e, idx, 'heatNo')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-semibold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* ORIGIN */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* MANUFACTURER */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 5) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-remark`}
                            type="text"
                            value={item.manufacturer !== undefined ? item.manufacturer : (item.remark || '')}
                            onChange={(e) => {
                              handleCellChange(idx, 'manufacturer', e.target.value);
                              handleCellChange(idx, 'remark', e.target.value);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'remark')}
                            onPaste={(e) => handlePaste(e, idx, 'remark')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 5, endRow: idx, endCol: 5 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9px] sm:text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded leading-tight"
                            placeholder=""
                          />
                        </td>
                        {/* ACTIONS */}
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              title="Add row below"
                              className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              disabled={formData.items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ROW TOOLBAR */}
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-t-0 border-black print:hidden">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(1)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> +1 Item
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(5)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-700 hover:bg-slate-800 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> +5 Items
                  </button>
                </div>
                <span className="text-[9px] font-bold text-slate-500">
                  Total Items: {formData.items.length}
                </span>
              </div>
            </div>

            {/* 3. DECLARATION CLAUSE & ORIGIN CERTIFICATION */}
            <div className="border border-black bg-white p-2 space-y-1 text-[9.5px]">
              <div>
                <div className="font-black uppercase text-[9px] text-black mb-0.5">Official Declaration & Origin Certification:</div>
                <textarea
                  rows={3}
                  value={cooData.declarationClause}
                  onChange={(e) => updateCooField('declarationClause', e.target.value)}
                  className="w-full p-1 bg-slate-50 border border-slate-300 font-medium text-[9px] text-black focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                  placeholder="Declaration clause..."
                />
              </div>
            </div>
          </div>
        ) : isCoc ? (
          /* CERTIFICATE OF CONFORMITY (COC) INTERACTIVE CANVAS */
          <div className="space-y-3">
            {/* 1. INTRODUCTORY CERTIFICATION DECLARATION BOX */}
            <div className="border border-black bg-white p-2.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-black border-b border-slate-200 pb-1">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider font-mono text-[8.5px]">CERTIFICATION DECLARATION STATEMENT</span>
                  <span className="text-[7.5px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Supplier & Customer Bolded</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const activeComp = getActiveCompany();
                      const company = formData.companyName || activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
                      const customer = formData.customerName || 'Cabtech Trading & Contracting WLL';
                      let cur = cocData.introText;
                      if (!cur.includes(`**${company}**`) && cur.includes(company)) {
                        cur = cur.replace(company, `**${company}**`);
                      }
                      if (!cur.includes(`**${customer}**`) && cur.includes(customer)) {
                        cur = cur.replace(customer, `**${customer}**`);
                      }
                      setFormData(prev => ({
                        ...prev,
                        certificationText: cur,
                        cocData: { ...((prev as any).cocData || {}), introText: cur }
                      }));
                    }}
                    className="text-blue-700 hover:text-blue-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                    title="Wrap Supplier and Customer in **bold**"
                  >
                    Bold Names (**)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeComp = getActiveCompany();
                      const company = formData.companyName || activeComp.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
                      const customer = formData.customerName || 'Cabtech Trading & Contracting WLL';
                      const po = formData.customerPoNum || 'PO/24/01-004328';
                      const date = formData.date || new Date().toLocaleDateString('en-GB');
                      const defaultIntro = `We hereby certify that **${company}** has supplied the material dated ${date} to **${customer}** as specified in the Purchase Order No: ${po}`;
                      setFormData(prev => ({
                        ...prev,
                        certificationText: defaultIntro,
                        cocData: { ...((prev as any).cocData || {}), introText: defaultIntro }
                      }));
                    }}
                    className="text-amber-700 hover:text-amber-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={cocData.introText}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    certificationText: val,
                    cocData: { ...((prev as any).cocData || {}), introText: val }
                  }));
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 font-medium text-[10px] text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed text-center"
                placeholder="We hereby certify that..."
              />
              {/* LIVE FORMATTED PREVIEW SHOWING SUPPLIER & CUSTOMER IN BOLD */}
              <div className="px-2 py-1 bg-amber-50/40 border border-amber-200/50 rounded text-[9.5px] leading-relaxed text-center font-medium text-slate-800">
                <span className="text-[7.5px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">Live Document Preview (Supplier & Customer Bolded):</span>
                {renderDeclarationWithBolds(cocData.introText, formData.companyName, formData.customerName)}
              </div>
            </div>

            {/* 2. COC CONSIGNMENT ITEMS TABLE (EXCEL-STYLE INTERACTION) */}
            <div className="space-y-1">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[7%]">ITEM NO.</th>
                      <th className="border-r border-black p-1 w-[37%] text-left px-2">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[18%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[12%]">FINISH</th>
                      <th className="border-r border-black p-1 w-[10%]">QTY</th>
                      <th className="border-r border-black p-1 w-[16%]">HEAT NO.</th>
                      <th className="p-1 w-[5%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* ITEM NO */}
                        <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[10px]">
                          {idx + 1}
                        </td>
                        {/* DESCRIPTION */}
                        <td className={`border-r border-black p-0.5 px-1.5 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={item.description && item.description.length > 40 ? 2 : 1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-left font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                            placeholder=""
                          />
                        </td>
                        {/* DIMENSIONAL SPEC */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* FINISH */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* QTY */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* HEAT NO */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-heatNo`}
                            type="text"
                            value={item.heatNo || ''}
                            onChange={(e) => handleCellChange(idx, 'heatNo', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'heatNo')}
                            onPaste={(e) => handlePaste(e, idx, 'heatNo')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-semibold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* ROW ACTIONS */}
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              title="Add row below"
                              className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              disabled={formData.items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* QUICK TABLE ACTION BUTTONS */}
              <div className="flex items-center justify-between text-[9px] print:hidden px-1 py-0.5 bg-slate-50 border border-t-0 border-black">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(1)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(5)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> +5 Rows
                  </button>
                </div>
                <div className="text-slate-500 font-bold text-[9px]">
                  Total Items: {formData.items.length}
                </div>
              </div>
            </div>

            {/* 3. CONFORMANCE & INSPECTION CLAUSE */}
            <div className="border border-black bg-white p-2.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-black border-b border-slate-200 pb-1">
                <span className="uppercase tracking-wider">CONFORMANCE & TESTING STATEMENT</span>
                <button
                  type="button"
                  onClick={() => {
                    const activeComp = getActiveCompany();
                    const compName = activeComp.name || 'Marine Fasteners Industries L.L.C.';
                    const defaultConformance = `Fasteners manufactured in UAE, ${compName} are sampled, tested and inspected in accordance with the above specification and meets all of its requirements.`;
                    setFormData(prev => ({
                      ...prev,
                      additionalNotes: defaultConformance,
                      cocData: { ...((prev as any).cocData || {}), conformanceText: defaultConformance }
                    }));
                  }}
                  className="text-amber-700 hover:text-amber-900 text-[8.5px] hover:underline cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                rows={2}
                value={cocData.conformanceText}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    additionalNotes: val,
                    cocData: { ...((prev as any).cocData || {}), conformanceText: val }
                  }));
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 font-medium text-[10px] text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed text-center"
                placeholder="Fasteners manufactured in UAE..."
              />
            </div>
          </div>
        ) : isCompliance ? (
          /* COMPLIANCE REPORT / LETTER OF COMPLIANCE INTERACTIVE CANVAS */
          <div className="space-y-2">
            {/* 1. INTRODUCTORY CERTIFICATION DECLARATION BOX */}
            <div className="border border-black bg-white p-2 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-black border-b border-slate-200 pb-0.5">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider font-mono text-[8.5px]">CERTIFICATION DECLARATION STATEMENT</span>
                  <span className="text-[7.5px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Supplier & Customer Bolded</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const activeComp = getActiveCompany();
                      const company = formData.companyName || activeComp.name || 'Marine Fasteners Industries L.L.C Ajman U.A.E';
                      const customer = formData.customerName || 'HEAVY ENGINEERING INDUSTRIES AND SHIPBUILDING';
                      let cur = complianceData.introText;
                      if (!cur.includes(`**${company}**`) && cur.includes(company)) {
                        cur = cur.replace(company, `**${company}**`);
                      }
                      if (!cur.includes(`**${customer}**`) && cur.includes(customer)) {
                        cur = cur.replace(customer, `**${customer}**`);
                      }
                      setFormData(prev => ({
                        ...prev,
                        certificationText: cur,
                        complianceData: { ...((prev as any).complianceData || {}), introText: cur }
                      }));
                    }}
                    className="text-blue-700 hover:text-blue-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                    title="Wrap Supplier and Customer in **bold**"
                  >
                    Bold Names (**)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeComp = getActiveCompany();
                      const company = formData.companyName || activeComp.name || 'Marine Fasteners Industries L.L.C Ajman U.A.E';
                      const customer = formData.customerName || 'HEAVY ENGINEERING INDUSTRIES AND SHIPBUILDING';
                      const wo = formData.workOrderNum || 'MF24254';
                      const inv = formData.invoiceNum || 'MFI_2400354';
                      const defaultIntro = `We hereby certify that **${company}** has supplied the material against Work order Ref: ${wo} to **${customer}** as specified in the Invoice No. ${inv}`;
                      setFormData(prev => ({
                        ...prev,
                        certificationText: defaultIntro,
                        complianceData: { ...((prev as any).complianceData || {}), introText: defaultIntro }
                      }));
                    }}
                    className="text-amber-700 hover:text-amber-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={complianceData.introText}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    certificationText: val,
                    complianceData: { ...((prev as any).complianceData || {}), introText: val }
                  }));
                }}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 font-medium text-[10px] text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed text-center"
                placeholder="We hereby certify that..."
              />
              {/* LIVE FORMATTED PREVIEW SHOWING SUPPLIER & CUSTOMER IN BOLD */}
              <div className="px-2 py-1 bg-amber-50/40 border border-amber-200/50 rounded text-[9.5px] leading-relaxed text-center font-medium text-slate-800">
                <span className="text-[7.5px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">Live Document Preview (Supplier & Customer Bolded):</span>
                {renderDeclarationWithBolds(complianceData.introText, formData.companyName, formData.customerName)}
              </div>
            </div>

            {/* 2. COMPLIANCE CONSIGNMENT ITEMS TABLE (6 COLUMNS WITH FULL EXCEL NAVIGATION & MULTI-CELL SELECTION) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[6%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[40%] text-left px-2">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[16%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[18%]">STANDARD</th>
                      <th className="border-r border-black p-1 w-[10%]">FINISH</th>
                      <th className="border-r border-black p-1 w-[10%]">QTY</th>
                      <th className="p-1 w-[5%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* SL. NO. */}
                        <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[10px]">
                          {idx + 1}
                        </td>
                        {/* DESCRIPTION (COL 0) */}
                        <td className={`border-r border-black p-0.5 px-1.5 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={item.description && item.description.length > 40 ? 2 : 1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-left font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                            placeholder=""
                          />
                        </td>
                        {/* SIZE (COL 1) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* STANDARD (COL 2) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-standard`}
                            type="text"
                            value={item.standard || ''}
                            onChange={(e) => handleCellChange(idx, 'standard', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'standard')}
                            onPaste={(e) => handlePaste(e, idx, 'standard')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-semibold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* FINISH (COL 3) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* QTY (COL 4) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* ROW ACTIONS */}
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              title="Add row below"
                              className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              disabled={formData.items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* QUICK TABLE ACTION BUTTONS */}
              <div className="flex items-center justify-between text-[9px] print:hidden px-1 py-0.5 bg-slate-50 border border-t-0 border-black">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(1)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(5)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> +5 Rows
                  </button>
                </div>
                <div className="text-slate-500 font-bold text-[9px]">
                  Total Items: {formData.items.length}
                </div>
              </div>
            </div>

            {/* 3. CONFORMANCE & COMPLIANCE CLAUSE */}
            <div className="border border-black bg-white p-2 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-black border-b border-slate-200 pb-0.5">
                <span className="uppercase tracking-wider font-mono text-[8.5px]">COMPLIANCE & SPECIFICATION STATEMENT</span>
                <button
                  type="button"
                  onClick={() => {
                    const defaultConformance = `The above material complies with the scpecification mentioned in the above purchase order`;
                    setFormData(prev => ({
                      ...prev,
                      additionalNotes: defaultConformance,
                      complianceData: { ...((prev as any).complianceData || {}), conformanceText: defaultConformance }
                    }));
                  }}
                  className="text-amber-700 hover:text-amber-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                rows={2}
                value={complianceData.conformanceText}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    additionalNotes: val,
                    complianceData: { ...((prev as any).complianceData || {}), conformanceText: val }
                  }));
                }}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 font-medium text-[10px] text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed text-center"
                placeholder="The above material complies with..."
              />
            </div>
          </div>
        ) : isWarranty ? (
          /* WARRANTY CERTIFICATE INTERACTIVE CANVAS */
          <div className="space-y-2">
            {/* 1. INTRODUCTORY WARRANTY DECLARATION BOX */}
            <div className="border border-black bg-white p-2 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-black border-b border-slate-200 pb-0.5">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider font-mono text-[8.5px]">WARRANTY DECLARATION CLAUSE</span>
                  <span className="text-[7.5px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Supplier Bolded</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const activeComp = getActiveCompany();
                      const company = formData.companyName || activeComp.name || 'Marine Fasteners Industries L.L.C Ajman U.A.E';
                      let cur = warrantyData.introText;
                      if (!cur.includes(`**${company}**`) && cur.includes(company)) {
                        cur = cur.replace(company, `**${company}**`);
                      }
                      setFormData(prev => ({
                        ...prev,
                        certificationText: cur,
                        warrantyData: { ...((prev as any).warrantyData || {}), introText: cur }
                      }));
                    }}
                    className="text-blue-700 hover:text-blue-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                    title="Wrap Supplier in **bold**"
                  >
                    Bold Names (**)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const activeComp = getActiveCompany();
                      const company = formData.companyName || activeComp.name || 'Marine Fasteners Industries L.L.C Ajman U.A.E';
                      const defaultIntro = `We M/s. **${company}** warrant that everything furnished here under shall be free from defects and faults in design, material, workmanship and manufacture and shall be of the highest grade and consistent with the established and generally accepted standard for goods of the type ordered and in full conformity, with the PO specifications.`;
                      setFormData(prev => ({
                        ...prev,
                        certificationText: defaultIntro,
                        warrantyData: { ...((prev as any).warrantyData || {}), introText: defaultIntro }
                      }));
                    }}
                    className="text-amber-700 hover:text-amber-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={warrantyData.introText}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    certificationText: val,
                    warrantyData: { ...((prev as any).warrantyData || {}), introText: val }
                  }));
                }}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 font-medium text-[10px] text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed text-center"
                placeholder="We M/s. Warrant that..."
              />
              {/* LIVE FORMATTED PREVIEW SHOWING SUPPLIER & CUSTOMER IN BOLD */}
              <div className="px-2 py-1 bg-amber-50/40 border border-amber-200/50 rounded text-[9.5px] leading-relaxed text-center font-medium text-slate-800">
                <span className="text-[7.5px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">Live Document Preview (Supplier Bolded):</span>
                {renderDeclarationWithBolds(warrantyData.introText, formData.companyName, formData.customerName)}
              </div>
            </div>

            {/* 2. WARRANTY CONSIGNMENT ITEMS TABLE (6 COLUMNS: ITEM NO., DESCRIPTION, SIZE, FINISH, QTY, HEAT NO.) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[7%]">ITEM NO.</th>
                      <th className="border-r border-black p-1 w-[45%] text-left px-2">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[16%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[10%]">FINISH</th>
                      <th className="border-r border-black p-1 w-[9%]">QTY</th>
                      <th className="border-r border-black p-1 w-[13%]">HEAT NO.</th>
                      <th className="p-1 w-[5%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* ITEM NO. */}
                        <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[10px]">
                          {idx + 1}
                        </td>
                        {/* DESCRIPTION (COL 0) */}
                        <td className={`border-r border-black p-0.5 px-1.5 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={item.description && item.description.length > 35 ? 2 : 1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-left font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                            placeholder=""
                          />
                        </td>
                        {/* SIZE (COL 1) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* FINISH (COL 2) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* QTY (COL 3) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* HEAT NO. (COL 4) */}
                        <td className={`border-r border-black p-0.5 ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-heatNo`}
                            type="text"
                            value={item.heatNo || ''}
                            onChange={(e) => handleCellChange(idx, 'heatNo', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'heatNo')}
                            onPaste={(e) => handlePaste(e, idx, 'heatNo')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[10px] text-center font-semibold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* ROW ACTIONS */}
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              title="Add row below"
                              className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              disabled={formData.items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* QUICK TABLE ACTION BUTTONS */}
              <div className="flex items-center justify-between text-[9px] print:hidden px-1 py-0.5 bg-slate-50 border border-t-0 border-black">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(1)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(5)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> +5 Rows
                  </button>
                </div>
                <div className="text-slate-500 font-bold text-[9px]">
                  Total Items: {formData.items.length}
                </div>
              </div>
            </div>

            {/* 3. WARRANTY PERIOD & POLICY CLAUSE */}
            <div className="border border-black bg-white p-2 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[9px] text-slate-700 font-black border-b border-slate-200 pb-0.5">
                <span className="uppercase tracking-wider font-mono text-[8.5px]">WARRANTY PERIOD & TERMS CLAUSE</span>
                <button
                  type="button"
                  onClick={() => {
                    const defaultPeriod = `The fasteners are warranted for 12 months from the date of supply as per general terms & conditions above purchase order.`;
                    setFormData(prev => ({
                      ...prev,
                      additionalNotes: defaultPeriod,
                      warrantyData: { ...((prev as any).warrantyData || {}), warrantyPeriodText: defaultPeriod }
                    }));
                  }}
                  className="text-amber-700 hover:text-amber-900 text-[8.5px] font-bold hover:underline cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                rows={2}
                value={warrantyData.warrantyPeriodText}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    additionalNotes: val,
                    warrantyData: { ...((prev as any).warrantyData || {}), warrantyPeriodText: val }
                  }));
                }}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 font-medium text-[10px] text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed text-center"
                placeholder="The fasteners are warranted for 12 months..."
              />
            </div>
          </div>
        ) : isInspection ? (
          /* QUALITY INSPECTION REPORT (EXCEL-STYLE INTERACTION, DRAWING & PARAMETERS) */
          <div className="space-y-1.5">
            {/* 1. INSPECTION CRITERIA & METADATA BAR */}
            <div className="border border-black bg-white text-[9.5px]">
              <div className="bg-slate-100 border-b border-black px-2 py-0.5 font-black text-black text-[9.5px] uppercase tracking-wide flex items-center justify-between">
                <span>INSPECTION STANDARD & SAMPLING CRITERIA</span>
                <span className="text-[8.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                  EXCEL-LIKE NAVIGATION & PARAMETER VALIDATION
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-black">
                <div className="p-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="flex items-center gap-1 font-bold text-[8px] text-slate-700 uppercase cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(inspectionData.showInspectionStandard)}
                        onChange={(e) => updateInspectionField('showInspectionStandard', e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0 w-3 h-3 cursor-pointer"
                      />
                      <span>Inspection Standard:</span>
                    </label>
                    <span className="text-[7px] font-semibold text-slate-500">{inspectionData.showInspectionStandard ? 'Active' : 'Unchecked'}</span>
                  </div>
                  <input
                    type="text"
                    value={inspectionData.inspectionStandard}
                    onChange={(e) => updateInspectionField('inspectionStandard', e.target.value)}
                    className={`w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded ${!inspectionData.showInspectionStandard ? 'opacity-70' : ''}`}
                    placeholder="ISO 3269 / ASME B18.18 / ISO 2859-1"
                  />
                </div>
                <div className="p-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="flex items-center gap-1 font-bold text-[8px] text-slate-700 uppercase cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(inspectionData.showSamplingPlan)}
                        onChange={(e) => updateInspectionField('showSamplingPlan', e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0 w-3 h-3 cursor-pointer"
                      />
                      <span>Sampling Plan / Level:</span>
                    </label>
                    <span className="text-[7px] font-semibold text-slate-500">{inspectionData.showSamplingPlan ? 'Active' : 'Unchecked'}</span>
                  </div>
                  <input
                    type="text"
                    value={inspectionData.samplingPlan}
                    onChange={(e) => updateInspectionField('samplingPlan', e.target.value)}
                    className={`w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded ${!inspectionData.showSamplingPlan ? 'opacity-70' : ''}`}
                    placeholder="ISO 2859-1 Level II / AQL 1.0"
                  />
                </div>
                <div className="p-1">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Inspection Stage:</div>
                  <input
                    type="text"
                    value={inspectionData.inspectionStage}
                    onChange={(e) => updateInspectionField('inspectionStage', e.target.value)}
                    className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="FINAL PRE-SHIPMENT INSPECTION"
                  />
                </div>
                <div className="p-1">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Overall Disposition:</div>
                  <input
                    type="text"
                    value={inspectionData.dispositionStatus}
                    onChange={(e) => updateInspectionField('dispositionStatus', e.target.value)}
                    className="w-full font-black text-[9.5px] text-emerald-700 bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="CONFORMING / ACCEPTED FOR DISPATCH"
                  />
                </div>
              </div>
            </div>

            {/* 2. CONSIGNMENT ITEMS TABLE: EXCEL-LIKE WITH COMPLETE KEYBOARD NAVIGATION & RANGE SELECTION */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9px] leading-tight">
                      <th className="border-r border-black p-1 w-[4%]">SL</th>
                      <th className="border-r border-black p-1 w-[24%] text-left px-2">ITEM DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[10%] text-center px-1">GRADE</th>
                      <th className="border-r border-black p-1 w-[12%] text-center px-1">SIZE</th>
                      <th className="border-r border-black p-1 w-[8%] text-center px-1">UNIT</th>
                      <th className="border-r border-black p-1 w-[11%] text-center px-1">ORDERED QTY</th>
                      <th className="border-r border-black p-1 w-[11%] text-center px-1">SUPPLIED QTY</th>
                      <th className="border-r border-black p-1 w-[10%] text-center px-1">SHORTAGE</th>
                      <th className="border-r border-black p-1 w-[10%] text-center px-1">MARKING</th>
                      <th className="p-1 w-[4%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/30 transition-colors group">
                        {/* SL NO */}
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">
                          {idx + 1}
                        </td>
                        {/* ITEM DESCRIPTION (Col 0) */}
                        <td className={`border-r border-black p-0.5 px-1 text-left ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-description`}
                            type="text"
                            value={item.description ?? ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 0, endRow: idx, endCol: 0 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9px] text-left font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded leading-tight"
                            placeholder=""
                          />
                        </td>
                        {/* GRADE (Col 1) */}
                        <td className={`border-r border-black p-0.5 px-1 text-center ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish ?? ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 1, endRow: idx, endCol: 1 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* SIZE (Col 2) */}
                        <td className={`border-r border-black p-0.5 px-1 text-center ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size ?? ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 2, endRow: idx, endCol: 2 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[9px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* UNIT (Col 3) */}
                        <td className={`border-r border-black p-0.5 px-1 text-center ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-standard`}
                            type="text"
                            value={item.standard ?? ''}
                            onChange={(e) => handleCellChange(idx, 'standard', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'standard')}
                            onPaste={(e) => handlePaste(e, idx, 'standard')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 3, endRow: idx, endCol: 3 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[8.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* ORDERED QTY (Col 4) */}
                        <td className={`border-r border-black p-0.5 text-center ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-orderedQty`}
                            type="text"
                            value={item.orderedQty ?? ''}
                            onChange={(e) => handleCellChange(idx, 'orderedQty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'orderedQty')}
                            onPaste={(e) => handlePaste(e, idx, 'orderedQty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 4, endRow: idx, endCol: 4 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[8.5px] text-center font-semibold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* SUPPLIED QTY (Col 5) */}
                        <td className={`border-r border-black p-0.5 text-center ${isCellSelected(idx, 5) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty ?? ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 5, endRow: idx, endCol: 5 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[8.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* SHORTAGE (Col 6) */}
                        <td className={`border-r border-black p-0.5 text-center ${isCellSelected(idx, 6) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <input
                            id={`spec-cell-${idx}-observedCoating`}
                            type="text"
                            value={item.observedCoating ?? ''}
                            onChange={(e) => handleCellChange(idx, 'observedCoating', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'observedCoating')}
                            onPaste={(e) => handlePaste(e, idx, 'observedCoating')}
                            onClick={() => setSelectedCells({ startRow: idx, startCol: 6, endRow: idx, endCol: 6 })}
                            className="w-full p-0.5 bg-transparent border-0 text-[8.5px] text-center font-bold text-slate-800 uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                            placeholder=""
                          />
                        </td>
                        {/* MARKING (Col 7) - TEXT + IMAGE UPLOAD (SIDE BY SIDE) */}
                        <td className={`border-r border-black p-0.5 text-center ${isCellSelected(idx, 7) ? 'bg-blue-100 ring-2 ring-blue-500' : ''}`}>
                          <div className="flex items-center gap-1 justify-center px-0.5">
                            {item.markingImage ? (
                              <div className="relative group/mimg shrink-0">
                                <img
                                  src={item.markingImage}
                                  alt="Marking Stamp"
                                  className="w-4 h-4 object-contain rounded border border-slate-300 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formData.items];
                                    updated[idx] = { ...updated[idx], markingImage: undefined };
                                    setFormData({ ...formData, items: updated });
                                  }}
                                  className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[5px] opacity-0 group-hover/mimg:opacity-100 transition-opacity print:hidden cursor-pointer"
                                  title="Remove marking image"
                                >
                                  <Trash2 className="w-2 h-2" />
                                </button>
                              </div>
                            ) : (
                              <label className="p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer shrink-0 print:hidden" title="Upload marking stamp photo">
                                <ImageIcon className="w-3 h-3" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (re) => {
                                        const resUrl = re.target?.result as string;
                                        if (resUrl) {
                                          const updated = [...formData.items];
                                          updated[idx] = { ...updated[idx], markingImage: resUrl };
                                          setFormData({ ...formData, items: updated });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                            <input
                              id={`spec-cell-${idx}-marking`}
                              type="text"
                              value={item.marking ?? ''}
                              onChange={(e) => handleCellChange(idx, 'marking', e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, idx, 'marking')}
                              onPaste={(e) => handlePaste(e, idx, 'marking')}
                              onClick={() => setSelectedCells({ startRow: idx, startCol: 7, endRow: idx, endCol: 7 })}
                              className="w-full p-0.5 bg-transparent border-0 text-[8.5px] text-center font-black text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded min-w-[35px]"
                              placeholder=""
                            />
                          </div>
                        </td>
                        {/* ACTIONS */}
                        <td className="p-0.5 text-center print:hidden">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              title="Add row below"
                              className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              disabled={formData.items.length <= 1}
                              title="Delete row"
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ROW TOOLBAR WITH EXCEL CONTROLS */}
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-t-0 border-black print:hidden">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(1)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> +1 Item
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddMultipleRows(5)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-700 hover:bg-slate-800 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> +5 Items
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedItems = [...formData.items];
                      if (selectedCells) {
                        const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
                        const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
                        const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
                        const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);
                        if (maxR > minR) {
                          for (let r = minR + 1; r <= maxR; r++) {
                            for (let c = minC; c <= maxC; c++) {
                              const cKey = specCols[c];
                              if (cKey) {
                                (updatedItems[r] as any)[cKey] = (updatedItems[minR] as any)?.[cKey] || '';
                              }
                            }
                          }
                        }
                      } else if (formData.items.length > 1) {
                        for (let r = 1; r < updatedItems.length; r++) {
                          specCols.forEach(cKey => {
                            if (!(updatedItems[r] as any)?.[cKey]) {
                              (updatedItems[r] as any)[cKey] = (updatedItems[0] as any)?.[cKey] || '';
                            }
                          });
                        }
                      }
                      setFormData({ ...formData, items: updatedItems });
                    }}
                    className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                    title="Fill Down values from top row (Ctrl+D)"
                  >
                    <ArrowDown className="w-3 h-3" /> Fill Down (Ctrl+D)
                  </button>
                  {selectedCells && (
                    <button
                      type="button"
                      onClick={() => setSelectedCells(null)}
                      className="text-[8.5px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Clear Selection (Esc)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8.5px] text-slate-500 font-medium hidden sm:inline">
                    Shortcuts: <kbd className="bg-white border px-1 py-0.2 rounded font-mono text-[8px]">Tab</kbd> / <kbd className="bg-white border px-1 py-0.2 rounded font-mono text-[8px]">Arrows</kbd> / <kbd className="bg-white border px-1 py-0.2 rounded font-mono text-[8px]">Ctrl+D</kbd> / <kbd className="bg-white border px-1 py-0.2 rounded font-mono text-[8px]">Ctrl+C</kbd> / <kbd className="bg-white border px-1 py-0.2 rounded font-mono text-[8px]">Ctrl+V</kbd>
                  </span>
                  <span className="text-[9px] font-bold text-slate-700">
                    Total Items: {formData.items.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. TECHNICAL DRAWING & HEAD MARKING BIG IMAGE BOXES + MULTI-PHOTO SUPPORT */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 border border-black rounded-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-[9.5px] uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                    INSPECTION DRAWINGS & VISUAL VERIFICATION PHOTOS
                  </span>
                  <span className="text-[8px] font-black text-emerald-800 bg-emerald-100 border border-emerald-400 px-2 py-0.5 rounded shadow-2xs">
                    HIGH-RES PDF ENLARGED
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-[8.5px]">
                    <span className="font-bold text-slate-700">PDF Image Size:</span>
                    {(['standard', 'large', 'extralarge', 'full'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateInspectionField('pdfImageSize', sz)}
                        className={`px-1.5 py-0.2 rounded font-black text-[8px] uppercase transition-all ${
                          (inspectionData.pdfImageSize || 'extralarge') === sz
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sz === 'standard' ? 'Normal (240px)' : sz === 'large' ? 'Large (300px)' : sz === 'extralarge' ? 'XL (360px)' : 'Giant (400px)'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addAdditionalPhoto('Inspection Photo')}
                    className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> + Add Photo
                  </button>
                  <label className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-800 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(inspectionData.moveCharacteristicsToPage2 || (inspectionData.additionalPhotos && inspectionData.additionalPhotos.length > 0))}
                      onChange={(e) => updateInspectionField('moveCharacteristicsToPage2', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Move Characteristics Matrix to Page 2</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-[9px]">
                {/* BIG BOX 1: TECHNICAL DRAWING & SPECIFICATION */}
                <div className="border border-black bg-white overflow-hidden flex flex-col shadow-xs">
                  <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 flex items-center justify-between">
                    <span className="uppercase tracking-wide font-black text-[9.5px] flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                      TECHNICAL DRAWING & SPECIFICATION
                    </span>
                    <div className="flex items-center gap-1.5 print:hidden">
                      <label className="cursor-pointer text-[8px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-300 hover:border-blue-400 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload Drawing</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = ev.target?.result as string;
                                if (base64) updateInspectionField('drawingImageUrl', base64);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {inspectionData.drawingImageUrl && (
                        <button
                          type="button"
                          onClick={() => updateInspectionField('drawingImageUrl', '')}
                          className="text-[8px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2 flex-1 flex flex-col">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="font-bold text-[8px] text-slate-700 uppercase shrink-0">Drawing / Spec No:</span>
                        <input
                          type="text"
                          value={inspectionData.drawingNumber}
                          onChange={(e) => updateInspectionField('drawingNumber', e.target.value)}
                          className="flex-1 font-bold text-[8.5px] text-black bg-slate-50 border border-slate-300 p-0.5 px-1 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                          placeholder="DWG-MFI-QC-001 / DIN 934"
                        />
                      </div>
                    </div>

                    {/* LARGE DRAWING IMAGE CONTAINER */}
                    <div className="flex-1 border-2 border-dashed border-slate-300 rounded bg-slate-50/50 flex flex-col items-center justify-center p-2 min-h-[300px] max-h-[420px] overflow-hidden">
                      {inspectionData.drawingImageUrl ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center group">
                          <img
                            src={inspectionData.drawingImageUrl}
                            alt="Inspection Drawing"
                            className="max-h-[360px] w-auto max-w-full object-contain rounded border border-slate-200 shadow-sm bg-white"
                          />
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center text-center p-6 text-slate-400 cursor-pointer hover:bg-slate-100/70 w-full h-full rounded transition-colors">
                          <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2" />
                          <span className="text-[9.5px] font-black text-slate-700 uppercase">CLICK TO UPLOAD TECHNICAL DRAWING</span>
                          <span className="text-[8px] text-slate-500 mt-0.5">Renders at high-definition large scale in PDF print view</span>
                          <span className="text-[7.5px] text-slate-400 mt-1">Supports PNG, JPG, WEBP formats</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const base64 = ev.target?.result as string;
                                  if (base64) updateInspectionField('drawingImageUrl', base64);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* BIG BOX 2: TECHNICAL DRAWING & SPECIFICATION */}
                <div className="border border-black bg-white overflow-hidden flex flex-col shadow-xs">
                  <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 flex items-center justify-between">
                    <span className="uppercase tracking-wide font-black text-[9.5px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      TECHNICAL DRAWING & SPECIFICATION
                    </span>
                    <div className="flex items-center gap-1.5 print:hidden">
                      <label className="cursor-pointer text-[8px] font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-300 hover:border-emerald-400 px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload Drawing / Spec</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = ev.target?.result as string;
                                if (base64) updateInspectionField('markingImageUrl', base64);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {inspectionData.markingImageUrl && (
                        <button
                          type="button"
                          onClick={() => updateInspectionField('markingImageUrl', '')}
                          className="text-[8px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2 flex-1 flex flex-col">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="font-bold text-[8px] text-slate-700 uppercase shrink-0">Specification / Designation:</span>
                        <input
                          type="text"
                          value={inspectionData.markingText}
                          onChange={(e) => updateInspectionField('markingText', e.target.value)}
                          className="flex-1 font-black text-[8.5px] text-emerald-900 bg-slate-50 border border-slate-300 p-0.5 px-1 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded uppercase"
                          placeholder="MFI 8 / MFI B7 / 2H / DIN 934"
                        />
                      </div>
                      <span className="text-[7.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                        CONFORMING
                      </span>
                    </div>

                    {/* LARGE MARKING IMAGE CONTAINER */}
                    <div className="flex-1 border-2 border-dashed border-slate-300 rounded bg-slate-50/50 flex flex-col items-center justify-center p-2 min-h-[300px] max-h-[420px] overflow-hidden">
                      {inspectionData.markingImageUrl ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center group">
                          <img
                            src={inspectionData.markingImageUrl}
                            alt="Product Specification Drawing"
                            className="max-h-[360px] w-auto max-w-full object-contain rounded border border-slate-200 shadow-sm bg-white"
                          />
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center text-center p-6 text-slate-400 cursor-pointer hover:bg-slate-100/70 w-full h-full rounded transition-colors">
                          <Camera className="w-12 h-12 text-slate-300 mb-2" />
                          <span className="text-[9.5px] font-black text-slate-700 uppercase">CLICK TO UPLOAD TECHNICAL DRAWING / SPECIFICATION PHOTO</span>
                          <span className="text-[8px] text-slate-500 mt-0.5">Renders at high-definition large scale in PDF print view</span>
                          <span className="text-[7.5px] text-slate-400 mt-1">Supports high-resolution close-up inspection photos</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const base64 = ev.target?.result as string;
                                  if (base64) updateInspectionField('markingImageUrl', base64);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDITIONAL INSPECTION PHOTOS GALLERY */}
              {inspectionData.additionalPhotos && inspectionData.additionalPhotos.length > 0 && (
                <div className="border border-black bg-white p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[9px] uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      ADDITIONAL INSPECTION PHOTOS ({inspectionData.additionalPhotos.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => addAdditionalPhoto('Inspection Photo')}
                      className="inline-flex items-center gap-1 text-[8px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded shadow-xs cursor-pointer print:hidden"
                    >
                      <Plus className="w-2.5 h-2.5" /> + Add Another Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {inspectionData.additionalPhotos.map((photo, pIdx) => (
                      <div key={photo.id || pIdx} className="border border-slate-300 rounded p-1.5 bg-slate-50 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={photo.title}
                            onChange={(e) => updateAdditionalPhoto(pIdx, 'title', e.target.value)}
                            className="flex-1 font-bold text-[8.5px] text-slate-800 bg-white border border-slate-200 p-0.5 px-1 rounded uppercase"
                            placeholder="Photo Title / Description"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalPhoto(pIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer print:hidden"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="border border-dashed border-slate-300 rounded bg-white min-h-[140px] max-h-[180px] flex items-center justify-center p-1 overflow-hidden">
                          {photo.imageUrl ? (
                            <img
                              src={photo.imageUrl}
                              alt={photo.title || 'Inspection Photo'}
                              className="max-h-[130px] w-auto max-w-full object-contain rounded"
                            />
                          ) : (
                            <label className="flex flex-col items-center justify-center text-center p-2 text-slate-400 cursor-pointer hover:bg-slate-50 w-full h-full">
                              <Upload className="w-6 h-6 text-slate-300 mb-1" />
                              <span className="text-[8px] font-bold text-slate-600">UPLOAD PHOTO</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = ev.target?.result as string;
                                      if (base64) updateAdditionalPhoto(pIdx, 'imageUrl', base64);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. CHARACTERISTICS & DIMENSIONAL INSPECTION MATRIX (Renders on Page 1 if not moved to Page 2) */}
            {(!inspectionData.moveCharacteristicsToPage2 && (!inspectionData.additionalPhotos || inspectionData.additionalPhotos.length === 0)) && (
              <div className="border border-black bg-white overflow-hidden text-[9px]">
                <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide font-black text-[9.5px]">
                      CHARACTERISTICS & DIMENSIONAL INSPECTION MATRIX
                    </span>
                    <span className="text-[8px] font-bold text-slate-600 bg-white border border-slate-300 px-1.5 py-0.2 rounded hidden sm:inline">
                      DIN 934 / ISO 965-2 / ISO 6157-2
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 print:hidden">
                    <button
                      type="button"
                      onClick={() => addInspectionDimensionalRow()}
                      className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add Characteristic
                    </button>
                    <button
                      type="button"
                      onClick={resetInspectionDimensionalRows}
                      className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Reset Standard Table
                    </button>
                  </div>
                </div>

                {/* TABLE HEADER & SECTION ROW */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[8.5px] table-fixed min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 font-bold border-b border-black text-black text-[8.5px] leading-tight">
                        <th className="border-r border-black p-1 w-[20%] text-left px-1.5 font-bold">Characteristic</th>
                        <th className="border-r border-black p-1 w-[16%] text-center px-1 font-bold">Requirements</th>
                        <th className="border-r border-black p-1 w-[15%] text-center px-1 font-bold">Results</th>
                        <th className="border-r border-black p-1 w-[6%] text-center font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle S/S Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showSsColumn !== false}
                              onChange={(e) => updateInspectionField('showSsColumn', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>S/S</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[6%] text-center font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle Pass Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showPassColumn !== false}
                              onChange={(e) => updateInspectionField('showPassColumn', e.target.checked)}
                              className="rounded text-emerald-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Pass</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[6%] text-center font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle Rej Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showRejColumn !== false}
                              onChange={(e) => updateInspectionField('showRejColumn', e.target.checked)}
                              className="rounded text-rose-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Rej</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[13%] text-center px-1 font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle Specification Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showSpecColumn !== false}
                              onChange={(e) => updateInspectionField('showSpecColumn', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Specification</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[14%] text-left px-1.5 font-bold">
                          <label className="inline-flex items-center gap-0.5 cursor-pointer" title="Toggle Test Method Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showTestMethodColumn !== false}
                              onChange={(e) => updateInspectionField('showTestMethodColumn', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Test Method / [Device*1] / (Plan*2)</span>
                          </label>
                        </th>
                        <th className="p-1 w-[4%] text-center print:hidden font-bold">DEL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      <tr className="bg-slate-100 border-b border-black font-black text-black text-[8.5px]">
                        <td colSpan={9} className="p-1 px-1.5">
                          <div className="flex items-center justify-between">
                            <span className="uppercase font-bold tracking-wide">Dimensional inspections</span>
                            <span className="text-[7.5px] font-normal text-slate-600 print:hidden">
                              ISO 2859-1 Level II / AQL 1.0 (Sampling Size S/S)
                            </span>
                          </div>
                        </td>
                      </tr>
                      {inspectionData.dimensionalRows.map((dimRow, dIdx) => (
                        <tr key={dimRow.id || `dim-${dIdx}`} className="hover:bg-amber-50/20 group">
                          {/* Characteristic */}
                          <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[8.5px]">
                            <div className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={dimRow.checked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'checked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Include characteristic"
                              />
                              <input
                                type="text"
                                value={dimRow.characteristic}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'characteristic', e.target.value)}
                                className="w-full font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="Characteristic (e.g. Across Flat (mm))"
                              />
                            </div>
                          </td>
                          {/* Requirements */}
                          <td className="border-r border-black p-0.5 px-1 text-center font-medium text-black text-[8.5px]">
                            <input
                              type="text"
                              value={dimRow.requirements}
                              onChange={(e) => updateInspectionDimensionalRow(dIdx, 'requirements', e.target.value)}
                              className="w-full font-medium text-[8.5px] text-center text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              placeholder="e.g. 9.780 - 10.000 / MIN 11.05"
                            />
                          </td>
                          {/* Results */}
                          <td className="border-r border-black p-0.5 px-1 text-center font-bold text-slate-900 text-[8.5px] bg-slate-50/30">
                            <input
                              type="text"
                              value={dimRow.results}
                              onChange={(e) => updateInspectionDimensionalRow(dIdx, 'results', e.target.value)}
                              className="w-full font-bold text-[8.5px] text-center text-slate-900 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              placeholder="e.g. 9.823 - 9.846 / PASSED"
                            />
                          </td>
                          {/* S/S */}
                          <td className="border-r border-black p-0.5 text-center font-semibold text-black text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.ssChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'ssChecked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check S/S"
                              />
                              <input
                                type="text"
                                value={dimRow.sampleSize}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'sampleSize', e.target.value)}
                                className="w-full font-semibold text-[8.5px] text-center text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="6"
                              />
                            </div>
                          </td>
                          {/* Pass */}
                          <td className="border-r border-black p-0.5 text-center font-bold text-emerald-700 text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.passChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'passChecked', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Pass"
                              />
                              <input
                                type="text"
                                value={dimRow.passQty}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'passQty', e.target.value)}
                                className="w-full font-bold text-[8.5px] text-center text-emerald-700 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded"
                                placeholder="6"
                              />
                            </div>
                          </td>
                          {/* Rej */}
                          <td className="border-r border-black p-0.5 text-center font-bold text-slate-700 text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.rejChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'rejChecked', e.target.checked)}
                                className="rounded text-rose-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Rej"
                              />
                              <input
                                type="text"
                                value={dimRow.rejQty}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'rejQty', e.target.value)}
                                className="w-full font-bold text-[8.5px] text-center text-slate-700 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          {/* Specification */}
                          <td className="border-r border-black p-0.5 px-1 text-center font-medium text-black text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.specChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'specChecked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Specification"
                              />
                              <input
                                type="text"
                                value={dimRow.specification}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'specification', e.target.value)}
                                className="w-full font-medium text-[8.5px] text-center text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                                placeholder="DIN 934-1987"
                              />
                            </div>
                          </td>
                          {/* Test Method / Device / Sample Plan */}
                          <td className="border-r border-black p-0.5 px-1.5 text-left font-mono text-[8px] text-slate-800">
                            <div className="flex items-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.testMethodChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'testMethodChecked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Test Method"
                              />
                              <input
                                type="text"
                                value={dimRow.testMethod}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'testMethod', e.target.value)}
                                className="w-full font-mono text-[8px] text-left text-slate-800 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="[Mcr] (18)"
                              />
                            </div>
                          </td>
                          {/* DEL */}
                          <td className="p-0.5 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => removeInspectionDimensionalRow(dIdx)}
                              disabled={inspectionData.dimensionalRows.length <= 1}
                              title="Delete Characteristic"
                              className="p-0.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TABLE FOOTNOTE / LEGEND */}
                <div className="p-1 px-2 bg-slate-50 border-t border-black text-[7.5px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    <strong>Device Codes:</strong> [Mcr] = Micrometer, [Cal] = Vernier Caliper, [Twf] = Thread Profile / Gauge, [Ppg] = Plain Plug Gauge, [Tpg] = Thread Plug Gauge
                  </span>
                  <span>
                    <strong>Sample Plan:</strong> (18) = ISO 2859-1 General Inspection Level II / AQL 1.0
                  </span>
                </div>
              </div>
            )}

            {/* PAGE 2 SEPARATOR & BANNER */}
            <div className="my-3 pt-2 pb-1 border-t-2 border-dashed border-slate-400 flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                  PAGE 2 OF 2
                </span>
                <span className="font-bold text-[9.5px] uppercase tracking-wide text-slate-900">
                  QUALITY VERIFICATION, FINAL DISPOSITION & SIGN-OFF SHEET
                </span>
              </div>
              <span className="text-[8px] text-slate-500 font-medium">
                (Automatically breaks to Page 2 in PDF & Print View)
              </span>
            </div>

            {/* 4 (ALT). CHARACTERISTICS & DIMENSIONAL INSPECTION MATRIX (When moved to Page 2) */}
            {(Boolean(inspectionData.moveCharacteristicsToPage2 || (inspectionData.additionalPhotos && inspectionData.additionalPhotos.length > 0))) && (
              <div className="border border-black bg-white overflow-hidden text-[9px]">
                <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide font-black text-[9.5px]">
                      CHARACTERISTICS & DIMENSIONAL INSPECTION MATRIX
                    </span>
                    <span className="text-[8px] font-bold text-slate-600 bg-white border border-slate-300 px-1.5 py-0.2 rounded hidden sm:inline">
                      DIN 934 / ISO 965-2 / ISO 6157-2
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 print:hidden">
                    <button
                      type="button"
                      onClick={() => addInspectionDimensionalRow()}
                      className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add Characteristic
                    </button>
                    <button
                      type="button"
                      onClick={resetInspectionDimensionalRows}
                      className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Reset Standard Table
                    </button>
                  </div>
                </div>

                {/* TABLE HEADER & SECTION ROW */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[8.5px] table-fixed min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 font-bold border-b border-black text-black text-[8.5px] leading-tight">
                        <th className="border-r border-black p-1 w-[20%] text-left px-1.5 font-bold">Characteristic</th>
                        <th className="border-r border-black p-1 w-[16%] text-center px-1 font-bold">Requirements</th>
                        <th className="border-r border-black p-1 w-[15%] text-center px-1 font-bold">Results</th>
                        <th className="border-r border-black p-1 w-[6%] text-center font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle S/S Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showSsColumn !== false}
                              onChange={(e) => updateInspectionField('showSsColumn', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>S/S</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[6%] text-center font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle Pass Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showPassColumn !== false}
                              onChange={(e) => updateInspectionField('showPassColumn', e.target.checked)}
                              className="rounded text-emerald-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Pass</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[6%] text-center font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle Rej Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showRejColumn !== false}
                              onChange={(e) => updateInspectionField('showRejColumn', e.target.checked)}
                              className="rounded text-rose-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Rej</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[13%] text-center px-1 font-bold">
                          <label className="inline-flex items-center justify-center gap-0.5 cursor-pointer" title="Toggle Specification Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showSpecColumn !== false}
                              onChange={(e) => updateInspectionField('showSpecColumn', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Specification</span>
                          </label>
                        </th>
                        <th className="border-r border-black p-1 w-[14%] text-left px-1.5 font-bold">
                          <label className="inline-flex items-center gap-0.5 cursor-pointer" title="Toggle Test Method Column">
                            <input
                              type="checkbox"
                              checked={inspectionData.showTestMethodColumn !== false}
                              onChange={(e) => updateInspectionField('showTestMethodColumn', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span>Test Method / [Device*1] / (Plan*2)</span>
                          </label>
                        </th>
                        <th className="p-1 w-[4%] text-center print:hidden font-bold">DEL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      <tr className="bg-slate-100 border-b border-black font-black text-black text-[8.5px]">
                        <td colSpan={9} className="p-1 px-1.5">
                          <div className="flex items-center justify-between">
                            <span className="uppercase font-bold tracking-wide">Dimensional inspections</span>
                            <span className="text-[7.5px] font-normal text-slate-600 print:hidden">
                              ISO 2859-1 Level II / AQL 1.0 (Sampling Size S/S)
                            </span>
                          </div>
                        </td>
                      </tr>
                      {inspectionData.dimensionalRows.map((dimRow, dIdx) => (
                        <tr key={dimRow.id || `dim-p2-${dIdx}`} className="hover:bg-amber-50/20 group">
                          {/* Characteristic */}
                          <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[8.5px]">
                            <div className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={dimRow.checked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'checked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Include characteristic"
                              />
                              <input
                                type="text"
                                value={dimRow.characteristic}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'characteristic', e.target.value)}
                                className="w-full font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="Characteristic (e.g. Across Flat (mm))"
                              />
                            </div>
                          </td>
                          {/* Requirements */}
                          <td className="border-r border-black p-0.5 px-1 text-center font-medium text-black text-[8.5px]">
                            <input
                              type="text"
                              value={dimRow.requirements}
                              onChange={(e) => updateInspectionDimensionalRow(dIdx, 'requirements', e.target.value)}
                              className="w-full font-medium text-[8.5px] text-center text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              placeholder="e.g. 9.780 - 10.000 / MIN 11.05"
                            />
                          </td>
                          {/* Results */}
                          <td className="border-r border-black p-0.5 px-1 text-center font-bold text-slate-900 text-[8.5px] bg-slate-50/30">
                            <input
                              type="text"
                              value={dimRow.results}
                              onChange={(e) => updateInspectionDimensionalRow(dIdx, 'results', e.target.value)}
                              className="w-full font-bold text-[8.5px] text-center text-slate-900 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                              placeholder="e.g. 9.823 - 9.846 / PASSED"
                            />
                          </td>
                          {/* S/S */}
                          <td className="border-r border-black p-0.5 text-center font-semibold text-black text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.ssChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'ssChecked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check S/S"
                              />
                              <input
                                type="text"
                                value={dimRow.sampleSize}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'sampleSize', e.target.value)}
                                className="w-full font-semibold text-[8.5px] text-center text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="6"
                              />
                            </div>
                          </td>
                          {/* Pass */}
                          <td className="border-r border-black p-0.5 text-center font-bold text-emerald-700 text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.passChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'passChecked', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Pass"
                              />
                              <input
                                type="text"
                                value={dimRow.passQty}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'passQty', e.target.value)}
                                className="w-full font-bold text-[8.5px] text-center text-emerald-700 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded"
                                placeholder="6"
                              />
                            </div>
                          </td>
                          {/* Rej */}
                          <td className="border-r border-black p-0.5 text-center font-bold text-slate-700 text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.rejChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'rejChecked', e.target.checked)}
                                className="rounded text-rose-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Rej"
                              />
                              <input
                                type="text"
                                value={dimRow.rejQty}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'rejQty', e.target.value)}
                                className="w-full font-bold text-[8.5px] text-center text-slate-700 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          {/* Specification */}
                          <td className="border-r border-black p-0.5 px-1 text-center font-medium text-black text-[8.5px]">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.specChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'specChecked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Specification"
                              />
                              <input
                                type="text"
                                value={dimRow.specification}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'specification', e.target.value)}
                                className="w-full font-medium text-[8.5px] text-center text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                                placeholder="DIN 934-1987"
                              />
                            </div>
                          </td>
                          {/* Test Method / Device / Sample Plan */}
                          <td className="border-r border-black p-0.5 px-1.5 text-left font-mono text-[8px] text-slate-800">
                            <div className="flex items-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={dimRow.testMethodChecked !== false}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'testMethodChecked', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer print:hidden shrink-0"
                                title="Check Test Method"
                              />
                              <input
                                type="text"
                                value={dimRow.testMethod}
                                onChange={(e) => updateInspectionDimensionalRow(dIdx, 'testMethod', e.target.value)}
                                className="w-full font-mono text-[8px] text-left text-slate-800 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                                placeholder="[Mcr] (18)"
                              />
                            </div>
                          </td>
                          {/* DEL */}
                          <td className="p-0.5 text-center print:hidden">
                            <button
                              type="button"
                              onClick={() => removeInspectionDimensionalRow(dIdx)}
                              disabled={inspectionData.dimensionalRows.length <= 1}
                              title="Delete Characteristic"
                              className="p-0.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TABLE FOOTNOTE / LEGEND */}
                <div className="p-1 px-2 bg-slate-50 border-t border-black text-[7.5px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    <strong>Device Codes:</strong> [Mcr] = Micrometer, [Cal] = Vernier Caliper, [Twf] = Thread Profile / Gauge, [Ppg] = Plain Plug Gauge, [Tpg] = Thread Plug Gauge
                  </span>
                  <span>
                    <strong>Sample Plan:</strong> (18) = ISO 2859-1 General Inspection Level II / AQL 1.0
                  </span>
                </div>
              </div>
            )}

            {/* 5. GENERAL QUALITY & PACKAGING VERIFICATION PARAMETERS (NOW FIRMLY ON PAGE 2) */}
            <div className="border border-black bg-white overflow-hidden text-[9px]">
              <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inspectionData.showGeneralQuality !== false}
                    onChange={(e) => updateInspectionField('showGeneralQuality', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="uppercase tracking-wide font-black text-[9.5px]">
                    GENERAL QUALITY, COATING & PACKAGING VERIFICATION
                  </span>
                </label>
                <div className="flex items-center gap-1.5 print:hidden">
                  <button
                    type="button"
                    onClick={() => addInspectionParameterRow()}
                    className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Parameter
                  </button>
                  <button
                    type="button"
                    onClick={resetInspectionParameters}
                    className="inline-flex items-center gap-1 text-[8.5px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Reset Parameters
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse text-[9px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-black text-black text-[9px]">
                    <th className="border-r border-black p-1 w-[6%] text-center font-bold">SR NO</th>
                    <th className="border-r border-black p-1 w-[25%] text-left px-2 font-bold">INSPECTION PARAMETER</th>
                    <th className="border-r border-black p-1 w-[31%] text-left px-2 font-bold bg-blue-50/50 text-blue-950">
                      CUSTOMER REQUIREMENT / SPECIFICATION
                    </th>
                    <th className="border-r border-black p-1 w-[26%] text-left px-2 font-bold bg-emerald-50/50 text-emerald-950">
                      SUPPLY DATA / OBSERVED RESULT
                    </th>
                    <th className="border-r border-black p-1 w-[8%] text-center font-bold">STATUS</th>
                    <th className="p-1 w-[4%] text-center print:hidden font-bold">DEL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {inspectionData.parameters.map((param, pIdx) => (
                    <tr key={param.id || `param-${pIdx}`} className="hover:bg-amber-50/30 group">
                      <td className="border-r border-black p-1 text-center font-bold bg-slate-50 text-slate-800 text-[9px]">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="checkbox"
                            checked={param.checked !== false}
                            onChange={(e) => updateInspectionParameterRow(pIdx, 'checked', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-0 w-3 h-3 cursor-pointer print:hidden"
                            title="Include parameter in verification"
                          />
                          <span>{pIdx + 1}</span>
                        </div>
                      </td>
                      <td className="border-r border-black p-1 px-2 text-left">
                        <input
                          type="text"
                          value={param.parameter}
                          onChange={(e) => updateInspectionParameterRow(pIdx, 'parameter', e.target.value)}
                          className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                          placeholder="Parameter Name"
                        />
                      </td>
                      <td className="border-r border-black p-1 px-2 text-left bg-blue-50/20">
                        <textarea
                          rows={2}
                          value={param.customerRequirement}
                          onChange={(e) => updateInspectionParameterRow(pIdx, 'customerRequirement', e.target.value)}
                          className="w-full font-medium text-[8.5px] text-slate-900 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded resize-none leading-snug"
                          placeholder="Customer requirement / drawing..."
                        />
                      </td>
                      <td className="border-r border-black p-1 px-2 text-left bg-emerald-50/20">
                        <textarea
                          rows={2}
                          value={param.supplyData}
                          onChange={(e) => updateInspectionParameterRow(pIdx, 'supplyData', e.target.value)}
                          className="w-full font-bold text-[8.5px] text-emerald-900 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded resize-none leading-snug"
                          placeholder="Actual supply data / test results..."
                        />
                      </td>
                      <td className="border-r border-black p-1 text-center">
                        <input
                          type="text"
                          value={param.status || 'ACCEPTED'}
                          onChange={(e) => updateInspectionParameterRow(pIdx, 'status', e.target.value)}
                          className="w-full text-center font-black text-[8.5px] text-emerald-700 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                          placeholder="ACCEPTED"
                        />
                      </td>
                      <td className="p-1 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => removeInspectionParameterRow(pIdx)}
                          disabled={inspectionData.parameters.length <= 1}
                          title="Delete Parameter"
                          className="p-0.5 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6. CERTIFICATION & INSPECTION SUMMARY (PAGE 2) */}
            <div className="border border-black bg-white p-2 space-y-1.5 text-[9.5px]">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-black uppercase text-[9px] text-black">Official Inspection Certification Statement:</span>
                  <button
                    type="button"
                    onClick={() => updateInspectionField('certificationText', DEFAULT_INSPECTION_CERTIFICATION)}
                    className="text-[8px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer print:hidden"
                  >
                    Reset Statement
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={inspectionData.certificationText}
                  onChange={(e) => updateInspectionField('certificationText', e.target.value)}
                  className="w-full p-1 bg-slate-50 border border-slate-300 font-bold uppercase text-[9px] text-black focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                  placeholder="Certification statement..."
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-black uppercase text-black shrink-0 text-[9px]">FINAL REMARKS / DISPOSITION:</span>
                <input
                  type="text"
                  value={inspectionData.remarks}
                  onChange={(e) => updateInspectionField('remarks', e.target.value)}
                  className="w-full p-0.5 font-bold uppercase text-[9.5px] text-black bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                  placeholder="INSPECTION SATISFACTORY. RELEASED FOR SHIPMENT."
                />
              </div>
            </div>
          </div>
        ) : isItp ? (
          /* INSPECTION AND TEST PLAN (ITP) INTERACTIVE CANVAS */
          <div className="space-y-1.5">
            {/* 1. ITP PROJECT SCOPE & APPLICABILITY BANNER */}
            <div className="border border-black bg-white text-[9px]">
              <div className="bg-slate-100 border-b border-black px-2 py-0.5 font-black text-black text-[9.5px] uppercase tracking-wide flex items-center justify-between">
                <span>PROJECT QUALITY PLAN & TECHNICAL SCOPE</span>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        itpData: {
                          ...getItpReportData(prev),
                          productDescription: 'HIGH TENSILE STUD BOLTS (ASTM A193 B7 / A320 L7) WITH HEAVY HEX NUTS (ASTM A194 2H / GR. 7) & WASHERS',
                          specStandard: 'ASTM A193 / A194 / A320 / ASME B18.2.1 / ASME B18.2.2 / BS EN 10204 3.1',
                          activityRows: DEFAULT_ITP_ACTIVITIES
                        }
                      }));
                    }}
                    className="text-[8px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer"
                  >
                    Load Fasteners Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        itpData: {
                          ...getItpReportData(prev),
                          productDescription: 'FOUNDATION ANCHOR BOLTS (GRADE 8.8 / ASTM F1554 GR 55/105) WITH NUTS, LOCK WASHERS & TEMPLATE SLEEVES',
                          specStandard: 'ASTM F1554 / ISO 898-1 / DIN 529 / ASTM A153 / BS EN 10204 3.1',
                          activityRows: [
                            {
                              id: 'itp-ab-1',
                              itemNo: '1.0',
                              processStage: 'Raw Material Chemical & Mechanical Verification (Steel Round Bars)',
                              referenceDoc: 'ASTM F1554 / EN 10025-2 / BS EN 10204 3.1',
                              acceptanceCriteria: 'MTR review, yield/tensile strength verification, heat traceability and surface inspection',
                              verifyingDoc: 'Mill Test Certificate / Material Inspection Report',
                              mfgIntervention: 'H',
                              tpiIntervention: 'R',
                              clientIntervention: 'R',
                              remarks: 'Mandatory hold point prior to cutting/bending'
                            },
                            {
                              id: 'itp-ab-2',
                              itemNo: '2.0',
                              processStage: 'Cold Bending / Hook Forming & Cutting to Length',
                              referenceDoc: 'Approved Shop Drawing / ASTM F1554',
                              acceptanceCriteria: 'Bend angle 90° ± 2°, hook length and overall length within ±3mm of approved drawing',
                              verifyingDoc: 'In-Process Dimensional Inspection Record',
                              mfgIntervention: 'H',
                              tpiIntervention: 'S',
                              clientIntervention: 'S',
                              remarks: 'Template jig verification'
                            },
                            {
                              id: 'itp-ab-3',
                              itemNo: '3.0',
                              processStage: 'Thread Cutting / Rolling & Thread Gauging Inspection',
                              referenceDoc: 'ASME B1.1 Class 2A / ISO 965-2 6g',
                              acceptanceCriteria: 'Pitch diameter, major diameter and thread length comply with Go/No-Go calibrated thread gauges',
                              verifyingDoc: 'Thread Inspection Record',
                              mfgIntervention: 'H',
                              tpiIntervention: 'W',
                              clientIntervention: 'S',
                              remarks: '100% thread gauge audit'
                            },
                            {
                              id: 'itp-ab-4',
                              itemNo: '4.0',
                              processStage: 'Welding of Anchor Plates, Sleeves & Pipe Supports',
                              referenceDoc: 'AWS D1.1 / ASME Section IX',
                              acceptanceCriteria: 'Welder qualification verified; fillet weld size & visual inspection free of porosity/undercut',
                              verifyingDoc: 'Welding Inspection & NDT Visual Report',
                              mfgIntervention: 'H',
                              tpiIntervention: 'W',
                              clientIntervention: 'R',
                              remarks: 'WPS/PQR approved'
                            },
                            {
                              id: 'itp-ab-5',
                              itemNo: '5.0',
                              processStage: 'Hot Dip Galvanizing (HDG) & Dry Film Thickness (DFT)',
                              referenceDoc: 'ASTM A153 / ASTM F2329 / ISO 1461',
                              acceptanceCriteria: 'Coating thickness ≥ 86µm (600 g/m²), uniform adhesion, threads cleaned and spun clear',
                              verifyingDoc: 'HDG Inspection & DFT Log',
                              mfgIntervention: 'H',
                              tpiIntervention: 'W',
                              clientIntervention: 'R',
                              remarks: 'Passivated to prevent white rust'
                            },
                            {
                              id: 'itp-ab-6',
                              itemNo: '6.0',
                              processStage: 'Final Assembly, Nut Fitment Test & Marking Verification',
                              referenceDoc: 'Project Spec / ISO 3269',
                              acceptanceCriteria: 'Nuts run freely by hand over full thread length; manufacturer mark and heat code tagged',
                              verifyingDoc: 'Final Quality Inspection Report (FQIR)',
                              mfgIntervention: 'H',
                              tpiIntervention: 'W',
                              clientIntervention: 'W',
                              remarks: 'Final inspection hold point'
                            },
                            {
                              id: 'itp-ab-7',
                              itemNo: '7.0',
                              processStage: 'Weatherproof Bundling, Thread Protection Caps & Release Dossier',
                              referenceDoc: 'MIL-STD-2073 / BS EN 10204 3.1',
                              acceptanceCriteria: 'Heavy plastic end caps fitted on threads, wooden palletized, complete 3.1 QC dossier',
                              verifyingDoc: 'Packing Inspection & QC Release Dossier',
                              mfgIntervention: 'H',
                              tpiIntervention: 'R',
                              clientIntervention: 'H',
                              remarks: 'Final release before dispatch'
                            }
                          ]
                        }
                      }));
                    }}
                    className="text-[8px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer"
                  >
                    Load Anchor Bolts Preset
                  </button>
                  <button
                    type="button"
                    onClick={resetItpToDefault}
                    className="text-[8px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              {/* 2-ROW ITP SCOPE ATTRIBUTES */}
              <div className="grid grid-cols-1 sm:grid-cols-4 divide-x divide-y divide-black">
                <div className="p-1 px-1.5 col-span-2">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Project Name:</div>
                  <input
                    type="text"
                    value={itpData.projectName}
                    onChange={(e) => updateItpField('projectName', e.target.value)}
                    className="w-full font-black text-[9.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="Project Name"
                  />
                </div>
                <div className="p-1 px-1.5">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Client / Contractor:</div>
                  <input
                    type="text"
                    value={itpData.clientName}
                    onChange={(e) => updateItpField('clientName', e.target.value)}
                    className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="Client Name"
                  />
                </div>
                <div className="p-1 px-1.5">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Contractor PO / LOA:</div>
                  <input
                    type="text"
                    value={itpData.contractorPo}
                    onChange={(e) => updateItpField('contractorPo', e.target.value)}
                    className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="PO Reference"
                  />
                </div>

                <div className="p-1 px-1.5 col-span-2">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Product / Material Description:</div>
                  <input
                    type="text"
                    value={itpData.productDescription}
                    onChange={(e) => updateItpField('productDescription', e.target.value)}
                    className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="Product Description"
                  />
                </div>
                <div className="p-1 px-1.5">
                  <div className="font-bold text-[8px] text-slate-700 uppercase">Applicable Standards:</div>
                  <input
                    type="text"
                    value={itpData.specStandard}
                    onChange={(e) => updateItpField('specStandard', e.target.value)}
                    className="w-full font-bold text-[8.5px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                    placeholder="Standards & Specifications"
                  />
                </div>
                <div className="p-1 px-1.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[8px] text-slate-700 uppercase">ITP Revision / Date:</div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={itpData.itpRevision}
                        onChange={(e) => updateItpField('itpRevision', e.target.value)}
                        className="w-14 font-black text-[9px] text-blue-800 bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded uppercase"
                        placeholder="REV 00"
                      />
                      <span className="text-slate-400">|</span>
                      <input
                        type="text"
                        value={itpData.revisionDate}
                        onChange={(e) => updateItpField('revisionDate', e.target.value)}
                        className="w-20 font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-amber-50 focus:ring-1 focus:ring-amber-500 rounded"
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ITP QUALITY SURVEILLANCE & ACTIVITY MATRIX TABLE */}
            <div className="border border-black overflow-x-auto bg-white">
              <table className="w-full text-center border-collapse text-[9px] table-fixed">
                <thead>
                  <tr className="bg-slate-100 font-black border-b border-black text-black text-[9px] leading-tight">
                    <th className="border-r border-black p-1 w-[4%]" rowSpan={2}>SL. NO.</th>
                    <th className="border-r border-black p-1 w-[25%] text-left px-1.5" rowSpan={2}>PROCESS / INSPECTION ACTIVITY</th>
                    <th className="border-r border-black p-1 w-[14%]" rowSpan={2}>REFERENCE SPEC / STD</th>
                    <th className="border-r border-black p-1 w-[23%] text-left px-1.5" rowSpan={2}>ACCEPTANCE CRITERIA</th>
                    <th className="border-r border-black p-1 w-[14%]" rowSpan={2}>VERIFYING DOCUMENT</th>
                    <th className="border-r border-black p-0.5 w-[9%] text-center" colSpan={3}>INTERVENTION</th>
                    <th className="border-r border-black p-1 w-[8%]" rowSpan={2}>REMARKS</th>
                    <th className="p-1 w-[3%] print:hidden" rowSpan={2}>ACT</th>
                  </tr>
                  <tr className="bg-slate-200/80 font-black border-b border-black text-black text-[8px]">
                    <th className="border-r border-black p-0.5 w-[3%]" title="Manufacturer (MFI)">M</th>
                    <th className="border-r border-black p-0.5 w-[3%]" title="Third Party Inspection (TPI)">T</th>
                    <th className="border-r border-black p-0.5 w-[3%]" title="Client / Contractor">C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {itpData.activityRows.map((act, aIdx) => (
                    <tr key={act.id || aIdx} className="hover:bg-amber-50/40 transition-colors group">
                      {/* SL. NO. */}
                      <td className="border-r border-black p-1 font-black bg-slate-50 text-slate-800 text-[9px]">
                        <input
                          type="text"
                          value={act.itemNo}
                          onChange={(e) => updateItpActivityRow(aIdx, 'itemNo', e.target.value)}
                          className="w-full text-center font-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                        />
                      </td>

                      {/* PROCESS / INSPECTION STAGE */}
                      <td className="border-r border-black p-1 px-1.5 text-left">
                        <textarea
                          rows={2}
                          value={act.processStage}
                          onChange={(e) => updateItpActivityRow(aIdx, 'processStage', e.target.value)}
                          className="w-full font-bold text-[9px] text-black bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                          placeholder="Process stage..."
                        />
                      </td>

                      {/* REFERENCE STANDARD */}
                      <td className="border-r border-black p-1 text-center">
                        <textarea
                          rows={2}
                          value={act.referenceDoc}
                          onChange={(e) => updateItpActivityRow(aIdx, 'referenceDoc', e.target.value)}
                          className="w-full font-semibold text-[8.5px] text-slate-800 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug text-center"
                          placeholder="Standard..."
                        />
                      </td>

                      {/* ACCEPTANCE CRITERIA */}
                      <td className="border-r border-black p-1 px-1.5 text-left">
                        <textarea
                          rows={2}
                          value={act.acceptanceCriteria}
                          onChange={(e) => updateItpActivityRow(aIdx, 'acceptanceCriteria', e.target.value)}
                          className="w-full font-medium text-[8.5px] text-slate-900 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug"
                          placeholder="Acceptance criteria..."
                        />
                      </td>

                      {/* VERIFYING RECORD */}
                      <td className="border-r border-black p-1 text-center">
                        <textarea
                          rows={2}
                          value={act.verifyingDoc}
                          onChange={(e) => updateItpActivityRow(aIdx, 'verifyingDoc', e.target.value)}
                          className="w-full font-bold text-[8.5px] text-blue-900 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-snug text-center"
                          placeholder="Verifying doc..."
                        />
                      </td>

                      {/* INTERVENTION M */}
                      <td className="border-r border-black p-0.5 text-center bg-amber-50/20">
                        <select
                          value={act.mfgIntervention}
                          onChange={(e) => updateItpActivityRow(aIdx, 'mfgIntervention', e.target.value)}
                          className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 cursor-pointer text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                        >
                          <option value="H">H</option>
                          <option value="W">W</option>
                          <option value="R">R</option>
                          <option value="S">S</option>
                        </select>
                      </td>

                      {/* INTERVENTION T */}
                      <td className="border-r border-black p-0.5 text-center bg-blue-50/20">
                        <select
                          value={act.tpiIntervention}
                          onChange={(e) => updateItpActivityRow(aIdx, 'tpiIntervention', e.target.value)}
                          className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 cursor-pointer text-blue-900 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded"
                        >
                          <option value="H">H</option>
                          <option value="W">W</option>
                          <option value="R">R</option>
                          <option value="S">S</option>
                        </select>
                      </td>

                      {/* INTERVENTION C */}
                      <td className="border-r border-black p-0.5 text-center bg-emerald-50/20">
                        <select
                          value={act.clientIntervention}
                          onChange={(e) => updateItpActivityRow(aIdx, 'clientIntervention', e.target.value)}
                          className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 cursor-pointer text-emerald-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded"
                        >
                          <option value="H">H</option>
                          <option value="W">W</option>
                          <option value="R">R</option>
                          <option value="S">S</option>
                        </select>
                      </td>

                      {/* REMARKS */}
                      <td className="border-r border-black p-1 text-left">
                        <textarea
                          rows={2}
                          value={act.remarks}
                          onChange={(e) => updateItpActivityRow(aIdx, 'remarks', e.target.value)}
                          className="w-full font-medium text-[8px] text-slate-700 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                          placeholder="Notes..."
                        />
                      </td>

                      {/* ACTIONS */}
                      <td className="p-0.5 text-center print:hidden">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => addItpActivityRow(aIdx)}
                            title="Insert row below"
                            className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateItpActivityRow(aIdx)}
                            title="Duplicate row"
                            className="p-1 text-slate-500 hover:text-emerald-600 cursor-pointer"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItpActivityRow(aIdx)}
                            disabled={itpData.activityRows.length <= 1}
                            title="Delete row"
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QUICK ITP TABLE CONTROLS (PRINT HIDDEN) */}
            <div className="flex items-center justify-between text-[9px] print:hidden px-2 py-1 bg-slate-50 border border-slate-300 rounded">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addItpActivityRow()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black rounded shadow-xs cursor-pointer text-[9px]"
                >
                  <Plus className="w-3 h-3" /> Add Process Stage
                </button>
                <span className="text-slate-500 font-bold">Total Inspection Stages: {itpData.activityRows.length}</span>
              </div>
              <div className="text-[8.5px] text-slate-600 font-semibold">
                Tip: Use dropdowns to set H (Hold), W (Witness), R (Review), S (Surveillance) points for Manufacturer, TPI & Client.
              </div>
            </div>

            {/* 3. INTERVENTION LEGEND & QUALITY GENERAL NOTES */}
            <div className="border border-black bg-white p-1.5 space-y-1 text-[9px]">
              {/* LEGEND BOX */}
              <div className="bg-slate-100 p-1 border border-black flex items-center gap-1 text-[8.5px]">
                <span className="font-black text-black uppercase shrink-0">INTERVENTION LEGEND:</span>
                <input
                  type="text"
                  value={itpData.legendText}
                  onChange={(e) => updateItpField('legendText', e.target.value)}
                  className="flex-1 font-bold text-slate-800 bg-transparent border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded text-[8.5px]"
                  placeholder="H = Hold Point | W = Witness Point | R = Review | S = Surveillance"
                />
              </div>

              {/* GENERAL QUALITY REQUIREMENTS */}
              <div className="space-y-0.5">
                <div className="font-black text-[8.5px] text-black uppercase">General Quality Requirements & Inspection Notes:</div>
                <textarea
                  rows={3}
                  value={itpData.generalNotes}
                  onChange={(e) => updateItpField('generalNotes', e.target.value)}
                  className="w-full p-1 bg-slate-50 border border-slate-300 font-medium text-[8.5px] text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded resize-none leading-relaxed"
                  placeholder="General Quality Notes..."
                />
              </div>
            </div>

            {/* 4. FOUR-TIER AUTHORIZATION & ACCEPTANCE SIGNATURE BOX */}
            <div className="border border-black bg-white text-[9px]">
              <div className="bg-slate-100 border-b border-black px-2 py-0.5 font-black text-black text-[9px] uppercase tracking-wide text-center">
                INSPECTION & TEST PLAN APPROVALS & ENDORSEMENTS
              </div>
              <div className="grid grid-cols-4 divide-x divide-black text-center">
                {/* PREPARED BY */}
                <div className="p-1.5 flex flex-col justify-between h-24">
                  <div className="font-bold text-[8.5px] text-slate-700 uppercase">PREPARED BY</div>
                  <div className="font-black text-[9.5px] text-black uppercase">
                    <input
                      type="text"
                      value={itpData.preparedByTitle}
                      onChange={(e) => updateItpField('preparedByTitle', e.target.value)}
                      className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 focus:bg-amber-50 rounded"
                    />
                  </div>
                  <div className="border-t border-black pt-0.5 text-[8px] font-bold text-slate-800">
                    SIGN & DATE
                  </div>
                </div>

                {/* REVIEWED BY */}
                <div className="p-1.5 flex flex-col justify-between h-24">
                  <div className="font-bold text-[8.5px] text-slate-700 uppercase">REVIEWED BY</div>
                  <div className="font-black text-[9.5px] text-black uppercase">
                    <input
                      type="text"
                      value={itpData.reviewedByTitle}
                      onChange={(e) => updateItpField('reviewedByTitle', e.target.value)}
                      className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 focus:bg-amber-50 rounded"
                    />
                  </div>
                  <div className="border-t border-black pt-0.5 text-[8px] font-bold text-slate-800">
                    SIGN & DATE
                  </div>
                </div>

                {/* APPROVED BY */}
                <div className="p-1.5 flex flex-col justify-between h-24">
                  <div className="font-bold text-[8.5px] text-slate-700 uppercase">APPROVED BY (MFI)</div>
                  <div className="font-black text-[9.5px] text-black uppercase">
                    <input
                      type="text"
                      value={itpData.approvedByTitle}
                      onChange={(e) => updateItpField('approvedByTitle', e.target.value)}
                      className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 focus:bg-amber-50 rounded"
                    />
                  </div>
                  <div className="border-t border-black pt-0.5 text-[8px] font-bold text-slate-800">
                    SIGN & DATE
                  </div>
                </div>

                {/* CLIENT / TPI APPROVAL */}
                <div className="p-1.5 flex flex-col justify-between h-24 bg-slate-50/50">
                  <div className="font-bold text-[8.5px] text-slate-700 uppercase">CLIENT / TPI ACCEPTANCE</div>
                  <div className="font-black text-[9.5px] text-black uppercase">
                    <input
                      type="text"
                      value={itpData.tpiApprovalTitle}
                      onChange={(e) => updateItpField('tpiApprovalTitle', e.target.value)}
                      className="w-full text-center font-black text-[9px] bg-transparent border-0 p-0 focus:bg-amber-50 rounded"
                    />
                  </div>
                  <div className="border-t border-black pt-0.5 text-[8px] font-bold text-slate-800">
                    SIGN & OFFICIAL STAMP
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 3. PRODUCT SPECIFICATIONS & INSPECTION TEST TABLE (8 COLUMNS + SL NO + ACTIONS) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-x-auto bg-white">
                <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[4%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[6%]">{reportInfo.colCoatType}</th>
                      <th className="border-r border-black p-1 w-[25%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[11%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[7%]">QTY</th>
                      <th className="border-r border-black p-1 w-[14%]">{reportInfo.colCriteria}</th>
                      <th className="border-r border-black p-1 w-[12%]">{reportInfo.colObserved}</th>
                      <th className="border-r border-black p-1 w-[6%]">{reportInfo.colAvg}</th>
                      <th className="border-r border-black p-1 w-[10%]">{reportInfo.colMass}</th>
                      <th className="p-1 w-[5%] print:hidden">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {formData.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/40 transition-colors group">
                        {/* SL. NO. */}
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                          {idx + 1}
                        </td>

                        {/* COAT TYPE (FINISH) */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-finish`}
                            type="text"
                            value={item.finish || ''}
                            onChange={(e) => handleCellChange(idx, 'finish', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handlePaste(e, idx, 'finish')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* DESCRIPTION */}
                        <td className="border-r border-black p-0.5 text-left">
                          <textarea
                            id={`spec-cell-${idx}-description`}
                            rows={1}
                            value={item.description || ''}
                            onChange={(e) => handleCellChange(idx, 'description', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'description')}
                            onPaste={(e) => handlePaste(e, idx, 'description')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] font-medium text-black uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight ${isCellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* SIZE */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-size`}
                            type="text"
                            value={item.size || ''}
                            onChange={(e) => handleCellChange(idx, 'size', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'size')}
                            onPaste={(e) => handlePaste(e, idx, 'size')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* QTY (NEXT TO SIZE) */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-qty`}
                            type="text"
                            value={item.qty || ''}
                            onChange={(e) => handleCellChange(idx, 'qty', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handlePaste(e, idx, 'qty')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* ACCEPTABLE CRITERIA */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-coatingMicronsMin`}
                            type="text"
                            value={item.coatingMicronsMin ?? (item.marking || '')}
                            onChange={(e) => handleCellChange(idx, 'coatingMicronsMin', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'coatingMicronsMin')}
                            onPaste={(e) => handlePaste(e, idx, 'coatingMicronsMin')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-medium text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* OBSERVED COATING */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-observedCoating`}
                            type="text"
                            value={item.observedCoating ?? (item.heatNo || '')}
                            onChange={(e) => handleCellChange(idx, 'observedCoating', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'observedCoating')}
                            onPaste={(e) => handlePaste(e, idx, 'observedCoating')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 5) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* AVG. (AUTO CALCULATED OR EDITABLE) */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-avgMicrons`}
                            type="text"
                            value={item.avgMicrons || ''}
                            onChange={(e) => handleCellChange(idx, 'avgMicrons', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'avgMicrons')}
                            onPaste={(e) => handlePaste(e, idx, 'avgMicrons')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-bold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 6) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* MASS OF ZINC COATING (AUTO CALCULATED OR EDITABLE) */}
                        <td className="border-r border-black p-0.5">
                          <input
                            id={`spec-cell-${idx}-massOfZincGmM2`}
                            type="text"
                            value={item.massOfZincGmM2 ?? (item.remark || '')}
                            onChange={(e) => handleCellChange(idx, 'massOfZincGmM2', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'massOfZincGmM2')}
                            onPaste={(e) => handlePaste(e, idx, 'massOfZincGmM2')}
                            className={`w-full p-0.5 bg-transparent border-0 text-[9.5px] text-center font-semibold text-black focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isCellSelected(idx, 7) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                          />
                        </td>

                        {/* ROW ACTIONS */}
                        <td className="p-0.5 print:hidden text-center">
                          <div className="flex items-center justify-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleInsertRow(idx, 'below')}
                              className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded hover:bg-emerald-50 cursor-pointer"
                              title="Insert Clean Row Below"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(idx)}
                              className="text-slate-600 hover:text-slate-900 p-0.5 rounded hover:bg-slate-100 cursor-pointer"
                              title="Duplicate Row"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id, idx)}
                              className="text-rose-600 hover:text-rose-800 p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TECHNICAL PARAMETERS & TEST CRITERIA MATRIX (EDITABLE WITH STANDARD DEFAULTS) */}
            <div className="border border-black bg-white p-1.5 space-y-1 text-[9.5px]">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={formData.appearanceLabel ?? '1. ZINC COATING APPEARANCE :'}
                  onChange={(e) => setFormData(prev => ({ ...prev, appearanceLabel: e.target.value }))}
                  className="font-bold text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-amber-50/40 p-0.5 text-[9.5px] uppercase rounded shrink-0 min-w-[210px]"
                  title="Edit Appearance Header"
                />
                <input
                  type="text"
                  value={formData.zincCoatingAppearance !== undefined ? formData.zincCoatingAppearance : (formData.appearanceText ?? reportInfo.appearanceNote)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    zincCoatingAppearance: e.target.value, 
                    appearanceText: e.target.value 
                  }))}
                  className="flex-1 font-medium text-black bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-amber-500 focus:bg-amber-50/40 p-0.5 text-[10px] rounded"
                  placeholder={reportInfo.appearanceNote}
                  title="Click to edit Appearance Text"
                />
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={formData.thicknessLabel ?? '2. COATING THICKNESS :'}
                  onChange={(e) => setFormData(prev => ({ ...prev, thicknessLabel: e.target.value }))}
                  className="font-bold text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-amber-50/40 p-0.5 text-[9.5px] uppercase rounded shrink-0 min-w-[210px]"
                  title="Edit Thickness Header"
                />
                <input
                  type="text"
                  value={formData.coatingThicknessNotes !== undefined ? formData.coatingThicknessNotes : (formData.thicknessText ?? reportInfo.thicknessNote)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    coatingThicknessNotes: e.target.value, 
                    thicknessText: e.target.value 
                  }))}
                  className="flex-1 font-medium text-black bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-amber-500 focus:bg-amber-50/40 p-0.5 text-[10px] rounded"
                  placeholder={reportInfo.thicknessNote}
                  title="Click to edit Thickness Text"
                />
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={formData.adhesionLabel ?? '3. ADHESION TEST :'}
                  onChange={(e) => setFormData(prev => ({ ...prev, adhesionLabel: e.target.value }))}
                  className="font-bold text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-amber-50/40 p-0.5 text-[9.5px] uppercase rounded shrink-0 min-w-[210px]"
                  title="Edit Adhesion Header"
                />
                <input
                  type="text"
                  value={formData.adhesionTestNotes !== undefined ? formData.adhesionTestNotes : (formData.adhesionText ?? reportInfo.adhesionNote)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    adhesionTestNotes: e.target.value, 
                    adhesionText: e.target.value 
                  }))}
                  className="flex-1 font-medium text-black bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-amber-500 focus:bg-amber-50/40 p-0.5 text-[10px] rounded"
                  placeholder={reportInfo.adhesionNote}
                  title="Click to edit Adhesion Test Text"
                />
              </div>
            </div>

            {/* 5. OFFICIAL CERTIFICATION & DECLARATION STATEMENT (EDITABLE WITH STANDARD DEFAULTS) */}
            <div className="border border-black bg-slate-50/50 p-1.5 space-y-0.5">
              <input
                type="text"
                value={formData.certificationText !== undefined ? formData.certificationText : reportInfo.certificationText}
                onChange={(e) => setFormData(prev => ({ ...prev, certificationText: e.target.value }))}
                className="w-full text-[9.5px] font-black uppercase text-black bg-transparent border-b border-slate-200 hover:border-slate-400 focus:border-amber-500 focus:bg-white p-0.5 rounded"
                placeholder={reportInfo.certificationText}
                title="Click to edit Certification Declaration"
              />
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] font-black uppercase text-black shrink-0">REMARKS:</span>
                <input
                  type="text"
                  value={formData.remarks !== undefined ? formData.remarks : reportInfo.defaultRemarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="flex-1 p-0.5 font-bold text-[10px] text-black bg-transparent border-b border-slate-200 hover:border-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase"
                  placeholder={reportInfo.defaultRemarks}
                  title="Click to edit Remarks"
                />
              </div>
            </div>
          </>
        )}

        {/* SIGNATURE & STAMP SLIDERS DRAWER (PRINT HIDDEN) */}
        {showSignStampDrawer && (
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-3 text-[9px] print:hidden shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <div className="flex items-center gap-1.5 font-black text-slate-800 uppercase tracking-wider text-[10px]">
                <Sliders className="w-3.5 h-3.5 text-amber-700" />
                <span>Stamp & Signature Alignment Adjusters</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      companyStampUrl: DEFAULT_COMPANY_STAMP_URL,
                      stampHeight: 68,
                      stampPosX: 0,
                      stampPosY: 0
                    }));
                    onSaveAsset('companyStampUrl', DEFAULT_COMPANY_STAMP_URL);
                    onSaveAsset('stampHeight', 68);
                  }}
                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 rounded font-bold text-[8.5px] cursor-pointer"
                >
                  Apply Official MFI Stamp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      preparedSignPosX: 0,
                      preparedSignPosY: 0,
                      approvedSignPosX: 0,
                      approvedSignPosY: 0,
                      stampPosX: 0,
                      stampPosY: 0,
                      preparedSignHeight: 48,
                      approvedSignHeight: 48,
                      stampHeight: 64
                    }));
                    onSaveAsset('preparedSignPosX', 0);
                    onSaveAsset('preparedSignPosY', 0);
                    onSaveAsset('approvedSignPosX', 0);
                    onSaveAsset('approvedSignPosY', 0);
                    onSaveAsset('stampPosX', 0);
                    onSaveAsset('stampPosY', 0);
                    onSaveAsset('preparedSignHeight', 48);
                    onSaveAsset('approvedSignHeight', 48);
                    onSaveAsset('stampHeight', 64);
                  }}
                  className="p-1 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded font-bold flex items-center gap-1 cursor-pointer text-[8.5px]"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset All Positions
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. PREPARED BY SIGNATURE ADJUSTER */}
              <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between font-black text-slate-800 border-b border-slate-100 pb-1">
                  <span>PREPARED BY SIGNATURE</span>
                  <span className="font-mono text-amber-800 font-bold">{formData.preparedSignHeight || 48}px</span>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                    <span>Height / Size:</span>
                    <span>{formData.preparedSignHeight || 48}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="140"
                    value={formData.preparedSignHeight || 48}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData(prev => ({ ...prev, preparedSignHeight: val }));
                      onSaveAsset('preparedSignHeight', val);
                    }}
                    className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                      <span>Horizontal (X):</span>
                      <span className="font-mono text-[7.5px]">{formData.preparedSignPosX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={formData.preparedSignPosX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, preparedSignPosX: val }));
                        onSaveAsset('preparedSignPosX', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                      <span>Vertical (Y):</span>
                      <span className="font-mono text-[7.5px]">{formData.preparedSignPosY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={formData.preparedSignPosY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, preparedSignPosY: val }));
                        onSaveAsset('preparedSignPosY', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                  <label className="inline-flex items-center gap-1 text-[8px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 border border-slate-300 rounded cursor-pointer">
                    <Upload className="w-2.5 h-2.5 text-amber-600" /> Upload Sign
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {!formData.engineerSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, engineerSignatureUrl: DEFAULT_PREPARED_SIGN_URL }));
                        onSaveAsset('engineerSignatureUrl', DEFAULT_PREPARED_SIGN_URL);
                      }}
                      className="text-[7.5px] text-blue-700 hover:underline font-bold"
                    >
                      Use Sample
                    </button>
                  )}
                  {formData.engineerSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, engineerSignatureUrl: undefined }));
                        onSaveAsset('engineerSignatureUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 text-[8px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* 2. APPROVED BY SIGNATURE ADJUSTER */}
              <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between font-black text-slate-800 border-b border-slate-100 pb-1">
                  <span>APPROVED BY SIGNATURE</span>
                  <span className="font-mono text-amber-800 font-bold">{formData.approvedSignHeight || 48}px</span>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                    <span>Height / Size:</span>
                    <span>{formData.approvedSignHeight || 48}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="140"
                    value={formData.approvedSignHeight || 48}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData(prev => ({ ...prev, approvedSignHeight: val }));
                      onSaveAsset('approvedSignHeight', val);
                    }}
                    className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                      <span>Horizontal (X):</span>
                      <span className="font-mono text-[7.5px]">{formData.approvedSignPosX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={formData.approvedSignPosX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, approvedSignPosX: val }));
                        onSaveAsset('approvedSignPosX', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                      <span>Vertical (Y):</span>
                      <span className="font-mono text-[7.5px]">{formData.approvedSignPosY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={formData.approvedSignPosY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, approvedSignPosY: val }));
                        onSaveAsset('approvedSignPosY', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                  <label className="inline-flex items-center gap-1 text-[8px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 border border-slate-300 rounded cursor-pointer">
                    <Upload className="w-2.5 h-2.5 text-amber-600" /> Upload Sign
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('manager', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {!formData.managerSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, managerSignatureUrl: DEFAULT_PREPARED_SIGN_URL }));
                        onSaveAsset('managerSignatureUrl', DEFAULT_PREPARED_SIGN_URL);
                      }}
                      className="text-[7.5px] text-blue-700 hover:underline font-bold"
                    >
                      Use Sample
                    </button>
                  )}
                  {formData.managerSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, managerSignatureUrl: undefined }));
                        onSaveAsset('managerSignatureUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 text-[8px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* 3. STAMP ADJUSTER */}
              <div className="bg-white p-2.5 rounded border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between font-black text-slate-800 border-b border-slate-100 pb-1">
                  <span>COMPANY STAMP ADJUSTER</span>
                  <span className="font-mono text-amber-800 font-bold">{formData.stampHeight || 64}px</span>
                </div>
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                    <span>Stamp Size (Diameter):</span>
                    <span>{formData.stampHeight || 64}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    value={formData.stampHeight || 64}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData(prev => ({ ...prev, stampHeight: val }));
                      onSaveAsset('stampHeight', val);
                    }}
                    className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                      <span>Horizontal (X):</span>
                      <span className="font-mono text-[7.5px]">{formData.stampPosX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={formData.stampPosX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, stampPosX: val }));
                        onSaveAsset('stampPosX', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-600 mb-0.5">
                      <span>Vertical (Y):</span>
                      <span className="font-mono text-[7.5px]">{formData.stampPosY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={formData.stampPosY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, stampPosY: val }));
                        onSaveAsset('stampPosY', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 accent-amber-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                  <label className="inline-flex items-center gap-1 text-[8px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 border border-slate-300 rounded cursor-pointer">
                    <Upload className="w-2.5 h-2.5 text-amber-600" /> Upload Stamp
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {formData.companyStampUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, companyStampUrl: undefined }));
                        onSaveAsset('companyStampUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 text-[8px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAMP & SIGNATURE QUICK TOOLBAR (PRINT HIDDEN) */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[9px] print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSignStampDrawer(prev => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-black text-[9px] transition-colors cursor-pointer"
            >
              <Sliders className="w-3 h-3 text-amber-700" />
              <span>{showSignStampDrawer ? 'Hide Adjusters' : 'STAMP & SIGNATURE ADJUSTERS'}</span>
            </button>
            {!formData.companyStampUrl && (
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, companyStampUrl: DEFAULT_COMPANY_STAMP_URL, stampHeight: 68 }));
                  onSaveAsset('companyStampUrl', DEFAULT_COMPANY_STAMP_URL);
                  onSaveAsset('stampHeight', 68);
                }}
                className="text-[8.5px] font-bold text-blue-700 hover:underline cursor-pointer"
              >
                + Add MFI Official Stamp
              </button>
            )}
          </div>
          <div className="text-[8px] text-slate-500 font-medium">
            Drag any stamp or signature directly on canvas to reposition, or use sliders above.
          </div>
        </div>

        {/* 6. SIGNATURES & OFFICIAL STAMP AREA */}
        <div className="flex items-end justify-between pt-1.5 relative">
          {/* PREPARED BY */}
          <div className="text-left space-y-0.5 flex flex-col justify-end relative">
            <div className="relative h-11 w-44 mb-0.5 flex items-end">
              {formData.engineerSignatureUrl ? (
                <div className="relative group/sig">
                  <DraggableImage
                    src={formData.engineerSignatureUrl}
                    alt="Engineer Signature"
                    height={formData.preparedSignHeight || 48}
                    posX={formData.preparedSignPosX || 0}
                    posY={formData.preparedSignPosY || 0}
                    onPositionChange={(nx, ny) => {
                      setFormData(prev => ({ ...prev, preparedSignPosX: nx, preparedSignPosY: ny }));
                      onSaveAsset('preparedSignPosX', nx);
                      onSaveAsset('preparedSignPosY', ny);
                    }}
                    className="max-w-[170px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                    title="Click & Drag to move Prepared By Signature"
                  />
                  <div className="absolute -top-3 left-0 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
                    <label className="cursor-pointer text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                      <Upload className="w-2 h-2" /> Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, engineerSignatureUrl: undefined }));
                        onSaveAsset('engineerSignatureUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 ml-0.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/50 rounded px-2 py-1 flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-600 hover:text-amber-800 cursor-pointer h-9 w-38 transition-colors print:hidden shadow-2xs">
                  <Upload className="w-2.5 h-2.5 text-amber-600" />
                  <span>Upload Prepared Sign</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="font-normal text-[9.5px] text-black leading-tight">Prepared By.</div>
            <div className="font-bold text-[9.5px] text-black leading-tight">Engineer QA/QC</div>
          </div>

          {/* APPROVED BY & STAMP */}
          <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
            <div className="relative h-11 w-64 mb-0.5 flex items-end justify-end">
              {formData.companyStampUrl ? (
                <div className="relative group/stamp">
                  <DraggableImage
                    src={formData.companyStampUrl}
                    alt="Company Stamp"
                    height={formData.stampHeight || 64}
                    posX={formData.stampPosX || 0}
                    posY={formData.stampPosY || 0}
                    onPositionChange={(nx, ny) => {
                      setFormData(prev => ({ ...prev, stampPosX: nx, stampPosY: ny }));
                      onSaveAsset('stampPosX', nx);
                      onSaveAsset('stampPosY', ny);
                    }}
                    className="max-w-[160px] object-contain absolute bottom-0 right-24 origin-bottom opacity-90 z-0"
                    title="Click & Drag to move Company Stamp"
                  />
                  <div className="absolute -top-3 right-24 opacity-0 group-hover/stamp:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
                    <label className="cursor-pointer text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                      <Upload className="w-2 h-2" /> Stamp
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, companyStampUrl: undefined }));
                        onSaveAsset('companyStampUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 ml-0.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/50 rounded px-2 py-1 flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-600 hover:text-amber-800 cursor-pointer h-9 w-28 mr-2 transition-colors print:hidden shadow-2xs">
                  <Upload className="w-2.5 h-2.5 text-amber-600" />
                  <span>Upload Stamp</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}

              {formData.managerSignatureUrl ? (
                <div className="relative group/appr">
                  <DraggableImage
                    src={formData.managerSignatureUrl}
                    alt="Manager Signature"
                    height={formData.approvedSignHeight || 48}
                    posX={formData.approvedSignPosX || 0}
                    posY={formData.approvedSignPosY || 0}
                    onPositionChange={(nx, ny) => {
                      setFormData(prev => ({ ...prev, approvedSignPosX: nx, approvedSignPosY: ny }));
                      onSaveAsset('approvedSignPosX', nx);
                      onSaveAsset('approvedSignPosY', ny);
                    }}
                    className="max-w-[200px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
                    title="Click & Drag to move Approved By Signature"
                  />
                  <div className="absolute -top-3 right-0 opacity-0 group-hover/appr:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
                    <label className="cursor-pointer text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                      <Upload className="w-2 h-2" /> Approved
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('manager', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, managerSignatureUrl: undefined }));
                        onSaveAsset('managerSignatureUrl', undefined);
                      }}
                      className="text-rose-600 hover:text-rose-800 ml-0.5 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/50 rounded px-2 py-1 flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-600 hover:text-amber-800 cursor-pointer h-9 w-32 transition-colors print:hidden shadow-2xs">
                  <Upload className="w-2.5 h-2.5 text-amber-600" />
                  <span>Upload Approved</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onUploadLogo('manager', e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="font-normal text-[9.5px] text-black leading-tight">Approved By.</div>
            <div className="font-bold text-[9.5px] text-black leading-tight">{getCompanyQcHead(activeCompany)}</div>
            <div className="font-bold text-[9.5px] text-black tracking-tight leading-tight">{formData.companyName || activeCompany.name}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export interface SpecializedQcReportPrintViewProps {
  record: QcReportRecord;
  pageNum: number;
  totalPages: number;
  items?: any[];
  DEFAULT_ISO_LOGO_URL: string;
  isSample?: boolean;
  showMetadata?: boolean;
  showTechInfo?: boolean;
  showRemarksAndSignatures?: boolean;
  isContinued?: boolean;
}

export const SpecializedQcReportPrintView: React.FC<SpecializedQcReportPrintViewProps> = ({
  record,
  pageNum,
  totalPages,
  items,
  DEFAULT_ISO_LOGO_URL,
  isSample = false,
  showMetadata = pageNum === 1,
  showTechInfo = pageNum === totalPages,
  showRemarksAndSignatures = pageNum === totalPages,
  isContinued = pageNum > 1
}) => {
  const activeCompany = getActiveCompany();
  const reportInfo = getSpecializedReportDetails(record.templateType);
  const displayItems = items || record.items || [];

  const isPtfePrint = record.templateType === 'PTFE_REPORT';
  const isNickelCobaltPrint = record.templateType === 'NICKEL_COBALT_REPORT' || record.templateType === 'NICKEL_COBALT';
  const isNeopreneSleevePrint = record.templateType === 'NEOPRENE_SLEEVE_REPORT' || record.templateType === 'NEOPRENE_SLEEVE' || record.templateType === 'NEOPRENE';
  const isTeflonPrint = record.templateType === 'TEFLON_REPORT' || (record.templateType as string) === 'TEFLON';
  const isFluropolymerPrint = record.templateType === 'FLUROPOLYMER_REPORT' || (record.templateType as string) === 'FLUROPOLYMER' || (record.templateType as string) === 'FLURO_POLYMER' || (record.templateType as string) === 'FLUOROPOLYMER';
  const isCooPrint = record.templateType === 'COO_CERTIFICATE' || record.templateType === 'COO' || (record.templateType as string) === 'COUNTRY_OF_ORIGIN' || (record.templateType as string) === 'CERTIFICATE_OF_ORIGIN';
  const isCocPrint = record.templateType === 'COC_REPORT' || record.templateType === 'COC' || (record.templateType as string) === 'CERTIFICATE_OF_CONFORMITY' || (record.templateType as string) === 'CONFORMITY_CERTIFICATE';
  const isCompliancePrint = record.templateType === 'COMPLIANCE_LETTER' || (record.templateType as string) === 'COMPLIANCE_REPORT' || (record.templateType as string) === 'COMPLIANCE' || (record.templateType as string) === 'LETTER_OF_COMPLIANCE';
  const isWarrantyPrint = record.templateType === 'WARRANTY_CERTIFICATE' || (record.templateType as string) === 'WARRANTY' || (record.templateType as string) === 'WARRANTY_REPORT';
  const isInspectionPrint = record.templateType === 'INSPECTION_REPORT' || record.templateType === 'INSPECTION' || (record.templateType as string) === 'FINAL_INSPECTION' || (record.templateType as string) === 'QC_INSPECTION';
  const isItpPrint = record.templateType === 'INSPECTION_TEST_PLAN' || (record.templateType as string) === 'ITP_REPORT' || (record.templateType as string) === 'ITP' || (record.templateType as string) === 'INSPECTION_PLAN';
  const xylanData = getXylanReportData(record);
  const nickelData = getNickelCobaltReportData(record);
  const neopreneData = getNeopreneSleeveReportData(record);
  const teflonData = getTeflonReportData(record);
  const fluropolymerData = getFluropolymerReportData(record);
  const cooData = getCooReportData(record);
  const cocData = getCocReportData(record);
  const complianceData = getComplianceReportData(record);
  const warrantyData = getWarrantyReportData(record);
  const inspectionData = getInspectionReportData(record);
  const itpData = getItpReportData(record);

  // Technical Notes resolution: use record values if provided, otherwise fallback to standard reportInfo defaults
  const appLabel = record.appearanceLabel || '1. ZINC COATING APPEARANCE :';
  const thickLabel = record.thicknessLabel || '2. COATING THICKNESS :';
  const adhLabel = record.adhesionLabel || '3. ADHESION TEST :';

  const appNote = (record.zincCoatingAppearance !== undefined ? record.zincCoatingAppearance : (record.appearanceText ?? reportInfo.appearanceNote))?.trim();
  const thickNote = (record.coatingThicknessNotes !== undefined ? record.coatingThicknessNotes : (record.thicknessText ?? reportInfo.thicknessNote))?.trim();
  const adhNote = (record.adhesionTestNotes !== undefined ? record.adhesionTestNotes : (record.adhesionText ?? reportInfo.adhesionNote))?.trim();
  const hasTechParams = Boolean(appNote || thickNote || adhNote);

  // Certification and Remarks resolution: use record values if provided, otherwise fallback to standard reportInfo defaults
  const certStatement = (record.certificationText !== undefined ? record.certificationText : reportInfo.certificationText)?.trim();
  const remStatement = (record.remarks !== undefined ? record.remarks : reportInfo.defaultRemarks)?.trim();
  const hasCertOrRemarks = Boolean(certStatement || remStatement);

  const isFinalPage = pageNum === totalPages;
  const isFirstPage = pageNum === 1;

  return (
    <div 
      className="w-full h-full bg-white text-black font-sans relative flex flex-col justify-between"
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}
    >
      {/* WATERMARK IF SAMPLE */}
      {isSample && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-15 overflow-hidden select-none">
          <div className="text-[72px] sm:text-[96px] font-black tracking-widest text-rose-700 transform -rotate-30 select-none uppercase border-8 border-rose-700 p-8 rounded-3xl">
            SAMPLE MTC
          </div>
        </div>
      )}

      {/* TOP CONTENT BLOCK */}
      <div className="space-y-1">
        {/* 1. TOP HEADER BLOCK WITH COMPANY DETAILS & ISO LOGO */}
        <div className="border-b-2 border-black pb-1 mb-0.5 flex items-start justify-between gap-2 bg-white">
          {/* LEFT: COMPANY LOGO & DETAILS */}
          <div className="flex items-start gap-2 shrink-0 max-w-[48%]">
            {record.companyLogoUrl && (
              <img src={record.companyLogoUrl} alt="Company Logo" className="h-11 max-w-[130px] object-contain" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-black text-[11px] uppercase tracking-tight text-black leading-tight">
                {record.companyName || (activeCompany?.name || 'COMPANY NAME')}
              </div>
              <div className="text-[7.5px] font-bold text-slate-800 uppercase tracking-tight leading-tight mt-0.5">
                {record.companyTagline || (activeCompany?.subtitle || '')}
              </div>
              <div className="text-[7px] font-medium text-slate-800 leading-tight mt-0.5">
                {record.companyAddress || (activeCompany?.address || '')}
              </div>
              <div className="text-[7px] font-semibold text-slate-900 mt-0.5">
                {record.companyContact || ((activeCompany?.email ? activeCompany.email + ' | ' + (activeCompany.website || '') : ''))}
              </div>
            </div>
          </div>

          {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only for companies with ISO certification enabled) */}
          {(activeCompany.showIso !== false && (isMarineFastenersCompany(activeCompany) || activeCompany.showIso)) ? (
            <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
              <img 
                src={record.isoLogoUrl || DEFAULT_ISO_LOGO_URL} 
                alt="ISO Certification Logos" 
                className="h-8 max-w-[260px] object-contain" 
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[7px] font-bold text-black uppercase tracking-tight whitespace-nowrap leading-none">
                <span>{getCompanyIsoText(activeCompany) || 'ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018'}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
              <div className="text-center font-bold text-[9px] text-slate-700 uppercase tracking-wider">
                {activeCompany.subtitle || 'QUALITY ASSURANCE & TESTING DIVISION'}
              </div>
            </div>
          )}

          {/* RIGHT: REPORT TITLE BOX */}
          <div className="shrink-0 text-right max-w-[32%] flex flex-col items-end">
            {reportInfo.badge && reportInfo.badge.trim().length > 0 && (
              <div className="border border-black bg-slate-100 px-1.5 py-0.5 font-black text-[8px] uppercase tracking-wider text-black rounded-xs mb-0.5">
                {reportInfo.badge}
              </div>
            )}
            <div className="font-black text-[11px] text-black uppercase tracking-tight leading-tight">
              {record.customReportTitle || record.reportTitle || reportInfo.title}
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5 text-[7.5px] font-bold text-slate-700">
              <span>PAGE NO :</span>
              <span className="font-bold text-black uppercase">{totalPages > 1 ? `${pageNum} OF ${totalPages}` : (record.pageNo || '1 OF 1')}</span>
            </div>
          </div>
        </div>

        {/* 2. METADATA 2-ROW GRID (SHOWN ON PAGE 1, SKIPPED ON CONTINUATION PAGES & ITP) */}
        {showMetadata && !isItpPrint && (
          <div className="border border-black bg-white text-[9.5px]">
            <div className="grid grid-cols-3 divide-x divide-black">
              {/* ROW 1 / COL 1 */}
              <div className="flex items-center px-1.5 py-0.5">
                <span className="font-bold text-black shrink-0 mr-1.5">Cert No :</span>
                <span className="font-black text-black text-[10px] uppercase">{(isInspectionPrint && pageNum > 1 && record.sheets?.[pageNum - 1]?.certNo) ? record.sheets[pageNum - 1].certNo : (isInspectionPrint && pageNum > 1 ? incrementCertNo(record.reportNo || record.certNo, pageNum - 1) : (record.reportNo || record.certNo || '—'))}</span>
              </div>
              {/* ROW 1 / COL 2 */}
              <div className="flex items-center px-1.5 py-0.5">
                <span className="font-bold text-black shrink-0 mr-1.5">Work Order No :</span>
                <span className="font-bold text-black text-[10px] uppercase">{record.workOrderNum || '—'}</span>
              </div>
              {/* ROW 1 / COL 3 */}
              <div className="flex items-center px-1.5 py-0.5">
                <span className="font-bold text-black shrink-0 mr-1.5">Customer :</span>
                <span className="font-bold text-black text-[10px] uppercase">{record.customerName || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-black border-t border-black">
              {/* ROW 2 / COL 1 */}
              <div className="flex items-center px-1.5 py-0.5">
                <span className="font-bold text-black shrink-0 mr-1.5">Date :</span>
                <span className="font-bold text-black text-[10px]">{record.date || '—'}</span>
              </div>
              {/* ROW 2 / COL 2 */}
              <div className="flex items-center px-1.5 py-0.5">
                <span className="font-bold text-black shrink-0 mr-1.5">Invoice Number :</span>
                <span className="font-bold text-black text-[10px]">{record.invoiceNum || '—'}</span>
              </div>
              {/* ROW 2 / COL 3 */}
              <div className="flex items-center px-1.5 py-0.5">
                <span className="font-bold text-black shrink-0 mr-1.5">PO Number :</span>
                <span className="font-bold text-black text-[10px]">{record.customerPoNum || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN INSPECTION BODY (XYLAN SPECIALIZED TEMPLATE VS STANDARD INSPECTION TABLE) */}
        {isPtfePrint ? (
          <div className="space-y-1">
            {/* 1. DESCRIPTION BOX */}
            <div className="border border-black flex text-[9.5px] bg-white">
              <div className="w-[18%] font-bold text-black border-r border-black p-1 bg-slate-50 flex items-center">
                {xylanData.descriptionLabel}
              </div>
              <div className="flex-1 p-1 font-semibold text-black leading-snug">
                {xylanData.descriptionText}
              </div>
            </div>

            {/* 2. SURFACE PREPARATION BOX */}
            <div className="border border-black text-[9px] bg-white">
              <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 font-bold text-black text-[9.5px]">
                {xylanData.surfacePrepLabel}
              </div>
              
              {/* ROW 1: 4 COLS */}
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black">
                <div className="p-1 font-bold text-black">
                  {xylanData.gritBlast}
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.solventLabel} :</span>
                  <span>{xylanData.solventValue}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.zincNiLabel} :</span>
                  <span>{xylanData.zincNiValue}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.othersLabel} :</span>
                  <span>{xylanData.othersValue}</span>
                </div>
              </div>

              {/* ROW 2: 4 COLS */}
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black">
                <div className="p-1 flex items-center gap-1 font-bold text-black uppercase">
                  <span>{xylanData.coatingColourLabel} :</span>
                  <span>{xylanData.coatingColourValue}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.coat1Label} :</span>
                  <span>{xylanData.coat1Value}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.coat2Label} :</span>
                  <span>{xylanData.coat2Value}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.coat3Label} :</span>
                  <span>{xylanData.coat3Value}</span>
                </div>
              </div>

              {/* ROW 3: FULL WIDTH XYLAN TYPE */}
              <div className="p-1 flex items-center gap-1 border-b border-black font-bold text-black">
                <span>{xylanData.xylanTypeLabel} :</span>
                <span>{xylanData.xylanTypeValue}</span>
              </div>

              {/* ROW 4: 2 COLS TEMPERATURE & HUMIDITY */}
              <div className="grid grid-cols-2 divide-x divide-black">
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.temperatureLabel} :</span>
                  <span>{xylanData.temperatureValue}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.humidityLabel} :</span>
                  <span>{xylanData.humidityValue}</span>
                </div>
              </div>
            </div>

            {/* 3. OBSERVATIONS BOX */}
            <div className="border border-black text-[9px] bg-white">
              <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 font-bold text-black text-[9.5px]">
                {xylanData.observationsLabel}
              </div>

              {/* PARAMETER SUB-ROW: FLASH OFF TEMP & CURE TEMP */}
              <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.flashOffLabel} :</span>
                  <span>{xylanData.flashOffValue}</span>
                </div>
                <div className="p-1 flex items-center gap-1 font-bold text-black">
                  <span>{xylanData.cureTempLabel} :</span>
                  <span>{xylanData.cureTempValue}</span>
                </div>
              </div>

              {/* OBSERVATION TESTS TABLE */}
              <table className="w-full text-left border-collapse text-[9px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-black text-black text-[9px]">
                    <th className="border-r border-black p-1 w-[20%]">Test</th>
                    <th className="border-r border-black p-1 w-[24%]">Method</th>
                    <th className="border-r border-black p-1 w-[24%]">Specified</th>
                    <th className="p-1 w-[32%]">Observed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {xylanData.observationRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="border-r border-black p-1 font-bold text-black align-top whitespace-pre-line leading-tight">
                        {row.test}
                      </td>
                      <td className="border-r border-black p-1 font-medium text-black align-top whitespace-pre-line leading-tight">
                        {row.method}
                      </td>
                      <td className="border-r border-black p-1 font-medium text-black align-top whitespace-pre-line leading-tight">
                        {row.specified}
                      </td>
                      <td className="p-1 font-semibold text-black align-top whitespace-pre-line leading-tight">
                        {row.observed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. REMARKS & CONCLUSION BOX */}
            <div className="border border-black bg-white p-1.5 space-y-1 text-[9px]">
              <div className="font-medium text-black whitespace-pre-line leading-relaxed">
                {xylanData.remarks}
              </div>
              <div className="flex items-center gap-1 border-t border-black pt-1 font-bold text-black text-[9.5px]">
                <span>{xylanData.conclusionLabel}</span>
                <span>{xylanData.conclusionText}</span>
              </div>
            </div>
          </div>
        ) : isNickelCobaltPrint ? (
          /* NICKEL COBALT COATING TEST REPORT ACCORDING TO ASTM B994 */
          <div className="space-y-1">
            {/* FASTENERS ITEMS TABLE (OPTIONAL / STANDARD LIST) */}
            {(displayItems.length > 0 || !showTechInfo) && (
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[9px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9px] leading-tight">
                      <th className="border-r border-black p-0.5 w-[5%]">SL. NO.</th>
                      <th className="border-r border-black p-0.5 w-[8%]">FINISH</th>
                      <th className="border-r border-black p-0.5 w-[32%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-0.5 w-[15%]">SIZE</th>
                      <th className="border-r border-black p-0.5 w-[10%]">QTY</th>
                      <th className="border-r border-black p-0.5 w-[15%]">HEAT / BATCH NO</th>
                      <th className="p-0.5 w-[15%]">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {(displayItems.length > 0 ? displayItems : Array.from({ length: 5 })).map((item: any, idx: number) => {
                      const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (isContinued ? ((pageNum - 1) * 20 + idx + 1) : idx + 1));
                      return (
                        <tr key={item?.id || idx}>
                          <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">
                            {slNumber}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black uppercase text-[9px]">
                            {item?.finish || (item ? 'Ni-Co' : '—')}
                          </td>
                          <td className="border-r border-black p-0.5 text-left font-medium text-black uppercase leading-tight text-[9px] px-1.5">
                            {item?.description || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[9px]">
                            {item?.size || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black text-[9px]">
                            {item?.qty || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black text-[9px]">
                            {item ? (item.observedCoating ?? (item.heatNo || '—')) : '—'}
                          </td>
                          <td className="p-0.5 text-center font-medium text-black text-[9px]">
                            {item?.remark || (item ? 'SATISFACTORY' : '—')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {showTechInfo && (
              <>
                {/* COATING CHARACTERISTICS ACCORDING TO ASTM B994 */}
                <div className="border border-black bg-white text-[9px]">
              {/* SECTION HEADER BANNER */}
              <div className="bg-slate-100 border-b border-black p-1 font-black text-[10px] text-black text-center uppercase tracking-wider">
                {nickelData.sectionTitle}
              </div>

              {/* 2-COLUMN MAIN TEST SUITE: ACCEPTANCE TESTS VS QUALIFICATION TESTS */}
              <div className="grid grid-cols-2 divide-x divide-black">
                {/* LEFT COLUMN: ACCEPTANCE TESTS */}
                <div className="flex flex-col divide-y divide-black">
                  <div className="bg-slate-50 p-1 font-black text-[9.5px] text-black text-center uppercase tracking-wide">
                    {nickelData.acceptanceTitle}
                  </div>

                  {/* APPEARANCE */}
                  <div className="p-1 space-y-0.5">
                    <div className="font-bold text-[9px] text-black uppercase">
                      {nickelData.appearanceLabel}
                    </div>
                    <div className="text-[8.5px] font-medium text-black uppercase leading-snug">
                      {nickelData.appearanceValue}
                    </div>
                  </div>

                  {/* ADHESION */}
                  <div className="p-1 space-y-0.5">
                    <div className="font-bold text-[9px] text-black uppercase">
                      {nickelData.adhesionLabel}
                    </div>
                    <div className="text-[8.5px] font-medium text-black uppercase leading-snug">
                      {nickelData.adhesionValue}
                    </div>
                  </div>

                  {/* THICKNESS */}
                  <div className="p-1 space-y-0.5 mt-auto">
                    <div className="font-bold text-[9px] text-black uppercase">
                      {nickelData.thicknessLabel}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 font-black text-[10px] text-black">
                        <span>{nickelData.thicknessValue}</span>
                        <span className="font-bold text-[9px]">{nickelData.thicknessUnit}</span>
                      </div>
                      <div className="font-bold text-[8.5px] text-black uppercase">
                        {nickelData.thicknessMethod}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: QUALIFICATION TESTS */}
                <div className="flex flex-col divide-y divide-black">
                  <div className="bg-slate-50 p-1 font-black text-[9.5px] text-black text-center uppercase tracking-wide">
                    {nickelData.qualificationTitle}
                  </div>

                  {/* CHEMICAL COMPOSITION */}
                  <div className="divide-y divide-black">
                    <div className="bg-slate-50/70 p-0.5 font-bold text-[9px] text-black text-center uppercase">
                      {nickelData.chemTitle}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black text-center text-[9px]">
                      <div className="p-0.5 font-bold bg-slate-50/50">{nickelData.chemNiLabel}</div>
                      <div className="p-0.5 font-bold bg-slate-50/50">{nickelData.chemCoLabel}</div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black text-center text-[9px]">
                      <div className="p-0.5 font-bold text-black">{nickelData.chemNiValue}</div>
                      <div className="p-0.5 font-bold text-black">{nickelData.chemCoValue}</div>
                    </div>
                  </div>

                  {/* GALLING */}
                  <div className="p-1 space-y-0.5">
                    <div className="font-bold text-[9px] text-black uppercase">
                      {nickelData.gallingLabel}
                    </div>
                    <div className="text-[8.5px] font-medium text-black uppercase leading-snug">
                      {nickelData.gallingValue}
                    </div>
                  </div>

                  {/* HYDROGEN EMBRITTLEMENT */}
                  <div className="p-1 space-y-0.5">
                    <div className="font-bold text-[9px] text-black uppercase">
                      {nickelData.hydrogenLabel}
                    </div>
                    <div className="text-[8.5px] font-medium text-black uppercase leading-snug">
                      {nickelData.hydrogenValue}
                    </div>
                  </div>

                  {/* ENVIRONMENTAL TESTING */}
                  <div className="divide-y divide-black">
                    <div className="bg-slate-50/70 p-0.5 font-bold text-[9px] text-black text-center uppercase">
                      {nickelData.envTitle}
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black text-center text-[8px]">
                      <div className="p-0.5 font-bold bg-slate-50/50 uppercase">{nickelData.cassLabel}</div>
                      <div className="p-0.5 font-bold bg-slate-50/50 uppercase">{nickelData.saltFogLabel}</div>
                      <div className="p-0.5 font-bold bg-slate-50/50 uppercase">{nickelData.modSaltFogLabel}</div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black text-center text-[8.5px] font-bold">
                      <div className="p-0.5 uppercase">{nickelData.cassValue}</div>
                      <div className="p-0.5 uppercase">{nickelData.saltFogValue}</div>
                      <div className="p-0.5 uppercase">{nickelData.modSaltFogValue}</div>
                    </div>
                    <div className="p-1 text-center bg-white font-bold text-[8px] text-black uppercase leading-tight">
                      {nickelData.envObservation}
                    </div>
                  </div>

                  {/* DEPOSIT LOT */}
                  <div className="p-1 flex items-center gap-1 bg-slate-50/40 text-[9px]">
                    <span className="font-bold text-black uppercase">{nickelData.depositLotLabel}</span>
                    <span className="font-bold text-black uppercase">{nickelData.depositLotValue}</span>
                  </div>

                  {/* CORROSION TESTING TABLE */}
                  <div className="divide-y divide-black">
                    <div className="bg-slate-50/70 px-1 py-0.5 font-bold text-[9px] text-black uppercase">
                      {nickelData.corrosionTitle}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black text-center text-[8.5px] font-bold bg-slate-50/50">
                      <div className="p-0.5">PART</div>
                      <div className="p-0.5 uppercase">{nickelData.corrosionRateHeader}</div>
                    </div>
                    {nickelData.corrosionRows.map((row, crIdx) => (
                      <div key={crIdx} className="grid grid-cols-2 divide-x divide-black text-[8.5px]">
                        <div className="p-0.5 font-semibold text-black uppercase">{row.part}</div>
                        <div className="p-0.5 font-bold text-center text-black">{row.rate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SAMPLING & FOOTNOTES BOX */}
            <div className="border border-black p-1 space-y-0.5 bg-white text-[8.5px] leading-tight font-medium text-black">
              <div className="font-bold text-black uppercase">{nickelData.samplingClause}</div>
              <div className="text-slate-800 uppercase">{nickelData.footnote1}</div>
              <div className="text-slate-800 uppercase">{nickelData.footnote2}</div>
              <div className="text-slate-800 uppercase">{nickelData.footnote3}</div>
            </div>

                {/* LEGAL & COMPLIANCE CLAUSE */}
                <div className="border border-black p-1 bg-slate-50/40 space-y-0.5">
                  <div className="text-[8px] font-bold uppercase text-black leading-tight text-justify">
                    {nickelData.legalClause}
                  </div>
                  <div className="flex items-center gap-1 border-t border-black pt-0.5 mt-0.5 text-[9px]">
                    <span className="font-black text-black shrink-0">{nickelData.qaAgentTitle}</span>
                    <span className="font-bold text-black uppercase">{nickelData.qaAgentName}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : isNeopreneSleevePrint ? (
          /* NEOPRENE SLEEVE TEST REPORT PRINT/PDF LAYOUT */
          <div className="space-y-1">
            {/* 1. FASTENERS / SLEEVES ITEMS TABLE (6 COLUMNS) */}
            {(displayItems.length > 0 || !showTechInfo) && (
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[9px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold italic border-b border-black text-black text-[9px] leading-tight">
                      <th className="border-r border-black p-0.5 w-[6%] font-bold italic">SL. NO.</th>
                      <th className="border-r border-black p-0.5 w-[38%] font-bold italic text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-0.5 w-[14%] font-bold italic">SIZE</th>
                      <th className="border-r border-black p-0.5 w-[10%] font-bold italic">QTY</th>
                      <th className="border-r border-black p-0.5 w-[14%] font-bold italic">MATERIAL</th>
                      <th className="p-0.5 w-[18%] font-bold italic">COMPOUND CODE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {(displayItems.length > 0 ? displayItems : Array.from({ length: 5 })).map((item: any, idx: number) => {
                      const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (idx + 1));
                      return (
                        <tr key={item?.id || idx}>
                          <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">
                            {slNumber}
                          </td>
                          <td className="border-r border-black p-0.5 text-left font-medium text-black uppercase leading-tight text-[9px] px-1.5">
                            {item?.description || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[9px]">
                            {item?.size || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black text-[9px]">
                            {item?.qty || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black uppercase text-[9px]">
                            {item?.material || item?.finish || (item ? neopreneData.basePolymer : '—')}
                          </td>
                          <td className="p-0.5 text-center font-bold text-black text-[9px]">
                            {item ? (item.observedCoating ?? (item.heatNo || '—')) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {showTechInfo && (
              <>
                {/* 2. SPECIFICATIONS & PROPERTIES TEST TABLE */}
                <div className="border border-black bg-white text-[9px]">
                  <table className="w-full text-center border-collapse text-[9px] table-fixed">
                    <thead>
                      <tr className="bg-slate-100 font-bold italic border-b border-black text-black text-[9px] leading-tight">
                        <th className="border-r border-black p-0.5 w-[6%] font-bold italic">Sr No</th>
                        <th className="border-r border-black p-0.5 w-[38%] font-bold italic text-left px-1.5">Properties</th>
                        <th className="border-r border-black p-0.5 w-[20%] font-bold italic">Test Method</th>
                        <th className="border-r border-black p-0.5 w-[16%] font-bold italic">Unit</th>
                        <th className="p-0.5 w-[20%] font-bold italic">Specification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {/* BASE POLYMER */}
                      <tr>
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">1</td>
                        <td className="border-r border-black p-0.5 text-left font-bold italic text-black px-1.5">Base Polymer</td>
                        <td className="border-r border-black p-0.5 text-center font-medium text-slate-500">—</td>
                        <td colSpan={2} className="p-0.5 text-center font-bold text-black text-[9.5px]">
                          {neopreneData.basePolymer}
                        </td>
                      </tr>

                      {/* COLOUR */}
                      <tr>
                        <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">2</td>
                        <td className="border-r border-black p-0.5 text-left font-bold italic text-black px-1.5">Colour</td>
                        <td className="border-r border-black p-0.5 text-center font-medium text-slate-500">—</td>
                        <td colSpan={2} className="p-0.5 text-center font-bold text-black text-[9.5px]">
                          {neopreneData.colour}
                        </td>
                      </tr>

                      {/* PHYSICAL PROPERTIES BANNER */}
                      <tr className="bg-slate-100/80 border-t border-b border-black">
                        <td colSpan={5} className="p-0.5 font-bold italic text-[9.5px] text-black text-center tracking-wide">
                          Physical Properties
                        </td>
                      </tr>

                      {/* PHYSICAL PROPERTY ROWS */}
                      {neopreneData.physicalProperties.map((row, pIdx) => {
                        const hasSubRows = Array.isArray(row.subRows) && row.subRows.length > 0;
                        return (
                          <React.Fragment key={pIdx}>
                            <tr>
                              <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">
                                {row.srNo}
                              </td>
                              <td className="border-r border-black p-0.5 text-left font-bold italic text-black px-1.5 whitespace-pre-line leading-tight text-[9px]">
                                {row.property}
                              </td>
                              <td className="border-r border-black p-0.5 text-center font-semibold text-black text-[9px]">
                                {row.testMethod}
                              </td>
                              <td className="border-r border-black p-0.5 text-center font-semibold text-black text-[9px]">
                                {row.unit}
                              </td>
                              <td className="p-0.5 text-center font-bold text-black text-[9px]">
                                {row.specification}
                              </td>
                            </tr>

                            {/* SUB ROWS IF PRESENT (e.g. Row 7 a, b, c) */}
                            {hasSubRows && row.subRows!.map((sub, sIdx) => (
                              <tr key={`${pIdx}-sub-${sIdx}`} className="bg-slate-50/20">
                                <td className="border-r border-black p-0.5 text-center font-bold text-[8.5px] text-slate-700">
                                  {sub.srNo}
                                </td>
                                <td className="border-r border-black p-0.5 text-left font-bold italic text-black px-3 text-[8.5px]">
                                  {sub.property}
                                </td>
                                <td className="border-r border-black p-0.5 text-center font-semibold text-black text-[8.5px]">
                                  {sub.testMethod}
                                </td>
                                <td className="border-r border-black p-0.5 text-center font-semibold text-black text-[8.5px]">
                                  {sub.unit}
                                </td>
                                <td className="p-0.5 text-center font-bold text-black text-[8.5px]">
                                  {sub.specification}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}

                      {/* GENERAL PROPERTIES BANNER */}
                      <tr className="bg-slate-100/80 border-t border-b border-black">
                        <td colSpan={5} className="p-0.5 font-bold italic text-[9.5px] text-black text-center tracking-wide">
                          General Properties
                        </td>
                      </tr>

                      {/* GENERAL PROPERTIES ROWS */}
                      {neopreneData.generalProperties.map((gen, gIdx) => (
                        <tr key={`gen-${gIdx}`}>
                          <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[9px]">
                            {gen.srNo}
                          </td>
                          <td className="border-r border-black p-0.5 text-left font-bold italic text-black px-1.5 text-[9px]">
                            {gen.property}
                          </td>
                          <td colSpan={3} className="p-0.5 text-center font-bold italic text-black text-[9px]">
                            {gen.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3. NOTE BOX */}
                <div className="border border-black p-1 bg-white">
                  <p className="text-[8.5px] italic text-black leading-snug">
                    {neopreneData.note}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : isTeflonPrint ? (
          /* TEFLON COATING TEST REPORT PRINT/PDF LAYOUT */
          <div className="space-y-1">
            {/* 1. FASTENERS ITEMS TABLE (5 COLUMNS) */}
            {(displayItems.length > 0 || !showTechInfo) && (
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold italic border-b border-black text-black text-[8.5px] leading-tight">
                      <th className="border-r border-black p-0.5 w-[6%] font-bold italic">SL. NO.</th>
                      <th className="border-r border-black p-0.5 w-[46%] font-bold italic text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-0.5 w-[18%] font-bold italic">SIZE</th>
                      <th className="border-r border-black p-0.5 w-[15%] font-bold italic">QTY</th>
                      <th className="p-0.5 w-[15%] font-bold italic">COLOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {(displayItems.length > 0 ? displayItems : Array.from({ length: 5 })).map((item: any, idx: number) => {
                      const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (idx + 1));
                      return (
                        <tr key={item?.id || idx}>
                          <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[8.5px]">
                            {slNumber}
                          </td>
                          <td className="border-r border-black p-0.5 text-left font-medium text-black uppercase leading-tight text-[8.5px] px-1.5">
                            {item?.description || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">
                            {item?.size || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">
                            {item?.qty || '—'}
                          </td>
                          <td className="p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                            {item?.finish || item?.marking || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {showTechInfo && (
              <>
                {/* 2. MATERIAL OVERVIEW & SHORT DESCRIPTION */}
                <div className="border border-black bg-white p-1 space-y-0.5 text-[8.5px]">
                  <div className="flex flex-wrap items-center gap-x-6 border-b border-slate-200 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-black">Material:</span>
                      <span className="font-bold text-black">{teflonData.material}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-black">Abbreviation:</span>
                      <span className="font-bold text-black">{teflonData.abbreviation}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 pt-0.5">
                    <div className="font-bold italic text-black text-[8px]">
                      {teflonData.shortDescriptionLabel}
                    </div>
                    <p className="text-[7.5px] text-black text-justify leading-snug">
                      {teflonData.shortDescriptionText}
                    </p>
                  </div>
                </div>

                {/* 3. TECHNICAL PROPERTIES TABLES (BALANCED 2-COLUMN GRID) */}
                <div className="border border-black bg-white overflow-hidden grid grid-cols-2 divide-x divide-black text-[8px]">
                  {/* LEFT COLUMN: MECHANICAL VALUES */}
                  <div className="flex flex-col">
                    <table className="w-full border-collapse text-[7.5px] table-fixed">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-black text-[7.5px]">
                          <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Mechanical values</th>
                          <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                          <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                          <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {teflonData.mechanicalValues.map((row, rIdx) => (
                          <tr key={`mech-${rIdx}`}>
                            <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                              {row.property}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-semibold text-black">
                              {row.standard}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-bold text-black">
                              {row.dryHumid}
                            </td>
                            <td className="p-0.5 text-center font-semibold text-black">
                              {row.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* RIGHT COLUMN: THERMAL, ELECTRICAL & MISCELLANEOUS VALUES */}
                  <div className="flex flex-col divide-y divide-black">
                    {/* THERMAL VALUES */}
                    <table className="w-full border-collapse text-[7.5px] table-fixed">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-black text-[7.5px]">
                          <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Thermal values</th>
                          <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                          <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                          <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {teflonData.thermalValues.map((row, rIdx) => (
                          <tr key={`therm-${rIdx}`}>
                            <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                              {row.property}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-semibold text-black">
                              {row.standard}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-bold text-black">
                              {row.dryHumid}
                            </td>
                            <td className="p-0.5 text-center font-semibold text-black">
                              {row.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* ELECTRICAL VALUES */}
                    <table className="w-full border-collapse text-[7.5px] table-fixed">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-black text-[7.5px]">
                          <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Electrical values</th>
                          <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                          <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                          <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {teflonData.electricalValues.map((row, rIdx) => (
                          <tr key={`elec-${rIdx}`}>
                            <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                              {row.property}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-semibold text-black">
                              {row.standard}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-bold text-black">
                              {row.dryHumid}
                            </td>
                            <td className="p-0.5 text-center font-semibold text-black">
                              {row.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* MISCELLANEOUS DATA */}
                    <table className="w-full border-collapse text-[7.5px] table-fixed">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-black text-[7.5px]">
                          <th className="border-r border-black p-0.5 text-left px-1.5 w-[46%] font-bold italic">Miscellaneous data</th>
                          <th className="border-r border-black p-0.5 text-center w-[22%] font-semibold">Standard</th>
                          <th className="border-r border-black p-0.5 text-center w-[18%] font-bold italic">dry / humid</th>
                          <th className="p-0.5 text-center w-[14%] font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {teflonData.miscellaneousValues.map((row, rIdx) => (
                          <tr key={`misc-${rIdx}`}>
                            <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black">
                              {row.property}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-semibold text-black">
                              {row.standard}
                            </td>
                            <td className="border-r border-black p-0.5 text-center font-bold text-black">
                              {row.dryHumid}
                            </td>
                            <td className="p-0.5 text-center font-semibold text-black">
                              {row.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. FOOTNOTES & CONVERSIONS */}
                <div className="border border-black p-1 bg-white space-y-0.5 text-[7.5px]">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {teflonData.footnotes.map((fn, fIdx) => (
                      <p key={`fn-${fIdx}`} className="text-[7px] italic text-black whitespace-pre-line leading-tight">
                        {fn}
                      </p>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 pt-0.5 border-t border-slate-200">
                    {teflonData.conversions.map((cv, cIdx) => (
                      <span key={`cv-${cIdx}`} className="font-bold text-[7px] text-black">
                        {cv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 5. DISCLAIMER NOTE */}
                <div className="border border-black p-1 bg-white">
                  <p className="text-[7px] text-justify text-black leading-tight">
                    {teflonData.disclaimerNote}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : isFluropolymerPrint ? (
          /* FLUROPOLYMER COATING TEST REPORT PRINT/PDF VIEW */
          <div className="space-y-1">
            {/* 1. DESCRIPTION BOX */}
            <div className="border border-black flex text-[8.5px] bg-white">
              <div className="w-[18%] font-bold text-black border-r border-black p-0.5 px-1.5 bg-slate-50 flex items-center">
                {fluropolymerData.descriptionLabel || 'Description'}
              </div>
              <div className="flex-1 p-0.5 px-1.5 font-semibold text-black text-[8.5px] leading-tight">
                {fluropolymerData.descriptionText}
              </div>
            </div>

            {/* 2. FASTENERS ITEMS TABLE IF DISPLAY ITEMS EXIST */}
            {displayItems && displayItems.length > 0 && (
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold italic border-b border-black text-black text-[8.5px] leading-tight">
                      <th className="border-r border-black p-0.5 w-[5%] font-bold">SL. NO.</th>
                      <th className="border-r border-black p-0.5 w-[12%] font-bold">FINISH</th>
                      <th className="border-r border-black p-0.5 w-[27%] font-bold text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-0.5 w-[13%] font-bold">SIZE</th>
                      <th className="border-r border-black p-0.5 w-[8%] font-bold">QTY</th>
                      <th className="border-r border-black p-0.5 w-[19%] font-bold">HEAT NUMBER</th>
                      <th className="p-0.5 w-[16%] font-bold">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {displayItems.map((item: any, idx: number) => {
                      const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (idx + 1));
                      return (
                        <tr key={item?.id || idx}>
                          <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[8.5px]">
                            {slNumber}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                            {item?.finish || 'FLUROPOLYMER'}
                          </td>
                          <td className="border-r border-black p-0.5 text-left font-medium text-black uppercase leading-tight text-[8.5px] px-1.5">
                            {item?.description || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">
                            {item?.size || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">
                            {item?.qty || '—'}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">
                            {item?.heatNo || '—'}
                          </td>
                          <td className="p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                            {item?.remark || 'SATISFACTORY'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. TECHNICAL EVALUATION & SPECIFICATION MATRIX (09-SAMSS-107) */}
            <div className="border border-black overflow-hidden bg-white">
              <table className="w-full border-collapse text-[8.5px] table-fixed">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px]">
                    <th className="border-r border-black p-0.5 w-[6%] text-center font-bold">SR NO</th>
                    <th className="border-r border-black p-0.5 w-[30%] text-left px-1.5 font-bold">PARAMETER / TEST</th>
                    <th className="p-0.5 w-[64%] text-left px-1.5 font-bold">SPECIFICATION / INSPECTION RESULTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {fluropolymerData.rows.map((row, rIdx) => (
                    <tr key={`fluro-print-${rIdx}`}>
                      {row.isFullWidth ? (
                        <>
                          <td className="border-r border-black p-0.5 text-center font-bold bg-slate-50 text-slate-800 text-[8.5px]">
                            {rIdx + 1}
                          </td>
                          <td colSpan={2} className="p-0.5 px-1.5 text-left bg-slate-50/30">
                            <span className="font-bold text-black">{row.parameter}: </span>
                            <span className="font-medium text-black">{row.specification}</span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border-r border-black p-0.5 text-center font-bold bg-slate-50 text-slate-800 text-[8.5px]">
                            {rIdx + 1}
                          </td>
                          <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[8.5px]">
                            {row.parameter}
                          </td>
                          <td className="p-0.5 px-1.5 text-left font-medium text-black text-[8.5px] leading-tight">
                            {row.specification}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. OFFICIAL CERTIFICATION & REMARKS */}
            {showRemarksAndSignatures && (
              <div className="border border-black bg-slate-50/50 p-1 space-y-0.5 text-[8.5px]">
                {fluropolymerData.certificationText && (
                  <div className="font-bold uppercase text-black text-[8px] leading-tight">
                    {fluropolymerData.certificationText}
                  </div>
                )}
                {fluropolymerData.remarks && (
                  <div className="flex items-center gap-1 text-[8.5px]">
                    <span className="font-black uppercase text-black shrink-0">REMARKS:</span>
                    <span className="font-bold text-black uppercase">{fluropolymerData.remarks}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isCooPrint ? (
          /* COUNTRY OF ORIGIN (COO) PRINT/PDF VIEW */
          <div className="space-y-1">
            {/* COO ITEMS TABLE */}
            {displayItems && displayItems.length > 0 && (
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[8.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px] leading-tight">
                      <th className="border-r border-black p-0.5 w-[5%] font-bold">SL. NO.</th>
                      <th className="border-r border-black p-0.5 w-[24%] font-bold text-left px-1.5">DESCRIPTION OF GOODS</th>
                      <th className="border-r border-black p-0.5 w-[14%] font-bold">SIZE / DIMENSION</th>
                      <th className="border-r border-black p-0.5 w-[8%] font-bold">QTY</th>
                      <th className="border-r border-black p-0.5 w-[14%] font-bold">HEAT / BATCH NO.</th>
                      <th className="border-r border-black p-0.5 w-[9%] font-bold">ORIGIN</th>
                      <th className="p-0.5 w-[26%] font-bold">MANUFACTURER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {displayItems.map((item: any, idx: number) => {
                      const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (idx + 1));
                      return (
                        <tr key={item?.id || idx}>
                          <td className="border-r border-black p-0.5 font-bold bg-slate-50 text-slate-800 text-[8.5px]">
                            {slNumber}
                          </td>
                          <td className="border-r border-black p-0.5 text-left font-bold text-black uppercase leading-tight text-[8.5px] px-1.5">
                            {item?.description || ''}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">
                            {item?.size || ''}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">
                            {item?.qty || ''}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">
                            {item?.heatNo || ''}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                            {item?.finish || ''}
                          </td>
                          <td className="p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                            {item?.manufacturer !== undefined ? item.manufacturer : (item?.remark || '')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. OFFICIAL DECLARATION CLAUSE */}
            {showRemarksAndSignatures && (
              <div className="border border-black bg-white p-1 text-[8px]">
                {cooData.declarationClause && (
                  <div className="text-[7.5px] font-medium text-black leading-snug text-justify">
                    {renderDeclarationWithBolds(cooData.declarationClause, record.companyName, record.customerName)}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isCocPrint ? (
          /* CERTIFICATE OF CONFORMITY (COC) PRINT/PDF VIEW */
          <div className="space-y-4 flex flex-col justify-between h-full pt-1">
            <div className="space-y-4">
              {/* 1. INTRODUCTORY CERTIFICATION DECLARATION */}
              {showMetadata && (
                <div className="px-3 text-center text-[10.5px] leading-relaxed text-black font-medium">
                  {renderDeclarationWithBolds(cocData.introText, record.companyName, record.customerName)}
                </div>
              )}

              {/* 2. CONSIGNMENT ITEMS TABLE */}
              {displayItems && displayItems.length > 0 && (
                <div className="border border-black overflow-hidden bg-white">
                  <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-black text-black text-[9.5px] leading-tight">
                        <th className="border-r border-black p-1 w-[8%] font-bold">ITEM NO.</th>
                        <th className="border-r border-black p-1 w-[38%] font-bold text-left px-2">DESCRIPTION</th>
                        <th className="border-r border-black p-1 w-[18%] font-bold">SIZE</th>
                        <th className="border-r border-black p-1 w-[12%] font-bold">FINISH</th>
                        <th className="border-r border-black p-1 w-[10%] font-bold">QTY</th>
                        <th className="p-1 w-[14%] font-bold">HEAT NO.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {displayItems.map((item: any, idx: number) => {
                        const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (idx + 1));
                        return (
                          <tr key={item?.id || idx} className="h-6">
                            <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                              {slNumber}
                            </td>
                            <td className="border-r border-black p-1 text-left font-bold text-black uppercase leading-tight text-[9.5px] px-2">
                              {item?.description || ''}
                            </td>
                            <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                              {item?.size || ''}
                            </td>
                            <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                              {item?.finish || ''}
                            </td>
                            <td className="border-r border-black p-1 text-center font-bold text-black text-[9.5px]">
                              {item?.qty || ''}
                            </td>
                            <td className="p-1 text-center font-semibold text-black text-[9.5px]">
                              {item?.heatNo || ''}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Empty padding rows if under 6 items to keep image.png visual balance */}
                      {displayItems.length < 6 && Array.from({ length: 6 - displayItems.length }).map((_, emptyIdx) => (
                        <tr key={`empty-${emptyIdx}`} className="h-6">
                          <td className="border-r border-black p-1 bg-slate-50/30 text-transparent">&nbsp;</td>
                          <td className="border-r border-black p-1">&nbsp;</td>
                          <td className="border-r border-black p-1">&nbsp;</td>
                          <td className="border-r border-black p-1">&nbsp;</td>
                          <td className="border-r border-black p-1">&nbsp;</td>
                          <td className="p-1">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. CONFORMANCE & INSPECTION CLAUSE */}
              {showRemarksAndSignatures && (
                <div className="px-4 pt-2 text-center text-[10px] leading-relaxed text-black font-medium">
                  {renderDeclarationWithBolds(cocData.conformanceText, record.companyName, record.customerName)}
                </div>
              )}
            </div>
          </div>
        ) : isCompliancePrint ? (
          /* COMPLIANCE REPORT PRINT VIEW */
          <div className="space-y-2">
            {/* 1. INTRODUCTORY CERTIFICATION DECLARATION */}
            {showMetadata && (
              <div className="px-3 py-1 text-center text-[10px] leading-relaxed text-black font-medium">
                {renderDeclarationWithBolds(complianceData.introText, record.companyName, record.customerName)}
              </div>
            )}

            {/* 2. COMPLIANCE ITEMS TABLE */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[6%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[40%] text-left px-2">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[16%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[18%]">STANDARD</th>
                      <th className="border-r border-black p-1 w-[10%]">FINISH</th>
                      <th className="p-1 w-[10%]">QTY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {displayItems.map((item: any, idx: number) => {
                      const actualIdx = ((pageNum - 1) * 20) + idx;
                      return (
                        <tr key={item?.id || idx} className="h-6">
                          <td className="border-r border-black p-1 font-bold bg-slate-50/50 text-slate-900 text-[10px]">
                            {actualIdx + 1}
                          </td>
                          <td className="border-r border-black p-1 px-2 text-left font-bold text-black uppercase text-[10px] leading-tight">
                            {item?.description || ''}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[10px]">
                            {item?.size || ''}
                          </td>
                          <td className="border-r border-black p-1 text-center font-semibold text-black uppercase text-[9.5px]">
                            {item?.standard || ''}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                            {item?.finish || ''}
                          </td>
                          <td className="p-1 text-center font-bold text-black text-[10px]">
                            {item?.qty || ''}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Empty padding rows if under 6 items to keep visual balance */}
                    {displayItems.length < 6 && Array.from({ length: 6 - displayItems.length }).map((_, emptyIdx) => (
                      <tr key={`empty-${emptyIdx}`} className="h-6">
                        <td className="border-r border-black p-1 bg-slate-50/30 text-transparent">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="p-1">&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. CONFORMANCE & SPECIFICATION STATEMENT */}
            {showRemarksAndSignatures && (
              <div className="px-3 pt-1 text-center text-[10px] leading-relaxed text-black font-medium">
                {renderDeclarationWithBolds(complianceData.conformanceText, record.companyName, record.customerName)}
              </div>
            )}
          </div>
        ) : isWarrantyPrint ? (
          /* WARRANTY CERTIFICATE PRINT VIEW */
          <div className="space-y-2">
            {/* 1. INTRODUCTORY WARRANTY DECLARATION */}
            {showMetadata && (
              <div className="px-3 py-1 text-center text-[10px] leading-relaxed text-black font-medium">
                {renderDeclarationWithBolds(warrantyData.introText, record.companyName, record.customerName)}
              </div>
            )}

            {/* 2. WARRANTY ITEMS TABLE (6 COLUMNS: ITEM NO., DESCRIPTION, SIZE, FINISH, QTY, HEAT NO.) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9.5px] leading-tight">
                      <th className="border-r border-black p-1 w-[7%]">ITEM NO.</th>
                      <th className="border-r border-black p-1 w-[45%] text-left px-2">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[16%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[10%]">FINISH</th>
                      <th className="border-r border-black p-1 w-[9%]">QTY</th>
                      <th className="p-1 w-[13%]">HEAT NO.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {displayItems.map((item: any, idx: number) => {
                      const actualIdx = ((pageNum - 1) * 20) + idx;
                      return (
                        <tr key={item?.id || idx} className="h-6">
                          <td className="border-r border-black p-1 font-bold bg-slate-50/50 text-slate-900 text-[10px]">
                            {actualIdx + 1}
                          </td>
                          <td className="border-r border-black p-1 px-2 text-left font-bold text-black uppercase text-[10px] leading-tight">
                            {item?.description || ''}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[10px]">
                            {item?.size || ''}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                            {item?.finish || ''}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black text-[10px]">
                            {item?.qty || ''}
                          </td>
                          <td className="p-1 text-center font-semibold text-black uppercase text-[9.5px]">
                            {item?.heatNo || ''}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Empty padding rows if under 6 items to keep visual balance */}
                    {displayItems.length < 6 && Array.from({ length: 6 - displayItems.length }).map((_, emptyIdx) => (
                      <tr key={`empty-${emptyIdx}`} className="h-6">
                        <td className="border-r border-black p-1 bg-slate-50/30 text-transparent">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="border-r border-black p-1">&nbsp;</td>
                        <td className="p-1">&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. WARRANTY PERIOD & POLICY STATEMENT */}
            {showRemarksAndSignatures && (
              <div className="px-3 pt-1 text-center text-[10px] leading-relaxed text-black font-medium">
                {renderDeclarationWithBolds(warrantyData.warrantyPeriodText, record.companyName, record.customerName)}
              </div>
            )}
          </div>
        ) : isInspectionPrint ? (
          /* QC INSPECTION REPORT PRINT/PDF VIEW (2-PAGE OPTIMIZED) */
          <div className="space-y-1">
            {pageNum === 1 && (
              <>
                {/* 1. INSPECTION CRITERIA & METADATA BAR (PRINT VIEW) */}
                {(() => {
                  const showStandard = Boolean(inspectionData.showInspectionStandard);
                  const showSampling = Boolean(inspectionData.showSamplingPlan);
                  const activeBlocks = [
                    showStandard && { label: 'Inspection Standard:', value: inspectionData.inspectionStandard || 'ISO 3269 / ASME B18.18 / ISO 2859-1' },
                    showSampling && { label: 'Sampling Plan / Level:', value: inspectionData.samplingPlan || 'ISO 2859-1 Level II / AQL 1.0' },
                    { label: 'Inspection Stage:', value: inspectionData.inspectionStage || 'FINAL PRE-SHIPMENT' },
                    { label: 'Overall Disposition:', value: inspectionData.dispositionStatus || 'CONFORMING / ACCEPTED', highlight: true }
                  ].filter(Boolean) as { label: string; value: string; highlight?: boolean }[];

                  const colsClass = activeBlocks.length === 4 ? 'grid-cols-4' : activeBlocks.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

                  return (
                    <div className="border border-black bg-white text-[9px]">
                      <div className="bg-slate-100 border-b border-black px-1.5 py-0.5 font-bold text-black text-[9px] uppercase tracking-wide flex items-center justify-between">
                        <span>INSPECTION STANDARD & SAMPLING CRITERIA</span>
                        <span className="font-bold text-black">STAGE: {inspectionData.inspectionStage || 'FINAL PRE-SHIPMENT'}</span>
                      </div>
                      <div className={`grid ${colsClass} divide-x divide-y divide-black`}>
                        {activeBlocks.map((blk, bIdx) => (
                          <div key={bIdx} className="p-1 px-1.5">
                            <div className="font-bold text-[8px] text-slate-700 uppercase">{blk.label}</div>
                            <div className={`font-bold text-[9px] uppercase ${blk.highlight ? 'text-black text-[9.5px]' : 'text-black'}`}>{blk.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. CONSIGNMENT ITEMS TABLE */}
                {displayItems && displayItems.length > 0 && (
                  <div className="border border-black overflow-hidden bg-white">
                    <table className="w-full text-center border-collapse text-[9.5px] table-fixed">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-black text-[9.5px] leading-tight">
                          <th className="border-r border-black p-1 w-[4%] font-bold">SL</th>
                          <th className="border-r border-black p-1 w-[25%] font-bold text-left px-1.5">ITEM DESCRIPTION</th>
                          <th className="border-r border-black p-1 w-[10%] font-bold text-center px-1">GRADE</th>
                          <th className="border-r border-black p-1 w-[12%] font-bold text-center px-1">SIZE</th>
                          <th className="border-r border-black p-1 w-[8%] font-bold text-center px-1">UNIT</th>
                          <th className="border-r border-black p-1 w-[11%] font-bold">ORDERED QTY</th>
                          <th className="border-r border-black p-1 w-[11%] font-bold">SUPPLIED QTY</th>
                          <th className="border-r border-black p-1 w-[9%] font-bold">SHORTAGE</th>
                          <th className="p-1 w-[10%] font-bold">MARKING</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {displayItems.map((item: any, idx: number) => {
                          const slNumber = item?.itemNo || (item?.idx !== undefined ? item.idx + 1 : (idx + 1));
                          const shortageVal = item?.observedCoating ?? calcShortageQty(item?.orderedQty, item?.qty);
                          return (
                            <tr key={item?.id || idx}>
                              <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9.5px]">
                                {slNumber}
                              </td>
                              <td className="border-r border-black p-1 text-left font-bold text-black uppercase leading-tight text-[9.5px] px-1.5">
                                {item?.description || ''}
                              </td>
                              <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                                {item?.finish || item?.material || ''}
                              </td>
                              <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                                {item?.size || ''}
                              </td>
                              <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9.5px]">
                                {item?.standard || ''}
                              </td>
                              <td className="border-r border-black p-1 text-center font-medium text-black text-[9.5px]">
                                {item?.orderedQty || ''}
                              </td>
                              <td className="border-r border-black p-1 text-center font-bold text-black text-[9.5px]">
                                {item?.qty || ''}
                              </td>
                              <td className="border-r border-black p-1 text-center font-bold text-slate-800 uppercase text-[9.5px]">
                                {shortageVal || ''}
                              </td>
                              <td className="p-1 text-center font-black text-black uppercase text-[9.5px]">
                                <div className="flex flex-row items-center justify-center gap-1.5">
                                  {item?.markingImage && (
                                    <img
                                      src={item.markingImage}
                                      alt="Marking"
                                      className="max-h-5 max-w-[28px] w-auto object-contain shrink-0"
                                    />
                                  )}
                                  {item?.marking ? (
                                    <span>{item.marking}</span>
                                  ) : (!item?.markingImage && item?.coatingMicronsMin ? (
                                    <span>{item.coatingMicronsMin}</span>
                                  ) : null)}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. TECHNICAL DRAWING & HEAD MARKING BOXES (PRINT VIEW - BALANCED PROPORTIONS) */}
                {(() => {
                  const size = inspectionData.pdfImageSize || 'standard';
                  const isExtraLarge = size === 'extralarge' || size === 'full';
                  const isStandard = size === 'standard';
                  
                  const boxHeightClass = isExtraLarge
                    ? 'min-h-[250px] max-h-[290px] h-[270px]'
                    : isStandard
                    ? 'min-h-[200px] max-h-[240px] h-[220px]'
                    : 'min-h-[160px] max-h-[200px] h-[180px]';

                  const imgHeightClass = isExtraLarge
                    ? 'max-h-[250px]'
                    : isStandard
                    ? 'max-h-[200px]'
                    : 'max-h-[160px]';

                  const hasDrawing = Boolean(inspectionData.drawingImageUrl);
                  const hasMarking = Boolean(inspectionData.markingImageUrl);
                  const isFullWidthDrawing = inspectionData.drawingFullWidth || (hasDrawing && !hasMarking);
                  const isFullWidthMarking = inspectionData.markingFullWidth || (hasMarking && !hasDrawing);

                  if (isFullWidthDrawing && !hasMarking) {
                    return (
                      <div className="border border-black bg-white overflow-hidden flex flex-col">
                        <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-0.5 uppercase tracking-wide text-[8.5px] flex items-center justify-between">
                          <span>TECHNICAL DRAWING & SPECIFICATION</span>
                          <span className="font-mono text-[8px] text-slate-700">{inspectionData.drawingNumber || 'DWG-MFI-QC-001'}</span>
                        </div>
                        <div className={`p-1.5 flex flex-col items-center justify-center flex-1 ${boxHeightClass} bg-slate-50/20 overflow-hidden`}>
                          <img
                            src={inspectionData.drawingImageUrl}
                            alt="Drawing"
                            className={`${imgHeightClass} w-auto max-w-full object-contain block mx-auto`}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (isFullWidthMarking && !hasDrawing) {
                    return (
                      <div className="border border-black bg-white overflow-hidden flex flex-col">
                        <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-0.5 uppercase tracking-wide text-[8.5px] flex items-center justify-between">
                          <span>TECHNICAL DRAWING & SPECIFICATION</span>
                        </div>
                        <div className={`p-1.5 flex flex-col items-center justify-center flex-1 ${boxHeightClass} bg-slate-50/20 overflow-hidden`}>
                          <img
                            src={inspectionData.markingImageUrl}
                            alt="Drawing / Specification"
                            className={`${imgHeightClass} w-auto max-w-full object-contain block mx-auto`}
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-1.5 text-[8.5px]">
                      {/* DRAWING BOX */}
                      <div className="border border-black bg-white overflow-hidden flex flex-col">
                        <div className="bg-slate-100 font-bold border-b border-black text-black px-1.5 py-0.5 uppercase tracking-wide text-[8px] flex items-center justify-between">
                          <span>TECHNICAL DRAWING & SPECIFICATION</span>
                          {inspectionData.drawingNumber && (
                            <span className="font-mono text-[7.5px] text-slate-700">{inspectionData.drawingNumber}</span>
                          )}
                        </div>
                        <div className={`p-1.5 flex flex-col items-center justify-center flex-1 ${boxHeightClass} bg-slate-50/20 overflow-hidden`}>
                          {inspectionData.drawingImageUrl ? (
                            <img
                              src={inspectionData.drawingImageUrl}
                              alt="Drawing"
                              className={`${imgHeightClass} w-auto max-w-full object-contain block mx-auto`}
                            />
                          ) : (
                            <div className="text-center font-bold text-[8.5px] text-slate-400 p-4">
                              TECHNICAL DRAWING: {inspectionData.drawingNumber || 'STANDARD SPECIFICATION'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SPECIFICATION / MARKING BOX */}
                      <div className="border border-black bg-white overflow-hidden flex flex-col">
                        <div className="bg-slate-100 font-bold border-b border-black text-black px-1.5 py-0.5 uppercase tracking-wide text-[8px] flex items-center justify-between">
                          <span>TECHNICAL DRAWING & SPECIFICATION</span>
                        </div>
                        <div className={`p-1.5 flex flex-col items-center justify-center flex-1 ${boxHeightClass} bg-slate-50/20 overflow-hidden`}>
                          {inspectionData.markingImageUrl ? (
                            <img
                              src={inspectionData.markingImageUrl}
                              alt="Specification Drawing"
                              className={`${imgHeightClass} w-auto max-w-full object-contain block mx-auto`}
                            />
                          ) : (
                            <div className="text-center font-bold text-[8.5px] text-slate-400 p-4">
                              TECHNICAL DRAWING & SPECIFICATION
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. DIMENSIONAL MATRIX IF NOT MOVED TO PAGE 2 (AND NO PHOTOS PRESENT) */}
                {!inspectionData.moveCharacteristicsToPage2 && (!inspectionData.additionalPhotos || inspectionData.additionalPhotos.length === 0) && inspectionData.dimensionalRows && inspectionData.dimensionalRows.length > 0 && (() => {
                  const showSs = inspectionData.showSsColumn !== false;
                  const showPass = inspectionData.showPassColumn !== false;
                  const showRej = inspectionData.showRejColumn !== false;
                  const showSpec = inspectionData.showSpecColumn !== false;
                  const showTest = inspectionData.showTestMethodColumn !== false;
                  const totalCols = 3 + (showSs ? 1 : 0) + (showPass ? 1 : 0) + (showRej ? 1 : 0) + (showSpec ? 1 : 0) + (showTest ? 1 : 0);
                  const visibleRows = (inspectionData.dimensionalRows || []).filter(r => r.checked !== false);

                  if (visibleRows.length === 0) return null;

                  return (
                    <div className="border border-black overflow-hidden bg-white">
                      <table className="w-full border-collapse text-[8.5px] table-fixed">
                        <thead>
                          <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px] leading-tight">
                            <th className="border-r border-black p-0.5 w-[24%] text-left px-1 font-bold">Characteristic</th>
                            <th className="border-r border-black p-0.5 w-[18%] text-center px-0.5 font-bold">Requirements</th>
                            <th className="border-r border-black p-0.5 w-[16%] text-center px-0.5 font-bold">Results</th>
                            {showSs && <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">S/S</th>}
                            {showPass && <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">Pass</th>}
                            {showRej && <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">Rej</th>}
                            {showSpec && <th className="border-r border-black p-0.5 w-[14%] text-center px-0.5 font-bold">Specification</th>}
                            {showTest && <th className="p-0.5 w-[18%] text-left px-1 font-bold">Test Method / [Device*1] / (Plan*2)</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                          <tr className="bg-slate-50 font-black border-b border-black text-black text-[8.5px]">
                            <td colSpan={totalCols} className="p-0.5 px-1 font-bold uppercase tracking-wide">Dimensional inspections</td>
                          </tr>
                          {visibleRows.map((dimRow, dIdx) => (
                            <tr key={`dim-print-p1-${dIdx}`}>
                              <td className="border-r border-black p-0.5 px-1 text-left font-bold text-black text-[8.5px]">{dimRow.characteristic}</td>
                              <td className="border-r border-black p-0.5 px-0.5 text-center font-medium text-black text-[8.5px]">{dimRow.requirements || '—'}</td>
                              <td className="border-r border-black p-0.5 px-0.5 text-center font-bold text-slate-900 text-[8.5px]">{dimRow.results || '—'}</td>
                              {showSs && <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">{dimRow.ssChecked !== false ? (dimRow.sampleSize || '—') : '—'}</td>}
                              {showPass && <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">{dimRow.passChecked !== false ? (dimRow.passQty || '—') : '—'}</td>}
                              {showRej && <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">{dimRow.rejChecked !== false ? (dimRow.rejQty || '0') : '0'}</td>}
                              {showSpec && <td className="border-r border-black p-0.5 px-0.5 text-center font-medium text-black text-[8.5px] uppercase">{dimRow.specChecked !== false ? (dimRow.specification || '—') : '—'}</td>}
                              {showTest && <td className="p-0.5 px-1 text-left font-mono text-[7.5px] text-slate-800">{dimRow.testMethodChecked !== false ? (dimRow.testMethod || '—') : '—'}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </>
            )}

            {pageNum === 2 && (
              <>
                {/* IF 3 TOTAL PAGES: SHOW PHOTOGRAPHIC EVIDENCE GALLERY ON PAGE 2 */}
                {totalPages === 3 && inspectionData.additionalPhotos && inspectionData.additionalPhotos.length > 0 && (
                  <div className="border border-black overflow-hidden bg-white">
                    <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-0.5 text-[9px] uppercase tracking-wide flex items-center justify-between">
                      <span>VERIFIED PHOTOGRAPHIC EVIDENCE GALLERY</span>
                      <span className="text-[8px] text-emerald-800 font-bold">PRE-SHIPMENT VISUAL VERIFICATION</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50/30">
                      {inspectionData.additionalPhotos.map((photo, phIdx) => {
                        const photoSrc = photo.imageUrl || (photo as any).url;
                        return (
                          <div key={photo.id || phIdx} className="border border-black bg-white overflow-hidden flex flex-col shadow-2xs">
                            <div className="bg-slate-100 font-bold border-b border-black text-black px-2 py-1 uppercase tracking-wide text-[8.5px] flex items-center justify-between">
                              <span>{photo.title || `INSPECTION PHOTO ${phIdx + 1}`}</span>
                              <span className="text-[7.5px] text-slate-700 font-mono font-bold">VERIFIED</span>
                            </div>
                            <div className="p-2 flex items-center justify-center min-h-[220px] max-h-[300px] h-[260px] bg-slate-50/20 overflow-hidden">
                              {photoSrc ? (
                                <img
                                  src={photoSrc}
                                  alt={photo.title || 'Photo'}
                                  crossOrigin="anonymous"
                                  className="max-h-[240px] w-auto max-w-full object-contain block mx-auto"
                                />
                              ) : (
                                <span className="text-[8.5px] text-slate-400 font-bold">NO PHOTO ATTACHED</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* DIMENSIONAL MATRIX (IF MOVED TO PAGE 2 OR PHOTOS PRESENT) */}
                {(inspectionData.moveCharacteristicsToPage2 || (inspectionData.additionalPhotos && inspectionData.additionalPhotos.length > 0)) && inspectionData.dimensionalRows && inspectionData.dimensionalRows.length > 0 && (() => {
                  const showSs = inspectionData.showSsColumn !== false;
                  const showPass = inspectionData.showPassColumn !== false;
                  const showRej = inspectionData.showRejColumn !== false;
                  const showSpec = inspectionData.showSpecColumn !== false;
                  const showTest = inspectionData.showTestMethodColumn !== false;
                  const totalCols = 3 + (showSs ? 1 : 0) + (showPass ? 1 : 0) + (showRej ? 1 : 0) + (showSpec ? 1 : 0) + (showTest ? 1 : 0);
                  const visibleRows = (inspectionData.dimensionalRows || []).filter(r => r.checked !== false);

                  if (visibleRows.length === 0) return null;

                  return (
                    <div className="border border-black overflow-hidden bg-white">
                      <table className="w-full border-collapse text-[8.5px] table-fixed">
                        <thead>
                          <tr className="bg-slate-100 font-bold border-b border-black text-black text-[8.5px] leading-tight">
                            <th className="border-r border-black p-0.5 w-[24%] text-left px-1 font-bold">Characteristic</th>
                            <th className="border-r border-black p-0.5 w-[18%] text-center px-0.5 font-bold">Requirements</th>
                            <th className="border-r border-black p-0.5 w-[16%] text-center px-0.5 font-bold">Results</th>
                            {showSs && <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">S/S</th>}
                            {showPass && <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">Pass</th>}
                            {showRej && <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">Rej</th>}
                            {showSpec && <th className="border-r border-black p-0.5 w-[14%] text-center px-0.5 font-bold">Specification</th>}
                            {showTest && <th className="p-0.5 w-[18%] text-left px-1 font-bold">Test Method / [Device*1] / (Plan*2)</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                          <tr className="bg-slate-50 font-black border-b border-black text-black text-[8.5px]">
                            <td colSpan={totalCols} className="p-0.5 px-1 font-bold uppercase tracking-wide">Dimensional inspections</td>
                          </tr>
                          {visibleRows.map((dimRow, dIdx) => (
                            <tr key={`dim-print-p2-${dIdx}`}>
                              <td className="border-r border-black p-0.5 px-1 text-left font-bold text-black text-[8.5px]">{dimRow.characteristic}</td>
                              <td className="border-r border-black p-0.5 px-0.5 text-center font-medium text-black text-[8.5px]">{dimRow.requirements || '—'}</td>
                              <td className="border-r border-black p-0.5 px-0.5 text-center font-bold text-slate-900 text-[8.5px]">{dimRow.results || '—'}</td>
                              {showSs && <td className="border-r border-black p-0.5 text-center font-medium text-black text-[8.5px]">{dimRow.ssChecked !== false ? (dimRow.sampleSize || '—') : '—'}</td>}
                              {showPass && <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">{dimRow.passChecked !== false ? (dimRow.passQty || '—') : '—'}</td>}
                              {showRej && <td className="border-r border-black p-0.5 text-center font-bold text-black text-[8.5px]">{dimRow.rejChecked !== false ? (dimRow.rejQty || '0') : '0'}</td>}
                              {showSpec && <td className="border-r border-black p-0.5 px-0.5 text-center font-medium text-black text-[8.5px] uppercase">{dimRow.specChecked !== false ? (dimRow.specification || '—') : '—'}</td>}
                              {showTest && <td className="p-0.5 px-1 text-left font-mono text-[7.5px] text-slate-800">{dimRow.testMethodChecked !== false ? (dimRow.testMethod || '—') : '—'}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* IF 2 TOTAL PAGES: SHOW GENERAL QUALITY & PACKAGING VERIFICATION ON PAGE 2 */}
                {totalPages !== 3 && (
                  <>
                    {/* 5. GENERAL QUALITY, COATING & PACKAGING VERIFICATION */}
                    {inspectionData.showGeneralQuality !== false && (() => {
                      const visibleParams = (inspectionData.parameters || []).filter(p => p.checked !== false);
                      if (visibleParams.length === 0) return null;

                      return (
                        <div className="border border-black overflow-hidden bg-white">
                          <div className="bg-slate-100 font-bold border-b border-black text-black px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                            GENERAL QUALITY, COATING & PACKAGING VERIFICATION
                          </div>
                          <table className="w-full border-collapse text-[9.5px] table-fixed">
                            <thead>
                              <tr className="bg-slate-50 font-bold border-b border-black text-black text-[9px]">
                                <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">SR NO</th>
                                <th className="border-r border-black p-0.5 w-[25%] text-left px-1.5 font-bold">INSPECTION PARAMETER</th>
                                <th className="border-r border-black p-0.5 w-[33%] text-left px-1.5 font-bold">CUSTOMER REQUIREMENT / SPECIFICATION</th>
                                <th className="border-r border-black p-0.5 w-[29%] text-left px-1.5 font-bold">SUPPLY DATA / OBSERVED RESULT</th>
                                <th className="p-0.5 w-[8%] text-center font-bold">STATUS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                              {visibleParams.map((param, pIdx) => (
                                <tr key={`insp-print-${pIdx}`}>
                                  <td className="border-r border-black p-0.5 text-center font-bold bg-slate-50 text-slate-800 text-[9px]">
                                    {pIdx + 1}
                                  </td>
                                  <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[9px]">
                                    {param.parameter}
                                  </td>
                                  <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black text-[8.5px] leading-tight">
                                    {param.customerRequirement}
                                  </td>
                                  <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[8.5px] leading-tight">
                                    {param.supplyData}
                                  </td>
                                  <td className="p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                                    {param.status || 'ACCEPTED'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}

                    {/* 6. CERTIFICATION & FINAL REMARKS */}
                    {showRemarksAndSignatures && (
                      <div className="border border-black bg-slate-50/50 p-1.5 space-y-0.5 text-[9px]">
                        {inspectionData.certificationText && (
                          <div className="font-bold uppercase text-black text-[8.5px] leading-tight">
                            {inspectionData.certificationText}
                          </div>
                        )}
                        {inspectionData.remarks && (
                          <div className="flex items-center gap-1 text-[9px]">
                            <span className="font-bold uppercase text-black shrink-0">FINAL REMARKS:</span>
                            <span className="font-bold text-black uppercase">{inspectionData.remarks}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {pageNum === 3 && (
              <>
                {/* 5. GENERAL QUALITY, COATING & PACKAGING VERIFICATION (PAGE 3) */}
                {inspectionData.showGeneralQuality !== false && (() => {
                  const visibleParams = (inspectionData.parameters || []).filter(p => p.checked !== false);
                  if (visibleParams.length === 0) return null;

                  return (
                    <div className="border border-black overflow-hidden bg-white">
                      <div className="bg-slate-100 font-bold border-b border-black text-black px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                        GENERAL QUALITY, COATING & PACKAGING VERIFICATION
                      </div>
                      <table className="w-full border-collapse text-[9.5px] table-fixed">
                        <thead>
                          <tr className="bg-slate-50 font-bold border-b border-black text-black text-[9px]">
                            <th className="border-r border-black p-0.5 w-[5%] text-center font-bold">SR NO</th>
                            <th className="border-r border-black p-0.5 w-[25%] text-left px-1.5 font-bold">INSPECTION PARAMETER</th>
                            <th className="border-r border-black p-0.5 w-[33%] text-left px-1.5 font-bold">CUSTOMER REQUIREMENT / SPECIFICATION</th>
                            <th className="border-r border-black p-0.5 w-[29%] text-left px-1.5 font-bold">SUPPLY DATA / OBSERVED RESULT</th>
                            <th className="p-0.5 w-[8%] text-center font-bold">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                          {visibleParams.map((param, pIdx) => (
                            <tr key={`insp-print-p3-${pIdx}`}>
                              <td className="border-r border-black p-0.5 text-center font-bold bg-slate-50 text-slate-800 text-[9px]">
                                {pIdx + 1}
                              </td>
                              <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[9px]">
                                {param.parameter}
                              </td>
                              <td className="border-r border-black p-0.5 px-1.5 text-left font-medium text-black text-[8.5px] leading-tight">
                                {param.customerRequirement}
                              </td>
                              <td className="border-r border-black p-0.5 px-1.5 text-left font-bold text-black text-[8.5px] leading-tight">
                                {param.supplyData}
                              </td>
                              <td className="p-0.5 text-center font-bold text-black uppercase text-[8.5px]">
                                {param.status || 'ACCEPTED'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

                {/* 6. CERTIFICATION & FINAL REMARKS (PAGE 3) */}
                {showRemarksAndSignatures && (
                  <div className="border border-black bg-slate-50/50 p-1.5 space-y-0.5 text-[9px]">
                    {inspectionData.certificationText && (
                      <div className="font-bold uppercase text-black text-[8.5px] leading-tight">
                        {inspectionData.certificationText}
                      </div>
                    )}
                    {inspectionData.remarks && (
                      <div className="flex items-center gap-1 text-[9px]">
                        <span className="font-bold uppercase text-black shrink-0">FINAL REMARKS:</span>
                        <span className="font-bold text-black uppercase">{inspectionData.remarks}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : isItpPrint ? (
          /* INSPECTION AND TEST PLAN (ITP) PRINT / PDF TEMPLATE */
          <div className="space-y-1.5 font-sans" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
            {/* 1. ITP SCOPE & METADATA GRID (PAGE 1 OR SINGLE PAGE) */}
            {pageNum === 1 ? (
              <div className="border border-black bg-white text-[9px]">
                <div className="bg-slate-100 border-b border-black px-2 py-0.5 font-black text-black text-[9.5px] uppercase tracking-wide flex items-center justify-between">
                  <span>PROJECT QUALITY PLAN & TECHNICAL SPECIFICATION SCOPE</span>
                  <span className="font-bold text-black">{itpData.itpRevision || 'REV 00'} • {itpData.revisionDate || record.date || ''}</span>
                </div>
                <div className="grid grid-cols-4 divide-x divide-y divide-black">
                  <div className="p-1 px-1.5 col-span-2">
                    <span className="font-bold text-[8px] text-slate-700 uppercase block">Project Name:</span>
                    <span className="font-black text-[9.5px] text-black uppercase">{itpData.projectName || record.customerName || '—'}</span>
                  </div>
                  <div className="p-1 px-1.5">
                    <span className="font-bold text-[8px] text-slate-700 uppercase block">Client / Contractor:</span>
                    <span className="font-bold text-[9px] text-black uppercase">{itpData.clientName || record.customerName || '—'}</span>
                  </div>
                  <div className="p-1 px-1.5">
                    <span className="font-bold text-[8px] text-slate-700 uppercase block">Contractor PO / LOA:</span>
                    <span className="font-bold text-[9px] text-black uppercase">{itpData.contractorPo || record.customerPoNum || '—'}</span>
                  </div>

                  <div className="p-1 px-1.5 col-span-2">
                    <span className="font-bold text-[8px] text-slate-700 uppercase block">Product / Material Description:</span>
                    <span className="font-bold text-[9px] text-black uppercase">{itpData.productDescription || 'HIGH TENSILE FASTENERS & STRUCTURAL HARDWARE'}</span>
                  </div>
                  <div className="p-1 px-1.5">
                    <span className="font-bold text-[8px] text-slate-700 uppercase block">Applicable Standards:</span>
                    <span className="font-bold text-[8.5px] text-black uppercase">{itpData.specStandard || 'ASTM / ASME / ISO / BS EN 10204 3.1'}</span>
                  </div>
                  <div className="p-1 px-1.5">
                    <span className="font-bold text-[8px] text-slate-700 uppercase block">ITP Document Ref:</span>
                    <span className="font-black text-[9px] text-black uppercase">{record.reportNo || record.certNo || 'ITP-QC-001'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CONTINUATION HEADER BANNER (PAGE 2+) */
              <div className="border border-black bg-slate-100 px-2 py-0.5 font-black text-black text-[9px] uppercase tracking-wide flex items-center justify-between">
                <span>PROJECT QUALITY PLAN & ACTIVITY SURVEILLANCE MATRIX (CONTINUED)</span>
                <span className="font-bold text-black">{itpData.projectName || record.customerName || '—'} • {record.reportNo || record.certNo || 'ITP-QC-001'}</span>
              </div>
            )}

            {/* 2. ITP SURVEILLANCE & ACTIVITY MATRIX TABLE */}
            {(() => {
              const activitiesToRender = (totalPages > 1 && items && items.length > 0)
                ? items.map(it => {
                    const idx = Number(it.id);
                    return itpData.activityRows[idx] || it;
                  }).filter(Boolean)
                : (totalPages > 1
                    ? (pageNum === 1
                        ? itpData.activityRows.slice(0, Math.ceil(itpData.activityRows.length / 2))
                        : itpData.activityRows.slice(Math.ceil(itpData.activityRows.length / 2)))
                    : itpData.activityRows);

              return (
                <div className="border border-black overflow-hidden bg-white">
                  <table className="w-full text-center border-collapse text-[9px] table-fixed">
                    <thead>
                      <tr className="bg-slate-100 font-black border-b border-black text-black text-[9px] leading-tight">
                        <th className="border-r border-black p-1 w-[4%]" rowSpan={2}>SL. NO.</th>
                        <th className="border-r border-black p-1 w-[26%] text-left px-1.5" rowSpan={2}>PROCESS / INSPECTION ACTIVITY</th>
                        <th className="border-r border-black p-1 w-[15%]" rowSpan={2}>REFERENCE SPEC / STD</th>
                        <th className="border-r border-black p-1 w-[23%] text-left px-1.5" rowSpan={2}>ACCEPTANCE CRITERIA</th>
                        <th className="border-r border-black p-1 w-[14%]" rowSpan={2}>VERIFYING DOCUMENT</th>
                        <th className="border-r border-black p-0.5 w-[9%] text-center" colSpan={3}>INTERVENTION</th>
                        <th className="p-1 w-[9%]" rowSpan={2}>REMARKS</th>
                      </tr>
                      <tr className="bg-slate-200/80 font-black border-b border-black text-black text-[8px]">
                        <th className="border-r border-black p-0.5 w-[3%]" title="Manufacturer (MFI)">M</th>
                        <th className="border-r border-black p-0.5 w-[3%]" title="Third Party Inspection (TPI)">T</th>
                        <th className="border-r border-black p-0.5 w-[3%]" title="Client / Contractor">C</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {activitiesToRender.map((act: any, aIdx: number) => (
                        <tr key={act.id || aIdx} className="leading-snug">
                          <td className="border-r border-black p-1 font-black bg-slate-50 text-slate-800 text-[9px]">
                            {act.itemNo}
                          </td>
                          <td className="border-r border-black p-1 px-1.5 text-left font-bold text-black text-[9px]">
                            {act.processStage}
                          </td>
                          <td className="border-r border-black p-1 text-center font-semibold text-slate-800 text-[8.5px]">
                            {act.referenceDoc}
                          </td>
                          <td className="border-r border-black p-1 px-1.5 text-left font-medium text-slate-900 text-[8.5px]">
                            {act.acceptanceCriteria}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black text-[8.5px]">
                            {act.verifyingDoc}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-black text-[9px] bg-slate-50/50">
                            {act.mfgIntervention}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-black text-[9px] bg-slate-50/50">
                            {act.tpiIntervention}
                          </td>
                          <td className="border-r border-black p-0.5 text-center font-black text-[9px] bg-slate-50/50">
                            {act.clientIntervention}
                          </td>
                          <td className="p-1 text-left font-medium text-[8px] text-slate-800">
                            {act.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* CONTINUATION FOOTER ON INTERMEDIATE PAGES */}
            {totalPages > 1 && pageNum < totalPages && (
              <div className="text-right text-[8px] font-bold text-slate-600 italic py-0.5">
                [ CONTINUED ON PAGE {pageNum + 1} OF {totalPages} ➔ ]
              </div>
            )}

            {/* 3. INTERVENTION LEGEND & QUALITY NOTES (ONLY ON LAST PAGE OR SINGLE PAGE) */}
            {(showRemarksAndSignatures || pageNum === totalPages) && (
              <div className="border border-black bg-white p-1.5 space-y-1 text-[8.5px]">
                <div className="bg-slate-100 p-1 border border-black text-[8.5px] font-black text-black">
                  <span className="uppercase mr-1.5">INTERVENTION LEGEND:</span>
                  <span className="font-bold text-slate-900">{itpData.legendText || 'H = Hold Point (Mandatory Sign-off) | W = Witness Point | R = Review of Records | S = Surveillance'}</span>
                </div>
                {itpData.generalNotes && (
                  <div className="space-y-0.5">
                    <div className="font-black text-[8.5px] text-black uppercase">General Quality Requirements & Inspection Notes:</div>
                    <div className="text-[8px] text-slate-800 leading-relaxed whitespace-pre-line font-medium p-1 bg-slate-50 border border-slate-200">
                      {itpData.generalNotes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. FOUR-TIER AUTHORIZATION & ACCEPTANCE SIGNATURE BOX (ONLY ON LAST PAGE OR SINGLE PAGE) */}
            {(showRemarksAndSignatures || pageNum === totalPages) && (
              <div className="border border-black bg-white text-[9px] mt-1">
                <div className="bg-slate-100 border-b border-black px-2 py-0.5 font-black text-black text-[9px] uppercase tracking-wide text-center">
                  INSPECTION & TEST PLAN APPROVALS & ENDORSEMENTS
                </div>
                <div className="grid grid-cols-4 divide-x divide-black text-center">
                  {/* PREPARED BY */}
                  <div className="p-1.5 flex flex-col justify-between h-20 relative">
                    <div className="font-bold text-[8px] text-slate-700 uppercase">PREPARED BY</div>
                    <div className="relative h-9 flex items-center justify-center">
                      {record.engineerSignatureUrl && (
                        <img
                          src={record.engineerSignatureUrl}
                          alt="Engineer Signature"
                          className="max-h-8 max-w-[100px] object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-[8.5px] text-black uppercase">{itpData.preparedByTitle || 'QA/QC ENGINEER'}</div>
                      <div className="border-t border-black pt-0.5 text-[7px] font-bold text-slate-800">SIGN & DATE</div>
                    </div>
                  </div>
                  {/* REVIEWED BY */}
                  <div className="p-1.5 flex flex-col justify-between h-20 relative">
                    <div className="font-bold text-[8px] text-slate-700 uppercase">REVIEWED BY</div>
                    <div className="relative h-9 flex items-center justify-center"></div>
                    <div>
                      <div className="font-black text-[8.5px] text-black uppercase">{itpData.reviewedByTitle || 'QC MANAGER'}</div>
                      <div className="border-t border-black pt-0.5 text-[7px] font-bold text-slate-800">SIGN & DATE</div>
                    </div>
                  </div>
                  {/* APPROVED BY */}
                  <div className="p-1.5 flex flex-col justify-between h-20 relative">
                    <div className="font-bold text-[8px] text-slate-700 uppercase">APPROVED BY (MFI)</div>
                    <div className="relative h-9 flex items-center justify-center">
                      {record.managerSignatureUrl && (
                        <img
                          src={record.managerSignatureUrl}
                          alt="Manager Signature"
                          className="max-h-8 max-w-[100px] object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-[8.5px] text-black uppercase">{itpData.approvedByTitle || 'TECHNICAL DIRECTOR'}</div>
                      <div className="border-t border-black pt-0.5 text-[7px] font-bold text-slate-800">SIGN & DATE</div>
                    </div>
                  </div>
                  {/* CLIENT / TPI APPROVAL */}
                  <div className="p-1.5 flex flex-col justify-between h-20 bg-slate-50/50 relative">
                    <div className="font-bold text-[8px] text-slate-700 uppercase">CLIENT / TPI ACCEPTANCE</div>
                    <div className="relative h-9 flex items-center justify-center">
                      {record.companyStampUrl && (
                        <img
                          src={record.companyStampUrl}
                          alt="Stamp"
                          className="max-h-8 max-w-[90px] object-contain opacity-80"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-[8.5px] text-black uppercase">{itpData.tpiApprovalTitle || 'THIRD PARTY INSPECTOR / CLIENT'}</div>
                      <div className="border-t border-black pt-0.5 text-[7px] font-bold text-slate-800">SIGN & OFFICIAL STAMP</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 3. PRODUCT SPECIFICATIONS & INSPECTION TEST TABLE (8 COLUMNS + SL NO) */}
            <div className="space-y-0.5">
              <div className="border border-black overflow-hidden bg-white">
                <table className="w-full text-center border-collapse text-[9px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100 font-black border-b border-black text-black text-[9px] leading-tight">
                      <th className="border-r border-black p-1 w-[4%]">SL. NO.</th>
                      <th className="border-r border-black p-1 w-[6%]">{reportInfo.colCoatType}</th>
                      <th className="border-r border-black p-1 w-[27%] text-left px-1.5">DESCRIPTION</th>
                      <th className="border-r border-black p-1 w-[11%]">SIZE</th>
                      <th className="border-r border-black p-1 w-[7%]">QTY</th>
                      <th className="border-r border-black p-1 w-[14%]">{reportInfo.colCriteria}</th>
                      <th className="border-r border-black p-1 w-[12%]">{reportInfo.colObserved}</th>
                      <th className="border-r border-black p-1 w-[7%]">{reportInfo.colAvg}</th>
                      <th className="p-1 w-[12%]">{reportInfo.colMass}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {displayItems.map((item, idx) => {
                      const coatType = item.finish?.trim() || '';
                      const desc = item.description?.trim() || '';
                      const size = item.size?.trim() || '';
                      const qty = item.qty?.trim() || '';
                      const criteria = (item.coatingMicronsMin !== undefined && item.coatingMicronsMin !== null && item.coatingMicronsMin.trim() !== '')
                        ? item.coatingMicronsMin.trim()
                        : (item.marking?.trim() || '');
                      const observed = (item.observedCoating !== undefined && item.observedCoating !== null && item.observedCoating.trim() !== '')
                        ? item.observedCoating.trim()
                        : (item.heatNo?.trim() || '');
                      
                      // Clean average resolution: ONLY calculate if user entered observed or avg
                      let avg = item.avgMicrons?.trim() || '';
                      if (!avg && observed) {
                        avg = calculateAverageFromObserved(observed);
                      }

                      // Clean mass of zinc resolution: ONLY calculate if user entered mass or avg exists
                      let mass = item.massOfZincGmM2?.trim() || (item.remark?.trim() || '');
                      if (!mass && avg) {
                        mass = calcZincMass(avg);
                      }

                      const slNumber = item.itemNo || (item.idx !== undefined ? item.idx + 1 : (isContinued ? ((pageNum - 1) * 20 + idx + 1) : idx + 1));

                      return (
                        <tr key={item.id || idx}>
                          <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800 text-[9px]">
                            {slNumber}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black uppercase text-[9px]">
                            {coatType}
                          </td>
                          <td className="border-r border-black p-1 text-left font-medium text-black uppercase leading-tight text-[9px]">
                            {desc}
                          </td>
                          <td className="border-r border-black p-1 text-center font-medium text-black text-[9px]">
                            {size}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black text-[9px]">
                            {qty}
                          </td>
                          <td className="border-r border-black p-1 text-center font-medium text-black text-[9px]">
                            {criteria}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black text-[9px]">
                            {observed}
                          </td>
                          <td className="border-r border-black p-1 text-center font-bold text-black text-[9px]">
                            {avg}
                          </td>
                          <td className="p-1 text-center font-semibold text-black text-[9px]">
                            {mass}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TECHNICAL PARAMETERS & TEST CRITERIA MATRIX (ONLY SHOWN ON FINAL PAGE) */}
            {showTechInfo && hasTechParams && (
              <div className="border border-black bg-white p-1.5 space-y-0.5 text-[9.5px]">
                {appNote && (
                  <div className="leading-tight">
                    <span className="font-bold text-black">{appLabel.trim().endsWith(':') ? appLabel.trim() + ' ' : appLabel.trim() + ' : '}</span>
                    <span className="font-medium text-black">{appNote}</span>
                  </div>
                )}
                {thickNote && (
                  <div className="leading-tight">
                    <span className="font-bold text-black">{thickLabel.trim().endsWith(':') ? thickLabel.trim() + ' ' : thickLabel.trim() + ' : '}</span>
                    <span className="font-medium text-black">{thickNote}</span>
                  </div>
                )}
                {adhNote && (
                  <div className="leading-tight">
                    <span className="font-bold text-black">{adhLabel.trim().endsWith(':') ? adhLabel.trim() + ' ' : adhLabel.trim() + ' : '}</span>
                    <span className="font-medium text-black">{adhNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* 5. OFFICIAL CERTIFICATION & DECLARATION STATEMENT (ONLY SHOWN ON FINAL PAGE IF USER TYPED CONTENT) */}
            {showRemarksAndSignatures && hasCertOrRemarks && (
              <div className="border border-black bg-slate-50/50 p-1.5 space-y-0.5">
                {certStatement && (
                  <div className="text-[9.5px] font-black uppercase text-black leading-tight">
                    {certStatement}
                  </div>
                )}
                {remStatement && (
                  <div className="flex items-center gap-1 text-[9.5px]">
                    <span className="font-black uppercase text-black shrink-0">REMARKS:</span>
                    <span className="font-bold text-black uppercase">{remStatement}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 6. SIGNATURES & OFFICIAL STAMP AREA (BOTTOM ANCHORED, ONLY ON FINAL PAGE, NOT ITP) */}
      {showRemarksAndSignatures && !isItpPrint && (
        <div className="flex items-end justify-between pt-1 relative mt-auto">
          {/* PREPARED BY */}
          <div className="text-left space-y-0.5 flex flex-col justify-end relative">
            <div className="relative h-10 w-44 mb-0.5">
              {record.engineerSignatureUrl && (
                <img
                  src={record.engineerSignatureUrl}
                  alt="Engineer Signature"
                  style={{
                    height: `${record.preparedSignHeight || 48}px`,
                    transform: `translate(${record.preparedSignPosX || 0}px, ${record.preparedSignPosY || 0}px)`
                  }}
                  className="max-w-[170px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                />
              )}
            </div>
            <div className="font-normal text-[9.5px] text-black leading-tight">Prepared By.</div>
            <div className="font-bold text-[9.5px] text-black leading-tight">Engineer QA/QC</div>
          </div>

          {/* APPROVED BY & STAMP */}
          <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
            <div className="relative h-10 w-64 mb-0.5 flex items-end justify-end">
              {record.companyStampUrl && (
                <img
                  src={record.companyStampUrl}
                  alt="Company Stamp"
                  style={{
                    height: `${record.stampHeight || 64}px`,
                    transform: `translate(${record.stampPosX || 0}px, ${record.stampPosY || 0}px)`
                  }}
                  className="max-w-[160px] object-contain absolute bottom-0 right-24 origin-bottom opacity-90 z-0"
                />
              )}

              {record.managerSignatureUrl && (
                <img
                  src={record.managerSignatureUrl}
                  alt="Manager Signature"
                  style={{
                    height: `${record.approvedSignHeight || 48}px`,
                    transform: `translate(${record.approvedSignPosX || 0}px, ${record.approvedSignPosY || 0}px)`
                  }}
                  className="max-w-[200px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
                />
              )}
            </div>

            <div className="font-normal text-[9.5px] text-black leading-tight">Approved By.</div>
            <div className="font-bold text-[9.5px] text-black leading-tight">{getCompanyQcHead(activeCompany)}</div>
            <div className="font-bold text-[9.5px] text-black tracking-tight leading-tight">{record.companyName || activeCompany.name}</div>
          </div>
        </div>
      )}

    </div>
  );
};
