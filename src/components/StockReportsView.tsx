import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Box, 
  Printer, 
  SlidersHorizontal, 
  Search,
  FileSpreadsheet,
  FileText,
  Filter,
  Database,
  ArrowUp,
  ArrowDown,
  Plus,
  ClipboardList,
  Layers,
  Eye,
  Table,
  CheckCircle,
  AlertCircle,
  Columns3,
  ChevronDown,
  Pencil,
  Trash2,
  Check,
  X,
  Save,
  Edit3,
  Sliders,
  Folder,
  GitFork,
  Ruler,
  Shield,
  RefreshCw
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getRowUnitWeight, getRowTotalWeight } from '../types';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';

export function parseWidthStyle(widthStyleStr: string | undefined): React.CSSProperties | undefined {
  if (!widthStyleStr) return undefined;
  const styleObj: React.CSSProperties = {};
  const widthMatch = widthStyleStr.match(/width:\s*([^;]+)/);
  if (widthMatch && widthMatch[1]) {
    styleObj.width = widthMatch[1].trim();
  }
  const minWidthMatch = widthStyleStr.match(/min-width:\s*([^;]+)/);
  if (minWidthMatch && minWidthMatch[1]) {
    styleObj.minWidth = minWidthMatch[1].trim();
  }
  return styleObj;
}

export interface CustomColumnOptions {
  showClass?: boolean;
  showCategory?: boolean;
  showSubCategory?: boolean;
  showThreadSeries?: boolean;
  showTechnicalGrade?: boolean;
}

interface FlatStockItem {
  category: string;
  subcategory: string;
  threadType: string;
  grade: string;
  product: any;
  section: 'Standard' | 'Fine';
}

export interface TableColumn {
  header: string;
  align: 'left' | 'center' | 'right';
  widthClass: string;
  widthStyle: string;
  excelStyle?: string;
  getValue: (item: FlatStockItem) => string | number;
  isNumeric?: boolean;
}

export function getCategoryTableColumns(categoryName: string, customOptions?: CustomColumnOptions): TableColumn[] {
  let cols = getCategoryTableColumnsRaw(categoryName);
  const norm = (categoryName || '').toUpperCase().trim();

  if (norm === 'ADHESIVES' || norm === 'ADHESIVE') {
    return cols;
  }

  // Filter out unwanted columns based on rules
  const noDescriptionCategories = [
    "STRUCTURAL BOLT", "STRUCTURAL BOLTS",
    "ALL THREAD", "ALL THREADS & STUDS", "ALL THREADS", "ALL THREADS AND STUDS",
    "STUD BOLTS", "STUD BOLT",
    "NUT", "NUTS",
    "WASHERS", "WASHER",
    "ANCHORS", "ANCHOR",
    "SOCKET SCREWS", "SOCKET SCREW",
    "MACHINE SCREWS", "MACHINE SCREW",
    "SELF TAPPING SCREWS", "SELF TAPPING SCREW",
    "SDS SCREWS", "SDS SCREW",
    "SECURITY FASTENERS", "SECURITY FASTENER", "SECURITY SCREWS", "SECURITY SCREW"
  ];

  const skipDescription = noDescriptionCategories.includes(norm) || noDescriptionCategories.some(c => norm.includes(c));

  cols = cols.filter(col => {
    const header = col.header.toUpperCase();
    if (skipDescription && header === 'DESCRIPTION') {
      return false;
    }
    if (header === 'OPENING QTY' || header === 'OUT QTY' || header === 'OUTGOING QTY' || header === 'IN STOCK' || header.includes('UNIT WEIGHT')) {
      return false;
    }
    return true;
  });

  // Move PART NO next to GRADE (placed right after GRADE)
  const partNoIdx = cols.findIndex(col => col.header === 'PART NO');
  const gradeIdx = cols.findIndex(col => col.header === 'GRADE');
  if (partNoIdx !== -1 && gradeIdx !== -1) {
    const partNoCol = cols[partNoIdx];
    cols.splice(partNoIdx, 1);
    const newGradeIdx = cols.findIndex(col => col.header === 'GRADE');
    cols.splice(newGradeIdx + 1, 0, partNoCol);
  }

  // Move DESCRIPTION next to PART NO (placed right after PART NO)
  const descIdx = cols.findIndex(col => col.header === 'DESCRIPTION');
  const partNoIdxAfter = cols.findIndex(col => col.header === 'PART NO');
  if (descIdx !== -1 && partNoIdxAfter !== -1) {
    const descCol = cols[descIdx];
    cols.splice(descIdx, 1);
    const newPartNoIdx = cols.findIndex(col => col.header === 'PART NO');
    cols.splice(newPartNoIdx + 1, 0, descCol);
  }

  // Handle custom dynamic columns if provided
  if (customOptions) {
    // 1. CLASS
    if (customOptions.showClass && !cols.some(c => c.header === 'CLASS')) {
      cols.unshift({
        header: 'CLASS',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center; font-weight: bold; color: #f37021;',
        getValue: (item) => item.section || 'Standard'
      });
    } else if (customOptions.showClass === false) {
      cols = cols.filter(c => c.header !== 'CLASS');
    }

    // 2. CATEGORY
    if (customOptions.showCategory && !cols.some(c => c.header === 'CATEGORY')) {
      const insIdx = cols.findIndex(c => c.header === 'CLASS');
      const targetIdx = insIdx !== -1 ? insIdx + 1 : 0;
      cols.splice(targetIdx, 0, {
        header: 'CATEGORY',
        align: 'left',
        widthClass: 'w-[10%]',
        widthStyle: 'width: 10%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.category
      });
    } else if (customOptions.showCategory === false) {
      cols = cols.filter(c => c.header !== 'CATEGORY');
    }

    // 3. SUB CATEGORY
    if (customOptions.showSubCategory && !cols.some(c => c.header === 'SUB CATEGORY' || c.header === 'SUBCATEGORY')) {
      const insIdx = cols.findIndex(c => c.header === 'CATEGORY' || c.header === 'CLASS');
      const targetIdx = insIdx !== -1 ? insIdx + 1 : 0;
      cols.splice(targetIdx, 0, {
        header: 'SUB CATEGORY',
        align: 'left',
        widthClass: 'w-[10%]',
        widthStyle: 'width: 10%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      });
    } else if (customOptions.showSubCategory === false) {
      cols = cols.filter(c => c.header !== 'SUB CATEGORY' && c.header !== 'SUBCATEGORY');
    }

    // 4. THREAD SERIES
    if (customOptions.showThreadSeries && !cols.some(c => c.header === 'THREAD SERIES' || c.header === 'THREAD TYPE')) {
      const partIdx = cols.findIndex(c => c.header === 'PART NO');
      const targetIdx = partIdx !== -1 ? partIdx : 1;
      cols.splice(targetIdx, 0, {
        header: 'THREAD SERIES',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.threadType || '—'
      });
    } else if (customOptions.showThreadSeries === false) {
      cols = cols.filter(c => c.header !== 'THREAD SERIES' && c.header !== 'THREAD TYPE');
    }

    // 5. TECHNICAL GRADE BOX
    if (customOptions.showTechnicalGrade && !cols.some(c => c.header === 'TECHNICAL GRADE BOX' || c.header === 'TECHNICAL GRADE' || c.header === 'GRADE')) {
      const partIdx = cols.findIndex(c => c.header === 'PART NO');
      const targetIdx = partIdx !== -1 ? partIdx : 1;
      cols.splice(targetIdx, 0, {
        header: 'TECHNICAL GRADE BOX',
        align: 'center',
        widthClass: 'w-[9%]',
        widthStyle: 'width: 9%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center; font-weight: bold;',
        getValue: (item) => item.grade || item.product.grade || '—'
      });
    } else if (customOptions.showTechnicalGrade === false) {
      cols = cols.filter(c => c.header !== 'TECHNICAL GRADE BOX' && c.header !== 'TECHNICAL GRADE' && c.header !== 'GRADE');
    }
  }

  return cols;
}

export function getCategoryTableColumnsForPrint(categoryName: string, customOptions?: CustomColumnOptions): TableColumn[] {
  let cols = getCategoryTableColumnsRaw(categoryName);
  const norm = (categoryName || '').toUpperCase().trim();

  if (norm === 'ADHESIVES' || norm === 'ADHESIVE') {
    return cols;
  }

  // Filter out description if needed for layout sanity, but preserve all quantities/weights
  const noDescriptionCategories = [
    "STRUCTURAL BOLT", "STRUCTURAL BOLTS",
    "ALL THREAD", "ALL THREADS & STUDS", "ALL THREADS", "ALL THREADS AND STUDS",
    "STUD BOLTS", "STUD BOLT",
    "NUT", "NUTS",
    "WASHERS", "WASHER",
    "ANCHORS", "ANCHOR",
    "SOCKET SCREWS", "SOCKET SCREW",
    "MACHINE SCREWS", "MACHINE SCREW",
    "SELF TAPPING SCREWS", "SELF TAPPING SCREW",
    "SDS SCREWS", "SDS SCREW",
    "SECURITY FASTENERS", "SECURITY FASTENER", "SECURITY SCREWS", "SECURITY SCREW"
  ];

  const skipDescription = noDescriptionCategories.includes(norm) || noDescriptionCategories.some(c => norm.includes(c));

  cols = cols.filter(col => {
    const header = col.header.toUpperCase();
    if (skipDescription && header === 'DESCRIPTION') {
      return false;
    }
    return true;
  });

  // Move PART NO next to GRADE (placed right after GRADE)
  const partNoIdxPrint = cols.findIndex(col => col.header === 'PART NO');
  const gradeIdxPrint = cols.findIndex(col => col.header === 'GRADE');
  if (partNoIdxPrint !== -1 && gradeIdxPrint !== -1) {
    const partNoCol = cols[partNoIdxPrint];
    cols.splice(partNoIdxPrint, 1);
    const newGradeIdx = cols.findIndex(col => col.header === 'GRADE');
    cols.splice(newGradeIdx + 1, 0, partNoCol);
  }

  // Move DESCRIPTION next to PART NO (placed right after PART NO)
  const descIdxPrint = cols.findIndex(col => col.header === 'DESCRIPTION');
  const partNoIdxAfterPrint = cols.findIndex(col => col.header === 'PART NO');
  if (descIdxPrint !== -1 && partNoIdxAfterPrint !== -1) {
    const descCol = cols[descIdxPrint];
    cols.splice(descIdxPrint, 1);
    const newPartNoIdx = cols.findIndex(col => col.header === 'PART NO');
    cols.splice(newPartNoIdx + 1, 0, descCol);
  }

  // Handle custom dynamic columns if provided
  if (customOptions) {
    if (customOptions.showClass && !cols.some(c => c.header === 'CLASS')) {
      cols.unshift({
        header: 'CLASS',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center; font-weight: bold; color: #f37021;',
        getValue: (item) => item.section || 'Standard'
      });
    } else if (customOptions.showClass === false) {
      cols = cols.filter(c => c.header !== 'CLASS');
    }

    if (customOptions.showCategory && !cols.some(c => c.header === 'CATEGORY')) {
      const insIdx = cols.findIndex(c => c.header === 'CLASS');
      const targetIdx = insIdx !== -1 ? insIdx + 1 : 0;
      cols.splice(targetIdx, 0, {
        header: 'CATEGORY',
        align: 'left',
        widthClass: 'w-[10%]',
        widthStyle: 'width: 10%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.category
      });
    } else if (customOptions.showCategory === false) {
      cols = cols.filter(c => c.header !== 'CATEGORY');
    }

    if (customOptions.showSubCategory && !cols.some(c => c.header === 'SUB CATEGORY' || c.header === 'SUBCATEGORY')) {
      const insIdx = cols.findIndex(c => c.header === 'CATEGORY' || c.header === 'CLASS');
      const targetIdx = insIdx !== -1 ? insIdx + 1 : 0;
      cols.splice(targetIdx, 0, {
        header: 'SUB CATEGORY',
        align: 'left',
        widthClass: 'w-[10%]',
        widthStyle: 'width: 10%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      });
    } else if (customOptions.showSubCategory === false) {
      cols = cols.filter(c => c.header !== 'SUB CATEGORY' && c.header !== 'SUBCATEGORY');
    }

    if (customOptions.showThreadSeries && !cols.some(c => c.header === 'THREAD SERIES' || c.header === 'THREAD TYPE')) {
      const partIdx = cols.findIndex(c => c.header === 'PART NO');
      const targetIdx = partIdx !== -1 ? partIdx : 1;
      cols.splice(targetIdx, 0, {
        header: 'THREAD SERIES',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.threadType || '—'
      });
    } else if (customOptions.showThreadSeries === false) {
      cols = cols.filter(c => c.header !== 'THREAD SERIES' && c.header !== 'THREAD TYPE');
    }

    if (customOptions.showTechnicalGrade && !cols.some(c => c.header === 'TECHNICAL GRADE BOX' || c.header === 'TECHNICAL GRADE' || c.header === 'GRADE')) {
      const partIdx = cols.findIndex(c => c.header === 'PART NO');
      const targetIdx = partIdx !== -1 ? partIdx : 1;
      cols.splice(targetIdx, 0, {
        header: 'TECHNICAL GRADE BOX',
        align: 'center',
        widthClass: 'w-[9%]',
        widthStyle: 'width: 9%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center; font-weight: bold;',
        getValue: (item) => item.grade || item.product.grade || '—'
      });
    } else if (customOptions.showTechnicalGrade === false) {
      cols = cols.filter(c => c.header !== 'TECHNICAL GRADE BOX' && c.header !== 'TECHNICAL GRADE' && c.header !== 'GRADE');
    }
  }

  return cols;
}

export function getCategoryTableColumnsRaw(categoryName: string): TableColumn[] {
  const norm = (categoryName || '').toUpperCase().trim();

  if (norm === "ADHESIVES" || norm === "ADHESIVE") {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[10%]',
        widthStyle: 'width: 10%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[14%]',
        widthStyle: 'width: 14%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SIZE',
        align: 'center',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'BRAND',
        align: 'center',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.color || '—'
      },
      {
        header: 'MARKING',
        align: 'center',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'PROD DATE',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.productionDate || '—'
      },
      {
        header: 'EXPIRY DATE',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.expiryDate || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'OPENING QTY',
        align: 'right',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right;',
        getValue: (item) => item.product.openingStock || 0,
        isNumeric: true
      },
      {
        header: 'IN STOCK',
        align: 'right',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right;',
        getValue: (item) => item.product.inStock || 0,
        isNumeric: true
      },
      {
        header: 'OUT QTY',
        align: 'right',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right;',
        getValue: (item) => item.product.outGoingStock || 0,
        isNumeric: true
      },
      {
        header: 'BALANCE QTY',
        align: 'right',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT',
        align: 'right',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT',
        align: 'right',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'RACK LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  if (norm.includes("U BOLT") || norm.includes("U-BOLT")) {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[13%]',
        widthStyle: 'width: 13%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SUBCATEGORY',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      },
      {
        header: 'GRADE',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.grade || '—'
      },
      {
        header: 'DIA A',
        align: 'center',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'INSIDE WIDTH (C)',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.dimC || item.product.bendC || item.product.innerDiaC || '—'
      },
      {
        header: 'LENGTH B',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.length || item.product.dimB || '—'
      },
      {
        header: 'THREAD D',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.threadD || item.product.threadL || '—'
      },
      {
        header: 'INNER DIA C',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.innerDiaC || '—'
      },
      {
        header: 'FINISH',
        align: 'left',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.finish || '—'
      },
      {
        header: 'MARKING',
        align: 'left',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'BALANCE STOCK',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  if (norm.includes("FLAT BAR")) {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[14%]',
        widthStyle: 'width: 14%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SUBCATEGORY',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      },
      {
        header: 'GRADE',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.grade || '—'
      },
      {
        header: 'WIDTH',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'THICKNESS',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.thickness || '—'
      },
      {
        header: 'BAR LENGTH',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.length || '—'
      },
      {
        header: 'FINISH',
        align: 'left',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.finish || '—'
      },
      {
        header: 'MARKING',
        align: 'left',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'BALANCE STOCK',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  if (norm.includes("ROUND BAR")) {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[14%]',
        widthStyle: 'width: 14%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SUBCATEGORY',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      },
      {
        header: 'GRADE',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.grade || '—'
      },
      {
        header: 'DIA',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'LENGTH',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.length || '—'
      },
      {
        header: 'FINISH',
        align: 'left',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.finish || '—'
      },
      {
        header: 'MARKING',
        align: 'left',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'BALANCE STOCK',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  if (norm.includes("ANCHOR BOLT")) {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[13%]',
        widthStyle: 'width: 13%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SUBCATEGORY',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      },
      {
        header: 'GRADE',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.grade || '—'
      },
      {
        header: 'DIA',
        align: 'center',
        widthClass: 'w-[6%]',
        widthStyle: 'width: 6%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'THREAD LENGTH',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.threadD || item.product.threadL || '—'
      },
      {
        header: 'BEND L1',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.bendL1 || item.product.dimC || item.product.customBend || '—'
      },
      {
        header: 'TOTAL LENGTH',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.length || '—'
      },
      {
        header: 'FINISH',
        align: 'left',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.finish || '—'
      },
      {
        header: 'MARKING',
        align: 'left',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'BALANCE STOCK',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  if (norm.includes("PIN")) {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[14%]',
        widthStyle: 'width: 14%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SUBCATEGORY',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      },
      {
        header: 'GRADE',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.grade || '—'
      },
      {
        header: 'PIN DIA',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'PIN LENGTH',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.length || '—'
      },
      {
        header: 'FINISH',
        align: 'left',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.finish || '—'
      },
      {
        header: 'MARKING',
        align: 'left',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'BALANCE STOCK',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  if (norm.includes("RIVET")) {
    return [
      {
        header: 'PART NO',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
        getValue: (item) => item.product.partNo
      },
      {
        header: 'DESCRIPTION',
        align: 'left',
        widthClass: 'w-[14%]',
        widthStyle: 'width: 14%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.description
      },
      {
        header: 'SUBCATEGORY',
        align: 'left',
        widthClass: 'w-[12%]',
        widthStyle: 'width: 12%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.subcategory
      },
      {
        header: 'GRADE',
        align: 'center',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.grade || '—'
      },
      {
        header: 'RIVET DIA',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
      },
      {
        header: 'RIVET LENGTH',
        align: 'center',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.length || '—'
      },
      {
        header: 'FINISH',
        align: 'left',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.finish || '—'
      },
      {
        header: 'MARKING',
        align: 'left',
        widthClass: 'w-[7%]',
        widthStyle: 'width: 7%;',
        excelStyle: 'mso-number-format: "\\@"; text-align: left;',
        getValue: (item) => item.product.marking || '—'
      },
      {
        header: 'UNIT',
        align: 'center',
        widthClass: 'w-[2.5%]',
        widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.unit || 'PCS'
      },
      {
        header: 'BALANCE STOCK',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
        getValue: (item) => item.product.balanceStock || 0,
        isNumeric: true
      },
      {
        header: 'UNIT WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
        getValue: (item) => getRowUnitWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'TOTAL WEIGHT (KG)',
        align: 'right',
        widthClass: 'w-[8%]',
        widthStyle: 'width: 8%;',
        excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
        getValue: (item) => getRowTotalWeight(item.product, item.category),
        isNumeric: true
      },
      {
        header: 'LOCATION',
        align: 'center',
        widthClass: 'w-[4.5%]',
        widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
        excelStyle: 'mso-number-format: "\\@"; text-align: center;',
        getValue: (item) => item.product.rackLocation || '—'
      }
    ];
  }

  // Default / Structural Bolts
  return [
    {
      header: 'PART NO',
      align: 'left',
      widthClass: 'w-[11%]',
      widthStyle: 'width: 11%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: left; font-weight: bold;',
      getValue: (item) => item.product.partNo
    },
    {
      header: 'DESCRIPTION',
      align: 'left',
      widthClass: 'w-[12%]',
      widthStyle: 'width: 12%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: left;',
      getValue: (item) => item.product.description
    },
    {
      header: 'SUBCATEGORY',
      align: 'left',
      widthClass: 'w-[11%]',
      widthStyle: 'width: 11%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: left;',
      getValue: (item) => item.subcategory
    },
    {
      header: 'THREAD SERIES',
      align: 'center',
      widthClass: 'w-[8%]',
      widthStyle: 'width: 8%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.threadType || '—'
    },
    {
      header: 'GRADE',
      align: 'center',
      widthClass: 'w-[8%]',
      widthStyle: 'width: 8%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.grade || '—'
    },
    {
      header: 'SIZE',
      align: 'center',
      widthClass: 'w-[5%]',
      widthStyle: 'width: 5%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.product.diameter || item.product.size || item.product.dia || '—'
    },
    {
      header: 'PITCH',
      align: 'center',
      widthClass: 'w-[3.5%]',
      widthStyle: 'width: 3.5%; min-width: 36px; max-width: 46px;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.product.pitch || '—'
    },
    {
      header: 'LENGTH',
      align: 'center',
      widthClass: 'w-[5%]',
      widthStyle: 'width: 5%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.product.length || '—'
    },
    {
      header: 'FINISH',
      align: 'left',
      widthClass: 'w-[7%]',
      widthStyle: 'width: 7%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: left;',
      getValue: (item) => item.product.finish || '—'
    },
    {
      header: 'MARKING',
      align: 'left',
      widthClass: 'w-[7%]',
      widthStyle: 'width: 7%;',
      excelStyle: 'mso-number-format: "\\@"; text-align: left;',
      getValue: (item) => item.product.marking || '—'
    },
    {
      header: 'UNIT',
      align: 'center',
      widthClass: 'w-[2.5%]',
      widthStyle: 'width: 2.5%; min-width: 28px; max-width: 38px;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.product.unit || 'PCS'
    },
    {
      header: 'OPENING QTY',
      align: 'right',
      widthClass: 'w-[6%]',
      widthStyle: 'width: 6%;',
      excelStyle: 'mso-number-format: "#,##0"; text-align: right;',
      getValue: (item) => item.product.openingStock || 0,
      isNumeric: true
    },
    {
      header: 'IN STOCK',
      align: 'right',
      widthClass: 'w-[6%]',
      widthStyle: 'width: 6%;',
      excelStyle: 'mso-number-format: "#,##0"; text-align: right;',
      getValue: (item) => item.product.inStock || 0,
      isNumeric: true
    },
    {
      header: 'OUT QTY',
      align: 'right',
      widthClass: 'w-[6%]',
      widthStyle: 'width: 6%;',
      excelStyle: 'mso-number-format: "#,##0"; text-align: right;',
      getValue: (item) => item.product.outGoingStock || 0,
      isNumeric: true
    },
    {
      header: 'BALANCE STOCK',
      align: 'right',
      widthClass: 'w-[7%]',
      widthStyle: 'width: 7%;',
      excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #f0f9ff; color: #0284c7;',
      getValue: (item) => item.product.balanceStock || 0,
      isNumeric: true
    },
    {
      header: 'UNIT WEIGHT (KG)',
      align: 'right',
      widthClass: 'w-[7%]',
      widthStyle: 'width: 7%;',
      excelStyle: 'mso-number-format: "0.0000"; text-align: right;',
      getValue: (item) => getRowUnitWeight(item.product, item.category),
      isNumeric: true
    },
    {
      header: 'TOTAL WEIGHT (KG)',
      align: 'right',
      widthClass: 'w-[7%]',
      widthStyle: 'width: 7%;',
      excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #0369a1;',
      getValue: (item) => getRowTotalWeight(item.product, item.category),
      isNumeric: true
    },
    {
      header: 'RACK LOCATION',
      align: 'center',
      widthClass: 'w-[4.5%]',
      widthStyle: 'width: 4.5%; min-width: 48px; max-width: 65px;',
      excelStyle: 'mso-number-format: "\\@"; text-align: center;',
      getValue: (item) => item.product.rackLocation || '—'
    }
  ];
}

export function getCategoryOutgoingColumns(categoryName: string): TableColumn[] {
  const stockCols = getCategoryTableColumns(categoryName);
  const result: TableColumn[] = [];
  let addedOutPcs = false;

  stockCols.forEach(col => {
    const header = col.header.toUpperCase();
    if (header === 'OPENING QTY' || header === 'IN STOCK' || header === 'OUT QTY' || header === 'BALANCE STOCK') {
      if (!addedOutPcs) {
        result.push({
          header: 'OUT PCS',
          align: 'right',
          widthClass: 'w-[9%]',
          widthStyle: 'width: 9%;',
          excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #fff7ed; color: #ea580c;',
          getValue: (item) => item.product.outGoingStock || 0,
          isNumeric: true
        });
        result.push({
          header: 'OUT WT',
          align: 'right',
          widthClass: 'w-[9%]',
          widthStyle: 'width: 9%;',
          excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #c2410c;',
          getValue: (item) => (item.product.outGoingStock || 0) * (item.product.unitWeight || 0),
          isNumeric: true
        });
        addedOutPcs = true;
      }
    } else if (header === 'UNIT WEIGHT (KG)' || header === 'TOTAL WEIGHT (KG)' || header === 'RACK LOCATION' || header === 'LOCATION') {
      if (header === 'RACK LOCATION' || header === 'LOCATION') {
        result.push(col);
      }
    } else {
      result.push(col);
    }
  });

  return result;
}

export function getCategoryOutgoingColumnsForPrint(categoryName: string): TableColumn[] {
  const stockCols = getCategoryTableColumnsForPrint(categoryName);
  const result: TableColumn[] = [];
  let addedOutPcs = false;

  stockCols.forEach(col => {
    const header = col.header.toUpperCase();
    if (header === 'OPENING QTY' || header === 'IN STOCK' || header === 'OUT QTY' || header === 'BALANCE STOCK' || header === 'BAL PCS') {
      if (!addedOutPcs) {
        result.push({
          header: 'OUT PCS',
          align: 'right',
          widthClass: 'w-[9%]',
          widthStyle: 'width: 9%;',
          excelStyle: 'mso-number-format: "#,##0"; text-align: right; font-weight: bold; background-color: #fff7ed; color: #ea580c;',
          getValue: (item) => item.product.outGoingStock || 0,
          isNumeric: true
        });
        result.push({
          header: 'OUT WT',
          align: 'right',
          widthClass: 'w-[9%]',
          widthStyle: 'width: 9%;',
          excelStyle: 'mso-number-format: "0.00"; text-align: right; font-weight: bold; color: #c2410c;',
          getValue: (item) => (item.product.outGoingStock || 0) * (item.product.unitWeight || 0),
          isNumeric: true
        });
        addedOutPcs = true;
      }
    } else {
      result.push(col);
    }
  });

  return result;
}

interface FlatStockItem {
  category: string;
  subcategory: string;
  threadType: string;
  grade: string;
  product: any;
  section: 'Standard' | 'Fine';
}

interface StockReportsViewProps {
  triggerToast: (msg: string) => void;
  standardsProducts?: any[];
  setStandardsProducts?: React.Dispatch<React.SetStateAction<any[]>>;
  fineThreadProducts?: any[];
  setFineThreadProducts?: React.Dispatch<React.SetStateAction<any[]>>;
  onOpenQuickStockEntry?: () => void;
}

export default function StockReportsView({ 
  triggerToast,
  standardsProducts: passedStandardsProducts,
  setStandardsProducts,
  fineThreadProducts: passedFineThreadProducts,
  setFineThreadProducts,
  onOpenQuickStockEntry
}: StockReportsViewProps) {
  // Load products to compute stock reports
  const [localStandardsProducts, setLocalStandardsProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('mf_std_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [localFineThreadProducts, setLocalFineThreadProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('mf_fine_products');
    return saved ? JSON.parse(saved) : [];
  });

  const standardsProducts = passedStandardsProducts ?? localStandardsProducts;
  const fineThreadProducts = passedFineThreadProducts ?? localFineThreadProducts;

  // Row Edit Modal State
  const [editingItem, setEditingItem] = useState<FlatStockItem | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const handleOpenEditModal = (item: FlatStockItem) => {
    setEditingItem(item);
    setEditFormData({
      partNo: item.product.partNo || '',
      description: item.product.description || '',
      dia: item.product.dia || item.product.diameter || item.product.size || '',
      pitch: item.product.pitch || '',
      length: item.product.length || '',
      finish: item.product.finish || '',
      marking: item.product.marking || '',
      unit: item.product.unit || 'PCS',
      openingStock: item.product.openingStock !== undefined ? Number(item.product.openingStock) : Number(item.product.balanceStock || 0),
      inStock: Number(item.product.inStock || 0),
      outGoingStock: Number(item.product.outGoingStock || 0),
      balanceStock: Number(item.product.balanceStock || 0),
      unitWeight: Number(item.product.unitWeight || 0),
      rackLocation: item.product.rackLocation || '',
    });
  };

  const handleSaveEditModal = () => {
    if (!editingItem) return;
    const op = Number(editFormData.openingStock || 0);
    const inc = Number(editFormData.inStock || 0);
    const out = Number(editFormData.outGoingStock || 0);
    const bal = op + inc - out;
    const uWt = Number(editFormData.unitWeight || 0);
    const totWt = bal * uWt;

    const mergedProduct = {
      ...editingItem.product,
      ...editFormData,
      openingStock: op,
      inStock: inc,
      outGoingStock: out,
      balanceStock: bal,
      unitWeight: uWt,
      totalWeight: totWt
    };

    const isFine = editingItem.section === 'Fine';
    const targetId = editingItem.product.id;

    if (isFine) {
      const updated = (passedFineThreadProducts ?? localFineThreadProducts).map(cat => {
        if (cat.name !== editingItem.category) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub: any) => {
            if (sub.name !== editingItem.subcategory) return sub;
            return {
              ...sub,
              threadTypes: sub.threadTypes.map((tt: any) => {
                if (tt.name !== editingItem.threadType) return tt;
                return {
                  ...tt,
                  grades: tt.grades.map((g: any) => {
                    if (g.name !== editingItem.grade) return g;
                    return {
                      ...g,
                      rows: g.rows.map((r: any) => r.id === targetId ? mergedProduct : r)
                    };
                  })
                };
              })
            };
          })
        };
      });
      setLocalFineThreadProducts(updated);
      localStorage.setItem('mf_fine_products', JSON.stringify(updated));
      if (setFineThreadProducts) setFineThreadProducts(updated);
    } else {
      const updated = (passedStandardsProducts ?? localStandardsProducts).map(cat => {
        if (cat.name !== editingItem.category) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub: any) => {
            if (sub.name !== editingItem.subcategory) return sub;
            return {
              ...sub,
              threadTypes: sub.threadTypes.map((tt: any) => {
                if (tt.name !== editingItem.threadType) return tt;
                return {
                  ...tt,
                  grades: tt.grades.map((g: any) => {
                    if (g.name !== editingItem.grade) return g;
                    return {
                      ...g,
                      rows: g.rows.map((r: any) => r.id === targetId ? mergedProduct : r)
                    };
                  })
                };
              })
            };
          })
        };
      });
      setLocalStandardsProducts(updated);
      localStorage.setItem('mf_std_products', JSON.stringify(updated));
      if (setStandardsProducts) setStandardsProducts(updated);
    }

    setEditingItem(null);
    triggerToast(`Stock ledger item ${mergedProduct.partNo || ''} updated successfully.`);
  };

  const handleDeleteStockItem = (itemToDelete: FlatStockItem) => {
    const isFine = itemToDelete.section === 'Fine';
    const targetId = itemToDelete.product.id;
    const partCode = itemToDelete.product.partNo || 'Stock row';

    if (isFine) {
      const updated = (passedFineThreadProducts ?? localFineThreadProducts).map(cat => {
        if (cat.name !== itemToDelete.category) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub: any) => {
            if (sub.name !== itemToDelete.subcategory) return sub;
            return {
              ...sub,
              threadTypes: sub.threadTypes.map((tt: any) => {
                if (tt.name !== itemToDelete.threadType) return tt;
                return {
                  ...tt,
                  grades: tt.grades.map((g: any) => {
                    if (g.name !== itemToDelete.grade) return g;
                    return {
                      ...g,
                      rows: g.rows.filter((r: any) => r.id !== targetId)
                    };
                  })
                };
              })
            };
          })
        };
      });
      setLocalFineThreadProducts(updated);
      localStorage.setItem('mf_fine_products', JSON.stringify(updated));
      if (setFineThreadProducts) setFineThreadProducts(updated);
    } else {
      const updated = (passedStandardsProducts ?? localStandardsProducts).map(cat => {
        if (cat.name !== itemToDelete.category) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub: any) => {
            if (sub.name !== itemToDelete.subcategory) return sub;
            return {
              ...sub,
              threadTypes: sub.threadTypes.map((tt: any) => {
                if (tt.name !== itemToDelete.threadType) return tt;
                return {
                  ...tt,
                  grades: tt.grades.map((g: any) => {
                    if (g.name !== itemToDelete.grade) return g;
                    return {
                      ...g,
                      rows: g.rows.filter((r: any) => r.id !== targetId)
                    };
                  })
                };
              })
            };
          })
        };
      });
      setLocalStandardsProducts(updated);
      localStorage.setItem('mf_std_products', JSON.stringify(updated));
      if (setStandardsProducts) setStandardsProducts(updated);
    }

    triggerToast(`Deleted ${partCode} from stock ledger.`);
  };

  // Active Company synchronization
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => getActiveCompany());

  useEffect(() => {
    const syncCompany = () => setCompanyProfile(getActiveCompany());
    window.addEventListener('active_company_changed', syncCompany);
    window.addEventListener('company_profile_updated', syncCompany);
    window.addEventListener('companies_list_updated', syncCompany);
    return () => {
      window.removeEventListener('active_company_changed', syncCompany);
      window.removeEventListener('company_profile_updated', syncCompany);
      window.removeEventListener('companies_list_updated', syncCompany);
    };
  }, []);

  // Custom Dynamic Columns State - Technical Grade enabled by default
  const [customColumnOptions, setCustomColumnOptions] = useState<CustomColumnOptions>({
    showClass: false,
    showCategory: false,
    showSubCategory: false,
    showThreadSeries: false,
    showTechnicalGrade: true,
  });

  // Global shortcut '+' to trigger Quick Stock Entry Modal
  useEffect(() => {
    const handlePlusKey = (e: KeyboardEvent) => {
      const isPlusKey = e.key === '+' || (e.key === '=' && e.shiftKey) || e.code === 'NumpadAdd';
      if (isPlusKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.tagName === 'SELECT' || 
          (activeEl as HTMLElement).isContentEditable
        );
        if (!isInputActive) {
          e.preventDefault();
          if (onOpenQuickStockEntry) {
            onOpenQuickStockEntry();
          } else {
            window.dispatchEvent(new CustomEvent('open_quick_stock_entry'));
          }
        }
      }
    };
    window.addEventListener('keydown', handlePlusKey);
    return () => window.removeEventListener('keydown', handlePlusKey);
  }, [onOpenQuickStockEntry]);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setShowColumnsDropdown(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const menuWidth = 270;
    const menuHeight = 320;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setContextMenu({ x: Math.max(10, x), y: Math.max(10, y) });
  };

  const toggleCustomCol = (colKey: keyof CustomColumnOptions, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomColumnOptions(prev => {
      const next = { ...prev, [colKey]: !prev[colKey] };
      const colLabel = colKey === 'showClass' ? 'CLASS'
        : colKey === 'showCategory' ? 'CATEGORY'
        : colKey === 'showSubCategory' ? 'SUB CATEGORY'
        : colKey === 'showThreadSeries' ? 'THREAD SERIES'
        : 'TECHNICAL GRADE BOX';
      triggerToast(`Column [${colLabel}] ${next[colKey] ? 'Added' : 'Removed'}`);
      return next;
    });
  };

  const enableAllCustomCols = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomColumnOptions({
      showClass: true,
      showCategory: true,
      showSubCategory: true,
      showThreadSeries: true,
      showTechnicalGrade: true,
    });
    triggerToast("All 5 Inventory Columns Added to Sheet!");
  };

  const resetAllCustomCols = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomColumnOptions({
      showClass: false,
      showCategory: false,
      showSubCategory: false,
      showThreadSeries: false,
      showTechnicalGrade: false,
    });
    triggerToast("Reset to Standard Columns");
  };

  // Re-read stock products from localStorage when component mounts
  useEffect(() => {
    if (!passedStandardsProducts) {
      const savedStd = localStorage.getItem('mf_std_products');
      if (savedStd) setLocalStandardsProducts(JSON.parse(savedStd));
    }
    if (!passedFineThreadProducts) {
      const savedFine = localStorage.getItem('mf_fine_products');
      if (savedFine) setLocalFineThreadProducts(JSON.parse(savedFine));
    }
  }, [passedStandardsProducts, passedFineThreadProducts]);

  // Generate all master stock items with actual data
  const allStockItems = useMemo(() => {
    const items: FlatStockItem[] = [];
    const seenIds = new Set<string>();

    standardsProducts.forEach((cat: any) => {
      cat.subcategories?.forEach((sub: any) => {
        sub.threadTypes?.forEach((tt: any) => {
          tt.grades?.forEach((g: any) => {
            g.rows?.forEach((row: any) => {
              if (row.openingStock > 0 || row.inStock > 0 || row.outGoingStock > 0 || row.balanceStock > 0) {
                const uniqueKey = row.id || `${cat.name}_${sub.name}_${tt.name}_${g.name}_${row.partNo}`;
                if (!seenIds.has(uniqueKey)) {
                  seenIds.add(uniqueKey);
                  items.push({
                    category: cat.name,
                    subcategory: sub.name,
                    threadType: tt.name,
                    grade: g.name,
                    product: row,
                    section: 'Standard'
                  });
                }
              }
            });
          });
        });
      });
    });

    fineThreadProducts.forEach((cat: any) => {
      cat.subcategories?.forEach((sub: any) => {
        sub.threadTypes?.forEach((tt: any) => {
          tt.grades?.forEach((g: any) => {
            g.rows?.forEach((row: any) => {
              if (row.openingStock > 0 || row.inStock > 0 || row.outGoingStock > 0 || row.balanceStock > 0) {
                const uniqueKey = row.id || `${cat.name}_${sub.name}_${tt.name}_${g.name}_${row.partNo}`;
                if (!seenIds.has(uniqueKey)) {
                  seenIds.add(uniqueKey);
                  items.push({
                    category: cat.name,
                    subcategory: sub.name,
                    threadType: tt.name,
                    grade: g.name,
                    product: row,
                    section: 'Fine'
                  });
                }
              }
            });
          });
        });
      });
    });

    return items;
  }, [standardsProducts, fineThreadProducts]);

  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSectionFilter, setStockSectionFilter] = useState('');
  const [stockCatFilter, setStockCatFilter] = useState('');
  const [stockSubCatFilter, setStockSubCatFilter] = useState('');
  const [stockThreadFilter, setStockThreadFilter] = useState('');
  const [stockGradeFilter, setStockGradeFilter] = useState('');
  const [stockDiaFilter, setStockDiaFilter] = useState('');
  const [stockPitchFilter, setStockPitchFilter] = useState('');
  const [stockLengthFilter, setStockLengthFilter] = useState('');
  const [stockFinishFilter, setStockFinishFilter] = useState('');
  const [reportScope, setReportScope] = useState<'filtered' | 'full'>('filtered');
  const [inventoryViewMode, setInventoryViewMode] = useState<'simple' | 'details'>('simple');

  // Temporary selection states for the "Filter" button application pattern
  const [tempStockSearchQuery, setTempStockSearchQuery] = useState('');
  const [tempStockSectionFilter, setTempStockSectionFilter] = useState('');
  const [tempStockCatFilter, setTempStockCatFilter] = useState('');
  const [tempStockSubCatFilter, setTempStockSubCatFilter] = useState('');
  const [tempStockThreadFilter, setTempStockThreadFilter] = useState('');
  const [tempStockGradeFilter, setTempStockGradeFilter] = useState('');
  const [tempStockDiaFilter, setTempStockDiaFilter] = useState('');
  const [tempStockPitchFilter, setTempStockPitchFilter] = useState('');
  const [tempStockLengthFilter, setTempStockLengthFilter] = useState('');
  const [tempStockFinishFilter, setTempStockFinishFilter] = useState('');

  const stockAvailableDias = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => {
      let match = true;
      if (tempStockCatFilter && item.category !== tempStockCatFilter) match = false;
      if (match && item.product?.dia) unique.add(item.product.dia.toString().trim());
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allStockItems, tempStockCatFilter]);

  const stockAvailablePitches = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => {
      let match = true;
      if (tempStockCatFilter && item.category !== tempStockCatFilter) match = false;
      if (match && item.product?.pitch) unique.add(item.product.pitch.toString().trim());
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allStockItems, tempStockCatFilter]);

  const stockAvailableLengths = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => {
      let match = true;
      if (tempStockCatFilter && item.category !== tempStockCatFilter) match = false;
      if (match && item.product?.length) unique.add(item.product.length.toString().trim());
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [allStockItems, tempStockCatFilter]);

  const stockAvailableFinishes = useMemo(() => {
    const unique = new Set<string>();
    const standardFinishes = [
      "SELF",
      "PLAIN",
      "ZINC PLATED",
      "HOT DIP GALVANIZED",
      "YELLOW ZINC",
      "BLACK PHOSPHATE",
      "BLACK OXIDE",
      "STAINLESS STEEL",
      "XYLAN",
      "CERM",
      "TEFLON",
      "CADMIUM",
      "GALVANIZED",
      "NATURAL BRIGHT"
    ];
    standardFinishes.forEach(f => unique.add(f));

    allStockItems.forEach(item => {
      const f = item.product?.finish?.toString().toUpperCase().trim();
      if (f && f !== '—' && f !== '-' && f !== 'EMPTY') {
        unique.add(f);
      }
    });
    return Array.from(unique).sort();
  }, [allStockItems]);

  // Unique categories list for filtration selection dropdowns
  const stockAvailableCategories = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => unique.add(item.category));
    return Array.from(unique).sort();
  }, [allStockItems]);

  const stockAvailableSubCategories = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => {
      if (!tempStockCatFilter || item.category === tempStockCatFilter) {
        unique.add(item.subcategory);
      }
    });
    return Array.from(unique).sort();
  }, [allStockItems, tempStockCatFilter]);

  const stockAvailableThreadTypes = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => {
      if ((!tempStockCatFilter || item.category === tempStockCatFilter) && 
          (!tempStockSubCatFilter || item.subcategory === tempStockSubCatFilter)) {
        unique.add(item.threadType);
      }
    });
    return Array.from(unique).sort();
  }, [allStockItems, tempStockCatFilter, tempStockSubCatFilter]);

  const stockAvailableGrades = useMemo(() => {
    const unique = new Set<string>();
    allStockItems.forEach(item => {
      if ((!tempStockCatFilter || item.category === tempStockCatFilter) && 
          (!tempStockSubCatFilter || item.subcategory === tempStockSubCatFilter) &&
          (!tempStockThreadFilter || item.threadType === tempStockThreadFilter)) {
        unique.add(item.grade);
      }
    });
    return Array.from(unique).sort();
  }, [allStockItems, tempStockCatFilter, tempStockSubCatFilter, tempStockThreadFilter]);

  // Filter application
  const filteredStockReports = useMemo(() => {
    let items = allStockItems;

    if (stockSectionFilter) {
      items = items.filter(item => item.section === stockSectionFilter);
    }
    if (stockCatFilter) {
      items = items.filter(item => item.category === stockCatFilter);
    }
    if (stockSubCatFilter) {
      items = items.filter(item => item.subcategory === stockSubCatFilter);
    }
    if (stockThreadFilter) {
      items = items.filter(item => item.threadType === stockThreadFilter);
    }
    if (stockGradeFilter) {
      items = items.filter(item => item.grade === stockGradeFilter);
    }
    if (stockDiaFilter) {
      items = items.filter(item => item.product?.dia?.toString().toLowerCase().trim().includes(stockDiaFilter.toLowerCase().trim()));
    }
    if (stockPitchFilter) {
      items = items.filter(item => item.product?.pitch?.toString().toLowerCase().trim().includes(stockPitchFilter.toLowerCase().trim()));
    }
    if (stockLengthFilter) {
      items = items.filter(item => item.product?.length?.toString().toLowerCase().trim().includes(stockLengthFilter.toLowerCase().trim()));
    }
    if (stockFinishFilter) {
      items = items.filter(item => item.product?.finish?.toString().toLowerCase().trim().includes(stockFinishFilter.toLowerCase().trim()));
    }

    if (stockSearchQuery) {
      const q = stockSearchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.category.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.threadType.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q) ||
        item.product.partNo.toLowerCase().includes(q) ||
        item.product.description.toLowerCase().includes(q) ||
        (item.product.finish && item.product.finish.toLowerCase().includes(q)) ||
        (item.product.rackLocation && item.product.rackLocation.toLowerCase().includes(q))
      );
    }

    return items;
  }, [allStockItems, stockCatFilter, stockSubCatFilter, stockThreadFilter, stockGradeFilter, stockDiaFilter, stockPitchFilter, stockLengthFilter, stockFinishFilter, stockSearchQuery, stockSectionFilter]);

  const handleApplyStockFilters = () => {
    setStockSearchQuery(tempStockSearchQuery);
    setStockSectionFilter(tempStockSectionFilter);
    setStockCatFilter(tempStockCatFilter);
    setStockSubCatFilter(tempStockSubCatFilter);
    setStockThreadFilter(tempStockThreadFilter);
    setStockGradeFilter(tempStockGradeFilter);
    setStockDiaFilter(tempStockDiaFilter);
    setStockPitchFilter(tempStockPitchFilter);
    setStockLengthFilter(tempStockLengthFilter);
    setStockFinishFilter(tempStockFinishFilter);
    triggerToast("Stock filters applied successfully!");
  };

  const handleResetStockFilters = () => {
    setTempStockSearchQuery('');
    setTempStockSectionFilter('');
    setTempStockCatFilter('');
    setTempStockSubCatFilter('');
    setTempStockThreadFilter('');
    setTempStockGradeFilter('');
    setTempStockDiaFilter('');
    setTempStockPitchFilter('');
    setTempStockLengthFilter('');
    setTempStockFinishFilter('');
    
    setStockSearchQuery('');
    setStockSectionFilter('');
    setStockCatFilter('');
    setStockSubCatFilter('');
    setStockThreadFilter('');
    setStockGradeFilter('');
    setStockDiaFilter('');
    setStockPitchFilter('');
    setStockLengthFilter('');
    setStockFinishFilter('');
    triggerToast("Stock filters reset successfully!");
  };

  const getStockReportPrintHtml = (itemsList: FlatStockItem[]) => {
    const todayStr = new Date().toLocaleDateString('en-GB');
    const grouped: { [category: string]: FlatStockItem[] } = {};
    itemsList.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    const categorySections = Object.entries(grouped).map(([categoryName, items]) => {
      const cols = getCategoryTableColumnsForPrint(categoryName, customColumnOptions);
      const headersHtml = `
        <tr style="page-break-inside: avoid; page-break-after: avoid;">
          ${cols.map(col => {
            const alignStyle = col.align === 'center' ? 'text-align: center;' : col.align === 'right' ? 'text-align: right;' : 'text-align: left;';
            return `<th style="padding: 5px; border: 1px solid #cbd5e1; background-color: #1e293b; color: white; font-weight: bold; font-size: 8px; ${alignStyle}">${col.header}</th>`;
          }).join('')}
        </tr>
      `;

      const rowsHtml = items.map((item) => {
        return `
          <tr style="border-bottom: 1px solid #cbd5e1; font-family: monospace;">
            ${cols.map(col => {
              const val = col.getValue(item);
              const alignStyle = col.align === 'center' ? 'text-align: center;' : col.align === 'right' ? 'text-align: right;' : 'text-align: left;';
              
              let cellContent = val;
              if (col.isNumeric) {
                if (col.header === 'BALANCE STOCK' || col.header === 'BAL PCS' || col.header === 'OPENING QTY' || col.header === 'IN STOCK' || col.header === 'OUT QTY') {
                  cellContent = (Number(val) || 0).toLocaleString();
                } else if (col.header.includes('TOTAL WEIGHT') || col.header.includes('TOTAL WT')) {
                  cellContent = (Number(val) || 0).toFixed(2);
                } else if (col.header.includes('UNIT WEIGHT')) {
                  cellContent = (Number(val) || 0).toFixed(4);
                } else {
                  cellContent = (Number(val) || 0).toLocaleString();
                }
              }

              let extraStyle = '';
              if (col.header === 'BALANCE STOCK' || col.header === 'BAL PCS') {
                extraStyle = 'font-weight: bold; background-color: #fff8f5; color: #f37021;';
              } else if (col.header.includes('TOTAL WEIGHT')) {
                extraStyle = 'font-weight: bold; color: #0f172a;';
              } else if (col.header === 'PART NO') {
                extraStyle = 'font-weight: bold;';
              }

              return `<td style="padding: 4px; border: 1px solid #cbd5e1; font-size: 8px; ${alignStyle} ${extraStyle}">${cellContent}</td>`;
            }).join('')}
          </tr>
        `;
      }).join('');

      const totalQty = items.reduce((sum, item) => sum + (item.product.balanceStock || 0), 0);
      const totalWt = items.reduce((sum, item) => sum + getRowTotalWeight(item.product, item.category), 0);
      const balanceIdx = cols.findIndex(c => c.header === 'BALANCE STOCK' || c.header === 'BAL PCS');
      const colspanVal = balanceIdx !== -1 ? balanceIdx : cols.length - 2;

      return `
        <div style="margin-top: 15px; margin-bottom: 5px; page-break-inside: avoid;">
          <h2 style="font-size: 11px; font-weight: 800; color: #f37021; text-transform: uppercase; border-bottom: 2px solid #f37021; padding-bottom: 2px; margin: 15px 0 5px 0;">
            Category: ${categoryName.toUpperCase()} &mdash; ${items.length} Lines
          </h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8px; border: 1px solid #cbd5e1; margin-bottom: 15px;">
          <thead>
            ${headersHtml}
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="font-weight: bold; background-color: #f8fafc; page-break-inside: avoid;">
              <td colspan="${colspanVal}" style="padding: 5px; text-align: right; text-transform: uppercase; border: 1px solid #cbd5e1; font-weight: bold; color: #64748b;">Sub-Total of ${categoryName.toUpperCase()}:</td>
              <td style="padding: 5px; text-align: right; color: #f37021; border: 1px solid #cbd5e1; font-weight: bold; background-color: #fff8f5;">${totalQty.toLocaleString()}</td>
              <td style="padding: 5px; text-align: right; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${totalWt.toFixed(2)} KG</td>
              ${cols.length - colspanVal > 2 ? `<td colspan="${cols.length - colspanVal - 2}" style="border: 1px solid #cbd5e1; padding: 5px;"></td>` : ''}
            </tr>
          </tbody>
        </table>
      `;
    }).join('');

    const finalTotalQty = itemsList.reduce((sum, item) => sum + (item.product.balanceStock || 0), 0);
    const finalTotalWt = itemsList.reduce((sum, item) => sum + getRowTotalWeight(item.product, item.category), 0);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${companyProfile.name} - Master Inventory Stock Report</title>
          <style>
            @page {
              size: landscape;
              margin: 10mm 10mm 10mm 10mm;
            }
            @media print {
              html, body {
                width: 100%;
                margin: 0;
                padding: 0;
              }
              body {
                zoom: 78%;
              }
              table {
                width: 100% !important;
                table-layout: fixed !important;
              }
              th, td {
                word-wrap: break-word !important;
                white-space: normal !important;
                font-size: 7.5px !important;
                padding: 3px !important;
              }
              tr {
                page-break-inside: avoid !important;
              }
            }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 10px;
              font-size: 8px;
              color: #333333;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #f37021;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .company {
              font-size: 18px;
              font-weight: 900;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company span {
              color: #f37021;
            }
            .meta {
              text-align: right;
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
            }
            .title-section {
              margin-bottom: 10px;
            }
            .title-section h1 {
              margin: 0;
              font-size: 14px;
              color: #f37021;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .title-section p {
              margin: 3px 0 0;
              font-size: 9px;
              color: #64748b;
            }
            .summary-box {
              margin-top: 10px;
              padding: 8px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              display: flex;
              justify-content: flex-end;
              gap: 20px;
              font-size: 9px;
              font-weight: bold;
              page-break-inside: avoid;
            }
            .summary-item {
              color: #334155;
            }
            .summary-item span {
              font-family: monospace;
              color: #f37021;
              font-size: 10px;
            }
            .footer {
              margin-top: 25px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #cbd5e1;
              padding-top: 6px;
              font-size: 8px;
              color: #64748b;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company">
              ${companyProfile.name}
            </div>
            <div class="meta">
              <strong>${companyProfile.legalStatus || 'Sole Proprietorship'} • VAT TRN: ${companyProfile.trn || '100440509600003'}</strong><br/>
              ${companyProfile.address || 'Industrial Area, Ajman, UAE'} | Email: ${companyProfile.email || 'sales@marinefasteners.co'}<br/>
              DATE GENERATED: ${todayStr} | STATUS: SYSTEM CONFIRMED
            </div>
          </div>

          <div class="title-section">
            <h1>Master Inventory Stock Report</h1>
            <p>
              Scope: ${itemsList.length === allStockItems.length ? 'FULL MASTER LEDGER' : 'ACTIVE FILTERED LEDGER'} &mdash; 
              Consolidated Fasteners Stock Valuation Audit Form
            </p>
          </div>

          <div class="summary-box">
            <div class="summary-item">Matching Records: <span>${itemsList.length} Items</span></div>
            <div class="summary-item">Total Balance Stock: <span>${finalTotalQty.toLocaleString()} PCS</span></div>
            <div class="summary-item">Total Stock Weight: <span>${finalTotalWt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG</span></div>
          </div>

          ${categorySections}

          <div class="footer">
            <div>© ${new Date().getFullYear()} ${companyProfile.name} • Confidential Internal Ledger</div>
            <div style="width: 150px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 2px; margin-top: 15px;">
              Authorized Inventory Auditor Signature
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintCategoryWeightReport = () => {
    const todayStr = new Date().toLocaleDateString('en-GB');
    const activeItems = reportScope === 'full' ? allStockItems : filteredStockReports;

    // Group items by category
    const grouped: Record<string, { count: number; totalQty: number; totalWeight: number }> = {};
    activeItems.forEach(item => {
      const cat = item.category || 'UNKNOWN';
      if (!grouped[cat]) {
        grouped[cat] = { count: 0, totalQty: 0, totalWeight: 0 };
      }
      grouped[cat].count += 1;
      grouped[cat].totalQty += (item.product.balanceStock || 0);
      grouped[cat].totalWeight += getRowTotalWeight(item.product, item.category);
    });

    const categoriesList = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
    const grandTotalBatches = categoriesList.reduce((sum, c) => sum + c[1].count, 0);
    const grandTotalQty = categoriesList.reduce((sum, c) => sum + c[1].totalQty, 0);
    const grandTotalWeight = categoriesList.reduce((sum, c) => sum + c[1].totalWeight, 0);

    const rowsHtml = categoriesList.map(([catName, stats], index) => {
      const rowClass = index % 2 === 0 ? 'bg-even' : 'bg-odd';
      return `
        <tr class="${rowClass}">
          <td style="padding: 10px 12px; font-weight: bold; font-size: 11px; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #cbd5e1; text-align: left;">
            📁 ${catName.toUpperCase()}
          </td>
          <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #475569; border-bottom: 1px solid #cbd5e1; text-align: center;">
            ${stats.count}
          </td>
          <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #475569; border-bottom: 1px solid #cbd5e1; text-align: right; font-weight: 500;">
            ${stats.totalQty.toLocaleString()}
          </td>
          <td style="padding: 10px 12px; font-family: monospace; font-size: 11px; color: #083c54; border-bottom: 1px solid #cbd5e1; text-align: right; font-weight: bold;">
            ${stats.totalWeight.toFixed(2)} KG
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Category Weight Summary</title>
          <style>
            @page {
              size: portrait;
              margin: 15mm 15mm 15mm 15mm;
            }
            @media print {
              html, body {
                width: 100%;
                margin: 0;
                padding: 0;
              }
              body {
                zoom: 95%;
              }
              .report-table {
                width: 100% !important;
                table-layout: fixed !important;
              }
              .report-table th, .report-table td {
                word-wrap: break-word !important;
                white-space: normal !important;
              }
            }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 11px;
              color: #333333;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #f37021;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .company {
              font-size: 18px;
              font-weight: 900;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company span {
              color: #f37021;
            }
            .meta {
              text-align: right;
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
            }
            .title-section {
              margin-bottom: 20px;
              text-align: center;
            }
            .title-section h1 {
              margin: 0;
              font-size: 16px;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .title-section p {
              margin: 5px 0 0;
              font-size: 10px;
              color: #64748b;
              font-weight: 500;
              text-transform: uppercase;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              border: 1px solid #94a3b8;
              box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            .report-table th {
              background-color: #083c54;
              color: #ffffff;
              padding: 10px 12px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 2px solid #062c3e;
              letter-spacing: 0.5px;
            }
            .bg-even {
              background-color: #ffffff;
            }
            .bg-odd {
              background-color: #f8fafc;
            }
            .grand-total-row {
              background-color: #f1f5f9;
              font-weight: bold;
              border-top: 2px solid #94a3b8;
              border-bottom: 2px double #94a3b8;
            }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #cbd5e1;
              padding-top: 10px;
              font-size: 9px;
              color: #64748b;
            }
            .signature {
              width: 180px;
              border-top: 1px solid #94a3b8;
              text-align: center;
              padding-top: 4px;
              margin-top: 25px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company">
              ${companyProfile.name.toUpperCase()}
            </div>
            <div class="meta">
              <strong>${companyProfile.headerTagline || 'Corporate ERP'} • VAT No. ${companyProfile.trn || '100345229000003'}</strong><br/>
              ${companyProfile.address || 'Ajman, UAE'} | Email: ${companyProfile.email || 'sales@marinefasteners.co'}<br/>
              DATE GENERATED: ${todayStr} | STATUS: SYSTEM CONFIRMED
            </div>
          </div>

          <div class="title-section">
            <h1 style="color: #f37021;">Category-Wise Total Weight Summary</h1>
            <p>
              Scope: ${activeItems.length === allStockItems.length ? 'FULL MASTER SUMMARY' : 'ACTIVE FILTERED SUMMARY'}
            </p>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th style="text-align: left;">Category Name</th>
                <th style="text-align: center; width: 120px;">Total Batches</th>
                <th style="text-align: right; width: 150px;">Total Bal Qty (Pcs)</th>
                <th style="text-align: right; width: 150px;">Total Net Weight</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="grand-total-row">
                <td style="padding: 12px 12px; text-align: left; text-transform: uppercase; font-weight: 800; color: #1e293b;">
                  GRAND TOTAL SUMMARY:
                </td>
                <td style="padding: 12px 12px; text-align: center; font-family: monospace; font-size: 11px; font-weight: 800; color: #1e293b;">
                  ${grandTotalBatches}
                </td>
                <td style="padding: 12px 12px; text-align: right; font-family: monospace; font-size: 11px; font-weight: 800; color: #f37021;">
                  ${grandTotalQty.toLocaleString()}
                </td>
                <td style="padding: 12px 12px; text-align: right; font-family: monospace; font-size: 11px; font-weight: 900; color: #083c54;">
                  ${grandTotalWeight.toFixed(2)} KG
                </td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div>© ${new Date().getFullYear()} ${companyProfile.name} • Confidential Summary Ledger</div>
            <div class="signature">
              Authorized Inventory Auditor Signature
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `${companyProfile.name} - Category-Wise Total Weight Summary (Portrait)`);
    triggerToast("Category-Wise Weight Summary Report print preview opened!");
  };

  const handlePrintReport = () => {
    const dataToUse = reportScope === 'full' ? allStockItems : filteredStockReports;
    const reportTitle = `Master Inventory Stock Report - ${companyProfile.name}`;
    const htmlContent = getStockReportPrintHtml(dataToUse);
    printHtml(htmlContent, reportTitle);
    triggerToast("Stock Report print preview opened!");
  };

  const handleDownloadExcelStockReport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dataToUse = reportScope === 'full' ? allStockItems : filteredStockReports;
    const totalRowsCount = dataToUse.length;
    const totalBalanceQty = dataToUse.reduce((sum, item) => sum + (item.product.balanceStock || 0), 0);
    const totalWeightKg = dataToUse.reduce((sum, item) => sum + getRowTotalWeight(item.product, item.category), 0);

    let tablesHtml = '';

    const grouped: Record<string, FlatStockItem[]> = {};
    dataToUse.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    Object.entries(grouped).forEach(([categoryName, items]) => {
      const cols = getCategoryTableColumnsForPrint(categoryName, customColumnOptions);
      const totalColspan = cols.length;

      tablesHtml += `
        <!-- Section divider for category -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td colspan="${totalColspan}" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #ffffff; background-color: #f37021; padding: 6px; height: 26px; text-transform: uppercase;">
              Category: ${categoryName.replace(/"/g, '&quot;')}
            </td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 3px; border: 1px solid #cbd5e1; margin-bottom: 12px;">
          <thead>
            <tr>
              ${cols.map(col => {
                let bg = 'background-color: #1e293b;';
                if (col.header === 'BALANCE STOCK' || col.header === 'BAL PCS') {
                  bg = 'background-color: #f37021;';
                } else if (col.header.includes('TOTAL WEIGHT')) {
                  bg = 'background-color: #1e293b;';
                }
                const align = col.align === 'center' ? 'text-align: center;' : col.align === 'right' ? 'text-align: right;' : 'text-align: left;';
                return `<th style="${bg} color: white; border: 1px solid #cbd5e1; padding: 4px; font-weight: bold; ${align} text-transform: uppercase;">${col.header}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      items.forEach((item, index) => {
        const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
        tablesHtml += `
          <tr class="${rowClass}">
            ${cols.map(col => {
              const val = col.getValue(item);
              const alignClass = col.align === 'center' ? 'center-cell' : col.align === 'right' ? 'num-cell' : 'text-cell';
              const styleAttr = col.excelStyle ? `style="border: 1px solid #cbd5e1; padding: 4px; mso-number-format: '${col.excelStyle}';"` : `style="border: 1px solid #cbd5e1; padding: 4px;"`;
              
              let extraStyle = '';
              if (col.header === 'BALANCE STOCK' || col.header === 'BAL PCS') {
                extraStyle = ' background-color: #fff8f5; color: #f37021; font-weight: bold;';
              } else if (col.header.includes('TOTAL WEIGHT')) {
                extraStyle = ' font-weight: bold;';
              } else if (col.header === 'PART NO') {
                extraStyle = ' font-weight: bold;';
              }

              return `<td ${styleAttr} class="${alignClass}${extraStyle}">${String(val).replace(/"/g, '&quot;')}</td>`;
            }).join('')}
          </tr>
        `;
      });

      const totalQty = items.reduce((sum, item) => sum + (item.product.balanceStock || 0), 0);
      const totalWt = items.reduce((sum, item) => sum + getRowTotalWeight(item.product, item.category), 0);
      const balanceIdx = cols.findIndex(c => c.header === 'BALANCE STOCK' || c.header === 'BAL PCS');
      const colspanVal = balanceIdx !== -1 ? balanceIdx : cols.length - 1;

      tablesHtml += `
            <tr class="total-row" style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="${colspanVal}" style="padding: 6px; text-align: right; border: 1px solid #cbd5e1; color: #64748b;">SUB-TOTAL of ${categoryName.toUpperCase()}:</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #cbd5e1; color: #f37021; background-color: #fff8f5;" class="num-cell">${totalQty.toLocaleString()}</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #cbd5e1;" class="num-cell">${totalWt.toFixed(2)} KG</td>
              ${cols.length - colspanVal > 2 ? `<td colspan="${cols.length - colspanVal - 2}" style="border: 1px solid #cbd5e1;"></td>` : ''}
            </tr>
          </tbody>
        </table>
      `;
    });

    const template = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>STOCK VALUATION</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .title-cell { font-family: 'Segoe UI'; font-size: 14pt; font-weight: bold; color: #1e293b; text-align: left; vertical-align: middle; }
    .subtitle-cell { font-family: 'Segoe UI'; font-size: 9pt; color: #475569; text-align: left; vertical-align: middle; }
    .meta-cell { font-family: 'Segoe UI'; font-size: 9pt; color: #475569; text-align: right; vertical-align: middle; }
    
    .kpi-title { font-family: 'Segoe UI'; font-size: 8pt; font-weight: bold; color: #64748b; background-color: #f8fafc; text-align: center; border: 1px solid #cbd5e1; text-transform: uppercase; }
    .kpi-value { font-family: 'Segoe UI'; font-size: 11pt; font-weight: bold; color: #f37021; background-color: #f8fafc; text-align: center; border: 1px solid #cbd5e1; }
    
    th { font-family: 'Segoe UI'; font-size: 9pt; font-weight: bold; color: #ffffff; background-color: #1e293b; border: 1px solid #cbd5e1; text-align: left; vertical-align: middle; padding: 6px 4px; }
    
    td { font-family: 'Segoe UI'; font-size: 9pt; border: 1px solid #cbd5e1; vertical-align: middle; padding: 4px; }
    .row-even { background-color: #ffffff; }
    .row-odd { background-color: #f8fafc; }
    
    .text-cell { mso-number-format: "\\@"; text-align: left; }
    .center-cell { text-align: center; mso-number-format: "\\@"; }
    .num-cell { mso-number-format: "#,##0"; text-align: right; }
    
    .highlight-qty { font-weight: bold; color: #f37021; background-color: #fff8f5; }
    
    .total-row td { background-color: #f8fafc; font-weight: bold; font-size: 9pt; border-top: 2px solid #f37021; border-bottom: 3px double #f37021; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="11" class="title-cell" style="height: 35px;">${companyProfile.name.toUpperCase()}</td>
    </tr>
    <tr>
      <td colspan="7" class="subtitle-cell" style="height: 20px;">${companyProfile.headerTagline || 'Corporate ERP'} • VAT No. ${companyProfile.trn || '100345229000003'} • ${companyProfile.address || 'Ajman UAE'}</td>
      <td colspan="4" class="meta-cell">DATE GENERATED: <span style="font-weight: bold;">${todayStr}</span></td>
    </tr>
    
    <tr style="height: 10px;"><td colspan="11"></td></tr>
    
    <tr style="height: 18px;">
      <td colspan="3" class="kpi-title">Active Records</td>
      <td></td>
      <td colspan="3" class="kpi-title">Consolidated Stock PCS</td>
      <td></td>
      <td colspan="3" class="kpi-title">Consolidated Net Weight</td>
    </tr>
    <tr style="height: 24px;">
      <td colspan="3" class="kpi-value">${totalRowsCount} Items</td>
      <td></td>
      <td colspan="3" class="kpi-value">${totalBalanceQty.toLocaleString('en-US')} PCS</td>
      <td></td>
      <td colspan="3" class="kpi-value">${totalWeightKg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG</td>
    </tr>
    
    <tr style="height: 15px;"><td colspan="11"></td></tr>
  </table>

  ${tablesHtml || '<div style="padding: 10px;">No matching records found.</div>'}

  <br/>
  <table>
    <tr style="height: 20px;">
      <td colspan="11" style="font-size: 8.5pt; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1;">
        ${companyProfile.name} Internal Audit & Stock Valuation Ledger spreadsheet.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MFI_Stock_Valuation_Report_${todayStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Excel stock report generated & downloaded successfully!");
  };

  const handleDownloadExcelOutgoingReport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dataToUse = reportScope === 'full' ? allStockItems : filteredStockReports;
    const outgoingItems = dataToUse.filter(item => (item.product.outGoingStock || 0) > 0);

    if (outgoingItems.length === 0) {
      triggerToast("No items found with outgoing stock to export.");
      return;
    }

    const totalRowsCount = outgoingItems.length;
    const totalQty = outgoingItems.reduce((sum, item) => sum + (item.product.outGoingStock || 0), 0);
    const totalWt = outgoingItems.reduce((sum, item) => sum + ((item.product.outGoingStock || 0) * (item.product.unitWeight || 0)), 0);

    let tablesHtml = '';

    const grouped: Record<string, FlatStockItem[]> = {};
    outgoingItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    Object.entries(grouped).forEach(([categoryName, items]) => {
      const cols = getCategoryOutgoingColumnsForPrint(categoryName);
      const totalColspan = cols.length + 1; // Category column + other columns

      tablesHtml += `
        <!-- Section divider for category -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td colspan="${totalColspan}" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #ffffff; background-color: #f37021; padding: 6px; height: 26px; text-transform: uppercase;">
              Category: ${categoryName.replace(/"/g, '&quot;')}
            </td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 3px; border: 1px solid #cbd5e1; margin-bottom: 12px;">
          <thead>
            <tr>
              <th style="background-color: #1e293b; color: white; border: 1px solid #cbd5e1; padding: 4px; font-weight: bold; text-align: left; text-transform: uppercase;">Category</th>
              ${cols.map(col => {
                let bg = 'background-color: #1e293b;';
                if (col.header === 'OUT PCS') {
                  bg = 'background-color: #f37021;';
                } else if (col.header === 'OUT WT') {
                  bg = 'background-color: #1e293b;';
                }
                const align = col.align === 'center' ? 'text-align: center;' : col.align === 'right' ? 'text-align: right;' : 'text-align: left;';
                return `<th style="${bg} color: white; border: 1px solid #cbd5e1; padding: 4px; font-weight: bold; ${align} text-transform: uppercase;">${col.header}</th>`;
              }).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      items.forEach((item, index) => {
        const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
        tablesHtml += `
          <tr class="${rowClass}">
            <td style="border: 1px solid #cbd5e1; padding: 4px; font-weight: bold;" class="text-cell">${item.category.replace(/"/g, '&quot;')}</td>
            ${cols.map(col => {
              const val = col.getValue(item);
              const alignClass = col.align === 'center' ? 'center-cell' : col.align === 'right' ? 'num-cell' : 'text-cell';
              const styleAttr = col.excelStyle ? `style="border: 1px solid #cbd5e1; padding: 4px; mso-number-format: '${col.excelStyle}';"` : `style="border: 1px solid #cbd5e1; padding: 4px;"`;
              
              let extraStyle = '';
              if (col.header === 'OUT PCS') {
                extraStyle = ' background-color: #fff8f5; color: #f37021; font-weight: bold;';
              } else if (col.header === 'OUT WT') {
                extraStyle = ' font-weight: bold; color: #0f172a;';
              } else if (col.header === 'PART NO') {
                extraStyle = ' font-weight: bold;';
              }

              return `<td ${styleAttr} class="${alignClass}${extraStyle}">${String(val).replace(/"/g, '&quot;')}</td>`;
            }).join('')}
          </tr>
        `;
      });

      const catTotalQty = items.reduce((sum, item) => sum + (item.product.outGoingStock || 0), 0);
      const catTotalWt = items.reduce((sum, item) => sum + ((item.product.outGoingStock || 0) * (item.product.unitWeight || 0)), 0);
      const outPcsIdx = cols.findIndex(c => c.header === 'OUT PCS');
      const colspanVal = outPcsIdx !== -1 ? outPcsIdx + 1 : cols.length - 1; // plus 1 for category column

      tablesHtml += `
            <tr class="total-row" style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="${colspanVal}" style="padding: 6px; text-align: right; border: 1px solid #cbd5e1; color: #64748b;">SUB-TOTAL of ${categoryName.toUpperCase()}:</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #cbd5e1; color: #f37021; background-color: #fff8f5;" class="num-cell">${catTotalQty.toLocaleString()}</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #cbd5e1;" class="num-cell">${catTotalWt.toFixed(2)} KG</td>
              ${cols.length - colspanVal > 1 ? `<td colspan="${cols.length - colspanVal - 1}" style="border: 1px solid #cbd5e1;"></td>` : ''}
            </tr>
          </tbody>
        </table>
      `;
    });

    const template = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>OUTGOING DISPATCH</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .title-cell { font-family: 'Segoe UI'; font-size: 14pt; font-weight: bold; color: #1e293b; text-align: left; vertical-align: middle; }
    .subtitle-cell { font-family: 'Segoe UI'; font-size: 9pt; color: #475569; text-align: left; vertical-align: middle; }
    .meta-cell { font-family: 'Segoe UI'; font-size: 9pt; color: #475569; text-align: right; vertical-align: middle; }
    
    .kpi-title { font-family: 'Segoe UI'; font-size: 8pt; font-weight: bold; color: #64748b; background-color: #f8fafc; text-align: center; border: 1px solid #cbd5e1; text-transform: uppercase; }
    .kpi-value { font-family: 'Segoe UI'; font-size: 11pt; font-weight: bold; color: #f37021; background-color: #f8fafc; text-align: center; border: 1px solid #cbd5e1; }
    
    th { font-family: 'Segoe UI'; font-size: 9pt; font-weight: bold; color: #ffffff; background-color: #1e293b; border: 1px solid #cbd5e1; text-align: left; vertical-align: middle; padding: 6px 4px; }
    
    td { font-family: 'Segoe UI'; font-size: 9pt; border: 1px solid #cbd5e1; vertical-align: middle; padding: 4px; }
    .row-even { background-color: #ffffff; }
    .row-odd { background-color: #f8fafc; }
    
    .text-cell { mso-number-format: "\\@"; text-align: left; }
    .center-cell { text-align: center; mso-number-format: "\\@"; }
    .num-cell { mso-number-format: "#,##0"; text-align: right; }
    
    .highlight-qty { font-weight: bold; color: #f37021; background-color: #fff8f5; }
    
    .total-row td { background-color: #f8fafc; font-weight: bold; font-size: 9pt; border-top: 2px solid #f37021; border-bottom: 3px double #f37021; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="10" class="title-cell" style="height: 35px;">${companyProfile.name.toUpperCase()}</td>
    </tr>
    <tr>
      <td colspan="6" class="subtitle-cell" style="height: 20px;">${companyProfile.headerTagline || 'Corporate ERP'} • Outgoing Materials dispatch spreadsheet • ${companyProfile.address || 'Ajman UAE'}</td>
      <td colspan="4" class="meta-cell">DATE GENERATED: <span style="font-weight: bold;">${todayStr}</span></td>
    </tr>
    
    <tr style="height: 10px;"><td colspan="10"></td></tr>
    
    <tr style="height: 18px;">
      <td colspan="3" class="kpi-title">Active Dispatches</td>
      <td></td>
      <td colspan="3" class="kpi-title">Outgoing PCS</td>
      <td></td>
      <td colspan="2" class="kpi-title">Outgoing Weight</td>
    </tr>
    <tr style="height: 24px;">
      <td colspan="3" class="kpi-value">${totalRowsCount} Items</td>
      <td></td>
      <td colspan="3" class="kpi-value">${totalQty.toLocaleString('en-US')} PCS</td>
      <td></td>
      <td colspan="2" class="kpi-value">${totalWt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG</td>
    </tr>
    
    <tr style="height: 15px;"><td colspan="10"></td></tr>
  </table>

  ${tablesHtml || '<div style="padding: 10px;">No outgoing records found.</div>'}

  <br/>
  <table>
    <tr style="height: 20px;">
      <td colspan="10" style="font-size: 8.5pt; color: #64748b; text-align: center; border-top: 1px solid #cbd5e1;">
        ${companyProfile.name} Outgoing Materials Dispatch Ledger.
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MFI_Outgoing_Dispatch_Report_${todayStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Excel outgoing dispatch report generated & downloaded successfully!");
  };

  const handlePrintOutgoingReport = () => {
    const todayStr = new Date().toLocaleDateString('en-GB');
    const dataToUse = reportScope === 'full' ? allStockItems : filteredStockReports;
    const outgoingItems = dataToUse.filter(item => (item.product.outGoingStock || 0) > 0);

    if (outgoingItems.length === 0) {
      triggerToast("No items found with outgoing stock to print.");
      return;
    }

    const grouped: { [category: string]: FlatStockItem[] } = {};
    outgoingItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    const categorySections = Object.entries(grouped).map(([categoryName, items]) => {
      const cols = getCategoryOutgoingColumnsForPrint(categoryName);
      const headersHtml = `
        <tr style="page-break-inside: avoid; page-break-after: avoid;">
          ${cols.map(col => {
            const alignStyle = col.align === 'center' ? 'text-align: center;' : col.align === 'right' ? 'text-align: right;' : 'text-align: left;';
            return `<th style="padding: 5px; border: 1px solid #cbd5e1; background-color: #1e293b; color: white; font-weight: bold; font-size: 8px; ${alignStyle}">${col.header}</th>`;
          }).join('')}
        </tr>
      `;

      const rowsHtml = items.map((item) => {
        return `
          <tr style="border-bottom: 1px solid #cbd5e1; font-family: monospace;">
            ${cols.map(col => {
              const val = col.getValue(item);
              const alignStyle = col.align === 'center' ? 'text-align: center;' : col.align === 'right' ? 'text-align: right;' : 'text-align: left;';
              
              let cellContent = val;
              if (col.isNumeric) {
                if (col.header === 'OUT PCS' || col.header === 'BALANCE STOCK' || col.header === 'BAL PCS') {
                  cellContent = (Number(val) || 0).toLocaleString();
                } else if (col.header === 'OUT WT') {
                  cellContent = (Number(val) || 0).toFixed(2);
                } else if (col.header.includes('UNIT WEIGHT')) {
                  cellContent = (Number(val) || 0).toFixed(4);
                } else {
                  cellContent = (Number(val) || 0).toLocaleString();
                }
              }

              let extraStyle = '';
              if (col.header === 'OUT PCS') {
                extraStyle = 'font-weight: bold; background-color: #fff8f5; color: #f37021;';
              } else if (col.header === 'OUT WT') {
                extraStyle = 'font-weight: bold; color: #0f172a;';
              } else if (col.header === 'PART NO') {
                extraStyle = 'font-weight: bold;';
              }

              return `<td style="padding: 4px; border: 1px solid #cbd5e1; font-size: 8px; ${alignStyle} ${extraStyle}">${cellContent}</td>`;
            }).join('')}
          </tr>
        `;
      }).join('');

      const totalQty = items.reduce((sum, item) => sum + (item.product.outGoingStock || 0), 0);
      const totalWt = items.reduce((sum, item) => sum + ((item.product.outGoingStock || 0) * (item.product.unitWeight || 0)), 0);
      const outPcsIdx = cols.findIndex(c => c.header === 'OUT PCS');
      const colspanVal = outPcsIdx !== -1 ? outPcsIdx : cols.length - 2;

      return `
        <div style="margin-top: 15px; margin-bottom: 5px; page-break-inside: avoid;">
          <h2 style="font-size: 11px; font-weight: 800; color: #f37021; text-transform: uppercase; border-bottom: 2px solid #f37021; padding-bottom: 2px; margin: 15px 0 5px 0;">
            Category: ${categoryName.toUpperCase()} &mdash; ${items.length} Lines
          </h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 8px; border: 1px solid #cbd5e1; margin-bottom: 15px;">
          <thead>
            ${headersHtml}
          </thead>
          <tbody>
            ${rowsHtml}
            <tr style="font-weight: bold; background-color: #f8fafc; page-break-inside: avoid;">
              <td colspan="${colspanVal}" style="padding: 5px; text-align: right; text-transform: uppercase; border: 1px solid #cbd5e1; font-weight: bold; color: #64748b;">Sub-Total of ${categoryName.toUpperCase()}:</td>
              <td style="padding: 5px; text-align: right; color: #f37021; border: 1px solid #cbd5e1; font-weight: bold; background-color: #fff8f5;">${totalQty.toLocaleString()}</td>
              <td style="padding: 5px; text-align: right; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${totalWt.toFixed(2)} KG</td>
              ${cols.length - colspanVal > 2 ? `<td colspan="${cols.length - colspanVal - 2}" style="border: 1px solid #cbd5e1; padding: 5px;"></td>` : ''}
            </tr>
          </tbody>
        </table>
      `;
    }).join('');

    const finalTotalQty = outgoingItems.reduce((sum, item) => sum + (item.product.outGoingStock || 0), 0);
    const finalTotalWt = outgoingItems.reduce((sum, item) => sum + ((item.product.outGoingStock || 0) * (item.product.unitWeight || 0)), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Outgoing Stock Dispatch Report</title>
          <style>
            @page {
              size: landscape;
              margin: 10mm 10mm 10mm 10mm;
            }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 10px;
              font-size: 8px;
              color: #333333;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #f37021;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .company {
              font-size: 20px;
              font-weight: 900;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company span {
              color: #f37021;
            }
            .meta {
              text-align: right;
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
            }
            .title-section {
              margin-bottom: 10px;
            }
            .title-section h1 {
              margin: 0;
              font-size: 14px;
              color: #f37021;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .title-section p {
              margin: 3px 0 0;
              font-size: 9px;
              color: #64748b;
            }
            .summary-box {
              margin-top: 10px;
              padding: 8px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              display: flex;
              justify-content: flex-end;
              gap: 20px;
              font-size: 9px;
              font-weight: bold;
              page-break-inside: avoid;
            }
            .summary-item {
              color: #334155;
            }
            .summary-item span {
              font-family: monospace;
              color: #f37021;
              font-size: 10px;
            }
            .footer {
              margin-top: 25px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #cbd5e1;
              padding-top: 6px;
              font-size: 8px;
              color: #64748b;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company">
              ${companyProfile.name}
            </div>
            <div class="meta">
              <strong>${companyProfile.legalStatus || 'Sole Proprietorship'} • VAT TRN: ${companyProfile.trn || '100440509600003'}</strong><br/>
              ${companyProfile.address || 'Industrial Area, Ajman, UAE'} | Email: ${companyProfile.email || 'sales@marinefasteners.co'}<br/>
              DATE GENERATED: ${todayStr} | STATUS: SYSTEM CONFIRMED
            </div>
          </div>

          <div class="title-section">
            <h1>Master Outgoing Dispatch Stock Report</h1>
            <p>
              Scope: ${dataToUse.length === allStockItems.length ? 'FULL MASTER REGISTER' : 'ACTIVE FILTERED REGISTER'} &mdash; 
              Consolidated Materials Dispatch Verification Form
            </p>
          </div>

          <div class="summary-box">
            <div class="summary-item">Matching Dispatched Lines: <span>${outgoingItems.length} Lines</span></div>
            <div class="summary-item">Total Dispatched PCS: <span>${finalTotalQty.toLocaleString()} PCS</span></div>
            <div class="summary-item">Total Outgoing Weight: <span>${finalTotalWt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG</span></div>
          </div>

          ${categorySections}

          <div class="footer">
            <div>© ${new Date().getFullYear()} ${companyProfile.name} • Confidential Dispatch Record</div>
            <div style="width: 150px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 2px; margin-top: 15px;">
              Authorized Dispatch Officer Signature
            </div>
          </div>
        </body>
      </html>
    `;

    const reportTitle = `Outgoing Materials Ledger - ${companyProfile.name}`;
    printHtml(htmlContent, reportTitle);
    triggerToast("Outgoing Stock Report print preview opened!");
  };

  const groupedStock = useMemo<Record<string, FlatStockItem[]>>(() => {
    const groups: Record<string, FlatStockItem[]> = {};
    filteredStockReports.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredStockReports]);

  // Refs for scrolling to top/bottom of stock report
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Global index tracking for table rows
  let rowGlobalIdx = 0;

  return (
    <div ref={topRef} onContextMenu={handleContextMenu} className="bg-white p-2 space-y-4 w-full text-slate-800 relative">
      
      {/* Sticky Header, Menu & Actions Container */}
      <div className="sticky top-0 bg-white z-30 pt-1 pb-3 space-y-4 border-b border-slate-200">
        
        {/* ERP Plain Ledger Header */}
        <div className="border-b-2 border-slate-900 pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
            
            {/* Title and Subtitle */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase font-sans">
                  INVENTORY STOCK LEDGER SHEET
                </h1>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 bg-[#f37021]/10 text-[#f37021] border border-[#f37021]/30 rounded">
                  MASTER LEDGER
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 font-mono">
                Official Inventory Stock & Valuation Audit Ledger &bull; As At {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>

            {/* Right Audit Details */}
            <div className="text-right flex flex-col items-end">
              <div className="font-mono text-[8.5px] text-slate-500 leading-tight">
                <div>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                <div>ADMIN | <span className="page-number-display">Page 1 of 1</span></div>
              </div>
            </div>

          </div>
        </div>

      {/* Filter Selection Box - REDESIGNED SIMPLE, INTUITIVE LAYOUT */}
      <div className="border border-slate-200 bg-white p-2 rounded-sm shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#f37021]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 font-mono">
              STOCK LEDGER SHEET FILTERS
            </span>
            <span className="text-[7.5px] font-mono text-slate-400 font-bold hidden md:inline">
              (Class &gt; Category &gt; Sub Category &gt; Thread Series &gt; Technical Grade)
            </span>
          </div>

          {/* Quick Stock Entry (+) Shortcut Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (onOpenQuickStockEntry) {
                  onOpenQuickStockEntry();
                } else {
                  window.dispatchEvent(new CustomEvent('open_quick_stock_entry'));
                }
              }}
              title="Quick Stock Entry Masters (Press +)"
              className="px-2.5 py-1 bg-[#f37021] hover:bg-[#d65d14] text-white rounded text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer select-none font-mono"
            >
              <span className="flex items-center justify-center w-3 h-3 bg-white/25 rounded font-black text-[10px] leading-none">+</span>
              <span>Add Stock</span>
              <kbd className="px-1 py-0.2 bg-black/30 text-amber-200 rounded text-[7.5px] font-mono leading-none border border-white/20 font-bold">
                +
              </kbd>
            </button>
          </div>
        </div>

        {/* 5 Simple, Clean, High-Contrast Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* 1. Thread Class */}
          <div className="flex flex-col gap-1 bg-slate-50/80 border border-slate-250 hover:border-[#f37021] rounded p-1.5 transition-all group">
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase font-mono">
              <span className="flex items-center gap-1">
                <Sliders className="w-2.5 h-2.5 text-[#f37021]" />
                <span>1. CLASS</span>
              </span>
              <span className="text-[7px] text-slate-400">SERIES</span>
            </div>
            <select
              value={tempStockSectionFilter}
              onChange={(e) => {
                const val = e.target.value;
                setTempStockSectionFilter(val);
                setStockSectionFilter(val);
              }}
              className="w-full bg-white border border-slate-200 focus:border-[#f37021] rounded px-1.5 py-1 text-[8.5px] font-bold text-slate-800 outline-none cursor-pointer truncate font-mono"
              title="Filter by Thread Class"
            >
              <option value="">ALL CLASSES</option>
              <option value="Standard">STANDARD</option>
              <option value="Fine">FINE (UNF)</option>
            </select>
          </div>

          {/* 2. Category Selector */}
          <div className="flex flex-col gap-1 bg-slate-50/80 border border-slate-250 hover:border-blue-500 rounded p-1.5 transition-all group">
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase font-mono">
              <span className="flex items-center gap-1">
                <Folder className="w-2.5 h-2.5 text-blue-600" />
                <span>2. CATEGORY</span>
              </span>
              <span className="text-[7px] text-slate-400">{stockAvailableCategories.length}</span>
            </div>
            <select
              value={tempStockCatFilter}
              onChange={(e) => {
                const val = e.target.value;
                setTempStockCatFilter(val);
                setStockCatFilter(val);
                setTempStockSubCatFilter('');
                setStockSubCatFilter('');
                setTempStockThreadFilter('');
                setStockThreadFilter('');
                setTempStockGradeFilter('');
                setStockGradeFilter('');
              }}
              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-1.5 py-1 text-[8.5px] font-bold text-slate-800 outline-none cursor-pointer truncate font-mono"
              title="Filter by Category"
            >
              <option value="">ALL CATEGORIES</option>
              {stockAvailableCategories.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* 3. Sub Category */}
          <div className="flex flex-col gap-1 bg-slate-50/80 border border-slate-250 hover:border-emerald-500 rounded p-1.5 transition-all group">
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase font-mono">
              <span className="flex items-center gap-1">
                <GitFork className="w-2.5 h-2.5 text-emerald-600" />
                <span>3. SUB-CATEGORY</span>
              </span>
              <span className="text-[7px] text-slate-400">{stockAvailableSubCategories.length}</span>
            </div>
            <select
              value={tempStockSubCatFilter}
              onChange={(e) => {
                const val = e.target.value;
                setTempStockSubCatFilter(val);
                setStockSubCatFilter(val);
                setTempStockThreadFilter('');
                setStockThreadFilter('');
                setTempStockGradeFilter('');
                setStockGradeFilter('');
              }}
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded px-1.5 py-1 text-[8.5px] font-bold text-slate-800 outline-none cursor-pointer truncate font-mono"
              title="Filter by Sub-Category"
            >
              <option value="">ALL SUBCATEGORIES</option>
              {stockAvailableSubCategories.map(sub => (
                <option key={sub} value={sub}>{sub.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* 4. Thread Series */}
          <div className="flex flex-col gap-1 bg-slate-50/80 border border-slate-250 hover:border-amber-500 rounded p-1.5 transition-all group">
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase font-mono">
              <span className="flex items-center gap-1">
                <Ruler className="w-2.5 h-2.5 text-amber-600" />
                <span>4. THREAD SERIES</span>
              </span>
              <span className="text-[7px] text-slate-400">{stockAvailableThreadTypes.length}</span>
            </div>
            <select
              value={tempStockThreadFilter}
              onChange={(e) => {
                const val = e.target.value;
                setTempStockThreadFilter(val);
                setStockThreadFilter(val);
                setTempStockGradeFilter('');
                setStockGradeFilter('');
              }}
              className="w-full bg-white border border-slate-200 focus:border-amber-600 rounded px-1.5 py-1 text-[8.5px] font-bold text-slate-800 outline-none cursor-pointer truncate font-mono"
              title="Filter by Thread Type"
            >
              <option value="">ALL THREADS</option>
              {stockAvailableThreadTypes.map(tt => (
                <option key={tt} value={tt}>{tt.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* 5. Technical Grade Box */}
          <div className="flex flex-col gap-1 bg-slate-50/80 border border-amber-300/80 hover:border-amber-500 rounded p-1.5 transition-all group bg-amber-50/20">
            <div className="flex items-center justify-between text-[8px] font-bold text-amber-700 uppercase font-mono">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-purple-600" />
                <span>5. TECHNICAL GRADE</span>
              </span>
              <span className="text-[7px] text-amber-600 font-bold">{stockAvailableGrades.length}</span>
            </div>
            <select
              value={tempStockGradeFilter}
              onChange={(e) => {
                const val = e.target.value;
                setTempStockGradeFilter(val);
                setStockGradeFilter(val);
              }}
              className="w-full bg-white border border-amber-250 focus:border-purple-600 rounded px-1.5 py-1 text-[8.5px] font-bold text-slate-800 outline-none cursor-pointer truncate font-mono"
              title="Filter by Technical Grade"
            >
              <option value="">ALL TECHNICAL GRADES</option>
              {stockAvailableGrades.map(g => (
                <option key={g} value={g}>{g.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input Bar & Filter Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Keyword Search */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-2 py-1 h-7 min-w-[200px] sm:min-w-[260px]">
            <Search className="w-3 h-3 text-slate-400 shrink-0" />
            <input
              type="text"
              value={tempStockSearchQuery}
              onChange={(e) => setTempStockSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setStockSearchQuery(tempStockSearchQuery);
                  triggerToast("Search query applied!");
                }
              }}
              placeholder="Search Part No, Dia, Length, Finish..."
              className="bg-transparent border-none text-[8.5px] outline-none font-mono w-full text-slate-800 placeholder:text-slate-400"
            />
            {tempStockSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setTempStockSearchQuery('');
                  setStockSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Action Buttons: Reset & Apply */}
          <div className="flex items-center gap-1.5 h-7">
            <button
              onClick={handleResetStockFilters}
              title="Reset all filters to default"
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase text-[8px] rounded cursor-pointer border border-slate-200 font-mono transition-colors h-full flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>RESET</span>
            </button>
            <button
              onClick={handleApplyStockFilters}
              title="Search and apply selected values"
              className="px-3 py-1 bg-[#f37021] hover:bg-[#d65d14] text-white font-bold uppercase text-[8px] rounded cursor-pointer border-none font-mono transition-colors h-full flex items-center justify-center gap-1 whitespace-nowrap shadow-xs"
            >
              <Filter className="w-2.5 h-2.5" />
              <span>APPLY FILTERS</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXPORT & PRINT COMMAND CENTER - COMPACT 4-ICON ROW */}
      <div className="border border-slate-200 bg-white p-2 rounded-sm shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* TWO VIEW MODE SWITCHER ICONS: SIMPLE VIEW & DETAILS VIEW */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setInventoryViewMode('simple');
                triggerToast("Inventory View: SIMPLE VIEW");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[8px] font-bold font-mono uppercase cursor-pointer transition-all ${
                inventoryViewMode === 'simple'
                  ? 'bg-[#083c54] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
              title="Simple View mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>SIMPLE VIEW</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInventoryViewMode('details');
                triggerToast("Inventory View: DETAILS VIEW (Opening, Incoming, Outgoing, Balance, Tally, Unit Weight, Total Weight)");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[8px] font-bold font-mono uppercase cursor-pointer transition-all ${
                inventoryViewMode === 'details'
                  ? 'bg-[#f37021] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
              title="Details View mode (Opening, Incoming, Outgoing, Balance, Tally, Unit Weight, Total Weight)"
            >
              <Table className="w-3.5 h-3.5" />
              <span>DETAILS VIEW</span>
            </button>
          </div>

          {/* Selected Box 1: Filter Wise */}
          <button
            onClick={() => {
              setReportScope('filtered');
              triggerToast(`Scope: FILTER WISE (${filteredStockReports.length} batches)`);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border cursor-pointer transition-all text-[8px] font-bold uppercase font-mono ${
              reportScope === 'filtered'
                ? 'border-[#f37021] bg-[#f37021]/5 text-[#f37021]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
            }`}
          >
            {/* Box Icon state */}
            <div className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center transition-all ${
              reportScope === 'filtered' ? 'border-[#f37021] bg-[#f37021]' : 'border-slate-300 bg-white'
            }`}>
              {reportScope === 'filtered' && <div className="w-1 h-1 bg-white rounded-full" />}
            </div>
            <Filter className="w-3 h-3" />
            <span>FILTER WISE ({filteredStockReports.length})</span>
          </button>

          {/* Selected Box 2: Full Data */}
          <button
            onClick={() => {
              setReportScope('full');
              triggerToast(`Scope: FULL DATA (${allStockItems.length} batches)`);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border cursor-pointer transition-all text-[8px] font-bold uppercase font-mono ${
              reportScope === 'full'
                ? 'border-[#f37021] bg-[#f37021]/5 text-[#f37021]'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
            }`}
          >
            {/* Box Icon state */}
            <div className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center transition-all ${
              reportScope === 'full' ? 'border-[#f37021] bg-[#f37021]' : 'border-slate-300 bg-white'
            }`}>
              {reportScope === 'full' && <div className="w-1 h-1 bg-white rounded-full" />}
            </div>
            <Database className="w-3 h-3" />
            <span>FULL DATA ({allStockItems.length})</span>
          </button>
        </div>

        {/* 4 Icon Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* SPECIFICATION INPUT BOXES */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/60 flex-wrap">
            <input
              type="text"
              placeholder="DIA"
              value={stockDiaFilter}
              onChange={(e) => {
                const val = e.target.value;
                setStockDiaFilter(val);
                setTempStockDiaFilter(val);
              }}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8.5px] font-mono outline-none h-6.5 w-11 uppercase font-bold text-slate-700 placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="PITCH"
              value={stockPitchFilter}
              onChange={(e) => {
                const val = e.target.value;
                setStockPitchFilter(val);
                setTempStockPitchFilter(val);
              }}
              className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[8.5px] font-mono outline-none h-6.5 w-9 min-w-[36px] uppercase font-bold text-slate-700 placeholder-slate-400 text-center"
            />
            <input
              type="text"
              placeholder="LENGTH"
              value={stockLengthFilter}
              onChange={(e) => {
                const val = e.target.value;
                setStockLengthFilter(val);
                setTempStockLengthFilter(val);
              }}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8.5px] font-mono outline-none h-6.5 w-15 uppercase font-bold text-slate-700 placeholder-slate-400"
            />
            <div 
              className={`relative flex items-center justify-center w-7 h-6.5 border rounded cursor-pointer transition-all ${
                stockFinishFilter 
                  ? 'border-[#f37021] bg-[#f37021]/10 text-[#f37021]' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
              }`}
              title={stockFinishFilter ? `Finish: ${stockFinishFilter}` : "Filter by Finish"}
            >
              <Layers className="w-3.5 h-3.5" />
              <select
                value={stockFinishFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setStockFinishFilter(val);
                  setTempStockFinishFilter(val);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[10px]"
              >
                <option value="">ALL FINISHES</option>
                {stockAvailableFinishes.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            {(stockDiaFilter || stockPitchFilter || stockLengthFilter || stockFinishFilter) && (
              <button
                onClick={() => {
                  setStockDiaFilter('');
                  setTempStockDiaFilter('');
                  setStockPitchFilter('');
                  setTempStockPitchFilter('');
                  setStockLengthFilter('');
                  setTempStockLengthFilter('');
                  setStockFinishFilter('');
                  setTempStockFinishFilter('');
                  triggerToast("Spec boxes cleared!");
                }}
                className="text-[8px] text-[#f37021] hover:text-[#c25310] font-bold font-mono transition-all ml-1 underline cursor-pointer"
                title="Clear specification boxes"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Valuation Group */}
          <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-1 rounded border border-slate-200/60">
            <span className="text-[7px] font-extrabold text-slate-400 font-sans uppercase">Valuation:</span>
            <button
              onClick={handlePrintReport}
              title={`Print Stock Valuation PDF (${reportScope === 'full' ? 'Full' : 'Filtered'})`}
              className="p-1 bg-[#083c54] hover:bg-[#062c3e] text-white flex items-center justify-center transition-all border border-[#062c3e] rounded-sm cursor-pointer hover:scale-105 active:scale-95 h-6.5 w-6.5"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={handleDownloadExcelStockReport}
              title={`Export Stock Valuation Excel (${reportScope === 'full' ? 'Full' : 'Filtered'})`}
              className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition-all border border-emerald-800 rounded-sm cursor-pointer hover:scale-105 active:scale-95 h-6.5 w-6.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={handlePrintCategoryWeightReport}
              title="Print Category-Wise Weight Summary Report (Fit-to-Page PDF)"
              className="p-1 bg-[#f37021] hover:bg-[#d05712] text-white flex items-center justify-center transition-all border border-[#d05712] rounded-sm cursor-pointer hover:scale-105 active:scale-95 h-6.5 w-6.5"
            >
              <ClipboardList className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Dispatch Group */}
          <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-1 rounded border border-slate-200/60">
            <span className="text-[7px] font-extrabold text-slate-400 font-sans uppercase">Dispatch:</span>
            <button
              onClick={handlePrintOutgoingReport}
              title={`Print Outgoing Dispatch PDF (${reportScope === 'full' ? 'Full' : 'Filtered'})`}
              className="p-1 bg-[#7c2d12] hover:bg-[#5c1e0a] text-white flex items-center justify-center transition-all border border-[#5c1e0a] rounded-sm cursor-pointer hover:scale-105 active:scale-95 h-6.5 w-6.5"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={handleDownloadExcelOutgoingReport}
              title={`Export Outgoing Dispatch Excel (${reportScope === 'full' ? 'Full' : 'Filtered'})`}
              className="p-1 bg-amber-700 hover:bg-amber-800 text-white flex items-center justify-center transition-all border border-amber-800 rounded-sm cursor-pointer hover:scale-105 active:scale-95 h-6.5 w-6.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Column Customization Toggles */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColumnsDropdown(!showColumnsDropdown);
              }}
              title="Add / Remove Columns (Class, Category, Sub Category, Thread Series, Technical Grade Box)"
              className={`flex items-center gap-1 px-2 py-1 border text-[8.5px] font-bold font-mono rounded-sm transition-all cursor-pointer h-6.5 ${
                Object.values(customColumnOptions).some(Boolean)
                  ? 'bg-[#f37021] text-white border-[#f37021]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Columns3 className="w-3 h-3" />
              <span>COLUMNS {Object.values(customColumnOptions).filter(Boolean).length > 0 ? `(${Object.values(customColumnOptions).filter(Boolean).length})` : ''}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {showColumnsDropdown && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-60 bg-white border border-slate-300 rounded shadow-xl py-1.5 z-50 text-[9px] font-sans"
              >
                <div className="px-3 py-1 font-bold text-slate-700 uppercase tracking-wider text-[8.5px] border-b border-slate-100 flex items-center justify-between">
                  <span className="font-extrabold text-[#f37021]">INVENTORY COLUMNS</span>
                  <span className="text-[7.5px] text-slate-400 font-mono">Right-click anywhere</span>
                </div>
                <div className="py-1">
                  <label className="flex items-center px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-slate-800">
                    <input
                      type="checkbox"
                      checked={customColumnOptions.showClass}
                      onChange={() => toggleCustomCol('showClass')}
                      className="mr-2 accent-[#f37021]"
                    />
                    <span className="font-bold text-[9px]">CLASS</span>
                  </label>
                  <label className="flex items-center px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-slate-800">
                    <input
                      type="checkbox"
                      checked={customColumnOptions.showCategory}
                      onChange={() => toggleCustomCol('showCategory')}
                      className="mr-2 accent-[#f37021]"
                    />
                    <span className="font-bold text-[9px]">CATEGORY</span>
                  </label>
                  <label className="flex items-center px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-slate-800">
                    <input
                      type="checkbox"
                      checked={customColumnOptions.showSubCategory}
                      onChange={() => toggleCustomCol('showSubCategory')}
                      className="mr-2 accent-[#f37021]"
                    />
                    <span className="font-bold text-[9px]">SUB CATEGORY</span>
                  </label>
                  <label className="flex items-center px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-slate-800">
                    <input
                      type="checkbox"
                      checked={customColumnOptions.showThreadSeries}
                      onChange={() => toggleCustomCol('showThreadSeries')}
                      className="mr-2 accent-[#f37021]"
                    />
                    <span className="font-bold text-[9px]">THREAD SERIES</span>
                  </label>
                  <label className="flex items-center px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-slate-800">
                    <input
                      type="checkbox"
                      checked={customColumnOptions.showTechnicalGrade}
                      onChange={() => toggleCustomCol('showTechnicalGrade')}
                      className="mr-2 accent-[#f37021]"
                    />
                    <span className="font-bold text-[9px]">TECHNICAL GRADE BOX</span>
                  </label>
                </div>
                <div className="border-t border-slate-100 pt-1 px-2 flex items-center justify-between gap-1 font-mono text-[8px]">
                  <button
                    type="button"
                    onClick={(e) => enableAllCustomCols(e)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[7.5px] font-bold uppercase transition-colors"
                  >
                    + Add All
                  </button>
                  <button
                    type="button"
                    onClick={(e) => resetAllCustomCols(e)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[7.5px] font-bold uppercase transition-colors"
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div> {/* Close EXPORT & PRINT COMMAND CENTER */}
    </div> {/* End of Sticky Header, Menu & Actions Container */}

      {/* Grouped Stock Ledger Grid */}
      {filteredStockReports.length === 0 ? (
        <div className="bg-white border border-slate-150 p-12 text-center rounded">
          <Search className="w-10 h-10 text-slate-300 stroke-[1.5] mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">No Stock Matches Filters</h3>
          <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1">
            Adjust your report parameter selectors above to locate fastener items.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scrollable grid area for mouse wheel navigation */}
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-2 scrollbar-thin space-y-6">
            {Object.keys(groupedStock).map((categoryName) => {
              const items = groupedStock[categoryName];
              const catTotalQty = items.reduce((sum, it) => sum + (it.product.balanceStock || 0), 0);
              const catTotalWt = items.reduce((sum, it) => sum + (it.product.totalWeight || 0), 0);
              const cols = getCategoryTableColumns(categoryName, customColumnOptions);
              const balanceIdx = cols.findIndex(c => c.header === 'BALANCE STOCK' || c.header === 'BAL PCS');
              const colSpanVal = balanceIdx !== -1 ? balanceIdx : cols.length - 1;

              return (
                <div key={categoryName} className="border border-slate-200 bg-white">
                  {/* Category Minimal Group Header */}
                  <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[9px] text-slate-800 uppercase tracking-wider">
                      <ClipboardList className="w-3.5 h-3.5 text-[#f37021]" />
                      <span>{categoryName.toUpperCase()} &nbsp;&mdash;&nbsp; {items.length} Batches</span>
                    </div>
                    <div className="font-mono font-bold text-[9px] text-slate-800 tracking-wider flex items-center gap-4">
                      <div>
                        <span>TOTAL WEIGHT: </span>
                        <span className="text-[#f37021] font-black">{catTotalWt.toFixed(2)} kg</span>
                      </div>
                      <div className="border-l border-slate-300 pl-4">
                        <span>TOTAL CATEGORY WEIGHT: </span>
                        <span className="text-[#083c54] font-black">{catTotalWt.toFixed(2)} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {inventoryViewMode === 'details' ? (
                      /* --- DETAILS VIEW TABLE (Opening, Incoming, Outgoing, Balance, Tally, Unit Weight, Total Weight) --- */
                      <table className="w-full border-collapse text-left text-[8px] sm:text-[9px] font-mono text-slate-800">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-900 text-white font-bold uppercase text-[7.5px] sm:text-[8px]">
                            <th className="px-1.5 py-1 border-r border-slate-800 text-center w-8">S.N</th>
                            {customColumnOptions.showClass && (
                              <th className="px-1.5 py-1 border-r border-slate-800 text-center text-[#f37021]">CLASS</th>
                            )}
                            {customColumnOptions.showCategory && (
                              <th className="px-2 py-1 border-r border-slate-800 text-left min-w-[90px]">CATEGORY</th>
                            )}
                            {customColumnOptions.showSubCategory && (
                              <th className="px-2 py-1 border-r border-slate-800 text-left min-w-[90px]">SUB CATEGORY</th>
                            )}
                            {customColumnOptions.showThreadSeries && (
                              <th className="px-1.5 py-1 border-r border-slate-800 text-center">THREAD SERIES</th>
                            )}
                            {customColumnOptions.showTechnicalGrade && (
                              <th className="px-1.5 py-1 border-r border-slate-800 text-center text-amber-300">TECHNICAL GRADE BOX</th>
                            )}
                            <th className="px-2 py-1 border-r border-slate-800 text-left min-w-[100px]">PART NO</th>
                            <th className="px-2 py-1 border-r border-slate-800 text-left min-w-[130px]">DESCRIPTION</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-center min-w-[80px]">SPEC / GRADE</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-right bg-slate-800 text-amber-300">OPENING</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-right bg-slate-800 text-emerald-300">INCOMING</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-right bg-slate-800 text-rose-300">OUTGOING</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-right bg-[#f37021] text-white">BALANCE</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-center min-w-[90px]">TALLY STATUS</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-right">UNIT WEIGHT</th>
                            <th className="px-1.5 py-1 border-r border-slate-800 text-right min-w-[100px]">TOTAL WEIGHT</th>
                            <th className="px-2 py-1 border-r border-slate-800 text-center w-28 min-w-[105px] bg-slate-900 text-amber-400 no-print">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => {
                            const op = item.product.openingStock !== undefined ? Number(item.product.openingStock) : Number(item.product.balanceStock || 0);
                            const inc = Number(item.product.inStock || 0);
                            const out = Number(item.product.outGoingStock || 0);
                            const actualBal = Number(item.product.balanceStock || 0);
                            const computedBal = op + inc - out;
                            const isTallyMatched = computedBal === actualBal;
                            const unitWt = getRowUnitWeight(item.product, item.category);
                            const totalWt = getRowTotalWeight(item.product, item.category);

                            return (
                              <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 group">
                                <td className="px-1.5 py-1 border-r border-slate-200 text-center font-bold text-slate-400">{idx + 1}</td>
                                {customColumnOptions.showClass && (
                                  <td className="px-1.5 py-1 border-r border-slate-200 text-center font-bold text-[#f37021]">{item.section || 'Standard'}</td>
                                )}
                                {customColumnOptions.showCategory && (
                                  <td className="px-2 py-1 border-r border-slate-200 font-semibold text-slate-800">{item.category}</td>
                                )}
                                {customColumnOptions.showSubCategory && (
                                  <td className="px-2 py-1 border-r border-slate-200 font-semibold text-slate-800">{item.subcategory}</td>
                                )}
                                {customColumnOptions.showThreadSeries && (
                                  <td className="px-1.5 py-1 border-r border-slate-200 text-center font-bold text-slate-700">{item.threadType || '—'}</td>
                                )}
                                {customColumnOptions.showTechnicalGrade && (
                                  <td className="px-1.5 py-1 border-r border-slate-200 text-center font-black text-amber-700 bg-amber-50/40">{item.grade || item.product.grade || '—'}</td>
                                )}
                                <td className="px-2 py-1 border-r border-slate-200 font-bold text-slate-900">{item.product.partNo || '—'}</td>
                                <td className="px-2 py-1 border-r border-slate-200 text-slate-800">{item.product.description || '—'}</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-center font-semibold text-slate-600">{item.grade || item.subcategory || '—'}</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right font-bold text-amber-800 bg-amber-50/20">{op.toLocaleString()}</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right font-bold text-emerald-800 bg-emerald-50/20">+{inc.toLocaleString()}</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right font-bold text-rose-800 bg-rose-50/20">-{out.toLocaleString()}</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right font-extrabold text-sky-900 bg-sky-50">{actualBal.toLocaleString()}</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-center">
                                  {isTallyMatched ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[7.5px] uppercase">
                                      <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> TALLY OK
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[7.5px] uppercase" title={`Diff: ${actualBal - computedBal}`}>
                                      <AlertCircle className="w-2.5 h-2.5 text-amber-600" /> DIFF ({actualBal - computedBal})
                                    </span>
                                  )}
                                </td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right text-slate-700">{unitWt.toFixed(4)} kg</td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right font-bold text-[#083c54]">{totalWt.toFixed(2)} kg</td>
                                <td className="px-2 py-1 text-center bg-white whitespace-nowrap no-print w-28 min-w-[105px]">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(item)}
                                      className="p-1 px-2 border border-blue-300 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded text-[9.5px] font-bold font-mono cursor-pointer transition-colors flex items-center gap-1 shadow-3xs"
                                      title="Edit this line"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      <span>EDIT</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete ${item.product.partNo || 'this item'} from stock ledger?`)) {
                                          handleDeleteStockItem(item);
                                        }
                                      }}
                                      className="p-1 px-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded cursor-pointer transition-colors flex items-center shadow-3xs"
                                      title="Delete this line"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {/* Subtotal Row for Details View */}
                          {(() => {
                            const detailsCustomCount = (customColumnOptions.showClass ? 1 : 0) + 
                              (customColumnOptions.showCategory ? 1 : 0) + 
                              (customColumnOptions.showSubCategory ? 1 : 0) + 
                              (customColumnOptions.showThreadSeries ? 1 : 0) + 
                              (customColumnOptions.showTechnicalGrade ? 1 : 0);
                            const detailsColSpan = 4 + detailsCustomCount;

                            return (
                              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900 text-[8px] sm:text-[8.5px]">
                                <td colSpan={detailsColSpan} className="px-2 py-1 text-right font-sans font-extrabold uppercase text-slate-600">
                                  Sub-Total {categoryName.toUpperCase()}:
                                </td>
                                <td className="px-1.5 py-1 text-right text-amber-900 border-r border-slate-200">
                                  {items.reduce((s, it) => s + (it.product.openingStock !== undefined ? Number(it.product.openingStock) : Number(it.product.balanceStock || 0)), 0).toLocaleString()}
                                </td>
                                <td className="px-1.5 py-1 text-right text-emerald-900 border-r border-slate-200">
                                  +{items.reduce((s, it) => s + Number(it.product.inStock || 0), 0).toLocaleString()}
                                </td>
                                <td className="px-1.5 py-1 text-right text-rose-900 border-r border-slate-200">
                                  -{items.reduce((s, it) => s + Number(it.product.outGoingStock || 0), 0).toLocaleString()}
                                </td>
                                <td className="px-1.5 py-1 text-right text-sky-950 font-black border-r border-slate-200 bg-sky-100/50">
                                  {catTotalQty.toLocaleString()} PCS
                                </td>
                                <td className="px-1.5 py-1 text-center border-r border-slate-200 text-emerald-700 font-bold text-[8px]">
                                  ✓ TALLY OK
                                </td>
                                <td className="px-1.5 py-1 border-r border-slate-200"></td>
                                <td className="px-1.5 py-1 border-r border-slate-200 text-right text-[#f37021] font-black">
                                  {catTotalWt.toFixed(2)} kg
                                </td>
                                <td className="no-print bg-slate-100"></td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    ) : (
                      /* --- SIMPLE VIEW TABLE --- */
                      <table className="w-full border-collapse text-left text-[8px] sm:text-[9px] font-mono text-slate-800">
                        <thead>
                          <tr className="border-b border-slate-300 bg-slate-50 font-bold uppercase text-slate-900 text-[7.5px] sm:text-[8px]">
                            {cols.map((col, index) => {
                              const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
                              return (
                                <th 
                                  key={index} 
                                  className={`px-1.5 py-1 border-r border-slate-200 ${alignClass}`}
                                  style={parseWidthStyle(col.widthStyle)}
                                >
                                  {col.header === 'IN STOCK' || col.header === 'INCOMING' ? (
                                    <span className="inline-flex items-center gap-0.5 justify-end">
                                      <Plus className="w-2 h-2 text-emerald-600 shrink-0" />
                                      {col.header}
                                    </span>
                                  ) : col.header}
                                </th>
                              );
                            })}
                            <th className="px-2 py-1 border-r border-slate-200 text-center w-28 min-w-[105px] bg-slate-50 text-slate-900 no-print">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr 
                              key={idx} 
                              className="hover:bg-slate-50 border-b border-slate-100 group"
                            >
                              {cols.map((col, cIdx) => {
                                const val = col.getValue(item);
                                const alignClass = col.align === 'center' ? 'text-center text-slate-600' : col.align === 'right' ? 'text-right font-bold text-slate-950' : 'text-left text-slate-800';
                                let cellContent = val;
                                if (col.isNumeric) {
                                  if (col.header === 'BALANCE STOCK' || col.header === 'BAL PCS' || col.header === 'OPENING QTY' || col.header === 'IN STOCK' || col.header === 'OUT QTY') {
                                    cellContent = (Number(val) || 0).toLocaleString();
                                  } else if (col.header.includes('TOTAL WEIGHT') || col.header.includes('TOTAL WT')) {
                                    cellContent = `${(Number(val) || 0).toFixed(2)} kg`;
                                  } else if (col.header.includes('UNIT WEIGHT')) {
                                    cellContent = (Number(val) || 0).toFixed(4);
                                  } else {
                                    cellContent = (Number(val) || 0).toLocaleString();
                                  }
                                }
                                
                                let extraClass = '';
                                if (col.header === 'BALANCE STOCK' || col.header === 'BAL PCS') {
                                  extraClass = ' text-slate-950 font-bold';
                                } else if (col.header === 'PART NO') {
                                  extraClass = ' font-bold text-slate-900';
                                }

                                return (
                                  <td key={cIdx} className={`px-1.5 py-0.5 border-r border-slate-200 whitespace-nowrap leading-normal ${alignClass}${extraClass}`}>
                                    {cellContent}
                                  </td>
                                );
                              })}
                              <td className="px-2 py-1 text-center bg-white whitespace-nowrap no-print border-r border-slate-200 w-28 min-w-[105px]">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="p-1 px-2 border border-blue-300 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded text-[9.5px] font-bold font-mono cursor-pointer transition-colors flex items-center gap-1 shadow-3xs"
                                    title="Edit this line"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>EDIT</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete ${item.product.partNo || 'this item'} from stock ledger?`)) {
                                        handleDeleteStockItem(item);
                                      }
                                    }}
                                    className="p-1 px-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded cursor-pointer transition-colors flex items-center shadow-3xs"
                                    title="Delete this line"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {/* Category Subtotal Row */}
                          <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900 text-[7.5px] sm:text-[8.5px]">
                            <td colSpan={colSpanVal} className="px-2 py-1 text-right font-sans font-bold uppercase tracking-wide text-slate-500">
                              Sub-Total of {categoryName.toUpperCase()}:
                            </td>
                            <td className="px-1.5 py-1 text-right text-slate-950 border-r border-slate-200 whitespace-nowrap">
                              {catTotalQty.toLocaleString()} PCS
                            </td>
                            <td className="px-1.5 py-1 text-right text-slate-950 border-r border-slate-200 whitespace-nowrap">
                              {catTotalWt.toFixed(2)} kg
                            </td>
                            {cols.length - colSpanVal > 2 ? <td colSpan={cols.length - colSpanVal - 2} className="bg-slate-50"></td> : null}
                            <td className="bg-slate-50 no-print"></td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Consolidated Totals Table */}
          <div ref={bottomRef} className="border border-slate-200 bg-slate-50 p-2 flex flex-col sm:flex-row justify-between items-center font-mono text-[9px] sm:text-[10px] font-black text-slate-950 rounded gap-2">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-widest text-slate-600 font-sans">
                Grand Consolidated Totals:
              </span>
            </div>
            <div className="flex gap-4 mt-1 sm:mt-0">
              <div>
                Total Pieces: <span className="text-[#f37021]">
                  {filteredStockReports.reduce((sum, item) => sum + (item.product.balanceStock || 0), 0).toLocaleString()} PCS
                </span>
              </div>
              <div className="border-l border-slate-300 pl-4">
                Total Weight: <span className="text-emerald-800">
                  {filteredStockReports.reduce((sum, item) => sum + getRowTotalWeight(item.product, item.category), 0).toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Right-Click Context Menu */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 py-2.5 w-72 text-[10px] font-sans animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 pb-2 mb-1.5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[#f37021] uppercase tracking-wider text-[9px]">
                  RIGHT CLICK ADD
                </span>
                <span className="text-[7px] font-mono font-bold bg-[#f37021]/20 text-[#f37021] px-1 py-0.2 rounded border border-[#f37021]/40">
                  5 COLUMNS
                </span>
              </div>
              <p className="text-[7.5px] text-slate-400 font-mono mt-0.5">
                INVENTORY STOCK LEDGER SHEET
              </p>
            </div>
            <button
              onClick={() => setContextMenu(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 font-mono cursor-pointer transition-colors"
              title="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 px-1.5">
            <button
              onClick={(e) => toggleCustomCol('showClass', e)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${customColumnOptions.showClass ? 'bg-emerald-400 shadow-xs' : 'bg-slate-600'}`}></span>
                <span className="font-bold text-slate-200 group-hover:text-white text-[9.5px]">CLASS</span>
              </div>
              {customColumnOptions.showClass ? (
                <span className="text-emerald-400 font-extrabold text-[8px] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700">ADDED ✓</span>
              ) : (
                <span className="text-slate-400 text-[8px] group-hover:text-[#f37021] font-mono">+ ADD</span>
              )}
            </button>

            <button
              onClick={(e) => toggleCustomCol('showCategory', e)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${customColumnOptions.showCategory ? 'bg-emerald-400 shadow-xs' : 'bg-slate-600'}`}></span>
                <span className="font-bold text-slate-200 group-hover:text-white text-[9.5px]">CATEGORY</span>
              </div>
              {customColumnOptions.showCategory ? (
                <span className="text-emerald-400 font-extrabold text-[8px] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700">ADDED ✓</span>
              ) : (
                <span className="text-slate-400 text-[8px] group-hover:text-[#f37021] font-mono">+ ADD</span>
              )}
            </button>

            <button
              onClick={(e) => toggleCustomCol('showSubCategory', e)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${customColumnOptions.showSubCategory ? 'bg-emerald-400 shadow-xs' : 'bg-slate-600'}`}></span>
                <span className="font-bold text-slate-200 group-hover:text-white text-[9.5px]">SUB CATEGORY</span>
              </div>
              {customColumnOptions.showSubCategory ? (
                <span className="text-emerald-400 font-extrabold text-[8px] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700">ADDED ✓</span>
              ) : (
                <span className="text-slate-400 text-[8px] group-hover:text-[#f37021] font-mono">+ ADD</span>
              )}
            </button>

            <button
              onClick={(e) => toggleCustomCol('showThreadSeries', e)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${customColumnOptions.showThreadSeries ? 'bg-emerald-400 shadow-xs' : 'bg-slate-600'}`}></span>
                <span className="font-bold text-slate-200 group-hover:text-white text-[9.5px]">THREAD SERIES</span>
              </div>
              {customColumnOptions.showThreadSeries ? (
                <span className="text-emerald-400 font-extrabold text-[8px] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700">ADDED ✓</span>
              ) : (
                <span className="text-slate-400 text-[8px] group-hover:text-[#f37021] font-mono">+ ADD</span>
              )}
            </button>

            <button
              onClick={(e) => toggleCustomCol('showTechnicalGrade', e)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${customColumnOptions.showTechnicalGrade ? 'bg-emerald-400 shadow-xs' : 'bg-slate-600'}`}></span>
                <span className="font-bold text-slate-200 group-hover:text-white text-[9.5px]">TECHNICAL GRADE BOX</span>
              </div>
              {customColumnOptions.showTechnicalGrade ? (
                <span className="text-emerald-400 font-extrabold text-[8px] bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700">ADDED ✓</span>
              ) : (
                <span className="text-slate-400 text-[8px] group-hover:text-[#f37021] font-mono">+ ADD</span>
              )}
            </button>
          </div>

          {/* Quick Bulk Actions */}
          <div className="mt-2 pt-2 border-t border-slate-800 px-2 flex items-center justify-between gap-1.5 font-mono text-[8px]">
            <button
              type="button"
              onClick={(e) => enableAllCustomCols(e)}
              className="flex-1 py-1 px-1.5 bg-[#f37021] hover:bg-[#d95d13] text-white font-black rounded text-center transition-colors cursor-pointer"
            >
              + ADD ALL 5
            </button>
            <button
              type="button"
              onClick={(e) => resetAllCustomCols(e)}
              className="flex-1 py-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-center transition-colors cursor-pointer"
            >
              ↺ RESET DEFAULT
            </button>
          </div>
        </div>
      )}

      {/* Edit Stock Ledger Row Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 shadow-2xl rounded-none w-full max-w-2xl text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-[#083c54] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#f37021]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#f37021]" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider font-mono">
                  Edit Stock Ledger Line &mdash; {editingItem.product.partNo || 'Fastener'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 hover:bg-white/20 text-white rounded cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-4 space-y-4 text-xs font-mono">
              {/* Hierarchy Info Banner */}
              <div className="bg-slate-100 border border-slate-200 p-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-700 font-medium">
                <div><span className="text-slate-500">Category:</span> <span className="font-bold text-slate-900">{editingItem.category}</span></div>
                <div><span className="text-slate-500">Subcategory:</span> <span className="font-bold text-slate-900">{editingItem.subcategory}</span></div>
                <div><span className="text-slate-500">Thread:</span> <span className="font-bold text-slate-900">{editingItem.threadType || '—'}</span></div>
                <div><span className="text-slate-500">Grade:</span> <span className="font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded">{editingItem.grade || '—'}</span></div>
                <div><span className="text-slate-500">Class:</span> <span className="font-bold text-[#f37021]">{editingItem.section}</span></div>
              </div>

              {/* Grid 1: Basic Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Part Number / Code</label>
                  <input
                    type="text"
                    value={editFormData.partNo}
                    onChange={(e) => setEditFormData({ ...editFormData, partNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none bg-slate-50 focus:bg-white focus:border-[#083c54] outline-none font-bold text-slate-900 text-xs"
                    placeholder="e.g. M12-1.75X50-8.8"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Description / Spec</label>
                  <input
                    type="text"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none bg-slate-50 focus:bg-white focus:border-[#083c54] outline-none text-slate-900 text-xs"
                    placeholder="Item description"
                  />
                </div>
              </div>

              {/* Grid 2: Stock Quantities & Unit Weight */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/80 p-3 border border-slate-200">
                <div>
                  <label className="block text-[9.5px] font-bold uppercase text-amber-800 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={editFormData.openingStock}
                    onChange={(e) => setEditFormData({ ...editFormData, openingStock: e.target.value })}
                    className="w-full px-2 py-1 border border-amber-300 bg-white text-right font-bold text-amber-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase text-emerald-800 mb-1">+ Incoming Stock</label>
                  <input
                    type="number"
                    value={editFormData.inStock}
                    onChange={(e) => setEditFormData({ ...editFormData, inStock: e.target.value })}
                    className="w-full px-2 py-1 border border-emerald-300 bg-white text-right font-bold text-emerald-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase text-rose-800 mb-1">- Outgoing Stock</label>
                  <input
                    type="number"
                    value={editFormData.outGoingStock}
                    onChange={(e) => setEditFormData({ ...editFormData, outGoingStock: e.target.value })}
                    className="w-full px-2 py-1 border border-rose-300 bg-white text-right font-bold text-rose-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase text-slate-700 mb-1">Unit Wt (kg)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editFormData.unitWeight}
                    onChange={(e) => setEditFormData({ ...editFormData, unitWeight: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 bg-white text-right font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Calculated Real-Time Summary */}
              {(() => {
                const op = Number(editFormData.openingStock || 0);
                const inc = Number(editFormData.inStock || 0);
                const out = Number(editFormData.outGoingStock || 0);
                const bal = op + inc - out;
                const uWt = Number(editFormData.unitWeight || 0);
                const totWt = bal * uWt;

                return (
                  <div className="bg-[#083c54]/10 border border-[#083c54]/30 p-2.5 flex items-center justify-between font-mono text-[11px]">
                    <div>
                      <span className="text-slate-600 font-bold uppercase">Computed Balance: </span>
                      <span className="font-extrabold text-[#083c54] text-xs">{bal.toLocaleString()} PCS</span>
                    </div>
                    <div>
                      <span className="text-slate-600 font-bold uppercase">Total Line Weight: </span>
                      <span className="font-extrabold text-[#f37021] text-xs">{totWt.toFixed(2)} kg</span>
                    </div>
                  </div>
                );
              })()}

              {/* Optional attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={editFormData.rackLocation || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, rackLocation: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 bg-white text-slate-800"
                    placeholder="e.g. A-04-02"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Finish / Coating</label>
                  <input
                    type="text"
                    value={editFormData.finish || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, finish: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 bg-white text-slate-800"
                    placeholder="e.g. HDG / Zinc"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Marking</label>
                  <input
                    type="text"
                    value={editFormData.marking || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, marking: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 bg-white text-slate-800"
                    placeholder="Head markings"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editFormData.unit || 'PCS'}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 bg-white text-slate-800 text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditModal}
                className="px-4 py-1.5 bg-[#f37021] hover:bg-[#d95d13] text-white text-xs font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
