import { getCompanyProfile } from '../utils/companyProfile';
import {
  getShortThreadSeries,
  getCleanCategoryName,
  getCleanSubcategoryName,
  sharedCleanDispatchBy,
  numberToAEDWords,
  deriveWorkOrderNoFromInvoiceNo,
} from './InvoiceDeliveryNoteForm';

export interface PrintOptions {
  printArea?: 'ENTIRE' | 'NO_LETTERHEAD' | 'TABLE_ONLY' | 'NO_SIGNATURES' | 'CUSTOM';
  customPrintSections?: {
    letterhead: boolean;
    metadata: boolean;
    buyerBox: boolean;
    signatures: boolean;
  };
  excludedPrintItemIds?: string[];
  showUnitWeightInPrint?: boolean;
  showTotalWeightInPrint?: boolean;
  showHsCodeInPrint?: boolean;
  showPltNoInPrint?: boolean;
  printPageSize?: 'A4' | 'LETTER' | 'LEGAL';
  printFontSize?: string; // Font size scale override e.g. '85%', '100%', '115%', '130%', '150%'
  supplierFontSize?: string;
  customerFontSize?: string;
  docRefFontSize?: string;
  packingHeaderFontSize?: string;
  packingTotalsFontSize?: string;
  packingItemsFontSize?: string;
  singleCopy?: boolean;
  isBundle?: boolean;
  invoiceFormat?: string;
  enableStripeView?: boolean;
  watermark?: string;
  watermarkOpacity?: number;
  themeColor?: string;
  showQrCode?: boolean;
  showBankDetails?: boolean;
  showVatTaxAnalysis?: boolean;
  showAmountInWords?: boolean;
  numberOfCopies?: number;
  printLanguage?: 'English' | 'Arabic' | 'Bilingual';
  packingListColWidths?: {
    sn: number;
    pltNo: number;
    description: number;
    grade: number;
    size: number;
    hsCode: number;
    finish: number;
    units: number;
    qtyBox: number;
    noBox: number;
    totalQty: number;
    unitWt: number;
    totalWt: number;
  };
  isPreview?: boolean;
}

// Helper to determine the effective box count for consecutive box rows in packing list
export const getEffectiveNumBoxes = (items: any[], currentIndex: number) => {
  const currentItem = items[currentIndex];
  if (!currentItem) return 0;
  const boxNo = (currentItem.boxNo || '').trim().toUpperCase();
  if (!boxNo) {
    const nb = currentItem.numBoxes !== undefined ? currentItem.numBoxes : 1;
    return nb >= 0 ? nb : 1;
  }
  
  // Find the first consecutive item with the same non-empty boxNo
  let firstIdx = currentIndex;
  while (firstIdx > 0) {
    const prev = items[firstIdx - 1];
    if (prev && (prev.boxNo || '').trim().toUpperCase() === boxNo) {
      firstIdx--;
    } else {
      break;
    }
  }
  const nbGroup = items[firstIdx] && items[firstIdx].numBoxes !== undefined ? items[firstIdx].numBoxes : 1;
  return nbGroup !== undefined && nbGroup >= 0 ? nbGroup : 1;
};

// Helper to determine total weight of a box group (sum of each item's totalQty * unitWeight)
export const getGroupTotalWeight = (items: any[], startIndex: number, groupCount: number) => {
  let totalWt = 0;
  for (let i = startIndex; i < startIndex + groupCount; i++) {
    const currentItem = items[i];
    if (currentItem) {
      const effectiveNumBoxes = getEffectiveNumBoxes(items, i);
      const qPerB = currentItem.qtyPerBox !== undefined ? currentItem.qtyPerBox : (currentItem.qty || 0);
      const totalQty = qPerB * effectiveNumBoxes;
      totalWt += totalQty * (currentItem.unitWeight || 0);
    }
  }
  return totalWt;
};

// Helper to parse dimension lines and sum range/qty counts (e.g. "1-25 L 1200 X W 800..." -> 25)
export const parseDimensionsTotalCount = (dims: string[] | undefined | null): number => {
  if (!Array.isArray(dims) || dims.length === 0) return 0;
  let total = 0;
  dims.forEach((d) => {
    const str = String(d || '').trim();
    if (!str) return;

    // Check for explicit range pattern e.g. "1-25", "1 to 25", "1–25"
    const rangeMatch = str.match(/^(?:box|pallet|bundle|plt|bdl|no|#)?\s*(\d+)\s*[-–—to]+\s*(\d+)/i) ||
                       str.match(/(\d+)\s*[-–—to]+\s*(\d+)/i);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        total += (end - start + 1);
        return;
      }
    }

    // Check for explicit quantity pattern e.g. "25 BOXES", "QTY: 25", "25 PCS"
    const qtyMatch = str.match(/^(\d+)\s*(?:boxes|box|pallets|pallet|bundles|bundle|pcs|units)/i) ||
                     str.match(/qty[:\s]*(\d+)/i);
    if (qtyMatch) {
      const q = parseInt(qtyMatch[1], 10);
      if (!isNaN(q) && q > 0) {
        total += q;
        return;
      }
    }

    // Default: if it's a non-empty line
    total += 1;
  });
  return total;
};

// Helper to generate elegant packing details block for PACKING LIST print output
export const getPackingDetailsBlockHtml = (data: any, calculatedSums: any): string => {
  const items = data.items || [];
  const autoNumBoxes = items.reduce((acc: number, it: any) => acc + (Number(it.numBoxes) || 0), 0);
  const numBoxes = data.numberOfBoxes !== undefined ? data.numberOfBoxes : autoNumBoxes;
  const numBundles = data.numberOfBundles || 0;
  const numPallets = data.numberOfPallets !== undefined ? data.numberOfPallets : (items.some((it: any) => it.pltNo) ? 1 : 0);
  const netWt = data.netWeight !== undefined && data.netWeight > 0 ? data.netWeight : (calculatedSums.totalWeight > 0 ? calculatedSums.totalWeight : 0);
  const grossWt = data.grossWeight !== undefined && data.grossWeight > 0 ? data.grossWeight : (netWt > 0 ? netWt * 1.05 : 0);
  
  const pltDims: string[] = (Array.isArray(data.palletDimensions) ? data.palletDimensions : []).map(s => String(s || '').trim()).filter(Boolean);
  const boxDims: string[] = (Array.isArray(data.boxDimensions) ? data.boxDimensions : []).map(s => String(s || '').trim()).filter(Boolean);
  const bndDims: string[] = (Array.isArray(data.bundleDimensions) ? data.bundleDimensions : []).map(s => String(s || '').trim()).filter(Boolean);

  const calcPltCount = parseDimensionsTotalCount(pltDims) || numPallets || pltDims.length;
  const calcBoxCount = parseDimensionsTotalCount(boxDims) || numBoxes || boxDims.length;
  const calcBndCount = parseDimensionsTotalCount(bndDims) || numBundles || bndDims.length;

  const chips: string[] = [
    `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; flex: 1; min-width: 90px; text-align: center;">
        <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; font-family: 'Arial MT', 'Arial', sans-serif;">NO. OF BOXES</div>
        <div style="font-size: 12px; font-weight: 900; color: #000000; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">${calcBoxCount}</div>
      </div>
    `,
    `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; flex: 1; min-width: 90px; text-align: center;">
        <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; font-family: 'Arial MT', 'Arial', sans-serif;">NO. OF BUNDLES</div>
        <div style="font-size: 12px; font-weight: 900; color: #000000; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">${calcBndCount}</div>
      </div>
    `,
    `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; flex: 1; min-width: 90px; text-align: center;">
        <div style="font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; font-family: 'Arial MT', 'Arial', sans-serif;">NO. OF PALLETS</div>
        <div style="font-size: 12px; font-weight: 900; color: #000000; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">${calcPltCount}</div>
      </div>
    `,
    `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 4px 8px; flex: 1; min-width: 90px; text-align: center;">
        <div style="font-size: 8px; font-weight: 800; color: #166534; text-transform: uppercase; font-family: 'Arial MT', 'Arial', sans-serif;">NET WT (KG)</div>
        <div style="font-size: 12px; font-weight: 900; color: #15803d; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">${Number(netWt).toFixed(2)}</div>
      </div>
    `,
    `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px; flex: 1; min-width: 90px; text-align: center;">
        <div style="font-size: 8px; font-weight: 800; color: #1e40af; text-transform: uppercase; font-family: 'Arial MT', 'Arial', sans-serif;">GROSS WT (KG)</div>
        <div style="font-size: 12px; font-weight: 900; color: #1d4ed8; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">${Number(grossWt).toFixed(2)}</div>
      </div>
    `
  ];

  const dimCards: string[] = [
    `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; flex: 1; min-width: 170px;">
        <div style="font-weight: 800; font-size: 8.5px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; margin-bottom: 4px; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">
          📦 PALLET DIMENSIONS (${calcPltCount})
        </div>
        <div style="font-family: 'Arial MT', 'Arial', sans-serif; font-size: 8px; line-height: 1.4; color: #1e293b;">
          ${pltDims.length > 0 ? pltDims.map((d) => `<div style="padding: 1px 0; font-weight: 700; color: #000000;">${d}</div>`).join('') : '<div style="color: #94a3b8; font-style: italic;">—</div>'}
        </div>
      </div>
    `,
    `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; flex: 1; min-width: 170px;">
        <div style="font-weight: 800; font-size: 8.5px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; margin-bottom: 4px; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">
          🧰 BOX DIMENSIONS (${calcBoxCount})
        </div>
        <div style="font-family: 'Arial MT', 'Arial', sans-serif; font-size: 8px; line-height: 1.4; color: #1e293b;">
          ${boxDims.length > 0 ? boxDims.map((d) => `<div style="padding: 1px 0; font-weight: 700; color: #000000;">${d}</div>`).join('') : '<div style="color: #94a3b8; font-style: italic;">—</div>'}
        </div>
      </div>
    `,
    `
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; flex: 1; min-width: 170px;">
        <div style="font-weight: 800; font-size: 8.5px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; margin-bottom: 4px; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">
          🎗️ BUNDLE DIMENSIONS (${calcBndCount})
        </div>
        <div style="font-family: 'Arial MT', 'Arial', sans-serif; font-size: 8px; line-height: 1.4; color: #1e293b;">
          ${bndDims.length > 0 ? bndDims.map((d) => `<div style="padding: 1px 0; font-weight: 700; color: #000000;">${d}</div>`).join('') : '<div style="color: #94a3b8; font-style: italic;">—</div>'}
        </div>
      </div>
    `
  ];

  if (chips.length === 0 && dimCards.length === 0) return '';

  return `
    <div style="margin-top: 10px; margin-bottom: 10px; border: 1.5px solid #000000; border-radius: 6px; padding: 8px 10px; background-color: #f8fafc; font-family: 'Arial MT', 'Arial', sans-serif; box-sizing: border-box; width: 100%; page-break-inside: avoid; break-inside: avoid;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #000000; padding-bottom: 4px; margin-bottom: 6px;">
        <span style="font-weight: 900; font-size: 10.5px; text-transform: uppercase; color: #000000; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">
          📦 PACKING DETAILS &amp; DIMENSIONS
        </span>
      </div>
      
      ${chips.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; justify-content: flex-start;">
          ${chips.join('')}
        </div>
      ` : ''}

      ${dimCards.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 8.5px; font-family: 'Arial MT', 'Arial', sans-serif;">
          ${dimCards.join('')}
        </div>
      ` : ''}

      ${(data.transporterName || data.airwayBillNo || data.vehicleNo || data.driverName) ? `
        <div style="margin-top: 8px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-size: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 800; color: #000000; text-transform: uppercase;">LOGISTICS ROUTING:</span>
          <div style="display: flex; gap: 10px; font-family: sans-serif; font-weight: 700; color: #334155;">
            ${data.transporterName ? `<span>TRANSPORTER: <strong style="color: #000;">${data.transporterName}</strong></span>` : ''}
            ${data.vehicleNo ? `<span>VEHICLE: <strong style="color: #000;">${data.vehicleNo}</strong></span>` : ''}
            ${data.airwayBillNo ? `<span>BL / AWB: <strong style="color: #000;">${data.airwayBillNo}</strong></span>` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

// Helper to group contiguous items with the same non-empty boxNo inside separate page-break avoid tbodies
export const buildGroupedRowsHtml = (
  items: any[], 
  renderRowFn: (item: any, index: number) => string
): string => {
  let html = '';
  let i = 0;
  while (i < items.length) {
    const startItem = items[i];
    const currentBox = (startItem.boxNo || '').trim().toUpperCase();
    
    let groupHtml = '';
    let j = i;
    
    if (currentBox) {
      while (j < items.length && (items[j].boxNo || '').trim().toUpperCase() === currentBox) {
        groupHtml += renderRowFn(items[j], j);
        j++;
      }
    } else {
      groupHtml += renderRowFn(items[j], j);
      j++;
    }
    
    html += `<tbody style="page-break-inside: avoid !important; break-inside: avoid !important;">${groupHtml}</tbody>`;
    i = j;
  }
  return html;
};

export const computeRowSpans = (items: any[]) => {
  const spans: { [id: string]: number } = {};
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    const boxNo = (item.boxNo || '').trim().toUpperCase();
    if (!boxNo) {
      spans[item.id] = 1;
      i++;
      continue;
    }
    let count = 1;
    let j = i + 1;
    while (j < items.length && (items[j].boxNo || '').trim().toUpperCase() === boxNo) {
      count++;
      j++;
    }
    spans[item.id] = count;
    for (let k = i + 1; k < j; k++) {
      spans[items[k].id] = 0;
    }
    i = j;
  }
  return spans;
};

export const getFormattedDocTitle = (docTypeLabel: any, data: any): string => {
  if (!data) return 'DOCUMENT';
  const cleanType = typeof docTypeLabel === 'string' ? docTypeLabel : (typeof data.documentType === 'string' ? data.documentType : '');
  const normType = cleanType.toUpperCase().trim();
  const rawCompany = typeof data.buyerName === 'string' ? data.buyerName : (typeof data.customerName === 'string' ? data.customerName : (typeof data.clientName === 'string' ? data.clientName : (typeof data.providerName === 'string' ? data.providerName : '')));
  const companyName = String(rawCompany || '')
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');

  const invoiceNo = String(data.invoiceNo || data.id || '').trim();
  const workOrderNo = String(data.workOrderNo || data.associatedWorkOrderNo || data.invoiceNo || '').trim();
  const deliveryNoteNo = String(data.deliveryNoteNo || data.associatedDeliveryNoteNo || data.invoiceNo || data.workOrderNo || '').trim();
  const debitNoteNo = String(data.debitNoteNo || data.creditNoteNo || data.invoiceNo || '').trim();
  const creditNoteNo = String(data.creditNoteNo || data.invoiceNo || '').trim();
  const suffix = companyName ? `-${companyName}` : '';

  if (normType === 'BUNDLE') {
    return `${workOrderNo || invoiceNo}-BUNDLE${suffix}`;
  }
  if (normType.includes('WORK ORDER') || normType === 'WO') {
    return `${workOrderNo || invoiceNo}-WO${suffix}`;
  }
  if (normType.includes('QUOTATION') || normType === 'QTN') {
    return `${data.quotationRef || invoiceNo}-QTN${suffix}`;
  }
  if (normType.includes('DELIVERY') || normType === 'DO' || normType.includes('COATING DELIVERY') || normType.includes('GOODS RETURN')) {
    return `${deliveryNoteNo || invoiceNo}-DO${suffix}`;
  }
  if (normType.includes('PACKING') || normType === 'PL') {
    return `${invoiceNo || workOrderNo}-PL${suffix}`;
  }
  if (normType.includes('DEBIT') || normType === 'DN') {
    return `${debitNoteNo}-DN${suffix}`;
  }
  if (normType.includes('CREDIT') || normType === 'CN') {
    return `${creditNoteNo}-CN${suffix}`;
  }
  // Default for INVOICE (Tax Invoice, Proforma Invoice, Commercial Invoice, etc.)
  return `${invoiceNo}-INVOICE${suffix}`;
};

export const combineDocPagesIntoBundleHtml = (doc: any, pages: Array<{ html: string; title: string }>): string => {
  const pageContents: string[] = [];
  let combinedStyles = '';

  pages.forEach((p, idx) => {
    if (!p.html) return;
    const styleStart = p.html.indexOf('<style>');
    const styleEnd = p.html.indexOf('</style>');
    if (styleStart !== -1 && styleEnd !== -1) {
      combinedStyles += '\n' + p.html.substring(styleStart + 7, styleEnd);
    }
    const bodyMatch = p.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let pageInner = '';
    if (bodyMatch && bodyMatch[1]) {
      pageInner = bodyMatch[1];
    } else {
      const tableStart = p.html.indexOf('<table');
      const tableEnd = p.html.lastIndexOf('</table>');
      if (tableStart !== -1 && tableEnd !== -1) {
        pageInner = p.html.substring(tableStart, tableEnd + 8);
      }
    }

    if (pageInner.trim()) {
      pageContents.push(`
        <!-- PAGE ${idx + 1}: ${p.title} -->
        <div class="bundle-page black-and-white-page">
          ${pageInner}
        </div>
      `);
    }
  });

  const bundleTitle = getFormattedDocTitle('BUNDLE', doc);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${bundleTitle}</title>
        <style>
          /* Font family: Arial */
          
          body {
            font-family: "Arial MT", "Arial Bold", "Arial", sans-serif !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #0f172a;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 11px;
            line-height: 1.4;
          }

          body, table, th, td, div, span, p, label {
            font-family: "Arial MT", "Arial Bold", "Arial", sans-serif !important;
          }

          b, strong, th, .font-bold, .font-black {
            font-family: "Arial MT", "Arial Bold", "Arial", sans-serif !important;
            font-weight: bold !important;
          }

          .bundle-page {
            display: block;
            position: relative !important;
            width: 100%;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
            padding: 4mm 6mm 6mm 6mm !important;
          }

          .bundle-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .doc-page-container + .doc-page-container {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          .bundle-page + .bundle-page {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
            }
            .bundle-page {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: always !important;
              break-after: page !important;
              overflow: hidden !important;
              width: 100% !important;
              max-width: 100% !important;
              height: 297mm !important;
              max-height: 297mm !important;
              padding: 4mm 6mm 6mm 6mm !important;
              box-sizing: border-box !important;
              position: relative !important;
              background-color: #ffffff !important;
            }
            .bundle-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .bundle-page + .bundle-page {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
            
            .print-footer, .system-generated-record {
              position: absolute !important;
              bottom: 4mm !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              text-align: center !important;
              font-size: 8px !important;
              font-weight: bold !important;
              color: #94a3b8 !important;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .work-order-print-footer {
              position: absolute !important;
              bottom: 10mm !important;
              left: 6mm !important;
              right: 6mm !important;
              width: calc(100% - 12mm) !important;
              background-color: #ffffff !important;
              box-sizing: border-box !important;
            }
            .bundle-page table {
              width: 100% !important;
            }
          }

          ${combinedStyles}
        </style>
      </head>
      <body class="black-and-white-page">
        ${pageContents.join('\n')}
      </body>
    </html>
  `;
};

export const generateHighFidelityDocHtml = (
  rawDoc: any,
  docTypeOverride?: 'WORK ORDER' | 'TAX INVOICE' | 'DELIVERY NOTE' | any,
  copyLabel?: string,
  options?: PrintOptions
): string => {
  if (!rawDoc) return '';

  const docTypeLabelInternal = (docTypeOverride && typeof docTypeOverride === 'string') ? docTypeOverride : (rawDoc.documentType || 'TAX INVOICE');

  // Handle Bundle printing (2x Work Order + 2x Tax Invoice + 2x Delivery Note)
  if (docTypeLabelInternal === 'BUNDLE' && !options?.singleCopy) {
    const bundleOpts = { ...options, singleCopy: true, isBundle: true };
    const wo1 = generateHighFidelityDocHtml(rawDoc, 'WORK ORDER', undefined, bundleOpts);
    const wo2 = generateHighFidelityDocHtml(rawDoc, 'WORK ORDER', undefined, bundleOpts);
    const inv1 = generateHighFidelityDocHtml(rawDoc, 'TAX INVOICE', undefined, bundleOpts);
    const inv2 = generateHighFidelityDocHtml(rawDoc, 'TAX INVOICE', undefined, bundleOpts);
    const dn1 = generateHighFidelityDocHtml(rawDoc, 'DELIVERY NOTE', undefined, bundleOpts);
    const dn2 = generateHighFidelityDocHtml(rawDoc, 'DELIVERY NOTE', undefined, bundleOpts);

    return combineDocPagesIntoBundleHtml(rawDoc, [
      { html: wo1, title: 'WORK ORDER 1' },
      { html: wo2, title: 'WORK ORDER 2' },
      { html: inv1, title: 'TAX INVOICE 1' },
      { html: inv2, title: 'TAX INVOICE 2' },
      { html: dn1, title: 'DELIVERY NOTE 1' },
      { html: dn2, title: 'DELIVERY NOTE 2' },
    ]);
  }

  // Handle Tax Invoice printing (Single copy only)
  if (docTypeLabelInternal === 'TAX INVOICE' && !copyLabel && !options?.singleCopy) {
    return generateHighFidelityDocHtml(rawDoc, 'TAX INVOICE', undefined, { ...options, singleCopy: true });
  }

  // Handle Delivery Note printing (Single copy without Original/Duplicate labels)
  if (docTypeLabelInternal === 'DELIVERY NOTE' && !copyLabel && !options?.singleCopy) {
    return generateHighFidelityDocHtml(rawDoc, 'DELIVERY NOTE', undefined, { ...options, singleCopy: true });
  }
  const companyProfile = getCompanyProfile();
  const data = {
    ...rawDoc,
    providerName: rawDoc.providerName || companyProfile.name,
    providerAddress: rawDoc.providerAddress || companyProfile.address,
    providerPhone: rawDoc.providerPhone || companyProfile.phone,
    providerEmail: rawDoc.providerEmail || companyProfile.email,
    providerTRN: rawDoc.providerTRN || companyProfile.trn,
    items: rawDoc.items || [],
    discountAmt: Number(rawDoc.discountAmt) || 0,
    freightAmt: Number(rawDoc.freightAmt) || 0,
    netWeight: Number(rawDoc.netWeight) || 0,
    grossWeight: Number(rawDoc.grossWeight) || 0,
    status: rawDoc.status || 'draft',
    documentType: rawDoc.documentType || 'TAX INVOICE',
    currency: rawDoc.currency || 'AED',
  };

  const formatCompanyNameWithSoleProp = (nameStr: string) => {
    if (!nameStr) return '';
    return nameStr.replace(/\((SOLE PROPRIETORSHIP|Sole Proprietorship)\)/gi, (match) => `<span style="font-size: 8.5px; font-weight: normal; font-style: italic;">${match}</span>`);
  };

  const printArea = options?.printArea ?? 'ENTIRE';
  const customPrintSections = options?.customPrintSections ?? {
    letterhead: true,
    metadata: true,
    buyerBox: true,
    signatures: true,
  };
  const excludedPrintItemIds = options?.excludedPrintItemIds ?? [];
  const showUnitWeightInPrint = options?.showUnitWeightInPrint ?? false;
  const showTotalWeightInPrint = options?.showTotalWeightInPrint ?? false;
  const showHsCodeInPrint = options?.showHsCodeInPrint ?? false;
  const showPltNoInPrint = options?.showPltNoInPrint ?? false;
  const printPageSize = options?.printPageSize ?? 'A4';
  const printFontSize = options?.printFontSize ?? '100%';
  const fontScaleRatio = parseFloat(printFontSize) / 100 || 1;
  const supplierFontSizeOpt = options?.supplierFontSize ? (options.supplierFontSize.endsWith('px') ? options.supplierFontSize : `${options.supplierFontSize}px`) : `${(11 * fontScaleRatio).toFixed(1)}px`;
  const customerFontSizeOpt = options?.customerFontSize ? (options.customerFontSize.endsWith('px') ? options.customerFontSize : `${options.customerFontSize}px`) : `${(10.5 * fontScaleRatio).toFixed(1)}px`;
  const docRefFontSizeOpt = options?.docRefFontSize ? (options.docRefFontSize.endsWith('px') ? options.docRefFontSize : `${options.docRefFontSize}px`) : `${(10 * fontScaleRatio).toFixed(1)}px`;
  const packingHeaderFontSizeOpt = options?.packingHeaderFontSize ? (options.packingHeaderFontSize.endsWith('px') ? options.packingHeaderFontSize : `${options.packingHeaderFontSize}px`) : `${(8.5 * fontScaleRatio).toFixed(1)}pt`;
  const packingTotalsFontSizeOpt = options?.packingTotalsFontSize ? (options.packingTotalsFontSize.endsWith('px') ? options.packingTotalsFontSize : `${options.packingTotalsFontSize}px`) : `${(10 * fontScaleRatio).toFixed(1)}px`;
  const packingItemsFontSizeOpt = options?.packingItemsFontSize ? (options.packingItemsFontSize.endsWith('px') ? options.packingItemsFontSize : `${options.packingItemsFontSize}px`) : `${(10.5 * fontScaleRatio).toFixed(1)}px`;
  const packingListColWidths = options?.packingListColWidths ?? {
    sn: 3,
    pltNo: 5,
    description: 20,
    grade: 8,
    size: 10,
    hsCode: 7,
    finish: 6,
    units: 5,
    qtyBox: 7,
    noBox: 5,
    totalQty: 8,
    unitWt: 8,
    totalWt: 8,
  };

  // Local live calculations for the printed document to prevent blank or incorrect totals
  const calculatedSums = (() => {
    let totalQty = 0;
    let totalWeightSum = 0;
    let vatAmountTotal = 0;

    const itemsList = data.items || [];
    const discountAmt = Number(data.discountAmt) || 0;

    const tempNetValues = itemsList.map((item: any, index: number) => {
      if (excludedPrintItemIds.includes(item.id) || !item.description || !String(item.description).trim()) {
        return { netItem: 0, itemQty: 0, totalWeight: 0, vatRate: 0 };
      }
      const qPerB = item.qtyPerBox !== undefined ? item.qtyPerBox : (item.qty || 0);
      const itemQty = data.documentType === 'PACKING LIST' 
        ? (qPerB * getEffectiveNumBoxes(itemsList, index))
        : (item.qty || 0);
      const netItem = itemQty * (item.unitPriceWOVAT !== undefined ? (Number(item.unitPriceWOVAT) || 0) : (Number(item.unitPrice) || 0));
      return {
        netItem,
        itemQty,
        totalWeight: itemQty * (item.unitWeight || 0),
        vatRate: Number(item.vatRate) || 0
      };
    });

    const netAmountWithoutVAT = tempNetValues.reduce((sum, val) => sum + val.netItem, 0);
    const discountRatio = netAmountWithoutVAT > 0 ? Math.min(1, discountAmt / netAmountWithoutVAT) : 0;

    tempNetValues.forEach((val) => {
      totalQty += val.itemQty;
      totalWeightSum += val.totalWeight;
      const netItemDiscounted = val.netItem * (1 - discountRatio);
      const vatOnItem = netItemDiscounted * (val.vatRate / 100);
      vatAmountTotal += vatOnItem;
    });

    const hasVatOnItems = itemsList.some((it: any) => !excludedPrintItemIds.includes(it.id) && Boolean(it.description && String(it.description).trim()) && (Number(it.vatRate) || 0) > 0);
    const isVATApplicable = !data.isZeroRatedExport || hasVatOnItems;
    const finalVatAmount = isVATApplicable ? vatAmountTotal : 0;
    const sumWOVatAndDiscount = netAmountWithoutVAT;
    const finalAfterDiscount = sumWOVatAndDiscount - discountAmt;
    const billGrandTotal = finalAfterDiscount + finalVatAmount + (data.freightAmt || 0);

    const isCancelled = data.status === 'cancelled';

    return {
      totalQty: isCancelled ? 0 : totalQty,
      subTotal: isCancelled ? 0 : sumWOVatAndDiscount,
      afterDiscount: isCancelled ? 0 : finalAfterDiscount,
      vatAmount: isCancelled ? 0 : finalVatAmount,
      grandTotal: isCancelled ? 0 : billGrandTotal,
      vatPercentEquivalent: isVATApplicable ? 5 : 0,
      totalWeight: isCancelled ? 0 : totalWeightSum
    };
  })();

  const printableItems = (data.items || []).filter((item: any) => {
    if (excludedPrintItemIds.includes(item.id)) return false;
    const desc = String(item.description || item.name || '').trim();
    if (!desc || desc === '—' || desc === '-') return false;
    return true;
  });

  // Expose exploded list if requested
  let explodedItems: any[] = [];
  let isExplodedView = false;
  let originalDocType = data.documentType;

  if (docTypeOverride === 'INVENTORY_EXPLODED_WORK_ORDER' || docTypeOverride === 'INVENTORY_EXPLODED_TAX_INVOICE') {
    isExplodedView = true;
    originalDocType = 'TAX INVOICE';
    explodedItems = [...printableItems];
  } else {
    explodedItems = [...printableItems];
  }

  const docTypeLabel = (docTypeOverride && typeof docTypeOverride === 'string' && !isExplodedView) ? docTypeOverride : originalDocType;
  const isDeliveryNoteStyle = true;
  const isCancelled = data.status === 'cancelled';
  // Forced true to ensure all document types have simple, clean white backgrounds and text as requested
  const isBlackAndWhiteOnly = true;
  const shouldShowPricesAndVat = (docTypeLabel === 'TAX INVOICE' || docTypeLabel === 'PURCHASE INVOICE' || docTypeLabel === 'SUPPLIER TAX INVOICE' || docTypeLabel === 'PROFORMA INVOICE' || (docTypeLabel !== 'DELIVERY NOTE' && docTypeLabel !== 'WORK ORDER' && data.showPricesAndVat) || isExplodedView);

  const getDescWithLinkedStock = (item: any) => {
    let descHtml = (item.description || '').replace(/\n/g, '<br/>');
    
    if (isExplodedView && item.linkedStockItems && item.linkedStockItems.length > 0) {
      let detailsHtml = `<div style="font-size: 7.5px; color: #334155; margin-top: 3px; font-weight: bold; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important; border-top: 1px dashed #cbd5e1; padding-top: 3px; text-transform: uppercase; line-height: 1.25;">`;
      item.linkedStockItems.forEach((st: any) => {
        const partNo = st.partNo || '—';
        const cat = getCleanCategoryName(st.categoryName || '—');
        const sub = getCleanSubcategoryName(st.subcategoryName || '—');
        const series = getShortThreadSeries(st.threadType || '—', st.categoryName || '—', st.subcategoryName || '—', st.grade || '', st.description || '');
        const grade = st.grade || '—';
        const finish = st.finish || 'SELF';
        const size = st.size || '—';
        const qty = `${st.qtyToDeduct} ${st.unit || 'PCS.'}`;
        
        detailsHtml += `
          <div style="margin-top: 2.5px;">
            ${partNo} | ${cat} | ${sub} | ${series} | ${grade} | ${finish} | ${size} | ${qty}
          </div>
        `;
      });
      detailsHtml += `</div>`;
      descHtml += detailsHtml;
    }
    return descHtml;
  };

  const cleanDispatchBy = sharedCleanDispatchBy;
  
  const showLetterhead = printArea === 'ENTIRE' || printArea === 'NO_SIGNATURES' || (printArea === 'CUSTOM' && customPrintSections.letterhead);
  const showMetadata = printArea === 'ENTIRE' || printArea === 'NO_LETTERHEAD' || printArea === 'NO_SIGNATURES' || (printArea === 'CUSTOM' && customPrintSections.metadata);
  const showBuyerBox = printArea === 'ENTIRE' || printArea === 'NO_LETTERHEAD' || printArea === 'NO_SIGNATURES' || (printArea === 'CUSTOM' && customPrintSections.buyerBox);
  const showSignatures = !options?.isBundle && (companyProfile.showSignatures !== false) && (printArea === 'ENTIRE' || printArea === 'NO_LETTERHEAD' || (printArea === 'CUSTOM' && customPrintSections.signatures));

  // Compute documentTotalWeight for printable Packing List footer
  const documentTotalWeight = explodedItems.reduce((total, item, idx) => {
    const effectiveNumBoxes = getEffectiveNumBoxes(explodedItems, idx);
    const qPerB = item.qtyPerBox !== undefined ? item.qtyPerBox : (item.qty || 0);
    const totalQty = qPerB * effectiveNumBoxes;
    return total + (totalQty * (item.unitWeight || 0));
  }, 0);

  // Paginate items function for clean page breaks in Sales/Delivery/WO print PDFs
  const getItemUnits = (it: Record<string, any>) => {
    const desc = (it.description || '').trim();
    if (desc.length > 90) return 2.2;
    if (desc.length > 45) return 1.5;
    return 1.0;
  };

  const paginateDocItems = <T extends Record<string, any>>(allItems: T[], isWorkOrderOrDeliveryNote: boolean) => {
    const total = allItems.length;
    if (total === 0) {
      return [{ pageNum: 1, items: [], isLast: true, startIdx: 0 }];
    }

    const isWO = docTypeLabel === 'WORK ORDER';
    const isPO = docTypeLabel === 'PURCHASE ORDER';
    const isPR = docTypeLabel === 'PURCHASE REQUEST';
    const totalUnits = allItems.reduce((acc, it) => acc + getItemUnits(it), 0);

    const singlePageLimit = isWO ? 28 : (isPO ? 13 : (isPR ? 24 : (isWorkOrderOrDeliveryNote ? 16 : 14)));

    if (totalUnits <= singlePageLimit) {
      return [{ pageNum: 1, items: allItems, isLast: true, startIdx: 0 }];
    }

    const pages: { pageNum: number; items: T[]; isLast: boolean; startIdx: number }[] = [];
    let currIdx = 0;
    let pageNum = 1;

    while (currIdx < total) {
      const remainingItems = allItems.slice(currIdx);
      const remCount = remainingItems.length;
      const remUnits = remainingItems.reduce((acc, it) => acc + getItemUnits(it), 0);

      const isFirstPage = (pageNum === 1);
      const maxUnitsNoSum = isFirstPage ? (isWO ? 32 : (isPO ? 15 : (isPR ? 26 : 22))) : (isPO ? 15 : 24);
      const maxUnitsWithSum = isFirstPage ? (isWO ? 28 : (isPO ? 13 : (isPR ? 24 : (isWorkOrderOrDeliveryNote ? 16 : 14)))) : (isWO ? 28 : (isPO ? 13 : (isPR ? 24 : (isWorkOrderOrDeliveryNote ? 16 : 14))));

      if (remUnits <= maxUnitsWithSum) {
        pages.push({
          pageNum,
          items: remainingItems,
          isLast: true,
          startIdx: currIdx
        });
        break;
      }

      let accUnits = 0;
      let takeCount = 0;

      for (let i = 0; i < remCount; i++) {
        const u = getItemUnits(remainingItems[i]);
        if (accUnits + u > maxUnitsNoSum) {
          break;
        }
        accUnits += u;
        takeCount++;
      }

      if (takeCount === 0) takeCount = 1;

      // Ensure we leave at least 1 item for the next page, but don't over-split
      const leftCount = remCount - takeCount;
      if (leftCount === 0 && remUnits > maxUnitsWithSum) {
        takeCount = Math.max(1, takeCount - 2);
      }

      pages.push({
        pageNum,
        items: allItems.slice(currIdx, currIdx + takeCount),
        isLast: false,
        startIdx: currIdx
      });

      currIdx += takeCount;
      pageNum++;
    }

    return pages;
  };

  const buildRowsHtmlForItems = (itemsList: any[], startIdx: number = 0) => {
    let rowsHtml = '';
    let fillerRowHtml = '';

    if (docTypeLabel === 'WORK ORDER') {
      rowsHtml = buildGroupedRowsHtml(itemsList, (item, index) => {
        const itemSn = (item.sn !== undefined && item.sn !== null && item.sn !== '') ? item.sn : (startIdx + index + 1);
        const colorStyle = item.textColor ? `color: ${item.textColor} !important;` : '';
        return `
          <tr style="border-bottom: 1px solid #000000; page-break-inside: avoid; break-inside: avoid; height: 24px; ${colorStyle}">
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; line-height: 1.25; ${colorStyle}">${itemSn}</td>
            <td class="desc-cell" style="padding: 4px 6px; text-align: left !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10.5px; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; line-height: 1.25; ${colorStyle}">${getDescWithLinkedStock(item)}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${item.finish || item.coating || '—'}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${(item.unit && item.unit !== '—' && item.unit !== '-') ? item.unit : ''}</td>
            <td style="padding: 4px 6px; text-align: right !important; vertical-align: middle !important; font-weight: 900; font-family: Arial, sans-serif !important; font-size: 10.5px; line-height: 1.25; ${colorStyle}">${item.qty ? item.qty.toLocaleString() : '0'}</td>
          </tr>
        `;
      });
      fillerRowHtml = `
        <tbody style="height: auto;">
          <tr class="filler-row" style="height: 20px;">
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-bottom: none !important;">&nbsp;</td>
          </tr>
        </tbody>
      `;
    } else if (docTypeLabel === 'DELIVERY NOTE') {
      rowsHtml = buildGroupedRowsHtml(itemsList, (item, index) => {
        const itemSn = (item.sn !== undefined && item.sn !== null && item.sn !== '') ? item.sn : (startIdx + index + 1);
        const colorStyle = item.textColor ? `color: ${item.textColor} !important;` : '';
        return `
          <tr style="border-bottom: 1px solid #000000; page-break-inside: avoid; break-inside: avoid; height: 24px; ${colorStyle}">
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; line-height: 1.25; ${colorStyle}">${itemSn}</td>
            <td class="desc-cell" style="padding: 4px 6px; text-align: left !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10.5px; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; line-height: 1.25; ${colorStyle}">${getDescWithLinkedStock(item)}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${item.finish || item.coating || '—'}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${(item.unit && item.unit !== '—' && item.unit !== '-') ? item.unit : ''}</td>
            <td style="padding: 4px 6px; text-align: right !important; vertical-align: middle !important; font-weight: 900; font-family: Arial, sans-serif !important; font-size: 10.5px; line-height: 1.25; ${colorStyle}">${item.qty ? item.qty.toLocaleString() : '0'}</td>
          </tr>
        `;
      });
      fillerRowHtml = `
        <tbody style="height: auto;">
          <tr class="filler-row" style="height: 20px;">
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-bottom: none !important;">&nbsp;</td>
          </tr>
        </tbody>
      `;
    } else if (docTypeLabel === 'PURCHASE REQUEST' || docTypeLabel === 'PURCHASE ORDER') {
      rowsHtml = buildGroupedRowsHtml(itemsList, (item, index) => {
        const itemSn = (item.sn !== undefined && item.sn !== null && item.sn !== '') ? item.sn : (startIdx + index + 1);
        const colorStyle = item.textColor ? `color: ${item.textColor} !important;` : '';
        return `
          <tr style="page-break-inside: avoid; break-inside: avoid; height: 24px; ${colorStyle}">
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(9.5 * fontScaleRatio).toFixed(1)}px; line-height: 1.25; ${colorStyle}">${itemSn}</td>
            <td class="desc-cell" style="padding: 4px 6px; text-align: left !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; line-height: 1.25; ${colorStyle}">${getDescWithLinkedStock(item)}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(9.5 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${item.finish || '—'}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(9.5 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${(item.unit && item.unit !== '—' && item.unit !== '-') ? item.unit : ''}</td>
            <td style="padding: 4px 6px; text-align: right !important; vertical-align: middle !important; font-weight: 900; font-family: Arial, sans-serif !important; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; line-height: 1.25; ${colorStyle}">${item.qty ? item.qty.toLocaleString() : '0'}</td>
          </tr>
        `;
      });
      fillerRowHtml = `
        <tbody style="height: auto;">
          <tr class="filler-row" style="height: 20px;">
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-bottom: none !important;">&nbsp;</td>
          </tr>
        </tbody>
      `;
    } else if (shouldShowPricesAndVat) {
      rowsHtml = buildGroupedRowsHtml(itemsList, (item, index) => {
        const itemSn = (item.sn !== undefined && item.sn !== null && item.sn !== '') ? item.sn : (startIdx + index + 1);
        const safeQty = Number(item.qty) || 0;
        const safePrice = item.unitPriceWOVAT !== undefined ? (Number(item.unitPriceWOVAT) || 0) : (Number(item.unitPrice) || 0);
        const safeVatRate = item.vatRate !== undefined ? (Number(item.vatRate) || 0) : 5;

        const extPrice = safeQty * safePrice;
        const disc = Number(item.discount || item.discountAmount) || 0;
        const totalExclVat = Math.max(0, extPrice - disc);
        const taxVal = totalExclVat * (safeVatRate / 100);
        const grossAmt = totalExclVat + taxVal;
        const finishVal = (item.finish && item.finish !== '—' && item.finish !== '-') ? item.finish : '';
        const hasData = safeQty > 0 || safePrice > 0 || extPrice > 0 || grossAmt > 0;
        const colorStyle = item.textColor ? `color: ${item.textColor} !important;` : '';
        
        return `
          <tr style="page-break-inside: avoid; break-inside: avoid; height: 24px; ${colorStyle}">
            <td style="padding: 4px 3px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${itemSn}</td>
            <td class="desc-cell" style="padding: 4px 6px; text-align: left !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; line-height: 1.25; ${colorStyle}">${getDescWithLinkedStock(item)}</td>
            <td style="padding: 4px 3px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 9.5px; text-transform: uppercase; word-break: break-word !important; overflow-wrap: break-word !important; white-space: pre-wrap !important; line-height: 1.25; ${colorStyle}">${finishVal}</td>
            ${data.showLineHsCode ? `<td style="padding: 4px 3px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${(item.hsCode && item.hsCode !== '—') ? item.hsCode : ''}</td>` : ''}
            <td style="padding: 4px 3px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 9.5px; text-transform: uppercase; line-height: 1.25; ${colorStyle}">${(item.unit && item.unit !== '—' && item.unit !== '-') ? item.unit : ''}</td>
            <td style="padding: 4px 3px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: 800; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${safeQty ? safeQty.toLocaleString() : ''}</td>
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${hasData && safePrice ? safePrice.toFixed(2) : ''}</td>
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${hasData && extPrice ? extPrice.toFixed(2) : (hasData && safeQty ? '0.00' : '')}</td>
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${hasData && disc ? disc.toFixed(2) : (hasData ? '0.00' : '')}</td>
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${hasData && totalExclVat ? totalExclVat.toFixed(2) : ''}</td>
            <td style="padding: 4px 3px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${hasData ? `${safeVatRate}%` : ''}</td>
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid #000000; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; ${colorStyle}">${hasData && taxVal ? taxVal.toFixed(2) : ''}</td>
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 9.5px; line-height: 1.25; color: #000000;">${hasData && grossAmt ? grossAmt.toFixed(2) : ''}</td>
          </tr>
        `;
      });
      fillerRowHtml = `
        <tbody style="height: 100%;">
          <tr class="filler-row" style="height: 100%;">
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            ${data.showLineHsCode ? '<td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>' : ''}
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-bottom: none !important;">&nbsp;</td>
          </tr>
        </tbody>
      `;
    } else if (docTypeLabel === 'PACKING LIST') {
      const rowSpans = computeRowSpans(itemsList);
      rowsHtml = buildGroupedRowsHtml(itemsList, (item, index) => {
        const itemSn = (item.sn !== undefined && item.sn !== null && item.sn !== '') ? item.sn : (startIdx + index + 1);
        const isFirstInBox = rowSpans[item.id] > 0;
        const groupCount = rowSpans[item.id];
        const effectiveNumBoxes = getEffectiveNumBoxes(itemsList, index);
        const packagingTypeWord = item.packagingType || 'BOX';
        const totalQtyVal = Number(item.qty || 0);
        const rawUnitWt = item.unitWeight;
        const unitWtVal = (rawUnitWt !== undefined && rawUnitWt !== null && rawUnitWt !== '') ? Number(rawUnitWt) : NaN;
        let formattedUnitWt = '';
        if (!isNaN(unitWtVal)) {
          if (unitWtVal === 0) {
            formattedUnitWt = '0';
          } else {
            let s = unitWtVal.toString();
            if (s.startsWith('.')) s = '0' + s;
            formattedUnitWt = s;
          }
        }
        const pltLabel = (item.boxNo || item.pltNo || '').trim();
        const hasBoxData = Boolean(item.boxNo || item.pltNo || (item.numBoxes && item.numBoxes > 0));
        const colorStyle = item.textColor ? `color: ${item.textColor} !important;` : '';

        let pltTdHtml = '';
        if (showPltNoInPrint) {
          if (isFirstInBox && pltLabel) {
            pltTdHtml = `<td rowspan="${groupCount}" style="padding: 4px 4px; font-weight: bold; font-family: Arial, sans-serif !important; background-color: #f8fafc; text-align: center !important; border-right: 1px solid black; vertical-align: middle !important; font-size: 11px; line-height: 1.25; ${colorStyle}">${pltLabel}</td>`;
          } else if (item.boxNo || item.pltNo) {
            pltTdHtml = '';
          } else {
            pltTdHtml = `<td style="padding: 4px 4px; font-weight: bold; font-family: Arial, sans-serif !important; text-align: center !important; border-right: 1px solid black; vertical-align: middle !important; font-size: 11px; line-height: 1.25; ${colorStyle}"></td>`;
          }
        }

        let noBoxTdHtml = '';
        if (isFirstInBox && hasBoxData) {
          const displayNumBoxes = effectiveNumBoxes > 0 ? effectiveNumBoxes : '';
          noBoxTdHtml = `
            <td rowspan="${groupCount}" style="padding: 4px 4px; text-align: center !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; vertical-align: middle !important; background-color: #f8fafc; font-size: 11.5px; line-height: 1.25; ${colorStyle}">
              ${displayNumBoxes}
              ${displayNumBoxes ? `<div style="font-size: 9px; color: ${item.textColor || '#475569'}; font-weight: bold; font-family: Arial, sans-serif !important; margin-top: 1px;">${packagingTypeWord}</div>` : ''}
            </td>
          `;
        } else if (item.boxNo || item.pltNo) {
          noBoxTdHtml = '';
        } else {
          const displayNumB = (item.numBoxes && item.numBoxes > 0) ? item.numBoxes : '';
          noBoxTdHtml = `<td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 11.5px; line-height: 1.25; ${colorStyle}">${displayNumB}</td>`;
        }

        let totalWtTdHtml = '';
        if (showTotalWeightInPrint) {
          if (isFirstInBox && hasBoxData) {
            const groupTotalWt = getGroupTotalWeight(itemsList, index, groupCount);
            totalWtTdHtml = `
              <td rowspan="${groupCount}" style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 11px; line-height: 1.25; background-color: #f8fafc; color: ${item.textColor || '#047857'};">
                ${groupTotalWt > 0 ? groupTotalWt.toFixed(3) : ''}
              </td>
            `;
          } else if (item.boxNo || item.pltNo) {
            totalWtTdHtml = '';
          } else {
            const rowTotalWt = totalQtyVal * (isNaN(unitWtVal) ? 0 : unitWtVal);
            totalWtTdHtml = `
              <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 11px; line-height: 1.25; color: ${item.textColor || '#047857'};">
                ${rowTotalWt > 0 ? rowTotalWt.toFixed(3) : ''}
              </td>
            `;
          }
        }

        const qPerBVal = item.qtyPerBox !== undefined && item.qtyPerBox > 0 
          ? item.qtyPerBox.toLocaleString() 
          : (totalQtyVal > 0 && !hasBoxData ? totalQtyVal.toLocaleString() : '');

        return `
          <tr style="page-break-inside: avoid; break-inside: avoid; font-size: 10px; font-family: Arial, sans-serif !important; line-height: 1.25; ${colorStyle}">
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 9.5px; ${colorStyle}">${itemSn}</td>
            ${pltTdHtml}
            <td class="desc-cell" style="padding: 4px 6px; text-align: left !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; overflow-wrap: break-word !important; line-height: 1.25; font-size: 10px; ${colorStyle}">${getDescWithLinkedStock(item)}</td>
            <td class="grade-cell" style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; overflow-wrap: break-word !important; font-size: 9.5px; ${colorStyle}">${(item.grade && item.grade !== '—') ? item.grade : ''}</td>
            <td class="size-cell" style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; overflow-wrap: break-word !important; font-size: 9.5px; ${colorStyle}">${(item.size && item.size !== '—') ? item.size : ''}</td>
            ${showHsCodeInPrint ? `<td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; text-transform: uppercase; white-space: normal !important; word-break: break-word !important; font-size: 9px; ${colorStyle}">${(item.hsCode && item.hsCode !== '—') ? item.hsCode : ''}</td>` : ''}
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; text-transform: uppercase; font-size: 9.5px; ${colorStyle}">${(item.finish && item.finish !== '—') ? item.finish : ''}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; text-transform: uppercase; font-size: 9.5px; ${colorStyle}">${(item.unit && item.unit !== '—' && item.unit !== '-') ? item.unit : ''}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; font-size: 10px; ${colorStyle}">${qPerBVal}</td>
            ${noBoxTdHtml}
            ${showUnitWeightInPrint ? `<td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: 1px solid black; font-weight: bold; font-family: Arial, sans-serif !important; color: ${item.textColor || '#1e293b'}; font-size: 9.5px;">${formattedUnitWt}</td>` : ''}
            <td style="padding: 4px 4px; text-align: right !important; vertical-align: middle !important; border-right: ${showTotalWeightInPrint ? '1px solid black' : 'none'}; font-weight: 900; font-family: Arial, sans-serif !important; font-size: 11px; ${colorStyle}">${totalQtyVal > 0 ? totalQtyVal.toLocaleString() : ''}</td>
            ${totalWtTdHtml}
          </tr>
        `;
      });
      fillerRowHtml = `
        <tbody style="height: 100%;">
          <tr class="filler-row" style="height: 100%;">
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            ${showPltNoInPrint ? '<td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>' : ''}
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            ${showHsCodeInPrint ? '<td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>' : ''}
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            ${showUnitWeightInPrint ? '<td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>' : ''}
            <td style="${showTotalWeightInPrint ? 'border-right: 1px solid #000000;' : ''} border-bottom: none !important;">&nbsp;</td>
            ${showTotalWeightInPrint ? '<td style="border-bottom: none !important;">&nbsp;</td>' : ''}
          </tr>
        </tbody>
      `;
    } else {
      rowsHtml = buildGroupedRowsHtml(itemsList, (item, index) => {
        const itemSn = (item.sn !== undefined && item.sn !== null && item.sn !== '') ? item.sn : (startIdx + index + 1);
        return `
          <tr style="page-break-inside: avoid; break-inside: avoid; height: 24px;">
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; line-height: 1.25;">${itemSn}</td>
            <td style="padding: 4px 6px; text-align: left !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; line-height: 1.25;">${getDescWithLinkedStock(item)}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; word-break: break-word !important; overflow-wrap: break-word !important; white-space: pre-wrap !important; line-height: 1.25;">${item.finish || '—'}</td>
            <td style="padding: 4px 4px; text-align: center !important; vertical-align: middle !important; border-right: 1px solid #000000; font-weight: bold; font-family: Arial, sans-serif !important; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; line-height: 1.25;">${(item.unit && item.unit !== '—' && item.unit !== '-') ? item.unit : ''}</td>
            <td style="padding: 4px 6px; text-align: right !important; vertical-align: middle !important; font-weight: 900; font-family: Arial, sans-serif !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1.25;">${item.qty ? item.qty.toLocaleString() : '0'}</td>
          </tr>
        `;
      });
      fillerRowHtml = `
        <tbody style="height: 100%;">
          <tr class="filler-row" style="height: 100%;">
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-right: 1px solid #000000; border-bottom: none !important;">&nbsp;</td>
            <td style="border-bottom: none !important;">&nbsp;</td>
          </tr>
        </tbody>
      `;
    }
    return rowsHtml + fillerRowHtml;
  };

  // Paginate items for page rendering
  const pagesArr = paginateDocItems(explodedItems, isDeliveryNoteStyle);
  const docTotalPages = pagesArr.length;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${getFormattedDocTitle(docTypeLabelInternal, data)}</title>
        <style>
          /* Global Font family: Arial across all elements */
          * , *::before, *::after {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          body {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            padding: 9mm 8mm 8mm 8mm;
            color: #000000;
            background-color: #ffffff;
            margin: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 9.5px;
            line-height: 1.25;
            letter-spacing: 0.01em;
            box-sizing: border-box !important;
          }
          body, table, td, th, div, span, p, label, input, button, tr, tbody, thead {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          b, strong, th, h1, h2, h3, h4, .font-bold, .font-black, .font-extrabold {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            font-weight: bold !important;
          }
          .supplier-details { font-size: 9.5px; }
          .buyer-box, .buyer-detail-item, .buyer-val { font-size: 9.5px; }
          .meta-table, .meta-table td, .meta-label, .meta-val { font-size: 9.5px; }
          .items-table th, table th {
            font-size: 9.5px !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            font-weight: bold !important;
            letter-spacing: 0.15px !important;
            padding: 4px 3px !important;
            line-height: 1.1 !important;
            text-align: center !important;
            vertical-align: middle !important;
            text-transform: uppercase !important;
            background-color: #f1f5f9 !important;
            color: #000000 !important;
          }
          .items-table td {
            font-size: 9.5px !important;
            padding: 2.5px 3px !important;
            line-height: 1.2 !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .desc-cell, td.desc-cell {
            text-align: left !important;
            padding-left: 6px !important;
            font-size: 10px !important;
          }
          .sums-box, .sums-table, .words-box, .summary-table { font-size: 9.5px; }
          @media print {
            html, body {
              zoom: ${fontScaleRatio} !important;
              padding: 0 !important;
              margin: 0 !important;
              background-color: #ffffff !important;
              background: #ffffff !important;
            }
          }
          .text-mono {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .signatures-row {
            display: block !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            break-inside: avoid-page !important;
          }
          .signatures-row > td {
            display: block !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            break-inside: avoid-page !important;
          }
          .cancelled-stamp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-22deg);
            border: 8px double #dc2626;
            padding: 16px 32px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.94);
            box-shadow: none;
            text-align: center;
            z-index: 50;
            pointer-events: none !important;
            max-width: 320px;
          }
          .cancelled-stamp h1 {
            font-size: 48px;
            font-weight: 900;
            color: #dc2626;
            margin: 0;
          }
          .cancelled-stamp h2 {
            font-size: 14px;
            font-weight: bold;
            color: #991b1b;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            margin: 6px 0 0 0;
          }
          .cancelled-stamp p {
            font-size: 8.5px;
            color: #64748b;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            margin: 3px 0 0 0;
          }
          .header-layout {
            display: table;
            width: 100%;
            margin-bottom: 10px;
          }
          .header-col-7 {
            display: table-cell;
            width: 58%;
            vertical-align: top;
          }
          .header-col-5 {
            display: table-cell;
            width: 42%;
            vertical-align: top;
          }
          .supplier-title {
            font-size: 9.5px;
            font-weight: bold;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            color: #000000;
            margin-bottom: 2px;
            letter-spacing: 0.04em;
          }
          .supplier-name {
            font-size: 11.5px;
            font-weight: bold;
            color: #000000;
            margin: 0 0 2px 0;
            text-transform: uppercase;
          }
          .supplier-details {
            font-size: 9.5px;
            color: #000000;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            line-height: 1.35;
          }
          .meta-table-container {
            border: 1.5px solid #000000;
            border-radius: 8px;
            overflow: hidden;
            box-sizing: border-box;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            border: none !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .meta-table td {
            border: 1px solid #000000;
            padding: 0.5px 3px 2px 3px !important;
            vertical-align: middle !important;
            text-align: center !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            line-height: 1 !important;
          }
          .meta-table tr:first-child td,
          .meta-table tr:last-child td {
            vertical-align: middle !important;
            text-align: center !important;
            padding: 0.5px 3px 2px 3px !important;
            line-height: 1 !important;
          }
          .meta-table tr:first-child td { border-top: none; }
          .meta-table tr:last-child td { border-bottom: none; }
          .meta-table td:first-child { border-left: none; }
          .meta-table td:last-child { border-right: none; }
          .meta-label {
            font-size: 9px;
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
            display: block;
            margin-bottom: 1px;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .meta-val {
            font-weight: bold;
            font-size: 9.5px;
            color: #000000;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-box {
            border: 1.5px solid #000000;
            padding: 5px 8px;
            border-radius: 8px;
            background-color: #ffffff;
            margin-top: 4px;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .logistics-box {
            border: 1.5px solid #000000;
            padding: 4px 6px;
            border-radius: 8px;
            background-color: #ffffff;
            margin-top: 4px;
            box-sizing: border-box;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .logistics-title {
            font-size: 9.5px;
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            margin-bottom: 3px;
            letter-spacing: 0.08em;
            border-bottom: 1px solid #000000;
            padding-bottom: 2px;
          }
          .logistics-cell-left {
            width: 50%;
            vertical-align: top;
            padding-right: 8px !important;
            border-right: 1px solid #000000 !important;
            border-top: none !important;
            border-bottom: none !important;
            border-left: none !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .logistics-cell-right {
            width: 50%;
            vertical-align: top;
            padding-left: 8px !important;
            border: none !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-grid {
            display: table;
            width: 100%;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-col-7 {
            display: table-cell;
            width: 58%;
            vertical-align: top;
            padding-right: 8px;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-col-5 {
            display: table-cell;
            width: 42%;
            vertical-align: top;
            padding-left: 8px;
            border-left: 1.5px solid #000000;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-title {
            font-size: 9.5px;
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            margin-bottom: 2px;
            letter-spacing: 0.03em;
          }
          .buyer-name {
            font-size: 11.5px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 2px;
            text-transform: uppercase;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
            border-bottom: 1.2px dashed #000000 !important;
            padding: 2px 0;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .buyer-detail-item:last-child {
            border-bottom: 1.2px dashed #000000 !important;
          }
          .items-table-container {
            border: 1px solid #000000 !important;
            border-radius: 6px !important;
            overflow: hidden !important;
            margin: 3px 0 !important;
            background-color: #ffffff !important;
            flex: 1 1 auto !important;
            min-height: 140px !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .items-table {
            width: 100% !important;
            height: 100% !important;
            flex: 1 1 auto !important;
            border-collapse: collapse !important;
            margin: 0 !important;
            border: none !important;
            table-layout: ${data.documentType === 'PACKING LIST' ? 'fixed' : 'auto'};
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .items-table tbody {
            height: 100% !important;
          }
          .items-table thead tr {
            border-top: 1.5px solid #000000 !important;
            border-bottom: 1.5px solid #000000 !important;
          }
          .items-table th {
            background-color: #f1f5f9;
            color: #000000;
            border-right: 1px solid #000000 !important;
            border-bottom: 1.5px solid #000000 !important;
            border-top: 1.5px solid #000000 !important;
            border-left: none !important;
            font-weight: bold !important;
            padding: 3px 4px !important;
            height: 28px !important;
            font-size: 9.5px !important;
            text-transform: uppercase;
            letter-spacing: 0.15px;
            word-wrap: normal !important;
            overflow-wrap: normal !important;
            white-space: nowrap !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            vertical-align: middle !important;
            line-height: 1 !important;
          }
          .items-table td {
            border-right: 1px solid #000000 !important;
            border-bottom: none !important;
            border-top: none !important;
            border-left: none !important;
            padding: 2.5px 4px !important;
            vertical-align: middle !important;
            word-wrap: normal !important;
            overflow-wrap: normal !important;
            white-space: nowrap !important;
            font-size: 9.5px !important;
            color: #000000;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            line-height: 1.18 !important;
          }
          .items-table td.desc-cell,
          .items-table td.grade-cell,
          .items-table td.size-cell {
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
          .items-table th:last-child, .items-table td:last-child { border-right: none !important; }
          .items-table tr.filler-row td {
            border-bottom: none !important;
            padding: 0 !important;
            height: 100% !important;
          }
          .meta-table td {
            vertical-align: top !important;
            text-align: center !important;
            padding: 2.5px 3px 0px 3px !important;
            line-height: 1.1 !important;
          }
          .meta-table tr:first-child td,
          .meta-table tr:last-child td {
            vertical-align: top !important;
            text-align: center !important;
            padding: 2.5px 3px 0px 3px !important;
            line-height: 1.1 !important;
          }
          .summary-table td {
            vertical-align: top !important;
            padding: 3px 8px 0px 8px !important;
            line-height: 1.1 !important;
          }
          .items-table tr:nth-child(even) {
            background-color: ${options?.enableStripeView ? '#f8fafc' : '#ffffff'};
          }
          .print-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 8px;
            font-weight: bold;
            color: #94a3b8;
            margin-top: 16px;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .work-order-print-footer {
            display: block;
            margin-top: 16px;
            box-sizing: border-box;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .footer-grid {
            display: table;
            width: 100%;
            border: none !important;
            box-sizing: border-box;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .footer-grid-break {
            page-break-before: always !important;
            break-before: always !important;
            border: none !important;
          }
          .words-box {
            display: table-cell;
            width: 58%;
            padding: 12px;
            border-right: 1px solid #000000;
            vertical-align: top;
          }
          .sums-box {
            display: table-cell;
            width: 42%;
            padding: 0;
            vertical-align: top;
          }
          .sum-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 10px;
            border-bottom: 1px solid #000000;
          }
          .sum-row:last-of-type {
            border-bottom: none;
          }
          .doc-page-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            position: relative;
            min-height: auto;
            height: auto;
            page-break-after: auto;
            break-after: auto;
          }
          .doc-top-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            min-height: 0;
          }
          .doc-bottom-wrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            margin-top: auto;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .doc-page-container + .doc-page-container {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          /* Live in-place editable cues */
          [contenteditable="true"] {
            outline: none;
            transition: background-color 0.15s ease, box-shadow 0.15s ease;
          }
          body.live-edit-active [contenteditable="true"]:hover {
            outline: 1px dashed #2563eb !important;
            background-color: rgba(239, 246, 255, 0.5) !important;
            cursor: text !important;
          }
          body.live-edit-active [contenteditable="true"]:focus {
            outline: 2px solid #2563eb !important;
            background-color: #eff6ff !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
          }

          @media print {
            @page {
              size: ${printPageSize === 'A4' ? 'A4 portrait' : printPageSize === 'LETTER' ? 'letter portrait' : 'legal portrait'};
              margin: 2.5mm 5mm 3.5mm 5mm !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              height: auto !important;
              min-height: 0 !important;
            }
            .doc-page-container {
              height: 280mm !important;
              max-height: 280mm !important;
              min-height: 280mm !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: flex-start !important;
              box-sizing: border-box !important;
              position: relative !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .doc-top-wrapper {
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              flex: 1 1 auto !important;
              min-height: 0 !important;
            }
            .doc-bottom-wrapper {
              width: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              margin-top: auto !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .doc-page-container:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .doc-page-container + .doc-page-container {
              page-break-before: always !important;
              break-before: page !important;
              margin-top: 0 !important;
              padding-top: 0 !important;
            }
            /* Prevent breaking items inside rows and repeat headers on page split */
            .items-table tr, .meta-table tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .signatures-row {
              display: block !important;
              width: 100% !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              break-inside: avoid-page !important;
            }
            .signatures-row > td {
              display: block !important;
              width: 100% !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              break-inside: avoid-page !important;
            }
            .items-table thead {
              display: table-header-group !important;
            }
            /* Table container and items table print styling */
            .items-table-container {
              border: 1px solid #000000 !important;
              border-radius: 6px !important;
              overflow: hidden !important;
              background-color: #ffffff !important;
              flex: 1 1 auto !important;
              display: flex !important;
              flex-direction: column !important;
              min-height: 140px !important;
              margin: 3px 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }
            .items-table tbody {
              height: 100% !important;
            }
            [contenteditable="true"], [contenteditable="true"]:hover, [contenteditable="true"]:focus {
              outline: none !important;
              background-color: transparent !important;
              box-shadow: none !important;
            }
            .meta-container {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .items-table {
              width: 100% !important;
              height: 100% !important;
              flex: 1 1 auto !important;
              border-collapse: collapse !important;
              border: none !important;
              page-break-inside: auto !important;
            }
            .page-number-counter {
              display: inline-block !important;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
              font-weight: bold !important;
              font-size: 9px !important;
              color: #000000 !important;
            }
            .items-table thead tr {
              border-top: 1.5px solid #000000 !important;
              border-bottom: 1.5px solid #000000 !important;
            }
            .items-table th {
              border-right: 1px solid #000000 !important;
              border-bottom: 1.5px solid #000000 !important;
              border-top: 1.5px solid #000000 !important;
              border-left: none !important;
              background-color: #f1f5f9 !important;
              color: #000000 !important;
              padding: 0px 3px 7px 3px !important;
              height: 32px !important;
              text-align: center !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
              font-weight: bold !important;
              font-size: 9.5px !important;
              line-height: 1 !important;
            }
            .items-table th:last-child {
              border-right: none !important;
            }
            .items-table td {
              border-right: 1px solid #000000 !important;
              border-bottom: none !important;
              border-top: none !important;
              border-left: none !important;
              padding: 2.5px 3px !important;
              vertical-align: middle !important;
              color: #000000 !important;
              font-size: 9.5px !important;
              line-height: 1.2 !important;
            }
            .items-table td:last-child {
              border-right: none !important;
            }
            .items-table tr.filler-row td {
              border-bottom: none !important;
              padding: 0 !important;
              height: 100% !important;
            }
            .desc-cell, td.desc-cell {
              text-align: left !important;
              padding-left: 6px !important;
              font-size: 10px !important;
            }
            .print-footer {
              position: fixed !important;
              bottom: 2mm !important;
              left: 0 !important;
              right: 0 !important;
              text-align: center !important;
              font-size: 8.5px !important;
              font-weight: bold !important;
              color: #94a3b8 !important;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              width: 100% !important;
            }
            .system-generated-record {
              position: absolute !important;
              bottom: 1.5mm !important;
              left: 0 !important;
              right: 0 !important;
              text-align: center !important;
              font-size: 8.5px !important;
              font-weight: bold !important;
              color: #64748b !important;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              width: 100% !important;
            }
            .signatures-wrapper, .signatures-section, .signatures-row, .signatures-container, .work-order-print-footer {
              margin-top: auto !important;
              width: 100% !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body class="${isBlackAndWhiteOnly ? 'black-and-white-page' : 'color-page'}">
        <div style="width: 100%; margin: 0; padding: 0;">
          ${pagesArr.map((pageObj, pageIdx) => `
            <div class="doc-page-container" style="position: relative; width: 100%; display: flex; flex-direction: column; justify-content: flex-start; margin: 0; padding: 0; box-sizing: border-box; ${pageIdx > 0 ? 'page-break-before: always; break-before: page;' : ''}">
              ${options?.watermark ? `
                <div style="position: absolute; top: 48%; left: 50%; transform: translate(-50%, -50%) rotate(-32deg); font-size: 78px; font-weight: 900; color: rgba(15, 23, 42, ${options.watermarkOpacity || 0.12}); border: 6px solid rgba(15, 23, 42, ${options.watermarkOpacity || 0.12}); padding: 8px 36px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.18em; pointer-events: none; z-index: 999; white-space: nowrap; font-family: 'Arial Black', Impact, sans-serif;">
                  ${options.watermark}
                </div>
              ` : ''}
              <div class="doc-top-wrapper" style="width: 100%; display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0;">
              <!-- Void stamp if Cancelled -->
              ${isCancelled ? `
                <div class="cancelled-stamp">
                  <h1>CANCELLED</h1>
                  <h2>VOID / AUDIT LOCKED</h2>
                  <p>NO VALUE FOR UAE VAT AND ACCOUNT BALANCES</p>
                </div>
              ` : ''}

              <!-- Centered Document Title for Delivery Note -->
              ${showMetadata && isDeliveryNoteStyle && !data.isPurchase && docTypeLabel !== 'PURCHASE INVOICE' && docTypeLabel !== 'PURCHASE ORDER' && docTypeLabel !== 'PURCHASE REQUEST' && docTypeLabel !== 'SUPPLIER TAX INVOICE' && !(data.documentType && data.documentType.toUpperCase().includes('PURCHASE')) && data.documentType !== 'TAX INVOICE' && data.documentType !== 'TAX INVOICE & DELIVERY NOTE' && docTypeLabel !== 'TAX INVOICE' && docTypeLabel !== 'TAX INVOICE ONLY' && docTypeLabel !== 'PROFORMA INVOICE' && docTypeLabel !== 'WORK ORDER' && docTypeLabel !== 'PACKING LIST' && docTypeLabel !== 'DELIVERY NOTE' && docTypeLabel !== 'COATING DELIVERY NOTE' && docTypeLabel !== 'GOODS RETURN NOTE' ? `
                <div style="text-align: center; margin-bottom: 20px; margin-top: 5px;">
                  <h2 style="font-size: 20px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; margin: 0; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000; line-height: 1.4;">
                    ${docTypeLabel === 'GOODS RETURN NOTE' ? 'GOODS RETURN NOTE'
                      : (data.dnType === 'coating' || docTypeLabel === 'COATING DELIVERY NOTE' || data.documentType === 'COATING DELIVERY NOTE') ? 'COATING DELIVERY NOTE'
                      : 'DELIVERY NOTE'}
                  </h2>
                </div>
              ` : ''}

              ${showLetterhead || showMetadata ? (
                docTypeLabel === 'WORK ORDER' ? `
                <!-- Dedicated Work Order Metadata Header Structure -->
                <table class="meta-container" style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; margin-bottom: 5px; font-family: 'Arial MT', 'Arial', sans-serif !important; background-color: #ffffff; box-sizing: border-box;">
                  <tr>
                    <!-- Left: SELLER (53%) -->
                    <td style="width: 53%; border-right: 1.5px solid #000000; padding: 6px 8px; vertical-align: top; text-align: left;">
                      <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 3px; text-transform: uppercase;">
                        SELLER:
                      </div>
                      <div style="font-size: 11px; font-weight: 900; color: #000000; margin-bottom: 4px; text-transform: uppercase; line-height: 1.25;">
                        ${formatCompanyNameWithSoleProp(data.providerName || companyProfile.name || 'MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP)')}
                      </div>
                      <div style="font-size: 9px; color: #000000; line-height: 1.4; text-transform: uppercase;">
                        <div>${(data.providerAddress || companyProfile.address || 'Plot Number #0654, Shed No # 31, New Industrial Area Ajman, UAE').replace(/\n/g, ', ')}</div>
                        <div>Telefax: ${data.providerPhone || companyProfile.phone || '+971 6 525 0526'} | Email: ${data.providerEmail || companyProfile.email || 'sales@marinefasteners.co'}</div>
                        <div><b>VAT TRN:</b> ${data.providerTRN || companyProfile.trn || '100440509600003'}</div>
                      </div>
                    </td>

                    <!-- Right: DATED, WORK ORDER NO, INVOICE NO, PO/LPO NO, PAGE NO (47%) -->
                    <td style="width: 47%; padding: 6px 8px; vertical-align: top;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; font-family: 'Arial MT', 'Arial', sans-serif !important; line-height: 1.45;">
                        <tr>
                          <td style="width: 46%; padding: 2px 0; font-weight: bold; color: #000000; text-transform: uppercase;">DATED:</td>
                          <td style="padding: 2px 0; font-weight: 900; color: #000000; font-size: 12px;">${data.dated || ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 2px 0; font-weight: bold; color: #000000; text-transform: uppercase;">WORK ORDER NO:</td>
                          <td style="padding: 2px 0; font-weight: 900; color: #000000; font-size: 12px;">${data.workOrderNo || deriveWorkOrderNoFromInvoiceNo(data.invoiceNo, data.dated) || data.invoiceNo || ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 2px 0; font-weight: bold; color: #000000; text-transform: uppercase;">INVOICE NO:</td>
                          <td style="padding: 2px 0; font-weight: 900; color: #000000; font-size: 12px;">${data.invoiceNo || ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 2px 0; font-weight: bold; color: #000000; text-transform: uppercase;">PO/LPO NO:</td>
                          <td style="padding: 2px 0; font-weight: 900; color: #000000; font-size: 12px;">${data.lpoNo || data.poNo || ''}</td>
                        </tr>
                        <tr>
                          <td style="padding: 2px 0; font-weight: bold; color: #000000; text-transform: uppercase;">PAGE NO.:</td>
                          <td style="padding: 2px 0; font-weight: 900; color: #000000; font-size: 12px;">Page ${pageObj.pageNum} of ${docTotalPages}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- SHIPPING MODE & EXPECTED DELIVERY TIME BOX -->
                <div style="border: 1.5px solid #000000; margin-bottom: 6px; padding: 5px 8px; background-color: #ffffff; width: 100%; box-sizing: border-box; font-family: 'Arial MT', 'Arial', sans-serif !important;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 55%; vertical-align: top; padding: 0;">
                        <div style="font-size: 10px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                          SHIPPING MODE
                        </div>
                        <div style="font-size: 12px; font-weight: bold; color: #000000; display: flex; align-items: center; gap: 20px;">
                          <span style="display: inline-flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 1.5px solid #000000; text-align: center; line-height: 12px; font-size: 11px; font-weight: 900; background-color: #ffffff;">
                              ${(String(data.deliveryMode || '').toUpperCase().includes('LOCAL') || String(data.shippingMode || '').toUpperCase().includes('LOCAL')) ? '✓' : ''}
                            </span>
                            <span>Local</span>
                          </span>
                          <span style="display: inline-flex; align-items: center; gap: 6px; margin-left: 18px;">
                            <span style="display: inline-block; width: 14px; height: 14px; border: 1.5px solid #000000; text-align: center; line-height: 12px; font-size: 11px; font-weight: 900; background-color: #ffffff;">
                              ${(String(data.deliveryMode || '').toUpperCase().includes('EXPORT') || String(data.shippingMode || '').toUpperCase().includes('EXPORT')) ? '✓' : ''}
                            </span>
                            <span>Export</span>
                          </span>
                        </div>
                      </td>
                      <td style="width: 45%; vertical-align: top; padding: 0 0 0 10px; border-left: 1.5px solid #000000;">
                        <div style="font-size: 9.5px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
                          EXPECTED DELIVERY TIME
                        </div>
                        <div style="font-size: 12px; font-weight: bold; color: #000000;">
                          ${data.expectedDeliveryTime || data.deliveryDate || ''}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
                ` : `
              <table class="meta-container" style="width: 100%; border-collapse: collapse; margin-bottom: 6px; table-layout: fixed;">
                <tr style="height: 100%;">
                  <!-- Left: Supplier / Exporter & Buyer details (Equalized Height) -->
                  <td style="width: 48%; vertical-align: top; padding-right: 4px; height: 100%;">
                    <div style="border: 1px solid #000000; border-radius: 6px; padding: 7px 10px; background-color: #ffffff; height: 100%; min-height: 204px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                    ${docTypeLabel === 'PURCHASE REQUEST' ? `
                      <div style="font-size: 9.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px; text-transform: uppercase;">
                        ISSUER / BUYER ORGANIZATION:
                      </div>
                      <div style="font-size: 11.5px; font-weight: bold; color: #000; margin-bottom: 2px; text-transform: uppercase;">
                        ${formatCompanyNameWithSoleProp(data.providerName)}
                      </div>
                      <div style="font-size: 9px; color: #000; line-height: 1.35;">
                        ${(data.providerAddress).replace(/\n/g, '<br/>')}<br/>
                        Phone: ${data.providerPhone}${data.providerMobile ? ` | Mob: ${data.providerMobile}` : ''} | Email: ${data.providerEmail}<br/>
                        TRN: ${data.providerTRN}
                      </div>
                      ${(data.buyerName && data.buyerName !== 'SUPPLIER' && data.buyerName !== 'CASH CUSTOMER') ? `
                        <div style="border-top: 1.5px solid #000; margin: 5px 0;"></div>
                        <div style="font-size: 9.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px; text-transform: uppercase;">
                          SUGGESTED VENDOR / SUPPLIER:
                        </div>
                        <div style="font-size: 11.5px; font-weight: bold; color: #000; margin-bottom: 2px; text-transform: uppercase;">
                          M/s. ${data.buyerName}
                        </div>
                        <div style="font-size: 9px; color: #000; line-height: 1.35;">
                          ${data.buyerAddress ? `Address: ${data.buyerAddress.replace(/\n/g, '<br/>')}<br/>` : ''}
                          ${data.buyerPhone ? `Phone: ${data.buyerPhone} | ` : ''}${data.buyerTRN ? `TRN: ${data.buyerTRN}` : ''}
                          ${(data.attentionTo || data.attention || data.contactPerson) ? `<br/><div style="font-size: 9px; font-weight: bold; color: #000; margin-top: 2px;"><b>ATTENTION TO:</b> <span>${data.attentionTo || data.attention || data.contactPerson}</span></div>` : ''}
                        </div>
                      ` : ''}
                    ` : (data.isPurchase || docTypeLabel === 'PURCHASE ORDER' || docTypeLabel === 'PURCHASE INVOICE' || docTypeLabel === 'SUPPLIER TAX INVOICE' || (data.documentType && data.documentType.toUpperCase().includes('PURCHASE'))) ? `
                      <div style="font-size: 9.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px; text-transform: uppercase;">
                        SUPPLIER / EXPORTER:
                      </div>
                      <div style="font-size: 11.5px; font-weight: bold; color: #000; margin-bottom: 2px; text-transform: uppercase;">
                        M/s. ${data.buyerName || 'SUPPLIER'}
                      </div>
                      <div style="font-size: 9px; color: #000; line-height: 1.35;">
                        Address: ${(data.buyerAddress || '—').replace(/\n/g, '<br/>')}<br/>
                        PO Box: ${data.buyerPoBox || '—'} | Phone: ${data.buyerPhone || '—'}${(data.buyerMobile || data.supplierMobile || data.mobile) ? ` | Mob: ${data.buyerMobile || data.supplierMobile || data.mobile}` : ''}<br/>
                        ${(data.buyerEmail || data.supplierEmail || data.email) ? `Email: ${data.buyerEmail || data.supplierEmail || data.email} | ` : ''}TRN: ${data.buyerTRN || '—'}
                        ${(data.attentionTo || data.attention || data.contactPerson) ? `<br/><div style="font-size: 9px; font-weight: bold; color: #000; margin-top: 2px;"><b>ATTENTION TO:</b> <span>${data.attentionTo || data.attention || data.contactPerson}</span></div>` : ''}
                      </div>
                      <div style="border-top: 1.5px solid #000; margin: 5px 0;"></div>
                      <div style="font-size: 9.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px; text-transform: uppercase;">
                        BUYER / CONSIGNEE:
                      </div>
                      <div style="font-size: 11.5px; font-weight: bold; color: #000; margin-bottom: 2px; text-transform: uppercase;">
                        ${formatCompanyNameWithSoleProp(data.providerName)}
                      </div>
                      <div style="font-size: 9px; color: #000; line-height: 1.35;">
                        ${(data.providerAddress).replace(/\n/g, '<br/>')}<br/>
                        Phone: ${data.providerPhone}${data.providerMobile ? ` | Mob: ${data.providerMobile}` : ''} | Email: ${data.providerEmail}<br/>
                        TRN: ${data.providerTRN}
                      </div>
                    ` : `
                      ${companyProfile.showLogo && companyProfile.logoUrl ? `
                        <div style="margin-bottom: 2px;">
                          <img src="${companyProfile.logoUrl}" style="max-height: 38px; max-width: 140px; object-fit: contain;" />
                        </div>
                      ` : ''}
                      <div style="font-size: 9.5px; font-weight: bold; color: #000; margin-bottom: 1px; letter-spacing: 0.03em; text-transform: uppercase;">
                        SUPPLIER / EXPORTER:
                      </div>
                      <div style="font-size: 11.5px; font-weight: bold; color: #000; line-height: 1.25; text-transform: uppercase;">
                        ${formatCompanyNameWithSoleProp(data.providerName || companyProfile.name)}
                      </div>
                      <div style="font-size: 9.5px; color: #000; line-height: 1.35; margin-top: 1px;">
                        ${(data.providerAddress || companyProfile.address || 'Plot Number #0654, Shed No # 31, New Industrial Area\nAjman, United Arab Emirates').replace(/\n/g, '<br/>')}<br/>
                        Telephone: ${data.providerPhone || companyProfile.phone || '+971 6 525 0526'}<br/>
                        Email: ${data.providerEmail || companyProfile.email || 'sales@marinefasteners.co'}<br/>
                        VAT TRN : ${data.providerTRN || companyProfile.trn || '100440509600003'}
                      </div>

                      <div style="border-top: 1.5px solid #000000; margin: 4px 0;"></div>

                      <div style="font-size: 9.5px; font-weight: bold; color: #000; margin-bottom: 1px; letter-spacing: 0.03em; text-transform: uppercase;">
                        CLIENT / BUYER:
                      </div>
                      <div style="font-size: 11.5px; font-weight: bold; color: #000; text-transform: uppercase;">
                        ${data.buyerName ? (data.buyerName.trim().toUpperCase().startsWith('M/S') ? data.buyerName.trim().toUpperCase() : `M/S. ${data.buyerName.trim().toUpperCase()}`) : 'M/S. CASH CUSTOMER'}
                      </div>
                      <div style="font-size: 9.5px; color: #000; line-height: 1.35; margin-top: 1px;">
                        Address: ${(data.buyerAddress || 'OVER THE COUNTER SALES').replace(/\n/g, '<br/>')}<br/>
                        PO Box: ${data.buyerPoBox || '—'} | Phone: ${data.buyerPhone || data.buyerMobile || data.phone || '—'}${(data.buyerMobile && data.buyerPhone && data.buyerMobile !== data.buyerPhone) ? ` | Mob: ${data.buyerMobile}` : ''}<br/>
                        TRN: ${data.buyerTRN || '—'}
                      </div>
                    `}
                    </div>
                  </td>

                  <!-- Right: Reference & Commercial Details (Equalized Height & Centered Cells) -->
                  <td style="width: 52%; vertical-align: top; padding-left: 4px; height: 100%;">
                    ${(docTypeLabel === 'PACKING LIST') ? `
                      <div style="border: 1.5px solid #000000; border-radius: 8px; overflow: hidden; background-color: #ffffff; box-sizing: border-box; height: 100%; min-height: 204px;">
                        <table style="width: 100%; height: 100%; min-height: 204px; border-collapse: collapse; table-layout: fixed; font-size: 10px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          <colgroup>
                            <col style="width: 35%;" />
                            <col style="width: 65%;" />
                          </colgroup>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PACKING LIST NO
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.invoiceNo || data.deliveryNoteNo || data.workOrderNo || ''}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              DATED
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.dated || ''}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              WORK ORDER NO
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.workOrderNo || '—'}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PO / LPO NO
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.lpoNo || data.poNo || '—'}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; white-space: nowrap; border-right: 1px solid #000; text-transform: uppercase; background-color: #fafafa; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PAGE NO
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; white-space: nowrap; text-transform: uppercase; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PAGE ${pageObj.pageNum} OF ${docTotalPages}
                            </td>
                          </tr>
                        </table>
                      </div>
                    ` : (docTypeLabel === 'PURCHASE REQUEST') ? `
                      <div style="border: 1.5px solid #000000; border-radius: 8px; overflow: hidden; background-color: #ffffff; box-sizing: border-box; height: 100%; min-height: 204px;">
                        <table style="width: 100%; height: 100%; min-height: 204px; border-collapse: collapse; table-layout: fixed; font-size: 10px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          <colgroup>
                            <col style="width: 35%;" />
                            <col style="width: 65%;" />
                          </colgroup>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PR NO
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.prNo || data.invoiceNo || ''}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              DATED
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.dated || ''}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PRIORITY
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.priority || 'NORMAL'}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              CATEGORY
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              ${data.purchaseCategory || data.category || 'Steel Wire Rods / Raw Materials'}
                            </td>
                          </tr>
                          <tr style="height: 20%;">
                            <td style="font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; white-space: nowrap; border-right: 1px solid #000; text-transform: uppercase; background-color: #fafafa; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PAGE NO
                            </td>
                            <td style="font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; white-space: nowrap; text-transform: uppercase; padding: 2.5px 4px 0px 4px !important; line-height: 1.1 !important;">
                              PAGE ${pageObj.pageNum} OF ${docTotalPages}
                            </td>
                          </tr>
                        </table>
                      </div>
                    ` : `
                      <!-- Single Unified Box (Middle Text-Aligned & Big Bold Text & Equal Height) -->
                      <div style="border: 1px solid #000000; border-radius: 6px; overflow: hidden; background-color: #ffffff; box-sizing: border-box; height: 100%; min-height: 204px;">
                        <table class="meta-table" style="width: 100%; height: 100%; min-height: 204px; border-collapse: collapse; table-layout: fixed; font-size: 10px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          <colgroup>
                            <col style="width: 25%;" />
                            <col style="width: 25%;" />
                            <col style="width: 25%;" />
                            <col style="width: 25%;" />
                          </colgroup>
                          <!-- Row 1: DATE -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              DATE
                            </td>
                            <td colspan="3" style="width: 75%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.dated || data.invoiceDate || data.date || ''}
                            </td>
                          </tr>
                          <!-- Row 2: INVOICE NO -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              INVOICE NO
                            </td>
                            <td colspan="3" style="width: 75%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.invoiceNo || data.deliveryNoteNo || data.docNo || ''}
                            </td>
                          </tr>
                          <!-- Row 3: WORK ORDER NO -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              WORK ORDER NO
                            </td>
                            <td colspan="3" style="width: 75%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.workOrderNo || data.associatedWorkOrderNo || data.deliveryNoteNo || '—'}
                            </td>
                          </tr>
                          <!-- Row 4: PO NO -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              PO NO
                            </td>
                            <td colspan="3" style="width: 75%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.lpoNo || data.poNo || '—'}
                            </td>
                          </tr>
                          <!-- Row 5: PR NO & RFQ NO -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              PR NO
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.prNo || '—'}
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              RFQ NO
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.rfqNo || '—'}
                            </td>
                          </tr>
                          <!-- Row 6: QUOTATION REF & PAYMENT TERMS -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              QUOTATION REF
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.quotationRef || data.quoteRef || '—'}
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              PAYMENT TERMS
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.paymentTerms || 'IMMEDIATE'}
                            </td>
                          </tr>
                          <!-- Row 7: DISPATCH BY & DELIVERY TERMS -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              DISPATCH BY
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${cleanDispatchBy(data.dispatchBy) || 'SELF PICKUP'}
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              DELIVERY TERMS
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.deliveryTerms || 'EX-WORKS'}
                            </td>
                          </tr>
                          <!-- Row 8: DELIVERY MODE & CURRENCY -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              DELIVERY MODE
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.deliveryMode || data.deliveryMood || 'CARGO'}
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              CURRENCY
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.currency || 'AED'}
                            </td>
                          </tr>
                          <!-- Row 9: MADE IN & HS CODE -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              MADE IN
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.countryOfOrigin || data.madeIn || 'UAE'}
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              HS CODE
                            </td>
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; border-bottom: 1px solid #000; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              ${data.hsCode || '7318.15.00'}
                            </td>
                          </tr>
                          <!-- Row 10: PAGE NO -->
                          <tr style="height: 10%;">
                            <td style="width: 25%; font-weight: bold; color: #000; font-size: 10px; text-align: center !important; vertical-align: top !important; border-right: 1px solid #000; text-transform: uppercase; background-color: #fafafa; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              PAGE NO
                            </td>
                            <td colspan="3" style="width: 75%; font-weight: bold; color: #000; font-size: 10.5px; text-align: center !important; vertical-align: top !important; text-transform: uppercase; white-space: nowrap; padding: 2.5px 3px 0px 3px !important; line-height: 1.1 !important;">
                              PAGE ${pageObj.pageNum} OF ${docTotalPages}
                            </td>
                          </tr>
                        </table>
                      </div>
                    `}
                  </td>
                </tr>
              </table>
              `) : ''}

              <!-- Document Title Line with Double Rules (Matching Reference Layout) -->
              <div class="doc-title-banner" style="display: flex; align-items: center; width: 100%; margin: 2px 0 4px 0; box-sizing: border-box;">
                <div style="flex: 1; border-top: 2.5px double #000000; height: 0;"></div>
                <div class="doc-title-banner-text" style="padding: 0 14px; font-size: 15px; font-weight: 900; font-style: italic; color: #000000; text-transform: uppercase; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; letter-spacing: 0.12em; white-space: nowrap; line-height: 1.2;">
                  ${(docTypeLabel === 'TAX INVOICE' || docTypeLabel === 'TAX INVOICE ONLY' || docTypeLabel === 'TAX INVOICE & DELIVERY NOTE') ? 'TAX INVOICE' : (docTypeLabel === 'PURCHASE ORDER' && data.isLpoCheckbox) ? 'LOCAL PURCHASE ORDER (LPO)' : (copyLabel && docTypeLabel !== 'DELIVERY NOTE' && docTypeLabel !== 'WORK ORDER') ? `${docTypeLabel} - ${copyLabel}` : docTypeLabel}
                </div>
                <div style="${docTypeLabel === 'WORK ORDER' ? 'flex: 1;' : 'width: 48px;'} border-top: 2.5px double #000000; height: 0;"></div>
              </div>

              <!-- Items Table for Page -->
              ${docTypeLabel === 'PACKING LIST' ? `
                <div class="items-table-container">
                  <table class="items-table" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                    <thead>
                      <tr style="border-bottom: 2.5px solid black; background-color: #f8fafc; height: 34px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                        <th style="width: ${packingListColWidths.sn}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 10px; line-height: 1 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">S.N</th>
                        ${showPltNoInPrint ? `<th style="width: ${packingListColWidths.pltNo}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">PLT<br/>NO</th>` : ''}
                        <th style="width: ${packingListColWidths.description}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 4px; font-size: 10px; line-height: 1 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">DESCRIPTION</th>
                        <th style="width: ${packingListColWidths.grade}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 4px; font-size: 10px; line-height: 1 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">GRADE</th>
                        <th style="width: ${packingListColWidths.size}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 10px; line-height: 1 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">SIZE</th>
                        ${showHsCodeInPrint ? `<th style="width: ${packingListColWidths.hsCode}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">HS<br/>CODE</th>` : ''}
                        <th style="width: ${packingListColWidths.finish}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 10px; line-height: 1 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">FINISH</th>
                        <th style="width: ${packingListColWidths.units}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 10px; line-height: 1 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">UNITS</th>
                        <th style="width: ${packingListColWidths.qtyBox}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">QTY /<br/>BOX /<br/>BUNDLE</th>
                        <th style="width: ${packingListColWidths.noBox}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 2px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">NO. OF<br/>BOX /<br/>BUNDLE</th>
                        ${showUnitWeightInPrint ? `<th style="width: ${packingListColWidths.unitWt}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: 1px solid black; padding: 4px 4px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">UNIT<br/>WT</th>` : ''}
                        <th style="width: ${packingListColWidths.totalQty}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; border-right: ${showTotalWeightInPrint ? '1px solid black' : 'none'}; padding: 4px 4px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">TOTAL<br/>QTY</th>
                        ${showTotalWeightInPrint ? `<th style="width: ${packingListColWidths.totalWt}%; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-align: center; vertical-align: middle; padding: 4px 4px; font-size: 9.5px; line-height: 1.05 !important; white-space: normal !important; word-break: normal !important; overflow-wrap: normal !important;">TOTAL<br/>WEIGHT</th>` : ''}
                      </tr>
                    </thead>
                    ${buildRowsHtmlForItems(pageObj.items, pageObj.startIdx)}
                    ${pageObj.isLast ? `
                      <tbody style="page-break-inside: avoid !important; break-inside: avoid !important;">
                        <tr style="font-weight: bold; border-top: 2.5px solid black; background-color: #fafafa; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          <td colspan="${8 + (showPltNoInPrint ? 1 : 0) + (showHsCodeInPrint ? 1 : 0)}" style="text-align: right; padding: 5px; font-size: 11px; text-transform: uppercase; border-right: 1px solid black; font-weight: 950;">TOTALS:</td>
                          ${showUnitWeightInPrint ? `<td style="text-align: right; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 10.5px; padding-right: 6px; font-weight: 500; border-right: 1px solid black; color: #64748b;">—</td>` : ''}
                          <td style="text-align: right; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 11.5px; padding-right: 6px; font-weight: 950; ${showTotalWeightInPrint ? 'border-right: 1px solid black;' : ''}">${Math.round(calculatedSums.totalQty).toLocaleString()}</td>
                          ${showTotalWeightInPrint ? `<td style="text-align: right; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; font-size: 11.5px; padding-right: 6px; font-weight: 950; color: #047857;">${documentTotalWeight.toFixed(3)} KG</td>` : ''}
                        </tr>
                      </tbody>
                    ` : ''}
                  </table>
                </div>
              ` : `
                <div class="items-table-container">
                  <table class="items-table" style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                    <thead>
                      ${shouldShowPricesAndVat ? `
                        <tr style="background-color: #f1f5f9; height: 32px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          <th style="width: 4%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">S.N</th>
                          <th style="width: ${data.showLineHsCode ? '26%' : '31%'}; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 4px !important; font-size: 10px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">ITEM DESCRIPTION</th>
                          <th style="width: 6.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">FINISH</th>
                          ${data.showLineHsCode ? `<th style="width: 5.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">H.S. CODE</th>` : ''}
                          <th style="width: 4.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">UNIT</th>
                          <th style="width: 5.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">QTY</th>
                          <th style="width: 7.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">U. PRICE</th>
                          <th style="width: 8.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">EXT. PRICE</th>
                          <th style="width: 5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">DISC.</th>
                          <th style="width: 9%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1.05 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">TOTAL EXCL.<br/>VAT</th>
                          <th style="width: 4.5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">VAT %</th>
                          <th style="width: 7%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1.05 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">TAX AMT (5%)<br/>(${data.currency || 'AED'})</th>
                          <th style="width: 7%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: 9.5px; padding: 4px 2px !important; line-height: 1.05 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">TOTAL<br/>(${data.currency || 'AED'})</th>
                        </tr>
                      ` : `
                        <tr style="background-color: #f2f2f2; height: 32px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          ${docTypeLabel === 'WORK ORDER' ? `
                            <th style="width: 5%; font-weight: 900; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">S.N</th>
                            <th style="width: 64%; font-weight: 900; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 6px !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">DESCRIPTION OF MATERIAL / SERVICES</th>
                            <th style="width: 12%; font-weight: 900; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">FINISH</th>
                            <th style="width: 8%; font-weight: 900; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">UNIT</th>
                            <th style="width: 11%; font-weight: 900; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 6px !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">QTY</th>
                          ` : docTypeLabel === 'DELIVERY NOTE' ? `
                            <th style="width: 5%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">S.N</th>
                            <th style="width: 55%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 6px !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">DESCRIPTION OF MATERIAL / SERVICES</th>
                            <th style="width: 15%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">FINISH</th>
                            <th style="width: 10%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">UNIT</th>
                            <th style="width: 15%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 6px !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">QTY</th>
                          ` : `
                            <th style="width: 4%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">S.N</th>
                            <th style="width: 50%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 6px !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">DESCRIPTION OF MATERIAL / SERVICES</th>
                            <th style="width: 12%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">FINISH</th>
                            <th style="width: 10%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; padding: 4px 2px !important; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">UNIT</th>
                            <th style="width: 14%; font-weight: bold; text-align: center !important; vertical-align: middle !important; border: 1px solid #000; padding: 4px 6px !important; font-size: ${(10.5 * fontScaleRatio).toFixed(1)}px; line-height: 1 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">QUANTITY</th>
                          `}
                        </tr>
                      `}
                    </thead>
                    ${buildRowsHtmlForItems(pageObj.items, pageObj.startIdx)}
                    ${pageObj.isLast && docTypeLabel !== 'TAX INVOICE' && docTypeLabel !== 'TAX INVOICE ONLY' && docTypeLabel !== 'TAX INVOICE & DELIVERY NOTE' && !shouldShowPricesAndVat ? `
                      <tbody style="page-break-inside: avoid !important; break-inside: avoid !important;">
                        <tr style="font-weight: bold; border-top: 2px solid black; background-color: #f8fafc; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                          <td colspan="4" style="text-align: right; padding: 4px 8px; font-size: ${(10 * fontScaleRatio).toFixed(1)}px; text-transform: uppercase; border-right: 1px solid black; font-weight: 950; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">TOTAL QUANTITY:</td>
                          <td style="text-align: right; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; font-size: ${(11.5 * fontScaleRatio).toFixed(1)}px; padding-right: 8px; font-weight: 950; color: #000000;">${Math.round(calculatedSums.totalQty).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    ` : ''}
                  </table>
                </div>
              `}

              ${pageObj.isLast ? `
                <!-- Row 4: Total & Financial Breakdown Card (Matching Classic ERP Format) -->
                ${shouldShowPricesAndVat ? `
                  <table style="width: 100%; border-collapse: collapse; margin-top: 3px; margin-bottom: 0px; page-break-inside: avoid !important; break-inside: avoid !important;">
                    <tr>
                      <!-- Left: Amount in words + Bank details -->
                      <td style="width: 56%; vertical-align: top; padding-right: 4px;">
                        <div style="border: 1px solid #000000; border-radius: 6px; overflow: hidden; background-color: #ffffff; box-sizing: border-box;">
                          <!-- Amount in Words -->
                          <div style="padding: 2.5px 10px 4px 10px; border-bottom: 1px solid #000000; background-color: #fafafa;">
                            <div style="font-size: 9px; font-weight: bold; color: #000000; text-transform: uppercase; margin-bottom: 1px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; line-height: 1.15 !important;">
                              AMOUNT IN WORDS:
                            </div>
                            <div style="font-size: 10px; font-weight: bold; color: #000000; text-transform: uppercase; line-height: 1.2 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                              ${numberToAEDWords(calculatedSums.grandTotal, data.currency).replace(/\s+ONLY\s*$/i, '')} ONLY
                            </div>
                          </div>
                          
                          <!-- Bank Account Details -->
                          ${(docTypeLabel === 'PURCHASE ORDER' || docTypeLabel === 'PURCHASE REQUEST' || data.documentType === 'PURCHASE ORDER' || data.documentType === 'PURCHASE REQUEST') ? `
                          <div style="padding: 2.5px 10px 4px 10px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                            <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #000000; margin-bottom: 2px; letter-spacing: 0.02em;">
                              ADDITIONAL NOTES
                            </div>
                            <div style="font-size: 9.5px; line-height: 1.3 !important; color: #000000; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; white-space: pre-wrap;">${data.additionalNotes || '—'}</div>
                          </div>
                          ` : (!data.isPurchase && docTypeLabel !== 'PURCHASE INVOICE' && docTypeLabel !== 'SUPPLIER TAX INVOICE' && !(data.documentType && data.documentType.toUpperCase().includes('PURCHASE'))) ? `
                          <div style="padding: 2.5px 10px 4px 10px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                            <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #000000; margin-bottom: 2px; letter-spacing: 0.02em;">
                              BANK ACCOUNT DETAILS
                            </div>
                            <div style="font-size: 9.5px; font-weight: normal; line-height: 1.3 !important; color: #000000; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                              <div style="padding: 0.5px 0;"><b>Beneficiary:</b> ${data.bankBeneficiary || companyProfile.bankBeneficiary || companyProfile.name}</div>
                              <div style="padding: 0.5px 0;"><b>Bank Name:</b> ${data.bankName || companyProfile.bankName || 'RAK BANK'} | <b>Branch:</b> ${data.bankBranch || companyProfile.bankBranch || 'KING FAISAL STREET, SHARJAH, UAE'}</div>
                              <div style="padding: 0.5px 0;"><b>Account No:</b> <span style="font-weight: bold; font-size: 10px; color: #000;">${data.accountNo || data.bankAccountNo || companyProfile.bankAccountNo || '0242715908001'}</span> | <b>IBAN:</b> <span style="font-weight: bold; font-size: 10px; color: #000;">${data.iban || data.bankIban || companyProfile.bankIban || 'AE 940400000242715908001'}</span></div>
                              <div style="padding: 0.5px 0;"><b>Swift Code:</b> <span style="font-weight: bold; font-size: 10px; color: #000;">${data.swiftCode || data.bankSwiftCode || companyProfile.bankSwiftCode || 'NRAKAEAK'}</span> | <b>Country:</b> ${data.bankCountry || companyProfile.bankCountry || 'UAE'}</div>
                            </div>
                          </div>
                          ` : ''}
                        </div>
                      </td>

                      <!-- Right: Summary Table -->
                      <td style="width: 44%; vertical-align: top; padding-left: 4px;">
                        <div style="border: 1px solid #000000; border-radius: 6px; overflow: hidden; background-color: #ffffff; box-sizing: border-box;">
                          <table class="summary-table" style="width: 100%; border-collapse: collapse; font-size: 9.5px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                            <tr style="height: 22px;">
                              <td style="font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; border-right: 1px solid #000000; text-transform: uppercase; background-color: #fafafa; font-size: 9.5px; line-height: 1.1 !important;">
                                TOTAL IN ${data.currency || 'AED'}
                              </td>
                              <td style="text-align: right !important; font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; font-size: 9.5px; line-height: 1.1 !important;">
                                ${calculatedSums.subTotal.toFixed(2)}
                              </td>
                            </tr>
                            <tr style="height: 22px;">
                              <td style="font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; border-right: 1px solid #000000; text-transform: uppercase; background-color: #fafafa; font-size: 9.5px; line-height: 1.1 !important;">
                                DISC. IN ${data.currency || 'AED'}
                              </td>
                              <td style="text-align: right !important; font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; font-size: 9.5px; line-height: 1.1 !important;">
                                ${(Number(data.discountAmt) || 0).toFixed(2)}
                              </td>
                            </tr>
                            <tr style="height: 22px;">
                              <td style="font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; border-right: 1px solid #000000; text-transform: uppercase; background-color: #fafafa; font-size: 9.5px; line-height: 1.1 !important;">
                                FREIGHT/EXTRA CHARGES IN ${data.currency || 'AED'}
                              </td>
                              <td style="text-align: right !important; font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; font-size: 9.5px; line-height: 1.1 !important;">
                                ${(Number(data.freightAmt) || 0).toFixed(2)}
                              </td>
                            </tr>
                            <tr style="height: 22px;">
                              <td style="font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; border-right: 1px solid #000000; text-transform: uppercase; background-color: #fafafa; font-size: 9.5px; line-height: 1.1 !important;">
                                TOTAL ${data.currency || 'AED'} BEFORE TAX
                              </td>
                              <td style="text-align: right !important; font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; font-size: 9.5px; line-height: 1.1 !important;">
                                ${calculatedSums.afterDiscount.toFixed(2)}
                              </td>
                            </tr>
                            <tr style="height: 22px;">
                              <td style="font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; border-right: 1px solid #000000; text-transform: uppercase; background-color: #fafafa; font-size: 9.5px; line-height: 1.1 !important;">
                                ${calculatedSums.vatPercentEquivalent}% TAX AMOUNT IN ${data.currency || 'AED'}
                              </td>
                              <td style="text-align: right !important; font-weight: bold; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-bottom: 1px solid #000000; font-size: 9.5px; line-height: 1.1 !important;">
                                ${calculatedSums.vatAmount.toFixed(2)}
                              </td>
                            </tr>
                            <tr style="background-color: #f5f5f5; height: 24px;">
                              <td style="font-weight: bold; font-size: 10px; padding: 3px 8px 0px 8px !important; vertical-align: top !important; border-right: 1px solid #000000; text-transform: uppercase; line-height: 1.1 !important;">
                                TOTAL AMOUNT IN ${data.currency || 'AED'}
                              </td>
                              <td style="text-align: right !important; font-weight: bold; font-size: 11px; padding: 3px 8px 0px 8px !important; vertical-align: top !important; color: #000000; line-height: 1.1 !important;">
                                ${calculatedSums.grandTotal.toFixed(2)}
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                ` : ''}
              ` : ''}

              ${docTypeLabel === 'PACKING LIST' && pageObj.isLast ? getPackingDetailsBlockHtml(data, calculatedSums) : ''}
            </div>
            <!-- Start doc-bottom-wrapper -->
            <div class="doc-bottom-wrapper" style="width: 100%; display: flex; flex-direction: column; margin-top: auto; page-break-inside: avoid !important; break-inside: avoid !important;">

        <!-- ACKNOWLEDGEMENTS & SIGNATURES -->
        ${showSignatures ? `
        <div style="display: block !important; page-break-inside: avoid !important; break-inside: avoid !important; width: 100%;">
        ${docTypeLabel === 'WORK ORDER' ? (pageObj.isLast ? `
          <div style="margin-top: 14px; padding-top: 8px; border-top: 1.5px solid #000000; width: 100%; font-family: 'Arial MT', 'Arial', sans-serif !important; page-break-inside: avoid !important; break-inside: avoid !important;">
            <table style="width: 100%; border-collapse: collapse; text-align: center;">
              <tr>
                <!-- Checked By -->
                <td style="width: 25%; vertical-align: top; padding: 0 6px;">
                  <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 75px; color: #000000; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                    CHECKED BY
                  </div>
                  <div style="font-size: 11px; font-weight: 900; text-decoration: underline; text-transform: uppercase; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; color: #000000;">
                    ${data.preparedBy || data.checkedBy || ''}
                  </div>
                </td>

                <!-- Tracing Code -->
                <td style="width: 25%; vertical-align: top; padding: 0 6px;">
                  <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 75px; color: #e11d48; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                    TRACING CODE
                  </div>
                  <div>
                    <span style="font-size: 10.5px; font-weight: 900; text-decoration: underline; text-transform: uppercase; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; color: #be123c; background-color: #fff1f2; padding: 2px 8px; border: 1px solid #fecdd3; border-radius: 3px; display: inline-block;">
                      ${data.tracingCode || ''}
                    </span>
                  </div>
                </td>

                <!-- Approved By -->
                <td style="width: 25%; vertical-align: top; padding: 0 6px;">
                  <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 75px; color: #000000; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                    APPROVED BY
                  </div>
                  <div style="font-size: 11px; font-weight: 900; text-decoration: underline; text-transform: uppercase; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; color: #000000;">
                    ${data.approvedBy || ''}
                  </div>
                </td>

                <!-- Store Incharge / Dispatch By -->
                <td style="width: 25%; vertical-align: top; padding: 0 6px;">
                  <div style="font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 75px; color: #000000; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important;">
                    STORE INCHARGE / DISPATCH BY
                  </div>
                  <div style="font-size: 11px; font-weight: 900; text-decoration: underline; text-transform: uppercase; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; color: #000000;">
                    ${cleanDispatchBy(data.dispatchBy) || ''}
                  </div>
                </td>
              </tr>
            </table>
          </div>
        ` : '') : isDeliveryNoteStyle ? `
          <div style="margin-top: 12px;">
            <div class="signatures-wrapper" style="margin-top: auto !important; width: 100%; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid;">
               ${docTypeLabel === 'PURCHASE REQUEST' ? `
               <div style="border: 1.5px solid #000000; width: 100%; margin-top: 8px; background-color: #ffffff; box-sizing: border-box; font-family: 'Arial MT', 'Arial', sans-serif;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 10px; font-family: 'Arial MT', 'Arial', sans-serif;">
                  <tr>
                    <!-- 1. REQUESTED BY -->
                    <td style="width: 25%; vertical-align: top; padding: 12px 6px; border-right: 1px solid #000000; height: 165px; min-height: 165px; position: relative;">
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        REQUESTED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.requestedBy || data.requestedByPerson || data.salesperson || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Sign &amp; Date)</div>
                      </div>
                    </td>

                    <!-- 2. PREPARED BY -->
                    <td style="width: 25%; vertical-align: top; padding: 12px 6px; border-right: 1px solid #000000; height: 165px; min-height: 165px; position: relative;">
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        PREPARED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.preparedBy || data.preparedByName || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Sign &amp; Date)</div>
                      </div>
                    </td>

                    <!-- 3. CHECKED BY -->
                    <td style="width: 25%; vertical-align: top; padding: 12px 6px; border-right: 1px solid #000000; height: 165px; min-height: 165px; position: relative;">
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        CHECKED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.checkedBy || data.checkedByName || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Sign &amp; Date)</div>
                      </div>
                    </td>

                    <!-- 4. APPROVED BY -->
                    <td style="width: 25%; vertical-align: top; padding: 12px 6px; height: 165px; min-height: 165px; position: relative;">
                      ${companyProfile.showStamp && companyProfile.stampUrl ? `
                        <img src="${companyProfile.stampUrl}" style="position: absolute; right: 6px; bottom: 25px; max-height: 80px; max-width: 125px; object-fit: contain; pointer-events: none !important; z-index: 10; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                      ` : ''}
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        APPROVED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.approvedBy || data.approvedByName || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Authorized Signature)</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              ` : docTypeLabel === 'PURCHASE ORDER' ? `
               <div style="border: 1.5px solid #000000; width: 100%; margin-top: 8px; background-color: #ffffff; box-sizing: border-box; font-family: 'Arial MT', 'Arial', sans-serif;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 10px; font-family: 'Arial MT', 'Arial', sans-serif;">
                  <tr>
                    <!-- 1. PREPARED BY -->
                    <td style="width: 33.33%; vertical-align: top; padding: 12px 6px; border-right: 1px solid #000000; height: 165px; min-height: 165px; position: relative;">
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        PREPARED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.preparedBy || data.preparedByName || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Sign &amp; Date)</div>
                      </div>
                    </td>

                    <!-- 2. CHECKED BY -->
                    <td style="width: 33.33%; vertical-align: top; padding: 12px 6px; border-right: 1px solid #000000; height: 165px; min-height: 165px; position: relative;">
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        CHECKED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.checkedBy || data.checkedByName || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Sign &amp; Date)</div>
                      </div>
                    </td>

                    <!-- 3. APPROVED BY -->
                    <td style="width: 33.33%; vertical-align: top; padding: 12px 6px; height: 165px; min-height: 165px; position: relative;">
                      ${companyProfile.showStamp && companyProfile.stampUrl ? `
                        <img src="${companyProfile.stampUrl}" style="position: absolute; right: 6px; bottom: 25px; max-height: 80px; max-width: 125px; object-fit: contain; pointer-events: none !important; z-index: 10; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                      ` : ''}
                      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; color: #000000; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                        APPROVED BY
                      </div>
                      <div style="font-size: 10.5px; font-weight: bold; color: #000000; margin-top: 4px; text-transform: uppercase;">
                        ${data.approvedBy || data.approvedByName || ''}
                      </div>
                      <div style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center;">
                        <div style="border-bottom: 1px dotted #000000; width: 80%; margin: 0 auto 3px auto;"></div>
                        <div style="font-size: 8.5px; color: #475569; font-style: italic;">(Authorized Signature)</div>
                      </div>
                    </td>
                  </tr>
                </table>
               </div>
               ` : (data.isPurchase || docTypeLabel === 'PURCHASE INVOICE') ? `
               <div style="border: 1px solid #000; display: table; width: 100%; height: 180px; min-height: 180px; background-color: #ffffff; box-sizing: border-box; margin-top: 8px; font-family: sans-serif;">
                <div style="display: table-cell; width: 50%; padding: 12px 14px; vertical-align: top; border-right: 1px solid #000;">
                  <div style="font-size: 12px; font-weight: bold; color: #000; text-transform: uppercase;">
                    RECEIVED BY${data.receivedBy ? `: <span style="font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;">${String(data.receivedBy).toUpperCase()}</span>` : ''}
                  </div>
                  <div style="border-bottom: 1px dotted #666; margin-top: 105px; width: 75%;"></div>
                  <div style="font-size: 10px; color: #444; font-family: sans-serif; font-style: italic; margin-top: 4px;">
                    (Signature and Date)
                  </div>
                </div>
                <div style="display: table-cell; width: 50%; padding: 12px 14px; text-align: right; vertical-align: top; position: relative;">
                  ${companyProfile.showStamp && companyProfile.stampUrl ? `
                    <img src="${companyProfile.stampUrl}" style="position: absolute; right: 10px; top: 35px; transform: scale(${companyProfile.stampScale || 1}); max-height: 95px; max-width: 140px; object-fit: contain; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                  ` : ''}
                  <div style="font-size: 12px; font-weight: bold; color: #000; text-transform: uppercase; position: relative; z-index: 2;">
                    APPROVED BY${data.approvedBy ? `: <span style="font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;">${String(data.approvedBy).toUpperCase()}</span>` : ''}
                  </div>
                  <div style="border-bottom: 1px dotted #666; margin-top: 105px; width: 75%; margin-left: auto;"></div>
                  <div style="font-size: 10px; color: #444; font-family: sans-serif; font-style: italic; margin-top: 4px;">
                    (Authorized Signature)
                  </div>
                </div>
              </div>
              ` : docTypeLabel === 'PACKING LIST' ? `
              <div style="margin-top: 10px; font-family: 'Arial MT', 'Arial', sans-serif; page-break-inside: avoid; break-inside: avoid; width: 100%;">
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 16px; background-color: #ffffff; box-sizing: border-box; min-height: 185px; height: 185px; width: 100%; position: relative;">
                  ${companyProfile.showStamp && companyProfile.stampUrl ? `
                    <img src="${companyProfile.stampUrl}" style="position: absolute; left: ${companyProfile.stampX ?? 30}%; top: ${companyProfile.stampY ?? 50}%; transform: translate(-50%, -50%) scale(${companyProfile.stampScale || 1}); max-height: 105px; max-width: 155px; object-fit: contain; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                  ` : ''}
                  <div style="display: table; width: 100%; position: relative; z-index: 5;">
                    <div style="display: table-cell; width: 50%; text-align: left; vertical-align: top;">
                      <span style="font-size: 11px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; display: inline-block;">
                        CUSTOMER'S SEAL AND SIGNATURE
                      </span>
                    </div>
                    <div style="display: table-cell; width: 50%; text-align: right; vertical-align: top;">
                      <span style="font-size: 11px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; display: inline-block;">
                        FOR: ${data.providerName ? formatCompanyNameWithSoleProp(data.providerName) : (companyProfile.name ? formatCompanyNameWithSoleProp(companyProfile.name) : 'MARINE FASTENERS INDUSTRIES L.L.C<br/>(SOLE PROPRIETORSHIP)')}
                      </span>
                    </div>
                  </div>
                  <div style="height: 1px; width: 100%; margin-top: 4px; background-color: #000000; position: relative; z-index: 5;"></div>
                  <div style="display: table; width: 100%; margin-top: 110px; position: relative; z-index: 5;">
                    <div style="display: table-cell; width: 50%; text-align: left; vertical-align: bottom;">
                      <span style="font-size: 9px; color: #64748b; font-style: italic; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif;">
                        (AUTHORIZED STAMP PLACE)
                      </span>
                    </div>
                    <div style="display: table-cell; width: 50%; text-align: right; vertical-align: bottom;">
                      <span style="font-size: 11px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; letter-spacing: 0.03em;">
                        AUTHORISED SIGNATORY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              ` : `
              <div style="margin-top: 5px; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; page-break-inside: avoid; break-inside: avoid; width: 100%;">
                ${docTypeLabel !== 'PURCHASE ORDER' && docTypeLabel !== 'PURCHASE REQUEST' ? `
                  <div style="font-size: 10px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; margin-bottom: 2px; letter-spacing: 0.02em;">
                    ACKNOWLEDGEMENT:- RECEIVED THE ABOVE GOODS IN CORRECT QUANTITY &amp; QUALITY
                  </div>
                ` : ''}
                <div style="border: 1px solid #000000; border-radius: 6px; padding: 10px 14px; background-color: #ffffff; box-sizing: border-box; min-height: 180px; height: 180px; width: 100%; position: relative;">
                  ${companyProfile.showStamp && companyProfile.stampUrl ? `
                    <img src="${companyProfile.stampUrl}" style="position: absolute; left: ${companyProfile.stampX ?? 30}%; top: ${companyProfile.stampY ?? 50}%; transform: translate(-50%, -50%) scale(${companyProfile.stampScale || 1}); max-height: 95px; max-width: 145px; object-fit: contain; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                  ` : ''}
                  <div style="display: table; width: 100%; position: relative; z-index: 5;">
                    <div style="display: table-cell; width: 50%; text-align: left; vertical-align: top;">
                      <span style="font-size: 10.5px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; display: inline-block;">
                        CUSTOMER'S SEAL AND SIGNATURE
                      </span>
                    </div>
                    <div style="display: table-cell; width: 50%; text-align: right; vertical-align: top;">
                      <span style="font-size: 10.5px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; display: inline-block;">
                        FOR: ${data.providerName ? formatCompanyNameWithSoleProp(data.providerName) : (companyProfile.name ? formatCompanyNameWithSoleProp(companyProfile.name) : 'MARINE FASTENERS INDUSTRIES L.L.C<br/>(SOLE PROPRIETORSHIP)')}
                      </span>
                    </div>
                  </div>
                  <div style="height: 1px; width: 100%; margin-top: 4px; background-color: #000000; position: relative; z-index: 5;"></div>
                  <div style="display: table; width: 100%; margin-top: 105px; position: relative; z-index: 5;">
                    <div style="display: table-cell; width: 50%; text-align: left; vertical-align: bottom;">
                      <span style="font-size: 9.5px; font-weight: normal; color: #000;">
                        (Sign &amp; Date)
                      </span>
                    </div>
                    <div style="display: table-cell; width: 50%; text-align: right; vertical-align: bottom;">
                      <span style="font-size: 10.5px; font-weight: bold; font-family: 'Arial MT', 'Arial Bold', 'Arial', sans-serif; color: #000000; letter-spacing: 0.03em;">
                        AUTHORISED SIGNATORY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            `}
            </div>
          </div>
        ` : `
          <div style="margin-top: 5px; page-break-inside: avoid !important; break-inside: avoid !important;">
            <div style="font-size: 10px; font-weight: bold; font-family: Arial, sans-serif; color: #000; margin-bottom: 2px; text-transform: uppercase;">
              ACKNOWLEDGEMENT:- RECEIVED THE ABOVE GOODS IN CORRECT QUANTITY &amp; QUALITY
            </div>
            <div style="border: 1px solid #000000; border-radius: 6px; width: 100%; background-color: #ffffff; box-sizing: border-box; position: relative; min-height: 180px; height: 180px; padding: 10px 14px;">
              ${companyProfile.showStamp && companyProfile.stampUrl ? `
                <img src="${companyProfile.stampUrl}" style="position: absolute; left: ${companyProfile.stampX ?? 40}%; top: ${companyProfile.stampY ?? 55}%; transform: translate(-50%, -50%) scale(${companyProfile.stampScale || 1}); max-height: 95px; max-width: 145px; object-fit: contain; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
              ` : ''}

              <div style="display: table; width: 100%; box-sizing: border-box; font-family: Arial, sans-serif; position: relative; z-index: 5;">
                <!-- Customer Seal & Signature (Left Side) -->
                <div style="display: table-cell; width: 50%; vertical-align: top; text-align: left;">
                  <span style="font-size: 10.5px; font-weight: bold; color: #000; letter-spacing: 0.02em; display: block; text-transform: uppercase;">
                    CUSTOMER'S SEAL AND SIGNATURE
                  </span>
                </div>

                <!-- Seller / Authority Signatory (Right Side) -->
                <div style="display: table-cell; width: 50%; vertical-align: top; text-align: right;">
                  <span style="font-size: 10.5px; font-weight: bold; color: #000; letter-spacing: 0.02em; display: block; text-transform: uppercase; line-height: 1.25;">
                    FOR: ${formatCompanyNameWithSoleProp(data.providerName || companyProfile.name)}
                  </span>
                </div>
              </div>
              <div style="height: 1px; width: 100%; margin-top: 4px; background-color: #000000; position: relative; z-index: 5;"></div>

              <div style="display: table; width: 100%; margin-top: 105px; position: relative; z-index: 5;">
                <div style="display: table-cell; width: 50%; vertical-align: bottom; text-align: left;">
                  <span style="font-size: 9.5px; font-weight: normal; color: #000;">(Sign & Date)</span>
                </div>
                <div style="display: table-cell; width: 50%; vertical-align: bottom; text-align: right;">
                  <span style="font-size: 10.5px; font-weight: bold; font-family: Arial, sans-serif; color: #000; text-transform: uppercase;">
                    AUTHORISED SIGNATORY
                  </span>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
      ` : ''}
      <div class="system-generated-record" style="margin-top: 5px; margin-bottom: 2px; text-align: center; font-size: 9px; font-weight: bold; color: #000000 !important; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important; text-transform: uppercase; letter-spacing: 0.1em; width: 100%; display: block; clear: both;">
        ${data.systemGeneratedNote || 'SYSTEM GENERATED RECORD'}
      </div>
    </div>
  </div>
`).join('')}
        </div>
      </body>
    </html>
  `;

  return htmlContent;
};
