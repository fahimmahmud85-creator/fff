import React, { useState, useMemo } from 'react';
import { 
  Ruler, FileCheck, Check, Printer, Info, HelpCircle, AlertCircle, Sparkles, Sliders, List, Grid3X3, Copy, ShieldAlert
} from 'lucide-react';

export interface PinSubCategory {
  id: string;
  name: string;
  description: string;
  grades: string[];
}

export default function PinsDesignComponent() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'designer'>('designer');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [matrixSearch, setMatrixSearch] = useState('');

  // Structured list strictly matching the uploaded user image
  const pinSubCategories: PinSubCategory[] = [
    { 
      id: 'split', 
      name: 'SPLIT PINS', 
      description: 'Traditional heavy-industry DIN 94 cotter pins with loop head and offset parallel prongs.',
      grades: ['DIN 94 ASTM A36', 'DIN 94 S275 JR', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'r_clips', 
      name: 'R CLIPS', 
      description: 'Single-coil spring steel retention hitch pins conforming to DIN 11024 standard.',
      grades: ['ASTM A36 DIN 11024', 'S275 JR DIN 11024', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'r_clips_double', 
      name: 'R CLIPS DOUBLE COIL', 
      description: 'Double wound continuous coil hairpin retaining clips with high pull load security.',
      grades: ['ASTM A36', 'S275 JR', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'hairpin', 
      name: 'HAIR PIN RETAINER CLIP', 
      description: 'Traditional parallel throat wire clip retainer ideal for light axle retention.',
      grades: ['ASTM A36', 'S275 JR', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'linch', 
      name: 'LINCH PINS', 
      description: 'Self-locking standard DIN 11023 quick-release circular wire latching drop pins.',
      grades: ['ASTM A36 DIN 11023', 'S275 JR DIN 11023', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'hitch', 
      name: 'HITCH PINS', 
      description: 'Heavy shaft pins designed to secure trailers, attachments and heavy machinery.',
      grades: ['ASTM A36', 'S275 JR', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'wave', 
      name: 'WAVE PINS', 
      description: 'Continuous sinusoidal wave pattern tension fasteners keeping axial components snug.',
      grades: ['ASTM A36', 'S275 JR', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'slok', 
      name: 'S-LOK', 
      description: 'Special dual-locking proprietary safety pins engineered for oilfield applications.',
      grades: ['ASTM A36', 'S275 JR', 'SS 202', 'SS 304', 'SS 316', 'SS 316L', 'BRASS', 'COPPER']
    },
    { 
      id: 'dowel', 
      name: 'DOWEL PINS', 
      description: 'Straight solid cylindrical pins precision engineered for high accuracy part alignments.',
      grades: ['ASTM A36', 'S275 JR', 'ASTM A615 GRADE 40', 'ASTM A615 GRADE 60', 'SS 202', 'SS 304', 'SS 316', 'SS 316L']
    },
    { 
      id: 'clevis', 
      name: 'CLEVIS PINS', 
      description: 'Flat-headed pin with a cross-drilled hole for cotter pin insert locking mechanisms.',
      grades: ['ASTM A36', 'S275 JR', 'GRADE 8.8', 'GRADE 10.9', 'SS 304', 'SS 316', 'SS 316L', 'BRASS']
    }
  ];

  // UI state for active Pin designer workspace
  const [selectedSub, setSelectedSub] = useState<string>('split');
  const [selectedGrade, setSelectedGrade] = useState<string>('DIN 94 ASTM A36');
  const [pinDiameter, setPinDiameter] = useState<number>(8.0); // 8mm is standard base
  const [pinLength, setPinLength] = useState<number>(60); // 60mm base length
  const [quantity, setQuantity] = useState<number>(1000); // production order volume

  const PIN_DIAMETERS = [
    { value: 3.0, label: '3.0 mm (M3 Equivalent)', hole: '3.1 mm' },
    { value: 4.0, label: '4.0 mm (M4 Equivalent)', hole: '4.1mm' },
    { value: 5.0, label: '5.0 mm (M5 Equivalent)', hole: '5.1 mm' },
    { value: 6.0, label: '6.0 mm (M6 Equivalent)', hole: '6.1 mm' },
    { value: 8.0, label: '8.0 mm (M8 Equivalent)', hole: '8.2 mm' },
    { value: 10.0, label: '10.0 mm (M10 Equivalent)', hole: '10.2 mm' },
    { value: 12.0, label: '12.0 mm (M12 Equivalent)', hole: '12.3 mm' },
    { value: 16.0, label: '16.0 mm (M16 Equivalent)', hole: '16.4 mm' }
  ];

  // Dynamic strength calculations based on mechanical constraints of metals
  const computedSpecs = useMemo(() => {
    let materialDensity = 7.85; // g/cm3 for mild steel
    let maxYieldShear = 145; // MPa
    let textMaterial = 'Carbon/Structural Steel (ASTM A36)';

    const gUpper = selectedGrade.toUpperCase();
    if (gUpper.includes('COPPER')) {
      materialDensity = 8.96;
      maxYieldShear = 90;
      textMaterial = 'Electrolytic Solid Copper';
    } else if (gUpper.includes('BRASS')) {
      materialDensity = 8.4;
      maxYieldShear = 120;
      textMaterial = 'Standard Free-Cutting Yellow Brass';
    } else if (gUpper.includes('SS 316') || gUpper.includes('SS 304') || gUpper.includes('SS 202')) {
      materialDensity = 7.95;
      maxYieldShear = 230;
      textMaterial = 'Austenitic Corrosion-Resistant Stainless Steel';
    } else if (gUpper.includes('GRADE 10.9') || gUpper.includes('GRADE 8.8') || gUpper.includes('GRADE 60')) {
      materialDensity = 7.85;
      maxYieldShear = 380;
      textMaterial = 'High Tensile Heat-Treated Allow Steel';
    }

    // Cross-sectional pin area (pi * d^2 / 4) in mm2
    const areaMM2 = (Math.PI * Math.pow(pinDiameter, 2)) / 4;

    // Single shear strength in kN (Area * maxYieldShear / 1000)
    const singleShearKN = (areaMM2 * maxYieldShear) / 1000;
    // Double shear strength (Split pins / Clevis pins operate under double shear loading)
    const doubleShearKN = singleShearKN * 2;

    // Unit weight in grams (Volume * Density)
    // Cylinder volumetric equivalent: area_cm2 * length_cm
    const areaCM2 = (Math.PI * Math.pow(pinDiameter/10, 2)) / 4;
    const lengthCM = pinLength / 10;
    const volumeCM3 = areaCM2 * lengthCM;
    
    // Wire clips/retainers have less volume than full cylinders (approx factor 0.35)
    const shapeFactor = (selectedSub === 'split' || selectedSub.includes('clip') || selectedSub === 'hairpin' || selectedSub === 'wave' || selectedSub === 'slok') ? 0.35 : 1.0;
    const unitWeightGrams = volumeCM3 * materialDensity * shapeFactor;
    const totalBatchWeightKG = (unitWeightGrams * quantity) / 1000;

    // Direct match for recommended clearance drill size
    const matchingDia = PIN_DIAMETERS.find(d => d.value === pinDiameter) || PIN_DIAMETERS[4];

    return {
      textMaterial,
      singleShearKN,
      doubleShearKN,
      unitWeightGrams,
      totalBatchWeightKG,
      holeDiameter: matchingDia.hole
    };
  }, [selectedGrade, selectedSub, pinDiameter, pinLength, quantity]);

  // Handle auto-updating grades list when sub category is flipped
  const handleSubChange = (id: string) => {
    setSelectedSub(id);
    const sub = pinSubCategories.find(s => s.id === id);
    if (sub && sub.grades.length > 0) {
      setSelectedGrade(sub.grades[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `⚓ MARINE FASTENERS - PIN ENGINEERING SHEETS
Category: PINS
Sub Category: ${pinSubCategories.find(s => s.id === selectedSub)?.name}
Material Standard Grade: ${selectedGrade}
Selected Specifications:
- Nominal Shaft Pin Diameter: ${pinDiameter} mm
- Pin Body Length: ${pinLength} mm
- Precision Clearance Drill Hole: ${computedSpecs.holeDiameter}
Calculated Physics Limits:
- Base Metal Material: ${computedSpecs.textMaterial}
- Ultimate Single Shear Threshold: ${computedSpecs.singleShearKN.toFixed(2)} kN
- Double Shear Safe Operating Limit: ${computedSpecs.doubleShearKN.toFixed(2)} kN
- Component Unit Weight: ${computedSpecs.unitWeightGrams.toFixed(2)} grams
- Total Batch Shipment Weight (${quantity} pcs): ${computedSpecs.totalBatchWeightKG.toFixed(2)} KG`;

    navigator.clipboard.writeText(text);
    setCopiedText("Copied successfully!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredSubCategories = useMemo(() => {
    return pinSubCategories.filter(sub => 
      sub.name.toLowerCase().includes(matrixSearch.toLowerCase()) || 
      sub.description.toLowerCase().includes(matrixSearch.toLowerCase())
    );
  }, [matrixSearch]);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md select-none print-container max-w-7xl mx-auto">
      {/* Upper header panel */}
      <div className="bg-[#0f172a] text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#e11d48] text-white p-2 border border-white shrink-0">
            <Ruler className="w-5 h-5 text-rose-100" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              PINS & RETENTION CLIPS SUITE
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FAHIM MAHMUD ENGINEERING SUITE • UAE PINS DATABASE MATRIX
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('designer')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'designer' 
                ? 'bg-[#e11d48] text-white border-[#e11d48]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" /> SPEC WORKSPACE
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'matrix' 
                ? 'bg-[#e11d48] text-white border-[#e11d48]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5" /> GRADES MATRIX
            </span>
          </button>
        </div>
      </div>

      {/* MATRIX VIEW TAB */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-6 no-print">
          <div className="bg-rose-50 border border-rose-200 text-rose-950 p-3.5 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3">
            <Info className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <strong>PINS SYSTEM SPECIFICATIONS MATRIX:</strong> This matrix maps precision dowels, clevis fasteners, R-clips, cotter pins, and S-Loks. Integrated directly with standard grade tables including carbon, stainless, yellow brass, and copper specifications.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-2.5 border border-slate-200">
            <input
              type="text"
              placeholder="Search pin categories (e.g., Dowel, Clevis, R Clip)..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full sm:w-80 p-2 pl-3 py-1 text-[10px] bg-white border border-slate-300 rounded-none font-bold uppercase placeholder:text-slate-400 focus:border-[#e11d48] outline-none"
            />
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
              PIN TYPES: {filteredSubCategories.length} categories preloaded
            </div>
          </div>

          {/* Table display structure */}
          <div className="overflow-x-auto border border-slate-900">
            <table className="w-full text-left border-collapse text-[10px] font-sans">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[8.5px] border-b border-slate-950">
                  <th className="p-3 border-r border-slate-700 w-[120px] sticky left-0 bg-slate-900 z-10">Category</th>
                  <th className="p-3 border-r border-slate-700 w-[200px] sticky left-[120px] bg-slate-900 z-10">Sub Category</th>
                  <th className="p-3 border-r border-slate-700 bg-slate-950 text-rose-300">Supported Grades / Standards</th>
                  <th className="p-3 border-r border-slate-700 text-center w-[120px]">Pin Diameters</th>
                  <th className="p-3 text-center w-[125px]">Hole Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubCategories.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold uppercase text-slate-900 border-r border-slate-300 bg-white sticky left-0 z-10">
                      PINS
                    </td>
                    <td className="p-3 font-semibold uppercase text-rose-950 text-[9.5px] border-r border-slate-300 bg-white sticky left-[120px] z-10">
                      {sub.name}
                      <span className="block text-[8px] text-slate-400 font-medium normal-case mt-1">{sub.description}</span>
                    </td>
                    <td className="p-3 border-r border-slate-200">
                      <div className="flex flex-wrap gap-1.5">
                        {sub.grades.map((g, gIdx) => (
                          <span key={gIdx} className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-none font-bold text-[8.5px] uppercase">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-705 border-r border-slate-200 text-[9.5px]">
                      3.0mm - 16.0mm
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-rose-700 bg-rose-50/20 text-[9.5px]">
                      d + 0.1/0.4mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WORKSPACE VIEW TAB */}
      {activeTab === 'designer' && (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 no-print bg-white">
          
          {/* CONTROL BLOCK (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-4">
              <div className="border-b border-slate-300 pb-2.5">
                <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-rose-600" />
                  Fastener Dimensional Inputs
                </h4>
              </div>

              {/* Sub Category selectors */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pin Subcategory Type</label>
                <select
                  value={selectedSub}
                  onChange={(e) => handleSubChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-semibold focus:outline-none focus:border-[#e11d48] uppercase text-slate-850"
                >
                  {pinSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <span className="block text-[8px] text-slate-400 italic mt-1 uppercase font-medium">
                  {pinSubCategories.find(s => s.id === selectedSub)?.description}
                </span>
              </div>

              {/* Grade selector based on selected Subcategory */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Standard Material Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-semibold focus:outline-none focus:border-[#e11d48] uppercase text-slate-800"
                >
                  {pinSubCategories.find(s => s.id === selectedSub)?.grades.map((grade, gIdx) => (
                    <option key={gIdx} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Pin diameter & length setup */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nominal Dia (d)</label>
                  <select
                    value={pinDiameter}
                    onChange={(e) => setPinDiameter(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-mono font-bold focus:outline-none focus:border-[#e11d48] text-slate-800 h-8"
                  >
                    {PIN_DIAMETERS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Body Length (L)</label>
                  <select
                    value={pinLength}
                    onChange={(e) => setPinLength(Number(e.target.value))}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-none text-[10.5px] font-mono font-bold focus:outline-none focus:border-[#e11d48] text-slate-800 h-8"
                  >
                    <option value={20}>20 mm</option>
                    <option value={30}>30 mm</option>
                    <option value={40}>40 mm</option>
                    <option value={50}>50 mm</option>
                    <option value={60}>60 mm</option>
                    <option value={80}>80 mm</option>
                    <option value={100}>100 mm</option>
                    <option value={120}>120 mm</option>
                  </select>
                </div>
              </div>

              {/* Manufacturing volume parameters */}
              <div>
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Supply Volume Request</span>
                  <span className="font-mono text-[9px] text-[#e11d48] font-bold">{quantity} PCS</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-[#e11d48]"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-900 hover:bg-slate-950 text-white p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#e11d48]" /> PRINT SPEC SHEET
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {copiedText || "COPY DESIGN SPEC"}
              </button>
            </div>
          </div>

          {/* COLUMN 2: VECTOR VECTOR SCHEMATIC & MECHANICAL STRENGTH COMPUTATIONS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual Vector Container block */}
            <div className="border border-slate-900 bg-slate-950 text-slate-300 p-4 space-y-3.5 relative">
              <div className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-800 px-2.5 py-0.5 font-mono text-[8.5px] font-bold text-[#e11d48] tracking-wider uppercase">
                Vector Cad HUD
              </div>

              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#rose-400]">
                  {pinSubCategories.find(s => s.id === selectedSub)?.name} SCHEMATIC
                </h3>
                <p className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Geometric clearance visualizer for standard system installation approvals
                </p>
              </div>

              {/* SVG CAD diagram depending on sub-category selected */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 500 240" className="w-full max-w-[420px] h-[200px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#0a0f1d" rx="2" />
                  
                  {/* Grid Lines Overlay */}
                  <g opacity="0.05">
                    <line x1="50" y1="0" x2="50" y2="240" stroke="#ffffff" />
                    <line x1="100" y1="0" x2="100" y2="240" stroke="#ffffff" />
                    <line x1="150" y1="0" x2="150" y2="240" stroke="#ffffff" />
                    <line x1="200" y1="0" x2="200" y2="240" stroke="#ffffff" />
                    <line x1="250" y1="0" x2="250" y2="240" stroke="#ffffff" />
                    <line x1="300" y1="0" x2="300" y2="240" stroke="#ffffff" />
                    <line x1="350" y1="0" x2="350" y2="240" stroke="#ffffff" />
                    <line x1="400" y1="0" x2="400" y2="240" stroke="#ffffff" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#ffffff" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#ffffff" />
                    <line x1="0" y1="180" x2="500" y2="180" stroke="#ffffff" />
                  </g>

                  {/* Dynamic render block */}
                  {selectedSub === 'split' ? (
                    // Cotter split pin illustration
                    <g transform="translate(45, 0)">
                      {/* Loop head of pin */}
                      <path d="M 120 120 C 60 70, 60 170, 120 120 Z" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round" />
                      <circle cx="102" cy="120" r="12" fill="#0a0f1d" />
                      
                      {/* Two parallel straight prongs with flat end offsets */}
                      <path d="M 120 111 L 340 111 L 355 120" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 120 129 L 320 129" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />

                      {/* Dimension Arrow overlays */}
                      <path d="M 120,40 L 340,40" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3" />
                      <polygon points="120,40 128,36 128,44" fill="#f43f5e" />
                      <polygon points="340,40 332,36 332,44" fill="#f43f5e" />
                      <text x="230" y="32" className="font-mono text-[8px]" fill="#f43f5e" textAnchor="middle">Length L = {pinLength} mm</text>
                    </g>
                  ) : selectedSub.toLowerCase().includes('clip') || selectedSub === 'hairpin' ? (
                    // R-Clip / Hairpin graphic curve
                    <g transform="translate(60, 0)">
                      {/* Loop coil coil */}
                      <circle cx="120" cy="120" r="26" stroke="#94a3b8" strokeWidth="8" fill="none" />
                      
                      {/* Straight rod retention prong going through the shaft */}
                      <line x1="120" y1="146" x2="330" y2="146" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                      
                      {/* Sinuous wavy snap prong above */}
                      <path d="M 120,94 C 170,94 180,60 210,94 C 240,128 270,105 330,140" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />

                      {/* Dimension details */}
                      <text x="225" y="180" className="font-mono text-[8px]" fill="#f43f5e" textAnchor="middle">Nominal Fit d = {pinDiameter} mm</text>
                    </g>
                  ) : selectedSub === 'clevis' ? (
                    // Clevis Pin (Flat head and cross cotter hole)
                    <g transform="translate(30, 0)">
                      {/* Clevis Flat Head Cap */}
                      <rect x="90" y="80" width="18" height="80" fill="#e2e8f0" rx="3" stroke="#475569" strokeWidth="2" />
                      
                      {/* Main Cylindrical Body shaft */}
                      <rect x="108" y="100" width="280" height="40" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                      
                      {/* Cross cotter locking hole at bottom of shank */}
                      <circle cx="350" cy="120" r="6" fill="#0a0f1d" stroke="#e11d48" strokeWidth="1.5" />
                      <text x="350" y="100" className="font-mono text-[7px]" fill="#e11d48" textAnchor="middle">Locking Hole</text>

                      {/* Size dimension guidelines */}
                      <path d="M 108,60 L 388,60" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3" />
                      <polygon points="108,60 114,56 114,64" fill="#f43f5e" />
                      <polygon points="388,60 382,56 382,64" fill="#f43f5e" />
                      <text x="248" y="52" className="font-mono text-[8px]" fill="#f43f5e" textAnchor="middle">Shank L = {pinLength} mm</text>
                    </g>
                  ) : (
                    // Dowel solid Cylindrical pin (straight chamfered corners)
                    <g transform="translate(45, 0)">
                      {/* Straight smooth round dowel segment */}
                      <rect x="100" y="90" width="260" height="60" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                      
                      {/* Left and Right chamfered bevels */}
                      <polygon points="100,90 90,100 90,140 100,150" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                      <polygon points="360,90 370,100 370,140 360,150" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />

                      {/* Alignment guides */}
                      <line x1="90" y1="120" x2="370" y2="120" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4" />
                      <text x="230" y="80" className="font-mono text-[8px]" fill="#f43f5e" textAnchor="middle">Precision d = {pinDiameter} mm</text>
                      <text x="230" y="170" className="font-mono text-[8px]" fill="#cbd5e1" textAnchor="middle">Straight Dowel Tolerances: ±0.005mm</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Calculated engineering card */}
              <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 font-mono text-[10px]">
                <div className="text-[10.5px] font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between items-center">
                  <span>Pin Mechanical Limits (Theoretical)</span>
                  <span className="text-white text-[8px] bg-rose-950 px-2 py-0.5 border border-rose-800 font-bold uppercase">{selectedGrade}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-350">
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Single Shear Limit</span>
                    <span className="text-emerald-400 font-semibold">{computedSpecs.singleShearKN.toFixed(2)} kN</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Double Shear ref</span>
                    <span className="text-[#38bdf8] font-semibold">{computedSpecs.doubleShearKN.toFixed(2)} kN</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Recommended Drill</span>
                    <span className="text-rose-400 font-semibold">{computedSpecs.holeDiameter}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Base Metal Style</span>
                    <span className="text-amber-300 font-semibold truncate block max-w-[140px]" title={computedSpecs.textMaterial}>{computedSpecs.textMaterial}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Single Weight</span>
                    <span className="text-white font-semibold">{computedSpecs.unitWeightGrams.toFixed(2)} g</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-bold">Order Batch Mass</span>
                    <span className="text-teal-400 font-semibold">{computedSpecs.totalBatchWeightKG.toFixed(2)} KG</span>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 border-t border-slate-800 pt-2 font-sans normal-case leading-snug">
                  * Note: High tensile pins list shear margins under static test blocks. Retention pins should not be stressed into fully loaded cyclic structural shear planes without supplemental retaining locks.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-READY STYLED SECTION (Only shows during print layout action) */}
      <div className="hidden print-style-block print:block p-10 font-sans space-y-10">
        <div className="border-b-4 border-slate-900 pb-5 text-center">
          <h1 className="font-mono text-2xl font-bold uppercase text-slate-900 tracking-wider">
            MARINE FASTENERS INDUSTRIES LLC
          </h1>
          <p className="text-xs uppercase font-semibold tracking-widest text-slate-500 mt-1">
            Official Technical Approval Sheet - Pins & Retention Clips
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 border p-6 bg-slate-50">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2">1. Pin Specifications</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-350">
              <tbody>
                <tr className="py-1.5"><td className="font-bold py-1">Pin Type/Family:</td><td>{pinSubCategories.find(s => s.id === selectedSub)?.name}</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Metal Grade:</td><td>{selectedGrade}</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Nominal Diameter d:</td><td>{pinDiameter} mm</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Fastener Length L:</td><td>{pinLength} mm</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Clearance Drill Hole:</td><td>{computedSpecs.holeDiameter}</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2">2. Strength & Logistics</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-350">
              <tbody>
                <tr className="py-1.5"><td className="font-bold py-1">Base Solid Density:</td><td>{computedSpecs.textMaterial}</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Single Shear Capacity:</td><td>{computedSpecs.singleShearKN.toFixed(2)} kN</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Double Shear Reference:</td><td>{computedSpecs.doubleShearKN.toFixed(2)} kN</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Item Weight:</td><td>{computedSpecs.unitWeightGrams.toFixed(2)} g</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Production Run:</td><td>{quantity} pcs</td></tr>
                <tr className="py-1.5"><td className="font-bold py-1">Computed Weight Limit:</td><td>{computedSpecs.totalBatchWeightKG.toFixed(2)} KG</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-20 flex justify-between items-center text-xs">
          <div className="border-t border-slate-400 pt-2 w-48 text-center">
            <p className="font-bold">Eng. Fahim Mahmud</p>
            <p className="text-[10px] text-slate-500">Fastener Design engineer signoff</p>
          </div>
          <div className="border-t border-slate-400 pt-2 w-48 text-center">
            <p className="font-blank">MFI Dubai QA</p>
            <p className="text-[10px] text-slate-500">Factory Dispatch Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
