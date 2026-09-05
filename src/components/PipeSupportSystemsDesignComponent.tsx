import React, { useState, useMemo } from 'react';
import { 
  Ruler, FileCheck, Check, Printer, Info, HelpCircle, AlertCircle, Sparkles, Sliders, List, Grid3X3, Copy, Plus, Trash2, Edit2, Search, X, Layers, Settings, Activity, Compass, ShieldCheck
} from 'lucide-react';

export interface PipeSupportCategory {
  id: string;
  name: string;
  description: string;
  columns: string[]; // List of specific columns to show
}

export interface PipeSupportItem {
  id: string;
  categoryId: string; // matches Category.id
  partNo: string;
  description: string;
  
  // Dimensional and physical fields (various combinations depending on type)
  sizeInches?: string;
  rodSize?: string;
  boltSize?: string;
  hMm?: number;
  dMm?: number;
  upperSteel?: string;
  lowerSteel?: string;
  finish?: string;
  marking?: string;
  unit: string;
  
  gVal?: string;
  stripSize?: string;
  safeLoadKn?: number;
  breakLoadKn?: number;
  dRange?: string;
  aMm?: number;
  bMm?: number;
  txB?: string;
  cMm?: number;
  nutSize?: string;
  dInches?: string;
  maxLoadKn?: number;
  
  pipeSizeIn?: string;
  pipeSizeMm?: number;
  pipeOD?: number;
  widthW?: number;
  totalOdA?: number;
  thickness?: string;
  brand?: string;
  
  lengthMm?: number;
  metalSize?: string;
  lMm?: number;
  dLVal?: string;
  l2Mm?: number;
  dVal?: string;
  eMm?: number;
  fMm?: number;
  hLower?: number;
  bLower?: string;
  sVal?: string;
  lM1?: string;
  sW1?: string;
  sizeVal?: string;
  plateWidth?: number;
  holeDia?: string;
  threadsVal?: string;
  clampRange?: string;
  clampRangeMm?: string;
  clampRangeIn?: string;
  deflection?: string;
  recLoadKg?: number;
  maxLoadKg?: number;
  springColor?: string;
  d1Mm?: number;
  fhVal?: string;
  pipeConduitSize?: string;
  rackLocation?: string;
  rMm?: number;
  wMm?: number;
  h1_MM?: number;
  h2_MM?: number;

  // Inventory numbers
  openingStock: number;
  incomingStock: number;
  outgoingStock: number;
  unitWeight: number; // in KG
  tallyQty?: number;
}

export function getColumnHeader(catId: string, colKey: string): string {
  if (colKey === 'finish') return "FINISH";

  // 1. CLEVIS HANGER
  if (catId === 'clevis_hanger') {
    if (colKey === 'dVal') return "DIA D";
    if (colKey === 'sizeInches') return "Size (Inches)";
    if (colKey === 'rodSize') return "Rod Hole Size";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'hMm') return "H (mm)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'upperSteel') return "Upper Steel (mm)";
    if (colKey === 'lowerSteel') return "Lower Steel (mm)";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 2. CLEVIS HANGER WITH LINING
  if (catId === 'clevis_hanger_lining') {
    if (colKey === 'sizeInches') return "Size (Inches)";
    if (colKey === 'rodSize') return "Rod Hole Size";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'hMm') return "H (mm)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'upperSteel') return "Upper Steel (mm)";
    if (colKey === 'lowerSteel') return "Lower Steel (mm)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 3. SPRINKLER CLAMP
  if (catId === 'sprinkler_clamp') {
    if (colKey === 'sizeInches') return "Size (Inches)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'gVal') return "G";
    if (colKey === 'stripSize') return "Std. Strip size (mm)";
    if (colKey === 'hMm') return "H (mm)";
    if (colKey === 'safeLoadKn') return "Safe Load (kN)";
    if (colKey === 'breakLoadKn') return "Break Load (kN)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 4. SPLIT CLAMP WITH EPDM LINING
  if (catId === 'split_clamp_epdm') {
    if (colKey === 'sizeInches') return "Size (Inches)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'dRange') return "D Range (mm)";
    if (colKey === 'aMm') return "A (mm)";
    if (colKey === 'txB') return "t x B (mm)";
    if (colKey === 'cMm') return "C (mm)";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'nutSize') return "Nut Size";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 5. PLAIN SPLIT CLAMP
  if (catId === 'plain_split_clamp') {
    if (colKey === 'sizeInches') return "Size (Inches)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'dRange') return "D Range (mm)";
    if (colKey === 'aMm') return "A (mm)";
    if (colKey === 'txB') return "t x B (mm)";
    if (colKey === 'cMm') return "C (mm)";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'nutSize') return "Nut Size";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 6. U STRAP HANGER
  if (catId === 'u_strap_hanger') {
    if (colKey === 'dInches') return "D (Inches)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'aMm') return "A (mm)";
    if (colKey === 'bMm') return "B (mm)";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'stripSize') return "Standard Strip Size";
    if (colKey === 'maxLoadKn') return "Max Load (kN)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 7. U STRAP HANGER WITH LINING
  if (catId === 'u_strap_hanger_lining') {
    if (colKey === 'dInches') return "D (Inches)";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'aMm') return "A (mm)";
    if (colKey === 'bMm') return "B (mm)";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'stripSize') return "Standard Strip Size";
    if (colKey === 'maxLoadKn') return "Max Load (kN)";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 8. RUBBER SUPPORT INSERT
  if (catId === 'rubber_support_insert') {
    if (colKey === 'pipeSizeIn') return "Pipe Size (inches)";
    if (colKey === 'pipeSizeMm') return "Pipe Size (mm)";
    if (colKey === 'pipeOD') return "Pipe OD (mm)";
    if (colKey === 'widthW') return "Width W (mm)";
    if (colKey === 'totalOdA') return "Total OD A (mm)";
    if (colKey === 'thickness') return "THICKNESS";
    if (colKey === 'brand') return "BRAND";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking2') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 9. RISER HANGER WITH LINING
  if (catId === 'riser_hanger_lining') {
    if (colKey === 'dInches') return "D (Inches)";
    if (colKey === 'lengthMm') return "Length (mm)";
    if (colKey === 'metalSize') return "Metal Size (mm)";
    if (colKey === 'boltSize') return "Bolt Size (mm)";
    if (colKey === 'maxLoadKn') return "Max Load (kN)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 10. RISER HANGER
  if (catId === 'riser_hanger') {
    if (colKey === 'dInches') return "D (Inches)";
    if (colKey === 'lengthMm') return "Length (mm)";
    if (colKey === 'metalSize') return "Metal Size (mm)";
    if (colKey === 'boltSize') return "Bolt Size (mm)";
    if (colKey === 'maxLoadKn') return "Max Load (kN)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 11. ANCHOR BOLT SLEEVE
  if (catId === 'anchor_bolt_sleeve') {
    if (colKey === 'sizeInches') return "Size (mm)";
    if (colKey === 'lengthMm') return "L (mm)";
    if (colKey === 'dLVal') return "D (L)";
    if (colKey === 'boltSize') return "Bolt Size";
    if (colKey === 'l2Mm') return "L2";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 12. U BOLT BEAM CLAMP TYPE-1
  if (catId === 'u_bolt_beam_clamp_t1') {
    if (colKey === 'dVal') return "D";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'cMm') return "C";
    if (colKey === 'eMm') return "E";
    if (colKey === 'fMm') return "F";
    if (colKey === 'gVal') return "G";
    if (colKey === 'hMm') return "H";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 13. U BOLT BEAM CLAMP TYPE-2
  if (catId === 'u_bolt_beam_clamp_t2') {
    if (colKey === 'aMm') return "A";
    if (colKey === 'gVal') return "G";
    if (colKey === 'lMm') return "L";
    if (colKey === 'bMm') return "B";
    if (colKey === 'hMm') return "H";
    if (colKey === 'bLower') return "b";
    if (colKey === 'sVal') return "s";
    if (colKey === 'lM1') return "Lm1";
    if (colKey === 'sW1') return "SW1";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 14. THREAD ROD BEAM CLAMP
  if (catId === 'thread_rod_beam_clamp') {
    if (colKey === 'sizeInches') return "SIZE";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 15. UNISTRUT CHANNEL CLAMP
  if (catId === 'unistrut_channel_clamp') {
    if (colKey === 'pipeSizeIn') return "Pipe Size (inches)";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'plateWidth') return "Plate Width";
    if (colKey === 'cMm') return "C";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'unit') return "UNIT";
  }

  // 16. TUBE CLAMPS
  if (catId === 'tube_clamps') {
    if (colKey === 'sizeVal') return "SIZE";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 17. HEAVY DUTY PIPE CLAMPS
  if (catId === 'heavy_duty_pipe_clamps') {
    if (colKey === 'pipeSizeIn') return "Nominal Pipe Size (In)";
    if (colKey === 'pipeSizeMm') return "Nominal Pipe Size (mm)";
    if (colKey === 'pipeOD') return "Pipe OD";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'cMm') return "C";
    if (colKey === 'dMm') return "D";
    if (colKey === 'eMm') return "E";
    if (colKey === 'rMm') return "R";
    if (colKey === 'lengthMm') return "L";
    if (colKey === 'holeDia') return "Hole Dia";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 18. HEAVY DUTY DOUBLE BOLT CLAMP
  if (catId === 'heavy_duty_double_bolt_clamp') {
    if (colKey === 'pipeSizeIn') return "Nominal Pipe Size (In)";
    if (colKey === 'pipeSizeMm') return "Nominal Pipe Size (mm)";
    if (colKey === 'pipeOD') return "Pipe OD";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'cMm') return "C";
    if (colKey === 'dMm') return "D";
    if (colKey === 'eMm') return "E";
    if (colKey === 'sVal') return "s";
    if (colKey === 'holeDia') return "Hole Dia";
    if (colKey === 'threadsVal') return "Threads";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 19. T BOLT CLAMPS
  if (catId === 't_bolt_clamps') {
    if (colKey === 'clampRange') return "Clamping Range";
    if (colKey === 'dMm') return "D (mm)";
    if (colKey === 'dInches') return "D (in)";
    if (colKey === 'lMm') return "L (mm)";
    if (colKey === 'sVal') return "s (mm)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 20. RETAINING HOSE CLAMPS
  if (catId === 'retaining_hose_clamps') {
    if (colKey === 'clampRangeMm') return "Clamping Range (mm)";
    if (colKey === 'clampRangeIn') return "Clamping range (in)";
    if (colKey === 'finish') return "Finish";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 21. OFFSET PIPE CLAMP
  if (catId === 'offset_pipe_clamp') {
    if (colKey === 'pipeSizeIn') return "Nominal Pipe Size (In)";
    if (colKey === 'pipeSizeMm') return "Nominal Pipe Size (mm)";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'cMm') return "C";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 22. ANTI VIBRATION HANGER MOUNT
  if (catId === 'anti_vibration_hanger_mount') {
    if (colKey === 'deflection') return "Deflection (mm)";
    if (colKey === 'rodSize') return "Rod Size (mm)";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'cMm') return "C";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 23. RIBBED MOUNTING PAD
  if (catId === 'ribbed_mounting_pad') {
    if (colKey === 'sizeInches') return "Size Inches";
    if (colKey === 'recLoadKg') return "Rec Load (Kgs)";
    if (colKey === 'maxLoadKg') return "Max Load Kgs";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 24. METAL SANDWICH PAD
  if (catId === 'metal_sandwich_pad') {
    if (colKey === 'sizeInches') return "Size Inches";
    if (colKey === 'recLoadKg') return "Rec Load (Kgs)";
    if (colKey === 'maxLoadKg') return "Max Load Kgs";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 25. WAFFLE PAD
  if (catId === 'waffle_pad') {
    if (colKey === 'sizeInches') return "Size Inches";
    if (colKey === 'recLoadKg') return "Rec Load (Kgs)";
    if (colKey === 'maxLoadKg') return "Max Load Kgs";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 26. RIBBED MULTI-LAYER PAD
  if (catId === 'ribbed_multi_layer_pad') {
    if (colKey === 'sizeInches') return "Size Inches";
    if (colKey === 'recLoadKg') return "Rec Load (Kgs)";
    if (colKey === 'deflection') return "Deflection (mm)";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 27. CORK SANDWICH PAD
  if (catId === 'cork_sandwich_pad') {
    if (colKey === 'sizeInches') return "Size Inches";
    if (colKey === 'recLoadKg') return "Rec Load (Kgs)";
    if (colKey === 'maxLoadKg') return "Max Load Kgs";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 28. VIBRATION SPRING FLEX & NEOPRENE HANGER
  if (catId === 'vibration_spring_flex_neoprene') {
    if (colKey === 'springColor') return "Spring Color";
    if (colKey === 'lMm') return "L";
    if (colKey === 'wMm') return "W";
    if (colKey === 'hMm') return "H";
    if (colKey === 'h1_MM') return "h1";
    if (colKey === 'h2_MM') return "h2";
    if (colKey === 'dVal') return "D";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 29. VIBRATION SPRING FLEX HANGER
  if (catId === 'vibration_spring_flex_hanger') {
    if (colKey === 'deflection') return "Deflection (mm)";
    if (colKey === 'rodSize') return "Rod Size (mm)";
    if (colKey === 'springColor') return "Color";
    if (colKey === 'lMm') return "L";
    if (colKey === 'bMm') return "B";
    if (colKey === 'hMm') return "H";
    if (colKey === 'd1Mm') return "d1";
    if (colKey === 'fhVal') return "FH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 30. VIBRATION HANGER NEOPRENE
  if (catId === 'vibration_hanger_neoprene') {
    if (colKey === 'deflection') return "Deflection (mm)";
    if (colKey === 'rodSize') return "Rod Size (mm)";
    if (colKey === 'bMm') return "B";
    if (colKey === 'hMm') return "H";
    if (colKey === 'hLower') return "h";
    if (colKey === 'springColor') return "Color";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  // 31. RIGHT ANGLE CLAMP
  if (catId === 'right_angle_clamp') {
    if (colKey === 'pipeConduitSize') return "Pipe/Rigid Conduit Size";
    if (colKey === 'aMm') return "A";
    if (colKey === 'bMm') return "B";
    if (colKey === 'cMm') return "C";
    if (colKey === 'finish') return "FINISH";
    if (colKey === 'marking') return "MARKING";
    if (colKey === 'unit') return "UNIT";
  }

  const fallbackMap: Record<string, string> = {
    partNo: "PART NO",
    description: "DESCRIPTION",
    sizeInches: "Size (Inches)",
    rodSize: "Rod Size",
    boltSize: "Bolt Size",
    hMm: "H (mm)",
    dMm: "D (mm)",
    upperSteel: "Upper Steel (mm)",
    lowerSteel: "Lower Steel (mm)",
    finish: "FINISH",
    marking: "MARKING",
    unit: "UNIT",
    gVal: "G",
    stripSize: "Std. Strip size (mm)",
    safeLoadKn: "Safe Load (kN)",
    breakLoadKn: "Break Load (kN)",
    dRange: "D Range (mm)",
    aMm: "A (mm)",
    txB: "t x B (mm)",
    cMm: "C (mm)",
    nutSize: "Nut Size",
    dInches: "D (Inches)",
    maxLoadKn: "Max Load (kN)",
    pipeSizeIn: "Pipe Size (Inches)",
    pipeSizeMm: "Pipe Size (mm)",
    pipeOD: "Pipe OD (mm)",
    widthW: "Width W (mm)",
    totalOdA: "Total OD A (mm)",
    thickness: "THICKNESS",
    brand: "BRAND",
    lengthMm: "Length (mm)",
    metalSize: "Metal Size (mm)",
    dLVal: "D (L)",
    l2Mm: "L2",
    dVal: "D",
    eMm: "E",
    fMm: "F",
    hLower: "h (mm)",
    bLower: "b",
    sVal: "s",
    lM1: "Lm1",
    sW1: "SW1",
    sizeVal: "SIZE",
    plateWidth: "Plate Width",
    holeDia: "Hole Dia",
    threadsVal: "Threads",
    clampRange: "Clamping Range",
    clampRangeMm: "Clamping Range (mm)",
    clampRangeIn: "Clamping range (in)",
    deflection: "Deflection (mm)",
    recLoadKg: "Rec Load (Kgs)",
    maxLoadKg: "Max Load Kgs",
    springColor: "Spring Color",
    d1Mm: "d1",
    fhVal: "FH",
    pipeConduitSize: "Pipe/Rigid Conduit Size",
    lMm: "L",
    wMm: "W",
    h1_MM: "h1",
    h2_MM: "h2",
    bMm: "B"
  };

  return fallbackMap[colKey] || colKey.toUpperCase();
}

export function renderCellValue(item: PipeSupportItem, colKey: string, catId: string): React.ReactNode {
  const val = colKey === 'marking2' ? item.marking : item[colKey as keyof PipeSupportItem];
  if (val === undefined || val === null || val === '') return '—';

  // Specific formats
  if (colKey === 'safeLoadKn' || colKey === 'breakLoadKn' || colKey === 'maxLoadKn') {
    return `${val} kN`;
  }
  if (colKey === 'recLoadKg' || colKey === 'maxLoadKg') {
    return `${val} Kgs`;
  }
  if (colKey === 'unit') {
    return String(val).toUpperCase();
  }
  if (colKey === 'finish') {
    return String(val).toUpperCase();
  }
  if (colKey === 'marking' || colKey === 'marking2') {
    return String(val).toUpperCase();
  }
  if (colKey === 'springColor') {
    return (
      <span className={`px-2 py-0.5 text-[8.5px] font-bold border text-white ${
        val === 'RED' ? 'bg-red-600 border-red-700' :
        val === 'YELLOW' ? 'bg-yellow-500 text-slate-900 border-yellow-600' :
        val === 'BLUE' ? 'bg-blue-600 border-blue-700' : 'bg-slate-500'
      }`}>
        {String(val)}
      </span>
    );
  }

  return String(val);
}

const DEFAULT_PIPE_SUPPORT_CATEGORIES: PipeSupportCategory[] = [
  { id: 'clevis_hanger', name: 'CLEVIS HANGER', description: 'Standard hanging support for non-insulated steel lines.', columns: ['dVal', 'sizeInches', 'rodSize', 'boltSize', 'hMm', 'dMm', 'upperSteel', 'lowerSteel', 'marking', 'unit'] },
  { id: 'clevis_hanger_lining', name: 'CLEVIS HANGER WITH LINING', description: 'Clevis assembly featuring vibration dampening rubber strip lining.', columns: ['sizeInches', 'rodSize', 'boltSize', 'hMm', 'dMm', 'upperSteel', 'lowerSteel', 'finish', 'marking', 'unit'] },
  { id: 'sprinkler_clamp', name: 'SPRINKLER CLAMP', description: 'Quick-loop mechanical band clamp specifically matching fire protection sprinklers.', columns: ['sizeInches', 'dMm', 'gVal', 'stripSize', 'hMm', 'safeLoadKn', 'breakLoadKn', 'finish', 'marking', 'unit'] },
  { id: 'split_clamp_epdm', name: 'SPLIT CLAMP WITH EPDM LINING', description: 'Two-bolt pipe split collar insulated by robust ribbed EPDM profiles.', columns: ['sizeInches', 'dMm', 'dRange', 'aMm', 'txB', 'cMm', 'boltSize', 'nutSize', 'finish', 'marking', 'unit'] },
  { id: 'plain_split_clamp', name: 'PLAIN SPLIT CLAMP', description: 'Standard unlined metal split collar with double side fastener connection.', columns: ['sizeInches', 'dMm', 'dRange', 'aMm', 'txB', 'cMm', 'boltSize', 'nutSize', 'finish', 'marking', 'unit'] },
  { id: 'u_strap_hanger', name: 'U STRAP HANGER', description: 'Heavy-duty steel strap u-type suspension hangers for process piping.', columns: ['dInches', 'dMm', 'aMm', 'bMm', 'boltSize', 'stripSize', 'maxLoadKn', 'finish', 'marking', 'unit'] },
  { id: 'u_strap_hanger_lining', name: 'U STRAP HANGER WITH LINING', description: 'Suspension hanger with soft elastomer insulation strip.', columns: ['dInches', 'dMm', 'aMm', 'bMm', 'boltSize', 'stripSize', 'maxLoadKn', 'marking', 'unit'] },
  { id: 'rubber_support_insert', name: 'RUBBER SUPPORT INSERT', description: 'High-density load bearing vulcanized rubber shield support block.', columns: ['pipeSizeIn', 'pipeSizeMm', 'pipeOD', 'widthW', 'totalOdA', 'thickness', 'brand', 'marking', 'finish', 'marking2', 'unit'] },
  { id: 'riser_hanger_lining', name: 'RISER HANGER WITH LINING', description: 'Vertical line support clamping structure insulated with sound isolation EPDM.', columns: ['dInches', 'lengthMm', 'metalSize', 'boltSize', 'maxLoadKn', 'finish', 'marking', 'unit'] },
  { id: 'riser_hanger', name: 'RISER HANGER', description: 'Standard carbon steel dual side ear extensions vertical clamping hanger.', columns: ['dInches', 'lengthMm', 'metalSize', 'boltSize', 'maxLoadKn', 'finish', 'marking', 'unit'] },
  { id: 'anchor_bolt_sleeve', name: 'ANCHOR BOLT SLEEVE', description: 'High performance structural anchor sleeves accommodating thread expansion.', columns: ['sizeInches', 'lengthMm', 'dLVal', 'boltSize', 'l2Mm', 'finish', 'marking', 'unit'] },
  { id: 'u_bolt_beam_clamp_t1', name: 'U BOLT BEAM CLAMP TYPE-1', description: 'Heavy beam anchorage using square bend u-bolts paired with backplate clamps.', columns: ['dVal', 'aMm', 'bMm', 'cMm', 'eMm', 'fMm', 'gVal', 'hMm', 'finish', 'marking', 'unit'] },
  { id: 'u_bolt_beam_clamp_t2', name: 'U BOLT BEAM CLAMP TYPE-2', description: 'Alternative jaw angle structure suited for tapered standard structural channel flanges.', columns: ['aMm', 'gVal', 'lMm', 'bMm', 'hMm', 'bLower', 'sVal', 'lM1', 'sW1', 'finish', 'marking', 'unit'] },
  { id: 'thread_rod_beam_clamp', name: 'THREAD ROD BEAM CLAMP', description: 'Malleable iron casting structural beam attachment with set screw.', columns: ['sizeInches', 'finish', 'marking', 'unit'] },
  { id: 'unistrut_channel_clamp', name: 'UNISTRUT CHANNEL CLAMP', description: 'Standard multi-size channel pipe clamps engineered for 41x41 slot profiles.', columns: ['pipeSizeIn', 'aMm', 'bMm', 'plateWidth', 'cMm', 'marking', 'finish', 'unit'] },
  { id: 'tube_clamps', name: 'TUBE CLAMPS', description: 'Polished split modular metric hydraulic rigid tubes brackets.', columns: ['sizeVal', 'finish', 'marking', 'unit'] },
  { id: 'heavy_duty_pipe_clamps', name: 'HEAVY DUTY PIPE CLAMPS', description: 'Three-bolt flat bar heavy support clamps for chemical process lines.', columns: ['pipeSizeIn', 'pipeSizeMm', 'pipeOD', 'aMm', 'bMm', 'cMm', 'dMm', 'eMm', 'rMm', 'lengthMm', 'holeDia', 'finish', 'marking', 'unit'] },
  { id: 'heavy_duty_double_bolt_clamp', name: 'HEAVY DUTY DOUBLE BOLT CLAMP', description: 'Rugged high-load split clamp utilizing dual securing carriage fasteners.', columns: ['pipeSizeIn', 'pipeSizeMm', 'pipeOD', 'aMm', 'bMm', 'cMm', 'dMm', 'eMm', 'sVal', 'holeDia', 'threadsVal', 'finish', 'marking', 'unit'] },
  { id: 't_bolt_clamps', name: 'T BOLT CLAMPS', description: 'Industrial high torque circular duct clamps with integrated t-bolt pivot lock.', columns: ['clampRange', 'dMm', 'dInches', 'lMm', 'sVal', 'finish', 'marking', 'unit'] },
  { id: 'retaining_hose_clamps', name: 'RETAINING HOSE CLAMPS', description: 'Worm-drive helical steel gear banding with flexible sizing range.', columns: ['clampRangeMm', 'clampRangeIn', 'finish', 'marking', 'unit'] },
  { id: 'offset_pipe_clamp', name: 'OFFSET PIPE CLAMP', description: 'Flat bar stand-off support maintaining clearance from wall backings.', columns: ['pipeSizeIn', 'pipeSizeMm', 'aMm', 'bMm', 'cMm', 'finish', 'marking', 'unit'] },
  { id: 'anti_vibration_hanger_mount', name: 'ANTI VIBRATION HANGER MOUNT', description: 'Resilient isolation mount with compression rubber blocks or springs.', columns: ['deflection', 'rodSize', 'aMm', 'bMm', 'cMm', 'finish', 'marking', 'unit'] },
  { id: 'ribbed_mounting_pad', name: 'RIBBED MOUNTING PAD', description: 'Serrated chloroprene structural pads absorbing industrial machineries vibrations.', columns: ['sizeInches', 'recLoadKg', 'maxLoadKg', 'finish', 'marking', 'unit'] },
  { id: 'metal_sandwich_pad', name: 'METAL SANDWICH PAD', description: 'Rubber isolation pad reinforced with structural outer steel plates.', columns: ['sizeInches', 'recLoadKg', 'maxLoadKg', 'finish', 'marking', 'unit'] },
  { id: 'waffle_pad', name: 'WAFFLE PAD', description: 'Grid-pattern elastomer isolation sheet with high pressure dampening.', columns: ['sizeInches', 'recLoadKg', 'maxLoadKg', 'finish', 'marking', 'unit'] },
  { id: 'ribbed_multi_layer_pad', name: 'RIBBED MULTI-LAYER PAD', description: 'Alternating composite stack of ribbed rubber and metal plates.', columns: ['sizeInches', 'recLoadKg', 'deflection', 'finish', 'marking', 'unit'] },
  { id: 'cork_sandwich_pad', name: 'CORK SANDWICH PAD', description: 'Composite acoustic pad featuring a high-density natural cork center core.', columns: ['sizeInches', 'recLoadKg', 'maxLoadKg', 'finish', 'marking', 'unit'] },
  { id: 'vibration_spring_flex_neoprene', name: 'VIBRATION SPRING FLEX & NEOPRENE HANGER', description: 'Combined structural support featuring a steel coil spring & neoprene sleeve.', columns: ['springColor', 'lMm', 'wMm', 'hMm', 'h1_MM', 'h2_MM', 'dVal', 'finish', 'marking', 'unit'] },
  { id: 'vibration_spring_flex_hanger', name: 'VIBRATION SPRING FLEX HANGER', description: 'Helical spring hanger protecting high vibration steam pipelines.', columns: ['deflection', 'rodSize', 'springColor', 'lMm', 'bMm', 'hMm', 'd1Mm', 'fhVal', 'marking', 'unit'] },
  { id: 'vibration_hanger_neoprene', name: 'VIBRATION HANGER NEOPRENE', description: 'Compact ceiling suspension hanger featuring an elastomeric acoustic cup.', columns: ['deflection', 'rodSize', 'bMm', 'hMm', 'hLower', 'springColor', 'finish', 'marking', 'unit'] },
  { id: 'right_angle_clamp', name: 'RIGHT ANGLE CLAMP', description: '90-degree heavy conduit bracket pairing structural channel clamps.', columns: ['pipeConduitSize', 'aMm', 'bMm', 'cMm', 'finish', 'marking', 'unit'] }
];

export default function PipeSupportSystemsDesignComponent() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'designer'>('matrix');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [matrixSearch, setMatrixSearch] = useState('');
  
  const [categories, setCategories] = useState<PipeSupportCategory[]>(() => {
    const saved = localStorage.getItem('MF_PIPE_SUPPORT_CATEGORIES_STATE');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse categories", e);
      }
    }
    return DEFAULT_PIPE_SUPPORT_CATEGORIES;
  });

  React.useEffect(() => {
    localStorage.setItem('MF_PIPE_SUPPORT_CATEGORIES_STATE', JSON.stringify(categories));
  }, [categories]);

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [catEditName, setCatEditName] = useState('');
  const [catEditDesc, setCatEditDesc] = useState('');

  const handleStartEditCategory = () => {
    const cat = categories.find(c => c.id === selectedCategoryId);
    if (cat) {
      setCatEditName(cat.name);
      setCatEditDesc(cat.description || '');
      setIsEditingCategory(true);
    }
  };

  const handleSaveCategoryInfo = () => {
    if (!catEditName.trim()) return;
    setCategories(prev => prev.map(c => c.id === selectedCategoryId ? { ...c, name: catEditName.trim().toUpperCase(), description: catEditDesc.trim() } : c));
    setIsEditingCategory(false);
  };

  const getSubcategoryInitialData = (catId: string): PipeSupportItem[] => {
    switch (catId) {
      case 'clevis_hanger':
        return [
          { id: 'CH-1001', categoryId: 'clevis_hanger', partNo: 'MFI-CH-M16-04', description: 'CARBON STEEL CLEVIS HANGER', dVal: 'M16', sizeInches: '4"', rodSize: 'M16', boltSize: 'M12', hMm: 165, dMm: 115, upperSteel: '5.0x32', lowerSteel: '4.0x32', marking: 'MFI 4"', unit: 'PCS', openingStock: 450, incomingStock: 1200, outgoingStock: 650, unitWeight: 0.85, rackLocation: 'A-12-05' },
          { id: 'CH-1002', categoryId: 'clevis_hanger', partNo: 'MFI-CH-M20-06', description: 'HEAVY REINFORCED CLEVIS HANGER', dVal: 'M20', sizeInches: '6"', rodSize: 'M20', boltSize: 'M16', hMm: 210, dMm: 168, upperSteel: '6.0x40', lowerSteel: '5.0x40', marking: 'MFI 6"', unit: 'PCS', openingStock: 240, incomingStock: 800, outgoingStock: 220, unitWeight: 1.55, rackLocation: 'A-12-06' }
        ];
      case 'clevis_hanger_lining':
        return [
          { id: 'CHL-1001', categoryId: 'clevis_hanger_lining', partNo: 'MFI-CHL-M12-02', description: 'RUBBER INSULATED CLEVIS HANGER', sizeInches: '2"', rodSize: 'M12', boltSize: 'M10', hMm: 105, dMm: 60, upperSteel: '4.0x25', lowerSteel: '3.0x25', finish: 'GALVANIZED', marking: 'MFI-L 2"', unit: 'PCS', openingStock: 600, incomingStock: 1500, outgoingStock: 800, unitWeight: 0.42, rackLocation: 'A-13-11' },
          { id: 'CHL-1002', categoryId: 'clevis_hanger_lining', partNo: 'MFI-CHL-M16-08', description: 'EPDM LINED HEAVY CLEVIS HANGER', sizeInches: '8"', rodSize: 'M16', boltSize: 'M12', hMm: 265, dMm: 220, upperSteel: '6.0x45', lowerSteel: '5.0x45', finish: 'HDG', marking: 'MFI-L 8"', unit: 'PCS', openingStock: 180, incomingStock: 400, outgoingStock: 150, unitWeight: 2.30, rackLocation: 'A-13-14' }
        ];
      case 'sprinkler_clamp':
        return [
          { id: 'SC-1001', categoryId: 'sprinkler_clamp', partNo: 'MFI-SC-01', description: 'STEEL BAND LOOP SPRINKLER CLAMP', sizeInches: '1-1/2"', dMm: 48, gVal: 'M10', stripSize: '1.2x25', hMm: 85, safeLoadKn: 2.2, breakLoadKn: 6.8, finish: 'PRE-GALVANIZED', marking: 'MFI-SP 1.5"', unit: 'PCS', openingStock: 1500, incomingStock: 5000, outgoingStock: 2500, unitWeight: 0.11, rackLocation: 'B-04-01' },
          { id: 'SC-1002', categoryId: 'sprinkler_clamp', partNo: 'MFI-SC-02', description: 'SPRINKLER PIPE HANGER PROFILE', sizeInches: '3"', dMm: 89, gVal: 'M12', stripSize: '1.5x25', hMm: 145, safeLoadKn: 4.5, breakLoadKn: 13.5, finish: 'ELECTRO-PLATED', marking: 'MFI-SP 3"', unit: 'PCS', openingStock: 900, incomingStock: 3000, outgoingStock: 1200, unitWeight: 0.23, rackLocation: 'B-04-03' }
        ];
      case 'split_clamp_epdm':
        return [
          { id: 'SCE-1001', categoryId: 'split_clamp_epdm', partNo: 'MFI-SCE-54', description: 'EPDM LINED CLAMP METRIC SYSTEM', sizeInches: '2"', dMm: 54, dRange: '50-56', aMm: 88, txB: '2.0x20', cMm: 25, boltSize: 'M6', nutSize: 'M8/M12', finish: 'ZINC PLATED', marking: 'MFI 50-56', unit: 'PCS', openingStock: 1200, incomingStock: 4500, outgoingStock: 2000, unitWeight: 0.16, rackLocation: 'C-08-11' },
          { id: 'SCE-1002', categoryId: 'split_clamp_epdm', partNo: 'MFI-SCE-114', description: 'DUAL THREADED EPDM SPLIT CLAMP', sizeInches: '4"', dMm: 114, dRange: '110-116', aMm: 148, txB: '2.5x25', cMm: 28, boltSize: 'M8', nutSize: 'M10/M12', finish: 'ZINC PLATED', marking: 'MFI 110-116', unit: 'PCS', openingStock: 800, incomingStock: 2500, outgoingStock: 1100, unitWeight: 0.38, rackLocation: 'C-08-15' }
        ];
      case 'plain_split_clamp':
        return [
          { id: 'PSC-1001', categoryId: 'plain_split_clamp', partNo: 'MFI-PSC-60', description: 'CARBON STEEL PLAIN SPLIT CLAMP', sizeInches: '2"', dMm: 60, dRange: '57-63', aMm: 95, txB: '2.0x20', cMm: 25, boltSize: 'M6', nutSize: 'M8/M10', finish: 'EPOXY COATED', marking: 'MFI-P 60', unit: 'PCS', openingStock: 1000, incomingStock: 3000, outgoingStock: 800, unitWeight: 0.12, rackLocation: 'C-09-02' }
        ];
      case 'u_strap_hanger':
        return [
          { id: 'USH-1001', categoryId: 'u_strap_hanger', partNo: 'MFI-USH-03', description: 'U-STRAP SUSPENSION ELEMENT', dInches: '3"', dMm: 89, aMm: 130, bMm: 45, boltSize: 'M12', stripSize: '3.0x30', maxLoadKn: 4.8, finish: 'GALVANIZED', marking: 'MFI-USH 3"', unit: 'PCS', openingStock: 350, incomingStock: 1000, outgoingStock: 400, unitWeight: 0.44, rackLocation: 'D-02-14' }
        ];
      case 'u_strap_hanger_lining':
        return [
          { id: 'USHL-1001', categoryId: 'u_strap_hanger_lining', partNo: 'MFI-USHL-04', description: 'RUBBER BACKED U-STRAP HANGER', dInches: '4"', dMm: 114, aMm: 160, bMm: 50, boltSize: 'M12', stripSize: '3.0x35', maxLoadKn: 4.5, marking: 'MFI-USHL 4"', unit: 'PCS', openingStock: 280, incomingStock: 600, outgoingStock: 200, unitWeight: 0.62, rackLocation: 'D-03-02' }
        ];
      case 'rubber_support_insert':
        return [
          { id: 'RSI-1001', categoryId: 'rubber_support_insert', partNo: 'MFI-RSI-03', description: 'EPDM STRUCTURAL RUBBER BLOCK', pipeSizeIn: '3"', pipeSizeMm: 89, pipeOD: 89, widthW: 50, totalOdA: 169, thickness: '40MM', brand: 'MFI SEAL', finish: 'VULCANIZED', marking: 'MFI-RI 89', unit: 'PCS', openingStock: 420, incomingStock: 1500, outgoingStock: 500, unitWeight: 0.58, rackLocation: 'R-05-11' }
        ];
      case 'riser_hanger_lining':
        return [
          { id: 'RHL-1001', categoryId: 'riser_hanger_lining', partNo: 'MFI-RHL-04', description: 'EPDM RISER CO-CLAMP COMPONENT', dInches: '4"', lengthMm: 310, metalSize: '4.0x40', boltSize: 'M12', maxLoadKn: 5.5, finish: 'HDG', marking: 'MFI-RHL 4"', unit: 'PCS', openingStock: 150, incomingStock: 500, outgoingStock: 180, unitWeight: 1.25, rackLocation: 'E-03-01' }
        ];
      case 'riser_hanger':
        return [
          { id: 'RH-1001', categoryId: 'riser_hanger', partNo: 'MFI-RH-04', description: 'STEEL PIPELINE RISER CLAMP', dInches: '4"', lengthMm: 310, metalSize: '4.0x40', boltSize: 'M12', maxLoadKn: 6.0, finish: 'RED OXIDE', marking: 'MFI-RH 4"', unit: 'PCS', openingStock: 300, incomingStock: 900, outgoingStock: 400, unitWeight: 1.15, rackLocation: 'E-03-05' }
        ];
      case 'anchor_bolt_sleeve':
        return [
          { id: 'ABS-1001', categoryId: 'anchor_bolt_sleeve', partNo: 'MFI-ABS-16', description: 'ANCHOR EXPANSION BOLT SLEEVE', sizeInches: 'M16', lengthMm: 150, dLVal: '24', boltSize: 'M16', l2Mm: 45, finish: 'YELLOW ZINC', marking: 'MFI-ABS 16', unit: 'PCS', openingStock: 800, incomingStock: 2500, outgoingStock: 1200, unitWeight: 0.28, rackLocation: 'H-01-22' }
        ];
      case 'u_bolt_beam_clamp_t1':
        return [
          { id: 'UBB-1001', categoryId: 'u_bolt_beam_clamp_t1', partNo: 'MFI-UBB-T1', description: 'FLANGE MOUNTING HEAVY BEAM CLAMP', dVal: 'M12', aMm: 65, bMm: 40, cMm: 12, eMm: 50, fMm: 22, gVal: '150', hMm: 125, finish: 'GALVANIZED', marking: 'MFI-UBB1', unit: 'PCS', openingStock: 210, incomingStock: 800, outgoingStock: 350, unitWeight: 1.10, rackLocation: 'K-04-12' }
        ];
      case 'u_bolt_beam_clamp_t2':
        return [
          { id: 'UBBT2-1001', categoryId: 'u_bolt_beam_clamp_t2', partNo: 'MFI-UBB-T2', description: 'TAPERED CHANNEL BEAM CLAMP', aMm: 80, gVal: 'M16', lMm: 95, bMm: 45, hMm: 38, bLower: '18', sVal: '4.0', lM1: '25', sW1: '24', finish: 'HDG', marking: 'MFI-UBBT2', unit: 'PCS', openingStock: 140, incomingStock: 500, outgoingStock: 110, unitWeight: 1.82, rackLocation: 'K-04-15' }
        ];
      case 'thread_rod_beam_clamp':
        return [
          { id: 'TRC-1001', categoryId: 'thread_rod_beam_clamp', partNo: 'MFI-TRC-M10', description: 'MALLEABLE IRON CHANNEL CLAMP', sizeInches: 'M10', finish: 'ELECTRO-GALVANIZED', marking: 'MFI-TR 10', unit: 'PCS', openingStock: 950, incomingStock: 2000, outgoingStock: 850, unitWeight: 0.32, rackLocation: 'K-01-02' }
        ];
      case 'unistrut_channel_clamp':
        return [
          { id: 'UCC-1001', categoryId: 'unistrut_channel_clamp', partNo: 'MFI-UCC-02', description: 'UNISTRUT CHANNEL PIPELINE CLAMP', pipeSizeIn: '2"', aMm: 62, bMm: 35, plateWidth: 32, cMm: 6, marking: 'MFI-UC 2"', finish: 'HDG', unit: 'PCS', openingStock: 1100, incomingStock: 4000, outgoingStock: 2100, unitWeight: 0.22, rackLocation: 'U-02-09' }
        ];
      case 'tube_clamps':
        return [
          { id: 'TC-1001', categoryId: 'tube_clamps', partNo: 'MFI-TC-25', description: 'HYDRAULIC DOUBLE REFORCED CLAMP', sizeVal: '25MM', finish: 'PP BODY / STAINLESS STEEL', marking: 'MFI-TC 25', unit: 'PCS', openingStock: 500, incomingStock: 1500, outgoingStock: 600, unitWeight: 0.08, rackLocation: 'U-05-01' }
        ];
      case 'heavy_duty_pipe_clamps':
        return [
          { id: 'HDC-1001', categoryId: 'heavy_duty_pipe_clamps', partNo: 'MFI-HDC-114', description: '3-BOLT HEAVY CARBON CLAMP', pipeSizeIn: '4"', pipeSizeMm: 114, pipeOD: 114, aMm: 185, bMm: 35, cMm: 10, dMm: 12, eMm: 50, rMm: 57, lengthMm: 290, holeDia: '14MM', finish: 'SELF-COLORED', marking: 'MFI-HD 114', unit: 'PCS', openingStock: 150, incomingStock: 400, outgoingStock: 120, unitWeight: 2.85 }
        ];
      case 'heavy_duty_double_bolt_clamp':
        return [
          { id: 'HDB-1001', categoryId: 'heavy_duty_double_bolt_clamp', partNo: 'MFI-HDB-168', description: 'DOUBLE BOLT INDUSTRIAL SADDLE', pipeSizeIn: '6"', pipeSizeMm: 168, pipeOD: 168, aMm: 250, bMm: 45, cMm: 12, dMm: 16, eMm: 65, sVal: '6', holeDia: '18MM', threadsVal: 'M16', finish: 'RED OXIDE COATING', marking: 'MFI-HDB 168', unit: 'PCS', openingStock: 80, incomingStock: 300, outgoingStock: 90, unitWeight: 4.40 }
        ];
      case 't_bolt_clamps':
        return [
          { id: 'TBC-1001', categoryId: 't_bolt_clamps', partNo: 'MFI-TBC-76', description: 'T-BOLT SPIRAL VENTILATED PLATES', clampRange: '73-79MM', dMm: 76, dInches: '3"', lMm: 22, sVal: '0.8', finish: 'SS304 BRIGHT', marking: 'MFI-TB 73-79', unit: 'PCS', openingStock: 1200, incomingStock: 3500, outgoingStock: 1500, unitWeight: 0.14, rackLocation: 'W-03-01' }
        ];
      case 'retaining_hose_clamps':
        return [
          { id: 'RHC-1001', categoryId: 'retaining_hose_clamps', partNo: 'MFI-RHC-40', description: 'WORM GEAR HELICAL STEEL HOSE CLAMP', clampRangeMm: '25-40MM', clampRangeIn: '1" - 1-1/2"', finish: 'STAINLESS STEEL 316', marking: 'MFI-RHC 1.5"', unit: 'PCS', openingStock: 3000, incomingStock: 10000, outgoingStock: 4500, unitWeight: 0.03, rackLocation: 'W-05-12' }
        ];
      case 'offset_pipe_clamp':
        return [
          { id: 'OPC-1001', categoryId: 'offset_pipe_clamp', partNo: 'MFI-OPC-50', description: 'OFFSET COPPER PLATED PIPE HANGER', pipeSizeIn: '2"', pipeSizeMm: 50, aMm: 120, bMm: 45, cMm: 25, finish: 'COPPER PLATED', marking: 'MFI-OP 50', unit: 'PCS', openingStock: 450, incomingStock: 1200, outgoingStock: 500, unitWeight: 0.35, rackLocation: 'O-02-11' }
        ];
      case 'anti_vibration_hanger_mount':
        return [
          { id: 'AVM-1001', categoryId: 'anti_vibration_hanger_mount', partNo: 'MFI-AVM-M12', description: 'COMPRESSION RUBBER HANGER POD', deflection: '15MM', rodSize: 'M12', aMm: 65, bMm: 45, cMm: 40, finish: 'EPOXY SEALED', marking: 'MFI-AV-M12', unit: 'PCS', openingStock: 350, incomingStock: 1000, outgoingStock: 400, unitWeight: 0.65, rackLocation: 'V-01-08' }
        ];
      case 'ribbed_mounting_pad':
        return [
          { id: 'RMP-1001', categoryId: 'ribbed_mounting_pad', partNo: 'MFI-RMP-18', description: 'NEOPRENE COMPRESSION GRIDS PAD', sizeInches: '18x18x3/8"', recLoadKg: 1200, maxLoadKg: 3500, finish: 'RAW CHLOROPRENE', marking: 'MFI-PAD-18', unit: 'PCS', openingStock: 250, incomingStock: 600, outgoingStock: 150, unitWeight: 2.10 }
        ];
      case 'metal_sandwich_pad':
        return [
          { id: 'MSP-1001', categoryId: 'metal_sandwich_pad', partNo: 'MFI-MSP-12', description: 'INTERLEAVED SOLID INDUSTRIAL BLOCK', sizeInches: '12x12x1"', recLoadKg: 4500, maxLoadKg: 12000, finish: 'NEOPRENE / CARBON STEEL S355', marking: 'MFI-MSW-12', unit: 'PCS', openingStock: 120, incomingStock: 400, outgoingStock: 90, unitWeight: 5.40 }
        ];
      case 'waffle_pad':
        return [
          { id: 'WFP-1001', categoryId: 'waffle_pad', partNo: 'MFI-WFP-24', description: 'WAFFLE SECTION SHOCK PAD SHEET', sizeInches: '24x24x1/2"', recLoadKg: 1800, maxLoadKg: 5000, finish: 'NATURAL SLAB ELASTOMER', marking: 'MFI-WAF-24', unit: 'PCS', openingStock: 190, incomingStock: 500, outgoingStock: 140, unitWeight: 3.12 }
        ];
      case 'ribbed_multi_layer_pad':
        return [
          { id: 'RMLP-1001', categoryId: 'ribbed_multi_layer_pad', partNo: 'MFI-RML-12', description: 'TRIPLE STACK COMPOSITE ISOLATOR', sizeInches: '12x12x2"', recLoadKg: 3200, deflection: '8', finish: 'RIB CUSHION PLATINUM', marking: 'MFI-RML-12', unit: 'PCS', openingStock: 90, incomingStock: 300, outgoingStock: 70, unitWeight: 6.80 }
        ];
      case 'cork_sandwich_pad':
        return [
          { id: 'CSP-1001', categoryId: 'cork_sandwich_pad', partNo: 'MFI-CSP-08', description: 'CORK-NEOPRENE COMPOSITE BASE', sizeInches: '8x8x2"', recLoadKg: 850, maxLoadKg: 2200, finish: 'CORK CORE RESILIENT', marking: 'MFI-CSW-8', unit: 'PCS', openingStock: 400, incomingStock: 1200, outgoingStock: 300, unitWeight: 0.95 }
        ];
      case 'vibration_spring_flex_neoprene':
        return [
          { id: 'VSFN-1001', categoryId: 'vibration_spring_flex_neoprene', partNo: 'MFI-VSF-RED', description: 'HIGH STRETCH SPRING NEOPRENE HANGER', springColor: 'RED', lMm: 120, wMm: 75, hMm: 180, h1_MM: 45, h2_MM: 38, dVal: 'M16', finish: 'RED COATED / NEOPRENE SLEEVE', marking: 'MFI-VSFN-RED', unit: 'PCS', openingStock: 110, incomingStock: 400, outgoingStock: 120, unitWeight: 3.20, rackLocation: 'V-03-01' }
        ];
      case 'vibration_spring_flex_hanger':
        return [
          { id: 'VSFH-1001', categoryId: 'vibration_spring_flex_hanger', partNo: 'MFI-VSFH-YEL', description: 'HEAVY SUSPENDED SPIRAL SPRING', deflection: '25MM', rodSize: 'M20', springColor: 'YELLOW', lMm: 150, bMm: 90, hMm: 220, d1Mm: 22, fhVal: '145', marking: 'MFI-VSFH-YEL', unit: 'PCS', openingStock: 80, incomingStock: 250, outgoingStock: 60, unitWeight: 4.80, rackLocation: 'V-03-05' }
        ];
      case 'vibration_hanger_neoprene':
        return [
          { id: 'VHN-1001', categoryId: 'vibration_hanger_neoprene', partNo: 'MFI-VHN-BLU', description: 'ACOUSTIC SPRING FLANGE HANGER', deflection: '12MM', rodSize: 'M12', bMm: 55, hMm: 95, hLower: 35, springColor: 'BLUE', finish: 'ZINC PLATED FLANGE', marking: 'MFI-VHN-BLU', unit: 'PCS', openingStock: 400, incomingStock: 1000, outgoingStock: 300, unitWeight: 0.75, rackLocation: 'V-03-09' }
        ];
      case 'right_angle_clamp':
        return [
          { id: 'RAC-1001', categoryId: 'right_angle_clamp', partNo: 'MFI-RAC-02', description: 'RIGHT ANGLE CROSSOVER CLAMP', pipeConduitSize: '2" (60.3mm)', aMm: 92, bMm: 48, cMm: 8, finish: 'HDG BRACKET', marking: 'MFI-RAC-2', unit: 'PCS', openingStock: 600, incomingStock: 1500, outgoingStock: 500, unitWeight: 0.98, rackLocation: 'K-09-02' }
        ];
      default:
        return [];
    }
  };

  // Active subcategory ID selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('clevis_hanger');

  // Load state from localStorage or use initial collections
  const [items, setItems] = useState<PipeSupportItem[]>(() => {
    const saved = localStorage.getItem('MF_PIPE_SUPPORT_DB_RECORDS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    
    // Seed initial records across all 31 tabs - default to empty for clean system
    const allSeeded: PipeSupportItem[] = [];
    return allSeeded;
  });

  // Keep state synchronized
  const saveRecords = (newRecords: PipeSupportItem[]) => {
    setItems(newRecords);
    localStorage.setItem('MF_PIPE_SUPPORT_DB_RECORDS', JSON.stringify(newRecords));
  };

  // Quick categories statistics
  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId) || categories[0];
  }, [selectedCategoryId]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (item.categoryId !== selectedCategoryId) return false;
      if (!matrixSearch.trim()) return true;
      const q = matrixSearch.toLowerCase();
      return (
        item.partNo.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.finish && item.finish.toLowerCase().includes(q)) ||
        (item.marking && item.marking.toLowerCase().includes(q)) ||
        (item.rackLocation && item.rackLocation.toLowerCase().includes(q))
      );
    });
  }, [items, selectedCategoryId, matrixSearch]);

  // Insert Record states & form:
  const [showAddForm, setShowAddForm] = useState(false);
  const [formPartNo, setFormPartNo] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUnit, setFormUnit] = useState('PCS');
  const [formFinish, setFormFinish] = useState('GALVANIZED');
  const [formMarking, setFormMarking] = useState('MFI');
  const [formRack, setFormRack] = useState('A-01-01');
  const [formOpening, setFormOpening] = useState(500);
  const [formIncoming, setFormIncoming] = useState(1000);
  const [formOutgoing, setFormOutgoing] = useState(200);
  const [formTally, setFormTally] = useState<number | ''>('');
  const [formUnitWeight, setFormUnitWeight] = useState(0.8);
  const [formCustomFields, setFormCustomFields] = useState<Record<string, any>>({});
  const [editCustomFields, setEditCustomFields] = useState<Record<string, any>>({});

  const resetForm = () => {
    setFormPartNo('');
    setFormDesc('');
    setFormUnit('PCS');
    setFormFinish('GALVANIZED');
    setFormMarking('MFI');
    setFormRack('A-01-01');
    setFormOpening(500);
    setFormIncoming(1000);
    setFormOutgoing(200);
    setFormTally('');
    setFormUnitWeight(0.8);
    setFormCustomFields({});
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const isNoDesc = selectedCategoryId === 'heavy_duty_pipe_clamps' || selectedCategoryId === 'heavy_duty_double_bolt_clamp';
    if (!formPartNo.trim() || (!isNoDesc && !formDesc.trim())) return;

    const op = Number(formOpening) || 0;
    const inc = Number(formIncoming) || 0;
    const out = Number(formOutgoing) || 0;
    const calcBal = op + inc - out;

    const newItem: PipeSupportItem = {
      id: `PSI-${Date.now()}`,
      categoryId: selectedCategoryId,
      partNo: formPartNo.trim().toUpperCase(),
      description: isNoDesc ? currentCategory.name : formDesc.trim().toUpperCase(),
      unit: (formCustomFields.unit || formUnit || 'PCS').trim().toUpperCase(),
      finish: (formCustomFields.finish || formFinish || 'GALVANIZED').trim().toUpperCase(),
      marking: (formCustomFields.marking || formMarking || 'MFI').trim().toUpperCase(),
      openingStock: op,
      incomingStock: inc,
      outgoingStock: out,
      tallyQty: formTally !== '' ? Number(formTally) : calcBal,
      unitWeight: Number(formUnitWeight) || 0.1,
      rackLocation: formRack.trim().toUpperCase(),
      ...formCustomFields
    };

    const updated = [...items, newItem];
    saveRecords(updated);
    setShowAddForm(false);
    resetForm();
  };

  // Deletion logic
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const handleDeleteRecord = (id: string) => {
    const updated = items.filter(r => r.id !== id);
    saveRecords(updated);
    setConfirmDeleteId(null);
  };

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPartNo, setEditPartNo] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editOpening, setEditOpening] = useState(0);
  const [editIncoming, setEditIncoming] = useState(0);
  const [editOutgoing, setEditOutgoing] = useState(0);
  const [editTally, setEditTally] = useState(0);
  const [editUnitWeight, setEditUnitWeight] = useState(0);
  const [editRack, setEditRack] = useState('');

  const startEdit = (item: PipeSupportItem) => {
    setEditingId(item.id);
    setEditPartNo(item.partNo);
    setEditDesc(item.description);
    setEditUnit(item.unit);
    setEditOpening(item.openingStock);
    setEditIncoming(item.incomingStock);
    setEditOutgoing(item.outgoingStock);
    
    const calcBal = item.openingStock + item.incomingStock - item.outgoingStock;
    setEditTally(item.tallyQty !== undefined ? item.tallyQty : calcBal);
    
    setEditUnitWeight(item.unitWeight);
    setEditRack(item.rackLocation || '');
    
    // Dynamically store all specific attributes of this current subcategory
    const custom: Record<string, any> = {};
    currentCategory.columns.forEach(colKey => {
      custom[colKey] = item[colKey as keyof PipeSupportItem] !== undefined ? item[colKey as keyof PipeSupportItem] : '';
    });
    setEditCustomFields(custom);
  };

  const saveEdit = (id: string) => {
    const isNoDesc = selectedCategoryId === 'heavy_duty_pipe_clamps' || selectedCategoryId === 'heavy_duty_double_bolt_clamp';
    const updated = items.map(r => {
      if (r.id === id) {
        return {
          ...r,
          partNo: editPartNo.trim().toUpperCase(),
          description: isNoDesc ? currentCategory.name : editDesc.trim().toUpperCase(),
          unit: editUnit.trim().toUpperCase(),
          openingStock: Number(editOpening) || 0,
          incomingStock: Number(editIncoming) || 0,
          outgoingStock: Number(editOutgoing) || 0,
          tallyQty: Number(editTally) || 0,
          unitWeight: Number(editUnitWeight) || 0.0,
          rackLocation: editRack.trim().toUpperCase(),
          ...editCustomFields
        };
      }
      return r;
    });
    saveRecords(updated);
    setEditingId(null);
  };

  // Reset entire database back to default seeded levels
  const handleResetData = () => {
    if (window.confirm("Restore entire Pipe Support database back to premium UAE factory settings? (This will reload 31 categories and restore original Table / Subcategory names with fresh test entries)")) {
      const allSeeded: PipeSupportItem[] = [];
      DEFAULT_PIPE_SUPPORT_CATEGORIES.forEach(c => {
        allSeeded.push(...getSubcategoryInitialData(c.id));
      });
      setCategories(DEFAULT_PIPE_SUPPORT_CATEGORIES);
      localStorage.setItem('MF_PIPE_SUPPORT_CATEGORIES_STATE', JSON.stringify(DEFAULT_PIPE_SUPPORT_CATEGORIES));
      saveRecords(allSeeded);
    }
  };

  // Export as printable / PDF friendly view triggers browser print
  const handlePrint = () => {
    window.print();
  };

  // Section: clipboard data sheets copying
  const handleCopySpec = () => {
    const catName = currentCategory.name;
    const isNoDesc = currentCategory.id === 'heavy_duty_pipe_clamps' || currentCategory.id === 'heavy_duty_double_bolt_clamp';
    const isNoRack = ['heavy_duty_pipe_clamps', 'heavy_duty_double_bolt_clamp', 'anti_vibration_hanger_mount', 'ribbed_mounting_pad', 'metal_sandwich_pad', 'waffle_pad', 'ribbed_multi_layer_pad', 'cork_sandwich_pad'].includes(currentCategory.id);
    const txtHead = `⚓ MARINE FASTENERS INDUSTRIES UAE - DESIGN SPECIFICATION SHEET\nCategory: ${catName}\n------------------------------------------------------------\n`;
    const txtRows = filteredItems.map(item => {
      const balance = item.openingStock + item.incomingStock - item.outgoingStock;
      const totalWt = balance * item.unitWeight;
      const descPart = isNoDesc ? '' : ` | Desc: ${item.description}`;
      const rackPart = isNoRack ? '' : ` | Rack Location: ${item.rackLocation || 'N/A'}`;
      return `PartNo: ${item.partNo}${descPart} | Balance Qty: ${balance} PCS | UnitWeight: ${item.unitWeight} KG | TotalWeight: ${totalWt.toFixed(2)} KG${rackPart}`;
    }).join('\n');

    navigator.clipboard.writeText(txtHead + txtRows);
    setCopiedText("Export copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  // ----- TAB 2: SPECIAL DESIGNER WORKSPACE VARIABLES IN MFI -----
  const [selectedCalcType, setSelectedCalcType] = useState<string>('clevis_hanger');
  const [calcMaterial, setCalcMaterial] = useState<'carbon_steel' | 'galvanized' | 'ss304' | 'ss316' | 'copper'>('galvanized');
  const [calcPipeSize, setCalcPipeSize] = useState<string>('4"');
  const [calcStripWidth, setCalcStripWidth] = useState<number>(32); // 32mm width
  const [calcStripThickness, setCalcStripThickness] = useState<number>(4.0); // 4mm thickness
  const [calcSafeLoadParam, setCalcSafeLoadParam] = useState<number>(5.5); // 5.5 kN input
  const [designQuantity, setDesignQuantity] = useState<number>(500); // 500 pcs order

  const PIPELINE_NOMINALS_MAP = [
    { label: '1/2" (21.3 mm)', od_mm: 21.3, recommended_hanger: 'M10' },
    { label: '3/4" (26.7 mm)', od_mm: 26.7, recommended_hanger: 'M10' },
    { label: '1" (33.4 mm)', od_mm: 33.4, recommended_hanger: 'M10' },
    { label: '1-1/4" (42.2 mm)', od_mm: 42.2, recommended_hanger: 'M10' },
    { label: '1-1/2" (48.3 mm)', od_mm: 48.3, recommended_hanger: 'M10' },
    { label: '2" (60.3 mm)', od_mm: 60.3, recommended_hanger: 'M12' },
    { label: '2-1/2" (73.0 mm)', od_mm: 73.0, recommended_hanger: 'M12' },
    { label: '3" (88.9 mm)', od_mm: 88.9, recommended_hanger: 'M12' },
    { label: '4" (114.3 mm)', od_mm: 114.3, recommended_hanger: 'M16' },
    { label: '5" (141.3 mm)', od_mm: 141.3, recommended_hanger: 'M16' },
    { label: '6" (168.3 mm)', od_mm: 168.3, recommended_hanger: 'M20' },
    { label: '8" (219.1 mm)', od_mm: 219.1, recommended_hanger: 'M20' },
    { label: '10" (273.0 mm)', od_mm: 273.0, recommended_hanger: 'M24' },
    { label: '12" (323.9 mm)', od_mm: 323.9, recommended_hanger: 'M24' }
  ];

  // Perform engineering physics calculation of split support clamps
  const computedDesignSpecs = useMemo(() => {
    let density = 7.85; // g/cm3 mild steel
    let maxTensileMPa = 410; // S275 mild steel tensile
    let nameLabel = 'Carbon Structural Steel AISI 1020 / ASTM A36';

    if (calcMaterial === 'ss304') {
      density = 7.93;
      maxTensileMPa = 515;
      nameLabel = 'Austenitic Corrosion-Resistant Stainless Steel SS 304';
    } else if (calcMaterial === 'ss316') {
      density = 7.98;
      maxTensileMPa = 515;
      nameLabel = 'Austenitic Marine Grade Stainless Steel SS 316';
    } else if (calcMaterial === 'copper') {
      density = 8.94;
      maxTensileMPa = 220;
      nameLabel = 'Electrolytic Solid Copper ASTM B187';
    } else if (calcMaterial === 'galvanized') {
      density = 7.85;
      maxTensileMPa = 410;
      nameLabel = 'Hot Dip Galvanized High Yield Steel S275JR';
    }

    const matchedPipe = PIPELINE_NOMINALS_MAP.find(p => p.label.startsWith(calcPipeSize)) || PIPELINE_NOMINALS_MAP[8];
    const pipeOuterD = matchedPipe.od_mm;

    // Estimated total strip circumference length wrapping the pipe (half structure or full structure depending on design type)
    const isHalfStrap = selectedCalcType.includes('strap') || selectedCalcType.includes('beam');
    const factorMultiplier = isHalfStrap ? 1.4 : 2.5; // full loop straps need larger strip development
    
    // Developer strip length in mm: circumference wrap + vertical clamp tabs
    const devLengthMm = (Math.PI * pipeOuterD * factorMultiplier) / 2 + 80;

    // Volume of flat bar steel strip used: width * thickness * devLength in cubic millimeters
    const volumeMm3 = calcStripWidth * calcStripThickness * devLengthMm;
    const estWeightKg = (volumeMm3 * (density / 1000000)) / 1000;
    const batchWeightKg = estWeightKg * designQuantity;

    // Structural calculations: cross section area of the strip
    const areaSqMm = calcStripWidth * calcStripThickness;

    // Bending Section Modulus: Z = (b * t^2) / 6
    const sectionModulusZ = (calcStripWidth * Math.pow(calcStripThickness, 2)) / 6;

    // Safe Tensile strength: Safe Load = Area * Yield Strength * 0.6 Safety factor
    const materialYieldStr = maxTensileMPa * 0.6; // average yield is 60% of tensile
    const calculatedSafeTensionStrengthKn = (areaSqMm * materialYieldStr * 0.5) / 1000; // 0.5 further safety coefficient

    // Safety status indicator
    const isSafe = calculatedSafeTensionStrengthKn >= calcSafeLoadParam;

    return {
      nameLabel,
      devLengthMm,
      estWeightKg,
      batchWeightKg,
      calculatedSafeTensionStrengthKn,
      isSafe,
      recommendedHanger: matchedPipe.recommended_hanger
    };
  }, [selectedCalcType, calcMaterial, calcPipeSize, calcStripWidth, calcStripThickness, calcSafeLoadParam, designQuantity]);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md select-none print-container max-w-7xl mx-auto">
      {/* Upper sub header segment */}
      <div className="bg-[#0f172a] text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6B00] text-white p-2 border border-white shrink-0">
            <Layers className="w-5 h-5 text-orange-100" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              PIPE SUPPORT SYSTEMS PORTAL
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              OFFICIAL WAREHOUSE INVENTORY DATABASE • 31 SUPPORT CLAMPS CATEGORIES
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'matrix' 
                ? 'bg-[#FF6B00] text-white border-[#FF6B00]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5" /> MATRIX INVENTORY
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('designer')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'designer' 
                ? 'bg-[#FF6B00] text-white border-[#FF6B00]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> CLAMP DESIGNER
            </span>
          </button>
        </div>
      </div>

      {/* MATRIX VIEW TABLE */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-5">
          {/* Main info alert bar */}
          <div className="bg-orange-50 border border-orange-200 text-orange-950 p-3 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3 no-print">
            <Info className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <div>
              <span>This panel contains live inventory logs and high precision technical specifications for standard pipe supports, EPDM lined clamps, beam anchor hooks, and vibration pads. Follow standard Marine Fasteners Ajman stock protocols.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 no-print">
            {/* Mobile Dropdown Selector or 31 Categories Selector List column on Desktop */}
            <div className="block lg:hidden w-full bg-slate-50 border border-slate-300 p-3">
              <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1.5 font-mono">
                SELECT SUPPORT SECTION:
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setConfirmDeleteId(null);
                  setEditingId(null);
                }}
                className="w-full p-2.5 bg-white text-slate-900 border border-slate-300 font-semibold uppercase text-[11px] rounded-none outline-none focus:border-[#FF6B00]"
              >
                {categories.map(c => {
                  const count = items.filter(itm => itm.categoryId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count} ITEMS)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="hidden lg:block lg:col-span-1 border border-slate-300 p-3 h-[450px] overflow-y-auto bg-slate-50 space-y-1">
              <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-widest px-1 pb-1 border-b border-slate-200">
                SUPPORT SECTIONS ({categories.length})
              </span>
              {categories.map(c => {
                const isSelected = c.id === selectedCategoryId;
                const count = items.filter(itm => itm.categoryId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategoryId(c.id);
                      setConfirmDeleteId(null);
                      setEditingId(null);
                    }}
                    className={`w-full text-left p-1.5 px-2.5 text-[10.5px] font-bold flex justify-between items-center transition-all focus:outline-none ${
                      isSelected 
                        ? 'bg-[#FF6B00] text-white font-semibold' 
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="truncate mr-2">{c.name}</span>
                    <span className={`text-[8.5px] font-mono font-bold border p-0.5 px-1 leading-none rounded-none ${
                      isSelected ? 'bg-orange-900 border-none text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subcategory Details & controls */}
            <div className="lg:col-span-3 space-y-4">
              <div className="border border-slate-300 p-4 bg-slate-50 relative">
                <div className="absolute right-3 top-3">
                  <span className="font-mono text-[9px] font-bold tracking-widest text-[#FF6B00] border-2 border-[#FF6B00] p-1 px-2 uppercase select-none">
                    SECTION SPECIFIED
                  </span>
                </div>
                {isEditingCategory ? (
                  <div className="space-y-2 mt-1 mb-2 max-w-md p-3 border border-slate-300 bg-white shadow-sm font-mono text-xs">
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-500 mb-1">Rename Sub Category / Table Name</label>
                      <input 
                        type="text"
                        value={catEditName}
                        onChange={(e) => setCatEditName(e.target.value)}
                        className="w-full p-2 border border-slate-300 text-xs font-bold uppercase text-slate-950 focus:outline-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-500 mb-1">Description / Notes</label>
                      <input 
                        type="text"
                        value={catEditDesc}
                        onChange={(e) => setCatEditDesc(e.target.value)}
                        className="w-full p-2 border border-slate-300 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingCategory(false)}
                        className="p-1 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold uppercase text-[9px] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSaveCategoryInfo}
                        className="p-1 px-3 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold uppercase text-[9px] cursor-pointer"
                      >
                        Save Table Name
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider">{currentCategory.name}</h3>
                      <button 
                        onClick={handleStartEditCategory}
                        className="p-1 text-slate-500 hover:text-[#FF6B00] transition-colors cursor-pointer"
                        title="Change Table / Sub-category Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-0.5 max-w-xl">{currentCategory.description}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  {/* Search filter within subcategory */}
                  <div className="relative flex items-center w-52 font-mono">
                    <Search className="w-3.5 h-3.5 text-[#FF6B00] absolute left-2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="SEARCH PART NO..."
                      value={matrixSearch}
                      onChange={(e) => setMatrixSearch(e.target.value)}
                      className="w-full text-[9px] pl-7.5 pr-2 py-1 bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#FF6B00] uppercase font-bold text-slate-800"
                    />
                  </div>

                  <button
                    onClick={handleCopySpec}
                    className="p-1 px-3 bg-white border border-slate-300 hover:border-[#FF6B00] text-slate-700 hover:text-[#FF6B00] text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Copy className="w-3 h-3" /> COPY SHEETS
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-1 px-3 bg-white border border-slate-300 hover:border-[#FF6B00] text-slate-700 hover:text-[#FF6B00] text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Printer className="w-3 h-3" /> PRINT REPORT
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`p-1 px-3 text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border ${
                      showAddForm
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-[#FF6B00] hover:border-[#FF6B00]'
                    }`}
                  >
                    <Plus className="w-3 h-3" /> {showAddForm ? 'CLOSE ENTRY' : 'ADD NEW RECORD'}
                  </button>
                </div>
              </div>

              {/* Add record form panel inside subcategory */}
              {showAddForm && (
                <form onSubmit={handleCreateRecord} className="border border-slate-900 p-4 space-y-4 bg-slate-900 text-white animate-fadeIn">
                  <div className="text-[10px] text-white font-bold uppercase tracking-wider pb-1 border-b border-slate-700 flex justify-between items-center mr-1">
                    <span>★ ADD PIPE SUPPORT INVENTORY RECORD ({currentCategory.name})</span>
                    <button type="button" onClick={() => setShowAddForm(false)}>
                      <X className="w-4 h-4 text-slate-400 hover:text-white" />
                    </button>
                  </div>

                  {/* Step 1: Core Identifiers */}
                  <div className={`grid grid-cols-1 ${currentCategory.id === 'heavy_duty_pipe_clamps' || currentCategory.id === 'heavy_duty_double_bolt_clamp' ? '' : 'md:grid-cols-2'} gap-3 text-xs font-mono`}>
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-amber-400 mb-0.5">Part No *</label>
                      <input
                        type="text"
                        required
                        value={formPartNo}
                        onChange={(e) => setFormPartNo(e.target.value)}
                        placeholder="e.g. MFI-CH-M16-04"
                        className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px] uppercase font-bold"
                      />
                    </div>
                    {currentCategory.id !== 'heavy_duty_pipe_clamps' && currentCategory.id !== 'heavy_duty_double_bolt_clamp' && (
                      <div>
                        <label className="block text-[8.5px] uppercase font-bold text-amber-400 mb-0.5">Description *</label>
                        <input
                          type="text"
                          required
                          value={formDesc}
                          onChange={(e) => setFormDesc(e.target.value)}
                          placeholder="e.g. CARBON STEEL CLEVIS HANGER"
                          className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px] uppercase font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 2: Dynamic Physical Dimensions matching current category columns */}
                  <div className="pb-1 border-b border-slate-800">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      ⚙ PHYSICAL DIMENSIONAL SPECIFICATIONS (FROM PDF DECLARED COLUMNS)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-mono">
                    {currentCategory.columns.map(colKey => {
                      const label = getColumnHeader(currentCategory.id, colKey);
                      const isNumeric = [
                        'hMm', 'dMm', 'safeLoadKn', 'breakLoadKn', 'aMm', 'bMm', 'cMm', 'maxLoadKn',
                        'pipeSizeMm', 'pipeOD', 'widthW', 'totalOdA', 'lengthMm', 'lMm', 'l2Mm',
                        'plateWidth', 'recLoadKg', 'maxLoadKg', 'd1Mm', 'wMm', 'h1_MM', 'h2_MM', 'rMm'
                      ].includes(colKey);
                      
                      const val = formCustomFields[colKey] !== undefined ? formCustomFields[colKey] : '';

                      // Special drop-down for unit or springColor
                      if (colKey === 'unit') {
                        return (
                          <div key={colKey}>
                            <label className="block text-[8.5px] uppercase font-bold text-slate-300 mb-0.5">{label}</label>
                            <select
                              value={val || 'PCS'}
                              onChange={(e) => setFormCustomFields(prev => ({ ...prev, unit: e.target.value }))}
                              className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px] font-bold"
                            >
                              <option value="PCS">PCS</option>
                              <option value="MTR">MTR</option>
                              <option value="BAG">BAG</option>
                              <option value="BOX">BOX</option>
                            </select>
                          </div>
                        );
                      }

                      if (colKey === 'springColor') {
                        return (
                          <div key={colKey}>
                            <label className="block text-[8.5px] uppercase font-bold text-slate-300 mb-0.5">{label}</label>
                            <select
                              value={val || 'RED'}
                              onChange={(e) => setFormCustomFields(prev => ({ ...prev, springColor: e.target.value }))}
                              className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px] font-bold"
                            >
                              <option value="RED">RED</option>
                              <option value="YELLOW">YELLOW</option>
                              <option value="BLUE">BLUE</option>
                              <option value="GREEN">GREEN</option>
                            </select>
                          </div>
                        );
                      }

                      return (
                        <div key={colKey}>
                          <label className="block text-[8.5px] uppercase font-bold text-slate-300 mb-0.5">
                            {label} {isNumeric ? '(123)' : ''}
                          </label>
                          <input
                            type={isNumeric ? "number" : "text"}
                            step={['safeLoadKn', 'breakLoadKn', 'maxLoadKn', 'unitWeight'].includes(colKey) ? "0.1" : "any"}
                            value={val}
                            placeholder={`Enter ${label}`}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              setFormCustomFields(prev => ({
                                ...prev,
                                [colKey]: isNumeric ? (inputVal === '' ? '' : Number(inputVal)) : inputVal
                              }));
                            }}
                            className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px] font-bold"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 3: Warehouse details */}
                  <div className="pb-1 border-b border-slate-800">
                    <span className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-wider font-mono">
                      📊 WAREHOUSE INVENTORY TRACKING & METRIC FIELDS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-mono">
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">Opening Stock</label>
                      <input
                        type="number"
                        value={formOpening}
                        onChange={(e) => setFormOpening(Number(e.target.value))}
                        className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">Incoming Stock</label>
                      <input
                        type="number"
                        value={formIncoming}
                        onChange={(e) => setFormIncoming(Number(e.target.value))}
                        className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">Outgoing Stock</label>
                      <input
                        type="number"
                        value={formOutgoing}
                        onChange={(e) => setFormOutgoing(Number(e.target.value))}
                        className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">Tally Qty (Audited)</label>
                      <input
                        type="number"
                        value={formTally}
                        onChange={(e) => setFormTally(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Matches Balance"
                        className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">Unit Weight (KG)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={formUnitWeight}
                        onChange={(e) => setFormUnitWeight(Number(e.target.value))}
                        className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px]"
                      />
                    </div>
                    {currentCategory.id !== 'heavy_duty_pipe_clamps' && 
                     currentCategory.id !== 'heavy_duty_double_bolt_clamp' && 
                     currentCategory.id !== 'anti_vibration_hanger_mount' && 
                     currentCategory.id !== 'ribbed_mounting_pad' && 
                     currentCategory.id !== 'metal_sandwich_pad' && 
                     currentCategory.id !== 'waffle_pad' && 
                     currentCategory.id !== 'ribbed_multi_layer_pad' && 
                     currentCategory.id !== 'cork_sandwich_pad' && (
                      <div>
                        <label className="block text-[8.5px] uppercase font-bold text-slate-400 mb-0.5">Rack Location</label>
                        <input
                          type="text"
                          value={formRack}
                          onChange={(e) => setFormRack(e.target.value)}
                          placeholder="e.g. A-12-05"
                          className="w-full p-1 bg-slate-800 text-white border border-slate-700 rounded-none text-[10.5px] uppercase"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-2 font-mono">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-1.5 bg-slate-800 text-slate-300 hover:text-white uppercase font-bold text-[9.5px] rounded-none cursor-pointer"
                    >
                      CLEAR FORM
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white uppercase font-semibold text-[9.5px] rounded-none cursor-pointer"
                    >
                      COMMIT RECORD
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* DYNAMIC RENDER OF THE MATRIX SPREADSHEEET TABLE */}
          <div className="overflow-x-auto border border-slate-900 whitespace-nowrap">
            <table className="w-full border-collapse text-left text-[10.5px] bg-white text-slate-900 relative">
              <thead className="bg-[#0B1528] text-white border-b border-slate-900">
                <tr className="divide-x divide-slate-800 uppercase font-mono tracking-wider text-[9px]">
                  <th className="p-2 py-2.5 text-center w-12 min-w-12 bg-[#0B1528]">IDX</th>
                  <th className="p-2 py-2.5 min-w-[120px] bg-[#0B1528]">PART NO</th>
                  {currentCategory.id !== 'heavy_duty_pipe_clamps' && currentCategory.id !== 'heavy_duty_double_bolt_clamp' && (
                    <th className="p-2 py-2.5 min-w-[200px] bg-[#0B1528]">DESCRIPTION</th>
                  )}
                  
                  {/* Dynamic intermediate columns depending on current category columns custom array */}
                  {currentCategory.columns.map(colKey => {
                    const label = getColumnHeader(currentCategory.id, colKey);
                    // Standard labels are white. Keys representing size, dimensions, loads are highlighted in amber-405
                    const isTechCol = !['finish', 'marking', 'marking2', 'unit', 'brand'].includes(colKey);
                    return (
                      <th 
                        key={colKey} 
                        className={`p-2 py-2.5 bg-[#0B1528] text-center text-[9px] font-mono whitespace-nowrap uppercase tracking-wider min-w-[85px] ${
                          isTechCol ? 'text-amber-400 font-bold' : 'text-slate-100 font-bold'
                        }`}
                      >
                        {label}
                      </th>
                    );
                  })}
                  
                  {/* Global core inventory tracking sheets headers */}
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-yellow-300 font-bold w-24 min-w-24">OPENING STOCK</th>
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-green-300 font-bold w-24 min-w-24">INCOMING STOCK</th>
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-red-300 font-bold w-24 min-w-24">OUTGOING STOCK</th>
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-white font-semibold w-24 min-w-24">BALANCE QTY</th>
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-slate-200 font-bold w-24 min-w-24">TALLY QTY</th>
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-slate-100 font-bold w-24">UNIT WEIGHT (KG)</th>
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-slate-100 font-bold w-28">TOTAL WEIGHT (KG)</th>
                  {['ribbed_mounting_pad', 'metal_sandwich_pad', 'waffle_pad', 'ribbed_multi_layer_pad', 'cork_sandwich_pad'].includes(currentCategory.id) && (
                    <>
                      <th className="p-2 py-2.5 text-center bg-[#0B1528] text-slate-100 font-bold w-24">UNIT WEIGHT (KG)</th>
                      <th className="p-2 py-2.5 text-center bg-[#0B1528] text-slate-100 font-bold w-28">TOTAL WEIGHT (KG)</th>
                    </>
                  )}
                  {currentCategory.id !== 'heavy_duty_pipe_clamps' && 
                   currentCategory.id !== 'heavy_duty_double_bolt_clamp' && 
                   currentCategory.id !== 'anti_vibration_hanger_mount' && 
                   currentCategory.id !== 'ribbed_mounting_pad' && 
                   currentCategory.id !== 'metal_sandwich_pad' && 
                   currentCategory.id !== 'waffle_pad' && 
                   currentCategory.id !== 'ribbed_multi_layer_pad' && 
                   currentCategory.id !== 'cork_sandwich_pad' && (
                    <th className="p-2 py-2.5 text-center bg-[#0B1528] text-orange-400 font-bold w-28">RACK LOCATION</th>
                  )}
                  
                  <th className="p-2 py-2.5 text-center bg-[#0B1528] text-slate-200 font-bold w-24 max-w-24 no-print">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono text-[10px]">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => {
                    const balance = item.openingStock + item.incomingStock - item.outgoingStock;
                    const totalWeight = balance * item.unitWeight;
                    const isEditing = editingId === item.id;
                    const isDeleting = confirmDeleteId === item.id;

                    return (
                      <tr key={item.id} className={`${isEditing ? 'bg-orange-50' : 'hover:bg-slate-50'} transition-all divide-x divide-slate-200`}>
                        <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPartNo}
                              onChange={(e) => setEditPartNo(e.target.value)}
                              className="w-full bg-white border border-slate-400 p-0.5 text-[9.5px] font-bold"
                            />
                          ) : (
                            item.partNo
                          )}
                        </td>
                        {currentCategory.id !== 'heavy_duty_pipe_clamps' && currentCategory.id !== 'heavy_duty_double_bolt_clamp' && (
                          <td className="p-2 text-slate-600 uppercase whitespace-normal truncate max-w-xs font-sans font-bold">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-white border border-slate-400 p-0.5 text-[9.5px]"
                              />
                            ) : (
                              item.description
                            )}
                          </td>
                        )}

                        {/* Dynamic custom columns */}
                        {currentCategory.columns.map(colKey => {
                          const isCustomEditing = isEditing;
                          const isNumeric = [
                            'hMm', 'dMm', 'safeLoadKn', 'breakLoadKn', 'aMm', 'bMm', 'cMm', 'maxLoadKn',
                            'pipeSizeMm', 'pipeOD', 'widthW', 'totalOdA', 'lengthMm', 'lMm', 'l2Mm',
                            'plateWidth', 'recLoadKg', 'maxLoadKg', 'd1Mm', 'wMm', 'h1_MM', 'h2_MM', 'rMm'
                          ].includes(colKey);
                          
                          const val = editCustomFields[colKey] !== undefined ? editCustomFields[colKey] : '';

                          return (
                            <td 
                              key={colKey} 
                              className={`p-1.5 text-center font-mono text-[9.5px] ${
                                colKey === 'finish' ? 'text-slate-500 font-bold text-[9px]' :
                                colKey === 'marking' ? 'text-[#FF6B00] font-bold text-[9.5px]' :
                                colKey === 'safeLoadKn' || colKey === 'breakLoadKn' || colKey === 'maxLoadKn' ? 'text-indigo-600 font-semibold font-bold' : ''
                              }`}
                            >
                              {isCustomEditing ? (
                                colKey === 'unit' ? (
                                  <select
                                    value={val || 'PCS'}
                                    onChange={(e) => setEditCustomFields(prev => ({ ...prev, unit: e.target.value }))}
                                    className="p-0.5 bg-white border border-slate-400 text-center uppercase text-[9px] w-14 font-semibold"
                                  >
                                    <option value="PCS">PCS</option>
                                    <option value="MTR">MTR</option>
                                    <option value="BAG">BAG</option>
                                    <option value="BOX">BOX</option>
                                  </select>
                                ) : colKey === 'springColor' ? (
                                  <select
                                    value={val || 'RED'}
                                    onChange={(e) => setEditCustomFields(prev => ({ ...prev, springColor: e.target.value }))}
                                    className="p-0.5 bg-white border border-slate-400 text-center uppercase text-[9.5px] w-16 font-semibold"
                                  >
                                    <option value="RED">RED</option>
                                    <option value="YELLOW">YELLOW</option>
                                    <option value="BLUE">BLUE</option>
                                    <option value="GREEN">GREEN</option>
                                  </select>
                                ) : (
                                  <input
                                    type={isNumeric ? "number" : "text"}
                                    step={['safeLoadKn', 'breakLoadKn', 'maxLoadKn'].includes(colKey) ? "0.1" : "any"}
                                    value={val}
                                    onChange={(e) => {
                                      const inputVal = e.target.value;
                                      setEditCustomFields(prev => ({
                                        ...prev,
                                        [colKey]: isNumeric ? (inputVal === '' ? '' : Number(inputVal)) : inputVal
                                      }));
                                    }}
                                    className="p-0.5 bg-white border border-slate-400 text-center text-[10px] font-mono font-bold w-16"
                                  />
                                )
                              ) : (
                                renderCellValue(item, colKey, currentCategory.id)
                              )}
                            </td>
                          );
                        })}

                        {/* Numeric Stocks columns */}
                        <td className="p-2 text-center bg-slate-50 text-slate-700">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editOpening}
                              onChange={(e) => setEditOpening(Number(e.target.value))}
                              className="w-16 bg-white border border-slate-400 text-center"
                            />
                          ) : (
                            item.openingStock
                          )}
                        </td>
                        <td className="p-2 text-center bg-slate-50 text-emerald-700 font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editIncoming}
                              onChange={(e) => setEditIncoming(Number(e.target.value))}
                              className="w-16 bg-white border border-slate-400 text-center"
                            />
                          ) : (
                            item.incomingStock
                          )}
                        </td>
                        <td className="p-2 text-center bg-slate-50 text-rose-700 font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editOutgoing}
                              onChange={(e) => setEditOutgoing(Number(e.target.value))}
                              className="w-16 bg-white border border-slate-400 text-center"
                            />
                          ) : (
                            item.outgoingStock
                          )}
                        </td>
                        
                        <td className="p-2 text-center bg-slate-100 text-slate-900 font-bold text-[11px]">{balance}</td>
                        <td className="p-2 text-center bg-slate-50 font-bold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editTally}
                              onChange={(e) => setEditTally(Number(e.target.value))}
                              className="w-16 bg-white border border-slate-400 text-center font-bold"
                            />
                          ) : (
                            (() => {
                              const tally = item.tallyQty !== undefined ? item.tallyQty : balance;
                              const hasDiscrepancy = tally !== balance;
                              return (
                                <span className={hasDiscrepancy ? "text-rose-650 font-bold" : "text-slate-600"}>
                                  {tally}
                                  {hasDiscrepancy && (
                                    <span className="block text-[8px] uppercase tracking-tighter text-rose-600 font-bold leading-none mt-0.5">
                                      {tally > balance ? `+${tally - balance}` : `${tally - balance}`} diff
                                    </span>
                                  )}
                                </span>
                              );
                            })()
                          )}
                        </td>
                        
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.001"
                              value={editUnitWeight}
                              onChange={(e) => setEditUnitWeight(Number(e.target.value))}
                              className="w-18 bg-white border border-slate-400 text-center"
                            />
                          ) : (
                            item.unitWeight.toFixed(3)
                          )}
                        </td>
                        <td className="p-2 text-center font-semibold text-slate-900">{totalWeight.toFixed(2)} KG</td>
                        
                        {['ribbed_mounting_pad', 'metal_sandwich_pad', 'waffle_pad', 'ribbed_multi_layer_pad', 'cork_sandwich_pad'].includes(currentCategory.id) && (
                          <>
                            <td className="p-2 text-center bg-slate-50 text-slate-500">
                              {item.unitWeight.toFixed(3)}
                            </td>
                            <td className="p-2 text-center font-semibold text-slate-700 bg-slate-50">{totalWeight.toFixed(2)} KG</td>
                          </>
                        )}
                        
                        {currentCategory.id !== 'heavy_duty_pipe_clamps' && 
                         currentCategory.id !== 'heavy_duty_double_bolt_clamp' && 
                         currentCategory.id !== 'anti_vibration_hanger_mount' && 
                         currentCategory.id !== 'ribbed_mounting_pad' && 
                         currentCategory.id !== 'metal_sandwich_pad' && 
                         currentCategory.id !== 'waffle_pad' && 
                         currentCategory.id !== 'ribbed_multi_layer_pad' && 
                         currentCategory.id !== 'cork_sandwich_pad' && (
                          <td className="p-2 text-center text-[#FF6B00] font-bold bg-slate-50">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editRack}
                                onChange={(e) => setEditRack(e.target.value)}
                                className="w-16 bg-white border border-slate-400 text-center"
                              />
                            ) : (
                              item.rackLocation || '—'
                            )}
                          </td>
                        )}

                        <td className="p-2 text-center no-print">
                          {isEditing ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => saveEdit(item.id)}
                                className="bg-emerald-600 text-white rounded p-1 hover:bg-emerald-700 cursor-pointer"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-slate-500 text-white rounded p-1 hover:bg-slate-600 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : isDeleting ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleDeleteRecord(item.id)}
                                className="bg-rose-600 text-white font-bold p-0.5 px-1 bg-red-600 hover:bg-red-700 text-[8px] uppercase ring-1 ring-red-700 cursor-pointer"
                              >
                                SURE
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-slate-300 text-slate-700 p-0.5 px-1 text-[8px] uppercase hover:bg-slate-200 cursor-pointer"
                              >
                                NO
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => startEdit(item)}
                                className="text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                                title="Edit this record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setEditingId(null);
                                }}
                                className="text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={30} className="p-10 text-center text-slate-400 italic">
                      No hardware matching "{matrixSearch}" is logged in this category. Click Add New Record above to insert items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick status footer bar */}
          <div className="flex justify-between items-center bg-slate-50 p-3 border border-slate-300 font-mono text-[9.5px] uppercase text-slate-500 no-print">
            <span>Showing {filteredItems.length} records in {currentCategory.name} subcategory</span>
            <button
              onClick={handleResetData}
              className="text-rose-600 hover:underline font-bold cursor-pointer"
            >
              ⚠ RESTORE DEFAULT DATASETS
            </button>
          </div>
        </div>
      )}

      {/* CLAMP DESIGNER WORKSPACE FOR PIPE SYSTEM */}
      {activeTab === 'designer' && (
        <div className="p-4 md:p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-250 p-4 relative">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider">
                MFI TECHNICAL DIVISION - PIPE SUPPORT ENGINEERING CALCULATOR
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              This interactive tool calculates estimated physical mass, strip dimensions, section area volume, section modulus, and performs basic allowable shear/tension checks for primary structural metal components support hangers under extreme pipelines. Zero-contact EPDM and standard loop structures are simulated.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input params pane */}
            <div className="border border-slate-300 p-4 bg-white space-y-4">
              <div className="pb-1 border-b border-slate-200">
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                  1. DESIGN INPUT PARAMETERS
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Clamp type */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">CLAMP PROFILE STYLE</label>
                  <select
                    value={selectedCalcType}
                    onChange={(e) => setSelectedCalcType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-bold text-slate-700"
                  >
                    <option value="clevis_hanger">CLEVIS HANGER SUPPORT</option>
                    <option value="sprinkler_clamp">SPRINKLER PIPE LOOP</option>
                    <option value="split_clamp">EPDM INSULATED SPLIT COLLAR</option>
                    <option value="u_strap_hanger">U-STRAP SUSPENSION HANGER</option>
                    <option value="riser_hanger">HEAVY PIPELINE RISER EXPANSION</option>
                  </select>
                </div>

                {/* Material choice */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">STEEL MATERIAL GRADE</label>
                  <select
                    value={calcMaterial}
                    onChange={(e) => setCalcMaterial(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-bold text-slate-700"
                  >
                    <option value="galvanized">MILD STEEL ASTM A36 / HDG</option>
                    <option value="ss304">STAINLESS STEEL SS 304</option>
                    <option value="ss316">STAINLESS STEEL SS 316 (MARINE)</option>
                    <option value="copper">SOLID ELECTROLITIC COPPER</option>
                  </select>
                </div>

                {/* Nominal Pipe size */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">NOMINAL PIPELINE DIAMETER (DN)</label>
                  <select
                    value={calcPipeSize}
                    onChange={(e) => setCalcPipeSize(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-bold text-slate-700"
                  >
                    {PIPELINE_NOMINALS_MAP.map(p => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Strip Dimensions */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">STRIP WIDTH (MM)</label>
                    <input
                      type="number"
                      value={calcStripWidth}
                      onChange={(e) => setCalcStripWidth(Math.max(1, Number(e.target.value)))}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">STRIP THICKNESS (MM)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={calcStripThickness}
                      onChange={(e) => setCalcStripThickness(Math.max(0.1, Number(e.target.value)))}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Target Safe load */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">DESIGN TARGET SAFE WORKING LOAD (KN)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcSafeLoadParam}
                    onChange={(e) => setCalcSafeLoadParam(Math.max(0.1, Number(e.target.value)))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-mono font-bold text-indigo-700"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">PRODUCTION ORDER VOL (PCS)</label>
                  <input
                    type="number"
                    value={designQuantity}
                    onChange={(e) => setDesignQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 focus:outline-[#FF6B00] font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Calculations outputs pane */}
            <div className="lg:col-span-2 border border-slate-900 p-5 bg-[#0f172a] text-white relative flex flex-col justify-between">
              {/* Load indicator badge */}
              <div className="absolute right-4 top-4">
                <span className={`font-mono text-[9px] font-bold border-2 p-1 px-3 ${
                  computedDesignSpecs.isSafe 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-red-500 text-red-500 animate-pulse'
                }`}>
                  {computedDesignSpecs.isSafe ? 'STRUCTURALLY SAFE' : 'WARN: HIGHER THICKNESS REQ'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="pb-1 border-b border-slate-800">
                  <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                    2. METALLURGICAL PHYSICS DETERMINATIONS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Left Column dimensions */}
                  <div className="space-y-2">
                    <div className="bg-slate-900 p-2 border-l border-slate-700">
                      <span className="block text-[8px] text-slate-400">MATERIAL SELECTION</span>
                      <span className="block text-[11px] font-bold text-slate-100 uppercase mt-0.5">{computedDesignSpecs.nameLabel}</span>
                    </div>

                    <div className="bg-slate-900 p-2 border-l border-slate-700">
                      <span className="block text-[8px] text-slate-400">ESTIMATED STRIP DEVELOPED LENGTH</span>
                      <span className="block text-[11px] font-bold text-orange-400 mt-0.5">{computedDesignSpecs.devLengthMm.toFixed(1)} mm</span>
                    </div>

                    <div className="bg-slate-900 p-2 border-l border-slate-700">
                      <span className="block text-[8px] text-slate-400">RECOMMENDED HANGER THREAD SIZE</span>
                      <span className="block text-[11px] font-bold text-indigo-400 mt-0.5">{computedDesignSpecs.recommendedHanger}</span>
                    </div>
                  </div>

                  {/* Right Column physics forces */}
                  <div className="space-y-2">
                    <div className="bg-slate-900 p-2 border-l border-slate-700">
                      <span className="block text-[8px] text-slate-400">CLAMP UNIT COMPONENT WEIGHT</span>
                      <span className="block text-[11px] font-bold text-emerald-400 mt-0.5">{computedDesignSpecs.estWeightKg.toFixed(3)} kg</span>
                    </div>

                    <div className="bg-slate-900 p-2 border-l border-slate-700">
                      <span className="block text-[8px] text-slate-400">TOTAL BATCH LOAD SHIPPED WEIGHT</span>
                      <span className="block text-[11px] font-bold text-white mt-0.5">{computedDesignSpecs.batchWeightKg.toFixed(1)} kg ({designQuantity} pcs)</span>
                    </div>

                    <div className="bg-slate-900 p-2 border-l border-slate-700">
                      <span className="block text-[8px] text-slate-400">CALCULATED CLAMP SAFE LOAD CAPACITY</span>
                      <span className="block text-[11px] font-bold text-indigo-450 mt-0.5 text-indigo-300">
                        {computedDesignSpecs.calculatedSafeTensionStrengthKn.toFixed(2)} kN
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-955 p-3 bg-slate-950 border border-slate-800 text-[10.5px] leading-relaxed text-slate-300 mt-3">
                  <span className="block font-bold text-slate-200 uppercase text-[9px] mb-1">👷 DESIGNER SIGN-OFF MEMORANDUM:</span>
                  <span>Calculated allowable structural clamp resistance values are referenced under static load coefficients. Hot line fluids and dynamic pipeline water hammer thrust profiles require a minimum structural safety coefficient multiplier of 3.0. Avoid direct steel-on-copper attachments.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center mt-4">
                <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest">
                  MFI STRUCTURAL PIPING SUITE • DESIGNER ACTIVE
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = `⚓ MFI DESIGN REPORT - PIPE SUPPORT SYSTEMS\nProfile: ${selectedCalcType.toUpperCase()}\nMaterial: ${calcMaterial.toUpperCase()}\nPipe: ${calcPipeSize}\nUnitWeight: ${computedDesignSpecs.estWeightKg.toFixed(3)} KG\nSafeLoad: ${computedDesignSpecs.calculatedSafeTensionStrengthKn.toFixed(2)} kN\nStatus: ${computedDesignSpecs.isSafe ? 'STRUCTURALLY SAFE' : 'STRESS EXCEEDS ALLOWABLE LIMIT'}`;
                    navigator.clipboard.writeText(text);
                    setCopiedText("Design report copied to clipboard!");
                    setTimeout(() => setCopiedText(null), 2000);
                  }}
                  className="bg-[#FF6B00] hover:bg-white hover:text-black hover:scale-105 transform transition duration-150 text-white font-semibold uppercase text-[10px] tracking-wider py-1.5 px-4 rounded-none cursor-pointer"
                >
                  EXPORT SPEC DESIGN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating success copied toast standard */}
      {copiedText && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs font-mono font-bold p-2.5 px-4 border border-emerald-500 shadow-md animate-pulse z-50">
          ✓ {copiedText}
        </div>
      )}
    </div>
  );
}
