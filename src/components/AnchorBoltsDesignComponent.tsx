import React, { useState, useMemo, useEffect } from 'react';
import { 
  Anchor, Ruler, FileCheck, Check, Printer, Info, HelpCircle, AlertCircle, Sparkles, Sliders, List, Grid3X3, Copy, FolderPlus, Database, ArrowRight
} from 'lucide-react';

// Define structures for the design component
export interface AnchorBoltType {
  id: string;
  name: string;
  description: string;
}

export interface MetricGrade {
  name: string;
  tensile: number; // MPa
  yieldStr: number; // MPa
  classType: 'metric' | 'joint';
  info: string;
}

export interface InchGrade {
  name: string;
  tensile: number; // ksi (for reporting, computed to MPa too)
  yieldStr: number; // ksi
  classType: 'imperial' | 'joint';
  info: string;
}

export default function AnchorBoltsDesignComponent() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'designer'>('designer');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Specifications Matrix categories list exactly matching the image
  const anchorBoltTypes: AnchorBoltType[] = [
    { id: 'straight', name: 'STRAIGHT ANCHOR BOLTS', description: 'Straight rod threaded at both ends or fully threaded for structural tension anchoring.' },
    { id: 'l_type', name: 'L TYPE ANCHOR BOLTS', description: '90-degree right angle bent anchor bolt for concrete casting foundation reinforcement.' },
    { id: 'j_type', name: 'J TYPE ANCHOR BOLTS', description: 'Curved Hook Anchor Bolt with standard bend diameter for maximum breakout resistance.' },
    { id: 'ja_type', name: 'JA TYPE ANCHOR BOLTS', description: 'Short offset hook anchor bolt with compact clearance bend profile.' },
    { id: 'eye_type', name: 'EYE TYPES FOUNDATION BOLTS', description: 'Forged or welded structural eyelet head for interlocking secure foundation connection.' },
    { id: 'split', name: 'SPLIT TYPES FOUNDATION BOLTS', description: 'Mechanically bifurcated split-end anchor system for permanent grout anchor locks.' },
    { id: 'v_cross_rod', name: 'V TYPE WITH CROSS ROD BOLTS', description: 'V-profile anchoring element equipped with horizontal locking pin at the base.' },
    { id: 'z_type', name: 'Z TYPES FOUNDATION BOLTS', description: 'Double offset Z-bend profile distributing structural wind and seismic loads efficiently.' },
    { id: 'zj_type', name: 'Z & J TYPES FOUNDATION BOLTS', description: 'Hybrid triple-bend multi-plane foundation anchor for customized engineering load distributions.' },
    { id: 'gusset_plate', name: 'GUSSET & PLATE TYPES BOLTS', description: 'Integrated base-plate anchor assemblies reinforced with welded structural triangular gussets.' },
    { id: 'welding_type', name: 'WELDING TYPE ANCHOR BOLTS', description: 'Specifically chamfered weldable steel anchor for direct shop or field structural weld adhesion.' },
    { id: 'square_bend_j', name: 'SQUARE BEND J ANCHOR BOLTS', description: 'Refined 90-degree sharp square interior hook bend anchor bolt.' },
    { id: 'j_hook', name: 'J HOOK', description: 'Traditional simple wire or heavy bar J-Bend light hook structural fasteners.' },
    { id: 'round_washer', name: 'ROUND WASHER', description: 'High-thickness flat standard circular washer components for foundation tie rods.' },
    { id: 'square_washer', name: 'SQUARE WASHER', description: 'Heavy shear resistance square plate anchor washers, customized for concrete slots.' },
    { id: 'bolt_sleeve', name: 'ANCHOR BOLT SLEEVE', description: 'Outer corrugated metallic or schedule plastic conduit sleeve to facilitate installation sizing adjustments.' },
  ];

  // Grades list exactly as depicted in columns of the design matrix
  const METRIC_GRADES: MetricGrade[] = [
    { name: 'GRADE 4.6', tensile: 400, yieldStr: 240, classType: 'metric', info: 'Low carbon structural steel grade with high ductility.' },
    { name: 'GRADE 8.8', tensile: 800, yieldStr: 640, classType: 'metric', info: 'Medium carbon quenched & tempered steel for heavy industrial anchoring.' },
    { name: 'GRADE 10.9', tensile: 1040, yieldStr: 940, classType: 'metric', info: 'High-tensile alloy steel heat treated for exceptional load bearing.' },
    { name: 'ASTM A36', tensile: 400, yieldStr: 250, classType: 'joint', info: 'Highly weldable general mild carbon design steel standard.' },
    { name: 'ASTM F1554 GRADE 36', tensile: 400, yieldStr: 248, classType: 'joint', info: 'Mild steel anchor bolt specification designated for general structures.' },
    { name: 'ASTM F1554 GRADE 55', tensile: 517, yieldStr: 380, classType: 'joint', info: 'High strength, low alloy steel with 55 ksi yield strength specification.' },
    { name: 'ASTM F1554 GRADE 105', tensile: 862, yieldStr: 724, classType: 'joint', info: 'Highest strength tempered alloy steel core anchor bolt specification.' },
    { name: 'ASTM A675 GRADE 90', tensile: 620, yieldStr: 310, classType: 'joint', info: 'Special quality hot-wrought carbon steel bars under ASTM standards.' },
    { name: 'BS 4360 GRADE 50C', tensile: 490, yieldStr: 355, classType: 'joint', info: 'British generic high strength carbon structural weldable steel.' },
    { name: 'BS EN 10025 S275 JR', tensile: 410, yieldStr: 275, classType: 'joint', info: 'European standard structural steel with 275 MPa yield strength.' },
    { name: 'Q235', tensile: 370, yieldStr: 235, classType: 'joint', info: 'Chinese standard carbon steel equivalent to mild steel structural usage.' },
    { name: 'S355 JR', tensile: 470, yieldStr: 355, classType: 'joint', info: 'European structural steel, room temperature impact test JR standard.' },
    { name: 'S355 JO', tensile: 470, yieldStr: 355, classType: 'joint', info: 'European structural steel with 0°C impact energy toughness.' },
    { name: 'A354 BD', tensile: 1035, yieldStr: 896, classType: 'joint', info: 'Quenched & tempered alloy steel bolts, heavy duty tension specification.' },
    { name: 'ASTM A193 GRADE B7', tensile: 860, yieldStr: 720, classType: 'joint', info: 'Chromium-molybdenum alloy steel for high pressure and temperature pipes.' },
    { name: 'SS 304', tensile: 515, yieldStr: 205, classType: 'joint', info: 'Classic 18-8 austenitic stainless steel with excellent corrosion resistance.' },
    { name: 'SS 316', tensile: 515, yieldStr: 205, classType: 'joint', info: 'Austenitic stainless steel with molybdenum for high marine salt corrosion resistance.' },
    { name: 'SS 316L', tensile: 485, yieldStr: 170, classType: 'joint', info: 'Extra-low carbon marine stainless steel to prevent carbide precipitation during welding.' },
  ];

  const INCH_GRADES: InchGrade[] = [
    { name: 'GRADE 5', tensile: 120, yieldStr: 92, classType: 'imperial', info: 'Medium carbon tempered imperial bolts corresponding to SAE J429.' },
    { name: 'GRADE 8', tensile: 150, yieldStr: 130, classType: 'imperial', info: 'High strength alloy tempered imperial bolts corresponding to SAE J429.' },
    // Columns shift after
    { name: 'ASTM A36', tensile: 58, yieldStr: 36, classType: 'joint', info: 'Highly weldable general mild carbon design steel standard (Imperial conversion).' },
    { name: 'ASTM F1554 GRADE 36', tensile: 58, yieldStr: 36, classType: 'joint', info: 'Mild steel anchor specifies 36 ksi yield for structural tension hook.' },
    { name: 'ASTM F1554 GRADE 55', tensile: 75, yieldStr: 55, classType: 'joint', info: 'High strength, low alloy 55 ksi yield strength structural standard.' },
    { name: 'ASTM F1554 GRADE 105', tensile: 125, yieldStr: 105, classType: 'joint', info: 'Heavy duty quenched alloy 105 ksi yield structural standard.' },
    { name: 'ASTM A675 GRADE 90', tensile: 90, yieldStr: 45, classType: 'joint', info: 'Special quality carbon steel with 90 ksi tensile specification.' },
    { name: 'BS 4360 GRADE 50C', tensile: 71, yieldStr: 51, classType: 'joint', info: 'British steel standard conversion for 50C high strength alloy.' },
    { name: 'BS EN 10025 S275 JR', tensile: 59, yieldStr: 40, classType: 'joint', info: 'Standard structural steel with 40 ksi conversion yield.' },
    { name: 'Q235', tensile: 54, yieldStr: 34, classType: 'joint', info: 'Chinese standard carbon steel conversion for imperial calculation.' },
    { name: 'S355 JR', tensile: 70, yieldStr: 51, classType: 'joint', info: 'European standard structural steel conversion metric-to-imperial.' },
    { name: 'S355 JO', tensile: 70, yieldStr: 51, classType: 'joint', info: 'European standard structural steel heat resilient structural conversion.' },
    { name: 'A354 BD', tensile: 150, yieldStr: 130, classType: 'joint', info: 'Heavy duty alloy steel 150 ksi high grade structural bolts specification.' },
    { name: 'ASTM A193 GRADE B7', tensile: 125, yieldStr: 105, classType: 'joint', info: 'Heavy duty oil & gas sector high temperature chromium-moly alloy rods.' },
    { name: 'SS 304', tensile: 75, yieldStr: 30, classType: 'joint', info: 'Standard stainless steel grade with 30 ksi yield tension resistance.' },
    { name: 'SS 316', tensile: 75, yieldStr: 30, classType: 'joint', info: 'Molybdenum active marine stainless steel with 30 ksi yield strength.' },
    { name: 'SS 316L', tensile: 70, yieldStr: 25, classType: 'joint', info: 'Low carbon marine steel with 25 ksi yield strength preventing weld corrosion.' },
  ];

  // Selected state for Designer Interface
  const [selectedType, setSelectedType] = useState<string>('l_type');
  const [threadType, setThreadType] = useState<'METRIC' | 'INCHES'>('METRIC');
  const [selectedMetricGrade, setSelectedMetricGrade] = useState<string>('GRADE 8.8');
  const [selectedInchGrade, setSelectedInchGrade] = useState<string>('GRADE 8');

  // Interactive Dimension parameters values
  const [diameterMetric, setDiameterMetric] = useState<number>(24); // M24
  const [diameterInch, setDiameterInch] = useState<string>('1"'); // 1 inch
  const [totalLength, setTotalLength] = useState<number>(600); // mm or inches depending on type
  const [threadLength, setThreadLength] = useState<number>(100); // mm or inches
  const [customBend, setCustomBend] = useState<number>(100); // standard projection / bend radius (e.g. key length for hook or width)
  const [quantity, setQuantity] = useState<number>(100); // order pricing check

  // Professional project tracking details block
  const [projectRef, setProjectRef] = useState('MFI-DXB-98A7');
  const [customerName, setCustomerName] = useState('AL FUTTAIM ENGINEERING LLC');
  const [engineerName, setEngineerName] = useState('Eng. Fahim Mahmud');
  const [approvedBy, setApprovedBy] = useState('MFI AJMAN OFFICE');

  // Inventory synchronization state
  const [showInventorySync, setShowInventorySync] = useState(false);
  const [syncPartNo, setSyncPartNo] = useState('');
  const [syncDescription, setSyncDescription] = useState('');
  const [syncFinish, setSyncFinish] = useState('HOT DIP GALVANIZED (HDG)');
  const [syncRackLocation, setSyncRackLocation] = useState('RACK-AB-01');
  const [syncOpeningStock, setSyncOpeningStock] = useState(500);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const diaLabel = threadType === 'METRIC' ? `M${diameterMetric}` : diameterInch;
    const gradeLabel = threadType === 'METRIC' ? selectedMetricGrade : selectedInchGrade;
    const cleanGrade = gradeLabel.replace(/[^a-zA-Z0-9]/g, '');
    const cleanType = selectedType.toUpperCase().replace(/_/g, '');
    
    setSyncPartNo(`MFI-AB-${cleanType}-${diaLabel.replace(/"/g, '').replace(/\//g, '_')}-${totalLength}-${cleanGrade}`);
    
    const typeObj = anchorBoltTypes.find(t => t.id === selectedType);
    const typeName = typeObj ? typeObj.name : 'ANCHOR BOLT';
    setSyncDescription(`${typeName} ${diaLabel} X ${totalLength}${threadType === 'METRIC' ? 'MM' : '"'} (${gradeLabel})`);
  }, [selectedType, threadType, diameterMetric, diameterInch, selectedMetricGrade, selectedInchGrade, totalLength]);

  // Diameter databases definitions
  const METRIC_DIAS = [12, 16, 20, 24, 27, 30, 36, 42, 48, 56, 64]; // mm
  const INCH_DIAS = [
    { label: '1/2"', value: 0.5, mm: 12.7 },
    { label: '5/8"', value: 0.625, mm: 15.875 },
    { label: '3/4"', value: 0.75, mm: 19.05 },
    { label: '7/8"', value: 0.875, mm: 22.225 },
    { label: '1"', value: 1.0, mm: 25.4 },
    { label: '1-1/8"', value: 1.125, mm: 28.575 },
    { label: '1-1/4"', value: 1.25, mm: 31.75 },
    { label: '1-1/2"', value: 1.5, mm: 38.1 },
    { label: '1-3/4"', value: 1.75, mm: 44.45 },
    { label: '2"', value: 2.0, mm: 50.8 }
  ];

  // Search Matrix state
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixFilterGrade, setMatrixFilterGrade] = useState('');

  // Active hover tooltip detail card state for the matrix cells
  const [activeMatrixHover, setActiveMatrixHover] = useState<{
    typeId: string;
    thread: 'METRIC' | 'INCHES';
    grade: string;
    details: string;
    tensileVal: string;
    yieldVal: string;
  } | null>(null);

  // Dynamic values computation inside memo hook for engineering authenticity
  const computedSpecs = useMemo(() => {
    // Determine the active diameter in millimeters first for universal steel weight calculations
    let dMM = 24;
    let diameterLabel = 'M24';
    if (threadType === 'METRIC') {
      dMM = diameterMetric;
      diameterLabel = `M${diameterMetric}`;
    } else {
      const match = INCH_DIAS.find(i => i.label === diameterInch);
      if (match) {
        dMM = match.mm;
        diameterLabel = match.label;
      }
    }

    // Steel Rod Cross-Sectional Area
    const areaSqMm = (Math.PI * Math.pow(dMM, 2)) / 4;

    // Density of Structural Carbon Steel standard = 7850 kg/m^3
    // weight is computed as Volume in m^3 * Density
    const lengthM = (threadType === 'METRIC' ? totalLength : (totalLength * 25.4)) / 1000;
    const volumeM3 = (areaSqMm / 1000000) * lengthM;
    const unitWeightKg = volumeM3 * 7850;
    const totalWeightKg = unitWeightKg * quantity;

    // Find the current design strengths based on user inputs
    let currentGradeName = '';
    let tensileStrengthMPa = 400; // MPa
    let yieldStrengthMPa = 240;   // MPa
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
        // Imperial strengths are listed in ksi. Convert ksi to MPa (1 ksi = 6.89476 MPa) for relative comparisons.
        tensileStrengthMPa = gMatch.tensile * 6.89476;
        yieldStrengthMPa = gMatch.yieldStr * 6.89476;
        gradeBio = gMatch.info;
      }
    }

    // Force calculations
    // Load Capacity = Strength * Area
    // F_ultimate = tensileStrength * Area / 1000 (expressed in kiloNewtons)
    const ultimateStressCapacityKN = (tensileStrengthMPa * areaSqMm) / 1000;
    const yieldStressCapacityKN = (yieldStrengthMPa * areaSqMm) / 1000;

    // Standard structural safety factor standard ~ 1.5 for static structures
    const safeAllowableTensionKN = yieldStressCapacityKN / 1.5;

    // Dynamic torque specification estimation standard formula = k * d * F
    // F is 75% of Yield strength. k is friction coefficient (approx 0.18 for zinc plated steels)
    const yieldForceNewtons = (yieldStrengthMPa * 0.75) * areaSqMm;
    const estimatedTorqueNm = 0.18 * (dMM / 1000) * yieldForceNewtons;

    return {
      dMM,
      diameterLabel,
      areaSqMm,
      unitWeightKg,
      totalWeightKg,
      tensileStrengthMPa,
      yieldStrengthMPa,
      gradeBio,
      gradeName: currentGradeName,
      ultimateStressCapacityKN,
      yieldStressCapacityKN,
      safeAllowableTensionKN,
      estimatedTorqueNm
    };
  }, [threadType, diameterMetric, diameterInch, totalLength, quantity, selectedMetricGrade, selectedInchGrade]);

  // Method to invoke native printing layout on the generated PDF sheet
  const handlePrintSpecs = () => {
    window.print();
  };

  // Helper trigger to copy dynamic specs metadata to clipboard
  const handleCopySpecs = () => {
    const text = `⚓ MARINE FASTENERS - ANCHOR BOLT DESIGN
Type: ${anchorBoltTypes.find(t => t.id === selectedType)?.name}
Thread System: ${threadType}
Size: ${computedSpecs.diameterLabel}
Grade: ${computedSpecs.gradeName}
Selected Dimensions: Length = ${totalLength}${threadType === 'METRIC' ? 'mm' : '"'}, Thread Length = ${threadLength}${threadType === 'METRIC' ? 'mm' : '"'}
Specifications:
- Area: ${computedSpecs.areaSqMm.toFixed(1)} mm²
- Est. Unit Weight: ${computedSpecs.unitWeightKg.toFixed(3)} kg/pc
- Ultimate Tensile Resistance: ${computedSpecs.ultimateStressCapacityKN.toFixed(1)} kN
- Solid Yield Load: ${computedSpecs.yieldStressCapacityKN.toFixed(1)} kN
- Safe Tensile Allowance (F.S 1.5): ${computedSpecs.safeAllowableTensionKN.toFixed(1)} kN
- Installation Torque Guide: ${computedSpecs.estimatedTorqueNm.toFixed(0)} Nm`;

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
    
    let cat = categories.find(c => c.name.toLowerCase() === "anchor bolts");
    if (!cat) {
      cat = { id: 'cat_anchor_bolts', name: 'ANCHOR BOLTS', subcategories: [] };
      categories.push(cat);
    }
    
    const anchorSubcatMap: Record<string, string> = {
      'straight': 'STRAIGHT ANCHOR BOLTS',
      'l_type': 'L TYPE ANCHOR BOLTS',
      'j_type': 'J TYPE ANCHOR BOLTS',
      'ja_type': 'JA TYPE ANCHOR BOLTS',
      'eye_type': 'EYE TYPES FOUNDATION BOLTS',
      'split': 'SPLIT TYPES FOUNDATION BOLTS',
      'v_cross_rod': 'V TYPE WITH CROSS ROD BOLTS',
      'z_type': 'Z TYPES FOUNDATION BOLTS',
      'zj_type': 'Z & J TYPES FOUNDATION BOLTS',
      'gusset_plate': 'GUSSET & PLATE TYPES BOLTS',
      'welding_type': 'WELDING TYPE ANCHOR BOLTS',
      'square_bend_j': 'SQUARE BEND J ANCHOR BOLTS',
      'j_hook': 'J HOOK',
      'round_washer': 'ROUND WASHER',
      'square_washer': 'SQUARE WASHER',
      'bolt_sleeve': 'ANCHOR BOLT SLEEVE'
    };
    
    const subName = anchorSubcatMap[selectedType] || 'STRAIGHT ANCHOR BOLTS';
    let sub = cat.subcategories.find((s: any) => s.name.toUpperCase() === subName.toUpperCase());
    if (!sub) {
      sub = { id: 'sub_' + selectedType, name: subName, threadTypes: [] };
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
    
    const diaLabel = threadType === 'METRIC' ? `M${diameterMetric}` : diameterInch;
    const threadUnitStr = threadType === 'METRIC' ? ' mm' : '"';
    
    const extraDimValues: Record<string, string> = {};
    if (selectedType === 'straight') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['topThreadT1'] = threadLength + threadUnitStr;
      extraDimValues['bottomThreadT2'] = threadLength + threadUnitStr;
    } else if (selectedType === 'l_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadT'] = threadLength + threadUnitStr;
      extraDimValues['bendC'] = customBend + threadUnitStr;
    } else if (selectedType === 'l_type_2') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadT'] = threadLength + threadUnitStr;
      extraDimValues['bendC'] = customBend + threadUnitStr;
      extraDimValues['dimB'] = customBend + threadUnitStr;
    } else if (selectedType === 'l_type_3') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadC'] = threadLength + threadUnitStr;
      extraDimValues['dimB'] = customBend + threadUnitStr;
      extraDimValues['bendL1'] = customBend + threadUnitStr;
      extraDimValues['bendRadius'] = '90°';
    } else if (selectedType === 'j_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadT'] = threadLength + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
    } else if (selectedType === 'ja_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadS'] = threadLength + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
      extraDimValues['dimB'] = customBend + threadUnitStr;
    } else if (selectedType === 'eye_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadT'] = threadLength + threadUnitStr;
      extraDimValues['dimE'] = customBend + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
    } else if (selectedType === 'split') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadB'] = threadLength + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
    } else if (selectedType === 'v_cross_rod') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadB'] = threadLength + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
    } else if (selectedType === 'z_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadS'] = threadLength + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
      extraDimValues['bendL1'] = customBend + threadUnitStr;
      extraDimValues['dimR'] = customBend + threadUnitStr;
      extraDimValues['dimR1'] = customBend + threadUnitStr;
    } else if (selectedType === 'zj_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadB'] = threadLength + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
      extraDimValues['dimY'] = customBend + threadUnitStr;
    } else if (selectedType === 'gusset_plate') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadB'] = threadLength + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
      extraDimValues['dimF'] = customBend + threadUnitStr;
      extraDimValues['dimH'] = customBend + threadUnitStr;
    } else if (selectedType === 'welding_type') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadB'] = threadLength + threadUnitStr;
      extraDimValues['dimC'] = customBend + threadUnitStr;
      extraDimValues['dimL1'] = customBend + threadUnitStr;
      extraDimValues['dimL2'] = customBend + threadUnitStr;
      extraDimValues['dimR'] = customBend + threadUnitStr;
      extraDimValues['dimR1'] = customBend + threadUnitStr;
    } else if (selectedType === 'square_bend_j') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadT'] = threadLength + threadUnitStr;
      extraDimValues['dimA'] = customBend + threadUnitStr;
      extraDimValues['dimB'] = customBend + threadUnitStr;
    } else if (selectedType === 'j_hook') {
      extraDimValues['threadD'] = diaLabel;
      extraDimValues['threadT'] = threadLength + threadUnitStr;
      extraDimValues['bendC'] = customBend + threadUnitStr;
      extraDimValues['dimB'] = customBend + threadUnitStr;
    }
    
    const newRow = {
      id: 'p_row_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      partNo: syncPartNo.toUpperCase(),
      description: syncDescription.toUpperCase(),
      dia: diaLabel,
      pitch: threadLength + threadUnitStr,
      length: totalLength + threadUnitStr,
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

  // Filters candidates in the main comparison matrix based on search inputs
  const filteredTypesInMatrix = useMemo(() => {
    return anchorBoltTypes.filter(type => {
      const matchText = type.name.toLowerCase().includes(matrixSearch.toLowerCase()) || 
                        type.description.toLowerCase().includes(matrixSearch.toLowerCase());
      return matchText;
    });
  }, [matrixSearch]);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md select-none print-container max-w-7xl mx-auto">
      {/* Top Controller Brand Title Header Bar */}
      <div className="bg-slate-900 text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#f37021] text-slate-950 p-2 border border-white shrink-0">
            <Anchor className="w-5 h-5 text-slate-900 animate-bounce" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              ANCHOR BOLTS SPEC & DESIGN TERMINAL
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FAHIM MAHMUD DESIGN SUITE • AJMAN UAE • AS PER OFFICIAL SPECIFICATION SHEET
            </p>
          </div>
        </div>

        {/* View Selection Segment Toggle Controls */}
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

      {/* MATRIX VIEW TAB - REPLICATES THE EXACT GRID RECEIVED IN PDF AT THE MOST PRISTINE QUALITY */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-6 no-print">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>INTERACTIVE SPECIFICATION MATRIX:</strong> This grid below matches the physical design matrix sheets of Marine Fasteners Industries LLC. Under standard production operations, <strong>both metric and inch thread steel systems</strong> support all 18 alloy grades depicted here. Hover over individual grid nodes to capture detailed physical material capabilities.
            </div>
          </div>

          {/* Quick Matrix Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-2.5 border border-slate-200">
            <div className="w-full sm:w-auto relative">
              <input
                type="text"
                placeholder="Search sub-categories..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                className="w-full sm:w-72 p-2 pl-3 py-1 text-[10px] bg-white border border-slate-300 rounded-none font-bold uppercase placeholder:text-slate-400"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
              Filtered Result Count: {filteredTypesInMatrix.length} Categories
            </div>
          </div>

          {/* Core Table Grid Wrapper */}
          <div className="overflow-x-auto border border-slate-900">
            <table className="w-full text-left border-collapse text-[10px] font-sans">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[9px] border-b border-slate-950 select-none">
                  <th className="p-2 border-r border-slate-700 min-w-[120px] max-w-[150px] sticky left-0 bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Category</th>
                  <th className="p-2 border-r border-slate-700 min-w-[140px] max-w-[180px] sticky left-[120px] bg-slate-900">Sub Category</th>
                  <th className="p-2 border-r border-slate-700 text-center w-20">Thread Series</th>
                  {/* Render exact grades columns matching high-fidelity PDF layout */}
                  {METRIC_GRADES.map((g, idx) => (
                    <th key={idx} className="p-2 border-r border-slate-700 text-center min-w-[70px] max-w-[90px] vertical-text text-[8.5px] leading-tight" title={g.info}>
                      <div className="max-w-[75px] truncate font-bold">{g.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredTypesInMatrix.map((type, typeIdx) => (
                  <React.Fragment key={typeIdx}>
                    {/* ROW-1: METRIC RUNTIME */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 font-bold uppercase text-slate-900 text-[9.5px] border-r border-slate-300 bg-white sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)]" rowSpan={2}>
                        ANCHOR BOLTS
                      </td>
                      <td className="p-2.5 font-bold uppercase text-slate-800 text-[9px] border-r border-slate-300 bg-white sticky left-[120px]">
                        {type.name}
                      </td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-300 text-teal-700 text-[8.5px]">
                        METRIC
                      </td>
                      {METRIC_GRADES.map((g, gIdx) => {
                        // All combinations in standard UAE blueprint catalogs are accessible
                        return (
                          <td 
                            key={gIdx} 
                            className="p-1 text-center border-r border-slate-300 align-middle hover:bg-amber-100 transition-colors cursor-help group text-[8.5px] font-mono bg-emerald-50/55"
                            onMouseEnter={() => setActiveMatrixHover({
                              typeId: type.name,
                              thread: 'METRIC',
                              grade: g.name,
                              details: g.info,
                              tensileVal: `${g.tensile} MPa`,
                              yieldVal: `${g.yieldStr} MPa`
                            })}
                            onMouseLeave={() => setActiveMatrixHover(null)}
                          >
                            <div className="flex flex-col items-center justify-center font-bold text-emerald-800 select-none">
                              <Check className="w-3 h-3 text-emerald-600 mb-0.5" />
                              <span className="text-[6.5px] font-sans font-bold leading-none uppercase tracking-tighter block text-slate-400">APPLICABLE</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* ROW-2: INCHES RUNTIME */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      {/* Category is spanned */}
                      <td className="p-2.5 font-bold uppercase text-slate-800 text-[9px] border-r border-slate-300 bg-white sticky left-[120px]">
                        {type.name}
                      </td>
                      <td className="p-2 text-center font-mono font-bold border-r border-slate-300 text-amber-700 text-[8.5px]">
                        INCHES
                      </td>
                      {INCH_GRADES.map((g, gIdx) => {
                        return (
                          <td 
                            key={gIdx} 
                            className="p-1 text-center border-r border-slate-300 align-middle hover:bg-amber-100 transition-colors cursor-help group text-[8.5px] font-mono bg-blue-50/55"
                            onMouseEnter={() => setActiveMatrixHover({
                              typeId: type.name,
                              thread: 'INCHES',
                              grade: g.name,
                              details: g.info,
                              tensileVal: `${g.tensile} ksi (~${Math.round(g.tensile * 6.89)} MPa)`,
                              yieldVal: `${g.yieldStr} ksi (~${Math.round(g.yieldStr * 6.89)} MPa)`
                            })}
                            onMouseLeave={() => setActiveMatrixHover(null)}
                          >
                            <div className="flex flex-col items-center justify-center font-bold text-blue-800 select-none">
                              <Check className="w-3 h-3 text-blue-600 mb-0.5" />
                              <span className="text-[6.5px] font-sans font-bold leading-none uppercase tracking-tighter block text-slate-400">APPLICABLE</span>
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

          {/* Quick Hover Overlay Details Panel */}
          <div className="bg-slate-900 text-white p-4 border-l-4 border-[#f37021] min-h-[90px] flex items-center justify-between flex-wrap gap-4 select-none">
            {activeMatrixHover ? (
              <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="text-[10.5px] font-mono font-bold tracking-wider uppercase text-[#f37021] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#f37021]" />
                    {activeMatrixHover.typeId} • {activeMatrixHover.thread} THREAD • {activeMatrixHover.grade}
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
          
          {/* COLUMN 1: CONTROLLERS (5 COLS SPAN) */}
          <div className="lg:col-span-5 space-y-5 select-none">
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-4">
              <div className="border-b border-slate-300 pb-2.5">
                <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#f37021]" />
                  Design Parameters
                </h4>
              </div>

              {/* anchor type dropdown */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Anchor Bolt Configuration Category</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCustomBend(100); // reset bend default
                  }}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10px] sm:text-[11px] font-semibold focus:outline-none focus:border-[#f37021] uppercase text-slate-800"
                >
                  {anchorBoltTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <span className="block text-[8px] text-slate-400 italic font-medium mt-1 uppercase">
                  {anchorBoltTypes.find(t => t.id === selectedType)?.description}
                </span>
              </div>

              {/* Thread system selections radio */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thread Standard System</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setThreadType('METRIC')}
                    className={`py-1 px-3 text-[9px] font-bold uppercase tracking-wider border cursor-pointer text-center ${
                      threadType === 'METRIC'
                        ? 'bg-slate-850 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    METRIC (mm / MPa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThreadType('INCHES')}
                    className={`py-1 px-3 text-[9px] font-bold uppercase tracking-wider border cursor-pointer text-center ${
                      threadType === 'INCHES'
                        ? 'bg-slate-850 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    INCHES (Inch / ksi)
                  </button>
                </div>
              </div>

              {/* Size & Nominal Diameter selection */}
              <div className="grid grid-cols-2 gap-3.5">
                {threadType === 'METRIC' ? (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nominal Dia (d)</label>
                    <select
                      value={diameterMetric}
                      onChange={(e) => setDiameterMetric(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-mono font-bold focus:outline-none focus:border-[#f37021] text-slate-800 h-8"
                    >
                      {METRIC_DIAS.map((d) => (
                        <option key={d} value={d}>M{d}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nominal Dia (d)</label>
                    <select
                      value={diameterInch}
                      onChange={(e) => setDiameterInch(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-mono font-bold focus:outline-none focus:border-[#f37021] text-slate-800 h-8"
                    >
                      {INCH_DIAS.map((d) => (
                        <option key={d.label} value={d.label}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Grade selects */}
                {threadType === 'METRIC' ? (
                  <div>
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Steel Grade Specification</label>
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
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Steel Grade Specification</label>
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

              {/* Dimensions sliders values */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Total Nominal Length (L)</span>
                    <span className="font-mono text-[9px] text-[#f37021]">{totalLength} {threadType === 'METRIC' ? 'mm' : 'inch'}</span>
                  </div>
                  <input
                    type="range"
                    min={threadType === 'METRIC' ? 100 : 4}
                    max={threadType === 'METRIC' ? 3000 : 120}
                    step={threadType === 'METRIC' ? 50 : 2}
                    value={totalLength}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalLength(val);
                      // Constrain thread length to not exceed nominal length
                      if (threadLength > val * 0.8) {
                        setThreadLength(Math.round(val * 0.3));
                      }
                    }}
                    className="w-full accent-[#f37021]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Threaded Length Portion (T)</span>
                    <span className="font-mono text-[9px] text-teal-600">{threadLength} {threadType === 'METRIC' ? 'mm' : 'inch'}</span>
                  </div>
                  <input
                    type="range"
                    min={threadType === 'METRIC' ? 30 : 1}
                    max={Math.round(totalLength * 0.9)}
                    step={threadType === 'METRIC' ? 10 : 0.5}
                    value={threadLength}
                    onChange={(e) => setThreadLength(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <span className="block text-[7.5px] font-bold text-slate-450 uppercase tracking-wide italic mt-0.5">Thread length cannot exceed 90% of total rod length</span>
                </div>

                {/* Optional dimension bend for non-straight anchors */}
                {selectedType !== 'straight' && selectedType !== 'round_washer' && selectedType !== 'square_washer' && (
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span>Bend Projection / Sleeve Width (B)</span>
                      <span className="font-mono text-[9px] text-purple-600">{customBend} {threadType === 'METRIC' ? 'mm' : 'inch'}</span>
                    </div>
                    <input
                      type="range"
                      min={threadType === 'METRIC' ? 30 : 1}
                      max={threadType === 'METRIC' ? 500 : 20}
                      step={threadType === 'METRIC' ? 10 : 0.5}
                      value={customBend}
                      onChange={(e) => setCustomBend(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                )}
              </div>

              {/* Quantity indicator slider */}
              <div>
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Target Fabrication Quantity</span>
                  <span className="font-mono text-[9.5px] text-indigo-600 font-semibold">{quantity} PCS</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Document metadata info trackers (Project specs) */}
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-3">
              <div className="border-b border-slate-300 pb-1.5">
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">UAE Project Tracker Specs</span>
              </div>
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
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Approved office authority</label>
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
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Target Contractor / Customer</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-1 px-2 border border-slate-300 text-[10px] uppercase font-sans font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[7.5px] uppercase font-bold text-slate-400 mb-0.5">Assignee Engineer</label>
                  <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    className="w-full p-1 px-2 border border-slate-300 text-[10px] uppercase font-sans font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handlePrintSpecs}
                  className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-900 hover:bg-slate-950 text-white p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:translate-y-[-1px]"
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

          {/* COLUMN 2: CAD VISUALIZATION & DYNAMIC PARAMETER RESULTS (7 COLS SPAN) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Elegant Blueprint SVG Engine Container Block */}
            <div className="border hover:border-slate-450 transition-colors border-slate-900 bg-slate-950 text-slate-300 p-4 space-y-3.5 relative">
              <div className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-800 px-2.5 py-0.5 font-mono text-[8.5px] font-bold text-[#f37021] tracking-wider uppercase select-none">
                Interactive CAD Vector
              </div>

              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f37021]">
                  DYNAMIC SPECIFICATION Blueprint
                </h3>
                <p className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Live dimensioning schematic layout generated in real time
                </p>
              </div>

              {/* Dynamic SVG Drawing Engine Block */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-center min-h-[190px]">
                {/* SVG dynamically renders based on selected Type */}
                <svg viewBox="0 0 500 200" className="w-full max-w-[420px] h-[170px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines background */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" rx="2" />

                  {/* straight anchor bolt */}
                  {selectedType === 'straight' && (
                    <g>
                      {/* Threaded lines left */}
                      <g className="stroke-teal-555" strokeWidth="2" strokeOpacity="0.7">
                        <line x1="70" y1="100" x2="130" y2="100" stroke="#f37021" strokeWidth="12" />
                        <path d="M75,94 L75,106 M82,94 L82,106 M89,94 L89,106 M96,94 L96,106 M103,94 L103,106 M110,94 L110,106 M117,94 L117,106 M124,94 L124,106" stroke="#111" strokeWidth="2.5" />
                      </g>
                      {/* Central Rod Body */}
                      <line x1="130" y1="100" x2="350" y2="100" stroke="#94a3b8" strokeWidth="12" />
                      {/* Threaded lines right */}
                      <g stroke="#f37021" strokeWidth="12">
                        <line x1="350" y1="100" x2="410" y2="100" />
                        <path d="M355,94 L355,106 M362,94 L362,106 M369,94 L369,106 M376,94 L376,106 M383,94 L383,106 M390,94 L390,106 M397,94 L397,106 M404,94 L404,106" stroke="#111" strokeWidth="2.5" />
                      </g>
                      
                      {/* Nuts and Washers attached to anchor */}
                      <rect x="100" y="85" width="12" height="30" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
                      <rect x="112" y="90" width="10" height="20" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />
                      <rect x="360" y="85" width="12" height="30" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
                      <rect x="372" y="90" width="10" height="20" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />

                      {/* Labels and lines */}
                      {/* Nominal length dimension line (L) */}
                      <path d="M 70,140 L 410,140" stroke="#f37021" strokeWidth="1" strokeDasharray="3" />
                      <polygon points="70,140 76,137 76,143" fill="#f37021" />
                      <polygon points="410,140 404,137 404,143" fill="#f37021" />
                      <text x="240" y="155" className="font-mono text-[9px] font-bold" fill="#f37021" textAnchor="middle">NOMINAL L = {totalLength}</text>

                      {/* Thread portion dimension line (T) */}
                      <path d="M 70,60 L 130,60" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2" />
                      <polygon points="70,60 75,58 75,62" fill="#0ea5e9" />
                      <polygon points="130,60 125,58 125,62" fill="#0ea5e9" />
                      <text x="100" y="52" className="font-mono text-[8px] font-bold" fill="#0ea5e9" textAnchor="middle">THREAD T = {threadLength}</text>

                      {/* Diameter labeling */}
                      <text x="240" y="80" className="font-sans font-semibold text-[10px]" fill="#ffffff" textAnchor="middle">ROD BODY (d = {computedSpecs.diameterLabel})</text>
                    </g>
                  )}

                  {/* L TYPE ANCHOR BOLT */}
                  {selectedType === 'l_type' && (
                    <g>
                      {/* L Bend shape */}
                      {/* horizontal segment containing threads */}
                      <line x1="160" y1="80" x2="350" y2="80" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
                      <g stroke="#f37021" strokeWidth="12">
                        <line x1="320" y1="80" x2="390" y2="80" />
                        <path d="M330,74 L330,86 M338,74 L338,86 M346,74 L346,86 M354,74 M362,74 L362,86 M370,74 L370,86 M378,74 L378,86 M386,74 L386,86" stroke="#111" strokeWidth="2.5" />
                      </g>
                      {/* Hook nut on thread */}
                      <rect x="345" y="65" width="12" height="30" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
                      <rect x="357" y="70" width="10" height="20" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />

                      {/* 90 degree curved hook body bottom */}
                      <path d="M 160,80 Q 140,80 140,100 L 140,150" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />

                      {/* Labels and lines */}
                      {/* Nominal length L */}
                      <path d="M 140,170 Q 265,170 390,170" stroke="#f37021" strokeWidth="1" strokeDasharray="3" />
                      <polygon points="140,170 146,167 146,173" fill="#f37021" />
                      <polygon points="390,170 384,167 384,173" fill="#f37021" />
                      <text x="265" y="185" className="font-mono text-[9px] font-bold" fill="#f37021" textAnchor="middle">NOMINAL L = {totalLength}</text>

                      {/* Hook Bend projection B */}
                      <path d="M 115,80 L 115,150" stroke="#a855f7" strokeWidth="1" strokeDasharray="2" />
                      <polygon points="115,80 112,85 118,85" fill="#a855f7" />
                      <polygon points="115,150 112,145 118,145" fill="#a855f7" />
                      <text x="105" y="120" className="font-mono text-[8px] font-bold" fill="#a855f7" textAnchor="middle" transform="rotate(-90 105 120)">BEND (B) = {customBend}</text>

                      {/* Diameter labeling */}
                      <text x="250" y="60" className="font-sans font-semibold text-[10px]" fill="#ffffff" textAnchor="middle">ROD (d = {computedSpecs.diameterLabel})</text>
                    </g>
                  )}

                  {/* J TYPE ANCHOR BOLT */}
                  {selectedType === 'j_type' && (
                    <g>
                      {/* J curved layout rod */}
                      <line x1="180" y1="90" x2="350" y2="90" stroke="#94a3b8" strokeWidth="12" />
                      <g stroke="#f37021" strokeWidth="12">
                        <line x1="320" y1="90" x2="390" y2="90" />
                        <path d="M330,84 L330,96 M338,84 L338,96 M346,84 L346,96 M354,84 M362,84 L362,96 M370,84 L370,96 M378,84 L378,96 M386,84 L386,96" stroke="#111" strokeWidth="2.5" />
                      </g>
                      {/* Curve hook loop */}
                      <path d="M 180,90 Q 120,90 120,115 T 160,140" stroke="#94a3b8" strokeWidth="12" fill="none" strokeLinecap="round" />

                      {/* Dimensions tags */}
                      {/* L */}
                      <path d="M 120,165 L 390,165" stroke="#f37021" strokeWidth="1" strokeDasharray="3" />
                      <polygon points="120,165 126,162 126,168" fill="#f37021" />
                      <polygon points="390,165 384,162 384,168" fill="#f37021" />
                      <text x="255" y="180" className="font-mono text-[9px] font-bold" fill="#f37021" textAnchor="middle">L = {totalLength}</text>

                      {/* B */}
                      <text x="100" y="115" className="font-mono text-[8px] font-bold" fill="#a855f7" textAnchor="middle">J-BEND = {customBend}</text>
                      <text x="260" y="70" className="font-sans font-semibold text-[10px]" fill="#ffffff" textAnchor="middle">DIA (d = {computedSpecs.diameterLabel})</text>
                    </g>
                  )}

                  {/* Fallback pattern for remaining 13 categories (renders universal smart blueprint for the rest) */}
                  {selectedType !== 'straight' && selectedType !== 'l_type' && selectedType !== 'j_type' && (
                    <g>
                      {/* Generic Custom Anchor representation */}
                      <line x1="120" y1="100" x2="320" y2="100" stroke="#64748b" strokeWidth="12" />
                      <g stroke="#f37021" strokeWidth="12">
                        <line x1="260" y1="100" x2="350" y2="100" />
                        <path d="M280,94 L280,106 M290,94 L290,106 M300,94 L300,106 M310,94 M320,94 L320,106" stroke="#111" strokeWidth="2.5" />
                      </g>

                      {/* Special end visual representation representing selection features */}
                      {selectedType.includes('washer') ? (
                        <g>
                          <rect x="120" y="50" width="30" height="100" fill="#cbd5e1" stroke="#f37021" strokeWidth="3" rx={selectedType === 'round_washer' ? '15' : '1'} />
                          <circle cx="135" cy="100" r="10" fill="#0f172a" />
                          <text x="135" y="40" className="font-mono text-[8px] font-semibold" fill="#f37021" textAnchor="middle">WASHER PLATE</text>
                        </g>
                      ) : selectedType.includes('sleeve') ? (
                        <g>
                          <rect x="140" y="80" width="100" height="40" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3" />
                          <text x="190" y="74" className="font-mono text-[8.5px] font-bold text-teal-400" textAnchor="middle">CONDUIT SLEEVE B</text>
                        </g>
                      ) : selectedType.includes('welding') ? (
                        <g>
                          <polygon points="120,85 120,115 100,100" fill="#f37021" />
                          <text x="110" y="75" className="font-mono text-[7px]" fill="#f37021" textAnchor="middle">WELD BEVEL</text>
                        </g>
                      ) : selectedType.includes('gusset') ? (
                        <g>
                          <rect x="120" y="60" width="15" height="80" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                          <polygon points="120,70 120,130 90,100" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
                          <text x="100" y="55" className="font-mono text-[8px]" fill="#f37021" textAnchor="middle">TRIANGLE GUSSET</text>
                        </g>
                      ) : (
                        <g>
                          <path d="M120,100 Q 90,60 60,100 T 120,140" stroke="#f37021" strokeWidth="10" fill="none" />
                          <circle cx="90" cy="100" r="10" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
                          <text x="90" y="50" className="font-sans font-bold text-[8px]" fill="#a855f7" textAnchor="middle">CUSTOM HOOK HEAD</text>
                        </g>
                      )}

                      {/* Global specs dimensions metrics */}
                      <path d="M 120,150 L 350,150" stroke="#ffffff" strokeWidth="1" strokeDasharray="2" />
                      <text x="235" y="165" className="font-mono text-[8px] font-bold" fill="#ffffff" textAnchor="middle">SPAN L = {totalLength}</text>
                      <text x="210" y="40" className="font-mono text-[9px] uppercase font-semibold block text-slate-300" textAnchor="middle">
                        TYPE: {selectedType.toUpperCase().replace('_', ' ')}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Core Calculated Mechanical specifications details result cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Unit Weight detail card */}
              <div className="bg-slate-50 border border-slate-300 p-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[8.5px] uppercase font-bold text-slate-400">Total Structural Weight</span>
                  <div className="text-xl font-mono font-bold text-slate-900 mt-1">
                    {computedSpecs.totalWeightKg.toFixed(2)} <span className="text-[11px] font-sans font-bold text-slate-500">kg</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-1.5 mt-2 flex justify-between items-center text-[8px] font-mono text-slate-500">
                  <span>Unit weight:</span>
                  <span className="font-bold text-slate-800">{computedSpecs.unitWeightKg.toFixed(3)} kg/pcs</span>
                </div>
              </div>

              {/* Stress break capacity Ultimate Load card */}
              <div className="bg-slate-50 border border-slate-300 p-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[8.5px] uppercase font-bold text-slate-400">Ultimate Stress break</span>
                  <div className="text-xl font-mono font-bold text-red-650 mt-1">
                    {computedSpecs.ultimateStressCapacityKN.toFixed(1)} <span className="text-[11px] font-sans font-bold text-slate-500">kN</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-1.5 mt-2 flex justify-between items-center text-[8px] font-mono text-slate-500">
                  <span>Steel Yield Load Limit:</span>
                  <span className="font-bold text-slate-800">{computedSpecs.yieldStressCapacityKN.toFixed(1)} kN</span>
                </div>
              </div>

              {/* Safe Allowable Tension Limit Load under target UAE safety factor */}
              <div className="bg-slate-50 border border-slate-300 p-3 flex flex-col justify-between">
                <div>
                  <span className="block text-[8.5px] uppercase font-bold text-slate-400">Safe Tension limit</span>
                  <div className="text-xl font-mono font-bold text-emerald-600 mt-1">
                    {computedSpecs.safeAllowableTensionKN.toFixed(1)} <span className="text-[11px] font-sans font-bold text-slate-500">kN</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-1.5 mt-2 flex justify-between items-center text-[8px] font-mono text-slate-500">
                  <span>Friction Torque Est:</span>
                  <span className="font-bold text-emerald-600">{computedSpecs.estimatedTorqueNm.toFixed(0)} Nm</span>
                </div>
              </div>

            </div>

            {/* Quick structural design recommendation guidelines box */}
            <div className="bg-[#cbd5e1]/10 border border-slate-300 p-4 space-y-2 select-none">
              <span className="text-[9.5px] font-bold text-slate-900 uppercase tracking-wider block">Marine Fasteners Recommended Installation parameters</span>
              <ul className="text-[9px] text-slate-600 leading-relaxed font-sans font-semibold uppercase space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                  Nominal cross-sectional thread stress area: <strong className="text-slate-900 font-mono text-[9.5px]">{computedSpecs.areaSqMm.toFixed(1)} mm²</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                  Target core chemical raw material grade standard yield threshold: <strong className="text-slate-900">{computedSpecs.yieldStrengthMPa} MPa</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                  Estimated concrete hole drill diameter clearance: <strong className="text-slate-900 font-mono text-[9.5px]">Ø {Math.round(computedSpecs.dMM + 4)} mm</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                  Recommended tightening wrench socket span size: <strong className="text-slate-900 font-mono text-[9.5px]">S = {Math.round(computedSpecs.dMM * 1.5)} mm</strong>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* PROFESSIONAL UAE-STANDARD PRINT SHEET LAYOUT VIEW (ACTIVATED BY CMD+P) */}
      {/* ==================================================================== */}
      <div className="hidden print:block print-area text-black bg-white font-sans p-6">
        
        {/* UAE Letterhead Header block */}
        <div className="border-b-4 border-slate-900 pb-4 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-xl font-sans font-bold tracking-tighter text-slate-950 uppercase leading-none">
              MARINE FASTENERS INDUSTRIES LLC
            </h1>
            <p className="text-[9px] font-mono font-bold text-slate-600 tracking-wider">
              FASTENERS FABRICATION WORKSHOP • AJMAN IND AREA, UAE
            </p>
            <p className="text-[8px] text-slate-500 font-semibold uppercase">
              Tel: +971 6 743 8219 • Email: sales@marinefasteners.co • REGISTRY NO: UAE-76192/AJ
            </p>
          </div>
          <div className="text-right font-mono text-[9px] space-y-0.5">
            <div className="bg-slate-900 text-white font-bold text-[9px] px-2 py-0.5 uppercase">SPECIFICATION CATALOG SHEET</div>
            <div>REF: <strong className="text-black font-semibold">{projectRef}</strong></div>
            <div>DATE: {new Date().toLocaleDateString('en-AE')}</div>
          </div>
        </div>

        {/* Project Context specification data summary layout */}
        <div className="grid grid-cols-4 gap-4 border border-slate-300 bg-slate-50/40 p-3.5 my-4">
          <div>
            <span className="block text-[8px] text-slate-500 uppercase font-bold">CLIENT CONTRACTOR</span>
            <span className="text-[10px] font-bold uppercase text-slate-950">{customerName}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-500 uppercase font-bold">DESIGN ENGINEER</span>
            <span className="text-[10px] font-bold uppercase text-slate-950">{engineerName}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-500 uppercase font-bold">AUTHORITY STAMP</span>
            <span className="text-[10px] font-bold uppercase text-slate-950">{approvedBy}</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-500 uppercase font-bold">PRODUCTION VOL</span>
            <span className="text-[10px] font-mono font-bold text-slate-950">{quantity} PCS</span>
          </div>
        </div>

        {/* Selected specifications core results table */}
        <div className="my-6 space-y-4">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-wider border-b-2 border-slate-800 pb-1 text-slate-900">
            I. PRODUCT FABRICATION PHYSICAL GEOMETRY
          </h2>
          <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-100 uppercase font-bold">
                <th className="p-2 border border-slate-400">Anchor Bolt category</th>
                <th className="p-2 border border-slate-400">Standard system</th>
                <th className="p-2 border border-slate-400 text-center">Nominal Diameter (d)</th>
                <th className="p-2 border border-slate-400 text-right">Length (L)</th>
                <th className="p-2 border border-slate-400 text-right">Thread (T)</th>
                {selectedType !== 'straight' && (
                  <th className="p-2 border border-slate-400 text-right">Bend (B)</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2.5 border border-slate-400 font-semibold uppercase">
                  {anchorBoltTypes.find(t => t.id === selectedType)?.name}
                </td>
                <td className="p-2 border border-slate-400 font-bold uppercase">{threadType}</td>
                <td className="p-2 border border-slate-400 text-center font-mono font-bold">{computedSpecs.diameterLabel}</td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold">{totalLength} {threadType === 'METRIC' ? 'mm' : 'inch'}</td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold">{threadLength} {threadType === 'METRIC' ? 'mm' : 'inch'}</td>
                {selectedType !== 'straight' && (
                  <td className="p-2 border border-slate-400 text-right font-mono font-bold">{customBend} {threadType === 'METRIC' ? 'mm' : 'inch'}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Selected specifications core mechanical results table */}
        <div className="my-6 space-y-4">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-wider border-b-2 border-slate-800 pb-1 text-slate-900">
            II. MECHANICAL STRENGTH & LOAD COMPUTATIONS
          </h2>
          <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-100 uppercase font-bold">
                <th className="p-2 border border-slate-400">Selected Core Steel Grade</th>
                <th className="p-2 border border-slate-400 text-right">Tensile Limit</th>
                <th className="p-2 border border-slate-400 text-right">Yield limit</th>
                <th className="p-2 border border-slate-400 text-right">Ultimate Tension Force</th>
                <th className="p-2 border border-slate-400 text-right">Safe Tension limit</th>
                <th className="p-2 border border-slate-400 text-right">Unit weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2.5 border border-slate-400 font-mono font-semibold text-slate-905 uppercase select-all">
                  {computedSpecs.gradeName}
                </td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold">{computedSpecs.tensileStrengthMPa.toFixed(0)} MPa</td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold">{computedSpecs.yieldStrengthMPa.toFixed(0)} MPa</td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold text-rose-700">{computedSpecs.ultimateStressCapacityKN.toFixed(1)} kN</td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold text-emerald-700">{computedSpecs.safeAllowableTensionKN.toFixed(1)} kN</td>
                <td className="p-2 border border-slate-400 text-right font-mono font-bold">{computedSpecs.unitWeightKg.toFixed(3)} kg/pc</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={4} className="p-2 text-right border border-slate-400 uppercase text-[8.5px]">TOTAL ORDER weight FOR {quantity} PCS:</td>
                <td colSpan={2} className="p-2 text-right font-mono text-slate-950 text-[11px] border border-slate-400 font-bold">
                  {computedSpecs.totalWeightKg.toFixed(2)} kg ({(computedSpecs.totalWeightKg / 1000).toFixed(3)} Metric Tons)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Technical installation specifications sheet summary remarks */}
        <div className="border border-slate-300 p-4 rounded-none bg-slate-55/10 my-4 space-y-2 select-none">
          <span className="text-[10px] uppercase font-bold text-slate-900 tracking-wider block">III. SPECIFIC PRODUCTION & INSTALLATION COMPLIANCE CLAUSES</span>
          <p className="text-[8.5px] leading-relaxed text-slate-600 font-medium uppercase font-sans">
            1. THIS SPECIFICATION IS RETRIEVED FROM THE OFFICIAL STEEL AND ALLOY SYSTEM DATABASE AT MARINE FASTENERS INDUSTRIES Ajman UAE.<br />
            2. THE ABOVE ANCHOR ASSEMBLY DESIGN WAS EVALUATED ACCORDING TO NOMINAL STRESS RATIO SPECIFICATIONS TO ENSURE DUCTILITY AND SHEAR STATIONS SUPPORT.<br />
            3. FOR MAXIMUM DESTRUCTIVE MOMENT RESISTANCE, GUARDIAN CONCRETE CAST DEPTH SHOULD MEET AT LEAST 12 TIMES THE NOMINAL DIA WITH EXPANSION WRAP SLEEVES CONFORMING TO BS-Standards.
          </p>
        </div>

        {/* Signatures block pushed cleanly to bottom section */}
        <div className="grid grid-cols-3 gap-10 mt-12 pt-8 border-t border-slate-200">
          <div className="text-center">
            <div className="h-10"></div>
            <div className="border-t border-slate-400 text-[8.5px] font-sans font-semibold uppercase text-slate-500 pt-1.5">
              PREPARED BY (ENGINEERING DEPARTMENT)
            </div>
            <div className="text-[9px] font-bold text-slate-800 mt-1 uppercase italic">{engineerName}</div>
          </div>
          <div className="text-center">
            <div className="h-10"></div>
            <div className="border-t border-slate-400 text-[8.5px] font-sans font-semibold uppercase text-slate-500 pt-1.5">
              APPROVED BY (WORKSHOP MANAGER)
            </div>
            <div className="text-[9px] font-bold text-slate-800 mt-1 uppercase italic">MFI CHIEF METALLURGIST</div>
          </div>
          <div className="text-center">
            <div className="h-10"></div>
            <div className="border-t border-slate-400 text-[8.5px] font-sans font-semibold uppercase text-slate-500 pt-1.5">
              OFFICIAL COMPANY ACCREDITED STAMP
            </div>
            <div className="text-[8px] font-bold text-teal-600 mt-1 uppercase tracking-widest">MARINE FASTENERS INDUSTRIES</div>
          </div>
        </div>

      </div>
    </div>
  );
}
