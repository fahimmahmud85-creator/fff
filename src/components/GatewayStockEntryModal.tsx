import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Upload, Check } from 'lucide-react';
import { CompanyProfile } from '../utils/companyProfile';
import { playClickSound, playSuccessChime } from '../utils/audioChimes';
import { Category } from '../types';
import { 
  STANDARD_CATEGORIES_LIST,
  FINE_THREAD_CATEGORIES_LIST,
  HEX_BOLTS_FULL_THREAD_METRIC_GRADES,
  HEX_BOLTS_HALF_THREAD_METRIC_GRADES,
  HEX_BOLTS_INCH_GRADES,
  FLANGE_BOLTS_FULL_THREAD_METRIC_GRADES
} from '../initialData';

// Exact 18 Sub-Categories matching Gateway of Tally Master Template
export const STRUCTURAL_BOLTS_18_SUBCATEGORIES = [
  'HEX BOLT',
  'HEAVY HEX BOLT',
  'FLANGE BOLTS',
  'ROOFING BOLTS',
  'CARRIAGE BOLTS',
  'T BOLTS',
  '12 POINTS BOLTS',
  'HEX BOLTS',
  '12 POINT BOLTS',
  'TENSION CONTROL BOLTS',
  'SQUARE HEAD BOLTS',
  'CONNECTOR BOLTS',
  'COACH SCREWS',
  'EYE BOLTS',
  'U BOLTS',
  'J BOLTS',
  'FOUNDATION BOLTS',
  'TRACK SHOE BOLTS'
];

export interface GatewayStockSelection {
  fastenerClass: string;
  category: string;
  subCategory: string;
  threadSeries: string;
  grade: string;
  idx?: number;
  partNo?: string;
  dia?: string;
  pitch?: string;
  length?: string;
  finish?: string;
  marking?: string;
  unit?: string;
  openingStock?: number;
  inStock?: number;
  outGoingStock?: number;
  balanceStock?: number;
  tallyStock?: number;
  unitWeight?: number;
  totalWeight?: number;
  rackLocation?: string;
  qty?: number;
}

interface GatewayStockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCompany: CompanyProfile;
  standardsProducts?: Category[];
  fineThreadProducts?: Category[];
  onCompleteSelection: (selection: GatewayStockSelection) => void;
}

export default function GatewayStockEntryModal({
  isOpen,
  onClose,
  activeCompany,
  standardsProducts = [],
  fineThreadProducts = [],
  onCompleteSelection
}: GatewayStockEntryModalProps) {
  // Step 1 to 5: selection list; Step 6: stock entry form table (Image 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Selections state
  const [selectedClass, setSelectedClass] = useState<string>('STANDARD THREAD');
  const [selectedCategory, setSelectedCategory] = useState<string>('STRUCTURAL BOLTS');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('HEX BOLT');
  const [selectedThreadSeries, setSelectedThreadSeries] = useState<string>('HEX BOLT FULL THREAD METRIC');
  const [selectedGrade, setSelectedGrade] = useState<string>('DIN 933 GR 4.6');

  // Step 6 Stock Entry Form State (Exact matching Image 5)
  const [stockIdx, setStockIdx] = useState<number>(1);
  const [stockPartNo, setStockPartNo] = useState<string>('MFHBDIN93M12-40');
  const [stockDia, setStockDia] = useState<string>('M12');
  const [stockPitch, setStockPitch] = useState<string>('1.75');
  const [stockLength, setStockLength] = useState<string>('40');
  const [stockFinish, setStockFinish] = useState<string>('Hot Dip Galvanized (HDG)');
  const [stockMarking, setStockMarking] = useState<string>('DIN 933 GR 4.6');
  const [stockUnit, setStockUnit] = useState<string>('PCS');
  const [stockOpeningQty, setStockOpeningQty] = useState<number>(1820);
  const [stockInStock, setStockInStock] = useState<number>(0);
  const [stockOutQty, setStockOutQty] = useState<number>(0);
  const [stockUnitWeight, setStockUnitWeight] = useState<number>(0.0493);
  const [stockRack, setStockRack] = useState<string>('R-01');

  // Confirmation popup for "Add Size?"
  const [showAddSizePrompt, setShowAddSizePrompt] = useState<boolean>(false);
  const [addSizeChoice, setAddSizeChoice] = useState<'yes' | 'no'>('yes');

  // Sequential Field Input Refs for Step 6 Enter navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const partNoInputRef = useRef<HTMLInputElement>(null);
  const diaInputRef = useRef<HTMLInputElement>(null);
  const pitchInputRef = useRef<HTMLInputElement>(null);
  const lengthInputRef = useRef<HTMLInputElement>(null);
  const finishInputRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const openingQtyInputRef = useRef<HTMLInputElement>(null);
  const inStockInputRef = useRef<HTMLInputElement>(null);
  const outQtyInputRef = useRef<HTMLInputElement>(null);
  const unitWeightInputRef = useRef<HTMLInputElement>(null);
  const rackInputRef = useRef<HTMLInputElement>(null);

  // Derived balance and weight
  const balanceQty = useMemo(() => {
    return Math.max(0, (Number(stockOpeningQty) || 0) + (Number(stockInStock) || 0) - (Number(stockOutQty) || 0));
  }, [stockOpeningQty, stockInStock, stockOutQty]);

  const tallyQty = balanceQty;

  const totalWeightStr = useMemo(() => {
    const total = balanceQty * (Number(stockUnitWeight) || 0);
    return `${total.toFixed(2)} KG`;
  }, [balanceQty, stockUnitWeight]);

  // Update part number & defaults when grade, dia, length change
  const updatePartNoAndDefaults = (grade: string, dia: string, len: string) => {
    const cleanDia = dia.toUpperCase().replace(/\s+/g, '');
    const cleanLen = len.replace(/\s+/g, '');
    const cleanGrade = grade.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    setStockPartNo(`MFHB${cleanGrade}${cleanDia}-${cleanLen}`);
    setStockMarking(grade);

    // Default pitch mapping
    const diaNum = parseInt(cleanDia.replace(/\D/g, ''), 10);
    if (diaNum === 6) setStockPitch('1.0');
    else if (diaNum === 8) setStockPitch('1.25');
    else if (diaNum === 10) setStockPitch('1.5');
    else if (diaNum === 12) setStockPitch('1.75');
    else if (diaNum === 14) setStockPitch('2.0');
    else if (diaNum === 16) setStockPitch('2.0');
    else if (diaNum === 20) setStockPitch('2.5');
    else if (diaNum === 24) setStockPitch('3.0');
  };

  // Resolving Lists per step
  const getRawOptionsForStep = (): string[] => {
    if (currentStep === 1) {
      return ['STANDARD THREAD', 'FINE THREAD'];
    }

    if (currentStep === 2) {
      const isFine = selectedClass.toUpperCase().includes('FINE');
      if (isFine) {
        return FINE_THREAD_CATEGORIES_LIST || ['STRUCTURAL BOLTS', 'ALL THREADS & STUDS', 'STUD BOLTS', 'SOCKET SCREWS', 'MACHINE SCREWS', 'NUT'];
      }
      return STANDARD_CATEGORIES_LIST;
    }

    if (currentStep === 3) {
      // Subcategories for Category (Exact 18 entries from Gateway Master when Structural Bolts)
      if (selectedCategory.toUpperCase().includes('STRUCTURAL')) {
        return STRUCTURAL_BOLTS_18_SUBCATEGORIES;
      }
      const isFine = selectedClass.toUpperCase().includes('FINE');
      const productList = isFine ? fineThreadProducts : standardsProducts;
      const foundCat = productList.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
      if (foundCat && foundCat.subcategories.length > 0) {
        return foundCat.subcategories.map(s => s.name.toUpperCase());
      }
      return ['STANDARD SERIES', 'HEAVY DUTY SERIES', 'SPECIAL APPLICATION'];
    }

    if (currentStep === 4) {
      // Thread Series for Subcategory
      const isFine = selectedClass.toUpperCase().includes('FINE');
      const productList = isFine ? fineThreadProducts : standardsProducts;
      const foundCat = productList.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
      if (foundCat) {
        const foundSub = foundCat.subcategories.find(s => s.name.toLowerCase() === selectedSubCategory.toLowerCase());
        if (foundSub && foundSub.threadTypes.length > 0) {
          return foundSub.threadTypes.map(t => t.name.toUpperCase());
        }
      }
      // Exact options matching Image 4
      return [
        'HEX BOLT FULL THREAD METRIC',
        'HEX BOLT HALF THREAD METRIC',
        'HEX BOLT FULL THREAD INCHES',
        'HEX BOLT HALF THREAD INCHES'
      ];
    }

    if (currentStep === 5) {
      // Technical Grades
      const isFine = selectedClass.toUpperCase().includes('FINE');
      const productList = isFine ? fineThreadProducts : standardsProducts;
      const foundCat = productList.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
      if (foundCat) {
        const foundSub = foundCat.subcategories.find(s => s.name.toLowerCase() === selectedSubCategory.toLowerCase());
        if (foundSub) {
          const foundTt = foundSub.threadTypes.find(t => t.name.toLowerCase() === selectedThreadSeries.toLowerCase());
          if (foundTt && foundTt.grades.length > 0) {
            return foundTt.grades.map(g => g.name.toUpperCase());
          }
        }
      }
      // Exact matching Image 1: 40 entries
      if (selectedThreadSeries.toUpperCase().includes('HALF THREAD METRIC')) {
        return HEX_BOLTS_HALF_THREAD_METRIC_GRADES;
      }
      if (selectedThreadSeries.toUpperCase().includes('INCH')) {
        return HEX_BOLTS_INCH_GRADES;
      }
      return HEX_BOLTS_FULL_THREAD_METRIC_GRADES;
    }

    return [];
  };

  const rawOptions = getRawOptionsForStep();

  // Filtered options based on search filter
  const filteredOptions = useMemo(() => {
    if (!searchFilter.trim()) return rawOptions;
    const q = searchFilter.toLowerCase().trim();
    return rawOptions.filter(opt => opt.toLowerCase().includes(q));
  }, [rawOptions, searchFilter]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredOptions.length) {
      setSelectedIndex(0);
    }
  }, [filteredOptions.length, selectedIndex]);

  // Auto-scroll selected row into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Auto focus search input on step change
  useEffect(() => {
    if (isOpen && currentStep >= 2 && currentStep <= 5) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else if (isOpen && currentStep === 6) {
      setTimeout(() => {
        diaInputRef.current?.focus();
        diaInputRef.current?.select();
      }, 50);
    }
  }, [currentStep, isOpen]);

  // Handle option selection
  const handleSelectOption = (opt: string) => {
    playClickSound();
    setSearchFilter('');
    setSelectedIndex(0);

    if (currentStep === 1) {
      setSelectedClass(opt);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setSelectedCategory(opt);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setSelectedSubCategory(opt);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setSelectedThreadSeries(opt);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setSelectedGrade(opt);
      updatePartNoAndDefaults(opt, stockDia, stockLength);
      setCurrentStep(6);
    }
  };

  // Back step navigation - strictly back one stage per Esc
  const handleBackStep = () => {
    playClickSound();
    setSearchFilter('');
    setSelectedIndex(0);

    if (showAddSizePrompt) {
      setShowAddSizePrompt(false);
      return;
    }

    if (currentStep === 6) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      onClose();
    }
  };

  // Field-to-field Enter key navigation handler (Moves focus down, and after Rack Location prompts Add Size?)
  const handleFieldKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement | null> | null,
    isLastField = false
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleBackStep();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      playClickSound();
      if (isLastField) {
        // User pressed Enter on Rack Location: show popup "Add Size?"
        setShowAddSizePrompt(true);
        setAddSizeChoice('yes');
      } else if (nextRef && nextRef.current) {
        nextRef.current.focus();
        nextRef.current.select();
      }
    }
  };

  // Save current record to stock ledger/products
  const saveCurrentRecord = () => {
    onCompleteSelection({
      fastenerClass: selectedClass,
      category: selectedCategory,
      subCategory: selectedSubCategory,
      threadSeries: selectedThreadSeries,
      grade: selectedGrade,
      idx: stockIdx,
      partNo: stockPartNo || `MFHB${selectedGrade.replace(/[^A-Z0-9]/g, '').slice(0, 5)}${stockDia || 'M12'}-${stockLength || '40'}`,
      dia: stockDia || 'M12',
      pitch: stockPitch || '1.75',
      length: stockLength || '40',
      finish: stockFinish,
      marking: stockMarking || selectedGrade,
      unit: stockUnit || 'PCS',
      openingStock: Number(stockOpeningQty) || 0,
      inStock: Number(stockInStock) || 0,
      outGoingStock: Number(stockOutQty) || 0,
      balanceStock: balanceQty,
      tallyStock: tallyQty,
      unitWeight: Number(stockUnitWeight) || 0,
      totalWeight: Number((balanceQty * (Number(stockUnitWeight) || 0)).toFixed(2)),
      rackLocation: stockRack || 'R-01',
      qty: balanceQty
    });
  };

  // If user chooses YES in "Add Size?":
  // Save current record, keep the same layout (Class, Cat, Sub-cat, Thread, Grade, Rack, Finish),
  // increment IDX, reset size inputs, and refocus on SIZE * input field
  const handleConfirmAddSize = () => {
    playSuccessChime();
    saveCurrentRecord();

    setStockIdx(prev => prev + 1);
    setStockDia('');
    setStockPitch('');
    setStockLength('');
    setStockOpeningQty(0);
    setStockInStock(0);
    setStockOutQty(0);
    setStockUnitWeight(0);
    setStockPartNo('');
    setShowAddSizePrompt(false);

    setTimeout(() => {
      diaInputRef.current?.focus();
    }, 100);
  };

  // If user chooses NO in "Add Size?":
  // Save current record and close the popup & modal
  const handleConfirmClose = () => {
    playSuccessChime();
    saveCurrentRecord();
    setShowAddSizePrompt(false);
    onClose();
  };

  // Master Keyboard Navigation across all stages
  useEffect(() => {
    if (!isOpen) return;

    const handleMasterKeyDown = (e: KeyboardEvent) => {
      // 1. ESC: Back one stage at a time (Prompt -> Step 6 -> Step 5 -> Step 4 -> Step 3 -> Step 2 -> Step 1 -> Close)
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleBackStep();
        return;
      }

      // 2. Add Size Confirmation Prompt Active Controls
      if (showAddSizePrompt) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          setAddSizeChoice(prev => (prev === 'yes' ? 'no' : 'yes'));
          playClickSound();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (addSizeChoice === 'yes') {
            handleConfirmAddSize();
          } else {
            handleConfirmClose();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          e.stopPropagation();
          handleConfirmAddSize();
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          e.stopPropagation();
          handleConfirmClose();
        }
        return;
      }

      // 3. Selection Steps 1 to 5 Navigation
      if (currentStep <= 5) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
          playClickSound();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
          playClickSound();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (filteredOptions[selectedIndex]) {
            handleSelectOption(filteredOptions[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleMasterKeyDown, true);
    return () => window.removeEventListener('keydown', handleMasterKeyDown, true);
  }, [
    isOpen,
    currentStep,
    filteredOptions,
    selectedIndex,
    showAddSizePrompt,
    addSizeChoice,
    stockIdx,
    stockPartNo,
    stockDia,
    stockLength,
    stockFinish,
    stockMarking,
    stockUnit,
    stockOpeningQty,
    stockInStock,
    stockOutQty,
    stockUnitWeight,
    stockRack,
    balanceQty,
    selectedClass,
    selectedCategory,
    selectedSubCategory,
    selectedThreadSeries,
    selectedGrade
  ]);

  // Reset to initial state on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedIndex(0);
      setSearchFilter('');
      setSelectedClass('STANDARD THREAD');
      setSelectedCategory('STRUCTURAL BOLTS');
      setSelectedSubCategory('HEX BOLT');
      setSelectedThreadSeries('HEX BOLT FULL THREAD METRIC');
      setSelectedGrade('DIN 933 GR 4.6');
      setStockDia('M12');
      setStockPitch('1.75');
      setStockLength('40');
      setStockFinish('Hot Dip Galvanized (HDG)');
      setStockMarking('DIN 933 GR 4.6');
      setStockUnit('PCS');
      setStockOpeningQty(1820);
      setStockInStock(0);
      setStockOutQty(0);
      setStockUnitWeight(0.0493);
      setStockRack('R-01');
      setStockPartNo('MFHBDIN93M12-40');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Header Title per step
  const getStepBoxHeader = () => {
    if (currentStep === 1) return 'SELECT FASTENER CLASS';
    if (currentStep === 2) {
      const clsName = selectedClass.toUpperCase().includes('FINE') ? 'FINE' : 'STANDARD';
      return `SELECT CATEGORY [${clsName}] • ${filteredOptions.length} CATEGORIES`;
    }
    if (currentStep === 3) {
      return `SELECT SUB-CATEGORY FOR [${selectedCategory.toUpperCase()}]`;
    }
    if (currentStep === 4) {
      return `SELECT THREAD SERIES FOR [${selectedSubCategory.toUpperCase()}]`;
    }
    if (currentStep === 5) {
      return 'SELECT TECHNICAL GRADE';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 select-none font-sans">
      {/* Outer Container with dark blue frame & authentic ice-blue background */}
      <div className="w-full max-w-3xl sm:max-w-4xl bg-[#eaf2f9] rounded-xs shadow-2xl border-2 border-[#123870] overflow-hidden flex flex-col min-h-[580px] max-h-[95vh]">
        
        {/* 1. TOP HEADER BAR (Exact from Images) */}
        <div className="bg-[#143d78] px-3.5 py-2.5 flex items-center justify-between text-white border-b border-[#0e2c56]">
          {/* Left Title with Floppy/Disk Icon */}
          <div className="flex items-center gap-2">
            <span className="text-amber-300 text-base leading-none select-none">🗄️</span>
            <span className="font-black text-xs sm:text-[13.5px] tracking-wider uppercase">
              GATEWAY OF TALLY • QUICK STOCK ENTRY MASTERS
            </span>
          </div>

          {/* Center/Right Company & Shortcut Hints */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Company Name in framed dark box */}
            <div className="px-3 py-1 bg-[#0a2754] border border-[#23539b] rounded-xs text-[11px] sm:text-xs font-bold text-amber-300 uppercase truncate max-w-[200px] sm:max-w-[320px]">
              {activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP)'}
            </div>

            {/* Shortcut Keys Guide */}
            <div className="text-[11px] text-blue-200 font-mono hidden md:block leading-tight text-right">
              Use <span className="text-amber-300 font-bold">↑ ↓ &amp;</span>
              <div>
                <span className="text-amber-300 font-bold">ENTER</span> • <span className="text-amber-300 font-bold">ESC</span> Back
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-blue-200 hover:text-white p-1 hover:bg-blue-800/80 rounded-xs cursor-pointer transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. STEPPER PROGRESS BAR (Always visible for full context across Steps 1 to 6) */}
        <div className="bg-white px-3 sm:px-4 py-2 border-b border-blue-200 flex items-center justify-between shadow-2xs overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
            {/* Step 1: CLASS */}
            <div 
              onClick={() => { setCurrentStep(1); setSelectedIndex(0); setSearchFilter(''); }}
              className={`px-3.5 py-1.5 rounded-xs flex flex-col items-center justify-center leading-tight shrink-0 transition-all cursor-pointer min-w-[85px] ${
                currentStep === 1 
                  ? 'bg-[#f5a623] text-slate-950 font-black border-2 border-amber-600/50 shadow-xs' 
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
              }`}
            >
              <span className={`text-[10.5px] font-bold ${currentStep === 1 ? 'text-slate-950' : 'text-slate-500'}`}>1.</span>
              <span className="text-xs sm:text-[12.5px] font-black uppercase tracking-wider">CLASS</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mx-0.5">&gt;</span>

            {/* Step 2: CATEGORY */}
            <div 
              onClick={() => { if (currentStep > 2) { setCurrentStep(2); setSelectedIndex(0); setSearchFilter(''); } }}
              className={`px-3.5 py-1.5 rounded-xs flex flex-col items-center justify-center leading-tight shrink-0 transition-all min-w-[95px] ${
                currentStep === 2 
                  ? 'bg-[#f5a623] text-slate-950 font-black border-2 border-amber-600/50 shadow-xs' 
                  : 'bg-white border border-slate-300 text-slate-700'
              } ${currentStep > 2 ? 'cursor-pointer hover:border-slate-400' : ''}`}
            >
              <span className={`text-[10.5px] font-bold ${currentStep === 2 ? 'text-slate-950' : 'text-slate-500'}`}>2.</span>
              <span className="text-xs sm:text-[12.5px] font-black uppercase tracking-wider">CATEGORY</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mx-0.5">&gt;</span>

            {/* Step 3: SUB-CATEGORY */}
            <div 
              onClick={() => { if (currentStep > 3) { setCurrentStep(3); setSelectedIndex(0); setSearchFilter(''); } }}
              className={`px-3.5 py-1.5 rounded-xs flex flex-col items-center justify-center leading-tight shrink-0 transition-all min-w-[110px] ${
                currentStep === 3 
                  ? 'bg-[#f5a623] text-slate-950 font-black border-2 border-amber-600/50 shadow-xs' 
                  : 'bg-white border border-slate-300 text-slate-700'
              } ${currentStep > 3 ? 'cursor-pointer hover:border-slate-400' : ''}`}
            >
              <span className={`text-[10.5px] font-bold ${currentStep === 3 ? 'text-slate-950' : 'text-slate-500'}`}>3. SUB-</span>
              <span className="text-xs sm:text-[12.5px] font-black uppercase tracking-wider">CATEGORY</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mx-0.5">&gt;</span>

            {/* Step 4: THREAD SERIES */}
            <div 
              onClick={() => { if (currentStep > 4) { setCurrentStep(4); setSelectedIndex(0); setSearchFilter(''); } }}
              className={`px-3.5 py-1.5 rounded-xs flex flex-col items-center justify-center leading-tight shrink-0 transition-all min-w-[105px] ${
                currentStep === 4 
                  ? 'bg-[#f5a623] text-slate-950 font-black border-2 border-amber-600/50 shadow-xs' 
                  : 'bg-white border border-slate-300 text-slate-700'
              } ${currentStep > 4 ? 'cursor-pointer hover:border-slate-400' : ''}`}
            >
              <span className={`text-[10.5px] font-bold ${currentStep === 4 ? 'text-slate-950' : 'text-slate-500'}`}>4. THREAD</span>
              <span className="text-xs sm:text-[12.5px] font-black uppercase tracking-wider">SERIES</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mx-0.5">&gt;</span>

            {/* Step 5: GRADES */}
            <div 
              onClick={() => { if (currentStep > 5) { setCurrentStep(5); setSelectedIndex(0); setSearchFilter(''); } }}
              className={`px-3.5 py-1.5 rounded-xs flex flex-col items-center justify-center leading-tight shrink-0 transition-all min-w-[85px] ${
                currentStep === 5 
                  ? 'bg-[#f5a623] text-slate-950 font-black border-2 border-amber-600/50 shadow-xs' 
                  : 'bg-white border border-slate-300 text-slate-700'
              } ${currentStep > 5 ? 'cursor-pointer hover:border-slate-400' : ''}`}
            >
              <span className={`text-[10.5px] font-bold ${currentStep === 5 ? 'text-slate-950' : 'text-slate-500'}`}>5.</span>
              <span className="text-xs sm:text-[12.5px] font-black uppercase tracking-wider">GRADES</span>
            </div>
          </div>

          <span className="text-xs sm:text-sm font-black text-[#143d78] shrink-0 ml-3">
            {currentStep <= 5 ? `Step ${currentStep} of 5` : `Step 6: Stock Form`}
          </span>
        </div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-center overflow-y-auto">
          {currentStep <= 5 ? (
            /* STEPS 1 to 5: LIST SELECTION CARD (Exact matching Images 1, 2, 3, 4) */
            <div className="w-full max-w-xl mx-auto bg-white border-2 border-[#143d78] shadow-lg overflow-hidden rounded-xs">
              
              {/* Card Header Banner */}
              <div className="bg-[#143d78] text-white text-center py-2.5 px-4 text-xs sm:text-sm font-black tracking-wider uppercase">
                {getStepBoxHeader()}
              </div>

              {/* Search Filter Input (Shown for Steps with lists: 2, 3, 4, 5) */}
              {currentStep >= 2 && (
                <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchFilter}
                    onChange={(e) => {
                      setSearchFilter(e.target.value);
                      setSelectedIndex(0);
                    }}
                    placeholder="Type to quick filter list..."
                    className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFilter('');
                        setSelectedIndex(0);
                      }}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Scrollable Option Items */}
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-8 text-center text-xs sm:text-sm text-slate-400 font-mono">
                    No matching items found for "{searchFilter}"
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={opt}
                        ref={isSelected ? selectedItemRef : null}
                        onClick={() => handleSelectOption(opt)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`px-4 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer select-none transition-colors ${
                          isSelected
                            ? 'bg-[#f5a623] text-slate-950 font-black'
                            : 'hover:bg-blue-50/70 text-[#143d78] font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-base sm:text-lg font-black leading-none ${isSelected ? 'text-slate-950' : 'text-[#143d78]'}`}>
                            •
                          </span>
                          <span className="text-xs sm:text-[13.5px] uppercase tracking-wide">
                            {opt}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="px-2.5 py-0.5 bg-amber-400/50 border border-slate-900/40 rounded-xs text-[10px] sm:text-[11px] font-black text-slate-950 tracking-wider shadow-2xs">
                            ENTER ↵
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Card Footer */}
              <div className="bg-[#e8f1fa] px-4 py-2 flex items-center justify-between text-xs sm:text-[12.5px] font-bold text-[#143d78] border-t border-blue-200">
                <span>Showing {filteredOptions.length} entries</span>
                <span>Press ENTER to select • ESC to go back</span>
              </div>
            </div>
          ) : (
            /* STEP 6: STOCK ENTRY FORM TABLE (Exact matching Image 5) */
            <div className="w-full max-w-xl mx-auto space-y-2.5">
              {/* Breadcrumbs for Grade & Hierarchy */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div className="bg-[#f5a623] border border-amber-600/40 p-1.5 rounded-xs text-center shadow-2xs">
                  <div className="text-[9.5px] font-bold text-slate-900 uppercase">CLASS</div>
                  <div className="text-xs font-black text-slate-950 uppercase truncate">
                    {selectedClass.replace(' THREAD', '')}
                  </div>
                </div>

                <div className="bg-[#f5a623] border border-amber-600/40 p-1.5 rounded-xs text-center shadow-2xs">
                  <div className="text-[9.5px] font-bold text-slate-900 uppercase">CATEGORY</div>
                  <div className="text-xs font-black text-slate-950 uppercase truncate">
                    {selectedCategory}
                  </div>
                </div>

                <div className="bg-[#f5a623] border border-amber-600/40 p-1.5 rounded-xs text-center shadow-2xs">
                  <div className="text-[9.5px] font-bold text-slate-900 uppercase">SUB-CAT</div>
                  <div className="text-xs font-black text-slate-950 uppercase truncate">
                    {selectedSubCategory}
                  </div>
                </div>

                <div className="bg-[#f5a623] border border-amber-600/40 p-1.5 rounded-xs text-center shadow-2xs">
                  <div className="text-[9.5px] font-bold text-slate-900 uppercase">THREAD SERIES</div>
                  <div className="text-xs font-black text-slate-950 uppercase truncate">
                    {selectedThreadSeries}
                  </div>
                </div>
              </div>

              {/* Full Width Grade Banner */}
              <div className="bg-[#f5a623] border border-amber-600/40 py-1.5 px-3 rounded-xs text-center shadow-2xs">
                <div className="text-[9.5px] font-bold text-slate-900 uppercase">GRADE</div>
                <div className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wide">
                  {selectedGrade}
                </div>
              </div>

              {/* The Vertical 2-Column Ledger Table */}
              <div className="bg-white border-2 border-slate-300 shadow-xs font-mono text-xs sm:text-[13px] divide-y divide-slate-300">
                
                {/* 1. IDX */}
                <div className="grid grid-cols-12">
                  <div className="col-span-4 bg-slate-50 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    IDX
                  </div>
                  <div className="col-span-8 py-1.5 px-3 font-black text-slate-900">
                    {stockIdx}
                  </div>
                </div>

                {/* 2. PART NO */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    PART NO
                  </div>
                  <div className="col-span-8 py-1 px-2.5 font-bold text-slate-900">
                    <input
                      ref={partNoInputRef}
                      type="text"
                      value={stockPartNo}
                      onChange={(e) => setStockPartNo(e.target.value.toUpperCase())}
                      onKeyDown={(e) => handleFieldKeyDown(e, diaInputRef)}
                      className="w-full bg-transparent outline-none font-bold text-slate-900 uppercase"
                    />
                  </div>
                </div>

                {/* 3. SIZE * (Highlighted Yellow/Amber Background) */}
                <div className="grid grid-cols-12 items-center bg-amber-50/60">
                  <div className="col-span-4 bg-[#fef3c7] py-1.5 px-3 font-black text-amber-950 text-right border-r border-slate-300 uppercase">
                    SIZE *
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={diaInputRef}
                      type="text"
                      value={stockDia}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setStockDia(val);
                        updatePartNoAndDefaults(selectedGrade, val, stockLength);
                      }}
                      onKeyDown={(e) => handleFieldKeyDown(e, pitchInputRef)}
                      placeholder="M12"
                      className="w-full bg-white border-2 border-[#f5a623] rounded-xs px-2.5 py-1 font-black text-slate-950 text-left outline-none uppercase shadow-2xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 4. PITCH */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    PITCH
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={pitchInputRef}
                      type="text"
                      value={stockPitch}
                      onChange={(e) => setStockPitch(e.target.value)}
                      onKeyDown={(e) => handleFieldKeyDown(e, lengthInputRef)}
                      placeholder="1.75"
                      className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1 font-bold text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* 5. LENGTH */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    LENGTH
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={lengthInputRef}
                      type="text"
                      value={stockLength}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStockLength(val);
                        updatePartNoAndDefaults(selectedGrade, stockDia, val);
                      }}
                      onKeyDown={(e) => handleFieldKeyDown(e, finishInputRef)}
                      placeholder="40"
                      className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1 font-bold text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* 6. FINISH */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    FINISH
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={finishInputRef}
                      type="text"
                      value={stockFinish}
                      onChange={(e) => setStockFinish(e.target.value)}
                      onKeyDown={(e) => handleFieldKeyDown(e, unitInputRef)}
                      placeholder="Hot Dip Galvanized (HDG)"
                      className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1 font-bold text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* 7. MARKING (With Upload Button) */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    MARKING
                  </div>
                  <div className="col-span-8 py-1 px-3 flex items-center justify-between font-bold text-slate-900">
                    <span>{stockMarking}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.click();
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs text-[10px] text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                {/* 8. UNIT */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    UNIT
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={unitInputRef}
                      type="text"
                      value={stockUnit}
                      onChange={(e) => setStockUnit(e.target.value.toUpperCase())}
                      onKeyDown={(e) => handleFieldKeyDown(e, openingQtyInputRef)}
                      className="w-full bg-transparent outline-none font-bold text-slate-900 px-1"
                    />
                  </div>
                </div>

                {/* 9. OPENING QTY */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    OPENING QTY
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={openingQtyInputRef}
                      type="number"
                      value={stockOpeningQty === 0 ? '' : stockOpeningQty}
                      onChange={(e) => setStockOpeningQty(Number(e.target.value) || 0)}
                      onKeyDown={(e) => handleFieldKeyDown(e, inStockInputRef)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1 font-bold text-slate-900 text-right outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* 10. IN STOCK (Green Label) */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-black text-emerald-600 text-right border-r border-slate-300 uppercase">
                    IN STOCK
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={inStockInputRef}
                      type="number"
                      value={stockInStock === 0 ? '' : stockInStock}
                      onChange={(e) => setStockInStock(Number(e.target.value) || 0)}
                      onKeyDown={(e) => handleFieldKeyDown(e, outQtyInputRef)}
                      placeholder="0"
                      className="w-full bg-white border-2 border-emerald-500 rounded-xs px-2.5 py-1 font-black text-emerald-700 text-right outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {/* 11. OUT QTY (Red Label) */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-black text-rose-600 text-right border-r border-slate-300 uppercase">
                    OUT QTY
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={outQtyInputRef}
                      type="number"
                      value={stockOutQty === 0 ? '' : stockOutQty}
                      onChange={(e) => setStockOutQty(Number(e.target.value) || 0)}
                      onKeyDown={(e) => handleFieldKeyDown(e, unitWeightInputRef)}
                      placeholder="0"
                      className="w-full bg-white border-2 border-rose-400 rounded-xs px-2.5 py-1 font-black text-rose-700 text-right outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-300"
                    />
                  </div>
                </div>

                {/* 12. BALANCE QTY (Subtle Blue Row Background) */}
                <div className="grid grid-cols-12 items-center bg-blue-50/60">
                  <div className="col-span-4 py-1.5 px-3 font-black text-[#143d78] text-right border-r border-slate-300 uppercase">
                    BALANCE QTY
                  </div>
                  <div className="col-span-8 py-1.5 px-3 font-black text-slate-900 text-right text-xs sm:text-[13px]">
                    {balanceQty.toLocaleString()}
                  </div>
                </div>

                {/* 13. TALLY QTY */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    TALLY QTY
                  </div>
                  <div className="col-span-8 py-1.5 px-3 font-bold text-slate-900 text-right">
                    {tallyQty.toLocaleString()}
                  </div>
                </div>

                {/* 14. UNIT WEIGHT */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    UNIT WEIGHT
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={unitWeightInputRef}
                      type="number"
                      step="0.0001"
                      value={stockUnitWeight === 0 ? '' : stockUnitWeight}
                      onChange={(e) => setStockUnitWeight(Number(e.target.value) || 0)}
                      onKeyDown={(e) => handleFieldKeyDown(e, rackInputRef)}
                      placeholder="0.0000"
                      className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1 font-bold text-slate-900 text-right outline-none focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* 15. TOTAL WEIGHT */}
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-4 bg-slate-50/70 py-1.5 px-3 font-bold text-slate-700 text-right border-r border-slate-300 uppercase">
                    TOTAL WEIGHT
                  </div>
                  <div className="col-span-8 py-1.5 px-3 font-bold text-slate-900 text-right">
                    {totalWeightStr}
                  </div>
                </div>

                {/* 16. RACK LOCATION (Highlighted Yellow/Amber Background) */}
                <div className="grid grid-cols-12 items-center bg-amber-50/60">
                  <div className="col-span-4 bg-[#fef3c7] py-1.5 px-3 font-black text-amber-950 text-right border-r border-slate-300 uppercase">
                    RACK LOCATION
                  </div>
                  <div className="col-span-8 py-1 px-2.5">
                    <input
                      ref={rackInputRef}
                      type="text"
                      value={stockRack}
                      onChange={(e) => setStockRack(e.target.value.toUpperCase())}
                      onKeyDown={(e) => handleFieldKeyDown(e, null, true)}
                      placeholder="R-01"
                      className="w-full bg-white border-2 border-[#f5a623] rounded-xs px-2.5 py-1 font-black text-slate-950 text-left outline-none uppercase shadow-2xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Exact matching Image 5) */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xs text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <span>&lt;</span>
                  <span>Change Grade (Esc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddSizePrompt(true);
                    setAddSizeChoice('yes');
                  }}
                  className="px-6 py-2 bg-[#f5a623] hover:bg-[#e09212] text-slate-950 border-2 border-amber-600 rounded-xs text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-102 active:scale-98"
                >
                  <span>✓</span>
                  <span>ACCEPT (Enter)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. CONFIRMATION POPUP MODAL: "Add Size?" (Triggered on Enter after Rack Location) */}
        {showAddSizePrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3">
            <div className="w-full max-w-md bg-white border-2 border-[#143d78] rounded-xs shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
              {/* Header */}
              <div className="bg-[#143d78] px-4 py-2.5 flex items-center justify-between text-white border-b border-[#0e2c56]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 text-sm">✨</span>
                  <span className="font-black text-xs sm:text-[13px] uppercase tracking-wider">
                    CONFIRMATION • ADD SIZE?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSizePrompt(false)}
                  className="text-blue-200 hover:text-white text-sm font-bold cursor-pointer p-0.5"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-3.5 bg-[#f8fbfe]">
                <div className="text-center space-y-1">
                  <div className="text-lg font-black text-slate-900 tracking-tight">
                    Add Size?
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Keep the same layout &amp; grade to enter another size?
                  </p>
                </div>

                {/* Current Size Summary Card */}
                <div className="bg-white border border-blue-200/80 rounded-xs p-3 font-mono text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-slate-600 border-b border-slate-100 pb-1.5">
                    <span>SAVING RECORD #{stockIdx}:</span>
                    <span className="text-[#143d78] font-black">{stockPartNo || `${stockDia}×${stockLength}`}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div><span className="text-slate-400">SIZE:</span> <strong className="text-slate-900">{stockDia || 'M12'} × {stockLength || '40'}</strong></div>
                    <div><span className="text-slate-400">GRADE:</span> <strong className="text-slate-900 truncate block">{selectedGrade}</strong></div>
                    <div><span className="text-slate-400">BALANCE:</span> <strong className="text-emerald-700 font-black">{balanceQty.toLocaleString()} {stockUnit}</strong></div>
                    <div><span className="text-slate-400">RACK:</span> <strong className="text-amber-700 font-black">{stockRack || 'R-01'}</strong></div>
                  </div>
                </div>

                {/* Two Action Buttons: YES and NO */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmAddSize}
                    onMouseEnter={() => setAddSizeChoice('yes')}
                    className={`py-2.5 px-3 rounded-xs font-black text-xs sm:text-[13px] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      addSizeChoice === 'yes'
                        ? 'bg-[#f5a623] text-slate-950 border-2 border-amber-600 ring-2 ring-amber-400/40 scale-102'
                        : 'bg-amber-100/70 hover:bg-[#f5a623] text-amber-950 border border-amber-400/60'
                    }`}
                  >
                    <span>✓ YES (Enter / Y)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmClose}
                    onMouseEnter={() => setAddSizeChoice('no')}
                    className={`py-2.5 px-3 rounded-xs font-bold text-xs sm:text-[13px] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      addSizeChoice === 'no'
                        ? 'bg-slate-800 text-white border-2 border-slate-950 ring-2 ring-slate-400/40 scale-102'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <span>✕ NO (Esc / N)</span>
                  </button>
                </div>

                <div className="text-center text-[10.5px] font-mono text-slate-500 pt-0.5">
                  Use <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">→</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">Tab</kbd> to select • <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">Enter</kbd> to confirm
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
