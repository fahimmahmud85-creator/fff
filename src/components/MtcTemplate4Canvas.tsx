import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Plus, Trash2, ShieldCheck, Check, Upload, RefreshCw, ZoomIn, ZoomOut, Move, 
  FileSpreadsheet, Undo2, Redo2, Copy, Layers, X, Edit2, Sliders, Image as ImageIcon,
  CheckSquare, Square, Download, ChevronRight, HelpCircle
} from 'lucide-react';
import { QcReportRecord, formatNumericVal, incrementCertNo } from './QcReportsComponent';
import { getActiveCompany, getCompanyIsoText } from '../utils/companyProfile';
import { 
  Mtc4SheetData, Mtc4MechRow, Mtc4DimRow, Mtc4CoatingRow, Mtc4HtRow, AdditionalTechInfoLine,
  DEFAULT_MTC4_MECH_ROWS, DEFAULT_MTC4_DIM_ROWS, DEFAULT_MTC4_COATING_ROWS, DEFAULT_MTC4_HT_ROWS,
  DEFAULT_ADDITIONAL_TECH_INFO, DEFAULT_DECLARATION_TEXT, CHEM_ELEMENTS, createDefaultMtc4Sheet
} from './mtc4/mtc4Data';
import { useMtc4Excel } from './mtc4/useMtc4Excel';

// ==========================================
// DRAGGABLE IMAGE COMPONENT
// ==========================================
interface DraggableImageProps {
  src: string;
  alt: string;
  height: number;
  posX: number;
  posY: number;
  onPositionChange: (x: number, y: number) => void;
  className?: string;
  title?: string;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  src,
  alt,
  height,
  posX,
  posY,
  onPositionChange,
  className = '',
  title = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: posX, y: posY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    onPositionChange(Math.round(initialPos.x + dx), Math.round(initialPos.y + dy));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, initialPos]);

  return (
    <img
      src={src}
      alt={alt}
      onMouseDown={handleMouseDown}
      style={{
        height: `${height}px`,
        transform: `translate(${posX}px, ${posY}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      className={`${className} transition-none select-none hover:ring-1 hover:ring-amber-500 rounded`}
      title={title}
    />
  );
};

export interface MtcTemplate4CanvasProps {
  formData: QcReportRecord;
  setFormData: React.Dispatch<React.SetStateAction<QcReportRecord>>;
  isFullscreenEditor: boolean;
  onUploadLogo: (type: 'company' | 'iso' | 'engineer' | 'manager' | 'stamp', file: File) => void;
  onSaveAsset: (key: string, value: any) => void;
  onAddItem?: () => void;
  onRemoveItem?: (id: string, index?: number) => void;
  onOpenExcelModal?: (target: 'items' | 'chemical' | 'mechanical') => void;
  onPoOrInvoiceChange?: (field: 'customerPoNum' | 'invoiceNum' | 'workOrderNum', value: string) => void;
  isSampleCert: (record: Partial<QcReportRecord>) => boolean;
  calculateTotalPages: (record: QcReportRecord) => number;
  formatChemVal: (val?: string | number) => string;
  DEFAULT_ISO_LOGO_URL: string;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const MtcTemplate4Canvas: React.FC<MtcTemplate4CanvasProps> = ({
  formData,
  setFormData,
  isFullscreenEditor,
  onUploadLogo,
  onSaveAsset,
  onAddItem,
  onRemoveItem,
  onOpenExcelModal,
  onPoOrInvoiceChange,
  isSampleCert,
  DEFAULT_ISO_LOGO_URL,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const activeCompany = getActiveCompany();
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [activePageView, setActivePageView] = useState<'both' | 'page1' | 'page2'>('both');
  const [showSignTools, setShowSignTools] = useState(false);

  const sheets: Mtc4SheetData[] = useMemo(() => {
    if ((formData as any).mtc4Sheets && Array.isArray((formData as any).mtc4Sheets) && (formData as any).mtc4Sheets.length > 0) {
      return (formData as any).mtc4Sheets;
    }
    // Fallback: build first sheet from formData root properties
    const defaultSheet = createDefaultMtc4Sheet(1, 'Sheet 1');
    if (formData.customerName) defaultSheet.customerName = formData.customerName;
    if (formData.customerPoNum) defaultSheet.customerPoNum = formData.customerPoNum;
    if (formData.invoiceNum) defaultSheet.invoiceNum = formData.invoiceNum;
    if (formData.workOrderNum) defaultSheet.workOrderNum = formData.workOrderNum;
    if (formData.certNo || formData.issueNo) defaultSheet.certNo = formData.certNo || formData.issueNo;
    if (formData.productDescription !== undefined) defaultSheet.productDescription = formData.productDescription;
    if (formData.specStandard !== undefined) defaultSheet.specStandard = formData.specStandard;
    if (formData.startingMaterial !== undefined) defaultSheet.material = formData.startingMaterial;
    if (formData.chemicalData && formData.chemicalData.length > 0) defaultSheet.chemicalData = formData.chemicalData;
    if (formData.chemSpecMin) defaultSheet.chemSpecMin = formData.chemSpecMin;
    if (formData.chemSpecMax) defaultSheet.chemSpecMax = formData.chemSpecMax;
    if ((formData as any).mtc4MechRows) defaultSheet.mtc4MechRows = (formData as any).mtc4MechRows;
    if ((formData as any).mtc4DimRows) defaultSheet.mtc4DimRows = (formData as any).mtc4DimRows;
    if ((formData as any).mtc4CoatingRows) defaultSheet.mtc4CoatingRows = (formData as any).mtc4CoatingRows;
    if ((formData as any).mtc4HtRows) defaultSheet.mtc4HtRows = (formData as any).mtc4HtRows;
    return [defaultSheet];
  }, [formData]);

  const currentSheetIndex = Math.min(activeSheetIndex, Math.max(0, sheets.length - 1));
  const currentSheet: Mtc4SheetData = sheets[currentSheetIndex] || createDefaultMtc4Sheet(1);

  const isSample = Boolean(
    isSampleCert(formData) ||
    (formData.invoiceNum || '').toUpperCase().includes('SAMPLE') ||
    (formData.workOrderNum || '').toUpperCase().includes('SAMPLE') ||
    (formData.customerPoNum || '').toUpperCase().includes('SAMPLE') ||
    (formData.certNo || '').toUpperCase().includes('SAMPLE') ||
    (currentSheet.invoiceNum || '').toUpperCase().includes('SAMPLE') ||
    (currentSheet.workOrderNum || '').toUpperCase().includes('SAMPLE') ||
    (currentSheet.customerPoNum || '').toUpperCase().includes('SAMPLE') ||
    (currentSheet.certNo || '').toUpperCase().includes('SAMPLE')
  );

  // Update current active sheet state
  const updateCurrentSheet = useCallback((updater: (prev: Mtc4SheetData) => Mtc4SheetData) => {
    setFormData(prev => {
      const currentSheets = (prev as any).mtc4Sheets && Array.isArray((prev as any).mtc4Sheets) && (prev as any).mtc4Sheets.length > 0
        ? [...(prev as any).mtc4Sheets]
        : [createDefaultMtc4Sheet(1)];
      
      const idx = Math.min(activeSheetIndex, Math.max(0, currentSheets.length - 1));
      const updatedSheet = updater(currentSheets[idx] || createDefaultMtc4Sheet(idx + 1));
      currentSheets[idx] = updatedSheet;
      
      return {
        ...prev,
        mtc4Sheets: currentSheets,
        // Also keep root properties in sync for active sheet
        ...(idx === 0 ? {
          customerName: updatedSheet.customerName !== undefined ? updatedSheet.customerName : prev.customerName,
          customerPoNum: updatedSheet.customerPoNum !== undefined ? updatedSheet.customerPoNum : prev.customerPoNum,
          invoiceNum: updatedSheet.invoiceNum !== undefined ? updatedSheet.invoiceNum : prev.invoiceNum,
          workOrderNum: updatedSheet.workOrderNum !== undefined ? updatedSheet.workOrderNum : prev.workOrderNum,
          certNo: updatedSheet.certNo !== undefined ? updatedSheet.certNo : prev.certNo,
          productDescription: updatedSheet.productDescription !== undefined ? updatedSheet.productDescription : prev.productDescription,
          specStandard: updatedSheet.specStandard !== undefined ? updatedSheet.specStandard : prev.specStandard,
          startingMaterial: updatedSheet.material !== undefined ? updatedSheet.material : prev.startingMaterial,
          chemicalData: updatedSheet.chemicalData,
          chemSpecMin: updatedSheet.chemSpecMin,
          chemSpecMax: updatedSheet.chemSpecMax,
          chemHeaderOverrides: updatedSheet.chemHeaderOverrides,
          mtc4MechRows: updatedSheet.mtc4MechRows,
          mtc4DimRows: updatedSheet.mtc4DimRows,
          mtc4CoatingRows: updatedSheet.mtc4CoatingRows,
          mtc4HtRows: updatedSheet.mtc4HtRows,
          showMacroEtch: updatedSheet.showMacroEtch,
          showDimInspection: updatedSheet.showDimInspection,
          showCoating: updatedSheet.showCoating,
          showHeatTreatment: updatedSheet.showHeatTreatment,
          markingImageUrl: updatedSheet.markingImage !== undefined ? updatedSheet.markingImage : prev.markingImageUrl,
        } : {})
      } as any;
    });
  }, [activeSheetIndex, setFormData]);

  // Add new sheet
  const handleAddSheet = () => {
    const newSheetNo = sheets.length + 1;
    const prevCert = sheets[sheets.length - 1]?.certNo || formData.certNo || formData.certificateNum || formData.issueNo || '';
    const newCertNo = incrementCertNo(prevCert, 1);
    const newSheet = createDefaultMtc4Sheet(newSheetNo, `Sheet ${newSheetNo}`);
    newSheet.certNo = newCertNo;
    const nextSheets = [...sheets, newSheet];
    setFormData(prev => ({
      ...prev,
      mtc4Sheets: nextSheets
    } as any));
    setActiveSheetIndex(nextSheets.length - 1);
  };

  // Duplicate sheet
  const handleDuplicateSheet = (idx: number) => {
    const target = sheets[idx];
    if (!target) return;
    const newSheetNo = sheets.length + 1;
    const prevCert = target.certNo || formData.certNo || formData.certificateNum || formData.issueNo || '';
    const newCertNo = incrementCertNo(prevCert, 1);
    const cloned: Mtc4SheetData = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sheet_${Date.now()}`,
      sheetNo: newSheetNo,
      title: `${target.title} (Copy)`,
      certNo: newCertNo
    };
    const nextSheets = [...sheets, cloned];
    setFormData(prev => ({
      ...prev,
      mtc4Sheets: nextSheets
    } as any));
    setActiveSheetIndex(nextSheets.length - 1);
  };

  // Delete sheet
  const handleDeleteSheet = (idx: number) => {
    if (sheets.length <= 1) return;
    const nextSheets = sheets.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sheetNo: i + 1 }));
    setFormData(prev => ({
      ...prev,
      mtc4Sheets: nextSheets
    } as any));
    setActiveSheetIndex(Math.max(0, idx - 1));
  };

  // Active sheet data extractors
  const chemData = currentSheet.chemicalData?.[0] || {} as any;
  const chemMin = currentSheet.chemSpecMin || {};
  const chemMax = currentSheet.chemSpecMax || {};
  const mechRows = currentSheet.mtc4MechRows || DEFAULT_MTC4_MECH_ROWS;
  const dimRows = currentSheet.mtc4DimRows || DEFAULT_MTC4_DIM_ROWS;
  const coatingRows = currentSheet.mtc4CoatingRows || DEFAULT_MTC4_COATING_ROWS;
  const htRows = currentSheet.mtc4HtRows || DEFAULT_MTC4_HT_ROWS;
  const additionalTech = currentSheet.additionalTechInfo || DEFAULT_ADDITIONAL_TECH_INFO;
  const declarationText = currentSheet.declarationText !== undefined ? currentSheet.declarationText : DEFAULT_DECLARATION_TEXT;

  // Excel integration matrices
  const getTableData = useCallback((table: string): string[][] => {
    if (table === 'chem') {
      // Row 0: Min, Row 1: Max, Row 2: Actual
      return [
        CHEM_ELEMENTS.map(c => chemMin[c.k] || ''),
        CHEM_ELEMENTS.map(c => chemMax[c.k] || ''),
        CHEM_ELEMENTS.map(c => chemData[c.k] || '')
      ];
    }
    if (table === 'mech') {
      return mechRows.map(r => [r.testItem, r.testStandard, r.spec, r.results, r.sampling]);
    }
    if (table === 'dim') {
      return dimRows.map(r => [r.testItem, r.spec, r.results, r.sampling, r.remark]);
    }
    if (table === 'coating') {
      return coatingRows.map(r => [r.testItem, r.testSpec, r.standard, r.results, r.sampling, r.pass]);
    }
    if (table === 'ht') {
      return htRows.map(r => [r.testItem, r.results]);
    }
    if (table === 'etch') {
      return [
        [currentSheet.macroEtchSpecSurface || '', currentSheet.macroEtchSpecRandom || '', currentSheet.macroEtchSpecCenter || '', currentSheet.macroEtchSpecTestMethod || ''],
        [currentSheet.macroEtchResultSurface || '', currentSheet.macroEtchResultRandom || '', currentSheet.macroEtchResultCenter || '', currentSheet.macroEtchResultMethod || '']
      ];
    }
    return [];
  }, [chemMin, chemMax, chemData, mechRows, dimRows, coatingRows, htRows, currentSheet]);

  const setTableData = useCallback((table: string, matrix: string[][]) => {
    updateCurrentSheet(sheet => {
      const updated = { ...sheet };
      if (table === 'chem') {
        const nextMin: Record<string, string> = { ...(updated.chemSpecMin || {}) };
        const nextMax: Record<string, string> = { ...(updated.chemSpecMax || {}) };
        const nextChem: Record<string, any> = { ...(updated.chemicalData?.[0] || {}) };
        
        CHEM_ELEMENTS.forEach((c, idx) => {
          if (matrix[0]?.[idx] !== undefined) nextMin[c.k] = matrix[0][idx];
          if (matrix[1]?.[idx] !== undefined) nextMax[c.k] = matrix[1][idx];
          if (matrix[2]?.[idx] !== undefined) nextChem[c.k] = matrix[2][idx];
        });
        updated.chemSpecMin = nextMin;
        updated.chemSpecMax = nextMax;
        updated.chemicalData = [nextChem as any];
      } else if (table === 'mech') {
        updated.mtc4MechRows = matrix.map((row, i) => ({
          testItem: row[0] ?? (updated.mtc4MechRows?.[i]?.testItem || ''),
          testStandard: row[1] ?? (updated.mtc4MechRows?.[i]?.testStandard || 'ASTM F606'),
          spec: row[2] ?? (updated.mtc4MechRows?.[i]?.spec || ''),
          results: row[3] ?? (updated.mtc4MechRows?.[i]?.results || ''),
          sampling: row[4] ?? (updated.mtc4MechRows?.[i]?.sampling || '1')
        }));
      } else if (table === 'dim') {
        updated.mtc4DimRows = matrix.map((row, i) => ({
          testItem: row[0] ?? (updated.mtc4DimRows?.[i]?.testItem || ''),
          spec: row[1] ?? (updated.mtc4DimRows?.[i]?.spec || ''),
          results: row[2] ?? (updated.mtc4DimRows?.[i]?.results || ''),
          sampling: row[3] ?? (updated.mtc4DimRows?.[i]?.sampling || '11'),
          remark: row[4] ?? (updated.mtc4DimRows?.[i]?.remark || 'OK')
        }));
      } else if (table === 'coating') {
        updated.mtc4CoatingRows = matrix.map((row, i) => ({
          testItem: row[0] ?? (updated.mtc4CoatingRows?.[i]?.testItem || ''),
          testSpec: row[1] ?? (updated.mtc4CoatingRows?.[i]?.testSpec || ''),
          standard: row[2] ?? (updated.mtc4CoatingRows?.[i]?.standard || ''),
          results: row[3] ?? (updated.mtc4CoatingRows?.[i]?.results || ''),
          sampling: row[4] ?? (updated.mtc4CoatingRows?.[i]?.sampling || ''),
          pass: row[5] ?? (updated.mtc4CoatingRows?.[i]?.pass || 'OK')
        }));
      } else if (table === 'ht') {
        updated.mtc4HtRows = matrix.map((row, i) => ({
          testItem: row[0] ?? (updated.mtc4HtRows?.[i]?.testItem || ''),
          results: row[1] ?? (updated.mtc4HtRows?.[i]?.results || '')
        }));
      } else if (table === 'etch') {
        if (matrix[0]) {
          updated.macroEtchSpecSurface = matrix[0][0];
          updated.macroEtchSpecRandom = matrix[0][1];
          updated.macroEtchSpecCenter = matrix[0][2];
          updated.macroEtchSpecTestMethod = matrix[0][3];
        }
        if (matrix[1]) {
          updated.macroEtchResultSurface = matrix[1][0];
          updated.macroEtchResultRandom = matrix[1][1];
          updated.macroEtchResultCenter = matrix[1][2];
          updated.macroEtchResultMethod = matrix[1][3];
        }
      }
      return updated;
    });
  }, [updateCurrentSheet]);

  const {
    activeCell,
    selectedRange,
    isCellSelected,
    selectCell,
    handleKeyDown,
    handlePaste
  } = useMtc4Excel(getTableData, setTableData);

  // Additional technical information handlers
  const toggleTechLine = (id: string) => {
    updateCurrentSheet(s => ({
      ...s,
      additionalTechInfo: (s.additionalTechInfo || DEFAULT_ADDITIONAL_TECH_INFO).map(t => 
        t.id === id ? { ...t, checked: !t.checked } : t
      )
    }));
  };

  const updateTechLine = (id: string, field: 'title' | 'value', text: string) => {
    updateCurrentSheet(s => ({
      ...s,
      additionalTechInfo: (s.additionalTechInfo || DEFAULT_ADDITIONAL_TECH_INFO).map(t => 
        t.id === id ? { ...t, [field]: text } : t
      )
    }));
  };

  const addTechLine = () => {
    const newLine: AdditionalTechInfoLine = {
      id: `tech_${Date.now()}`,
      checked: true,
      title: 'Custom Inspection',
      value: 'Found satisfactory as per standard requirements.'
    };
    updateCurrentSheet(s => ({
      ...s,
      additionalTechInfo: [...(s.additionalTechInfo || DEFAULT_ADDITIONAL_TECH_INFO), newLine]
    }));
  };

  const removeTechLine = (id: string) => {
    updateCurrentSheet(s => ({
      ...s,
      additionalTechInfo: (s.additionalTechInfo || DEFAULT_ADDITIONAL_TECH_INFO).filter(t => t.id !== id)
    }));
  };

  return (
    <div className="w-full space-y-3 pb-8">
      {/* ========================================== */}
      {/* 1. MTC 4 HEADER TOOLBAR (MULTI-SHEET TABS) */}
      {/* ========================================== */}
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
        {/* LEFT: SHEET TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <div className="flex items-center gap-1 font-bold text-slate-300 pr-2 border-r border-slate-700">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Sheets:</span>
          </div>
          {sheets.map((sh, idx) => (
            <div 
              key={sh.id || idx}
              onClick={() => setActiveSheetIndex(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer transition-all ${
                idx === currentSheetIndex 
                  ? 'bg-amber-600 text-white font-bold shadow-xs' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{sh.title || `Sheet ${idx + 1}`}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateSheet(idx);
                }}
                className="opacity-60 hover:opacity-100 hover:text-amber-200"
                title="Duplicate Sheet"
              >
                <Copy className="w-3 h-3" />
              </button>
              {sheets.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSheet(idx);
                  }}
                  className="opacity-60 hover:opacity-100 hover:text-rose-300"
                  title="Delete Sheet"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSheet}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded font-bold flex items-center gap-1 cursor-pointer border border-dashed border-slate-600"
            title="Add New Sheet (2-Page MTC Spec)"
          >
            <Plus className="w-3 h-3" />
            <span>Add Sheet</span>
          </button>
        </div>

        {/* RIGHT: VIEW TOGGLE & SECTION CHECKBOXES */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Checkboxes for Sections */}
          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded text-[11px] border border-slate-700 text-slate-200">
            <span className="text-[10px] text-amber-400 font-bold uppercase mr-1">Include in Print:</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={currentSheet.showMacroEtch !== false}
                onChange={(e) => updateCurrentSheet(s => ({ ...s, showMacroEtch: e.target.checked }))}
                className="w-3 h-3 text-amber-500 rounded cursor-pointer accent-amber-500"
              />
              <span>Macro Etch</span>
            </label>
            <span className="text-slate-600">|</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={currentSheet.showDimInspection !== false}
                onChange={(e) => updateCurrentSheet(s => ({ ...s, showDimInspection: e.target.checked }))}
                className="w-3 h-3 text-amber-500 rounded cursor-pointer accent-amber-500"
              />
              <span>Dimensions</span>
            </label>
            <span className="text-slate-600">|</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={currentSheet.showCoating !== false}
                onChange={(e) => updateCurrentSheet(s => ({ ...s, showCoating: e.target.checked }))}
                className="w-3 h-3 text-amber-500 rounded cursor-pointer accent-amber-500"
              />
              <span>Coating</span>
            </label>
            <span className="text-slate-600">|</span>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
              <input
                type="checkbox"
                checked={currentSheet.showHeatTreatment !== false}
                onChange={(e) => updateCurrentSheet(s => ({ ...s, showHeatTreatment: e.target.checked }))}
                className="w-3 h-3 text-amber-500 rounded cursor-pointer accent-amber-500"
              />
              <span>Heat Treatment</span>
            </label>
          </div>

          <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setActivePageView('both')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${activePageView === 'both' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              Both Pages
            </button>
            <button
              type="button"
              onClick={() => setActivePageView('page1')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${activePageView === 'page1' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              Page 1
            </button>
            <button
              type="button"
              onClick={() => setActivePageView('page2')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${activePageView === 'page2' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              Page 2
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. PAGE 1: CHEMICAL, MECHANICAL, MACRO, DIMENSIONS, COATING */}
      {/* ========================================== */}
      {(activePageView === 'both' || activePageView === 'page1') && (
        <div 
          className="cert-page w-full border-2 border-black p-3.5 space-y-2 bg-white text-black font-serif transition-all relative shadow-none"
          style={{ fontFamily: '"Times New Roman", Times, serif', boxSizing: 'border-box' }}
        >
          {isSample && (
            <div className="watermark-sample absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
              <div 
                className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-6 py-2 transform -rotate-[30deg] text-[36px] sm:text-[48px] leading-none"
                style={{
                  fontFamily: "'Arial Black', Arial, Impact, sans-serif",
                  letterSpacing: '0.14em',
                  color: 'rgba(100, 116, 139, 0.18)',
                  borderColor: 'rgba(100, 116, 139, 0.22)',
                }}
              >
                SAMPLE MTC
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {/* 1. TOP HEADER (EDITABLE - MATCHING STANDARD MTC HEADER) */}
            <div className="border-b-2 border-black pb-1.5 flex items-stretch justify-between gap-1 font-sans">
              {/* LEFT: COMPANY LOGO & DETAILS */}
              <div className="w-[45%] flex items-start gap-2">
                <div className="relative group shrink-0 flex flex-col items-center">
                  {formData.companyLogoUrl ? (
                    <div className="relative">
                      <img
                        src={formData.companyLogoUrl}
                        alt="Company Logo"
                        className="h-10 sm:h-12 max-w-[120px] object-contain border border-slate-200 rounded p-0.5 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, companyLogoUrl: undefined }));
                          onSaveAsset('companyLogoUrl', undefined);
                        }}
                        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer shadow-xs"
                        title="Remove Company Logo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <label 
                      className="p-1 px-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded cursor-pointer transition-all flex items-center gap-1 text-[9px] font-bold print:hidden"
                      title="Upload Company Logo"
                    >
                      <Upload className="w-3 h-3 text-amber-700" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('company', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center font-sans">
                  <input
                    type="text"
                    value={formData.companyName ?? (activeCompany?.name || 'COMPANY NAME')}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="font-black text-[11px] sm:text-[12px] uppercase leading-tight text-slate-950 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                    placeholder="Company Name"
                    title="Click to edit Company Name"
                  />
                  <input
                    type="text"
                    value={formData.companyTagline ?? (activeCompany?.subtitle || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyTagline: e.target.value }))}
                    className="font-black text-[8.5px] uppercase leading-tight text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5 mt-0.5"
                    placeholder="Tagline"
                    title="Click to edit Tagline"
                  />
                  <input
                    type="text"
                    value={formData.companyAddress ?? (activeCompany?.address || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="text-[7.5px] sm:text-[8px] font-medium text-slate-800 leading-tight mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                    placeholder="Address & Tel"
                    title="Click to edit Address"
                  />
                  <input
                    type="text"
                    value={formData.companyContact ?? ((activeCompany?.email ? activeCompany.email + ' | ' + (activeCompany.website || '') : ''))}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyContact: e.target.value }))}
                    className="text-[7.5px] sm:text-[8px] font-semibold text-slate-900 mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                    placeholder="Email & Website"
                    title="Click to edit Contact Info"
                  />
                </div>
              </div>

              {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only for Marine Fasteners or companies with ISO enabled) */}
              <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0 font-sans">
                {getCompanyIsoText() ? (
                  <div className="relative group flex flex-col items-center">
                    <label className="cursor-pointer" title="Click to Upload Custom ISO Logo">
                      <img
                        src={formData.isoLogoUrl || DEFAULT_ISO_LOGO_URL}
                        alt="ISO Certification Logos"
                        className="h-9 sm:h-10 max-w-[240px] sm:max-w-[280px] object-contain transition-all hover:opacity-90 cursor-pointer"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[7.5px] sm:text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none font-sans">
                      <span>ISO 9001:2015</span>
                      <span className="text-slate-400">•</span>
                      <span>ISO 14001:2015</span>
                      <span className="text-slate-400">•</span>
                      <span>ISO 45001:2018</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 print:hidden bg-slate-50 px-2 py-0.5 rounded shadow-2xs border border-slate-300 z-10">
                      <label className="cursor-pointer text-[8px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload ISO</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {formData.isoLogoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, isoLogoUrl: undefined }));
                            onSaveAsset('isoLogoUrl', undefined);
                          }}
                          className="text-rose-600 hover:text-rose-800 text-[8px] font-bold ml-1 border-l pl-1 border-slate-200"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-9" />
                )}
              </div>

              {/* RIGHT: CERTIFICATE TITLE & PAGE NUMBER */}
              <div className="text-right shrink-0 font-sans flex flex-col justify-center items-end">
                <input
                  type="text"
                  value={formData.certTitle ?? 'MATERIAL TEST CERTIFICATE'}
                  onChange={(e) => setFormData(prev => ({ ...prev, certTitle: e.target.value }))}
                  className="font-black text-[12px] sm:text-[13px] uppercase tracking-tight text-black underline leading-none mb-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5"
                  placeholder="Certificate Title"
                  title="Click to edit Certificate Title"
                />
                <input
                  type="text"
                  value={formData.certStandard ?? 'CERTIFIED TO BS EN 10204, 3.1'}
                  onChange={(e) => setFormData(prev => ({ ...prev, certStandard: e.target.value }))}
                  className="font-bold text-[8px] sm:text-[8.5px] uppercase tracking-tight text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5 w-full"
                  placeholder="Standard Subtitle"
                  title="Click to edit Certified Standard"
                />
                <div className="font-bold text-[8.5px] sm:text-[9px] uppercase tracking-tight text-black mt-0.5 flex items-center justify-end gap-1">
                  <span>PAGE NO :</span>
                  <input
                    type="text"
                    value={formData.pageNo || `1 OF 2`}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageNo: e.target.value }))}
                    className="w-14 p-0.5 bg-amber-50/50 border border-amber-400 rounded text-center font-black text-[8.5px] text-amber-950 uppercase"
                    title="Edit Page Number"
                  />
                </div>
              </div>
            </div>

            {/* 2. METADATA 5-ROW TABLE */}
            <div className="border border-black bg-white text-[9.5px] font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              {/* ROW 1: CUSTOMER & CERTIFICATE NO */}
              <div className="flex border-b border-black">
                <div className="w-[65%] border-r border-black p-1 flex items-center gap-1.5">
                  <span className="font-bold text-black whitespace-nowrap text-[9.5px]">Customer :</span>
                  <input
                    type="text"
                    value={currentSheet.customerName !== undefined ? currentSheet.customerName : (formData.customerName || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, customerName: val }));
                      setFormData(prev => ({ ...prev, customerName: val }));
                    }}
                    className="w-full bg-transparent font-normal text-[9.5px] text-black border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Enter Customer Name"
                  />
                </div>
                <div className="w-[35%] p-1 flex items-center gap-1.5">
                  <span className="font-bold text-black whitespace-nowrap text-[9.5px]">Certificate No:</span>
                  <input
                    type="text"
                    value={currentSheet.certNo !== undefined ? currentSheet.certNo : (formData.certNo || formData.issueNo || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, certNo: val }));
                      setFormData(prev => ({ ...prev, certNo: val }));
                    }}
                    className="w-full bg-transparent font-bold text-amber-950 text-[9.5px] border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Certificate Number"
                  />
                </div>
              </div>

              {/* ROW 2: PO NO, INVOICE NO, WORK ORDER NO, PART NO */}
              <div className="flex border-b border-black">
                <div className="w-1/4 border-r border-black p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">PO No:</span>
                  <input
                    type="text"
                    value={currentSheet.customerPoNum !== undefined ? currentSheet.customerPoNum : (formData.customerPoNum || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, customerPoNum: val }));
                      if (onPoOrInvoiceChange) onPoOrInvoiceChange('customerPoNum', val);
                      else setFormData(prev => ({ ...prev, customerPoNum: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="PO Number"
                  />
                </div>
                <div className="w-1/4 border-r border-black p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Invoice No:</span>
                  <input
                    type="text"
                    value={currentSheet.invoiceNum !== undefined ? currentSheet.invoiceNum : (formData.invoiceNum || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, invoiceNum: val }));
                      if (onPoOrInvoiceChange) onPoOrInvoiceChange('invoiceNum', val);
                      else setFormData(prev => ({ ...prev, invoiceNum: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Invoice Number"
                  />
                </div>
                <div className="w-1/4 border-r border-black p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Work Order No:</span>
                  <input
                    type="text"
                    value={currentSheet.workOrderNum !== undefined ? currentSheet.workOrderNum : (formData.workOrderNum || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, workOrderNum: val }));
                      if (onPoOrInvoiceChange) onPoOrInvoiceChange('workOrderNum', val);
                      else setFormData(prev => ({ ...prev, workOrderNum: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Work Order No"
                  />
                </div>
                <div className="w-1/4 p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Part No:</span>
                  <input
                    type="text"
                    value={currentSheet.partNo !== undefined ? currentSheet.partNo : '—'}
                    onChange={(e) => updateCurrentSheet(s => ({ ...s, partNo: e.target.value }))}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Part No"
                  />
                </div>
              </div>

              {/* ROW 3: PRODUCT DESCRIPTION & QUANTITY */}
              <div className="flex border-b border-black">
                <div className="w-[65%] border-r border-black p-1 flex items-center gap-1.5">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Product Description:</span>
                  <input
                    type="text"
                    value={currentSheet.productDescription !== undefined ? currentSheet.productDescription : (formData.productDescription || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, productDescription: val }));
                      setFormData(prev => ({ ...prev, productDescription: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Product Description"
                  />
                </div>
                <div className="w-[35%] p-1 flex items-center gap-1.5">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Quantity:</span>
                  <input
                    type="text"
                    value={currentSheet.qty !== undefined ? currentSheet.qty : (formData.quantity || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, qty: val }));
                      setFormData(prev => ({ ...prev, quantity: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-bold border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Quantity"
                  />
                </div>
              </div>

              {/* ROW 4: HEAT NO, LOT NO, SPECIFICATION & YEAR/REV */}
              <div className="flex border-b border-black">
                <div className="w-[25%] border-r border-black p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Heat No:</span>
                  <input
                    type="text"
                    value={currentSheet.heatNo !== undefined ? currentSheet.heatNo : (chemData.heatNo || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, heatNo: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-bold text-amber-950 border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Heat Number"
                  />
                </div>
                <div className="w-[20%] border-r border-black p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Lot No:</span>
                  <input
                    type="text"
                    value={currentSheet.lotNo !== undefined ? currentSheet.lotNo : '1'}
                    onChange={(e) => updateCurrentSheet(s => ({ ...s, lotNo: e.target.value }))}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Lot No"
                  />
                </div>
                <div className="w-[35%] border-r border-black p-1 flex items-center gap-1.5">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Specification:</span>
                  <input
                    type="text"
                    value={currentSheet.specStandard !== undefined ? currentSheet.specStandard : (formData.specStandard || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, specStandard: val }));
                      setFormData(prev => ({ ...prev, specStandard: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Specification Standard"
                  />
                </div>
                <div className="w-[20%] p-1 flex items-center gap-1.5">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Year and Revision of:</span>
                  <input
                    type="text"
                    value={currentSheet.yearRevision !== undefined ? currentSheet.yearRevision : '2023'}
                    onChange={(e) => updateCurrentSheet(s => ({ ...s, yearRevision: e.target.value }))}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Year / Revision"
                  />
                </div>
              </div>

              {/* ROW 5: MATERIAL, MARKING (WITH UPLOAD), FINISH */}
              <div className="flex">
                <div className="w-1/3 border-r border-black p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Material:</span>
                  <input
                    type="text"
                    value={currentSheet.material !== undefined ? currentSheet.material : (formData.startingMaterial || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, material: val }));
                      setFormData(prev => ({ ...prev, startingMaterial: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Material"
                  />
                </div>
                
                {/* MARKING WITH IMAGE UPLOAD (UPLOAD/IMAGE LEFT, TEXT RIGHT) */}
                <div className="w-1/3 border-r border-black p-1 flex items-center justify-start gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Marking:</span>

                  {/* Left side: Upload or Image */}
                  <div className="flex items-center gap-1 shrink-0">
                    {(currentSheet.markingImage || formData.markingImageUrl) ? (
                      <div className="relative group flex items-center">
                        <img 
                          src={currentSheet.markingImage || formData.markingImageUrl} 
                          alt="Marking" 
                          className="h-4 max-w-[32px] object-contain border border-slate-300 rounded bg-white p-0.5" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateCurrentSheet(s => ({ ...s, markingImage: undefined }));
                            setFormData(prev => ({ ...prev, markingImageUrl: undefined }));
                            onSaveAsset('markingImageUrl', undefined);
                          }}
                          className="text-rose-600 hover:text-rose-800 p-0.5 opacity-0 group-hover:opacity-100 print:hidden text-[10px]"
                          title="Remove Marking Image"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label 
                        className="text-amber-600 hover:text-amber-800 cursor-pointer p-0.5 rounded hover:bg-amber-50 print:hidden transition-colors inline-flex items-center gap-0.5 text-[9.5px] font-bold"
                        title="Upload marking image/logo"
                      >
                        <Upload className="w-2.5 h-2.5 text-amber-600" />
                        <span>Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = reader.result as string;
                              updateCurrentSheet(s => ({ ...s, markingImage: dataUrl }));
                              setFormData(prev => ({ ...prev, markingImageUrl: dataUrl }));
                              onSaveAsset('markingImageUrl', dataUrl);
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>

                  {/* Right side: Marking Text Input */}
                  <input
                    type="text"
                    value={currentSheet.marking !== undefined ? currentSheet.marking : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, marking: val }));
                    }}
                    className="flex-1 min-w-0 bg-transparent text-[9.5px] font-bold border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Marking"
                  />
                </div>

                <div className="w-1/3 p-1 flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap text-[9.5px]">Finish:</span>
                  <input
                    type="text"
                    value={currentSheet.finish !== undefined ? currentSheet.finish : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentSheet(s => ({ ...s, finish: val }));
                    }}
                    className="w-full bg-transparent text-[9.5px] font-normal border-b border-transparent focus:border-amber-500 focus:bg-white px-0.5"
                    placeholder="Finish"
                  />
                </div>
              </div>
            </div>

            {/* 3. TABLE 1: CHEMICAL ANALYSIS (EXCEL INTEGRATED) */}
            <div className="border border-black bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100 flex items-center justify-between">
                <span>Chemical Analysis (Weight %)</span>
                <span className="text-[9px] font-normal text-slate-500 print:hidden font-sans">
                  (Shift+Arrows = Range select • Delete = Clear cells • Ctrl+D = Fill down • Ctrl+C/V = Copy/Paste)
                </span>
              </div>
              <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-serif">
                <thead>
                  <tr className="bg-white border-b border-black font-bold">
                    <th className="border-r border-black p-0.5 w-[14%] text-left pl-1">Element</th>
                    {CHEM_ELEMENTS.map(c => {
                      const customLabel = currentSheet.chemHeaderOverrides?.[c.k] || c.label;
                      return (
                        <th key={c.k} className="border-r border-black p-0 last:border-r-0">
                          <input
                            type="text"
                            value={customLabel}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentSheet(s => ({
                                ...s,
                                chemHeaderOverrides: { ...(s.chemHeaderOverrides || {}), [c.k]: val }
                              }));
                            }}
                            className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px] font-bold"
                            title={`Edit ${c.label} label`}
                          />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* SPEC MIN ROW */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black p-0.5 font-bold text-left pl-1 bg-slate-50">Spec. Min.</td>
                    {CHEM_ELEMENTS.map((c, colIdx) => {
                      const isSel = isCellSelected('chem', 0, colIdx);
                      return (
                        <td key={c.k} className={`border-r border-black p-0 last:border-r-0 relative ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                          <input
                            type="text"
                            data-cell={`chem_0_${colIdx}`}
                            value={chemMin[c.k] !== undefined ? chemMin[c.k] : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentSheet(s => ({ ...s, chemSpecMin: { ...(s.chemSpecMin || {}), [c.k]: val } }));
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) selectCell('chem', 0, colIdx, true);
                            }}
                            onFocus={(e) => {
                              e.currentTarget.select();
                              selectCell('chem', 0, colIdx);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, 'chem', 0, colIdx, 3, CHEM_ELEMENTS.length)}
                            onPaste={(e) => handlePaste(e, 'chem', 0, colIdx)}
                            className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px]"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* SPEC MAX ROW */}
                  <tr className="border-b border-black">
                    <td className="border-r border-black p-0.5 font-bold text-left pl-1 bg-slate-50">Spec. Max.</td>
                    {CHEM_ELEMENTS.map((c, colIdx) => {
                      const isSel = isCellSelected('chem', 1, colIdx);
                      return (
                        <td key={c.k} className={`border-r border-black p-0 last:border-r-0 relative ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                          <input
                            type="text"
                            data-cell={`chem_1_${colIdx}`}
                            value={chemMax[c.k] !== undefined ? chemMax[c.k] : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentSheet(s => ({ ...s, chemSpecMax: { ...(s.chemSpecMax || {}), [c.k]: val } }));
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) selectCell('chem', 1, colIdx, true);
                            }}
                            onFocus={(e) => {
                              e.currentTarget.select();
                              selectCell('chem', 1, colIdx);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, 'chem', 1, colIdx, 3, CHEM_ELEMENTS.length)}
                            onPaste={(e) => handlePaste(e, 'chem', 1, colIdx)}
                            className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px]"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* ACTUAL % ROW */}
                  <tr>
                    <td className="border-r border-black p-0.5 font-bold text-left pl-1 bg-slate-50">% Actual</td>
                    {CHEM_ELEMENTS.map((c, colIdx) => {
                      const isSel = isCellSelected('chem', 2, colIdx);
                      return (
                        <td key={c.k} className={`border-r border-black p-0 last:border-r-0 relative font-bold ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                          <input
                            type="text"
                            data-cell={`chem_2_${colIdx}`}
                            value={chemData[c.k] !== undefined ? chemData[c.k] : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentSheet(s => ({
                                ...s,
                                chemicalData: [{ ...(s.chemicalData?.[0] || {}), [c.k]: val }]
                              }));
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) selectCell('chem', 2, colIdx, true);
                            }}
                            onFocus={(e) => {
                              e.currentTarget.select();
                              selectCell('chem', 2, colIdx);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, 'chem', 2, colIdx, 3, CHEM_ELEMENTS.length)}
                            onPaste={(e) => handlePaste(e, 'chem', 2, colIdx)}
                            className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px] font-bold"
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. TABLE 2: MECHANICAL PROPERTIES (EXCEL INTEGRATED) */}
            <div className="border border-black bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100 flex items-center justify-between">
                <span>Mechanical Properties</span>
                <div className="flex items-center gap-1 print:hidden font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrentSheet(s => ({
                        ...s,
                        mtc4MechRows: [...(s.mtc4MechRows || DEFAULT_MTC4_MECH_ROWS), { testItem: 'New Test Item', testStandard: 'ASTM F606', spec: '—', results: '—', sampling: '1' }]
                      }));
                    }}
                    className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer font-sans"
                  >
                    <Plus className="w-3 h-3 text-amber-600" />
                    <span>Row</span>
                  </button>
                </div>
              </div>
              <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-serif">
                <thead>
                  <tr className="bg-white border-b border-black font-bold">
                    <th className="border-r border-black p-0.5 w-[30%] text-left pl-1">Test Item</th>
                    <th className="border-r border-black p-0.5 w-[20%]">Test Standard</th>
                    <th className="border-r border-black p-0.5 w-[20%]">Spec.</th>
                    <th className="border-r border-black p-0.5 w-[18%]">Results</th>
                    <th className="p-0.5 w-[12%]">Sampling</th>
                  </tr>
                </thead>
                <tbody>
                  {mechRows.map((r, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-black last:border-b-0">
                      {[r.testItem, r.testStandard, r.spec, r.results, r.sampling].map((val, colIdx) => {
                        const isSel = isCellSelected('mech', rowIdx, colIdx);
                        const isLeft = colIdx === 0;
                        const isBold = colIdx === 3;
                        return (
                          <td key={colIdx} className={`border-r border-black p-0 last:border-r-0 relative ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                            <input
                              type="text"
                              data-cell={`mech_${rowIdx}_${colIdx}`}
                              value={val || ''}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                updateCurrentSheet(s => {
                                  const next = [...(s.mtc4MechRows || DEFAULT_MTC4_MECH_ROWS)];
                                  const item = { ...next[rowIdx] };
                                  if (colIdx === 0) item.testItem = newVal;
                                  if (colIdx === 1) item.testStandard = newVal;
                                  if (colIdx === 2) item.spec = newVal;
                                  if (colIdx === 3) item.results = newVal;
                                  if (colIdx === 4) item.sampling = newVal;
                                  next[rowIdx] = item;
                                  return { ...s, mtc4MechRows: next };
                                });
                              }}
                              onClick={(e) => {
                                if (e.shiftKey) selectCell('mech', rowIdx, colIdx, true);
                              }}
                              onFocus={() => selectCell('mech', rowIdx, colIdx)}
                              onKeyDown={(e) => handleKeyDown(e, 'mech', rowIdx, colIdx, mechRows.length, 5)}
                              onPaste={(e) => handlePaste(e, 'mech', rowIdx, colIdx)}
                              className={`w-full p-0.5 bg-transparent border-0 outline-none text-[9.5px] ${isLeft ? 'text-left pl-1 font-normal' : 'text-center'} ${isBold ? 'font-bold' : ''}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. TABLE 3: MACRO ETCH (EXCEL INTEGRATED) */}
            {(currentSheet.showMacroEtch !== false) && (
              <div className="border border-black bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                  Macro Etch
                </div>
                <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-serif">
                  <thead>
                    <tr className="bg-white border-b border-black font-bold">
                      <th className="border-r border-black p-0.5 w-[15%] text-left pl-1">Division</th>
                      <th className="border-r border-black p-0.5 w-[20%]">Surface Condition</th>
                      <th className="border-r border-black p-0.5 w-[20%]">Random Condition</th>
                      <th className="border-r border-black p-0.5 w-[20%]">Center Segregation</th>
                      <th className="p-0.5 w-[25%]">Spec. of test method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* SPEC ROW */}
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-0.5 font-bold text-left pl-1 bg-slate-50">Spec.</td>
                      {[
                        { v: currentSheet.macroEtchSpecSurface ?? 'S2', k: 'macroEtchSpecSurface' },
                        { v: currentSheet.macroEtchSpecRandom ?? 'R2', k: 'macroEtchSpecRandom' },
                        { v: currentSheet.macroEtchSpecCenter ?? 'C3', k: 'macroEtchSpecCenter' },
                        { v: currentSheet.macroEtchSpecTestMethod ?? 'ASTM A962/A962M-19', k: 'macroEtchSpecTestMethod' },
                      ].map((item, colIdx) => {
                        const isSel = isCellSelected('etch', 0, colIdx);
                        return (
                          <td key={colIdx} className={`border-r border-black p-0 last:border-r-0 relative ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                            <input
                              type="text"
                              data-cell={`etch_0_${colIdx}`}
                              value={item.v}
                              onChange={(e) => updateCurrentSheet(s => ({ ...s, [item.k]: e.target.value }))}
                              onClick={(e) => {
                                if (e.shiftKey) selectCell('etch', 0, colIdx, true);
                              }}
                              onFocus={() => selectCell('etch', 0, colIdx)}
                              onKeyDown={(e) => handleKeyDown(e, 'etch', 0, colIdx, 2, 4)}
                              onPaste={(e) => handlePaste(e, 'etch', 0, colIdx)}
                              className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px]"
                            />
                          </td>
                        );
                      })}
                    </tr>

                    {/* RESULTS ROW */}
                    <tr>
                      <td className="border-r border-black p-0.5 font-bold text-left pl-1 bg-slate-50">Results</td>
                      {[
                        { v: currentSheet.macroEtchResultSurface ?? 'S2', k: 'macroEtchResultSurface' },
                        { v: currentSheet.macroEtchResultRandom ?? 'R2', k: 'macroEtchResultRandom' },
                        { v: currentSheet.macroEtchResultCenter ?? 'C3', k: 'macroEtchResultCenter' },
                        { v: currentSheet.macroEtchResultMethod ?? 'OK', k: 'macroEtchResultMethod' },
                      ].map((item, colIdx) => {
                        const isSel = isCellSelected('etch', 1, colIdx);
                        return (
                          <td key={colIdx} className={`border-r border-black p-0 last:border-r-0 relative font-bold ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                            <input
                              type="text"
                              data-cell={`etch_1_${colIdx}`}
                              value={item.v}
                              onChange={(e) => updateCurrentSheet(s => ({ ...s, [item.k]: e.target.value }))}
                              onClick={(e) => {
                                if (e.shiftKey) selectCell('etch', 1, colIdx, true);
                              }}
                              onFocus={() => selectCell('etch', 1, colIdx)}
                              onKeyDown={(e) => handleKeyDown(e, 'etch', 1, colIdx, 2, 4)}
                              onPaste={(e) => handlePaste(e, 'etch', 1, colIdx)}
                              className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px] font-bold"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. TABLE 4: DIMENSIONS OF SPEC (EXCEL INTEGRATED) */}
            {(currentSheet.showDimInspection !== false) && (
              <div className="border border-black bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100 flex items-center justify-between">
                  <span>Dimensions of Spec</span>
                  <div className="flex items-center gap-1 print:hidden font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentSheet(s => ({
                          ...s,
                          mtc4DimRows: [...(s.mtc4DimRows || DEFAULT_MTC4_DIM_ROWS), { testItem: 'New Dimension Param', spec: '—', results: 'OK', sampling: '11', remark: 'OK' }]
                        }));
                      }}
                      className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer font-sans"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>Row</span>
                    </button>
                  </div>
                </div>
                <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-serif">
                  <thead>
                    <tr className="bg-white border-b border-black font-bold">
                      <th className="border-r border-black p-0.5 w-[30%] text-left pl-1">Test Item</th>
                      <th className="border-r border-black p-0.5 w-[25%]">Spec.</th>
                      <th className="border-r border-black p-0.5 w-[25%]">Inspection Results</th>
                      <th className="border-r border-black p-0.5 w-[10%]">Sampling</th>
                      <th className="p-0.5 w-[10%]">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimRows.map((r, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-black last:border-b-0">
                        {[r.testItem, r.spec, r.results, r.sampling, r.remark].map((val, colIdx) => {
                          const isSel = isCellSelected('dim', rowIdx, colIdx);
                          const isLeft = colIdx === 0;
                          const isBold = colIdx === 2 || colIdx === 4;
                          return (
                            <td key={colIdx} className={`border-r border-black p-0 last:border-r-0 relative ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                              <input
                                type="text"
                                data-cell={`dim_${rowIdx}_${colIdx}`}
                                value={val || ''}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  updateCurrentSheet(s => {
                                    const next = [...(s.mtc4DimRows || DEFAULT_MTC4_DIM_ROWS)];
                                    const item = { ...next[rowIdx] };
                                    if (colIdx === 0) item.testItem = newVal;
                                    if (colIdx === 1) item.spec = newVal;
                                    if (colIdx === 2) item.results = newVal;
                                    if (colIdx === 3) item.sampling = newVal;
                                    if (colIdx === 4) item.remark = newVal;
                                    next[rowIdx] = item;
                                    return { ...s, mtc4DimRows: next };
                                  });
                                }}
                                onClick={(e) => {
                                  if (e.shiftKey) selectCell('dim', rowIdx, colIdx, true);
                                }}
                                onFocus={() => selectCell('dim', rowIdx, colIdx)}
                                onKeyDown={(e) => handleKeyDown(e, 'dim', rowIdx, colIdx, dimRows.length, 5)}
                                onPaste={(e) => handlePaste(e, 'dim', rowIdx, colIdx)}
                                className={`w-full p-0.5 bg-transparent border-0 outline-none text-[9.5px] ${isLeft ? 'text-left pl-1 font-normal' : 'text-center'} ${isBold ? 'font-bold' : ''}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. TABLE 5: COATING (EXCEL INTEGRATED) */}
            {(currentSheet.showCoating !== false) && (
              <div className="border border-black bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100 flex items-center justify-between">
                  <span>Coating</span>
                  <div className="flex items-center gap-1 print:hidden font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        updateCurrentSheet(s => ({
                          ...s,
                          mtc4CoatingRows: [...(s.mtc4CoatingRows || DEFAULT_MTC4_COATING_ROWS), { testItem: 'New Coating Test', testSpec: 'ASTM D3359', standard: 'OK', results: 'OK', sampling: '10', pass: 'OK' }]
                        }));
                      }}
                      className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer font-sans"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>Row</span>
                    </button>
                  </div>
                </div>
                <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-serif">
                  <thead>
                    <tr className="bg-white border-b border-black font-bold">
                      <th className="border-r border-black p-0.5 w-[25%] text-left pl-1">Test Item</th>
                      <th className="border-r border-black p-0.5 w-[20%]">Test Spec.</th>
                      <th className="border-r border-black p-0.5 w-[20%]">Standard</th>
                      <th className="border-r border-black p-0.5 w-[15%]">Results</th>
                      <th className="border-r border-black p-0.5 w-[10%]">Sampling</th>
                      <th className="p-0.5 w-[10%]">Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coatingRows.map((r, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-black last:border-b-0">
                        {[r.testItem, r.testSpec, r.standard, r.results, r.sampling, r.pass].map((val, colIdx) => {
                          const isSel = isCellSelected('coating', rowIdx, colIdx);
                          const isLeft = colIdx === 0;
                          const isBold = colIdx === 3 || colIdx === 5;
                          return (
                            <td key={colIdx} className={`border-r border-black p-0 last:border-r-0 relative ${isSel ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                              <input
                                type="text"
                                data-cell={`coating_${rowIdx}_${colIdx}`}
                                value={val || ''}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  updateCurrentSheet(s => {
                                    const next = [...(s.mtc4CoatingRows || DEFAULT_MTC4_COATING_ROWS)];
                                    const item = { ...next[rowIdx] };
                                    if (colIdx === 0) item.testItem = newVal;
                                    if (colIdx === 1) item.testSpec = newVal;
                                    if (colIdx === 2) item.standard = newVal;
                                    if (colIdx === 3) item.results = newVal;
                                    if (colIdx === 4) item.sampling = newVal;
                                    if (colIdx === 5) item.pass = newVal;
                                    next[rowIdx] = item;
                                    return { ...s, mtc4CoatingRows: next };
                                  });
                                }}
                                onClick={(e) => {
                                  if (e.shiftKey) selectCell('coating', rowIdx, colIdx, true);
                                }}
                                onFocus={() => selectCell('coating', rowIdx, colIdx)}
                                onKeyDown={(e) => handleKeyDown(e, 'coating', rowIdx, colIdx, coatingRows.length, 6)}
                                onPaste={(e) => handlePaste(e, 'coating', rowIdx, colIdx)}
                                className={`w-full p-0.5 bg-transparent border-0 outline-none text-[9.5px] ${isLeft ? 'text-left pl-1 font-normal' : 'text-center'} ${isBold ? 'font-bold' : ''}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. PAGE 2: HEAT TREATMENT, ADDITIONAL TECH INFO, SIGNATURES & STAMPS */}
      {/* ========================================== */}
      {(activePageView === 'both' || activePageView === 'page2') && (
        <div 
          className="cert-page w-full border-2 border-black p-3.5 space-y-2 bg-white text-black font-serif transition-all relative shadow-none"
          style={{ fontFamily: '"Times New Roman", Times, serif', boxSizing: 'border-box' }}
        >
          {isSample && (
            <div className="watermark-sample absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
              <div 
                className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-6 py-2 transform -rotate-[30deg] text-[36px] sm:text-[48px] leading-none"
                style={{
                  fontFamily: "'Arial Black', Arial, Impact, sans-serif",
                  letterSpacing: '0.14em',
                  color: 'rgba(100, 116, 139, 0.18)',
                  borderColor: 'rgba(100, 116, 139, 0.22)',
                }}
              >
                SAMPLE MTC
              </div>
            </div>
          )}

          <div className="space-y-2">
            {/* 1. TOP HEADER (PAGE 2 - MATCHING STANDARD MTC HEADER) */}
            <div className="border-b-2 border-black pb-1.5 flex items-stretch justify-between gap-1 font-sans">
              {/* LEFT: COMPANY LOGO & DETAILS */}
              <div className="w-[45%] flex items-start gap-2">
                <div className="relative group shrink-0 flex flex-col items-center">
                  {formData.companyLogoUrl ? (
                    <div className="relative">
                      <img
                        src={formData.companyLogoUrl}
                        alt="Company Logo"
                        className="h-10 sm:h-12 max-w-[120px] object-contain border border-slate-200 rounded p-0.5 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, companyLogoUrl: undefined }));
                          onSaveAsset('companyLogoUrl', undefined);
                        }}
                        className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer shadow-xs"
                        title="Remove Company Logo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <label 
                      className="p-1 px-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded cursor-pointer transition-all flex items-center gap-1 text-[9px] font-bold print:hidden"
                      title="Upload Company Logo"
                    >
                      <Upload className="w-3 h-3 text-amber-700" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('company', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center font-sans">
                  <input
                    type="text"
                    value={formData.companyName ?? (activeCompany?.name || 'COMPANY NAME')}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="font-black text-[11px] sm:text-[12px] uppercase leading-tight text-slate-950 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                    placeholder="Company Name"
                    title="Click to edit Company Name"
                  />
                  <input
                    type="text"
                    value={formData.companyTagline ?? (activeCompany?.subtitle || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyTagline: e.target.value }))}
                    className="font-black text-[8.5px] uppercase leading-tight text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5 mt-0.5"
                    placeholder="Tagline"
                    title="Click to edit Tagline"
                  />
                  <input
                    type="text"
                    value={formData.companyAddress ?? (activeCompany?.address || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="text-[7.5px] sm:text-[8px] font-medium text-slate-800 leading-tight mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                    placeholder="Address & Tel"
                    title="Click to edit Address"
                  />
                  <input
                    type="text"
                    value={formData.companyContact ?? 'sales@marinefasteners.co | www.marinefasteners.co'}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyContact: e.target.value }))}
                    className="text-[7.5px] sm:text-[8px] font-semibold text-slate-900 mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                    placeholder="Email & Website"
                    title="Click to edit Contact Info"
                  />
                </div>
              </div>

              {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only for Marine Fasteners or companies with ISO enabled) */}
              <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0 font-sans">
                {getCompanyIsoText() ? (
                  <div className="relative group flex flex-col items-center">
                    <label className="cursor-pointer" title="Click to Upload Custom ISO Logo">
                      <img
                        src={formData.isoLogoUrl || DEFAULT_ISO_LOGO_URL}
                        alt="ISO Certification Logos"
                        className="h-9 sm:h-10 max-w-[240px] sm:max-w-[280px] object-contain transition-all hover:opacity-90 cursor-pointer"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[7.5px] sm:text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none font-sans">
                      <span>ISO 9001:2015</span>
                      <span className="text-slate-400">•</span>
                      <span>ISO 14001:2015</span>
                      <span className="text-slate-400">•</span>
                      <span>ISO 45001:2018</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 print:hidden bg-slate-50 px-2 py-0.5 rounded shadow-2xs border border-slate-300 z-10">
                      <label className="cursor-pointer text-[8px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                        <Upload className="w-2.5 h-2.5" />
                        <span>Upload ISO</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {formData.isoLogoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, isoLogoUrl: undefined }));
                            onSaveAsset('isoLogoUrl', undefined);
                          }}
                          className="text-rose-600 hover:text-rose-800 text-[8px] font-bold ml-1 border-l pl-1 border-slate-200"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-9" />
                )}
              </div>

              {/* RIGHT: CERTIFICATE TITLE & PAGE NUMBER */}
              <div className="text-right shrink-0 font-sans flex flex-col justify-center items-end">
                <input
                  type="text"
                  value={formData.certTitle ?? 'MATERIAL TEST CERTIFICATE'}
                  onChange={(e) => setFormData(prev => ({ ...prev, certTitle: e.target.value }))}
                  className="font-black text-[12px] sm:text-[13px] uppercase tracking-tight text-black underline leading-none mb-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5"
                  placeholder="Certificate Title"
                  title="Click to edit Certificate Title"
                />
                <input
                  type="text"
                  value={formData.certStandard ?? 'CERTIFIED TO BS EN 10204, 3.1'}
                  onChange={(e) => setFormData(prev => ({ ...prev, certStandard: e.target.value }))}
                  className="font-bold text-[8px] sm:text-[8.5px] uppercase tracking-tight text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5 w-full"
                  placeholder="Standard Subtitle"
                  title="Click to edit Certified Standard"
                />
                <div className="font-bold text-[8.5px] sm:text-[9px] uppercase tracking-tight text-black mt-0.5 flex items-center justify-end gap-1">
                  <span>PAGE NO :</span>
                  <input
                    type="text"
                    value={formData.pageNo ? (formData.pageNo.includes('2') ? formData.pageNo : '2 OF 2') : '2 OF 2'}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageNo: e.target.value }))}
                    className="w-14 p-0.5 bg-amber-50/50 border border-amber-400 rounded text-center font-black text-[8.5px] text-amber-950 uppercase"
                    title="Edit Page Number"
                  />
                </div>
              </div>
            </div>

            {/* 2. TABLE 6: HEAT TREATMENT (EXCEL INTEGRATED) */}
            {(currentSheet.showHeatTreatment !== false) && (
              <div className="border border-black bg-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100 flex items-center justify-between">
                  <span>Heat Treatment</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateCurrentSheet(s => ({
                        ...s,
                        mtc4HtRows: [...(s.mtc4HtRows || DEFAULT_MTC4_HT_ROWS), { testItem: 'New Heat Treatment Param', results: 'Satisfactory' }]
                      }));
                    }}
                    className="px-1.5 py-0.5 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[9.5px] font-bold flex items-center gap-0.5 print:hidden cursor-pointer font-sans"
                  >
                    <Plus className="w-3 h-3 text-amber-600" />
                    <span>Row</span>
                  </button>
                </div>
                <table className="w-full border-collapse text-[9.5px] table-fixed font-serif">
                  <thead>
                    <tr className="bg-white border-b border-black font-bold text-center">
                      <th className="border-r border-black p-0.5 w-[50%] text-left pl-1">Test Item</th>
                      <th className="p-0.5 w-[50%]">Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    {htRows.map((r, rowIdx) => {
                      const isSel0 = isCellSelected('ht', rowIdx, 0);
                      const isSel1 = isCellSelected('ht', rowIdx, 1);
                      return (
                        <tr key={rowIdx} className="border-b border-black last:border-b-0">
                          <td className={`border-r border-black p-0 ${isSel0 ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                            <input
                              type="text"
                              data-cell={`ht_${rowIdx}_0`}
                              value={r.testItem || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateCurrentSheet(s => {
                                  const next = [...(s.mtc4HtRows || DEFAULT_MTC4_HT_ROWS)];
                                  next[rowIdx] = { ...next[rowIdx], testItem: val };
                                  return { ...s, mtc4HtRows: next };
                                });
                              }}
                              onClick={(e) => {
                                if (e.shiftKey) selectCell('ht', rowIdx, 0, true);
                              }}
                              onFocus={() => selectCell('ht', rowIdx, 0)}
                              onKeyDown={(e) => handleKeyDown(e, 'ht', rowIdx, 0, htRows.length, 2)}
                              onPaste={(e) => handlePaste(e, 'ht', rowIdx, 0)}
                              className="w-full text-left pl-1 p-0.5 bg-transparent border-0 outline-none text-[9.5px] font-normal"
                            />
                          </td>
                          <td className={`p-0 ${isSel1 ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10' : ''}`}>
                            <input
                              type="text"
                              data-cell={`ht_${rowIdx}_1`}
                              value={r.results || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateCurrentSheet(s => {
                                  const next = [...(s.mtc4HtRows || DEFAULT_MTC4_HT_ROWS)];
                                  next[rowIdx] = { ...next[rowIdx], results: val };
                                  return { ...s, mtc4HtRows: next };
                                });
                              }}
                              onClick={(e) => {
                                if (e.shiftKey) selectCell('ht', rowIdx, 1, true);
                              }}
                              onFocus={() => selectCell('ht', rowIdx, 1)}
                              onKeyDown={(e) => handleKeyDown(e, 'ht', rowIdx, 1, htRows.length, 2)}
                              onPaste={(e) => handlePaste(e, 'ht', rowIdx, 1)}
                              className="w-full text-center p-0.5 bg-transparent border-0 outline-none text-[9.5px] font-bold"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. ADDITIONAL TECHNICAL INFORMATION */}
            <div className="border border-black p-2 bg-white text-[9.5px] space-y-1 font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                <div className="font-bold text-[11px] underline text-black">
                  Additional Technical Information:- <span className="text-[9px] text-slate-500 font-normal no-underline print:hidden font-sans">(Left titles and right values are editable)</span>
                </div>
                <button
                  type="button"
                  onClick={addTechLine}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9.5px] font-bold print:hidden cursor-pointer font-sans"
                >
                  <Plus className="w-3 h-3 text-amber-700" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-1">
                {additionalTech.map((item) => (
                  <div key={item.id} className="flex items-center gap-1 group">
                    {/* CHECKBOX */}
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleTechLine(item.id)}
                      className="w-3.5 h-3.5 text-amber-600 rounded cursor-pointer accent-amber-600 shrink-0"
                      title="Include in Certificate"
                    />

                    {/* EDITABLE TITLE */}
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTechLine(item.id, 'title', e.target.value)}
                      className="font-bold text-[9.5px] text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-48 rounded-xs px-0.5 shrink-0"
                      placeholder="Title"
                    />

                    <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>

                    {/* EDITABLE VALUE */}
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateTechLine(item.id, 'value', e.target.value)}
                      className="flex-1 text-[9.5px] text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded-xs px-0.5"
                      placeholder="Inspection result details"
                    />

                    {/* REMOVE BUTTON ON HOVER */}
                    <button
                      type="button"
                      onClick={() => removeTechLine(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 rounded print:hidden"
                      title="Remove line"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. DECLARATION / REMARKS STATEMENT */}
            <div className="border border-black p-1.5 bg-slate-50 text-[9.5px] text-slate-800 space-y-0.5 font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              <div className="font-bold text-[10px] text-slate-900">Remarks / Declaration:</div>
              <textarea
                rows={2}
                value={declarationText}
                onChange={(e) => updateCurrentSheet(s => ({ ...s, declarationText: e.target.value }))}
                className="w-full bg-transparent italic text-slate-800 text-[9.5px] border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white resize-none p-0.5 outline-none"
                placeholder="Enter declaration text"
              />
            </div>

            {/* SIGN & STAMP ADJUSTER TOOLBAR (IMAGE 1 SPEC) */}
            <div className="bg-slate-50/90 p-2.5 rounded border border-slate-200 space-y-2 text-[11px] font-sans print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" /> Sign & Stamp Adjuster:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSignTools(!showSignTools)}
                    className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold cursor-pointer transition-colors text-[10px]"
                  >
                    {showSignTools ? 'Hide Sliders' : 'Show Sliders'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="p-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer font-bold text-slate-800 flex items-center gap-1 transition-colors text-[10px]">
                    <Upload className="w-3 h-3 text-amber-600" /> Upload Prepared Sign
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <label className="p-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer font-bold text-slate-800 flex items-center gap-1 transition-colors text-[10px]">
                    <Upload className="w-3 h-3 text-amber-600" /> Upload Stamp
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <label className="p-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer font-bold text-slate-800 flex items-center gap-1 transition-colors text-[10px]">
                    <Upload className="w-3 h-3 text-amber-600" /> Upload Approved Sign
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && onUploadLogo('manager', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* SLIDERS BAR (EXACT DESIGN AS USER IMAGE 1) */}
              {showSignTools && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 bg-white p-2.5 rounded border border-slate-200">
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 text-[10.5px] mb-1">
                      <span>Prepared Sign Height:</span>
                      <span className="text-amber-700">{formData.preparedSignHeight || 52}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="120"
                      value={formData.preparedSignHeight || 52}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, preparedSignHeight: val }));
                        onSaveAsset('preparedSignHeight', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 text-[10.5px] mb-1">
                      <span>Approved Sign Height:</span>
                      <span className="text-amber-700">{formData.approvedSignHeight || 52}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="120"
                      value={formData.approvedSignHeight || 52}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, approvedSignHeight: val }));
                        onSaveAsset('approvedSignHeight', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 text-[10.5px] mb-1">
                      <span>Stamp Size:</span>
                      <span className="text-amber-700">{formData.stampHeight || 90}px</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="160"
                      value={formData.stampHeight || 90}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setFormData(prev => ({ ...prev, stampHeight: val }));
                        onSaveAsset('stampHeight', val);
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. SIGNATURES & OFFICIAL STAMP FOOTER (WITH DRAGGABLE & RESIZABLE ASSETS) */}
            <div className="border-t-2 border-black pt-3 mt-1 flex items-end justify-between px-2 relative font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              {/* PREPARED BY */}
              <div className="text-left space-y-0.5 flex flex-col justify-end relative">
                <div className="relative h-14 w-48 mb-0.5 flex items-end">
                  {formData.engineerSignatureUrl ? (
                    <div className="relative group/sig">
                      <DraggableImage
                        src={formData.engineerSignatureUrl}
                        alt="Prepared By"
                        height={formData.preparedSignHeight || 52}
                        posX={formData.preparedSignPosX || 0}
                        posY={formData.preparedSignPosY || 0}
                        onPositionChange={(nx, ny) => {
                          setFormData(prev => ({ ...prev, preparedSignPosX: nx, preparedSignPosY: ny }));
                          onSaveAsset('preparedSignPosX', nx);
                          onSaveAsset('preparedSignPosY', ny);
                        }}
                        className="max-w-[180px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                        title="Click & Drag to move Prepared By Signature"
                      />
                      <div className="absolute -top-3 left-0 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
                        <label className="cursor-pointer text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                          <Upload className="w-2 h-2" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, engineerSignatureUrl: undefined }));
                            onSaveAsset('engineerSignatureUrl', undefined);
                          }}
                          className="text-rose-600 hover:text-rose-800 ml-0.5 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/50 rounded px-2 py-1 flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-600 hover:text-amber-800 cursor-pointer h-10 w-40 transition-colors print:hidden shadow-2xs">
                      <Upload className="w-2.5 h-2.5 text-amber-600" />
                      <span>Upload Prepared Sign</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="font-bold text-[10px] text-black">Prepared By.</div>
                <div className="font-bold text-[10px] text-black">Engineer QA/QC</div>
              </div>

              {/* OFFICIAL COMPANY STAMP & APPROVED BY */}
              <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
                <div className="relative h-14 w-72 mb-0.5 flex items-end justify-end">
                  {/* STAMP */}
                  {formData.companyStampUrl ? (
                    <div className="relative group/stamp">
                      <DraggableImage
                        src={formData.companyStampUrl}
                        alt="Company Stamp"
                        height={formData.stampHeight || 90}
                        posX={formData.stampPosX || 0}
                        posY={formData.stampPosY || 0}
                        onPositionChange={(nx, ny) => {
                          setFormData(prev => ({ ...prev, stampPosX: nx, stampPosY: ny }));
                          onSaveAsset('stampPosX', nx);
                          onSaveAsset('stampPosY', ny);
                        }}
                        className="max-w-[140px] object-contain absolute bottom-0 right-32 origin-bottom-right"
                        title="Click & Drag to move Company Stamp"
                      />
                      <div className="absolute -top-3 right-32 opacity-0 group-hover/stamp:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
                        <label className="cursor-pointer text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                          <Upload className="w-2 h-2" /> Stamp
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, companyStampUrl: undefined }));
                            onSaveAsset('companyStampUrl', undefined);
                          }}
                          className="text-rose-600 hover:text-rose-800 ml-0.5 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/50 rounded px-2 py-1 flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-600 hover:text-amber-800 cursor-pointer h-10 w-28 mr-2 transition-colors print:hidden shadow-2xs">
                      <Upload className="w-2.5 h-2.5 text-amber-600" />
                      <span>Upload Stamp</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* APPROVED BY SIGNATURE */}
                  {formData.managerSignatureUrl ? (
                    <div className="relative group/appr">
                      <DraggableImage
                        src={formData.managerSignatureUrl}
                        alt="Approved By"
                        height={formData.approvedSignHeight || 52}
                        posX={formData.approvedSignPosX || 0}
                        posY={formData.approvedSignPosY || 0}
                        onPositionChange={(nx, ny) => {
                          setFormData(prev => ({ ...prev, approvedSignPosX: nx, approvedSignPosY: ny }));
                          onSaveAsset('approvedSignPosX', nx);
                          onSaveAsset('approvedSignPosY', ny);
                        }}
                        className="max-w-[180px] object-contain absolute bottom-0 right-0 origin-bottom-right"
                        title="Click & Drag to move Approved By Signature"
                      />
                      <div className="absolute -top-3 right-0 opacity-0 group-hover/appr:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
                        <label className="cursor-pointer text-amber-700 hover:text-amber-900 flex items-center gap-0.5">
                          <Upload className="w-2 h-2" /> Approved
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && onUploadLogo('manager', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, managerSignatureUrl: undefined }));
                            onSaveAsset('managerSignatureUrl', undefined);
                          }}
                          className="text-rose-600 hover:text-rose-800 ml-0.5 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/50 rounded px-2 py-1 flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-600 hover:text-amber-800 cursor-pointer h-10 w-32 transition-colors print:hidden shadow-2xs">
                      <Upload className="w-2.5 h-2.5 text-amber-600" />
                      <span>Upload Approved</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && onUploadLogo('manager', e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="font-bold text-[10px] text-black">Approved By.</div>
                <div className="font-bold text-[10px] text-black">QA/QC Manager</div>
                <div className="font-bold text-[10px] text-black">{formData.companyName || activeCompany?.name || 'COMPANY NAME'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MTC 4 PRINT VIEW (SUPPORTS MULTI-SHEETS)
// ==========================================
export const MtcTemplate4PrintView: React.FC<{
  record: QcReportRecord;
  DEFAULT_ISO_LOGO_URL?: string;
  isSample?: boolean;
}> = ({
  record,
  DEFAULT_ISO_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/ISO_9001_Declaration.svg/320px-ISO_9001_Declaration.svg.png',
  isSample = false
}) => {
  const activeCompany = getActiveCompany();
  const sheets: Mtc4SheetData[] = useMemo(() => {
    if ((record as any).mtc4Sheets && Array.isArray((record as any).mtc4Sheets) && (record as any).mtc4Sheets.length > 0) {
      return (record as any).mtc4Sheets;
    }
    const s = createDefaultMtc4Sheet(1);
    if (record.customerName) s.customerName = record.customerName;
    if (record.customerPoNum) s.customerPoNum = record.customerPoNum;
    if (record.invoiceNum) s.invoiceNum = record.invoiceNum;
    if (record.workOrderNum) s.workOrderNum = record.workOrderNum;
    if (record.certNo || record.issueNo) s.certNo = record.certNo || record.issueNo;
    if (record.productDescription !== undefined) s.productDescription = record.productDescription;
    if (record.specStandard !== undefined) s.specStandard = record.specStandard;
    if (record.startingMaterial !== undefined) s.material = record.startingMaterial;
    if (record.chemicalData && record.chemicalData.length > 0) s.chemicalData = record.chemicalData;
    if (record.chemSpecMin) s.chemSpecMin = record.chemSpecMin;
    if (record.chemSpecMax) s.chemSpecMax = record.chemSpecMax;
    if (record.chemHeaderOverrides) s.chemHeaderOverrides = record.chemHeaderOverrides;
    if ((record as any).showMacroEtch !== undefined) s.showMacroEtch = (record as any).showMacroEtch;
    if ((record as any).showDimInspection !== undefined) s.showDimInspection = (record as any).showDimInspection;
    if ((record as any).showCoating !== undefined) s.showCoating = (record as any).showCoating;
    if ((record as any).showHeatTreatment !== undefined) s.showHeatTreatment = (record as any).showHeatTreatment;
    if ((record as any).mtc4MechRows) s.mtc4MechRows = (record as any).mtc4MechRows;
    if ((record as any).mtc4DimRows) s.mtc4DimRows = (record as any).mtc4DimRows;
    if ((record as any).mtc4CoatingRows) s.mtc4CoatingRows = (record as any).mtc4CoatingRows;
    if ((record as any).mtc4HtRows) s.mtc4HtRows = (record as any).mtc4HtRows;
    return [s];
  }, [record]);

  return (
    <div className="space-y-6">
      {sheets.map((sheet, sheetIdx) => {
        const chemData = sheet.chemicalData?.[0] || {} as any;
        const chemMin = sheet.chemSpecMin || {};
        const chemMax = sheet.chemSpecMax || {};
        const mechRows = sheet.mtc4MechRows || DEFAULT_MTC4_MECH_ROWS;
        const dimRows = sheet.mtc4DimRows || DEFAULT_MTC4_DIM_ROWS;
        const coatingRows = sheet.mtc4CoatingRows || DEFAULT_MTC4_COATING_ROWS;
        const htRows = sheet.mtc4HtRows || DEFAULT_MTC4_HT_ROWS;
        const additionalTech = (sheet.additionalTechInfo || DEFAULT_ADDITIONAL_TECH_INFO).filter(t => t.checked);
        const declaration = sheet.declarationText !== undefined ? sheet.declarationText : DEFAULT_DECLARATION_TEXT;

        const totalPages = sheets.length * 2;
        const page1Num = sheetIdx * 2 + 1;
        const page2Num = sheetIdx * 2 + 2;

        const isSheetSample = Boolean(
          isSample ||
          (record.invoiceNum || '').toUpperCase().includes('SAMPLE') ||
          (record.workOrderNum || '').toUpperCase().includes('SAMPLE') ||
          (record.customerPoNum || '').toUpperCase().includes('SAMPLE') ||
          (record.certNo || '').toUpperCase().includes('SAMPLE') ||
          (sheet.invoiceNum || '').toUpperCase().includes('SAMPLE') ||
          (sheet.workOrderNum || '').toUpperCase().includes('SAMPLE') ||
          (sheet.customerPoNum || '').toUpperCase().includes('SAMPLE') ||
          (sheet.certNo || '').toUpperCase().includes('SAMPLE')
        );

        return (
          <React.Fragment key={sheet.id || sheetIdx}>
            {/* ================= PRINT PAGE 1 ================= */}
            <div 
              className="cert-page w-[200mm] min-w-[200mm] mx-auto p-4 bg-white text-black font-sans border-2 border-black relative flex flex-col shadow-none mb-6"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif', boxSizing: 'border-box', pageBreakAfter: 'always' }}
            >
              {isSheetSample && (
                <div className="watermark-sample absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
                  <div 
                    className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-6 py-2 transform -rotate-[30deg] text-[36px] sm:text-[48px] leading-none"
                    style={{
                      fontFamily: "'Arial Black', Arial, Impact, sans-serif",
                      letterSpacing: '0.14em',
                      color: 'rgba(100, 116, 139, 0.18)',
                      borderColor: 'rgba(100, 116, 139, 0.22)',
                    }}
                  >
                    SAMPLE MTC
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {/* 1. HEADER (PAGE 1 - MATCHING CANVAS EXACTLY) */}
                <div className="border-b-2 border-black pb-1.5 flex items-stretch justify-between gap-1 font-sans">
                  {/* LEFT: COMPANY LOGO & DETAILS */}
                  <div className="w-[45%] flex items-start gap-2">
                    {record.companyLogoUrl && (
                      <img
                        src={record.companyLogoUrl}
                        alt="Company Logo"
                        className="h-10 sm:h-12 max-w-[120px] object-contain shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-black text-[11.5px] uppercase leading-tight text-slate-950">
                        {record.companyName || activeCompany?.name || 'COMPANY NAME'}
                      </div>
                      <div className="font-black text-[8.5px] uppercase leading-tight text-slate-800 mt-0.5">
                        {record.companyTagline || activeCompany?.subtitle || ''}
                      </div>
                      <div className="text-[8px] font-medium text-slate-800 leading-tight mt-0.5">
                        {record.companyAddress || activeCompany?.address || ''}
                      </div>
                      <div className="text-[8px] font-semibold text-slate-900 mt-0.5">
                        {record.companyContact || (activeCompany?.email ? `${activeCompany.email} | ${activeCompany.website || ''}` : '')}
                      </div>
                    </div>
                  </div>

                  {/* CENTER: ISO LOGO (Only for Marine Fasteners or companies with ISO enabled) */}
                  <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
                    {getCompanyIsoText() ? (
                      <>
                        <img
                          src={record.isoLogoUrl || DEFAULT_ISO_LOGO_URL}
                          alt="ISO Certification Logos"
                          className="h-9 max-w-[260px] object-contain"
                        />
                        <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none">
                          <span>ISO 9001:2015</span>
                          <span className="text-slate-400">•</span>
                          <span>ISO 14001:2015</span>
                          <span className="text-slate-400">•</span>
                          <span>ISO 45001:2018</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-9" />
                    )}
                  </div>

                  {/* RIGHT: CERTIFICATE TITLE & PAGE NUMBER */}
                  <div className="text-right shrink-0 flex flex-col justify-center items-end">
                    <div className="font-black text-[12.5px] uppercase tracking-tight text-black underline leading-none mb-0.5">
                      {record.certTitle || 'MATERIAL TEST CERTIFICATE'}
                    </div>
                    <div className="font-bold text-[8.5px] uppercase tracking-tight text-black">
                      {record.certStandard || 'CERTIFIED TO BS EN 10204, 3.1'}
                    </div>
                    <div className="font-bold text-[9px] uppercase tracking-tight text-black mt-0.5">
                      PAGE NO : {page1Num} OF {totalPages}
                    </div>
                  </div>
                </div>

                {/* 2. METADATA TABLE */}
                <div className="border border-black bg-white text-[9.5px] font-sans" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {/* ROW 1: CUSTOMER & CERTIFICATE NO */}
                  <div className="flex border-b border-black">
                    <div className="w-[65%] border-r border-black p-0.5 px-1 flex items-center gap-1.5">
                      <span className="font-bold text-black whitespace-nowrap">Customer :</span>
                      <span className="font-bold text-[10px] text-black uppercase">{sheet.customerName || record.customerName || '—'}</span>
                    </div>
                    <div className="w-[35%] p-0.5 px-1 flex items-center gap-1.5">
                      <span className="font-bold text-black whitespace-nowrap">Certificate No:</span>
                      <span className="font-bold text-black text-[10px] uppercase">{sheet.certNo || record.certNo || record.issueNo || '—'}</span>
                    </div>
                  </div>

                  {/* ROW 2: PO NO, INVOICE NO, WORK ORDER NO, PART NO */}
                  <div className="flex border-b border-black">
                    <div className="w-1/4 border-r border-black p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">PO No:</span>
                      <span className="font-normal text-[9.5px]">{sheet.customerPoNum || record.customerPoNum || '—'}</span>
                    </div>
                    <div className="w-1/4 border-r border-black p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Invoice No:</span>
                      <span className="font-normal text-[9.5px]">{sheet.invoiceNum || record.invoiceNum || '—'}</span>
                    </div>
                    <div className="w-1/4 border-r border-black p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Work Order No:</span>
                      <span className="font-normal text-[9.5px]">{sheet.workOrderNum || record.workOrderNum || '—'}</span>
                    </div>
                    <div className="w-1/4 p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Part No:</span>
                      <span className="font-normal text-[9.5px]">{sheet.partNo || '—'}</span>
                    </div>
                  </div>

                  {/* ROW 3: PRODUCT DESCRIPTION & QUANTITY */}
                  <div className="flex border-b border-black">
                    <div className="w-[65%] border-r border-black p-0.5 px-1 flex items-center gap-1.5">
                      <span className="font-bold whitespace-nowrap">Product Description:</span>
                      <span className="font-normal text-[9.5px]">{sheet.productDescription || record.productDescription || '—'}</span>
                    </div>
                    <div className="w-[35%] p-0.5 px-1 flex items-center gap-1.5">
                      <span className="font-bold whitespace-nowrap">Quantity:</span>
                      <span className="font-bold text-[9.5px]">{sheet.qty || record.quantity || '—'}</span>
                    </div>
                  </div>

                  {/* ROW 4: HEAT NO, LOT NO, SPECIFICATION & YEAR/REV */}
                  <div className="flex border-b border-black">
                    <div className="w-[25%] border-r border-black p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Heat No:</span>
                      <span className="font-bold text-black text-[9.5px]">{sheet.heatNo || chemData.heatNo || '—'}</span>
                    </div>
                    <div className="w-[20%] border-r border-black p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Lot No:</span>
                      <span className="font-normal text-[9.5px]">{sheet.lotNo || '1'}</span>
                    </div>
                    <div className="w-[35%] border-r border-black p-0.5 px-1 flex items-center gap-1.5">
                      <span className="font-bold whitespace-nowrap">Specification:</span>
                      <span className="font-normal text-[9.5px]">{sheet.specStandard || record.specStandard || '—'}</span>
                    </div>
                    <div className="w-[20%] p-0.5 px-1 flex items-center gap-1.5">
                      <span className="font-bold whitespace-nowrap">Year and Revision of:</span>
                      <span className="font-normal text-[9.5px]">{sheet.yearRevision || '2023'}</span>
                    </div>
                  </div>

                  {/* ROW 5: MATERIAL, MARKING, FINISH */}
                  <div className="flex">
                    <div className="w-1/3 border-r border-black p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Material:</span>
                      <span className="font-normal text-[9.5px]">{sheet.material || record.startingMaterial || '—'}</span>
                    </div>
                    <div className="w-1/3 border-r border-black p-0.5 px-1 flex items-center justify-start gap-1">
                      <span className="font-bold whitespace-nowrap shrink-0">Marking:</span>
                      <div className="flex items-center gap-1 min-w-0">
                        {(sheet.markingImage || record.markingImageUrl) && (
                          <img 
                            src={sheet.markingImage || record.markingImageUrl} 
                            alt="Marking" 
                            className="max-h-4 max-w-[28px] object-contain shrink-0" 
                          />
                        )}
                        <span className="font-bold text-[9.5px] truncate">{sheet.marking || '—'}</span>
                      </div>
                    </div>
                    <div className="w-1/3 p-0.5 px-1 flex items-center gap-1">
                      <span className="font-bold whitespace-nowrap">Finish:</span>
                      <span className="font-normal text-[9.5px]">{sheet.finish || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. TABLE 1: CHEMICAL ANALYSIS */}
                <div className="border border-black bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                    Chemical Analysis
                  </div>
                  <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-sans">
                    <thead>
                      <tr className="bg-white border-b border-black font-bold">
                        <th className="border-r border-black p-0.5 w-[14%] text-left pl-1">Element</th>
                        {CHEM_ELEMENTS.map(c => (
                          <th key={c.k} className="border-r border-black p-0.5 last:border-r-0">
                            {sheet.chemHeaderOverrides?.[c.k] || c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-0.5 font-bold text-left pl-1">Spec. Min.</td>
                        {CHEM_ELEMENTS.map(c => (
                          <td key={c.k} className="border-r border-black p-0.5 last:border-r-0">{chemMin[c.k] || '—'}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-0.5 font-bold text-left pl-1">Spec. Max.</td>
                        {CHEM_ELEMENTS.map(c => (
                          <td key={c.k} className="border-r border-black p-0.5 last:border-r-0">{chemMax[c.k] || '—'}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border-r border-black p-0.5 font-bold text-left pl-1">% Actual</td>
                        {CHEM_ELEMENTS.map(c => (
                          <td key={c.k} className="border-r border-black p-0.5 last:border-r-0 font-bold">{chemData[c.k] || '—'}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. TABLE 2: MECHANICAL PROPERTIES */}
                <div className="border border-black bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                    Mechanical Properties
                  </div>
                  <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-sans">
                    <thead>
                      <tr className="bg-white border-b border-black font-bold">
                        <th className="border-r border-black p-0.5 w-[30%] text-left pl-1">Test Item</th>
                        <th className="border-r border-black p-0.5 w-[20%]">Test Standard</th>
                        <th className="border-r border-black p-0.5 w-[20%]">Spec.</th>
                        <th className="border-r border-black p-0.5 w-[18%]">Results</th>
                        <th className="p-0.5 w-[12%]">Sampling</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mechRows.map((r, idx) => (
                        <tr key={idx} className="border-b border-black last:border-b-0">
                          <td className="border-r border-black p-0.5 text-left pl-1 font-normal">{r.testItem || '—'}</td>
                          <td className="border-r border-black p-0.5">{r.testStandard || '—'}</td>
                          <td className="border-r border-black p-0.5">{r.spec || '—'}</td>
                          <td className="border-r border-black p-0.5 font-bold">{r.results || '—'}</td>
                          <td className="p-0.5">{r.sampling || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. TABLE 3: MACRO ETCH */}
                {(sheet.showMacroEtch !== false) && (
                  <div className="border border-black bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                      Macro Etch
                    </div>
                    <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-sans">
                      <thead>
                        <tr className="bg-white border-b border-black font-bold">
                          <th className="border-r border-black p-0.5 w-[15%] text-left pl-1">Division</th>
                          <th className="border-r border-black p-0.5 w-[20%]">Surface Condition</th>
                          <th className="border-r border-black p-0.5 w-[20%]">Random Condition</th>
                          <th className="border-r border-black p-0.5 w-[20%]">Center Segregation</th>
                          <th className="p-0.5 w-[25%]">Spec. of test method</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black">
                          <td className="border-r border-black p-0.5 font-bold text-left pl-1">Spec.</td>
                          <td className="border-r border-black p-0.5">{sheet.macroEtchSpecSurface || 'S2'}</td>
                          <td className="border-r border-black p-0.5">{sheet.macroEtchSpecRandom || 'R2'}</td>
                          <td className="border-r border-black p-0.5">{sheet.macroEtchSpecCenter || 'C3'}</td>
                          <td className="p-0.5">{sheet.macroEtchSpecTestMethod || 'ASTM A962/A962M-19'}</td>
                        </tr>
                        <tr>
                          <td className="border-r border-black p-0.5 font-bold text-left pl-1">Results</td>
                          <td className="border-r border-black p-0.5 font-bold">{sheet.macroEtchResultSurface || 'S2'}</td>
                          <td className="border-r border-black p-0.5 font-bold">{sheet.macroEtchResultRandom || 'R2'}</td>
                          <td className="border-r border-black p-0.5 font-bold">{sheet.macroEtchResultCenter || 'C3'}</td>
                          <td className="p-0.5 font-bold">{sheet.macroEtchResultMethod || 'OK'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. TABLE 4: DIMENSIONS OF SPEC */}
                {(sheet.showDimInspection !== false) && (
                  <div className="border border-black bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                      Dimensions of Spec
                    </div>
                    <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-sans">
                      <thead>
                        <tr className="bg-white border-b border-black font-bold">
                          <th className="border-r border-black p-0.5 w-[30%] text-left pl-1">Test Item</th>
                          <th className="border-r border-black p-0.5 w-[25%]">Spec.</th>
                          <th className="border-r border-black p-0.5 w-[25%]">Inspection Results</th>
                          <th className="border-r border-black p-0.5 w-[10%]">Sampling</th>
                          <th className="p-0.5 w-[10%]">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dimRows.map((r, idx) => (
                          <tr key={idx} className="border-b border-black last:border-b-0">
                            <td className="border-r border-black p-0.5 text-left pl-1 font-normal">{r.testItem || '—'}</td>
                            <td className="border-r border-black p-0.5">{r.spec || '—'}</td>
                            <td className="border-r border-black p-0.5 font-bold">{r.results || '—'}</td>
                            <td className="border-r border-black p-0.5">{r.sampling || '—'}</td>
                            <td className="p-0.5 font-bold">{r.remark || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 7. TABLE 5: COATING */}
                {(sheet.showCoating !== false) && (
                  <div className="border border-black bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                      Coating
                    </div>
                    <table className="w-full border-collapse text-[9.5px] text-center table-fixed font-sans">
                      <thead>
                        <tr className="bg-white border-b border-black font-bold">
                          <th className="border-r border-black p-0.5 w-[25%] text-left pl-1">Test Item</th>
                          <th className="border-r border-black p-0.5 w-[20%]">Test Spec.</th>
                          <th className="border-r border-black p-0.5 w-[20%]">Standard</th>
                          <th className="border-r border-black p-0.5 w-[15%]">Results</th>
                          <th className="border-r border-black p-0.5 w-[10%]">Sampling</th>
                          <th className="p-0.5 w-[10%]">Pass</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coatingRows.map((r, idx) => (
                          <tr key={idx} className="border-b border-black last:border-b-0">
                            <td className="border-r border-black p-0.5 text-left pl-1 font-normal">{r.testItem || '—'}</td>
                            <td className="border-r border-black p-0.5">{r.testSpec || '—'}</td>
                            <td className="border-r border-black p-0.5">{r.standard || '—'}</td>
                            <td className="border-r border-black p-0.5 font-bold">{r.results || '—'}</td>
                            <td className="border-r border-black p-0.5">{r.sampling || '—'}</td>
                            <td className="p-0.5 font-bold">{r.pass || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ================= PRINT PAGE 2 ================= */}
            <div 
              className="cert-page w-[200mm] min-w-[200mm] mx-auto p-4 bg-white text-black font-sans border-2 border-black relative flex flex-col shadow-none mb-6"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif', boxSizing: 'border-box', pageBreakAfter: 'always' }}
            >
              {isSheetSample && (
                <div className="watermark-sample absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
                  <div 
                    className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-6 py-2 transform -rotate-[30deg] text-[36px] sm:text-[48px] leading-none"
                    style={{
                      fontFamily: "'Arial Black', Arial, Impact, sans-serif",
                      letterSpacing: '0.14em',
                      color: 'rgba(100, 116, 139, 0.18)',
                      borderColor: 'rgba(100, 116, 139, 0.22)',
                    }}
                  >
                    SAMPLE MTC
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {/* 1. HEADER (PAGE 2 - MATCHING CANVAS EXACTLY) */}
                <div className="border-b-2 border-black pb-1.5 flex items-stretch justify-between gap-1 font-sans">
                  {/* LEFT: COMPANY LOGO & DETAILS */}
                  <div className="w-[45%] flex items-start gap-2">
                    {record.companyLogoUrl && (
                      <img
                        src={record.companyLogoUrl}
                        alt="Company Logo"
                        className="h-10 sm:h-12 max-w-[120px] object-contain shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-black text-[11.5px] uppercase leading-tight text-slate-950">
                        {record.companyName || activeCompany?.name || 'COMPANY NAME'}
                      </div>
                      <div className="font-black text-[8.5px] uppercase leading-tight text-slate-800 mt-0.5">
                        {record.companyTagline || activeCompany?.subtitle || ''}
                      </div>
                      <div className="text-[8px] font-medium text-slate-800 leading-tight mt-0.5">
                        {record.companyAddress || activeCompany?.address || ''}
                      </div>
                      <div className="text-[8px] font-semibold text-slate-900 mt-0.5">
                        {record.companyContact || (activeCompany?.email ? `${activeCompany.email} | ${activeCompany.website || ''}` : '')}
                      </div>
                    </div>
                  </div>

                  {/* CENTER: ISO LOGO (Only for Marine Fasteners or companies with ISO enabled) */}
                  <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
                    {getCompanyIsoText() ? (
                      <>
                        <img
                          src={record.isoLogoUrl || DEFAULT_ISO_LOGO_URL}
                          alt="ISO Certification Logos"
                          className="h-9 max-w-[260px] object-contain"
                        />
                        <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none">
                          <span>ISO 9001:2015</span>
                          <span className="text-slate-400">•</span>
                          <span>ISO 14001:2015</span>
                          <span className="text-slate-400">•</span>
                          <span>ISO 45001:2018</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-9" />
                    )}
                  </div>

                  {/* RIGHT: CERTIFICATE TITLE & PAGE NUMBER */}
                  <div className="text-right shrink-0 flex flex-col justify-center items-end">
                    <div className="font-black text-[12.5px] uppercase tracking-tight text-black underline leading-none mb-0.5">
                      {record.certTitle || 'MATERIAL TEST CERTIFICATE'}
                    </div>
                    <div className="font-bold text-[8.5px] uppercase tracking-tight text-black">
                      {record.certStandard || 'CERTIFIED TO BS EN 10204, 3.1'}
                    </div>
                    <div className="font-bold text-[9px] uppercase tracking-tight text-black mt-0.5">
                      PAGE NO : {page2Num} OF {totalPages}
                    </div>
                  </div>
                </div>

                {/* 2. TABLE 6: HEAT TREATMENT */}
                {(sheet.showHeatTreatment !== false) && (
                  <div className="border border-black bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    <div className="font-bold text-[11px] px-1.5 py-0.5 border-b border-black bg-slate-100">
                      Heat Treatment
                    </div>
                    <table className="w-full border-collapse text-[9.5px] table-fixed font-sans">
                      <thead>
                        <tr className="bg-white border-b border-black font-bold text-center">
                          <th className="border-r border-black p-0.5 w-[50%] text-left pl-1">Test Item</th>
                          <th className="p-0.5 w-[50%]">Results</th>
                        </tr>
                      </thead>
                      <tbody>
                        {htRows.map((r, idx) => (
                          <tr key={idx} className="border-b border-black last:border-b-0">
                            <td className="border-r border-black p-0.5 text-left pl-1 font-normal">{r.testItem || '—'}</td>
                            <td className="p-0.5 text-center font-bold">{r.results || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. ADDITIONAL TECHNICAL INFORMATION */}
                <div className="border border-black p-1.5 bg-white text-[9.5px] font-sans" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div className="font-bold text-[11px] mb-1 underline text-black">Additional Technical Information:-</div>
                  <div className="space-y-0.5 pl-1">
                    {additionalTech.map((item) => (
                      <div key={item.id} className="flex items-start gap-1.5">
                        <span className="font-bold whitespace-nowrap">☑ {item.title} :</span>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. DECLARATION STATEMENT */}
                <div className="border border-black p-1.5 bg-slate-50 text-[9.5px] italic text-slate-800 text-center font-sans" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {declaration}
                </div>

                {/* 5. SIGNATURES & STAMPS (MATCHING CANVAS UI EXACTLY) */}
                <div className="border-t-2 border-black pt-3 mt-1 flex items-end justify-between px-2 relative font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  {/* PREPARED BY */}
                  <div className="text-left space-y-0.5 flex flex-col justify-end relative">
                    <div className="relative h-14 w-48 mb-0.5">
                      {record.engineerSignatureUrl && (
                        <img 
                          src={record.engineerSignatureUrl} 
                          alt="Prepared By" 
                          style={{
                            height: `${record.preparedSignHeight || 52}px`,
                            transform: `translate(${record.preparedSignPosX || 0}px, ${record.preparedSignPosY || 0}px)`
                          }}
                          className="max-w-[180px] object-contain absolute bottom-0 left-0 origin-bottom-left" 
                        />
                      )}
                    </div>
                    <div className="font-bold text-[10px] text-black">Prepared By.</div>
                    <div className="font-bold text-[10px] text-black">Engineer QA/QC</div>
                  </div>

                  {/* OFFICIAL COMPANY STAMP & APPROVED BY */}
                  <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
                    <div className="relative h-14 w-72 mb-0.5 flex items-end justify-end">
                      {/* STAMP */}
                      {record.companyStampUrl && (
                        <img 
                          src={record.companyStampUrl} 
                          alt="Company Stamp" 
                          style={{
                            height: `${record.stampHeight || 90}px`,
                            transform: `translate(${record.stampPosX || 0}px, ${record.stampPosY || 0}px)`
                          }}
                          className="max-w-[140px] object-contain absolute bottom-0 right-32 origin-bottom-right" 
                        />
                      )}

                      {/* APPROVED BY SIGNATURE */}
                      {record.managerSignatureUrl && (
                        <img 
                          src={record.managerSignatureUrl} 
                          alt="Approved By" 
                          style={{
                            height: `${record.approvedSignHeight || 52}px`,
                            transform: `translate(${record.approvedSignPosX || 0}px, ${record.approvedSignPosY || 0}px)`
                          }}
                          className="max-w-[180px] object-contain absolute bottom-0 right-0 origin-bottom-right" 
                        />
                      )}
                    </div>
                    <div className="font-bold text-[10px] text-black">Approved By.</div>
                    <div className="font-bold text-[10px] text-black">QA/QC Manager</div>
                    <div className="font-bold text-[10px] text-black">{record.companyName || (activeCompany?.name || 'COMPANY NAME')}</div>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
