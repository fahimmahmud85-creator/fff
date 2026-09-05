import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { printHtml } from './PrintHelper';
import { getCompanyProfile, isMarineFastenersCompany } from '../utils/companyProfile';
import { 
  Plus, Trash2, Printer, Check, Search, Calendar, Save, FileText, Layers, RotateCcw, Sparkles, Eye, PackageCheck, History, FilePlus, Building2, XCircle, FileSpreadsheet, ClipboardPaste, Edit3, Type, Palette, Filter, X, SlidersHorizontal, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

export interface MaterialDOItem {
  id: string;
  sn: number;
  description: string;
  size: string;
  finish: string;
  unit: string;
  qty: number;
  qtyReceived?: number;
  marking: string;
  markingType?: string;
  markingVisible?: string;
  adhesionTest?: string;
  threads?: string;
  microns?: string;
  coatings?: string;
  pitch?: string;
  remarks: string;
  qcNotes: string;
  cellColors?: Record<string, string>;
}

export interface MaterialDO {
  id: string;
  type: 'standard' | 'coating';
  invoiceNo: string;
  doNo: string;
  date: string;
  poNo: string;
  dispatchBy: string;
  deliveryTerms: string;
  madeIn: string;
  supplierName: string;
  supplierAddress: string;
  trn: string;
  phone: string;
  attentionTo: string;
  receiverName: string;
  qcCheckedBy: string;
  notes?: string;
  notesLine1?: string;
  notesLine2?: string;
  notesLine3?: string;
  notesLine4?: string;
  notesLines?: string[];
  deliverToName?: string;
  deliverToAddress?: string;
  deliverToPhone?: string;
  deliverToTrn?: string;
  items: MaterialDOItem[];
  
  // Inbound Invoice Payments Fields
  invoiceAmounts?: number;
  invoicePaid?: number;
  invoiceDate?: string;
  invoiceBalance?: number;
  invoicePaidBy?: string;
  invoiceReceivedVia?: string;
  invoiceAwbNo?: string;

  // Transport Payments Fields
  transportCharges?: number;
  transportPaidAmount?: number;
  transportDate?: string;
  transportBalanceAmount?: number;
  transportPaymentStatus?: string;

  // Forklift Payments Fields
  forkliftOperator?: string;
  forkliftStartTime?: string;
  forkliftEndTime?: string;
  forkliftTotalHours?: number;
  forkliftCharges?: number;
  forkliftPaidAmount?: number;
  forkliftDate?: string;
  forkliftBalanceAmount?: number;
  forkliftPaymentStatus?: string;
  receivedLocation?: string;
}

interface GRNContentEditableProps {
  value: string;
  onChange: (val: string) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  isCellSelected: boolean;
  cellColor: string;
  sheetFont: string;
  sheetFontSize: string;
  dataRow: number;
  dataCol: string;
  className?: string;
}

const GRNContentEditable: React.FC<GRNContentEditableProps> = ({
  value,
  onChange,
  onFocus,
  onKeyDown,
  onPaste,
  onMouseUp,
  onKeyUp,
  isCellSelected,
  cellColor,
  sheetFont,
  sheetFontSize,
  dataRow,
  dataCol,
  className = "",
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (divRef.current && document.activeElement !== divRef.current) {
      divRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={() => {
        setIsFocused(true);
        onFocus();
      }}
      onBlur={(e) => {
        setIsFocused(false);
        const raw = e.currentTarget.innerHTML;
        const clean = (raw === '<br>' || raw === '<div><br></div>' || raw === '<br></div>') ? '' : raw;
        onChange(clean);
      }}
      onInput={(e) => {
        const raw = e.currentTarget.innerHTML;
        const clean = (raw === '<br>' || raw === '<div><br></div>' || raw === '<br></div>') ? '' : raw;
        onChange(clean);
      }}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onMouseUp={onMouseUp}
      onKeyUp={onKeyUp}
      data-grn-row={dataRow}
      data-grn-col={dataCol}
      style={{
        color: isFocused ? cellColor || '#000000' : (isCellSelected ? '#1e3a8a' : cellColor),
        fontFamily: sheetFont,
        fontSize: sheetFontSize,
      }}
      className={`w-full min-h-[20px] focus:outline-none focus:bg-amber-50 focus:text-slate-900 focus:ring-2 focus:ring-blue-600 px-1 rounded flex items-center whitespace-normal break-words leading-tight transition-all ${
        isCellSelected
          ? (isFocused ? 'bg-amber-50 ring-2 ring-blue-600 font-bold' : 'bg-blue-100 ring-2 ring-blue-500 font-bold')
          : 'focus:bg-amber-50'
      } ${className}`}
    />
  );
};

const PRESET_STANDARD_DO: MaterialDO = {
  id: 'STD-101',
  type: 'standard',
  invoiceNo: 'INV-551020',
  doNo: 'DO-31682',
  date: '2026-06-01',
  poNo: 'PO-90112',
  dispatchBy: 'BY ROAD (TRAILER)',
  deliveryTerms: 'DDP - DUBAI PORT',
  madeIn: 'UAE',
  supplierName: 'ZAMIL HEAVY INDUSTRIES LTD',
  supplierAddress: 'PLOT 41B, PHASE 3, INDUSTRIAL AREA, JEDDAH, SAUDI ARABIA',
  trn: '300182764500003',
  phone: '+966 12 699 2411',
  attentionTo: '',
  receiverName: 'MR. ASHRAF ALAMI',
  qcCheckedBy: 'ENG. RAJESH KUMAR',
  items: [
    { id: 'it-1', sn: 1, description: '', size: '', finish: '', unit: '', qty: '' as any, qtyReceived: '' as any, marking: '', microns: '', coatings: '', pitch: '', threads: '', remarks: '', qcNotes: '' }
  ],
  invoiceAmounts: 45000,
  invoicePaid: 32000,
  invoiceDate: '2026-06-01',
  invoiceBalance: 13000,
  invoicePaidBy: 'BANK WIRE',
  invoiceReceivedVia: 'BY ROAD (TRAILER)',
  invoiceAwbNo: 'AWB-IN-88910',
  transportCharges: 1500,
  transportPaidAmount: 1500,
  transportDate: '2026-06-01',
  transportBalanceAmount: 0,
  transportPaymentStatus: 'PAID',
  forkliftOperator: 'JASSEM SINGH',
  forkliftStartTime: '08:00 AM',
  forkliftEndTime: '12:00 PM',
  forkliftTotalHours: 4,
  forkliftCharges: 400,
  forkliftPaidAmount: 400,
  forkliftDate: '2026-06-01',
  forkliftBalanceAmount: 0,
  forkliftPaymentStatus: 'PAID',
  receivedLocation: 'SHED 31'
};

const PRESET_COATING_DO: MaterialDO = {
  id: 'COAT-202',
  type: 'coating',
  invoiceNo: 'INV-COAT-908',
  doNo: 'DO-COAT-662',
  date: '2026-06-01',
  poNo: 'PO-80410',
  dispatchBy: 'COURIER VEHICLE',
  deliveryTerms: 'EX-WORKS',
  madeIn: 'UAE',
  supplierName: 'AJMAN GALVANIZING & COATING L.L.C',
  supplierAddress: 'PLOT 1065, NEW INDUSTRIAL AREA, AJMAN, UAE',
  trn: '100440509600002',
  phone: '+971 6 525 0999',
  attentionTo: '',
  receiverName: 'MR. FAISAL AHMED',
  qcCheckedBy: 'ENG. CHRIS MILLER',
  items: [
    { id: 'cit-1', sn: 1, description: '', size: '', finish: '', unit: '', qty: '' as any, qtyReceived: '' as any, markingVisible: 'YES', adhesionTest: '', threads: '', microns: '', marking: '', remarks: '', qcNotes: '' }
  ],
  invoiceAmounts: 28000,
  invoicePaid: 28000,
  invoiceDate: '2026-06-01',
  invoiceBalance: 0,
  invoicePaidBy: 'CHEQUE',
  invoiceReceivedVia: 'COURIER VEHICLE',
  invoiceAwbNo: 'AWB-IN-77651',
  transportCharges: 600,
  transportPaidAmount: 0,
  transportDate: '2026-06-01',
  transportBalanceAmount: 600,
  transportPaymentStatus: 'UNPAID',
  forkliftOperator: 'K. MOHAMMAD',
  forkliftStartTime: '01:00 PM',
  forkliftEndTime: '03:00 PM',
  forkliftTotalHours: 2,
  forkliftCharges: 200,
  forkliftPaidAmount: 0,
  forkliftDate: '2026-06-01',
  forkliftBalanceAmount: 200,
  forkliftPaymentStatus: 'UNPAID',
  receivedLocation: 'NEW WAREHOUSE AJMAN'
};

export const IncomingMaterialsComponent = () => {
  const activeCompany = getCompanyProfile();
  const isMfi = isMarineFastenersCompany(activeCompany);

  const [logs, setLogs] = useState<MaterialDO[]>(() => {
    const saved = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
    let loadedList: MaterialDO[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loadedList = parsed;
        }
      } catch (e) {}
    }
    // Filter out standard/coating demo preset records
    return loadedList.filter(d => d.id !== 'STD-DEMO-MAY-1' && d.id !== 'COAT-DEMO-MAY-2' && d.id !== 'STD-101' && d.id !== 'COAT-202');
  });

  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'record'>('editor');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Workspace Active Document State
  const [activeDO, setActiveDO] = useState<MaterialDO>(PRESET_STANDARD_DO);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [excelPasteText, setExcelPasteText] = useState<string>('');
  const [pastedRowsHighlight, setPastedRowsHighlight] = useState<{ startRow: number; endRow: number } | null>(null);

  // Customer / Supplier Registry State for GRN
  const [customerSuggestions, setCustomerSuggestions] = useState<Array<{ name: string; address?: string; phone?: string; trn?: string }>>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] = useState(0);

  // Remarks / Page-end Notes dynamic line helpers
  const getNotesLines = useCallback((doc: MaterialDO): string[] => {
    if (doc.notesLines && Array.isArray(doc.notesLines) && doc.notesLines.length > 0) {
      return doc.notesLines;
    }
    const line1 = doc.notesLine1 !== undefined ? doc.notesLine1 : 'All incoming materials received, offloaded, and inspected as per Delivery Advice & Purchase Order terms.';
    const line2 = doc.notesLine2 !== undefined ? doc.notesLine2 : 'Material Test Certificates (MTC), heat numbers, and mill reports verified against shipment markings.';
    const line3 = doc.notesLine3 !== undefined ? doc.notesLine3 : 'Physical quantity count and visual quality inspection completed upon receipt at store premises.';
    const line4 = doc.notesLine4 !== undefined ? doc.notesLine4 : (doc.notes || 'Received materials logged and updated into store inventory records.');
    
    return [line1, line2, line3, line4];
  }, []);

  const handleAddNotesLine = () => {
    const current = getNotesLines(activeDO);
    const updated = [...current, ''];
    setActiveDO(prev => ({
      ...prev,
      notesLines: updated
    }));
    triggerToast('➕ Added new Remark line!');
  };

  const handleUpdateNotesLine = (index: number, value: string) => {
    const current = getNotesLines(activeDO);
    const updated = [...current];
    updated[index] = value;
    setActiveDO(prev => ({
      ...prev,
      notesLines: updated,
      notesLine1: updated[0] !== undefined ? updated[0] : prev.notesLine1,
      notesLine2: updated[1] !== undefined ? updated[1] : prev.notesLine2,
      notesLine3: updated[2] !== undefined ? updated[2] : prev.notesLine3,
      notesLine4: updated[3] !== undefined ? updated[3] : prev.notesLine4,
      notes: updated[3] !== undefined ? updated[3] : prev.notes,
    }));
  };

  const handleRemoveNotesLine = (index: number) => {
    const current = getNotesLines(activeDO);
    if (current.length <= 1) return;
    const updated = current.filter((_, i) => i !== index);
    setActiveDO(prev => ({
      ...prev,
      notesLines: updated
    }));
  };

  useEffect(() => {
    const loadCustomers = () => {
      try {
        const saved = localStorage.getItem('mfi_erp_customers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = parsed.map((c: any) => ({
              name: c.companyName || c.name || '',
              address: [c.address, c.city, c.country].filter(Boolean).join(', ') || c.address || '',
              phone: c.phone || c.mobile || '',
              trn: c.trn || c.vatNo || ''
            })).filter(c => c.name);
            setCustomerSuggestions(list);
            return;
          }
        }
      } catch (e) {}

      setCustomerSuggestions([
        { name: 'AL SHAFAR STEEL STRUCTURES LLC', address: 'DIP 2, DUBAI, UAE', phone: '+971 4 885 1122', trn: '100034129800003' },
        { name: 'NATIONAL CONTRACTING CO LLC', address: 'AL QUSAIZ IND 4, DUBAI, UAE', phone: '+971 4 267 8900', trn: '100289104500003' },
        { name: 'DUBAI METROPOLITAN CONSTRUCTION', address: 'Jebel Ali Free Zone, Dubai, UAE', phone: '+971 4 881 5500', trn: '100554109200003' },
        { name: 'EMIRATES FASTENERS & TRADING', address: 'Industrial Area 13, Sharjah, UAE', phone: '+971 6 534 2211', trn: '100981240100003' },
        { name: 'AJMAN GALVANIZING & COATING L.L.C', address: 'PLOT 1065, NEW INDUSTRIAL AREA, AJMAN, UAE', phone: '+971 6 525 0999', trn: '100440509600002' }
      ]);
    };
    loadCustomers();
  }, []);

  const matchingCustomers = useMemo(() => {
    if (!activeDO.supplierName) return [];
    const query = activeDO.supplierName.trim().toUpperCase();
    if (!query) return [];
    return customerSuggestions.filter(c => c.name.toUpperCase().includes(query));
  }, [customerSuggestions, activeDO.supplierName]);

  const handleSupplierNameChange = (val: string) => {
    const upperVal = val.toUpperCase();
    if (!upperVal.trim()) {
      // IF COMPANY NAME IS REMOVED, REMOVE ADDRESS, PHONE, TRN
      setActiveDO(prev => ({
        ...prev,
        supplierName: '',
        supplierAddress: '',
        phone: '',
        trn: ''
      }));
      setIsCustomerDropdownOpen(false);
      return;
    }

    const match = customerSuggestions.find(c => c.name.toUpperCase() === upperVal.trim());
    if (match) {
      setActiveDO(prev => ({
        ...prev,
        supplierName: match.name,
        supplierAddress: match.address || prev.supplierAddress,
        phone: match.phone || prev.phone,
        trn: match.trn || prev.trn
      }));
    } else {
      setActiveDO(prev => ({
        ...prev,
        supplierName: upperVal
      }));
    }
    setIsCustomerDropdownOpen(true);
    setHighlightedCustomerIndex(0);
  };

  const handleSupplierKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCustomerDropdownOpen && matchingCustomers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedCustomerIndex(prev => (prev + 1) % matchingCustomers.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedCustomerIndex(prev => (prev - 1 + matchingCustomers.length) % matchingCustomers.length);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = matchingCustomers[highlightedCustomerIndex];
        if (selected) {
          setActiveDO(prev => ({
            ...prev,
            supplierName: selected.name,
            supplierAddress: selected.address || '',
            phone: selected.phone || '',
            trn: selected.trn || ''
          }));
        }
        setIsCustomerDropdownOpen(false);
        document.getElementById('grn-field-invoiceNo')?.focus();
        return;
      } else if (e.key === 'Escape') {
        setIsCustomerDropdownOpen(false);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('grn-field-invoiceNo')?.focus();
    }
  };

  // Parse and paste Excel tabular data row-by-row
  const handlePasteExcelData = (rawText: string, targetRowIndex: number = 0, targetColId?: string) => {
    if (!rawText || !rawText.trim()) return;

    // Excel copies rows separated by \n or \r\n, and columns separated by \t
    const lines = rawText.split(/\r?\n/).filter(line => line.length > 0);
    if (lines.length === 0) return;

    const isCoatingDoc = activeDO.type === 'coating';
    const activeCols = isCoatingDoc
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'marking', 'microns', 'coatings', 'pitch', 'threads', 'remarks', 'qcNotes'];

    let startColIndex = 0;
    if (targetColId && activeCols.includes(targetColId)) {
      startColIndex = activeCols.indexOf(targetColId);
    }

    const updatedItems = [...activeDO.items];

    lines.forEach((line, rOffset) => {
      const rowIdx = targetRowIndex + rOffset;
      let cells = line.split('\t');
      // Fallback for CSV line if no tabs present
      if (cells.length === 1 && line.includes(',')) {
        cells = line.split(',');
      }

      if (!updatedItems[rowIdx]) {
        updatedItems[rowIdx] = {
          id: 'it-' + Date.now() + '-' + Math.random() + '-' + rowIdx,
          sn: rowIdx + 1,
          description: '',
          size: '',
          finish: '',
          unit: '',
          qty: '' as any,
          qtyReceived: '' as any,
          marking: '',
          markingVisible: 'YES',
          adhesionTest: 'PASS',
          threads: '',
          microns: '',
          coatings: undefined,
          pitch: undefined,
          remarks: '',
          qcNotes: ''
        };
      }

      const item = { ...updatedItems[rowIdx] };

      cells.forEach((val, cOffset) => {
        const colIdx = startColIndex + cOffset;
        if (colIdx < activeCols.length) {
          const colField = activeCols[colIdx] as keyof MaterialDOItem;
          const cleanVal = val.trim();

          if (colField === 'qty' || colField === 'qtyReceived') {
            const numVal = parseInt(cleanVal.replace(/[^0-9]/g, ''), 10);
            (item as any)[colField] = isNaN(numVal) ? '' : numVal;
          } else {
            (item as any)[colField] = cleanVal.toUpperCase();
          }
        }
      });

      updatedItems[rowIdx] = item;
    });

    const finalItems = updatedItems.map((it, idx) => ({ ...it, sn: idx + 1 }));
    setActiveDO(prev => ({
      ...prev,
      items: finalItems
    }));
    recordItemsHistory(finalItems);

    setPastedRowsHighlight({
      startRow: targetRowIndex,
      endRow: targetRowIndex + lines.length - 1
    });
    setTimeout(() => setPastedRowsHighlight(null), 3500);

    triggerToast(`📋 Excel Paste Success: ${lines.length} row(s) updated!`);
  };

  // Handle direct paste from Excel/Sheets into table inputs
  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>, rowIndex: number, colKey: string) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;
    if (pasteData.includes('\t') || pasteData.includes('\n') || pasteData.includes('\r')) {
      e.preventDefault();
      handlePasteExcelData(pasteData, rowIndex, colKey);
    }
  };

  // Helper to filter out un-typed dummy rows for print / preview
  const getValidPrintItems = (items: MaterialDOItem[]) => {
    const filtered = (items || []).filter(row => {
      const desc = (row.description || '').trim();
      const sz = (row.size || '').trim();
      const fin = (row.finish || '').trim();
      const qty = row.qty || 0;
      const qtyRec = row.qtyReceived !== undefined ? row.qtyReceived : 0;
      const mrk = (row.marking || '').trim();
      const mic = (row.microns || '').trim();
      return desc !== '' || sz !== '' || fin !== '' || qty > 0 || qtyRec > 0 || mrk !== '' || mic !== '';
    });
    if (filtered.length === 0) {
      return [{ id: 'empty-1', sn: 1, description: '', size: '', finish: '', unit: '', qty: 0, qtyReceived: 0, marking: '', microns: '', coatings: '', pitch: '', threads: '', remarks: '', qcNotes: '' }];
    }
    return filtered;
  };

  // Create New Blank GRN
  const handleCreateNewDO = () => {
    const newDoNo = 'DO-' + Math.floor(Math.random() * 90000 + 10000);
    const newInvNo = 'INV-' + Math.floor(Math.random() * 90000 + 10000);
    const newPoNo = 'PO-' + Math.floor(Math.random() * 90000 + 10000);
    const today = new Date().toISOString().substring(0, 10);

    setActiveDO({
      id: 'STD-' + Date.now(),
      type: 'standard',
      invoiceNo: newInvNo,
      doNo: newDoNo,
      date: today,
      poNo: newPoNo,
      dispatchBy: 'BY ROAD (TRAILER)',
      deliveryTerms: 'DDP - DUBAI PORT',
      madeIn: 'UAE',
      supplierName: '',
      supplierAddress: '',
      trn: '',
      phone: '',
      attentionTo: '',
      receiverName: 'MR. ASHRAF ALAMI',
      qcCheckedBy: 'ENG. RAJESH KUMAR',
      items: [
        { id: 'it-' + Date.now() + '-1', sn: 1, description: '', size: '', finish: '', unit: '', qty: '' as any, qtyReceived: '' as any, marking: '', microns: '', coatings: '', pitch: '', threads: '', remarks: '', qcNotes: '' }
      ],
      invoiceAmounts: 0,
      invoicePaid: 0,
      invoiceDate: today,
      invoiceBalance: 0,
      invoicePaidBy: 'BANK WIRE',
      invoiceReceivedVia: 'BY ROAD (TRAILER)',
      invoiceAwbNo: '',
      transportCharges: 0,
      transportPaidAmount: 0,
      transportDate: today,
      transportBalanceAmount: 0,
      transportPaymentStatus: 'UNPAID',
      forkliftOperator: '',
      forkliftStartTime: '',
      forkliftEndTime: '',
      forkliftTotalHours: 0,
      forkliftCharges: 0,
      forkliftPaidAmount: 0,
      forkliftDate: today,
      forkliftBalanceAmount: 0,
      forkliftPaymentStatus: 'UNPAID',
      receivedLocation: 'WAREHOUSE'
    });
    setActiveSubTab('editor');
    triggerToast('⚡ Created New Blank Goods Received Note!');
  };

  // Delete/Clear items handler
  const handleDeleteActiveDO = () => {
    if (window.confirm("Are you sure you want to clear current GRN items?")) {
      const cleared = [
        { id: 'it-' + Date.now() + '-1', sn: 1, description: '', size: '', finish: '', unit: '', qty: '' as any, qtyReceived: '' as any, marking: '', microns: '', coatings: '', pitch: '', threads: '', remarks: '', qcNotes: '' }
      ];
      setActiveDO(prev => ({
        ...prev,
        items: cleared
      }));
      recordItemsHistory(cleared);
      triggerToast("Cleared GRN items!");
    }
  };

  // Sheet font, size & text color state
  const [sheetFont, setSheetFont] = useState<string>('Calibri');
  const [sheetFontSize, setSheetFontSize] = useState<string>('10px');
  const [sheetTextColor, setSheetTextColor] = useState<string>('#000000');

  // Track saved text selection for per-word coloring
  const savedTextSelectionRef = useRef<{ rowIndex: number; field: string; text: string; start?: number; end?: number } | null>(null);

  const captureTextSelection = (e: any, rowIndex: number, field: string) => {
    const target = e.target as HTMLInputElement | HTMLElement;
    let selectedText = '';
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      if (start !== end) {
        selectedText = target.value.substring(start, end).trim();
        if (selectedText) {
          savedTextSelectionRef.current = { rowIndex, field, text: selectedText, start, end };
        }
      }
    } else {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        selectedText = selection.toString().trim();
        if (selectedText) {
          savedTextSelectionRef.current = { rowIndex, field, text: selectedText };
        }
      }
    }
  };

  // History state for Undo / Redo in GRN Sheet
  const [itemsHistory, setItemsHistory] = useState<MaterialDOItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const itemsHistoryRef = useRef<MaterialDOItem[][]>([]);
  const historyIndexRef = useRef<number>(-1);

  useEffect(() => {
    itemsHistoryRef.current = itemsHistory;
  }, [itemsHistory]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Initialize history when activeDO items change from external source or initial load
  useEffect(() => {
    if (activeDO && activeDO.items) {
      const initialSnapshot = JSON.parse(JSON.stringify(activeDO.items));
      setItemsHistory([initialSnapshot]);
      setHistoryIndex(0);
      itemsHistoryRef.current = [initialSnapshot];
      historyIndexRef.current = 0;
    }
  }, [activeDO.id]);

  const recordItemsHistory = (newItems: MaterialDOItem[]) => {
    const snapshot = JSON.parse(JSON.stringify(newItems));
    const currHistory = itemsHistoryRef.current;
    const currIdx = historyIndexRef.current >= 0 ? historyIndexRef.current : currHistory.length - 1;
    
    const sliced = currHistory.slice(0, currIdx + 1);
    const last = sliced[sliced.length - 1];
    
    if (last && JSON.stringify(last) === JSON.stringify(snapshot)) {
      return;
    }
    
    const newHistory = [...sliced, snapshot];
    const newIdx = newHistory.length - 1;
    
    itemsHistoryRef.current = newHistory;
    historyIndexRef.current = newIdx;
    
    setItemsHistory(newHistory);
    setHistoryIndex(newIdx);
  };

  const syncUncommittedEdits = () => {
    if (!activeDO || !activeDO.items) return historyIndexRef.current;
    const currHistory = itemsHistoryRef.current;
    const currIdx = historyIndexRef.current;
    if (currIdx >= 0 && currHistory[currIdx]) {
      const currentStr = JSON.stringify(activeDO.items);
      const historyStr = JSON.stringify(currHistory[currIdx]);
      if (currentStr !== historyStr) {
        recordItemsHistory(activeDO.items);
        return historyIndexRef.current;
      }
    }
    return currIdx;
  };

  const handleUndo = () => {
    const currIdx = syncUncommittedEdits();
    const currHistory = itemsHistoryRef.current;
    
    if (currIdx > 0) {
      const prevIdx = currIdx - 1;
      const prevItems = currHistory[prevIdx];
      
      historyIndexRef.current = prevIdx;
      setHistoryIndex(prevIdx);
      
      if (prevItems) {
        setActiveDO(prev => ({ ...prev, items: JSON.parse(JSON.stringify(prevItems)) }));
        triggerToast('Undo performed');
      }
    } else {
      triggerToast('Nothing to undo');
    }
  };

  const handleRedo = () => {
    const currIdx = historyIndexRef.current;
    const currHistory = itemsHistoryRef.current;
    
    if (currIdx < currHistory.length - 1) {
      const nextIdx = currIdx + 1;
      const nextItems = currHistory[nextIdx];
      
      historyIndexRef.current = nextIdx;
      setHistoryIndex(nextIdx);
      
      if (nextItems) {
        setActiveDO(prev => ({ ...prev, items: JSON.parse(JSON.stringify(nextItems)) }));
        triggerToast('Redo performed');
      }
    } else {
      triggerToast('Nothing to redo');
    }
  };

  // Spreadsheet selection state for Shift + Arrow keys and copying
  const ignoreFocusSelection = useRef<boolean>(false);
  const [selectedCells, setSelectedCells] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null>(null);

  // Global Keydown Listener for ESC to cancel selection & Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCells !== null) {
          setSelectedCells(null);
          triggerToast('Selection cancelled');
        }
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedCells]);

  const isCellSelected = (rIdx: number, col: number | string) => {
    if (!selectedCells) return false;
    const activeCols = isCoating
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'pitch', 'threads', 'remarks', 'qcNotes'];
    
    const cIdx = typeof col === 'string' ? activeCols.indexOf(col) : col;
    if (cIdx === -1) return false;

    const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
    const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
    const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
    const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);
    return rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC;
  };

  const handleCellFocus = (rIdx: number, colId: string) => {
    if (ignoreFocusSelection.current) {
      ignoreFocusSelection.current = false;
      return;
    }
    const activeCols = isCoating
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'pitch', 'threads', 'remarks', 'qcNotes'];
    const cIdx = activeCols.indexOf(colId);
    if (cIdx !== -1) {
      setSelectedCells({
        startRow: rIdx,
        startCol: cIdx,
        endRow: rIdx,
        endCol: cIdx
      });
    }
  };

  // Apply text color to specifically selected words OR selected cells
  const handleApplyTextColor = (colorHex: string) => {
    if (!activeDO || !activeDO.items || activeDO.items.length === 0) return;

    // 1. Check active window selection for a highlighted word/text
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      let containerEl: HTMLElement | null = null;
      let node: Node | null = selection.anchorNode;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).hasAttribute('data-grn-row')) {
          containerEl = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }

      if (!containerEl) {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && activeEl.hasAttribute('data-grn-row')) {
          containerEl = activeEl;
        }
      }

      if (containerEl) {
        const rIdx = parseInt(containerEl.getAttribute('data-grn-row') || '0', 10);
        const colId = containerEl.getAttribute('data-grn-col') || 'description';

        // Exec command to style ONLY the highlighted selection with CSS color
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('foreColor', false, colorHex);

        const newHtml = containerEl.innerHTML;

        const updatedItems = activeDO.items.map((item, idx) => {
          if (idx === rIdx) {
            return { ...item, [colId]: newHtml };
          }
          return item;
        });
        setActiveDO(prev => ({ ...prev, items: updatedItems }));
        recordItemsHistory(updatedItems);
        savedTextSelectionRef.current = null;
        triggerToast(`✓ Applied text color to selection`);
        return;
      }
    }

    // 2. Check saved text selection from input focus or toolbar click
    if (savedTextSelectionRef.current && savedTextSelectionRef.current.text) {
      const { rowIndex, field, start, end, text } = savedTextSelectionRef.current;
      const currentItem = activeDO.items[rowIndex];
      if (currentItem) {
        const val = String((currentItem as any)[field] || '');
        const colorSpan = `<span style="color:${colorHex}">${text}</span>`;
        let newHtml = val;

        if (start !== undefined && end !== undefined && start !== end) {
          const before = val.substring(0, start);
          const after = val.substring(end);
          newHtml = before + colorSpan + after;
        } else if (text && val.includes(text)) {
          newHtml = val.replace(text, colorSpan);
        } else {
          savedTextSelectionRef.current = null;
          return;
        }

        const updatedItems = activeDO.items.map((item, idx) => {
          if (idx === rowIndex) {
            return { ...item, [field]: newHtml };
          }
          return item;
        });
        setActiveDO(prev => ({ ...prev, items: updatedItems }));
        recordItemsHistory(updatedItems);
        savedTextSelectionRef.current = null;
        triggerToast(`✓ Applied text color to word`);
        return;
      }
    }

    // 3. Fall back to cell / cell range color
    const activeCols = isCoating
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'pitch', 'threads', 'remarks', 'qcNotes'];

    let affectedCount = 0;
    const updatedItems = activeDO.items.map((item, rIdx) => {
      let rowChanged = false;
      const newCellColors = { ...(item.cellColors || {}) };

      if (selectedCells) {
        const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
        const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
        const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
        const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);

        if (rIdx >= minR && rIdx <= maxR) {
          for (let c = minC; c <= maxC; c++) {
            const colKey = activeCols[c];
            if (colKey) {
              if (colorHex) {
                newCellColors[colKey] = colorHex;
              } else {
                delete newCellColors[colKey];
              }
              affectedCount++;
              rowChanged = true;
            }
          }
        }
      } else {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && activeEl.getAttribute('data-grn-row') !== null) {
          const rowAttr = parseInt(activeEl.getAttribute('data-grn-row') || '0', 10);
          const colAttr = activeEl.getAttribute('data-grn-col') || '';
          if (rowAttr === rIdx && colAttr) {
            if (colorHex) {
              newCellColors[colAttr] = colorHex;
            } else {
              delete newCellColors[colAttr];
            }
            affectedCount++;
            rowChanged = true;
          }
        }
      }

      return rowChanged ? { ...item, cellColors: newCellColors } : item;
    });

    if (affectedCount === 0) {
      triggerToast("⚡ Click or select word/cell in the table first to apply text color!");
      return;
    }

    setActiveDO(prev => ({ ...prev, items: updatedItems }));
    recordItemsHistory(updatedItems);
    setSheetTextColor(colorHex || '#000000');
    triggerToast(colorHex ? `✓ Applied text color to ${affectedCount} selected cell(s)` : `✓ Reset text color for ${affectedCount} selected cell(s)`);
  };

  // Search & Filter Ledger Database
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'coating'>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<{ id: string; doNo: string } | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');

  // Extended Filter Panel State for Goods Received Notes
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterPoNo, setFilterPoNo] = useState('');
  const [filterReceiver, setFilterReceiver] = useState('');
  const [filterShortageOnly, setFilterShortageOnly] = useState<'all' | 'shortage' | 'no_shortage'>('all');

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterType !== 'all') count++;
    if (selectedMonthFilter !== 'ALL') count++;
    if (filterStartDate) count++;
    if (filterEndDate) count++;
    if (filterSupplier.trim()) count++;
    if (filterPoNo.trim()) count++;
    if (filterReceiver.trim()) count++;
    if (filterShortageOnly !== 'all') count++;
    return count;
  }, [filterType, selectedMonthFilter, filterStartDate, filterEndDate, filterSupplier, filterPoNo, filterReceiver, filterShortageOnly]);

  const handleResetFilters = () => {
    setFilterType('all');
    setSelectedMonthFilter('ALL');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSupplier('');
    setFilterPoNo('');
    setFilterReceiver('');
    setFilterShortageOnly('all');
    setSearchQuery('');
    triggerToast('✓ Cleared all Goods Received Notes filters!');
  };

  // Persist Ledger Logs
  useEffect(() => {
    localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(logs));
  }, [logs]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    const event = new CustomEvent('erp-toast', { detail: msg });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Handle Loading standard Preset
  const handleLoadStandardPreset = () => {
    setActiveDO({
      ...PRESET_STANDARD_DO,
      id: 'STD-' + Date.now(),
      doNo: 'DO-' + Math.floor(Math.random() * 90000 + 10000),
      date: new Date().toISOString().substring(0, 10)
    });
    setActiveSubTab('editor');
    triggerToast('⚡ Loaded Goods Received Note standard layout!');
  };

  // Handle Loading coating Preset
  const handleLoadCoatingPreset = () => {
    setActiveDO({
      ...PRESET_COATING_DO,
      id: 'COAT-' + Date.now(),
      doNo: 'DO-COAT-' + Math.floor(Math.random() * 90000 + 10000),
      date: new Date().toISOString().substring(0, 10)
    });
    setActiveSubTab('editor');
    triggerToast('⚡ Loaded Coating Goods Received Note layout!');
  };

  // Modify individual base doc fields
  const handleUpdateField = (field: keyof Omit<MaterialDO, 'items'>, val: string) => {
    setActiveDO(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleUpdateLogField = (id: string, field: keyof MaterialDO, val: any) => {
    setLogs(prev => prev.map(log => {
      if (log.id === id) {
        const updated = { ...log, [field]: val };
        
        // Auto-calculate invoice balance if invoice amounts or paid changes
        if (field === 'invoiceAmounts' || field === 'invoicePaid') {
          const amt = Number(updated.invoiceAmounts) || 0;
          const paid = Number(updated.invoicePaid) || 0;
          updated.invoiceBalance = amt - paid;
        }

        // Auto-calculate transport payment status and balance if transport charges or paid amount changes
        if (field === 'transportCharges' || field === 'transportPaidAmount') {
          const chg = Number(updated.transportCharges) || 0;
          const paid = Number(updated.transportPaidAmount) || 0;
          updated.transportBalanceAmount = chg - paid;
          updated.transportPaymentStatus = updated.transportBalanceAmount <= 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'UNPAID');
        }

        // Auto-calculate forklift payment status and balance if forklift charges or paid amount changes
        if (field === 'forkliftCharges' || field === 'forkliftPaidAmount') {
          const chg = Number(updated.forkliftCharges) || 0;
          const paid = Number(updated.forkliftPaidAmount) || 0;
          updated.forkliftBalanceAmount = chg - paid;
          updated.forkliftPaymentStatus = updated.forkliftBalanceAmount <= 0 ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'UNPAID');
        }

        return updated;
      }
      return log;
    }));
  };

  const handleIncomingLogKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) => {
    const totalRows = filteredLogsList.length;
    const totalCols = 5;

    const focusIncomingCell = (r: number, c: number) => {
      const el = document.querySelector(`[data-incoming-row="${r}"][data-incoming-col="${c}"]`) as HTMLElement;
      if (el) {
        el.focus();
        if (el instanceof HTMLInputElement) el.select();
      }
    };

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIdx > 0) focusIncomingCell(rowIdx - 1, colIdx);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIdx < totalRows - 1) focusIncomingCell(rowIdx + 1, colIdx);
    } else if (e.key === 'ArrowLeft') {
      const target = e.target as any;
      let atStart = true;
      try {
        if (target.tagName === 'INPUT' && target.type === 'text') {
          atStart = target.selectionStart === 0;
        }
      } catch (err) {
        atStart = true;
      }
      if (atStart) {
        e.preventDefault();
        if (colIdx > 0) focusIncomingCell(rowIdx, colIdx - 1);
        else if (rowIdx > 0) focusIncomingCell(rowIdx - 1, totalCols - 1);
      }
    } else if (e.key === 'ArrowRight') {
      const target = e.target as any;
      let atEnd = true;
      try {
        if (target.tagName === 'INPUT' && target.type === 'text') {
          atEnd = target.selectionEnd === (target.value || '').length;
        }
      } catch (err) {
        atEnd = true;
      }
      if (atEnd) {
        e.preventDefault();
        if (colIdx < totalCols - 1) focusIncomingCell(rowIdx, colIdx + 1);
        else if (rowIdx < totalRows - 1) focusIncomingCell(rowIdx + 1, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (colIdx < totalCols - 1) focusIncomingCell(rowIdx, colIdx + 1);
      else if (rowIdx < totalRows - 1) focusIncomingCell(rowIdx + 1, 0);
    }
  };

  // Modify rows within doc view
  const handleUpdateItemField = (rowId: string, field: keyof MaterialDOItem, val: any) => {
    setActiveDO(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === rowId ? { ...it, [field]: val } : it)
    }));
  };

  const focusCell = (rIdx: number, cId: string) => {
    let attempts = 0;
    const tryFocus = () => {
      const el = document.querySelector(`[data-grn-row="${rIdx}"][data-grn-col="${cId}"]`) as HTMLInputElement | null;
      if (el) {
        el.focus();
        if ('select' in el) {
          el.select();
        }
      } else if (attempts < 15) {
        attempts++;
        setTimeout(tryFocus, 20);
      }
    };
    setTimeout(tryFocus, 20);
  };

  const handleExcelKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colId: string
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedCells(null);
      triggerToast('Selection cancelled');
      return;
    }

    const isCoating = activeDO.type === 'coating';
    const activeCols = isCoating
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'shortage', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'pitch', 'threads', 'remarks', 'qcNotes'];

    const colIndex = activeCols.indexOf(colId);
    const currentItem = activeDO.items[rowIndex];
    const targetEl = (e.currentTarget || e.target) as HTMLInputElement;
    const currentDesc = colId === 'description' && targetEl
      ? (targetEl.value || targetEl.textContent || '').trim()
      : (currentItem?.description || '').trim();
    const isDescriptionEmpty = !currentItem || currentDesc === '';

    // RULE: IF DOESNT HAVE ANY DATA IN DESCRIPTION DONT MOVE NEXT COLUMN.
    if (colId === 'description' && isDescriptionEmpty) {
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        triggerToast('Please enter Material Description before moving to the next column!');
        focusCell(rowIndex, 'description');
        return;
      }
    }

    // Fill Down on Ctrl+D / Cmd+D
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      const updatedItems = [...activeDO.items];

      if (selectedCells) {
        const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
        const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
        const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
        const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);

        if (minR === maxR && minR > 0) {
          // Copy from previous row for the selected column(s)
          for (let c = minC; c <= maxC; c++) {
            const colKey = activeCols[c] as keyof MaterialDOItem;
            if (colKey && (colKey as string) !== 'sn' && (colKey as string) !== 'shortage') {
              (updatedItems[minR] as any)[colKey] = (updatedItems[minR - 1] as any)?.[colKey] ?? '';
            }
          }
          triggerToast(`Filled down column(s) from Row ${minR} to Row ${minR + 1}!`);
        } else if (maxR > minR) {
          // Fill down from top row of selection (minR) to all rows below (minR+1..maxR)
          for (let r = minR + 1; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              const colKey = activeCols[c] as keyof MaterialDOItem;
              if (colKey && (colKey as string) !== 'sn' && (colKey as string) !== 'shortage') {
                (updatedItems[r] as any)[colKey] = (updatedItems[minR] as any)?.[colKey] ?? '';
              }
            }
          }
          triggerToast(`Filled down from Row ${minR + 1} to Row ${maxR + 1}!`);
        }
      } else if (rowIndex > 0) {
        // Single cell fill down from cell above
        const colKey = colId as keyof MaterialDOItem;
        if (colKey && (colKey as string) !== 'sn' && (colKey as string) !== 'shortage') {
          (updatedItems[rowIndex] as any)[colKey] = (updatedItems[rowIndex - 1] as any)?.[colKey] ?? '';
          triggerToast(`Filled down ${colId} from upper row!`);
        }
      }

      setActiveDO(prev => ({ ...prev, items: updatedItems }));
      recordItemsHistory(updatedItems);
      return;
    }

    // Clear selected cells on Delete / Backspace when range is highlighted
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCells) {
      e.preventDefault();
      const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
      const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
      const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
      const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);

      const updatedItems = activeDO.items.map((it, r) => {
        if (r >= minR && r <= maxR) {
          const newItem = { ...it };
          for (let c = minC; c <= maxC; c++) {
            const colKey = activeCols[c] as keyof MaterialDOItem;
            if (colKey && (colKey as string) !== 'sn' && (colKey as string) !== 'shortage') {
              (newItem as any)[colKey] = '';
            }
          }
          return newItem;
        }
        return it;
      });
      setActiveDO(prev => ({ ...prev, items: updatedItems }));
      recordItemsHistory(updatedItems);
      triggerToast('Cleared selected cell values');
      return;
    }

    // Ctrl + C / Cmd + C Copy selected cells or active cell (supports multi-column 3-4 column selection)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      const hasMultiCellSelection = selectedCells && (
        selectedCells.startRow !== selectedCells.endRow ||
        selectedCells.startCol !== selectedCells.endCol
      );

      const target = e.target as HTMLInputElement;
      if (!hasMultiCellSelection && target && target.selectionStart !== target.selectionEnd) {
        return; // Allow native text copy if text is highlighted inside input
      }
      e.preventDefault();
      let copyVal = '';
      if (selectedCells) {
        const minR = Math.min(selectedCells.startRow, selectedCells.endRow);
        const maxR = Math.max(selectedCells.startRow, selectedCells.endRow);
        const minC = Math.min(selectedCells.startCol, selectedCells.endCol);
        const maxC = Math.max(selectedCells.startCol, selectedCells.endCol);
        const rowLines: string[] = [];
        for (let r = minR; r <= maxR; r++) {
          const it = activeDO.items[r];
          if (!it) continue;
          const cVals: string[] = [];
          for (let c = minC; c <= maxC; c++) {
            cVals.push(String(it[activeCols[c] as keyof MaterialDOItem] ?? ''));
          }
          rowLines.push(cVals.join('\t'));
        }
        copyVal = rowLines.join('\n');
      } else if (currentItem) {
        copyVal = String(currentItem[colId as keyof MaterialDOItem] ?? '');
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
        triggerToast('Copied cell data to clipboard!');
      }
      return;
    }

    // Shift + Arrow range selection like Excel / Sales UI
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let endR = selectedCells?.endRow ?? rowIndex;
      let endC = selectedCells?.endCol ?? colIndex;

      if (e.key === 'ArrowUp') endR = Math.max(0, endR - 1);
      if (e.key === 'ArrowDown') endR = Math.min(activeDO.items.length - 1, endR + 1);
      if (e.key === 'ArrowLeft') endC = Math.max(0, endC - 1);
      if (e.key === 'ArrowRight') endC = Math.min(activeCols.length - 1, endC + 1);

      setSelectedCells({
        startRow: selectedCells?.startRow ?? rowIndex,
        startCol: selectedCells?.startCol ?? colIndex,
        endRow: endR,
        endCol: endC
      });

      ignoreFocusSelection.current = true;
      focusCell(endR, activeCols[endC]);
      return;
    }

    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      e.preventDefault();

      if (e.shiftKey) {
        // Shift + Enter: Move left or to previous row
        if (colIndex > 0) {
          focusCell(rowIndex, activeCols[colIndex - 1]);
        } else if (rowIndex > 0) {
          focusCell(rowIndex - 1, activeCols[activeCols.length - 1]);
        }
        return;
      }

      if (colIndex < activeCols.length - 1) {
        // Move to the next column on the right
        focusCell(rowIndex, activeCols[colIndex + 1]);
      } else {
        // End of row reached: move to the next row's first column
        if (rowIndex < activeDO.items.length - 1) {
          focusCell(rowIndex + 1, activeCols[0]);
        } else {
          // Last row, last column: automatically append new row and focus first cell of that new row
          const sn = activeDO.items.length + 1;
          const newItem: MaterialDOItem = {
            id: 'it-' + Date.now() + '-' + Math.random(),
            sn,
            description: '',
            size: '',
            finish: '',
            unit: '',
            qty: '' as any,
            qtyReceived: '' as any,
            marking: '',
            markingVisible: '',
            adhesionTest: '',
            threads: '',
            microns: '',
            coatings: '',
            pitch: '',
            remarks: '',
            qcNotes: ''
          };
          const updatedWithNew = [...activeDO.items, newItem];
          setActiveDO(prev => ({
            ...prev,
            items: updatedWithNew
          }));
          recordItemsHistory(updatedWithNew);

          focusCell(rowIndex + 1, activeCols[0]);
          triggerToast(`Automatically appended Item Row ${sn}!`);
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(rowIndex - 1, colId);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(rowIndex + 1, colId);
    } else if (e.key === 'ArrowLeft') {
      let cursorAtStart = true;
      try {
        if ('selectionStart' in e.currentTarget && e.currentTarget.selectionStart !== null) {
          cursorAtStart = e.currentTarget.selectionStart === 0;
        }
      } catch (err) {
        cursorAtStart = true;
      }
      if (cursorAtStart && colIndex > 0) {
        e.preventDefault();
        focusCell(rowIndex, activeCols[colIndex - 1]);
      } else if (cursorAtStart && colIndex === 0 && rowIndex > 0) {
        e.preventDefault();
        focusCell(rowIndex - 1, activeCols[activeCols.length - 1]);
      }
    } else if (e.key === 'ArrowRight') {
      let cursorAtEnd = true;
      try {
        if ('selectionEnd' in e.currentTarget && e.currentTarget.selectionEnd !== null) {
          cursorAtEnd = e.currentTarget.selectionEnd === (e.currentTarget.value || '').length;
        }
      } catch (err) {
        cursorAtEnd = true;
      }
      if (cursorAtEnd && colIndex < activeCols.length - 1) {
        e.preventDefault();
        focusCell(rowIndex, activeCols[colIndex + 1]);
      } else if (cursorAtEnd && colIndex === activeCols.length - 1 && rowIndex < activeDO.items.length - 1) {
        e.preventDefault();
        focusCell(rowIndex + 1, activeCols[0]);
      }
    }
  };

  const handleAppendRow = () => {
    const sn = activeDO.items.length + 1;
    
    const newItem: MaterialDOItem = {
      id: 'it-' + Date.now() + '-' + Math.random(),
      sn,
      description: '',
      size: '',
      finish: '',
      unit: '',
      qty: '' as any,
      qtyReceived: '' as any,
      marking: '',
      markingVisible: 'YES',
      adhesionTest: undefined,
      threads: '',
      microns: '',
      coatings: undefined,
      pitch: undefined,
      remarks: '',
      qcNotes: ''
    };
    const updated = [...activeDO.items, newItem];
    setActiveDO(prev => ({ ...prev, items: updated }));
    recordItemsHistory(updated);
    triggerToast('Appended receiving material line row!');
  };

  const handleRemoveRow = (rowId: string) => {
    if (activeDO.items.length <= 1) {
      alert('Must maintain at least 1 receiving material row!');
      return;
    }
    const updated = activeDO.items
      .filter(it => it.id !== rowId)
      .map((it, idx) => ({ ...it, sn: idx + 1 }));
    setActiveDO(prev => ({ ...prev, items: updated }));
    recordItemsHistory(updated);
    triggerToast('Removed row item.');
  };

  const handleSaveActiveDO = () => {
    if (!activeDO.doNo.trim()) {
      alert('Please fill out DO NO block identifier!');
      return;
    }
    setLogs(prev => {
      // Avoid duplicates
      const filtered = prev.filter(l => l.doNo !== activeDO.doNo);
      return [activeDO, ...filtered];
    });
    triggerToast(`💾 Saved Document ${activeDO.doNo} to Goods Received Note Records successfully!`);
    
    // Auto shift user input focus to incoming records page immediately
    setActiveSubTab('record');
  };

  const handleDeleteDO = (id: string, doNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId({ id, doNo });
  };

  const handleLoadFromLedger = (doc: MaterialDO) => {
    setActiveDO(doc);
    setActiveSubTab('editor');
    triggerToast(`Loaded DO ${doc.doNo} for interactive modifications.`);
  };

  const handleSaveGRNRegistryAsPdf = () => {
    const finalLogs = filteredLogsList;

    if (finalLogs.length === 0) {
      triggerToast("⚠️ No Goods Received Notes available to print under current filters!");
      return;
    }

    const stdCount = finalLogs.filter(l => (l.type || 'standard') === 'standard').length;
    const coatCount = finalLogs.filter(l => l.type === 'coating').length;
    const shortageCount = finalLogs.filter(l => (l.items || []).some(it => {
      const q = typeof it.qty === 'number' ? it.qty : parseInt(it.qty || '0', 10) || 0;
      const qr = typeof it.qtyReceived === 'number' ? it.qtyReceived : parseInt(it.qtyReceived || '0', 10) || 0;
      return q > qr;
    })).length;

    const activeFilterLabels = [];
    if (filterType !== 'all') activeFilterLabels.push(`CATEGORY: ${filterType.toUpperCase()}`);
    if (selectedMonthFilter !== 'ALL') activeFilterLabels.push(`MONTH: ${selectedMonthFilter}`);
    if (filterStartDate || filterEndDate) activeFilterLabels.push(`DATES: ${filterStartDate || 'ANY'} TO ${filterEndDate || 'ANY'}`);
    if (filterSupplier) activeFilterLabels.push(`SUPPLIER: "${filterSupplier.toUpperCase()}"`);
    if (filterPoNo) activeFilterLabels.push(`PO: "${filterPoNo.toUpperCase()}"`);
    if (filterReceiver) activeFilterLabels.push(`RECEIVER: "${filterReceiver.toUpperCase()}"`);
    if (filterShortageOnly !== 'all') activeFilterLabels.push(`SHORTAGE: ${filterShortageOnly.toUpperCase()}`);
    if (searchQuery) activeFilterLabels.push(`SEARCH: "${searchQuery.toUpperCase()}"`);

    const filterSummaryText = activeFilterLabels.length > 0
      ? activeFilterLabels.join(' | ')
      : 'ALL RECORDS (UNFILTERED MASTER REGISTER)';

    const rowsHtml = finalLogs.map((log, idx) => {
      const hasShortage = (log.items || []).some(it => {
        const q = typeof it.qty === 'number' ? it.qty : parseInt(it.qty || '0', 10) || 0;
        const qr = typeof it.qtyReceived === 'number' ? it.qtyReceived : parseInt(it.qtyReceived || '0', 10) || 0;
        return q > qr;
      });

      return `
        <tr style="border-bottom: 1px solid #000000; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; height: 30px; font-size: 9.5px; font-family: 'Calibri', 'Arial', sans-serif;">
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; border-left: 1px solid #000000; font-weight: bold;">
            ${idx + 1}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-weight: bold; font-family: monospace; color: #000000;">
            ${log.doNo || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000;">
            ${log.date || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-family: monospace;">
            ${log.invoiceNo || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-family: monospace;">
            ${log.poNo || '—'}
          </td>
          <td style="padding: 4px; text-align: left; padding-left: 6px; border-right: 1px solid #000000; text-transform: uppercase; font-weight: 600;">
            ${log.supplierName || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; text-transform: uppercase;">
            ${log.receiverName || 'STORE STAFF'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-weight: bold; color: ${hasShortage ? '#dc2626' : '#000000'};">
            ${hasShortage ? 'SHORTAGE' : 'OK'}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inbound Goods Received Notes Register</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 10mm 12mm 10mm;
            }
            body {
              font-family: 'Calibri', 'Arial', sans-serif;
              padding: 0;
              color: #000000;
              background-color: #ffffff;
              margin: 0;
              font-size: 10px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              display: flex;
              flex-direction: column;
              min-height: 260mm;
              justify-content: space-between;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              border-bottom: 2px solid #000000;
              margin-bottom: 8px;
              padding-bottom: 6px;
            }
            .company-title {
              font-size: 18px;
              font-weight: 900;
              text-transform: uppercase;
              color: #000000;
              letter-spacing: 0.5px;
            }
            .company-sub {
              font-size: 9.5px;
              color: #333333;
              font-weight: 600;
            }
            .doc-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              color: #000000;
              background-color: #f1f5f9;
              border: 1px solid #000000;
              padding: 6px;
              text-align: center;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .filter-info {
              font-size: 8.5px;
              font-weight: bold;
              text-transform: uppercase;
              color: #333333;
              margin-bottom: 8px;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #000000 !important;
              margin-bottom: 0px;
            }
            .ledger-table th {
              background-color: #f1f5f9 !important;
              color: #000000 !important;
              font-size: 10px !important;
              font-weight: 800 !important;
              text-transform: uppercase;
              padding: 5px 3px !important;
              text-align: center;
              border: 1px solid #000000 !important;
              white-space: nowrap !important;
              word-break: normal !important;
            }
            .summary-bar {
              border: 1.5px solid #000000;
              border-top: none;
              background-color: #f8fafc;
              padding: 6px 10px;
              font-size: 9px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-bottom: 16px;
              text-transform: uppercase;
            }
            .signatures-grid {
              display: table;
              width: 100%;
              margin-top: auto !important;
              padding-top: 80px !important;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .sig-col {
              display: table-cell;
              width: 33.33%;
              text-align: center;
              vertical-align: top;
            }
            .sig-line {
              width: 75%;
              margin: 0 auto 4px auto;
              border-top: 1px solid #000000;
              padding-top: 4px;
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .footer-note {
              margin-top: 20px;
              padding-top: 6px;
              border-top: 1px solid #cbd5e1;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <!-- Company Header -->
          <table class="header-table">
            <tr>
              <td style="text-align: left; vertical-align: middle;">
                <div class="company-title">MARINE FASTENERS INDUSTRIES L.L.C</div>
                <div class="company-sub">Industrial Area, P.O. Box 1065, Ajman, United Arab Emirates</div>
                <div class="company-sub">Telephone: +971 6 525 0526 &nbsp;|&nbsp; TRN: 100440509600003</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 11px; font-weight: bold; color: #000000;">GRN REGISTER</div>
                <div style="font-size: 9px; color: #555555;">Inbound Receiving Register</div>
                <div style="font-size: 9px; color: #555555;">Date: ${new Date().toLocaleDateString('en-GB')}</div>
              </td>
            </tr>
          </table>

          <!-- Document Title -->
          <div class="doc-title">
            INBOUND GOODS RECEIVED NOTES (GRN) REGISTER
          </div>

          <!-- Filter Criteria Info -->
          <div class="filter-info">
            FILTER / SELECTION: ${filterSummaryText}
          </div>

          <!-- Master Register Table -->
          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 4%;">S.N</th>
                <th style="width: 16%;">GRN NO.</th>
                <th style="width: 12%;">GRN DATE</th>
                <th style="width: 14%;">INVOICE NO.</th>
                <th style="width: 14%;">PO NO.</th>
                <th style="width: 18%; text-align: left; padding-left: 6px;">SUPPLIER NAME</th>
                <th style="width: 12%;">RECEIVED BY</th>
                <th style="width: 10%;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- Summary Bar -->
          <div class="summary-bar">
            <span>TOTAL REGISTERED GRNS: ${finalLogs.length}</span>
            <span>STANDARD: ${stdCount}</span>
            <span>COATING: ${coatCount}</span>
            <span>SHORTAGES FLAGGED: ${shortageCount}</span>
          </div>

          <!-- Signatures Section -->
          <div class="signatures-grid" style="margin-top: auto; padding-top: 80px; margin-bottom: 20px;">
            <div class="sig-col">
              <div class="sig-line">PREPARED BY</div>
              <div style="font-size: 8.5px; color: #555555;">Receiving Store Staff</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">CHECKED BY</div>
              <div style="font-size: 8.5px; color: #555555;">QC Inspector</div>
            </div>
            <div class="sig-col">
              <div class="sig-line">APPROVED BY</div>
              <div style="font-size: 8.5px; color: #555555;">Store Manager / Director</div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(htmlContent, 'Official Goods Received Notes Register');
  };

  const handleSaveDOAsPDF = (doc: MaterialDO) => {
    const isCoatingDoc = doc.type === 'coating';
    const titleLabel = isCoatingDoc ? 'COATING GOODS RECEIVED NOTE' : 'GOODS RECEIVED NOTE';

    const getValidPrintItemsInternal = (items: MaterialDOItem[], minCount = 12) => {
      const valid = (items || []).filter(it =>
        (it.description && it.description.trim() !== '') ||
        (it.size && it.size.trim() !== '') ||
        (it.qty !== undefined && it.qty !== null && (it.qty as any) !== '' && Number(it.qty) > 0)
      );
      const result = [...valid];
      while (result.length < minCount) {
        result.push({
          id: `blank-${result.length + 1}`,
          sn: result.length + 1,
          description: '',
          size: '',
          finish: '',
          unit: '',
          qty: undefined,
          qtyReceived: undefined,
          marking: '',
          markingVisible: '',
          adhesionTest: '',
          threads: '',
          microns: '',
          coatings: '',
          remarks: '',
          qcNotes: ''
        } as any);
      }
      return result;
    };

    const ITEMS_PER_PAGE = 12;
    const printItems = getValidPrintItemsInternal(doc.items, 12);
    const totalPages = Math.max(1, Math.ceil(printItems.length / ITEMS_PER_PAGE));
    const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
      const pageItems = printItems.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
      const isLastPage = pIdx === totalPages - 1;
      return { pageNum: pIdx + 1, pageItems, isLastPage };
    });

    const renderRowHtml = (row: MaterialDOItem) => {
      const cleanVal = (val: any) => {
        if (val === null || val === undefined) return '';
        const s = String(val).replace(/&nbsp;/g, ' ').trim();
        if (s === '—' || s === '0' || s === '0.00' || s === '0 0 0' || s === '0.0') return '';
        return s;
      };

      const formatQty = (val: any) => {
        if (val === undefined || val === null || (val as any) === '') return '';
        const num = Number(val);
        if (isNaN(num) || num === 0) return '';
        return String(num);
      };

      const qOrdered = formatQty(row.qty);
      const qDelivered = formatQty(row.qtyReceived);
      const shortageNum = (typeof row.qty === 'number' && typeof row.qtyReceived === 'number')
        ? Math.max(0, row.qty - row.qtyReceived)
        : 0;
      const shortage = shortageNum > 0 ? String(shortageNum) : '';
      const shortageBgColor = shortageNum > 0 ? '#fef2f2' : '#ffffff';
      const shortageTextColor = shortageNum > 0 ? '#dc2626' : '#000000';

      if (isCoatingDoc) {
        return `
          <tr style="border-bottom: 1.5px solid #000000; height: 19px; font-size: 9px; font-family: Arial, sans-serif !important; line-height: 1.1;">
            <td style="text-align: center; font-weight: bold; border-left: 2px solid #000000; border-right: 1px solid #000000; padding: 1.5px 2px;">${row.sn}</td>
            <td style="text-align: left; padding-left: 6px; font-weight: bold; color: #000000; border-right: 1px solid #000000; text-transform: uppercase;">${cleanVal(row.description)}</td>
            <td style="text-align: center; font-weight: bold; color: #000000; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.size)}</td>
            <td style="text-align: center; font-weight: bold; color: #000000; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.finish)}</td>
            <td style="text-align: center; border-right: 1px solid #000000; font-weight: bold; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.unit)}</td>
            <td style="text-align: center; color: #0c449e; font-weight: 800; border-right: 1px solid #000000; padding: 1.5px 2px;">${qOrdered}</td>
            <td style="text-align: center; color: #0d9488; font-weight: 800; border-right: 1px solid #000000; padding: 1.5px 2px;">${qDelivered}</td>
            <td style="text-align: center; color: ${shortageTextColor}; font-weight: 800; border-right: 1px solid #000000; background-color: ${shortageBgColor}; padding: 1.5px 2px;">${shortage}</td>
            <td style="text-align: center; color: #0c449e; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.markingType)}</td>
            <td style="text-align: center; color: #0c449e; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.markingVisible) || (cleanVal(row.description) ? 'YES' : '')}</td>
            <td style="text-align: center; color: #0c449e; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.adhesionTest)}</td>
            <td style="text-align: center; color: #0c449e; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.threads)}</td>
            <td style="text-align: center; color: #0c449e; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.microns)}</td>
            <td style="text-align: center; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.remarks)}</td>
            <td style="text-align: left; padding-left: 4px; color: #065f46; font-weight: 500; text-transform: uppercase; border-right: 2px solid #000000; padding: 1.5px 2px;">${cleanVal(row.qcNotes)}</td>
          </tr>
        `;
      } else {
        return `
          <tr style="border-bottom: 1.5px solid #000000; height: 19px; font-size: 9px; font-family: Arial, sans-serif !important; line-height: 1.1;">
            <td style="text-align: center; font-weight: bold; border-left: 2px solid #000000; border-right: 1px solid #000000; padding: 1.5px 2px;">${row.sn}</td>
            <td style="text-align: left; padding-left: 6px; font-weight: bold; color: #000000; border-right: 1px solid #000000; text-transform: uppercase;">${cleanVal(row.description)}</td>
            <td style="text-align: center; font-weight: bold; color: #000000; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.size)}</td>
            <td style="text-align: center; font-weight: bold; color: #000000; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.finish)}</td>
            <td style="text-align: center; border-right: 1px solid #000000; font-weight: bold; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.unit)}</td>
            <td style="text-align: center; color: #0c449e; font-weight: 800; border-right: 1px solid #000000; padding: 1.5px 2px;">${qOrdered}</td>
            <td style="text-align: center; color: #0d9488; font-weight: 800; border-right: 1px solid #000000; padding: 1.5px 2px;">${qDelivered}</td>
            <td style="text-align: center; color: ${shortageTextColor}; font-weight: 800; border-right: 1px solid #000000; background-color: ${shortageBgColor}; padding: 1.5px 2px;">${shortage}</td>
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.marking) || (cleanVal(row.description) ? 'VISIBLE' : '')}</td>
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.markingType)}</td>
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.markingVisible)}</td>
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.microns)}</td>
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.coatings)}</td>
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.threads)}</td>
            <td style="text-align: center; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${cleanVal(row.remarks)}</td>
            <td style="text-align: left; padding-left: 4px; color: #065f46; font-weight: 500; text-transform: uppercase; border-right: 2px solid #000000; padding: 1.5px 2px;">${cleanVal(row.qcNotes)}</td>
          </tr>
        `;
      }
    };

    const thStyle = "font-family: Arial, sans-serif !important; font-size: 8.5px; font-weight: 800 !important; letter-spacing: 0px; border-top: 2px solid #000000; border-bottom: 2px solid #000000; border-right: 1px solid #000000; color: #000000; padding: 4px 1px; line-height: 1.15; text-transform: uppercase; text-align: center; word-break: normal; white-space: normal;";

    const headersHtml = isCoatingDoc ? `
      <tr style="background-color: #f8fafc; height: 28px;">
        <th style="${thStyle} width: 3.5%; border-left: 2px solid #000000;">S.N</th>
        <th style="${thStyle} width: 11%; text-align: left; padding-left: 6px;">DESCRIPTION</th>
        <th style="${thStyle} width: 7%;">SIZE</th>
        <th style="${thStyle} width: 5%;">FINISH</th>
        <th style="${thStyle} width: 4.5%;">UNIT</th>
        <th style="${thStyle} width: 6.5%;">QTY ORDERED</th>
        <th style="${thStyle} width: 6.5%;">QTY DELIVERED</th>
        <th style="${thStyle} width: 5.5%;">SHORTAGE</th>
        <th style="${thStyle} width: 7%;">MARKING TYPE</th>
        <th style="${thStyle} width: 7.5%;">MARKING VISIBLE</th>
        <th style="${thStyle} width: 6%;">ADHESION</th>
        <th style="${thStyle} width: 6%;">THREADS</th>
        <th style="${thStyle} width: 5.5%;">MICRONS</th>
        <th style="${thStyle} width: 7.5%;">FREE-RUNNING FIT TEST</th>
        <th style="${thStyle} width: 16%; border-right: 2px solid #000000;">QC NOTES</th>
      </tr>
    ` : `
      <tr style="background-color: #f8fafc; height: 28px;">
        <th style="${thStyle} width: 3.5%; border-left: 2px solid #000000;">S.N</th>
        <th style="${thStyle} width: 11%; text-align: left; padding-left: 6px;">DESCRIPTION</th>
        <th style="${thStyle} width: 7%;">SIZE</th>
        <th style="${thStyle} width: 5%;">FINISH</th>
        <th style="${thStyle} width: 4.5%;">UNIT</th>
        <th style="${thStyle} width: 6.5%;">QTY ORDERED</th>
        <th style="${thStyle} width: 6.5%;">QTY DELIVERED</th>
        <th style="${thStyle} width: 5.5%;">SHORTAGE</th>
        <th style="${thStyle} width: 6.5%;">MARKING</th>
        <th style="${thStyle} width: 6.5%;">MARKING TYPE</th>
        <th style="${thStyle} width: 7%;">MARKING VISIBLE</th>
        <th style="${thStyle} width: 5%;">MICRONS</th>
        <th style="${thStyle} width: 5.5%;">COATINGS</th>
        <th style="${thStyle} width: 5.5%;">THREADS</th>
        <th style="${thStyle} width: 7.5%;">FREE-RUNNING FIT TEST</th>
        <th style="${thStyle} width: 12.5%; border-right: 2px solid #000000;">QC NOTES</th>
      </tr>
    `;

    const currentComp = getCompanyProfile();
    const isMfiComp = isMarineFastenersCompany(currentComp);
    const deliverToCompName = isMfiComp ? 'MARINE FASTENERS INDUSTRIES LLC' : (doc.deliverToName || currentComp.name);
    const deliverToCompAddr = isMfiComp ? 'Industrial Area, Ajman, UAE' : (doc.deliverToAddress || (currentComp.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', '));
    const deliverToCompPhone = isMfiComp ? '+971 6 525 0526' : (doc.deliverToPhone || currentComp.phone || '—');
    const deliverToCompTrn = isMfiComp ? '100440509600003' : (doc.deliverToTrn !== undefined ? doc.deliverToTrn : currentComp.trn);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titleLabel} - ${doc.doNo}</title>
          <style>
            @page {
              size: landscape;
              margin: 4mm !important;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000000;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 10px;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .report-page {
              padding: 5mm 7mm !important;
              box-sizing: border-box !important;
              page-break-after: always;
              break-after: page;
              page-break-inside: avoid;
              break-inside: avoid;
              max-width: 100% !important;
              min-height: 195mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: none !important;
              border-radius: 2px;
              background: #ffffff;
            }
            .deliver-to-title {
              font-size: 11px;
              font-weight: 900;
              color: #000000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            .title-box {
              border: 2px solid #000000;
              padding: 4px 12px;
              background-color: #ffffff;
            }
            .title-text {
              font-size: 13px;
              font-weight: 900;
              color: #000000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company-name {
              font-size: 13px;
              font-weight: 900;
              color: #000000;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              border: none !important;
            }
            .items-table th, .items-table td {
              border: 1px solid #000000;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 16px;
              margin-top: auto !important;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .sig-box {
              border: 1.5px solid #000000;
              border-radius: 0px;
              padding: 6px 10px;
              background-color: #ffffff;
              text-align: left;
            }
            .sig-box-title {
              font-size: 9px;
              font-weight: 900;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 6px;
              border-bottom: 1px solid #000000;
              padding-bottom: 2px;
            }
            .sig-line {
              border-bottom: 1px dashed #000000;
              margin-top: 16px;
              height: 1px;
            }

            @media print {
              html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
              .report-page { page-break-after: always; break-after: page; page-break-inside: avoid; break-inside: avoid; }
              .report-page:last-child { page-break-after: avoid; break-after: avoid; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0;">
                <thead>
                  <tr style="border: none; background: #ffffff;">
                    <td colspan="${isCoatingDoc ? 15 : 16}" style="padding: 0 0 6px 0; border: none; text-align: left; background: #ffffff;">
                      <!-- Top Company Header (Repeats on Every Page) -->
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
                        <tr>
                          <td style="width: 50%; vertical-align: top; border: none; padding: 0; text-align: left;">
                            <div class="deliver-to-title">RECEIVED FROM (SUPPLIER / VENDOR):</div>
                            <div style="font-weight: 900; font-size: 13px; text-transform: uppercase;">${doc.supplierName || '—'}</div>
                            <div style="font-size: 10.5px; margin-top: 2px;">${doc.supplierAddress || '—'}</div>
                            <div style="font-size: 10.5px; margin-top: 2px;">Telephone: ${doc.phone || '—'}</div>
                            <div style="font-size: 10.5px; font-weight: bold; margin-top: 2px;">TRN: ${doc.trn || '—'}</div>
                          </td>
                          <td style="width: 50%; vertical-align: top; text-align: right; border: none; padding: 0;">
                            <div class="title-box" style="display: inline-block;">
                              <div class="title-text">${titleLabel}</div>
                            </div>
                            <div style="font-size: 10px; font-weight: bold; margin-top: 4px; color: #000;">
                              PAGE ${p.pageNum} OF ${totalPages}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Subheader Bar -->
                      <table style="width: 100%; border-collapse: collapse; border-top: 1.5px solid #000000; border-bottom: 1.5px solid #000000; margin-bottom: 8px;">
                        <tr>
                          <td style="text-align: left; font-weight: bold; font-size: 11px; padding: 4px 8px; border: none;">GRN NO: <span style="color: #dc2626;">${doc.doNo || ''}</span></td>
                          <td style="text-align: right; font-weight: bold; font-size: 11px; padding: 4px 8px; border: none;">GRN DATE: ${doc.date || ''}</td>
                        </tr>
                      </table>

                      <!-- Details Table -->
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                        <tr>
                          <td style="width: 50%; vertical-align: top; border: none; padding: 0 10px 0 0; text-align: left;">
                            <div class="deliver-to-title">DELIVERED TO / LOCATION:</div>
                            <div class="company-name">${deliverToCompName}</div>
                            <div style="font-size: 10.5px; color: #222222; margin-top: 2px; text-align: left;">${deliverToCompAddr}</div>
                            <div style="font-size: 10.5px; color: #222222; margin-top: 2px; text-align: left;">Telephone: ${deliverToCompPhone}</div>
                            <div style="font-size: 10.5px; color: #000000; font-weight: bold; margin-top: 2px; text-align: left;">TRN: ${deliverToCompTrn}</div>
                          </td>
                          <td style="width: 50%; vertical-align: top; border: none; padding: 0;">
                            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000;">
                              <tr><td style="font-size: 9.5px; font-weight: bold; width: 45%; text-align: left; padding: 2px 6px; border: 1px solid #000000;">INVOICE NO :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.invoiceNo || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">DO NUMBER :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; color: #dc2626; border: 1px solid #000000; text-align: left;">${doc.doNo || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">PO NO :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.poNo || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">RECEIVED VIA :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.dispatchBy || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">DELIVERY TERMS :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.deliveryTerms || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">MADE IN :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.madeIn || '—'}</td></tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${headersHtml}
                </thead>
                <tbody>
                  ${p.pageItems.map(row => renderRowHtml(row)).join('')}
                </tbody>
              </table>

              ${p.isLastPage ? `
                <!-- REMARKS SECTION -->
                <div class="notes-box" style="margin-top: 10px; margin-bottom: 10px; border: 1.5px solid #000000; padding: 6px 10px; font-family: 'Calibri', 'Arial', sans-serif; text-align: left; page-break-inside: avoid; break-inside: avoid;">
                  <div style="font-weight: 900; font-size: 9.5px; border-bottom: 1px solid #000000; padding-bottom: 2px; margin-bottom: 4px; text-transform: uppercase; color: #000000;">
                    Free-Running Fit Test:
                  </div>
                  <div style="font-size: 8.5px; line-height: 1.45; color: #000000;">
                    ${getNotesLines(doc).map((line, i) => `${i + 1}. ${line}`).join('<br/>')}
                  </div>
                </div>

                <div class="signatures-grid">
                  <div class="sig-box">
                    <span class="sig-box-title" style="color: #000000;">RECEIVED / STORED BY:</span>
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">${doc.receiverName || '—'}</div>
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #000000; margin-top: 4px; font-weight: bold;">SIGNATURE / STAMP</div>
                  </div>
                  <div class="sig-box">
                    <span class="sig-box-title" style="color: #000000;">QA/QC INSPECTED BY:</span>
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">${doc.qcCheckedBy || '—'}</div>
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #000000; margin-top: 4px; font-weight: bold;">SIGNATURE / STAMP</div>
                  </div>
                  <div class="sig-box">
                    <span class="sig-box-title" style="color: #000000;">SUPPLIER / AUTHORIZED BY:</span>
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">${doc.attentionTo || '—'}</div>
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #000000; margin-top: 4px; font-weight: bold;">SUPPLIER SIGNATURE / STAMP</div>
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printHtml(htmlContent, `${titleLabel} - ${doc.doNo}`);
  };

  const availableMonthsInGRN = useMemo(() => {
    const list = logs.map(l => {
      if (!l.date) return 'Unknown';
      const parts = l.date.split('-');
      if (parts.length >= 2) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(parts[1]) - 1;
        const mName = months[mIdx] || parts[1];
        return `${mName}-${parts[0]}`;
      }
      return 'Unknown';
    });
    return Array.from(new Set(list)).filter(m => m !== 'Unknown');
  }, [logs]);

  const filteredLogsList = useMemo(() => {
    return logs.filter(l => {
      // 1. Type
      if (filterType !== 'all') {
        const docType = l.type || 'standard';
        if (docType !== filterType) return false;
      }
      
      // 2. Month-Year
      if (selectedMonthFilter !== 'ALL') {
        const parts = l.date?.split('-');
        if (parts && parts.length >= 2) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const mIdx = parseInt(parts[1]) - 1;
          const mName = months[mIdx] || parts[1];
          const mStr = `${mName}-${parts[0]}`;
          if (mStr !== selectedMonthFilter) return false;
        } else {
          return false;
        }
      }

      // 3. Search Query
      const q = searchQuery.toLowerCase();
      return (
        l.doNo.toLowerCase().includes(q) ||
        l.invoiceNo.toLowerCase().includes(q) ||
        l.supplierName.toLowerCase().includes(q) ||
        l.poNo.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery, filterType, selectedMonthFilter]);

  const isCoating = activeDO.type === 'coating';

  return (
    <div className="space-y-6 select-none bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 text-[11px] font-mono text-slate-800">
      
      {/* Dynamic Slide In Toast System */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 border border-[#f37021] border-l-4 text-white rounded-lg p-3.5 px-4 shadow-xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#f37021]" />
          <span className="font-sans font-bold text-xs">{toastMsg}</span>
        </div>
      )}

      {/* Embedded Printing Sheet Styles overriding standard web view elements */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm !important;
          }
          body * {
            visibility: hidden;
          }
          #print-document-sheet, #print-document-sheet * {
            visibility: visible;
          }
          #print-document-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* DESKTOP LAYOUT ONLY - Hidden on Mobile */}
      <div className="hidden lg:block space-y-4">

      {/* Dynamic Control Header Banner - Icon Buttons Toolbar */}
      <div className="no-print bg-white text-slate-800 p-2.5 px-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between gap-2 flex-wrap">
        {/* LEFT SIDE ICON BUTTONS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeSubTab === 'editor' && (
            <>
              {/* Save */}
              <button
                type="button"
                onClick={handleSaveActiveDO}
                className="bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 text-emerald-900 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Save Goods Received Note (GRN)"
              >
                <Save className="w-4 h-4 text-emerald-700 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-emerald-950 tracking-tight whitespace-nowrap">Save</span>
              </button>

              {/* New */}
              <button
                type="button"
                onClick={handleCreateNewDO}
                className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Create New Blank Goods Received Note"
              >
                <FilePlus className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">New</span>
              </button>

              {/* Del */}
              <button
                type="button"
                onClick={handleDeleteActiveDO}
                className="bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Clear GRN Items / Reset Form"
              >
                <Trash2 className="w-4 h-4 text-rose-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-rose-950 tracking-tight whitespace-nowrap">Del</span>
              </button>

              {/* Print PDF */}
              <button
                type="button"
                onClick={() => handleSaveDOAsPDF(activeDO)}
                className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Print / Save Landscape PDF Copy"
              >
                <Printer className="w-4 h-4 text-[#334155] group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Print</span>
              </button>

              {/* Preview */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Preview Landscape Document Layout"
              >
                <Eye className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Preview</span>
              </button>

              {/* Edit Header */}
              <button
                type="button"
                onClick={() => setIsEditHeaderOpen(true)}
                className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Edit Header & Supplier Company Details"
              >
                <Edit3 className="w-4 h-4 text-amber-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Edit Header</span>
              </button>
            </>
          )}

          {activeSubTab === 'record' && (
            <>
              {/* Print Records List PDF */}
              <button
                type="button"
                onClick={handleSaveGRNRegistryAsPdf}
                className="bg-amber-500 border border-amber-600 hover:bg-amber-600 text-white rounded-lg px-3 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[70px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Print Filtered GRN Records List PDF"
              >
                <Printer className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-bold text-white tracking-tight whitespace-nowrap">Print List</span>
              </button>
            </>
          )}
        </div>

        {/* RIGHT SIDE ICON BUTTONS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Standard GRN */}
          <button
            type="button"
            onClick={handleLoadStandardPreset}
            className={`bg-white border hover:bg-slate-50 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0 ${
              activeSubTab === 'editor' && !isCoating
                ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-400/30'
                : 'border-slate-300 text-slate-800'
            }`}
            title="Standard Goods Received Note"
          >
            <PackageCheck className="w-4 h-4 text-[#f37021] group-hover:scale-105 transition-transform" />
            <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Standard GRN</span>
          </button>

          {/* Coating GRN */}
          <button
            type="button"
            onClick={handleLoadCoatingPreset}
            className={`bg-white border hover:bg-slate-50 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0 ${
              activeSubTab === 'editor' && isCoating
                ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/30'
                : 'border-slate-300 text-slate-800'
            }`}
            title="Coating Goods Received Note"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Coating GRN</span>
          </button>

          {/* GRN Records */}
          <button
            type="button"
            onClick={() => setActiveSubTab('record')}
            className={`bg-white border hover:bg-slate-50 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0 ${
              activeSubTab === 'record'
                ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/30'
                : 'border-slate-300 text-slate-800'
            }`}
            title="GRN Records Log"
          >
            <History className="w-4 h-4 text-amber-600 group-hover:scale-105 transition-transform" />
            <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Records ({logs.length})</span>
          </button>

          {activeSubTab === 'record' && (
            <button
              type="button"
              onClick={() => setActiveSubTab('editor')}
              className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
              title="Close Records and return to Editor"
            >
              <XCircle className="w-4 h-4 text-slate-700 group-hover:scale-105 transition-transform" />
              <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Close</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB SUBSECTIONS CONTENT */}
      {activeSubTab === 'editor' ? (
        <div className="space-y-3 animate-fadeIn">

          {/* REALISTIC PARCHMENT/A4 LANDSCAPE SHEET LAYOUT FRAME */}
          <div 
            id="print-document-sheet"
            className="bg-white p-5 sm:p-7 border border-slate-200 rounded-lg max-w-[1100px] mx-auto space-y-3 text-black font-sans shadow-md overflow-x-auto my-2"
          >
            {/* Header Grid: Deliver To & Title Box */}
            <div className="flex justify-between items-start gap-4 pb-1">
              {/* Deliver To Block */}
              <div className="space-y-1 text-left min-w-[280px]">
                <div className="text-[11px] font-bold text-[#f37021] uppercase tracking-wide flex items-center justify-between">
                  <span>Deliver To:</span>
                  {!isMfi && <span className="text-[9px] font-normal text-slate-500 lowercase">(editable)</span>}
                </div>
                {isMfi ? (
                  <div className="space-y-0.5">
                    <div className="text-[14px] font-black text-black uppercase tracking-tight">
                      MARINE FASTENERS INDUSTRIES LLC
                    </div>
                    <div className="text-[10.5px] text-slate-800">
                      Industrial Area, Ajman, UAE
                    </div>
                    <div className="text-[10.5px] text-slate-800">
                      Telephone: +971 6 525 0526
                    </div>
                    <div className="text-[10.5px] font-bold text-black pt-0.5">
                      TRN: 100440509600003
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 bg-slate-50/70 p-2 rounded border border-slate-250">
                    <input
                      type="text"
                      value={activeDO.deliverToName !== undefined ? activeDO.deliverToName : activeCompany.name}
                      onChange={(e) => handleUpdateField('deliverToName', e.target.value.toUpperCase())}
                      className="w-full font-black text-[13px] text-black uppercase bg-white border border-slate-300 focus:border-[#f37021] outline-none px-1.5 py-0.5 rounded shadow-2xs"
                      placeholder="DELIVER TO COMPANY NAME"
                    />
                    <input
                      type="text"
                      value={activeDO.deliverToAddress !== undefined ? activeDO.deliverToAddress : (activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}
                      onChange={(e) => handleUpdateField('deliverToAddress', e.target.value)}
                      className="w-full text-[10.5px] font-bold text-slate-800 bg-white border border-slate-300 focus:border-[#f37021] outline-none px-1.5 py-0.5 rounded shadow-2xs"
                      placeholder="DELIVERY ADDRESS"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-500 whitespace-nowrap">Tel:</span>
                        <input
                          type="text"
                          value={activeDO.deliverToPhone !== undefined ? activeDO.deliverToPhone : (activeCompany.phone || '—')}
                          onChange={(e) => handleUpdateField('deliverToPhone', e.target.value)}
                          className="w-full text-[10.5px] font-bold text-slate-800 bg-transparent outline-none"
                          placeholder="PHONE / TELEPHONE"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-500 whitespace-nowrap">TRN:</span>
                        <input
                          type="text"
                          value={activeDO.deliverToTrn !== undefined ? activeDO.deliverToTrn : (activeCompany.trn || '')}
                          onChange={(e) => handleUpdateField('deliverToTrn', e.target.value)}
                          className="w-full text-[10.5px] font-black text-black bg-transparent outline-none"
                          placeholder="TRN NO."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Orange Border Box */}
              <div className="border border-[#f37021] py-2 px-6 text-center min-w-[280px] shrink-0 my-auto">
                <h1 className="text-[18px] sm:text-[20px] font-black text-[#f37021] uppercase tracking-wider leading-tight">
                  {isCoating ? 'COATING GOODS RECEIVED NOTE' : 'GOODS RECEIVED NOTE'}
                </h1>
              </div>
            </div>

            {/* Subheader Bar with top/bottom black border lines */}
            <div className="border-y border-black py-1.5 px-3 flex justify-between items-center text-[11px] font-bold text-black font-mono my-2">
              <div className="flex items-center gap-2">
                <span>GRN NO:</span>
                <input
                  id="grn-field-grnNo"
                  type="text"
                  value={activeDO.doNo}
                  onChange={(e) => handleUpdateField('doNo', e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('grn-field-grnDate')?.focus();
                    }
                  }}
                  className="bg-transparent border-none text-[#dc2626] font-bold text-[11px] focus:outline-none focus:bg-amber-50 uppercase w-32"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>GRN DATE:</span>
                <input
                  id="grn-field-grnDate"
                  type="text"
                  value={activeDO.date}
                  onChange={(e) => handleUpdateField('date', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('grn-field-supplierName')?.focus();
                    }
                  }}
                  className="bg-transparent border-none text-black font-bold text-[11px] focus:outline-none focus:bg-amber-50 w-28 uppercase"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            {/* Delivery From & Transaction Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left items-start my-2">
              
              {/* Delivery From Block */}
              <div className="md:col-span-7 space-y-1">
                <div className="text-[11px] font-bold text-[#f37021] uppercase tracking-wide">
                  Delivery From:
                </div>
                <div className="relative">
                  <input
                    id="grn-field-supplierName"
                    type="text"
                    value={activeDO.supplierName}
                    onChange={(e) => handleSupplierNameChange(e.target.value)}
                    onFocus={() => {
                      if (activeDO.supplierName && matchingCustomers.length > 0) setIsCustomerDropdownOpen(true);
                    }}
                    onKeyDown={handleSupplierKeyDown}
                    className="w-full font-black text-[13px] text-black uppercase bg-transparent p-0 border-b border-dashed border-slate-300 focus:outline-none focus:border-[#f37021] focus:bg-amber-50 h-5"
                    placeholder="ENTER SUPPLIER COMPANY NAME"
                  />
                  {isCustomerDropdownOpen && matchingCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-[999] max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {matchingCustomers.map((cust, idx) => (
                        <div
                          key={cust.name + '-' + idx}
                          onClick={() => {
                            setActiveDO(prev => ({
                              ...prev,
                              supplierName: cust.name,
                              supplierAddress: cust.address || '',
                              phone: cust.phone || '',
                              trn: cust.trn || ''
                            }));
                            setIsCustomerDropdownOpen(false);
                          }}
                          className={`p-2 cursor-pointer text-left transition-colors ${
                            idx === highlightedCustomerIndex ? 'bg-orange-100 text-orange-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="text-[11px] font-bold uppercase flex items-center justify-between">
                            <span>{cust.name}</span>
                            {cust.trn && <span className="text-[9px] text-slate-500 font-mono">TRN: {cust.trn}</span>}
                          </div>
                          {cust.address && <div className="text-[9.5px] text-slate-500 font-medium truncate">{cust.address}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={activeDO.supplierAddress}
                  onChange={(e) => handleUpdateField('supplierAddress', e.target.value.toUpperCase())}
                  className="w-full text-slate-800 text-[10.5px] leading-snug uppercase bg-transparent p-0 border-none outline-none focus:bg-amber-50 font-sans font-medium resize-none"
                  placeholder="STREET, REGION, PIN CODE / ADDRESS LOCATION"
                />
                <div className="flex flex-wrap gap-4 text-[10.5px] pt-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Telephone:</span>
                    <input
                      type="text"
                      value={activeDO.phone}
                      onChange={(e) => handleUpdateField('phone', e.target.value)}
                      className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-32 text-[10.5px]"
                      placeholder="Phone/Fax"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">TRN:</span>
                    <input
                      type="text"
                      value={activeDO.trn}
                      onChange={(e) => handleUpdateField('trn', e.target.value)}
                      className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none w-36 text-[10.5px]"
                      placeholder="TRN Number"
                    />
                  </div>
                </div>
              </div>

              {/* Transaction Key-Value Rows Stack */}
              <div className="md:col-span-5 text-[10.5px]">
                <div className="space-y-1 font-bold">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <span className="w-1/2 text-right pr-2 text-slate-700">INVOICE NO :</span>
                    <input
                      id="grn-field-invoiceNo"
                      type="text"
                      value={activeDO.invoiceNo}
                      onChange={(e) => handleUpdateField('invoiceNo', e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('grn-field-doNo')?.focus();
                        }
                      }}
                      className="w-1/2 bg-transparent border-none text-[10.5px] font-bold text-black focus:outline-none focus:bg-amber-50 p-0 uppercase"
                      placeholder="—"
                    />
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <span className="w-1/2 text-right pr-2 text-slate-700">DO NUMBER :</span>
                    <input
                      id="grn-field-doNo"
                      type="text"
                      value={activeDO.doNo}
                      onChange={(e) => handleUpdateField('doNo', e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('grn-field-poNo')?.focus();
                        }
                      }}
                      className="w-1/2 bg-transparent border-none text-[10.5px] font-bold text-black focus:outline-none focus:bg-amber-50 p-0 uppercase"
                      placeholder="—"
                    />
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <span className="w-1/2 text-right pr-2 text-slate-700">PO NO :</span>
                    <input
                      id="grn-field-poNo"
                      type="text"
                      value={activeDO.poNo}
                      onChange={(e) => handleUpdateField('poNo', e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('grn-field-dispatchBy')?.focus();
                        }
                      }}
                      className="w-1/2 bg-transparent border-none text-[10.5px] font-bold text-black focus:outline-none focus:bg-amber-50 p-0 uppercase"
                      placeholder="—"
                    />
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <span className="w-1/2 text-right pr-2 text-slate-700">DISPATCH BY :</span>
                    <input
                      id="grn-field-dispatchBy"
                      type="text"
                      value={activeDO.dispatchBy}
                      onChange={(e) => handleUpdateField('dispatchBy', e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('grn-field-deliveryTerms')?.focus();
                        }
                      }}
                      className="w-1/2 bg-transparent border-none text-[10.5px] font-bold text-black focus:outline-none focus:bg-amber-50 p-0 uppercase"
                      placeholder="—"
                    />
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-200">
                    <span className="w-1/2 text-right pr-2 text-slate-700">DELIVERY TERMS :</span>
                    <input
                      id="grn-field-deliveryTerms"
                      type="text"
                      value={activeDO.deliveryTerms}
                      onChange={(e) => handleUpdateField('deliveryTerms', e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('grn-field-madeIn')?.focus();
                        }
                      }}
                      className="w-1/2 bg-transparent border-none text-[10.5px] font-bold text-black focus:outline-none focus:bg-amber-50 p-0 uppercase"
                      placeholder="—"
                    />
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="w-1/2 text-right pr-2 text-slate-700">MADE IN :</span>
                    <input
                      id="grn-field-madeIn"
                      type="text"
                      value={activeDO.madeIn}
                      onChange={(e) => handleUpdateField('madeIn', e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          focusCell(0, 'description');
                        }
                      }}
                      className="w-1/2 bg-transparent border-none text-[10.5px] font-bold text-black focus:outline-none focus:bg-amber-50 p-0 uppercase"
                      placeholder="—"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* SPREADSHEET TOOLBAR ACTION BAR */}
            <div className="flex items-center justify-between gap-2 mb-2 bg-slate-100/90 border border-slate-300 rounded-lg p-1.5 px-3 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Sheet Fonts Dropdown */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 shadow-2xs">
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={sheetFont}
                    onChange={(e) => setSheetFont(e.target.value)}
                    className="text-[11px] font-semibold bg-transparent border-none outline-none cursor-pointer text-slate-800"
                    title="Change Sheet Font Family"
                  >
                    <option value="Calibri">Sheet Fonts (Calibri)</option>
                    <option value="Arial">Arial</option>
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New (Mono)</option>
                  </select>
                </div>

                {/* Green Sheet / Excel Paste Button */}
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(true)}
                  className="p-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  title="Paste Row-by-Row Table Data from Microsoft Excel or Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </button>

                {/* Font Size Selector (A - / Font Size) */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 shadow-2xs">
                  <span className="font-bold text-[11px] text-slate-800 flex items-center gap-0.5">
                    A <span className="text-[9px] text-slate-500">—</span>
                  </span>
                  <select
                    value={sheetFontSize}
                    onChange={(e) => setSheetFontSize(e.target.value)}
                    className="text-[11px] font-semibold bg-transparent border-none outline-none cursor-pointer text-slate-800"
                    title="Change Table Grid Font Size"
                  >
                    <option value="8px">8px (Compact)</option>
                    <option value="9px">9px (Small)</option>
                    <option value="10px">10px (Default)</option>
                    <option value="11px">11px (Medium)</option>
                    <option value="12px">12px (Large)</option>
                  </select>
                </div>

                {/* Undo Button */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!(historyIndex > 0 || (activeDO && activeDO.items && itemsHistory[historyIndex] && JSON.stringify(activeDO.items) !== JSON.stringify(itemsHistory[historyIndex])))}
                  className={`p-1.5 px-2.5 rounded border text-slate-700 flex items-center justify-center transition-all ${
                    (historyIndex > 0 || (activeDO && activeDO.items && itemsHistory[historyIndex] && JSON.stringify(activeDO.items) !== JSON.stringify(itemsHistory[historyIndex])))
                      ? 'bg-white hover:bg-slate-100 border-slate-300 cursor-pointer text-slate-800'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Redo Button */}
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= itemsHistory.length - 1}
                  className={`p-1.5 px-2.5 rounded border text-slate-700 flex items-center justify-center transition-all ${
                    historyIndex < itemsHistory.length - 1
                      ? 'bg-white hover:bg-slate-100 border-slate-300 cursor-pointer text-slate-800'
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" />
                </button>

                {/* COLOR WORD Feature Toolbar */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 shadow-2xs">
                  <span className="text-[11px] font-extrabold text-slate-800 tracking-tight shrink-0 uppercase">COLOR WORD:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: 'Black', color: '#000000' },
                      { label: 'Green', color: '#059669' },
                      { label: 'Blue', color: '#2563eb' },
                      { label: 'Red', color: '#dc2626' },
                      { label: 'Orange', color: '#ea580c' },
                      { label: 'Purple', color: '#7c3aed' },
                    ].map(swatch => (
                      <button
                        key={swatch.color}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleApplyTextColor(swatch.color)}
                        className="w-4 h-4 rounded-full border border-slate-400 hover:scale-110 transition-transform cursor-pointer shrink-0 inline-flex items-center justify-center"
                        style={{ backgroundColor: swatch.color }}
                        title={`Color Highlighted Text (${swatch.label})`}
                      />
                    ))}
                    <label
                      title="Custom Color for Selected Word / Cell"
                      className="w-4 h-4 rounded-full border border-slate-400 overflow-hidden cursor-pointer shrink-0 flex items-center justify-center hover:scale-110 transition-transform bg-white"
                    >
                      <input
                        type="color"
                        value={sheetTextColor || '#000000'}
                        onChange={(e) => handleApplyTextColor(e.target.value)}
                        className="w-6 h-6 -m-1 cursor-pointer border-none bg-transparent p-0"
                      />
                    </label>
                  </div>
                </div>



                {/* Plus (+) Button to Append Row */}
                <button
                  type="button"
                  onClick={handleAppendRow}
                  className="p-1.5 px-3 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold rounded-md transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                  title="Append Blank Receiving Material Row"
                >
                  <Plus className="w-4 h-4 text-white stroke-[3]" />
                </button>

                {pastedRowsHighlight && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse ml-1">
                    ✓ Pasted Rows {pastedRowsHighlight.startRow + 1} - {pastedRowsHighlight.endRow + 1}
                  </span>
                )}
              </div>

              <div className="text-slate-600 text-[11px] font-bold hidden md:block">
                {activeDO.items.length} row(s)
              </div>
            </div>

            {/* PRECISE MATERIAL DATA RECEPTION TABLE GRID */}
            <div 
              id="grn-items-scroll-container"
              className={`border border-slate-400 rounded-md overflow-x-auto bg-white ${
                activeDO.items.length > 7 ? 'max-h-[500px] overflow-y-auto' : ''
              }`}
            >
              <table 
                style={{ fontFamily: sheetFont, fontSize: sheetFontSize }}
                className="w-full text-center divide-y divide-slate-400 font-mono min-w-[950px]"
              >
                <thead className="bg-[#f8fafc] text-slate-700 uppercase font-semibold divide-y divide-slate-400">
                  {isCoating ? (
                    /* COATING TABLE HEADER */
                    <tr className="divide-x divide-slate-400 h-10 bg-slate-100">
                      <th className="w-8 font-bold text-center text-[8.5px]">S.N</th>
                      <th className="w-28 text-left pl-2 text-[8.5px]">DESCRIPTION</th>
                      <th className="w-16 text-[8.5px]">SIZE</th>
                      <th className="w-16 text-[8.5px]">FINISH</th>
                      <th className="w-12 text-[8.5px]">UNIT</th>
                      <th className="w-20 text-[8.5px]">QTY IN DO</th>
                      <th className="w-24 text-[8.5px] text-[#0d9488]">DO RECEIVED</th>
                      <th className="w-20 text-[8.5px] text-red-650">SHORTAGE</th>
                      <th className="w-28 text-[8.5px] text-[#0c449e] font-sans">MARKING TYPE</th>
                      <th className="w-32 text-[8.5px] text-[#0c449e] font-sans">MARKING VISIBLE</th>
                      <th className="w-24 text-[8.5px] text-[#0c449e] font-sans">ADHESION TEST</th>
                      <th className="w-20 text-[8.5px] text-[#0c449e] font-sans">THREADS</th>
                      <th className="w-16 text-[8.5px] text-[#0c449e] font-sans">MICRONS</th>
                      <th className="w-24 text-[8.5px]">FREE-RUNNING FIT TEST</th>
                      <th className="w-28 text-[8.5px]">QC NOTES</th>
                    </tr>
                  ) : (
                    /* STANDARD MATERIALS RECEIVING HEADER */
                    <tr className="divide-x divide-slate-400 h-10 bg-amber-50/50">
                      <th className="w-8 font-bold text-center text-[8.5px]">S.N</th>
                      <th className="w-28 text-left pl-2 text-[8.5px]">DESCRIPTION</th>
                      <th className="w-16 text-[8.5px]">SIZE</th>
                      <th className="w-16 text-[8.5px]">FINISH</th>
                      <th className="w-12 text-[8.5px]">UNIT</th>
                      <th className="w-20 text-[8.5px]">QTY IN DO</th>
                      <th className="w-24 text-[8.5px] text-[#0d9488]">DO RECEIVED</th>
                      <th className="w-20 text-[8.5px] text-[#FF6B00]">SHORTAGE</th>
                      <th className="w-24 text-[8.5px] text-[#FF6B00] font-sans">MARKING</th>
                      <th className="w-24 text-[8.5px] text-[#FF6B00] font-sans">MARKING TYPE</th>
                      <th className="w-28 text-[8.5px] text-[#FF6B00] font-sans">MARKING VISIBLE</th>
                      <th className="w-16 text-[8.5px] text-[#FF6B00] font-sans">MICRONS</th>
                      <th className="w-24 text-[8.5px] text-[#FF6B00] font-sans">COATINGS</th>
                      <th className="w-16 text-[8.5px] text-[#FF6B00] font-sans">PITCH</th>
                      <th className="w-20 text-[8.5px] text-[#FF6B00] font-sans">THREADS</th>
                      <th className="w-24 text-[8.5px]">FREE-RUNNING FIT TEST</th>
                      <th className="w-28 text-[8.5px]">QC NOTES</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-300" style={{ fontFamily: sheetFont, fontSize: sheetFontSize, color: sheetTextColor }}>
                  {activeDO.items.map((row, idx) => {
                    const getCellColor = (colKey: string) => row.cellColors?.[colKey] || sheetTextColor || '#000000';
                    return (
                    <tr key={row.id} className="divide-x divide-slate-300 h-9 hover:bg-slate-50/50 align-middle">
                      
                      {/* S.N */}
                      <td className="text-center font-bold select-none text-[9.5px]" style={{ color: getCellColor('sn'), fontFamily: sheetFont, fontSize: sheetFontSize }}>
                        {row.sn}
                      </td>

                      {/* DESCRIPTION */}
                      <td className="text-left pl-2">
                        <GRNContentEditable
                          value={row.description || ''}
                          onChange={(val) => handleUpdateItemField(row.id, 'description', val)}
                          onFocus={() => handleCellFocus(idx, 'description')}
                          onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'description')}
                          onPaste={(e) => handleInputPaste(e as any, idx, 'description')}
                          onMouseUp={(e) => captureTextSelection(e, idx, 'description')}
                          onKeyUp={(e) => captureTextSelection(e, idx, 'description')}
                          isCellSelected={isCellSelected(idx, 'description')}
                          cellColor={getCellColor('description')}
                          sheetFont={sheetFont}
                          sheetFontSize={sheetFontSize}
                          dataRow={idx}
                          dataCol="description"
                          className="text-[10px] uppercase font-bold text-left"
                        />
                      </td>

                      {/* SIZE */}
                      <td>
                        <GRNContentEditable
                          value={row.size || ''}
                          onChange={(val) => handleUpdateItemField(row.id, 'size', val)}
                          onFocus={() => handleCellFocus(idx, 'size')}
                          onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'size')}
                          onPaste={(e) => handleInputPaste(e as any, idx, 'size')}
                          onMouseUp={(e) => captureTextSelection(e, idx, 'size')}
                          onKeyUp={(e) => captureTextSelection(e, idx, 'size')}
                          isCellSelected={isCellSelected(idx, 'size')}
                          cellColor={getCellColor('size')}
                          sheetFont={sheetFont}
                          sheetFontSize={sheetFontSize}
                          dataRow={idx}
                          dataCol="size"
                          className="text-[10px] font-bold text-center"
                        />
                      </td>

                      {/* FINISH */}
                      <td>
                        <GRNContentEditable
                          value={row.finish || ''}
                          onChange={(val) => handleUpdateItemField(row.id, 'finish', val)}
                          onFocus={() => handleCellFocus(idx, 'finish')}
                          onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'finish')}
                          onPaste={(e) => handleInputPaste(e as any, idx, 'finish')}
                          onMouseUp={(e) => captureTextSelection(e, idx, 'finish')}
                          onKeyUp={(e) => captureTextSelection(e, idx, 'finish')}
                          isCellSelected={isCellSelected(idx, 'finish')}
                          cellColor={getCellColor('finish')}
                          sheetFont={sheetFont}
                          sheetFontSize={sheetFontSize}
                          dataRow={idx}
                          dataCol="finish"
                          className="text-[9.5px] font-medium text-center uppercase"
                        />
                      </td>

                      {/* UNIT */}
                      <td>
                        <GRNContentEditable
                          value={row.unit || ''}
                          onChange={(val) => handleUpdateItemField(row.id, 'unit', val)}
                          onFocus={() => handleCellFocus(idx, 'unit')}
                          onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'unit')}
                          onPaste={(e) => handleInputPaste(e as any, idx, 'unit')}
                          onMouseUp={(e) => captureTextSelection(e, idx, 'unit')}
                          onKeyUp={(e) => captureTextSelection(e, idx, 'unit')}
                          isCellSelected={isCellSelected(idx, 'unit')}
                          cellColor={getCellColor('unit')}
                          sheetFont={sheetFont}
                          sheetFontSize={sheetFontSize}
                          dataRow={idx}
                          dataCol="unit"
                          className="text-[10px] font-bold text-center uppercase"
                        />
                      </td>

                      {/* QTY IN DO */}
                      <td>
                        <input
                          type="number"
                          value={row.qty === 0 || row.qty === undefined || row.qty === ('' as any) ? '' : row.qty}
                          onChange={(e) => handleUpdateItemField(row.id, 'qty', e.target.value === '' ? ('' as any) : (parseInt(e.target.value, 10) || 0))}
                          onKeyDown={(e) => handleExcelKeyDown(e, idx, 'qty')}
                          onPaste={(e) => handleInputPaste(e, idx, 'qty')}
                          onFocus={() => handleCellFocus(idx, 'qty')}
                          data-grn-row={idx}
                          data-grn-col="qty"
                          style={{ color: isCellSelected(idx, 'qty') ? '#1e3a8a' : getCellColor('qty'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                          className={`w-full bg-transparent border-none text-center text-[10px] font-semibold focus:outline-none focus:bg-amber-50 h-5 px-0 rounded transition-all ${
                            isCellSelected(idx, 'qty') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                          }`}
                          placeholder=""
                        />
                      </td>

                      {/* DO RECEIVED */}
                      <td>
                        <input
                          type="number"
                          value={row.qtyReceived === undefined || row.qtyReceived === 0 || row.qtyReceived === ('' as any) ? '' : row.qtyReceived}
                          onChange={(e) => handleUpdateItemField(row.id, 'qtyReceived', e.target.value === '' ? ('' as any) : (parseInt(e.target.value, 10) || 0))}
                          onKeyDown={(e) => handleExcelKeyDown(e, idx, 'qtyReceived')}
                          onPaste={(e) => handleInputPaste(e, idx, 'qtyReceived')}
                          onFocus={() => handleCellFocus(idx, 'qtyReceived')}
                          data-grn-row={idx}
                          data-grn-col="qtyReceived"
                          style={{ color: isCellSelected(idx, 'qtyReceived') ? '#1e3a8a' : getCellColor('qtyReceived'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                          className={`w-full bg-transparent border-none text-center text-[10px] font-semibold focus:outline-none focus:bg-amber-50 h-5 px-0 rounded transition-all ${
                            isCellSelected(idx, 'qtyReceived') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                          }`}
                          placeholder=""
                        />
                      </td>

                      {/* SHORTAGE */}
                      {(() => {
                        const qVal = typeof row.qty === 'number' ? row.qty : parseInt(row.qty || '0', 10) || 0;
                        const qRecVal = typeof row.qtyReceived === 'number' ? row.qtyReceived : parseInt(row.qtyReceived || '0', 10) || 0;
                        const shortage = Math.max(0, qVal - qRecVal);
                        return (
                          <td
                            onClick={() => handleCellFocus(idx, 'shortage')}
                            onFocus={() => handleCellFocus(idx, 'shortage')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'shortage')}
                            tabIndex={0}
                            data-grn-row={idx}
                            data-grn-col="shortage"
                            style={{ fontFamily: sheetFont, fontSize: sheetFontSize }}
                            className={`text-center font-bold text-[10px] select-none cursor-pointer outline-none transition-all ${
                              isCellSelected(idx, 'shortage')
                                ? 'bg-blue-200 ring-2 ring-blue-600 text-blue-900 font-bold'
                                : shortage > 0 ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50'
                            }`}
                          >
                            {shortage > 0 ? shortage : (qVal > 0 ? 0 : '')}
                          </td>
                        );
                      })()}

                      {isCoating ? (
                        <>
                          {/* MARKING TYPE */}
                          <td>
                            <input
                              type="text"
                              value={row.markingType || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'markingType', e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingType')}
                              onPaste={(e) => handleInputPaste(e, idx, 'markingType')}
                              onFocus={() => handleCellFocus(idx, 'markingType')}
                              data-grn-row={idx}
                              data-grn-col="markingType"
                              style={{ color: isCellSelected(idx, 'markingType') ? '#1e3a8a' : getCellColor('markingType'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'markingType') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* MARKING VISIBLE */}
                          <td>
                            <input
                              type="text"
                              value={row.markingVisible || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'markingVisible', e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingVisible')}
                              onPaste={(e) => handleInputPaste(e, idx, 'markingVisible')}
                              onFocus={() => handleCellFocus(idx, 'markingVisible')}
                              data-grn-row={idx}
                              data-grn-col="markingVisible"
                              style={{ color: isCellSelected(idx, 'markingVisible') ? '#1e3a8a' : getCellColor('markingVisible'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'markingVisible') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* ADHESION TEST */}
                          <td>
                            <input
                              type="text"
                              value={row.adhesionTest || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'adhesionTest', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'adhesionTest')}
                              onPaste={(e) => handleInputPaste(e, idx, 'adhesionTest')}
                              onFocus={() => handleCellFocus(idx, 'adhesionTest')}
                              data-grn-row={idx}
                              data-grn-col="adhesionTest"
                              style={{ color: isCellSelected(idx, 'adhesionTest') ? '#1e3a8a' : getCellColor('adhesionTest'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'adhesionTest') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* THREADS */}
                          <td>
                            <input
                              type="text"
                              value={row.threads || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'threads', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'threads')}
                              onPaste={(e) => handleInputPaste(e, idx, 'threads')}
                              onFocus={() => handleCellFocus(idx, 'threads')}
                              data-grn-row={idx}
                              data-grn-col="threads"
                              style={{ color: isCellSelected(idx, 'threads') ? '#1e3a8a' : getCellColor('threads'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'threads') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* MICRONS */}
                          <td>
                            <input
                              type="text"
                              value={row.microns || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'microns', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'microns')}
                              onPaste={(e) => handleInputPaste(e, idx, 'microns')}
                              onFocus={() => handleCellFocus(idx, 'microns')}
                              data-grn-row={idx}
                              data-grn-col="microns"
                              style={{ color: isCellSelected(idx, 'microns') ? '#1e3a8a' : getCellColor('microns'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'microns') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          {/* MARKING */}
                          <td>
                            <input
                              type="text"
                              value={row.marking || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'marking', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'marking')}
                              onPaste={(e) => handleInputPaste(e, idx, 'marking')}
                              onFocus={() => handleCellFocus(idx, 'marking')}
                              data-grn-row={idx}
                              data-grn-col="marking"
                              style={{ color: isCellSelected(idx, 'marking') ? '#1e3a8a' : getCellColor('marking'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'marking') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* MARKING TYPE */}
                          <td>
                            <input
                              type="text"
                              value={row.markingType || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'markingType', e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingType')}
                              onPaste={(e) => handleInputPaste(e, idx, 'markingType')}
                              onFocus={() => handleCellFocus(idx, 'markingType')}
                              data-grn-row={idx}
                              data-grn-col="markingType"
                              style={{ color: isCellSelected(idx, 'markingType') ? '#1e3a8a' : getCellColor('markingType'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'markingType') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* MARKING VISIBLE */}
                          <td>
                            <input
                              type="text"
                              value={row.markingVisible || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'markingVisible', e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingVisible')}
                              onPaste={(e) => handleInputPaste(e, idx, 'markingVisible')}
                              onFocus={() => handleCellFocus(idx, 'markingVisible')}
                              data-grn-row={idx}
                              data-grn-col="markingVisible"
                              style={{ color: isCellSelected(idx, 'markingVisible') ? '#1e3a8a' : getCellColor('markingVisible'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'markingVisible') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* MICRONS */}
                          <td>
                            <input
                              type="text"
                              value={row.microns || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'microns', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'microns')}
                              onPaste={(e) => handleInputPaste(e, idx, 'microns')}
                              onFocus={() => handleCellFocus(idx, 'microns')}
                              data-grn-row={idx}
                              data-grn-col="microns"
                              style={{ color: isCellSelected(idx, 'microns') ? '#1e3a8a' : getCellColor('microns'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'microns') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* COATINGS */}
                          <td>
                            <input
                              type="text"
                              value={row.coatings || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'coatings', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'coatings')}
                              onPaste={(e) => handleInputPaste(e, idx, 'coatings')}
                              onFocus={() => handleCellFocus(idx, 'coatings')}
                              data-grn-row={idx}
                              data-grn-col="coatings"
                              style={{ color: isCellSelected(idx, 'coatings') ? '#1e3a8a' : getCellColor('coatings'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'coatings') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* PITCH */}
                          <td>
                            <input
                              type="text"
                              value={row.pitch || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'pitch', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'pitch')}
                              onPaste={(e) => handleInputPaste(e, idx, 'pitch')}
                              onFocus={() => handleCellFocus(idx, 'pitch')}
                              data-grn-row={idx}
                              data-grn-col="pitch"
                              style={{ color: isCellSelected(idx, 'pitch') ? '#1e3a8a' : getCellColor('pitch'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'pitch') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                          {/* THREADS */}
                          <td>
                            <input
                              type="text"
                              value={row.threads || ''}
                              onChange={(e) => handleUpdateItemField(row.id, 'threads', e.target.value)}
                              onKeyDown={(e) => handleExcelKeyDown(e, idx, 'threads')}
                              onPaste={(e) => handleInputPaste(e, idx, 'threads')}
                              onFocus={() => handleCellFocus(idx, 'threads')}
                              data-grn-row={idx}
                              data-grn-col="threads"
                              style={{ color: isCellSelected(idx, 'threads') ? '#1e3a8a' : getCellColor('threads'), fontFamily: sheetFont, fontSize: sheetFontSize }}
                              className={`w-full bg-transparent border-none text-center text-[9.5px] focus:outline-none focus:bg-amber-50 h-5 px-1 rounded transition-all ${
                                isCellSelected(idx, 'threads') ? 'bg-blue-200 ring-2 ring-blue-600 font-bold' : ''
                              }`}
                              placeholder=""
                            />
                          </td>
                        </>
                      )}

                      {/* REMARKS */}
                      <td>
                        <GRNContentEditable
                          value={row.remarks || ''}
                          onChange={(val) => handleUpdateItemField(row.id, 'remarks', val)}
                          onFocus={() => handleCellFocus(idx, 'remarks')}
                          onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'remarks')}
                          onPaste={(e) => handleInputPaste(e as any, idx, 'remarks')}
                          onMouseUp={(e) => captureTextSelection(e, idx, 'remarks')}
                          onKeyUp={(e) => captureTextSelection(e, idx, 'remarks')}
                          isCellSelected={isCellSelected(idx, 'remarks')}
                          cellColor={getCellColor('remarks')}
                          sheetFont={sheetFont}
                          sheetFontSize={sheetFontSize}
                          dataRow={idx}
                          dataCol="remarks"
                          className="text-[9px] justify-center"
                        />
                      </td>

                      {/* QC NOTES */}
                      <td className="relative">
                        <div className="flex items-center gap-1 px-1">
                          <GRNContentEditable
                            value={row.qcNotes || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'qcNotes', val)}
                            onFocus={() => handleCellFocus(idx, 'qcNotes')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'qcNotes')}
                            onPaste={(e) => handleInputPaste(e as any, idx, 'qcNotes')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'qcNotes')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'qcNotes')}
                            isCellSelected={isCellSelected(idx, 'qcNotes')}
                            cellColor={getCellColor('qcNotes')}
                            sheetFont={sheetFont}
                            sheetFontSize={sheetFontSize}
                            dataRow={idx}
                            dataCol="qcNotes"
                            className="text-[9px] font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="no-print p-0.5 text-slate-400 hover:text-rose-500 rounded bg-slate-100/50 hover:bg-rose-50 cursor-pointer"
                            title="Remove Row"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Direct interactable row appender (no-print) */}
            <div className="no-print flex justify-between items-center bg-slate-50 p-2 border border-slate-200 rounded-lg pt-1.5">
              <button
                type="button"
                onClick={handleAppendRow}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-sans font-bold text-[9px] text-slate-800 uppercase flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" /> Add Material Line
              </button>

              {activeDO.items.length > 7 && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('grn-items-scroll-container');
                      if (el) el.scrollTop = 0;
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[9px] font-bold uppercase rounded cursor-pointer flex items-center gap-1 shadow-3xs"
                    title="Scroll to Top of Items"
                  >
                    ↑ TOP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('grn-items-scroll-container');
                      if (el) el.scrollTop = el.scrollHeight;
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[9px] font-bold uppercase rounded cursor-pointer flex items-center gap-1 shadow-3xs"
                    title="Scroll to Bottom of Items"
                  >
                    ↓ BOTTOM
                  </button>
                </div>
              )}
            </div>

            {/* REMARKS SECTION */}
            <div className="border-1.5 border-black rounded p-3 bg-white space-y-1.5 text-left my-4">
              <div className="flex justify-between items-center border-b border-black pb-1">
                <span className="text-[9.5px] font-black uppercase text-black">
                  Free-Running Fit Test:
                </span>
                <button
                  type="button"
                  onClick={handleAddNotesLine}
                  className="text-[9px] font-extrabold uppercase bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  title="Add More Remark Line"
                >
                  <Plus className="w-3 h-3 text-slate-700" />
                  <span>Add Line</span>
                </button>
              </div>
              <div className="text-[9.5px] font-bold text-black space-y-1.5 pt-1 leading-snug">
                {getNotesLines(activeDO).map((lineText, idx) => (
                  <div key={idx} className="flex items-center gap-1 group">
                    <span className="shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      value={lineText}
                      onChange={(e) => handleUpdateNotesLine(idx, e.target.value)}
                      className="w-full bg-slate-50 border-b border-slate-300 focus:border-black font-semibold text-[9.5px] text-black outline-none px-1"
                      placeholder={`Remark line ${idx + 1}...`}
                    />
                    {getNotesLines(activeDO).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNotesLine(idx)}
                        className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer shrink-0"
                        title="Remove line"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* END SIGNATURES SECTION: PREPARED BY, CHECKED BY, APPROVED BY */}
            <div className="grid grid-cols-3 gap-4 pt-10 pb-2 text-center text-[11px] font-black uppercase text-black">
              <div>
                <span className="underline decoration-2 block mb-1">PREPARED BY</span>
                <input
                  type="text"
                  value={activeDO.receiverName}
                  onChange={(e) => handleUpdateField('receiverName', e.target.value.toUpperCase())}
                  className="w-full text-center text-[10.5px] font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:bg-amber-50 uppercase mt-2"
                  placeholder="MR. ASHRAF ALAMI"
                />
              </div>
              <div>
                <span className="underline decoration-2 block mb-1">CHECKED BY</span>
                <input
                  type="text"
                  value={activeDO.qcCheckedBy}
                  onChange={(e) => handleUpdateField('qcCheckedBy', e.target.value.toUpperCase())}
                  className="w-full text-center text-[10.5px] font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:bg-amber-50 uppercase mt-2"
                  placeholder="ENG. RAJESH KUMAR"
                />
              </div>
              <div>
                <span className="underline decoration-2 block mb-1">APPROVED BY</span>
                <div className="h-6 border-b border-dashed border-slate-300 mt-2 text-[10.5px] font-bold text-slate-400 uppercase">
                  &nbsp;
                </div>
              </div>
            </div>

            {/* System Generated Record notice at bottom */}
            <div className="pt-4 border-t border-slate-200 flex justify-between text-[8px] text-slate-500 uppercase font-sans tracking-wider leading-none">
              <span>Marine Fasteners Industries LLC - Inbound Receiver System</span>
              <span className="font-bold text-black">This is a system generated record and does not require physical signature or stamp</span>
            </div>

          </div>

          {/* Sticky Outer Action Trigger */}
          <div className="no-print pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveActiveDO}
              className="p-3.5 px-7 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Check className="w-5 h-5 text-white" /> SAVE GOODS RECEIVED NOTE (GRN)
            </button>
          </div>

        </div>
      ) : (
        /* SUBTAB 2: REDESIGNED master spreadsheet ledger table showing all 28 requested columns */
        <div className="bg-white border-2 border-black rounded-xl p-5 space-y-4 no-print select-none animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div className="flex items-center gap-3">
              {/* PRINT RECORDS LIST BUTTON */}
              <button
                type="button"
                onClick={handleSaveGRNRegistryAsPdf}
                className="px-3.5 py-2 bg-[#f37021] hover:bg-orange-600 text-white font-sans font-bold text-[10px] uppercase rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Print Filtered GRN Records List PDF"
              >
                <Printer className="w-4 h-4 text-white" /> PRINT RECORDS LIST
              </button>
            </div>
            
            {/* Filter Tabs & Search Input Group */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
              {/* FILTER BUTTON TOGGLE */}
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-3 py-2 rounded-lg border-2 font-sans font-bold text-[10px] uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeFilterCount > 0 
                    ? 'bg-amber-400 text-slate-950 border-amber-600 shadow-sm' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
                title="Toggle Extended Goods Received Notes Filter Panel"
              >
                <Filter className="w-3.5 h-3.5 text-slate-900" /> FILTER 
                {activeFilterCount > 0 && (
                  <span className="bg-slate-950 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {/* Type Category Filters */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-md font-sans font-bold text-[9px] uppercase transition-all tracking-wider cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({logs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('standard')}
                  className={`px-3 py-1 rounded-md font-sans font-bold text-[9px] uppercase transition-all tracking-wider cursor-pointer ${
                    filterType === 'standard'
                      ? 'bg-amber-100 text-[#E02424] border border-amber-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Standard GRN ({logs.filter(l => (l.type || 'standard') === 'standard').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('coating')}
                  className={`px-3 py-1 rounded-md font-sans font-bold text-[9px] uppercase transition-all tracking-wider cursor-pointer ${
                    filterType === 'coating'
                      ? 'bg-indigo-100 text-[#0c449e] border border-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Coating GRN ({logs.filter(l => l.type === 'coating').length})
                </button>
              </div>

              {/* Quick Filter Search Input */}
              <div className="relative w-full sm:w-64 border-slate-200">
                <input
                  type="text"
                  placeholder="Search DO, Invoice, PO, Supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 pl-9 text-[10px] font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                />
                <Search className="w-4 h-4 text-slate-700 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* EXTENDED GOODS RECEIVED NOTES FILTER PANEL */}
          {isFilterOpen && (
            <div className="bg-slate-900 text-white p-4 rounded-xl border-2 border-black shadow-md space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-sans">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Extended Goods Received Notes Filter Controls
                </span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-400" /> RESET FILTERS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono">
                {/* Month / Year Selector */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Month / Year</label>
                  <select
                    value={selectedMonthFilter}
                    onChange={(e) => setSelectedMonthFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold outline-none focus:border-amber-400"
                  >
                    <option value="ALL">ALL MONTHS</option>
                    {availableMonthsInGRN.map(m => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold outline-none focus:border-amber-400"
                  />
                </div>

                {/* Supplier Search */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="Filter Supplier..."
                    value={filterSupplier}
                    onChange={(e) => setFilterSupplier(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold uppercase outline-none focus:border-amber-400"
                  />
                </div>

                {/* PO Number */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">PO Number</label>
                  <input
                    type="text"
                    placeholder="Filter PO No..."
                    value={filterPoNo}
                    onChange={(e) => setFilterPoNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold uppercase outline-none focus:border-amber-400"
                  />
                </div>

                {/* Receiver Name */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Received By</label>
                  <input
                    type="text"
                    placeholder="Filter Store Staff..."
                    value={filterReceiver}
                    onChange={(e) => setFilterReceiver(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold uppercase outline-none focus:border-amber-400"
                  />
                </div>

                {/* Shortage Status */}
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Shortage Flag</label>
                  <select
                    value={filterShortageOnly}
                    onChange={(e) => setFilterShortageOnly(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-bold outline-none focus:border-amber-400"
                  >
                    <option value="all">ALL ITEMS</option>
                    <option value="shortage">⚠️ SHORTAGE FLAGGED ONLY</option>
                    <option value="no_shortage">✓ NO SHORTAGE</option>
                  </select>
                </div>

                {/* Active Records Count Info */}
                <div className="flex items-end">
                  <div className="w-full bg-slate-800/80 border border-slate-700 rounded p-1.5 text-center text-amber-300 font-bold text-[10px]">
                    Matching: {filteredLogsList.length} of {logs.length} GRNs
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredLogsList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-[10.5px] font-sans">
              ⚠️ No registered inbound materials logs match your search.
            </div>
          ) : (
            <div className="border border-slate-300 rounded-xl overflow-x-auto bg-slate-50 shadow-inner">
              <table className="w-full text-left font-mono text-[10px] border-collapse min-w-[750px] divide-y divide-slate-300">
                <thead>
                  {/* Category Grouping Row */}
                  <tr className="bg-slate-900 text-white text-[9px] font-bold tracking-widest uppercase text-center border-b border-slate-700 h-8">
                    <th colSpan={6} className="bg-slate-950 text-left pl-3 sticky left-0 z-20">GOODS RECEIVED RECORDS</th>
                    <th colSpan={1} className="bg-slate-900 text-center">ACTION</th>
                  </tr>

                  {/* 7 Columns Detail Row */}
                  <tr className="bg-slate-100 text-slate-800 font-bold text-[9px] uppercase tracking-wider h-10 border-b border-slate-300 text-center divide-x divide-slate-200">
                    <th className="p-2 text-center w-[120px] font-semibold text-[#E02424]">GRN NO</th>
                    <th className="p-2 text-center w-[110px] text-slate-800">INVOICE NO</th>
                    <th className="p-2 text-center w-[100px] text-slate-800">DATE</th>
                    <th className="p-2 text-center w-[110px] text-slate-800">PO NUMBER</th>
                    <th className="p-2 text-left w-[200px] text-slate-800 pl-3">SUPPLIER NAME</th>
                    <th className="p-2 text-center w-[120px] text-slate-800">RECEIVED BY</th>
                    <th className="p-2 text-center w-[120px] text-slate-800">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogsList.map((log, idx) => {
                    return (
                      <tr key={log.id} className="divide-x divide-slate-200 hover:bg-slate-100/50 h-11 text-black font-medium">
                        {/* GRN NO */}
                        <td className="p-1.5 text-center font-semibold text-[#E02424] bg-white">
                          <input
                            type="text"
                            value={log.doNo}
                            onChange={(e) => handleUpdateLogField(log.id, 'doNo', e.target.value.toUpperCase())}
                            className="w-full text-center font-semibold text-red-700 bg-transparent border-none outline-none focus:bg-amber-50"
                            data-incoming-row={idx}
                            data-incoming-col={0}
                            onKeyDown={(e) => handleIncomingLogKeyDown(e, idx, 0)}
                          />
                        </td>

                        {/* INVOICE NO */}
                        <td className="p-1.5 text-center font-bold text-slate-800 bg-white">
                          <input
                            type="text"
                            value={log.invoiceNo || ''}
                            onChange={(e) => handleUpdateLogField(log.id, 'invoiceNo', e.target.value.toUpperCase())}
                            className="w-full text-center font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-amber-50"
                            placeholder="INV-..."
                            data-incoming-row={idx}
                            data-incoming-col={1}
                            onKeyDown={(e) => handleIncomingLogKeyDown(e, idx, 1)}
                          />
                        </td>

                        {/* DATE */}
                        <td className="p-1.5 text-center text-slate-700 bg-white">
                          <input
                            type="date"
                            value={log.date}
                            onChange={(e) => handleUpdateLogField(log.id, 'date', e.target.value)}
                            className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-50 text-slate-800"
                            data-incoming-row={idx}
                            data-incoming-col={2}
                            onKeyDown={(e) => handleIncomingLogKeyDown(e, idx, 2)}
                          />
                        </td>

                        {/* PO NUMBER */}
                        <td className="p-1.5 text-center font-bold text-slate-800 bg-white">
                          <input
                            type="text"
                            value={log.poNo || ''}
                            onChange={(e) => handleUpdateLogField(log.id, 'poNo', e.target.value.toUpperCase())}
                            className="w-full text-center text-slate-800 font-bold bg-transparent border-none outline-none focus:bg-amber-50"
                            placeholder="PO-..."
                            data-incoming-row={idx}
                            data-incoming-col={3}
                            onKeyDown={(e) => handleIncomingLogKeyDown(e, idx, 3)}
                          />
                        </td>

                        {/* SUPPLIER NAME */}
                        <td className="p-1.5 text-left text-slate-900 font-sans text-[9.5px] uppercase font-bold bg-white pl-3">
                          <input
                            type="text"
                            value={log.supplierName}
                            onChange={(e) => handleUpdateLogField(log.id, 'supplierName', e.target.value.toUpperCase())}
                            className="w-full text-left font-sans font-bold bg-transparent border-none outline-none focus:bg-amber-50 text-slate-900"
                            data-incoming-row={idx}
                            data-incoming-col={4}
                            onKeyDown={(e) => handleIncomingLogKeyDown(e, idx, 4)}
                          />
                        </td>

                        {/* RECEIVED BY */}
                        <td className="p-1.5 bg-white text-center">
                          <input
                            type="text"
                            value={log.receiverName || ''}
                            onChange={(e) => handleUpdateLogField(log.id, 'receiverName', e.target.value.toUpperCase())}
                            className="w-full text-center bg-transparent border-none text-[9px] outline-none font-bold focus:bg-amber-50 text-slate-900"
                            placeholder="STAFF NAME"
                          />
                        </td>

                        {/* ACTION */}
                        <td className="p-1.5 text-center bg-white">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleLoadFromLedger(log)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
                              title="Edit GRN record"
                            >
                              <Edit3 className="w-4 h-4 text-slate-800" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveDOAsPDF(log);
                              }}
                              className="p-1.5 bg-orange-50 hover:bg-orange-100 text-[#f37021] rounded-md transition-colors cursor-pointer"
                              title="Print / Export PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteDO(log.id, log.doNo, e)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="Delete GRN log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Custom Unique Mobile Inbound Goods Received Registry Section */}
      <div 
        className="lg:hidden block bg-gradient-to-b from-amber-50/20 to-white border border-amber-200 text-black rounded-lg p-3 sm:p-5 shadow-sm space-y-4 font-mono select-none no-print animate-in fade-in duration-150"
      >
        {/* Unique Colorful Header Board */}
        <div className="text-center font-sans border-b border-[#f37021]/80 pb-2.5 bg-slate-950 text-white p-3 rounded-lg shadow-sm">
          <h2 className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider leading-tight text-[#f37021]">
            MARINE FASTENERS INDUSTRIES LLC
          </h2>
          <p className="text-[7.2px] sm:text-[7.8px] font-semibold uppercase tracking-widest text-[#f37021]/70 leading-none mt-1">
            Manufacturer & Supplier of Fasteners, Fittings & Fixing Accessories
          </p>
        </div>

        {/* Title block & Search bar row */}
        <div className="flex items-center justify-between gap-2.5 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
          <div 
            className="flex items-center gap-1.5 select-none bg-[#f37021] text-white p-1.5 sm:p-2 rounded-md shadow-xs"
          >
            <div>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left font-sans">
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-tight leading-none text-white">
                GOODS REC
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight leading-none mt-0.5 text-amber-200 font-mono">
                NOTES
              </span>
            </div>
          </div>

          {/* Search input with magnifying glass decoration inside */}
          <div className="relative flex-1 max-w-[130px] sm:max-w-[170px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-600 font-bold" />
            <input
              type="text"
              placeholder="Search Note No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[9px] sm:text-[10px] pl-7 pr-2 py-1.5 border border-amber-200 bg-white text-zinc-950 font-bold rounded-md focus:outline-none focus:ring-1 focus:ring-[#f37021]"
            />
          </div>
        </div>

        {/* Month & Year Filter row in Mobile Goods Received Notes */}
        <div className="flex flex-wrap gap-1 mt-1 bg-gradient-to-r from-amber-50/55 to-orange-50/55 p-2 rounded-lg border border-amber-200/60 shadow-3xs">
          <button
            type="button"
            onClick={() => setSelectedMonthFilter('ALL')}
            className={`px-2.5 py-1 text-[8.5px] font-bold uppercase border rounded-md transition-all cursor-pointer ${
              selectedMonthFilter === 'ALL'
                ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                : 'bg-white text-black border-slate-300 hover:bg-neutral-50 shadow-3xs'
            }`}
          >
            All Months
          </button>
          {availableMonthsInGRN.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonthFilter(m)}
              className={`px-2.5 py-1 text-[8.5px] font-bold uppercase border rounded-md transition-all cursor-pointer ${
                selectedMonthFilter === m
                  ? 'bg-black text-white border-black shadow-xs ring-1 ring-black'
                  : 'bg-white text-black border-slate-300 hover:bg-neutral-50 shadow-3xs'
              }`}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
          {/* Fallback month if list is empty to match mockup */}
          {availableMonthsInGRN.length === 0 && (
            <button
              type="button"
              onClick={() => setSelectedMonthFilter('May-2026')}
              className="px-2.5 py-1 text-[8.5px] font-bold uppercase border rounded-md bg-white text-black border-slate-300 hover:bg-neutral-50 cursor-pointer"
            >
              May 24
            </button>
          )}
        </div>

        {/* Filter buttons styled with highly distinctive, unique individual color pallets - Side-by-Side row */}
        <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg select-none font-bold text-[7.8px] sm:text-[8.5px] uppercase">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`py-1 px-1 rounded-md border text-center transition-all cursor-pointer font-bold tracking-tight ${
              filterType === 'all'
                ? 'border-indigo-600 text-white bg-indigo-600 shadow-3xs scale-[1.01]'
                : 'border-indigo-200 text-indigo-700 bg-indigo-50/40 hover:bg-indigo-50'
            }`}
          >
            All GRN ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('coating')}
            className={`py-1 px-1 rounded-md border text-center transition-all cursor-pointer font-bold tracking-tight ${
              filterType === 'coating'
                ? 'border-orange-600 text-white bg-[#f37021] shadow-3xs scale-[1.01]'
                : 'border-orange-200 text-orange-700 bg-orange-50/50 hover:bg-orange-50'
            }`}
          >
            Coating
          </button>
          <button
            type="button"
            onClick={() => setFilterType('standard')}
            className={`py-1 px-1 rounded-md border text-center transition-all cursor-pointer font-bold tracking-tight ${
              filterType === 'standard'
                ? 'border-blue-600 text-white bg-blue-600 shadow-3xs scale-[1.01]'
                : 'border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50'
            }`}
          >
            Standard
          </button>
        </div>

        {/* Mobile direct single-click PDF report button for GRN */}
        <div className="px-1">
          <button
            type="button"
            onClick={handleSaveGRNRegistryAsPdf}
            className="w-full py-2.5 rounded-lg border-2 border-rose-700 text-center transition-all cursor-pointer font-bold text-[10px] text-white bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-700 hover:to-red-700 shadow-md flex items-center justify-center gap-2 uppercase font-sans tracking-wider"
          >
            <span className="w-4 h-3 bg-white text-rose-650 rounded-[2px] text-[6.5px] font-bold flex items-center justify-center leading-none">PDF</span>
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>DOWNLOAD GRN PDF REPORT</span>
          </button>
        </div>

        {/* Mobile 6 columns header row - Compact height & text */}
        <div className="grid grid-cols-6 gap-0.5 font-sans text-center mt-2 p-0.5 bg-slate-950 rounded-sm">
          <div className="border border-orange-500 bg-orange-500 text-[5px] sm:text-[5.8px] font-bold uppercase text-white flex items-center justify-center text-center leading-none h-[18px] rounded-xs shadow-3xs">
            Invoice No
          </div>
          <div className="border border-indigo-500 bg-indigo-500 text-[5px] sm:text-[5.8px] font-bold uppercase text-white flex items-center justify-center text-center leading-none h-[18px] rounded-xs shadow-3xs">
            Date
          </div>
          <div className="border border-blue-500 bg-blue-500 text-[5px] sm:text-[5.8px] font-bold uppercase text-white flex items-center justify-center text-center leading-none h-[18px] rounded-xs shadow-3xs">
            DO No
          </div>
          <div className="border border-teal-500 bg-teal-500 text-[5px] sm:text-[5.8px] font-bold uppercase text-white flex items-center justify-center text-center leading-none h-[18px] rounded-xs shadow-3xs">
            PO No
          </div>
          <div className="border border-slate-500 bg-slate-600 text-[5px] sm:text-[5.8px] font-bold uppercase text-white flex items-center justify-center text-center leading-none h-[18px] rounded-xs shadow-3xs">
            Supplier
          </div>
          <div className="border border-emerald-500 bg-emerald-600 text-[5px] sm:text-[5.8px] font-bold uppercase text-white flex items-center justify-center text-center h-[18px] rounded-xs shadow-3xs font-sans">
            Action
          </div>
        </div>

        {/* Mobile table rows layout */}
        <div className="space-y-1">
          {filteredLogsList.length === 0 ? (
            <div className="p-4 text-center text-slate-500 italic bg-slate-50 border border-dashed border-slate-200 rounded-lg font-sans text-[9px]">
              No active GRN records matching filters.
            </div>
          ) : (
            filteredLogsList.map((log, idx) => {
              const isSelected = activeDO.id === log.id;
              const isCoatingDo = log.type === 'coating';

              // indicator and border highlight values
              let indicatorBg = 'bg-blue-600';
              let borderHighlight = 'border-slate-300';
              if (isSelected) {
                borderHighlight = 'border-amber-500 bg-amber-50/65 ring-1.5 ring-amber-400';
              } else if (isCoatingDo) {
                indicatorBg = 'bg-[#f37021]';
                borderHighlight = 'border-orange-205 bg-orange-50/5';
              } else {
                indicatorBg = 'bg-blue-600';
                borderHighlight = 'border-slate-200 bg-white';
              }

              return (
                <div
                  key={log.id + '-mob-' + idx}
                  className={`relative overflow-hidden flex items-stretch border ${borderHighlight} rounded-sm shadow-3xs transition-all text-center min-h-[25px] hover:bg-slate-50`}
                >
                  {/* Left vertical color indicator stripe */}
                  <div className={`w-[2.5px] shrink-0 ${indicatorBg}`} title={isCoatingDo ? 'Coating GRN' : 'Standard GRN'}></div>

                  {/* Content Grid (6 columns) */}
                  <div className="grid grid-cols-6 gap-0.5 items-center flex-1 p-0.5 font-mono text-[5.2px] sm:text-[6px]">
                    
                    {/* 1. Invoice No (Orange Badge) */}
                    <div className="flex items-center justify-center text-center h-full px-0.5">
                      <span className="w-full text-[5.2px] sm:text-[6px] font-bold text-orange-955 bg-orange-50/70 border border-orange-200 py-0.5 rounded-xs font-mono break-all leading-none">
                        {log.invoiceNo || '—'}
                      </span>
                    </div>

                    {/* 2. Date */}
                    <div className="flex items-center justify-center text-center h-full px-0.5">
                      <span className="w-full text-[5px] sm:text-[5.8px] font-mono text-indigo-950 bg-indigo-50/40 border border-indigo-150 py-0.5 rounded-xs leading-none break-all font-semibold font-mono">
                        {log.date ? log.date.split('-').slice(0, 2).join('-') : '—'}
                      </span>
                    </div>

                    {/* 3. DO No */}
                    <div className="flex items-center justify-center text-center h-full px-0.5">
                      <span className="w-full text-[5.2px] sm:text-[6px] font-bold font-mono text-blue-950 bg-blue-50/50 border border-blue-200 py-0.5 rounded-xs break-all leading-none">
                        {log.doNo || '—'}
                      </span>
                    </div>

                    {/* 4. PO No */}
                    <div className="flex items-center justify-center text-center h-full px-0.5">
                      <span className="w-full text-[5.2px] sm:text-[6px] font-semibold font-mono text-teal-955 bg-teal-50 border border-teal-200 py-0.5 rounded-xs break-all leading-none">
                        {log.poNo || '—'}
                      </span>
                    </div>

                    {/* 5. Supplier */}
                    <div className="flex items-center justify-center text-center h-full px-0.5 leading-none">
                      <span className="w-full block text-[5px] sm:text-[5.6px] text-slate-900 font-sans font-semibold leading-tight break-words line-clamp-2 max-w-full text-center uppercase">
                        {log.supplierName || '—'}
                      </span>
                    </div>

                    {/* 6. Action Column - Direct Load & Save PDF (No Delete button on mobile!) */}
                    <div className="flex justify-center items-center gap-[3px] h-full font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDO(log);
                          setActiveSubTab('editor');
                        }}
                        className="w-[16px] h-[16px] bg-sky-600 hover:bg-sky-700 text-white rounded-xs transition-all cursor-pointer shadow-3xs active:scale-95 flex items-center justify-center shrink-0"
                        title="Open Details / Edit"
                      >
                        <Eye className="w-[10px] h-[10px] text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveDOAsPDF(log)}
                        className="w-[16px] h-[16px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs transition-all cursor-pointer shadow-3xs active:scale-95 flex items-center justify-center shrink-0"
                        title="Direct Print as PDF Document"
                      >
                        <Printer className="w-[10px] h-[10px] text-white" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Custom Confirmation Modal for Deletion - Bypasses Browser iFrame confirm blocks */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-black w-full max-w-sm p-6 shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-rose-600 tracking-tight mb-2 uppercase">⚠ Confirm Removal</h3>
            <p className="text-[10.5px] text-slate-600 mb-6 font-semibold leading-relaxed font-sans">
              Are you absolutely sure you want to permanently delete receiving note <strong className="font-semibold">{deleteTargetId.doNo}</strong>? This action will update the active ledger database and cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLogs(prev => prev.filter(l => l.id !== deleteTargetId.id));
                  triggerToast(`Removed log ${deleteTargetId.doNo}`);
                  setDeleteTargetId(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs uppercase transition-colors cursor-pointer"
              >
                Yes, Delete Record
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold text-xs uppercase border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT LAYOUT PREVIEW MODAL (A4 LANDSCAPE) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-[1100px] max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Top Control Header */}
            <div className="bg-slate-900 text-white p-3 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-sans font-black text-xs uppercase tracking-wide text-white">
                    {activeDO.type === 'coating' ? 'COATING GOODS RECEIVED NOTE PREVIEW' : 'GOODS RECEIVED NOTE PREVIEW'} (A4 LANDSCAPE)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">
                    GRN NO: {activeDO.doNo} | DATE: {activeDO.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDOAsPDF(activeDO)}
                  className="px-3.5 py-1.5 bg-[#f37021] hover:bg-[#d95d13] text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm uppercase tracking-wide"
                >
                  <Printer className="w-4 h-4" /> Print PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-[11px] font-bold cursor-pointer flex items-center gap-1 uppercase"
                >
                  <XCircle className="w-4 h-4" /> Close
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable A4 Landscape Rendered Document */}
            <div className="p-4 sm:p-6 bg-slate-200/80 overflow-auto flex-1 flex justify-center">
              <div className="bg-white border-2 border-black p-6 w-full max-w-[1020px] shadow-xl text-black font-sans text-[11px] leading-tight select-text space-y-3">
                
                {/* Header Grid */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[#f37021] font-bold text-xs uppercase">Deliver To:</div>
                    <div className="font-black text-sm text-black uppercase">{isMfi ? 'MARINE FASTENERS INDUSTRIES LLC' : (activeDO.deliverToName || activeCompany.name)}</div>
                    <div className="text-[10.5px] text-slate-800">{isMfi ? 'Industrial Area, Ajman, UAE' : (activeDO.deliverToAddress || (activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', '))}</div>
                    <div className="text-[10.5px] text-slate-800">Telephone: {isMfi ? '+971 6 525 0526' : (activeDO.deliverToPhone || activeCompany.phone || '—')}</div>
                    <div className="text-[10.5px] font-bold text-black">TRN: {isMfi ? '100440509600003' : (activeDO.deliverToTrn !== undefined ? activeDO.deliverToTrn : activeCompany.trn)}</div>
                  </div>
                  <div className="border-2 border-[#f37021] px-6 py-2 text-center min-w-[280px]">
                    <span className="text-[#f37021] text-lg font-black uppercase tracking-wider block">
                      {activeDO.type === 'coating' ? 'COATING GOODS RECEIVED NOTE' : 'GOODS RECEIVED NOTE'}
                    </span>
                  </div>
                </div>

                {/* Subheader Bar */}
                <div className="border-y border-black py-1 px-2 flex justify-between font-bold text-[11px]">
                  <div>GRN NO: {activeDO.doNo || ''}</div>
                  <div>GRN DATE: {activeDO.date || ''} <span className="ml-3 text-[#f37021] font-extrabold text-[10.5px]">(PAGE 2 / CONTINUED SHEET)</span></div>
                </div>

                {/* Details Grid */}
                <div className="flex justify-between gap-4">
                  <div className="flex-1 text-[11px]">
                    <div className="text-[#f37021] font-bold text-[11px] uppercase">Delivery From:</div>
                    <div className="font-black text-xs uppercase">{activeDO.supplierName || ''}</div>
                    <div className="text-[10.5px] uppercase mt-0.5">{activeDO.supplierAddress || ''}</div>
                    <div className="text-[10.5px] mt-0.5">Telephone: {activeDO.phone || ''}</div>
                    <div className="text-[10.5px] font-bold mt-0.5">TRN: {activeDO.trn || ''}</div>
                  </div>
                  <div className="w-[300px] text-[10.5px] space-y-0.5 font-bold">
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="w-1/2 text-left pr-2 text-slate-600">INVOICE NO :</span>
                      <span className="w-1/2 text-left">{activeDO.invoiceNo || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="w-1/2 text-left pr-2 text-slate-600">DO NUMBER :</span>
                      <span className="w-1/2 text-left">{activeDO.doNo || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="w-1/2 text-left pr-2 text-slate-600">PO NO :</span>
                      <span className="w-1/2 text-left">{activeDO.poNo || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="w-1/2 text-left pr-2 text-slate-600">DISPATCH BY :</span>
                      <span className="w-1/2 text-left">{activeDO.dispatchBy || ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="w-1/2 text-left pr-2 text-slate-600">DELIVERY TERMS :</span>
                      <span className="w-1/2 text-left">{activeDO.deliveryTerms || ''}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="w-1/2 text-left pr-2 text-slate-600">MADE IN :</span>
                      <span className="w-1/2 text-left">{activeDO.madeIn || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Material Items Table (Only valid non-dummy items) */}
                <table className="w-full border-collapse border border-black text-[10px]">
                  <thead>
                    {activeDO.type === 'coating' ? (
                      <tr className="bg-slate-50 border-b border-black font-medium uppercase text-[8px] text-center font-['Calibri','Arial_MT','Arial',sans-serif]">
                        <th className="border border-black p-1 w-[4%] font-medium text-[8px] text-slate-800">SL. NO.</th>
                        <th className="border border-black p-1 w-[20%] text-left pl-2 font-medium text-[8px] text-slate-800">ITEM DESCRIPTION</th>
                        <th className="border border-black p-1 w-[7%] font-medium text-[8px] text-slate-800">SIZE</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">FINISH</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">UNIT</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">QTY IN DO</th>
                        <th className="border border-black p-1 w-[7%] font-medium text-[8px] text-slate-800">DO RECEIVED</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">SHORTAGE</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">MARKING TYPE</th>
                        <th className="border border-black p-1 w-[7%] font-medium text-[8px] text-slate-800">MARKING VISIBLE</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">ADHESION</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">THREAD</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">MICRONS</th>
                        <th className="border border-black p-1 w-[8%] font-medium text-[8px] text-slate-800">FREE-RUNNING FIT TEST</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">QC NOTES</th>
                      </tr>
                    ) : (
                      <tr className="bg-slate-50 border-b border-black font-medium uppercase text-[8px] text-center font-['Calibri','Arial_MT','Arial',sans-serif]">
                        <th className="border border-black p-1 w-[4%] font-medium text-[8px] text-slate-800">SL. NO.</th>
                        <th className="border border-black p-1 w-[18%] text-left pl-2 font-medium text-[8px] text-slate-800">ITEM DESCRIPTION</th>
                        <th className="border border-black p-1 w-[7%] font-medium text-[8px] text-slate-800">SIZE</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">FINISH</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">UNIT</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">QTY IN DO</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">DO RECEIVED</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">SHORTAGE</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">MARKING</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">MARKING TYPE</th>
                        <th className="border border-black p-1 w-[7%] font-medium text-[8px] text-slate-800">MARKING VISIBLE</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">MICRONS</th>
                        <th className="border border-black p-1 w-[5%] font-medium text-[8px] text-slate-800">COATINGS</th>
                        <th className="border border-black p-1 w-[4%] font-medium text-[8px] text-slate-800">PITCH</th>
                        <th className="border border-black p-1 w-[4%] font-medium text-[8px] text-slate-800">THREAD</th>
                        <th className="border border-black p-1 w-[8%] font-medium text-[8px] text-slate-800">FREE-RUNNING FIT TEST</th>
                        <th className="border border-black p-1 w-[6%] font-medium text-[8px] text-slate-800">QC NOTES</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {getValidPrintItems(activeDO.items).map((row, idx) => {
                      const cleanStr = (val: any) => {
                        if (val === null || val === undefined) return '';
                        const s = String(val).replace(/&nbsp;/g, ' ').trim();
                        if (s === '—' || s === '0' || s === '0.00' || s === '0 0 0' || s === '0.0') return '';
                        return s;
                      };

                      const formatQty = (val: any) => {
                        if (val === undefined || val === null || (val as any) === '') return '';
                        const num = Number(val);
                        if (isNaN(num) || num === 0) return '';
                        return String(num);
                      };

                      const qInDO = formatQty(row.qty);
                      const qReceived = formatQty(row.qtyReceived);

                      let shortageDisplay = '';
                      let shortageNum = 0;
                      if (row.qty !== undefined && row.qty !== null && (row.qty as any) !== '' && !isNaN(Number(row.qty))) {
                        const qVal = Number(row.qty);
                        const rVal = (row.qtyReceived !== undefined && row.qtyReceived !== null && (row.qtyReceived as any) !== '' && !isNaN(Number(row.qtyReceived)))
                          ? Number(row.qtyReceived)
                          : qVal;
                        shortageNum = Math.max(0, qVal - rVal);
                        shortageDisplay = shortageNum > 0 ? String(shortageNum) : '';
                      }

                      const desc = cleanStr(row.description);
                      const size = cleanStr(row.size);
                      const finish = cleanStr(row.finish);
                      const unit = cleanStr(row.unit);
                      const microns = cleanStr(row.microns);
                      const marking = cleanStr(row.marking);
                      const pitch = cleanStr(row.pitch);
                      const threads = cleanStr(row.threads);
                      const remarks = cleanStr(row.remarks);
                      const qcNotes = cleanStr(row.qcNotes);
                      const adhesion = cleanStr(row.adhesionTest);
                      const mrkVis = cleanStr(row.markingVisible);

                      const getCellColor = (colKey: string) => row.cellColors?.[colKey] || sheetTextColor;

                      return (
                        <tr key={row.id || idx} style={{ fontFamily: sheetFont || "'Calibri', 'Arial MT', sans-serif", fontSize: sheetFontSize }} className="border-b border-black h-8 text-center uppercase font-medium">
                          <td className="border border-black p-1 font-bold" style={{ color: getCellColor('sn') }}>{idx + 1}</td>
                          <td className="border border-black p-1 text-left pl-2 font-bold" style={{ color: getCellColor('description') }} dangerouslySetInnerHTML={{ __html: desc || '' }} />
                          <td className="border border-black p-1" style={{ color: getCellColor('size') }} dangerouslySetInnerHTML={{ __html: size || '' }} />
                          <td className="border border-black p-1" style={{ color: getCellColor('finish') }} dangerouslySetInnerHTML={{ __html: finish || '' }} />
                          <td className="border border-black p-1 font-bold" style={{ color: getCellColor('unit') }} dangerouslySetInnerHTML={{ __html: unit || '' }} />
                          <td className="border border-black p-1 font-extrabold" style={{ color: getCellColor('qty') }}>{qInDO}</td>
                          <td className="border border-black p-1 font-extrabold" style={{ color: getCellColor('qtyReceived') }}>{qReceived}</td>
                          <td className={`border border-black p-1 font-extrabold ${shortageNum > 0 ? 'text-red-600 bg-red-50' : ''}`} style={{ color: shortageNum > 0 ? '#dc2626' : getCellColor('qtyReceived') }}>{shortageDisplay}</td>
                          {activeDO.type === 'coating' ? (
                            <>
                              <td className="border border-black p-1" style={{ color: getCellColor('markingType') }} dangerouslySetInnerHTML={{ __html: cleanStr(row.markingType) || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('markingVisible') }} dangerouslySetInnerHTML={{ __html: mrkVis || (desc ? 'YES' : '') }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('adhesionTest') }} dangerouslySetInnerHTML={{ __html: adhesion || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('threads') }} dangerouslySetInnerHTML={{ __html: threads || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('microns') }} dangerouslySetInnerHTML={{ __html: microns || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('remarks') }} dangerouslySetInnerHTML={{ __html: remarks || '' }} />
                              <td className="border border-black p-1 text-left pl-1" style={{ color: getCellColor('qcNotes') }} dangerouslySetInnerHTML={{ __html: qcNotes || '' }} />
                            </>
                          ) : (
                            <>
                              <td className="border border-black p-1" style={{ color: getCellColor('marking') }} dangerouslySetInnerHTML={{ __html: marking || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('markingType') }} dangerouslySetInnerHTML={{ __html: cleanStr(row.markingType) || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('markingVisible') }} dangerouslySetInnerHTML={{ __html: cleanStr(row.markingVisible) || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('microns') }} dangerouslySetInnerHTML={{ __html: microns || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('coatings') }} dangerouslySetInnerHTML={{ __html: cleanStr(row.coatings) || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('pitch') }} dangerouslySetInnerHTML={{ __html: pitch || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('threads') }} dangerouslySetInnerHTML={{ __html: threads || '' }} />
                              <td className="border border-black p-1" style={{ color: getCellColor('remarks') }} dangerouslySetInnerHTML={{ __html: remarks || '' }} />
                              <td className="border border-black p-1 text-left pl-1" style={{ color: getCellColor('qcNotes') }} dangerouslySetInnerHTML={{ __html: qcNotes || '' }} />
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Page End Notes Section / REMARKS */}
                <div className="border-1.5 border-black p-2.5 bg-white space-y-1 text-left text-[9px] text-black font-sans my-3">
                  <div className="font-extrabold uppercase border-b border-black pb-0.5 text-[9.5px]">
                    Free-Running Fit Test:
                  </div>
                  <div className="pt-0.5 space-y-0.5 font-medium leading-tight">
                    {getNotesLines(activeDO).map((line, i) => (
                      <div key={i}>{i + 1}. {line}</div>
                    ))}
                  </div>
                </div>

                {/* Signatures Section */}
                <div className="flex justify-between items-end pt-6 mt-auto border-t border-dotted border-slate-300 font-['Calibri','Arial_MT','Arial',sans-serif]">
                  <div className="w-[30%] text-center uppercase text-[10px]">
                    <span className="underline block mb-1 font-semibold">PREPARED BY</span>
                    <div className="text-[9.5px] font-normal text-black">{activeDO.receiverName || ''}</div>
                  </div>
                  <div className="w-[30%] text-center uppercase text-[10px]">
                    <span className="underline block mb-1 font-semibold">CHECKED BY</span>
                    <div className="text-[9.5px] font-normal text-black">{activeDO.qcCheckedBy || ''}</div>
                  </div>
                  <div className="w-[30%] text-center uppercase text-[10px]">
                    <span className="underline block mb-1 font-semibold">APPROVED BY</span>
                  </div>
                </div>

                <div className="border-t border-slate-300 pt-2 text-[9.5px] text-slate-700 flex justify-between items-center font-mono font-bold">
                  <span>GRN NO: {activeDO.doNo} | CONTINUED SHEET (PAGE 2)</span>
                  <span>PAGE 1 OF 2 / PAGE 2 OF 2</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GRN HEADER MODAL */}
      {isEditHeaderOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">EDIT GRN HEADER & SUPPLIER DETAILS</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditHeaderOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto space-y-4 text-xs font-sans">
              {/* Supplier Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-[#f37021] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Delivery From (Supplier Info)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Supplier Name</label>
                    <input
                      type="text"
                      value={activeDO.supplierName}
                      onChange={(e) => handleUpdateField('supplierName', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="ENTER SUPPLIER NAME"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Supplier Address / Location</label>
                    <input
                      type="text"
                      value={activeDO.supplierAddress}
                      onChange={(e) => handleUpdateField('supplierAddress', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 uppercase text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="ADDRESS, CITY, UAE"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Telephone</label>
                    <input
                      type="text"
                      value={activeDO.phone}
                      onChange={(e) => handleUpdateField('phone', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="TEL/FAX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">TRN Number</label>
                    <input
                      type="text"
                      value={activeDO.trn}
                      onChange={(e) => handleUpdateField('trn', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="TRN 100..."
                    />
                  </div>
                </div>
              </div>

              {/* Transaction Reference Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-[#f37021] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Transaction References
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">GRN Date</label>
                    <input
                      type="text"
                      value={activeDO.date}
                      onChange={(e) => handleUpdateField('date', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">DO Number</label>
                    <input
                      type="text"
                      value={activeDO.doNo}
                      onChange={(e) => handleUpdateField('doNo', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="DO-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Invoice Number</label>
                    <input
                      type="text"
                      value={activeDO.invoiceNo}
                      onChange={(e) => handleUpdateField('invoiceNo', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="INV-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">PO Number</label>
                    <input
                      type="text"
                      value={activeDO.poNo}
                      onChange={(e) => handleUpdateField('poNo', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="PO-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Dispatch By</label>
                    <input
                      type="text"
                      value={activeDO.dispatchBy}
                      onChange={(e) => handleUpdateField('dispatchBy', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 uppercase text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="BY ROAD (TRAILER)"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Delivery Terms</label>
                    <input
                      type="text"
                      value={activeDO.deliveryTerms}
                      onChange={(e) => handleUpdateField('deliveryTerms', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 uppercase text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="DDP - DUBAI PORT"
                    />
                  </div>
                </div>
              </div>

              {/* Signatories */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-[#f37021] text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Signatories & Quality Officers
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Prepared By (Receiver)</label>
                    <input
                      type="text"
                      value={activeDO.receiverName}
                      onChange={(e) => handleUpdateField('receiverName', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Checked By (QC Inspector)</label>
                    <input
                      type="text"
                      value={activeDO.qcCheckedBy}
                      onChange={(e) => handleUpdateField('qcCheckedBy', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-3 px-5 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsEditHeaderOpen(false);
                  triggerToast('Saved Header Details!');
                }}
                className="px-4 py-1.5 bg-[#f37021] hover:bg-[#d95d13] text-white font-bold text-xs rounded-lg transition-all cursor-pointer uppercase shadow-xs"
              >
                Done & Apply Header
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASTE EXCEL MODAL */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">PASTE TABLE DATA FROM EXCEL</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-sans text-xs">
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                Copy rows directly from Microsoft Excel or Google Sheets (Ctrl+C), then paste (Ctrl+V) into the box below. The system will map columns row-by-row into your Goods Received Note table.
              </p>
              <textarea
                rows={6}
                value={excelPasteText}
                onChange={(e) => setExcelPasteText(e.target.value)}
                placeholder="Paste Excel tabular rows here (Columns: Description, Size, Finish, Unit, Qty...)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const clipText = await navigator.clipboard.readText();
                      if (clipText) {
                        setExcelPasteText(clipText);
                        triggerToast('Read data from clipboard!');
                      }
                    } catch (err) {
                      alert('Please press Ctrl+V inside the text box to paste your clipboard data.');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" /> Read Clipboard
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPasteModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] rounded transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!excelPasteText.trim()) {
                        alert('Please paste or enter tabular Excel data first.');
                        return;
                      }
                      const startRow = selectedCells ? selectedCells.startRow : 0;
                      handlePasteExcelData(excelPasteText, startRow);
                      setExcelPasteText('');
                      setIsPasteModalOpen(false);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded transition-all cursor-pointer shadow-xs uppercase"
                  >
                    Import Row-By-Row
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
