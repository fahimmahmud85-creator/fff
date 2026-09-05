import React, { useState, useMemo, useEffect } from 'react';
import { 
  Anchor, Ruler, FileCheck, Check, Printer, Info, HelpCircle, AlertCircle, Sparkles, Sliders, List, Grid3X3, Copy, FolderPlus, Database, ArrowRight
} from 'lucide-react';

export interface UBoltSubCategory {
  id: string;
  name: string;
  description: string;
}

export interface UBoltGrade {
  name: string;
  tensile: number; // MPa
  yieldStr: number; // MPa
  classType: 'metric' | 'imperial' | 'joint';
  info: string;
}

export default function UBoltsDesignComponent() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'designer'>('designer');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Exact Sub Categories matching the received image & OCR
  const uBoltSubCategories: UBoltSubCategory[] = [
    { id: 'round_bend', name: 'ROUND BEND U BOLT', description: 'Standard circular arc bend designed to fit tightly around circular steel pipes or tubes.' },
    { id: 'square_bend', name: 'SQUARE BEND U BOLTS', description: '90-degree square corner bend ideal for anchoring rectangular beams, wood blocks, or frames.' },
    { id: 'neoprene_sleeve', name: 'NEOPRENE SLEEVE U BOLT', description: 'Equipped with heavy neoprene sleeve wrapping to prevent direct metallic contact and absorb vibration.' },
    { id: 'rubber_ptfe_pad', name: 'U BOLTS RUBBER LINED WITH PTFE PAD', description: 'Dual isolation system pairing high-grade rubber lining with clean slide PTFE bottom pad.' },
    { id: 'rubber_moulded_sleeve', name: 'RUBBER MOULDED SLEEVED U BOLT', description: 'Fully vulcanized rubber sleeve moulded directly around the metallic bend for offshore applications.' },
    { id: 'ptfe_sleeve_pad', name: 'U BOLT WITH PTFE SLEEVE & PAD', description: 'Specialized low-friction lining matching chemical and extreme temperature pipelines.' },
    { id: 'pu_coating_rubber_pad', name: 'U BOLT WITH PU COATING WITH RUBBER PAD LINED', description: 'Premium Polyurethane coated rod utilizing structural dampening raw rubber backplate pads.' },
    { id: 'silicone_rubber_lined', name: 'U BOLT WITH SILICONE RUBBER LINED', description: 'High-temperature medical or oil & gas grade silicone rubber cushion liner.' },
    { id: 'neoprene_sleeve_round', name: 'NEOPRENE SLEEVE ROUND TYPE-1', description: 'Standalone high-performance neoprene circular jacket lining element.' },
    { id: 'insulated_u_bolts', name: 'INSULATED U BOLTS', description: 'Completely dielectric high-voltage insulated bolts preventing galvanic corrosion.' },
    { id: 'u_bolt_plate', name: 'U BOLT PLATE', description: 'Thick backing plate reinforcement locking the opposite side of structural assemblies.' },
    { id: 'exhaust_clamps', name: 'EXHAUST CLAMPS', description: 'Vibration-optimized heavy muffler clamping elements for automotive exhaust pipelines.' }
  ];

  // Exact Grades listed in the rows/columns of the U BOLT matrix
  const METRIC_GRADES: UBoltGrade[] = [
    { name: 'GRADE 4.6', tensile: 400, yieldStr: 240, classType: 'metric', info: 'Low carbon structural steel with excellent weldability and ductility.' },
    { name: 'GRADE 8.8', tensile: 800, yieldStr: 640, classType: 'metric', info: 'Quenched & tempered medium carbon steel for standard industrial piping applications.' },
    { name: 'GRADE 10.9', tensile: 1040, yieldStr: 940, classType: 'metric', info: 'Heavy duty high-tensile alloy steel for extreme pipeline load-bearing.' },
    { name: 'ASTM A36', tensile: 400, yieldStr: 250, classType: 'joint', info: 'Standard weldable mild carbon structural steel.' },
    { name: 'ASTM F1554 GR 36', tensile: 400, yieldStr: 248, classType: 'joint', info: 'Mild steel specification designated for structural anchors and bends.' },
    { name: 'ASTM F1554 GR 55', tensile: 517, yieldStr: 380, classType: 'joint', info: 'High-strength low-alloy structural steel standard with 55 ksi yield.' },
    { name: 'ASTM F1554 GR 105', tensile: 862, yieldStr: 724, classType: 'joint', info: 'Highest strength thermal alloy steel specification.' },
    { name: 'ASTM A675 GR 90', tensile: 620, yieldStr: 310, classType: 'joint', info: 'Special quality hot-wrought carbon steel bars.' },
    { name: 'BS 4360 GRADE 50C', tensile: 490, yieldStr: 355, classType: 'joint', info: 'British generic high strength carbon structural weldable steel.' },
    { name: 'BS 4360 GRADE A', tensile: 430, yieldStr: 245, classType: 'joint', info: 'British entry-level general carbon steel grade.' },
    { name: 'ASTM A325', tensile: 830, yieldStr: 660, classType: 'joint', info: 'High strength heavy hex structural bolts equivalent material.' },
    { name: 'ASTM A307 GR A', tensile: 414, yieldStr: 250, classType: 'joint', info: 'Standard low-carbon carbon steel general purpose steel.' },
    { name: 'ASTM A307 GR B', tensile: 414, yieldStr: 250, classType: 'joint', info: 'Low-carbon steel designed with specific tensile limits.' },
    { name: 'BS EN 10025 S275 JR', tensile: 410, yieldStr: 275, classType: 'joint', info: 'European grade mild structural steel.' },
    { name: 'Q235', tensile: 370, yieldStr: 235, classType: 'joint', info: 'Chinese general structural mild carbon steel.' },
    { name: 'S355 JR', tensile: 470, yieldStr: 355, classType: 'joint', info: 'European structural steel offering excellent toughness.' },
    { name: 'S355 JO', tensile: 470, yieldStr: 355, classType: 'joint', info: 'European standard structural steel with 0°C impact test verification.' },
    { name: 'A354 BD', tensile: 1035, yieldStr: 896, classType: 'joint', info: 'Highest strength tempered structural alloy steel.' },
    { name: 'ASTM A193 GR B7', tensile: 860, yieldStr: 720, classType: 'joint', info: 'Chromium-molybdenum alloy steel high-temperature high-pressure pipes.' },
    { name: 'SS 304', tensile: 515, yieldStr: 205, classType: 'joint', info: 'Prevalent 18-8 type austenitic stainless steel with basic corrosion resistance.' },
    { name: 'SS 316', tensile: 515, yieldStr: 205, classType: 'joint', info: 'Marine alloy steel with molybdenum addition to resist chlorides and sea acids.' },
    { name: 'SS 316L', tensile: 485, yieldStr: 170, classType: 'joint', info: 'Extra-low carbon version of SS316 specifically targeting welding durability.' },
    { name: 'ASTM A193 GR B8', tensile: 515, yieldStr: 205, classType: 'joint', info: 'Austenitic SS304 grade bolt optimized for high-pressure cryogenic units.' },
    { name: 'ASTM A193 GR B8M', tensile: 515, yieldStr: 205, classType: 'joint', info: 'Austenitic SS316 grade bolt optimized for harsh oil-drilling chemical pipelines.' }
  ];

  const INCH_GRADES: UBoltGrade[] = [
    { name: 'GRADE 5', tensile: 120, yieldStr: 92, classType: 'imperial', info: 'Medium strength carbon steel corresponding to SAE J429.' },
    { name: 'GRADE 8', tensile: 150, yieldStr: 130, classType: 'imperial', info: 'High strength tempered alloy steel core corresponding to SAE J429.' },
    { name: 'ASTM A36', tensile: 58, yieldStr: 36, classType: 'joint', info: 'Highly weldable general mild carbon design steel standard (Imperial conversion).' },
    { name: 'ASTM F1554 GR 36', tensile: 58, yieldStr: 36, classType: 'joint', info: 'Mild steel anchor specifies 36 ksi yield for structural tension hook.' },
    { name: 'ASTM F1554 GR 55', tensile: 75, yieldStr: 55, classType: 'joint', info: 'High strength, low alloy 55 ksi yield strength structural standard.' },
    { name: 'ASTM F1554 GR 105', tensile: 125, yieldStr: 105, classType: 'joint', info: 'Heavy duty quenched alloy 105 ksi yield structural standard.' },
    { name: 'ASTM A675 GR 90', tensile: 90, yieldStr: 45, classType: 'joint', info: 'Special quality carbon steel with 90 ksi tensile specification.' },
    { name: 'BS 4360 GRADE 50C', tensile: 71, yieldStr: 51, classType: 'joint', info: 'British steel standard conversion for 50C high strength alloy.' },
    { name: 'BS EN 10025 S275 JR', tensile: 59, yieldStr: 40, classType: 'joint', info: 'Standard structural steel with 40 ksi conversion yield.' },
    { name: 'BS 4360 GRADE A', tensile: 62, yieldStr: 35, classType: 'joint', info: 'British standard general carbon structural steel.' },
    { name: 'ASTM A325', tensile: 120, yieldStr: 92, classType: 'imperial', info: 'Heavy design structural connection high strength standard.' },
    { name: 'ASTM A307 GR A', tensile: 60, yieldStr: 36, classType: 'imperial', info: 'Standard low-carbon carbon steel general purpose steel.' },
    { name: 'ASTM A307 GR B', tensile: 60, yieldStr: 36, classType: 'imperial', info: 'Low-carbon steel designed with specific tensile limits.' },
    { name: 'Q235', tensile: 54, yieldStr: 34, classType: 'joint', info: 'Chinese standard carbon steel conversion for imperial calculation.' },
    { name: 'S355 JR', tensile: 70, yieldStr: 51, classType: 'joint', info: 'European standard structural steel conversion metric-to-imperial.' },
    { name: 'S355 JO', tensile: 70, yieldStr: 51, classType: 'joint', info: 'European standard structural steel heat resilient structural conversion.' },
    { name: 'A354 BD', tensile: 150, yieldStr: 130, classType: 'joint', info: 'Heavy duty alloy steel 150 ksi high grade structural bolts specification.' },
    { name: 'ASTM A193 GR B7', tensile: 125, yieldStr: 105, classType: 'joint', info: 'Heavy duty oil & gas sector high temperature chromium-moly alloy rods.' },
    { name: 'SS 304', tensile: 75, yieldStr: 30, classType: 'joint', info: 'Standard stainless steel grade with 30 ksi yield tension resistance.' },
    { name: 'SS 316', tensile: 75, yieldStr: 30, classType: 'joint', info: 'Molybdenum active marine stainless steel with 30 ksi yield strength.' },
    { name: 'SS 316L', tensile: 70, yieldStr: 25, classType: 'joint', info: 'Low carbon marine steel with 25 ksi yield strength preventing weld corrosion.' },
    { name: 'ASTM A193 GR B8', tensile: 75, yieldStr: 30, classType: 'joint', info: 'High-corrosion austenitic SS304 grade for heavy applications.' },
    { name: 'ASTM A193 GR B8M', tensile: 75, yieldStr: 30, classType: 'joint', info: 'Molybdenum active SS316 grade for toxic chemical piping.' }
  ];

  // Selected state for Designer Interface
  const [selectedSub, setSelectedSub] = useState<string>('round_bend');
  const [threadType, setThreadType] = useState<'METRIC' | 'INCHES'>('METRIC');
  const [selectedMetricGrade, setSelectedMetricGrade] = useState<string>('GRADE 8.8');
  const [selectedInchGrade, setSelectedInchGrade] = useState<string>('GRADE 8');

  // Interactive Dimension parameters values
  const [nominalPipeSize, setNominalPipeSize] = useState<string>('4"'); // 4 inch pipe default
  const [rodDiameterMetric, setRodDiameterMetric] = useState<number>(16); // M16
  const [rodDiameterInch, setRodDiameterInch] = useState<string>('5/8"'); // 5/8"
  const [threadLength, setThreadLength] = useState<number>(75); // mm of threads
  const [quantity, setQuantity] = useState<number>(150); // Order volume

  // Standard Pipe Nominals and matching Inside Widths (ID) of the U Bolt (in mm)
  const PIPE_SIZES = [
    { label: '1/2" (21.3 mm)', id_mm: 22, std_rod_mm: 6 },
    { label: '3/4" (26.7 mm)', id_mm: 28, std_rod_mm: 6 },
    { label: '1" (33.4 mm)', id_mm: 35, std_rod_mm: 8 },
    { label: '1-1/4" (42.2 mm)', id_mm: 43, std_rod_mm: 10 },
    { label: '1-1/2" (48.3 mm)', id_mm: 50, std_rod_mm: 10 },
    { label: '2" (60.3 mm)', id_mm: 62, std_rod_mm: 12 },
    { label: '2-1/2" (73.0 mm)', id_mm: 75, std_rod_mm: 12 },
    { label: '3" (88.9 mm)', id_mm: 90, std_rod_mm: 12 },
    { label: '4" (114.3 mm)', id_mm: 116, std_rod_mm: 16 },
    { label: '5" (141.3 mm)', id_mm: 143, std_rod_mm: 16 },
    { label: '6" (168.3 mm)', id_mm: 171, std_rod_mm: 16 },
    { label: '8" (219.1 mm)', id_mm: 222, std_rod_mm: 20 },
    { label: '10" (273.0 mm)', id_mm: 276, std_rod_mm: 20 },
    { label: '12" (323.9 mm)', id_mm: 328, std_rod_mm: 24 }
  ];

  // Professional project tracking details block
  const [projectRef, setProjectRef] = useState('MFI-UB-453B');
  const [customerName, setCustomerName] = useState('SHARJAH SEWAGE TREATMENT DEPT');
  const [engineerName, setEngineerName] = useState('Eng. Fahim Mahmud');
  const [approvedBy, setApprovedBy] = useState('MFI SHARJAH FACTORY');

  // Inventory synchronization state
  const [showInventorySync, setShowInventorySync] = useState(false);
  const [syncPartNo, setSyncPartNo] = useState('');
  const [syncDescription, setSyncDescription] = useState('');
  const [syncFinish, setSyncFinish] = useState('HOT DIP GALVANIZED (HDG)');
  const [syncRackLocation, setSyncRackLocation] = useState('RACK-UB-01');
  const [syncOpeningStock, setSyncOpeningStock] = useState(600);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const METRIC_DIAS = [6, 8, 10, 12, 16, 20, 24, 30, 36];
  const INCH_DIAS = [
    { label: '1/4"', value: 0.25, mm: 6.35 },
    { label: '5/16"', value: 0.312, mm: 7.94 },
    { label: '3/8"', value: 0.375, mm: 9.53 },
    { label: '1/2"', value: 0.5, mm: 12.7 },
    { label: '5/8"', value: 0.625, mm: 15.875 },
    { label: '3/4"', value: 0.75, mm: 19.05 },
    { label: '7/8"', value: 0.875, mm: 22.23 },
    { label: '1"', value: 1.0, mm: 25.4 }
  ];

  // Search/Filters states
  const [matrixSearch, setMatrixSearch] = useState('');
  const [activeMatrixHover, setActiveMatrixHover] = useState<{
    subName: string;
    thread: 'METRIC' | 'INCHES';
    grade: string;
    details: string;
    tensileVal: string;
    yieldVal: string;
  } | null>(null);

  // Dynamic values calculation inside useMemo standard react pattern
  const computedSpecs = useMemo(() => {
    // 1. Determine active Rod Diameter in mm standard
    let dMM = 16;
    let rodLabel = 'M16';
    if (threadType === 'METRIC') {
      dMM = rodDiameterMetric;
      rodLabel = `M${rodDiameterMetric}`;
    } else {
      const match = INCH_DIAS.find(i => i.label === rodDiameterInch);
      if (match) {
        dMM = match.mm;
        rodLabel = match.label;
      }
    }

    // 2. Determine target pipe ID and inside width
    const matchingPipe = PIPE_SIZES.find(p => p.label.startsWith(nominalPipeSize)) || PIPE_SIZES[8];
    const insideWidthID = matchingPipe.id_mm;

    // Inside Height is typically insideWidthID + 30-50mm to clear standard isolation pads
    const insideHeightH = insideWidthID + 40;

    // Total raw development length of the structural U-Bolt rod:
    // Approximately: L_roll = (PI * (ID + d) / 2) + 2 * (Height_H - (ID / 2))
    const archLength = (Math.PI * (insideWidthID + dMM)) / 2;
    const legLength = 2 * (insideHeightH - (insideWidthID / 2));
    const totalDevelopmentLengthMM = archLength + legLength;

    // Cross Sectional Area
    const areaSqMm = (Math.PI * Math.pow(dMM, 2)) / 4;

    // Total Rod weight computation
    const volumeM3 = (areaSqMm / 1000000) * (totalDevelopmentLengthMM / 1000);
    const unitWeightKg = volumeM3 * 7850;
    const totalWeightKg = unitWeightKg * quantity;

    // Force calculations
    let currentGradeName = '';
    let tensileStrengthMPa = 400;
    let yieldStrengthMPa = 240;
    let gradeBio = '';

    if (threadType === 'METRIC') {
      currentGradeName = selectedMetricGrade;
      const gMatch = METRIC_GRADES.find(g => g.name === selectedMetricGrade);
      if (gMatch) {
        tensileStrengthMPa = gMatch.tensile;
        yieldStrengthMPa = gMatch.yieldStr;
        gradeBio = gMatch.info;
      }
    } else {
      currentGradeName = selectedInchGrade;
      const gMatch = INCH_GRADES.find(g => g.name === selectedInchGrade);
      if (gMatch) {
         tensileStrengthMPa = gMatch.tensile * 6.89476;
         yieldStrengthMPa = gMatch.yieldStr * 6.89476;
         gradeBio = gMatch.info;
      }
    }

    // Structural capacities. A U-bolt acts as two tension limbs.
    // Tension load is supported on two thread paths.
    // Yield Capacity = 2 (legs) * Area * YieldStrength
    const ultimateStressCapacityKN = (2 * tensileStrengthMPa * areaSqMm) / 1000;
    const yieldStressCapacityKN = (2 * yieldStrengthMPa * areaSqMm) / 1000;
    const safeAllowableTensionKN = yieldStressCapacityKN / 2.0; // Higher safety factor for vibration / thermal expansion piping

    return {
      dMM,
      rodLabel,
      insideWidthID,
      insideHeightH,
      totalDevelopmentLengthMM,
      areaSqMm,
      unitWeightKg,
      totalWeightKg,
      gradeName: currentGradeName,
      gradeBio,
      ultimateStressCapacityKN,
      yieldStressCapacityKN,
      safeAllowableTensionKN
    };
  }, [threadType, rodDiameterMetric, rodDiameterInch, nominalPipeSize, quantity, selectedMetricGrade, selectedInchGrade]);

  useEffect(() => {
    const rLabel = computedSpecs.rodLabel;
    const gradeLabel = computedSpecs.gradeName;
    const cleanGrade = gradeLabel.replace(/[^a-zA-Z0-9]/g, '');
    const cleanSub = selectedSub.toUpperCase().replace(/_/g, '');
    const cleanPipe = nominalPipeSize.replace(/"/g, '').replace(/\s+/g, '').replace(/\//g, '_');
    
    setSyncPartNo(`MFI-UB-${cleanSub}-${cleanPipe}-${rLabel.replace(/"/g, '').replace(/\//g, '_')}-${cleanGrade}`);
    
    const subObj = uBoltSubCategories.find(s => s.id === selectedSub);
    const subName = subObj ? subObj.name : 'U BOLT';
    setSyncDescription(`${subName} FOR ${nominalPipeSize} PIPE (${rLabel}) (${gradeLabel})`);
  }, [selectedSub, threadType, nominalPipeSize, rodDiameterMetric, rodDiameterInch, selectedMetricGrade, selectedInchGrade, computedSpecs.insideWidthID, computedSpecs.insideHeightH]);

  const handlePrintSpecs = () => {
    window.print();
  };

  const handleCopySpecs = () => {
    const text = `⚓ MARINE FASTENERS - COHMES / U-BOLT DESIGN
Type: ${uBoltSubCategories.find(s => s.id === selectedSub)?.name}
Nominal Pipe Size: ${nominalPipeSize}
Rod Dimension: ${computedSpecs.rodLabel}
Material/Grade: ${computedSpecs.gradeName}
Selected Coordinates:
- Inside Width (ID): ${computedSpecs.insideWidthID} mm
- Inside Height (H): ${computedSpecs.insideHeightH} mm
- Rod Path Cross-Sectional Area: ${computedSpecs.areaSqMm.toFixed(1)} mm²
- Core Fabrication Length: ${computedSpecs.totalDevelopmentLengthMM.toFixed(0)} mm
Calculated Strengths:
- Solid Unit Rod Weight: ${computedSpecs.unitWeightKg.toFixed(3)} kg/pc
- Ultimate Load limit: ${computedSpecs.ultimateStressCapacityKN.toFixed(1)} kN
- Yield Load limit: ${computedSpecs.yieldStressCapacityKN.toFixed(1)} kN
- Safe Engineering Tension Allowance (F.S 2.0): ${computedSpecs.safeAllowableTensionKN.toFixed(1)} kN`;

    navigator.clipboard.writeText(text);
    setCopiedText("Copied successfully!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSyncToInventory = () => {
    const savedStr = localStorage.getItem('mf_std_products');
    let categories: any[] = [];
    if (savedStr) {
      try {
        categories = JSON.parse(savedStr);
      } catch (e) {
        console.error(e);
      }
    }
    
    let cat = categories.find(c => c.name.toLowerCase() === "u bolts");
    if (!cat) {
      cat = { id: 'cat_u_bolts', name: 'U BOLTS', subcategories: [] };
      categories.push(cat);
    }
    
    const uboltSubcatMap: Record<string, string> = {
      'round_bend': 'ROUND BEND U BOLT',
      'square_bend': 'SQUARE BEND U BOLTS',
      'neoprene_sleeve': 'NEOPRENE SLEEVE U BOLT',
      'rubber_ptfe_pad': 'U BOLTS RUBBER LINED WITH PTFE PAD',
      'rubber_moulded_sleeve': 'RUBBER MOULDED SLEEVED U BOLT',
      'ptfe_sleeve_pad': 'U BOLT WITH PTFE SLEEVE & PAD',
      'pu_coating_rubber_pad': 'U BOLT WITH PU COATING WITH RUBBER PAD LINED',
      'silicone_rubber_lined': 'U BOLT WITH SILICONE RUBBER LINED',
      'neoprene_sleeve_round': 'NEOPRENE SLEEVE ROUND TYPE-1',
      'insulated_u_bolts': 'INSULATED U BOLTS',
      'u_bolt_plate': 'U BOLT PLATE',
      'exhaust_clamps': 'EXHAUST CLAMPS'
    };
    
    const subName = uboltSubcatMap[selectedSub] || 'ROUND BEND U BOLT';
    let sub = cat.subcategories.find((s: any) => s.name.toUpperCase() === subName.toUpperCase());
    if (!sub) {
      sub = { id: 'sub_' + selectedSub, name: subName, threadTypes: [] };
      cat.subcategories.push(sub);
    }
    
    let tType = sub.threadTypes.find((t: any) => t.name === threadType);
    if (!tType) {
      tType = { id: 'tt_' + threadType.toLowerCase(), name: threadType, grades: [] };
      sub.threadTypes.push(tType);
    }
    
    const activeGradeName = threadType === 'METRIC' ? selectedMetricGrade : selectedInchGrade;
    const matchGradeName = (dbGradeName: string, selectedGradeName: string): boolean => {
      const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace('grade', 'gr');
      return clean(dbGradeName) === clean(selectedGradeName);
    };
    
    let gradeObj = tType.grades.find((g: any) => matchGradeName(g.name, activeGradeName));
    if (!gradeObj) {
      gradeObj = { id: 'gr_' + activeGradeName.toLowerCase().replace(/\s+/g, '_'), name: activeGradeName.toUpperCase(), rows: [] };
      tType.grades.push(gradeObj);
    }
    
    const rodLabel = computedSpecs.rodLabel;
    const extraDimValues: Record<string, string> = {};
    const subLowed = selectedSub.toLowerCase();
    if (selectedSub === 'round_bend') {
      extraDimValues['dimA'] = rodLabel; // A: Rod nominal diameter
      extraDimValues['threadD'] = threadLength + ' mm'; // D: Thread portion
      extraDimValues['dimB'] = computedSpecs.insideHeightH + ' mm'; // B: Length B
      extraDimValues['dimC'] = computedSpecs.insideWidthID + ' mm'; // C: Inside width C
    } else if (selectedSub === 'square_bend') {
      extraDimValues['dimA'] = rodLabel; // A: Rod nominal d
      extraDimValues['threadD'] = threadLength + ' mm'; // D: Thread portion
      extraDimValues['dimB'] = computedSpecs.insideHeightH + ' mm'; // B: Height
      extraDimValues['dimC'] = computedSpecs.insideWidthID + ' mm'; // C: Inside width
    } else if (selectedSub === 'neoprene_sleeve' || selectedSub === 'silicone_rubber_lined') {
      extraDimValues['threadD'] = rodLabel; // D
      extraDimValues['dimC'] = computedSpecs.insideWidthID + ' mm'; // C
      extraDimValues['threadL'] = threadLength + ' mm'; // L
      extraDimValues['dimA'] = rodLabel;
      extraDimValues['dimB'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimD'] = threadLength + ' mm';
      extraDimValues['dimE'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimF'] = computedSpecs.insideHeightH + ' mm';
    } else if (selectedSub === 'rubber_ptfe_pad') {
      extraDimValues['dimA'] = rodLabel;
      extraDimValues['dimB'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimC'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimD'] = threadLength + ' mm';
      extraDimValues['dimE'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimF'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimG'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimH'] = threadLength + ' mm';
    } else if (selectedSub === 'rubber_moulded_sleeve' || selectedSub === 'ptfe_sleeve_pad' || selectedSub === 'pu_coating_rubber_pad' || selectedSub === 'insulated_u_bolts') {
      extraDimValues['dimA'] = rodLabel;
      extraDimValues['dimB'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimC'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimD'] = threadLength + ' mm';
      extraDimValues['dimE'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimF'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimG'] = threadLength + ' mm';
      extraDimValues['innerDia'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['outerDia'] = (computedSpecs.insideWidthID + 10) + ' mm';
      extraDimValues['thickness'] = '5 mm';
    } else if (subLowed.includes('neoprene_sleeve_round') || subLowed.includes('round_type')) {
      extraDimValues['innerDia'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['outerDia'] = (computedSpecs.insideWidthID + 10) + ' mm';
      extraDimValues['thickness'] = '5 mm';
    } else if (selectedSub === 'u_bolt_plate') {
      extraDimValues['dimA'] = rodLabel;
      extraDimValues['dimB'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimC'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimD'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimE'] = computedSpecs.insideHeightH + ' mm';
    } else if (selectedSub === 'exhaust_clamps') {
      extraDimValues['dimA'] = rodLabel;
      extraDimValues['dimB'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimC'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimD'] = threadLength + ' mm';
      extraDimValues['dimE'] = computedSpecs.insideWidthID + ' mm';
      extraDimValues['dimF'] = computedSpecs.insideHeightH + ' mm';
      extraDimValues['dimG'] = threadLength + ' mm';
      extraDimValues['dimH'] = computedSpecs.insideWidthID + ' mm';
    }
    
    const newRow = {
      id: 'p_row_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      partNo: syncPartNo.toUpperCase(),
      description: syncDescription.toUpperCase(),
      dia: rodLabel,
      pitch: computedSpecs.insideWidthID + ' mm',
      length: computedSpecs.insideHeightH + ' mm',
      ...extraDimValues,
      openingStock: Number(syncOpeningStock),
      inStock: 0,
      outGoingStock: 0,
      balanceStock: Number(syncOpeningStock),
      tallyStock: Number(syncOpeningStock),
      unitWeight: Number(computedSpecs.unitWeightKg),
      totalWeight: Number(syncOpeningStock) * Number(computedSpecs.unitWeightKg),
      finish: syncFinish.toUpperCase(),
      rackLocation: syncRackLocation.toUpperCase(),
      marking: 'MFI',
      unit: 'PCS'
    };
    
    const existsIdx = gradeObj.rows.findIndex((r: any) => r.partNo.toUpperCase() === syncPartNo.toUpperCase());
    if (existsIdx >= 0) {
      gradeObj.rows[existsIdx] = newRow;
    } else {
      gradeObj.rows.push(newRow);
    }
    
    localStorage.setItem('mf_std_products', JSON.stringify(categories));
    window.dispatchEvent(new Event('mfi-inventory-updated'));
    
    setSyncSuccessMsg(`SUCCESSFULLY SYNCED "${syncPartNo.toUpperCase()}" TO CENTRAL STOCK INVENTORY!`);
    setTimeout(() => {
      setSyncSuccessMsg(null);
      setShowInventorySync(false);
    }, 3500);
  };

  const filteredSubCategories = useMemo(() => {
    return uBoltSubCategories.filter(sub => 
      sub.name.toLowerCase().includes(matrixSearch.toLowerCase()) || 
      sub.description.toLowerCase().includes(matrixSearch.toLowerCase())
    );
  }, [matrixSearch]);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md select-none print-container max-w-7xl mx-auto">
      {/* Upper header */}
      <div className="bg-[#1e293b] text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#f37021] text-slate-950 p-2 border border-white shrink-0">
            <Anchor className="w-5 h-5 text-slate-900 rotate-180" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              U-BOLTS TECHNICAL DESIGN TERMINAL
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FAHIM MAHMUD DESIGN SUITE • AJMAN UAE • U-BOLTS SPEC SHEET RULES
            </p>
          </div>
        </div>

        {/* Tab switchers controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('designer')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'designer' 
                ? 'bg-[#f37021] text-slate-950 border-[#f37021]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" /> SPEC DESIGNER
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'matrix' 
                ? 'bg-[#f37021] text-slate-950 border-[#f37021]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5" /> GRADES MATRIX
            </span>
          </button>
        </div>
      </div>

      {/* MATRIX TAB VIEW */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-6 no-print">
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong>U-BOLT SPECIFICATIONS MATRIX:</strong> Replicated with absolute visual accuracy from the physical sheets of Marine Fasteners Industries LLC. Standard metric types support continuous standard classifications. Stainless grades ASTM A193 B8 (SS304) and B8M (SS316) are highlighted at high cryogenic oil & gas ratings.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-2.5 border border-slate-200">
            <input
              type="text"
              placeholder="Search sub-categories (e.g. Teflon, Rubber Lined)..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full sm:w-80 p-2 pl-3 py-1 text-[10px] bg-white border border-slate-300 rounded-none font-bold uppercase placeholder:text-slate-400 focus:border-[#f37021] outline-none"
            />
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
              U-BOLT CATEGORIES: {filteredSubCategories.length} Types
            </div>
          </div>

          {/* Matrix table structure */}
          <div className="overflow-x-auto border border-slate-900">
            <table className="w-full text-left border-collapse text-[10px] font-sans">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[8.5px] border-b border-slate-950 select-none">
                  <th className="p-2 border-r border-slate-700 min-w-[100px] sticky left-0 bg-slate-900 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Category</th>
                  <th className="p-2 border-r border-slate-700 min-w-[160px] sticky left-[100px] bg-slate-900 z-10">Sub Category</th>
                  <th className="p-2 border-r border-slate-700 text-center w-20">Thread Series</th>
                  {METRIC_GRADES.map((g, idx) => (
                    <th key={idx} className="p-1 border-r border-slate-700 text-center min-w-[70px] max-w-[85px] leading-tight" title={g.info}>
                      <div className="max-w-[75px] truncate font-bold font-mono text-[8px]">{g.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubCategories.map((sub, sIdx) => (
                  <React.Fragment key={sub.id}>
                    {/* METRIC ROW */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 font-bold uppercase text-slate-900 text-[9px] border-r border-slate-300 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]" rowSpan={2}>
                        U BOLTS
                      </td>
                      <td className="p-2 font-bold uppercase text-slate-800 text-[8.5px] border-r border-slate-300 bg-white sticky left-[100px] z-10">
                        {sub.name}
                      </td>
                      <td className="p-1 text-center font-mono font-bold border-r border-slate-300 text-teal-700 text-[8.5px] bg-teal-50/20">
                        METRIC
                      </td>
                      {METRIC_GRADES.map((g, mIdx) => {
                        const isApplicable = true; // All major standard selections exist
                        return (
                          <td 
                            key={mIdx}
                            className="p-1 text-center border-r border-slate-300 align-middle hover:bg-amber-100 transition-colors cursor-help bg-emerald-50/30"
                            onMouseEnter={() => setActiveMatrixHover({
                              subName: sub.name,
                              thread: 'METRIC',
                              grade: g.name,
                              details: g.info,
                              tensileVal: `${g.tensile} MPa`,
                              yieldVal: `${g.yieldStr} MPa`
                            })}
                            onMouseLeave={() => setActiveMatrixHover(null)}
                          >
                            <div className="flex flex-col items-center justify-center font-bold text-emerald-800 select-none">
                              <Check className="w-2.5 h-2.5 text-emerald-600 mb-0.5" />
                              <span className="text-[6px] tracking-tighter text-slate-400">OK</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* INCHES ROW */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2 font-bold uppercase text-slate-800 text-[8.5px] border-r border-slate-300 bg-white sticky left-[100px] z-10">
                        {sub.name}
                      </td>
                      <td className="p-1 text-center font-mono font-bold border-r border-slate-300 text-amber-700 text-[8.5px] bg-amber-50/20">
                        INCHES
                      </td>
                      {INCH_GRADES.map((g, iIdx) => {
                        return (
                          <td 
                            key={iIdx}
                            className="p-1 text-center border-r border-slate-300 align-middle hover:bg-amber-100 transition-colors cursor-help bg-blue-50/30"
                            onMouseEnter={() => setActiveMatrixHover({
                              subName: sub.name,
                              thread: 'INCHES',
                              grade: g.name,
                              details: g.info,
                              tensileVal: `${g.tensile} ksi (~${Math.round(g.tensile * 6.89)} MPa)`,
                              yieldVal: `${g.yieldStr} ksi (~${Math.round(g.yieldStr * 6.89)} MPa)`
                            })}
                            onMouseLeave={() => setActiveMatrixHover(null)}
                          >
                            <div className="flex flex-col items-center justify-center font-bold text-blue-800 select-none">
                              <Check className="w-2.5 h-2.5 text-blue-600 mb-0.5" />
                              <span className="text-[6px] tracking-tighter text-slate-400">OK</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dynamic Specs Details Bar */}
          <div className="bg-slate-900 text-white p-4 border-l-4 border-[#f37021] min-h-[90px] flex items-center justify-between flex-wrap gap-4">
            {activeMatrixHover ? (
              <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#f37021] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#f37021]" />
                    {activeMatrixHover.subName} • {activeMatrixHover.thread} THREAD • {activeMatrixHover.grade}
                  </div>
                  <p className="text-[9.5px] text-slate-300 leading-relaxed font-sans font-medium">{activeMatrixHover.details}</p>
                </div>
                <div className="flex gap-4 shrink-0 font-mono tracking-wide text-right text-[10px]">
                  <div className="border border-slate-700 p-1.5 px-3 bg-slate-950/40">
                    <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Tensile Limit</span>
                    <span className="text-[#f37021] font-bold">{activeMatrixHover.tensileVal}</span>
                  </div>
                  <div className="border border-slate-700 p-1.5 px-3 bg-slate-950/40">
                    <span className="block text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Yield Capacity</span>
                    <span className="text-emerald-400 font-bold">{activeMatrixHover.yieldVal}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic text-[10px] w-full text-center py-2 uppercase font-mono tracking-widest font-bold">
                💡 Hover your mouse cursor over any grid status box above to inspect mechanical specifications.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DESIGNER & SPEC GENERATOR TAB */}
      {activeTab === 'designer' && (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 no-print bg-white">
          
          {/* CONTROL SECTION (5 COLS SPAN) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-4">
              <div className="border-b border-slate-300 pb-2.5">
                <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#f37021]" />
                  U-Bolt Coordinates
                </h4>
              </div>

              {/* U-Bolt Type Select */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">U-Bolt Configuration</label>
                <select
                  value={selectedSub}
                  onChange={(e) => setSelectedSub(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-semibold focus:outline-none focus:border-[#f37021] uppercase text-slate-800"
                >
                  {uBoltSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <span className="block text-[8px] text-slate-400 italic font-medium mt-1 uppercase">
                  {uBoltSubCategories.find(s => s.id === selectedSub)?.description}
                </span>
              </div>

              {/* Thread Standard Toggle */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Internal Thread System</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setThreadType('METRIC')}
                    className={`py-1 px-3 text-[9px] font-bold uppercase tracking-wider border cursor-pointer text-center ${
                      threadType === 'METRIC'
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    METRIC (mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThreadType('INCHES')}
                    className={`py-1 px-3 text-[9px] font-bold uppercase tracking-wider border cursor-pointer text-center ${
                      threadType === 'INCHES'
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    INCHES (Inch)
                  </button>
                </div>
              </div>

              {/* Nominal Pipe Size */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nominal Pipe Size to Fit (inches)</label>
                <select
                  value={nominalPipeSize}
                  onChange={(e) => setNominalPipeSize(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800 font-mono"
                >
                  {PIPE_SIZES.map((p) => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Rod Diameter Selection */}
              <div className="grid grid-cols-2 gap-3.5">
                {threadType === 'METRIC' ? (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rod Nominal d</label>
                    <select
                      value={rodDiameterMetric}
                      onChange={(e) => setRodDiameterMetric(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-mono font-bold focus:outline-none focus:border-[#f37021] text-slate-800 h-8"
                    >
                      {METRIC_DIAS.map((d) => (
                        <option key={d} value={d}>M{d}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rod Nominal d</label>
                    <select
                      value={rodDiameterInch}
                      onChange={(e) => setRodDiameterInch(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-mono font-bold focus:outline-none focus:border-[#f37021] text-slate-800 h-8"
                    >
                      {INCH_DIAS.map((d) => (
                        <option key={d.label} value={d.label}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Material Grade Selection */}
                {threadType === 'METRIC' ? (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Steel Grade</label>
                    <select
                      value={selectedMetricGrade}
                      onChange={(e) => setSelectedMetricGrade(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-sans font-bold focus:outline-none focus:border-[#f37021] text-slate-800 h-8 uppercase"
                    >
                      {METRIC_GRADES.map((g) => (
                        <option key={g.name} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Steel Grade</label>
                    <select
                      value={selectedInchGrade}
                      onChange={(e) => setSelectedInchGrade(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-sans font-bold focus:outline-none focus:border-[#f37021] text-slate-800 h-8 uppercase"
                    >
                      {INCH_GRADES.map((g) => (
                        <option key={g.name} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Thread portions dynamic sizing */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Thread portion (T)</span>
                    <span className="font-mono text-[9px] text-[#f37021]">{threadLength} mm</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="5"
                    value={threadLength}
                    onChange={(e) => setThreadLength(Number(e.target.value))}
                    className="w-full accent-[#f37021]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Manufacturing Qty</span>
                    <span className="font-mono text-[9px] text-indigo-600 font-bold">{quantity} PCS</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* UAE Project Reference Metadata */}
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block border-b border-slate-300 pb-1">UAE Project details</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Project Ref No</label>
                  <input
                    type="text"
                    value={projectRef}
                    onChange={(e) => setProjectRef(e.target.value)}
                    className="w-full p-1 px-2 border border-slate-300 text-[10px] uppercase font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Approved Office Authority</label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full p-1 px-2 border border-slate-300 text-[10px] uppercase font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Piping Contractor</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-1 px-2 border border-slate-300 text-[10px] uppercase font-sans font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Design Engineer</label>
                  <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    className="w-full p-1 px-2 border border-slate-300 text-[10px] uppercase font-sans font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Actions triggers */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handlePrintSpecs}
                  className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-900 hover:bg-slate-950 text-white p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent shadow-sm"
                >
                  <Printer className="w-4 h-4 text-[#f37021]" /> PRINT SPEC SHEET
                </button>
                <button
                  type="button"
                  onClick={handleCopySpecs}
                  className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  {copiedText || "COPY SPEC DATA"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowInventorySync(!showInventorySync)}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-[#f37021] hover:bg-[#e05f10] text-slate-950 p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm font-bold"
              >
                <FolderPlus className="w-4 h-4 text-slate-950" /> ADD TO CENTRAL STOCK LEDGER
              </button>
            </div>

            {/* Inventory Sync Panel */}
            {showInventorySync && (
              <div className="bg-slate-50 border-2 border-dashed border-[#f37021] p-4 space-y-3 mt-3 animate-pulse-once">
                <div className="flex items-center gap-2 text-[#f37021] border-b border-slate-200 pb-1.5">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">STOCK INVENTORY REGISTRATION</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Part Number (Auto-Generated)</label>
                    <input
                      type="text"
                      value={syncPartNo}
                      onChange={(e) => setSyncPartNo(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-none text-[9.5px] font-mono font-bold focus:outline-none focus:border-[#f37021]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Product Description</label>
                    <input
                      type="text"
                      value={syncDescription}
                      onChange={(e) => setSyncDescription(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-none text-[9.5px] font-bold uppercase focus:outline-none focus:border-[#f37021]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Material Surface Finish</label>
                      <select
                        value={syncFinish}
                        onChange={(e) => setSyncFinish(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[9.5px] font-bold uppercase focus:outline-none focus:border-[#f37021]"
                      >
                        <option value="HOT DIP GALVANIZED (HDG)">HOT DIP GALVANIZED (HDG)</option>
                        <option value="ELECTRO GALVANIZED (EG)">ELECTRO GALVANIZED (EG)</option>
                        <option value="YELLOW ZINC PLATED">YELLOW ZINC PLATED</option>
                        <option value="SELF COLOR (BLACK)">SELF COLOR (BLACK)</option>
                        <option value="STAINLESS STEEL GRADE 304">STAINLESS STEEL 304</option>
                        <option value="STAINLESS STEEL GRADE 316">STAINLESS STEEL 316</option>
                        <option value="PTFE FLUOROCARBON COATING">PTFE FLUOROCARBON</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Warehouse Rack Location</label>
                      <input
                        type="text"
                        value={syncRackLocation}
                        onChange={(e) => setSyncRackLocation(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-none text-[9.5px] font-mono font-bold uppercase focus:outline-none focus:border-[#f37021]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Initial Opening Stock (PCS)</label>
                      <input
                        type="number"
                        min="0"
                        value={syncOpeningStock}
                        onChange={(e) => setSyncOpeningStock(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[9.5px] font-mono font-bold focus:outline-none focus:border-[#f37021]"
                      />
                    </div>
                    
                    <div className="text-right">
                      <span className="block text-[7.5px] font-bold text-slate-400 uppercase">CALCULATED UNIT WEIGHT</span>
                      <span className="text-[11px] font-mono font-bold text-slate-700">{computedSpecs.unitWeightKg.toFixed(4)} kg</span>
                    </div>
                  </div>

                  {syncSuccessMsg && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2 text-[9px] font-bold uppercase text-center tracking-wider animate-bounce">
                      {syncSuccessMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSyncToInventory}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-mono text-[9.5px] font-bold py-2 uppercase tracking-widest flex items-center justify-center gap-1.5"
                  >
                    <Database className="w-3.5 h-3.5 text-[#f37021]" /> SAVE & SYNCHRONIZE NOW
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: VECTOR blueprint AND COMPUTATIONS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual Vector Container block */}
            <div className="border border-slate-900 bg-slate-950 text-slate-300 p-4 space-y-3.5 relative">
              <div className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-800 px-2.5 py-0.5 font-mono text-[8.5px] font-bold text-[#f37021] tracking-wider uppercase">
                Vector Cad Engine
              </div>

              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f37021]">
                  DYNAMIC PIPELINE U-BOLT SCHEMATIC
                </h3>
                <p className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Live dimensioning system matching industrial UAE pipeline tolerances
                </p>
              </div>

              {/* SVG drawing block */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 500 240" className="w-full max-w-[420px] h-[200px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="ugrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#ugrid)" rx="2" />

                  {/* Draw Pipeline circle backplate */}
                  <circle cx="250" cy="115" r="50" fill="#334155" fillOpacity="0.3" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
                  <text x="250" y="118" className="font-sans font-semibold text-[8px]" fill="#cbd5e1" textAnchor="middle">PIPE DIA = {nominalPipeSize}</text>

                  {/* Draw U-Bolt rod shape */}
                  {selectedSub.includes('square') ? (
                    // Square Bend profile
                    <g>
                      {/* Left Leg */}
                      <line x1="190" y1="55" x2="190" y2="190" stroke="#94a3b8" strokeWidth="10" />
                      <line x1="190" y1="140" x2="190" y2="190" stroke="#f37021" strokeWidth="10" />
                      {/* Right Leg */}
                      <line x1="310" y1="55" x2="310" y2="190" stroke="#94a3b8" strokeWidth="10" />
                      <line x1="310" y1="140" x2="310" y2="190" stroke="#f37021" strokeWidth="10" />
                      {/* Top Horizontal portion */}
                      <line x1="185" y1="55" x2="315" y2="55" stroke="#94a3b8" strokeWidth="10" />
                    </g>
                  ) : (
                    // Round Bend profile
                    <g>
                      {/* Left Leg vertical */}
                      <line x1="190" y1="115" x2="190" y2="190" stroke="#94a3b8" strokeWidth="10" />
                      <line x1="190" y1="145" x2="190" y2="190" stroke="#f37021" strokeWidth="10" />
                      {/* Right Leg vertical */}
                      <line x1="310" y1="115" x2="310" y2="190" stroke="#94a3b8" strokeWidth="10" />
                      <line x1="310" y1="145" x2="310" y2="190" stroke="#f37021" strokeWidth="10" />
                      {/* Symmetrical semi-circle crown arc */}
                      <path d="M 190,115 A 60,60 0 0,1 310,115" stroke="#94a3b8" strokeWidth="10" fill="none" />
                    </g>
                  )}

                  {/* Optional accessories overlays based on selected isolation type */}
                  {selectedSub.includes('sleeve') && (
                    <g>
                      {/* Neoprene sleeve jacket colored green or orange insulation */}
                      <path d="M 185,115 A 65,65 0 0,1 315,115" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="3" />
                      <text x="250" y="45" className="font-mono text-[7px] text-emerald-400 font-semibold" fill="#10b981" textAnchor="middle">NEOPRENE VIBRATION SLEEVE ACTIVE</text>
                    </g>
                  )}

                  {selectedSub.includes('ptfe') && (
                    <g>
                      <rect x="180" y="110" width="140" height="8" fill="#fff" fillOpacity="0.9" rx="1" />
                      <text x="250" y="116" className="font-sans font-bold text-[6.5px] text-slate-900" fill="#000" textAnchor="middle">TEFLON sliding PTFE backing PAD</text>
                    </g>
                  )}

                  {/* Backing structural lock nuts */}
                  <rect x="182" y="180" width="16" height="8" fill="#cbd5e1" stroke="#475569" />
                  <rect x="302" y="180" width="16" height="8" fill="#cbd5e1" stroke="#475569" />

                  {/* Dimensions Lines references */}
                  {/* ID Width Line */}
                  <path d="M 195,130 L 305,130" stroke="#f37021" strokeWidth="1" strokeDasharray="2" />
                  <polygon points="195,130 200,128 200,132" fill="#f37021" />
                  <polygon points="305,130 300,128 300,132" fill="#f37021" />
                  <text x="250" y="142" className="font-mono text-[8px] font-bold" fill="#f37021" textAnchor="middle">ID = {computedSpecs.insideWidthID} mm</text>

                  {/* Inside Height H Line */}
                  <path d="M 165,55 L 165,190" stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
                  <polygon points="165,55 163,60 167,60" fill="#10b981" />
                  <polygon points="165,190 163,185 167,185" fill="#10b981" />
                  <text x="155" y="125" className="font-mono text-[8px] font-bold" fill="#10b981" textAnchor="middle" transform="rotate(-90 155 125)">Height H = {computedSpecs.insideHeightH} mm</text>

                  {/* Thread Sizing T */}
                  <path d="M 330,145 L 330,190" stroke="#38bdf8" strokeWidth="1" />
                  <polygon points="330,145 328,150 332,150" fill="#38bdf8" />
                  <polygon points="330,190 328,185 332,185" fill="#38bdf8" />
                  <text x="340" y="170" className="font-mono text-[7px] font-bold" fill="#38bdf8" textAnchor="left">Threads T = {threadLength}mm</text>
                </svg>
              </div>

              {/* Dynamic Design calculations details panel */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-none space-y-3 font-mono text-[10px]">
                <div className="text-[10.5px] font-bold text-[#f37021] uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between items-center">
                  <span>Physical Dimension calculations</span>
                  <span className="text-white text-[8px] bg-indigo-900 px-2 py-0.5 font-bold uppercase">{threadType} system</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Cross Section Area</span>
                    <span className="text-white font-bold">{computedSpecs.areaSqMm.toFixed(1)} mm²</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Total cut rod length</span>
                    <span className="text-[#f37021] font-bold">{computedSpecs.totalDevelopmentLengthMM.toFixed(0)} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Limb Count</span>
                    <span className="text-emerald-400 font-bold">2 Leg Paths</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Unit weight / pc</span>
                    <span className="text-indigo-400 font-bold">{computedSpecs.unitWeightKg.toFixed(3)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Total Batch weight</span>
                    <span className="text-amber-400 font-bold">{computedSpecs.totalWeightKg.toFixed(1)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Inner Width ID</span>
                    <span className="text-white font-bold">{computedSpecs.insideWidthID} mm</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/40 p-2 border border-slate-800">
                  <div>
                    <span className="text-[#f37021] font-bold text-[7.5px] block uppercase tracking-wider">Ultimate Break load</span>
                    <span className="text-white text-[11px] font-bold">{computedSpecs.ultimateStressCapacityKN.toFixed(1)} kN</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold text-[7.5px] block uppercase tracking-wider">Limb yielding force</span>
                    <span className="text-white text-[11px] font-bold">{computedSpecs.yieldStressCapacityKN.toFixed(1)} kN</span>
                  </div>
                  <div>
                    <span className="text-indigo-400 font-bold text-[7.5px] block uppercase tracking-wider">Allowable tension (F.S 2)</span>
                    <span className="text-emerald-400 text-[11.5px] font-bold">{computedSpecs.safeAllowableTensionKN.toFixed(1)} kN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT DISPATCHED SHEET - RENDERS TO HIGH PERFORMANCE CLEAN HIGH-CONTRAST MONOCHROME BLACK & WHITE WHEN WINDOW.PRINT IS INITIATED */}
      <div className="hidden print:block print-area p-8 space-y-6 text-black">
        <div className="border-b-4 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="font-sans font-bold text-2xl tracking-wider uppercase text-black">MARINE FASTENERS INDUSTRIES LLC</h1>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">Official U-bolt design specification certified worksheet</p>
          </div>
          <div className="text-right font-mono text-xs">
            <div>Ref: <strong>{projectRef}</strong></div>
            <div>Date Limit: {new Date().toISOString().substring(0, 10)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border border-black p-4 text-[11px] uppercase font-mono">
          <div>
            <div>CONTRACTOR: <strong>{customerName}</strong></div>
            <div>AUTHORIZED BY: <strong>{approvedBy}</strong></div>
          </div>
          <div className="text-right">
            <div>DESIGN SPECIALIST: <strong>{engineerName}</strong></div>
            <div>FABRICATION LOCATION: Ajman Free Zone UAE</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-sans font-bold uppercase text-black italic border-b border-black pb-1">1. Selected Design Coordinates & parameters</h2>
          <table className="w-full text-left border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="bg-neutral-100 border-b border-black font-sans font-bold uppercase">
                <th className="p-2 border-r border-black">Parameter Option</th>
                <th className="p-2">Selected Value Coordinate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black font-mono">
              <tr>
                <td className="p-2 border-r border-black font-bold">U-BOLT CLASSIFICATION TYPE</td>
                <td className="p-2 font-bold">{uBoltSubCategories.find(s => s.id === selectedSub)?.name}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">NOMINAL PIPE SIZE TARGETED</td>
                <td className="p-2 font-bold">{nominalPipeSize}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">ROD nominal THREADED DIA d</td>
                <td className="p-2 font-bold">{computedSpecs.rodLabel} ({threadType})</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">STEEL core MATERIAL GRADE</td>
                <td className="p-2 font-bold">{computedSpecs.gradeName}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">INSIDE WIDTH (ID)</td>
                <td className="p-2 font-bold">{computedSpecs.insideWidthID} mm</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">INSIDE HEIGHT (H)</td>
                <td className="p-2 font-bold">{computedSpecs.insideHeightH} mm</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">THREAD ENGAGEMENT PORTION T</td>
                <td className="p-2 font-bold">{threadLength} mm</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">TOTAL ROD ROLL DEVELOPMENT LENGTH</td>
                <td className="p-2 font-bold">{computedSpecs.totalDevelopmentLengthMM.toFixed(0)} mm</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-sans font-bold uppercase text-black italic border-b border-black pb-1">2. Analytical strength computations & calculations</h2>
          <table className="w-full text-left border-collapse border border-black text-[10.5px]">
            <thead>
              <tr className="bg-neutral-100 border-b border-black font-sans font-bold uppercase">
                <th className="p-2 border-r border-black">Static Engineering Parameter</th>
                <th className="p-2">Analytical Safe capacity Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black font-mono">
              <tr>
                <td className="p-2 border-r border-black font-bold">METAL CROSS SECTIONAL AREA</td>
                <td className="p-2 font-bold">{computedSpecs.areaSqMm.toFixed(1)} mm²</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">CALCULATED UNIT WEIGHT</td>
                <td className="p-2 font-bold">{computedSpecs.unitWeightKg.toFixed(3)} kg / unit pc</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">TOTAL BATCH QUANTITY ORDER</td>
                <td className="p-2 font-bold">{quantity} PCS (Net volume weight: {computedSpecs.totalWeightKg.toFixed(1)} kg)</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">ROD MATERIAL ULTIMATE TENSILE LIMIT</td>
                <td className="p-2 font-bold">{computedSpecs.ultimateStressCapacityKN.toFixed(1)} kN (Double legs tension)</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold">ROD INTEGRITY YIELD STRESS CAP</td>
                <td className="p-2 font-bold">{computedSpecs.yieldStressCapacityKN.toFixed(1)} kN</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black font-bold text-neutral-800 font-semibold bg-neutral-100">SAFE PIPELINE WORKING LOAD CAP WITH F.S 2.0</td>
                <td className="p-2 font-bold bg-neutral-100 text-[11px]">{computedSpecs.safeAllowableTensionKN.toFixed(1)} kN</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dynamic diagram for printing */}
        <div className="border border-black p-4 flex flex-col items-center justify-center space-y-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold">CRITICAL CAD blueprint REFERENCE DIAGRAM SHEET</span>
          <svg viewBox="0 0 500 180" className="w-full max-w-[320px] h-[130px]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#fff" stroke="#000" strokeWidth="1" />
            <circle cx="250" cy="90" r="40" stroke="#000" strokeWidth="1" strokeDasharray="3" />
            <path d="M 210,90 A 40,40 0 0,1 290,90" stroke="#000" strokeWidth="5" fill="none" />
            <line x1="210" y1="90" x2="210" y2="150" stroke="#000" strokeWidth="5" />
            <line x1="290" y1="90" x2="290" y2="150" stroke="#000" strokeWidth="5" />
            <text x="250" y="93" className="font-sans font-bold text-[9px]" fill="#000" textAnchor="middle">{nominalPipeSize} PIPE</text>
            <text x="250" y="142" className="font-mono text-[8px] font-bold" fill="#000" textAnchor="middle">ID = {computedSpecs.insideWidthID} mm</text>
          </svg>
        </div>

        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] font-mono uppercase">
          <div className="border-t border-black pt-2">
            <div>PREPARED BY DESIGN ENGINEER</div>
            <div className="font-bold text-[11px] mt-1">{engineerName}</div>
          </div>
          <div className="border-t border-black pt-2">
            <div>OFFICIAL MARINE FASTENERS STAMP & SIGNATURE</div>
            <div className="italic text-[9px] text-neutral-500 mt-1">Validated via ERP automated system</div>
          </div>
        </div>
      </div>
    </div>
  );
}
