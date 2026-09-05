import React, { useState, useEffect, useMemo, useRef } from 'react';
import { printHtml } from './PrintHelper';
import { 
  FileCheck, Database, Plus, Check, Printer, Trash2, ArrowUp, ArrowDown, Copy, ClipboardPaste, Layers, Building2,
  Undo, Redo, FileSpreadsheet, Type, ChevronDown, Eye, HelpCircle, Save, RotateCcw, FilePlus, XCircle, Palette
} from 'lucide-react';
import { EditCompanyModal } from './EditCompanyModal';
import { getCompanyProfile } from '../utils/companyProfile';

export interface CreditNoteItem {
  sn: number;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  per: string;
  amount: number;
  vatRate?: number | string;
  taxableValue: number;
  taxAmount: number;
  textColor?: string;
}

export interface CreditNote {
  id: string;
  creditNoteNo: string;
  dated: string;
  reasonForIssue: string;
  buyersRef: string;
  otherRef: string;
  expectedDeliveryTime?: string;
  
  issuerName: string;
  issuerAddress: string;
  issuerTRN: string;
  issuerEmirate: string;

  partyName: string;
  partyAddress: string;
  partyEmirate: string;
  partyCountry: string;
  partyTRN: string;
  placeOfSupply: string;

  items: CreditNoteItem[];
  noteType?: 'CREDIT' | 'DEBIT';
}

export interface CreditNoteComponentProps {
  creditNotes: CreditNote[];
  setCreditNotes: React.Dispatch<React.SetStateAction<CreditNote[]>>;
  activeCnId: string;
  setActiveCnId: (id: string) => void;
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
  clientDatabase: string[];
  initialNoteType?: 'CREDIT' | 'DEBIT';
}

export const CreditNoteComponent: React.FC<CreditNoteComponentProps> = ({
  creditNotes,
  setCreditNotes,
  activeCnId,
  setActiveCnId,
  triggerToast,
  setActiveTab,
  clientDatabase,
  initialNoteType,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCellRange, setSelectedCellRange] = useState<{
    anchorRow: number;
    anchorCol: string;
    focusRow: number;
    focusCol: string;
  } | null>(null);

  const skipFocusResetRef = useRef(false);

  // Sheet Fonts Controller State
  const [isMasterFontPickerOpen, setIsMasterFontPickerOpen] = useState(false);
  const [supplierFontSize, setSupplierFontSize] = useState('9.5px');
  const [customerFontSize, setCustomerFontSize] = useState('9.5px');
  const [docRefFontSize, setDocRefFontSize] = useState('9px');
  const [tableFontSize, setTableFontSize] = useState('8.5px');
  const [totalsFontSize, setTotalsFontSize] = useState('10px');
  const [printFontScale, setPrintFontScale] = useState('100%');

  // Excel Text Color State (A - ⌄)
  const [selectedTextColor, setSelectedTextColor] = useState<string>('#000000');
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState<boolean>(false);
  const savedTextSelectionRef = useRef<{
    rowIdx: number;
    start: number;
    end: number;
    selectedText: string;
  } | null>(null);

  const EXCEL_TEXT_COLORS = useMemo(() => [
    '#000000', // Black
    '#0f172a', // Navy / Dark Slate
    '#2563eb', // Royal Blue
    '#dc2626', // Red
    '#16a34a', // Emerald Green
    '#ea580c', // Orange
    '#9333ea', // Purple
    '#475569', // Gray Slate
    '#9f1239', // Crimson
    '#0d9488', // Teal
  ], []);

  // Excel Color Controller State
  const [excelColorKey, setExcelColorKey] = useState<'green' | 'blue' | 'slate' | 'rose' | 'teal'>('green');
  const [isExcelColorPickerOpen, setIsExcelColorPickerOpen] = useState(false);

  const EXCEL_THEMES = useMemo(() => ({
    green: {
      name: 'Excel Green',
      headerBg: 'bg-[#107c41]',
      headerBorder: 'border-[#0e6b37]',
      border: 'border-[#107c41]',
      text: 'text-[#107c41]',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-300',
      btnBg: 'bg-[#107c41] hover:bg-[#0e6b37]',
      hex: '#107c41'
    },
    blue: {
      name: 'Sales Navy',
      headerBg: 'bg-[#1e3a8a]',
      headerBorder: 'border-[#172554]',
      border: 'border-[#1e3a8a]',
      text: 'text-[#1e3a8a]',
      bgLight: 'bg-blue-50',
      borderLight: 'border-blue-300',
      btnBg: 'bg-[#1e3a8a] hover:bg-[#172554]',
      hex: '#1e3a8a'
    },
    slate: {
      name: 'Slate Dark',
      headerBg: 'bg-[#334155]',
      headerBorder: 'border-[#1e293b]',
      border: 'border-[#334155]',
      text: 'text-[#334155]',
      bgLight: 'bg-slate-100',
      borderLight: 'border-slate-300',
      btnBg: 'bg-[#334155] hover:bg-[#1e293b]',
      hex: '#334155'
    },
    rose: {
      name: 'Credit Crimson',
      headerBg: 'bg-[#be123c]',
      headerBorder: 'border-[#9f1239]',
      border: 'border-[#be123c]',
      text: 'text-[#be123c]',
      bgLight: 'bg-rose-50',
      borderLight: 'border-rose-300',
      btnBg: 'bg-[#be123c] hover:bg-[#9f1239]',
      hex: '#be123c'
    },
    teal: {
      name: 'Teal Green',
      headerBg: 'bg-[#0f766e]',
      headerBorder: 'border-[#115e59]',
      border: 'border-[#0f766e]',
      text: 'text-[#0f766e]',
      bgLight: 'bg-teal-50',
      borderLight: 'border-teal-300',
      btnBg: 'bg-[#0f766e] hover:bg-[#115e59]',
      hex: '#0f766e'
    }
  }), []);

  const activeTheme = EXCEL_THEMES[excelColorKey] || EXCEL_THEMES.green;

  // History state for Undo & Redo
  const [historyStack, setHistoryStack] = useState<CreditNote[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const pushStateToHistory = (newState: CreditNote) => {
    setHistoryStack(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newState];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const applyTextColorToSelection = (color: string) => {
    setSelectedTextColor(color);
    setIsTextColorPickerOpen(false);

    // 1. Try DOM Selection first (for contentEditable description cells)
    const domSel = window.getSelection();
    if (domSel && domSel.rangeCount > 0 && !domSel.isCollapsed) {
      const range = domSel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const elem = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement;
      const descCell = elem?.closest('[data-cn-col="description"]') as HTMLElement;
      
      if (descCell) {
        const rowAttr = descCell.getAttribute('data-cn-row');
        if (rowAttr !== null) {
          const rowIdx = parseInt(rowAttr, 10);
          try {
            document.execCommand('styleWithCSS', false, 'true');
            document.execCommand('foreColor', false, color);
            const updatedHtml = descCell.innerHTML;
            
            setCnState(prev => {
              const updatedItems = prev.items.map((item, idx) => {
                if (idx === rowIdx) {
                  return { ...item, description: updatedHtml };
                }
                return item;
              });
              const newCn = { ...prev, items: updatedItems };
              pushStateToHistory(newCn);
              return newCn;
            });
            return;
          } catch (e) {
            console.error('execCommand foreColor error:', e);
          }
        }
      }
    }

    // 2. Try savedTextSelectionRef if text was highlighted in an input field
    const sel = savedTextSelectionRef.current;
    if (sel && sel.selectedText && sel.selectedText.trim() !== '') {
      setCnState(prev => {
        const updatedItems = prev.items.map((item, idx) => {
          if (idx === sel.rowIdx) {
            const val = item.description || '';
            let coloredHtml = '';
            if (val.includes(sel.selectedText)) {
              coloredHtml = val.replace(
                sel.selectedText,
                `<span style="color: ${color}; font-weight: bold;">${sel.selectedText}</span>`
              );
            } else {
              coloredHtml = `<span style="color: ${color}; font-weight: bold;">${val}</span>`;
            }
            return { ...item, description: coloredHtml };
          }
          return item;
        });
        const newCn = { ...prev, items: updatedItems };
        pushStateToHistory(newCn);
        return newCn;
      });
      savedTextSelectionRef.current = null;
      return;
    }

    // 3. If no specific text selection, color the whole cell or row selection
    setCnState(prev => {
      let hasTargeted = false;
      let updatedItems = prev.items.map((item, idx) => {
        let isTargeted = false;
        if (selectedCellRange) {
          const minRow = Math.min(selectedCellRange.anchorRow, selectedCellRange.focusRow);
          const maxRow = Math.max(selectedCellRange.anchorRow, selectedCellRange.focusRow);
          if (idx >= minRow && idx <= maxRow) {
            isTargeted = true;
          }
        } else {
          isTargeted = true;
        }
        if (isTargeted) {
          hasTargeted = true;
          return { ...item, textColor: color };
        }
        return item;
      });

      if (!hasTargeted) {
        updatedItems = prev.items.map(item => ({ ...item, textColor: color }));
      }

      const newCn = { ...prev, items: updatedItems };
      pushStateToHistory(newCn);
      return newCn;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCnState(historyStack[prevIdx]);
      setIsEditing(true);
      if (triggerToast) triggerToast("Undo action applied");
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCnState(historyStack[nextIdx]);
      setIsEditing(true);
      if (triggerToast) triggerToast("Redo action applied");
    }
  };

  const stepFontSize = (current: string, delta: number, min: number = 7, max: number = 20) => {
    const numeric = parseFloat(current);
    if (isNaN(numeric)) return current;
    const newSize = Math.max(min, Math.min(max, numeric + delta));
    return `${newSize}px`;
  };

  // Dynamic find active note
  const activeCreditNote = useMemo(() => {
    const found = creditNotes.find(item => item.id === activeCnId);
    return found || null;
  }, [creditNotes, activeCnId]);

  // Helper to get the next non-colliding sequential Credit Note No
  const getNextCreditNoteNo = (list: CreditNote[]) => {
    let maxNum = 100;
    list.forEach(n => {
      if (!n.noteType || n.noteType === 'CREDIT') {
        const match = n.creditNoteNo.match(/CN-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    return `CN-${maxNum + 1}`;
  };

  // Helper to get the next non-colliding sequential Debit Note No
  const getNextDebitNoteNo = (list: CreditNote[]) => {
    let maxNum = 100;
    list.forEach(n => {
      if (n.noteType === 'DEBIT') {
        const match = n.creditNoteNo.match(/DN-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    return `DN-${maxNum + 1}`;
  };

  // Active working state
  const [cnState, setCnState] = useState<CreditNote>(() => {
    if (activeCreditNote) return { ...activeCreditNote };
    const nextNo = initialNoteType === 'DEBIT' ? getNextDebitNoteNo(creditNotes) : getNextCreditNoteNo(creditNotes);
    const profile = getCompanyProfile();
    return {
      id: 'cn-' + Date.now(),
      creditNoteNo: nextNo,
      noteType: initialNoteType || 'CREDIT',
      dated: new Date().toISOString().substring(0, 10),
      reasonForIssue: '',
      buyersRef: '',
      otherRef: '',
      issuerName: profile.name,
      issuerAddress: profile.address,
      issuerTRN: profile.trn,
      issuerEmirate: 'Ajman',
      partyName: '',
      partyAddress: '',
      partyEmirate: '',
      partyCountry: '',
      partyTRN: '',
      placeOfSupply: '',
      items: [
        {
          sn: 1,
          description: '',
          qty: 0,
          unit: 'PCS.',
          rate: 0,
          per: 'PCS.',
          amount: 0,
          vatRate: undefined,
          taxableValue: 0,
          taxAmount: 0
        }
      ]
    };
  });

  // Listen for company profile updates from header editor
  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      const updated = e.detail;
      if (updated) {
        setCnState(prev => ({
          ...prev,
          issuerName: updated.name || prev.issuerName,
          issuerAddress: updated.address || prev.issuerAddress,
          issuerTRN: updated.trn || prev.issuerTRN,
        }));
      }
    };
    window.addEventListener('company_profile_updated', handleProfileUpdated);
    return () => window.removeEventListener('company_profile_updated', handleProfileUpdated);
  }, []);

  // Sync profile values if current note has old fallback address or TRN
  useEffect(() => {
    const profile = getCompanyProfile();
    if (
      !cnState.issuerAddress ||
      cnState.issuerAddress === 'AL BATEEN STREET, ABU DHABI - U.A.E.' ||
      !cnState.issuerTRN ||
      cnState.issuerTRN === '100334455600003'
    ) {
      setCnState(prev => ({
        ...prev,
        issuerName: profile.name || prev.issuerName,
        issuerAddress: profile.address || prev.issuerAddress,
        issuerTRN: profile.trn || prev.issuerTRN,
      }));
    }
  }, []);

  // Effect to handle switching tabs when initialNoteType changes
  useEffect(() => {
    if (initialNoteType && (!activeCreditNote || activeCreditNote.noteType !== initialNoteType)) {
      const nextNo = initialNoteType === 'DEBIT' ? getNextDebitNoteNo(creditNotes) : getNextCreditNoteNo(creditNotes);
      const profile = getCompanyProfile();
      setCnState({
        id: 'cn-' + Date.now(),
        creditNoteNo: nextNo,
        noteType: initialNoteType,
        dated: new Date().toISOString().substring(0, 10),
        reasonForIssue: '',
        buyersRef: '',
        otherRef: '',
        issuerName: profile.name,
        issuerAddress: profile.address,
        issuerTRN: profile.trn,
        issuerEmirate: 'Ajman',
        partyName: '',
        partyAddress: '',
        partyEmirate: '',
        partyCountry: '',
        partyTRN: '',
        placeOfSupply: '',
        items: [
          {
            sn: 1,
            description: '',
            qty: 0,
            unit: 'PCS.',
            rate: 0,
            per: 'PCS.',
            amount: 0,
            vatRate: undefined,
            taxableValue: 0,
            taxAmount: 0
          }
        ]
      });
      setIsEditing(true);
    }
  }, [initialNoteType]);

  // Mirror on change of selected record
  useEffect(() => {
    if (activeCreditNote) {
      setCnState({ ...activeCreditNote });
      setIsEditing(false);
    }
  }, [activeCreditNote]);

  const handleInitNewCn = (type: 'CREDIT' | 'DEBIT' = 'CREDIT') => {
    const nextNo = type === 'DEBIT' ? getNextDebitNoteNo(creditNotes) : getNextCreditNoteNo(creditNotes);
    const profile = getCompanyProfile();
    const newCn: CreditNote = {
      id: 'cn-' + Date.now(),
      creditNoteNo: nextNo,
      noteType: type,
      dated: new Date().toISOString().substring(0, 10),
      reasonForIssue: '',
      buyersRef: '',
      otherRef: '',
      issuerName: profile.name,
      issuerAddress: profile.address,
      issuerTRN: profile.trn,
      issuerEmirate: 'Ajman',
      partyName: '',
      partyAddress: '',
      partyEmirate: '',
      partyCountry: '',
      partyTRN: '',
      placeOfSupply: '',
      items: [
        {
          sn: 1,
          description: '',
          qty: 0,
          unit: 'PCS.',
          rate: 0,
          per: 'PCS.',
          amount: 0,
          vatRate: undefined,
          taxableValue: 0,
          taxAmount: 0
        }
      ]
    };
    setCnState(newCn);
    setActiveCnId(newCn.id);
    setIsEditing(true);
    triggerToast(`Initialized empty ${type === 'DEBIT' ? 'Debit' : 'Credit'} Note. Use Editor to finalize.`);
  };

  const handleSaveCn = () => {
    if (!cnState.creditNoteNo.trim()) {
      triggerToast('Error: Note No. is required.');
      return;
    }

    const nextState = { ...cnState };
    if (nextState.items.length === 0) {
      const defaultItem: CreditNoteItem = {
        sn: 1,
        description: '',
        qty: 0,
        unit: 'PCS.',
        rate: 0,
        per: 'PCS.',
        amount: 0,
        vatRate: undefined,
        taxableValue: 0,
        taxAmount: 0
      };
      nextState.items = [defaultItem];
      setCnState(nextState);
      triggerToast('Enforced compulsory item row for tax compliance.');
    }

    const existingIdx = creditNotes.findIndex(c => c.id === nextState.id);
    let updated: CreditNote[];
    if (existingIdx > -1) {
      updated = [...creditNotes];
      updated[existingIdx] = { ...nextState };
    } else {
      updated = [...creditNotes, { ...nextState }];
    }
    setCreditNotes(updated);
    setIsEditing(false);
    triggerToast(`Saved Tax ${nextState.noteType === 'DEBIT' ? 'Debit' : 'Credit'} Note ${nextState.creditNoteNo} to system database!`);
  };

  // Range bounds calculation helper
  const activeCols = ['description', 'qty', 'unit', 'rate', 'per', 'amount', 'vatRate', 'taxableValue', 'taxAmount'];
  const editableCols = ['description', 'qty', 'unit', 'rate', 'per', 'vatRate'];

  const getSelectedRangeBounds = () => {
    if (!selectedCellRange) return null;
    const { anchorRow, anchorCol, focusRow, focusCol } = selectedCellRange;
    const minRow = Math.min(anchorRow, focusRow);
    const maxRow = Math.max(anchorRow, focusRow);

    const idx1 = activeCols.indexOf(anchorCol);
    const idx2 = activeCols.indexOf(focusCol);

    if (idx1 === -1 || idx2 === -1) {
      return { minRow, maxRow, minColIdx: 0, maxColIdx: activeCols.length - 1, activeCols };
    }

    const minColIdx = Math.min(idx1, idx2);
    const maxColIdx = Math.max(idx1, idx2);
    return { minRow, maxRow, minColIdx, maxColIdx, activeCols };
  };

  const isCellSelected = (rIdx: number, colId: string) => {
    if (!selectedCellRange) return false;
    const bounds = getSelectedRangeBounds();
    if (!bounds) return false;
    const { minRow, maxRow, minColIdx, maxColIdx } = bounds;
    const cIdx = activeCols.indexOf(colId);
    if (cIdx === -1) return false;
    return rIdx >= minRow && rIdx <= maxRow && cIdx >= minColIdx && cIdx <= maxColIdx;
  };

  const handleCellFocus = (rIdx: number, colId: string, isShift: boolean = false) => {
    if (skipFocusResetRef.current) {
      skipFocusResetRef.current = false;
      return;
    }
    if (isShift && selectedCellRange) {
      setSelectedCellRange({
        anchorRow: selectedCellRange.anchorRow,
        anchorCol: selectedCellRange.anchorCol,
        focusRow: rIdx,
        focusCol: colId,
      });
    } else {
      setSelectedCellRange({
        anchorRow: rIdx,
        anchorCol: colId,
        focusRow: rIdx,
        focusCol: colId,
      });
    }
  };

  const handleSnClick = (rIdx: number, isShift: boolean = false) => {
    if (isShift && selectedCellRange) {
      setSelectedCellRange({
        anchorRow: selectedCellRange.anchorRow,
        anchorCol: activeCols[0],
        focusRow: rIdx,
        focusCol: activeCols[activeCols.length - 1],
      });
    } else {
      setSelectedCellRange({
        anchorRow: rIdx,
        anchorCol: activeCols[0],
        focusRow: rIdx,
        focusCol: activeCols[activeCols.length - 1],
      });
    }
  };

  // Ctrl + D Fill Down helper
  const handleFillDown = () => {
    const bounds = getSelectedRangeBounds();
    let minR = 0;
    let maxR = 0;
    let targetCols = editableCols;

    if (bounds) {
      minR = bounds.minRow;
      maxR = bounds.maxRow;
      const filteredCols = activeCols.slice(bounds.minColIdx, bounds.maxColIdx + 1).filter(c => editableCols.includes(c));
      if (filteredCols.length > 0) {
        targetCols = filteredCols;
      }
    } else if (selectedCellRange) {
      minR = selectedCellRange.focusRow;
      maxR = selectedCellRange.focusRow;
      if (editableCols.includes(selectedCellRange.focusCol)) {
        targetCols = [selectedCellRange.focusCol];
      }
    } else {
      triggerToast('Select cell(s) below row 1 to fill down (Ctrl+D).');
      return;
    }

    if (minR === 0 && maxR === 0) {
      triggerToast('Cannot fill down on row 1 (no row above).');
      return;
    }

    const newItems = [...cnState.items];
    const startRow = minR === 0 ? 1 : minR;

    for (let r = startRow; r <= maxR; r++) {
      const sourceRow = newItems[r - 1];
      if (!sourceRow) continue;
      const targetRow = { ...newItems[r] };

      targetCols.forEach(colKey => {
        (targetRow as any)[colKey] = (sourceRow as any)[colKey];
      });

      // Do not default VAT to 5% if description present
      const qty = parseFloat(targetRow.qty as any) || 0;
      const rate = parseFloat(targetRow.rate as any) || 0;
      const vatRateNum = (targetRow.vatRate !== undefined && targetRow.vatRate !== null && targetRow.vatRate !== '') ? (parseFloat(targetRow.vatRate as any) || 0) : 0;

      targetRow.amount = qty * rate;
      targetRow.taxableValue = targetRow.amount;
      targetRow.taxAmount = vatRateNum > 0 ? targetRow.taxableValue * (vatRateNum / 100) : 0;

      newItems[r] = targetRow;
    }

    setCnState(prev => ({ ...prev, items: newItems }));
    setIsEditing(true);
    triggerToast(`Filled down ${maxR - startRow + 1} row(s) (Ctrl+D)`);
  };

  // Paste from Excel handler (TSV and multi-line)
  const handlePasteExcel = (e: React.ClipboardEvent<HTMLInputElement>, startRowIdx: number, startColId: string) => {
    const pastedText = e.clipboardData.getData('text/plain');
    if (!pastedText) return;

    const lines = pastedText.split(/\r?\n/).filter(line => line.length > 0);
    if (lines.length === 0) return;

    e.preventDefault();

    const startColIdx = Math.max(0, editableCols.indexOf(startColId));
    const newItems = [...cnState.items];

    lines.forEach((line, lineOffset) => {
      const rowIdx = startRowIdx + lineOffset;
      const rawCols = line.split('\t');

      let itemToUpdate: CreditNoteItem;
      if (rowIdx < newItems.length) {
        itemToUpdate = { ...newItems[rowIdx] };
      } else {
        itemToUpdate = {
          sn: rowIdx + 1,
          description: '',
          qty: 0,
          unit: '',
          rate: 0,
          per: '',
          amount: 0,
          vatRate: undefined,
          taxableValue: 0,
          taxAmount: 0
        };
      }

      rawCols.forEach((cellVal, colOffset) => {
        const targetColIdx = startColIdx + colOffset;
        if (targetColIdx < editableCols.length) {
          const colKey = editableCols[targetColIdx];
          const val = cellVal.trim();
          if (colKey === 'qty' || colKey === 'rate' || colKey === 'vatRate') {
            const num = parseFloat(val.replace(/,/g, ''));
            (itemToUpdate as any)[colKey] = isNaN(num) ? 0 : num;
          } else {
            (itemToUpdate as any)[colKey] = val.toUpperCase();
          }
        }
      });

      const qty = itemToUpdate.qty || 0;
      const rate = itemToUpdate.rate || 0;
      const vatRateNum = (itemToUpdate.vatRate !== undefined && itemToUpdate.vatRate !== null && itemToUpdate.vatRate !== '') ? (parseFloat(itemToUpdate.vatRate as any) || 0) : 0;

      itemToUpdate.amount = qty * rate;
      itemToUpdate.taxableValue = itemToUpdate.amount;
      itemToUpdate.taxAmount = vatRateNum > 0 ? itemToUpdate.taxableValue * (vatRateNum / 100) : 0;

      newItems[rowIdx] = itemToUpdate;
    });

    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState(prev => ({ ...prev, items: reindexed }));
    setIsEditing(true);
    triggerToast(`Pasted ${lines.length} line(s) into sheet!`);
  };

  // Row operations
  const handleAddRow = () => {
    const nextSn = cnState.items.length + 1;
    const newItem: CreditNoteItem = {
      sn: nextSn,
      description: '',
      qty: 0,
      unit: '',
      rate: 0,
      per: '',
      amount: 0,
      vatRate: undefined,
      taxableValue: 0,
      taxAmount: 0
    };
    setCnState({
      ...cnState,
      items: [...cnState.items, newItem]
    });
    setIsEditing(true);
    triggerToast('Added new line item.');
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextFieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldId === 'row0_description') {
        focusCell(0, 'description');
        handleCellFocus(0, 'description');
      } else if (nextFieldId) {
        const target = document.querySelector(`[data-header-id="${nextFieldId}"]`) as HTMLElement | null;
        if (target) {
          target.focus();
          if ('select' in target && typeof (target as any).select === 'function') {
            (target as any).select();
          }
        }
      } else {
        focusCell(0, 'description');
        handleCellFocus(0, 'description');
      }
    }
  };

  const handleInsertRowAbove = () => {
    const bounds = getSelectedRangeBounds();
    const insertIdx = bounds ? bounds.minRow : cnState.items.length;
    handleInsertRowAboveIndex(insertIdx);
  };

  const handleInsertRowBelow = () => {
    const bounds = getSelectedRangeBounds();
    const insertIdx = bounds ? bounds.maxRow : (cnState.items.length > 0 ? cnState.items.length - 1 : 0);
    handleInsertRowBelowIndex(insertIdx);
  };

  const handleDuplicateSelectedRows = () => {
    const bounds = getSelectedRangeBounds();
    if (!bounds) {
      triggerToast('Select row(s) to duplicate.');
      return;
    }
    const { minRow, maxRow } = bounds;
    const rowsToDup = cnState.items.slice(minRow, maxRow + 1);
    const newItems = [...cnState.items];
    const duplicated = rowsToDup.map(item => ({ ...item }));
    newItems.splice(maxRow + 1, 0, ...duplicated);
    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState({ ...cnState, items: reindexed });
    setIsEditing(true);
    triggerToast(`Duplicated ${rowsToDup.length} row(s).`);
  };

  const handleDeleteSelectedRows = () => {
    const bounds = getSelectedRangeBounds();
    if (!bounds) return;
    const { minRow, maxRow } = bounds;
    const newItems = cnState.items.filter((_, idx) => idx < minRow || idx > maxRow);
    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState({ ...cnState, items: reindexed });
    setSelectedCellRange(null);
    setIsEditing(true);
    triggerToast(`Deleted ${maxRow - minRow + 1} row(s).`);
  };

  const handleInsertRowAboveIndex = (insertIdx: number) => {
    const newItems = [...cnState.items];
    const newItem: CreditNoteItem = {
      sn: insertIdx + 1,
      description: '',
      qty: 0,
      unit: '',
      rate: 0,
      per: '',
      amount: 0,
      vatRate: undefined,
      taxableValue: 0,
      taxAmount: 0
    };
    newItems.splice(insertIdx, 0, newItem);
    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState({ ...cnState, items: reindexed });
    setIsEditing(true);
    triggerToast(`Inserted row above position ${insertIdx + 1}`);
    focusCell(insertIdx, 'description');
  };

  const handleInsertRowBelowIndex = (insertIdx: number) => {
    const targetIdx = insertIdx + 1;
    const newItems = [...cnState.items];
    const newItem: CreditNoteItem = {
      sn: targetIdx + 1,
      description: '',
      qty: 0,
      unit: '',
      rate: 0,
      per: '',
      amount: 0,
      vatRate: undefined,
      taxableValue: 0,
      taxAmount: 0
    };
    newItems.splice(targetIdx, 0, newItem);
    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState({ ...cnState, items: reindexed });
    setIsEditing(true);
    triggerToast(`Inserted row below position ${insertIdx + 1}`);
    focusCell(targetIdx, 'description');
  };

  const handleDuplicateRowIndex = (rowIdx: number) => {
    const rowToDup = cnState.items[rowIdx];
    if (!rowToDup) return;
    const newItems = [...cnState.items];
    const duplicated = { ...rowToDup };
    newItems.splice(rowIdx + 1, 0, duplicated);
    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState({ ...cnState, items: reindexed });
    setIsEditing(true);
    triggerToast(`Duplicated Row ${rowIdx + 1}`);
    focusCell(rowIdx + 1, 'description');
  };

  const handleRemoveRowIndex = (rowIdx: number) => {
    const newItems = cnState.items.filter((_, idx) => idx !== rowIdx);
    const reindexed = newItems.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setCnState({ ...cnState, items: reindexed });
    setSelectedCellRange(null);
    setIsEditing(true);
    triggerToast(`Removed Row ${rowIdx + 1}`);
  };

  const focusCell = (rIdx: number, cId: string, attempts = 0) => {
    const el = document.querySelector(`[data-cn-row="${rIdx}"][data-cn-col="${cId}"]`) as HTMLInputElement | null;
    if (el) {
      el.focus();
      if ('select' in el && typeof (el as any).select === 'function') {
        el.select();
      }
    } else if (attempts < 15) {
      setTimeout(() => {
        focusCell(rIdx, cId, attempts + 1);
      }, 20);
    }
  };

  const handleExcelKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    rowIndex: number,
    colId: string
  ) => {
    const colIndex = editableCols.indexOf(colId);

    // Ctrl + D (Fill Down)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      handleFillDown();
      return;
    }

    if (e.shiftKey) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const targetRow = Math.max(0, rowIndex - 1);
        skipFocusResetRef.current = true;
        setSelectedCellRange(prev => ({
          anchorRow: prev ? prev.anchorRow : rowIndex,
          anchorCol: prev ? prev.anchorCol : colId,
          focusRow: targetRow,
          focusCol: colId,
        }));
        focusCell(targetRow, colId);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const targetRow = Math.min(cnState.items.length - 1, rowIndex + 1);
        skipFocusResetRef.current = true;
        setSelectedCellRange(prev => ({
          anchorRow: prev ? prev.anchorRow : rowIndex,
          anchorCol: prev ? prev.anchorCol : colId,
          focusRow: targetRow,
          focusCol: colId,
        }));
        focusCell(targetRow, colId);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const targetColIdx = Math.max(0, colIndex - 1);
        const targetCol = editableCols[targetColIdx];
        skipFocusResetRef.current = true;
        setSelectedCellRange(prev => ({
          anchorRow: prev ? prev.anchorRow : rowIndex,
          anchorCol: prev ? prev.anchorCol : colId,
          focusRow: rowIndex,
          focusCol: targetCol,
        }));
        focusCell(rowIndex, targetCol);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const targetColIdx = Math.min(editableCols.length - 1, colIndex + 1);
        const targetCol = editableCols[targetColIdx];
        skipFocusResetRef.current = true;
        setSelectedCellRange(prev => ({
          anchorRow: prev ? prev.anchorRow : rowIndex,
          anchorCol: prev ? prev.anchorCol : colId,
          focusRow: rowIndex,
          focusCol: targetCol,
        }));
        focusCell(rowIndex, targetCol);
        return;
      }
    }

    // Handle Enter and Shift+Enter or Tab navigation to move smoothly right
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();

      if (e.shiftKey && e.key === 'Tab') {
        // Shift+Tab -> Move Left
        if (colIndex > 0) {
          focusCell(rowIndex, editableCols[colIndex - 1]);
          handleCellFocus(rowIndex, editableCols[colIndex - 1]);
        } else if (rowIndex > 0) {
          focusCell(rowIndex - 1, editableCols[editableCols.length - 1]);
          handleCellFocus(rowIndex - 1, editableCols[editableCols.length - 1]);
        }
        return;
      }

      // Check if current cell is description and has no content - DO NOT move to next column if empty!
      const currItem = cnState.items[rowIndex];
      const descClean = (currItem?.description || '').replace(/<[^>]*>?/gm, '').trim();
      if (colId === 'description' && (!descClean || descClean === '')) {
        return;
      }

      // Enter, Shift+Enter, or Tab moves to the right column
      if (colIndex < editableCols.length - 1) {
        focusCell(rowIndex, editableCols[colIndex + 1]);
        handleCellFocus(rowIndex, editableCols[colIndex + 1]);
      } else {
        if (rowIndex < cnState.items.length - 1) {
          focusCell(rowIndex + 1, editableCols[0]);
          handleCellFocus(rowIndex + 1, editableCols[0]);
        } else {
          const nextSn = cnState.items.length + 1;
          const newItem: CreditNoteItem = {
            sn: nextSn,
            description: '',
            qty: 0,
            unit: '',
            rate: 0,
            per: '',
            amount: 0,
            vatRate: undefined,
            taxableValue: 0,
            taxAmount: 0
          };
          setCnState(prev => ({
            ...prev,
            items: [...prev.items, newItem]
          }));
          setIsEditing(true);
          focusCell(rowIndex + 1, editableCols[0]);
          handleCellFocus(rowIndex + 1, editableCols[0]);
          triggerToast(`Appended Item Row ${nextSn}!`);
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(rowIndex - 1, colId);
      handleCellFocus(Math.max(0, rowIndex - 1), colId);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(rowIndex + 1, colId);
      handleCellFocus(Math.min(cnState.items.length - 1, rowIndex + 1), colId);
    } else if (e.key === 'ArrowLeft') {
      let cursorAtStart = true;
      try {
        if ('selectionStart' in (e.currentTarget as any) && (e.currentTarget as any).selectionStart !== null) {
          cursorAtStart = (e.currentTarget as any).selectionStart === 0;
        }
      } catch (err) {
        cursorAtStart = true;
      }
      if (cursorAtStart && colIndex > 0) {
        e.preventDefault();
        focusCell(rowIndex, editableCols[colIndex - 1]);
        handleCellFocus(rowIndex, editableCols[colIndex - 1]);
      }
    } else if (e.key === 'ArrowRight') {
      let cursorAtEnd = true;
      try {
        if ('selectionEnd' in (e.currentTarget as any) && (e.currentTarget as any).selectionEnd !== null) {
          cursorAtEnd = (e.currentTarget as any).selectionEnd === ((e.currentTarget as any).value || '').length;
        }
      } catch (err) {
        cursorAtEnd = true;
      }
      if (cursorAtEnd && colIndex < editableCols.length - 1) {
        const currItem = cnState.items[rowIndex];
        const descClean = (currItem?.description || '').replace(/<[^>]*>?/gm, '').trim();
        if (colId === 'description' && (!descClean || descClean === '')) {
          return;
        }
        e.preventDefault();
        focusCell(rowIndex, editableCols[colIndex + 1]);
        handleCellFocus(rowIndex, editableCols[colIndex + 1]);
      }
    }
  };

  const handleUpdateRow = (sn: number, key: keyof CreditNoteItem, value: any) => {
    const updated = cnState.items.map(item => {
      if (item.sn === sn) {
        let vatRateVal = key === 'vatRate' ? value : item.vatRate;
        const updatedItem = {
          ...item,
          [key]: value,
          vatRate: vatRateVal
        };

        if (key === 'qty' || key === 'rate' || key === 'vatRate' || key === 'description') {
          const qty = key === 'qty' ? (parseFloat(value) || 0) : (item.qty || 0);
          const rate = key === 'rate' ? (parseFloat(value) || 0) : (item.rate || 0);
          const vatRateNum = (vatRateVal !== undefined && vatRateVal !== null && vatRateVal !== '') ? (parseFloat(vatRateVal as any) || 0) : 0;

          updatedItem.amount = qty * rate;
          updatedItem.taxableValue = updatedItem.amount;
          updatedItem.taxAmount = vatRateNum > 0 ? updatedItem.taxableValue * (vatRateNum / 100) : 0;
        }
        return updatedItem;
      }
      return item;
    });
    setCnState({
      ...cnState,
      items: updated
    });
    setIsEditing(true);
  };

  // Dynamic calculations
  const totals = useMemo(() => {
    let totalQty = 0;
    let totalAmt = 0;
    let totalTaxableValue = 0;
    let totalTaxAmt = 0;
    cnState.items.forEach(item => {
      totalQty += (Number(item.qty) || 0);
      totalAmt += (Number(item.amount) || 0);
      totalTaxableValue += (Number(item.taxableValue) || 0);
      totalTaxAmt += (Number(item.taxAmount) || 0);
    });
    const grandTotal = totalTaxableValue + totalTaxAmt;
    return {
      totalQty,
      totalAmt,
      totalTaxableValue,
      totalTaxAmt,
      grandTotal
    };
  }, [cnState.items]);

  const numberToWordsAED = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion'];

    if (num === 0) return 'UAE Dirham Zero Only';

    const convertSection = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += ones[n] + ' ';
      }
      return str.trim();
    };

    const parts = num.toFixed(2).split('.');
    const dirhamsVal = parseInt(parts[0], 10);
    const filsVal = parseInt(parts[1], 10);

    let result = '';

    if (dirhamsVal > 0) {
      let tempVal = dirhamsVal;
      let scaleIdx = 0;
      let dirhamsWordList = [];

      while (tempVal > 0) {
        const chunk = tempVal % 1000;
        if (chunk > 0) {
          const chunkStr = convertSection(chunk);
          const chunkScale = scales[scaleIdx] ? ' ' + scales[scaleIdx] : '';
          dirhamsWordList.unshift(chunkStr + chunkScale);
        }
        tempVal = Math.floor(tempVal / 1000);
        scaleIdx++;
      }
      result += dirhamsWordList.join(' ');
      result += ' UAE Dirhams';
    }

    if (filsVal > 0) {
      if (result.length > 0) result += ' And ';
      result += convertSection(filsVal) + ' Fils';
    }

    return (result + ' Only').toUpperCase();
  };

  const handlePrintCreditNote = (cnToPrint: CreditNote) => {
    const profile = getCompanyProfile();
    const isOldAddress = !cnToPrint.issuerAddress || cnToPrint.issuerAddress.includes('AL BATEEN');
    const isOldTRN = !cnToPrint.issuerTRN || cnToPrint.issuerTRN === '100334455600003' || cnToPrint.issuerTRN === '100412856300003';

    const printIssuerName = cnToPrint.issuerName || profile.name;
    const printIssuerAddress = isOldAddress ? (profile.address || 'Industrial, Area, Ajman, UAE') : cnToPrint.issuerAddress;
    const printIssuerTRN = isOldTRN ? (profile.trn || '100440509600003') : cnToPrint.issuerTRN;

    // Helper to check if row has actual typed content
    const hasRealData = (item: CreditNoteItem) => {
      if (!item) return false;
      const cleanDesc = (item.description || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const amount = Number(item.amount) || 0;
      return cleanDesc.length > 0 || qty > 0 || rate > 0 || amount > 0;
    };

    // Filter items to strictly exclude dummy / empty lines
    const printableItems = cnToPrint.items.filter(hasRealData);
    const itemsToRender = printableItems;
    const ITEMS_PER_PAGE = 18;
    const totalPages = Math.max(1, Math.ceil(itemsToRender.length / ITEMS_PER_PAGE));

    let printTotalQty = 0;
    let printTotalTaxableValue = 0;
    let printTotalTaxAmt = 0;

    itemsToRender.forEach(item => {
      printTotalQty += (Number(item.qty) || 0);
      printTotalTaxableValue += (Number(item.taxableValue) || 0);
      printTotalTaxAmt += (Number(item.taxAmount) || 0);
    });
    const printGrandTotal = printTotalTaxableValue + printTotalTaxAmt;

    const pagesHtml = Array.from({ length: totalPages }).map((_, pageIdx) => {
      const pageNum = pageIdx + 1;
      const isLastPage = pageNum === totalPages;
      const pageItems = itemsToRender.slice(pageIdx * ITEMS_PER_PAGE, (pageIdx + 1) * ITEMS_PER_PAGE);

      return `
        <div class="print-page" style="${pageIdx > 0 ? 'page-break-before: always; break-before: page; margin-top: 38mm; padding-top: 10mm;' : ''}">
          <div class="header">
            <div>
              <h1 class="company-title">${printIssuerName}</h1>
              <div style="font-size: 9.5px; color: #000000;">${printIssuerAddress}</div>
              <div style="font-size: 9.5px; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; font-weight: 700; color: #000000; margin-top: 2px;">TRN: ${printIssuerTRN}</div>
            </div>
            <div>
              <div class="doc-title">${cnToPrint.noteType === 'DEBIT' ? 'TAX DEBIT NOTE' : 'TAX CREDIT NOTE'}</div>
              <div style="font-size: 12px; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; font-weight: 800; color: #000000; text-align: right; margin-top: 4px;">
                ${cnToPrint.creditNoteNo}
              </div>
              <div style="font-size: 10px; text-align: right; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; font-weight: 700; margin-top: 2px; color: #000000;">Date: ${cnToPrint.dated}</div>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="box-title">Party / Debtor Details</div>
              ${cnToPrint.partyName ? `<div style="font-size: 11px; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; font-weight: 800; color: #000000;">${cnToPrint.partyName}</div>` : ''}
              ${cnToPrint.partyAddress ? `<div>${cnToPrint.partyAddress}</div>` : ''}
              ${cnToPrint.partyTRN ? `<div style="margin-top: 4px;"><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">TRN:</strong> ${cnToPrint.partyTRN}</div>` : ''}
              ${[cnToPrint.partyEmirate, cnToPrint.partyCountry].filter(Boolean).join(', ') ? `<div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Emirate / Country:</strong> ${[cnToPrint.partyEmirate, cnToPrint.partyCountry].filter(Boolean).join(', ')}</div>` : ''}
            </div>
            <div class="box">
              <div class="box-title">Voucher Reference</div>
              ${cnToPrint.reasonForIssue ? `<div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Reason For Issue:</strong> ${cnToPrint.reasonForIssue}</div>` : ''}
              ${cnToPrint.buyersRef ? `<div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Buyer's Ref:</strong> ${cnToPrint.buyersRef}</div>` : ''}
              ${cnToPrint.otherRef ? `<div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Other Ref:</strong> ${cnToPrint.otherRef}</div>` : ''}
              ${cnToPrint.placeOfSupply ? `<div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Place of Supply:</strong> ${cnToPrint.placeOfSupply}</div>` : ''}
              <div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Page No:</strong> Page ${pageNum} of ${totalPages}</div>
              ${cnToPrint.expectedDeliveryTime ? `<div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Expected Delivery Time:</strong> ${cnToPrint.expectedDeliveryTime}</div>` : ''}
            </div>
          </div>
          <div style="height: 8px;"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 28px; white-space: nowrap; text-align: center;" class="text-center">S.N.</th>
                <th style="width: 44%; min-width: 300px;" class="text-left">Description of Goods / Service</th>
                <th style="width: 40px; white-space: nowrap; text-align: center;" class="text-center">Qty</th>
                <th style="width: 45px; white-space: nowrap; text-align: center;" class="text-center">UNIT</th>
                <th style="width: 65px; white-space: nowrap; text-align: right;" class="text-right">Rate</th>
                <th style="width: 80px; white-space: nowrap; text-align: right;" class="text-right">TAXABLE<br/>VALUE</th>
                <th style="width: 40px; white-space: nowrap; text-align: center;" class="text-center">VAT%</th>
                <th style="width: 70px; white-space: nowrap; text-align: right;" class="text-right">VAT Amount</th>
                <th style="width: 90px; white-space: nowrap; text-align: right;" class="text-right">Total (AED)</th>
              </tr>
            </thead>
            <tbody>
              ${pageItems.map((item, idx) => {
                const itemSN = pageIdx * ITEMS_PER_PAGE + idx + 1;
                const hasData = Boolean((item.description && item.description.trim()) || Number(item.qty) || Number(item.rate) || Number(item.amount));
                const vatVal = (item.vatRate != null && item.vatRate !== '' && item.vatRate !== 0) ? `${item.vatRate}%` : (item.vatRate === 0 ? '0%' : '');
                return `
                  <tr style="${item.textColor ? `color: ${item.textColor};` : ''}">
                    <td class="text-center font-bold" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${itemSN}</td>
                    <td class="font-bold text-left" style="${item.textColor ? `color: ${item.textColor};` : ''}">${item.description || ''}</td>
                    <td class="text-center" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData && item.qty ? item.qty : ''}</td>
                    <td class="text-center" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData ? (item.unit || '') : ''}</td>
                    <td class="text-right font-bold" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData && item.rate ? Number(item.rate).toFixed(2) : ''}</td>
                    <td class="text-right" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData && item.taxableValue ? Number(item.taxableValue).toFixed(2) : ''}</td>
                    <td class="text-center" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData ? vatVal : ''}</td>
                    <td class="text-right font-bold" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData && item.taxAmount ? Number(item.taxAmount).toFixed(2) : ''}</td>
                    <td class="text-right font-bold" style="white-space: nowrap; ${item.textColor ? `color: ${item.textColor};` : ''}">${hasData && (item.taxableValue || item.taxAmount) ? (Number(item.taxableValue || 0) + Number(item.taxAmount || 0)).toFixed(2) : ''}</td>
                  </tr>
                `;
              }).join('')}
              ${pageItems.length === 0 ? `
                <tr>
                  <td colSpan="9" class="text-center font-bold" style="padding: 12px;">No items entered</td>
                </tr>
              ` : ''}
              ${isLastPage ? `
                <tr class="totals-row">
                  <td colSpan="2" class="text-right uppercase">Gross Totals:</td>
                  <td class="text-center">${printTotalQty}</td>
                  <td colSpan="2"></td>
                  <td class="text-right">${printTotalTaxableValue.toFixed(2)}</td>
                  <td></td>
                  <td class="text-right">${printTotalTaxAmt.toFixed(2)}</td>
                  <td class="text-right">${printGrandTotal.toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          ${isLastPage ? `
            <div class="footer-section">
              <div><strong style="font-family: 'Arial MT Bold', 'Arial Bold', sans-serif;">Amount Chargeable in Words:</strong></div>
              <div style="font-size: 11px; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; font-weight: 800; color: #000000; margin-top: 2px;">
                ${numberToWordsAED(printGrandTotal)}
              </div>
            </div>

            <div class="sign-area">
              <div class="sign-box">
                <div class="sign-box-title">For Buyer / Customer</div>
                <div class="sign-box-line">Buyer's Seal & Signature</div>
              </div>
              <div class="sign-box">
                <div class="sign-box-title">For ${printIssuerName}</div>
                <div class="sign-box-line">Authorized Signatory</div>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cnToPrint.noteType === 'DEBIT' ? `${cnToPrint.creditNoteNo || 'DN'}-DN-${(cnToPrint.partyName || profile?.name || '').trim().replace(/[/\\?%*:|"<>]/g, '')}` : `${cnToPrint.creditNoteNo || 'CN'}-CN-${(cnToPrint.partyName || profile?.name || '').trim().replace(/[/\\?%*:|"<>]/g, '')}`}</title>
        <style>
          @page { size: A4 portrait; margin: 0 !important; }
          body { font-family: 'Arial MT', 'Arial', sans-serif; font-size: ${tableFontSize}; color: #000000; margin: 0; padding: 6mm 5mm 8mm 5mm !important; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          b, strong, th, h1, h2, h3, h4, .font-bold { font-family: 'Arial MT Bold', 'Arial Bold', 'Arial MT', 'Arial', sans-serif; font-weight: bold; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          .print-page + .print-page { page-break-before: always !important; break-before: page !important; margin-top: 25mm !important; padding-top: 5mm !important; }
          @media print {
            @page { size: A4 portrait; margin: 0 !important; }
            .print-page + .print-page { page-break-before: always !important; break-before: page !important; margin-top: 25mm !important; padding-top: 5mm !important; }
          }
          .header { border-bottom: 2px solid #000000; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
          .company-title { font-size: ${supplierFontSize}; font-family: 'Arial MT Bold', 'Arial Bold', 'Arial MT', 'Arial', sans-serif; font-weight: 900; color: #000000; margin: 0; text-transform: uppercase; }
          .doc-title { font-size: 16px; font-family: 'Arial MT Bold', 'Arial Bold', 'Arial MT', 'Arial', sans-serif; font-weight: 900; color: #000000; text-transform: uppercase; text-align: right; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px; text-align: left; }
          .box { border: 1px solid #000000; padding: 6px; border-radius: 0px; background-color: #ffffff; font-size: ${customerFontSize}; font-family: 'Arial MT', 'Arial', sans-serif; color: #000000; }
          .box-title { font-size: ${docRefFontSize}; font-family: 'Arial MT Bold', 'Arial Bold', 'Arial MT', 'Arial', sans-serif; font-weight: 800; text-transform: uppercase; color: #000000; border-bottom: 1px solid #000000; padding-bottom: 3px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: ${tableFontSize}; font-family: Arial, sans-serif !important; }
          th { background-color: #f2f2f2; color: #000000; padding: 2.5px 4px; line-height: 1.15; font-size: ${tableFontSize}; text-transform: uppercase; font-family: Arial, sans-serif !important; font-weight: 800; border: 1px solid #000000; }
          td { padding: 2px 4px; line-height: 1.15; border: 1px solid #000000; font-size: ${tableFontSize}; font-family: Arial, sans-serif !important; color: #000000; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-family: 'Arial MT Bold', 'Arial Bold', 'Arial MT', 'Arial', sans-serif; font-weight: 700; }
          .totals-row td { background-color: #f8f8f8; font-family: 'Arial MT Bold', 'Arial Bold', 'Arial MT', 'Arial', sans-serif; font-weight: 800; font-size: ${totalsFontSize}; border-top: 2px solid #000000; color: #000000; }
          .footer-section { margin-top: 10px; border: 1px solid #000000; padding: 8px; background: #ffffff; font-family: 'Arial MT', 'Arial', sans-serif; color: #000000; page-break-inside: avoid; break-inside: avoid; }
          .sign-area { margin-top: 80px; display: flex; justify-content: space-between; align-items: flex-end; font-family: 'Arial MT', 'Arial', sans-serif; color: #000000; page-break-inside: avoid; break-inside: avoid; }
          .sign-box { width: 220px; text-align: center; color: #000000; }
          .sign-box-title { font-size: 8.5px; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; text-transform: uppercase; font-weight: 800; color: #000000; margin-bottom: 75px; text-align: center; }
          .sign-box-line { border-top: 1.5px solid #000000; font-size: 9px; font-family: 'Arial MT Bold', 'Arial Bold', sans-serif; text-transform: uppercase; font-weight: 700; color: #000000; padding-top: 6px; text-align: center; }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    printHtml(htmlContent, `${cnToPrint.noteType === 'DEBIT' ? 'TAX_DEBIT_NOTE' : 'TAX_CREDIT_NOTE'}_${cnToPrint.creditNoteNo}`);
  };

  const activeRangeBounds = getSelectedRangeBounds();

  return (
    <div className="space-y-4 font-sans text-slate-800 text-[11px] leading-relaxed select-none">
      {/* Top Control Bar Redesigned Icon Bar matching user screenshot */}
      <div className="bg-[#f0f4f9] p-2 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-center no-print">
        {/* Icon Action Cards matching uploaded toolbar screenshot */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {/* 1. New */}
          <button
            onClick={() => handleInitNewCn(cnState.noteType || 'CREDIT')}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Create New Voucher"
          >
            <FilePlus className="w-4 h-4 text-slate-700 group-hover:text-rose-600 transition-colors" />
            <span className="text-[10.5px] font-semibold text-slate-800">New</span>
          </button>

          {/* 2. Save */}
          <button
            onClick={handleSaveCn}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Save Voucher to Ledger"
          >
            <Save className="w-4 h-4 text-slate-700 group-hover:text-emerald-600 transition-colors" />
            <span className="text-[10.5px] font-semibold text-slate-800">Save</span>
          </button>

          {/* 3. Delete */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset current draft items?")) {
                if (activeCreditNote) {
                  setCnState({ ...activeCreditNote });
                } else {
                  handleInitNewCn(cnState.noteType || 'CREDIT');
                }
                setIsEditing(false);
                triggerToast("Draft reset successfully.");
              }
            }}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Delete / Reset Draft"
          >
            <Trash2 className="w-4 h-4 text-slate-700 group-hover:text-red-600 transition-colors" />
            <span className="text-[10.5px] font-semibold text-slate-800">Delete</span>
          </button>

          {/* 4. Print */}
          <button
            onClick={() => handlePrintCreditNote(cnState)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Print Document to PDF"
          >
            <Printer className="w-4 h-4 text-slate-700 group-hover:text-sky-600 transition-colors" />
            <span className="text-[10.5px] font-semibold text-slate-800">Print</span>
          </button>

          {/* 5. Preview */}
          <button
            onClick={() => handlePrintCreditNote(cnState)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Preview PDF Document Layout"
          >
            <Eye className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 transition-colors" />
            <span className="text-[10.5px] font-semibold text-slate-800">Preview</span>
          </button>

          {/* 6. Header (Orange icon matching user screenshot) */}
          <button
            onClick={() => setIsCompanyModalOpen(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Edit Company Profile & Header (Issuer Name, Address, TRN)"
          >
            <Building2 className="w-4 h-4 text-[#f37021] group-hover:scale-110 transition-transform" />
            <span className="text-[10.5px] font-semibold text-slate-800">Header</span>
          </button>

          {/* 7. Close / Records */}
          <button
            onClick={() => setActiveTab('credit_note_record')}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center min-w-[68px] min-h-[58px] gap-0.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="View Saved Ledger Records"
          >
            <XCircle className="w-4 h-4 text-slate-700 group-hover:text-rose-600 transition-colors" />
            <span className="text-[10.5px] font-semibold text-slate-800">Close</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 leading-relaxed">
        
        {/* Main Workspace Frame */}
        <div className="col-span-12 flex flex-col items-center">
          
          {/* Paper Layout */}
          <div className="w-full bg-white border-2 border-slate-900 rounded-xl p-4 md:p-6 text-black shadow-lg flex flex-col items-stretch">
            
            <div className="w-full border-2 border-[#1e3a8a] p-4 font-sans text-[10.5px] text-slate-950 flex flex-col space-y-4">
              
              <div className="flex justify-between items-center bg-slate-50 border-b-2 border-[#1e3a8a] px-3 py-1.5 no-print">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-sans">Voucher Class:</span>
                  <div className="flex gap-1">
                    {cnState.noteType !== 'DEBIT' ? (
                      <span className="px-3 py-1 text-[9.5px] font-bold uppercase rounded font-sans bg-rose-700 text-white font-black shadow-3xs">
                        Tax Credit Note
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-[9.5px] font-bold uppercase rounded font-sans bg-sky-700 text-white font-black shadow-3xs">
                        Tax Debit Note
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-right font-black uppercase text-xs tracking-wider ${cnState.noteType === 'DEBIT' ? 'text-sky-700' : 'text-rose-700'}`}>
                  {cnState.noteType === 'DEBIT' ? 'Tax Debit Note' : 'Tax Credit Note'}
                </div>
              </div>

              {/* Sender & Voucher Details Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#1e3a8a] pb-4">
                {/* Supplier Box */}
                <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                  <span className="text-[9px] font-bold uppercase text-[#1e3a8a] block">Sender / Issuer Details</span>
                  <div className="flex gap-1.5 items-end">
                    <span className="font-semibold text-[#111] shrink-0 w-20">Issuer Name:</span>
                    <input 
                      type="text" 
                      data-header-id="issuerName"
                      value={cnState.issuerName} 
                      onChange={(e) => { setCnState({ ...cnState, issuerName: e.target.value.toUpperCase() }); setIsEditing(true); }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'issuerAddress')}
                      className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-[#1e3a8a]"
                    />
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-semibold text-[#111] shrink-0 w-20">Address:</span>
                    <textarea 
                      rows={2} 
                      data-header-id="issuerAddress"
                      value={cnState.issuerAddress} 
                      onChange={(e) => { setCnState({ ...cnState, issuerAddress: e.target.value.toUpperCase() }); setIsEditing(true); }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'issuerTRN')}
                      className="flex-1 bg-transparent border border-slate-300 focus:outline-none focus:border-rose-500 text-[10px] uppercase font-bold p-1 rounded"
                    />
                  </div>
                  <div className="flex gap-1.5 items-end">
                    <span className="font-semibold text-[#111] shrink-0 w-20">TRN Number:</span>
                    <input 
                      type="text" 
                      data-header-id="issuerTRN"
                      value={cnState.issuerTRN} 
                      onChange={(e) => { setCnState({ ...cnState, issuerTRN: e.target.value }); setIsEditing(true); }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'creditNoteNo')}
                      className="flex-1 bg-transparent font-semibold border-b border-slate-300 focus:outline-none focus:border-[#f37021] font-mono text-[#1e3a8a] text-xs"
                    />
                  </div>
                </div>

                {/* Voucher Credentials Box */}
                <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                  <span className="text-[9px] font-bold uppercase text-rose-600 block">Voucher Registration</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-[#111] block text-[9.5px]">{cnState.noteType === 'DEBIT' ? 'Debit' : 'Credit'} Note No:</span>
                      <input 
                        type="text" 
                        data-header-id="creditNoteNo"
                        value={cnState.creditNoteNo} 
                        onChange={(e) => { setCnState({ ...cnState, creditNoteNo: e.target.value.toUpperCase() }); setIsEditing(true); }}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'dated')}
                        className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-rose-600 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-[#111] block text-[9.5px]">Dated:</span>
                      <input 
                        type="date" 
                        data-header-id="dated"
                        value={cnState.dated} 
                        onChange={(e) => { setCnState({ ...cnState, dated: e.target.value }); setIsEditing(true); }}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'buyersRef')}
                        className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-[#f37021] font-mono text-xs font-bold text-[#1e3a8a] text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1e3a8a]/20">
                    <div>
                      <span className="font-semibold text-[#111] block text-[9.5px]">Buyer's Ref / Order No:</span>
                      <input 
                        type="text" 
                        data-header-id="buyersRef"
                        value={cnState.buyersRef} 
                        onChange={(e) => { setCnState({ ...cnState, buyersRef: e.target.value }); setIsEditing(true); }}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'otherRef')}
                        className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-[#111] block text-[9.5px]">Other Reference(s):</span>
                      <input 
                        type="text" 
                        data-header-id="otherRef"
                        value={cnState.otherRef} 
                        onChange={(e) => { setCnState({ ...cnState, otherRef: e.target.value }); setIsEditing(true); }}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'partyName')}
                        className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer & Reason for Issue layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#1e3a8a] pb-4">
                {/* Buyer Box */}
                <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                  <span className="text-[9px] font-bold uppercase text-[#1e3a8a] block">Buyer / Debtor Details</span>
                  <div className="flex gap-1.5 items-end">
                    <span className="font-semibold text-[#111] shrink-0 w-20">Buyer To:</span>
                    <input 
                      type="text" 
                      data-header-id="partyName"
                      list="buyer-selector-cn"
                      value={cnState.partyName || ''} 
                      onChange={(e) => { setCnState({ ...cnState, partyName: e.target.value.toUpperCase() }); setIsEditing(true); }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'partyAddress')}
                      className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-[#1e3a8a]"
                      placeholder="ENTER BUYER CLIENT..."
                    />
                    <datalist id="buyer-selector-cn">
                      {clientDatabase.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-semibold text-[#111] shrink-0 w-20">Address:</span>
                    <textarea 
                      rows={2} 
                      data-header-id="partyAddress"
                      value={cnState.partyAddress || ''} 
                      onChange={(e) => { setCnState({ ...cnState, partyAddress: e.target.value.toUpperCase() }); setIsEditing(true); }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'partyTRN')}
                      className="flex-1 bg-transparent border border-slate-300 focus:outline-none focus:border-rose-500 text-[10px] uppercase font-semibold p-1 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1 items-end">
                      <span className="font-semibold text-[#111] text-[9.5px] tracking-tight shrink-0">TRN No:</span>
                      <input 
                        type="text" 
                        data-header-id="partyTRN"
                        value={cnState.partyTRN || ''} 
                        onChange={(e) => { setCnState({ ...cnState, partyTRN: e.target.value }); setIsEditing(true); }}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'partyCountry')}
                        className="flex-1 bg-transparent font-bold border-b border-slate-300 focus:outline-none focus:border-rose-500 font-mono text-[10.5px] text-[#1e3a8a]"
                        placeholder="TRN No"
                      />
                    </div>
                    <div className="flex gap-1 items-end">
                      <span className="font-semibold text-[#111] text-[9.5px] tracking-tight shrink-0">Country:</span>
                      <input 
                        type="text" 
                        data-header-id="partyCountry"
                        value={cnState.partyCountry || ''} 
                        onChange={(e) => { setCnState({ ...cnState, partyCountry: e.target.value }); setIsEditing(true); }}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'reasonForIssue')}
                        className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Supply & Issue Reason */}
                <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                  <span className="text-[9px] font-bold uppercase text-rose-600 block">Supply Parameters</span>
                  <div>
                    <span className="font-semibold text-[#111] block text-[9.5px]">Reason for issuing {cnState.noteType === 'DEBIT' ? 'debit' : 'credit'} note:</span>
                    <input 
                      type="text" 
                      data-header-id="reasonForIssue"
                      value={cnState.reasonForIssue || ''} 
                      onChange={(e) => { setCnState({ ...cnState, reasonForIssue: e.target.value }); setIsEditing(true); }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'placeOfSupply')}
                      className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-[#1e3a8a] text-[11px]"
                      placeholder="e.g. Sales return, original invoice value discount"
                    />
                  </div>
                  <div className="pt-2">
                    <span className="font-semibold text-[#111] block text-[9.5px]">Place of Supply (Emirate):</span>
                    <input 
                      type="text" 
                      data-header-id="placeOfSupply"
                      value={cnState.placeOfSupply || ''} 
                      onChange={(e) => { 
                        const next = { ...cnState, placeOfSupply: e.target.value };
                        setCnState(next); 
                        pushStateToHistory(next);
                        setIsEditing(true); 
                      }}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'row0_description')}
                      className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Excel Spreadsheet Control Bar with Range Selection */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-lg border border-[#107c41]/40 no-print">
                  {/* Left Side: Range Selection Indicator */}
                  <div className="flex items-center gap-2">
                    {activeRangeBounds ? (
                      <div className="text-[9.5px] font-mono font-bold text-[#107c41] bg-emerald-50 px-2 py-1 rounded border border-emerald-300">
                        Selection: Rows {activeRangeBounds.minRow + 1}–{activeRangeBounds.maxRow + 1}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#107c41] font-mono uppercase tracking-wide">
                        Excel Sheet Controls
                      </span>
                    )}
                  </div>

                  {/* Right Side: Undo, Redo, Sheet Fonts, Print View, Add Line (+) Icon */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* UNDO & REDO BUTTONS */}
                    <div className="flex items-center gap-0.5 bg-white border border-slate-300 rounded p-0.5 shadow-3xs">
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className={`p-1.5 rounded transition-all cursor-pointer ${
                          historyIndex > 0 ? 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700' : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title="Undo (Ctrl+Z)"
                      >
                        <Undo className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={historyIndex >= historyStack.length - 1}
                        className={`p-1.5 rounded transition-all cursor-pointer ${
                          historyIndex < historyStack.length - 1 ? 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700' : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title="Redo (Ctrl+Y)"
                      >
                        <Redo className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* WHOLE SHEET FONT CONTROLLER BUTTON */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMasterFontPickerOpen(!isMasterFontPickerOpen)}
                        className="p-1.5 px-2 text-xs font-semibold bg-white text-[#107c41] border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 shadow-3xs cursor-pointer transition-all hover:border-[#107c41]"
                        title="Sheet Fonts Controller: Change Supplier, Customer, Doc Reference & Table Font Sizes"
                      >
                        <Type className="w-4 h-4 text-[#107c41]" />
                        <span className="text-[10.5px] font-bold text-[#107c41] font-mono">Sheet Fonts</span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>

                      {/* MASTER FONT SIZE CONTROLLER DROPDOWN DIALOG */}
                      {isMasterFontPickerOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40 no-print"
                            onClick={() => setIsMasterFontPickerOpen(false)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border-2 border-[#107c41] shadow-2xl rounded-xl p-3.5 w-[350px] max-h-[540px] overflow-y-auto flex flex-col gap-3 font-sans no-print text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <span className="text-[11px] font-extrabold uppercase text-[#107c41] font-mono tracking-wider flex items-center gap-1.5">
                                <Type className="w-4 h-4 text-[#107c41]" /> Whole Sheet Font Controls
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsMasterFontPickerOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>

                            {/* 1. SUPPLIER FONT */}
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#107c41] font-mono">
                                <span>SUPPLIER FONT:</span>
                                <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">{supplierFontSize}</span>
                              </div>
                              <div className="flex items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setSupplierFontSize(stepFontSize(supplierFontSize, -0.5, 7, 18))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                  title="Decrease Supplier Font Size"
                                >
                                  A-
                                </button>
                                {['9px', '10px', '11.5px'].map(sz => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => setSupplierFontSize(sz)}
                                    className={`flex-1 py-1 text-[9.5px] font-bold rounded border cursor-pointer transition-all ${
                                      supplierFontSize === sz 
                                        ? 'bg-[#107c41] text-white border-[#107c41] shadow-2xs' 
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setSupplierFontSize(stepFontSize(supplierFontSize, 0.5, 7, 18))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                  title="Increase Supplier Font Size"
                                >
                                  A+
                                </button>
                              </div>
                            </div>

                            {/* 2. CUSTOMER FONT */}
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#107c41] font-mono">
                                <span>CUSTOMER FONT:</span>
                                <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">{customerFontSize}</span>
                              </div>
                              <div className="flex items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setCustomerFontSize(stepFontSize(customerFontSize, -0.5, 7, 18))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                >
                                  A-
                                </button>
                                {['9px', '10px', '11.5px'].map(sz => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => setCustomerFontSize(sz)}
                                    className={`flex-1 py-1 text-[9.5px] font-bold rounded border cursor-pointer transition-all ${
                                      customerFontSize === sz 
                                        ? 'bg-[#107c41] text-white border-[#107c41] shadow-2xs' 
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setCustomerFontSize(stepFontSize(customerFontSize, 0.5, 7, 18))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                >
                                  A+
                                </button>
                              </div>
                            </div>

                            {/* 3. DOC REF FONT */}
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#107c41] font-mono">
                                <span>DOC REFERENCE FONT:</span>
                                <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">{docRefFontSize}</span>
                              </div>
                              <div className="flex items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setDocRefFontSize(stepFontSize(docRefFontSize, -0.5, 7, 18))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                >
                                  A-
                                </button>
                                {['8.5px', '9.5px', '10.5px'].map(sz => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => setDocRefFontSize(sz)}
                                    className={`flex-1 py-1 text-[9.5px] font-bold rounded border cursor-pointer transition-all ${
                                      docRefFontSize === sz 
                                        ? 'bg-[#107c41] text-white border-[#107c41] shadow-2xs' 
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setDocRefFontSize(stepFontSize(docRefFontSize, 0.5, 7, 18))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                >
                                  A+
                                </button>
                              </div>
                            </div>

                            {/* 4. TABLE ITEMS FONT */}
                            <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#107c41] font-mono">
                                <span>TABLE ITEMS FONT:</span>
                                <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">{tableFontSize}</span>
                              </div>
                              <div className="flex items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => setTableFontSize(stepFontSize(tableFontSize, -0.5, 6, 16))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                >
                                  A-
                                </button>
                                {['8px', '8.5px', '9.5px'].map(sz => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => setTableFontSize(sz)}
                                    className={`flex-1 py-1 text-[9.5px] font-bold rounded border cursor-pointer transition-all ${
                                      tableFontSize === sz 
                                        ? 'bg-[#107c41] text-white border-[#107c41] shadow-2xs' 
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setTableFontSize(stepFontSize(tableFontSize, 0.5, 6, 16))}
                                  className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded cursor-pointer"
                                >
                                  A+
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* EXCEL COLOR SCHEME FEATURE (LIKE SALES / EXCEL THEMES) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsExcelColorPickerOpen(!isExcelColorPickerOpen)}
                        className="p-1.5 px-2 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 shadow-3xs cursor-pointer transition-all hover:border-slate-400"
                        title="Excel Header & Table Color Theme"
                      >
                        <Palette className="w-4 h-4" style={{ color: activeTheme.hex }} />
                        <span className="text-[10.5px] font-bold font-mono" style={{ color: activeTheme.hex }}>
                          {activeTheme.name}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>

                      {isExcelColorPickerOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 no-print"
                            onClick={() => setIsExcelColorPickerOpen(false)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border-2 border-slate-400 shadow-2xl rounded-xl p-3 w-[220px] font-sans no-print text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                              <span className="text-[10.5px] font-extrabold uppercase text-slate-700 font-mono tracking-wider flex items-center gap-1.5">
                                <Palette className="w-3.5 h-3.5 text-slate-600" /> Excel Table Color
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsExcelColorPickerOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              {Object.entries(EXCEL_THEMES).map(([key, theme]: [string, any]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setExcelColorKey(key as any);
                                    setIsExcelColorPickerOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-bold font-mono flex items-center justify-between cursor-pointer border transition-all ${
                                    excelColorKey === key
                                      ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-3xs ring-1 ring-slate-300'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-3xs inline-block"
                                      style={{ backgroundColor: theme.hex }}
                                    />
                                    <span>{theme.name}</span>
                                  </div>
                                  {excelColorKey === key && (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* EXCEL TEXT COLOR PICKER BUTTON (A - ⌄) MATCHING EXACT EXCEL SPECIFIC WORD COLOR DESIGN */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsTextColorPickerOpen(!isTextColorPickerOpen)}
                        className="p-1 px-2 border border-slate-300 rounded font-mono text-xs flex items-center gap-1 shadow-3xs cursor-pointer bg-white hover:bg-slate-50 transition-all hover:border-slate-400"
                        title="Excel Cell & Text Color (A - ⌄)"
                      >
                        <div className="flex flex-col items-center leading-none">
                          <span className="font-black text-[12px] text-slate-900 font-sans">A</span>
                          <span className="w-3.5 h-[3px] rounded-full mt-0.5" style={{ backgroundColor: selectedTextColor }} />
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      </button>

                      {isTextColorPickerOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 no-print"
                            onClick={() => setIsTextColorPickerOpen(false)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border-2 border-slate-400 shadow-2xl rounded-xl p-3 w-[220px] font-sans no-print text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                              <span className="text-[10.5px] font-extrabold uppercase text-slate-700 font-mono tracking-wider">
                                EXCEL TEXT COLOR
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsTextColorPickerOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-5 gap-2 my-2">
                              {EXCEL_TEXT_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => applyTextColorToSelection(color)}
                                  className="w-7 h-7 rounded border border-slate-300 relative flex items-center justify-center transition-transform hover:scale-110 shadow-3xs cursor-pointer"
                                  style={{ backgroundColor: color }}
                                  title={`Color: ${color}`}
                                >
                                  {selectedTextColor === color && (
                                    <Check className={`w-3.5 h-3.5 ${['#000000', '#0f172a', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#475569', '#9f1239', '#0d9488'].includes(color) ? 'text-white' : 'text-slate-900'}`} />
                                  )}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 mt-2 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-slate-600">Custom Color:</span>
                                <input
                                  type="color"
                                  value={selectedTextColor}
                                  onChange={(e) => applyTextColorToSelection(e.target.value)}
                                  className="w-6 h-6 border border-slate-300 rounded cursor-pointer p-0 bg-transparent"
                                  title="Choose Custom Color"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => applyTextColorToSelection('#000000')}
                                className="text-blue-600 font-bold hover:underline text-xs cursor-pointer"
                              >
                                Reset Black
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* PRINT / SHEET VIEW TOGGLE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handlePrintCreditNote(cnState)}
                      className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-100 flex items-center justify-center shadow-3xs cursor-pointer"
                      title="Sheet Grid / Print Preview"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    </button>

                    {/* ADD LINE ICON BUTTON (+) MOVED TO RIGHT SIDE */}
                    <button 
                      type="button"
                      onClick={handleAddRow}
                      className={`${activeTheme.btnBg} text-white font-bold p-1.5 rounded flex items-center justify-center shadow-3xs cursor-pointer transition-all`}
                      title="Add Line Item (+)"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 font-medium px-1 flex items-center justify-between no-print">
                  <span>💡 <strong>Shift + Arrow Keys</strong> or <strong>Shift + Click</strong> selects cells. <strong>Ctrl + D</strong> fills down top cell. Paste Excel lines directly into table.</span>
                </div>

                {/* Interactive Excel Grid Table */}
                <div className={`w-full overflow-x-auto border-2 ${activeTheme.border} rounded bg-white font-sans text-[10px]`}>
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className={`${activeTheme.headerBg} uppercase font-extrabold text-white border-b-2 ${activeTheme.headerBorder}`}>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-10 text-center whitespace-nowrap`}>S.N.</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} min-w-[420px] w-auto`}>Goods / Service Description</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-14 text-center whitespace-nowrap`}>Qty</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-16 text-center whitespace-nowrap`}>UNIT</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-20 text-right whitespace-nowrap`}>Rate</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-14 text-center whitespace-nowrap`}>Per</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-20 text-right whitespace-nowrap`}>Amount</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-14 text-center whitespace-nowrap`}>VAT%</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-20 text-right whitespace-nowrap`}>Tax Amt (5%)</th>
                        <th className={`p-2 border-r ${activeTheme.headerBorder} w-24 text-right whitespace-nowrap`}>Line Total</th>
                        <th className="p-1 text-center w-10">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {cnState.items.map((item, idx) => {
                        const isDescSelected = isCellSelected(idx, 'description');
                        const isQtySelected = isCellSelected(idx, 'qty');
                        const isUnitSelected = isCellSelected(idx, 'unit');
                        const isRateSelected = isCellSelected(idx, 'rate');
                        const isPerSelected = isCellSelected(idx, 'per');
                        const isVatSelected = isCellSelected(idx, 'vatRate');

                        const selectedCellBg = 'bg-[#e6f4ea] ring-2 ring-[#107c41] ring-inset font-bold text-slate-900';

                        const hasData = Boolean(item.description && item.description.trim());

                        return (
                          <tr key={item.sn} className="hover:bg-slate-50 transition-colors">
                            <td 
                              onClick={(e) => handleSnClick(idx, e.shiftKey)}
                              className="p-1 border-r border-slate-300 text-center font-mono font-bold cursor-pointer hover:bg-emerald-100"
                              title="Click to select row (Shift+Click for multi-row range)"
                            >
                              {item.sn}
                            </td>
                            <td className={`p-1 border-r border-slate-300 ${isDescSelected ? selectedCellBg : ''}`}>
                              <div 
                                contentEditable
                                suppressContentEditableWarning
                                onFocus={(e) => handleCellFocus(idx, 'description', (e.nativeEvent as any).shiftKey)}
                                onBlur={(e) => handleUpdateRow(item.sn, 'description', e.currentTarget.innerHTML)}
                                onInput={(e) => handleUpdateRow(item.sn, 'description', e.currentTarget.innerHTML)}
                                onMouseUp={() => {
                                  const sel = window.getSelection();
                                  if (sel && !sel.isCollapsed) {
                                    savedTextSelectionRef.current = {
                                      rowIdx: idx,
                                      start: 0,
                                      end: 0,
                                      selectedText: sel.toString()
                                    };
                                  }
                                }}
                                onKeyUp={() => {
                                  const sel = window.getSelection();
                                  if (sel && !sel.isCollapsed) {
                                    savedTextSelectionRef.current = {
                                      rowIdx: idx,
                                      start: 0,
                                      end: 0,
                                      selectedText: sel.toString()
                                    };
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleUpdateRow(item.sn, 'description', e.currentTarget.innerHTML);
                                    handleExcelKeyDown(e, idx, 'description');
                                  } else {
                                    handleExcelKeyDown(e, idx, 'description');
                                  }
                                }}
                                onPaste={(e) => handlePasteExcel(e, idx, 'description')}
                                data-cn-row={idx}
                                data-cn-col="description"
                                style={item.textColor ? { color: item.textColor } : undefined}
                                className="w-full bg-transparent border-none font-semibold text-slate-900 uppercase focus:outline-none focus:bg-amber-50 rounded px-1 min-h-[22px] outline-none text-left empty:before:content-['Describe_items...'] empty:before:text-slate-400 empty:before:font-normal"
                                dangerouslySetInnerHTML={{ __html: item.description || '' }}
                              />
                            </td>
                            <td className={`p-1 border-r border-slate-300 ${isQtySelected ? selectedCellBg : ''}`}>
                              <input 
                                type="number"
                                value={item.qty ? item.qty : ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'qty', e.target.value)}
                                onFocus={(e) => handleCellFocus(idx, 'qty', (e.nativeEvent as any).shiftKey)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'qty')}
                                onPaste={(e) => handlePasteExcel(e, idx, 'qty')}
                                data-cn-row={idx}
                                data-cn-col="qty"
                                style={item.textColor ? { color: item.textColor } : undefined}
                                className="w-full bg-transparent border-none font-bold text-center text-slate-900 focus:outline-none focus:bg-amber-50 rounded font-mono px-1"
                              />
                            </td>
                            <td className={`p-1 border-r border-slate-300 ${isUnitSelected ? selectedCellBg : ''}`}>
                              <input 
                                type="text"
                                value={item.unit || ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'unit', e.target.value)}
                                onFocus={(e) => handleCellFocus(idx, 'unit', (e.nativeEvent as any).shiftKey)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'unit')}
                                onPaste={(e) => handlePasteExcel(e, idx, 'unit')}
                                data-cn-row={idx}
                                data-cn-col="unit"
                                className="w-full bg-transparent border-none text-center text-slate-700 uppercase focus:outline-none focus:bg-amber-50 rounded px-1 font-bold"
                              />
                            </td>
                            <td className={`p-1 border-r border-slate-300 ${isRateSelected ? selectedCellBg : ''}`}>
                              <input 
                                type="number"
                                step="any"
                                value={item.rate ? item.rate : ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'rate', e.target.value)}
                                onFocus={(e) => handleCellFocus(idx, 'rate', (e.nativeEvent as any).shiftKey)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'rate')}
                                onPaste={(e) => handlePasteExcel(e, idx, 'rate')}
                                data-cn-row={idx}
                                data-cn-col="rate"
                                className="w-full bg-transparent border-none font-bold text-right text-slate-900 focus:outline-none focus:bg-amber-50 rounded font-mono px-1"
                              />
                            </td>
                            <td className={`p-1 border-r border-slate-300 ${isPerSelected ? selectedCellBg : ''}`}>
                              <input 
                                type="text"
                                value={item.per || ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'per', e.target.value)}
                                onFocus={(e) => handleCellFocus(idx, 'per', (e.nativeEvent as any).shiftKey)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'per')}
                                onPaste={(e) => handlePasteExcel(e, idx, 'per')}
                                data-cn-row={idx}
                                data-cn-col="per"
                                className="w-full bg-transparent border-none text-center text-slate-600 focus:outline-none focus:bg-amber-50 rounded px-1"
                              />
                            </td>
                            <td className="p-1 border-r border-slate-300 text-right font-mono font-bold text-slate-800 px-2">
                              {hasData && item.amount > 0 ? item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}
                            </td>
                            <td className={`p-1 border-r border-slate-300 ${isVatSelected ? selectedCellBg : ''}`}>
                              <input 
                                type="number"
                                value={item.vatRate !== undefined && item.vatRate !== null && item.vatRate !== '' ? item.vatRate : ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'vatRate', e.target.value)}
                                onFocus={(e) => handleCellFocus(idx, 'vatRate', (e.nativeEvent as any).shiftKey)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'vatRate')}
                                onPaste={(e) => handlePasteExcel(e, idx, 'vatRate')}
                                data-cn-row={idx}
                                data-cn-col="vatRate"
                                placeholder=""
                                className="w-full bg-transparent border-none text-center font-bold text-slate-700 focus:outline-none focus:bg-amber-50 rounded font-mono px-1"
                              />
                            </td>
                            <td className="p-1 border-r border-slate-300 text-right font-mono font-bold text-rose-600 px-2">
                              {hasData && item.taxAmount > 0 ? item.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}
                            </td>
                            <td className="p-1 border-r border-slate-300 text-right font-mono font-bold text-[#107c41] px-2">
                              {hasData && (item.taxableValue + item.taxAmount) > 0 ? (item.taxableValue + item.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}
                            </td>
                            <td className="p-1 text-center w-10">
                              <button 
                                type="button"
                                onClick={() => handleRemoveRowIndex(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                title="Discard product row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {cnState.items.length === 0 && (
                        <tr>
                          <td colSpan={11} className="text-center py-4 text-slate-400 font-bold">No items found. Click "+ Add Line" to begin typing.</td>
                        </tr>
                      )}
                      {/* Totals Row */}
                      <tr className="bg-emerald-50/60 border-t-2 border-[#107c41] font-bold text-[10.5px]">
                        <td colSpan={2} className="p-2 border-r border-slate-300 text-right text-[#107c41] uppercase font-bold">Gross Aggregates:</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{totals.totalQty}</td>
                        <td colSpan={3} className="p-2 border-r border-slate-300"></td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-slate-900">{totals.totalAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 border-r border-slate-300"></td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono font-bold text-rose-700">{totals.totalTaxAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 border-r border-slate-300 text-right font-mono font-extrabold text-[#107c41]">{(totals.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amount details in Words */}
              <div className="border border-[#1e3a8a] p-3 rounded space-y-2 bg-slate-50/50">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Amount Chargeable in Words</span>
                  <span className="text-xs font-bold text-[#1e3a8a] uppercase leading-none mt-0.5 block">
                    {numberToWordsAED(totals.grandTotal)}
                  </span>
                </div>
                <div className="border-t border-dashed border-[#1e3a8a]/20 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Total VAT 5% Accumulation</span>
                    <span className="text-[11px] font-bold text-rose-700 font-mono">
                      AED {totals.totalTaxAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">VAT Amount in Words</span>
                    <span className="text-[10px] font-semibold text-slate-700 uppercase">
                      {numberToWordsAED(totals.totalTaxAmt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Signature Sections */}
              <div className="flex justify-between items-end pt-20 font-semibold text-xs leading-none">
                <div className="w-56 text-center space-y-16">
                  <div className="text-[8.5px] font-bold text-[#1e3a8a] uppercase tracking-wider text-center block">
                    For Buyer / Customer
                  </div>
                  <div className="border-t-2 border-[#1e3a8a] pt-1.5 uppercase font-bold text-[8.5px] tracking-tight text-center text-slate-800">
                    Buyer's Seal & Signature
                  </div>
                </div>
                <div className="w-56 text-center space-y-16">
                  <div className="text-[8.5px] font-bold text-[#1e3a8a] uppercase tracking-wider text-center block">
                    For: {cnState.issuerName || getCompanyProfile().name}
                  </div>
                  <div className="border-t-2 border-[#1e3a8a] pt-1.5 uppercase font-bold text-[8.5px] tracking-tight text-center text-slate-800">
                    Authorized Signatory
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
      {/* Company Header Edit Modal */}
      <EditCompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSaved={(updatedProfile) => {
          setCnState(prev => ({
            ...prev,
            issuerName: updatedProfile.name,
            issuerAddress: updatedProfile.address,
            issuerTRN: updatedProfile.trn,
          }));
          triggerToast("Company Header details updated successfully!");
        }}
      />
    </div>
  );
};
