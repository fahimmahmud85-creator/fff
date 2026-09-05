import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile, getCompanyIsoText, isMarineFastenersCompany } from '../utils/companyProfile';
import { 
  Plus, Trash2, Printer, Check, Search, Calendar, Save, FileText, Layers, RotateCcw, Sparkles, Eye,
  FilePlus, Edit3, XCircle, PackageCheck, Building2, Undo2, Redo2, Upload, Image as ImageIcon, X, Tag, Database,
  Download, AlertTriangle, ChevronDown, ChevronUp, Copy, CheckCircle2
} from 'lucide-react';

export const MARKING_PRESETS = [
  {
    label: '10S',
    val: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="26" viewBox="0 0 70 26"><rect x="1.5" y="1.5" width="67" height="23" rx="3" fill="none" stroke="%23000000" stroke-width="2.5"/><text x="35" y="18" font-family="Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle" fill="%23000000">10S</text></svg>'
  },
  {
    label: 'MF 10S',
    val: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="85" height="26" viewBox="0 0 85 26"><rect x="1.5" y="1.5" width="82" height="23" rx="3" fill="none" stroke="%23000000" stroke-width="2.5"/><text x="42.5" y="18" font-family="Arial, sans-serif" font-size="13" font-weight="900" text-anchor="middle" fill="%23000000">MF 10S</text></svg>'
  }
];

export interface MaterialGDNItem {
  id: string;
  sn: number;
  description: string;
  size: string;
  finish: string;
  unit: string;
  qty: number; // Represents 'Qty Ordered'
  qtyReceived?: number; // Represents 'Qty Delivered'
  shortage?: number; // Represents 'Shortage Qty'
  marking: string;
  markingType?: string;
  markingVisible?: string;
  markingImage?: string; // Optional uploaded transparent marking image
  adhesionTest?: string;
  threads?: string;
  microns?: string;
  coatings?: string;
  remarks: string;
  qcNotes: string;
  cellColors?: Record<string, string>;
}

export const DEFAULT_CUSTOMER_DIRECTORY: Array<{ name: string; address?: string; phone?: string; trn?: string }> = [
  { name: 'AL HABTOOR ENGINEERING ENTERPRISES', address: 'PO BOX 2248, DUBAI, UAE', phone: '+971 4 285 7555', trn: '100023459100003' },
  { name: 'EMIRATES STEEL ARKAN', address: 'ICAD I, MUSAFFAH, ABU DHABI, UAE', phone: '+971 2 551 1111', trn: '100388472900003' },
  { name: 'DUCAB CABLES LLC', address: 'PO BOX 11529, JEBEL ALI, DUBAI, UAE', phone: '+971 4 815 8888', trn: '100299482100003' },
  { name: 'SOBHA REALTY CONSTRUCTION', address: 'SOBHA HARTLAND, MEYDAN, DUBAI, UAE', phone: '+971 4 400 0000', trn: '100455829100003' },
  { name: 'MFI COATING LLC', address: 'INDUSTRIAL AREA 2, AJMAN, UAE', phone: '+971 6 525 0526', trn: '100440509600003' },
  { name: 'MFI FASTENERS TRADING LLC', address: 'AL QUOZ INDUSTRIAL 3, DUBAI, UAE', phone: '+971 4 340 0000', trn: '100440509600004' },
  { name: 'DANWAY ELECTRICAL & MECHANICAL', address: 'AL QUOZ 3, DUBAI, UAE', phone: '+971 4 347 3700', trn: '100039281000003' },
  { name: 'AL FARAA GENERAL CONTRACTING', address: 'AL AIN, ABU DHABI, UAE', phone: '+971 3 761 9999', trn: '100201928300003' },
  { name: 'DSI STRUCTURAL STEEL LLC', address: 'DIC, JEBEL ALI, DUBAI, UAE', phone: '+971 4 885 4444', trn: '100511928300003' },
  { name: 'BENTLEY OIL & GAS SERVICES', address: 'HAMRIYAH FREE ZONE, SHARJAH, UAE', phone: '+971 6 526 1111', trn: '100192837400003' },
  { name: 'AL SHAFAR GENERAL CONTRACTING (ASGC)', address: 'BUSINESS BAY, DUBAI, UAE', phone: '+971 4 338 5555', trn: '100018273600003' },
  { name: 'STEEL FABRICATION & ERECTION LLC', address: 'SAJAA INDUSTRIAL AREA, SHARJAH, UAE', phone: '+971 6 531 2222', trn: '100827364500003' },
  { name: 'BIN LADEN CONTRACTING GROUP', address: 'SHARJAH, UAE', phone: '+971 6 559 1111', trn: '100482736100003' }
];

export interface MaterialGDN {
  id: string;
  type: 'standard' | 'coating' | 'grn' | 'coating_grn' | string;
  documentTitle?: string;
  invoiceNo: string;
  doNo: string; // Used internally as GDN number
  date: string;
  poNo: string;
  dispatchBy: string;
  deliveryTerms: string;
  madeIn: string;
  supplierName: string; // Used internally as Customer name
  supplierAddress: string; // Used internally as Customer address
  trn: string;
  phone: string;
  attentionTo: string;
  receiverName: string; // Received by (Customer Rep)
  qcCheckedBy: string; // QC Dispatched checked by
  notes?: string; // Optional notes/terms
  notesLine1?: string;
  notesLine2?: string;
  notesLine3?: string;
  notesLine4?: string;
  notesLines?: string[];
  deliveryFromName?: string;
  deliveryFromAddress?: string;
  deliveryFromPhone?: string;
  deliveryFromTrn?: string;
  items: MaterialGDNItem[];
  
  // Outbound / AR invoice tracking
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

  // Forklift / Crane Payments Fields
  forkliftOperator?: string;
  forkliftStartTime?: string;
  forkliftEndTime?: string;
  forkliftTotalHours?: number;
  forkliftCharges?: number;
  forkliftPaidAmount?: number;
  forkliftDate?: string;
  forkliftBalanceAmount?: number;
  forkliftPaymentStatus?: string;
  receivedLocation?: string; // Delivery shed location
}

interface GDNContentEditableProps {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  isCellSelected?: boolean;
  cellColor?: string;
  dataRow?: number;
  dataCol?: string;
  className?: string;
  style?: React.CSSProperties;
}

const GDNContentEditable: React.FC<GDNContentEditableProps> = ({
  value,
  onChange,
  onFocus,
  onKeyDown,
  onPaste,
  onMouseUp,
  onKeyUp,
  isCellSelected,
  cellColor,
  dataRow,
  dataCol,
  className = "",
  style = {},
}) => {
  const divRef = useRef<HTMLDivElement>(null);

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
        if (onFocus) onFocus();
      }}
      onBlur={(e) => {
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
      data-gdn-row={dataRow}
      data-gdn-col={dataCol}
      style={{
        ...style,
        ...(cellColor ? { color: cellColor } : {})
      }}
      className={`w-full focus:outline-none focus:bg-amber-100 ${
        isCellSelected ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''
      } ${className}`}
    />
  );
};

const createBlankItems = (count = 12): MaterialGDNItem[] => {
  return Array.from({ length: count }, (_, idx) => ({
    id: 'gd-it-' + (idx + 1) + '-' + Math.random().toString(36).substring(2, 7),
    sn: idx + 1,
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
    remarks: '',
    qcNotes: ''
  }));
};

const PRESET_STANDARD_GDN: MaterialGDN = {
  id: 'DISP-101',
  type: 'standard',
  invoiceNo: '',
  doNo: 'WO-40510',
  date: new Date().toISOString().substring(0, 10),
  poNo: '',
  dispatchBy: 'MARINE FASTENERS TRUCK',
  deliveryTerms: 'DDP - SITE DELIVERY',
  madeIn: 'UAE',
  supplierName: '',
  supplierAddress: '',
  trn: '',
  phone: '',
  attentionTo: '',
  receiverName: '',
  qcCheckedBy: '',
  items: createBlankItems(12),
  invoiceAmounts: 0,
  invoicePaid: 0,
  invoiceDate: new Date().toISOString().substring(0, 10),
  invoiceBalance: 0,
  invoicePaidBy: 'BANK WIRE',
  invoiceReceivedVia: '',
  invoiceAwbNo: '',
  transportCharges: 0,
  transportPaidAmount: 0,
  transportDate: new Date().toISOString().substring(0, 10),
  transportBalanceAmount: 0,
  transportPaymentStatus: 'PENDING',
  forkliftOperator: '',
  forkliftStartTime: '',
  forkliftEndTime: '',
  forkliftTotalHours: 0,
  forkliftCharges: 0,
  forkliftPaidAmount: 0,
  forkliftDate: new Date().toISOString().substring(0, 10),
  forkliftBalanceAmount: 0,
  forkliftPaymentStatus: 'PENDING',
  receivedLocation: ''
};

const DEFAULT_GDN_SAMPLES: MaterialGDN[] = [
  {
    id: 'DISP-SAMPLE-001',
    type: 'standard',
    documentTitle: 'GOODS DISPATCHED NOTE',
    doNo: 'WO-40510',
    date: new Date().toISOString().substring(0, 10),
    poNo: 'PO-99201',
    invoiceNo: 'INV-3001',
    dispatchBy: 'MARINE FASTENERS TRUCK',
    deliveryTerms: 'DDP - SITE DELIVERY',
    madeIn: 'UAE',
    supplierName: 'EMIRATES STEEL ARKAN',
    supplierAddress: 'ICAD I, MUSAFFAH, ABU DHABI, UAE',
    trn: '100388472900003',
    phone: '+971 2 551 1111',
    attentionTo: 'MOHAMMED AL-KHOORI',
    receiverName: 'M. KHOORI',
    qcCheckedBy: 'QA/QC INSPECTOR - HASAN',
    items: [
      {
        id: 'item-1',
        sn: 1,
        description: 'HEX BOLT M16 X 65MM GRADE 8.8 GALVANIZED',
        size: 'M16 x 65',
        finish: 'HDG',
        unit: 'PCS',
        qty: 500,
        qtyReceived: 500,
        shortage: 0,
        marking: 'MF 8.8',
        microns: '55µm',
        coatings: 'HOT DIP GALV',
        threads: '6G',
        remarks: 'INSPECTED OK',
        qcNotes: 'APPROVED'
      },
      {
        id: 'item-2',
        sn: 2,
        description: 'PLAIN WASHER M16 GRADE 8 HDG',
        size: 'M16',
        finish: 'HDG',
        unit: 'PCS',
        qty: 1000,
        qtyReceived: 950,
        shortage: 50,
        marking: 'MF',
        microns: '50µm',
        coatings: 'HOT DIP GALV',
        threads: '—',
        remarks: '50 PCS SHORTAGE TO BE DISPATCHED TOMORROW',
        qcNotes: 'PARTIAL DELIVER'
      }
    ],
    invoiceAmounts: 4500,
    invoicePaid: 4500,
    invoiceDate: new Date().toISOString().substring(0, 10),
    invoiceBalance: 0,
    invoicePaidBy: 'BANK WIRE',
    invoiceReceivedVia: '',
    invoiceAwbNo: '',
    transportCharges: 0,
    transportPaidAmount: 0,
    transportDate: new Date().toISOString().substring(0, 10),
    transportBalanceAmount: 0,
    transportPaymentStatus: 'PENDING',
    forkliftOperator: '',
    forkliftStartTime: '',
    forkliftEndTime: '',
    forkliftTotalHours: 0,
    forkliftCharges: 0,
    forkliftPaidAmount: 0,
    forkliftDate: new Date().toISOString().substring(0, 10),
    forkliftBalanceAmount: 0,
    forkliftPaymentStatus: 'PENDING',
    receivedLocation: ''
  },
  {
    id: 'DISP-SAMPLE-002',
    type: 'coating',
    documentTitle: 'COATING GOODS DISPATCH NOTES',
    doNo: 'CGDN-88102',
    date: new Date().toISOString().substring(0, 10),
    poNo: 'PO-88340',
    invoiceNo: 'INV-4022',
    dispatchBy: 'MARINE FASTENERS LOGISTICS',
    deliveryTerms: 'EX-WORKS AJMAN',
    madeIn: 'UAE',
    supplierName: 'AL HABTOOR ENGINEERING CONTRACTING',
    supplierAddress: 'JEBEL ALI FREEZONE, DUBAI, UAE',
    trn: '100299482100003',
    phone: '+971 4 883 2200',
    attentionTo: 'TARIQ M.',
    receiverName: 'TARIQ M.',
    qcCheckedBy: 'QA/QC INSPECTOR - RASHID',
    items: [
      {
        id: 'coat-item-1',
        sn: 1,
        description: 'STUD BOLT 3/4" X 120MM B7 PTFE COATED BLUE',
        size: '3/4" x 120',
        finish: 'XYLAN 1424',
        unit: 'PCS',
        qty: 300,
        qtyReceived: 300,
        shortage: 0,
        marking: 'B7 XYLAN',
        microns: '25-30µm',
        coatings: 'PTFE BLUE',
        threads: '2A',
        remarks: 'SALT SPRAY TEST PASSED (1000 HRS)',
        qcNotes: 'QC PASSED'
      },
      {
        id: 'coat-item-2',
        sn: 2,
        description: 'HEAVY HEX NUT 3/4" 2H PTFE COATED BLUE',
        size: '3/4"',
        finish: 'XYLAN 1424',
        unit: 'PCS',
        qty: 600,
        qtyReceived: 600,
        shortage: 0,
        marking: '2H',
        microns: '25-30µm',
        coatings: 'PTFE BLUE',
        threads: '2B',
        remarks: 'THREAD FIT CHECK OK',
        qcNotes: 'QC PASSED'
      }
    ],
    invoiceAmounts: 7800,
    invoicePaid: 7800,
    invoiceDate: new Date().toISOString().substring(0, 10),
    invoiceBalance: 0,
    invoicePaidBy: 'BANK WIRE',
    invoiceReceivedVia: '',
    invoiceAwbNo: '',
    transportCharges: 0,
    transportPaidAmount: 0,
    transportDate: new Date().toISOString().substring(0, 10),
    transportBalanceAmount: 0,
    transportPaymentStatus: 'PENDING',
    forkliftOperator: '',
    forkliftStartTime: '',
    forkliftEndTime: '',
    forkliftTotalHours: 0,
    forkliftCharges: 0,
    forkliftPaidAmount: 0,
    forkliftDate: new Date().toISOString().substring(0, 10),
    forkliftBalanceAmount: 0,
    forkliftPaymentStatus: 'PENDING',
    receivedLocation: ''
  }
];

interface DispatchedMaterialsProps {
  initialActiveSubTab?: 'editor' | 'record';
}

export const DispatchedMaterialsComponent: React.FC<DispatchedMaterialsProps> = ({ initialActiveSubTab = 'editor' }) => {
  const [logs, setLogs] = useState<MaterialGDN[]>(() => {
    const saved = localStorage.getItem('MFI_DISPATCHED_MATERIALS_LEDGER');
    let loadedList: MaterialGDN[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedList = parsed;
        }
      } catch (e) {}
    }
    const filtered = loadedList.filter(d => d.id !== 'DISP-101');
    return filtered.length > 0 ? filtered : DEFAULT_GDN_SAMPLES;
  });

  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'record'>('editor');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());

  // Listen for company profile changes and company switching
  useEffect(() => {
    const handleSync = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    window.addEventListener('active_company_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
      window.removeEventListener('active_company_changed', handleSync);
    };
  }, []);
  
  // Workspace Active Document State with localStorage Persistence for Sheet Stability
  const [activeDO, setActiveDO] = useState<MaterialGDN>(() => {
    const savedActive = localStorage.getItem('MFI_ACTIVE_GDN_SHEET');
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed && typeof parsed === 'object' && parsed.doNo) {
          return parsed;
        }
      } catch (e) {}
    }
    return PRESET_STANDARD_GDN;
  });

  // Keep activeDO synchronized in localStorage
  useEffect(() => {
    if (activeDO) {
      localStorage.setItem('MFI_ACTIVE_GDN_SHEET', JSON.stringify(activeDO));
    }
  }, [activeDO]);

  // Keep saved logs synchronized if activeDO is edited
  useEffect(() => {
    if (activeDO && activeDO.id) {
      setLogs(prev => {
        const exists = prev.some(l => l.id === activeDO.id || l.doNo === activeDO.doNo);
        if (exists) {
          return prev.map(l => (l.id === activeDO.id || l.doNo === activeDO.doNo) ? activeDO : l);
        }
        return prev;
      });
    }
  }, [activeDO]);

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState<boolean>(false);

  // Customer Auto-Suggestions Interactive Dropdown State
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState<boolean>(false);
  const [customerHighlightIndex, setCustomerHighlightIndex] = useState<number>(0);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Close customer dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Ledger Database
  const [searchQuery, setSearchQuery] = useState('');

  // Remarks / Page-end Notes dynamic line helpers
  const getNotesLines = useCallback((doc: MaterialGDN): string[] => {
    if (doc.notesLines && Array.isArray(doc.notesLines) && doc.notesLines.length > 0) {
      return doc.notesLines;
    }
    const isGRNDoc = doc.type === 'grn' || doc.type === 'coating_grn' || (doc.documentTitle || '').toUpperCase().includes('RECEIVED NOTE');
    const line1 = doc.notesLine1 !== undefined ? doc.notesLine1 : (isGRNDoc ? 'All incoming materials received, offloaded, and inspected as per Delivery Advice & Purchase Order terms.' : 'Goods received in good order & condition as per Purchase Order and agreed specifications.');
    const line2 = doc.notesLine2 !== undefined ? doc.notesLine2 : (isGRNDoc ? 'Material Test Certificates (MTC), heat numbers, and mill reports verified against shipment markings.' : 'Any discrepancy, damage, or shortage must be reported to Marine Fasteners Industries LLC within 24 hours of delivery.');
    const line3 = doc.notesLine3 !== undefined ? doc.notesLine3 : (isGRNDoc ? 'Physical quantity count and visual quality inspection completed upon receipt at store premises.' : 'Received items are subject to final QA/QC inspection and site installation verification.');
    const line4 = doc.notesLine4 !== undefined ? doc.notesLine4 : (doc.notes || (isGRNDoc ? 'Received materials logged and updated into store inventory records.' : 'Goods once delivered and accepted cannot be returned without prior written authorization.'));
    
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
  const [filterType, setFilterType] = useState<'all' | 'gdn' | 'grn' | 'coating' | 'standard' | 'shortage'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<{ id: string; doNo: string } | null>(null);

  // Dynamic Customer Auto-Suggestions List from Accounts Registry & GDN/GRN Logs
  const customerSuggestions = useMemo(() => {
    const map = new Map<string, { name: string; address?: string; phone?: string; trn?: string }>();
    
    const addEntry = (nameVal: string, addressVal?: string, phoneVal?: string, trnVal?: string) => {
      if (!nameVal || !nameVal.trim()) return;
      const key = nameVal.trim().toUpperCase();
      if (!map.has(key)) {
        map.set(key, {
          name: key,
          address: addressVal || '',
          phone: phoneVal || '',
          trn: trnVal || ''
        });
      } else {
        const existing = map.get(key)!;
        map.set(key, {
          name: key,
          address: existing.address || addressVal || '',
          phone: existing.phone || phoneVal || '',
          trn: existing.trn || trnVal || ''
        });
      }
    };

    // 1. Default customer directory
    DEFAULT_CUSTOMER_DIRECTORY.forEach(c => addEntry(c.name, c.address, c.phone, c.trn));

    // 2. LocalStorage: Accounts Registry (Sales Clients & Purchase Suppliers)
    ['MF_REGISTERED_CUSTOMERS', 'MFI_ERP_CUSTOMERS', 'MFI_REGISTERED_SUPPLIERS', 'MFI_ACCOUNTS_CLIENTS'].forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach((item: any) => {
              const name = item.companyName || item.name || item.supplierName || item.clientName || '';
              const addr = item.address || item.supplierAddress || '';
              const ph = item.phone || item.mobile || item.tel || '';
              const trn = item.trn || item.vatTrn || item.taxTrn || '';
              addEntry(name, addr, ph, trn);
            });
          }
        } catch (e) {}
      }
    });

    // 3. Saved GDN/GRN logs
    logs.forEach(doc => {
      if (doc.supplierName) {
        addEntry(doc.supplierName, doc.supplierAddress, doc.phone, doc.trn);
      }
    });

    return Array.from(map.values());
  }, [logs]);

  // Matching Customer Suggestions for Active Input
  const matchingSuggestions = useMemo(() => {
    const query = (activeDO.supplierName || '').trim().toUpperCase();
    if (!query) return [];
    return customerSuggestions.filter(c => c.name.toUpperCase().includes(query)).slice(0, 8);
  }, [customerSuggestions, activeDO.supplierName]);

  // Reset highlight index when suggestions list updates
  useEffect(() => {
    setCustomerHighlightIndex(0);
  }, [matchingSuggestions.length]);

  // Select a customer from auto-suggestions
  const handleSelectCustomerSuggestion = (cust: { name: string; address?: string; phone?: string; trn?: string }) => {
    setActiveDO(prev => ({
      ...prev,
      supplierName: cust.name,
      supplierAddress: cust.address || '',
      phone: cust.phone || '',
      trn: cust.trn || ''
    }));
    setIsCustomerDropdownOpen(false);
    triggerToast(`✨ Auto-filled customer: ${cust.name}`);
  };

  // Keyboard navigation for customer input (ArrowDown, ArrowUp, Enter, Escape)
  const handleCustomerInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextFocusId?: string
  ) => {
    if (matchingSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isCustomerDropdownOpen) {
          setIsCustomerDropdownOpen(true);
          setCustomerHighlightIndex(0);
        } else {
          setCustomerHighlightIndex(prev => (prev + 1) % matchingSuggestions.length);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isCustomerDropdownOpen) {
          setCustomerHighlightIndex(prev => (prev - 1 + matchingSuggestions.length) % matchingSuggestions.length);
        }
        return;
      }

      if (e.key === 'Enter') {
        if (isCustomerDropdownOpen && matchingSuggestions[customerHighlightIndex]) {
          e.preventDefault();
          handleSelectCustomerSuggestion(matchingSuggestions[customerHighlightIndex]);
          if (nextFocusId) {
            const nextEl = document.getElementById(nextFocusId);
            if (nextEl) nextEl.focus();
          }
          return;
        }
      }

      if (e.key === 'Escape') {
        setIsCustomerDropdownOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (nextFocusId) {
        const nextEl = document.getElementById(nextFocusId);
        if (nextEl) nextEl.focus();
      }
    }
  };

  // Sequential Document Number Generator (GDN-86789, GDN-86790, GDN-86791...)
  const generateNextDocNo = (docType: string): string => {
    let prefix = 'GDN';
    if (docType === 'grn') prefix = 'GRN';
    else if (docType === 'coating') prefix = 'CGDN';
    else if (docType === 'coating_grn') prefix = 'CGRN';

    const allDocs = [...logs];
    if (activeDO?.doNo) {
      allDocs.push(activeDO);
    }

    let maxNum = 86788; // Default base number, so first generated is 86789

    allDocs.forEach(doc => {
      if (!doc.doNo) return;
      const match = doc.doNo.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum && num < 9999999) {
          maxNum = num;
        }
      }
    });

    return `${prefix}-${maxNum + 1}`;
  };

  const handleCustomerNameChange = (val: string) => {
    const trimmed = val.trim();
    const uppercaseVal = trimmed.toUpperCase();
    
    // IF WE CUT/CLEAR COMPANY NAME, AUTOMATICALLY REMOVE ADDRESS, PHONE, AND TRN!
    if (!trimmed) {
      setActiveDO(prev => ({
        ...prev,
        supplierName: '',
        supplierAddress: '',
        phone: '',
        trn: ''
      }));
      return;
    }

    const match = customerSuggestions.find(c => c.name.toUpperCase().trim() === uppercaseVal);
    
    setActiveDO(prev => ({
      ...prev,
      supplierName: val,
      supplierAddress: match ? (match.address || '') : prev.supplierAddress,
      phone: match ? (match.phone || '') : prev.phone,
      trn: match ? (match.trn || '') : prev.trn
    }));

    if (match) {
      triggerToast(`✨ Auto-filled details for ${match.name}`);
    }
  };
  const [sheetFont, setSheetFont] = useState<string>('Inter, sans-serif');
  const [sheetFontSize, setSheetFontSize] = useState<string>('10px');
  const [sheetTextColor, setSheetTextColor] = useState<string>('#000000');

  // History state for Undo / Redo in GDN Sheet
  const [itemsHistory, setItemsHistory] = useState<MaterialGDNItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const itemsHistoryRef = useRef<MaterialGDNItem[][]>([]);
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

  const recordItemsHistory = (newItems: MaterialGDNItem[]) => {
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
    const isCoatingDoc = activeDO.type === 'coating';
    const activeCols = isCoatingDoc
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'threads', 'remarks', 'qcNotes'];
    
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
    const isCoatingDoc = activeDO.type === 'coating';
    const activeCols = isCoatingDoc
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'threads', 'remarks', 'qcNotes'];
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

  // Parse and paste Excel tabular data row-by-row
  const handlePasteExcelData = (rawText: string, targetRowIndex: number = 0, targetColId?: string) => {
    if (!rawText || !rawText.trim()) return;

    const lines = rawText.split(/\r?\n/).filter(line => line.length > 0);
    if (lines.length === 0) return;

    const isCoatingDoc = activeDO.type === 'coating';
    const activeCols = isCoatingDoc
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'threads', 'remarks', 'qcNotes'];

    let startColIndex = 0;
    if (targetColId && activeCols.includes(targetColId)) {
      startColIndex = activeCols.indexOf(targetColId);
    }

    const updatedItems = [...activeDO.items];

    lines.forEach((line, rOffset) => {
      const rowIdx = targetRowIndex + rOffset;
      let cells = line.split('\t');
      if (cells.length === 1 && line.includes(',')) {
        cells = line.split(',');
      }

      if (!updatedItems[rowIdx]) {
        updatedItems[rowIdx] = {
          id: 'gd-it-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          sn: rowIdx + 1,
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
          remarks: '',
          qcNotes: ''
        };
      }

      const item = { ...updatedItems[rowIdx] };

      cells.forEach((val, cOffset) => {
        const colIdx = startColIndex + cOffset;
        if (colIdx < activeCols.length) {
          const colField = activeCols[colIdx] as keyof MaterialGDNItem;
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

    triggerToast(`📋 Excel Paste Success: ${lines.length} row(s) updated!`);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLElement>, rowIndex: number, colKey: string) => {
    const pasteData = e.clipboardData.getData('text');
    if (!pasteData) return;
    if (pasteData.includes('\t') || pasteData.includes('\n') || pasteData.includes('\r')) {
      e.preventDefault();
      handlePasteExcelData(pasteData, rowIndex, colKey);
    }
  };

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

  // Apply text color specifically to selected words OR selected cells
  const handleApplyTextColor = (colorHex: string) => {
    if (!activeDO || !activeDO.items || activeDO.items.length === 0) return;

    // 1. Check active window selection for a highlighted word/text
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      let containerEl: HTMLElement | null = null;
      let node: Node | null = selection.anchorNode;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).hasAttribute('data-gdn-row')) {
          containerEl = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }

      if (!containerEl) {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && activeEl.hasAttribute('data-gdn-row')) {
          containerEl = activeEl;
        }
      }

      if (containerEl) {
        const rIdx = parseInt(containerEl.getAttribute('data-gdn-row') || '0', 10);
        const colId = containerEl.getAttribute('data-gdn-col') || 'description';

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
        savedTextSelectionRef.current = null;
        triggerToast(`✓ Applied text color to selection`);
        return;
      }
    }

    // 2. Check saved text selection from input focus
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
        savedTextSelectionRef.current = null;
        triggerToast(`✓ Applied text color to word`);
        return;
      }
    }

    // 3. Fall back to cell / cell range color
    const isCoatingDoc = activeDO.type === 'coating';
    const activeCols = isCoatingDoc
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'threads', 'remarks', 'qcNotes'];

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
        if (activeEl && activeEl.getAttribute('data-gdn-row') !== null) {
          const rowAttr = parseInt(activeEl.getAttribute('data-gdn-row') || '0', 10);
          const colAttr = activeEl.getAttribute('data-gdn-col') || '';
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
    setSheetTextColor(colorHex || '#000000');
    triggerToast(colorHex ? `✓ Applied text color to ${affectedCount} selected cell(s)` : `✓ Reset text color for ${affectedCount} selected cell(s)`);
  };

  // Persist Ledger Logs
  useEffect(() => {
    localStorage.setItem('MFI_DISPATCHED_MATERIALS_LEDGER', JSON.stringify(logs));
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

  // Handle creating a new blank GDN
  const handleCreateNewGDN = () => {
    const nextNo = generateNextDocNo('standard');
    setActiveDO({
      id: 'DISP-' + Date.now(),
      type: 'standard',
      documentTitle: 'GOODS DISPATCHED NOTE',
      invoiceNo: '',
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
      poNo: '',
      dispatchBy: 'MARINE FASTENERS TRUCK',
      deliveryTerms: 'DDP - SITE DELIVERY',
      madeIn: 'UAE',
      supplierName: '',
      supplierAddress: '',
      trn: '',
      phone: '',
      attentionTo: '',
      receiverName: '',
      qcCheckedBy: '',
      items: createBlankItems(12),
      invoiceAmounts: 0,
      invoicePaid: 0,
      invoiceDate: new Date().toISOString().substring(0, 10),
      invoiceBalance: 0,
      invoicePaidBy: 'BANK WIRE',
      invoiceReceivedVia: '',
      invoiceAwbNo: '',
      transportCharges: 0,
      transportPaidAmount: 0,
      transportDate: new Date().toISOString().substring(0, 10),
      transportBalanceAmount: 0,
      transportPaymentStatus: 'PENDING',
      forkliftOperator: '',
      forkliftStartTime: '',
      forkliftEndTime: '',
      forkliftPaymentStatus: 'PENDING',
      receivedLocation: ''
    });
    setActiveSubTab('editor');
    triggerToast(`✨ Created new document: ${nextNo}`);
  };

  // Handle loading standard preset GDN
  const handleLoadStandardPreset = () => {
    const nextNo = generateNextDocNo('standard');
    setActiveDO({
      ...PRESET_STANDARD_GDN,
      id: 'DISP-' + Date.now(),
      type: 'standard',
      documentTitle: 'GOODS DISPATCHED NOTE',
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
      items: createBlankItems(12)
    });
    setActiveSubTab('editor');
    triggerToast(`⚡ Loaded Standard GDN preset: ${nextNo}`);
  };

  // Handle loading coating preset GDN
  const handleLoadCoatingPreset = () => {
    const nextNo = generateNextDocNo('coating');
    setActiveDO({
      ...PRESET_STANDARD_GDN,
      id: 'DISP-' + Date.now(),
      type: 'coating',
      documentTitle: 'COATING GOODS DISPATCH NOTES',
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
      items: createBlankItems(12)
    });
    setActiveSubTab('editor');
    triggerToast(`⚡ Loaded Coating Outbound GDN preset: ${nextNo}`);
  };

  // Handle loading GRN preset
  const handleLoadGRNPreset = () => {
    const nextNo = generateNextDocNo('grn');
    setActiveDO({
      ...PRESET_STANDARD_GDN,
      id: 'DISP-' + Date.now(),
      type: 'grn',
      documentTitle: 'GOODS RECEIVED NOTE',
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
      items: createBlankItems(12)
    });
    setActiveSubTab('editor');
    triggerToast(`⚡ Loaded Goods Received Note (GRN) preset: ${nextNo}`);
  };

  // Handle loading Coating GRN preset
  const handleLoadCoatingGRNPreset = () => {
    const nextNo = generateNextDocNo('coating_grn');
    setActiveDO({
      ...PRESET_STANDARD_GDN,
      id: 'DISP-' + Date.now(),
      type: 'coating_grn',
      documentTitle: 'COATING GOODS RECEIVED NOTE',
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
      items: createBlankItems(12)
    });
    setActiveSubTab('editor');
    triggerToast(`⚡ Loaded Coating GRN preset: ${nextNo}`);
  };

  // Delete / Reset active GDN
  const handleDeleteActiveDO = () => {
    if (window.confirm('Are you sure you want to clear and reset the active GDN document?')) {
      handleCreateNewGDN();
      triggerToast('Active GDN cleared.');
    }
  };

  // Close editor / Jump to GDN ledger
  const handleCloseGDN = () => {
    const el = document.getElementById('gdn-records-ledger');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    triggerToast('Closed GDN Editor.');
  };

  // Filter valid print items for Preview/PDF (ensuring at least minCount lines per page, e.g. 12)
  const getValidPrintItems = (items: MaterialGDNItem[], minCount = 12) => {
    if (!items || !Array.isArray(items)) return createBlankItems(minCount);
    const filled = items.filter(it => {
      const d = (it.description || '').replace(/<[^>]*>/g, '').trim();
      const hasQty = it.qty !== undefined && (it.qty as any) !== '' && it.qty !== null && !isNaN(Number(it.qty)) && Number(it.qty) > 0;
      const hasMarking = (it.marking !== undefined && (it.marking as any) !== '' && it.marking !== null && String(it.marking).trim() !== '') || (it.markingImage !== undefined && it.markingImage !== '' && it.markingImage !== null);
      return d !== '' || hasQty || hasMarking;
    });

    if (filled.length >= minCount) return filled;

    const padded = [...filled];
    for (let i = filled.length; i < minCount; i++) {
      padded.push({
        id: 'blank-pad-' + (i + 1),
        sn: i + 1,
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
        remarks: '',
        qcNotes: ''
      });
    }
    return padded;
  };

  // Handlers for Marking Image Upload and Stamps
  const handleUploadMarkingImage = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        handleUpdateItemField(rowId, 'markingImage', dataUrl);
        triggerToast('📷 Uploaded transparent marking image to row!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBulkUploadMarkingImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        const updated = activeDO.items.map(it => {
          const d = (it.description || '').replace(/<[^>]*>/g, '').trim();
          return d !== '' ? { ...it, markingImage: dataUrl } : it;
        });
        setActiveDO(prev => ({
          ...prev,
          items: updated
        }));
        recordItemsHistory(updated);
        triggerToast('📷 Applied transparent marking image to item rows!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyPresetMarking = (presetVal: string, rowId?: string) => {
    if (rowId) {
      handleUpdateItemField(rowId, 'marking', presetVal);
      triggerToast('🏷️ Applied marking preset stamp!');
    } else {
      const updated = activeDO.items.map(it => {
        const d = (it.description || '').replace(/<[^>]*>/g, '').trim();
        return d !== '' ? { ...it, marking: presetVal } : it;
      });
      setActiveDO(prev => ({
        ...prev,
        items: updated
      }));
      recordItemsHistory(updated);
      triggerToast('🏷️ Applied marking preset stamp to item rows!');
    }
  };

  // Modify individual base doc fields
  const handleUpdateField = (field: keyof Omit<MaterialGDN, 'items'>, val: string) => {
    setActiveDO(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleUpdateLogField = (id: string, field: keyof MaterialGDN, val: any) => {
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

  // Modify rows within doc view
  const handleUpdateItemField = (rowId: string, field: keyof MaterialGDNItem, val: any) => {
    setActiveDO(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === rowId ? { ...it, [field]: val } : it)
    }));
  };

  const focusCell = (rIdx: number, cId: string) => {
    let attempts = 0;
    const tryFocus = () => {
      const el = document.querySelector(`[data-gdn-row="${rIdx}"][data-gdn-col="${cId}"]`) as HTMLElement | null;
      if (el) {
        el.focus();
        if ('select' in el && typeof (el as any).select === 'function') {
          (el as any).select();
        } else if (el.getAttribute('contenteditable') === 'true') {
          try {
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (err) {}
        }
      } else if (attempts < 15) {
        attempts++;
        setTimeout(tryFocus, 20);
      }
    };
    setTimeout(tryFocus, 20);
  };

  const handleHeaderKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    nextId: string,
    prevId?: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextId === 'TABLE_START') {
        focusCell(0, 'description');
      } else {
        const el = document.getElementById(nextId);
        if (el) {
          el.focus();
          if ('select' in el && typeof (el as any).select === 'function') {
            (el as any).select();
          }
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (nextId === 'TABLE_START') {
        focusCell(0, 'description');
      } else {
        const el = document.getElementById(nextId);
        if (el) el.focus();
      }
    } else if (e.key === 'ArrowUp' && prevId) {
      e.preventDefault();
      const el = document.getElementById(prevId);
      if (el) el.focus();
    }
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
      ? ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'markingType', 'markingVisible', 'adhesionTest', 'threads', 'microns', 'remarks', 'qcNotes']
      : ['description', 'size', 'finish', 'unit', 'qty', 'qtyReceived', 'marking', 'markingType', 'markingVisible', 'microns', 'coatings', 'threads', 'remarks', 'qcNotes'];

    const colIndex = activeCols.indexOf(colId);
    const currentItem = activeDO.items[rowIndex];
    const targetEl = (e.currentTarget || e.target) as HTMLElement;
    const liveText = colId === 'description' && targetEl
      ? (targetEl.textContent || targetEl.innerText || (targetEl as HTMLInputElement).value || '').replace(/<[^>]*>/g, '').trim()
      : (currentItem?.description || '').replace(/<[^>]*>/g, '').trim();

    const isDescEmpty = liveText === '';

    // Block moving right if description has no data
    if (isDescEmpty) {
      if (e.key === 'ArrowRight' || (e.key === 'Enter' && !e.shiftKey) || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        triggerToast('Please enter Description before moving right!');
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
            const colKey = activeCols[c] as keyof MaterialGDNItem;
            if (colKey && colKey !== 'sn') {
              (updatedItems[minR] as any)[colKey] = (updatedItems[minR - 1] as any)?.[colKey] ?? '';
            }
          }
          triggerToast(`Filled down column(s) from Row ${minR} to Row ${minR + 1}!`);
        } else if (maxR > minR) {
          // Fill down from top row of selection (minR) to all rows below (minR+1..maxR)
          for (let r = minR + 1; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              const colKey = activeCols[c] as keyof MaterialGDNItem;
              if (colKey && colKey !== 'sn') {
                (updatedItems[r] as any)[colKey] = (updatedItems[minR] as any)?.[colKey] ?? '';
              }
            }
          }
          triggerToast(`Filled down from Row ${minR + 1} to Row ${maxR + 1}!`);
        }
      } else if (rowIndex > 0) {
        // Single cell fill down from cell above
        const colKey = colId as keyof MaterialGDNItem;
        if (colKey && colKey !== 'sn') {
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
            const colKey = activeCols[c] as keyof MaterialGDNItem;
            if (colKey && colKey !== 'sn') {
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

    // Ctrl + C / Cmd + C Copy selected cells or active cell as TSV (supports multi-column 3-4 column selection)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      const hasMultiCellSelection = selectedCells && (
        selectedCells.startRow !== selectedCells.endRow ||
        selectedCells.startCol !== selectedCells.endCol
      );

      const target = e.target as HTMLInputElement;
      if (!hasMultiCellSelection && target && target.selectionStart !== target.selectionEnd) {
        return; // Allow native text copy if text is highlighted inside single input
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
            const raw = String((it as any)[activeCols[c]] ?? '').replace(/<[^>]*>/g, '').trim();
            cVals.push(raw);
          }
          rowLines.push(cVals.join('\t'));
        }
        copyVal = rowLines.join('\n');
      } else if (currentItem) {
        copyVal = String((currentItem as any)[colId] ?? '').replace(/<[^>]*>/g, '').trim();
      }
      if (copyVal) {
        navigator.clipboard.writeText(copyVal);
        triggerToast('📋 Copied cell data to clipboard for Excel!');
      }
      return;
    }

    // Shift + Arrow range selection like Excel
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

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (colIndex > 0) {
          focusCell(rowIndex, activeCols[colIndex - 1]);
        } else if (rowIndex > 0) {
          focusCell(rowIndex - 1, activeCols[activeCols.length - 1]);
        }
      } else {
        if (colIndex < activeCols.length - 1) {
          focusCell(rowIndex, activeCols[colIndex + 1]);
        } else if (rowIndex < activeDO.items.length - 1) {
          focusCell(rowIndex + 1, activeCols[0]);
        }
      }
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
          const newItem: MaterialGDNItem = {
            id: 'gd-it-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            sn,
            description: '',
            size: '',
            finish: '',
            unit: '',
            qty: '' as any, // Qty Ordered
            qtyReceived: '' as any, // Qty Delivered
            marking: '',
            markingVisible: '',
            adhesionTest: '',
            threads: '',
            microns: '',
            coatings: '',
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
    
    const newItem: MaterialGDNItem = {
      id: 'gd-it-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
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
      remarks: '',
      qcNotes: ''
    };
    const updated = [...activeDO.items, newItem];
    setActiveDO(prev => ({
      ...prev,
      items: updated
    }));
    recordItemsHistory(updated);
    triggerToast('Appended dispatch material line row!');
  };

  const handleRemoveRow = (rowId: string) => {
    if (activeDO.items.length <= 1) {
      alert('Must maintain at least 1 dispatch material row!');
      return;
    }
    const updated = activeDO.items
      .filter(it => it.id !== rowId)
      .map((it, idx) => ({ ...it, sn: idx + 1 }));
    setActiveDO(prev => ({
      ...prev,
      items: updated
    }));
    recordItemsHistory(updated);
    triggerToast('Removed row item.');
  };

  const handleSaveActiveDO = () => {
    if (!activeDO.doNo.trim()) {
      alert('Please fill out WORK ORDER NO identifier!');
      return;
    }
    setLogs(prev => {
      // Avoid duplicates
      const filtered = prev.filter(l => l.doNo !== activeDO.doNo);
      return [activeDO, ...filtered];
    });
    triggerToast(`💾 Saved Document ${activeDO.doNo} to Work Order Records successfully!`);
    setActiveSubTab('record');
  };

  const handleDeleteDO = (id: string, doNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId({ id, doNo });
  };

  const handleLoadFromLedger = (doc: MaterialGDN) => {
    setActiveDO(doc);
    setActiveSubTab('editor');
    triggerToast(`Loaded Work Order ${doc.doNo} for interactive adjustments.`);
  };

  const handleSaveDOAsPDF = (doc: MaterialGDN) => {
    const isCoatingDoc = doc.type === 'coating' || doc.type === 'coating_grn';
    const titleLabel = doc.documentTitle || (
      doc.type === 'coating_grn' ? 'COATING GOODS RECEIVED NOTE' :
      doc.type === 'grn' ? 'GOODS RECEIVED NOTE' :
      isCoatingDoc ? 'COATING GOODS DISPATCH NOTES' : 'GOODS DISPATCHED NOTE'
    );
    const isGRNDoc = doc.type === 'grn' || doc.type === 'coating_grn' || titleLabel.toUpperCase().includes('RECEIVED NOTE');

    const ITEMS_PER_PAGE = 12;
    const printItems = getValidPrintItems(doc.items, 12);
    const totalPages = Math.max(1, Math.ceil(printItems.length / ITEMS_PER_PAGE));
    const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
      const pageItems = printItems.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
      const isLastPage = pIdx === totalPages - 1;
      return { pageNum: pIdx + 1, pageItems, isLastPage };
    });

    const renderRowHtml = (row: MaterialGDNItem) => {
      const cleanVal = (val: any) => {
        if (val === null || val === undefined) return '';
        const s = String(val).replace(/&nbsp;/g, ' ').trim();
        if (s === '—' || s === '0' || s === '0.00' || s === '0 0 0' || s === '0.0') return '';
        return s;
      };

      const renderMarkingCell = (textVal: any, imgVal?: any) => {
        let img = imgVal || '';
        let txt = textVal ? String(textVal).trim() : '';

        if (!img && txt && (txt.startsWith('data:image/') || txt.startsWith('http://') || txt.startsWith('https://'))) {
          img = txt;
          txt = '';
        }

        const cleanTxt = cleanVal(txt);
        
        if (img) {
          const imgHtml = `<img src="${img}" alt="Marking" style="max-height: 12px; max-width: 28px; object-fit: contain; vertical-align: middle; display: inline-block; margin-right: 2px;" />`;
          if (cleanTxt) {
            return `<div style="display: flex; align-items: center; justify-content: center; gap: 3px;"><span style="display: inline-block;">${imgHtml}</span><span style="font-weight: 900; font-size: 10.5px; text-transform: uppercase; vertical-align: middle; color: #000000; line-height: 1;">${cleanTxt}</span></div>`;
          }
          return imgHtml;
        }
        return `<span style="font-weight: 900; font-size: 10.5px; text-transform: uppercase; color: #000000;">${cleanTxt}</span>`;
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
            <td style="text-align: center; color: #0c449e; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${renderMarkingCell(row.markingVisible)}</td>
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
            <td style="text-align: center; color: #c2410c; border-right: 1px solid #000000; text-transform: uppercase; padding: 1.5px 2px;">${renderMarkingCell(row.marking, row.markingImage)}</td>
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
        <th style="${thStyle} width: 7%; border-left: 1px solid #000;">SIZE</th>
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
              font-family: ${sheetFont};
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
                            <div class="deliver-to-title">${isGRNDoc ? 'RECEIVED FROM (SUPPLIER / VENDOR):' : 'DELIVER TO:'}</div>
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
                          <td style="text-align: left; font-weight: bold; font-size: 11px; padding: 4px 8px; border: none;">${isGRNDoc ? 'GRN NO:' : 'WORK ORDER NO:'} <span style="color: #dc2626;">${doc.doNo || ''}</span></td>
                          <td style="text-align: right; font-weight: bold; font-size: 11px; padding: 4px 8px; border: none;">${isGRNDoc ? 'GRN DATE:' : 'GDN DATE:'} ${doc.date || ''}</td>
                        </tr>
                      </table>

                      <!-- Details Table -->
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                        <tr>
                          <td style="width: 50%; vertical-align: top; border: none; padding: 0 10px 0 0; text-align: left;">
                            <div class="deliver-to-title">${isGRNDoc ? 'DELIVERED TO / LOCATION:' : 'DELIVERY FROM:'}</div>
                            <div class="company-name">${doc.deliveryFromName || activeCompany.name}</div>
                            <div style="font-size: 10.5px; color: #222222; margin-top: 2px; text-align: left;">${doc.deliveryFromAddress || (activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}</div>
                            <div style="font-size: 10.5px; color: #222222; margin-top: 2px; text-align: left;">Telephone: ${doc.deliveryFromPhone || activeCompany.phone || '—'}</div>
                            <div style="font-size: 10.5px; color: #000000; font-weight: bold; margin-top: 2px; text-align: left;">TRN: ${doc.deliveryFromTrn !== undefined ? doc.deliveryFromTrn : activeCompany.trn}</div>
                          </td>
                          <td style="width: 50%; vertical-align: top; border: none; padding: 0;">
                            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000;">
                              <tr><td style="font-size: 9.5px; font-weight: bold; width: 45%; text-align: left; padding: 2px 6px; border: 1px solid #000000;">INVOICE NO :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.invoiceNo || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">${isGRNDoc ? 'GRN NO :' : 'WORK ORDER NO :'}</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; color: #dc2626; border: 1px solid #000000; text-align: left;">${doc.doNo || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">PO NO :</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.poNo || '—'}</td></tr>
                              <tr><td style="font-size: 9.5px; font-weight: bold; text-align: left; padding: 2px 6px; border: 1px solid #000000;">${isGRNDoc ? 'RECEIVED VIA :' : 'DISPATCH BY :'}</td><td style="font-size: 10px; font-weight: bold; padding: 2px 6px; border: 1px solid #000000; text-align: left;">${doc.dispatchBy || '—'}</td></tr>
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
                <!-- NOTES SECTION / REMARKS -->
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
                    <span class="sig-box-title" style="color: #000000;">${isGRNDoc ? 'RECEIVED / STORED BY:' : 'DISPATCHED / PREPARED BY:'}</span>
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">${doc.receiverName || '—'}</div>
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #000000; margin-top: 4px; font-weight: bold;">SIGNATURE / STAMP</div>
                  </div>
                  <div class="sig-box">
                    <span class="sig-box-title" style="color: #000000;">${isGRNDoc ? 'QA/QC INSPECTED BY:' : 'QA/QC CHECKED BY:'}</span>
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">${doc.qcCheckedBy || '—'}</div>
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #000000; margin-top: 4px; font-weight: bold;">SIGNATURE / STAMP</div>
                  </div>
                  <div class="sig-box">
                    <span class="sig-box-title" style="color: #000000;">${isGRNDoc ? 'SUPPLIER / AUTHORIZED BY:' : 'CUSTOMER RECEIVED BY:'}</span>
                    <div style="font-weight: 800; font-size: 10px; text-transform: uppercase;">${doc.attentionTo || '—'}</div>
                    <div class="sig-line"></div>
                    <div style="font-size: 8px; color: #000000; margin-top: 4px; font-weight: bold;">${isGRNDoc ? 'SUPPLIER SIGNATURE / STAMP' : 'CUSTOMER SIGNATURE / STAMP'}</div>
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printHtml(htmlContent);
  };

  const calculatedSums = useMemo(() => {
    let totalQtyOrdered = 0;
    let totalQtyDelivered = 0;
    let totalShortage = 0;

    activeDO.items.forEach(it => {
      const qO = Number(it.qty) || 0;
      const qD = it.qtyReceived !== undefined ? Number(it.qtyReceived) : qO;
      totalQtyOrdered += qO;
      totalQtyDelivered += qD;
      totalShortage += Math.max(0, qO - qD);
    });

    return { totalQtyOrdered, totalQtyDelivered, totalShortage };
  }, [activeDO.items]);

  // Extract all unique months from list of logs for filtering
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    logs.forEach(log => {
      if (log.date) {
        const parts = log.date.split('-');
        if (parts.length >= 2) {
          const yearAndMonth = `${parts[0]}-${parts[1]}`;
          monthsSet.add(yearAndMonth);
        }
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [logs]);

  const formatMonthName = (yearAndMonth: string) => {
    try {
      const parts = yearAndMonth.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    } catch (e) {
      return yearAndMonth;
    }
  };

  const stats = useMemo(() => {
    let totalLogs = logs.length;
    let standardCount = 0;
    let coatingCount = 0;
    let shortageCount = 0;
    let totalLines = 0;

    logs.forEach(log => {
      if (log.type === 'coating') {
        coatingCount++;
      } else {
        standardCount++;
      }
      let hasShortage = false;
      log.items.forEach(it => {
        totalLines++;
        const qO = Number(it.qty) || 0;
        const qD = it.qtyReceived !== undefined ? Number(it.qtyReceived) : qO;
        if (qO - qD > 0) hasShortage = true;
      });
      if (hasShortage) shortageCount++;
    });

    return { totalLogs, standardCount, coatingCount, shortageCount, totalLines };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        log.doNo.toLowerCase().includes(q) || 
        (log.poNo && log.poNo.toLowerCase().includes(q)) || 
        (log.invoiceNo && log.invoiceNo.toLowerCase().includes(q)) || 
        (log.supplierName && log.supplierName.toLowerCase().includes(q)) ||
        log.items.some(it => (it.description && it.description.toLowerCase().includes(q)) || (it.marking && it.marking.toLowerCase().includes(q)));

      let matchesFilter = true;
      if (filterType === 'gdn' || filterType === 'standard') {
        matchesFilter = log.type === 'standard' || !log.type;
      } else if (filterType === 'coating') {
        matchesFilter = log.type === 'coating';
      } else if (filterType === 'grn') {
        matchesFilter = log.type === 'grn' || log.type === 'coating_grn';
      } else if (filterType === 'shortage') {
        matchesFilter = log.items.some(it => {
          const qO = Number(it.qty) || 0;
          const qD = it.qtyReceived !== undefined ? Number(it.qtyReceived) : qO;
          return (qO - qD) > 0;
        });
      }
      
      const matchesMonth = selectedMonth === 'all' || (log.date && log.date.startsWith(selectedMonth));

      return matchesSearch && matchesFilter && matchesMonth;
    });
  }, [logs, searchQuery, filterType, selectedMonth]);

  const handleExportLedgerToCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No GDN records available to export.');
      return;
    }
    const headers = [
      'Type',
      'Work Order / GDN No',
      'Date',
      'Client / Customer',
      'PO Number',
      'Invoice No',
      'Dispatched By',
      'Delivery Terms',
      'Total Item Lines',
      'Shortage Status'
    ];

    const rows = filteredLogs.map(log => {
      let hasShortage = false;
      log.items.forEach(it => {
        const qO = Number(it.qty) || 0;
        const qD = it.qtyReceived !== undefined ? Number(it.qtyReceived) : qO;
        if (qO - qD > 0) hasShortage = true;
      });
      return [
        log.type === 'coating' ? 'COATING GDN' : 'STANDARD GDN',
        `"${log.doNo || ''}"`,
        `"${log.date || ''}"`,
        `"${(log.supplierName || '').replace(/"/g, '""')}"`,
        `"${log.poNo || ''}"`,
        `"${log.invoiceNo || ''}"`,
        `"${(log.dispatchBy || '').replace(/"/g, '""')}"`,
        `"${(log.deliveryTerms || '').replace(/"/g, '""')}"`,
        log.items.length,
        hasShortage ? 'SHORTAGE' : 'COMPLETE'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GDN_Records_Ledger_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📊 Exported GDN Records Ledger to CSV file!');
  };

  const handleCreateNewDO = () => {
    const isCoatingDoc = activeDO.type === 'coating';
    const nextNo = generateNextDocNo(isCoatingDoc ? 'coating' : 'standard');
    const newDoc: MaterialGDN = {
      id: 'DISP-' + Date.now(),
      type: isCoatingDoc ? 'coating' : 'standard',
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
      supplierName: '',
      supplierAddress: '',
      phone: '',
      trn: '',
      poNo: '',
      invoiceNo: '',
      dispatchBy: 'STORE TRUCK',
      deliveryTerms: 'EX-WORKS AJMAN',
      madeIn: 'UAE',
      items: [
        {
          id: 'gd-it-1',
          sn: 1,
          description: '',
          size: '',
          finish: '',
          unit: 'PCS',
          qty: '' as any,
          qtyReceived: '' as any,
          marking: '',
          markingVisible: '',
          adhesionTest: '',
          threads: '',
          microns: '',
          coatings: '',
          remarks: '',
          qcNotes: ''
        }
      ],
      receiverName: '',
      qcCheckedBy: '',
      attentionTo: ''
    };
    setActiveDO(newDoc);
    setActiveSubTab('editor');
    triggerToast(`✨ Created New Blank GDN Draft (${nextNo})!`);
  };

  const handleSaveGDNRegistryAsPdf = () => {
    const finalLogs = filteredLogs;
    if (!finalLogs || finalLogs.length === 0) {
      alert('No GDN records found matching current filters to print.');
      return;
    }

    const isStandardFilter = filterType === 'standard' || filterType === 'gdn';
    const isCoatingFilter = filterType === 'coating';

    let docTitle = 'OUTBOUND GOODS DISPATCH NOTES (GDN) MASTER REGISTER';
    let docSubHeader = 'ALL GDN RECORDS REGISTER';
    let filterSummaryText = 'ALL RECORDS';

    if (isStandardFilter) {
      docTitle = 'STANDARD GOODS DISPATCH NOTES (GDN) REGISTER';
      docSubHeader = 'STANDARD GDN RECORDS REGISTER';
      filterSummaryText = 'STANDARD GDN RECORDS';
    } else if (isCoatingFilter) {
      docTitle = 'COATING GOODS DISPATCH NOTES (GDN) REGISTER';
      docSubHeader = 'COATING GDN RECORDS REGISTER';
      filterSummaryText = 'COATING GDN RECORDS';
    }

    if (selectedMonth !== 'all') {
      filterSummaryText += ` | MONTH: ${selectedMonth}`;
    }
    if (searchQuery.trim()) {
      filterSummaryText += ` | SEARCH: "${searchQuery.trim()}"`;
    }

    let stdCount = 0;
    let coatCount = 0;
    let shortageCount = 0;

    const rowsHtml = finalLogs.map((log, idx) => {
      if (log.type === 'coating') coatCount++;
      else stdCount++;

      let hasShortage = false;
      (log.items || []).forEach(it => {
        const qO = Number(it.qty) || 0;
        const qD = it.qtyReceived !== undefined ? Number(it.qtyReceived) : qO;
        if (qO - qD > 0) hasShortage = true;
      });
      if (hasShortage) shortageCount++;

      const isCoatingDoc = log.type === 'coating';

      return `
        <tr style="border-bottom: 1px solid #000000; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9f9f9'}; height: 26px; font-size: 9.5px; font-family: 'Calibri', 'Arial', sans-serif;">
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; border-left: 1px solid #000000; font-weight: bold; color: #000000;">
            ${idx + 1}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-weight: bold; font-family: 'Calibri', 'Arial', sans-serif; color: #000000;">
            ${log.doNo || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; color: #000000;">
            ${log.date || '—'}
          </td>
          <td style="padding: 4px; text-align: left; padding-left: 6px; border-right: 1px solid #000000; text-transform: uppercase; font-weight: 600; color: #000000;">
            ${log.supplierName || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-family: 'Calibri', 'Arial', sans-serif; color: #000000;">
            ${log.poNo || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-family: 'Calibri', 'Arial', sans-serif; color: #000000;">
            ${log.invoiceNo || '—'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; text-transform: uppercase; color: #000000;">
            ${log.dispatchBy || 'STORE TRUCK'}
          </td>
          <td style="padding: 4px; text-align: center; border-right: 1px solid #000000; font-weight: bold; color: #000000;">
            ${hasShortage ? 'SHORTAGE' : 'OK'}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
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
              color: #000000;
              font-weight: 600;
            }
            .doc-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              color: #ffffff;
              background-color: #000000;
              border: 1.5px solid #000000;
              padding: 6px 10px;
              text-align: center;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .filter-info {
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              color: #000000;
              background-color: #ffffff;
              border: 1px solid #000000;
              padding: 4px 8px;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #000000 !important;
              margin-bottom: 0px;
            }
            .ledger-table th {
              background-color: #f0f0f0 !important;
              color: #000000 !important;
              font-size: 9.5px !important;
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
              background-color: #f0f0f0;
              padding: 6px 12px;
              font-size: 9.5px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              margin-bottom: 16px;
              text-transform: uppercase;
              color: #000000;
            }
            .signatures-grid {
              display: table;
              width: 100%;
              margin-top: auto !important;
              padding-top: 60px !important;
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
              color: #000000;
            }
          </style>
        </head>
        <body>
          <!-- Company Header -->
          <table class="header-table">
            <tr>
              <td style="text-align: left; vertical-align: middle;">
                <div class="company-title">${activeCompany.name}</div>
                <div class="company-sub">${(activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}</div>
                <div class="company-sub">Telephone: ${activeCompany.phone || '—'} &nbsp;|&nbsp; TRN: ${activeCompany.trn}</div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="font-size: 12px; font-weight: 900; color: #000000; font-family: 'Calibri', 'Arial', sans-serif;">${docSubHeader}</div>
                <div style="font-size: 9px; color: #000000; font-weight: bold;">Outbound Dispatch Register</div>
                <div style="font-size: 9px; color: #000000;">Date: ${new Date().toLocaleDateString('en-GB')}</div>
              </td>
            </tr>
          </table>

          <!-- Document Title Banner -->
          <div class="doc-title">
            ${docTitle}
          </div>

          <!-- Filter Criteria Info -->
          <div class="filter-info">
            <span>SELECTION: ${filterSummaryText}</span>
            <span>PRINTED ON: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <!-- Master Register Table -->
          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 5%;">S.N</th>
                <th style="width: 17%;">WORK ORDER / GDN NO.</th>
                <th style="width: 11%;">DATE</th>
                <th style="width: 18%; text-align: left; padding-left: 6px;">CLIENT / CUSTOMER NAME</th>
                <th style="width: 13%;">PO NO.</th>
                <th style="width: 12%;">INVOICE NO.</th>
                <th style="width: 13%;">DISPATCH BY</th>
                <th style="width: 11%;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- Summary Bar -->
          <div class="summary-bar">
            <span>TOTAL GDN RECORDS: ${finalLogs.length}</span>
            ${isStandardFilter 
              ? `<span>STANDARD GDN: ${stdCount}</span>`
              : isCoatingFilter 
              ? `<span>COATING GDN: ${coatCount}</span>`
              : `<span>STANDARD: ${stdCount} | COATING: ${coatCount}</span>`
            }
            <span>SHORTAGES FLAGGED: ${shortageCount}</span>
          </div>

          <!-- Signatures Section -->
          <div class="signatures-grid">
            <div class="sig-col">
              <div class="sig-line">PREPARED BY</div>
              <div style="font-size: 8.5px; color: #555555;">Dispatch Store Staff</div>
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
    printHtml(htmlContent, 'Official Goods Dispatch Notes Register');
  };

  const handleDuplicateDO = (doc: MaterialGDN, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextNo = generateNextDocNo(doc.type || 'standard');
    const duplicated: MaterialGDN = {
      ...doc,
      id: 'DISP-' + Date.now(),
      doNo: nextNo,
      date: new Date().toISOString().substring(0, 10),
    };
    setActiveDO(duplicated);
    setActiveSubTab('editor');
    triggerToast(`📋 Duplicated Document ${doc.doNo} -> Created New Draft ${nextNo}`);
  };

  const isCoating = activeDO.type === 'coating';

  return (
    <div className="space-y-6 w-full font-sans text-slate-800 text-[11.5px] leading-relaxed">
      


      <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
          
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
                    title="Save Goods Dispatched Note (GDN)"
                  >
                    <Save className="w-4 h-4 text-emerald-700 group-hover:scale-105 transition-transform" />
                    <span className="text-[10.5px] font-semibold text-emerald-950 tracking-tight whitespace-nowrap">Save</span>
                  </button>

                  {/* New */}
                  <button
                    type="button"
                    onClick={handleCreateNewDO}
                    className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                    title="Create New Blank Goods Dispatched Note"
                  >
                    <FilePlus className="w-4 h-4 text-blue-600 group-hover:scale-105 transition-transform" />
                    <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">New</span>
                  </button>

                  {/* Del */}
                  <button
                    type="button"
                    onClick={handleDeleteActiveDO}
                    className="bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                    title="Clear GDN Items / Reset Form"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600 group-hover:scale-105 transition-transform" />
                    <span className="text-[10.5px] font-semibold text-rose-950 tracking-tight whitespace-nowrap">Del</span>
                  </button>

                  {/* Print */}
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

                  {/* Header */}
                  <button
                    type="button"
                    onClick={() => setIsEditHeaderOpen(true)}
                    className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                    title="Edit Header & Customer Delivery Details"
                  >
                    <Edit3 className="w-4 h-4 text-amber-600 group-hover:scale-105 transition-transform" />
                    <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Header</span>
                  </button>
                </>
              )}

              {activeSubTab === 'record' && (
                <>
                  {/* Print Records List PDF */}
                  <button
                    type="button"
                    onClick={handleSaveGDNRegistryAsPdf}
                    className="bg-[#f37021] border border-orange-600 hover:bg-orange-600 text-white rounded-lg px-3 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[70px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                    title="Print Filtered GDN Records List PDF"
                  >
                    <Printer className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
                    <span className="text-[10.5px] font-bold text-white tracking-tight whitespace-nowrap">Print List</span>
                  </button>
                </>
              )}
            </div>

            {/* RIGHT SIDE ICON BUTTONS */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Standard GDN */}
              <button
                type="button"
                onClick={handleLoadStandardPreset}
                className={`bg-white border hover:bg-slate-50 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0 ${
                  activeSubTab === 'editor' && activeDO.type === 'standard'
                    ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-400/30'
                    : 'border-slate-300 text-slate-800'
                }`}
                title="Standard Outbound Goods Dispatched Note"
              >
                <PackageCheck className="w-4 h-4 text-[#f37021] group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Standard GDN</span>
              </button>

              {/* Coating GDN */}
              <button
                type="button"
                onClick={handleLoadCoatingPreset}
                className={`bg-white border hover:bg-slate-50 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0 ${
                  activeSubTab === 'editor' && activeDO.type === 'coating'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/30'
                    : 'border-slate-300 text-slate-800'
                }`}
                title="Coating Outbound Goods Dispatched Note"
              >
                <Sparkles className="w-4 h-4 text-cyan-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Coating GDN</span>
              </button>

              {/* GDN Records Ledger */}
              <button
                type="button"
                onClick={() => setActiveSubTab('record')}
                className={`bg-white border hover:bg-slate-50 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0 ${
                  activeSubTab === 'record'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400/30'
                    : 'border-slate-300 text-slate-800'
                }`}
                title="View GDN Records Ledger History"
              >
                <Database className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Records Ledger</span>
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={handleCloseGDN}
                className="bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
                title="Close Editor / View Ledger"
              >
                <XCircle className="w-4 h-4 text-slate-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Close</span>
              </button>
            </div>
          </div>

          {/* Form Editor Body - Redesigned as Printable Document Sheet */}
          {activeSubTab === 'editor' && (
            <div className="hidden lg:block bg-slate-200 p-4 sm:p-6 rounded-2xl border border-slate-300 shadow-inner space-y-4">

            {/* PRINT PDF STYLE INTERACTIVE SHEET */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 sm:p-8 font-sans text-black space-y-4 max-w-[1250px] mx-auto select-none" style={{ fontFamily: sheetFont }}>
              
              {/* Row 1: DELIVER TO vs DOCUMENT TITLE BOX */}
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* DELIVER TO Customer Info */}
                <div className="col-span-7 space-y-1.5 text-left">
                  <div className="text-[11px] font-black uppercase text-black tracking-wider border-b border-black pb-0.5">
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVED FROM (SUPPLIER / VENDOR):' : 'DELIVER TO:'}
                  </div>
                  <div className="relative w-full" ref={customerDropdownRef}>
                    <input
                      id="gdn-hdr-supplierName"
                      type="text"
                      value={activeDO.supplierName}
                      onFocus={() => {
                        if (matchingSuggestions.length > 0) setIsCustomerDropdownOpen(true);
                      }}
                      onChange={(e) => {
                        handleCustomerNameChange(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onKeyDown={(e) => handleCustomerInputKeyDown(e, 'gdn-hdr-supplierAddress')}
                      className="w-full bg-transparent border-b border-slate-400 focus:border-black font-black text-[13px] uppercase text-black outline-none px-1 py-0.5"
                      placeholder="CLIENT / CUSTOMER COMPANY NAME"
                      autoComplete="off"
                    />

                    {/* Interactive Customer Dropdown with Up/Down/Enter Keyboard Nav */}
                    {isCustomerDropdownOpen && matchingSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-slate-900 rounded-lg shadow-2xl z-[150] max-h-56 overflow-y-auto divide-y divide-slate-100 text-left font-sans">
                        <div className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 flex justify-between items-center tracking-wider sticky top-0 z-10">
                          <span>Suggested Companies ({matchingSuggestions.length})</span>
                          <span className="text-amber-300 font-bold">Use ↓ ↑ & Enter to select</span>
                        </div>
                        {matchingSuggestions.map((cust, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectCustomerSuggestion(cust)}
                            onMouseEnter={() => setCustomerHighlightIndex(idx)}
                            className={`p-2 cursor-pointer transition-colors ${
                              idx === customerHighlightIndex
                                ? 'bg-amber-100 text-slate-900 font-black border-l-4 border-[#f37021]'
                                : 'hover:bg-slate-50 text-slate-800 font-semibold'
                            }`}
                          >
                            <div className="text-[11.5px] font-black text-black uppercase flex items-center justify-between">
                              <span>{cust.name}</span>
                              {cust.trn && <span className="text-[9px] font-mono text-slate-500 font-normal">TRN: {cust.trn}</span>}
                            </div>
                            {cust.address && (
                              <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                                📍 {cust.address}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea
                    id="gdn-hdr-supplierAddress"
                    rows={2}
                    value={activeDO.supplierAddress}
                    onChange={(e) => handleUpdateField('supplierAddress', e.target.value)}
                    onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-phone', 'gdn-hdr-supplierName')}
                    className="w-full bg-transparent border-b border-slate-300 focus:border-black text-[10.5px] font-bold uppercase text-slate-800 outline-none px-1 py-0.5 resize-none"
                    placeholder="SHIPPING ADDRESS / DELIVERY DESTINATION"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="flex items-center gap-1 text-[10.5px]">
                      <span className="font-bold text-slate-700">Telephone:</span>
                      <input
                        id="gdn-hdr-phone"
                        type="text"
                        value={activeDO.phone}
                        onChange={(e) => handleUpdateField('phone', e.target.value)}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-trn', 'gdn-hdr-supplierAddress')}
                        className="w-full bg-transparent border-b border-slate-300 focus:border-black font-semibold text-black outline-none px-1"
                        placeholder="Phone / Fax"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[10.5px]">
                      <span className="font-black text-black">TRN:</span>
                      <input
                        id="gdn-hdr-trn"
                        type="text"
                        value={activeDO.trn}
                        onChange={(e) => handleUpdateField('trn', e.target.value)}
                        onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-invoiceno', 'gdn-hdr-phone')}
                        className="w-full bg-transparent border-b border-slate-300 focus:border-black font-bold font-mono text-black outline-none px-1"
                        placeholder="TRN No"
                      />
                    </div>
                  </div>
                </div>

                {/* DOCUMENT TITLE BOX */}
                <div className="col-span-5 flex justify-end">
                  <div className="border-2 border-black p-3 bg-white text-center w-full shadow-2xs">
                    <select
                      value={activeDO.documentTitle || (activeDO.type === 'coating_grn' ? 'COATING GOODS RECEIVED NOTE' : activeDO.type === 'grn' ? 'GOODS RECEIVED NOTE' : isCoating ? 'COATING GOODS DISPATCH NOTES' : 'GOODS DISPATCHED NOTE')}
                      onChange={(e) => handleUpdateField('documentTitle', e.target.value)}
                      className="text-[13px] sm:text-[14px] font-black uppercase tracking-wider text-black block leading-tight w-full text-center bg-transparent outline-none cursor-pointer hover:bg-slate-100 py-1 rounded border border-transparent hover:border-slate-300"
                    >
                      <option value="GOODS DISPATCHED NOTE">GOODS DISPATCHED NOTE</option>
                      <option value="COATING GOODS DISPATCH NOTES">COATING GOODS DISPATCH NOTES</option>
                      <option value="GOODS RECEIVED NOTE">GOODS RECEIVED NOTE</option>
                      <option value="COATING GOODS RECEIVED NOTE">COATING GOODS RECEIVED NOTE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: SUBHEADER BAR (GDN/GRN NO & DATE) */}
              <div className="border-t-2 border-b-2 border-black py-1.5 px-3 bg-slate-50 flex items-center justify-between text-[11px] font-bold uppercase">
                <div className="flex items-center gap-2">
                  <span>{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'GRN NO:' : 'WORK ORDER NO:'}</span>
                  <input
                    id="gdn-hdr-dono"
                    type="text"
                    value={activeDO.doNo}
                    onChange={(e) => handleUpdateField('doNo', e.target.value.toUpperCase())}
                    onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-date', 'gdn-hdr-trn')}
                    className="text-rose-600 font-extrabold font-mono text-[12px] bg-transparent border-b border-rose-400 focus:border-rose-600 outline-none uppercase px-1 w-36"
                    placeholder="GDN-..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'GRN DATE:' : 'GDN DATE:'}</span>
                  <input
                    id="gdn-hdr-date"
                    type="date"
                    value={activeDO.date}
                    onChange={(e) => handleUpdateField('date', e.target.value)}
                    onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-invoiceno', 'gdn-hdr-dono')}
                    className="font-bold text-black bg-transparent border-b border-slate-400 focus:border-black outline-none px-1"
                  />
                </div>
              </div>

              {/* Row 3: DELIVERY FROM & LOGISTICS METADATA TABLE */}
              <div className="grid grid-cols-12 gap-4 items-start pt-1">
                {/* DELIVERY FROM (Editable) */}
                <div className="col-span-6 space-y-1 text-left bg-slate-50/70 p-2 rounded border border-slate-250">
                  <div className="text-[11px] font-black uppercase text-black tracking-wider flex items-center justify-between">
                    <span>{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'DELIVERED TO / LOCATION:' : 'DELIVERY FROM:'}</span>
                    <span className="text-[9px] font-normal text-slate-500 lowercase">(editable)</span>
                  </div>
                  <input
                    type="text"
                    value={activeDO.deliveryFromName !== undefined ? activeDO.deliveryFromName : activeCompany.name}
                    onChange={(e) => handleUpdateField('deliveryFromName', e.target.value.toUpperCase())}
                    className="w-full font-black text-[13px] text-black uppercase bg-white border border-slate-300 focus:border-black outline-none px-1.5 py-0.5 rounded shadow-2xs"
                    placeholder="DELIVERY FROM COMPANY NAME"
                  />
                  <input
                    type="text"
                    value={activeDO.deliveryFromAddress !== undefined ? activeDO.deliveryFromAddress : (activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}
                    onChange={(e) => handleUpdateField('deliveryFromAddress', e.target.value)}
                    className="w-full text-[10.5px] font-bold text-slate-800 bg-white border border-slate-300 focus:border-black outline-none px-1.5 py-0.5 rounded shadow-2xs"
                    placeholder="DELIVERY FROM ADDRESS"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs">
                      <span className="text-[9.5px] font-bold text-slate-500 whitespace-nowrap">Tel:</span>
                      <input
                        type="text"
                        value={activeDO.deliveryFromPhone !== undefined ? activeDO.deliveryFromPhone : (activeCompany.phone || '—')}
                        onChange={(e) => handleUpdateField('deliveryFromPhone', e.target.value)}
                        className="w-full text-[10.5px] font-bold text-slate-800 bg-transparent outline-none"
                        placeholder="PHONE / TELEPHONE"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs">
                      <span className="text-[9.5px] font-bold text-slate-500 whitespace-nowrap">TRN:</span>
                      <input
                        type="text"
                        value={activeDO.deliveryFromTrn !== undefined ? activeDO.deliveryFromTrn : (activeCompany.trn || '')}
                        onChange={(e) => handleUpdateField('deliveryFromTrn', e.target.value)}
                        className="w-full text-[10.5px] font-black text-black bg-transparent outline-none"
                        placeholder="TRN NO."
                      />
                    </div>
                  </div>
                </div>

                {/* LOGISTICS 2-COLUMN TABLE */}
                <div className="col-span-6">
                  <table className="w-full border-collapse border border-black text-[10px] font-sans">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="w-1/2 font-bold p-1 bg-slate-50 border-r border-black text-left">INVOICE NO :</td>
                        <td className="w-1/2 p-1 font-bold text-left">
                          <input
                            id="gdn-hdr-invoiceno"
                            type="text"
                            value={activeDO.invoiceNo || ''}
                            onChange={(e) => handleUpdateField('invoiceNo', e.target.value.toUpperCase())}
                            onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-dono-logistics', 'gdn-hdr-date')}
                            className="w-full bg-transparent border-none font-bold text-black outline-none focus:bg-amber-100 px-1 rounded"
                            placeholder="INV-..."
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold p-1 bg-slate-50 border-r border-black text-left">{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'GRN NO :' : 'WORK ORDER NO :'}</td>
                        <td className="p-1 font-extrabold text-rose-600 text-left">
                          <input
                            id="gdn-hdr-dono-logistics"
                            type="text"
                            value={activeDO.doNo}
                            onChange={(e) => handleUpdateField('doNo', e.target.value.toUpperCase())}
                            onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-pono', 'gdn-hdr-invoiceno')}
                            className="w-full bg-transparent border-none font-extrabold font-mono text-rose-600 outline-none uppercase focus:bg-amber-100 px-1 rounded"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold p-1 bg-slate-50 border-r border-black text-left">PO NO :</td>
                        <td className="p-1 font-bold text-left">
                          <input
                            id="gdn-hdr-pono"
                            type="text"
                            value={activeDO.poNo}
                            onChange={(e) => handleUpdateField('poNo', e.target.value.toUpperCase())}
                            onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-dispatchby', 'gdn-hdr-dono-logistics')}
                            className="w-full bg-transparent border-none font-bold text-black outline-none uppercase focus:bg-amber-100 px-1 rounded"
                            placeholder="PO-..."
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold p-1 bg-slate-50 border-r border-black text-left">{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVED VIA :' : 'DISPATCH BY :'}</td>
                        <td className="p-1 font-bold text-left">
                          <input
                            id="gdn-hdr-dispatchby"
                            type="text"
                            value={activeDO.dispatchBy}
                            onChange={(e) => handleUpdateField('dispatchBy', e.target.value.toUpperCase())}
                            onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-deliveryterms', 'gdn-hdr-pono')}
                            className="w-full bg-transparent border-none font-bold text-black outline-none uppercase focus:bg-amber-100 px-1 rounded"
                            placeholder="TRAILER"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="font-bold p-1 bg-slate-50 border-r border-black text-left">DELIVERY TERMS :</td>
                        <td className="p-1 font-bold text-left">
                          <input
                            id="gdn-hdr-deliveryterms"
                            type="text"
                            value={activeDO.deliveryTerms}
                            onChange={(e) => handleUpdateField('deliveryTerms', e.target.value.toUpperCase())}
                            onKeyDown={(e) => handleHeaderKeyDown(e, 'gdn-hdr-madein', 'gdn-hdr-dispatchby')}
                            className="w-full bg-transparent border-none font-bold text-black outline-none uppercase focus:bg-amber-100 px-1 rounded"
                            placeholder="EX-WORKS / DDP"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold p-1 bg-slate-50 border-r border-black text-left">MADE IN :</td>
                        <td className="p-1 font-bold text-left">
                          <input
                            id="gdn-hdr-madein"
                            type="text"
                            value={activeDO.madeIn || 'UAE'}
                            onChange={(e) => handleUpdateField('madeIn', e.target.value.toUpperCase())}
                            onKeyDown={(e) => handleHeaderKeyDown(e, 'TABLE_START', 'gdn-hdr-deliveryterms')}
                            className="w-full bg-transparent border-none font-bold text-black outline-none uppercase focus:bg-amber-100 px-1 rounded"
                            placeholder="UAE"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Toolbar Control Bar Box (Placed Before Table Header) */}
              <div className="bg-white text-slate-800 p-2.5 rounded-xl flex items-center justify-end flex-wrap gap-2 border border-slate-300 shadow-sm no-print my-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Font Selector */}
                  <select
                    value={sheetFont}
                    onChange={(e) => setSheetFont(e.target.value)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded text-[10px] outline-none cursor-pointer"
                  >
                    <option value="Inter, sans-serif" className="text-slate-900">Inter Font</option>
                    <option value="'Courier New', monospace" className="text-slate-900">Courier Monospace</option>
                    <option value="Arial, sans-serif" className="text-slate-900">Arial Standard</option>
                    <option value="'Times New Roman', serif" className="text-slate-900">Times Serif</option>
                  </select>

                  {/* Font Size Selector */}
                  <select
                    value={sheetFontSize}
                    onChange={(e) => setSheetFontSize(e.target.value)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 px-2 py-1 rounded text-[10px] outline-none cursor-pointer"
                  >
                    <option value="9px" className="text-slate-900">9px Small</option>
                    <option value="10px" className="text-slate-900">10px Medium</option>
                    <option value="11px" className="text-slate-900">11px Large</option>
                    <option value="12px" className="text-slate-900">12px XL</option>
                  </select>

                  {/* Undo Button */}
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!(historyIndex > 0 || (activeDO && activeDO.items && itemsHistory[historyIndex] && JSON.stringify(activeDO.items) !== JSON.stringify(itemsHistory[historyIndex])))}
                    className={`p-1 px-2.5 rounded border text-slate-700 flex items-center justify-center transition-all ${
                      (historyIndex > 0 || (activeDO && activeDO.items && itemsHistory[historyIndex] && JSON.stringify(activeDO.items) !== JSON.stringify(itemsHistory[historyIndex])))
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer text-slate-800'
                        : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
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
                    className={`p-1 px-2.5 rounded border text-slate-700 flex items-center justify-center transition-all ${
                      historyIndex < itemsHistory.length - 1
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 cursor-pointer text-slate-800'
                        : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                    }`}
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" />
                  </button>

                  {/* Word Color Swatches */}
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-300 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight shrink-0">Color Word:</span>
                    {[
                      { name: 'Black', hex: '#000000', bg: 'bg-black' },
                      { name: 'Green', hex: '#16a34a', bg: 'bg-emerald-600' },
                      { name: 'Blue', hex: '#2563eb', bg: 'bg-blue-600' },
                      { name: 'Red', hex: '#dc2626', bg: 'bg-red-600' },
                      { name: 'Orange', hex: '#ea580c', bg: 'bg-orange-600' },
                      { name: 'Purple', hex: '#9333ea', bg: 'bg-purple-600' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        title={`Apply ${swatch.name} color to highlighted word`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleApplyTextColor(swatch.hex)}
                        className={`w-4 h-4 rounded-full ${swatch.bg} border border-slate-400 hover:scale-110 transition-transform cursor-pointer shrink-0 inline-flex items-center justify-center`}
                      />
                    ))}
                    <label
                      title="Custom Word Color Picker"
                      className="w-4 h-4 rounded-full border border-slate-400 overflow-hidden cursor-pointer shrink-0 flex items-center justify-center hover:scale-110 transition-transform bg-white"
                    >
                      <input
                        type="color"
                        value={sheetTextColor}
                        onChange={(e) => {
                          setSheetTextColor(e.target.value);
                          handleApplyTextColor(e.target.value);
                        }}
                        className="w-6 h-6 -m-1 cursor-pointer border-none bg-transparent p-0"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleAppendRow}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
              </div>

              {/* Row 4: ITEMS LINE TABLE MATCHING PRINT PDF */}
              <div 
                id="gdn-items-scroll-container"
                className={`border-2 border-black rounded-xs overflow-hidden ${
                  activeDO.items.length > 7 ? 'max-h-[500px] overflow-y-auto' : ''
                }`}
              >
                <table className="w-full border-collapse text-[10px] font-sans">
                  <thead>
                    {isCoating ? (
                      /* COATING TABLE HEADER */
                      <tr className="bg-[#f1f5f9] text-black border-b-2 border-black select-none text-center h-8 text-[9.5px] uppercase font-black tracking-wider divide-x divide-black">
                        <th className="p-1 w-8 font-black text-center">S.N</th>
                        <th className="p-1 w-20 min-w-[80px] max-w-[100px] text-left pl-1.5 font-black">DESCRIPTION</th>
                        <th className="p-1 w-20 text-center font-black">SIZE</th>
                        <th className="p-1 w-14 text-center font-black">FINISH</th>
                        <th className="p-1 w-12 text-center font-black">UNIT</th>
                        <th className="p-1 w-20 text-center font-black text-blue-900">QTY ORDERED</th>
                        <th className="p-1 w-24 text-center font-black text-teal-800">QTY DELIVERED</th>
                        <th className="p-1 w-20 text-center font-black text-rose-700">SHORTAGE</th>
                        <th className="p-1 w-24 text-center font-black text-blue-900">MARKING TYPE</th>
                        <th className="p-1 w-28 text-center font-black text-blue-900">MARKING VISIBLE</th>
                        <th className="p-1 w-24 text-center font-black text-blue-900">ADHESION</th>
                        <th className="p-1 w-20 text-center font-black text-blue-900">THREADS</th>
                        <th className="p-1 w-16 text-center font-black text-blue-900">MICRONS</th>
                        <th className="p-1 w-24 min-w-[90px] text-center font-black">FREE-RUNNING FIT TEST</th>
                        <th className="p-1 w-40 min-w-[160px] text-left pl-2 font-black text-emerald-900">QC NOTES</th>
                        <th className="p-1 w-8 no-print"></th>
                      </tr>
                    ) : (
                      /* STANDARD MATERIALS RECEIVING HEADER */
                      <tr className="bg-[#fef3c7] text-black border-b-2 border-black select-none text-center h-8 text-[9.5px] uppercase font-black tracking-wider divide-x divide-black">
                        <th className="p-1 w-8 font-black text-center">S.N</th>
                        <th className="p-1 w-20 min-w-[80px] max-w-[100px] text-left pl-1.5 font-black">DESCRIPTION</th>
                        <th className="p-1 w-20 text-center font-black">SIZE</th>
                        <th className="p-1 w-14 text-center font-black">FINISH</th>
                        <th className="p-1 w-12 text-center font-black">UNIT</th>
                        <th className="p-1 w-20 text-center font-black text-blue-900">QTY ORDERED</th>
                        <th className="p-1 w-24 text-center font-black text-teal-800">QTY DELIVERED</th>
                        <th className="p-1 w-20 text-center font-black text-rose-700">SHORTAGE</th>
                        <th className="p-1 w-28 text-center font-black text-orange-900 relative">
                          <div className="flex items-center justify-center gap-1">
                            <span>MARKING</span>
                            <label
                              className="p-0.5 bg-amber-200 hover:bg-amber-300 text-orange-950 rounded cursor-pointer transition-colors shadow-2xs"
                              title="Upload transparent marking image for all rows"
                            >
                              <Upload className="w-3 h-3 text-amber-900" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleBulkUploadMarkingImage(e)}
                              />
                            </label>
                          </div>
                        </th>
                        <th className="p-1 w-24 text-center font-black text-orange-900">MARKING TYPE</th>
                        <th className="p-1 w-28 text-center font-black text-orange-900">MARKING VISIBLE</th>
                        <th className="p-1 w-16 text-center font-black text-orange-900">MICRONS</th>
                        <th className="p-1 w-24 text-center font-black text-orange-900">COATINGS</th>
                        <th className="p-1 w-20 text-center font-black text-orange-900">THREADS</th>
                        <th className="p-1 w-24 min-w-[90px] text-center font-black">FREE-RUNNING FIT TEST</th>
                        <th className="p-1 w-40 min-w-[160px] text-left pl-2 font-black text-emerald-900">QC NOTES</th>
                        <th className="p-1 w-8 no-print"></th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-black">
                    {activeDO.items.map((row, idx) => (
                      <tr key={row.id} className="divide-x divide-black h-7 hover:bg-amber-50/40 transition-colors bg-white align-middle">
                        
                        {/* S.N */}
                        <td className="p-1 text-center font-bold text-black select-none text-[10px]">
                          {row.sn}
                        </td>

                        {/* DESCRIPTION */}
                        <td className={`p-1 text-left pl-1.5 relative w-20 min-w-[80px] max-w-[100px] ${isCellSelected(idx, 'description') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <GDNContentEditable
                            value={row.description || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'description', val)}
                            onFocus={() => handleCellFocus(idx, 'description')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'description')}
                            onPaste={(e) => handleInputPaste(e, idx, 'description')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'description')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'description')}
                            dataRow={idx}
                            dataCol="description"
                            cellColor={row.cellColors?.['description']}
                            className="min-h-[20px] text-[10px] uppercase font-bold text-black px-0.5 rounded flex items-center whitespace-normal break-words leading-tight"
                          />
                        </td>

                        {/* SIZE */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'size') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <GDNContentEditable
                            value={row.size || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'size', val)}
                            onFocus={() => handleCellFocus(idx, 'size')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'size')}
                            onPaste={(e) => handleInputPaste(e, idx, 'size')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'size')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'size')}
                            dataRow={idx}
                            dataCol="size"
                            cellColor={row.cellColors?.['size']}
                            className="text-center text-[10px] font-bold text-black h-5 px-0.5 flex items-center justify-center whitespace-normal break-words leading-tight"
                          />
                        </td>

                        {/* FINISH */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'finish') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <GDNContentEditable
                            value={row.finish || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'finish', val)}
                            onFocus={() => handleCellFocus(idx, 'finish')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'finish')}
                            onPaste={(e) => handleInputPaste(e, idx, 'finish')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'finish')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'finish')}
                            dataRow={idx}
                            dataCol="finish"
                            cellColor={row.cellColors?.['finish']}
                            className="text-center text-[10px] font-semibold text-black h-5 px-0.5 flex items-center justify-center whitespace-normal break-words leading-tight uppercase"
                          />
                        </td>

                        {/* UNIT */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'unit') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <GDNContentEditable
                            value={row.unit || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'unit', val)}
                            onFocus={() => handleCellFocus(idx, 'unit')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'unit')}
                            onPaste={(e) => handleInputPaste(e, idx, 'unit')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'unit')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'unit')}
                            dataRow={idx}
                            dataCol="unit"
                            cellColor={row.cellColors?.['unit']}
                            className="text-center text-[10px] text-black font-bold h-5 px-0.5 flex items-center justify-center whitespace-normal break-words leading-tight uppercase"
                          />
                        </td>

                        {/* QTY ORDERED */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'qty') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <input
                            type="number"
                            value={row.qty ?? ''}
                            onFocus={() => handleCellFocus(idx, 'qty')}
                            onChange={(e) => handleUpdateItemField(row.id, 'qty', e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                            onKeyDown={(e) => handleExcelKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handleInputPaste(e, idx, 'qty')}
                            data-gdn-row={idx}
                            data-gdn-col="qty"
                            style={row.cellColors?.['qty'] ? { color: row.cellColors['qty'] } : undefined}
                            className="w-full bg-transparent border-none text-center text-[10px] font-mono font-black text-blue-900 focus:outline-none focus:bg-amber-100 h-5 px-0"
                          />
                        </td>

                        {/* QTY DELIVERED */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'qtyReceived') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <input
                            type="number"
                            value={row.qtyReceived ?? ''}
                            onFocus={() => handleCellFocus(idx, 'qtyReceived')}
                            onChange={(e) => handleUpdateItemField(row.id, 'qtyReceived', e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                            onKeyDown={(e) => handleExcelKeyDown(e, idx, 'qtyReceived')}
                            onPaste={(e) => handleInputPaste(e, idx, 'qtyReceived')}
                            data-gdn-row={idx}
                            data-gdn-col="qtyReceived"
                            style={row.cellColors?.['qtyReceived'] ? { color: row.cellColors['qtyReceived'] } : undefined}
                            className="w-full bg-transparent border-none text-center text-[10px] font-mono font-black text-teal-800 focus:outline-none focus:bg-amber-100 h-5 px-0"
                          />
                        </td>

                        {/* SHORTAGE */}
                        {(() => {
                          const hasQty = row.qty !== '' && row.qty !== undefined && row.qty !== null;
                          const hasRec = row.qtyReceived !== '' && row.qtyReceived !== undefined && row.qtyReceived !== null;
                          const qO = hasQty ? Number(row.qty) : 0;
                          const qR = hasRec ? Number(row.qtyReceived) : qO;
                          const shortage = (hasQty && hasRec) ? Math.max(0, qO - qR) : '';
                          const isShort = typeof shortage === 'number' && shortage > 0;
                          return (
                            <td className={`p-0.5 text-center font-mono font-black text-[10px] ${isShort ? 'text-rose-700 bg-rose-100/60' : 'text-slate-800 bg-slate-50/50'}`}>
                              {shortage}
                            </td>
                          );
                        })()}

                        {isCoating ? (
                          <>
                            {/* MARKING TYPE */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'markingType') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.markingType || ''}
                                onFocus={() => handleCellFocus(idx, 'markingType')}
                                onChange={(e) => handleUpdateItemField(row.id, 'markingType', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingType')}
                                onPaste={(e) => handleInputPaste(e, idx, 'markingType')}
                                data-gdn-row={idx}
                                data-gdn-col="markingType"
                                placeholder=""
                                style={row.cellColors?.['markingType'] ? { color: row.cellColors['markingType'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* MARKING VISIBLE (YES/NO) */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'markingVisible') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.markingVisible || ''}
                                onFocus={() => handleCellFocus(idx, 'markingVisible')}
                                onChange={(e) => handleUpdateItemField(row.id, 'markingVisible', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingVisible')}
                                onPaste={(e) => handleInputPaste(e, idx, 'markingVisible')}
                                data-gdn-row={idx}
                                data-gdn-col="markingVisible"
                                placeholder=""
                                style={row.cellColors?.['markingVisible'] ? { color: row.cellColors['markingVisible'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* ADHESION TEST */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'adhesionTest') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.adhesionTest || ''}
                                onFocus={() => handleCellFocus(idx, 'adhesionTest')}
                                onChange={(e) => handleUpdateItemField(row.id, 'adhesionTest', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'adhesionTest')}
                                onPaste={(e) => handleInputPaste(e, idx, 'adhesionTest')}
                                data-gdn-row={idx}
                                data-gdn-col="adhesionTest"
                                style={row.cellColors?.['adhesionTest'] ? { color: row.cellColors['adhesionTest'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-blue-900 focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* THREADS */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'threads') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.threads || ''}
                                onFocus={() => handleCellFocus(idx, 'threads')}
                                onChange={(e) => handleUpdateItemField(row.id, 'threads', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'threads')}
                                onPaste={(e) => handleInputPaste(e, idx, 'threads')}
                                data-gdn-row={idx}
                                data-gdn-col="threads"
                                style={row.cellColors?.['threads'] ? { color: row.cellColors['threads'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* MICRONS */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'microns') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.microns || ''}
                                onFocus={() => handleCellFocus(idx, 'microns')}
                                onChange={(e) => handleUpdateItemField(row.id, 'microns', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'microns')}
                                onPaste={(e) => handleInputPaste(e, idx, 'microns')}
                                data-gdn-row={idx}
                                data-gdn-col="microns"
                                style={row.cellColors?.['microns'] ? { color: row.cellColors['microns'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            {/* MARKING */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'marking') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <div className="flex items-center justify-between gap-1 w-full relative group px-0.5">
                                {/* Uploaded Marking Image Thumbnail if present */}
                                {(row.markingImage || (row.marking && (row.marking.startsWith('data:image/') || row.marking.startsWith('http://') || row.marking.startsWith('https://')))) && (
                                  <div className="flex items-center gap-0.5 shrink-0 bg-amber-50/90 border border-amber-300 rounded px-1 py-0.5" title="Uploaded Marking Image">
                                    <img
                                      src={row.markingImage || row.marking}
                                      alt="Marking"
                                      className="h-3 max-w-[28px] object-contain inline-block bg-white rounded shrink-0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateItemField(row.id, 'markingImage', '');
                                        if (row.marking && (row.marking.startsWith('data:image/') || row.marking.startsWith('http'))) {
                                          handleUpdateItemField(row.id, 'marking', '');
                                        }
                                      }}
                                      title="Remove Marking Image"
                                      className="hover:bg-rose-200 rounded p-0.5 text-rose-700 cursor-pointer"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                )}

                                {/* Text input for text alongside/after marking image */}
                                <input
                                  type="text"
                                  value={(row.marking && (row.marking.startsWith('data:image/') || row.marking.startsWith('http'))) ? '' : row.marking}
                                  onFocus={() => handleCellFocus(idx, 'marking')}
                                  onChange={(e) => handleUpdateItemField(row.id, 'marking', e.target.value.toUpperCase())}
                                  onKeyDown={(e) => handleExcelKeyDown(e, idx, 'marking')}
                                  onPaste={(e) => handleInputPaste(e, idx, 'marking')}
                                  data-gdn-row={idx}
                                  data-gdn-col="marking"
                                  style={row.cellColors?.['marking'] ? { color: row.cellColors['marking'] } : undefined}
                                  placeholder={row.markingImage ? "+Text..." : "Marking..."}
                                  className="w-full bg-transparent border-none text-center text-[11px] font-black uppercase text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                                />

                                {/* Single Row Upload Icon */}
                                <label
                                  className="p-0.5 hover:bg-amber-200 rounded text-orange-800 cursor-pointer shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                                  title="Upload Transparent Marking Image"
                                >
                                  <Upload className="w-3 h-3" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleUploadMarkingImage(row.id, e)}
                                  />
                                </label>
                              </div>
                            </td>
                            {/* MARKING TYPE */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'markingType') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.markingType || ''}
                                onFocus={() => handleCellFocus(idx, 'markingType')}
                                onChange={(e) => handleUpdateItemField(row.id, 'markingType', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingType')}
                                onPaste={(e) => handleInputPaste(e, idx, 'markingType')}
                                data-gdn-row={idx}
                                data-gdn-col="markingType"
                                placeholder=""
                                style={row.cellColors?.['markingType'] ? { color: row.cellColors['markingType'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* MARKING VISIBLE */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'markingVisible') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.markingVisible || ''}
                                onFocus={() => handleCellFocus(idx, 'markingVisible')}
                                onChange={(e) => handleUpdateItemField(row.id, 'markingVisible', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'markingVisible')}
                                onPaste={(e) => handleInputPaste(e, idx, 'markingVisible')}
                                data-gdn-row={idx}
                                data-gdn-col="markingVisible"
                                placeholder=""
                                style={row.cellColors?.['markingVisible'] ? { color: row.cellColors['markingVisible'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* MICRONS */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'microns') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.microns || ''}
                                onFocus={() => handleCellFocus(idx, 'microns')}
                                onChange={(e) => handleUpdateItemField(row.id, 'microns', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'microns')}
                                onPaste={(e) => handleInputPaste(e, idx, 'microns')}
                                data-gdn-row={idx}
                                data-gdn-col="microns"
                                style={row.cellColors?.['microns'] ? { color: row.cellColors['microns'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none h-5 px-0.5"
                              />
                            </td>
                            {/* COATINGS */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'coatings') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.coatings || ''}
                                onFocus={() => handleCellFocus(idx, 'coatings')}
                                onChange={(e) => handleUpdateItemField(row.id, 'coatings', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'coatings')}
                                onPaste={(e) => handleInputPaste(e, idx, 'coatings')}
                                data-gdn-row={idx}
                                data-gdn-col="coatings"
                                style={row.cellColors?.['coatings'] ? { color: row.cellColors['coatings'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none focus:bg-amber-100 h-5 px-0.5"
                              />
                            </td>
                            {/* THREADS */}
                            <td className={`p-0.5 ${isCellSelected(idx, 'threads') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                              <input
                                type="text"
                                value={row.threads || ''}
                                onFocus={() => handleCellFocus(idx, 'threads')}
                                onChange={(e) => handleUpdateItemField(row.id, 'threads', e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'threads')}
                                onPaste={(e) => handleInputPaste(e, idx, 'threads')}
                                data-gdn-row={idx}
                                data-gdn-col="threads"
                                style={row.cellColors?.['threads'] ? { color: row.cellColors['threads'] } : undefined}
                                className="w-full bg-transparent border-none text-center text-[10px] font-bold text-black focus:outline-none h-5 px-0.5"
                              />
                            </td>
                          </>
                        )}

                        {/* REMARKS */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'remarks') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <GDNContentEditable
                            value={row.remarks || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'remarks', val)}
                            onFocus={() => handleCellFocus(idx, 'remarks')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'remarks')}
                            onPaste={(e) => handleInputPaste(e, idx, 'remarks')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'remarks')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'remarks')}
                            dataRow={idx}
                            dataCol="remarks"
                            cellColor={row.cellColors?.['remarks']}
                            className="text-left text-[10px] text-black font-semibold h-5 px-0.5 flex items-center whitespace-normal break-words leading-tight"
                          />
                        </td>

                        {/* QC NOTES */}
                        <td className={`p-0.5 ${isCellSelected(idx, 'qcNotes') ? 'bg-blue-100/90 ring-1 ring-blue-500' : ''}`}>
                          <GDNContentEditable
                            value={row.qcNotes || ''}
                            onChange={(val) => handleUpdateItemField(row.id, 'qcNotes', val)}
                            onFocus={() => handleCellFocus(idx, 'qcNotes')}
                            onKeyDown={(e) => handleExcelKeyDown(e as any, idx, 'qcNotes')}
                            onPaste={(e) => handleInputPaste(e, idx, 'qcNotes')}
                            onMouseUp={(e) => captureTextSelection(e, idx, 'qcNotes')}
                            onKeyUp={(e) => captureTextSelection(e, idx, 'qcNotes')}
                            dataRow={idx}
                            dataCol="qcNotes"
                            cellColor={row.cellColors?.['qcNotes']}
                            className="text-left text-[10px] font-bold text-emerald-900 h-5 px-0.5 flex items-center whitespace-normal break-words leading-tight"
                          />
                        </td>

                        {/* REMOVE Row button */}
                        <td className="text-center font-bold no-print">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Remove item line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}

                    {/* SUMS IN TOTALS ROW */}
                    <tr className="bg-slate-100 font-bold divide-x divide-black h-8 border-t-2 border-b-2 border-black">
                      <td colSpan={5} className="text-right pr-3 text-[10px] text-black uppercase select-none">
                        TOTAL AGGREGATED SUM:
                      </td>
                      <td className="text-center text-blue-900 font-black text-[11px] font-mono">
                        {calculatedSums.totalQtyOrdered.toLocaleString()}
                      </td>
                      <td className="text-center text-teal-800 font-black text-[11px] font-mono">
                        {calculatedSums.totalQtyDelivered.toLocaleString()}
                      </td>
                      <td className={`text-center font-black text-[11px] font-mono ${calculatedSums.totalShortage > 0 ? 'text-rose-700 bg-rose-100/60' : 'text-emerald-800 bg-emerald-100/50'}`}>
                        {calculatedSums.totalShortage.toLocaleString()}
                      </td>
                      <td colSpan={isCoating ? 6 : 6} className="bg-slate-50"></td>
                      <td className="no-print bg-slate-50"></td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Append Item row trigger and Scroll buttons */}
              <div className="flex justify-between items-center bg-slate-50 p-2 border border-black rounded-xs no-print">
                <button
                  type="button"
                  onClick={handleAppendRow}
                  className="bg-white hover:bg-slate-100 text-black text-[10px] font-bold px-3 py-1.5 rounded border border-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-emerald-600" /> Append New Dispatch Row Line
                </button>

                {activeDO.items.length > 7 && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('gdn-items-scroll-container');
                        if (el) el.scrollTop = 0;
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-black text-black text-[9px] font-bold uppercase rounded cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Scroll to Top of Items"
                    >
                      ↑ TOP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('gdn-items-scroll-container');
                        if (el) el.scrollTop = el.scrollHeight;
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-black text-black text-[9px] font-bold uppercase rounded cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Scroll to Bottom of Items"
                    >
                      ↓ BOTTOM
                    </button>
                  </div>
                )}
              </div>

              {/* Row 4.5: REMARKS */}
              <div className="border-1.5 border-black rounded p-3 bg-white space-y-1.5 text-left mt-3">
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

              {/* Row 5: SIGNATURES & AUTHORIZATION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                
                {/* DISPATCHED / PREPARED BY */}
                <div className="border-1.5 border-dashed border-black rounded p-3 bg-white space-y-2 text-left">
                  <span className="text-[9.5px] font-black uppercase text-black block border-b border-black pb-1">
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVED / STORED BY:' : 'DISPATCHED / PREPARED BY:'}
                  </span>
                  <input
                    type="text"
                    value={activeDO.receiverName}
                    onChange={(e) => handleUpdateField('receiverName', e.target.value.toUpperCase())}
                    className="w-full bg-transparent border-b border-slate-300 focus:border-black font-extrabold text-[11px] text-black uppercase outline-none"
                    placeholder="OFFICER / STOREKEEPER NAME"
                  />
                  <div className="border-b border-dashed border-black pt-4"></div>
                  <div className="text-[8.5px] font-bold text-black uppercase text-left pt-0.5">
                    SIGNATURE / STAMP
                  </div>
                </div>

                {/* QA/QC CHECKED BY */}
                <div className="border-1.5 border-dashed border-black rounded p-3 bg-white space-y-2 text-left">
                  <span className="text-[9.5px] font-black uppercase text-black block border-b border-black pb-1">
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'QA/QC INSPECTED BY:' : 'QA/QC CHECKED BY:'}
                  </span>
                  <input
                    type="text"
                    value={activeDO.qcCheckedBy}
                    onChange={(e) => handleUpdateField('qcCheckedBy', e.target.value.toUpperCase())}
                    className="w-full bg-transparent border-b border-slate-300 focus:border-black font-extrabold text-[11px] text-black uppercase outline-none"
                    placeholder="QA/QC INSPECTOR NAME"
                  />
                  <div className="border-b border-dashed border-black pt-4"></div>
                  <div className="text-[8.5px] font-bold text-black uppercase text-left pt-0.5">
                    SIGNATURE / STAMP
                  </div>
                </div>

                {/* CUSTOMER RECEIVED BY */}
                <div className="border-1.5 border-dashed border-black rounded p-3 bg-white space-y-2 text-left">
                  <span className="text-[9.5px] font-black uppercase text-black block border-b border-black pb-1">
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'SUPPLIER / AUTHORIZED BY:' : 'CUSTOMER RECEIVED BY:'}
                  </span>
                  <input
                    type="text"
                    value={activeDO.attentionTo || ''}
                    onChange={(e) => handleUpdateField('attentionTo', e.target.value.toUpperCase())}
                    className="w-full bg-transparent border-b border-slate-300 focus:border-black font-extrabold text-[11px] text-black uppercase outline-none"
                    placeholder="AUTHORIZED REP NAME"
                  />
                  <div className="border-b border-dashed border-black pt-4"></div>
                  <div className="text-[8.5px] font-bold text-black uppercase text-left pt-0.5">
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'SUPPLIER SIGNATURE / STAMP' : 'CUSTOMER SIGNATURE / STAMP'}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Actions footer panel */}
            <div className="bg-slate-900 text-white px-6 py-4 rounded-xl flex items-center justify-between no-print shadow-md">
              <div className="text-[10.5px] font-medium text-slate-300">
                Ensure you click <strong className="text-[#f37021]">Save Work Order</strong> to push reports into local cache records permanently!
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveActiveDO}
                  className="bg-[#f37021] hover:bg-[#d65a12] text-white font-bold px-6 py-2 rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Work Order
                </button>
              </div>
            </div>
          </div>
        )}

          {/* WORK ORDER RECORDS LEDGER */}
          {activeSubTab === 'record' && (
            <>
              <div id="gdn-records-ledger" className="hidden lg:block bg-slate-50 rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4 scroll-mt-6">
            
            {/* Search, Filter Buttons, Month & Export Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              {/* TOP ROW: 2 DEDICATED RECORDS LEDGER BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterType('standard')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      filterType === 'standard' || filterType === 'gdn'
                        ? 'bg-[#f37021] text-white shadow-md ring-2 ring-orange-400/50 scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    STANDARD GDN RECORDS
                    <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9.5px] bg-black/20 text-white font-mono">
                      {logs.filter(l => l.type === 'standard' || !l.type).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('coating')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      filterType === 'coating'
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50 scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    COATING GDN RECORDS
                    <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9.5px] bg-black/20 text-white font-mono">
                      {logs.filter(l => l.type === 'coating').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    ALL RECORDS ({logs.length})
                  </button>
                </div>

                {/* Print Records List & Export CSV buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveGDNRegistryAsPdf}
                    className="bg-[#f37021] hover:bg-orange-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap uppercase"
                    title="Print Filtered GDN Records List PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" /> PRINT RECORDS LIST
                  </button>

                  <button
                    type="button"
                    onClick={handleExportLedgerToCSV}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                    title="Export Ledger Records to CSV file"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" /> Export CSV
                  </button>
                </div>
              </div>

              {/* SECOND ROW: Search Bar & Month Filter */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-0.5">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Work Order No, Client/Customer name, PO No, Invoice No, or Item Description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 pl-9 pr-8 py-1.5 rounded-xl text-[11px] font-medium text-slate-800 outline-none focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Month Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[10.5px] font-bold text-slate-800 outline-none focus:border-slate-500 shadow-2xs uppercase cursor-pointer"
                  >
                    <option value="all">ALL MONTHS</option>
                    {uniqueMonths.map((m) => (
                      <option key={m} value={m}>
                        {formatMonthName(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table of Ledger Logs */}
            {filteredLogs.length === 0 ? (
              <div className="text-center p-10 border-2 border-slate-200 border-dashed rounded-xl bg-white text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700 text-xs">No active Goods Dispatched Note records matching your filters.</p>
                <p className="text-[10px] text-slate-500 mt-1">Try clearing your search query or month filter.</p>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setFilterType('all'); setSelectedMonth('all'); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px] font-sans">
                  <thead>
                    <tr className="bg-[#0d233a] text-white divide-x divide-slate-700 font-bold border-b border-slate-700 h-8 text-[9.5px] uppercase tracking-wider">
                      <th className="p-2 w-[140px]">WORK ORDER NO</th>
                      <th className="p-2 w-[100px]">DATE</th>
                      <th className="p-2">CLIENT / CUSTOMER</th>
                      <th className="p-2 w-[130px]">PO NUMBER</th>
                      <th className="p-2 w-[130px]">INVOICE NO</th>
                      <th className="p-2 text-center w-[130px]">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLogs.map((log) => {
                      return (
                        <tr key={log.id} className={`hover:bg-slate-50 divide-x divide-slate-100 transition-all ${
                          activeDO.doNo === log.doNo ? 'bg-orange-50/50' : ''
                        }`}>
                          {/* 1. WORK ORDER NO */}
                          <td className="p-2 font-mono font-bold text-rose-650 whitespace-nowrap text-[11px]">
                            {log.doNo || '—'}
                          </td>

                          {/* 2. Date */}
                          <td className="p-2 text-slate-500 whitespace-nowrap text-[10.5px]">
                            {log.date || '—'}
                          </td>

                          {/* 3. Client / Customer */}
                          <td className="p-2 font-bold text-slate-900 uppercase">
                            <div className="line-clamp-1">{log.supplierName || '—'}</div>
                            {log.phone && (
                              <div className="text-[9px] font-normal text-slate-500 normal-case">
                                Ph: {log.phone}
                              </div>
                            )}
                          </td>

                          {/* 4. PO NUMBER */}
                          <td className="p-2 font-mono font-bold text-slate-800 text-[10.5px] whitespace-nowrap">
                            {log.poNo || '—'}
                          </td>

                          {/* 5. INVOICE NO */}
                          <td className="p-2 font-mono text-slate-700 text-[10.5px] whitespace-nowrap">
                            {log.invoiceNo || '—'}
                          </td>

                          {/* 6. Action Buttons */}
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex gap-1.5 justify-center items-center">
                              <button
                                type="button"
                                onClick={() => handleLoadFromLedger(log)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit / Load GDN Record"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-800" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveDOAsPDF(log)}
                                className="p-1.5 bg-orange-50 hover:bg-orange-100 text-[#f37021] rounded-lg transition-colors cursor-pointer"
                                title="Print / Export PDF"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDuplicateDO(log, e)}
                                className="p-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg transition-colors cursor-pointer"
                                title="Duplicate Record as New Draft"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteDO(log.id, log.doNo, e)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* MOBILE VERSION: GOODS DISPATCHED NOTES RECORDS LEDGER */}
          <div className="lg:hidden block bg-white border border-slate-350 text-black rounded-lg p-3 sm:p-5 shadow-sm space-y-4 font-mono select-none no-print animate-in fade-in duration-150">
            {/* Top Corporate Header strictly matching Page 2 header */}
            <div className="text-center font-sans pb-2 border-b border-slate-200">
              <h2 className="text-[13px] sm:text-[14px] font-bold uppercase tracking-tight text-slate-900 leading-tight">
                {activeCompany.name}
              </h2>
              <p className="text-[7.2px] sm:text-[7.8px] font-bold text-slate-500 uppercase tracking-tight mt-0.5 leading-none">
                {activeCompany.subtitle || 'Manufacturer & Supplier of Fasteners, Fittings & Fixing Accessories'}
              </p>
            </div>

            {/* Title block & Search bar row */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
              <div 
                className="flex items-center gap-1.5 select-none border border-slate-300 px-2 py-1 rounded-md bg-white text-slate-950"
              >
                <div>
                  <FileText className="w-5 h-5 text-amber-500 fill-amber-300" />
                </div>
                <div className="flex flex-col text-left font-sans leading-none">
                  <span className="text-[8.5px] font-semibold uppercase text-slate-800">
                    Work
                  </span>
                  <span className="text-[9.5px] font-bold uppercase text-slate-900 mt-0.5">
                    Orders
                  </span>
                </div>
              </div>

              {/* Search input with magnifying glass decoration inside */}
              <div className="relative flex-1 max-w-[130px] sm:max-w-[170px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 font-bold" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[9.5px] sm:text-[10px] pl-7 pr-1.5 py-1.5 border border-slate-350 bg-white text-black font-semibold rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Month & Year Filter row with "All" and dynamic months in red text with a trailing hyphen */}
            <div className="flex flex-wrap gap-1.5 mt-1 font-mono">
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className={`px-3 py-1.5 text-[9.5px] font-bold uppercase border rounded-md transition-all cursor-pointer ${
                  selectedMonth === 'all'
                    ? 'border-black bg-slate-100 text-red-650 font-bold shadow-3xs ring-1 ring-black'
                    : 'border-slate-300 bg-white text-red-600 font-bold hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {uniqueMonths.map((m) => {
                const parts = m.split('-');
                const monthNum = Number(parts[1]);
                const d = new Date(2000, monthNum - 1, 1);
                const shortName = d.toLocaleDateString('en-US', { month: 'short' }); // e.g. "May", "Jun"
                const hyphenated = shortName.charAt(0).toUpperCase() + shortName.slice(1).toLowerCase() + '-';

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonth(m)}
                    className={`px-3 py-1.5 text-[9.5px] font-bold uppercase border rounded-md transition-all cursor-pointer ${
                      selectedMonth === m
                        ? 'border-black bg-slate-100 text-red-650 font-bold shadow-3xs ring-1 ring-black'
                        : 'border-slate-300 bg-white text-red-600 font-bold hover:bg-slate-50'
                    }`}
                  >
                    {hyphenated}
                  </button>
                );
              })}
            </div>

            {/* "Work Orders" Header Title in red typeface box */}
            <div className="flex justify-start">
              <div className="border border-slate-300 px-3 py-1 bg-white rounded">
                <span className="text-[10px] font-semibold uppercase tracking-tight text-red-650 font-sans">
                  Work Orders
                </span>
              </div>
            </div>

            {/* Mobile table grid with 12 asymmetrical columns for optimal text fitting */}
            <div className="space-y-1">
              {/* Header block with 12-column corporate layout */}
              <div className="grid grid-cols-12 gap-1 font-sans text-center">
                <div className="col-span-2 border border-slate-300 bg-white text-[7.5px] sm:text-[8px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-none h-[34px] rounded-sm shadow-3xs">
                  WO NO
                </div>
                <div className="col-span-2 border border-slate-300 bg-white text-[7.5px] sm:text-[8px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-none h-[34px] rounded-sm shadow-3xs">
                  Date
                </div>
                <div className="col-span-2 border border-slate-300 bg-white text-[7.5px] sm:text-[8px] font-bold uppercase text-slate-800 flex flex-col items-center justify-center text-center leading-none h-[34px] rounded-sm shadow-3xs">
                  Client / Cust
                </div>
                <div className="col-span-2 border border-slate-300 bg-white text-[7.5px] sm:text-[8px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-none h-[34px] rounded-sm shadow-3xs">
                  PO No
                </div>
                <div className="col-span-2 border border-slate-300 bg-white text-[7.5px] sm:text-[8px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-none h-[34px] rounded-sm shadow-3xs">
                  Invoice No
                </div>
                <div className="col-span-2 border border-slate-300 bg-white text-[7.5px] sm:text-[8px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-none h-[34px] rounded-sm shadow-3xs">
                  Action
                </div>
              </div>

              {/* Data Rows block with 12 matching cells per row */}
              <div className="space-y-1.5 pt-1">
                {filteredLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 italic bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs">
                    No active Work Order records matching filters.
                  </div>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const isSelected = activeDO.doNo === log.doNo;
                    
                    return (
                      <div
                        key={log.id + '-gmob-row-' + idx}
                        className={`grid grid-cols-12 gap-1 items-stretch rounded transition-all ${
                          isSelected 
                            ? 'bg-orange-50/40 ring-1 ring-orange-400' 
                            : 'bg-white'
                        }`}
                      >
                        {/* 1. GDN NO (2 cols) */}
                        <div className="col-span-2 border border-slate-200 rounded p-1 flex items-center justify-center text-center min-h-[36px] bg-slate-50/50">
                          <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-rose-650 tracking-tighter break-all leading-tight">
                            {log.doNo || '—'}
                          </span>
                        </div>

                        {/* 2. Date (2 cols) */}
                        <div className="col-span-2 border border-slate-200 rounded p-1 flex items-center justify-center text-center min-h-[36px]">
                          <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-600 tracking-tighter leading-tight">
                            {log.date ? log.date.substring(5) : '—'}
                          </span>
                        </div>

                        {/* 3. CLIENT / CUSTOMER (2 cols) */}
                        <div className="col-span-2 border border-slate-200 rounded p-1 flex items-center justify-center text-center min-h-[36px]">
                          <span className="text-[7.5px] sm:text-[8px] font-sans font-bold uppercase text-slate-800 leading-tight line-clamp-2 break-all" title={log.supplierName}>
                            {log.supplierName || '—'}
                          </span>
                        </div>

                        {/* 4. PO No (2 cols) */}
                        <div className="col-span-2 border border-slate-200 rounded p-1 flex items-center justify-center text-center min-h-[36px]">
                          <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold text-[#f37021] tracking-tighter break-all leading-tight">
                            {log.poNo || '—'}
                          </span>
                        </div>

                        {/* 5. INVOICE NO (2 cols) */}
                        <div className="col-span-2 border border-slate-200 rounded p-1 flex items-center justify-center text-center min-h-[36px]">
                          <span className="text-[6.5px] sm:text-[7.5px] font-mono font-semibold text-indigo-900 tracking-tighter break-all leading-tight">
                            {log.invoiceNo || '—'}
                          </span>
                        </div>

                        {/* 6. Action (2 cols - view details and print PDF, NO DELETE button) */}
                        <div className="col-span-2 border border-slate-200 rounded p-1 flex items-center justify-center gap-1.5 min-h-[36px] bg-slate-50/50">
                          {/* Sky eye view details button */}
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadFromLedger(log);
                              triggerToast(`Loaded GDN ${log.doNo} into editor!`);
                            }}
                            className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] bg-sky-600 hover:bg-sky-700 text-white rounded flex items-center justify-center cursor-pointer shadow-3xs active:scale-[0.95] transition-all"
                            title="View/Edit Details"
                          >
                            <Eye className="w-2.5 h-2.5 text-white" />
                          </button>
                          
                          {/* Emerald print PDF button */}
                          <button
                            type="button"
                            onClick={() => handleSaveDOAsPDF(log)}
                            className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center cursor-pointer shadow-3xs active:scale-[0.95] transition-all"
                            title="Print PDF Note"
                          >
                            <Printer className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom Delete prompt Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-black w-full max-w-sm p-6 shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-rose-600 tracking-tight mb-2 uppercase">⚠ Confirm Removal</h3>
            <p className="text-[10.5px] text-slate-600 mb-6 font-semibold leading-relaxed font-sans">
              Are you absolutely sure you want to permanently delete dispatched note <strong className="font-semibold">{deleteTargetId.doNo}</strong>? This action will update the active ledger database and cannot be undone.
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

      {/* Edit Header Modal */}
      {isEditHeaderOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-2xl p-6 shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#f37021]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Edit GDN Header & Delivery Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditHeaderOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Deliver To Details */}
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 space-y-3">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Deliver To / Customer Info</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Customer Name</label>
                    <input
                      type="text"
                      value={activeDO.supplierName || ''}
                      onFocus={() => {
                        if (matchingSuggestions.length > 0) setIsCustomerDropdownOpen(true);
                      }}
                      onChange={(e) => {
                        handleCustomerNameChange(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onKeyDown={(e) => handleCustomerInputKeyDown(e)}
                      placeholder="e.g. AL BALAA BUILDING MATERIALS LLC"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                      autoComplete="off"
                    />

                    {/* Modal Customer Dropdown */}
                    {isCustomerDropdownOpen && matchingSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-slate-900 rounded-lg shadow-2xl z-[160] max-h-52 overflow-y-auto divide-y divide-slate-100 text-left font-sans">
                        <div className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 flex justify-between items-center tracking-wider sticky top-0 z-10">
                          <span>Suggested Companies ({matchingSuggestions.length})</span>
                          <span className="text-amber-300 font-bold">Use ↓ ↑ & Enter to select</span>
                        </div>
                        {matchingSuggestions.map((cust, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectCustomerSuggestion(cust)}
                            onMouseEnter={() => setCustomerHighlightIndex(idx)}
                            className={`p-2 cursor-pointer transition-colors ${
                              idx === customerHighlightIndex
                                ? 'bg-amber-100 text-slate-900 font-black border-l-4 border-[#f37021]'
                                : 'hover:bg-slate-50 text-slate-800 font-semibold'
                            }`}
                          >
                            <div className="text-[11.5px] font-black text-black uppercase flex items-center justify-between">
                              <span>{cust.name}</span>
                              {cust.trn && <span className="text-[9px] font-mono text-slate-500 font-normal">TRN: {cust.trn}</span>}
                            </div>
                            {cust.address && (
                              <div className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                                📍 {cust.address}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Attention / Contact</label>
                    <input
                      type="text"
                      value={activeDO.attentionTo || ''}
                      onChange={(e) => handleUpdateField('attentionTo', e.target.value)}
                      placeholder="e.g. MR. SHANAVAS / SITE ENGINEER"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Delivery Site Address</label>
                    <input
                      type="text"
                      value={activeDO.supplierAddress || ''}
                      onChange={(e) => handleUpdateField('supplierAddress', e.target.value)}
                      placeholder="e.g. DIC INDUSTRIAL AREA, DUBAI, UAE"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Telephone</label>
                    <input
                      type="text"
                      value={activeDO.phone || ''}
                      onChange={(e) => handleUpdateField('phone', e.target.value)}
                      placeholder="e.g. +971 4 885 9999"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">TRN No</label>
                    <input
                      type="text"
                      value={activeDO.trn || ''}
                      onChange={(e) => handleUpdateField('trn', e.target.value)}
                      placeholder="e.g. 100342981200003"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Document References */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Document References</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Work Order / GDN No</label>
                    <input
                      type="text"
                      value={activeDO.doNo || ''}
                      onChange={(e) => handleUpdateField('doNo', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0c449e] focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">LPO / PO Reference</label>
                    <input
                      type="text"
                      value={activeDO.poNo || ''}
                      onChange={(e) => handleUpdateField('poNo', e.target.value)}
                      placeholder="e.g. PO-883921"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Invoice Reference</label>
                    <input
                      type="text"
                      value={activeDO.invoiceNo || ''}
                      onChange={(e) => handleUpdateField('invoiceNo', e.target.value)}
                      placeholder="e.g. INV-99321"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Dispatch By</label>
                    <input
                      type="text"
                      value={activeDO.dispatchBy || ''}
                      onChange={(e) => handleUpdateField('dispatchBy', e.target.value)}
                      placeholder="e.g. MARINE FASTENERS TRUCK"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">Delivery Terms</label>
                    <input
                      type="text"
                      value={activeDO.deliveryTerms || ''}
                      onChange={(e) => handleUpdateField('deliveryTerms', e.target.value)}
                      placeholder="e.g. DDP - SITE DELIVERY"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1 uppercase">QA/QC Checked By</label>
                    <input
                      type="text"
                      value={activeDO.qcCheckedBy || ''}
                      onChange={(e) => handleUpdateField('qcCheckedBy', e.target.value)}
                      placeholder="e.g. ENG. M. HASAN"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditHeaderOpen(false)}
                className="bg-[#f37021] hover:bg-[#d65a12] text-white font-bold px-6 py-2 rounded-xl text-xs uppercase shadow-md transition-all cursor-pointer"
              >
                Done / Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Landscape Document Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 w-full max-w-[1350px] max-h-[95vh] flex flex-col shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-white">
                    GOODS DISPATCHED NOTE PREVIEW (A4 LANDSCAPE)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    WO NO: {activeDO.doNo} | DATE: {activeDO.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDOAsPDF(activeDO)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs uppercase flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body Sheet - Exact Print PDF Redesign */}
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-200 flex-1 flex justify-center">
              <div className="bg-white p-6 sm:p-10 rounded-xs shadow-2xl border-2 border-black w-full max-w-[1240px] text-black space-y-4 font-sans" style={{ fontFamily: 'Arial, sans-serif' }}>
                
                {/* Header Row: Deliver To vs Title Box */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-7 space-y-0.5 text-left">
                    <div className="text-[11px] font-black uppercase text-black tracking-wider">
                      {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVED FROM (SUPPLIER / VENDOR):' : 'DELIVER TO:'}
                    </div>
                    <div className="font-black text-[14px] uppercase text-black">
                      {activeDO.supplierName || '—'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      {activeDO.supplierAddress || '—'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      Telephone: {activeDO.phone || '—'}
                    </div>
                    <div className="text-[11px] font-black text-black">
                      TRN: {activeDO.trn || '—'}
                    </div>
                  </div>

                  <div className="col-span-5 flex flex-col items-end">
                    <div className="border-2 border-black p-2.5 px-4 bg-white text-center shadow-2xs w-full">
                      <span className="text-[14px] font-black uppercase tracking-wider text-black block">
                        {activeDO.documentTitle || (activeDO.type === 'coating_grn' ? 'COATING GOODS RECEIVED NOTE' : activeDO.type === 'grn' ? 'GOODS RECEIVED NOTE' : isCoating ? 'COATING GOODS DISPATCH NOTES' : 'GOODS DISPATCHED NOTE')}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-black mt-1">
                      PAGE 1 OF 1
                    </div>
                  </div>
                </div>

                {/* Subheader Bar */}
                <div className="border-t-1.5 border-b-1.5 border-black py-1.5 px-3 bg-white flex items-center justify-between text-[11px] font-bold uppercase">
                  <div>
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'GRN NO :' : 'GDN NO :'} <span className="text-rose-600 font-extrabold">{activeDO.doNo}</span>
                  </div>
                  <div>
                    {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'GRN DATE :' : 'GDN DATE :'} <span className="text-black font-extrabold">{activeDO.date}</span>
                  </div>
                </div>

                {/* Delivery From & Logistics Table */}
                <div className="grid grid-cols-12 gap-4 items-start pt-1">
                  <div className="col-span-6 space-y-0.5 text-left">
                    <div className="text-[11px] font-black uppercase text-black tracking-wider">
                      {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVING LOCATION / STORE:' : 'DELIVERY FROM:'}
                    </div>
                    <div className="font-black text-[13.5px] text-black uppercase">
                      {activeDO.deliveryFromName || activeCompany.name}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      {activeDO.deliveryFromAddress || (activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      Telephone: {activeDO.deliveryFromPhone || activeCompany.phone || '—'}
                    </div>
                    <div className="text-[11px] font-black text-black">
                      TRN: {activeDO.deliveryFromTrn !== undefined ? activeDO.deliveryFromTrn : activeCompany.trn}
                    </div>
                  </div>

                  <div className="col-span-6">
                    <table className="w-full border-collapse border-1.5 border-black text-[10.5px] font-sans">
                      <tbody>
                        <tr className="border-b border-black">
                          <td className="w-1/2 font-bold p-1 bg-white border-r border-black text-left">INVOICE NO :</td>
                          <td className="w-1/2 p-1 font-bold text-left">{activeDO.invoiceNo || '—'}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="font-bold p-1 bg-white border-r border-black text-left">{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'GRN NO :' : 'GDN NO :'}</td>
                          <td className="p-1 font-extrabold text-rose-600 text-left">{activeDO.doNo || '—'}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="font-bold p-1 bg-white border-r border-black text-left">PO NO :</td>
                          <td className="p-1 font-bold text-left">{activeDO.poNo || '—'}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="font-bold p-1 bg-white border-r border-black text-left">{(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVED VIA :' : 'DISPATCH BY :'}</td>
                          <td className="p-1 font-bold text-left">{activeDO.dispatchBy || '—'}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="font-bold p-1 bg-white border-r border-black text-left">DELIVERY TERMS :</td>
                          <td className="p-1 font-bold text-left">{activeDO.deliveryTerms || '—'}</td>
                        </tr>
                        <tr>
                          <td className="font-bold p-1 bg-white border-r border-black text-left">MADE IN :</td>
                          <td className="p-1 font-bold text-left">{activeDO.madeIn || '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Items Table Matching Print PDF */}
                <div className="border-1.5 border-black overflow-hidden">
                  <table className="w-full border-collapse text-[10px] font-sans">
                    <thead>
                      <tr className="bg-[#f8fafc] text-black border-b-2 border-black text-center h-7 text-[9px] uppercase font-black tracking-wider divide-x divide-black">
                        <th className="p-1 w-[4%] text-center">S.N</th>
                        <th className="p-1 w-[16%] text-left pl-1.5">DESCRIPTION</th>
                        <th className="p-1 w-[10%] text-center">SIZE</th>
                        <th className="p-1 w-[6%] text-center">FINISH</th>
                        <th className="p-1 w-[5%] text-center">UNIT</th>
                        <th className="p-1 w-[6%] text-center">QTY ORDERED</th>
                        <th className="p-1 w-[6%] text-center">QTY DELIVERED</th>
                        <th className="p-1 w-[6%] text-center">SHORTAGE</th>
                        {isCoating ? (
                          <>
                            <th className="p-1 w-[6%] text-center">MARKING TYPE</th>
                            <th className="p-1 w-[8%] text-center">MARKING VISIBLE</th>
                            <th className="p-1 w-[7%] text-center">ADHESION</th>
                            <th className="p-1 w-[6%] text-center">THREADS</th>
                            <th className="p-1 w-[5%] text-center">MICRONS</th>
                          </>
                        ) : (
                          <>
                            <th className="p-1 w-[7%] text-center">MARKING</th>
                            <th className="p-1 w-[6%] text-center">MARKING TYPE</th>
                            <th className="p-1 w-[7%] text-center">MARKING VISIBLE</th>
                            <th className="p-1 w-[5%] text-center">MICRONS</th>
                            <th className="p-1 w-[5%] text-center">COATINGS</th>
                            <th className="p-1 w-[5%] text-center">THREADS</th>
                          </>
                        )}
                        <th className="p-1 w-[9%] text-center">FREE-RUNNING FIT TEST</th>
                        <th className="p-1 w-[12%] text-left pl-1.5">QC NOTES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {getValidPrintItems(activeDO.items).map((row, idx) => {
                        const hasQty = (row.qty as any) !== '' && row.qty !== undefined && row.qty !== null;
                        const hasRec = (row.qtyReceived as any) !== '' && row.qtyReceived !== undefined && row.qtyReceived !== null;
                        const qO = hasQty ? Number(row.qty) : 0;
                        const qR = hasRec ? Number(row.qtyReceived) : qO;
                        const shortageNum = (hasQty && hasRec) ? Math.max(0, qO - qR) : 0;
                        const shortage = shortageNum > 0 ? shortageNum : '';

                        return (
                          <tr key={row.id || idx} className="divide-x divide-black h-6 bg-white align-middle">
                            <td className="p-1 text-center font-bold text-black">{row.sn || idx + 1}</td>
                            <td className="p-1 text-left pl-1.5 font-bold uppercase text-black break-words" dangerouslySetInnerHTML={{ __html: row.description || '—' }} />
                            <td className="p-1 text-center text-black font-bold uppercase">{row.size || '—'}</td>
                            <td className="p-1 text-center text-black font-bold uppercase">{row.finish || '—'}</td>
                            <td className="p-1 text-center font-bold text-black">{row.unit || 'PCS'}</td>
                            <td className="p-1 text-center font-bold text-blue-900">{row.qty || '—'}</td>
                            <td className="p-1 text-center font-bold text-teal-800">{row.qtyReceived !== undefined ? row.qtyReceived : (row.qty || '—')}</td>
                            <td className={`p-1 text-center font-bold ${shortageNum > 0 ? 'text-rose-600 bg-rose-50' : 'text-black'}`}>{shortage}</td>
                            {isCoating ? (
                              <>
                                <td className="p-1 text-center text-blue-900">{row.markingType || '—'}</td>
                                <td className="p-1 text-center text-blue-900">
                                  {row.markingVisible && (row.markingVisible.startsWith('data:image/') || row.markingVisible.startsWith('http://') || row.markingVisible.startsWith('https://')) ? (
                                    <img src={row.markingVisible} alt="Marking" className="max-h-5 max-w-[55px] object-contain inline-block mx-auto" />
                                  ) : (
                                    row.markingVisible || '—'
                                  )}
                                </td>
                                <td className="p-1 text-center text-blue-900">{row.adhesionTest || '—'}</td>
                                <td className="p-1 text-center text-blue-900">{row.threads || '—'}</td>
                                <td className="p-1 text-center text-blue-900">{row.microns || '—'}</td>
                              </>
                            ) : (
                              <>
                                <td className="p-1 text-center text-orange-900 font-bold">
                                  {(() => {
                                    const img = row.markingImage || ((row.marking && (row.marking.startsWith('data:image/') || row.marking.startsWith('http'))) ? row.marking : '');
                                    const txt = (row.marking && (row.marking.startsWith('data:image/') || row.marking.startsWith('http'))) ? '' : row.marking;
                                    if (img) {
                                      return (
                                        <div className="flex items-center justify-center gap-1">
                                          <img src={img} alt="Marking" className="max-h-3.5 max-w-[28px] object-contain inline-block" />
                                          {txt && <span className="font-black text-[11px] uppercase text-black leading-none">{txt}</span>}
                                        </div>
                                      );
                                    }
                                    return <span className="font-black text-[11px] uppercase text-black leading-none">{txt || '—'}</span>;
                                  })()}
                                </td>
                                <td className="p-1 text-center text-orange-900 font-bold">{row.markingType || '—'}</td>
                                <td className="p-1 text-center text-orange-900 font-bold">{row.markingVisible || '—'}</td>
                                <td className="p-1 text-center text-orange-900">{row.microns || '—'}</td>
                                <td className="p-1 text-center text-orange-900">{row.coatings || '—'}</td>
                                <td className="p-1 text-center text-orange-900">{row.threads || '—'}</td>
                              </>
                            )}
                            <td className="p-1 text-center text-black">{row.remarks || '—'}</td>
                            <td className="p-1 text-left pl-1.5 text-emerald-900 font-medium">{row.qcNotes || '—'}</td>
                          </tr>
                        );
                      })}

                      {/* Total Aggregated Sum row */}
                      <tr className="bg-slate-50 font-bold divide-x divide-black h-7 border-t-2 border-black">
                        <td colSpan={5} className="text-right pr-2 text-[9px] text-black uppercase">
                          TOTAL AGGREGATED SUM:
                        </td>
                        <td className="text-center text-blue-900 font-black text-[10px] font-mono">
                          {calculatedSums.totalQtyOrdered.toLocaleString()}
                        </td>
                        <td className="text-center text-teal-800 font-black text-[10px] font-mono">
                          {calculatedSums.totalQtyDelivered.toLocaleString()}
                        </td>
                        <td className={`text-center font-black text-[10px] font-mono ${calculatedSums.totalShortage > 0 ? 'text-rose-700 bg-rose-100' : 'text-black'}`}>
                          {calculatedSums.totalShortage.toLocaleString()}
                        </td>
                        <td colSpan={6} className="bg-slate-50"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Page End Notes Section / REMARKS */}
                <div className="border-1.5 border-black p-2.5 bg-white space-y-1 text-left text-[9px] text-black font-sans my-3">
                  <div className="font-extrabold uppercase border-b border-black pb-0.5 text-[9.5px]">
                    REMARKS:
                  </div>
                  <div className="pt-0.5 space-y-0.5 font-medium leading-tight">
                    {getNotesLines(activeDO).map((line, i) => (
                      <div key={i}>{i + 1}. {line}</div>
                    ))}
                  </div>
                </div>

                {/* Signatures Grid Matching PDF */}
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="border-1.5 border-black p-2.5 bg-white space-y-1.5 text-left">
                    <span className="text-[9px] font-black uppercase text-black block border-b border-black pb-1">
                      {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'RECEIVED / STORED BY:' : 'DISPATCHED / PREPARED BY:'}
                    </span>
                    <div className="font-extrabold text-[10px] text-black uppercase pt-0.5">
                      {activeDO.receiverName || '—'}
                    </div>
                    <div className="border-b border-dashed border-black pt-5"></div>
                    <div className="text-[8px] font-bold text-black uppercase text-left pt-0.5">
                      SIGNATURE / STAMP
                    </div>
                  </div>

                  <div className="border-1.5 border-black p-2.5 bg-white space-y-1.5 text-left">
                    <span className="text-[9px] font-black uppercase text-black block border-b border-black pb-1">
                      {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'QA/QC INSPECTED BY:' : 'QA/QC CHECKED BY:'}
                    </span>
                    <div className="font-extrabold text-[10px] text-black uppercase pt-0.5">
                      {activeDO.qcCheckedBy || '—'}
                    </div>
                    <div className="border-b border-dashed border-black pt-5"></div>
                    <div className="text-[8px] font-bold text-black uppercase text-left pt-0.5">
                      SIGNATURE / STAMP
                    </div>
                  </div>

                  <div className="border-1.5 border-black p-2.5 bg-white space-y-1.5 text-left">
                    <span className="text-[9px] font-black uppercase text-black block border-b border-black pb-1">
                      {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'SUPPLIER / AUTHORIZED BY:' : 'CUSTOMER RECEIVED BY:'}
                    </span>
                    <div className="font-extrabold text-[10px] text-black uppercase pt-0.5">
                      {activeDO.attentionTo || '—'}
                    </div>
                    <div className="border-b border-dashed border-black pt-5"></div>
                    <div className="text-[8px] font-bold text-black uppercase text-left pt-0.5">
                      {(activeDO.type === 'grn' || activeDO.type === 'coating_grn' || (activeDO.documentTitle || '').toUpperCase().includes('RECEIVED NOTE')) ? 'SUPPLIER SIGNATURE / STAMP' : 'CUSTOMER SIGNATURE / STAMP'}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Suggestions Datalist */}
      <datalist id="gdn-customer-datalist">
        {customerSuggestions.map((cust, i) => (
          <option key={i} value={cust.name}>
            {cust.address ? `${cust.name} (${cust.address})` : cust.name}
          </option>
        ))}
      </datalist>

      </div>
    </div>
  );
};
