import React, { useState, useMemo } from 'react';
import { 
  Ruler, FileCheck, Check, Printer, Info, HelpCircle, AlertCircle, Sparkles, Sliders, List, Grid3X3, Copy, ShieldAlert, Layers
} from 'lucide-react';

export interface FlatBarsSubCategory {
  id: string;
  name: string;
  description: string;
  gradeRows: string[][];
}

export default function FlatBarsDesignComponent() {
  const [activeTab, setActiveTab] = useState<'designer' | 'matrix'>('designer');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [matrixSearch, setMatrixSearch] = useState('');

  // Subection layouts as requested
  const subCategories: FlatBarsSubCategory[] = [
    {
      id: 'metrics',
      name: 'FLAT BARS METRICS',
      description: 'Precision hot-rolled and cold-formed metric dimensional steel flat bars for general structural fabrications.',
      gradeRows: [
        ['ASTM A36', 'S275 JR', 'SS 304', 'SS 316', 'SS 316L']
      ]
    },
    {
      id: 'inches',
      name: 'FLAT BARS INCHES',
      description: 'Imperial width and thickness structural flat steel sections conforming to ASTM and BS series.',
      gradeRows: [
        ['ASTM A36', 'S275 JR', 'SS 304', 'SS 316', 'SS 316L']
      ]
    }
  ];

  // Selected State
  const [selectedSub, setSelectedSub] = useState<string>('metrics');
  const [selectedGrade, setSelectedGrade] = useState<string>('S275 JR');
  const [flatWidth, setFlatWidth] = useState<number>(50.0); // mm
  const [flatThickness, setFlatThickness] = useState<number>(6.0); // mm
  const [barLength, setBarLength] = useState<number>(6); // length in meters
  const [quantity, setQuantity] = useState<number>(100);

  // Presets
  const METRIC_WIDTHS = [
    { value: 20.0, label: '20 mm' },
    { value: 25.0, label: '25 mm' },
    { value: 30.0, label: '30 mm' },
    { value: 40.0, label: '40 mm' },
    { value: 50.0, label: '50 mm' },
    { value: 65.0, label: '65 mm' },
    { value: 75.0, label: '75 mm' },
    { value: 100.0, label: '100 mm' },
    { value: 120.0, label: '120 mm' },
    { value: 150.0, label: '150 mm' }
  ];

  const METRIC_THICKNESSES = [
    { value: 3.0, label: '3.0 mm' },
    { value: 4.0, label: '4.0 mm' },
    { value: 5.0, label: '5.0 mm' },
    { value: 6.0, label: '6.0 mm' },
    { value: 8.0, label: '8.0 mm' },
    { value: 10.0, label: '10.0 mm' },
    { value: 12.0, label: '12.0 mm' },
    { value: 15.0, label: '15.0 mm' },
    { value: 20.0, label: '20.0 mm' },
    { value: 25.0, label: '25.0 mm' }
  ];

  const INCH_WIDTHS = [
    { value: 19.05, label: '3/4" (19.05 mm)' },
    { value: 25.4, label: '1" (25.40 mm)' },
    { value: 31.75, label: '1-1/4" (31.75 mm)' },
    { value: 38.1, label: '1-1/2" (38.10 mm)' },
    { value: 50.8, label: '2" (50.80 mm)' },
    { value: 63.5, label: '2-1/2" (63.50 mm)' },
    { value: 76.2, label: '3" (76.20 mm)' },
    { value: 101.6, label: '4" (101.60 mm)' },
    { value: 152.4, label: '6" (152.40 mm)' }
  ];

  const INCH_THICKNESSES = [
    { value: 3.175, label: '1/8" (3.18 mm)' },
    { value: 4.763, label: '3/16" (4.76 mm)' },
    { value: 6.35, label: '1/4" (6.35 mm)' },
    { value: 9.525, label: '3/8" (9.53 mm)' },
    { value: 12.7, label: '1/2" (12.70 mm)' },
    { value: 15.875, label: '5/8" (15.88 mm)' },
    { value: 19.05, label: '3/4" (19.05 mm)' },
    { value: 25.4, label: '1" (25.40 mm)' }
  ];

  const activeWidths = selectedSub === 'metrics' ? METRIC_WIDTHS : INCH_WIDTHS;
  const activeThicknesses = selectedSub === 'metrics' ? METRIC_THICKNESSES : INCH_THICKNESSES;

  // Mechanical specs, physical limits based on real metallurgy
  const computedSpecs = useMemo(() => {
    let densityGcm3 = 7.85; // Steel default
    let yieldStrengthMpa = 275; // S275 Default
    let tensileStrengthMpa = 410;
    let materialName = 'Carbon Steel / Structural Alloy';

    const gUpper = selectedGrade.toUpperCase();
    if (gUpper.includes('A36')) {
      yieldStrengthMpa = 250;
      tensileStrengthMpa = 400;
      materialName = 'ASTM A36 Carbon Steel';
    } else if (gUpper.includes('S275')) {
      yieldStrengthMpa = 275;
      tensileStrengthMpa = 410;
      materialName = 'S275JR Mild Structural Steel';
    } else if (gUpper.includes('SS 316') || gUpper.includes('316L')) {
      densityGcm3 = 7.98;
      yieldStrengthMpa = 205;
      tensileStrengthMpa = 515;
      materialName = 'SS 316 / A4 Austenitic Stainless Steel (Marine Grade)';
    } else if (gUpper.includes('SS 304')) {
      densityGcm3 = 7.93;
      yieldStrengthMpa = 215;
      tensileStrengthMpa = 505;
      materialName = 'SS 304 / A2 Stainless Steel';
    }

    // Flat Bar Cross-Section calculations
    // Area = w * t in mm2
    const areaMM2 = flatWidth * flatThickness;

    // Weight Calculations: section mass per meter
    // Vol in cm3 for 1m (100cm) = area (in cm2) * 100
    const areaCM2 = areaMM2 / 100;
    const kgPerMeter = areaCM2 * 100 * (densityGcm3 / 1000);

    const singleBarWeightKG = kgPerMeter * barLength;
    const totalOrderWeightKG = singleBarWeightKG * quantity;

    // Structural Moments & Stiffness properties
    // Moment of inertia: I_x = w * t^3 / 12, I_y = t * w^3 / 12
    const inertiaIx = (flatWidth * Math.pow(flatThickness, 3)) / 12; // mm4
    const inertiaIy = (flatThickness * Math.pow(flatWidth, 3)) / 12; // mm4

    // Section Modulus: Z_x = I_x / (t/2) = w * t^2 / 6, Z_y = I_y / (w/2) = t * w^2 / 6
    const zx = (flatWidth * Math.pow(flatThickness, 2)) / 6; // mm3
    const zy = (flatThickness * Math.pow(flatWidth, 2)) / 6; // mm3

    // Yield Tensile load limits (kN) = Area * Yield Strength / 1000
    const tensionLimitKN = (areaMM2 * yieldStrengthMpa) / 1000;
    
    // Safety bending moment limit (kNm) = Z_x (mm3) * Yield (MPa) / 10^6
    const bendingLimitKNm = (zx * yieldStrengthMpa) / 1000000;

    return {
      materialName,
      densityGcm3,
      areaMM2,
      kgPerMeter,
      singleBarWeightKG,
      totalOrderWeightKG,
      tensionLimitKN,
      bendingLimitKNm,
      inertiaIx,
      inertiaIy,
      zx,
      zy,
      yieldStrengthMpa,
      tensileStrengthMpa
    };
  }, [selectedGrade, flatWidth, flatThickness, barLength, quantity, selectedSub]);

  const handleSubChange = (id: string) => {
    setSelectedSub(id);
    if (id === 'metrics') {
      setFlatWidth(50.0);
      setFlatThickness(6.0);
    } else {
      setFlatWidth(50.8); // 2 in
      setFlatThickness(6.35); // 1/4 in
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `⚓ SAFELOCK MARINE COMPONENTS - TECHNICAL SPECIFICATION
Product Category: STRUCTURAL FLAT BARS
Sub Category Variant: ${subCategories.find(s => s.id === selectedSub)?.name}
Applied Standard / Metal Grade: ${selectedGrade}
Physical Mechanical Specifications:
- Nominal Section Size: ${flatWidth.toFixed(2)} mm Width x ${flatThickness.toFixed(2)} mm Thickness
- Total Length per unit: ${barLength} meters
- Sectional Profile Area: ${computedSpecs.areaMM2.toFixed(1)} mm²
Engineering & Rigidity Properties:
- Moment of Inertia (I_x): ${computedSpecs.inertiaIx.toFixed(1)} mm⁴
- Section Modulus (Z_x): ${computedSpecs.zx.toFixed(1)} mm³
- Safe Bending Moment Limit (M_y): ${computedSpecs.bendingLimitKNm.toFixed(3)} kNm
- Calculated Unit Weight: ${computedSpecs.kgPerMeter.toFixed(3)} kg/m
- Single Finished Bar Weight: ${computedSpecs.singleBarWeightKG.toFixed(2)} kg
- Dynamic Axial Tensile Capacity (Yield): ${computedSpecs.tensionLimitKN.toFixed(1)} kN
Logistics Estimates:
- Total Production Run Quantity: ${quantity} bars
- Combined Batch Consignment Mass: ${computedSpecs.totalOrderWeightKG.toFixed(1)} kg`;

    navigator.clipboard.writeText(text);
    setCopiedText("Copied successfully!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredRows = useMemo(() => {
    return subCategories.map(sub => {
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
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md print-container max-w-7xl mx-auto" id="flat-bars-design-block">
      {/* Header section matching style */}
      <div className="bg-[#0f172a] text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#f37021] text-white p-2 border border-white shrink-0">
            <Layers className="w-5 h-5 text-orange-150" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              STRUCTURAL FLAT BARS WORK BENCH
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FAHIM MAHMUD DESIGN SYSTEMS • STABLE BENDING & SHEAR PARAMETERS
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
              <Ruler className="w-3.5 h-3.5" /> CALC WORKSPACE
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

      {/* MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-6 no-print">
          <div className="bg-orange-50 border border-orange-200 text-orange-950 p-3.5 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3">
            <Info className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
            <div>
              <strong>STRUCTURAL FLAT BARS METALLURGY MATRIX:</strong> Access hot-rolled chemical compliance and engineering grades for <strong>FLAT BARS</strong>. Change sizes and widths between standard metric configurations or fractional inches easily.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-2.5 border border-slate-200">
            <input
              type="text"
              placeholder="Filter specific grades (e.g. S275 JR, ASTM A36)..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full sm:w-80 p-2 pl-3 py-1 text-[10px] bg-white border border-slate-300 rounded-none font-bold uppercase placeholder:text-slate-400 focus:border-[#f37021] outline-none"
            />
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
              Compliance Standards: ASTM A36 • EN10025 S275JR • SS Grade 304/316
            </div>
          </div>

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
                        <th className="p-3 text-center" colSpan={5}>Compliant Metallurgic Material Grades</th>
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
                          <td className="p-1" colSpan={5}>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-2">
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

      {/* WORKSPACE VIEW */}
      {activeTab === 'designer' && (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 no-print bg-white">
          {/* Controls Panel (5 Columns) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-5">
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-4">
              <div className="border-b border-slate-300 pb-2.5">
                <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#f37021]" />
                  Flat Bar Properties Setup
                </h4>
              </div>

              {/* Sub Category Quick Sizing Option */}
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
                  METRIC STANDARDS (mm)
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
                  IMPERIAL STANDARDS (Inch)
                </button>
              </div>

              {/* Metal Grade Selection */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Active Metallurgic Standard Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-semibold focus:outline-none focus:border-[#f37021] uppercase text-slate-800 focus:ring-1 focus:ring-[#f37021]"
                >
                  <option value="S275 JR">S275 JR (Yield: 275 MPa)</option>
                  <option value="ASTM A36">ASTM A36 (Yield: 250 MPa)</option>
                  <option value="SS 304">SS 304 (Yield: 215 MPa)</option>
                  <option value="SS 316">SS 316 (Yield: 205 MPa)</option>
                  <option value="SS 316L">SS 316L (Yield: 200 MPa)</option>
                </select>
              </div>

              {/* Sizing Parameters (Width and Thickness) */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Flat Section Width (W)
                  </label>
                  <select
                    value={flatWidth}
                    onChange={(e) => setFlatWidth(Number(e.target.value))}
                    className="w-full p-2 h-9 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800 font-mono"
                  >
                    {activeWidths.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Section Thickness (T)
                  </label>
                  <select
                    value={flatThickness}
                    onChange={(e) => setFlatThickness(Number(e.target.value))}
                    className="w-full p-2 h-9 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800 font-mono"
                  >
                    {activeThicknesses.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Finished Bar length (L)
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

                <div className="flex flex-col justify-end">
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Quantity Required</span>
                    <span className="font-mono text-[9px] text-[#f37021] font-bold">{quantity} BARS</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-1.5 h-9 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-[#f37021] focus:border-[#f37021] font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Manufacturing volume range bar */}
              <div>
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

            {/* Print and Specifications download trigger buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-900 hover:bg-slate-950 text-white p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#f37021]" /> PRINT SPEC SHEET
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 p-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {copiedText || "COPY FLAT SPECS REPORT"}
              </button>
            </div>
          </div>

          {/* DYNAMIC CAD HUDS AND TECHNICAL DATA CHART (7 COLS) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="border border-slate-900 bg-slate-950 text-slate-300 p-4 space-y-3.5 relative">
              <div className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-800 px-2.5 py-0.5 font-mono text-[8px] font-bold text-[#f37021] tracking-wider uppercase">
                Interactive CAD block
              </div>

              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f37021] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#f37021] animate-ping"></span>
                  STRUCTURAL FLAT BAR GEOMETRY & CROSS-SECTION
                </h3>
                <p className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Elastic modulus, Moment of Inertia, and Shear limit projection
                </p>
              </div>

              {/* SVG CAD Drafting Panel */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 500 240" className="w-full max-w-[420px] h-[200px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#060913" rx="2" />
                  
                  {/* Drafting Grid */}
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

                  {/* Isometric Flat bar rendering with scaling and annotations */}
                  {(() => {
                    // Let width control height on screen (since flat bars lie horizontal or vertical)
                    // Let's draw a nice 3D rectangular prism representing a flat bar!
                    const wScale = 30 + (flatWidth / 150) * 110;
                    const tScale = 10 + (flatThickness / 25) * 40;
                    
                    const xCenter = 190;
                    const yCenter = 125;

                    return (
                      <g>
                        {/* Metal Gradient */}
                        <defs>
                          <linearGradient id="flatMetalGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e2e8f0" />
                            <stop offset="40%" stopColor="#cbd5e1" />
                            <stop offset="70%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#475569" />
                          </linearGradient>
                          <linearGradient id="flatSideGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#334155" />
                          </linearGradient>
                        </defs>

                        {/* Flat bar representation block - length extrusion visual */}
                        <g transform={`translate(${xCenter - wScale/2}, ${yCenter - tScale/2})`}>
                          {/* Face plate */}
                          <rect x="0" y="0" width={wScale} height={tScale} fill="url(#flatMetalGlow)" stroke="#1e293b" strokeWidth="1.5" />
                          
                          {/* 3D Depth extrusion blocks */}
                          <path d={`M ${wScale},0 L ${wScale+60},-30 L ${wScale+60},${tScale-30} L ${wScale},${tScale} Z`} fill="url(#flatSideGlow)" stroke="#1e293b" strokeWidth="1" />
                          <path d={`M 0,0 L 60,-30 L ${wScale+60},-30 L ${wScale},0 Z`} fill="#f1f5f9" opacity="0.35" stroke="#1e293b" strokeWidth="1" />

                          {/* Horizontal Dimension Arrow (Width) */}
                          <path d={`M 0, ${tScale + 18} L ${wScale}, ${tScale + 18}`} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2" />
                          <polygon points={`0,${tScale + 18} 6,${tScale + 15} 6,${tScale + 21}`} fill="#38bdf8" />
                          <polygon points={`M ${wScale},${tScale + 18} l -6,-3 l 0,6 Z`} fill="#38bdf8" />
                          <text x={wScale/2} y={tScale + 30} className="font-mono text-[8px]" fill="#38bdf8" textAnchor="middle">Width w = {flatWidth.toFixed(1)} mm</text>

                          {/* Vertical Dimension Arrow (Thickness) */}
                          <path d={`M -18, 0 L -18, ${tScale}`} stroke="#fb7185" strokeWidth="1.2" strokeDasharray="2" />
                          <polygon points={`-18,0 -21,6 -15,6`} fill="#fb7185" />
                          <polygon points={`-18,${tScale} -21,${tScale-6} -15,${tScale-6}`} fill="#fb7185" />
                          <text x="-26" y={tScale/2 + 3} className="font-mono text-[8px]" fill="#fb7185" textAnchor="end">t = {flatThickness.toFixed(1)} mm</text>

                          {/* Length extrusion dimension line */}
                          <path d={`M ${wScale+10}, -5 L ${wScale+65}, -32`} stroke="#f37021" strokeWidth="1" strokeDasharray="3" />
                          <text x={wScale+50} y="-25" className="font-mono text-[7px] rotate-[-22deg]" fill="#f37021">Length L = {barLength}m</text>
                        </g>
                      </g>
                    );
                  })()}

                  <text x="30" y="210" className="font-mono text-[8px]" fill="#a8a29e">Applied Standard: {selectedGrade}</text>
                  <text x="470" y="210" className="font-mono text-[8px]" fill="#f37021" textAnchor="end">UAE Construction standard Compliant</text>
                </svg>
              </div>

              {/* Calculations Feed readout */}
              <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 font-mono text-[10px]">
                <div className="text-[10.5px] font-bold text-orange-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex justify-between items-center">
                  <span>STRUCTURAL MECHANICS & INERTIA FEED</span>
                  <span className="text-white text-[8px] bg-slate-950 px-2 py-0.5 border border-slate-800 font-bold uppercase">{selectedGrade}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-slate-300">
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Alloy Designation</span>
                    <span className="text-white font-semibold truncate block max-w-[170px]" title={computedSpecs.materialName}>
                      {computedSpecs.materialName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Cross-Sectional Area</span>
                    <span className="text-[#38bdf8] font-bold">{computedSpecs.areaMM2.toFixed(1)} mm²</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Elastic Modulus (Zx)</span>
                    <span className="text-amber-400 font-bold">{computedSpecs.zx.toFixed(1)} mm³</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Moment of Inertia (Ix)</span>
                    <span className="text-white font-bold">{computedSpecs.inertiaIx.toFixed(1)} mm⁴</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Tensile Yield strength</span>
                    <span className="text-teal-400 font-bold">{computedSpecs.yieldStrengthMpa} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Max Bending Moment limit</span>
                    <span className="text-orange-400 font-bold">{computedSpecs.bendingLimitKNm.toFixed(3)} kNm</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Tension Capability limit</span>
                    <span className="text-emerald-400 font-bold">{computedSpecs.tensionLimitKN.toFixed(1)} kN</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Single bar Mass ({barLength}m)</span>
                    <span className="text-white font-bold">{computedSpecs.singleBarWeightKG.toFixed(2)} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Logistics Weight ({quantity} pcs)</span>
                    <span className="text-orange-400 font-bold">{computedSpecs.totalOrderWeightKG.toFixed(1)} KG</span>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 border-t border-slate-800 pt-2 font-sans normal-case leading-snug">
                  * Structural parameters assume loading along the major axis. Zx and Ix denote properties calculated using bending perpendicular to width. Factor of Safety of 2.0 recommended for dynamic load calculations.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT AREA SHEET */}
      <div className="hidden print:block p-10 font-sans space-y-8" id="flat-bars-print-ready">
        <div className="border-b-4 border-slate-900 pb-5 text-center">
          <h1 className="font-mono text-2xl font-bold uppercase text-slate-900 tracking-wider">
            MARINE FASTENERS SOLUTIONS LLC
          </h1>
          <p className="text-xs uppercase font-semibold tracking-widest text-[#f37021] mt-1">
            TECHNICAL DESIGN REPORT & BENDING CERTIFICATE — STRUCTURAL FLAT BARS
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 border-2 border-slate-900 p-6 bg-slate-50">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">1. GEOMETRY & PROPERTIES</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <tbody>
                <tr className="py-2"><td className="font-bold py-1.5">Category Family:</td><td>STRUCTURAL FLAT BAR</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Width dimensions:</td><td>{flatWidth.toFixed(2)} mm</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Thickness dimensions:</td><td>{flatThickness.toFixed(2)} mm</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Length unit cut:</td><td>{barLength} meters</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Section Profile Area:</td><td>{computedSpecs.areaMM2.toFixed(1)} mm²</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Moment of Inertia (Ix):</td><td>{computedSpecs.inertiaIx.toFixed(1)} mm⁴</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">2. CAPACITY & DISPATCH VOLUME</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <tbody>
                <tr className="py-2"><td className="font-bold py-1.5">Metallurgic Grade:</td><td>{selectedGrade}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Yield Limit (σ_y):</td><td>{computedSpecs.yieldStrengthMpa} MPa</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Axial Tensile capacity:</td><td>{computedSpecs.tensionLimitKN.toFixed(1)} kN</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Ultimate Bending Limit:</td><td>{computedSpecs.bendingLimitKNm.toFixed(3)} kNm</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Calculated Linear Weight:</td><td>{computedSpecs.kgPerMeter.toFixed(3)} kg/m</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Total Batch Mass ({quantity} pcs):</td><td className="font-bold text-rose-950 font-mono">{computedSpecs.totalOrderWeightKG.toFixed(1)} KG</td></tr>
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
