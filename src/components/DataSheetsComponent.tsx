import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  Eye, 
  CheckCircle2, 
  Edit3, 
  Layers, 
  CheckSquare, 
  Square, 
  ArrowDown, 
  ClipboardCopy, 
  ClipboardPaste, 
  Sparkles, 
  Undo2, 
  Redo2, 
  Save, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  Calendar,
  Image as ImageIcon,
  Check,
  RefreshCw,
  PlusCircle,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { 
  DataSheetRecord, 
  DimensionalInspectionRow, 
  CellCoord, 
  CellRange 
} from './datasheets/dataSheetTypes';
import { 
  DEFAULT_DIN934_HEX_NUT_RECORD, 
  PRESET_FASTENERS, 
  INITIAL_ARCHIVES_LIST,
  CHEMICAL_DEFAULT_HEADERS,
  MECHANICAL_DEFAULT_HEADERS,
  getPersistedBranding,
  savePersistedBranding,
  sanitizeDataSheetRecord
} from './datasheets/dataSheetPresets';
import { TechnicalDrawingView, HeadStampDrawingView } from './datasheets/DataSheetDrawings';
import { DataSheetArchivesView } from './datasheets/DataSheetArchivesView';
import { DataSheetHeaderEditor } from './datasheets/DataSheetHeaderEditor';
import { DataSheetFooterSignatures } from './datasheets/DataSheetFooterSignatures';
import { ChemicalMechanicalSection } from './datasheets/ChemicalMechanicalSection';
import { Template2MultiSizeView } from './datasheets/Template2MultiSizeView';
import { printDataSheet } from './datasheets/dataSheetPrintHelper';
import { INITIAL_CUSTOMERS } from '../customerData';
import { 
  saveDataSheetsSafely, 
  loadDataSheetsFromLocalStorage, 
  loadDataSheetsFromIndexedDB, 
  compressDataSheetImage,
  hydrateDataSheetRecord
} from '../utils/dataSheetStorage';

const LOCAL_STORAGE_KEY = 'MFI_DATA_SHEETS_REGISTRY_V3';

export const DataSheetsComponent: React.FC = () => {
  // Navigation tabs: 'EDITOR' | 'ARCHIVES'
  const [activeTab, setActiveTab] = useState<'EDITOR' | 'ARCHIVES'>('EDITOR');

  // Archives state with instant synchronous local cache + async IndexedDB reconciliation
  const [archives, setArchives] = useState<DataSheetRecord[]>(() => {
    try {
      const saved = loadDataSheetsFromLocalStorage();
      if (saved && saved.length > 0) {
        return saved.map(r => sanitizeDataSheetRecord(r));
      }
    } catch (e) {
      console.warn('Failed to load initial data sheets cache', e);
    }
    return INITIAL_ARCHIVES_LIST.map(r => sanitizeDataSheetRecord(r));
  });

  // Reconcile full records from IndexedDB
  useEffect(() => {
    let isMounted = true;
    loadDataSheetsFromIndexedDB().then((indexedRecords) => {
      if (isMounted && indexedRecords && indexedRecords.length > 0) {
        const sanitized = indexedRecords.map(r => sanitizeDataSheetRecord(r));
        setArchives(prev => {
          // If previous was only fallback default, use IndexedDB directly
          if (prev === INITIAL_ARCHIVES_LIST || prev.length === 0) {
            return sanitized;
          }
          // Merge / update existing
          const map = new Map<string, DataSheetRecord>();
          sanitized.forEach(r => map.set(r.id, r));
          prev.forEach(r => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          return Array.from(map.values());
        });
      }
    }).catch(err => {
      console.warn('IndexedDB reconciliation notice:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Raw state and synchronized record state setter
  const [record, setRawRecord] = useState<DataSheetRecord>(() => {
    const base = archives[0] || DEFAULT_DIN934_HEX_NUT_RECORD;
    const sanitizedBase = sanitizeDataSheetRecord(base);
    const branding = getPersistedBranding(sanitizedBase);
    return { 
      ...sanitizedBase, 
      ...branding,
      includeMtcPage: sanitizedBase.includeMtcPage !== undefined ? Boolean(sanitizedBase.includeMtcPage) : true 
    };
  });

  // Multi-Sheet / Multi-Page creation state
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);

  // Synchronized record setter that keeps active sheet within record.sheets in sync
  const setRecord: React.Dispatch<React.SetStateAction<DataSheetRecord>> = useCallback((updater) => {
    setRawRecord(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const normalizedIncludeMtc = next.includeMtcPage !== undefined ? Boolean(next.includeMtcPage) : true;
      
      // If there are multiple sheets or a sheets array, keep active sheet in sync
      if (next.sheets && Array.isArray(next.sheets) && next.sheets.length > 0) {
        const curIdx = Math.min(activeSheetIndex, next.sheets.length - 1);
        const updatedSheets = [...next.sheets];
        const { sheets: _omittedSheets, activeSheetIndex: _omittedIdx, ...sheetData } = next;
        
        updatedSheets[curIdx] = {
          ...updatedSheets[curIdx],
          ...sheetData,
          includeMtcPage: normalizedIncludeMtc
        };

        return {
          ...next,
          includeMtcPage: normalizedIncludeMtc,
          sheets: updatedSheets
        };
      }

      return {
        ...next,
        includeMtcPage: normalizedIncludeMtc
      };
    });
  }, [activeSheetIndex]);

  // Keep logo, ISO logo, signatures, and stamp permanently stable in localStorage
  useEffect(() => {
    savePersistedBranding(record);
  }, [
    record.customLogoImage,
    record.customIsoImage,
    record.headerCompanyName,
    record.headerCompanySub,
    record.headerCompanyAddress,
    record.headerCompanyContact,
    record.headerPrintEmailAndWeb,
    record.headerIsoText,
    record.preparedByName,
    record.preparedByTitle,
    record.approvedByName,
    record.approvedByTitle,
    record.approvedByCompany,
    record.preparedBySignatureImage,
    record.approvedBySignatureImage,
    record.stampSealImage,
    record.showSeal,
    record.preparedSignHeight,
    record.approvedSignHeight,
    record.stampHeight,
    record.preparedSignPosX,
    record.preparedSignPosY,
    record.approvedSignPosX,
    record.approvedSignPosY,
    record.stampPosX,
    record.stampPosY
  ]);

  // Feedback Notification banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Track if current editor sheet was opened from Archives / Records list
  const [openedFromArchives, setOpenedFromArchives] = useState<boolean>(false);

  // Autocomplete customer dropdown
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Derived list of sheets (Single Product & Multi Product sheets)
  const sheetList = useMemo<DataSheetRecord[]>(() => {
    if (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0) {
      return record.sheets;
    }
    return [record];
  }, [record.sheets, record]);

  const currentActiveIdx = Math.min(activeSheetIndex, Math.max(0, sheetList.length - 1));

  // Calculate total pages across all sheets in the document
  const totalDocPages = useMemo(() => {
    const sheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? record.sheets
      : [record];
    return sheets.reduce((acc, sh) => acc + (sh.includeMtcPage ? 2 : 1), 0);
  }, [record]);

  // Synchronize active sheet updates back into record.sheets
  const handleSelectSheet = (idx: number) => {
    setActiveSheetIndex(idx);
    setRawRecord(prev => {
      const currentSheets = (prev.sheets && Array.isArray(prev.sheets) && prev.sheets.length > 0)
        ? [...prev.sheets]
        : [{ ...prev }];
      
      // Flush current sheet data before switching
      const curIdx = Math.min(activeSheetIndex, currentSheets.length - 1);
      const { sheets: _s, activeSheetIndex: _a, ...currSheetData } = prev;
      currentSheets[curIdx] = {
        ...currentSheets[curIdx],
        ...currSheetData,
        includeMtcPage: prev.includeMtcPage !== undefined ? Boolean(prev.includeMtcPage) : true
      };

      const targetIdx = Math.min(idx, currentSheets.length - 1);
      const targetSheet = currentSheets[targetIdx] || currentSheets[0];
      const targetIncludeMtc = targetSheet.includeMtcPage !== undefined ? Boolean(targetSheet.includeMtcPage) : true;

      return {
        ...prev,
        ...targetSheet,
        includeMtcPage: targetIncludeMtc,
        sheets: currentSheets,
        activeSheetIndex: targetIdx
      };
    });
  };

  const handleAddSheet = (templateCategory: 'template1' | 'template2' = 'template1') => {
    const currentSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? [...record.sheets]
      : [{ ...record }];

    const newSheetNo = currentSheets.length + 1;
    const isMulti = templateCategory === 'template2';
    const newSheet: DataSheetRecord = {
      ...JSON.parse(JSON.stringify(record)),
      id: `sheet_${Date.now()}_${newSheetNo}`,
      templateType: templateCategory,
      page1Title: `DATA SHEET - ITEM ${newSheetNo}`,
      subject: record.subject ? record.subject : (isMulti
        ? `MULTIPLEX DIMENSIONAL INSPECTION MATRIX FOR FASTENERS (ITEM ${newSheetNo})`
        : `DIMENSIONAL INSPECTIONS & TECHNICAL REQUIREMENTS (ITEM ${newSheetNo})`),
      showObjective: record.showObjective,
      showDrawings: true,
      showDimensionalInspection: true,
      includeMtcPage: true,
      updatedAt: new Date().toISOString()
    };

    const nextSheets = [...currentSheets, newSheet];
    const newIndex = nextSheets.length - 1;

    setRawRecord(prev => ({
      ...prev,
      ...newSheet,
      includeMtcPage: true,
      sheets: nextSheets,
      activeSheetIndex: newIndex
    }));
    setActiveSheetIndex(newIndex);
    showToast(`Added Product Sheet ${newSheetNo} (${isMulti ? 'Multi Product' : 'Single Product'})`, 'success');
  };

  const handleDuplicateSheet = (idx: number) => {
    const currentSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? [...record.sheets]
      : [{ ...record }];

    const target = currentSheets[idx] || record;
    const newSheetNo = currentSheets.length + 1;
    const cloned: DataSheetRecord = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sheet_${Date.now()}_${newSheetNo}`,
      page1Title: `${target.page1Title || `Sheet ${idx + 1}`} (Copy)`,
      includeMtcPage: target.includeMtcPage !== undefined ? Boolean(target.includeMtcPage) : true,
      updatedAt: new Date().toISOString()
    };

    const nextSheets = [...currentSheets, cloned];
    const newIndex = nextSheets.length - 1;

    setRawRecord(prev => ({
      ...prev,
      ...cloned,
      includeMtcPage: cloned.includeMtcPage,
      sheets: nextSheets,
      activeSheetIndex: newIndex
    }));
    setActiveSheetIndex(newIndex);
    showToast(`Duplicated Sheet ${idx + 1} as Sheet ${newSheetNo}`, 'success');
  };

  const handleDeleteSheet = (idx: number) => {
    const currentSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? [...record.sheets]
      : [{ ...record }];

    if (currentSheets.length <= 1) {
      showToast('Cannot delete the only remaining product sheet', 'error');
      return;
    }

    const nextSheets = currentSheets.filter((_, i) => i !== idx);
    const newIndex = Math.max(0, idx - 1);
    const nextActive = nextSheets[newIndex] || nextSheets[0];

    setRawRecord(prev => ({
      ...prev,
      ...nextActive,
      includeMtcPage: nextActive.includeMtcPage !== undefined ? Boolean(nextActive.includeMtcPage) : true,
      sheets: nextSheets,
      activeSheetIndex: newIndex
    }));
    setActiveSheetIndex(newIndex);
    showToast(`Deleted Product Sheet ${idx + 1}`, 'info');
  };

  // Apply current sheet's single product / subject across all pages / sheets
  const handleSyncProductToAllSheets = () => {
    const currentSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? [...record.sheets]
      : [{ ...record }];

    const updatedSheets = currentSheets.map((sh) => ({
      ...sh,
      subject: record.subject,
      standard: record.standard || sh.standard,
      materialGrade: record.materialGrade || sh.materialGrade,
      surfaceFinish: record.surfaceFinish || sh.surfaceFinish,
      updatedAt: new Date().toISOString()
    }));

    setRawRecord(prev => ({
      ...prev,
      subject: record.subject,
      sheets: updatedSheets
    }));
    showToast(`Applied single product to all ${updatedSheets.length} pages`, 'success');
  };

  // Sync entire document header metadata across all sheets
  const handleSyncAllHeadersToAllSheets = () => {
    const currentSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? [...record.sheets]
      : [{ ...record }];

    const updatedSheets = currentSheets.map((sh) => ({
      ...sh,
      customerName: record.customerName,
      dataSheetNo: record.dataSheetNo,
      date: record.date,
      projectPoNo: record.projectPoNo,
      subject: record.subject,
      materialGrade: record.materialGrade,
      standard: record.standard,
      surfaceFinish: record.surfaceFinish,
      drawingNo: record.drawingNo,
      drawingRev: record.drawingRev,
      headerDocTitle: record.headerDocTitle,
      customLogoImage: record.customLogoImage,
      customIsoImage: record.customIsoImage,
      preparedByName: record.preparedByName,
      preparedByTitle: record.preparedByTitle,
      approvedByName: record.approvedByName,
      approvedByTitle: record.approvedByTitle,
      customPreparedSign: record.customPreparedSign,
      customApprovedSign: record.customApprovedSign,
      customStampImage: record.customStampImage,
      updatedAt: new Date().toISOString()
    }));

    setRawRecord(prev => ({
      ...prev,
      sheets: updatedSheets
    }));
    showToast(`Synchronized common header & product details to all ${updatedSheets.length} pages`, 'success');
  };

  // Save archives whenever they change (quota-safe via IndexedDB & compact cache)
  useEffect(() => {
    saveDataSheetsSafely(archives);
  }, [archives]);

  // Show notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // =========================================================================
  // SPREADSHEET HOOK: Keyboard Navigation, Range Selection, Fill Down, Copy/Paste
  // =========================================================================
  const [activeCell, setActiveCell] = useState<CellCoord | null>(null);
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const isShiftNavRef = useRef(false);

  // Helper to check if a cell is selected / active
  const isCellSelected = useCallback((table: string, r: number, c: number) => {
    if (!selectedRange || selectedRange.table !== table) {
      return activeCell?.table === table && activeCell.r === r && activeCell.c === c;
    }
    const minR = Math.min(selectedRange.startR, selectedRange.endR);
    const maxR = Math.max(selectedRange.startR, selectedRange.endR);
    const minC = Math.min(selectedRange.startC, selectedRange.endC);
    const maxC = Math.max(selectedRange.startC, selectedRange.endC);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  }, [selectedRange, activeCell]);

  const selectCell = useCallback((table: string, r: number, c: number, extendRange: boolean = false) => {
    if (isShiftNavRef.current) {
      setActiveCell({ table, r, c });
      return;
    }
    setActiveCell({ table, r, c });
    if (extendRange && selectedRange && selectedRange.table === table) {
      setSelectedRange({
        table,
        startR: selectedRange.startR,
        startC: selectedRange.startC,
        endR: r,
        endC: c
      });
    } else {
      setSelectedRange({
        table,
        startR: r,
        startC: c,
        endR: r,
        endC: c
      });
    }
  }, [selectedRange]);

  // Read matrix for a table
  const getTableMatrix = useCallback((table: string): string[][] => {
    if (table === 'dimensional') {
      return record.dimensionalInspections.map(row => [row.characteristic || '', row.requirements || '']);
    }
    if (table === 'chemical') {
      return [
        record.chemicalMin || [],
        record.chemicalMax || [],
        record.chemicalObserved || []
      ];
    }
    if (table === 'mechanical') {
      return [
        record.mechanicalMin || [],
        record.mechanicalMax || []
      ];
    }
    return [];
  }, [record]);

  // Update matrix for a table
  const setTableMatrix = useCallback((table: string, newMatrix: string[][]) => {
    if (table === 'dimensional') {
      setRecord(prev => {
        const updated = prev.dimensionalInspections.map((row, idx) => {
          if (newMatrix[idx]) {
            return {
              ...row,
              characteristic: newMatrix[idx][0] ?? row.characteristic,
              requirements: newMatrix[idx][1] ?? row.requirements
            };
          }
          return row;
        });
        return { ...prev, dimensionalInspections: updated };
      });
    } else if (table === 'chemical') {
      setRecord(prev => ({
        ...prev,
        chemicalMin: newMatrix[0] ?? prev.chemicalMin,
        chemicalMax: newMatrix[1] ?? prev.chemicalMax,
        chemicalObserved: newMatrix[2] ?? prev.chemicalObserved
      }));
    } else if (table === 'mechanical') {
      setRecord(prev => ({
        ...prev,
        mechanicalMin: newMatrix[0] ?? prev.mechanicalMin,
        mechanicalMax: newMatrix[1] ?? prev.mechanicalMax
      }));
    }
  }, []);

  // Fill Down execution
  const executeFillDown = useCallback((table: string) => {
    const currentMatrix = getTableMatrix(table);
    if (!currentMatrix.length) return;
    const newMatrix = currentMatrix.map(row => [...row]);

    if (selectedRange && selectedRange.table === table) {
      const minR = Math.min(selectedRange.startR, selectedRange.endR);
      const maxR = Math.max(selectedRange.startR, selectedRange.endR);
      const minC = Math.min(selectedRange.startC, selectedRange.endC);
      const maxC = Math.max(selectedRange.startC, selectedRange.endC);

      if (minR < maxR) {
        for (let rowIdx = minR + 1; rowIdx <= maxR; rowIdx++) {
          for (let colIdx = minC; colIdx <= maxC; colIdx++) {
            if (newMatrix[minR] && newMatrix[rowIdx]) {
              newMatrix[rowIdx][colIdx] = newMatrix[minR][colIdx] || '';
            }
          }
        }
      } else if (minR > 0) {
        for (let colIdx = minC; colIdx <= maxC; colIdx++) {
          if (newMatrix[minR - 1] && newMatrix[minR]) {
            newMatrix[minR][colIdx] = newMatrix[minR - 1][colIdx] || '';
          }
        }
      }
    } else if (activeCell && activeCell.table === table && activeCell.r > 0) {
      if (newMatrix[activeCell.r - 1] && newMatrix[activeCell.r]) {
        newMatrix[activeCell.r][activeCell.c] = newMatrix[activeCell.r - 1][activeCell.c] || '';
      }
    }

    setTableMatrix(table, newMatrix);
    showToast('Applied Fill Down (Ctrl+D)', 'info');
  }, [getTableMatrix, setTableMatrix, selectedRange, activeCell]);

  // Copy Selection to Clipboard
  const executeCopy = useCallback((table: string) => {
    const currentMatrix = getTableMatrix(table);
    let tsvText = '';

    if (selectedRange && selectedRange.table === table) {
      const minR = Math.min(selectedRange.startR, selectedRange.endR);
      const maxR = Math.max(selectedRange.startR, selectedRange.endR);
      const minC = Math.min(selectedRange.startC, selectedRange.endC);
      const maxC = Math.max(selectedRange.startC, selectedRange.endC);

      const rows: string[] = [];
      for (let ri = minR; ri <= maxR; ri++) {
        const rowCells: string[] = [];
        for (let ci = minC; ci <= maxC; ci++) {
          rowCells.push(currentMatrix[ri]?.[ci] || '');
        }
        rows.push(rowCells.join('\t'));
      }
      tsvText = rows.join('\n');
    } else if (activeCell && activeCell.table === table) {
      tsvText = currentMatrix[activeCell.r]?.[activeCell.c] || '';
    }

    if (tsvText) {
      navigator.clipboard.writeText(tsvText).then(() => {
        showToast('Copied to clipboard (TSV format)', 'info');
      }).catch(() => {
        showToast('Clipboard access denied', 'error');
      });
    }
  }, [getTableMatrix, selectedRange, activeCell]);

  // Handle cell keydown navigation (Arrows, Tab, Enter, Ctrl+D)
  const handleCellKeyDown = useCallback((
    e: React.KeyboardEvent,
    table: string,
    r: number,
    c: number,
    maxRows: number,
    maxCols: number
  ) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      executeFillDown(table);
      return;
    }

    let targetR = r;
    let targetC = c;
    let handled = false;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      targetR = Math.min(r + 1, maxRows - 1);
      handled = true;
    } else if (e.key === 'ArrowUp') {
      targetR = Math.max(r - 1, 0);
      handled = true;
    } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
      if (c + 1 < maxCols) {
        targetC = c + 1;
      } else if (r + 1 < maxRows) {
        targetR = r + 1;
        targetC = 0;
      }
      handled = true;
    } else if (e.key === 'ArrowLeft') {
      if (c - 1 >= 0) {
        targetC = c - 1;
      } else if (r - 1 >= 0) {
        targetR = r - 1;
        targetC = maxCols - 1;
      }
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      selectCell(table, targetR, targetC, e.shiftKey);
      const targetInput = document.querySelector(`[data-cell="${table}_${targetR}_${targetC}"]`) as HTMLInputElement;
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
    }
  }, [executeFillDown, selectCell]);

  // Handle Cell Paste
  const handleCellPaste = (
    e: React.ClipboardEvent,
    table: string,
    startR: number,
    startC: number
  ) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;

    const rows = pasteData.split(/\r?\n/).map(row => row.split('\t'));
    const currentMatrix = getTableMatrix(table);
    const newMatrix = currentMatrix.map(row => [...row]);

    for (let ri = 0; ri < rows.length; ri++) {
      const targetR = startR + ri;
      if (!newMatrix[targetR]) continue;
      for (let ci = 0; ci < rows[ri].length; ci++) {
        const targetC = startC + ci;
        if (newMatrix[targetR][targetC] !== undefined) {
          newMatrix[targetR][targetC] = rows[ri][ci];
        }
      }
    }

    setTableMatrix(table, newMatrix);
    showToast(`Pasted ${rows.length} rows from clipboard`, 'success');
  };

  // Actions
  const handleLoadPreset = (presetRecord: Partial<DataSheetRecord>) => {
    setRecord(prev => ({
      ...prev,
      ...presetRecord,
      id: `ds-${Date.now()}`,
      updatedAt: new Date().toISOString()
    }));
    showToast('Loaded standard preset specification', 'success');
  };

  const handleCreateNew = () => {
    const randomSerial = Math.floor(100000 + Math.random() * 900000);
    const branding = getPersistedBranding(record);
    const newRec: DataSheetRecord = {
      ...DEFAULT_DIN934_HEX_NUT_RECORD,
      ...branding, // Keeps Company Logo, ISO Logo, Prepared Sign, Approved Sign, Stamp & Sizes stable!
      id: `ds-${Date.now()}`,
      dataSheetNo: `MFI/2026/${randomSerial}`,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecord(newRec);
    setOpenedFromArchives(false);
    setActiveTab('EDITOR');
    showToast('Created new Technical Data Sheet (Logo, ISO badges, Signatures & Stamp preserved)', 'success');
  };

  const handleSaveToArchives = () => {
    // Synchronize active sheet state into sheets before saving
    const currentSheets = (record.sheets && Array.isArray(record.sheets) && record.sheets.length > 0)
      ? [...record.sheets]
      : [{ ...record }];
    const curIdx = Math.min(activeSheetIndex, currentSheets.length - 1);
    const { sheets: _s, activeSheetIndex: _a, ...currData } = record;
    currentSheets[curIdx] = {
      ...currentSheets[curIdx],
      ...currData,
      includeMtcPage: Boolean(record.includeMtcPage)
    };

    const finalRecordToSave: DataSheetRecord = {
      ...record,
      includeMtcPage: Boolean(record.includeMtcPage),
      sheets: currentSheets,
      updatedAt: new Date().toISOString()
    };

    const existingIdx = archives.findIndex(a => a.id === finalRecordToSave.id);
    let updatedArchives: DataSheetRecord[];
    if (existingIdx >= 0) {
      updatedArchives = [...archives];
      updatedArchives[existingIdx] = finalRecordToSave;
    } else {
      updatedArchives = [finalRecordToSave, ...archives];
    }
    setArchives(updatedArchives);
    setRawRecord(finalRecordToSave);
    showToast(`Saved ${finalRecordToSave.dataSheetNo} to Archives Registry!`, 'success');
  };

  const handleEditFromArchives = (targetRecord: DataSheetRecord) => {
    const hydrated = hydrateDataSheetRecord(targetRecord);
    setRawRecord({
      ...hydrated,
      includeMtcPage: hydrated.includeMtcPage !== undefined ? Boolean(hydrated.includeMtcPage) : true
    });
    setActiveSheetIndex(0);
    setOpenedFromArchives(true);
    setActiveTab('EDITOR');
    showToast(`Editing Data Sheet ${targetRecord.dataSheetNo}`, 'info');
  };

  const handleDuplicateRecord = (targetRecord: DataSheetRecord) => {
    const randomSerial = Math.floor(100000 + Math.random() * 900000);
    const hydrated = hydrateDataSheetRecord(targetRecord);
    const cloned: DataSheetRecord = {
      ...hydrated,
      id: `ds-${Date.now()}`,
      dataSheetNo: `MFI/2026/${randomSerial}`,
      date: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString()
    };
    setArchives([cloned, ...archives]);
    setRawRecord(cloned);
    setActiveSheetIndex(0);
    setOpenedFromArchives(true);
    setActiveTab('EDITOR');
    showToast(`Duplicated Data Sheet as ${cloned.dataSheetNo}`, 'success');
  };

  const handleDeleteArchive = (id: string) => {
    const remaining = archives.filter(a => a.id !== id);
    setArchives(remaining);
    showToast('Deleted Data Sheet from Archives', 'info');
  };

  const handleAddInspectionRow = () => {
    const newRow: DimensionalInspectionRow = {
      id: `di-${Date.now()}`,
      selected: true,
      characteristic: 'New Inspection Item (mm)',
      requirements: '—'
    };
    setRecord(prev => ({
      ...prev,
      dimensionalInspections: [...prev.dimensionalInspections, newRow]
    }));
    showToast('Added dimensional inspection row', 'info');
  };

  const handleDeleteInspectionRow = (rowId: string) => {
    setRecord(prev => ({
      ...prev,
      dimensionalInspections: prev.dimensionalInspections.filter(r => r.id !== rowId)
    }));
  };

  // Autocomplete customer filter
  const filteredCustomers = useMemo(() => {
    const q = (record.customer || '').toLowerCase().trim();
    if (!q) return INITIAL_CUSTOMERS.slice(0, 8);
    return INITIAL_CUSTOMERS.filter(c => c.companyName.toLowerCase().includes(q)).slice(0, 8);
  }, [record.customer]);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold transition-all transform translate-y-0 ${
          notification.type === 'success' ? 'bg-emerald-800 text-white' :
          notification.type === 'error' ? 'bg-rose-800 text-white' : 'bg-slate-900 text-white'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Mode Navigation Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('EDITOR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition-all ${
                activeTab === 'EDITOR'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
              DATA SHEET EDITOR & LIVE PREVIEW
            </button>
            <button
              onClick={() => setActiveTab('ARCHIVES')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition-all ${
                activeTab === 'ARCHIVES'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              DATA SHEET ARCHIVES ({archives.length})
            </button>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'EDITOR' && (
            <>
              {/* Close Sheet Button (Visible ONLY when opened from Archives/Records) */}
              {openedFromArchives && (
                <button
                  onClick={() => {
                    setActiveTab('ARCHIVES');
                    setOpenedFromArchives(false);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  title="Close this data sheet and return to Archives list"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Close Sheet</span>
                </button>
              )}

              {/* Create New Data Sheet Button */}
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                title="Create a new blank technical data sheet"
              >
                <Plus className="w-4 h-4" />
                <span>New Data Sheet</span>
              </button>

              {/* Save to Archives */}
              <button
                onClick={handleSaveToArchives}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save to Archives
              </button>

              {/* Print / Save PDF (Horizontal / Landscape enabled) */}
              <button
                onClick={() => printDataSheet(record)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm tracking-wide uppercase transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF {record.printOrientation === 'landscape' ? '(Horizontal)' : ''}
              </button>
            </>
          )}

          {activeTab === 'ARCHIVES' && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Data Sheet
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: DATA SHEET ARCHIVES VIEW                                   */}
      {/* ================================================================= */}
      {activeTab === 'ARCHIVES' && (
        <DataSheetArchivesView
          archives={archives}
          onSelectRecord={(rec) => {
            setRecord(rec);
            setOpenedFromArchives(true);
            setActiveTab('EDITOR');
          }}
          onEditRecord={handleEditFromArchives}
          onDuplicateRecord={handleDuplicateRecord}
          onDeleteRecord={handleDeleteArchive}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* ================================================================= */}
      {/* TAB 2: DATA SHEET EDITOR & LIVE PREVIEW                           */}
      {/* ================================================================= */}
      {activeTab === 'EDITOR' && (
        <div className="space-y-4">
          
          {/* Active Sheet Banner with Close Button (Visible ONLY when opened from Archives/Records) */}
          {openedFromArchives && (
            <div className="bg-sky-50 border border-sky-200 px-4 py-2 rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Currently Open:
                </span>
                <span className="font-mono text-xs font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-300">
                  {record.dataSheetNo || 'NEW DATA SHEET'}
                </span>
                <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                  ({record.customer || 'Generic / Unassigned'})
                </span>
              </div>

              <button
                onClick={() => {
                  setActiveTab('ARCHIVES');
                  setOpenedFromArchives(false);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Close & Back to Archives</span>
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* MULTI-SHEET / MULTI-PAGE MANAGEMENT TOOLBAR (SINGLE & MULTI)       */}
          {/* ================================================================= */}
          <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 px-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>SHEETS ({sheetList.length}):</span>
              </div>

              {sheetList.map((sh, sIdx) => {
                const isActive = sIdx === currentActiveIdx;
                const isMulti = sh.templateType === 'template2';
                return (
                  <div
                    key={sh.id || sIdx}
                    onClick={() => handleSelectSheet(sIdx)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span className="truncate max-w-[120px]">
                      {sh.page1Title || `Sheet ${sIdx + 1}`}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      isMulti ? 'bg-amber-500/30 text-amber-200' : 'bg-sky-400/30 text-sky-100'
                    }`}>
                      {isMulti ? 'Multi' : 'Single'}
                    </span>

                    {/* Quick Duplicate button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSheet(sIdx);
                      }}
                      className="opacity-70 hover:opacity-100 hover:text-amber-300 p-0.5 transition-opacity"
                      title="Duplicate this sheet"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    {/* Delete button (if > 1 sheet) */}
                    {sheetList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSheet(sIdx);
                        }}
                        className="opacity-70 hover:opacity-100 hover:text-rose-400 p-0.5 transition-opacity"
                        title="Delete this sheet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* + ADD SHEET BUTTONS & SYNC ACTIONS */}
              <div className="flex flex-wrap items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => handleAddSheet('template1')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-dashed border-sky-500/50 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  title="Add Single Product Sheet / Page"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>+ Single Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSheet('template2')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-dashed border-amber-500/50 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  title="Add Multi Product Sheet / Page"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Multi Sheet</span>
                </button>
                {sheetList.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSyncAllHeadersToAllSheets}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    title="Copy this product title, customer, and header details to all pages/sheets"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sync to All Pages</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document summary info */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pr-1 font-medium">
              <span>Total Doc Pages: <strong className="text-white font-mono">{totalDocPages}</strong></span>
            </div>
          </div>

          {/* PRIMARY CONFIGURATION TOOLBAR (TEMPLATES, PRINT ORIENTATION, SECTION TOGGLES) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              
              {/* TEMPLATE CATEGORY: SINGLE PRODUCT vs MULTI PRODUCT */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  TEMPLATE CATEGORY:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setRecord(prev => ({ ...prev, templateType: 'template1' }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      record.templateType !== 'template2'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Single Product
                  </button>
                  <button
                    onClick={() => setRecord(prev => ({ ...prev, templateType: 'template2', printOrientation: 'landscape' }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      record.templateType === 'template2'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Multi Product
                  </button>
                </div>
              </div>

              {/* HORIZONTAL / LANDSCAPE PRINT PDF TOGGLE */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  PRINT ORIENTATION:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setRecord(prev => ({ ...prev, printOrientation: 'landscape' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      record.printOrientation === 'landscape'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Horizontal (Landscape)
                  </button>
                  <button
                    onClick={() => setRecord(prev => ({ ...prev, printOrientation: 'portrait' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      record.printOrientation === 'portrait'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vertical (Portrait)
                  </button>
                </div>
              </div>

            </div>

            {/* SECTION TOGGLES & SPREADSHEET TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* CHECKBOXES (OBJECTIVE, DIMENSIONAL INSPECTION, MTC PAGE 2) */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* 1. OBJECTIVE ADD CHECK BOX */}
                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={record.showObjective}
                    onChange={(e) => setRecord(prev => ({ ...prev, showObjective: e.target.checked }))}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    OBJECTIVE BOX
                  </span>
                </label>

                {/* 2. DIMENSIONAL INSPECTION ADD CHECK BOX (Template 1) */}
                {record.templateType !== 'template2' && (
                  <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={record.showDimensionalInspection}
                      onChange={(e) => setRecord(prev => ({ ...prev, showDimensionalInspection: e.target.checked }))}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      DIMENSIONAL INSPECTION
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">({record.dimensionalInspections.length} checks)</span>
                  </label>
                )}

                {/* 3. DRAWINGS BOX TOGGLE (Template 1 & Template 2) */}
                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={record.showDrawings !== false}
                    onChange={(e) => setRecord(prev => ({ ...prev, showDrawings: e.target.checked }))}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    TECHNICAL DRAWINGS
                  </span>
                </label>

                {/* 4. PAGE 2 DATA SHEET (CHEMICAL & MECHANICAL) */}
                <label 
                  id="label_include_page2_datasheet"
                  className={`flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg border transition-all ${
                    record.includeMtcPage 
                      ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold shadow-xs' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    id="checkbox_include_page2_datasheet"
                    type="checkbox"
                    checked={Boolean(record.includeMtcPage)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setRecord(prev => ({ ...prev, includeMtcPage: isChecked }));
                    }}
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer accent-sky-600"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    INCLUDE PAGE 2 DATA SHEET
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">(Chemical & Mechanical Specs)</span>
                </label>
              </div>

              {/* SPREADSHEET SHORTCUT ACTIONS */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <button
                  onClick={() => executeFillDown(activeCell?.table || 'dimensional')}
                  title="Fill Down: Copy top row across selection (Ctrl+D)"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  Fill Down <kbd className="text-[9px] bg-white px-1 rounded border border-sky-300 font-mono">Ctrl+D</kbd>
                </button>

                <button
                  onClick={() => executeCopy(activeCell?.table || 'dimensional')}
                  title="Copy selected cell or range as TSV (Ctrl+C)"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  Copy <kbd className="text-[9px] bg-white px-1 rounded border border-slate-300 font-mono">Ctrl+C</kbd>
                </button>

                {record.templateType !== 'template2' && (
                  <button
                    onClick={handleAddInspectionRow}
                    title="Add Dimensional Inspection Row"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Add Check
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* =============================================================== */}
          {/* THE LIVE HIGH-FIDELITY DOCUMENT CANVAS                           */}
          {/* =============================================================== */}
          <div className="w-full space-y-6">
            
            {/* PAGE 1 CONTAINER */}
            <div className="bg-white border-2 border-slate-900 p-4 sm:p-6 rounded-xl shadow-sm text-black relative w-full">
                
                {/* 1. Header (Logo, ISO Badges, DATA SHEET, Page Indicator) - EDITABLE & UPLOADABLE */}
                <DataSheetHeaderEditor
                  record={record}
                  setRecord={setRecord}
                  pageNum={1}
                  totalPages={record.includeMtcPage ? 2 : 1}
                />

                {/* 2. Meta Bar (Data Sheet No | Date | Customer) */}
                <div className="border border-black grid grid-cols-1 md:grid-cols-3 mb-3 text-xs divide-y md:divide-y-0 md:divide-x divide-black bg-white">
                  
                  {/* Data Sheet No */}
                  <div className="p-2 flex items-center gap-1.5">
                    <span className="font-black text-slate-900 shrink-0">Data Sheet No:</span>
                    <input
                      type="text"
                      value={record.dataSheetNo}
                      onChange={(e) => setRecord(prev => ({ ...prev, dataSheetNo: e.target.value }))}
                      className="w-full font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-sky-500 focus:bg-sky-50 px-1 outline-none text-xs"
                    />
                  </div>

                  {/* Date */}
                  <div className="p-2 flex items-center gap-1.5">
                    <span className="font-black text-slate-900 shrink-0">Date:</span>
                    <input
                      type="text"
                      value={record.date}
                      onChange={(e) => setRecord(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="YYYY-MM-DD or —"
                      className="w-full font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-sky-500 focus:bg-sky-50 px-1 outline-none text-xs"
                    />
                  </div>

                  {/* Customer (with Autocomplete) */}
                  <div className="p-2 relative flex items-center gap-1.5">
                    <span className="font-black text-slate-900 shrink-0">Customer:</span>
                    <input
                      type="text"
                      value={record.customer}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onChange={(e) => {
                        setRecord(prev => ({ ...prev, customer: e.target.value }));
                        setShowCustomerDropdown(true);
                      }}
                      className="w-full font-black text-slate-900 bg-transparent border-b border-transparent focus:border-sky-500 focus:bg-sky-50 px-1 outline-none text-xs"
                    />
                    {showCustomerDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {filteredCustomers.map(c => (
                          <div
                            key={c.id}
                            onMouseDown={() => {
                              setRecord(prev => ({ ...prev, customer: c.companyName }));
                              setShowCustomerDropdown(false);
                            }}
                            className="p-2 hover:bg-sky-50 cursor-pointer font-bold text-slate-800"
                          >
                            {c.companyName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. SUBJECT SECTION (Rendered as clean border box with bold text, matching exact PDF specification) */}
                <div className="border-2 border-black mb-3 p-2 bg-white">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Subject / Scope Title (Product Description)
                    </span>
                    <div className="flex items-center gap-2">
                      {sheetList.length > 1 && (
                        <button
                          type="button"
                          onClick={handleSyncProductToAllSheets}
                          className="text-[9px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200 cursor-pointer flex items-center gap-1 transition-colors"
                          title="Apply this product name / subject to all pages in the document"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Mention on All Pages
                        </button>
                      )}
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Box Included in Print PDF
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={record.subject}
                    onChange={(e) => setRecord(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. DIMENSIONAL INSPECTIONS & TECHNICAL REQUIREMENTS FOR FASTENERS"
                    className="w-full font-black text-xs text-slate-900 bg-slate-50 hover:bg-white border border-slate-300 focus:border-black rounded px-2.5 py-1.5 outline-none uppercase"
                  />
                </div>

                {/* 4. OBJECTIVES SECTION (WITH CHECKBOX CONTROL) */}
                {record.showObjective && (
                  <div className="border border-black mb-3">
                    <div className="bg-slate-100 border-b border-black px-2.5 py-1 flex items-center justify-between">
                      <div className="text-[11px] font-black tracking-wider uppercase">
                        OBJECTIVES
                      </div>
                    </div>
                    <div className="p-2">
                      <textarea
                        rows={2}
                        value={record.objectiveContent}
                        onChange={(e) => setRecord(prev => ({ ...prev, objectiveContent: e.target.value }))}
                        className="w-full text-xs text-slate-800 bg-transparent border border-transparent focus:border-sky-500 focus:bg-sky-50 p-1 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. DRAWINGS SECTION (SHARED ACROSS TEMPLATE 1 & TEMPLATE 2) */}
                {record.showDrawings !== false && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    
                    {/* Left Drawing Box */}
                    <div className="border border-black flex flex-col justify-between h-80 md:h-96 min-h-[320px] bg-white shadow-xs">
                      <div className="border-b border-black px-2.5 py-1 flex items-center justify-between text-xs font-black bg-slate-50">
                        <span>{record.leftDrawingTitle || 'DRAWING'}</span>
                        <input
                          type="text"
                          value={record.leftDrawingRef}
                          onChange={(e) => setRecord(prev => ({ ...prev, leftDrawingRef: e.target.value }))}
                          placeholder="Ref: DWG-MFI-QC-001"
                          className="text-[10px] font-mono text-right bg-transparent outline-none w-32"
                        />
                      </div>

                      <div className="flex-1 flex items-center justify-center p-3 relative group overflow-hidden bg-white">
                        <TechnicalDrawingView 
                          type={record.leftDrawingType} 
                          customImage={record.leftDrawingImage}
                          className="w-full h-full max-h-72 object-contain"
                        />
                        
                        {/* Overlay for quick drawing options */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <select
                            value={record.leftDrawingType}
                            onChange={(e) => setRecord(prev => ({ ...prev, leftDrawingType: e.target.value, leftDrawingImage: '' }))}
                            className="px-2.5 py-1.5 bg-white text-slate-800 text-xs font-bold rounded shadow-sm"
                          >
                            <option value="preset_hex_nut">Hex Nut Drawing (DIN 934)</option>
                            <option value="preset_bolt">Hex Bolt Drawing (DIN 933)</option>
                            <option value="preset_stud">Stud Bolt Drawing (ASTM A193)</option>
                            <option value="preset_washer">Flat Washer (DIN 125A)</option>
                            <option value="preset_socket">Socket Screw (DIN 912)</option>
                          </select>
                          <label className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded cursor-pointer shadow-sm">
                            Upload Custom
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressDataSheetImage(file, 1200, 0.9);
                                    setRecord(prev => ({ ...prev, leftDrawingImage: compressed }));
                                  } catch (err) {
                                    console.warn('Failed to compress left drawing:', err);
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="border-t border-black px-2 py-1.5 bg-slate-50 text-center">
                        <input
                          type="text"
                          value={record.leftDrawingCaption}
                          onChange={(e) => setRecord(prev => ({ ...prev, leftDrawingCaption: e.target.value }))}
                          placeholder="DRAWING CAPTION (OPTIONAL)"
                          className="w-full text-center text-[10px] font-black text-slate-800 bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Right Drawing Box */}
                    <div className="border border-black flex flex-col justify-between h-80 md:h-96 min-h-[320px] bg-white shadow-xs">
                      <div className="border-b border-black px-2.5 py-1 flex items-center justify-between text-xs font-black bg-slate-50">
                        <span>{record.rightDrawingTitle || 'DRAWING'}</span>
                        <input
                          type="text"
                          value={record.rightDrawingRef}
                          onChange={(e) => setRecord(prev => ({ ...prev, rightDrawingRef: e.target.value }))}
                          placeholder=""
                          className="text-[10px] font-mono text-right bg-transparent outline-none w-32"
                        />
                      </div>

                      <div className="flex-1 flex items-center justify-center p-3 relative group overflow-hidden bg-white">
                        <HeadStampDrawingView 
                          type={record.rightDrawingType} 
                          customImage={record.rightDrawingImage}
                          className="w-full h-full max-h-72 object-contain"
                        />

                        {/* Overlay for stamp options */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <select
                            value={record.rightDrawingType}
                            onChange={(e) => setRecord(prev => ({ ...prev, rightDrawingType: e.target.value, rightDrawingImage: '' }))}
                            className="px-2.5 py-1.5 bg-white text-slate-800 text-xs font-bold rounded shadow-sm"
                          >
                            <option value="stamp_mfi_8">MFI 8 / DIN 934</option>
                            <option value="stamp_mfi_8_8">MFI 8.8 / ISO 4017</option>
                            <option value="stamp_mfi_10_9">MFI 10.9 / DIN 912</option>
                            <option value="stamp_mfi_2h">MFI 2H / ASTM A194</option>
                            <option value="stamp_mfi_b7">MFI B7 / ASTM A193</option>
                            <option value="stamp_mfi_a4_80">MFI A4-80 / Stainless</option>
                          </select>
                          <label className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded cursor-pointer shadow-sm">
                            Upload Custom
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressDataSheetImage(file, 1200, 0.9);
                                    setRecord(prev => ({ ...prev, rightDrawingImage: compressed }));
                                  } catch (err) {
                                    console.warn('Failed to compress right drawing:', err);
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="border-t border-black px-2 py-1.5 bg-slate-50 text-center">
                        <input
                          type="text"
                          value={record.rightDrawingCaption}
                          onChange={(e) => setRecord(prev => ({ ...prev, rightDrawingCaption: e.target.value }))}
                          placeholder="HEAD STAMP CAPTION (OPTIONAL)"
                          className="w-full text-center text-[10px] font-black text-slate-800 bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 1: SINGLE SPECIFICATION (DIMENSIONAL INSPECTION TABLE) */}
                {record.templateType !== 'template2' ? (
                  <>
                    {/* 6. DIMENSIONAL INSPECTIONS SPREADSHEET TABLE */}
                    {record.showDimensionalInspection && (
                      <div className="border-2 border-black mb-4">
                        <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-xs font-black uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>DIMENSIONAL INSPECTIONS</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-sky-300 font-mono">
                              Single Product Inspection Table
                            </span>
                          </div>
                          <button
                            onClick={handleAddInspectionRow}
                            className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Check
                          </button>
                        </div>

                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-black text-slate-900 font-black">
                              <th className="w-8 p-1.5 text-center border-r border-black">
                                <CheckSquare className="w-3.5 h-3.5 mx-auto text-slate-700" />
                              </th>
                              <th className="w-1/2 p-2 text-left border-r border-black">
                                Characteristic
                              </th>
                              <th className="w-1/2 p-2 text-left">
                                Requirements
                              </th>
                              <th className="w-8 p-1.5 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {record.dimensionalInspections.map((row, rIdx) => {
                              const isCharSelected = isCellSelected('dimensional', rIdx, 0);
                              const isReqSelected = isCellSelected('dimensional', rIdx, 1);

                              return (
                                <tr 
                                  key={row.id} 
                                  className={`transition-colors ${row.selected ? '' : 'bg-slate-50 opacity-40'}`}
                                >
                                  {/* Row selection checkbox */}
                                  <td className="p-1.5 text-center border-r border-black bg-white">
                                    <input
                                      type="checkbox"
                                      checked={row.selected}
                                      onChange={(e) => {
                                        const updated = [...record.dimensionalInspections];
                                        updated[rIdx].selected = e.target.checked;
                                        setRecord(prev => ({ ...prev, dimensionalInspections: updated }));
                                      }}
                                      className="w-3.5 h-3.5 text-sky-600 rounded cursor-pointer"
                                    />
                                  </td>

                                  {/* Characteristic Cell */}
                                  <td className={`p-0 border-r border-black transition-all ${
                                    isCharSelected ? 'bg-sky-100 ring-2 ring-sky-600 z-10' : 'bg-white'
                                  }`}>
                                    <input
                                      type="text"
                                      data-cell={`dimensional_${rIdx}_0`}
                                      value={row.characteristic}
                                      onFocus={() => selectCell('dimensional', rIdx, 0)}
                                      onClick={(e) => selectCell('dimensional', rIdx, 0, e.shiftKey)}
                                      onChange={(e) => {
                                        const updated = [...record.dimensionalInspections];
                                        updated[rIdx].characteristic = e.target.value;
                                        setRecord(prev => ({ ...prev, dimensionalInspections: updated }));
                                      }}
                                      onKeyDown={(e) => handleCellKeyDown(e, 'dimensional', rIdx, 0, record.dimensionalInspections.length, 2)}
                                      onPaste={(e) => handleCellPaste(e, 'dimensional', rIdx, 0)}
                                      className="w-full px-2.5 py-1.5 font-bold text-xs text-slate-900 bg-transparent outline-none"
                                    />
                                  </td>

                                  {/* Requirements Cell */}
                                  <td className={`p-0 transition-all ${
                                    isReqSelected ? 'bg-sky-100 ring-2 ring-sky-600 z-10' : 'bg-white'
                                  }`}>
                                    <input
                                      type="text"
                                      data-cell={`dimensional_${rIdx}_1`}
                                      value={row.requirements}
                                      onFocus={() => selectCell('dimensional', rIdx, 1)}
                                      onClick={(e) => selectCell('dimensional', rIdx, 1, e.shiftKey)}
                                      onChange={(e) => {
                                        const updated = [...record.dimensionalInspections];
                                        updated[rIdx].requirements = e.target.value;
                                        setRecord(prev => ({ ...prev, dimensionalInspections: updated }));
                                      }}
                                      onKeyDown={(e) => handleCellKeyDown(e, 'dimensional', rIdx, 1, record.dimensionalInspections.length, 2)}
                                      onPaste={(e) => handleCellPaste(e, 'dimensional', rIdx, 1)}
                                      className="w-full px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-800 bg-transparent outline-none"
                                    />
                                  </td>

                                  {/* Delete row button */}
                                  <td className="p-1 text-center bg-white">
                                    <button
                                      onClick={() => handleDeleteInspectionRow(row.id)}
                                      title="Delete check"
                                      className="text-slate-300 hover:text-red-600 p-0.5"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  /* TEMPLATE 2: MULTIPLEX MULTI-SIZE DIMENSIONAL INSPECTION MATRIX */
                  <Template2MultiSizeView
                    record={record}
                    setRecord={setRecord}
                    showToast={showToast}
                  />
                )}

                {/* 7. Footer Signatures & Official Stamp (Clean, Uploadable Signature & Seal) */}
                <DataSheetFooterSignatures
                  record={record}
                  setRecord={setRecord}
                />

            </div>

            {/* ============================================================= */}
            {/* PAGE 2: DATA SHEET (CHEMICAL & MECHANICAL PROPERTIES)         */}
            {/* ============================================================= */}
            {record.includeMtcPage && (
              <div className="bg-white border-2 border-slate-900 p-4 sm:p-6 rounded-xl shadow-sm text-black relative w-full">
                
                {/* Page 2 Header (DATA SHEET, PAGE NO: 2 OF 2) */}
                <DataSheetHeaderEditor
                  record={record}
                  setRecord={setRecord}
                  pageNum={2}
                  totalPages={2}
                />

                {/* Page 2 Meta Bar */}
                <div className="border border-black grid grid-cols-1 md:grid-cols-3 mb-4 text-xs divide-y md:divide-y-0 md:divide-x divide-black bg-white">
                  <div className="p-2"><strong>Data Sheet No:</strong> {record.dataSheetNo}</div>
                  <div className="p-2"><strong>Date:</strong> {record.date || '—'}</div>
                  <div className="p-2"><strong>Customer:</strong> {record.customer}</div>
                </div>

                {/* Chemical & Mechanical Properties Section with editable column headers & values */}
                <ChemicalMechanicalSection
                  record={record}
                  setRecord={setRecord}
                  isCellSelected={isCellSelected}
                  selectCell={selectCell}
                  handleCellKeyDown={handleCellKeyDown}
                />

                {/* Page 2 Footer Signatures & Official Stamp */}
                <div className="mt-8">
                  <DataSheetFooterSignatures
                    record={record}
                    setRecord={setRecord}
                  />
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
