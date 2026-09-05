import React, { useState, useEffect, useMemo, useRef } from 'react';
import { printHtml } from './PrintHelper';
import { 
  FileText, Search, Plus, Trash2, Edit2, Save, X, ExternalLink, 
  Filter, Sparkles, FolderPlus, HelpCircle, CheckCircle2, AlertTriangle, 
  TrendingUp, RefreshCw, ChevronRight, ChevronLeft, Clipboard, Eye,
  Clock, Truck, Package, Ban, ShieldAlert
} from 'lucide-react';
import { AppUser } from '../types';
import { getActiveCompany } from '../utils/companyProfile';

interface WorkflowViewProps {
  currentUser: AppUser | null;
  onNavigate?: (tab: 'home' | 'about' | 'products' | 'technical' | 'workflow' | 'erp') => void;
}

interface WorkflowItem {
  id: string; // Used internally as unique key
  workOrderNo: string;
  workOrderDate: string;
  orderStatus: string;
  priority: 'High' | 'Medium' | 'Low';
  poNumber: string;
  invoiceNo: string; // New invoice number field
  customerName: string;
  sellerAccounts: string;
  workOrderCreatedBy: string;
  workOrderDoc: string; // drive link
  packingListDoc: string; // drive link
  materialInspectionReportDoc: string; // drive link
  mtcDoc: string; // drive link
  consigneeNotesDoc: string; // drive link
  otherDoc: string; // drive link
  deliveryDate: string; // New field as requested
  transporterDetails: string; // Transporter details column
}

const ALL_ORDER_STATUSES = [
  "Work Order Received",
  "Stock Inventory",
  "Stock item repairing",
  "PR Issue",
  "OP Receiving & Inspection",
  "Production Item Receiving",
  "Coating/Galvanizing",
  "Final Inspection",
  "Assembly",
  "Packing",
  "Ready to Dispatch",
  "Dispatch",
  "Order On Hold"
];

const pendingStatuses = [
  "Work Order Received",
  "Stock Inventory",
  "Stock item repairing",
  "PR Issue",
  "OP Receiving & Inspection",
  "Production Item Receiving",
  "Coating/Galvanizing",
  "Final Inspection",
  "Assembly",
  "Packing"
];

// Determine the grouped category for any statistical item matching rules in photo
const getStatusCategory = (status: string): 'Pending' | 'ReadyToDispatch' | 'Delivered' | 'Hold' => {
  if (status === "Ready to Dispatch") {
    return 'ReadyToDispatch';
  }
  if (status === "Dispatch") {
    return 'Delivered'; // Dispatch means delivery
  }
  if (status === "Order On Hold") {
    return 'Hold';
  }
  return 'Pending'; // Till work order to packing it should be considered as Pending order
};

// Map older long-form names to requested short abbreviations (FSL, FHM, ASF)
const formatSellerAccount = (name: string): string => {
  if (!name) return '—';
  const trimmed = name.trim();
  if (trimmed === 'Marine Fasteners FZE') return 'FSL';
  if (trimmed === 'MFI Ajman Main Office') return 'FHM';
  if (trimmed === 'MFI Industrial Sales Team') return 'ASF';
  return trimmed;
};

const generateInitialWorkflows = (): WorkflowItem[] => {
  return [];
};

export default function WorkflowView({ currentUser, onNavigate }: WorkflowViewProps) {
  const isAdmin = currentUser !== null && currentUser.role === 'Admin';
  const isEditor = currentUser !== null && currentUser.role === 'Editor';
  const canEdit = isAdmin || isEditor;

  const [activeCompany, setActiveCompany] = useState(() => getActiveCompany());

  useEffect(() => {
    const handleSync = () => setActiveCompany(getActiveCompany());
    window.addEventListener('active_company_changed', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    return () => {
      window.removeEventListener('active_company_changed', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
    };
  }, []);

  // State
  const [items, setItems] = useState<WorkflowItem[]>(() => {
    const saved = localStorage.getItem('MF_WORKFLOW_REF_ITEMS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local workflows ref", e);
      }
    }
    return generateInitialWorkflows();
  });

  // Requisition / Store Requests sent to office state
  const [storeRequests, setStoreRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('MF_STORE_PURCHASE_REQUESTS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'REQ-2026-601',
        sourceWoNo: 'WO-26-102',
        customerName: 'Hamriyah Shipbuilders',
        requestedDate: '2026-05-18',
        itemDescription: 'HEAVY HEX BOLTS SS316 3/4" X 5" GRADED',
        qty: 1200,
        unit: 'Pcs.',
        priority: 'High',
        requestedBy: 'Supervisor Desk',
        status: 'PO Created',
        officePoNo: 'PO-2026-081',
        notes: 'Required due to custom thread requirement shortfall'
      },
      {
        id: 'REQ-2026-602',
        sourceWoNo: 'WO-26-103',
        customerName: 'Abu Dhabi Piping Ltd',
        requestedDate: '2026-05-27',
        itemDescription: 'SPRING WASHERS DIN 127B A4 M16',
        qty: 8000,
        unit: 'Pcs.',
        priority: 'Medium',
        requestedBy: 'Store Floor Lead',
        status: 'Pending',
        notes: 'Low inventory alert on packing lines'
      }
    ];
  });

  // Modal and form states for submitting PR to Office
  const [selectedWoForPr, setSelectedWoForPr] = useState<WorkflowItem | null>(null);
  const [prItemDesc, setPrItemDesc] = useState('');
  const [prItemQty, setPrItemQty] = useState(500);
  const [prItemUnit, setPrItemUnit] = useState('Pcs.');
  const [prItemNotes, setPrItemNotes] = useState('');

  // Save requests
  useEffect(() => {
    localStorage.setItem('MF_STORE_PURCHASE_REQUESTS', JSON.stringify(storeRequests));
  }, [storeRequests]);

  const handleOpenPRModal = (item: WorkflowItem) => {
    setSelectedWoForPr(item);
    setPrItemDesc(`STAINLESS STEEL COMPONENTS SPECIFICATION FOR ${item.customerName.toUpperCase()}`);
    setPrItemQty(1000);
    setPrItemUnit('Pcs.');
    setPrItemNotes(`Required for Work Order ${item.workOrderNo} which was flagged with shortage (PR Issue).`);
  };

  const handleClosePRModal = () => {
    setSelectedWoForPr(null);
  };

  const handleSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWoForPr) return;

    const freshPr = {
      id: 'REQ-26-' + Math.floor(Math.random() * 9000 + 1000),
      sourceWoNo: selectedWoForPr.workOrderNo,
      customerName: selectedWoForPr.customerName,
      requestedDate: new Date().toISOString().substring(0, 10),
      itemDescription: prItemDesc,
      qty: prItemQty,
      unit: prItemUnit,
      priority: selectedWoForPr.priority,
      requestedBy: currentUser ? `${currentUser.firstName} ${currentUser.secondName}` : 'Supervisor Desk',
      status: 'Pending',
      notes: prItemNotes
    };

    setStoreRequests(prev => [freshPr, ...prev]);
    setSelectedWoForPr(null);
    alert(`Success! Purchase request ${freshPr.id} has been transmitted to Accounts and Purchase Office. View it in ERP Hub under Purchase POs list.`);
  };

  // Filters
  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Pending' | 'ReadyToDispatch' | 'Delivered' | 'Hold' | 'PackingList'>(() => {
    const saved = localStorage.getItem('mf_workflow_active_tab');
    if (saved) {
      localStorage.removeItem('mf_workflow_active_tab');
      if (['All', 'Pending', 'ReadyToDispatch', 'Delivered', 'Hold', 'PackingList'].includes(saved)) {
        return saved as any;
      }
    }
    return 'All';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  // Extract unique years from current workflow items
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    items.forEach(item => {
      if (item.workOrderDate && item.workOrderDate.length >= 4) {
        yearsSet.add(item.workOrderDate.substring(0, 4));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [items]);

  // Extract unique months from current workflow items
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    items.forEach(item => {
      if (item.workOrderDate && item.workOrderDate.length >= 7) {
        const yMonth = item.workOrderDate.substring(0, 7);
        // If a specific year is selected, only show months that belong to that year
        if (selectedYear === 'All' || yMonth.startsWith(selectedYear)) {
          monthsSet.add(yMonth);
        }
      }
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [items, selectedYear]);

  // Reset selected month if selected year changes and the month does not belong to that year
  useEffect(() => {
    if (selectedYear !== 'All' && selectedMonth !== 'All') {
      if (!selectedMonth.startsWith(selectedYear)) {
        setSelectedMonth('All');
      }
    }
  }, [selectedYear]);

  // Helper to format months to readable labels (e.g., "2026-05" -> "MAY 2026")
  const formatMonthLabel = (yearMonthStr: string) => {
    const parts = yearMonthStr.split('-');
    if (parts.length < 2) return yearMonthStr;
    const year = parts[0];
    const month = parts[1];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const idx = parseInt(month, 10) - 1;
    return `${months[idx] || month} ${year}`;
  };

  // Pagination State - keep 8 per page, rest are scrolling via pages
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Reset page index click to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTabFilter, searchQuery, selectedYear, selectedMonth]);

  // Editing Row Row State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkflowItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Adding Row Panel State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState<Partial<WorkflowItem>>({
    workOrderNo: '',
    workOrderDate: new Date().toISOString().substring(0, 10),
    orderStatus: 'Work Order Received',
    priority: 'Medium',
    poNumber: '',
    invoiceNo: '',
    customerName: '',
    sellerAccounts: 'FSL',
    workOrderCreatedBy: currentUser ? `${currentUser.firstName} ${currentUser.secondName}` : 'Supervisor Desk',
    workOrderDoc: '',
    packingListDoc: '',
    materialInspectionReportDoc: '',
    mtcDoc: '',
    consigneeNotesDoc: '',
    otherDoc: '',
    deliveryDate: '',
    transporterDetails: ''
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(items));
  }, [items]);

  // Derive Counts dynamically based on current state items list
  const stateSummary = useMemo(() => {
    let pending = 0;
    let ready = 0;
    let delivered = 0;
    let hold = 0;

    items.forEach(item => {
      const cat = getStatusCategory(item.orderStatus);
      if (cat === 'Pending') pending++;
      else if (cat === 'ReadyToDispatch') ready++;
      else if (cat === 'Delivered') delivered++;
      else if (cat === 'Hold') hold++;
    });

    return { pending, ready, delivered, hold };
  }, [items]);

  // Filter and Search items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Tab filter
      if (activeTabFilter !== 'All') {
        if (activeTabFilter === 'PackingList') {
          // Show all items in PackingList tab to allow full PDF document coverage and editing
        } else {
          const cat = getStatusCategory(item.orderStatus);
          if (cat !== activeTabFilter) return false;
        }
      }

      // Year filter
      if (selectedYear !== 'All') {
        if (!item.workOrderDate || !item.workOrderDate.startsWith(selectedYear)) {
          return false;
        }
      }

      // Month filter
      if (selectedMonth !== 'All') {
        if (!item.workOrderDate || !item.workOrderDate.startsWith(selectedMonth)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.workOrderNo.toLowerCase().includes(q) ||
          item.poNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.sellerAccounts.toLowerCase().includes(q) ||
          item.workOrderCreatedBy.toLowerCase().includes(q) ||
          item.orderStatus.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, activeTabFilter, searchQuery, selectedYear, selectedMonth]);

  // Paginated items (keep 12 working order rest are scrolling/paginated)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  }, [filteredItems]);

  const rangeStart = useMemo(() => {
    return filteredItems.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  }, [filteredItems, currentPage]);

  const rangeEnd = useMemo(() => {
    return Math.min(filteredItems.length, currentPage * ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Inline Handlers
  const handleStartEdit = (item: WorkflowItem) => {
    if (!canEdit) return;
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = (id: string) => {
    if (!canEdit) return;
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...editForm
        } as WorkflowItem;
      }
      return item;
    }));
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteItem = (id: string) => {
    if (!isAdmin) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Create Row
  const handleCreateRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert("Only authorized supervisors/editors can register logs");
      return;
    }

    if (!newForm.workOrderNo?.trim()) {
      alert("Please specify a Work Order No");
      return;
    }

    const uniqueId = `WO-GEN-${Date.now()}`;
    const entry: WorkflowItem = {
      id: uniqueId,
      workOrderNo: newForm.workOrderNo.trim().toUpperCase(),
      workOrderDate: newForm.workOrderDate || new Date().toISOString().substring(0, 10),
      orderStatus: newForm.orderStatus || 'Work Order Received',
      priority: (newForm.priority || 'Medium') as 'High' | 'Medium' | 'Low',
      poNumber: (newForm.poNumber || 'N/A').trim().toUpperCase(),
      invoiceNo: (newForm.invoiceNo || '').trim().toUpperCase(),
      customerName: (newForm.customerName || 'Direct Cash Customer').trim(),
      sellerAccounts: (newForm.sellerAccounts || 'FSL').trim(),
      workOrderCreatedBy: (newForm.workOrderCreatedBy || 'Admin Desk').trim(),
      workOrderDoc: (newForm.workOrderDoc || '').trim(),
      packingListDoc: (newForm.packingListDoc || '').trim(),
      materialInspectionReportDoc: (newForm.materialInspectionReportDoc || '').trim(),
      mtcDoc: (newForm.mtcDoc || '').trim(),
      consigneeNotesDoc: (newForm.consigneeNotesDoc || '').trim(),
      otherDoc: (newForm.otherDoc || '').trim(),
      deliveryDate: (newForm.deliveryDate || '').trim() || '—',
      transporterDetails: (newForm.transporterDetails || '').trim() || '—'
    };

    setItems(prev => [entry, ...prev]);
    setShowAddForm(false);
    
    // Reset form for next insert
    setNewForm({
      workOrderNo: '',
      workOrderDate: new Date().toISOString().substring(0, 10),
      orderStatus: 'Work Order Received',
      priority: 'Medium',
      poNumber: '',
      invoiceNo: '',
      customerName: '',
      sellerAccounts: 'FSL',
      workOrderCreatedBy: currentUser ? `${currentUser.firstName} ${currentUser.secondName}` : 'Supervisor Desk',
      workOrderDoc: '',
      packingListDoc: '',
      materialInspectionReportDoc: '',
      mtcDoc: '',
      consigneeNotesDoc: '',
      otherDoc: '',
      deliveryDate: '',
      transporterDetails: ''
    });
  };

  // Reset entire workflow dataset to clean simulated state
  const handleResetData = () => {
    if (window.confirm("Restore entire work order list back to original high-fidelity UAE dataset? (11 Pending, 41 Ready, 45 Delivered, 3 Hold)")) {
      const original = generateInitialWorkflows();
      setItems(original);
      localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(original));
    }
  };

  const handleSaveAsPDF = (overrideFilter?: 'Pending' | 'ReadyToDispatch' | 'Hold' | 'Delivered' | 'PackingList' | 'All') => {
    const targetFilter = overrideFilter || activeTabFilter;
    const todayStr = new Date().toISOString().split('T')[0];
    const isPackingList = targetFilter === 'PackingList';
    const headers = isPackingList
      ? [
          'Work Order No', 'Work Order Date', 'Order Status', 'PO Number',
          'Invoice No', 'Customer Name', 'Del. Date', 'Packing List Link'
        ]
      : [
          'Work Order No', 'Work Order Date', 'Order Status', 'Priority', 'PO Number',
          'Invoice No', 'Customer Name', 'Seller', 'Del. Date', 'Transporter', 'Created By'
        ];

    // Filter strictly by targetFilter
    const itemsToPrint = items.filter(item => {
      if (targetFilter !== 'All' && targetFilter !== 'PackingList') {
        const cat = getStatusCategory(item.orderStatus);
        if (cat !== targetFilter) return false;
      }
      // Year filter
      if (selectedYear !== 'All') {
        if (!item.workOrderDate || !item.workOrderDate.startsWith(selectedYear)) {
          return false;
        }
      }
      // Month filter
      if (selectedMonth !== 'All') {
        if (!item.workOrderDate || !item.workOrderDate.startsWith(selectedMonth)) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.workOrderNo.toLowerCase().includes(q) ||
          item.poNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.orderStatus.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const rowsHtml = itemsToPrint.map(item => {
      if (isPackingList) {
        return `
          <tr style="border-bottom: 1.5px solid #000000; font-size: 10px;">
            <td style="padding: 6px; font-weight: bold; font-family: monospace;">${item.workOrderNo}</td>
            <td style="padding: 6px; font-family: monospace; text-align: center;">${item.workOrderDate || '—'}</td>
            <td style="padding: 6px; text-align: center;"><span style="padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1; background-color: #f1f5f9; color: #334155;">${item.orderStatus}</span></td>
            <td style="padding: 6px; font-family: monospace;">${item.poNumber || '—'}</td>
            <td style="padding: 6px; font-family: monospace; font-weight: bold; color: #0d9488;">${item.invoiceNo || '—'}</td>
            <td style="padding: 6px;">${item.customerName}</td>
            <td style="padding: 6px; text-align: center;">${item.deliveryDate || '—'}</td>
            <td style="padding: 6px; font-family: monospace; font-size: 8px; color: #0284c7; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${item.packingListDoc ? `<a href="${item.packingListDoc}" target="_blank" style="color: #0284c7; text-decoration: underline;">${item.packingListDoc}</a>` : '—'}
            </td>
          </tr>
        `;
      }
      return `
        <tr style="border-bottom: 1px solid #000000; font-size: 10px;">
          <td style="padding: 6px; font-weight: bold; font-family: monospace;">${item.workOrderNo}</td>
          <td style="padding: 6px; font-family: monospace; text-align: center;">${item.workOrderDate || '—'}</td>
          <td style="padding: 6px; text-align: center;"><span style="padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1; background-color: ${item.orderStatus === 'Delivered' ? '#dcfce7' : item.orderStatus === 'Ready to Dispatch' ? '#ffedd5' : item.orderStatus === 'Order on Hold' ? '#fee2e2' : '#fef3c7'}; color: ${item.orderStatus === 'Delivered' ? '#166534' : item.orderStatus === 'Ready to Dispatch' ? '#c2410c' : item.orderStatus === 'Order on Hold' ? '#991b1b' : '#854d0e'}">${item.orderStatus}</span></td>
          <td style="padding: 6px; text-align: center;"><span style="padding: 2px 6px; border-radius: 3px; font-size: 8px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1; background-color: ${item.priority === 'High' ? '#fecaca' : item.priority === 'Medium' ? '#fef3c7' : '#dcfce7'}; color: ${item.priority === 'High' ? '#991b1b' : item.priority === 'Medium' ? '#92400e' : '#166534'}">${item.priority}</span></td>
          <td style="padding: 6px; font-family: monospace;">${item.poNumber || '—'}</td>
          <td style="padding: 6px; font-family: monospace; font-weight: bold; color: #0d9488;">${item.invoiceNo || '—'}</td>
          <td style="padding: 6px;">${item.customerName}</td>
          <td style="padding: 6px; text-align: center; font-weight: bold;">${item.sellerAccounts}</td>
          <td style="padding: 6px; text-align: center;">${item.deliveryDate || '—'}</td>
          <td style="padding: 6px;">${item.transporterDetails || '—'}</td>
          <td style="padding: 6px; color: #475569;">${item.workOrderCreatedBy}</td>
        </tr>
      `;
    }).join('');

    const statusLabel = targetFilter === 'Pending' ? 'ORDER PENDING' : 
                        targetFilter === 'ReadyToDispatch' ? 'READY TO DISPATCH' : 
                        targetFilter === 'Hold' ? 'ORDER ON HOLD' : 
                        targetFilter === 'Delivered' ? 'DELIVERED' : 
                        targetFilter === 'PackingList' ? 'PACKING LIST' : 'ALL WORK ORDERS';

    const htmlContent = `
      <html>
        <head>
          <title>${statusLabel} Registry Report - Marine Fasteners Industries LLC</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px; color: #333; }
            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f37021; padding-bottom: 15px; margin-bottom: 20px; }
            .company { font-size: 24px; font-weight: 900; color: #1e293b; text-transform: uppercase; }
            .company span { color: #f37021; }
            .meta { text-align: right; font-size: 11px; color: #555; line-height: 1.4; }
            .title-section { margin-bottom: 20px; }
            .title-section h1 { margin: 0; font-size: 18px; color: #f37021; text-transform: uppercase; letter-spacing: 0.5px; }
            .title-section p { margin: 5px 0 0; font-size: 11px; color: #666; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
            th { background-color: #1e293b; color: white; border: 1px solid #1e293b; padding: 8px; font-weight: bold; text-align: left; text-transform: uppercase; }
            td { border: 1px solid #e2e8f0; padding: 6px; }
            .summary-box { margin-top: 20px; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 11px; font-weight: bold; }
            .summary-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
            .summary-val { font-size: 16px; font-family: monospace; color: #1e293b; margin-top: 4px; }
            .footer { margin-top: 55px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <div class="company">Marine Fasteners Industries <span>LLC</span></div>
              <div style="font-size: 10px; color: #64748b;">Industrial Area, Ajman, UAE | sales@marinefasteners.co</div>
            </div>
            <div class="meta">
              <div><strong>REPORT DATE:</strong> ${todayStr}</div>
              <div><strong>TELEPHONE:</strong> +971 6 525 0526</div>
              <div><strong>STATUS:</strong> OFFICIAL REGISTRY LOG</div>
            </div>
          </div>

          <div class="title-section">
            <h1>${statusLabel} Registry Report</h1>
            <p>FILTER PARAMETERS: STATUS=[${statusLabel}] | SEARCH QUERY=[${searchQuery ? searchQuery.toUpperCase() : 'NONE'}] | TOTAL ROWS=[${itemsToPrint.length}]</p>
          </div>

          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="11" style="text-align: center; padding: 15px; color: #64748b;">No matching work order records found.</td></tr>'}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-item">
              <span style="color: #b45309;">PENDING WORK ORDERS</span>
              <span class="summary-val">${stateSummary.pending}</span>
            </div>
            <div class="summary-item">
              <span style="color: #ea580c;">READY FOR DISPATCH</span>
              <span class="summary-val">${stateSummary.ready}</span>
            </div>
            <div class="summary-item">
              <span style="color: #059669;">DELIVERED ORDERS</span>
              <span class="summary-val">${stateSummary.delivered}</span>
            </div>
            <div class="summary-item">
              <span style="color: #dc2626;">PAUSE / HOLD</span>
              <span class="summary-val">${stateSummary.hold}</span>
            </div>
          </div>

          <div class="footer">
            <div>© ${new Date().getFullYear()} ${activeCompany.name}. UAE Direct Archive Integrity Verified.</div>
            <div><span class="page-number-display">Page 1 of 1</span></div>
          </div>
        </body>
      </html>
    `;
    printHtml(htmlContent, `${statusLabel} Registry Report - ${activeCompany.name}`);
  };

  return (
    <div className="space-y-6">

      {/* PHOTO-STYLE ACTIVITY SUMMARY DASHBOARD */}
      <div className="hidden lg:block space-y-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-[11px] font-bold uppercase text-slate-850 tracking-wider">
            ACTIVITY SUMMARY
          </h3>
          <button
            type="button"
            onClick={handleSaveAsPDF}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-slate-200 hover:border-slate-300 text-rose-700 rounded-md font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer select-none"
            title="Generate and Download PDF Report / Print Registry"
          >
            <span className="w-5 h-3.5 bg-rose-600 text-white rounded-[2px] text-[7px] font-bold flex items-center justify-center leading-none">PDF</span>
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PRINT REPORT</span>
          </button>
        </div>
        
        {/* Responsive grid matching Dashboard card redesign */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* 1. Pending Order */}
          <button
            type="button"
            onClick={() => setActiveTabFilter('Pending')}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs relative overflow-hidden cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-amber-500 text-left ${
              activeTabFilter === 'Pending' ? 'ring-2 ring-amber-500/50 bg-amber-50/20' : ''
            }`}
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Pending order</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {stateSummary.pending}
            </div>
          </button>
 
          {/* 2. Ready to Dispatch */}
          <button
            type="button"
            onClick={() => setActiveTabFilter('ReadyToDispatch')}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs relative overflow-hidden cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-blue-600 text-left ${
              activeTabFilter === 'ReadyToDispatch' ? 'ring-2 ring-blue-600/50 bg-blue-50/20' : ''
            }`}
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Ready to dispatch</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>
            <div className="text-2xl font-black text-blue-600 font-mono mt-1">
              {stateSummary.ready}
            </div>
          </button>
 
          {/* 3. Delivered */}
          <button
            type="button"
            onClick={() => setActiveTabFilter('Delivered')}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs relative overflow-hidden cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-emerald-600 text-left ${
              activeTabFilter === 'Delivered' ? 'ring-2 ring-emerald-600/50 bg-emerald-50/20' : ''
            }`}
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Delivered</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {stateSummary.delivered}
            </div>
          </button>
 
          {/* 4. Order on Hold */}
          <button
            type="button"
            onClick={() => setActiveTabFilter('Hold')}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs relative overflow-hidden cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-rose-500 text-left ${
              activeTabFilter === 'Hold' ? 'ring-2 ring-rose-500/50 bg-rose-50/20' : ''
            }`}
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Order on hold</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-2xl font-black text-rose-500 font-mono mt-1">
              {stateSummary.hold}
            </div>
          </button>

          {/* 5. All Orders */}
          <button
            type="button"
            onClick={() => setActiveTabFilter('All')}
            className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs relative overflow-hidden cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-slate-700 text-left ${
              activeTabFilter === 'All' ? 'ring-2 ring-slate-700/50 bg-slate-50/20' : ''
            }`}
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>All orders</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono mt-1">
              {stateSummary.total}
            </div>
          </button>

        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div className="hidden lg:flex bg-slate-50 p-3 border border-slate-200 rounded-lg flex-col gap-3 shadow-xs">
        
        {/* Row 1: Quick Status Filter & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5">
          {/* "add filter" button group matching client request */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono mr-1">
              QUICK STATUS FILTER:
            </span>
            
            {/* ALL FILTERS BAR WITH PILL BADGES */}
            <button
              onClick={() => setActiveTabFilter('All')}
              className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'All'
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTabFilter === 'All' ? 'bg-white' : 'bg-slate-400'}`}></span>
              ALL RECORDS ({items.length})
            </button>

            <button
              onClick={() => setActiveTabFilter('Pending')}
              className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'Pending'
                  ? 'bg-amber-100 text-amber-900 border-amber-400 font-semibold shadow-xs'
                  : 'bg-white hover:bg-amber-50/50 text-slate-600 border-slate-200 hover:border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              PENDING ({stateSummary.pending})
            </button>

            <button
              onClick={() => setActiveTabFilter('ReadyToDispatch')}
              className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'ReadyToDispatch'
                  ? 'bg-orange-100 text-orange-900 border-orange-400 font-semibold shadow-xs'
                  : 'bg-white hover:bg-orange-50/50 text-slate-600 border-slate-200 hover:border-orange-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
              READY ({stateSummary.ready})
            </button>

            <button
              onClick={() => setActiveTabFilter('Delivered')}
              className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold shadow-xs'
                  : 'bg-white hover:bg-emerald-50/50 text-slate-600 border-slate-200 hover:border-emerald-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              DELIVERED ({stateSummary.delivered})
            </button>

            <button
              onClick={() => setActiveTabFilter('Hold')}
              className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'Hold'
                  ? 'bg-rose-100 text-rose-900 border-rose-450 font-semibold shadow-xs'
                  : 'bg-white hover:bg-rose-50/50 text-slate-600 border-slate-200 hover:border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              HOLD ({stateSummary.hold})
            </button>

            <button
              onClick={() => setActiveTabFilter('PackingList')}
              className={`px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'PackingList'
                  ? 'bg-amber-100 text-amber-900 border-amber-400 font-semibold shadow-xs'
                  : 'bg-white hover:bg-amber-50/50 text-slate-600 border-slate-200 hover:border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              PACKING LIST ({items.filter(i => !!i.packingListDoc).length})
            </button>
          </div>

          {/* Global search textbox - Slimmer & Pill Style */}
          <div className="relative w-full lg:w-60 font-mono">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Search className="w-3 h-3" />
            </span>
            <input
              type="text"
              placeholder="SEARCH ANY ORDER LOG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[9px] pl-7.5 pr-2 py-1 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-full uppercase font-bold focus:outline-none focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] transition-all"
            />
          </div>
        </div>

        {/* Separator line */}
        <div className="h-px bg-slate-200 my-0.5"></div>

        {/* Row 2: Yearly & Monthly Calendar filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Yearly Filter buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest mr-1">
                YEAR:
              </span>
              <button
                onClick={() => setSelectedYear('All')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded border cursor-pointer select-none transition-all ${
                  selectedYear === 'All'
                    ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                ALL YEARS
              </button>
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded border cursor-pointer select-none transition-all ${
                    selectedYear === year
                      ? 'bg-brand-orange text-white border-brand-orange font-semibold shadow-2xs'
                      : 'bg-white hover:bg-orange-50/20 text-slate-600 border-slate-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Vertical separator */}
            <div className="hidden md:block w-px h-3.5 bg-slate-200"></div>

            {/* Monthly Filter buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest mr-1">
                MONTH:
              </span>
              <button
                onClick={() => setSelectedMonth('All')}
                className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded border cursor-pointer select-none transition-all ${
                  selectedMonth === 'All'
                    ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                ALL MONTHS
              </button>
              
              {/* Show subset of month buttons corresponding to selection to avoid overflow */}
              {availableMonths.slice(0, 12).map(month => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-tight rounded border cursor-pointer select-none transition-all ${
                    selectedMonth === month
                      ? 'bg-emerald-600 text-white border-emerald-650 font-semibold shadow-2xs'
                      : 'bg-white hover:bg-emerald-50/20 text-slate-600 border-slate-200'
                  }`}
                >
                  {formatMonthLabel(month)}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button alignment */}
          {(selectedYear !== 'All' || selectedMonth !== 'All') && (
            <button
              onClick={() => {
                setSelectedYear('All');
                setSelectedMonth('All');
              }}
              className="text-[8.5px] text-red-500 hover:text-red-700 font-bold tracking-wider uppercase border border-red-200 bg-red-50/20 hover:bg-red-50 px-2 py-0.5 rounded cursor-pointer transition-all self-start md:self-auto leading-none"
            >
              ✕ RESET DATE FILTER
            </button>
          )}

        </div>

      </div>

      {/* SYSTEM OPERATIONS BANNER: ADD NEW ROW DROPDOWN TICKET FORM */}
      {canEdit && (
        <div className="hidden lg:flex justify-start">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex items-center gap-1.5 text-[10px] transition-all uppercase font-bold tracking-wider border p-2 px-4 focus:outline-none select-none cursor-pointer ${
              showAddForm
                ? 'border-red-500 text-red-600 bg-red-50/10'
                : 'border-slate-800 text-slate-900 bg-white hover:border-[#f37021] hover:text-[#f37021] shadow-xs'
            }`}
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <span>CLOSE INPUT FORM</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4 text-[#f37021] shrink-0" />
                <span>+ ADD NEW WORK ORDER ROW</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* NEW ORDER ENTRY DROPDOWN FORM CONTAINER */}
      {canEdit && showAddForm && (
        <form onSubmit={handleCreateRow} className="hidden lg:block bg-slate-900 text-white p-5 border-l-4 border-brand-orange space-y-4 animate-fadeIn">
          <div className="mb-2">
            <h4 className="text-xs font-bold uppercase text-white tracking-widest">
              REGISTER NEW CO-WORKER TICKET LOG
            </h4>
            <p className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Define order criteria and drive pdf URLs below</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
            
            {/* 1. Work Order No */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Work Order No *</label>
              <input
                type="text"
                required
                value={newForm.workOrderNo}
                onChange={(e) => setNewForm({...newForm, workOrderNo: e.target.value})}
                placeholder="e.g. WO-26-P112"
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px] uppercase"
              />
            </div>

            {/* 2. Work Order Date */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Work Order Date *</label>
              <input
                type="date"
                required
                value={newForm.workOrderDate}
                onChange={(e) => setNewForm({...newForm, workOrderDate: e.target.value})}
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px]"
              />
            </div>

            {/* 3. Order Status */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Order Status *</label>
              <select
                value={newForm.orderStatus}
                onChange={(e) => setNewForm({...newForm, orderStatus: e.target.value})}
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px]"
              >
                {ALL_ORDER_STATUSES.map(stat => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>

            {/* 4. Priority */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Priority *</label>
              <select
                value={newForm.priority}
                onChange={(e) => setNewForm({...newForm, priority: e.target.value as any})}
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px]"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            
            {/* PO Number */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">PO Number</label>
              <input
                type="text"
                value={newForm.poNumber}
                onChange={(e) => setNewForm({...newForm, poNumber: e.target.value})}
                placeholder="PO-88192"
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px] uppercase"
              />
            </div>

            {/* Invoice No */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-teal-400 uppercase">Invoice No</label>
              <input
                type="text"
                value={newForm.invoiceNo || ''}
                onChange={(e) => setNewForm({...newForm, invoiceNo: e.target.value})}
                placeholder="INV-9928"
                className="w-full bg-slate-800 text-white p-2 border border-teal-800/80 focus:outline-[#f37021] text-[11px] uppercase"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Customer Name</label>
              <input
                type="text"
                value={newForm.customerName}
                onChange={(e) => setNewForm({...newForm, customerName: e.target.value})}
                placeholder="Falcon Metal Construction"
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px]"
              />
            </div>

            {/* Seller Accounts */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Seller Account Branch</label>
              <input
                type="text"
                value={newForm.sellerAccounts}
                onChange={(e) => setNewForm({...newForm, sellerAccounts: e.target.value})}
                placeholder="FSL, FHM, or ASF"
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px]"
              />
            </div>

            {/* Contact Creator */}
            <div className="space-y-1 font-mono">
              <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Work Order Created By</label>
              <input
                type="text"
                value={newForm.workOrderCreatedBy}
                onChange={(e) => setNewForm({...newForm, workOrderCreatedBy: e.target.value})}
                className="w-full bg-slate-800 text-white p-2 border border-slate-700 focus:outline-[#f37021] text-[11px]"
              />
            </div>

          </div>

          {/* GOOGLE DRIVE DOCUMENT LINKS */}
          <div className="border-t border-slate-800 pt-3">
            <span className="block text-[8px] font-bold tracking-widest text-[#f37021] uppercase mb-2">GOOGLE DRIVE COMPLIANCE SECURE BIN PDF LINKS & DELIVERY TIMELINE</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 gap-3.5 text-xs font-mono">
              
              <div className="space-y-1">
                <label className="block text-[8px] text-slate-400 uppercase">Work order Link</label>
                <input
                  type="url"
                  placeholder="https://drive..."
                  value={newForm.workOrderDoc}
                  onChange={(e) => setNewForm({...newForm, workOrderDoc: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-slate-400 uppercase">Packing List Link</label>
                <input
                  type="url"
                  placeholder="https://drive..."
                  value={newForm.packingListDoc}
                  onChange={(e) => setNewForm({...newForm, packingListDoc: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-slate-400 uppercase">Inspection Report</label>
                <input
                  type="url"
                  placeholder="https://drive..."
                  value={newForm.materialInspectionReportDoc}
                  onChange={(e) => setNewForm({...newForm, materialInspectionReportDoc: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-slate-400 uppercase">MTC Link</label>
                <input
                  type="url"
                  placeholder="https://drive..."
                  value={newForm.mtcDoc}
                  onChange={(e) => setNewForm({...newForm, mtcDoc: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-slate-400 uppercase">Consignee Notes</label>
                <input
                  type="url"
                  placeholder="https://drive..."
                  value={newForm.consigneeNotesDoc}
                  onChange={(e) => setNewForm({...newForm, consigneeNotesDoc: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-slate-400 uppercase">Other Doc.</label>
                <input
                  type="url"
                  placeholder="https://drive..."
                  value={newForm.otherDoc}
                  onChange={(e) => setNewForm({...newForm, otherDoc: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-amber-400 uppercase font-bold">Delivery Date</label>
                <input
                  type="date"
                  value={newForm.deliveryDate}
                  onChange={(e) => setNewForm({...newForm, deliveryDate: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] text-amber-400 uppercase font-bold">Transporter Details</label>
                <input
                  type="text"
                  placeholder="e.g. Emirates Logistics"
                  value={newForm.transporterDetails}
                  onChange={(e) => setNewForm({...newForm, transporterDetails: e.target.value})}
                  className="w-full bg-slate-800 text-white p-1.5 border border-slate-700 text-[10px]"
                />
              </div>

            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] uppercase font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-orange hover:bg-orange-600 text-white text-[10px] uppercase font-bold cursor-pointer border border-brand-orange"
            >
              🚀 CREATE WORK ORDER RECORD
            </button>
          </div>
        </form>
      )}

      {/* VERTICAL SCROLL ENHANCED WORKFLOW DATAGRID */}
      <div className="bg-white border border-slate-300">
        
        {/* Table View Wrapper with Vertical & Horizontal Scroll active and Pinned Columns - PC View Only */}
        <div className="hidden lg:block overflow-auto max-h-[540px] select-none [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-[#f37021]">
          
          <table className="w-full text-left border-collapse relative">
            
            {/* STICKY TABLE HEADER MATCHING GRAPHIC WIREFRAME SPECIFICATIONS */}
            <thead>
              <tr className="bg-white text-slate-900 font-mono text-[9px] font-bold uppercase tracking-wider sticky top-0 z-20 shadow-[0_2px_0_0_rgba(30,41,59,1)]">
                {/* 1. Sticky column header for Work Order No (Intersection of sticky top & left gets higher z-index) */}
                <th className="py-2.5 px-2.5 border-r-2 border-slate-300 border-b border-slate-200 text-slate-900 font-semibold w-[110px] min-w-[110px] sticky left-0 top-0 z-30 bg-slate-100 shadow-[2px_0_0_0_rgba(203,213,225,1)]">Work Order No</th>
                <th className="py-2.5 px-2.5 border-r border-b border-slate-200 w-[90px] min-w-[90px] bg-slate-50">Work Order Date</th>
                <th className="py-2.5 px-1.5 border-r border-b border-slate-200 text-brand-orange w-[140px] min-w-[140px] bg-slate-50">Order Status</th>
                <th className="py-2.5 px-1.5 border-r border-b border-slate-200 w-[80px] min-w-[80px] text-center bg-slate-50">Priority</th>
                <th className="py-2.5 px-2.5 border-r border-b border-slate-200 w-[120px] min-w-[120px] bg-slate-50">PO Number</th>
                <th className="py-2.5 px-2.5 border-r border-b border-slate-200 w-[110px] min-w-[110px] text-teal-800 font-semibold bg-slate-50 uppercase">Invoice No</th>
                <th className="py-2.5 px-2.5 border-r border-b border-slate-200 w-[180px] min-w-[180px] bg-slate-50">Customer Name</th>
                <th className="py-2.5 px-1.5 border-r border-b border-slate-200 w-[70px] min-w-[70px] text-slate-755 text-center bg-slate-50">Seller</th>
                <th className="py-2.5 px-2 border-r border-b border-slate-200 hover:bg-slate-100 transition-colors w-[150px] min-w-[150px] text-center text-slate-900 bg-slate-50">Drive Docs (6)</th>
                <th className="py-2.5 px-1.5 border-r border-b border-slate-200 text-amber-900 w-[80px] min-w-[80px] text-center bg-slate-50">Del. Date</th>
                <th className="py-2.5 px-1.5 border-r border-b border-slate-200 text-slate-800 w-[120px] min-w-[120px] text-center bg-slate-50">Transporter</th>
                <th className="py-2.5 px-1.5 border-b text-center w-[70px] bg-slate-50">Action</th>
              </tr>
            </thead>

            {/* TABLE BODY RECORDS RENDER */}
            <tbody className="divide-y divide-slate-200 font-mono text-[10.5px]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 bg-slate-50 text-slate-400 text-xs text-center uppercase font-bold tracking-widest font-sans">
                    No active workflow records in filter query
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const cat = getStatusCategory(item.orderStatus);
                  
                  // Priority color badge mapping
                  let priorityColorClass = "text-yellow-600 bg-yellow-50 border-yellow-200";
                  if (item.priority === "High") {
                    priorityColorClass = "text-red-650 bg-red-50 border-red-200 text-red-650";
                  } else if (item.priority === "Low") {
                    priorityColorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
                  }

                  // Order Status Group styling
                  let statusGroupBadgeClass = "bg-amber-100 text-amber-800 border-amber-350";
                  if (cat === "ReadyToDispatch") {
                    statusGroupBadgeClass = "bg-[#f37021]/10 text-brand-orange border-[#f37021]/30";
                  } else if (cat === "Delivered") {
                    statusGroupBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-350";
                  } else if (cat === "Hold") {
                    statusGroupBadgeClass = "bg-rose-100 text-rose-800 border-rose-350 animate-pulse";
                  }

                  return (
                    <tr 
                      key={item.id} 
                      className={`group hover:bg-slate-50/70 transition-colors duration-100 ${isEditing ? 'bg-orange-50/25' : ''}`}
                    >
                      {/* 1. Work Order No - Sticky column for mobile view sliding */}
                      <td className={`py-1 px-2.5 border-r-2 border-slate-300 font-semibold uppercase text-slate-900 leading-tight sticky left-0 z-10 shadow-[2px_0_0_0_rgba(203,213,225,1)] transition-colors duration-100 ${
                        isEditing ? 'bg-[#fffbeb]' : 'bg-white group-hover:bg-slate-50'
                      }`}>
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.workOrderNo || ''}
                              onChange={(e) => setEditForm({ ...editForm, workOrderNo: e.target.value })}
                              className="bg-white border border-slate-300 px-1 py-0.5 w-full text-[10px] font-bold"
                            />
                            <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-[7px] text-slate-400">Created By</span>
                              <input
                                type="text"
                                value={editForm.workOrderCreatedBy || ''}
                                onChange={(e) => setEditForm({...editForm, workOrderCreatedBy: e.target.value})}
                                className="bg-white border border-slate-200 px-1 py-0.5 w-full text-[8px] font-normal"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-slate-900">{item.workOrderNo}</span>
                            <span className="text-[7.5px] text-slate-400 font-normal leading-none mt-0.5 block truncate max-w-[100px]" title={item.workOrderCreatedBy}>
                              BY: {item.workOrderCreatedBy}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 2. Work Order Date */}
                      <td className="py-1 px-2.5 border-r border-slate-200 whitespace-nowrap text-[9.5px]">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.workOrderDate || ''}
                            onChange={(e) => setEditForm({...editForm, workOrderDate: e.target.value})}
                            className="bg-white border border-slate-300 p-0.5 text-[9px] w-full"
                          />
                        ) : (
                          item.workOrderDate
                        )}
                      </td>

                      {/* 3. Order Status Dropdown */}
                      <td className="py-1 px-1.5 border-r border-slate-200">
                        {isEditing ? (
                           <select
                             value={editForm.orderStatus}
                             onChange={(e) => setEditForm({...editForm, orderStatus: e.target.value})}
                             className="bg-white border border-slate-300 p-0.5 text-[9px] w-full block focus:ring-1 focus:ring-brand-orange animate-none"
                           >
                             {ALL_ORDER_STATUSES.map(op => (
                               <option key={op} value={op}>{op}</option>
                             ))}
                           </select>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800 leading-none block text-[9.5px]/[1.1] uppercase tracking-tight truncate max-w-[130px]" title={item.orderStatus}>{item.orderStatus}</span>
                            <span className={`inline-block self-start text-[6.5px] font-bold uppercase px-1 py-0.2 border rounded-xs ${statusGroupBadgeClass}`}>
                              {cat === 'Pending' ? 'PENDING' : cat === 'ReadyToDispatch' ? 'READY' : cat === 'Delivered' ? 'DELIV' : 'HOLD'}
                            </span>
                            {item.orderStatus === 'PR Issue' && (
                              <button
                                type="button"
                                onClick={() => handleOpenPRModal(item)}
                                className="mt-1.5 flex items-center justify-center gap-1.5 px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[8px] uppercase tracking-wider rounded-sm cursor-pointer transition-all border border-red-700 shadow-2xs hover:scale-[1.03] animate-pulse"
                                title="Add Purchase Request and Send to Ajman Office"
                              >
                                📥 ADD PURCHASE REQUEST
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 4. Priority */}
                      <td className="py-1 px-1.5 border-r border-slate-200 text-center">
                        {isEditing ? (
                          <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm({...editForm, priority: e.target.value as any})}
                            className="bg-white border border-slate-300 p-0.2 text-[8px] w-full text-center"
                          >
                            <option value="High">H</option>
                            <option value="Medium">M</option>
                            <option value="Low">L</option>
                          </select>
                        ) : (
                          <span className={`inline-block text-[7px] font-bold uppercase px-2 py-0.5 rounded-xs border ${priorityColorClass}`}>
                             {item.priority}
                          </span>
                        )}
                      </td>

                      {/* 5. PO Number */}
                      <td className="py-1 px-2.5 border-r border-slate-200 font-bold uppercase">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.poNumber || ''}
                            onChange={(e) => setEditForm({...editForm, poNumber: e.target.value})}
                            className="bg-white border border-slate-300 px-1 py-0.5 w-full text-[10px]"
                          />
                        ) : (
                          item.poNumber || 'N/A'
                        )}
                      </td>

                      {/* 5b. Invoice No */}
                      <td className="py-1 px-2.5 border-r border-slate-200 font-bold uppercase text-teal-850">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.invoiceNo || ''}
                            onChange={(e) => setEditForm({...editForm, invoiceNo: e.target.value})}
                            placeholder="INV-..."
                            className="bg-white border border-slate-300 px-1 py-0.5 w-full text-[10px]"
                          />
                        ) : (
                          item.invoiceNo || '—'
                        )}
                      </td>

                      {/* 6. Customer Name */}
                      <td className="py-1 px-2.5 border-r border-slate-200 max-w-[170px] truncate text-slate-800 text-[9.5px]" title={item.customerName}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.customerName || ''}
                            onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                            className="bg-white border border-slate-300 px-1 py-0.5 w-full text-[9px]"
                          />
                        ) : (
                          item.customerName
                        )}
                      </td>

                      {/* 7. Seller Accounts */}
                      <td className="py-1 px-1.5 border-r border-slate-200 text-[8.5px]/[1] text-slate-600 max-w-[65px] truncate font-bold uppercase text-center" title={formatSellerAccount(item.sellerAccounts)}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.sellerAccounts || ''}
                            onChange={(e) => setEditForm({...editForm, sellerAccounts: e.target.value})}
                            className="bg-white border border-slate-300 p-0.5 w-full text-[8.5px] text-center"
                          />
                        ) : (
                          formatSellerAccount(item.sellerAccounts)
                        )}
                      </td>

                      {/* 8. Drive Docs (Merged PDFs Column) */}
                      <td className="py-1 px-1.5 border-r border-slate-200 text-center">
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-1 p-0.5 min-w-[130px]">
                            <div className="flex flex-col text-left gap-0.5">
                              <span className="text-[7px] text-blue-500 font-bold uppercase">WO</span>
                              <input 
                                type="url" 
                                placeholder="WO Link" 
                                value={editForm.workOrderDoc || ''} 
                                onChange={(e) => setEditForm({...editForm, workOrderDoc: e.target.value})}
                                className="bg-white border border-slate-300 p-0.5 text-[8px] w-full"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-0.5">
                              <span className="text-[7px] text-indigo-500 font-bold uppercase">PL</span>
                              <input 
                                type="url" 
                                placeholder="PL Link" 
                                value={editForm.packingListDoc || ''} 
                                onChange={(e) => setEditForm({...editForm, packingListDoc: e.target.value})}
                                className="bg-white border border-slate-300 p-0.5 text-[8px] w-full"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-0.5">
                              <span className="text-[7px] text-amber-600 font-bold uppercase">IR</span>
                              <input 
                                type="url" 
                                placeholder="IR Link" 
                                value={editForm.materialInspectionReportDoc || ''} 
                                onChange={(e) => setEditForm({...editForm, materialInspectionReportDoc: e.target.value})}
                                className="bg-white border border-slate-300 p-0.5 text-[8px] w-full"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-0.5">
                              <span className="text-[7px] text-emerald-500 font-bold uppercase">MC</span>
                              <input 
                                type="url" 
                                placeholder="MTC Link" 
                                value={editForm.mtcDoc || ''} 
                                onChange={(e) => setEditForm({...editForm, mtcDoc: e.target.value})}
                                className="bg-white border border-slate-300 p-0.5 text-[8px] w-full"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-0.5">
                              <span className="text-[7px] text-purple-500 font-bold uppercase">CN</span>
                              <input 
                                type="url" 
                                placeholder="CN Link" 
                                value={editForm.consigneeNotesDoc || ''} 
                                onChange={(e) => setEditForm({...editForm, consigneeNotesDoc: e.target.value})}
                                className="bg-white border border-slate-300 p-0.5 text-[8px] w-full"
                              />
                            </div>
                            <div className="flex flex-col text-left gap-0.5">
                              <span className="text-[7px] text-slate-500 font-bold uppercase">OT</span>
                              <input 
                                type="url" 
                                placeholder="Other Link" 
                                value={editForm.otherDoc || ''} 
                                onChange={(e) => setEditForm({...editForm, otherDoc: e.target.value})}
                                className="bg-white border border-slate-300 p-0.5 text-[8px] w-full"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-1 max-w-[130px] mx-auto">
                            {/* WO */}
                            {item.workOrderDoc ? (
                              <a 
                                href={item.workOrderDoc} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Click to view Work Order PDF"
                                className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-250 cursor-pointer"
                              >
                                WO
                              </a>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs text-slate-300 border border-dashed border-slate-200" title="No Work Order Doc">
                                -
                              </span>
                            )}

                            {/* PL */}
                            {item.packingListDoc ? (
                              <a 
                                href={item.packingListDoc} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Click to view Packing List PDF"
                                className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-250 cursor-pointer"
                              >
                                PL
                              </a>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs text-slate-300 border border-dashed border-slate-200" title="No Packing List Doc">
                                -
                              </span>
                            )}

                            {/* IR */}
                            {item.materialInspectionReportDoc ? (
                              <a 
                                href={item.materialInspectionReportDoc} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Click to view Material Inspection Report"
                                className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-250 cursor-pointer"
                              >
                                IR
                              </a>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs text-slate-300 border border-dashed border-slate-200" title="No Inspection Report">
                                -
                              </span>
                            )}

                            {/* MTC */}
                            {item.mtcDoc ? (
                              <a 
                                href={item.mtcDoc} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Click to view Mill Test Certificate"
                                className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-250 cursor-pointer"
                              >
                                MC
                              </a>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs text-slate-300 border border-dashed border-slate-200" title="No MTC">
                                -
                              </span>
                            )}

                            {/* CN */}
                            {item.consigneeNotesDoc ? (
                              <a 
                                href={item.consigneeNotesDoc} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Click to view Consignee Delivery Notes"
                                className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-250 cursor-pointer"
                              >
                                CN
                              </a>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs text-slate-300 border border-dashed border-slate-200" title="No Consignee Notes">
                                -
                              </span>
                            )}

                            {/* Other */}
                            {item.otherDoc ? (
                              <a 
                                href={item.otherDoc} 
                                target="_blank" 
                                rel="noreferrer" 
                                title="Click to view Other Document"
                                className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-250 cursor-pointer"
                              >
                                OT
                              </a>
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-[7.5px] font-bold rounded-xs text-slate-300 border border-dashed border-slate-200" title="No Other Doc">
                                -
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 9. Delivery Date */}
                      <td className="py-1 px-1 border-r border-slate-200 text-center whitespace-nowrap text-[8.5px] text-amber-900 font-semibold">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.deliveryDate || ''}
                            onChange={(e) => setEditForm({...editForm, deliveryDate: e.target.value})}
                            className="bg-white border border-slate-300 p-0.5 text-[8.5px] w-full"
                          />
                        ) : (
                          item.deliveryDate || '—'
                        )}
                      </td>

                      {/* Transporter Details */}
                      <td className="py-1 px-2 border-r border-slate-200 text-left text-[9px] text-slate-705 font-semibold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.transporterDetails || ''}
                            onChange={(e) => setEditForm({...editForm, transporterDetails: e.target.value})}
                            className="bg-white border border-slate-300 p-0.5 text-[9px] w-full font-sans font-semibold text-slate-800"
                            placeholder="Transporter Name"
                          />
                        ) : (
                          item.transporterDetails || '—'
                        )}
                      </td>

                      {/* 10. Action Column */}
                      <td className="py-1 px-1.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-sm cursor-pointer"
                              title="Save record"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
                              title="Cancel changes"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center gap-1 bg-red-50 p-1 border border-red-200 rounded text-[9px] font-mono leading-none">
                                <span className="text-[7.5px] text-red-700 font-bold uppercase">SURE?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteItem(item.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-1 py-0.5 text-[8px] bg-red-600 hover:bg-red-700 text-white font-semibold rounded uppercase cursor-pointer"
                                  title="Confirm Delete"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1 py-0.5 text-[8px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded uppercase cursor-pointer"
                                  title="Cancel"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Edit Button (Authorized users only) */}
                                {canEdit ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm cursor-pointer transition-colors"
                                    title="Edit inline record details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[8px] font-semibold text-slate-400 uppercase font-mono tracking-tight block">Locked</span>
                                )}

                                {/* Delete Button (Admin only) */}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm cursor-pointer transition-colors"
                                    title="Delete/Archive Work Order Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>

        </div>

        {/* MOBILE & TABLET COMPACT CARD VIEW (Shown on <lg screen sizes) */}
        <div className="block lg:hidden select-none p-3.5 bg-slate-50 border-t border-slate-200">
          {true ? (
            (() => {
              const activeConfig = 
                activeTabFilter === 'Pending' ? {
                  title: "Order\nPending",
                  searchPlaceholder: "Search pending Work Orders...",
                  icon: <Clock className="w-6 h-6 stroke-[2.5]" />,
                  iconColorClass: "bg-amber-50 border-amber-500 text-amber-700",
                  docType: "wo" as const,
                  emptyText: "No pending orders found under filter query"
                } : activeTabFilter === 'ReadyToDispatch' ? {
                  title: "Ready to\nDispatch",
                  searchPlaceholder: "Search ready Work Orders...",
                  icon: <Package className="w-6 h-6 stroke-[2.5]" />,
                  iconColorClass: "bg-orange-50 border-[#f37021] text-[#f37021]",
                  docType: "wo" as const,
                  emptyText: "No ready orders found under filter query"
                } : activeTabFilter === 'Hold' ? {
                  title: "Order on\nHold",
                  searchPlaceholder: "Search held Work Orders...",
                  icon: <Ban className="w-6 h-6 stroke-[2.5]" />,
                  iconColorClass: "bg-rose-50 border-rose-500 text-rose-700",
                  docType: "wo" as const,
                  emptyText: "No held orders found under filter query"
                } : activeTabFilter === 'Delivered' ? {
                  title: "Delivered\nOrders",
                  searchPlaceholder: "Search delivered Work Orders...",
                  icon: <Truck className="w-6 h-6 stroke-[2.5]" />,
                  iconColorClass: "bg-emerald-50 border-emerald-500 text-emerald-700",
                  docType: "wo" as const,
                  emptyText: "No delivered orders found under filter query"
                } : activeTabFilter === 'PackingList' ? {
                  title: "Packing\nList",
                  searchPlaceholder: "Search packing lists...",
                  icon: <FileText className="w-6 h-6 stroke-[2.5]" />,
                  iconColorClass: "bg-amber-50 border-amber-500 text-amber-700",
                  docType: "pl" as const,
                  emptyText: "No packing lists found under filter query"
                } : { // All / default
                  title: "All Work\nOrders",
                  searchPlaceholder: "Search all Work Orders...",
                  icon: <Clipboard className="w-6 h-6 stroke-[2.5]" />,
                  iconColorClass: "bg-slate-50 border-slate-400 text-slate-700",
                  docType: "wo" as const,
                  emptyText: "No work orders found"
                };

              return (
                <div className="space-y-4 font-sans text-slate-900 select-none">
                  
                  {/* BRAND HEADER/LOGO PANEL */}
                  <div 
                    className="bg-slate-950 text-white rounded-xl p-4 text-center border-b-2 border-brand-orange shadow-sm"
                  >
                    <h2 className="text-[12px] font-bold tracking-tight uppercase">{activeCompany.name}</h2>
                    <p className="text-[7.5px] text-slate-300 font-bold uppercase mt-0.5 tracking-wider">
                      {activeCompany.subtitle || 'Manufacturer & Supplier of Fasteners, Fittings & Fixing Accessories'}
                    </p>
                  </div>

                  {/* MOBILE FILTERS SUITE: MONTH WISE, YEARLY WISE, AND STATUS FILTER */}
                  <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-3xs space-y-3 font-sans">
                    
                    {/* Status filter buttons */}
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none font-mono">
                        STATUS FILTER:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { id: 'All', label: 'ALL RECORDS', activeBg: 'bg-slate-900 border-slate-900 text-white font-bold', inactiveBg: 'bg-slate-50 border-slate-200 text-slate-700 font-bold' },
                          { id: 'Pending', label: 'ORDER PENDING', activeBg: 'bg-amber-100 border-amber-400 text-amber-950 font-bold', inactiveBg: 'bg-amber-50/20 border-slate-200 text-slate-700 font-bold' },
                          { id: 'ReadyToDispatch', label: 'READY TO DISPATCH', activeBg: 'bg-[#ffedd5] border-orange-400 text-[#7c2d12] font-bold', inactiveBg: 'bg-orange-50/20 border-slate-200 text-slate-700 font-bold' },
                          { id: 'Hold', label: 'ORDER ON HOLD', activeBg: 'bg-rose-100 border-rose-400 text-rose-950 font-bold', inactiveBg: 'bg-rose-50/20 border-slate-200 text-slate-700 font-bold' },
                          { id: 'Delivered', label: 'DELIVERED', activeBg: 'bg-emerald-100 border-emerald-450 text-emerald-950 font-bold', inactiveBg: 'bg-emerald-50/20 border-slate-200 text-slate-700 font-bold' },
                          { id: 'PackingList', label: 'PACKING LIST', activeBg: 'bg-amber-100 border-amber-455 text-amber-950 font-bold', inactiveBg: 'bg-amber-50/30 border-slate-200 text-slate-700 font-bold' }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => setActiveTabFilter(btn.id as any)}
                            className={`px-2 py-1 text-[7.5px] uppercase tracking-tight rounded border cursor-pointer select-none transition-all ${
                              activeTabFilter === btn.id ? btn.activeBg : btn.inactiveBg
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-slate-150"></div>

                    {/* Date filter buttons */}
                    <div className="space-y-2">
                      {/* Year Selection */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mr-1 leading-none font-mono">
                          YEAR:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedYear('All')}
                          className={`px-1.5 py-0.5 text-[7px] font-semibold uppercase rounded border cursor-pointer select-none transition-all ${
                            selectedYear === 'All'
                              ? 'bg-slate-800 text-white border-slate-900 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          ALL YEARS
                        </button>
                        {availableYears.map(year => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => setSelectedYear(year)}
                            className={`px-1.5 py-0.5 text-[7px] font-semibold uppercase rounded border cursor-pointer select-none transition-all ${
                              selectedYear === year
                                ? 'bg-brand-orange text-white border-brand-orange font-bold'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>

                      {/* Month Selection */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mr-1 leading-none font-mono">
                          MONTH:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedMonth('All')}
                          className={`px-1.5 py-0.5 text-[7px] font-semibold uppercase rounded border cursor-pointer select-none transition-all ${
                            selectedMonth === 'All'
                              ? 'bg-slate-800 text-white border-slate-900 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          ALL MONTHS
                        </button>
                        {availableMonths.slice(0, 12).map(month => (
                          <button
                            key={month}
                            type="button"
                            onClick={() => setSelectedMonth(month)}
                            className={`px-1.5 py-0.5 text-[7px] font-semibold uppercase rounded border cursor-pointer select-none transition-all ${
                              selectedMonth === month
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {formatMonthLabel(month)}
                          </button>
                        ))}
                      </div>

                      {/* Reset Date Filters */}
                      {(selectedYear !== 'All' || selectedMonth !== 'All') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedYear('All');
                            setSelectedMonth('All');
                          }}
                          className="w-full text-center text-[7.5px] text-red-600 font-bold tracking-wider uppercase border border-red-200 bg-red-50/30 py-1 rounded cursor-pointer transition-all"
                        >
                          ✕ RESET DATE FILTERS
                        </button>
                      )}

                    </div>

                  </div>

                  {/* ACTIVE STATUS TITLE AND SEARCH ROW */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-3xs">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                      {/* Status Indicator Icon & Stacked Title */}
                      <div 
                        className="flex items-center gap-2.5 select-none"
                      >
                        <div className={`p-2.5 rounded-full border shrink-0 animate-pulse ${activeConfig.iconColorClass}`}>
                          {activeConfig.icon}
                        </div>
                        <div className="font-semibold text-[12px] leading-tight text-slate-900 tracking-tight font-sans uppercase whitespace-pre-line">
                          {activeConfig.title}
                        </div>
                      </div>

                      {/* PDF Report button directly in the mobile header block for high discoverability on small phones */}
                      {['Pending', 'ReadyToDispatch', 'Hold', 'Delivered', 'PackingList'].includes(activeTabFilter) && (
                        <button
                          type="button"
                          onClick={() => handleSaveAsPDF()}
                          className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-250 text-rose-700 rounded-md font-mono text-[8px] font-bold uppercase tracking-wider transition-all shadow-3xs cursor-pointer select-none"
                          title="Generate and Download PDF Report"
                        >
                          <span className="w-4 h-3 bg-rose-600 text-white rounded-[2px] text-[6px] font-bold flex items-center justify-center leading-none">PDF</span>
                          <FileText className="w-3 h-3 text-rose-600" />
                          <span>REPORT</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Compact Magnifying-glass Search Box */}
                      <div className="relative flex-1 max-w-[170px] sm:max-w-[220px]">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={activeConfig.searchPlaceholder}
                          className="w-full text-[9px] font-bold bg-slate-50 border border-slate-200 rounded-lg pl-7.5 pr-2 py-1 focus:outline-none focus:bg-white focus:border-blue-400 hover:border-slate-300 text-slate-900"
                        />
                      </div>

                      {/* PDF Report button in the mobile search block on larger screens / tablets */}
                      {['Pending', 'ReadyToDispatch', 'Hold', 'Delivered', 'PackingList'].includes(activeTabFilter) && (
                        <button
                          type="button"
                          onClick={() => handleSaveAsPDF()}
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 border border-rose-250 text-rose-700 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider transition-all shadow-3xs cursor-pointer select-none"
                          title="Generate and Download PDF Report"
                        >
                          <span className="w-4 h-3 bg-rose-600 text-white rounded-[2px] text-[6px] font-bold flex items-center justify-center leading-none">PDF</span>
                          <FileText className="w-3.5 h-3.5 text-rose-600" />
                          <span>PDF REPORT</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 6 HORIZONTAL GRID COLUMN LABELS - SPECIFIED BY WIREFRAME */}
                  <div 
                    className="grid grid-cols-6 gap-0.5 sm:gap-1 font-sans"
                  >
                    <div className="border border-slate-350 bg-white p-1 text-[6.5px] sm:text-[7.5px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-[1.05] h-9 rounded shadow-3xs">
                      Work order No
                    </div>
                    <div className="border border-slate-350 bg-white p-1 text-[6.5px] sm:text-[7.5px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-[1.05] h-9 rounded shadow-3xs">
                      Work Order Date
                    </div>
                    <div className="border border-slate-350 bg-white p-1 text-[6.5px] sm:text-[7.5px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-[1.05] h-9 rounded shadow-3xs">
                      po number
                    </div>
                    <div className="border border-[#0d9488] bg-teal-50/25 p-1 text-[6.5px] sm:text-[7.5px] font-bold uppercase text-teal-850 flex items-center justify-center text-center leading-[1.05] h-9 rounded shadow-3xs">
                      Invoice No
                    </div>
                    <div className="border border-slate-350 bg-white p-1 text-[6.5px] sm:text-[7.5px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-[1.05] h-9 rounded shadow-3xs">
                      customer name
                    </div>
                    <div className="border border-slate-350 bg-white p-1 text-[6.5px] sm:text-[7.5px] font-bold uppercase text-slate-800 flex items-center justify-center text-center leading-[1.05] h-9 rounded shadow-3xs">
                      {activeTabFilter === 'Pending' ? 'order status' : 'drive doc'}
                    </div>
                  </div>

                  {/* ROWS CONTAINER */}
                  <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-3xs font-mono">
                    {filteredItems.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-[9px] uppercase font-bold tracking-widest font-mono">
                        {activeConfig.emptyText}
                      </div>
                    ) : (
                      filteredItems.map((item, idx) => {
                        return (
                          <div 
                            key={item.id || idx} 
                            className="grid grid-cols-6 gap-0.5 sm:gap-1 items-center p-1.5 text-center bg-white hover:bg-slate-50/60 transition-colors font-mono"
                          >
                            {/* 1. Work order No */}
                            <div className="text-[6.5px] sm:text-[7.5px] font-bold text-slate-900 bg-slate-100 rounded border border-slate-200 py-1 font-mono break-all leading-tight">
                              {item.workOrderNo}
                            </div>

                            {/* 2. Work Order Date */}
                            <div className="text-[6px] sm:text-[7px] font-mono text-slate-600 font-bold leading-tight break-words">
                              {item.workOrderDate || '—'}
                            </div>

                            {/* 3. po number */}
                            <div className="text-[6.5px] sm:text-[7.5px] font-bold font-mono text-slate-700 break-all leading-tight">
                              {item.poNumber || '—'}
                            </div>

                            {/* 4. invoice number */}
                            <div className="text-[6.5px] sm:text-[7.5px] font-semibold font-mono text-teal-700 bg-teal-50/40 rounded border border-teal-100 py-1 break-all leading-tight">
                              {item.invoiceNo || '—'}
                            </div>

                            {/* 5. customer name */}
                            <div className="text-[6px] sm:text-[7px] text-left text-slate-800 font-sans font-bold leading-normal truncate max-w-full block text-ellipsis capitalize px-0.5 font-sans">
                              {item.customerName || '—'}
                            </div>

                            {/* 6. drive doc or order status */}
                            <div className="flex justify-center items-center gap-0.5 px-0.5">
                              {activeTabFilter === 'Pending' ? (
                                <div className="text-[6px] sm:text-[6.5px] font-bold text-amber-700 bg-amber-50/70 border border-amber-250 py-1 rounded max-w-full truncate px-1 uppercase leading-none break-all" title={item.orderStatus}>
                                  {item.orderStatus || 'Pending'}
                                </div>
                              ) : activeConfig.docType === 'pl' ? (
                                item.packingListDoc ? (
                                  <a
                                    href={item.packingListDoc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 px-1 sm:px-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded text-[6.5px] sm:text-[7.5px] font-bold transition-all flex items-center gap-0.5 shadow-3xs cursor-pointer select-none"
                                    title="Packing List Google Drive Link"
                                  >
                                    PL 🔗
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const promptVal = prompt("Attach Google Drive URL for Packing List Document:", item.packingListDoc || "");
                                      if (promptVal !== null) {
                                        const draftItems = items.map(w => w.id === item.id ? { ...w, packingListDoc: promptVal } : w);
                                        setItems(draftItems);
                                        localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(draftItems));
                                      }
                                    }}
                                    className="p-0.5 px-0.5 sm:px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 rounded text-[6px] sm:text-[6.5px] font-bold transition-all shadow-3xs cursor-pointer select-none font-mono"
                                    title="Add Packing List Link"
                                  >
                                    ➕ PL
                                  </button>
                                )
                              ) : (
                                item.workOrderDoc ? (
                                  <a
                                    href={item.workOrderDoc}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 px-1 sm:px-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-[6.5px] sm:text-[7.5px] font-bold transition-all flex items-center gap-1 shadow-3xs cursor-pointer select-none"
                                    title="Work Order Google Drive Link"
                                  >
                                    <Clipboard className="w-2.5 h-2.5" />
                                    <span>WO</span>
                                    <ExternalLink className="w-2 h-2 text-blue-500" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const promptVal = prompt("Attach Google Drive URL for Work Order Document:", item.workOrderDoc || "");
                                      if (promptVal !== null) {
                                        const draftItems = items.map(w => w.id === item.id ? { ...w, workOrderDoc: promptVal } : w);
                                        setItems(draftItems);
                                        localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(draftItems));
                                      }
                                    }}
                                    className="p-0.5 px-0.5 sm:px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 rounded text-[6px] sm:text-[6.5px] font-bold transition-all flex items-center gap-1 shadow-3xs cursor-pointer select-none font-mono animate-pulse"
                                    title="Add Work Order Link"
                                  >
                                    <Clipboard className="w-2.5 h-2.5 text-slate-400" />
                                    <span>➕ WO</span>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Original General Card view for other status tabs (Ready to Dispatch, Hold, etc.) */
            filteredItems.length === 0 ? (
              <div className="py-12 text-slate-400 text-xs text-center uppercase font-bold tracking-widest font-sans">
                No active workflow records in filter query
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const cat = getStatusCategory(item.orderStatus);
                  
                  // Priority style mapping
                  let priorityStyles = { text: "text-amber-700 bg-amber-50 border-amber-200" };
                  if (item.priority === "High") {
                    priorityStyles = { text: "text-red-700 bg-red-50 border-red-200" };
                  } else if (item.priority === "Low") {
                    priorityStyles = { text: "text-emerald-700 bg-emerald-50 border-emerald-200" };
                  }

                  // Status custom style and icon mapping
                  let statusBadge = "bg-amber-100/90 text-amber-800 border-amber-300/50";
                  let statusIcon = <Clock className="w-3 h-3 text-amber-700 animate-pulse shrink-0" />;
                  let borderColor = "border-t-amber-500";
                  if (cat === "ReadyToDispatch") {
                    statusBadge = "bg-[#f37021]/15 text-[#f37021] border-[#f37021]/30";
                    statusIcon = <Package className="w-3 h-3 text-[#f37021] shrink-0" />;
                    borderColor = "border-t-[#f37021]";
                  } else if (cat === "Delivered") {
                    statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
                    statusIcon = <Truck className="w-3 h-3 text-emerald-700 shrink-0" />;
                    borderColor = "border-t-emerald-500";
                  } else if (cat === "Hold") {
                    statusBadge = "bg-rose-100 text-rose-800 border-rose-300";
                    statusIcon = <Ban className="w-3 h-3 text-rose-700 shrink-0" />;
                    borderColor = "border-t-rose-500";
                  }

                  return (
                    <div 
                      key={item.id + '-mobile-card'} 
                      className={`bg-white border border-slate-200 border-t-4 ${borderColor} rounded-xl p-4 shadow-sm space-y-3 transition-all relative ${
                        isEditing ? 'bg-orange-50/20 border-orange-300' : 'hover:border-slate-350'
                      }`}
                    >
                      {/* Header: Work Order No and badges */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Work Order No</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.workOrderNo || ''}
                              onChange={(e) => setEditForm({ ...editForm, workOrderNo: e.target.value })}
                              className="bg-white border-2 border-slate-900 rounded px-1.5 py-0.5 text-xs font-bold font-mono h-7 text-slate-950 w-[120px]"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-slate-900 font-mono tracking-tight">{item.workOrderNo}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusBadge}`}>
                            {statusIcon}
                            <span>{item.orderStatus}</span>
                          </span>
                          
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${priorityStyles.text}`}>
                            {item.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                      </div>

                    {/* Content Data Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] border-y border-slate-100 py-2.5 font-sans text-slate-700">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block font-mono">Order Date</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.workOrderDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, workOrderDate: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full text-[10px] font-mono h-7"
                            placeholder="YYYY-MM-DD"
                          />
                        ) : (
                          <span className="font-semibold text-slate-900 font-mono">{item.workOrderDate}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block font-mono">PO Number</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.poNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, poNumber: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full text-[10px] font-mono h-7"
                          />
                        ) : (
                          <span className="font-semibold text-slate-900 font-mono">{item.poNumber || '—'}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[8px] font-bold text-teal-650 uppercase block font-mono">Invoice No</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.invoiceNo || ''}
                            onChange={(e) => setEditForm({ ...editForm, invoiceNo: e.target.value })}
                            placeholder="INV-..."
                            className="bg-white border border-teal-300 focus:border-brand-orange rounded px-1.5 py-0.5 w-full text-[10px] uppercase font-mono h-7"
                          />
                        ) : (
                          <span className="font-semibold text-[#0f766e] font-mono">{item.invoiceNo || '—'}</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase block font-mono">Customer Name</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.customerName || ''}
                            onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full text-[11px] h-7"
                          />
                        ) : (
                          <span className="font-semibold text-slate-800 uppercase tracking-tight">{item.customerName}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block font-mono">Seller Account</span>
                        {isEditing ? (
                          <select
                            value={editForm.sellerAccounts || 'FSL'}
                            onChange={(e) => setEditForm({ ...editForm, sellerAccounts: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1 py-0.5 w-full text-[10px] h-7"
                          >
                            <option value="FSL">FSL (Marine Fasteners FZE)</option>
                            <option value="MFI">MFI (Main Office)</option>
                            <option value="MFIP">MFIP (Production)</option>
                            <option value="Direct">Direct</option>
                          </select>
                        ) : (
                          <span className="font-bold text-slate-900 font-mono text-[10px]">{formatSellerAccount(item.sellerAccounts)}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block font-mono">Delivery Date</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.deliveryDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full text-[10px] font-mono h-7"
                          />
                        ) : (
                          <span className="font-semibold text-slate-900 font-mono text-[9.5px]">{item.deliveryDate || '—'}</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase block font-mono">Transporter Detail</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.transporterDetails || ''}
                            onChange={(e) => setEditForm({ ...editForm, transporterDetails: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full text-[10px] h-7"
                          />
                        ) : (
                          <span className="font-medium text-slate-700 text-[10px] tracking-tight">{item.transporterDetails || '—'}</span>
                        )}
                      </div>
                    </div>

                    {/* Inline Status Dropdown Picker for active Edit Mode */}
                    {isEditing && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="text-[8.5px] font-bold text-slate-500 font-mono block uppercase">Choose Order Status</span>
                        <select
                          value={editForm.orderStatus}
                          onChange={(e) => setEditForm({ ...editForm, orderStatus: e.target.value })}
                          className="w-full bg-white border border-slate-300 p-1 text-[11px] font-bold text-slate-900"
                        >
                          <option value="Work Order Received">Work Order Received</option>
                          <option value="Materials Sourcing Completed">Materials Sourcing Completed</option>
                          <option value="Fluoropolymer Coating Ready">Fluoropolymer Coating Ready</option>
                          <option value="Quality Inspection Passed">Quality Inspection Passed</option>
                          <option value="Ready to Dispatch">Ready to Dispatch</option>
                          <option value="Dispatch">Dispatch (Delivered)</option>
                          <option value="Order On Hold">Order On Hold</option>
                          <option value="PR Issue">PR Issue (Material Shortage)</option>
                        </select>
                      </div>
                    )}

                    {/* Actions and Document Links bar */}
                    <div className="flex flex-col gap-2 pt-1 font-mono">
                      
                      {/* Documents link attachment status indicators */}
                      <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
                        <span className="text-[7.5px] text-slate-400 font-bold tracking-widest">DRIVE LINKS:</span>
                        
                        {/* 1. WO Document Attachment */}
                        <button
                          type="button"
                          onClick={() => {
                            if (item.workOrderDoc) {
                              window.open(item.workOrderDoc, '_blank');
                            } else {
                              const promptVal = prompt("Attach Google Drive URL for Work Order Document:", item.workOrderDoc || "");
                              if (promptVal !== null) {
                                const draftItems = items.map(w => w.id === item.id ? { ...w, workOrderDoc: promptVal } : w);
                                setItems(draftItems);
                                localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(draftItems));
                              }
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded border text-[9px] flex items-center gap-1 cursor-pointer transition-all ${
                            item.workOrderDoc ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <Clipboard className="w-3 h-3" />
                          <span>WO</span>
                          {item.workOrderDoc ? '✔️' : '➕'}
                        </button>

                        {/* 2. Packing List Attachment */}
                        <button
                          type="button"
                          onClick={() => {
                            if (item.packingListDoc) {
                              window.open(item.packingListDoc, '_blank');
                            } else {
                              const promptVal = prompt("Attach Google Drive URL for Packing List Document:", item.packingListDoc || "");
                              if (promptVal !== null) {
                                const draftItems = items.map(w => w.id === item.id ? { ...w, packingListDoc: promptVal } : w);
                                setItems(draftItems);
                                localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(draftItems));
                              }
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded border text-[9px] flex items-center gap-1 cursor-pointer transition-all ${
                            item.packingListDoc ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span>PL</span>
                          {item.packingListDoc ? '✔️' : '➕'}
                        </button>

                        {/* 3. Consignee Delivery Note Attachment */}
                        <button
                          type="button"
                          onClick={() => {
                            if (item.consigneeNotesDoc) {
                              window.open(item.consigneeNotesDoc, '_blank');
                            } else {
                              const promptVal = prompt("Attach Google Drive URL for Consignee Signed Delivery Note:", item.consigneeNotesDoc || "");
                              if (promptVal !== null) {
                                const draftItems = items.map(w => w.id === item.id ? { ...w, consigneeNotesDoc: promptVal } : w);
                                setItems(draftItems);
                                localStorage.setItem('MF_WORKFLOW_REF_ITEMS', JSON.stringify(draftItems));
                              }
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded border text-[9px] flex items-center gap-1 cursor-pointer transition-all ${
                            item.consigneeNotesDoc ? 'bg-orange-50 border-orange-200 text-[#f37021] font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span>DN</span>
                          {item.consigneeNotesDoc ? '✔️' : '➕'}
                        </button>
                      </div>

                      {/* Operation Action Button Hub */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1 gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="px-3.5 py-1 bg-slate-900 border border-slate-950 text-white font-bold text-[9px] uppercase tracking-wider rounded cursor-pointer"
                            >
                              SAVE CHANGES
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-[9px] uppercase tracking-wider rounded cursor-pointer"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditForm({ ...item });
                                  }}
                                  className="px-3 py-1 bg-white border border-slate-300 text-slate-800 text-[9px] uppercase font-bold rounded hover:bg-slate-100 cursor-pointer"
                                >
                                  📝 EDIT RECORD
                                </button>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => handleOpenPRModal(item)}
                                className="px-3 py-1 bg-[#f37021]/10 border border-[#f37021]/30 text-[#f37021] text-[9px] uppercase font-bold rounded hover:bg-[#f37021]/20 cursor-pointer"
                              >
                                🔔 PR ISSUE
                              </button>
                            </div>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`ARE YOU SURE YOU WANT TO REMOVE WORK ORDER ${item.workOrderNo} FROM THE REAL-TIME WORKFLOW REGISTRY?`)) {
                                    handleDeleteItem(item.id);
                                  }
                                }}
                                className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-650 text-[9px] uppercase font-bold rounded hover:bg-red-100 cursor-pointer ml-auto"
                              >
                                REMOVE
                              </button>
                            )}
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>



      {/* 📥 PURCHASE REQUEST TO AJMAN OFFICE MODAL */}
      {selectedWoForPr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-mono">
          <div className="bg-white border-2 border-slate-900 shadow-xl max-w-lg w-full rounded-md overflow-hidden">
            <div className="bg-slate-950 text-white p-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Create Purchase Request to Ajman Office
                </h3>
              </div>
              <button 
                onClick={handleClosePRModal}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPR} className="p-5 space-y-4 text-[11px] uppercase font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 border border-slate-200">
                <div>
                  <span className="text-[8px] text-slate-400 block font-mono">Source Work Order</span>
                  <span className="text-[12px] text-slate-900 font-semibold">{selectedWoForPr.workOrderNo}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block font-mono">Client Reference</span>
                  <span className="text-[11px] text-slate-900 font-semibold truncate block">{selectedWoForPr.customerName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[8px] text-slate-400 block font-mono">Store Status Indicator</span>
                  <span className="text-[9px] text-[#f37021] font-semibold">PR ISSUE - MATERIAL INSUFFICIENT IN WORKSHOP STOCK</span>
                </div>
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-[9px] text-slate-500 font-semibold">Requested Item Brand / Specifications</label>
                <input
                  type="text"
                  required
                  value={prItemDesc}
                  onChange={(e) => setPrItemDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 font-sans focus:ring-1 focus:ring-brand-orange outline-hidden"
                  placeholder="e.g., DIN 933 HEAVY HEX HEAD CAP SCREW SS316 M16 X 80"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold">Required Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={prItemQty}
                    onChange={(e) => setPrItemQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 font-mono focus:ring-1 focus:ring-brand-orange outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-semibold">Unit</label>
                  <select
                    value={prItemUnit}
                    onChange={(e) => setPrItemUnit(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-brand-orange outline-hidden"
                  >
                    <option value="Pcs.">Pcs. (Pieces)</option>
                    <option value="Kgs.">Kgs. (Kilograms)</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Packs">Packs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-semibold">Store Requisition Notes / Justification</label>
                <textarea
                  value={prItemNotes}
                  onChange={(e) => setPrItemNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 font-sans focus:ring-1 focus:ring-brand-orange outline-hidden resize-none"
                  placeholder="Add stock count alert notes or urgent factory requirements..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={handleClosePRModal}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] uppercase font-bold cursor-pointer rounded-xs"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] uppercase font-bold cursor-pointer border border-rose-700 rounded-xs flex items-center justify-center gap-1"
                >
                  <span>🚀 SUBMIT PR TO ACCS OFFICE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
