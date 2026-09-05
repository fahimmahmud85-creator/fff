import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  FileText, Shield, Award, Plus, Search, Filter, Printer, Trash2, Edit, Copy, Save, CheckCircle, RefreshCw, Layers, ArrowLeft, ArrowUp, FileSpreadsheet, Download, Upload, Clipboard, ClipboardList, X, Eye, Maximize2, Minimize2, ZoomIn, ZoomOut, Image as ImageIcon, Sliders, CheckSquare, FileCheck, FilePlus, Undo2, Redo2, Check, Sparkles, Tag, ChevronRight, CheckCircle2, LayoutGrid, Calendar
} from 'lucide-react';
import { MtcTemplate2Canvas } from './MtcTemplate2Canvas';
import { MtcTemplate3Canvas, MtcTemplate3PrintView, getMechPropValue, getMechSpecValue } from './MtcTemplate3Canvas';
import { MtcTemplate4Canvas, MtcTemplate4PrintView } from './MtcTemplate4Canvas';
import { createDefaultMtc4Sheet, Mtc4SheetData } from './mtc4/mtc4Data';
import { SpecializedQcReportCanvas, SpecializedQcReportPrintView, getSpecializedReportDetails, DEFAULT_ITP_ACTIVITIES } from './SpecializedQcReportCanvas';
import { printHtml } from './PrintHelper';
import { getActiveCompany, isMarineFastenersCompany, getCompanyIsoText, getCompanyQcHead, CompanyProfile } from '../utils/companyProfile';

// High-definition Vector ISO Accreditation Logos Banner
export const DEFAULT_ISO_LOGO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 110" width="660" height="110">
  <g fill="none" stroke="none">
    <!-- ISO 9001:2015 Badge -->
    <g transform="translate(10, 5)">
      <circle cx="50" cy="50" r="47" fill="#0f172a"/>
      <circle cx="50" cy="50" r="43" fill="#ffffff"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="#0f172a" stroke-width="2"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="2,2"/>
      <text x="50" y="37" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle" letter-spacing="1">ISO</text>
      <text x="50" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">9001:2015</text>
      <text x="50" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#334155" text-anchor="middle" letter-spacing="0.5">QMS CERTIFIED</text>
    </g>

    <!-- ISO 14001:2015 Badge -->
    <g transform="translate(140, 5)">
      <circle cx="50" cy="50" r="47" fill="#0f172a"/>
      <circle cx="50" cy="50" r="43" fill="#ffffff"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="#0f172a" stroke-width="2"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="2,2"/>
      <text x="50" y="37" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle" letter-spacing="1">ISO</text>
      <text x="50" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">14001:2015</text>
      <text x="50" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#047857" text-anchor="middle" letter-spacing="0.5">EMS CERTIFIED</text>
    </g>

    <!-- EIAC ACCREDITED SHIELD -->
    <g transform="translate(270, 5)">
      <rect x="5" y="5" width="110" height="90" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
      <path d="M 60 16 L 86 28 L 86 58 C 86 74 60 84 60 84 C 60 84 34 74 34 58 L 34 28 Z" fill="#0f172a"/>
      <path d="M 60 20 L 82 30 L 82 56 C 82 69 60 78 60 78 C 60 78 38 69 38 56 L 38 30 Z" fill="none" stroke="#ffffff" stroke-width="1"/>
      <text x="60" y="44" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">eiac</text>
      <text x="60" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="6.5" fill="#38bdf8" text-anchor="middle" letter-spacing="0.5">ACCREDITED</text>
      <text x="60" y="86" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="7.5" fill="#0f172a" text-anchor="middle">CB-001-MS</text>
    </g>

    <!-- ISO 45001:2018 Badge -->
    <g transform="translate(400, 5)">
      <circle cx="50" cy="50" r="47" fill="#0f172a"/>
      <circle cx="50" cy="50" r="43" fill="#ffffff"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="#0f172a" stroke-width="2"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="2,2"/>
      <text x="50" y="37" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle" letter-spacing="1">ISO</text>
      <text x="50" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">45001:2018</text>
      <text x="50" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#1d4ed8" text-anchor="middle" letter-spacing="0.5">OH&amp;S MGMT</text>
    </g>

    <!-- VERITAS QUALITY Emblem -->
    <g transform="translate(530, 5)">
      <circle cx="50" cy="50" r="47" fill="#0f172a"/>
      <circle cx="50" cy="50" r="41" fill="none" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="37" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="50" y="38" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">VERITAS</text>
      <text x="50" y="52" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="8" fill="#38bdf8" text-anchor="middle">ASSURANCE</text>
      <text x="50" y="68" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">GLOBAL</text>
    </g>
  </g>
</svg>
`)}`;

export const formatNumericVal = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if (!str) return '';
  // Convert leading dot e.g. .15 -> 0.15, .20 -> 0.20, .25 -> 0.25, -.15 -> -0.15
  if (/^\.\d+/.test(str)) {
    str = '0' + str;
  } else if (/^-\.\d+/.test(str)) {
    str = '-0' + str.slice(1);
  }
  // Also handle leading dots in ranges or expressions like ".15-.25", ".15 / .25", "<.15", ">.15"
  str = str.replace(/(^|[\s\-–—\/~<>=:])\.\d+/g, (match, prefix) => {
    return prefix + '0' + match.slice(prefix.length);
  });
  return str;
};

export const formatChemVal = formatNumericVal;

export const isSpecializedTemplateType = (type?: string): boolean => {
  return Boolean(type && type !== 'MTC_T1' && type !== 'MTC_T2' && type !== 'MTC_T3' && type !== 'MTC_T4');
};

export const incrementCertNo = (certNo: string | undefined | null, step: number = 1): string => {
  if (!certNo || !certNo.trim()) return '';
  const trimmed = certNo.trim();
  const match = trimmed.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const newNum = parseInt(numStr, 10) + step;
    const padded = String(newNum).padStart(numStr.length, '0');
    return `${prefix}${padded}`;
  }
  return `${trimmed}-${step + 1}`;
};

export const formatPageNo = (pageNoStr?: string, defaultTotal: number = 1): string => {
  if (!pageNoStr || !pageNoStr.trim() || /0\s*OF\s*0/i.test(pageNoStr)) {
    return `1 OF ${defaultTotal}`;
  }
  return pageNoStr.trim().toUpperCase();
};

export const calculateTotalPages = (record: Partial<QcReportRecord>): number => {
  const activeItems = record.items || [];
  const rowCount = activeItems.length > 0 
    ? activeItems.length 
    : Math.max(record.chemicalData?.length || 0, record.mechanicalData?.length || 0, 1);

  // If user explicitly set custom "X OF Y" or "X/Y" and Y >= 1
  if (record.pageNo) {
    const match = record.pageNo.trim().match(/^(\d+)\s*(?:OF|\/)\s*(\d+)$/i);
    if (match) {
      const userTotal = parseInt(match[2], 10);
      if (userTotal >= 1) {
        return userTotal;
      }
    }
  }

  const hasExtraBoxes = Boolean(record.showMacroEtch || record.showHeatTreatment);

  if (record.templateType === 'MTC_T2' || record.templateType === 'MTC_T3') {
    if (rowCount > 5 || hasExtraBoxes) {
      return Math.max(2, Math.ceil(rowCount / 10) + 1);
    }
    return 1;
  }

  // Specialized reports (HDG, PTFE, GI, COC, etc.) are single-page by default unless rows exceed 12
  if (record.templateType !== 'MTC_T1' && record.templateType !== 'MTC_T4') {
    return Math.max(1, Math.ceil(rowCount / 12));
  }

  let autoTotal = 1;
  if (rowCount <= (hasExtraBoxes ? 4 : 6)) {
    autoTotal = 1;
  } else if (rowCount <= (hasExtraBoxes ? 10 : 14)) {
    autoTotal = 2;
  } else if (rowCount <= 22) {
    autoTotal = 3;
  } else {
    autoTotal = Math.ceil(rowCount / 8);
  }

  return autoTotal;
};

export interface CertPageLayout {
  pageNum: number;
  totalPages: number;
  showMetadata: boolean;
  descRows?: any[];
  isDescContinued?: boolean;
  chemRows: any[];
  isChemContinued: boolean;
  mechRows: any[];
  isMechContinued: boolean;
  showMacroEtch: boolean;
  showHeatTreatment: boolean;
  showTechInfo: boolean;
  showRemarksAndSignatures: boolean;
  sheetIndex?: number;
  sheetTitle?: string;
  sheetRecord?: QcReportRecord;
}

// Single sheet / document layout generator for MTC 2 & MTC 3
const getSingleMtcLayout = (record: QcReportRecord): CertPageLayout[] => {
  const activeItems = record.items || [];
  const maxRows = activeItems.length > 0 
    ? activeItems.length 
    : Math.max(record.chemicalData?.length || 0, record.mechanicalData?.length || 0, 1);

  const allRows = Array.from({ length: maxRows }, (_, idx) => {
    const it: any = record.items?.[idx] || {};
    const chem: any = record.chemicalData?.[idx] || {};
    const m: any = record.mechanicalData?.[idx] || {};
    const fallbackHeat = it.heatNo || chem.heatNo || m.heatNo || '';
    const rowMarking = it.marking !== undefined && it.marking !== null ? it.marking : (m.marking || '');
    const rowMarkingImage = it.markingImage || m.markingImage || '';

    return {
      idx,
      itemNo: it.itemNo || chem.itemNo || m.itemNo || (idx + 1),
      description: it.description || '',
      size: it.size || '',
      material: it.material || it.standard || '',
      finish: it.finish || '',
      unit: it.unit || chem.unit || '',
      qty: it.qty || '',
      marking: rowMarking,
      markingImage: rowMarkingImage,
      heatNo: fallbackHeat,
      chem: { heatNo: fallbackHeat, ...chem },
      m: { heatNo: fallbackHeat, marking: rowMarking, markingImage: rowMarkingImage, ...m }
    };
  });

  const hasExtraBoxes = Boolean(record.showMacroEtch || record.showHeatTreatment);
  const fitsOnSinglePage = allRows.length <= (hasExtraBoxes ? 3 : 5);

  let targetMtcTotal = 1;
  if (!fitsOnSinglePage) {
    if (allRows.length <= (hasExtraBoxes ? 13 : 16)) {
      targetMtcTotal = 2;
    } else {
      const totalUnits = (allRows.length + 2) * 3;
      targetMtcTotal = Math.max(2, Math.ceil(totalUnits / 32));
    }
  }

  if (targetMtcTotal === 1) {
    return [
      {
        pageNum: 1,
        totalPages: 1,
        showMetadata: true,
        descRows: allRows,
        isDescContinued: false,
        chemRows: allRows,
        isChemContinued: false,
        mechRows: allRows,
        isMechContinued: false,
        showMacroEtch: Boolean(record.showMacroEtch),
        showHeatTreatment: Boolean(record.showHeatTreatment),
        showTechInfo: true,
        showRemarksAndSignatures: true,
        sheetRecord: record
      }
    ];
  }

  const pages: CertPageLayout[] = [];
  const descRemaining = [...allRows];
  const chemRemaining = [...allRows];
  const mechRemaining = [...allRows];

  let descStarted = false;
  let chemStarted = false;
  let mechStarted = false;

  for (let p = 1; p <= targetMtcTotal; p++) {
    const isFirst = p === 1;
    const isLast = p === targetMtcTotal;

    let budget = isFirst 
      ? (isLast ? 20 : 32) 
      : (isLast ? (hasExtraBoxes ? 22 : 26) : 38);

    const thisPageDesc: any[] = [];
    let isDescCont = false;
    const thisPageChem: any[] = [];
    let isChemCont = false;
    const thisPageMech: any[] = [];
    let isMechCont = false;

    if (descRemaining.length > 0) {
      const descHeaderCost = descStarted ? 1 : 2;
      const availableForDesc = Math.max(1, budget - descHeaderCost);
      const takeCount = isLast && chemRemaining.length === 0 && mechRemaining.length === 0 
        ? descRemaining.length 
        : Math.min(descRemaining.length, availableForDesc);

      thisPageDesc.push(...descRemaining.splice(0, takeCount));
      isDescCont = descStarted;
      descStarted = true;
      budget -= (takeCount + descHeaderCost);
    }

    if (descRemaining.length === 0 && chemRemaining.length > 0 && budget >= 3) {
      const chemHeaderCost = chemStarted ? 1 : 2;
      const availableForChem = Math.max(1, budget - chemHeaderCost);
      const takeCount = isLast && mechRemaining.length === 0 
        ? chemRemaining.length 
        : Math.min(chemRemaining.length, availableForChem);

      thisPageChem.push(...chemRemaining.splice(0, takeCount));
      isChemCont = chemStarted;
      chemStarted = true;
      budget -= (takeCount + chemHeaderCost);
    }

    if (descRemaining.length === 0 && chemRemaining.length === 0 && mechRemaining.length > 0 && (budget >= 3 || isLast)) {
      const mechHeaderCost = mechStarted ? 1 : 2;
      const availableForMech = Math.max(1, budget - mechHeaderCost);
      const takeCount = isLast ? mechRemaining.length : Math.min(mechRemaining.length, availableForMech);

      thisPageMech.push(...mechRemaining.splice(0, takeCount));
      isMechCont = mechStarted;
      mechStarted = true;
      budget -= (takeCount + mechHeaderCost);
    }

    if (isLast) {
      if (descRemaining.length > 0) thisPageDesc.push(...descRemaining.splice(0, descRemaining.length));
      if (chemRemaining.length > 0) thisPageChem.push(...chemRemaining.splice(0, chemRemaining.length));
      if (mechRemaining.length > 0) thisPageMech.push(...mechRemaining.splice(0, mechRemaining.length));
    }

    pages.push({
      pageNum: p,
      totalPages: targetMtcTotal,
      showMetadata: isFirst,
      descRows: thisPageDesc,
      isDescContinued: isDescCont,
      chemRows: thisPageChem,
      isChemContinued: isChemCont,
      mechRows: thisPageMech,
      isMechContinued: isMechCont,
      showMacroEtch: isLast && Boolean(record.showMacroEtch),
      showHeatTreatment: isLast && Boolean(record.showHeatTreatment),
      showTechInfo: isLast,
      showRemarksAndSignatures: isLast,
      sheetRecord: record
    });
  }

  return pages;
};

export const getCertPagesLayout = (record: QcReportRecord): CertPageLayout[] => {
  // SPECIAL MULTI-SHEET HANDLING FOR MTC 3 (Combines all sheets for preview & PDF printing with full tables)
  if (record.templateType === 'MTC_T3') {
    const sheets = (record.sheets && record.sheets.length > 0) ? record.sheets : [
      {
        id: '1',
        title: 'Sheet 1',
        items: record.items || [],
        chemicalData: record.chemicalData || [],
        mechanicalData: record.mechanicalData || []
      }
    ];

    const allPages: CertPageLayout[] = [];
    sheets.forEach((sheet, sIdx) => {
      const sheetRecord: QcReportRecord = {
        ...record,
        items: (sheet.items && sheet.items.length > 0) ? sheet.items : (record.items || []),
        chemicalData: (sheet.chemicalData && sheet.chemicalData.length > 0) ? sheet.chemicalData : (record.chemicalData || []),
        mechanicalData: (sheet.mechanicalData && sheet.mechanicalData.length > 0) ? sheet.mechanicalData : (record.mechanicalData || []),
        chemSpecMin: sheet.chemSpecMin || record.chemSpecMin,
        chemSpecMax: sheet.chemSpecMax || record.chemSpecMax,
        chemUnits: sheet.chemUnits || record.chemUnits,
        mechSpecMin: sheet.mechSpecMin || record.mechSpecMin,
        mechSpecMax: sheet.mechSpecMax || record.mechSpecMax,
        customTechInfoLines: sheet.customTechInfoLines || record.customTechInfoLines
      };

      const sheetPages = getSingleMtcLayout(sheetRecord);
      sheetPages.forEach((p) => {
        allPages.push({
          ...p,
          sheetIndex: sIdx,
          sheetTitle: sheet.title || `Sheet ${sIdx + 1}`,
          sheetRecord
        });
      });
    });

    const totalPages = allPages.length;
    return allPages.map((p, idx) => ({
      ...p,
      pageNum: idx + 1,
      totalPages
    }));
  }

  if (record.templateType === 'MTC_T4') {
    const sCount = (record.mtc4Sheets && record.mtc4Sheets.length > 0) ? record.mtc4Sheets.length : 1;
    const pages: CertPageLayout[] = [];
    for (let s = 0; s < sCount; s++) {
      pages.push({
        pageNum: s * 2 + 1,
        totalPages: sCount * 2,
        showMetadata: true,
        sheetIndex: s,
        sheetTitle: `Sheet ${s + 1} - Page 1`,
        descRows: [],
        chemRows: [],
        isChemContinued: false,
        mechRows: [],
        isMechContinued: false,
        showMacroEtch: false,
        showHeatTreatment: false,
        showTechInfo: false,
        showRemarksAndSignatures: false,
        sheetRecord: record
      });
      pages.push({
        pageNum: s * 2 + 2,
        totalPages: sCount * 2,
        showMetadata: false,
        sheetIndex: s,
        sheetTitle: `Sheet ${s + 1} - Page 2`,
        descRows: [],
        chemRows: [],
        isChemContinued: false,
        mechRows: [],
        isMechContinued: false,
        showMacroEtch: false,
        showHeatTreatment: false,
        showTechInfo: true,
        showRemarksAndSignatures: true,
        sheetRecord: record
      });
    }
    return pages;
  }

  const activeItems = record.items || [];
  const maxRows = activeItems.length > 0 
    ? activeItems.length 
    : Math.max(record.chemicalData?.length || 0, record.mechanicalData?.length || 0, 1);

  const allRows = Array.from({ length: maxRows }, (_, idx) => {
    const it: any = record.items?.[idx] || {};
    const chem: any = record.chemicalData?.[idx] || {};
    const m: any = record.mechanicalData?.[idx] || {};
    const fallbackHeat = it.heatNo || chem.heatNo || m.heatNo || '';
    const rowMarking = it.marking !== undefined && it.marking !== null ? it.marking : (m.marking || '');
    const rowMarkingImage = it.markingImage || m.markingImage || '';

    return {
      idx,
      itemNo: it.itemNo || chem.itemNo || m.itemNo || (idx + 1),
      description: it.description || '',
      size: it.size || '',
      material: it.material || it.standard || '',
      finish: it.finish || '',
      unit: it.unit || chem.unit || '',
      qty: it.qty || '',
      marking: rowMarking,
      markingImage: rowMarkingImage,
      heatNo: fallbackHeat,
      chem: { heatNo: fallbackHeat, ...chem },
      m: { heatNo: fallbackHeat, marking: rowMarking, markingImage: rowMarkingImage, ...m }
    };
  });

  // SPECIALIZED QC REPORTS (HDG, GI, PTFE, NICKEL, CADMIUM, COC, etc.)
  if (isSpecializedTemplateType(record.templateType)) {
    const rawItems = record.items || [];
    // Ignore trailing completely blank rows to prevent unintentional extra page creation
    let lastFilledIdx = -1;
    for (let i = rawItems.length - 1; i >= 0; i--) {
      const it = rawItems[i];
      if (it && (it.description?.trim() || it.size?.trim() || String(it.qty ?? '').trim() || it.observedCoating?.trim() || (it.finish?.trim() && it.finish.trim() !== 'HDG'))) {
        lastFilledIdx = i;
        break;
      }
    }
    const items = lastFilledIdx >= 0 ? rawItems.slice(0, lastFilledIdx + 1) : (rawItems.length > 0 ? rawItems : []);

    const isInspection = record.templateType === 'INSPECTION_REPORT' || (record.templateType as string) === 'INSPECTION' || (record.templateType as string) === 'FINAL_INSPECTION' || (record.templateType as string) === 'QC_INSPECTION';
    if (isInspection) {
      // Dynamic multi-sheet structured layout for Quality Inspection Report
      const rawSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
        ? record.sheets
        : [
            {
              id: 'sheet-1',
              sheetNo: 1,
              title: 'SHEET 1',
              items: record.items || [],
              inspectionData: record.inspectionData
            }
          ];

      const allInspPages: CertPageLayout[] = [];

      rawSheets.forEach((sheet, sIdx) => {
        const sheetInspData = sheet.inspectionData
          ? { ...record.inspectionData, ...sheet.inspectionData }
          : record.inspectionData;

        const sheetRawItems = (sheet.items && Array.isArray(sheet.items) && sheet.items.length > 0)
          ? sheet.items
          : (record.items || []);

        let sLastFilledIdx = -1;
        for (let i = sheetRawItems.length - 1; i >= 0; i--) {
          const it = sheetRawItems[i];
          if (it && (it.description?.trim() || it.size?.trim() || String(it.qty ?? '').trim() || it.observedCoating?.trim() || (it.finish?.trim() && it.finish.trim() !== 'HDG'))) {
            sLastFilledIdx = i;
            break;
          }
        }
        const sheetItems = sLastFilledIdx >= 0 ? sheetRawItems.slice(0, sLastFilledIdx + 1) : (sheetRawItems.length > 0 ? sheetRawItems : []);

        const photoCount = (sheetInspData?.additionalPhotos && Array.isArray(sheetInspData.additionalPhotos))
          ? sheetInspData.additionalPhotos.filter((p: any) => p && (p.imageUrl || p.url)).length
          : 0;

        // If 1 or more photos exist, allocate 3 pages for this sheet:
        // Page 1: Metadata, Items Table, Technical Drawing & Marking
        // Page 2: Verified Photographic Evidence Gallery & Dimensional Matrix
        // Page 3: General Quality & Packaging Verification, Certification, Final Remarks & Signatures
        const sheetPageCount = photoCount >= 1 ? 3 : 2;

        const sheetRecord: QcReportRecord = {
          ...record,
          items: sheetRawItems,
          inspectionData: sheetInspData
        };

        const page1: CertPageLayout = {
          pageNum: 1,
          totalPages: sheetPageCount,
          showMetadata: true,
          sheetIndex: sIdx,
          sheetTitle: sheet.title || `SHEET ${sIdx + 1}`,
          descRows: sheetItems.map((it, i) => ({
            idx: i,
            itemNo: it.itemNo || (i + 1).toString(),
            description: it.description || '',
            size: it.size || '',
            material: it.material || '',
            finish: it.finish || '',
            standard: it.standard || '',
            unit: it.unit || it.standard || '',
            orderedQty: it.orderedQty || '',
            qty: it.qty || '',
            marking: it.marking || '',
            markingImage: it.markingImage || '',
            heatNo: it.heatNo || '',
            coatingMicronsMin: it.coatingMicronsMin || '',
            observedCoating: it.observedCoating || '',
            avgMicrons: it.avgMicrons || '',
            massOfZincGmM2: it.massOfZincGmM2 || '',
            remark: it.remark || '',
            chem: { heatNo: it.heatNo || '' },
            m: { heatNo: it.heatNo || '' }
          })),
          isDescContinued: false,
          chemRows: [],
          isChemContinued: false,
          mechRows: [],
          isMechContinued: false,
          showMacroEtch: false,
          showHeatTreatment: false,
          showTechInfo: false,
          showRemarksAndSignatures: false,
          sheetRecord
        };

        if (sheetPageCount === 3) {
          allInspPages.push(
            page1,
            {
              pageNum: 2,
              totalPages: 3,
              showMetadata: false,
              sheetIndex: sIdx,
              sheetTitle: sheet.title || `SHEET ${sIdx + 1}`,
              descRows: [],
              isDescContinued: false,
              chemRows: [],
              isChemContinued: false,
              mechRows: [],
              isMechContinued: false,
              showMacroEtch: false,
              showHeatTreatment: false,
              showTechInfo: false,
              showRemarksAndSignatures: false,
              sheetRecord
            },
            {
              pageNum: 3,
              totalPages: 3,
              showMetadata: false,
              sheetIndex: sIdx,
              sheetTitle: sheet.title || `SHEET ${sIdx + 1}`,
              descRows: [],
              isDescContinued: false,
              chemRows: [],
              isChemContinued: false,
              mechRows: [],
              isMechContinued: false,
              showMacroEtch: false,
              showHeatTreatment: false,
              showTechInfo: true,
              showRemarksAndSignatures: true,
              sheetRecord
            }
          );
        } else {
          allInspPages.push(
            page1,
            {
              pageNum: 2,
              totalPages: 2,
              showMetadata: false,
              sheetIndex: sIdx,
              sheetTitle: sheet.title || `SHEET ${sIdx + 1}`,
              descRows: [],
              isDescContinued: false,
              chemRows: [],
              isChemContinued: false,
              mechRows: [],
              isMechContinued: false,
              showMacroEtch: false,
              showHeatTreatment: false,
              showTechInfo: true,
              showRemarksAndSignatures: true,
              sheetRecord
            }
          );
        }
      });

      const totalInspectionPages = allInspPages.length;
      return allInspPages.map((p, idx) => ({
        ...p,
        pageNum: idx + 1,
        totalPages: totalInspectionPages
      }));
    }

    const isItp = (record.templateType as string) === 'ITP_REPORT' || (record.templateType as string) === 'ITP' || (record.templateType as string) === 'INSPECTION_TEST_PLAN' || (record.templateType as string) === 'INSPECTION_PLAN';
    if (isItp) {
      const itp = (record as any)?.itpData || {};
      const activities: any[] = (Array.isArray(itp.activityRows) && itp.activityRows.length > 0)
        ? itp.activityRows
        : (DEFAULT_ITP_ACTIVITIES || []);
      
      const singlePageLimit = 5;
      const page1Capacity = 6;
      const middlePageCapacity = 8;
      const lastPageCapacity = 6;

      if (activities.length <= singlePageLimit) {
        return [{
          pageNum: 1,
          totalPages: 1,
          showMetadata: true,
          descRows: activities.map((_, i) => ({ idx: i } as any)),
          isDescContinued: false,
          chemRows: [],
          isChemContinued: false,
          mechRows: [],
          isMechContinued: false,
          showMacroEtch: false,
          showHeatTreatment: false,
          showTechInfo: true,
          showRemarksAndSignatures: true,
          sheetRecord: record
        }];
      }

      const actChunks: any[][] = [];
      let cur = 0;
      while (cur < activities.length) {
        const remaining = activities.length - cur;
        const isFirst = actChunks.length === 0;
        
        if (isFirst) {
          const take = Math.min(page1Capacity, remaining);
          actChunks.push(activities.slice(cur, cur + take));
          cur += take;
        } else {
          if (remaining <= lastPageCapacity) {
            actChunks.push(activities.slice(cur, cur + remaining));
            cur += remaining;
          } else {
            const take = Math.min(middlePageCapacity, remaining);
            actChunks.push(activities.slice(cur, cur + take));
            cur += take;
          }
        }
      }

      const totalPages = actChunks.length;
      let startIdx = 0;
      return actChunks.map((chunk, pIdx) => {
        const pageNum = pIdx + 1;
        const isFirst = pageNum === 1;
        const isLast = pageNum === totalPages;
        const currentStartIdx = startIdx;
        startIdx += chunk.length;

        return {
          pageNum,
          totalPages,
          showMetadata: isFirst,
          descRows: chunk.map((_, cIdx) => ({ idx: currentStartIdx + cIdx } as any)),
          isDescContinued: !isFirst,
          chemRows: [],
          isChemContinued: false,
          mechRows: [],
          isMechContinued: false,
          showMacroEtch: false,
          showHeatTreatment: false,
          showTechInfo: isLast,
          showRemarksAndSignatures: isLast,
          sheetRecord: record
        };
      });
    }

    const isHeavySpecialized = 
      record.templateType === 'TEFLON_REPORT' || (record.templateType as string) === 'TEFLON' ||
      (record.templateType as string) === 'FLUROPOLYMER_REPORT' || (record.templateType as string) === 'FLUROPOLYMER' || (record.templateType as string) === 'FLURO_POLYMER' ||
      record.templateType === 'NEOPRENE_SLEEVE_REPORT' || (record.templateType as string) === 'NEOPRENE_SLEEVE' || (record.templateType as string) === 'NEOPRENE' ||
      record.templateType === 'NICKEL_COBALT_REPORT' || (record.templateType as string) === 'NICKEL_COBALT';

    const singlePageLimit = isHeavySpecialized ? 5 : 22;
    const page1Capacity = isHeavySpecialized ? 18 : 26;
    const middlePageCapacity = isHeavySpecialized ? 24 : 32;
    const finalPageCapacity = isHeavySpecialized ? 5 : 20;

    // Single page can comfortably accommodate items along with metadata, tech info, and signatures
    if (items.length <= singlePageLimit) {
      return [{
        pageNum: 1,
        totalPages: 1,
        showMetadata: true,
        descRows: items.map((it, i) => ({
          idx: i,
          itemNo: it.itemNo || (i + 1).toString(),
          description: it.description || '',
          size: it.size || '',
          material: it.material || '',
          finish: it.finish || '',
          unit: it.unit || '',
          qty: it.qty || '',
          marking: it.marking || '',
          markingImage: it.markingImage || '',
          heatNo: it.heatNo || '',
          coatingMicronsMin: it.coatingMicronsMin || '',
          observedCoating: it.observedCoating || '',
          avgMicrons: it.avgMicrons || '',
          massOfZincGmM2: it.massOfZincGmM2 || '',
          remark: it.remark || '',
          chem: { heatNo: it.heatNo || '' },
          m: { heatNo: it.heatNo || '' }
        })),
        isDescContinued: false,
        chemRows: [],
        isChemContinued: false,
        mechRows: [],
        isMechContinued: false,
        showMacroEtch: false,
        showHeatTreatment: false,
        showTechInfo: true,
        showRemarksAndSignatures: true,
        sheetRecord: record
      }];
    }

    // Multi-page layout:
    let itemCursor = 0;
    const pageItemChunks: typeof items[] = [];

    while (itemCursor < items.length) {
      const remainingItems = items.length - itemCursor;
      const isFirstChunk = pageItemChunks.length === 0;

      if (remainingItems <= finalPageCapacity) {
        pageItemChunks.push(items.slice(itemCursor, itemCursor + remainingItems));
        itemCursor += remainingItems;
      } else {
        const capacity = isFirstChunk ? page1Capacity : middlePageCapacity;
        const take = Math.min(capacity, remainingItems);
        pageItemChunks.push(items.slice(itemCursor, itemCursor + take));
        itemCursor += take;
      }
    }

    // If heavy specialized and last chunk has more than finalPageCapacity items, add an extra page for tech specs + signatures
    if (isHeavySpecialized && pageItemChunks.length > 0 && pageItemChunks[pageItemChunks.length - 1].length > finalPageCapacity) {
      pageItemChunks.push([]);
    }

    const totalPages = Math.max(1, pageItemChunks.length);
    let globalIndex = 0;
    const pages: CertPageLayout[] = [];

    for (let p = 1; p <= totalPages; p++) {
      const pageItems = pageItemChunks[p - 1] || [];
      pages.push({
        pageNum: p,
        totalPages: totalPages,
        showMetadata: p === 1,
        descRows: pageItems.map((it) => {
          const rowIdx = globalIndex++;
          return {
            idx: rowIdx,
            itemNo: it.itemNo || (rowIdx + 1).toString(),
            description: it.description || '',
            size: it.size || '',
            material: it.material || '',
            finish: it.finish || '',
            unit: it.unit || '',
            qty: it.qty || '',
            marking: it.marking || '',
            markingImage: it.markingImage || '',
            heatNo: it.heatNo || '',
            coatingMicronsMin: it.coatingMicronsMin || '',
            observedCoating: it.observedCoating || '',
            avgMicrons: it.avgMicrons || '',
            massOfZincGmM2: it.massOfZincGmM2 || '',
            remark: it.remark || '',
            chem: { heatNo: it.heatNo || '' },
            m: { heatNo: it.heatNo || '' }
          };
        }),
        isDescContinued: p > 1,
        chemRows: [],
        isChemContinued: false,
        mechRows: [],
        isMechContinued: false,
        showMacroEtch: false,
        showHeatTreatment: false,
        showTechInfo: p === totalPages,
        showRemarksAndSignatures: p === totalPages,
        sheetRecord: record
      });
    }
    return pages;
  }

  // SPECIAL OPTIMIZED MULTI-PAGE & SINGLE-PAGE LAYOUT SPECIFICALLY FOR MTC TEMPLATES 2 (Fastener Inspection)
  // Sequence: 1st all Descriptions -> 2nd all Chemical Analysis -> 3rd all Mechanical Properties
  if (record.templateType === 'MTC_T2') {
    return getSingleMtcLayout(record);
  }

  // --- UNTOUCHED ORIGINAL MTC 1 (TEMPLATE 1) LOGIC ---
  const isPortrait = record.templateType !== 'MTC_T1';
  const hasExtraBoxes = Boolean(record.showMacroEtch || record.showHeatTreatment);

  // Determine target total pages
  let totalPages = 1;
  const singlePageLimit = isPortrait ? (hasExtraBoxes ? 6 : 10) : (hasExtraBoxes ? 3 : 5);
  const twoPageLimit = isPortrait ? (hasExtraBoxes ? 16 : 22) : (hasExtraBoxes ? 9 : 14);
  const perPageRows = isPortrait ? 12 : 8;

  if (allRows.length <= singlePageLimit) {
    totalPages = 1;
  } else if (allRows.length <= twoPageLimit) {
    totalPages = 2;
  } else if (allRows.length <= (isPortrait ? 34 : 22)) {
    totalPages = 3;
  } else {
    totalPages = Math.ceil(allRows.length / perPageRows);
  }

  // If user explicitly set "X OF Y" in record.pageNo
  if (record.pageNo) {
    const match = record.pageNo.trim().match(/^(\d+)\s*(?:OF|\/)\s*(\d+)$/i);
    if (match) {
      const userTotal = parseInt(match[2], 10);
      if (userTotal >= 1) {
        totalPages = userTotal;
      }
    }
  }

  if (totalPages === 1) {
    return [
      {
        pageNum: 1,
        totalPages: 1,
        showMetadata: true,
        chemRows: allRows,
        isChemContinued: false,
        mechRows: allRows,
        isMechContinued: false,
        showMacroEtch: Boolean(record.showMacroEtch),
        showHeatTreatment: Boolean(record.showHeatTreatment),
        showTechInfo: true,
        showRemarksAndSignatures: true,
      }
    ];
  }

  // Multi-page sequential flow:
  // 1. Complete Chemical list first.
  // 2. Once Chemical list is completed, Mechanical properties immediately starts and continues.
  // 3. Every page is full, with consistent full page borders.

  const pages: CertPageLayout[] = [];
  const chemRemaining = [...allRows];
  const mechRemaining = [...allRows];

  let chemStarted = false;
  let mechStarted = false;

  for (let p = 1; p <= totalPages; p++) {
    const isFirst = p === 1;
    const isLast = p === totalPages;

    // Available height units on this page
    // In portrait A4 (height ~280mm vs 196mm landscape):
    let pageTableBudget = isFirst 
      ? (isPortrait ? 28.0 : 19.5) 
      : (isLast ? (isPortrait ? 20.0 : 13.0) : (isPortrait ? 33.0 : 23.0));
    if (isLast && hasExtraBoxes) {
      pageTableBudget -= (record.showMacroEtch ? 3.0 : 0) + (record.showHeatTreatment ? 3.5 : 0);
    }

    const currentChemRows: any[] = [];
    const isThisChemContinued = chemStarted;

    // Fill Chemical rows on this page first if any remain
    if (chemRemaining.length > 0) {
      chemStarted = true;
      const chemHeaderCost = isThisChemContinued ? 1.5 : 2.5;
      pageTableBudget -= chemHeaderCost;

      // Calculate how many chemical rows to take
      const chemCount = isLast 
        ? chemRemaining.length 
        : Math.min(chemRemaining.length, Math.max(1, Math.floor(pageTableBudget)));
      const takenChem = chemRemaining.splice(0, chemCount);
      currentChemRows.push(...takenChem);
      pageTableBudget -= takenChem.length * 1.0;
    }

    const currentMechRows: any[] = [];
    const isThisMechContinued = mechStarted;

    // Now, if Chemical list is complete (chemRemaining.length === 0) AND mechanical rows remain:
    // Mechanical table starts immediately!
    if (chemRemaining.length === 0 && mechRemaining.length > 0) {
      const mechHeaderCost = isThisMechContinued ? 1.5 : 2.5;
      if (pageTableBudget >= (mechHeaderCost + 1.0) || isLast || (!isFirst && currentChemRows.length === 0)) {
        mechStarted = true;
        pageTableBudget -= mechHeaderCost;

        const mechCount = isLast 
          ? mechRemaining.length 
          : Math.min(mechRemaining.length, Math.max(1, Math.floor(pageTableBudget)));
        const takenMech = mechRemaining.splice(0, mechCount);
        currentMechRows.push(...takenMech);
        pageTableBudget -= takenMech.length * 1.0;
      }
    }

    pages.push({
      pageNum: p,
      totalPages: totalPages,
      showMetadata: isFirst,
      chemRows: currentChemRows,
      isChemContinued: isThisChemContinued,
      mechRows: currentMechRows,
      isMechContinued: isThisMechContinued,
      showMacroEtch: isLast && Boolean(record.showMacroEtch),
      showHeatTreatment: isLast && Boolean(record.showHeatTreatment),
      showTechInfo: isLast,
      showRemarksAndSignatures: isLast,
    });
  }

  // Safety fallback: if anything still remains, append an additional page
  if (chemRemaining.length > 0 || mechRemaining.length > 0) {
    const extraPageNum = pages.length + 1;
    pages.push({
      pageNum: extraPageNum,
      totalPages: extraPageNum,
      showMetadata: false,
      chemRows: chemRemaining,
      isChemContinued: chemStarted,
      mechRows: mechRemaining,
      isMechContinued: mechStarted,
      showMacroEtch: Boolean(record.showMacroEtch),
      showHeatTreatment: Boolean(record.showHeatTreatment),
      showTechInfo: true,
      showRemarksAndSignatures: true,
    });

    // Update totalPages across all pages
    pages.forEach(pg => {
      pg.totalPages = extraPageNum;
    });
  }

  return pages;
};

export interface QcRecordItem {
  id: string;
  itemNo?: string;        // e.g. "7-0406"
  description: string;   // e.g. "ELBOW 45 SR"
  type?: string;          // e.g. "BW"
  material?: string;      // e.g. "A234 WPB"
  standard?: string;       // Standard of Dim e.g. "ASME B16.9-12 Ed."
  size: string;           // Size (IN) e.g. "3/4\""
  classSch?: string;      // Class/Sch e.g. "SCH160"
  unit?: string;          // e.g. "PCS", "NOS", "SETS"
  qty: string | number;
  heatNo?: string;
  heatTreatment?: string; // Heat treatment code e.g. "A", "SR"
  ndePmi?: string;        // e.g. "OK"
  remark?: string;        // e.g. "SATISFACTORY"
  finish?: string;
  marking?: string;
  markingImage?: string;

  // HDG / PTFE specific
  coatingMicronsMin?: string;
  observedCoating?: string;
  avgMicrons?: string;
  massOfZincGmM2?: string;
  orderedQty?: string;
}

export interface QcChemicalItem {
  heatNo: string;
  itemNo?: string;
  specType?: string; // 'L' (Ladle) or 'P' (Product)
  description?: string;
  size?: string;
  specification?: string;
  finish?: string;
  unit?: string;
  qty?: string | number;
  c?: string;
  si?: string;
  mn?: string;
  p?: string;
  s?: string;
  cr?: string;
  ni?: string;
  mo?: string;
  cu?: string;
  v?: string;
  ce?: string;
  al?: string;
  n?: string;
  ti?: string;
  b?: string;
  pb?: string;
  zn?: string;
  fe?: string;
  sn?: string;
  totalImpurity?: string;
  other?: string;
  cb?: string;
}

export interface QcMechanicalItem {
  heatNo: string;
  itemNo?: string;
  specType?: string; // 'P' (Product Analysis)
  size?: string;
  heatTreatment?: string; // e.g. 'Q&T', 'A', 'S'
  tsMpa?: string;       // Tensile Strength (Mpa)
  ysMpa?: string;       // Yield Strength (Mpa)
  elPct?: string;       // Elongation (%)
  raPct?: string;       // Reduction of Area (%)
  hardnessHbw?: string; // Hardness (HBW / HRC)
  impactTemp?: string;  // Impact Temp (°C)
  impactSize?: string;  // Impact Size (2mm-v)
  impactAve?: string;   // Impact Average (J / ft-lbf)
  hydroTest?: string;   // Hydro Test Pressure (Mpa)
  
  utsMpa?: string;
  utsKsi?: string;
  ysKsi?: string;
  proofLoadN?: string;
  proofLoadLbf?: string;
  stressUnderProofloadMpa?: string;
  hardness?: string;
  hardness24Hr540C?: string;
  quenchingTempC?: string;
  quenchingHoldingTime?: string;
  quenchingMedium?: string;
  temperingTempC?: string;
  temperingHoldingTime?: string;
  stressRelievedC?: string;
  temperingResult?: string;
  impactJ?: string;
  avgImpactJ?: string;
  impactTempC?: string;
  marking?: string;
  markingImage?: string;
  pren?: string;
  htCycle24Hr?: string;
  macroEtch?: string;
  rotnCapTest?: string;
  finish?: string;
}

export interface MtcSheetData {
  id: string;
  sheetNo: number; // 1, 2, 3...
  title?: string;
  certNo?: string;
  reportNo?: string;
  items: QcRecordItem[];
  inspectionData?: any;
  chemicalData?: QcChemicalItem[];
  mechanicalData?: QcMechanicalItem[];
  productDescription?: string;
  specStandard?: string;
  startingMaterial?: string;
  remarks?: string;
  additionalInfo?: string;
  customTechInfoLines?: Array<{ id: string; label: string; text: string; enabled: boolean }>;
  chemHeaderOverrides?: Record<string, string>;
  mechHeaderOverrides?: Record<string, string>;
  chemMinMax?: Record<string, string>;
  chemSpecMin?: Record<string, string>;
  chemSpecMax?: Record<string, string>;
  chemUnits?: Record<string, string>;
  chemLimits?: Record<string, string>;
  mechMinMax?: Record<string, string>;
  mechSpecMin?: Record<string, string>;
  mechSpecMax?: Record<string, string>;
  mechLimits?: Record<string, string>;
}

export type QcTemplateType = 
  | 'MTC_T1' 
  | 'MTC_T2' 
  | 'MTC_T3' 
  | 'MTC_T4' 
  | 'HDG_REPORT' 
  | 'GI_REPORT' 
  | 'NICKEL_REPORT' 
  | 'NICKEL_COBALT_REPORT'
  | 'YELLOW_PASSIVATED_REPORT' 
  | 'CADMIUM_REPORT' 
  | 'PTFE_REPORT' 
  | 'FLUROPOLYMER_REPORT' 
  | 'COC_REPORT' 
  | 'TEFLON_REPORT' 
  | 'NEOPRENE_SLEEVE_REPORT' 
  | 'WARRANTY_CERTIFICATE' 
  | 'COO_CERTIFICATE' 
  | 'COMPLIANCE_LETTER' 
  | 'INSPECTION_REPORT'
  | 'INSPECTION_TEST_PLAN';

export interface QcReportRecord {
  id: string;
  certNo: string;
  reportNo?: string;
  templateType: QcTemplateType;
  templateLabel: string;
  date: string;
  customerName: string; // BUYER
  customerPoNum: string;
  workOrderNum: string;
  invoiceNum: string;
  specStandard: string; // IN ACCORDANCE WITH STANDARD CODES
  productDescription: string; // DESCRIPTION
  startingMaterial?: string; // STARTING MATERIAL
  issueNo?: string;
  pageNo?: string;

  // Company Header & Contact Settings
  companyName?: string;
  companyTagline?: string;
  companyAddress?: string;
  companyContact?: string;
  showCompanyContact?: boolean;
  inspectionData?: any;

  // MTC 3 Multi-Sheet support
  sheets?: Array<MtcSheetData>;

  // MTC 4 Multi-Sheet support
  mtc4Sheets?: Array<Mtc4SheetData>;
  currentMtc4SheetIndex?: number;

  // Chemical Min/Max, (%), and Standard Spec Limit values row for MTC 3
  chemMinMax?: Record<string, string>;
  chemUnits?: Record<string, string>;
  chemLimits?: Record<string, string>;

  // Mechanical Min/Max/Req, and Standard Spec Limit values row for MTC 3
  mechMinMax?: Record<string, string>;
  mechLimits?: Record<string, string>;

  // Toggles for optional sections & columns
  showMacroEtch?: boolean;
  showHeatTreatment?: boolean;
  showHeatTreatmentCols?: boolean;
  showColHeatTreatment?: boolean;
  showColHardness24Hr?: boolean;
  showColQuenchingTemp?: boolean;
  showColQuenchingTime?: boolean;
  showColQuenchingMedium?: boolean;
  showColTemperingTemp?: boolean;
  showColTemperingTime?: boolean;
  showColStressRelieved?: boolean;
  showColTemperingResult?: boolean;
  showColImpactJ?: boolean;
  showColAvgImpactJ?: boolean;
  showColImpactTemp?: boolean;
  showColPren?: boolean;
  showColStressUnderProofload?: boolean;
  showColMarking?: boolean;
  mechUtsHeaderTitle?: string;
  mechYsHeaderTitle?: string;
  mechProofloadHeaderTitle?: string;
  mechHardnessHeaderTitle?: string;
  showColPb?: boolean;
  showColZn?: boolean;
  showColFe?: boolean;
  showColSn?: boolean;
  showImpurity?: boolean;
  showOther?: boolean;
  showColB?: boolean;
  showColCr?: boolean;
  showColMo?: boolean;
  showColNi?: boolean;
  showColCu?: boolean;
  chemHeaderOverrides?: Record<string, string>;
  mechHeaderOverrides?: Record<string, string>;

  // Min / Max Spec Overrides for MTC T1 Chemical & Mechanical Tables
  chemSpecMin?: { c?: string; si?: string; mn?: string; p?: string; s?: string; cr?: string; ni?: string; mo?: string; cu?: string; v?: string; ce?: string };
  chemSpecMax?: { c?: string; si?: string; mn?: string; p?: string; s?: string; cr?: string; ni?: string; mo?: string; cu?: string; v?: string; ce?: string };
  mechSpecMin?: { tsMpa?: string; ysMpa?: string; elPct?: string; raPct?: string; hardnessHbw?: string; impactAve?: string; hydroTest?: string };
  mechSpecMax?: { tsMpa?: string; ysMpa?: string; elPct?: string; raPct?: string; hardnessHbw?: string; impactAve?: string; hydroTest?: string };

  // Heat Treatment Legend Codes
  heatTreatmentLegend?: string;
  
  // Extra MTC T1 Fields
  coatingSpec?: string;
  finishSpec?: string;
  microns?: string;
  micronsAvg?: string;
  qmsRef?: string;

  // Custom Header Logos
  companyLogoUrl?: string;
  isoLogoUrl?: string;

  // Macro etch fields
  macroEtchSpecSurface?: string;
  macroEtchSpecRandom?: string;
  macroEtchSpecCenter?: string;
  macroEtchSpecTestMethod?: string;
  macroEtchResultSurface?: string;
  macroEtchResultRandom?: string;
  macroEtchResultCenter?: string;

  // Heat Treatment fields
  heatTreatmentCarbide?: string;
  heatTreatmentStrain?: string;
  heatTreatmentQuenching?: string;
  heatTreatmentTempering?: string;

  // Technical Info fields & toggles (with editable left labels & custom lines)
  showTechInfoVisual?: boolean;
  techInfoVisualLabel?: string;
  techInfoVisual?: string;
  showTechInfoThread?: boolean;
  techInfoThreadLabel?: string;
  techInfoThread?: string;
  showTechInfoGauge?: boolean;
  techInfoGaugeLabel?: string;
  techInfoGauge?: string;
  showTechInfoDimensions?: boolean;
  techInfoDimensionsLabel?: string;
  techInfoDimensions?: string;
  showTechInfoHeatTreatment?: boolean;
  techInfoHeatTreatmentLabel?: string;
  techInfoHeatTreatment?: string;
  showTechInfoHdg?: boolean;
  techInfoHdgLabel?: string;
  techInfoHdg?: string;

  showTechInfoGi?: boolean;
  techInfoGiLabel?: string;
  techInfoGi?: string;
  showTechInfoGalv?: boolean;
  techInfoGalvLabel?: string;
  techInfoGalv?: string;
  showTechInfoSelf?: boolean;
  techInfoSelfLabel?: string;
  techInfoSelf?: string;
  showTechInfoYellow?: boolean;
  techInfoYellowLabel?: string;
  techInfoYellow?: string;
  showTechInfoCadmium?: boolean;
  techInfoCadmiumLabel?: string;
  techInfoCadmium?: string;
  showTechInfoNickel?: boolean;
  techInfoNickelLabel?: string;
  techInfoNickel?: string;
  showTechInfoFluropolymer?: boolean;
  techInfoFluropolymerLabel?: string;
  techInfoFluropolymer?: string;
  showTechInfoPtfeBlue?: boolean;
  techInfoPtfeBlueTitle?: string;
  techInfoPtfeBlue?: string;
  techInfoPtfeBlueTemp?: string;
  showTechInfoNace?: boolean;
  techInfoNaceLabel?: string;
  techInfoNace?: string;

  // Custom dynamically added lines for Additional Technical Information
  customTechInfoLines?: Array<{ id: string; label: string; text: string; enabled: boolean }>;

  items: QcRecordItem[];
  chemicalData?: QcChemicalItem[];
  mechanicalData?: QcMechanicalItem[];
  
  // Specific extra fields for HDG / Specialized Reports
  appearanceLabel?: string;
  appearanceText?: string;
  zincCoatingAppearance?: string;
  thicknessLabel?: string;
  thicknessText?: string;
  coatingThicknessNotes?: string;
  adhesionLabel?: string;
  adhesionText?: string;
  adhesionTestNotes?: string;
  certificationText?: string;
  
  gritBlast?: string;
  solvent96?: string;
  zinkNiPlating?: string;
  coatingColour?: string;
  xylanType?: string;
  temperatureC?: string;
  humidityPct?: string;
  flashOffTempC?: string;
  cureTempC?: string;
  
  appearanceResult?: string;
  dftResult?: string;
  hardnessResult?: string;
  solventTestResult?: string;
  adhesionResult?: string;
  saltSprayResult?: string;
  
  additionalInfo?: string;
  remarks?: string;
  conclusion?: string;
  
  // Neoprene Sleeve specialized report fields
  neopreneData?: any;
  neopreneBasePolymer?: string;
  neopreneColour?: string;
  neoprenePhysicalProperties?: any[];
  neopreneGeneralProperties?: any[];
  neopreneNote?: string;

  // Teflon specialized report fields
  teflonData?: any;

  // Fluropolymer specialized report fields
  fluropolymerData?: any;

  // Signature & Stamp Data URLs, Sizing and Draggable Positions
  engineerSignatureUrl?: string;
  managerSignatureUrl?: string;
  companyStampUrl?: string;
  markingImageUrl?: string;
  signatureHeight?: number;
  preparedSignHeight?: number;
  approvedSignHeight?: number;
  stampHeight?: number;
  preparedSignPosX?: number;
  preparedSignPosY?: number;
  approvedSignPosX?: number;
  approvedSignPosY?: number;
  stampPosX?: number;
  stampPosY?: number;

  // Customizable Mechanical Table Column Headers
  labelSrNo?: string;
  labelHeatNo?: string;
  labelTensileStrength?: string;
  labelYieldStrength?: string;
  labelElongation?: string;
  labelReductionArea?: string;
  labelProofload?: string;
  labelStressUnderProofload?: string;
  labelHeatTreatment?: string;
  labelHardness?: string;
  labelHardness24Hr?: string;
  labelQuenchingTemp?: string;
  labelQuenchingTime?: string;
  labelQuenchingMedium?: string;
  labelTemperingTemp?: string;
  labelTemperingTime?: string;
  labelStressRelieved?: string;
  labelTemperingResult?: string;
  labelImpactJ?: string;
  labelAvgImpactJ?: string;
  labelImpactTemp?: string;
  labelPren?: string;
  labelMarking?: string;
  
  createdAt: string;
}

const STORAGE_KEY = 'marine_qc_reports_records';
const ASSETS_STORAGE_KEY = 'marine_qc_persistent_assets';

import { 
  getSavedAssets, 
  saveAssetSafely, 
  hydrateRecordAssets as mergeSavedAssets, 
  compressImageFile, 
  saveQcRecordsSafely, 
  getInitialRecordsFromLocalStorage, 
  loadRecordsFromIndexedDB,
  type SavedAssets
} from '../utils/qcStorage';

export type { SavedAssets };

const saveAsset = (key: keyof SavedAssets, value: any) => {
  saveAssetSafely(key, value);
};

// Draggable Image helper component for signature & stamp adjustments
const DraggableImage = ({
  src,
  alt,
  height,
  posX = 0,
  posY = 0,
  onPositionChange,
  className = '',
  title = '',
  style = {},
}: {
  src: string;
  alt: string;
  height: number;
  posX?: number;
  posY?: number;
  onPositionChange: (newX: number, newY: number) => void;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: posX,
      origY: posY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      onPositionChange(Math.round(dragStartRef.current.origX + dx), Math.round(dragStartRef.current.origY + dy));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <img
      src={src}
      alt={alt}
      title={title || 'Click & Drag to reposition image on page'}
      style={{
        ...style,
        height: `${height}px`,
        transform: `translate(${posX}px, ${posY}px)`,
      }}
      onMouseDown={handleMouseDown}
      className={`cursor-grab active:cursor-grabbing select-none transition-shadow ${
        isDragging ? 'ring-2 ring-amber-500 rounded shadow-xl z-30' : 'hover:ring-1 hover:ring-amber-400'
      } ${className}`}
    />
  );
};

export const generateDefaultCertNo = (templateType: string = 'MTC_T1'): string => {
  const currentYear = new Date().getFullYear();
  const rand6 = Math.floor(100000 + Math.random() * 900000);
  switch (templateType) {
    case 'MTC_T1':
      return `DBP/${currentYear}/${rand6}`;
    case 'MTC_T2':
      return `MFI:${Math.floor(1000 + Math.random() * 9000)}/08/${currentYear}`;
    case 'MTC_T3':
      return `MFI/${currentYear}/${rand6}`;
    case 'MTC_T4':
      return `MFI/MTC4/${currentYear}/${rand6}`;
    case 'HDG_REPORT':
      return `HDG/${currentYear}/${rand6}`;
    case 'GI_REPORT':
      return `GI/${currentYear}/${rand6}`;
    case 'NICKEL_REPORT':
      return `NIC/${currentYear}/${rand6}`;
    case 'NICKEL_COBALT_REPORT':
      return `NIC-CO/${currentYear}/${rand6}`;
    case 'YELLOW_PASSIVATED_REPORT':
      return `YP/${currentYear}/${rand6}`;
    case 'CADMIUM_REPORT':
      return `CAD/${currentYear}/${rand6}`;
    case 'PTFE_REPORT':
      return `PTFE/${currentYear}/${rand6}`;
    case 'FLUROPOLYMER_REPORT':
      return `FLP/${currentYear}/${rand6}`;
    case 'COC_REPORT':
    case 'CERTIFICATE_OF_CONFORMITY':
      return `COC/${currentYear}/${rand6}`;
    case 'COO_CERTIFICATE':
      return `COO/${currentYear}/${rand6}`;
    case 'COMPLIANCE_LETTER':
      return `CMP/${currentYear}/${rand6}`;
    case 'INSPECTION_REPORT':
      return `INSP/${currentYear}/${rand6}`;
    case 'INSPECTION_TEST_PLAN':
      return `ITP/${currentYear}/${rand6}`;
    case 'WARRANTY_CERTIFICATE':
      return `WAR/${currentYear}/${rand6}`;
    case 'TEFLON_REPORT':
      return `TEF/${currentYear}/${rand6}`;
    case 'NEOPRENE_SLEEVE_REPORT':
      return `NSL/${currentYear}/${rand6}`;
    default:
      return `MFI/${currentYear}/${rand6}`;
  }
};

export const getTemplateShortCode = (type: string): string => {
  switch (type) {
    case 'MTC_T1': return 'MTC1';
    case 'MTC_T2': return 'MTC2';
    case 'MTC_T3': return 'MTC3';
    case 'MTC_T4': return 'MTC4';
    case 'HDG_REPORT': return 'HDG';
    case 'GI_REPORT': return 'GI';
    case 'NICKEL_REPORT': return 'NP';
    case 'NICKEL_COBALT_REPORT': return 'NCC';
    case 'YELLOW_PASSIVATED_REPORT': return 'YP';
    case 'CADMIUM_REPORT': return 'CP';
    case 'PTFE_REPORT': return 'PTFE';
    case 'FLUROPOLYMER_REPORT': return 'FLURO';
    case 'TEFLON_REPORT': return 'TC';
    case 'NEOPRENE_SLEEVE_REPORT': return 'NS';
    case 'COC_REPORT': 
    case 'CERTIFICATE_OF_CONFORMITY':
      return 'COC';
    case 'WARRANTY_CERTIFICATE': return 'WC';
    case 'COO_CERTIFICATE': return 'COO';
    case 'COMPLIANCE_LETTER': return 'CL';
    case 'INSPECTION_REPORT': return 'IR';
    case 'INSPECTION_TEST_PLAN': return 'ITP';
    default: return type.replace('_REPORT', '').replace('_CERTIFICATE', '');
  }
};

export interface GroupedArchiveItem {
  groupKey: string;
  invoiceNo: string;
  workOrderNo: string;
  poNo: string;
  customerName: string;
  records: QcReportRecord[];
  dates: string[];
}

const DEFAULT_RECORD: QcReportRecord = {
  id: 'qc-new',
  certNo: 'DBP/2026/100425',
  issueNo: 'DBP/2026/100425',
  templateType: 'MTC_T1',
  templateLabel: 'MTC TEMPLATE 1 (EN 10204-3.1 Horizontal Inspection Certificate)',
  date: new Date().toLocaleDateString('en-GB'),
  customerName: '',
  customerPoNum: '',
  workOrderNum: '',
  invoiceNum: '',
  startingMaterial: '',
  productDescription: '',
  specStandard: '',
  pageNo: '',
  
  // Macro etch default fields
  showMacroEtch: false,
  showHeatTreatment: false,
  showHeatTreatmentCols: true,
  showColHeatTreatment: true,
  showColHardness24Hr: true,
  showColQuenchingTemp: true,
  showColQuenchingTime: true,
  showColQuenchingMedium: true,
  showColTemperingTemp: false,
  showColTemperingTime: false,
  showColStressRelieved: true,
  showColTemperingResult: false,
  showColImpactJ: true,
  showColAvgImpactJ: true,
  showColImpactTemp: true,
  showColPren: false,
  showColStressUnderProofload: false,
  showColPb: false,
  showColZn: false,
  showColFe: false,
  showColSn: false,
  showImpurity: false,
  showOther: false,
  labelSrNo: 'Sr. No.',
  labelHeatNo: 'Heat No',
  labelTensileStrength: 'Tensile Strength UTS–Ksi',
  labelYieldStrength: 'Yield Strength YS–Ksi',
  labelElongation: 'Elongation El–(%)',
  labelReductionArea: 'Red. of Area Ra–(%)',
  labelProofload: 'Proofload Lbf',
  labelStressUnderProofload: 'Stress Under Proofload Mpa',
  labelHeatTreatment: 'Heat Treatment',
  labelHardness: 'Hardness',
  labelHardness24Hr: 'Hardness After 24 Hr Treatment at 540°C',
  labelQuenchingTemp: 'Quenching Temp. °C',
  labelQuenchingTime: 'Holding Time',
  labelQuenchingMedium: 'Quenching Medium',
  labelTemperingTemp: 'Tempering Temp. °C',
  labelTemperingTime: 'Holding Time',
  labelStressRelieved: 'Stress Relieved °C',
  labelTemperingResult: 'Temper',
  labelImpactJ: 'Impact in "J"',
  labelAvgImpactJ: 'Average Impact in "J"',
  labelImpactTemp: 'Impact Test Temp °C',
  labelPren: 'Pren',
  labelMarking: 'Marking',
  macroEtchSpecSurface: 'S2',
  macroEtchSpecRandom: 'R2',
  macroEtchSpecCenter: 'C3',
  macroEtchSpecTestMethod: 'ASTM A962/A962M-22',
  macroEtchResultSurface: 'S2',
  macroEtchResultRandom: 'R2',
  macroEtchResultCenter: 'C3',

  // Heat treatment default fields
  heatTreatmentCarbide: 'Was treated by raw material factory',
  heatTreatmentStrain: 'Was treated',
  heatTreatmentQuenching: 'N/A',
  heatTreatmentTempering: 'N/A',

  // Additional Technical Info defaults
  showTechInfoVisual: true,
  techInfoVisual: 'Found to be free from crack, flaws, sharp edges and other defects.',
  showTechInfoThread: true,
  techInfoThread: 'has been inspected as per ASME B1.1 CL 2A and found ok.',
  showTechInfoGauge: true,
  techInfoGauge: 'Inspection using 6g GO gauge and 6g NO GO gauge,',
  showTechInfoDimensions: true,
  techInfoDimensions: 'Found Satisfactory/ As per Standard requirement.',
  showTechInfoHeatTreatment: true,
  techInfoHeatTreatment: 'Quenched Liquid & tempered.',
  showTechInfoHdg: true,
  techInfoHdg: 'As per ASTM A153 CL-C found satisfactory.',

  showTechInfoGi: false,
  techInfoGi: 'As per ASTM B633 Found satisfactory',
  showTechInfoGalv: false,
  techInfoGalv: 'As per ASTM B633 Found satisfactory',
  showTechInfoSelf: false,
  techInfoSelf: 'Found satisfactory',
  showTechInfoYellow: false,
  techInfoYellow: 'Found Satisfactory',
  showTechInfoCadmium: false,
  techInfoCadmium: 'Found satisfactory',
  showTechInfoNickel: false,
  techInfoNickel: 'Found satisfactory',
  showTechInfoFluropolymer: false,
  techInfoFluropolymer: 'Found satisfactory',
  showTechInfoPtfeBlue: false,
  techInfoPtfeBlueTitle: 'PTFE BLUE (XYLAN 1070)',
  techInfoPtfeBlue: 'Found Satisfactory',
  techInfoPtfeBlueTemp: 'The material can withstand the temperature range of -50°C to +200°C',
  showTechInfoNace: false,
  techInfoNace: 'We hereby confirm that the material Complies to NACE MR/0175/ ISO 15156-2 requirements.',

  heatTreatmentLegend: 'A: Hot form with final (620 ~ 950) | SR: Stress relieving (595 ~ 890)',
  chemSpecMin: { c: '', si: '', mn: '', p: '', s: '', cr: '', ni: '', mo: '', cu: '', v: '', ce: '' },
  chemSpecMax: { c: '', si: '', mn: '', p: '', s: '', cr: '', ni: '', mo: '', cu: '', v: '', ce: '' },
  mechSpecMin: { tsMpa: '', ysMpa: '', elPct: '', raPct: '', hardnessHbw: '', impactAve: '', hydroTest: '' },
  mechSpecMax: { tsMpa: '', ysMpa: '', elPct: '', raPct: '', hardnessHbw: '', impactAve: '', hydroTest: '' },
  items: [],
  chemicalData: [],
  mechanicalData: [],
  additionalInfo: '1. L: LADLE ANALYSIS, P: PRODUCT ANALYSIS, A: Hot form with final (620 ~ 950), SR: Stress relieving (595 ~ 890)\n2. T.S.: TENSILE STRENGTH, Y.S.: YIELD STRENGTH, EL.: ELONGATION, R.A: REDUCTION AREA',
  remarks: 'We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer\'s specification(s), and that they satisfy the requirements.',
  createdAt: new Date().toISOString()
};

export const isSampleCert = (rec?: Partial<QcReportRecord> | null): boolean => {
  if (!rec) return false;
  const po = (rec.customerPoNum || '').toUpperCase();
  const inv = (rec.invoiceNum || '').toUpperCase();
  const wo = (rec.workOrderNum || '').toUpperCase();
  const cert = (rec.certNo || rec.reportNo || '').toUpperCase();
  const issue = (rec.issueNo || '').toUpperCase();
  return po.includes('SAMPLE') || inv.includes('SAMPLE') || wo.includes('SAMPLE') || cert.includes('SAMPLE') || issue.includes('SAMPLE');
};

export const getMtcPdfFileName = (record: Partial<QcReportRecord> | null | undefined): string => {
  if (!record) return 'MTC-DOCUMENT';
  const type = record.templateType || 'MTC_T1';
  
  // Clean invalid filename characters: / \ : * ? " < > |
  const sanitize = (str: string) => str.replace(/[\/\\:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();

  // Type Code Mapping according to specification:
  // MTC 1-4 -> MTC
  // HDG GALVANIZING -> HDG
  // GI-ELECTRO-ZINC -> GI
  // CADMIUM PLATING -> CP
  // NICKEL COBALT COATING -> NCC
  // NICKEL PLATING -> NP
  // YELLOW PASSIVATED -> YP
  // PTFE/XYLAN -> PTFE
  // FLUROPOLYMER -> FLURO
  // TEFLON COATING -> TC
  // NEOPRENE SLEEVE -> NS
  // CERTIFICATE OF CONFORMITY -> COC
  // WARRANTY CERTIFICATE -> WC
  // COUNTRY OF ORIGIN -> COO
  // COMPLIANCE LETTER -> CL
  // INSPECTION REPORTS -> IR
  let typeCode = 'MTC';
  switch (type) {
    case 'MTC_T1':
    case 'MTC_T2':
    case 'MTC_T3':
    case 'MTC_T4':
      typeCode = 'MTC';
      break;
    case 'HDG_REPORT':
      typeCode = 'HDG';
      break;
    case 'GI_REPORT':
      typeCode = 'GI';
      break;
    case 'CADMIUM_REPORT':
      typeCode = 'CP';
      break;
    case 'NICKEL_COBALT_REPORT':
      typeCode = 'NCC';
      break;
    case 'NICKEL_REPORT':
      typeCode = 'NP';
      break;
    case 'YELLOW_PASSIVATED_REPORT':
      typeCode = 'YP';
      break;
    case 'PTFE_REPORT':
      typeCode = 'PTFE';
      break;
    case 'FLUROPOLYMER_REPORT':
      typeCode = 'FLURO';
      break;
    case 'TEFLON_REPORT':
      typeCode = 'TC';
      break;
    case 'NEOPRENE_SLEEVE_REPORT':
      typeCode = 'NS';
      break;
    case 'COC_REPORT':
    case 'CERTIFICATE_OF_CONFORMITY' as any:
      typeCode = 'COC';
      break;
    case 'WARRANTY_CERTIFICATE':
      typeCode = 'WC';
      break;
    case 'COO_CERTIFICATE':
      typeCode = 'COO';
      break;
    case 'COMPLIANCE_LETTER':
      typeCode = 'CL';
      break;
    case 'INSPECTION_REPORT':
      typeCode = 'IR';
      break;
    case 'INSPECTION_TEST_PLAN':
      typeCode = 'ITP';
      break;
    default:
      typeCode = 'MTC';
  }

  const isSample = isSampleCert(record);
  let invoicePart = (record.invoiceNum || '').trim();
  const customerPart = (record.customerName || '').trim() || 'CUSTOMER NAME';

  if (isSample) {
    // If invoice / po / wo mentions SAMPLE, add automatic sample numbering
    const rawInv = (record.invoiceNum || '').trim();
    const rawPo = (record.customerPoNum || '').trim();
    const rawWo = (record.workOrderNum || '').trim();
    const rawCert = (record.certNo || record.reportNo || '').trim();

    let sampleNumStr = '';
    const matchNum = (rawInv + ' ' + rawPo + ' ' + rawWo + ' ' + rawCert).match(/(?:SAMPLE|SMP)[\s\-_/:]*(\d+)/i);
    if (matchNum && matchNum[1]) {
      const numVal = parseInt(matchNum[1], 10);
      sampleNumStr = isNaN(numVal) ? matchNum[1] : (numVal < 10 ? `0${numVal}` : `${numVal}`);
    } else {
      const numFromCert = rawCert.match(/\d+$/);
      if (numFromCert) {
        sampleNumStr = numFromCert[0].slice(-2);
      } else {
        sampleNumStr = '01';
      }
    }

    if (invoicePart && !invoicePart.toUpperCase().includes('SAMPLE') && invoicePart !== '—') {
      invoicePart = `${invoicePart} SAMPLE ${sampleNumStr}`;
    } else {
      invoicePart = `SAMPLE ${sampleNumStr}`;
    }
  } else {
    if (!invoicePart || invoicePart === '—') {
      invoicePart = (record.certNo || record.reportNo || 'INVOICE').trim();
    }
  }

  return `${sanitize(invoicePart)} ${typeCode} ${sanitize(customerPart)}`.trim();
};

export const QcReportsComponent: React.FC = () => {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);

  useEffect(() => {
    const handleCompanyUpdate = () => {
      const comp = getActiveCompany();
      setActiveCompany(comp);
      setFormData(prev => ({
        ...prev,
        companyName: comp.name,
        companyAddress: comp.address,
        companyContact: comp.phone ? `${comp.phone} | ${comp.email || ''}` : (comp.email || ''),
        companyLogoUrl: comp.showLogo && comp.logoUrl ? comp.logoUrl : prev.companyLogoUrl,
      }));
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

  const [records, setRecords] = useState<QcReportRecord[]>(() => {
    return getInitialRecordsFromLocalStorage();
  });

  // Reconcile and load complete records from IndexedDB (unlimited capacity backup)
  useEffect(() => {
    let isMounted = true;
    loadRecordsFromIndexedDB().then((dbRecords) => {
      if (isMounted && dbRecords && dbRecords.length > 0) {
        setRecords((prev) => {
          if (prev.length === 0) return dbRecords;
          const existingIds = new Set(prev.map(r => r.id));
          const missingFromLocal = dbRecords.filter(r => !existingIds.has(r.id));
          return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
        });
      }
    });
    return () => { isMounted = false; };
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<'create' | 'records'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<QcTemplateType>('MTC_T1');
  const [templateCategoryTab, setTemplateCategoryTab] = useState<'all' | 'mtc' | 'coating' | 'compliance'>('mtc');
  const [templateSearchTerm, setTemplateSearchTerm] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [isFullscreenEditor, setIsFullscreenEditor] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Excel Modal State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelPasteTarget, setExcelPasteTarget] = useState<'items' | 'chemical' | 'mechanical'>('items');
  const [excelPasteText, setExcelPasteText] = useState('');

  // Filter States for Records tab
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MATERIAL_TEST_REPORT' | 'SAMPLE_MTC'>('ALL');
  const [filterCustomer, setFilterCustomer] = useState<string>('ALL');
  const [filterPo, setFilterPo] = useState<string>('ALL');
  const [filterTemplate, setFilterTemplate] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print modal state
  const [printModalRecord, setPrintModalRecord] = useState<QcReportRecord | null>(null);
  // Interactive Action Modal state for (PRINT PDF, EDIT, DELETE, CLOSE)
  const [actionModalRecord, setActionModalRecord] = useState<QcReportRecord | null>(null);
  const [copiedCertNo, setCopiedCertNo] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (actionModalRecord) setActionModalRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionModalRecord]);

  // Form State for Editing/Creating
    // Excel cell range selection state for Table 1 and Table 2
  const [selectedT1Cells, setSelectedT1Cells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [selectedT2Cells, setSelectedT2Cells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);

  const [formData, setFormData] = useState<QcReportRecord>(() => {
    const base = mergeSavedAssets(DEFAULT_RECORD);
    return {
      ...base,
      items: [],
      chemicalData: [],
      mechanicalData: []
    };
  });

  // Undo / Redo History Stacks & Tracking
  const [undoStack, setUndoStack] = useState<QcReportRecord[]>([]);
  const [redoStack, setRedoStack] = useState<QcReportRecord[]>([]);
  const isUndoRedoRef = useRef<boolean>(false);
  const currentFormDataRef = useRef<QcReportRecord>(formData);
  const lastCommittedStateRef = useRef<QcReportRecord>(formData);
  const typingTimerRef = useRef<any>(null);

  // Keep currentFormDataRef in sync with formData
  useEffect(() => {
    currentFormDataRef.current = formData;
  }, [formData]);

  // Track formData changes and record snapshots for Undo
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      lastCommittedStateRef.current = formData;
      return;
    }

    if (JSON.stringify(formData) === JSON.stringify(lastCommittedStateRef.current)) {
      return;
    }

    const stateBeforeEdit = lastCommittedStateRef.current;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setUndoStack(prev => {
        if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(stateBeforeEdit)) {
          return prev;
        }
        return [...prev.slice(-80), stateBeforeEdit];
      });
      setRedoStack([]); // Clear redo on fresh manual edit
      lastCommittedStateRef.current = formData;
      typingTimerRef.current = null;
    }, 250);
  }, [formData]);

  // Execute Undo
  const handleUndo = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      const prev = lastCommittedStateRef.current;
      const current = currentFormDataRef.current;
      if (JSON.stringify(prev) !== JSON.stringify(current)) {
        setRedoStack(r => [...r, current]);
        isUndoRedoRef.current = true;
        lastCommittedStateRef.current = prev;
        currentFormDataRef.current = prev;
        setFormData(prev);
        return;
      }
    }

    setUndoStack(prevUndo => {
      if (prevUndo.length === 0) return prevUndo;
      const targetState = prevUndo[prevUndo.length - 1];
      const newUndo = prevUndo.slice(0, -1);
      const current = currentFormDataRef.current;

      setRedoStack(prevRedo => [...prevRedo, current]);
      isUndoRedoRef.current = true;
      lastCommittedStateRef.current = targetState;
      currentFormDataRef.current = targetState;
      setFormData(targetState);
      return newUndo;
    });
  }, []);

  // Execute Redo
  const handleRedo = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    setRedoStack(prevRedo => {
      if (prevRedo.length === 0) return prevRedo;
      const targetState = prevRedo[prevRedo.length - 1];
      const newRedo = prevRedo.slice(0, -1);
      const current = currentFormDataRef.current;

      setUndoStack(prevUndo => [...prevUndo, current]);
      isUndoRedoRef.current = true;
      lastCommittedStateRef.current = targetState;
      currentFormDataRef.current = targetState;
      setFormData(targetState);
      return newRedo;
    });
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y / Ctrl+Shift+Z for Redo)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if print preview modal is open
      if (printModalRecord) return;

      // Check if Ctrl or Command is pressed
      if (!e.ctrlKey && !e.metaKey) return;

      const key = e.key.toLowerCase();

      // Undo: Ctrl+Z (without Shift)
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
      }
      // Redo: Ctrl+Y OR Ctrl+Shift+Z
      else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, [handleUndo, handleRedo, printModalRecord]);

  // Handle Signature / Stamp Image File Upload with Persistent LocalStorage Auto-Save
  const handleUploadSignature = async (type: 'engineer' | 'manager' | 'stamp', file: File) => {
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 800, 0.85);
      if (type === 'engineer') {
        setFormData(prev => ({ ...prev, engineerSignatureUrl: dataUrl }));
        saveAsset('engineerSignatureUrl', dataUrl);
      } else if (type === 'manager') {
        setFormData(prev => ({ ...prev, managerSignatureUrl: dataUrl }));
        saveAsset('managerSignatureUrl', dataUrl);
      } else if (type === 'stamp') {
        setFormData(prev => ({ ...prev, companyStampUrl: dataUrl }));
        saveAsset('companyStampUrl', dataUrl);
      }
    } catch (err) {
      console.warn('Error compressing signature image:', err);
    }
  };

  // Handle Marking File / Image Upload with Persistent LocalStorage Auto-Save
  const handleUploadMarkingFile = async (file: File) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      try {
        const dataUrl = await compressImageFile(file, 800, 0.85);
        setFormData(prev => {
          const updatedMech = [...(prev.mechanicalData || [])];
          return {
            ...prev,
            markingImageUrl: dataUrl,
            mechanicalData: updatedMech.map(m => ({ ...m, marking: m.marking || '' }))
          };
        });
        saveAsset('markingImageUrl' as any, dataUrl);
      } catch (err) {
        console.warn('Error compressing marking image:', err);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        setFormData(prev => {
          const updatedMech = [...(prev.mechanicalData || [])];
          lines.forEach((lineVal, idx) => {
            if (updatedMech[idx]) {
              updatedMech[idx] = { ...updatedMech[idx], marking: lineVal };
            }
          });
          return { ...prev, mechanicalData: updatedMech };
        });
      };
      reader.readAsText(file);
    }
  };

  // Handle Row-specific Marking File / Image Upload
  const handleRowMarkingUpload = async (idx: number, file: File) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      try {
        const dataUrl = await compressImageFile(file, 800, 0.85);
        setFormData(prev => {
          const updatedMech = [...(prev.mechanicalData || [])];
          if (!updatedMech[idx]) updatedMech[idx] = {};
          updatedMech[idx] = { ...updatedMech[idx], markingImage: dataUrl, marking: updatedMech[idx].marking || '' };
          return { ...prev, mechanicalData: updatedMech };
        });
      } catch (err) {
        console.warn('Error compressing row marking image:', err);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;
        setFormData(prev => {
          const updatedMech = [...(prev.mechanicalData || [])];
          if (!updatedMech[idx]) updatedMech[idx] = {};
          updatedMech[idx] = { ...updatedMech[idx], marking: text.trim() };
          return { ...prev, mechanicalData: updatedMech };
        });
      };
      reader.readAsText(file);
    }
  };

  // Handle Logo & Signature Upload with Persistent LocalStorage Auto-Save
  const handleUploadLogo = async (type: 'company' | 'iso' | 'engineer' | 'manager' | 'stamp', file: File) => {
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 800, 0.85);
      if (type === 'company') {
        setFormData(prev => ({ ...prev, companyLogoUrl: dataUrl }));
        saveAsset('companyLogoUrl', dataUrl);
      } else if (type === 'iso') {
        setFormData(prev => ({ ...prev, isoLogoUrl: dataUrl }));
        saveAsset('isoLogoUrl', dataUrl);
      } else if (type === 'engineer') {
        setFormData(prev => ({ ...prev, engineerSignatureUrl: dataUrl }));
        saveAsset('engineerSignatureUrl', dataUrl);
      } else if (type === 'manager') {
        setFormData(prev => ({ ...prev, managerSignatureUrl: dataUrl }));
        saveAsset('managerSignatureUrl', dataUrl);
      } else if (type === 'stamp') {
        setFormData(prev => ({ ...prev, companyStampUrl: dataUrl }));
        saveAsset('companyStampUrl', dataUrl);
      }
    } catch (err) {
      console.warn('Error compressing logo/stamp:', err);
    }
  };

  // Save to IndexedDB (unlimited capacity) and compact LocalStorage safely
  useEffect(() => {
    saveQcRecordsSafely(records);
  }, [records]);

  // Template drafts cache to isolate data between different templates (e.g. MTC 3 vs MTC 4)
  const templateDraftsRef = useRef<Record<string, QcReportRecord>>({});

  // Handle Template Type Switch
  const handleSelectTemplate = (type: QcTemplateType) => {
    // 1. Save current template data into draft cache
    if (formData && formData.templateType) {
      templateDraftsRef.current[formData.templateType] = JSON.parse(JSON.stringify(formData));
    }

    setSelectedTemplate(type);
    setIsFullscreenEditor(false); // Default to Exit Full Page view for all templates
    let label = 'MTC TEMPLATE 1 (EN 10204-3.1 Horizontal Inspection Certificate)';
    let spec = 'IN ACCORDANCE WITH STANDARD CODES: ASTM A234/A234M-07';
    let certPrefix = 'DBP';

    if (type === 'MTC_T2') {
      label = 'MTC TEMPLATE 2 (Material Test Certificate EN 10204 3.1 Fastener Inspection)';
      spec = 'Certified to BS EN 10204, 3.1';
      certPrefix = 'MFI:' + Math.floor(1000 + Math.random() * 9000) + '/08/2026';
    } else if (type === 'MTC_T3') {
      label = 'MTC TEMPLATE 3 (ASTM A320 L7 / A194 7 Heavy Hex)';
      spec = 'Certified to BS EN 10204, 3.1';
      certPrefix = 'MFI/2026/';
    } else if (type === 'MTC_T4') {
      label = 'MTC TEMPLATE 4 (Fix Pipeline Heavy Duty Spec)';
      spec = 'Certified to BS EN 10204, 3.1';
      certPrefix = 'MFI/2026/';
    } else if (type === 'HDG_REPORT') {
      label = 'HOT DIP GALVANIZING (HDG) INSPECTION REPORT';
      spec = 'ASTM A153 / ASTM A123 / ISO 1461';
      certPrefix = 'HDG/2026/';
    } else if (type === 'GI_REPORT') {
      label = 'ELECTRO-GALVANIZED (GI) INSPECTION REPORT';
      spec = 'ASTM B633 Class Fe/Zn 8 / ISO 2081';
      certPrefix = 'GI/2026/';
    } else if (type === 'NICKEL_REPORT') {
      label = 'NICKEL PLATING QUALITY INSPECTION REPORT';
      spec = 'ASTM B733 / ASTM B689';
      certPrefix = 'NIC/2026/';
    } else if (type === 'NICKEL_COBALT_REPORT') {
      label = 'NICKEL COBALT COATING TEST REPORT';
      spec = 'ASTM B994';
      certPrefix = 'NIC-CO/2026/';
    } else if (type === 'YELLOW_PASSIVATED_REPORT') {
      label = 'YELLOW PASSIVATED ZINC INSPECTION REPORT';
      spec = 'ASTM B633 Type II (Yellow Chromate)';
      certPrefix = 'YP/2026/';
    } else if (type === 'CADMIUM_REPORT') {
      label = 'CADMIUM PLATING QUALITY REPORT';
      spec = 'ASTM B766 / AMS-QQ-P-416 Type II';
      certPrefix = 'CAD/2026/';
    } else if (type === 'PTFE_REPORT') {
      label = 'PTFE / XYLAN FLUOROPOLYMER COATING REPORT';
      spec = 'XYLAN 1070 / 1424 FASTENER SPEC';
      certPrefix = 'PTFE/2026/';
    } else if (type === 'FLUROPOLYMER_REPORT') {
      label = 'FLUOROPOLYMER FASTENER COATING CERTIFICATE';
      spec = 'ISO 10683 / ASTM F3393';
      certPrefix = 'FLP/2026/';
    } else if (type === 'COC_REPORT') {
      label = 'CERTIFICATE OF CONFORMITY (COC)';
      spec = 'BS EN 10204 TYPE 2.1 / 2.2';
      certPrefix = 'COC/2026/';
    } else if (type === 'TEFLON_REPORT') {
      label = 'TEFLON (PTFE / FEP) COATING INSPECTION REPORT';
      spec = 'ASTM D4894 / TEFLON SPECIFICATION';
      certPrefix = 'TEF/2026/';
    } else if (type === 'NEOPRENE_SLEEVE_REPORT') {
      label = 'NEOPRENE SLEEVE & FLANGE ISOLATION REPORT';
      spec = 'NACE SP0286 / ASME B16.5';
      certPrefix = 'NSL/2026/';
    } else if (type === 'WARRANTY_CERTIFICATE') {
      label = 'OFFICIAL PRODUCT WARRANTY CERTIFICATE';
      spec = 'MARINE FASTENERS QA/QC POLICY';
      certPrefix = 'WAR/2026/';
    } else if (type === 'COO_CERTIFICATE') {
      label = 'COUNTRY OF ORIGIN CERTIFICATE (COO)';
      spec = 'UNITED ARAB EMIRATES RULES OF ORIGIN';
      certPrefix = 'COO/2026/';
    } else if (type === 'COMPLIANCE_LETTER') {
      label = 'REGULATORY & SPECIFICATION COMPLIANCE LETTER';
      spec = 'RoHS 2011/65/EU | REACH EC 1907/2006';
      certPrefix = 'CMP/2026/';
    } else if (type === 'INSPECTION_REPORT') {
      label = 'PRE-SHIPMENT QUALITY INSPECTION REPORT';
      spec = 'ISO 3269 / ASME B18.18 SAMPLING PLAN';
      certPrefix = 'INSP/2026/';
    }

    // 2. Check if user already typed in this template
    if (templateDraftsRef.current[type]) {
      const restored = templateDraftsRef.current[type];
      setFormData(restored);
      return;
    }

    // 3. Otherwise create isolated clean record for this template
    const base = mergeSavedAssets(DEFAULT_RECORD);
    const newCertNo = certPrefix.includes(':') ? certPrefix : certPrefix + Math.floor(100000 + Math.random() * 900000);

    if (type === 'MTC_T4') {
      const newMtc4Record: QcReportRecord = {
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'MTC_T4',
        templateLabel: label,
        specStandard: spec,
        items: [],
        chemicalData: [],
        mechanicalData: [],
        mtc4Sheets: [createDefaultMtc4Sheet(1, 'Sheet 1')],
        currentMtc4SheetIndex: 0,
        date: new Date().toLocaleDateString('en-GB')
      };
      setFormData(newMtc4Record);
      return;
    }

    if (type === 'MTC_T3') {
      const newMtc3Record: QcReportRecord = {
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'MTC_T3',
        templateLabel: label,
        specStandard: spec,
        items: [
          {
            id: 'item-1',
            itemNo: '1',
            description: 'STUD BOLT WITH 2 HEAVY HEX NUTS',
            size: '5/8"-11 UNC X 85MM',
            material: 'ASTM A320 GR L7 / A194 GR 7',
            standard: 'ASTM A320 GR L7 / A194 GR 7',
            type: 'STUD BOLT',
            classSch: '',
            qty: '200 PCS',
            finish: 'HDG',
            marking: 'L7 / 7',
            heatNo: 'L7-4412 / 7-8819',
            heatTreatment: 'Quenched & Tempered',
            ndePmi: '',
            remark: ''
          }
        ],
        chemicalData: [
          {
            itemNo: '1',
            heatNo: 'L7-4412 / 7-8819',
            specType: 'L',
            c: '0.41',
            mn: '0.85',
            p: '0.015',
            s: '0.012',
            si: '0.24',
            cr: '0.98',
            mo: '0.21',
            ni: '0.08',
            cu: '0.12',
            al: '0.02',
            n: '0.008',
            v: '0.005',
            b: '0.0008'
          }
        ],
        mechanicalData: [
          {
            itemNo: '1',
            heatNo: 'L7-4412 / 7-8819',
            specType: 'P',
            tsMpa: '890',
            ysMpa: '760',
            elPct: '17',
            raPct: '54',
            proofLoadLbf: '18500',
            stressUnderProofloadMpa: '650',
            temperingTempC: '620',
            hardness: '32 HRC'
          }
        ],
        date: new Date().toLocaleDateString('en-GB')
      };
      setFormData(newMtc3Record);
      return;
    }

    if (type === 'MTC_T2') {
      const newMtc2Record: QcReportRecord = {
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'MTC_T2',
        templateLabel: label,
        specStandard: spec,
        items: [
          {
            id: 'item-1',
            itemNo: '1',
            description: 'STUD BOLT WITH 2 HEAVY HEX NUTS',
            size: '5/8"-11 UNC X 85MM',
            material: 'ASTM A193 GR B7 / A194 GR 2H',
            standard: 'ASTM A193 GR B7 / A194 GR 2H',
            type: 'STUD BOLT',
            classSch: '',
            qty: '200 PCS',
            finish: 'HDG',
            marking: 'B7/2H',
            heatNo: 'B7-8821 / 2H-9912',
            heatTreatment: 'Quenched & Tempered',
            ndePmi: '',
            remark: ''
          }
        ],
        chemicalData: [
          {
            itemNo: '1',
            heatNo: 'B7-8821 / 2H-9912',
            specType: 'L',
            c: '0.41',
            mn: '0.85',
            p: '0.015',
            s: '0.012',
            si: '0.24',
            cr: '0.98',
            mo: '0.21',
            ni: '0.08',
            cu: '0.12',
            al: '0.02',
            n: '0.008',
            v: '0.005',
            b: '0.0008'
          }
        ],
        mechanicalData: [
          {
            itemNo: '1',
            heatNo: 'B7-8821 / 2H-9912',
            specType: 'P',
            tsMpa: '890',
            ysMpa: '760',
            elPct: '17',
            raPct: '54',
            proofLoadLbf: '18500',
            stressUnderProofloadMpa: '650',
            temperingTempC: '620',
            hardness: '32 HRC'
          }
        ],
        date: new Date().toLocaleDateString('en-GB')
      };
      setFormData(newMtc2Record);
      return;
    }

    if (type === 'NEOPRENE_SLEEVE_REPORT' || (type as string) === 'NEOPRENE_SLEEVE') {
      const neopreneItems: QcRecordItem[] = Array.from({ length: 5 }, (_, i) => ({
        id: `ns-item-${Date.now()}-${i + 1}`,
        itemNo: (i + 1).toString(),
        description: i === 0 ? 'NEOPRENE INSULATING SLEEVE FOR FLANGE ISOLATION' : '',
        size: i === 0 ? '2" NB CLASS 150' : '',
        standard: '',
        material: 'EPDM',
        finish: 'EPDM',
        qty: i === 0 ? '100 PCS' : '',
        heatNo: i === 0 ? 'EPDM-70' : '',
        observedCoating: i === 0 ? 'EPDM-70' : '',
        marking: '',
        remark: ''
      }));

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'NEOPRENE_SLEEVE_REPORT',
        templateLabel: 'Neoprene Sleeve',
        specStandard: 'ASTM D 2240 / ASTM D 412',
        items: neopreneItems,
        chemicalData: [],
        mechanicalData: [],
        neopreneBasePolymer: 'EPDM',
        neopreneColour: 'Black',
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    if (type === 'TEFLON_REPORT' || (type as string) === 'TEFLON') {
      const teflonItems: QcRecordItem[] = Array.from({ length: 5 }, (_, i) => ({
        id: `tef-item-${Date.now()}-${i + 1}`,
        itemNo: (i + 1).toString(),
        description: '',
        size: '',
        standard: '',
        material: '',
        finish: '',
        qty: '',
        heatNo: '',
        observedCoating: '',
        marking: '',
        remark: ''
      }));

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'TEFLON_REPORT',
        templateLabel: 'Teflon Coating',
        specStandard: 'ASTM D4894 / PTFE SPECIFICATION',
        items: teflonItems,
        chemicalData: [],
        mechanicalData: [],
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    if (type === 'INSPECTION_REPORT' || (type as string) === 'INSPECTION' || (type as string) === 'FINAL_INSPECTION' || (type as string) === 'QC_INSPECTION') {
      const defaultCertification = "We hereby certify that the materials described above have been subjected to pre-shipment quality inspection in accordance with the purchase order, drawings and applicable standards, and are found to be strictly conforming.";
      const inspectionItems: QcRecordItem[] = [
        {
          id: `insp-item-${Date.now()}-1`,
          itemNo: '1',
          description: '',
          size: '',
          standard: '',
          coatingMicronsMin: '',
          observedCoating: '',
          orderedQty: '',
          qty: '',
          finish: '',
          remark: 'ACCEPTED'
        },
        {
          id: `insp-item-${Date.now()}-2`,
          itemNo: '2',
          description: '',
          size: '',
          standard: '',
          coatingMicronsMin: '',
          observedCoating: '',
          orderedQty: '',
          qty: '',
          finish: '',
          remark: 'ACCEPTED'
        },
        {
          id: `insp-item-${Date.now()}-3`,
          itemNo: '3',
          description: '',
          size: '',
          standard: '',
          coatingMicronsMin: '',
          observedCoating: '',
          orderedQty: '',
          qty: '',
          finish: '',
          remark: 'ACCEPTED'
        },
        {
          id: `insp-item-${Date.now()}-4`,
          itemNo: '4',
          description: '',
          size: '',
          standard: '',
          coatingMicronsMin: '',
          observedCoating: '',
          orderedQty: '',
          qty: '',
          finish: '',
          remark: 'ACCEPTED'
        },
        {
          id: `insp-item-${Date.now()}-5`,
          itemNo: '5',
          description: '',
          size: '',
          standard: '',
          coatingMicronsMin: '',
          observedCoating: '',
          orderedQty: '',
          qty: '',
          finish: '',
          remark: 'ACCEPTED'
        }
      ];

      const baseInspData = {
        inspectionStandard: 'ISO 3269 / ASME B18.18 / ISO 2859-1',
        inspectionStage: 'FINAL PRE-SHIPMENT QUALITY INSPECTION',
        samplingPlan: 'ISO 2859-1 General Inspection Level II / AQL 1.0',
        totalQtyOrdered: 'AS PER PO',
        totalQtySupplied: 'AS PER DELIVERY NOTE',
        totalQtyInspected: '100% VISUAL / SAMPLING DIMENSIONAL',
        overallDisposition: 'CONFORMING / ACCEPTED FOR DISPATCH',
        dispositionStatus: 'CONFORMING / ACCEPTED FOR DISPATCH',
        certificationText: defaultCertification,
        remarks: 'INSPECTION SATISFACTORY. RELEASED FOR DISPATCH.'
      };

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'INSPECTION_REPORT',
        templateLabel: 'QUALITY INSPECTION REPORT',
        reportTitle: 'QUALITY INSPECTION REPORT',
        specStandard: 'ISO 3269 / ASME B18.18 / ISO 2859-1',
        certificationText: defaultCertification,
        remarks: 'INSPECTION SATISFACTORY. RELEASED FOR DISPATCH.',
        inspectionData: baseInspData,
        sheets: [
          {
            id: 'sheet-1',
            sheetNo: 1,
            title: 'SHEET 1',
            items: inspectionItems,
            inspectionData: baseInspData
          }
        ],
        items: inspectionItems,
        chemicalData: [],
        mechanicalData: [],
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    if (type === 'COC_REPORT' || (type as string) === 'COC' || (type as string) === 'CERTIFICATE_OF_CONFORMITY' || (type as string) === 'CONFORMITY_CERTIFICATE') {
      const compName = activeCompany.name || 'Marine Fasteners Industries L.L.C.';
      const defaultIntro = `We hereby certify that **${compName}** has supplied the material dated ${new Date().toLocaleDateString('en-GB')} to **Cabtech Trading & Contracting WLL** as specified in the Purchase Order No: PO/24/01-004328`;
      const defaultConformance = `Fasteners manufactured in UAE, **${compName}** are sampled, tested and inspected in accordance with the above specification and meets all of its requirements.`;
      
      const cocItems: QcRecordItem[] = [
        {
          id: `coc-item-${Date.now()}-1`,
          itemNo: '1',
          description: 'ANCHOR BOLT SLEEVE',
          size: '75MM X 250MM',
          standard: '',
          finish: 'SELF',
          qty: '28 PCS',
          heatNo: '56980763',
          remark: ''
        },
        {
          id: `coc-item-${Date.now()}-2`,
          itemNo: '2',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        },
        {
          id: `coc-item-${Date.now()}-3`,
          itemNo: '3',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        },
        {
          id: `coc-item-${Date.now()}-4`,
          itemNo: '4',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        },
        {
          id: `coc-item-${Date.now()}-5`,
          itemNo: '5',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        }
      ];

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'COC_REPORT',
        templateLabel: 'CERTIFICATE OF CONFORMITY (COC)',
        reportTitle: 'CERTIFICATE OF CONFORMITY',
        specStandard: 'BS EN 10204 2.1 / 2.2',
        certificationText: defaultIntro,
        additionalNotes: defaultConformance,
        cocData: {
          introText: defaultIntro,
          conformanceText: defaultConformance
        },
        items: cocItems,
        chemicalData: [],
        mechanicalData: [],
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    if (type === 'COMPLIANCE_LETTER' || (type as string) === 'COMPLIANCE_REPORT' || (type as string) === 'COMPLIANCE' || (type as string) === 'LETTER_OF_COMPLIANCE') {
      const compName = activeCompany.name || 'Marine Fasteners Industries L.L.C.';
      const defaultIntro = `We hereby certify that **${compName}** has supplied the material against Work order Ref: MF24254 to **HEAVY ENGINEERING INDUSTRIES AND SHIPBUILDING** as specified in the Invoice No. MFI_2400354`;
      const defaultConformance = `The above material complies with the specification mentioned in the above purchase order`;

      const complianceItems: QcRecordItem[] = [
        {
          id: `comp-item-${Date.now()}-1`,
          itemNo: '1',
          description: 'HEX BOLT & NUT',
          size: 'M24 X 120MM',
          standard: 'ISO 4014 / ISO 4032',
          finish: 'HDG',
          qty: '500 PCS',
          heatNo: '',
          remark: ''
        },
        {
          id: `comp-item-${Date.now()}-2`,
          itemNo: '2',
          description: 'PLAIN WASHER',
          size: 'M24',
          standard: 'ISO 7089/200 HV',
          finish: 'HDG',
          qty: '1000 PCS',
          heatNo: '',
          remark: ''
        },
        {
          id: `comp-item-${Date.now()}-3`,
          itemNo: '3',
          description: 'THREADED ROD',
          size: 'M20 X 1000MM',
          standard: 'DIN 975 GR 8.8',
          finish: 'HDG',
          qty: '200 PCS',
          heatNo: '',
          remark: ''
        },
        {
          id: `comp-item-${Date.now()}-4`,
          itemNo: '4',
          description: 'SPRING WASHER',
          size: 'M20',
          standard: 'DIN 127B',
          finish: 'HDG',
          qty: '400 PCS',
          heatNo: '',
          remark: ''
        },
        {
          id: `comp-item-${Date.now()}-5`,
          itemNo: '5',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        }
      ];

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'COMPLIANCE_REPORT',
        templateLabel: 'LETTER OF COMPLIANCE',
        reportTitle: 'LETTER OF COMPLIANCE',
        specStandard: '2.1 (EN 10204-Ed 2004)',
        customerName: 'HEAVY ENGINEERING INDUSTRIES AND SHIPBUILDING',
        workOrderNum: 'MF24254',
        invoiceNum: 'MFI_2400354',
        poNumber: '419827',
        certificationText: defaultIntro,
        additionalNotes: defaultConformance,
        complianceData: {
          introText: defaultIntro,
          conformanceText: defaultConformance
        },
        items: complianceItems,
        chemicalData: [],
        mechanicalData: [],
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    if (type === 'WARRANTY_CERTIFICATE' || (type as string) === 'WARRANTY' || (type as string) === 'WARRANTY_REPORT') {
      const compName = activeCompany.name || 'Marine Fasteners Industries L.L.C.';
      const defaultIntro = `We M/s. **${compName}** warrant that everything furnished here under shall be free from defects and faults in design, material, workmanship and manufacture and shall be of the highest grade and consistent with the established and generally accepted standard for goods of the type ordered and in full conformity, with the PO specifications.`;
      const defaultPeriod = `The fasteners are warranted for 12 months from the date of supply as per general terms & conditions above purchase order.`;

      const warrantyItems: QcRecordItem[] = [
        {
          id: `war-item-${Date.now()}-1`,
          itemNo: '1',
          description: 'HEX NUT HEAVY ASTM A194 GR. 2H',
          size: '1-1/8"-8UN',
          standard: 'ASTM A194 GR. 2H',
          finish: 'XYLAN 1424 BLUE',
          qty: '1500 PCS',
          heatNo: 'HT-98421A',
          remark: ''
        },
        {
          id: `war-item-${Date.now()}-2`,
          itemNo: '2',
          description: 'STUD BOLT ASTM A193 GR. B7 WITH 2 NUTS',
          size: '1-1/8"-8UN X 350MM',
          standard: 'ASTM A193 GR. B7',
          finish: 'XYLAN 1424 BLUE',
          qty: '750 SETS',
          heatNo: 'HT-66120B',
          remark: ''
        },
        {
          id: `war-item-${Date.now()}-3`,
          itemNo: '3',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        },
        {
          id: `war-item-${Date.now()}-4`,
          itemNo: '4',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        },
        {
          id: `war-item-${Date.now()}-5`,
          itemNo: '5',
          description: '',
          size: '',
          standard: '',
          finish: '',
          qty: '',
          heatNo: '',
          remark: ''
        }
      ];

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'WARRANTY_CERTIFICATE',
        templateLabel: 'WARRANTY CERTIFICATE',
        reportTitle: 'WARRANTY CERTIFICATE',
        specStandard: 'BS EN 10204 2.1',
        certificationText: defaultIntro,
        additionalNotes: defaultPeriod,
        warrantyData: {
          introText: defaultIntro,
          warrantyPeriodText: defaultPeriod
        },
        items: warrantyItems,
        chemicalData: [],
        mechanicalData: [],
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    if (type === 'INSPECTION_TEST_PLAN' || (type as string) === 'ITP_REPORT' || (type as string) === 'ITP' || (type as string) === 'INSPECTION_PLAN') {
      const itpItems: QcRecordItem[] = [
        {
          id: `itp-item-${Date.now()}-1`,
          itemNo: '1',
          description: 'STUD BOLTS WITH 2 HEAVY HEX NUTS',
          size: '1" - 8UNC X 250MM',
          standard: 'ASTM A193 B7 / A194 2H',
          finish: 'HDG / XYLAN 1424',
          qty: '500 SETS',
          heatNo: 'HT-99824',
          remark: 'COMPLIANT'
        }
      ];

      setFormData({
        ...base,
        id: 'QC-' + Date.now(),
        certNo: newCertNo,
        templateType: 'INSPECTION_TEST_PLAN',
        templateLabel: 'INSPECTION & TEST PLAN (ITP)',
        reportTitle: 'INSPECTION AND TEST PLAN (ITP)',
        specStandard: 'ISO 9001 / ASTM A193 / ASTM A194 / BS EN 10204 3.1',
        customerName: 'DUBAI MARINE & HEAVY ENGINEERING PJSC',
        customerPoNum: 'PO-2026-9042',
        workOrderNum: 'WO-24098',
        productDescription: 'HIGH TENSILE STUD BOLTS (ASTM A193 B7 / A320 L7) WITH HEAVY HEX NUTS (ASTM A194 2H / GR. 7)',
        items: itpItems,
        chemicalData: [],
        mechanicalData: [],
        date: new Date().toLocaleDateString('en-GB')
      });
      return;
    }

    // Default clean template creation for other reports (HDG, etc.)
    setFormData({
      ...base,
      id: 'QC-' + Date.now(),
      certNo: newCertNo,
      templateType: type,
      templateLabel: label,
      specStandard: spec,
      items: [
        {
          id: 'item-1',
          itemNo: '1',
          description: '',
          size: '',
          heatNo: '',
          qty: '',
          finish: '',
          marking: '',
          remark: ''
        }
      ],
      chemicalData: [],
      mechanicalData: [],
      date: new Date().toLocaleDateString('en-GB')
    });
  };

  // Create clean new MTC
  const handleCreateNewMtc = () => {
    const base = mergeSavedAssets(DEFAULT_RECORD);
    const newCertNo = generateDefaultCertNo(selectedTemplate);
    setFormData({
      ...base,
      id: 'QC-' + Date.now(),
      certNo: newCertNo,
      issueNo: newCertNo,
      templateType: selectedTemplate,
      items: [],
      chemicalData: [],
      mechanicalData: [],
      date: new Date().toLocaleDateString('en-GB')
    });
  };

  // Add Item to Product Items list
  const handleAddItem = () => {
    setFormData(prev => {
      const nextIdx = (prev.sheets && prev.sheets.length > 0)
        ? (prev.sheets[0]?.items?.length || prev.items.length)
        : prev.items.length;
      const itemNo = (nextIdx + 1).toString();
      const newItem: QcRecordItem = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
        itemNo,
        description: '',
        type: '',
        material: '',
        standard: '',
        size: '',
        classSch: '',
        qty: '',
        heatNo: '',
        heatTreatment: '',
        ndePmi: '',
        remark: '',
        finish: '',
        marking: ''
      };

      const newChem: QcChemicalItem = {
        itemNo,
        heatNo: '',
        specType: 'L',
        c: '',
        si: '',
        mn: '',
        p: '',
        s: '',
        cr: '',
        ni: '',
        mo: '',
        al: '',
        cu: '',
        v: '',
        n: '',
        ti: '',
        b: '',
        pb: '',
        zn: '',
        fe: '',
        sn: '',
        totalImpurity: '',
        other: ''
      };

      const newMech: QcMechanicalItem = {
        itemNo,
        heatNo: '',
        specType: 'P',
        utsKsi: '',
        ysKsi: '',
        elPct: '',
        raPct: '',
        proofLoadLbf: '',
        stressUnderProofloadMpa: '',
        heatTreatment: '',
        hardness: '',
        hardness24Hr540C: '',
        quenchingTempC: '',
        quenchingHoldingTime: '',
        quenchingMedium: '',
        temperingTempC: '',
        temperingHoldingTime: '',
        stressRelievedC: '',
        temperingResult: '',
        impactJ: '',
        avgImpactJ: '',
        impactTempC: '',
        pren: '',
        marking: ''
      };

      let updatedSheets = prev.sheets;
      if (updatedSheets && updatedSheets.length > 0) {
        updatedSheets = updatedSheets.map((sh, sIdx) => {
          const sItems = [...(sh.items || [])];
          const sChem = [...(sh.chemicalData || [])];
          const sMech = [...(sh.mechanicalData || [])];
          const sItemNo = String(sItems.length + 1);
          sItems.push({ ...newItem, id: `item-${Date.now()}-${sIdx}-${sItemNo}`, itemNo: sItemNo });
          sChem.push({ ...newChem, itemNo: sItemNo });
          sMech.push({ ...newMech, itemNo: sItemNo });
          return {
            ...sh,
            items: sItems,
            chemicalData: sChem,
            mechanicalData: sMech
          };
        });
      }

      return {
        ...prev,
        sheets: updatedSheets,
        items: [...prev.items, newItem],
        chemicalData: [...(prev.chemicalData || []), newChem],
        mechanicalData: [...(prev.mechanicalData || []), newMech]
      };
    });
  };

  // Remove Item
  const handleRemoveItem = (id: string, index?: number) => {
    setFormData(prev => {
      const idxToRemove = index !== undefined ? index : prev.items.findIndex(it => it.id === id);
      if (idxToRemove === -1) {
        return {
          ...prev,
          items: prev.items.filter(it => it.id !== id)
        };
      }
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== idxToRemove),
        chemicalData: (prev.chemicalData || []).filter((_, i) => i !== idxToRemove),
        mechanicalData: (prev.mechanicalData || []).filter((_, i) => i !== idxToRemove)
      };
    });
  };

  // MTC 1 Floating Row Context Menu (Insert / Duplicate / Delete across all tables synchronized)
  const [mtc1RowContextMenu, setMtc1RowContextMenu] = useState<{
    x: number;
    y: number;
    rowIdx: number;
    section?: 'items' | 'chemical' | 'mechanical';
  } | null>(null);

  useEffect(() => {
    const handleCloseMtc1Menu = () => setMtc1RowContextMenu(null);
    window.addEventListener('click', handleCloseMtc1Menu);
    window.addEventListener('scroll', handleCloseMtc1Menu, true);
    return () => {
      window.removeEventListener('click', handleCloseMtc1Menu);
      window.removeEventListener('scroll', handleCloseMtc1Menu, true);
    };
  }, []);

  const handleInsertMtc1RowAt = (targetIdx: number, position: 'above' | 'below') => {
    const insertIdx = position === 'above' ? targetIdx : targetIdx + 1;
    const newItem: QcRecordItem = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      itemNo: (insertIdx + 1).toString(),
      description: '',
      type: '',
      material: '',
      standard: '',
      size: '',
      classSch: '',
      qty: '',
      heatNo: '',
      heatTreatment: '',
      ndePmi: '',
      remark: '',
      finish: '',
      marking: ''
    };

    const newChem: QcChemicalItem = {
      itemNo: (insertIdx + 1).toString(),
      heatNo: '',
      specType: 'L'
    };

    const newMech: QcMechanicalItem = {
      itemNo: (insertIdx + 1).toString(),
      heatNo: '',
      specType: 'P'
    };

    setFormData(prev => {
      const updatedItems = [...prev.items];
      const updatedChem = [...(prev.chemicalData || [])];
      const updatedMech = [...(prev.mechanicalData || [])];

      while (updatedChem.length < updatedItems.length) {
        const idx = updatedChem.length;
        updatedChem.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'L' });
      }
      while (updatedMech.length < updatedItems.length) {
        const idx = updatedMech.length;
        updatedMech.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'P' });
      }

      updatedItems.splice(insertIdx, 0, newItem);
      updatedChem.splice(insertIdx, 0, newChem);
      updatedMech.splice(insertIdx, 0, newMech);

      updatedItems.forEach((it, i) => { it.itemNo = (i + 1).toString(); });
      updatedChem.forEach((c, i) => { c.itemNo = (i + 1).toString(); });
      updatedMech.forEach((m, i) => { m.itemNo = (i + 1).toString(); });

      return {
        ...prev,
        items: updatedItems,
        chemicalData: updatedChem,
        mechanicalData: updatedMech
      };
    });
    setMtc1RowContextMenu(null);
  };

  const handleDuplicateMtc1RowAt = (sourceIdx: number) => {
    if (sourceIdx < 0 || sourceIdx >= formData.items.length) return;
    const sourceItem = formData.items[sourceIdx];
    const sourceChem = formData.chemicalData?.[sourceIdx] || {};
    const sourceMech = formData.mechanicalData?.[sourceIdx] || {};

    const insertIdx = sourceIdx + 1;
    const newItem: QcRecordItem = {
      ...sourceItem,
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      itemNo: (insertIdx + 1).toString()
    };

    const newChem: QcChemicalItem = {
      ...sourceChem,
      itemNo: (insertIdx + 1).toString()
    };

    const newMech: QcMechanicalItem = {
      ...sourceMech,
      itemNo: (insertIdx + 1).toString()
    };

    setFormData(prev => {
      const updatedItems = [...prev.items];
      const updatedChem = [...(prev.chemicalData || [])];
      const updatedMech = [...(prev.mechanicalData || [])];

      while (updatedChem.length < updatedItems.length) {
        const idx = updatedChem.length;
        updatedChem.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'L' });
      }
      while (updatedMech.length < updatedItems.length) {
        const idx = updatedMech.length;
        updatedMech.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'P' });
      }

      updatedItems.splice(insertIdx, 0, newItem);
      updatedChem.splice(insertIdx, 0, newChem);
      updatedMech.splice(insertIdx, 0, newMech);

      updatedItems.forEach((it, i) => { it.itemNo = (i + 1).toString(); });
      updatedChem.forEach((c, i) => { c.itemNo = (i + 1).toString(); });
      updatedMech.forEach((m, i) => { m.itemNo = (i + 1).toString(); });

      return {
        ...prev,
        items: updatedItems,
        chemicalData: updatedChem,
        mechanicalData: updatedMech
      };
    });
    setMtc1RowContextMenu(null);
  };

  const handleDeleteMtc1RowAt = (deleteIdx: number) => {
    setFormData(prev => {
      if (prev.items.length <= 1) {
        const clearedItem: QcRecordItem = {
          id: Date.now().toString(),
          itemNo: '1',
          description: '',
          type: '',
          material: '',
          standard: '',
          size: '',
          classSch: '',
          qty: '',
          heatNo: '',
          heatTreatment: '',
          ndePmi: '',
          remark: '',
          finish: '',
          marking: ''
        };
        return {
          ...prev,
          items: [clearedItem],
          chemicalData: [{ itemNo: '1', heatNo: '', specType: 'L' }],
          mechanicalData: [{ itemNo: '1', heatNo: '', specType: 'P' }]
        };
      }

      const updatedItems = prev.items.filter((_, i) => i !== deleteIdx);
      const updatedChem = (prev.chemicalData || []).filter((_, i) => i !== deleteIdx);
      const updatedMech = (prev.mechanicalData || []).filter((_, i) => i !== deleteIdx);

      updatedItems.forEach((it, i) => { it.itemNo = (i + 1).toString(); });
      updatedChem.forEach((c, i) => { c.itemNo = (i + 1).toString(); });
      updatedMech.forEach((m, i) => { m.itemNo = (i + 1).toString(); });

      return {
        ...prev,
        items: updatedItems,
        chemicalData: updatedChem,
        mechanicalData: updatedMech
      };
    });
    setMtc1RowContextMenu(null);
  };

  // Auto-Sync Heat Numbers into Chemical and Mechanical tables
  const handleSyncHeatNumbers = () => {
    const newChem: QcChemicalItem[] = formData.items.map((it, idx) => ({
      itemNo: it.itemNo || (idx + 1).toString(),
      heatNo: it.heatNo || '',
      specType: 'L',
      c: formatChemVal(formData.chemicalData?.[idx]?.c),
      si: formatChemVal(formData.chemicalData?.[idx]?.si),
      mn: formatChemVal(formData.chemicalData?.[idx]?.mn),
      p: formatChemVal(formData.chemicalData?.[idx]?.p),
      s: formatChemVal(formData.chemicalData?.[idx]?.s),
      cr: formatChemVal(formData.chemicalData?.[idx]?.cr),
      ni: formatChemVal(formData.chemicalData?.[idx]?.ni),
      mo: formatChemVal(formData.chemicalData?.[idx]?.mo),
      al: formatChemVal(formData.chemicalData?.[idx]?.al),
      cu: formatChemVal(formData.chemicalData?.[idx]?.cu),
      v: formatChemVal(formData.chemicalData?.[idx]?.v),
      n: formatChemVal(formData.chemicalData?.[idx]?.n),
      ti: formatChemVal(formData.chemicalData?.[idx]?.ti),
      b: formatChemVal(formData.chemicalData?.[idx]?.b),
      pb: formatChemVal(formData.chemicalData?.[idx]?.pb),
      zn: formatChemVal(formData.chemicalData?.[idx]?.zn),
      fe: formatChemVal(formData.chemicalData?.[idx]?.fe),
      sn: formatChemVal(formData.chemicalData?.[idx]?.sn),
      totalImpurity: formatChemVal(formData.chemicalData?.[idx]?.totalImpurity),
      other: formData.chemicalData?.[idx]?.other || ''
    }));

    const newMech: QcMechanicalItem[] = formData.items.map((it, idx) => ({
      itemNo: it.itemNo || (idx + 1).toString(),
      heatNo: it.heatNo || '',
      specType: 'P',
      utsKsi: formData.mechanicalData?.[idx]?.utsKsi || '',
      ysKsi: formData.mechanicalData?.[idx]?.ysKsi || '',
      elPct: formData.mechanicalData?.[idx]?.elPct || '',
      raPct: formData.mechanicalData?.[idx]?.raPct || '',
      proofLoadLbf: formData.mechanicalData?.[idx]?.proofLoadLbf || '',
      stressUnderProofloadMpa: formData.mechanicalData?.[idx]?.stressUnderProofloadMpa || '',
      heatTreatment: formData.mechanicalData?.[idx]?.heatTreatment || '',
      hardness: formData.mechanicalData?.[idx]?.hardness || '',
      hardness24Hr540C: formData.mechanicalData?.[idx]?.hardness24Hr540C || '',
      quenchingTempC: formData.mechanicalData?.[idx]?.quenchingTempC || '',
      quenchingHoldingTime: formData.mechanicalData?.[idx]?.quenchingHoldingTime || '',
      quenchingMedium: formData.mechanicalData?.[idx]?.quenchingMedium || '',
      temperingTempC: formData.mechanicalData?.[idx]?.temperingTempC || '',
      temperingHoldingTime: formData.mechanicalData?.[idx]?.temperingHoldingTime || '',
      stressRelievedC: formData.mechanicalData?.[idx]?.stressRelievedC || '',
      temperingResult: formData.mechanicalData?.[idx]?.temperingResult || '',
      impactJ: formData.mechanicalData?.[idx]?.impactJ || '',
      avgImpactJ: formData.mechanicalData?.[idx]?.avgImpactJ || '',
      impactTempC: formData.mechanicalData?.[idx]?.impactTempC || '',
      pren: formData.mechanicalData?.[idx]?.pren || '',
      marking: formData.mechanicalData?.[idx]?.marking || ''
    }));

    setFormData(prev => ({
      ...prev,
      chemicalData: newChem,
      mechanicalData: newMech
    }));
  };

  // Add chemical row
  const handleAddChemicalRow = () => {
    const newRow: QcChemicalItem = {
      itemNo: (formData.chemicalData?.length || 0) + 1 + '',
      heatNo: '',
      specType: 'L',
      c: '',
      si: '',
      mn: '',
      p: '',
      s: '',
      cr: '',
      ni: '',
      mo: '',
      al: '',
      cu: '',
      v: '',
      ce: ''
    };
    setFormData(prev => ({
      ...prev,
      chemicalData: [...(prev.chemicalData || []), newRow]
    }));
  };

  const handleRemoveChemicalRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      chemicalData: (prev.chemicalData || []).filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateChemicalRow = (idx: number, field: keyof QcChemicalItem, val: string) => {
    const isText = ['heatNo', 'itemNo', 'specType', 'other'].includes(field as string);
    const formattedVal = isText ? val : formatNumericVal(val);
    setFormData(prev => {
      const copy = [...(prev.chemicalData || [])];
      copy[idx] = { ...copy[idx], [field]: formattedVal };
      return { ...prev, chemicalData: copy };
    });
  };

  // Add mechanical row
  const handleAddMechanicalRow = () => {
    const newRow: QcMechanicalItem = {
      itemNo: (formData.mechanicalData?.length || 0) + 1 + '',
      heatNo: '',
      specType: 'P',
      tsMpa: '',
      ysMpa: '',
      elPct: '',
      hardnessHbw: ''
    };
    setFormData(prev => ({
      ...prev,
      mechanicalData: [...(prev.mechanicalData || []), newRow]
    }));
  };

  const handleRemoveMechanicalRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      mechanicalData: (prev.mechanicalData || []).filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateMechanicalRow = (idx: number, field: keyof QcMechanicalItem, val: string) => {
    const isText = ['heatNo', 'itemNo', 'specType', 'marking', 'heatTreatment', 'quenchingMedium', 'temperingResult'].includes(field as string);
    const formattedVal = isText ? val : formatNumericVal(val);
    setFormData(prev => {
      const copy = [...(prev.mechanicalData || [])];
      copy[idx] = { ...copy[idx], [field]: formattedVal };
      return { ...prev, mechanicalData: copy };
    });
  };

  // Excel Paste Parser
  const handleProcessExcelPaste = () => {
    if (!excelPasteText.trim()) return;
    const lines = excelPasteText.trim().split('\n');

    if (excelPasteTarget === 'items') {
      const parsedItems: QcRecordItem[] = lines.map((line, i) => {
        const parts = line.split('\t');
        return {
          id: Date.now() + i + '',
          itemNo: parts[0]?.trim() || (i + 1).toString(),
          description: parts[1]?.trim() || '',
          type: parts[2]?.trim() || '',
          material: parts[3]?.trim() || '',
          standard: parts[4]?.trim() || '',
          size: parts[5]?.trim() || '',
          classSch: parts[6]?.trim() || '',
          qty: parts[7]?.trim() || '',
          heatNo: parts[8]?.trim() || '',
          heatTreatment: parts[9]?.trim() || '',
          ndePmi: parts[10]?.trim() || '',
          remark: parts[11]?.trim() || '',
          finish: parts[12]?.trim() || ''
        };
      });
      setFormData(prev => ({ ...prev, items: [...prev.items, ...parsedItems] }));
    } else if (excelPasteTarget === 'chemical') {
      const parsedChem: QcChemicalItem[] = lines.map((line) => {
        const p = line.split('\t');
        return {
          itemNo: p[0]?.trim() || '1',
          specType: p[1]?.trim() || 'L',
          heatNo: p[2]?.trim() || '',
          c: formatNumericVal(p[3]?.trim() || ''),
          si: formatNumericVal(p[4]?.trim() || ''),
          mn: formatNumericVal(p[5]?.trim() || ''),
          p: formatNumericVal(p[6]?.trim() || ''),
          s: formatNumericVal(p[7]?.trim() || ''),
          cr: formatNumericVal(p[8]?.trim() || ''),
          ni: formatNumericVal(p[9]?.trim() || ''),
          mo: formatNumericVal(p[10]?.trim() || ''),
          cu: formatNumericVal(p[11]?.trim() || ''),
          v: formatNumericVal(p[12]?.trim() || ''),
          ce: formatNumericVal(p[13]?.trim() || '')
        };
      });
      setFormData(prev => ({ ...prev, chemicalData: [...(prev.chemicalData || []), ...parsedChem] }));
    } else if (excelPasteTarget === 'mechanical') {
      const parsedMech: QcMechanicalItem[] = lines.map((line) => {
        const p = line.split('\t');
        return {
          itemNo: p[0]?.trim() || '1',
          specType: p[1]?.trim() || 'P',
          heatNo: p[2]?.trim() || '',
          tsMpa: formatNumericVal(p[3]?.trim() || ''),
          ysMpa: formatNumericVal(p[4]?.trim() || ''),
          elPct: formatNumericVal(p[5]?.trim() || ''),
          raPct: formatNumericVal(p[6]?.trim() || ''),
          hardnessHbw: formatNumericVal(p[7]?.trim() || ''),
          impactTemp: formatNumericVal(p[8]?.trim() || ''),
          impactSize: formatNumericVal(p[9]?.trim() || ''),
          impactAve: formatNumericVal(p[10]?.trim() || ''),
          hydroTest: formatNumericVal(p[11]?.trim() || '')
        };
      });
      setFormData(prev => ({ ...prev, mechanicalData: [...(prev.mechanicalData || []), ...parsedMech] }));
    }

    setExcelPasteText('');
    setShowExcelModal(false);
  };


  // Table 1 Excel Columns List
  const getT1Columns = (record: QcReportRecord) => {
    const chemConfig = getActiveChemFields(record, record.chemicalData || record.items);
    const baseCols = ['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'];
    const chemCols = chemConfig.fields.map(f => f.k);
    return [...baseCols, ...chemCols];
  };

  // Focus a specific cell in Table 1
  const focusT1Cell = (rowIndex: number, colKey: string, isSelectingRange?: boolean) => {
    setTimeout(() => {
      const el = document.getElementById(`t1-cell-${rowIndex}-${colKey}`) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) {
        el.focus();
        if (!isSelectingRange && typeof el.select === 'function') {
          el.select();
        }
      }
    }, 15);
  };

  const isT1CellSelected = (rIdx: number, cIdx: number) => {
    if (!selectedT1Cells) return false;
    const minR = Math.min(selectedT1Cells.startRow, selectedT1Cells.endRow);
    const maxR = Math.max(selectedT1Cells.startRow, selectedT1Cells.endRow);
    const minC = Math.min(selectedT1Cells.startCol, selectedT1Cells.endCol);
    const maxC = Math.max(selectedT1Cells.startCol, selectedT1Cells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  const handleT1KeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number,
    colKey: string
  ) => {
    const t1Cols = getT1Columns(formData);
    const colIndex = t1Cols.indexOf(colKey);
    const inputEl = e.currentTarget;

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedT1Cells(null);
      return;
    }

    // Fill Down on Ctrl+D / Cmd+D
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedItems = [...formData.items];
      const updatedChem = [...(formData.chemicalData || [])];

      if (selectedT1Cells) {
        const minR = Math.min(selectedT1Cells.startRow, selectedT1Cells.endRow);
        const maxR = Math.max(selectedT1Cells.startRow, selectedT1Cells.endRow);
        const minC = Math.min(selectedT1Cells.startCol, selectedT1Cells.endCol);
        const maxC = Math.max(selectedT1Cells.startCol, selectedT1Cells.endCol);

        if (minR === maxR && minR > 0) {
          for (let c = minC; c <= maxC; c++) {
            const cKey = t1Cols[c];
            if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(cKey)) {
              (updatedItems[minR] as any)[cKey] = (updatedItems[minR - 1] as any)?.[cKey] || '';
              if (cKey === 'heatNo' && updatedChem[minR]) {
                updatedChem[minR].heatNo = (updatedItems[minR - 1] as any)?.heatNo || '';
              }
            } else {
              if (!updatedChem[minR]) updatedChem[minR] = { itemNo: (minR + 1).toString(), heatNo: updatedItems[minR]?.heatNo || '' };
              (updatedChem[minR] as any)[cKey] = (updatedChem[minR - 1] as any)?.[cKey] || '';
            }
          }
        } else if (maxR > minR) {
          for (let r = minR + 1; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              const cKey = t1Cols[c];
              if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(cKey)) {
                (updatedItems[r] as any)[cKey] = (updatedItems[minR] as any)?.[cKey] || '';
                if (cKey === 'heatNo' && updatedChem[r]) {
                  updatedChem[r].heatNo = (updatedItems[minR] as any)?.heatNo || '';
                }
              } else {
                if (!updatedChem[r]) updatedChem[r] = { itemNo: (r + 1).toString(), heatNo: updatedItems[r]?.heatNo || '' };
                (updatedChem[r] as any)[cKey] = (updatedChem[minR] as any)?.[cKey] || '';
              }
            }
          }
        }
      } else if (rowIndex > 0) {
        if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(colKey)) {
          (updatedItems[rowIndex] as any)[colKey] = (updatedItems[rowIndex - 1] as any)?.[colKey] || '';
          if (colKey === 'heatNo' && updatedChem[rowIndex]) {
            updatedChem[rowIndex].heatNo = (updatedItems[rowIndex - 1] as any)?.heatNo || '';
          }
        } else {
          if (!updatedChem[rowIndex]) updatedChem[rowIndex] = { itemNo: (rowIndex + 1).toString(), heatNo: updatedItems[rowIndex]?.heatNo || '' };
          (updatedChem[rowIndex] as any)[colKey] = (updatedChem[rowIndex - 1] as any)?.[colKey] || '';
        }
      }

      setFormData({ ...formData, items: updatedItems, chemicalData: updatedChem });
      return;
    }

    // Clear range on Delete/Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedT1Cells) {
      e.preventDefault();
      const minR = Math.min(selectedT1Cells.startRow, selectedT1Cells.endRow);
      const maxR = Math.max(selectedT1Cells.startRow, selectedT1Cells.endRow);
      const minC = Math.min(selectedT1Cells.startCol, selectedT1Cells.endCol);
      const maxC = Math.max(selectedT1Cells.startCol, selectedT1Cells.endCol);

      const updatedItems = [...formData.items];
      const updatedChem = [...(formData.chemicalData || [])];

      for (let r = minR; r <= maxR; r++) {
        if (!updatedItems[r]) continue;
        for (let c = minC; c <= maxC; c++) {
          const cKey = t1Cols[c];
          if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(cKey)) {
            (updatedItems[r] as any)[cKey] = '';
          } else {
            if (!updatedChem[r]) updatedChem[r] = { itemNo: (r + 1).toString(), heatNo: updatedItems[r].heatNo || '' };
            (updatedChem[r] as any)[cKey] = '';
          }
        }
      }
      setFormData({ ...formData, items: updatedItems, chemicalData: updatedChem });
      return;
    }

    // Copy selected cells TSV on Ctrl+C / Cmd+C (supports multi-column 3-4 column selection and rows)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      const hasMultiCellSelection = selectedT1Cells && (
        selectedT1Cells.startRow !== selectedT1Cells.endRow ||
        selectedT1Cells.startCol !== selectedT1Cells.endCol
      );

      if (!hasMultiCellSelection && inputEl.selectionStart !== inputEl.selectionEnd) {
        return; // native single-input text copy
      }
      e.preventDefault();
      let copyVal = '';
      if (selectedT1Cells) {
        const minR = Math.min(selectedT1Cells.startRow, selectedT1Cells.endRow);
        const maxR = Math.max(selectedT1Cells.startRow, selectedT1Cells.endRow);
        const minC = Math.min(selectedT1Cells.startCol, selectedT1Cells.endCol);
        const maxC = Math.max(selectedT1Cells.startCol, selectedT1Cells.endCol);
        const rowsData: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const it = formData.items[r];
          const ch = formData.chemicalData?.[r] || {};
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const cKey = t1Cols[c];
            let val = '';
            if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(cKey)) {
              val = (it as any)?.[cKey] || '';
            } else {
              val = (ch as any)?.[cKey] || '';
            }
            rowVals.push(val);
          }
          rowsData.push(rowVals.join('\t'));
        }
        copyVal = rowsData.join('\n');
      } else {
        const it = formData.items[rowIndex];
        const ch = formData.chemicalData?.[rowIndex] || {};
        if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(colKey)) {
          copyVal = (it as any)?.[colKey] || '';
        } else {
          copyVal = (ch as any)?.[colKey] || '';
        }
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
      }
      return;
    }

    // Shift + Arrow range selection like Excel (supports multi-column 3-4 column selection)
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedT1Cells?.endRow ?? rowIndex;
      let endC = selectedT1Cells?.endCol ?? colIndex;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(formData.items.length - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(t1Cols.length - 1, endC + 1);

      setSelectedT1Cells({
        startRow: selectedT1Cells?.startRow ?? rowIndex,
        startCol: selectedT1Cells?.startCol ?? colIndex,
        endRow: endR,
        endCol: endC
      });

      focusT1Cell(endR, t1Cols[endC], true);
      return;
    }

    // Enter or Tab navigation
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();

      if (e.shiftKey) {
        // Move Left or Previous Row
        if (colIndex > 0) {
          focusT1Cell(rowIndex, t1Cols[colIndex - 1]);
        } else if (rowIndex > 0) {
          focusT1Cell(rowIndex - 1, t1Cols[t1Cols.length - 1]);
        }
      } else {
        // Move Right or Next Row
        if (colIndex < t1Cols.length - 1) {
          focusT1Cell(rowIndex, t1Cols[colIndex + 1]);
        } else {
          // Reached end of row -> Move to next row col 0 (description)
          if (rowIndex < formData.items.length - 1) {
            focusT1Cell(rowIndex + 1, t1Cols[0]);
          } else {
            // Add new item row and focus it!
            handleAddItem();
            setTimeout(() => {
              focusT1Cell(formData.items.length, t1Cols[0]);
            }, 60);
          }
        }
      }
      return;
    }

    // Arrow Keys Navigation (when not selecting with Shift)
    if (!e.shiftKey) {
      if (e.key === 'ArrowUp') {
        if (rowIndex > 0) {
          e.preventDefault();
          setSelectedT1Cells(null);
          focusT1Cell(rowIndex - 1, colKey);
        } else {
          // Top row -> Move up to metadata Work Order
          e.preventDefault();
          const woEl = document.getElementById('meta-work-order-no');
          if (woEl) woEl.focus();
        }
      } else if (e.key === 'ArrowDown') {
        if (rowIndex < formData.items.length - 1) {
          e.preventDefault();
          setSelectedT1Cells(null);
          focusT1Cell(rowIndex + 1, colKey);
        }
      } else if (e.key === 'ArrowLeft') {
        const isAtStart = inputEl.selectionStart === 0 && inputEl.selectionEnd === 0;
        if (isAtStart) {
          e.preventDefault();
          setSelectedT1Cells(null);
          if (colIndex > 0) {
            focusT1Cell(rowIndex, t1Cols[colIndex - 1]);
          } else if (rowIndex > 0) {
            focusT1Cell(rowIndex - 1, t1Cols[t1Cols.length - 1]);
          }
        }
      } else if (e.key === 'ArrowRight') {
        const isAtEnd = inputEl.selectionStart === inputEl.value.length;
        if (isAtEnd) {
          e.preventDefault();
          setSelectedT1Cells(null);
          if (colIndex < t1Cols.length - 1) {
            focusT1Cell(rowIndex, t1Cols[colIndex + 1]);
          } else if (rowIndex < formData.items.length - 1) {
            focusT1Cell(rowIndex + 1, t1Cols[0]);
          }
        }
      }
    }
  };

  const handleT1Paste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const hasDelimiters = text.includes('\t') || text.includes('\n');
    if (!hasDelimiters && !selectedT1Cells) {
      return; // allow normal native single-input paste
    }
    e.preventDefault();
    const t1Cols = getT1Columns(formData);
    const startColIndex = t1Cols.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));

    const updatedItems = [...formData.items];
    const updatedChem = [...(formData.chemicalData || [])];

    if (selectedT1Cells) {
      const minR = Math.min(selectedT1Cells.startRow, selectedT1Cells.endRow);
      const maxR = Math.max(selectedT1Cells.startRow, selectedT1Cells.endRow);
      const minC = Math.min(selectedT1Cells.startCol, selectedT1Cells.endCol);
      const maxC = Math.max(selectedT1Cells.startCol, selectedT1Cells.endCol);

      if (!hasDelimiters) {
        const val = text.trim();
        for (let r = minR; r <= maxR; r++) {
          if (!updatedItems[r]) {
            updatedItems[r] = {
              id: (Date.now() + r).toString(),
              itemNo: (r + 1).toString(),
              description: '',
              type: '',
              material: '',
              standard: '',
              size: '',
              classSch: '',
              qty: '',
              heatNo: '',
              heatTreatment: '',
              ndePmi: '',
              remark: '',
              finish: '',
              marking: ''
            };
          }
          if (!updatedChem[r]) {
            updatedChem[r] = { itemNo: (r + 1).toString(), heatNo: updatedItems[r].heatNo || '' };
          }
          for (let c = minC; c <= maxC; c++) {
            const colName = t1Cols[c];
            if (colName) {
              if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(colName)) {
                (updatedItems[r] as any)[colName] = val;
              } else {
                (updatedChem[r] as any)[colName] = formatNumericVal(val);
              }
            }
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
              description: '',
              type: '',
              material: '',
              standard: '',
              size: '',
              classSch: '',
              qty: '',
              heatNo: '',
              heatTreatment: '',
              ndePmi: '',
              remark: '',
              finish: '',
              marking: ''
            });
          }
          while (updatedChem.length <= targetR) {
            const rIdx = updatedChem.length;
            updatedChem.push({ itemNo: (rIdx + 1).toString(), heatNo: updatedItems[rIdx]?.heatNo || '' });
          }
          const cellVals = rowStr.split('\t');
          cellVals.forEach((val, cOffset) => {
            const targetC = minC + cOffset;
            if (targetC < t1Cols.length) {
              const colName = t1Cols[targetC];
              if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(colName)) {
                (updatedItems[targetR] as any)[colName] = val.trim();
              } else {
                (updatedChem[targetR] as any)[colName] = formatNumericVal(val.trim());
              }
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
            description: '',
            type: '',
            material: '',
            standard: '',
            size: '',
            classSch: '',
            qty: '',
            heatNo: '',
            heatTreatment: '',
            ndePmi: '',
            remark: '',
            finish: '',
            marking: ''
          });
        }
        while (updatedChem.length <= targetR) {
          const rIdx = updatedChem.length;
          updatedChem.push({ itemNo: (rIdx + 1).toString(), heatNo: updatedItems[rIdx]?.heatNo || '' });
        }

        const cellVals = rowStr.split('\t');
        cellVals.forEach((val, cOffset) => {
          const targetC = startColIndex + cOffset;
          if (targetC < t1Cols.length) {
            const colName = t1Cols[targetC];
            if (['description', 'size', 'material', 'finish', 'unit', 'qty', 'heatNo'].includes(colName)) {
              (updatedItems[targetR] as any)[colName] = val.trim();
            } else {
              (updatedChem[targetR] as any)[colName] = formatNumericVal(val.trim());
            }
          }
        });
      });
    }

    setFormData(prev => ({ ...prev, items: updatedItems, chemicalData: updatedChem }));
  };

  // Table 2 (Mechanical Properties) Excel Navigation
  const getT2Columns = (record: QcReportRecord) => {
    const cols: string[] = ['utsKsi', 'ysKsi', 'elPct', 'raPct', 'proofLoadLbf'];
    if (record.showColStressUnderProofload ?? false) cols.push('stressUnderProofloadMpa');
    if (record.showColHeatTreatment ?? true) cols.push('heatTreatment');
    cols.push('hardness');
    if (record.showColHardness24Hr ?? true) cols.push('hardness24Hr540C');
    if (record.showColQuenchingTemp ?? true) cols.push('quenchingTempC');
    if (record.showColQuenchingTime ?? true) cols.push('quenchingHoldingTime');
    if (record.showColQuenchingMedium ?? true) cols.push('quenchingMedium');
    if (record.showColTemperingTemp ?? false) cols.push('temperingTempC');
    if (record.showColTemperingTime ?? false) cols.push('temperingHoldingTime');
    if (record.showColStressRelieved ?? true) cols.push('stressRelievedC');
    if (record.showColTemperingResult ?? false) cols.push('temperingResult');
    if (record.showColImpactJ ?? true) cols.push('impactJ');
    if (record.showColAvgImpactJ ?? true) cols.push('avgImpactJ');
    if (record.showColImpactTemp ?? true) cols.push('impactTempC');
    if (record.showColPren ?? false) cols.push('pren');
    cols.push('marking');
    return cols;
  };

  const focusT2Cell = (rowIndex: number, colKey: string) => {
    setTimeout(() => {
      const el = document.getElementById(`t2-cell-${rowIndex}-${colKey}`) as HTMLInputElement | null;
      if (el) {
        el.focus();
        if (typeof el.select === 'function') {
          el.select();
        }
      }
    }, 15);
  };

  const isT2CellSelected = (rIdx: number, cIdx: number) => {
    if (!selectedT2Cells) return false;
    const minR = Math.min(selectedT2Cells.startRow, selectedT2Cells.endRow);
    const maxR = Math.max(selectedT2Cells.startRow, selectedT2Cells.endRow);
    const minC = Math.min(selectedT2Cells.startCol, selectedT2Cells.endCol);
    const maxC = Math.max(selectedT2Cells.startCol, selectedT2Cells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  const handleT2KeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colKey: string
  ) => {
    const t2Cols = getT2Columns(formData);
    const colIndex = t2Cols.indexOf(colKey);
    const inputEl = e.currentTarget;

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedT2Cells(null);
      return;
    }

    // Fill Down on Ctrl+D / Cmd+D
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedMech = [...(formData.mechanicalData || [])];

      if (selectedT2Cells) {
        const minR = Math.min(selectedT2Cells.startRow, selectedT2Cells.endRow);
        const maxR = Math.max(selectedT2Cells.startRow, selectedT2Cells.endRow);
        const minC = Math.min(selectedT2Cells.startCol, selectedT2Cells.endCol);
        const maxC = Math.max(selectedT2Cells.startCol, selectedT2Cells.endCol);

        if (minR === maxR && minR > 0) {
          const sourceRow = updatedMech[minR - 1] || {};
          const targetRow = { ...(updatedMech[minR] || { itemNo: (minR + 1).toString(), specType: 'P' }) };
          for (let c = minC; c <= maxC; c++) {
            const cKey = t2Cols[c];
            (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
          }
          updatedMech[minR] = targetRow;
        } else if (maxR > minR) {
          const sourceRow = updatedMech[minR] || {};
          for (let r = minR + 1; r <= maxR; r++) {
            const targetRow = { ...(updatedMech[r] || { itemNo: (r + 1).toString(), specType: 'P' }) };
            for (let c = minC; c <= maxC; c++) {
              const cKey = t2Cols[c];
              (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
            }
            updatedMech[r] = targetRow;
          }
        }
      } else if (rowIndex > 0) {
        const sourceVal = (updatedMech[rowIndex - 1] as any)?.[colKey] || '';
        const targetRow = { ...(updatedMech[rowIndex] || { itemNo: (rowIndex + 1).toString(), specType: 'P' }) };
        (targetRow as any)[colKey] = sourceVal;
        updatedMech[rowIndex] = targetRow;
      }

      setFormData({ ...formData, mechanicalData: updatedMech });
      return;
    }

    // Clear range on Delete/Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedT2Cells) {
      e.preventDefault();
      const minR = Math.min(selectedT2Cells.startRow, selectedT2Cells.endRow);
      const maxR = Math.max(selectedT2Cells.startRow, selectedT2Cells.endRow);
      const minC = Math.min(selectedT2Cells.startCol, selectedT2Cells.endCol);
      const maxC = Math.max(selectedT2Cells.startCol, selectedT2Cells.endCol);

      const updatedMech = [...(formData.mechanicalData || [])];
      for (let r = minR; r <= maxR; r++) {
        if (!updatedMech[r]) continue;
        for (let c = minC; c <= maxC; c++) {
          const cKey = t2Cols[c];
          (updatedMech[r] as any)[cKey] = '';
        }
      }
      setFormData({ ...formData, mechanicalData: updatedMech });
      return;
    }

    // Copy TSV
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      if (inputEl.selectionStart !== inputEl.selectionEnd) {
        return;
      }
      e.preventDefault();
      let copyVal = '';
      if (selectedT2Cells) {
        const minR = Math.min(selectedT2Cells.startRow, selectedT2Cells.endRow);
        const maxR = Math.max(selectedT2Cells.startRow, selectedT2Cells.endRow);
        const minC = Math.min(selectedT2Cells.startCol, selectedT2Cells.endCol);
        const maxC = Math.max(selectedT2Cells.startCol, selectedT2Cells.endCol);
        const rowsData: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const m = formData.mechanicalData?.[r] || {};
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const cKey = t2Cols[c];
            rowVals.push((m as any)?.[cKey] || '');
          }
          rowsData.push(rowVals.join('\t'));
        }
        copyVal = rowsData.join('\n');
      } else {
        const m = formData.mechanicalData?.[rowIndex] || {};
        copyVal = (m as any)?.[colKey] || '';
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
      }
      return;
    }

    // Shift + Arrows selection
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedT2Cells?.endRow ?? rowIndex;
      let endC = selectedT2Cells?.endCol ?? colIndex;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(formData.items.length - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(t2Cols.length - 1, endC + 1);

      setSelectedT2Cells({
        startRow: selectedT2Cells?.startRow ?? rowIndex,
        startCol: selectedT2Cells?.startCol ?? colIndex,
        endRow: endR,
        endCol: endC
      });

      focusT2Cell(endR, t2Cols[endC]);
      return;
    }

    // Enter or Tab
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();

      if (e.shiftKey) {
        if (colIndex > 0) {
          focusT2Cell(rowIndex, t2Cols[colIndex - 1]);
        } else if (rowIndex > 0) {
          focusT2Cell(rowIndex - 1, t2Cols[t2Cols.length - 1]);
        }
      } else {
        if (colIndex < t2Cols.length - 1) {
          focusT2Cell(rowIndex, t2Cols[colIndex + 1]);
        } else if (rowIndex < formData.items.length - 1) {
          focusT2Cell(rowIndex + 1, t2Cols[0]);
        }
      }
      return;
    }

    // Arrows
    if (!e.shiftKey) {
      if (e.key === 'ArrowUp') {
        if (rowIndex > 0) {
          e.preventDefault();
          setSelectedT2Cells(null);
          focusT2Cell(rowIndex - 1, colKey);
        }
      } else if (e.key === 'ArrowDown') {
        if (rowIndex < formData.items.length - 1) {
          e.preventDefault();
          setSelectedT2Cells(null);
          focusT2Cell(rowIndex + 1, colKey);
        }
      } else if (e.key === 'ArrowLeft') {
        if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
          e.preventDefault();
          setSelectedT2Cells(null);
          if (colIndex > 0) {
            focusT2Cell(rowIndex, t2Cols[colIndex - 1]);
          } else if (rowIndex > 0) {
            focusT2Cell(rowIndex - 1, t2Cols[t2Cols.length - 1]);
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (inputEl.selectionStart === inputEl.value.length) {
          e.preventDefault();
          setSelectedT2Cells(null);
          if (colIndex < t2Cols.length - 1) {
            focusT2Cell(rowIndex, t2Cols[colIndex + 1]);
          } else if (rowIndex < formData.items.length - 1) {
            focusT2Cell(rowIndex + 1, t2Cols[0]);
          }
        }
      }
    }
  };

  const handleT2Paste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const hasDelimiters = text.includes('\t') || text.includes('\n');
    if (!hasDelimiters && !selectedT2Cells) {
      return;
    }
    e.preventDefault();
    const t2Cols = getT2Columns(formData);
    const startColIndex = t2Cols.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));

    const updatedMech = [...(formData.mechanicalData || [])];

    if (selectedT2Cells) {
      const minR = Math.min(selectedT2Cells.startRow, selectedT2Cells.endRow);
      const maxR = Math.max(selectedT2Cells.startRow, selectedT2Cells.endRow);
      const minC = Math.min(selectedT2Cells.startCol, selectedT2Cells.endCol);
      const maxC = Math.max(selectedT2Cells.startCol, selectedT2Cells.endCol);

      if (!hasDelimiters) {
        const val = text.trim();
        for (let r = minR; r <= maxR; r++) {
          if (!updatedMech[r]) {
            updatedMech[r] = { itemNo: (r + 1).toString(), heatNo: formData.items[r]?.heatNo || '' };
          }
          for (let c = minC; c <= maxC; c++) {
            const colName = t2Cols[c];
            if (colName) {
              (updatedMech[r] as any)[colName] = val;
            }
          }
        }
      } else {
        rows.forEach((rowStr, rOffset) => {
          const targetR = minR + rOffset;
          if (targetR <= maxR || maxR === minR) {
            while (updatedMech.length <= targetR) {
              const rIdx = updatedMech.length;
              updatedMech.push({ itemNo: (rIdx + 1).toString(), heatNo: formData.items[rIdx]?.heatNo || '' });
            }
            const cellVals = rowStr.split('\t');
            cellVals.forEach((val, cOffset) => {
              const targetC = minC + cOffset;
              if (targetC < t2Cols.length) {
                const colName = t2Cols[targetC];
                (updatedMech[targetR] as any)[colName] = val.trim();
              }
            });
          }
        });
      }
    } else {
      rows.forEach((rowStr, rOffset) => {
        const targetR = startRow + rOffset;
        while (updatedMech.length <= targetR) {
          const rIdx = updatedMech.length;
          updatedMech.push({ itemNo: (rIdx + 1).toString(), heatNo: formData.items[rIdx]?.heatNo || '' });
        }
        const cellVals = rowStr.split('\t');
        cellVals.forEach((val, cOffset) => {
          const targetC = startColIndex + cOffset;
          if (targetC < t2Cols.length) {
            const colName = t2Cols[targetC];
            (updatedMech[targetR] as any)[colName] = val.trim();
          }
        });
      });
    }

    setFormData(prev => ({ ...prev, mechanicalData: updatedMech }));
  };

  // Handle PO, Invoice, Work Order change with auto SAMPLE certificate generation
  const handlePoOrInvoiceChange = (field: 'customerPoNum' | 'invoiceNum' | 'workOrderNum', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const hadSample = isSampleCert(prev);
      const hasSample = isSampleCert(updated);

      // Auto-generate sample certificate number without overwriting
      if (hasSample && (!prev.certNo || (!prev.certNo.toUpperCase().includes('SMP') && !prev.certNo.toUpperCase().includes('SAMPLE')))) {
        const sampleCertNo = `SMP/2026/${Math.floor(100000 + Math.random() * 900000)}`;
        updated.certNo = sampleCertNo;
        updated.issueNo = sampleCertNo;
        updated.id = 'qc-sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      }
      return updated;
    });
  };

  // Save Certificate (Ensures SAMPLE certificates never overwrite previous records)
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    let certNoToSave = formData.certNo?.trim() || formData.issueNo?.trim();
    if (!certNoToSave) {
      const prefix = isSampleCert(formData) ? 'SMP/2026/' : 'MFI/2026/';
      certNoToSave = prefix + Math.floor(100000 + Math.random() * 900000);
    }

    const isSample = isSampleCert(formData);
    const existingIndex = records.findIndex(r => r.id === formData.id && !formData.id.startsWith('qc-new') && !formData.id.startsWith('qc-sample-'));
    let updatedRecords: QcReportRecord[];

    if (existingIndex >= 0 && !isSample) {
      // Existing non-sample record update
      updatedRecords = [...records];
      updatedRecords[existingIndex] = {
        ...formData,
        certNo: certNoToSave,
        issueNo: certNoToSave
      };
    } else {
      // New record or Sample MTC -> generate unique ID so previous records are NEVER overwritten
      const newId = 'qc-' + (isSample ? 'sample-' : '') + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      const newRec: QcReportRecord = {
        ...formData,
        id: newId,
        certNo: certNoToSave,
        issueNo: certNoToSave,
        createdAt: new Date().toISOString()
      };
      updatedRecords = [newRec, ...records];
      setFormData(newRec);
    }

    setRecords(updatedRecords);
    alert(`Certificate Record (${certNoToSave}) saved successfully!`);
    setActiveSubTab('records');
  };

  // Edit existing Record
  const handleEditRecord = (rec: QcReportRecord) => {
    setFormData(rec);
    setSelectedTemplate(rec.templateType);
    setActiveSubTab('create');
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this certificate record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // Helper to parse date strings into comparable timestamp
  const parseDateToComparable = (dStr: string, isEndOfDay: boolean = false): number | null => {
    if (!dStr || typeof dStr !== 'string') return null;
    const s = dStr.trim();
    if (!s) return null;
    
    // Try YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (isoMatch) {
      const yr = parseInt(isoMatch[1], 10);
      const mo = parseInt(isoMatch[2], 10) - 1;
      const dy = parseInt(isoMatch[3], 10);
      return isEndOfDay ? new Date(yr, mo, dy, 23, 59, 59, 999).getTime() : new Date(yr, mo, dy, 0, 0, 0, 0).getTime();
    }
    
    // Try DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const dy = parseInt(dmyMatch[1], 10);
      const mo = parseInt(dmyMatch[2], 10) - 1;
      const yr = parseInt(dmyMatch[3], 10);
      return isEndOfDay ? new Date(yr, mo, dy, 23, 59, 59, 999).getTime() : new Date(yr, mo, dy, 0, 0, 0, 0).getTime();
    }

    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return parsed;
    return null;
  };

  // Filter lists for Archive
  const customerList = useMemo(() => Array.from(new Set(records.map(r => r.customerName))), [records]);
  const poList = useMemo(() => Array.from(new Set(records.map(r => r.customerPoNum).filter(Boolean))), [records]);
  const standardMtcCount = useMemo(() => records.filter(r => !isSampleCert(r)).length, [records]);
  const sampleMtcCount = useMemo(() => records.filter(r => isSampleCert(r)).length, [records]);

  // Grouped records for redesigned MTC Archive
  const groupedArchiveRecords = useMemo(() => {
    // 1. Filter raw records by category, customer, template, date range, and search query
    const eligibleRecords = records.filter(r => {
      // Category filter
      if (filterCategory === 'MATERIAL_TEST_REPORT' && isSampleCert(r)) return false;
      if (filterCategory === 'SAMPLE_MTC' && !isSampleCert(r)) return false;

      if (filterCustomer !== 'ALL' && r.customerName !== filterCustomer) return false;
      if (filterPo !== 'ALL' && (r.customerPoNum !== filterPo && r.poNumber !== filterPo)) return false;
      if (filterTemplate !== 'ALL' && r.templateType !== filterTemplate) return false;

      // Date Filter (Single date search or range)
      if (filterDate.trim()) {
        const targetTime = parseDateToComparable(filterDate);
        const recTime = parseDateToComparable(r.date || '');
        if (targetTime !== null && recTime !== null) {
          if (recTime !== targetTime) return false;
        } else if (!(r.date || '').toLowerCase().includes(filterDate.trim().toLowerCase())) {
          return false;
        }
      }

      // Date Range Filter (From Date to To Date)
      if (filterDateFrom.trim()) {
        const fromTime = parseDateToComparable(filterDateFrom);
        const recTime = parseDateToComparable(r.date || '');
        if (fromTime !== null && recTime !== null) {
          if (recTime < fromTime) return false;
        } else if (!(r.date || '').toLowerCase().includes(filterDateFrom.trim().toLowerCase())) {
          return false;
        }
      }

      if (filterDateTo.trim()) {
        const toTime = parseDateToComparable(filterDateTo, true);
        const recTime = parseDateToComparable(r.date || '');
        if (toTime !== null && recTime !== null) {
          if (recTime > toTime) return false;
        } else if (!(r.date || '').toLowerCase().includes(filterDateTo.trim().toLowerCase())) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCert = (r.certNo || '').toLowerCase().includes(q) || (r.issueNo || '').toLowerCase().includes(q);
        const matchesCust = (r.customerName || '').toLowerCase().includes(q);
        const matchesPo = (r.customerPoNum || r.poNumber || '').toLowerCase().includes(q);
        const matchesInv = (r.invoiceNum || '').toLowerCase().includes(q);
        const matchesWo = (r.workOrderNum || '').toLowerCase().includes(q);
        const matchesDate = (r.date || '').toLowerCase().includes(q);
        const matchesHeat = (r.items || []).some(i => (i.heatNo || '').toLowerCase().includes(q));
        if (!matchesCert && !matchesCust && !matchesPo && !matchesInv && !matchesWo && !matchesDate && !matchesHeat) return false;
      }
      return true;
    });

    const n = eligibleRecords.length;
    if (n === 0) return [];

    // 2. Disjoint set / union-find clustering by non-empty matching Invoice No, WO Number, or PO Number
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (i: number): number => {
      if (parent[i] === i) return i;
      parent[i] = find(parent[i]);
      return parent[i];
    };
    const union = (i: number, j: number) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
      }
    };

    const invMap = new Map<string, number>();
    const woMap = new Map<string, number>();
    const poMap = new Map<string, number>();

    eligibleRecords.forEach((rec, idx) => {
      // For SAMPLE certificates, NEVER combine/merge them in the archive list. Keep them separate row by row.
      if (isSampleCert(rec)) {
        return;
      }

      const inv = (rec.invoiceNum || '').trim().toLowerCase();
      const wo = (rec.workOrderNum || '').trim().toLowerCase();
      const po = (rec.customerPoNum || rec.poNumber || '').trim().toLowerCase();

      // Generic tokens that shouldn't cluster disparate records
      const isGeneric = (val: string) => !val || val === 'sample' || val === 'smp' || val === 'na' || val === 'n/a' || val === '-' || val === '—' || val === 'nil' || val === 'none';

      if (inv && !isGeneric(inv)) {
        if (invMap.has(inv)) union(idx, invMap.get(inv)!);
        else invMap.set(inv, idx);
      }
      if (wo && !isGeneric(wo)) {
        if (woMap.has(wo)) union(idx, woMap.get(wo)!);
        else woMap.set(wo, idx);
      }
      if (po && !isGeneric(po)) {
        if (poMap.has(po)) union(idx, poMap.get(po)!);
        else poMap.set(po, idx);
      }
    });

    // 3. Aggregate into groups
    const groupsMap = new Map<number, GroupedArchiveItem>();

    eligibleRecords.forEach((rec, idx) => {
      const root = find(idx);
      const inv = (rec.invoiceNum || '').trim();
      const wo = (rec.workOrderNum || '').trim();
      const po = (rec.customerPoNum || rec.poNumber || '').trim();
      const cust = (rec.customerName || '').trim();

      if (!groupsMap.has(root)) {
        groupsMap.set(root, {
          groupKey: `grp_${root}_${rec.id}`,
          invoiceNo: inv || '—',
          workOrderNo: wo || '—',
          poNo: po || '—',
          customerName: cust || '—',
          records: [],
          dates: []
        });
      }

      const grp = groupsMap.get(root)!;
      grp.records.push(rec);

      if (rec.date && !grp.dates.includes(rec.date)) {
        grp.dates.push(rec.date);
      }
      if ((!grp.customerName || grp.customerName === '—') && cust) {
        grp.customerName = cust;
      }
      if ((!grp.invoiceNo || grp.invoiceNo === '—') && inv) {
        grp.invoiceNo = inv;
      }
      if ((!grp.workOrderNo || grp.workOrderNo === '—') && wo) {
        grp.workOrderNo = wo;
      }
      if ((!grp.poNo || grp.poNo === '—') && po) {
        grp.poNo = po;
      }
    });

    return Array.from(groupsMap.values());
  }, [records, filterCategory, filterCustomer, filterPo, filterTemplate, filterDate, filterDateFrom, filterDateTo, searchQuery]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterCustomer !== 'ALL' && r.customerName !== filterCustomer) return false;
      if (filterPo !== 'ALL' && r.customerPoNum !== filterPo) return false;
      if (filterTemplate !== 'ALL' && r.templateType !== filterTemplate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCert = r.certNo.toLowerCase().includes(q);
        const matchesCust = r.customerName.toLowerCase().includes(q);
        const matchesPo = r.customerPoNum.toLowerCase().includes(q);
        const matchesHeat = r.items.some(i => i.heatNo.toLowerCase().includes(q));
        if (!matchesCert && !matchesCust && !matchesPo && !matchesHeat) return false;
      }
      return true;
    });
  }, [records, filterCustomer, filterPo, filterTemplate, searchQuery]);
  // Set document title dynamically when print modal is opened so standard print dialog uses INVOICE NO-MTC-COMPANY NAME
  useEffect(() => {
    if (printModalRecord) {
      const prevTitle = document.title;
      document.title = getMtcPdfFileName(printModalRecord);
      return () => {
        document.title = prevTitle;
      };
    }
  }, [printModalRecord]);

  // Native Print Trigger - Horizontal Multi-Page PDF Output
  const triggerNativePrint = () => {
    if (!printModalRecord) return;
    const printContent = document.getElementById('printable-qc-cert');
    if (!printContent) return;

    const isLandscape = printModalRecord.templateType === 'MTC_T1';
    const isMtc2 = printModalRecord.templateType === 'MTC_T2' || printModalRecord.templateType === 'MTC_T3';
    const pdfFileName = getMtcPdfFileName(printModalRecord);

    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pdfFileName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            *, *:before, *:after {
              box-sizing: border-box !important;
            }
            @page { 
              size: A4 ${isLandscape ? 'landscape' : 'portrait'}; 
              margin: ${isLandscape ? '4mm' : '4mm'} !important; 
            }
            @media print {
              html, body { 
                margin: 0 !important; 
                padding: 0 !important; 
                width: 100% !important;
                background: #fff !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
                box-sizing: border-box !important;
              }
              .no-print { display: none !important; }
              .only-print { display: inline !important; }

              .cert-page {
                page-break-after: always !important;
                break-after: page !important;
                width: 100% !important;
                max-width: 100% !important;
                height: ${isLandscape ? '196mm' : '278mm'} !important;
                min-height: ${isLandscape ? '196mm' : '278mm'} !important;
                max-height: ${isLandscape ? '196mm' : '280mm'} !important;
                margin: 0 auto !important;
                padding: ${isLandscape ? '3mm' : '4mm 4mm'} !important;
                border: 2px solid #000000 !important;
                box-sizing: border-box !important;
                background: #fff !important;
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                position: relative !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                overflow: hidden !important;
              }
              .cert-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }

              .keep-together {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              table {
                page-break-inside: auto !important;
                width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                box-sizing: border-box !important;
              }
              tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              th, td {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                box-sizing: border-box !important;
              }
            }
            @media screen {
              .only-print { display: none !important; }
              body {
                background: #334155;
                padding: 20px;
              }
              .cert-page {
                margin: 0 auto 24px auto;
                border: 2px solid black;
                padding: ${isLandscape ? '12px' : '16px'};
                background: #fff;
                box-shadow: none;
                width: ${isLandscape ? '287mm' : '200mm'};
                min-height: ${isLandscape ? '196mm' : '280mm'};
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
            }
            body { 
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; 
              margin: 0; 
              padding: 0; 
              color: #000; 
              background: #fff; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            
            .watermark-sample {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              pointer-events: none !important;
              z-index: 9999 !important;
            }
            .watermark-sample > div {
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;
              font-weight: 900 !important;
              font-size: 38pt !important;
              color: rgba(100, 116, 139, 0.22) !important;
              border: 3px solid rgba(100, 116, 139, 0.22) !important;
              border-radius: 16px !important;
              padding: 8px 28px !important;
              letter-spacing: 0.14em !important;
              text-transform: uppercase !important;
              transform: rotate(-30deg) !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            table th, table td, span, div, p {
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;
            }
            .mtc-wrapper {
              width: 100%;
              max-width: ${isLandscape ? '287mm' : '200mm'};
              margin: 0 auto;
              box-sizing: border-box;
            }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 2px; }
            th, td { word-wrap: break-word; overflow-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="mtc-wrapper">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `;
    printHtml(docHtml, pdfFileName);
  };

  const renderCertHeader = (record: QcReportRecord, pageNum: number, totalPages: number) => (
    <div className="border-b border-black pb-1 mb-1 flex items-center justify-between gap-3 bg-white">
      {/* LEFT: COMPANY LOGO & DETAILS */}
      <div className="flex items-center gap-3 shrink-0 max-w-[46%]">
        {record.companyLogoUrl && (
          <img src={record.companyLogoUrl} alt="Company Logo" className="h-14 max-w-[160px] object-contain shrink-0" />
        )}
        <div>
          <div className="font-black text-[12.5px] uppercase tracking-tight text-black leading-tight">
            {record.companyName || activeCompany.name}
            {(record.companyTagline || activeCompany.headerTagline) && (
              <div className="text-[8px] font-bold text-slate-700 uppercase tracking-tight mt-0.5">{record.companyTagline || activeCompany.headerTagline}</div>
            )}
          </div>
          <div className="text-[7.5px] font-medium text-slate-800 leading-tight mt-0.5">
            <div>{record.companyAddress || activeCompany.address || 'New Industrial Area, Ajman, UAE, Tel: +971 6 525 0526'}</div>
            {record.showCompanyContact && (
              <div className="font-semibold text-slate-900 mt-0.5">{record.companyContact || `${activeCompany.email || 'sales@marinefasteners.co'} | ${activeCompany.website || 'www.marinefasteners.co'}`}</div>
            )}
          </div>
        </div>
      </div>

      {/* CENTER: ISO CERTIFICATION LOGO & TEXT */}
      {(activeCompany.showIso !== false && (isMarineFastenersCompany(activeCompany) || activeCompany.showIso)) ? (
        <div className="flex-1 flex justify-center items-center px-2 min-w-0">
          <div className="bg-transparent flex flex-col items-center">
            <img 
              src={record.isoLogoUrl || DEFAULT_ISO_LOGO_URL} 
              alt="ISO Certification Logos" 
              className="h-10 sm:h-11 max-w-[320px] sm:max-w-[360px] object-contain" 
            />
            <div className="flex items-center justify-center gap-2 mt-0.5 text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none">
              <span>{getCompanyIsoText(activeCompany) || 'ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center px-2 min-w-0">
          <div className="text-center font-bold text-[10px] text-slate-700 uppercase tracking-wider">
            {activeCompany.subtitle || 'QUALITY ASSURANCE & TESTING DIVISION'}
          </div>
        </div>
      )}

      {/* RIGHT: MATERIAL TEST CERTIFICATE / QC REPORT TITLE */}
      <div className="text-right shrink-0">
        <div className="font-black text-[13.5px] uppercase tracking-tight text-black underline leading-none mb-0.5">
          {record.templateType === 'MTC_T1' || record.templateType === 'MTC_T2' || record.templateType === 'MTC_T3' 
            ? 'MATERIAL TEST CERTIFICATE'
            : record.templateType === 'MTC_T4' 
              ? 'QUALITY INSPECTION CERTIFICATE'
              : record.templateType === 'HDG_REPORT'
                ? 'HOT DIP GALVANIZING TEST REPORT'
                : record.templateType === 'GI_REPORT'
                  ? 'ELECTRO GALVANIZING TEST REPORT'
                  : record.templateType === 'NICKEL_REPORT'
                    ? 'NICKEL PLATING TEST REPORT'
                    : record.templateType === 'YELLOW_PASSIVATED_REPORT'
                      ? 'YELLOW PASSIVATED TEST REPORT'
                      : record.templateType === 'CADMIUM_REPORT'
                        ? 'CADMIUM PLATING TEST REPORT'
                        : record.templateType === 'PTFE_REPORT'
                          ? 'PTFE COATING TEST REPORT'
                          : record.templateType === 'FLUROPOLYMER_REPORT'
                            ? 'FLUROPOLYMER COATING TEST REPORT'
                            : record.templateType === 'COC_REPORT'
                              ? 'CERTIFICATE OF CONFORMITY'
                              : record.templateType === 'TEFLON_REPORT'
                                ? 'TEFLON COATING TEST REPORT'
                                : record.templateType === 'NEOPRENE_SLEEVE_REPORT'
                                  ? 'NEOPRENE SLEEVE TEST REPORT'
                                  : record.templateType === 'WARRANTY_CERTIFICATE'
                                    ? 'WARRANTY CERTIFICATE'
                                    : record.templateType === 'COO_CERTIFICATE'
                                      ? 'COUNTRY OF ORIGIN CERTIFICATE'
                                      : record.templateType === 'COMPLIANCE_LETTER'
                                        ? 'DECLARATION OF COMPLIANCE'
                                        : record.templateType === 'INSPECTION_REPORT'
                                          ? 'FINAL INSPECTION REPORT'
                                          : 'MATERIAL TEST CERTIFICATE'}
        </div>
        <div className="font-black text-[8.5px] uppercase tracking-tight text-black">
          CERTIFIED TO BS EN 10204, 3.1
        </div>
        <div className="font-black text-[9px] uppercase tracking-tight text-black mt-0.5">
          Page No : <span className="font-bold">{pageNum} OF {totalPages}</span>
        </div>
      </div>
    </div>
  );

  const renderCertMetadata = (record: QcReportRecord) => {
    if (record.templateType === 'MTC_T2' || record.templateType === 'MTC_T3') {
      return (
        <table className="w-full border-collapse border border-black text-[8px] sm:text-[8.5px] font-sans table-fixed mb-1 bg-white">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[14%] p-1 font-bold border-r border-black bg-white text-left px-1.5">Certificate No:</td>
              <td className="w-[26%] p-1 font-black border-r border-black text-left px-1.5 uppercase text-[9px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.issueNo || record.certNo}</td>
              <td className="w-[16%] p-1 font-bold border-r border-black bg-white text-left px-1.5">Work Order Number:</td>
              <td className="w-[18%] p-1 font-bold border-r border-black text-left px-1.5 text-[9px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.workOrderNum || '—'}</td>
              <td className="w-[11%] p-1 font-bold border-r border-black bg-white text-left px-1.5">Customer:</td>
              <td className="w-[25%] p-1 font-black text-left px-1.5 uppercase text-[9px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.customerName}</td>
            </tr>
            <tr>
              <td className="p-1 font-bold border-r border-black bg-white text-left px-1.5">Date:</td>
              <td className="p-1 font-black border-r border-black text-left px-1.5 text-[9px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.date}</td>
              <td className="p-1 font-bold border-r border-black bg-white text-left px-1.5">Invoice Number:</td>
              <td className="p-1 font-bold border-r border-black text-left px-1.5 text-[9px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.invoiceNum || '—'}</td>
              <td className="p-1 font-bold border-r border-black bg-white text-left px-1.5">PO Number:</td>
              <td className="p-1 font-bold text-left px-1.5 text-[9px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.customerPoNum || '—'}</td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <div className="w-full border border-black text-[8px] font-sans mb-1 text-black bg-white">
        <div className="flex border-b border-black">
          <div className="w-[12%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5 shrink-0">Certificate No:</div>
          <div className="w-[38%] p-0.5 font-black border-r border-black text-left px-1.5 text-[9.5px] uppercase shrink-0 break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.issueNo || record.certNo}</div>
          <div className="w-[12%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5 shrink-0">Date:</div>
          <div className="w-[13%] p-0.5 font-black border-r border-black text-left px-1.5 text-[9.5px] shrink-0 break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.date}</div>
          <div className="w-[11%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5 shrink-0">PO Number:</div>
          <div className="w-[14%] p-0.5 font-black text-left px-1.5 text-[9.5px] shrink-0 break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.customerPoNum || '—'}</div>
        </div>
        <div className="flex">
          <div className="w-[12%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5 shrink-0">Customer:</div>
          <div className="w-[38%] p-0.5 font-black border-r border-black text-left px-1.5 uppercase text-[9.5px] shrink-0 break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.customerName}</div>
          <div className="w-[12%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5 shrink-0">Invoice No:</div>
          <div className="w-[13%] p-0.5 font-black border-r border-black text-left px-1.5 text-[9.5px] shrink-0 break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.invoiceNum || '—'}</div>
          <div className="w-[11%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5 shrink-0">Work Order No:</div>
          <div className="w-[14%] p-0.5 font-black text-left px-1.5 text-[9.5px] shrink-0 break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{record.workOrderNum || '—'}</div>
        </div>
      </div>
    );
  };

  // Helper function to calculate active chemical fields and proportional print/sheet table column widths
  const getActiveChemFields = (
    rec: Partial<QcReportRecord>,
    activeRows?: any[]
  ) => {
    const checkHasData = (field: string) => {
      const list = activeRows || rec.chemicalData || rec.items || [];
      return list.some((r: any) => {
        const val = r.chem?.[field] ?? r[field] ?? '';
        if (val === undefined || val === null) return false;
        const str = String(val).trim();
        return str !== '' && str !== '-' && str !== '—';
      });
    };

    const showPb = rec.showColPb !== undefined ? rec.showColPb : checkHasData('pb');
    const showZn = rec.showColZn !== undefined ? rec.showColZn : checkHasData('zn');
    const showFe = rec.showColFe !== undefined ? rec.showColFe : checkHasData('fe');
    const showSn = rec.showColSn !== undefined ? rec.showColSn : checkHasData('sn');
    const showImpurity = Boolean(rec.showImpurity);
    const showOther = Boolean(rec.showOther);

    const overrides = rec.chemHeaderOverrides || {};
    const baseFields = [
      { k: 'c', label: overrides.c || '%C' },
      { k: 'si', label: overrides.si || '%Si' },
      { k: 'mn', label: overrides.mn || '%Mn' },
      { k: 'p', label: overrides.p || '%P' },
      { k: 's', label: overrides.s || '%S' },
      { k: 'cr', label: overrides.cr || '%Cr' },
      { k: 'ni', label: overrides.ni || '%Ni' },
      { k: 'mo', label: overrides.mo || '%Mo' },
      { k: 'al', label: overrides.al || '%Al' },
      { k: 'cu', label: overrides.cu || '%Cu' },
      { k: 'v', label: overrides.v || '%V' },
      { k: 'n', label: overrides.n || '%N' },
      { k: 'ti', label: overrides.ti || '%Ti' },
      { k: 'b', label: overrides.b || '%B' },
    ];

    const dynamicFields: Array<{ k: string; label: string }> = [];
    if (showPb) dynamicFields.push({ k: 'pb', label: overrides.pb || '%Pb' });
    if (showZn) dynamicFields.push({ k: 'zn', label: overrides.zn || '%Zn' });
    if (showFe) dynamicFields.push({ k: 'fe', label: overrides.fe || '%Fe' });
    if (showSn) dynamicFields.push({ k: 'sn', label: overrides.sn || '%Sn' });
    if (showImpurity) dynamicFields.push({ k: 'totalImpurity', label: overrides.totalImpurity || 'IMPURITY' });
    if (showOther) dynamicFields.push({ k: 'other', label: overrides.other || 'OTHER' });

    const allFields = [...baseFields, ...dynamicFields];
    const count = allFields.length;

    // Dynamically adjust Description, Size, Specification, and Chemical columns based on active chemical count
    let chemColPct = '4.20%';
    let colWidths = {
      srNo: '2.5%',
      description: '8.5%',
      size: '6.0%',
      specification: '7.8%',
      finish: '4.6%',
      unit: '3.0%',
      qty: '3.0%',
      heatNo: '5.8%',
    };

    if (count <= 14) {
      // Pb, Zn, Fe, Sn UNCHECKED: description, size, spec width smaller; chemical composition box width more so 0.0156 (5 digits) fits in one line
      chemColPct = '4.20%';
      colWidths = {
        srNo: '2.5%',
        description: '8.5%',
        size: '6.0%',
        specification: '7.8%',
        finish: '4.6%',
        unit: '3.0%',
        qty: '3.0%',
        heatNo: '5.8%',
      };
    } else if (count === 15) {
      chemColPct = `${(57.0 / 15).toFixed(2)}%`;
      colWidths = {
        srNo: '2.4%',
        description: '9.0%',
        size: '6.5%',
        specification: '8.2%',
        finish: '4.8%',
        unit: '3.1%',
        qty: '3.1%',
        heatNo: '5.9%',
      };
    } else if (count === 16) {
      chemColPct = `${(54.8 / 16).toFixed(2)}%`;
      colWidths = {
        srNo: '2.3%',
        description: '9.8%',
        size: '7.0%',
        specification: '8.8%',
        finish: '4.9%',
        unit: '3.2%',
        qty: '3.2%',
        heatNo: '6.0%',
      };
    } else if (count === 17) {
      chemColPct = `${(52.4 / 17).toFixed(2)}%`;
      colWidths = {
        srNo: '2.2%',
        description: '10.6%',
        size: '7.5%',
        specification: '9.4%',
        finish: '5.0%',
        unit: '3.2%',
        qty: '3.2%',
        heatNo: '6.5%',
      };
    } else {
      // count >= 18 (e.g. Pb, Zn, Fe, Sn CHECKED): chemical composition box width smaller and description, size, spec little more for balanced layout
      chemColPct = `${(50.0 / count).toFixed(2)}%`;
      colWidths = {
        srNo: '2.0%',
        description: '11.5%',
        size: '8.0%',
        specification: '10.0%',
        finish: '5.2%',
        unit: '3.3%',
        qty: '3.3%',
        heatNo: '6.7%',
      };
    }

    return {
      showPb,
      showZn,
      showFe,
      showSn,
      showImpurity,
      showOther,
      fields: allFields,
      count,
      chemColPct,
      colWidths,
    };
  };

  const renderCertDescriptionTable = (record: QcReportRecord, rows: any[], isContinued: boolean = false) => {
    if (record.templateType === 'MTC_T3') {
      return (
        <div className="space-y-0.5 mb-1">
          <div className="bg-white text-black border border-black px-2 py-0.5">
            <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*PRODUCT DESCRIPTION.{isContinued ? ' (CONTINUED)' : ''}</span>
          </div>

          <table className="w-full border-collapse border border-black text-[8.5px] sm:text-[9px] table-fixed bg-white">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-center text-[8.5px]">
                <th className="border border-black p-1 w-[4%]">Item</th>
                <th className="border border-black p-1 w-[30%]">Description</th>
                <th className="border border-black p-1 w-[11%]">Size</th>
                <th className="border border-black p-1 w-[18%]">Specification / Standard</th>
                <th className="border border-black p-1 w-[8%]">Qty</th>
                <th className="border border-black p-1 w-[8%]">Finish</th>
                <th className="border border-black p-1 w-[11%]">Marking</th>
                <th className="border border-black p-1 w-[10%]">Heat No</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((it, idx) => {
                const markImg = it.markingImage || it.m?.markingImage || record.items?.[it.idx]?.markingImage || '';
                const markTxt = it.marking || it.m?.marking || record.items?.[it.idx]?.marking || '';
                return (
                  <tr key={it.idx ?? idx} className="border-b border-black text-[8.5px] sm:text-[9px]">
                    <td className="border border-black p-0.5 text-center font-bold">{it.itemNo || (idx + 1)}</td>
                    <td className="border border-black p-0.5 font-semibold text-slate-900 uppercase leading-tight px-1 break-words">{it.description || '—'}</td>
                    <td className="border border-black p-0.5 font-medium text-center">{it.size || '—'}</td>
                    <td className="border border-black p-0.5 font-medium text-center uppercase break-words">{it.material || it.standard || '—'}</td>
                    <td className="border border-black p-0.5 font-medium text-center">{it.qty || '—'}</td>
                    <td className="border border-black p-0.5 font-medium text-center uppercase">{it.finish || '—'}</td>
                    <td className="border border-black p-0.5 text-center align-middle">
                      <div className="flex items-center justify-start gap-1 w-full whitespace-nowrap px-0.5 overflow-hidden">
                        {markImg && (
                          <img src={markImg} alt="Marking" className="max-h-4 max-w-[28px] object-contain border border-slate-200 rounded p-0.5 bg-white shrink-0" />
                        )}
                        <span className="font-medium text-left text-[8px] uppercase truncate">{markTxt || ''}</span>
                      </div>
                    </td>
                    <td className="border border-black p-0.5 font-bold text-center text-amber-950 uppercase">{it.heatNo || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="border border-black mb-1">
        <div className="bg-white text-black border-b border-black px-2 py-0.5 font-black text-[9.5px] uppercase tracking-wide flex items-center justify-between">
          <span>*PRODUCT DESCRIPTION.{isContinued ? ' (CONTINUED)' : ''}</span>
        </div>
        <table className="w-full text-center border-collapse text-[8.5px] sm:text-[9px] font-sans table-fixed bg-white">
          <thead>
            <tr className="bg-white border-b border-black font-bold text-[8.5px] sm:text-[9px] leading-tight text-black text-center">
              <th className="border-r border-black p-1 py-1.5 w-[4%] align-middle">S/L NO.</th>
              <th className="border-r border-black p-1 py-1.5 w-[16%] text-left px-1.5 align-middle">DESCRIPTION</th>
              <th className="border-r border-black p-1 py-1.5 w-[13%] align-middle">SIZE</th>
              <th className="border-r border-black p-1 py-1.5 w-[19%] align-middle">STANDARD / SPECIFICATION</th>
              <th className="border-r border-black p-1 py-1.5 w-[6.5%] align-middle">QTY</th>
              <th className="border-r border-black p-1 py-1.5 w-[8.5%] align-middle">FINISH</th>
              <th className="border-r border-black p-1 py-1.5 w-[12%] align-middle">MARKING</th>
              <th className="p-1 py-1.5 w-[21%] align-middle">HEAT NUMBER</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((rowItem) => {
              const markImg = rowItem.markingImage || rowItem.m?.markingImage || record.items?.[rowItem.idx]?.markingImage || '';
              const markTxt = rowItem.marking || rowItem.m?.marking || record.items?.[rowItem.idx]?.marking || '';
              return (
                <tr key={rowItem.idx} className="border-t border-black text-[8.5px] sm:text-[9px] leading-tight">
                  <td className="border-r border-black p-1 py-1.5 text-center font-bold align-middle">{rowItem.itemNo}</td>
                  <td className="border-r border-black p-1 py-1.5 text-left uppercase px-1.5 font-semibold break-words whitespace-normal leading-tight [overflow-wrap:anywhere] align-middle">{rowItem.description}</td>
                  <td className="border-r border-black p-1 py-1.5 text-center font-medium break-words whitespace-normal leading-tight [overflow-wrap:anywhere] align-middle">{rowItem.size}</td>
                  <td className="border-r border-black p-1 py-1.5 text-center uppercase font-medium break-words whitespace-normal leading-tight [overflow-wrap:anywhere] align-middle">{rowItem.material || rowItem.standard || ''}</td>
                  <td className="border-r border-black p-1 py-1.5 text-center font-medium align-middle">{rowItem.qty}</td>
                  <td className="border-r border-black p-1 py-1.5 text-center uppercase font-medium align-middle">{rowItem.finish || ''}</td>
                  <td className="border-r border-black p-1 py-1 text-center uppercase font-medium align-middle">
                    <div className="flex items-center justify-center gap-1 max-w-full overflow-hidden whitespace-nowrap px-0.5">
                      {markImg && (
                        <img 
                          src={markImg} 
                          alt="Mark" 
                          className="max-h-3 sm:max-h-3.5 max-w-[24px] object-contain inline-block shrink-0 align-middle" 
                        />
                      )}
                      {markTxt && (
                        <span className="text-[8px] sm:text-[8.5px] font-bold uppercase leading-none truncate align-middle">{markTxt}</span>
                      )}
                      {!markImg && !markTxt && (
                        <span></span>
                      )}
                    </div>
                  </td>
                  <td className="p-1 py-1.5 text-center font-bold uppercase align-middle text-[8.5px] sm:text-[9px] whitespace-nowrap overflow-hidden text-ellipsis">{rowItem.heatNo || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCertChemTable = (record: QcReportRecord, rows: any[], isContinued: boolean = false) => {
    if (record.templateType === 'MTC_T3') {
      const chemOverrides = record.chemHeaderOverrides || {};
      const activeChemCols: Array<{ k: keyof QcChemicalItem; label: string }> = [
        { k: 'c', label: chemOverrides.c || '%C' },
        { k: 'si', label: chemOverrides.si || '%Si' },
        { k: 'mn', label: chemOverrides.mn || '%Mn' },
        { k: 'p', label: chemOverrides.p || '%P' },
        { k: 's', label: chemOverrides.s || '%S' },
        { k: 'cr', label: chemOverrides.cr || '%Cr' },
        { k: 'ni', label: chemOverrides.ni || '%Ni' },
        { k: 'mo', label: chemOverrides.mo || '%Mo' },
        { k: 'cu', label: chemOverrides.cu || '%Cu' },
        { k: 'v', label: chemOverrides.v || '%V' },
        { k: 'n', label: chemOverrides.n || '%N' },
        { k: 'al', label: chemOverrides.al || '%Al' },
        { k: 'ti', label: chemOverrides.ti || '%Ti' },
        { k: 'b', label: chemOverrides.b || '%B' }
      ];
      if (record.showColPb !== undefined ? record.showColPb : false) activeChemCols.push({ k: 'pb', label: chemOverrides.pb || '%Pb' });
      if (record.showColZn !== undefined ? record.showColZn : false) activeChemCols.push({ k: 'zn', label: chemOverrides.zn || '%Zn' });
      if (record.showColFe !== undefined ? record.showColFe : false) activeChemCols.push({ k: 'fe', label: chemOverrides.fe || '%Fe' });
      if (record.showColSn !== undefined ? record.showColSn : false) activeChemCols.push({ k: 'sn', label: chemOverrides.sn || '%Sn' });
      if (record.showImpurity) activeChemCols.push({ k: 'totalImpurity', label: chemOverrides.totalImpurity || 'Impurity' });
      if (record.showOther) activeChemCols.push({ k: 'other', label: chemOverrides.other || 'Other' });

      const chemColWidth = `${(80.0 / activeChemCols.length).toFixed(3)}%`;

      return (
        <div className="space-y-0.5 mb-1">
          <div className="bg-white text-black border border-black px-2 py-0.5">
            <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*CHEMICAL ANALYSIS.{isContinued ? ' (CONTINUED)' : ''}</span>
          </div>

          <table className="w-full border-collapse border border-black text-[7.5px] sm:text-[8px] table-fixed bg-white text-center">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-black">
                <th rowSpan={4} className="border border-black p-0.5 w-[3.5%] align-middle text-center font-bold">Item</th>
                <th rowSpan={4} className="border border-black p-0.5 w-[11.5%] align-middle text-center font-bold">Heat No</th>
                <th className="border border-black p-0.5 w-[5%] bg-slate-100 text-center font-bold text-[7.5px] sm:text-[8px]">SPEC</th>
                {activeChemCols.map(col => {
                  const currentLabel = record.chemHeaderOverrides?.[col.k] ?? col.label;
                  return (
                    <th key={col.k} className="border border-black p-0.5 font-bold text-center break-words whitespace-normal leading-tight" style={{ width: chemColWidth }}>
                      {currentLabel}
                    </th>
                  );
                })}
              </tr>
              {/* MIN ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7.5px] tracking-wider bg-slate-100/70">
                  MIN
                </th>
                {activeChemCols.map(col => {
                  const minVal = record.chemSpecMin?.[col.k as any];
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal text-center text-[7.5px] text-slate-800 break-words">
                      {minVal ? formatChemVal(minVal) : '—'}
                    </th>
                  );
                })}
              </tr>
              {/* MAX ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7.5px] tracking-wider bg-slate-100/70">
                  MAX
                </th>
                {activeChemCols.map(col => {
                  const maxVal = record.chemSpecMax?.[col.k as any];
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal text-center text-[7.5px] text-slate-800 break-words">
                      {maxVal ? formatChemVal(maxVal) : '—'}
                    </th>
                  );
                })}
              </tr>
              {/* UNIT ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7.5px] tracking-wider bg-slate-100/70">
                  (%)
                </th>
                {activeChemCols.map(col => {
                  const unitVal = record.chemUnits?.[col.k as any] ?? '(%)';
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal text-center text-[7.5px] text-slate-800">
                      {unitVal || '(%)'}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((rowItem, idx) => {
                const chem = rowItem.chem || rowItem;
                return (
                  <tr key={rowItem.idx ?? idx} className="border-b border-black">
                    <td className="border border-black p-0.5 font-bold text-center">{rowItem.itemNo || (idx + 1)}</td>
                    <td className="border border-black p-0.5 font-bold text-amber-950 uppercase text-center break-words">{rowItem.heatNo || chem.heatNo || '—'}</td>
                    <td className="border border-black p-0.5 font-bold text-center text-[7px] text-slate-600 bg-slate-50/50">
                      ACTUAL
                    </td>
                    {activeChemCols.map(col => (
                      <td key={col.k} className="border border-black p-0.5 font-medium text-center text-[7.5px] break-words">
                        {formatChemVal((chem as any)[col.k]) || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    const chemConfig = getActiveChemFields(record, rows);
    const { colWidths, fields, chemColPct, count } = chemConfig;

    if (record.templateType === 'MTC_T2') {
      const chemElementWidth = `${(85.0 / fields.length).toFixed(3)}%`;
      const hasChemMin = record.chemSpecMin && Object.values(record.chemSpecMin).some(v => v && v !== '' && v !== '-');
      const hasChemMax = record.chemSpecMax && Object.values(record.chemSpecMax).some(v => v && v !== '' && v !== '-');
      const showChemMinMax = hasChemMin || hasChemMax;

      return (
        <div className="border border-black mb-1">
          <div className="bg-white text-black border-b border-black px-2 py-0.5 font-black text-[9.5px] uppercase tracking-wide flex items-center justify-between">
            <span>*CHEMICAL ANALYSIS.{isContinued ? ' (CONTINUED)' : ''}</span>
          </div>
          <table className="w-full text-center border-collapse text-[9.5px] sm:text-[10px] font-sans table-fixed bg-white">
            <thead>
              <tr className="bg-white border-b border-black font-bold text-[8.5px] sm:text-[9px] leading-tight text-black text-center">
                <th className="border-r border-black p-1 py-1.5 w-[15%] align-middle">{record.chemHeaderOverrides?.heatNo || 'Heat No'}</th>
                {fields.map((f, fIdx) => (
                  <th key={f.k} className={`${fIdx < fields.length - 1 ? 'border-r border-black' : ''} p-1 py-1.5 align-middle`} style={{ width: chemElementWidth }}>
                    {record.chemHeaderOverrides?.[f.k] || f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {showChemMinMax && (
                <>
                  <tr className="border-b border-black text-[9px] sm:text-[9.5px] font-bold bg-slate-50/50">
                    <td className="border-r border-black p-1 py-1 font-black text-center text-slate-800">MIN</td>
                    {fields.map((f, fIdx) => (
                      <td key={f.k} className={`${fIdx < fields.length - 1 ? 'border-r border-black' : ''} p-1 py-1 text-center font-bold`}>
                        {record.chemSpecMin?.[f.k as any] || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-black text-[9px] sm:text-[9.5px] font-bold bg-slate-50/50">
                    <td className="border-r border-black p-1 py-1 font-black text-center text-slate-800">MAX</td>
                    {fields.map((f, fIdx) => (
                      <td key={f.k} className={`${fIdx < fields.length - 1 ? 'border-r border-black' : ''} p-1 py-1 text-center font-bold`}>
                        {record.chemSpecMax?.[f.k as any] || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-black text-[9px] sm:text-[9.5px] font-bold bg-slate-50/50">
                    <td className="border-r border-black p-1 py-1 font-black text-center text-slate-800">(%)</td>
                    {fields.map((f, fIdx) => (
                      <td key={f.k} className={`${fIdx < fields.length - 1 ? 'border-r border-black' : ''} p-1 py-1 text-center font-bold text-slate-800`}>
                        {record.chemUnits?.[f.k as any] || '(%)'}
                      </td>
                    ))}
                  </tr>
                </>
              )}
              {rows.map((rowItem) => {
                const chem = rowItem.chem || {};
                return (
                  <tr key={rowItem.idx} className="border-t border-black text-[9.5px] sm:text-[10px] leading-tight">
                    <td className="border-r border-black p-1 py-2 font-bold text-center uppercase align-middle">{rowItem.heatNo || chem.heatNo || ''}</td>
                    {fields.map((f, fIdx) => {
                      const val = chem[f.k];
                      const formatted = f.k === 'other' ? (val || '') : formatChemVal(val);
                      return (
                        <td key={f.k} className={`${fIdx < fields.length - 1 ? 'border-r border-black' : ''} p-1 py-2 text-center font-medium align-middle`}>
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <table className="w-full text-center border-collapse text-[8px] sm:text-[8.5px] border border-black font-sans mb-1 table-fixed bg-white">
        <thead>
          <tr className="bg-white border-b border-black font-bold text-[8px] sm:text-[8.5px] leading-tight text-black">
            <th className="border border-black p-1 py-1.5 align-middle text-center" style={{ width: colWidths.srNo }} rowSpan={2}>Sr. No.</th>
            <th className="border border-black p-1 py-1.5 text-left px-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.description }} rowSpan={2}>Description</th>
            <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.size }} rowSpan={2}>Size</th>
            <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.specification }} rowSpan={2}>Specification</th>
            <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.finish }} rowSpan={2}>Finish</th>
            <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.unit }} rowSpan={2}>Unit</th>
            <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.qty }} rowSpan={2}>Qty</th>
            <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ width: colWidths.heatNo }} rowSpan={2}>Heat No.</th>
            <th className="border border-black p-1 text-[11px] sm:text-[12px] tracking-wider bg-white text-black font-black py-1 align-middle uppercase" colSpan={count}>
              CHEMICAL COMPOSITION (%)
            </th>
          </tr>
          <tr className="bg-white border-b border-black font-bold text-[8px] sm:text-[8.5px] leading-tight text-black">
            {fields.map((f) => (
              <th key={f.k} className="border border-black p-0.5 py-1 text-center align-middle" style={{ width: chemColPct, textTransform: 'none' }}>
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rowItem) => {
            const chem = rowItem.chem || {};
            return (
              <tr key={rowItem.idx} className="border-b border-black font-sans text-[8px] sm:text-[8.5px]">
                <td className="border border-black p-0.5 font-normal text-black align-middle">{rowItem.itemNo}</td>
                <td className="border border-black p-0.5 text-left font-normal text-black text-[8.5px] px-1 uppercase break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.description}</td>
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.size}</td>
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] uppercase break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.material}</td>
                <td className="border border-black p-0.5 font-normal text-black uppercase break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.finish}</td>
                <td className="border border-black p-0.5 font-normal text-black uppercase break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.unit || ''}</td>
                <td className="border border-black p-0.5 font-normal text-black break-words whitespace-normal leading-tight align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.qty}</td>
                <td className="border border-black p-0.5 font-sans font-normal text-[8.5px] text-black break-words whitespace-normal leading-tight px-1 align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{rowItem.heatNo}</td>
                
                {fields.map((f) => {
                  const val = chem[f.k];
                  const formatted = f.k === 'other' ? (val || '') : formatChemVal(val);
                  return (
                    <td key={f.k} className="border border-black p-0.5 text-center font-sans font-normal text-black text-[8.5px]">
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const toTitleCaseMechHeader = (text?: string, defaultVal: string = ''): string => {
    const val = (text && text.trim().length > 0) ? text.trim() : defaultVal;
    if (!val) return '';
    const upperMap: Record<string, string> = {
      'SR. NO.': 'Sr. No.',
      'SR. NO': 'Sr. No.',
      'HEAT NO': 'Heat No',
      'HEAT NO.': 'Heat No',
      'TENSILE STRENGTH UTS–KSI': 'Tensile Strength UTS–Ksi',
      'TENSILE STRENGTH UTS-KSI': 'Tensile Strength UTS–Ksi',
      'TENSILE STRENGTH': 'Tensile Strength',
      'YIELD STRENGTH YS–KSI': 'Yield Strength YS–Ksi',
      'YIELD STRENGTH YS-KSI': 'Yield Strength YS–Ksi',
      'YIELD STRENGTH YS–': 'Yield Strength Ys–',
      'YIELD STRENGTH YS-': 'Yield Strength Ys–',
      'YIELD STRENGTH': 'Yield Strength',
      'ELONGATION EL–(%)': 'Elongation El–(%)',
      'ELONGATION EL-(%)': 'Elongation El–(%)',
      'ELONGATION (%)': 'Elongation (%)',
      'RED. OF AREA RA–(%)': 'Red. of Area Ra–(%)',
      'RED. OF AREA RA-(%)': 'Red. of Area Ra–(%)',
      'PROOFLOAD LBF': 'Proofload Lbf',
      'STRESS UNDER PROOFLOAD MPA': 'Stress Under Proofload Mpa',
      'HEAT TREATMENT': 'Heat Treatment',
      'HARDNESS': 'Hardness',
      'HARDNESS AFTER 24 HR TREATMENT AT 540°C': 'Hardness After 24 Hr Treatment at 540°C',
      'QUENCHING TEMP. °C': 'Quenching Temp. °C',
      'HOLDING TIME': 'Holding Time',
      'QUENCHING MEDIUM': 'Quenching Medium',
      'TEMPERING TEMP. °C': 'Tempering Temp. °C',
      'STRESS RELIEVED °C': 'Stress Relieved °C',
      'TEMPER': 'Temper',
      'IMPACT IN "J"': 'Impact in "J"',
      'AVERAGE IMPACT IN "J"': 'Average Impact in "J"',
      'IMPACT TEST TEMP °C': 'Impact Test Temp °C',
      'PREN': 'Pren',
      'MARKING': 'Marking'
    };

    const upperKey = val.toUpperCase().trim();
    if (upperMap[upperKey]) {
      return upperMap[upperKey];
    }
    if (upperMap[val]) {
      return upperMap[val];
    }
    if (val === val.toUpperCase() && val.length > 2 && /[A-Z]/.test(val)) {
      return val
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return val;
  };

  const renderCertMechTable = (record: QcReportRecord, rows: any[], isContinued: boolean = false) => {
    if (record.templateType === 'MTC_T3') {
      const defaultMechLabels: Record<string, string> = {
        tsMpa: 'TENSILE STRENGTH (UTS)',
        ysMpa: 'YIELD STRENGTH (YS)',
        elPct: 'ELONGATION (EL)',
        raPct: 'REDUCTION OF AREA (RA)',
        proofLoadLbf: 'PROOFLOAD',
        hardness: 'HARDNESS',
        stressUnderProofloadMpa: 'STRESS UNDER PROOFLOAD',
        heatTreatment: 'HEAT TREATMENT',
        hardness24Hr540C: 'HARDNESS AFTER TREATMENT',
        quenchingTempC: 'QUENCHING TEMP',
        quenchingHoldingTime: 'HOLDING TIME (QUENCH)',
        quenchingMedium: 'QUENCHING MEDIUM',
        temperingTempC: 'TEMPER TEMP',
        temperingHoldingTime: 'HOLDING TIME (TEMPER)',
        stressRelievedC: 'STRESS RELIEVED',
        temperingResult: 'TEMPER',
        impactJ: 'IMPACT IN J',
        avgImpactJ: 'AVERAGE IMPACT IN J',
        impactTempC: 'IMPACT TEST TEMP',
        pren: 'PREN'
      };

      const getMechColLabel = (key: string, customOrLegacyLabel?: string) => {
        if (record.mechHeaderOverrides?.[key]) {
          return record.mechHeaderOverrides[key];
        }
        if (customOrLegacyLabel && !['Y.S (Mpa)', 'T.S (Mpa)', 'EL (%)', 'R.A (%)', 'Elongation El-(%)', 'Hardness', 'Proof Load', 'Proofload Lbf'].includes(customOrLegacyLabel)) {
          return customOrLegacyLabel;
        }
        return defaultMechLabels[key] || customOrLegacyLabel || key.toUpperCase();
      };

      const activeMechCols: Array<{ k: string; label: string }> = [
        { k: 'tsMpa', label: getMechColLabel('tsMpa', record.mechUtsHeaderTitle) },
        { k: 'ysMpa', label: getMechColLabel('ysMpa', record.mechYsHeaderTitle) },
        { k: 'elPct', label: getMechColLabel('elPct', 'ELONGATION (EL)') },
        { k: 'raPct', label: getMechColLabel('raPct', 'REDUCTION OF AREA (RA)') },
      ];
      activeMechCols.push({ k: 'proofLoadLbf', label: getMechColLabel('proofLoadLbf', record.mechProofloadHeaderTitle) });
      activeMechCols.push({ k: 'hardness', label: getMechColLabel('hardness', record.mechHardnessHeaderTitle) });
      if (record.showColStressUnderProofload) activeMechCols.push({ k: 'stressUnderProofloadMpa', label: getMechColLabel('stressUnderProofloadMpa') });
      if (record.showColHeatTreatment ?? false) activeMechCols.push({ k: 'heatTreatment', label: getMechColLabel('heatTreatment') });
      if (record.showColHardness24Hr ?? false) activeMechCols.push({ k: 'hardness24Hr540C', label: getMechColLabel('hardness24Hr540C') });
      if (record.showColQuenchingTemp ?? false) activeMechCols.push({ k: 'quenchingTempC', label: getMechColLabel('quenchingTempC') });
      if (record.showColQuenchingTime ?? false) activeMechCols.push({ k: 'quenchingHoldingTime', label: getMechColLabel('quenchingHoldingTime') });
      if (record.showColQuenchingMedium ?? false) activeMechCols.push({ k: 'quenchingMedium', label: getMechColLabel('quenchingMedium') });
      if (record.showColTemperingTemp ?? false) activeMechCols.push({ k: 'temperingTempC', label: getMechColLabel('temperingTempC') });
      if (record.showColTemperingTime) activeMechCols.push({ k: 'temperingHoldingTime', label: getMechColLabel('temperingHoldingTime') });
      if (record.showColStressRelieved ?? false) activeMechCols.push({ k: 'stressRelievedC', label: getMechColLabel('stressRelievedC') });
      if (record.showColTemperingResult) activeMechCols.push({ k: 'temperingResult', label: getMechColLabel('temperingResult') });
      if (record.showColImpactJ ?? false) activeMechCols.push({ k: 'impactJ', label: getMechColLabel('impactJ') });
      if (record.showColAvgImpactJ ?? false) activeMechCols.push({ k: 'avgImpactJ', label: getMechColLabel('avgImpactJ') });
      if (record.showColImpactTemp ?? false) activeMechCols.push({ k: 'impactTempC', label: getMechColLabel('impactTempC') });
      if (record.showColPren ?? false) activeMechCols.push({ k: 'pren', label: getMechColLabel('pren') });

      const mechColWidth = `${(80.0 / activeMechCols.length).toFixed(3)}%`;

      return (
        <div className="space-y-0.5 mb-1">
          <div className="bg-white text-black border border-black px-2 py-0.5">
            <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*MECHANICAL PROPERTIES.{isContinued ? ' (CONTINUED)' : ''}</span>
          </div>

          <table className="w-full border-collapse border border-black text-[7px] sm:text-[7.5px] table-fixed bg-white text-center">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-black">
                <th rowSpan={3} className="border border-black p-0.5 w-[3.5%] align-middle text-center font-bold">Item</th>
                <th rowSpan={3} className="border border-black p-0.5 w-[11.5%] align-middle text-center font-bold">Heat No</th>
                <th className="border border-black p-0.5 w-[5%] bg-slate-100 text-center font-bold text-[7px] sm:text-[7.5px] align-middle">SPEC</th>
                {activeMechCols.map(col => {
                  const currentLabel = record.mechHeaderOverrides?.[col.k] ?? col.label;
                  return (
                    <th key={col.k} className="border border-black p-0.5 font-bold text-center align-middle whitespace-normal break-words leading-tight text-[6.5px] sm:text-[7px] [overflow-wrap:anywhere]" style={{ width: mechColWidth }}>
                      {currentLabel}
                    </th>
                  );
                })}
              </tr>
              {/* MIN ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7px] tracking-wider bg-slate-100/70 align-middle">
                  MIN
                </th>
                {activeMechCols.map(col => {
                  const minVal = record.mechSpecMin?.[col.k] ?? getMechSpecValue(record.mechSpecMin, col.k);
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal align-middle text-center text-[7px] text-slate-800 break-words [overflow-wrap:anywhere]">
                      {minVal ? formatNumericVal(minVal) : '—'}
                    </th>
                  );
                })}
              </tr>
              {/* MAX ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7px] tracking-wider bg-slate-100/70 align-middle">
                  MAX
                </th>
                {activeMechCols.map(col => {
                  const maxVal = record.mechSpecMax?.[col.k] ?? getMechSpecValue(record.mechSpecMax, col.k);
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal align-middle text-center text-[7px] text-slate-800 break-words [overflow-wrap:anywhere]">
                      {maxVal ? formatNumericVal(maxVal) : '—'}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((rowItem, idx) => {
                const mech = rowItem.m || rowItem;
                return (
                  <tr key={rowItem.idx ?? idx} className="border-b border-black">
                    <td className="border border-black p-0.5 font-bold text-center align-middle">{rowItem.itemNo || (idx + 1)}</td>
                    <td className="border border-black p-0.5 font-bold text-amber-950 uppercase align-middle text-center break-words">{rowItem.heatNo || mech.heatNo || '—'}</td>
                    <td className="border border-black p-0.5 font-bold text-center text-[7px] text-slate-600 bg-slate-50/50 align-middle">
                      ACTUAL
                    </td>
                    {activeMechCols.map(col => {
                      const cellVal = (mech as any)[col.k] !== undefined && (mech as any)[col.k] !== null && String((mech as any)[col.k]).trim() !== ''
                        ? (mech as any)[col.k]
                        : getMechPropValue(mech, col.k);
                      return (
                        <td key={col.k} className="border border-black p-0.5 align-middle font-medium text-center text-[7px] sm:text-[7.5px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">
                          {cellVal ? formatNumericVal(cellVal) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (record.templateType === 'MTC_T2') {
      const baseMechCols: Array<{ k: string; label: string }> = [
        { k: 'heatNo', label: 'Heat No.' },
        { k: 'tsMpa', label: 'Tensile Strength (UTS)' },
        { k: 'ysMpa', label: 'Yield Strength (YS)' },
        { k: 'elPct', label: 'Elongation (EL)' },
        { k: 'raPct', label: 'Reduction of Area (RA)' },
        { k: 'proofLoadLbf', label: 'Proofload' },
      ];

      const extraMechCols: Array<{ k: string; label: string }> = [];
      if (record.showColStressUnderProofload) extraMechCols.push({ k: 'stressUnderProofloadMpa', label: 'Stress Under Proofload' });
      if (record.showColHeatTreatment ?? true) extraMechCols.push({ k: 'heatTreatment', label: 'Heat Treatment' });
      if (record.showColHardness24Hr ?? true) extraMechCols.push({ k: 'hardness24Hr540C', label: 'Hardness (24Hr)' });
      if (record.showColQuenchingTemp ?? true) extraMechCols.push({ k: 'quenchingTempC', label: 'Quenching Temp' });
      if (record.showColQuenchingTime ?? true) extraMechCols.push({ k: 'quenchingHoldingTime', label: 'Quenching Time' });
      if (record.showColQuenchingMedium ?? true) extraMechCols.push({ k: 'quenchingMedium', label: 'Quenching Medium' });
      if (record.showColTemperingTemp ?? true) extraMechCols.push({ k: 'temperingTempC', label: 'Tempering Temp' });
      if (record.showColTemperingTime) extraMechCols.push({ k: 'temperingHoldingTime', label: 'Tempering Time' });
      if (record.showColStressRelieved ?? true) extraMechCols.push({ k: 'stressRelievedC', label: 'Stress Relieved' });
      if (record.showColTemperingResult) extraMechCols.push({ k: 'temperingResult', label: 'Temper Result' });
      if (record.showColImpactJ ?? true) extraMechCols.push({ k: 'impactJ', label: 'Impact in J' });
      if (record.showColAvgImpactJ ?? true) extraMechCols.push({ k: 'avgImpactJ', label: 'Avg Impact in J' });
      if (record.showColImpactTemp ?? true) extraMechCols.push({ k: 'impactTempC', label: 'Impact Temp' });
      if (record.showColPren) extraMechCols.push({ k: 'pren', label: 'PREN' });

      const fullMechCols = [...baseMechCols, ...extraMechCols, { k: 'hardness', label: 'Hardness' }];
      const otherMechCount = fullMechCols.length - 1;
      const otherMechColWidth = `${(85.0 / Math.max(1, otherMechCount)).toFixed(3)}%`;

      const activeMechCols = fullMechCols.map(c => ({
        ...c,
        width: c.k === 'heatNo' ? '15%' : otherMechColWidth
      }));

      const hasMechMin = record.mechSpecMin && Object.values(record.mechSpecMin).some(v => v && v !== '' && v !== '-');
      const hasMechMax = record.mechSpecMax && Object.values(record.mechSpecMax).some(v => v && v !== '' && v !== '-');
      const showMechMinMax = hasMechMin || hasMechMax;

      return (
        <div className="border border-black mb-1">
          <div className="bg-white text-black border-b border-black px-2 py-0.5 font-black text-[9.5px] uppercase tracking-wide flex items-center justify-between">
            <span>*MECHANICAL PROPERTIES.{isContinued ? ' (CONTINUED)' : ''}</span>
          </div>
          <table className="w-full text-center border-collapse text-[9.5px] sm:text-[10px] font-sans table-fixed bg-white">
            <thead>
              <tr className="bg-white border-b border-black font-bold text-[8.5px] sm:text-[9px] leading-tight text-black text-center">
                {activeMechCols.map((c, cIdx) => {
                  const headerText = record.mechHeaderOverrides?.[c.k] || c.label;
                  return (
                    <th key={c.k} className={`${cIdx < activeMechCols.length - 1 ? 'border-r border-black' : ''} p-1 py-1 text-center align-middle whitespace-normal leading-tight font-bold text-[8.5px] sm:text-[9px] break-words`} style={{ width: c.width }}>
                      <div className="leading-tight">{headerText}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {showMechMinMax && (
                <>
                  <tr className="border-b border-black text-[9px] sm:text-[9.5px] font-bold bg-slate-50/50">
                    {activeMechCols.map((col, colIdx) => {
                      if (col.k === 'heatNo') {
                        return (
                          <td key={col.k} className="border-r border-black p-1 py-1 font-black text-center text-slate-800">
                            MIN
                          </td>
                        );
                      }
                      return (
                        <td key={col.k} className={`${colIdx < activeMechCols.length - 1 ? 'border-r border-black' : ''} p-1 py-1 text-center font-bold`}>
                          {record.mechSpecMin?.[col.k as any] || '—'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-black text-[9px] sm:text-[9.5px] font-bold bg-slate-50/50">
                    {activeMechCols.map((col, colIdx) => {
                      if (col.k === 'heatNo') {
                        return (
                          <td key={col.k} className="border-r border-black p-1 py-1 font-black text-center text-slate-800">
                            MAX
                          </td>
                        );
                      }
                      return (
                        <td key={col.k} className={`${colIdx < activeMechCols.length - 1 ? 'border-r border-black' : ''} p-1 py-1 text-center font-bold`}>
                          {record.mechSpecMax?.[col.k as any] || '—'}
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}
              {rows.map((rowItem) => {
                const m = rowItem.m || {};
                return (
                  <tr key={rowItem.idx} className="border-t border-black text-[9.5px] sm:text-[10px] leading-tight">
                    {activeMechCols.map((col, colIdx) => {
                      let val: any = '';
                      if (col.k === 'heatNo') val = rowItem.heatNo || m.heatNo || '';
                      else if (col.k === 'tsMpa') val = formatNumericVal(m.tsMpa || m.utsKsi);
                      else if (col.k === 'ysMpa') val = formatNumericVal(m.ysMpa || m.ysKsi);
                      else if (col.k === 'elPct') val = formatNumericVal(m.elPct);
                      else if (col.k === 'raPct') val = formatNumericVal(m.raPct);
                      else if (col.k === 'hardness') val = formatNumericVal(m.hardness || m.hardnessHbw);
                      else if (col.k === 'proofLoadLbf') val = formatNumericVal(m.proofLoadLbf);
                      else if (col.k === 'temperingTempC') val = formatNumericVal(m.temperingTempC);
                      else if (col.k === 'stressUnderProofloadMpa') val = formatNumericVal(m.stressUnderProofloadMpa);
                      else if (col.k === 'hardness24Hr540C') val = formatNumericVal(m.hardness24Hr540C);
                      else if (col.k === 'quenchingTempC') val = formatNumericVal(m.quenchingTempC);
                      else if (col.k === 'quenchingHoldingTime') val = formatNumericVal(m.quenchingHoldingTime);
                      else if (col.k === 'quenchingMedium') val = m.quenchingMedium || '';
                      else if (col.k === 'temperingHoldingTime') val = formatNumericVal(m.temperingHoldingTime);
                      else if (col.k === 'stressRelievedC') val = formatNumericVal(m.stressRelievedC);
                      else if (col.k === 'temperingResult') val = m.temperingResult || '';
                      else if (col.k === 'impactJ') val = formatNumericVal(m.impactJ);
                      else if (col.k === 'avgImpactJ') val = formatNumericVal(m.avgImpactJ);
                      else if (col.k === 'impactTempC') val = formatNumericVal(m.impactTempC);
                      else if (col.k === 'pren') val = formatNumericVal(m.pren);
                      else if (col.k === 'heatTreatment') val = m.heatTreatment || '';
                      else val = (m as any)[col.k] !== undefined ? (m as any)[col.k] : '';

                      return (
                        <td key={col.k} className={`${colIdx < activeMechCols.length - 1 ? 'border-r border-black' : ''} p-1 py-2 text-center font-medium ${col.k === 'heatNo' ? 'font-bold' : ''} align-middle`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="my-0.5">
      <table className="w-full text-center border-collapse text-[7px] sm:text-[7.5px] border border-black font-sans mb-1 table-fixed bg-white">
        <thead>
          <tr className="bg-white border-b border-black">
            <th className="border border-black p-1 text-[11px] sm:text-[12px] font-black tracking-wider bg-white text-black py-1 text-center uppercase" colSpan={
              9
              + ((record.showColHeatTreatment ?? true) ? 1 : 0)
              + ((record.showColHardness24Hr ?? true) ? 1 : 0)
              + ((record.showColQuenchingTemp ?? true) ? 1 : 0)
              + ((record.showColQuenchingTime ?? true) ? 1 : 0)
              + ((record.showColQuenchingMedium ?? true) ? 1 : 0)
              + ((record.showColTemperingTemp ?? false) ? 1 : 0)
              + ((record.showColTemperingTime ?? false) ? 1 : 0)
              + ((record.showColStressRelieved ?? true) ? 1 : 0)
              + ((record.showColTemperingResult ?? false) ? 1 : 0)
              + ((record.showColImpactJ ?? true) ? 1 : 0)
              + ((record.showColAvgImpactJ ?? true) ? 1 : 0)
              + ((record.showColImpactTemp ?? true) ? 1 : 0)
              + ((record.showColPren ?? false) ? 1 : 0)
              + ((record.showColStressUnderProofload ?? false) ? 1 : 0)
            }>
              MECHANICAL PROPERTIES
            </th>
          </tr>
          <tr className="bg-white border-b border-black font-bold text-[8px] sm:text-[8.5px] leading-tight text-black">
            <th className="border border-black p-1 py-1.5 w-[2.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelSrNo, 'Sr. No.')}</th>
            <th className="border border-black p-1 py-1.5 w-[8.5%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelHeatNo, 'Heat No')}</th>
            <th className="border border-black p-1 py-1.5 w-[6.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelTensileStrength, 'Tensile Strength UTS–Ksi')}</th>
            <th className="border border-black p-1 py-1.5 w-[6.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelYieldStrength, 'Yield Strength YS–Ksi')}</th>
            <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelElongation, 'Elongation El–(%)')}</th>
            <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelReductionArea, 'Red. of Area Ra–(%)')}</th>
            <th className="border border-black p-1 py-1.5 w-[5.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelProofload, 'Proofload Lbf')}</th>
            {(record.showColStressUnderProofload ?? false) && (
              <th className="border border-black p-1 py-1.5 w-[6.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelStressUnderProofload, 'Stress Under Proofload Mpa')}</th>
            )}
            {(record.showColHeatTreatment ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle bg-white whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelHeatTreatment, 'Heat Treatment')}</th>
            )}
            <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelHardness, 'Hardness')}</th>
            {(record.showColHardness24Hr ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[7.5%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelHardness24Hr, 'Hardness After 24 Hr Treatment at 540°C')}</th>
            )}
            {(record.showColQuenchingTemp ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelQuenchingTemp, 'Quenching Temp. °C')}</th>
            )}
            {(record.showColQuenchingTime ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelQuenchingTime, 'Holding Time')}</th>
            )}
            {(record.showColQuenchingMedium ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle bg-white whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelQuenchingMedium, 'Quenching Medium')}</th>
            )}
            {(record.showColTemperingTemp ?? false) && (
              <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelTemperingTemp, 'Tempering Temp. °C')}</th>
            )}
            {(record.showColTemperingTime ?? false) && (
              <th className="border border-black p-1 py-1.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelTemperingTime, 'Holding Time')}</th>
            )}
            {(record.showColStressRelieved ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelStressRelieved, 'Stress Relieved °C')}</th>
            )}
            {(record.showColTemperingResult ?? false) && (
              <th className="border border-black p-1 py-1.5 w-[3.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelTemperingResult, 'Temper')}</th>
            )}
            {(record.showColImpactJ ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[3.8%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelImpactJ, 'Impact in "J"')}</th>
            )}
            {(record.showColAvgImpactJ ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelAvgImpactJ, 'Average Impact in "J"')}</th>
            )}
            {(record.showColImpactTemp ?? true) && (
              <th className="border border-black p-1 py-1.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelImpactTemp, 'Impact Test Temp °C')}</th>
            )}
            {(record.showColPren ?? false) && (
              <th className="border border-black p-1 py-1.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight font-bold text-[8px] sm:text-[8.5px]">{toTitleCaseMechHeader(record.labelPren, 'Pren')}</th>
            )}
            <th className="border border-black p-1 py-1.5 w-[9.5%] text-center align-middle whitespace-normal font-bold break-words leading-tight text-[8px] sm:text-[8.5px]">
              {toTitleCaseMechHeader(record.labelMarking, 'Marking')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rowItem) => {
            const m = rowItem.m || {};
            return (
              <tr key={rowItem.idx} className="border-b border-black font-sans text-[8px] sm:text-[8.5px]">
                <td className="border border-black p-0.5 font-normal text-black align-middle">{rowItem.itemNo}</td>
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] break-words whitespace-normal leading-tight px-1 align-middle [overflow-wrap:anywhere]" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{m.heatNo}</td>
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] align-middle">{formatNumericVal(m.utsKsi || m.tsMpa)}</td>
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] align-middle">{formatNumericVal(m.ysKsi || m.ysMpa)}</td>
                <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.elPct)}</td>
                <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.raPct)}</td>
                <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.proofLoadLbf)}</td>
                {(record.showColStressUnderProofload ?? false) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.stressUnderProofloadMpa)}</td>
                )}
                {(record.showColHeatTreatment ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black text-[8.5px] uppercase align-middle">{m.heatTreatment || ''}</td>
                )}
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] align-middle">{formatNumericVal(m.hardness || m.hardnessHbw)}</td>
                {(record.showColHardness24Hr ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.hardness24Hr540C)}</td>
                )}
                {(record.showColQuenchingTemp ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.quenchingTempC)}</td>
                )}
                {(record.showColQuenchingTime ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{m.quenchingHoldingTime || ''}</td>
                )}
                {(record.showColQuenchingMedium ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black text-[8.5px] uppercase align-middle">{m.quenchingMedium || ''}</td>
                )}
                {(record.showColTemperingTemp ?? false) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.temperingTempC)}</td>
                )}
                {(record.showColTemperingTime ?? false) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{m.temperingHoldingTime || ''}</td>
                )}
                {(record.showColStressRelieved ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.stressRelievedC)}</td>
                )}
                {(record.showColTemperingResult ?? false) && (
                  <td className="border border-black p-0.5 font-normal text-black text-[8.5px] align-middle">{m.temperingResult || ''}</td>
                )}
                {(record.showColImpactJ ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.impactJ)}</td>
                )}
                {(record.showColAvgImpactJ ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.avgImpactJ)}</td>
                )}
                {(record.showColImpactTemp ?? true) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.impactTempC)}</td>
                )}
                {(record.showColPren ?? false) && (
                  <td className="border border-black p-0.5 font-normal text-black align-middle">{formatNumericVal(m.pren)}</td>
                )}
                <td className="border border-black p-0.5 font-normal text-black text-[8.5px] uppercase text-center align-middle">
                  <div className="inline-flex items-center justify-center gap-1">
                    {(m.markingImage || record.markingImageUrl) && (
                      <img src={m.markingImage || record.markingImageUrl} alt="Marking" className="max-h-[10px] max-w-[18px] object-contain shrink-0 inline-block align-middle" />
                    )}
                    <span className="break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">{m.marking || ''}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

  const renderCertMacroEtch = (record: QcReportRecord) => (
    <div className="mb-1 border border-black p-1 bg-white keep-together" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div className="font-black text-[9px] tracking-wider mb-0.5 text-black">Macro Etch</div>
      <table className="w-full border-collapse border border-black text-[7.5px] text-center table-fixed bg-white">
        <thead>
          <tr className="bg-white border-b border-black font-black text-[8px]">
            <th className="border border-black p-0.5 w-[15%]">Division</th>
            <th className="border border-black p-0.5 w-[22%]">Surface Condition</th>
            <th className="border border-black p-0.5 w-[22%]">Random Condition</th>
            <th className="border border-black p-0.5 w-[22%]">Center Segregation</th>
            <th className="border border-black p-0.5 w-[19%]"></th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border border-black p-0.5 font-bold bg-white">Spec.</td>
            <td className="border border-black p-0.5 font-bold">{record.macroEtchSpecSurface || 'S2'}</td>
            <td className="border border-black p-0.5 font-bold">{record.macroEtchSpecRandom || 'R2'}</td>
            <td className="border border-black p-0.5 font-bold">{record.macroEtchSpecCenter || 'C3'}</td>
            <td className="border border-black p-0.5 font-semibold"></td>
          </tr>
          <tr>
            <td className="border border-black p-0.5 font-bold bg-white">Results</td>
            <td className="border border-black p-0.5 font-black text-[8.5px]">{record.macroEtchResultSurface || 'S2'}</td>
            <td className="border border-black p-0.5 font-black text-[8.5px]">{record.macroEtchResultRandom || 'R2'}</td>
            <td className="border border-black p-0.5 font-black text-[8.5px]">{record.macroEtchResultCenter || 'C3'}</td>
            <td className="border border-black p-0.5 font-bold"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderCertHeatTreatment = (record: QcReportRecord) => (
    <div className="border border-black mb-1 text-[9.5px] bg-white keep-together" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div className="font-black p-1 px-1.5 border-b border-black text-[10px] text-black bg-white">
        *Heat Treatment
      </div>
      <div className="p-1.5 space-y-1 font-sans leading-tight text-[9.5px]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[10px] text-black">•</span>
          <span className="w-52 font-bold text-slate-900 text-[9.5px]">Carbide Solution treated :</span>
          <span className="font-semibold text-[9.5px]">{record.heatTreatmentCarbide || 'Was treated by raw material factory'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[10px] text-black">•</span>
          <span className="w-52 font-bold text-slate-900 text-[9.5px]">Strain Hardened :</span>
          <span className="font-semibold text-[9.5px]">{record.heatTreatmentStrain || 'Was treated'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[10px] text-black">•</span>
          <span className="w-52 font-bold text-slate-900 text-[9.5px]">Quenching :</span>
          <span className="font-semibold text-[9.5px]">{record.heatTreatmentQuenching || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[10px] text-black">•</span>
          <span className="w-52 font-bold text-slate-900 text-[9.5px]">Tempering :</span>
          <span className="font-semibold text-[9.5px]">{record.heatTreatmentTempering || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  const renderCertTechInfo = (record: QcReportRecord) => (
    <table className="w-full border border-black mb-1 text-[9.5px] bg-white border-collapse font-sans keep-together" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <thead>
        <tr className="bg-white border-b border-black">
          <th className="font-black p-1 px-1.5 text-[10px] text-black text-left font-sans">
            Additional Technical Information:-
          </th>
        </tr>
      </thead>
      <tbody className="divide-y-0 font-sans text-black">
        {(record.showTechInfoVisual !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoVisualLabel || 'Visual Inspection'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoVisual || 'Found to be free from crack, flaws, sharp edges and other defects.'}</span>
              </div>
            </td>
          </tr>
        )}
        {(record.showTechInfoThread !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoThreadLabel || 'Thread acceptability'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoThread || 'has been inspected as per ASME B1.1 CL 2A and found ok.'}</span>
              </div>
            </td>
          </tr>
        )}
        {(record.showTechInfoGauge !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoGaugeLabel || 'Gauge Fit'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoGauge || 'Inspection using 6g GO gauge and 6g NO GO gauge,'}</span>
              </div>
            </td>
          </tr>
        )}
        {(record.showTechInfoDimensions !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoDimensionsLabel || 'Dimensions'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoDimensions || 'Found Satisfactory/ As per Standard requirement.'}</span>
              </div>
            </td>
          </tr>
        )}
        {(record.showTechInfoHeatTreatment !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoHeatTreatmentLabel || 'Heat Treatment'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoHeatTreatment || 'Quenched Liquid & tempered.'}</span>
              </div>
            </td>
          </tr>
        )}
        {(record.showTechInfoHdg !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoHdgLabel || 'HDG'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoHdg || 'As per ASTM A153 CL-C found satisfactory.'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoGi && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoGiLabel || 'GI'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoGi || 'As per ASTM B633 Found satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoGalv && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoGalvLabel || 'Galv'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoGalv || 'As per ASTM B633 Found satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoSelf && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoSelfLabel || 'Self'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoSelf || 'Found satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoYellow && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoYellowLabel || 'Yellow'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoYellow || 'Found Satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoCadmium && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoCadmiumLabel || 'Cadmium Plating'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoCadmium || 'Found satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoNickel && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoNickelLabel || 'Nickel Plating'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoNickel || 'Found satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoFluropolymer && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoFluropolymerLabel || 'Fluropolymer coating'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoFluropolymer || 'Found satisfactory'}</span>
              </div>
            </td>
          </tr>
        )}
        {record.showTechInfoPtfeBlue && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="space-y-0.5 leading-tight">
                <div className="flex items-start gap-1.5 font-bold text-[9.5px]">
                  <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                  <span>{record.techInfoPtfeBlueTitle || 'PTFE BLUE (XYLAN 1070)'}</span>
                </div>
                <div className="pl-5 text-[9.5px] font-semibold text-black break-words whitespace-normal">
                  : {record.techInfoPtfeBlue || 'Found Satisfactory'}
                </div>
                {record.techInfoPtfeBlueTemp && (
                  <div className="pl-5 text-[9.5px] font-semibold text-black break-words whitespace-normal">
                    : {record.techInfoPtfeBlueTemp}
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
        {(record.showTechInfoNace !== false) && (
          <tr className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{record.techInfoNaceLabel || 'NACE Compliance'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{record.techInfoNace || 'We hereby confirm that the material Complies to NACE MR/0175/ ISO 15156-2 requirements.'}</span>
              </div>
            </td>
          </tr>
        )}
        {/* Custom Dynamically Added Lines */}
        {record.customTechInfoLines?.filter(l => l.enabled !== false).map((customLine) => (
          <tr key={customLine.id} className="break-inside-avoid page-break-inside-avoid">
            <td className="p-0.5 px-1.5 text-[9.5px]">
              <div className="flex items-start gap-1.5 leading-tight">
                <span className="font-black text-[10.5px] text-black shrink-0">☑</span>
                <span className="font-bold text-[9.5px] shrink-0">{customLine.label || 'Inspection'} :</span>
                <span className="font-semibold text-[9.5px] break-words whitespace-normal">{customLine.text || ''}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCertSignatures = (
    record: QcReportRecord,
    isInteractive: boolean = true,
    onUpdatePosition?: (key: string, x: number, y: number) => void
  ) => (
    <div className="pt-1.5 border-t border-black space-y-2 break-inside-avoid page-break-inside-avoid keep-together" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div className="text-[9.5px] font-bold text-black leading-snug">
        {record.remarks || "We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer's specification(s), and that they satisfy the requirements."}
      </div>

      <div className="flex items-end justify-between pt-1 relative">
        {/* LEFT SIGNATURE AREA - PREPARED BY */}
        <div className="text-left space-y-0.5 flex flex-col justify-end relative">
          <div className="relative h-12 w-48 mb-0.5">
            {record.engineerSignatureUrl && (
              isInteractive && onUpdatePosition ? (
                <DraggableImage
                  src={record.engineerSignatureUrl}
                  alt="Engineer Signature"
                  height={record.preparedSignHeight || record.signatureHeight || 52}
                  posX={record.preparedSignPosX || 0}
                  posY={record.preparedSignPosY || 0}
                  onPositionChange={(nx, ny) => onUpdatePosition('preparedSign', nx, ny)}
                  className="max-w-[180px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                  title="Click & Drag to move Prepared By Signature"
                />
              ) : (
                <img
                  src={record.engineerSignatureUrl}
                  alt="Engineer Signature"
                  style={{
                    height: `${record.preparedSignHeight || record.signatureHeight || 52}px`,
                    transform: `translate(${record.preparedSignPosX || 0}px, ${record.preparedSignPosY || 0}px)`
                  }}
                  className="max-w-[180px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                />
              )
            )}
          </div>
          <div className="font-normal text-[8.5px] text-black leading-tight">Prepared By.</div>
          <div className="font-bold text-[8.5px] text-black leading-tight">Engineer QA/QC</div>
        </div>

        {/* RIGHT APPROVAL & STAMP AREA */}
        <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
          <div className="relative h-12 w-72 mb-0.5 flex items-end justify-end">
            {record.companyStampUrl && (
              isInteractive && onUpdatePosition ? (
                <DraggableImage
                  src={record.companyStampUrl}
                  alt="Company Stamp"
                  height={record.stampHeight || 68}
                  posX={record.stampPosX || 0}
                  posY={record.stampPosY || 0}
                  onPositionChange={(nx, ny) => onUpdatePosition('stamp', nx, ny)}
                  className="max-w-[180px] object-contain absolute bottom-0 right-28 origin-bottom opacity-90 z-0"
                  title="Click & Drag to move Stamp"
                />
              ) : (
                <img
                  src={record.companyStampUrl}
                  alt="Company Stamp"
                  style={{
                    height: `${record.stampHeight || 68}px`,
                    transform: `translate(${record.stampPosX || 0}px, ${record.stampPosY || 0}px)`
                  }}
                  className="max-w-[180px] object-contain absolute bottom-0 right-28 origin-bottom opacity-90 z-0"
                />
              )
            )}

            {record.managerSignatureUrl && (
              isInteractive && onUpdatePosition ? (
                <DraggableImage
                  src={record.managerSignatureUrl}
                  alt="Manager Signature"
                  height={record.approvedSignHeight || record.signatureHeight || 52}
                  posX={record.approvedSignPosX || 0}
                  posY={record.approvedSignPosY || 0}
                  onPositionChange={(nx, ny) => onUpdatePosition('approvedSign', nx, ny)}
                  className="max-w-[220px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
                  title="Click & Drag to move Approved By Signature"
                />
              ) : (
                <img
                  src={record.managerSignatureUrl}
                  alt="Manager Signature"
                  style={{
                    height: `${record.approvedSignHeight || record.signatureHeight || 52}px`,
                    transform: `translate(${record.approvedSignPosX || 0}px, ${record.approvedSignPosY || 0}px)`
                  }}
                  className="max-w-[220px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
                />
              )
            )}
          </div>

          <div className="font-normal text-[8.5px] text-black leading-tight">Approved By.</div>
          <div className="font-bold text-[8.5px] text-black leading-tight">{getCompanyQcHead(activeCompany)}</div>
          <div className="font-bold text-[8.5px] text-black tracking-tight leading-tight">{record.companyName || activeCompany.name}</div>
        </div>
      </div>
    </div>
  );

  const getSpecializedReportInfo = (type: string) => {
    switch (type) {
      case 'HDG_REPORT':
        return {
          title: 'HOT DIP GALVANIZING (HDG) INSPECTION REPORT',
          badge: 'COATING QUALITY & THICKNESS CERTIFICATE',
          defaultStandard: 'ASTM A153 / ASTM A123 / ISO 1461',
          specLabel: 'SPECIFIED THICKNESS',
          readingLabel: 'ACTUAL THICKNESS (µm)',
          defaultSpecVal: '45 – 85 µm (Class C/D)',
          defaultReadingVal: '58 – 72 µm (Satisfactory)',
          criteria1: 'Coating Spec: ASTM A153 / A123',
          criteria2: 'Visual: 100% Free of Dross / Blisters',
          criteria3: 'Adhesion: Passed Knife & Hammer Test',
          criteria4: 'Zinc Purity: Zn ≥ 98.5% High Grade',
          sampleNote: 'We hereby certify that the hot-dip galvanized coating applied to the listed materials has been inspected and tested in accordance with ASTM A153 / ASTM A123 / ISO 1461, and satisfies all specified quality and coating thickness requirements.'
        };
      case 'GI_REPORT':
        return {
          title: 'ELECTRO-GALVANIZED (GI) INSPECTION REPORT',
          badge: 'ZINC PLATING QUALITY CERTIFICATE',
          defaultStandard: 'ASTM B633 Class Fe/Zn 8 / ISO 2081',
          specLabel: 'PLATING SPEC',
          readingLabel: 'PLATING THICKNESS (µm)',
          defaultSpecVal: '8 – 12 µm (Fe/Zn 8)',
          defaultReadingVal: '9.5 – 11.2 µm (Pass)',
          criteria1: 'Plating Spec: ASTM B633 Fe/Zn 8',
          criteria2: 'Passivation: Clear / Blue Trivalent',
          criteria3: 'Salt Spray: 72 hrs to White Rust',
          criteria4: 'Adhesion: Passed Burnishing Test',
          sampleNote: 'We hereby certify that the electro-galvanized coating complies fully with ASTM B633 / ISO 2081 specification requirements with uniform finish and de-embrittlement baking.'
        };
      case 'NICKEL_REPORT':
        return {
          title: 'NICKEL PLATING QUALITY INSPECTION REPORT',
          badge: 'ELECTROLESS / ELECTRO NICKEL CERTIFICATE',
          defaultStandard: 'ASTM B733 / ASTM B689',
          specLabel: 'NICKEL SPEC',
          readingLabel: 'COATING THICKNESS (µm)',
          defaultSpecVal: '15 – 25 µm (ENP High Phos)',
          defaultReadingVal: '18 – 22 µm (Satisfactory)',
          criteria1: 'Nickel Spec: ASTM B733 Class 1',
          criteria2: 'Hardness: 48 - 52 HRC As-Plated',
          criteria3: 'Porosity: Passed Ferroxyl Test',
          criteria4: 'Adhesion: ASTM B571 Chisel Test',
          sampleNote: 'We hereby certify that the nickel plating applied to the fastener components meets all micro-hardness, corrosion barrier, and thickness criteria under ASTM B733.'
        };
      case 'NICKEL_COBALT_REPORT':
        return {
          title: 'NICKEL COBALT COATING TEST REPORT',
          badge: 'ELECTRODEPOSITED ALLOY QUALITY CERTIFICATE',
          defaultStandard: 'ASTM B994',
          specLabel: 'COATING SPEC',
          readingLabel: 'ACTUAL THICKNESS (µm)',
          defaultSpecVal: '15 – 25 µm (ASTM B994)',
          defaultReadingVal: '18 – 22 µm (Satisfactory)',
          criteria1: 'Coating Spec: ASTM B994',
          criteria2: 'Visual: Uniform, Pore-Free & Smooth',
          criteria3: 'Adhesion: ASTM B571 Chisel/Bend Test Pass',
          criteria4: 'Hardness / Wear: High Temperature & Corrosion Resistant',
          sampleNote: 'We hereby certify that the nickel-cobalt coating applied to the listed materials has been inspected and tested in accordance with ASTM B994, and satisfies all specified quality and coating thickness requirements.'
        };
      case 'YELLOW_PASSIVATED_REPORT':
        return {
          title: 'YELLOW PASSIVATED ZINC INSPECTION REPORT',
          badge: 'CORROSION RESISTANCE CERTIFICATE',
          defaultStandard: 'ASTM B633 Type II (Yellow Chromate)',
          specLabel: 'PLATING SPEC',
          readingLabel: 'COATING THICKNESS (µm)',
          defaultSpecVal: '8 – 13 µm + Yellow Chromate',
          defaultReadingVal: '10 – 12 µm (Pass)',
          criteria1: 'Plating Spec: ASTM B633 Type II',
          criteria2: 'Passivation: Iridescent Yellow',
          criteria3: 'Salt Spray: 96 hrs to White Rust',
          criteria4: 'Adhesion: Passed Bend / Tape Test',
          sampleNote: 'We hereby certify that the yellow dichromate passivated zinc coating provides heavy-duty corrosion resistance conforming to ASTM B633 Type II.'
        };
      case 'CADMIUM_REPORT':
        return {
          title: 'CADMIUM PLATING QUALITY REPORT',
          badge: 'AEROSPACE & OFFSHORE SPECIFICATION',
          defaultStandard: 'ASTM B766 / AMS-QQ-P-416 Type II',
          specLabel: 'CADMIUM SPEC',
          readingLabel: 'PLATING THICKNESS (µm)',
          defaultSpecVal: '8 – 13 µm Class 8 Type II',
          defaultReadingVal: '10 – 12.5 µm (Pass)',
          criteria1: 'Spec: AMS-QQ-P-416 / ASTM B766',
          criteria2: 'Baking: De-embrittlement 190°C 4h',
          criteria3: 'Salt Spray: 96 hrs to White Rust',
          criteria4: 'Lubricity: Low torque coefficient',
          sampleNote: 'We hereby certify that the cadmium plating and de-embrittlement heat treatment satisfy all requirements of ASTM B766 / AMS-QQ-P-416 Type II.'
        };
      case 'PTFE_REPORT':
        return {
          title: 'PTFE / XYLAN FLUOROPOLYMER COATING REPORT',
          badge: 'ENGINEERED FASTENER COATING CERTIFICATE',
          defaultStandard: 'XYLAN 1070 / 1424 SPECIFICATION',
          specLabel: 'COATING SYSTEM',
          readingLabel: 'DRY FILM THICKNESS (DFT)',
          defaultSpecVal: '20 – 35 µm (2-Coat System)',
          defaultReadingVal: '24 – 28 µm (Satisfactory)',
          criteria1: 'Coating: Xylan 1070 PTFE Blue',
          criteria2: 'Pretreatment: Zinc Phosphate',
          criteria3: 'Adhesion: ASTM D3359 Cross Hatch 5B',
          criteria4: 'Salt Spray: 1500+ Hours ASTM B117',
          sampleNote: 'We hereby certify that the PTFE / Xylan 1070 fluoropolymer multi-coat system has been applied over phosphate pretreated substrate, cured at 205°C, and passed all cross-hatch adhesion and DFT tests.'
        };
      case 'FLUROPOLYMER_REPORT':
        return {
          title: 'FLUOROPOLYMER FASTENER COATING CERTIFICATE',
          badge: 'SUBSEA & OFFSHORE COATING SPEC',
          defaultStandard: 'ISO 10683 / ASTM F3393',
          specLabel: 'COATING SPEC',
          readingLabel: 'DRY FILM THICKNESS (DFT)',
          defaultSpecVal: '25 – 40 µm Multi-Layer',
          defaultReadingVal: '30 – 35 µm (Pass)',
          criteria1: 'Spec: ISO 10683 / ASTM F3393',
          criteria2: 'Chemical: Resists H2S, Acid & Brine',
          criteria3: 'Adhesion: Class 5B Adhesion Pass',
          criteria4: 'Friction Coeff: µ = 0.08 – 0.12',
          sampleNote: 'We hereby certify that the fluoropolymer composite coating provides extreme offshore corrosion protection and strictly satisfies ISO 10683 / ASTM F3393.'
        };
      case 'COC_REPORT':
        return {
          title: 'CERTIFICATE OF CONFORMITY (COC)',
          badge: 'BS EN 10204 TYPE 2.1 / 2.2 DECLARATION',
          defaultStandard: 'ASME / ASTM / DIN / BS SPECIFICATIONS',
          specLabel: 'PRODUCT SPEC',
          readingLabel: 'CONFORMANCE VERIFICATION',
          defaultSpecVal: 'Conforming to PO & Drawings',
          defaultReadingVal: '100% Verified & Compliant',
          criteria1: 'Standard: BS EN 10204 Type 2.1',
          criteria2: 'Dimensions: In accordance with ASME / DIN',
          criteria3: 'Marking: Positively Identified',
          criteria4: 'Traceability: Full Heat/Batch Traceable',
          sampleNote: 'We hereby declare and certify that the products detailed herein have been manufactured, inspected, and tested in accordance with applicable Purchase Order terms, drawing standards, and technical specifications.'
        };
      case 'TEFLON_REPORT':
        return {
          title: 'TEFLON (PTFE / FEP) COATING INSPECTION REPORT',
          badge: 'NON-STICK & DIELECTRIC CERTIFICATE',
          defaultStandard: 'ASTM D4894 / TEFLON SPECIFICATION',
          specLabel: 'TEFLON SPEC',
          readingLabel: 'DFT THICKNESS (µm)',
          defaultSpecVal: '25 – 45 µm Pure PTFE',
          defaultReadingVal: '32 – 38 µm (Satisfactory)',
          criteria1: 'Spec: ASTM D4894 Pure PTFE',
          criteria2: 'Dielectric: Spark Holiday Passed',
          criteria3: 'Adhesion: Cross Hatch 5B Pass',
          criteria4: 'Thermal: -200°C to +260°C Range',
          sampleNote: 'We hereby certify that the Teflon coating meets all dielectric breakdown, chemical resistance, and dry film thickness specifications.'
        };
      case 'NEOPRENE_SLEEVE_REPORT':
        return {
          title: 'NEOPRENE SLEEVE & FLANGE ISOLATION REPORT',
          badge: 'DIELECTRIC INSULATION CERTIFICATE',
          defaultStandard: 'NACE SP0286 / ASME B16.5',
          specLabel: 'INSULATION SPEC',
          readingLabel: 'DIELECTRIC BREAKDOWN',
          defaultSpecVal: 'Neoprene / Mylar Sleeve + G10',
          defaultReadingVal: '5000+ Volts / No Breakdown',
          criteria1: 'Spec: NACE SP0286 Dielectric',
          criteria2: 'Breakdown: > 5 kV Dielectric Test',
          criteria3: 'Water Absorption: < 0.1% ASTM D570',
          criteria4: 'Fit: 100% Flange Bolt Hole Match',
          sampleNote: 'We hereby certify that the neoprene insulating sleeves and washers provide cathodic protection dielectric isolation complying with NACE SP0286.'
        };
      case 'WARRANTY_CERTIFICATE':
        return {
          title: 'OFFICIAL PRODUCT WARRANTY CERTIFICATE',
          badge: 'MANUFACTURER QUALITY GUARANTEE',
          defaultStandard: `${activeCompany.name.toUpperCase()} QA/QC POLICY`,
          specLabel: 'WARRANTY TERM',
          readingLabel: 'COVERAGE SCOPE',
          defaultSpecVal: '18 Months Delivery / 12 Mo Install',
          defaultReadingVal: '100% Comprehensive Coverage',
          criteria1: `Policy: ${activeCompany.name} QA/QC 100%`,
          criteria2: 'Coverage: Materials & Workmanship',
          criteria3: 'Standard: ISO 9001:2015 Quality System',
          criteria4: 'Remedy: Free Replacement / Rectification',
          sampleNote: `${activeCompany.name} guarantees that all supplied fasteners are free from defects in material and workmanship for 18 months from shipment or 12 months from installation.`
        };
      case 'COO_CERTIFICATE':
        return {
          title: 'COUNTRY OF ORIGIN CERTIFICATE',
          badge: 'COUNTRY OF ORIGIN DECLARATION',
          defaultStandard: 'UNITED ARAB EMIRATES RULES OF ORIGIN',
          specLabel: 'ORIGIN STATUS',
          readingLabel: 'MANUFACTURING LOCATION',
          defaultSpecVal: 'United Arab Emirates (UAE)',
          defaultReadingVal: `${activeCompany.location || 'Ajman'}, UAE Facility`,
          criteria1: 'Origin: United Arab Emirates (UAE)',
          criteria2: `Manufacturer: ${activeCompany.name}`,
          criteria3: `Location: ${activeCompany.address || 'Industrial Area, UAE'}`,
          criteria4: 'Value Addition: > 40% Local Content',
          sampleNote: `We hereby certify that the goods specified below were produced and manufactured in the United Arab Emirates by ${activeCompany.name}.`
        };
      case 'COMPLIANCE_LETTER':
        return {
          title: 'REGULATORY & SPECIFICATION COMPLIANCE LETTER',
          badge: 'RoHS, REACH & CONFLICT MINERALS COMPLIANT',
          defaultStandard: 'RoHS 2011/65/EU | REACH EC 1907/2006',
          specLabel: 'REGULATION',
          readingLabel: 'COMPLIANCE STATUS',
          defaultSpecVal: 'RoHS 3 / REACH SVHC / Dodd-Frank',
          defaultReadingVal: '100% Compliant / Zero SVHC',
          criteria1: 'RoHS: 2011/65/EU & (EU) 2015/863',
          criteria2: 'REACH: EC 1907/2006 Candidate List',
          criteria3: 'Conflict Minerals: Dodd-Frank 1502',
          criteria4: 'Heavy Metals: Pb, Cd, Hg, Cr6+ Free',
          sampleNote: 'This statement confirms that all supplied fastener products are fully compliant with RoHS 3, REACH SVHC candidate limits, and client technical material specifications.'
        };
      case 'INSPECTION_REPORT':
        return {
          title: 'PRE-SHIPMENT QUALITY INSPECTION REPORT',
          badge: 'FINAL QC INSPECTION CERTIFICATE',
          defaultStandard: 'ISO 3269 / ASME B18.18 SAMPLING PLAN',
          specLabel: 'INSPECTION PLAN',
          readingLabel: 'DIMENSIONAL & VISUAL RESULT',
          defaultSpecVal: 'AQL 0.65 Normal Level II',
          defaultReadingVal: '100% Accept / Zero Defects',
          criteria1: 'Sampling: ISO 3269 / ASME B18.18',
          criteria2: 'Thread Fit: 6g / 6H Ring & Plug Gauge',
          criteria3: 'Visual: 100% Burr-Free & Clean',
          criteria4: 'Marking: Fully Legible & Verified',
          sampleNote: 'We hereby confirm that pre-shipment quality inspection has been completed with 100% visual, dimensional Vernier/micrometer readings, and 6g/6H thread pitch gauge pass confirmation.'
        };
      default:
        return {
          title: 'QUALITY INSPECTION REPORT',
          badge: 'QC CERTIFICATE',
          defaultStandard: 'BS EN 10204 3.1',
          specLabel: 'SPECIFICATION',
          readingLabel: 'TEST RESULT',
          defaultSpecVal: 'Standard Spec',
          defaultReadingVal: 'Satisfactory / Pass',
          criteria1: 'Spec: BS EN 10204 3.1',
          criteria2: 'Visual: 100% Satisfactory',
          criteria3: 'Integrity: Passed All Tests',
          criteria4: 'Status: Approved for Dispatch',
          sampleNote: 'Materials inspected and tested in accordance with customer specification requirements and certified satisfactory.'
        };
    }
  };

  const renderSpecializedCertContent = (
    record: QcReportRecord,
    pageNum: number = 1,
    totalPages: number = 1
  ) => {
    const reportInfo = getSpecializedReportInfo(record.templateType);

    return (
      <div className="space-y-3 font-sans text-black">
        {/* 1. TOP HEADER: LOGOS + COMPANY INFORMATION */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2 relative gap-2">
          <div className="w-48 flex flex-col items-start shrink-0">
            {record.companyLogoUrl ? (
              <img src={record.companyLogoUrl} alt="Company Logo" className="h-14 max-w-[175px] object-contain" />
            ) : (
              <div className="font-black text-sm uppercase">Marine Fasteners</div>
            )}
          </div>
          <div className="text-center flex-1 px-2">
            <h1 className="text-sm font-black tracking-wider text-black uppercase leading-tight">
              {record.companyName || activeCompany.name}
            </h1>
            {(record.companyTagline || activeCompany.headerTagline) && (
              <p className="text-[9px] text-slate-800 font-extrabold uppercase tracking-tight leading-none mt-0.5">
                {record.companyTagline || activeCompany.headerTagline}
              </p>
            )}
            <p className="text-[8.5px] text-slate-700 font-medium leading-tight mt-1">
              {record.companyAddress || activeCompany.address || 'Jurfh Industrial Area 1, P.O. Box 21254, Ajman, United Arab Emirates'}
            </p>
            {record.showCompanyContact && (
              <p className="text-[8.5px] text-slate-700 font-medium leading-tight">
                {record.companyContact || `Tel: ${activeCompany.phone || '+971 6 742 8881'} | Email: ${activeCompany.email || 'sales@marinefasteners.ae'} | Web: ${activeCompany.website || 'www.marinefasteners.ae'}`}
              </p>
            )}
          </div>
          {(activeCompany.showIso !== false && (isMarineFastenersCompany(activeCompany) || activeCompany.showIso)) && (
            <div className="w-36 flex flex-col items-end shrink-0">
              <img src={record.isoLogoUrl || DEFAULT_ISO_LOGO_URL} alt="ISO Certified" className="h-12 max-w-[125px] object-contain" />
              <div className="text-[7px] font-bold text-slate-700 uppercase tracking-tighter mt-0.5 text-right">
                {getCompanyIsoText(activeCompany) || 'ISO 9001 • 14001 • 45001'}
              </div>
            </div>
          )}
        </div>

        {/* DOCUMENT TITLE BANNER */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded-sm border border-black">
          <span className="font-black text-[12px] tracking-wider uppercase">
            {reportInfo.title}
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-xs uppercase tracking-tight">
              {reportInfo.badge}
            </span>
            <span className="text-[9.5px] font-bold font-mono text-slate-300">
              Page {pageNum} of {totalPages}
            </span>
          </div>
        </div>

        {/* 2. METADATA MATRIX */}
        <div className="border border-black text-[9px] bg-white">
          <div className="grid grid-cols-2 divide-x divide-black">
            <div className="divide-y divide-black">
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Report / Cert No:</span>
                <span className="font-black text-black text-[9.5px] uppercase">{record.certNo || record.issueNo}</span>
              </div>
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Customer / Buyer:</span>
                <span className="font-bold text-black text-[9.5px] uppercase">{record.customerName}</span>
              </div>
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Customer PO No:</span>
                <span className="font-bold text-black text-[9.5px]">{record.customerPoNum}</span>
              </div>
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Standard / Spec:</span>
                <span className="font-bold text-black text-[9.5px] uppercase">{record.specStandard || reportInfo.defaultStandard}</span>
              </div>
            </div>

            <div className="divide-y divide-black">
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Date:</span>
                <span className="font-bold text-black text-[9.5px]">{record.date}</span>
              </div>
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Invoice Number:</span>
                <span className="font-bold text-black text-[9.5px]">{record.invoiceNum}</span>
              </div>
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Work Order No:</span>
                <span className="font-bold text-black text-[9.5px]">{record.workOrderNum}</span>
              </div>
              <div className="flex items-center p-1">
                <span className="w-28 font-bold text-slate-800 shrink-0">Country of Origin:</span>
                <span className="font-black text-black text-[9.5px]">United Arab Emirates (UAE)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT SPECIFICATIONS & INSPECTION TEST TABLE */}
        <div className="space-y-1">
          <div className="bg-slate-100 border border-black px-2 py-1 font-black text-[10px] uppercase tracking-wide flex items-center justify-between text-black">
            <span>*PRODUCT SPECIFICATIONS & COATING INSPECTION RESULTS</span>
            <span className="text-[9px] font-bold text-slate-600 tracking-tight">EN 10204 3.1 Certified</span>
          </div>

          <div className="border border-black overflow-x-auto bg-white">
            <table className="w-full text-center border-collapse text-[9px] table-fixed">
              <thead>
                <tr className="bg-slate-200/90 font-black border-b border-black text-black text-[8.5px] leading-tight">
                  <th className="border-r border-black p-1 w-[6%]">S/L NO</th>
                  <th className="border-r border-black p-1 w-[28%] text-left px-1.5">ITEM DESCRIPTION</th>
                  <th className="border-r border-black p-1 w-[12%]">SIZE</th>
                  <th className="border-r border-black p-1 w-[13%]">HEAT / BATCH</th>
                  <th className="border-r border-black p-1 w-[8%]">QTY (PCS)</th>
                  <th className="border-r border-black p-1 w-[13%]">{reportInfo.specLabel}</th>
                  <th className="border-r border-black p-1 w-[10%]">MARKING</th>
                  <th className="border-r border-black p-1 w-[13%]">{reportInfo.readingLabel}</th>
                  <th className="p-1 w-[7%]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {record.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="border-r border-black p-1 font-bold bg-slate-50 text-slate-800">{idx + 1}</td>
                    <td className="border-r border-black p-1 text-left font-medium uppercase break-words leading-tight">{item.description}</td>
                    <td className="border-r border-black p-1 font-medium">{item.size}</td>
                    <td className="border-r border-black p-1 font-bold uppercase font-mono">{item.heatNo || ''}</td>
                    <td className="border-r border-black p-1 font-bold">{item.qty}</td>
                    <td className="border-r border-black p-1 font-medium">{item.finish || reportInfo.defaultSpecVal}</td>
                    <td className="border-r border-black p-1 font-medium uppercase">{item.marking || 'B7 / MFI'}</td>
                    <td className="border-r border-black p-1 font-semibold">{item.remark || reportInfo.defaultReadingVal}</td>
                    <td className="p-1 font-black text-emerald-900 bg-emerald-50 text-[8.5px]">PASS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. TECHNICAL PARAMETERS & TEST CRITERIA MATRIX */}
        <div className="border border-black bg-white">
          <div className="bg-slate-100 border-b border-black px-2 py-0.5 font-black text-[9.5px] uppercase tracking-wide text-black">
            *TEST CRITERIA & INSPECTION PARAMETERS
          </div>
          <div className="grid grid-cols-4 divide-x divide-black text-[8.5px]">
            <div className="p-1.5 space-y-0.5">
              <span className="font-bold text-slate-700 block text-[8px] uppercase">1. Coating Specification:</span>
              <span className="font-bold text-black block">{record.specStandard || reportInfo.criteria1}</span>
            </div>
            <div className="p-1.5 space-y-0.5">
              <span className="font-bold text-slate-700 block text-[8px] uppercase">2. Visual & Uniformity:</span>
              <span className="font-bold text-emerald-900 block">{reportInfo.criteria2}</span>
            </div>
            <div className="p-1.5 space-y-0.5">
              <span className="font-bold text-slate-700 block text-[8px] uppercase">3. Adhesion & Integrity:</span>
              <span className="font-bold text-emerald-900 block">{reportInfo.criteria3}</span>
            </div>
            <div className="p-1.5 space-y-0.5">
              <span className="font-bold text-slate-700 block text-[8px] uppercase">4. Quality Disposition:</span>
              <span className="font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded-xs inline-block">ACCEPTED / PASSED</span>
            </div>
          </div>
        </div>

        {/* 5. OFFICIAL CERTIFICATION STATEMENT */}
        <div className="border-t-2 border-black pt-1.5 space-y-1">
          <div className="text-[8px] font-extrabold uppercase text-slate-700 tracking-tight">
            OFFICIAL CERTIFICATION & WARRANTY STATEMENT:
          </div>
          <div className="p-1 font-bold text-[8.5px] text-black leading-snug">
            {record.remarks || reportInfo.sampleNote}
          </div>
        </div>

        {/* 6. SIGNATURES & OFFICIAL STAMP */}
        <div className="flex items-end justify-between pt-3 relative">
          <div className="text-left space-y-0.5 flex flex-col justify-end relative">
            <div className="relative h-12 w-48 mb-0.5">
              {record.engineerSignatureUrl && (
                <img
                  src={record.engineerSignatureUrl}
                  alt="Engineer Signature"
                  style={{
                    height: `${record.preparedSignHeight || 52}px`,
                    transform: `translate(${record.preparedSignPosX || 0}px, ${record.preparedSignPosY || 0}px)`
                  }}
                  className="max-w-[180px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                />
              )}
            </div>
            <div className="font-normal text-[8.5px] text-black leading-tight">Prepared By.</div>
            <div className="font-bold text-[8.5px] text-black leading-tight">Engineer QA/QC</div>
          </div>

          <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
            <div className="relative h-12 w-72 mb-0.5 flex items-end justify-end">
              {record.companyStampUrl && (
                <img
                  src={record.companyStampUrl}
                  alt="Company Stamp"
                  style={{
                    height: `${record.stampHeight || 68}px`,
                    transform: `translate(${record.stampPosX || 0}px, ${record.stampPosY || 0}px)`
                  }}
                  className="max-w-[180px] object-contain absolute bottom-0 right-28 origin-bottom opacity-90 z-0"
                />
              )}

              {record.managerSignatureUrl && (
                <img
                  src={record.managerSignatureUrl}
                  alt="Manager Signature"
                  style={{
                    height: `${record.approvedSignHeight || 52}px`,
                    transform: `translate(${record.approvedSignPosX || 0}px, ${record.approvedSignPosY || 0}px)`
                  }}
                  className="max-w-[220px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
                />
              )}
            </div>

            <div className="font-normal text-[8.5px] text-black leading-tight">Approved By.</div>
            <div className="font-bold text-[8.5px] text-black leading-tight">{getCompanyQcHead(activeCompany)}</div>
            <div className="font-bold text-[8.5px] text-black tracking-tight leading-tight">{record.companyName || activeCompany.name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-8 font-sans text-slate-900">
      
      {/* HEADER BAR */}
      <div className="bg-white text-slate-900 p-3.5 px-5 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
              QUALITY CONTROL & MATERIAL TEST CERTIFICATES (MTC)
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            EN 10204 3.1 Certified Horizontal MTC, Chemical/Mechanical Testing & Coating Reports Generator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab(activeSubTab === 'records' ? 'create' : 'records')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeSubTab === 'records' 
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> MTC Archive ({records.length})
          </button>
        </div>
      </div>

      {/* EXCEL IMPORT MODAL */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Excel Bulk Data Import
              </h3>
              <button onClick={() => setShowExcelModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-700">Select Import Target</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input type="radio" name="target" checked={excelPasteTarget === 'items'} onChange={() => setExcelPasteTarget('items')} />
                  Product Items Grid
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input type="radio" name="target" checked={excelPasteTarget === 'chemical'} onChange={() => setExcelPasteTarget('chemical')} />
                  Chemical Composition Analysis
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input type="radio" name="target" checked={excelPasteTarget === 'mechanical'} onChange={() => setExcelPasteTarget('mechanical')} />
                  Mechanical Property Testing
                </label>
              </div>
            </div>

            <textarea
              rows={8}
              value={excelPasteText}
              onChange={(e) => setExcelPasteText(e.target.value)}
              placeholder="Paste tab-separated rows copied directly from Excel columns here..."
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowExcelModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase">Cancel</button>
              <button onClick={handleProcessExcelPaste} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase shadow-md hover:bg-emerald-700">
                Import Data Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 1: FORM EDITOR & TEMPLATE SELECTOR */}
      {activeSubTab === 'create' && (
        <div className="space-y-3">
          
          {/* SIMPLE & SLEEK TEMPLATE SELECTOR BAR WITH POP-UP MODAL */}
          {(() => {
            const categories = [
              {
                id: 'mtc',
                label: 'MTC Reports',
                badge: 'Mill Test Certs',
                count: 4,
                icon: FileText,
                templates: [
                  { type: 'MTC_T1', name: 'MTC 1', detail: 'EN 10204-3.1 Standard', spec: 'EN 10204-3.1', desc: 'Standard landscape mill certificate with heat analysis, mechanical tests & traceability.', icon: FileText },
                  { type: 'MTC_T2', name: 'MTC 2', detail: '2-Page Fastener Cert', spec: 'BS EN 10204 3.1', desc: 'Marine fasteners 2-page certificate with complete chemical & mechanical breakdown.', icon: FileSpreadsheet },
                  { type: 'MTC_T3', name: 'MTC 3', detail: 'ASTM A320 L7 / A194 7', spec: 'ASTM A320 / A194', desc: 'Specialized low-temp fastener certificate with standard Min/Max composition thresholds.', icon: CheckSquare },
                  { type: 'MTC_T4', name: 'MTC 4', detail: 'Pipeline Heavy Duty', spec: 'Pipeline Spec', desc: 'Heavy duty pipeline & subsea fastener inspection certificate.', icon: FileCheck }
                ]
              },
              {
                id: 'coating',
                label: 'Coating & Plating QC',
                badge: 'Surface Treatment',
                count: 10,
                icon: Shield,
                templates: [
                  { type: 'HDG_REPORT', name: 'HDG Galvanizing', detail: 'ASTM A153 / ISO 1461', spec: 'ASTM A153 / ISO 1461', desc: 'Hot Dip Galvanizing inspection report with coating thickness & adhesion test.', icon: Shield },
                  { type: 'GI_REPORT', name: 'GI Electro-Zinc', detail: 'ASTM B633', spec: 'ASTM B633 Class Fe/Zn 8', desc: 'Electro-galvanized zinc inspection with passivation & salt spray test records.', icon: Shield },
                  { type: 'NICKEL_REPORT', name: 'Nickel Plating', detail: 'ASTM B733', spec: 'ASTM B733 / B689', desc: 'Electroless / electro-deposited nickel plating thickness and hardness verification.', icon: Shield },
                  { type: 'NICKEL_COBALT_REPORT', name: 'Nickel Cobalt Coating', detail: 'ASTM B994', spec: 'ASTM B994', desc: 'Nickel-Cobalt alloy electrodeposited coating quality and thickness test report.', icon: Shield },
                  { type: 'YELLOW_PASSIVATED_REPORT', name: 'Yellow Passivated', detail: 'Zinc Chromate', spec: 'ASTM B633 Type II', desc: 'Zinc yellow chromate passivation inspection certificate.', icon: Shield },
                  { type: 'CADMIUM_REPORT', name: 'Cadmium Plating', detail: 'ASTM B766', spec: 'ASTM B766 / AMS-QQ-P-416', desc: 'Cadmium electroplating report with bake-out hydrogen embrittlement relief log.', icon: Shield },
                  { type: 'PTFE_REPORT', name: 'PTFE / Xylan', detail: 'Xylan Coating', spec: 'Xylan 1070 / 1424', desc: 'PTFE / fluoropolymer barrier coating quality & cure verification certificate.', icon: Shield },
                  { type: 'FLUROPOLYMER_REPORT', name: 'Fluoropolymer', detail: 'Fastener Coating', spec: 'ISO 10683 / ASTM F3393', desc: 'Fluoropolymer multi-layer organic coating certificate for industrial fasteners.', icon: Shield },
                  { type: 'TEFLON_REPORT', name: 'Teflon Coating', detail: 'PTFE / FEP Spec', spec: 'ASTM D4894 Spec', desc: 'Teflon PTFE/FEP industrial coating quality inspection report.', icon: Shield },
                  { type: 'NEOPRENE_SLEEVE_REPORT', name: 'Neoprene Sleeve', detail: 'Flange Isolation', spec: 'NACE SP0286 / ASME B16.5', desc: 'Flange isolation gasket kit & neoprene insulating sleeve inspection report.', icon: Shield }
                ]
              },
              {
                id: 'compliance',
                label: 'Certificates & Origin',
                badge: 'Quality & Compliance',
                count: 6,
                icon: Award,
                templates: [
                  { type: 'INSPECTION_TEST_PLAN', name: 'Inspection & Test Plan (ITP)', detail: 'Quality Plan & Matrix', spec: 'ISO 9001 / BS EN 10204 3.1', desc: 'Inspection and Test Plan (ITP) quality surveillance matrix with Hold, Witness, Review & Surveillance intervention points.', icon: ClipboardList },
                  { type: 'COC_REPORT', name: 'Certificate of Conformity', detail: 'BS EN 10204 2.1/2.2', spec: 'BS EN 10204 2.1/2.2', desc: 'Formal Declaration of Conformance certifying compliance with customer PO & specs.', icon: Award },
                  { type: 'WARRANTY_CERTIFICATE', name: 'Warranty Certificate', detail: 'Quality Guarantee', spec: 'MFI QA/QC Guarantee', desc: 'Official product warranty guarantee certificate with operational defect coverage.', icon: Award },
                  { type: 'COO_CERTIFICATE', name: 'Country of Origin Certificate (COO)', detail: 'Made in UAE', spec: 'Made in UAE', desc: 'Country of Origin Certificate declaring manufacturing location in the United Arab Emirates.', icon: Award },
                  { type: 'COMPLIANCE_LETTER', name: 'Compliance Letter', detail: 'RoHS / REACH', spec: 'RoHS 2011/65/EU | REACH', desc: 'Official letter of regulatory compliance certifying restriction of hazardous substances.', icon: FileCheck },
                  { type: 'INSPECTION_REPORT', name: 'Inspection Report', detail: 'Pre-Shipment QA', spec: 'ISO 3269 / ASME B18.18', desc: 'Pre-shipment dimensional, visual & mechanical inspection summary report.', icon: FileCheck }
                ]
              }
            ];

            const allTemplatesList = categories.flatMap(c => c.templates.map(t => ({ ...t, categoryId: c.id, categoryLabel: c.label, categoryIcon: c.icon })));
            const currentTemplateObj = allTemplatesList.find(t => t.type === selectedTemplate);
            const currentTemplateName = currentTemplateObj?.name || formData.templateLabel;
            const activeCat = categories.find(c => c.id === templateCategoryTab) || categories[0];

            const filteredModalTemplates = allTemplatesList.filter(t => {
              const matchesCat = templateCategoryTab === 'all' || t.categoryId === templateCategoryTab;
              const term = templateSearchTerm.trim().toLowerCase();
              if (!term) return matchesCat;
              const matchesSearch = t.name.toLowerCase().includes(term) ||
                t.detail.toLowerCase().includes(term) ||
                t.spec.toLowerCase().includes(term) ||
                t.desc.toLowerCase().includes(term) ||
                t.categoryLabel.toLowerCase().includes(term);
              return matchesCat && matchesSearch;
            });

            return (
              <>
                {/* 1. CLEAN & SOPHISTICATED TEMPLATE SELECTOR BAR */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 space-y-2.5 transition-all">
                  {/* TOP ROW: CATEGORY SELECTOR + POP-UP GALLERY TRIGGER */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    {/* CATEGORY SWITCHER PILLS */}
                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
                      {categories.map(cat => {
                        const CatIcon = cat.icon;
                        const isCatActive = templateCategoryTab === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setTemplateCategoryTab(cat.id as any)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                              isCatActive
                                ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200/80'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                          >
                            <CatIcon className={`w-3.5 h-3.5 ${isCatActive ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span>{cat.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isCatActive ? 'bg-amber-100 text-amber-900' : 'bg-slate-200/80 text-slate-600'
                            }`}>
                              {cat.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* RIGHT: CURRENT ACTIVE CHIP & CLEAN POP-UP BUTTON */}
                    <div className="flex items-center gap-2">
                      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                        <span>Active:</span>
                        <span className="font-semibold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 text-amber-950 flex items-center gap-1 text-[11.5px]">
                          <Check className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                          {currentTemplateName}
                        </span>
                      </div>

                      {/* SIMPLE & GOOD POP-UP TRIGGER BUTTON */}
                      <button
                        type="button"
                        onClick={() => setShowTemplateModal(true)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                        title="Open Template Gallery Pop-up"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                        <span>All Templates</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600 text-[10px] font-bold">20</span>
                      </button>
                    </div>
                  </div>

                  {/* QUICK HORIZONTAL TEMPLATE CHIPS ROW */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeCat.templates.map(t => {
                      const IconComp = t.icon;
                      const isSelected = selectedTemplate === t.type;
                      return (
                        <button
                          key={t.type}
                          type="button"
                          onClick={() => handleSelectTemplate(t.type as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-2xs ring-1 ring-amber-500'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                          <span>{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SIMPLE, ELEGANT TEMPLATE POP-UP MODAL */}
                {showTemplateModal && (
                  <div 
                    className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    <div 
                      className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden text-slate-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* MODAL HEADER */}
                      <div className="p-4 px-5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200/70">
                            <LayoutGrid className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-base font-bold text-slate-900">
                                Select QC Report / Certificate Template
                              </h2>
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                20 Formats
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Choose a standard Mill Test Certificate, Coating QC report, or Quality compliance format.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowTemplateModal(false)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer text-sm font-bold"
                          title="Close"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* MODAL FILTER & SEARCH BAR */}
                      <div className="p-3 px-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                        {/* CATEGORY TABS */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTemplateCategoryTab('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              templateCategoryTab === 'all'
                                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>All</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-slate-200/80 text-slate-700 font-bold">20</span>
                          </button>

                          {categories.map(cat => {
                            const CatIcon = cat.icon;
                            const isCatActive = templateCategoryTab === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setTemplateCategoryTab(cat.id as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isCatActive
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs border border-amber-600'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <CatIcon className={`w-3.5 h-3.5 ${isCatActive ? 'text-slate-950' : 'text-slate-400'}`} />
                                <span>{cat.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-bold ${
                                  isCatActive ? 'bg-amber-600/30 text-slate-950' : 'bg-slate-200/80 text-slate-600'
                                }`}>
                                  {cat.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* LIVE SEARCH INPUT */}
                        <div className="relative min-w-[200px] sm:w-64">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={templateSearchTerm}
                            onChange={(e) => setTemplateSearchTerm(e.target.value)}
                            placeholder="Search by name or standard..."
                            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
                          />
                          {templateSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setTemplateSearchTerm('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* MODAL GRID (SCROLLABLE) */}
                      <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50/50">
                        {filteredModalTemplates.length === 0 ? (
                          <div className="p-10 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
                            <Search className="w-8 h-8 mx-auto text-slate-300" />
                            <div className="text-sm font-bold text-slate-700">No matching templates</div>
                            <div className="text-xs text-slate-400">No template matches "{templateSearchTerm}"</div>
                            <button
                              type="button"
                              onClick={() => { setTemplateSearchTerm(''); setTemplateCategoryTab('all'); }}
                              className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Clear Filter
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredModalTemplates.map(t => {
                              const IconComponent = t.icon;
                              const isSelected = selectedTemplate === t.type;

                              return (
                                <div
                                  key={t.type}
                                  onClick={() => {
                                    handleSelectTemplate(t.type as any);
                                    setShowTemplateModal(false);
                                  }}
                                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 text-left relative group ${
                                    isSelected
                                      ? 'bg-amber-50/80 border-amber-500 shadow-xs ring-1 ring-amber-400'
                                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                                  }`}
                                >
                                  <div>
                                    {/* TOP ROW: CATEGORY BADGE & ACTIVE STATUS */}
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                                        {t.categoryLabel}
                                      </span>

                                      {isSelected ? (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-2xs">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          Active
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 group-hover:text-amber-700 font-medium transition-colors">
                                          Select →
                                        </span>
                                      )}
                                    </div>

                                    {/* TITLE & ICON */}
                                    <div className="flex items-start gap-2.5">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                                      }`}>
                                        <IconComponent className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                                          {t.name}
                                        </h3>
                                        <div className="text-[10.5px] font-semibold text-amber-700/90 truncate">
                                          {t.spec}
                                        </div>
                                      </div>
                                    </div>

                                    {/* DESCRIPTION */}
                                    <p className="text-[11px] text-slate-500 mt-1.5 leading-snug line-clamp-2">
                                      {t.desc}
                                    </p>
                                  </div>

                                  {/* FOOTER CODE */}
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="font-mono">
                                      {t.type}
                                    </span>
                                    <span className={`font-semibold ${isSelected ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`}>
                                      {isSelected ? 'Selected' : 'Apply'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* MODAL FOOTER */}
                      <div className="p-3 px-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>Currently Selected:</span>
                          <span className="font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-950 flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                            {currentTemplateName}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowTemplateModal(false)}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* FORM EDITOR (FULL PAGE OR EMBEDDED) */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className={isFullscreenEditor 
              ? "fixed inset-0 z-50 bg-white overflow-y-auto p-2 sm:p-4 backdrop-blur-md space-y-3 text-slate-900" 
              : "bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-xs space-y-3"
            }
          >
            <div className={`flex items-center justify-between gap-2 border-b pb-3 ${isFullscreenEditor ? 'border-slate-200 bg-white p-3 rounded-xl border shadow-xs' : 'border-slate-200'}`}>
              {/* LEFT SIDE: CREATE MTC ICON + UNDO / REDO CONTROLS */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCreateNewMtc}
                  className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 border border-amber-400/40"
                  title="Create New MTC"
                  aria-label="Create New MTC"
                >
                  <FilePlus className="w-4 h-4" />
                </button>

                <div className="h-5 w-px bg-slate-300 mx-0.5" />

                {/* UNDO BUTTON */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0 && !typingTimerRef.current}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-35 disabled:hover:bg-slate-100 disabled:cursor-not-allowed rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer border border-slate-300 hover:scale-105 active:scale-95"
                  title="Undo (Ctrl + Z)"
                  aria-label="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                {/* REDO BUTTON */}
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-35 disabled:hover:bg-slate-100 disabled:cursor-not-allowed rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer border border-slate-300 hover:scale-105 active:scale-95"
                  title="Redo (Ctrl + Y)"
                  aria-label="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {/* RIGHT SIDE ACTION BUTTONS (ICONS ONLY) */}
              <div className="flex items-center gap-2">

                {/* ADD ROW ICON BUTTON */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer border border-slate-300 hover:scale-105"
                  title="Add Row (+ Add Row)"
                  aria-label="Add Row"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* PREVIEW CERTIFICATE ICON BUTTON */}
                <button
                  type="button"
                  onClick={() => setPrintModalRecord(formData)}
                  className="p-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer border border-sky-400/30 hover:scale-105"
                  title="Preview Certificate"
                  aria-label="Preview Certificate"
                >
                  <Eye className="w-4 h-4 text-sky-100" />
                </button>

                {/* SAVE ICON BUTTON */}
                <button
                  type="button"
                  onClick={handleSaveRecord}
                  className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer hover:scale-105"
                  title="Save Certificate"
                  aria-label="Save Certificate"
                >
                  <Save className="w-4 h-4" />
                </button>

                {/* FULL SCREEN TOGGLE */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenEditor(!isFullscreenEditor)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg transition-all cursor-pointer border border-slate-300 hover:scale-105"
                  title={isFullscreenEditor ? "Exit Full Page" : "Full Page Mode"}
                >
                  {isFullscreenEditor ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* CLOSE ICON (X) BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFullscreenEditor(false);
                    setActiveSubTab('records');
                  }}
                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all cursor-pointer border border-rose-200 hover:scale-105"
                  title="Close Editor & View MTC Archives"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TEMPLATE 1 DIRECT INTERACTIVE PAPER CANVAS SHEET (SAME SAME PRINT PDF) */}
            {selectedTemplate === 'MTC_T1' ? (
              <div className="p-3 sm:p-5 rounded-xl overflow-x-auto border transition-all bg-white border-slate-200">
                <div className={`${isFullscreenEditor ? 'w-full max-w-none' : 'max-w-[287mm] min-w-[270mm] mx-auto'} border border-black p-3 space-y-1 bg-white text-black font-sans transition-all relative`}>
                  {/* CONDITIONAL SAMPLE MTC WATERMARK IN EDITOR */}
                  {isSampleCert(formData) && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
                      <div 
                        className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-4 sm:border-[6px] border-slate-400/25 rounded-3xl px-12 py-5 transform -rotate-[35deg] text-[60px] sm:text-[88px] md:text-[104px] leading-none"
                        style={{
                          fontFamily: "'Arial Black', Arial, Impact, sans-serif",
                          letterSpacing: '0.15em',
                          color: 'rgba(100, 116, 139, 0.18)',
                          borderColor: 'rgba(100, 116, 139, 0.22)',
                        }}
                      >
                        SAMPLE MTC
                      </div>
                    </div>
                  )}
                  
                  {/* 1. TOP HEADER BLOCK WITH LOGO UPLOADS */}
                  <div className="border-b border-black pb-1.5 mb-1 flex items-center justify-between gap-3 bg-white">
                    {/* LEFT: COMPANY LOGO & DETAILS */}
                    <div className="flex items-center gap-3 shrink-0 max-w-[46%]">
                      {/* COMPANY LOGO UPLOAD & DISPLAY */}
                      <div className="relative group flex flex-col items-center shrink-0">
                        {formData.companyLogoUrl ? (
                          <div className="relative">
                            <img src={formData.companyLogoUrl} alt="Company Logo" className="h-16 max-w-[170px] object-contain" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, companyLogoUrl: undefined })}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                              title="Remove Logo"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="p-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded cursor-pointer transition-all flex items-center gap-1 text-[8.5px] font-bold print:hidden" title="Upload Main Company Logo">
                            <Upload className="w-3 h-3 text-amber-700" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleUploadLogo('company', e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={formData.companyName ?? activeCompany.name}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="font-black text-[13px] uppercase tracking-tight text-black leading-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                          placeholder="Company Name"
                          title="Click to edit Company Name"
                        />
                        <input
                          type="text"
                          value={formData.companyTagline ?? (activeCompany.headerTagline || '(SOLE PROPRIETORSHIP)')}
                          onChange={(e) => setFormData({ ...formData, companyTagline: e.target.value })}
                          className="text-[8.5px] font-bold text-slate-700 uppercase tracking-tight mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                          placeholder="Tagline"
                          title="Click to edit Tagline"
                        />
                        <input
                          type="text"
                          value={formData.companyAddress ?? (activeCompany.address ? `${activeCompany.address}, Tel: ${activeCompany.phone || '+971 6 525 0526'}` : 'New Industrial Area, Ajman, UAE, Tel: +971 6 525 0526')}
                          onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                          className="text-[7.5px] font-medium text-slate-800 leading-tight mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                          placeholder="Address & Tel"
                          title="Click to edit Address"
                        />
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <label className="flex items-center gap-1 text-[7px] text-slate-700 cursor-pointer select-none bg-slate-100 px-1 py-0.5 rounded border border-slate-200 hover:bg-slate-200">
                            <input
                              type="checkbox"
                              checked={Boolean(formData.showCompanyContact)}
                              onChange={(e) => setFormData({ ...formData, showCompanyContact: e.target.checked })}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 w-2.5 h-2.5 cursor-pointer"
                            />
                            <span className="font-semibold">Print Email & Web</span>
                          </label>
                          <input
                            type="text"
                            value={formData.companyContact ?? `${activeCompany.email || 'sales@marinefasteners.co'} | ${activeCompany.website || 'www.marinefasteners.co'}`}
                            onChange={(e) => setFormData({ ...formData, companyContact: e.target.value })}
                            className="text-[7.5px] font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white flex-1 rounded-xs px-0.5"
                            placeholder="Email & Website"
                            title="Click to edit Contact"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CENTER: ISO CERTIFICATION LOGO & TEXT (TRANSPARENT, NO OUTSIDE BORDER) */}
                    {(activeCompany.showIso !== false && (isMarineFastenersCompany(activeCompany) || activeCompany.showIso)) ? (
                      <div className="flex-1 flex justify-center items-center px-2 min-w-0">
                        <div className="relative group flex flex-col items-center">
                          <div className="bg-transparent flex flex-col items-center">
                            <label className="cursor-pointer" title="Click to Upload Custom ISO Logo">
                              <img 
                                src={formData.isoLogoUrl || DEFAULT_ISO_LOGO_URL} 
                                alt="ISO Certification Logos" 
                                className="h-10 sm:h-12 md:h-14 max-w-[280px] sm:max-w-[340px] md:max-w-[380px] object-contain transition-all hover:opacity-90" 
                              />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleUploadLogo('iso', e.target.files[0])}
                                className="hidden"
                              />
                            </label>
                            <div className="flex items-center gap-2 mt-1 text-[8.5px] font-bold text-black uppercase tracking-tight">
                              <span>{getCompanyIsoText(activeCompany) || 'ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018'}</span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 print:hidden bg-slate-50 px-2 py-0.5 rounded border border-slate-250 shadow-2xs z-10">
                            <label className="cursor-pointer text-[8.5px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                              <Upload className="w-2.5 h-2.5" />
                              <span>Upload ISO Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleUploadLogo('iso', e.target.files[0])}
                                className="hidden"
                              />
                            </label>
                            {formData.isoLogoUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, isoLogoUrl: undefined });
                                  saveAsset('isoLogoUrl', undefined);
                                }}
                                className="text-rose-600 hover:text-rose-800 text-[8px] font-bold ml-1 border-l pl-1.5 border-slate-300"
                                title="Reset ISO Logo to HD Default"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex justify-center items-center px-2 min-w-0">
                        <div className="text-center font-bold text-[10px] text-slate-700 uppercase tracking-wider">
                          {activeCompany.subtitle || 'QUALITY ASSURANCE & TESTING DIVISION'}
                        </div>
                      </div>
                    )}

                    {/* RIGHT: MATERIAL TEST CERTIFICATE TITLE */}
                    <div className="text-right shrink-0">
                      <input
                        type="text"
                        value={formData.certTitle ?? 'MATERIAL TEST CERTIFICATE'}
                        onChange={(e) => setFormData({ ...formData, certTitle: e.target.value })}
                        className="font-black text-[14px] uppercase tracking-tight text-black underline leading-none mb-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5"
                        placeholder="Certificate Title"
                        title="Click to edit Certificate Title"
                      />
                      <input
                        type="text"
                        value={formData.certStandard ?? 'CERTIFIED TO BS EN 10204, 3.1'}
                        onChange={(e) => setFormData({ ...formData, certStandard: e.target.value })}
                        className="font-black text-[9px] uppercase tracking-tight text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5 w-full"
                        placeholder="Standard Subtitle"
                        title="Click to edit Certificate Standard"
                      />
                      <div className="font-black text-[9px] uppercase tracking-tight text-black mt-0.5 flex items-center justify-end gap-1">
                        <span>Page No :</span>
                        <input
                          type="text"
                          value={formData.pageNo || `1 OF ${calculateTotalPages(formData)}`}
                          onChange={(e) => setFormData({ ...formData, pageNo: e.target.value })}
                          className="w-16 p-0.5 bg-amber-50/50 border border-amber-300 rounded text-center font-black text-[9px] text-amber-950 uppercase"
                          title="Auto-calculated page number or manual override (e.g. 1 OF 3)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. METADATA CERTIFICATE BOX (WITH EXCEL FLOW: PO -> CUSTOMER -> INVOICE -> WO -> DESCRIPTION) */}
                  <table className="w-full border-collapse border border-black text-[8px] font-sans table-fixed mb-1 bg-white">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="w-[12%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5">Certificate No:</td>
                        <td className="w-[38%] p-0.5 font-black border-r border-black text-left px-1">
                          <input
                            id="meta-cert-no"
                            type="text"
                            required
                            value={formData.issueNo || formData.certNo}
                            onChange={(e) => setFormData({ ...formData, certNo: e.target.value, issueNo: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('meta-date')?.focus();
                              }
                            }}
                            className="w-full p-0.5 bg-amber-50/50 border border-amber-300 rounded font-black text-[9.5px] text-amber-950 uppercase"
                          />
                        </td>
                        <td className="w-[12%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5">Date:</td>
                        <td className="w-[13%] p-0.5 font-black border-r border-black text-left px-1">
                          <input
                            id="meta-date"
                            type="text"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('meta-po-number')?.focus();
                              }
                            }}
                            className="w-full p-0.5 bg-amber-50/50 border border-amber-300 rounded font-black text-[9.5px] text-amber-950"
                          />
                        </td>
                        <td className="w-[11%] p-0.5 font-bold border-r border-black bg-white text-left px-1.5">PO Number:</td>
                        <td className="w-[14%] p-0.5 font-black text-left px-1">
                          <input
                            id="meta-po-number"
                            type="text"
                            value={formData.customerPoNum || ''}
                            onChange={(e) => handlePoOrInvoiceChange('customerPoNum', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('meta-customer')?.focus();
                              }
                            }}
                            className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9.5px]"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-0.5 font-bold border-r border-black bg-white text-left px-1.5">Customer:</td>
                        <td className="p-0.5 font-black border-r border-black text-left px-1">
                          <input
                            id="meta-customer"
                            type="text"
                            required
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('meta-invoice-no')?.focus();
                              }
                            }}
                            className="w-full p-0.5 bg-amber-50/50 border border-amber-300 rounded font-black text-[9.5px] text-amber-950 uppercase"
                          />
                        </td>
                        <td className="p-0.5 font-bold border-r border-black bg-white text-left px-1.5">Invoice No:</td>
                        <td className="p-0.5 font-black border-r border-black text-left px-1">
                          <input
                            id="meta-invoice-no"
                            type="text"
                            value={formData.invoiceNum || ''}
                            onChange={(e) => handlePoOrInvoiceChange('invoiceNum', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                document.getElementById('meta-work-order-no')?.focus();
                              }
                            }}
                            className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9.5px]"
                          />
                        </td>
                        <td className="p-0.5 font-bold border-r border-black bg-white text-left px-1.5">Work Order No:</td>
                        <td className="p-0.5 font-black text-left px-1">
                          <input
                            id="meta-work-order-no"
                            type="text"
                            value={formData.workOrderNum || ''}
                            onChange={(e) => handlePoOrInvoiceChange('workOrderNum', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (formData.items.length === 0) {
                                  handleAddItem();
                                }
                                setTimeout(() => focusT1Cell(0, 'description'), 40);
                              }
                            }}
                            className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9.5px]"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 3. TABLE 1: PRODUCT SPECIFICATIONS & CHEMICAL COMPOSITION GRID */}
                  {(() => {
                    const editorChemConfig = getActiveChemFields(formData, formData.chemicalData || formData.items);
                    const { colWidths, fields, chemColPct, count } = editorChemConfig;

                    return (
                      <div className="relative border border-black mb-1 overflow-x-auto bg-white">
                        <table className="w-full text-center border-collapse text-[8px] sm:text-[8.5px] font-sans table-fixed min-w-[1100px] bg-white">
                          <thead>
                            <tr className="bg-white border-b border-black font-bold text-[8px] sm:text-[8.5px] leading-tight text-black">
                              <th className="border border-black p-1 py-1.5 align-middle text-center" style={{ width: colWidths.srNo }} rowSpan={2}>Sr. No.</th>
                              <th className="border border-black p-1 py-1.5 text-left px-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.description }} rowSpan={2}>Description</th>
                              <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.size }} rowSpan={2}>Size</th>
                              <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.specification }} rowSpan={2}>Specification</th>
                              <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.finish }} rowSpan={2}>Finish</th>
                              <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.unit }} rowSpan={2}>Unit</th>
                              <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.qty }} rowSpan={2}>Qty</th>
                              <th className="border border-black p-1 py-1.5 break-words whitespace-normal leading-tight align-middle" style={{ width: colWidths.heatNo }} rowSpan={2}>Heat No.</th>
                              <th className="border border-black p-1 text-[11px] sm:text-[12px] font-black tracking-wider bg-white text-black py-1 align-middle uppercase" colSpan={count}>CHEMICAL COMPOSITION (%)</th>
                              <th className="border border-black p-1 w-[2%]" rowSpan={2}></th>
                            </tr>
                            <tr className="bg-white border-b border-black font-bold text-[8px] sm:text-[8.5px] leading-tight normal-case text-black" style={{ textTransform: 'none' }}>
                              {fields.map((f) => (
                                <th key={f.k} className="border border-black p-0.5 py-1 text-center align-middle" style={{ width: chemColPct, textTransform: 'none' }}>
                                  <input
                                    type="text"
                                    value={formData.chemHeaderOverrides?.[f.k] ?? f.label}
                                    onChange={(e) => {
                                      const overrides = { ...(formData.chemHeaderOverrides || {}) };
                                      overrides[f.k] = e.target.value;
                                      setFormData({ ...formData, chemHeaderOverrides: overrides });
                                    }}
                                    className="w-full text-center bg-transparent border-0 font-bold text-[8px] sm:text-[8.5px] p-0 text-black uppercase focus:bg-amber-100 focus:ring-1 focus:ring-amber-500 rounded"
                                    title={`Click to edit chemical header label (Default: ${f.label})`}
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {formData.items.map((it, idx) => {
                              const chem = formData.chemicalData?.[idx] || {};
                              return (
                                <tr
                                  key={it.id || idx}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'items' });
                                  }}
                                  className="border-b border-black text-[7.5px] sm:text-[8px] hover:bg-amber-50/40 transition-colors"
                                >
                                  <td
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'items' });
                                    }}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'items' });
                                    }}
                                    className="border border-black p-0.5 font-bold align-middle text-center select-none cursor-pointer hover:bg-amber-200 transition-colors"
                                    title="Click or Right-Click for Row Options (Add/Duplicate/Delete across all tables)"
                                  >
                                    {it.itemNo || (idx + 1)}
                                  </td>
                                  <td className="border border-black p-0.5 text-left align-middle break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                                    <textarea
                                      id={`t1-cell-${idx}-description`}
                                      rows={1}
                                      value={it.description}
                                      onChange={(e) => {
                                        const updated = [...formData.items];
                                        updated[idx].description = e.target.value;
                                        setFormData({ ...formData, items: updated });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'description')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'description')}
                                      onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                      }}
                                      placeholder=""
                                      className={`w-full p-0.5 bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none break-words whitespace-normal leading-tight min-h-[20px] overflow-hidden [overflow-wrap:anywhere] [word-break:break-word] ${isT1CellSelected(idx, 0) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  <td className="border border-black p-0.5 align-middle break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                                    <textarea
                                      id={`t1-cell-${idx}-size`}
                                      rows={1}
                                      value={it.size}
                                      onChange={(e) => {
                                        const updated = [...formData.items];
                                        updated[idx].size = e.target.value;
                                        setFormData({ ...formData, items: updated });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'size')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'size')}
                                      onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                      }}
                                      placeholder=""
                                      className={`w-full p-0.5 bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] text-center focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none break-words whitespace-normal leading-tight min-h-[20px] overflow-hidden [overflow-wrap:anywhere] [word-break:break-word] ${isT1CellSelected(idx, 1) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  <td className="border border-black p-0.5 align-middle break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                                    <textarea
                                      id={`t1-cell-${idx}-material`}
                                      rows={1}
                                      value={it.material || it.standard}
                                      onChange={(e) => {
                                        const updated = [...formData.items];
                                        updated[idx].material = e.target.value;
                                        setFormData({ ...formData, items: updated });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'material')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'material')}
                                      onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                      }}
                                      placeholder=""
                                      className={`w-full p-0.5 bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] uppercase text-center focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none break-words whitespace-normal leading-tight min-h-[20px] overflow-hidden [overflow-wrap:anywhere] [word-break:break-word] ${isT1CellSelected(idx, 2) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  <td className="border border-black p-0.5 align-middle break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                                    <textarea
                                      id={`t1-cell-${idx}-finish`}
                                      rows={1}
                                      value={it.finish || ''}
                                      onChange={(e) => {
                                        const updated = [...formData.items];
                                        updated[idx].finish = e.target.value;
                                        setFormData({ ...formData, items: updated });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'finish')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'finish')}
                                      onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                      }}
                                      placeholder=""
                                      className={`w-full p-0.5 bg-transparent border-0 font-normal uppercase text-[7.5px] sm:text-[8px] text-center focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none break-words whitespace-normal leading-tight min-h-[20px] overflow-hidden [overflow-wrap:anywhere] [word-break:break-word] ${isT1CellSelected(idx, 3) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  <td className="border border-black p-0.5 align-middle">
                                    <input
                                      id={`t1-cell-${idx}-unit`}
                                      type="text"
                                      value={it.unit || ''}
                                      onChange={(e) => {
                                        const updated = [...formData.items];
                                        updated[idx].unit = e.target.value;
                                        setFormData({ ...formData, items: updated });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'unit')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'unit')}
                                      placeholder=""
                                      className={`w-full p-0.5 bg-transparent border-0 font-normal uppercase text-[7.5px] sm:text-[8px] text-center focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT1CellSelected(idx, 4) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  <td className="border border-black p-0.5 align-middle">
                                    <input
                                      id={`t1-cell-${idx}-qty`}
                                      type="text"
                                      value={it.qty}
                                      onChange={(e) => {
                                        const updated = [...formData.items];
                                        updated[idx].qty = e.target.value;
                                        setFormData({ ...formData, items: updated });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'qty')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'qty')}
                                      className={`w-full p-0.5 bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] text-center focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT1CellSelected(idx, 5) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  <td className="border border-black p-0.5 align-middle break-words whitespace-normal [overflow-wrap:anywhere] [word-break:break-word]">
                                    <textarea
                                      id={`t1-cell-${idx}-heatNo`}
                                      rows={1}
                                      value={it.heatNo}
                                      onChange={(e) => {
                                        const updatedHeat = e.target.value;
                                        const updatedItems = [...formData.items];
                                        updatedItems[idx].heatNo = updatedHeat;
                                        const updatedChem = [...(formData.chemicalData || [])];
                                        if (updatedChem[idx]) updatedChem[idx].heatNo = updatedHeat;
                                        const updatedMech = [...(formData.mechanicalData || [])];
                                        if (updatedMech[idx]) updatedMech[idx].heatNo = updatedHeat;

                                        setFormData({ ...formData, items: updatedItems, chemicalData: updatedChem, mechanicalData: updatedMech });
                                      }}
                                      onKeyDown={(e) => handleT1KeyDown(e, idx, 'heatNo')}
                                      onPaste={(e) => handleT1Paste(e, idx, 'heatNo')}
                                      onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                      }}
                                      placeholder=""
                                      className={`w-full p-0.5 bg-transparent border-0 font-mono font-normal text-[7.5px] sm:text-[8px] text-amber-900 text-center uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none break-words whitespace-normal leading-tight min-h-[20px] overflow-hidden [overflow-wrap:anywhere] [word-break:break-word] ${isT1CellSelected(idx, 6) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    />
                                  </td>
                                  
                                  {/* CHEMICAL COMPOSITION CELL INPUTS */}
                                  {fields.map(({ k }, chemIdx) => {
                                    const colIndex = 7 + chemIdx;
                                    return (
                                      <td key={k} className="border border-black p-0.2">
                                        <input
                                          id={`t1-cell-${idx}-${k}`}
                                          type="text"
                                          value={chem[k as keyof QcChemicalItem] ?? ''}
                                          onChange={(e) => {
                                            const updatedChem = [...(formData.chemicalData || [])];
                                            if (!updatedChem[idx]) {
                                              updatedChem[idx] = { itemNo: it.itemNo, heatNo: it.heatNo };
                                            }
                                            const isText = k === 'other';
                                            const formattedVal = isText ? e.target.value : formatNumericVal(e.target.value);
                                            updatedChem[idx] = { ...updatedChem[idx], [k]: formattedVal };
                                            setFormData({ ...formData, chemicalData: updatedChem });
                                          }}
                                          onKeyDown={(e) => handleT1KeyDown(e, idx, k)}
                                          onPaste={(e) => handleT1Paste(e, idx, k)}
                                          className={`w-full p-0.2 text-center bg-transparent border-0 font-mono text-[7.5px] sm:text-[8px] font-normal text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT1CellSelected(idx, colIndex) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                        />
                                      </td>
                                    );
                                  })}

                                  <td className="border border-black p-0.2 text-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'items' });
                                      }}
                                      className="text-slate-400 hover:text-amber-600 transition-colors p-0.5 cursor-pointer inline-flex items-center justify-center font-bold text-[9px]"
                                      title="Row Options (Insert / Duplicate / Delete)"
                                    >
                                      ⋮
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* 4. TABLE 2: MECHANICAL PROPERTIES TABLE & COLUMN TOGGLES BAR */}
                  <div className="bg-slate-100 border border-black p-2 mb-1 rounded-t-md text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 font-black text-amber-950 text-[11px] uppercase tracking-wide">
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span>PDF Print Column Toggles (Select columns to include in PDF output)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            showHeatTreatmentCols: true,
                            showColHeatTreatment: true,
                            showColHardness24Hr: true,
                            showColQuenchingTemp: true,
                            showColQuenchingTime: true,
                            showColQuenchingMedium: true,
                            showColTemperingTemp: true,
                            showColTemperingTime: true,
                            showColStressRelieved: true,
                            showColTemperingResult: true,
                            showColImpactJ: true,
                            showColAvgImpactJ: true,
                            showColImpactTemp: true,
                            showColPren: true,
                            showColStressUnderProofload: true,
                            showColPb: true,
                            showColZn: true,
                            showColFe: true,
                            showColSn: true,
                            showImpurity: true,
                            showOther: true,
                          })}
                          className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded border border-amber-300 transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            showHeatTreatmentCols: false,
                            showColHeatTreatment: false,
                            showColHardness24Hr: false,
                            showColQuenchingTemp: false,
                            showColQuenchingTime: false,
                            showColQuenchingMedium: false,
                            showColTemperingTemp: false,
                            showColTemperingTime: false,
                            showColStressRelieved: false,
                            showColTemperingResult: false,
                            showColImpactJ: false,
                            showColAvgImpactJ: false,
                            showColImpactTemp: false,
                            showColPren: false,
                            showColStressUnderProofload: false,
                            showColPb: false,
                            showColZn: false,
                            showColFe: false,
                            showColSn: false,
                            showImpurity: false,
                            showOther: false,
                          })}
                          className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded border border-slate-300 transition-colors cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-1 text-[10.5px]">
                      {/* Section & Chemical Optional Toggles */}
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                        <input type="checkbox" checked={formData.showMacroEtch === true} onChange={(e) => setFormData({ ...formData, showMacroEtch: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Macro Etch</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                        <input type="checkbox" checked={formData.showHeatTreatment === true} onChange={(e) => setFormData({ ...formData, showHeatTreatment: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Heat Treatment Sec.</span>
                      </label>

                      {/* Chemical Element Toggles */}
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Pb Lead column in Chemical Composition">
                        <input
                          type="checkbox"
                          checked={formData.showColPb !== undefined ? formData.showColPb : (formData.chemicalData || formData.items || []).some(r => {
                            const v = r.chem?.pb ?? r.pb;
                            return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                          })}
                          onChange={(e) => setFormData({ ...formData, showColPb: e.target.checked })}
                          className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <span>%Pb (Lead)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Zn Zinc column in Chemical Composition">
                        <input
                          type="checkbox"
                          checked={formData.showColZn !== undefined ? formData.showColZn : (formData.chemicalData || formData.items || []).some(r => {
                            const v = r.chem?.zn ?? r.zn;
                            return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                          })}
                          onChange={(e) => setFormData({ ...formData, showColZn: e.target.checked })}
                          className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <span>%Zn (Zinc)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Fe Iron column in Chemical Composition">
                        <input
                          type="checkbox"
                          checked={formData.showColFe !== undefined ? formData.showColFe : (formData.chemicalData || formData.items || []).some(r => {
                            const v = r.chem?.fe ?? r.fe;
                            return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                          })}
                          onChange={(e) => setFormData({ ...formData, showColFe: e.target.checked })}
                          className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <span>%Fe (Iron)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Sn Tin column in Chemical Composition">
                        <input
                          type="checkbox"
                          checked={formData.showColSn !== undefined ? formData.showColSn : (formData.chemicalData || formData.items || []).some(r => {
                            const v = r.chem?.sn ?? r.sn;
                            return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                          })}
                          onChange={(e) => setFormData({ ...formData, showColSn: e.target.checked })}
                          className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <span>%Sn (Tin)</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                        <input type="checkbox" checked={!!formData.showImpurity} onChange={(e) => setFormData({ ...formData, showImpurity: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Impurity</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                        <input type="checkbox" checked={!!formData.showOther} onChange={(e) => setFormData({ ...formData, showOther: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Other</span>
                      </label>

                      {/* Mechanical Column Toggles */}
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColStressUnderProofload ?? false} onChange={(e) => setFormData({ ...formData, showColStressUnderProofload: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Stress Under Proofload</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColHeatTreatment ?? true} onChange={(e) => setFormData({ ...formData, showColHeatTreatment: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Heat Treatment</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColHardness24Hr ?? true} onChange={(e) => setFormData({ ...formData, showColHardness24Hr: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Hardness after treatment</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColQuenchingTemp ?? true} onChange={(e) => setFormData({ ...formData, showColQuenchingTemp: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Quenching Temp</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColQuenchingTime ?? true} onChange={(e) => setFormData({ ...formData, showColQuenchingTime: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Holding Time (Quench)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColQuenchingMedium ?? true} onChange={(e) => setFormData({ ...formData, showColQuenchingMedium: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span className="text-amber-900 font-bold">Quenching Medium</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColTemperingTemp ?? false} onChange={(e) => setFormData({ ...formData, showColTemperingTemp: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Temper Temp</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColTemperingTime ?? false} onChange={(e) => setFormData({ ...formData, showColTemperingTime: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Holding time (Temper)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColStressRelieved ?? true} onChange={(e) => setFormData({ ...formData, showColStressRelieved: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Stress relived</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColTemperingResult ?? false} onChange={(e) => setFormData({ ...formData, showColTemperingResult: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Temper</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColImpactJ ?? true} onChange={(e) => setFormData({ ...formData, showColImpactJ: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Impact in J</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColAvgImpactJ ?? true} onChange={(e) => setFormData({ ...formData, showColAvgImpactJ: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Average Impact in J</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColImpactTemp ?? true} onChange={(e) => setFormData({ ...formData, showColImpactTemp: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span>Impact Test Temp</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer font-semibold text-amber-900 hover:text-amber-700 select-none">
                        <input type="checkbox" checked={formData.showColPren ?? false} onChange={(e) => setFormData({ ...formData, showColPren: e.target.checked })} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                        <span className="font-bold">PREN</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-black mb-1 overflow-x-auto bg-white">
                    <table className="w-full text-center border-collapse font-sans table-fixed min-w-[1200px] bg-white">
                      <thead>
                        <tr className="bg-white border-b border-black">
                          <th className="border border-black p-1 text-[12px] sm:text-[13px] font-black uppercase tracking-wider bg-white text-black py-1 text-center" colSpan={
                            9
                            + ((formData.showColStressUnderProofload ?? false) ? 1 : 0)
                            + ((formData.showColHeatTreatment ?? true) ? 1 : 0)
                            + ((formData.showColHardness24Hr ?? true) ? 1 : 0)
                            + ((formData.showColQuenchingTemp ?? true) ? 1 : 0)
                            + ((formData.showColQuenchingTime ?? true) ? 1 : 0)
                            + ((formData.showColQuenchingMedium ?? true) ? 1 : 0)
                            + ((formData.showColTemperingTemp ?? false) ? 1 : 0)
                            + ((formData.showColTemperingTime ?? false) ? 1 : 0)
                            + ((formData.showColStressRelieved ?? true) ? 1 : 0)
                            + ((formData.showColTemperingResult ?? false) ? 1 : 0)
                            + ((formData.showColImpactJ ?? true) ? 1 : 0)
                            + ((formData.showColAvgImpactJ ?? true) ? 1 : 0)
                            + ((formData.showColImpactTemp ?? true) ? 1 : 0)
                            + ((formData.showColPren ?? false) ? 1 : 0)
                          }>MECHANICAL PROPERTIES</th>
                        </tr>
                        <tr className="bg-white border-b border-black font-bold text-[8px] sm:text-[8.5px] leading-tight text-black">
                          <th className="border border-black p-0.5 w-[2.2%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelSrNo, 'Sr. No.')}
                              onChange={(e) => setFormData({ ...formData, labelSrNo: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Sr. No header"
                            />
                          </th>
                          <th className="border border-black p-0.5 w-[8.5%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelHeatNo, 'Heat No')}
                              onChange={(e) => setFormData({ ...formData, labelHeatNo: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Heat No header"
                            />
                          </th>
                          <th className="border border-black p-0.5 w-[6.2%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelTensileStrength, 'Tensile Strength UTS–Ksi')}
                              onChange={(e) => setFormData({ ...formData, labelTensileStrength: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Tensile Strength header"
                            />
                          </th>
                          <th className="border border-black p-0.5 w-[6.2%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelYieldStrength, 'Yield Strength YS–Ksi')}
                              onChange={(e) => setFormData({ ...formData, labelYieldStrength: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Yield Strength header"
                            />
                          </th>
                          <th className="border border-black p-0.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelElongation, 'Elongation El–(%)')}
                              onChange={(e) => setFormData({ ...formData, labelElongation: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Elongation header"
                            />
                          </th>
                          <th className="border border-black p-0.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelReductionArea, 'Red. of Area Ra–(%)')}
                              onChange={(e) => setFormData({ ...formData, labelReductionArea: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Reduction of Area header"
                            />
                          </th>
                          <th className="border border-black p-0.5 w-[5.2%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelProofload, 'Proofload Lbf')}
                              onChange={(e) => setFormData({ ...formData, labelProofload: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Proofload header"
                            />
                          </th>
                          {(formData.showColStressUnderProofload ?? false) && (
                            <th className="border border-black p-0.5 w-[6.2%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelStressUnderProofload, 'Stress Under Proofload Mpa')}
                                onChange={(e) => setFormData({ ...formData, labelStressUnderProofload: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Stress Under Proofload header"
                              />
                            </th>
                          )}
                          {(formData.showColHeatTreatment ?? true) && (
                            <th className="border border-black p-0.5 w-[4.8%] text-center align-middle bg-white whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelHeatTreatment, 'Heat Treatment')}
                                onChange={(e) => setFormData({ ...formData, labelHeatTreatment: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Heat Treatment header"
                              />
                            </th>
                          )}
                          <th className="border border-black p-0.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight">
                            <textarea
                              rows={2}
                              value={toTitleCaseMechHeader(formData.labelHardness, 'Hardness')}
                              onChange={(e) => setFormData({ ...formData, labelHardness: e.target.value })}
                              className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                              title="Click to edit Hardness header"
                            />
                          </th>
                          {(formData.showColHardness24Hr ?? true) && (
                            <th className="border border-black p-0.5 w-[7.5%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelHardness24Hr, 'Hardness After 24 Hr Treatment at 540°C')}
                                onChange={(e) => setFormData({ ...formData, labelHardness24Hr: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Hardness After Treatment header"
                              />
                            </th>
                          )}
                          {(formData.showColQuenchingTemp ?? true) && (
                            <th className="border border-black p-0.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelQuenchingTemp, 'Quenching Temp. °C')}
                                onChange={(e) => setFormData({ ...formData, labelQuenchingTemp: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Quenching Temp header"
                              />
                            </th>
                          )}
                          {(formData.showColQuenchingTime ?? true) && (
                            <th className="border border-black p-0.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelQuenchingTime, 'Holding Time')}
                                onChange={(e) => setFormData({ ...formData, labelQuenchingTime: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Holding Time header"
                              />
                            </th>
                          )}
                          {(formData.showColQuenchingMedium ?? true) && (
                            <th className="border border-black p-0.5 w-[4.8%] text-center align-middle bg-white whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelQuenchingMedium, 'Quenching Medium')}
                                onChange={(e) => setFormData({ ...formData, labelQuenchingMedium: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Quenching Medium header"
                              />
                            </th>
                          )}
                          {(formData.showColTemperingTemp ?? false) && (
                            <th className="border border-black p-0.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelTemperingTemp, 'Tempering Temp. °C')}
                                onChange={(e) => setFormData({ ...formData, labelTemperingTemp: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Tempering Temp header"
                              />
                            </th>
                          )}
                          {(formData.showColTemperingTime ?? false) && (
                            <th className="border border-black p-0.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelTemperingTime, 'Holding Time')}
                                onChange={(e) => setFormData({ ...formData, labelTemperingTime: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Holding Time header"
                              />
                            </th>
                          )}
                          {(formData.showColStressRelieved ?? true) && (
                            <th className="border border-black p-0.5 w-[4.8%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelStressRelieved, 'Stress Relieved °C')}
                                onChange={(e) => setFormData({ ...formData, labelStressRelieved: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Stress Relieved header"
                              />
                            </th>
                          )}
                          {(formData.showColTemperingResult ?? false) && (
                            <th className="border border-black p-0.5 w-[3.8%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelTemperingResult, 'Temper')}
                                onChange={(e) => setFormData({ ...formData, labelTemperingResult: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Temper header"
                              />
                            </th>
                          )}
                          {(formData.showColImpactJ ?? true) && (
                            <th className="border border-black p-0.5 w-[3.8%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelImpactJ, 'Impact in "J"')}
                                onChange={(e) => setFormData({ ...formData, labelImpactJ: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Impact in J header"
                              />
                            </th>
                          )}
                          {(formData.showColAvgImpactJ ?? true) && (
                            <th className="border border-black p-0.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelAvgImpactJ, 'Average Impact in "J"')}
                                onChange={(e) => setFormData({ ...formData, labelAvgImpactJ: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Avg Impact header"
                              />
                            </th>
                          )}
                          {(formData.showColImpactTemp ?? true) && (
                            <th className="border border-black p-0.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelImpactTemp, 'Impact Test Temp °C')}
                                onChange={(e) => setFormData({ ...formData, labelImpactTemp: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit Impact Test Temp header"
                              />
                            </th>
                          )}
                          {(formData.showColPren ?? false) && (
                            <th className="border border-black p-0.5 w-[4.2%] text-center align-middle whitespace-normal break-words leading-tight">
                              <textarea
                                rows={2}
                                value={toTitleCaseMechHeader(formData.labelPren, 'Pren')}
                                onChange={(e) => setFormData({ ...formData, labelPren: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 resize-none leading-tight whitespace-normal break-words min-h-[42px]"
                                title="Click to edit PREN header"
                              />
                            </th>
                          )}
                          <th className="border border-black p-0.5 w-[9.5%] text-center align-middle bg-white">
                            <div className="flex items-center justify-center font-bold text-black py-0.5">
                              <input
                                type="text"
                                value={toTitleCaseMechHeader(formData.labelMarking, 'Marking')}
                                onChange={(e) => setFormData({ ...formData, labelMarking: e.target.value })}
                                className="w-full text-center bg-transparent border-b border-slate-300 hover:border-amber-500 focus:border-amber-600 focus:bg-white font-bold text-[8px] sm:text-[8.5px] p-0.5 leading-tight"
                                title="Click to edit Marking header"
                              />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((it, idx) => {
                          const m = formData.mechanicalData?.[idx] || {};
                          const t2Cols = getT2Columns(formData);
                          return (
                            <tr
                              key={idx}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'mechanical' });
                              }}
                              className="border-b border-black font-mono text-[7.5px] sm:text-[8px] hover:bg-amber-50/40 transition-colors"
                            >
                              <td
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'mechanical' });
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMtc1RowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'mechanical' });
                                }}
                                className="border border-black p-0.5 font-bold font-sans text-center align-middle select-none cursor-pointer hover:bg-amber-200 transition-colors"
                                title="Click or Right-Click for Row Options (Add/Duplicate/Delete across all tables)"
                              >
                                {m.itemNo || it.itemNo || (idx + 1)}
                              </td>
                              <td className="border border-black p-0.5 font-sans font-normal text-[7.5px] sm:text-[8px] break-words whitespace-normal leading-tight px-1 max-w-[90px] [overflow-wrap:anywhere] [word-break:break-word] text-center">{m.heatNo || it.heatNo}</td>
                              <td className="border border-black p-0.2">
                                <input
                                  id={`t2-cell-${idx}-utsKsi`}
                                  type="text"
                                  value={m.utsKsi || m.tsMpa || ''}
                                  onChange={(e) => handleUpdateMechanicalRow(idx, 'utsKsi', e.target.value)}
                                  onKeyDown={(e) => handleT2KeyDown(e, idx, 'utsKsi')}
                                  onPaste={(e) => handleT2Paste(e, idx, 'utsKsi')}
                                  className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('utsKsi')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                />
                              </td>
                              <td className="border border-black p-0.2">
                                <input
                                  id={`t2-cell-${idx}-ysKsi`}
                                  type="text"
                                  value={m.ysKsi || m.ysMpa || ''}
                                  onChange={(e) => handleUpdateMechanicalRow(idx, 'ysKsi', e.target.value)}
                                  onKeyDown={(e) => handleT2KeyDown(e, idx, 'ysKsi')}
                                  onPaste={(e) => handleT2Paste(e, idx, 'ysKsi')}
                                  className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('ysKsi')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                />
                              </td>
                              <td className="border border-black p-0.2">
                                <input
                                  id={`t2-cell-${idx}-elPct`}
                                  type="text"
                                  value={m.elPct || ''}
                                  onChange={(e) => handleUpdateMechanicalRow(idx, 'elPct', e.target.value)}
                                  onKeyDown={(e) => handleT2KeyDown(e, idx, 'elPct')}
                                  onPaste={(e) => handleT2Paste(e, idx, 'elPct')}
                                  className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('elPct')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                />
                              </td>
                              <td className="border border-black p-0.2">
                                <input
                                  id={`t2-cell-${idx}-raPct`}
                                  type="text"
                                  value={m.raPct || ''}
                                  onChange={(e) => handleUpdateMechanicalRow(idx, 'raPct', e.target.value)}
                                  onKeyDown={(e) => handleT2KeyDown(e, idx, 'raPct')}
                                  onPaste={(e) => handleT2Paste(e, idx, 'raPct')}
                                  className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('raPct')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                />
                              </td>
                              <td className="border border-black p-0.2">
                                <input
                                  id={`t2-cell-${idx}-proofLoadLbf`}
                                  type="text"
                                  value={m.proofLoadLbf || ''}
                                  onChange={(e) => handleUpdateMechanicalRow(idx, 'proofLoadLbf', e.target.value)}
                                  onKeyDown={(e) => handleT2KeyDown(e, idx, 'proofLoadLbf')}
                                  onPaste={(e) => handleT2Paste(e, idx, 'proofLoadLbf')}
                                  className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('proofLoadLbf')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                />
                              </td>
                              {(formData.showColStressUnderProofload ?? false) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-stressUnderProofloadMpa`}
                                    type="text"
                                    value={m.stressUnderProofloadMpa || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'stressUnderProofloadMpa', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'stressUnderProofloadMpa')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'stressUnderProofloadMpa')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('stressUnderProofloadMpa')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColHeatTreatment ?? true) && (
                                <td className="border border-black p-0.2 bg-amber-50/30">
                                  <input
                                    id={`t2-cell-${idx}-heatTreatment`}
                                    type="text"
                                    value={m.heatTreatment || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'heatTreatment', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'heatTreatment')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'heatTreatment')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-sans font-normal text-[7.5px] sm:text-[8px] text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase ${isT2CellSelected(idx, t2Cols.indexOf('heatTreatment')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              <td className="border border-black p-0.2">
                                <input
                                  id={`t2-cell-${idx}-hardness`}
                                  type="text"
                                  value={m.hardness || m.hardnessHbw || ''}
                                  onChange={(e) => handleUpdateMechanicalRow(idx, 'hardness', e.target.value)}
                                  onKeyDown={(e) => handleT2KeyDown(e, idx, 'hardness')}
                                  onPaste={(e) => handleT2Paste(e, idx, 'hardness')}
                                  className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('hardness')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                />
                              </td>
                              {(formData.showColHardness24Hr ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-hardness24Hr540C`}
                                    type="text"
                                    value={m.hardness24Hr540C || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'hardness24Hr540C', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'hardness24Hr540C')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'hardness24Hr540C')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('hardness24Hr540C')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColQuenchingTemp ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-quenchingTempC`}
                                    type="text"
                                    value={m.quenchingTempC || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'quenchingTempC', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'quenchingTempC')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'quenchingTempC')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('quenchingTempC')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColQuenchingTime ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-quenchingHoldingTime`}
                                    type="text"
                                    value={m.quenchingHoldingTime || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'quenchingHoldingTime', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'quenchingHoldingTime')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'quenchingHoldingTime')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase ${isT2CellSelected(idx, t2Cols.indexOf('quenchingHoldingTime')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColQuenchingMedium ?? true) && (
                                <td className="border border-black p-0.2 bg-amber-50/30">
                                  <input
                                    id={`t2-cell-${idx}-quenchingMedium`}
                                    type="text"
                                    value={m.quenchingMedium || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'quenchingMedium', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'quenchingMedium')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'quenchingMedium')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase ${isT2CellSelected(idx, t2Cols.indexOf('quenchingMedium')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColTemperingTemp ?? false) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-temperingTempC`}
                                    type="text"
                                    value={m.temperingTempC || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'temperingTempC', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'temperingTempC')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'temperingTempC')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('temperingTempC')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColTemperingTime ?? false) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-temperingHoldingTime`}
                                    type="text"
                                    value={m.temperingHoldingTime || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'temperingHoldingTime', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'temperingHoldingTime')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'temperingHoldingTime')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase ${isT2CellSelected(idx, t2Cols.indexOf('temperingHoldingTime')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColStressRelieved ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-stressRelievedC`}
                                    type="text"
                                    value={m.stressRelievedC || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'stressRelievedC', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'stressRelievedC')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'stressRelievedC')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('stressRelievedC')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColTemperingResult ?? false) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-temperingResult`}
                                    type="text"
                                    value={m.temperingResult || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'temperingResult', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'temperingResult')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'temperingResult')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded uppercase ${isT2CellSelected(idx, t2Cols.indexOf('temperingResult')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColImpactJ ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-impactJ`}
                                    type="text"
                                    value={m.impactJ || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'impactJ', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'impactJ')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'impactJ')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('impactJ')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColAvgImpactJ ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-avgImpactJ`}
                                    type="text"
                                    value={m.avgImpactJ || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'avgImpactJ', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'avgImpactJ')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'avgImpactJ')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('avgImpactJ')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColImpactTemp ?? true) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-impactTempC`}
                                    type="text"
                                    value={m.impactTempC || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'impactTempC', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'impactTempC')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'impactTempC')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('impactTempC')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              {(formData.showColPren ?? false) && (
                                <td className="border border-black p-0.2">
                                  <input
                                    id={`t2-cell-${idx}-pren`}
                                    type="text"
                                    value={m.pren || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'pren', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'pren')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'pren')}
                                    className={`w-full p-0.5 text-center bg-transparent border-0 font-normal text-slate-900 text-[7.5px] sm:text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded ${isT2CellSelected(idx, t2Cols.indexOf('pren')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                  />
                                </td>
                              )}
                              <td className="border border-black p-0.2 min-w-[100px]">
                                <div className="flex items-center justify-start gap-1 p-0.5">
                                  {/* Left: Marking Image or Upload Button */}
                                  {m.markingImage ? (
                                    <div className="relative group shrink-0 flex items-center">
                                      <img src={m.markingImage} alt="Marking" className="h-[12px] max-w-[24px] object-contain border border-amber-300 rounded bg-white shrink-0" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedMech = [...(formData.mechanicalData || [])];
                                          if (updatedMech[idx]) {
                                            delete updatedMech[idx].markingImage;
                                            setFormData({ ...formData, mechanicalData: updatedMech });
                                          }
                                        }}
                                        className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-[6.5px] font-bold shadow hover:bg-rose-700 cursor-pointer"
                                        title="Remove Row Image"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <label
                                      className="p-0.5 hover:bg-amber-100 rounded cursor-pointer text-amber-700 hover:text-amber-900 transition-colors shrink-0 flex items-center justify-center"
                                      title="Upload Marking Image or Text for this row"
                                    >
                                      <Upload className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      <input
                                        type="file"
                                        accept="image/*,.txt,.csv"
                                        onChange={(e) => {
                                          if (e.target.files?.[0]) handleRowMarkingUpload(idx, e.target.files[0]);
                                          e.target.value = '';
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  )}

                                  {/* Right: Marking Text Input */}
                                  <input
                                    id={`t2-cell-${idx}-marking`}
                                    type="text"
                                    value={m.marking || ''}
                                    onChange={(e) => handleUpdateMechanicalRow(idx, 'marking', e.target.value)}
                                    onKeyDown={(e) => handleT2KeyDown(e, idx, 'marking')}
                                    onPaste={(e) => handleT2Paste(e, idx, 'marking')}
                                    className={`flex-1 min-w-0 p-0.5 text-left bg-transparent border-0 font-sans font-normal text-slate-900 text-[7.5px] sm:text-[8px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded placeholder:text-slate-400 ${isT2CellSelected(idx, t2Cols.indexOf('marking')) ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                    placeholder="MARKING"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 5. TABLE 3: MACRO ETCH TABLE (OPTIONAL TOGGLE) */}
                  {formData.showMacroEtch === true && (
                    <div className="mb-1 border border-black p-1 bg-white">
                      <div className="font-black text-[9px] tracking-wider mb-0.5 text-black">Macro Etch</div>
                      <table className="w-full border-collapse border border-black text-[7.5px] text-center table-fixed bg-white">
                        <thead>
                          <tr className="bg-white border-b border-black font-black text-[8px]">
                            <th className="border border-black p-0.5 w-[15%]">Division</th>
                            <th className="border border-black p-0.5 w-[22%]">Surface Condition</th>
                            <th className="border border-black p-0.5 w-[22%]">Random Condition</th>
                            <th className="border border-black p-0.5 w-[22%]">Center Segregation</th>
                            <th className="border border-black p-0.5 w-[19%]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 font-bold bg-white">Spec.</td>
                            <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchSpecSurface || 'S2'} onChange={(e) => setFormData({ ...formData, macroEtchSpecSurface: e.target.value })} className="w-full text-center bg-transparent font-bold border-0" /></td>
                            <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchSpecRandom || 'R2'} onChange={(e) => setFormData({ ...formData, macroEtchSpecRandom: e.target.value })} className="w-full text-center bg-transparent font-bold border-0" /></td>
                            <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchSpecCenter || 'C3'} onChange={(e) => setFormData({ ...formData, macroEtchSpecCenter: e.target.value })} className="w-full text-center bg-transparent font-bold border-0" /></td>
                            <td className="border border-black p-0.5"></td>
                          </tr>
                          <tr>
                            <td className="border border-black p-0.5 font-bold bg-white">Results</td>
                            <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchResultSurface || 'S2'} onChange={(e) => setFormData({ ...formData, macroEtchResultSurface: e.target.value })} className="w-full text-center bg-transparent font-black text-[8.5px] border-0" /></td>
                            <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchResultRandom || 'R2'} onChange={(e) => setFormData({ ...formData, macroEtchResultRandom: e.target.value })} className="w-full text-center bg-transparent font-black text-[8.5px] border-0" /></td>
                            <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchResultCenter || 'C3'} onChange={(e) => setFormData({ ...formData, macroEtchResultCenter: e.target.value })} className="w-full text-center bg-transparent font-black text-[8.5px] border-0" /></td>
                            <td className="border border-black p-0.5"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 6. BOX 4: *HEAT TREATMENT (OPTIONAL TOGGLE) */}
                  {formData.showHeatTreatment === true && (
                    <div className="border border-black mb-1 text-[9.5px] bg-white">
                      <div className="font-black p-1 px-1.5 border-b border-black text-[10px] text-black bg-white">
                        *Heat Treatment
                      </div>
                      <div className="p-1.5 space-y-1 font-sans leading-tight text-[9.5px]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                          <span className="w-48 font-bold text-slate-900 text-[9.5px]">Carbide Solution treated :</span>
                          <input type="text" value={formData.heatTreatmentCarbide || 'Was treated by raw material factory'} onChange={(e) => setFormData({ ...formData, heatTreatmentCarbide: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                          <span className="w-48 font-bold text-slate-900 text-[9.5px]">Strain Hardened :</span>
                          <input type="text" value={formData.heatTreatmentStrain || 'Was treated'} onChange={(e) => setFormData({ ...formData, heatTreatmentStrain: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                          <span className="w-48 font-bold text-slate-900 text-[9.5px]">Quenching :</span>
                          <input type="text" value={formData.heatTreatmentQuenching || 'N/A'} onChange={(e) => setFormData({ ...formData, heatTreatmentQuenching: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                          <span className="w-48 font-bold text-slate-900 text-[9.5px]">Tempering :</span>
                          <input type="text" value={formData.heatTreatmentTempering || 'N/A'} onChange={(e) => setFormData({ ...formData, heatTreatmentTempering: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. BOX 5: ADDITIONAL TECHNICAL INFORMATION (WITH EDITABLE LEFT TITLES & + ADD LINE BUTTON) */}
                  <div className="border border-black mb-1 text-[9.5px] bg-white">
                    <div className="font-black p-1 px-1.5 border-b border-black text-[10px] text-black bg-white flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>Additional Technical Information:-</span>
                        <span className="text-[8px] font-semibold text-slate-500 normal-case">(Left titles and right values are editable)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newLine = {
                            id: `tech_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                            label: 'Additional Inspection',
                            text: 'Found satisfactory / As per standard requirement.',
                            enabled: true
                          };
                          const updated = [...(formData.customTechInfoLines || []), newLine];
                          setFormData({ ...formData, customTechInfoLines: updated });
                        }}
                        className="flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded cursor-pointer transition-colors shadow-xs"
                        title="Add custom line to Additional Technical Information"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Line</span>
                      </button>
                    </div>
                    <div className="p-1.5 space-y-1 font-sans leading-tight text-[9.5px]">
                      {/* Visual Inspection */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoVisual !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoVisual: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Visual Inspection"
                        />
                        <input
                          type="text"
                          value={formData.techInfoVisualLabel ?? 'Visual Inspection'}
                          onChange={(e) => setFormData({ ...formData, techInfoVisualLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Visual Inspection"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoVisual || 'Found to be free from crack, flaws, sharp edges and other defects.'}
                          onChange={(e) => setFormData({ ...formData, techInfoVisual: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Thread acceptability */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoThread !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoThread: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Thread acceptability"
                        />
                        <input
                          type="text"
                          value={formData.techInfoThreadLabel ?? 'Thread acceptability'}
                          onChange={(e) => setFormData({ ...formData, techInfoThreadLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Thread acceptability"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoThread || 'has been inspected as per ASME B1.1 CL 2A and found ok.'}
                          onChange={(e) => setFormData({ ...formData, techInfoThread: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Gauge Fit */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoGauge !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoGauge: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Gauge Fit"
                        />
                        <input
                          type="text"
                          value={formData.techInfoGaugeLabel ?? 'Gauge Fit'}
                          onChange={(e) => setFormData({ ...formData, techInfoGaugeLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Gauge Fit"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoGauge || 'Inspection using 6g GO gauge and 6g NO GO gauge,'}
                          onChange={(e) => setFormData({ ...formData, techInfoGauge: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Dimensions */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoDimensions !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoDimensions: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Dimensions"
                        />
                        <input
                          type="text"
                          value={formData.techInfoDimensionsLabel ?? 'Dimensions'}
                          onChange={(e) => setFormData({ ...formData, techInfoDimensionsLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Dimensions"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoDimensions || 'Found Satisfactory/ As per Standard requirement.'}
                          onChange={(e) => setFormData({ ...formData, techInfoDimensions: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Heat Treatment */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoHeatTreatment !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoHeatTreatment: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Heat Treatment Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoHeatTreatmentLabel ?? 'Heat Treatment'}
                          onChange={(e) => setFormData({ ...formData, techInfoHeatTreatmentLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Heat Treatment"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoHeatTreatment || 'Quenched Liquid & tempered.'}
                          onChange={(e) => setFormData({ ...formData, techInfoHeatTreatment: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* HDG */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoHdg !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoHdg: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle HDG"
                        />
                        <input
                          type="text"
                          value={formData.techInfoHdgLabel ?? 'HDG'}
                          onChange={(e) => setFormData({ ...formData, techInfoHdgLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="HDG"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoHdg || 'As per ASTM A153 CL-C found satisfactory.'}
                          onChange={(e) => setFormData({ ...formData, techInfoHdg: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* GI */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoGi === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoGi: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle GI Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoGiLabel ?? 'GI'}
                          onChange={(e) => setFormData({ ...formData, techInfoGiLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="GI"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoGi || 'As per ASTM B633 Found satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoGi: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Galv */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoGalv === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoGalv: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Galv Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoGalvLabel ?? 'Galv'}
                          onChange={(e) => setFormData({ ...formData, techInfoGalvLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Galv"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoGalv || 'As per ASTM B633 Found satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoGalv: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Self */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoSelf === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoSelf: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Self Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoSelfLabel ?? 'Self'}
                          onChange={(e) => setFormData({ ...formData, techInfoSelfLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Self"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoSelf || 'Found satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoSelf: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Yellow */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoYellow === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoYellow: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Yellow Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoYellowLabel ?? 'Yellow'}
                          onChange={(e) => setFormData({ ...formData, techInfoYellowLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Yellow"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoYellow || 'Found Satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoYellow: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Cadmium Plating */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoCadmium === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoCadmium: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Cadmium Plating Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoCadmiumLabel ?? 'Cadmium Plating'}
                          onChange={(e) => setFormData({ ...formData, techInfoCadmiumLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Cadmium Plating"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoCadmium || 'Found satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoCadmium: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Nickel Plating */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoNickel === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoNickel: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Nickel Plating Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoNickelLabel ?? 'Nickel Plating'}
                          onChange={(e) => setFormData({ ...formData, techInfoNickelLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Nickel Plating"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoNickel || 'Found satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoNickel: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Fluropolymer coating */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoFluropolymer === true}
                          onChange={(e) => setFormData({ ...formData, showTechInfoFluropolymer: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle Fluropolymer coating Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoFluropolymerLabel ?? 'Fluropolymer coating'}
                          onChange={(e) => setFormData({ ...formData, techInfoFluropolymerLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="Fluropolymer coating"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoFluropolymer || 'Found satisfactory'}
                          onChange={(e) => setFormData({ ...formData, techInfoFluropolymer: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* PTFE BLUE (XYLAN 1070) */}
                      <div className="space-y-1 bg-amber-50/40 p-1.5 rounded border border-amber-200/60">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={formData.showTechInfoPtfeBlue === true}
                            onChange={(e) => setFormData({ ...formData, showTechInfoPtfeBlue: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                            title="Toggle PTFE BLUE Line"
                          />
                          <span className="text-[9.5px] font-bold text-slate-800 shrink-0">Title:</span>
                          <input
                            type="text"
                            value={formData.techInfoPtfeBlueTitle || 'PTFE BLUE (XYLAN 1070)'}
                            onChange={(e) => setFormData({ ...formData, techInfoPtfeBlueTitle: e.target.value })}
                            className="font-bold text-[9.5px] flex-1 p-0.5 bg-transparent border-b border-slate-300 focus:border-amber-600 text-slate-900"
                            placeholder="PTFE BLUE Title..."
                          />
                        </div>
                        {formData.showTechInfoPtfeBlue && (
                          <div className="pl-5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                              <input
                                type="text"
                                value={formData.techInfoPtfeBlue || 'Found Satisfactory'}
                                onChange={(e) => setFormData({ ...formData, techInfoPtfeBlue: e.target.value })}
                                className="flex-1 p-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-semibold text-slate-900"
                                placeholder="Status (e.g. Found Satisfactory)..."
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                              <input
                                type="text"
                                value={formData.techInfoPtfeBlueTemp || 'The material can withstand the temperature range of -50°C to +200°C'}
                                onChange={(e) => setFormData({ ...formData, techInfoPtfeBlueTemp: e.target.value })}
                                className="flex-1 p-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-semibold text-slate-900"
                                placeholder="Temperature note..."
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* NACE Compliance */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="checkbox"
                          checked={formData.showTechInfoNace !== false}
                          onChange={(e) => setFormData({ ...formData, showTechInfoNace: e.target.checked })}
                          className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                          title="Toggle NACE Compliance Line"
                        />
                        <input
                          type="text"
                          value={formData.techInfoNaceLabel ?? 'NACE Compliance'}
                          onChange={(e) => setFormData({ ...formData, techInfoNaceLabel: e.target.value })}
                          className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                          placeholder="NACE Compliance"
                        />
                        <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                        <input
                          type="text"
                          value={formData.techInfoNace || 'We hereby confirm that the material Complies to NACE MR/0175/ ISO 15156-2 requirements.'}
                          onChange={(e) => setFormData({ ...formData, techInfoNace: e.target.value })}
                          className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
                        />
                      </div>

                      {/* Custom dynamically added lines */}
                      {formData.customTechInfoLines?.map((line, customIdx) => (
                        <div key={line.id} className="flex items-center gap-1.5 bg-amber-50/50 p-1 rounded border border-amber-200/70">
                          <input
                            type="checkbox"
                            checked={line.enabled !== false}
                            onChange={(e) => {
                              const updated = [...(formData.customTechInfoLines || [])];
                              updated[customIdx].enabled = e.target.checked;
                              setFormData({ ...formData, customTechInfoLines: updated });
                            }}
                            className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                            title="Toggle custom line"
                          />
                          <input
                            type="text"
                            value={line.label}
                            onChange={(e) => {
                              const updated = [...(formData.customTechInfoLines || [])];
                              updated[customIdx].label = e.target.value;
                              setFormData({ ...formData, customTechInfoLines: updated });
                            }}
                            className="font-bold w-44 text-[9.5px] p-0.5 bg-white border border-slate-300 focus:border-amber-500 rounded text-slate-900"
                            placeholder="Title (e.g. Ultrasonic Test)"
                          />
                          <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                          <input
                            type="text"
                            value={line.text}
                            onChange={(e) => {
                              const updated = [...(formData.customTechInfoLines || [])];
                              updated[customIdx].text = e.target.value;
                              setFormData({ ...formData, customTechInfoLines: updated });
                            }}
                            className="flex-1 p-0.5 bg-white border border-slate-300 rounded text-[9.5px] font-medium text-slate-900"
                            placeholder="Inspection status / note..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.customTechInfoLines || []).filter((_, i) => i !== customIdx);
                              setFormData({ ...formData, customTechInfoLines: updated });
                            }}
                            className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1 cursor-pointer shrink-0"
                            title="Delete line"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 8. CERTIFICATION STATEMENT & SIGNATURE / STAMP BLOCK */}
                  <div className="pt-1.5 border-t border-black space-y-2 bg-white">
                    <textarea
                      rows={2}
                      value={formData.remarks || "We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer's specification(s), and that they satisfy the requirements."}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full p-1 bg-amber-50/30 border border-amber-200 rounded text-[7.5px] font-bold text-black leading-snug"
                    />

                    {/* SIGNATURE & STAMP SIZE & POSITION ADJUSTER IN LIVE EDITOR */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/80 p-2 rounded border border-amber-200 text-[10px] print:hidden">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <span className="text-[11px]">✍️</span>
                        <span>Sign & Stamp Adjuster (Drag image to move, or use sliders):</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-700 font-semibold">Prepared Sign:</span>
                          <input
                            type="range"
                            min={28}
                            max={160}
                            step={2}
                            value={formData.preparedSignHeight || formData.signatureHeight || 72}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormData(prev => ({ ...prev, preparedSignHeight: val }));
                              saveAsset('preparedSignHeight', val);
                            }}
                            className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded"
                            title="Adjust Prepared By Signature height"
                          />
                          <span className="font-mono text-[9px] font-bold text-amber-900 w-7">{formData.preparedSignHeight || formData.signatureHeight || 72}px</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-700 font-semibold">Approved Sign:</span>
                          <input
                            type="range"
                            min={28}
                            max={160}
                            step={2}
                            value={formData.approvedSignHeight || formData.signatureHeight || 72}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormData(prev => ({ ...prev, approvedSignHeight: val }));
                              saveAsset('approvedSignHeight', val);
                            }}
                            className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded"
                            title="Adjust Approved By Signature height"
                          />
                          <span className="font-mono text-[9px] font-bold text-amber-900 w-7">{formData.approvedSignHeight || formData.signatureHeight || 72}px</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-700 font-semibold">Stamp Size:</span>
                          <input
                            type="range"
                            min={36}
                            max={180}
                            step={2}
                            value={formData.stampHeight || 90}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormData(prev => ({ ...prev, stampHeight: val }));
                              saveAsset('stampHeight', val);
                            }}
                            className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded"
                            title="Adjust Stamp height"
                          />
                          <span className="font-mono text-[9px] font-bold text-amber-900 w-7">{formData.stampHeight || 90}px</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              preparedSignHeight: 72,
                              approvedSignHeight: 72,
                              stampHeight: 90,
                              preparedSignPosX: 0,
                              preparedSignPosY: 0,
                              approvedSignPosX: 0,
                              approvedSignPosY: 0,
                              stampPosX: 0,
                              stampPosY: 0,
                            }));
                            saveAsset('preparedSignHeight', 72);
                            saveAsset('approvedSignHeight', 72);
                            saveAsset('stampHeight', 90);
                            saveAsset('preparedSignPosX', 0);
                            saveAsset('preparedSignPosY', 0);
                            saveAsset('approvedSignPosX', 0);
                            saveAsset('approvedSignPosY', 0);
                            saveAsset('stampPosX', 0);
                            saveAsset('stampPosY', 0);
                          }}
                          className="text-[9px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer ml-1"
                        >
                          Reset All
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                      {/* LEFT SIGNATURE AREA - PREPARED BY */}
                      <div className="text-left space-y-0.5 pt-2 flex flex-col justify-end relative">
                        <div className="flex items-center gap-1 mb-0.5 print:hidden">
                          <label className="p-0.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 cursor-pointer transition-all inline-flex items-center gap-0.5 text-[8px] font-sans font-bold" title="Upload Engineer / Prepared By Signature Image">
                            <Upload className="w-2.5 h-2.5 text-amber-700" />
                            <span>Upload Prepared Sign</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleUploadSignature('engineer', e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                          {formData.engineerSignatureUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, engineerSignatureUrl: undefined })}
                              className="text-[7.5px] text-rose-600 hover:underline print:hidden font-sans font-bold"
                              title="Reset signature"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Fixed-height slot so signature image never stretches sheet lines */}
                        <div className="relative h-12 w-48 mb-0.5">
                          {formData.engineerSignatureUrl && (
                            <DraggableImage
                              src={formData.engineerSignatureUrl}
                              alt="Engineer Signature"
                              height={formData.preparedSignHeight || formData.signatureHeight || 72}
                              posX={formData.preparedSignPosX || 0}
                              posY={formData.preparedSignPosY || 0}
                              onPositionChange={(nx, ny) => {
                                setFormData(prev => ({ ...prev, preparedSignPosX: nx, preparedSignPosY: ny }));
                                saveAsset('preparedSignPosX', nx);
                                saveAsset('preparedSignPosY', ny);
                              }}
                              className="max-w-[220px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                              title="Click & Drag to move Prepared By Signature"
                            />
                          )}
                        </div>

                        <div className="font-bold text-[8.5px] text-black">Prepared By.</div>
                        <div className="font-bold text-[8.5px] text-black">Engineer QA/QC</div>
                      </div>

                      {/* RIGHT STAMP & APPROVAL AREA - APPROVED BY */}
                      <div className="text-right space-y-0.5 pt-2 flex flex-col justify-end relative items-end">
                        <div className="flex items-center justify-end gap-1 mb-0.5 print:hidden">
                          <label className="p-0.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 cursor-pointer transition-all inline-flex items-center gap-0.5 text-[8px] font-sans font-bold" title="Upload Approved By Signature Image">
                            <Upload className="w-2.5 h-2.5 text-amber-700" />
                            <span>Approved Sign</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleUploadSignature('manager', e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                          <label className="p-0.5 px-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded border border-blue-300 cursor-pointer transition-all inline-flex items-center gap-0.5 text-[8px] font-sans font-bold" title="Upload Official Rubber Stamp Image">
                            <Upload className="w-2.5 h-2.5 text-blue-700" />
                            <span>Upload Stamp</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleUploadSignature('stamp', e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                          {formData.managerSignatureUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, managerSignatureUrl: undefined })}
                              className="text-[7.5px] text-rose-600 hover:underline print:hidden font-sans font-bold"
                              title="Reset signature"
                            >
                              Reset Sign
                            </button>
                          )}
                          {formData.companyStampUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, companyStampUrl: undefined })}
                              className="text-[7.5px] text-rose-600 hover:underline print:hidden font-sans font-bold ml-1"
                              title="Remove stamp"
                            >
                              Remove Stamp
                            </button>
                          )}
                        </div>

                        {/* Fixed-height container for Stamp & Signature overlay so height never stretches sheet lines */}
                        <div className="relative h-12 w-72 mb-0.5 flex items-end justify-end">
                          {formData.companyStampUrl && (
                            <DraggableImage
                              src={formData.companyStampUrl}
                              alt="Company Stamp"
                              height={formData.stampHeight || 90}
                              posX={formData.stampPosX || 0}
                              posY={formData.stampPosY || 0}
                              onPositionChange={(nx, ny) => {
                                setFormData(prev => ({ ...prev, stampPosX: nx, stampPosY: ny }));
                                saveAsset('stampPosX', nx);
                                saveAsset('stampPosY', ny);
                              }}
                              className="max-w-[220px] object-contain absolute bottom-0 right-28 origin-bottom opacity-90 z-0"
                              title="Click & Drag to move Stamp"
                            />
                          )}

                          {formData.managerSignatureUrl && (
                            <DraggableImage
                              src={formData.managerSignatureUrl}
                              alt="Manager Signature"
                              height={formData.approvedSignHeight || formData.signatureHeight || 72}
                              posX={formData.approvedSignPosX || 0}
                              posY={formData.approvedSignPosY || 0}
                              onPositionChange={(nx, ny) => {
                                setFormData(prev => ({ ...prev, approvedSignPosX: nx, approvedSignPosY: ny }));
                                saveAsset('approvedSignPosX', nx);
                                saveAsset('approvedSignPosY', ny);
                              }}
                              className="max-w-[220px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
                              title="Click & Drag to move Approved By Signature"
                            />
                          )}
                        </div>

                        <div className="font-bold text-[8.5px] text-black">Approved By.</div>
                        <div className="font-bold text-[8.5px] text-black">{getCompanyQcHead(activeCompany)}</div>
                        <div className="font-black text-[8.5px] text-black tracking-tight">{formData.companyName || activeCompany.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* FLOATING ROW CONTEXT MENU FOR MTC 1 (Synchronizes All Tables) */}
                  {mtc1RowContextMenu && (
                    <div 
                      style={{ 
                        top: `${Math.min(window.innerHeight - 190, mtc1RowContextMenu.y)}px`, 
                        left: `${Math.min(window.innerWidth - 230, mtc1RowContextMenu.x)}px` 
                      }}
                      className="fixed z-50 bg-white border border-slate-300 rounded-lg shadow-2xl p-1.5 min-w-[200px] text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100 font-sans print:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
                        <span>Row {mtc1RowContextMenu.rowIdx + 1} Options</span>
                        <span className="text-[8.5px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">All Tables Sync</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInsertMtc1RowAt(mtc1RowContextMenu.rowIdx, 'below')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-medium transition-colors cursor-pointer text-[11px]"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Add New Row Below</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertMtc1RowAt(mtc1RowContextMenu.rowIdx, 'above')}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-medium transition-colors cursor-pointer text-[11px]"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>Add New Row Above</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateMtc1RowAt(mtc1RowContextMenu.rowIdx)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-blue-50 text-slate-700 hover:text-blue-900 font-medium transition-colors cursor-pointer text-[11px]"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Duplicate Row</span>
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => handleDeleteMtc1RowAt(mtc1RowContextMenu.rowIdx)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer text-[11px]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete Row</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ) : selectedTemplate === 'MTC_T2' ? (
              <MtcTemplate2Canvas
                formData={formData}
                setFormData={setFormData}
                isFullscreenEditor={isFullscreenEditor}
                onUploadLogo={handleUploadLogo}
                onSaveAsset={saveAsset}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onOpenExcelModal={(target) => {
                  setExcelPasteTarget(target);
                  setExcelPasteText('');
                  setShowExcelModal(true);
                }}
                onPoOrInvoiceChange={handlePoOrInvoiceChange}
                isSampleCert={isSampleCert}
                calculateTotalPages={calculateTotalPages}
                formatChemVal={formatChemVal}
                DEFAULT_ISO_LOGO_URL={DEFAULT_ISO_LOGO_URL}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
              />
            ) : selectedTemplate === 'MTC_T3' ? (
              <MtcTemplate3Canvas
                formData={formData}
                setFormData={setFormData}
                isFullscreenEditor={isFullscreenEditor}
                onUploadLogo={handleUploadLogo}
                onSaveAsset={saveAsset}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onOpenExcelModal={(target) => {
                  setExcelPasteTarget(target);
                  setExcelPasteText('');
                  setShowExcelModal(true);
                }}
                onPoOrInvoiceChange={handlePoOrInvoiceChange}
                isSampleCert={isSampleCert}
                calculateTotalPages={calculateTotalPages}
                formatChemVal={formatChemVal}
                DEFAULT_ISO_LOGO_URL={DEFAULT_ISO_LOGO_URL}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
              />
            ) : selectedTemplate === 'MTC_T4' ? (
              <MtcTemplate4Canvas
                formData={formData}
                setFormData={setFormData}
                isFullscreenEditor={isFullscreenEditor}
                onUploadLogo={handleUploadLogo}
                onSaveAsset={saveAsset}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onOpenExcelModal={(target) => {
                  setExcelPasteTarget(target);
                  setExcelPasteText('');
                  setShowExcelModal(true);
                }}
                onPoOrInvoiceChange={handlePoOrInvoiceChange}
                isSampleCert={isSampleCert}
                calculateTotalPages={calculateTotalPages}
                formatChemVal={formatChemVal}
                DEFAULT_ISO_LOGO_URL={DEFAULT_ISO_LOGO_URL}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
              />
            ) : selectedTemplate !== 'MTC_T1' ? (
              <SpecializedQcReportCanvas
                formData={formData}
                setFormData={setFormData}
                isFullscreenEditor={isFullscreenEditor}
                onUploadLogo={handleUploadLogo}
                onSaveAsset={saveAsset}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onPoOrInvoiceChange={handlePoOrInvoiceChange}
                isSampleCert={isSampleCert}
                DEFAULT_ISO_LOGO_URL={DEFAULT_ISO_LOGO_URL}
                onOpenExcelModal={(target) => {
                  setExcelPasteTarget(target);
                  setExcelPasteText('');
                  setShowExcelModal(true);
                }}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
              />
            ) : (
              /* STANDARD FORM LAYOUT FOR OTHER TEMPLATES */
              <>
                {/* SECTION 1: HEADER & CERTIFICATE METADATA */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Issue No. / Cert No.</label>
                      <input
                        type="text"
                        required
                        value={formData.issueNo || formData.certNo}
                        onChange={(e) => setFormData({ ...formData, certNo: e.target.value, issueNo: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-amber-800 text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Issue Date</label>
                      <input
                        type="text"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        placeholder="e.g. SEP 25, 2026"
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Buyer / Customer Name</label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-xs uppercase focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">PO Number</label>
                      <input
                        type="text"
                        value={formData.customerPoNum}
                        onChange={(e) => setFormData({ ...formData, customerPoNum: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PRODUCT ITEMS GRID */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      📦 PRODUCT ITEMS
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-black text-[11px] uppercase transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-300 rounded-lg bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-800 text-white text-[9px] font-bold uppercase">
                          <th className="p-1.5 w-8 text-center">#</th>
                          <th className="p-1.5 min-w-[80px]">Item No</th>
                          <th className="p-1.5 min-w-[130px]">Description</th>
                          <th className="p-1.5 w-20">Size</th>
                          <th className="p-1.5 min-w-[100px]">Material</th>
                          <th className="p-1.5 w-16 text-center">Qty</th>
                          <th className="p-1.5 min-w-[110px]">Heat No</th>
                          <th className="p-1.5 text-center w-8">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        {formData.items.map((it, idx) => (
                          <tr key={it.id} className="hover:bg-slate-50">
                            <td className="p-1 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-1"><input type="text" value={it.itemNo || ''} onChange={(e) => { const updated = [...formData.items]; updated[idx].itemNo = e.target.value; setFormData({ ...formData, items: updated }); }} className="w-full p-1 border border-slate-300 rounded font-bold" /></td>
                            <td className="p-1"><input type="text" value={it.description} onChange={(e) => { const updated = [...formData.items]; updated[idx].description = e.target.value; setFormData({ ...formData, items: updated }); }} className="w-full p-1 border border-slate-300 rounded font-bold uppercase" /></td>
                            <td className="p-1"><input type="text" value={it.size} onChange={(e) => { const updated = [...formData.items]; updated[idx].size = e.target.value; setFormData({ ...formData, items: updated }); }} className="w-full p-1 border border-slate-300 rounded font-bold" /></td>
                            <td className="p-1"><input type="text" value={it.material || ''} onChange={(e) => { const updated = [...formData.items]; updated[idx].material = e.target.value; setFormData({ ...formData, items: updated }); }} className="w-full p-1 border border-slate-300 rounded font-bold uppercase" /></td>
                            <td className="p-1"><input type="text" value={it.qty} onChange={(e) => { const updated = [...formData.items]; updated[idx].qty = e.target.value; setFormData({ ...formData, items: updated }); }} className="w-full p-1 border border-slate-300 rounded text-center font-bold" /></td>
                            <td className="p-1"><input type="text" value={it.heatNo} onChange={(e) => { const updated = [...formData.items]; updated[idx].heatNo = e.target.value; setFormData({ ...formData, items: updated }); }} className="w-full p-1 border border-slate-300 rounded font-bold text-amber-900 uppercase" /></td>
                            <td className="p-1 text-center">
                              <button type="button" onClick={() => handleRemoveItem(it.id)} className="p-1 bg-rose-100 text-rose-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FOOTER NOTES & CERTIFICATION CLAUSE */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">OFFICIAL CERTIFICATION STATEMENT</label>
                  <textarea
                    rows={2}
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded font-sans text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* SUB TAB 2: CERTIFICATE RECORDS ARCHIVE */}
      {activeSubTab === 'records' && (
        <div className="space-y-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          {/* HEADER & FILTER BAR - SIMPLE, LESS COLORFUL, WHITE BACKGROUND */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            
            {/* TOP ROW: TITLE & 2 CATEGORY FILTERS (MATERIAL TEST REPORT & SAMPLE MTC) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#0B3B49] text-white rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    MTC Archive &amp; Certificate Ledger
                  </h2>
                  <p className="text-[11px] text-slate-500 font-normal">
                    EN 10204 3.1 &amp; ISO 9001:2015 Material Inspection &amp; Test Certificates
                  </p>
                </div>
              </div>

              {/* 2 CATEGORY FILTERS: MATERIAL TEST REPORT & SAMPLE MTC + ALL */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterCategory('ALL')}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer ${
                    filterCategory === 'ALL'
                      ? 'bg-[#0B3B49] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  All Certs ({records.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('MATERIAL_TEST_REPORT')}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterCategory === 'MATERIAL_TEST_REPORT'
                      ? 'bg-[#0B3B49] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>Material Test Report</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    filterCategory === 'MATERIAL_TEST_REPORT' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {standardMtcCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('SAMPLE_MTC')}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterCategory === 'SAMPLE_MTC'
                      ? 'bg-[#0B3B49] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>Sample MTC</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    filterCategory === 'SAMPLE_MTC' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {sampleMtcCount}
                  </span>
                </button>
              </div>
            </div>

            {/* BOTTOM ROW: SEARCH, FROM DATE TO TO DATE, CUSTOMER & TEMPLATE DROPDOWNS */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Certificate No, Customer, PO, WO, Invoice, Heat No..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-white hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#0B3B49] focus:border-[#0B3B49] transition-all placeholder:font-normal placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Date Filters (From Date to To Date) */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* From Date */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#0B3B49] focus-within:border-[#0B3B49]">
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">From:</span>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="bg-transparent text-xs font-mono text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                  {filterDateFrom && (
                    <button
                      type="button"
                      onClick={() => setFilterDateFrom('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Clear From Date"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* To Date */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#0B3B49] focus-within:border-[#0B3B49]">
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">To:</span>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="bg-transparent text-xs font-mono text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                  {filterDateTo && (
                    <button
                      type="button"
                      onClick={() => setFilterDateTo('')}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Clear To Date"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Customer Dropdown */}
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-[#0B3B49] transition-all cursor-pointer max-w-[160px] truncate"
                >
                  <option value="ALL">🏢 All Customers ({customerList.length})</option>
                  {customerList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Template Filter */}
                <select
                  value={filterTemplate}
                  onChange={(e) => setFilterTemplate(e.target.value)}
                  className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-[#0B3B49] transition-all cursor-pointer max-w-[160px] truncate"
                >
                  <option value="ALL">📑 All Templates</option>
                  <optgroup label="Mill Test Certificates">
                    <option value="MTC_T1">MTC 1 (Horizontal Standard)</option>
                    <option value="MTC_T2">MTC 2 (2-Page Fastener)</option>
                    <option value="MTC_T3">MTC 3 (ASTM A320 L7)</option>
                    <option value="MTC_T4">MTC 4 (Fix Pipeline Spec)</option>
                  </optgroup>
                  <optgroup label="Surface Coatings & Platings">
                    <option value="HDG_REPORT">HDG Galvanizing Report</option>
                    <option value="GI_REPORT">Electro-Galvanized (GI) Report</option>
                    <option value="NICKEL_REPORT">Nickel Plating Report</option>
                    <option value="NICKEL_COBALT_REPORT">Nickel Cobalt Report (ASTM B994)</option>
                    <option value="YELLOW_PASSIVATED_REPORT">Yellow Passivated Report</option>
                    <option value="CADMIUM_REPORT">Cadmium Report</option>
                    <option value="PTFE_REPORT">PTFE / Xylan Report</option>
                    <option value="FLUROPOLYMER_REPORT">Fluoropolymer Report</option>
                    <option value="TEFLON_REPORT">Teflon Report</option>
                    <option value="NEOPRENE_SLEEVE_REPORT">Neoprene Sleeve Report</option>
                  </optgroup>
                  <optgroup label="Certificates & Reports">
                    <option value="COC_REPORT">Certificate of Conformity (COC)</option>
                    <option value="COO_CERTIFICATE">Country of Origin Certificate (COO)</option>
                    <option value="INSPECTION_REPORT">Pre-Shipment Inspection Report</option>
                    <option value="WARRANTY_CERTIFICATE">Warranty Certificate</option>
                    <option value="COMPLIANCE_LETTER">Compliance Letter</option>
                  </optgroup>
                </select>

                {/* Reset Filters Button */}
                {(searchQuery || filterCategory !== 'ALL' || filterDateFrom || filterDateTo || filterDate || filterCustomer !== 'ALL' || filterTemplate !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('ALL');
                      setFilterDateFrom('');
                      setFilterDateTo('');
                      setFilterDate('');
                      setFilterCustomer('ALL');
                      setFilterTemplate('ALL');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="Reset All Filters"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RECORD SHEET TABLE - SIMPLE, ULTRA-COMPACT, WHITE BACKGROUND (SCROLLABLE FOR >15 ROWS) */}
          <div className="overflow-x-auto overflow-y-auto max-h-[520px] border border-slate-300 rounded-lg shadow-2xs bg-white">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10 shadow-xs">
                <tr className="bg-[#0B3B49] text-white font-bold text-[11px] uppercase tracking-wider select-none">
                  <th className="py-1.5 px-2 w-[10%] border-r border-[#194b5c] text-center bg-[#0B3B49]">
                    Date
                  </th>
                  <th className="py-1.5 px-2.5 w-[18%] border-r border-[#194b5c] text-left bg-[#0B3B49]">
                    Client Name
                  </th>
                  <th className="py-1.5 px-2 w-[12%] border-r border-[#194b5c] text-center bg-[#0B3B49]">
                    Invoice No
                  </th>
                  <th className="py-1.5 px-2 w-[11%] border-r border-[#194b5c] text-center bg-[#0B3B49]">
                    WO Number
                  </th>
                  <th className="py-1.5 px-2 w-[11%] border-r border-[#194b5c] text-center bg-[#0B3B49]">
                    PO Number
                  </th>
                  <th className="py-1.5 px-2 w-[38%] text-center bg-[#0B3B49]">
                    Certificates / Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {groupedArchiveRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center bg-white">
                      <div className="max-w-xs mx-auto space-y-1.5">
                        <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Search className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">No Certificate records found</p>
                        <p className="text-[11px] text-slate-500">Try adjusting your date range, search keyword, or category filters.</p>
                        {(searchQuery || filterCategory !== 'ALL' || filterDateFrom || filterDateTo || filterDate || filterCustomer !== 'ALL' || filterTemplate !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setFilterCategory('ALL');
                              setFilterDateFrom('');
                              setFilterDateTo('');
                              setFilterDate('');
                              setFilterCustomer('ALL');
                              setFilterTemplate('ALL');
                            }}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 underline cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Clear all search filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  groupedArchiveRecords.map(grp => (
                    <tr key={grp.groupKey} className="bg-white hover:bg-sky-50/40 transition-colors">
                      {/* 1. DATE */}
                      <td className="py-1 px-2 text-center font-mono text-slate-800 border-r border-slate-200 align-middle whitespace-nowrap text-[11px]">
                        {grp.dates.length > 0 ? (
                          <span>{grp.dates[0]}</span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 2. CLIENT NAME (SMALLER WIDTH, CLEAN PLAIN TEXT) */}
                      <td className="py-1 px-2.5 text-left border-r border-slate-200 align-middle">
                        <span className="font-semibold text-slate-900 uppercase text-[11px] block truncate" title={grp.customerName}>
                          {grp.customerName}
                        </span>
                      </td>

                      {/* 3. INVOICE NO (NO BOX - PLAIN TEXT) */}
                      <td className="py-1 px-2 text-center font-mono text-slate-800 text-[11px] border-r border-slate-200 align-middle whitespace-nowrap">
                        {grp.invoiceNo !== '—' ? (
                          <span>{grp.invoiceNo}</span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 4. WO NUMBER (NO BOX - PLAIN TEXT) */}
                      <td className="py-1 px-2 text-center font-mono text-slate-800 text-[11px] border-r border-slate-200 align-middle whitespace-nowrap">
                        {grp.workOrderNo !== '—' ? (
                          <span>{grp.workOrderNo}</span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 5. PO NUMBER (NO BOX - PLAIN TEXT) */}
                      <td className="py-1 px-2 text-center font-mono text-slate-800 text-[11px] border-r border-slate-200 align-middle whitespace-nowrap">
                        {grp.poNo !== '—' ? (
                          <span>{grp.poNo}</span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* 6. CERTIFICATES / ACTION */}
                      <td className="py-0.5 px-2 text-center align-middle">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {grp.records.map(rec => {
                            const shortCode = getTemplateShortCode(rec.templateType);
                            const isSample = isSampleCert(rec);
                            const isMtc = rec.templateType.startsWith('MTC');
                            const isCoating = [
                              'HDG_REPORT', 'GI_REPORT', 'NICKEL_REPORT', 
                              'NICKEL_COBALT_REPORT', 'YELLOW_PASSIVATED_REPORT', 
                              'CADMIUM_REPORT', 'PTFE_REPORT', 'FLUROPOLYMER_REPORT', 
                              'TEFLON_REPORT', 'NEOPRENE_SLEEVE_REPORT'
                            ].includes(rec.templateType);

                            // Clean, subtle slim pastel button
                            let badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100';
                            if (isSample) {
                              badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
                            } else if (isCoating) {
                              badgeStyle = 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100';
                            } else if (!isMtc) {
                              badgeStyle = 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100';
                            }

                            return (
                              <button
                                key={rec.id}
                                type="button"
                                onClick={() => {
                                  setCopiedCertNo(false);
                                  setActionModalRecord(rec);
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight transition-colors border ${badgeStyle} cursor-pointer shadow-2xs leading-none`}
                                title={`Click to Manage: ${shortCode} (${rec.certNo || rec.issueNo || ''})`}
                              >
                                <Printer className="w-2.5 h-2.5 shrink-0 opacity-80" />
                                <span>{shortCode}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERACTIVE ACTION POPUP MODAL (PRINT PDF, EDIT, DELETE, CLOSE FORM) */}
      {actionModalRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 text-slate-900">
            {/* Modal Header with Clean White Background */}
            <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shadow-2xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">Certificate Operations</h3>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-amber-300">
                      {getTemplateShortCode(actionModalRecord.templateType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[12px] font-mono font-bold text-amber-700 truncate max-w-[240px]">
                      {actionModalRecord.certNo || actionModalRecord.issueNo || 'No Cert No Specified'}
                    </p>
                    {actionModalRecord.certNo && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(actionModalRecord.certNo || '');
                          setCopiedCertNo(true);
                          setTimeout(() => setCopiedCertNo(false), 2000);
                        }}
                        className="p-1 hover:bg-slate-100 text-slate-400 hover:text-amber-600 rounded transition cursor-pointer"
                        title="Copy Certificate Number"
                      >
                        {copiedCertNo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionModalRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                title="Close Form (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Specification Details Cards */}
            <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-3 gap-2 text-[10.5px] font-sans">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Template</span>
                  <span className="font-black text-amber-600 text-[11px] truncate block mt-0.5">
                    {getTemplateShortCode(actionModalRecord.templateType)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Issue Date</span>
                  <span className="font-bold text-slate-700 text-[11px] font-mono block mt-0.5">
                    {actionModalRecord.date || '—'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Invoice No</span>
                  <span className="font-black text-amber-600 font-mono text-[11px] block mt-0.5 truncate">
                    {actionModalRecord.invoiceNum || '—'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs col-span-2">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Customer Name</span>
                  <span className="font-black text-slate-900 text-[11.5px] truncate block mt-0.5">
                    {actionModalRecord.customerName || '—'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">PO / WO No</span>
                  <span className="font-bold text-blue-600 font-mono text-[11px] block mt-0.5 truncate">
                    {actionModalRecord.customerPoNum || actionModalRecord.poNumber || actionModalRecord.workOrderNum || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Professional Action Cards */}
            <div className="p-4 space-y-2.5 bg-white">
              {/* 1. PRINT PDF (PRIMARY ACTION) */}
              <button
                type="button"
                onClick={() => {
                  const rec = actionModalRecord;
                  setActionModalRecord(null);
                  setPrintModalRecord(rec);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.99] cursor-pointer group border border-amber-400"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-950/15 rounded-lg group-hover:scale-105 transition-transform">
                    <Printer className="w-4 h-4 text-slate-950" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span>PRINT PDF</span>
                      <span className="bg-slate-950/15 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-bold">READY</span>
                    </div>
                    <div className="text-[10.5px] text-slate-900/85 font-medium">
                      Preview certificate, print directly or download PDF
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 2. EDIT */}
              <button
                type="button"
                onClick={() => {
                  const rec = actionModalRecord;
                  setActionModalRecord(null);
                  handleEditRecord(rec);
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 border border-slate-200 text-slate-900 font-bold rounded-xl shadow-2xs transition-all active:scale-[0.99] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform border border-indigo-200">
                    <Edit className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-900">EDIT CERTIFICATE</div>
                    <div className="text-[10.5px] text-slate-500 font-medium">
                      Modify chemical/mechanical specs, heat numbers or quantities
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* 3. DELETE */}
              <button
                type="button"
                onClick={() => {
                  const id = actionModalRecord.id;
                  setActionModalRecord(null);
                  handleDeleteRecord(id);
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-rose-50 hover:border-rose-300 border border-slate-200 text-slate-900 font-bold rounded-xl shadow-2xs transition-all active:scale-[0.99] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-105 transition-transform border border-rose-200">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-wider text-rose-600">DELETE FROM ARCHIVE</div>
                    <div className="text-[10.5px] text-slate-500 font-medium">
                      Permanently remove this certificate from registry
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* 4. CLOSE FORM */}
              <button
                type="button"
                onClick={() => setActionModalRecord(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>CLOSE FORM (ESC)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL - BIG DISPLAY */}
      {printModalRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-[98vw] max-w-[98vw] h-[96vh] max-h-[96vh] flex flex-col overflow-hidden text-slate-900">
            {/* MODAL HEADER WITH FILENAME BADGE, ZOOM CONTROLS, PRINT BUTTON & CLOSE ICON */}
            <div className="bg-white p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
              {/* LEFT: SAVE AS FILE NAME BADGE */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs max-w-full truncate">
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight shrink-0">File Name:</span>
                <span className="font-mono font-bold text-slate-900 truncate tracking-tight text-[11.5px]">
                  {getMtcPdfFileName(printModalRecord)}.pdf
                </span>
              </div>

              {/* ZOOM CONTROLS & ACTIONS & CLOSE ICON */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-700">
                  <button 
                    type="button" 
                    onClick={() => setPreviewZoom(z => Math.max(70, z - 10))}
                    className="p-1 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer" 
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <span className="w-10 text-center text-[11px] font-mono text-slate-900 font-bold">{previewZoom}%</span>
                  <button 
                    type="button" 
                    onClick={() => setPreviewZoom(z => Math.min(160, z + 10))}
                    className="p-1 hover:text-slate-900 hover:bg-slate-200 rounded cursor-pointer" 
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPreviewZoom(100)}
                    className="ml-1 text-[10px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <button
                  onClick={triggerNativePrint}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>

                {/* PROMINENT CLOSE ICON BUTTON */}
                <button
                  onClick={() => setPrintModalRecord(null)}
                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-all cursor-pointer border border-rose-200"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE HIGH QUALITY CERTIFICATE CANVAS (MULTI-PAGE DISPLAY CANVAS) */}
            <div className="flex-1 overflow-x-auto overflow-y-auto font-sans bg-white p-4 sm:p-8 flex justify-center items-start border-t border-slate-100">
              <div 
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: "top center" }}
                className="transition-transform duration-150 ease-out"
              >
                <div id="printable-qc-cert" className="space-y-6">
                  {printModalRecord.templateType === 'MTC_T4' ? (
                    <MtcTemplate4PrintView
                      record={printModalRecord}
                      DEFAULT_ISO_LOGO_URL={DEFAULT_ISO_LOGO_URL}
                      isSample={isSampleCert(printModalRecord)}
                    />
                  ) : (
                    getCertPagesLayout(printModalRecord).map((pageLayout) => {
                      const isSpecialized = isSpecializedTemplateType(printModalRecord.templateType);
                      if (isSpecialized) {
                        const currentSpecializedRec = pageLayout.sheetRecord || printModalRecord;
                        return (
                          <div
                            key={pageLayout.pageNum}
                            className="cert-page w-[200mm] min-w-[200mm] mx-auto bg-white text-black font-sans shadow-none rounded-none relative flex flex-col items-center"
                            style={{ 
                              fontFamily: "Arial, Helvetica, sans-serif", 
                              boxSizing: "border-box",
                              border: "none"
                            }}
                          >
                            <SpecializedQcReportPrintView
                              record={currentSpecializedRec}
                              pageNum={pageLayout.pageNum}
                              totalPages={pageLayout.totalPages}
                              showMetadata={pageLayout.showMetadata}
                              showTechInfo={pageLayout.showTechInfo}
                              showRemarksAndSignatures={pageLayout.showRemarksAndSignatures}
                              isContinued={pageLayout.isDescContinued}
                              items={pageLayout.descRows?.map(r => {
                                const origItem = currentSpecializedRec.items?.[r.idx] || {};
                                return {
                                  id: String(r.idx),
                                  itemNo: r.itemNo,
                                  description: r.description,
                                  size: r.size,
                                  qty: r.qty,
                                  orderedQty: origItem.orderedQty || r.orderedQty || '',
                                  standard: origItem.standard || r.standard || '',
                                  material: origItem.material || r.material || '',
                                  finish: r.finish,
                                  marking: r.marking,
                                  markingImage: origItem.markingImage || r.markingImage,
                                  heatNo: r.heatNo,
                                  coatingMicronsMin: origItem.coatingMicronsMin || r.coatingMicronsMin || '',
                                  observedCoating: origItem.observedCoating || r.observedCoating || '',
                                  avgMicrons: origItem.avgMicrons || r.avgMicrons || '',
                                  massOfZincGmM2: origItem.massOfZincGmM2 || r.massOfZincGmM2 || '',
                                  remark: origItem.remark || r.remark || ''
                                };
                              })}
                              DEFAULT_ISO_LOGO_URL={DEFAULT_ISO_LOGO_URL}
                              isSample={isSampleCert(currentSpecializedRec)}
                            />
                          </div>
                        );
                      }

                      const isCertLandscape = printModalRecord.templateType === 'MTC_T1';
                      const isCertMtc2Or3 = printModalRecord.templateType === 'MTC_T2' || printModalRecord.templateType === 'MTC_T3';
                      const currentRec = pageLayout.sheetRecord || printModalRecord;
                      return (
                        <div
                          key={pageLayout.pageNum}
                          className={`cert-page ${isCertLandscape ? 'mtc1-landscape w-[287mm] min-w-[287mm] min-h-[196mm]' : 'w-[200mm] min-w-[200mm] min-h-[280mm]'} mx-auto p-3 sm:p-4 bg-white text-black font-sans ${isCertMtc2Or3 ? 'shadow-none' : 'shadow-2xl'} rounded-none relative flex flex-col justify-between mb-6`}
                          style={{ 
                            fontFamily: "Arial, Helvetica, sans-serif", 
                            border: isCertMtc2Or3 ? "2px solid #000000" : (isCertLandscape ? undefined : "2px solid #000000"),
                            boxShadow: isCertMtc2Or3 ? "none" : undefined,
                            boxSizing: "border-box",
                            pageBreakAfter: "always"
                          }}
                        >
                      {/* CONDITIONAL SAMPLE MTC WATERMARK (PRINT & PREVIEW) */}
                      {isSampleCert(currentRec) && (
                        <div 
                          className="watermark-sample absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none"
                          style={{ zIndex: 10 }}
                        >
                          <div 
                            className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/22 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-5 sm:px-8 py-1.5 sm:py-2.5 transform -rotate-[30deg] text-[28px] sm:text-[38px] md:text-[44px] leading-none select-none"
                            style={{
                              fontFamily: "'Arial Black', Arial, Impact, sans-serif",
                              letterSpacing: '0.14em',
                              color: 'rgba(100, 116, 139, 0.20)',
                              borderColor: 'rgba(100, 116, 139, 0.22)',
                            }}
                          >
                            SAMPLE MTC
                          </div>
                        </div>
                      )}
                      <div>
                        {/* HEADER WITH DYNAMIC PAGE NUMBERING: PAGE NO : X OF Y */}
                        {renderCertHeader(currentRec, pageLayout.pageNum, pageLayout.totalPages)}

                        {/* METADATA BLOCK (Only on Page 1) */}
                        {pageLayout.showMetadata && renderCertMetadata(currentRec)}

                        {/* PRODUCT DESCRIPTION TABLE */}
                        {pageLayout.descRows && pageLayout.descRows.length > 0 && renderCertDescriptionTable(currentRec, pageLayout.descRows, pageLayout.isDescContinued)}

                        {/* CHEMICAL COMPOSITION TABLE */}
                        {pageLayout.chemRows.length > 0 && renderCertChemTable(currentRec, pageLayout.chemRows, pageLayout.isChemContinued)}

                        {/* MECHANICAL PROPERTIES TABLE */}
                        {pageLayout.mechRows.length > 0 && renderCertMechTable(currentRec, pageLayout.mechRows, pageLayout.isMechContinued)}

                        {/* MACRO ETCH TABLE */}
                        {pageLayout.showMacroEtch && renderCertMacroEtch(currentRec)}

                        {/* HEAT TREATMENT TABLE */}
                        {pageLayout.showHeatTreatment && renderCertHeatTreatment(currentRec)}

                        {/* ADDITIONAL TECHNICAL INFORMATION */}
                        {pageLayout.showTechInfo && renderCertTechInfo(currentRec)}
                      </div>

                      {/* BOTTOM SIGNATURES */}
                      {pageLayout.showRemarksAndSignatures && (
                        renderCertSignatures(
                          currentRec, 
                          true, 
                          (key, x, y) => {
                            const updated = {
                              ...printModalRecord,
                              [`${key}PosX`]: x,
                              [`${key}PosY`]: y
                            };
                            setPrintModalRecord(updated);
                            saveAsset(`${key}PosX` as any, x);
                            saveAsset(`${key}PosY` as any, y);
                          }
                        )
                      )}
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QcReportsComponent;