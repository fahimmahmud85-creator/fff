import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  Filter, 
  Save, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  ShoppingBag, 
  CheckCircle, 
  AlertCircle,
  FileCheck,
  Building,
  Hash,
  Layers,
  Calculator,
  Download,
  X,
  ClipboardCheck,
  Edit3,
  FileSpreadsheet,
  Upload,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Package,
  Eye,
  Undo2,
  Redo2,
  PackageCheck,
  Clipboard,
  Eraser,
  Copy,
  FilePlus,
  XCircle,
  Receipt,
  Building2
} from 'lucide-react';
import { EditCompanyModal } from './EditCompanyModal';
import { printHtml } from './PrintHelper';
import { generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { deriveWorkOrderNoFromInvoiceNo, InvoiceData } from './InvoiceDeliveryNoteForm';
import { INITIAL_CUSTOMERS } from '../customerData';
import { getActiveCompany, CompanyProfile, getCompanyPurchaseCategories } from '../utils/companyProfile';
import { syncSupplierToAllDatabases } from '../utils/customerSupplierSync';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';

export interface PurchaseItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  per?: string;
  vatRate?: number;
  productId?: string;
  balanceQty?: number;
  incomingStock?: number;
  balanceStock?: number;
  partNo?: string;
  dia?: string;
  pitch?: string;
  length?: string;
  finish?: string;
  brand?: string;
  opening?: number;
  unitWeight?: number;
  rackLocation?: string;
  isManualDescription?: boolean;
}

export interface PurchaseInvoice {
  id: string;
  companyId?: string;
  supplierName: string;
  supplierTrn: string;
  invoiceNo: string;
  invoiceDate: string;
  lpoRef: string;
  category: string;
  items: PurchaseItem[];
  subtotal: number;
  vatAmount: number; // 5% UAE standard VAT
  totalAmount: number;
  amountPaid?: number;
  paymentStatus: 'Pending' | 'Paid' | 'Partial';
  remarks: string;
  paymentTerms?: string;
  deliveryDate?: string;
  deliveryTerms?: string;
  currency?: string;
  supplierAddress?: string;
  supplierAttentionTo?: string;
  supplierPhone?: string;
  supplierFax?: string;
  supplierPoBox?: string;
  discount?: number;
  freightShipping?: number;
  preparedByName?: string;
  approvedByName?: string;
  isPurchaseRequest?: boolean;
  deliveryNoteNo?: string;
  dispatchBy?: string;
  deliveryMode?: string;
  countryOfOrigin?: string;
  hsCode?: string;
  placeOfSupply?: string;
  transporterName?: string;
  transporterDate?: string;
  airwayBillNo?: string;
  transporterAmount?: number;
  additionalNotes?: string;
}

interface SupplierPurchaseManagerProps {
  activeSubView?: 'form' | 'records' | 'vat';
  triggerToast: (msg: string) => void;
}

const DEFAULT_SUPPLIERS = [
  { 
    name: "SABIC STEEL INDUSTRIES L.L.C", 
    trn: "100345678900003",
    address: "PLOT 124, SECTOR M-37, MUSAFFAH INDUSTRIAL AREA, ABU DHABI, UAE",
    phone: "+971-2-555-1234",
    fax: "+971-2-555-5678",
    poBox: "P.O. BOX: 4859",
    attentionTo: "ACCOUNTS PAYABLE DEPT."
  },
  { 
    name: "HYUNDAI STEEL CO. (SEOUL)", 
    trn: "100456123400001",
    address: "12, HEOLLEUNG-RO, SEOCHO-GU, SEOUL, SOUTH KOREA",
    phone: "+82-2-3464-1114",
    fax: "+82-2-3464-0000",
    poBox: "P.O. BOX: SEOUL 137-938",
    attentionTo: "GLOBAL LOGISTICS & SHIPPING DIVISION"
  },
  { 
    name: "EMIRATES STEEL INDUSTRIES PJSC", 
    trn: "100112233400003",
    address: "ICAD II, MUSAFFAH, ABU DHABI, UAE",
    phone: "+971-2-507-2222",
    fax: "+971-2-507-3333",
    poBox: "P.O. BOX: 9022",
    attentionTo: "ACCOUNTS RECEIVABLES SECTION"
  },
  { 
    name: "NIPPON STEEL CORPORATION", 
    trn: "100887766500002",
    address: "2-6-1 MARUNOUCHI, CHIYODA-KU, TOKYO, JAPAN",
    phone: "+81-3-6867-4111",
    fax: "+81-3-6867-5678",
    poBox: "P.O. BOX: TOKYO 100-8071",
    attentionTo: "OVERSEAS PROCUREMENT DESK"
  },
  { 
    name: "AL GHANDI IRON & STEEL CO.", 
    trn: "100554433200005",
    address: "PLOT NO 598-105, JEBEL ALI INDUSTRIAL FIRST, DUBAI, UAE",
    phone: "+971-4-880-1234",
    fax: "+971-4-880-5678",
    poBox: "P.O. BOX: 10243",
    attentionTo: "STEEL DIVISION COORDINATOR"
  },
  { 
    name: "DUBAI BOLTS & FASTENERS TRADING", 
    trn: "100223344500001",
    address: "SHED #14, AL QUOZ INDUSTRIAL AREA 3, DUBAI, UAE",
    phone: "+971-4-340-1234",
    fax: "+971-4-340-5678",
    poBox: "P.O. BOX: 7421",
    attentionTo: "PURCHASING DESK MANAGER"
  },
  { 
    name: "EMIRATES FASTENERS FACTORY", 
    trn: "100667788900002",
    address: "SHED #12, AL RAMALAH INDUSTRIAL AREA, AJMAN, UAE",
    phone: "+971-6-748-1234",
    fax: "+971-6-748-5678",
    poBox: "P.O. BOX: 8902",
    attentionTo: "GENERAL LOGISTICS OFFICER"
  }
];

const INITIAL_PURCHASE_INVOICES: PurchaseInvoice[] = [
  // Marine Fasteners Industries LLC (comp-mfi)
  {
    id: 'mfi-po-1',
    companyId: 'comp-mfi',
    supplierName: 'NIPPON STEEL ASIA LLC',
    supplierTrn: '100887766500002',
    invoiceNo: 'MFI-PO-2026-015',
    invoiceDate: '2026-07-15',
    lpoRef: 'MFI-LPO-892',
    category: 'Steel Wire Rods / Raw Materials',
    items: [
      { id: '1', description: 'STEEL WIRE ROD GRADE 8.8 (10MM)', qty: 25000, unit: 'KG', unitPrice: 4.20, vatRate: 5, balanceStock: 25000 }
    ],
    subtotal: 105000.00,
    vatAmount: 5250.00,
    totalAmount: 110250.00,
    paymentStatus: 'Paid',
    remarks: 'Import shipment cleared at Jebel Ali Port'
  },
  {
    id: 'mfi-po-2',
    companyId: 'comp-mfi',
    supplierName: 'EMIRATES FASTENERS FACTORY',
    supplierTrn: '100667788900002',
    invoiceNo: 'MFI-PO-2026-014',
    invoiceDate: '2026-07-11',
    lpoRef: 'MFI-LPO-888',
    category: 'Work Order / Job Work',
    items: [
      { id: '1', description: 'HOT DIP GALVANIZING SERVICE ASTM A153', qty: 15000, unit: 'KG', unitPrice: 1.50, vatRate: 5, balanceStock: 15000 }
    ],
    subtotal: 22500.00,
    vatAmount: 1125.00,
    totalAmount: 23625.00,
    paymentStatus: 'Paid',
    remarks: 'Surface coating job work batch 105'
  },

  // Boltmaster Middle East FZCO (comp-bmm)
  {
    id: 'bmm-po-1',
    companyId: 'comp-bmm',
    supplierName: 'GLOBAL FASTENERS SUPPLIES FZE',
    supplierTrn: '100223344500001',
    invoiceNo: 'BMM-PO-2026-033',
    invoiceDate: '2026-07-14',
    lpoRef: 'BMM-LPO-104',
    category: 'High Tensile Fasteners / Hardware',
    items: [
      { id: '1', description: 'DIN 933 HEX HEAD BOLT 8.8 M12X50', qty: 10000, unit: 'PCS.', unitPrice: 5.50, vatRate: 5, balanceStock: 10000 }
    ],
    subtotal: 55000.00,
    vatAmount: 2750.00,
    totalAmount: 57750.00,
    paymentStatus: 'Paid',
    remarks: 'Fasteners stock delivery to Al Quoz warehouse'
  },
  {
    id: 'bmm-po-2',
    companyId: 'comp-bmm',
    supplierName: 'HYUNDAI STEEL CO. (SEOUL)',
    supplierTrn: '100456123400001',
    invoiceNo: 'BMM-PO-2026-034',
    invoiceDate: '2026-07-12',
    lpoRef: 'BMM-LPO-103',
    category: 'Imported Fasteners & Hardware Stock',
    items: [
      { id: '1', description: 'HEAVY HEX NUTS ASTM A194 GR 2H 1-1/8', qty: 5000, unit: 'PCS.', unitPrice: 8.20, vatRate: 5, balanceStock: 5000 }
    ],
    subtotal: 41000.00,
    vatAmount: 2050.00,
    totalAmount: 43050.00,
    paymentStatus: 'Paid',
    remarks: 'Import shipment container arrival'
  },

  // United Metal Industries (comp-umi)
  {
    id: 'umi-po-1',
    companyId: 'comp-umi',
    supplierName: 'SABIC HEAVY BILLET SUPPLIES',
    supplierTrn: '100345678900003',
    invoiceNo: 'UMI-PO-2026-009',
    invoiceDate: '2026-07-13',
    lpoRef: 'UMI-LPO-550',
    category: 'Steel Billets & Heavy Blooms',
    items: [
      { id: '1', description: 'HEAVY STRUCTURAL STEEL BILLETS 150X150', qty: 50, unit: 'TONS', unitPrice: 3800.00, vatRate: 5, balanceStock: 50 }
    ],
    subtotal: 190000.00,
    vatAmount: 9500.00,
    totalAmount: 199500.00,
    paymentStatus: 'Paid',
    remarks: 'Industrial metal consignment delivered to ICAD fabrication plant'
  }
];


const getPurchaseProductDisplayList = (p: any, displayQty?: number) => {
  if (!p) return [];
  const catUpper = (p.categoryName || '').toUpperCase();
  const subUpper = (p.subcategoryName || '').toUpperCase();
  const descUpper = (p.description || '').toUpperCase();
  
  const isFlangeBolt = catUpper.includes('FLANGE') || subUpper.includes('FLANGE') || descUpper.includes('FLANGE');
  const isHexBolt = catUpper.includes('HEX BOLT') || subUpper.includes('HEX BOLT') || descUpper.includes('HEX BOLT') || catUpper.includes('STRUCTURAL BOLT') || subUpper.includes('STRUCTURAL BOLT') || isFlangeBolt;
  const isNut = catUpper.includes('NUT') || subUpper.includes('NUT') || descUpper.includes('NUT');
  const isWasher = catUpper.includes('WASHER') || subUpper.includes('WASHER') || descUpper.includes('WASHER');

  // Extract grade short form (e.g. 4.6, 8.8, 10.9)
  let gradeStr = '';
  if (p.gradeName || p.grade) {
    const nameToMatch = p.gradeName || p.grade || '';
    const match = nameToMatch.match(/(4\.6|8\.8|10\.9|12\.9)/);
    if (match) {
      gradeStr = match[1];
    } else {
      gradeStr = nameToMatch.replace(/DIN\s*\d+/g, '').replace(/ISO\s*\d+/g, '').replace(/GR\s*/g, '').trim();
    }
  }

  // Determine thread type / threading code: FTM, HTM, FTI, HTI
  let threadAbbr = '';
  const combined = (catUpper + ' ' + subUpper + ' ' + (p.threadTypeName || p.threadType || '').toUpperCase() + ' ' + (p.gradeName || p.grade || '').toUpperCase() + ' ' + descUpper);

  if (isHexBolt) {
    if (combined.includes('FULL') && (combined.includes('METRIC') || combined.includes('M'))) {
      threadAbbr = 'FTM';
    } else if (combined.includes('HALF') && (combined.includes('METRIC') || combined.includes('M'))) {
      threadAbbr = 'HTM';
    } else if (combined.includes('FULL') && (combined.includes('INCH') || combined.includes('UNC') || combined.includes('UNF') || combined.includes('INCHES') || combined.includes(' BSW') || combined.includes('UNC/UNF'))) {
      threadAbbr = 'FTI';
    } else if (combined.includes('HALF') && (combined.includes('INCH') || combined.includes('UNC') || combined.includes('UNF') || combined.includes('INCHES') || combined.includes(' BSW') || combined.includes('UNC/UNF'))) {
      threadAbbr = 'HTI';
    } else {
      // Fallback detection
      const isMetric = combined.includes('METRIC') || combined.includes(' M') || combined.startsWith('M') || combined.includes(' M ') || combined.includes('MM');
      const isInch = combined.includes('INCH') || combined.includes('UNC') || combined.includes('UNF') || combined.includes('BSW') || combined.includes('INCHES');
      const hasHalf = combined.includes('HALF');
      if (hasHalf) {
        threadAbbr = isInch ? 'HTI' : 'HTM';
      } else {
        threadAbbr = isInch ? 'FTI' : 'FTM';
      }
    }
  } else if (isNut || isWasher) {
    const isMetric = combined.includes('METRIC') || combined.includes(' M') || combined.startsWith('M') || combined.includes(' M ') || combined.includes('MM') || combined.includes('MT');
    const isInch = combined.includes('INCH') || combined.includes('UNC') || combined.includes('UNF') || combined.includes('BSW') || combined.includes('INCHES');
    if (isMetric) {
      threadAbbr = 'METRIC MT';
    } else if (isInch) {
      threadAbbr = 'INCHES IN';
    } else {
      threadAbbr = (p.threadTypeName || p.threadType || '').toUpperCase();
    }
  } else {
    threadAbbr = (p.threadTypeName || p.threadType || '').toUpperCase();
  }

  // Size formatting
  let sizeStr = '';
  if (p.dia && p.length) {
    sizeStr = `${p.dia} X ${p.length}`;
  } else {
    sizeStr = p.dia || p.length || p.size || '';
  }

  if (sizeStr) {
    sizeStr = sizeStr.toUpperCase().trim();
    sizeStr = sizeStr.replace(/\s+/g, ' ');
    const isMetric = threadAbbr.endsWith('M') || threadAbbr.endsWith('MT') || threadAbbr.includes('METRIC') || catUpper.includes('METRIC') || subUpper.includes('METRIC');
    if (isMetric && /^\d/.test(sizeStr)) {
      sizeStr = 'M' + sizeStr;
    }
    if (isMetric && !sizeStr.endsWith('MM')) {
      if (/^M?\d+\s*[X/x]\s*\d+(\s*MM)?$/i.test(sizeStr)) {
        sizeStr = sizeStr.replace(/\s*MM/i, '') + 'MM';
      }
    }
  }

  const pNo = (p.partNo || '').toUpperCase().trim();
  const pCat = (p.categoryName || '').toUpperCase().trim();
  let pSub = (p.subcategoryName || '').toUpperCase().trim();
  if (pSub.startsWith(pCat) && pSub.length > pCat.length) {
    pSub = pSub.replace(pCat, '').trim();
  }
  const pThread = threadAbbr.toUpperCase().trim();
  const pGrade = (gradeStr || p.gradeName || p.grade || '').toUpperCase().trim();
  const pSize = sizeStr.toUpperCase().trim();
  const pFinish = (p.finish && !p.finish.toUpperCase().includes('SELF') && !p.finish.toUpperCase().includes('PLAIN')) ? p.finish.toUpperCase().trim() : 'SELF';

  const list: string[] = [];
  list.push(pNo || '—');
  list.push(pCat || '—');
  list.push(pSub || '—');
  list.push(pThread || '—');
  list.push(pGrade || '—');
  list.push(pFinish || 'SELF');
  list.push(pSize || '—');
  
  const qtyVal = displayQty !== undefined ? displayQty : (p.balanceStock !== undefined ? p.balanceStock : 0);
  list.push(`${qtyVal} ${p.unit || 'PCS.'}`);

  return list;
};

const formatPurchaseProductDisplay = (p: any, displayQty?: number) => {
  const list = getPurchaseProductDisplayList(p, displayQty);
  if (list.length === 0) return '';
  return list.join(' | ').trim();
};

function getCustomDimensionColumns(subNameRaw: string, catNameRaw: string) {
  const cat = (catNameRaw || "").toLowerCase();
  const sub = (subNameRaw || "").toUpperCase().trim();
  if (cat === "u bolts" || cat === "u bolt") {
    if (sub === "ROUND BEND U BOLT" || sub === "ROUND BEND U BOLTS") {
      return [
        { key: "dimA", label: "A" },
        { key: "threadD", label: "D" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" }
      ];
    } else if (sub === "SQUARE BEND U BOLTS" || sub === "SQUARE BEND U BOLT") {
      return [
        { key: "dimA", label: "A" },
        { key: "threadD", label: "D" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" }
      ];
    } else if (sub === "NEOPRENE SLEEVE U BOLT" || sub === "NEOPRENE SLEEVE U BOLTS") {
      return [
        { key: "threadD", label: "D" },
        { key: "dimC", label: "C" },
        { key: "threadL", label: "L" },
        { key: "length", label: "H" }
      ];
    } else if (sub === "U BOLTS RUBBER LINED WITH PTFE PAD" || sub === "U BOLT RUBBER LINED WITH PTFE PAD") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" },
        { key: "dimG", label: "G" },
        { key: "dimH", label: "H" }
      ];
    } else if (sub === "RUBBER MOULDED SLEEVED U BOLT" || sub === "RUBBER MOULDED SLEEVED U BOLTS") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" },
        { key: "dimG", label: "G" }
      ];
    } else if (sub === "U BOLT WITH PTFE SLEEVE & PAD" || sub === "U BOLT WITH PTFE SLEEVE AND PAD") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" },
        { key: "dimG", label: "G" }
      ];
    } else if (sub === "U BOLT WITH PU COATING WITH RUBBER PAD LINED" || sub === "U BOLT WITH PU COATING WITH RUBBER PAD") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" }
      ];
    } else if (sub === "U BOLT WITH SILICONE RUBBER LINED" || sub === "U BOLT WITH SILICON RUBBER LINED") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" }
      ];
    } else if (sub === "NEOPRENE SLEEVE ROUND TYPE-1" || sub.includes("NEOPRENE SLEEVE ROUND") || sub === "NEOPRENE SLEEVE ROUND TYPE 1") {
      return [
        { key: "innerDia", label: "ID" },
        { key: "outerDia", label: "OD" },
        { key: "thickness", label: "THK" }
      ];
    } else if (sub === "INSULATED U BOLTS" || sub === "INSULATED U BOLT") {
      return [
        { key: "innerDia", label: "ID" },
        { key: "outerDia", label: "OD" },
        { key: "thickness", label: "THK" }
      ];
    } else if (sub === "U BOLT PLATE" || sub === "U BOLT PLATES") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" }
      ];
    } else if (sub === "EXHAUST CLAMPS" || sub === "EXHAUST CLAMP") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" },
        { key: "dimG", label: "G" },
        { key: "dimH", label: "H" }
      ];
    }
  } else if (cat === "anchor bolts" || cat === "anchor bolt") {
    if (sub === "STRAIGHT ANCHOR BOLTS" || sub === "STRAIGHT ANCHOR BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "length", label: "L" },
        { key: "topThreadT1", label: "T1" },
        { key: "bottomThreadT2", label: "T2" }
      ];
    } else if (sub === "L TYPE ANCHOR BOLTS TYPE-1" || sub === "L TYPE ANCHOR BOLTS" || sub === "L TYPE ANCHOR BOLT TYPE-1" || sub === "L TYPE ANCHOR BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadT", label: "T" },
        { key: "length", label: "L" },
        { key: "bendC", label: "C" }
      ];
    } else if (sub === "L TYPE ANCHOR BOLTS TYPE-2" || sub === "L TYPE ANCHOR BOLT TYPE-2") {
      return [
        { key: "threadD", label: "D" },
        { key: "bendC", label: "C" },
        { key: "dimR", label: "R" },
        { key: "length", label: "L" },
        { key: "dimB", label: "B" }
      ];
    } else if (sub === "L TYPE ANCHOR BOLTS TYPE-3" || sub === "L TYPE ANCHOR BOLT TYPE-3") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadC", label: "C" },
        { key: "dimB", label: "B" },
        { key: "bendL1", label: "L1" },
        { key: "bendRadius", label: "RADIUS" }
      ];
    } else if (sub === "J TYPE ANCHOR BOLTS" || sub === "J TYPE ANCHOR BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadT", label: "T" },
        { key: "length", label: "L" },
        { key: "dimC", label: "C" },
        { key: "dimA", label: "A" }
      ];
    } else if (sub === "JA TYPE ANCHOR BOLTS" || sub === "JA TYPE ANCHOR BOLT") {
      return [
        { key: "threadD", label: "D1" },
        { key: "threadS", label: "S" },
        { key: "length", label: "L" },
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" }
      ];
    } else if (sub === "EYE TYPES FOUNDATION BOLTS" || sub === "EYE TYPES FOUNDATION BOLT" || sub === "EYE TYPE FOUNDATION BOLTS" || sub === "EYE TYPE FOUNDATION BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "length", label: "L" },
        { key: "dimC", label: "C" },
        { key: "dimE", label: "E" },
        { key: "threadT", label: "T" }
      ];
    } else if (sub === "SPLIT TYPES FOUNDATION BOLTS" || sub === "SPLIT TYPES FOUNDATION BOLT" || sub === "SPLIT TYPE FOUNDATION BOLTS" || sub === "SPLIT TYPE FOUNDATION BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadB", label: "B" },
        { key: "length", label: "L" },
        { key: "dimC", label: "C" },
        { key: "dimA", label: "A" }
      ];
    } else if (sub === "V TYPE WITH CROSS ROD BOLTS" || sub === "V TYPE WITH CROSS ROD BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "dimA", label: "A" },
        { key: "threadB", label: "B" },
        { key: "dimC", label: "C" }
      ];
    } else if (sub === "Z TYPES FOUNDATION BOLTS" || sub === "Z TYPES FOUNDATION BOLT" || sub === "Z TYPE FOUNDATION BOLTS" || sub === "Z TYPE FOUNDATION BOLT") {
      return [
        { key: "threadD", label: "D1" },
        { key: "threadS", label: "S" },
        { key: "dimA", label: "A" },
        { key: "length", label: "L" },
        { key: "bendL1", label: "L1" },
        { key: "dimR1", label: "R1" },
        { key: "dimR", label: "R2" }
      ];
    } else if (sub === "Z & J TYPES FOUNDATION BOLTS" || sub === "Z & J TYPES FOUNDATION BOLT" || sub === "Z AND J TYPES FOUNDATION BOLTS" || sub === "Z AND J TYPES FOUNDATION BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadB", label: "B" },
        { key: "dimY", label: "Y" },
        { key: "dimA", label: "A" },
        { key: "dimC", label: "C" },
        { key: "length", label: "L" }
      ];
    } else if (sub === "GUSSET & PLATE TYPES BOLTS" || sub === "GUSSET & PLATE TYPES BOLT" || sub === "GUSSET AND PLATE TYPES BOLTS" || sub === "GUSSET AND PLATE TYPES BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadB", label: "B" },
        { key: "length", label: "L" },
        { key: "dimC", label: "C" },
        { key: "dimF", label: "F" },
        { key: "dimH", label: "H" }
      ];
    } else if (sub === "WELDING TYPE ANCHOR BOLTS" || sub === "WELDING TYPE ANCHOR BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadB", label: "B" },
        { key: "dimL1", label: "L1" },
        { key: "dimL2", label: "L2" },
        { key: "dimR1", label: "R1" },
        { key: "dimR", label: "R2" },
        { key: "length", label: "L" },
        { key: "dimC", label: "C" }
      ];
    } else if (sub === "SQUARE BEND J ANCHOR BOLTS" || sub === "SQUARE BEND J ANCHOR BOLT") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadT", label: "T" },
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "length", label: "L" }
      ];
    } else if (sub === "J HOOK" || sub === "J HOOKS") {
      return [
        { key: "threadD", label: "D" },
        { key: "threadT", label: "T" },
        { key: "length", label: "L" },
        { key: "dimB", label: "B" },
        { key: "bendC", label: "C" }
      ];
    } else if (sub === "ROUND WASHER" || sub === "ROUND WASHERS") {
      return [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" }
      ];
    } else if (sub === "SQUARE WASHER" || sub === "SQUARE WASHERS") {
      return [
        { key: "dimB", label: "B" },
        { key: "dimA", label: "A" },
        { key: "dimC", label: "C" }
      ];
    }
  } else if (cat === "pins" || cat === "pin") {
    if (sub === "SPLIT PINS" || sub === "SPLIT PIN") {
      return [
        { key: "length", label: "B" }
      ];
    }
  }
  return [];
}

interface DimensionLayout {
  dia: string;
  pitch: string;
  length: string;
  extraCols: { key: string; label: string }[];
}

function getCategoryDimensionLayout(catNameRaw: string, subNameRaw: string): DimensionLayout {
  const catName = (catNameRaw || '').toLowerCase().trim();
  const subName = (subNameRaw || '').toUpperCase().trim();

  let dia = "SIZE";
  let pitch = "PITCH";
  let length = "SPECIFICATION";
  let extraCols: { key: string; label: string }[] = [];

  if (catName === "pins" || catName === "pin") {
    dia = "Nominal Size";
    pitch = "—";
    length = "—";
    if (subName === "SPLIT PINS") {
      dia = "DIA A";
      pitch = "—";
      length = "LENGTH B";
    } else if (subName === "R CLIPS" || (subName.includes("R CLIP") && !subName.includes("DOUBLE"))) {
      dia = "Nominal Size";
      pitch = "D";
      length = "L";
    } else if (subName.includes("DOUBLE COIL") || subName.includes("DOUBLE")) {
      dia = "Nominal Size";
      pitch = "D1";
      length = "L";
    } else if (subName === "HAIR PIN RETAINER CLIP" || subName.includes("HAIR PIN") || subName.includes("RETAINER")) {
      dia = "Nominal Size";
      pitch = "—";
      length = "B";
    } else if (subName.includes("LINCH")) {
      dia = "Nominal Size";
      pitch = "—";
      length = "L";
    } else if (subName.includes("HITCH")) {
      dia = "Nominal Size";
      pitch = "—";
      length = "—";
    } else if (subName === "WAVE PINS") {
      dia = "Nominal Size";
      pitch = "D";
      length = "L";
    } else if (subName === "S-LOK" || subName === "DOWEL PINS") {
      dia = "Nominal Size";
      pitch = "D";
      length = "L";
    } else if (subName === "CLEVIS PINS") {
      dia = "Nominal Size";
      pitch = "—";
      length = "—";
    }

    if (subName === "CLEVIS PINS") {
      extraCols = [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" }
      ];
    } else if (subName === "SPLIT PINS") {
      extraCols = [{ key: "dimH", label: "H" }];
    } else if (subName === "HAIR PIN RETAINER CLIP" || subName.includes("HAIR PIN")) {
      extraCols = [
        { key: "dimA", label: "A" },
        { key: "dimC", label: "C" },
        { key: "dimF", label: "F" }
      ];
    } else if (subName.includes("LINCH")) {
      extraCols = [
        { key: "dimD", label: "D" },
        { key: "dimB", label: "B" },
        { key: "dimD1", label: "D1" },
        { key: "dimB2", label: "B2" },
        { key: "dimH", label: "H" },
        { key: "dimB1", label: "B1" }
      ];
    } else if (subName.includes("HITCH")) {
      extraCols = [
        { key: "dimA", label: "A" },
        { key: "dimE", label: "E" },
        { key: "dimT", label: "T" },
        { key: "dimOD", label: "OD" },
        { key: "dimC", label: "C" },
        { key: "dimB", label: "B" }
      ];
    } else if (subName === "WAVE PINS") {
      extraCols = [{ key: "dimT", label: "t" }];
    } else if (subName === "S-LOK" || subName === "DOWEL PINS") {
      extraCols = [{ key: "dimA", label: "A" }];
    }

  } else if (catName === "gasket" || catName === "gaskets") {
    dia = "Size (NPS/DN)";
    pitch = "-";
    length = "Thickness";
  } else if (catName === "pipe support systems" || catName === "pipe supports systems" || catName.includes("pipe support")) {
    dia = "SIZE (INCH)";
    pitch = "PITCH";
    length = "SPECIFICATION";

    if (subName === "CLEVIS HANGER") {
      dia = "DIA D"; pitch = "SIZE (INCHES)"; length = "ROD HOLE SIZE";
      extraCols = [
        { key: "boltSize", label: "BOLT SIZE" },
        { key: "hMm", label: "H (MM)" },
        { key: "dMm", label: "D (MM)" },
        { key: "upperSteel", label: "UPPER STEEL" },
        { key: "lowerSteel", label: "LOWER STEEL" }
      ];
    } else if (subName === "CLEVIS HANGER WITH LINING") {
      dia = "SIZE (INCHES)"; pitch = "ROD HOLE SIZE"; length = "BOLT SIZE";
      extraCols = [
        { key: "hMm", label: "H (MM)" },
        { key: "dMm", label: "D (MM)" },
        { key: "upperSteel", label: "UPPER STEEL" },
        { key: "lowerSteel", label: "LOWER STEEL" }
      ];
    } else if (subName === "SPRINKLER CLAMP") {
      dia = "SIZE (INCHES)"; pitch = "D (MM)"; length = "G";
      extraCols = [
        { key: "stripSize", label: "STD. STRIP SIZE" },
        { key: "hMm", label: "H (MM)" },
        { key: "crossSection", label: "CROSS SECTION" }
      ];
    } else if (subName === "SPLIT CLAMP WITH EPDM LINING" || subName === "PLAIN SPLIT CLAMP") {
      dia = "SIZE (INCHES)"; pitch = "D (MM)"; length = "D RANGE (MM)";
      extraCols = [
        { key: "stripSize", label: "STD. STRIP SIZE" },
        { key: "hMm", label: "H (MM)" },
        { key: "crossSection", label: "CROSS SECTION" }
      ];
    } else if (subName === "U STRAP HANGER" || subName === "U STRAP HANGER WITH LINING") {
      dia = "D (INCHES)"; pitch = "D (MM)"; length = "A (MM)";
      extraCols = [
        { key: "steelSize", label: "METAL SIZE D" },
        { key: "hMm", label: "H (MM)" }
      ];
    } else if (subName === "RUBBER SUPPORT INSERT") {
      dia = "PIPE SIZE (INCHES)"; pitch = "PIPE SIZE (MM)"; length = "PIPE OD (MM)";
      extraCols = [
        { key: "thickMm", label: "THICKNESS T (MM)" },
        { key: "lengthMm", label: "LENGTH L (MM)" }
      ];
    } else if (subName === "RISER HANGER WITH LINING" || subName === "RISER HANGER") {
      dia = "D (INCHES)"; pitch = "LENGTH (MM)"; length = "METAL SIZE (MM)";
      extraCols = [
        { key: "boltSize", label: "BOLT SIZE" }
      ];
    } else if (subName === "ANCHOR BOLT SLEEVE") {
      dia = "SIZE (MM)"; pitch = "L (MM)"; length = "D (L)";
      extraCols = [
        { key: "dimID", label: "I D (MM)" },
        { key: "topOD", label: "TOP O D (MM)" }
      ];
    } else if (subName === "U BOLT BEAM CLAMP TYPE-1") {
      dia = "D"; pitch = "A"; length = "B";
      extraCols = [
        { key: "dimC", label: "C" },
        { key: "dimE", label: "E" },
        { key: "dimF", label: "F" },
        { key: "dimG", label: "G" }
      ];
    } else if (subName === "U BOLT BEAM CLAMP TYPE-2") {
      dia = "A"; pitch = "G"; length = "L";
      extraCols = [
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" },
        { key: "dimH", label: "H" }
      ];
    } else if (subName === "THREAD ROD BEAM CLAMP" || subName === "TUBE CLAMPS") {
      dia = "SIZE"; pitch = "—"; length = "—";
    } else if (subName === "UNISTRUT CHANNEL CLAMP") {
      dia = "PIPE SIZE (INCHES)"; pitch = "A"; length = "B";
      extraCols = [
        { key: "dimT", label: "T" }
      ];
    } else if (subName === "HEAVY DUTY PIPE CLAMPS" || subName === "HEAVY DUTY DOUBLE BOLT CLAMP") {
      dia = "NOMINAL PIPE SIZE (IN)"; pitch = "NOMINAL PIPE SIZE (MM)"; length = "PIPE OD";
      extraCols = [
        { key: "stripSize", label: "BAR SIZE" },
        { key: "boltSize", label: "BOLT SIZE" }
      ];
    } else if (subName === "T BOLT CLAMPS") {
      dia = "CLAMPING RANGE"; pitch = "D (MM)"; length = "D (IN)";
      extraCols = [
        { key: "boltSize", label: "BOLT SIZE" },
        { key: "bandThickness", label: "BAND THICKNESS" },
        { key: "bandWidth", label: "BAND WIDTH" }
      ];
    } else if (subName === "RETAINING HOSE CLAMPS") {
      dia = "CLAMPING RANGE (MM)"; pitch = "CLAMPING RANGE (IN)"; length = "—";
      extraCols = [
        { key: "bandThickness", label: "BAND THICKNESS" },
        { key: "bandWidth", label: "BAND WIDTH" }
      ];
    } else if (subName === "OFFSET PIPE CLAMP") {
      dia = "NOMINAL PIPE SIZE (IN)"; pitch = "NOMINAL PIPE SIZE (MM)"; length = "A";
      extraCols = [
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "stripSize", label: "BAR SIZE" }
      ];
    } else if (subName === "ANTI VIBRATION HANGER MOUNT") {
      dia = "DEFLECTION (MM)"; pitch = "ROD SIZE (MM)"; length = "A";
      extraCols = [
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimH", label: "H" },
        { key: "ratedCap", label: "RATED CAPACITY" }
      ];
    } else if (subName === "RIBBED MOUNTING PAD" || subName === "METAL SANDWICH PAD" || subName === "WAFFLE PAD" || subName === "CORK SANDWICH PAD") {
      dia = "SIZE INCHES"; pitch = "REC LOAD (KGS)"; length = "MAX LOAD KGS";
    } else if (subName === "RIBBED MULTI-LAYER PAD") {
      dia = "SIZE INCHES"; pitch = "REC LOAD (KGS)"; length = "DEFLECTION (MM)";
    } else if (subName === "VIBRATION SPRING FLEX & NEOPRENE HANGER") {
      dia = "SPRING COLOR"; pitch = "L"; length = "W";
      extraCols = [
        { key: "dimH", label: "H" },
        { key: "dimD", label: "D" },
        { key: "ratedCap", label: "RATED TEMP/CAP" }
      ];
    } else if (subName === "VIBRATION SPRING FLEX HANGER") {
      dia = "DEFLECTION (MM)"; pitch = "ROD SIZE (MM)"; length = "COLOR";
      extraCols = [
        { key: "ratedCap", label: "RATED CAPACITY" }
      ];
    } else if (subName === "VIBRATION HANGER NEOPRENE") {
      dia = "DEFLECTION (MM)"; pitch = "ROD SIZE (MM)"; length = "B";
      extraCols = [
        { key: "colorCode", label: "COLOR CODE" },
        { key: "ratedCap", label: "RATED CAPACITY" }
      ];
    } else if (subName === "RIGHT ANGLE CLAMP") {
      dia = "PIPE/RIGID CONDUIT SIZE"; pitch = "A"; length = "B";
    }

  } else if (catName === "anchor bolts" || catName === "anchor bolt") {
    dia = "DIA D";
    pitch = "THREAD / SLEEVE";
    length = "LENGTH L";
    if (subName === "ROUND WASHER" || subName === "SQUARE WASHER" || subName === "ANCHOR BOLT SLEEVE") {
      dia = "ID"; pitch = "OD"; length = "THICKNESS S";
    } else {
      if (subName === "JA TYPE ANCHOR BOLTS" || subName === "Z TYPES FOUNDATION BOLTS") {
        dia = "DIA d1";
      }
      if (subName === "L TYPE ANCHOR BOLTS TYPE-3") {
        length = "LENGTH B";
      } else if (subName === "V TYPE WITH CROSS ROD BOLTS") {
        length = "LENGTH C";
      }
    }

    if (subName === "STRAIGHT ANCHOR BOLTS") {
      extraCols = [
        { key: "topThreadT1", label: "TOP THREAD T1" },
        { key: "bottomThreadT2", label: "BOTTOM THREAD T2" }
      ];
    } else if (subName === "L TYPE ANCHOR BOLTS TYPE-1" || subName === "L TYPE ANCHOR BOLTS") {
      extraCols = [
        { key: "threadT", label: "THREAD T" },
        { key: "bendC", label: "BEND C" }
      ];
    } else if (subName === "L TYPE ANCHOR BOLTS TYPE-2") {
      extraCols = [
        { key: "threadT", label: "THREAD T" },
        { key: "bendC", label: "BEND C" },
        { key: "dimB", label: "B" }
      ];
    } else if (subName === "L TYPE ANCHOR BOLTS TYPE-3") {
      extraCols = [
        { key: "threadC", label: "THREAD C" },
        { key: "bendL1", label: "BEND L1" },
        { key: "bendRadius", label: "BEND RADIUS °" }
      ];
    } else if (subName === "J TYPE ANCHOR BOLTS") {
      extraCols = [
        { key: "threadT", label: "THREAD T" },
        { key: "dimC", label: "C" },
        { key: "dimA", label: "A" }
      ];
    } else if (subName === "JA TYPE ANCHOR BOLTS") {
      extraCols = [
        { key: "threadS", label: "THREAD S" },
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" }
      ];
    } else if (subName === "EYE TYPES FOUNDATION BOLTS") {
      extraCols = [
        { key: "threadT", label: "THREAD T" },
        { key: "dimE", label: "E" },
        { key: "dimC", label: "C" }
      ];
    } else if (subName === "SPLIT TYPES FOUNDATION BOLTS") {
      extraCols = [
        { key: "threadB", label: "THREAD B" },
        { key: "dimA", label: "A" },
        { key: "dimC", label: "C" }
      ];
    } else if (subName === "V TYPE WITH CROSS ROD BOLTS") {
      extraCols = [
        { key: "threadB", label: "THREAD B" },
        { key: "dimA", label: "A" }
      ];
    } else if (subName === "Z TYPES FOUNDATION BOLTS") {
      extraCols = [
        { key: "threadS", label: "THREAD S" },
        { key: "dimA", label: "A" },
        { key: "dimR", label: "R" },
        { key: "dimR1", label: "R1" }
      ];
    } else if (subName === "Z & J TYPES FOUNDATION BOLTS") {
      extraCols = [
        { key: "threadB", label: "THREAD B" },
        { key: "dimA", label: "A" },
        { key: "dimC", label: "C" },
        { key: "dimY", label: "Y" }
      ];
    } else if (subName === "GUSSET & PLATE TYPES BOLTS") {
      extraCols = [
        { key: "threadB", label: "THREAD B" },
        { key: "dimC", label: "C" },
        { key: "dimF", label: "F" },
        { key: "dimH", label: "H" }
      ];
    } else if (subName === "WELDING TYPE ANCHOR BOLTS") {
      extraCols = [
        { key: "threadB", label: "THREAD B" },
        { key: "dimC", label: "C" },
        { key: "dimL1", label: "L1" },
        { key: "dimL2", label: "L2" }
      ];
    } else if (subName === "SQUARE BEND J ANCHOR BOLTS") {
      extraCols = [
        { key: "threadT", label: "THREAD T" },
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" }
      ];
    } else if (subName === "J HOOK") {
      extraCols = [
        { key: "threadT", label: "THREAD T" },
        { key: "bendC", label: "BEND C" },
        { key: "dimB", label: "B" }
      ];
    }

  } else if (catName === "u bolts" || catName === "u bolt") {
    dia = "DIA A";
    pitch = "INSIDE WIDTH (C)";
    length = "LENGTH SPEC";

    const subLowed = subName.toLowerCase();
    if (subName === "ROUND BEND U BOLT" || subName === "SQUARE BEND U BOLTS" || subName === "U BOLTS RUBBER LINED WITH PTFE PAD") {
      const lenChar = subName === "ROUND BEND U BOLT" ? "B" : subName === "SQUARE BEND U BOLTS" ? "C" : "D";
      dia = "DIA A";
      pitch = "INSIDE WIDTH (C)";
      length = `LENGTH ${lenChar}`;
    } else if (subName === "NEOPRENE SLEEVE U BOLT" || subName === "U BOLT WITH SILICONE RUBBER LINED") {
      dia = "DIA d";
      pitch = "THREAD SIZE";
      length = "LENGTH h";
    } else if (subName === "RUBBER MOULDED SLEEVED U BOLT" || 
               subName === "U BOLT WITH PTFE SLEEVE & PAD" || 
               subName === "U BOLT WITH PU COATING WITH RUBBER PAD LINED" || 
               subName === "INSULATED U BOLTS") {
      dia = "E"; pitch = "F"; length = "G";
    } else if (subLowed.includes("neoprene sleeve")) {
      dia = "INNER DIA"; pitch = "OUTER DIA"; length = "THICKNES S";
    } else if (subName === "U BOLT PLATE") {
      dia = "A"; pitch = "B"; length = "C";
    } else if (subName === "EXHAUST CLAMPS") {
      dia = "B"; pitch = "C"; length = "D";
    }

    if (subName === "ROUND BEND U BOLT") {
      extraCols = [
        { key: "threadD", label: "THREAD D" },
        { key: "innerDiaC", label: "INNER DIA C" }
      ];
    } else if (subName === "SQUARE BEND U BOLTS") {
      extraCols = [
        { key: "threadD", label: "THREAD D" },
        { key: "innerDiaB", label: "INNER DIA B" }
      ];
    } else if (subName === "NEOPRENE SLEEVE U BOLT" || subName === "U BOLT WITH SILICONE RUBBER LINED") {
      extraCols = [
        { key: "threadL", label: "THREAD l" },
        { key: "innerDiaC", label: "INNER DIA C" }
      ];
    } else if (subName === "U BOLTS RUBBER LINED WITH PTFE PAD") {
      extraCols = [
        { key: "threadE", label: "THREAD E" },
        { key: "innerDiaB", label: "INNER DIA B" },
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" }
      ];
    } else if (subName === "RUBBER MOULDED SLEEVED U BOLT" || 
               subName === "U BOLT WITH PTFE SLEEVE & PAD" || 
               subName === "U BOLT WITH PU COATING WITH RUBBER PAD LINED" || 
               subName === "INSULATED U BOLTS") {
      extraCols = [
        { key: "dimA", label: "A" },
        { key: "dimB", label: "B" },
        { key: "dimC", label: "C" },
        { key: "dimD", label: "D" }
      ];
    } else if (subName === "U BOLT PLATE") {
      extraCols = [
        { key: "dimD", label: "D" },
        { key: "dimE", label: "E" }
      ];
    } else if (subName === "EXHAUST CLAMPS") {
      extraCols = [
        { key: "dimE", label: "E" },
        { key: "threadDia", label: "THREAD DIA" },
        { key: "dimG", label: "G" },
        { key: "dimH", label: "H" },
        { key: "dimI", label: "I" }
      ];
    }
  }

  return { dia, pitch, length, extraCols };
}

const renderPurchaseProductDisplayWithColors = (p: any, displayQty?: number) => {
  const parts = getPurchaseProductDisplayList(p, displayQty);
  if (parts.length === 0) return null;

  const [pNo, pCat, pSub, pThread, pGrade, pFinish, pSize, pQty] = parts;

  const itemsList = [
    { text: pNo || '—', className: 'text-slate-800 font-semibold' },
    { text: pCat || '—', className: 'text-slate-400 font-semibold' },
    { text: pSub || '—', className: 'text-slate-400 font-semibold' },
    { text: pThread || '—', className: 'text-blue-600 font-bold' },
    { text: pGrade || '—', className: 'text-blue-900 font-bold' },
    { text: pFinish || 'SELF', className: 'text-slate-400 font-semibold' },
    { text: pSize || '—', className: 'text-amber-600 font-bold' },
    { text: pQty, className: 'text-emerald-600 font-semibold' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 select-all font-mono">
      {itemsList.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-slate-300 font-normal">|</span>}
          <span className={item.className}>{item.text}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default function SupplierPurchaseManager({ activeSubView = 'form', triggerToast }: SupplierPurchaseManagerProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'records' | 'vat'>(activeSubView);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Keep activeTab synchronized whenever activeSubView changes from parent navigation
  useEffect(() => {
    if (activeSubView) {
      setActiveTab(activeSubView);
    }
  }, [activeSubView]);

  // Active Company State with dynamic category resolution & data isolation
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());
  const purchaseCategories = getCompanyPurchaseCategories(activeCompany.code);

  useEffect(() => {
    const handleSync = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
    };
  }, []);

  const [purchaseEnterPromptActive, setPurchaseEnterPromptActive] = useState<boolean>(false);
  const [isCreateNewPurchaseModalOpen, setIsCreateNewPurchaseModalOpen] = useState<boolean>(false);
  const [isSavePurchaseModalOpen, setIsSavePurchaseModalOpen] = useState<boolean>(false);
  const [purchasePromptSelection, setPurchasePromptSelection] = useState<'add' | 'cancel'>('add');
  const purchaseAddRowButtonRef = useRef<HTMLButtonElement>(null);
  
  // State for Purchase Invoices
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    let loaded: PurchaseInvoice[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      } catch (e) {}
    }
    if (loaded.length === 0) {
      loaded = INITIAL_PURCHASE_INVOICES;
    }
    // Filter out old dummy seed purchases to keep database pristine
    return loaded.filter(p => p.id !== 'pur-1' && p.id !== 'pur-2' && p.id !== 'pur-3');
  });

  // State for Sales Invoices (read-only for UAE VAT Return calculation)
  const [salesInvoices, setSalesInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((d: any) => d.documentType === 'TAX INVOICE');
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Focus ERP 9 UAE VAT Return State
  const [vatFromDate, setVatFromDate] = useState<string>('2026-01-01');
  const [vatToDate, setVatToDate] = useState<string>('2026-12-31');
  const [vatEmirateFilter, setVatEmirateFilter] = useState<string>('ALL');
  const [vatIncludeAnnexure, setVatIncludeAnnexure] = useState<boolean>(true);

  // Keep sales invoices updated if they change elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSalesInvoices(parsed.filter((d: any) => d.documentType === 'TAX INVOICE'));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save purchases to local storage
  useEffect(() => {
    localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(purchases));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('mfi_supplier_purchases_updated'));
  }, [purchases]);

  useEffect(() => {
    if (purchaseEnterPromptActive) {
      setTimeout(() => {
        if (purchaseAddRowButtonRef.current) {
          purchaseAddRowButtonRef.current.focus();
        }
      }, 50);
    }
  }, [purchaseEnterPromptActive]);

  // Read form draft from local storage for stability
  const draft = (() => {
    try {
      const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASE_FORM_DRAFT');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  })();

  // Form Fields
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState<number>(() => draft ? (draft.selectedSupplierIndex ?? -1) : -1);
  const [customSupplierName, setCustomSupplierName] = useState(() => draft ? (draft.customSupplierName ?? '') : '');
  const [supplierTrn, setSupplierTrn] = useState(() => draft ? (draft.supplierTrn ?? '') : '');
  const [supplierAddress, setSupplierAddress] = useState(() => draft ? (draft.supplierAddress ?? '') : '');
  const [supplierAttentionTo, setSupplierAttentionTo] = useState(() => draft ? (draft.supplierAttentionTo ?? '') : '');
  const [supplierPhone, setSupplierPhone] = useState(() => draft ? (draft.supplierPhone ?? '') : '');
  const [supplierMobile, setSupplierMobile] = useState(() => draft ? (draft.supplierMobile ?? '') : '');
  const [supplierEmail, setSupplierEmail] = useState(() => draft ? (draft.supplierEmail ?? '') : '');
  const [supplierFax, setSupplierFax] = useState(() => draft ? (draft.supplierFax ?? '') : '');
  const [supplierPoBox, setSupplierPoBox] = useState(() => draft ? (draft.supplierPoBox ?? '') : '');

  const [invoiceNo, setInvoiceNo] = useState(() => draft ? (draft.invoiceNo ?? '') : '');
  const [deliveryNoteNo, setDeliveryNoteNo] = useState(() => draft ? (draft.deliveryNoteNo ?? '') : '');
  const [invoiceDate, setInvoiceDate] = useState(() => draft ? (draft.invoiceDate ?? new Date().toISOString().substring(0, 10)) : new Date().toISOString().substring(0, 10));
  const [lpoRef, setLpoRef] = useState(() => draft ? (draft.lpoRef ?? '') : '');
  const [quotationRef, setQuotationRef] = useState(() => draft ? (draft.quotationRef ?? '') : '');
  const [prNo, setPrNo] = useState(() => draft ? (draft.prNo ?? '') : '');
  const [rfqNo, setRfqNo] = useState(() => draft ? (draft.rfqNo ?? '') : '');
  const [sAcc, setSAcc] = useState(() => draft ? (draft.sAcc ?? 'PUR') : 'PUR');
  const [category, setCategory] = useState(() => draft ? (draft.category ?? purchaseCategories[0]) : purchaseCategories[0]);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Partial'>(() => draft ? (draft.paymentStatus ?? 'Pending') : 'Pending');
  const [remarks, setRemarks] = useState(() => draft ? (draft.remarks ?? '') : '');

  // Extended Metadata matching redesign mockup
  const [paymentTerms, setPaymentTerms] = useState(() => draft ? (draft.paymentTerms ?? 'IMMEDIATE') : 'IMMEDIATE');
  const [deliveryDate, setDeliveryDate] = useState(() => draft ? (draft.deliveryDate ?? 'IMMEDIATE') : 'IMMEDIATE');
  const [deliveryTerms, setDeliveryTerms] = useState(() => draft ? (draft.deliveryTerms ?? 'EX-WORKS') : 'EX-WORKS');
  const [currency, setCurrency] = useState(() => draft ? (draft.currency ?? 'AED') : 'AED');
  const [discount, setDiscount] = useState<number>(() => draft ? (draft.discount ?? 0) : 0);
  const [freightShipping, setFreightShipping] = useState<number>(() => draft ? (draft.freightShipping ?? 0) : 0);

  // Context Menu for purchase row right-click
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowIndex: number } | null>(null);

  // Cell selection state for mouse and shift+arrow key navigation
  const [selectedCellRange, setSelectedCellRange] = useState<{
    anchor: { row: number; col: number };
    focus: { row: number; col: number };
  } | null>(null);

  // Undo / Redo history stacks
  const [pastLineItems, setPastLineItems] = useState<PurchaseItem[][]>([]);
  const [futureLineItems, setFutureLineItems] = useState<PurchaseItem[][]>([]);

  // Logistics & Additional Notes states
  const [transporterName, setTransporterName] = useState(() => draft ? (draft.transporterName ?? '') : '');
  const [transporterDate, setTransporterDate] = useState(() => draft ? (draft.transporterDate ?? '') : '');
  const [airwayBillNo, setAirwayBillNo] = useState(() => draft ? (draft.airwayBillNo ?? '') : '');
  const [transporterAmount, setTransporterAmount] = useState<number | ''>(() => draft ? (draft.transporterAmount ?? '') : '');
  const [additionalNotes, setAdditionalNotes] = useState(() => draft ? (draft.additionalNotes ?? '') : '');
  const [dispatchBy, setDispatchBy] = useState(() => draft ? (draft.dispatchBy ?? 'ROAD TRANSPORT') : 'ROAD TRANSPORT');
  const [deliveryMode, setDeliveryMode] = useState(() => draft ? (draft.deliveryMode ?? 'BY TRUCK') : 'BY TRUCK');
  const [countryOfOrigin, setCountryOfOrigin] = useState(() => draft ? (draft.countryOfOrigin ?? 'UAE') : 'UAE');
  const [hsCode, setHsCode] = useState(() => draft ? (draft.hsCode ?? '7318.15.00') : '7318.15.00');
  const [placeOfSupply, setPlaceOfSupply] = useState(() => draft ? (draft.placeOfSupply ?? 'AJMAN, UAE') : 'AJMAN, UAE');

  // Redesign custom configuration states
  const [isPurchaseRequest, setIsPurchaseRequest] = useState(() => draft ? (draft.isPurchaseRequest ?? false) : false);
  const [printSize, setPrintSize] = useState<'A4' | 'Letter'>(() => draft ? (draft.printSize ?? 'A4') : 'A4');
  const [printArea, setPrintArea] = useState<'entire' | 'items'>(() => draft ? (draft.printArea ?? 'entire') : 'entire');
  const [preparedByName, setPreparedByName] = useState(() => draft ? (draft.preparedByName ?? '') : '');
  const [checkedByName, setCheckedByName] = useState(() => draft ? (draft.checkedByName ?? '') : '');
  const [receivedByName, setReceivedByName] = useState(() => draft ? (draft.receivedByName ?? '') : '');
  const [approvedByName, setApprovedByName] = useState(() => draft ? (draft.approvedByName ?? '') : '');
  const [editingId, setEditingId] = useState<string | null>(() => draft ? (draft.editingId ?? null) : null);

  const [registryEntities, setRegistryEntities] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Flat products state & helper
  const [flatProducts, setFlatProducts] = useState<any[]>([]);
  const [activeLookupRow, setActiveLookupRow] = useState<number | null>(null);
  const [diaFilter, setDiaFilter] = useState<string>('');
  const [lenFilter, setLenFilter] = useState<string>('');

  // Purchase Link System Popup State
  const [activePickerLineItemId, setActivePickerLineItemId] = useState<string | null>(null);
  const [fullCategories, setFullCategories] = useState<{ Standard: any[]; Fine: any[] }>({ Standard: [], Fine: [] });
  const [selectedMappingDivision, setSelectedMappingDivision] = useState<'Standard' | 'Fine'>('Standard');
  const [selectedMappingCatId, setSelectedMappingCatId] = useState<string>('');
  const [selectedMappingSubCatId, setSelectedMappingSubCatId] = useState<string>('');
  const [selectedMappingThreadTypeId, setSelectedMappingThreadTypeId] = useState<string>('');
  const [selectedMappingGradeId, setSelectedMappingGradeId] = useState<string>('');
  const [pickerSearchTerm, setPickerSearchTerm] = useState<string>('');
  const [incomingStockVal, setIncomingStockVal] = useState<number>(100);
  const [rowIncomingQtys, setRowIncomingQtys] = useState<Record<string, number>>({});

  // Inline adds for structural elements
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [isAddingSubCat, setIsAddingSubCat] = useState(false);
  const [isAddingThreadType, setIsAddingThreadType] = useState(false);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [newStructureName, setNewStructureName] = useState('');
  
  // New Product fields inside Grade
  const [newProductPartNo, setNewProductPartNo] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductDia, setNewProductDia] = useState('');
  const [newProductLength, setNewProductLength] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('PCS.');
  const [newProductUnitWeight, setNewProductUnitWeight] = useState<number>(0);
  const [newProductRack, setNewProductRack] = useState('');

  // Excel quick entry states in mapping terminal
  const [excelDia, setExcelDia] = useState('M10');
  const [excelLength, setExcelLength] = useState('50');
  const [excelPartNo, setExcelPartNo] = useState('');
  const [excelFinish, setExcelFinish] = useState('ZINC PLATED');
  const [excelRack, setExcelRack] = useState('31A-G-R01');
  const [excelOpening, setExcelOpening] = useState('0');
  const [excelUnitWt, setExcelUnitWt] = useState('0.030');
  const [excelPitch, setExcelPitch] = useState('1.5 MM');
  const [excelBrand, setExcelBrand] = useState('MFI');
  const [excelUnit, setExcelUnit] = useState('PCS.');
  const [excelIncoming, setExcelIncoming] = useState('100');
  const [excelCustomDims, setExcelCustomDims] = useState<Record<string, string>>({});

  // Input refs for Excel keyboard navigation
  const refDia = useRef<HTMLInputElement>(null);
  const refPitch = useRef<HTMLInputElement>(null);
  const refLength = useRef<HTMLInputElement>(null);
  const refFinish = useRef<HTMLInputElement>(null);
  const refBrand = useRef<HTMLInputElement>(null);
  const refUnit = useRef<HTMLInputElement>(null);
  const refOpening = useRef<HTMLInputElement>(null);
  const refRack = useRef<HTMLInputElement>(null);
  const refIncoming = useRef<HTMLInputElement>(null);
  const refUnitWt = useRef<HTMLInputElement>(null);
  const refPartNo = useRef<HTMLInputElement>(null);

  const fieldsOrder = [
    { name: 'partNo', ref: refPartNo },
    { name: 'dia', ref: refDia },
    { name: 'pitch', ref: refPitch },
    { name: 'length', ref: refLength },
    { name: 'finish', ref: refFinish },
    { name: 'brand', ref: refBrand },
    { name: 'unit', ref: refUnit },
    { name: 'incoming', ref: refIncoming },
    { name: 'unitWt', ref: refUnitWt },
    { name: 'rack', ref: refRack }
  ];

  // Helper to handle leading decimal input (e.g., .03 -> 0.03)
  const handleDecimalInputChange = (val: string, setter: (v: string) => void) => {
    let cleaned = val;
    if (cleaned === '.') {
      cleaned = '0.';
    } else if (cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }
    setter(cleaned);
  };

  // Helper to format unit weight on blur (e.g., 0.5 -> 0.50)
  const handleUnitWeightBlur = () => {
    const parsed = parseFloat(excelUnitWt);
    if (!isNaN(parsed)) {
      const str = parsed.toString();
      const parts = str.split('.');
      if (parts.length === 1) {
        setExcelUnitWt(parsed.toFixed(2));
      } else if (parts.length === 2 && parts[1].length === 1) {
        setExcelUnitWt(parsed.toFixed(2));
      } else {
        setExcelUnitWt(excelUnitWt);
      }
    }
  };

  // Keyboard navigation logic
  const handleFieldKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldIndex: number) => {
    const isEnter = e.key === 'Enter';
    const isRight = e.key === 'ArrowRight';
    const isLeft = e.key === 'ArrowLeft';
    const isDown = e.key === 'ArrowDown';
    const isUp = e.key === 'ArrowUp';

    if (isEnter || isRight || isDown) {
      // Save and Link if Enter on unitWt or rack
      if (isEnter && (fieldsOrder[fieldIndex].name === 'unitWt' || fieldsOrder[fieldIndex].name === 'rack')) {
        e.preventDefault();
        handleSaveExcelPurchaseRecord();
        return;
      }

      // Move forward
      e.preventDefault();
      const nextIndex = (fieldIndex + 1) % fieldsOrder.length;
      fieldsOrder[nextIndex].ref.current?.focus();
      fieldsOrder[nextIndex].ref.current?.select();
    } else if (isLeft || isUp) {
      // Move backward
      e.preventDefault();
      const prevIndex = (fieldIndex - 1 + fieldsOrder.length) % fieldsOrder.length;
      fieldsOrder[prevIndex].ref.current?.focus();
      fieldsOrder[prevIndex].ref.current?.select();
    }
  };

  // Auto-focus the first field (Part No) and reset opening stock when technical grade is selected
  useEffect(() => {
    if (selectedMappingGradeId) {
      setExcelOpening('0');
      setTimeout(() => {
        refPartNo.current?.focus();
        refPartNo.current?.select();
      }, 100);
    }
  }, [selectedMappingGradeId]);

  // Automatically query unit weight from Materials Weight Chart registry if Dia, Pitch, and Length match
  useEffect(() => {
    try {
      const chartDataStr = localStorage.getItem('mfi_weight_spec_chart');
      if (chartDataStr) {
        const chart = JSON.parse(chartDataStr);
        
        // Normalization helper
        const normalize = (val: string) => {
          return (val || '').toLowerCase().trim()
            .replace(/\s+/g, '')
            .replace('mm', '')
            .replace('millimeters', '')
            .replace('millimeter', '')
            .replace('inch', '"')
            .replace('inches', '"')
            .trim();
        };

        const normDia = normalize(excelDia);
        const normPitch = normalize(excelPitch);
        const normLen = normalize(excelLength);

        // Try exact match first (dia, pitch, and length)
        let match = chart.find((item: any) => {
          const itemDia = normalize(item.dia);
          const itemPitch = normalize(item.pitch);
          const itemLen = normalize(item.length);
          return itemDia === normDia && itemPitch === normPitch && itemLen === normLen;
        });

        // Fallback: match without pitch
        if (!match) {
          match = chart.find((item: any) => {
            const itemDia = normalize(item.dia);
            const itemLen = normalize(item.length);
            return itemDia === normDia && itemLen === normLen;
          });
        }

        // Fallback for N/A length (Nuts, Washers)
        if (!match && (normLen === 'na' || normLen === 'n/a' || normLen === '' || normLen === '0')) {
          match = chart.find((item: any) => {
            const itemDia = normalize(item.dia);
            const itemLen = normalize(item.length);
            return itemDia === normDia && (itemLen === 'na' || itemLen === 'n/a' || itemLen === '');
          });
        }

        if (match) {
          setExcelUnitWt(match.unitWeight.toString());
        }
      }
    } catch (e) {
      console.error("Error matching purchase spec weight:", e);
    }
  }, [excelDia, excelPitch, excelLength]);

  const loadCategoriesFromStorage = () => {
    try {
      const stdSaved = localStorage.getItem('mf_std_products');
      const fineSaved = localStorage.getItem('mf_fine_products');
      const std = stdSaved ? JSON.parse(stdSaved) : [];
      const fine = fineSaved ? JSON.parse(fineSaved) : [];
      setFullCategories({ Standard: std, Fine: fine });
    } catch (e) {
      console.error("Error loading categories:", e);
    }
  };

  const saveDatabase = (division: 'Standard' | 'Fine', updatedList: any[]) => {
    try {
      const key = division === 'Standard' ? 'mf_std_products' : 'mf_fine_products';
      localStorage.setItem(key, JSON.stringify(updatedList));
      loadCategoriesFromStorage();
      setFlatProducts(getFlatProducts());
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('mfi-inventory-updated'));
    } catch (e) {
      console.error("Error saving database:", e);
    }
  };

  // Dynamic Creators from Link System Popup
  const handleAddCategoryFromPopup = (name: string) => {
    if (!name.trim()) return;
    const currentList = [...(fullCategories[selectedMappingDivision] || [])];
    const newCatId = 'cat_' + Date.now();
    const newCat = {
      id: newCatId,
      name: name.trim().toUpperCase(),
      subcategories: []
    };
    currentList.push(newCat);
    saveDatabase(selectedMappingDivision, currentList);
    setSelectedMappingCatId(newCatId);
    setSelectedMappingSubCatId('');
    setSelectedMappingThreadTypeId('');
    setSelectedMappingGradeId('');
  };

  const handleAddSubcategoryFromPopup = (name: string) => {
    if (!name.trim() || !selectedMappingCatId) return;
    const currentList = [...(fullCategories[selectedMappingDivision] || [])];
    const newSubId = 'sub_' + Date.now();
    const updated = currentList.map(cat => {
      if (String(cat.id) === String(selectedMappingCatId)) {
        return {
          ...cat,
          subcategories: [
            ...(cat.subcategories || []),
            {
              id: newSubId,
              name: name.trim().toUpperCase(),
              threadTypes: []
            }
          ]
        };
      }
      return cat;
    });
    saveDatabase(selectedMappingDivision, updated);
    setSelectedMappingSubCatId(newSubId);
    setSelectedMappingThreadTypeId('');
    setSelectedMappingGradeId('');
  };

  const handleAddThreadTypeFromPopup = (name: string) => {
    if (!name.trim() || !selectedMappingCatId || !selectedMappingSubCatId) return;
    const currentList = [...(fullCategories[selectedMappingDivision] || [])];
    const newTtId = 'tt_' + Date.now();
    const updated = currentList.map(cat => {
      if (String(cat.id) === String(selectedMappingCatId)) {
        return {
          ...cat,
          subcategories: (cat.subcategories || []).map((sub: any) => {
            if (String(sub.id) === String(selectedMappingSubCatId)) {
              return {
                ...sub,
                threadTypes: [
                  ...(sub.threadTypes || []),
                  {
                    id: newTtId,
                    name: name.trim().toUpperCase(),
                    grades: []
                  }
                ]
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });
    saveDatabase(selectedMappingDivision, updated);
    setSelectedMappingThreadTypeId(newTtId);
    setSelectedMappingGradeId('');
  };

  const handleAddGradeFromPopup = (name: string) => {
    if (!name.trim() || !selectedMappingCatId || !selectedMappingSubCatId || !selectedMappingThreadTypeId) return;
    const currentList = [...(fullCategories[selectedMappingDivision] || [])];
    const newGradeId = 'grade_' + Date.now();
    const updated = currentList.map(cat => {
      if (String(cat.id) === String(selectedMappingCatId)) {
        return {
          ...cat,
          subcategories: (cat.subcategories || []).map((sub: any) => {
            if (String(sub.id) === String(selectedMappingSubCatId)) {
              return {
                ...sub,
                threadTypes: (sub.threadTypes || []).map((tt: any) => {
                  if (String(tt.id) === String(selectedMappingThreadTypeId)) {
                    return {
                      ...tt,
                      grades: [
                        ...(tt.grades || []),
                        {
                          id: newGradeId,
                          name: name.trim().toUpperCase(),
                          rows: []
                        }
                      ]
                    };
                  }
                  return tt;
                })
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });
    saveDatabase(selectedMappingDivision, updated);
    setSelectedMappingGradeId(newGradeId);
  };

  const handleAddProductFromPopup = () => {
    if (!selectedMappingCatId || !selectedMappingSubCatId || !selectedMappingThreadTypeId || !selectedMappingGradeId) return;
    if (!newProductPartNo.trim()) {
      alert("Part No is required!");
      return;
    }
    const currentList = [...(fullCategories[selectedMappingDivision] || [])];
    const newProdId = 'prod_' + Date.now();
    
    const catObj = currentList.find(c => String(c.id) === String(selectedMappingCatId));
    const subObj = catObj?.subcategories?.find((s: any) => String(s.id) === String(selectedMappingSubCatId));
    const ttObj = subObj?.threadTypes?.find((t: any) => String(t.id) === String(selectedMappingThreadTypeId));
    const gObj = ttObj?.grades?.find((g: any) => String(g.id) === String(selectedMappingGradeId));

    let desc = newProductDescription.trim().toUpperCase();
    if (!desc) {
      const parts = [
        subObj?.name || '',
        newProductDia ? `${newProductDia}` : '',
        newProductLength ? `X ${newProductLength}` : '',
        ttObj?.name || '',
        gObj?.name || ''
      ].filter(Boolean);
      desc = parts.join(' ').toUpperCase() || 'UNSPECIFIED PRODUCT';
    }

    const newProductRow = {
      id: newProdId,
      partNo: newProductPartNo.trim().toUpperCase(),
      description: desc,
      dia: newProductDia.trim().toUpperCase(),
      length: newProductLength.trim().toUpperCase(),
      unit: newProductUnit,
      unitWeight: Number(newProductUnitWeight) || 0,
      rackLocation: newProductRack.trim().toUpperCase(),
      openingStock: 0,
      inStock: 0,
      outGoingStock: 0,
      balanceStock: 0,
      tallyStock: 0,
      totalWeight: 0
    };

    const updated = currentList.map(cat => {
      if (String(cat.id) === String(selectedMappingCatId)) {
        return {
          ...cat,
          subcategories: (cat.subcategories || []).map((sub: any) => {
            if (String(sub.id) === String(selectedMappingSubCatId)) {
              return {
                ...sub,
                threadTypes: (sub.threadTypes || []).map((tt: any) => {
                  if (String(tt.id) === String(selectedMappingThreadTypeId)) {
                    return {
                      ...tt,
                      grades: (tt.grades || []).map((g: any) => {
                        if (String(g.id) === String(selectedMappingGradeId)) {
                          return {
                            ...g,
                            rows: [...(g.rows || []), newProductRow]
                          };
                        }
                        return g;
                      })
                    };
                  }
                  return tt;
                })
              };
            }
            return sub;
          })
        };
      }
      return cat;
    });

    saveDatabase(selectedMappingDivision, updated);
    
    // Clear product inputs and close form
    setNewProductPartNo('');
    setNewProductDescription('');
    setNewProductDia('');
    setNewProductLength('');
    setNewProductUnit('PCS.');
    setNewProductUnitWeight(0);
    setNewProductRack('');
    setIsAddingProduct(false);
  };

  const handleSaveExcelPurchaseRecord = () => {
    const categoriesOfDivision = fullCategories[selectedMappingDivision] || [];
    const activeCategory = categoriesOfDivision.find(c => String(c.id) === String(selectedMappingCatId));
    const activeSubcategory = activeCategory?.subcategories?.find((s: any) => String(s.id) === String(selectedMappingSubCatId));
    const activeThreadType = activeSubcategory?.threadTypes?.find((t: any) => String(t.id) === String(selectedMappingThreadTypeId));
    const activeGrade = activeThreadType?.grades?.find((g: any) => String(g.id) === String(selectedMappingGradeId));

    if (!activeGrade) {
      alert("Please select Category, Sub Category, Thread Series, and Technical Grade before saving!");
      return;
    }

    const isNutCategory = 
      (activeCategory?.name || '').toUpperCase().includes('NUT') || 
      (activeSubcategory?.name || '').toUpperCase().includes('NUT');

    if (!excelDia.trim()) {
      alert("Please specify a Diameter/Size (e.g., M10).");
      return;
    }
    if (!isNutCategory && !excelLength.trim()) {
      alert("Please specify a Length (e.g., 50).");
      return;
    }

    let formattedLen = '';
    if (excelLength.trim()) {
      formattedLen = excelLength.trim();
      if (/^\d+(\.\d+)?$/.test(formattedLen)) {
        formattedLen = `${formattedLen} MM`;
      }
    }

    const cleanDia = excelDia.trim().toUpperCase();
    const cleanLenDigits = excelLength.trim().replace(/\D/g, '');
    const cleanPartNo = excelPartNo.trim() || (cleanLenDigits ? `MF-FT-${cleanDia}-${cleanLenDigits}` : `MF-FT-${cleanDia}`);
    
    const cleanDesc = formattedLen 
      ? `${activeCategory?.name || 'FASTENER'} ${cleanDia} X ${formattedLen} ${excelFinish.trim().toUpperCase()} ${excelBrand.trim().toUpperCase()}`
      : `${activeCategory?.name || 'FASTENER'} ${cleanDia} ${excelFinish.trim().toUpperCase()} ${excelBrand.trim().toUpperCase()}`;

    const parsedWt = parseFloat(excelUnitWt) || 0.05;
    const parsedOpening = parseInt(excelOpening, 10) || 0;
    const parsedIncoming = parseInt(excelIncoming, 10) || 0;
    const computedTotalQty = parsedOpening + parsedIncoming;

    // Check if product already exists
    let existingRow = activeGrade.rows?.find((r: any) => 
      r.partNo?.toUpperCase() === cleanPartNo.toUpperCase() || 
      (r.dia?.toUpperCase() === cleanDia && (formattedLen ? r.length?.toUpperCase() === formattedLen.toUpperCase() : !r.length))
    );

    let updatedRowsList = [...(activeGrade.rows || [])];
    let finalProduct: any = null;

    if (existingRow) {
      // Product exists - update it
      const newInStock = (existingRow.inStock || 0) + parsedIncoming;
      const newBal = (existingRow.openingStock || 0) + newInStock - (existingRow.outGoingStock || 0);
      
      updatedRowsList = updatedRowsList.map((row: any) => {
        if (row.id === existingRow.id) {
          finalProduct = {
            ...row,
            ...excelCustomDims,
            inStock: newInStock,
            balanceStock: newBal,
            tallyStock: newBal,
            totalWeight: newBal * (row.unitWeight || 0)
          };
          return finalProduct;
        }
        return row;
      });
    } else {
      // Product does not exist - create it
      const newRow: any = {
        id: 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        partNo: cleanPartNo,
        description: cleanDesc,
        dia: cleanDia,
        pitch: excelPitch.trim().toUpperCase(),
        length: formattedLen,
        openingStock: parsedOpening,
        inStock: parsedIncoming,
        outGoingStock: 0,
        balanceStock: computedTotalQty,
        tallyStock: computedTotalQty,
        unitWeight: parsedWt,
        totalWeight: computedTotalQty * parsedWt,
        finish: excelFinish.trim().toUpperCase(),
        rackLocation: excelRack.trim().toUpperCase(),
        marking: excelBrand.trim().toUpperCase(),
        unit: excelUnit.trim().toUpperCase(),
        ...excelCustomDims
      };
      updatedRowsList.push(newRow);
      finalProduct = {
        ...newRow,
        categoryName: activeCategory?.name,
        subcategoryName: activeSubcategory?.name,
        threadTypeName: activeThreadType?.name,
        gradeName: activeGrade?.name,
        section: selectedMappingDivision
      };
    }

    // Save back to the database
    const division = selectedMappingDivision;
    const currentList = [...(fullCategories[division] || [])];
    const updated = currentList.map(cat => {
      if (String(cat.id) !== String(selectedMappingCatId)) return cat;
      return {
        ...cat,
        subcategories: (cat.subcategories || []).map((sub: any) => {
          if (String(sub.id) !== String(selectedMappingSubCatId)) return sub;
          return {
            ...sub,
            threadTypes: (sub.threadTypes || []).map((tt: any) => {
              if (String(tt.id) !== String(selectedMappingThreadTypeId)) return tt;
              return {
                ...tt,
                grades: (tt.grades || []).map((g: any) => {
                  if (String(g.id) !== String(selectedMappingGradeId)) return g;
                  return {
                    ...g,
                    rows: updatedRowsList
                  };
                })
              };
            })
          };
        })
      };
    });

    saveDatabase(division, updated);

    // Link it to the active line item in the Purchase invoice!
    if (activePickerLineItemId) {
      const calculatedBalanceStock = (finalProduct.balanceStock || 0);
      const updatedLineItems = lineItems.map(item => {
        if (item.id === activePickerLineItemId) {
          return {
            ...item,
            productId: finalProduct.id,
            description: finalProduct.description,
            balanceQty: finalProduct.balanceStock - parsedIncoming,
            qty: parsedIncoming,
            unit: finalProduct.unit || 'PCS.',
            per: (finalProduct.unit || 'PCS.').toLowerCase(),
            incomingStock: parsedIncoming,
            balanceStock: calculatedBalanceStock
          };
        }
        return item;
      });
      setLineItems(updatedLineItems);
    }

    // Clear form and close mapping modal
    setExcelPartNo('');
    setExcelCustomDims({});
    setActivePickerLineItemId(null);
    alert(`Successfully saved and linked ${finalProduct.dia} x ${finalProduct.length}!`);
  };

  const handleLinkProductAndAddStock = (product: any, customQty?: number) => {
    if (!activePickerLineItemId) return;
    const qtyToAdd = customQty !== undefined ? customQty : (Number(incomingStockVal) || 0);
    if (qtyToAdd <= 0) {
      alert("Please enter a valid incoming stock quantity!");
      return;
    }

    // 1. Update the line item in our form!
    const targetSize = (product.dia || '').trim().toUpperCase();
    const targetLength = (product.length || '').trim().toUpperCase();
    const targetMarking = (product.marking || product.brand || '').trim().toUpperCase();

    // Check if there is already another item in lineItems with the same size, length, and marking/brand
    const duplicateIndex = lineItems.findIndex(item => 
      item.id !== activePickerLineItemId &&
      (item.dia || '').trim().toUpperCase() === targetSize &&
      (item.length || '').trim().toUpperCase() === targetLength &&
      (item.brand || '').trim().toUpperCase() === targetMarking
    );

    let updatedLineItems = [...lineItems];

    if (duplicateIndex !== -1) {
      // Found duplicate! Merge quantity into existing item
      const existingItem = updatedLineItems[duplicateIndex];
      const newQty = (existingItem.qty || 0) + qtyToAdd;
      const calculatedBalanceStock = (product.balanceStock || 0) + newQty;

      updatedLineItems[duplicateIndex] = {
        ...existingItem,
        productId: product.id,
        qty: newQty,
        incomingStock: newQty,
        balanceStock: calculatedBalanceStock,
        balanceQty: product.balanceStock
      };

      // Remove the activePickerLineItemId row as it has been merged
      updatedLineItems = updatedLineItems.filter(item => item.id !== activePickerLineItemId);

      // Fallback if empty
      if (updatedLineItems.length === 0) {
        updatedLineItems = [
          {
            id: Date.now().toString(),
            description: '',
            qty: 0,
            unit: 'PCS.',
            unitPrice: 0,
            per: 'pcs.',
            vatRate: 5,
            partNo: '',
            dia: '',
            pitch: '',
            length: '',
            finish: '',
            brand: '',
            opening: 0,
            unitWeight: 0,
            rackLocation: ''
          }
        ];
      }
    } else {
      // Standard update of the activePickerLineItemId row
      updatedLineItems = updatedLineItems.map(item => {
        if (item.id === activePickerLineItemId) {
          const calculatedBalanceStock = (product.balanceStock || 0) + qtyToAdd;
          return {
            ...item,
            productId: product.id,
            description: product.description,
            balanceQty: product.balanceStock,
            qty: qtyToAdd,
            unit: product.unit || 'PCS.',
            per: (product.unit || 'PCS.').toLowerCase(),
            incomingStock: qtyToAdd,
            balanceStock: calculatedBalanceStock,
            dia: product.dia || '',
            length: product.length || '',
            brand: product.marking || product.brand || '',
            finish: product.finish || '',
            partNo: product.partNo || '',
            unitWeight: product.unitWeight || 0,
            rackLocation: product.rackLocation || ''
          };
        }
        return item;
      });
    }

    setLineItems(updatedLineItems);

    // 2. Immediately update the product's stock in inventory!
    const division = product.section || selectedMappingDivision;
    const currentList = [...(fullCategories[division] || [])];
    
    let updatedCount = 0;
    const updated = currentList.map(cat => {
      return {
        ...cat,
        subcategories: (cat.subcategories || []).map((sub: any) => {
          return {
            ...sub,
            threadTypes: (sub.threadTypes || []).map((tt: any) => {
              return {
                ...tt,
                grades: (tt.grades || []).map((g: any) => {
                  return {
                    ...g,
                    rows: (g.rows || []).map((row: any) => {
                      if (row.id === product.id) {
                        const newInStock = (row.inStock || 0) + qtyToAdd;
                        const newBal = (row.openingStock || 0) + newInStock - (row.outGoingStock || 0);
                        updatedCount++;
                        return {
                          ...row,
                          inStock: newInStock,
                          balanceStock: newBal,
                          tallyStock: newBal,
                          totalWeight: newBal * (row.unitWeight || 0)
                        };
                      }
                      return row;
                    })
                  };
                })
              };
            })
          };
        })
      };
    });

    if (updatedCount > 0) {
      saveDatabase(division, updated);
    }

    // Close the popup!
    setActivePickerLineItemId(null);
  };

  const getPickerFilteredProducts = () => {
    if (!pickerSearchTerm.trim()) {
      return [];
    }
    let list: any[] = [];
    const categoriesOfDivision = fullCategories[selectedMappingDivision] || [];
    const activeCategory = categoriesOfDivision.find(c => String(c.id) === String(selectedMappingCatId));
    const activeSubcategory = activeCategory?.subcategories?.find((s: any) => String(s.id) === String(selectedMappingSubCatId));
    const activeThreadType = activeSubcategory?.threadTypes?.find((t: any) => String(t.id) === String(selectedMappingThreadTypeId));
    const activeGrade = activeThreadType?.grades?.find((g: any) => String(g.id) === String(selectedMappingGradeId));

    if (activeGrade) {
      // Return flat product representation for rows inside the active grade
      const rows = activeGrade.rows || [];
      rows.forEach((row: any) => {
        list.push({
          ...row,
          categoryName: activeCategory?.name,
          subcategoryName: activeSubcategory?.name,
          threadTypeName: activeThreadType?.name,
          gradeName: activeGrade?.name,
          section: selectedMappingDivision
        });
      });
    } else {
      // Fallback: If no grade is fully selected, we can search from all flatProducts that match the current selected selectors
      list = flatProducts.filter(p => {
        if (p.section !== selectedMappingDivision) return false;
        if (selectedMappingCatId && p.categoryName !== activeCategory?.name) return false;
        if (selectedMappingSubCatId && p.subcategoryName !== activeSubcategory?.name) return false;
        if (selectedMappingThreadTypeId && p.threadTypeName !== activeThreadType?.name) return false;
        return true;
      });
    }

    if (pickerSearchTerm.trim()) {
      const s = pickerSearchTerm.toLowerCase();
      list = list.filter(p => 
        p.description.toLowerCase().includes(s) || 
        p.partNo.toLowerCase().includes(s) ||
        p.dia.toLowerCase().includes(s) ||
        p.length.toLowerCase().includes(s)
      );
    }
    return list;
  };

  const getFlatProducts = () => {
    try {
      const stdSaved = localStorage.getItem('mf_std_products');
      const fineSaved = localStorage.getItem('mf_fine_products');
      
      const std = stdSaved ? JSON.parse(stdSaved) : [];
      const fine = fineSaved ? JSON.parse(fineSaved) : [];
      
      const flat: any[] = [];
      
      const traverse = (cats: any[], section: 'Standard' | 'Fine') => {
        if (!Array.isArray(cats)) return;
        cats.forEach((cat) => {
          if (!cat.subcategories) return;
          cat.subcategories.forEach((sub: any) => {
            if (!sub.threadTypes) return;
            sub.threadTypes.forEach((tt: any) => {
              if (!tt.grades) return;
              tt.grades.forEach((g: any) => {
                if (!g.rows) return;
                g.rows.forEach((row: any) => {
                  flat.push({
                    ...row,
                    id: row.id,
                    partNo: row.partNo || '',
                    description: row.description || '',
                    dia: row.dia || '',
                    length: row.length || '',
                    finish: row.finish || '',
                    marking: row.marking || row.brand || '',
                    balanceStock: row.balanceStock !== undefined ? row.balanceStock : 0,
                    openingStock: row.openingStock !== undefined ? row.openingStock : 0,
                    inStock: row.inStock !== undefined ? row.inStock : 0,
                    outGoingStock: row.outGoingStock !== undefined ? row.outGoingStock : 0,
                    unitWeight: row.unitWeight || 0,
                    unit: row.unit || 'PCS.',
                    categoryName: cat.name,
                    subcategoryName: sub.name,
                    threadTypeName: tt.name,
                    gradeName: g.name,
                    section: section
                  });
                });
              });
            });
          });
        });
      };
      
      traverse(std, 'Standard');
      traverse(fine, 'Fine');
      return flat;
    } catch (e) {
      console.error("Error flattening products:", e);
      return [];
    }
  };

  // Load registry items on mount & sync dynamically
  useEffect(() => {
    const loadEntities = () => {
      const custSaved = localStorage.getItem('MFI_ERP_CUSTOMERS');
      const customers = custSaved ? JSON.parse(custSaved) : INITIAL_CUSTOMERS;

      const suppSaved = localStorage.getItem('MFI_ERP_SUPPLIERS');
      const suppliers = suppSaved ? JSON.parse(suppSaved) : [
        {
          id: 'supp-1',
          companyName: 'DUBAI INDUSTRIAL GALVANIZING WORKS',
          address: 'Al Qusais Industrial Area Office, Dubai, UAE',
          poBox: '44810',
          trn: '100344872100003',
          phone: '+971 4 263 4455',
          contactPerson: '',
          designation: '',
          email: 'faisal@dubaigalvanizing.ae',
          mobile: ''
        },
        {
          id: 'supp-2',
          companyName: 'SHARJAH FASTENERS MANUFACTURING CO',
          address: 'Industrial Area 5, Sharjah, UAE',
          poBox: '29050',
          trn: '100055278100003',
          phone: '+971 6 533 1290',
          contactPerson: '',
          designation: '',
          email: 'john@shjfasteners.co',
          mobile: ''
        },
        {
          id: 'supp-3',
          companyName: 'AJMAN ANODIZING & COATING CENTER',
          address: 'New Industrial Area, Ajman, UAE',
          poBox: '12050',
          trn: '103348129500003',
          phone: '+971 6 743 8812',
          contactPerson: '',
          designation: '',
          email: 'amit@ajmancoating.com',
          mobile: ''
        }
      ];

      setRegistryEntities([...customers, ...suppliers]);
      setFlatProducts(getFlatProducts());
      loadCategoriesFromStorage();
    };

    loadEntities();
    window.addEventListener('storage', loadEntities);
    return () => window.removeEventListener('storage', loadEntities);
  }, []);

  // Line item print exclusions
  const [excludedPrintItemIds, setExcludedPrintItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASE_FORM_DRAFT');
      if (saved) {
        const d = JSON.parse(saved);
        if (d && Array.isArray(d.excludedPrintItemIds)) {
          return d.excludedPrintItemIds;
        }
      }
    } catch (e) {}
    return [];
  });

  // Form Line Items
  const [lineItems, setLineItems] = useState<PurchaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASE_FORM_DRAFT');
      if (saved) {
        const d = JSON.parse(saved);
        if (d && Array.isArray(d.lineItems) && d.lineItems.length > 0) {
          return d.lineItems;
        }
      }
    } catch (e) {}
    return [{ id: '1', description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }];
  });

  useEffect(() => {
    if (!purchaseEnterPromptActive) return;

    // Reset selection to 'add' whenever prompt opens
    setPurchasePromptSelection('add');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPurchasePromptSelection('add');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPurchasePromptSelection('cancel');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (purchasePromptSelection === 'add') {
          const newId = Date.now().toString();
          setLineItems(prev => [
            ...prev,
            { id: newId, description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }
          ]);
          setPurchaseEnterPromptActive(false);
          setTimeout(() => {
            focusCell(lineItems.length, 0);
          }, 100);
        } else {
          setPurchaseEnterPromptActive(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPurchaseEnterPromptActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [purchaseEnterPromptActive, purchasePromptSelection, lineItems]);

  
  // Global shortcuts for Purchase Manager (Ctrl+S, Ctrl+P)
  useEffect(() => {
    const handleGlobalSpKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        setIsCreateNewPurchaseModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        handlePrintCurrentDraft();
      }
    };
    window.addEventListener('keydown', handleGlobalSpKey);
    return () => window.removeEventListener('keydown', handleGlobalSpKey);
  }, [lineItems]);

  // Modal key handler
  useEffect(() => {
    if (!isCreateNewPurchaseModalOpen && !isSavePurchaseModalOpen) return;
    const handleModalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        e.stopPropagation();
        setIsCreateNewPurchaseModalOpen(false);
        setIsSavePurchaseModalOpen(false);
      } else if (e.key === 'Enter' || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        e.stopPropagation();
        if (isCreateNewPurchaseModalOpen) {
          setIsCreateNewPurchaseModalOpen(false);
          setEditingId(null);
          setInvoiceNo('');
          setLineItems([
            { id: Date.now().toString(), description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }
          ]);
          triggerToast('Created New Purchase Record');
          setTimeout(() => {
            const el = document.querySelector('input[placeholder*="SUPPLIER"], input[type="text"]') as HTMLElement | null;
            if (el) el.focus();
          }, 100);
        } else if (isSavePurchaseModalOpen) {
          setIsSavePurchaseModalOpen(false);
          handleSaveExcelPurchaseRecord();
        }
      }
    };
    window.addEventListener('keydown', handleModalKey, true);
    return () => window.removeEventListener('keydown', handleModalKey, true);
  }, [isCreateNewPurchaseModalOpen, isSavePurchaseModalOpen, lineItems]);

    // ESC key handler to deselect selected cells/rows
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCellRange(null);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Save form draft to local storage automatically when any of the form inputs change
  useEffect(() => {
    const currentDraft = {
      selectedSupplierIndex,
      customSupplierName,
      supplierTrn,
      supplierAddress,
      supplierAttentionTo,
      supplierPhone,
      supplierMobile,
      supplierEmail,
      supplierFax,
      supplierPoBox,
      invoiceNo,
      deliveryNoteNo,
      invoiceDate,
      lpoRef,
      quotationRef,
      prNo,
      rfqNo,
      sAcc,
      category,
      paymentStatus,
      remarks,
      paymentTerms,
      deliveryDate,
      deliveryTerms,
      currency,
      discount,
      freightShipping,
      isPurchaseRequest,
      printSize,
      printArea,
      preparedByName,
      receivedByName,
      approvedByName,
      editingId,
      lineItems,
      excludedPrintItemIds
    };
    localStorage.setItem('MFI_SUPPLIER_PURCHASE_FORM_DRAFT', JSON.stringify(currentDraft));
  }, [
    selectedSupplierIndex,
    customSupplierName,
    supplierTrn,
    supplierAddress,
    supplierAttentionTo,
    supplierPhone,
    supplierFax,
    supplierPoBox,
    invoiceNo,
    deliveryNoteNo,
    invoiceDate,
    lpoRef,
    category,
    paymentStatus,
    remarks,
    paymentTerms,
    deliveryDate,
    deliveryTerms,
    currency,
    discount,
    freightShipping,
    isPurchaseRequest,
    printSize,
    printArea,
    preparedByName,
    receivedByName,
    approvedByName,
    editingId,
    lineItems,
    excludedPrintItemIds
  ]);
  const activePickerItem = lineItems.find(it => it.id === activePickerLineItemId);

  // Filters for Records List
  const [filterSupplier, setFilterSupplier] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurRowIndex, setSelectedPurRowIndex] = useState<number>(0);
  const [hiddenPurIds, setHiddenPurIds] = useState<string[]>([]);
  const [purFromDate, setPurFromDate] = useState<string>('');
  const [purToDate, setPurToDate] = useState<string>('');

  // Automatically update TRN and other supplier details when standard supplier changes
  const handleSupplierSelectChange = (idx: number) => {
    setSelectedSupplierIndex(idx);
    if (idx < DEFAULT_SUPPLIERS.length) {
      const sup = DEFAULT_SUPPLIERS[idx];
      setSupplierTrn(sup.trn);
      setSupplierAddress(sup.address);
      setSupplierPhone(sup.phone);
      setSupplierMobile((sup as any).mobile || '');
      setSupplierEmail((sup as any).email || '');
      setSupplierFax(sup.fax);
      setSupplierPoBox(sup.poBox);
      setSupplierAttentionTo(sup.attentionTo);
    } else {
      setSupplierTrn('');
      setSupplierAddress('');
      setSupplierPhone('');
      setSupplierMobile('');
      setSupplierEmail('');
      setSupplierFax('');
      setSupplierPoBox('');
      setSupplierAttentionTo('');
    }
  };

  // Add line item
  const addLineItem = () => {
    pushToHistory(lineItems);
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: '',
        qty: 0,
        unit: '',
        unitPrice: 0,
        per: '',
        vatRate: 5,
        partNo: '',
        dia: '',
        pitch: '',
        length: '',
        finish: '',
        brand: '',
        opening: 0,
        unitWeight: 0,
        rackLocation: ''
      }
    ]);
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      triggerToast("Must enter at least 1 purchase line item.");
      return;
    }
    pushToHistory(lineItems);
    setLineItems(lineItems.filter(item => item.id !== id));
    setExcludedPrintItemIds(excludedPrintItemIds.filter(x => x !== id));
  };

  // Toggle print exclusion
  const toggleItemExclusion = (id: string) => {
    pushToHistory(lineItems);
    if (excludedPrintItemIds.includes(id)) {
      setExcludedPrintItemIds(excludedPrintItemIds.filter(x => x !== id));
    } else {
      setExcludedPrintItemIds([...excludedPrintItemIds, id]);
    }
  };

  // Update line item
  const updateLineItem = (id: string, fieldOrFields: keyof PurchaseItem | Partial<PurchaseItem>, value?: any) => {
    pushToHistory(lineItems);
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        let updated: PurchaseItem;
        if (typeof fieldOrFields === 'string') {
          updated = { ...item, [fieldOrFields]: value };
          if (fieldOrFields === 'description') {
            updated.isManualDescription = !!(value && value.trim());
          }
        } else {
          updated = { ...item, ...fieldOrFields };
          if ('description' in fieldOrFields) {
            updated.isManualDescription = !!(fieldOrFields.description && fieldOrFields.description.trim());
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const focusCell = (row: number, col: number, isShiftSelection?: boolean) => {
    const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`) as HTMLElement;
    if (element) {
      element.focus();
      if (!isShiftSelection && element instanceof HTMLInputElement) {
        element.select();
      }
    }
  };

  const focusHeaderCell = (row: number, col: number) => {
    const element = document.querySelector(`[data-header-row="${row}"][data-header-col="${col}"]`) as HTMLElement
                 || document.querySelector(`[data-header-row="${row}"][data-header-col="1"]`) as HTMLElement;
    if (element) {
      element.focus();
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.select();
      }
    }
  };

  const handleHeaderKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    row: number,
    col: number
  ) => {
    if (row === 5 && col === 2) {
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        focusCell(0, 0);
        return;
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (row > 1) {
        focusHeaderCell(row - 1, col);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (row < 5) {
        focusHeaderCell(row + 1, col);
      } else {
        focusCell(0, col === 1 ? 0 : 3);
      }
    } else if (e.key === 'ArrowLeft') {
      const target = e.target as any;
      let cursorAtStart = true;
      try {
        if (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'date')) {
          cursorAtStart = target.selectionStart === 0;
        } else if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          cursorAtStart = true;
        }
      } catch (err) {
        cursorAtStart = true;
      }

      if (cursorAtStart) {
        e.preventDefault();
        if (col > 1) {
          focusHeaderCell(row, col - 1);
        } else if (row > 1) {
          focusHeaderCell(row - 1, 2);
        }
      }
    } else if (e.key === 'ArrowRight') {
      const target = e.target as any;
      let cursorAtEnd = true;
      try {
        if (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'date')) {
          cursorAtEnd = target.selectionEnd === (target.value || '').length;
        } else if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          cursorAtEnd = true;
        }
      } catch (err) {
        cursorAtEnd = true;
      }

      if (cursorAtEnd) {
        e.preventDefault();
        if (col < 2) {
          focusHeaderCell(row, col + 1);
        } else if (row < 5) {
          focusHeaderCell(row + 1, 1);
        } else {
          focusCell(0, 0);
        }
      }
    } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      if (e.target && (e.target as HTMLElement).tagName.toLowerCase() === 'textarea' && e.shiftKey) {
        return;
      }
      e.preventDefault();
      if (col < 2) {
        focusHeaderCell(row, col + 1);
      } else if (row < 5) {
        focusHeaderCell(row + 1, 1);
      } else {
        focusCell(0, 0);
      }
    }
  };

  const pushToHistory = (currentItems: PurchaseItem[]) => {
    setPastLineItems(prev => {
      const last = prev[prev.length - 1];
      if (last && JSON.stringify(last) === JSON.stringify(currentItems)) {
        return prev;
      }
      return [...prev.slice(-49), JSON.parse(JSON.stringify(currentItems))];
    });
    setFutureLineItems([]);
  };

  const handleUndo = () => {
    if (pastLineItems.length === 0) {
      if (triggerToast) triggerToast('Nothing to undo');
      return;
    }
    const previousState = pastLineItems[pastLineItems.length - 1];
    const newPast = pastLineItems.slice(0, pastLineItems.length - 1);
    setFutureLineItems(f => [JSON.parse(JSON.stringify(lineItems)), ...f]);
    setPastLineItems(newPast);
    setLineItems(previousState);
    if (triggerToast) triggerToast('Undo applied!');
  };

  const handleRedo = () => {
    if (futureLineItems.length === 0) {
      if (triggerToast) triggerToast('Nothing to redo');
      return;
    }
    const nextState = futureLineItems[0];
    const newFuture = futureLineItems.slice(1);
    setPastLineItems(p => [...p, JSON.parse(JSON.stringify(lineItems))]);
    setFutureLineItems(newFuture);
    setLineItems(nextState);
    if (triggerToast) triggerToast('Redo applied!');
  };

  const insertRowAbove = (index: number) => {
    pushToHistory(lineItems);
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      description: '',
      qty: 0,
      unit: '',
      unitPrice: 0,
      per: '',
      vatRate: 5
    };
    setLineItems(prev => {
      const next = [...prev];
      next.splice(index, 0, newItem);
      return next;
    });
    if (triggerToast) triggerToast(`Row inserted above row ${index + 1}`);
  };

  const insertRowBelow = (index: number) => {
    pushToHistory(lineItems);
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      description: '',
      qty: 0,
      unit: '',
      unitPrice: 0,
      per: '',
      vatRate: 5
    };
    setLineItems(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, newItem);
      return next;
    });
    if (triggerToast) triggerToast(`Row inserted below row ${index + 1}`);
  };

  const duplicateRow = (index: number) => {
    pushToHistory(lineItems);
    const target = lineItems[index];
    if (!target) return;
    const newItem: PurchaseItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: Date.now().toString()
    };
    setLineItems(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, newItem);
      return next;
    });
    if (triggerToast) triggerToast(`Row ${index + 1} duplicated`);
  };

  const clearSelectedCells = () => {
    if (!selectedCellRange) return;
    pushToHistory(lineItems);
    const minR = Math.min(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const maxR = Math.max(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const minC = Math.min(selectedCellRange.anchor.col, selectedCellRange.focus.col);
    const maxC = Math.max(selectedCellRange.anchor.col, selectedCellRange.focus.col);

    setLineItems(prev => prev.map((item, rIdx) => {
      if (rIdx < minR || rIdx > maxR) return item;
      const copy = { ...item };
      for (let c = minC; c <= maxC; c++) {
        if (c === 0) copy.description = '';
        if (c === 1) copy.finish = '';
        if (c === 2) copy.unit = '';
        if (c === 3) copy.qty = 0;
        if (c === 4) copy.unitPrice = 0;
        if (c === 5) copy.discount = 0;
      }
      return copy;
    }));
    if (triggerToast) triggerToast('Cleared cell data in selection!');
  };

  const copyTableOrSelection = () => {
    let textToCopy = '';
    if (selectedCellRange) {
      const minR = Math.min(selectedCellRange.anchor.row, selectedCellRange.focus.row);
      const maxR = Math.max(selectedCellRange.anchor.row, selectedCellRange.focus.row);
      const minC = Math.min(selectedCellRange.anchor.col, selectedCellRange.focus.col);
      const maxC = Math.max(selectedCellRange.anchor.col, selectedCellRange.focus.col);

      const rows: string[] = [];
      for (let r = minR; r <= maxR; r++) {
        const rowItem = lineItems[r];
        if (!rowItem) continue;
        const cellVals: string[] = [];
        for (let c = minC; c <= maxC; c++) {
          const qty = Number(rowItem.qty || 0);
          const uPrice = Number(rowItem.unitPrice || 0);
          const ext = qty * uPrice;
          const disc = Number(rowItem.discount || 0);
          const totExcl = ext * (1 - disc / 100);
          const vatR = rowItem.vatRate !== undefined ? Number(rowItem.vatRate) : 5;
          const vatAmt = totExcl * (vatR / 100);
          const totGross = totExcl + vatAmt;

          if (c === 0) cellVals.push(rowItem.description || '');
          if (c === 1) cellVals.push(rowItem.finish || '');
          if (c === 2) cellVals.push(rowItem.unit || 'PCS.');
          if (c === 3) cellVals.push(String(qty));
          if (c === 4) cellVals.push(String(uPrice));
          if (c === 5) cellVals.push(ext.toFixed(2));
          if (c === 6) cellVals.push(String(disc));
          if (c === 7) cellVals.push(totExcl.toFixed(2));
          if (c === 8) cellVals.push(`${vatR}%`);
          if (c === 9) cellVals.push(vatAmt.toFixed(2));
          if (c === 10) cellVals.push(totGross.toFixed(2));
        }
        rows.push(cellVals.join('\t'));
      }
      textToCopy = rows.join('\n');
    } else {
      textToCopy = lineItems.map(it => `${it.description || ''}\t${it.finish || ''}\t${it.unit || 'PCS.'}\t${it.qty || 0}\t${it.unitPrice || 0}\t${it.discount || 0}`).join('\n');
    }
    navigator.clipboard.writeText(textToCopy);
    if (triggerToast) triggerToast('Copied selected cells to clipboard!');
  };

  const isCellSelected = (r: number, c: number) => {
    if (!selectedCellRange) return false;
    const minR = Math.min(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const maxR = Math.max(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const minC = Math.min(selectedCellRange.anchor.col, selectedCellRange.focus.col);
    const maxC = Math.max(selectedCellRange.anchor.col, selectedCellRange.focus.col);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const [isMouseSelectingCell, setIsMouseSelectingCell] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => setIsMouseSelectingCell(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCellRange !== null) {
          setSelectedCellRange(null);
          if (triggerToast) triggerToast('Selection cancelled');
        }
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        const active = document.activeElement;
        const isStandardText = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && !active.hasAttribute('data-row');
        if (!isStandardText) {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        const active = document.activeElement;
        const isStandardText = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && !active.hasAttribute('data-row');
        if (!isStandardText) {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedCellRange, pastLineItems, futureLineItems]);

  const handleCellMouseDown = (e: React.MouseEvent, row: number, col: number) => {
    if (e.button !== 0) return;
    setIsMouseSelectingCell(true);
    if (e.shiftKey && selectedCellRange) {
      setSelectedCellRange({
        anchor: selectedCellRange.anchor,
        focus: { row, col }
      });
    } else {
      setSelectedCellRange({
        anchor: { row, col },
        focus: { row, col }
      });
    }
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isMouseSelectingCell) {
      setSelectedCellRange(prev => {
        const anchor = prev?.anchor || { row, col };
        return { anchor, focus: { row, col } };
      });
    }
  };

  const handleSelectRow = (rowIdx: number, e: React.MouseEvent) => {
    setIsMouseSelectingCell(true);
    if (e.shiftKey && selectedCellRange) {
      setSelectedCellRange({
        anchor: { row: selectedCellRange.anchor.row, col: 0 },
        focus: { row: rowIdx, col: 10 }
      });
    } else {
      setSelectedCellRange({
        anchor: { row: rowIdx, col: 0 },
        focus: { row: rowIdx, col: 10 }
      });
    }
    focusCell(rowIdx, 0);
  };

  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
    rowIdx: number,
    colIdx: number
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedCellRange(null);
      if (triggerToast) triggerToast('Selection cancelled');
      return;
    }

    const rowCount = lineItems.length;
    const colCount = 11; // 0=Desc, 1=Finish, 2=Unit, 3=Qty, 4=UnitPrice, 5=ExtPrice, 6=Discount, 7=TotalExclVat, 8=VatRate, 9=VatAmt, 10=TotalGross

    // Shift + Arrow Key Range Cell Selection
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const anchor = selectedCellRange?.anchor || { row: rowIdx, col: colIdx };
      let newRow = selectedCellRange?.focus.row ?? rowIdx;
      let newCol = selectedCellRange?.focus.col ?? colIdx;

      if (e.key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
      if (e.key === 'ArrowDown') newRow = Math.min(rowCount - 1, newRow + 1);
      if (e.key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
      if (e.key === 'ArrowRight') newCol = Math.min(colCount - 1, newCol + 1);

      setSelectedCellRange({ anchor, focus: { row: newRow, col: newCol } });
      focusCell(newRow, newCol, true);
      return;
    }

    // Check description requirement:
    // "in purchase sheet if there is no data in description then dont move to right column."
    const targetVal = (e.target as HTMLInputElement)?.value || '';
    const currentItem = lineItems[rowIdx];
    const isDescEmpty = colIdx === 0 && (!targetVal.trim() && !(currentItem?.description || '').trim());

    if (isDescEmpty) {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        if (triggerToast) triggerToast('Please enter a description before moving to the next column.');
        return;
      }
    }

    // Ctrl+Z / Ctrl+Y
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      handleUndo();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (rowIdx > 0) {
        const prevItem = lineItems[rowIdx - 1];
        if (prevItem && currentItem) {
          pushToHistory(lineItems);
          if (colIdx === 0) {
            updateLineItem(currentItem.id, {
              description: prevItem.description,
              productId: prevItem.productId,
              isManualDescription: prevItem.isManualDescription,
              balanceQty: prevItem.balanceQty,
              incomingStock: prevItem.incomingStock,
              balanceStock: prevItem.balanceStock
            });
          } else if (colIdx === 1) {
            updateLineItem(currentItem.id, 'finish', prevItem.finish);
          } else if (colIdx === 2) {
            updateLineItem(currentItem.id, {
              unit: prevItem.unit,
              per: prevItem.per
            });
          } else if (colIdx === 3) {
            updateLineItem(currentItem.id, 'qty', prevItem.qty);
          } else if (colIdx === 4) {
            updateLineItem(currentItem.id, 'unitPrice', prevItem.unitPrice);
          } else if (colIdx === 5) {
            updateLineItem(currentItem.id, 'discount', prevItem.discount);
          }
          if (triggerToast) triggerToast('Value copied from cell above');
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextRow = rowIdx - 1;
      if (nextRow >= 0) {
        setSelectedCellRange({ anchor: { row: nextRow, col: colIdx }, focus: { row: nextRow, col: colIdx } });
        focusCell(nextRow, colIdx);
      } else {
        focusHeaderCell(4, 2);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = rowIdx + 1;
      if (nextRow < rowCount) {
        setSelectedCellRange({ anchor: { row: nextRow, col: colIdx }, focus: { row: nextRow, col: colIdx } });
        focusCell(nextRow, colIdx);
      }
    } else if (e.key === 'ArrowLeft') {
      const target = e.target as any;
      let cursorAtStart = true;
      try {
        if (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search')) {
          cursorAtStart = target.selectionStart === 0;
        }
      } catch (err) {
        cursorAtStart = true;
      }

      if (cursorAtStart) {
        const nextCol = colIdx - 1;
        if (nextCol >= 0) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx, col: nextCol }, focus: { row: rowIdx, col: nextCol } });
          focusCell(rowIdx, nextCol);
        } else if (rowIdx > 0) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx - 1, col: colCount - 1 }, focus: { row: rowIdx - 1, col: colCount - 1 } });
          focusCell(rowIdx - 1, colCount - 1);
        } else {
          e.preventDefault();
          focusHeaderCell(4, 2);
        }
      }
    } else if (e.key === 'ArrowRight') {
      const target = e.target as any;
      let cursorAtEnd = true;
      try {
        if (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search')) {
          cursorAtEnd = target.selectionEnd === (target.value || '').length;
        }
      } catch (err) {
        cursorAtEnd = true;
      }

      if (cursorAtEnd) {
        const nextCol = colIdx + 1;
        if (nextCol < colCount) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx, col: nextCol }, focus: { row: rowIdx, col: nextCol } });
          focusCell(rowIdx, nextCol);
        } else if (rowIdx < rowCount - 1) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx + 1, col: 0 }, focus: { row: rowIdx + 1, col: 0 } });
          focusCell(rowIdx + 1, 0);
        }
      }
    } else if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab: Move left
        const nextCol = colIdx - 1;
        if (nextCol >= 0) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx, col: nextCol }, focus: { row: rowIdx, col: nextCol } });
          focusCell(rowIdx, nextCol);
        } else if (rowIdx > 0) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx - 1, col: colCount - 1 }, focus: { row: rowIdx - 1, col: colCount - 1 } });
          focusCell(rowIdx - 1, colCount - 1);
        } else {
          e.preventDefault();
          focusHeaderCell(4, 2);
        }
      } else {
        // Tab: Move right
        const nextCol = colIdx + 1;
        if (nextCol < colCount) {
          e.preventDefault();
          setSelectedCellRange({ anchor: { row: rowIdx, col: nextCol }, focus: { row: rowIdx, col: nextCol } });
          focusCell(rowIdx, nextCol);
        } else {
          // Last column of row (col 5 - Discount)
          if (rowIdx === rowCount - 1) {
            e.preventDefault();
            pushToHistory(lineItems);
            const newId = Date.now().toString();
            setLineItems(prev => [
              ...prev,
              { id: newId, description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }
            ]);
            setTimeout(() => {
              setSelectedCellRange({ anchor: { row: rowIdx + 1, col: 0 }, focus: { row: rowIdx + 1, col: 0 } });
              focusCell(rowIdx + 1, 0);
            }, 50);
          } else {
            e.preventDefault();
            setSelectedCellRange({ anchor: { row: rowIdx + 1, col: 0 }, focus: { row: rowIdx + 1, col: 0 } });
            focusCell(rowIdx + 1, 0);
          }
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (colIdx < colCount - 1) {
        setSelectedCellRange({ anchor: { row: rowIdx, col: colIdx + 1 }, focus: { row: rowIdx, col: colIdx + 1 } });
        focusCell(rowIdx, colIdx + 1);
      } else {
        if (rowIdx < rowCount - 1) {
          setSelectedCellRange({ anchor: { row: rowIdx + 1, col: 0 }, focus: { row: rowIdx + 1, col: 0 } });
          focusCell(rowIdx + 1, 0);
        } else {
          pushToHistory(lineItems);
          const newId = Date.now().toString();
          setLineItems(prev => [
            ...prev,
            { id: newId, description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }
          ]);
          setTimeout(() => {
            setSelectedCellRange({ anchor: { row: rowIdx + 1, col: 0 }, focus: { row: rowIdx + 1, col: 0 } });
            focusCell(rowIdx + 1, 0);
          }, 50);
        }
      }
    }
  };



  const handleTablePaste = (e: React.ClipboardEvent<any>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && (pastedText.includes('\t') || pastedText.includes('\n'))) {
      e.preventDefault();
      const rows = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (rows.length === 0) return;

      const target = e.target as HTMLElement;
      const startRowIdx = parseInt(target.getAttribute('data-row') || '0', 10);
      const startColIdx = parseInt(target.getAttribute('data-col') || '0', 10);

      const updatedLineItems = [...lineItems];

      rows.forEach((rowStr, rowOffset) => {
        const cells = rowStr.split('\t');
        const targetRowIdx = startRowIdx + rowOffset;

        while (updatedLineItems.length <= targetRowIdx) {
          updatedLineItems.push({
            id: (Date.now() + targetRowIdx).toString(),
            description: '',
            qty: 0,
            unit: '',
            unitPrice: 0,
            per: '',
            vatRate: 5
          });
        }

        const item = updatedLineItems[targetRowIdx];

        cells.forEach((cellVal, colOffset) => {
          const targetColIdx = startColIdx + colOffset;
          const valStr = cellVal.trim();
          if (!valStr) return;

          if (targetColIdx === 0) {
            item.description = valStr.toUpperCase();
          } else if (targetColIdx === 1) {
            item.qty = parseFloat(valStr.replace(/,/g, '')) || 0;
          } else if (targetColIdx === 2) {
            let u = valStr.toUpperCase();
            if (!u.endsWith('.')) {
              if (['PCS', 'KG', 'TON', 'BOX', 'MTR', 'PACK', 'BAGS', 'LS'].includes(u)) {
                u = u + '.';
              }
            }
            item.unit = u;
            item.per = u.toLowerCase();
          } else if (targetColIdx === 3) {
            item.unitPrice = parseFloat(valStr.replace(/,/g, '')) || 0;
          } else if (targetColIdx === 4) {
            item.per = valStr.toLowerCase();
          } else if (targetColIdx === 5) {
            item.vatRate = parseInt(valStr.replace(/%/g, ''), 10) || 5;
          }
        });
      });

      setLineItems(updatedLineItems);
      triggerToast(`Successfully pasted and updated ${rows.length} rows from Excel!`);
    }
  };

  // Calculations
  const calculatedSubtotal = lineItems.reduce((acc, item) => {
    if (excludedPrintItemIds.includes(item.id)) return acc;
    return acc + (item.qty * item.unitPrice);
  }, 0);

  const discountAmount = calculatedSubtotal * (discount / 100);
  const netTaxableValue = calculatedSubtotal - discountAmount;
  
  // Calculate aggregate VAT from non-excluded items
  const calculatedVat = lineItems.reduce((acc, item) => {
    if (excludedPrintItemIds.includes(item.id)) return acc;
    const rate = item.vatRate !== undefined ? item.vatRate : 5;
    // apply proportional discount to this line if aggregate discount is active
    const itemAmount = item.qty * item.unitPrice;
    const itemDiscount = itemAmount * (discount / 100);
    const itemTaxable = itemAmount - itemDiscount;
    return acc + (itemTaxable * (rate / 100));
  }, 0);

  const calculatedTotal = netTaxableValue + calculatedVat + Number(freightShipping || 0);

  // Convert number to words utility specifically for AED (or generic)
  const numberToAEDWords = (num: number): string => {
    const fixed = num.toFixed(2);
    const parts = fixed.split('.');
    const dirhams = parseInt(parts[0], 10);
    const fils = parseInt(parts[1], 10);

    const units = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", 
                   "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
    const scales = ["", "THOUSAND", "MILLION", "BILLION"];

    function convertLessThanThousand(n: number): string {
      if (n === 0) return "";
      let res = "";
      if (n >= 100) {
        res += units[Math.floor(n / 100)] + " HUNDRED ";
        n %= 100;
      }
      if (n >= 20) {
        res += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        res += units[n] + " ";
      }
      return res.trim();
    }

    function convertNumber(n: number): string {
      if (n === 0) return "ZERO";
      let chunkCount = 0;
      let res = "";
      let temp = n;
      while (temp > 0) {
        const chunk = temp % 1000;
        if (chunk !== 0) {
          const chunkStr = convertLessThanThousand(chunk);
          res = chunkStr + " " + scales[chunkCount] + " " + res;
        }
        temp = Math.floor(temp / 1000);
        chunkCount++;
      }
      return res.trim();
    }

    const currencyName = currency === 'USD' ? 'USD' : (currency === 'AED' ? 'AED' : (currency || 'AED'));
    const fractionName = currency === 'USD' ? 'CENTS' : (currency === 'AED' ? 'FILS' : 'CENTS');

    const dirhamWords = dirhams > 0 ? convertNumber(dirhams) + " " + currencyName : "";
    const filsWords = fils > 0 ? convertNumber(fils) + " " + fractionName : "";

    if (dirhamWords && filsWords) {
      return `${dirhamWords} AND ${filsWords} ONLY`.replace(/\s+/g, ' ');
    } else if (dirhamWords) {
      return `${dirhamWords} ONLY`.replace(/\s+/g, ' ');
    } else if (filsWords) {
      return `${filsWords} ONLY`.replace(/\s+/g, ' ');
    }
    return `ZERO ${currency} ONLY`;
  };

  // Clear Form
  const resetForm = () => {
    setInvoiceNo('');
    setDeliveryNoteNo('');
    setLpoRef('');
    setQuotationRef('');
    setPrNo('');
    setRfqNo('');
    setSAcc('PUR');
    setRemarks('');
    setLineItems([{ id: '1', description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }]);
    setExcludedPrintItemIds([]);
    setDiscount(0);
    setFreightShipping(0);
    setPaymentTerms('IMMEDIATE');
    setDeliveryDate('IMMEDIATE');
    setDeliveryTerms('EX-WORKS');
    setCurrency('AED');
    setPaymentStatus('Pending');
    setSupplierAddress('');
    setSupplierAttentionTo('');
    setSupplierPhone('');
    setSupplierFax('');
    setSupplierPoBox('');
    setSupplierTrn('');
    setCustomSupplierName('');
    setSelectedSupplierIndex(-1);
    setPreparedByName('');
    setReceivedByName('');
    setApprovedByName('');
    setDispatchBy('ROAD TRANSPORT');
    setDeliveryMode('BY TRUCK');
    setCountryOfOrigin('UAE');
    setHsCode('7318.15.00');
    setPlaceOfSupply('AJMAN, UAE');
    setTransporterName('');
    setTransporterDate('');
    setAirwayBillNo('');
    setTransporterAmount('');
    setAdditionalNotes('');
    setEditingId(null);
    localStorage.removeItem('MFI_SUPPLIER_PURCHASE_FORM_DRAFT');
  };

  const updateInventoryStocks = (newItems: PurchaseItem[], oldItems: PurchaseItem[] = []) => {
    try {
      const stdSaved = localStorage.getItem('mf_std_products');
      const fineSaved = localStorage.getItem('mf_fine_products');
      
      const std = stdSaved ? JSON.parse(stdSaved) : [];
      const fine = fineSaved ? JSON.parse(fineSaved) : [];
      
      let updatedCount = 0;
      
      const updateList = (list: any[]) => {
        let modified = false;
        
        const updateRow = (row: any) => {
          let rowModified = false;
          
          // 1. Subtract old items stock
          const matchedOld = oldItems.find(it => it.productId === row.id);
          if (matchedOld) {
            row.inStock = Math.max(0, (row.inStock || 0) - matchedOld.qty);
            rowModified = true;
          }
          
          // 2. Add new items stock
          const matchedNew = newItems.find(it => it.productId === row.id);
          if (matchedNew) {
            row.inStock = (row.inStock || 0) + matchedNew.qty;
            rowModified = true;
          }
          
          if (rowModified) {
            // Recalculate balanceStock, tallyStock, and totalWeight
            row.balanceStock = (row.openingStock || 0) + row.inStock - (row.outGoingStock || 0);
            row.tallyStock = row.balanceStock;
            row.totalWeight = row.balanceStock * (row.unitWeight || 0);
            modified = true;
            updatedCount++;
          }
        };
        
        list.forEach((cat) => {
          if (cat.subcategories) {
            cat.subcategories.forEach((sub: any) => {
              if (sub.threadTypes) {
                sub.threadTypes.forEach((tt: any) => {
                  if (tt.grades) {
                    tt.grades.forEach((g: any) => {
                      if (g.rows) {
                        g.rows.forEach(updateRow);
                      }
                    });
                  }
                });
              }
            });
          }
        });
        
        return modified;
      };
      
      const stdModified = updateList(std);
      const fineModified = updateList(fine);
      
      if (stdModified) {
        localStorage.setItem('mf_std_products', JSON.stringify(std));
      }
      if (fineModified) {
        localStorage.setItem('mf_fine_products', JSON.stringify(fine));
      }
      
      if (stdModified || fineModified) {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('mfi-inventory-updated'));
        console.log(`Updated inventory stocks. Modified products count: ${updatedCount}`);
      }
    } catch (e) {
      console.error("Error updating inventory stocks:", e);
    }
  };

  // Save Purchase to Ledger and push into Supplier's SOA Ledger
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const finalSupplierName = customSupplierName;

    if (!finalSupplierName.trim()) {
      triggerToast("Supplier name is required.");
      return;
    }
    if (!invoiceNo.trim()) {
      triggerToast("Invoice number is required.");
      return;
    }
    
    // Validate TRN (UAE TRN has 15 digits)
    if (supplierTrn.trim() && !/^\d{15}$/.test(supplierTrn.trim())) {
      triggerToast("Warning: UAE TRN must be exactly 15 digits as per FTA regulations.");
    }

    const validItems = lineItems.filter(item => item.description.trim() || item.qty > 0 || item.unitPrice > 0);
    if (validItems.length === 0) {
      triggerToast("Please add at least one line item.");
      return;
    }

    const newPurchase: PurchaseInvoice = {
      id: editingId || 'pur-' + Date.now(),
      companyId: activeCompany.id,
      supplierName: finalSupplierName.toUpperCase(),
      supplierTrn: supplierTrn.trim(),
      invoiceNo: invoiceNo.toUpperCase(),
      invoiceDate,
      lpoRef: lpoRef.toUpperCase(),
      category,
      items: validItems,
      subtotal: calculatedSubtotal,
      vatAmount: calculatedVat,
      totalAmount: calculatedTotal,
      amountPaid: paymentStatus === 'Paid' ? calculatedTotal : (paymentStatus === 'Partial' ? calculatedTotal / 2 : 0),
      paymentStatus,
      remarks,
      paymentTerms,
      deliveryDate,
      deliveryTerms,
      currency,
      supplierAddress,
      supplierAttentionTo,
      supplierPhone,
      ...(supplierMobile ? { supplierMobile } : {}),
      supplierFax,
      supplierPoBox,
      discount,
      freightShipping,
      preparedByName,
      approvedByName,
      isPurchaseRequest,
      deliveryNoteNo,
      dispatchBy,
      deliveryMode,
      countryOfOrigin,
      hsCode,
      placeOfSupply,
      transporterName,
      transporterDate,
      airwayBillNo,
      transporterAmount: typeof transporterAmount === 'number' ? transporterAmount : undefined,
      additionalNotes
    };

    // Save purchase record
    const oldPurchase = editingId ? purchases.find(p => p.id === editingId) : null;
    const oldItems = oldPurchase ? oldPurchase.items : [];

    if (editingId) {
      setPurchases(purchases.map(p => p.id === editingId ? newPurchase : p));
    } else {
      setPurchases([newPurchase, ...purchases]);
    }

    updateInventoryStocks(validItems, oldItems);

    // Automatically record this purchase in Statement of Accounts for this Supplier!
    // We map suppliers to Statement of Accounts as well, sharing the ledger layout for complete compliance.
    try {
      const savedSoaTxsJson = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
      let soaTransactions: Record<string, any[]> = {};
      if (savedSoaTxsJson) {
        try {
          soaTransactions = JSON.parse(savedSoaTxsJson);
        } catch (err) {
          soaTransactions = {};
        }
      }

      // Generate a supplier-specific ID to keep it inside the SOA register under a distinct prefix
      const supplierSoaKey = 'supp-' + finalSupplierName.replace(/\s+/g, '-').toLowerCase();
      
      // Clean up any existing transactions for this purchase ID across all supplier keys to prevent duplicates
      Object.keys(soaTransactions).forEach(key => {
        if (key.startsWith('supp-')) {
          soaTransactions[key] = soaTransactions[key].filter((tx: any) => 
            tx.purchaseId !== newPurchase.id && tx.id !== 'supp-tx-' + newPurchase.id
          );
        }
      });

      // Also clean up by invoice reference of the edited item specifically if editing
      if (editingId) {
        const oldPurchase = purchases.find(p => p.id === editingId);
        if (oldPurchase) {
          const oldSupplierSoaKey = 'supp-' + oldPurchase.supplierName.replace(/\s+/g, '-').toLowerCase();
          if (soaTransactions[oldSupplierSoaKey]) {
            soaTransactions[oldSupplierSoaKey] = soaTransactions[oldSupplierSoaKey].filter((tx: any) => 
              tx.purchaseId !== editingId && tx.invoiceRef !== oldPurchase.invoiceNo
            );
          }
        }
      }

      const existingTxs = soaTransactions[supplierSoaKey] || [];
      
      const newSupplierTx = {
        id: 'supp-tx-' + Date.now(),
        purchaseId: newPurchase.id, // Store purchaseId for easy tracking!
        date: invoiceDate,
        paymentTerms: 'Credit Basis',
        overdueDays: 0,
        lpoRef: lpoRef || '—',
        invoiceRef: invoiceNo || '—',
        woRef: '—',
        deliveryDates: deliveryNoteNo || '—',
        amount: calculatedTotal, // Purchases are liabilities/debits
        datePaid: paymentStatus === 'Paid' ? invoiceDate : '—',
        receiptNo: '—',
        paymentMode: '—',
        amountPaid: paymentStatus === 'Paid' ? calculatedTotal : (paymentStatus === 'Partial' ? (calculatedTotal / 2) : 0)
      };

      soaTransactions[supplierSoaKey] = [...existingTxs, newSupplierTx];
      localStorage.setItem('MFI_SOA_CUSTOMER_TRANSACTIONS', JSON.stringify(soaTransactions));
      
      // Also write back default supplier to the client registry if it's custom so they show up in SOA select dropdowns!
      const savedCustomersJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
      let registeredList: any[] = [];
      if (savedCustomersJson) {
        registeredList = JSON.parse(savedCustomersJson);
      }
      
      // Check if supplier already in ledger
      const matchIdx = registeredList.findIndex((c: any) => 
        c.companyName.toUpperCase() === finalSupplierName.toUpperCase() ||
        c.companyName.toUpperCase() === `SUPPLIER: ${finalSupplierName.toUpperCase()}` ||
        c.id === supplierSoaKey
      );
      if (matchIdx >= 0) {
        if (supplierAddress && (!registeredList[matchIdx].address || registeredList[matchIdx].address === "Sharjah, United Arab Emirates" || registeredList[matchIdx].address === "Dubai, United Arab Emirates")) {
          registeredList[matchIdx].address = supplierAddress;
          localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(registeredList));
        }
      } else {
        registeredList.push({
          id: supplierSoaKey,
          companyName: `SUPPLIER: ${finalSupplierName.toUpperCase()}`,
          address: supplierAddress || "Sharjah, United Arab Emirates",
          poBox: "—",
          trn: supplierTrn || "—",
          phone: "—",
          contactPerson: "Finance Desk",
          designation: "Supplier Account Manager",
          email: "finance@" + finalSupplierName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
          mobile: "—"
        });
        localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(registeredList));
      }

      // Also write back to the official ERP Suppliers Registry
      const savedErpSuppliers = localStorage.getItem('MFI_ERP_SUPPLIERS');
      let erpSuppliers: any[] = [];
      if (savedErpSuppliers) {
        try {
          erpSuppliers = JSON.parse(savedErpSuppliers);
        } catch (e) {}
      }

      const cleanSupplierNameUpper = finalSupplierName.trim().toUpperCase();
      const existsInErp = erpSuppliers.some(s => {
        const sName = (s.companyName || s.name || '').trim().toUpperCase();
        return sName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === cleanSupplierNameUpper;
      });

      if (!existsInErp) {
        erpSuppliers.push({
          id: supplierSoaKey,
          companyName: `SUPPLIER: ${cleanSupplierNameUpper}`,
          address: supplierAddress || "Sharjah, United Arab Emirates",
          poBox: "—",
          trn: supplierTrn || "—",
          phone: "—",
          faxNo: "—",
          contactPerson: "Finance Desk",
          designation: "Supplier Account Manager",
          email: "finance@" + finalSupplierName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
          mobile: "—"
        });
        localStorage.setItem('MFI_ERP_SUPPLIERS', JSON.stringify(erpSuppliers));
      } else {
        // Update address if default/empty
        const match = erpSuppliers.find(s => (s.companyName || s.name || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === cleanSupplierNameUpper);
        if (match && supplierAddress && (!match.address || match.address === "Sharjah, United Arab Emirates" || match.address === "Dubai, United Arab Emirates")) {
          match.address = supplierAddress;
          localStorage.setItem('MFI_ERP_SUPPLIERS', JSON.stringify(erpSuppliers));
        }
      }

      // Sync across all Supplier & ERP registries
      syncSupplierToAllDatabases({
        supplierName: finalSupplierName,
        trn: supplierTrn,
        address: supplierAddress,
        companyId: activeCompany.id
      });

      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Failed to post purchase entry to statement of accounts:", e);
    }

    triggerToast(`Supplier Purchase Invoice ${invoiceNo} recorded successfully!`);
    resetForm();
    setActiveTab('records');
  };

  // Delete Purchase
  const handleDeletePurchase = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase invoice record?")) {
      const purchaseToDelete = purchases.find(p => p.id === id);
      setPurchases(purchases.filter(p => p.id !== id));
      
      if (purchaseToDelete && purchaseToDelete.items) {
        updateInventoryStocks([], purchaseToDelete.items);
      }
      
      try {
        const savedSoaTxsJson = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
        if (savedSoaTxsJson) {
          let soaTransactions = JSON.parse(savedSoaTxsJson);
          Object.keys(soaTransactions).forEach(key => {
            if (key.startsWith('supp-')) {
              soaTransactions[key] = soaTransactions[key].filter((tx: any) => 
                tx.purchaseId !== id && (!purchaseToDelete || tx.invoiceRef !== purchaseToDelete.invoiceNo)
              );
            }
          });
          localStorage.setItem('MFI_SOA_CUSTOMER_TRANSACTIONS', JSON.stringify(soaTransactions));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error("Failed to delete purchase from statement of accounts:", err);
      }

      triggerToast("Purchase record deleted.");
    }
  };

  // Filtering Purchases with Company Segregation
  const filteredPurchases = purchases.filter(p => {
    if (hiddenPurIds.includes(p.id)) return false;
    if (purFromDate && p.invoiceDate < purFromDate) return false;
    if (purToDate && p.invoiceDate > purToDate) return false;

    const matchesCompany = (p.companyId === activeCompany.id) ||
      (!p.companyId && (activeCompany.code === 'MFI' || p.invoiceNo.startsWith(activeCompany.code || 'MFI')));
    if (!matchesCompany) return false;

    const matchesSupplier = filterSupplier === 'ALL' || p.supplierName === filterSupplier;
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    const matchesPayment = filterPayment === 'ALL' || p.paymentStatus === filterPayment;
    
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || 
      p.supplierName.toLowerCase().includes(term) ||
      p.invoiceNo.toLowerCase().includes(term) ||
      p.remarks.toLowerCase().includes(term) ||
      p.items.some(item => item.description.toLowerCase().includes(term));

    return matchesSupplier && matchesCategory && matchesPayment && matchesSearch;
  });

  // Calculate totals of filtered purchases
  const totalFilteredSubtotal = filteredPurchases.reduce((acc, p) => acc + p.subtotal, 0);
  const totalFilteredVat = filteredPurchases.reduce((acc, p) => acc + p.vatAmount, 0);
  const totalFilteredAmount = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

  // Redesign custom helpers
  const handlePrintCurrentDraft = () => {
    const finalSupplierName = customSupplierName;

    const draftPurchase: PurchaseInvoice = {
      id: editingId || 'draft',
      supplierName: finalSupplierName || '[SUPPLIER COMPANY]',
      supplierTrn: supplierTrn,
      invoiceNo: invoiceNo || 'DRAFT-PO',
      invoiceDate: invoiceDate,
      lpoRef: lpoRef,
      category: category,
      items: lineItems,
      subtotal: calculatedSubtotal,
      vatAmount: calculatedVat,
      totalAmount: calculatedTotal,
      paymentStatus: paymentStatus,
      remarks: remarks,
      paymentTerms: paymentTerms,
      deliveryDate: deliveryDate,
      deliveryTerms: deliveryTerms,
      currency: currency,
      supplierAddress: supplierAddress,
      supplierAttentionTo: supplierAttentionTo,
      supplierPhone: supplierPhone,
      supplierFax: supplierFax,
      supplierPoBox: supplierPoBox,
      discount: discount,
      freightShipping: freightShipping,
      preparedByName: preparedByName,
      approvedByName: approvedByName,
      isPurchaseRequest: isPurchaseRequest,
      deliveryNoteNo: deliveryNoteNo
    };

    handlePrintPurchase(draftPurchase);
  };

  const handleExportExcel = () => {
    const finalSupplierName = customSupplierName;

    const sheetName = isPurchaseRequest ? "Purchase_Request" : "Purchase_Order";
    const refNo = invoiceNo || "DRAFT";

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; }
          td, th { border: 1px solid #cbd5e1; padding: 6px; font-family: sans-serif; font-size: 10pt; text-transform: uppercase; }
          th { background-color: #1e3b8b; color: white; font-weight: bold; }
          .header { font-size: 14pt; font-weight: bold; text-align: center; color: #b91c1c; }
          .section { background-color: #f1f5f9; font-weight: bold; }
          .money { text-align: right; mso-number-format: "\\#\\,\\#\\#0\\.00"; }
          .qty { text-align: center; mso-number-format: "\\#\\,\\#\\#0"; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="6" class="header">${sheetName.replace('_', ' ').toUpperCase()}</td></tr>
          <tr><td colspan="6"><b>BUYING ORGANIZATION:</b> ${activeCompany.name.toUpperCase()}</td></tr>
          <tr><td colspan="6"><b>TRN:</b> ${activeCompany.trn || '100440509600003'}</td></tr>
          <tr><td colspan="6"></td></tr>
          <tr>
            <td><b>REF NO:</b></td><td>${refNo}</td>
            <td><b>DATE:</b></td><td>${invoiceDate}</td>
            <td><b>CURRENCY:</b></td><td>${currency}</td>
          </tr>
          <tr>
            <td><b>SUPPLIER:</b></td><td>${finalSupplierName.toUpperCase()}</td>
            <td><b>TRN:</b></td><td>${supplierTrn}</td>
            <td><b>PAYMENT TERMS:</b></td><td>${paymentTerms}</td>
          </tr>
          <tr>
            <td><b>DELIVERY TERMS:</b></td><td>${deliveryTerms}</td>
            <td><b>DELIVERY DATE:</b></td><td>${deliveryDate || 'IMMEDIATE'}</td>
            <td><b>DELIVERY NOTE:</b></td><td>${deliveryNoteNo || '—'}</td>
          </tr>
          <tr><td colspan="6"></td></tr>
          <tr>
            <th>S.No.</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Total (${currency})</th>
          </tr>
    `;

    lineItems.forEach((item, idx) => {
      const isExcluded = excludedPrintItemIds.includes(item.id);
      if (!isExcluded) {
        html += `
          <tr>
            <td align="center">${idx + 1}</td>
            <td>${item.description.toUpperCase()}</td>
            <td class="qty">${item.qty}</td>
            <td align="center">${item.unit}</td>
            <td class="money">${item.unitPrice}</td>
            <td class="money">${(item.qty * item.unitPrice).toFixed(2)}</td>
          </tr>
        `;
      }
    });

    html += `
          <tr><td colspan="6"></td></tr>
          <tr>
            <td colspan="4" align="right"><b>TOTAL AMOUNT (EXCL. VAT)</b></td>
            <td colspan="2" class="money"><b>${calculatedSubtotal.toFixed(2)}</b></td>
          </tr>
          <tr>
            <td colspan="4" align="right"><b>DISCOUNT (${discount}%)</b></td>
            <td colspan="2" class="money"><b>(${discountAmount.toFixed(2)})</b></td>
          </tr>
          <tr>
            <td colspan="4" align="right"><b>NET TAXABLE VALUE</b></td>
            <td colspan="2" class="money"><b>${netTaxableValue.toFixed(2)}</b></td>
          </tr>
          <tr>
            <td colspan="4" align="right"><b>VAT AMOUNT (5%)</b></td>
            <td colspan="2" class="money"><b>${calculatedVat.toFixed(2)}</b></td>
          </tr>
          <tr>
            <td colspan="4" align="right"><b>FREIGHT & SHIPPING</b></td>
            <td colspan="2" class="money"><b>${freightShipping.toFixed(2)}</b></td>
          </tr>
          <tr style="background-color: #fee2e2;">
            <td colspan="4" align="right"><b>NET PAYABLE AMOUNT</b></td>
            <td colspan="2" class="money" style="color: #b91c1c; font-weight: bold;"><b>${calculatedTotal.toFixed(2)}</b></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetName}_${refNo}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Excel file generated and exported successfully.");
  };

  const handleEditPurchase = (pur: PurchaseInvoice) => {
    setEditingId(pur.id);
    
    // Set form fields based on selected purchase
    setCustomSupplierName(pur.supplierName);
    setSelectedSupplierIndex(-1);
    
    setSupplierTrn(pur.supplierTrn || '');
    setInvoiceNo(pur.invoiceNo || '');
    setInvoiceDate(pur.invoiceDate || '');
    setLpoRef(pur.lpoRef || '');
    setCategory(pur.category || purchaseCategories[0] || 'Raw Materials');
    setPaymentStatus(pur.paymentStatus || 'Pending');
    setRemarks(pur.remarks || '');
    setPaymentTerms(pur.paymentTerms || 'IMMEDIATE');
    setDeliveryDate(pur.deliveryDate || 'IMMEDIATE');
    setDeliveryTerms(pur.deliveryTerms || 'EX-WORKS');
    setCurrency(pur.currency || 'AED');
    setDiscount(pur.discount || 0);
    setFreightShipping(pur.freightShipping || 0);
    setSupplierAddress(pur.supplierAddress || '');
    setSupplierAttentionTo(pur.supplierAttentionTo || '');
    setSupplierPhone(pur.supplierPhone || '');
    setSupplierFax(pur.supplierFax || '');
    setSupplierPoBox(pur.supplierPoBox || '');
    setDeliveryNoteNo(pur.deliveryNoteNo || '');
    setDispatchBy(pur.dispatchBy || 'ROAD TRANSPORT');
    setDeliveryMode(pur.deliveryMode || 'BY TRUCK');
    setCountryOfOrigin(pur.countryOfOrigin || 'UAE');
    setHsCode(pur.hsCode || '7318.15.00');
    setPlaceOfSupply(pur.placeOfSupply || 'AJMAN, UAE');
    setTransporterName(pur.transporterName || '');
    setTransporterDate(pur.transporterDate || '');
    setAirwayBillNo(pur.airwayBillNo || '');
    setTransporterAmount(pur.transporterAmount !== undefined ? pur.transporterAmount : '');
    setAdditionalNotes(pur.additionalNotes || '');
    
    const freshFlatProducts = getFlatProducts();
    const updatedItems = (pur.items || []).map(item => {
      if (item.productId) {
        const latestProd = freshFlatProducts.find(p => p.id === item.productId);
        if (latestProd) {
          return {
            ...item,
            balanceQty: latestProd.balanceStock,
            incomingStock: item.qty,
            balanceStock: latestProd.balanceStock + item.qty
          };
        }
      }
      return item;
    });
    setLineItems(updatedItems);
    setIsPurchaseRequest(pur.isPurchaseRequest || false);
    
    // Navigate to form tab
    setActiveTab('form');
  };

  // Print single purchase record using high-fidelity document template
  const handlePrintPurchase = (purchase: PurchaseInvoice, showLinkedInventory: boolean = false) => {
    const isReq = (purchase as any).isPurchaseRequest;
    const docType = isReq ? 'PURCHASE REQUEST' : (purchase.invoiceNo?.toUpperCase().startsWith('PO') || (purchase as any).isPurchaseOrder ? 'PURCHASE ORDER' : 'PURCHASE INVOICE');
    
    // Filter out excluded print items
    const activeItems = (purchase.items || []).filter(item => !excludedPrintItemIds.includes(item.id));

    const normData: InvoiceData & { isPurchase?: boolean } = {
      isPurchase: true,
      documentType: docType as any,
      invoiceNo: purchase.invoiceNo,
      dated: purchase.invoiceDate,
      workOrderNo: purchase.invoiceNo ? deriveWorkOrderNoFromInvoiceNo(purchase.invoiceNo, purchase.invoiceDate) : '',
      deliveryNoteNo: purchase.deliveryNoteNo || deliveryNoteNo || '',
      quotationRef: purchase.lpoRef || '',
      sAcc: 'PUR',
      paymentTerms: purchase.paymentTerms || 'IMMEDIATE',
      deliveryTerms: (purchase as any).deliveryTerms || 'EX-WORKS',
      currency: purchase.currency || 'AED',
      lpoNo: purchase.lpoRef || '',
      buyerName: purchase.supplierName,
      buyerAddress: (purchase as any).supplierAddress || '',
      buyerPhone: (purchase as any).supplierPhone || supplierPhone || '',
      buyerFax: (purchase as any).supplierFax || '',
      buyerPoBox: (purchase as any).supplierPoBox || '',
      buyerTRN: purchase.supplierTrn || '',
      attentionTo: (purchase as any).supplierAttentionTo || '',
      placeOfSupply: (purchase as any).placeOfSupply || placeOfSupply || 'AJMAN, UAE',
      dispatchBy: (purchase as any).dispatchBy || dispatchBy || 'ROAD TRANSPORT',
      deliveryMode: (purchase as any).deliveryMode || deliveryMode || 'BY TRUCK',
      countryOfOrigin: (purchase as any).countryOfOrigin || countryOfOrigin || 'UAE',
      hsCode: (purchase as any).hsCode || hsCode || '7318.15.00',
      transporterName: (purchase as any).transporterName || transporterName || '',
      transporterDate: (purchase as any).transporterDate || transporterDate || '',
      airwayBillNo: (purchase as any).airwayBillNo || airwayBillNo || '',
      transporterAmount: (purchase as any).transporterAmount !== undefined ? (purchase as any).transporterAmount : transporterAmount,
      additionalNotes: (purchase as any).additionalNotes || additionalNotes || '',
      termsConditions: purchase.remarks || '',
      showPricesAndVat: true,
      isZeroRatedExport: false,
      items: activeItems.map((item, idx) => {
        let desc = item.description || '';
        if ((purchase as any).showLinkedInventory && item.productId) {
          const linkedProduct = flatProducts.find(p => p.id === item.productId);
          if (linkedProduct) {
            desc += `\nINVENTORY DETAILS: ${formatPurchaseProductDisplay(linkedProduct, item.qty)}`;
          }
        }
        return {
          id: item.id || `item-${idx}`,
          sn: idx + 1,
          description: desc,
          qty: item.qty || 0,
          unit: item.unit || '',
          unitPriceWOVAT: (item as any).unitPriceWOVAT !== undefined ? (item as any).unitPriceWOVAT : (item.unitPrice || 0),
          vatRate: item.vatRate !== undefined ? item.vatRate : 5,
          finish: (item as any).finish || '',
          hsCode: (item as any).hsCode || '',
          totalWeight: 0
        };
      }),
      discountAmt: purchase.discount ? (purchase.subtotal * (purchase.discount / 100)) : 0,
      freightAmt: purchase.freightShipping || 0,
      receivedBy: (purchase as any).receivedByName || receivedByName || '',
      requestedBy: (purchase as any).requestedByName || (purchase as any).requestedBy || 'STORE / WORKSHOP',
      preparedBy: (purchase as any).preparedByName || preparedByName || 'PURCHASE CONTROLLER',
      checkedBy: (purchase as any).checkedByName || (purchase as any).checkedBy || 'INVENTORY DIRECTOR',
      approvedBy: (purchase as any).approvedByName || approvedByName || 'GENERAL MANAGER'
    };

    const htmlContent = generateHighFidelityDocHtml(normData, docType, undefined, {
      printArea: printArea === 'items' ? 'TABLE_ONLY' : 'ENTIRE',
      showUnitWeightInPrint: true,
      showTotalWeightInPrint: true,
      printPageSize: printSize || 'A4',
    });

    printHtml(htmlContent, `${docType} - ${purchase.invoiceNo}`);
  };

  const handlePrintPurchasesLedger = () => {
    if (filteredPurchases.length === 0) {
      triggerToast('No purchase records in current filter to print.');
      return;
    }
    triggerToast(`Preparing Purchases Ledger Printout (${filteredPurchases.length} records)...`);

    const rowsHtml = filteredPurchases.map((pur, idx) => {
      const subtotal = pur.subtotal || (pur.totalAmount ? pur.totalAmount / 1.05 : 0);
      const vat = pur.vatAmount || (pur.totalAmount ? pur.totalAmount - subtotal : 0);
      const total = pur.totalAmount || 0;

      return `
        <tr style="border-bottom: 1px solid #cbd5e1; height: 26px; font-size: 10px; text-align: center; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #083c54;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: 900; color: #4338ca;">${pur.invoiceNo || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${pur.invoiceDate || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 4px 8px; font-weight: bold; text-transform: uppercase;">${pur.supplierName || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #f37021;">${pur.lpoRef || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-size: 9px;">${pur.paymentStatus || 'Paid'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace;">AED ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace;">AED ${vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace; font-weight: bold; color: #0f172a;">AED ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const totalSub = filteredPurchases.reduce((s, p) => s + (p.subtotal || (p.totalAmount ? p.totalAmount / 1.05 : 0)), 0);
    const totalVat = filteredPurchases.reduce((s, p) => s + (p.vatAmount || (p.totalAmount ? p.totalAmount - (p.subtotal || p.totalAmount / 1.05) : 0)), 0);
    const totalGrand = filteredPurchases.reduce((s, p) => s + (p.totalAmount || 0), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Supplier Purchases Directory Report</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm !important;
            }
            body {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-box {
              border: 2px solid #083c54;
              padding: 10px 16px;
              background-color: #f0f7fa;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .title {
              font-size: 16px;
              font-weight: 900;
              color: #083c54;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0;
            }
            .subtitle {
              font-size: 9.5px;
              color: #64748b;
              font-weight: 700;
              margin: 2px 0 0 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background-color: #083c54;
              color: #ffffff;
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 6px 4px;
              border: 1px solid #05293a;
              text-align: center;
            }
            tfoot td {
              background-color: #f1f5f9;
              font-weight: 900;
              font-size: 10px;
              padding: 6px 8px;
              border: 1.5px solid #083c54;
            }
            .footer {
              margin-top: 14px;
              border-top: 1.5px dashed #94a3b8;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              font-weight: 700;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <h1 class="title">${activeCompany?.name || 'Marine Fasteners Industries LLC'}</h1>
              <div class="subtitle">SUPPLIER PURCHASE ACQUISITIONS DIRECTORY & AUDIT LEDGER</div>
            </div>
            <div style="text-align: right; font-size: 9px; font-family: monospace; font-weight: bold;">
              <div>Records: <strong>${filteredPurchases.length}</strong></div>
              <div>Period: ${purFromDate || 'Start'} to ${purToDate || 'Present'}</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%;">SN</th>
                <th style="width: 13%;">PURCHASE NO</th>
                <th style="width: 10%;">DATE</th>
                <th style="width: 31%; text-align: left; padding-left: 8px;">SUPPLIER / VENDOR NAME</th>
                <th style="width: 12%;">LPO REF</th>
                <th style="width: 8%;">STATUS</th>
                <th style="width: 11%; text-align: right; padding-right: 8px;">TAXABLE</th>
                <th style="width: 11%; text-align: right; padding-right: 8px;">VAT (5%)</th>
                <th style="width: 12%; text-align: right; padding-right: 8px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right; font-weight: 900;">SUMMARY TOTALS (AED):</td>
                <td style="text-align: right; font-family: monospace;">AED ${totalSub.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="text-align: right; font-family: monospace;">AED ${totalVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="text-align: right; font-family: monospace; color: #083c54;">AED ${totalGrand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <span>OFFICIAL CORPORATE PROCUREMENT LEDGER</span>
            <span>DUBAI, UNITED ARAB EMIRATES</span>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `MFI_Purchases_Ledger_${new Date().toISOString().slice(0, 10)}`);
  };

  const [previewModalHtml, setPreviewModalHtml] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');

  const handlePreviewPurchase = (purchase: PurchaseInvoice) => {
    const isReq = (purchase as any).isPurchaseRequest;
    const docType = isReq ? 'PURCHASE REQUEST' : (purchase.invoiceNo?.toUpperCase().startsWith('PO') || (purchase as any).isPurchaseOrder ? 'PURCHASE ORDER' : 'PURCHASE INVOICE');
    const activeItems = (purchase.items || []).filter(item => !excludedPrintItemIds.includes(item.id));

    const normData: InvoiceData & { isPurchase?: boolean } = {
      isPurchase: true,
      documentType: docType as any,
      invoiceNo: purchase.invoiceNo,
      dated: purchase.invoiceDate,
      workOrderNo: purchase.invoiceNo ? deriveWorkOrderNoFromInvoiceNo(purchase.invoiceNo, purchase.invoiceDate) : '',
      deliveryNoteNo: purchase.deliveryNoteNo || deliveryNoteNo || '',
      quotationRef: purchase.lpoRef || '',
      sAcc: 'PUR',
      paymentTerms: purchase.paymentTerms || 'IMMEDIATE',
      deliveryTerms: (purchase as any).deliveryTerms || 'EX-WORKS',
      currency: purchase.currency || 'AED',
      lpoNo: purchase.lpoRef || '',
      buyerName: purchase.supplierName,
      buyerAddress: (purchase as any).supplierAddress || '',
      buyerPhone: (purchase as any).supplierPhone || supplierPhone || '',
      buyerFax: (purchase as any).supplierFax || '',
      buyerPoBox: (purchase as any).supplierPoBox || '',
      buyerTRN: purchase.supplierTrn || '',
      attentionTo: (purchase as any).supplierAttentionTo || '',
      placeOfSupply: (purchase as any).placeOfSupply || placeOfSupply || 'AJMAN, UAE',
      dispatchBy: (purchase as any).dispatchBy || dispatchBy || 'ROAD TRANSPORT',
      deliveryMode: (purchase as any).deliveryMode || deliveryMode || 'BY TRUCK',
      countryOfOrigin: (purchase as any).countryOfOrigin || countryOfOrigin || 'UAE',
      hsCode: (purchase as any).hsCode || hsCode || '7318.15.00',
      transporterName: (purchase as any).transporterName || transporterName || '',
      transporterDate: (purchase as any).transporterDate || transporterDate || '',
      airwayBillNo: (purchase as any).airwayBillNo || airwayBillNo || '',
      transporterAmount: (purchase as any).transporterAmount !== undefined ? (purchase as any).transporterAmount : transporterAmount,
      additionalNotes: (purchase as any).additionalNotes || additionalNotes || '',
      termsConditions: purchase.remarks || '',
      showPricesAndVat: true,
      isZeroRatedExport: false,
      items: activeItems.map((item, idx) => {
        let desc = item.description || '';
        if ((purchase as any).showLinkedInventory && item.productId) {
          const linkedProduct = flatProducts.find(p => p.id === item.productId);
          if (linkedProduct) {
            desc += `\nINVENTORY DETAILS: ${formatPurchaseProductDisplay(linkedProduct, item.qty)}`;
          }
        }
        return {
          id: item.id || `item-${idx}`,
          sn: idx + 1,
          description: desc,
          qty: item.qty || 0,
          unit: item.unit || '',
          unitPriceWOVAT: (item as any).unitPriceWOVAT !== undefined ? (item as any).unitPriceWOVAT : (item.unitPrice || 0),
          vatRate: item.vatRate !== undefined ? item.vatRate : 5,
          finish: (item as any).finish || '',
          hsCode: (item as any).hsCode || '',
          totalWeight: 0
        };
      }),
      discountAmt: purchase.discount ? (purchase.subtotal * (purchase.discount / 100)) : 0,
      freightAmt: purchase.freightShipping || 0,
      receivedBy: (purchase as any).receivedByName || receivedByName || '',
      requestedBy: (purchase as any).requestedByName || (purchase as any).requestedBy || 'STORE / WORKSHOP',
      preparedBy: (purchase as any).preparedByName || preparedByName || 'PURCHASE CONTROLLER',
      checkedBy: (purchase as any).checkedByName || (purchase as any).checkedBy || 'INVENTORY DIRECTOR',
      approvedBy: (purchase as any).approvedByName || approvedByName || 'GENERAL MANAGER'
    };

    const htmlContent = generateHighFidelityDocHtml(normData, docType, undefined, {
      printArea: printArea === 'items' ? 'TABLE_ONLY' : 'ENTIRE',
      showUnitWeightInPrint: true,
      showTotalWeightInPrint: true,
      printPageSize: printSize || 'A4',
    });

    setPreviewDocTitle(`${docType} - ${purchase.invoiceNo}`);
    setPreviewModalHtml(htmlContent);
  };

  const handlePreviewCurrentDraft = () => {
    const finalSupplierName = customSupplierName;

    const draftPurchase: PurchaseInvoice = {
      id: editingId || 'draft',
      supplierName: finalSupplierName || '[SUPPLIER COMPANY]',
      supplierTrn: supplierTrn,
      invoiceNo: invoiceNo || 'DRAFT-PO',
      invoiceDate: invoiceDate,
      lpoRef: lpoRef,
      category: category,
      items: lineItems,
      subtotal: calculatedSubtotal,
      vatAmount: calculatedVat,
      totalAmount: calculatedTotal,
      paymentStatus: paymentStatus,
      remarks: remarks,
      paymentTerms: paymentTerms,
      deliveryDate: deliveryDate,
      deliveryTerms: deliveryTerms,
      currency: currency,
      supplierAddress: supplierAddress,
      supplierAttentionTo: supplierAttentionTo,
      supplierPhone: supplierPhone,
      supplierFax: supplierFax,
      supplierPoBox: supplierPoBox,
      discount: discount,
      freightShipping: freightShipping,
      preparedByName: preparedByName,
      approvedByName: approvedByName,
      isPurchaseRequest: isPurchaseRequest,
      deliveryNoteNo: deliveryNoteNo
    };

    handlePreviewPurchase(draftPurchase);
  };

  // --- UAE VAT Return (Form VAT201) Logic - FOCUS ERP 9 TAX ENGINE ---
  const calculateVatReturn = () => {
    let totalSalesExclVat = 0;
    let totalSalesVat = 0;
    const salesList: any[] = [];

    // Breakdown per Emirate for Focus ERP 9 Box 1a-1g
    const emirateTotals: Record<string, { excl: number; vat: number }> = {
      'Abu Dhabi': { excl: 0, vat: 0 },
      'Dubai': { excl: 0, vat: 0 },
      'Sharjah': { excl: 0, vat: 0 },
      'Ajman': { excl: 0, vat: 0 },
      'Umm Al Quwain': { excl: 0, vat: 0 },
      'Ras Al Khaimah': { excl: 0, vat: 0 },
      'Fujairah': { excl: 0, vat: 0 }
    };

    salesInvoices.forEach((inv: any) => {
      const isTaxInvoice = inv.documentType === 'TAX INVOICE';
      if (isTaxInvoice) {
        // Enforce Company Segregation on VAT sales invoices
        const matchesCompany = (inv.companyId === activeCompany.id) ||
          (!inv.companyId && (activeCompany.code === 'MFI' || (inv.documentNo || inv.invoiceNo || '').startsWith(activeCompany.code || 'MFI')));
        if (!matchesCompany) return;

        const invDate = inv.documentDate || inv.date || '';
        if (vatFromDate && invDate && invDate < vatFromDate) return;
        if (vatToDate && invDate && invDate > vatToDate) return;

        let emirate = inv.placeOfSupply || inv.emirate || 'Ajman';
        if (!emirateTotals[emirate]) {
          emirate = 'Ajman';
        }

        if (vatEmirateFilter !== 'ALL' && emirate.toLowerCase() !== vatEmirateFilter.toLowerCase()) return;

        const total = parseFloat(inv.total) || 0;
        const subtotal = parseFloat(inv.subtotal) || total;
        const vat = parseFloat(inv.vatAmount) || parseFloat(inv.vat_amount) || (subtotal * 0.05);

        totalSalesExclVat += subtotal;
        totalSalesVat += vat;

        emirateTotals[emirate].excl += subtotal;
        emirateTotals[emirate].vat += vat;

        salesList.push({
          voucherNo: inv.documentNo || inv.invoiceNo || 'INV-001',
          date: invDate || '2026-06-01',
          customerName: inv.customerName || inv.billedTo || 'Standard Client',
          customerTrn: inv.customerTrn || inv.trn || '100000000000003',
          emirate: emirate,
          subtotal: subtotal,
          vatAmount: vat,
          total: subtotal + vat
        });
      }
    });

    let totalPurchasesExclVat = 0;
    let totalPurchasesVat = 0;
    const purchasesList: any[] = [];

    purchases.forEach((pur: any) => {
      // Enforce Company Segregation on VAT purchases
      const matchesCompany = (pur.companyId === activeCompany.id) ||
        (!pur.companyId && (activeCompany.code === 'MFI' || (pur.invoiceNo || '').startsWith(activeCompany.code || 'MFI')));
      if (!matchesCompany) return;

      const purDate = pur.invoiceDate || pur.date || '';
      if (vatFromDate && purDate && purDate < vatFromDate) return;
      if (vatToDate && purDate && purDate > vatToDate) return;

      const subtotal = parseFloat(pur.subtotal) || 0;
      const vat = parseFloat(pur.vatAmount) || 0;

      totalPurchasesExclVat += subtotal;
      totalPurchasesVat += vat;

      purchasesList.push({
        billNo: pur.invoiceNo || pur.poNo || 'PUR-001',
        date: purDate || '2026-06-01',
        supplierName: pur.supplierName || 'Standard Supplier',
        supplierTrn: pur.supplierTrn || '100345678900003',
        subtotal: subtotal,
        vatAmount: vat,
        total: subtotal + vat
      });
    });

    const netVatPayable = totalSalesVat - totalPurchasesVat;

    return {
      salesExcl: totalSalesExclVat,
      salesVat: totalSalesVat,
      purchasesExcl: totalPurchasesExclVat,
      purchasesVat: totalPurchasesVat,
      netPayable: netVatPayable,
      emirateTotals,
      salesList,
      purchasesList
    };
  };

  const vatStats = calculateVatReturn();

  // Print Focus ERP 9 Official UAE VAT Return Form (VAT201) PDF
  const handlePrintVatReturn = () => {
    const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const printTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>UAE VAT Return (Form VAT201) - MARINE FASTENERS INDUSTRIES L.L.C.</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm 6mm 8mm !important;
            }
            body {
              font-family: Arial, "Arial MT", sans-serif;
              padding: 0;
              margin: 0;
              font-size: 8.5px;
              line-height: 1.35;
              color: #000000;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .container {
              width: 100%;
              box-sizing: border-box;
              background: #ffffff;
            }
            
            /* Focus ERP 9 Header Banner - Clean White Background Black Text */
            .focus-header {
              background: #ffffff;
              color: #000000;
              padding: 8px 12px;
              border: 1.5px solid #000000;
              border-bottom: 3px solid #000000;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .focus-title {
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 0.5px;
              color: #000000;
            }
            .focus-subtitle {
              font-size: 8px;
              color: #000000;
              font-weight: bold;
              margin-top: 2px;
            }
            .focus-right {
              text-align: right;
            }
            .focus-badge {
              border: 1px solid #000000;
              background: #ffffff;
              color: #000000;
              font-size: 8.5px;
              font-weight: bold;
              padding: 2px 6px;
              display: inline-block;
            }
            .focus-sysinfo {
              font-size: 7.5px;
              color: #000000;
              margin-top: 3px;
              font-family: Arial, "Arial MT", sans-serif;
            }

            /* Taxpayer Details Box */
            .taxpayer-box {
              border: 1px solid #000000;
              background: #ffffff;
              padding: 8px 12px;
              margin-bottom: 10px;
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 15px;
            }
            .tp-title {
              font-size: 8.5px;
              font-weight: bold;
              color: #000000;
              text-transform: uppercase;
              border-bottom: 1.5px solid #000000;
              padding-bottom: 3px;
              margin-bottom: 5px;
            }
            .tp-row {
              margin-bottom: 3px;
              display: flex;
            }
            .tp-label {
              width: 140px;
              font-weight: bold;
              color: #000000;
            }
            .tp-val {
              font-weight: bold;
              color: #000000;
            }

            /* Section Headers */
            .section-bar {
              background: #ffffff;
              color: #000000;
              font-size: 8.5px;
              font-weight: bold;
              padding: 4px 8px;
              text-transform: uppercase;
              border: 1px solid #000000;
              border-bottom: 2px solid #000000;
              display: flex;
              justify-content: space-between;
            }

            /* Grid Table */
            .vat-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              background: #ffffff;
            }
            .vat-table th {
              background: #ffffff;
              color: #000000;
              font-size: 8px;
              font-weight: bold;
              text-align: left;
              padding: 4px 6px;
              border: 1px solid #000000;
            }
            .vat-table td {
              padding: 4px 6px;
              border: 1px solid #000000;
              font-size: 8px;
              color: #000000;
            }
            .vat-table tr.sub-row td {
              background: #ffffff;
            }
            .vat-table tr.total-row td {
              background: #ffffff;
              color: #000000;
              font-weight: bold;
              font-size: 8.5px;
              border-top: 2px solid #000000;
              border-bottom: 3px double #000000;
            }

            /* Summary Banner */
            .summary-card {
              border: 2px solid #000000;
              background: #ffffff;
              padding: 8px 12px;
              margin-bottom: 10px;
              text-align: center;
              color: #000000;
            }
            .summary-title {
              font-size: 10px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 4px;
            }
            .summary-amt {
              font-size: 12px;
              font-weight: bold;
              color: #000000;
              font-family: Arial, "Arial MT", sans-serif;
            }

            /* Audit Annexure */
            .annex-title {
              font-size: 9px;
              font-weight: bold;
              color: #000000;
              background: #ffffff;
              padding: 4px 8px;
              margin-top: 10px;
              margin-bottom: 4px;
              border: 1px solid #000000;
            }
            .annex-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
              background: #ffffff;
            }
            .annex-table th {
              background: #ffffff;
              color: #000000;
              font-size: 7.5px;
              font-weight: bold;
              padding: 3px 5px;
              border: 1px solid #000000;
              text-align: left;
            }
            .annex-table td {
              padding: 3px 5px;
              border: 1px solid #000000;
              font-size: 7.5px;
              color: #000000;
            }

            /* Signature Block */
            .signature-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              gap: 10px;
              margin-top: 15px;
              padding-top: 8px;
              border-top: 1px dashed #000000;
            }
            .sig-box {
              border: 1px solid #000000;
              background: #ffffff;
              padding: 6px;
              height: 45px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              color: #000000;
            }
            .sig-title {
              font-size: 7.5px;
              font-weight: bold;
              color: #000000;
              text-transform: uppercase;
            }
            .sig-line {
              border-bottom: 1px solid #000000;
              margin-bottom: 2px;
            }
            .sig-name {
              font-size: 7px;
              color: #000000;
            }

            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="focus-header">
              <div>
                <div class="focus-title">UAE VAT RETURN (FORM VAT201)</div>
                <div class="focus-subtitle">STATE OF UNITED ARAB EMIRATES | FEDERAL TAX AUTHORITY (FTA) COMPLIANCE ENGINE</div>
              </div>
              <div class="focus-right">
                <div class="focus-badge">TAX ENGINE</div>
                <div class="focus-sysinfo">STATION: AFZ-MF01 | REF: VAT201-${new Date().getFullYear()}</div>
              </div>
            </div>

            <!-- Taxpayer Details -->
            <div class="taxpayer-box">
              <div>
                <div class="tp-title">1. Taxable Person Information</div>
                <div class="tp-row"><span class="tp-label">Taxable Person Name:</span><span class="tp-val">${activeCompany.name}</span></div>
                <div class="tp-row"><span class="tp-label">Tax Registration No (TRN):</span><span class="tp-val">${activeCompany.trn || '100440509600003'}</span></div>
                <div class="tp-row"><span class="tp-label">Corporate Address:</span><span class="tp-val">${activeCompany.address}</span></div>
                <div class="tp-row"><span class="tp-label">Emirate / Branch:</span><span class="tp-val">${vatEmirateFilter === 'ALL' ? 'All Emirates Combined (' + (activeCompany.city || 'Ajman') + ' Primary)' : vatEmirateFilter}</span></div>
              </div>
              <div>
                <div class="tp-title">2. Tax Return Period Details</div>
                <div class="tp-row"><span class="tp-label">Tax Return Period:</span><span class="tp-val">${vatFromDate} TO ${vatToDate}</span></div>
                <div class="tp-row"><span class="tp-label">Print Date & Time:</span><span class="tp-val">${printDate} ${printTime}</span></div>
                <div class="tp-row"><span class="tp-label">Currency:</span><span class="tp-val">AED (United Arab Emirates Dirham)</span></div>
                <div class="tp-row"><span class="tp-label">Filing Status:</span><span class="tp-val">System Generated Audit Sheet</span></div>
              </div>
            </div>

            <!-- Section 1: Output Tax -->
            <div class="section-bar">
              <span>3. VAT ON SALES AND ALL OTHER OUTPUTS (OUTPUT TAX)</span>
              <span>SECTION A</span>
            </div>
            <table class="vat-table">
              <thead>
                <tr>
                  <th style="width: 35px;">BOX</th>
                  <th>DESCRIPTION OF TAXABLE SUPPLIES (SALES)</th>
                  <th style="text-align: right; width: 130px;">NET AMOUNT (AED)</th>
                  <th style="text-align: right; width: 110px;">VAT AMOUNT (AED)</th>
                  <th style="text-align: right; width: 70px;">RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1a</td>
                  <td>Standard Rated Supplies in Abu Dhabi</td>
                  <td style="text-align: right;">${vatStats.emirateTotals['Abu Dhabi'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Abu Dhabi'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1b</td>
                  <td>Standard Rated Supplies in Dubai</td>
                  <td style="text-align: right;">${vatStats.emirateTotals['Dubai'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Dubai'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1c</td>
                  <td>Standard Rated Supplies in Sharjah</td>
                  <td style="text-align: right;">${vatStats.emirateTotals['Sharjah'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Sharjah'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1d</td>
                  <td>Standard Rated Supplies in Ajman (Primary Manufacturing Unit)</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Ajman'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Ajman'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1e</td>
                  <td>Standard Rated Supplies in Umm Al Quwain</td>
                  <td style="text-align: right;">${vatStats.emirateTotals['Umm Al Quwain'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Umm Al Quwain'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1f</td>
                  <td>Standard Rated Supplies in Ras Al Khaimah</td>
                  <td style="text-align: right;">${vatStats.emirateTotals['Ras Al Khaimah'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Ras Al Khaimah'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">1g</td>
                  <td>Standard Rated Supplies in Fujairah</td>
                  <td style="text-align: right;">${vatStats.emirateTotals['Fujairah'].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.emirateTotals['Fujairah'].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">2</td>
                  <td>Tax Obligations under Reverse Charge Mechanism (RCM Sales)</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">—</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">3</td>
                  <td>Zero-Rated Supplies (Direct & Indirect Exports outside GCC)</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">0.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">4</td>
                  <td>Exempt Supplies</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">Exempt</td>
                </tr>
                <tr class="total-row">
                  <td style="font-weight: bold;">8</td>
                  <td style="font-weight: bold;">TOTAL OUTPUT TAX DUE (BOX 1 TO 7)</td>
                  <td style="text-align: right;">${vatStats.salesExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">AED ${vatStats.salesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">—</td>
                </tr>
              </tbody>
            </table>

            <!-- Section 2: Input Tax -->
            <div class="section-bar">
              <span>4. VAT ON EXPENSES AND ACQUISITIONS (INPUT TAX)</span>
              <span>SECTION B</span>
            </div>
            <table class="vat-table">
              <thead>
                <tr>
                  <th style="width: 35px;">BOX</th>
                  <th>DESCRIPTION OF EXPENDITURES & ACQUISITIONS (PURCHASES)</th>
                  <th style="text-align: right; width: 130px;">NET AMOUNT (AED)</th>
                  <th style="text-align: right; width: 110px;">VAT RECOVERABLE (AED)</th>
                  <th style="text-align: right; width: 70px;">RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr class="sub-row">
                  <td style="font-weight: bold;">9</td>
                  <td>Standard Rated Expenses & Supplier Purchases (5% Input Tax)</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.purchasesExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-weight: bold;">${vatStats.purchasesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">5.00%</td>
                </tr>
                <tr class="sub-row">
                  <td style="font-weight: bold;">10</td>
                  <td>Supplies subject to Reverse Charge Mechanism (RCM Purchases)</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">0.00</td>
                  <td style="text-align: right;">—</td>
                </tr>
                <tr class="total-row">
                  <td style="font-weight: bold;">11</td>
                  <td style="font-weight: bold;">TOTAL RECOVERABLE INPUT TAX (BOX 9 + 10)</td>
                  <td style="text-align: right;">${vatStats.purchasesExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">AED ${vatStats.purchasesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">—</td>
                </tr>
              </tbody>
            </table>

            <!-- Section 3: Summary -->
            <div class="summary-card">
              <div class="summary-title">CONSOLIDATED NET VAT STATUS</div>
              <div style="font-size: 8px; color: #000000; margin-bottom: 5px;">
                TOTAL OUTPUT TAX (BOX 8): <strong>AED ${vatStats.salesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> | 
                TOTAL INPUT TAX (BOX 11): <strong>AED ${vatStats.purchasesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
              </div>
              <div class="summary-amt">
                ${vatStats.netPayable >= 0
                  ? `NET VAT PAYABLE TO FTA: AED ${vatStats.netPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}`
                  : `NET VAT RECOVERABLE FROM FTA: AED ${Math.abs(vatStats.netPayable).toLocaleString(undefined, {minimumFractionDigits: 2})}`
                }
              </div>
            </div>

            ${vatIncludeAnnexure ? `
            <!-- Annexure A: Sales Invoices Audit Schedule -->
            <div class="annex-title">ANNEXURE A: SALES TAX INVOICES AUDIT SCHEDULE (${vatStats.salesList.length} VOUCHERS)</div>
            <table class="annex-table">
              <thead>
                <tr>
                  <th style="width: 20px;">#</th>
                  <th style="width: 80px;">VOUCHER NO</th>
                  <th style="width: 60px;">DATE</th>
                  <th>CUSTOMER NAME</th>
                  <th style="width: 90px;">TRN</th>
                  <th style="width: 60px;">EMIRATE</th>
                  <th style="text-align: right; width: 70px;">TAXABLE (AED)</th>
                  <th style="text-align: right; width: 60px;">VAT 5%</th>
                  <th style="text-align: right; width: 70px;">TOTAL (AED)</th>
                </tr>
              </thead>
              <tbody>
                ${vatStats.salesList.length === 0 ? `
                  <tr><td colspan="9" style="text-align: center; color: #000000; padding: 10px;">No sales tax invoices recorded in selected date range.</td></tr>
                ` : vatStats.salesList.map((s, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td style="font-weight: bold;">${s.voucherNo}</td>
                    <td>${s.date}</td>
                    <td>${s.customerName}</td>
                    <td>${s.customerTrn}</td>
                    <td>${s.emirate}</td>
                    <td style="text-align: right;">${s.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right; font-weight: bold;">${s.vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right; font-weight: bold;">${s.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Annexure B: Purchase Bills Audit Schedule -->
            <div class="annex-title">ANNEXURE B: SUPPLIER PURCHASE BILLS AUDIT SCHEDULE (${vatStats.purchasesList.length} ACQUISITIONS)</div>
            <table class="annex-table">
              <thead>
                <tr>
                  <th style="width: 20px;">#</th>
                  <th style="width: 80px;">BILL / INV NO</th>
                  <th style="width: 60px;">DATE</th>
                  <th>SUPPLIER NAME</th>
                  <th style="width: 90px;">SUPPLIER TRN</th>
                  <th style="text-align: right; width: 70px;">TAXABLE (AED)</th>
                  <th style="text-align: right; width: 60px;">INPUT VAT 5%</th>
                  <th style="text-align: right; width: 70px;">TOTAL (AED)</th>
                </tr>
              </thead>
              <tbody>
                ${vatStats.purchasesList.length === 0 ? `
                  <tr><td colspan="8" style="text-align: center; color: #000000; padding: 10px;">No purchase bills recorded in selected date range.</td></tr>
                ` : vatStats.purchasesList.map((p, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td style="font-weight: bold;">${p.billNo}</td>
                    <td>${p.date}</td>
                    <td>${p.supplierName}</td>
                    <td>${p.supplierTrn}</td>
                    <td style="text-align: right;">${p.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right; font-weight: bold;">${p.vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right; font-weight: bold;">${p.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}

            <!-- Authorization Signatures -->
            <div class="signature-grid">
              <div class="sig-box">
                <div class="sig-title">PREPARED BY</div>
                <div class="sig-line"></div>
                <div class="sig-name">ACCOUNTANT</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">VERIFIED BY</div>
                <div class="sig-line"></div>
                <div class="sig-name">FINANCE CONTROLLER</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">APPROVED BY</div>
                <div class="sig-line"></div>
                <div class="sig-name">MANAGING DIRECTOR</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">COMPANY SEAL</div>
                <div style="font-size: 6px; color: #000000; font-weight: bold; margin-top: 5px;">[ STAMP HERE ]</div>
                <div class="sig-name">${activeCompany.name} TAX DEPT</div>
              </div>
            </div>

            <!-- Disclaimer -->
            <div style="margin-top: 10px; font-size: 7px; color: #000000; text-align: center; border-top: 1px solid #000000; padding-top: 4px;">
              Generated in compliance with UAE Federal Decree-Law No. (8) of 2017. Document strictly confidential for internal audit and FTA tax returns submission.
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(html);
  };

  // List of unique suppliers in saved purchases for filtering
  const uniqueSuppliers = Array.from(new Set(purchases.map(p => p.supplierName)));

  return (
    <div className="space-y-6">
      {/* Tab Navigation buttons */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'form'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#f37021]" />
            Record Supplier Bill
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'records'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-teal-500" />
            Purchase Records Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vat')}
            className={`px-4 py-2 text-[10.5px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'vat'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-rose-500" />
            UAE VAT Return (Form VAT201)
          </button>
        </div>

        <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f37021] animate-pulse" />
          UAE STANDARD VAT: 5.00%
        </div>
      </div>
      {activeTab === 'form' && (
        <div className="space-y-4">
          {/* Top toolbar panel matching the redesign screenshot */}
          <div className="bg-[#f1f5f9] border border-slate-300/80 rounded-xl p-2.5 w-full shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
            
            {/* Left: Purchase Voucher System Title Badge & Right-aligned PURCHASE INVOICE text */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <div className="bg-white border-2 border-blue-600 text-blue-700 px-3.5 py-2 rounded-lg flex items-center gap-2 font-black text-xs uppercase tracking-wider shadow-2xs">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>PURCHASE VOUCHER SYSTEM</span>
              </div>
              <div className="bg-[#083c54] text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-2xs text-right ml-auto">
                PURCHASE INVOICE
              </div>
            </div>

            {/* Right: Action Buttons (New, Save, Delete, Print, Preview, Close) */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {/* New */}
              <button
                type="button"
                onClick={resetForm}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Create New Sheet"
              >
                <FilePlus className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">New</span>
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={handleSavePurchase}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Save Purchase Invoice"
              >
                <Save className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">Save</span>
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={resetForm}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Clear / Delete Form Data"
              >
                <Trash2 className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">Delete</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrintCurrentDraft}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Print PDF"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">Print</span>
              </button>

              {/* Preview */}
              <button
                type="button"
                onClick={handlePreviewCurrentDraft}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Preview Document Layout"
              >
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">Preview</span>
              </button>

              {/* Header Company Edit */}
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Edit Company Profile & Header (Name, Address, Phone, TRN)"
              >
                <Building2 className="w-4 h-4 text-[#f37021]" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">Header</span>
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 min-w-[60px] h-[52px] flex flex-col items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Close Sheet"
              >
                <XCircle className="w-4 h-4 text-slate-700" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">Close</span>
              </button>
            </div>

          </div>

          <form onSubmit={handleSavePurchase} className="space-y-6" noValidate>
            
            {/* Main Document Frame */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-8 shadow-lg w-full font-sans relative overflow-hidden">
              


              {/* Top Active Company Header Banner Box */}
              <div className="border-2 border-[#083c54] rounded-xl overflow-hidden bg-white shadow-2xs mb-5 font-sans">
                <div className="p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-0.5">
                      BUYER / CONSIGNEE ORGANISATION
                    </span>
                    <h1 className="text-sm sm:text-base font-black text-[#083c54] uppercase tracking-wide leading-tight">
                      {activeCompany.name}
                    </h1>
                    <p className="text-[8.5px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                      {activeCompany.tagline || activeCompany.businessType || 'MANUFACTURER & DISTRIBUTOR'}
                    </p>
                  </div>
                  <div className="bg-[#083c54] text-white px-3.5 py-1.5 rounded-lg shadow-2xs shrink-0 font-mono text-right">
                    <span className="text-[9.5px] font-black tracking-wider block">
                      VAT TRN: {activeCompany.trn || '100440509600003'}
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 bg-slate-50/60 px-3.5 py-2 flex flex-col md:flex-row justify-between items-start md:items-center text-[9px] font-bold text-slate-700 font-mono gap-2">
                  <div>
                    <span className="text-slate-800 font-black">📍 ADDRESS:</span> {activeCompany.address}
                  </div>
                  <div className="flex items-center gap-4 text-slate-700 font-mono">
                    <span>☎ TEL: {activeCompany.phone}</span>
                    <span>✉ EMAIL: {activeCompany.email}</span>
                  </div>
                </div>
              </div>

              {/* Document Header Info Grid matching screenshot layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-6 border-b border-slate-200">
                {/* Left Card: SUPPLIER / EXPORTER DETAILS */}
                <div className="lg:col-span-5 border-2 border-[#083c54] rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col justify-start">
                  {/* Header Bar */}
                  <div className="bg-[#083c54] px-3 py-1 flex items-center justify-between text-white shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      SUPPLIER / EXPORTER DETAILS
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-[#00a884]/20 text-[#00c896] px-1.5 py-0.5 rounded border border-[#00c896]/30">
                      AUTO-SUGGEST ACTIVE
                    </span>
                  </div>

                  {/* Body Form Controls */}
                  <div className="p-2 space-y-1 font-sans">
                    {/* Supplier Name */}
                    <div className="relative">
                      <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 text-left">
                        M/S. (SUPPLIER / EXPORTER COMPANY NAME)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="TYPE SUPPLIER / EXPORTER COMPANY NAME..."
                        className="w-full bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 text-[10.5px] font-black uppercase text-[#083c54] focus:outline-none focus:border-[#083c54] focus:bg-white transition-all font-sans"
                        value={customSupplierName}
                        data-header-row="5"
                        data-header-col="1"
                        onKeyDown={(e) => handleHeaderKeyDown(e, 5, 1)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomSupplierName(val);
                          if (!val.trim()) {
                            setSuggestions([]);
                            setShowSuggestions(false);
                            setSupplierTrn('');
                            setSupplierAddress('');
                            setSupplierPhone('');
                            setSupplierMobile('');
                            setSupplierEmail('');
                            setSupplierFax('');
                            setSupplierPoBox('');
                            setSupplierAttentionTo('');
                            return;
                          }
                          const typedWord = val.trim().toLowerCase().split(' ')[0];
                          if (!typedWord) {
                            setSuggestions([]);
                            setShowSuggestions(false);
                            return;
                          }
                          const filtered = registryEntities.filter(entity => 
                            entity.companyName.toLowerCase().includes(typedWord)
                          );
                          setSuggestions(filtered.slice(0, 8));
                          setShowSuggestions(filtered.length > 0);
                        }}
                        onFocus={() => {
                          if (customSupplierName.trim()) {
                            const typedWord = customSupplierName.trim().toLowerCase().split(' ')[0];
                            const filtered = registryEntities.filter(entity => 
                              entity.companyName.toLowerCase().includes(typedWord)
                            );
                            setSuggestions(filtered.slice(0, 8));
                            setShowSuggestions(filtered.length > 0);
                          } else {
                            setSuggestions(registryEntities.slice(0, 8));
                            setShowSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowSuggestions(false);
                          }, 250);
                        }}
                      />
                      
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-300 rounded-md shadow-lg divide-y divide-slate-100">
                          {suggestions.map((entity, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="w-full text-left px-3 py-2 text-[10px] hover:bg-slate-100 transition-colors flex flex-col items-start gap-0.5 cursor-pointer"
                              onMouseDown={() => {
                                setCustomSupplierName(entity.companyName.toUpperCase());
                                setSupplierTrn(entity.trn || '');
                                setSupplierAddress(entity.address || '');
                                setSupplierPhone(entity.phone || entity.mobile || '');
                                setSupplierFax(entity.faxNo || '');
                                setSupplierPoBox(entity.poBox || '');
                                setSupplierAttentionTo(entity.contactPerson || '');
                                setSuggestions([]);
                                setShowSuggestions(false);
                                triggerToast(`Loaded supplier registry data for ${entity.companyName.toUpperCase()}`);
                              }}
                            >
                              <span className="font-bold text-[#083c54]">{entity.companyName.toUpperCase()}</span>
                              <div className="flex gap-2 text-[8px] text-slate-500 font-mono">
                                {entity.trn && <span>TRN: {entity.trn}</span>}
                                {entity.phone && <span>TEL: {entity.phone}</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 text-left">
                        FULL BILLING ADDRESS
                      </label>
                      <textarea
                        rows={1}
                        className="w-full bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 text-[10px] font-bold text-slate-800 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white leading-tight resize-none transition-all font-sans"
                        placeholder="STREET, INDUSTRIAL AREA, CITY, COUNTRY..."
                        value={supplierAddress}
                        onChange={(e) => setSupplierAddress(e.target.value)}
                        data-header-row="6"
                        data-header-col="1"
                        onKeyDown={(e) => handleHeaderKeyDown(e, 6, 1)}
                      />
                    </div>

                    {/* Bottom Row: P.O. BOX, PHONE / TEL, MOBILE / CELL, EMAIL, SUPPLIER TRN */}
                    <div className="grid grid-cols-3 gap-1.5 text-left pt-0.5">
                      <div>
                        <label className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          P.O. BOX
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#f4f7f9] border border-slate-300 rounded px-1.5 py-0.5 text-[9.5px] font-bold text-slate-800 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white font-mono"
                          placeholder="—"
                          value={supplierPoBox}
                          onChange={(e) => setSupplierPoBox(e.target.value)}
                          data-header-row="7"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 7, 1)}
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          PHONE / TEL
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#f4f7f9] border border-slate-300 rounded px-1.5 py-0.5 text-[9.5px] font-bold text-slate-800 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white font-mono"
                          placeholder="—"
                          value={supplierPhone}
                          onChange={(e) => setSupplierPhone(e.target.value)}
                          data-header-row="7"
                          data-header-col="2"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 7, 2)}
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          MOBILE / CELL
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#f4f7f9] border border-slate-300 rounded px-1.5 py-0.5 text-[9.5px] font-bold text-slate-800 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white font-mono"
                          placeholder="—"
                          value={supplierMobile}
                          onChange={(e) => setSupplierMobile(e.target.value)}
                          data-header-row="7"
                          data-header-col="3"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 7, 3)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-left pt-1">
                      <div>
                        <label className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#f4f7f9] border border-slate-300 rounded px-1.5 py-0.5 text-[9.5px] font-bold text-slate-800 focus:outline-none focus:border-[#083c54] focus:bg-white font-mono"
                          placeholder="EMAIL..."
                          value={supplierEmail}
                          onChange={(e) => setSupplierEmail(e.target.value)}
                          data-header-row="8"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 8, 1)}
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-black text-emerald-600 uppercase tracking-wider block mb-0.5">
                          CUSTOMER / SUPPLIER TRN
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 rounded px-1.5 py-0.5 text-[9.5px] font-black text-emerald-800 uppercase focus:outline-none font-mono"
                          placeholder="TRN NUM..."
                          value={supplierTrn}
                          onChange={(e) => setSupplierTrn(e.target.value.replace(/\D/g, '').substring(0, 15))}
                          data-header-row="8"
                          data-header-col="2"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 8, 2)}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Card: INVOICE & DOCUMENT REFERENCES */}
                <div className="lg:col-span-7 border-2 border-[#083c54] rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col justify-between">
                  {/* Header Bar */}
                  <div className="bg-[#083c54] px-3 py-1 flex items-center justify-between text-white shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">
                      INVOICE & DOCUMENT REFERENCES
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded border border-white/20">
                      PURCHASE INVOICE
                    </span>
                  </div>

                  {/* 2-Column Grid Fields */}
                  <div className="p-2 font-sans">
                    <div className="grid grid-cols-2 gap-1.5 text-left">
                      
                      {/* Row 1: INVOICE NO | DATED */}
                      {/* Row 1: INVOICE NO | DATED */}
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">INVOICE NO</span>
                        <input
                          type="text"
                          required
                          className="w-full bg-transparent border-none p-0 text-[11px] font-black text-[#083c54] uppercase tracking-wide focus:outline-none focus:ring-0 font-mono"
                          value={invoiceNo}
                          onChange={(e) => setInvoiceNo(e.target.value)}
                          placeholder="MF260353"
                          data-header-row="1"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 1, 1)}
                        />
                      </div>
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px] relative">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">DATED.</span>
                        <div className="flex items-center justify-between">
                          <input
                            type="date"
                            required
                            className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-0 font-mono cursor-pointer"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            data-header-row="1"
                            data-header-col="2"
                            onKeyDown={(e) => handleHeaderKeyDown(e, 1, 2)}
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-500 pointer-events-none shrink-0 ml-1" />
                        </div>
                      </div>

                      {/* Row 2: DELIVERY NOTE NO | MF PO NO */}
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">DELIVERY NOTE NO</span>
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-[11px] font-black text-slate-900 uppercase tracking-wide focus:outline-none focus:ring-0 font-mono"
                          value={deliveryNoteNo}
                          onChange={(e) => setDeliveryNoteNo(e.target.value)}
                          placeholder="MF26J353"
                          data-header-row="2"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 2, 1)}
                        />
                      </div>
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">MF PO NO</span>
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-800 uppercase focus:outline-none focus:ring-0 font-mono"
                          value={lpoRef}
                          onChange={(e) => setLpoRef(e.target.value)}
                          placeholder="—"
                          data-header-row="2"
                          data-header-col="2"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 2, 2)}
                        />
                      </div>

                      {/* Row 3: PAYMENT TERMS | CURRENCY */}
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT TERMS</span>
                        <input
                          type="text"
                          required
                          className="w-full bg-transparent border-none p-0 text-[11px] font-black text-[#083c54] uppercase tracking-wide focus:outline-none focus:ring-0 font-sans"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="IMMEDIATE"
                          data-header-row="3"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 3, 1)}
                        />
                      </div>
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px] relative">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">CURRENCY</span>
                        <div className="flex items-center justify-between">
                          <select
                            className="w-full bg-transparent border-none p-0 text-[11px] font-black text-[#f37021] focus:outline-none focus:ring-0 cursor-pointer uppercase font-sans appearance-none pr-4"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            data-header-row="3"
                            data-header-col="2"
                            onKeyDown={(e) => handleHeaderKeyDown(e, 3, 2)}
                          >
                            <option value="AED">AED</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="SAR">SAR</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[#f37021] pointer-events-none absolute right-1.5 bottom-1" />
                        </div>
                      </div>

                      {/* Row 4: PLACE OF SUPPLY | COUNTRY OF ORIGIN */}
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">PLACE OF SUPPLY</span>
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-900 uppercase focus:outline-none focus:ring-0 font-sans"
                          value={placeOfSupply}
                          onChange={(e) => setPlaceOfSupply(e.target.value.toUpperCase())}
                          placeholder="UAE"
                          data-header-row="4"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 4, 1)}
                        />
                      </div>
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">COUNTRY OF ORIGIN</span>
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-900 uppercase focus:outline-none focus:ring-0 font-sans"
                          value={countryOfOrigin}
                          onChange={(e) => setCountryOfOrigin(e.target.value.toUpperCase())}
                          placeholder="UAE"
                          data-header-row="4"
                          data-header-col="2"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 4, 2)}
                        />
                      </div>

                      {/* Row 5: H.S. CODE | DELIVERY TERMS */}
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">H.S. CODE</span>
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-[11px] font-black text-slate-900 uppercase tracking-wide focus:outline-none focus:ring-0 font-mono"
                          value={hsCode}
                          onChange={(e) => setHsCode(e.target.value.toUpperCase())}
                          placeholder="73181500"
                          data-header-row="5"
                          data-header-col="1"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 5, 1)}
                        />
                      </div>
                      <div className="bg-[#f4f7f9] border border-slate-300 rounded px-2 py-1 flex flex-col justify-center min-h-[34px]">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">DELIVERY TERMS</span>
                        <input
                          type="text"
                          className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-900 uppercase focus:outline-none focus:ring-0 font-sans"
                          value={deliveryTerms}
                          onChange={(e) => setDeliveryTerms(e.target.value.toUpperCase())}
                          placeholder="EX-WORKS"
                          data-header-row="5"
                          data-header-col="2"
                          onKeyDown={(e) => handleHeaderKeyDown(e, 5, 2)}
                        />
                      </div>

                    </div>
                  </div>
                </div>

              </div>

              {/* Section Header Line Divider Before Purchase UI Table Header */}
              <div className="flex items-center my-4 font-sans">
                <div className="flex-1 border-t-2 border-[#083c54]"></div>
                <span className="px-3.5 text-[11px] font-black text-[#083c54] uppercase tracking-widest italic bg-slate-50 py-1 rounded-full border border-slate-200">
                  PURCHASE TAX INVOICE LINE ITEMS
                </span>
                <div className="w-12 border-t-2 border-[#083c54]"></div>
              </div>

              {/* Line Items Table Requisition List */}
              <div className="py-5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9.5px] text-slate-450 font-bold uppercase tracking-widest flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                  </span>
                  {/* Excel Action Bar: Undo, Redo, Copy, Clear, Add Row */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-300">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={pastLineItems.length === 0}
                      className="px-2 py-1 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-[9px] uppercase border border-slate-300 rounded flex items-center gap-1 cursor-pointer transition-all"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="w-3 h-3 text-blue-600" /> Undo
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={futureLineItems.length === 0}
                      className="px-2 py-1 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-[9px] uppercase border border-slate-300 rounded flex items-center gap-1 cursor-pointer transition-all"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 className="w-3 h-3 text-blue-600" /> Redo
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-0.5"></div>
                    <button
                      type="button"
                      onClick={copyTableOrSelection}
                      className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[9px] uppercase border border-slate-300 rounded flex items-center gap-1 cursor-pointer transition-all"
                      title="Copy Selected Cells or Table"
                    >
                      <Copy className="w-3 h-3 text-purple-600" /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedCells}
                      disabled={!selectedCellRange}
                      className="px-2 py-1 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-[9px] uppercase border border-slate-300 rounded flex items-center gap-1 cursor-pointer transition-all"
                      title="Clear Cell Contents"
                    >
                      <Eraser className="w-3 h-3 text-amber-600" /> Clear
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

                    <button
                      type="button"
                      onClick={addLineItem}
                      className="px-3 py-1 bg-[#083c54] hover:bg-[#062c3e] text-white font-bold rounded text-[9px] uppercase flex items-center gap-1 cursor-pointer transition-all border-none"
                    >
                      <Plus className="w-3 h-3 text-[#f37021]" /> Add Row
                    </button>
                  </div>
                </div>
                <div className="w-full overflow-hidden border border-slate-300 rounded-lg">
                    <table className="w-full text-left uppercase table-fixed text-[10px]">
                      <thead className="bg-[#083c54] text-white text-[9px] font-black border-b border-slate-300 uppercase tracking-wider text-center h-7 font-sans">
                        <tr className="divide-x divide-slate-300/40">
                          <th className="w-[32px] p-1 text-center text-white font-black">S/L</th>
                          <th className="w-[28%] p-1 text-left pl-2 text-white font-black">GOODS / SERVICE DESCRIPTION</th>
                          <th className="w-[65px] p-1 text-center text-white font-black">FINISH</th>
                          <th className="w-[50px] p-1 text-center text-white font-black">UNIT</th>
                          <th className="w-[55px] p-1 text-right text-white font-black">QTY</th>
                          <th className="w-[70px] p-1 text-right text-white font-black">U. PRICE</th>
                          <th className="w-[75px] p-1 text-right text-white font-black">EXT. PRICE</th>
                          <th className="w-[55px] p-1 text-right text-white font-black">DISC.</th>
                          <th className="w-[80px] p-1 text-right text-white font-black">TOTAL EXCL. VAT</th>
                          <th className="w-[40px] p-1 text-center text-white font-black">VAT %</th>
                          <th className="w-[65px] p-1 text-right text-white font-black">VAT ({currency || 'AED'})</th>
                          <th className="w-[80px] p-1 text-right pr-2 text-white font-black">TOTAL ({currency || 'AED'})</th>
                          <th className="w-[32px] p-1 text-center text-white font-black">DEL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white" data-target="line-items-body" onPaste={handleTablePaste}>
                        {lineItems.map((item, idx) => {
                          const isExcluded = excludedPrintItemIds.includes(item.id);
                          const qtyNum = Number(item.qty || 0);
                          const priceNum = Number(item.unitPrice || 0);
                          const hasCalculation = (qtyNum > 0 || typeof item.qty === 'string') && priceNum > 0;

                          const itemAmount = hasCalculation ? qtyNum * priceNum : 0;
                          const itemDiscount = hasCalculation ? itemAmount * ((item.discount || 0) / 100) : 0;
                          const totalExclVat = hasCalculation ? itemAmount - itemDiscount : 0;
                          const itemVatRate = item.vatRate !== undefined ? item.vatRate : 5;
                          const vatAmount = (isExcluded || !hasCalculation) ? 0 : totalExclVat * (itemVatRate / 100);
                          const grossTotal = (isExcluded || !hasCalculation) ? 0 : totalExclVat + vatAmount;

                          return (
                            <tr
                              key={item.id}
                              className={`divide-x divide-slate-100 hover:bg-slate-50/80 transition-colors ${isExcluded ? 'bg-slate-55 opacity-40 line-through' : ''}`}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({ x: e.clientX, y: e.clientY, rowIndex: idx });
                              }}
                            >
                              
                              {/* S/L (S.NO index number only) */}
                              <td
                                className={`p-0.5 text-center min-w-[35px] font-mono font-bold text-slate-800 text-[9.5px] cursor-pointer select-none ${isCellSelected(idx, 0) && isCellSelected(idx, 10) ? 'bg-sky-200 text-sky-900 font-black' : 'bg-slate-50/10'}`}
                                onMouseDown={(e) => handleSelectRow(idx, e)}
                                title="Click to select row"
                              >
                                {idx + 1}
                              </td>
 
                              {/* Goods / Service Description with Autocomplete */}
                              <td
                                className={`p-0.5 relative transition-colors ${isCellSelected(idx, 0) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : ''}`}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 0)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 0)}
                              >
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder=""
                                    className="w-full border border-slate-200 focus:border-[#f37021] focus:ring-1 focus:ring-[#f37021] rounded px-2 py-1 text-[10px] uppercase font-bold focus:outline-none text-slate-800 bg-transparent hover:bg-white focus:bg-white transition-all relative z-10"
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      updateLineItem(item.id, {
                                        description: e.target.value,
                                        productId: undefined,
                                        balanceQty: 0
                                      });
                                    }}
                                    id={`desc-${item.id}`}
                                    data-row={idx}
                                    data-col={0}
                                    onKeyDown={(e) => handleItemKeyDown(e, idx, 0)}
                                  />
                                </div>
                                
                                {(() => {
                                  if (!item.productId) return null;
                                  const linkedProduct = flatProducts.find(p => p.id === item.productId);

                                  return (
                                    <div className="no-print mt-1 select-none font-sans flex flex-col gap-0.5 w-full max-w-lg">
                                      <div className="p-1 px-1.5 bg-blue-50/65 border border-blue-200/80 rounded-md text-left shadow-3xs relative flex items-center justify-between gap-2">
                                        <div className="font-mono font-bold text-[7.5px] tracking-tight leading-normal uppercase flex items-center select-all">
                                          {renderPurchaseProductDisplayWithColors(linkedProduct, item.qty)}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updateLineItem(item.id, {
                                              productId: undefined,
                                              balanceQty: 0,
                                              incomingStock: 0,
                                              balanceStock: item.qty
                                            });
                                          }}
                                          className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer border-none bg-transparent p-0 flex items-center justify-center shrink-0"
                                          title="Unlink Product"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* FINISH */}
                              <td
                                className={`p-0.5 text-center transition-colors ${isCellSelected(idx, 1) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : ''}`}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 1)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 1)}
                              >
                                <input
                                  type="text"
                                  placeholder=""
                                  className="w-full border-0 p-1 text-[10px] text-center font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 bg-transparent uppercase text-slate-800"
                                  value={item.finish || ''}
                                  onChange={(e) => updateLineItem(item.id, 'finish', e.target.value.toUpperCase())}
                                  data-row={idx}
                                  data-col={1}
                                  onKeyDown={(e) => handleItemKeyDown(e, idx, 1)}
                                />
                              </td>
 
                              {/* UNIT */}
                              <td
                                className={`p-0.5 text-center transition-colors ${isCellSelected(idx, 2) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : ''}`}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 2)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 2)}
                              >
                                <input
                                  type="text"
                                  placeholder=""
                                  className="w-full border-0 p-1 text-[10px] text-center font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 bg-transparent uppercase text-slate-800"
                                  value={item.unit || ''}
                                  onChange={(e) => {
                                    const u = e.target.value.toUpperCase();
                                    updateLineItem(item.id, {
                                      unit: u,
                                      per: u.toLowerCase()
                                    });
                                  }}
                                  data-row={idx}
                                  data-col={2}
                                  onKeyDown={(e) => handleItemKeyDown(e, idx, 2)}
                                />
                              </td>

                              {/* QTY */}
                              <td
                                className={`p-0.5 text-right transition-colors ${isCellSelected(idx, 3) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : 'bg-emerald-50/20'}`}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 3)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 3)}
                              >
                                <input
                                  type="text"
                                  placeholder=""
                                  className="w-full border-0 p-1 text-[10px] text-right font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-transparent text-emerald-800"
                                  value={item.qty === 0 || item.qty === undefined || item.qty === '' ? '' : item.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^[0-9.]*$/.test(val)) {
                                      updateLineItem(item.id, 'qty', val === '' ? '' : val);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const val = e.target.value;
                                    if (val !== '') {
                                      const parsed = parseFloat(val);
                                      if (!isNaN(parsed)) {
                                        updateLineItem(item.id, 'qty', parsed);
                                      } else {
                                        updateLineItem(item.id, 'qty', '');
                                      }
                                    } else {
                                      updateLineItem(item.id, 'qty', '');
                                    }
                                  }}
                                  data-row={idx}
                                  data-col={3}
                                  onKeyDown={(e) => handleItemKeyDown(e, idx, 3)}
                                />
                              </td>

                              {/* U. PRICE */}
                              <td
                                className={`p-0.5 text-right transition-colors ${isCellSelected(idx, 4) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : ''}`}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 4)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 4)}
                              >
                                <input
                                  type="text"
                                  placeholder=""
                                  className="w-full border-0 p-1 text-[10px] text-right font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 bg-transparent"
                                  value={item.unitPrice === 0 || item.unitPrice === undefined || item.unitPrice === '' ? '' : item.unitPrice}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^[0-9.]*$/.test(val)) {
                                      updateLineItem(item.id, 'unitPrice', val === '' ? '' : val);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const val = e.target.value;
                                    if (val !== '') {
                                      const parsed = parseFloat(val);
                                      if (!isNaN(parsed)) {
                                        updateLineItem(item.id, 'unitPrice', parsed);
                                      } else {
                                        updateLineItem(item.id, 'unitPrice', '');
                                      }
                                    } else {
                                      updateLineItem(item.id, 'unitPrice', '');
                                    }
                                  }}
                                  data-row={idx}
                                  data-col={4}
                                  onKeyDown={(e) => handleItemKeyDown(e, idx, 4)}
                                />
                              </td>

                              {/* EXT. PRICE (Col 5) */}
                              <td
                                tabIndex={0}
                                id={`ext-price-${item.id}`}
                                className={`p-1 text-right font-mono font-bold text-slate-700 text-[10px] pr-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded ${isCellSelected(idx, 5) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : 'bg-slate-50/20'}`}
                                data-row={idx}
                                data-col={5}
                                onKeyDown={(e) => handleItemKeyDown(e, idx, 5)}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 5)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 5)}
                                onClick={() => {
                                  setSelectedCellRange({ anchor: { row: idx, col: 5 }, focus: { row: idx, col: 5 } });
                                  focusCell(idx, 5);
                                }}
                              >
                                {hasCalculation ? itemAmount.toFixed(2) : ''}
                              </td>

                              {/* DISC. (Col 6) */}
                              <td
                                className={`p-0.5 text-right transition-colors ${isCellSelected(idx, 6) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : ''}`}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 6)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 6)}
                              >
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder=""
                                  className="w-full border-0 p-1 text-[10px] text-right font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 bg-transparent text-slate-800"
                                  value={item.discount || ''}
                                  onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || '')}
                                  data-row={idx}
                                  data-col={6}
                                  onKeyDown={(e) => handleItemKeyDown(e, idx, 6)}
                                />
                              </td>

                              {/* TOTAL EXCL. VAT (Col 7) */}
                              <td
                                tabIndex={0}
                                id={`tot-excl-vat-${item.id}`}
                                className={`p-1 text-right font-mono font-bold text-slate-800 text-[10px] pr-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded ${isCellSelected(idx, 7) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : 'bg-slate-50/10'}`}
                                data-row={idx}
                                data-col={7}
                                onKeyDown={(e) => handleItemKeyDown(e, idx, 7)}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 7)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 7)}
                                onClick={() => {
                                  setSelectedCellRange({ anchor: { row: idx, col: 7 }, focus: { row: idx, col: 7 } });
                                  focusCell(idx, 7);
                                }}
                              >
                                {hasCalculation ? totalExclVat.toFixed(2) : ''}
                              </td>

                              {/* VAT % (Col 8) */}
                              <td
                                tabIndex={0}
                                id={`vat-pct-${item.id}`}
                                className={`p-0.5 text-center font-bold text-[10px] text-slate-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded ${isCellSelected(idx, 8) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : ''}`}
                                data-row={idx}
                                data-col={8}
                                onKeyDown={(e) => handleItemKeyDown(e, idx, 8)}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 8)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 8)}
                                onClick={() => {
                                  setSelectedCellRange({ anchor: { row: idx, col: 8 }, focus: { row: idx, col: 8 } });
                                  focusCell(idx, 8);
                                }}
                              >
                                {hasCalculation ? `${itemVatRate}%` : ''}
                              </td>

                              {/* VAT (AED) (Col 9) */}
                              <td
                                tabIndex={0}
                                id={`vat-amt-${item.id}`}
                                className={`p-1 text-right font-mono font-bold text-rose-700 text-[10px] pr-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded ${isCellSelected(idx, 9) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : 'bg-slate-50/10'}`}
                                data-row={idx}
                                data-col={9}
                                onKeyDown={(e) => handleItemKeyDown(e, idx, 9)}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 9)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 9)}
                                onClick={() => {
                                  setSelectedCellRange({ anchor: { row: idx, col: 9 }, focus: { row: idx, col: 9 } });
                                  focusCell(idx, 9);
                                }}
                              >
                                {hasCalculation ? vatAmount.toFixed(2) : ''}
                              </td>

                              {/* TOTAL (AED) - Column 10 */}
                              <td
                                tabIndex={0}
                                id={`total-aed-${item.id}`}
                                className={`p-1 text-right font-mono font-bold text-slate-900 text-[10px] pr-2 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded cursor-pointer transition-colors ${isCellSelected(idx, 10) ? 'bg-sky-100/90 ring-2 ring-sky-500 z-10' : 'bg-slate-50/30'}`}
                                data-row={idx}
                                data-col={10}
                                onKeyDown={(e) => handleItemKeyDown(e, idx, 10)}
                                onMouseDown={(e) => handleCellMouseDown(e, idx, 10)}
                                onMouseEnter={() => handleCellMouseEnter(idx, 10)}
                                onClick={() => {
                                  setSelectedCellRange({ anchor: { row: idx, col: 10 }, focus: { row: idx, col: 10 } });
                                  focusCell(idx, 10);
                                }}
                              >
                                {hasCalculation ? grossTotal.toFixed(2) : ''}
                              </td>

                              {/* DEL ICON ON FAR RIGHT */}
                              <td className="p-0.5 text-center">
                                <button
                                  type="button"
                                  id={`btn-del-${item.id}`}
                                  onClick={() => removeLineItem(item.id)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 border-none bg-transparent cursor-pointer flex items-center justify-center mx-auto"
                                  title="Delete Row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>

                            </tr>
                          );
                        })}

                        {/* Total Quantity Row aligned with sheet table */}
                        <tr className="bg-slate-50 font-bold text-slate-800 border-t border-slate-300 h-8 text-center divide-x divide-slate-200">
                          <td colSpan={2} className="p-1 text-right pr-2 text-[9px] font-bold uppercase tracking-wider text-slate-900">
                            TOTAL QUANTITY:
                          </td>
                          <td colSpan={2} className="p-1 font-mono font-bold text-blue-900 text-[11px] bg-white text-right pr-2">
                            {lineItems.reduce((acc, item) => acc + (excludedPrintItemIds.includes(item.id) ? 0 : Number(item.qty || 0)), 0)}
                          </td>
                          <td className="p-1 text-[9px] font-bold text-slate-500 bg-white uppercase text-center">
                          </td>
                          <td colSpan={8} className="p-1 bg-slate-50/10"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {purchaseEnterPromptActive && (
                  <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 text-white p-4 shadow-2xl z-50 flex flex-col sm:flex-row items-center gap-4 rounded-lg animate-bounce max-w-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">End box reached</span>
                      <span className="text-[11px] font-bold">Add a new row to purchase list?</span>
                      <span className="text-[8px] text-slate-400 mt-0.5 font-mono uppercase">Use ◄ ► & Enter to decide</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        ref={purchaseAddRowButtonRef}
                        type="button"
                        onClick={() => {
                          const newId = Date.now().toString();
                          setLineItems(prev => [
                            ...prev,
                            { id: newId, description: '', qty: 0, unit: '', unitPrice: 0, per: '', vatRate: 5 }
                          ]);
                          setPurchaseEnterPromptActive(false);
                          setTimeout(() => {
                            focusCell(lineItems.length, 0);
                          }, 100);
                        }}
                        className={purchasePromptSelection === 'add' ? "bg-orange-600 border-2 border-amber-300 ring-4 ring-orange-400 scale-110 text-white px-3 py-1.5 text-[10px] font-extrabold rounded cursor-pointer transition-all uppercase" : "bg-orange-950 text-orange-400 opacity-50 border border-orange-900 px-3 py-1.5 text-[10px] font-bold rounded cursor-pointer transition-all uppercase"}
                      >
                        Add Row
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPurchaseEnterPromptActive(false);
                        }}
                        className={purchasePromptSelection === 'cancel' ? "bg-slate-700 border-2 border-slate-300 ring-4 ring-slate-400 scale-110 text-white px-3 py-1.5 text-[10px] font-extrabold rounded cursor-pointer transition-all uppercase" : "bg-slate-800 text-slate-400 opacity-50 border border-slate-700 px-3 py-1.5 text-[10px] font-bold rounded cursor-pointer transition-all uppercase"}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              {/* AMOUNT IN WORDS, BANK DETAILS & SUMMARY BOX */}
              <div className="grid grid-cols-12 border border-[#1e3a8a] text-[11px] font-sans bg-white rounded-lg overflow-hidden my-4 shadow-sm">
                
                {/* Words block & Bank Details left */}
                <div className="col-span-12 md:col-span-7 p-3 border-b md:border-b-0 md:border-r border-[#1e3a8a] flex flex-col justify-between space-y-3 bg-slate-50/20">
                  <div className="font-sans">
                    <span className="text-[9.5px] font-bold text-black uppercase tracking-wider block mb-0.5">
                      AMOUNT IN WORDS:
                    </span>
                    <div className="font-extrabold text-[#083c54] text-[12px] tracking-wide leading-snug uppercase font-sans">
                      {numberToAEDWords(calculatedTotal)}
                    </div>
                  </div>
                </div>

                {/* Right: Quotation Format Summary Table Box */}
                <div className="col-span-12 md:col-span-5 p-1 flex flex-col justify-center">
                  <table className="w-full border-collapse text-[11px] border border-[#1e3a8a] font-sans bg-white">
                    <tbody>
                      <tr className="border-b border-[#1e3a8a]">
                        <td className="p-1.5 font-bold border-r border-[#1e3a8a] text-slate-800">TOTAL IN {currency || 'AED'} :</td>
                        <td className="p-1.5 text-right font-mono font-bold text-slate-900">{calculatedSubtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-[#1e3a8a]">
                        <td className="p-1.5 font-sans border-r border-[#1e3a8a]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">DISCOUNT IN {currency || 'AED'} :</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                step="0.01"
                                value={discount || ''} 
                                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                                className="w-12 p-0.5 text-right border border-slate-300 font-mono font-bold text-xs rounded-xs" 
                              />
                              <span className="text-[10px] text-slate-500 font-bold">%</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold text-rose-700">({discountAmount.toFixed(2)})</td>
                      </tr>
                      <tr className="border-b border-[#1e3a8a]">
                        <td className="p-1.5 font-sans border-r border-[#1e3a8a]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">FREIGHT/EXTRA CHARGES IN {currency || 'AED'} :</span>
                            <input 
                              type="number" 
                              step="0.01"
                              value={freightShipping || ''} 
                              onChange={(e) => setFreightShipping(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-16 p-0.5 text-right border border-slate-300 font-mono font-bold text-xs rounded-xs" 
                            />
                          </div>
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold text-slate-900">{Number(freightShipping || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-[#1e3a8a]">
                        <td className="p-1.5 font-bold border-r border-[#1e3a8a] text-slate-800">TOTAL {currency || 'AED'} BEFORE TAX :</td>
                        <td className="p-1.5 text-right font-mono font-bold text-slate-900">{netTaxableValue.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-[#1e3a8a]">
                        <td className="p-1.5 font-sans border-r border-[#1e3a8a] text-slate-700">5% TAX AMOUNT IN {currency || 'AED'} :</td>
                        <td className="p-1.5 text-right font-mono font-bold text-slate-900">{calculatedVat.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-100 font-bold">
                        <td className="p-1.5 text-[11.5px] border-r border-[#1e3a8a] text-[#1e3a8a]">TOTAL AMOUNT IN {currency || 'AED'} :</td>
                        <td className="p-1.5 text-right text-[12.5px] font-mono text-[#1e3a8a]">{calculatedTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* END PAGE: ADDITIONAL NOTES & LOGISTICS DETAILS BOX */}
              <div className="border border-[#083c54] rounded-lg p-3.5 bg-slate-50/50 my-4 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-[#083c54]/30 pb-2">
                  <span className="text-[10px] font-black text-[#083c54] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#f37021]" />
                    End Page Logistics &amp; Additional Notes
                  </span>
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase">(Appears on purchase print PDF)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px]">
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-600 uppercase mb-0.5">Transporter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. MFI LOGISTICS / DHL"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-[#083c54]"
                      value={transporterName}
                      onChange={(e) => setTransporterName(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-600 uppercase mb-0.5">Date</label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-[#083c54]"
                      value={transporterDate}
                      onChange={(e) => setTransporterDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-600 uppercase mb-0.5">Airway Bill No</label>
                    <input
                      type="text"
                      placeholder="e.g. AWB-998822"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-[#083c54]"
                      value={airwayBillNo}
                      onChange={(e) => setAirwayBillNo(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-600 uppercase mb-0.5">Freight Amount ({currency || 'AED'})</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-[#083c54]"
                      value={transporterAmount}
                      onChange={(e) => setTransporterAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] font-bold text-slate-600 uppercase mb-0.5">Additional Notes Box</label>
                  <textarea
                    rows={2}
                    placeholder="Enter any additional instructions, delivery terms, or notes..."
                    className="w-full border border-slate-300 rounded p-2 text-[10px] font-medium focus:outline-none focus:border-[#083c54] uppercase bg-white"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Corporate Authenticity Approval Workflow Section */}
              <div className="pt-6 pb-2 border-t border-slate-200 mt-6 bg-slate-50/50 rounded-xl p-4 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PREPARED BY BOX */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-3xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Prepared By
                      </label>
                      <span className="text-[8px] text-slate-400 font-mono">PURCHASE CONTROLLER</span>
                    </div>
                    <input
                      type="text"
                      placeholder="PURCHASE CONTROLLER..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-[10px] font-bold text-slate-900 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white transition-colors"
                      value={preparedByName}
                      onChange={(e) => setPreparedByName(e.target.value.toUpperCase())}
                    />
                  </div>

                  {/* CHECKED BY BOX */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-3xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Checked By
                      </label>
                      <span className="text-[8px] text-slate-400 font-mono">PURCHASE DIRECTOR</span>
                    </div>
                    <input
                      type="text"
                      placeholder="PURCHASE DIRECTOR..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-[10px] font-bold text-slate-900 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white transition-colors"
                      value={checkedByName}
                      onChange={(e) => setCheckedByName(e.target.value.toUpperCase())}
                    />
                  </div>

                  {/* APPROVED BY BOX */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-3xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Approved By
                      </label>
                      <span className="text-[8px] text-slate-400 font-mono">MANAGEMENT AUTHORIZATION</span>
                    </div>
                    <input
                      type="text"
                      placeholder="GENERAL MANAGER..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-[10px] font-bold text-slate-900 uppercase focus:outline-none focus:border-[#083c54] focus:bg-white transition-colors"
                      value={approvedByName}
                      onChange={(e) => setApprovedByName(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons bar */}
            <div className="flex items-center justify-end gap-3 w-full pt-2 pb-8">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
              >
                Reset Sheet
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 text-white border border-slate-950 hover:bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all hover:translate-y-[-1px]"
              >
                <Save className="w-3.5 h-3.5 text-[#f37021]" />
                Issue & Save Invoice
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tab 2: Purchase Records Ledger */}
      {activeTab === 'records' && (
        <div className="space-y-3">
          {/* Filtering Header bar & Stats (Single compact toolbar row) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 shadow-3xs font-sans space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search text filter */}
              <div className="relative min-w-[180px] max-w-xs flex-1">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice or supplier..."
                  className="w-full bg-white border border-slate-300 pl-8 pr-2 py-1 rounded text-[10px] uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-slate-500 font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="h-4 w-[1px] bg-slate-250 hidden sm:block" />

              {/* Supplier dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Supplier:</span>
                <select
                  className="bg-white border border-slate-300 px-2 py-1 rounded text-[9.5px] font-bold text-slate-800 uppercase focus:outline-none"
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                >
                  <option value="ALL">ALL SUPPLIERS</option>
                  {uniqueSuppliers.map((sup, idx) => (
                    <option key={idx} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-[1px] bg-slate-250 hidden md:block" />

              {/* Payment Status dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status:</span>
                <select
                  className="bg-white border border-slate-300 px-2 py-1 rounded text-[9.5px] font-bold text-slate-800 focus:outline-none"
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="Paid">FULLY PAID</option>
                  <option value="Partial">PARTIALLY PAID</option>
                  <option value="Pending">PENDING LIABILITY</option>
                </select>
              </div>

              {(searchQuery || filterSupplier !== 'ALL' || filterPayment !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterSupplier('ALL');
                    setFilterPayment('ALL');
                  }}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-2 py-0.5 rounded text-[8.5px] font-bold uppercase cursor-pointer transition-all ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Records Stats Compact Summary Cards (No black background, clean & small) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 shadow-3xs flex items-center justify-between">
              <div>
                <div className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">TOTAL EXCL. VAT</div>
                <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">AED {totalFilteredSubtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400 opacity-70" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 shadow-3xs flex items-center justify-between">
              <div>
                <div className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">INPUT VAT (5%)</div>
                <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">AED {totalFilteredVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <FileCheck className="w-4 h-4 text-emerald-500 opacity-70" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 shadow-3xs flex items-center justify-between">
              <div>
                <div className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">TOTAL SPEND (INCL. VAT)</div>
                <div className="text-xs font-bold font-mono text-indigo-700 mt-0.5">AED {totalFilteredAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <DollarSign className="w-4 h-4 text-indigo-500 opacity-70" />
            </div>
          </div>

          {/* Table list of purchase invoices */}
          <div className="box-shaped bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="box-shaped-table w-full text-left font-sans text-[10.5px] uppercase min-w-[700px]">
                <thead>
                  <tr>
                    <th className="p-2.5 w-[160px] text-center">PO / LPO NO</th>
                    <th className="p-2.5 w-[110px] text-center">DATE</th>
                    <th className="p-2.5 text-left">SUPPLIER NAME</th>
                    <th className="p-2.5 w-[110px] text-center">STATUS</th>
                    <th className="p-2.5 w-[120px] text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400 italic bg-slate-50">
                        No purchase records matched the specified search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((pur, idx) => {
                      const isSelected = selectedPurRowIndex === idx;
                      return (
                        <tr 
                          key={pur.id} 
                          onClick={() => setSelectedPurRowIndex(idx)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-amber-50/80 ring-1 ring-amber-400 font-semibold' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="p-2.5 text-center font-mono font-bold text-indigo-600 tracking-wide">{pur.invoiceNo}</td>
                          <td className="p-2.5 text-center font-mono text-slate-600">{pur.invoiceDate}</td>
                          <td className="p-2.5 font-bold text-slate-900">
                            <div>{pur.supplierName}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-bold tracking-wide uppercase ${
                              pur.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              pur.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {pur.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePrintPurchase(pur, false); }}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-all cursor-pointer"
                              title="Preview Purchase Layout"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePrintPurchase(pur, false); }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all cursor-pointer"
                              title="Print Supplier Line Items (Manual Only)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePrintPurchase(pur, true); }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-all cursor-pointer"
                              title="Print with System-Linked Inventory"
                            >
                              <div className="relative">
                                <Printer className="w-3.5 h-3.5 text-blue-700" />
                                <span className="absolute -bottom-1 -right-1 text-[7px] bg-orange-500 text-white rounded-full px-0.5 scale-90 font-semibold leading-none">L</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeletePurchase(pur.id); }}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded transition-all cursor-pointer"
                              title="Delete Acquisition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* TALLY SHORTCUTS BAR FOR PURCHASE RECORDS */}
            <div className="mt-2 border-t border-slate-200">
              <RecordsFooterShortcutsBar
                onQuit={() => {
                  localStorage.setItem('mf_erp_active_tab', 'home');
                  window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'home' }));
                  window.dispatchEvent(new Event('storage'));
                }}
                onSelectColumn={() => {
                  if (filteredPurchases.length > 0) {
                    setSelectedPurRowIndex(prev => (prev + 1) % filteredPurchases.length);
                  }
                }}
                selectColumnLabel="Select Row"
                onDrillDown={() => {
                  const sel = filteredPurchases[selectedPurRowIndex];
                  if (sel) {
                    handlePrintPurchase(sel, false);
                  }
                }}
                drillDownLabel="Drill Down (View)"
                fromDate={purFromDate}
                toDate={purToDate}
                onDateRangeChange={(from, to) => {
                  setPurFromDate(from);
                  setPurToDate(to);
                }}
                onRemoveLine={() => {
                  if (hiddenPurIds.length > 0) {
                    setHiddenPurIds([]);
                    triggerToast('All hidden purchase lines restored.');
                  } else {
                    const sel = filteredPurchases[selectedPurRowIndex];
                    if (sel) {
                      setHiddenPurIds(prev => [...prev, sel.id]);
                      triggerToast(`Purchase ${sel.invoiceNo} hidden from view (Press U to restore).`);
                    }
                  }
                }}
                isLineRemoved={hiddenPurIds.length > 0}
                removeLineLabel="Remove Line"
                restoreLineLabel="Restore Line"
                onPrint={handlePrintPurchasesLedger}
                totalRecordsCount={filteredPurchases.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: UAE VAT Return Reports (Form VAT201) - FOCUS ERP 9 */}
      {activeTab === 'vat' && (
        <div className="space-y-4">
          {/* Focus ERP 9 Control Toolbar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm font-sans space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f37021] text-white rounded-lg shadow-sm">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-black text-white uppercase tracking-wider font-mono">UAE VAT RETURN (FORM VAT201)</h2>
                    <span className="bg-[#f37021] text-white text-[8px] font-black px-2 py-0.5 rounded tracking-widest">VAT 201</span>
                  </div>
                  <p className="text-[9.5px] text-slate-300 mt-0.5">
                    Official UAE Federal Tax Authority (FTA) format as per tax engine specifications
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintVatReturn}
                  className="px-4 py-2 bg-[#f37021] hover:bg-[#d95f17] text-white font-black rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  <Printer className="w-4 h-4 text-white" /> Print VAT Return (PDF)
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {/* Date From */}
              <div className="space-y-1">
                <label className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider block">Tax Period From:</label>
                <input
                  type="date"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-[10px] font-mono focus:outline-none focus:border-[#f37021]"
                  value={vatFromDate}
                  onChange={(e) => setVatFromDate(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-1">
                <label className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider block">Tax Period To:</label>
                <input
                  type="date"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-[10px] font-mono focus:outline-none focus:border-[#f37021]"
                  value={vatToDate}
                  onChange={(e) => setVatToDate(e.target.value)}
                />
              </div>

              {/* Emirate Filter */}
              <div className="space-y-1">
                <label className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider block">Filter Emirate:</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-[10px] font-bold uppercase focus:outline-none focus:border-[#f37021]"
                  value={vatEmirateFilter}
                  onChange={(e) => setVatEmirateFilter(e.target.value)}
                >
                  <option value="ALL">ALL EMIRATES (CONSOLIDATED)</option>
                  <option value="Abu Dhabi">ABU DHABI</option>
                  <option value="Dubai">DUBAI</option>
                  <option value="Sharjah">SHARJAH</option>
                  <option value="Ajman">AJMAN (PRIMARY UNIT)</option>
                  <option value="Umm Al Quwain">UMM AL QUWAIN</option>
                  <option value="Ras Al Khaimah">RAS AL KHAIMAH</option>
                  <option value="Fujairah">FUJAIRAH</option>
                </select>
              </div>

              {/* Include Annexure Toggle */}
              <div className="space-y-1">
                <label className="text-[8.5px] font-bold text-slate-300 uppercase tracking-wider block">Audit Schedule Annexure:</label>
                <button
                  type="button"
                  onClick={() => setVatIncludeAnnexure(!vatIncludeAnnexure)}
                  className={`w-full py-1 px-3 rounded text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                    vatIncludeAnnexure
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {vatIncludeAnnexure ? '✓ Include Vouchers Schedule' : '✕ Form VAT201 Only'}
                </button>
              </div>
            </div>
          </div>

          {/* Focus ERP 9 VAT Return Layout Preview */}
          <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-md select-none">
            {/* Header Banner */}
            <div className="bg-[#0b2136] border-b-4 border-[#f37021] text-white p-4 flex flex-wrap justify-between items-center font-sans">
              <div>
                <div className="text-sm font-black tracking-wide text-white">UAE VAT RETURN FORM (VAT201)</div>
                <div className="text-[9px] text-slate-300 font-bold mt-0.5">STATE OF UNITED ARAB EMIRATES | FEDERAL TAX AUTHORITY (FTA) ENGINE</div>
              </div>
              <div className="text-right">
                <span className="bg-[#f37021] text-white font-black text-[9px] px-2.5 py-1 rounded">OFFICIAL TAX ENGINE</span>
                <div className="text-[8px] text-slate-400 font-mono mt-1">PERIOD: {vatFromDate} TO {vatToDate}</div>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Company Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-[#0b2136] text-[10.5px] border-b border-slate-200 pb-1 uppercase">1. Taxable Person Details</div>
                  <div><strong>Taxable Person Name:</strong> {activeCompany.name}</div>
                  <div><strong>TRN (Tax Registration No):</strong> {activeCompany.trn || '100440509600003'}</div>
                  <div><strong>Registered Office:</strong> {activeCompany.address}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-[#0b2136] text-[10.5px] border-b border-slate-200 pb-1 uppercase">2. Return Audit Summary</div>
                  <div><strong>Sales Invoices Reconciled:</strong> {vatStats.salesList.length} Tax Invoices</div>
                  <div><strong>Purchase Bills Reconciled:</strong> {vatStats.purchasesList.length} Supplier Bills</div>
                  <div><strong>Selected Scope:</strong> {vatEmirateFilter === 'ALL' ? 'All Emirates Combined' : vatEmirateFilter}</div>
                </div>
              </div>

              {/* Section 1: Output Tax Table */}
              <div>
                <div className="bg-[#0b2136] text-white font-bold text-[10px] px-3 py-1.5 uppercase tracking-wider flex justify-between rounded-t">
                  <span>3. VAT on Sales and all other Outputs (Output Tax)</span>
                  <span className="text-[#f37021]">Section A</span>
                </div>
                <table className="w-full text-[10px] uppercase border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[8.5px] font-bold border-b border-slate-200">
                      <th className="p-2 text-center w-12 border-r border-slate-200">Box</th>
                      <th className="p-2 text-left border-r border-slate-200">Description of Taxable Supplies</th>
                      <th className="p-2 text-right w-36 border-r border-slate-200">Net Amount (AED)</th>
                      <th className="p-2 text-right w-32 border-r border-slate-200">VAT Amount (AED)</th>
                      <th className="p-2 text-right w-20">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map((em, idx) => {
                      const boxCode = `1${String.fromCharCode(97 + idx)}`;
                      return (
                        <tr key={em} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-200">{boxCode}</td>
                          <td className="p-2 border-r border-slate-200">
                            Standard Rated Supplies in {em} {em === 'Ajman' && <span className="text-[8px] text-indigo-600 font-bold">(Primary Factory)</span>}
                          </td>
                          <td className="p-2 text-right font-mono border-r border-slate-200">{vatStats.emirateTotals[em].excl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-2 text-right font-mono font-bold text-[#0b2136] border-r border-slate-200">{vatStats.emirateTotals[em].vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-2 text-right text-slate-500">5.00%</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="p-2 text-center font-black text-[#0b2136] border-r border-slate-200">8</td>
                      <td className="p-2 text-[#0b2136] font-black border-r border-slate-200">TOTAL OUTPUT TAX DUE (BOX 1 TO 7)</td>
                      <td className="p-2 text-right font-mono font-black border-r border-slate-200">{vatStats.salesExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-2 text-right font-mono font-black text-[#0b2136] border-r border-slate-200">AED {vatStats.salesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Input Tax Table */}
              <div>
                <div className="bg-indigo-900 text-white font-bold text-[10px] px-3 py-1.5 uppercase tracking-wider flex justify-between rounded-t">
                  <span>4. VAT on Expenses and Acquisitions (Input Tax)</span>
                  <span className="text-emerald-400">Section B</span>
                </div>
                <table className="w-full text-[10px] uppercase border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[8.5px] font-bold border-b border-slate-200">
                      <th className="p-2 text-center w-12 border-r border-slate-200">Box</th>
                      <th className="p-2 text-left border-r border-slate-200">Description of Expenditures & Acquisitions</th>
                      <th className="p-2 text-right w-36 border-r border-slate-200">Net Expenses (AED)</th>
                      <th className="p-2 text-right w-32 border-r border-slate-200">VAT Recoverable (AED)</th>
                      <th className="p-2 text-right w-20">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-200">9</td>
                      <td className="p-2 border-r border-slate-200">Standard Rated Expenses & Supplier Purchases (5% Input Tax)</td>
                      <td className="p-2 text-right font-mono border-r border-slate-200">{vatStats.purchasesExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700 border-r border-slate-200">{vatStats.purchasesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-2 text-right text-slate-500">5.00%</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="p-2 text-center font-black text-emerald-800 border-r border-slate-200">11</td>
                      <td className="p-2 text-emerald-800 font-black border-r border-slate-200">TOTAL RECOVERABLE INPUT TAX (BOX 9 + 10)</td>
                      <td className="p-2 text-right font-mono font-black border-r border-slate-200">{vatStats.purchasesExcl.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-2 text-right font-mono font-black text-emerald-700 border-r border-slate-200">AED {vatStats.purchasesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Consolidated Summary Banner */}
              <div className={`rounded-xl p-5 border-2 text-center space-y-2 font-mono ${
                vatStats.netPayable >= 0
                  ? 'border-rose-300 bg-rose-50 text-rose-900'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-900'
              }`}>
                <div className="text-xs font-black uppercase tracking-widest">CONSOLIDATED NET VAT STATUS</div>
                
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-2 text-[10px] font-bold text-slate-700 border-b border-dashed border-slate-300 pb-3">
                  <div className="text-left">TOTAL OUTPUT VAT DUE (BOX 8):</div>
                  <div className="text-right font-mono text-rose-700">AED {vatStats.salesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  
                  <div className="text-left">TOTAL INPUT VAT RECOVERABLE (BOX 11):</div>
                  <div className="text-right font-mono text-emerald-700">AED {vatStats.purchasesVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="text-sm font-black pt-2">
                  {vatStats.netPayable >= 0 ? (
                    <span className="text-rose-700">NET VAT PAYABLE TO FEDERAL TAX AUTHORITY: AED {vatStats.netPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  ) : (
                    <span className="text-emerald-700 font-black">NET VAT RECOVERABLE / REFUNDABLE FROM GOVERNMENT: AED {Math.abs(vatStats.netPayable).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  )}
                </div>
                <div className="text-[8.5px] text-slate-500 font-sans tracking-wide">Ready for print PDF output as per UAE FTA standards</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* AJMAN CENTRAL INVENTORY SYSTEM LINK MODAL (PURCHASES) */}
      {/* ========================================================= */}
      {activePickerLineItemId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 no-print select-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[88vh] flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f37021] text-white rounded-xl shadow-md">
                  <Layers className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-white flex items-center gap-2">
                    <span>MFI AJMAN CENTRAL STOCK MAPPING TERMINAL (PURCHASE)</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">Incoming Controller</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Map supplier items, update incoming inventory specifications, and record stock tallies in real-time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePickerLineItemId(null)}
                className="text-slate-300 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center border border-slate-700 hover:border-slate-500 bg-slate-800 hover:bg-slate-750 transition-all font-bold cursor-pointer"
                title="Close Terminal"
              >
                ✕
              </button>
            </div>

            {/* Horizontal Unified Flow Workspace */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50 p-6 space-y-5">
              


              {/* Horizontal 5-Step Selector Grid */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-2 shadow-3xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-slate-800 shrink-0">
                
                {/* Step 1: Thread Division */}
                <div className="space-y-1">
                  <label className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                    Division
                  </label>
                  <div className="grid grid-cols-2 bg-slate-50 p-0.5 rounded-md border border-slate-200">
                    {['Standard', 'Fine'].map((div) => (
                      <button
                        key={div}
                        type="button"
                        onClick={() => {
                          setSelectedMappingDivision(div as 'Standard' | 'Fine');
                          setSelectedMappingCatId('');
                          setSelectedMappingSubCatId('');
                          setSelectedMappingThreadTypeId('');
                          setSelectedMappingGradeId('');
                        }}
                        className={`py-0.5 text-[8.5px] font-bold uppercase rounded transition-all cursor-pointer ${
                          selectedMappingDivision === div
                            ? 'bg-slate-900 text-white shadow-3xs'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                      >
                        {div === 'Standard' ? 'Metric' : 'Fine'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Category Selector */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                      Stock Category
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCat(!isAddingCat);
                        setNewStructureName('');
                      }}
                      className="text-[8px] font-bold text-emerald-600 hover:text-emerald-700 uppercase flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                    >
                      <Plus className="w-2 h-2" /> ADD
                    </button>
                  </div>
                  <select
                    className="w-full bg-white border border-slate-200 hover:border-orange-500 text-slate-800 rounded-md px-1.5 py-1 text-[10px] font-bold outline-none uppercase transition-all cursor-pointer shadow-3xs"
                    value={selectedMappingCatId}
                    onChange={(e) => {
                      setSelectedMappingCatId(e.target.value);
                      setSelectedMappingSubCatId('');
                      setSelectedMappingThreadTypeId('');
                      setSelectedMappingGradeId('');
                    }}
                  >
                    <option value="">— CHOOSE CATEGORY —</option>
                    {(fullCategories[selectedMappingDivision] || []).map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Subcategory Selector */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                      Subcategory
                    </label>
                    {selectedMappingCatId && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSubCat(!isAddingSubCat);
                          setNewStructureName('');
                        }}
                        className="text-[8px] font-bold text-emerald-600 hover:text-emerald-700 uppercase flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                      >
                        <Plus className="w-2 h-2" /> ADD
                      </button>
                    )}
                  </div>
                  <select
                    className="w-full bg-white border border-slate-200 hover:border-orange-500 text-slate-800 rounded-md px-1.5 py-1 text-[10px] font-bold outline-none uppercase disabled:opacity-45 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-3xs"
                    disabled={!selectedMappingCatId}
                    value={selectedMappingSubCatId}
                    onChange={(e) => {
                      setSelectedMappingSubCatId(e.target.value);
                      setSelectedMappingThreadTypeId('');
                      setSelectedMappingGradeId('');
                    }}
                  >
                    <option value="">— CHOOSE SUBCATEGORY —</option>
                    {selectedMappingCatId &&
                      ((fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId))?.subcategories || []).map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                  </select>
                </div>

                {/* Step 4: Thread Type Selector */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                      Thread Series
                    </label>
                    {selectedMappingSubCatId && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingThreadType(!isAddingThreadType);
                          setNewStructureName('');
                        }}
                        className="text-[8px] font-bold text-emerald-600 hover:text-emerald-700 uppercase flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                      >
                        <Plus className="w-2 h-2" /> ADD
                      </button>
                    )}
                  </div>
                  <select
                    className="w-full bg-white border border-slate-200 hover:border-orange-500 text-slate-800 rounded-md px-1.5 py-1 text-[10px] font-bold outline-none uppercase disabled:opacity-45 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-3xs"
                    disabled={!selectedMappingSubCatId}
                    value={selectedMappingThreadTypeId}
                    onChange={(e) => {
                      setSelectedMappingThreadTypeId(e.target.value);
                      setSelectedMappingGradeId('');
                    }}
                  >
                    <option value="">— ALL THREAD SERIES —</option>
                    {selectedMappingSubCatId &&
                      (() => {
                        const catObj = (fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId));
                        const subObj = (catObj?.subcategories || []).find((s: any) => String(s.id) === String(selectedMappingSubCatId));
                        return (subObj?.threadTypes || []).map((tt: any) => (
                          <option key={tt.id} value={tt.id}>{tt.name}</option>
                        ));
                      })()}
                  </select>
                </div>

                {/* Step 5: Grade Selector */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                      Technical Grade
                    </label>
                    {selectedMappingThreadTypeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingGrade(!isAddingGrade);
                          setNewStructureName('');
                        }}
                        className="text-[8px] font-bold text-emerald-600 hover:text-emerald-700 uppercase flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                      >
                        <Plus className="w-2 h-2" /> ADD
                      </button>
                    )}
                  </div>
                  <select
                    className="w-full bg-white border border-slate-200 hover:border-orange-500 text-slate-800 rounded-md px-1.5 py-1 text-[10px] font-bold outline-none uppercase disabled:opacity-45 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-3xs"
                    disabled={!selectedMappingThreadTypeId}
                    value={selectedMappingGradeId}
                    onChange={(e) => setSelectedMappingGradeId(e.target.value)}
                  >
                    <option value="">— ALL GRADES —</option>
                    {selectedMappingThreadTypeId &&
                      (() => {
                        const catObj = (fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId));
                        const subObj = (catObj?.subcategories || []).find((s: any) => String(s.id) === String(selectedMappingSubCatId));
                        const ttObj = (subObj?.threadTypes || []).find((t: any) => String(t.id) === String(selectedMappingThreadTypeId));
                        return (ttObj?.grades || []).map((g: any) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ));
                      })()}
                  </select>
                </div>

              </div>

              {/* Dynamic Overlay & Absolute Popover Forms Row */}
              {(isAddingCat || isAddingSubCat || isAddingThreadType || isAddingGrade) && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-3xs animate-in slide-in-from-top-1 text-slate-800 shrink-0">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>CREATING NEW DATABASE ENTRY:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      className="flex-1 border border-slate-300 px-3 py-2 text-xs uppercase font-bold rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800 shadow-3xs"
                      placeholder={
                        isAddingCat ? "e.g. Washers..." :
                        isAddingSubCat ? "e.g. Hex Bolts..." :
                        isAddingThreadType ? "e.g. Metric Coarse..." :
                        "e.g. Grade 8.8..."
                      }
                      value={newStructureName}
                      onChange={(e) => setNewStructureName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newStructureName.trim()) return;
                          if (isAddingCat) handleAddCategoryFromPopup(newStructureName);
                          else if (isAddingSubCat) handleAddSubcategoryFromPopup(newStructureName);
                          else if (isAddingThreadType) handleAddThreadTypeFromPopup(newStructureName);
                          else if (isAddingGrade) handleAddGradeFromPopup(newStructureName);
                          setNewStructureName('');
                          setIsAddingCat(false);
                          setIsAddingSubCat(false);
                          setIsAddingThreadType(false);
                          setIsAddingGrade(false);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 text-xs rounded-xl cursor-pointer border-none uppercase shadow-sm active:scale-95 transition-all"
                      >
                        Save Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewStructureName('');
                          setIsAddingCat(false);
                          setIsAddingSubCat(false);
                          setIsAddingThreadType(false);
                          setIsAddingGrade(false);
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 text-xs rounded-xl cursor-pointer border-none uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Path Breadcrumbs & Reset Row */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between shrink-0">
                <div className="flex-1 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase bg-white border border-slate-200 shadow-3xs rounded-xl px-4 py-2.5 text-slate-700">
                  <span className="font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    EXPLORER PATH:
                  </span>
                  <span className="text-blue-750 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {selectedMappingDivision === 'Standard' ? 'Standard Metric' : 'Fine Thread'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-800 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    {((fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId))?.name) || 'All Categories'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-800 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    {(((fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId))?.subcategories || []).find((s: any) => String(s.id) === String(selectedMappingSubCatId))?.name) || 'All Subcategories'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-[#FF6B00] font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                    {(((fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId))?.subcategories || []).find((s: any) => String(s.id) === String(selectedMappingSubCatId))?.threadTypes || []).find((t: any) => String(t.id) === String(selectedMappingThreadTypeId))?.grades?.find((g: any) => String(g.id) === String(selectedMappingGradeId))?.name || 'All Grades'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMappingCatId('');
                    setSelectedMappingSubCatId('');
                    setSelectedMappingThreadTypeId('');
                    setSelectedMappingGradeId('');
                    setPickerSearchTerm('');
                  }}
                  className="py-2.5 px-5 bg-white hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              </div>

              {/* Excel-Style 1-Line Stock Entry if Grade is Selected */}
              {selectedMappingGradeId && (() => {
                const categoriesOfDivision = fullCategories[selectedMappingDivision] || [];
                const activeCategory = categoriesOfDivision.find(c => String(c.id) === String(selectedMappingCatId));
                const activeSubcategory = activeCategory?.subcategories?.find((s: any) => String(s.id) === String(selectedMappingSubCatId));
                const isNutCategory = 
                  (activeCategory?.name || '').toUpperCase().includes('NUT') || 
                  (activeSubcategory?.name || '').toUpperCase().includes('NUT');

                return (
                  <div className="bg-slate-900 border border-slate-950 text-white rounded-xl p-4 shadow-md space-y-3 shrink-0">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase text-[11px] tracking-wider font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Purchase Link Fastener Quick Entry Form</span>
                      </div>
                      <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-mono">
                        Press <span className="bg-slate-800 text-white border-slate-700 px-1 py-0.5 rounded font-bold border">ENTER</span> in any field to save & link record
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
                      {/* PART NO */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">PART NO:</label>
                        <input
                          ref={refPartNo}
                          type="text"
                          value={excelPartNo}
                          onChange={(e) => setExcelPartNo(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 0)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder="AUTO-GENERATE"
                        />
                      </div>

                      {/* DIA / SIZE */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">DIA / SIZE:</label>
                        <input
                          ref={refDia}
                          type="text"
                          value={excelDia}
                          onChange={(e) => {
                            const val = e.target.value;
                            setExcelDia(val);
                            const upperVal = val.toUpperCase().trim();
                            if (upperVal === 'M6') {
                              setExcelUnitWt('0.007');
                              setExcelPitch('1.0 MM');
                            } else if (upperVal === 'M8') {
                              setExcelUnitWt('0.015');
                              setExcelPitch('1.25 MM');
                            } else if (upperVal === 'M10') {
                              setExcelUnitWt('0.030');
                              setExcelPitch('1.5 MM');
                            } else if (upperVal === 'M12') {
                              setExcelUnitWt('0.050');
                              setExcelPitch('1.75 MM');
                            } else if (upperVal === 'M16') {
                              setExcelUnitWt('0.110');
                              setExcelPitch('2.0 MM');
                            } else if (upperVal === 'M20') {
                              setExcelUnitWt('0.200');
                              setExcelPitch('2.5 MM');
                            }
                          }}
                          onKeyDown={(e) => handleFieldKeyDown(e, 1)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder="M10"
                        />
                      </div>

                      {/* PITCH */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">PITCH:</label>
                        <input
                          ref={refPitch}
                          type="text"
                          value={excelPitch}
                          onChange={(e) => setExcelPitch(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 2)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder="1.5 MM"
                        />
                      </div>

                      {/* LENGTH */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">
                          {isNutCategory ? "LENGTH (MM) (OPTIONAL):" : "LENGTH (MM):"}
                        </label>
                        <input
                          ref={refLength}
                          type="text"
                          value={excelLength}
                          onChange={(e) => setExcelLength(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 3)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder={isNutCategory ? "NONE" : "50"}
                        />
                      </div>

                      {/* FINISH */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">FINISH:</label>
                        <input
                          ref={refFinish}
                          type="text"
                          value={excelFinish}
                          onChange={(e) => setExcelFinish(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 4)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder="ZP"
                        />
                      </div>

                      {/* BRAND / MARKING */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">BRAND:</label>
                        <input
                          ref={refBrand}
                          type="text"
                          value={excelBrand}
                          onChange={(e) => setExcelBrand(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 5)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder="MFI"
                        />
                      </div>

                      {/* UNIT */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">UNIT:</label>
                        <input
                          ref={refUnit}
                          type="text"
                          value={excelUnit}
                          onChange={(e) => setExcelUnit(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 6)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                          placeholder="PCS."
                        />
                      </div>

                      {/* INCOMING QTY */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">INCOMING QTY:</label>
                        <input
                          ref={refIncoming}
                          type="text"
                          value={excelIncoming}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setExcelIncoming(val);
                          }}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleFieldKeyDown(e, 7)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold rounded focus:outline-none focus:border-emerald-500 font-mono text-[10px] text-right"
                          placeholder="100"
                        />
                      </div>

                      {/* UNIT WEIGHT */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">UNIT WEIGHT (KG):</label>
                        <input
                          ref={refUnitWt}
                          type="text"
                          value={excelUnitWt}
                          onChange={(e) => handleDecimalInputChange(e.target.value, setExcelUnitWt)}
                          onBlur={handleUnitWeightBlur}
                          onKeyDown={(e) => handleFieldKeyDown(e, 8)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold rounded focus:outline-none focus:border-emerald-500 font-mono text-[10px]"
                          placeholder="0.03"
                        />
                      </div>

                      {/* TOTAL WEIGHT */}
                      <div className="space-y-1">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans text-emerald-400">TOTAL WEIGHT (KG):</label>
                        <div className="w-full bg-slate-800 border border-slate-700 p-1 text-emerald-400 font-bold text-right font-mono text-[10px] rounded h-[26px] flex items-center justify-end">
                          {((parseFloat(excelIncoming) || 0) * (parseFloat(excelUnitWt) || 0)).toFixed(3)}
                        </div>
                      </div>

                      {/* DYNAMIC CUSTOM DIMENSIONS */}
                      {(() => {
                        const catObj = (fullCategories[selectedMappingDivision] || []).find((c: any) => String(c.id) === String(selectedMappingCatId));
                        const subObj = (catObj?.subcategories || []).find((s: any) => String(s.id) === String(selectedMappingSubCatId));
                        const catName = catObj?.name || '';
                        const subName = subObj?.name || '';
                        const catNameLower = catName.toLowerCase();
                        const isCustomCategory = catNameLower === 'anchor bolts' || catNameLower === 'anchor bolt' || catNameLower === 'u bolts' || catNameLower === 'u bolt' || catNameLower === 'pins' || catNameLower === 'pin';
                        if (!isCustomCategory) return null;
                        const customCols = getCustomDimensionColumns(subName, catName);
                        if (!customCols || customCols.length === 0) return null;

                        return customCols.map((col) => (
                          <div key={col.key} className="space-y-1">
                            <label className="block text-[8.5px] text-amber-400 font-semibold uppercase tracking-wider font-sans">
                              DIM {col.label}:
                            </label>
                            <input
                              type="text"
                              value={excelCustomDims[col.key] || ''}
                              onChange={(e) => setExcelCustomDims(prev => ({
                                ...prev,
                                [col.key]: e.target.value.toUpperCase()
                              }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveExcelPurchaseRecord();
                                }
                              }}
                              className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] rounded"
                              placeholder={`DIM ${col.label}`}
                            />
                          </div>
                        ));
                      })()}

                      {/* RACK LOCATION */}
                      <div className="space-y-1 col-span-2 sm:col-span-4">
                        <label className="block text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider font-sans">RACK LOCATION:</label>
                        <input
                          ref={refRack}
                          type="text"
                          value={excelRack}
                          onChange={(e) => setExcelRack(e.target.value)}
                          onKeyDown={(e) => handleFieldKeyDown(e, 9)}
                          className="w-full bg-slate-850 border border-slate-700 p-1 text-white font-bold uppercase focus:outline-none focus:border-emerald-500 font-mono text-[10px] uppercase rounded"
                          placeholder="31A-G-R01"
                        />
                      </div>

                      {/* SAVE ACTION */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <button
                          type="button"
                          onClick={handleSaveExcelPurchaseRecord}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-1 px-2 text-[9.5px] uppercase rounded border border-emerald-700 cursor-pointer shadow-md active:scale-95 transition-all text-center leading-normal h-[26px] flex items-center justify-center tracking-wider"
                        >
                          SAVE & LINK
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Modern Unified Search Area */}
              <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center shrink-0">
                <div className="relative w-full max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 font-mono font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all uppercase shadow-3xs"
                    placeholder="Quick search..."
                    value={pickerSearchTerm}
                    onChange={(e) => setPickerSearchTerm(e.target.value)}
                  />
                  {pickerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setPickerSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-rose-600 font-bold transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Main Interactive Stock Table / Product List Container */}
              <div className="flex-1 min-h-[450px] border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col shadow-sm">
                
                {/* Table Header Bar */}
                <div className="bg-slate-900 text-slate-100 px-4 py-2 font-mono text-[9.5px] font-bold uppercase tracking-wider flex justify-between items-center shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                    MATCHED STOCK
                  </span>
                  <span className="text-slate-400">Total matched: {getPickerFilteredProducts().length}</span>
                </div>

                {/* Scrollable Container */}
                <div className="flex-1 overflow-auto p-4">
                  {(() => {
                    const hasActiveGrade = !!selectedMappingGradeId;
                    if (!pickerSearchTerm.trim() && !hasActiveGrade) {
                      return (
                        <div className="text-center py-12 px-4 text-xs text-slate-400 italic font-medium flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-slate-300 stroke-1" />
                          <span>Type a search term above, or choose a Technical Grade, to load matching items from the Warehouse.</span>
                        </div>
                      );
                    }
                    const products = getPickerFilteredProducts();
                    if (products.length === 0) {
                      return (
                        <div className="text-center py-12 px-4 text-xs text-slate-400 italic font-medium flex flex-col items-center justify-center gap-2">
                          <Package className="w-8 h-8 text-slate-300 stroke-1 animate-bounce" />
                          <span>No matching items found in the Ajman Warehouse Database.</span>
                          <span className="text-[10px] text-slate-400 font-normal">Try clearing search terms or selecting another category.</span>
                        </div>
                      );
                    }

                    const activeItem = lineItems.find(it => it.id === activePickerLineItemId);

                    const categoriesOfDivision = fullCategories[selectedMappingDivision] || [];
                    const activeCategory = categoriesOfDivision.find(c => String(c.id) === String(selectedMappingCatId));
                    const activeSubcategory = activeCategory?.subcategories?.find((s: any) => String(s.id) === String(selectedMappingSubCatId));

                    const firstProduct = products[0];
                    const catName = activeCategory?.name || firstProduct?.categoryName || '';
                    const subName = activeSubcategory?.name || firstProduct?.subcategoryName || '';
                    const dl = getCategoryDimensionLayout(catName, subName);

                    const catNameLower = catName.toLowerCase();
                    const isCustomCategory = catNameLower === 'anchor bolts' || catNameLower === 'anchor bolt' || catNameLower === 'u bolts' || catNameLower === 'u bolt' || catNameLower === 'pins' || catNameLower === 'pin';
                    const customCols = isCustomCategory ? getCustomDimensionColumns(subName, catName) : [];

                    // Dynamic column list
                    const columns: { key: string; label: string; align: 'center' | 'left' | 'right'; width: string }[] = [
                      { key: 'idx', label: 'IDX', align: 'center', width: '45px' },
                      { key: 'partNo', label: 'PART NO', align: 'left', width: '130px' },
                      { key: 'description', label: 'DESCRIPTION', align: 'left', width: '220px' },
                      { key: 'size', label: dl.dia || 'SIZE', align: 'left', width: '110px' },
                    ];

                    if (isCustomCategory && customCols && customCols.length > 0) {
                      customCols.forEach(col => {
                        columns.push({
                          key: col.key,
                          label: col.label,
                          align: 'center',
                          width: '75px'
                        });
                      });
                    } else {
                      // If we have custom extra columns:
                      if (dl.extraCols && dl.extraCols.length > 0) {
                        // Some items might have pitch & length, let's include if defined in the layout
                        if (dl.pitch && dl.pitch !== '—' && dl.pitch !== '-') {
                          columns.push({ key: 'pitch', label: dl.pitch, align: 'center', width: '90px' });
                        }
                        if (dl.length && dl.length !== '—' && dl.length !== '-') {
                          columns.push({ key: 'length', label: dl.length, align: 'center', width: '90px' });
                        }
                        dl.extraCols.forEach(col => {
                          columns.push({
                            key: col.key,
                            label: col.label,
                            align: 'center',
                            width: '85px'
                          });
                        });
                      } else {
                        // Standard fasteners: show A, D, B, C matching screenshot exactly!
                        columns.push(
                          { key: 'pitch', label: 'PITCH', align: 'center', width: '80px' },
                          { key: 'length', label: 'LENGTH', align: 'center', width: '80px' },
                          { key: 'dimA', label: 'A', align: 'center', width: '60px' },
                          { key: 'dimD', label: 'D', align: 'center', width: '60px' },
                          { key: 'dimB', label: 'B', align: 'center', width: '60px' },
                          { key: 'dimC', label: 'C', align: 'center', width: '60px' }
                        );
                      }
                    }

                    // Append the final standard columns
                    columns.push(
                      { key: 'finish', label: 'FINISH', align: 'center', width: '90px' },
                      { key: 'marking', label: 'MARKING', align: 'center', width: '100px' },
                      { key: 'unit', label: 'UNIT', align: 'center', width: '75px' },
                      { key: 'balanceStock', label: 'BAL. STOCK', align: 'right', width: '95px' },
                      { key: 'incoming', label: 'INCOMING QTY', align: 'center', width: '110px' },
                      { key: 'action', label: 'ACTION', align: 'center', width: '110px' }
                    );

                    const getCellVal = (colKey: string, pItem: any) => {
                      if (colKey === 'size') {
                        return pItem.dia || '—';
                      }
                      if (colKey === 'pitch') {
                        return pItem.pitch || pItem.threadTypeName || '—';
                      }
                      if (colKey === 'length') {
                        return pItem.length || '—';
                      }
                      if (colKey === 'dimD') {
                        return pItem.dimD || pItem.dimD1 || pItem.outerDia || pItem.innerDia || pItem.dia || '—';
                      }
                      if (colKey === 'dimA') {
                        return pItem.dimA || '—';
                      }
                      if (colKey === 'dimB') {
                        return pItem.dimB || '—';
                      }
                      if (colKey === 'dimC') {
                        return pItem.dimC || '—';
                      }
                      return pItem[colKey] !== undefined && pItem[colKey] !== null && pItem[colKey] !== '' ? String(pItem[colKey]) : '—';
                    };

                    return (
                      <div className="overflow-x-auto border border-[#A6C4DE] rounded-lg bg-white shadow-xs">
                        <table className="w-full text-left font-sans text-[10.5px] border-collapse min-w-[1200px]">
                          <thead>
                            <tr className="bg-[#D6E6F4] text-[#1F4E79] font-bold text-[9px] uppercase tracking-wider select-none">
                              {columns.map(col => (
                                <th
                                  key={col.key}
                                  className={`p-2 border border-[#A6C4DE] ${
                                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                  }`}
                                  style={{ width: col.width }}
                                >
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((p, index) => {
                              const isLinkedToThis = activeItem?.productId === p.id;
                              const rowQty = rowIncomingQtys[p.id] !== undefined ? rowIncomingQtys[p.id] : incomingStockVal;

                              return (
                                <tr
                                  key={p.id}
                                  className={`transition-colors border-b border-[#A6C4DE] ${
                                    isLinkedToThis 
                                      ? 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-900 font-bold'
                                      : 'hover:bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  {columns.map(col => {
                                    if (col.key === 'idx') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-center font-mono font-semibold text-slate-500">
                                          {index + 1}
                                        </td>
                                      );
                                    }
                                    if (col.key === 'partNo') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] font-mono font-bold text-slate-900">
                                          <div className="flex items-center gap-1">
                                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[8.5px]">
                                              {p.partNo}
                                            </span>
                                            {isLinkedToThis && (
                                              <span className="text-[7px] bg-blue-600 text-white font-extrabold px-1 py-0.5 rounded uppercase tracking-wider shrink-0 animate-pulse">
                                                Linked
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    }
                                    if (col.key === 'description') {
                                      const fullDesc = p.subcategoryName 
                                        ? `${p.subcategoryName} | ${p.description || ''}`
                                        : (p.description || '—');
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-slate-700 font-medium max-w-[220px] truncate" title={fullDesc}>
                                          {fullDesc}
                                        </td>
                                      );
                                    }
                                    if (col.key === 'finish') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-center uppercase text-[9.5px] font-semibold text-slate-500">
                                          {p.finish || 'SELF'}
                                        </td>
                                      );
                                    }
                                    if (col.key === 'marking') {
                                      const markingVal = p.marking || p.grade || '—';
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-center uppercase font-mono font-bold text-slate-700">
                                          {markingVal}
                                        </td>
                                      );
                                    }
                                    if (col.key === 'unit') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-center uppercase font-semibold text-slate-500">
                                          {p.unit || 'PCS.'}
                                        </td>
                                      );
                                    }
                                    if (col.key === 'balanceStock') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-right font-mono font-bold text-slate-900">
                                          {(p.balanceStock || 0).toLocaleString()}
                                        </td>
                                      );
                                    }
                                    if (col.key === 'incoming') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-center" onClick={(e) => e.stopPropagation()}>
                                          <input
                                            type="number"
                                            min="1"
                                            className="w-20 border border-slate-300 px-1.5 py-0.5 text-xs font-bold font-mono text-slate-800 text-center bg-white rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-3xs"
                                            value={rowQty}
                                            onChange={(e) => {
                                              const val = Math.max(1, parseInt(e.target.value) || 1);
                                              setRowIncomingQtys(prev => ({ ...prev, [p.id]: val }));
                                            }}
                                          />
                                        </td>
                                      );
                                    }
                                    if (col.key === 'action') {
                                      return (
                                        <td key={col.key} className="p-2 border border-[#A6C4DE] text-center" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            type="button"
                                            onClick={() => handleLinkProductAndAddStock(p, rowQty)}
                                            className="w-full px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[8.5px] rounded uppercase tracking-wider transition-all cursor-pointer border-none shadow-sm flex items-center justify-center gap-0.5 active:scale-95"
                                          >
                                            ⚡ Link Stock
                                          </button>
                                        </td>
                                      );
                                    }

                                    // Dynamic dimension column
                                    const cellVal = getCellVal(col.key, p);
                                    return (
                                      <td key={col.key} className="p-2 border border-[#A6C4DE] text-center font-mono text-slate-700">
                                        {cellVal}
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
                  })()}
                </div>
              </div>

            </div>

            {/* Modal Footer Summary Bar */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-[10.5px] text-slate-400 shrink-0 font-mono font-semibold">
              <span className="text-[8.5px] text-slate-400 font-bold max-w-lg lowercase leading-snug first-letter:uppercase">
                * Linking updates inventory immediately. On saving this purchase record, the stock is locked. To revert, delete or unlink the transaction.
              </span>
              <button
                type="button"
                onClick={() => setActivePickerLineItemId(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-[10px] rounded-xl cursor-pointer transition-all border border-slate-700 uppercase tracking-wider shadow-xs"
              >
                Cancel Mapping
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Context Menu for Purchase Table Rows */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-slate-300 rounded-lg shadow-xl py-1.5 min-w-[220px] text-[11px] font-sans font-bold text-slate-800 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              const item = lineItems[contextMenu.rowIndex];
              if (item) {
                setActivePickerLineItemId(item.id);
                setSelectedMappingDivision('Standard');
                setPickerSearchTerm('');
              }
              setContextMenu(null);
            }}
          >
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            Link Central Inventory System
          </button>
          <div className="my-1 border-t border-slate-100"></div>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              insertRowAbove(contextMenu.rowIndex);
              setContextMenu(null);
            }}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            Insert Row Above
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              insertRowBelow(contextMenu.rowIndex);
              setContextMenu(null);
            }}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            Insert Row Below
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              duplicateRow(contextMenu.rowIndex);
              setContextMenu(null);
            }}
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            Duplicate Row
          </button>
          <div className="my-1 border-t border-slate-100"></div>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              copyTableOrSelection();
              setContextMenu(null);
            }}
          >
            <Clipboard className="w-3.5 h-3.5 text-purple-600" />
            Copy Selected Cells
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              clearSelectedCells();
              setContextMenu(null);
            }}
          >
            <Eraser className="w-3.5 h-3.5 text-amber-600" />
            Clear Cell Contents
          </button>
          <div className="my-1 border-t border-slate-100"></div>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 text-rose-600 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            onClick={() => {
              const item = lineItems[contextMenu.rowIndex];
              if (item) removeLineItem(item.id);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Delete Row
          </button>
        </div>
      )}

      {/* Purchase Document Layout Preview Modal */}
      {previewModalHtml && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col font-sans no-print animate-in fade-in duration-150">
          {/* Header bar */}
          <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-700 shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white font-mono">{previewDocTitle}</h3>
                <p className="text-[10px] text-slate-400 font-mono">High-Fidelity Document Layout Preview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => printHtml(previewModalHtml, previewDocTitle)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-sm border border-blue-400"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalHtml(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 border border-slate-600"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>
          </div>
          {/* Body preview iframe */}
          <div className="flex-1 bg-slate-800/90 p-4 sm:p-8 overflow-auto flex justify-center items-start">
            <div className="bg-white rounded-lg shadow-2xl max-w-[210mm] w-full min-h-[297mm] overflow-hidden border border-slate-200">
              <iframe
                title="Document Layout Preview"
                srcDoc={previewModalHtml}
                className="w-full h-[85vh] border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Company Header Edit Modal */}
      <EditCompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSaved={() => {
          if (triggerToast) triggerToast("Company Header details updated successfully!");
        }}
      />

    </div>
  );
}
