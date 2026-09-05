import React, { useState, useMemo } from 'react';
import { 
  Ruler, FileCheck, Check, Printer, Info, HelpCircle, AlertCircle, Sparkles, Sliders, List, Grid3X3, Copy, ShieldAlert, Layers
} from 'lucide-react';

export interface RoundBarsSubCategory {
  id: string;
  name: string;
  description: string;
  // Visual layout of the grades as given in the image
  gradeRows: string[][];
}

export default function RoundBarsDesignComponent() {
  const [activeTab, setActiveTab] = useState<'designer' | 'matrix'>('designer');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [matrixSearch, setMatrixSearch] = useState('');

  // Exact reproduction of the subcategories and grade grids from the user's reference image
  const subCategories: RoundBarsSubCategory[] = [
    {
      id: 'metrics',
      name: 'ROUND BAR METRICS',
      description: 'Precision metric diameter solid steel round bars for high accuracy machining and construction.',
      gradeRows: [
        ['GRADE 4.6', 'GRADE 8.8', 'GRADE 10.9', 'ASTM A36', 'ASTM F1554 GRADE 36', 'ASTM F1554 GRADE 55', 'ASTM F1554 GRADE 105', 'ASTM A675 GRADE 90'],
        ['BS 4360 GRADE 50C', 'BS EN 10025 S275 JR', 'Q235', 'S355 JR', 'S355 JO', 'A354 BD', 'ASTM A193 GRADE B7', 'SS 304'],
        ['SS 316', 'SS 316L', 'ASTM A193 GRADE B8', 'ASTM A193 GRADE B8M', 'BRASS', 'COPPER']
      ]
    },
    {
      id: 'inches',
      name: 'ROUND BAR INCHES',
      description: 'Imperial diameter solid steel round bars conforming to major international standards.',
      gradeRows: [
        ['GRADE 5', 'GRADE 8', '', 'ASTM A36', 'ASTM F1554 GRADE 36', 'ASTM F1554 GRADE 55', 'ASTM F1554 GRADE 105', 'ASTM A675 GRADE 90'],
        ['BS 4360 GRADE 50C', 'BS EN 10025 S275 JR', 'Q235', 'S355 JR', 'S355 JO', 'A354 BD', 'ASTM A193 GRADE B7', 'SS 304'],
        ['SS 316', 'SS 316L', 'ASTM A193 GRADE B8', 'ASTM A193 GRADE B8M', 'BRASS', 'COPPER']
      ]
    }
  ];

  // UI state for active Round Bar developer spec sheet
  const [selectedSub, setSelectedSub] = useState<string>('metrics');
  const [selectedGrade, setSelectedGrade] = useState<string>('GRADE 8.8');
  const [barDiameter, setBarDiameter] = useState<number>(20.0); // 20mm is standard starting point
  const [barLength, setBarLength] = useState<number>(3); // length in meters
  const [quantity, setQuantity] = useState<number>(50); // production batch pieces

  // Standard diameters for metric versus inches
  const METRIC_DIAMETERS = [
    { value: 8.0, label: 'Ø 8.0 mm' },
    { value: 10.0, label: 'Ø 10.0 mm' },
    { value: 12.0, label: 'Ø 12.0 mm' },
    { value: 16.0, label: 'Ø 16.0 mm' },
    { value: 20.0, label: 'Ø 20.0 mm' },
    { value: 24.0, label: 'Ø 24.0 mm' },
    { value: 30.0, label: 'Ø 30.0 mm' },
    { value: 36.0, label: 'Ø 36.0 mm' },
    { value: 42.0, label: 'Ø 42.0 mm' },
    { value: 50.0, label: 'Ø 50.0 mm' },
    { value: 65.0, label: 'Ø 65.0 mm' },
    { value: 80.0, label: 'Ø 80.0 mm' },
    { value: 100.0, label: 'Ø 100.0 mm' }
  ];

  const INCH_DIAMETERS = [
    { value: 9.525, label: 'Ø 3/8" (9.53 mm)' },
    { value: 12.7, label: 'Ø 1/2" (12.70 mm)' },
    { value: 15.875, label: 'Ø 5/8" (15.88 mm)' },
    { value: 19.05, label: 'Ø 3/4" (19.05 mm)' },
    { value: 22.225, label: 'Ø 7/8" (22.23 mm)' },
    { value: 25.4, label: 'Ø 1" (25.40 mm)' },
    { value: 31.75, label: 'Ø 1-1/4" (31.75 mm)' },
    { value: 38.1, label: 'Ø 1-1/2" (38.10 mm)' },
    { value: 50.8, label: 'Ø 2" (50.80 mm)' },
    { value: 63.5, label: 'Ø 2-1/2" (63.50 mm)' },
    { value: 76.2, label: 'Ø 3" (76.20 mm)' }
  ];

  // Helper to get selected diameters array
  const activeDiameters = selectedSub === 'metrics' ? METRIC_DIAMETERS : INCH_DIAMETERS;

  // Mechanical specs, physical limits based on real metallurgy
  const computedSpecs = useMemo(() => {
    let densityGcm3 = 7.85; // Steel default
    let yieldStrengthMpa = 250; // default structural steel yield
    let tensileStrengthMpa = 400; // ultimate structural tensile
    let materialName = 'Carbon Steel / Structural Alloy';

    const gUpper = selectedGrade.toUpperCase();
    if (gUpper.includes('GRADE 4.6')) {
      yieldStrengthMpa = 240;
      tensileStrengthMpa = 400;
      materialName = 'Class 4.6 Low Carbon Steel';
    } else if (gUpper.includes('GRADE 8.8') || gUpper.includes('GRADE 8') || gUpper.includes('GRADE B7')) {
      yieldStrengthMpa = 640;
      tensileStrengthMpa = 800;
      materialName = 'Medium Carbon Alloy Steel (Quenched & Tempered)';
    } else if (gUpper.includes('GRADE 10.9')) {
      yieldStrengthMpa = 940;
      tensileStrengthMpa = 1040;
      materialName = 'High Tensile Alloy Steel (Grade 10.9)';
    } else if (gUpper.includes('S275') || gUpper.includes('A36') || gUpper.includes('GRADE 36')) {
      yieldStrengthMpa = 275;
      tensileStrengthMpa = 430;
      materialName = 'Structural Carbon Steel (S275JR / A36)';
    } else if (gUpper.includes('S355') || gUpper.includes('GRADE 50') || gUpper.includes('GRADE 55')) {
      yieldStrengthMpa = 355;
      tensileStrengthMpa = 510;
      materialName = 'High Strength Yellow Structural Grade Steel';
    } else if (gUpper.includes('SS 316') || gUpper.includes('B8M')) {
      densityGcm3 = 7.98;
      yieldStrengthMpa = 205;
      tensileStrengthMpa = 515;
      materialName = 'SS 316 / A4 Austenitic Stainless Steel (Marine Grade)';
    } else if (gUpper.includes('SS 304') || gUpper.includes('B8')) {
      densityGcm3 = 7.93;
      yieldStrengthMpa = 215;
      tensileStrengthMpa = 505;
      materialName = 'SS 304 / A2 Stainless Steel';
    } else if (gUpper.includes('BRASS')) {
      densityGcm3 = 8.5;
      yieldStrengthMpa = 150;
      tensileStrengthMpa = 350;
      materialName = 'C36000 Free-Cutting Yellow Brass';
    } else if (gUpper.includes('COPPER')) {
      densityGcm3 = 8.96;
      yieldStrengthMpa = 100;
      tensileStrengthMpa = 220;
      materialName = 'C11000 Electrolytic Solid Copper C110';
    }

    // Calculations based on Diameter (d) in mm & Length (L) in meters
    // Area of circular bar = (pi * d^2) / 4 in mm2
    const areaMM2 = (Math.PI * Math.pow(barDiameter, 2)) / 4;

    // Unit weight calculation: Section Mass in kg/meter
    // Weight = Volume (1 meter) * Density
    // Volume in cm3 for 1m (100cm): (area in cm2) * 100
    const areaCM2 = areaMM2 / 100;
    const kgPerMeter = areaCM2 * 100 * (densityGcm3 / 1000); // density in kg/dm3

    const singleBarWeightKG = kgPerMeter * barLength;
    const totalOrderWeightKG = singleBarWeightKG * quantity;

    // Load capabilities (Static tension and single-shear limits)
    // Tension load limit (kN) = Area * Yield Strength / 1000
    const tensionLimitKN = (areaMM2 * yieldStrengthMpa) / 1000;
    // Shear load limit (kN) = Tension Limit * 0.6 (approx shear relation)
    const shearLimitKN = tensionLimitKN * 0.6;

    return {
      materialName,
      densityGcm3,
      areaMM2,
      kgPerMeter,
      singleBarWeightKG,
      totalOrderWeightKG,
      tensionLimitKN,
      shearLimitKN,
      yieldStrengthMpa,
      tensileStrengthMpa
    };
  }, [selectedGrade, barDiameter, barLength, quantity, selectedSub]);

  // Handle auto-change of sub-categories to set default grades properly
  const handleSubChange = (id: string) => {
    setSelectedSub(id);
    const sub = subCategories.find(s => s.id === id);
    if (sub) {
      // Pick first non-empty grade from matrix row
      const firstGrade = sub.gradeRows[0].find(g => g !== '') || 'ASTM A36';
      setSelectedGrade(firstGrade);
      // Pick reasonable default diameter
      setBarDiameter(id === 'metrics' ? 20.0 : 19.05);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `⚓ SAFELOCK MARINE COMPONENTS - TECHNICAL SPECIFICATION
Product Category: SOLID ROUND BARS
Sub Category Variant: ${subCategories.find(s => s.id === selectedSub)?.name}
Applied Standard / Metal Grade: ${selectedGrade}
Physical Mechanical Specifications:
- Nominal Shaft Diameter: ${barDiameter.toFixed(2)} mm
- Total Length per unit: ${barLength} meters
- Volumetric Density: ${computedSpecs.densityGcm3.toFixed(3)} g/cm³
- Cross Sectional Area: ${computedSpecs.areaMM2.toFixed(1)} mm²
Engineering Calculations:
- Calculated Unit Weight: ${computedSpecs.kgPerMeter.toFixed(3)} kg/m
- Single Finished Bar Weight: ${computedSpecs.singleBarWeightKG.toFixed(2)} kg
- Dynamic Axial Tensile Capacity (Yield): ${computedSpecs.tensionLimitKN.toFixed(1)} kN
- Theoretical Pure Transverse Shear Yield: ${computedSpecs.shearLimitKN.toFixed(1)} kN
Logistics Estimates:
- Total Production Run Quantity: ${quantity} bars
- Combined Batch Consignment Mass: ${computedSpecs.totalOrderWeightKG.toFixed(1)} kg`;

    navigator.clipboard.writeText(text);
    setCopiedText("Copied successfully!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Matrix Filter
  const filteredRows = useMemo(() => {
    return subCategories.map(sub => {
      // Keep entire sub but only match rows containing searched items
      const updatedRows = sub.gradeRows.map(row => 
        row.filter(grade => grade.toLowerCase().includes(matrixSearch.toLowerCase()))
      ).filter(row => row.length > 0);
      
      return {
        ...sub,
        gradeRows: updatedRows
      };
    }).filter(sub => sub.gradeRows.length > 0);
  }, [matrixSearch]);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md print-container max-w-7xl mx-auto">
      {/* Header section matching style */}
      <div className="bg-[#0f172a] text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#f37021] text-white p-2 border border-white shrink-0">
            <Ruler className="w-5 h-5 text-orange-150" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              SOLID ROUND BARS ARCHITECTURE
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FAHIM MAHMUD DESIGN SYSTEMS • UAE ROUND BAR DATA MATRIX
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
                ? 'bg-[#f37021] text-slate-950 border-[#f37021]' 
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

      {/* MATRIX VIEW TAB COMPONENT */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-6 no-print">
          <div className="bg-orange-50 border border-orange-200 text-orange-950 p-3.5 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3">
            <Info className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
            <div>
              <strong>AUTHENTIC GRADES DATABASE MAP:</strong> Below is a direct alignment representation matching the engineering datasheet grid parameters for <strong>ROUND BARS</strong>. Toggle metric sizing or inch sizes for construction, oil, and gas specifications.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-2.5 border border-slate-200">
            <input
              type="text"
              placeholder="Filter specific grades (e.g., S355, F1554, SS 316, A193)..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full sm:w-80 p-2 pl-3 py-1 text-[10px] bg-white border border-slate-300 rounded-none font-bold uppercase placeholder:text-slate-400 focus:border-[#f37021] outline-none"
            />
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
              ROUND BARS FAMILY: Fully cataloged with high-low yield characteristics
            </div>
          </div>

          {/* Grid Layout Reproduction according to reference image */}
          <div className="space-y-6">
            {filteredRows.map((sub) => (
              <div key={sub.id} className="border-2 border-slate-900 overflow-hidden">
                <div className="bg-slate-900 text-white px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>{sub.name}</span>
                  <span className="text-[8px] tracking-widest text-[#f37021]">STANDARD COMPLIANT MATRIX</span>
                </div>
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600 font-medium font-sans">
                  {sub.description}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-slate-200 text-slate-800 uppercase font-bold text-[9px] border-b border-slate-300">
                        <th className="p-3 border-r border-slate-300 w-1/4">Sub Category Grid Columns</th>
                        <th className="p-3 text-center" colSpan={8}>Compliant Metallurgic Material Grades</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {sub.gradeRows.map((rowArr, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50/50">
                          {rowIdx === 0 && (
                            <td rowSpan={sub.gradeRows.length} className="p-3 font-bold text-rose-900 border-r border-slate-300 bg-slate-100/50 align-middle sticky left-0 z-10 w-1/4">
                              <span className="text-[10px] block uppercase">{sub.name}</span>
                              <span className="text-[8px] text-slate-400 font-normal italic block lowercase mt-0.5">Static reference index</span>
                            </td>
                          )}
                          <td className="p-1" colSpan={8}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 p-2">
                              {rowArr.map((grade, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    if (grade) {
                                      setSelectedSub(sub.id);
                                      setSelectedGrade(grade);
                                      setActiveTab('designer');
                                    }
                                  }}
                                  className={`p-2 border text-center transition-all cursor-pointer font-bold uppercase text-[9px] ${
                                    grade 
                                      ? 'bg-white hover:bg-[#f37021]/10 hover:border-[#f37021] border-slate-300 text-slate-800 shadow-sm' 
                                      : 'bg-transparent border-dashed border-slate-200 text-slate-300 pointer-events-none'
                                  } ${selectedGrade === grade && selectedSub === sub.id ? 'border-[#f37021] bg-[#f37021]/5 ring-1 ring-[#f37021]' : ''}`}
                                >
                                  {grade || '—'}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESIGNER WORKSPACE VIEWS */}
      {activeTab === 'designer' && (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 no-print bg-white">
          
          {/* SYSTEM CALCULATION CONTROLS (5 COLS) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-5">
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-4">
              <div className="border-b border-slate-300 pb-2.5">
                <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#f37021]" />
                  Bar Geometry & Properties Configuration
                </h4>
              </div>

              {/* Sub-tab quick swap */}
              <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-200 border border-slate-300">
                <button
                  type="button"
                  onClick={() => handleSubChange('metrics')}
                  className={`py-1.5 text-[9px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedSub === 'metrics' 
                      ? 'bg-[#f37021] text-slate-950 shadow-sm' 
                      : 'bg-transparent text-slate-600 hover:text-slate-800'
                  }`}
                >
                  METRIC SIZING (mm)
                </button>
                <button
                  type="button"
                  onClick={() => handleSubChange('inches')}
                  className={`py-1.5 text-[9px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedSub === 'inches' 
                      ? 'bg-[#f37021] text-slate-950 shadow-sm' 
                      : 'bg-transparent text-slate-600 hover:text-slate-800'
                  }`}
                >
                  IMPERIAL SIZING (Inch)
                </button>
              </div>

              {/* Specific material grade dropdown */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Active Metallurgic Standard Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-semibold focus:outline-none focus:border-[#f37021] uppercase text-slate-800"
                >
                  {subCategories.find(s => s.id === selectedSub)?.gradeRows.flat().filter(g => g !== '').map((grade, gIdx) => (
                    <option key={gIdx} value={grade}>{grade}</option>
                  ))}
                </select>
                <span className="block text-[8.2px] text-slate-400 uppercase tracking-wide italic mt-1 font-bold">
                  Matches standard structure mapping specifications.
                </span>
              </div>

              {/* Diameter Picker dropdown */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Nominal Dial Size (Ø)
                  </label>
                  <select
                    value={barDiameter}
                    onChange={(e) => setBarDiameter(Number(e.target.value))}
                    className="w-full p-2 h-9 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800 font-mono"
                  >
                    {activeDiameters.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Component Length (L)
                  </label>
                  <select
                    value={barLength}
                    onChange={(e) => setBarLength(Number(e.target.value))}
                    className="w-full p-2 h-9 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800 font-mono"
                  >
                    <option value={1}>1.0 Meter</option>
                    <option value={2}>2.0 Meters</option>
                    <option value={3}>3.0 Meters</option>
                    <option value={4}>4.0 Meters</option>
                    <option value={5}>5.0 Meters</option>
                    <option value={6}>6.0 Meters (Standard Cut)</option>
                  </select>
                </div>
              </div>

              {/* Manufacturing/Production quantity inputs */}
              <div>
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Batch Production Run Volume</span>
                  <span className="font-mono text-[9px] text-[#f37021] font-bold">{quantity} BARS</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-[#f37021]"
                />
              </div>
            </div>

            {/* Design Actions Buttons panel */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-900 hover:bg-slate-950 text-white p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#f37021]" /> PRINT BILL OF MATERIALS
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {copiedText || "COPY TECH SPECS REPORT"}
              </button>
            </div>
          </div>

          {/* DYNAMIC CAD HUDS AND TECHNICAL DATA CHART (7 COLS) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            
            {/* Visual HUD Schematic */}
            <div className="border border-slate-900 bg-slate-950 text-slate-300 p-4 space-y-3.5 relative">
              <div className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-800 px-2.5 py-0.5 font-mono text-[8px] font-bold text-[#f37021] tracking-wider uppercase">
                Interactive CAD Block
              </div>

              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f37021] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#f37021] animate-ping"></span>
                  SOLID ROUND BAR GEOMETRIC PROFILE
                </h3>
                <p className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Live dimensioning & metal standard profile layout analysis
                </p>
              </div>

              {/* Dynamic SVG CAD diagram */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 500 240" className="w-full max-w-[420px] h-[200px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#060913" rx="2" />
                  
                  {/* Fine layout drafting grid */}
                  <g opacity="0.04" stroke="#ffffff" strokeWidth="1">
                    <line x1="10%" y1="0" x2="10%" y2="100%" />
                    <line x1="20%" y1="0" x2="20%" y2="100%" />
                    <line x1="30%" y1="0" x2="30%" y2="100%" />
                    <line x1="40%" y1="0" x2="40%" y2="100%" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" />
                    <line x1="60%" y1="0" x2="60%" y2="100%" />
                    <line x1="70%" y1="0" x2="70%" y2="100%" />
                    <line x1="80%" y1="0" x2="80%" y2="100%" />
                    <line x1="90%" y1="0" x2="90%" y2="100%" />
                    <line x1="0" y1="20%" x2="100%" y2="20%" />
                    <line x1="0" y1="40%" x2="100%" y2="40%" />
                    <line x1="0" y1="60%" x2="100%" y2="60%" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" />
                  </g>

                  {/* Cylindrical solid bar diagram representation */}
                  <g transform="translate(10, 0)">
                    {/* Main Bar body cylindrical projection with varying thickness depending on nominal diameter */}
                    {/* Scale bar thickness dynamically */}
                    {(() => {
                      const baseThickness = 15 + (barDiameter / 100) * 80;
                      const yOffset = 120 - baseThickness / 2;
                      return (
                        <g>
                          {/* Inner cylindrical block gradient */}
                          <defs>
                            <linearGradient id="metalGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#cbd5e1" />
                              <stop offset="35%" stopColor="#94a3b8" />
                              <stop offset="50%" stopColor="#f1f5f9" stopOpacity="0.8" />
                              <stop offset="65%" stopColor="#64748b" />
                              <stop offset="100%" stopColor="#334155" />
                            </linearGradient>
                          </defs>

                          {/* Solid Cylinder Body */}
                          <rect x="120" y={yOffset} width="260" height={baseThickness} fill="url(#metalGlow)" stroke="#475569" strokeWidth="1.5" />
                          
                          {/* Left End Cap Profile (3D Curved Cap) */}
                          <ellipse cx="120" cy="120" rx="8" ry={baseThickness/2} fill="#64748b" stroke="#475569" strokeWidth="1.5" />
                          
                          {/* Right End Cap Highlights */}
                          <ellipse cx="380" cy="120" rx="8" ry={baseThickness/2} fill="url(#metalGlow)" stroke="#475569" strokeWidth="1.5" />

                          {/* Length dimension arrows layout */}
                          <path d={`M 120, ${yOffset - 30} L 380, ${yOffset - 30}`} stroke="#f37021" strokeWidth="1.2" strokeDasharray="3" />
                          <polygon points={`120,${yOffset - 30} 128,${yOffset - 34} 128,${yOffset - 26}`} fill="#f37021" />
                          <polygon points={`380,${yOffset - 30} 372,${yOffset - 34} 372,${yOffset - 26}`} fill="#f37021" />
                          <text x="250" y={yOffset - 38} className="font-mono text-[8px]" fill="#f37021" textAnchor="middle">Bar Length L = {barLength} meters</text>

                          {/* Diameter annotation layout vertical arrow */}
                          <path d="M 410, 120 L 410, 150" stroke="#38bdf8" strokeWidth="1" />
                          <text x="415" y="135" className="font-mono text-[7.5px]" fill="#38bdf8" textAnchor="start">Ø Size: {barDiameter.toFixed(1)} mm</text>
                        </g>
                      );
                    })()}
                  </g>
                  
                  {/* Metal specs stamp */}
                  <text x="30" y="210" className="font-mono text-[8px]" fill="#a8a29e">Fastener Standard: {selectedGrade}</text>
                  <text x="470" y="210" className="font-mono text-[8px] text-right" fill="#f37021" textAnchor="end">Unit cut: Raw straight edge</text>
                </svg>
              </div>

              {/* LIVE CALCULATED TECHNICAL LIMITS */}
              <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 font-mono text-[10px]">
                <div className="text-[10.5px] font-bold text-orange-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex justify-between items-center">
                  <span>METALLURGY & CAPACITY LIMITS</span>
                  <span className="text-white text-[8px] bg-slate-950 px-2 py-0.5 border border-slate-800 font-bold uppercase">{selectedGrade}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-slate-300">
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Active Metal Composition</span>
                    <span className="text-white font-semibold truncate block max-w-[170px]" title={computedSpecs.materialName}>
                      {computedSpecs.materialName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Ultimate Tensile</span>
                    <span className="text-amber-400 font-semibold">{computedSpecs.tensileStrengthMpa} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Density Volumetrics</span>
                    <span className="text-white font-semibold">{computedSpecs.densityGcm3.toFixed(3)} g/cm³</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Yield Strength Limit</span>
                    <span className="text-teal-400 font-semibold">{computedSpecs.yieldStrengthMpa} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Static Axial Tension (Yield)</span>
                    <span className="text-emerald-400 font-semibold">{computedSpecs.tensionLimitKN.toFixed(1)} kN</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Static Transverse Shear Load</span>
                    <span className="text-[#38bdf8] font-semibold">{computedSpecs.shearLimitKN.toFixed(1)} kN</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Unit Mass (Linear meter)</span>
                    <span className="text-stone-300 font-semibold">{computedSpecs.kgPerMeter.toFixed(3)} kg/m</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Weight per 1 bar ({barLength}m)</span>
                    <span className="text-white font-semibold">{computedSpecs.singleBarWeightKG.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Batch Consignment Mass ({quantity} pcs)</span>
                    <span className="text-orange-400 font-semibold">{computedSpecs.totalOrderWeightKG.toFixed(1)} KG</span>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 border-t border-slate-800 pt-2 font-sans normal-case leading-snug">
                  * Dynamic Yield tension capabilities indicate continuous static loads inside elastic bounds. Standard mechanical factor of safety (FoS = 1.5 - 2.5) must be factored before ultimate structural installations.
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PRINT-READY STYLED BILL OF MATERIALS SHEET */}
      <div className="hidden print-style-block print:block p-10 font-sans space-y-8">
        <div className="border-b-4 border-slate-900 pb-5 text-center">
          <h1 className="font-mono text-2xl font-bold uppercase text-slate-900 tracking-wider">
            MARINE FASTENERS SOLUTIONS LLC
          </h1>
          <p className="text-xs uppercase font-semibold tracking-widest text-[#f37021] mt-1">
            Official Technical Sheet & Structural Report — Metallic Round Bars
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 border-2 border-slate-900 p-6 bg-slate-50">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">1. Geometric Parameters</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <tbody>
                <tr className="py-2"><td className="font-bold py-1.5">Category Family:</td><td>SOLID ROUND BARS</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Sub Category Variant:</td><td>{subCategories.find(s => s.id === selectedSub)?.name}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Nominal Profile Diam (Ø):</td><td>{barDiameter.toFixed(2)} mm</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Bar Finished Cut Length:</td><td>{barLength} meters</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Bar Section Area:</td><td>{computedSpecs.areaMM2.toFixed(1)} mm²</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">2. Metallurgy & Performance</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <tbody>
                <tr className="py-2"><td className="font-bold py-1.5">Metal Standard Grade:</td><td>{selectedGrade}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Tensile Strengths (UTS):</td><td>{computedSpecs.tensileStrengthMpa} MPa</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Yield Strength Limit:</td><td>{computedSpecs.yieldStrengthMpa} MPa</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Calculated Linear Mass:</td><td>{computedSpecs.kgPerMeter.toFixed(3)} kg/m</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Batch Weight ({quantity} pcs):</td><td className="font-bold">{computedSpecs.totalOrderWeightKG.toFixed(1)} KG</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-24 flex justify-between items-center text-xs">
          <div className="border-t border-slate-400 pt-2 w-52 text-center">
            <p className="font-bold">Eng. Fahim Mahmud</p>
            <p className="text-[10px] text-slate-500">Fastener Design engineer signoff</p>
          </div>
          <div className="border-t border-slate-400 pt-2 w-52 text-center">
            <p className="font-bold">MFI Dubai QA</p>
            <p className="text-[10px] text-slate-500">Factory Dispatch Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
