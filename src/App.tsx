import React, { useState, useEffect, useMemo } from 'react';
import WelcomeLoginGate from './components/WelcomeLoginGate';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ProductsView from './components/ProductsView';
import StockReportsView from './components/StockReportsView';
import TechnicalView from './components/TechnicalView';
import WorkflowView from './components/WorkflowView';
import ErpView from './components/ErpView';
import FixedAssetComponent from './components/FixedAssetComponent';
import QuotationView from './components/QuotationView';
import { EditCompanyModal } from './components/EditCompanyModal';
import ListOfVoucherTypesModal from './components/ListOfVoucherTypesModal';
import ListOfCompaniesModal from './components/ListOfCompaniesModal';
import VoucherDateModal from './components/VoucherDateModal';
import GatewayStockEntryModal from './components/GatewayStockEntryModal';
import GlobalSpotlightSearchModal from './components/GlobalSpotlightSearchModal';
import LoginTransitionOverlay from './components/LoginTransitionOverlay';
import { playLoginSound } from './utils/audioChimes';
import { getCompaniesList, getActiveCompany, setActiveCompanyId, CompanyProfile, getUserCompanies } from './utils/companyProfile';
import { Category, WarehouseLayout, HexPhoto, AppUser } from './types';
import { 
  getInitialStandardsProducts, 
  getInitialFineThreadUNF, 
  INITIAL_WAREHOUSE_LAYOUTS, 
  INITIAL_HEX_PHOTOS,
  loadStandardsProductsWithMerge,
  loadFineThreadProductsWithMerge
} from './initialData';
import { 
  RotateCcw, 
  AlertTriangle, 
  EyeOff, 
  LayoutDashboard, 
  Database, 
  HelpCircle, 
  Mail, 
  HelpCircle as HelpIcon,
  Home,
  TrendingUp,
  Package,
  Landmark,
  FileText,
  ShieldCheck,
  ClipboardList,
  FileCheck,
  Settings,
  User,
  Search,
  Check,
  Building2,
  ChevronDown,
  PlusCircle,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

// Helper function to convert random tree IDs to predictable stable name-based IDs
function ensureStableIds(categories: Category[]): Category[] {
  return categories.map(cat => {
    const catClean = (cat.name || 'cat').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
    const catId = `cat_${catClean}`;
    return {
      ...cat,
      id: catId,
      subcategories: (cat.subcategories || []).map(sub => {
        const subClean = (sub.name || 'sub').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
        const subId = `${catId}_sub_${subClean}`;
        return {
          ...sub,
          id: subId,
          threadTypes: (sub.threadTypes || []).map(tt => {
            const ttClean = (tt.name || 'tt').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
            const ttId = `${subId}_tt_${ttClean}`;
            return {
              ...tt,
              id: ttId,
              grades: (tt.grades || []).map(g => {
                const gClean = (g.name || 'grade').trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
                const gId = `${ttId}_grade_${gClean}`;
                return {
                  ...g,
                  id: gId
                };
              })
            };
          })
        };
      })
    };
  });
}

export default function App() {
  const [isIframe, setIsIframe] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setIsIframe(true);
    }
  }, []);

  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'products' | 'technical' | 'workflow' | 'erp' | 'stores_qc' | 'fixed_asset' | 'quotation'>('home');
  const [inventorySubTab, setInventorySubTab] = useState<'report' | 'editor'>('report');

  // App-level Toast System
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load and apply global font/size/typography preferences on boot
  useEffect(() => {
    const savedFont = localStorage.getItem('mf_font_family') || 'Plus Jakarta Sans';
    const savedSize = localStorage.getItem('mf_font_size') || 'compact';
    const savedScale = parseInt(localStorage.getItem('mf_font_scale') || '100', 10);
    const savedLineHeight = localStorage.getItem('mf_line_height') || 'standard';
    const savedLetterSpacing = localStorage.getItem('mf_letter_spacing') || 'normal';
    const savedHighContrast = localStorage.getItem('mf_high_contrast') === 'true';
    const savedTabularNums = localStorage.getItem('mf_tabular_nums') !== 'false';
    const savedUppercaseHeaders = localStorage.getItem('mf_uppercase_headers') !== 'false';
    
    let styleEl = document.getElementById('custom-font-settings-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-font-settings-style';
      document.head.appendChild(styleEl);
    }
    
    const sizeBaseMap: Record<string, number> = {
      'micro': 10.5,
      'compact': 11.5,
      'standard': 13.0,
      'comfortable': 14.0,
      'spacious': 15.0
    };
    
    const basePx = sizeBaseMap[savedSize] || 11.5;
    const finalPx = ((basePx * savedScale) / 100).toFixed(2);

    const lineHeightMap: Record<string, string> = {
      'compact': '1.25',
      'standard': '1.45',
      'relaxed': '1.65'
    };

    const trackingMap: Record<string, string> = {
      'dense': '-0.02em',
      'normal': '0em',
      'wide': '0.03em',
      'mono': '0.05em'
    };
    
    styleEl.innerHTML = `
      html {
        font-size: ${finalPx}px !important;
      }
      body, button, input, select, textarea, div, span, table, th, td, p, h1, h2, h3, h4, h5, h6, a, li, label, option {
        font-family: "${savedFont}", "Plus Jakarta Sans", "Open Sans", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif !important;
        line-height: ${lineHeightMap[savedLineHeight] || '1.45'} !important;
        letter-spacing: ${trackingMap[savedLetterSpacing] || '0em'} !important;
      }
      :root {
        --font-sans: "${savedFont}", "Plus Jakarta Sans", "Open Sans", "Helvetica Neue", ui-sans-serif, system-ui, sans-serif !important;
      }
      ${savedHighContrast ? `
        .text-slate-400, .text-slate-500 { color: #334155 !important; }
        .text-slate-600 { color: #1e293b !important; font-weight: 600 !important; }
        body { color: #020617 !important; }
      ` : ''}
      ${savedTabularNums ? `
        table td, .font-mono, [data-num="true"] {
          font-variant-numeric: tabular-nums lining-nums !important;
        }
      ` : ''}
      ${savedUppercaseHeaders ? `
        table th { text-transform: uppercase !important; }
      ` : ''}
    `;
  }, []);

  const [showVoucherTypesModal, setShowVoucherTypesModal] = useState(false);
  const [showCompaniesModal, setShowCompaniesModal] = useState(false);
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [showVoucherDateModal, setShowVoucherDateModal] = useState(false);
  const [showLoginTransition, setShowLoginTransition] = useState(false);
  const [transitionUser, setTransitionUser] = useState<AppUser | null>(null);

  const handleSetTab = (tab: string) => {
    if (tab === 'quotation' || tab === 'quotations' || tab === 'quotation_suite') {
      setCurrentTab('quotation');
      return;
    }

    const storesQcTabs = [
      'purchase', 'purchase_req_record', 'incoming_materials', 'goods_dispatched_notes',
      'machineries_list', 'tools_list', 'packaging_materials', 'punching_stamp_lists',
      'coating_accessories', 'data_sheets', 'drawings_register', 'qc_reports'
    ];

    const erpTabs = [
      'work_orders_suite', 'invoice', 'supplier_purchase', 'contra', 'payment', 'receipt',
      'journal', 'debit_note', 'credit_note', 'delivery_notes', 'packing_list', 'customer',
      'customer_order_commission', 'for_invoice_cust', 'for_pl_cust',
      'invoice_record', 'quotations_record', 'delivery_notes_record', 'supplier_purchase_records', 'work_orders_records',
      'packing_list_record', 'receipt_record', 'credit_note_record', 'debit_note_record',
      'contra_record', 'journal_record', 'customer_order_commission_records',
      'sales_report', 'purchase_report', 'stock_reports', 'balance_sheet', 'profit_loss', 'ratio_analysis',
      'aging_statements', 'final_accounts', 'seller_performance', 'uae_vat_returns', 'payroll_reports',
      'customer_soa', 'particulars_ledger', 'bank_accounts_box', 'bank_account_box',
      'incoming_materials_payments_update', 'outgoing_materials_payments_update', 'transporter_payments',
      'daybook', 'expenses_view', 'banking'
    ];

    if (storesQcTabs.includes(tab)) {
      localStorage.setItem('mf_stores_qc_active_tab', tab);
      localStorage.setItem('mf_erp_active_tab', tab);
      window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: tab }));
      window.dispatchEvent(new Event('erp_tab_reset'));
      setCurrentTab('stores_qc');
      return;
    }

    if (erpTabs.includes(tab) || tab === 'sales_report') {
      const targetTab = tab === 'banking' ? 'customer_soa' : tab;
      localStorage.setItem('mf_erp_active_tab', targetTab);
      window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: targetTab }));
      window.dispatchEvent(new Event('erp_tab_reset'));
      setCurrentTab('erp');
      return;
    }

    if (tab === 'erp') {
      const savedErpTab = localStorage.getItem('mf_erp_active_tab') || 'customer';
      window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: savedErpTab }));
      window.dispatchEvent(new Event('erp_tab_reset'));
      setCurrentTab('erp');
      return;
    } else if (tab === 'stores_qc') {
      const savedStoresTab = localStorage.getItem('mf_stores_qc_active_tab') || 'goods_dispatched_notes';
      window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: savedStoresTab }));
      window.dispatchEvent(new Event('erp_tab_reset'));
      setCurrentTab('stores_qc');
      return;
    }

    setCurrentTab(tab as any);
  };
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Theme state: Day/Night Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('MFI_DARK_MODE') === 'true';
  });

  // Sync dark mode style on mount & change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Notifications states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsFilter, setNotificationsFilter] = useState<'all' | 'document' | 'alert'>('all');

  const fetchNotifications = () => {
    try {
      const raw = localStorage.getItem('MFI_NOTIFICATIONS');
      if (raw) {
        setNotifications(JSON.parse(raw));
      } else {
        const welcomeNotifs = [
          {
            id: 'notif_welcome_1',
            title: `Welcome to ${activeCompany?.name || 'Enterprise'} ERP`,
            message: `Your high-fidelity industrial resource planning system is active for ${activeCompany?.name || 'your enterprise'}.`,
            type: 'alert',
            date: new Date().toISOString().split('T')[0],
            time: '08:00 AM',
            read: false
          }
        ];
        localStorage.setItem('MFI_NOTIFICATIONS', JSON.stringify(welcomeNotifs));
        setNotifications(welcomeNotifs);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    // Listen to local document creation events
    const handleStorageChange = () => {
      fetchNotifications();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Multi-Company State & Switcher
  const [companiesList, setCompaniesList] = useState<CompanyProfile[]>(getCompaniesList);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [companyModalInitialId, setCompanyModalInitialId] = useState<string | undefined>(undefined);

  // User Authenticated State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('mf_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse current user", e);
      }
    }
    return null;
  });

  // Effective companies scoped strictly to the current user
  const effectiveCompaniesList = useMemo(() => {
    return getUserCompanies(currentUser, companiesList);
  }, [currentUser, companiesList]);

  // Sync active company with user permissions
  useEffect(() => {
    if (currentUser) {
      const allowed = getUserCompanies(currentUser, getCompaniesList());
      if (allowed.length > 0) {
        const isCurrentAllowed = allowed.some(c => c.id === activeCompany.id);
        if (!isCurrentAllowed) {
          setActiveCompanyId(allowed[0].id);
          setActiveCompany(allowed[0]);
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const handleCompaniesUpdated = (e: any) => {
      const updatedList = getCompaniesList();
      setCompaniesList(updatedList);
      const currentActive = getActiveCompany();
      setActiveCompany(currentActive);
    };
    const handleActiveCompanyChanged = (e: any) => {
      const currentActive = getActiveCompany();
      setActiveCompany(currentActive);
    };

    window.addEventListener('companies_list_updated', handleCompaniesUpdated);
    window.addEventListener('active_company_changed', handleActiveCompanyChanged);
    window.addEventListener('company_profile_updated', handleActiveCompanyChanged);

    return () => {
      window.removeEventListener('companies_list_updated', handleCompaniesUpdated);
      window.removeEventListener('active_company_changed', handleActiveCompanyChanged);
      window.removeEventListener('company_profile_updated', handleActiveCompanyChanged);
    };
  }, [currentUser]);

  const handleSwitchCompany = (comp: CompanyProfile) => {
    setActiveCompanyId(comp.id);
    setActiveCompany(comp);
    setShowCompanyMenu(false);
    triggerToast(`Switched active entity to ${comp.name}`);
  };

  const handleOpenAddCompany = () => {
    setShowCompanyMenu(false);
    setCompanyModalInitialId(undefined);
    setIsEditCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (companyId: string) => {
    setShowCompanyMenu(false);
    setCompanyModalInitialId(companyId);
    setIsEditCompanyModalOpen(true);
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'erp', label: 'Financials', icon: TrendingUp },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'fixed_asset', label: 'Fixed Asset', icon: Landmark },
    { id: 'technical', label: 'Technical Specs', icon: FileText },
    { id: 'stores_qc', label: 'Quality Control', icon: ShieldCheck },
    { id: 'workflow', label: 'Work Orders', icon: ClipboardList },
    { id: 'quotation', label: 'Quotation', icon: FileCheck },
    { id: 'about', label: 'Settings', icon: Settings },
  ] as const;

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('mf_current_user', JSON.stringify(user));
    const allCompanies = getCompaniesList();
    let targetCompany: CompanyProfile | undefined;
    if (user.companyId) {
      targetCompany = allCompanies.find(c => c.id === user.companyId);
    }
    if (!targetCompany) {
      const allowed = getUserCompanies(user, allCompanies);
      if (allowed.length > 0) {
        targetCompany = allowed[0];
      }
    }
    if (targetCompany) {
      setActiveCompanyId(targetCompany.id);
      setActiveCompany(targetCompany);
    }
    setTransitionUser(user);
    setShowLoginTransition(true);
    setCurrentTab('home');
  };

  // Global ERP shortcuts: Ctrl+R (Spotlight Search), F2-F12 and Alt+F1-Alt+F9
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Global Search: Ctrl+R / Cmd+R / Ctrl+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R' || e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShowGlobalSearchModal(prev => !prev);
        return;
      }

      // If any modal is currently open, suppress global shortcut triggers so the modal has exclusive focus lock
      if (
        showGlobalSearchModal ||
        showVoucherTypesModal ||
        showCompaniesModal ||
        showStockEntryModal ||
        showVoucherDateModal ||
        isEditCompanyModalOpen ||
        showResetConfirm ||
        showLoginTransition
      ) {
        return;
      }

      // Quick Stock Entry shortcut (+)
      const isPlusKey = e.key === '+' || (e.key === '=' && e.shiftKey) || e.code === 'NumpadAdd';
      if (isPlusKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.tagName === 'SELECT' || 
          (activeEl as HTMLElement).isContentEditable
        );
        if (!isInputActive) {
          e.preventDefault();
          setShowStockEntryModal(true);
          return;
        }
      }

      // Check for Alt modifier
      const isAlt = e.altKey;

      if (e.key === 'F1') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('incoming_materials');
          triggerToast('Goods Return Notes (Alt+F1)');
        } else {
          setShowVoucherTypesModal(true);
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('quotation');
          triggerToast('Coating Delivery Note (Alt+F2)');
        } else {
          setShowVoucherDateModal(true);
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('delivery_notes');
          triggerToast('Standard Delivery Note (Alt+F3)');
        } else {
          setShowCompaniesModal(true);
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('work_orders_suite');
          triggerToast('Work Order Voucher (Alt+F4)');
        } else {
          handleSetTab('contra');
          triggerToast('Contra Voucher (F4)');
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('debit_note');
          triggerToast('Debit Note Voucher (Alt+F5)');
        } else {
          handleSetTab('payment');
          triggerToast('Payment Voucher (F5)');
        }
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('credit_note');
          triggerToast('Credit Notes Voucher (Alt+F6)');
        } else {
          handleSetTab('receipt');
          triggerToast('Receipt Voucher (F6)');
        }
      } else if (e.key === 'F7') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('workflow');
          triggerToast('Stock Journal Voucher (Alt+F7)');
        } else {
          handleSetTab('journal');
          triggerToast('Journal Voucher (F7)');
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('invoice_record');
          triggerToast('Proforma Invoice (Alt+F8)');
        } else {
          handleSetTab('invoice');
          triggerToast('Sales Voucher / Tax Invoice (F8)');
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (isAlt) {
          handleSetTab('customer_soa');
          triggerToast('Statement of Accounts (Alt+F9)');
        } else {
          handleSetTab('supplier_purchase');
          triggerToast('Purchase Voucher (F9)');
        }
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleSetTab('stock_reports');
        triggerToast('Stock Ledger Sheet (F10)');
      } else if (e.key === 'F11') {
        e.preventDefault();
        handleSetTab('packing_list');
        triggerToast('Packing List (F11)');
      } else if (e.key === 'F12') {
        e.preventDefault();
        handleSetTab('quotation');
        triggerToast('Quotation Voucher (F12)');
      }
    };

    const handleOpenSpotlight = () => setShowGlobalSearchModal(true);
    const handleOpenQuickStock = () => setShowStockEntryModal(true);
    window.addEventListener('open_spotlight_search', handleOpenSpotlight);
    window.addEventListener('open_quick_stock_entry', handleOpenQuickStock);
    window.addEventListener('keydown', handleGlobalShortcuts, true);
    return () => {
      window.removeEventListener('open_spotlight_search', handleOpenSpotlight);
      window.removeEventListener('open_quick_stock_entry', handleOpenQuickStock);
      window.removeEventListener('keydown', handleGlobalShortcuts, true);
    };
  }, [
    showGlobalSearchModal,
    showVoucherTypesModal,
    showCompaniesModal,
    showStockEntryModal,
    showVoucherDateModal,
    isEditCompanyModalOpen,
    showResetConfirm,
    showLoginTransition,
  ]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mf_current_user');
  };

  // Helper function to strip pre-seeded product rows
  const stripProductRows = (categories: Category[]): Category[] => {
    return categories.map(c => ({
      ...c,
      subcategories: (c.subcategories || []).map(s => ({
        ...s,
        threadTypes: (s.threadTypes || []).map(tt => ({
          ...tt,
          grades: (tt.grades || []).map(g => ({
            ...g,
            rows: []
          }))
        }))
      }))
    }));
  };

  // Core Persistent State
  const [standardsProducts, setStandardsProductsRaw] = useState<Category[]>(() => {
    // Force-restore migration to reset browser storage to the 1st version
    const forceRestored = localStorage.getItem('mf_force_restore_v8');
    if (!forceRestored) {
      localStorage.removeItem('mf_std_products');
      localStorage.removeItem('mf_fine_products');
      localStorage.setItem('mf_force_restore_v8', 'true');
    }

    const saved = localStorage.getItem('mf_std_products');
    let products: Category[];
    const initialList = getInitialStandardsProducts();
    if (saved) {
      products = loadStandardsProductsWithMerge(saved).filter(c => initialList.some(initCat => initCat.name.toLowerCase() === c.name.toLowerCase()));
    } else {
      products = initialList;
    }
    return ensureStableIds(products);
  });

  const [fineThreadProducts, setFineThreadProductsRaw] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mf_fine_products');
    let products: Category[];
    if (saved) {
      products = loadFineThreadProductsWithMerge(saved);
    } else {
      products = getInitialFineThreadUNF();
    }
    return ensureStableIds(products);
  });

  // Wrappers to automatically intercept state changes and ensure stable name-based IDs
  const setStandardsProducts = React.useCallback((val: Category[] | ((prev: Category[]) => Category[])) => {
    setStandardsProductsRaw(prev => {
      const updated = typeof val === 'function' ? val(prev) : val;
      return ensureStableIds(updated);
    });
  }, []);

  const setFineThreadProducts = React.useCallback((val: Category[] | ((prev: Category[]) => Category[])) => {
    setFineThreadProductsRaw(prev => {
      const updated = typeof val === 'function' ? val(prev) : val;
      return ensureStableIds(updated);
    });
  }, []);

  const [warehouseLayouts, setWarehouseLayouts] = useState<WarehouseLayout[]>(() => {
    const saved = localStorage.getItem('mf_warehouse_layouts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse warehouse layouts", e);
      }
    }
    return INITIAL_WAREHOUSE_LAYOUTS;
  });

  const [hexPhotos, setHexPhotos] = useState<HexPhoto[]>(() => {
    const saved = localStorage.getItem('mf_hex_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse hex photos", e);
      }
    }
    return INITIAL_HEX_PHOTOS;
  });

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Corporate Real-Time Database Synchronization Engine
  useEffect(() => {
    let lastKnownHash = "";
    let isInitialized = false;
    
    const getCurrentStatePayload = () => {
      const std = localStorage.getItem('mf_std_products') || "[]";
      const fine = localStorage.getItem('mf_fine_products') || "[]";
      const drawings = localStorage.getItem('mf_fastener_drawings_v2') || "{}";
      const layouts = localStorage.getItem('mf_warehouse_layouts') || "[]";
      const photos = localStorage.getItem('mf_hex_photos') || "[]";
      const users = localStorage.getItem('mf_registered_users') || "[]";
      const operatorsList = localStorage.getItem('MFI_OPERATORS_LIST') || "[]";
      const otRecords = localStorage.getItem('MFI_OVERTIME_RECORDS') || "[]";
      return { std, fine, drawings, layouts, photos, users, operatorsList, otRecords };
    };

    const runSync = async () => {
      try {
        const local = getCurrentStatePayload();
        const localHash = JSON.stringify(local);

        if (!isInitialized) {
          // A. FIRST-TIME LOAD: Request current state from Central Cloud storage on startup
          const response = await fetch('/api/get-state');
          if (response.ok) {
            const data = await response.json();
            if (data && data.syncedAt) {
              // Existing Cloud DB data exists - download and populate locally
              let localChanged = false;

              if (data.standardsProducts && JSON.stringify(data.standardsProducts) !== local.std) {
                localStorage.setItem('mf_std_products', JSON.stringify(data.standardsProducts));
                setStandardsProductsRaw(data.standardsProducts);
                localChanged = true;
              }
              if (data.fineThreadProducts && JSON.stringify(data.fineThreadProducts) !== local.fine) {
                localStorage.setItem('mf_fine_products', JSON.stringify(data.fineThreadProducts));
                setFineThreadProductsRaw(data.fineThreadProducts);
                localChanged = true;
              }
              if (data.attachedSpecs && JSON.stringify(data.attachedSpecs) !== local.drawings) {
                localStorage.setItem('mf_fastener_drawings_v2', JSON.stringify(data.attachedSpecs));
                localChanged = true;
              }
              if (data.warehouseLayouts && JSON.stringify(data.warehouseLayouts) !== local.layouts) {
                localStorage.setItem('mf_warehouse_layouts', JSON.stringify(data.warehouseLayouts));
                setWarehouseLayouts(data.warehouseLayouts);
                localChanged = true;
              }
              if (data.hexPhotos && JSON.stringify(data.hexPhotos) !== local.photos) {
                localStorage.setItem('mf_hex_photos', JSON.stringify(data.hexPhotos));
                setHexPhotos(data.hexPhotos);
                localChanged = true;
              }
              if (data.registeredUsers && JSON.stringify(data.registeredUsers) !== local.users) {
                localStorage.setItem('mf_registered_users', JSON.stringify(data.registeredUsers));
                localChanged = true;
              }
              if (data.operatorsList && JSON.stringify(data.operatorsList) !== local.operatorsList) {
                localStorage.setItem('MFI_OPERATORS_LIST', JSON.stringify(data.operatorsList));
                localChanged = true;
              }
              if (data.otRecords && JSON.stringify(data.otRecords) !== local.otRecords) {
                localStorage.setItem('MFI_OVERTIME_RECORDS', JSON.stringify(data.otRecords));
                localChanged = true;
              }

              // Re-fetch payload to set the correct baseline after merge
              const refreshed = getCurrentStatePayload();
              lastKnownHash = JSON.stringify(refreshed);
              setLastSynced(new Date().toLocaleTimeString());
              isInitialized = true;

              // Force update active session of the user with their updated synchronized role
              const currentSession = localStorage.getItem('mf_current_user');
              if (currentSession) {
                try {
                  const currUserObj = JSON.parse(currentSession);
                  const updatedUserRec = data.registeredUsers?.find(
                    (u: any) => u.uniqueId?.trim().toUpperCase() === currUserObj.uniqueId?.trim().toUpperCase()
                  );
                  if (updatedUserRec && JSON.stringify(updatedUserRec) !== currentSession) {
                    setCurrentUser(updatedUserRec);
                    localStorage.setItem('mf_current_user', JSON.stringify(updatedUserRec));
                  }
                } catch (e) {
                  console.error("Failed to parse current session on initialize reload:", e);
                }
              }
            } else {
              // Cloud DB is empty (never synced, e.g. first container boot) - upload default data
              setIsCloudSyncing(true);
              const seedResponse = await fetch('/api/save-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  standardsProducts: JSON.parse(local.std),
                  fineThreadProducts: JSON.parse(local.fine),
                  attachedSpecs: JSON.parse(local.drawings),
                  warehouseLayouts: JSON.parse(local.layouts),
                  hexPhotos: JSON.parse(local.photos),
                  registeredUsers: JSON.parse(local.users),
                  operatorsList: JSON.parse(local.operatorsList),
                  otRecords: JSON.parse(local.otRecords)
                })
              });
              if (seedResponse.ok) {
                lastKnownHash = localHash;
                setLastSynced(new Date().toLocaleTimeString());
              }
              setIsCloudSyncing(false);
              isInitialized = true;
            }
          } else {
            // Failed fetch fallback - mark initialized to unblock local inputs
            isInitialized = true;
          }
          return;
        }

        // B. SUBSEQUENT RUNS: Sync state bidirectional after initialization
        if (localHash !== lastKnownHash) {
          // 1. If local data was changed by the user in this browser, upload to server
          setIsCloudSyncing(true);
          const response = await fetch('/api/save-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              standardsProducts: JSON.parse(local.std),
              fineThreadProducts: JSON.parse(local.fine),
              attachedSpecs: JSON.parse(local.drawings),
              warehouseLayouts: JSON.parse(local.layouts),
              hexPhotos: JSON.parse(local.photos),
              registeredUsers: JSON.parse(local.users),
              operatorsList: JSON.parse(local.operatorsList),
              otRecords: JSON.parse(local.otRecords)
            })
          });
          if (response.ok) {
            lastKnownHash = localHash;
            setLastSynced(new Date().toLocaleTimeString());
          }
          setIsCloudSyncing(false);
        } else {
          // 2. Otherwise request any updates uploaded by other logging-in members
          const response = await fetch('/api/get-state');
          if (response.ok) {
            const data = await response.json();
            if (data && data.syncedAt) {
              let updatedAny = false;

              if (data.standardsProducts && JSON.stringify(data.standardsProducts) !== local.std) {
                localStorage.setItem('mf_std_products', JSON.stringify(data.standardsProducts));
                setStandardsProductsRaw(data.standardsProducts);
                updatedAny = true;
              }
              if (data.fineThreadProducts && JSON.stringify(data.fineThreadProducts) !== local.fine) {
                localStorage.setItem('mf_fine_products', JSON.stringify(data.fineThreadProducts));
                setFineThreadProductsRaw(data.fineThreadProducts);
                updatedAny = true;
              }
              if (data.attachedSpecs && JSON.stringify(data.attachedSpecs) !== local.drawings) {
                localStorage.setItem('mf_fastener_drawings_v2', JSON.stringify(data.attachedSpecs));
                updatedAny = true;
              }
              if (data.warehouseLayouts && JSON.stringify(data.warehouseLayouts) !== local.layouts) {
                localStorage.setItem('mf_warehouse_layouts', JSON.stringify(data.warehouseLayouts));
                setWarehouseLayouts(data.warehouseLayouts);
                updatedAny = true;
              }
              if (data.hexPhotos && JSON.stringify(data.hexPhotos) !== local.photos) {
                localStorage.setItem('mf_hex_photos', JSON.stringify(data.hexPhotos));
                setHexPhotos(data.hexPhotos);
                updatedAny = true;
              }
              if (data.registeredUsers && JSON.stringify(data.registeredUsers) !== local.users) {
                localStorage.setItem('mf_registered_users', JSON.stringify(data.registeredUsers));
                updatedAny = true;
              }
              if (data.operatorsList && JSON.stringify(data.operatorsList) !== local.operatorsList) {
                localStorage.setItem('MFI_OPERATORS_LIST', JSON.stringify(data.operatorsList));
                updatedAny = true;
              }
              if (data.otRecords && JSON.stringify(data.otRecords) !== local.otRecords) {
                localStorage.setItem('MFI_OVERTIME_RECORDS', JSON.stringify(data.otRecords));
                updatedAny = true;
              }

              if (updatedAny) {
                const refreshed = getCurrentStatePayload();
                lastKnownHash = JSON.stringify(refreshed);
                setLastSynced(new Date().toLocaleTimeString());

                // Update active user role in current session if edited/assigned on another browser
                const currentSession = localStorage.getItem('mf_current_user');
                if (currentSession) {
                  try {
                    const currUserObj = JSON.parse(currentSession);
                    const updatedUserRec = data.registeredUsers?.find(
                      (u: any) => u.uniqueId?.trim().toUpperCase() === currUserObj.uniqueId?.trim().toUpperCase()
                    );
                    if (updatedUserRec && JSON.stringify(updatedUserRec) !== currentSession) {
                      setCurrentUser(updatedUserRec);
                      localStorage.setItem('mf_current_user', JSON.stringify(updatedUserRec));
                    }
                  } catch (e) {
                    console.error("Failed to parse current session on sync update:", e);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("Express syncing is offline, working in local browser fallback storage mode.", err);
      }
    };

    // Run first-time initial call
    runSync();

    // Constant fast background polling every 3.5 seconds
    const intervalId = setInterval(runSync, 3500);
    return () => clearInterval(intervalId);
  }, []);

  // Write changes to localStorage upon state updates
  useEffect(() => {
    localStorage.setItem('mf_std_products', JSON.stringify(standardsProducts));
  }, [standardsProducts]);

  // Clear open custom tree categories and subcategories when visiting any tab other than 'products' (inventory)
  useEffect(() => {
    if (currentTab !== 'products') {
      localStorage.setItem('mf_toggled_cat_ids', '{}');
      localStorage.setItem('mf_toggled_subcat_ids', '{}');
    }
  }, [currentTab]);

  // Synchronize and sort standard categories at runtime
  useEffect(() => {
    const initial = getInitialStandardsProducts();
    const missing = initial.filter(initCat => !standardsProducts.some(pc => pc.name.toLowerCase() === initCat.name.toLowerCase()));
    const extra = standardsProducts.filter(pc => !initial.some(initCat => initCat.name.toLowerCase() === pc.name.toLowerCase()));
    
    let needsSort = false;
    let lastIdx = -1;
    for (const cat of standardsProducts) {
      const idx = initial.findIndex(initCat => initCat.name.toLowerCase() === cat.name.toLowerCase());
      if (idx !== -1) {
        if (idx < lastIdx) {
          needsSort = true;
          break;
        }
        lastIdx = idx;
      }
    }

    const initialStudBolts = initial.find(c => c.name.toLowerCase() === "stud bolts");
    const currentStudBolts = standardsProducts.find(c => c.name.toLowerCase() === "stud bolts");
    let needsStudBoltsUpgrade = false;
    if (initialStudBolts && currentStudBolts) {
      const hasCorrectSub = currentStudBolts.subcategories.some(sub => sub.name === "STUD BOLTS");
      if (!hasCorrectSub) {
        needsStudBoltsUpgrade = true;
      }
    }

    const initialNuts = initial.find(c => c.name.toLowerCase() === "nuts" || c.name.toLowerCase() === "nut");
    const currentNuts = standardsProducts.find(c => c.name.toLowerCase() === "nuts" || c.name.toLowerCase() === "nut");
    let needsNutsUpgrade = false;
    if (initialNuts && currentNuts) {
      const hasCorrectSub = currentNuts.subcategories.some(sub => sub.name === "HEX NUT");
      if (!hasCorrectSub) {
        needsNutsUpgrade = true;
      }
    }

    const initialWashers = initial.find(c => c.name.toLowerCase() === "washers");
    const currentWashers = standardsProducts.find(c => c.name.toLowerCase() === "washers");
    let needsWashersUpgrade = false;
    if (initialWashers && currentWashers) {
      const hasCorrectSub = currentWashers.subcategories.some(sub => sub.name === "FLAT WASHER");
      if (!hasCorrectSub) {
        needsWashersUpgrade = true;
      }
    }

    const initialAnchors = initial.find(c => c.name.toLowerCase() === "anchors");
    const currentAnchors = standardsProducts.find(c => c.name.toLowerCase() === "anchors");
    let needsAnchorsUpgrade = false;
    if (initialAnchors && currentAnchors) {
      const hasCorrectSub = currentAnchors.subcategories.some(sub => sub.name === "CHEMICAL ANCHOR BOLTS TYPE-1");
      if (!hasCorrectSub) {
        needsAnchorsUpgrade = true;
      }
    }

    const initialAnchorBolts = initial.find(c => c.name.toLowerCase() === "anchor bolts");
    const currentAnchorBolts = standardsProducts.find(c => c.name.toLowerCase() === "anchor bolts");
    let needsAnchorBoltsUpgrade = false;
    if (initialAnchorBolts && currentAnchorBolts) {
      const hasCorrectSub = currentAnchorBolts.subcategories.some(sub => sub.name === "STRAIGHT ANCHOR BOLTS");
      const hasType1 = currentAnchorBolts.subcategories.some(sub => sub.name === "L TYPE ANCHOR BOLTS TYPE-1");
      if (!hasCorrectSub || !hasType1) {
        needsAnchorBoltsUpgrade = true;
      }
    }

    const initialUBolts = initial.find(c => c.name.toLowerCase() === "u bolts");
    const currentUBolts = standardsProducts.find(c => c.name.toLowerCase() === "u bolts");
    let needsUBoltsUpgrade = false;
    if (initialUBolts && currentUBolts) {
      const hasCorrectSub = currentUBolts.subcategories.some(sub => sub.name === "ROUND BEND U BOLT");
      if (!hasCorrectSub) {
        needsUBoltsUpgrade = true;
      }
    }

    const initialRivets = initial.find(c => c.name.toLowerCase() === "rivets");
    const currentRivets = standardsProducts.find(c => c.name.toLowerCase() === "rivets");
    let needsRivetsUpgrade = false;
    if (initialRivets && currentRivets) {
      const hasCorrectSub = currentRivets.subcategories.some(sub => sub.name === "ALUMINIUM STEEL RIVETS");
      if (!hasCorrectSub) {
        needsRivetsUpgrade = true;
      }
    }

    const initialPins = initial.find(c => c.name.toLowerCase() === "pins");
    const currentPins = standardsProducts.find(c => c.name.toLowerCase() === "pins");
    let needsPinsUpgrade = false;
    if (initialPins && currentPins) {
      const hasCorrectSub = currentPins.subcategories.some(sub => sub.name === "SPLIT PINS");
      const hasClevis = currentPins.subcategories.some(sub => sub.name === "CLEVIS PINS");
      if (!hasCorrectSub || !hasClevis || currentPins.subcategories.length < 10) {
        needsPinsUpgrade = true;
      }
    }

    const initialAdhesives = initial.find(c => c.name.toLowerCase() === "adhesives");
    const currentAdhesives = standardsProducts.find(c => c.name.toLowerCase() === "adhesives");
    let needsAdhesivesUpgrade = false;
    if (initialAdhesives && currentAdhesives) {
      const hasCorrectSub = currentAdhesives.subcategories.some(sub => sub.name === "CHEMICAL");
      if (!hasCorrectSub) {
        needsAdhesivesUpgrade = true;
      }
    }

    const initialSocketScrews = initial.find(c => c.name.toLowerCase() === "socket screws");
    const currentSocketScrews = standardsProducts.find(c => c.name.toLowerCase() === "socket screws");
    let needsSocketScrewsUpgrade = false;
    if (initialSocketScrews && currentSocketScrews) {
      const hasGrub = currentSocketScrews.subcategories.some(sub => sub.name === "GRUB SCREWS");
      if (!hasGrub) {
        needsSocketScrewsUpgrade = true;
      }
    }

    const initialMachineScrews = initial.find(c => c.name.toLowerCase() === "machine screws");
    const currentMachineScrews = standardsProducts.find(c => c.name.toLowerCase() === "machine screws");
    let needsMachineScrewsUpgrade = false;
    if (initialMachineScrews && currentMachineScrews) {
      const hasCsk = currentMachineScrews.subcategories.some(sub => sub.name === "MACHINE SCREW CSK PHILIP HEAD DIN 965");
      if (!hasCsk) {
        needsMachineScrewsUpgrade = true;
      }
    }

    const initialSelfTapping = initial.find(c => c.name.toLowerCase() === "self-tapping screws" || c.name.toLowerCase() === "self tapping screws");
    const currentSelfTapping = standardsProducts.find(c => c.name.toLowerCase() === "self-tapping screws" || c.name.toLowerCase() === "self tapping screws");
    let needsSelfTappingUpgrade = false;
    if (initialSelfTapping && currentSelfTapping) {
      const hasPanSelf = currentSelfTapping.subcategories.some(sub => sub.name === "PAN HEAD SELF TAPPING SCREW DIN 7981");
      if (!hasPanSelf) {
        needsSelfTappingUpgrade = true;
      }
    }

    const initialSDSScrews = initial.find(c => c.name.toLowerCase() === "sds screws");
    const currentSDSScrews = standardsProducts.find(c => c.name.toLowerCase() === "sds screws");
    let needsSDSScrewsUpgrade = false;
    if (initialSDSScrews && currentSDSScrews) {
      const hasPanSds = currentSDSScrews.subcategories.some(sub => sub.name === "PAN HEAD SELF DRILLING SCREW DIN 7504-M");
      if (!hasPanSds) {
        needsSDSScrewsUpgrade = true;
      }
    }

    const initialSecurityFasteners = initial.find(c => c.name.toLowerCase() === "security fasteners");
    const currentSecurityFasteners = standardsProducts.find(c => c.name.toLowerCase() === "security fasteners");
    let needsSecurityFastenersUpgrade = false;
    if (initialSecurityFasteners && currentSecurityFasteners) {
      const hasSocketButton = currentSecurityFasteners.subcategories.some(sub => sub.name === "SOCKET BUTTON POST TORX TAPPING SCREW");
      if (!hasSocketButton) {
        needsSecurityFastenersUpgrade = true;
      }
    }

    const initialLiftingAccessories = initial.find(c => c.name.toLowerCase() === "lifting accessories");
    const currentLiftingAccessories = standardsProducts.find(c => c.name.toLowerCase() === "lifting accessories");
    let needsLiftingAccessoriesUpgrade = false;
    if (initialLiftingAccessories && currentLiftingAccessories) {
      const hasWireRopes = currentLiftingAccessories.subcategories.some(sub => sub.name === "WIRE ROPES");
      if (!hasWireRopes) {
        needsLiftingAccessoriesUpgrade = true;
      }
    }

    const initialPipeSupport = initial.find(c => c.name.toLowerCase() === "pipe support systems" || c.name.toLowerCase() === "pipe supports systems");
    const currentPipeSupport = standardsProducts.find(c => c.name.toLowerCase() === "pipe support systems" || c.name.toLowerCase() === "pipe supports systems");
    let needsPipeSupportSystemsUpgrade = false;
    if (initialPipeSupport && currentPipeSupport) {
      const hasClevis = currentPipeSupport.subcategories.some(sub => sub.name === "Clevis Hanger");
      if (!hasClevis) {
        needsPipeSupportSystemsUpgrade = true;
      }
    }

    const initialRoundBars = initial.find(c => c.name.toLowerCase() === "round bars");
    const currentRoundBars = standardsProducts.find(c => c.name.toLowerCase() === "round bars");
    let needsRoundBarsUpgrade = false;
    if (initialRoundBars && currentRoundBars) {
      const hasMetrics = currentRoundBars.subcategories.some(sub => sub.name === "ROUND BAR METRICS");
      if (!hasMetrics) {
        needsRoundBarsUpgrade = true;
      }
    }

    const initialCableTrays = initial.find(c => c.name.toLowerCase() === "cable trays");
    const currentCableTrays = standardsProducts.find(c => c.name.toLowerCase() === "cable trays");
    let needsCableTraysUpgrade = false;
    if (initialCableTrays && currentCableTrays) {
      const hasSlotted = currentCableTrays.subcategories.some(sub => sub.name === "SLOTTED CHANNEL");
      if (!hasSlotted) {
        needsCableTraysUpgrade = true;
      }
    }

    const initialFlatBars = initial.find(c => c.name.toLowerCase() === "flat bars");
    const currentFlatBars = standardsProducts.find(c => c.name.toLowerCase() === "flat bars");
    let needsFlatBarsUpgrade = false;
    if (initialFlatBars) {
      if (!currentFlatBars) {
        needsFlatBarsUpgrade = true;
      } else {
        const hasFlatBars = currentFlatBars.subcategories.some(sub => sub.name === "FLAT BARS");
        if (!hasFlatBars) {
          needsFlatBarsUpgrade = true;
        }
      }
    }

    const initialTeflon = initial.find(c => c.name.toLowerCase() === "teflon");
    const currentTeflon = standardsProducts.find(c => c.name.toLowerCase() === "teflon");
    let needsTeflonUpgrade = false;
    if (initialTeflon) {
      if (!currentTeflon) {
        needsTeflonUpgrade = true;
      } else {
        const hasTeflonBar = currentTeflon.subcategories.some(sub => sub.name === "TEFLON BAR");
        if (!hasTeflonBar) {
          needsTeflonUpgrade = true;
        }
      }
    }

    const initialNylon = initial.find(c => c.name.toLowerCase() === "nylon");
    const currentNylon = standardsProducts.find(c => c.name.toLowerCase() === "nylon");
    let needsNylonUpgrade = false;
    if (initialNylon) {
      if (!currentNylon) {
        needsNylonUpgrade = true;
      } else {
        const hasNylonBar = currentNylon.subcategories.some(sub => sub.name === "NYLON BAR");
        if (!hasNylonBar) {
          needsNylonUpgrade = true;
        }
      }
    }

    const initialGrp = initial.find(c => c.name.toLowerCase() === "grp");
    const currentGrp = standardsProducts.find(c => c.name.toLowerCase() === "grp");
    let needsGrpUpgrade = false;
    if (initialGrp) {
      if (!currentGrp) {
        needsGrpUpgrade = true;
      } else {
        const hasGrpBar = currentGrp.subcategories.some(sub => sub.name === "GRP BAR");
        if (!hasGrpBar) {
          needsGrpUpgrade = true;
        }
      }
    }

    const initialGasket = initial.find(c => c.name.toLowerCase() === "gasket");
    const currentGasket = standardsProducts.find(c => c.name.toLowerCase() === "gasket");
    let needsGasketUpgrade = false;
    if (initialGasket) {
      if (!currentGasket) {
        needsGasketUpgrade = true;
      } else {
        const hasGasketCut = currentGasket.subcategories.some(sub => sub.name === "CNAF SOFT CUT GASKET");
        if (!hasGasketCut) {
          needsGasketUpgrade = true;
        }
      }
    }

    const initialFischer = initial.find(c => c.name.toLowerCase() === "fischer" || c.name.toLowerCase() === "fischers");
    const currentFischer = standardsProducts.find(c => c.name.toLowerCase() === "fischer" || c.name.toLowerCase() === "fischers");
    let needsFischerUpgrade = false;
    if (initialFischer) {
      if (!currentFischer) {
        needsFischerUpgrade = true;
      } else {
        const hasSlottedChannel = currentFischer.subcategories.some(sub => sub.name === "SLOTTED CHANNEL");
        if (!hasSlottedChannel) {
          needsFischerUpgrade = true;
        }
      }
    }

    if (extra.length > 0 || missing.length > 0 || needsSort || needsStudBoltsUpgrade || needsNutsUpgrade || needsWashersUpgrade || needsAnchorsUpgrade || needsAnchorBoltsUpgrade || needsUBoltsUpgrade || needsRivetsUpgrade || needsPinsUpgrade || needsAdhesivesUpgrade || needsSocketScrewsUpgrade || needsMachineScrewsUpgrade || needsSelfTappingUpgrade || needsSDSScrewsUpgrade || needsSecurityFastenersUpgrade || needsLiftingAccessoriesUpgrade || needsPipeSupportSystemsUpgrade || needsRoundBarsUpgrade || needsCableTraysUpgrade || needsFlatBarsUpgrade || needsTeflonUpgrade || needsNylonUpgrade || needsGrpUpgrade || needsGasketUpgrade || needsFischerUpgrade) {
      setStandardsProducts(prev => {
        let updated = prev.map(c => {
          if (c.name.toLowerCase() === "fischer" || c.name.toLowerCase() === "fischers") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "fischer" || initC.name.toLowerCase() === "fischers");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "stud bolts") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "stud bolts");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "nuts" || c.name.toLowerCase() === "nut") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "nuts" || initC.name.toLowerCase() === "nut");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "washers") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "washers");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "anchors") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "anchors");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "anchor bolts") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "anchor bolts");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "u bolts") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "u bolts");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "rivets") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "rivets");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "pins") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "pins");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "adhesives") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "adhesives");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "socket screws") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "socket screws");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "machine screws") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "machine screws");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "self-tapping screws" || c.name.toLowerCase() === "self tapping screws") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "self-tapping screws" || initC.name.toLowerCase() === "self tapping screws");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "sds screws") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "sds screws");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "security fasteners") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "security fasteners");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "lifting accessories") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "lifting accessories");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "pipe support systems" || c.name.toLowerCase() === "pipe supports systems") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "pipe support systems" || initC.name.toLowerCase() === "pipe supports systems");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "round bars") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "round bars");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "cable trays") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "cable trays");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "flat bars") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "flat bars");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "teflon") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "teflon");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "nylon") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "nylon");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "grp") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "grp");
            return fresh ? { ...fresh } : c;
          }
          if (c.name.toLowerCase() === "gasket") {
            const fresh = initial.find(initC => initC.name.toLowerCase() === "gasket");
            return fresh ? { ...fresh } : c;
          }
          return c;
        }).filter(c => initial.some(initCat => initCat.name.toLowerCase() === c.name.toLowerCase()));

        const stillMissing = initial.filter(initCat => !updated.some(pc => pc.name.toLowerCase() === initCat.name.toLowerCase()));
        updated = [...updated, ...stillMissing];
        updated.sort((a, b) => {
          const idxA = initial.findIndex(cat => cat.name.toLowerCase() === a.name.toLowerCase());
          const idxB = initial.findIndex(cat => cat.name.toLowerCase() === b.name.toLowerCase());
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });

        localStorage.setItem('mf_std_products', JSON.stringify(updated));
        return updated;
      });
    }
  }, [standardsProducts]);

  useEffect(() => {
    localStorage.setItem('mf_fine_products', JSON.stringify(fineThreadProducts));
  }, [fineThreadProducts]);

  // Synchronize state instantly from localStorage when updated in sub-components
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mf_std_products' && e.newValue) {
        try {
          const parsed = loadStandardsProductsWithMerge(e.newValue);
          setStandardsProductsRaw(prev => {
            const currentStr = JSON.stringify(prev);
            const stable = ensureStableIds(parsed);
            if (currentStr !== JSON.stringify(stable)) {
              return stable;
            }
            return prev;
          });
        } catch (err) {
          console.error("Sync standard products from storage failed:", err);
        }
      }
      if (e.key === 'mf_fine_products' && e.newValue) {
        try {
          const parsed = loadFineThreadProductsWithMerge(e.newValue);
          setFineThreadProductsRaw(prev => {
            const currentStr = JSON.stringify(prev);
            const stable = ensureStableIds(parsed);
            if (currentStr !== JSON.stringify(stable)) {
              return stable;
            }
            return prev;
          });
        } catch (err) {
          console.error("Sync fine products from storage failed:", err);
        }
      }
    };

    const handleCustomStorage = () => {
      const stdVal = localStorage.getItem('mf_std_products');
      if (stdVal) {
        try {
          const parsed = loadStandardsProductsWithMerge(stdVal);
          setStandardsProductsRaw(prev => {
            const currentStr = JSON.stringify(prev);
            const stable = ensureStableIds(parsed);
            if (currentStr !== JSON.stringify(stable)) {
              return stable;
            }
            return prev;
          });
        } catch (err) {}
      }
      const fineVal = localStorage.getItem('mf_fine_products');
      if (fineVal) {
        try {
          const parsed = loadFineThreadProductsWithMerge(fineVal);
          setFineThreadProductsRaw(prev => {
            const currentStr = JSON.stringify(prev);
            const stable = ensureStableIds(parsed);
            if (currentStr !== JSON.stringify(stable)) {
              return stable;
            }
            return prev;
          });
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('storage', handleCustomStorage);
    window.addEventListener('mfi-inventory-updated', handleCustomStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage', handleCustomStorage);
      window.removeEventListener('mfi-inventory-updated', handleCustomStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('mf_warehouse_layouts', JSON.stringify(warehouseLayouts));
  }, [warehouseLayouts]);

  useEffect(() => {
    localStorage.setItem('mf_hex_photos', JSON.stringify(hexPhotos));
  }, [hexPhotos]);

  // Overall Dynamically calculated metrics
  const { totalBalanceWeight, totalOutgoingWeight } = useMemo(() => {
    let balanceWeightTotal = 0;
    let outgoingWeightTotal = 0;

    // Standard products summation loop
    standardsProducts.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        sub.threadTypes.forEach((tt) => {
          tt.grades.forEach((g) => {
            g.rows.forEach((row) => {
              balanceWeightTotal += (row.balanceStock * row.unitWeight);
              outgoingWeightTotal += (row.outGoingStock * row.unitWeight);
            });
          });
        });
      });
    });

    // Fine Thread & UNF summation loop
    fineThreadProducts.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        sub.threadTypes.forEach((tt) => {
          tt.grades.forEach((g) => {
            g.rows.forEach((row) => {
              balanceWeightTotal += (row.balanceStock * row.unitWeight);
              outgoingWeightTotal += (row.outGoingStock * row.unitWeight);
            });
          });
        });
      });
    });

    return {
      totalBalanceWeight: balanceWeightTotal,
      totalOutgoingWeight: outgoingWeightTotal
    };
  }, [standardsProducts, fineThreadProducts]);

  // State update handlers
  const handleUpdateLayout = (id: string, newLink: string, newName?: string, newDesc?: string) => {
    setWarehouseLayouts((prev) =>
      prev.map((layout) => (layout.id === id ? { 
        ...layout, 
        pdfLink: newLink,
        name: newName !== undefined ? newName : layout.name,
        description: newDesc !== undefined ? newDesc : layout.description
      } : layout))
    );
  };

  const handleDeleteLayout = (id: string) => {
    setWarehouseLayouts((prev) => prev.filter((layout) => layout.id !== id));
  };

  const handleCreateLayout = (name: string, pdfLink: string, description: string) => {
    const newLayout: WarehouseLayout = {
      id: String(Date.now()),
      name,
      pdfLink,
      description
    };
    setWarehouseLayouts((prev) => [...prev, newLayout]);
  };

  const handleUpdatePhoto = (
    id: string,
    newTitle: string,
    newDriveLink: string,
    newImageUrl?: string
  ) => {
    setHexPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id
          ? {
              ...photo,
              title: newTitle,
              driveLink: newDriveLink,
              imageUrl: newImageUrl || photo.imageUrl,
            }
          : photo
      )
    );
  };

  // Reset database routine
  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const executeResetData = () => {
    localStorage.removeItem('mf_std_products');
    localStorage.removeItem('mf_fine_products');
    localStorage.removeItem('mf_warehouse_layouts');
    localStorage.removeItem('mf_hex_photos');

    // Wipe all dynamic transaction registers and audit records
    const keysToWipe = [
      'MFI_TRIAL_BALANCE_WORKSHEET_V2',
      'MFI_GAAP_VOUCHERS',
      'MF_PACKING_LISTS',
      'MF_RECEIPT_VOUCHERS',
      'MF_CREDIT_NOTES',
      'MF_PURCHASE_ORDERS',
      'MF_SALES_INVOICES_EXCEL',
      'MFI_OVERTIME_RECORDS',
      'MFI_MACHINERIES_REGISTER_UPGRADED',
      'MFI_TOOLS_REGISTER_EXCEL',
      'MFI_PACK_MATERIALS_EXCEL_V3',
      'MFI_PUNCHING_STAMPS_EXCEL_V2',
      'MFI_COATING_ACCESSORIES_V2',
      'MFI_INCOMING_MATERIALS_LEDGER',
      'MFI_SUPPLIER_PURCHASES',
      'MFI_RAW_PAYABLES',
      'MFI_OUTGOING_RECEIVABLES',
      'MF_SAVED_DOCUMENTS_LIST',
      'MFI_SOA_CUSTOMER_TRANSACTIONS',
      'MF_FINANCIAL_VOUCHERS'
    ];
    keysToWipe.forEach(key => localStorage.removeItem(key));

    setStandardsProducts(getInitialStandardsProducts());
    setFineThreadProducts(getInitialFineThreadUNF());
    setWarehouseLayouts(INITIAL_WAREHOUSE_LAYOUTS);
    setHexPhotos(INITIAL_HEX_PHOTOS);
    setCurrentTab('products');
    setShowResetConfirm(false);

    // Refresh page to load all cleared states
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const executeWipeToBlank = () => {
    localStorage.removeItem('mf_std_products');
    localStorage.removeItem('mf_fine_products');
    localStorage.removeItem('mf_warehouse_layouts');
    localStorage.removeItem('mf_hex_photos');

    // Wipe all dynamic transaction registers and audit records
    const keysToWipe = [
      'MFI_TRIAL_BALANCE_WORKSHEET_V2',
      'MFI_GAAP_VOUCHERS',
      'MF_PACKING_LISTS',
      'MF_RECEIPT_VOUCHERS',
      'MF_CREDIT_NOTES',
      'MF_PURCHASE_ORDERS',
      'MF_SALES_INVOICES_EXCEL',
      'MFI_OVERTIME_RECORDS',
      'MFI_MACHINERIES_REGISTER_UPGRADED',
      'MFI_TOOLS_REGISTER_EXCEL',
      'MFI_PACK_MATERIALS_EXCEL_V3',
      'MFI_PUNCHING_STAMPS_EXCEL_V2',
      'MFI_COATING_ACCESSORIES_V2',
      'MFI_INCOMING_MATERIALS_LEDGER',
      'MFI_SUPPLIER_PURCHASES',
      'MFI_RAW_PAYABLES',
      'MFI_OUTGOING_RECEIVABLES',
      'MF_SAVED_DOCUMENTS_LIST',
      'MFI_SOA_CUSTOMER_TRANSACTIONS',
      'MF_FINANCIAL_VOUCHERS'
    ];
    keysToWipe.forEach(key => localStorage.removeItem(key));

    const blankStd = getInitialStandardsProducts().map(c => ({
      ...c,
      subcategories: c.subcategories.map(s => ({
        ...s,
        threadTypes: s.threadTypes.map(tt => ({
          ...tt,
          grades: tt.grades.map(g => ({
            ...g,
            rows: []
          }))
        }))
      }))
    }));

    const blankFine = getInitialFineThreadUNF().map(c => ({
      ...c,
      subcategories: c.subcategories.map(s => ({
        ...s,
        threadTypes: s.threadTypes.map(tt => ({
          ...tt,
          grades: tt.grades.map(g => ({
            ...g,
            rows: []
          }))
        }))
      }))
    }));

    setStandardsProducts(blankStd);
    setFineThreadProducts(blankFine);
    setWarehouseLayouts(INITIAL_WAREHOUSE_LAYOUTS);
    setHexPhotos(INITIAL_HEX_PHOTOS);
    setCurrentTab('products');
    setShowResetConfirm(false);

    // Refresh page to load all cleared states
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Force secure authentication gateway immediately upon page entry
  if (currentUser === null) {
    return (
      <WelcomeLoginGate 
        onLogin={handleLogin}
        isIframe={isIframe} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none antialiased text-[11.5px]">
      {showToast && (
        <div className="fixed top-4 right-4 bg-slate-950 border border-[#f37021] text-white p-3 font-mono text-[10px] shadow-xl rounded z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
      {/* Redesigned Corporate Top Header Bar matching Focus ERP style */}
      <header className="bg-[#063b36] text-white h-12 flex items-center justify-between px-4 relative z-30 border-b-2 border-[#FF6B00] shadow-sm select-none">
        {/* Left Side: Brand Logo & Title with Hamburger and Quick Menu */}
        <div className="flex items-center gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleSetTab('home')}>
            <span className="text-sm font-extrabold tracking-widest font-sans uppercase text-white truncate max-w-[220px] sm:max-w-none">
              {activeCompany.shortName ? activeCompany.shortName.toUpperCase() : activeCompany.name.split('(')[0].trim().toUpperCase()}
            </span>
            <span className="bg-[#FF6B00] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-wider uppercase shrink-0">
              {activeCompany.code || 'MFI'} ERP
            </span>
          </div>

          {/* Multi-Company Active Entity Quick Info */}
          <div className="hidden md:flex items-center gap-2 border-l border-white/20 pl-3 ml-1 text-[11px] font-medium text-white/90 relative">
            <button 
              type="button" 
              onClick={() => {
                setShowCompaniesModal(true);
              }}
              className="hover:text-white flex items-center gap-2 px-2.5 py-1 bg-[#052e2a] hover:bg-[#073833] rounded-md border border-[#0d554c] cursor-pointer transition-all shadow-2xs group"
              title="Active Business Entity • Switch or View (F3)"
            >
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 rounded-xs font-black text-[9px] tracking-wider uppercase ${
                  (activeCompany.code || 'MFI') === 'MFI' ? 'bg-blue-600 text-white' :
                  (activeCompany.code || 'BMM') === 'BMM' ? 'bg-amber-600 text-white' :
                  'bg-purple-600 text-white'
                }`}>
                  {activeCompany.code || 'MFI'}
                </span>
                <span className="font-bold text-white text-[11px] max-w-[180px] lg:max-w-[240px] truncate">
                  {activeCompany.shortName || activeCompany.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-transform" />
            </button>

            {showCompanyMenu && (
              <div className="absolute left-3 top-9 w-96 bg-white border border-slate-200 shadow-2xl z-50 text-slate-800 rounded-lg py-3 px-3 font-sans animate-in fade-in duration-100 divide-y divide-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 px-1 text-slate-500 font-mono">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-[#083c54]">
                    <Building2 className="w-3.5 h-3.5 text-[#f37021]" />
                    <span>ACTIVE COMPANY ENTITY</span>
                  </span>
                  <span className="text-[8.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE: {activeCompany.code || 'ERP'}
                  </span>
                </div>

                {/* Company Switcher List */}
                <div className="py-2 space-y-1.5 max-h-56 overflow-y-auto">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
                    {effectiveCompaniesList.length > 1 ? 'Switch Active Company / Edit Header:' : 'Active Company Entity:'}
                  </span>
                  {effectiveCompaniesList.map(comp => {
                    const isSelected = activeCompany.id === comp.id;
                    return (
                      <div 
                        key={comp.id} 
                        className={`p-2 rounded-md border transition-all flex items-center justify-between gap-2 ${
                          isSelected 
                            ? 'bg-blue-50/80 border-blue-300 shadow-2xs' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSwitchCompany(comp)}
                          className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                          title={`Switch active company to ${comp.name}`}
                        >
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase text-white shrink-0 ${
                            (comp.code || 'MFI') === 'MFI' ? 'bg-blue-600' :
                            (comp.code || 'MFI') === 'BMM' ? 'bg-amber-600' :
                            (comp.code || 'MFI') === 'UMI' ? 'bg-purple-600' :
                            'bg-emerald-600'
                          }`}>
                            {comp.code || 'CMP'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-[11px] text-slate-900 truncate leading-tight flex items-center gap-1">
                              <span>{comp.shortName || comp.name.split(' ')[0]}</span>
                              {isSelected && <span className="text-[8px] bg-emerald-500 text-white font-mono font-bold px-1 rounded-xs">CURRENT</span>}
                            </p>
                            <p className="text-[9px] text-slate-500 truncate">{comp.name}</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCompany(comp.id)}
                          className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 text-[9px] uppercase tracking-tight flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                          title={`Edit ${comp.shortName || comp.name} Header`}
                        >
                          <span>✏️ Edit Header</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Active Entity Info Card */}
                <div className="py-2.5 space-y-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white ${
                        (activeCompany.code || 'MFI') === 'MFI' ? 'bg-blue-600' :
                        (activeCompany.code || 'MFI') === 'BMM' ? 'bg-amber-600' :
                        (activeCompany.code || 'MFI') === 'UMI' ? 'bg-purple-600' :
                        'bg-emerald-600'
                      }`}>
                        {activeCompany.code || 'MFI'}
                      </span>
                      <span className="font-extrabold text-[11.5px] text-slate-900 leading-tight">
                        {activeCompany.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-slate-600 mt-2 pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase">TRN NUMBER</span>
                        <span className="font-bold text-slate-800">{activeCompany.trn || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase">CURRENCY</span>
                        <span className="font-bold text-slate-800">{activeCompany.currency || 'AED (د.إ)'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[8px] uppercase">ADDRESS</span>
                        <span className="text-slate-700 truncate block">{activeCompany.address || 'Ajman Industrial, UAE'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Operator Banner */}
                  {currentUser && (
                    <div className="px-2 py-1.5 bg-blue-50/70 border border-blue-200 rounded text-[9.5px] font-mono flex items-center justify-between text-blue-900">
                      <span className="truncate">👤 {currentUser.firstName} ({currentUser.position || 'OPERATOR'})</span>
                      <span className="font-bold uppercase px-1.5 py-0.2 bg-blue-200 text-blue-900 rounded text-[8px]">{currentUser.role}</span>
                    </div>
                  )}
                </div>

                {/* Dropdown Bottom Actions: Create Company restricted strictly to Admin */}
                <div className="pt-2 mt-1 space-y-1.5 text-xs">
                  {currentUser?.role === 'Admin' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleOpenAddCompany}
                        className="w-full py-1.5 px-2 bg-[#f37021] hover:bg-[#d95d13] text-white font-extrabold rounded text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Create New Company (Admin)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCompany(activeCompany.id)}
                          className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[9.5px] uppercase text-center cursor-pointer truncate"
                        >
                          ✏️ Edit {activeCompany.shortName || 'Entity'} Header
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCompanyMenu(false);
                            handleSetTab('about');
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('settings_set_tab', { detail: 'companies' }));
                            }, 50);
                          }}
                          className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[9.5px] uppercase text-center cursor-pointer truncate"
                        >
                          🏢 Companies Hub
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-1.5 text-center text-[9px] font-mono text-slate-500 bg-slate-50 rounded border border-slate-200">
                      🔒 Logged in as <strong className="text-slate-800 uppercase">{currentUser?.role || 'Viewer'}</strong>. Company management is restricted to Administrator.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Box exactly matching DASH.png style */}
        <div className="flex-1 max-w-xl mx-4 hidden md:flex items-center gap-2">
          <div className="relative flex-1 flex items-center bg-[#042824] border border-[#084840] rounded-md h-8 px-2.5">
            <Search className="w-3.5 h-3.5 text-white/50 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search Menu..."
              value={menuSearchTerm}
              onChange={(e) => setMenuSearchTerm(e.target.value)}
              className="bg-transparent text-white placeholder:text-white/50 text-[11px] w-full focus:outline-none pr-6 font-medium"
            />
            {menuSearchTerm && (
              <button
                type="button"
                onClick={() => setMenuSearchTerm('')}
                className="absolute right-3 text-white/50 hover:text-white text-[11px] font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
            
            {/* Popover showing search results */}
            {menuSearchTerm && (
              <div className="absolute top-9 left-0 right-0 bg-white border border-slate-200 shadow-2xl z-50 text-slate-800 rounded-md text-[11.5px] py-1 shadow-lg max-h-72 overflow-y-auto">
                {sidebarItems
                  .filter(item => item.label.toLowerCase().includes(menuSearchTerm.toLowerCase()))
                  .map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSetTab(item.id);
                        setMenuSearchTerm('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 font-bold uppercase text-[10px] tracking-wide text-slate-700"
                    >
                      <item.icon className="w-3.5 h-3.5 text-[#07433c]" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                {sidebarItems.filter(item => item.label.toLowerCase().includes(menuSearchTerm.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2.5 text-slate-400 text-center text-[10px] uppercase font-bold">
                    No matching modules
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Circular Profile Menu matching DASH.png */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold text-white tracking-wide hidden sm:inline">
              {currentUser.firstName || 'FAHIM'}
            </span>
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-7 h-7 rounded-full bg-[#052e2a] border border-[#0d554c] flex items-center justify-center hover:border-white/40 transition-colors cursor-pointer"
              title="User Account"
            >
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                {currentUser.firstName ? `${currentUser.firstName[0]}${currentUser.secondName ? currentUser.secondName[0] : 'U'}` : 'FU'}
              </span>
            </button>
            
            {showUserDropdown && (
              <div className="absolute right-0 top-9 w-52 bg-white border border-slate-200 shadow-2xl z-50 text-slate-800 rounded-md py-1 px-1.5 text-[11px]">
                <div className="border-b border-slate-100 pb-2 p-2 mb-1.5 font-sans">
                  <div className="font-bold text-slate-900 uppercase text-[10px]">{currentUser.firstName} {currentUser.lastName || ''}</div>
                  <div className="text-[9.5px] text-slate-500 font-semibold truncate mt-0.5">{currentUser.email}</div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-[#07433c] text-[8.5px] font-bold uppercase rounded-sm">
                    {currentUser.role} Level
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    handleSetTab('about');
                  }}
                  className="w-full text-left p-2 hover:bg-slate-50 text-slate-700 font-bold uppercase text-[9px] tracking-wider block"
                >
                  ⚙ System Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    handleLogout();
                  }}
                  className="w-full text-left p-2 hover:bg-slate-50 text-red-600 font-bold uppercase text-[9px] tracking-wider block border-t border-slate-100 mt-1 pt-2"
                >
                  ➔ Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container combining vertical Sidebar and full-bleed Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Vertical Navigation Sidebar panel matching DASH.png */}
        <aside className="w-[74px] bg-white border-r border-slate-200 flex flex-col items-center shrink-0 overflow-y-auto select-none">
          {sidebarItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSetTab(item.id)}
                className={`w-full flex flex-col items-center justify-center py-3.5 px-1 border-b border-slate-100 transition-all text-center group cursor-pointer relative ${
                  isActive
                    ? 'bg-white text-[#FF6B00] font-bold border-t-[3px] border-[#FF6B00]'
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                }`}
              >
                <item.icon className={`w-[19px] h-[19px] mb-1.5 transition-colors ${isActive ? 'text-[#FF6B00]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className={`text-[8.5px] font-bold uppercase tracking-tight leading-none block max-w-full truncate px-0.5 ${isActive ? 'text-[#FF6B00]' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  {item.label === 'Technical Specs' ? 'TECHNICAL ...' :
                   item.label === 'Quality Control' ? 'QUALITY CO...' :
                   item.label === 'Work Orders' ? 'WORK ORDE...' :
                   item.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Core Content Screen Area with canvas background matching DASH.png */}
        <main className="flex-1 overflow-y-auto overflow-x-auto min-w-0 p-3 sm:p-3.5 bg-[#ebf4f3] relative">

          {currentTab === 'home' && (
            <HomeView
              layouts={warehouseLayouts}
              onUpdateLayout={handleUpdateLayout}
              onDeleteLayout={handleDeleteLayout}
              onCreateLayout={handleCreateLayout}
              currentUser={currentUser}
              onNavigate={handleSetTab}
            />
          )}

          {currentTab === 'about' && (
            <AboutView 
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          )}

          {currentTab === 'products' && (
            <div className="space-y-4">
              {/* Beautiful, High-contrast Tab Switcher for Inventory View */}
              <div className="flex bg-white border border-slate-200 p-1.5 rounded-none shadow-xs items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider select-none">
                <div className="flex items-center gap-1.5">
                  <div className="flex bg-slate-100 p-0.5 rounded-xs border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setInventorySubTab('report')}
                      title="1. Stock Valuation Report"
                      className={`px-3 py-1.5 rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                        inventorySubTab === 'report'
                          ? 'bg-slate-900 text-white shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventorySubTab('editor')}
                      title="2. Stock Ledger Sheet (Editor)"
                      className={`px-3 py-1.5 rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                        inventorySubTab === 'editor'
                          ? 'bg-slate-900 text-white shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>


              </div>

              {inventorySubTab === 'report' ? (
                <div className="bg-white border border-slate-200 p-2 shadow-xs">
                  <StockReportsView 
                    triggerToast={triggerToast} 
                    standardsProducts={standardsProducts}
                    setStandardsProducts={setStandardsProducts}
                    fineThreadProducts={fineThreadProducts}
                    setFineThreadProducts={setFineThreadProducts}
                    onOpenQuickStockEntry={() => setShowStockEntryModal(true)}
                  />
                </div>
              ) : (
                <ProductsView
                  standardsProducts={standardsProducts}
                  setStandardsProducts={setStandardsProducts}
                  fineThreadProducts={fineThreadProducts}
                  setFineThreadProducts={setFineThreadProducts}
                  totalBalanceWeight={totalBalanceWeight}
                  totalOutgoingWeight={totalOutgoingWeight}
                  currentUser={currentUser}
                  onNavigate={handleSetTab}
                  onOpenQuickStockEntry={() => setShowStockEntryModal(true)}
                />
              )}
            </div>
          )}

          {currentTab === 'technical' && <TechnicalView currentUser={currentUser} />}

          {currentTab === 'workflow' && <WorkflowView currentUser={currentUser} onNavigate={handleSetTab} />}

          {currentTab === 'erp' && <ErpView currentUser={currentUser} onNavigate={handleSetTab} mode="erp" />}

          {currentTab === 'stores_qc' && <ErpView currentUser={currentUser} onNavigate={handleSetTab} mode="stores_qc" />}

          {currentTab === 'fixed_asset' && <FixedAssetComponent />}

          {currentTab === 'quotation' && (
            <QuotationView 
              currentUser={currentUser} 
              triggerToast={triggerToast} 
              onNavigate={handleSetTab} 
            />
          )}

          {!['home', 'about', 'products', 'technical', 'workflow', 'erp', 'stores_qc', 'fixed_asset', 'quotation'].includes(currentTab) && (
            <ErpView currentUser={currentUser} onNavigate={handleSetTab} mode="erp" />
          )}
        </main>
      </div>

      {/* Enterprise Bottom Status Bar mimicking screenshot */}
      <footer className="bg-[#f8fafc] border-t border-slate-200 py-1.5 px-4 flex justify-between items-center text-[10px] text-slate-500 select-none antialiased shrink-0">
        <div className="font-bold uppercase tracking-wider text-[#083c54] flex items-center gap-1.5 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>{activeCompany.shortName || activeCompany.name} (Active Entity)</span>
        </div>
        <div className="flex items-center gap-2 font-medium font-sans text-slate-600">
          <span>Copyright © 2026 <span className="font-bold text-slate-800">{activeCompany.name}.</span> All Rights Reserved.</span>
          <span className="opacity-50">|</span>
          <span className="font-mono text-[9px] bg-slate-200 px-1 py-0.2 rounded-xs">Version 1.0.4</span>
        </div>
      </footer>

      {/* Multi-Company Edit & Add Modal */}
      {isEditCompanyModalOpen && (
        <EditCompanyModal
          isOpen={isEditCompanyModalOpen}
          initialCompanyId={companyModalInitialId}
          currentUser={currentUser}
          onClose={() => setIsEditCompanyModalOpen(false)}
          onSaved={(saved) => {
            setCompaniesList(getCompaniesList());
            setActiveCompany(getActiveCompany());
            triggerToast(`Saved settings for ${saved.name}`);
          }}
        />
      )}

      {/* Non-blocking Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 text-sans select-none antialiased">
          <div className="bg-white border-2 border-slate-900 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 font-mono font-bold uppercase text-[10px] tracking-wider flex justify-between items-center select-none">
              <span>Reset Warehouse States</span>
              <button 
                type="button"
                onClick={() => setShowResetConfirm(false)} 
                className="text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5"
              >
                <span className="text-xs font-sans font-bold">✕</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5">
              <p className="text-slate-700 text-xs leading-relaxed font-sans mb-4">
                Warning: This will clear all current custom inventories, category inserts, and restore standard blank warehouse schemas. Proceed?
              </p>

              {/* Action Footer */}
              <div className="flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-[10px] font-bold uppercase transition-colors rounded-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeResetData}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer"
                  title="Resets database to clean starting models"
                >
                  Reset To Clean State
                </button>
                <button
                  type="button"
                  onClick={executeWipeToBlank}
                  className="px-3 py-1.5 bg-red-650 hover:bg-red-750 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  title="Wipes all sheets completely to 0.00 KG stock weight"
                >
                  Wipe All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List of Voucher Types Modal (F1) */}
      <ListOfVoucherTypesModal
        isOpen={showVoucherTypesModal}
        onClose={() => setShowVoucherTypesModal(false)}
        onSelectVoucher={(tabId, voucherName) => {
          handleSetTab(tabId);
          triggerToast(`Opening ${voucherName} Voucher...`);
        }}
      />

      {/* List of Companies Modal (F3) */}
      <ListOfCompaniesModal
        isOpen={showCompaniesModal}
        onClose={() => setShowCompaniesModal(false)}
        companies={getCompaniesList()}
        activeCompany={activeCompany}
        onSelectCompany={(comp) => {
          handleSwitchCompany(comp);
          triggerToast(`Switched active entity to ${comp.name}`);
        }}
        onAddNewCompany={handleOpenAddCompany}
        onEditCompany={(comp) => handleOpenEditCompany(comp.id)}
      />

      {/* Voucher Date Modal (F2) */}
      <VoucherDateModal
        isOpen={showVoucherDateModal}
        onClose={() => setShowVoucherDateModal(false)}
        onDateChange={(date) => {
          triggerToast(`Voucher Date set to: ${date}`);
        }}
      />

      {/* Gateway of Tally Quick Stock Entry Master (+ / F2) */}
      <GatewayStockEntryModal
        isOpen={showStockEntryModal}
        onClose={() => setShowStockEntryModal(false)}
        activeCompany={activeCompany}
        standardsProducts={standardsProducts}
        fineThreadProducts={fineThreadProducts}
        onCompleteSelection={(selection) => {
          if (selection.qty && selection.qty > 0) {
            const isFine = (selection.fastenerClass || '').toLowerCase().includes('fine');
            const targetProducts = isFine ? fineThreadProducts : standardsProducts;
            const setTarget = isFine ? setFineThreadProducts : setStandardsProducts;

            let added = false;
            const updated = targetProducts.map(cat => {
              if (cat.name.toLowerCase() !== (selection.category || '').toLowerCase()) return cat;
              return {
                ...cat,
                subcategories: (cat.subcategories || []).map(sub => {
                  if (sub.name.toLowerCase() !== (selection.subCategory || '').toLowerCase()) return sub;
                  return {
                    ...sub,
                    threadTypes: (sub.threadTypes || []).map(tt => {
                      if (tt.name.toLowerCase() !== (selection.threadSeries || '').toLowerCase()) return tt;
                      return {
                        ...tt,
                        grades: (tt.grades || []).map(g => {
                          if (g.name.toLowerCase() !== (selection.grade || '').toLowerCase()) return g;
                          added = true;
                          const newRow = {
                            id: `ROW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            partNo: `${g.name.slice(0, 3).toUpperCase()}-${selection.dia || 'M10'}-${selection.length || '30'}`,
                            dia: selection.dia || 'M10',
                            pitch: selection.pitch || '1.5',
                            length: selection.length || '30',
                            finish: selection.finish || 'AUTO BLACK',
                            marking: g.name,
                            unit: selection.unit || 'PCS',
                            openingStock: 0,
                            inStock: selection.qty || 0,
                            outGoingStock: 0,
                            balanceStock: selection.qty || 0,
                            rackLocation: selection.rackLocation || 'RACK A-1',
                            unitWeight: 0,
                            totalWeight: 0,
                            remarks: 'Direct Quick Stock Entry (+)'
                          };
                          return {
                            ...g,
                            rows: [...(g.rows || []), newRow]
                          };
                        })
                      };
                    })
                  };
                })
              };
            });

            if (added) {
              setTarget(updated);
              triggerToast(`Added +${selection.qty} ${selection.unit || 'PCS'} to ${selection.category} > ${selection.grade}!`);
            } else {
              triggerToast(`Selected: ${selection.category} • ${selection.grade}`);
            }
          } else {
            triggerToast(`Selected: ${selection.category} • ${selection.grade}`);
          }
          handleSetTab('products');
        }}
      />

      {/* Global Spotlight Search Modal (Ctrl + R / Search button) */}
      <GlobalSpotlightSearchModal
        isOpen={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
        onSelectModule={(tabId) => {
          handleSetTab(tabId);
          triggerToast('Navigating...');
        }}
      />

      {/* Executive Login Transition Overlay with Sound */}
      {showLoginTransition && transitionUser && (
        <LoginTransitionOverlay
          user={transitionUser}
          activeCompany={activeCompany}
          onFinish={() => {
            setShowLoginTransition(false);
            setTransitionUser(null);
          }}
        />
      )}
    </div>
  );
}
