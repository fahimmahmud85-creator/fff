import React, { useState, useMemo, useEffect } from 'react';
import { generateHighFidelityDocHtml, getFormattedDocTitle } from './DocumentPrintGenerator';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';
import { 
  Megaphone, 
  FileText, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Eye, 
  Printer, 
  Download, 
  X, 
  PackageCheck, 
  Truck, 
  PauseCircle, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  LayoutDashboard,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sun,
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  Building2,
  UserCheck,
  Sparkles,
  ExternalLink,
  Tag,
  BarChart2,
  PieChart as PieChartIcon,
  MoreHorizontal,
  User,
  Bell,
  Check,
  FolderOpen,
  Archive,
  History,
  ClipboardList,
  Trash2,
  Edit,
  Save,
  Package
} from 'lucide-react';

interface HomeViewProps {
  currentUser?: { firstName?: string; lastName?: string; role?: string } | null;
  onNavigate?: (tab: any) => void;
  layouts?: any[];
  onUpdateLayout?: (id: string, newLink: string, newName?: string, newDesc?: string) => void;
  onDeleteLayout?: (id: string) => void;
  onCreateLayout?: (name: string, pdfLink: string, description: string) => void;
}

export interface WorkOrderStagingItem {
  id: string;
  workOrderNo: string;
  customerShortName: string;
  warehouseLocation: string;
  box: number;
  bundle: number;
  plt: number;
  forkliftReq: boolean;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  shift?: 'Morning Shift' | 'Evening Shift' | 'Night Shift';
  status?: 'STAGED' | 'LOADING' | 'READY' | 'DISPATCHED';
  notes?: string;
  dispatched?: boolean;
  dispatchedAt?: string;
  dispatchedBy?: string;
}

const DEFAULT_STAGING_BY_COMPANY: Record<string, WorkOrderStagingItem[]> = {
  'comp-bmm': [
    { id: 'bmm-wo-1', workOrderNo: 'WO-84920', customerShortName: 'Petrofac UAE', warehouseLocation: 'WH-04', box: 12, bundle: 4, plt: 2, forkliftReq: true, priority: 'HIGH', shift: 'Morning Shift', status: 'STAGED', notes: 'Urgent site delivery' },
    { id: 'bmm-wo-2', workOrderNo: 'WO-84921', customerShortName: 'NPCC Abu Dhabi', warehouseLocation: 'WH-02', box: 8, bundle: 6, plt: 3, forkliftReq: true, priority: 'NORMAL', shift: 'Morning Shift', status: 'READY', notes: 'Customer pickup' },
    { id: 'bmm-wo-3', workOrderNo: 'WO-84922', customerShortName: 'Drydocks World', warehouseLocation: 'WH-12', box: 24, bundle: 2, plt: 1, forkliftReq: false, priority: 'HIGH', shift: 'Evening Shift', status: 'LOADING', notes: 'Export packing' },
    { id: 'bmm-wo-4', workOrderNo: 'WO-84923', customerShortName: 'Lamprell Energy', warehouseLocation: 'WH-01', box: 16, bundle: 8, plt: 4, forkliftReq: true, priority: 'NORMAL', shift: 'Evening Shift', status: 'STAGED', notes: 'Standard stock transfer' },
    { id: 'bmm-wo-5', workOrderNo: 'WO-84924', customerShortName: 'McDermott ME', warehouseLocation: 'WH-05', box: 6, bundle: 0, plt: 1, forkliftReq: false, priority: 'URGENT', shift: 'Night Shift', status: 'STAGED', notes: 'Heavy anchor bolts' },
    { id: 'bmm-wo-6', workOrderNo: 'WO-84925', customerShortName: 'Target Engineering', warehouseLocation: 'WH-03', box: 18, bundle: 5, plt: 3, forkliftReq: true, priority: 'NORMAL', shift: 'Morning Shift', status: 'STAGED', notes: 'Marine grade bolts' }
  ],
  'comp-umi': [
    { id: 'umi-wo-1', workOrderNo: 'WO-84920', customerShortName: 'Petrofac UAE', warehouseLocation: 'WH-04', box: 12, bundle: 4, plt: 2, forkliftReq: true, priority: 'URGENT', shift: 'Morning Shift', status: 'STAGED', notes: 'Galvanized grating & studs' },
    { id: 'umi-wo-2', workOrderNo: 'WO-84921', customerShortName: 'NPCC Abu Dhabi', warehouseLocation: 'WH-02', box: 8, bundle: 6, plt: 3, forkliftReq: true, priority: 'HIGH', shift: 'Morning Shift', status: 'LOADING', notes: 'Batch 4 hot-dip complete' },
    { id: 'umi-wo-3', workOrderNo: 'WO-84922', customerShortName: 'Drydocks World', warehouseLocation: 'WH-12', box: 24, bundle: 2, plt: 1, forkliftReq: false, priority: 'NORMAL', shift: 'Evening Shift', status: 'STAGED', notes: 'Flange fabrication order' },
    { id: 'umi-wo-4', workOrderNo: 'WO-84923', customerShortName: 'Lamprell Energy', warehouseLocation: 'WH-01', box: 16, bundle: 8, plt: 4, forkliftReq: true, priority: 'NORMAL', shift: 'Evening Shift', status: 'READY', notes: 'Awaiting transport' },
    { id: 'umi-wo-5', workOrderNo: 'WO-84924', customerShortName: 'McDermott ME', warehouseLocation: 'WH-05', box: 6, bundle: 0, plt: 1, forkliftReq: false, priority: 'NORMAL', shift: 'Evening Shift', status: 'STAGED', notes: 'Offshore bolts' },
    { id: 'umi-wo-6', workOrderNo: 'WO-84925', customerShortName: 'Target Engineering', warehouseLocation: 'WH-03', box: 18, bundle: 5, plt: 3, forkliftReq: true, priority: 'HIGH', shift: 'Morning Shift', status: 'STAGED', notes: 'Fasteners package' }
  ],
  'comp-mfi': [
    { id: 'mfi-wo-1', workOrderNo: 'WO-84920', customerShortName: 'Petrofac UAE', warehouseLocation: 'WH-04', box: 12, bundle: 4, plt: 2, forkliftReq: true, priority: 'HIGH', shift: 'Morning Shift', status: 'STAGED', notes: 'SS 316 Studs M20x150' },
    { id: 'mfi-wo-2', workOrderNo: 'WO-84921', customerShortName: 'NPCC Abu Dhabi', warehouseLocation: 'WH-02', box: 8, bundle: 6, plt: 3, forkliftReq: true, priority: 'NORMAL', shift: 'Morning Shift', status: 'LOADING', notes: 'Cable tray fasteners' },
    { id: 'mfi-wo-3', workOrderNo: 'WO-84922', customerShortName: 'Drydocks World', warehouseLocation: 'WH-12', box: 24, bundle: 2, plt: 1, forkliftReq: false, priority: 'NORMAL', shift: 'Evening Shift', status: 'READY', notes: 'Marine brass fittings' },
    { id: 'mfi-wo-4', workOrderNo: 'WO-84923', customerShortName: 'Lamprell Energy', warehouseLocation: 'WH-01', box: 16, bundle: 8, plt: 4, forkliftReq: true, priority: 'URGENT', shift: 'Night Shift', status: 'STAGED', notes: 'Grade 8.8 Anchor bolts' },
    { id: 'mfi-wo-5', workOrderNo: 'WO-84924', customerShortName: 'McDermott ME', warehouseLocation: 'WH-05', box: 6, bundle: 0, plt: 1, forkliftReq: false, priority: 'NORMAL', shift: 'Morning Shift', status: 'STAGED', notes: 'Hex Nuts & Washers' },
    { id: 'mfi-wo-6', workOrderNo: 'WO-84925', customerShortName: 'Target Engineering', warehouseLocation: 'WH-03', box: 18, bundle: 5, plt: 3, forkliftReq: true, priority: 'HIGH', shift: 'Morning Shift', status: 'STAGED', notes: 'Structural Fastener Sets' }
  ]
};

const DEFAULT_ANNOUNCEMENTS_BY_COMPANY: Record<string, any[]> = {
  'comp-bmm': [
    {
      id: 'bmm-ann-1',
      category: 'SAFETY AUDIT',
      date: '2026-08-28',
      title: 'Safety Audit',
      content: 'Mandatory safety gear verification for fastener sorting unit at 10:00 AM in Yard 2.'
    },
    {
      id: 'bmm-ann-2',
      category: 'INVENTORY',
      date: '2026-08-26',
      title: 'Inventory Re-balance',
      content: 'High-tensile Grade 10.9 & 12.9 socket head bolts restocked in primary warehouse.'
    },
    {
      id: 'bmm-ann-3',
      category: 'POLICY',
      date: '2026-08-20',
      title: 'Pricing Policy',
      content: 'Updated discount schedule for structural fasteners and power tools effective immediately.'
    },
    {
      id: 'bmm-ann-4',
      category: 'WORKSHOP',
      date: '2026-08-15',
      title: 'Workshop Routine',
      content: 'All urgent site dispatch work orders must be staged by 08:30 AM daily.'
    },
    {
      id: 'bmm-ann-5',
      category: 'GENERAL',
      date: '2026-08-10',
      title: 'General Maintenance',
      content: 'General workshop maintenance scheduled for upcoming weekend.'
    }
  ],
  'comp-umi': [
    {
      id: 'umi-ann-1',
      category: 'SAFETY AUDIT',
      date: '2026-08-28',
      title: 'Safety Audit',
      content: 'Hot-dip galvanizing bath test results verified and approved for heavy foundation plates.'
    },
    {
      id: 'umi-ann-2',
      category: 'INVENTORY',
      date: '2026-08-26',
      title: 'Inventory Re-balance',
      content: 'Overhead 10-ton gantry crane fully certified for steel bundle loading.'
    },
    {
      id: 'umi-ann-3',
      category: 'POLICY',
      date: '2026-08-20',
      title: 'Pricing Policy',
      content: 'All incoming structural plates have verified chemical and mechanical inspection logs.'
    },
    {
      id: 'umi-ann-4',
      category: 'WORKSHOP',
      date: '2026-08-15',
      title: 'Workshop Routine',
      content: 'Shift B staging for Aramco and Jurph metal work orders commences at 15:30.'
    },
    {
      id: 'umi-ann-5',
      category: 'GENERAL',
      date: '2026-08-10',
      title: 'General Maintenance',
      content: 'Heavy machinery overhaul and calibration logs recorded.'
    }
  ],
  'comp-mfi': [
    {
      id: 'mfi-ann-1',
      category: 'SAFETY AUDIT',
      date: '2026-08-28',
      title: 'Safety Audit',
      content: 'Posted "ISO 9001:2015 Annual Workshop Clearance" notice for all marine teams.'
    },
    {
      id: 'mfi-ann-2',
      category: 'INVENTORY',
      date: '2026-08-26',
      title: 'Inventory Re-balance',
      content: 'Marine Fasteners Stock Re-balance Completed across Sharjah & Jeddah yards.'
    },
    {
      id: 'mfi-ann-3',
      category: 'POLICY',
      date: '2026-08-20',
      title: 'Pricing Policy',
      content: 'Updated discount schedule for marine grade fasteners effective immediately.'
    },
    {
      id: 'mfi-ann-4',
      category: 'WORKSHOP',
      date: '2026-08-15',
      title: 'Workshop Routine',
      content: 'Calibrated Torque Wrench Testing Schedule: All tools handed over to QA lab.'
    },
    {
      id: 'mfi-ann-5',
      category: 'GENERAL',
      date: '2026-08-10',
      title: 'General Maintenance',
      content: 'Facility maintenance and summer loading shift timings updated.'
    }
  ]
};

export default function HomeView({ currentUser, onNavigate }: HomeViewProps) {
  // Active company state with real-time sync
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany());

  useEffect(() => {
    const handleUpdate = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('company_profile_updated', handleUpdate);
    window.addEventListener('active_company_changed', handleUpdate);
    return () => {
      window.removeEventListener('company_profile_updated', handleUpdate);
      window.removeEventListener('active_company_changed', handleUpdate);
    };
  }, []);

  // Active top navigation module
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements' | 'purchase_requests' | 'order_status'>('dashboard');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Work Order Staging State
  const [stagingSearch, setStagingSearch] = useState('');
  const [stagingFilterLocation, setStagingFilterLocation] = useState('ALL');
  const [stagingFilterForklift, setStagingFilterForklift] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [stagingItems, setStagingItems] = useState<WorkOrderStagingItem[]>(() => {
    const comp = getActiveCompany();
    const storageKey = `MF_WO_STAGING_${comp.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_STAGING_BY_COMPANY[comp.id] || DEFAULT_STAGING_BY_COMPANY['comp-mfi'] || [];
  });

  // Re-sync stagingItems when activeCompany changes
  useEffect(() => {
    const storageKey = `MF_WO_STAGING_${activeCompany.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setStagingItems(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setStagingItems(DEFAULT_STAGING_BY_COMPANY[activeCompany.id] || DEFAULT_STAGING_BY_COMPANY['comp-mfi'] || []);
  }, [activeCompany.id]);

  // Save staging items to localStorage whenever they change
  const updateStagingItems = (newItems: WorkOrderStagingItem[]) => {
    setStagingItems(newItems);
    const storageKey = `MF_WO_STAGING_${activeCompany.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newItems));
  };

  // Dispatched Records State (Archived / Completed Dispatches per company)
  const [dispatchedRecords, setDispatchedRecords] = useState<WorkOrderStagingItem[]>(() => {
    const comp = getActiveCompany();
    const storageKey = `MF_WO_DISPATCHED_RECORDS_${comp.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Re-sync dispatched records when activeCompany changes
  useEffect(() => {
    const storageKey = `MF_WO_DISPATCHED_RECORDS_${activeCompany.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setDispatchedRecords(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setDispatchedRecords([]);
  }, [activeCompany.id]);

  const updateDispatchedRecords = (newRecords: WorkOrderStagingItem[]) => {
    setDispatchedRecords(newRecords);
    const storageKey = `MF_WO_DISPATCHED_RECORDS_${activeCompany.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newRecords));
  };

  // Staging Modal States
  const [showAddStagingModal, setShowAddStagingModal] = useState(false);
  const [editingStagingItem, setEditingStagingItem] = useState<WorkOrderStagingItem | null>(null);
  const [showStagingPreviewModal, setShowStagingPreviewModal] = useState(false);
  const [showDispatchedRecordsModal, setShowDispatchedRecordsModal] = useState(false);
  const [dispatchedSearchQuery, setDispatchedSearchQuery] = useState('');
  const [newStagingWo, setNewStagingWo] = useState('');
  const [newStagingCustomer, setNewStagingCustomer] = useState('');
  const [newStagingLocation, setNewStagingLocation] = useState('BAY-1 / RACK-01');
  const [newStagingBox, setNewStagingBox] = useState<number>(10);
  const [newStagingBundle, setNewStagingBundle] = useState<number>(0);
  const [newStagingPlt, setNewStagingPlt] = useState<number>(1);
  const [newStagingForklift, setNewStagingForklift] = useState<boolean>(true);
  const [newStagingShift, setNewStagingShift] = useState<'Morning Shift' | 'Evening Shift' | 'Night Shift'>('Morning Shift');
  const [newStagingNotes, setNewStagingNotes] = useState('');

  // Weather Location State
  const [selectedLocation, setSelectedLocation] = useState<'Sharjah Main Yard' | 'Jeddah Docking Yard' | 'Abu Dhabi Marine Hub'>('Sharjah Main Yard');

  // Calendar State
  const [currentDate] = useState(new Date(2026, 7, 6)); // August 6, 2026
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(6);

  // Selected bar for chart hover
  const [selectedBar, setSelectedBar] = useState<number | null>(3); // Default Sep 4 bar

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const catMatch = (annCat: string, filterCat: string) => {
    if (filterCat === 'ALL') return true;
    if (!annCat) return true;
    return annCat.toUpperCase().includes(filterCat.toUpperCase()) || filterCat.toUpperCase().includes(annCat.toUpperCase());
  };

  // PDF Preview Requisition Modal
  const [selectedPdfPr, setSelectedPdfPr] = useState<any | null>(null);

  const handlePrintPrDocument = (pr: any) => {
    if (!pr) return;
    const rawItems = (pr.items && pr.items.length > 0)
      ? pr.items
      : (pr.itemsList && pr.itemsList.length > 0)
        ? pr.itemsList.map((it: any) => ({
            description: it.name || it.description || 'Raw Material Requisition Item',
            qty: it.qty || it.quantity || 1,
            unit: it.unit || 'PCS',
            finish: it.finish || '—'
          }))
        : [
            { description: 'Marine Stainless Steel A4-80 Hardware Kit', qty: 250, unit: 'PCS', finish: 'SELF' }
          ];

    const prDoc = {
      ...pr,
      documentType: 'PURCHASE REQUEST',
      invoiceNo: pr.invoiceNo || pr.code || pr.prNo || 'PR-REQ-2026',
      dated: pr.dated || pr.issueDate || '2026-08-05',
      requestedBy: pr.requestedBy || pr.requestedByPerson || 'Store Dept',
      department: pr.department || 'Sharjah Workshop',
      priority: pr.priority || 'NORMAL',
      purchaseCategory: pr.purchaseCategory || pr.category || 'Steel Wire Rods / Raw Materials',
      items: rawItems,
      showPricesAndVat: false
    };

    const htmlContent = generateHighFidelityDocHtml(prDoc, 'PURCHASE REQUEST');
    const title = getFormattedDocTitle('PURCHASE REQUEST', prDoc);
    printHtml(htmlContent, title);
    triggerToast(`Printing Purchase Requisition PDF: ${prDoc.invoiceNo}`);
  };

  // Activity Logs Period Filter State ('daily' | 'monthly' | 'yearly')
  const [activityLogPeriod, setActivityLogPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Add Activity Modal State
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newActRefNo, setNewActRefNo] = useState('');
  const [newActType, setNewActType] = useState('Material Dispatch');
  const [newActDept, setNewActDept] = useState('Sharjah Yard 01');
  const [newActOperator, setNewActOperator] = useState('Eng. Ahmed Al-Mansoori');
  const [newActItems, setNewActItems] = useState('');
  const [newActStatus, setNewActStatus] = useState('DISPATCHED');

  // Activity Logs Master Dataset
  const [activityLogsData, setActivityLogsData] = useState<any[]>(() => {
    const saved = localStorage.getItem('MF_ACTIVITY_LOGS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { 
        id: 'act-1', 
        period: 'daily', 
        date: '2026-08-28', 
        time: '09:14', 
        type: 'Purchase Request', 
        particular: 'Purchase Request Created', 
        refNo: 'PR-2026-0891', 
        notes: 'PR-2026-0891 submitted for Stainless Steel A4-80 Studs...', 
        author: 'Tariq Al-Mansoor', 
        status: 'PENDING' 
      },
      { 
        id: 'act-2', 
        period: 'daily', 
        date: '2026-08-28', 
        time: '08:30', 
        type: 'Safety Bulletin', 
        particular: 'Safety Bulletin Published', 
        refNo: 'ANN-2026-04', 
        notes: 'Posted "ISO 9001:2015 Annual Workshop Clearance" notice for...', 
        author: 'Operations QA', 
        status: 'COMPLETED' 
      },
      { 
        id: 'act-3', 
        period: 'daily', 
        date: '2026-08-27', 
        time: '16:45', 
        type: 'Material Dispatch', 
        particular: 'Dispatch Batch Cleared', 
        refNo: 'WO-8954', 
        notes: 'WO-8954 released with M16X65 Galvanized Structural Bolts to...', 
        author: 'Rashid Khan', 
        status: 'DISPATCHED' 
      },
      { 
        id: 'act-4', 
        period: 'daily', 
        date: '2026-08-27', 
        time: '14:12', 
        type: 'Stock Adjustment', 
        particular: 'Stock Count Reconciled', 
        refNo: 'ADJ-8812', 
        notes: 'Adjusted bin location Bay 4B: +450 units Grade 8.8 Hex Nuts', 
        author: 'Storekeeper Live', 
        status: 'COMPLETED' 
      },
      { 
        id: 'act-5', 
        period: 'daily', 
        date: '2026-08-26', 
        time: '11:20', 
        type: 'Purchase Request', 
        particular: 'Purchase Reconciled', 
        refNo: 'PR-2026-0888', 
        notes: 'PR-2026-0888 approved by QA inspection team', 
        author: 'Procurement Specialist', 
        status: 'APPROVED' 
      },
      { 
        id: 'act-6', 
        period: 'daily', 
        date: '2026-08-25', 
        time: '15:10', 
        type: 'Stock Transfer', 
        particular: 'Material Movement', 
        refNo: 'TR-2041', 
        notes: 'Transferred 200 pcs anchor bolts to Sharjah Yard', 
        author: 'Warehouse Staff', 
        status: 'COMPLETED' 
      },
      { 
        id: 'act-7', 
        period: 'daily', 
        date: '2026-08-24', 
        time: '10:05', 
        type: 'QC Clearance', 
        particular: 'Incoming QC Log', 
        refNo: 'QC-7819', 
        notes: 'Mill test certificates verified for Batch #394', 
        author: 'Auditor Sarah Vance', 
        status: 'PASSED' 
      },
      { 
        id: 'act-8', 
        period: 'daily', 
        date: '2026-08-23', 
        time: '09:40', 
        type: 'System', 
        particular: 'System Backup Complete', 
        refNo: 'SYS-1049', 
        notes: 'Automated database and invoice logs archived safely', 
        author: 'System Admin', 
        status: 'COMPLETED' 
      },

      // Monthly Records (August 2026 & Historical Months)
      { id: 'LOG-AUG-2026', period: 'monthly', date: 'August 2026', type: 'Monthly Summary', refNo: 'M-2026-08', particular: 'Monthly Operations Summary', notes: '342 Dispatches, 89 Purchase Requests Issued', author: 'System Admin', status: 'ACTIVE' },
      { id: 'LOG-JUL-2026', period: 'monthly', date: 'July 2026', type: 'Monthly Archive', refNo: 'M-2026-07', particular: 'Monthly Operations Archive', notes: '412 Dispatches, 105 Purchase Requests Closed', author: 'Operations Manager', status: 'ARCHIVED' },

      // Yearly Wise Archives
      { id: 'LOG-YEAR-2026', period: 'yearly', date: 'Year 2026 (YTD)', type: 'Annual Audit Log', refNo: 'Y-2026', particular: 'Annual Performance Audit', notes: '2,890 Material Requests, 720 PRs Completed', author: 'Board Auditor', status: 'IN PROGRESS' },
      { id: 'LOG-YEAR-2025', period: 'yearly', date: 'Year 2025 Annual', type: 'Annual Audit Log', refNo: 'Y-2025', particular: 'Annual Performance Audit', notes: '4,520 Material Requests, 1,150 PRs Completed', author: 'Board Auditor', status: 'AUDITED' }
    ];
  });

  const handleAddActivityLog = () => {
    if (!newActItems.trim() && !newActRefNo.trim()) {
      triggerToast("Please enter Ref ID or Particulars");
      return;
    }
    const newEntry = {
      id: 'LOG-' + Date.now(),
      period: activityLogPeriod,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: newActType,
      refNo: newActRefNo || `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      department: newActDept,
      operator: newActOperator,
      items: newActItems || `${activeCompany.name} Operation`,
      status: newActStatus
    };
    const updated = [newEntry, ...activityLogsData];
    setActivityLogsData(updated);
    localStorage.setItem('MF_ACTIVITY_LOGS', JSON.stringify(updated));
    setNewActRefNo('');
    setNewActItems('');
    setShowAddActivityModal(false);
    triggerToast(`Activity Log ${newEntry.refNo} added successfully!`);
  };

  // Announcements State scoped per company
  const [announcements, setAnnouncements] = useState<any[]>(() => {
    const comp = getActiveCompany();
    const storageKey = `MF_ANNOUNCEMENTS_${comp.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_ANNOUNCEMENTS_BY_COMPANY[comp.id] || DEFAULT_ANNOUNCEMENTS_BY_COMPANY['comp-mfi'] || [];
  });

  // Re-sync announcements when activeCompany changes
  useEffect(() => {
    const storageKey = `MF_ANNOUNCEMENTS_${activeCompany.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setAnnouncements(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setAnnouncements(DEFAULT_ANNOUNCEMENTS_BY_COMPANY[activeCompany.id] || DEFAULT_ANNOUNCEMENTS_BY_COMPANY['comp-mfi'] || []);
  }, [activeCompany.id]);

  const updateCompanyAnnouncements = (newAnn: any[]) => {
    setAnnouncements(newAnn);
    const storageKey = `MF_ANNOUNCEMENTS_${activeCompany.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newAnn));
  };

  // Admin Check for Deletion Permissions
  const isAdmin = useMemo(() => {
    if (!currentUser) return true;
    const r = (currentUser.role || '').toLowerCase();
    return r.includes('admin') || r.includes('manager') || r.includes('director') || r.includes('head') || !currentUser.role;
  }, [currentUser]);

  // Editing Activity Log Modal state
  const [editingActivityLog, setEditingActivityLog] = useState<any | null>(null);

  // Delete Announcement (Only Admin)
  const handleDeleteAnnouncement = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      triggerToast("Permission Denied: Only Admin can delete company announcements.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this company announcement?")) {
      const updated = announcements.filter((ann: any) => ann.id !== id && ann.title !== id);
      updateCompanyAnnouncements(updated);
      triggerToast("Announcement deleted successfully!");
    }
  };

  // Delete Activity Log (Creator or Admin)
  const handleDeleteActivityLog = (log: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const userFullName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : '';
    const creatorName = log.createdBy || log.operator || '';
    const isCreator = !creatorName || 
      (currentUser?.firstName && creatorName.toLowerCase().includes(currentUser.firstName.toLowerCase())) ||
      (userFullName && creatorName.toLowerCase().includes(userFullName.toLowerCase()));
    
    if (!isAdmin && !isCreator) {
      triggerToast(`Permission Denied: Only creator (${creatorName}) or Admin can delete this record.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete activity record ${log.refNo || log.id}?`)) {
      const updated = activityLogsData.filter((item: any) => item.id !== log.id);
      setActivityLogsData(updated);
      localStorage.setItem('MF_ACTIVITY_LOGS', JSON.stringify(updated));
      triggerToast(`Activity record ${log.refNo || log.id} deleted successfully!`);
    }
  };

  // Save Edited Activity Log
  const handleSaveEditedActivityLog = () => {
    if (!editingActivityLog) return;
    const updated = activityLogsData.map((item: any) =>
      item.id === editingActivityLog.id ? editingActivityLog : item
    );
    setActivityLogsData(updated);
    localStorage.setItem('MF_ACTIVITY_LOGS', JSON.stringify(updated));
    setEditingActivityLog(null);
    triggerToast(`Activity record ${editingActivityLog.refNo} updated successfully!`);
  };

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState('SAFETY AUDIT');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [showAnnModal, setShowAnnModal] = useState(false);

  // Saved Documents from LocalStorage for Purchase Requests
  const savedDocs = useMemo(() => {
    const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [];
  }, []);

  // Purchase Requests
  const purchaseRequests = useMemo(() => {
    const filtered = savedDocs.filter((doc: any) => 
      doc.documentType === 'PURCHASE REQUEST' || doc.documentType === 'PURCHASE'
    );
    if (filtered.length > 0) return filtered;
    
    return [
      { 
        invoiceNo: 'PR-2026-0891', 
        dated: '2026-08-28', 
        workOrderNo: 'WO-9012', 
        priority: 'URGENT',
        status: 'APPROVED', 
        approved: true,
        checked: true,
        requestedBy: 'Eng. Ahmed Al-Mansoori', 
        department: 'Marine Workshop 02', 
        itemsCount: 14, 
        estimatedValue: 'AED 18,500',
        itemsList: [
          { name: 'Stainless Steel A4-80 Stud Bolts M20x150', qty: 250, unitPrice: '45.00' },
          { name: 'Heavy Hex Nuts 1-1/8" PTFE Coated', qty: 500, unitPrice: '14.50' }
        ]
      },
      { 
        invoiceNo: 'PR-2026-0888', 
        dated: '2026-08-26', 
        workOrderNo: 'WO-8954', 
        priority: 'HIGH',
        status: 'PENDING', 
        approved: false,
        checked: false,
        requestedBy: 'Store Officer Rashid', 
        department: 'Sharjah Main Store', 
        itemsCount: 8, 
        estimatedValue: 'AED 9,200',
        itemsList: [
          { name: 'Grade 8.8 Galvanized Structural Anchor Rods', qty: 100, unitPrice: '92.00' }
        ]
      },
      { 
        invoiceNo: 'PR-2026-0875', 
        dated: '2026-08-22', 
        workOrderNo: 'WO-8820', 
        priority: 'MEDIUM',
        status: 'PENDING', 
        approved: false,
        checked: false,
        requestedBy: 'QA Auditor Sarah Vance', 
        department: 'Quality Assurance Unit', 
        itemsCount: 22, 
        estimatedValue: 'AED 34,100',
        itemsList: [
          { name: 'Titanium Grade 2 Hex Cap Screws M12x50', qty: 300, unitPrice: '113.60' }
        ]
      },
      { 
        invoiceNo: 'PR-2026-0860', 
        dated: '2026-08-18', 
        workOrderNo: 'WO-8711', 
        priority: 'NORMAL',
        status: 'PENDING', 
        approved: false,
        checked: false,
        requestedBy: 'Procurement Specialist', 
        department: 'Jeddah Docking Hub', 
        itemsCount: 5, 
        estimatedValue: 'AED 6,800',
        itemsList: [
          { name: 'U-Bolts 316 L 8" NB Pipe Support', qty: 80, unitPrice: '85.00' }
        ]
      },
      { 
        invoiceNo: 'PR-2026-0842', 
        dated: '2026-08-15', 
        workOrderNo: 'WO-8650', 
        priority: 'NORMAL',
        status: 'PENDING', 
        approved: false,
        checked: false,
        requestedBy: 'Eng. Tariq Sultan', 
        department: 'Heavy Machinery Fab', 
        itemsCount: 19, 
        estimatedValue: 'AED 27,900',
        itemsList: [
          { name: 'Monel 400 Custom Fastener Hardware Kit', qty: 15, unitPrice: '1860.00' }
        ]
      },
      { 
        invoiceNo: 'PR-2026-0831', 
        dated: '2026-08-10', 
        workOrderNo: 'WO-8590', 
        priority: 'URGENT',
        status: 'PENDING', 
        approved: false,
        checked: false,
        requestedBy: 'Yard Lead Faisal', 
        department: 'Sharjah Yard 01', 
        itemsCount: 12, 
        estimatedValue: 'AED 14,200',
        itemsList: [
          { name: 'Heavy Hex Nuts 1-1/8" PTFE Coated', qty: 500, unitPrice: '14.50' }
        ]
      }
    ];
  }, [savedDocs]);

  // Order Status Counters based on Work Order (Workflow) Suite
  const workOrderCounts = useMemo(() => {
    let pending = 0;
    let ready = 0;
    let delivered = 0;
    let hold = 0;
    let total = 0;

    const getStatusCat = (status: string): 'Pending' | 'ReadyToDispatch' | 'Delivered' | 'Hold' => {
      if (status === "Ready to Dispatch") return 'ReadyToDispatch';
      if (status === "Dispatch") return 'Delivered';
      if (status === "Order On Hold") return 'Hold';
      return 'Pending';
    };

    try {
      const raw = localStorage.getItem('MF_WORKFLOW_REF_ITEMS');
      if (raw) {
        const items = JSON.parse(raw);
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((item: any) => {
            total++;
            const cat = getStatusCat(item.orderStatus || '');
            if (cat === 'Pending') pending++;
            else if (cat === 'ReadyToDispatch') ready++;
            else if (cat === 'Delivered') delivered++;
            else if (cat === 'Hold') hold++;
          });
          return { pending, ready, delivered, hold, total };
        }
      }
    } catch (e) {
      console.error(e);
    }

    return { pending: 31, ready: 56, delivered: 28, hold: 14, total: 129 };
  }, [savedDocs]);

  const pendingOrdersCount = workOrderCounts.pending;
  const readyToDispatchCount = workOrderCounts.ready;
  const deliveredCount = workOrderCounts.delivered;
  const orderOnHoldCount = workOrderCounts.hold;
  const totalOrdersCount = workOrderCounts.total;
  const overviewCount = workOrderCounts.total;

  // Order Status Tracking List
  const [orderStatusList, setOrderStatusList] = useState<any[]>([
    { orderNo: 'ORD-2026-9901', client: 'Zamil Offshore Services', items: 'A4-80 Stainless Studs (500 pcs)', date: '2026-08-06', status: 'PENDING', location: 'Yard 01 - Picking' },
    { orderNo: 'ORD-2026-9892', client: 'Dubai Drydocks World', items: 'Grade 8.8 Structural Bolts M24 x 100', date: '2026-08-06', status: 'READY TO DISPATCH', location: 'Dispatch Bay A' },
    { orderNo: 'ORD-2026-9884', client: 'Saudi Aramco Maritime', items: 'PTFE Coated Heavy Hex Nuts 1-1/8"', date: '2026-08-05', status: 'DELIVERED', location: 'Dhahran Store Yard' },
    { orderNo: 'ORD-2026-9870', client: 'Lamprell Energy LLC', items: 'U-Bolts & Pipe Supports 8" NB', date: '2026-08-04', status: 'ORDER ON HOLD', location: 'QA Inspection Lab' },
    { orderNo: 'ORD-2026-9855', client: 'Albwardy Damen Shipyard', items: 'Monel 400 Marine Fastener Set', date: '2026-08-03', status: 'DELIVERED', location: 'Hamriyah Free Zone' },
    { orderNo: 'ORD-2026-9841', client: 'Grandweld Shipyards', items: 'Titanium Grade 2 Hex Cap Screws', date: '2026-08-02', status: 'READY TO DISPATCH', location: 'Dispatch Bay B' },
    { orderNo: 'ORD-2026-9830', client: 'Petrofac International', items: 'Duplex 2205 Fasteners & Washers', date: '2026-08-01', status: 'PENDING', location: 'Sharjah Main Store' }
  ]);

  // Activity Updates List
  const updatesList = useMemo(() => {
    const docsLog = savedDocs.slice(0, 8).map((d: any) => ({
      date: d.dated || d.date || '06/08/2026',
      user: d.salesman || d.createdUser || 'SALES',
      particular: `${d.documentType || 'DOCUMENT'} #${d.invoiceNo || d.code || 'MFI-DOC'} created for ${d.customerName || d.buyerName || 'General Client'}`
    }));

    if (docsLog.length >= 4) return docsLog;

    return [
      ...docsLog,
      { date: '06/08/2026', user: 'SALES', particular: 'Quotation MFI-QTN-4029 issued to Zamil Heavy Industries' },
      { date: '06/08/2026', user: 'ADMIN', particular: 'Delivery Note MFI-DN-2018 approved for dispatch' },
      { date: '05/08/2026', user: 'STORE', particular: 'Material Receipt MR-8810 checked at Sharjah Warehouse' },
      { date: '05/08/2026', user: 'FINANCE', particular: 'Tax Invoice MFI-INV-3902 payment received AED 14,500' },
      { date: '04/08/2026', user: 'PURCHASE', particular: 'Purchase Order MFI-PO-1092 sent to Supplier Stainless Fasteners' },
      { date: '03/08/2026', user: 'DISPATCH', particular: 'Cargo Shipment MFI-PL-3001 dispatched via Transporter' }
    ];
  }, [savedDocs]);

  // Handle Add Announcement
  const handleAddAnnouncement = () => {
    if (!newAnnTitle.trim()) return;
    const newAnn = {
      id: 'ann-' + Date.now(),
      category: newAnnCategory || 'NOTICE',
      date: new Date().toISOString().substring(0, 10),
      title: newAnnTitle,
      content: newAnnContent || 'Internal team notice posted.'
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('MF_ANNOUNCEMENTS', JSON.stringify(updated));
    setNewAnnTitle('');
    setNewAnnContent('');
    setShowAnnModal(false);
    triggerToast("New announcement published successfully!");
  };

  // Status Badge Helper matching sleek UI
  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || 'PENDING').toUpperCase();
    if (s.includes('APPROVED') || s.includes('COMPLETED') || s.includes('DELIVERED')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {s}
        </span>
      );
    }
    if (s.includes('REVIEW') || s.includes('IN PROGRESS') || s.includes('READY')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          {s}
        </span>
      );
    }
    if (s.includes('HOLD') || s.includes('OVERDUE')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {s}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        {s}
      </span>
    );
  };

  const getUserBadge = (userStr: string) => {
    const u = (userStr || 'SALES').toUpperCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (u.includes('SALES')) bg = 'bg-blue-50 text-blue-600 border-blue-200';
    else if (u.includes('ADMIN')) bg = 'bg-purple-50 text-purple-600 border-purple-200';
    else if (u.includes('STORE')) bg = 'bg-amber-50 text-amber-600 border-amber-200';
    else if (u.includes('FINANCE')) bg = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    else if (u.includes('PURCHASE')) bg = 'bg-orange-50 text-orange-600 border-orange-200';

    return (
      <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase rounded border ${bg}`}>
        {u}
      </span>
    );
  };

  // Weather Info
  const weatherInfo = useMemo(() => {
    if (selectedLocation === 'Sharjah Main Yard') {
      return { temp: '34°C', feel: '38°C', condition: 'Sunny', humidity: '52%', wind: '14 km/h NW' };
    }
    if (selectedLocation === 'Jeddah Docking Yard') {
      return { temp: '36°C', feel: '41°C', condition: 'Humid', humidity: '64%', wind: '18 km/h W' };
    }
    return { temp: '33°C', feel: '36°C', condition: 'Clear', humidity: '48%', wind: '12 km/h N' };
  }, [selectedLocation]);

  return (
    <div className="w-full font-sans text-slate-800 select-none antialiased">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl z-[100] border-l-4 border-blue-500 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4.5 h-4.5 text-blue-400" />
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          SUB-TABS BAR (MATCHING DASH.png)
      ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        {/* Left Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'dashboard'
                ? 'bg-[#07433c] text-white'
                : 'bg-[#e1f0ed] hover:bg-[#d4ece7] text-[#07433c] border border-[#c4e4de]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Tab 2: Announcement */}
          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'announcements'
                ? 'bg-[#07433c] text-white'
                : 'bg-[#e1f0ed] hover:bg-[#d4ece7] text-[#07433c] border border-[#c4e4de]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcement</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
              activeTab === 'announcements' ? 'bg-white/20 text-white' : 'bg-[#cae5df] text-[#07433c]'
            }`}>
              {announcements.length}
            </span>
          </button>

          {/* Tab 3: Purchase request */}
          <button
            type="button"
            onClick={() => setActiveTab('purchase_requests')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'purchase_requests'
                ? 'bg-[#07433c] text-white'
                : 'bg-[#e1f0ed] hover:bg-[#d4ece7] text-[#07433c] border border-[#c4e4de]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Purchase request</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
              activeTab === 'purchase_requests' ? 'bg-white/20 text-white' : 'bg-[#cae5df] text-[#07433c]'
            }`}>
              {purchaseRequests.length}
            </span>
          </button>

          {/* Tab 4: Activity logs */}
          <button
            type="button"
            onClick={() => setActiveTab('order_status')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'order_status'
                ? 'bg-[#07433c] text-white'
                : 'bg-[#e1f0ed] hover:bg-[#d4ece7] text-[#07433c] border border-[#c4e4de]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity logs</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
              activeTab === 'order_status' ? 'bg-white/20 text-white' : 'bg-[#cae5df] text-[#07433c]'
            }`}>
              8
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: MAIN DASHBOARD VIEW (MATCHING DASH.png)
      ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3.5 animate-fade-in">
          
          {/* =========================================
              TOP GRID: 4 CARDS
          ========================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
            
            {/* Card 1: Announcement */}
            <div className="bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-[#07433c]" />
                    <h3 className="font-bold text-xs text-[#07433c]">Announcement</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAnnModal(true)}
                    className="px-2.5 py-1 bg-[#07433c] hover:bg-[#05352f] text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Post
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded border border-[#cde2de]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#07433c] text-white text-[9.5px] font-bold tracking-wider uppercase">
                        <th className="py-1 px-2.5">DATE</th>
                        <th className="py-1 px-2.5">CATEGORY</th>
                        <th className="py-1 px-2.5 text-center">VIEW</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {announcements.slice(0, 5).map((ann: any, idx: number) => {
                        const cat = (ann.category || 'GENERAL').toUpperCase();
                        let badgeStyle = 'bg-cyan-50 text-cyan-600 border-cyan-200';
                        if (cat.includes('SAFETY')) badgeStyle = 'bg-rose-50 text-rose-500 border-rose-200';
                        else if (cat.includes('INVENTORY')) badgeStyle = 'bg-amber-50 text-amber-600 border-amber-200';
                        else if (cat.includes('POLICY')) badgeStyle = 'bg-blue-50 text-blue-600 border-blue-200';
                        else if (cat.includes('WORKSHOP')) badgeStyle = 'bg-teal-50 text-teal-600 border-teal-200';

                        return (
                          <tr key={ann.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-1 px-2.5 font-mono text-slate-700 text-[10.5px]">{ann.date}</td>
                            <td className="py-1 px-2.5">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black tracking-wide uppercase border ${badgeStyle}`}>
                                {cat}
                              </span>
                            </td>
                            <td className="py-1 px-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('announcements')}
                                  className="hover:text-[#07433c] cursor-pointer"
                                  title="View Announcement"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAnnouncement(ann.id || ann.title, e)}
                                  className="hover:text-rose-600 cursor-pointer"
                                  title="Delete"
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
              </div>

              {/* Footer matching Card 3 */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  Total: <strong className="text-slate-800">{announcements.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className="text-[#07433c] font-bold text-xs hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>

            {/* Card 2: Work Order Summary */}
            <div className="bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h3 className="font-bold text-xs text-[#07433c]">Work Order Summary</h3>
                </div>

                {/* Progress Bar matching DASH.png colors */}
                <div className="w-full flex rounded overflow-hidden mb-2.5 text-[9.5px] font-bold">
                  <div className="bg-[#dc2626] text-white py-0.5 text-center" style={{ width: '22%' }}>22%</div>
                  <div className="bg-[#f59e0b] text-white py-0.5 text-center" style={{ width: '24%' }}>24%</div>
                  <div className="bg-[#16a34a] text-white py-0.5 text-center" style={{ width: '54%' }}>54%</div>
                </div>

                {/* Metrics Rows */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-700 font-medium">Purchase request</span>
                    <span className="bg-[#e1f0ed] text-[#07433c] font-bold px-2 py-0.5 rounded text-xs font-mono">6</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-700 font-medium">Pending Order</span>
                    <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-xs font-mono">31</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-700 font-medium">Ready to dispatch</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-xs font-mono">56</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-700 font-medium">Delivered</span>
                    <span className="bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded text-xs font-mono">28</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-700 font-medium">Order on hold</span>
                    <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-xs font-mono">14</span>
                  </div>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-bold">Total Active Orders</span>
                <span className="font-mono font-extrabold text-[#07433c] text-sm">129</span>
              </div>
            </div>

            {/* Card 3: Purchase Request List */}
            <div className="bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#07433c]" />
                    <h3 className="font-bold text-xs text-[#07433c]">Purchase Request List</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigate) onNavigate('purchase');
                      triggerToast("Opening Purchase Request Form");
                    }}
                    className="px-2.5 py-1 bg-[#07433c] hover:bg-[#05352f] text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add PR
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded border border-[#cde2de]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#07433c] text-white text-[9.5px] font-bold tracking-wider uppercase">
                        <th className="py-1 px-2">DATE</th>
                        <th className="py-1 px-2">WO NO</th>
                        <th className="py-1 px-2">PRIORITY</th>
                        <th className="py-1 px-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10.5px]">
                      {purchaseRequests.slice(0, 5).map((pr: any, idx: number) => {
                        const prio = (pr.priority || (idx === 0 || idx === 5 ? 'URGENT' : idx === 1 ? 'HIGH' : idx === 2 ? 'MEDIUM' : 'NORMAL')).toUpperCase();
                        let badgeStyle = 'bg-teal-50 text-teal-600 border-teal-200';
                        if (prio === 'URGENT') badgeStyle = 'bg-rose-50 text-rose-600 border-rose-200';
                        else if (prio === 'HIGH') badgeStyle = 'bg-amber-50 text-amber-600 border-amber-200';
                        else if (prio === 'MEDIUM') badgeStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200';

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-1 px-2 font-mono text-slate-600 text-[10px]">{pr.dated}</td>
                            <td className="py-1 px-2 font-mono font-bold text-slate-800 text-[10.5px]">{pr.workOrderNo}</td>
                            <td className="py-1 px-2">
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${badgeStyle}`}>
                                {prio}
                              </span>
                            </td>
                            <td className="py-1 px-2 text-center">
                              <div className="flex items-center justify-center gap-1 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPdfPr(pr)}
                                  className="hover:text-[#07433c] cursor-pointer"
                                  title="Preview"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePrintPrDocument(pr)}
                                  className="hover:text-[#07433c] cursor-pointer"
                                  title="Print"
                                >
                                  <Printer className="w-3 h-3" />
                                </button>
                                {idx === 0 && (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => triggerToast(`PR ${pr.invoiceNo} deleted`)}
                                  className="hover:text-rose-600 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  Total Requests: <strong className="text-slate-800">{purchaseRequests.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('purchase_requests')}
                  className="text-[#07433c] font-bold text-xs hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>

            {/* Card 4: Work Order Analysis */}
            <div className="bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#07433c]" />
                    <h3 className="font-bold text-xs text-[#07433c]">Work Order Analysis</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">47 Total</span>
                </div>

                {/* Pipeline Stages - scrollable list matching card heights */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-0.5 min-h-0">
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Work Order Received</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">5</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Stock Inventory</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">4</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Stock item repairing</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">PR Issue</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">OP Receiving & Inspection</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Production Item Receiving</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Coating/Galvanizing</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Final Inspection</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Assembly</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">3</span>
                  </div>
                  {/* Packing - Highlighted row */}
                  <div className="flex items-center justify-between py-0.5 px-2 bg-amber-50/80 border border-amber-300 rounded text-amber-950 font-bold">
                    <span className="text-[11px]">Packing</span>
                    <span className="bg-[#f59e0b] text-white font-bold px-2 py-0.2 rounded text-[11px] font-mono">5</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 px-1">
                    <span className="text-slate-700 text-[11px]">Ready to Dispatch</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">6</span>
                  </div>
                </div>
              </div>

              {/* Footer matching other cards */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
                <span className="text-slate-500 font-medium text-[11px]">
                  Stages: <strong className="text-slate-800">11</strong> (47 Orders)
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('order_status')}
                  className="text-[#07433c] font-bold text-xs hover:underline cursor-pointer"
                >
                  Details →
                </button>
              </div>
            </div>

          </div>

          {/* =========================================
              BOTTOM GRID: 3 CARDS
          ========================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            
            {/* Card 1 (5 cols): WO DISPATCH MATERIALS LOCATIONS */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#07433c]" />
                    <h3 className="font-bold text-xs text-[#07433c] uppercase tracking-tight">WO DISPATCH MATERIALS LOCATIONS</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Staged: 6 WOs</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewStagingWo(`WO-${Math.floor(84000 + Math.random() * 1000)}`);
                        setShowAddStagingModal(true);
                      }}
                      className="px-2.5 py-1 bg-[#07433c] hover:bg-[#05352f] text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded border border-[#cde2de]">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#07433c] text-white text-[9px] font-bold tracking-wider uppercase">
                        <th className="py-1.5 px-2">WO NO</th>
                        <th className="py-1.5 px-2">WH NO</th>
                        <th className="py-1.5 px-2">CUSTOMER</th>
                        <th className="py-1.5 px-1.5 text-center">BOX</th>
                        <th className="py-1.5 px-1.5 text-center">BUN</th>
                        <th className="py-1.5 px-1.5 text-center">PLT</th>
                        <th className="py-1.5 px-2 text-center">FORK LIFT REQ.</th>
                        <th className="py-1.5 px-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10.5px]">
                      {stagingItems.slice(0, 6).map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-1.5 px-2 font-mono font-bold text-slate-800 text-[10px]">{item.workOrderNo}</td>
                          <td className="py-1.5 px-2">
                            <span className="bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold text-[9px] px-1.5 py-0.2 rounded">
                              {item.warehouseLocation}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 font-medium text-slate-800 text-[10.5px] truncate max-w-[100px]" title={item.customerShortName}>
                            {item.customerShortName}
                          </td>
                          <td className="py-1.5 px-1.5 font-mono text-center text-slate-700">{item.box}</td>
                          <td className="py-1.5 px-1.5 font-mono text-center text-slate-700">{item.bundle}</td>
                          <td className="py-1.5 px-1.5 font-mono text-center text-slate-700">{item.plt}</td>
                          <td className="py-1.5 px-2 text-center">
                            <span className={`px-2 py-0.2 rounded text-[8.5px] font-black uppercase border ${
                              item.forkliftReq 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-slate-100 text-slate-500 border-slate-300'
                            }`}>
                              {item.forkliftReq ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-400">
                              <button
                                type="button"
                                onClick={() => setEditingStagingItem(item)}
                                className="hover:text-[#07433c] cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = stagingItems.filter(st => st.id !== item.id);
                                  updateStagingItems(updated);
                                  triggerToast(`Staging entry removed`);
                                }}
                                className="hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowStagingPreviewModal(true)}
                                className="hover:text-[#07433c] cursor-pointer"
                                title="Preview"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  Total Staged: <strong className="text-slate-800">{stagingItems.length}</strong> WOs
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('work_orders');
                    triggerToast("Opening Work Orders");
                  }}
                  className="text-[#07433c] font-bold text-xs hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>

            {/* Card 2 (4 cols): Activity Log */}
            <div className="lg:col-span-4 bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#07433c]" />
                    <h3 className="font-bold text-xs text-[#07433c]">Activity Log</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">8 Records</span>
                    <button
                      type="button"
                      onClick={() => setShowAddActivityModal(true)}
                      className="px-2.5 py-1 bg-[#07433c] hover:bg-[#05352f] text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('order_status')}
                      className="text-xs font-bold text-[#07433c] hover:underline cursor-pointer"
                    >
                      All →
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded border border-[#cde2de]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#07433c] text-white text-[9px] font-bold tracking-wider uppercase">
                        <th className="py-1.5 px-2">DATE</th>
                        <th className="py-1.5 px-2">PARTICULAR</th>
                        <th className="py-1.5 px-2">NOTES</th>
                        <th className="py-1.5 px-2 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10.5px]">
                      {activityLogsData.slice(0, 4).map((log: any, idx: number) => (
                        <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-1.5 px-2">
                            <div className="font-mono text-slate-700 text-[10px]">{log.date}</div>
                            <div className="font-mono text-slate-400 text-[9px]">{log.time || '09:00'}</div>
                          </td>
                          <td className="py-1.5 px-2 font-bold text-slate-800 text-[10.5px] leading-tight">
                            {log.particular}
                          </td>
                          <td className="py-1.5 px-2 text-slate-600 text-[10px] leading-tight line-clamp-2 max-w-[130px]" title={log.notes}>
                            {log.notes}
                            {log.author && (
                              <span className="block text-[9px] text-slate-400">By: {log.author}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-400">
                              <button
                                type="button"
                                onClick={() => setEditingActivityLog(log)}
                                className="hover:text-[#07433c] cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteActivityLog(log, e)}
                                className="hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  Total Logs: <strong className="text-slate-800">{activityLogsData.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('order_status')}
                  className="text-[#07433c] font-bold text-xs hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
            </div>

            {/* Card 3 (3 cols): Calendar Widget */}
            <div className="lg:col-span-3 bg-white rounded-lg border border-[#cde2de] p-3 shadow-2xs flex flex-col justify-between h-[280px]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#07433c]" />
                    <h3 className="font-bold text-xs text-[#07433c]">Calendar</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => triggerToast("Today: 29 August 2026")}
                      className="px-2 py-0.5 bg-[#e1f0ed] hover:bg-[#d4ece7] text-[#07433c] text-[10px] font-bold rounded border border-[#c4e4de] cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast("Previous month")}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast("Next month")}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Month Title */}
                <div className="text-center font-bold text-slate-800 text-xs mb-2">
                  August 2026
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-0.5">
                      {d}
                    </div>
                  ))}
                  {/* Empty offsets for August 2026 (Starts on Saturday = 6 empty slots) */}
                  <div className="text-[10.5px] py-0.5 text-slate-300"></div>
                  <div className="text-[10.5px] py-0.5 text-slate-300"></div>
                  <div className="text-[10.5px] py-0.5 text-slate-300"></div>
                  <div className="text-[10.5px] py-0.5 text-slate-300"></div>
                  <div className="text-[10.5px] py-0.5 text-slate-300"></div>
                  <div className="text-[10.5px] py-0.5 text-slate-300"></div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">1</div>

                  {/* Weeks */}
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">2</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">3</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">4</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">5</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">6</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">7</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">8</div>

                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">9</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">10</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">11</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">12</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">13</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">14</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">15</div>

                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">16</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">17</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">18</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">19</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">20</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">21</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">22</div>

                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">23</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">24</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">25</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">26</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">27</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">28</div>
                  {/* Day 29 Active matching DASH.png */}
                  <div className="text-[10.5px] py-0.5 bg-[#07433c] text-white font-bold rounded cursor-pointer shadow-xs">29</div>

                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">30</div>
                  <div className="text-[10.5px] py-0.5 text-slate-700 font-medium hover:bg-slate-100 rounded cursor-pointer">31</div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  Selected: <strong className="text-slate-800">29 Aug 2026</strong>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Working Day
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          TAB 2: ANNOUNCEMENTS ONLY TAB
      ========================================================= */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Announcements</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Official internal notices, safety bulletins, policy updates, and workshop announcements</p>
            </div>

            <button 
              type="button"
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Post Announcement
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search notices by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'NOTICES', 'WORKSHOP'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements
              .filter(ann => categoryFilter === 'ALL' || catMatch(ann.category, categoryFilter))
              .filter(ann => !searchQuery || ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || ann.content.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((ann, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-blue-300 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-extrabold px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md uppercase tracking-wider">
                        {ann.category || 'NOTICE'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAnnouncement(ann.id || ann.title, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={isAdmin ? "Delete Announcement" : "Only Admin can delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-400 font-mono">
                    <span>{activeCompany.name} Administration</span>
                    <span className="text-slate-400 font-semibold">Official Notice</span>
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* =========================================================
          TAB 3: PURCHASE REQUEST ONLY TAB
      ========================================================= */}
      {activeTab === 'purchase_requests' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Purchase Requisitions</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Review internal material requisitions, work order linkages, and generate PDF documents</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('purchase');
                triggerToast("Opening Purchase Requisition Generator");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Requisition Form
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search purchase requests by requisition number, requester, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Requisition Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3">REQUISITION NO</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3">REQUESTED BY</th>
                  <th className="p-3">DEPARTMENT / CATEGORY</th>
                  <th className="p-3 text-center">ITEMS</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-center">DOCUMENT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseRequests
                  .filter((pr: any) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (pr.invoiceNo && pr.invoiceNo.toLowerCase().includes(q)) ||
                      (pr.requestedBy && pr.requestedBy.toLowerCase().includes(q)) ||
                      (pr.department && pr.department.toLowerCase().includes(q))
                    );
                  })
                  .map((pr: any, idx: number) => {
                    const prNo = pr.invoiceNo || pr.code || pr.prNo || "PR-REQ-2026";
                    const dateVal = pr.dated || pr.issueDate || "2026-08-05";
                    const itemsArr = (pr.items && pr.items.length > 0) ? pr.items : (pr.itemsList || []);
                    const itemCount = itemsArr.length || pr.itemsCount || 1;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-3 font-bold text-blue-600 font-mono">
                          {prNo}
                          <div className="text-[9.5px] text-slate-400 font-normal font-sans">WO: {pr.workOrderNo || 'MFI-WO-880'}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-mono">{dateVal}</td>
                        <td className="p-3 font-medium text-slate-800">{pr.requestedBy || 'Store Dept'}</td>
                        <td className="p-3 text-slate-500">{pr.department || pr.purchaseCategory || 'Sharjah Workshop'}</td>
                        <td className="p-3 text-center font-bold text-slate-700 font-mono">{itemCount} ITEMS</td>
                        <td className="p-3">{getStatusBadge(pr.status)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedPdfPr(pr)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-all cursor-pointer shadow-2xs flex items-center justify-center hover:scale-105"
                              title="Preview Purchase Requisition Document"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintPrDocument(pr)}
                              className="p-1.5 bg-[#083c54] hover:bg-blue-900 text-white rounded-lg transition-all cursor-pointer shadow-2xs flex items-center justify-center hover:scale-105"
                              title="Print Purchase Requisition PDF"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =========================================================
          TAB 4: ACTIVITY LOGS ONLY TAB
      ========================================================= */}
      {activeTab === 'order_status' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Activity Logs</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Complete historical archive of daily material requests, dispatches, and yard operations</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setShowAddActivityModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Add Activity Record
              </button>

              <button 
                type="button"
                onClick={() => triggerToast("Activity Log Records Exported")}
                className="px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Log
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search activity logs by reference number, department, or operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Activity Logs Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3">REF ID</th>
                  <th className="p-3">DATE / TIMESTAMP</th>
                  <th className="p-3">ACTIVITY TYPE</th>
                  <th className="p-3">DEPARTMENT / OPERATOR</th>
                  <th className="p-3">ITEMS / SPECIFICATION</th>
                  <th className="p-3">LOG STATUS</th>
                  <th className="p-3 text-center font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogsData
                  .filter((log: any) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (log.refNo && log.refNo.toLowerCase().includes(q)) ||
                      (log.type && log.type.toLowerCase().includes(q)) ||
                      (log.department && log.department.toLowerCase().includes(q)) ||
                      (log.items && log.items.toLowerCase().includes(q))
                    );
                  })
                  .map((log: any, idx: number) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-3 font-bold font-mono text-blue-600">{log.refNo || log.id}</td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{log.date}</td>
                      <td className="p-3 font-bold text-slate-900">{log.type}</td>
                      <td className="p-3 text-slate-700">
                        <div className="font-semibold">{log.department}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{log.operator}</div>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px] max-w-[220px] truncate">{log.items}</td>
                      <td className="p-3">{getStatusBadge(log.status)}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingActivityLog(log)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteActivityLog(log, e)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =========================================================
          REQUISITION PDF PREVIEW MODAL
      ========================================================= */}
      {selectedPdfPr && (() => {
        const rawItems = (selectedPdfPr.items && selectedPdfPr.items.length > 0)
          ? selectedPdfPr.items
          : (selectedPdfPr.itemsList && selectedPdfPr.itemsList.length > 0)
            ? selectedPdfPr.itemsList
            : [
                { description: 'Marine Stainless Steel A4-80 Hardware Kit', qty: 250, unit: 'PCS', finish: 'SELF' },
                { description: 'M16 x 100mm High Tensile Grade 8.8 Hex Bolts', qty: 500, unit: 'PCS', finish: 'HDG' }
              ];

        const validItems = rawItems.filter((it: any) => Boolean((it.description || it.name) && String(it.description || it.name).trim() && (it.description || it.name) !== '—'));

        const prDoc = {
          ...selectedPdfPr,
          documentType: 'PURCHASE REQUEST',
          invoiceNo: selectedPdfPr.invoiceNo || selectedPdfPr.requisitionNo || selectedPdfPr.id || 'PR-228312',
          dated: selectedPdfPr.dated || selectedPdfPr.requestedDate || selectedPdfPr.issueDate || new Date().toISOString().split('T')[0],
          requestedBy: selectedPdfPr.requestedBy || selectedPdfPr.requestedByPerson || 'Store Dept',
          department: selectedPdfPr.department || 'Sharjah Workshop',
          priority: selectedPdfPr.priority || 'NORMAL',
          purchaseCategory: selectedPdfPr.purchaseCategory || selectedPdfPr.category || 'Steel Wire Rods / Raw Materials',
          items: validItems.length > 0 ? validItems : rawItems,
          showPricesAndVat: false
        };

        const highFidelityHtml = generateHighFidelityDocHtml(prDoc, 'PURCHASE REQUEST', undefined, { singleCopy: true, isPreview: true });

        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[120] flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[95vh] flex flex-col relative overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Purchase Request Document Layout Preview</h3>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded ml-2">
                    {prDoc.invoiceNo}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedPdfPr(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* High Fidelity Document Preview Sheet Frame */}
              <div className="flex-1 min-h-[500px] bg-slate-100 rounded-xl p-2 border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
                <iframe
                  title="Purchase Request Document Layout Preview"
                  srcDoc={highFidelityHtml}
                  className="w-full h-full min-h-[580px] rounded-lg border border-slate-300 bg-white shadow-sm"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Priority: <strong className="text-slate-800">{prDoc.priority}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Category: <strong className="text-slate-800">{prDoc.purchaseCategory}</strong></span>
                </div>
                <div className="flex gap-2.5">
                  <button 
                    type="button"
                    onClick={() => handlePrintPrDocument(selectedPdfPr)}
                    className="px-4 py-2 bg-[#083c54] hover:bg-blue-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 shadow-xs transition-all hover:scale-102"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" /> PRINT PDF
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedPdfPr(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* =========================================================
          GLOBAL ANNOUNCEMENT / BULLETIN POST MODAL
      ========================================================= */}
      {showAnnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Publish New Notice / Bulletin</h3>
              </div>
              <button 
                onClick={() => setShowAnnModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notice Title *</label>
                <input
                  type="text"
                  placeholder="e.g. ISO 9001 Annual Workshop Clearance..."
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={newAnnCategory}
                  onChange={(e) => setNewAnnCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="GENERAL NOTICE">GENERAL NOTICE</option>
                  <option value="WORKSHOP">WORKSHOP BULLETIN</option>
                  <option value="SAFETY AUDIT">SAFETY AUDIT</option>
                  <option value="INVENTORY">INVENTORY UPDATE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Notice Message / Details</label>
                <textarea
                  placeholder="Write detailed announcement message for yard and workshop staff..."
                  rows={4}
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-200">
              <button 
                type="button"
                onClick={() => setShowAnnModal(false)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAddAnnouncement} 
                className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" /> Publish Bulletin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ADD ACTIVITY LOG MODAL
      ========================================================= */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Add New Activity Log Entry</h3>
              </div>
              <button 
                onClick={() => setShowAddActivityModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Ref ID / Work Order</label>
                <input
                  type="text"
                  placeholder="e.g. WO-9015 or PR-2026-0895"
                  value={newActRefNo}
                  onChange={(e) => setNewActRefNo(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Activity Type</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="Material Dispatch">Material Dispatch</option>
                  <option value="Purchase Request">Purchase Request</option>
                  <option value="QC Clearance">QC Clearance</option>
                  <option value="Stock Transfer">Stock Transfer</option>
                  <option value="Incoming Inspection">Incoming Inspection</option>
                  <option value="Work Order Processing">Work Order Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Department / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sharjah Yard 01 / Marine Workshop"
                  value={newActDept}
                  onChange={(e) => setNewActDept(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Operator / Officer</label>
                <input
                  type="text"
                  placeholder="e.g. Eng. Ahmed / Store Officer"
                  value={newActOperator}
                  onChange={(e) => setNewActOperator(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Particulars / Specifications</label>
                <input
                  type="text"
                  placeholder="e.g. Stainless Steel A4-80 Stud Bolts M20x150 (300 Pcs)"
                  value={newActItems}
                  onChange={(e) => setNewActItems(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Log Period Category</label>
                <select
                  value={activityLogPeriod}
                  onChange={(e: any) => setActivityLogPeriod(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="daily">Daily Requests</option>
                  <option value="monthly">Monthly Records</option>
                  <option value="yearly">Yearly Wise</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Log Status</label>
                <select
                  value={newActStatus}
                  onChange={(e) => setNewActStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="IN TRANSIT">IN TRANSIT</option>
                  <option value="PASSED">PASSED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-200">
              <button 
                type="button"
                onClick={() => setShowAddActivityModal(false)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleAddActivityLog} 
                className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Save Activity Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT ACTIVITY LOG MODAL
      ========================================================= */}
      {editingActivityLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Activity Log Record</h3>
              </div>
              <button 
                onClick={() => setEditingActivityLog(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Ref ID / Work Order</label>
                <input
                  type="text"
                  value={editingActivityLog.refNo || ''}
                  onChange={(e) => setEditingActivityLog({ ...editingActivityLog, refNo: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Activity Type</label>
                <select
                  value={editingActivityLog.type || 'Material Dispatch'}
                  onChange={(e) => setEditingActivityLog({ ...editingActivityLog, type: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="Material Dispatch">Material Dispatch</option>
                  <option value="Purchase Request">Purchase Request</option>
                  <option value="QC Clearance">QC Clearance</option>
                  <option value="Stock Transfer">Stock Transfer</option>
                  <option value="Incoming Inspection">Incoming Inspection</option>
                  <option value="Work Order Processing">Work Order Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={editingActivityLog.department || ''}
                  onChange={(e) => setEditingActivityLog({ ...editingActivityLog, department: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Operator / Person In-Charge</label>
                <input
                  type="text"
                  value={editingActivityLog.operator || ''}
                  onChange={(e) => setEditingActivityLog({ ...editingActivityLog, operator: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Particulars / Items Specification</label>
                <input
                  type="text"
                  value={editingActivityLog.items || ''}
                  onChange={(e) => setEditingActivityLog({ ...editingActivityLog, items: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">Log Status</label>
                <select
                  value={editingActivityLog.status || 'PENDING'}
                  onChange={(e) => setEditingActivityLog({ ...editingActivityLog, status: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="IN TRANSIT">IN TRANSIT</option>
                  <option value="PASSED">PASSED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-200">
              <button 
                type="button"
                onClick={() => setEditingActivityLog(null)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveEditedActivityLog} 
                className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ADD WORK ORDER MATERIALS DISPATCH LOCATION MODAL
      ========================================================= */}
      {showAddStagingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/90 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shadow-2xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">New Work Order Materials Dispatch Location</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Record work order quantities and warehouse location for dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddStagingModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Work Order No *</label>
                <input
                  type="text"
                  placeholder="e.g. WO-9015 or BMM-WO-1080"
                  value={newStagingWo}
                  onChange={(e) => setNewStagingWo(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl font-mono font-bold text-emerald-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Customer (Short Name) *</label>
                <input
                  type="text"
                  placeholder="e.g. DUBAI STRUCTURAL / ZAMIL"
                  value={newStagingCustomer}
                  onChange={(e) => setNewStagingCustomer(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl font-bold uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Warehouse Location</label>
                <input
                  type="text"
                  placeholder="e.g. BAY-1 / RACK-04, YARD-A SHED-2"
                  value={newStagingLocation}
                  onChange={(e) => setNewStagingLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />
              </div>

              {/* Quantities: Box, Bundle, Pallet */}
              <div className="sm:col-span-2 grid grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90">
                <div className="bg-white p-2 rounded-lg border border-sky-200/70 shadow-2xs">
                  <label className="block text-[10px] font-extrabold text-sky-800 uppercase mb-1 text-center">Box Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newStagingBox}
                    onChange={(e) => setNewStagingBox(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 bg-sky-50/50 border border-sky-200 rounded-md text-center font-mono font-black text-sky-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-200/70 shadow-2xs">
                  <label className="block text-[10px] font-extrabold text-amber-800 uppercase mb-1 text-center">Bundle Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={newStagingBundle}
                    onChange={(e) => setNewStagingBundle(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 bg-amber-50/50 border border-amber-200 rounded-md text-center font-mono font-black text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="bg-white p-2 rounded-lg border border-purple-200/70 shadow-2xs">
                  <label className="block text-[10px] font-extrabold text-purple-800 uppercase mb-1 text-center">PLT (Pallets)</label>
                  <input
                    type="number"
                    min="0"
                    value={newStagingPlt}
                    onChange={(e) => setNewStagingPlt(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 bg-purple-50/50 border border-purple-200 rounded-md text-center font-mono font-black text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Pallet / Forklift Handling Requirement Option */}
              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Pallet Handling Request</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${newStagingForklift ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {newStagingForklift ? 'Palletized' : 'Loose Box / Hand Load'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Requires heavy pallet staging and forklift loading dock
                  </div>
                </div>

                {/* Segmented YES / NO control */}
                <div className="inline-flex p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setNewStagingForklift(true)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      newStagingForklift
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${newStagingForklift ? 'bg-white' : 'bg-transparent'}`}></span>
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStagingForklift(false)}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      !newStagingForklift
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${!newStagingForklift ? 'bg-white' : 'bg-transparent'}`}></span>
                    NO
                  </button>
                </div>
              </div>

              {/* Staging Notes */}
              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dispatch Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent site delivery, export crate packaging..."
                  value={newStagingNotes}
                  onChange={(e) => setNewStagingNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3.5 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowAddStagingModal(false)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (!newStagingWo.trim() || !newStagingCustomer.trim()) {
                    triggerToast("Please enter Work Order No and Customer Short Name.");
                    return;
                  }
                  const newItem: WorkOrderStagingItem = {
                    id: 'stg-' + Date.now(),
                    workOrderNo: newStagingWo.trim().toUpperCase(),
                    customerShortName: newStagingCustomer.trim().toUpperCase(),
                    warehouseLocation: newStagingLocation.trim().toUpperCase() || 'BAY-1',
                    box: Number(newStagingBox) || 0,
                    bundle: Number(newStagingBundle) || 0,
                    plt: Number(newStagingPlt) || 0,
                    forkliftReq: newStagingForklift,
                    dispatched: false,
                    notes: newStagingNotes.trim()
                  };
                  const updated = [newItem, ...stagingItems];
                  updateStagingItems(updated);
                  setShowAddStagingModal(false);
                  triggerToast(`Work Order ${newItem.workOrderNo} added to materials dispatch location!`);
                }} 
                className="px-5 py-2 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Save Dispatch Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT WORK ORDER MATERIALS DISPATCH LOCATION MODAL
          (Includes DISPATCHED YES/NO Box -> IF YES, REMOVED FROM LIST)
      ========================================================= */}
      {editingStagingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/90 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center shadow-2xs">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Edit Work Order Materials Dispatch Location</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Update location, packaging quantities, and dispatch fulfillment status</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingStagingItem(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Work Order No</label>
                <input
                  type="text"
                  value={editingStagingItem.workOrderNo}
                  onChange={(e) => setEditingStagingItem({ ...editingStagingItem, workOrderNo: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-mono font-bold text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Customer (Short Name)</label>
                <input
                  type="text"
                  value={editingStagingItem.customerShortName}
                  onChange={(e) => setEditingStagingItem({ ...editingStagingItem, customerShortName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-bold uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Warehouse Location</label>
                <input
                  type="text"
                  value={editingStagingItem.warehouseLocation}
                  onChange={(e) => setEditingStagingItem({ ...editingStagingItem, warehouseLocation: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>

              {/* Quantities: Box, Bundle, Pallet */}
              <div className="sm:col-span-2 grid grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90">
                <div className="bg-white p-2 rounded-lg border border-sky-200/70 shadow-2xs">
                  <label className="block text-[10px] font-extrabold text-sky-800 uppercase mb-1 text-center">Box Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={editingStagingItem.box}
                    onChange={(e) => setEditingStagingItem({ ...editingStagingItem, box: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-1.5 bg-sky-50/50 border border-sky-200 rounded-md text-center font-mono font-black text-sky-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="bg-white p-2 rounded-lg border border-amber-200/70 shadow-2xs">
                  <label className="block text-[10px] font-extrabold text-amber-800 uppercase mb-1 text-center">Bundle Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={editingStagingItem.bundle}
                    onChange={(e) => setEditingStagingItem({ ...editingStagingItem, bundle: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-1.5 bg-amber-50/50 border border-amber-200 rounded-md text-center font-mono font-black text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="bg-white p-2 rounded-lg border border-purple-200/70 shadow-2xs">
                  <label className="block text-[10px] font-extrabold text-purple-800 uppercase mb-1 text-center">PLT (Pallets)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingStagingItem.plt}
                    onChange={(e) => setEditingStagingItem({ ...editingStagingItem, plt: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-1.5 bg-purple-50/50 border border-purple-200 rounded-md text-center font-mono font-black text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Pallet / Forklift Handling Requirement Option */}
              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Pallet Handling Request</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${editingStagingItem.forkliftReq ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {editingStagingItem.forkliftReq ? 'Palletized' : 'Loose Box / Hand Load'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Requires heavy pallet staging and forklift loading dock
                  </div>
                </div>

                {/* Segmented YES / NO control */}
                <div className="inline-flex p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setEditingStagingItem({ ...editingStagingItem, forkliftReq: true })}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      editingStagingItem.forkliftReq
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${editingStagingItem.forkliftReq ? 'bg-white' : 'bg-transparent'}`}></span>
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStagingItem({ ...editingStagingItem, forkliftReq: false })}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      !editingStagingItem.forkliftReq
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${!editingStagingItem.forkliftReq ? 'bg-white' : 'bg-transparent'}`}></span>
                    NO
                  </button>
                </div>
              </div>

              {/* =========================================================
                  DISPATCHED YES / NO BOX (USER REQUIREMENT)
                  "IN EDIT ADD A BOX DISPATCHED YES NO. IF YES THEN REMOVED FROM LIST"
              ========================================================= */}
              <div className={`sm:col-span-2 p-3.5 rounded-xl border transition-all ${
                editingStagingItem.dispatched 
                  ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-200/70' 
                  : 'bg-slate-50/80 border-slate-200/90'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${editingStagingItem.dispatched ? 'text-emerald-600' : 'text-slate-400'}`} />
                        DISPATCHED
                      </span>
                      <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        editingStagingItem.dispatched 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {editingStagingItem.dispatched ? 'YES (REMOVE FROM LIST)' : 'NO (KEEP IN LIST)'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-medium mt-1">
                      {editingStagingItem.dispatched 
                        ? 'Item will be marked as DISPATCHED, archived to Records, and removed from active list.' 
                        : 'Keep as NO to retain this work order in the active materials dispatch location list.'}
                    </p>
                  </div>

                  {/* Segmented YES / NO control */}
                  <div className="inline-flex p-1 bg-slate-200/90 rounded-xl border border-slate-300 shadow-inner shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingStagingItem({ ...editingStagingItem, dispatched: false })}
                      className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        !editingStagingItem.dispatched
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${!editingStagingItem.dispatched ? 'bg-white' : 'bg-transparent'}`}></span>
                      NO
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStagingItem({ ...editingStagingItem, dispatched: true })}
                      className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        editingStagingItem.dispatched
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${editingStagingItem.dispatched ? 'bg-white' : 'bg-transparent'}`}></span>
                      YES
                    </button>
                  </div>
                </div>
              </div>

              {/* Staging Notes */}
              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dispatch Notes / Remarks</label>
                <input
                  type="text"
                  value={editingStagingItem.notes || ''}
                  onChange={(e) => setEditingStagingItem({ ...editingStagingItem, notes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3.5 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setEditingStagingItem(null)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (editingStagingItem.dispatched) {
                    // 1. Remove from active staging items list
                    const updatedStaging = stagingItems.filter(st => st.id !== editingStagingItem.id);
                    updateStagingItems(updatedStaging);

                    // 2. Archive to Dispatched Materials Records
                    const recordToArchive: WorkOrderStagingItem = {
                      ...editingStagingItem,
                      status: 'DISPATCHED',
                      dispatched: true,
                      dispatchedAt: new Date().toISOString(),
                      dispatchedBy: currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Operations Supervisor'
                    };
                    const updatedRecords = [recordToArchive, ...dispatchedRecords.filter(r => r.id !== editingStagingItem.id)];
                    updateDispatchedRecords(updatedRecords);

                    setEditingStagingItem(null);
                    triggerToast(`Work order ${editingStagingItem.workOrderNo} marked as Dispatched and removed from active list.`);
                  } else {
                    // Regular update in active list
                    const updated = stagingItems.map(st => st.id === editingStagingItem.id ? { ...editingStagingItem, dispatched: false } : st);
                    updateStagingItems(updated);
                    setEditingStagingItem(null);
                    triggerToast(`Dispatch update for ${editingStagingItem.workOrderNo} saved.`);
                  }
                }} 
                className={`px-5 py-2 text-xs text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center gap-1.5 transition-all ${
                  editingStagingItem.dispatched
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Save className="w-3.5 h-3.5" /> 
                {editingStagingItem.dispatched ? 'Mark Dispatched & Remove' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PREVIEW WORK ORDER MATERIALS DISPATCH LOCATION MODAL
      ========================================================= */}
      {showStagingPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200/90 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shadow-2xs">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Work Order Materials Dispatch Location Sheet (Preview)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Authentic document layout ready for print and yard operations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const totalBoxes = stagingItems.reduce((sum, item) => sum + (Number(item.box) || 0), 0);
                    const totalBundles = stagingItems.reduce((sum, item) => sum + (Number(item.bundle) || 0), 0);
                    const totalPlts = stagingItems.reduce((sum, item) => sum + (Number(item.plt) || 0), 0);
                    const forkliftCount = stagingItems.filter(item => item.forkliftReq).length;
                    const companyTrn = activeCompany.trn || '100440509600003';

                    const sheetDocHtml = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Work Order Materials Dispatch Location - ${activeCompany.name}</title>
                        <style>
                          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 20px; color: #1e293b; font-size: 11px; }
                          .header { text-align: center; border-bottom: 2px solid #083c54; padding-bottom: 10px; margin-bottom: 15px; }
                          .company-title { font-size: 18px; font-weight: bold; color: #083c54; text-transform: uppercase; margin: 0; }
                          .doc-title { font-size: 14px; font-weight: bold; margin-top: 5px; color: #334155; }
                          .meta-bar { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 12px; color: #64748b; }
                          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                          th { background: #083c54; color: white; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
                          td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; font-size: 10px; }
                          tr:nth-child(even) { background-color: #f8fafc; }
                          .summary-box { display: flex; gap: 15px; margin-top: 15px; padding: 10px; background: #f1f5f9; border-radius: 6px; font-weight: bold; font-size: 11px; }
                          .badge-yes { color: #047857; font-weight: bold; }
                          .badge-no { color: #64748b; }
                          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; padding-top: 20px; border-top: 1px solid #cbd5e1; }
                          @media print { body { margin: 0; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 class="company-title">${activeCompany.name}</h1>
                          <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">${activeCompany.address || 'Industrial Area, UAE'} | TRN: ${companyTrn}</div>
                          <div class="doc-title">WORK ORDER MATERIALS DISPATCH LOCATION SCHEDULE</div>
                        </div>

                        <div class="meta-bar">
                          <span><strong>DATE:</strong> ${new Date().toLocaleDateString('en-GB')}</span>
                          <span><strong>TOTAL ORDERS:</strong> ${stagingItems.length}</span>
                          <span><strong>PRINTED BY:</strong> ${currentUser ? currentUser.firstName : 'Operations Supervisor'}</span>
                        </div>

                        <table>
                          <thead>
                            <tr>
                              <th>WORK ORDER NO</th>
                              <th>CUSTOMER (SHORT NAME)</th>
                              <th>WAREHOUSE LOCATION</th>
                              <th style="text-align:center;">BOX</th>
                              <th style="text-align:center;">BUNDLE</th>
                              <th style="text-align:center;">PLT</th>
                              <th style="text-align:center;">FORKLIFT REQ</th>
                              <th>NOTES</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${stagingItems.map(item => `
                              <tr>
                                <td style="font-family: monospace; font-weight: bold;">${item.workOrderNo}</td>
                                <td style="font-weight: bold;">${item.customerShortName}</td>
                                <td>${item.warehouseLocation}</td>
                                <td style="text-align:center; font-family: monospace;">${item.box}</td>
                                <td style="text-align:center; font-family: monospace;">${item.bundle}</td>
                                <td style="text-align:center; font-family: monospace;">${item.plt}</td>
                                <td style="text-align:center;">${item.forkliftReq ? '<span class="badge-yes">YES</span>' : '<span class="badge-no">NO</span>'}</td>
                                <td style="font-size: 9px; color: #64748b;">${item.notes || '-'}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>

                        <div class="summary-box">
                          <div>TOTAL WORK ORDERS: ${stagingItems.length}</div>
                          <div>TOTAL BOXES: ${totalBoxes}</div>
                          <div>TOTAL BUNDLES: ${totalBundles}</div>
                          <div>TOTAL PALLETS (PLT): ${totalPlts}</div>
                          <div>FORKLIFT REQUIRED: ${forkliftCount} ORDERS</div>
                        </div>

                        <div class="footer">
                          <div>Prepared By: ___________________</div>
                          <div>Yard Supervisor: ___________________</div>
                          <div>Security Gate Sign: ___________________</div>
                        </div>

                      </body>
                      </html>
                    `;
                    printHtml(sheetDocHtml, `Dispatch Location - ${activeCompany.name}`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Sheet
                </button>
                <button 
                  onClick={() => setShowStagingPreviewModal(false)} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview Sheet Body */}
            <div className="overflow-y-auto flex-1 p-5 bg-slate-50/70 rounded-xl border border-slate-200">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-center pb-4 mb-4 border-b-2 border-slate-900">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{activeCompany.name}</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">{activeCompany.address || 'Industrial Area, UAE'} | <strong>TRN: {activeCompany.trn || '100440509600003'}</strong></p>
                  <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-[11px] font-black tracking-wider uppercase rounded-md">
                    WORK ORDER MATERIALS DISPATCH LOCATION SCHEDULE
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10.5px] text-slate-600 mb-3 px-1">
                  <span><strong>DATE:</strong> {new Date().toLocaleDateString('en-GB')}</span>
                  <span><strong>TOTAL WORK ORDERS:</strong> {stagingItems.length}</span>
                  <span><strong>SUPERVISOR:</strong> {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Operations Yard Lead'}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold text-left">
                        <th className="p-2 rounded-tl-lg">WORK ORDER NO</th>
                        <th className="p-2">CUSTOMER (SHORT NAME)</th>
                        <th className="p-2">WAREHOUSE LOCATION</th>
                        <th className="p-2 text-center">BOX</th>
                        <th className="p-2 text-center">BUNDLE</th>
                        <th className="p-2 text-center">PLT</th>
                        <th className="p-2 text-center">FORKLIFT REQ</th>
                        <th className="p-2 rounded-tr-lg">NOTES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stagingItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-400 font-medium italic">
                            No active work orders currently staged in materials dispatch location.
                          </td>
                        </tr>
                      ) : (
                        stagingItems.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="p-2 font-mono font-bold text-indigo-900">{item.workOrderNo}</td>
                            <td className="p-2 font-bold text-slate-900">{item.customerShortName}</td>
                            <td className="p-2 font-mono text-slate-700">{item.warehouseLocation}</td>
                            <td className="p-2 text-center font-mono font-bold text-sky-800">{item.box}</td>
                            <td className="p-2 text-center font-mono font-bold text-amber-800">{item.bundle}</td>
                            <td className="p-2 text-center font-mono font-bold text-purple-800">{item.plt}</td>
                            <td className="p-2 text-center">
                              {item.forkliftReq ? (
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] border border-emerald-200">YES</span>
                              ) : (
                                <span className="text-slate-500 text-[9px]">NO</span>
                              )}
                            </td>
                            <td className="p-2 text-[10px] text-slate-500 max-w-[140px] truncate">{item.notes || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 p-3 bg-slate-100/80 rounded-lg text-xs font-bold text-slate-800">
                  <div>TOTAL ORDERS: <span className="font-mono text-indigo-900">{stagingItems.length}</span></div>
                  <div>TOTAL BOXES: <span className="font-mono text-sky-900">{stagingItems.reduce((s, it) => s + (Number(it.box) || 0), 0)}</span></div>
                  <div>TOTAL BUNDLES: <span className="font-mono text-amber-900">{stagingItems.reduce((s, it) => s + (Number(it.bundle) || 0), 0)}</span></div>
                  <div>TOTAL PALLETS: <span className="font-mono text-purple-900">{stagingItems.reduce((s, it) => s + (Number(it.plt) || 0), 0)}</span></div>
                </div>

                {/* Sign-off footer */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-600">
                  <div className="border-t border-slate-300 pt-1 text-center font-medium">Yard Supervisor Sign</div>
                  <div className="border-t border-slate-300 pt-1 text-center font-medium">Logistics Dispatcher Sign</div>
                  <div className="border-t border-slate-300 pt-1 text-center font-medium">Security Gate Clearance</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100 shrink-0">
              <button 
                type="button"
                onClick={() => setShowStagingPreviewModal(false)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DISPATCHED MATERIALS RECORDS MODAL (ARCHIVE HISTORY)
      ========================================================= */}
      {showDispatchedRecordsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200/90 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center shadow-2xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Dispatched Materials Records History</h3>
                    <span className="text-[9.5px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                      {dispatchedRecords.length} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Completed and fulfilled work orders dispatched from {activeCompany.name}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowDispatchedRecordsModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and search */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Work Order, Customer, Location..."
                  value={dispatchedSearchQuery}
                  onChange={(e) => setDispatchedSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-slate-800 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {dispatchedRecords.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const printRecordHtml = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Dispatched Materials Records - ${activeCompany.name}</title>
                        <style>
                          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 20px; color: #1e293b; font-size: 11px; }
                          .header { text-align: center; border-bottom: 2px solid #083c54; padding-bottom: 10px; margin-bottom: 15px; }
                          .company-title { font-size: 18px; font-weight: bold; color: #083c54; text-transform: uppercase; margin: 0; }
                          .doc-title { font-size: 14px; font-weight: bold; margin-top: 5px; color: #334155; }
                          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                          th { background: #083c54; color: white; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
                          td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; font-size: 10px; }
                          tr:nth-child(even) { background-color: #f8fafc; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 class="company-title">${activeCompany.name}</h1>
                          <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">${activeCompany.address || 'Industrial Area, UAE'} | TRN: ${activeCompany.trn || '100440509600003'}</div>
                          <div class="doc-title">DISPATCHED MATERIALS RECORDS ARCHIVE</div>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>DISPATCH DATE</th>
                              <th>WORK ORDER NO</th>
                              <th>CUSTOMER</th>
                              <th>LOCATION</th>
                              <th style="text-align:center;">BOX</th>
                              <th style="text-align:center;">BUNDLE</th>
                              <th style="text-align:center;">PLT</th>
                              <th>DISPATCHED BY</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${dispatchedRecords.map(r => `
                              <tr>
                                <td>${r.dispatchedAt ? new Date(r.dispatchedAt).toLocaleDateString('en-GB') : '—'}</td>
                                <td style="font-family: monospace; font-weight: bold;">${r.workOrderNo}</td>
                                <td>${r.customerShortName}</td>
                                <td>${r.warehouseLocation}</td>
                                <td style="text-align:center;">${r.box}</td>
                                <td style="text-align:center;">${r.bundle}</td>
                                <td style="text-align:center;">${r.plt}</td>
                                <td>${r.dispatchedBy || 'Supervisor'}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </body>
                      </html>
                    `;
                    printHtml(printRecordHtml, `Dispatched Materials Records - ${activeCompany.name}`);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Records Summary
                </button>
              )}
            </div>

            {/* Records Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 sticky top-0">
                  <tr>
                    <th className="p-3">Dispatched Date</th>
                    <th className="p-3">Work Order No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Location</th>
                    <th className="p-3 text-center">Box</th>
                    <th className="p-3 text-center">Bundle</th>
                    <th className="p-3 text-center">PLT</th>
                    <th className="p-3 text-center">Handling</th>
                    <th className="p-3">Dispatched By</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchedRecords
                    .filter(rec => {
                      const q = dispatchedSearchQuery.toLowerCase();
                      return !q || 
                        rec.workOrderNo.toLowerCase().includes(q) ||
                        rec.customerShortName.toLowerCase().includes(q) ||
                        rec.warehouseLocation.toLowerCase().includes(q) ||
                        (rec.notes || '').toLowerCase().includes(q);
                    })
                    .map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {rec.dispatchedAt ? new Date(rec.dispatchedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Fulfilled'}
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-900">
                          {rec.workOrderNo}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {rec.customerShortName}
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          {rec.warehouseLocation}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-sky-800">
                          {rec.box}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-amber-800">
                          {rec.bundle}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-purple-800">
                          {rec.plt}
                        </td>
                        <td className="p-3 text-center">
                          {rec.forkliftReq ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[8.5px] border border-emerald-200">PLT</span>
                          ) : (
                            <span className="text-slate-500 text-[8.5px]">LOOSE</span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600">
                          {rec.dispatchedBy || 'Yard Lead'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Re-stage / Restore to Active List button */}
                            <button
                              type="button"
                              onClick={() => {
                                const restoredItem: WorkOrderStagingItem = {
                                  ...rec,
                                  status: 'STAGED',
                                  dispatched: false
                                };
                                updateStagingItems([restoredItem, ...stagingItems]);
                                updateDispatchedRecords(dispatchedRecords.filter(r => r.id !== rec.id));
                                triggerToast(`Work order ${rec.workOrderNo} restored back to active materials dispatch location.`);
                              }}
                              className="px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                              title="Restore back to active staging list"
                            >
                              Re-stage
                            </button>

                            {/* Delete Record Button */}
                            <button
                              type="button"
                              onClick={() => {
                                updateDispatchedRecords(dispatchedRecords.filter(r => r.id !== rec.id));
                                triggerToast(`Record for ${rec.workOrderNo} deleted from archive.`);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Archive Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {dispatchedRecords.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">
                        <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600 text-xs">No dispatched records found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">When you mark a work order as DISPATCHED in Edit mode, it will be safely archived here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100 shrink-0">
              <button 
                type="button"
                onClick={() => setShowDispatchedRecordsModal(false)} 
                className="px-4 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
