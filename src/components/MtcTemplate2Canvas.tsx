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
  CheckCircle,
  Undo2,
  Redo2,
  Copy,
  ArrowUp,
  ArrowDown,
  PlusCircle,
  Image as ImageIcon
} from 'lucide-react';
import { QcReportRecord, QcRecordItem, QcChemicalItem, QcMechanicalItem, formatNumericVal } from './QcReportsComponent';
import { getActiveCompany, isMarineFastenersCompany, getCompanyIsoText, getCompanyQcHead, CompanyProfile } from '../utils/companyProfile';

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
      className={`${className} transition-none select-none hover:ring-1 hover:ring-amber-500 rounded`}
      title={title}
    />
  );
};

export interface MtcTemplate2CanvasProps {
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

export const MtcTemplate2Canvas: React.FC<MtcTemplate2CanvasProps> = ({
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
  const [showChemColDrawer, setShowChemColDrawer] = useState(true);
  const [showSignStampDrawer, setShowSignStampDrawer] = useState(false);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);

  useEffect(() => {
    const handleCompanyUpdate = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('active_company_changed', handleCompanyUpdate);
    window.addEventListener('company_profile_updated', handleCompanyUpdate);
    window.addEventListener('companies_list_updated', handleCompanyUpdate);
    return () => {
      window.removeEventListener('active_company_changed', handleCompanyUpdate);
      window.removeEventListener('company_profile_updated', handleCompanyUpdate);
      window.removeEventListener('companies_list_updated', handleCompanyUpdate);
    };
  }, []);

  // Selected multi-cell ranges for Excel-like selection in MTC 2 tables
  const [selectedItemCells, setSelectedItemCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [selectedChemCells, setSelectedChemCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [selectedMechCells, setSelectedMechCells] = useState<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);

  const isItemCellSelected = (rIdx: number, cIdx: number) => {
    if (!selectedItemCells) return false;
    const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
    const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
    const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
    const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  const isChemCellSelected = (rIdx: number, cIdx: number) => {
    if (!selectedChemCells) return false;
    const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
    const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
    const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
    const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  const isMechCellSelected = (rIdx: number, cIdx: number) => {
    if (!selectedMechCells) return false;
    const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
    const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
    const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
    const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  // Update chemical header override
  const updateChemHeader = (key: string, value: string) => {
    const overrides = { ...(formData.chemHeaderOverrides || {}), [key]: value };
    setFormData(prev => ({ ...prev, chemHeaderOverrides: overrides }));
  };

  // Update mechanical header override
  const updateMechHeader = (key: string, value: string) => {
    const overrides = { ...(formData.mechHeaderOverrides || {}), [key]: value };
    setFormData(prev => ({ ...prev, mechHeaderOverrides: overrides }));
  };

  // Marking image upload handler
  const handleMarkingImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = [...formData.items];
      updated[idx] = { ...updated[idx], markingImage: dataUrl };
      setFormData(prev => ({ ...prev, items: updated }));
    };
    reader.readAsDataURL(file);
  };

  const removeMarkingImage = (idx: number) => {
    const updated = [...formData.items];
    updated[idx] = { ...updated[idx], markingImage: undefined };
    setFormData(prev => ({ ...prev, items: updated }));
  };

  // Row Context Menu for Inserting/Deleting Rows with Chemical & Mechanical synchronization
  const [rowContextMenu, setRowContextMenu] = useState<{
    x: number;
    y: number;
    rowIdx: number;
    section: 'items' | 'chemical' | 'mechanical';
  } | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setRowContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('scroll', handleCloseMenu, true);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('scroll', handleCloseMenu, true);
    };
  }, []);

  const handleInsertRowAt = (targetIdx: number, position: 'above' | 'below') => {
    const insertIdx = position === 'above' ? targetIdx : targetIdx + 1;
    const newItem: QcRecordItem = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      itemNo: (insertIdx + 1).toString(),
      description: '',
      type: '',
      material: '',
      standard: '',
      size: '',
      classSch: '',
      qty: '',
      heatNo: '',
      heatTreatment: '',
      ndePmi: '',
      remark: '',
      finish: '',
      marking: ''
    };

    const newChem: QcChemicalItem = {
      itemNo: (insertIdx + 1).toString(),
      heatNo: '',
      specType: 'L'
    };

    const newMech: QcMechanicalItem = {
      itemNo: (insertIdx + 1).toString(),
      heatNo: '',
      specType: 'P'
    };

    const updatedItems = [...formData.items];
    const updatedChem = [...(formData.chemicalData || [])];
    const updatedMech = [...(formData.mechanicalData || [])];

    while (updatedChem.length < updatedItems.length) {
      const idx = updatedChem.length;
      updatedChem.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'L' });
    }
    while (updatedMech.length < updatedItems.length) {
      const idx = updatedMech.length;
      updatedMech.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'P' });
    }

    updatedItems.splice(insertIdx, 0, newItem);
    updatedChem.splice(insertIdx, 0, newChem);
    updatedMech.splice(insertIdx, 0, newMech);

    updatedItems.forEach((it, i) => { it.itemNo = (i + 1).toString(); });
    updatedChem.forEach((c, i) => { c.itemNo = (i + 1).toString(); });
    updatedMech.forEach((m, i) => { m.itemNo = (i + 1).toString(); });

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      chemicalData: updatedChem,
      mechanicalData: updatedMech
    }));
    setRowContextMenu(null);
  };

  const handleDuplicateRowAt = (sourceIdx: number) => {
    if (sourceIdx < 0 || sourceIdx >= formData.items.length) return;
    const sourceItem = formData.items[sourceIdx];
    const sourceChem = formData.chemicalData?.[sourceIdx] || {};
    const sourceMech = formData.mechanicalData?.[sourceIdx] || {};

    const insertIdx = sourceIdx + 1;
    const newItem: QcRecordItem = {
      ...sourceItem,
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      itemNo: (insertIdx + 1).toString()
    };

    const newChem: QcChemicalItem = {
      ...sourceChem,
      itemNo: (insertIdx + 1).toString()
    };

    const newMech: QcMechanicalItem = {
      ...sourceMech,
      itemNo: (insertIdx + 1).toString()
    };

    const updatedItems = [...formData.items];
    const updatedChem = [...(formData.chemicalData || [])];
    const updatedMech = [...(formData.mechanicalData || [])];

    while (updatedChem.length < updatedItems.length) {
      const idx = updatedChem.length;
      updatedChem.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'L' });
    }
    while (updatedMech.length < updatedItems.length) {
      const idx = updatedMech.length;
      updatedMech.push({ itemNo: (idx + 1).toString(), heatNo: updatedItems[idx]?.heatNo || '', specType: 'P' });
    }

    updatedItems.splice(insertIdx, 0, newItem);
    updatedChem.splice(insertIdx, 0, newChem);
    updatedMech.splice(insertIdx, 0, newMech);

    updatedItems.forEach((it, i) => { it.itemNo = (i + 1).toString(); });
    updatedChem.forEach((c, i) => { c.itemNo = (i + 1).toString(); });
    updatedMech.forEach((m, i) => { m.itemNo = (i + 1).toString(); });

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      chemicalData: updatedChem,
      mechanicalData: updatedMech
    }));
    setRowContextMenu(null);
  };

  const handleDeleteRowAt = (deleteIdx: number) => {
    if (formData.items.length <= 1) {
      const clearedItem: QcRecordItem = {
        id: Date.now().toString(),
        itemNo: '1',
        description: '',
        type: '',
        material: '',
        standard: '',
        size: '',
        classSch: '',
        qty: '',
        heatNo: '',
        heatTreatment: '',
        ndePmi: '',
        remark: '',
        finish: '',
        marking: ''
      };
      setFormData(prev => ({
        ...prev,
        items: [clearedItem],
        chemicalData: [{ itemNo: '1', heatNo: '', specType: 'L' }],
        mechanicalData: [{ itemNo: '1', heatNo: '', specType: 'P' }]
      }));
      setRowContextMenu(null);
      return;
    }

    const updatedItems = formData.items.filter((_, i) => i !== deleteIdx);
    const updatedChem = (formData.chemicalData || []).filter((_, i) => i !== deleteIdx);
    const updatedMech = (formData.mechanicalData || []).filter((_, i) => i !== deleteIdx);

    updatedItems.forEach((it, i) => { it.itemNo = (i + 1).toString(); });
    updatedChem.forEach((c, i) => { c.itemNo = (i + 1).toString(); });
    updatedMech.forEach((m, i) => { m.itemNo = (i + 1).toString(); });

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      chemicalData: updatedChem,
      mechanicalData: updatedMech
    }));
    setRowContextMenu(null);
  };

  // Sync rows across items, chemicalData, and mechanicalData
  const ensureRowsInSync = (items: QcRecordItem[]) => {
    const updatedChem = [...(formData.chemicalData || [])];
    const updatedMech = [...(formData.mechanicalData || [])];

    items.forEach((it, idx) => {
      if (!updatedChem[idx]) {
        updatedChem[idx] = {
          itemNo: (idx + 1).toString(),
          heatNo: it.heatNo || '',
          specType: 'L'
        };
      } else if (it.heatNo && (!updatedChem[idx].heatNo || updatedChem[idx].heatNo === '')) {
        updatedChem[idx].heatNo = it.heatNo;
      }

      if (!updatedMech[idx]) {
        updatedMech[idx] = {
          itemNo: (idx + 1).toString(),
          heatNo: it.heatNo || '',
          specType: 'P'
        };
      } else if (it.heatNo && (!updatedMech[idx].heatNo || updatedMech[idx].heatNo === '')) {
        updatedMech[idx].heatNo = it.heatNo;
      }
    });

    return { updatedChem, updatedMech };
  };

  // Cell Navigation for Product Description table
  const t2ItemCols = ['description', 'size', 'standard', 'qty', 'finish', 'marking', 'heatNo'];
  
  const focusT2ItemCell = (rowIdx: number, colKey: string) => {
    const el = document.getElementById(`t2-item-${rowIdx}-${colKey}`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.select();
      }
    }
  };

  const handleT2ItemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIdx: number,
    colKey: string
  ) => {
    e.stopPropagation();
    const colIdx = t2ItemCols.indexOf(colKey);
    const inputEl = e.currentTarget;

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedItemCells(null);
      return;
    }

    // CTRL+D / CMD+D: Fill Down from cell/row above
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedItems = [...formData.items];

      if (selectedItemCells) {
        const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
        const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
        const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
        const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);

        if (minR === maxR && minR > 0) {
          const sourceRow = updatedItems[minR - 1];
          const targetRow = { ...updatedItems[minR] };
          for (let c = minC; c <= maxC; c++) {
            const cKey = t2ItemCols[c];
            (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
          }
          updatedItems[minR] = targetRow;
        } else if (maxR > minR) {
          const sourceRow = updatedItems[minR];
          for (let r = minR + 1; r <= maxR; r++) {
            const targetRow = { ...updatedItems[r] };
            for (let c = minC; c <= maxC; c++) {
              const cKey = t2ItemCols[c];
              (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
            }
            updatedItems[r] = targetRow;
          }
        }
      } else if (rowIdx > 0) {
        const sourceVal = (updatedItems[rowIdx - 1] as any)?.[colKey] || '';
        const targetRow = { ...updatedItems[rowIdx] };
        (targetRow as any)[colKey] = sourceVal;
        updatedItems[rowIdx] = targetRow;
      }

      const { updatedChem, updatedMech } = ensureRowsInSync(updatedItems);
      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        chemicalData: updatedChem,
        mechanicalData: updatedMech
      }));
      return;
    }

    // Clear range on Delete/Backspace when range is selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemCells) {
      e.preventDefault();
      const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
      const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
      const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
      const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);

      const updatedItems = [...formData.items];
      for (let r = minR; r <= maxR; r++) {
        if (!updatedItems[r]) continue;
        for (let c = minC; c <= maxC; c++) {
          const cKey = t2ItemCols[c];
          (updatedItems[r] as any)[cKey] = '';
        }
      }
      const { updatedChem, updatedMech } = ensureRowsInSync(updatedItems);
      setFormData(prev => ({
        ...prev,
        items: updatedItems,
        chemicalData: updatedChem,
        mechanicalData: updatedMech
      }));
      return;
    }

    // Copy selected cells TSV on Ctrl+C / Cmd+C
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      const isMultiCellSelected = selectedItemCells && (selectedItemCells.startRow !== selectedItemCells.endRow || selectedItemCells.startCol !== selectedItemCells.endCol);
      if (!isMultiCellSelected && inputEl.selectionStart !== inputEl.selectionEnd) {
        return; // native text selection in single cell
      }
      e.preventDefault();
      let copyVal = '';
      if (selectedItemCells) {
        const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
        const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
        const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
        const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);
        const rowsData: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const it = formData.items[r];
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const cKey = t2ItemCols[c];
            rowVals.push((it as any)?.[cKey] || '');
          }
          rowsData.push(rowVals.join('\t'));
        }
        copyVal = rowsData.join('\n');
      } else {
        const it = formData.items[rowIdx];
        copyVal = (it as any)?.[colKey] || '';
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
      }
      return;
    }

    // Shift + Arrow range selection like Excel
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedItemCells?.endRow ?? rowIdx;
      let endC = selectedItemCells?.endCol ?? colIdx;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(formData.items.length - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(t2ItemCols.length - 1, endC + 1);

      setSelectedItemCells({
        startRow: selectedItemCells?.startRow ?? rowIdx,
        startCol: selectedItemCells?.startCol ?? colIdx,
        endRow: endR,
        endCol: endC
      });

      focusT2ItemCell(endR, t2ItemCols[endC]);
      return;
    }

    // If moving or clicking without Shift, clear the range
    if (selectedItemCells && !e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
      setSelectedItemCells(null);
    }

    const isAtStart = inputEl.selectionStart === 0 && inputEl.selectionEnd === 0;
    const isAtEnd = inputEl.selectionStart === inputEl.value.length && inputEl.selectionEnd === inputEl.value.length;

    if (e.key === 'ArrowUp' && rowIdx > 0) {
      e.preventDefault();
      focusT2ItemCell(rowIdx - 1, colKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIdx < formData.items.length - 1) {
        focusT2ItemCell(rowIdx + 1, colKey);
      } else {
        onAddItem();
        setTimeout(() => focusT2ItemCell(rowIdx + 1, colKey), 50);
      }
    } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      if (colIdx < t2ItemCols.length - 1) {
        focusT2ItemCell(rowIdx, t2ItemCols[colIdx + 1]);
      } else if (rowIdx < formData.items.length - 1) {
        focusT2ItemCell(rowIdx + 1, t2ItemCols[0]);
      } else {
        onAddItem();
        setTimeout(() => focusT2ItemCell(rowIdx + 1, t2ItemCols[0]), 50);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      if (colIdx > 0) {
        e.preventDefault();
        focusT2ItemCell(rowIdx, t2ItemCols[colIdx - 1]);
      } else if (rowIdx > 0) {
        e.preventDefault();
        focusT2ItemCell(rowIdx - 1, t2ItemCols[t2ItemCols.length - 1]);
      }
    } else if (e.key === 'ArrowLeft' && isAtStart && colIdx > 0) {
      e.preventDefault();
      focusT2ItemCell(rowIdx, t2ItemCols[colIdx - 1]);
    } else if (e.key === 'ArrowRight' && isAtEnd && colIdx < t2ItemCols.length - 1) {
      e.preventDefault();
      focusT2ItemCell(rowIdx, t2ItemCols[colIdx + 1]);
    }
  };

  const handleT2ItemPaste = (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const hasDelimiters = text.includes('\t') || text.includes('\n');
    if (!hasDelimiters && !selectedItemCells) {
      return; // allow normal native single-input paste
    }
    e.preventDefault();

    const startColIndex = t2ItemCols.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));
    const updatedItems = [...formData.items];

    if (selectedItemCells) {
      const minR = Math.min(selectedItemCells.startRow, selectedItemCells.endRow);
      const maxR = Math.max(selectedItemCells.startRow, selectedItemCells.endRow);
      const minC = Math.min(selectedItemCells.startCol, selectedItemCells.endCol);
      const maxC = Math.max(selectedItemCells.startCol, selectedItemCells.endCol);

      if (!hasDelimiters) {
        const val = text.trim();
        for (let r = minR; r <= maxR; r++) {
          while (updatedItems.length <= r) {
            const rIdx = updatedItems.length;
            updatedItems.push({
              id: Date.now().toString() + '-' + rIdx,
              itemNo: (rIdx + 1).toString(),
              description: '',
              type: '',
              material: '',
              standard: '',
              size: '',
              classSch: '',
              qty: '',
              heatNo: '',
              heatTreatment: '',
              ndePmi: '',
              remark: '',
              finish: '',
              marking: ''
            });
          }
          for (let c = minC; c <= maxC; c++) {
            const colName = t2ItemCols[c];
            if (colName) {
              (updatedItems[r] as any)[colName] = val;
            }
          }
        }
      } else {
        const rowMatrix = rows.map(r => r.split('\t'));
        const pasteRowCount = rowMatrix.length;
        const targetRowCount = (maxR > minR) ? (maxR - minR + 1) : pasteRowCount;
        const totalRowsToProcess = Math.max(targetRowCount, pasteRowCount);

        for (let rOffset = 0; rOffset < totalRowsToProcess; rOffset++) {
          const targetR = minR + rOffset;
          while (updatedItems.length <= targetR) {
            const rIdx = updatedItems.length;
            updatedItems.push({
              id: Date.now().toString() + '-' + rIdx,
              itemNo: (rIdx + 1).toString(),
              description: '',
              type: '',
              material: '',
              standard: '',
              size: '',
              classSch: '',
              qty: '',
              heatNo: '',
              heatTreatment: '',
              ndePmi: '',
              remark: '',
              finish: '',
              marking: ''
            });
          }

          const sourceRow = rowMatrix[rOffset % pasteRowCount];
          const pasteColCount = sourceRow.length;
          const targetColCount = (maxC > minC && pasteColCount === 1) ? (maxC - minC + 1) : pasteColCount;
          const totalColsToProcess = Math.max(targetColCount, pasteColCount);

          for (let cOffset = 0; cOffset < totalColsToProcess; cOffset++) {
            const targetC = minC + cOffset;
            if (targetC < t2ItemCols.length) {
              const colName = t2ItemCols[targetC];
              const cellVal = sourceRow[cOffset % pasteColCount];
              (updatedItems[targetR] as any)[colName] = (cellVal || '').trim();
            }
          }
        }
      }
    } else {
      const rowMatrix = rows.map(r => r.split('\t'));
      rowMatrix.forEach((sourceRow, rOffset) => {
        const targetR = startRow + rOffset;
        while (updatedItems.length <= targetR) {
          const rIdx = updatedItems.length;
          updatedItems.push({
            id: Date.now().toString() + '-' + rIdx,
            itemNo: (rIdx + 1).toString(),
            description: '',
            type: '',
            material: '',
            standard: '',
            size: '',
            classSch: '',
            qty: '',
            heatNo: '',
            heatTreatment: '',
            ndePmi: '',
            remark: '',
            finish: '',
            marking: ''
          });
        }

        sourceRow.forEach((val, cOffset) => {
          const targetC = startColIndex + cOffset;
          if (targetC < t2ItemCols.length) {
            const colName = t2ItemCols[targetC];
            (updatedItems[targetR] as any)[colName] = (val || '').trim();
          }
        });
      });
    }

    const { updatedChem, updatedMech } = ensureRowsInSync(updatedItems);
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      chemicalData: updatedChem,
      mechanicalData: updatedMech
    }));
  };

  // Chemical Table Configuration
  const baseChemCols = [
    { k: 'heatNo', label: 'Heat No' },
    { k: 'c', label: '%C' },
    { k: 'mn', label: '%Mn' },
    { k: 'p', label: '%P' },
    { k: 's', label: '%S' },
    { k: 'si', label: '%Si' },
    { k: 'cr', label: '%Cr' },
    { k: 'mo', label: '%Mo' },
    { k: 'ni', label: '%Ni' },
    { k: 'cu', label: '%Cu' },
    { k: 'al', label: '%Al' },
    { k: 'n', label: '%N' },
    { k: 'v', label: '%V' },
    { k: 'b', label: '%B' },
  ];

  const extraChemCols: Array<{ k: string; label: string }> = [];
  if (formData.showColPb) extraChemCols.push({ k: 'pb', label: '%Pb' });
  if (formData.showColZn) extraChemCols.push({ k: 'zn', label: '%Zn' });
  if (formData.showColFe) extraChemCols.push({ k: 'fe', label: '%Fe' });
  if (formData.showColSn) extraChemCols.push({ k: 'sn', label: '%Sn' });
  if (formData.showImpurity) extraChemCols.push({ k: 'totalImpurity', label: 'Impurity' });
  if (formData.showOther) extraChemCols.push({ k: 'other', label: 'Other' });

  const rawActiveChemCols = [...baseChemCols, ...extraChemCols];
  const chemElementCount = rawActiveChemCols.length - 1; // excluding heatNo
  const elementColWidth = `${(85.0 / Math.max(1, chemElementCount)).toFixed(3)}%`;

  const activeChemCols = rawActiveChemCols.map(c => ({
    ...c,
    width: c.k === 'heatNo' ? '15%' : elementColWidth
  }));

  const focusT2ChemCell = (rowIdx: number, colKey: string) => {
    const el = document.getElementById(`t2-chem-${rowIdx}-${colKey}`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    }
  };

  const handleT2ChemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colKey: string
  ) => {
    e.stopPropagation();
    const colList = activeChemCols.map(c => c.k);
    const colIdx = colList.indexOf(colKey);
    const totalRows = Math.max(formData.items.length, formData.chemicalData?.length || 0);
    const inputEl = e.currentTarget;

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedChemCells(null);
      return;
    }

    // CTRL+D / CMD+D: Fill Down from cell/row above
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedChem = [...(formData.chemicalData || [])];

      if (selectedChemCells) {
        const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
        const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
        const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
        const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);

        if (minR === maxR && minR > 0) {
          const sourceRow = updatedChem[minR - 1] || {};
          const targetRow = { ...(updatedChem[minR] || { itemNo: (minR + 1).toString(), specType: 'L' }) };
          for (let c = minC; c <= maxC; c++) {
            const cKey = colList[c];
            (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
          }
          updatedChem[minR] = targetRow;
        } else if (maxR > minR) {
          const sourceRow = updatedChem[minR] || {};
          for (let r = minR + 1; r <= maxR; r++) {
            const targetRow = { ...(updatedChem[r] || { itemNo: (r + 1).toString(), specType: 'L' }) };
            for (let c = minC; c <= maxC; c++) {
              const cKey = colList[c];
              (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
            }
            updatedChem[r] = targetRow;
          }
        }
      } else if (rowIdx > 0) {
        const sourceVal = (updatedChem[rowIdx - 1] as any)?.[colKey] || '';
        const targetRow = { ...(updatedChem[rowIdx] || { itemNo: (rowIdx + 1).toString(), specType: 'L' }) };
        (targetRow as any)[colKey] = sourceVal;
        updatedChem[rowIdx] = targetRow;
      }

      setFormData(prev => ({ ...prev, chemicalData: updatedChem }));
      return;
    }

    // Clear range on Delete/Backspace when range is selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedChemCells) {
      e.preventDefault();
      const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
      const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
      const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
      const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);

      const updatedChem = [...(formData.chemicalData || [])];
      for (let r = minR; r <= maxR; r++) {
        if (!updatedChem[r]) continue;
        for (let c = minC; c <= maxC; c++) {
          const cKey = colList[c];
          (updatedChem[r] as any)[cKey] = '';
        }
      }
      setFormData(prev => ({ ...prev, chemicalData: updatedChem }));
      return;
    }

    // Copy selected cells TSV on Ctrl+C / Cmd+C
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      const isMultiCellSelected = selectedChemCells && (selectedChemCells.startRow !== selectedChemCells.endRow || selectedChemCells.startCol !== selectedChemCells.endCol);
      if (!isMultiCellSelected && inputEl.selectionStart !== inputEl.selectionEnd) {
        return; // native text selection in single cell
      }
      e.preventDefault();
      let copyVal = '';
      if (selectedChemCells) {
        const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
        const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
        const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
        const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);
        const rowsData: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const ch = formData.chemicalData?.[r] || {};
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const cKey = colList[c];
            rowVals.push((ch as any)?.[cKey] || '');
          }
          rowsData.push(rowVals.join('\t'));
        }
        copyVal = rowsData.join('\n');
      } else {
        const ch = formData.chemicalData?.[rowIdx] || {};
        copyVal = (ch as any)?.[colKey] || '';
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
      }
      return;
    }

    // Shift + Arrow range selection like Excel
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedChemCells?.endRow ?? rowIdx;
      let endC = selectedChemCells?.endCol ?? colIdx;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(totalRows - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(colList.length - 1, endC + 1);

      setSelectedChemCells({
        startRow: selectedChemCells?.startRow ?? rowIdx,
        startCol: selectedChemCells?.startCol ?? colIdx,
        endRow: endR,
        endCol: endC
      });

      focusT2ChemCell(endR, colList[endC]);
      return;
    }

    // If moving or clicking without Shift, clear the range
    if (selectedChemCells && !e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
      setSelectedChemCells(null);
    }

    const isAtStart = inputEl.selectionStart === 0 && inputEl.selectionEnd === 0;
    const isAtEnd = inputEl.selectionStart === inputEl.value.length && inputEl.selectionEnd === inputEl.value.length;

    if (e.key === 'ArrowUp' && rowIdx > 0) {
      e.preventDefault();
      focusT2ChemCell(rowIdx - 1, colKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIdx < totalRows - 1) {
        focusT2ChemCell(rowIdx + 1, colKey);
      } else {
        onAddItem();
        setTimeout(() => focusT2ChemCell(rowIdx + 1, colKey), 50);
      }
    } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      if (colKey !== 'heatNo') {
        setFormData(prev => {
          const updatedChem = [...(prev.chemicalData || [])];
          if (updatedChem[rowIdx]) {
            const raw = (updatedChem[rowIdx] as any)[colKey];
            (updatedChem[rowIdx] as any)[colKey] = formatChemVal(raw);
          }
          return { ...prev, chemicalData: updatedChem };
        });
      }
      if (colIdx < colList.length - 1) {
        focusT2ChemCell(rowIdx, colList[colIdx + 1]);
      } else if (rowIdx < totalRows - 1) {
        focusT2ChemCell(rowIdx + 1, colList[0]);
      } else {
        onAddItem();
        setTimeout(() => focusT2ChemCell(rowIdx + 1, colList[0]), 50);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      if (colIdx > 0) {
        e.preventDefault();
        focusT2ChemCell(rowIdx, colList[colIdx - 1]);
      } else if (rowIdx > 0) {
        e.preventDefault();
        focusT2ChemCell(rowIdx - 1, colList[colList.length - 1]);
      }
    } else if (e.key === 'ArrowLeft' && isAtStart && colIdx > 0) {
      e.preventDefault();
      focusT2ChemCell(rowIdx, colList[colIdx - 1]);
    } else if (e.key === 'ArrowRight' && isAtEnd && colIdx < colList.length - 1) {
      e.preventDefault();
      focusT2ChemCell(rowIdx, colList[colIdx + 1]);
    }
  };

  const handleT2ChemPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const hasDelimiters = text.includes('\t') || text.includes('\n');
    if (!hasDelimiters && !selectedChemCells) return;
    e.preventDefault();

    const colList = activeChemCols.map(c => c.k);
    const startColIndex = colList.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));
    const updatedChem = [...(formData.chemicalData || [])];

    if (selectedChemCells) {
      const minR = Math.min(selectedChemCells.startRow, selectedChemCells.endRow);
      const maxR = Math.max(selectedChemCells.startRow, selectedChemCells.endRow);
      const minC = Math.min(selectedChemCells.startCol, selectedChemCells.endCol);
      const maxC = Math.max(selectedChemCells.startCol, selectedChemCells.endCol);

      if (!hasDelimiters) {
        const val = text.trim();
        for (let r = minR; r <= maxR; r++) {
          while (updatedChem.length <= r) {
            const rIdx = updatedChem.length;
            updatedChem.push({
              itemNo: (rIdx + 1).toString(),
              heatNo: formData.items[rIdx]?.heatNo || '',
              specType: 'L'
            });
          }
          for (let c = minC; c <= maxC; c++) {
            const colName = colList[c];
            if (colName) {
              (updatedChem[r] as any)[colName] = colName === 'heatNo' ? val : formatChemVal(val);
            }
          }
        }
      } else {
        const rowMatrix = rows.map(r => r.split('\t'));
        const pasteRowCount = rowMatrix.length;
        const targetRowCount = (maxR > minR) ? (maxR - minR + 1) : pasteRowCount;
        const totalRowsToProcess = Math.max(targetRowCount, pasteRowCount);

        for (let rOffset = 0; rOffset < totalRowsToProcess; rOffset++) {
          const targetR = minR + rOffset;
          while (updatedChem.length <= targetR) {
            const rIdx = updatedChem.length;
            updatedChem.push({
              itemNo: (rIdx + 1).toString(),
              heatNo: formData.items[rIdx]?.heatNo || '',
              specType: 'L'
            });
          }

          const sourceRow = rowMatrix[rOffset % pasteRowCount];
          const pasteColCount = sourceRow.length;
          const targetColCount = (maxC > minC && pasteColCount === 1) ? (maxC - minC + 1) : pasteColCount;
          const totalColsToProcess = Math.max(targetColCount, pasteColCount);

          for (let cOffset = 0; cOffset < totalColsToProcess; cOffset++) {
            const targetC = minC + cOffset;
            if (targetC < colList.length) {
              const colName = colList[targetC];
              const cellVal = sourceRow[cOffset % pasteColCount];
              const rawStr = (cellVal || '').trim();
              (updatedChem[targetR] as any)[colName] = colName === 'heatNo' ? rawStr : formatChemVal(rawStr);
            }
          }
        }
      }
    } else {
      const rowMatrix = rows.map(r => r.split('\t'));
      rowMatrix.forEach((sourceRow, rOffset) => {
        const targetR = startRow + rOffset;
        while (updatedChem.length <= targetR) {
          const rIdx = updatedChem.length;
          updatedChem.push({
            itemNo: (rIdx + 1).toString(),
            heatNo: formData.items[rIdx]?.heatNo || '',
            specType: 'L'
          });
        }

        sourceRow.forEach((val, cOffset) => {
          const targetC = startColIndex + cOffset;
          if (targetC < colList.length) {
            const colName = colList[targetC];
            const rawStr = (val || '').trim();
            (updatedChem[targetR] as any)[colName] = colName === 'heatNo' ? rawStr : formatChemVal(rawStr);
          }
        });
      });
    }

    setFormData(prev => ({ ...prev, chemicalData: updatedChem }));
  };

  // Mechanical Table Configuration - Dynamic Columns based on user toggles with 15% Heat No. width
  const baseMechCols: Array<{ k: string; label: string }> = [
    { k: 'heatNo', label: 'Heat No.' },
    { k: 'tsMpa', label: 'Tensile Strength (UTS)' },
    { k: 'ysMpa', label: 'Yield Strength (YS)' },
    { k: 'elPct', label: 'Elongation (EL)' },
    { k: 'raPct', label: 'Reduction of Area (RA)' },
    { k: 'proofLoadLbf', label: 'Proofload' },
  ];

  const extraMechCols: Array<{ k: string; label: string }> = [];
  if (formData.showColStressUnderProofload ?? false) extraMechCols.push({ k: 'stressUnderProofloadMpa', label: 'Stress Under Proofload' });
  if (formData.showColHeatTreatment ?? false) extraMechCols.push({ k: 'heatTreatment', label: 'Heat Treatment' });
  if (formData.showColHardness24Hr ?? false) extraMechCols.push({ k: 'hardness24Hr540C', label: 'Hardness (24Hr)' });
  if (formData.showColQuenchingTemp ?? false) extraMechCols.push({ k: 'quenchingTempC', label: 'Quenching Temp' });
  if (formData.showColQuenchingTime ?? false) extraMechCols.push({ k: 'quenchingHoldingTime', label: 'Quenching Time' });
  if (formData.showColQuenchingMedium ?? false) extraMechCols.push({ k: 'quenchingMedium', label: 'Quenching Medium' });
  if (formData.showColTemperingTemp ?? false) extraMechCols.push({ k: 'temperingTempC', label: 'Tempering Temp' });
  if (formData.showColTemperingTime ?? false) extraMechCols.push({ k: 'temperingHoldingTime', label: 'Tempering Time' });
  if (formData.showColStressRelieved ?? false) extraMechCols.push({ k: 'stressRelievedC', label: 'Stress Relieved' });
  if (formData.showColTemperingResult ?? false) extraMechCols.push({ k: 'temperingResult', label: 'Temper Result' });
  if (formData.showColImpactJ ?? false) extraMechCols.push({ k: 'impactJ', label: 'Impact in J' });
  if (formData.showColAvgImpactJ ?? false) extraMechCols.push({ k: 'avgImpactJ', label: 'Avg Impact in J' });
  if (formData.showColImpactTemp ?? false) extraMechCols.push({ k: 'impactTempC', label: 'Impact Temp' });
  if (formData.showColPren ?? false) extraMechCols.push({ k: 'pren', label: 'PREN' });

  const fullMechCols = [...baseMechCols, ...extraMechCols, { k: 'hardness', label: 'Hardness' }];
  const otherMechCount = fullMechCols.length - 1; // excluding heatNo
  const otherMechColWidth = `${(85.0 / Math.max(1, otherMechCount)).toFixed(3)}%`;

  const activeMechCols = fullMechCols.map(c => ({
    ...c,
    width: c.k === 'heatNo' ? '15%' : otherMechColWidth
  }));

  const focusT2MechCell = (rowIdx: number, colKey: string) => {
    const el = document.getElementById(`t2-mech-${rowIdx}-${colKey}`);
    if (el) {
      el.focus();
      if (el instanceof HTMLInputElement) el.select();
    }
  };

  const handleT2MechKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colKey: string
  ) => {
    e.stopPropagation();
    const colList = activeMechCols.map(c => c.k);
    const colIdx = colList.indexOf(colKey);
    const totalRows = Math.max(formData.items.length, formData.mechanicalData?.length || 0);
    const inputEl = e.currentTarget;

    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedMechCells(null);
      return;
    }

    // CTRL+D / CMD+D: Fill Down from cell/row above
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedMech = [...(formData.mechanicalData || [])];

      if (selectedMechCells) {
        const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
        const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
        const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
        const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);

        if (minR === maxR && minR > 0) {
          const sourceRow = updatedMech[minR - 1] || {};
          const targetRow = { ...(updatedMech[minR] || { itemNo: (minR + 1).toString(), specType: 'P' }) };
          for (let c = minC; c <= maxC; c++) {
            const cKey = colList[c];
            (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
          }
          updatedMech[minR] = targetRow;
        } else if (maxR > minR) {
          const sourceRow = updatedMech[minR] || {};
          for (let r = minR + 1; r <= maxR; r++) {
            const targetRow = { ...(updatedMech[r] || { itemNo: (r + 1).toString(), specType: 'P' }) };
            for (let c = minC; c <= maxC; c++) {
              const cKey = colList[c];
              (targetRow as any)[cKey] = (sourceRow as any)?.[cKey] || '';
            }
            updatedMech[r] = targetRow;
          }
        }
      } else if (rowIdx > 0) {
        const sourceVal = (updatedMech[rowIdx - 1] as any)?.[colKey] || '';
        const targetRow = { ...(updatedMech[rowIdx] || { itemNo: (rowIdx + 1).toString(), specType: 'P' }) };
        (targetRow as any)[colKey] = sourceVal;
        updatedMech[rowIdx] = targetRow;
      }

      setFormData(prev => ({ ...prev, mechanicalData: updatedMech }));
      return;
    }

    // Clear range on Delete/Backspace when range is selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedMechCells) {
      e.preventDefault();
      const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
      const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
      const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
      const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);

      const updatedMech = [...(formData.mechanicalData || [])];
      for (let r = minR; r <= maxR; r++) {
        if (!updatedMech[r]) continue;
        for (let c = minC; c <= maxC; c++) {
          const cKey = colList[c];
          (updatedMech[r] as any)[cKey] = '';
        }
      }
      setFormData(prev => ({ ...prev, mechanicalData: updatedMech }));
      return;
    }

    // Copy selected cells TSV on Ctrl+C / Cmd+C
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      if (inputEl.selectionStart !== inputEl.selectionEnd) {
        return; // native text selection in single cell
      }
      e.preventDefault();
      let copyVal = '';
      if (selectedMechCells) {
        const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
        const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
        const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
        const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);
        const rowsData: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const m = formData.mechanicalData?.[r] || {};
          const rowVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            const cKey = colList[c];
            rowVals.push((m as any)?.[cKey] || '');
          }
          rowsData.push(rowVals.join('\t'));
        }
        copyVal = rowsData.join('\n');
      } else {
        const m = formData.mechanicalData?.[rowIdx] || {};
        copyVal = (m as any)?.[colKey] || '';
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
      }
      return;
    }

    // Shift + Arrow range selection like Excel
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedMechCells?.endRow ?? rowIdx;
      let endC = selectedMechCells?.endCol ?? colIdx;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(totalRows - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(colList.length - 1, endC + 1);

      setSelectedMechCells({
        startRow: selectedMechCells?.startRow ?? rowIdx,
        startCol: selectedMechCells?.startCol ?? colIdx,
        endRow: endR,
        endCol: endC
      });

      focusT2MechCell(endR, colList[endC]);
      return;
    }

    // If moving or clicking without Shift, clear the range
    if (selectedMechCells && !e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
      setSelectedMechCells(null);
    }

    const isAtStart = inputEl.selectionStart === 0 && inputEl.selectionEnd === 0;
    const isAtEnd = inputEl.selectionStart === inputEl.value.length && inputEl.selectionEnd === inputEl.value.length;

    if (e.key === 'ArrowUp' && rowIdx > 0) {
      e.preventDefault();
      focusT2MechCell(rowIdx - 1, colKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIdx < totalRows - 1) {
        focusT2MechCell(rowIdx + 1, colKey);
      } else {
        onAddItem();
        setTimeout(() => focusT2MechCell(rowIdx + 1, colKey), 50);
      }
    } else if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      if (colKey !== 'heatNo') {
        setFormData(prev => {
          const updatedMech = [...(prev.mechanicalData || [])];
          if (updatedMech[rowIdx]) {
            const raw = (updatedMech[rowIdx] as any)[colKey];
            (updatedMech[rowIdx] as any)[colKey] = formatNumericVal(raw);
          }
          return { ...prev, mechanicalData: updatedMech };
        });
      }
      if (colIdx < colList.length - 1) {
        focusT2MechCell(rowIdx, colList[colIdx + 1]);
      } else if (rowIdx < totalRows - 1) {
        focusT2MechCell(rowIdx + 1, colList[0]);
      } else {
        onAddItem();
        setTimeout(() => focusT2MechCell(rowIdx + 1, colList[0]), 50);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      if (colIdx > 0) {
        e.preventDefault();
        focusT2MechCell(rowIdx, colList[colIdx - 1]);
      } else if (rowIdx > 0) {
        e.preventDefault();
        focusT2MechCell(rowIdx - 1, colList[colList.length - 1]);
      }
    } else if (e.key === 'ArrowLeft' && isAtStart && colIdx > 0) {
      e.preventDefault();
      focusT2MechCell(rowIdx, colList[colIdx - 1]);
    } else if (e.key === 'ArrowRight' && isAtEnd && colIdx < colList.length - 1) {
      e.preventDefault();
      focusT2MechCell(rowIdx, colList[colIdx + 1]);
    }
  };

  const handleT2MechPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRow: number,
    startColKey: string
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const hasDelimiters = text.includes('\t') || text.includes('\n');
    if (!hasDelimiters && !selectedMechCells) return;
    e.preventDefault();

    const colList = activeMechCols.map(c => c.k);
    const startColIndex = colList.indexOf(startColKey);
    const rows = text.split(/\r?\n/).filter((r, idx, arr) => !(idx === arr.length - 1 && r === ''));
    const updatedMech = [...(formData.mechanicalData || [])];

    if (selectedMechCells) {
      const minR = Math.min(selectedMechCells.startRow, selectedMechCells.endRow);
      const maxR = Math.max(selectedMechCells.startRow, selectedMechCells.endRow);
      const minC = Math.min(selectedMechCells.startCol, selectedMechCells.endCol);
      const maxC = Math.max(selectedMechCells.startCol, selectedMechCells.endCol);

      if (!hasDelimiters) {
        const val = text.trim();
        for (let r = minR; r <= maxR; r++) {
          while (updatedMech.length <= r) {
            const rIdx = updatedMech.length;
            updatedMech.push({
              itemNo: (rIdx + 1).toString(),
              heatNo: formData.items[rIdx]?.heatNo || '',
              specType: 'P'
            });
          }
          for (let c = minC; c <= maxC; c++) {
            const colName = colList[c];
            if (colName) {
              (updatedMech[r] as any)[colName] = colName === 'heatNo' ? val : formatNumericVal(val);
            }
          }
        }
      } else {
        const rowMatrix = rows.map(r => r.split('\t'));
        const pasteRowCount = rowMatrix.length;
        const targetRowCount = (maxR > minR) ? (maxR - minR + 1) : pasteRowCount;
        const totalRowsToProcess = Math.max(targetRowCount, pasteRowCount);

        for (let rOffset = 0; rOffset < totalRowsToProcess; rOffset++) {
          const targetR = minR + rOffset;
          while (updatedMech.length <= targetR) {
            const rIdx = updatedMech.length;
            updatedMech.push({
              itemNo: (rIdx + 1).toString(),
              heatNo: formData.items[rIdx]?.heatNo || '',
              specType: 'P'
            });
          }

          const sourceRow = rowMatrix[rOffset % pasteRowCount];
          const pasteColCount = sourceRow.length;
          const targetColCount = (maxC > minC && pasteColCount === 1) ? (maxC - minC + 1) : pasteColCount;
          const totalColsToProcess = Math.max(targetColCount, pasteColCount);

          for (let cOffset = 0; cOffset < totalColsToProcess; cOffset++) {
            const targetC = minC + cOffset;
            if (targetC < colList.length) {
              const colName = colList[targetC];
              const cellVal = sourceRow[cOffset % pasteColCount];
              const rawStr = (cellVal || '').trim();
              (updatedMech[targetR] as any)[colName] = colName === 'heatNo' ? rawStr : formatNumericVal(rawStr);
            }
          }
        }
      }
    } else {
      const rowMatrix = rows.map(r => r.split('\t'));
      rowMatrix.forEach((sourceRow, rOffset) => {
        const targetR = startRow + rOffset;
        while (updatedMech.length <= targetR) {
          const rIdx = updatedMech.length;
          updatedMech.push({
            itemNo: (rIdx + 1).toString(),
            heatNo: formData.items[rIdx]?.heatNo || '',
            specType: 'P'
          });
        }

        sourceRow.forEach((val, cOffset) => {
          const targetC = startColIndex + cOffset;
          if (targetC < colList.length) {
            const colName = colList[targetC];
            const rawStr = (val || '').trim();
            (updatedMech[targetR] as any)[colName] = colName === 'heatNo' ? rawStr : formatNumericVal(rawStr);
          }
        });
      });
    }

    setFormData(prev => ({ ...prev, mechanicalData: updatedMech }));
  };

  const rowCount = Math.max(formData.items.length, formData.chemicalData?.length || 0, formData.mechanicalData?.length || 0, 1);

  return (
    <div className="w-full overflow-x-auto">
      {/* TOP TOOLBAR FOR MTC 2 */}
      <div className="w-full mb-2 flex items-center justify-end bg-slate-100/90 border border-slate-300 px-3 py-1.5 rounded-lg text-xs print:hidden">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <span>Excel navigation: <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] text-slate-700">Enter</kbd> / <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] text-slate-700">Tab</kbd> / <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-mono text-[9px] text-slate-700">Arrows</kbd></span>
        </div>
      </div>

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

        {/* 1. TOP HEADER BLOCK WITH COMPANY DETAILS & ISO LOGO */}
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

          {/* CENTER: ISO CERTIFICATION LOGO & TEXT (Only for companies with ISO certification enabled) */}
          {(activeCompany.showIso !== false && (isMarineFastenersCompany(activeCompany) || activeCompany.showIso)) ? (
            <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
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
                  <span>{getCompanyIsoText(activeCompany) || 'ISO 9001:2015 • ISO 14001:2015 • ISO 45001:2018'}</span>
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
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center px-1 min-w-0">
              <div className="text-center font-bold text-[10px] text-slate-700 uppercase tracking-wider">
                {activeCompany.subtitle || 'QUALITY ASSURANCE & TESTING DIVISION'}
              </div>
            </div>
          )}

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
              <span>Page No :</span>
              <input
                type="text"
                value={formData.pageNo || `1 OF ${calculateTotalPages(formData)}`}
                onChange={(e) => setFormData(prev => ({ ...prev, pageNo: e.target.value }))}
                className="w-16 p-0.5 bg-amber-50/50 border border-amber-300 rounded text-center font-black text-[9px] text-amber-950 uppercase"
                title="Page number (e.g. 1 OF 1)"
              />
            </div>
          </div>
        </div>

        {/* 2. METADATA 2-ROW x 3-COLUMN TABLE */}
        <table className="w-full border-collapse border border-black text-[8.5px] font-sans table-fixed mb-1 bg-white">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-[14%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Certificate No:</td>
              <td className="w-[26%] p-0.5 font-black border-r border-black text-left px-1">
                <input
                  id="t2-meta-cert-no"
                  type="text"
                  required
                  value={formData.issueNo || formData.certNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, certNo: e.target.value, issueNo: e.target.value }))}
                  className="w-full p-0.5 bg-amber-50/40 border border-amber-300 rounded font-black text-[9.5px] text-amber-950 uppercase"
                />
              </td>
              <td className="w-[15%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Work Order Number:</td>
              <td className="w-[20%] p-0.5 font-bold border-r border-black text-left px-1">
                <input
                  id="t2-meta-wo-no"
                  type="text"
                  value={formData.workOrderNum || ''}
                  onChange={(e) => onPoOrInvoiceChange('workOrderNum', e.target.value)}
                  className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9px]"
                />
              </td>
              <td className="w-[11%] p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Customer:</td>
              <td className="w-[24%] p-0.5 font-black text-left px-1">
                <input
                  id="t2-meta-customer"
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full p-0.5 bg-amber-50/40 border border-amber-300 rounded font-black text-[9.5px] text-amber-950 uppercase"
                />
              </td>
            </tr>
            <tr>
              <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Date:</td>
              <td className="p-0.5 font-black border-r border-black text-left px-1">
                <input
                  id="t2-meta-date"
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-0.5 bg-amber-50/40 border border-amber-300 rounded font-black text-[9.5px] text-amber-950"
                />
              </td>
              <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">Invoice Number:</td>
              <td className="p-0.5 font-bold border-r border-black text-left px-1">
                <input
                  id="t2-meta-invoice-no"
                  type="text"
                  value={formData.invoiceNum || ''}
                  onChange={(e) => onPoOrInvoiceChange('invoiceNum', e.target.value)}
                  className="w-full p-0.5 bg-white border border-slate-300 rounded font-bold text-[9px]"
                />
              </td>
              <td className="p-1 font-bold border-r border-black bg-slate-50/50 text-left px-1.5">PO Number:</td>
              <td className="p-0.5 font-bold text-left px-1">
                <input
                  id="t2-meta-po-no"
                  type="text"
                  value={formData.customerPoNum || ''}
                  onChange={(e) => onPoOrInvoiceChange('customerPoNum', e.target.value)}
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
                title="Paste from Excel"
              >
                <FileSpreadsheet className="w-2.5 h-2.5" /> Excel
              </button>
              <button
                type="button"
                onClick={onAddItem}
                className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Add New Row"
              >
                <Plus className="w-2.5 h-2.5" /> Row
              </button>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-[8.5px] sm:text-[9px] font-sans table-fixed bg-white">
            <thead>
              <tr className="bg-white border-b border-black font-bold text-[8.5px] sm:text-[9px] leading-tight text-black text-center">
                <th className="border border-black p-1 w-[4%]">S/L NO.</th>
                <th className="border border-black p-1 w-[16%] text-left px-1.5">DESCRIPTION</th>
                <th className="border border-black p-1 w-[13%]">SIZE</th>
                <th className="border border-black p-1 w-[19%]">STANDARD / SPECIFICATION</th>
                <th className="border border-black p-1 w-[6.5%]">QTY</th>
                <th className="border border-black p-1 w-[8.5%]">FINISH</th>
                <th className="border border-black p-1 w-[12%]">
                  <div className="flex items-center justify-center gap-1">
                    <span>MARKING</span>
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
                            const updated = formData.items.map(it => ({ ...it, markingImage: dataUrl }));
                            setFormData(prev => ({ ...prev, items: updated }));
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </th>
                <th className="border border-black p-1 w-[21%]">Heat No</th>
                <th className="border border-black p-1 w-[3%] print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((it, idx) => (
                <tr 
                  key={it.id || idx} 
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setRowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'items' });
                  }}
                  className="border-b border-black text-[8.5px] sm:text-[9px] hover:bg-amber-50/30 group/row"
                >
                  <td 
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRowContextMenu({ x: e.clientX, y: e.clientY, rowIdx: idx, section: 'items' });
                    }}
                    className="border border-black p-0.5 text-center font-bold select-none cursor-context-menu hover:bg-amber-200 transition-colors"
                    title="Right-click to Add/Duplicate/Delete row across all sections"
                  >
                    {it.itemNo || (idx + 1)}
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 0) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <textarea
                      id={`t2-item-${idx}-description`}
                      rows={1}
                      value={it.description}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx].description = e.target.value;
                        setFormData(prev => ({ ...prev, items: updated }));
                      }}
                      onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'description')}
                      onPaste={(e) => handleT2ItemPaste(e, idx, 'description')}
                      className="w-full p-0.5 bg-transparent border-0 font-semibold text-slate-900 text-[8.5px] sm:text-[9px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 1) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <textarea
                      id={`t2-item-${idx}-size`}
                      rows={1}
                      value={it.size}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx].size = e.target.value;
                        setFormData(prev => ({ ...prev, items: updated }));
                      }}
                      onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'size')}
                      onPaste={(e) => handleT2ItemPaste(e, idx, 'size')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 2) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <textarea
                      id={`t2-item-${idx}-standard`}
                      rows={1}
                      value={it.material || it.standard || ''}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx].material = e.target.value;
                        updated[idx].standard = e.target.value;
                        setFormData(prev => ({ ...prev, items: updated }));
                      }}
                      onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'standard')}
                      onPaste={(e) => handleT2ItemPaste(e, idx, 'standard')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded resize-none leading-tight"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 3) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <input
                      id={`t2-item-${idx}-qty`}
                      type="text"
                      value={it.qty}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx].qty = e.target.value;
                        setFormData(prev => ({ ...prev, items: updated }));
                      }}
                      onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'qty')}
                      onPaste={(e) => handleT2ItemPaste(e, idx, 'qty')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                    />
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 4) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <input
                      id={`t2-item-${idx}-finish`}
                      type="text"
                      value={it.finish || ''}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx].finish = e.target.value;
                        setFormData(prev => ({ ...prev, items: updated }));
                      }}
                      onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'finish')}
                      onPaste={(e) => handleT2ItemPaste(e, idx, 'finish')}
                      className="w-full p-0.5 bg-transparent border-0 font-medium text-center text-[8.5px] sm:text-[9px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded"
                    />
                  </td>
                  {/* MARKING COLUMN WITH TEXT & IMAGE UPLOAD - COMPACT SIDE-BY-SIDE LAYOUT (UPLOAD/IMAGE LEFT, TEXT RIGHT) */}
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
                        id={`t2-item-${idx}-marking`}
                        type="text"
                        placeholder="Marking"
                        value={it.marking || ''}
                        onChange={(e) => {
                          const updated = [...formData.items];
                          updated[idx].marking = e.target.value;
                          setFormData(prev => ({ ...prev, items: updated }));
                        }}
                        onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'marking')}
                        onPaste={(e) => handleT2ItemPaste(e, idx, 'marking')}
                        className="flex-1 min-w-0 p-0.5 bg-transparent border-0 font-medium text-left text-[8px] sm:text-[8.5px] uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded leading-none placeholder:text-slate-300"
                      />
                    </div>
                  </td>
                  <td className={`border border-black p-0.5 ${isItemCellSelected(idx, 6) ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                    <input
                      id={`t2-item-${idx}-heatNo`}
                      type="text"
                      value={it.heatNo}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        const oldHeat = updated[idx].heatNo;
                        updated[idx].heatNo = e.target.value;

                        // Also auto-sync heat number to chemical & mechanical rows
                        const updatedChem = [...(formData.chemicalData || [])];
                        const updatedMech = [...(formData.mechanicalData || [])];
                        if (updatedChem[idx] && (updatedChem[idx].heatNo === oldHeat || !updatedChem[idx].heatNo)) {
                          updatedChem[idx].heatNo = e.target.value;
                        }
                        if (updatedMech[idx] && (updatedMech[idx].heatNo === oldHeat || !updatedMech[idx].heatNo)) {
                          updatedMech[idx].heatNo = e.target.value;
                        }

                        setFormData(prev => ({ 
                          ...prev, 
                          items: updated, 
                          chemicalData: updatedChem, 
                          mechanicalData: updatedMech 
                        }));
                      }}
                      onKeyDown={(e) => handleT2ItemKeyDown(e, idx, 'heatNo')}
                      onPaste={(e) => handleT2ItemPaste(e, idx, 'heatNo')}
                      className="w-full p-0.5 bg-amber-50/50 border border-amber-300 font-bold text-center text-[9px] sm:text-[9.5px] text-amber-950 uppercase focus:bg-white focus:ring-1 focus:ring-amber-500 rounded whitespace-nowrap"
                    />
                  </td>
                  <td className="border border-black p-0.5 text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(it.id, idx)}
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
              <span className="text-[8px] font-semibold text-slate-500 normal-case print:hidden">(Click headers to rename)</span>
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
                title="Toggle Extra Chemical Columns"
              >
                <Sliders className="w-2.5 h-2.5" /> Columns
              </button>
            </div>
          </div>

          {/* COLUMN TOGGLE DRAWER */}
          {showChemColDrawer && (
            <div className="bg-slate-50 p-2.5 border border-black rounded space-y-2 print:hidden mb-1">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[10px]">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>PDF Print Column Toggles (Select columns to include in PDF output):</span>
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
                      showColHardness24Hr: true,
                      showColQuenchingTemp: true,
                      showColQuenchingTime: true,
                      showColQuenchingMedium: true,
                      showColTemperingTemp: true,
                      showColTemperingTime: true,
                      showColStressRelieved: true,
                      showColTemperingResult: true,
                      showColImpactJ: true,
                      showColAvgImpactJ: true,
                      showColImpactTemp: true,
                      showColPren: true,
                      showColStressUnderProofload: true,
                      showColHeatTreatment: true,
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
                      showColStressUnderProofload: false,
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
                    checked={formData.showColPb !== undefined ? formData.showColPb : (formData.chemicalData || formData.items || []).some(r => {
                      const v = r.chem?.pb ?? r.pb;
                      return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                    })}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColPb: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Pb (Lead)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Zn Zinc column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColZn !== undefined ? formData.showColZn : (formData.chemicalData || formData.items || []).some(r => {
                      const v = r.chem?.zn ?? r.zn;
                      return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                    })}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColZn: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Zn (Zinc)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Fe Iron column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColFe !== undefined ? formData.showColFe : (formData.chemicalData || formData.items || []).some(r => {
                      const v = r.chem?.fe ?? r.fe;
                      return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                    })}
                    onChange={(e) => setFormData(prev => ({ ...prev, showColFe: e.target.checked }))}
                    className="w-3 h-3 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>%Fe (Iron)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-bold text-sky-950 hover:text-sky-700 select-none bg-sky-100/70 px-1 py-0.5 rounded border border-sky-300/80" title="Toggle %Sn Tin column in Chemical Composition">
                  <input
                    type="checkbox"
                    checked={formData.showColSn !== undefined ? formData.showColSn : (formData.chemicalData || formData.items || []).some(r => {
                      const v = r.chem?.sn ?? r.sn;
                      return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-' && String(v).trim() !== '—';
                    })}
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

                {/* Mechanical Column Toggles */}
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
                  <span>Stress relived</span>
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

          <table className="w-full border-collapse border border-black text-[9.5px] sm:text-[10px] font-sans table-fixed bg-white">
            <thead>
              <tr className="bg-white border-b border-black font-bold text-[8.5px] sm:text-[9px] leading-tight text-black text-center">
                {activeChemCols.map(c => {
                  const currentLabel = formData.chemHeaderOverrides?.[c.k] ?? c.label;
                  return (
                    <th key={c.k} className="border border-black p-0.5 py-1 align-middle" style={{ width: c.width }}>
                      <input
                        type="text"
                        value={currentLabel}
                        onChange={(e) => updateChemHeader(c.k, e.target.value)}
                        className="w-full bg-transparent border-0 font-bold text-center text-[8.5px] sm:text-[9px] leading-tight text-black hover:bg-amber-100/50 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded px-0.5"
                        title="Click to edit column header"
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, idx) => {
                const chem = formData.chemicalData?.[idx] || {};
                const fallbackHeat = formData.items[idx]?.heatNo || chem.heatNo || '';
                return (
                  <tr key={idx} className="border-b border-black text-[9.5px] sm:text-[10px] hover:bg-amber-50/30">
                    {activeChemCols.map((col, cIdx) => {
                      const val = col.k === 'heatNo' ? (chem.heatNo || fallbackHeat) : (chem as any)[col.k];
                      const isSel = isChemCellSelected(idx, cIdx);
                      return (
                        <td key={col.k} className={`border border-black p-0 h-9 min-h-[36px] text-center align-middle ${isSel ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                          <input
                            id={`t2-chem-${idx}-${col.k}`}
                            type="text"
                            value={col.k === 'heatNo' ? (val || '') : (val !== undefined ? formatChemVal(val) : '')}
                            onChange={(e) => {
                              const updatedChem = [...(formData.chemicalData || [])];
                              if (!updatedChem[idx]) {
                                updatedChem[idx] = {
                                  itemNo: (idx + 1).toString(),
                                  heatNo: fallbackHeat,
                                  specType: 'L'
                                };
                              }
                              (updatedChem[idx] as any)[col.k] = e.target.value;
                              setFormData(prev => ({ ...prev, chemicalData: updatedChem }));
                            }}
                            onBlur={(e) => {
                              if (col.k !== 'heatNo') {
                                const normalized = formatChemVal(e.target.value);
                                setFormData(prev => {
                                  const updatedChem = [...(prev.chemicalData || [])];
                                  if (updatedChem[idx]) {
                                    (updatedChem[idx] as any)[col.k] = normalized;
                                  }
                                  return { ...prev, chemicalData: updatedChem };
                                });
                              }
                            }}
                            onKeyDown={(e) => handleT2ChemKeyDown(e, idx, col.k)}
                            onPaste={(e) => handleT2ChemPaste(e, idx, col.k)}
                            className={`w-full h-full py-2 px-0.5 bg-transparent border-0 ${col.k === 'heatNo' ? 'font-bold text-amber-950 bg-amber-50/30' : 'font-medium text-black'} text-center text-[9.5px] sm:text-[10px] leading-tight focus:bg-white focus:ring-1 focus:ring-amber-500 rounded`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. TABLE 3: MECHANICAL PROPERTIES */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between bg-white text-black border border-black px-2 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[9.5px] tracking-wide uppercase text-black">*MECHANICAL PROPERTIES.</span>
              <span className="text-[8px] font-semibold text-slate-500 normal-case print:hidden">(Click headers to rename)</span>
            </div>
            <div className="flex items-center gap-1 print:hidden">
              <button
                type="button"
                onClick={() => onOpenExcelModal('mechanical')}
                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs"
                title="Paste Mechanical data from Excel"
              >
                <FileSpreadsheet className="w-2.5 h-2.5" /> Excel
              </button>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-[9.5px] sm:text-[10px] font-sans table-fixed bg-white">
            <thead>
              <tr className="bg-white border-b border-black font-bold text-[8.5px] sm:text-[9px] leading-tight text-black text-center">
                {activeMechCols.map(c => {
                  const currentLabel = formData.mechHeaderOverrides?.[c.k] ?? c.label;
                  return (
                    <th key={c.k} className="border border-black p-0.5 py-1 text-center align-middle whitespace-normal leading-tight font-bold text-[8.5px] sm:text-[9px] break-words" style={{ width: c.width }}>
                      <input
                        type="text"
                        value={currentLabel}
                        onChange={(e) => updateMechHeader(c.k, e.target.value)}
                        className="w-full bg-transparent border-0 font-bold text-center text-[8.5px] sm:text-[9px] leading-tight text-black hover:bg-amber-100/50 focus:bg-white focus:ring-1 focus:ring-amber-500 rounded px-0.5"
                        title="Click to edit column header"
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, idx) => {
                const mech = formData.mechanicalData?.[idx] || {};
                const fallbackHeat = formData.items[idx]?.heatNo || mech.heatNo || '';
                return (
                  <tr key={idx} className="border-b border-black text-[9.5px] sm:text-[10px] hover:bg-amber-50/30">
                    {activeMechCols.map((col, cIdx) => {
                      const val = col.k === 'heatNo' ? (mech.heatNo || fallbackHeat) : (mech as any)[col.k];
                      const isSel = isMechCellSelected(idx, cIdx);
                      return (
                        <td key={col.k} className={`border border-black p-0 h-9 min-h-[36px] text-center align-middle ${isSel ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}>
                          <input
                            id={`t2-mech-${idx}-${col.k}`}
                            type="text"
                            value={col.k === 'heatNo' ? (val || '') : (val !== undefined ? formatNumericVal(val) : '')}
                            onChange={(e) => {
                              const updatedMech = [...(formData.mechanicalData || [])];
                              if (!updatedMech[idx]) {
                                updatedMech[idx] = {
                                  itemNo: (idx + 1).toString(),
                                  heatNo: fallbackHeat,
                                  specType: 'P'
                                };
                              }
                              (updatedMech[idx] as any)[col.k] = e.target.value;
                              setFormData(prev => ({ ...prev, mechanicalData: updatedMech }));
                            }}
                            onBlur={(e) => {
                              if (col.k !== 'heatNo') {
                                const normalized = formatNumericVal(e.target.value);
                                setFormData(prev => {
                                  const updatedMech = [...(prev.mechanicalData || [])];
                                  if (updatedMech[idx]) {
                                    (updatedMech[idx] as any)[col.k] = normalized;
                                  }
                                  return { ...prev, mechanicalData: updatedMech };
                                });
                              }
                            }}
                            onKeyDown={(e) => handleT2MechKeyDown(e, idx, col.k)}
                            onPaste={(e) => handleT2MechPaste(e, idx, col.k)}
                            className={`w-full h-full py-2 px-0.5 bg-transparent border-0 ${col.k === 'heatNo' ? 'font-bold text-amber-950 bg-amber-50/30' : 'font-medium text-black'} text-center text-[9.5px] sm:text-[10px] leading-tight focus:bg-white focus:ring-1 focus:ring-amber-500 rounded`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
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
                <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Carbide Solution treated :</span>
                <input type="text" value={formData.heatTreatmentCarbide || 'Was treated by raw material factory'} onChange={(e) => setFormData({ ...formData, heatTreatmentCarbide: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Strain Hardened :</span>
                <input type="text" value={formData.heatTreatmentStrain || 'Was treated'} onChange={(e) => setFormData({ ...formData, heatTreatmentStrain: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Quenching :</span>
                <input type="text" value={formData.heatTreatmentQuenching || 'N/A'} onChange={(e) => setFormData({ ...formData, heatTreatmentQuenching: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-amber-800 shrink-0" />
                <span className="w-48 font-bold text-slate-900 text-[9.5px]">Tempering :</span>
                <input type="text" value={formData.heatTreatmentTempering || 'N/A'} onChange={(e) => setFormData({ ...formData, heatTreatmentTempering: e.target.value })} className="flex-1 p-0.5 bg-transparent border-b border-slate-200 text-[9.5px] font-medium" />
              </div>
            </div>
          </div>
        )}

        {/* 7. BOX 5: ADDITIONAL TECHNICAL INFORMATION (WITH EDITABLE LEFT TITLES & + ADD LINE BUTTON) */}
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
                  value={line.text}
                  onChange={(e) => {
                    const updated = [...(formData.customTechInfoLines || [])];
                    updated[customIdx].text = e.target.value;
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

        {/* 7. DECLARATION / CERTIFICATION STATEMENT */}
        <div className="pt-2 mt-1 border-t border-black text-[9px] font-bold text-black leading-snug">
          <textarea
            rows={2}
            value={formData.remarks || "We hereby certify that the materials described herein have been manufactured, inspected and tested in accordance with the customer's specification(s), and that they satisfy the requirements."}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full p-0.5 bg-transparent border border-dashed border-slate-300 rounded font-bold text-[9px] text-black leading-tight resize-none focus:bg-white focus:border-solid focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* 8. SIGNATURES & STAMP CONTROLS TOOLBAR (PRINT HIDDEN) */}
        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[8px] print:hidden">
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
          <div className="bg-slate-100 p-2.5 rounded border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[8px] print:hidden">
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

        {/* 9. SIGNATURES & STAMP AREA (PREPARED BY LEFT, APPROVED BY RIGHT) */}
        <div className="flex items-end justify-between pt-2 relative">
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
            <div className="font-bold text-[8.5px] text-black leading-tight">{getCompanyQcHead(activeCompany)}</div>
            <div className="font-bold text-[8.5px] text-black tracking-tight leading-tight">{activeCompany.name}</div>
          </div>
        </div>

      </div>

      {/* FLOATING ROW CONTEXT MENU */}
      {rowContextMenu && (
        <div 
          style={{ 
            top: `${Math.min(window.innerHeight - 180, rowContextMenu.y)}px`, 
            left: `${Math.min(window.innerWidth - 220, rowContextMenu.x)}px` 
          }}
          className="fixed z-50 bg-white border border-slate-300 rounded-lg shadow-2xl p-1.5 min-w-[200px] text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100 font-sans print:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span>Row {rowContextMenu.rowIdx + 1} Options</span>
            <span className="text-[8.5px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">All Tables Sync</span>
          </div>
          <button
            type="button"
            onClick={() => handleInsertRowAt(rowContextMenu.rowIdx, 'below')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>Add New Row Below</span>
          </button>
          <button
            type="button"
            onClick={() => handleInsertRowAt(rowContextMenu.rowIdx, 'above')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Add New Row Above</span>
          </button>
          <button
            type="button"
            onClick={() => handleDuplicateRowAt(rowContextMenu.rowIdx)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-blue-50 text-slate-700 hover:text-blue-900 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span>Duplicate Row</span>
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => handleDeleteRowAt(rowContextMenu.rowIdx)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Row</span>
          </button>
        </div>
      )}
    </div>
  );
};
