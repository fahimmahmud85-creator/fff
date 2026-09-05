import { Category, WarehouseLayout, HexPhoto, Grade, ThreadType, Subcategory, ProductRow } from './types';

// Helper to generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Comprehensive grades lists as specified
// Specific grade arrays per PDF for Hex Bolts and Flange Bolts variations
export const HEX_BOLTS_FULL_THREAD_METRIC_GRADES = [
  "DIN 933 GR 4.6",
  "DIN 933 GR 4.8",
  "DIN 933 GR 5.6",
  "DIN 933 GR 8.8 (ORD)",
  "DIN 933 GR 8.8",
  "GR 8.8 HR",
  "DIN 933 GR 10.9",
  "DIN 6914 GR 10.9",
  "DIN 933 GR 12.9",
  "ASTM A325M TYPE-1",
  "ASTM A490M TYPE-1",
  "ASTM A307 GR. A",
  "ASTM A307 GR. B",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const HEX_BOLTS_HALF_THREAD_METRIC_GRADES = [
  "DIN 931 GR 4.6",
  "DIN 931 GR 4.8",
  "DIN 931 GR 5.6",
  "DIN 931 GR 8.8 (ORD)",
  "DIN 931 GR 8.8",
  "GR 8.8 HR",
  "DIN 931 GR 10.9",
  "DIN 6914 GR 10.9",
  "DIN 931 GR 12.9",
  "ASTM A325M TYPE-1",
  "ASTM A490M TYPE-1",
  "ASTM A307 GR. A",
  "ASTM A307 GR. B",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const HEX_BOLTS_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "ASTM A325",
  "ASTM A490M",
  "ASTM A307 GR. A",
  "ASTM A307 GR. B",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const FLANGE_BOLTS_FULL_THREAD_METRIC_GRADES = [
  "DIN 6921 GR 8.8",
  "DIN 6921 GR 10.9",
  "DIN 6921 GR 12.9",
  "ASTM A307 GR. A",
  "ASTM A307 GR. B",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const FLANGE_BOLTS_HALF_THREAD_METRIC_GRADES = [
  "GRADE 8.8",
  "GRADE 10.9",
  "GRADE GR 12.9",
  "ASTM A307 GR. A",
  "ASTM A307 GR. B",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const FLANGE_BOLTS_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "ASTM A307 GR. A",
  "ASTM A307 GR. B",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const ROOFING_BOLTS_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "BRASS",
  "COPPER",
  "NYLON"
];

export const CARRIAGE_BOLTS_METRIC_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "BRASS",
  "COPPER",
  "NYLON"
];

export const CARRIAGE_BOLTS_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "BRASS",
  "COPPER",
  "NYLON"
];

export const T_BOLTS_METRIC_GRADES = [
  "GRADE 4.6",
  "GRADE 5.6",
  "GRADE 8.8",
  "SS 304 A2-70 450MPA",
  "SS 304 A2-70 700MPA",
  "SS 316 A4-70 450MPA",
  "SS 316 A4-70 700MPA",
  "SS 316L A4L-70 450MPA",
  "SS 316L A4L-70 700MPA"
];

export const T_BOLTS_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "SS 304 A2-70 450MPA",
  "SS 304 A2-70 700MPA",
  "SS 316 A4-70 450MPA",
  "SS 316 A4-70 700MPA",
  "SS 316L A4L-70 450MPA",
  "SS 316L A4L-70 700MPA"
];

export const TWELVE_POINT_METRIC_GRADES = [
  "GRADE 8.8",
  "GRADE 10.9",
  "GRADE 12.9",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const TWELVE_POINT_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const TCB_METRIC_GRADES = [
  "ASTM A325M",
  "ASTM A490M",
  "ASTM A193"
];

export const TCB_INCH_GRADES = [
  "ASTM A325",
  "ASTM A490",
  "ASTM A193"
];

export const SQUARE_HEAD_METRIC_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "GRADE 10.9",
  "GRADE 12.9",
  "ASTM A325M TYPE-1",
  "ASTM A490M TYPE-1",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const SQUARE_HEAD_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "ASTM A307",
  "ASTM A193 GR B7",
  "ASTM A193 GR B7M",
  "ASTM A193 GR B16",
  "ASTM A320 GR L7",
  "ASTM A320 GR L7M",
  "ASTM A320 GR L43",
  "SS 202 A2-70",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "ASTM A193 GR B8",
  "ASTM A193 GR B8M",
  "ASTM A193 GR B8T",
  "ASTM A193 GR B8C",
  "SS 310",
  "SS 310S",
  "SS 410",
  "BRASS",
  "COPPER",
  "TEFLON",
  "NYLON",
  "GRP",
  "DUPLEX",
  "SUPLER DUPLEX",
  "INCONEL",
  "MONEL"
];

export const CONNECTOR_METRIC_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "GRADE 10.9",
  "GRADE 12.9",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const CONNECTOR_INCH_GRADES = [
  "GRADE 2",
  "GRADE 5",
  "GRADE 8",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const COACH_SCREWS_METRIC_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const COACH_SCREWS_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const ELEVATOR_BOLTS_TYPE1_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "GRADE 10.9",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const ELEVATOR_BOLTS_TYPE3_GRADES = [
  "GRADE 2",
  "GRADE 5",
  "GRADE 8",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80"
];

export const BOX_BOLTS_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8",
  "SS 304",
  "SS 316"
];

export const PLOW_BOLTS_METRIC_GRADES = [
  "GRADE 8.8",
  "GRADE 10.9",
  "GRADE 12.9",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "BRASS",
  "COPPER"
];

export const PLOW_BOLTS_INCH_GRADES = [
  "GRADE 2",
  "GRADE 5",
  "GRADE 8",
  "SS 304 A2-70",
  "SS 316 A4-70",
  "SS 316 A4-80",
  "SS 316L A4L-70",
  "SS 316L A4L-80",
  "BRASS",
  "COPPER"
];

export const T_BOLTS_ORDINARY_GRADES = [
  "GRADE 4.6",
  "GRADE 8.8"
];

export const FINNECK_BOLTS_METRIC_GRADES = [
  "GRADE 8.8",
  "GRADE 10.9"
];

export const FINNECK_BOLTS_INCH_GRADES = [
  "GRADE 5",
  "GRADE 8"
];

// Helper to create Grades structure
function makeGrades(gradeNames: string[], withSampleData: boolean = false, isInch: boolean = false): Grade[] {
  return gradeNames.map(name => {
    const pRows: any[] = [];
    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

// Special helper to build pre-seeded Washer records
function makeWasherGrades(subName: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: any[] = [];
    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makeSocketScrewGrades(subcat: string, threadSeries: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    const isHalf = threadSeries.toLowerCase().includes("half");
    const isMetric = threadSeries.toLowerCase().includes("metric");
    
    // Normalize subcat names for cleaner PartNos
    let prefix = "SHCS"; // default Socket Head Cap Screw
    if (subcat.toLowerCase().includes("csk")) {
      prefix = "CSK";
    } else if (subcat.toLowerCase().includes("button")) {
      prefix = "BTTN";
    } else if (subcat.toLowerCase().includes("grub")) {
      prefix = "GRUB";
    } else if (subcat.toLowerCase().includes("shoulder")) {
      prefix = "SHLD";
    }
    
    // Seed data on select grades so it doesn't look empty and is highly polished!
    const isSeedGrade = 
      name.includes("8.8") || 
      name.includes("10.9") || 
      name.includes("12.9") || 
      name === "SS 304" || 
      name.includes("304") ||
      name.includes("A4-70") || 
      name === "GRADE 8" || 
      name === "GRADE 5";

    if (isSeedGrade) {
      if (isMetric) {
        // Metric Seed Samples
        const sizes = [
          { dia: "M6", pitch: "1.0 MM", len: subcat.toLowerCase().includes("grub") ? "12 mm" : (isHalf ? "40 mm" : "20 mm"), wt: 0.007 },
          { dia: "M8", pitch: "1.25 MM", len: subcat.toLowerCase().includes("grub") ? "16 mm" : (isHalf ? "50 mm" : "25 mm"), wt: 0.015 },
          { dia: "M10", pitch: "1.5 MM", len: subcat.toLowerCase().includes("grub") ? "20 mm" : (isHalf ? "60 mm" : "30 mm"), wt: 0.032 },
          { dia: "M12", pitch: "1.75 MM", len: subcat.toLowerCase().includes("grub") ? "25 mm" : (isHalf ? "80 mm" : "45 mm"), wt: 0.055 }
        ];
        
        sizes.forEach((sz, idx) => {
          const numGrade = name.includes("8.8") ? "8.8" : name.includes("10.9") ? "10.9" : name.includes("12.9") ? "12.9" : name.includes("304") ? "304" : "316";
          const lenSuffix = sz.len.replace(" mm", "");
          const partNo = `MF-${prefix}-${numGrade}-${sz.dia}-${subcat.toLowerCase().includes("grub") ? "G" : (isHalf ? "H" : "F")}-${lenSuffix}`.toUpperCase();
          const desc = `${sz.dia} x ${sz.len} ${subcat} - ${threadSeries} (${name})`;
          const bal = 1200 + (idx * 300);
          const op = bal + 500;
          const inc = 400;
          const out = 900;
          
          pRows.push({
            id: generateId(),
            partNo,
            description: desc,
            dia: sz.dia,
            pitch: sz.pitch,
            length: sz.len,
            openingStock: op,
            inStock: inc,
            outGoingStock: out,
            balanceStock: bal,
            tallyStock: bal,
            unitWeight: sz.wt,
            totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
            finish: name.includes("SS") || name.includes("304") || name.includes("316") ? "Stainless Steel Plain" : "Black Phosphate / Plain",
            rackLocation: `W05-E-R${idx + 1}`,
            marking: name.includes("SS") || name.includes("304") || name.includes("316") ? "A2-70/A4-70" : `MF ${numGrade}`,
            unit: "Pcs",
            productionDate: "2025-10-10",
            expiryDate: "N/A"
          });
        });
      } else {
        // Inch Seed Samples
        const sizes = [
          { dia: "1/4\"", pitch: "20 TPI", len: subcat.toLowerCase().includes("grub") ? "1/2\"" : (isHalf ? "2\"" : "1\""), wt: 0.012 },
          { dia: "3/8\"", pitch: "16 TPI", len: subcat.toLowerCase().includes("grub") ? "5/8\"" : (isHalf ? "2-1/2\"" : "1-1/2\""), wt: 0.038 },
          { dia: "1/2\"", pitch: "13 TPI", len: subcat.toLowerCase().includes("grub") ? "3/4\"" : (isHalf ? "3\"" : "2\""), wt: 0.092 }
        ];
        
        sizes.forEach((sz, idx) => {
          const numGrade = name.includes("8") ? "G8" : name.includes("5") ? "G5" : name.includes("304") ? "304" : "316";
          const lenSuffix = sz.len.replace('"', '').replace('-', '_');
          const partNo = `MF-${prefix}-${numGrade}-${sz.dia.replace('"', '').replace('/', '-')}-${subcat.toLowerCase().includes("grub") ? "G" : (isHalf ? "H" : "F")}-${lenSuffix}`.toUpperCase();
          const desc = `${sz.dia} x ${sz.len} ${subcat} - ${threadSeries} (${name})`;
          const bal = 800 + (idx * 250);
          const op = bal + 300;
          const inc = 200;
          const out = 500;
          
          pRows.push({
            id: generateId(),
            partNo,
            description: desc,
            dia: sz.dia,
            pitch: sz.pitch,
            length: sz.len,
            openingStock: op,
            inStock: inc,
            outGoingStock: out,
            balanceStock: bal,
            tallyStock: bal,
            unitWeight: sz.wt,
            totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
            finish: name.includes("SS") || name.includes("304") || name.includes("316") ? "Stainless Steel" : "Self Color",
            rackLocation: `W05-F-R${idx + 1}`,
            marking: name.includes("SS") || name.includes("304") || name.includes("316") ? "SS" : `MF ${numGrade === "G8" ? "G8" : "G5"}`,
            unit: "Pcs",
            productionDate: "2025-11-05",
            expiryDate: "N/A"
          });
        });
      }
    }
    
    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makeMachineScrewGrades(subcat: string, threadSeries: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    const isHalf = threadSeries.toLowerCase().includes("half");
    const isMetric = threadSeries.toLowerCase().includes("metric");
    
    // Normalize subcat names for cleaner PartNos
    let prefix = "MSCREW";
    const subcatLower = subcat.toLowerCase();
    if (subcatLower.includes("965")) {
      prefix = "MS965";
    } else if (subcatLower.includes("966")) {
      prefix = "MS966";
    } else if (subcatLower.includes("7985")) {
      prefix = "MS7985";
    } else if (subcatLower.includes("flange")) {
      prefix = "MSFL";
    } else if (subcatLower.includes("cheese")) {
      prefix = "MSCH";
    }
    
    // Seed data on select grades so it doesn't look empty and is highly polished!
    const isSeedGrade = 
      name.includes("8.8") || 
      name.includes("10.9") || 
      name.includes("12.9") || 
      name.includes("4.6") ||
      name === "SS 304" || 
      name.includes("304") ||
      name.includes("A4-70") || 
      name === "GRADE 8" || 
      name === "GRADE 5";

    if (isSeedGrade) {
      if (isMetric) {
        // Metric Seed Samples
        const sizes = [
          { dia: "M4", pitch: "0.7 MM", len: isHalf ? "25 mm" : "12 mm", wt: 0.002 },
          { dia: "M5", pitch: "0.8 MM", len: isHalf ? "30 mm" : "16 mm", wt: 0.004 },
          { dia: "M6", pitch: "1.0 MM", len: isHalf ? "40 mm" : "20 mm", wt: 0.007 },
          { dia: "M8", pitch: "1.25 MM", len: isHalf ? "50 mm" : "25 mm", wt: 0.015 }
        ];
        
        sizes.forEach((sz, idx) => {
          const numGrade = name.includes("8.8") ? "8.8" : name.includes("10.9") ? "10.9" : name.includes("12.9") ? "12.9" : name.includes("4.6") ? "4.6" : name.includes("304") ? "304" : "316";
          const lenSuffix = sz.len.replace(" mm", "");
          const partNo = `MF-${prefix}-${numGrade}-${sz.dia}-${isHalf ? "H" : "F"}-${lenSuffix}`.toUpperCase();
          const desc = `${sz.dia} x ${sz.len} ${subcat} - ${threadSeries} (${name})`;
          const bal = 1500 + (idx * 250);
          const op = bal + 400;
          const inc = 300;
          const out = 700;
          
          pRows.push({
            id: generateId(),
            partNo,
            description: desc,
            dia: sz.dia,
            pitch: sz.pitch,
            length: sz.len,
            openingStock: op,
            inStock: inc,
            outGoingStock: out,
            balanceStock: bal,
            tallyStock: bal,
            unitWeight: sz.wt,
            totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
            finish: name.includes("SS") || name.includes("304") || name.includes("316") ? "Stainless Steel Plain" : "Zinc Plated / GI",
            rackLocation: `W07-M-R${idx + 1}`,
            marking: name.includes("SS") || name.includes("304") || name.includes("316") ? "A2-70/A4-70" : `MF ${numGrade}`,
            unit: "Pcs",
            productionDate: "2025-09-18",
            expiryDate: "N/A"
          });
        });
      } else {
        // Inch Seed Samples
        const sizes = [
          { dia: "1/4\"", pitch: "20 TPI", len: isHalf ? "2\"" : "1\"", wt: 0.011 },
          { dia: "10-24", pitch: "24 TPI", len: isHalf ? "1-1/2\"" : "3/4\"", wt: 0.005 },
          { dia: "8-32", pitch: "32 TPI", len: isHalf ? "1-1/4\"" : "1/2\"", wt: 0.003 }
        ];
        
        sizes.forEach((sz, idx) => {
          const numGrade = name.includes("8") ? "G8" : name.includes("5") ? "G5" : name.includes("304") ? "304" : "316";
          const lenSuffix = sz.len.replace('"', '').replace('-', '_');
          const partNo = `MF-${prefix}-${numGrade}-${sz.dia.replace('"', '').replace('/', '-')}-${isHalf ? "H" : "F"}-${lenSuffix}`.toUpperCase();
          const desc = `${sz.dia} x ${sz.len} ${subcat} - ${threadSeries} (${name})`;
          const bal = 1000 + (idx * 200);
          const op = bal + 300;
          const inc = 150;
          const out = 450;
          
          pRows.push({
            id: generateId(),
            partNo,
            description: desc,
            dia: sz.dia,
            pitch: sz.pitch,
            length: sz.len,
            openingStock: op,
            inStock: inc,
            outGoingStock: out,
            balanceStock: bal,
            tallyStock: bal,
            unitWeight: sz.wt,
            totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
            finish: name.includes("SS") || name.includes("304") || name.includes("316") ? "Stainless Steel" : "Zinc Plated",
            rackLocation: `W07-I-R${idx + 1}`,
            marking: name.includes("SS") || name.includes("304") || name.includes("316") ? "SS" : `MF ${numGrade === "G8" ? "G8" : "G5"}`,
            unit: "Pcs",
            productionDate: "2025-09-20",
            expiryDate: "N/A"
          });
        });
      }
    }
    
    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makeSelfTappingScrewGrades(subcat: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    
    // Normalize subcat names for cleaner PartNos
    let prefix = "TSCREW";
    const subcatLower = subcat.toLowerCase();
    if (subcatLower.includes("7981")) {
      prefix = "TS7981";
    } else if (subcatLower.includes("7982")) {
      prefix = "TS7982";
    } else if (subcatLower.includes("hex")) {
      prefix = "TSHEX";
    } else if (subcatLower.includes("bugle") || (subcatLower.includes("drywall") && subcatLower.includes("philip"))) {
      prefix = "TSDRYB";
    } else if (subcatLower.includes("coarse")) {
      prefix = "TSDRYC";
    } else if (subcatLower.includes("chipboard")) {
      prefix = "TSCHIP";
    } else if (subcatLower.includes("7983")) {
      prefix = "TS7983";
    } else if (subcatLower.includes("truss")) {
      prefix = "TSTRUS";
    } else if (subcatLower.includes("7997") || subcatLower.includes("wood")) {
      prefix = "TS7997";
    }
    
    // Seed on specific common grades to make it look active
    const isSeedGrade = 
      name.includes("304") || 
      name.includes("316") || 
      name.includes("202") || 
      name.includes("4.6") || 
      name.includes("A36");

    if (isSeedGrade) {
      const sizes = [
        { dia: "#6 (3.5mm)", pitch: "18 TPI", len: '1/2" (13mm)', wt: 0.0012 },
        { dia: "#8 (4.2mm)", pitch: "15 TPI", len: '3/4" (19mm)', wt: 0.0018 },
        { dia: "#10 (4.8mm)", pitch: "12 TPI", len: '1" (25mm)', wt: 0.0028 },
        { dia: "#12 (5.5mm)", pitch: "11 TPI", len: '1-1/2" (38mm)', wt: 0.0042 }
      ];
      
      sizes.forEach((sz, idx) => {
        const numGrade = name.replace("GRADE ", "").replace("ASTM ", "").replace(" ", "");
        const cleanDia = sz.dia.split(" ")[0].replace("#", "N");
        const cleanLen = sz.len.split(" ")[0].replace('"', '').replace('/', '_');
        const partNo = `MF-${prefix}-${numGrade}-${cleanDia}-${cleanLen}`.toUpperCase();
        const desc = `${sz.dia} x ${sz.len} ${subcat} (${name})`;
        const bal = 1200 + (idx * 350);
        const op = bal + 500;
        const inc = 250;
        const out = 750;
        
        pRows.push({
          id: generateId(),
          partNo,
          description: desc,
          dia: sz.dia,
          pitch: sz.pitch,
          length: sz.len,
          openingStock: op,
          inStock: inc,
          outGoingStock: out,
          balanceStock: bal,
          tallyStock: bal,
          unitWeight: sz.wt,
          totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
          finish: name.includes("SS") || name.includes("202") || name.includes("304") || name.includes("316") ? "Stainless Steel Plain" : "Zinc Plated / Galvanized",
          rackLocation: `W08-S-R${idx + 1}`,
          marking: name.includes("SS") || name.includes("316") || name.includes("304") ? "SS" : "MF",
          unit: "Pcs",
          productionDate: "2025-09-22",
          expiryDate: "N/A"
        });
      });
    }
    
    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makeSDSScrewGrades(subcat: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    
    // Normalize subcat names for cleaner PartNos
    let prefix = "SDSSCR";
    const subcatLower = subcat.toLowerCase();
    if (subcatLower.includes("7504-m") || subcatLower.includes("7504m") || (subcatLower.includes("pan") && subcatLower.includes("drilling"))) {
      prefix = "SD7504M";
    } else if (subcatLower.includes("7504-p") || subcatLower.includes("7504p") || (subcatLower.includes("csk") && subcatLower.includes("drilling"))) {
      prefix = "SD7504P";
    } else if (subcatLower.includes("7504-n") || subcatLower.includes("7504n") || (subcatLower.includes("wafer") && subcatLower.includes("drilling"))) {
      prefix = "SD7504N";
    } else if (subcatLower.includes("7504-k") || subcatLower.includes("7504k") || (subcatLower.includes("hex") && subcatLower.includes("7504"))) {
      prefix = "SD7504K";
    } else if (subcatLower.includes("epdm")) {
      prefix = "SDEPDM";
    } else if (subcatLower.includes("24 pitch") || subcatLower.includes("24pitch")) {
      prefix = "SD24PT";
    } else if (subcatLower.includes("heavy duty")) {
      prefix = "SDHDUT";
    } else if (subcatLower.includes("wings")) {
      prefix = "SDWING";
    } else if (subcatLower.includes("double thread")) {
      prefix = "SDDTHD";
    } else if (subcatLower.includes("plastic cap")) {
      prefix = "SDPLCAP";
    }
    
    // Seed on specific common grades to make it look active
    const isSeedGrade = 
      name.includes("304") || 
      name.includes("316") || 
      name.includes("410") || 
      name.includes("202") || 
      name.includes("4.6") || 
      name.includes("A36") ||
      name.includes("TYPE-1");

    if (isSeedGrade) {
      const sizes = [
        { dia: "#8 (4.2mm)", pitch: "18 TPI", len: '1/2" (13mm)', wt: 0.0020 },
        { dia: "#10 (4.8mm)", pitch: "16 TPI", len: '3/4" (19mm)', wt: 0.0031 },
        { dia: "#12 (5.5mm)", pitch: "14 TPI", len: '1" (25mm)', wt: 0.0045 },
        { dia: "#14 (6.3mm)", pitch: "14 TPI", len: '1-1/2" (38mm)', wt: 0.0068 }
      ];
      
      sizes.forEach((sz, idx) => {
        const numGrade = name.replace("GRADE ", "").replace("ASTM ", "").replace(" ", "");
        const cleanDia = sz.dia.split(" ")[0].replace("#", "N");
        const cleanLen = sz.len.split(" ")[0].replace('"', '').replace('/', '_');
        const partNo = `MF-${prefix}-${numGrade}-${cleanDia}-${cleanLen}`.toUpperCase();
        const desc = `${sz.dia} x ${sz.len} ${subcat} (${name})`;
        const bal = 1400 + (idx * 300);
        const op = bal + 600;
        const inc = 350;
        const out = 950;
        
        pRows.push({
          id: generateId(),
          partNo,
          description: desc,
          dia: sz.dia,
          pitch: sz.pitch,
          length: sz.len,
          openingStock: op,
          inStock: inc,
          outGoingStock: out,
          balanceStock: bal,
          tallyStock: bal,
          unitWeight: sz.wt,
          totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
          finish: name.includes("SS") || name.includes("202") || name.includes("304") || name.includes("316") || name.includes("410") ? "Stainless Steel Plain" : "Zinc Plated / Galvanized",
          rackLocation: `W08-D-R${idx + 1}`,
          marking: name.includes("SS") || name.includes("316") || name.includes("304") || name.includes("410") ? "SS" : "MF",
          unit: "Pcs",
          productionDate: "2025-09-25",
          expiryDate: "N/A"
        });
      });
    }
    
    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makeSecurityFastenerGrades(subcat: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    const subL = subcat.toLowerCase();
    
    // Prefix for PartNo
    let prefix = "SF-SBT-TAP";
    if (subL.includes("button post torx tapping")) {
      prefix = "SF-SBT-TAP";
    } else if (subL.includes("csk eye drive tapping")) {
      prefix = "SF-SCE-TAP";
    } else if (subL.includes("csk post hex tapping")) {
      prefix = "SF-SCH-TAP";
    } else if (subL.includes("pan eye drive tapping")) {
      prefix = "SF-SPE-TAP";
    } else if (subL.includes("one way tapping")) {
      prefix = "SF-R1W-TAP";
    } else if (subL.includes("button post with pin hex machine")) {
      prefix = "SF-SBP-HEX-M";
    } else if (subL.includes("button post without pin hex machine")) {
      prefix = "SF-SBN-HEX-M";
    } else if (subL.includes("button post torx with pin hex machine")) {
      prefix = "SF-SBP-TORX-M";
    } else if (subL.includes("button post torx without pin hex machine")) {
      prefix = "SF-SBN-TORX-M";
    } else if (subL.includes("csk post hex machine screw with pin")) {
      prefix = "SF-SCP-HEX-M";
    } else if (subL.includes("csk post torx machine screw with pin")) {
      prefix = "SF-SCP-TORX-M";
    } else if (subL.includes("csk post torx machine screw without pin")) {
      prefix = "SF-SCN-TORX-M";
    } else if (subL.includes("pan eye drive")) {
      prefix = "SF-MPE";
    } else if (subL.includes("barrel nut")) {
      prefix = "SF-BNUT";
    } else if (subL.includes("secure ring")) {
      prefix = "SF-SRING";
    } else if (subL.includes("tool sets type-1")) {
      prefix = "SF-TSET1";
    } else if (subL.includes("tool sets type-2")) {
      prefix = "SF-TSET2";
    } else if (subL.includes("csk post torx tapping")) {
      prefix = "SF-SCT-TAP";
    }

    const isSeedGrade = 
      name.includes("304") || 
      name.includes("316") || 
      name.includes("410") || 
      name.includes("8.8") || 
      name.includes("4.6") || 
      name.includes("A36");

    if (isSeedGrade) {
      const sizes = [
        { dia: "M4", pitch: "0.7 MM", len: "12 mm", wt: 0.0025 },
        { dia: "M5", pitch: "0.8 MM", len: "16 mm", wt: 0.0039 },
        { dia: "M6", pitch: "1.0 MM", len: "20 mm", wt: 0.0065 },
        { dia: "M8", pitch: "1.25 MM", len: "25 mm", wt: 0.0135 }
      ];

      sizes.forEach((sz, idx) => {
        const numGrade = name.replace("GRADE ", "").replace("ASTM ", "").replace(" ", "");
        const cleanLen = sz.len.replace(" mm", "");
        const partNo = `MF-${prefix}-${numGrade}-${sz.dia}-${cleanLen}`.toUpperCase();
        const desc = `${sz.dia} x ${sz.len} ${subcat} (${name})`;
        const bal = 800 + (idx * 150);
        const op = bal + 300;
        const inc = 100;
        const out = 400;

        pRows.push({
          id: generateId(),
          partNo,
          description: desc,
          dia: sz.dia,
          pitch: sz.pitch,
          length: sz.len,
          openingStock: op,
          inStock: inc,
          outGoingStock: out,
          balanceStock: bal,
          tallyStock: bal,
          unitWeight: sz.wt,
          totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
          finish: name.includes("SS") || name.includes("304") || name.includes("316") || name.includes("410") ? "Stainless Steel Plain / Passivated" : "Zinc Plated High Tensile",
          rackLocation: `W09-S-R${idx + 1}`,
          marking: name.includes("SS") || name.includes("316") || name.includes("304") || name.includes("410") ? "SS POST" : "MF-SEC",
          unit: "Pcs",
          productionDate: "2025-10-02",
          expiryDate: "N/A"
        });
      });
    }

    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makeLiftingAccessoryGrades(threadSeries: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    
    // Normalize threadSeries name for cleaner PartNos
    let prefix = "LA-GEN";
    const tsLower = threadSeries.toLowerCase();
    
    if (tsLower.includes("rope")) {
      prefix = "LA-WR";
    } else if (tsLower.includes("eye bolt")) {
      prefix = "LA-EB";
    } else if (tsLower.includes("ferrule")) {
      prefix = "LA-FR";
    } else if (tsLower.includes("clip")) {
      prefix = "LA-WC";
    } else if (tsLower.includes("timble") || tsLower.includes("thimble") || tsLower.includes("timbles")) {
      prefix = "LA-TB";
    } else if (tsLower.includes("turn buckle") || tsLower.includes("turnbuckle")) {
      prefix = "LA-TN";
    } else if (tsLower.includes("shackle")) {
      prefix = "LA-SH";
    } else if (tsLower.includes("chain")) {
      prefix = "LA-CH";
    } else if (tsLower.includes("link") || tsLower.includes("connector") || tsLower.includes("lock")) {
      prefix = "LA-LK";
    } else if (tsLower.includes("hook")) {
      prefix = "LA-HK";
    } else if (tsLower.includes("snap")) {
      prefix = "LA-SN";
    } else if (tsLower.includes("pulley")) {
      prefix = "LA-PL";
    } else if (tsLower.includes("ring")) {
      prefix = "LA-RG";
    }

    const isSeedGrade = 
      name.toUpperCase().includes("304") || 
      name.toUpperCase().includes("316") || 
      name.toUpperCase().includes("8.8") || 
      name.toUpperCase().includes("100") || 
      name.toUpperCase().includes("80") || 
      name.toUpperCase().includes("S275") || 
      name.toUpperCase().includes("1045") || 
      name.toUpperCase().includes("1960") ||
      name.toUpperCase().includes("ALUM") ||
      name.toUpperCase().includes("COPPER") ||
      name.toUpperCase().includes("TYPE-1");

    if (isSeedGrade) {
      // We will suggest typical lifting sizes: e.g. 6mm, 8mm, 10mm, 12mm, 16mm or 1/4", 3/8", 1/2", 5/8"
      const isMetric = threadSeries.toUpperCase().includes("METRIC") || 
                       threadSeries.toUpperCase().includes("DIN") ||
                       (!threadSeries.toUpperCase().includes("INCH") && !threadSeries.toUpperCase().includes("INCHES"));

      const sizes = isMetric ? [
        { dia: "6 mm", pitch: "N/A", len: "N/A", wt: 0.15 },
        { dia: "8 mm", pitch: "N/A", len: "N/A", wt: 0.30 },
        { dia: "10 mm", pitch: "N/A", len: "N/A", wt: 0.55 },
        { dia: "12 mm", pitch: "N/A", len: "N/A", wt: 0.90 }
      ] : [
        { dia: "1/4\"", pitch: "N/A", len: "N/A", wt: 0.12 },
        { dia: "3/8\"", pitch: "N/A", len: "N/A", wt: 0.35 },
        { dia: "1/2\"", pitch: "N/A", len: "N/A", wt: 0.75 },
        { dia: "5/8\"", pitch: "N/A", len: "N/A", wt: 1.25 }
      ];

      sizes.forEach((sz, idx) => {
        const cleanGrade = name.replace("GRADE ", "").replace("ASTM ", "").replace(" ", "");
        const cleanDia = sz.dia.replace('"', '').replace('/', '_');
        const partNo = `MF-${prefix}-${cleanGrade}-${cleanDia}-${idx + 1}`.toUpperCase();
        const desc = `${sz.dia} ${threadSeries} (${name})`;
        const bal = 500 + (idx * 100);
        const op = bal + 150;
        const inc = 50;
        const out = 200;

        pRows.push({
          id: generateId(),
          partNo,
          description: desc,
          dia: sz.dia,
          pitch: sz.pitch,
          length: sz.len,
          openingStock: op,
          inStock: inc,
          outGoingStock: out,
          balanceStock: bal,
          tallyStock: bal,
          unitWeight: sz.wt,
          totalWeight: parseFloat((bal * sz.wt).toFixed(2)),
          finish: name.includes("SS") || name.includes("304") || name.includes("316") ? "Stainless Steel Plain" : "Galvanized / Self Color",
          rackLocation: `W09-L-R${idx + 1}`,
          marking: name.includes("SS") || name.includes("316") || name.includes("304") ? "SS" : "MF",
          unit: "Pcs",
          productionDate: "2025-10-10",
          expiryDate: "N/A"
        });
      });
    }

    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

function makePipeSupportSystemGrades(subcat: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows: ProductRow[] = [];
    
    // Normalize subcat name for cleaner PartNos
    let prefix = "PS-GEN";
    const subL = subcat.toLowerCase();
    
    if (subL.includes("clevis")) {
      prefix = "PS-CLEV";
    } else if (subL.includes("sprinkler")) {
      prefix = "PS-SPRN";
    } else if (subL.includes("split clamp") || subL.includes("epdm lining")) {
      prefix = "PS-SPLC";
    } else if (subL.includes("strap")) {
      prefix = "PS-STRP";
    } else if (subL.includes("rubber support")) {
      prefix = "PS-RUBS";
    } else if (subL.includes("riser")) {
      prefix = "PS-RISE";
    } else if (subL.includes("sleeve")) {
      prefix = "PS-SLEV";
    } else if (subL.includes("beam clamp")) {
      prefix = "PS-BEAM";
    } else if (subL.includes("channel clamp") || subL.includes("unistrut")) {
      prefix = "PS-CHAN";
    } else if (subL.includes("tube clamp")) {
      prefix = "PS-TUBE";
    } else if (subL.includes("heavy duty")) {
      prefix = "PS-HDUT";
    } else if (subL.includes("t bolt clamp")) {
      prefix = "PS-TBOL";
    } else if (subL.includes("hose clamp") || subL.includes("retaining")) {
      prefix = "PS-HOSE";
    } else if (subL.includes("offset")) {
      prefix = "PS-OFFS";
    } else if (subL.includes("vibration") || subL.includes("hanger mount")) {
      prefix = "PS-VIBR";
    } else if (subL.includes("pad")) {
      prefix = "PS-PAD";
    } else if (subL.includes("right angle")) {
      prefix = "PS-RANG";
    }

    const isSeedGrade = 
      name.toUpperCase().includes("304") || 
      name.toUpperCase().includes("316") || 
      name.toUpperCase().includes("A36") || 
      name.toUpperCase().includes("S275");

    if (isSeedGrade) {
      // 4 template rows per subcategory
      const itemsTemplate = [
        { sizeIndex: 0, scale: 1.0 },
        { sizeIndex: 1, scale: 1.2 },
        { sizeIndex: 2, scale: 1.5 },
        { sizeIndex: 3, scale: 2.0 }
      ];

      itemsTemplate.forEach(({ sizeIndex, scale }) => {
        const subU = subcat.toUpperCase();
        let diaVal = "1\"";
        let pitchVal = "N/A";
        let lenVal = "N/A";
        let wt = 0.25 * scale;
        let extraObj: Record<string, string> = {};

        try {
          if (subU === "CLEVIS HANGER") {
            const dims = [
              { d: "21.3", sz: "1/2\"", h: "13.5", bolt: "M10", hM: "70", dM: "35", uS: "3.0x25", lS: "3.0x25" },
              { d: "26.9", sz: "3/4\"", h: "13.5", bolt: "M10", hM: "75", dM: "40", uS: "3.0x25", lS: "3.0x25" },
              { d: "33.7", sz: "1\"",  h: "13.5", bolt: "M10", hM: "82", dM: "45", uS: "3.0x25", lS: "3.0x25" },
              { d: "60.3", sz: "2\"",  h: "13.5", bolt: "M10", hM: "110", dM: "60", uS: "4.0x30", lS: "4.0x30" }
            ][sizeIndex];
            diaVal = dims.d;
            pitchVal = dims.sz;
            lenVal = dims.h;
            extraObj = { boltSize: dims.bolt, hMm: dims.hM, dMm: dims.dM, upperSteel: dims.uS, lowerSteel: dims.lS };
          } else if (subU === "CLEVIS HANGER WITH LINING") {
            const dims = [
              { sz: "1/2\"", h: "13.5", bolt: "M10", hM: "72", dM: "37", uS: "3.0x25", lS: "3.0x25" },
              { sz: "3/4\"", h: "13.5", bolt: "M10", hM: "78", dM: "42", uS: "3.0x25", lS: "3.0x25" },
              { sz: "1\"",  h: "13.5", bolt: "M10", hM: "85", dM: "47", uS: "3.0x25", lS: "3.0x25" },
              { sz: "2\"",  h: "13.5", bolt: "M10", hM: "115", dM: "62", uS: "4.0x30", lS: "4.0x30" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.h;
            lenVal = dims.bolt;
            extraObj = { hMm: dims.hM, dMm: dims.dM, upperSteel: dims.uS, lowerSteel: dims.lS };
          } else if (subU === "SPRINKLER CLAMP") {
            const dims = [
              { sz: "1/2\"", d: "21.3", g: "M10", strip: "1.5x20", hM: "55", safe: "1.2", break: "3.6" },
              { sz: "3/4\"", d: "26.9", g: "M10", strip: "1.5x20", hM: "60", safe: "1.2", break: "3.6" },
              { sz: "1\"",  d: "33.7", g: "M10", strip: "1.5x20", hM: "65", safe: "1.5", break: "4.5" },
              { sz: "2\"",  d: "60.3", g: "M12", strip: "2.0x25", hM: "85", safe: "2.5", break: "7.5" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.d;
            lenVal = dims.g;
            extraObj = { stripSize: dims.strip, hMm: dims.hM, safeLoadKn: dims.safe, breakLoadKn: dims.break };
          } else if (subU === "SPLIT CLAMP WITH EPDM LINING" || subU === "PLAIN SPLIT CLAMP") {
            const dims = [
              { sz: "1/2\"", d: "20.0", range: "18-22", a: "52", tx: "1.5x20", c: "35", bolt: "M6", nut: "M8" },
              { sz: "3/4\"", d: "25.0", range: "23-28", a: "58", tx: "1.5x20", c: "41", bolt: "M6", nut: "M8" },
              { sz: "1\"",  d: "32.0", range: "31-35", a: "66", tx: "1.5x20", c: "48", bolt: "M6", nut: "M8" },
              { sz: "2\"",  d: "60.0", range: "58-64", a: "96", tx: "2.0x25", c: "75", bolt: "M8", nut: "M10" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.d;
            lenVal = dims.range;
            extraObj = { dimA: dims.a, txB: dims.tx, dimC: dims.c, boltSize: dims.bolt, nutSize: dims.nut };
          } else if (subU === "U STRAP HANGER" || subU === "U STRAP HANGER WITH LINING") {
            const dims = [
              { dI: "1/2\"", dM: "21.3", a: "40", b: "25", bolt: "M8", strip: "2.0x20", maxL: "1.5" },
              { dI: "3/4\"", dM: "26.9", a: "45", b: "30", bolt: "M8", strip: "2.0x20", maxL: "1.5" },
              { dI: "1\"",  dM: "33.7", a: "52", b: "35", bolt: "M8", strip: "2.0x20", maxL: "1.8" },
              { dI: "2\"",  dM: "60.3", a: "80", b: "50", bolt: "M10", strip: "2.5x25", maxL: "2.5" }
            ][sizeIndex];
            diaVal = dims.dI;
            pitchVal = dims.dM;
            lenVal = dims.a;
            extraObj = { dimB: dims.b, boltSize: dims.bolt, stripSize: dims.strip, maxLoadKn: dims.maxL };
          } else if (subU === "RUBBER SUPPORT INSERT") {
            const dims = [
              { pipeSzI: "1/2\"", pipeSzM: "15", pipeOd: "21.3", width: "50", totalOd: "71.3", thick: "25" },
              { pipeSzI: "3/4\"", pipeSzM: "20", pipeOd: "26.9", width: "50", totalOd: "76.9", thick: "25" },
              { pipeSzI: "1\"",  pipeSzM: "25", pipeOd: "33.7", width: "50", totalOd: "83.7", thick: "25" },
              { pipeSzI: "2\"",  pipeSzM: "50", pipeOd: "60.3", width: "50", totalOd: "110.3", thick: "25" }
            ][sizeIndex];
            diaVal = dims.pipeSzI;
            pitchVal = dims.pipeSzM;
            lenVal = dims.pipeOd;
            extraObj = { widthW: dims.width, totalOdA: dims.totalOd, thickness: dims.thick };
          } else if (subU === "RISER HANGER WITH LINING" || subU === "RISER HANGER") {
            const dims = [
              { dI: "1/2\"", len: "100", metal: "3.0x25", bolt: "M10", maxL: "1.8" },
              { dI: "3/4\"", len: "110", metal: "3.0x25", bolt: "M10", maxL: "1.8" },
              { dI: "1\"",  len: "120", metal: "3.0x25", bolt: "M10", maxL: "2.0" },
              { dI: "2\"",  len: "150", metal: "4.0x30", bolt: "M12", maxL: "3.2" }
            ][sizeIndex];
            diaVal = dims.dI;
            pitchVal = dims.len;
            lenVal = dims.metal;
            extraObj = { boltSizeMm: dims.bolt, maxLoadKn: dims.maxL };
          } else if (subU === "ANCHOR BOLT SLEEVE") {
            const dims = [
              { sz: "12", l: "120", dL: "16", bolt: "M12", l2: "30" },
              { sz: "16", l: "150", dL: "20", bolt: "M16", l2: "40" },
              { sz: "20", l: "200", dL: "24", bolt: "M20", l2: "50" },
              { sz: "24", l: "250", dL: "30", bolt: "M24", l2: "60" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.l;
            lenVal = dims.dL;
            extraObj = { boltSize: dims.bolt, l2: dims.l2 };
          } else if (subU === "U BOLT BEAM CLAMP TYPE-1") {
            const dims = [
              { d: "M10", a: "20", b: "45", c: "50", e: "15", f: "25", g: "12", h: "35" },
              { d: "M12", a: "24", b: "50", c: "55", e: "18", f: "28", g: "14", h: "40" },
              { d: "M16", a: "30", b: "65", c: "70", e: "24", f: "35", g: "18", h: "50" },
              { d: "M20", a: "36", b: "80", c: "85", e: "30", f: "45", g: "22", h: "65" }
            ][sizeIndex];
            diaVal = dims.d;
            pitchVal = dims.a;
            lenVal = dims.b;
            extraObj = { dimC: dims.c, dimE: dims.e, dimF: dims.f, dimG: dims.g, dimH: dims.h };
          } else if (subU === "U BOLT BEAM CLAMP TYPE-2") {
            const dims = [
              { a: "30", g: "10", l: "125", b: "45", h: "50", bLow: "22", s: "4.0", lm: "60", sw: "17" },
              { a: "40", g: "12", l: "150", b: "55", h: "60", bLow: "25", s: "5.0", lm: "70", sw: "19" },
              { a: "50", g: "16", l: "180", b: "70", h: "75", bLow: "32", s: "6.0", lm: "85", sw: "24" },
              { a: "60", g: "20", l: "220", b: "85", h: "90", bLow: "40", s: "8.0", lm: "100", sw: "30" }
            ][sizeIndex];
            diaVal = dims.a;
            pitchVal = dims.g;
            lenVal = dims.l;
            extraObj = { dimB: dims.b, dimH: dims.h, dimb: dims.bLow, dims: dims.s, dimLm1: dims.lm, dimSW1: dims.sw };
          } else if (subU === "UNISTRUT CHANNEL CLAMP") {
            const dims = [
              { sz: "1/2\"", a: "40", b: "22", w: "30", c: "25" },
              { sz: "3/4\"", a: "45", b: "25", w: "30", c: "28" },
              { sz: "1\"",  a: "52", b: "28", w: "30", c: "32" },
              { sz: "2\"",  a: "80", b: "45", w: "40", c: "48" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.a;
            lenVal = dims.b;
            extraObj = { plateWidth: dims.w, dimC: dims.c };
          } else if (subU === "HEAVY DUTY PIPE CLAMPS") {
            const dims = [
              { sz: "2\"", szM: "50", od: "60.3", a: "105", b: "75", c: "40", d: "14", e: "30", r: "30", l: "40", hD: "12" },
              { sz: "3\"", szM: "80", od: "88.9", a: "135", b: "105", c: "40", d: "14", e: "30", r: "45", l: "45", hD: "12" },
              { sz: "4\"", szM: "100", od: "114.3", a: "165", b: "130", c: "50", d: "18", e: "40", r: "57", l: "50", hD: "16" },
              { sz: "6\"", szM: "150", od: "168.3", a: "225", b: "185", c: "50", d: "18", e: "40", r: "84", l: "60", hD: "16" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.szM;
            lenVal = dims.od;
            extraObj = { dimA: dims.a, dimB: dims.b, dimC: dims.c, dimD: dims.d, dimE: dims.e, dimR: dims.r, dimL: dims.l, holeDia: dims.hD };
          } else if (subU === "HEAVY DUTY DOUBLE BOLT CLAMP") {
            const dims = [
              { sz: "2\"", szM: "50", od: "60.3", a: "110", b: "80", c: "40", d: "14", e: "30", s: "5.0", hD: "12", th: "M10" },
              { sz: "3\"", szM: "80", od: "88.9", a: "140", b: "110", c: "40", d: "14", e: "30", s: "5.0", hD: "12", th: "M10" },
              { sz: "4\"", szM: "100", od: "114.3", a: "170", b: "135", c: "50", d: "18", e: "40", s: "6.0", hD: "16", th: "M12" },
              { sz: "6\"", szM: "150", od: "168.3", a: "230", b: "190", c: "50", d: "18", e: "40", s: "6.0", hD: "16", th: "M12" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.szM;
            lenVal = dims.od;
            extraObj = { dimA: dims.a, dimB: dims.b, dimC: dims.c, dimD: dims.d, dimE: dims.e, dims: dims.s, holeDia: dims.hD, threads: dims.th };
          } else if (subU === "T BOLT CLAMPS") {
            const dims = [
              { rng: "17-19", dM: "17.5", dI: "0.69", l: "40", s: "0.6" },
              { rng: "20-22", dM: "21.0", dI: "0.83", l: "45", s: "0.6" },
              { rng: "23-25", dM: "24.0", dI: "0.94", l: "45", s: "0.6" },
              { rng: "26-28", dM: "27.0", dI: "1.06", l: "50", s: "0.8" }
            ][sizeIndex];
            diaVal = dims.rng;
            pitchVal = dims.dM;
            lenVal = dims.dI;
            extraObj = { dimL: dims.l, dims: dims.s };
          } else if (subU === "RETAINING HOSE CLAMPS") {
            const dims = [
              { rngM: "8-12", rngI: "0.31-0.47" },
              { rngM: "12-20", rngI: "0.47-0.79" },
              { rngM: "16-25", rngI: "0.63-0.98" },
              { rngM: "20-32", rngI: "0.79-1.26" }
            ][sizeIndex];
            diaVal = dims.rngM;
            pitchVal = dims.rngI;
            lenVal = "—";
          } else if (subU === "OFFSET PIPE CLAMP") {
            const dims = [
              { sz: "1/2\"", szM: "15", a: "90", b: "25", c: "20" },
              { sz: "3/4\"", szM: "20", a: "95", b: "30", c: "20" },
              { sz: "1\"",  szM: "25", a: "105", b: "35", c: "20" },
              { sz: "2\"",  szM: "50", a: "135", b: "60", c: "25" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.szM;
            lenVal = dims.a;
            extraObj = { dimB: dims.b, dimC: dims.c };
          } else if (subU === "ANTI VIBRATION HANGER MOUNT") {
            const dims = [
              { def: "15", rod: "M10", a: "75", b: "50", c: "45" },
              { def: "20", rod: "M12", a: "85", b: "55", c: "50" },
              { def: "25", rod: "M16", a: "105", b: "65", c: "58" },
              { def: "30", rod: "M20", a: "125", b: "80", c: "70" }
            ][sizeIndex];
            diaVal = dims.def;
            pitchVal = dims.rod;
            lenVal = dims.a;
            extraObj = { dimB: dims.b, dimC: dims.c };
          } else if (subU === "RIBBED MOUNTING PAD" || subU === "METAL SANDWICH PAD" || subU === "WAFFLE PAD" || subU === "CORK SANDWICH PAD") {
            const dims = [
              { sz: "6\"x6\"x3/8\"", rec: "300", max: "900" },
              { sz: "8\"x8\"x3/8\"", rec: "550", max: "1600" },
              { sz: "12\"x12\"x3/8\"", rec: "1200", max: "3600" },
              { sz: "18\"x18\"x3/8\"", rec: "2800", max: "8400" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.rec;
            lenVal = dims.max;
          } else if (subU === "RIBBED MULTI-LAYER PAD") {
            const dims = [
              { sz: "6\"x6\"x1\"", rec: "300", def: "3.5" },
              { sz: "8\"x8\"x1\"", rec: "550", def: "4.0" },
              { sz: "12\"x12\"x1\"", rec: "1200", def: "4.5" },
              { sz: "18\"x18\"x1\"", rec: "2800", def: "5.0" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.rec;
            lenVal = dims.def;
          } else if (subU === "VIBRATION SPRING FLEX & NEOPRENE HANGER") {
            const dims = [
              { col: "YELLOW", l: "80", w: "45", h: "120", h1: "15", h2: "18", d: "10" },
              { col: "RED", l: "90", w: "50", h: "135", h1: "18", h2: "22", d: "12" },
              { col: "BLUE", l: "110", w: "60", h: "160", h1: "22", h2: "28", d: "16" },
              { col: "GREEN", l: "130", w: "75", h: "190", h1: "28", h2: "35", d: "20" }
            ][sizeIndex];
            diaVal = dims.col;
            pitchVal = dims.l;
            lenVal = dims.w;
            extraObj = { dimH: dims.h, dimh1: dims.h1, dimh2: dims.h2, dimD: dims.d };
          } else if (subU === "VIBRATION SPRING FLEX HANGER") {
            const dims = [
              { def: "25", rod: "10", col: "RED", l: "85", b: "50", h: "130", d1: "11", fh: "25" },
              { def: "25", rod: "12", col: "BLUE", l: "95", b: "55", h: "145", d1: "13", fh: "25" },
              { def: "30", rod: "16", col: "GREEN", l: "120", b: "65", h: "175", d1: "18", fh: "30" },
              { def: "50", rod: "20", col: "YELLOW", l: "150", b: "80", h: "220", d1: "22", fh: "50" }
            ][sizeIndex];
            diaVal = dims.def;
            pitchVal = dims.rod;
            lenVal = dims.col;
            extraObj = { dimL: dims.l, dimB: dims.b, dimH: dims.h, dimd1: dims.d1, dimFH: dims.fh };
          } else if (subU === "VIBRATION HANGER NEOPRENE") {
            const dims = [
              { def: "5", rod: "10", b: "50", h: "60", hLow: "10", col: "BLACK" },
              { def: "5", rod: "12", b: "55", h: "65", hLow: "12", col: "GREEN" },
              { def: "8", rod: "16", b: "65", h: "80", hLow: "15", col: "RED" },
              { def: "8", rod: "20", b: "80", h: "100", hLow: "18", col: "BLUE" }
            ][sizeIndex];
            diaVal = dims.def;
            pitchVal = dims.rod;
            lenVal = dims.b;
            extraObj = { dimH: dims.h, dimh: dims.hLow, color: dims.col };
          } else if (subU === "RIGHT ANGLE CLAMP") {
            const dims = [
              { sz: "1/2\"", a: "55", b: "35", c: "3" },
              { sz: "3/4\"", a: "60", b: "40", c: "3" },
              { sz: "1\"",  a: "70", b: "45", c: "4" },
              { sz: "2\"",  a: "95", b: "65", c: "5" }
            ][sizeIndex];
            diaVal = dims.sz;
            pitchVal = dims.a;
            lenVal = dims.b;
            extraObj = { dimC: dims.c };
          }
        } catch (e) {
          // fallback
          diaVal = `${sizeIndex + 1}"`;
          pitchVal = "N/A";
          lenVal = "N/A";
        }

        const cleanGrade = name.replace("GRADE ", "").replace("ASTM ", "").replace(" ", "");
        const cleanDia = diaVal.split(" ")[0].replace('"', '').replace('/', '_').replace('\\', '').replace('&', '');
        const partNo = `MF-${prefix}-${cleanGrade}-${cleanDia}-${sizeIndex + 1}`.toUpperCase();
        const desc = `${diaVal} ${subcat} (${name})`;
        const bal = 600 + (sizeIndex * 120);
        const op = bal + 200;
        const inc = 80;
        const out = 280;

        pRows.push({
          id: generateId(),
          partNo,
          description: desc,
          dia: diaVal,
          pitch: pitchVal,
          length: lenVal,
          openingStock: op,
          inStock: inc,
          outGoingStock: out,
          balanceStock: bal,
          tallyStock: bal,
          unitWeight: wt,
          totalWeight: parseFloat((bal * wt).toFixed(2)),
          finish: name.includes("SS") || name.includes("304") || name.includes("316") ? "Stainless Steel Plain / Electro-polished" : "Hot Dip Galvanized / Zinc Plated",
          rackLocation: `W10-P-R${sizeIndex + 1}`,
          marking: name.includes("SS") || name.includes("316") || name.includes("304") ? "SS316" : "MF-GALV",
          unit: "Pcs",
          productionDate: "2025-10-15",
          expiryDate: "N/A",
          ...extraObj
        });
      });
    }

    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

// Special helper to build pre-seeded Anchor records
function makeAnchorGrades(subName: string, threadType: string, gradeNames: string[]): Grade[] {
  return gradeNames.map(name => {
    const pRows = [];
    
    // Seed sample data for typical active grades to make it look full-fledged and beautiful
    const isSS316 = name === "SS 316" || name === "SS 316L" || name.includes("SS 316") || name === "EN 1.4404 STAINLESS STEEL" || name === "EN 1.4404" || name.includes("SS 316L") || name.includes("316");
    const isCommonB7Or88 = name.includes("B7") || name.includes("8.8") || name.includes("A36") || name.includes("TYPE-1") || name.includes("TYPE-2") || name.includes("8") || name.includes("5") || name.includes("4.6") || name.includes("5.6") || name === "SS 304" || name.includes("B8") || name.includes("10.9");
    
    const isUBolt = subName.toUpperCase().includes("U BOLT") || subName.toUpperCase().includes("U-BOLT") || subName.toUpperCase().includes("CLAMP") || subName.toUpperCase().includes("PLATE");
    const isRivet = subName.toUpperCase().includes("RIVET") || name.toUpperCase().includes("HEAD") || name.toUpperCase().includes("K-LOCK");
    const isPin = subName.toUpperCase().includes("PIN") || subName.toUpperCase().includes("CLIP") || subName.toUpperCase().includes("LOK") || subName.toUpperCase().includes("LOCK");
    const isFlatBar = subName.toUpperCase().includes("FLAT BAR") || threadType.toUpperCase().includes("FLAT BAR");
    const isRoundBar = (subName.toUpperCase().includes("ROUND BAR") || subName.toUpperCase().includes("BAR")) && !isFlatBar;
    const isCableTray = threadType.toUpperCase().includes("CABLE TRAY") || subName.toUpperCase().includes("CHANNEL") || subName.toUpperCase().includes("FITTING") || subName.toUpperCase().includes("CLAMP") || subName.toUpperCase().includes("SUPPORT") || subName.toUpperCase().includes("CANTILEVER") || subName.toUpperCase().includes("POST");
    const codePrefix = isUBolt ? "UBL" : isRivet ? "RIV" : isPin ? "PIN" : isRoundBar ? "RND" : isFlatBar ? "FLT" : isCableTray ? "CTY" : "ANC";

    if (isSS316 || isCommonB7Or88 || isRivet || isPin || isRoundBar || isCableTray || isFlatBar) {
      const isMetric = threadType.toLowerCase().includes("metric") || threadType.toLowerCase().includes("normal") || threadType.toLowerCase().includes("standard");
      
      if (isRivet) {
        pRows.push({
          id: generateId(),
          partNo: `MF-RIV-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-4.8X12`.toUpperCase(),
          description: `${subName} - ${name} 4.8mm x 12mm`,
          dia: "4.8mm",
          pitch: "Pop Rivet",
          length: "12 mm",
          openingStock: 5000,
          inStock: 3500,
          outGoingStock: 1200,
          balanceStock: 7300,
          tallyStock: 7300,
          unitWeight: 0.003,
          totalWeight: 21.9,
          finish: name.toUpperCase().includes("STAINLESS") ? "Natural Bright" : "Zinc Plated",
          rackLocation: "W24-E-R02",
          marking: name.toUpperCase().includes("STAINLESS") ? "SS304" : "AL/ST"
        }, {
          id: generateId(),
          partNo: `MF-RIV-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-4.0X10`.toUpperCase(),
          description: `${subName} - ${name} 4.0mm x 10mm`,
          dia: "4.0mm",
          pitch: "Pop Rivet",
          length: "10 mm",
          openingStock: 8000,
          inStock: 4000,
          outGoingStock: 1500,
          balanceStock: 10500,
          tallyStock: 10500,
          unitWeight: 0.002,
          totalWeight: 21.0,
          finish: name.toUpperCase().includes("STAINLESS") ? "Natural Bright" : "Zinc Plated",
          rackLocation: "W24-E-R03",
          marking: "AL/ST"
        });
      } else if (isPin) {
        const subU = subName.toUpperCase();
        const itemsList = [0, 1, 2, 3];
        itemsList.forEach(idx => {
          let diaVal = "8.0 mm";
          let pitchVal = "—";
          let lenVal = "60 mm";
          let wt = 0.025;
          let extraObj: Record<string, string> = {};

          if (subU === "SPLIT PINS") {
            const dims = [
              { d: "1.6 mm", l: "25 mm", w: 0.0005 },
              { d: "2.0 mm", l: "30 mm", w: 0.0008 },
              { d: "3.2 mm", l: "40 mm", w: 0.0025 },
              { d: "4.0 mm", l: "50 mm", w: 0.0048 }
            ][idx];
            diaVal = dims.d;
            pitchVal = "—";
            lenVal = dims.l;
            wt = dims.w;
          } else if (subU === "R CLIPS" || subU.includes("R CLIP") && !subU.includes("DOUBLE")) {
            const dims = [
              { nom: "2 mm", d: "2.0", l: "50 mm", h: "22", w: 0.003 },
              { nom: "3 mm", d: "3.0", l: "60 mm", h: "28", w: 0.009 },
              { nom: "4 mm", d: "4.0", l: "75 mm", h: "34", w: 0.021 },
              { nom: "5 mm", d: "5.0", l: "105 mm", h: "45", w: 0.043 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = dims.d;
            lenVal = dims.l;
            wt = dims.w;
            extraObj = { dimH: dims.h };
          } else if (subU.includes("DOUBLE COIL")) {
            const dims = [
              { nom: "2 mm", d1: "2.0", l: "52 mm", h: "24", w: 0.004 },
              { nom: "3 mm", d1: "3.0", l: "64 mm", h: "30", w: 0.011 },
              { nom: "4 mm", d1: "4.0", l: "80 mm", h: "36", w: 0.025 },
              { nom: "5 mm", d1: "5.0", l: "110 mm", h: "48", w: 0.050 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = dims.d1;
            lenVal = dims.l;
            wt = dims.w;
            extraObj = { dimH: dims.h };
          } else if (subU.includes("HAIR PIN") || subU.includes("HAIRPIN") || subU.includes("RETAINER")) {
            const dims = [
              { nom: "1.5 mm", a: "1.5", b: "40 mm", c: "10", f: "5", w: 0.002 },
              { nom: "2.0 mm", a: "2.0", b: "50 mm", c: "12", f: "6", w: 0.005 },
              { nom: "3.0 mm", a: "3.0", b: "65 mm", c: "15", f: "8", w: 0.015 },
              { nom: "4.0 mm", a: "4.0", b: "80 mm", c: "18", f: "10", w: 0.032 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = "—";
            lenVal = dims.b;
            wt = dims.w;
            extraObj = { dimA: dims.a, dimC: dims.c, dimF: dims.f };
          } else if (subU.includes("LINCH")) {
            const dims = [
              { nom: "4.5 mm", d: "4.5", b: "32", d1: "3.5", b2: "35", l: "36 mm", h: "32", b1: "10", w: 0.018 },
              { nom: "6.0 mm", d: "6.0", b: "36", d1: "4.0", b2: "42", l: "40 mm", h: "36", b1: "11", w: 0.035 },
              { nom: "8.0 mm", d: "8.0", b: "42", d1: "4.5", b2: "48", l: "45 mm", h: "42", b1: "12", w: 0.065 },
              { nom: "10.0 mm", d: "10.0", b: "45", d1: "5.0", b2: "52", l: "50 mm", h: "45", b1: "14", w: 0.115 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = "—";
            lenVal = dims.l;
            wt = dims.w;
            extraObj = { dimD: dims.d, dimB: dims.b, dimD1: dims.d1, dimB2: dims.b2, dimH: dims.h, dimB1: dims.b1 };
          } else if (subU.includes("HITCH")) {
            const dims = [
              { nom: "1/2\"", a: "12.7", e: "76", t: "3.2", od: "25", c: "28", b: "12", w: 0.15 },
              { nom: "5/8\"", a: "15.8", e: "95", t: "4.0", od: "32", c: "35", b: "15", w: 0.28 },
              { nom: "3/4\"", a: "19.0", e: "115", t: "4.8", od: "38", c: "42", b: "18", w: 0.45 },
              { nom: "1\"",  a: "25.4", e: "140", t: "6.0", od: "48", c: "54", b: "22", w: 0.90 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = "—";
            lenVal = "—";
            wt = dims.w;
            extraObj = { dimA: dims.a, dimE: dims.e, dimT: dims.t, dimOD: dims.od, dimC: dims.c, dimB: dims.b };
          } else if (subU.includes("WAVE")) {
            const dims = [
              { nom: "3 mm", d: "3.0", l: "20 mm", t: "0.5", w: 0.001 },
              { nom: "4 mm", d: "4.0", l: "30 mm", t: "0.8", w: 0.003 },
              { nom: "5 mm", d: "5.0", l: "40 mm", t: "1.0", w: 0.006 },
              { nom: "6 mm", d: "6.0", l: "50 mm", t: "1.2", w: 0.012 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = dims.d;
            lenVal = dims.l;
            wt = dims.w;
            extraObj = { dimT: dims.t };
          } else if (subU.includes("S-LOK")) {
            const dims = [
              { nom: "6 mm", d: "6.0", a: "11", l: "50 mm", w: 0.015 },
              { nom: "8 mm", d: "8.0", a: "14", l: "60 mm", w: 0.028 },
              { nom: "10 mm", d: "10.0", a: "18", l: "75 mm", w: 0.052 },
              { nom: "12 mm", d: "12.0", a: "22", l: "90 mm", w: 0.088 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = dims.d;
            lenVal = dims.l;
            wt = dims.w;
            extraObj = { dimA: dims.a };
          } else if (subU.includes("DOWEL")) {
            const dims = [
              { nom: "4 mm", d: "4.0", a: "0.5", l: "20 mm", w: 0.002 },
              { nom: "6 mm", d: "6.0", a: "0.8", l: "30 mm", w: 0.007 },
              { nom: "8 mm", d: "8.0", a: "1.0", l: "40 mm", w: 0.016 },
              { nom: "10 mm", d: "10.0", a: "1.5", l: "50 mm", w: 0.031 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = dims.d;
            lenVal = dims.l;
            wt = dims.w;
            extraObj = { dimA: dims.a };
          } else if (subU.includes("CLEVIS")) {
            const dims = [
              { nom: "6 mm", a: "6.0", b: "12", c: "1.6", d: "2.0", e: "1.5", w: 0.005 },
              { nom: "8 mm", a: "8.0", b: "16", c: "2.0", d: "2.5", e: "2.0", w: 0.011 },
              { nom: "10 mm", a: "10.0", b: "20", c: "2.5", d: "3.2", e: "2.5", w: 0.022 },
              { nom: "12 mm", a: "12.0", b: "24", c: "3.2", d: "4.0", e: "3.0", w: 0.038 }
            ][idx];
            diaVal = dims.nom;
            pitchVal = "—";
            lenVal = "—";
            wt = dims.w;
            extraObj = { dimA: dims.a, dimB: dims.b, dimC: dims.c, dimD: dims.d, dimE: dims.e };
          }

          const cleanGrade = name.replace("GRADE ", "").replace("ASTM ", "").replace(" ", "");
          const cleanDia = diaVal.replace(/[^A-Za-z0-9]/g, '');
          const partNo = `MF-PIN-${subName.replace(/[^A-Za-z0-9]/g, '')}-${cleanGrade}-${cleanDia}-${idx + 1}`.toUpperCase();
          const desc = `${diaVal} ${subName} (${name})`;
          const bal = 1200 + (idx * 250);
          const op = bal + 350;
          const inc = 150;
          const out = 500;

          pRows.push({
            id: generateId(),
            partNo,
            description: desc,
            dia: diaVal,
            pitch: pitchVal,
            length: lenVal,
            openingStock: op,
            inStock: inc,
            outGoingStock: out,
            balanceStock: bal,
            tallyStock: bal,
            unitWeight: wt,
            totalWeight: parseFloat((bal * wt).toFixed(2)),
            finish: name.toUpperCase().includes("BRASS") ? "Natural Brass" : name.toUpperCase().includes("COPPER") ? "Natural Copper" : name.toUpperCase().includes("SS") || name.toUpperCase().includes("304") || name.toUpperCase().includes("316") ? "Stainless Steel Plain" : "Zinc Plated / Galvanized",
            rackLocation: `W24-F-R0${idx + 1}`,
            marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF",
            unit: "Pcs",
            productionDate: "2025-11-20",
            expiryDate: "N/A",
            ...extraObj
          });
        });
      } else if (isRoundBar) {
        const isMetricBar = subName.toUpperCase().includes("METRIC");
        pRows.push({
          id: generateId(),
          partNo: `MF-RND-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-${isMetricBar ? 'D20' : 'D0750'}`.toUpperCase(),
          description: `${subName} Solid Profile - ${name} - ${isMetricBar ? 'Ø20.0 mm x 6.0m' : 'Ø3/4" x 10\' L'}`,
          dia: isMetricBar ? "20.0 mm" : "3/4\"",
          pitch: "Solid Round Bar",
          length: isMetricBar ? "6.0 Meters" : "10 Feet",
          openingStock: 120,
          inStock: 80,
          outGoingStock: 30,
          balanceStock: 170,
          tallyStock: 170,
          unitWeight: isMetricBar ? 14.8 : 8.9,
          totalWeight: isMetricBar ? 2516.0 : 1513.0,
          finish: name.toUpperCase().includes("BRASS") ? "Natural Brass" : name.toUpperCase().includes("COPPER") ? "Natural Copper" : name.toUpperCase().includes("SS") || name.toUpperCase().includes("B8") ? "Bright Plain" : "Self-Color/Black",
          rackLocation: "W28-A-R01",
          marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF"
        }, {
          id: generateId(),
          partNo: `MF-RND-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-${isMetricBar ? 'D30' : 'D1000'}`.toUpperCase(),
          description: `${subName} Solid Profile - ${name} - ${isMetricBar ? 'Ø30.0 mm x 6.0m' : 'Ø1" x 10\' L'}`,
          dia: isMetricBar ? "30.0 mm" : "1\"",
          pitch: "Solid Round Bar",
          length: isMetricBar ? "6.0 Meters" : "10 Feet",
          openingStock: 90,
          inStock: 50,
          outGoingStock: 25,
          balanceStock: 115,
          tallyStock: 115,
          unitWeight: isMetricBar ? 33.3 : 15.8,
          totalWeight: isMetricBar ? 3829.5 : 1817.0,
          finish: name.toUpperCase().includes("BRASS") ? "Natural Brass" : name.toUpperCase().includes("COPPER") ? "Natural Copper" : name.toUpperCase().includes("SS") || name.toUpperCase().includes("B8") ? "Bright Plain" : "Self-Color/Black",
          rackLocation: "W28-A-R02",
          marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF"
        });
      } else if (isCableTray) {
        const isChannel = subName.toUpperCase().includes("CHANNEL");
        const isCantilever = subName.toUpperCase().includes("CANTILEVER");
        const isFitting = subName.toUpperCase().includes("FITTING") || subName.toUpperCase().includes("CLAMP") || subName.toUpperCase().includes("CONNECTOR");
        
        const size1 = isChannel ? "41x41x2.5mm" : isCantilever ? "300mm L" : isFitting ? "Standard Duty" : "Heavy Duty";
        const size2 = isChannel ? "41x21x2.0mm" : isCantilever ? "450mm L" : isFitting ? "Heavy Duty" : "Super Duty";
        
        pRows.push({
          id: generateId(),
          partNo: `MF-CTY-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-S1`.toUpperCase(),
          description: `${subName} Solid Component - ${name} - ${size1}`,
          dia: isChannel ? "41x41 mm" : "Universal",
          pitch: "Cable Support Option",
          length: isChannel ? "3.0 Meters" : isCantilever ? "300 mm" : "Component",
          openingStock: 350,
          inStock: 220,
          outGoingStock: 80,
          balanceStock: 490,
          tallyStock: 490,
          unitWeight: isChannel ? 5.8 : 1.2,
          totalWeight: isChannel ? 2842.0 : 588.0,
          finish: name.toUpperCase().includes("SS") ? "Bright Plain" : "Hot Dip Galvanized (HDG)",
          rackLocation: "W29-B-R01",
          marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF-HDG"
        }, {
          id: generateId(),
          partNo: `MF-CTY-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-S2`.toUpperCase(),
          description: `${subName} Solid Component - ${name} - ${size2}`,
          dia: isChannel ? "41x21 mm" : "Universal",
          pitch: "Cable Support Option",
          length: isChannel ? "3.0 Meters" : isCantilever ? "450 mm" : "Component",
          openingStock: 280,
          inStock: 150,
          outGoingStock: 60,
          balanceStock: 370,
          tallyStock: 370,
          unitWeight: isChannel ? 3.9 : 1.8,
          totalWeight: isChannel ? 1443.0 : 666.0,
          finish: name.toUpperCase().includes("SS") ? "Bright Plain" : "Hot Dip Galvanized (HDG)",
          rackLocation: "W29-B-R02",
          marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF-HDG"
        });
      } else if (isFlatBar) {
        const isMetricBar = subName.toUpperCase().includes("METRICS") || threadType.toUpperCase().includes("METRICS") || threadType.toUpperCase().includes("STANDARD") || threadType.toUpperCase().includes("NORMAL");
        
        const size1 = isMetricBar ? "50 x 6 mm" : "2\" x 1/4\"";
        const size2 = isMetricBar ? "75 x 10 mm" : "3\" x 3/8\"";
        const unitWeight1 = isMetricBar ? 2.35 : 1.62;
        const unitWeight2 = isMetricBar ? 5.88 : 3.65;
        
        pRows.push({
          id: generateId(),
          partNo: `MF-FLT-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-S1`.toUpperCase(),
          description: `${subName} Solid Member - ${name} - ${size1} x 6.0m`,
          dia: size1,
          pitch: "Solid Flat Bar",
          length: "6.0 Meters",
          openingStock: 180,
          inStock: 120,
          outGoingStock: 45,
          balanceStock: 255,
          tallyStock: 255,
          unitWeight: unitWeight1,
          totalWeight: unitWeight1 * 255,
          finish: name.toUpperCase().includes("SS") ? "Bright Plain" : "Hot Dip Galvanized (HDG)",
          rackLocation: "W30-A-R01",
          marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF"
        }, {
          id: generateId(),
          partNo: `MF-FLT-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-S2`.toUpperCase(),
          description: `${subName} Solid Member - ${name} - ${size2} x 6.0m`,
          dia: size2,
          pitch: "Solid Flat Bar",
          length: "6.0 Meters",
          openingStock: 140,
          inStock: 90,
          outGoingStock: 35,
          balanceStock: 195,
          tallyStock: 195,
          unitWeight: unitWeight2,
          totalWeight: unitWeight2 * 195,
          finish: name.toUpperCase().includes("SS") ? "Bright Plain" : "Hot Dip Galvanized (HDG)",
          rackLocation: "W30-A-R02",
          marking: name.toUpperCase().includes("316") ? "SS316" : name.toUpperCase().includes("304") ? "SS304" : "MF"
        });
      } else if (isMetric) {
        const isStraight = subName.toUpperCase() === "STRAIGHT ANCHOR BOLTS";
        const isType1 = subName.toUpperCase().includes("TYPE-1") || subName.toUpperCase().includes("TYPE 1");
        const uBoltFields: Record<string, string> = {};
        if (isUBolt) {
          const sName = subName.toUpperCase();
          if (sName === "ROUND BEND U BOLT") {
            uBoltFields.threadD = "50 mm";
            uBoltFields.innerDiaC = "76 mm";
          } else if (sName === "SQUARE BEND U BOLTS") {
            uBoltFields.threadD = "50 mm";
            uBoltFields.innerDiaB = "76 mm";
          } else if (sName === "NEOPRENE SLEEVE U BOLT" || sName === "U BOLT WITH SILICONE RUBBER LINED") {
            uBoltFields.threadL = "45 mm";
            uBoltFields.innerDiaC = "60 mm";
          } else if (sName === "U BOLTS RUBBER LINED WITH PTFE PAD") {
            uBoltFields.threadE = "55 mm";
            uBoltFields.innerDiaB = "80 mm";
            uBoltFields.dimA = "40 mm";
            uBoltFields.dimB = "30 mm";
            uBoltFields.dimC = "12 mm";
            uBoltFields.dimD = "8 mm";
            uBoltFields.dimE = "15 mm";
          } else if (sName === "RUBBER MOULDED SLEEVED U BOLT" || 
                     sName === "U BOLT WITH PTFE SLEEVE & PAD" || 
                     sName === "U BOLT WITH PU COATING WITH RUBBER PAD LINED" || 
                     sName === "INSULATED U BOLTS") {
            uBoltFields.dimA = "35 mm";
            uBoltFields.dimB = "25 mm";
            uBoltFields.dimC = "10 mm";
            uBoltFields.dimD = "6 mm";
          } else if (sName === "U BOLT PLATE") {
            uBoltFields.dimD = "15 mm";
            uBoltFields.dimE = "4 mm";
          } else if (sName === "EXHAUST CLAMPS") {
            uBoltFields.dimE = "18 mm";
            uBoltFields.threadDia = "M10";
            uBoltFields.dimG = "28 mm";
            uBoltFields.dimH = "35 mm";
            uBoltFields.dimI = "5 mm";
          }
        }

        pRows.push({
          id: generateId(),
          partNo: `MF-${codePrefix}-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-M12`.toUpperCase(),
          description: `${subName} (${name}) M12 x 110mm`,
          dia: "M12",
          pitch: name.includes("NYLON") ? "Sleeve: 12mm" : "1.75 mm",
          length: "110 mm",
          topThreadT1: isStraight ? "50 mm" : undefined,
          bottomThreadT2: isStraight ? "50 mm" : undefined,
          threadT: isType1 ? "50 mm" : undefined,
          bendC: isType1 ? "40 mm" : undefined,
          openingStock: 2200,
          inStock: 1500,
          outGoingStock: 650,
          balanceStock: 3050,
          tallyStock: 3050,
          unitWeight: 0.115,
          totalWeight: 350.75,
          finish: isSS316 ? "Plain" : "Zinc Plated",
          rackLocation: "W18-A-R03",
          marking: isSS316 ? "A4" : name.includes("8.8") ? "8.8" : "MF",
          ...uBoltFields
        }, {
          id: generateId(),
          partNo: `MF-${codePrefix}-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-M16`.toUpperCase(),
          description: `${subName} (${name}) M16 x 150mm`,
          dia: "M16",
          pitch: name.includes("NYLON") ? "Sleeve: 16mm" : "2.00 mm",
          length: "150 mm",
          topThreadT1: isStraight ? "60 mm" : undefined,
          bottomThreadT2: isStraight ? "60 mm" : undefined,
          threadT: isType1 ? "70 mm" : undefined,
          bendC: isType1 ? "50 mm" : undefined,
          openingStock: 1400,
          inStock: 900,
          outGoingStock: 350,
          balanceStock: 1950,
          tallyStock: 1950,
          unitWeight: 0.285,
          totalWeight: 555.75,
          finish: isSS316 ? "Plain" : "Hot Dip Galvanized",
          rackLocation: "W18-A-R04",
          marking: isSS316 ? "316" : "MF",
          ...uBoltFields
        });
      } else {
        const isStraight = subName.toUpperCase() === "STRAIGHT ANCHOR BOLTS";
        const isType1 = subName.toUpperCase().includes("TYPE-1") || subName.toUpperCase().includes("TYPE 1");
        const uBoltFields: Record<string, string> = {};
        if (isUBolt) {
          const sName = subName.toUpperCase();
          if (sName === "ROUND BEND U BOLT") {
            uBoltFields.threadD = "2.0\"";
            uBoltFields.innerDiaC = "3.0\"";
          } else if (sName === "SQUARE BEND U BOLTS") {
            uBoltFields.threadD = "2.0\"";
            uBoltFields.innerDiaB = "3.0\"";
          } else if (sName === "NEOPRENE SLEEVE U BOLT" || sName === "U BOLT WITH SILICONE RUBBER LINED") {
            uBoltFields.threadL = "1.75\"";
            uBoltFields.innerDiaC = "2.5\"";
          } else if (sName === "U BOLTS RUBBER LINED WITH PTFE PAD") {
            uBoltFields.threadE = "2.25\"";
            uBoltFields.innerDiaB = "3.25\"";
            uBoltFields.dimA = "1.5\"";
            uBoltFields.dimB = "1.2\"";
            uBoltFields.dimC = "0.5\"";
            uBoltFields.dimD = "0.3\"";
            uBoltFields.dimE = "0.6\"";
          } else if (sName === "RUBBER MOULDED SLEEVED U BOLT" || 
                     sName === "U BOLT WITH PTFE SLEEVE & PAD" || 
                     sName === "U BOLT WITH PU COATING WITH RUBBER PAD LINED" || 
                     sName === "INSULATED U BOLTS") {
            uBoltFields.dimA = "1.4\"";
            uBoltFields.dimB = "1.0\"";
            uBoltFields.dimC = "0.4\"";
            uBoltFields.dimD = "0.25\"";
          } else if (sName === "U BOLT PLATE") {
            uBoltFields.dimD = "0.6\"";
            uBoltFields.dimE = "0.15\"";
          } else if (sName === "EXHAUST CLAMPS") {
            uBoltFields.dimE = "0.7\"";
            uBoltFields.threadDia = "3/8\"";
            uBoltFields.dimG = "1.1\"";
            uBoltFields.dimH = "1.4\"";
            uBoltFields.dimI = "0.2\"";
          }
        }

        pRows.push({
          id: generateId(),
          partNo: `MF-${codePrefix}-${subName.replace(/[^A-Za-z0-9]/g, '')}-${name.replace(/[^A-Za-z0-9]/g, '')}-0.500`.toUpperCase(),
          description: `${subName} (${name}) 1/2" x 4-1/2"`,
          dia: '1/2"',
          pitch: '13 TPI',
          length: '4-1/2"',
          topThreadT1: isStraight ? '2.0"' : undefined,
          bottomThreadT2: isStraight ? '2.0"' : undefined,
          threadT: isType1 ? '2.5"' : undefined,
          bendC: isType1 ? '1.5"' : undefined,
          openingStock: 1800,
          inStock: 600,
          outGoingStock: 400,
          balanceStock: 2000,
          tallyStock: 2000,
          unitWeight: 0.24,
          totalWeight: 480.0,
          finish: isSS316 ? "Plain" : "Zinc Plated",
          rackLocation: "W18-B-R01",
          marking: isSS316 ? "SS" : "MF",
          ...uBoltFields
        });
      }
    }

    return {
      id: generateId(),
      name,
      rows: pRows
    };
  });
}

// Subcategory definitions inside "Structural Bolts"
export const STRUCTURAL_BOLTS_SUBCATEGORIES_DATA = [
  {
    name: "Hex Bolts",
    threadTypes: [
      { name: "Hex Bolts Full Thread Metric", grades: makeGrades(HEX_BOLTS_FULL_THREAD_METRIC_GRADES, true) },
      { name: "Hex Bolts Half Thread Metric", grades: makeGrades(HEX_BOLTS_HALF_THREAD_METRIC_GRADES) },
      { name: "Hex Bolts Full Thread Inches", grades: makeGrades(HEX_BOLTS_INCH_GRADES, true, true) },
      { name: "Hex Bolts Half Thread Inches", grades: makeGrades(HEX_BOLTS_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "FLANGE BOLTS",
    threadTypes: [
      { name: "Flange Bolts Full Thread Metric", grades: makeGrades(FLANGE_BOLTS_FULL_THREAD_METRIC_GRADES) },
      { name: "Flange Bolts Half Thread Metric", grades: makeGrades(FLANGE_BOLTS_HALF_THREAD_METRIC_GRADES) },
      { name: "Flange Bolts Full Thread Inches", grades: makeGrades(FLANGE_BOLTS_INCH_GRADES, false, true) },
      { name: "Flange Bolts Half Thread Inches", grades: makeGrades(FLANGE_BOLTS_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "ROOFING BOLTS",
    threadTypes: [
      { name: "Roofing Bolts Star", grades: makeGrades(ROOFING_BOLTS_GRADES) },
      { name: "Roofing Bolts Slotted", grades: makeGrades(ROOFING_BOLTS_GRADES) }
    ]
  },
  {
    name: "CARRIAGE BOLTS",
    threadTypes: [
      { name: "Carriage Bolts Full Thread Metric", grades: makeGrades(CARRIAGE_BOLTS_METRIC_GRADES) },
      { name: "Carriage Bolts Half Thread Metric", grades: makeGrades(CARRIAGE_BOLTS_METRIC_GRADES) },
      { name: "Carriage Bolts Full Thread Inches", grades: makeGrades(CARRIAGE_BOLTS_INCH_GRADES, false, true) },
      { name: "Carriage Bolts Half Thread Inches", grades: makeGrades(CARRIAGE_BOLTS_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "T Bolts",
    threadTypes: [
      { name: "T Bolts Full Thread Metric", grades: makeGrades(T_BOLTS_METRIC_GRADES) },
      { name: "T Bolts Half Thread Metric", grades: makeGrades(T_BOLTS_METRIC_GRADES) },
      { name: "T Bolts Full Thread Inches", grades: makeGrades(T_BOLTS_INCH_GRADES, false, true) },
      { name: "T Bolts Half Thread Inches", grades: makeGrades(T_BOLTS_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "12 POINT BOLTS",
    threadTypes: [
      { name: "12 Point Bolts Full Thread Metric", grades: makeGrades(TWELVE_POINT_METRIC_GRADES) },
      { name: "12 Point Bolts Half Thread Metric", grades: makeGrades(TWELVE_POINT_METRIC_GRADES) },
      { name: "12 Point Bolts Full Thread Inches", grades: makeGrades(TWELVE_POINT_INCH_GRADES, false, true) },
      { name: "12 Point Bolts Half Thread Inches", grades: makeGrades(TWELVE_POINT_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "TENSION CONTROL BOLTS",
    threadTypes: [
      { name: "TCB Bolts Full Thread Metric", grades: makeGrades(TCB_METRIC_GRADES) },
      { name: "TCB Bolts Half Thread Inches", grades: makeGrades(TCB_INCH_GRADES) }
    ]
  },
  {
    name: "SQUARE HEAD BOLTS",
    threadTypes: [
      { name: "Square Head Bolts Full Thread Metric", grades: makeGrades(SQUARE_HEAD_METRIC_GRADES) },
      { name: "Square Head Bolts Half Thread Metric", grades: makeGrades(SQUARE_HEAD_METRIC_GRADES) },
      { name: "Square Head Bolts Full Thread Inches", grades: makeGrades(SQUARE_HEAD_INCH_GRADES, false, true) },
      { name: "Square Head Bolts Half Thread Inches", grades: makeGrades(SQUARE_HEAD_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "CONNECTOR BOLTS",
    threadTypes: [
      { name: "Connector Bolts Full Thread Metric", grades: makeGrades(CONNECTOR_METRIC_GRADES) },
      { name: "Connector Bolts Half Thread Metric", grades: makeGrades(CONNECTOR_METRIC_GRADES) },
      { name: "Connector Bolts Full Thread Inches", grades: makeGrades(CONNECTOR_INCH_GRADES, false, true) },
      { name: "Connector Bolts Half Thread Inches", grades: makeGrades(CONNECTOR_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "COACH SCREWS",
    threadTypes: [
      { name: "Coach Screws Full Thread Metric", grades: makeGrades(COACH_SCREWS_METRIC_GRADES) },
      { name: "Coach Screws Half Thread Metric", grades: makeGrades(COACH_SCREWS_METRIC_GRADES) },
      { name: "Coach Screws Full Thread Inches", grades: makeGrades(COACH_SCREWS_INCH_GRADES, false, true) },
      { name: "Coach Screws Half Thread Inches", grades: makeGrades(COACH_SCREWS_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "ELAVATOR BOLTS",
    threadTypes: [
      { name: "Elevator Bolts Type-1", grades: makeGrades(ELEVATOR_BOLTS_TYPE1_GRADES) },
      { name: "Elevator Bolts Type-2", grades: makeGrades(ELEVATOR_BOLTS_TYPE1_GRADES) },
      { name: "Elevator Bolts Type-3", grades: makeGrades(ELEVATOR_BOLTS_TYPE3_GRADES) },
      { name: "Elevator Bolts Type-4", grades: makeGrades(ELEVATOR_BOLTS_TYPE3_GRADES) }
    ]
  },
  {
    name: "BOX BOLTS",
    threadTypes: [
      { name: "Box Bolts Hex Head", grades: makeGrades(BOX_BOLTS_GRADES) },
      { name: "Box Bolts Square Head", grades: makeGrades(BOX_BOLTS_GRADES) }
    ]
  },
  {
    name: "PLOW BOLTS",
    threadTypes: [
      { name: "Plow Bolts Full Thread Metric", grades: makeGrades(PLOW_BOLTS_METRIC_GRADES) },
      { name: "Plow Bolts Half Thread Metric", grades: makeGrades(PLOW_BOLTS_METRIC_GRADES) },
      { name: "Plow Bolts Full Thread Inches", grades: makeGrades(PLOW_BOLTS_INCH_GRADES, false, true) },
      { name: "Plow Bolts Half Thread Inches", grades: makeGrades(PLOW_BOLTS_INCH_GRADES, false, true) }
    ]
  },
  {
    name: "T BOLTS ORDINARY",
    threadTypes: [
      { name: "T Bolts Full Thread Metric", grades: makeGrades(T_BOLTS_ORDINARY_GRADES) }
    ]
  },
  {
    name: "FINNECK BOLTS",
    threadTypes: [
      { name: "Finneck Bolts Full Thread Metric", grades: makeGrades(FINNECK_BOLTS_METRIC_GRADES) },
      { name: "Finneck Bolts Half Thread Metric", grades: makeGrades(FINNECK_BOLTS_METRIC_GRADES) },
      { name: "Finneck Bolts Full Thread Inches", grades: makeGrades(FINNECK_BOLTS_INCH_GRADES, false, true) },
      { name: "Finneck Bolts Half Thread Inches", grades: makeGrades(FINNECK_BOLTS_INCH_GRADES, false, true) }
    ]
  }
];

export const ALL_THREADS_METRIC_GRADES = [
  "GRADE 4.6 IND", "GRADE 4.6 CHIN", "GRADE 4.8", "GRADE 8.8", "GRADE 10.9", "GRADE 12.9",
  "ASTM A325M", "ASTM A490M", "ASTM A307 GR A", "ASTM A307 GR B", "ASTM A193 GR B5", "ASTM A193 GR B6",
  "ASTM A193 GR B7", "ASTM A193 GR B7M", "ASTM A193 GR B16", "ASTM A320 GR L7", "ASTM A320 GR L7M", "ASTM A320 GR L43",
  "SS 304", "SS 410", "SS 316", "SS 316L", "SS 310", "SS 310S", "SS 321",
  "ASTM A193 GR B8 CL-1", "ASTM A193 GR B8 CL-2", "ASTM A193 GR B8M CL-1", "ASTM A193 GR B8M CL-2",
  "ASTM A320 GR B8 CL-1", "ASTM A320 GR B8 CL-2", "ASTM A320 GR B8M CL-1", "ASTM A320 GR B8M CL-2",
  "ASTM A193 GR B8T", "ASTM A193 GR B8C", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP",
  "ASTM A437 B4B (UNS S42200)", "ASTM A182 F51 (UNS S31803 / W.Nr.1.4462)", "ASTM A182 F53 (UNS S32750 / W.Nr.1.4468)",
  "ASTM A182 F55 (UNS S32760 / W.Nr.1.4496)", "ASTM A182 F44 (UNS S31254 / W.Nr.1.4547)", "ASTM A182 F310 (UNS S31000 / W.Nr.1.4805)",
  "ASTM A182 F904L (UNS N08904 / W.Nr.1.4539)", "ASTM A540 B21,B22,B23,B24", "ASTM A564 630 (UNS S17400)", "ASTM F467 Titanium Gr.2,5",
  "INCONEL ALLOY C 276 (UNS N10276 / W.Nr.2.4819)", "INCONEL ALLOY 625 (ASTM B446 / UNS N06625 / W.Nr.2.4856)",
  "INCONEL ALLOY 718 (ASTM B637 / UNS N07718 / W.Nr.2.4668)", "INCONEL ALLOY 600 (ASTM B166 / UNS N06600 / W.Nr.2.4816)",
  "INCONEL ALLOY 601 (ASTM B166 / UNS N06601 / W.Nr.2.4851)", "INCONEL ALLOY 925 (ASTM B805 / UNS N09925)",
  "INCOLOY ALLOY 20 (ASTM B473 / UNS N08020)", "INCOLOY ALLOY 800H (ASTM B408 / UNS N08800)",
  "INCOLOY ALLOY 825 (ASTM B425 / UNS N08825 / W.Nr.2.4858)", "MONEL ALLOY 400 (ASTM F467 / UNS N04400 / W.Nr.2.4360)",
  "MONEL ALLOY K 500 (ASTM F467 / UNS N05500 / W.Nr.2.4375)", "NIMONIC 80A (ASTM B637 / UNS N07080 / W2.4952)",
  "NITRONIC 50 XM-19 (UNS S20910 / W.Nr.1.3964)", "NITRONIC 60 (UNS S21800)", "WASPALOY (AMS 5708 / UNS N07001 / W.Nr.2.4654)",
  "EN 10269", "C35E (W.Nr.1.1181)", "C45E (W.Nr.1.1191)",
  "25CrMo4 (W.Nr.1.7218)", "42CrMo4 (W.Nr.1.7725)", "40CrMoV4-6 (W.Nr.1.7711)", "41NiCrMo7-3-2 (W.Nr.1.6563)",
  "20CrMoVTiB4-10 (W.Nr.1.7729)", "34CrNiMo6 (W.Nr.1.6582)", "30CrNiMo8 (W.Nr.1.6580)",
  "X22CrMoV12-1 (W.Nr.1.4923)", "X19CrMoNbVN11-1 (W.Nr.1.4913)", "X5CrNi18-10 (W.Nr.1.4301)",
  "X2CrNiMo17-12-2 (W.Nr.1.4404)", "X5CrNiMo17-12-2 (W.Nr.1.4401)", "X6NiCrTiMoVB25-15-2 (W.Nr.1.4980)"
];

export const ALL_THREADS_INCH_GRADES = [
  "GRADE 2", "GRADE 5", "GRADE 8", "ASTM F1554 GRADE 36", "ASTM F1554 GRADE 55", "ASTM F1554 GRADE 105",
  "ASTM A325M", "ASTM A490M", "ASTM A307 GR A", "ASTM A307 GR B", "ASTM A193 GR B5", "ASTM A193 GR B6",
  "ASTM A193 GR B7", "ASTM A193 GR B7M", "ASTM A193 GR B16", "ASTM A320 GR L7", "ASTM A320 GR L7M", "ASTM A320 GR L43",
  "SS 304", "SS 410", "SS 316", "SS 316L", "SS 310", "SS 310S", "SS 321",
  "ASTM A193 GR B8 CL-1", "ASTM A193 GR B8 CL-2", "ASTM A193 GR B8M CL-1", "ASTM A193 GR B8M CL-2",
  "ASTM A320 GR B8 CL-1", "ASTM A320 GR B8 CL-2", "ASTM A320 GR B8M CL-1", "ASTM A320 GR B8M CL-2",
  "ASTM A193 GR B8T", "ASTM A193 GR B8C", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP",
  "ASTM A437 B4B (UNS S42200)", "ASTM A182 F51 (UNS S31803 / W.Nr.1.4462)", "ASTM A182 F53 (UNS S32750 / W.Nr.1.4468)",
  "ASTM A182 F55 (UNS S32760 / W.Nr.1.4496)", "ASTM A182 F44 (UNS S31254 / W.Nr.1.4547)", "ASTM A182 F310 (UNS S31000 / W.Nr.1.4805)",
  "ASTM A182 F904L (UNS N08904 / W.Nr.1.4539)", "ASTM A540 B21,B22,B23,B24", "ASTM A564 630 (UNS S17400)", "ASTM F467 Titanium Gr.2,5",
  "INCONEL ALLOY C 276 (UNS N10276 / W.Nr.2.4819)", "INCONEL ALLOY 625 (ASTM B446 / UNS N06625 / W.Nr.2.4856)",
  "INCONEL ALLOY 718 (ASTM B637 / UNS N07718 / W.Nr.2.4668)", "INCONEL ALLOY 600 (ASTM B166 / UNS N06600 / W.Nr.2.4816)",
  "INCONEL ALLOY 601 (ASTM B166 / UNS N06601 / W.Nr.2.4851)", "INCONEL ALLOY 925 (ASTM B805 / UNS N09925)",
  "INCOLOY ALLOY 20 (ASTM B473 / UNS N08020)", "INCOLOY ALLOY 800H (ASTM B408 / UNS N08800)",
  "INCOLOY ALLOY 825 (ASTM B425 / UNS N08825 / W.Nr.2.4858)", "MONEL ALLOY 400 (ASTM F467 / UNS N04400 / W.Nr.2.4360)",
  "MONEL ALLOY K 500 (ASTM F467 / UNS N05500 / W.Nr.2.4375)", "NIMONIC 80A (ASTM B637 / UNS N07080 / W2.4952)",
  "NITRONIC 50 XM-19 (UNS S20910 / W.Nr.1.3964)", "NITRONIC 60 (UNS S21800)", "WASPALOY (AMS 5708 / UNS N07001 / W.Nr.2.4654)",
  "EN 10269", "C35E (W.Nr.1.1181)", "C45E (W.Nr.1.1191)",
  "25CrMo4 (W.Nr.1.7218)", "42CrMo4 (W.Nr.1.7725)", "40CrMoV4-6 (W.Nr.1.7711)", "41NiCrMo7-3-2 (W.Nr.1.6563)",
  "20CrMoVTiB4-10 (W.Nr.1.7729)", "34CrNiMo6 (W.Nr.1.6582)", "30CrNiMo8 (W.Nr.1.6580)",
  "X22CrMoV12-1 (W.Nr.1.4923)", "X19CrMoNbVN11-1 (W.Nr.1.4913)", "X5CrNi18-10 (W.Nr.1.4301)",
  "X2CrNiMo17-12-2 (W.Nr.1.4404)", "X5CrNiMo17-12-2 (W.Nr.1.4401)", "X6NiCrTiMoVB25-15-2 (W.Nr.1.4980)"
];

export const SHEAR_STUD_GRADES = [
  "ISO 13918", "AWS D 1.1 / 1.5", "GB/T 10433", "JIS B1198", "CERAMIC FERRULE"
];

export const WELDING_STUD_GRADES = [
  "GRADE 1008", "GRADE 1010", "GRADE 1015", "GRADE 1018", "SS 304", "SS 316", "SS 316L",
  "ALUM 1100", "ALUM 5086", "ALUM 6063", "BRASS 70-30", "BRAS 65-35"
];

export const FULL_THREAD_PLUG_GRADES = [
  "ASTM A105", "ASTM A181", "ASTM A182", "ASTM A266", "ASTM A336", "ASTM A350", "ASTM A369",
  "ASTM A473", "ASTM A522", "ASTM A579", "ASTM A592", "ASTM A638", "ASTM A668", "ASTM A694",
  "ASTM A705", "ASTM A707", "ASTM A727", "ASTM A765", "ASTM A859", "ASTM A952", "ASTM A965",
  "ASTM A1021", "ASTM A1049", "ASTM B381", "ASTM B462", "ASTM B564", "ASTM B865"
];

export const NUTS_EXOTIC_SHARED_GRADES = [
  "ASTM A194 GRADE 2H", "ASTM A194 GRADE 2HM", "ASTM A194 GRADE 3", "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L",
  "ASTM A194 GRADE 6", "ASTM A194 GRADE 7", "ASTM A194 GRADE 7L", "ASTM A194 GRADE 7M", "ASTM A194 GRADE 7ML",
  "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M", "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T",
  "DIN 934 BRASS", "DIN 934 COPPER", "TEFLON", "NYLON", "GRP",
  "ASTM A437 B4B (UNS S42200)", "ASTM A453 660 A-B-C-D (UNS S66286/W.Nr.1.4980)", "ASTM A182 F51 (UNS S31803/W.Nr.1.4462)",
  "ASTM A182 F53 (UNS S32750/W.Nr.1.4468)", "ASTM A182 F55 (UNS S32760/W.Nr.1.4496)", "ASTM A182 F44 (UNS S31254/W.Nr.1.4547)",
  "ASTM A182 F310 (UNS S31000/W.Nr.1.4805)", "ASTM A182 F904L (UNS N08904/W.Nr.1.4539)", "ASTM A540 B21, B22, B23, B24",
  "ASTM A564 630 (UNS S17400)", "ASTM F467 Titanium Gr.2,5",
  "INCONEL® ALLOY C 276 (UNS N10276/W.Nr.2.4819)", "INCONEL® ALLOY 625 (ASTM B446/UNS N06625/W.Nr.2.4856)",
  "INCONEL® ALLOY 718 (ASTM B637/UNS N07718/W.Nr.2.4668)", "INCONEL® ALLOY 600 (ASTM B166/UNS N06600/W.Nr.2.4816)",
  "INCONEL® ALLOY 601 (ASTM B166/UNS N06601/W.Nr.2.4851)", "INCONEL® ALLOY 925 (ASTM B805/UNS N09925)",
  "INCOLOY® ALLOY 20 (ASTM B473/UNS N08020)", "INCOLOY® ALLOY 800H (ASTM B408/UNS N08800)",
  "INCOLOY® ALLOY 825 (ASTM B425UNS N08825/W.Nr.2.4858)", "MONEL® ALLOY 400 (ASTM F467/UNS N04400/W.Nr.2.4360)",
  "MONEL® ALLOY K 500 (ASTM F467UNS N05500/W.Nr.2.4375)", "NIMONIC® 80A (ASTM B637/UNS N07080/W2.4952)",
  "NITRONIC® 50 XM-19 (UNS S20910/W.Nr.1.3964)", "NITRONIC® 60 (UNS S21800)", "WASPALOY® (AMS 5708/UNS N07001/W.Nr.2.4654)",
  "EN 10269", "C35E (W.Nr.1.1181)", "C45E (W.Nr.1.1191)", "25CrMo4 (W.Nr.1.7218)", "42CrMo4 (W.Nr.1.7725)",
  "40CrMoV4-6 (W.Nr.17711)", "41NiCrMo7-3-2 (W.Nr.1.6563)", "20CrMoVTiB4-10 (W.Nr.1.7729)", "34CrNiMo6 (W.Nr.1.6582)",
  "30CrNiMo8 (W.Nr.1.6580)", "X22CrMoV12-1 (W.Nr.1.4923)", "X19CrMoNbVN11-1 (W.Nr.1.4913)", "X5CrNi18-10 (W.Nr.1.4301)",
  "X2CrNiMo17-12-2 (W.Nr.1.4404)", "X5CrNiMo17-12-2 (W.Nr.1.4401)", "X6NiCrTiMoVB25-15-2 (W.Nr.1.4980)"
];

export const NUTS_HEAVY_METRIC_GRADES = [
  "ASTM A563M GRADE 8S", "ASTM A563M GRADE 10S", "ASTM A563 GRADE DH", "ASTM A563 GRADE A", "DIN 6915 GRADE 10",
  ...NUTS_EXOTIC_SHARED_GRADES
];

export const NUTS_HEAVY_INCHES_GRADES = [
  "ASTM A563 GRADE DH", "ASTM A563 GRADE A",
  ...NUTS_EXOTIC_SHARED_GRADES
];

export const NUTS_STANDARD_METRIC_GRADES = [
  "DIN 934 CLASS 6", "DIN 934 CLASS 6 (8 MARK)", "DIN 934 CLASS 8", "DIN 934 CLASS 10", "DIN 934 CLASS 12",
  "DIN 934 SS 202", "DIN 934 SS 304", "DIN 934 SS 316 A4-70", "DIN 934 SS 316 A4-80", "DIN 934 SS 316L A4L-70",
  "DIN 934 SS 316L A4L-80", "SS 310", "SS 310S", "SS 410", "ASTM A194 GRADE 2H", "ASTM A194 GRADE 2HM",
  "ASTM A194 GRADE 3", "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L", "ASTM A194 GRADE 6", "ASTM A194 GRADE 7",
  "ASTM A194 GRADE 7L", "ASTM A194 GRADE 7M", "ASTM A194 GRADE 7ML", "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C",
  "ASTM A194 GRADE 8M", "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T", "DIN 934 BRASS", "DIN 934 COPPER",
  "TEFLON", "NYLON", "GRP"
];

export const NUTS_STANDARD_INCH_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "DIN 934 BRASS", "DIN 934 COPPER",
  "TEFLON", "NYLON", "GRP"
];

export const NUTS_FLANGE_METRIC_GRADES = [
  "DIN 6923 CLASS 8", "DIN 6923 CLASS 10", "DIN 6923 CLASS 12", "SS 304", "SS 316 A4-70", "SS 316 A4-80",
  "SS 316L A4L-70", "SS 316L A4L-80", "DIN 6923 BRASS", "DIN 6923 COPPER", "SS 310", "SS 310S",
  "TEFLON", "NYLON", "GRP"
];

export const NUTS_FLANGE_INCH_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER", "SS 310", "SS 310S",
  "TEFLON", "NYLON", "GRP"
];

export const NUTS_NYLOCK_METRIC_GRADES = [
  "DIN 985 CLASS 6 (8 MARKING)", "DIN 985 CLASS 8", "DIN 985 CLASS 10", "DIN 985 CLASS 12",
  "SS 202", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80",
  "ASTM A194 GRADE 2H", "ASTM A194 GR 8", "ASTM A194 GR 8M", "BRASS", "COPPER"
];

export const NUTS_NYLOCK_INCH_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "ASTM A194 GRADE 2H", "ASTM A194 GR 8", "ASTM A194 GR 8M",
  "BRASS", "COPPER"
];

export const NUTS_GENERAL_METRIC_GRADES = [
  "CLASS 6", "CLASS 8", "CLASS 10", "CLASS 12", "SS 304", "SS 316 A4-70", "SS 316 A4-80",
  "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP"
];

export const NUTS_GENERAL_INCH_GRADES = [
  "GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER",
  "TEFLON", "NYLON", "GRP"
];

// Helper to construct categories listed
export const STANDARD_CATEGORIES_LIST = [
  "STRUCTURAL BOLTS",
  "ALL THREADS & STUDS",
  "STUD BOLTS",
  "NUT",
  "WASHERS",
  "ANCHORS",
  "Adhesives",
  "SOCKET SCREWS",
  "MACHINE SCREWS",
  "SELF TAPPING SCREWS",
  "SDS SCREWS",
  "SECURITY FASTENERS",
  "Lifting accessories",
  "Pipe supports systems",
  "Anchor bolts",
  "U bolts",
  "Rivets",
  "Pins",
  "Cable trays",
  "Round bars",
  "Hardware",
  "Teflon",
  "Nylon",
  "GRP",
  "Fittings & Clamps",
  "Fabrication Items",
  "Flat bars",
  "Hilti",
  "Fischer",
  "Gasket",
  "Marble fixing Accessories",
  "CNC Component"
];

function makeAdhesiveRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  if (subcat === "CHEMICAL") {
    rows.push({
      id: generateId(),
      partNo: "MF-ADH-CHM-150",
      description: "Sormat Chemical Injection Resin Coaxial",
      dia: "150 ml",
      pitch: "",
      length: "",
      openingStock: 250,
      inStock: 100,
      outGoingStock: 50,
      balanceStock: 300,
      tallyStock: 300,
      unitWeight: 0.28,
      totalWeight: 84.00,
      finish: "Styrene Free",
      rackLocation: "W04-A-R01",
      marking: "Sormat",
      unit: "Cartridges",
      productionDate: "2026-01-15",
      expiryDate: "2027-01-15"
    }, {
      id: generateId(),
      partNo: "MF-ADH-CHM-300",
      description: "Rawlplug Kem-Poly Styrene Free Resin",
      dia: "300 ml",
      pitch: "",
      length: "",
      openingStock: 480,
      inStock: 200,
      outGoingStock: 120,
      balanceStock: 560,
      tallyStock: 560,
      unitWeight: 0.52,
      totalWeight: 291.20,
      finish: "Low Odor",
      rackLocation: "W04-A-R02",
      marking: "Rawlplug",
      unit: "Cartridges",
      productionDate: "2026-02-10",
      expiryDate: "2027-02-10"
    }, {
      id: generateId(),
      partNo: "MF-ADH-CHM-380",
      description: "Fischer FIS-V 360 Chemical Resin",
      dia: "360 ml",
      pitch: "",
      length: "",
      openingStock: 600,
      inStock: 300,
      outGoingStock: 150,
      balanceStock: 750,
      tallyStock: 750,
      unitWeight: 0.61,
      totalWeight: 457.50,
      finish: "Standard",
      rackLocation: "W04-A-R03",
      marking: "Fischer",
      unit: "Cartridges",
      productionDate: "2026-03-01",
      expiryDate: "2027-03-01"
    });
  } else if (subcat === "EPOXY") {
    rows.push({
      id: generateId(),
      partNo: "MF-ADH-EPX-500",
      description: "Hilti RE 500 V3 Pure Epoxy Resin",
      dia: "500 ml",
      pitch: "",
      length: "",
      openingStock: 180,
      inStock: 120,
      outGoingStock: 40,
      balanceStock: 260,
      tallyStock: 260,
      unitWeight: 0.88,
      totalWeight: 228.80,
      finish: "High Strength (1:1)",
      rackLocation: "W04-B-R01",
      marking: "Hilti",
      unit: "Cartridges",
      productionDate: "2025-11-20",
      expiryDate: "2027-05-20"
    }, {
      id: generateId(),
      partNo: "MF-ADH-EPX-585",
      description: "Sormat Ipex-PRO Extreme Epoxy",
      dia: "585 ml",
      pitch: "",
      length: "",
      openingStock: 300,
      inStock: 150,
      outGoingStock: 80,
      balanceStock: 370,
      tallyStock: 370,
      unitWeight: 0.99,
      totalWeight: 366.30,
      finish: "Tropical Grade (3:1)",
      rackLocation: "W04-B-R02",
      marking: "Sormat",
      unit: "Cartridges",
      productionDate: "2025-12-05",
      expiryDate: "2027-06-05"
    });
  } else if (subcat === "VINYLESTER") {
    rows.push({
      id: generateId(),
      partNo: "MF-ADH-VIN-280",
      description: "Sormat Vinylester Resin High Heat",
      dia: "280 ml",
      pitch: "",
      length: "",
      openingStock: 140,
      inStock: 80,
      outGoingStock: 30,
      balanceStock: 190,
      tallyStock: 190,
      unitWeight: 0.45,
      totalWeight: 85.50,
      finish: "Rapid Cure",
      rackLocation: "W04-C-R01",
      marking: "Sormat",
      unit: "Cartridges",
      productionDate: "2026-02-01",
      expiryDate: "2027-02-01"
    }, {
      id: generateId(),
      partNo: "MF-ADH-VIN-410",
      description: "Rawlplug R-KER-II Styrene-Free Vinylester",
      dia: "410 ml",
      pitch: "",
      length: "",
      openingStock: 420,
      inStock: 250,
      outGoingStock: 100,
      balanceStock: 570,
      tallyStock: 570,
      unitWeight: 0.68,
      totalWeight: 387.60,
      finish: "Water Leak Safe",
      rackLocation: "W04-C-R02",
      marking: "Rawlplug",
      unit: "Cartridges",
      productionDate: "2026-01-28",
      expiryDate: "2027-07-28"
    });
  } else if (subcat === "DISPNESER") {
    rows.push({
      id: generateId(),
      partNo: "MF-ADH-DSP-380",
      description: "Heavy Duty Hand Gun for 380ml Coaxial",
      dia: "380ml-410ml",
      pitch: "",
      length: "",
      openingStock: 50,
      inStock: 20,
      outGoingStock: 10,
      balanceStock: 60,
      tallyStock: 60,
      unitWeight: 1.15,
      totalWeight: 69.00,
      finish: "Steel Trigger",
      rackLocation: "W04-D-R01",
      marking: "Universal",
      unit: "Pcs",
      productionDate: "2025-05-10",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-ADH-DSP-EPX",
      description: "Professional Pure Epoxy Dispenser 585ml",
      dia: "585 ml (3:1)",
      pitch: "",
      length: "",
      openingStock: 35,
      inStock: 15,
      outGoingStock: 5,
      balanceStock: 45,
      tallyStock: 45,
      unitWeight: 1.45,
      totalWeight: 65.25,
      finish: "Dual Cylinder",
      rackLocation: "W04-D-R02",
      marking: "Hilti",
      unit: "Pcs",
      productionDate: "2025-08-15",
      expiryDate: "N/A"
    });
  }
  return rows;
}

export function makeTeflonRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  const normalized = subcat.toUpperCase().replace(/\s+/g, " ");
  
  if (normalized.includes("BAR")) {
    rows.push({
      id: generateId(),
      partNo: "MF-TFL-BAR-020",
      description: "Virgin Extruded PTFE Round Bar (Teflon Rod)",
      dia: "Dia 20 mm",
      pitch: "PTFE Rod",
      length: "1000 mm",
      openingStock: 120,
      inStock: 50,
      outGoingStock: 20,
      balanceStock: 150,
      tallyStock: 150,
      unitWeight: 0.69,
      totalWeight: 103.50,
      finish: "Natural White Virgin",
      rackLocation: "W09-A-R01",
      marking: "DuPont Teflon",
      unit: "Pcs",
      productionDate: "2026-01-10",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-BAR-050",
      description: "Virgin Extruded PTFE Round Bar (Teflon Rod)",
      dia: "Dia 50 mm",
      pitch: "PTFE Rod",
      length: "1000 mm",
      openingStock: 80,
      inStock: 30,
      outGoingStock: 15,
      balanceStock: 95,
      tallyStock: 95,
      unitWeight: 4.32,
      totalWeight: 410.40,
      finish: "Natural White Virgin",
      rackLocation: "W09-A-R01",
      marking: "DuPont Teflon",
      unit: "Pcs",
      productionDate: "2026-02-14",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-BAR-100",
      description: "Virgin Molded PTFE Round Bar (Teflon Rod)",
      dia: "Dia 100 mm",
      pitch: "PTFE Rod",
      length: "1000 mm",
      openingStock: 40,
      inStock: 15,
      outGoingStock: 5,
      balanceStock: 50,
      tallyStock: 50,
      unitWeight: 17.28,
      totalWeight: 864.00,
      finish: "Natural White Virgin",
      rackLocation: "W09-A-R02",
      marking: "DuPont Teflon",
      unit: "Pcs",
      productionDate: "2026-03-05",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("PLATE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-TFL-PLT-005",
      description: "High-Density Virgin PTFE Plate Sheet",
      dia: "5 mm Thick",
      pitch: "PTFE Sheet",
      length: "1200x1200mm",
      openingStock: 65,
      inStock: 25,
      outGoingStock: 10,
      balanceStock: 80,
      tallyStock: 80,
      unitWeight: 15.55,
      totalWeight: 1244.00,
      finish: "Skived Natural White",
      rackLocation: "W09-B-R01",
      marking: "Premium PTFE",
      unit: "Sheets",
      productionDate: "2026-01-20",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-PLT-010",
      description: "High-Density Virgin PTFE Plate Sheet",
      dia: "10 mm Thick",
      pitch: "PTFE Sheet",
      length: "1200x1200mm",
      openingStock: 45,
      inStock: 20,
      outGoingStock: 8,
      balanceStock: 57,
      tallyStock: 57,
      unitWeight: 31.10,
      totalWeight: 1772.70,
      finish: "Skived Natural White",
      rackLocation: "W09-B-R01",
      marking: "Premium PTFE",
      unit: "Sheets",
      productionDate: "2026-02-18",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-PLT-020",
      description: "Molded Heavy-Duty PTFE Plate Sheet",
      dia: "20 mm Thick",
      pitch: "PTFE Sheet",
      length: "1200x1200mm",
      openingStock: 25,
      inStock: 10,
      outGoingStock: 3,
      balanceStock: 32,
      tallyStock: 32,
      unitWeight: 62.20,
      totalWeight: 1990.40,
      finish: "Molded Semi-finished",
      rackLocation: "W09-B-R02",
      marking: "Premium PTFE",
      unit: "Sheets",
      productionDate: "2026-03-11",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("WASHER")) {
    rows.push({
      id: generateId(),
      partNo: "MF-TFL-WSH-M10",
      description: "Teflon Flat Spacer Washer DIN 125",
      dia: "M10 Spacer",
      pitch: "PTFE Washer",
      length: "L: 2.0 mm",
      openingStock: 2500,
      inStock: 1000,
      outGoingStock: 300,
      balanceStock: 3200,
      tallyStock: 3200,
      unitWeight: 0.002,
      totalWeight: 6.40,
      finish: "Molded Natural White",
      rackLocation: "W09-C-R01",
      marking: "Standard PTFE",
      unit: "Pcs",
      productionDate: "2026-02-05",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-WSH-M12",
      description: "Teflon Flat Spacer Washer DIN 125",
      dia: "M12 Spacer",
      pitch: "PTFE Washer",
      length: "L: 2.5 mm",
      openingStock: 1800,
      inStock: 800,
      outGoingStock: 200,
      balanceStock: 2400,
      tallyStock: 2400,
      unitWeight: 0.0035,
      totalWeight: 8.40,
      finish: "Molded Natural White",
      rackLocation: "W09-C-R01",
      marking: "Standard PTFE",
      unit: "Pcs",
      productionDate: "2026-02-25",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-WSH-M16",
      description: "Teflon Flat Spacer Washer DIN 125",
      dia: "M16 Spacer",
      pitch: "PTFE Washer",
      length: "L: 3.0 mm",
      openingStock: 1200,
      inStock: 500,
      outGoingStock: 150,
      balanceStock: 1550,
      tallyStock: 1550,
      unitWeight: 0.006,
      totalWeight: 9.30,
      finish: "Molded Natural White",
      rackLocation: "W09-C-R02",
      marking: "Standard PTFE",
      unit: "Pcs",
      productionDate: "2026-03-02",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("SLEEVE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-TFL-SLV-016",
      description: "Extruded Teflon Insulation Tube Sleeve Bushing",
      dia: "OD16 / ID10",
      pitch: "PTFE Sleeve",
      length: "100 mm",
      openingStock: 300,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 400,
      tallyStock: 400,
      unitWeight: 0.045,
      totalWeight: 18.00,
      finish: "Natural Low-friction",
      rackLocation: "W09-D-R01",
      marking: "UniPTFE Tubes",
      unit: "Pcs",
      productionDate: "2026-01-20",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-SLV-025",
      description: "Extruded Teflon Insulation Tube Sleeve Bushing",
      dia: "OD25 / ID16",
      pitch: "PTFE Sleeve",
      length: "200 mm",
      openingStock: 150,
      inStock: 80,
      outGoingStock: 30,
      balanceStock: 200,
      tallyStock: 200,
      unitWeight: 0.165,
      totalWeight: 33.00,
      finish: "Natural Low-friction",
      rackLocation: "W09-D-R01",
      marking: "UniPTFE Tubes",
      unit: "Pcs",
      productionDate: "2026-02-10",
      expiryDate: "N/A"
    });
  } else {
    // Custom/CUSTYOM Teflon
    rows.push({
      id: generateId(),
      partNo: "MF-TFL-CST-BLK",
      description: "Custom Engraved Machined Virgin/Glass-Filled PTFE Component",
      dia: "As per Dwg",
      pitch: "PTFE Custom",
      length: "Assorted",
      openingStock: 35,
      inStock: 20,
      outGoingStock: 5,
      balanceStock: 50,
      tallyStock: 50,
      unitWeight: 1.28,
      totalWeight: 64.00,
      finish: "CNC High-Precision Machined",
      rackLocation: "W09-E-R01",
      marking: "Client Spec DXF",
      unit: "Pcs",
      productionDate: "2026-03-12",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-TFL-CST-SLD",
      description: "PTFE Sliding Backing Pad 25% Carbon Filled",
      dia: "150x150x8mm",
      pitch: "PTFE Pad",
      length: "Special",
      openingStock: 180,
      inStock: 90,
      outGoingStock: 20,
      balanceStock: 250,
      tallyStock: 250,
      unitWeight: 0.42,
      totalWeight: 105.00,
      finish: "Carbon-PTFE composite",
      rackLocation: "W09-E-R02",
      marking: "Black Pad",
      unit: "Pcs",
      productionDate: "2026-04-01",
      expiryDate: "N/A"
    });
  }
  return rows;
}

export function makeNylonRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  const normalized = subcat.toUpperCase().replace(/\s+/g, " ");
  
  if (normalized.includes("BAR")) {
    rows.push({
      id: generateId(),
      partNo: "MF-NYL-BAR-020",
      description: "Extruded Polyamide PA6 Round Bar (Nylon Rod)",
      dia: "Dia 20 mm",
      pitch: "PA6 Rod",
      length: "1000 mm",
      openingStock: 180,
      inStock: 80,
      outGoingStock: 30,
      balanceStock: 230,
      tallyStock: 230,
      unitWeight: 0.38,
      totalWeight: 87.40,
      finish: "Natural White PA6",
      rackLocation: "W10-A-R01",
      marking: "Polyamide PA6",
      unit: "Pcs",
      productionDate: "2026-02-10",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-BAR-050",
      description: "Extruded Polyamide PA6 Round Bar (Nylon Rod)",
      dia: "Dia 50 mm",
      pitch: "PA6 Rod",
      length: "1000 mm",
      openingStock: 110,
      inStock: 40,
      outGoingStock: 20,
      balanceStock: 130,
      tallyStock: 130,
      unitWeight: 2.36,
      totalWeight: 306.80,
      finish: "Natural White PA6",
      rackLocation: "W10-A-R01",
      marking: "Polyamide PA6",
      unit: "Pcs",
      productionDate: "2026-03-12",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-BAR-100",
      description: "Molded Polyamide PA6 Round Bar (Nylon Rod)",
      dia: "Dia 100 mm",
      pitch: "PA6 Rod",
      length: "1000 mm",
      openingStock: 50,
      inStock: 20,
      outGoingStock: 10,
      balanceStock: 60,
      tallyStock: 60,
      unitWeight: 9.42,
      totalWeight: 565.20,
      finish: "Natural White PA6",
      rackLocation: "W10-A-R02",
      marking: "Polyamide PA6",
      unit: "Pcs",
      productionDate: "2026-03-28",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("PLATE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-NYL-PLT-005",
      description: "High-Density Polyamide Nylon Sheet",
      dia: "5 mm Thick",
      pitch: "Nylon Sheet",
      length: "1000x2000mm",
      openingStock: 90,
      inStock: 40,
      outGoingStock: 15,
      balanceStock: 115,
      tallyStock: 115,
      unitWeight: 11.50,
      totalWeight: 1322.50,
      finish: "Extruded Natural",
      rackLocation: "W10-B-R01",
      marking: "Premium Nylon",
      unit: "Sheets",
      productionDate: "2026-02-01",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-PLT-010",
      description: "High-Density Polyamide Nylon Sheet",
      dia: "10 mm Thick",
      pitch: "Nylon Sheet",
      length: "1000x2000mm",
      openingStock: 60,
      inStock: 30,
      outGoingStock: 12,
      balanceStock: 78,
      tallyStock: 78,
      unitWeight: 23.00,
      totalWeight: 1794.00,
      finish: "Extruded Natural",
      rackLocation: "W10-B-R01",
      marking: "Premium Nylon",
      unit: "Sheets",
      productionDate: "2026-02-20",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-PLT-020",
      description: "Cast Heavy-Duty Polyamide Nylon Sheet",
      dia: "20 mm Thick",
      pitch: "Nylon Sheet",
      length: "1000x2000mm",
      openingStock: 30,
      inStock: 15,
      outGoingStock: 5,
      balanceStock: 40,
      tallyStock: 40,
      unitWeight: 46.00,
      totalWeight: 1840.00,
      finish: "Cast Natural Semi-finished",
      rackLocation: "W10-B-R02",
      marking: "Premium Nylon",
      unit: "Sheets",
      productionDate: "2026-03-15",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("WASHER")) {
    rows.push({
      id: generateId(),
      partNo: "MF-NYL-WSH-M10",
      description: "Nylon Spacer Washer DIN 125",
      dia: "M10 Spacer",
      pitch: "Nylon Washer",
      length: "L: 2.0 mm",
      openingStock: 5000,
      inStock: 2000,
      outGoingStock: 500,
      balanceStock: 6500,
      tallyStock: 6500,
      unitWeight: 0.0012,
      totalWeight: 7.80,
      finish: "Molded Natural",
      rackLocation: "W10-C-R01",
      marking: "Standard Nylon",
      unit: "Pcs",
      productionDate: "2026-02-15",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-WSH-M12",
      description: "Nylon Spacer Washer DIN 125",
      dia: "M12 Spacer",
      pitch: "Nylon Washer",
      length: "L: 2.5 mm",
      openingStock: 4000,
      inStock: 1500,
      outGoingStock: 400,
      balanceStock: 5100,
      tallyStock: 5100,
      unitWeight: 0.0019,
      totalWeight: 9.69,
      finish: "Molded Natural",
      rackLocation: "W10-C-R01",
      marking: "Standard Nylon",
      unit: "Pcs",
      productionDate: "2026-03-01",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-WSH-M16",
      description: "Nylon Spacer Washer DIN 125",
      dia: "M16 Spacer",
      pitch: "Nylon Washer",
      length: "L: 3.0 mm",
      openingStock: 2500,
      inStock: 1000,
      outGoingStock: 300,
      balanceStock: 3200,
      tallyStock: 3200,
      unitWeight: 0.0031,
      totalWeight: 9.92,
      finish: "Molded Natural",
      rackLocation: "W10-C-R02",
      marking: "Standard Nylon",
      unit: "Pcs",
      productionDate: "2026-03-10",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("SLEEVE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-NYL-SLV-016",
      description: "Extruded Nylon Insulation Tube Sleeve Bushing",
      dia: "OD16 / ID10",
      pitch: "Nylon Sleeve",
      length: "100 mm",
      openingStock: 500,
      inStock: 200,
      outGoingStock: 80,
      balanceStock: 620,
      tallyStock: 620,
      unitWeight: 0.025,
      totalWeight: 15.50,
      finish: "Natural Low-wear",
      rackLocation: "W10-D-R01",
      marking: "Polyamide Tubes",
      unit: "Pcs",
      productionDate: "2026-02-12",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-SLV-025",
      description: "Extruded Nylon Insulation Tube Sleeve Bushing",
      dia: "OD25 / ID16",
      pitch: "Nylon Sleeve",
      length: "200 mm",
      openingStock: 300,
      inStock: 120,
      outGoingStock: 50,
      balanceStock: 370,
      tallyStock: 370,
      unitWeight: 0.092,
      totalWeight: 34.04,
      finish: "Natural Low-wear",
      rackLocation: "W10-D-R01",
      marking: "Polyamide Tubes",
      unit: "Pcs",
      productionDate: "2026-03-05",
      expiryDate: "N/A"
    });
  } else {
    // Custom nylon
    rows.push({
      id: generateId(),
      partNo: "MF-NYL-CST-BLK",
      description: "Custom Engraved Machined PA6/MoS2 Glass-Filled Nylon Component",
      dia: "As per Dwg",
      pitch: "Nylon Custom",
      length: "Assorted",
      openingStock: 60,
      inStock: 30,
      outGoingStock: 10,
      balanceStock: 80,
      tallyStock: 80,
      unitWeight: 0.85,
      totalWeight: 68.00,
      finish: "CNC High-Precision Machined Black",
      rackLocation: "W10-E-R01",
      marking: "PA6+MoS2 Black",
      unit: "Pcs",
      productionDate: "2026-03-20",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-NYL-CST-SLD",
      description: "Cast Nylon Sliding Wear Pad Carbon-Filled Blue",
      dia: "150x150x8mm",
      pitch: "Nylon Pad",
      length: "Special",
      openingStock: 200,
      inStock: 100,
      outGoingStock: 30,
      balanceStock: 270,
      tallyStock: 270,
      unitWeight: 0.22,
      totalWeight: 59.40,
      finish: "Nylon Blue lubricant-filled",
      rackLocation: "W10-E-R02",
      marking: "Blue Pad",
      unit: "Pcs",
      productionDate: "2026-04-05",
      expiryDate: "N/A"
    });
  }
  return rows;
}

export function makeGrpRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  const normalized = subcat.toUpperCase().replace(/\s+/g, " ");
  
  if (normalized.includes("BAR")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GRP-BAR-010",
      description: "Pultruded Glass-Reinforced Plastic Round Rod (GRP Bar)",
      dia: "Dia 10 mm",
      pitch: "Fiberglass",
      length: "1500 mm",
      openingStock: 300,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 400,
      tallyStock: 400,
      unitWeight: 0.15,
      totalWeight: 60.00,
      finish: "Smooth Pultruded Grey",
      rackLocation: "W11-A-R01",
      marking: "FRP Class E",
      unit: "Pcs",
      productionDate: "2026-03-01",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-BAR-025",
      description: "Pultruded Glass-Reinforced Plastic Round Rod (GRP Bar)",
      dia: "Dia 25 mm",
      pitch: "Fiberglass",
      length: "1500 mm",
      openingStock: 150,
      inStock: 60,
      outGoingStock: 25,
      balanceStock: 185,
      tallyStock: 185,
      unitWeight: 0.95,
      totalWeight: 175.75,
      finish: "Smooth Pultruded Grey",
      rackLocation: "W11-A-R01",
      marking: "FRP Class E",
      unit: "Pcs",
      productionDate: "2026-03-15",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-BAR-050",
      description: "Heavy-Duty Molded Fiberglass Structural Round Bar",
      dia: "Dia 50 mm",
      pitch: "Fiberglass",
      length: "1000 mm",
      openingStock: 80,
      inStock: 30,
      outGoingStock: 15,
      balanceStock: 95,
      tallyStock: 95,
      unitWeight: 3.80,
      totalWeight: 361.00,
      finish: "High-Strength Molded",
      rackLocation: "W11-A-R02",
      marking: "Heavy duty GRP",
      unit: "Pcs",
      productionDate: "2026-04-02",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("PLATE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GRP-PLT-003",
      description: "GRP Anti-Slip Composite Plate / Fiberglass Sheet",
      dia: "3 mm Thick",
      pitch: "GRP Sheet",
      length: "1220x2440mm",
      openingStock: 70,
      inStock: 30,
      outGoingStock: 10,
      balanceStock: 90,
      tallyStock: 90,
      unitWeight: 16.50,
      totalWeight: 1485.00,
      finish: "Grit Surface Anti-slip Grey",
      rackLocation: "W11-B-R01",
      marking: "FRP-Composite",
      unit: "Sheets",
      productionDate: "2026-02-18",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-PLT-006",
      description: "GRP Structural Composite Plate / Fiberglass Sheet",
      dia: "6 mm Thick",
      pitch: "GRP Sheet",
      length: "1220x2440mm",
      openingStock: 50,
      inStock: 25,
      outGoingStock: 8,
      balanceStock: 67,
      tallyStock: 67,
      unitWeight: 33.00,
      totalWeight: 2211.00,
      finish: "Smooth Satin Finish Yellow",
      rackLocation: "W11-B-R01",
      marking: "High Vis GRP",
      unit: "Sheets",
      productionDate: "2026-03-05",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-PLT-012",
      description: "Heavy-Duty GRP Structural Plate / Solid FRP Board",
      dia: "12 mm Thick",
      pitch: "GRP Board",
      length: "1000x2000mm",
      openingStock: 40,
      inStock: 15,
      outGoingStock: 5,
      balanceStock: 50,
      tallyStock: 50,
      unitWeight: 45.00,
      totalWeight: 2250.00,
      finish: "Dense Molded Structural Grey",
      rackLocation: "W11-B-R02",
      marking: "Structural FRP",
      unit: "Sheets",
      productionDate: "2026-03-25",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("WASHER")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GRP-WSH-M08",
      description: "Glass Epoxy G10 Isolating Washer DIN 125",
      dia: "M8 Spacer",
      pitch: "GRP Washer",
      length: "L: 1.5 mm",
      openingStock: 4000,
      inStock: 1500,
      outGoingStock: 300,
      balanceStock: 5200,
      tallyStock: 5200,
      unitWeight: 0.0009,
      totalWeight: 4.68,
      finish: "G10 Epoxy Greenish-Natural",
      rackLocation: "W11-C-R01",
      marking: "G10 Isolating",
      unit: "Pcs",
      productionDate: "2026-02-10",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-WSH-M12",
      description: "Glass Epoxy G10 Isolating Washer DIN 125",
      dia: "M12 Spacer",
      pitch: "GRP Washer",
      length: "L: 2.0 mm",
      openingStock: 3000,
      inStock: 1200,
      outGoingStock: 250,
      balanceStock: 3950,
      tallyStock: 3950,
      unitWeight: 0.0016,
      totalWeight: 6.32,
      finish: "G10 Epoxy Greenish-Natural",
      rackLocation: "W11-C-R01",
      marking: "G10 Isolating",
      unit: "Pcs",
      productionDate: "2026-03-01",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-WSH-M20",
      description: "Glass Epoxy G10 Isolating Washer DIN 125",
      dia: "M20 Spacer",
      pitch: "GRP Washer",
      length: "L: 3.0 mm",
      openingStock: 1500,
      inStock: 800,
      outGoingStock: 150,
      balanceStock: 2150,
      tallyStock: 2150,
      unitWeight: 0.0038,
      totalWeight: 8.17,
      finish: "G10 Epoxy Greenish-Natural",
      rackLocation: "W11-C-R02",
      marking: "G10 Isolating",
      unit: "Pcs",
      productionDate: "2026-03-12",
      expiryDate: "N/A"
    });
  } else if (normalized.includes("SLEEVE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GRP-SLV-014",
      description: "Glass-Fiber Reinforced G11 Insulating Sleeve Tubing",
      dia: "OD14 / ID8",
      pitch: "GRP Sleeve",
      length: "150 mm",
      openingStock: 600,
      inStock: 220,
      outGoingStock: 60,
      balanceStock: 760,
      tallyStock: 760,
      unitWeight: 0.038,
      totalWeight: 28.88,
      finish: "Yellow G11 Glass Epoxy",
      rackLocation: "W11-D-R01",
      marking: "GRP Tube",
      unit: "Pcs",
      productionDate: "2026-02-28",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-SLV-020",
      description: "Glass-Fiber Reinforced G11 Insulating Sleeve Tubing",
      dia: "OD20 / ID12",
      pitch: "GRP Sleeve",
      length: "200 mm",
      openingStock: 400,
      inStock: 180,
      outGoingStock: 40,
      balanceStock: 540,
      tallyStock: 540,
      unitWeight: 0.076,
      totalWeight: 41.04,
      finish: "Yellow G11 Glass Epoxy",
      rackLocation: "W11-D-R01",
      marking: "GRP Tube",
      unit: "Pcs",
      productionDate: "2026-03-20",
      expiryDate: "N/A"
    });
  } else {
    // Custom GRP
    rows.push({
      id: generateId(),
      partNo: "MF-GRP-CST-GRT",
      description: "GRP Molded Interlocking Floor Grating Panel Extra-Rigid",
      dia: "38x38 Mesh",
      pitch: "GRP Grating",
      length: "1000x1000mm",
      openingStock: 80,
      inStock: 40,
      outGoingStock: 10,
      balanceStock: 110,
      tallyStock: 110,
      unitWeight: 19.50,
      totalWeight: 2145.00,
      finish: "Concave Top Safety Grey",
      rackLocation: "W11-E-R01",
      marking: "FRP Flooring",
      unit: "Pcs",
      productionDate: "2026-03-15",
      expiryDate: "N/A"
    }, {
      id: generateId(),
      partNo: "MF-GRP-CST-SPC",
      description: "Custom Machined G10 Structural Spacer Block",
      dia: "As per Dwg",
      pitch: "GRP Custom",
      length: "Assorted",
      openingStock: 120,
      inStock: 50,
      outGoingStock: 20,
      balanceStock: 150,
      tallyStock: 150,
      unitWeight: 0.45,
      totalWeight: 67.50,
      finish: "Precision Milled G10 Composite",
      rackLocation: "W11-E-R02",
      marking: "G10 Custom",
      unit: "Pcs",
      productionDate: "2026-04-06",
      expiryDate: "N/A"
    });
  }
  return rows;
}

export function makeFischerRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  const sub = subcat.toUpperCase();
  if (sub === "SLOTTED CHANNEL") {
    rows.push({
      id: generateId(),
      partNo: "FSH-SLCHD-41",
      description: "Fischer Portashield Slotted Channel HDG",
      dia: "41x41x2.0mm",
      length: "3.0 M",
      openingStock: 450,
      inStock: 120,
      outGoingStock: 50,
      balanceStock: 520,
      tallyStock: 520,
      unitWeight: 2.15,
      totalWeight: 1118.00,
      finish: "Hot Dip Galvanized",
      rackLocation: "FIS-SC-B12",
      marking: "FISCHER",
      unit: "Meters",
      grade: "DIN 10162",
      ref1Photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=60",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-SLCMD-21",
      description: "Fischer Medium Slotted Channel GI",
      dia: "41x21x1.8mm",
      length: "3.0 M",
      openingStock: 300,
      inStock: 80,
      outGoingStock: 30,
      balanceStock: 350,
      tallyStock: 350,
      unitWeight: 1.45,
      totalWeight: 507.50,
      finish: "Pre-Galvanized",
      rackLocation: "FIS-SC-B13",
      marking: "FISCHER",
      unit: "Meters",
      grade: "DIN 10162",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "EXPANSION ANCHOR BOLTS") {
    rows.push({
      id: generateId(),
      partNo: "FSH-FAZ-II-M12",
      description: "Fischer FAZ II Wedge Anchor High Performance",
      dia: "M12",
      length: "110mm",
      openingStock: 1200,
      inStock: 300,
      outGoingStock: 150,
      balanceStock: 1350,
      tallyStock: 1350,
      unitWeight: 0.115,
      totalWeight: 155.25,
      finish: "Zinc Plated",
      rackLocation: "FIS-EXP-C01",
      marking: "FAZ II 12/10",
      unit: "PCS",
      grade: "Carbon Steel Grade A5",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-FAZ-II-M16",
      description: "Fischer FAZ II Wedge Anchor A4 Premium",
      dia: "M16",
      length: "145mm",
      openingStock: 800,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 900,
      tallyStock: 900,
      unitWeight: 0.245,
      totalWeight: 220.50,
      finish: "Stainless Steel A4",
      rackLocation: "FIS-EXP-C02",
      marking: "FAZ II 16/25 A4",
      unit: "PCS",
      grade: "Stainless Steel A4",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "CHEMICAL ANCHOR") {
    rows.push({
      id: generateId(),
      partNo: "FSH-FIS-V-360-S",
      description: "Fischer FIS V 360S Injection Chemical Mortar",
      dia: "360 ml",
      length: "Cartridge",
      openingStock: 600,
      inStock: 200,
      outGoingStock: 80,
      balanceStock: 720,
      tallyStock: 720,
      unitWeight: 0.620,
      totalWeight: 446.40,
      finish: "Cartridge Shell",
      rackLocation: "FIS-CHM-A10",
      marking: "FIS V 360",
      unit: "PCS",
      grade: "Vinyl Ester Hybrid",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-FIS-SB-390",
      description: "Fischer FIS SB 390 High-Bond Superbond Mortar",
      dia: "390 ml",
      length: "Cartridge",
      openingStock: 400,
      inStock: 100,
      outGoingStock: 40,
      balanceStock: 460,
      tallyStock: 460,
      unitWeight: 0.680,
      totalWeight: 312.80,
      finish: "Cartridge Shell",
      rackLocation: "FIS-CHM-A11",
      marking: "FIS SB 390",
      unit: "PCS",
      grade: "Silane Epoxy Hybrid",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "MEDIUM DUTY CHANNEL FITTINGS") {
    rows.push({
      id: generateId(),
      partNo: "FSH-MD-F-L90",
      description: "Fischer L-Connector Bracket 90 Degree",
      dia: "L90",
      length: "Bracket",
      openingStock: 500,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 600,
      tallyStock: 600,
      unitWeight: 0.180,
      totalWeight: 108.00,
      finish: "Electroplated Zinc",
      rackLocation: "FIS-FIT-D05",
      marking: "FISCHER MW",
      unit: "PCS",
      grade: "Steel Grade DD11",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-MD-F-U21",
      description: "Fischer U-Connector Saddle Bracket",
      dia: "U-Bracket",
      length: "Bracket",
      openingStock: 350,
      inStock: 100,
      outGoingStock: 30,
      balanceStock: 420,
      tallyStock: 420,
      unitWeight: 0.310,
      totalWeight: 130.20,
      finish: "Electroplated Zinc",
      rackLocation: "FIS-FIT-D06",
      marking: "FISCHER SF",
      unit: "PCS",
      grade: "Steel Grade DD11",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "ADHESIVES") {
    rows.push({
      id: generateId(),
      partNo: "FSH-ADH-MS-W",
      description: "Fischer MS Premium Multi-Adhesive White",
      dia: "290 ml",
      length: "Cartridge",
      openingStock: 800,
      inStock: 250,
      outGoingStock: 100,
      balanceStock: 950,
      tallyStock: 950,
      unitWeight: 0.440,
      totalWeight: 418.00,
      finish: "Cartridge Shell",
      rackLocation: "FIS-ADH-E01",
      marking: "FISCHER MS",
      unit: "PCS",
      grade: "MS Polymer",
      ref1Photo: "https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?w=300&auto=format&fit=crop&q=60",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-ADH-KD-G",
      description: "Fischer KD Adhesive & Joint Sealant Grey",
      dia: "310 ml",
      length: "Cartridge",
      openingStock: 600,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 700,
      tallyStock: 700,
      unitWeight: 0.480,
      totalWeight: 336.00,
      finish: "Cartridge Shell",
      rackLocation: "FIS-ADH-E02",
      marking: "FISCHER KD",
      unit: "PCS",
      grade: "Polyurethane",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "NAILS") {
    rows.push({
      id: generateId(),
      partNo: "FSH-FN-30-GI",
      description: "Fischer Premium Hardened Concrete Nails GI",
      dia: "3.0x30mm",
      length: "30mm",
      openingStock: 250,
      inStock: 100,
      outGoingStock: 40,
      balanceStock: 310,
      tallyStock: 310,
      unitWeight: 0.320,
      totalWeight: 99.20,
      finish: "Galvanized Zinc",
      rackLocation: "FIS-NLS-F20",
      marking: "F",
      unit: "Box/100",
      grade: "Hardened Steel C60",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-FN-40-GI",
      description: "Fischer Premium Hardened Concrete Nails GI",
      dia: "3.5x40mm",
      length: "40mm",
      openingStock: 200,
      inStock: 80,
      outGoingStock: 30,
      balanceStock: 250,
      tallyStock: 250,
      unitWeight: 0.450,
      totalWeight: 112.50,
      finish: "Galvanized Zinc",
      rackLocation: "FIS-NLS-F21",
      marking: "F",
      unit: "Box/100",
      grade: "Hardened Steel C60",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "UNIFIX") {
    rows.push({
      id: generateId(),
      partNo: "FSH-UNX-M6-GI",
      description: "Fischer Unifix Universal Nylon Anchor Bolt",
      dia: "M6x30",
      length: "30mm",
      openingStock: 5000,
      inStock: 1500,
      outGoingStock: 500,
      balanceStock: 6000,
      tallyStock: 6000,
      unitWeight: 0.003,
      totalWeight: 18.00,
      finish: "Grey Nylon",
      rackLocation: "FIS-UNX-G01",
      marking: "UX 6x30",
      unit: "PCS",
      grade: "Premium Polyamide PA6",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "FSH-UNX-M8-GI",
      description: "Fischer Unifix Universal Nylon Anchor Bolt",
      dia: "M8x40",
      length: "40mm",
      openingStock: 4000,
      inStock: 1000,
      outGoingStock: 400,
      balanceStock: 4600,
      tallyStock: 4600,
      unitWeight: 0.005,
      totalWeight: 23.00,
      finish: "Grey Nylon",
      rackLocation: "FIS-UNX-G02",
      marking: "UX 8x40",
      unit: "PCS",
      grade: "Premium Polyamide PA6",
      ref1Photo: "",
      ref2Photo: ""
    });
  }
  return rows;
}

export function makeHiltiRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  const sub = subcat.toUpperCase();
  if (sub === "SLOTTED CHANNEL") {
    rows.push({
      id: generateId(),
      partNo: "HLT-MQ-41-GI",
      description: "Hilti MQ-41 Channel Slotted Profile",
      dia: "41x41x2.5mm",
      length: "3.0 M",
      openingStock: 350,
      inStock: 150,
      outGoingStock: 80,
      balanceStock: 420,
      tallyStock: 420,
      unitWeight: 2.65,
      totalWeight: 1113.00,
      finish: "Pre-Galvanized",
      rackLocation: "RACK-HLT-SC1",
      marking: "HILTI",
      unit: "Meters",
      grade: "DIN 10162 / MQ-41",
      ref1Photo: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=200&auto=format&fit=crop&q=80",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-MQ-21-HDG",
      description: "Hilti MQ-21 Channel Profile HDG",
      dia: "41x21x2.0mm",
      length: "3.0 M",
      openingStock: 220,
      inStock: 100,
      outGoingStock: 50,
      balanceStock: 270,
      tallyStock: 270,
      unitWeight: 1.62,
      totalWeight: 437.40,
      finish: "Hot Dip Galvanized",
      rackLocation: "RACK-HLT-SC2",
      marking: "HILTI",
      unit: "Meters",
      grade: "EN ISO 1461",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "EXPANSION ANCHOR BOLTS") {
    rows.push({
      id: generateId(),
      partNo: "HLT-HST3-M12-115",
      description: "Hilti HST3 Premium Expansion Anchor",
      dia: "M12",
      length: "115mm",
      openingStock: 1500,
      inStock: 500,
      outGoingStock: 300,
      balanceStock: 1700,
      tallyStock: 1700,
      unitWeight: 0.12,
      totalWeight: 204.00,
      finish: "GI Zinc-Plated",
      rackLocation: "RACK-HLT-EXP1",
      marking: "HST3 M12x115/20",
      unit: "PCS",
      grade: "Premium Carbon Steel",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-KB3-M10-90",
      description: "Hilti KB-TZ2 Wedge Expansion Anchor",
      dia: "M10",
      length: "90mm",
      openingStock: 2000,
      inStock: 800,
      outGoingStock: 400,
      balanceStock: 2400,
      tallyStock: 2400,
      unitWeight: 0.075,
      totalWeight: 180.00,
      finish: "Galvanized",
      rackLocation: "RACK-HLT-EXP2",
      marking: "KB3 M10x90",
      unit: "PCS",
      grade: "Carbon Steel",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "CHEMICAL ANCHOR") {
    rows.push({
      id: generateId(),
      partNo: "HLT-HAS-U-M16-190",
      description: "Hilti HAS-U Standard Anchor Rod M16",
      dia: "M16",
      length: "190mm",
      openingStock: 800,
      inStock: 300,
      outGoingStock: 150,
      balanceStock: 950,
      tallyStock: 950,
      unitWeight: 0.35,
      totalWeight: 332.50,
      finish: "Zinc Plated (5 micron)",
      rackLocation: "RACK-HLT-CH1",
      marking: "HAS-U 5.8",
      unit: "PCS",
      grade: "Class 5.8 Steel",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-HAS-R-M12-110",
      description: "Hilti HAS-R Corrosion Resistant Rod M12",
      dia: "M12",
      length: "110mm",
      openingStock: 600,
      inStock: 200,
      outGoingStock: 100,
      balanceStock: 700,
      tallyStock: 700,
      unitWeight: 0.16,
      totalWeight: 112.00,
      finish: "A4 Stainless",
      rackLocation: "RACK-HLT-CH2",
      marking: "HAS-R A4",
      unit: "PCS",
      grade: "Stainless Steel A4 (SS316)",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "MEDIUM DUTY CHANNEL FITTINGS") {
    rows.push({
      id: generateId(),
      partNo: "HLT-MQ-W-WING",
      description: "Hilti MQ Wing Connector 3D Fitting",
      dia: "41x41mm",
      length: "-",
      openingStock: 450,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 550,
      tallyStock: 550,
      unitWeight: 0.32,
      totalWeight: 176.00,
      finish: "Electro-Galvanized",
      rackLocation: "RACK-HLT-FIT1",
      marking: "Hilti MQ-W",
      unit: "PCS",
      grade: "S235JR Steel",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-MQN-M10-NUT",
      description: "Hilti MQN Channel Push-button Nut M10",
      dia: "M10",
      length: "-",
      openingStock: 3000,
      inStock: 1000,
      outGoingStock: 600,
      balanceStock: 3400,
      tallyStock: 3400,
      unitWeight: 0.045,
      totalWeight: 153.00,
      finish: "Zinc Plated",
      rackLocation: "RACK-HLT-FIT2",
      marking: "Hilti MQN",
      unit: "PCS",
      grade: "Hilti Comfort",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "ADHESIVES") {
    rows.push({
      id: generateId(),
      partNo: "HLT-RE-500-V4",
      description: "Hilti HIT-RE 500 V4 Epoxy Injection Mortar",
      dia: "500 ml",
      length: "Cartridge",
      openingStock: 500,
      inStock: 200,
      outGoingStock: 150,
      balanceStock: 550,
      tallyStock: 550,
      unitWeight: 0.92,
      totalWeight: 506.00,
      finish: "Red Epoxy Resin",
      rackLocation: "RACK-HLT-BIO1",
      marking: "HILTI RE500V4",
      unit: "Cartridges",
      grade: "Pure Epoxy (Slow Cure)",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-HY-200-R-V3",
      description: "Hilti HIT-HY 200-R V3 Injection Mortar",
      dia: "500 ml",
      length: "Cartridge",
      openingStock: 400,
      inStock: 150,
      outGoingStock: 100,
      balanceStock: 450,
      tallyStock: 450,
      unitWeight: 0.85,
      totalWeight: 382.50,
      finish: "Grey Mortar",
      rackLocation: "RACK-HLT-BIO2",
      marking: "HILTI HY200R",
      unit: "Cartridges",
      grade: "Hybrid Adhesive (Fast Cure)",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "NAILS") {
    rows.push({
      id: generateId(),
      partNo: "HLT-X-U-22-P8",
      description: "Hilti X-U 22 P8 Collated Concrete Nails",
      dia: "4.0mm",
      length: "22mm",
      openingStock: 12000,
      inStock: 4000,
      outGoingStock: 3000,
      balanceStock: 13000,
      tallyStock: 13000,
      unitWeight: 0.0035,
      totalWeight: 45.50,
      finish: "Galvanized HCR",
      rackLocation: "RACK-HLT-NAIL1",
      marking: "X-U P8",
      unit: "PCS",
      grade: "High Hardness Carbon Steel",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-X-P-27-G3",
      description: "Hilti X-P 27 G3 Gas Driven Premium Nails",
      dia: "3.0mm",
      length: "27mm",
      openingStock: 9000,
      inStock: 3000,
      outGoingStock: 1500,
      balanceStock: 10500,
      tallyStock: 10500,
      unitWeight: 0.0028,
      totalWeight: 29.40,
      finish: "Electro-plated",
      rackLocation: "RACK-HLT-NAIL2",
      marking: "X-P G3",
      unit: "PCS",
      grade: "Premium Steel for Concrete/Steel",
      ref1Photo: "",
      ref2Photo: ""
    });
  } else if (sub === "UNIFIX") {
    rows.push({
      id: generateId(),
      partNo: "HLT-UNIFIX-8X40",
      description: "Hilti Universal Nylon Wall Plug Unifix",
      dia: "8mm",
      length: "40mm",
      openingStock: 25000,
      inStock: 10000,
      outGoingStock: 5000,
      balanceStock: 30000,
      tallyStock: 30000,
      unitWeight: 0.0018,
      totalWeight: 54.00,
      finish: "Nylon Grey",
      rackLocation: "RACK-HLT-UNI1",
      marking: "HILTI 8",
      unit: "PCS",
      grade: "Polyamides PA6",
      ref1Photo: "",
      ref2Photo: ""
    }, {
      id: generateId(),
      partNo: "HLT-UNIFIX-10X50",
      description: "Hilti Unifix Wall Plug Heavy Duty Nylon",
      dia: "10mm",
      length: "50mm",
      openingStock: 15000,
      inStock: 5000,
      outGoingStock: 2000,
      balanceStock: 18000,
      tallyStock: 18000,
      unitWeight: 0.0031,
      totalWeight: 55.80,
      finish: "Nylon Grey",
      rackLocation: "RACK-HLT-UNI2",
      marking: "HILTI 10",
      unit: "PCS",
      grade: "Polyamides PA6",
      ref1Photo: "",
      ref2Photo: ""
    });
  }
  return rows;
}

export function makeGasketRows(subcat: string): ProductRow[] {
  const rows: ProductRow[] = [];
  const sub = subcat.toUpperCase().trim();
  
  if (sub.includes("CNAF SOFT")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-CNAF-050",
      description: "Non-Asbestos CNAF Soft Cut Flange Gasket PN16 Standard",
      dia: "2.0 inch (DN50)",
      length: "1.5 mm Thickness",
      openingStock: 1500,
      inStock: 300,
      outGoingStock: 100,
      balanceStock: 1700,
      tallyStock: 1700,
      unitWeight: 0.045,
      totalWeight: 76.5,
      finish: "Klingersil C-4430 (Green)",
      rackLocation: "GSK-A1-01",
      marking: "KLINGER C-4430 DN50 PN16"
    }, {
      id: generateId(),
      partNo: "MF-GSK-CNAF-100",
      description: "Non-Asbestos CNAF Soft Cut Flange Gasket PN16 Standard",
      dia: "4.0 inch (DN100)",
      length: "3.0 mm Thickness",
      openingStock: 800,
      inStock: 200,
      outGoingStock: 50,
      balanceStock: 950,
      tallyStock: 950,
      unitWeight: 0.125,
      totalWeight: 118.75,
      finish: "Klingersil C-4430 (Green)",
      rackLocation: "GSK-A1-02",
      marking: "KLINGER C-4430 DN100 PN16"
    });
  } else if (sub.includes("PTFE ENVELOPE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-ENV-080",
      description: "PTFE Envelope Gasket with CNAF / Elastomeric Insert PN16",
      dia: "3.0 inch (DN80)",
      length: "2.0 mm Envelope",
      openingStock: 450,
      inStock: 120,
      outGoingStock: 30,
      balanceStock: 540,
      tallyStock: 540,
      unitWeight: 0.085,
      totalWeight: 45.9,
      finish: "Virgin PTFE Envelope with CNAF",
      rackLocation: "GSK-A2-01",
      marking: "MF-PTFE-ENV DN80 PN16"
    }, {
      id: generateId(),
      partNo: "MF-GSK-ENV-150",
      description: "PTFE Envelope Gasket with CNAF / Elastomeric Insert PN16",
      dia: "6.0 inch (DN150)",
      length: "3.0 mm Envelope",
      openingStock: 300,
      inStock: 80,
      outGoingStock: 15,
      balanceStock: 365,
      tallyStock: 365,
      unitWeight: 0.185,
      totalWeight: 67.525,
      finish: "Virgin PTFE Envelope with CNAF",
      rackLocation: "GSK-A2-02",
      marking: "MF-PTFE-ENV DN150 PN16"
    });
  } else if (sub.includes("SPIRAL WOUND")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-SWG-150-150",
      description: "Spiral Wound Flange Gasket ASME B16.20 Class 150 CG type",
      dia: "6.0 inch (NPS 6)",
      length: "4.5 mm (Winding)",
      openingStock: 600,
      inStock: 150,
      outGoingStock: 40,
      balanceStock: 710,
      tallyStock: 710,
      unitWeight: 0.380,
      totalWeight: 269.8,
      finish: "SS316L Inner Ring / Graphite / Carbon Steel Outer Ring",
      rackLocation: "GSK-B1-01",
      marking: "S.W.G. SS316L/FG CLASS150 6\" B16.20"
    }, {
      id: generateId(),
      partNo: "MF-GSK-SWG-300-050",
      description: "Spiral Wound Flange Gasket ASME B16.20 Class 300 CG type",
      dia: "2.0 inch (NPS 2)",
      length: "4.5 mm (Winding)",
      openingStock: 950,
      inStock: 200,
      outGoingStock: 80,
      balanceStock: 1070,
      tallyStock: 1070,
      unitWeight: 0.145,
      totalWeight: 155.15,
      finish: "SS316L Inner Ring / Graphite / Carbon Steel Outer Ring",
      rackLocation: "GSK-B1-02",
      marking: "S.W.G. SS316L/FG CLASS300 2\" B16.20"
    });
  } else if (sub.includes("METAL JACKETED")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-MJG-200",
      description: "Double Jacketed Metal Gasket for Heat Exchanger application",
      dia: "8.0 inch (DN200)",
      length: "3.2 mm Thickness",
      openingStock: 180,
      inStock: 50,
      outGoingStock: 20,
      balanceStock: 210,
      tallyStock: 210,
      unitWeight: 0.310,
      totalWeight: 65.1,
      finish: "Soft Iron Shell with Flexible Graphite Filler",
      rackLocation: "GSK-B2-01",
      marking: "MF-MJG-SI-FG DN200 3.2MM"
    }, {
      id: generateId(),
      partNo: "MF-GSK-MJG-300",
      description: "Double Jacketed Metal Gasket for Heat Exchanger application",
      dia: "12.0 inch (DN300)",
      length: "3.2 mm Thickness",
      openingStock: 120,
      inStock: 30,
      outGoingStock: 10,
      balanceStock: 140,
      tallyStock: 140,
      unitWeight: 0.520,
      totalWeight: 72.8,
      finish: "SS316L Shell with Flexible Graphite Filler",
      rackLocation: "GSK-B2-02",
      marking: "MF-MJG-SS316L-FG DN300"
    });
  } else if (sub.includes("CAMPROFILE") || sub.includes("KAMPROFILE")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-KMP-100",
      description: "Kammprofile Grooved Flange Gasket ASME B16.20 Integral Loose Outer Ring",
      dia: "4.0 inch (NPS 4)",
      length: "4.0 mm Core / 0.5 mm layer",
      openingStock: 220,
      inStock: 60,
      outGoingStock: 15,
      balanceStock: 265,
      tallyStock: 265,
      unitWeight: 0.440,
      totalWeight: 116.6,
      finish: "SS316L Grooved Metal Core / Flexible Graphite Facing",
      rackLocation: "GSK-C1-01",
      marking: "KAMMPROFILE SS316L/FG NPS4 CLASS150"
    }, {
      id: generateId(),
      partNo: "MF-GSK-KMP-150",
      description: "Kammprofile Grooved Flange Gasket ASME B16.20 Integral Loose Outer Ring",
      dia: "6.0 inch (NPS 6)",
      length: "4.0 mm Core / 0.5 mm layer",
      openingStock: 180,
      inStock: 40,
      outGoingStock: 10,
      balanceStock: 210,
      tallyStock: 210,
      unitWeight: 0.680,
      totalWeight: 142.8,
      finish: "SS316L Grooved Metal Core / Flexible Graphite Facing",
      rackLocation: "GSK-C1-02",
      marking: "KAMMPROFILE SS316L/FG NPS6 CLASS150"
    });
  } else if (sub.includes("CORRUGATED")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-CMG-050",
      description: "Corrugated Metal Gasket with Flexible Graphite Coating on both sides",
      dia: "2.0 inch (DN50)",
      length: "2.0 mm Thick",
      openingStock: 350,
      inStock: 80,
      outGoingStock: 20,
      balanceStock: 410,
      tallyStock: 410,
      unitWeight: 0.095,
      totalWeight: 38.95,
      finish: "SS316 Corrugated Core / Graphite Layer Coated",
      rackLocation: "GSK-C2-01",
      marking: "MF-CMG-SS316-FG DN50"
    }, {
      id: generateId(),
      partNo: "MF-GSK-CMG-100",
      description: "Corrugated Metal Gasket with Flexible Graphite Coating on both sides",
      dia: "4.0 inch (DN100)",
      length: "2.0 mm Thick",
      openingStock: 280,
      inStock: 50,
      outGoingStock: 15,
      balanceStock: 315,
      tallyStock: 315,
      unitWeight: 0.175,
      totalWeight: 55.125,
      finish: "SS316 Corrugated Core / Graphite Layer Coated",
      rackLocation: "GSK-C2-02",
      marking: "MF-CMG-SS316-FG DN100"
    });
  } else if (sub.includes("RING JOINT")) {
    rows.push({
      id: generateId(),
      partNo: "MF-RTJ-R24-IRON",
      description: "RTJ Ring Joint Gasket Style R Octagonal Section ASME B16.20",
      dia: "R-24 (2\" NPS)",
      length: "14.2 mm Thickness",
      openingStock: 150,
      inStock: 30,
      outGoingStock: 10,
      balanceStock: 170,
      tallyStock: 170,
      unitWeight: 0.280,
      totalWeight: 47.6,
      finish: "Soft Iron (D-90 Max Brinell HB)",
      rackLocation: "GSK-D1-01",
      marking: "RTJ STYLE R-24 SOFT IRON"
    }, {
      id: generateId(),
      partNo: "MF-RTJ-R37-SS316",
      description: "RTJ Ring Joint Gasket Style R Octagonal Section ASME B16.20",
      dia: "R-37 (3\" NPS)",
      length: "15.9 mm Thickness",
      openingStock: 120,
      inStock: 40,
      outGoingStock: 5,
      balanceStock: 155,
      tallyStock: 155,
      unitWeight: 0.460,
      totalWeight: 71.3,
      finish: "SS316 High-Strength Austenitic Stainless Steel",
      rackLocation: "GSK-D1-02",
      marking: "RTJ STYLE R-37 SS316 API-6A"
    });
  } else if (sub.includes("ISOLATION KIT")) {
    rows.push({
      id: generateId(),
      partNo: "MF-FIK-F03-G10",
      description: "Flange Isolation Joint Gasket Kit Type F with G10 Sleeves & Washers",
      dia: "3.0 inch (NPS 3) Class 150",
      length: "3.2 mm Gasket",
      openingStock: 100,
      inStock: 25,
      outGoingStock: 8,
      balanceStock: 117,
      tallyStock: 117,
      unitWeight: 0.350,
      totalWeight: 40.95,
      finish: "G10 Carrier Gasket with G10 sleeves and backup Washers",
      rackLocation: "GSK-D2-01",
      marking: "MF-FIK TYPE F NPS3 CLASS150 G10"
    }, {
      id: generateId(),
      partNo: "MF-FIK-F06-G10",
      description: "Flange Isolation Joint Gasket Kit Type F with G10 Sleeves & Washers",
      dia: "6.0 inch (NPS 6) Class 150",
      length: "3.2 mm Gasket",
      openingStock: 80,
      inStock: 20,
      outGoingStock: 5,
      balanceStock: 95,
      tallyStock: 95,
      unitWeight: 0.650,
      totalWeight: 61.75,
      finish: "G10 Carrier Gasket with G10 sleeves and backup Washers",
      rackLocation: "GSK-D2-02",
      marking: "MF-FIK TYPE F NPS6 CLASS150 G10"
    });
  } else if (sub.includes("THERMAL INSULATION")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-CFR-001",
      description: "Ceramic Fiber High Temperature Insulation Thermal Barrier Gasket",
      dia: "Flat 1000x1000mm Sheet",
      length: "3.0 mm Thickness",
      openingStock: 250,
      inStock: 100,
      outGoingStock: 40,
      balanceStock: 310,
      tallyStock: 310,
      unitWeight: 0.850,
      totalWeight: 263.5,
      finish: "A-Grade Ceramic Bio-Soluble Insulating Sheet",
      rackLocation: "GSK-E1-01",
      marking: "CERAMIC INS-3"
    }, {
      id: generateId(),
      partNo: "MF-GSK-CFR-002",
      description: "Ceramic Fiber High Temperature Insulation Thermal Barrier Gasket",
      dia: "Flat 1000x1000mm Sheet",
      length: "5.0 mm Thickness",
      openingStock: 180,
      inStock: 50,
      outGoingStock: 15,
      balanceStock: 215,
      tallyStock: 215,
      unitWeight: 1.450,
      totalWeight: 311.75,
      finish: "A-Grade Ceramic Bio-Soluble Insulating Sheet",
      rackLocation: "GSK-E1-02",
      marking: "CERAMIC INS-5"
    });
  } else if (sub.includes("EXPANSION JOINT")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-EXP-100",
      description: "EPDM Rubber Expansion Joint Bellow Standard Flanged Ends",
      dia: "4.0 inch (DN100)",
      length: "150 mm Overall",
      openingStock: 60,
      inStock: 15,
      outGoingStock: 4,
      balanceStock: 71,
      tallyStock: 71,
      unitWeight: 6.200,
      totalWeight: 440.2,
      finish: "Double Sphere EPDM with Carbon Steel Swivel Flanges",
      rackLocation: "GSK-E2-01",
      marking: "EXP-JOINT DN100 EPDM/CS PN16"
    }, {
      id: generateId(),
      partNo: "MF-GSK-EXP-155",
      description: "EPDM Rubber Expansion Joint Bellow Standard Flanged Ends",
      dia: "6.0 inch (DN150)",
      length: "180 mm Overall",
      openingStock: 40,
      inStock: 10,
      outGoingStock: 2,
      balanceStock: 48,
      tallyStock: 48,
      unitWeight: 9.800,
      totalWeight: 470.4,
      finish: "Double Sphere EPDM with Carbon Steel Swivel Flanges",
      rackLocation: "GSK-E2-02",
      marking: "EXP-JOINT DN150 EPDM/CS PN16"
    });
  } else if (sub.includes("RUBBER WITH METAL")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-RMR-080",
      description: "EPDM Flange Gasket with Vulcanized Steel Insert core type G-S-S",
      dia: "3.0 inch (DN80 PN16)",
      length: "4.0 mm Thickness",
      openingStock: 400,
      inStock: 100,
      outGoingStock: 30,
      balanceStock: 470,
      tallyStock: 470,
      unitWeight: 0.160,
      totalWeight: 75.2,
      finish: "EPDM Rubber over Carbon Steel Core Reinforcement",
      rackLocation: "GSK-F1-01",
      marking: "EPDM/STEEL DN80 PN16"
    }, {
      id: generateId(),
      partNo: "MF-GSK-RMR-150",
      description: "EPDM Flange Gasket with Vulcanized Steel Insert core type G-S-S",
      dia: "6.0 inch (DN150 PN16)",
      length: "5.0 mm Thickness",
      openingStock: 250,
      inStock: 80,
      outGoingStock: 20,
      balanceStock: 310,
      tallyStock: 310,
      unitWeight: 0.340,
      totalWeight: 105.4,
      finish: "EPDM Rubber over Carbon Steel Core Reinforcement",
      rackLocation: "GSK-F1-02",
      marking: "EPDM/STEEL DN150 PN16"
    });
  } else if (sub.includes("O-RINGS") || sub.includes("O-RING") || sub.includes("OILSEAL")) {
    rows.push({
      id: generateId(),
      partNo: "MF-OR-NBR-045",
      description: "Nitrile NBR Rubber O-Ring 70 Durometer Shore A general wear sealing",
      dia: "44.5 mm ID x 5.33 mm CS",
      length: "O-Ring Spec",
      openingStock: 5000,
      inStock: 1500,
      outGoingStock: 500,
      balanceStock: 6000,
      tallyStock: 6000,
      unitWeight: 0.002,
      totalWeight: 12.00,
      finish: "Standard Black NBR Nitrile",
      rackLocation: "GSK-F2-01",
      marking: "NBR70 45-5.33"
    }, {
      id: generateId(),
      partNo: "MF-OR-VIT-060",
      description: "Viton FKM High Temperature Chemical Resistant O-Ring 80 Shore",
      dia: "59.2 mm ID x 5.7 mm CS",
      length: "O-Ring Spec",
      openingStock: 2000,
      inStock: 800,
      outGoingStock: 300,
      balanceStock: 2500,
      tallyStock: 2500,
      unitWeight: 0.005,
      totalWeight: 12.5,
      finish: "Standard Brown Viton FKM",
      rackLocation: "GSK-F2-02",
      marking: "FKM80 60-5.7"
    });
  } else if (sub.includes("EYELETED")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-EYE-100",
      description: "CNAF Soft Cut Flange Gasket with SS316 Inner Eyelet reinforcement",
      dia: "4.0 inch (DN100)",
      length: "2.5 mm Overall",
      openingStock: 200,
      inStock: 50,
      outGoingStock: 10,
      balanceStock: 240,
      tallyStock: 240,
      unitWeight: 0.180,
      totalWeight: 43.2,
      finish: "Non-Asbestos Fiber with SS316 Inner Eyelet Edge protector",
      rackLocation: "GSK-G1-01",
      marking: "EYELETED C-4430/316 DN100"
    }, {
      id: generateId(),
      partNo: "MF-GSK-EYE-150",
      description: "CNAF Soft Cut Flange Gasket with SS316 Inner Eyelet reinforcement",
      dia: "6.0 inch (DN150)",
      length: "2.5 mm Overall",
      openingStock: 150,
      inStock: 40,
      outGoingStock: 5,
      balanceStock: 185,
      tallyStock: 185,
      unitWeight: 0.290,
      totalWeight: 53.65,
      finish: "Non-Asbestos Fiber with SS316 Inner Eyelet Edge protector",
      rackLocation: "GSK-G1-02",
      marking: "EYELETED C-4430/316 DN150"
    });
  } else if (sub.includes("NBR RUBBER GASKET SHEET")) {
    rows.push({
      id: generateId(),
      partNo: "MF-SHT-NBR-3MM",
      description: "Commercial Grade Nitrile NBR Rubber Sheet Roll Oil Resistant",
      dia: "Roll size 1.2m x 10m",
      length: "3.0 mm Thickness",
      openingStock: 50,
      inStock: 15,
      outGoingStock: 5,
      balanceStock: 60,
      tallyStock: 60,
      unitWeight: 48.500,
      totalWeight: 2910.0,
      finish: "Nitrile NBR Compound Matte Roll",
      rackLocation: "GSK-SHT-A1",
      marking: "NBR ROLL 1.2X10M 3MM"
    }, {
      id: generateId(),
      partNo: "MF-SHT-NBR-5MM",
      description: "Commercial Grade Nitrile NBR Rubber Sheet Roll Oil Resistant",
      dia: "Roll size 1.2m x 10m",
      length: "5.0 mm Thickness",
      openingStock: 30,
      inStock: 10,
      outGoingStock: 2,
      balanceStock: 38,
      tallyStock: 38,
      unitWeight: 80.800,
      totalWeight: 3070.4,
      finish: "Nitrile NBR Compound Matte Roll",
      rackLocation: "GSK-SHT-A2",
      marking: "NBR ROLL 1.2X10M 5MM"
    });
  } else if (sub.includes("EPDM RUBBER GASKET SHEET")) {
    rows.push({
      id: generateId(),
      partNo: "MF-SHT-EPD-3MM",
      description: "High Grade Weathering EPDM Rubber Sheet Roll UV/Acid Resistant",
      dia: "Roll size 1.2m x 10m",
      length: "3.0 mm Thickness",
      openingStock: 60,
      inStock: 20,
      outGoingStock: 10,
      balanceStock: 70,
      tallyStock: 70,
      unitWeight: 46.200,
      totalWeight: 3234.0,
      finish: "Premium EPDM Compound Weather-proof",
      rackLocation: "GSK-SHT-B1",
      marking: "EPDM ROLL 1.2X10M 3MM"
    }, {
      id: generateId(),
      partNo: "MF-SHT-EPD-5MM",
      description: "High Grade Weathering EPDM Rubber Sheet Roll UV/Acid Resistant",
      dia: "Roll size 1.2m x 10m",
      length: "5.0 mm Thickness",
      openingStock: 40,
      inStock: 12,
      outGoingStock: 4,
      balanceStock: 48,
      tallyStock: 48,
      unitWeight: 77.000,
      totalWeight: 3696.0,
      finish: "Premium EPDM Compound Weather-proof",
      rackLocation: "GSK-SHT-B2",
      marking: "EPDM ROLL 1.2X10M 5MM"
    });
  } else if (sub.includes("NBR RUBBER GASKET")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-NBR-050",
      description: "Commercial Grade Nitrile NBR Flat Ring Flange Gasket PN16",
      dia: "2.0 inch (DN50 PN16)",
      length: "3.0 mm Thickness",
      openingStock: 1200,
      inStock: 400,
      outGoingStock: 150,
      balanceStock: 1450,
      tallyStock: 1450,
      unitWeight: 0.035,
      totalWeight: 50.75,
      finish: "NBR Compound Matte Black Finish",
      rackLocation: "GSK-H1-01",
      marking: "NBR DN50 PN16 GASKET"
    }, {
      id: generateId(),
      partNo: "MF-GSK-NBR-100",
      description: "Commercial Grade Nitrile NBR Flat Ring Flange Gasket PN16",
      dia: "4.0 inch (DN100 PN16)",
      length: "3.0 mm Thickness",
      openingStock: 800,
      inStock: 250,
      outGoingStock: 80,
      balanceStock: 970,
      tallyStock: 970,
      unitWeight: 0.090,
      totalWeight: 87.3,
      finish: "NBR Compound Matte Black Finish",
      rackLocation: "GSK-H1-02",
      marking: "NBR DN100 PN16 GASKET"
    });
  } else if (sub.includes("EPDM RUBBER GASKET")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-EPD-050",
      description: "Potable Water Approved EPDM Rubber Flange Gasket PN16 WRAS",
      dia: "2.0 inch (DN50 PN16)",
      length: "3.0 mm Thickness",
      openingStock: 1400,
      inStock: 300,
      outGoingStock: 200,
      balanceStock: 1500,
      tallyStock: 1500,
      unitWeight: 0.032,
      totalWeight: 48.0,
      finish: "Drinking Water Grade EPDM Premium Black",
      rackLocation: "GSK-H2-01",
      marking: "EPDM WRAS DN50 PN16"
    }, {
      id: generateId(),
      partNo: "MF-GSK-EPD-100",
      description: "Potable Water Approved EPDM Rubber Flange Gasket PN16 WRAS",
      dia: "4.0 inch (DN100 PN16)",
      length: "3.0 mm Thickness",
      openingStock: 900,
      inStock: 200,
      outGoingStock: 100,
      balanceStock: 1000,
      tallyStock: 1000,
      unitWeight: 0.082,
      totalWeight: 82.0,
      finish: "Drinking Water Grade EPDM Premium Black",
      rackLocation: "GSK-H2-02",
      marking: "EPDM WRAS DN100 PN16"
    });
  } else if (sub.includes("PTFE GASKET")) {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-PTF-050",
      description: "Pure Virgin PTFE Teflon Molded Flange Gasket Class 150 type FF",
      dia: "2.0 inch (NPS 2)",
      length: "3.0 mm Thickness",
      openingStock: 600,
      inStock: 150,
      outGoingStock: 50,
      balanceStock: 700,
      tallyStock: 700,
      unitWeight: 0.065,
      totalWeight: 45.5,
      finish: "Pure Virgin White Extruded PTFE Seal",
      rackLocation: "GSK-I1-01",
      marking: "PTFE CLASS150 NPS2"
    }, {
      id: generateId(),
      partNo: "MF-GSK-PTF-100",
      description: "Pure Virgin PTFE Teflon Molded Flange Gasket Class 150 type FF",
      dia: "4.0 inch (NPS 4)",
      length: "3.0 mm Thickness",
      openingStock: 400,
      inStock: 100,
      outGoingStock: 30,
      balanceStock: 470,
      tallyStock: 470,
      unitWeight: 0.140,
      totalWeight: 65.8,
      finish: "Pure Virgin White Extruded PTFE Seal",
      rackLocation: "GSK-I1-02",
      marking: "PTFE CLASS150 NPS4"
    });
  } else if (sub.includes("PTFE SHEET")) {
    rows.push({
      id: generateId(),
      partNo: "MF-SHT-PTF-3MM",
      description: "High Quality Virgin PTFE Teflon Flat Rigid Engineering Sheet",
      dia: "Sheet size 1000 x 1000 mm",
      length: "3.0 mm Thickness",
      openingStock: 110,
      inStock: 40,
      outGoingStock: 15,
      balanceStock: 135,
      tallyStock: 135,
      unitWeight: 6.600,
      totalWeight: 891.0,
      finish: "White Virgin Extruded PTFE Sheet Milled",
      rackLocation: "GSK-SHT-C1",
      marking: "PTFE SHT 1X1M 3MM"
    }, {
      id: generateId(),
      partNo: "MF-SHT-PTF-5MM",
      description: "High Quality Virgin PTFE Teflon Flat Rigid Engineering Sheet",
      dia: "Sheet size 1000 x 1000 mm",
      length: "5.0 mm Thickness",
      openingStock: 80,
      inStock: 25,
      outGoingStock: 5,
      balanceStock: 100,
      tallyStock: 100,
      unitWeight: 11.000,
      totalWeight: 1100.0,
      finish: "White Virgin Extruded PTFE Sheet Milled",
      rackLocation: "GSK-SHT-C2",
      marking: "PTFE SHT 1X1M 5MM"
    });
  } else {
    rows.push({
      id: generateId(),
      partNo: "MF-GSK-GEN-01",
      description: `${subcat} Standard Commercial Grade Gasket Sealing Element`,
      dia: "2.0 inch (DN50)",
      length: "2.0 mm",
      openingStock: 100,
      inStock: 20,
      outGoingStock: 10,
      balanceStock: 110,
      tallyStock: 110,
      unitWeight: 0.050,
      totalWeight: 5.5,
      finish: "Commercial Elastomer Blend Black",
      rackLocation: "GSK-GEN-A",
      marking: `MGD-GSK-${sub.substring(0, 3)}`
    });
  }

  return rows;
}

// Build full Standards Products Categories State
export function getInitialStandardsProducts(): Category[] {
  const rawCategories = STANDARD_CATEGORIES_LIST.map(catName => {
    let subcategories: Subcategory[] = [];
    
    if (catName === "STRUCTURAL BOLTS") {
      subcategories = STRUCTURAL_BOLTS_SUBCATEGORIES_DATA.map(sub => ({
        id: generateId(),
        name: sub.name,
        threadTypes: sub.threadTypes.map(tt => ({
          id: generateId(),
          name: tt.name,
          grades: tt.grades.map(g => ({
            id: generateId(),
            name: g.name,
            rows: g.rows.map(r => ({ ...r, id: generateId() })) // refresh IDs
          }))
        }))
      }));
    } else if (catName === "ALL THREADS & STUDS") {
      subcategories = [
        {
          id: generateId(),
          name: "THREADED BAR",
          threadTypes: [
            {
              id: generateId(),
              name: "THREADED BAR METRIC",
              grades: makeGrades(ALL_THREADS_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "THREADED BAR INCHES",
              grades: makeGrades(ALL_THREADS_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "ENGINEERING STUD",
          threadTypes: [
            {
              id: generateId(),
              name: "ENGG STUD METRIC",
              grades: makeGrades(ALL_THREADS_METRIC_GRADES)
            },
            {
              id: generateId(),
              name: "ENGG STUD INCHES",
              grades: makeGrades(ALL_THREADS_INCH_GRADES, false, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "COLLAR STUD BOLT",
          threadTypes: [
            {
              id: generateId(),
              name: "COLLAR STUD METRIC",
              grades: makeGrades(ALL_THREADS_METRIC_GRADES)
            },
            {
              id: generateId(),
              name: "COLLAR STUD INCHES",
              grades: makeGrades(ALL_THREADS_INCH_GRADES, false, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SHEAR STUDS",
          threadTypes: [
            {
              id: generateId(),
              name: "SHEAR STUD METRIC",
              grades: makeGrades(SHEAR_STUD_GRADES)
            }
          ]
        },
        {
          id: generateId(),
          name: "WELDING STUD",
          threadTypes: [
            {
              id: generateId(),
              name: "WELDING STUD METRIC",
              grades: makeGrades(WELDING_STUD_GRADES)
            },
            {
              id: generateId(),
              name: "WELDING STUD INCHES",
              grades: makeGrades(WELDING_STUD_GRADES, false, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "FULL THREAD PLUG",
          threadTypes: [
            {
              id: generateId(),
              name: "FULL THREAD PLUG METRIC",
              grades: makeGrades(FULL_THREAD_PLUG_GRADES)
            },
            {
              id: generateId(),
              name: "FULL THREAD PLUG INCHES",
              grades: makeGrades(FULL_THREAD_PLUG_GRADES, false, true)
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "stud bolts") {
      subcategories = [
        {
          id: generateId(),
          name: "STUD BOLTS",
          threadTypes: [
            {
              id: generateId(),
              name: "STUD BOLTS METRIC",
              grades: makeGrades(ALL_THREADS_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "STUD BOLTS INCHES",
              grades: makeGrades(ALL_THREADS_INCH_GRADES, true, true)
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "nuts" || catName.toLowerCase() === "nut") {
      subcategories = [
        {
          id: generateId(),
          name: "HEX NUT",
          threadTypes: [
            {
              id: generateId(),
              name: "HEX NUT METRIC",
              grades: makeGrades(NUTS_STANDARD_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "HEX NUT INCHES",
              grades: makeGrades(NUTS_STANDARD_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "HEAVY HEX NUT",
          threadTypes: [
            {
              id: generateId(),
              name: "HEAVY HEX NUT METRIC",
              grades: makeGrades(NUTS_HEAVY_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "HEAVY HEX NUT INCHES",
              grades: makeGrades(NUTS_HEAVY_INCHES_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "FLANGE NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "FLANGE NUTS METRIC",
              grades: makeGrades(NUTS_FLANGE_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "FLANGE NUTS INCHES",
              grades: makeGrades(NUTS_FLANGE_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SPRING NUT",
          threadTypes: [
            {
              id: generateId(),
              name: "SPRING NUT METRIC",
              grades: makeGrades(["ASTM A36", "SS 202", "SS 304", "SS 316", "BRASS"], true)
            }
          ]
        },
        {
          id: generateId(),
          name: "NYLOCK NUT",
          threadTypes: [
            {
              id: generateId(),
              name: "NYLOCK NUT METRIC",
              grades: makeGrades(NUTS_NYLOCK_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "NYLOCK NUT INCHES",
              grades: makeGrades(NUTS_NYLOCK_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "LONG NUT",
          threadTypes: [
            {
              id: generateId(),
              name: "LONG NUT METRIC",
              grades: makeGrades(["DIN 6334 CLASS 6", "DIN 6334 CLASS 8", "DIN 6334 CLASS 10", "DIN 6334 SS 304", "DIN 6334 SS 316", "DIN 6334 SS 316L", "BRASS", "COPPER"], true)
            },
            {
              id: generateId(),
              name: "LONG NUT INCHES",
              grades: makeGrades(["GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "THIN NUT",
          threadTypes: [
            {
              id: generateId(),
              name: "THIN NUT METRIC",
              grades: makeGrades(["DIN 936 CLASS 4", "DIN 936 CLASS 6", "DIN 936 CLASS 8", ...NUTS_HEAVY_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "THIN NUT INCHES",
              grades: makeGrades(["GRADE 5", "GRADE 8", ...NUTS_HEAVY_INCHES_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "WELD NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "WELD NUTS METRIC",
              grades: makeGrades(["DIN 929 CLASS 8", "DIN 929 CLASS 10", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"], true)
            },
            {
              id: generateId(),
              name: "WELD NUTS INCHES",
              grades: makeGrades(["GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "CASTLE NUTS DIN 937",
          threadTypes: [
            {
              id: generateId(),
              name: "CASTLE NUTS DIN 937 METRIC",
              grades: makeGrades(["DIN 937 CLASS 8", "DIN 937 CLASS 10", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"], true)
            },
            {
              id: generateId(),
              name: "CASTLE NUTS DIN 937 INCHES",
              grades: makeGrades(["GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "DOME NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "DOME NUTS METRIC",
              grades: makeGrades(["DIN 1587 CLASS 6", "DIN 1587 CLASS 8", "DIN 1587 CLASS 10", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "DOME NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "WING NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "WING NUTS METRIC",
              grades: makeGrades(["DIN 315 CLASS 6", "DIN 315 CLASS 8", "DIN 315 CLASS 10", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "WING NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SQUARE NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "SQUARE NUTS METRIC",
              grades: makeGrades(["DIN 557 CLASS 6", "DIN 557 CLASS 8", "DIN 557 CLASS 10", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "SQUARE NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "ANCO LOCK NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "ANCO LOCK NUTS METRIC",
              grades: makeGrades(NUTS_HEAVY_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "ANCO LOCK NUTS INCHES",
              grades: makeGrades(NUTS_HEAVY_INCHES_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "TOMMY NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "TOMMY NUTS METRIC",
              grades: makeGrades(NUTS_HEAVY_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "TOMMY NUTS INCHES",
              grades: makeGrades(NUTS_HEAVY_INCHES_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "LOCK NUTS DIN 980V",
          threadTypes: [
            {
              id: generateId(),
              name: "LOCK NUTS DIN 980V METRIC",
              grades: makeGrades(["DIN 980V CLASS 8", "DIN 980V CLASS 10", "DIN 980V CLASS 12", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "LOCK NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "T NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "T NUTS METRIC",
              grades: makeGrades(["CLASS 6", "CLASS 8", "SS 304", "SS 316", "SS 316L"], true)
            },
            {
              id: generateId(),
              name: "T NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "EYE NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "EYE NUTS METRIC",
              grades: makeGrades(["CARBON STEEL C15E", "GRADE 80", "SS 304", "SS 316", "SS 316L", "GRADE 8.8"], true)
            },
            {
              id: generateId(),
              name: "EYE NUTS INCHES",
              grades: makeGrades(["CARBON STEEL C15E", "GRADE 80", "SS 304", "SS 316", "SS 316L"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "CAGE NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "CAGE NUTS METRIC",
              grades: makeGrades(["CLASS 6", "CLASS 8", "SS 304", "SS 316", "SS 316L"], true)
            },
            {
              id: generateId(),
              name: "CAGE NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "HEX NUTS W/ COLLAR DIN 6331",
          threadTypes: [
            {
              id: generateId(),
              name: "HEX NUTS W/ COLLAR DIN 6331 METRIC",
              grades: makeGrades(["CLASS 6", "CLASS 8", "SS 304", "SS 316", "SS 316L"], true)
            },
            {
              id: generateId(),
              name: "HEX NUTS W/ COLLAR INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SELF LOCKING HEX NUTS DIN 6926",
          threadTypes: [
            {
              id: generateId(),
              name: "SELF LOCKING HEX NUTS DIN 6926 METRIC",
              grades: makeGrades(["DIN 6926 CLASS 8", "DIN 6926 CLASS 10", "DIN 6926 CLASS 12", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "SELF LOCKING HEX NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "HEX CAP NUTS DIN 917",
          threadTypes: [
            {
              id: generateId(),
              name: "HEX CAP NUTS DIN 917 METRIC",
              grades: makeGrades(["DIN 917 CLASS 8", "DIN 917 CLASS 10", "DIN 917 CLASS 12", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "HEX CAP NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "HEX CAP NUTS DIN 979",
          threadTypes: [
            {
              id: generateId(),
              name: "HEX CAP NUTS DIN 979 METRIC",
              grades: makeGrades(["DIN 979 CLASS 8", "DIN 979 CLASS 10", "DIN 979 CLASS 12", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "HEX CAP NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SLOTTED ROUND NUTS DIN 546",
          threadTypes: [
            {
              id: generateId(),
              name: "SLOTTED ROUND NUTS DIN 546 METRIC",
              grades: makeGrades(["DIN 546 CLASS 8", "DIN 546 CLASS 10", "DIN 546 CLASS 12", ...NUTS_FLANGE_METRIC_GRADES], true)
            },
            {
              id: generateId(),
              name: "SLOTTED ROUND NUTS INCHES",
              grades: makeGrades(["GRADE 3", "GRADE 5", "GRADE 8", ...NUTS_FLANGE_INCH_GRADES], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "NUTS INSERT PRESS",
          threadTypes: [
            {
              id: generateId(),
              name: "NUTS INSERT PRESS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "NUTS INSERT PRESS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "GROOVED NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "GROOVED NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "GROOVED NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "PINCH NUT / PAL NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "PUSH NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "PUSH NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SLAB T NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "SLAB T NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "SLAB T NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "ALL METAL LOCK NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "ALL METAL LOCK NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "ALL METAL LOCK NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "DOME NUT CAP",
          threadTypes: [
            {
              id: generateId(),
              name: "DOME NUT CAP METRIC",
              grades: makeGrades(["TYPE-1"], true)
            },
            {
              id: generateId(),
              name: "DOME NUT CAP INCHES",
              grades: makeGrades(["TYPE-1"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "BOLT END CAP",
          threadTypes: [
            {
              id: generateId(),
              name: "BOLT END CAP METRIC",
              grades: makeGrades(["TYPE-1"], true)
            },
            {
              id: generateId(),
              name: "BOLT END CAP INCHES",
              grades: makeGrades(["TYPE-1"], true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "RIVET NUTS WITHOUT COLLAR",
          threadTypes: [
            {
              id: generateId(),
              name: "RIVET NUTS WITHOUT COLLAR METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "RIVET NUTS WITHOUT COLLAR INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "RIVET NUTS WITH COLLAR",
          threadTypes: [
            {
              id: generateId(),
              name: "RIVET NUTS WITH COLLAR METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "RIVET NUTS WITH COLLAR INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SLOTTED NUTS WITH INSERT",
          threadTypes: [
            {
              id: generateId(),
              name: "SLOTTED NUTS WITH INSERT METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "SLOTTED NUTS WITH INSERT INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "X RAIL NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "X RAIL NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "X RAIL NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "KNURLED THUMB NUTS DIN 466",
          threadTypes: [
            {
              id: generateId(),
              name: "KNURLED THUMB NUTS DIN 466 METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "KNURLED THUMB NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "T SLOT NUTS DIN 508",
          threadTypes: [
            {
              id: generateId(),
              name: "T SLOT NUTS DIN 508 METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "T SLOT NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SLOTTED CROSS DOWEL TYPE Q",
          threadTypes: [
            {
              id: generateId(),
              name: "SLOTTED CROSS DOWEL TYPE Q METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "SLOTTED CROSS DOWEL TYPE Q INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "TOGGLE NUTS DIN 80701",
          threadTypes: [
            {
              id: generateId(),
              name: "TOGGLE NUTS DIN 80701 METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "TOGGLE NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "HAMMER NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "HAMMER NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "HAMMER NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "SHEAR NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "SHEAR NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "SHEAR NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "BOW NUTS",
          threadTypes: [
            {
              id: generateId(),
              name: "BOW NUTS METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "BOW NUTS INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        },
        {
          id: generateId(),
          name: "FLANGE NUTS WO SERRATION",
          threadTypes: [
            {
              id: generateId(),
              name: "FLANGE NUTS WO SERRATION METRIC",
              grades: makeGrades(NUTS_GENERAL_METRIC_GRADES, true)
            },
            {
              id: generateId(),
              name: "FLANGE NUTS WO SERRATION INCHES",
              grades: makeGrades(NUTS_GENERAL_INCH_GRADES, true, true)
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "washers") {
      subcategories = [
        {
          id: generateId(),
          name: "FLAT WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "FLAT WASHER METRIC",
              grades: makeWasherGrades("FLAT WASHER METRIC", ["DIN 125", "ASTM F436M", "DIN 7989-1", "ISO 7089 200 HV", "ISO 7089 300 HV", "SS 202", "SS 304", "SS 316", "SS 316L", "SS 310", "SS 310S", "POLYMIDE 6.6 BLACK", "POLYMIDE 6.6 NATURAL", "BRASS", "COPPER", "GRP", "NYLON"])
            },
            {
              id: generateId(),
              name: "FLAT WASHER INCHES",
              grades: makeWasherGrades("FLAT WASHER INCHES", ["ASTM A36", "ASTM F436", "SS 202", "SS 304", "SS 316", "SS 316L", "SS 310", "SS 310S", "POLYMIDE 6.6 BLACK", "POLYMIDE 6.6 NATURAL", "BRASS", "COPPER", "GRP", "NYLON"])
            }
          ]
        },
        {
          id: generateId(),
          name: "OD WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "OD WASHER METRIC",
              grades: makeWasherGrades("OD WASHER METRIC", ["DIN 9021", "SS 202", "SS 304", "SS 316", "SS 316L", "SS 310", "SS 310S", "BRASS", "COPPER", "POLYMIDE 6.6 BLACK", "POLYMIDE 6.6 NATURAL", "GRP", "NYLON"])
            },
            {
              id: generateId(),
              name: "OD WASHER INCHES",
              grades: makeWasherGrades("OD WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "SS 310", "SS 310S", "BRASS", "COPPER", "POLYMIDE 6.6 BLACK", "POLYMIDE 6.6 NATURAL", "GRP", "NYLON"])
            }
          ]
        },
        {
          id: generateId(),
          name: "SPRING WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "SPRING WASHER METRIC",
              grades: makeWasherGrades("SPRING WASHER METRIC", ["DIN 127 A", "DIN 127 B", "SS 202", "SS 304", "SS 316", "SS 316L", "SS 310", "SS 310S", "POLYMIDE 6.6 BLACK", "POLYMIDE 6.6 NATURAL", "BRASS", "COPPER", "GRP", "NYLON"])
            },
            {
              id: generateId(),
              name: "SPRING WASHER INCHES",
              grades: makeWasherGrades("SPRING WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "SS 310", "SS 310S", "BRASS", "COPPER", "POLYMIDE 6.6 BLACK", "POLYMIDE 6.6 NATURAL", "GRP", "NYLON"])
            }
          ]
        },
        {
          id: generateId(),
          name: "DTI WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "DTI WASHER METRIC",
              grades: makeWasherGrades("DTI WASHER METRIC", ["ASTM F959M GRADE 8.8", "ASTM F959M GRADE 10.9"])
            },
            {
              id: generateId(),
              name: "DTI WASHER INCHES",
              grades: makeWasherGrades("DTI WASHER INCHES", ["ASTM F959 GR A325", "ASTM F959 GR A490"])
            }
          ]
        },
        {
          id: generateId(),
          name: "SQUIRTER DTI WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "SQUIRTER DTI WASHER METRIC",
              grades: makeWasherGrades("SQUIRTER DTI WASHER METRIC", ["ASTM F959M GRADE 8.8", "ASTM F959M GRADE 10.9"])
            },
            {
              id: generateId(),
              name: "SQUIRTER DTI WASHER INCHES",
              grades: makeWasherGrades("SQUIRTER DTI WASHER INCHES", ["ASTM F959 GR A325", "ASTM F959 GR A490"])
            }
          ]
        },
        {
          id: generateId(),
          name: "HSFG WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "HSFG WASHER METRIC",
              grades: makeWasherGrades("HSFG WASHER METRIC", ["GRADE 8.8", "GRADE 10.9"])
            },
            {
              id: generateId(),
              name: "HSFG WASHER INCHES",
              grades: makeWasherGrades("HSFG WASHER INCHES", ["ASTM A325", "ASTM A490"])
            }
          ]
        },
        {
          id: generateId(),
          name: "STAR WASHER DIN 6798",
          threadTypes: [
            {
              id: generateId(),
              name: "STAR WASHER DIN 6798 METRIC",
              grades: makeWasherGrades("STAR WASHER DIN 6798 METRIC", ["DIN 6798 GRADE 4", "DIN 6798 GRADE 6", "DIN 6798 GRADE 8", "SS 410", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "STAR WASHER INCHES",
              grades: makeWasherGrades("STAR WASHER INCHES", ["SS 410", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "STAR WASHER DIN 6797",
          threadTypes: [
            {
              id: generateId(),
              name: "STAR WASHER DIN 6797 METRIC",
              grades: makeWasherGrades("STAR WASHER DIN 6797 METRIC", ["DIN 6797 GRADE 4", "DIN 6797 GRADE 6", "DIN 6797 GRADE 8", "SS 410", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "STAR WASHER INCHES",
              grades: makeWasherGrades("STAR WASHER INCHES", ["SS 410", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "TAPPER WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "TAPPER WASHER METRIC",
              grades: makeWasherGrades("TAPPER WASHER METRIC", ["DIN 434 ASTM F436M", "DIN 435 ASTM F436M", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "TAPPER WASHER INCHES",
              grades: makeWasherGrades("TAPPER WASHER INCHES", ["ASTM F436", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "EPDM BONDED WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "EPDM BONDED WASHER METRIC",
              grades: makeWasherGrades("EPDM BONDED WASHER METRIC", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "EPDM BONDED WASHER INCHES",
              grades: makeWasherGrades("EPDM BONDED WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "HV WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "HV WASHER METRIC",
              grades: makeWasherGrades("HV WASHER METRIC", ["DIN 6916 HV", "EN 14399-6 HV", "ISO 7090 HV"])
            },
            {
              id: generateId(),
              name: "HV WASHER INCHES",
              grades: makeWasherGrades("HV WASHER INCHES", ["ASTM A36"])
            }
          ]
        },
        {
          id: generateId(),
          name: "CONTACT TEETH WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "CONTACT TEETH WASHER METRIC",
              grades: makeWasherGrades("CONTACT TEETH WASHER METRIC", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "CONTACT TEETH WASHER INCHES",
              grades: makeWasherGrades("CONTACT TEETH WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "RUBBER WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "RUBBER WASHER METRIC",
              grades: makeWasherGrades("RUBBER WASHER METRIC", ["TYPE 1"])
            },
            {
              id: generateId(),
              name: "RUBBER WASHER INCHES",
              grades: makeWasherGrades("RUBBER WASHER INCHES", ["TYPE 1"])
            }
          ]
        },
        {
          id: generateId(),
          name: "CUP WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "CUP WASHER METRIC",
              grades: makeWasherGrades("CUP WASHER METRIC", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "CUP WASHER INCHES",
              grades: makeWasherGrades("CUP WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "HILLSIDE WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "HILLSIDE WASHER METRIC",
              grades: makeWasherGrades("HILLSIDE WASHER METRIC", ["ASTM A36", "ASTM F436M"])
            },
            {
              id: generateId(),
              name: "HILLSIDE WASHER INCHES",
              grades: makeWasherGrades("HILLSIDE WASHER INCHES", ["ASTM A36", "ASTM F436"])
            }
          ]
        },
        {
          id: generateId(),
          name: "NORDLOCK WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "NORDLOCK WASHER METRIC",
              grades: makeWasherGrades("NORDLOCK WASHER METRIC", ["EN 1.7182", "EN 1.7225", "EN 1.4404 STAINLESS STEEL"])
            },
            {
              id: generateId(),
              name: "NORDLOCK WASHER INCHES",
              grades: makeWasherGrades("NORDLOCK WASHER INCHES", ["EN 1.7182", "EN 1.7225", "EN 1.4404 STAINLESS STEEL"])
            }
          ]
        },
        {
          id: generateId(),
          name: "WAVE SPRING WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "WAVE SPRING WASHER METRIC",
              grades: makeWasherGrades("WAVE SPRING WASHER METRIC", ["DIN 137 A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "WAVE SPRING WASHER INCHES",
              grades: makeWasherGrades("WAVE SPRING WASHER INCHES", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "CONICAL SPRING WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "CONICAL SPRING WASHER METRIC",
              grades: makeWasherGrades("CONICAL SPRING WASHER METRIC", ["DIN 6796 A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "CONICAL SPRING WASHER INCHES",
              grades: makeWasherGrades("CONICAL SPRING WASHER INCHES", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "DOUBLE TOOTH LOCK WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "DOUBLE TOOTH LOCK WASHER METRIC",
              grades: makeWasherGrades("DOUBLE TOOTH LOCK WASHER METRIC", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "DOUBLE TOOTH LOCK WASHER INCHES",
              grades: makeWasherGrades("DOUBLE TOOTH LOCK WASHER INCHES", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "1 TAB WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "1 TAB WASHER METRIC",
              grades: makeWasherGrades("1 TAB WASHER METRIC", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "1 TAB WASHER INCHES",
              grades: makeWasherGrades("1 TAB WASHER INCHES", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "2 TAB WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "2 TAB WASHER METRIC",
              grades: makeWasherGrades("2 TAB WASHER METRIC", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "2 TAB WASHER INCHES",
              grades: makeWasherGrades("2 TAB WASHER INCHES", ["A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "DISK SPRING WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "DISK SPRING WASHER METRIC",
              grades: makeWasherGrades("DISK SPRING WASHER METRIC", ["DIN 2093 A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "DISK SPRING WASHER INCHES",
              grades: makeWasherGrades("DISK SPRING WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        },
        {
          id: generateId(),
          name: "STAR LOCK WASHER",
          threadTypes: [
            {
              id: generateId(),
              name: "STAR LOCK WASHER METRIC",
              grades: makeWasherGrades("STAR LOCK WASHER METRIC", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            },
            {
              id: generateId(),
              name: "STAR LOCK WASHER INCHES",
              grades: makeWasherGrades("STAR LOCK WASHER INCHES", ["ASTM A36", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"])
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "anchors") {
      const chemGradesMetric = ["GRADE 4.6", "GRADE 5.6", "GRADE 8.8", "GRADE 10.9", "ASTM A193 GRADE B7", "ASTM A320 GRADE L7", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"];
      const chemGradesInches = ["ASTM A36", "GRADE 5.6", "GRADE 8", "ASTM A193 GRADE B7", "ASTM A320 GRADE L7", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"];
      
      const expGradesMetric = ["GRADE 4.6", "ASTM A36", "GRADE 5.6", "GRADE 8.8", "SS 202", "SS 304", "SS 316", "SS 316L"];
      const expGradesInches = ["ASTM A36", "GRADE 5", "GRADE 8", "SS 202", "SS 304", "SS 316", "SS 316L"];
      
      const dropGradesMetric = ["GRADE 4.6", "ASTM A36", "GRADE 8.8", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS"];
      const dropGradesInches = ["ASTM A36", "GRADE 5", "GRADE 8", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS"];
      
      const nylonPlugNormal = ["TYPE-1", "TYPE-2"];
      const nylonPlugHeavy = ["TYPE-1", "TYPE-2"];
      
      const nylonFrameMetric = ["ASTM A36", "SS 304", "SS 316", "SS 316L"];
      const nylonFrameInches = ["ASTM A36", "SS 304", "SS 316", "SS 316L"];
      
      const ceilingMetric = ["ASTM A36", "SS 304", "SS 316"];
      const ceilingInches = ["ASTM A36", "SS 304", "SS 316"];
      
      const specList = [
        { name: "CHEMICAL ANCHOR BOLTS TYPE-1", type: "chem" },
        { name: "CHEMICAL ANCHOR BOLTS TYPE-2", type: "chem" },
        { name: "CHEMICAL ANCHOR BOLTS TYPE-3", type: "chem" },
        { name: "CHEMICAL ANCHOR BOLTS TYPE-4", type: "chem" },
        { name: "EXPANSION ANCHOR BOLTS", type: "exp" },
        { name: "INTERNAL THREAD STUD ANCHOR", type: "exp" },
        { name: "DROP LIP ANCHOR", type: "drop" },
        { name: "BARREL NUT", type: "drop" },
        { name: "CSK SLEEVE ANCHOR", type: "drop" },
        { name: "HEX HEAD SLEEVE ANCHOR", type: "drop" },
        { name: "CONCRETE ANCHOR BOLTS", type: "drop" },
        { name: "CSK CONCRETE ANCHOR BOLTS", type: "drop" },
        { name: "NYLON PLUG", type: "nylon_plug" },
        { name: "FIX BOLTS", type: "drop" },
        { name: "FIX BOLTS HEAVY DUTY", type: "drop" },
        { name: "NYLON FRAME FIXING ANCHOR", type: "nylon_frame" },
        { name: "FIX BOLT W/ RAWL BOLT CLOSED", type: "drop" },
        { name: "FIX BOLT W/ RAWL BOLT OPEN", type: "drop" },
        { name: "FIX BOLTS SHIELDS", type: "drop" },
        { name: "FIX BOLTS SHIELDS HEAVY DUTY", type: "drop" },
        { name: "TOGGLE BOLT ANCHOR", type: "drop" },
        { name: "PIN TYPE ANCHOR BOLTS", type: "drop" },
        { name: "CEILING ANCHORS TYPE-1", type: "ceiling" },
        { name: "CEILING ANCHORS TYPE-2", type: "ceiling" },
        { name: "FRAME ANCHOR", type: "ceiling" },
        { name: "HOLLOW WALL ANCHOR", type: "ceiling" }
      ];
      
      subcategories = specList.map(spec => {
        let threadTypes;
        if (spec.type === "chem") {
          threadTypes = [
            { id: generateId(), name: "METRIC", grades: makeAnchorGrades(spec.name, "METRIC", chemGradesMetric) },
            { id: generateId(), name: "INCHES", grades: makeAnchorGrades(spec.name, "INCHES", chemGradesInches) }
          ];
        } else if (spec.type === "exp") {
          threadTypes = [
            { id: generateId(), name: "METRIC", grades: makeAnchorGrades(spec.name, "METRIC", expGradesMetric) },
            { id: generateId(), name: "INCHES", grades: makeAnchorGrades(spec.name, "INCHES", expGradesInches) }
          ];
        } else if (spec.type === "nylon_plug") {
          threadTypes = [
            { id: generateId(), name: "NORMAL", grades: makeAnchorGrades(spec.name, "NORMAL", nylonPlugNormal) },
            { id: generateId(), name: "HEAVY DUTY", grades: makeAnchorGrades(spec.name, "HEAVY DUTY", nylonPlugHeavy) }
          ];
        } else if (spec.type === "nylon_frame") {
          threadTypes = [
            { id: generateId(), name: "METRIC", grades: makeAnchorGrades(spec.name, "METRIC", nylonFrameMetric) },
            { id: generateId(), name: "INCHES", grades: makeAnchorGrades(spec.name, "INCHES", nylonFrameInches) }
          ];
        } else if (spec.type === "ceiling") {
          threadTypes = [
            { id: generateId(), name: "METRIC", grades: makeAnchorGrades(spec.name, "METRIC", ceilingMetric) },
            { id: generateId(), name: "INCHES", grades: makeAnchorGrades(spec.name, "INCHES", ceilingInches) }
          ];
        } else {
          threadTypes = [
            { id: generateId(), name: "METRIC", grades: makeAnchorGrades(spec.name, "METRIC", dropGradesMetric) },
            { id: generateId(), name: "INCHES", grades: makeAnchorGrades(spec.name, "INCHES", dropGradesInches) }
          ];
        }
        
        return {
          id: generateId(),
          name: spec.name,
          threadTypes
        };
      });
    } else if (catName.toLowerCase() === "adhesives") {
      const glueSubcats = ["CHEMICAL", "EPOXY", "VINYLESTER", "DISPNESER"];
      subcategories = glueSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeAdhesiveRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "socket screws") {
      const socketSubcats = [
        "SOCKET HEAD ALLEN BOLTS",
        "CSK HEAD ALLEN BOLTS",
        "BUTTON HEAD ALLEN BOLTS",
        "GRUB SCREWS",
        "SHOULDER SCREWS"
      ];
      subcategories = socketSubcats.map(subcat => {
        if (subcat === "GRUB SCREWS") {
          const grubTypes = [
            "CUP POINTS",
            "CONE POINTS",
            "HALF DOG POINTS",
            "FLAT POINT",
            "OVAL POINT",
            "HOLO KNURL POINT"
          ];
          
          const tTypes: ThreadType[] = [];
          
          grubTypes.forEach(gtype => {
            const metricGrades = gtype === "CUP POINTS"
              ? ["DIN 916 GRADE 8.8", "DIN 916 GRADE 10.9", "DIN 916 GRADE 12.9", "SS 304", "SS 316", "SS 316L", "BRASS"]
              : gtype === "CONE POINTS"
              ? ["DIN 914 GRADE 8.8", "DIN 914 GRADE 10.9", "DIN 914 GRADE 12.9", "SS 304", "SS 316", "SS 316L", "BRASS"]
              : gtype === "HALF DOG POINTS"
              ? ["DIN 915 GRADE 8.8", "DIN 915 GRADE 10.9", "DIN 915 GRADE 12.9", "SS 304", "SS 316", "SS 316L", "BRASS"]
              : gtype === "FLAT POINT"
              ? ["DIN 913 GRADE 8.8", "DIN 913 GRADE 10.9", "DIN 913 GRADE 12.9", "SS 304", "SS 316", "SS 316L", "BRASS"]
              : gtype === "OVAL POINT"
              ? ["GRADE 8.8", "GRADE 10.9", "GRADE 12.9", "SS 304", "SS 316", "SS 316L", "BRASS"]
              : ["ISO 4029 GRADE 8.8", "ISO 4029 GRADE 10.9", "ISO 4029 GRADE 12.9", "SS 304", "SS 316", "SS 316L", "BRASS"];

            const inchGrades = ["GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS"];
            
            tTypes.push({
              id: generateId(),
              name: `METRIC - ${gtype}`,
              grades: makeSocketScrewGrades(subcat, `METRIC - ${gtype}`, metricGrades)
            });
            
            tTypes.push({
              id: generateId(),
              name: `INCHES - ${gtype}`,
              grades: makeSocketScrewGrades(subcat, `INCHES - ${gtype}`, inchGrades)
            });
          });
          
          return {
            id: generateId(),
            name: "GRUB SCREWS",
            threadTypes: tTypes
          };
        } else if (subcat === "SHOULDER SCREWS") {
          const shldTypes = [
            "SLOTTED PAN HEAD SHOULDER SCREW DIN 923",
            "HEXAGON SOCKET HEAD SHOULDER SCREWS DIN 9841",
            "CSK SHOULDER SCREW",
            "HEX HEAD SHOULDER BOLT",
            "SQUARE HEAD SHOULDER BOLT",
            "SLOTTED LOW HEAD SHOULDER SCREW"
          ];
          
          const tTypes: ThreadType[] = [];
          
          shldTypes.forEach(stype => {
            const metricGrades = ["GRADE 8.8", "GRADE 10.9", "GRADE 12.9", "ASTM A193 GRADE B7", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"];
            const inchGrades = ["GRADE 5", "GRADE 8", "ASTM A193 GRADE B7", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"];
            
            tTypes.push({
              id: generateId(),
              name: `METRIC - ${stype}`,
              grades: makeSocketScrewGrades(subcat, `METRIC - ${stype}`, metricGrades)
            });
            
            tTypes.push({
              id: generateId(),
              name: `INCHES - ${stype.replace(" DIN 923", "").replace(" DIN 9841", "")}`,
              grades: makeSocketScrewGrades(subcat, `INCHES - ${stype.replace(" DIN 923", "").replace(" DIN 9841", "")}`, inchGrades)
            });
          });
          
          return {
            id: generateId(),
            name: "SHOULDER SCREWS",
            threadTypes: tTypes
          };
        } else {
          const fullThreadGradesMetric = subcat === "SOCKET HEAD ALLEN BOLTS"
            ? ["DIN 912 GRADE 8.8", "DIN 912 GRADE 10.9", "DIN 912 GRADE 12.9", "ASTM A193 GR B7", "DIN 912 SS 304", "DIN 912 SS 316 A4-70", "DIN 912 SS 316 A4-80", "DIN 912 SS 316L A4L-70", "DIN 912 SS 316L A4L-80", "BRASS", "COPPER"]
            : subcat === "CSK HEAD ALLEN BOLTS"
            ? ["DIN 7991 GRADE 8.8", "DIN 7991 GRADE 10.9", "DIN 7991 GRADE 12.9", "ASTM A193 GR B7", "DIN 7991 SS 304", "DIN 7991 SS 316 A4-70", "DIN 7991 SS 316 A4-80", "DIN 7991 SS 316L A4L-70", "DIN 7991 SS 316L A4L-80", "BRASS", "COPPER"]
            : ["ISO 7380 GRADE 8.8", "ISO 7380 GRADE 10.9", "ISO 7380 GRADE 12.9", "ASTM A193 GR B7", "ISO 7380 SS 304", "ISO 7380 SS 316 A4-70", "ISO 7380 SS 316 A4-80", "ISO 7380 SS 316L A4L-70", "ISO 7380 SS 316L A4L-80", "BRASS", "COPPER"];

          const inchGrades = ["GRADE 5", "GRADE 8", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER"];

          return {
            id: generateId(),
            name: subcat,
            threadTypes: [
              {
                id: generateId(),
                name: "FULL THREAD METRIC",
                grades: makeSocketScrewGrades(subcat, "FULL THREAD METRIC", fullThreadGradesMetric)
              },
              {
                id: generateId(),
                name: "HALF THREAD METRIC",
                grades: makeSocketScrewGrades(subcat, "HALF THREAD METRIC", fullThreadGradesMetric)
              },
              {
                id: generateId(),
                name: "FULL THREAD INCHES",
                grades: makeSocketScrewGrades(subcat, "FULL THREAD INCHES", inchGrades)
              },
              {
                id: generateId(),
                name: "HALF THREAD INCHES",
                grades: makeSocketScrewGrades(subcat, "HALF THREAD INCHES", inchGrades)
              }
            ]
          };
        }
      });
    } else if (catName.toLowerCase() === "machine screws") {
      const machineSubcats = [
        "MACHINE SCREW CSK PHILIP HEAD DIN 965",
        "MACHINE SCREW OVAL PHILIP HEAD DIN 966",
        "MACHINE SCREW PAN PHILIP HEAD DIN 7985",
        "HEX FLANGE HEAD MACHINE SCREW",
        "CHEESE HEAD MACHINE SCREW"
      ];
      subcategories = machineSubcats.map(subcat => {
        let metricGrades: string[] = [];
        if (subcat.includes("965")) {
          metricGrades = ["DIN 965 GRADE 8.8", "DIN 965 GRADE 10.9", "DIN 965 GRADE 12.9", "ASTM A193 GR B7", "DIN 912 SS 304", "DIN 912 SS 316 A4-70", "DIN 912 SS 316 A4-80", "DIN 912 SS 316L A4L-70", "DIN 912 SS 316L A4L-80", "BRASS", "COPPER"];
        } else if (subcat.includes("966")) {
          metricGrades = ["DIN 966 GRADE 8.8", "DIN 966 GRADE 10.9", "DIN 966 GRADE 12.9", "ASTM A193 GR B7", "DIN 7991 SS 304", "DIN 7991 SS 316 A4-70", "DIN 7991 SS 316 A4-80", "DIN 7991 SS 316L A4L-70", "DIN 7991 SS 316L A4L-80", "BRASS", "COPPER"];
        } else if (subcat.includes("7985")) {
          metricGrades = ["DIN 7985 GRADE 8.8", "DIN 7985 GRADE 10.9", "DIN 7985 GRADE 12.9", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER"];
        } else {
          metricGrades = ["GRADE 4.6", "GRADE 8.8", "GRADE 10.9", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER"];
        }

        const inchGrades = ["GRADE 5", "GRADE 8", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER"];

        return {
          id: generateId(),
          name: subcat,
          threadTypes: [
            {
              id: generateId(),
              name: "FULL THREAD METRIC",
              grades: makeMachineScrewGrades(subcat, "FULL THREAD METRIC", metricGrades)
            },
            {
              id: generateId(),
              name: "HALF THREAD METRIC",
              grades: makeMachineScrewGrades(subcat, "HALF THREAD METRIC", metricGrades)
            },
            {
              id: generateId(),
              name: "FULL THREAD INCHES",
              grades: makeMachineScrewGrades(subcat, "FULL THREAD INCHES", inchGrades)
            },
            {
              id: generateId(),
              name: "HALF THREAD INCHES",
              grades: makeMachineScrewGrades(subcat, "HALF THREAD INCHES", inchGrades)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "self-tapping screws" || catName.toLowerCase() === "self tapping screws") {
      const selfTappingSubcats = [
        "PAN HEAD SELF TAPPING SCREW DIN 7981",
        "CSK HEAD SELF TAPPING SCREW DIN 7982",
        "HEX HEAD SELF TAPPING SCREW",
        "DRYWALL SCREW BUGLE HEAD PHILIP",
        "DRYWALL SCREW COARSE THREAD",
        "CHIPBOARD SCREW",
        "OVAL HEAD SELF TAPPING SCREW DIN 7983",
        "PHILIPS TRUSS HEAD SELF TAPPING SCREW",
        "PHILIPS FLAT HEAD WOOD SCREWS DIN 7997"
      ];
      subcategories = selfTappingSubcats.map(subcat => {
        const gradesList = ["ASTM A36", "GRADE 4.6", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"];
        return {
          id: generateId(),
          name: subcat,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: makeSelfTappingScrewGrades(subcat, gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "sds screws") {
      const sdsSubcats = [
        "PAN HEAD SELF DRILLING SCREW DIN 7504-M",
        "SELF DRILLING SCREW CSK PHILIPS HEAD DIN 7504-P",
        "WAFER HEAD SELF DRILLING SCREW DIN 7504-N",
        "HEX HEAD SELF DRILLING SCREW DIN 7504-K",
        "HEX HEAD SELF DRILLING SCREW W/ EPDM",
        "HEX HEAD SELF DRILLING SCREW 24 PITCH",
        "SELF DRILLING SCREW HEAVY DUTY",
        "SELF DRILLING SCREW WITH WINGS",
        "HEX H. SELF DRILLING SCREW WITH DOUBLE THREAD",
        "SELF DRILLING SCREW PLASTIC CAP"
      ];
      subcategories = sdsSubcats.map(subcat => {
        const gradesList = subcat === "SELF DRILLING SCREW PLASTIC CAP"
          ? ["TYPE-1"]
          : ["ASTM A36", "GRADE 4.6", "SS 202", "SS 304", "SS 410", "SS 316", "SS 316L", "BRASS", "COPPER"];
        return {
          id: generateId(),
          name: subcat,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: makeSDSScrewGrades(subcat, gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "security fasteners") {
      const securitySubcats = [
        "SOCKET BUTTON POST TORX TAPPING SCREW",
        "SELF-TAPPER CSK EYE DRIVE TAPPING SCREW",
        "SOCKET CSK POST HEX TAPPING SCREW",
        "SELF-TAPPER PAN EYE DRIVE TAPPING SCREW",
        "RAISED HEAD ONE WAY TAPPING SCREW",
        "SOCKET BUTTON POST WITH PIN HEX MACHINE SCREW",
        "SOCKET BUTTON POST WITHOUT PIN HEX MACHINE SCREW",
        "SOCKET BUTTON POST TORX WITH PIN HEX MACHINE SCREW",
        "SOCKET BUTTON POST TORX WITHOUT PIN HEX MACHINE SCREW",
        "SOCKET CSK POST HEX MACHINE SCREW WITH PIN",
        "SOCKET CSK POST TORX MACHINE SCREW WITH PIN",
        "SOCKET CSK POST TORX MACHINE SCREW WITHOUT PIN",
        "METAL THREAD PAN EYE DRIVE",
        "BARREL NUT CSK POST TORX",
        "SECURE RING",
        "SECURITY SCREW TOOL SETS TYPE-1",
        "SECURITY SCREW TOOL SETS TYPE-2",
        "SOCKET CSK POST TORX TAPPING SCREW"
      ];
      subcategories = securitySubcats.map(subcat => {
        const gradesList = ["ASTM A36", "GRADE 4.6", "GRADE 8.8", "SS 202", "SS 304", "SS 410", "SS 316", "SS 316L", "BRASS", "COPPER"];
        return {
          id: generateId(),
          name: subcat,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: makeSecurityFastenerGrades(subcat, gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "lifting accessories") {
      const liftingSubcats = [
        {
          name: "WIRE ROPES",
          series: [
            { name: "NON ROTATING WIRE ROPE 19 X 7", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "PVC COATED WIRE ROPE 6 X 12 + 7FC PVC", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "PVC COATED WIRE ROPE 6 X 7 + 7FC PVC", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "FIBRE CORE WIRE ROPE 6 X 12 + 7FC", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "FIBRE CORE WIRE ROPE 6 X 7 + 7FC", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "STEEL CORE WIRE ROPE 6 X 19 + IWRC", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "STEEL CORE WIRE ROPE 7 X 19", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] },
            { name: "STEEL CORE WIRE ROPE 6 X 36WS X 1WRC", grades: ["1570", "1770", "1960", "2160", "SS 202", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "EYE BOLTS",
          series: [
            { name: "DIN 444 EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "DIN 580 EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "FORGED EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "SHOULDER TYPE MACHINERY EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "SHOULDERLESS EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "OPEN EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "BENT EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "WELDED EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "CUSTOM EYE BOLTS", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "FERRULES",
          series: [
            { name: "ALUMINIUM FERRULE TYPE-1", grades: ["ALUM", "SS 304", "SS 316", "SS 316L", "COPPER"] },
            { name: "ALUMINIUM FERRULE TYPE-2", grades: ["ALUM", "SS 304", "SS 316", "SS 316L", "COPPER"] }
          ]
        },
        {
          name: "WIRE ROPE CLIP",
          series: [
            { name: "WIRE ROPE CLIP DIN 741", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "WIRE ROPE CLIP HEAVY DUTY METRIC", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "WIRE ROPE CLIP HEAVY DUTY INCHES", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "FIST GRIP WIRE ROPE CLIP", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "DOUBLE SADDLE WIRE ROPE CLIP", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] },
            { name: "STAINLESS STEEL WIRE ROPE CLIP", grades: ["SS 304", "SS 316", "SS 316L"] },
            { name: "MALLEABLE IRON WIRE ROPE CLIP", grades: ["ASTM A36", "GRADE 8.8", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "TIMBLES DIN 6899",
          series: [
            { name: "TIMBLES", grades: ["GRADE 8.8", "ASTM A36", "SS 304", "SS 316", "SS 316L"] },
            { name: "TIMBLES CROSSBY G-411", grades: ["GRADE 8.8", "ASTM A36", "SS 304", "SS 316", "SS 316L"] },
            { name: "TIMBLES CROSSBY G-408", grades: ["GRADE 8.8", "ASTM A36", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "TURN BUCKLES",
          series: [
            { name: "TURN BUCKLE HOOK & HOOK - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE HOOK & HOOK - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE EYE & HOOK - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE EYE & HOOK - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE EYE & EYE - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE EYE & EYE - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE JAW & JAW - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE JAW & JAW - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE JAW & EYE - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "TURN BUCKLE JAW & EYE - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "SHACKLES",
          series: [
            { name: "BOW SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "BOW SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "D SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "D SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "BOLT & NUT TYPE SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "BOLT & NUT TYPE SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "ROUND PIN SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "ROUND PIN SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "SCREW PIN SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "SCREW PIN SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "SYNTHETIC SLING SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "SYNTHETIC SLING SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "WISE BODY SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "WISE BODY SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "LONG REACH SHACKLES - METRIC", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] },
            { name: "LONG REACH SHACKLES - INCHES", grades: ["CARBON 1045 STEEL", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "CHAINS",
          series: [
            { name: "ALLOY CHAINS - METRIC", grades: ["GRADE 30", "GRADE 43", "GRADE 70", "GRADE 80", "GRADE 100"] },
            { name: "ALLOY CHAINS - INCHES", grades: ["GRADE 30", "GRADE 43", "GRADE 70", "GRADE 80", "GRADE 100"] },
            { name: "GALVANIZED CHAINS - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "GALVANIZED CHAINS - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "QUICK CONNECTORS",
          series: [
            { name: "QUICK LINK - METRIC", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L"] },
            { name: "QUICK LINK - INCHES", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L"] },
            { name: "HAMMER LOCKS CONNECTING LINKS - METRIC", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L"] },
            { name: "HAMMER LOCKS CONNECTING LINKS - INCHES", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "SNAP HOOK WITH SCREW",
          series: [
            { name: "SNAP CARBINE HOOK - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SNAP CARBINE HOOK - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "HOOK SNAP CARBINE HOOK - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "HOOK SNAP CARBINE HOOK - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SPRING HOOK WITH EYELET - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SPRING HOOK WITH EYELET - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "LOCK SPRING HOOK WITH EYE - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "LOCK SPRING HOOK WITH EYE - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "ROUND RING - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "ROUND RING - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "RING CATCH - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "RING CATCH - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "D RING WELDED - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "D RING WELDED - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "S HOOK - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "S HOOK - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "FIXED EYE SNAP",
          series: [
            { name: "RIGID EYE SNAP - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "RIGID EYE SNAP - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SNAP SHACKLE FIXED EYE - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SNAP SHACKLE FIXED EYE - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SWIVEL EYE BOLT SNAP - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SWIVEL EYE BOLT SNAP - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SPRING SNAP - METRIC", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] },
            { name: "SPRING SNAP - INCHES", grades: ["ASTM A36", "S275JR", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "PULLEY",
          series: [
            { name: "Commercial Pulley single Sheave Hook Type", grades: ["S275JR"] },
            { name: "Commercial Pulley Double Sheave Hook Type", grades: ["S275JR"] },
            { name: "Commercial Pulley tripple Sheave Hook Type", grades: ["S275JR"] }
          ]
        },
        {
          name: "ROUND WELDED RING",
          series: [
            { name: "MASTER LINK", grades: ["S275JR"] },
            { name: "master link assembly", grades: ["S275JR"] }
          ]
        },
        {
          name: "CLEVIS GRAB HOOK",
          series: [
            { name: "CLEVIS hook WITH SAFETY LATCH", grades: ["S275JR"] },
            { name: "CLEVIS SELF LOCKING HOOK", grades: ["S275JR"] },
            { name: "SWIVEL SELF LOCKING HOOK", grades: ["S275JR"] },
            { name: "SHORTEN CLUTCH", grades: ["S275JR"] },
            { name: "CLEVIS GRAB HOOK", grades: ["S275JR"] }
          ]
        },
        {
          name: "SWIVEL EYE AND EYE",
          series: [
            { name: "SWIVEL EYE AND EYE", grades: ["GRADE 80", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "SWIVEL EYE AND JAW",
          series: [
            { name: "SWIVEL EYE AND JAW", grades: ["GRADE 80", "SS 304", "SS 316", "SS 316L"] }
          ]
        },
        {
          name: "SCREW EYES",
          series: [
            { name: "EYE HOOK", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] },
            { name: "CUP HOOK", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] },
            { name: "SQUARE HOOK", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] }
          ]
        },
        {
          name: "HOOKS EB WELDED",
          series: [
            { name: "HOOKS EB WELDED - METRIC", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] },
            { name: "HOOKS EB WELDED - INCHES", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] },
            { name: "RING EYE BOLTS - METRIC", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] },
            { name: "RING EYE BOLTS - INCHES", grades: ["ASTM A36", "SS 304", "SS 316", "SS 316L", "BRASS"] }
          ]
        }
      ];

      subcategories = liftingSubcats.map(sub => {
        return {
          id: generateId(),
          name: sub.name,
          threadTypes: sub.series.map(ser => {
            return {
              id: generateId(),
              name: ser.name,
              grades: makeLiftingAccessoryGrades(ser.name, ser.grades)
            }
          })
        };
      });
    } else if (catName.toLowerCase() === "pipe support systems" || catName.toLowerCase() === "pipe supports systems") {
      const pipeSubcats = [
        "Clevis Hanger",
        "CLEVIS HANGER WITH LINING",
        "SPRINKLER CLAMP",
        "SPLIT CLAMP WITH EPDM LINING",
        "PLAIN SPLIT CLAMP",
        "U STRAP HANGER",
        "U STRAP HANGER WITH LINING",
        "RUBBER SUPPORT INSERT",
        "RISER HANGER WITH LINING",
        "RISER HANGER",
        "ANCHOR BOLT SLEEVE",
        "U BOLT BEAM CLAMP TYPE-1",
        "U BOLT BEAM CLAMP TYPE-2",
        "THREAD ROD BEAM CLAMP",
        "UNISTRUT CHANNEL CLAMP",
        "TUBE CLAMPS",
        "HEAVY DUTY PIPE CLAMPS",
        "HEAVY DUTY DOUBLE BOLT CLAMP",
        "T BOLT CLAMPS",
        "RETAINING HOSE CLAMPS",
        "OFFSET PIPE CLAMP",
        "ANTI VIBRATION HANGER MOUNT",
        "RIBBED MOUNTING PAD",
        "METAL SANDWICH PAD",
        "WAFFLE PAD",
        "RIBBED MULTI-LAYER PAD",
        "CORK SANDWICH PAD",
        "VIBRATION SPRING FLEX & NEOPRENE HANGER",
        "VIBRATION SPRING FLEX HANGER",
        "VIBRATION HANGER NEOPRENE",
        "RIGHT ANGLE CLAMP"
      ];
      subcategories = pipeSubcats.map(subcat => {
        const gradesList = ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"];
        return {
          id: generateId(),
          name: subcat,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: makePipeSupportSystemGrades(subcat, gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "anchor bolts") {
      const anchorBoltSubcats = [
        "STRAIGHT ANCHOR BOLTS",
        "L TYPE ANCHOR BOLTS",
        "L TYPE ANCHOR BOLTS TYPE-1",
        "L TYPE ANCHOR BOLTS TYPE-2",
        "L TYPE ANCHOR BOLTS TYPE-3",
        "J TYPE ANCHOR BOLTS",
        "JA TYPE ANCHOR BOLTS",
        "EYE TYPES FOUNDATION BOLTS",
        "SPLIT TYPES FOUNDATION BOLTS",
        "V TYPE WITH CROSS ROD BOLTS",
        "Z TYPES FOUNDATION BOLTS",
        "Z & J TYPES FOUNDATION BOLTS",
        "GUSSET & PLATE TYPES BOLTS",
        "WELDING TYPE ANCHOR BOLTS",
        "SQUARE BEND J ANCHOR BOLTS",
        "J HOOK",
        "ROUND WASHER",
        "SQUARE WASHER",
        "ANCHOR BOLT SLEEVE"
      ];
      const metricAnchorBoltGrades = [
        "GRADE 4.6",
        "GRADE 8.8",
        "GRADE 10.9",
        "ASTM A36",
        "ASTM F1554 GRADE 36",
        "ASTM F1554 GRADE 55",
        "ASTM F1554 GRADE 105",
        "ASTM A675 GRADE 90",
        "BS 4360 GRADE 50C",
        "BS EN 10025 S275 JR",
        "Q235",
        "S355 JR",
        "S355 JO",
        "A354 BD",
        "ASTM A193 GRADE B7",
        "SS 304",
        "SS 316",
        "SS 316L"
      ];
      const inchAnchorBoltGrades = [
        "GRADE 5",
        "GRADE 8",
        "ASTM A36",
        "ASTM F1554 GRADE 36",
        "ASTM F1554 GRADE 55",
        "ASTM F1554 GRADE 105",
        "ASTM A675 GRADE 90",
        "BS 4360 GRADE 50C",
        "BS EN 10025 S275 JR",
        "Q235",
        "S355 JR",
        "S355 JO",
        "A354 BD",
        "ASTM A193 GRADE B7",
        "SS 304",
        "SS 316",
        "SS 316L"
      ];
      subcategories = anchorBoltSubcats.map(subName => {
        let actualMetricGrades = metricAnchorBoltGrades;
        let actualInchGrades = inchAnchorBoltGrades;
        if (subName.toLowerCase().includes("washer")) {
          actualMetricGrades = ["ASTM A36", "SS 304", "SS 316", "SS 316L"];
          actualInchGrades = ["ASTM A36", "SS 304", "SS 316", "SS 316L"];
        } else if (subName.toLowerCase().includes("sleeve")) {
          actualMetricGrades = ["ASTM A36", "SS 304", "SS 316", "Nylon", "PVC"];
          actualInchGrades = ["ASTM A36", "SS 304", "SS 316", "Nylon", "PVC"];
        }
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "METRIC",
              grades: makeAnchorGrades(subName, "METRIC", actualMetricGrades)
            },
            {
              id: generateId(),
              name: "INCHES",
              grades: makeAnchorGrades(subName, "INCHES", actualInchGrades)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "u bolts") {
      const uBoltSubcats = [
        "ROUND BEND U BOLT",
        "SQUARE BEND U BOLTS",
        "NEOPRENE SLEEVE U BOLT",
        "U BOLTS RUBBER LINED WITH PTFE PAD",
        "RUBBER MOULDED SLEEVED U BOLT",
        "U BOLT WITH PTFE SLEEVE & PAD",
        "U BOLT WITH PU COATING WITH RUBBER PAD LINED",
        "U BOLT WITH SILICONE RUBBER LINED",
        "NEOPRENE SLEEVE ROUND TYPE-1",
        "INSULATED U BOLTS",
        "U BOLT PLATE",
        "EXHAUST CLAMPS"
      ];
      const metricGrades = [
        "GRADE 4.6",
        "GRADE 8.8",
        "GRADE 10.9",
        "ASTM A36",
        "ASTM F1554 GRADE 36",
        "ASTM F1554 GRADE 55",
        "ASTM F1554 GRADE 105",
        "ASTM A675 GRADE 90",
        "BS 4360 GRADE 50C",
        "BS 4360 GRADE A",
        "ASTM A325",
        "ASTM A307 GRADE A",
        "ASTM A307 GRADE B",
        "BS EN 10025 S275 JR",
        "Q235",
        "S355 JR",
        "S355 JO",
        "A354 BD",
        "ASTM A193 GRADE B7",
        "SS 304",
        "SS 316",
        "SS 316L",
        "ASTM A193 GRADE B8",
        "ASTM A193 GRADE B8M"
      ];
      const inchGrades = [
        "GRADE 5",
        "GRADE 8",
        "ASTM A36",
        "ASTM F1554 GRADE 36",
        "ASTM F1554 GRADE 55",
        "ASTM F1554 GRADE 105",
        "ASTM A675 GRADE 90",
        "BS 4360 GRADE 50C",
        "BS EN 10025 S275 JR",
        "BS 4360 GRADE A",
        "ASTM A325",
        "ASTM A307 GRADE A",
        "ASTM A307 GRADE B",
        "Q235",
        "S355 JR",
        "S355 JO",
        "A354 BD",
        "ASTM A193 GRADE B7",
        "SS 304",
        "SS 316",
        "SS 316L",
        "ASTM A193 GRADE B8",
        "ASTM A193 GRADE B8M"
      ];
      subcategories = uBoltSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "METRIC",
              grades: makeAnchorGrades(subName, "METRIC", metricGrades)
            },
            {
              id: generateId(),
              name: "INCHES",
              grades: makeAnchorGrades(subName, "INCHES", inchGrades)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "rivets") {
      const rivetsConfig = [
        {
          name: "ALUMINIUM STEEL RIVETS",
          gradesList: [
            "ALUMINIUM/STEEL OPEN END DOME HEAD",
            "ALUMINIUM/STEEL OPEN END CSK HEAD",
            "ALUMINIUM/STEEL MULTIGRIP DOME HEAD",
            "ALUMINIUM/STEEL CLOSED END DOME HEAD",
            "ALUMINIUM/STEEL OPEN END LARGE FL HEAD"
          ]
        },
        {
          name: "COLORBOND COLOURED RIVETS",
          gradesList: [
            "ALUMINIUM/STEEL OPEN END DOME HEAD"
          ]
        },
        {
          name: "STAINLESS STEEL RIVETS",
          gradesList: [
            "STAINLESS STEEL DOME HEAD",
            "STAINLESS STEEL OPEN END DOME HEAD"
          ]
        },
        {
          name: "STEEL / STEEL RIVETS",
          gradesList: [
            "STEEL/STEEL OPEN END DOME HEAD",
            "STEEL/STEEL MULTIGRIP DOME HEAD"
          ]
        },
        {
          name: "STRUCTURAL RIVETS",
          gradesList: [
            "K-LOCK RIVETS STEEL ZINC PLATED"
          ]
        }
      ];

      subcategories = rivetsConfig.map(spec => {
        return {
          id: generateId(),
          name: spec.name,
          threadTypes: [
            {
              id: generateId(),
              name: "STANDARD SIZES",
              grades: makeAnchorGrades(spec.name, "STANDARD", spec.gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "pins") {
      const pinsConfig = [
        {
          name: "SPLIT PINS",
          gradesList: ["DIN 94 ASTM A36", "DIN 94 S275 JR", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "R CLIPS",
          gradesList: ["ASTM A36 DIN 11024", "S275 JR DIN 11024", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "R CLIPS DOUBLE COIL",
          gradesList: ["ASTM A36", "S275 JR", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "HAIR PIN RETAINER CLIP",
          gradesList: ["ASTM A36", "S275 JR", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "LINCH PINS",
          gradesList: ["ASTM A36 DIN 11023", "S275 JR DIN 11023", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "HITCH PINS",
          gradesList: ["ASTM A36", "S275 JR", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "WAVE PINS",
          gradesList: ["ASTM A36", "S275 JR", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "S-LOK",
          gradesList: ["ASTM A36", "S275 JR", "SS 202", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"]
        },
        {
          name: "DOWEL PINS",
          gradesList: ["ASTM A36", "S275 JR", "ASTM A615 GRADE 40", "ASTM A615 GRADE 60", "SS 202", "SS 304", "SS 316", "SS 316L"]
        },
        {
          name: "CLEVIS PINS",
          gradesList: ["ASTM A36", "S275 JR", "GRADE 8.8", "GRADE 10.9", "SS 304", "SS 316", "SS 316L", "BRASS"]
        }
      ];

      subcategories = pinsConfig.map(spec => {
        return {
          id: generateId(),
          name: spec.name,
          threadTypes: [
            {
              id: generateId(),
              name: "STANDARD SIZES",
              grades: makeAnchorGrades(spec.name, "STANDARD", spec.gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "round bars") {
      const barConfig = [
        {
          name: "ROUND BAR METRICS",
          isMetric: true,
          gradesList: [
            "GRADE 4.6", "GRADE 8.8", "GRADE 10.9", "ASTM A36", "ASTM F1554 GRADE 36", "ASTM F1554 GRADE 55", "ASTM F1554 GRADE 105", "ASTM A675 GRADE 90",
            "BS 4360 GRADE 50C", "BS EN 10025 S275 JR", "Q235", "S355 JR", "S355 JO", "A354 BD", "ASTM A193 GRADE B7", "SS 304",
            "SS 316", "SS 316L", "ASTM A193 GRADE B8", "ASTM A193 GRADE B8M", "BRASS", "COPPER"
          ]
        },
        {
          name: "ROUND BAR INCHES",
          isMetric: false,
          gradesList: [
            "GRADE 5", "GRADE 8", "ASTM A36", "ASTM F1554 GRADE 36", "ASTM F1554 GRADE 55", "ASTM F1554 GRADE 105", "ASTM A675 GRADE 90",
            "BS 4360 GRADE 50C", "BS EN 10025 S275 JR", "Q235", "S355 JR", "S355 JO", "A354 BD", "ASTM A193 GRADE B7", "SS 304",
            "SS 316", "SS 316L", "ASTM A193 GRADE B8", "ASTM A193 GRADE B8M", "BRASS", "COPPER"
          ]
        }
      ];

      subcategories = barConfig.map(spec => {
        return {
          id: generateId(),
          name: spec.name,
          threadTypes: [
            {
              id: generateId(),
              name: spec.isMetric ? "METRIC REBAR" : "IMPERIAL BAR",
              grades: makeAnchorGrades(spec.name, spec.isMetric ? "METRIC" : "INCHES", spec.gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "cable trays") {
      const traysConfig = [
        { name: "SLOTTED CHANNEL", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "FLAT PLATE FITTINGS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "ANGLE FITTINGS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "WING FITTINGS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "Z & U FITTINGS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "BEAM CLAMPS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "CHANNEL CONNECTOR", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "BASE POSTS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "CANTILEVERS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] },
        { name: "I BEAM SUPPORTS", gradesList: ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"] }
      ];

      subcategories = traysConfig.map(spec => {
        return {
          id: generateId(),
          name: spec.name,
          threadTypes: [
            {
              id: generateId(),
              name: "STANDARD SUPPORT SYSTEM",
              grades: makeAnchorGrades(spec.name, "CABLE TRAY", spec.gradesList)
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "flat bars") {
      subcategories = [
        {
          id: generateId(),
          name: "FLAT BARS",
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: makeAnchorGrades("FLAT BARS", "FLAT BAR", ["ASTM A36", "S275 JR", "SS 304", "SS 316", "SS 316L"])
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "teflon") {
      const teflonSubcats = [
        "TEFLON BAR",
        "TEFLON PLATES",
        "TEFLON WASHER",
        "TEFLON SLEEVES",
        "TEFLON CUSTYOM"
      ];
      subcategories = teflonSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeTeflonRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "nylon") {
      const nylonSubcats = [
        "NYLON BAR",
        "NYLON PLATES",
        "NYLON WASHER",
        "NYLON SLEEVES",
        "NYLON CUSTOM"
      ];
      subcategories = nylonSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeNylonRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "grp") {
      const grpSubcats = [
        "GRP BAR",
        "GRP PLATES",
        "GRP WASHER",
        "GRP SLEEVES",
        "GRP CUSTOM ITEMS"
      ];
      subcategories = grpSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeGrpRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "hilti") {
      const hiltiSubcats = [
        "SLOTTED CHANNEL",
        "EXPANSION ANCHOR BOLTS",
        "CHEMICAL ANCHOR",
        "MEDIUM DUTY CHANNEL FITTINGS",
        "ADHESIVES",
        "NAILS",
        "UNIFIX"
      ];
      subcategories = hiltiSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeHiltiRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "fischer" || catName.toLowerCase() === "fischers") {
      const fischerSubcats = [
        "SLOTTED CHANNEL",
        "EXPANSION ANCHOR BOLTS",
        "CHEMICAL ANCHOR",
        "MEDIUM DUTY CHANNEL FITTINGS",
        "ADHESIVES",
        "NAILS",
        "UNIFIX"
      ];
      subcategories = fischerSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeFischerRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "fittings & clamp" || catName.toLowerCase() === "fittings & clamps") {
      subcategories = [
        {
          id: generateId(),
          name: "FITTINGS & CLAMP",
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: [
                    {
                      id: generateId(),
                      partNo: "MF-FIT-SHC-01",
                      description: "Single Bolt Heavy Duty Hose Clamp",
                      dia: "2.0 inch",
                      grade: "SS316",
                      length: "",
                      openingStock: 850,
                      inStock: 120,
                      outGoingStock: 45,
                      balanceStock: 925,
                      tallyStock: 925,
                      unitWeight: 0.145,
                      totalWeight: 134.125,
                      finish: "POLISHED",
                      rackLocation: "12A-B-R03",
                      marking: "MF 2.0\"",
                      ref1Photo: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60"
                    },
                    {
                      id: generateId(),
                      partNo: "MF-FIT-USC-02",
                      description: "U-Bolt Saddle Clamp Heavy Duty",
                      dia: "3.5 inch",
                      grade: "SS316",
                      length: "",
                      openingStock: 450,
                      inStock: 80,
                      outGoingStock: 30,
                      balanceStock: 500,
                      tallyStock: 500,
                      unitWeight: 0.285,
                      totalWeight: 142.5,
                      finish: "STAIN RESISTANT SS",
                      rackLocation: "12A-B-R04",
                      marking: "MF 3.5\"",
                      ref1Photo: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-FIT-ELC-03",
                      description: "EPDM Lined Split Pipe Clamp",
                      dia: "M75",
                      grade: "Galvanized",
                      length: "",
                      openingStock: 1200,
                      inStock: 350,
                      outGoingStock: 150,
                      balanceStock: 1400,
                      tallyStock: 1400,
                      unitWeight: 0.095,
                      totalWeight: 133.0,
                      finish: "HOT DIP GALVANIZED",
                      rackLocation: "14B-E-R01",
                      marking: "MF M75"
                    },
                    {
                      id: generateId(),
                      partNo: "MF-FIT-TSC-04",
                      description: "T-Bolt Spring Tension Exhaust Clamp",
                      dia: "4.0 inch",
                      grade: "SS304",
                      length: "",
                      openingStock: 620,
                      inStock: 150,
                      outGoingStock: 70,
                      balanceStock: 700,
                      tallyStock: 700,
                      unitWeight: 0.198,
                      totalWeight: 138.6,
                      finish: "POLISHED BRIGHT",
                      rackLocation: "12A-C-R01",
                      marking: "MF 4.0\"",
                      ref1Photo: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=300&auto=format&fit=crop&q=60"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "fabrication items") {
      subcategories = [
        {
          id: generateId(),
          name: "FABRICATION ITEMS",
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: [
                    {
                      id: generateId(),
                      partNo: "MF-FAB-PLT-01",
                      description: "Weld-on Column Shoe Connection Plate",
                      dia: "15 mm THK",
                      grade: "Carbon Steel",
                      length: "",
                      openingStock: 150,
                      inStock: 50,
                      outGoingStock: 25,
                      balanceStock: 175,
                      tallyStock: 175,
                      unitWeight: 4.8500,
                      totalWeight: 848.75,
                      finish: "PRIMER COATED",
                      rackLocation: "31A-FL-02",
                      marking: "MF-15-CSP",
                      ref1Photo: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-FAB-ANG-02",
                      description: "Structural Custom Bridging Base Plate",
                      dia: "20 mm x 250",
                      grade: "S355JR",
                      length: "",
                      openingStock: 220,
                      inStock: 40,
                      outGoingStock: 60,
                      balanceStock: 200,
                      tallyStock: 200,
                      unitWeight: 6.2200,
                      totalWeight: 1244.00,
                      finish: "HOT DIP GALVANIZED",
                      rackLocation: "31A-FL-03",
                      marking: "MF 20x250",
                      ref1Photo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-FAB-LUG-03",
                      description: "Heavy Duty Weld-on Lifting Lug 5.0T",
                      dia: "T5.0 Ton",
                      grade: "SS316L",
                      length: "",
                      openingStock: 95,
                      inStock: 15,
                      outGoingStock: 10,
                      balanceStock: 100,
                      tallyStock: 100,
                      unitWeight: 1.1500,
                      totalWeight: 115.00,
                      finish: "SATIN POLISHED",
                      rackLocation: "35C-MZ-05",
                      marking: "MF LUG-5T",
                      ref1Photo: "",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-FAB-BRC-04",
                      description: "Prefabricated Bracing Cleat Assembly",
                      dia: "10 mm Plate",
                      grade: "SS304",
                      length: "",
                      openingStock: 340,
                      inStock: 60,
                      outGoingStock: 40,
                      balanceStock: 360,
                      tallyStock: 360,
                      unitWeight: 1.8200,
                      totalWeight: 655.20,
                      finish: "CLEAN ELECTROPOLISHED",
                      rackLocation: "31A-FL-04",
                      marking: "MF-BC-10",
                      ref1Photo: "",
                      ref2Photo: ""
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "hardware") {
      subcategories = [
        {
          id: generateId(),
          name: "HARDWARE",
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: [
                    {
                      id: generateId(),
                      partNo: "MF-HWD-SHK-01",
                      description: "Heavy Duty Wide Safety Bow Shackle",
                      dia: "1.5 inch",
                      grade: "SS316",
                      length: "",
                      openingStock: 500,
                      inStock: 100,
                      outGoingStock: 50,
                      balanceStock: 550,
                      tallyStock: 550,
                      unitWeight: 0.8500,
                      totalWeight: 467.50,
                      finish: "MIRROR POLISHED",
                      rackLocation: "35B-MZ-R01",
                      marking: "MF-1.5-BS",
                      ref1Photo: "https://images.unsplash.com/photo-1590486803833-ffc6f68e8202?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-HWD-WRC-02",
                      description: "Wire Rope Thimble Assembly Grip",
                      dia: "12 mm Rope",
                      grade: "Galvanized",
                      length: "",
                      openingStock: 1800,
                      inStock: 400,
                      outGoingStock: 200,
                      balanceStock: 2000,
                      tallyStock: 2000,
                      unitWeight: 0.0450,
                      totalWeight: 90.00,
                      finish: "MATED ZINC",
                      rackLocation: "35B-MZ-R02",
                      marking: "MF-THM-12",
                      ref1Photo: "",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-HWD-SNAP-03",
                      description: "Carabiner Spring Snap Hook Lock",
                      dia: "10 x 100 mm",
                      grade: "SS316",
                      length: "",
                      openingStock: 1100,
                      inStock: 250,
                      outGoingStock: 150,
                      balanceStock: 1200,
                      tallyStock: 1200,
                      unitWeight: 0.1150,
                      totalWeight: 138.00,
                      finish: "GLEAMING SS",
                      rackLocation: "35B-MZ-R03",
                      marking: "MF-SNAP-10",
                      ref1Photo: "",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-HWD-KEY-04",
                      description: "Round-ended Square Parallel Key",
                      dia: "14x9x50 mm",
                      grade: "C45 Key Steel",
                      length: "",
                      openingStock: 2500,
                      inStock: 500,
                      outGoingStock: 300,
                      balanceStock: 2700,
                      tallyStock: 2700,
                      unitWeight: 0.0480,
                      totalWeight: 129.60,
                      finish: "OILEATED BLACK",
                      rackLocation: "35B-MZ-R04",
                      marking: "MF-KEY-14x9",
                      ref1Photo: "",
                      ref2Photo: ""
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
    } else if (catName.toLowerCase() === "gasket") {
      const gasketSubcats = [
        "CNAF SOFT CUT GASKET",
        "PTFE ENVELOPE",
        "SPIRAL WOUND GASKET",
        "METAL JACKETED GASKET",
        "CAMPROFILE GASKET",
        "CORRUGATED GASKET",
        "RING JOINT GASKET",
        "ISOLATION KIT GASKET",
        "THERMAL INSULATION PRODUCTS",
        "EXPANSION JOINTS",
        "RUBBER WITH METAL REINFORCED GASKET",
        "O-RINGS & OILSEALS",
        "EYELETED GASKET",
        "NBR RUBBER GASKET",
        "EPDM RUBBER GASKET"
      ];
      subcategories = gasketSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: makeGasketRows(subName)
                }
              ]
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "marble fixing acces." || catName.toLowerCase() === "marble fixing accessories") {
      const marbleSubcats = [
        "45° L BRACKET",
        "ADJUSTABLE L BRACKET",
        "C BRACKET",
        "Z CLADDING CLAMP",
        "STONE CLADDING BRACKETS",
        "L BRACKETS",
        "FLAT HEAD BOLTS",
        "PIN",
        "SQUARE WASHER",
        "OTHERS",
        "FRAME ANCHOR CSK",
        "FRAME ANCHOR HEX HEAD"
      ];
      subcategories = marbleSubcats.map(subName => {
        return {
          id: generateId(),
          name: subName,
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: ["SS 304", "SS 316", "SS 316L"].map(gradeName => {
                const is304 = gradeName.includes("304");
                const is316L = gradeName.includes("316L");
                const multiplier = is304 ? 1.0 : is316L ? 1.2 : 1.1;
                const weight = parseFloat((0.245 * multiplier).toFixed(4));
                const shortGrade = gradeName.replace(" ", "");
                const codeName = subName.replace(/[^a-zA-Z0-0]/g, "").replace(" ", "").substring(0,6).toUpperCase();
                
                return {
                  id: generateId(),
                  name: gradeName,
                  rows: [
                    {
                      id: generateId(),
                      partNo: `MF-MFA-${codeName}-${shortGrade}-01`,
                      description: `${subName} Heavy Duty Cladding Bracket System`,
                      dia: "M10",
                      grade: gradeName,
                      length: "80 mm",
                      openingStock: Math.floor(1000 * multiplier),
                      inStock: Math.floor(300 * multiplier),
                      outGoingStock: Math.floor(150 * multiplier),
                      balanceStock: Math.floor(1150 * multiplier),
                      tallyStock: Math.floor(1150 * multiplier),
                      unitWeight: weight,
                      totalWeight: parseFloat((Math.floor(1150 * multiplier) * weight).toFixed(2)),
                      finish: "CLEAN PICKLED PASSIVATED",
                      rackLocation: `24D-FL-${is304 ? '04' : is316L ? '06' : '05'}`,
                      marking: `MFI ${gradeName}`,
                      ref1Photo: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: ""
                    }
                  ]
                };
              })
            }
          ]
        };
      });
    } else if (catName.toLowerCase() === "cnc components" || catName.toLowerCase() === "cnc component") {
      subcategories = [
        {
          id: generateId(),
          name: "CNC COMPONENTS",
          threadTypes: [
            {
              id: generateId(),
              name: "ALL",
              grades: [
                {
                  id: generateId(),
                  name: "ALL",
                  rows: [
                    {
                      id: generateId(),
                      partNo: "MF-CNC-SPN-01",
                      description: "CNC Turned Stainless Steel Shaft Pin",
                      dia: "15 mm DIA",
                      grade: "SS316L",
                      length: "120 mm",
                      openingStock: 1200,
                      inStock: 300,
                      outGoingStock: 200,
                      balanceStock: 1300,
                      tallyStock: 1300,
                      unitWeight: 0.1680,
                      totalWeight: 218.40,
                      finish: "BRIGHT TURNED GROUND",
                      rackLocation: "35D-MZ-08",
                      marking: "MF-SPN-15x120",
                      ref1Photo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=60",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-CNC-COL-02",
                      description: "Precise Milled Hex Threaded Collar Spacer",
                      dia: "OD 35 x ID 14 mm",
                      grade: "Carbon Steel",
                      length: "45 mm",
                      openingStock: 650,
                      inStock: 150,
                      outGoingStock: 80,
                      balanceStock: 720,
                      tallyStock: 720,
                      unitWeight: 0.2200,
                      totalWeight: 158.40,
                      finish: "ZINC CHROMATED COATED",
                      rackLocation: "35D-MZ-09",
                      marking: "MF-CNC-COL-35",
                      ref1Photo: "",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-CNC-BUSH-03",
                      description: "Brass Custom Spindle Bushing Sleeve Pivot",
                      dia: "8mm ID / 16mm OD",
                      grade: "Brass",
                      length: "25 mm",
                      openingStock: 2000,
                      inStock: 500,
                      outGoingStock: 300,
                      balanceStock: 2200,
                      tallyStock: 2200,
                      unitWeight: 0.0380,
                      totalWeight: 83.60,
                      finish: "NATURAL BRIGHT BRASS",
                      rackLocation: "35D-MZ-10",
                      marking: "MF-BUSH-8x16",
                      ref1Photo: "",
                      ref2Photo: ""
                    },
                    {
                      id: generateId(),
                      partNo: "MF-CNC-BLK-04",
                      description: "CNC Precision Aluminum Mounting Block",
                      dia: "50x50x25 mm",
                      grade: "Aluminium H30",
                      length: "",
                      openingStock: 450,
                      inStock: 100,
                      outGoingStock: 50,
                      balanceStock: 500,
                      tallyStock: 500,
                      unitWeight: 0.1850,
                      totalWeight: 92.50,
                      finish: "CLEAR ANODIZED PROTECTION",
                      rackLocation: "35D-MZ-11",
                      marking: "MF-CNC-5050",
                      ref1Photo: "",
                      ref2Photo: ""
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
    } else {
      // General preloaded default subcategory structure for structural integrity of the view
      subcategories = [
        {
          id: generateId(),
          name: `${catName} Standard`,
          threadTypes: [
            {
              id: generateId(),
              name: `${catName} Metric Thread`,
              grades: [
                { id: generateId(), name: "GRADE A", rows: [] },
                { id: generateId(), name: "GRADE B", rows: [] },
                { id: generateId(), name: "STAINLESS SS316", rows: [] }
              ]
            },
            {
              id: generateId(),
              name: `${catName} Imperial Thread`,
              grades: [
                { id: generateId(), name: "INCH GRADE 5", rows: [] },
                { id: generateId(), name: "INCH GRADE 8", rows: [] },
                { id: generateId(), name: "STAINLESS SS304", rows: [] }
              ]
            }
          ]
        }
      ];
    }

    return {
      id: generateId(),
      name: catName,
      subcategories
    };
  });

  // Deep-strip all demo/sample row lists across all categories for MFI's warehouse clean slate
  return rawCategories.map(cat => ({
    ...cat,
    subcategories: (cat.subcategories || []).map(sub => ({
      ...sub,
      threadTypes: (sub.threadTypes || []).map(tt => ({
        ...tt,
        grades: (tt.grades || []).map(g => ({
          ...g,
          rows: [] // Empty product rows - clean slate!
        }))
      }))
    }))
  }));
}

// Fine Thread & UNF Category List
export const FINE_THREAD_CATEGORIES_LIST = [
  "STRUCTURAL BOLTS",
  "ALL THREADS & STUDS",
  "STUD BOLTS",
  "SOCKET SCREWS",
  "MACHINE SCREWS",
  "NUT"
];

function makeSeededFineRows(catName: string, subcatName: string, gradeName: string): ProductRow[] {
  const normCat = catName.trim().toUpperCase();
  const normSub = subcatName.trim().toUpperCase();
  const shortGrade = gradeName.replace(/\s+/g, "");
  const codeName = subcatName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toUpperCase();
  const isMetric = gradeName.includes("DIN") || gradeName.includes("A4");

  const dia = isMetric ? "M12" : '1/2"-20';
  const len = isMetric ? "60 mm" : '2.5"';
  const pitchSuffix = isMetric ? "x1.25" : " UNF";
  const finish = isMetric ? "CR3 ZINC PLATED" : "BLACK OXIDE";
  const wt = isMetric ? 0.0880 : 0.1240;

  // Let's have some specific pre-defined rows for key structural bolt subcategories so the product catalog looks rich:
  if (normCat === "STRUCTURAL BOLTS") {
    if (normSub === "HEX BOLTS") {
      if (gradeName === "DIN 960 GRADE 10.9") {
        return [
          {
            id: generateId(),
            partNo: "MF-FT-HB-109-M16",
            description: "Fine Pitch Structural Heavy Hex Bolt DIN 960",
            dia: "M16 x 1.5",
            grade: gradeName,
            length: "80 mm",
            openingStock: 500,
            inStock: 120,
            outGoingStock: 40,
            balanceStock: 580,
            tallyStock: 580,
            unitWeight: 0.1850,
            totalWeight: 107.30,
            finish: "HOT DIP GALVANIZED",
            rackLocation: "12A-FL-02",
            marking: "MF 10.9S",
            ref1Photo: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=300&auto=format&fit=crop&q=60",
            ref2Photo: ""
          }
        ];
      } else if (gradeName === "DIN 960 GRADE 8.8") {
        return [
          {
            id: generateId(),
            partNo: "MF-FT-HB-088-M12",
            description: "Fine Pitch Structural Hex Cap Screw DIN 960",
            dia: "M12 x 1.25",
            grade: gradeName,
            length: "60 mm",
            openingStock: 800,
            inStock: 200,
            outGoingStock: 100,
            balanceStock: 900,
            tallyStock: 900,
            unitWeight: 0.0950,
            totalWeight: 85.50,
            finish: "CR3 ZINC PLATED",
            rackLocation: "12A-FL-03",
            marking: "MF 8.8S",
            ref1Photo: "",
            ref2Photo: ""
          }
        ];
      } else if (gradeName === "ASTM A193 GRADE B7 (UNF)") {
        return [
          {
            id: generateId(),
            partNo: "MF-UNF-HB-B7-34",
            description: "UNF Structural Hex Cap Screw High Tensile",
            dia: '3/4"-16',
            grade: gradeName,
            length: '4"',
            openingStock: 350,
            inStock: 50,
            outGoingStock: 30,
            balanceStock: 370,
            tallyStock: 370,
            unitWeight: 0.4200,
            totalWeight: 155.40,
            finish: "BLACK OXIDE",
            rackLocation: "12B-FL-04",
            marking: "B7 UNF",
            ref1Photo: "",
            ref2Photo: ""
          }
        ];
      }
    } else if (normSub === "FLANGE BOLTS") {
      if (gradeName === "DIN 960 GRADE 10.9") {
        return [
          {
            id: generateId(),
            partNo: "MF-FT-FB-109-M12",
            description: "Fine Pitch Hex Flange Bolt DIN 6921 / 960",
            dia: "M12 x 1.25",
            grade: gradeName,
            length: "40 mm",
            openingStock: 600,
            inStock: 150,
            outGoingStock: 50,
            balanceStock: 700,
            tallyStock: 700,
            unitWeight: 0.1100,
            totalWeight: 77.00,
            finish: "YELLOW ZINC PASSIVATED",
            rackLocation: "12C-FL-07",
            marking: "MF 10.9 Flange",
            ref1Photo: "",
            ref2Photo: ""
          }
        ];
      }
    } else if (normSub === "12 POINT BOLTS") {
      if (gradeName === "SAE J429 GRADE 8") {
        return [
          {
            id: generateId(),
            partNo: "MF-UNF-12P-G8-58",
            description: "12-Point Flange Bolt UNF High Tensile",
            dia: '5/8"-18',
            grade: gradeName,
            length: '3"',
            openingStock: 250,
            inStock: 80,
            outGoingStock: 20,
            balanceStock: 310,
            tallyStock: 310,
            unitWeight: 0.2850,
            totalWeight: 88.35,
            finish: "PHOSPHATE COATED",
            rackLocation: "13B-FL-09",
            marking: "12P G8 UNF",
            ref1Photo: "",
            ref2Photo: ""
          }
        ];
      }
    }
  } else if (normCat === "ALL THREADS & STUD") {
    if (gradeName === "STAINLESS A4-70") {
      return [
        {
          id: generateId(),
          partNo: `MF-FT-AS-A4-${codeName}-M20`,
          description: `Fine Pitch Stainless Steel ${subcatName} Stud Rod`,
          dia: "M20 x 1.5",
          grade: gradeName,
          length: "1000 mm",
          openingStock: 150,
          inStock: 30,
          outGoingStock: 20,
          balanceStock: 160,
          tallyStock: 160,
          unitWeight: 2.1000,
          totalWeight: 336.00,
          finish: "BRIGHT SHINY",
          rackLocation: "15C-FL-08",
          marking: "A4-70",
          ref1Photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60",
          ref2Photo: ""
        }
      ];
    } else if (gradeName === "ASTM A193 GRADE B7 (UNF)") {
      return [
        {
          id: generateId(),
          partNo: `MF-UNF-ATS-B7-${codeName}-78`,
          description: `UNF Continuous Thread ${subcatName} Stud Bar`,
          dia: '7/8"-14',
          grade: gradeName,
          length: '12"',
          openingStock: 400,
          inStock: 100,
          outGoingStock: 50,
          balanceStock: 450,
          tallyStock: 450,
          unitWeight: 1.6200,
          totalWeight: 729.00,
          finish: "XYLAN TEFLON BLUE",
          rackLocation: "15D-FL-09",
          marking: "B7 UNF",
          ref1Photo: "",
          ref2Photo: ""
        }
      ];
    }
  } else if (normCat === "STUD BOLTS") {
    if (gradeName === "DIN 960 GRADE 10.9") {
      return [
        {
          id: generateId(),
          partNo: "MF-FT-STB-109-M24",
          description: "Fine Pitch Heavy Hex Double-Ended Stud Bolt",
          dia: "M24 x 2.0",
          grade: gradeName,
          length: "150 mm",
          openingStock: 280,
          inStock: 40,
          outGoingStock: 20,
          balanceStock: 300,
          tallyStock: 300,
          unitWeight: 0.6100,
          totalWeight: 183.00,
          finish: "ZINC PLATED",
          rackLocation: "16A-FL-11",
          marking: "10.9",
          ref1Photo: "",
          ref2Photo: ""
        }
      ];
    } else if (gradeName === "ASTM A193 GRADE B7 (UNF)") {
      return [
        {
          id: generateId(),
          partNo: "MF-UNF-STB-B7-10",
          description: "UNF Heavy Duty Stud End Cap Stud Bolt",
          dia: '1"-12',
          grade: gradeName,
          length: '6"',
          openingStock: 220,
          inStock: 30,
          outGoingStock: 10,
          balanceStock: 240,
          tallyStock: 240,
          unitWeight: 1.1205,
          totalWeight: 268.92,
          finish: "CADMIUM PLATED",
          rackLocation: "16B-FL-12",
          marking: "B7 UNF-C",
          ref1Photo: "",
          ref2Photo: ""
        }
      ];
    }
  } else if (normCat === "SOCKET SCREWS") {
    if (gradeName === "STAINLESS A4-70") {
      return [
        {
          id: generateId(),
          partNo: `MF-FT-SS-A4-${codeName}-M10`,
          description: `Fine Pitch Stainless Steel Socket Head ${subcatName}`,
          dia: "M10 x 1.25",
          grade: gradeName,
          length: "30 mm",
          openingStock: 1200,
          inStock: 300,
          outGoingStock: 150,
          balanceStock: 1350,
          tallyStock: 1350,
          unitWeight: 0.0260,
          totalWeight: 35.10,
          finish: "BRIGHT STAINLESS",
          rackLocation: "18A-MZ-02",
          marking: "THE A4-70",
          ref1Photo: "https://images.unsplash.com/photo-1590486803833-ffc6f68e8202?w=300&auto=format&fit=crop&q=60",
          ref2Photo: ""
        }
      ];
    } else if (gradeName === "SAE J429 GRADE 8") {
      return [
        {
          id: generateId(),
          partNo: `MF-UNF-SS-G8-${codeName}-38`,
          description: `UNF High-Tensile Grade 8 Socket Head ${subcatName}`,
          dia: '3/8"-24',
          grade: gradeName,
          length: '1.5"',
          openingStock: 1800,
          inStock: 400,
          outGoingStock: 200,
          balanceStock: 2000,
          tallyStock: 2000,
          unitWeight: 0.0420,
          totalWeight: 84.00,
          finish: "BLACK THERMO-TREATED",
          rackLocation: "18B-MZ-03",
          marking: "MF G8 UNF",
          ref1Photo: "",
          ref2Photo: ""
        }
      ];
    }
  } else if (normCat === "MACHINE SCREWS") {
    if (gradeName === "STAINLESS A4-70") {
      return [
        {
          id: generateId(),
          partNo: `MF-FT-MS-A4-${codeName}-M6`,
          description: `Fine Pitch ${subcatName} Machine Screw`,
          dia: "M6 x 0.75",
          grade: gradeName,
          length: "20 mm",
          openingStock: 3000,
          inStock: 1000,
          outGoingStock: 500,
          balanceStock: 3500,
          tallyStock: 3500,
          unitWeight: 0.0055,
          totalWeight: 19.25,
          finish: "CLEAN SS POLISH",
          rackLocation: "19A-MZ-08",
          marking: "A4",
          ref1Photo: "",
          ref2Photo: ""
        }
      ];
    } else if (gradeName === "SAE J429 GRADE 5") {
      return [
        {
          id: generateId(),
          partNo: `MF-UNF-MS-G5-${codeName}-10`,
          description: `UNF ${subcatName} Machine Screw`,
          dia: "10-32",
          grade: gradeName,
          length: '3/4"',
          openingStock: 4500,
          inStock: 1500,
          outGoingStock: 800,
          balanceStock: 5200,
          tallyStock: 5200,
          unitWeight: 0.0031,
          totalWeight: 16.12,
          finish: "TRIVALENT ZINC CR3",
          rackLocation: "19B-MZ-09",
          marking: "MF UNF G5",
          ref1Photo: "",
          ref2Photo: ""
        }
      ];
    }
  }

  // General elegant fallback
  return [
    {
      id: generateId(),
      partNo: `MF-FT-${codeName}-${shortGrade}-01`,
      description: `Fine & UNF ${subcatName} Fastener`,
      dia: `${dia}${pitchSuffix}`,
      grade: gradeName,
      length: len,
      openingStock: 250,
      inStock: 80,
      outGoingStock: 20,
      balanceStock: 310,
      tallyStock: 310,
      unitWeight: wt,
      totalWeight: parseFloat((310 * wt).toFixed(2)),
      finish: finish,
      rackLocation: `RF-${isMetric ? '40A' : '40B'}-${shortGrade.substring(0,3)}`,
      marking: `MFI ${gradeName}`,
      ref1Photo: "",
      ref2Photo: ""
    }
  ];
}

const METRIC_STRUCTURAL_GRADES = [
  "DIN 933 GR 4.6", "DIN 933 GR 4.8", "DIN 933 GR 5.6", "DIN 933 GR 8.8 (ORD)", "DIN 933 GR 8.8", "GR 8.8 HR", "DIN 933 GR 10.9", "DIN 6914 GR 10.9", "DIN 933 GR 12.9", "ASTM A325M TYPE-1", "ASTM A490M TYPE-1", "ASTM A307 GR. A", "ASTM A307 GR. B", "ASTM A193 GR B7", "ASTM A193 GR B7M", "ASTM A193 GR B16", "ASTM A320 GR L7", "ASTM A320 GR L7M", "ASTM A320 GR L43", "SS 202 A2-70", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "ASTM A193 GR B8", "ASTM A193 GR B8M", "ASTM A193 GR B8T", "ASTM A193 GR B8C", "SS 310", "SS 310S", "SS 410", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP", "DUPLEX", "SUPER DUPLEX", "INCONEL", "MONEL"
];

const UNF_STRUCTURAL_GRADES = [
  "GRADE 5", "GRADE 8", "ASTM A325", "ASTM A490M", "ASTM A307 GR. A", "ASTM A307 GR. B", "ASTM A193 GR B7", "ASTM A193 GR B7M", "ASTM A193 GR B16", "ASTM A320 GR L7", "ASTM A320 GR L7M", "ASTM A320 GR L43", "SS 202 A2-70", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "ASTM A193 GR B8", "ASTM A193 GR B8M", "ASTM A193 GR B8T", "ASTM A193 GR B8C", "SS 310", "SS 310S", "SS 410", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP", "DUPLEX", "SUPER DUPLEX", "INCONEL", "MONEL"
];

const T_BOLT_METRIC_GRADES = [
  "GRADE 4.6", "GRADE 5.6", "GRADE 8.8", "SS 304 A2-70 450MPA", "SS 304 A2-70 700MPA", "SS 316 A4-70 450MPA", "SS 316 A4-70 700MPA", "SS 316L A4L-70 450MPA", "SS 316L A4L-70 700MPA"
];

const T_BOLT_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304 A2-70 450MPA", "SS 304 A2-70 700MPA", "SS 316 A4-70 450MPA", "SS 316 A4-70 700MPA", "SS 316L A4L-70 450MPA", "SS 316L A4L-70 700MPA"
];

const POINT12_METRIC_GRADES = [
  "GRADE 8.8", "GRADE 10.9", "GRADE 12.9", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80"
];

const POINT12_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80"
];

const ELEVATOR_METRIC_GRADES = [
  "GRADE 4.6", "GRADE 8.8", "GRADE 10.9", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80"
];

const ELEVATOR_UNF_GRADES = [
  "GRADE 2", "GRADE 5", "GRADE 8", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80"
];

const PLOW_METRIC_GRADES = [
  "GRADE 8.8", "GRADE 10.9", "GRADE 12.9", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER"
];

const PLOW_UNF_GRADES = [
  "GRADE 2", "GRADE 5", "GRADE 8", "SS 304 A2-70", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "BRASS", "COPPER"
];

const ALL_THREAD_METRIC_GRADES = [
  "GRADE 4.6 IND", "GRADE 4.6 CHIN", "GRADE 4.8", "GRADE 8.8", "GRADE 10.9", "GRADE 12.9", "ASTM A325M", "ASTM A490M", "ASTM A307 GR A", "ASTM A307 GR B", "ASTM A193 GR B5", "ASTM A193 GR B6", "ASTM A193 GR B7", "ASTM A193 GR B7M", "ASTM A193 GR B16", "ASTM A320 GR L7", "ASTM A320 GR L7M", "ASTM A320 GR L43", "SS 304", "SS 410", "SS 316", "SS 316L", "SS 310", "SS 310S", "SS 321", "ASTM A193 GR B8 CL-1", "ASTM A193 GR B8 CL-2", "ASTM A193 GR B8M CL-1", "ASTM A193 GR B8M CL-2", "ASTM A320 GR B8 CL-1", "ASTM A320 GR B8 CL-2", "ASTM A320 GR B8M CL-1", "ASTM A320 GR B8M CL-2", "ASTM A193 GR B8T", "ASTM A193 GR B8C", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP", "ASTM A437 B4B", "ASTM A182 F51", "ASTM A182 F53", "ASTM A182 F55", "ASTM A182 F44", "ASTM A182 F310", "ASTM A182 F904L", "ASTM A540", "ASTM A564 630", "ASTM F467 Titanium", "INCONEL C276", "INCONEL 625", "INCONEL 718", "INCONEL 600", "INCONEL 601", "INCONEL 925", "INCOLOY 20", "INCOLOY 800H", "INCOLOY 825", "MONEL 400", "MONEL K 500", "NIMONIC 80A", "NITRONIC 50", "NITRONIC 60", "WASPALOY", "EN 10269", "C35E", "C45E", "25CrMo4", "42CrMo4", "40CrMoV4-6", "41NiCrMo7-3-2", "20CrMoVTiB4-10", "34CrNiMo6", "30CrNiMo8", "X22CrMoV12-1", "X19CrMoNbVN11-1", "X5CrNi18-10", "X2CrNiMo17-12-2", "X5CrNiMo17-12-2", "X6NiCrTiMoVB25-15-2"
];

const ALL_THREAD_UNF_GRADES = [
  "GRADE 2", "GRADE 5", "GRADE 8", "ASTM F1554 GRADE 36", "ASTM F1554 GRADE 55", "ASTM F1554 GRADE 105", "ASTM A325M", "ASTM A490M", "ASTM A307 GR A", "ASTM A307 GR B", "ASTM A193 GR B5", "ASTM A193 GR B6", "ASTM A193 GR B7", "ASTM A193 GR B7M", "ASTM A193 GR B16", "ASTM A320 GR L7", "ASTM A320 GR L7M", "ASTM A320 GR L43", "SS 304", "SS 410", "SS 316", "SS 316L", "SS 310", "SS 310S", "SS 321", "ASTM A193 GR B8 CL-1", "ASTM A193 GR B8 CL-2", "ASTM A193 GR B8M CL-1", "ASTM A193 GR B8M CL-2", "ASTM A320 GR B8 CL-1", "ASTM A320 GR B8 CL-2", "ASTM A320 GR B8M CL-1", "ASTM A320 GR B8M CL-2", "ASTM A193 GR B8T", "ASTM A193 GR B8C", "BRASS", "COPPER", "TEFLON", "NYLON", "GRP", "ASTM A437 B4B", "ASTM A182 F51", "ASTM A182 F53", "ASTM A182 F55", "ASTM A182 F44", "ASTM A182 F310", "ASTM A182 F904L", "ASTM A540", "ASTM A564 630", "ASTM F467 Titanium", "INCONEL C276", "INCONEL 625", "INCONEL 718", "INCONEL 600", "INCONEL 601", "INCONEL 925", "INCOLOY 20", "INCOLOY 800H", "INCOLOY 825", "MONEL 400", "MONEL K 500", "NIMONIC 80A", "NITRONIC 50", "NITRONIC 60", "WASPALOY", "EN 10269", "C35E", "C45E", "25CrMo4", "42CrMo4", "40CrMoV4-6", "41NiCrMo7-3-2", "20CrMoVTiB4-10", "34CrNiMo6", "30CrNiMo8", "X22CrMoV12-1", "X19CrMoNbVN11-1", "X5CrNi18-10", "X2CrNiMo17-12-2", "X5CrNiMo17-12-2", "X6NiCrTiMoVB25-15-2"
];

const SOCKET_FINE_GRADES = [
  "DIN 912 GRADE 8.8", "DIN 912 GRADE 10.9", "DIN 912 GRADE 12.9", "ASTM A193 GR B7", "DIN 912 SS 304", "DIN 912 SS 316 A4-70", "DIN 912 SS 316 A4-80", "DIN 912 SS 316L A4L 70", "DIN 912 SS 316L A4L-80", "BRASS", "COPPER"
];

const SOCKET_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-L70", "SS 316L A4L-80", "BRASS", "COPPER"
];

const CSK_SOCKET_FINE_GRADES = [
  "DIN 7991 GRADE 8.8", "DIN 7991 GRADE 10.9", "DIN 7991 GRADE 12.9", "ASTM A193 GR B7", "DIN 7991 SS 304", "DIN 7991 SS 316 A4-70", "DIN 7991 SS 316 A4-80", "DIN 7991 SS 316L A4L-70", "DIN 7991 SS 316L A4L-80", "BRASS", "COPPER"
];

const BUTTON_SOCKET_FINE_GRADES = [
  "ISO 7380 GRADE 8.8", "ISO 7380 GRADE 10.9", "ISO 7380 GRADE 12.9", "ASTM A193 GR B7", "ISO 7380 SS 304", "ISO 7380 SS 316 A4-70", "ISO 7380 SS 316 A4-80", "ISO 7380 SS 316L A4L-70", "ISO 7380 SS 316L A4L-80", "BRASS", "COPPER"
];

const MACHINE_CSK_FINE_GRADES = [
  "DIN 965 GRADE 8.8", "DIN 965 GRADE 10.9", "DIN 965 GRADE 12.9", "ASTM A193 GR B7", "DIN 912 SS 304", "DIN 912 SS 316 A4-70", "DIN 912 SS 316 A4-80", "DIN 912 SS 316L A4L 70", "DIN 912 SS 316L A4L-80", "BRASS", "COPPER"
];

const MACHINE_OVAL_FINE_GRADES = [
  "DIN 966 GRADE 8.8", "DIN 966 GRADE 10.9", "DIN 966 GRADE 12.9", "ASTM A193 GR B7", "DIN 7991 SS 304", "DIN 7991 SS 316 A4-70", "DIN 7991 SS 316 A4-80", "DIN 7991 SS 316L A4L-70", "DIN 7991 SS 316L A4L-80", "BRASS", "COPPER"
];

const MACHINE_PAN_FINE_GRADES = [
  "DIN 7985 GRADE 8.8", "DIN 7985 GRADE 10.9", "DIN 7985 GRADE 12.9", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-L70", "SS 316L A4L-80", "BRASS", "COPPER"
];

const MACHINE_FLANGE_CHEESE_FINE_GRADES = [
  "GRADE 4.6", "GRADE 8.8", "GRADE 10.9", "ASTM A193 GRADE B7", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-l70", "SS 316L A4L-80", "BRASS", "COPPER"
];

const NUT_HEX_FINE_GRADES = [
  "DIN 934 CLASS 8", "DIN 934 CLASS 10", "DIN 934 CLASS 12", "DIN 934 SS 202", "DIN 934 SS 304", 
  "DIN 934 SS 316 A4-70", "DIN 934 SS 316 A4-80", "DIN 934 SS 316L A4L-70", "DIN 934 SS 316L A4L-80", 
  "SS 310", "SS 310S", "SS 410", "ASTM A194 GRADE 2H", "ASTM A194 GRADE 2HM", "ASTM A194 GRADE 3", 
  "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L", "ASTM A194 GRADE 6", "ASTM A194 GRADE 7", "ASTM A194 GRADE 7L", 
  "ASTM A194 GRADE 7M", "ASTM A194 GRADE 7ML", "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M", 
  "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T", "DIN 934 BRASS", "DIN 934 COPPER", "TEFLON", "NYLON", "GRP"
];

const NUT_HEX_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "TEFLON", "NYLON", "GRP"
];

const NUT_HEAVY_HEX_FINE_GRADES = [
  "ASTM A563M GRADE 8S", "ASTM A563M GRADE 10S", "ASTM A563 GRADE DH", "ASTM A563 GRADE A", "DIN 6915 GRADE 10",
  "ASTM A194 GRADE 2H", "ASTM A194 GRADE 2HM", "ASTM A194 GRADE 3", "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L",
  "ASTM A194 GRADE 6", "ASTM A194 GRADE 7", "ASTM A194 GRADE 7L", "ASTM A194 GRADE 7M", "ASTM A194 GRADE 7ML",
  "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M", "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T",
  "DIN 934 BRASS", "DIN 934 COPPER", "TEFLON", "NYLON", "GRP",
  "ASTM A437 B4B", "ASTM A453 660", "ASTM A182 F51", "ASTM A182 F53", "ASTM A182 F55", "ASTM A182 F44",
  "ASTM A182 F310", "ASTM A182 F904L", "ASTM A540", "ASTM A564 630", "ASTM F467 Titanium",
  "INCONEL C276", "INCONEL 625", "INCONEL 718", "INCONEL 600", "INCONEL 601", "INCONEL 925",
  "INCOLOY 20", "INCOLOY 800H", "INCOLOY 825", "MONEL 400", "MONEL K 500", "NIMONIC 80A",
  "NITRONIC 50", "NITRONIC 60", "WASPALOY", "EN 10269", "C35E", "C45E", "25CrMo4", "42CrMo4", "40CrMoV4-6"
];

const NUT_HEAVY_HEX_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "ASTM A563 GRADE DH", "ASTM A563 GRADE A",
  "ASTM A194 GRADE 2H", "ASTM A194 GRADE 2HM", "ASTM A194 GRADE 3", "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L",
  "ASTM A194 GRADE 6", "ASTM A194 GRADE 7", "ASTM A194 GRADE 7L", "ASTM A194 GRADE 7M", "ASTM A194 GRADE 7ML",
  "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M", "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T",
  "DIN 934 BRASS", "DIN 934 COPPER", "TEFLON", "NYLON", "GRP",
  "ASTM A437 B4B", "ASTM A453 660", "ASTM A182 F51", "ASTM A182 F53", "ASTM A182 F55", "ASTM A182 F44",
  "ASTM A182 F310", "ASTM A182 F904L", "ASTM A540", "ASTM A564 630", "ASTM F467 Titanium",
  "INCONEL C276", "INCONEL 625", "INCONEL 718", "INCONEL 600", "INCONEL 601", "INCONEL 925",
  "INCOLOY 20", "INCOLOY 800H", "INCOLOY 825", "MONEL 400", "MONEL K 500", "NIMONIC 80A",
  "NITRONIC 50", "NITRONIC 60", "WASPALOY"
];

const NUT_FLANGE_FINE_GRADES = [
  "DIN 6923 CLASS 8", "DIN 6923 CLASS 10", "DIN 6923 CLASS 12", "SS 304", "SS 316 A4-70", "SS 316 A4-80", 
  "SS 316L A4L-70", "SS 316L A4L-80", "DIN 6923 BRASS", "DIN 6923 COPPER", "SS 310", "SS 310S", 
  "TEFLON", "NYLON", "GRP"
];

const NUT_FLANGE_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER", "SS 310", "SS 310S", 
  "TEFLON", "NYLON", "GRP"
];

const NUT_NYLOCK_FINE_GRADES = [
  "DIN 985 CLASS 8", "DIN 985 CLASS 10", "DIN 985 CLASS 12", "SS 202", "SS 304", 
  "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "ASTM A194 GRADE 2H", 
  "ASTM A194 GR 8", "ASTM A194 GR 8M", "BRASS", "COPPER"
];

const NUT_NYLOCK_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "ASTM A194 GRADE 2H", 
  "ASTM A194 GR 8", "ASTM A194 GR 8M", "BRASS", "COPPER"
];

const NUT_LONG_FINE_GRADES = [
  "DIN 6334 CLASS 6", "DIN 6334 CLASS 8", "DIN 6334 CLASS 10", "DIN 6334 SS 304", 
  "DIN 6334 SS 316", "DIN 6334 SS 316L", "BRASS", "COPPER"
];

const NUT_LONG_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"
];

const NUT_THIN_FINE_GRADES = [
  "DIN 936 CLASS 4", "DIN 936 CLASS 6", "DIN 936 CLASS 8", "SS 304", "SS 316", "SS 316L",
  "ASTM A563M GRADE DH", "ASTM A563M GRADE A", "ASTM A563M GRADE 10S", "ASTM A194 GRADE 2H",
  "ASTM A194 GRADE 2HM", "ASTM A194 GRADE 3", "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L",
  "ASTM A194 GRADE 6", "ASTM A194 GRADE 7", "ASTM A194 GRADE 7L", "ASTM A194 GRADE 7M",
  "ASTM A194 GRADE 7ML", "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M",
  "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T", "DIN 934 BRASS", "DIN 934 COPPER", "TEFLON", "NYLON", "GRP"
];

const NUT_THIN_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "ASTM A563 GRADE DH", "ASTM A563 GRADE A", "ASTM A194 GRADE 2H",
  "ASTM A194 GRADE 2HM", "ASTM A194 GRADE 3", "ASTM A194 GRADE 4", "ASTM A194 GRADE 4L",
  "ASTM A194 GRADE 6", "ASTM A194 GRADE 7", "ASTM A194 GRADE 7L", "ASTM A194 GRADE 7M",
  "ASTM A194 GRADE 7ML", "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M",
  "ASTM A194 GRADE 8MA", "ASTM A194 GRADE 8T", "DIN 934 BRASS", "DIN 934 COPPER", "TEFLON", "NYLON", "GRP"
];

const NUT_WELD_FINE_GRADES = [
  "DIN 929 CLASS 8", "DIN 929 CLASS 10", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"
];

const NUT_WELD_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"
];

const NUT_CASTLE_FINE_GRADES = [
  "DIN 937 CLASS 8", "DIN 937 CLASS 10", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"
];

const NUT_CASTLE_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"
];

const NUT_DOME_FINE_GRADES = [
  "DIN 1587 CLASS 6", "DIN 1587 CLASS 8", "DIN 1587 CLASS 10", "SS 304", 
  "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_DOME_UNF_GRADES = [
  "GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_WING_FINE_GRADES = [
  "DIN 315 CLASS 6", "DIN 315 CLASS 8", "DIN 315 CLASS 10", "SS 304", 
  "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_WING_UNF_GRADES = [
  "GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_SQUARE_FINE_GRADES = [
  "DIN 557 CLASS 6", "DIN 557 CLASS 8", "DIN 557 CLASS 10", "SS 304", 
  "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_SQUARE_UNF_GRADES = [
  "GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_ANCO_METRIC_GRADES = [
  "ASTM A563M GRADE 8S", "ASTM A563M GRADE 10S", "ASTM A563 GRADE DH", "ASTM A563 GRADE A", "DIN 6915 GRADE 10",
  "ASTM A194 GRADE 2H", "ASTM A194 GRADE 8", "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M"
];

const NUT_ANCO_INCH_GRADES = [
  "GRADE 5", "GRADE 8", "ASTM A563 GRADE DH", "ASTM A563 GRADE A", "ASTM A194 GRADE 2H", "ASTM A194 GRADE 8", 
  "ASTM A194 GRADE 8C", "ASTM A194 GRADE 8M"
];

const NUT_LOCK_980V_FINE_GRADES = [
  "DIN 980V CLASS 8", "DIN 980V CLASS 10", "DIN 980V CLASS 12", "SS 304", 
  "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-70", "SS 316L A4L-80", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_LOCK_980V_UNF_GRADES = [
  "GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "TEFLON", "NYLON", "GRP", "BRASS", "COPPER"
];

const NUT_TOMMY_FINE_GRADES = [
  "CLASS 8", "CLASS 10", "SS 304", "SS 316", "BRASS", "COPPER"
];

const NUT_TOMMY_UNF_GRADES = [
  "GRADE 5", "GRADE 8", "SS 304", "SS 316", "BRASS", "COPPER"
];

const NUT_FLANGE_WO_SERRATION_FINE_GRADES = [
  "CLASS 6", "CLASS 8", "CLASS 10", "CLASS 12", "SS 304", "SS 316 A4-70", "SS 316 A4-80", "SS 316L A4L-80", "BRASS", "COPPER"
];

const NUT_FLANGE_WO_SERRATION_UNF_GRADES = [
  "GRADE 3", "GRADE 5", "GRADE 8", "SS 304", "SS 316", "SS 316L", "BRASS", "COPPER"
];

export function getInitialFineThreadUNF(): Category[] {
  const rawCategories = FINE_THREAD_CATEGORIES_LIST.map(catName => {
    const normCat = catName.trim().toUpperCase();
    let subcategories: Subcategory[] = [];

    if (normCat === "STRUCTURAL BOLTS") {
      const subsConfig = [
        {
          name: "Hex Bolts",
          types: [
            { name: "Hex Bolt FT Fine", grades: METRIC_STRUCTURAL_GRADES },
            { name: "Hex Bolt HT Fine", grades: METRIC_STRUCTURAL_GRADES },
            { name: "Hex Bolt FT UNF", grades: UNF_STRUCTURAL_GRADES },
            { name: "Hex Bolt HT UNF", grades: UNF_STRUCTURAL_GRADES }
          ]
        },
        {
          name: "FLANGE BOLTS",
          types: [
            { name: "Flange Bolts FT Fine", grades: METRIC_STRUCTURAL_GRADES },
            { name: "Flange Bolts HT Fine", grades: METRIC_STRUCTURAL_GRADES },
            { name: "Flange Bolts FT UNF", grades: UNF_STRUCTURAL_GRADES },
            { name: "Flange Bolts HT UNF", grades: UNF_STRUCTURAL_GRADES }
          ]
        },
        {
          name: "T Bolts",
          types: [
            { name: "T Bolts FT Fine", grades: T_BOLT_METRIC_GRADES },
            { name: "T Bolts HT Fine", grades: T_BOLT_METRIC_GRADES },
            { name: "T Bolt FT UNF", grades: T_BOLT_UNF_GRADES },
            { name: "T Bolts HT UNF", grades: T_BOLT_UNF_GRADES }
          ]
        },
        {
          name: "12 POINT BOLTS",
          types: [
            { name: "12 Point Bolts FT FINE", grades: POINT12_METRIC_GRADES },
            { name: "12 Point Bolts HT FINE", grades: POINT12_METRIC_GRADES },
            { name: "12 Point Bolts FT UNF", grades: POINT12_UNF_GRADES },
            { name: "12 Point Bolts HT UNF", grades: POINT12_UNF_GRADES }
          ]
        },
        {
          name: "ELAVATOR BOLTS",
          types: [
            { name: "Elevator Bolts Type-1", grades: ELEVATOR_METRIC_GRADES },
            { name: "Elevator Bolts Type-2", grades: ELEVATOR_METRIC_GRADES },
            { name: "Elevator Bolts Type-3", grades: ELEVATOR_UNF_GRADES },
            { name: "Elevator Bolts Type-4", grades: ELEVATOR_UNF_GRADES }
          ]
        },
        {
          name: "PLOW BOLTS",
          types: [
            { name: "Plow Bolts FT FINE", grades: PLOW_METRIC_GRADES },
            { name: "Plow Bolts HT FINE", grades: PLOW_METRIC_GRADES },
            { name: "Plow Bolts FT UNF", grades: PLOW_UNF_GRADES },
            { name: "Plow Bolts HT UNF", grades: PLOW_UNF_GRADES }
          ]
        },
        {
          name: "HEX BOLT WITHOUT GRADES",
          types: [
            { name: "METRIC", grades: ["GRADE 8.8", "ASTM A325M TYPE-1", "SS 316"] },
            { name: "INCHES", grades: ["GRADE 8", "ASTM A325", "SS 316"] }
          ]
        }
      ];

      subcategories = subsConfig.map(subConf => ({
        id: generateId(),
        name: subConf.name,
        threadTypes: subConf.types.map(tConf => ({
          id: generateId(),
          name: tConf.name,
          grades: tConf.grades.map(gName => ({
            id: generateId(),
            name: gName,
            rows: makeSeededFineRows(catName, subConf.name, gName)
          }))
        }))
      }));

    } else if (normCat === "ALL THREADS & STUD") {
      const subsConfig = [
        {
          name: "THREADED BAR",
          types: [
            { name: "THREADED BAR FINE", grades: ALL_THREAD_METRIC_GRADES },
            { name: "THREADED BAR UNF", grades: ALL_THREAD_UNF_GRADES }
          ]
        },
        {
          name: "ENGINEERING STUD",
          types: [
            { name: "ENGG STUD FINE", grades: ALL_THREAD_METRIC_GRADES },
            { name: "ENGG STUD UNF", grades: ALL_THREAD_UNF_GRADES }
          ]
        },
        {
          name: "COLLAR STUD BOLT",
          types: [
            { name: "COLLAR STUD FINE", grades: ALL_THREAD_METRIC_GRADES },
            { name: "COLLAR STUD UNF", grades: ALL_THREAD_UNF_GRADES }
          ]
        },
        {
          name: "FULL THREAD PLUG",
          types: [
            { name: "FULL THREAD PLUG FINE", grades: FULL_THREAD_PLUG_GRADES },
            { name: "FULL THREAD PLUG UNF", grades: FULL_THREAD_PLUG_GRADES }
          ]
        },
        {
          name: "SQUARE HEAD JACK SCREWS",
          types: [
            { name: "SQ. HEAD JACK SCREW FINE", grades: ALL_THREAD_METRIC_GRADES },
            { name: "SQ. HEAD JACK SCREW UNF", grades: ALL_THREAD_UNF_GRADES }
          ]
        },
        {
          name: "HEX HEAD JACK SCREWS",
          types: [
            { name: "HEX HEAD JACK SCREW FINE", grades: ALL_THREAD_METRIC_GRADES },
            { name: "HEX HEAD JACK SCREW UNF", grades: ALL_THREAD_UNF_GRADES }
          ]
        }
      ];

      subcategories = subsConfig.map(subConf => ({
        id: generateId(),
        name: subConf.name,
        threadTypes: subConf.types.map(tConf => ({
          id: generateId(),
          name: tConf.name,
          grades: tConf.grades.map(gName => ({
            id: generateId(),
            name: gName,
            rows: makeSeededFineRows(catName, subConf.name, gName)
          }))
        }))
      }));

    } else if (normCat === "STUD BOLTS") {
      const subsConfig = [
        {
          name: "STUD BOLTS",
          types: [
            { name: "STUD BOLTS FINE", grades: ALL_THREAD_METRIC_GRADES },
            { name: "STUD BOLTS UNF", grades: ALL_THREAD_UNF_GRADES }
          ]
        }
      ];

      subcategories = subsConfig.map(subConf => ({
        id: generateId(),
        name: subConf.name,
        threadTypes: subConf.types.map(tConf => ({
          id: generateId(),
          name: tConf.name,
          grades: tConf.grades.map(gName => ({
            id: generateId(),
            name: gName,
            rows: makeSeededFineRows(catName, subConf.name, gName)
          }))
        }))
      }));

    } else if (normCat === "SOCKET SCREWS") {
      const subsConfig = [
        {
          name: "SOCKET HEAD ALLEN BOLTS",
          types: [
            { name: "FULL THREAD FINE", grades: SOCKET_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: SOCKET_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        },
        {
          name: "CSK HEAD ALLEN BOLTS",
          types: [
            { name: "FULL THREAD FINE", grades: CSK_SOCKET_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: CSK_SOCKET_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        },
        {
          name: "BUTTON HEAD ALLEN BOLTS",
          types: [
            { name: "FULL THREAD FINE", grades: BUTTON_SOCKET_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: BUTTON_SOCKET_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        }
      ];

      subcategories = subsConfig.map(subConf => ({
        id: generateId(),
        name: subConf.name,
        threadTypes: subConf.types.map(tConf => ({
          id: generateId(),
          name: tConf.name,
          grades: tConf.grades.map(gName => ({
            id: generateId(),
            name: gName,
            rows: makeSeededFineRows(catName, subConf.name, gName)
          }))
        }))
      }));

    } else if (normCat === "MACHINE SCREWS") {
      const subsConfig = [
        {
          name: "MACHINE SCREW CSK PHILIP",
          types: [
            { name: "FULL THREAD FINE", grades: MACHINE_CSK_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: MACHINE_CSK_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        },
        {
          name: "MACHINE SCREW OVAL PHILIP",
          types: [
            { name: "FULL THREAD FINE", grades: MACHINE_OVAL_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: MACHINE_OVAL_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        },
        {
          name: "MACHINE SCREW PAN PHILIP",
          types: [
            { name: "FULL THREAD FINE", grades: MACHINE_PAN_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: MACHINE_PAN_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        },
        {
          name: "HEX FLANGE HEAD MACHINE SCREW",
          types: [
            { name: "FULL THREAD FINE", grades: MACHINE_FLANGE_CHEESE_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: MACHINE_FLANGE_CHEESE_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        },
        {
          name: "CHEESE HEAD MACHINE SCREW",
          types: [
            { name: "FULL THREAD FINE", grades: MACHINE_FLANGE_CHEESE_FINE_GRADES },
            { name: "HALF THREAD FINE", grades: MACHINE_FLANGE_CHEESE_FINE_GRADES },
            { name: "FULL THREAD UNF", grades: SOCKET_UNF_GRADES },
            { name: "HALF THREAD UNF", grades: SOCKET_UNF_GRADES }
          ]
        }
      ];

      subcategories = subsConfig.map(subConf => ({
        id: generateId(),
        name: subConf.name,
        threadTypes: subConf.types.map(tConf => ({
          id: generateId(),
          name: tConf.name,
          grades: tConf.grades.map(gName => ({
            id: generateId(),
            name: gName,
            rows: makeSeededFineRows(catName, subConf.name, gName)
          }))
        }))
      }));
    } else if (normCat === "NUTS" || normCat === "NUT") {
      const subsConfig = [
        {
          name: "HEX NUT",
          types: [
            { name: "HEX NUT FINE", grades: NUT_HEX_FINE_GRADES },
            { name: "HEX NUT UNF", grades: NUT_HEX_UNF_GRADES }
          ]
        },
        {
          name: "HEAVY HEX NUT",
          types: [
            { name: "HEAVY HEX NUT FINE", grades: NUT_HEAVY_HEX_FINE_GRADES },
            { name: "HEAVY HEX NUT UNF", grades: NUT_HEAVY_HEX_UNF_GRADES }
          ]
        },
        {
          name: "FLANGE NUTS",
          types: [
            { name: "FLANGE NUTS FINE", grades: NUT_FLANGE_FINE_GRADES },
            { name: "FLANGE NUTS UNF", grades: NUT_FLANGE_UNF_GRADES }
          ]
        },
        {
          name: "NYLOCK NUT",
          types: [
            { name: "NYLOCK NUT FINE", grades: NUT_NYLOCK_FINE_GRADES },
            { name: "NYLOCK NUT UNF", grades: NUT_NYLOCK_UNF_GRADES }
          ]
        },
        {
          name: "LONG NUT",
          types: [
            { name: "LONG NUT FINE", grades: NUT_LONG_FINE_GRADES },
            { name: "LONG NUT UNF", grades: NUT_LONG_UNF_GRADES }
          ]
        },
        {
          name: "THIN NUT",
          types: [
            { name: "THIN NUT FINE", grades: NUT_THIN_FINE_GRADES },
            { name: "THIN NUT UNF", grades: NUT_THIN_UNF_GRADES }
          ]
        },
        {
          name: "WELD NUTS",
          types: [
            { name: "WELD NUTS FINE", grades: NUT_WELD_FINE_GRADES },
            { name: "WELD NUTS UNF", grades: NUT_WELD_UNF_GRADES }
          ]
        },
        {
          name: "CASTLE NUTS DIN 937",
          types: [
            { name: "CASTLE NUTS DIN 937 FINE", grades: NUT_CASTLE_FINE_GRADES },
            { name: "CASTLE NUTS DIN 937 UNF", grades: NUT_CASTLE_UNF_GRADES }
          ]
        },
        {
          name: "DOME NUTS",
          types: [
            { name: "DOME NUTS FINE", grades: NUT_DOME_FINE_GRADES },
            { name: "DOME NUTS UNF", grades: NUT_DOME_UNF_GRADES }
          ]
        },
        {
          name: "WING NUTS",
          types: [
            { name: "WING NUTS FINE", grades: NUT_WING_FINE_GRADES },
            { name: "WING NUTS UNF", grades: NUT_WING_UNF_GRADES }
          ]
        },
        {
          name: "SQUARE NUTS",
          types: [
            { name: "SQUARE NUTS FINE", grades: NUT_SQUARE_FINE_GRADES },
            { name: "SQUARE NUTS UNF", grades: NUT_SQUARE_UNF_GRADES }
          ]
        },
        {
          name: "ANCO LOCK NUTS",
          types: [
            { name: "ANCO LOCK NUTS METRIC", grades: NUT_ANCO_METRIC_GRADES },
            { name: "ANCO LOCK NUTS INCHES", grades: NUT_ANCO_INCH_GRADES }
          ]
        },
        {
          name: "LOCK NUTS DIN 980V",
          types: [
            { name: "LOCK NUTS DIN 980V FINE", grades: NUT_LOCK_980V_FINE_GRADES },
            { name: "LOCK NUTS UNF", grades: NUT_LOCK_980V_UNF_GRADES }
          ]
        },
        {
          name: "TOMMY NUTS",
          types: [
            { name: "TOMMY NUTS FINE", grades: NUT_TOMMY_FINE_GRADES },
            { name: "TOMMY NUTS UNF", grades: NUT_TOMMY_UNF_GRADES }
          ]
        },
        {
          name: "FLANGE NUTS WO SERRATION",
          types: [
            { name: "FLANGE NUTS WO SERRATION FINE", grades: NUT_FLANGE_WO_SERRATION_FINE_GRADES },
            { name: "FLANGE NUTS WO SERRATION UNF", grades: NUT_FLANGE_WO_SERRATION_UNF_GRADES }
          ]
        }
      ];

      subcategories = subsConfig.map(subConf => ({
        id: generateId(),
        name: subConf.name,
        threadTypes: subConf.types.map(tConf => ({
          id: generateId(),
          name: tConf.name,
          grades: tConf.grades.map(gName => ({
            id: generateId(),
            name: gName,
            rows: makeSeededFineRows(catName, subConf.name, gName)
          }))
        }))
      }));
    }

    return {
      id: generateId(),
      name: catName,
      subcategories
    };
  });

  // Deep-strip all demo/sample row lists across all fine thread categories
  return rawCategories.map(cat => ({
    ...cat,
    subcategories: (cat.subcategories || []).map(sub => ({
      ...sub,
      threadTypes: (sub.threadTypes || []).map(tt => ({
        ...tt,
        grades: (tt.grades || []).map(g => ({
          ...g,
          rows: [] // Clean empty rows!
        }))
      }))
    }))
  }));
}

export function loadFineThreadProductsWithMerge(savedJson: string): Category[] {
  let parsed: Category[] = [];
  try {
    parsed = JSON.parse(savedJson);
  } catch (e) {
    return getInitialFineThreadUNF();
  }

  if (!Array.isArray(parsed)) return getInitialFineThreadUNF();

  // Filter out any obsolete categories
  parsed = parsed.filter(cat => 
    cat &&
    cat.name &&
    FINE_THREAD_CATEGORIES_LIST.includes(cat.name.trim().toUpperCase())
  );

  const initial = getInitialFineThreadUNF();

  // Deep merge categories
  initial.forEach(initialCat => {
    const existingCat = parsed.find(parsedCat => 
      parsedCat && 
      parsedCat.name && 
      parsedCat.name.trim().toUpperCase() === initialCat.name.trim().toUpperCase()
    );

    if (!existingCat) {
      parsed.push(initialCat);
    } else {
      // It exists. Merge the subcategories!
      if (!existingCat.subcategories) {
        existingCat.subcategories = [];
      }

      // Filter out raw automatic "Heavy Series" placeholder subcategories
      existingCat.subcategories = existingCat.subcategories.filter(sub => {
        if (!sub || !sub.name) return false;
        const subName = sub.name.trim().toUpperCase();
        return !subName.endsWith("HEAVY SERIES");
      });

      // Go through initial subcategories and merge them
      initialCat.subcategories.forEach(initialSub => {
        const existingSub = existingCat.subcategories.find(s => 
          s && s.name && s.name.trim().toUpperCase() === initialSub.name.trim().toUpperCase()
        );

        if (!existingSub) {
          existingCat.subcategories.push(initialSub);
        } else {
          // Merge threadTypes
          if (!existingSub.threadTypes) {
            existingSub.threadTypes = [];
          }
          initialSub.threadTypes.forEach(initialTt => {
            const existingTt = existingSub.threadTypes.find(t => 
              t && t.name && t.name.trim().toUpperCase() === initialTt.name.trim().toUpperCase()
            );

            if (!existingTt) {
              existingSub.threadTypes.push(initialTt);
            } else {
              // Merge grades
              if (!existingTt.grades) {
                existingTt.grades = [];
              }
              initialTt.grades.forEach(initialGrade => {
                const existingGrade = existingTt.grades.find(g => 
                  g && g.name && g.name.trim().toUpperCase() === initialGrade.name.trim().toUpperCase()
                );

                if (!existingGrade) {
                  existingTt.grades.push(initialGrade);
                } else {
                  // Merge rows if empty or missing
                  if (!existingGrade.rows || existingGrade.rows.length === 0) {
                    existingGrade.rows = initialGrade.rows || [];
                  }
                }
              });
            }
          });
        }
      });
    }
  });

  // Sort them according to initial list order for consistent UI ordering
  parsed.sort((a, b) => {
    const idxA = FINE_THREAD_CATEGORIES_LIST.indexOf(a.name.trim().toUpperCase());
    const idxB = FINE_THREAD_CATEGORIES_LIST.indexOf(b.name.trim().toUpperCase());
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return parsed;
}

// Initial Warehouse Floor Layouts (PDF targetable)
export const INITIAL_WAREHOUSE_LAYOUTS: WarehouseLayout[] = [
  {
    id: "1",
    name: "31A GROUND FLOOR",
    pdfLink: "https://drive.google.com/file/d/1_31a_ground_floor_layout_placeholder/view?usp=sharing",
    description: "Main storage for structural bolting, heavy metrics (DIN 933 / DIN 931) and large-diameter fasteners."
  },
  {
    id: "2",
    name: "31A MEZZANINE FLOOR",
    pdfLink: "https://drive.google.com/file/d/1_31a_mezz_floor_layout_placeholder/view?usp=sharing",
    description: "Small pack sorting center, stainless steel small fasteners and socket cap screws."
  },
  {
    id: "3",
    name: "35B GROUND FLOOR",
    pdfLink: "https://drive.google.com/file/d/1_35b_ground_floor_layout_placeholder/view?usp=sharing",
    description: "Bulk items, nuts & washers storage rack rows A to G, self-tapping and drywall screw racks."
  },
  {
    id: "4",
    name: "35B MEZZANINE FLOOR",
    pdfLink: "https://drive.google.com/file/d/1_35b_mezz_floor_layout_placeholder/view?usp=sharing",
    description: "Hardware goods, GRP & Nylon specialty plastics and standard hand-hardware products."
  },
  {
    id: "5",
    name: "35C GROUND FLOOR",
    pdfLink: "https://drive.google.com/file/d/1_35c_ground_floor_layout_placeholder/view?usp=sharing",
    description: "Heavy stud bolts rods inventory, specialized pipe clamp components and anchors database."
  },
  {
    id: "6",
    name: "35C MEZZANINE FLOOR",
    pdfLink: "https://drive.google.com/file/d/1_35c_mezz_floor_layout_placeholder/view?usp=sharing",
    description: "Lifting accessories warehouse section, high security specialist fasteners and gaskets."
  },
  {
    id: "7",
    name: "35D DRIVEWAY",
    pdfLink: "https://drive.google.com/file/d/1_35d_driveway_layout_placeholder/view?usp=sharing",
    description: "Outgoing loading platform, transit containers, heavy bar stocks and structural flat bars packaging."
  }
];

// Initial Custom Material Hex Photos with customizable drive links
export const INITIAL_HEX_PHOTOS: HexPhoto[] = [
  {
    id: "1",
    title: "Double Hex / Heavy Structural Bolts",
    driveLink: "https://drive.google.com/file/d/1SampleDrivePhotoA/view?usp=sharing",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "2",
    title: "Stainless Steel SS-316 Anchors & Screws",
    driveLink: "https://drive.google.com/file/d/1SampleDrivePhotoB/view?usp=sharing",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "3",
    title: "Zinc Passivated Stud Bolts & Fasteners",
    driveLink: "https://drive.google.com/file/d/1SampleDrivePhotoC/view?usp=sharing",
    imageUrl: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "4",
    title: "Industrial Grade Nuts & Special Sockets",
    driveLink: "https://drive.google.com/file/d/1SampleDrivePhotoD/view?usp=sharing",
    imageUrl: "https://images.unsplash.com/photo-1610483178736-a29659be3fcc?auto=format&fit=crop&w=600&q=80"
  }
];

export function loadStandardsProductsWithMerge(savedJson: string): Category[] {
  let parsed: Category[] = [];
  try {
    parsed = JSON.parse(savedJson);
  } catch (e) {
    return getInitialStandardsProducts();
  }
  
  if (!Array.isArray(parsed)) return getInitialStandardsProducts();

  // Filter out any obsolete categories
  parsed = parsed.filter(cat => 
    cat &&
    cat.name &&
    cat.name.toLowerCase() !== "coating accessories" && 
    cat.name.toLowerCase() !== "safety accessories" &&
    cat.name.toLowerCase() !== "all thread & stud" &&
    cat.name.toLowerCase() !== "all thread & studs" &&
    cat.name.toLowerCase() !== "shear studs" &&
    cat.name.toLowerCase() !== "welding stud" &&
    cat.name.toLowerCase() !== "full thread plug"
  );

  const initial = getInitialStandardsProducts();

  // Merge any missing categories and deep-merge subcategories/threadTypes
  initial.forEach(initialCat => {
    const existingCat = parsed.find(parsedCat => 
      parsedCat && 
      parsedCat.name && 
      parsedCat.name.toLowerCase() === initialCat.name.toLowerCase()
    );
    if (!existingCat) {
      parsed.push(initialCat);
    } else {
      if (!existingCat.subcategories) {
        existingCat.subcategories = [];
      }
      initialCat.subcategories.forEach(initialSub => {
        const existingSub = existingCat.subcategories.find(s => 
          s && s.name && s.name.toLowerCase() === initialSub.name.toLowerCase()
        );
        if (!existingSub) {
          existingCat.subcategories.push(initialSub);
        } else {
          // Merge threadTypes
          if (!existingSub.threadTypes) {
            existingSub.threadTypes = [];
          }
          initialSub.threadTypes.forEach(initialTt => {
            const existingTt = existingSub.threadTypes.find(t => 
              t && t.name && t.name.toLowerCase() === initialTt.name.toLowerCase()
            );
            if (!existingTt) {
              existingSub.threadTypes.push(initialTt);
            }
          });
        }
      });
    }
  });

  // Sort categories and their nested subcategories according to initial order
  parsed.sort((a, b) => {
    const idxA = initial.findIndex(cat => cat.name.toLowerCase() === a.name.toLowerCase());
    const idxB = initial.findIndex(cat => cat.name.toLowerCase() === b.name.toLowerCase());
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  parsed.forEach(cat => {
    const initialCat = initial.find(ic => ic.name.toLowerCase() === cat.name.toLowerCase());
    if (initialCat && cat.subcategories) {
      cat.subcategories.sort((a, b) => {
        const idxA = initialCat.subcategories.findIndex(is => is.name.toLowerCase() === a.name.toLowerCase());
        const idxB = initialCat.subcategories.findIndex(is => is.name.toLowerCase() === b.name.toLowerCase());
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
  });

  return parsed;
}

