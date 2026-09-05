import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Sliders, 
  FileSpreadsheet, 
  RotateCcw,
  Check,
  Undo2,
  Redo2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText
} from 'lucide-react';
import { QcReportRecord, QcRecordItem, QcChemicalItem, QcMechanicalItem, MtcSheetData, formatNumericVal, incrementCertNo } from './QcReportsComponent';
import { getActiveCompany, getCompanyIsoText, isMarineFastenersCompany } from '../utils/companyProfile';

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

  React.useEffect(() => {
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
      className={`${className} transition-none select-none hover:ring-1 hover:ring-indigo-500 rounded`}
      title={title}
    />
  );
};

export const getMechPropValue = (row: any, key: string): string => {
  if (!row) return '';
  if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
    return String(row[key]);
  }
  const aliasMap: Record<string, string[]> = {
    yieldStrength: ['ysMpa', 'ysKsi', 'yieldStrengthMpa', 'yieldStrengthKsi', 'yield_strength', 'ys'],
    tensileStrength: ['utsMpa', 'utsKsi', 'tensileStrengthMpa', 'tensileStrengthKsi', 'tensile_strength', 'uts', 'ts'],
    elongation: ['elPct', 'elongationPct', 'el_pct', 'el', 'elongation_pct'],
    reductionArea: ['raPct', 'reductionAreaPct', 'reductionOfArea', 'ra_pct', 'ra'],
    hardness: ['hardnessHrc', 'hardness_hrc', 'hardnessHbw', 'hardness_hbw', 'coreHardness'],
    hardnessHbw: ['hardness_hbw', 'hardness', 'hbw'],
    proofLoad: ['proofLoadLbf', 'proofLoadKn', 'proof_load_lbf', 'proof_load'],
    stressUnderProofload: ['stressUnderProofloadMpa', 'stress_under_proofload_mpa', 'stress_under_proofload'],
    heatTreatment: ['heat_treatment', 'ht'],
    hardness24Hr: ['hardness24Hr540C', 'hardness_24hr_540c', 'hardness_24hr'],
    quenchingTemp: ['quenchingTempC', 'quenching_temp_c', 'quenching_temp'],
    quenchingTime: ['quenchingHoldingTime', 'quenching_holding_time', 'quenching_time'],
    quenchingMedium: ['quenching_medium', 'quench_medium'],
    temperingTemp: ['temperingTempC', 'tempering_temp_c', 'tempering_temp'],
    temperingTime: ['temperingHoldingTime', 'tempering_holding_time', 'tempering_time'],
    stressRelieved: ['stressRelievedC', 'stress_relieved_c', 'stress_relieved'],
    temperingResult: ['tempering_result'],
    impactJ: ['impact_j', 'impact1', 'impact'],
    avgImpactJ: ['avg_impact_j', 'avgImpact', 'averageImpactJ'],
    impactTemp: ['impactTempC', 'impact_temp_c', 'impact_temp'],
    pren: ['pren_val']
  };
  const aliases = aliasMap[key] || [];
  for (const a of aliases) {
    if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== '') {
      return String(row[a]);
    }
  }
  return '';
};

export const getMechSpecValue = (specObj: any, key: string): string => {
  if (!specObj) return '';
  if (specObj[key] !== undefined && specObj[key] !== null && String(specObj[key]).trim() !== '') {
    return String(specObj[key]);
  }
  const aliasMap: Record<string, string[]> = {
    yieldStrength: ['ysMpa', 'ysKsi', 'yieldStrengthMpa', 'yieldStrengthKsi', 'yield_strength', 'ys'],
    tensileStrength: ['utsMpa', 'utsKsi', 'tensileStrengthMpa', 'tensileStrengthKsi', 'tensile_strength', 'uts', 'ts'],
    elongation: ['elPct', 'elongationPct', 'el_pct', 'el'],
    reductionArea: ['raPct', 'reductionAreaPct', 'reductionOfArea', 'ra'],
    hardness: ['hardnessHrc', 'hardness_hrc', 'hardnessHbw', 'hardness_hbw'],
    hardnessHbw: ['hardness_hbw', 'hardness', 'hbw'],
    proofLoad: ['proofLoadLbf', 'proofLoadKn', 'proof_load_lbf', 'proof_load'],
    stressUnderProofload: ['stressUnderProofloadMpa', 'stress_under_proofload_mpa'],
    heatTreatment: ['heat_treatment', 'ht'],
    hardness24Hr: ['hardness24Hr540C', 'hardness_24hr_540c'],
    quenchingTemp: ['quenchingTempC', 'quenching_temp_c'],
    quenchingTime: ['quenchingHoldingTime', 'quenching_holding_time'],
    quenchingMedium: ['quenching_medium', 'quench_medium'],
    temperingTemp: ['temperingTempC', 'tempering_temp_c'],
    temperingTime: ['temperingHoldingTime', 'tempering_holding_time'],
    stressRelieved: ['stressRelievedC', 'stress_relieved_c'],
    temperingResult: ['tempering_result'],
    impactJ: ['impact_j', 'impact1', 'impact'],
    avgImpactJ: ['avg_impact_j', 'avgImpact'],
    impactTemp: ['impactTempC', 'impact_temp_c'],
    pren: ['pren_val']
  };
  const aliases = aliasMap[key] || [];
  for (const a of aliases) {
    if (specObj[a] !== undefined && specObj[a] !== null && String(specObj[a]).trim() !== '') {
      return String(specObj[a]);
    }
  }
  return '';
};

export interface MtcTemplate3CanvasProps {
  formData: QcReportRecord;
  setFormData: React.Dispatch<React.SetStateAction<QcReportRecord>>;
  isFullscreenEditor: boolean;
  onUploadLogo: (type: 'company' | 'iso' | 'engineer' | 'manager' | 'stamp', file: File) => void;
  onSaveAsset: (key: string, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string, index?: number) => void;
  onOpenExcelModal: (target: 'items' | 'chemical' | 'mechanical') => void;
  onPoOrInvoiceChange: (field: 'customerPoNum' | 'invoiceNum' | 'workOrderNum', value: string) => void;
  isSampleCert: (record: Partial<QcReportRecord>) => boolean;
  calculateTotalPages: (record: QcReportRecord) => number;
  formatChemVal: (val?: string | number) => string;
  DEFAULT_ISO_LOGO_URL: string;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const MtcTemplate3Canvas: React.FC<MtcTemplate3CanvasProps> = ({
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
  calculateTotalPages,
  formatChemVal,
  DEFAULT_ISO_LOGO_URL,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const activeCompany = getActiveCompany();
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [showChemColDrawer, setShowChemColDrawer] = useState(false);
  const [showMechColDrawer, setShowMechColDrawer] = useState(false);
  const [showSignStampDrawer, setShowSignStampDrawer] = useState(false);

  // Selected multi-cell ranges for Excel-like selection
  const [selectedItemCells, setSelectedItemCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [selectedChemCells, setSelectedChemCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [selectedMechCells, setSelectedMechCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);

  // Context menu state for row manipulation
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    table: 'items' | 'chemical' | 'mechanical';
    rowIndex: number;
  }>({ visible: false, x: 0, y: 0, table: 'items', rowIndex: -1 });

  // Initialize sheets array if empty with clean blank row (NO dummy data)
  useEffect(() => {
    if (!formData.sheets || formData.sheets.length === 0) {
      const initialItems: QcRecordItem[] = (formData.items && formData.items.length > 0)
        ? formData.items
        : [{
            id: 'item-1',
            itemNo: '1',
            description: '',
            size: '',
            material: '',
            standard: '',
            type: '',
            classSch: '',
            qty: '',
            finish: '',
            marking: '',
            heatNo: '',
            heatTreatment: '',
            ndePmi: '',
            remark: ''
          }];

      const initialChem: QcChemicalItem[] = (formData.chemicalData && formData.chemicalData.length > 0)
        ? formData.chemicalData
        : [{ itemNo: '1', heatNo: '', specType: 'L' }];

      const initialMech: QcMechanicalItem[] = (formData.mechanicalData && formData.mechanicalData.length > 0)
        ? formData.mechanicalData
        : [{ itemNo: '1', heatNo: '', specType: 'P' }];

      const initialSheet: MtcSheetData = {
        id: 'sheet-1',
        sheetNo: 1,
        title: 'SHEET 1',
        items: initialItems,
        chemicalData: initialChem,
        mechanicalData: initialMech
      };

      setFormData(prev => ({
        ...prev,
        sheets: [initialSheet]
      }));
    }
  }, [formData.sheets, setFormData]);

  // Current active sheet data
  const currentSheet: MtcSheetData = (formData.sheets && formData.sheets[activeSheetIndex]) || {
    id: 'sheet-1',
    sheetNo: activeSheetIndex + 1,
    title: `SHEET ${activeSheetIndex + 1}`,
    items: formData.items || [],
    chemicalData: formData.chemicalData || [],
    mechanicalData: formData.mechanicalData || []
  };

  const updateCurrentSheet = useCallback((updater: (sheet: MtcSheetData) => MtcSheetData) => {
    setFormData(prev => {
      const sheets = [...(prev.sheets || [])];
      if (sheets[activeSheetIndex]) {
        sheets[activeSheetIndex] = updater(sheets[activeSheetIndex]);
      } else {
        sheets[activeSheetIndex] = updater({
          id: `sheet-${activeSheetIndex + 1}`,
          sheetNo: activeSheetIndex + 1,
          title: `SHEET ${activeSheetIndex + 1}`,
          items: prev.items || [],
          chemicalData: prev.chemicalData || [],
          mechanicalData: prev.mechanicalData || []
        });
      }
      return {
        ...prev,
        sheets,
        items: activeSheetIndex === 0 ? sheets[0].items : prev.items,
        chemicalData: activeSheetIndex === 0 ? sheets[0].chemicalData : prev.chemicalData,
        mechanicalData: activeSheetIndex === 0 ? sheets[0].mechanicalData : prev.mechanicalData
      };
    });
  }, [activeSheetIndex, setFormData]);

  // Add a new clean sheet
  const handleAddSheet = () => {
    const newSheetNo = (formData.sheets?.length || 0) + 1;
    const prevCert = formData.sheets?.[(formData.sheets?.length || 1) - 1]?.certNo || formData.certNo || formData.certificateNum || formData.issueNo || '';
    const newCertNo = incrementCertNo(prevCert, 1);
    const newSheet: MtcSheetData = {
      id: `sheet-${Date.now()}`,
      sheetNo: newSheetNo,
      title: `SHEET ${newSheetNo}`,
      certNo: newCertNo,
      items: [{
        id: `item-${Date.now()}`,
        itemNo: '1',
        description: '',
        size: '',
        material: '',
        standard: '',
        type: '',
        classSch: '',
        qty: '',
        finish: '',
        marking: '',
        heatNo: '',
        heatTreatment: '',
        ndePmi: '',
        remark: ''
      }],
      chemicalData: [{ itemNo: '1', heatNo: '', specType: 'L' }],
      mechanicalData: [{ itemNo: '1', heatNo: '', specType: 'P' }]
    };

    setFormData(prev => ({
      ...prev,
      sheets: [...(prev.sheets || []), newSheet]
    }));
    setActiveSheetIndex((formData.sheets?.length || 1));
  };

  // Remove sheet
  const handleRemoveSheet = (index: number) => {
    if ((formData.sheets?.length || 0) <= 1) return;
    setFormData(prev => {
      const sheets = (prev.sheets || []).filter((_, i) => i !== index).map((s, idx) => ({
        ...s,
        sheetNo: idx + 1,
        title: s.title.startsWith('SHEET') ? `SHEET ${idx + 1}` : s.title
      }));
      return { ...prev, sheets };
    });
    if (activeSheetIndex >= index && activeSheetIndex > 0) {
      setActiveSheetIndex(activeSheetIndex - 1);
    }
  };

  // Duplicate sheet
  const handleDuplicateSheet = (index: number) => {
    const sheetToDup = formData.sheets?.[index];
    if (!sheetToDup) return;
    const newSheetNo = (formData.sheets?.length || 0) + 1;
    const prevCert = sheetToDup.certNo || formData.certNo || formData.certificateNum || formData.issueNo || '';
    const newCertNo = incrementCertNo(prevCert, 1);
    const newSheet: MtcSheetData = {
      ...sheetToDup,
      id: `sheet-${Date.now()}`,
      sheetNo: newSheetNo,
      title: `SHEET ${newSheetNo}`,
      certNo: newCertNo,
      items: (sheetToDup.items || []).map(it => ({ ...it, id: `item-${Date.now()}-${Math.random()}` })),
      chemicalData: (sheetToDup.chemicalData || []).map(c => ({ ...c })),
      mechanicalData: (sheetToDup.mechanicalData || []).map(m => ({ ...m }))
    };

    setFormData(prev => {
      const sheets = [...(prev.sheets || [])];
      sheets.splice(index + 1, 0, newSheet);
      return {
        ...prev,
        sheets: sheets.map((s, idx) => ({ ...s, sheetNo: idx + 1 }))
      };
    });
    setActiveSheetIndex(index + 1);
  };

  // Row operations for active sheet
  const addRowToCurrentSheet = () => {
    updateCurrentSheet(sheet => {
      const items = [...(sheet.items || [])];
      const chem = [...(sheet.chemicalData || [])];
      const mech = [...(sheet.mechanicalData || [])];
      const newIdx = items.length + 1;

      items.push({
        id: `item-${Date.now()}`,
        itemNo: String(newIdx),
        description: '',
        size: '',
        material: '',
        standard: '',
        type: '',
        classSch: '',
        qty: '',
        finish: '',
        marking: '',
        heatNo: '',
        heatTreatment: '',
        ndePmi: '',
        remark: ''
      });

      chem.push({ itemNo: String(newIdx), heatNo: '', specType: 'L' });
      mech.push({ itemNo: String(newIdx), heatNo: '', specType: 'P' });

      return { ...sheet, items, chemicalData: chem, mechanicalData: mech };
    });
  };

  const removeRowFromCurrentSheet = (idx: number) => {
    updateCurrentSheet(sheet => {
      if ((sheet.items?.length || 0) <= 1) {
        return {
          ...sheet,
          items: [{
            id: `item-${Date.now()}`,
            itemNo: '1',
            description: '',
            size: '',
            material: '',
            standard: '',
            type: '',
            classSch: '',
            qty: '',
            finish: '',
            marking: '',
            heatNo: '',
            heatTreatment: '',
            ndePmi: '',
            remark: ''
          }],
          chemicalData: [{ itemNo: '1', heatNo: '', specType: 'L' }],
          mechanicalData: [{ itemNo: '1', heatNo: '', specType: 'P' }]
        };
      }

      const items = sheet.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, itemNo: String(i + 1) }));
      const chem = (sheet.chemicalData || []).filter((_, i) => i !== idx).map((c, i) => ({ ...c, itemNo: String(i + 1) }));
      const mech = (sheet.mechanicalData || []).filter((_, i) => i !== idx).map((m, i) => ({ ...m, itemNo: String(i + 1) }));

      return { ...sheet, items, chemicalData: chem, mechanicalData: mech };
    });
  };

  const insertRowAt = (idx: number, position: 'above' | 'below') => {
    updateCurrentSheet(sheet => {
      const items = [...(sheet.items || [])];
      const chem = [...(sheet.chemicalData || [])];
      const mech = [...(sheet.mechanicalData || [])];
      const targetIdx = position === 'above' ? idx : idx + 1;

      const newItem: QcRecordItem = {
        id: `item-${Date.now()}`,
        itemNo: '',
        description: '',
        size: '',
        material: '',
        standard: '',
        type: '',
        classSch: '',
        qty: '',
        finish: '',
        marking: '',
        heatNo: '',
        heatTreatment: '',
        ndePmi: '',
        remark: ''
      };

      items.splice(targetIdx, 0, newItem);
      chem.splice(targetIdx, 0, { itemNo: '', heatNo: '', specType: 'L' });
      mech.splice(targetIdx, 0, { itemNo: '', heatNo: '', specType: 'P' });

      return {
        ...sheet,
        items: items.map((it, i) => ({ ...it, itemNo: String(i + 1) })),
        chemicalData: chem.map((c, i) => ({ ...c, itemNo: String(i + 1) })),
        mechanicalData: mech.map((m, i) => ({ ...m, itemNo: String(i + 1) }))
      };
    });
    setContextMenu({ visible: false, x: 0, y: 0, table: 'items', rowIndex: -1 });
  };

  const duplicateRowAt = (idx: number) => {
    updateCurrentSheet(sheet => {
      const items = [...(sheet.items || [])];
      const chem = [...(sheet.chemicalData || [])];
      const mech = [...(sheet.mechanicalData || [])];

      if (items[idx]) {
        items.splice(idx + 1, 0, { ...items[idx], id: `item-${Date.now()}` });
      }
      if (chem[idx]) {
        chem.splice(idx + 1, 0, { ...chem[idx] });
      }
      if (mech[idx]) {
        mech.splice(idx + 1, 0, { ...mech[idx] });
      }

      return {
        ...sheet,
        items: items.map((it, i) => ({ ...it, itemNo: String(i + 1) })),
        chemicalData: chem.map((c, i) => ({ ...c, itemNo: String(i + 1) })),
        mechanicalData: mech.map((m, i) => ({ ...m, itemNo: String(i + 1) }))
      };
    });
    setContextMenu({ visible: false, x: 0, y: 0, table: 'items', rowIndex: -1 });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  // Marking image upload & delete handlers
  const handleMarkingImageUpload = (rowIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.items || [])];
        if (updated[rowIdx]) {
          updated[rowIdx] = { ...updated[rowIdx], markingImage: dataUrl };
        }
        return { ...sheet, items: updated };
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeMarkingImage = (rowIdx: number) => {
    updateCurrentSheet(sheet => {
      const updated = [...(sheet.items || [])];
      if (updated[rowIdx]) {
        updated[rowIdx] = { ...updated[rowIdx], markingImage: undefined };
      }
      return { ...sheet, items: updated };
    });
  };

  // Column keys for Product description
  const t3ItemCols = ['description', 'size', 'standard', 'qty', 'finish', 'marking', 'heatNo'];

  const isItemCellSelected = (r: number, c: number) => {
    if (!selectedItemCells) return false;
    const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
    const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
    const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
    const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const focusT3ItemCell = (rowIdx: number, colKey: string) => {
    const el = document.getElementById(`t3-item-${rowIdx}-${colKey}`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.select();
      }
    }
  };

  // Keyboard navigation, Shift+Arrows selection, Ctrl+D fill down, Delete for Items Table
  const handleT3ItemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIdx: number,
    colKey: string
  ) => {
    e.stopPropagation();
    const colIdx = t3ItemCols.indexOf(colKey);
    const items = currentSheet.items || [];

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedItemCells(null);
      return;
    }

    // CTRL+D / CMD+D: Fill Down from cell or row above
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.items || [])];
        if (selectedItemCells) {
          const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
          const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
          const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
          const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);

          if (minR === maxR && minR > 0) {
            const src = updated[minR - 1];
            const tgt = { ...updated[minR] };
            for (let c = minC; c <= maxC; c++) {
              const k = t3ItemCols[c];
              if (k) (tgt as any)[k] = (src as any)[k];
            }
            updated[minR] = tgt;
          } else if (maxR > minR) {
            const src = updated[minR];
            for (let r = minR + 1; r <= maxR; r++) {
              const tgt = { ...updated[r] };
              for (let c = minC; c <= maxC; c++) {
                const k = t3ItemCols[c];
                if (k) (tgt as any)[k] = (src as any)[k];
              }
              updated[r] = tgt;
            }
          }
        } else if (rowIdx > 0) {
          const src = updated[rowIdx - 1];
          const tgt = { ...updated[rowIdx] };
          (tgt as any)[colKey] = (src as any)[colKey];
          updated[rowIdx] = tgt;
        }
        return { ...sheet, items: updated };
      });
      return;
    }

    // CTRL+C: Copy TSV
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      if (selectedItemCells) {
        const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
        const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
        const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
        const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);
        const lines: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const k = t3ItemCols[c];
            rowVals.push(k ? String((items[r] as any)?.[k] || '') : '');
          }
          lines.push(rowVals.join('\t'));
        }
        navigator.clipboard.writeText(lines.join('\n'));
      }
      return;
    }

    // Delete / Backspace when multiple cells are selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemCells && 
        (selectedItemCells.startRow !== selectedItemCells.endRow || selectedItemCells.startCol !== selectedItemCells.endCol)) {
      e.preventDefault();
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.items || [])];
        const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
        const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
        const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
        const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);
        for (let r = minR; r <= maxR; r++) {
          if (updated[r]) {
            const tgt = { ...updated[r] };
            for (let c = minC; c <= maxC; c++) {
              const k = t3ItemCols[c];
              if (k) (tgt as any)[k] = '';
            }
            updated[r] = tgt;
          }
        }
        return { ...sheet, items: updated };
      });
      return;
    }

    // SHIFT + ARROWS: Multi-cell range selection
    if (e.shiftKey) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const curSel = selectedItemCells || { startRow: rowIdx, startCol: colIdx, endRow: rowIdx, endCol: colIdx };
        let newEndRow = curSel.endRow;
        let newEndCol = curSel.endCol;

        if (e.key === 'ArrowUp' && newEndRow > 0) newEndRow--;
        if (e.key === 'ArrowDown' && newEndRow < items.length - 1) newEndRow++;
        if (e.key === 'ArrowLeft' && newEndCol > 0) newEndCol--;
        if (e.key === 'ArrowRight' && newEndCol < t3ItemCols.length - 1) newEndCol++;

        setSelectedItemCells({
          startRow: curSel.startRow,
          startCol: curSel.startCol,
          endRow: newEndRow,
          endCol: newEndCol
        });
        return;
      }
    }

    // Plain Arrow Keys Navigation
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === 'ArrowDown' && rowIdx < items.length - 1) {
        e.preventDefault();
        setSelectedItemCells(null);
        focusT3ItemCell(rowIdx + 1, colKey);
        return;
      }
      if (e.key === 'ArrowUp' && rowIdx > 0) {
        e.preventDefault();
        setSelectedItemCells(null);
        focusT3ItemCell(rowIdx - 1, colKey);
        return;
      }
      if (e.key === 'ArrowRight' && colIdx < t3ItemCols.length - 1) {
        const inputEl = e.currentTarget;
        if (inputEl.selectionStart === inputEl.value.length) {
          e.preventDefault();
          setSelectedItemCells(null);
          focusT3ItemCell(rowIdx, t3ItemCols[colIdx + 1]);
          return;
        }
      }
      if (e.key === 'ArrowLeft' && colIdx > 0) {
        const inputEl = e.currentTarget;
        if (inputEl.selectionStart === 0) {
          e.preventDefault();
          setSelectedItemCells(null);
          focusT3ItemCell(rowIdx, t3ItemCols[colIdx - 1]);
          return;
        }
      }
    }

    // Enter / Tab Navigation
    if (e.key === 'Enter') {
      e.preventDefault();
      setSelectedItemCells(null);
      if (e.shiftKey) {
        if (colIdx > 0) {
          focusT3ItemCell(rowIdx, t3ItemCols[colIdx - 1]);
        } else if (rowIdx > 0) {
          focusT3ItemCell(rowIdx - 1, t3ItemCols[t3ItemCols.length - 1]);
        }
      } else {
        // Move to the right cell, or move to the next row (2nd row, etc.) if at the end
        if (colIdx < t3ItemCols.length - 1) {
          focusT3ItemCell(rowIdx, t3ItemCols[colIdx + 1]);
        } else {
          if (rowIdx < items.length - 1) {
            focusT3ItemCell(rowIdx + 1, t3ItemCols[0]);
          } else {
            addRowToCurrentSheet();
            setTimeout(() => focusT3ItemCell(rowIdx + 1, t3ItemCols[0]), 50);
          }
        }
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      if (colIdx === t3ItemCols.length - 1 && rowIdx < items.length - 1) {
        e.preventDefault();
        setSelectedItemCells(null);
        focusT3ItemCell(rowIdx + 1, t3ItemCols[0]);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      if (colIdx === 0 && rowIdx > 0) {
        e.preventDefault();
        setSelectedItemCells(null);
        focusT3ItemCell(rowIdx - 1, t3ItemCols[t3ItemCols.length - 1]);
      }
    }
  };

  // TSV Paste handler for Item table
  const handleT3ItemPaste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\t') && !text.includes('\n') && !selectedItemCells) return;
    e.preventDefault();

    const startColIdx = t3ItemCols.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));

    updateCurrentSheet(sheet => {
      const items = [...(sheet.items || [])];
      const chem = [...(sheet.chemicalData || [])];
      const mech = [...(sheet.mechanicalData || [])];

      rows.forEach((rowStr, rOffset) => {
        const targetR = startRow + rOffset;
        while (items.length <= targetR) {
          const rIdx = items.length;
          items.push({
            id: `item-${Date.now()}-${rIdx}`,
            itemNo: String(rIdx + 1),
            description: '',
            size: '',
            material: '',
            standard: '',
            type: '',
            classSch: '',
            qty: '',
            finish: '',
            marking: '',
            heatNo: '',
            heatTreatment: '',
            ndePmi: '',
            remark: ''
          });
          chem.push({ itemNo: String(rIdx + 1), heatNo: '', specType: 'L' });
          mech.push({ itemNo: String(rIdx + 1), heatNo: '', specType: 'P' });
        }

        const cols = rowStr.split('\t');
        cols.forEach((val, cOffset) => {
          const targetC = startColIdx + cOffset;
          if (targetC < t3ItemCols.length) {
            const colName = t3ItemCols[targetC];
            (items[targetR] as any)[colName] = (val || '').trim();
            if (colName === 'standard') {
              items[targetR].material = (val || '').trim();
            }
            if (colName === 'heatNo') {
              if (chem[targetR]) chem[targetR].heatNo = (val || '').trim();
              if (mech[targetR]) mech[targetR].heatNo = (val || '').trim();
            }
          }
        });
      });

      return { ...sheet, items, chemicalData: chem, mechanicalData: mech };
    });
  };

  // Chemical & Mechanical columns definitions
  const overrides = formData.chemHeaderOverrides || {};
  const activeChemCols: Array<{ k: keyof QcChemicalItem; label: string }> = [
    { k: 'c', label: overrides.c || '%C' },
    { k: 'si', label: overrides.si || '%Si' },
    { k: 'mn', label: overrides.mn || '%Mn' },
    { k: 'p', label: overrides.p || '%P' },
    { k: 's', label: overrides.s || '%S' },
    { k: 'cr', label: overrides.cr || '%Cr' },
    { k: 'ni', label: overrides.ni || '%Ni' },
    { k: 'mo', label: overrides.mo || '%Mo' },
    { k: 'cu', label: overrides.cu || '%Cu' },
    { k: 'v', label: overrides.v || '%V' },
    { k: 'n', label: overrides.n || '%N' },
    { k: 'al', label: overrides.al || '%Al' },
    { k: 'ti', label: overrides.ti || '%Ti' },
    { k: 'b', label: overrides.b || '%B' }
  ];
  if (formData.showColPb !== undefined ? formData.showColPb : false) activeChemCols.push({ k: 'pb', label: overrides.pb || '%Pb' });
  if (formData.showColZn !== undefined ? formData.showColZn : false) activeChemCols.push({ k: 'zn', label: overrides.zn || '%Zn' });
  if (formData.showColFe !== undefined ? formData.showColFe : false) activeChemCols.push({ k: 'fe', label: overrides.fe || '%Fe' });
  if (formData.showColSn !== undefined ? formData.showColSn : false) activeChemCols.push({ k: 'sn', label: overrides.sn || '%Sn' });
  if (formData.showImpurity) activeChemCols.push({ k: 'totalImpurity', label: overrides.totalImpurity || 'Impurity' });
  if (formData.showOther) activeChemCols.push({ k: 'other', label: overrides.other || 'Other' });

  const defaultMechLabels: Record<string, string> = {
    tsMpa: 'TENSILE STRENGTH (UTS)',
    ysMpa: 'YIELD STRENGTH (YS)',
    elPct: 'ELONGATION (EL)',
    raPct: 'REDUCTION OF AREA (RA)',
    proofLoadLbf: 'PROOFLOAD',
    hardness: 'HARDNESS',
    stressUnderProofloadMpa: 'STRESS UNDER PROOFLOAD',
    heatTreatment: 'HEAT TREATMENT',
    hardness24Hr540C: 'HARDNESS AFTER TREATMENT',
    quenchingTempC: 'QUENCHING TEMP',
    quenchingHoldingTime: 'HOLDING TIME (QUENCH)',
    quenchingMedium: 'QUENCHING MEDIUM',
    temperingTempC: 'TEMPER TEMP',
    temperingHoldingTime: 'HOLDING TIME (TEMPER)',
    stressRelievedC: 'STRESS RELIEVED',
    temperingResult: 'TEMPER',
    impactJ: 'IMPACT IN J',
    avgImpactJ: 'AVERAGE IMPACT IN J',
    impactTempC: 'IMPACT TEST TEMP',
    pren: 'PREN'
  };

  const getMechColLabel = (key: string, customOrLegacyLabel?: string) => {
    if (formData.mechHeaderOverrides?.[key]) {
      return formData.mechHeaderOverrides[key];
    }
    if (customOrLegacyLabel && !['Y.S (Mpa)', 'T.S (Mpa)', 'EL (%)', 'R.A (%)', 'Elongation El-(%)', 'Hardness', 'Proof Load', 'Proofload Lbf'].includes(customOrLegacyLabel)) {
      return customOrLegacyLabel;
    }
    return defaultMechLabels[key] || customOrLegacyLabel || key.toUpperCase();
  };

  const activeMechCols: Array<{ k: string; label: string }> = [
    { k: 'tsMpa', label: getMechColLabel('tsMpa', formData.labelTensile) },
    { k: 'ysMpa', label: getMechColLabel('ysMpa', formData.labelYield) },
    { k: 'elPct', label: getMechColLabel('elPct', formData.labelElongation) },
    { k: 'raPct', label: getMechColLabel('raPct', formData.labelReduction) },
  ];
  if (formData.showColProofLoad !== false) {
    activeMechCols.push({ k: 'proofLoadLbf', label: getMechColLabel('proofLoadLbf', formData.labelProofLoad) });
  }
  activeMechCols.push({ k: 'hardness', label: getMechColLabel('hardness', formData.labelHardness) });
  if (formData.showColStressUnderProofload ?? false) activeMechCols.push({ k: 'stressUnderProofloadMpa', label: getMechColLabel('stressUnderProofloadMpa', formData.labelStressUnderProofload) });
  if (formData.showColHeatTreatment ?? false) activeMechCols.push({ k: 'heatTreatment', label: getMechColLabel('heatTreatment', formData.labelHeatTreatment) });
  if (formData.showColHardness24Hr ?? false) activeMechCols.push({ k: 'hardness24Hr540C', label: getMechColLabel('hardness24Hr540C', formData.labelHardness24Hr) });
  if (formData.showColQuenchingTemp ?? false) activeMechCols.push({ k: 'quenchingTempC', label: getMechColLabel('quenchingTempC', formData.labelQuenchingTemp) });
  if (formData.showColQuenchingTime ?? false) activeMechCols.push({ k: 'quenchingHoldingTime', label: getMechColLabel('quenchingHoldingTime', formData.labelQuenchingTime) });
  if (formData.showColQuenchingMedium ?? false) activeMechCols.push({ k: 'quenchingMedium', label: getMechColLabel('quenchingMedium', formData.labelQuenchingMedium) });
  if (formData.showColTemperingTemp ?? false) activeMechCols.push({ k: 'temperingTempC', label: getMechColLabel('temperingTempC', formData.labelTemperingTemp) });
  if (formData.showColTemperingTime ?? false) activeMechCols.push({ k: 'temperingHoldingTime', label: getMechColLabel('temperingHoldingTime', formData.labelTemperingTime) });
  if (formData.showColStressRelieved ?? false) activeMechCols.push({ k: 'stressRelievedC', label: getMechColLabel('stressRelievedC', formData.labelStressRelieved) });
  if (formData.showColTemperingResult ?? false) activeMechCols.push({ k: 'temperingResult', label: getMechColLabel('temperingResult', formData.labelTemperingResult) });
  if (formData.showColImpactJ ?? false) activeMechCols.push({ k: 'impactJ', label: getMechColLabel('impactJ', formData.labelImpactJ) });
  if (formData.showColAvgImpactJ ?? false) activeMechCols.push({ k: 'avgImpactJ', label: getMechColLabel('avgImpactJ', formData.labelAvgImpactJ) });
  if (formData.showColImpactTemp ?? false) activeMechCols.push({ k: 'impactTempC', label: getMechColLabel('impactTempC', formData.labelImpactTemp) });
  if (formData.showColPren ?? false) activeMechCols.push({ k: 'pren', label: getMechColLabel('pren', formData.labelPren) });

  // Update Chem and Mech Spec Min/Max
  const updateChemSpec = (type: 'min' | 'max', key: string, value: string) => {
    updateCurrentSheet(sheet => {
      const field = type === 'min' ? 'chemSpecMin' : 'chemSpecMax';
      const currentSpec = { ...(sheet[field] || (type === 'min' ? formData.chemSpecMin : formData.chemSpecMax) || {}) };
      currentSpec[key] = value;
      return {
        ...sheet,
        [field]: currentSpec
      };
    });
    setFormData(prev => {
      const field = type === 'min' ? 'chemSpecMin' : 'chemSpecMax';
      const currentSpec = { ...(prev[field] || {}) };
      currentSpec[key] = value;
      return {
        ...prev,
        [field]: currentSpec
      };
    });
  };

  const updateMechSpec = (type: 'min' | 'max', key: string, value: string) => {
    updateCurrentSheet(sheet => {
      const field = type === 'min' ? 'mechSpecMin' : 'mechSpecMax';
      const currentSpec = { ...(sheet[field] || (type === 'min' ? formData.mechSpecMin : formData.mechSpecMax) || {}) };
      currentSpec[key] = value;
      return {
        ...sheet,
        [field]: currentSpec
      };
    });
    setFormData(prev => {
      const field = type === 'min' ? 'mechSpecMin' : 'mechSpecMax';
      const currentSpec = { ...(prev[field] || {}) };
      currentSpec[key] = value;
      return {
        ...prev,
        [field]: currentSpec
      };
    });
  };

  const updateChemUnit = (key: string, value: string) => {
    updateCurrentSheet(sheet => {
      const currentUnits = { ...(sheet.chemUnits || formData.chemUnits || {}) };
      currentUnits[key] = value;
      return {
        ...sheet,
        chemUnits: currentUnits
      };
    });
    setFormData(prev => {
      const currentUnits = { ...(prev.chemUnits || {}) };
      currentUnits[key] = value;
      return {
        ...prev,
        chemUnits: currentUnits
      };
    });
  };

  // Chemical Table Selection & Excel Helpers
  const isChemCellSelected = (r: number, c: number) => {
    if (!selectedChemCells) return false;
    const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
    const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
    const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
    const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const focusT3ChemCell = (rowIdx: number, colKey: string) => {
    const el = document.getElementById(`t3-chem-${rowIdx}-${colKey}`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    }
  };

  const handleT3ChemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colKey: string
  ) => {
    e.stopPropagation();
    const colList = ['heatNo', ...activeChemCols.map(c => c.k as string)];
    const colIdx = colList.indexOf(colKey);
    const chemData = currentSheet.chemicalData || [];

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedChemCells(null);
      return;
    }

    // Ctrl+D Fill Down
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.chemicalData || [])];
        if (selectedChemCells) {
          const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
          const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
          const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
          const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);

          if (minR === maxR && minR > 0) {
            const src = updated[minR - 1];
            const tgt = { ...updated[minR] };
            for (let c = minC; c <= maxC; c++) {
              const k = colList[c];
              if (k) (tgt as any)[k] = (src as any)[k];
            }
            updated[minR] = tgt;
          } else if (maxR > minR) {
            const src = updated[minR];
            for (let r = minR + 1; r <= maxR; r++) {
              const tgt = { ...updated[r] };
              for (let c = minC; c <= maxC; c++) {
                const k = colList[c];
                if (k) (tgt as any)[k] = (src as any)[k];
              }
              updated[r] = tgt;
            }
          }
        } else if (rowIdx > 0) {
          const src = updated[rowIdx - 1];
          const tgt = { ...updated[rowIdx] };
          (tgt as any)[colKey] = (src as any)[colKey];
          updated[rowIdx] = tgt;
        }
        return { ...sheet, chemicalData: updated };
      });
      return;
    }

    // Ctrl+C Copy TSV
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      if (selectedChemCells) {
        const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
        const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
        const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
        const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);
        const lines: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const k = colList[c];
            rowVals.push(k ? String((chemData[r] as any)?.[k] || '') : '');
          }
          lines.push(rowVals.join('\t'));
        }
        navigator.clipboard.writeText(lines.join('\n'));
      }
      return;
    }

    // Delete / Backspace range
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedChemCells &&
        (selectedChemCells.startRow !== selectedChemCells.endRow || selectedChemCells.startCol !== selectedChemCells.endCol)) {
      e.preventDefault();
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.chemicalData || [])];
        const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
        const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
        const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
        const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);
        for (let r = minR; r <= maxR; r++) {
          if (updated[r]) {
            const tgt = { ...updated[r] };
            for (let c = minC; c <= maxC; c++) {
              const k = colList[c];
              if (k) (tgt as any)[k] = '';
            }
            updated[r] = tgt;
          }
        }
        return { ...sheet, chemicalData: updated };
      });
      return;
    }

    // Shift + Arrows Multi-cell range selection
    if (e.shiftKey) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const curSel = selectedChemCells || { startRow: rowIdx, startCol: colIdx, endRow: rowIdx, endCol: colIdx };
        let newEndRow = curSel.endRow;
        let newEndCol = curSel.endCol;

        if (e.key === 'ArrowUp' && newEndRow > 0) newEndRow--;
        if (e.key === 'ArrowDown' && newEndRow < chemData.length - 1) newEndRow++;
        if (e.key === 'ArrowLeft' && newEndCol > 0) newEndCol--;
        if (e.key === 'ArrowRight' && newEndCol < colList.length - 1) newEndCol++;

        setSelectedChemCells({
          startRow: curSel.startRow,
          startCol: curSel.startCol,
          endRow: newEndRow,
          endCol: newEndCol
        });
        return;
      }
    }

    // Arrow navigation
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === 'ArrowDown' && rowIdx < chemData.length - 1) {
        e.preventDefault();
        setSelectedChemCells(null);
        focusT3ChemCell(rowIdx + 1, colKey);
        return;
      }
      if (e.key === 'ArrowUp' && rowIdx > 0) {
        e.preventDefault();
        setSelectedChemCells(null);
        focusT3ChemCell(rowIdx - 1, colKey);
        return;
      }
      if (e.key === 'ArrowRight' && colIdx < colList.length - 1) {
        const inputEl = e.currentTarget;
        if (inputEl.selectionStart === inputEl.value.length) {
          e.preventDefault();
          setSelectedChemCells(null);
          focusT3ChemCell(rowIdx, colList[colIdx + 1]);
          return;
        }
      }
      if (e.key === 'ArrowLeft' && colIdx > 0) {
        const inputEl = e.currentTarget;
        if (inputEl.selectionStart === 0) {
          e.preventDefault();
          setSelectedChemCells(null);
          focusT3ChemCell(rowIdx, colList[colIdx - 1]);
          return;
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedChemCells(null);
        if (colKey !== 'heatNo') {
          updateCurrentSheet(sheet => {
            const updated = [...(sheet.chemicalData || [])];
            if (updated[rowIdx]) {
              const raw = (updated[rowIdx] as any)[colKey];
              (updated[rowIdx] as any)[colKey] = formatChemVal(raw);
            }
            return { ...sheet, chemicalData: updated };
          });
        }
        if (rowIdx < chemData.length - 1) {
          focusT3ChemCell(rowIdx + 1, colKey);
        }
      }
    }
  };

  const handleT3ChemPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\t') && !text.includes('\n') && !selectedChemCells) return;
    e.preventDefault();

    const colList = ['heatNo', ...activeChemCols.map(c => c.k as string)];
    const startColIdx = colList.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));

    updateCurrentSheet(sheet => {
      const chem = [...(sheet.chemicalData || [])];
      rows.forEach((rowStr, rOffset) => {
        const targetR = startRow + rOffset;
        while (chem.length <= targetR) {
          const rIdx = chem.length;
          chem.push({ itemNo: String(rIdx + 1), heatNo: '', specType: 'L' });
        }
        const cols = rowStr.split('\t');
        cols.forEach((val, cOffset) => {
          const targetC = startColIdx + cOffset;
          if (targetC < colList.length) {
            const colName = colList[targetC];
            (chem[targetR] as any)[colName] = (val || '').trim();
          }
        });
      });
      return { ...sheet, chemicalData: chem };
    });
  };

  // Mechanical Table Selection & Excel Helpers
  const isMechCellSelected = (r: number, c: number) => {
    if (!selectedMechCells) return false;
    const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
    const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
    const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
    const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  const focusT3MechCell = (rowIdx: number, colKey: string) => {
    const el = document.getElementById(`t3-mech-${rowIdx}-${colKey}`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    }
  };

  const handleT3MechKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colKey: string
  ) => {
    e.stopPropagation();
    const colList = ['heatNo', ...activeMechCols.map(c => c.k)];
    const colIdx = colList.indexOf(colKey);
    const mechData = currentSheet.mechanicalData || [];

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedMechCells(null);
      return;
    }

    // Ctrl+D Fill Down
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.mechanicalData || [])];
        if (selectedMechCells) {
          const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
          const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
          const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
          const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);

          if (minR === maxR && minR > 0) {
            const src = updated[minR - 1];
            const tgt = { ...updated[minR] };
            for (let c = minC; c <= maxC; c++) {
              const k = colList[c];
              if (k) (tgt as any)[k] = (src as any)[k];
            }
            updated[minR] = tgt;
          } else if (maxR > minR) {
            const src = updated[minR];
            for (let r = minR + 1; r <= maxR; r++) {
              const tgt = { ...updated[r] };
              for (let c = minC; c <= maxC; c++) {
                const k = colList[c];
                if (k) (tgt as any)[k] = (src as any)[k];
              }
              updated[r] = tgt;
            }
          }
        } else if (rowIdx > 0) {
          const src = updated[rowIdx - 1];
          const tgt = { ...updated[rowIdx] };
          (tgt as any)[colKey] = (src as any)[colKey];
          updated[rowIdx] = tgt;
        }
        return { ...sheet, mechanicalData: updated };
      });
      return;
    }

    // Ctrl+C Copy TSV
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      if (selectedMechCells) {
        const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
        const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
        const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
        const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);
        const lines: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const k = colList[c];
            rowVals.push(k ? String((mechData[r] as any)?.[k] || '') : '');
          }
          lines.push(rowVals.join('\t'));
        }
        navigator.clipboard.writeText(lines.join('\n'));
      }
      return;
    }

    // Delete / Backspace range
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedMechCells &&
        (selectedMechCells.startRow !== selectedMechCells.endRow || selectedMechCells.startCol !== selectedMechCells.endCol)) {
      e.preventDefault();
      updateCurrentSheet(sheet => {
        const updated = [...(sheet.mechanicalData || [])];
        const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
        const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
        const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
        const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);
        for (let r = minR; r <= maxR; r++) {
          if (updated[r]) {
            const tgt = { ...updated[r] };
            for (let c = minC; c <= maxC; c++) {
              const k = colList[c];
              if (k) (tgt as any)[k] = '';
            }
            updated[r] = tgt;
          }
        }
        return { ...sheet, mechanicalData: updated };
      });
      return;
    }

    // Shift + Arrows Multi-cell range selection
    if (e.shiftKey) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const curSel = selectedMechCells || { startRow: rowIdx, startCol: colIdx, endRow: rowIdx, endCol: colIdx };
        let newEndRow = curSel.endRow;
        let newEndCol = curSel.endCol;

        if (e.key === 'ArrowUp' && newEndRow > 0) newEndRow--;
        if (e.key === 'ArrowDown' && newEndRow < mechData.length - 1) newEndRow++;
        if (e.key === 'ArrowLeft' && newEndCol > 0) newEndCol--;
        if (e.key === 'ArrowRight' && newEndCol < colList.length - 1) newEndCol++;

        setSelectedMechCells({
          startRow: curSel.startRow,
          startCol: curSel.startCol,
          endRow: newEndRow,
          endCol: newEndCol
        });
        return;
      }
    }

    // Arrow navigation
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === 'ArrowDown' && rowIdx < mechData.length - 1) {
        e.preventDefault();
        setSelectedMechCells(null);
        focusT3MechCell(rowIdx + 1, colKey);
        return;
      }
      if (e.key === 'ArrowUp' && rowIdx > 0) {
        e.preventDefault();
        setSelectedMechCells(null);
        focusT3MechCell(rowIdx - 1, colKey);
        return;
      }
      if (e.key === 'ArrowRight' && colIdx < colList.length - 1) {
        const inputEl = e.currentTarget;
        if (inputEl.selectionStart === inputEl.value.length) {
          e.preventDefault();
          setSelectedMechCells(null);
          focusT3MechCell(rowIdx, colList[colIdx + 1]);
          return;
        }
      }
      if (e.key === 'ArrowLeft' && colIdx > 0) {
        const inputEl = e.currentTarget;
        if (inputEl.selectionStart === 0) {
          e.preventDefault();
          setSelectedMechCells(null);
          focusT3MechCell(rowIdx, colList[colIdx - 1]);
          return;
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMechCells(null);
        if (colKey !== 'heatNo') {
          updateCurrentSheet(sheet => {
            const updated = [...(sheet.mechanicalData || [])];
            if (updated[rowIdx]) {
              const raw = (updated[rowIdx] as any)[colKey];
              (updated[rowIdx] as any)[colKey] = formatNumericVal(raw);
            }
            return { ...sheet, mechanicalData: updated };
          });
        }
        if (rowIdx < mechData.length - 1) {
          focusT3MechCell(rowIdx + 1, colKey);
        }
      }
    }
  };

  const handleT3MechPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\t') && !text.includes('\n') && !selectedMechCells) return;
    e.preventDefault();

    const colList = ['heatNo', ...activeMechCols.map(c => c.k)];
    const startColIdx = colList.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));

    updateCurrentSheet(sheet => {
      const mech = [...(sheet.mechanicalData || [])];
      rows.forEach((rowStr, rOffset) => {
        const targetR = startRow + rOffset;
        while (mech.length <= targetR) {
          const rIdx = mech.length;
          mech.push({ itemNo: String(rIdx + 1), heatNo: '', specType: 'P' });
        }
        const cols = rowStr.split('\t');
        cols.forEach((val, cOffset) => {
          const targetC = startColIdx + cOffset;
          if (targetC < colList.length) {
            const colName = colList[targetC];
            (mech[targetR] as any)[colName] = (val || '').trim();
          }
        });
      });
      return { ...sheet, mechanicalData: mech };
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* 1. TOP TOOLBAR FOR MULTI-SHEET MTC 3 & EXCEL TOOLS */}
      <div className="w-full mb-2 flex flex-wrap items-center justify-between gap-2 bg-slate-100/95 border border-slate-300 px-3 py-2 rounded-lg text-xs print:hidden">
        {/* Multi-Sheet Tabs: CLEAN "SHEET 1", "SHEET 2", etc. (NO "9 rows" text) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-300 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-indigo-600 ml-1 mr-0.5" />
          {(formData.sheets || []).map((sheet, sIdx) => {
            const isActive = activeSheetIndex === sIdx;
            return (
              <div 
                key={sheet.id || sIdx} 
                className={`flex items-center rounded text-xs transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveSheetIndex(sIdx)}
                  className="px-2.5 py-1 text-[11px] tracking-wide uppercase cursor-pointer"
                >
                  SHEET {sIdx + 1}
                </button>
                {(formData.sheets?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSheet(sIdx);
                    }}
                    className={`p-0.5 mr-1 rounded hover:bg-rose-500 hover:text-white transition-colors ${
                      isActive ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                    title="Remove Sheet"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={handleAddSheet}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold cursor-pointer transition-all ml-1"
            title="Add New Sheet"
          >
            <Plus className="w-3 h-3" />
            <span>Add Sheet</span>
          </button>
        </div>

        {/* Excel features helper notice */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <span>Excel controls: <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] text-slate-700">Shift+Arrows</kbd> range | <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] text-slate-700">Ctrl+D</kbd> fill down | <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] text-slate-700">Ctrl+C/V</kbd></span>
        </div>
      </div>

      {/* 2. THE MAIN CANVAS CONTAINER */}
      <div 
        className="w-full border-2 border-black p-3.5 space-y-2 bg-white text-black font-sans transition-all relative shadow-none"
        style={{ fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", boxShadow: 'none' }}
      >
        {/* CONDITIONAL SAMPLE MTC WATERMARK IN EDITOR */}
        {isSampleCert(formData) && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
            <div 
              className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-6 py-2 transform -rotate-[30deg] text-[32px] sm:text-[42px] leading-none"
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

        {/* 1. TOP HEADER BLOCK WITH COMPANY DETAILS, ISO LOGOS & CERTIFICATE TITLE */}
        <div className="border-b-2 border-black pb-2 mb-1 flex items-start justify-between gap-3 bg-white">
          {/* LEFT: COMPANY LOGO & DETAILS */}
          <div className="flex items-start gap-2.5 shrink-0 max-w-[48%]">
            {/* COMPANY LOGO */}
            <div className="relative group flex flex-col items-center shrink-0">
              {formData.companyLogoUrl ? (
                <div className="relative">
                  <img src={formData.companyLogoUrl} alt="Company Logo" className="h-14 max-w-[150px] object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, companyLogoUrl: undefined }));
                      onSaveAsset('companyLogoUrl', undefined);
                    }}
                    className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    title="Remove Logo"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <label className="p-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded cursor-pointer transition-all flex items-center gap-1 text-[8.5px] font-bold print:hidden" title="Upload Company Logo">
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

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={formData.companyName ?? (activeCompany?.name || 'COMPANY NAME')}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="font-black text-[12.5px] uppercase tracking-tight text-black leading-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                placeholder="Company Name"
                title="Click to edit Company Name"
              />
              <input
                type="text"
                value={formData.companyTagline ?? (activeCompany?.subtitle || '')}
                onChange={(e) => setFormData(prev => ({ ...prev, companyTagline: e.target.value }))}
                className="text-[8.5px] font-bold text-slate-800 uppercase tracking-tight leading-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5 mt-0.5"
                placeholder="Tagline"
                title="Click to edit Tagline"
              />
              <input
                type="text"
                value={formData.companyAddress ?? (activeCompany?.address || '')}
                onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                className="text-[7.5px] font-medium text-slate-800 leading-tight mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                placeholder="Address & Tel"
                title="Click to edit Address"
              />
              <input
                type="text"
                value={formData.companyContact ?? ((activeCompany?.email ? activeCompany.email + ' | ' + (activeCompany.website || '') : ''))}
                onChange={(e) => setFormData(prev => ({ ...prev, companyContact: e.target.value }))}
                className="text-[7.5px] font-semibold text-slate-900 mt-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white w-full rounded-xs px-0.5"
                placeholder="Email & Website"
                title="Click to edit Contact"
              />
            </div>
          </div>

          {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only shown for Marine Fasteners or companies with ISO enabled) */}
          <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
            {getCompanyIsoText() ? (
              <div className="relative group flex flex-col items-center">
                <label className="cursor-pointer" title="Click to Upload Custom ISO Logo">
                  <img 
                    src={formData.isoLogoUrl || DEFAULT_ISO_LOGO_URL} 
                    alt="ISO Certification Logos" 
                    className="h-10 sm:h-11 max-w-[280px] sm:max-w-[320px] object-contain transition-all hover:opacity-90 cursor-pointer" 
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onUploadLogo('iso', e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[8px] font-bold text-black uppercase tracking-tight whitespace-nowrap flex-nowrap shrink-0 leading-none">
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
                      title="Reset ISO Logo"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-10" />
            )}
          </div>

          {/* RIGHT: MATERIAL TEST CERTIFICATE TITLE & PAGE NUMBER */}
          <div className="text-right shrink-0">
            <input
              type="text"
              value={formData.certTitle ?? 'MATERIAL TEST CERTIFICATE'}
              onChange={(e) => setFormData(prev => ({ ...prev, certTitle: e.target.value }))}
              className="font-black text-[13.5px] uppercase tracking-tight text-black underline leading-none mb-0.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5"
              placeholder="Certificate Title"
              title="Click to edit Certificate Title"
            />
            <input
              type="text"
              value={formData.certStandard ?? 'CERTIFIED TO BS EN 10204, 3.1'}
              onChange={(e) => setFormData(prev => ({ ...prev, certStandard: e.target.value }))}
              className="font-bold text-[8.5px] uppercase tracking-tight text-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white text-right rounded-xs px-0.5 w-full"
              placeholder="Standard Subtitle"
              title="Click to edit Certificate Standard"
            />
            <div className="font-bold text-[9px] uppercase tracking-tight text-black mt-0.5 flex items-center justify-end gap-1">
              <span>PAGE NO :</span>
              <input
                type="text"
                value={formData.pageNo || `${activeSheetIndex + 1} OF ${formData.sheets?.length || 1}`}
                onChange={(e) => setFormData(prev => ({ ...prev, pageNo: e.target.value }))}
                className="w-16 p-0.5 bg-amber-50/50 border border-amber-400 rounded text-center font-black text-[9px] text-amber-950 uppercase"
                title="Page number (e.g. 1 OF 1)"
              />
            </div>
          </div>
        </div>

        {/* 2. METADATA 2-ROW x 3-COLUMN TABLE */}
        <table className="w-full border-collapse border border-black text-[8.5px] font-sans table-fixed mb-1 bg-white">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[14%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Certifcate No:</td>
              <td className="w-[26%] p-0.5 font-black border-r border-black text-left px-1">
                <input
                  id="t3-meta-cert-no"
                  type="text"
                  required
                  value={currentSheet.certNo !== undefined ? currentSheet.certNo : (activeSheetIndex > 0 ? incrementCertNo(formData.certNo || formData.certificateNum || formData.issueNo, activeSheetIndex) : (formData.certificateNum || formData.certNo || formData.issueNo || ''))}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentSheet(s => ({ ...s, certNo: val }));
                    if (activeSheetIndex === 0) {
                      setFormData(prev => ({ ...prev, certNo: val, issueNo: val, certificateNum: val }));
                    }
                  }}
                  className="w-full p-0.5 bg-amber-50/40 border border-amber-300 rounded font-black text-[9.5px] text-amber-950 uppercase"
                />
              </td>
              <td className="w-[15%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Work Order Number:</td>
              <td className="w-[20%] p-0.5 font-bold border-r border-black text-left px-1">
                <input
                  id="t3-meta-wo-no"
                  type="text"
                  value={formData.workOrderNum || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, workOrderNum: e.target.value }));
                    onPoOrInvoiceChange('workOrderNum', e.target.value);
                  }}
                  className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9px]"
                />
              </td>
              <td className="w-[11%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Customer:</td>
              <td className="w-[24%] p-0.5 font-black text-left px-1">
                <input
                  id="t3-meta-customer"
                  type="text"
                  required
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full p-0.5 bg-amber-50/40 border border-amber-300 rounded font-black text-[9.5px] text-amber-950 uppercase"
                />
              </td>
            </tr>
            <tr>
              <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Date:</td>
              <td className="p-0.5 font-black border-r border-black text-left px-1">
                <input
                  id="t3-meta-date"
                  type="text"
                  required
                  value={formData.date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-0.5 bg-amber-50/40 border border-amber-300 rounded font-black text-[9.5px] text-amber-950"
                />
              </td>
              <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Invoice Number:</td>
              <td className="p-0.5 font-bold border-r border-black text-left px-1">
                <input
                  id="t3-meta-invoice-no"
                  type="text"
                  value={formData.invoiceNum || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, invoiceNum: e.target.value }));
                    onPoOrInvoiceChange('invoiceNum', e.target.value);
                  }}
                  className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9px]"
                />
              </td>
              <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">PO Number:</td>
              <td className="p-0.5 font-bold text-left px-1">
                <input
                  id="t3-meta-po-no"
                  type="text"
                  value={formData.customerPoNum || ''}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, customerPoNum: e.target.value }));
                    onPoOrInvoiceChange('customerPoNum', e.target.value);
                  }}
                  className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9px]"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. TABLE 1: PRODUCT DESCRIPTION */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between bg-white text-black border border-black px-2 py-0.5">
            <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*PRODUCT DESCRIPTION.</span>
            <div className="flex items-center gap-1 print:hidden">
              <button
                type="button"
                onClick={() => onOpenExcelModal('items')}
                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Paste Product Items from Excel"
              >
                <FileSpreadsheet className="w-2.5 h-2.5" /> Excel
              </button>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-[8.5px] sm:text-[9px] table-fixed bg-white">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-center text-[8.5px]">
                <th className="border border-black p-1 w-[3.5%]">Item</th>
                <th className="border border-black p-1 w-[30.5%]">Description</th>
                <th className="border border-black p-1 w-[11%]">Size</th>
                <th className="border border-black p-1 w-[18%]">Specification / Standard</th>
                <th className="border border-black p-1 w-[7.5%]">Qty</th>
                <th className="border border-black p-1 w-[7.5%]">Finish</th>
                <th className="border border-black p-1 w-[10%]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Marking</span>
                    <label 
                      className="text-amber-600 hover:text-amber-800 cursor-pointer p-0.5 rounded hover:bg-amber-50 print:hidden transition-colors inline-flex items-center"
                      title="Upload marking image/logo for all items"
                    >
                      <Upload className="w-2.5 h-2.5 text-amber-600" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = reader.result as string;
                            updateCurrentSheet(sheet => {
                              const updated = (sheet.items || []).map(it => ({ ...it, markingImage: dataUrl }));
                              return { ...sheet, items: updated };
                            });
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </th>
                <th className="border border-black p-1 w-[9%]">Heat No</th>
                <th className="border border-black p-0.5 w-[3%] print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {(currentSheet.items || []).map((it, idx) => (
                <tr 
                  key={it.id || idx}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, table: 'items', rowIndex: idx });
                  }}
                  className="border-b border-black text-[8.5px] sm:text-[9px] hover:bg-amber-50/40"
                >
                  <td 
                    className="border border-black p-0.5 text-center font-bold select-none cursor-context-menu hover:bg-amber-200"
                    title="Right-click for row options"
                  >
                    {it.itemNo || (idx + 1)}
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 0) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <textarea
                      id={`t3-item-${idx}-description`}
                      rows={1}
                      value={it.description}
                      onChange={(e) => {
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.items || [])];
                          updated[idx].description = e.target.value;
                          return { ...sheet, items: updated };
                        });
                      }}
                      onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'description')}
                      onPaste={(e) => handleT3ItemPaste(e, idx, 'description')}
                      className="w-full p-0.5 bg-transparent border-0 font-semibold text-slate-900 text-[8.5px] sm:text-[9px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 1) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <textarea
                      id={`t3-item-${idx}-size`}
                      rows={1}
                      value={it.size}
                      onChange={(e) => {
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.items || [])];
                          updated[idx].size = e.target.value;
                          return { ...sheet, items: updated };
                        });
                      }}
                      onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'size')}
                      onPaste={(e) => handleT3ItemPaste(e, idx, 'size')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 2) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <textarea
                      id={`t3-item-${idx}-standard`}
                      rows={1}
                      value={it.material || it.standard || ''}
                      onChange={(e) => {
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.items || [])];
                          updated[idx].material = e.target.value;
                          updated[idx].standard = e.target.value;
                          return { ...sheet, items: updated };
                        });
                      }}
                      onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'standard')}
                      onPaste={(e) => handleT3ItemPaste(e, idx, 'standard')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 3) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <input
                      id={`t3-item-${idx}-qty`}
                      type="text"
                      value={it.qty}
                      onChange={(e) => {
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.items || [])];
                          updated[idx].qty = e.target.value;
                          return { ...sheet, items: updated };
                        });
                      }}
                      onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'qty')}
                      onPaste={(e) => handleT3ItemPaste(e, idx, 'qty')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 4) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <input
                      id={`t3-item-${idx}-finish`}
                      type="text"
                      value={it.finish || ''}
                      onChange={(e) => {
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.items || [])];
                          updated[idx].finish = e.target.value;
                          return { ...sheet, items: updated };
                        });
                      }}
                      onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'finish')}
                      onPaste={(e) => handleT3ItemPaste(e, idx, 'finish')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                    />
                  </td>
                  {/* MARKING CELL WITH TEXT & IMAGE UPLOAD (UPLOAD/IMAGE LEFT, TEXT RIGHT) */}
                  <td className={`border border-black p-0.5 align-middle ${isItemCellSelected(idx, 5) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <div className="flex items-center justify-start gap-1 w-full whitespace-nowrap px-0.5">
                      {/* Left side: Marking Image or Upload Button */}
                      {it.markingImage ? (
                        <div className="relative group shrink-0 flex items-center">
                          <img 
                            src={it.markingImage} 
                            alt="Marking" 
                            className="max-h-4 max-w-[28px] object-contain border border-slate-200 rounded p-0.5 bg-white shrink-0" 
                          />
                          <button
                            type="button"
                            onClick={() => removeMarkingImage(idx)}
                            className="absolute -top-1.5 -right-2 bg-rose-600 text-white rounded-full p-0.5 text-[7px] opacity-0 group-hover:opacity-100 transition-opacity print:hidden cursor-pointer shadow-xs"
                            title="Remove marking image"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ) : (
                        <label 
                          className="p-0.5 text-amber-600 hover:text-amber-800 cursor-pointer print:hidden transition-colors shrink-0 rounded hover:bg-amber-50 flex items-center justify-center"
                          title="Upload marking image for this row"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleMarkingImageUpload(idx, e)} 
                            className="hidden" 
                          />
                        </label>
                      )}

                      {/* Right side: Marking Text Input */}
                      <input
                        id={`t3-item-${idx}-marking`}
                        type="text"
                        placeholder="Marking"
                        value={it.marking || ''}
                        onChange={(e) => {
                          updateCurrentSheet(sheet => {
                            const updated = [...(sheet.items || [])];
                            updated[idx].marking = e.target.value;
                            return { ...sheet, items: updated };
                          });
                        }}
                        onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'marking')}
                        onPaste={(e) => handleT3ItemPaste(e, idx, 'marking')}
                        className="flex-1 min-w-0 p-0.5 bg-transparent border-0 font-medium text-left text-[8px] sm:text-[8.5px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded leading-none placeholder:text-slate-300"
                      />
                    </div>
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 6) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <input
                      id={`t3-item-${idx}-heatNo`}
                      type="text"
                      value={it.heatNo}
                      onChange={(e) => {
                        const newHeat = e.target.value;
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.items || [])];
                          const chem = [...(sheet.chemicalData || [])];
                          const mech = [...(sheet.mechanicalData || [])];
                          updated[idx].heatNo = newHeat;
                          if (chem[idx]) chem[idx].heatNo = newHeat;
                          if (mech[idx]) mech[idx].heatNo = newHeat;
                          return { ...sheet, items: updated, chemicalData: chem, mechanicalData: mech };
                        });
                      }}
                      onKeyDown={(e) => handleT3ItemKeyDown(e, idx, 'heatNo')}
                      onPaste={(e) => handleT3ItemPaste(e, idx, 'heatNo')}
                      className="w-full p-0.5 bg-amber-50/50 border border-amber-300 font-bold text-center text-[9px] sm:text-[9.5px] text-amber-950 uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded whitespace-nowrap"
                    />
                  </td>
                  <td className="border border-black p-0.5 text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => removeRowFromCurrentSheet(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                      title="Delete Row"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. TABLE 2: CHEMICAL ANALYSIS */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between bg-white text-black border border-black px-2 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*CHEMICAL ANALYSIS.</span>
              <span className="text-[8px] font-medium text-slate-500 italic print:hidden">(Click headers to rename)</span>
            </div>
            <div className="flex items-center gap-1 print:hidden">
              <button
                type="button"
                onClick={() => onOpenExcelModal('chemical')}
                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Paste Chemical data from Excel"
              >
                <FileSpreadsheet className="w-2.5 h-2.5" /> Excel
              </button>
              <button
                type="button"
                onClick={() => setShowChemColDrawer(!showChemColDrawer)}
                className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Toggle Extra Chemical & Mechanical Columns"
              >
                <Sliders className="w-2.5 h-2.5" /> Columns
              </button>
            </div>
          </div>

          {/* PDF Print Column Toggles Drawer (Chemical & Sections) */}
          {showChemColDrawer && (
            <div className="bg-slate-50 p-2.5 border border-black rounded space-y-2 print:hidden mb-1">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[10px]">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chemical & Section Column Toggles:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      showColPb: true,
                      showColZn: true,
                      showColFe: true,
                      showColSn: true,
                      showImpurity: true,
                      showOther: true,
                      showMacroEtch: true,
                      showHeatTreatment: true,
                    }))}
                    className="text-[9.5px] font-bold px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors cursor-pointer shadow-xs"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      showMacroEtch: false,
                      showHeatTreatment: false,
                      showColPb: false,
                      showColZn: false,
                      showColFe: false,
                      showColSn: false,
                      showImpurity: false,
                      showOther: false,
                    }))}
                    className="text-[9.5px] font-bold px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded border border-slate-300 transition-colors cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-1 text-[9.5px]">
                {/* Section & Chemical Optional Toggles */}
                <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                  <input type="checkbox" checked={formData.showMacroEtch === true} onChange={(e) => setFormData(prev => ({ ...prev, showMacroEtch: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Macro Etch</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                  <input type="checkbox" checked={formData.showHeatTreatment === true} onChange={(e) => setFormData(prev => ({ ...prev, showHeatTreatment: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Heat Treatment Sec.</span>
                </label>

                {/* Chemical Element Toggles */}
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Pb Lead column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColPb !== undefined ? formData.showColPb : false}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColPb: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Pb (Lead)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Zn Zinc column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColZn !== undefined ? formData.showColZn : false}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColZn: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Zn (Zinc)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Fe Iron column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColFe !== undefined ? formData.showColFe : false}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColFe: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Fe (Iron)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Sn Tin column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColSn !== undefined ? formData.showColSn : false}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColSn: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Sn (Tin)</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                  <input type="checkbox" checked={!!formData.showImpurity} onChange={(e) => setFormData(prev => ({ ...prev, showImpurity: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Total Impurity</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                  <input type="checkbox" checked={!!formData.showOther} onChange={(e) => setFormData(prev => ({ ...prev, showOther: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Other</span>
                </label>
              </div>
            </div>
          )}

          <table className="w-full border-collapse border border-black text-[8px] sm:text-[8.5px] table-fixed bg-white text-center">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-black">
                <th rowSpan={4} className="border border-black p-0.5 w-[3.5%] align-middle text-center font-bold">Item</th>
                <th rowSpan={4} className="border border-black p-0.5 w-[11.5%] align-middle text-center font-bold">Heat No</th>
                <th className="border border-black p-0.5 w-[5%] bg-slate-100 text-center font-bold text-[8px] sm:text-[8.5px]">SPEC</th>
                {activeChemCols.map(col => {
                  const currentLabel = formData.chemHeaderOverrides?.[col.k] ?? col.label;
                  return (
                    <th key={col.k} className="border border-black p-0.5 font-bold" style={{ width: `${(80.0 / activeChemCols.length).toFixed(3)}%` }}>
                      <input
                        type="text"
                        value={currentLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            chemHeaderOverrides: {
                              ...(prev.chemHeaderOverrides || {}),
                              [col.k]: val
                            }
                          }));
                        }}
                        className="w-full bg-transparent text-center font-bold text-[8px] sm:text-[8.5px] border-0 p-0 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                        title="Click to rename column header"
                      />
                    </th>
                  );
                })}
              </tr>
              {/* MIN VALUES ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[8.5px] tracking-wider bg-slate-100/70">
                  MIN
                </th>
                {activeChemCols.map(col => {
                  const minVal = currentSheet.chemSpecMin?.[col.k as any] ?? formData.chemSpecMin?.[col.k as any] ?? '';
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal">
                      <input
                        type="text"
                        value={minVal ? formatChemVal(minVal) : ''}
                        placeholder="—"
                        onChange={(e) => updateChemSpec('min', col.k as string, e.target.value)}
                        onBlur={(e) => updateChemSpec('min', col.k as string, formatChemVal(e.target.value))}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                        className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8px] text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded placeholder:text-slate-300"
                        title={`Minimum ${col.label}`}
                      />
                    </th>
                  );
                })}
              </tr>

              {/* MAX VALUES ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[8.5px] tracking-wider bg-slate-100/70">
                  MAX
                </th>
                {activeChemCols.map(col => {
                  const maxVal = currentSheet.chemSpecMax?.[col.k as any] ?? formData.chemSpecMax?.[col.k as any] ?? '';
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal">
                      <input
                        type="text"
                        value={maxVal ? formatChemVal(maxVal) : ''}
                        placeholder="—"
                        onChange={(e) => updateChemSpec('max', col.k as string, e.target.value)}
                        onBlur={(e) => updateChemSpec('max', col.k as string, formatChemVal(e.target.value))}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                        className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8px] text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded placeholder:text-slate-300"
                        title={`Maximum ${col.label}`}
                      />
                    </th>
                  );
                })}
              </tr>

              {/* (%) UNIT ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[8.5px] tracking-wider bg-slate-100/70">
                  (%)
                </th>
                {activeChemCols.map(col => {
                  const unitVal = currentSheet.chemUnits?.[col.k as any] ?? formData.chemUnits?.[col.k as any] ?? '(%)';
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal">
                      <input
                        type="text"
                        value={unitVal}
                        placeholder="(%)"
                        onChange={(e) => updateChemUnit(col.k as string, e.target.value)}
                        className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8px] text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded placeholder:text-slate-300"
                        title={`Unit for ${col.label}`}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* SAMPLE TEST DATA ROWS */}
              {(currentSheet.chemicalData || []).map((chem, idx) => (
                <tr key={idx} className="border-b border-black hover:bg-amber-50/40">
                  <td className="border border-black p-0.5 font-bold text-center">{chem.itemNo || (idx + 1)}</td>
                  <td className={`border border-black p-0.5 font-bold text-amber-950 uppercase ${isChemCellSelected(idx, 0) ? 'bg-amber-200 ring-2 ring-amber-600 ring-inset' : 'bg-amber-50/30'}`}>
                    <input
                      id={`t3-chem-${idx}-heatNo`}
                      type="text"
                      value={chem.heatNo || ''}
                      onFocus={() => setSelectedChemCells(null)}
                      onKeyDown={(e) => handleT3ChemKeyDown(e, idx, 'heatNo')}
                      onPaste={(e) => handleT3ChemPaste(e, idx, 'heatNo')}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.chemicalData || [])];
                          updated[idx].heatNo = val;
                          return { ...sheet, chemicalData: updated };
                        });
                      }}
                      className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8.5px] uppercase focus:bg-white"
                    />
                  </td>
                  <td className="border border-black p-0.5 font-bold text-center text-[7.5px] text-slate-600 bg-slate-50/50">
                    ACTUAL
                  </td>
                  {activeChemCols.map((col, colOffset) => {
                    const colIndex = colOffset + 1;
                    const isSelected = isChemCellSelected(idx, colIndex);
                    return (
                      <td key={col.k} className={`border border-black p-0.5 ${isSelected ? 'bg-amber-200 ring-2 ring-amber-600 ring-inset' : ''}`}>
                        <input
                          id={`t3-chem-${idx}-${col.k}`}
                          type="text"
                          value={formatChemVal((chem as any)[col.k])}
                          onFocus={() => setSelectedChemCells(null)}
                          onKeyDown={(e) => handleT3ChemKeyDown(e, idx, col.k as string)}
                          onPaste={(e) => handleT3ChemPaste(e, idx, col.k as string)}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentSheet(sheet => {
                              const updated = [...(sheet.chemicalData || [])];
                              (updated[idx] as any)[col.k] = val;
                              return { ...sheet, chemicalData: updated };
                            });
                          }}
                          onBlur={(e) => {
                            const val = formatChemVal(e.target.value);
                            updateCurrentSheet(sheet => {
                              const updated = [...(sheet.chemicalData || [])];
                              (updated[idx] as any)[col.k] = val;
                              return { ...sheet, chemicalData: updated };
                            });
                          }}
                          className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. TABLE 3: MECHANICAL PROPERTIES */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between bg-white text-black border border-black px-2 py-0.5">
            <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*MECHANICAL PROPERTIES.</span>
            <div className="flex items-center gap-1 print:hidden">
              <button
                type="button"
                onClick={() => onOpenExcelModal('mechanical')}
                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Paste Mechanical data from Excel"
              >
                <FileSpreadsheet className="w-2.5 h-2.5" /> Excel
              </button>
              <button
                type="button"
                onClick={() => setShowMechColDrawer(!showMechColDrawer)}
                className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Toggle Mechanical Columns"
              >
                <Sliders className="w-2.5 h-2.5" /> Columns
              </button>
            </div>
          </div>

          {/* Mechanical Columns Toggle Drawer */}
          {showMechColDrawer && (
            <div className="bg-slate-50 p-2.5 border border-black rounded space-y-2 print:hidden mb-1">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[10px]">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mechanical Column Toggles (Select columns to include):</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      showColStressUnderProofload: true,
                      showColHeatTreatment: true,
                      showColHardness24Hr: true,
                      showColQuenchingTemp: true,
                      showColQuenchingTime: true,
                      showColQuenchingMedium: true,
                      showColTemperingTemp: true,
                      showColTemperingTime: true,
                      showColStressRelieved: true,
                      showColTemperingResult: true,
                      showColProofLoad: true,
                      showColImpactJ: true,
                      showColAvgImpactJ: true,
                      showColImpactTemp: true,
                      showColPren: true,
                    }))}
                    className="text-[9.5px] font-bold px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors cursor-pointer shadow-xs"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      showColProofLoad: false,
                      showColStressUnderProofload: false,
                      showColHeatTreatment: false,
                      showColHardness24Hr: false,
                      showColQuenchingTemp: false,
                      showColQuenchingTime: false,
                      showColQuenchingMedium: false,
                      showColTemperingTemp: false,
                      showColTemperingTime: false,
                      showColStressRelieved: false,
                      showColTemperingResult: false,
                      showColImpactJ: false,
                      showColAvgImpactJ: false,
                      showColImpactTemp: false,
                      showColPren: false,
                    }))}
                    className="text-[9.5px] font-bold px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded border border-slate-300 transition-colors cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-1 text-[9.5px]">
                <label className="flex items-center gap-1 cursor-pointer font-bold text-amber-950 hover:text-amber-700 select-none bg-amber-200/50 px-1 py-0.5 rounded border border-amber-300/80">
                  <input
                    type="checkbox"
                    checked={formData.showColProofLoad !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColProofLoad: e.target.checked }))}
                    className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Proofload</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColStressUnderProofload ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColStressUnderProofload: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Stress Under Proofload</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColHeatTreatment ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColHeatTreatment: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Heat Treatment</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColHardness24Hr ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColHardness24Hr: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Hardness after treatment</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColQuenchingTemp ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColQuenchingTemp: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Quenching Temp</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColQuenchingTime ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColQuenchingTime: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Holding Time (Quench)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColQuenchingMedium ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColQuenchingMedium: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span className="text-amber-900 font-bold">Quenching Medium</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColTemperingTemp ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColTemperingTemp: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Temper Temp</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColTemperingTime ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColTemperingTime: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Holding time (Temper)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColStressRelieved ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColStressRelieved: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Stress relieved</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColTemperingResult ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColTemperingResult: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Temper</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColImpactJ ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColImpactJ: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Impact in J</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColAvgImpactJ ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColAvgImpactJ: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Average Impact in J</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-slate-800 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColImpactTemp ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColImpactTemp: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span>Impact Test Temp</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-semibold text-amber-900 hover:text-amber-700 select-none">
                  <input type="checkbox" checked={formData.showColPren ?? false} onChange={(e) => setFormData(prev => ({ ...prev, showColPren: e.target.checked }))} className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                  <span className="font-bold">PREN</span>
                </label>
              </div>
            </div>
          )}

          <table className="w-full border-collapse border border-black text-[7px] sm:text-[7.5px] table-fixed bg-white text-center">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black text-black">
                <th rowSpan={3} className="border border-black p-0.5 w-[3.5%] align-middle text-center font-bold">Item</th>
                <th rowSpan={3} className="border border-black p-0.5 w-[11.5%] align-middle text-center font-bold">Heat No</th>
                <th className="border border-black p-0.5 w-[5%] bg-slate-100 text-center font-bold text-[7.5px] sm:text-[8px] align-middle">SPEC</th>
                {activeMechCols.map(col => {
                  const currentLabel = formData.mechHeaderOverrides?.[col.k] ?? col.label;
                  return (
                    <th key={col.k} className="border border-black p-0.5 font-bold text-center align-middle whitespace-normal break-words leading-none text-[6.5px] sm:text-[7px] [overflow-wrap:anywhere]" style={{ width: `${(80.0 / activeMechCols.length).toFixed(3)}%` }}>
                      <textarea
                        rows={2}
                        value={currentLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            mechHeaderOverrides: {
                              ...(prev.mechHeaderOverrides || {}),
                              [col.k]: val
                            }
                          }));
                        }}
                        className="w-full bg-transparent text-center font-bold text-[6.5px] sm:text-[7px] border-0 p-0.5 resize-none leading-tight focus:bg-white focus:ring-1 focus:ring-amber-500 rounded whitespace-normal break-words overflow-hidden"
                        title="Click to rename column header"
                      />
                    </th>
                  );
                })}
              </tr>
              {/* MIN VALUES ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[8.5px] tracking-wider bg-slate-100/70 align-middle">
                  MIN
                </th>
                {activeMechCols.map(col => {
                  const minVal = currentSheet.mechSpecMin?.[col.k] ?? formData.mechSpecMin?.[col.k] ?? getMechSpecValue(currentSheet.mechSpecMin, col.k) ?? getMechSpecValue(formData.mechSpecMin, col.k) ?? '';
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal align-middle">
                      <input
                        type="text"
                        value={minVal ? formatNumericVal(minVal) : ''}
                        placeholder="—"
                        onChange={(e) => updateMechSpec('min', col.k, e.target.value)}
                        onBlur={(e) => updateMechSpec('min', col.k, formatNumericVal(e.target.value))}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                        className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8px] text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded placeholder:text-slate-300"
                        title={`Minimum ${col.label}`}
                      />
                    </th>
                  );
                })}
              </tr>

              {/* MAX VALUES ROW */}
              <tr className="bg-slate-50 border-b border-black font-bold">
                <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[8.5px] tracking-wider bg-slate-100/70 align-middle">
                  MAX
                </th>
                {activeMechCols.map(col => {
                  const maxVal = currentSheet.mechSpecMax?.[col.k] ?? formData.mechSpecMax?.[col.k] ?? getMechSpecValue(currentSheet.mechSpecMax, col.k) ?? getMechSpecValue(formData.mechSpecMax, col.k) ?? '';
                  return (
                    <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal align-middle">
                      <input
                        type="text"
                        value={maxVal ? formatNumericVal(maxVal) : ''}
                        placeholder="—"
                        onChange={(e) => updateMechSpec('max', col.k, e.target.value)}
                        onBlur={(e) => updateMechSpec('max', col.k, formatNumericVal(e.target.value))}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                        className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8px] text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded placeholder:text-slate-300"
                        title={`Maximum ${col.label}`}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* SAMPLE TEST DATA ROWS */}
              {(currentSheet.mechanicalData || []).map((mech, idx) => (
                <tr key={idx} className="border-b border-black hover:bg-amber-50/40">
                  <td className="border border-black p-0.5 font-bold text-center align-middle">{mech.itemNo || (idx + 1)}</td>
                  <td className={`border border-black p-0.5 font-bold text-amber-950 uppercase align-middle ${isMechCellSelected(idx, 0) ? 'bg-amber-200 ring-2 ring-amber-600 ring-inset' : 'bg-amber-50/30'}`}>
                    <input
                      id={`t3-mech-${idx}-heatNo`}
                      type="text"
                      value={mech.heatNo || ''}
                      onFocus={() => setSelectedMechCells(null)}
                      onKeyDown={(e) => handleT3MechKeyDown(e, idx, 'heatNo')}
                      onPaste={(e) => handleT3MechPaste(e, idx, 'heatNo')}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentSheet(sheet => {
                          const updated = [...(sheet.mechanicalData || [])];
                          updated[idx].heatNo = val;
                          return { ...sheet, mechanicalData: updated };
                        });
                      }}
                      className="w-full p-0.5 bg-transparent border-0 font-bold text-center text-[8.5px] uppercase focus:bg-white"
                    />
                  </td>
                  <td className="border border-black p-0.5 font-bold text-center text-[7.5px] text-slate-600 bg-slate-50/50 align-middle">
                    ACTUAL
                  </td>
                  {activeMechCols.map((col, colOffset) => {
                    const colIndex = colOffset + 1;
                    const isSelected = isMechCellSelected(idx, colIndex);
                    const cellVal = (mech as any)[col.k] !== undefined && (mech as any)[col.k] !== null && String((mech as any)[col.k]).trim() !== ''
                      ? (mech as any)[col.k]
                      : getMechPropValue(mech, col.k);
                    return (
                      <td key={col.k} className={`border border-black p-0.5 align-middle ${isSelected ? 'bg-amber-200 ring-2 ring-amber-600 ring-inset' : ''}`}>
                        <input
                          id={`t3-mech-${idx}-${col.k}`}
                          type="text"
                          value={cellVal ? formatNumericVal(cellVal) : ''}
                          onFocus={() => setSelectedMechCells(null)}
                          onKeyDown={(e) => handleT3MechKeyDown(e, idx, col.k)}
                          onPaste={(e) => handleT3MechPaste(e, idx, col.k)}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentSheet(sheet => {
                              const updated = [...(sheet.mechanicalData || [])];
                              (updated[idx] as any)[col.k] = val;
                              return { ...sheet, mechanicalData: updated };
                            });
                          }}
                          onBlur={(e) => {
                            const val = formatNumericVal(e.target.value);
                            updateCurrentSheet(sheet => {
                              const updated = [...(sheet.mechanicalData || [])];
                              (updated[idx] as any)[col.k] = val;
                              return { ...sheet, mechanicalData: updated };
                            });
                          }}
                          className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded whitespace-normal break-words"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. TABLE 3: MACRO ETCH TABLE (OPTIONAL TOGGLE) */}
        {formData.showMacroEtch === true && (
          <div className="mb-1 border border-black p-1 bg-white">
            <div className="font-black text-[9px] tracking-wider mb-0.5 text-black">Macro Etch</div>
            <table className="w-full border-collapse border border-black text-[7.5px] text-center table-fixed bg-white">
              <thead>
                <tr className="bg-white border-b border-black font-black text-[8px]">
                  <th className="border border-black p-0.5 w-[15%]">Division</th>
                  <th className="border border-black p-0.5 w-[22%]">Surface Condition</th>
                  <th className="border border-black p-0.5 w-[22%]">Random Condition</th>
                  <th className="border border-black p-0.5 w-[22%]">Center Segregation</th>
                  <th className="border border-black p-0.5 w-[19%]"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border border-black p-0.5 font-bold bg-white">Spec.</td>
                  <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchSpecSurface || 'S2'} onChange={(e) => setFormData({ ...formData, macroEtchSpecSurface: e.target.value })} className="w-full text-center bg-transparent font-bold border-0" /></td>
                  <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchSpecRandom || 'R2'} onChange={(e) => setFormData({ ...formData, macroEtchSpecRandom: e.target.value })} className="w-full text-center bg-transparent font-bold border-0" /></td>
                  <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchSpecCenter || 'C3'} onChange={(e) => setFormData({ ...formData, macroEtchSpecCenter: e.target.value })} className="w-full text-center bg-transparent font-bold border-0" /></td>
                  <td className="border border-black p-0.5"></td>
                </tr>
                <tr>
                  <td className="border border-black p-0.5 font-bold bg-white">Results</td>
                  <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchResultSurface || 'S2'} onChange={(e) => setFormData({ ...formData, macroEtchResultSurface: e.target.value })} className="w-full text-center bg-transparent font-black text-[8.5px] border-0" /></td>
                  <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchResultRandom || 'R2'} onChange={(e) => setFormData({ ...formData, macroEtchResultRandom: e.target.value })} className="w-full text-center bg-transparent font-black text-[8.5px] border-0" /></td>
                  <td className="border border-black p-0.5"><input type="text" value={formData.macroEtchResultCenter || 'C3'} onChange={(e) => setFormData({ ...formData, macroEtchResultCenter: e.target.value })} className="w-full text-center bg-transparent font-black text-[8.5px] border-0" /></td>
                  <td className="border border-black p-0.5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 6. BOX 4: *HEAT TREATMENT (OPTIONAL TOGGLE) */}
        {formData.showHeatTreatment === true && (
          <div className="border border-black mb-1 text-[9.5px] bg-white">
            <div className="font-black p-1 px-1.5 border-b border-black text-[10px] text-black bg-white">
              *Heat Treatment
            </div>
            <div className="p-1.5 space-y-1 font-sans leading-tight text-[9.5px]">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Carbide Solution treated :</span>
                <input type="text" value={formData.heatTreatmentCarbide || 'Was treated by raw material factory'} onChange={(e) => setFormData({ ...formData, heatTreatmentCarbide: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Strain Hardened :</span>
                <input type="text" value={formData.heatTreatmentStrain || 'Was treated'} onChange={(e) => setFormData({ ...formData, heatTreatmentStrain: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Quenching :</span>
                <input type="text" value={formData.heatTreatmentQuenching || 'N/A'} onChange={(e) => setFormData({ ...formData, heatTreatmentQuenching: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Tempering :</span>
                <input type="text" value={formData.heatTreatmentTempering || 'N/A'} onChange={(e) => setFormData({ ...formData, heatTreatmentTempering: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
            </div>
          </div>
        )}

        {/* 7. BOX 5: ADDITIONAL TECHNICAL INFORMATION (EXACTLY AS PER MTC 2) */}
        <div className="border border-black mb-1 text-[9.5px] bg-white">
          <div className="font-black p-1 px-1.5 border-b border-black text-[10px] text-black bg-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>Additional Technical Information:-</span>
              <span className="text-[8px] font-semibold text-slate-500 normal-case">(Left titles and right values are editable)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const newLine = {
                  id: `tech_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  label: 'Additional Inspection',
                  text: 'Found satisfactory / As per standard requirement.',
                  enabled: true
                };
                const updated = [...(formData.customTechInfoLines || []), newLine];
                setFormData({ ...formData, customTechInfoLines: updated });
              }}
              className="flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded cursor-pointer transition-colors shadow-xs"
              title="Add custom line to Additional Technical Information"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line</span>
            </button>
          </div>
          <div className="p-1.5 space-y-1 font-sans leading-tight text-[9.5px]">
            {/* Visual Inspection */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoVisual !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoVisual: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Visual Inspection"
              />
              <input
                type="text"
                value={formData.techInfoVisualLabel ?? 'Visual Inspection'}
                onChange={(e) => setFormData({ ...formData, techInfoVisualLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Visual Inspection"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoVisual || 'Found to be free from crack, flaws, sharp edges and other defects.'}
                onChange={(e) => setFormData({ ...formData, techInfoVisual: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Thread acceptability */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoThread !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoThread: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Thread acceptability"
              />
              <input
                type="text"
                value={formData.techInfoThreadLabel ?? 'Thread acceptability'}
                onChange={(e) => setFormData({ ...formData, techInfoThreadLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Thread acceptability"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoThread || 'has been inspected as per ASME B1.1 CL 2A and found ok.'}
                onChange={(e) => setFormData({ ...formData, techInfoThread: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Gauge Fit */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoGauge !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoGauge: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Gauge Fit"
              />
              <input
                type="text"
                value={formData.techInfoGaugeLabel ?? 'Gauge Fit'}
                onChange={(e) => setFormData({ ...formData, techInfoGaugeLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Gauge Fit"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoGauge || 'Inspection using 6g GO gauge and 6g NO GO gauge,'}
                onChange={(e) => setFormData({ ...formData, techInfoGauge: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Dimensions */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoDimensions !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoDimensions: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Dimensions"
              />
              <input
                type="text"
                value={formData.techInfoDimensionsLabel ?? 'Dimensions'}
                onChange={(e) => setFormData({ ...formData, techInfoDimensionsLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Dimensions"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoDimensions || 'Found Satisfactory/ As per Standard requirement.'}
                onChange={(e) => setFormData({ ...formData, techInfoDimensions: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Heat Treatment */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoHeatTreatment !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoHeatTreatment: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Heat Treatment Line"
              />
              <input
                type="text"
                value={formData.techInfoHeatTreatmentLabel ?? 'Heat Treatment'}
                onChange={(e) => setFormData({ ...formData, techInfoHeatTreatmentLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Heat Treatment"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoHeatTreatment || 'Quenched Liquid & tempered.'}
                onChange={(e) => setFormData({ ...formData, techInfoHeatTreatment: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* HDG */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoHdg !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoHdg: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle HDG"
              />
              <input
                type="text"
                value={formData.techInfoHdgLabel ?? 'HDG'}
                onChange={(e) => setFormData({ ...formData, techInfoHdgLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="HDG"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoHdg || 'As per ASTM A153 CL-C found satisfactory.'}
                onChange={(e) => setFormData({ ...formData, techInfoHdg: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* GI */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoGi === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoGi: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle GI Line"
              />
              <input
                type="text"
                value={formData.techInfoGiLabel ?? 'GI'}
                onChange={(e) => setFormData({ ...formData, techInfoGiLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="GI"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoGi || 'As per ASTM B633 Found satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoGi: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Galv */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoGalv === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoGalv: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Galv Line"
              />
              <input
                type="text"
                value={formData.techInfoGalvLabel ?? 'Galv'}
                onChange={(e) => setFormData({ ...formData, techInfoGalvLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Galv"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoGalv || 'As per ASTM B633 Found satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoGalv: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Self */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoSelf === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoSelf: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Self Line"
              />
              <input
                type="text"
                value={formData.techInfoSelfLabel ?? 'Self'}
                onChange={(e) => setFormData({ ...formData, techInfoSelfLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Self"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoSelf || 'Found satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoSelf: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Yellow */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoYellow === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoYellow: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Yellow Line"
              />
              <input
                type="text"
                value={formData.techInfoYellowLabel ?? 'Yellow'}
                onChange={(e) => setFormData({ ...formData, techInfoYellowLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Yellow"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoYellow || 'Found Satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoYellow: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Cadmium Plating */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoCadmium === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoCadmium: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Cadmium Plating Line"
              />
              <input
                type="text"
                value={formData.techInfoCadmiumLabel ?? 'Cadmium Plating'}
                onChange={(e) => setFormData({ ...formData, techInfoCadmiumLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Cadmium Plating"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoCadmium || 'Found satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoCadmium: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Nickel Plating */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoNickel === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoNickel: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Nickel Plating Line"
              />
              <input
                type="text"
                value={formData.techInfoNickelLabel ?? 'Nickel Plating'}
                onChange={(e) => setFormData({ ...formData, techInfoNickelLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Nickel Plating"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoNickel || 'Found satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoNickel: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Fluropolymer coating */}
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={formData.showTechInfoFluropolymer === true}
                onChange={(e) => setFormData({ ...formData, showTechInfoFluropolymer: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle Fluropolymer coating Line"
              />
              <input
                type="text"
                value={formData.techInfoFluropolymerLabel ?? 'Fluropolymer coating'}
                onChange={(e) => setFormData({ ...formData, techInfoFluropolymerLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="Fluropolymer coating"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoFluropolymer || 'Found satisfactory'}
                onChange={(e) => setFormData({ ...formData, techInfoFluropolymer: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* PTFE BLUE (XYLAN 1070) */}
            <div className="space-y-1 bg-amber-50/40 p-1.5 rounded border border-amber-200/60">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={formData.showTechInfoPtfeBlue === true}
                  onChange={(e) => setFormData({ ...formData, showTechInfoPtfeBlue: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                  title="Toggle PTFE BLUE Line"
                />
                <span className="text-[9.5px] font-bold text-slate-800 shrink-0">Title:</span>
                <input
                  type="text"
                  value={formData.techInfoPtfeBlueTitle || 'PTFE BLUE (XYLAN 1070)'}
                  onChange={(e) => setFormData({ ...formData, techInfoPtfeBlueTitle: e.target.value })}
                  className="font-bold text-[9.5px] flex-1 p-0.5 bg-transparent border-b border-slate-300 focus:border-amber-600 text-slate-900"
                  placeholder="PTFE BLUE Title..."
                />
              </div>
              {formData.showTechInfoPtfeBlue && (
                <div className="pl-5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                    <input
                      type="text"
                      value={formData.techInfoPtfeBlue || 'Found Satisfactory'}
                      onChange={(e) => setFormData({ ...formData, techInfoPtfeBlue: e.target.value })}
                      className="flex-1 p-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-semibold text-slate-900"
                      placeholder="Status (e.g. Found Satisfactory)..."
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                    <input
                      type="text"
                      value={formData.techInfoPtfeBlueTemp || 'The material can withstand the temperature range of -50°C to +200°C'}
                      onChange={(e) => setFormData({ ...formData, techInfoPtfeBlueTemp: e.target.value })}
                      className="flex-1 p-0.5 bg-white border border-slate-200 rounded text-[9.5px] font-semibold text-slate-900"
                      placeholder="Temperature note..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* NACE Compliance */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="checkbox"
                checked={formData.showTechInfoNace !== false}
                onChange={(e) => setFormData({ ...formData, showTechInfoNace: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                title="Toggle NACE Compliance Line"
              />
              <input
                type="text"
                value={formData.techInfoNaceLabel ?? 'NACE Compliance'}
                onChange={(e) => setFormData({ ...formData, techInfoNaceLabel: e.target.value })}
                className="font-bold w-44 text-[9.5px] p-0.5 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded text-slate-900"
                placeholder="NACE Compliance"
              />
              <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
              <input
                type="text"
                value={formData.techInfoNace || 'We hereby confirm that the material Complies to NACE MR/0175/ ISO 15156-2 requirements.'}
                onChange={(e) => setFormData({ ...formData, techInfoNace: e.target.value })}
                className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium text-slate-900"
              />
            </div>

            {/* Custom dynamically added lines */}
            {formData.customTechInfoLines?.map((line, customIdx) => (
              <div key={line.id} className="flex items-center gap-1.5 bg-amber-50/50 p-1 rounded border border-amber-200/70">
                <input
                  type="checkbox"
                  checked={line.enabled !== false}
                  onChange={(e) => {
                    const updated = [...(formData.customTechInfoLines || [])];
                    updated[customIdx].enabled = e.target.checked;
                    setFormData({ ...formData, customTechInfoLines: updated });
                  }}
                  className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                  title="Toggle custom line"
                />
                <input
                  type="text"
                  value={line.label}
                  onChange={(e) => {
                    const updated = [...(formData.customTechInfoLines || [])];
                    updated[customIdx].label = e.target.value;
                    setFormData({ ...formData, customTechInfoLines: updated });
                  }}
                  className="font-bold w-44 text-[9.5px] p-0.5 bg-white border border-slate-300 focus:border-amber-500 rounded text-slate-900"
                  placeholder="Title (e.g. Ultrasonic Test)"
                />
                <span className="font-bold text-[9.5px] text-slate-900 shrink-0">:</span>
                <input
                  type="text"
                  value={line.text || line.value || ''}
                  onChange={(e) => {
                    const updated = [...(formData.customTechInfoLines || [])];
                    updated[customIdx].text = e.target.value;
                    updated[customIdx].value = e.target.value;
                    setFormData({ ...formData, customTechInfoLines: updated });
                  }}
                  className="flex-1 p-0.5 bg-white border border-slate-300 rounded text-[9.5px] font-medium text-slate-900"
                  placeholder="Inspection status / note..."
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (formData.customTechInfoLines || []).filter((_, i) => i !== customIdx);
                    setFormData({ ...formData, customTechInfoLines: updated });
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1 cursor-pointer shrink-0"
                  title="Delete line"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 8. REMARKS / DECLARATION STATEMENT */}
        <div className="border border-black mb-1 p-1 bg-white">
          <div className="font-bold text-[8.5px] text-black mb-0.5 uppercase">Remarks / Declaration:</div>
          <textarea
            rows={2}
            value={formData.remarks || 'WE HEREBY CERTIFY THAT THE MATERIAL DESCRIBED HEREIN HAS BEEN TESTED AND COMPLIES IN ALL RESPECTS WITH THE SPECIFIED REQUIREMENTS AND STANDARDS.'}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            className="w-full p-0.5 bg-transparent border-0 font-medium text-[8px] sm:text-[8.5px] uppercase text-black leading-tight resize-none focus:bg-amber-50"
          />
        </div>

        {/* 9. SIGNATURES & STAMP CONTROLS TOOLBAR (PRINT HIDDEN) */}
        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[8px] print:hidden mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-500" /> Sign & Stamp Adjuster:
            </span>
            <button
              type="button"
              onClick={() => setShowSignStampDrawer(!showSignStampDrawer)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold cursor-pointer"
            >
              {showSignStampDrawer ? 'Hide Sliders' : 'Show Sliders'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="p-1 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer font-bold text-slate-800 flex items-center gap-1">
              <Upload className="w-2.5 h-2.5" /> Upload Prepared Sign
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onUploadLogo('engineer', e.target.files[0])}
                className="hidden"
              />
            </label>
            <label className="p-1 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer font-bold text-slate-800 flex items-center gap-1">
              <Upload className="w-2.5 h-2.5" /> Upload Stamp
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onUploadLogo('stamp', e.target.files[0])}
                className="hidden"
              />
            </label>
            <label className="p-1 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-pointer font-bold text-slate-800 flex items-center gap-1">
              <Upload className="w-2.5 h-2.5" /> Upload Approved Sign
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
                setFormData(prev => ({
                  ...prev,
                  preparedSignPosX: 0,
                  preparedSignPosY: 0,
                  approvedSignPosX: 0,
                  approvedSignPosY: 0,
                  stampPosX: 0,
                  stampPosY: 0,
                  preparedSignHeight: 52,
                  approvedSignHeight: 52,
                  stampHeight: 68
                }));
                onSaveAsset('preparedSignPosX', 0);
                onSaveAsset('preparedSignPosY', 0);
                onSaveAsset('approvedSignPosX', 0);
                onSaveAsset('approvedSignPosY', 0);
                onSaveAsset('stampPosX', 0);
                onSaveAsset('stampPosY', 0);
                onSaveAsset('preparedSignHeight', 52);
                onSaveAsset('approvedSignHeight', 52);
                onSaveAsset('stampHeight', 68);
              }}
              className="p-1 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded font-bold flex items-center gap-1 cursor-pointer"
              title="Reset Signatures & Stamp to default position and size"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>
        </div>

        {/* SIGNATURE & STAMP SLIDERS DRAWER */}
        {showSignStampDrawer && (
          <div className="bg-slate-100 p-2.5 rounded border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[8px] print:hidden mb-2">
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Prepared Sign Height:</span>
                <span>{formData.preparedSignHeight || 52}px</span>
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
                className="w-full h-1.5 bg-slate-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Approved Sign Height:</span>
                <span>{formData.approvedSignHeight || 52}px</span>
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
                className="w-full h-1.5 bg-slate-300 rounded cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Stamp Size:</span>
                <span>{formData.stampHeight || 68}px</span>
              </div>
              <input
                type="range"
                min="30"
                max="160"
                value={formData.stampHeight || 68}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData(prev => ({ ...prev, stampHeight: val }));
                  onSaveAsset('stampHeight', val);
                }}
                className="w-full h-1.5 bg-slate-300 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 10. SIGNATURES & STAMP AREA (PREPARED BY LEFT, APPROVED BY RIGHT - EXACT MTC 2 LAYOUT) */}
        <div className="flex items-end justify-between pt-2 relative border-t-2 border-black">
          {/* LEFT SIGNATURE AREA - PREPARED BY */}
          <div className="text-left space-y-0.5 flex flex-col justify-end relative">
            <div className="relative h-14 w-48 mb-0.5 flex items-end">
              {formData.engineerSignatureUrl ? (
                <div className="relative group/sig">
                  <DraggableImage
                    src={formData.engineerSignatureUrl}
                    alt="Engineer Signature"
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
            <div className="font-normal text-[8.5px] text-black leading-tight">Prepared By.</div>
            <div className="font-bold text-[8.5px] text-black leading-tight">Engineer QA/QC</div>
          </div>

          {/* RIGHT APPROVAL & STAMP AREA */}
          <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
            <div className="relative h-14 w-72 mb-0.5 flex items-end justify-end">
              {/* STAMP */}
              {formData.companyStampUrl ? (
                <div className="relative group/stamp">
                  <DraggableImage
                    src={formData.companyStampUrl}
                    alt="Company Stamp"
                    height={formData.stampHeight || 68}
                    posX={formData.stampPosX || 0}
                    posY={formData.stampPosY || 0}
                    onPositionChange={(nx, ny) => {
                      setFormData(prev => ({ ...prev, stampPosX: nx, stampPosY: ny }));
                      onSaveAsset('stampPosX', nx);
                      onSaveAsset('stampPosY', ny);
                    }}
                    className="max-w-[180px] object-contain absolute bottom-0 right-28 origin-bottom opacity-90 z-0"
                    title="Click & Drag to move Stamp"
                  />
                  <div className="absolute -top-3 right-28 opacity-0 group-hover/stamp:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 border border-slate-300 rounded px-1 py-0.5 text-[7.5px] font-bold print:hidden z-20 shadow-xs">
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
                    alt="Manager Signature"
                    height={formData.approvedSignHeight || 52}
                    posX={formData.approvedSignPosX || 0}
                    posY={formData.approvedSignPosY || 0}
                    onPositionChange={(nx, ny) => {
                      setFormData(prev => ({ ...prev, approvedSignPosX: nx, approvedSignPosY: ny }));
                      onSaveAsset('approvedSignPosX', nx);
                      onSaveAsset('approvedSignPosY', ny);
                    }}
                    className="max-w-[220px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
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

            <div className="font-normal text-[8.5px] text-black leading-tight">Approved By.</div>
            <div className="font-bold text-[8.5px] text-black leading-tight">QA/QC Manager</div>
            <div className="font-bold text-[8.5px] text-black tracking-tight leading-tight">{formData.companyName || getActiveCompany().name}</div>
          </div>
        </div>

      </div>

      {/* CONTEXT MENU FOR RIGHT CLICK ON ROWS */}
      {contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed bg-white border border-slate-300 shadow-xl rounded-md py-1 z-50 text-xs min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => insertRowAt(contextMenu.rowIndex, 'above')}
            className="w-full px-3 py-1.5 text-left hover:bg-amber-50 hover:text-amber-900 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Insert Row Above</span>
          </button>
          <button
            type="button"
            onClick={() => insertRowAt(contextMenu.rowIndex, 'below')}
            className="w-full px-3 py-1.5 text-left hover:bg-amber-50 hover:text-amber-900 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
            <span>Insert Row Below</span>
          </button>
          <button
            type="button"
            onClick={() => duplicateRowAt(contextMenu.rowIndex)}
            className="w-full px-3 py-1.5 text-left hover:bg-amber-50 hover:text-amber-900 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-600" />
            <span>Duplicate Row</span>
          </button>
          <div className="h-px bg-slate-200 my-1" />
          <button
            type="button"
            onClick={() => {
              removeRowFromCurrentSheet(contextMenu.rowIndex);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Row</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MTC 3 DEDICATED PRINT / PDF VIEW COMPONENT
// ==========================================
export interface MtcTemplate3PrintViewProps {
  record: QcReportRecord;
  sheetIndex?: number;
  activeSheetIndex?: number;
  pageNum?: number;
  totalPages?: number;
  DEFAULT_ISO_LOGO_URL?: string;
  isSample?: boolean;
}

export const MtcTemplate3PrintView: React.FC<MtcTemplate3PrintViewProps> = ({
  record,
  sheetIndex = 0,
  activeSheetIndex,
  pageNum = 1,
  totalPages = 1,
  DEFAULT_ISO_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/ISO_9001_Declaration.svg/320px-ISO_9001_Declaration.svg.png',
  isSample = false
}) => {
  const activeCompany = getActiveCompany();
  const currentSheetIndex = activeSheetIndex ?? sheetIndex ?? 0;
  const currentSheet: MtcSheetData = (record.items && record.items.length > 0 && !record.sheets?.[currentSheetIndex])
    ? {
        id: `s-${currentSheetIndex}`,
        sheetNo: currentSheetIndex + 1,
        title: `SHEET ${currentSheetIndex + 1}`,
        items: record.items || [],
        chemicalData: record.chemicalData || [],
        mechanicalData: record.mechanicalData || [],
        chemSpecMin: record.chemSpecMin,
        chemSpecMax: record.chemSpecMax,
        chemUnits: record.chemUnits,
        mechSpecMin: record.mechSpecMin,
        mechSpecMax: record.mechSpecMax,
        customTechInfoLines: record.customTechInfoLines
      }
    : ((record.sheets && record.sheets[currentSheetIndex]) 
        ? {
            ...record.sheets[currentSheetIndex],
            items: (record.items && record.items.length > 0) ? record.items : record.sheets[currentSheetIndex].items,
            chemicalData: (record.chemicalData && record.chemicalData.length > 0) ? record.chemicalData : record.sheets[currentSheetIndex].chemicalData,
            mechanicalData: (record.mechanicalData && record.mechanicalData.length > 0) ? record.mechanicalData : record.sheets[currentSheetIndex].mechanicalData,
          }
        : {
            id: 's-fallback',
            sheetNo: currentSheetIndex + 1,
            title: `SHEET ${currentSheetIndex + 1}`,
            items: record.items || [],
            chemicalData: record.chemicalData || [],
            mechanicalData: record.mechanicalData || [],
            chemSpecMin: record.chemSpecMin,
            chemSpecMax: record.chemSpecMax,
            chemUnits: record.chemUnits,
            mechSpecMin: record.mechSpecMin,
            mechSpecMax: record.mechSpecMax,
            customTechInfoLines: record.customTechInfoLines
          });

  const chemOverrides = record.chemHeaderOverrides || {};
  const activeChemCols: Array<{ k: keyof QcChemicalItem; label: string }> = [
    { k: 'c', label: chemOverrides.c || '%C' },
    { k: 'si', label: chemOverrides.si || '%Si' },
    { k: 'mn', label: chemOverrides.mn || '%Mn' },
    { k: 'p', label: chemOverrides.p || '%P' },
    { k: 's', label: chemOverrides.s || '%S' },
    { k: 'cr', label: chemOverrides.cr || '%Cr' },
    { k: 'ni', label: chemOverrides.ni || '%Ni' },
    { k: 'mo', label: chemOverrides.mo || '%Mo' },
    { k: 'cu', label: chemOverrides.cu || '%Cu' },
    { k: 'v', label: chemOverrides.v || '%V' },
    { k: 'n', label: chemOverrides.n || '%N' },
    { k: 'al', label: chemOverrides.al || '%Al' },
    { k: 'ti', label: chemOverrides.ti || '%Ti' },
    { k: 'b', label: chemOverrides.b || '%B' }
  ];
  if (record.showColPb !== undefined ? record.showColPb : false) activeChemCols.push({ k: 'pb', label: chemOverrides.pb || '%Pb' });
  if (record.showColZn !== undefined ? record.showColZn : false) activeChemCols.push({ k: 'zn', label: chemOverrides.zn || '%Zn' });
  if (record.showColFe !== undefined ? record.showColFe : false) activeChemCols.push({ k: 'fe', label: chemOverrides.fe || '%Fe' });
  if (record.showColSn !== undefined ? record.showColSn : false) activeChemCols.push({ k: 'sn', label: chemOverrides.sn || '%Sn' });
  if (record.showImpurity) activeChemCols.push({ k: 'totalImpurity', label: chemOverrides.totalImpurity || 'Impurity' });
  if (record.showOther) activeChemCols.push({ k: 'other', label: chemOverrides.other || 'Other' });

  const defaultMechLabels: Record<string, string> = {
    tsMpa: 'TENSILE STRENGTH (UTS)',
    ysMpa: 'YIELD STRENGTH (YS)',
    elPct: 'ELONGATION (EL)',
    raPct: 'REDUCTION OF AREA (RA)',
    proofLoadLbf: 'PROOFLOAD',
    hardness: 'HARDNESS',
    stressUnderProofloadMpa: 'STRESS UNDER PROOFLOAD',
    heatTreatment: 'HEAT TREATMENT',
    hardness24Hr540C: 'HARDNESS AFTER TREATMENT',
    quenchingTempC: 'QUENCHING TEMP',
    quenchingHoldingTime: 'HOLDING TIME (QUENCH)',
    quenchingMedium: 'QUENCHING MEDIUM',
    temperingTempC: 'TEMPER TEMP',
    temperingHoldingTime: 'HOLDING TIME (TEMPER)',
    stressRelievedC: 'STRESS RELIEVED',
    temperingResult: 'TEMPER',
    impactJ: 'IMPACT IN J',
    avgImpactJ: 'AVERAGE IMPACT IN J',
    impactTempC: 'IMPACT TEST TEMP',
    pren: 'PREN'
  };

  const getMechColLabel = (key: string, customOrLegacyLabel?: string) => {
    if (record.mechHeaderOverrides?.[key]) {
      return record.mechHeaderOverrides[key];
    }
    if (customOrLegacyLabel && !['Y.S (Mpa)', 'T.S (Mpa)', 'EL (%)', 'R.A (%)', 'Elongation El-(%)', 'Hardness', 'Proof Load', 'Proofload Lbf'].includes(customOrLegacyLabel)) {
      return customOrLegacyLabel;
    }
    return defaultMechLabels[key] || customOrLegacyLabel || key.toUpperCase();
  };

  const activeMechCols: Array<{ k: string; label: string }> = [
    { k: 'tsMpa', label: getMechColLabel('tsMpa', record.labelTensile) },
    { k: 'ysMpa', label: getMechColLabel('ysMpa', record.labelYield) },
    { k: 'elPct', label: getMechColLabel('elPct', record.labelElongation) },
    { k: 'raPct', label: getMechColLabel('raPct', record.labelReduction) },
  ];
  if (record.showColProofLoad !== false) {
    activeMechCols.push({ k: 'proofLoadLbf', label: getMechColLabel('proofLoadLbf', record.labelProofLoad) });
  }
  activeMechCols.push({ k: 'hardness', label: getMechColLabel('hardness', record.labelHardness) });
  if (record.showColStressUnderProofload ?? false) activeMechCols.push({ k: 'stressUnderProofloadMpa', label: getMechColLabel('stressUnderProofloadMpa', record.labelStressUnderProofload) });
  if (record.showColHeatTreatment ?? false) activeMechCols.push({ k: 'heatTreatment', label: getMechColLabel('heatTreatment', record.labelHeatTreatment) });
  if (record.showColHardness24Hr ?? false) activeMechCols.push({ k: 'hardness24Hr540C', label: getMechColLabel('hardness24Hr540C', record.labelHardness24Hr) });
  if (record.showColQuenchingTemp ?? false) activeMechCols.push({ k: 'quenchingTempC', label: getMechColLabel('quenchingTempC', record.labelQuenchingTemp) });
  if (record.showColQuenchingTime ?? false) activeMechCols.push({ k: 'quenchingHoldingTime', label: getMechColLabel('quenchingHoldingTime', record.labelQuenchingTime) });
  if (record.showColQuenchingMedium ?? false) activeMechCols.push({ k: 'quenchingMedium', label: getMechColLabel('quenchingMedium', record.labelQuenchingMedium) });
  if (record.showColTemperingTemp ?? false) activeMechCols.push({ k: 'temperingTempC', label: getMechColLabel('temperingTempC', record.labelTemperingTemp) });
  if (record.showColTemperingTime ?? false) activeMechCols.push({ k: 'temperingHoldingTime', label: getMechColLabel('temperingHoldingTime', record.labelTemperingTime) });
  if (record.showColStressRelieved ?? false) activeMechCols.push({ k: 'stressRelievedC', label: getMechColLabel('stressRelievedC', record.labelStressRelieved) });
  if (record.showColTemperingResult ?? false) activeMechCols.push({ k: 'temperingResult', label: getMechColLabel('temperingResult', record.labelTemperingResult) });
  if (record.showColImpactJ ?? false) activeMechCols.push({ k: 'impactJ', label: getMechColLabel('impactJ', record.labelImpactJ) });
  if (record.showColAvgImpactJ ?? false) activeMechCols.push({ k: 'avgImpactJ', label: getMechColLabel('avgImpactJ', record.labelAvgImpactJ) });
  if (record.showColImpactTemp ?? false) activeMechCols.push({ k: 'impactTempC', label: getMechColLabel('impactTempC', record.labelImpactTemp) });
  if (record.showColPren ?? false) activeMechCols.push({ k: 'pren', label: getMechColLabel('pren', record.labelPren) });

  const formatChemVal = (val: any) => (val === undefined || val === null ? '' : String(val));

  const effectiveMechData = (currentSheet.mechanicalData && currentSheet.mechanicalData.length > 0)
    ? currentSheet.mechanicalData
    : ((record.mechanicalData && record.mechanicalData.length > 0) ? record.mechanicalData : (record.items || []));

  return (
    <div 
      className="cert-page w-[200mm] min-w-[200mm] min-h-[280mm] mx-auto p-3 sm:p-4 bg-white text-black font-sans shadow-none rounded-none relative flex flex-col justify-between"
      style={{
        fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
        border: "2px solid #000000",
        boxSizing: "border-box"
      }}
    >
      {/* SAMPLE WATERMARK */}
      {isSample && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20 select-none">
          <div 
            className="font-black uppercase tracking-widest whitespace-nowrap text-slate-400/20 border-2 sm:border-[3px] border-slate-400/25 rounded-2xl px-6 py-2 transform -rotate-[30deg] text-[32px] sm:text-[42px] leading-none"
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

      {/* 1. TOP HEADER BLOCK WITH COMPANY DETAILS, ISO LOGOS & CERTIFICATE TITLE */}
      <div className="border-b-2 border-black pb-2 mb-1 flex items-start justify-between gap-3 bg-white">
        {/* LEFT: COMPANY LOGO & DETAILS */}
        <div className="flex items-start gap-2.5 shrink-0 max-w-[48%]">
          {record.companyLogoUrl ? (
            <img src={record.companyLogoUrl} alt="Company Logo" className="h-14 max-w-[150px] object-contain" />
          ) : (
            <div className="h-12 flex flex-col justify-center">
              <span className="text-xs font-black text-black tracking-wider uppercase">{record.companyName ?? (activeCompany?.name || 'COMPANY NAME')}</span>
              <span className="text-[8px] font-bold text-slate-600 uppercase">QA/QC LABORATORY</span>
            </div>
          )}
          <div>
            <div className="font-black text-[12.5px] uppercase tracking-tight text-black leading-tight">
              {record.companyName ?? (activeCompany?.name || 'COMPANY NAME')}
            </div>
            <div className="text-[8.5px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
              {record.companyTagline ?? (activeCompany?.subtitle || '')}
            </div>
            <div className="text-[7.5px] font-medium text-slate-800 leading-tight mt-0.5">
              <div>{record.companyAddress ?? (activeCompany?.address || '')}</div>
              <div className="font-semibold text-slate-900 mt-0.5">{record.companyContact ?? ((activeCompany?.email ? activeCompany.email + ' | ' + (activeCompany.website || '') : ''))}</div>
            </div>
          </div>
        </div>

        {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only for Marine Fasteners or companies with ISO enabled) */}
        <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
          {getCompanyIsoText() ? (
            <>
              <img 
                src={record.isoLogoUrl || DEFAULT_ISO_LOGO_URL} 
                alt="ISO Certification Logos" 
                className="h-10 sm:h-11 max-w-[280px] sm:max-w-[320px] object-contain" 
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
            <div className="h-10" />
          )}
        </div>

        {/* RIGHT: MATERIAL TEST CERTIFICATE TITLE & PAGE NUMBER */}
        <div className="text-right shrink-0">
          <div className="font-black text-[13.5px] uppercase tracking-tight text-black underline leading-none mb-0.5">
            {record.certTitle ?? 'MATERIAL TEST CERTIFICATE'}
          </div>
          <div className="font-bold text-[8.5px] uppercase tracking-tight text-black">
            {record.certStandard ?? 'CERTIFIED TO BS EN 10204, 3.1'}
          </div>
          <div className="font-bold text-[9px] uppercase tracking-tight text-black mt-0.5">
            PAGE NO : {record.pageNo || `${pageNum} OF ${totalPages}`}
          </div>
        </div>
      </div>

      {/* 2. METADATA 2-ROW x 3-COLUMN TABLE */}
      <table className="w-full border-collapse border border-black text-[8.5px] font-sans table-fixed mb-1 bg-white">
        <tbody>
          <tr className="border-b border-black">
            <td className="w-[14%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Certifcate No:</td>
            <td className="w-[26%] p-1 font-black border-r border-black text-left px-1.5 uppercase text-amber-950">
              {currentSheet.certNo || (currentSheetIndex > 0 ? incrementCertNo(record.certificateNum || record.certNo || record.issueNo, currentSheetIndex) : (record.certificateNum || record.certNo || record.issueNo || '—'))}
            </td>
            <td className="w-[15%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Work Order Number:</td>
            <td className="w-[20%] p-1 font-bold border-r border-black text-left px-1.5">
              {record.workOrderNum || '—'}
            </td>
            <td className="w-[11%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Customer:</td>
            <td className="w-[24%] p-1 font-black text-left px-1.5 uppercase text-amber-950">
              {record.customerName || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Date:</td>
            <td className="p-1 font-black border-r border-black text-left px-1.5 text-amber-950">
              {record.date || '—'}
            </td>
            <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Invoice Number:</td>
            <td className="p-1 font-bold border-r border-black text-left px-1.5">
              {record.invoiceNum || '—'}
            </td>
            <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">PO Number:</td>
            <td className="p-1 font-bold text-left px-1.5">
              {record.customerPoNum || '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 3. TABLE 1: PRODUCT DESCRIPTION */}
      <div className="space-y-0.5">
        <div className="bg-white text-black border border-black px-2 py-0.5">
          <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*PRODUCT DESCRIPTION.</span>
        </div>

        <table className="w-full border-collapse border border-black text-[8.5px] sm:text-[9px] table-fixed bg-white">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-black text-center text-[8.5px]">
              <th className="border border-black p-1 w-[4%]">Item</th>
              <th className="border border-black p-1 w-[30%]">Description</th>
              <th className="border border-black p-1 w-[11%]">Size</th>
              <th className="border border-black p-1 w-[18%]">Specification / Standard</th>
              <th className="border border-black p-1 w-[8%]">Qty</th>
              <th className="border border-black p-1 w-[8%]">Finish</th>
              <th className="border border-black p-1 w-[11%]">Marking</th>
              <th className="border border-black p-1 w-[10%]">Heat No</th>
            </tr>
          </thead>
          <tbody>
            {(currentSheet.items || []).map((it, idx) => (
              <tr key={idx} className="border-b border-black text-[8.5px] sm:text-[9px]">
                <td className="border border-black p-0.5 text-center font-bold">{it.itemNo || (idx + 1)}</td>
                <td className="border border-black p-0.5 font-semibold text-slate-900 uppercase leading-tight px-1 break-words">{it.description || '—'}</td>
                <td className="border border-black p-0.5 font-medium text-center">{it.size || '—'}</td>
                <td className="border border-black p-0.5 font-medium text-center uppercase break-words">{it.material || it.standard || '—'}</td>
                <td className="border border-black p-0.5 font-medium text-center">{it.qty || '—'}</td>
                <td className="border border-black p-0.5 font-medium text-center uppercase">{it.finish || '—'}</td>
                <td className="border border-black p-0.5 text-center align-middle">
                  <div className="flex items-center justify-start gap-1 w-full whitespace-nowrap px-0.5 overflow-hidden">
                    {it.markingImage && (
                      <img src={it.markingImage} alt="Marking" className="max-h-4 max-w-[28px] object-contain border border-slate-200 rounded p-0.5 bg-white shrink-0" />
                    )}
                    <span className="font-medium text-left text-[8px] uppercase truncate">{it.marking || ''}</span>
                  </div>
                </td>
                <td className="border border-black p-0.5 font-bold text-center text-amber-950 uppercase">{it.heatNo || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. TABLE 2: CHEMICAL ANALYSIS */}
      <div className="space-y-0.5">
        <div className="bg-white text-black border border-black px-2 py-0.5">
          <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*CHEMICAL ANALYSIS.</span>
        </div>

        <table className="w-full border-collapse border border-black text-[7.5px] sm:text-[8px] table-fixed bg-white text-center">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-black text-black">
              <th rowSpan={4} className="border border-black p-0.5 w-[3.5%] align-middle text-center font-bold">Item</th>
              <th rowSpan={4} className="border border-black p-0.5 w-[11.5%] align-middle text-center font-bold">Heat No</th>
              <th className="border border-black p-0.5 w-[5%] bg-slate-100 text-center font-bold text-[7.5px] sm:text-[8px]">SPEC</th>
              {activeChemCols.map(col => {
                const currentLabel = record.chemHeaderOverrides?.[col.k] ?? col.label;
                return (
                  <th key={col.k} className="border border-black p-0.5 font-bold text-center break-words whitespace-normal leading-tight" style={{ width: `${(80.0 / activeChemCols.length).toFixed(3)}%` }}>
                    {currentLabel}
                  </th>
                );
              })}
            </tr>
            {/* MIN ROW */}
            <tr className="bg-slate-50 border-b border-black font-bold">
              <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7.5px] tracking-wider bg-slate-100/70">
                MIN
              </th>
              {activeChemCols.map(col => {
                const minVal = currentSheet.chemSpecMin?.[col.k as any] ?? record.chemSpecMin?.[col.k as any];
                return (
                  <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal text-center text-[7.5px] text-slate-800 break-words">
                    {minVal ? formatChemVal(minVal) : '—'}
                  </th>
                );
              })}
            </tr>
            {/* MAX ROW */}
            <tr className="bg-slate-50 border-b border-black font-bold">
              <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7.5px] tracking-wider bg-slate-100/70">
                MAX
              </th>
              {activeChemCols.map(col => {
                const maxVal = currentSheet.chemSpecMax?.[col.k as any] ?? record.chemSpecMax?.[col.k as any];
                return (
                  <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal text-center text-[7.5px] text-slate-800 break-words">
                    {maxVal ? formatChemVal(maxVal) : '—'}
                  </th>
                );
              })}
            </tr>
            {/* UNIT ROW */}
            <tr className="bg-slate-50 border-b border-black font-bold">
              <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7.5px] tracking-wider bg-slate-100/70">
                (%)
              </th>
              {activeChemCols.map(col => {
                const unitVal = currentSheet.chemUnits?.[col.k as any] ?? record.chemUnits?.[col.k as any] ?? '(%)';
                return (
                  <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal text-center text-[7.5px] text-slate-800">
                    {unitVal || '(%)'}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {(currentSheet.chemicalData || []).map((chem, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border border-black p-0.5 font-bold text-center">{chem.itemNo || (idx + 1)}</td>
                <td className="border border-black p-0.5 font-bold text-amber-950 uppercase text-center break-words">{chem.heatNo || '—'}</td>
                <td className="border border-black p-0.5 font-bold text-center text-[7px] text-slate-600 bg-slate-50/50">
                  ACTUAL
                </td>
                {activeChemCols.map(col => (
                  <td key={col.k} className="border border-black p-0.5 font-medium text-center text-[7.5px] break-words">
                    {formatChemVal((chem as any)[col.k]) || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. TABLE 3: MECHANICAL PROPERTIES */}
      <div className="space-y-0.5">
        <div className="bg-white text-black border border-black px-2 py-0.5">
          <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*MECHANICAL PROPERTIES.</span>
        </div>

        <table className="w-full border-collapse border border-black text-[7px] sm:text-[7.5px] table-fixed bg-white text-center">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-black text-black">
              <th rowSpan={3} className="border border-black p-0.5 w-[3.5%] align-middle text-center font-bold">Item</th>
              <th rowSpan={3} className="border border-black p-0.5 w-[11.5%] align-middle text-center font-bold">Heat No</th>
              <th className="border border-black p-0.5 w-[5%] bg-slate-100 text-center font-bold text-[7px] sm:text-[7.5px] align-middle">SPEC</th>
              {activeMechCols.map(col => {
                const currentLabel = record.mechHeaderOverrides?.[col.k] ?? col.label;
                return (
                  <th key={col.k} className="border border-black p-0.5 font-bold text-center align-middle whitespace-normal break-words leading-tight text-[6.5px] sm:text-[7px] [overflow-wrap:anywhere]" style={{ width: `${(80.0 / activeMechCols.length).toFixed(3)}%` }}>
                    {currentLabel}
                  </th>
                );
              })}
            </tr>
            {/* MIN ROW */}
            <tr className="bg-slate-50 border-b border-black font-bold">
              <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7px] tracking-wider bg-slate-100/70 align-middle">
                MIN
              </th>
              {activeMechCols.map(col => {
                const minVal = currentSheet.mechSpecMin?.[col.k] ?? record.mechSpecMin?.[col.k] ?? getMechSpecValue(currentSheet.mechSpecMin, col.k) ?? getMechSpecValue(record.mechSpecMin, col.k);
                return (
                  <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal align-middle text-center text-[7px] text-slate-800 break-words [overflow-wrap:anywhere]">
                    {minVal ? formatNumericVal(minVal) : '—'}
                  </th>
                );
              })}
            </tr>
            {/* MAX ROW */}
            <tr className="bg-slate-50 border-b border-black font-bold">
              <th className="border border-black p-0.5 font-black text-center text-slate-800 text-[7px] tracking-wider bg-slate-100/70 align-middle">
                MAX
              </th>
              {activeMechCols.map(col => {
                const maxVal = currentSheet.mechSpecMax?.[col.k] ?? record.mechSpecMax?.[col.k] ?? getMechSpecValue(currentSheet.mechSpecMax, col.k) ?? getMechSpecValue(record.mechSpecMax, col.k);
                return (
                  <th key={col.k} className="border border-black p-0.5 bg-slate-50/80 font-normal align-middle text-center text-[7px] text-slate-800 break-words [overflow-wrap:anywhere]">
                    {maxVal ? formatNumericVal(maxVal) : '—'}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {effectiveMechData.map((mech, idx) => (
              <tr key={idx} className="border-b border-black">
                <td className="border border-black p-0.5 font-bold text-center align-middle">{mech.itemNo || (idx + 1)}</td>
                <td className="border border-black p-0.5 font-bold text-amber-950 uppercase align-middle text-center break-words">{mech.heatNo || '—'}</td>
                <td className="border border-black p-0.5 font-bold text-center text-[7px] text-slate-600 bg-slate-50/50 align-middle">
                  ACTUAL
                </td>
                {activeMechCols.map(col => {
                  const cellVal = (mech as any)[col.k] !== undefined && (mech as any)[col.k] !== null && String((mech as any)[col.k]).trim() !== ''
                    ? (mech as any)[col.k]
                    : getMechPropValue(mech, col.k);
                  return (
                    <td key={col.k} className="border border-black p-0.5 align-middle font-medium text-center text-[7px] sm:text-[7.5px] break-words whitespace-normal leading-tight [overflow-wrap:anywhere]">
                      {cellVal ? formatNumericVal(cellVal) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MACRO ETCH TABLE (IF ENABLED) */}
      {record.showMacroEtch && (
        <div className="mb-1 border border-black p-1 bg-white">
          <div className="font-black text-[9px] tracking-wider mb-0.5 text-black">Macro Etch</div>
          <table className="w-full border-collapse border border-black text-[7.5px] text-center table-fixed bg-white">
            <thead>
              <tr className="bg-white border-b border-black font-black text-[8px]">
                <th className="border border-black p-0.5 w-[15%]">Division</th>
                <th className="border border-black p-0.5 w-[22%]">Surface Condition</th>
                <th className="border border-black p-0.5 w-[22%]">Random Condition</th>
                <th className="border border-black p-0.5 w-[22%]">Center Segregation</th>
                <th className="border border-black p-0.5 w-[19%]"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border border-black p-0.5 font-bold bg-white">Spec.</td>
                <td className="border border-black p-0.5">{record.macroEtchSpecSurface || 'S2'}</td>
                <td className="border border-black p-0.5">{record.macroEtchSpecRandom || 'R2'}</td>
                <td className="border border-black p-0.5">{record.macroEtchSpecCenter || 'C3'}</td>
                <td className="border border-black p-0.5"></td>
              </tr>
              <tr>
                <td className="border border-black p-0.5 font-bold bg-white">Results</td>
                <td className="border border-black p-0.5 font-black">{record.macroEtchResultSurface || 'S2'}</td>
                <td className="border border-black p-0.5 font-black">{record.macroEtchResultRandom || 'R2'}</td>
                <td className="border border-black p-0.5 font-black">{record.macroEtchResultCenter || 'C3'}</td>
                <td className="border border-black p-0.5"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* HEAT TREATMENT (IF ENABLED) */}
      {record.showHeatTreatment && (
        <div className="border border-black mb-1 text-[9px] bg-white">
          <div className="font-black p-1 px-1.5 border-b border-black text-[9.5px] text-black bg-white">
            *Heat Treatment
          </div>
          <div className="p-1.5 space-y-1 font-sans leading-tight text-[9px]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="w-48 font-bold text-slate-900">Carbide Solution treated :</span>
              <span className="flex-1 font-medium text-slate-900">{record.heatTreatmentCarbide || 'Was treated by raw material factory'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="w-48 font-bold text-slate-900">Strain Hardened :</span>
              <span className="flex-1 font-medium text-slate-900">{record.heatTreatmentStrain || 'Was treated'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="w-48 font-bold text-slate-900">Quenching :</span>
              <span className="flex-1 font-medium text-slate-900">{record.heatTreatmentQuenching || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="w-48 font-bold text-slate-900">Tempering :</span>
              <span className="flex-1 font-medium text-slate-900">{record.heatTreatmentTempering || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ADDITIONAL TECHNICAL INFORMATION */}
      <div className="border border-black mb-1 text-[9px] bg-white">
        <div className="font-black p-1 px-1.5 border-b border-black text-[9.5px] text-black bg-white">
          Additional Technical Information:-
        </div>
        <div className="p-1.5 space-y-1 font-sans leading-tight text-[9px]">
          {record.showTechInfoVisual !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoVisualLabel ?? 'Visual Inspection'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoVisual || 'Found to be free from crack, flaws, sharp edges and other defects.'}</span>
            </div>
          )}

          {record.showTechInfoThread !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoThreadLabel ?? 'Thread acceptability'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoThread || 'has been inspected as per ASME B1.1 CL 2A and found ok.'}</span>
            </div>
          )}

          {record.showTechInfoGauge !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoGaugeLabel ?? 'Gauge Fit'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoGauge || 'Inspection using 6g GO gauge and 6g NO GO gauge,'}</span>
            </div>
          )}

          {record.showTechInfoDimensions !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoDimensionsLabel ?? 'Dimensions'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoDimensions || 'Found Satisfactory/ As per Standard requirement.'}</span>
            </div>
          )}

          {record.showTechInfoHeatTreatment !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoHeatTreatmentLabel ?? 'Heat Treatment'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoHeatTreatment || 'Quenched Liquid & tempered.'}</span>
            </div>
          )}

          {record.showTechInfoHdg !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoHdgLabel ?? 'HDG'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoHdg || 'As per ASTM A153 CL-C found satisfactory.'}</span>
            </div>
          )}

          {record.showTechInfoGi && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoGiLabel ?? 'GI'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoGi || 'As per ASTM B633 Found satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoGalv && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoGalvLabel ?? 'Galv'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoGalv || 'As per ASTM B633 Found satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoSelf && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoSelfLabel ?? 'Self'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoSelf || 'Found satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoYellow && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoYellowLabel ?? 'Yellow'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoYellow || 'Found Satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoCadmium && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoCadmiumLabel ?? 'Cadmium Plating'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoCadmium || 'Found Satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoSaltSpray && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoSaltSprayLabel ?? 'Salt Spray Test'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoSaltSpray || 'Passed test criteria.'}</span>
            </div>
          )}

          {record.showTechInfoNickel && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoNickelLabel ?? 'Nickel Plating'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoNickel || 'Found satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoFluropolymer && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoFluropolymerLabel ?? 'Fluropolymer coating'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoFluropolymer || 'Found satisfactory'}</span>
            </div>
          )}

          {record.showTechInfoPtfeBlue && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="font-bold w-44 text-slate-900">{record.techInfoPtfeBlueTitle || 'PTFE BLUE (XYLAN 1070)'}</span>
                <span className="font-bold text-slate-900 shrink-0">:</span>
                <span className="flex-1 font-medium text-slate-900">{record.techInfoPtfeBlue || 'Found Satisfactory'}</span>
              </div>
              {record.techInfoPtfeBlueTemp && (
                <div className="flex items-center gap-1.5 pl-5">
                  <span className="font-bold text-slate-900 shrink-0">:</span>
                  <span className="flex-1 font-medium text-slate-900">{record.techInfoPtfeBlueTemp}</span>
                </div>
              )}
            </div>
          )}

          {record.showTechInfoNace !== false && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{record.techInfoNaceLabel ?? 'NACE Compliance'}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{record.techInfoNace || 'We hereby confirm that the material Complies to NACE MR/0175/ ISO 15156-2 requirements.'}</span>
            </div>
          )}

          {/* Custom Lines */}
          {(record.customTechInfoLines || currentSheet.customTechInfoLines || []).filter(l => l.enabled !== false).map((line) => (
            <div key={line.id} className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-amber-800 shrink-0" />
              <span className="font-bold w-44 text-slate-900">{line.label}</span>
              <span className="font-bold text-slate-900 shrink-0">:</span>
              <span className="flex-1 font-medium text-slate-900">{line.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. OFFICIAL REMARKS STATEMENT */}
      <div className="border-t-2 border-black pt-1 space-y-0.5">
        <div className="text-[7.5px] font-extrabold uppercase text-slate-700 tracking-tight">
          OFFICIAL CERTIFICATION REMARKS:
        </div>
        <p className="p-1 bg-amber-50/20 border border-slate-200 rounded font-bold text-[8.5px] text-black leading-snug">
          {record.remarks || 'We certify that the material described above has been inspected, tested and found to conform in all respects to the specification and order requirements.'}
        </p>
      </div>

      {/* 7. SIGNATURES & STAMP AREA */}
      <div className="flex items-end justify-between pt-2 relative border-t-2 border-black">
        {/* LEFT SIGNATURE AREA - PREPARED BY */}
        <div className="text-left space-y-0.5 flex flex-col justify-end relative">
          <div className="relative h-14 w-48 mb-0.5">
            {record.engineerSignatureUrl && (
              <img
                src={record.engineerSignatureUrl}
                alt="Engineer Signature"
                style={{
                  height: `${record.preparedSignHeight || 52}px`,
                  transform: `translate(${record.preparedSignPosX || 0}px, ${record.preparedSignPosY || 0}px)`
                }}
                className="max-w-[180px] object-contain absolute bottom-0 left-0 origin-bottom-left"
              />
            )}
          </div>
          <div className="font-normal text-[8.5px] text-black leading-tight">Prepared By.</div>
          <div className="font-bold text-[8.5px] text-black leading-tight">Engineer QA/QC</div>
        </div>

        {/* RIGHT APPROVAL & STAMP AREA */}
        <div className="text-right space-y-0.5 flex flex-col justify-end relative items-end">
          <div className="relative h-14 w-72 mb-0.5 flex items-end justify-end">
            {/* STAMP */}
            {record.companyStampUrl && (
              <img
                src={record.companyStampUrl}
                alt="Company Stamp"
                style={{
                  height: `${record.stampHeight || 68}px`,
                  transform: `translate(${record.stampPosX || 0}px, ${record.stampPosY || 0}px)`
                }}
                className="max-w-[180px] object-contain absolute bottom-0 right-28 origin-bottom opacity-90 z-0"
              />
            )}

            {/* APPROVED BY SIGNATURE */}
            {record.managerSignatureUrl && (
              <img
                src={record.managerSignatureUrl}
                alt="Manager Signature"
                style={{
                  height: `${record.approvedSignHeight || 52}px`,
                  transform: `translate(${record.approvedSignPosX || 0}px, ${record.approvedSignPosY || 0}px)`
                }}
                className="max-w-[220px] object-contain absolute bottom-0 right-0 origin-bottom-right z-10"
              />
            )}
          </div>

          <div className="font-normal text-[8.5px] text-black leading-tight">Approved By.</div>
          <div className="font-bold text-[8.5px] text-black leading-tight">QA/QC Manager</div>
          <div className="font-bold text-[8.5px] text-black tracking-tight leading-tight">{record.companyName || getActiveCompany().name}</div>
        </div>
      </div>
    </div>
  );
};

