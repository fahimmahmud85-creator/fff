export interface ProductRow {
  id: string;
  partNo: string;
  description: string;
  dia: string;
  pitch?: string;
  length: string;
  topThreadT1?: string;
  bottomThreadT2?: string;
  threadT?: string;
  bendC?: string;
  dimA?: string;
  dimB?: string;
  dimC?: string;
  dimD?: string;
  dimD1?: string;
  dimE?: string;
  dimF?: string;
  dimH?: string;
  dimL1?: string;
  dimL2?: string;
  dimR?: string;
  dimR1?: string;
  dimY?: string;
  dimG?: string;
  dimI?: string;
  threadC?: string;
  threadS?: string;
  threadB?: string;
  threadD?: string;
  threadE?: string;
  threadL?: string;
  threadDia?: string;
  innerDiaC?: string;
  innerDiaB?: string;
  innerDia?: string;
  outerDia?: string;
  thickness?: string;
  nps?: string;
  classRating?: string;
  noOfBoltHoles?: string;
  diaOfHoles?: string;
  thicknessS?: string;
  bendL1?: string;
  bendRadius?: string;
  openingStock: number;
  inStock: number;
  outGoingStock: number;
  balanceStock: number; // Opening + In - Out Going
  tallyStock: number;   // same as balance
  tallyQty?: number | string; // quantity tally field
  unitWeight: number;   // kg/unit
  totalWeight: number;  // balanceStock * unitWeight
  finish: string;
  rackLocation: string;
  marking: string;
  unit?: string; // unit of measure (e.g. PCS, BOX, PACK)
  productionDate?: string;
  expiryDate?: string;
  color?: string;
  grade?: string;       // Hilti specific grade column
  ref1Photo?: string;   // Hilti specific REF-1 PHOTO link
  ref2Photo?: string;   // Hilti specific REF-2 PHOTO link
}

export interface Grade {
  id: string;
  name: string;
  rows: ProductRow[];
}

export interface ThreadType {
  id: string;
  name: string;
  grades: Grade[];
}

export interface Subcategory {
  id: string;
  name: string;
  threadTypes: ThreadType[];
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface WarehouseLayout {
  id: string;
  name: string;
  pdfLink: string;
  description: string;
}

export interface HexPhoto {
  id: string;
  title: string;
  driveLink: string;
  imageUrl: string;
}

export interface AppUser {
  id: string;
  uniqueId: string; // Decided by administrator
  firstName: string;
  secondName: string;
  position: string;
  phone: string;
  mobile: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  password: string;
  companyId?: string; // e.g. 'comp-mfi' | 'comp-bmm' | 'comp-umi'
  companyCategory?: 'MARINE FASTENERS' | 'BOLT MASTER' | 'UNITED METAL' | string; // Company classification category
  isApproved?: boolean; // True for default users, false for new self-registered accounts needing admin approval
  canViewSystemRegistry?: boolean; // Checkbox in admin control so specific user can view system registry
  allowedCompanies?: string[]; // Company IDs user has permission to access; undefined or empty means all for Admin, or explicit list for Viewer/Editor
}

export interface StorePurchaseRequest {
  id: string;
  sourceWoNo: string;
  customerName: string;
  requestedDate: string;
  itemDescription: string;
  qty: number;
  unit: string;
  priority: 'High' | 'Medium' | 'Low';
  requestedBy: string;
  status: 'Pending' | 'Approved' | 'PO Created' | 'Declined';
  officePoNo?: string;
  notes?: string;
}

export function getRowUnitWeight(row: Partial<ProductRow> | any, categoryName?: string): number {
  if (row.unitWeight && row.unitWeight > 0) {
    return row.unitWeight;
  }
  
  // Let's estimate it!
  try {
    const catNameLower = (categoryName || '').toLowerCase();
    
    // 1. WASHER
    const isWasher = catNameLower.includes('washer') || !!row.innerDia || !!row.outerDia || (row.innerDiaC !== undefined);
    if (isWasher) {
      const id = parseFloat(row.innerDia || row.innerDiaC || row.dia || '0') || 10.5;
      const od = parseFloat(row.outerDia || '0') || (id * 2);
      const thk = parseFloat(row.thickness || '0') || 2.0;
      // Formula: (od^2 - id^2) * thk * pi/4 * 7.85e-6
      const wt = (od * od - id * id) * thk * Math.PI * 0.25 * 7.85e-6;
      return parseFloat(wt.toFixed(4)) || 0.003;
    }
    
    // 2. GASKET
    const isGasket = catNameLower.includes('gasket');
    if (isGasket) {
      const id = parseFloat(row.innerDia || '0') || 50;
      const od = parseFloat(row.outerDia || '0') || 100;
      const thk = parseFloat(row.thickness || '0') || 3.0;
      // Rubber density approx 1.2e-6 kg/mm³ or Steel density for metal gaskets
      const density = catNameLower.includes('metal') ? 7.85e-6 : 1.2e-6;
      const wt = (od * od - id * id) * thk * Math.PI * 0.25 * density;
      return parseFloat(wt.toFixed(4)) || 0.02;
    }

    // 3. FASTENER / BOLT / SCREW
    // Parse Dia
    let dStr = String(row.dia || '').toUpperCase().trim();
    let dVal = 10; // Default M10
    if (dStr.startsWith('M')) {
      dVal = parseFloat(dStr.substring(1)) || 10;
    } else if (dStr.includes('/') || dStr.includes('"')) {
      // Inch size: e.g., 1/2" or 3/8"
      const match = dStr.match(/(\d+)\/(\d+)/);
      if (match) {
        dVal = (parseFloat(match[1]) / parseFloat(match[2])) * 25.4;
      } else {
        dVal = parseFloat(dStr) * 25.4 || 12.7;
      }
    } else if (dStr.startsWith('#')) {
      // e.g. #10
      const num = parseInt(dStr.replace(/[^0-9]/g, '')) || 10;
      dVal = 1.27 + num * 0.33; // approx formula for screw number sizes
    } else {
      dVal = parseFloat(dStr) || 10;
    }

    // Parse Length
    let lStr = String(row.length || '').toUpperCase().trim();
    let lVal = 50; // Default 50mm
    if (lStr.includes('"')) {
      const match = lStr.match(/(\d+)[-_\s](\d+)\/(\d+)/);
      if (match) {
        lVal = (parseFloat(match[1]) + parseFloat(match[2]) / parseFloat(match[3])) * 25.4;
      } else {
        const fracMatch = lStr.match(/(\d+)\/(\d+)/);
        if (fracMatch) {
          lVal = (parseFloat(fracMatch[1]) / parseFloat(fracMatch[2])) * 25.4;
        } else {
          lVal = parseFloat(lStr) * 25.4 || 50.8;
        }
      }
    } else {
      lVal = parseFloat(lStr.replace(/[^0-9.]/g, '')) || 50;
    }

    // Bolt weight estimation formula:
    // head wt (approx 3 * d length equivalent) + shank wt (d^2 * pi/4 * L * density)
    const wt = (dVal * dVal) * Math.PI * 0.25 * (lVal + 3 * dVal) * 7.85e-6;
    return parseFloat(wt.toFixed(4)) || 0.03;
  } catch (err) {
    return 0.03;
  }
}

export function getRowTotalWeight(row: Partial<ProductRow> | any, categoryName?: string): number {
  const uw = getRowUnitWeight(row, categoryName);
  const bal = Number(row.balanceStock) || 0;
  
  if (row.totalWeight && row.totalWeight > 0) {
    return row.totalWeight;
  }
  return parseFloat((bal * uw).toFixed(2));
}


