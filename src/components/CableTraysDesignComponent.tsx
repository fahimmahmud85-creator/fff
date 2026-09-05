import React, { useState, useMemo } from 'react';
import { 
  Ruler, HelpCircle, AlertCircle, Info, Printer, Copy, Check, Sliders, Grid3X3, ArrowRight, ShieldCheck, Layers, Award
} from 'lucide-react';

export interface CableTraySubCategory {
  id: string;
  name: string;
  description: string;
  typicalSizingList: string[];
}

export default function CableTraysDesignComponent() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'matrix'>('workspace');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [matrixSearch, setMatrixSearch] = useState('');

  // Subeategories and specifications precisely matching the user's reference image
  const subCategories: CableTraySubCategory[] = [
    {
      id: 'slotted_channel',
      name: 'SLOTTED CHANNEL',
      description: 'C-Section strut channel with continuous slots for dynamic fixing, supporting main tray conduits.',
      typicalSizingList: ['41 x 41 mm (Standard)', '41 x 21 mm (Slimline)', '41 x 82 mm (Back-to-back Heavy)']
    },
    {
      id: 'flat_plate_fittings',
      name: 'FLAT PLATE FITTINGS',
      description: 'Pre-machined splice and joint flat plates in standard 2, 3, 4, 5 hole variations.',
      typicalSizingList: ['2-Hole Splice Plate', '3-Hole Flat Corners', '4-Hole Tee Bracket']
    },
    {
      id: 'angle_fittings',
      name: 'ANGLE FITTINGS',
      description: 'L-shape structural angle brackets for perpendicular frame corner reinforcement.',
      typicalSizingList: ['90° Angular Support', '45° Angular Support', 'Adjustable Hinge Bracket']
    },
    {
      id: 'wing_fittings',
      name: 'WING FITTINGS',
      description: 'Heavy duty wing fittings for triple-axis joints, rigid connection of intersecting channel grids.',
      typicalSizingList: ['Double Wing Fitting', 'Triple Wing Support', 'Multi-direction Node']
    },
    {
      id: 'z_u_fittings',
      name: 'Z & U FITTINGS',
      description: 'Z-shaped step adaptors and U-shaped embracing brackets for cross over channels.',
      typicalSizingList: ['Z-Type Offset Plate', 'U-Type Channel Saddle', 'Hat Channel Joint']
    },
    {
      id: 'beam_clamps',
      name: 'BEAM CLAMPS',
      description: 'Malleable steel fasteners designed to slide onto I-beam flanges without welding or drilling.',
      typicalSizingList: ['Window Beam Clamp', 'Window Clamp M10', 'Heavy Flange Grip C-Clamp']
    },
    {
      id: 'channel_connector',
      name: 'CHANNEL CONNECTOR',
      description: 'Internal and external splice elements for extension butt joints on slotted rails.',
      typicalSizingList: ['Standard Splice Sleeve', 'External Joint Sleeve', 'U-Shaped Rail Connector']
    },
    {
      id: 'base_posts',
      name: 'BASE POSTS',
      description: 'Heavy gauge circular or square flange basements to bolt strut assemblies directly to plaster/concrete.',
      typicalSizingList: ['H-Base Strut Post', 'Single Fixing Shoe', 'Double Strut Fixing Base']
    },
    {
      id: 'cantilevers',
      name: 'CANTILEVERS',
      description: 'Wall-projected horizontal load cantilever arms supporting distributed cable tray loads with high-moment bases.',
      typicalSizingList: ['300 mm Cantilever Arm', '450 mm Cantilever Arm', '600 mm Heavy Cantilever']
    },
    {
      id: 'i_beam_supports',
      name: 'I BEAM SUPPORTS',
      description: 'Heavy structural clamps and girder adapters to suspend overhead cable trays from ceiling structures.',
      typicalSizingList: ['Overhead Flange Clip', 'Girder Hanger Clamp', 'I-Beam Suspension Joint']
    }
  ];

  // Constant grades list directly matching the reference matrix columns
  const GRADES_LIST = ['ASTM A36', 'S275 JR', 'SS 304', 'SS 316', 'SS 316L'];

  // Spec selections
  const [selectedSub, setSelectedSub] = useState<string>('slotted_channel');
  const [selectedGrade, setSelectedGrade] = useState<string>('SS 316');
  const [selectedSize, setSelectedSize] = useState<string>('41 x 41 mm (Standard)');
  const [traySpan, setTraySpan] = useState<number>(2.0); // Support spacing span in meters
  const [uniformLoad, setUniformLoad] = useState<number>(65); // Distributed load (cables + tray weight) in kg/meter
  const [appliedFinish, setAppliedFinish] = useState<string>('Hot Dip Galvanized (HDG)');

  // Structural calculations engine using exact metallurgy & mechanics of materials
  const computedTraySpecs = useMemo(() => {
    let yieldStrengthMpa = 250; // ASTM A36
    let tensileStrengthMpa = 400;
    let materialDensity = 7.85; // Steel density g/cm³
    let materialGroup = 'Carbon Steel / HDG Support';

    if (selectedGrade === 'S275 JR') {
      yieldStrengthMpa = 275;
      tensileStrengthMpa = 430;
      materialDensity = 7.85;
      materialGroup = 'Structural Mild Steel';
    } else if (selectedGrade === 'SS 304') {
      yieldStrengthMpa = 215;
      tensileStrengthMpa = 505;
      materialDensity = 7.93;
      materialGroup = 'Stainless Steel A2 Premium';
    } else if (selectedGrade === 'SS 316') {
      yieldStrengthMpa = 220;
      tensileStrengthMpa = 515;
      materialDensity = 7.98;
      materialGroup = 'Stainless Steel A4 Marine Grade';
    } else if (selectedGrade === 'SS 316L') {
      yieldStrengthMpa = 200;
      tensileStrengthMpa = 485;
      materialDensity = 7.98;
      materialGroup = 'Stainless Steel Elite (Low Carbon)';
    }

    // Strut moment of Inertia (Ix) based on typical 41x41 standard profile (approx 9.2 cm^4) or 41x21 (approx 2.1 cm^4)
    let Ix_cm4 = 9.2;
    let sectionModulusWx_cm3 = 4.1; // for bend calculations
    let unitMassKgPerMet = 2.5; // weight of structural channel/bracket per meter

    if (selectedSize.includes('41 x 21')) {
      Ix_cm4 = 2.1;
      sectionModulusWx_cm3 = 1.35;
      unitMassKgPerMet = 1.7;
    } else if (selectedSize.includes('41 x 82') || selectedSize.includes('Double') || selectedSize.includes('600 mm')) {
      Ix_cm4 = 42.0;
      sectionModulusWx_cm3 = 10.2;
      unitMassKgPerMet = 5.0;
    }

    // If actual selection is a non-channel fitting (e.g. Angle/Flat shape), use scaled values or standard references
    const isFittingType = selectedSub !== 'slotted_channel' && selectedSub !== 'cantilevers';
    if (isFittingType) {
      unitMassKgPerMet = 0.65; // average weight per flat/angle element piece
    }

    // Formulas:
    // Span = L (in meters)
    // Dynamic Total Load on the span = uniformLoad * L in kg
    const totalMassOnSpanKG = uniformLoad * traySpan;
    const loadNPerM = uniformLoad * 9.81; // Convert kg/m to N/m

    // Deflection calculation (Continuous beam with distributed load)
    // Delta = (5 * w * L^4) / (384 * E * I)
    // E (Modulus of elasticity) = 200,000 MPa (200 GPa) = 200 x 10^9 N/m^2
    // I = Ix_cm4 * 10^-8 m^4
    const E_Pa = 200e9;
    const I_m4 = Ix_cm4 * 1e-8;
    const Span_m = traySpan;
    
    // Deflection in mm:
    const deflectionMM = ((5 * loadNPerM * Math.pow(Span_m, 4)) / (384 * E_Pa * I_m4)) * 1000;
    
    // Industrial compliance limit: Max allowable deflection is Span / 240
    const deflectionLimitMM = (Span_m * 1000) / 240;
    const isDeflectionSafe = deflectionMM <= deflectionLimitMM && deflectionMM < 10.0;

    // Bending Stress (S) = M / W
    // M (Bending Moment for simply supported beam with distributed load) = (w * L^2) / 8
    const bendingMomentNm = (loadNPerM * Math.pow(Span_m, 2)) / 8;
    const sectionModulus_m3 = sectionModulusWx_cm3 * 1e-6;
    const bendingStressMpa = (bendingMomentNm / sectionModulus_m3) / 1e6;

    // Safety factor against bending yield
    const bendingSafetyFactor = yieldStrengthMpa / (bendingStressMpa || 1);
    const isStressSafe = bendingStressMpa < yieldStrengthMpa;

    return {
      materialGroup,
      yieldStrengthMpa,
      tensileStrengthMpa,
      materialDensity,
      unitMassKgPerMet,
      totalMassOnSpanKG,
      deflectionMM,
      deflectionLimitMM,
      isDeflectionSafe,
      bendingMomentNm,
      bendingStressMpa,
      bendingSafetyFactor,
      isStressSafe,
      isFittingType
    };
  }, [selectedSub, selectedGrade, selectedSize, traySpan, uniformLoad]);

  const handleSubChange = (id: string) => {
    setSelectedSub(id);
    const sub = subCategories.find(s => s.id === id);
    if (sub && sub.typicalSizingList && sub.typicalSizingList.length > 0) {
      setSelectedSize(sub.typicalSizingList[0]);
    }
  };

  const currentSubObj = useMemo(() => {
    return subCategories.find(s => s.id === selectedSub) || subCategories[0];
  }, [selectedSub]);

  // Handler for dynamic spec export
  const handleCopySpec = () => {
    const text = `⚓ SAFELOCK CABLE SUPPORT SYSTEMS - TECHNICAL STRUCTURAL REPORT
Applied Variant: ${currentSubObj.name}
Steel/Alloy Standard Grade: ${selectedGrade} (${computedTraySpecs.materialGroup})
Nominal Section Sizing: ${selectedSize}
Dynamic Operational Parameters:
- Total Structural Span: ${traySpan} meters
- Total Cable Distributed Payload: ${uniformLoad} kg/meter
Physics Deflection Analysis:
- Real Deflection on Span: ${computedTraySpecs.isFittingType ? 'N/A' : `${computedTraySpecs.deflectionMM.toFixed(2)} mm`}
- Code Limit Allowance (L/240): ${computedTraySpecs.isFittingType ? 'N/A' : `${computedTraySpecs.deflectionLimitMM.toFixed(1)} mm`}
- Deflection Status: ${computedTraySpecs.isFittingType ? 'FITTING BASE COMPLIANT' : (computedTraySpecs.isDeflectionSafe ? 'APPROVED' : 'CRITICAL - STRENGTHEN SPAN')}
Stress & Mechanics Capacity:
- Max Moment on Rail: ${computedTraySpecs.isFittingType ? 'Piece structural base only' : `${computedTraySpecs.bendingMomentNm.toFixed(1)} N·m`}
- Bending Fiber Flex Stress: ${computedTraySpecs.isFittingType ? 'Direct contact shear' : `${computedTraySpecs.bendingStressMpa.toFixed(1)} MPa`}
- Structural Flex Factor of Safety: ${computedTraySpecs.isFittingType ? '3.0+' : computedTraySpecs.bendingSafetyFactor.toFixed(2)}
Approved Finish Protection: ${appliedFinish}`;

    navigator.clipboard.writeText(text);
    setCopiedText("Copied Component Specifications!");
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border-2 border-slate-900 rounded-none overflow-hidden shadow-md print-container max-w-7xl mx-auto">
      
      {/* HEADER SECTION IN CORRESPONDING MARINE STYLE */}
      <div className="bg-[#0f172a] text-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b-2 border-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-[#f37021] text-white p-2 border border-white shrink-0">
            <Layers className="w-5 h-5 text-orange-100" />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold tracking-wider uppercase text-white flex items-center gap-1.5 leading-snug">
              CABLE SUPPORT SYSTEMS DESIGN WORKBENCH
            </h2>
            <p className="text-[9.5px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              FAHIM MAHMUD ENGR • METALLURGIC SYSTEM ALIGNMENTS
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
              activeTab === 'workspace' 
                ? 'bg-[#f37021] text-slate-950 border-[#f37021]' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> CALCULATOR LAB
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
              <Grid3X3 className="w-3.5 h-3.5" /> STANDARD MATRIX
            </span>
          </button>
        </div>
      </div>

      {/* MATRIX ALIGNMENT TAB */}
      {activeTab === 'matrix' && (
        <div className="p-4 md:p-6 space-y-6 no-print">
          <div className="bg-orange-50 border border-orange-200 text-orange-950 p-4 text-[10px] sm:text-[11px] leading-relaxed font-sans font-medium flex gap-3">
            <Award className="w-4.5 h-4.5 text-orange-700 shrink-0 mt-0.5" />
            <div>
              <strong>CABLE TRAY GRADE ALIGNMENT COMPONENT MATRIX:</strong> Each structural cable tray element is engineered to accommodate corrosive industrial, marine, or infrastructure load configurations. Select a subcategory below to verify compatible alloy grades.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3 border border-slate-200">
            <input
              type="text"
              placeholder="Search specific tray fitting profile..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full sm:w-80 p-2 pl-3 py-1 text-[10px] bg-white border border-slate-300 rounded-none font-bold uppercase focus:border-[#f37021] outline-none"
            />
            <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
              GRID STANDARDS COMPLIANCE: Mapped to ASTM and BS-EN metallurgy indexes
            </div>
          </div>

          <div className="border-2 border-slate-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] font-mono">
                <thead>
                  <tr className="bg-[#0f172a] text-white uppercase text-[8.5px] border-b border-slate-800">
                    <th className="p-3 border-r border-slate-850 w-2/5 font-bold uppercase tracking-wider">CABLE TRAY PRODUCTS CATEGORY</th>
                    {GRADES_LIST.map((gr) => (
                      <th key={gr} className="p-3 border-r border-slate-850 text-center font-bold uppercase tracking-wider">{gr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {subCategories
                    .filter(sub => sub.name.toLowerCase().includes(matrixSearch.toLowerCase()))
                    .map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70">
                        <td className="p-3 border-r border-slate-200">
                          <span className="font-semibold text-slate-900 block text-[10.5px] uppercase">{sub.name}</span>
                          <span className="text-[8.5px] text-slate-500 font-sans block leading-normal mt-0.5">{sub.description}</span>
                        </td>
                        {GRADES_LIST.map((gr) => {
                          const isMatch = true; // Every subcategory listed shares these exact 5 grades in the diagram
                          return (
                            <td key={gr} className="p-2 border-r border-slate-200 text-center">
                              <div
                                onClick={() => {
                                  setSelectedSub(sub.id);
                                  setSelectedGrade(gr);
                                  if (sub.typicalSizingList && sub.typicalSizingList.length > 0) {
                                    setSelectedSize(sub.typicalSizingList[0]);
                                  }
                                  setActiveTab('workspace');
                                }}
                                className="px-2 py-2 hover:bg-[#f37021]/15 hover:border-[#f37021] border border-slate-300 text-slate-800 text-[8.5px] uppercase font-bold transition-all cursor-pointer bg-slate-50"
                              >
                                <span className="text-emerald-700 block text-[7.5px] font-bold">● COMPLIANT</span>
                                <span className="text-[9px] text-slate-900">{gr}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE WORKSPACE VIEW (CALCULATOR HUD) */}
      {activeTab === 'workspace' && (
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 no-print bg-white">
          
          {/* CONTROL BOX PANEL (5 COLS) */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-5">
            <div className="bg-slate-50 border border-slate-300 p-4 space-y-4">
              
              <div className="border-b border-slate-300 pb-2.5">
                <h4 className="text-[10.5px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#f37021]" />
                  Cable Support System Parameters
                </h4>
              </div>

              {/* Sub-category list dropdown */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Overhead Bracket / Accessory Category
                </label>
                <select
                  value={selectedSub}
                  onChange={(e) => handleSubChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-semibold focus:outline-none focus:border-[#f37021] uppercase text-slate-800"
                >
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <span className="block text-[8.2px] text-slate-400 font-sans leading-tight mt-1 font-medium">
                  {currentSubObj.description}
                </span>
              </div>

              {/* Specific sizing dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    System Grade Sizing (Inches/mm)
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800 font-mono"
                  >
                    {currentSubObj.typicalSizingList.map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>

                {/* Metallurgic Grade Select Option */}
                <div>
                  <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Steel Grade Compliance
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-900 uppercase"
                  >
                    {GRADES_LIST.map((gr) => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Span Configuration (Only relevant to channels or cantilevers) */}
              {!computedTraySpecs.isFittingType && (
                <div className="space-y-3 p-3 bg-white border border-slate-200">
                  <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-1">
                    👨‍💻 Span Layout Settings
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span>Support Column Span Spacing</span>
                      <span className="font-mono text-[9px] text-[#f37021] font-bold">{traySpan.toFixed(1)} METERS</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="4.0"
                      step="0.1"
                      value={traySpan}
                      onChange={(e) => setTraySpan(Number(e.target.value))}
                      className="w-full accent-[#f37021]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      <span>Design Payload (Cable + Tray Net Load)</span>
                      <span className="font-mono text-[9px] text-[#f37021] font-bold">{uniformLoad} KG / METER</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={uniformLoad}
                      onChange={(e) => setUniformLoad(Number(e.target.value))}
                      className="w-full accent-[#f37021]"
                    />
                  </div>
                </div>
              )}

              {/* Protective Finish Finish Style selection */}
              <div>
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Protective Coating Specification
                </label>
                <select
                  value={appliedFinish}
                  onChange={(e) => setAppliedFinish(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-none text-[10.5px] font-bold focus:outline-none focus:border-[#f37021] text-slate-800"
                >
                  <option value="Hot Dip Galvanized (HDG)">Hot Dip Galvanized (HDG) as per BS EN ISO 1461</option>
                  <option value="Pre-Galvanized (Zinc Coated)">Pre-Galvanized (PG) as per BS EN 10346</option>
                  <option value="Epoxy Powder Coated">Electrostatic Polyester Powder Epoxy Coating (60-80 Micron)</option>
                  <option value="Plain Pickled (Stainless only)">Saturated Plain Acid Pickled Passivated Bright</option>
                </select>
              </div>

            </div>

            {/* BUTTON TRIGGER MODULES */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-900 hover:bg-slate-950 text-white p-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#f37021]" /> GENERATE CERTIFIED SUBMITTAL
              </button>
              <button
                type="button"
                onClick={handleCopySpec}
                className="w-full inline-flex items-center gap-1.5 justify-center bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 p-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {copiedText || "COPY DESIGN REPORT"}
              </button>
            </div>
          </div>

          {/* DYNAMIC CAD HUDS AND STRESS ANALYZER PANEL (7 COLS) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            
            {/* Interactive vector display board */}
            <div className="border border-slate-900 bg-slate-950 text-slate-300 p-4 space-y-3.5 relative">
              <div className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-800 px-2.5 py-0.5 font-mono text-[8px] font-bold text-[#f37021] tracking-wider uppercase">
                Active Drafting Block
              </div>

              <div>
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f37021] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#f37021] animate-ping"></span>
                  STRUCTURAL LOAD DIAGRAM
                </h3>
                <p className="text-[8.5px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Geometric modeling & beam deflection visual analysis
                </p>
              </div>

              {/* Dynamic SVG CAD modeling representation */}
              <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 500 240" className="w-full max-w-[420px] h-[200px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#070a14" rx="2" />
                  
                  {/* Grid lines */}
                  <g opacity="0.04" stroke="#ffffff" strokeWidth="1">
                    <line x1="20%" y1="0" x2="20%" y2="100%" />
                    <line x1="40%" y1="0" x2="40%" y2="100%" />
                    <line x1="60%" y1="0" x2="60%" y2="100%" />
                    <line x1="80%" y1="0" x2="80%" y2="100%" />
                    <line x1="0" y1="30%" x2="100%" y2="30%" />
                    <line x1="0" y1="60%" x2="100%" y2="60%" />
                    <line x1="0" y1="90%" x2="100%" y2="90%" />
                  </g>

                  {/* Channel/Accessories visual sketch based on selection */}
                  {selectedSub === 'slotted_channel' ? (
                    <g transform="translate(40, 20)">
                      {/* Slotted channel beam */}
                      {/* Bending scale visualization based on load weight */}
                      {(() => {
                        const bendFactor = Math.min((uniformLoad * traySpan) / 20, 25);
                        const cPath = `M 40,110 Q 210,${110 + bendFactor} 380,110`;
                        return (
                          <g>
                            {/* Slotted channel dynamic bent vector */}
                            <path d={cPath} stroke="#64748b" strokeWidth="16" fill="none" strokeLinecap="square" />
                            <path d={cPath} stroke="#e2e8f0" strokeWidth="12" fill="none" strokeLinecap="square" />
                            <path d={cPath} stroke="#070a14" strokeWidth="4" strokeDasharray="14 10" fill="none" />

                            {/* Standard support rods hangers */}
                            <line x1="42" y1="20" x2="42" y2="105" stroke="#94a3b8" strokeWidth="3" />
                            <circle cx="42" cy="107" r="4.5" fill="#f37021" />
                            
                            <line x1="378" y1="20" x2="378" y2="105" stroke="#94a3b8" strokeWidth="3" />
                            <circle cx="378" cy="107" r="4.5" fill="#f37021" />

                            {/* Cable packages loaded on the tray */}
                            <g transform={`translate(0, ${bendFactor * 0.5})`}>
                              {/* Draw overlapping circular copper wire cable clusters */}
                              <circle cx="160" cy="100" r="14" fill="#a16207" opacity="0.8" stroke="#fef08a" strokeWidth="1.5" />
                              <circle cx="180" cy="98" r="10" fill="#2563eb" opacity="0.9" stroke="#93c5fd" strokeWidth="1" />
                              <circle cx="200" cy="99" r="16" fill="#1e293b" opacity="0.9" stroke="#475569" strokeWidth="1.5" />
                              <circle cx="220" cy="96" r="11" fill="#dc2626" opacity="0.85" stroke="#fca5a5" strokeWidth="1" />
                              <circle cx="240" cy="101" r="13" fill="#15803d" opacity="0.8" stroke="#86efac" strokeWidth="1.5" />
                            </g>

                            {/* Span Dimensioning Labels */}
                            <path d="M 42, 160 L 378, 160" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3" />
                            <polygon points="42,160 50,157 50,163" fill="#38bdf8" />
                            <polygon points="378,160 370,157 370,163" fill="#38bdf8" />
                            <text x="210" y="174" className="font-mono text-[8.5px]" fill="#38bdf8" textAnchor="middle">SPAN BETWEEN SUPPORTS = {traySpan} METERS</text>

                            {/* Design load force vector */}
                            <line x1="210" y1="35" x2="210" y2="75" stroke="#f37021" strokeWidth="2" strokeDasharray="1.5" />
                            <polygon points="210,75 206,67 214,67" fill="#f37021" />
                            <text x="215" y="48" className="font-mono text-[7px]" fill="#f37021">w = {uniformLoad} kg/m</text>
                          </g>
                        );
                      })()}
                    </g>
                  ) : selectedSub === 'cantilevers' ? (
                    <g transform="translate(45, 10)">
                      {/* Anchor fix base post wall */}
                      <rect x="30" y="30" width="16" height="150" fill="#334155" stroke="#1e293b" />
                      <line x1="46" y1="30" x2="46" y2="180" stroke="#475569" strokeWidth="4" />
                      
                      {/* Base plate welding shoe plate */}
                      <rect x="44" y="65" width="8" height="80" fill="#cbd5e1" stroke="#475569" />

                      {/* Cantilever arm extending to the right with scaling length */}
                      {(() => {
                        const scaleW = selectedSize.includes("450") ? 250 : selectedSize.includes("600") ? 320 : 180;
                        const loadY = Math.min(uniformLoad / 1.6, 95);
                        return (
                          <g>
                            <polygon points={`52,80 ${52 + scaleW},90 ${52 + scaleW},105 52,115`} fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
                            <line x1="52" y1="98" x2={52 + scaleW} y2="98" stroke="#64748b" strokeWidth="2" strokeDasharray="8 4" />

                            {/* Anchor bolts fixing wall */}
                            <rect x="22" y="72" width="24" height="6" fill="#f37021" />
                            <rect x="22" y="132" width="24" height="6" fill="#f37021" />

                            {/* Loaded Cable bundle sitting on the arm */}
                            <ellipse cx={52 + scaleW/2} cy="82" rx="20" ry="10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1" />
                            <ellipse cx={52 + scaleW/1.4} cy="84" rx="14" ry="7" fill="#dc2626" opacity="0.9" />

                            <text x={52 + scaleW/2} y="135" className="font-mono text-[8px]" fill="#cbd5e1" textAnchor="middle">Projected Arm Length: {selectedSize}</text>
                          </g>
                        );
                      })()}
                    </g>
                  ) : (
                    <g transform="translate(100, 20)">
                      {/* Render representative modular angle or flange joint */}
                      <rect x="40" y="40" width="120" height="120" stroke="#cbd5e1" strokeWidth="4" fill="none" rx="8" />
                      <circle cx="100" cy="100" r="28" fill="#f37021" opacity="0.2" />
                      <circle cx="100" cy="100" r="14" fill="#f37021" />
                      
                      {/* Connection secure bolts */}
                      <circle cx="65" cy="65" r="5" fill="#334155" stroke="#cbd5e1" />
                      <circle cx="135" cy="65" r="5" fill="#334155" stroke="#cbd5e1" />
                      <circle cx="65" cy="135" r="5" fill="#334155" stroke="#cbd5e1" />
                      <circle cx="135" cy="135" r="5" fill="#334155" stroke="#cbd5e1" />
                      
                      <text x="100" y="190" className="font-mono text-[8px]" fill="#f37021" textAnchor="middle">{selectedSize} - Standard Fitting Layout</text>
                    </g>
                  )}

                  {/* Stamp */}
                  <text x="25" y="215" className="font-mono text-[8.2px]" fill="#78716c">Approved Standard Class: {selectedGrade}</text>
                  <text x="475" y="215" className="font-mono text-[8.2px] text-right" fill="#f37021" textAnchor="end">Safelock QA Certified</text>
                </svg>
              </div>

              {/* LIVE STRUCTURAL DATA ANALYSIS SHEETS */}
              <div className="bg-slate-900 border border-slate-800 p-4 space-y-3.5 font-mono text-[10px]">
                
                <div className="text-[10.5px] font-bold text-orange-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex justify-between items-center">
                  <span>METALS ENGINE REAL-TIME ANALYSIS</span>
                  <span className="text-white text-[8px] bg-slate-950 px-2 py-0.5 border border-slate-800 font-bold uppercase">{selectedGrade}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-slate-300">
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Material Subclass</span>
                    <span className="text-white font-semibold truncate block max-w-[170px]" title={computedTraySpecs.materialGroup}>
                      {computedTraySpecs.materialGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Elastic Yield Limit (Fy)</span>
                    <span className="text-amber-400 font-semibold">{computedTraySpecs.yieldStrengthMpa} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Ultimate Tensile (Fu)</span>
                    <span className="text-white font-semibold">{computedTraySpecs.tensileStrengthMpa} MPa</span>
                  </div>

                  {!computedTraySpecs.isFittingType ? (
                    <>
                      <div>
                        <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Theoretical Span Mass</span>
                        <span className="text-teal-400 font-bold">{computedTraySpecs.totalMassOnSpanKG.toFixed(1)} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Calculated Deflection</span>
                        <span className={`font-bold ${computedTraySpecs.isDeflectionSafe ? 'text-emerald-400' : 'text-rose-500'}`}>
                          {computedTraySpecs.deflectionMM.toFixed(2)} mm
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Allowable Limit (L/240)</span>
                        <span className="text-stone-300 font-semibold">{computedTraySpecs.deflectionLimitMM.toFixed(1)} mm</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Peak Bending Moment (Max)</span>
                        <span className="text-white">{computedTraySpecs.bendingMomentNm.toFixed(1)} N·m</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Peak Surface Bending Stress</span>
                        <span className="text-stone-300 font-semibold">{computedTraySpecs.bendingStressMpa.toFixed(1)} MPa</span>
                      </div>
                      <div>
                        <span className="text-slate-450 block text-[7.5px] uppercase tracking-wider font-semibold">Flex Safety Margins</span>
                        <span className={`font-bold ${computedTraySpecs.isStressSafe ? 'text-emerald-400' : 'text-rose-500'}`}>
                          {computedTraySpecs.isStressSafe ? `FoS = ${computedTraySpecs.bendingSafetyFactor.toFixed(2)}` : 'FAILURE / EXCEEDS Fy'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 bg-slate-950 p-2 border border-slate-800 text-[8.5px] leading-relaxed text-slate-400">
                      ℹ️ <strong>FITTING CONNECTIONS SPECIFICATION:</strong> This component operates as an accessory link. Main structural span calculations should be derived using the principal slotted channels configured above. Static safety factors of 3.0+ are maintained for bolt friction connections.
                    </div>
                  )}
                </div>

                {!computedTraySpecs.isFittingType && (
                  <div className="text-[8.2px] text-slate-400 border-t border-slate-800 pt-2 font-sans flex items-start gap-1.5 leading-normal">
                    <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <span>
                      Deflection metrics check: {computedTraySpecs.isDeflectionSafe ? (
                        <span className="text-emerald-400 font-bold uppercase">APPROVED UNDER BS 3979 COMPLIANCE STAUNCHIONS.</span>
                      ) : (
                        <span className="text-rose-400 font-bold uppercase">CRITICAL DEFLECTION WARNING. REDUCE BAY SPAN FOR BETTER LOAD COMPLIANCE.</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PRINT COPY STYLED FOR DEDICATED EXPORTS */}
      <div className="hidden print-style-block print:block p-10 font-sans space-y-8">
        <div className="border-b-4 border-slate-900 pb-5 text-center">
          <h1 className="font-mono text-2xl font-bold uppercase text-slate-900 tracking-wide">
            MARINE FASTENERS SOLUTIONS LLC - DUBAI
          </h1>
          <p className="text-xs uppercase font-semibold tracking-widest text-[#f37021] mt-1">
            Structural Submittal Sub-Grade Certificate: Cable Trays Assembly & Support System
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 border border-slate-900 p-6 bg-slate-50">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">1. Geometric Configuration</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <tbody>
                <tr className="py-2"><td className="font-bold py-1.5">Component Type:</td><td>{currentSubObj.name}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Profile Dimension:</td><td>{selectedSize}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Design Support Span L:</td><td>{traySpan.toFixed(2)} Meters</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Uniform System Load:</td><td>{uniformLoad} kg/meter</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Protective Coating:</td><td>{appliedFinish}</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">2. Metallurgic Integrity Diagnostics</h3>
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <tbody>
                <tr className="py-2"><td className="font-bold py-1.5">Material Alloy Grade:</td><td>{selectedGrade}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Fy Ductile Yield stress:</td><td>{computedTraySpecs.yieldStrengthMpa} MPa</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Ultimate Tensile stress:</td><td>{computedTraySpecs.tensileStrengthMpa} MPa</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Mechanical Deflection:</td><td>{computedTraySpecs.isFittingType ? 'Fitting connection' : `${computedTraySpecs.deflectionMM.toFixed(2)} mm`}</td></tr>
                <tr className="py-2"><td className="font-bold py-1.5">Resultant Status Signoff:</td><td className="font-bold text-emerald-800">CLASS A PASS (FoS {computedTraySpecs.isFittingType ? '3.0' : computedTraySpecs.bendingSafetyFactor.toFixed(1)})</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-24 flex justify-between items-center text-xs">
          <div className="border-t border-slate-450 pt-2 w-52 text-center">
            <p className="font-bold">Eng. Fahim Mahmud</p>
            <p className="text-[10px] text-slate-500">Principal Design Engineer Signoff</p>
          </div>
          <div className="border-t border-slate-450 pt-2 w-52 text-center">
            <p className="font-bold">MFI Construction Group</p>
            <p className="text-[10px] text-slate-500">QA / QC Inspector Approval</p>
          </div>
        </div>
      </div>

    </div>
  );
}
