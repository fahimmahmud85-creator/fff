import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCompanyProfile, getActiveCompany, CompanyProfile, getCompanyIsoText, isMarineFastenersCompany } from '../utils/companyProfile';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Printer, 
  Search, 
  Filter, 
  UserPlus, 
  TrendingUp, 
  CreditCard, 
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Save,
  BookOpen,
  Sparkles,
  History,
  ShoppingBag,
  Receipt,
  X,
  Eye,
  Coins,
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  PieChart,
  DollarSign,
  CheckCircle2,
  Building2,
  RotateCcw,
  ArrowUpDown,
  Maximize2,
  Mail,
  Download,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { INITIAL_CUSTOMERS } from '../customerData';
import SoaStatisticsView from './SoaStatisticsView';

interface CustomerRecord {
  id: string;
  companyName: string;
  address: string;
  poBox: string;
  trn: string;
  phone: string;
  contactPerson: string;
  designation: string;
  email: string;
  mobile: string;
  companyId?: string;
}

interface Seller {
  code: string;
  name: string;
}

interface SoaTransaction {
  id: string;
  date: string;
  paymentTerms: string; // e.g. '60' or '60 Days'
  overdueDays: number;
  lpoRef: string;
  invoiceRef: string;
  woRef: string;
  deliveryDates: string;
  amount: number;
  datePaid: string;
  receiptNo: string;
  paymentMode: string;
  amountPaid: number;
  purchaseId?: string;
  isLinkedReceipt?: boolean;
  receiptRawData?: any;
  type?: string;
}

interface CustomerAging {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days91to120: number;
  over120: number;
}

interface CustomStatement {
  id: string;
  createdAt: string;
  statementDate: string;
  periodFrom: string;
  periodTo: string;
  customerCode: string;
  companyName: string;
  address: string;
  phone: string;
  trn: string;
  poBox: string;
  sellerCode: string;
  currency: string;
  transactions: SoaTransaction[];
  aging: CustomerAging;
  statementType?: 'receivables_outstanding' | 'payables_outstanding';
  showDeliveryDate?: boolean;
  bankDetails: {
    beneficiary: string;
    bankName: string;
    accountNo: string;
    branch: string;
    country: string;
    iban: string;
    swiftCode: string;
    address: string;
  };
}

export default function CustomerSoaComponent() {
  // Sellers State
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('MFI_SOA_SELLERS');
    if (saved) return JSON.parse(saved);
    return [
      { code: 'FSL', name: 'Faisal Shah' },
      { code: 'ASF', name: 'Ashraf Mohammed' },
      { code: 'FHM', name: 'Fahim Ahmed' }
    ];
  });

  const [activeSellerCode, setActiveSellerCode] = useState<string>('FSL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('MFI_SOA_SELLERS');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSellers(prev => JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('mfi_sellers_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('mfi_sellers_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);
  
  // Refs and scrolling helpers for representative lists
  const repHorizontalListRef = useRef<HTMLDivElement>(null);
  const repVerticalModalRef = useRef<HTMLDivElement>(null);
  const monthlyTableRef = useRef<HTMLDivElement>(null);

  const scrollRepHorizontal = (direction: 'left' | 'right') => {
    if (repHorizontalListRef.current) {
      const scrollAmount = 200;
      repHorizontalListRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRepVertical = (direction: 'up' | 'down') => {
    if (repVerticalModalRef.current) {
      const scrollAmount = 120;
      repVerticalModalRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollMonthlyTable = (direction: 'up' | 'down') => {
    if (monthlyTableRef.current) {
      const scrollAmount = 140;
      monthlyTableRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // Year & Month Filters
  const [filterYear, setFilterYear] = useState<string>('2026');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState<boolean>(() => {
    return localStorage.getItem('MFI_SOA_FILTER_MODE') === 'pending';
  });
  const [ignoreDateForUnpaid, setIgnoreDateForUnpaid] = useState<boolean>(true);
  const [showDeliveryDateInLedger, setShowDeliveryDateInLedger] = useState<boolean>(false);
  const [payablesFromDate, setPayablesFromDate] = useState<string>('');
  const [payablesToDate, setPayablesToDate] = useState<string>('');
  const [supplierFilterId, setSupplierFilterId] = useState<string>('ALL');

  // Popup Statement format selection modal state
  const [statementPrintModal, setStatementPrintModal] = useState<{
    show: boolean;
    isCustomCompiled: boolean;
    customStmt?: CustomStatement;
  }>({ show: false, isCustomCompiled: false });

  // On-screen Document / Tax Invoice Print Preview Modal State
  const [docPreviewModal, setDocPreviewModal] = useState<{
    show: boolean;
    title: string;
    htmlContent: string;
  }>({ show: false, title: '', htmlContent: '' });

  // Saved Statement History list
  const [savedStatements, setSavedStatements] = useState<CustomStatement[]>(() => {
    const saved = localStorage.getItem('MFI_SOA_SAVED_STATEMENTS_LOG');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Persist Saved Statements Archive automatically on any modification
  useEffect(() => {
    localStorage.setItem('MFI_SOA_SAVED_STATEMENTS_LOG', JSON.stringify(savedStatements));
  }, [savedStatements]);

  // Merge/Group saved custom statements by companyName on-the-fly for single-table customer displays
  const mergedSavedStatements = useMemo(() => {
    const mergedMap: Record<string, CustomStatement> = {};
    
    // Sort statements chronologically from oldest to newest so newest statement's metadata takes precedence
    const sorted = [...savedStatements].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    
    sorted.forEach(stmt => {
      const key = stmt.companyName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      if (!mergedMap[key]) {
        // Create a copy
        mergedMap[key] = {
          ...stmt,
          transactions: [...(stmt.transactions || [])],
          aging: { ...(stmt.aging || { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 }) }
        };
      } else {
        // Merge into existing
        const existing = mergedMap[key];
        
        // Update metadata with the newer statement's values
        existing.statementDate = stmt.statementDate;
        if (stmt.periodFrom && existing.periodFrom) {
          if (new Date(stmt.periodFrom).getTime() < new Date(existing.periodFrom).getTime()) {
            existing.periodFrom = stmt.periodFrom;
          }
        } else if (stmt.periodFrom) {
          existing.periodFrom = stmt.periodFrom;
        }
        if (stmt.periodTo && existing.periodTo) {
          if (new Date(stmt.periodTo).getTime() > new Date(existing.periodTo).getTime()) {
            existing.periodTo = stmt.periodTo;
          }
        } else if (stmt.periodTo) {
          existing.periodTo = stmt.periodTo;
        }
        existing.customerCode = stmt.customerCode || existing.customerCode;
        existing.address = stmt.address || existing.address;
        existing.phone = stmt.phone || existing.phone;
        existing.trn = stmt.trn || existing.trn;
        existing.poBox = stmt.poBox || existing.poBox;
        existing.sellerCode = stmt.sellerCode || existing.sellerCode;
        existing.currency = stmt.currency || existing.currency;
        existing.bankDetails = stmt.bankDetails || existing.bankDetails;
        existing.createdAt = stmt.createdAt || existing.createdAt;
        
        // Merge transactions without duplicates
        const mergedTxs = [...existing.transactions];
        (stmt.transactions || []).forEach(t => {
          const isDuplicate = mergedTxs.some(existTx => {
            if (t.id && existTx.id && t.id === existTx.id) return true;
            if (t.invoiceRef && t.invoiceRef !== '—' && existTx.invoiceRef === t.invoiceRef) {
              if (t.type === existTx.type && t.amount === existTx.amount && t.date === existTx.date) return true;
            }
            if (t.woRef && t.woRef !== '—' && existTx.woRef === t.woRef) {
              if (t.type === existTx.type && t.amount === existTx.amount && t.date === existTx.date) return true;
            }
            return false;
          });
          if (!isDuplicate) {
            mergedTxs.push(t);
          }
        });
        
        // Sort transactions chronologically
        mergedTxs.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
        existing.transactions = mergedTxs;
        
        // Recalculate aging buckets based on these updated transaction overdue days
        const newAging: CustomerAging = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };
        mergedTxs.forEach(tx => {
          const balance = Number(tx.amount || 0) - Number(tx.amountPaid || 0);
          if (balance > 0) {
            const age = Number(tx.overdueDays) || 0;
            if (age <= 0) {
              newAging.current += balance;
            } else if (age <= 30) {
              newAging.days1to30 += balance;
            } else if (age <= 60) {
              newAging.days31to60 += balance;
            } else if (age <= 90) {
              newAging.days61to90 += balance;
            } else if (age <= 120) {
              newAging.days91to120 += balance;
            } else {
              newAging.over120 += balance;
            }
          }
        });
        existing.aging = newAging;
      }
    });
    
    // Return from newest to oldest based on createdAt
    return Object.values(mergedMap).reverse();
  }, [savedStatements]);

  // Customer List (No longer pre-populated with dummy data)
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());

  // Listen for company profile and active company changes
  useEffect(() => {
    const handleCompSync = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('storage', handleCompSync);
    window.addEventListener('company_profile_updated', handleCompSync);
    window.addEventListener('active_company_changed', handleCompSync);
    return () => {
      window.removeEventListener('storage', handleCompSync);
      window.removeEventListener('company_profile_updated', handleCompSync);
      window.removeEventListener('active_company_changed', handleCompSync);
    };
  }, []);

  // Autocomplete search states for customer selector
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>('');

  const filteredCustomers = useMemo(() => {
    if (!searchVal) return customers;
    const lower = searchVal.toLowerCase();
    // Filter by company name or customer ID
    return customers.filter(c => 
      c.companyName.toLowerCase().includes(lower) || 
      c.id.toLowerCase().includes(lower) ||
      c.id.replace('cust-ocr-', 'MFI-').toLowerCase().includes(lower)
    );
  }, [customers, searchVal]);

  // Customer Seller mapping state: customerId -> sellerCode
  const [customerSellerMap, setCustomerSellerMap] = useState<Record<string, string>>({});

  // Transaction Ledger saved per customerId
  const [customerTransactions, setCustomerTransactions] = useState<Record<string, SoaTransaction[]>>({});

  // Client overrides for aging and miscellaneous metadata (initialized dynamically from localStorage)
  const [agingOverrides, setAgingOverrides] = useState<Record<string, CustomerAging>>(() => {
    const saved = localStorage.getItem('MFI_SOA_AGING_OVERRIDES');
    return saved ? JSON.parse(saved) : {};
  });

  // State declaration moved prior to useEffects to avoid TDZ and closure bugs
  const [selectedCustomerIdForSoa, setSelectedCustomerIdForSoa] = useState<string | null>(() => {
    return localStorage.getItem('MFI_SOA_SELECTED_CUSTOMER_ID');
  });

  useEffect(() => {
    if (selectedCustomerIdForSoa) {
      const active = customers.find(c => c.id === selectedCustomerIdForSoa);
      if (active) {
        setSearchVal(active.companyName);
      } else {
        setSearchVal('');
      }
    } else {
      setSearchVal('');
    }
  }, [selectedCustomerIdForSoa, customers]);

  useEffect(() => {
    if (selectedCustomerIdForSoa) {
      localStorage.setItem('MFI_SOA_SELECTED_CUSTOMER_ID', selectedCustomerIdForSoa);
    } else {
      localStorage.removeItem('MFI_SOA_SELECTED_CUSTOMER_ID');
    }
  }, [selectedCustomerIdForSoa]);

  // Automatically derive & synchronize Customer Ledger lists from saved (recorded) statements, registered clients, and auto-posts
  const [triggerRefresh, setTriggerRefresh] = useState(0);
  useEffect(() => {
    const handleStorageChange = () => {
      setTriggerRefresh(prev => prev + 1);
      const stored = localStorage.getItem('MFI_SOA_SELECTED_CUSTOMER_ID');
      if (stored !== selectedCustomerIdForSoa) {
        setSelectedCustomerIdForSoa(stored);
      }
      const filterMode = localStorage.getItem('MFI_SOA_FILTER_MODE');
      if (filterMode === 'pending') {
        setShowUnpaidOnly(true);
      } else if (filterMode === 'standard') {
        setShowUnpaidOnly(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mfi_soa_select_customer', handleStorageChange);
    window.addEventListener('mf_documents_updated', handleStorageChange);
    window.addEventListener('mfi_supplier_purchases_updated', handleStorageChange);
    window.addEventListener('mfi_soa_updated', handleStorageChange);
    window.addEventListener('mfi_sellers_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mfi_soa_select_customer', handleStorageChange);
      window.removeEventListener('mf_documents_updated', handleStorageChange);
      window.removeEventListener('mfi_supplier_purchases_updated', handleStorageChange);
      window.removeEventListener('mfi_soa_updated', handleStorageChange);
      window.removeEventListener('mfi_sellers_updated', handleStorageChange);
    };
  }, [selectedCustomerIdForSoa]);

  useEffect(() => {
    // 1. Load registered customers from local storage
    const savedCustomersJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
    let regCustomers: any[] = [];
    if (savedCustomersJson) {
      try {
        regCustomers = JSON.parse(savedCustomersJson);
        if (!Array.isArray(regCustomers)) regCustomers = [];
      } catch (e) {
        regCustomers = [];
      }
    }

    // Seed initial registered customers if empty
    if (regCustomers.length === 0) {
      regCustomers = [
        {
          id: 'cust-1',
          name: 'ZAMIL HEAVY INDUSTRIES LTD',
          companyName: 'ZAMIL HEAVY INDUSTRIES LTD',
          address: '7547 PRINCE SULTAN ROAD, AS SALAMAH, SAUDI ARABIA DIST. JEDDAH\n23437 SALAMA CENTER, TOWER B1 2ND FLO',
          phone: '+966 12 699 2411',
          trn: '300182764500003',
          poBox: '40228',
          placeOfSupply: 'KSA (EXEMPT EXPORT)',
          contactPerson: 'Zamil Purchase Dept',
          designation: 'Purchasing Manager',
          email: 'procurement@zamilheavy.com',
          mobile: '—'
        },
        {
          id: 'cust-2',
          name: 'AL FANAR STEEL WORKS CO.',
          companyName: 'AL FANAR STEEL WORKS CO.',
          address: 'P.O. BOX 40228, INDUSTRIAL AREA 12, SHARJAH, UAE',
          phone: '+971 6 534 8822',
          trn: '100234598000003',
          poBox: '40228',
          placeOfSupply: 'SHARJAH, UAE',
          contactPerson: 'Finance Officer',
          designation: 'Accounts Payable',
          email: 'ap@alfanarsteel.ae',
          mobile: '—'
        },
        {
          id: 'cust-3',
          name: 'GULF INTEGRATED MARINE SERVICES',
          companyName: 'GULF INTEGRATED MARINE SERVICES',
          address: 'PORT KHALID, SECTOR 4, SHARJAH, UAE',
          phone: '+971 6 528 9452',
          trn: '100455611100003',
          poBox: '12154',
          placeOfSupply: 'SHARJAH, UAE',
          contactPerson: 'Marine Purchaser',
          designation: 'Purchase Officer',
          email: 'purchasing@gulfmarine.com',
          mobile: '—'
        },
        {
          id: 'cust-4',
          name: 'AJMAN SHIP REPAIRING YARD',
          companyName: 'AJMAN SHIP REPAIRING YARD',
          address: 'AL RASHIDIYA 3, NEAR AL MEERA PORT, AJMAN, UAE',
          phone: '+971 6 742 2251',
          trn: '100511229900003',
          poBox: '36001',
          placeOfSupply: 'AJMAN, UAE',
          contactPerson: 'Eng. Karim Mohammad',
          designation: 'Project Director',
          email: 'k.mohammad@ajmanship.ae',
          mobile: '—'
        }
      ];
      localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regCustomers));
    }

    // Ensure we have at least some suppliers registered in the database so Payables Outstanding is not blank
    const hasSupplierInRegistry = regCustomers.some((c: any) => 
      c.id?.startsWith('supp-') || (c.companyName || c.name || '').toUpperCase().includes('SUPPLIER')
    );
    if (!hasSupplierInRegistry) {
      regCustomers.push(
        {
          id: 'supp-apex-fasteners',
          name: 'SUPPLIER: APEX FASTENERS & HARDWARE MFG',
          companyName: 'SUPPLIER: APEX FASTENERS & HARDWARE MFG',
          address: 'PLOT 145, INDUSTRIAL AREA 5, SHARJAH, UAE',
          phone: '+971 6 543 1122',
          trn: '100455611100003',
          poBox: '83921',
          placeOfSupply: 'SHARJAH, UAE',
          contactPerson: 'Accounts Manager',
          designation: 'Finance Dept',
          email: 'accounts@apexfasteners.ae',
          mobile: '—'
        },
        {
          id: 'supp-emirates-steel',
          name: 'SUPPLIER: EMIRATES STEEL INDUSTRIES PJSC',
          companyName: 'SUPPLIER: EMIRATES STEEL INDUSTRIES PJSC',
          address: 'ICAD I, MUSAFFAH, ABU DHABI, UAE',
          phone: '+971 2 551 1111',
          trn: '100234598000003',
          poBox: '10022',
          placeOfSupply: 'ABU DHABI, UAE',
          contactPerson: 'Payables Officer',
          designation: 'Accounts Payable',
          email: 'ap@emiratessteel.ae',
          mobile: '—'
        }
      );
      localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regCustomers));
    }
    
    // 2. Load all transactions from local storage (including auto-posted ones from invoices, work orders, suppliers!)
    const savedSoaTxsJson = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
    let soaTxs: Record<string, SoaTransaction[]> = {};
    if (savedSoaTxsJson) {
      try {
        soaTxs = JSON.parse(savedSoaTxsJson);
        if (typeof soaTxs !== 'object' || soaTxs === null || Array.isArray(soaTxs)) {
          soaTxs = {};
        }
      } catch (e) {
        soaTxs = {};
      }
    }

    // 2b. Automatically sync from MF_SAVED_DOCUMENTS_LIST to ensure customer/supplier ledger is fully updated in real-time!
    const savedDocsJson = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    let savedDocs: any[] = [];
    if (savedDocsJson) {
      try {
        savedDocs = JSON.parse(savedDocsJson);
        if (!Array.isArray(savedDocs)) savedDocs = [];
      } catch (e) {
        savedDocs = [];
      }
    }

    // 2c. Also automatically sync from MF_SALES_INVOICES_EXCEL to ensure sales invoices are fully updated in the ledger!
    const salesInvoicesJson = localStorage.getItem('MF_SALES_INVOICES_EXCEL');
    let salesInvoices: any[] = [];
    if (salesInvoicesJson) {
      try {
        salesInvoices = JSON.parse(salesInvoicesJson);
        if (!Array.isArray(salesInvoices)) salesInvoices = [];
      } catch (e) {
        salesInvoices = [];
      }
    }

    // Seed initial saved documents (delivery notes) if empty
    if (savedDocs.length === 0) {
      savedDocs = [];
      localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(savedDocs));
      localStorage.setItem('MF_SAVED_RECORDS_CLEARED_V6', 'true');
    }

    let regCustomersUpdated = false;

    // 2d. Automatically sync from MFI_SUPPLIER_PURCHASES to ensure supplier tax invoices (purchases) are fully updated in the ledger!
    const supplierPurchasesJson = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    let supplierPurchases: any[] = [];
    if (supplierPurchasesJson) {
      try {
        supplierPurchases = JSON.parse(supplierPurchasesJson);
        if (!Array.isArray(supplierPurchases)) supplierPurchases = [];
      } catch (e) {
        supplierPurchases = [];
      }
    } else {
      // Seed default supplier purchases so that they are visible!
      supplierPurchases = [];
      localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(supplierPurchases));
    }

    supplierPurchases.forEach((pur: any) => {
      const supplierName = (pur.supplierName || '').trim();
      if (!supplierName) return;

      const supplierSoaKey = 'supp-' + supplierName.replace(/\s+/g, '-').toLowerCase();

      // Ensure the key exists in soaTxs
      if (!soaTxs[supplierSoaKey]) {
        soaTxs[supplierSoaKey] = [];
      }

      // Check if this purchase invoice is already present in soaTxs[supplierSoaKey]
      const existingTxIdx = soaTxs[supplierSoaKey].findIndex((tx: any) => 
        tx.purchaseId === pur.id || 
        tx.invoiceRef === pur.invoiceNo || 
        tx.id === 'supp-tx-' + pur.id
      );

      const paymentStatus = pur.paymentStatus || 'Pending';
      const calculatedTotal = Number(pur.totalAmount || pur.subtotal || 0);
      const purPaid = pur.amountPaid !== undefined ? Number(pur.amountPaid) : (paymentStatus === 'Paid' ? calculatedTotal : (paymentStatus === 'Partial' ? (calculatedTotal / 2) : 0));
      
      const updatedSupplierTx: SoaTransaction = {
        id: 'supp-tx-' + pur.id,
        purchaseId: pur.id,
        date: pur.invoiceDate || pur.date || new Date().toISOString().substring(0, 10),
        paymentTerms: 'Credit Basis',
        overdueDays: 0,
        lpoRef: pur.lpoRef || '—',
        invoiceRef: pur.invoiceNo || '—',
        woRef: '—',
        deliveryDates: pur.deliveryNoteNo || pur.deliveryDates || '—',
        amount: calculatedTotal,
        datePaid: paymentStatus === 'Paid' ? (pur.invoiceDate || pur.date || '—') : '—',
        receiptNo: '—',
        paymentMode: '—',
        amountPaid: purPaid
      };

      if (existingTxIdx >= 0) {
        const prevTx = soaTxs[supplierSoaKey][existingTxIdx];
        soaTxs[supplierSoaKey][existingTxIdx] = {
          ...prevTx,
          ...updatedSupplierTx,
          amountPaid: prevTx.amountPaid !== undefined ? prevTx.amountPaid : updatedSupplierTx.amountPaid
        };
      } else {
        soaTxs[supplierSoaKey].push(updatedSupplierTx);
      }

      // Check if supplier is already registered in regCustomers
      const existsInRegistry = regCustomers.some((c: any) => 
        c.companyName.toUpperCase() === supplierName.toUpperCase() ||
        c.companyName.toUpperCase() === `SUPPLIER: ${supplierName.toUpperCase()}` ||
        c.id === supplierSoaKey
      );

      if (!existsInRegistry) {
        regCustomers.push({
          id: supplierSoaKey,
          companyName: `SUPPLIER: ${supplierName.toUpperCase()}`,
          address: "Sharjah, United Arab Emirates",
          poBox: "—",
          trn: pur.supplierTrn || "—",
          phone: "—",
          contactPerson: "Finance Desk",
          designation: "Supplier Account Manager",
          email: "finance@" + supplierName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
          mobile: "—"
        });
        regCustomersUpdated = true;
      }
    });
    savedDocs.forEach((doc: any) => {
      const docTypeUpper = (doc.documentType || '').trim().toUpperCase();
      const isSupplierDoc = docTypeUpper === 'PURCHASE ORDER' || 
                            docTypeUpper === 'PURCHASE REQUEST' || 
                            docTypeUpper === 'SUPPLIER BILL' || 
                            doc.accountCategory === 'PAYABLES' || 
                            (doc.buyerName || '').toUpperCase().startsWith('SUPPLIER:');
      const isCustomerDoc = !isSupplierDoc;
      
      const buyerName = (doc.buyerName || doc.customerName || doc.companyName || doc.clientName || doc.buyer || doc.customer || 'VALUED CLIENT').trim();
      if (!buyerName) return;
      
      const targetCleanName = buyerName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      const matchedCustomer = regCustomers.find((c: any) => {
        if (!c) return false;
        const cName = (c.name || c.companyName || '').trim().toUpperCase();
        return cName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === targetCleanName;
      });
      
      let customerId = '';
      if (matchedCustomer) {
        customerId = matchedCustomer.id;
      } else {
        if (isSupplierDoc) {
          customerId = 'supp-' + buyerName.replace(/\s+/g, '-').toLowerCase();
          regCustomers.push({
            id: customerId,
            companyName: `SUPPLIER: ${buyerName.toUpperCase()}`,
            address: doc.buyerAddress || "Sharjah, United Arab Emirates",
            poBox: doc.buyerPoBox || "—",
            trn: doc.buyerTRN || "—",
            phone: doc.buyerPhone || "—",
            contactPerson: "Finance Desk",
            designation: "Supplier Account Manager",
            email: "finance@" + buyerName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com",
            mobile: "—"
          });
          regCustomersUpdated = true;
        } else {
          customerId = 'cust-' + buyerName.replace(/\s+/g, '-').toLowerCase();
          regCustomers.push({
            id: customerId,
            companyName: buyerName.toUpperCase(),
            address: doc.buyerAddress || "Dubai, United Arab Emirates",
            poBox: doc.buyerPoBox || "—",
            trn: doc.buyerTRN || "—",
            phone: doc.buyerPhone || "—",
            contactPerson: "Finance Officer",
            designation: "Finance Department",
            email: "",
            mobile: "—"
          });
          regCustomersUpdated = true;
        }
      }

      if (!soaTxs[customerId]) {
        soaTxs[customerId] = [];
      }

      const customerTxs = soaTxs[customerId];
      
      let amount = Number(doc.totalInvoiceValue || doc.grandTotal || doc.totalAmount || doc.total || doc.amount || 0);
      if (amount <= 0 && doc.items && Array.isArray(doc.items)) {
        const subtotal = doc.items.reduce((sum: number, item: any) => {
          const q = parseFloat(item.qty as any) || 0;
          const p = parseFloat(item.unitPriceWOVAT as any) || parseFloat(item.unitPrice as any) || parseFloat(item.price as any) || parseFloat(item.rate as any) || 0;
          return sum + (q * p);
        }, 0);
        const discountAmt = parseFloat(doc.discountAmt as any) || 0;
        const freightAmt = parseFloat(doc.freightAmt as any) || 0;
        const isVATApplicable = !doc.isZeroRatedExport;
        const vatRate = 0.05;
        const vatAmount = isVATApplicable ? (subtotal - discountAmt) * vatRate : 0;
        amount = subtotal - discountAmt + vatAmount + freightAmt;
      }

      if (amount === 0) {
        amount = Number(doc.totalInvoiceValue || doc.grandTotal || doc.amount || 0);
      }

      const isWorkOrder = doc.documentType === 'WORK ORDER';
      const docNo = String(isWorkOrder ? (doc.workOrderNo || doc.invoiceNo || 'TEMP') : (doc.invoiceNo || 'TEMP'));
      
      const existingTxIdx = customerTxs.findIndex((tx: any) => tx.id === 'tx-auto-' + docNo || tx.invoiceRef === docNo || (isWorkOrder && tx.woRef === docNo));

      const paidAmt = Number(doc.amountReceived || doc.receivedAmount || doc.amountPaid || doc.invoicePaid || 0);
      const paidBy = doc.invoicePaidBy || doc.paymentMode || '—';
      const datePaid = paidAmt > 0 ? (doc.invoicePaymentDate || doc.datePaid || doc.dated || new Date().toISOString().substring(0, 10)) : '—';

      const updatedTx: SoaTransaction = {
        id: 'tx-auto-' + docNo,
        date: doc.dated || doc.date || doc.invoiceDate || new Date().toISOString().substring(0, 10),
        paymentTerms: doc.paymentTerms || (isSupplierDoc ? 'Credit Basis' : '30 Days'),
        overdueDays: 0,
        lpoRef: doc.lpoNo || '—',
        invoiceRef: (() => {
          if (doc.associatedInvoiceNo && doc.associatedInvoiceNo !== '—' && doc.associatedInvoiceNo.trim() !== '') {
            return doc.associatedInvoiceNo;
          }
          if (doc.invoiceNo && doc.invoiceNo !== '—' && doc.invoiceNo.trim() !== '') {
            return doc.invoiceNo;
          }
          return isWorkOrder ? '—' : docNo;
        })(),
        woRef: isWorkOrder ? docNo : (doc.workOrderNo || '—'),
        deliveryDates: doc.deliveryDate || doc.dated || '—',
        amount: amount,
        datePaid: datePaid,
        receiptNo: paidAmt > 0 ? (isSupplierDoc ? 'SUP-REC-' + docNo.replace(/^\D+/g, '') : 'REC-' + docNo.replace(/^\D+/g, '')) : '—',
        paymentMode: paidBy,
        amountPaid: paidAmt
      };

      if (existingTxIdx >= 0) {
        customerTxs[existingTxIdx] = {
          ...customerTxs[existingTxIdx],
          ...updatedTx
        };
      } else {
        customerTxs.push(updatedTx);
      }

      // Sync payment changes invoice & work order wise automatically
      if (isWorkOrder && paidAmt > 0) {
        customerTxs.forEach((tx: any, idx: number) => {
          if (tx.woRef === docNo && tx.invoiceRef !== '—') {
            customerTxs[idx].amountPaid = paidAmt;
            customerTxs[idx].datePaid = datePaid;
            customerTxs[idx].paymentMode = paidBy;
          }
        });
      } else if (!isWorkOrder && doc.workOrderNo && doc.workOrderNo !== '—' && paidAmt > 0) {
        customerTxs.forEach((tx: any, idx: number) => {
          if (tx.woRef === doc.workOrderNo && tx.invoiceRef === '—') {
            customerTxs[idx].amountPaid = paidAmt;
            customerTxs[idx].datePaid = datePaid;
            customerTxs[idx].paymentMode = paidBy;
          }
        });
      }
    });

    salesInvoices.forEach((inv: any) => {
      const buyerName = (inv.buyerName || inv.companyName || inv.customerName || '').trim();
      if (!buyerName) return;
      
      const targetCleanName = buyerName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      const matchedCustomer = regCustomers.find((c: any) => {
        if (!c) return false;
        const cName = (c.name || c.companyName || '').trim().toUpperCase();
        return cName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === targetCleanName;
      });
      
      let customerId = '';
      if (matchedCustomer) {
        customerId = matchedCustomer.id;
      } else {
        customerId = 'cust-' + buyerName.replace(/\s+/g, '-').toLowerCase();
        regCustomers.push({
          id: customerId,
          companyName: buyerName.toUpperCase(),
          address: inv.customerAddress || "Dubai, United Arab Emirates",
          poBox: "—",
          trn: "—",
          phone: "—",
          contactPerson: "Finance Officer",
          designation: "Finance Department",
          email: "",
          mobile: "—"
        });
        regCustomersUpdated = true;
      }

      if (!soaTxs[customerId]) {
        soaTxs[customerId] = [];
      }

      const customerTxs = soaTxs[customerId];
      
      let amount = 0;
      if (inv.items && Array.isArray(inv.items)) {
        const subtotal = inv.items.reduce((sum: number, item: any) => {
          const q = parseFloat(item.qty as any) || 0;
          const p = parseFloat(item.unitPrice as any) || 0;
          return sum + (q * p);
        }, 0);
        const taxRate = parseFloat(inv.taxRate as any) || 5;
        const vatAmount = subtotal * (taxRate / 100);
        amount = subtotal + vatAmount;
        if (inv.currency === 'USD') {
          amount = amount * 3.67;
        }
      }

      if (amount === 0) {
        amount = Number(inv.totalInvoiceValue || inv.grandTotal || inv.amount || 0);
      }

      const docNo = String(inv.invoiceNo || 'TEMP');
      const existingTxIdx = customerTxs.findIndex((tx: any) => tx.id === 'tx-auto-' + docNo || tx.invoiceRef === docNo);

      const paidAmt = Number(inv.amountReceived || inv.receivedAmount || inv.amountPaid || inv.invoicePaid || 0);
      const paidBy = inv.invoicePaidBy || inv.paymentMode || '—';
      const datePaid = paidAmt > 0 ? (inv.invoicePaymentDate || inv.datePaid || inv.dated || new Date().toISOString().substring(0, 10)) : '—';

      const updatedTx: SoaTransaction = {
        id: 'tx-auto-' + docNo,
        date: inv.dated || inv.date || inv.invoiceDate || new Date().toISOString().substring(0, 10),
        paymentTerms: inv.paymentTerms || '30 Days',
        overdueDays: 0,
        lpoRef: inv.lpoNo || inv.poNo || inv.poNumber || '—',
        invoiceRef: docNo,
        woRef: inv.workOrderNo || '—',
        deliveryDates: inv.dated || inv.date || '—',
        amount: amount,
        datePaid: datePaid,
        receiptNo: paidAmt > 0 ? 'REC-' + docNo.replace(/^\D+/g, '') : '—',
        paymentMode: paidBy,
        amountPaid: paidAmt
      };

      if (existingTxIdx >= 0) {
        const existingTx = customerTxs[existingTxIdx];
        customerTxs[existingTxIdx] = {
          ...updatedTx,
          ...existingTx, // Prioritize the payments database values
          amountPaid: Math.max(Number(existingTx.amountPaid || 0), Number(updatedTx.amountPaid || 0)),
          datePaid: (existingTx.datePaid && existingTx.datePaid !== '—') ? existingTx.datePaid : updatedTx.datePaid,
          receiptNo: (existingTx.receiptNo && existingTx.receiptNo !== '—') ? existingTx.receiptNo : updatedTx.receiptNo,
          paymentMode: (existingTx.paymentMode && existingTx.paymentMode !== '—') ? existingTx.paymentMode : updatedTx.paymentMode
        };
      } else {
        customerTxs.push(updatedTx);
      }
    });

    if (regCustomersUpdated) {
      localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regCustomers));
    }

    const uniqueCustomers: CustomerRecord[] = [];
    const seenCodes = new Set<string>();
    const txsMap: Record<string, SoaTransaction[]> = {};
    const sellerMap: Record<string, string> = {};

    // Process from oldest to newest so newest overwrites and becomes the primary profile details if any updates occurred
    const reversedStatements = [...savedStatements].reverse();

    reversedStatements.forEach(stmt => {
      const originalCode = stmt.customerCode || stmt.companyName || '';
      if (!originalCode) return;

      // Find if there's a matching registered customer by name
      const targetCleanName = stmt.companyName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      const matchedRc = regCustomers.find((rc: any) => {
        if (!rc) return false;
        const rcName = (rc.name || rc.companyName || '').trim().toUpperCase();
        return rcName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === targetCleanName;
      });

      let resolvedCode = originalCode;
      if (matchedRc) {
        resolvedCode = matchedRc.id;
      } else {
        // Try mapping by code with prefix replacement (e.g., MFI-2 matching cust-2 or supp-2)
        const cleanOriginal = originalCode.replace(/^(MFI-|cust-|supp-)/i, '').toLowerCase();
        const matchedByCode = regCustomers.find((rc: any) => {
          if (!rc) return false;
          const rcCleanId = rc.id.replace(/^(MFI-|cust-|supp-)/i, '').toLowerCase();
          return rcCleanId === cleanOriginal;
        });
        if (matchedByCode) {
          resolvedCode = matchedByCode.id;
        }
      }

      if (!seenCodes.has(resolvedCode)) {
        seenCodes.add(resolvedCode);
        const resolvedCompanyId = matchedRc ? (matchedRc.companyId || (matchedRc.id?.startsWith('cust-bm') ? 'comp-bmm' : 'comp-mfi')) : (stmt.companyId || (resolvedCode.startsWith('cust-bm') ? 'comp-bmm' : 'comp-mfi'));
        uniqueCustomers.push({
          id: resolvedCode,
          companyName: matchedRc ? (matchedRc.name || matchedRc.companyName) : stmt.companyName,
          address: matchedRc ? matchedRc.address : (stmt.address || ''),
          poBox: matchedRc ? matchedRc.poBox : (stmt.poBox || ''),
          trn: matchedRc ? matchedRc.trn : (stmt.trn || ''),
          phone: matchedRc ? matchedRc.phone : (stmt.phone || ''),
          contactPerson: matchedRc ? (matchedRc.contactPerson || 'Finance Officer') : 'Finance Officer',
          designation: matchedRc ? (matchedRc.designation || 'Finance Department') : 'Finance Department',
          email: matchedRc ? (matchedRc.email || '') : '',
          mobile: matchedRc ? (matchedRc.mobile || '') : '',
          companyId: resolvedCompanyId
        });
      }
      
      txsMap[resolvedCode] = stmt.transactions || [];
      sellerMap[resolvedCode] = stmt.sellerCode || 'FSL';
    });

    // Then, merge with registered customers in local storage
    regCustomers.forEach((rc: any) => {
      const companyName = (rc.name || rc.companyName || '').toUpperCase();
      const code = rc.id || 'cust-' + companyName.replace(/\s+/g, '-').toLowerCase();
      const resolvedCompanyId = rc.companyId || (code.startsWith('cust-bm') ? 'comp-bmm' : 'comp-mfi');
      
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        uniqueCustomers.push({
          id: code,
          companyName: companyName,
          address: rc.address || '',
          poBox: rc.poBox || '',
          trn: rc.trn || '',
          phone: rc.phone || '',
          contactPerson: rc.contactPerson || 'Finance Officer',
          designation: rc.designation || 'Finance Department',
          email: rc.email || '',
          mobile: rc.mobile || '',
          companyId: resolvedCompanyId
        });
      }

      // If we have custom transactions recorded for this customer in localStorage, let's use them!
      if (soaTxs[code] && soaTxs[code].length > 0) {
        const merged = [...(txsMap[code] || [])];
        soaTxs[code].forEach((t: any) => {
          const isDuplicate = merged.some((existing: any) => {
            if (t.id && existing.id && t.id === existing.id) return true;
            if (t.invoiceRef && t.invoiceRef !== '—' && existing.invoiceRef && existing.invoiceRef === t.invoiceRef) {
              if (t.type === existing.type && t.amount === existing.amount && t.date === existing.date) return true;
            }
            if (t.woRef && t.woRef !== '—' && existing.woRef && existing.woRef === t.woRef) {
              if (t.type === existing.type && t.amount === existing.amount && t.date === existing.date) return true;
            }
            return false;
          });
          if (!isDuplicate) {
            merged.push(t);
          }
        });
        txsMap[code] = merged;
      } else if (!txsMap[code]) {
        txsMap[code] = [];
      }

      if (!sellerMap[code]) {
        sellerMap[code] = 'FSL';
      }
    });

    // Also scan all keys inside soaTxs that are not in regCustomers (e.g. suppliers starting with 'supp-')
    Object.keys(soaTxs).forEach(code => {
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        const cleanName = code.startsWith('supp-') 
          ? code.substring(5).replace(/-/g, ' ').toUpperCase()
          : code.replace(/-/g, ' ').toUpperCase();
        
        uniqueCustomers.push({
          id: code,
          companyName: code.startsWith('supp-') ? `SUPPLIER: ${cleanName}` : cleanName,
          address: 'Sharjah, UAE',
          poBox: '—',
          trn: '—',
          phone: '—',
          contactPerson: 'Accounts Officer',
          designation: 'Finance Dept',
          email: '',
          mobile: '',
          companyId: code.startsWith('cust-bm') ? 'comp-bmm' : 'comp-mfi'
        });
        txsMap[code] = soaTxs[code] || [];
        sellerMap[code] = 'FSL';
      } else {
        // If already seen, merge the transactions
        const merged = [...(txsMap[code] || [])];
        (soaTxs[code] || []).forEach((t: any) => {
          const isDuplicate = merged.some((existing: any) => {
            if (t.id && existing.id && t.id === existing.id) return true;
            if (t.invoiceRef && t.invoiceRef !== '—' && existing.invoiceRef && existing.invoiceRef === t.invoiceRef) {
              if (t.type === existing.type && t.amount === existing.amount && t.date === existing.date) return true;
            }
            if (t.woRef && t.woRef !== '—' && existing.woRef && existing.woRef === t.woRef) {
              if (t.type === existing.type && t.amount === existing.amount && t.date === existing.date) return true;
            }
            return false;
          });
          if (!isDuplicate) {
            merged.push(t);
          }
        });
        txsMap[code] = merged;
      }
    });

    // 3. Also make sure all registered customers (from MF_REGISTERED_CUSTOMERS) show up under corporate accounts, even if they have no transactions yet
    regCustomers.forEach((rc: any) => {
      if (rc && rc.id && !seenCodes.has(rc.id)) {
        seenCodes.add(rc.id);
        const resolvedCompanyId = rc.companyId || (rc.id?.startsWith('cust-bm') ? 'comp-bmm' : 'comp-mfi');
        uniqueCustomers.push({
          id: rc.id,
          companyName: (rc.companyName || rc.name || '').toUpperCase(),
          address: rc.address || '',
          poBox: rc.poBox || '—',
          trn: rc.trn || '—',
          phone: rc.phone || '—',
          contactPerson: rc.contactPerson || '',
          designation: rc.designation || '',
          email: rc.email || '',
          mobile: rc.mobile || '',
          companyId: resolvedCompanyId
        });
        txsMap[rc.id] = soaTxs[rc.id] || [];
        if (!sellerMap[rc.id]) {
          sellerMap[rc.id] = 'FSL';
        }
      }
    });

    // Company customer visibility isolation:
    // MFI sees MFI customers only (!c.companyId or 'comp-mfi')
    // Bolt Master sees Bolt Master customers only
    // Other companies see only their own registered customers
    const isMfi = isMarineFastenersCompany(activeCompany);
    const visibleCustomers = uniqueCustomers.filter(c => {
      if (isMfi) {
        return !c.companyId || c.companyId === 'comp-mfi';
      }
      return c.companyId === activeCompany.id;
    });

    setCustomers(prev => JSON.stringify(prev) === JSON.stringify(visibleCustomers) ? prev : visibleCustomers);
    setCustomerTransactions(prev => JSON.stringify(prev) === JSON.stringify(txsMap) ? prev : txsMap);
    setCustomerSellerMap(prev => JSON.stringify(prev) === JSON.stringify(sellerMap) ? prev : sellerMap);
  }, [savedStatements, triggerRefresh, activeCompany]);

  // Handle active customer selection separately to prevent stale closure / reset bugs!
  useEffect(() => {
    if (customers.length > 0) {
      if (selectedCustomerIdForSoa && !customers.some(c => c.id === selectedCustomerIdForSoa)) {
        setSelectedCustomerIdForSoa(null);
      }
    } else {
      setSelectedCustomerIdForSoa(null);
    }
  }, [customers, selectedCustomerIdForSoa]);

  // Modals / Selection States
  const [soaPdfPreview, setSoaPdfPreview] = useState<boolean>(false);
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [newSellerCode, setNewSellerCode] = useState('');
  const [newSellerName, setNewSellerName] = useState('');
  const [editingSellerCode, setEditingSellerCode] = useState<string | null>(null);
  const [editingSellerName, setEditingSellerName] = useState<string>('');
  
  // Custom Transaction Row input fields
  const [txDate, setTxDate] = useState('2026-06-22');
  const [txPaymentTerms, setTxPaymentTerms] = useState('60 Days');
  const [txOverdueDays, setTxOverdueDays] = useState('0');
  const [txLpo, setTxLpo] = useState('');
  const [txInvoice, setTxInvoice] = useState('');
  const [txWo, setTxWo] = useState('');
  const [txDelivery, setTxDelivery] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDatePaid, setTxDatePaid] = useState('—');
  const [txReceiptNo, setTxReceiptNo] = useState('—');
  const [txMode, setTxMode] = useState('—');
  const [txAmtPaid, setTxAmtPaid] = useState('');

  // Helper: Robust date parser supporting YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.
  const parseRobustDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr === '—') return null;
    const cleanStr = dateStr.trim();

    // Normalizing YYYY-MM-DD to avoid timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      const parts = cleanStr.split('-');
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }

    // Handle slash/dash DD/MM/YY or MM/DD/YY (2 or 4 digit years) manual check
    // We run this BEFORE generic JS parsing because JS `new Date('10/12/2026')` defaults to MM/DD/YYYY, 
    // which swaps Month/Day for standard UAE dates (formatted as DD/MM/YYYY).
    const match = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (match) {
      const num1 = parseInt(match[1], 10);
      const num2 = parseInt(match[2], 10);
      let year = parseInt(match[3], 10);
      if (year < 100) {
        year += 2000;
      }

      // If first number > 12, it must be DD/MM/YYYY
      if (num1 > 12) {
        return new Date(year, num2 - 1, num1);
      }
      // If second number > 12, it must be MM/DD/YYYY
      if (num2 > 12) {
        return new Date(year, num1 - 1, num2);
      }
      // Otherwise, default to DD/MM/YYYY which is common in UAE
      return new Date(year, num2 - 1, num1);
    }

    // Try parsing standard JS (e.g. MM/DD/YYYY) as final fallback
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      return d;
    }

    return null;
  };

  // Helper: extract days limit from payment terms string (e.g., '60 Days' -> 60)
  const getTermsLimit = (paymentTermsStr: string): number => {
    let daysLimit = 30;
    if (paymentTermsStr && paymentTermsStr !== '—') {
      const termUpper = paymentTermsStr.toUpperCase();
      if (termUpper.includes('IMMEDIATE') || termUpper.includes('CASH') || termUpper.includes('COD')) {
        daysLimit = 0;
      } else {
        const match = paymentTermsStr.match(/(\d+)/);
        if (match) {
          daysLimit = parseInt(match[1], 10);
        }
      }
    }
    return daysLimit;
  };

  // Helper: Format any user-provided robust date format into standard YYYY-MM-DD for <input type="date">
  const getFormattedDateInput = (dateStr: string): string => {
    const parsed = parseRobustDate(dateStr);
    if (!parsed) return '';
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Calculate overdue days based on Transaction Date (fallbackDateStr) and Payment Terms relative to a Statement Date (or current simulated date)
  const calculateOverdueDaysFromTerms = (deliveryDateStr: string, fallbackDateStr: string, paymentTermsStr: string, comparisonDateStr?: string): number => {
    // Prioritize fallbackDateStr (the transaction Date) over deliveryDateStr (optional delivery references)
    let dateStr = (fallbackDateStr && fallbackDateStr !== '—' && fallbackDateStr.trim() !== '') 
      ? fallbackDateStr 
      : deliveryDateStr;

    if (!dateStr || dateStr === '—' || dateStr.trim() === '') return 0;

    const baseRefStr = comparisonDateStr || stmtDate || '2026-06-22';
    const candidateDate = parseRobustDate(dateStr);
    const refDate = parseRobustDate(baseRefStr);

    if (!candidateDate || !refDate) return 0;

    // Convert both to local midnight dates to avoid any timezone/DST discrepancies
    const localRef = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
    const localCand = new Date(candidateDate.getFullYear(), candidateDate.getMonth(), candidateDate.getDate());

    const diffTime = localRef.getTime() - localCand.getTime();
    const elapsedDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Return the total elapsed days from invoice date to base reference date to represent invoice age
    return Math.max(0, elapsedDays);
  };

  // Helper: AED Balance Amount to Words Converter
  const convertAmountToWordsAED = (amount: number): string => {
    if (amount < 0) {
      return 'Negative ' + convertAmountToWordsAED(Math.abs(amount));
    }
    
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    
    const scales = ['', 'Thousand', 'Million', 'Billion'];

    function helper(n: number): string {
      let s = '';
      if (n >= 100) {
        s += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        s += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        s += ones[n] + ' ';
      }
      return s.trim();
    }

    const dirhamsPart = Math.floor(amount);
    const filsPart = Math.round((amount - dirhamsPart) * 100);

    let resultWords = '';

    if (dirhamsPart === 0) {
      resultWords = 'Zero Dirhams';
    } else {
      let num = dirhamsPart;
      let parts: string[] = [];
      let scaleIndex = 0;
      
      while (num > 0) {
        const chunk = num % 1000;
        if (chunk > 0) {
          const chunkStr = helper(chunk);
          const scaleStr = scales[scaleIndex];
          parts.unshift((chunkStr + ' ' + scaleStr).trim());
        }
        num = Math.floor(num / 1000);
        scaleIndex++;
      }
      resultWords = parts.join(', ') + ' Dirhams';
    }

    if (filsPart > 0) {
      resultWords += ' and ' + helper(filsPart) + ' Fils';
    }

    return (resultWords.trim() + ' Only').replace(/\s+/g, ' ');
  };

  // Navigation tabs - Top Level: Outstandings vs Statistics
  const [mainReportSection, setMainReportSection] = useState<'outstandings' | 'statistics'>('outstandings');
  // Sub-level under Outstandings: Receivables vs Payables
  const [outstandingsSubSection, setOutstandingsSubSection] = useState<'receivables' | 'payables'>('receivables');

  const [activeMainTab, setActiveMainTab] = useState<'ledgers' | 'create_new_statement' | 'custom_records'>('ledgers');
  const [showManageSellerModal, setShowManageSellerModal] = useState(false);

  // States for report and customer selections
  const [customerFilterId, setCustomerFilterId] = useState<string>('ALL');
  const [reportSellerCode, setReportSellerCode] = useState<string>('ALL');
  const [reportCategory, setReportCategory] = useState<'ALL' | 'FASTENERS' | 'COATING'>('ALL');
  const [reportTab, setReportTab] = useState<'monthly' | 'yearly'>('monthly');
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [outstandingsSearchQuery, setOutstandingsSearchQuery] = useState<string>('');
  const [reportFromDate, setReportFromDate] = useState<string>('');
  const [reportToDate, setReportToDate] = useState<string>('');

  // Receivables Print PDF Modal & Pagination States
  const [showPrintPdfChoiceModal, setShowPrintPdfChoiceModal] = useState(false);
  const [recPage, setRecPage] = useState<number>(1);
  const [recRowsPerPage, setRecRowsPerPage] = useState<number>(10);
  const [receivablesViewMode, setReceivablesViewMode] = useState<'pending' | 'full'>('pending');

  // Helper to retrieve itemized pending customer tax invoices (Receivables)
  const getPendingReceivablesInvoices = () => {
    const list: {
      customer: CustomerRecord;
      tx: SoaTransaction;
      pendingAmount: number;
      sellerCode: string;
      overdueDays: number;
    }[] = [];

    const customerList = customers.filter(c => {
      if (c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER')) return false;
      if (customerFilterId !== 'ALL' && c.id !== customerFilterId) return false;
      return true;
    });

    customerList.forEach(c => {
      const txs = customerTransactions[c.id] || [];
      const seller = customerSellerMap[c.id] || 'FSL';
      if (reportSellerCode !== 'ALL' && seller !== reportSellerCode) return;

      let foundPendingTx = false;
      txs.forEach(tx => {
        const pending = Number(tx.amount || 0) - Number(tx.amountPaid || 0);
        if (pending > 0) {
          foundPendingTx = true;
          const overdue = calculateOverdueDaysFromTerms(tx.deliveryDates, tx.date, tx.paymentTerms, stmtDate);
          list.push({
            customer: c,
            tx,
            pendingAmount: pending,
            sellerCode: seller,
            overdueDays: overdue
          });
        }
      });

      // If customer has a net pending balance in totals but no individual tx with pending > 0
      const cTotals = getCustomerTotals(c.id);
      if (!foundPendingTx && cTotals.pending > 0) {
        list.push({
          customer: c,
          tx: {
            id: `tx-bal-${c.id}`,
            date: '2026-06-01',
            paymentTerms: '30 Days',
            overdueDays: 0,
            lpoRef: '—',
            invoiceRef: `INV-${c.id.replace('cust-ocr-', 'MFI-')}`,
            woRef: '—',
            deliveryDates: '—',
            amount: cTotals.totalSales,
            datePaid: '—',
            receiptNo: '—',
            paymentMode: '—',
            amountPaid: cTotals.totalPaid
          },
          pendingAmount: cTotals.pending,
          sellerCode: seller,
          overdueDays: 0
        });
      }
    });

    let filtered = list;
    if (reportFromDate) {
      filtered = filtered.filter(item => item.tx.date && item.tx.date >= reportFromDate);
    }
    if (reportToDate) {
      filtered = filtered.filter(item => item.tx.date && item.tx.date <= reportToDate);
    }

    if (!outstandingsSearchQuery.trim()) return filtered;
    const q = outstandingsSearchQuery.trim().toLowerCase();
    return filtered.filter(item => 
      item.customer.companyName.toLowerCase().includes(q) ||
      item.customer.id.toLowerCase().includes(q) ||
      item.tx.invoiceRef.toLowerCase().includes(q) ||
      item.tx.lpoRef.toLowerCase().includes(q) ||
      item.tx.woRef.toLowerCase().includes(q)
    );
  };

  // Helper to retrieve ALL customer tax invoices (Both Paid & Pending for Full Report)
  const getAllReceivablesInvoices = () => {
    const list: {
      customer: CustomerRecord;
      tx: SoaTransaction;
      pendingAmount: number;
      sellerCode: string;
      overdueDays: number;
      isPaid: boolean;
    }[] = [];

    const customerList = customers.filter(c => {
      if (c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER')) return false;
      if (customerFilterId !== 'ALL' && c.id !== customerFilterId) return false;
      return true;
    });

    customerList.forEach(c => {
      const txs = customerTransactions[c.id] || [];
      const seller = customerSellerMap[c.id] || 'FSL';
      if (reportSellerCode !== 'ALL' && seller !== reportSellerCode) return;

      if (txs.length > 0) {
        txs.forEach(tx => {
          const amt = Number(tx.amount || 0);
          const paid = Number(tx.amountPaid || 0);
          const pending = Math.max(0, amt - paid);
          const overdue = calculateOverdueDaysFromTerms(tx.deliveryDates, tx.date, tx.paymentTerms, stmtDate);
          
          if (amt > 0) {
            list.push({
              customer: c,
              tx,
              pendingAmount: pending,
              sellerCode: seller,
              overdueDays: overdue,
              isPaid: pending <= 0
            });
          }
        });
      } else {
        const cTotals = getCustomerTotals(c.id);
        if (cTotals.totalSales > 0) {
          list.push({
            customer: c,
            tx: {
              id: `tx-all-${c.id}`,
              date: '2026-06-01',
              paymentTerms: '30 Days',
              overdueDays: 0,
              lpoRef: '—',
              invoiceRef: `INV-${c.id.replace('cust-ocr-', 'MFI-')}`,
              woRef: '—',
              deliveryDates: '—',
              amount: cTotals.totalSales,
              datePaid: '—',
              receiptNo: '—',
              paymentMode: '—',
              amountPaid: cTotals.totalPaid
            },
            pendingAmount: cTotals.pending,
            sellerCode: seller,
            overdueDays: 0,
            isPaid: cTotals.pending <= 0
          });
        }
      }
    });

    let filtered = list;
    if (reportFromDate) {
      filtered = filtered.filter(item => item.tx.date && item.tx.date >= reportFromDate);
    }
    if (reportToDate) {
      filtered = filtered.filter(item => item.tx.date && item.tx.date <= reportToDate);
    }

    if (!outstandingsSearchQuery.trim()) return filtered;
    const q = outstandingsSearchQuery.trim().toLowerCase();
    return filtered.filter(item => 
      item.customer.companyName.toLowerCase().includes(q) ||
      item.customer.id.toLowerCase().includes(q) ||
      item.tx.invoiceRef.toLowerCase().includes(q) ||
      item.tx.lpoRef.toLowerCase().includes(q) ||
      item.tx.woRef.toLowerCase().includes(q)
    );
  };

  // Generate & Print Accounts Receivable PDF Report
  const handlePrintReceivablesPDF = (type: 'pending' | 'full') => {
    if (customerFilterId === 'ALL') {
      printAllCustomersMasterSoaReport(type, false);
      return;
    }
    const isPendingReport = type === 'pending';
    const targetId = customerFilterId !== 'ALL' ? customerFilterId : (selectedCustomerIdForSoa || activeCustomer?.id || (customers.length > 0 ? customers[0].id : null));
    if (targetId) {
      printCustomerSoaById(targetId, isPendingReport);
      setShowPrintPdfChoiceModal(false);
      return;
    }
  };

  // Helper to retrieve itemized pending supplier tax invoices (Payables)
  const getPendingPayablesInvoices = () => {
    const list: {
      supplier: CustomerRecord;
      tx: SoaTransaction;
      pendingAmount: number;
      sellerCode: string;
      overdueDays: number;
    }[] = [];

    const supplierList = customers.filter(c => {
      if (!c.id?.startsWith('supp-') && !c.companyName.toUpperCase().includes('SUPPLIER')) return false;
      if (supplierFilterId !== 'ALL' && c.id !== supplierFilterId) return false;
      return true;
    });

    supplierList.forEach(s => {
      const txs = customerTransactions[s.id] || [];
      const seller = customerSellerMap[s.id] || 'FSL';

      let foundPendingTx = false;
      txs.forEach(tx => {
        const pending = Number(tx.amount || 0) - Number(tx.amountPaid || 0);
        if (pending > 0) {
          foundPendingTx = true;
          const overdue = calculateOverdueDaysFromTerms(tx.deliveryDates, tx.date, tx.paymentTerms, stmtDate);
          list.push({
            supplier: s,
            tx,
            pendingAmount: pending,
            sellerCode: seller,
            overdueDays: overdue
          });
        }
      });

      const sTotals = getCustomerTotals(s.id);
      if (!foundPendingTx && sTotals.pending > 0) {
        list.push({
          supplier: s,
          tx: {
            id: `tx-bal-${s.id}`,
            date: '2026-06-01',
            paymentTerms: '30 Days',
            overdueDays: 0,
            lpoRef: '—',
            invoiceRef: `SUPP-BILL-${s.id.replace('supp-', '').toUpperCase()}`,
            woRef: '—',
            deliveryDates: '—',
            amount: sTotals.totalSales,
            datePaid: '—',
            receiptNo: '—',
            paymentMode: '—',
            amountPaid: sTotals.totalPaid
          },
          pendingAmount: sTotals.pending,
          sellerCode: seller,
          overdueDays: 0
        });
      }
    });

    if (!outstandingsSearchQuery.trim()) return list;
    const q = outstandingsSearchQuery.trim().toLowerCase();
    return list.filter(item => 
      item.supplier.companyName.toLowerCase().includes(q) ||
      item.supplier.id.toLowerCase().includes(q) ||
      item.tx.invoiceRef.toLowerCase().includes(q) ||
      item.tx.lpoRef.toLowerCase().includes(q) ||
      item.tx.woRef.toLowerCase().includes(q)
    );
  };

  // Helper to retrieve ALL supplier tax invoices (Both Paid & Pending for Payables Full Report)
  const getAllPayablesInvoices = () => {
    const list: {
      supplier: CustomerRecord;
      tx: SoaTransaction;
      pendingAmount: number;
      sellerCode: string;
      overdueDays: number;
      isPaid: boolean;
    }[] = [];

    const supplierList = customers.filter(c => {
      if (!c.id?.startsWith("supp-") && !c.companyName.toUpperCase().includes("SUPPLIER")) return false;
      if (supplierFilterId !== "ALL" && c.id !== supplierFilterId) return false;
      return true;
    });

    supplierList.forEach(s => {
      const txs = customerTransactions[s.id] || [];
      const seller = customerSellerMap[s.id] || "FSL";

      if (txs.length > 0) {
        txs.forEach(tx => {
          const amt = Number(tx.amount || 0);
          const paid = Number(tx.amountPaid || 0);
          const pending = Math.max(0, amt - paid);
          const overdue = calculateOverdueDaysFromTerms(tx.deliveryDates, tx.date, tx.paymentTerms, stmtDate);
          if (amt > 0) {
            list.push({
              supplier: s,
              tx,
              pendingAmount: pending,
              sellerCode: seller,
              overdueDays: overdue,
              isPaid: pending <= 0
            });
          }
        });
      } else {
        const sTotals = getCustomerTotals(s.id);
        if (sTotals.totalSales > 0) {
          list.push({
            supplier: s,
            tx: {
              id: `tx-all-${s.id}`,
              date: "2026-06-01",
              paymentTerms: "30 Days",
              overdueDays: 0,
              lpoRef: "—",
              invoiceRef: `SUPP-BILL-${s.id.replace("supp-", "").toUpperCase()}`,
              woRef: "—",
              deliveryDates: "—",
              amount: sTotals.totalSales,
              datePaid: "—",
              receiptNo: "—",
              paymentMode: "—",
              amountPaid: sTotals.totalPaid
            },
            pendingAmount: sTotals.pending,
            sellerCode: seller,
            overdueDays: 0,
            isPaid: sTotals.pending <= 0
          });
        }
      }
    });

    let filtered = list;
    if (reportFromDate) {
      filtered = filtered.filter(item => item.tx.date && item.tx.date >= reportFromDate);
    }
    if (reportToDate) {
      filtered = filtered.filter(item => item.tx.date && item.tx.date <= reportToDate);
    }

    if (!outstandingsSearchQuery.trim()) return filtered;
    const q = outstandingsSearchQuery.trim().toLowerCase();
    return filtered.filter(item => 
      item.supplier.companyName.toLowerCase().includes(q) ||
      item.supplier.id.toLowerCase().includes(q) ||
      item.tx.invoiceRef.toLowerCase().includes(q) ||
      item.tx.lpoRef.toLowerCase().includes(q) ||
      item.tx.woRef.toLowerCase().includes(q)
    );
  };


  // States for 'Create New Statement' builder form:
  const [stmtType, setStmtType] = useState<'receivables_outstanding' | 'payables_outstanding'>('receivables_outstanding');
  const [stmtCompanyName, setStmtCompanyName] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [stmtCustomerCode, setStmtCustomerCode] = useState('');
  const [stmtAddress, setStmtAddress] = useState('');
  const [stmtPhone, setStmtPhone] = useState('');
  const [stmtPoBox, setStmtPoBox] = useState('');
  const [stmtTrn, setStmtTrn] = useState('');
  const [stmtSellerCode, setStmtSellerCode] = useState('FSL');
  const [stmtCurrency, setStmtCurrency] = useState('AED');
  const [stmtDate, setStmtDate] = useState('2026-06-22');
  const [stmtPeriodFrom, setStmtPeriodFrom] = useState('2026-01-01');
  const [stmtPeriodTo, setStmtPeriodTo] = useState('2026-12-31');
  const [stmtShowDeliveryDate, setStmtShowDeliveryDate] = useState<boolean>(false);

  // Hook: Auto-calculate overdue days for the main transaction form
  useEffect(() => {
    const calculated = calculateOverdueDaysFromTerms(txDelivery, txDate, txPaymentTerms);
    setTxOverdueDays(calculated.toString());
  }, [txDelivery, txDate, txPaymentTerms, stmtDate]);

  // New statement temporary transaction list
  const [stmtTxs, setStmtTxs] = useState<SoaTransaction[]>([]);
  // Transaction entry form for the statement builder:
  const [stmtRowDate, setStmtRowDate] = useState('2026-06-22');
  const [stmtRowTerms, setStmtRowTerms] = useState('60 Days');
  const [stmtRowOverdue, setStmtRowOverdue] = useState('0');
  const [stmtRowLpo, setStmtRowLpo] = useState('');
  const [stmtRowInvoice, setStmtRowInvoice] = useState('');
  const [stmtRowWo, setStmtRowWo] = useState('');
  const [stmtRowDelivery, setStmtRowDelivery] = useState('');
  const [stmtRowAmount, setStmtRowAmount] = useState('');
  const [stmtRowDatePaid, setStmtRowDatePaid] = useState('—');
  const [stmtRowReceipt, setStmtRowReceipt] = useState('—');
  const [stmtRowMode, setStmtRowMode] = useState('—');
  const [stmtRowAmtPaid, setStmtRowAmtPaid] = useState('');

  // Hook: Auto-calculate overdue days for custom statement wizard entries
  useEffect(() => {
    const calculated = calculateOverdueDaysFromTerms(stmtRowDelivery, stmtRowDate, stmtRowTerms, stmtDate);
    setStmtRowOverdue(calculated.toString());
  }, [stmtRowDelivery, stmtRowDate, stmtRowTerms, stmtDate]);

  // Hook: recalculate overdueDays on existing custom statement builder rows when stmtDate changes
  useEffect(() => {
    setStmtTxs(prev => prev.map(t => ({
      ...t,
      overdueDays: calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms, stmtDate)
    })));
  }, [stmtDate]);

  // Hook: recalculate and set stmtAging dynamically when stmtTxs changes
  useEffect(() => {
    const newAging: CustomerAging = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };
    stmtTxs.forEach(t => {
      const balance = Number(t.amount || 0) - Number(t.amountPaid || 0);
      if (balance > 0) {
        const age = Number(t.overdueDays) || 0;
        if (age <= 0) {
          newAging.current += balance;
        } else if (age <= 30) {
          newAging.days1to30 += balance;
        } else if (age <= 60) {
          newAging.days31to60 += balance;
        } else if (age <= 90) {
          newAging.days61to90 += balance;
        } else if (age <= 120) {
          newAging.days91to120 += balance;
        } else {
          newAging.over120 += balance;
        }
      }
    });
    setStmtAging(newAging);
  }, [stmtTxs]);

  // Aging overrides for the compiled custom statement
  const [stmtAging, setStmtAging] = useState<CustomerAging>({
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    days91to120: 0,
    over120: 0
  });

  const [editingStatementId, setEditingStatementId] = useState<string | null>(null);
  const [recordsSearchQuery, setRecordsSearchQuery] = useState('');
  const [recordsFilterSellerCode, setRecordsFilterSellerCode] = useState<string>('ALL');
  const [recordsCategory, setRecordsCategory] = useState<'customer' | 'supplier'>('customer');

  // Default Bank Details inside custom statement forms
  const [stmtBankDetails, setStmtBankDetails] = useState(() => {
    const cp = getCompanyProfile();
    return {
      beneficiary: cp.bankBeneficiary || cp.name,
      bankName: cp.bankName || 'RAK BANK',
      accountNo: cp.bankAccountNo || '0242715908001',
      branch: cp.bankBranch || 'KING FAISAL STREET, SHARJAH',
      country: cp.bankCountry || 'UNITED ARAB EMIRATES',
      iban: cp.bankIban || 'AE 940400000242715908001',
      swiftCode: cp.bankSwiftCode || 'NRAKAEAK',
      address: cp.bankBranch ? `${cp.bankName || 'RAK BANK'}, ${cp.bankBranch}` : 'RAK BANK, P.O.BOX: 1531, DUBAI, UAE.'
    };
  });

  // Save State Utilities
  useEffect(() => {
    const current = localStorage.getItem('MFI_SOA_SELLERS');
    const next = JSON.stringify(sellers);
    if (current !== next) {
      localStorage.setItem('MFI_SOA_SELLERS', next);
      window.dispatchEvent(new Event('mfi_sellers_updated'));
    }
  }, [sellers]);

  useEffect(() => {
    const current = localStorage.getItem('MFI_CUSTOMER_SELLER_MAPPING');
    const next = JSON.stringify(customerSellerMap);
    if (current !== next) {
      localStorage.setItem('MFI_CUSTOMER_SELLER_MAPPING', next);
    }
  }, [customerSellerMap]);

  useEffect(() => {
    const current = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
    const next = JSON.stringify(customerTransactions);
    if (current !== next) {
      localStorage.setItem('MFI_SOA_CUSTOMER_TRANSACTIONS', next);
    }
  }, [customerTransactions]);

  useEffect(() => {
    const current = localStorage.getItem('MFI_SOA_AGING_OVERRIDES');
    const next = JSON.stringify(agingOverrides);
    if (current !== next) {
      localStorage.setItem('MFI_SOA_AGING_OVERRIDES', next);
    }
  }, [agingOverrides]);

  // State for viewing dynamic receipts
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<any | null>(null);

  // High-fidelity cash/cheque receipt voucher printing helper
  const handlePrintReceipt = (rc: any) => {
    if (!rc) return;
    
    // AED Number to words helper
    const numberToWordsDirhams = (num: number): string => {
      if (num === 0) return 'ZERO DIRHAMS ONLY';
      const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
      const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
      const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];

      const convertLessThanThousand = (n: number): string => {
        let str = '';
        if (n >= 100) {
          str += ones[Math.floor(n / 100)] + ' HUNDRED ';
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
      const integerPart = parseInt(parts[0]);
      const decimalPart = parseInt(parts[1]);

      let integerWords = '';
      if (integerPart === 0) {
        integerWords = 'ZERO';
      } else {
        let temp = integerPart;
        let scaleIdx = 0;
        while (temp > 0) {
          const chunk = temp % 1000;
          if (chunk > 0) {
            integerWords = convertLessThanThousand(chunk) + ' ' + scales[scaleIdx] + ' ' + integerWords;
          }
          temp = Math.floor(temp / 1000);
          scaleIdx++;
        }
      }

      let decimalWords = '';
      if (decimalPart > 0) {
        decimalWords = ' AND ' + convertLessThanThousand(decimalPart) + ' FILS';
      }

      return `${integerWords.trim()}${decimalWords} AED ONLY`.toUpperCase().replace(/\s+/g, ' ');
    };

    const companyProfile = getCompanyProfile();
    const words = numberToWordsDirhams(Number(rc.amountReceived || 0));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MFI Cash/Cheque Receipt Voucher #${rc.voucherNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;750;900&family=JetBrains+Mono:wght@400;700;900&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: "Plus Jakarta Sans", "Helvetica Neue", sans-serif;
            padding: 20px;
            color: #0f172a;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          
          .voucher-container {
            width: 7in;
            min-height: 5.3in;
            height: auto;
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            padding: 8px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .double-ring-border {
            border: 3px double #1e3a8a;
            border-radius: 4px;
            padding: 10px;
            min-height: calc(5.3in - 16px);
            height: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          .header-box {
            border: 1px solid #1e3a8a;
            padding: 4px;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .header-left {
            width: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .header-mid {
            flex: 1;
            text-align: center;
            padding: 0 5px;
          }
          
          .company-title-en {
            font-size: 11px;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: 0.2px;
            text-transform: uppercase;
          }
          
          .company-title-ar {
            font-size: 13.5px;
            font-weight: bold;
            color: #1e3a8a;
            font-family: serif;
            margin-top: 1px;
            direction: rtl;
            line-height: 1;
          }
          
          .company-subtitle {
            font-size: 7px;
            color: #0d1e4a;
            font-weight: 800;
            margin-top: 2px;
            border-top: 1px solid #1e3a8a;
            padding-top: 2px;
            text-transform: uppercase;
            letter-spacing: 0.1px;
          }
          
          .company-contact {
            font-size: 5.8px;
            color: #475569;
            margin-top: 1.5px;
            line-height: 1.2;
            font-weight: 500;
          }
          
          .title-strip {
            border-top: 2px solid #1e3a8a;
            border-bottom: 2px solid #1e3a8a;
            padding: 4px 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            background-color: #ffffff;
          }
          
          .voucher-no-label {
            font-size: 11px;
            font-weight: 900;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          
          .voucher-no-val {
            font-size: 13px;
            font-weight: 950;
            color: #be123c;
            font-family: 'JetBrains Mono', monospace;
            margin-left: 6px;
            border-bottom: 1px solid #f43f5e;
            padding-bottom: 0.5px;
            display: inline-block;
            min-width: 50px;
          }
          
          .payment-badges-group {
            display: flex;
            gap: 8px;
          }
          
          .payment-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            border: 1px solid #1e3a8a;
            border-radius: 9999px;
            padding: 2px 10px;
            font-size: 9px;
            font-weight: 900;
            color: #1e3a8a;
          }
          
          .payment-badge.selected {
            background-color: #1e3a8a;
            color: #ffffff;
          }
          
          .payment-circle {
            width: 10px;
            height: 10px;
            border-radius: 9999px;
            border: 1px solid currentColor;
            display: inline-block;
          }
          
          .payment-badge.selected .payment-circle {
            background-color: #ffffff;
            border-color: #ffffff;
          }
          
          .main-grid {
            display: grid;
            grid-template-columns: 105px 1fr 150px;
            gap: 8px;
            margin-bottom: 5px;
          }
          
          .grid-row-full {
            grid-column: span 3;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 4px;
          }
          
          .label {
            font-size: 8px;
            font-weight: 900;
            color: #1e3a8a;
            text-transform: uppercase;
            width: 105px;
            min-width: 105px;
            padding-top: 3px;
          }
          
          .value-box {
            flex: 1;
            border-bottom: 1.5px dotted #94a3b8;
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
            padding-bottom: 2px;
            min-height: 18px;
          }
          
          .value-box-words {
            font-size: 9.5px;
            line-height: 1.3;
          }
          
          .date-box {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            font-size: 9px;
            font-weight: 850;
            color: #1e3a8a;
          }
          
          .date-val {
            border-bottom: 1.5px solid #1e3a8a;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 900;
            color: #be123c;
            padding-left: 6px;
            font-size: 11px;
          }
          
          .amount-summary-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            padding: 5px;
            background-color: #f8fafc;
            border: 1.5px solid #1e3a8a;
            border-radius: 4px;
          }
          
          .amount-figure-box {
            background-color: #1e3a8a;
            color: #ffffff;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 950;
            padding: 4px 12px;
            border-radius: 4px;
          }
          
          .signatures-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1.2fr;
            gap: 15px;
            margin-top: 15px;
            text-align: center;
          }
          
          .sig-box {
            border-top: 1px solid #1e3a8a;
            padding-top: 4px;
            font-size: 8px;
            font-weight: 900;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          
          @media print {
            body {
              background-color: #ffffff;
              padding: 0;
            }
            .voucher-container {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="voucher-container">
          <div class="double-ring-border">
            <div class="header-box">
              <div class="header-left">
                ${companyProfile.showLogo && companyProfile.logoUrl ? `<img src="${companyProfile.logoUrl}" style="max-height: 40px; max-width: 100%; object-fit: contain;" onerror="this.style.display='none'" />` : ''}
              </div>
              <div class="header-mid">
                <div class="company-title-en">${companyProfile.name}</div>
                ${companyProfile.arabicName ? `<div class="company-title-ar">${companyProfile.arabicName}</div>` : ''}
                <div class="company-subtitle">${companyProfile.tagline || ''}</div>
                <div class="company-contact">${companyProfile.address} | Tel: ${companyProfile.phone || ''} | Email: ${companyProfile.email || ''}</div>
              </div>
            </div>
            
            <div class="title-strip">
              <div style="display: flex; align-items: center;">
                <span class="voucher-no-label">RECEIPT VOUCHER</span>
                <span class="voucher-no-val">${rc.voucherNo}</span>
              </div>
              <div class="payment-badges-group">
                <div class="payment-badge ${rc.paymentMode === 'CASH' ? 'selected' : ''}">
                  <span class="payment-circle"></span> CASH
                </div>
                <div class="payment-badge ${rc.paymentMode === 'CHEQUE' ? 'selected' : ''}">
                  <span class="payment-circle"></span> CHEQUE
                </div>
                <div class="payment-badge ${rc.paymentMode === 'BANK WIRE' || rc.paymentMode === 'BANK TRANSFER' ? 'selected' : ''}">
                  <span class="payment-circle"></span> WIRE TRANSFER
                </div>
              </div>
              <div class="date-box">
                DATE: <span class="date-val">${rc.dated}</span>
              </div>
            </div>
            
            <div class="main-grid">
              <div class="grid-row-full">
                <span class="label">RECEIVED FROM:</span>
                <span class="value-box">${rc.clientName || '—'}</span>
              </div>
              <div class="grid-row-full">
                <span class="label">THE SUM OF DHMS:</span>
                <span class="value-box value-box-words">${words}</span>
              </div>
              <div class="grid-row-full">
                <span class="label">BEING AGAINST:</span>
                <span class="value-box">
                  ${rc.narration || 'BEING ACCOUNT SETTLEMENT'} 
                  ${rc.invoiceAllocated ? `(Allocated Invoice: ${rc.invoiceAllocated})` : ''}
                </span>
              </div>
              
              <div class="grid-row-full">
                <span class="label">CHEQUE NO:</span>
                <span class="value-box" style="flex: 0.6; min-width: 120px;">${rc.chequeNoDetails || '—'}</span>
                
                <span class="label" style="width: 50px; min-width: 50px; text-align: right;">DATE:</span>
                <span class="value-box" style="flex: 0.5; min-width: 100px;">${rc.chequeDate || rc.dated || '—'}</span>
                
                <span class="label" style="width: 50px; min-width: 50px; text-align: right;">BANK:</span>
                <span class="value-box" style="flex: 1;">${rc.bankName || '—'}</span>
              </div>
            </div>
            
            <div class="amount-summary-strip">
              <div style="font-size: 8px; font-weight: 900; color: #1e3a8a;">AMOUNT (AED):</div>
              <div class="amount-figure-box">AED *${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(rc.amountReceived || 0)}*</div>
            </div>
            
            <div class="signatures-row">
              <div class="sig-box">PREPARED BY</div>
              <div class="sig-box">RECEIVER'S SIGNATURE</div>
              <div class="sig-box">DIRECTOR / MANAGER</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    printHtml(htmlContent);
  };

  // Helper: Filter transactions by year/month with dynamic Receipt integration
  const getFilteredTransactions = (customerId: string) => {
    const list = [...(customerTransactions[customerId] || [])];
    
    // Load physical receipt vouchers dynamically to merge into SOA
    const savedReceiptsJson = localStorage.getItem('MF_RECEIPT_VOUCHERS');
    let receiptVouchers: any[] = [];
    if (savedReceiptsJson) {
      try {
        receiptVouchers = JSON.parse(savedReceiptsJson);
      } catch (e) {}
    }

    // Load financial vouchers from local storage to merge into SOA as well
    const savedFinancialJson = localStorage.getItem('MF_FINANCIAL_VOUCHERS');
    let financialVouchers: any[] = [];
    if (savedFinancialJson) {
      try {
        const parsed = JSON.parse(savedFinancialJson);
        if (Array.isArray(parsed)) {
          financialVouchers = parsed;
        }
      } catch (e) {}
    }

    // Find the current active customer to perform accurate string matches on Client Name
    const activeCust = customers.find(c => c.id === customerId);
    const cleanCustName = activeCust 
      ? activeCust.companyName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '').trim().toUpperCase() 
      : '';
    const isSupplier = customerId.startsWith('supp-') || cleanCustName.startsWith('SUPPLIER') || (activeCust?.companyName || '').toUpperCase().includes('SUPPLIER');

    // Filter receipt vouchers that directly match this customer/supplier
    const matchingReceipts = receiptVouchers.filter(rc => {
      if (!cleanCustName) return false;
      const rcPayer = (rc.clientName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      if (rcPayer === cleanCustName || rcPayer.includes(cleanCustName) || cleanCustName.includes(rcPayer)) return true;

      // Fallback matching: If the receipt is allocated specifically to an invoice that belongs to this customer
      return list.some(t => 
        (t.invoiceRef && t.invoiceRef !== '—' && (t.invoiceRef === rc.invoiceAllocated || (rc.invoiceAllocated || '').split(',').map((s: string)=>s.trim()).includes(t.invoiceRef))) ||
        (t.woRef && t.woRef !== '—' && t.woRef === rc.invoiceAllocated) ||
        (t.invoiceRef && t.invoiceRef !== '—' && (t.invoiceRef === rc.receivedAgainstInvoice || (rc.receivedAgainstInvoice || '').split(',').map((s: string)=>s.trim()).includes(t.invoiceRef)))
      );
    });

    // Filter financial vouchers of type RECEIPT (for customers) or PAYMENT (for suppliers)
    const matchingFinancial = financialVouchers.filter(v => {
      if (!cleanCustName) return false;
      const party = (v.partyName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      if (party === cleanCustName || party.includes(cleanCustName) || cleanCustName.includes(party)) {
        if (isSupplier) {
          return v.voucherType === 'PAYMENT' || v.voucherType === 'PURCHASE';
        } else {
          return v.voucherType === 'RECEIPT' || v.voucherType === 'SALES';
        }
      }
      return list.some(t => 
        t.invoiceRef && t.invoiceRef !== '—' && t.invoiceRef === v.referenceNo
      );
    });

    // Map matched physical receipt vouchers to statement ledger format
    const mappedReceipts = matchingReceipts.map(rc => ({
      id: 'rc-link-' + rc.id,
      date: rc.dated || '',
      paymentTerms: 'Receipt Voucher',
      overdueDays: 0,
      lpoRef: rc.receivedAgainstPo || '—',
      invoiceRef: rc.invoiceAllocated || rc.receivedAgainstInvoice || '—',
      woRef: rc.invoiceAllocated || '—',
      deliveryDates: '—',
      amount: 0, // payment credit, does not charge debtor balance
      datePaid: rc.dated || '',
      receiptNo: 'RV-' + rc.voucherNo,
      paymentMode: rc.paymentMode || 'CHEQUE',
      amountPaid: Number(rc.amountReceived || 0),
      isLinkedReceipt: true,
      receiptRawData: rc
    }));

    // Map matched financial vouchers to statement ledger format
    const mappedFinancial = matchingFinancial.map(v => {
      const isCharge = v.voucherType === 'PURCHASE' || v.voucherType === 'SALES';
      return {
        id: 'fin-link-' + v.id,
        date: v.date || '',
        paymentTerms: v.voucherType === 'RECEIPT' ? 'Receipt Voucher' : (v.voucherType === 'PAYMENT' ? 'Payment Voucher' : (v.voucherType === 'PURCHASE' ? 'Purchase Invoice' : 'Sales Invoice')),
        overdueDays: 0,
        lpoRef: '—',
        invoiceRef: v.referenceNo || '—',
        woRef: '—',
        deliveryDates: '—',
        amount: isCharge ? Number(v.amount || 0) : 0,
        datePaid: !isCharge ? (v.date || '') : '—',
        receiptNo: v.voucherNo || '—',
        paymentMode: 'CHEQUE/CASH',
        amountPaid: !isCharge ? Number(v.amount || 0) : 0,
        isLinkedReceipt: true,
        receiptRawData: v
      };
    });

    // Dynamic Self-Healing payment state logic:
    // Calculate allocated paid amounts per invoice from matching receipts and financial vouchers
    const invoiceAllocatedPaidMap: Record<string, number> = {};

    matchingReceipts.forEach(rc => {
      const rcAmt = Number(rc.amountReceived || 0);
      if (rcAmt <= 0) return;

      const allocStr = (rc.invoiceAllocated || rc.receivedAgainstInvoice || '').trim();
      if (!allocStr) return;

      const refs = allocStr.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (refs.length === 1) {
        const ref = refs[0];
        invoiceAllocatedPaidMap[ref] = (invoiceAllocatedPaidMap[ref] || 0) + rcAmt;
      } else if (refs.length > 1) {
        // Distribute rcAmt sequentially across invoice refs up to each invoice amount
        let remaining = rcAmt;
        refs.forEach(ref => {
          if (remaining <= 0) return;
          const matchedTx = list.find(t => t.invoiceRef === ref);
          const txAmt = matchedTx ? Number(matchedTx.amount || 0) : remaining;
          const allocToRef = Math.min(txAmt, remaining);
          invoiceAllocatedPaidMap[ref] = (invoiceAllocatedPaidMap[ref] || 0) + allocToRef;
          remaining -= allocToRef;
        });
        if (remaining > 0 && refs.length > 0) {
          const lastRef = refs[refs.length - 1];
          invoiceAllocatedPaidMap[lastRef] = (invoiceAllocatedPaidMap[lastRef] || 0) + remaining;
        }
      }
    });

    matchingFinancial.forEach(v => {
      if (v.referenceNo && v.referenceNo !== '—') {
        invoiceAllocatedPaidMap[v.referenceNo] = (invoiceAllocatedPaidMap[v.referenceNo] || 0) + Number(v.amount || 0);
      }
    });

    // Apply allocated paid sums to invoice items
    list.forEach((tx, idx) => {
      const allocatedPaid = invoiceAllocatedPaidMap[tx.invoiceRef] || 0;
      if (allocatedPaid > 0) {
        list[idx].amountPaid = Math.min(Number(tx.amount || 0), Math.max(Number(tx.amountPaid || 0), allocatedPaid));
        list[idx].datePaid = tx.datePaid !== '—' ? tx.datePaid : new Date().toISOString().substring(0, 10);
      }
    });

    // Merge ledger charges list with cash received credits list
    const mergedList = [...list, ...mappedReceipts, ...mappedFinancial];

    // Sort chronologically by entry date
    mergedList.sort((a, b) => {
      const dateA = new Date(a.date || '').getTime() || 0;
      const dateB = new Date(b.date || '').getTime() || 0;
      return dateA - dateB;
    });

    // Find all invoice references linked to actual physical receipts or financial vouchers
    const linkedInvoiceRefs = new Set([
      ...mappedReceipts.map(rc => rc.invoiceRef).filter(ref => ref && ref !== '—'),
      ...mappedFinancial.map(v => v.invoiceRef).filter(ref => ref && ref !== '—')
    ]);

    return mergedList.filter(t => {
      const isUnpaid = (Number(t.amount || 0) - Number(t.amountPaid || 0)) > 0.01;

      // Filter by payment status if showUnpaidOnly is active
      if (showUnpaidOnly && !isUnpaid) {
        return false;
      }

      // If it is unpaid (pending bill), and ignoreDateForUnpaid is enabled, let it bypass date filters
      if (isUnpaid && ignoreDateForUnpaid) {
        return true;
      }

      if (!t.date) return false;
      const tDate = parseRobustDate(t.date);
      if (!tDate) return false;
      const yearMatches = filterYear === 'ALL' || tDate.getFullYear().toString() === filterYear;
      let monthMatches = true;
      if (filterMonth !== 'ALL') {
        const monNum = tDate.getMonth() + 1; // 1-12
        monthMatches = monNum.toString() === filterMonth;
      }
      return yearMatches && monthMatches;
    }).map(t => {
      return {
        ...t,
        overdueDays: calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms)
      };
    });
  };

  // Helper: Calculate totals for a customer
  const getCustomerTotals = (customerId: string) => {
    const filteredTxs = getFilteredTransactions(customerId);
    let totalSales = 0;
    let totalPaid = 0;

    const hasLinkedReceipts = filteredTxs.some(t => t.isLinkedReceipt && Number(t.amountPaid || 0) > 0);

    filteredTxs.forEach(t => {
      if (!t.isLinkedReceipt) {
        totalSales += Number(t.amount || 0);
        if (!hasLinkedReceipts) {
          totalPaid += Number(t.amountPaid || 0);
        }
      } else {
        totalPaid += Number(t.amountPaid || 0);
      }
    });
    const pending = totalSales - totalPaid;
    return { totalSales, totalPaid, pending };
  };

  // Helper: Get final aging for a customer (uses manual user override if set, otherwise computes dynamically)
  const getCustomerAgingObj = (customerId: string): CustomerAging => {
    if (agingOverrides[customerId]) {
      return agingOverrides[customerId];
    }
    const txs = getFilteredTransactions(customerId);
    const aging: CustomerAging = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };
    txs.forEach(t => {
      if (t.isLinkedReceipt) return;
      const balance = Number(t.amount || 0) - Number(t.amountPaid || 0);
      if (balance > 0) {
        const age = Number(t.overdueDays) || 0;
        if (age <= 0) {
          aging.current += balance;
        } else if (age <= 30) {
          aging.days1to30 += balance;
        } else if (age <= 60) {
          aging.days31to60 += balance;
        } else if (age <= 90) {
          aging.days61to90 += balance;
        } else if (age <= 120) {
          aging.days91to120 += balance;
        } else {
          aging.over120 += balance;
        }
      }
    });
    return aging;
  };

  // Helper: Matches Category (Fasteners vs Coating)
  const matchesCategory = (t: SoaTransaction, cat: 'ALL' | 'FASTENERS' | 'COATING') => {
    if (cat === 'ALL') return true;
    const ref = (t.invoiceRef || '').toUpperCase();
    const lpo = (t.lpoRef || '').toUpperCase();
    const isCoating = ref.includes('COAT') || ref.includes('CG') || ref.includes('JOB') || lpo.includes('COAT') || lpo.includes('CG');
    if (cat === 'COATING') return isCoating;
    return !isCoating;
  };

  // Helper: Calculate grand totals for a selected seller
  const getSellerGrandTotals = (sellerCode: string) => {
    let sales = 0;
    let received = 0;
    let pending = 0;

    customers.forEach(cust => {
      const isAssigned = (sellerCode === 'ALL') || (customerSellerMap[cust.id] === sellerCode);
      if (isAssigned) {
        const txs = customerTransactions[cust.id] || [];
        const linkedRefs = new Set(txs.filter(t => t.isLinkedReceipt && t.invoiceRef && t.invoiceRef !== '—').map(t => t.invoiceRef));
        txs.forEach(t => {
          if (!matchesCategory(t, reportCategory)) return;
          sales += Number(t.amount || 0);
          if (t.isLinkedReceipt) {
            received += Number(t.amountPaid || 0);
          } else {
            if (!linkedRefs.has(t.invoiceRef)) {
              received += Number(t.amountPaid || 0);
            }
          }
        });
      }
    });

    pending = sales - received;
    return { sales, received, pending };
  };

  // Helper: Get seller wise monthly sales report
  const getSellerMonthlyReport = (sellerCode: string, targetYear: string) => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const dateForMonth = new Date(2026, i, 1);
      return {
        monthIndex: i + 1,
        monthName: dateForMonth.toLocaleString('en-US', { month: 'long' }),
        monthShort: dateForMonth.toLocaleString('en-US', { month: 'short' }),
        sales: 0,
        received: 0,
        pending: 0
      };
    });

    customers.forEach(cust => {
      const isAssigned = (sellerCode === 'ALL') || (customerSellerMap[cust.id] === sellerCode);
      if (isAssigned) {
        const txs = customerTransactions[cust.id] || [];
        txs.forEach(t => {
          if (!t.date) return;
          if (!matchesCategory(t, reportCategory)) return;
          const tDate = new Date(t.date);
          const tYear = tDate.getFullYear().toString();
          if (targetYear === 'ALL' || tYear === targetYear) {
            const tMonth = tDate.getMonth(); // 0-11
            monthlyData[tMonth].sales += Number(t.amount || 0);
            monthlyData[tMonth].received += Number(t.amountPaid || 0);
            monthlyData[tMonth].pending += (Number(t.amount || 0) - Number(t.amountPaid || 0));
          }
        });
      }
    });

    return monthlyData;
  };

  // Helper: Get seller wise yearly sales report
  const getSellerYearlyReport = (sellerCode: string) => {
    const years = ['2024', '2025', '2026'];
    return years.map(yr => {
      let sales = 0;
      let received = 0;
      let pending = 0;

      customers.forEach(cust => {
        const isAssigned = (sellerCode === 'ALL') || (customerSellerMap[cust.id] === sellerCode);
        if (isAssigned) {
          const txs = customerTransactions[cust.id] || [];
          txs.forEach(t => {
            if (!t.date) return;
            if (!matchesCategory(t, reportCategory)) return;
            const tDate = new Date(t.date);
            const tYear = tDate.getFullYear().toString();
            if (tYear === yr) {
              sales += Number(t.amount || 0);
              received += Number(t.amountPaid || 0);
              pending += (Number(t.amount || 0) - Number(t.amountPaid || 0));
            }
          });
        }
      });

      return {
        year: yr,
        sales,
        received,
        pending
      };
    });
  };

  // Helper: Get transactions for the active selected month and year
  const getRunningMonthTransactions = () => {
    const list: Array<{
      custName: string;
      custId: string;
      date: string;
      invoiceRef: string;
      amount: number;
      amountPaid: number;
      pending: number;
      paymentTerms: string;
      overdueDays: number;
    }> = [];

    customers.forEach(cust => {
      const txs = customerTransactions[cust.id] || [];
      txs.forEach(t => {
        if (!t.date) return;
        const tDate = new Date(t.date);
        const tYear = tDate.getFullYear().toString();
        const tMonth = (tDate.getMonth() + 1).toString();
        
        const yearMatches = filterYear === 'ALL' || tYear === filterYear;
        const monthMatches = filterMonth === 'ALL' || tMonth === filterMonth;

        if (yearMatches && monthMatches) {
          list.push({
            custName: cust.companyName,
            custId: cust.id,
            date: t.date,
            invoiceRef: t.invoiceRef,
            amount: Number(t.amount || 0),
            amountPaid: Number(t.amountPaid || 0),
            pending: Number(t.amount || 0) - Number(t.amountPaid || 0),
            paymentTerms: t.paymentTerms,
            overdueDays: calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms)
          });
        }
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Handle Add custom seller
  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    const codeClean = newSellerCode.trim().toUpperCase();
    if (!codeClean || !newSellerName.trim()) return;

    if (sellers.some(s => s.code === codeClean)) {
      alert('Seller with this code already exists!');
      return;
    }

    const updated = [...sellers, { code: codeClean, name: newSellerName.trim() }];
    setSellers(updated);
    setActiveSellerCode(codeClean);
    setNewSellerCode('');
    setNewSellerName('');
    setShowAddSellerModal(false);
  };

  // Handle Delete a seller with reassignment
  const handleDeleteSeller = (code: string) => {
    if (sellers.length <= 1) {
      alert("At least one seller must remain on the system!");
      return;
    }
    const confirmDel = window.confirm(`Are you sure you want to delete seller ${code}? All their assigned customers will be set back to unassigned.`);
    if (!confirmDel) return;

    // Filter out seller
    const updatedSellers = sellers.filter(s => s.code !== code);
    setSellers(updatedSellers);

    // Reset mapping for affected customers
    const updatedMapping = { ...customerSellerMap };
    Object.keys(updatedMapping).forEach(key => {
      if (updatedMapping[key] === code) {
        delete updatedMapping[key];
      }
    });
    setCustomerSellerMap(updatedMapping);

    // Adjust active seller if deleted
    if (activeSellerCode === code) {
      setActiveSellerCode(updatedSellers[0].code);
    }
  };

  // Helper mapping helper to import a customer's info to build a statement
  const handleImportExistingCustomer = (custId: string) => {
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    const isSupplier = cust.id?.startsWith('supp-') || cust.companyName.toUpperCase().includes('SUPPLIER');
    setStmtType(isSupplier ? 'payables_outstanding' : 'receivables_outstanding');

    setStmtCompanyName(cust.companyName);
    
    // Customer/Supplier code is not needed on import, only company name is ok
    setStmtCustomerCode('');
    
    setStmtAddress(cust.address);
    // Ensure companyName without code on import
    setStmtPhone(cust.phone || '');
    setStmtPoBox(cust.poBox || '');
    setStmtTrn(cust.trn || '');
    setStmtSellerCode(customerSellerMap[cust.id] || 'FSL');

    // Import existing ledger too as default template transactions with on-the-fly overdue days recalculation!
    const ledgers = getFilteredTransactions(cust.id).map(t => ({
      ...t,
      overdueDays: calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms, stmtDate)
    }));
    setStmtTxs(ledgers);

    // Import default aging bucket
    const currentOver = agingOverrides[cust.id] || { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };
    setStmtAging({ ...currentOver });
  };

  // Excel-like Keyboard Navigation and row creation
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    const target = e.target as HTMLInputElement;
    if (!target || target.tagName !== 'INPUT') return;

    const rowAttr = target.getAttribute('data-row');
    const colAttr = target.getAttribute('data-col');
    if (rowAttr === null || colAttr === null) return;

    const row = parseInt(rowAttr, 10);
    const col = parseInt(colAttr, 10);

    const maxRow = stmtTxs.length; // includes final append row
    const maxCol = 11; // 0 to 11

    let nextRow = row;
    let nextCol = col;

    if (e.key === 'ArrowUp') {
      nextRow = Math.max(0, row - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      nextRow = Math.min(maxRow, row + 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      if (target.selectionStart === 0 || target.selectionStart === null) {
        nextCol = Math.max(0, col - 1);
        e.preventDefault();
      }
    } else if (e.key === 'ArrowRight') {
      if (target.selectionStart === null || target.selectionStart === target.value.length) {
        nextCol = Math.min(maxCol, col + 1);
        e.preventDefault();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (row === maxRow && (col === 10 || col === 11)) {
        // Tab or Enter in Payment Mode/Amount Paid adds a new row
        handleStmtAddRow();
        setTimeout(() => {
          const firstInput = document.querySelector(`[data-row="${maxRow + 1}"][data-col="0"]`) as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
            try { firstInput.select(); } catch(_) {}
          }
        }, 100);
        return;
      } else if (row === maxRow) {
        // Just move to the next field in the append row
        nextCol = Math.min(maxCol, col + 1);
      } else {
        // Move to the next row same column
        nextRow = Math.min(maxRow, row + 1);
      }
    } else if (e.key === 'Tab') {
      if (row === maxRow && (col === 10 || col === 11)) {
        e.preventDefault();
        handleStmtAddRow();
        setTimeout(() => {
          const firstInput = document.querySelector(`[data-row="${maxRow + 1}"][data-col="0"]`) as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
            try { firstInput.select(); } catch(_) {}
          }
        }, 100);
        return;
      }
    }

    if (nextRow !== row || nextCol !== col) {
      const el = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLInputElement;
      if (el) {
        el.focus();
        setTimeout(() => {
          try { el.select(); } catch(_) {}
        }, 10);
      }
    }
  };

  // Append row inside custom statement template
  const handleStmtAddRow = () => {
    const amt = parseFloat(stmtRowAmount) || 0;
    const pd = parseFloat(stmtRowAmtPaid) || 0;
    const invoiceRefClean = stmtRowInvoice.trim() || `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRow: SoaTransaction = {
      id: 'stmt-tx-' + Date.now() + '-' + Math.random(),
      date: stmtRowDate,
      paymentTerms: stmtRowTerms || '60 Days',
      overdueDays: parseInt(stmtRowOverdue, 10) || 0,
      lpoRef: stmtRowLpo || '—',
      invoiceRef: invoiceRefClean,
      woRef: stmtRowWo || '—',
      deliveryDates: stmtRowDelivery || stmtRowDate,
      amount: amt,
      datePaid: stmtRowDatePaid || '—',
      receiptNo: stmtRowReceipt || '—',
      paymentMode: stmtRowMode || '—',
      amountPaid: pd
    };

    const updated = [...stmtTxs, newRow];
    setStmtTxs(updated);

    // Clear inner inputs
    setStmtRowInvoice('');
    setStmtRowLpo('');
    setStmtRowWo('');
    setStmtRowDelivery('');
    setStmtRowAmount('');
    setStmtRowAmtPaid('');
    setStmtRowDatePaid('—');
    setStmtRowReceipt('—');
    setStmtRowMode('—');
  };

  // Remove row from custom statement
  const handleStmtDeleteRow = (rowId: string) => {
    const tx = stmtTxs.find(t => t.id === rowId);
    if (tx && (tx.purchaseId || tx.id.startsWith('supp-tx-'))) {
      syncSupplierPurchaseStatus(tx.purchaseId || tx.id.replace('supp-tx-', ''), tx.invoiceRef, 0, tx.amount || 0);
    }
    setStmtTxs(stmtTxs.filter(tx => tx.id !== rowId));
  };

  // Sync status back to MFI_SUPPLIER_PURCHASES when SOA ledger payment is modified
  const syncSupplierPurchaseStatus = (purId: string | undefined, invRef: string | undefined, newPaid: number, totalAmt: number) => {
    if (!purId && !invRef) return;
    const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    if (!saved) return;
    try {
      let purchases = JSON.parse(saved);
      if (!Array.isArray(purchases)) return;
      let modified = false;
      purchases = purchases.map(pur => {
        if ((purId && pur.id === purId) || (invRef && invRef !== '—' && pur.invoiceNo === invRef)) {
          const tot = Number(pur.totalAmount || pur.subtotal || totalAmt || 0);
          const st = newPaid >= tot && tot > 0 ? 'Paid' : (newPaid > 0 ? 'Partial' : 'Pending');
          if (pur.paymentStatus !== st || pur.amountPaid !== newPaid) {
            modified = true;
            return { ...pur, paymentStatus: st, amountPaid: newPaid };
          }
        }
        return pur;
      });
      if (modified) {
        localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(purchases));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {}
  };

  // Inline update cell in statement compiler
  const updateStmtRow = (id: string, field: keyof SoaTransaction, value: any) => {
    setStmtTxs(prev => prev.map(t => {
      if (t.id === id) {
        let updated = { ...t };
        if (field === 'amount' || field === 'amountPaid' || field === 'overdueDays') {
          updated[field] = Number(value) || 0;
        } else {
          (updated as any)[field] = value;
        }
        
        // Auto-calculate overdueDays if paymentTerms, deliveryDates or date is changed!
        if (field === 'paymentTerms' || field === 'deliveryDates' || field === 'date') {
          const calcOverdue = calculateOverdueDaysFromTerms(updated.deliveryDates, updated.date, updated.paymentTerms, stmtDate);
          updated.overdueDays = calcOverdue;
        }

        if (field === 'amountPaid' || field === 'amount') {
          syncSupplierPurchaseStatus(updated.purchaseId || (updated.id.startsWith('supp-tx-') ? updated.id.replace('supp-tx-', '') : undefined), updated.invoiceRef, updated.amountPaid || 0, updated.amount || 0);
        }
        return updated;
      }
      return t;
    }));
  };

  // Clear compile form fields
  const handleResetStmtForm = () => {
    setStmtType('receivables_outstanding');
    setStmtCompanyName('');
    setStmtCustomerCode('');
    setStmtAddress('');
    setStmtPhone('');
    setStmtPoBox('');
    setStmtTrn('');
    setStmtTxs([]);
    setStmtShowDeliveryDate(false);
    setStmtAging({
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91to120: 0,
      over120: 0
    });
  };

  // Compile and Save statement to Local storage History log
  const handleCompileAndSaveStatement = (typeToSave: 'receivables_outstanding' | 'payables_outstanding') => {
    if (!stmtCompanyName.trim()) {
      alert("Please provide the Company Name for this statement!");
      return;
    }

    if (editingStatementId) {
      const updated = savedStatements.map(s => {
        if (s.id === editingStatementId) {
          return {
            ...s,
            statementDate: stmtDate,
            periodFrom: stmtPeriodFrom,
            periodTo: stmtPeriodTo,
            customerCode: stmtCustomerCode || (typeToSave === 'payables_outstanding' ? 'S-' : 'C-') + Math.floor(100 + Math.random() * 900),
            companyName: stmtCompanyName.trim().toUpperCase(),
            address: stmtAddress,
            phone: stmtPhone,
            trn: stmtTrn,
            poBox: stmtPoBox,
            sellerCode: stmtSellerCode,
            currency: stmtCurrency,
            transactions: stmtTxs,
            aging: stmtAging,
            bankDetails: { ...stmtBankDetails },
            statementType: typeToSave,
            showDeliveryDate: stmtShowDeliveryDate
          };
        }
        return s;
      });
      setSavedStatements(updated);
      setEditingStatementId(null);
      alert(`Success! Statement for ${stmtCompanyName.trim().toUpperCase()} has been updated in the Archive!`);
      
      // Reset form
      handleResetStmtForm();
      // Navigate to Records view
      setActiveMainTab('custom_records');
      return;
    }

    const compiled: CustomStatement = {
      id: 'stmt-log-' + Date.now(),
      createdAt: new Date().toISOString(),
      statementDate: stmtDate,
      periodFrom: stmtPeriodFrom,
      periodTo: stmtPeriodTo,
      customerCode: stmtCustomerCode || (typeToSave === 'payables_outstanding' ? 'S-' : 'C-') + Math.floor(100 + Math.random() * 900),
      companyName: stmtCompanyName.trim().toUpperCase(),
      address: stmtAddress,
      phone: stmtPhone,
      trn: stmtTrn,
      poBox: stmtPoBox,
      sellerCode: stmtSellerCode,
      currency: stmtCurrency,
      transactions: stmtTxs,
      aging: stmtAging,
      bankDetails: { ...stmtBankDetails },
      statementType: typeToSave,
      showDeliveryDate: stmtShowDeliveryDate
    };

    const updated = [compiled, ...savedStatements];
    setSavedStatements(updated);
    alert(`Success! Statement for ${compiled.companyName} has been generated and saved to the Archive!`);
    
    // Reset form
    handleResetStmtForm();
    // Navigate to Records view
    setActiveMainTab('custom_records');
  };

  // Delete a saved custom statement
  const handleDeleteCustomStatement = (stmtId: string, companyName?: string) => {
    if (window.confirm("Are you sure you want to permanently delete this saved Statement of Account from archive?")) {
      const updated = savedStatements.filter(s => {
        if (s.id === stmtId) return false;
        if (companyName && s.companyName.trim().toUpperCase() === companyName.trim().toUpperCase()) return false;
        return true;
      });
      setSavedStatements(updated);
    }
  };

  // Load a saved custom statement back to the WYSIWYG compiler for editing
  const handleLoadEditCustomStatement = (stmt: CustomStatement) => {
    setEditingStatementId(stmt.id);
    setStmtType(stmt.statementType || 'receivables_outstanding');
    setStmtDate(stmt.statementDate);
    setStmtPeriodFrom(stmt.periodFrom);
    setStmtPeriodTo(stmt.periodTo);
    setStmtCustomerCode(stmt.customerCode);
    setStmtCompanyName(stmt.companyName);
    setStmtAddress(stmt.address || '');
    setStmtPhone(stmt.phone || '');
    setStmtTrn(stmt.trn || '');
    setStmtPoBox(stmt.poBox || '');
    setStmtSellerCode(stmt.sellerCode);
    setStmtCurrency(stmt.currency || 'AED');
    setStmtShowDeliveryDate(stmt.showDeliveryDate ?? false);
    setStmtTxs((stmt.transactions || []).map(t => ({
      ...t,
      overdueDays: calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms, stmt.statementDate)
    })));
    setStmtAging(stmt.aging || {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days91to120: 0,
      over120: 0
    });
    if (stmt.bankDetails) {
      setStmtBankDetails({ ...stmt.bankDetails });
    }
    setActiveMainTab('create_new_statement');
  };

  // Recalculate statement overdue days and aging dynamically based on Today's date!
  const getUpdatedStatementWithToday = (stmt: CustomStatement): CustomStatement => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Recalculate transaction overdue days relative to today
    const updatedTxs = (stmt.transactions || []).map(t => {
      const elapsedDays = calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms, todayStr);
      return {
        ...t,
        overdueDays: elapsedDays
      };
    });

    // Recalculate aging buckets based on these updated transaction overdue days
    const newAging: CustomerAging = { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };
    updatedTxs.forEach(t => {
      const balance = Number(t.amount || 0) - Number(t.amountPaid || 0);
      if (balance > 0) {
        const age = Number(t.overdueDays) || 0;
        if (age <= 0) {
          newAging.current += balance;
        } else if (age <= 30) {
          newAging.days1to30 += balance;
        } else if (age <= 60) {
          newAging.days31to60 += balance;
        } else if (age <= 90) {
          newAging.days61to90 += balance;
        } else if (age <= 120) {
          newAging.days91to120 += balance;
        } else {
          newAging.over120 += balance;
        }
      }
    });

    return {
      ...stmt,
      transactions: updatedTxs,
      aging: newAging
    };
  };

  // Print Compiled Saved Statement from list
  const triggerCustomStatementPrint = (originalStmt: CustomStatement, balanceOnly = false) => {
    const stmt = getUpdatedStatementWithToday(originalStmt);
    const companyProfile = getCompanyProfile();
    // Formatting date helper
    const formattedDate = new Date(stmt.statementDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formatCurr = (val: number) => {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    let totalSales = 0;
    let totalPaid = 0;
    
    // Filter transactions to only open balances if balanceOnly is true
    const transactionsToRender = balanceOnly 
      ? stmt.transactions.filter(t => (Number(t.amount || 0) - Number(t.amountPaid || 0)) > 0)
      : stmt.transactions;

    const isPayables = stmt.statementType === 'payables_outstanding';
    const hasDeliveryDate = stmt.showDeliveryDate !== false;

    const hasLinkedReceiptRows = transactionsToRender.some(t => t.isLinkedReceipt && Number(t.amountPaid || 0) > 0);

    let runningBalance = 0;
    const txRowsHtml = transactionsToRender.map(t => {
      if (!t.isLinkedReceipt) {
        totalSales += Number(t.amount || 0);
        if (!hasLinkedReceiptRows) {
          totalPaid += Number(t.amountPaid || 0);
          runningBalance += Number(t.amount || 0);
          runningBalance -= Number(t.amountPaid || 0);
        } else {
          runningBalance += Number(t.amount || 0);
        }
      } else {
        totalPaid += Number(t.amountPaid || 0);
        runningBalance -= Number(t.amountPaid || 0);
      }
      const balanceVal = Number(t.amount || 0) - Number(t.amountPaid || 0);

      if (balanceOnly) {
        return `
          <tr style="font-size: 11px; font-family: monospace;">
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.date || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.paymentTerms || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; color: ${t.overdueDays > getTermsLimit(t.paymentTerms) ? '#b91c1c' : '#16a34a'}; font-weight: bold;">${t.overdueDays || '0'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.lpoRef || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; font-weight: bold;">${t.invoiceRef || '—'}</td>
            ${isPayables ? '' : `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.woRef || '—'}</td>`}
            ${hasDeliveryDate ? `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.deliveryDates || '—'}</td>` : ''}
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold;">${formatCurr(t.amount)}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold; background-color: #fafafa; color: #854d0e;">${formatCurr(balanceVal)}</td>
          </tr>
        `;
      }

      return `
        <tr style="font-size: 11px; font-family: monospace;">
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.date || '—'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.paymentTerms || '—'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; color: ${t.overdueDays > getTermsLimit(t.paymentTerms) ? '#b91c1c' : '#16a34a'}; font-weight: bold;">${t.overdueDays || '0'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.lpoRef || '—'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; font-weight: bold;">${t.invoiceRef || '—'}</td>
          ${isPayables ? '' : `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.woRef || '—'}</td>`}
          ${hasDeliveryDate ? `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.deliveryDates || '—'}</td>` : ''}
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold;">${formatCurr(t.amount)}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.datePaid || '—'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.receiptNo || '—'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.paymentMode || '—'}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; color: #15803d;">${formatCurr(t.amountPaid)}</td>
          <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold; background-color: #fafafa;">${formatCurr(runningBalance)}</td>
        </tr>
      `;
    }).join('');

    const pending = totalSales - totalPaid;
    const activeCustomerAging = stmt.aging;
    const totalAgingBalance = activeCustomerAging.current + activeCustomerAging.days1to30 + activeCustomerAging.days31to60 + activeCustomerAging.days61to90 + activeCustomerAging.days91to120 + activeCustomerAging.over120;

    const shouldPageBreakBank = transactionsToRender.length > 7;

    const htmlContent = `
      <html>
      <head>
        <title>${balanceOnly ? 'Outstanding Balance Payment Report' : 'Statement of Account'} - ${stmt.companyName}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Arial MT', Arial, 'Helvetica Neue', Helvetica, sans-serif;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 15mm;
            font-size: 8.5px;
            line-height: 1.45;
          }
          .title-area, .subtitle-area, .meta-val, .stat-header, th, .ledger-total-row td, .aging-table th, b, strong, .font-bold {
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
          }
            font-size: 8.5px;
            line-height: 1.45;
          }
           .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
          }
          .title-area {
            color: #000000;
            font-weight: 850;
            font-size: 14.5px;
            letter-spacing: 0.1px;
            margin: 0;
            padding: 0;
            line-height: 1.1;
            font-family: sans-serif;
          }
          .subtitle-area {
            font-size: 8px;
            color: #000000;
            font-weight: bold;
            margin-top: 1px;
            text-transform: uppercase;
            font-family: sans-serif;
          }
          .meta-label {
            font-size: 8.5px;
            font-weight: normal;
            color: #000000;
            font-family: sans-serif;
          }
          .meta-val {
            font-size: 8.5px;
            font-weight: bold;
            color: #000000;
            font-family: sans-serif;
          }
          .divider-line {
            border-top: 1.5px solid #000000;
            margin: 12px 0 15px 0;
          }
          .info-box-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }
          .statement-to-box {
            vertical-align: top;
            width: 58%;
            font-size: 8.5px;
            color: #000000;
            line-height: 1.4;
          }
          .statement-account-box {
            border: 1px solid #000000;
            vertical-align: top;
            width: 37%;
            background-color: #ffffff;
          }
          .stat-header {
            border-bottom: 1px solid #000000;
            color: #000000;
            font-weight: 850;
            text-align: center;
            padding: 4px;
            font-size: 9.5px;
            letter-spacing: 0.2px;
            font-family: sans-serif;
          }
          .stat-cell-lbl {
            padding: 4.5px 8px;
            font-weight: normal;
            font-size: 8.5px;
            color: #000000;
          }
          .stat-cell-val {
            padding: 4.5px 8px;
            text-align: right;
            font-weight: bold;
            font-size: 8.5px;
          }
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 5px;
          }
          .ledger-table th {
            color: #000000;
            font-weight: bold;
            font-size: 8px;
            padding: 4px 2px;
            text-align: center;
            border-top: 1.5px solid #000000;
            border-bottom: 1.5px solid #000000;
            font-family: sans-serif;
          }
          .ledger-table td {
            border-bottom: 0.5px solid #000000;
            padding: 6px 2px;
            font-size: 7.5px;
            text-align: center;
          }
          .ledger-total-row td {
            font-weight: bold;
            font-size: 8.5px;
            padding: 6px 2px;
            border-top: 1.5px solid #000000;
            border-bottom: 1.5px solid #000000;
          }
          .aging-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
            margin-bottom: 15px;
            border: 1px solid #000000;
          }
          .aging-table th {
            border: 1px solid #000000;
            padding: 4px 5px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            color: #000000;
            font-family: sans-serif;
          }
          .aging-table td {
            border: 1px solid #000000;
            padding: 5px;
            font-size: 8px;
            text-align: center;
            font-weight: bold;
          }
          .bank-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 8.5px;
          }
          .bank-grid td {
            padding: 2.5px 0;
            vertical-align: top;
          }
          @media print {
            body {
               padding: 15mm;
               padding-bottom: 2.2cm;
            }
            thead {
              display: table-header-group !important;
            }
            tr {
              page-break-inside: avoid !important;
            }
            .print-footer {
              position: fixed;
              bottom: 0.8cm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 8px;
              color: #000000;
              font-weight: bold;
              font-style: italic;
              font-family: sans-serif;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header Section -->
        <table class="header-table">
          <tr>
            <td style="width: 55%; vertical-align: top;">
              <h1 class="title-area">${companyProfile.name}</h1>
              ${isMarineFastenersCompany(companyProfile) ? `<div class="subtitle-area">(SOLE PROPRIETORSHIP)</div>` : (companyProfile.tagline ? `<div class="subtitle-area">${companyProfile.tagline}</div>` : '')}
              <div style="font-size: 8.5px; color: #000000; margin-top: 8px; line-height: 1.45;">
                Add: ${companyProfile.address}<br/>
                Telephone: ${companyProfile.phone || '—'}<br/>
                Email: ${companyProfile.email || '—'}<br/>
                Website: ${companyProfile.website || '—'}<br/>
                TRN: ${companyProfile.trn || '—'}
              </div>
            </td>
            <td style="width: 45%; text-align: right; vertical-align: top; line-height: 1.45;">
              <div style="height: 15px;"></div>
              <div><span class="meta-label">Statement Date :</span> <span class="meta-val">&nbsp; &nbsp; &nbsp; &nbsp; ${formattedDate}</span></div>
              <div style="height: 15px;"></div>
              <div style="display: inline-block; width: 100%; text-align: right; padding-bottom: 4px;">
                <div><span class="meta-label">${isPayables ? 'Supplier code :' : 'Customer code :'}</span> <span class="meta-val">${stmt.customerCode}</span></div>
                ${isPayables ? '' : `<div><span class="meta-label">Seller :</span> <span class="meta-val">${stmt.sellerCode}</span></div>`}
                <div><span class="meta-label">Currency :</span> <span class="meta-val">&nbsp; AED &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span></div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Divider full-width solid line -->
        <div class="divider-line"></div>

        <!-- Info Boxes (Statement To & Statement Account Summary) -->
        <table class="info-box-table">
          <tr>
            <td class="statement-to-box">
              <div style="font-weight: bold; margin-bottom: 3px; font-size: 8.5px;">Statement to:</div>
              <div style="font-size: 11.5px; font-weight: 900; color: #000000; line-height: 1.25; margin-bottom: 5px;">${stmt.companyName}</div>
              <div style="font-size: 8.5px; line-height: 1.45;">
                Address : ${stmt.address || '—'}<br/>
                Phone : ${stmt.phone || '—'}<br/>
                Fax : —<br/>
                P.O. Box : ${stmt.poBox || '—'}<br/>
                TRN : ${stmt.trn || '—'}
              </div>
            </td>
            <td style="width: 5%;"></td>
            <td class="statement-account-box">
              <div class="stat-header">${balanceOnly ? 'Outstanding Balance Report' : 'Outstanding Balance'}</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 0.5px solid #000000;">
                  <td class="stat-cell-lbl">Total Amount</td>
                  <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(totalSales)}</td>
                </tr>
                <tr style="border-bottom: 0.5px solid #000000;">
                  <td class="stat-cell-lbl">Amount Paid</td>
                  <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(totalPaid)}</td>
                </tr>
                <tr>
                  <td class="stat-cell-lbl">Amount Due</td>
                  <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(pending)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Period display -->
        ${balanceOnly ? "" : `
        <div style="margin-top: 10px; margin-bottom: 5px; text-align: right; font-weight: bold; font-size: 8px;">
          Period: ${stmt.periodFrom} - ${stmt.periodTo}
        </div>
        `}

        <table class="ledger-table">
          <thead>
            <tr>
              ${balanceOnly ? `
                <th style="width: 10%; text-align: left;">Date</th>
                <th style="width: 11%;">Payment<br/>Terms</th>
                <th style="width: 8%;">Overdue<br/>Days</th>
                <th style="width: 11%;">LPO Ref</th>
                <th style="width: 12%;">Invoice Ref</th>
                ${isPayables ? '' : '<th style="width: 8%;">W/O Ref</th>'}
                ${hasDeliveryDate ? '<th style="width: 12%;">Delivery<br/>Dates</th>' : ''}
                <th style="width: 12%; text-align: right;">Amount</th>
                <th style="width: 14%; text-align: right;">Pending Due</th>
              ` : `
                <th style="width: 8%; text-align: left;">Date</th>
                <th style="width: 8%;">Payment<br/>Terms</th>
                <th style="width: 6%;">Overdue<br/>Days</th>
                <th style="width: 8%;">LPO Ref</th>
                <th style="width: 9%;">Invoice Ref</th>
                ${isPayables ? '' : '<th style="width: 6%;">W/O Ref</th>'}
                ${hasDeliveryDate ? '<th style="width: 9%;">Delivery<br/>Dates</th>' : ''}
                <th style="width: 9%; text-align: right;">Amount</th>
                <th style="width: 9%;">Date Paid</th>
                <th style="width: 9%;">Receipt No</th>
                <th style="width: 9%;">Pay Mode</th>
                <th style="width: 10%; text-align: right;">Amount<br/>Paid</th>
                <th style="width: 10%; text-align: right;">Balance</th>
              `}
            </tr>
          </thead>
          <tbody>
            ${txRowsHtml || `<tr><td colspan="${isPayables ? (balanceOnly ? (hasDeliveryDate ? 9 : 8) : (hasDeliveryDate ? 12 : 11)) : (balanceOnly ? (hasDeliveryDate ? 10 : 9) : (hasDeliveryDate ? 13 : 12))}" style="text-align: center; color: #64748b; padding: 15px; font-style: italic;">No ledger records found for this period.</td></tr>`}
            
            <tr class="ledger-total-row">
              <td colspan="${(isPayables ? 5 : 6) + (hasDeliveryDate ? 1 : 0)}" style="text-align: right; font-weight: bold; padding: 5px 2px;">Total Outstandings AED</td>
              <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(totalSales)}</td>
              ${balanceOnly ? '' : '<td colspan="3" style="border-bottom: 2px solid #000000;"></td>'}
              <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(totalPaid)}</td>
              <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(pending)}</td>
            </tr>
          </tbody>
        </table>

        <div style="${shouldPageBreakBank ? 'page-break-before: always; margin-top: 15px;' : 'margin-top: 15px;'}">
          <table class="aging-table">
            <thead>
              <tr>
                <th style="width: 14%;">Current</th>
                <th style="width: 14%;">1-30 Days</th>
                <th style="width: 14%;">31-60 Days</th>
                <th style="width: 14%;">61-90 Days</th>
                <th style="width: 14%;">91-120 Days</th>
                <th style="width: 14%;">Over 120 Days</th>
                <th style="width: 16%; background-color: #ffffff; color: #000000;">Total Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${formatCurr(activeCustomerAging.current)}</td>
                <td>${formatCurr(activeCustomerAging.days1to30)}</td>
                <td>${formatCurr(activeCustomerAging.days31to60)}</td>
                <td>${formatCurr(activeCustomerAging.days61to90)}</td>
                <td>${formatCurr(activeCustomerAging.days91to120)}</td>
                <td>${formatCurr(activeCustomerAging.over120)}</td>
                <td style="font-weight: bold;">${formatCurr(totalAgingBalance)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Bank Details Section -->
          <div style="font-size: 8.5px; font-weight: bold; border: 1.5px solid #000000; padding: 5px; margin-top: 15px; margin-bottom: 15px; background-color: #f8fafc; font-family: sans-serif; text-transform: uppercase;">
            Balance Amount in Words: <span style="font-weight: 900; color: #1e3a8a;">${convertAmountToWordsAED(pending)}</span>
          </div>

          ${isPayables ? '' : `
          <div style="margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <div style="font-weight: bold; font-size: 8.5px; color: #000000; margin-bottom: 8px; font-family: sans-serif;">
              Please make any payment due, either by electronic transfer to our bank account or by cheque payable to
            </div>
            <table class="bank-grid">
              <tr>
                <td style="width: 18%; font-weight: bold; color: #000000; padding: 1.5px 0;">Beneficiary</td>
                <td style="width: 82%; font-weight: bold; padding: 1.5px 0;">${stmt.bankDetails.beneficiary || companyProfile.name}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Bank Name</td>
                <td style="padding: 1.5px 0;">${stmt.bankDetails.bankName || 'RAK BANK'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Account Number</td>
                <td style="font-weight: bold; padding: 1.5px 0;">${stmt.bankDetails.accountNo || '0242715908001'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Branch</td>
                <td style="padding: 1.5px 0;">${stmt.bankDetails.branch || 'KING FAISAL STREET, SHARJAH'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Country</td>
                <td style="padding: 1.5px 0;">${stmt.bankDetails.country || 'UNITED ARAB EMIRATES'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">IBAN</td>
                <td style="padding: 1.5px 0;">${stmt.bankDetails.iban || 'AE 940400000242715908001'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Swift Code</td>
                <td style="padding: 1.5px 0;">${stmt.bankDetails.swiftCode || 'NRAKAEAK'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Address</td>
                <td style="padding: 1.5px 0;">${stmt.bankDetails.address || 'RAK BANK, P.O.BOX: 1531, DUBAI, UAE'}</td>
              </tr>
            </table>
          </div>
          `}
        </div>

        <div class="print-footer">
          This is computer generated statement, no signature required
        </div>
      </body>
      </html>
    `;

    printHtml(htmlContent, `${balanceOnly ? 'MFI_Balance_Report_' : 'MFI_Compiled_SOA_'}${stmt.companyName.replace(/\s+/g, '_')}`);
  };

  // Print All Compiled Saved Statements from list in one batch
  const triggerPrintAllCustomStatements = (statementsToPrint: CustomStatement[], balanceOnly = false) => {
    if (statementsToPrint.length === 0) {
      alert("No statements to print!");
      return;
    }
    const companyProfile = getCompanyProfile();

    const formatCurr = (val: number) => {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const pagesHtml = statementsToPrint.map((originalStmt, index) => {
      const stmt = getUpdatedStatementWithToday(originalStmt);
      const formattedDate = new Date(stmt.statementDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let totalSales = 0;
      let totalPaid = 0;
      
      const isPayablesBatch = stmt.statementType === 'payables_outstanding';
      const hasDeliveryDate = stmt.showDeliveryDate !== false;

      const txsToRender = balanceOnly 
        ? stmt.transactions.filter(t => (Number(t.amount || 0) - Number(t.amountPaid || 0)) > 0.01)
        : stmt.transactions;

      const hasLinkedReceiptRows = txsToRender.some(t => t.isLinkedReceipt && Number(t.amountPaid || 0) > 0);

      const txRowsHtml = txsToRender.map(t => {
        if (!t.isLinkedReceipt) {
          totalSales += Number(t.amount || 0);
          if (!hasLinkedReceiptRows) {
            totalPaid += Number(t.amountPaid || 0);
          }
        } else {
          totalPaid += Number(t.amountPaid || 0);
        }
        const balanceVal = Number(t.amount || 0) - Number(t.amountPaid || 0);

        if (balanceOnly) {
          return `
            <tr style="font-size: 11px; font-family: monospace;">
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.date || '—'}</td>
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.paymentTerms || '—'}</td>
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; color: ${t.overdueDays > getTermsLimit(t.paymentTerms) ? '#b91c1c' : '#16a34a'}; font-weight: bold;">${t.overdueDays || '0'}</td>
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.lpoRef || '—'}</td>
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; font-weight: bold;">${t.invoiceRef || '—'}</td>
              ${isPayablesBatch ? '' : `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.woRef || '—'}</td>`}
              ${hasDeliveryDate ? `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.deliveryDates || '—'}</td>` : ''}
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold;">${formatCurr(t.amount)}</td>
              <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold; background-color: #fafafa; color: #854d0e;">${formatCurr(balanceVal)}</td>
            </tr>
          `;
        }

        return `
          <tr style="font-size: 11px; font-family: monospace;">
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.date || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.paymentTerms || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; color: ${t.overdueDays > getTermsLimit(t.paymentTerms) ? '#b91c1c' : '#16a34a'}; font-weight: bold;">${t.overdueDays || '0'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.lpoRef || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; font-weight: bold;">${t.invoiceRef || '—'}</td>
            ${isPayablesBatch ? '' : `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.woRef || '—'}</td>`}
            ${hasDeliveryDate ? `<td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.deliveryDates || '—'}</td>` : ''}
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold;">${formatCurr(t.amount)}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.datePaid || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.receiptNo || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px;">${t.paymentMode || '—'}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; color: #15803d;">${formatCurr(t.amountPaid)}</td>
            <td style="border-bottom: 0.5px solid #e2e8f0; padding: 6px 3px; text-align: right; font-weight: bold; background-color: #fafafa;">${formatCurr(balanceVal)}</td>
          </tr>
        `;
      }).join('');

      const pending = totalSales - totalPaid;
      const activeCustomerAging = stmt.aging;
      const totalAgingBalance = activeCustomerAging.current + activeCustomerAging.days1to30 + activeCustomerAging.days31to60 + activeCustomerAging.days61to90 + activeCustomerAging.days91to120 + activeCustomerAging.over120;
      const shouldPageBreakBank = txsToRender.length > 7;

      return `
        <div class="statement-page" style="${index > 0 ? 'page-break-before: always; border-top: 1px dashed #e2e8f0; padding-top: 20px;' : ''}">
          <!-- Header Section -->
          <table class="header-table">
            <tr>
              <td style="width: 55%; vertical-align: top;">
                <h1 class="title-area">${companyProfile.name}</h1>
                ${isMarineFastenersCompany(companyProfile) ? `<div class="subtitle-area">(SOLE PROPRIETORSHIP)</div>` : (companyProfile.tagline ? `<div class="subtitle-area">${companyProfile.tagline}</div>` : '')}
                <div style="font-size: 8.5px; color: #000000; margin-top: 8px; line-height: 1.45;">
                  Add: ${companyProfile.address}<br/>
                  Telephone: ${companyProfile.phone || '—'}<br/>
                  Email: ${companyProfile.email || '—'}<br/>
                  Website: ${companyProfile.website || '—'}<br/>
                  TRN: ${companyProfile.trn || '—'}
                </div>
              </td>
              <td style="width: 45%; text-align: right; vertical-align: top; line-height: 1.45;">
                <div style="height: 15px;"></div>
                <div><span class="meta-label">Statement Date :</span> <span class="meta-val">&nbsp; &nbsp; &nbsp; &nbsp; ${formattedDate}</span></div>
                <div style="height: 15px;"></div>
                <div style="display: inline-block; width: 100%; text-align: right; padding-bottom: 4px;">
                  <div><span class="meta-label">Customer code :</span> <span class="meta-val">${stmt.customerCode}</span></div>
                  <div><span class="meta-label">Seller :</span> <span class="meta-val">${stmt.sellerCode}</span></div>
                  <div><span class="meta-label">Currency :</span> <span class="meta-val">&nbsp; AED &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span></div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Divider full-width solid line -->
          <div class="divider-line"></div>

          <!-- Info Boxes (Statement To & Statement Account Summary) -->
          <table class="info-box-table">
            <tr>
              <td class="statement-to-box">
                <div style="font-weight: bold; margin-bottom: 3px; font-size: 8.5px;">Statement to:</div>
                <div style="font-size: 11.5px; font-weight: 900; color: #000000; line-height: 1.25; margin-bottom: 5px;">${stmt.companyName}</div>
                <div style="font-size: 8.5px; line-height: 1.45;">
                  Address : ${stmt.address || '—'}<br/>
                  Phone : ${stmt.phone || '—'}<br/>
                  Fax : —<br/>
                  P.O. Box : ${stmt.poBox || '—'}<br/>
                  TRN : ${stmt.trn || '—'}
                </div>
              </td>
              <td style="width: 5%;"></td>
              <td class="statement-account-box">
                <div class="stat-header">${balanceOnly ? (isPayablesBatch ? 'Accounts Payable Outstanding Report' : 'Outstanding Balance Report') : (isPayablesBatch ? 'Accounts Payable Statement of Account' : 'Outstanding Balance')}</div>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 0.5px solid #000000;">
                    <td class="stat-cell-lbl">Total Amount</td>
                    <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(totalSales)}</td>
                  </tr>
                  <tr style="border-bottom: 0.5px solid #000000;">
                    <td class="stat-cell-lbl">Amount Paid</td>
                    <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(totalPaid)}</td>
                  </tr>
                  <tr>
                    <td class="stat-cell-lbl">Amount Due</td>
                    <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(pending)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Period display -->
          ${balanceOnly ? "" : `
          <div style="margin-top: 10px; margin-bottom: 5px; text-align: right; font-weight: bold; font-size: 8px;">
            Period: ${stmt.periodFrom || '01/01/2026'} - ${stmt.periodTo || '31/12/2026'}
          </div>
          `}

          <table class="ledger-table">
            <thead>
              ${balanceOnly ? `
                <tr>
                  <th style="width: 10%; text-align: left;">Date</th>
                  <th style="width: 11%;">Payment<br/>Terms</th>
                  <th style="width: 8%;">Overdue<br/>Days</th>
                  <th style="width: 11%;">LPO Ref</th>
                  <th style="width: 12%;">Invoice Ref</th>
                  ${isPayablesBatch ? '' : '<th style="width: 8%;">W/O Ref</th>'}
                  ${hasDeliveryDate ? '<th style="width: 12%;">Delivery<br/>Dates</th>' : ''}
                  <th style="width: 12%; text-align: right;">Amount</th>
                  <th style="width: 14%; text-align: right;">Pending Due</th>
                </tr>
              ` : `
                <tr>
                  <th style="width: 8%; text-align: left;">Date</th>
                  <th style="width: 8%;">Payment<br/>Terms</th>
                  <th style="width: 6%;">Overdue<br/>Days</th>
                  <th style="width: 8%;">LPO Ref</th>
                  <th style="width: 9%;">Invoice Ref</th>
                  ${isPayablesBatch ? '' : '<th style="width: 6%;">W/O Ref</th>'}
                  ${hasDeliveryDate ? '<th style="width: 9%;">Delivery<br/>Dates</th>' : ''}
                  <th style="width: 9%; text-align: right;">Amount</th>
                  <th style="width: 9%;">Date Paid</th>
                  <th style="width: 9%;">Receipt No</th>
                  <th style="width: 9%;">Pay Mode</th>
                  <th style="width: 10%; text-align: right;">Amount<br/>Paid</th>
                  <th style="width: 10%; text-align: right;">Balance</th>
                </tr>
              `}
            </thead>
            <tbody>
              ${txRowsHtml || `<tr><td colspan="${isPayablesBatch ? (balanceOnly ? (hasDeliveryDate ? 9 : 8) : (hasDeliveryDate ? 12 : 11)) : (balanceOnly ? (hasDeliveryDate ? 10 : 9) : (hasDeliveryDate ? 13 : 12))}" style="text-align: center; color: #64748b; padding: 15px; font-style: italic;">No ledger records found for this period.</td></tr>`}
              
              <tr class="ledger-total-row">
                <td colspan="${(isPayablesBatch ? 5 : 6) + (hasDeliveryDate ? 1 : 0)}" style="text-align: right; font-weight: bold; padding: 5px 2px;">Total Outstandings</td>
                <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(totalSales)}</td>
                ${balanceOnly ? '' : '<td colspan="3" style="border-bottom: 2px solid #000000;"></td>'}
                <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(totalPaid)}</td>
                <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(pending)}</td>
              </tr>
            </tbody>
          </table>

          <div style="${shouldPageBreakBank ? 'page-break-before: always; margin-top: 15px;' : 'margin-top: 15px;'}">
            <table class="aging-table">
              <thead>
                <tr>
                  <th style="width: 14%;">Current</th>
                  <th style="width: 14%;">1-30 Days</th>
                  <th style="width: 14%;">31-60 Days</th>
                  <th style="width: 14%;">61-90 Days</th>
                  <th style="width: 14%;">91-120 Days</th>
                  <th style="width: 14%;">Over 120 Days</th>
                  <th style="width: 16%; background-color: #ffffff; color: #000000;">Total Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${formatCurr(activeCustomerAging.current)}</td>
                  <td>${formatCurr(activeCustomerAging.days1to30)}</td>
                  <td>${formatCurr(activeCustomerAging.days31to60)}</td>
                  <td>${formatCurr(activeCustomerAging.days61to90)}</td>
                  <td>${formatCurr(activeCustomerAging.days91to120)}</td>
                  <td>${formatCurr(activeCustomerAging.over120)}</td>
                  <td style="font-weight: bold;">${formatCurr(totalAgingBalance)}</td>
                </tr>
              </tbody>
            </table>

            <!-- Bank Details Section -->
            <div style="font-size: 8.5px; font-weight: bold; border: 1.5px solid #000000; padding: 5px; margin-top: 15px; margin-bottom: 15px; background-color: #f8fafc; font-family: sans-serif; text-transform: uppercase;">
              Balance Amount in Words: <span style="font-weight: 900; color: #1e3a8a;">${convertAmountToWordsAED(pending)}</span>
            </div>

            ${isPayablesBatch ? '' : `
            <div style="margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
              <div style="font-weight: bold; font-size: 8.5px; color: #000000; margin-bottom: 8px; font-family: sans-serif;">
                Please make any payment due, either by electronic transfer to our bank account or by cheque payable to
              </div>
              <table class="bank-grid">
                <tr>
                  <td style="width: 18%; font-weight: bold; color: #000000; padding: 1.5px 0;">Beneficiary</td>
                  <td style="width: 82%; font-weight: bold; padding: 1.5px 0;">${stmt.bankDetails?.beneficiary || companyProfile.name}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Bank Name</td>
                  <td style="padding: 1.5px 0;">${stmt.bankDetails?.bankName || 'RAK BANK'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Account Number</td>
                  <td style="font-weight: bold; padding: 1.5px 0;">${stmt.bankDetails?.accountNo || '0242715908001'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Branch</td>
                  <td style="padding: 1.5px 0;">${stmt.bankDetails?.branch || 'KING FAISAL STREET, SHARJAH'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Country</td>
                  <td style="padding: 1.5px 0;">${stmt.bankDetails?.country || 'UNITED ARAB EMIRATES'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">IBAN</td>
                  <td style="padding: 1.5px 0;">${stmt.bankDetails?.iban || 'AE 940400000242715908001'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Swift Code</td>
                  <td style="padding: 1.5px 0;">${stmt.bankDetails?.swiftCode || 'NRAKAEAK'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; color: #000000; padding: 1.5px 0;">Address</td>
                  <td style="padding: 1.5px 0;">${stmt.bankDetails?.address || 'RAK BANK, P.O.BOX: 1531, DUBAI, UAE'}</td>
                </tr>
              </table>
            </div>
            `}
          </div>

          <div class="print-footer" style="position: absolute; bottom: 0.8cm; left: 15mm; right: 15mm; text-align: center; font-size: 8px; color: #000000; font-weight: bold; font-style: italic; font-family: sans-serif;">
            This is computer generated statement, no signature required
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Batch Statement of Accounts PDF View</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Arial MT', Arial, 'Helvetica Neue', Helvetica, sans-serif;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          .title-area, .subtitle-area, .meta-val, .stat-header, th, .ledger-total-row td, .aging-table th, b, strong, .font-bold {
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
          }
          .statement-page {
            box-sizing: border-box;
            padding: 15mm;
            min-height: 297mm;
            position: relative;
            background: #ffffff;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
          }
          .title-area {
            color: #000000;
            font-weight: 850;
            font-size: 14.5px;
            letter-spacing: 0.1px;
            margin: 0;
            padding: 0;
            line-height: 1.1;
            font-family: sans-serif;
          }
          .subtitle-area {
            font-size: 8px;
            color: #000000;
            font-weight: bold;
            margin-top: 1px;
            text-transform: uppercase;
            font-family: sans-serif;
          }
          .meta-label {
            font-size: 8.5px;
            font-weight: normal;
            color: #000000;
            font-family: sans-serif;
          }
          .meta-val {
            font-size: 8.5px;
            font-weight: bold;
            color: #000000;
            font-family: sans-serif;
          }
          .divider-line {
            border-top: 1.5px solid #000000;
            margin: 12px 0 15px 0;
          }
          .info-box-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }
          .statement-to-box {
            vertical-align: top;
            width: 58%;
            font-size: 8.5px;
            color: #000000;
            line-height: 1.4;
          }
          .statement-account-box {
            border: 1px solid #000000;
            vertical-align: top;
            width: 37%;
            background-color: #ffffff;
          }
          .stat-header {
            border-bottom: 1px solid #000000;
            color: #000000;
            font-weight: 850;
            text-align: center;
            padding: 4px;
            font-size: 9.5px;
            letter-spacing: 0.2px;
            font-family: sans-serif;
          }
          .stat-cell-lbl {
            padding: 4.5px 8px;
            font-weight: normal;
            font-size: 8.5px;
            color: #000000;
          }
          .stat-cell-val {
            padding: 4.5px 8px;
            text-align: right;
            font-weight: bold;
            font-size: 8.5px;
          }
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 5px;
          }
          .ledger-table th {
            color: #000000;
            font-weight: bold;
            font-size: 11.5px;
            padding: 6px 3px;
            text-align: center;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
            font-family: sans-serif;
          }
          .ledger-table td {
            border-bottom: 0.5px solid #000000;
            padding: 8px 3px;
            font-size: 11px;
            text-align: center;
          }
          .ledger-total-row td {
            font-weight: bold;
            font-size: 11.5px;
            padding: 8px 3px;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
          }
          .aging-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
            margin-bottom: 15px;
            border: 1px solid #000000;
          }
          .aging-table th {
            border: 1px solid #000000;
            padding: 4px 5px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            color: #000000;
            font-family: sans-serif;
          }
          .aging-table td {
            border: 1px solid #000000;
            padding: 5px;
            font-size: 8px;
            text-align: center;
            font-weight: bold;
          }
          .bank-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 8.5px;
          }
          .bank-grid td {
            padding: 2.5px 0;
            vertical-align: top;
          }
          @media print {
            body {
               background: #ffffff;
            }
            .statement-page {
               padding: 15mm;
               page-break-after: always !important;
            }
            .statement-page:last-child {
               page-break-after: avoid !important;
            }
            thead {
              display: table-header-group !important;
            }
            tr {
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    setDocPreviewModal({
      show: true,
      title: 'Compiled Statement of Accounts Batch Report Preview',
      htmlContent
    });
  };

  // Handler for printing Payables PDF Statements
  const handlePrintPayablesPDF = (mode: 'pending' | 'full') => {
    if (supplierFilterId === 'ALL') {
      printAllCustomersMasterSoaReport(mode, true);
      return;
    }
    printCustomerSoaById(supplierFilterId, mode === 'pending');
  };

  // Redesigned Master PDF Statement Report Generator for "ALL CUSTOMERS" or "ALL SUPPLIERS"
  const printAllCustomersMasterSoaReport = (type: 'pending' | 'full', isPayables = false) => {
    const companyProfile = getCompanyProfile();
    const isPending = type === 'pending';
    const rawItems = isPayables
      ? (isPending ? getPendingPayablesInvoices() : getAllPayablesInvoices())
      : (isPending ? getPendingReceivablesInvoices() : getAllReceivablesInvoices());

    // Filter to ensure ONLY pending records with pending balance > 0 are included when printing pending PDF
    const items = isPending 
      ? rawItems.filter((item: any) => {
          const amt = Number(item.tx?.amount || 0);
          const paid = Number(item.tx?.amountPaid || 0);
          const pending = Number(item.pendingAmount ?? (amt - paid));
          return pending > 0;
        })
      : rawItems;

    if (!items || items.length === 0) {
      alert(`No ${isPayables ? 'payables' : 'receivables'} pending records found.`);
      return;
    }

    const reportTitle = isPayables
      ? (isPending ? 'ALL SUPPLIERS ACCOUNTS PAYABLE OUTSTANDING REPORT' : 'ALL SUPPLIERS ACCOUNTS PAYABLE FULL LEDGER STATEMENT')
      : (isPending ? 'ALL CUSTOMERS ACCOUNTS RECEIVABLE OUTSTANDING REPORT' : 'ALL CUSTOMERS ACCOUNTS RECEIVABLE FULL LEDGER STATEMENT');

    let totalSales = 0;
    let totalPaid = 0;
    let totalPending = 0;

    let ageCurrent = 0, age1_30 = 0, age31_60 = 0, age61_90 = 0, age91_120 = 0, ageOver120 = 0;

    const entitySummaryMap: Record<string, {
      name: string;
      code: string;
      invCount: number;
      sales: number;
      paid: number;
      pending: number;
      maxOverdue: number;
    }> = {};

    items.forEach((item: any) => {
      const party = isPayables ? item.supplier : item.customer;
      if (!party) return;
      const partyId = party.id || 'GEN';
      const partyName = party.companyName || 'UNKNOWN';

      const amt = Number(item.tx?.amount || 0);
      const paid = Number(item.tx?.amountPaid || 0);
      const pending = Number(item.pendingAmount ?? (amt - paid));
      const overdue = Number(item.overdueDays || 0);

      totalSales += amt;
      totalPaid += paid;
      totalPending += pending;

      if (pending > 0) {
        if (overdue <= 0) ageCurrent += pending;
        else if (overdue <= 30) age1_30 += pending;
        else if (overdue <= 60) age31_60 += pending;
        else if (overdue <= 90) age61_90 += pending;
        else if (overdue <= 120) age91_120 += pending;
        else ageOver120 += pending;
      }

      if (!entitySummaryMap[partyId]) {
        entitySummaryMap[partyId] = {
          name: partyName,
          code: partyId,
          invCount: 0,
          sales: 0,
          paid: 0,
          pending: 0,
          maxOverdue: 0,
        };
      }
      entitySummaryMap[partyId].invCount += 1;
      entitySummaryMap[partyId].sales += amt;
      entitySummaryMap[partyId].paid += paid;
      entitySummaryMap[partyId].pending += pending;
      if (overdue > entitySummaryMap[partyId].maxOverdue) {
        entitySummaryMap[partyId].maxOverdue = overdue;
      }
    });

    const formatCurr = (val: number) => {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val) || 0);
    };

    const parsedDate = parseRobustDate(stmtDate) || new Date();
    const formattedDate = parsedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const entityList = Object.values(entitySummaryMap);
    const entityBreakdownRowsHtml = entityList.map((ent, idx) => `
      <tr style="font-size: 10px;">
        <td style="border: 0.5px solid #000000; padding: 5px; text-align: center; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold;">${idx + 1}</td>
        <td style="border: 0.5px solid #000000; padding: 5px; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; color: #000000;">${ent.name}</td>
        <td style="border: 0.5px solid #000000; padding: 5px; text-align: center; font-family: monospace;">${ent.code}</td>
        <td style="border: 0.5px solid #000000; padding: 5px; text-align: center;">${ent.invCount}</td>
        <td style="border: 0.5px solid #000000; padding: 5px; text-align: right; font-family: monospace;">${formatCurr(ent.sales)}</td>
        <td style="border: 0.5px solid #000000; padding: 5px; text-align: right; font-family: monospace; color: #15803d;">${formatCurr(ent.paid)}</td>
        <td style="border: 0.5px solid #000000; padding: 5px; text-align: right; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; background-color: #fef3c7; color: #854d0e;">${formatCurr(ent.pending)}</td>
      </tr>
    `).join('');

    const itemRowsHtml = items.map((item: any, idx: number) => {
      const party = isPayables ? item.supplier : item.customer;
      const tx = item.tx || {};
      const amt = Number(tx.amount || 0);
      const paid = Number(tx.amountPaid || 0);
      const pending = Number(item.pendingAmount ?? (amt - paid));
      const overdue = Number(item.overdueDays || 0);

      return `
        <tr style="font-size: 10px;">
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: center; font-family: monospace;">${idx + 1}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: center; font-family: monospace;">${tx.date || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; color: #000000;">${party?.companyName || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; text-align: center;">${tx.invoiceRef || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: center;">${tx.lpoRef || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: center;">${tx.paymentTerms || '30 Days'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: center; color: ${overdue > 30 ? '#b91c1c' : '#16a34a'}; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold;">${overdue} Days</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: right; font-family: monospace; font-weight: bold;">${formatCurr(amt)}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: right; font-family: monospace; color: #15803d;">${formatCurr(paid)}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 5px 3px; text-align: right; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; background-color: #fafafa; color: #854d0e;">${formatCurr(pending)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            font-family: 'Arial MT', Arial, 'Helvetica Neue', Helvetica, sans-serif;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 8.5px;
            line-height: 1.45;
            -webkit-print-color-adjust: exact;
          }
          h1, h2, h3, h4, th, .bold, .meta-val, .title-area, .stat-header, .ledger-total-row {
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
          }
          .title-area {
            color: #000000;
            font-size: 15px;
            letter-spacing: 0.1px;
            margin: 0;
            padding: 0;
            line-height: 1.1;
          }
          .subtitle-area {
            font-size: 8.5px;
            color: #000000;
            font-weight: bold;
            margin-top: 2px;
            text-transform: uppercase;
          }
          .meta-label {
            font-size: 8.5px;
            color: #333333;
          }
          .meta-val {
            font-size: 8.5px;
            color: #000000;
          }
          .divider-line {
            border-top: 2px solid #000000;
            margin: 8px 0 12px 0;
          }
          .report-banner {
            background-color: #0f172a;
            color: #ffffff;
            padding: 8px 12px;
            text-align: center;
            font-size: 12px;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: 4px;
            margin-bottom: 12px;
          }
          .exec-summary-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            border: 1.5px solid #000000;
          }
          .exec-summary-grid th {
            background-color: #f1f5f9;
            border: 1px solid #000000;
            padding: 6px 4px;
            font-size: 8.5px;
            text-align: center;
            color: #0f172a;
          }
          .exec-summary-grid td {
            border: 1px solid #000000;
            padding: 8px 4px;
            font-size: 11px;
            text-align: center;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
          }
          .section-title {
            font-size: 10.5px;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1.5px solid #000000;
            padding-bottom: 3px;
            margin-top: 14px;
            margin-bottom: 8px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .data-table th {
            color: #000000;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
            font-size: 9.5px;
            padding: 6px 3px;
            text-align: center;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
            background-color: #f8fafc;
          }
          .aging-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            margin-bottom: 15px;
            border: 1px solid #000000;
          }
          .aging-table th {
            border: 1px solid #000000;
            padding: 5px;
            font-size: 8.5px;
            text-align: center;
            background-color: #f1f5f9;
          }
          .aging-table td {
            border: 1px solid #000000;
            padding: 6px;
            font-size: 9.5px;
            text-align: center;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
          }
          @media print {
            body { padding: 0; }
            thead { display: table-header-group !important; }
            tr { page-break-inside: avoid !important; }
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 55%; vertical-align: top;">
              <h1 class="title-area">${companyProfile.name}</h1>
              ${isMarineFastenersCompany(companyProfile) ? `<div class="subtitle-area">(SOLE PROPRIETORSHIP)</div>` : (companyProfile.tagline ? `<div class="subtitle-area">${companyProfile.tagline}</div>` : '')}
              <div style="font-size: 8.5px; color: #000000; margin-top: 6px; line-height: 1.45;">
                Add: ${companyProfile.address}<br/>
                Telephone: ${companyProfile.phone || '—'} &nbsp;|&nbsp; Email: ${companyProfile.email || '—'}<br/>
                Website: ${companyProfile.website || '—'} &nbsp;|&nbsp; TRN: ${companyProfile.trn || '—'}
              </div>
            </td>
            <td style="width: 45%; text-align: right; vertical-align: top; line-height: 1.45;">
              <div style="height: 10px;"></div>
              <div><span class="meta-label">Report Date :</span> <span class="meta-val">${formattedDate}</span></div>
              <div><span class="meta-label">Statement Period :</span> <span class="meta-val">01/01/2026 - 31/12/2026</span></div>
              <div><span class="meta-label">Total Selected Accounts :</span> <span class="meta-val">${entityList.length} ${isPayables ? 'Suppliers' : 'Customers'}</span></div>
              <div><span class="meta-label">Currency :</span> <span class="meta-val">AED</span></div>
            </td>
          </tr>
        </table>

        <div class="divider-line"></div>

        <div class="report-banner">${reportTitle}</div>

        <table class="exec-summary-grid">
          <thead>
            <tr>
              <th>TOTAL ACCOUNTS</th>
              <th>TOTAL DOCUMENTS</th>
              <th>TOTAL INVOICED (AED)</th>
              <th>TOTAL SETTLED (AED)</th>
              <th style="background-color: #fef3c7; color: #78350f;">NET PENDING OUTSTANDING (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${entityList.length}</td>
              <td>${items.length}</td>
              <td>${formatCurr(totalSales)}</td>
              <td style="color: #15803d;">${formatCurr(totalPaid)}</td>
              <td style="background-color: #fef3c7; color: #92400e; font-size: 13px;">AED ${formatCurr(totalPending)}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">1. ${isPayables ? 'Supplier' : 'Customer'} Outstanding Balances Summary</div>
        <table class="data-table" style="margin-bottom: 16px;">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 38%; text-align: left;">${isPayables ? 'Supplier Name' : 'Customer / Company Name'}</th>
              <th style="width: 12%;">Code</th>
              <th style="width: 10%;">Invoices</th>
              <th style="width: 12%; text-align: right;">Total Amount</th>
              <th style="width: 11%; text-align: right;">Paid Amount</th>
              <th style="width: 12%; text-align: right;">Pending Due (AED)</th>
            </tr>
          </thead>
          <tbody>
            ${entityBreakdownRowsHtml}
            <tr style="font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; background-color: #f8fafc; font-size: 10.5px;">
              <td colspan="3" style="border: 1px solid #000000; padding: 6px; text-align: right;">GRAND TOTALS ACROSS ALL ACCOUNTS:</td>
              <td style="border: 1px solid #000000; padding: 6px; text-align: center;">${items.length}</td>
              <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-family: monospace;">${formatCurr(totalSales)}</td>
              <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-family: monospace; color: #15803d;">${formatCurr(totalPaid)}</td>
              <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif; font-weight: bold; background-color: #fef3c7; color: #92400e; font-size: 11.5px;">${formatCurr(totalPending)}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">2. Detailed Itemized Document Outstandings</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 4%;">#</th>
              <th style="width: 9%;">Date</th>
              <th style="width: 25%; text-align: left;">${isPayables ? 'Supplier' : 'Customer'}</th>
              <th style="width: 12%;">Invoice Ref</th>
              <th style="width: 10%;">LPO Ref</th>
              <th style="width: 8%;">Terms</th>
              <th style="width: 8%;">Overdue</th>
              <th style="width: 8%; text-align: right;">Total Amt</th>
              <th style="width: 8%; text-align: right;">Paid Amt</th>
              <th style="width: 8%; text-align: right;">Pending Due</th>
            </tr>
          </thead>
          <tbody>
            ${itemRowsHtml}
          </tbody>
        </table>

        <div class="section-title">3. Master Portfolio Aging Summary (AED)</div>
        <table class="aging-table">
          <thead>
            <tr>
              <th>Current (0-30 Days)</th>
              <th>31 - 60 Days</th>
              <th>61 - 90 Days</th>
              <th>91 - 120 Days</th>
              <th>> 120 Days</th>
              <th style="background-color: #fef3c7;">Total Portfolio Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${formatCurr(ageCurrent + age1_30)}</td>
              <td>${formatCurr(age31_60)}</td>
              <td>${formatCurr(age61_90)}</td>
              <td>${formatCurr(age91_120)}</td>
              <td style="color: #b91c1c;">${formatCurr(ageOver120)}</td>
              <td style="background-color: #fef3c7; color: #92400e;">AED ${formatCurr(totalPending)}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">4. Remittance & Bank Transfer Details</div>
        <table style="width: 100%; border: 1px solid #000000; border-collapse: collapse; font-size: 8.5px; margin-bottom: 15px;">
          <tr>
            <td style="padding: 6px; border-r: 1px solid #000000; width: 50%; vertical-align: top;">
              <strong>Account Name:</strong> ${stmtBankDetails.accountName}<br/>
              <strong>Bank Name:</strong> ${stmtBankDetails.bankName}<br/>
              <strong>Branch:</strong> ${stmtBankDetails.branch}
            </td>
            <td style="padding: 6px; width: 50%; vertical-align: top;">
              <strong>Account No:</strong> ${stmtBankDetails.accountNumber}<br/>
              <strong>IBAN No:</strong> ${stmtBankDetails.iban}<br/>
              <strong>SWIFT Code:</strong> ${stmtBankDetails.swiftCode}
            </td>
          </tr>
        </table>

        <div style="text-align: center; font-size: 8px; color: #475569; font-style: italic; margin-top: 15px;">
          This is a computer generated master outstandings report. No physical signature required.
        </div>
      </body>
      </html>
    `;

    printHtml(htmlContent, 'Customer Master SOA Report');
  };

  // Helper for CSV / Excel generation
  const exportToExcelCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvLines = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatted HTML Excel (.xls) generator matching Pending / Full Print PDF design
  const exportFormattedXLS = (
    reportType: 'receivables_pending' | 'receivables_full' | 'payables_pending' | 'payables_full',
    filename: string
  ) => {
    const companyProfile = getCompanyProfile();
    const isPayables = reportType.startsWith('payables');
    const isPending = reportType.endsWith('pending');

    const items = isPayables
      ? (isPending ? getPendingPayablesInvoices() : getAllPayablesInvoices())
      : (isPending ? getPendingReceivablesInvoices() : getAllReceivablesInvoices());

    const formatCurrLoc = (val: number) => {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(val) || 0);
    };

    let totalSales = 0;
    let totalPaid = 0;
    let totalPending = 0;

    let ageCurrent = 0, age1_30 = 0, age31_60 = 0, age61_90 = 0, age91_120 = 0, ageOver120 = 0;

    const hasLinkedReceipts = items.some((item: any) => item.tx?.isLinkedReceipt && Number(item.tx?.amountPaid || 0) > 0);

    items.forEach((item: any) => {
      const amt = Number(item.tx?.amount || 0);
      const paid = Number(item.tx?.amountPaid || 0);
      const isLinked = item.tx?.isLinkedReceipt;
      const pending = Number(item.pendingAmount ?? (amt - paid));

      if (!isLinked) {
        totalSales += amt;
        if (!hasLinkedReceipts) {
          totalPaid += paid;
        }
      } else {
        totalPaid += paid;
      }

      if (pending > 0) {
        const days = Number(item.overdueDays || 0);
        if (days <= 0) ageCurrent += pending;
        else if (days <= 30) age1_30 += pending;
        else if (days <= 60) age31_60 += pending;
        else if (days <= 90) age61_90 += pending;
        else if (days <= 120) age91_120 += pending;
        else ageOver120 += pending;
      }
    });

    totalPending = totalSales - totalPaid;

    const totalAgingBalance = ageCurrent + age1_30 + age31_60 + age61_90 + age91_120 + ageOver120;

    let reportTitle = '';
    if (reportType === 'receivables_pending') reportTitle = 'ACCOUNTS RECEIVABLE OUTSTANDING REPORT';
    else if (reportType === 'receivables_full') reportTitle = 'ACCOUNTS RECEIVABLE STATEMENT OF ACCOUNT';
    else if (reportType === 'payables_pending') reportTitle = 'ACCOUNTS PAYABLE OUTSTANDING REPORT';
    else if (reportType === 'payables_full') reportTitle = 'ACCOUNTS PAYABLE STATEMENT OF ACCOUNT';

    const formattedDate = new Date().toLocaleDateString('en-GB');

    let singleParty: any = null;
    const activeFilterId = isPayables ? supplierFilterId : customerFilterId;
    if (activeFilterId !== 'ALL') {
      singleParty = customers.find(c => c.id === activeFilterId);
    }

    const partyLabel = isPayables ? 'Supplier Name' : 'Customer Name';

    const rowsHtml = items.map((item: any, idx: number) => {
      const partyObj = isPayables ? item.supplier : item.customer;
      const partyName = partyObj?.companyName || '—';
      const amt = Number(item.tx?.amount || 0);
      const paid = Number(item.tx?.amountPaid || 0);
      const pending = Number(item.pendingAmount ?? (amt - paid));
      const overdue = Number(item.overdueDays || 0);

      if (isPending) {
        return `
          <tr>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${idx + 1}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.date || '—'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.paymentTerms || '30 Days'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px; ${overdue > 0 ? 'color: #be123c; font-weight: bold;' : ''}">${overdue} Days</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">${partyName}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.lpoRef || '—'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">${item.tx?.invoiceRef || '—'}</td>
            ${isPayables ? '' : `<td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.woRef || '—'}</td>`}
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 5px; font-family: monospace;">${formatCurrLoc(amt)}</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 5px; font-family: monospace;">${formatCurrLoc(paid)}</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 5px; font-family: monospace; font-weight: bold; background-color: #fef3c7; color: #92400e;">${formatCurrLoc(pending)}</td>
          </tr>
        `;
      } else {
        return `
          <tr>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${idx + 1}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.date || '—'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.paymentTerms || '30 Days'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px; ${overdue > 0 ? 'color: #be123c; font-weight: bold;' : ''}">${overdue} Days</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">${partyName}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.lpoRef || '—'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">${item.tx?.invoiceRef || '—'}</td>
            ${isPayables ? '' : `<td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.woRef || '—'}</td>`}
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 5px; font-family: monospace;">${formatCurrLoc(amt)}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.datePaid || '—'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.receiptNo || '—'}</td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 5px;">${item.tx?.paymentMode || '—'}</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 5px; font-family: monospace;">${formatCurrLoc(paid)}</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; padding: 5px; font-family: monospace; font-weight: bold;">${formatCurrLoc(pending)}</td>
          </tr>
        `;
      }
    }).join('');

    const emptyColSpan = isPending ? (isPayables ? 7 : 8) : (isPayables ? 7 : 8);

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Statement_Report</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; color: #000000; margin: 15px; }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .header-table td { vertical-align: top; }
          .company-title { font-size: 16pt; font-weight: bold; color: #0e2a47; margin: 0; }
          .company-subtitle { font-size: 9pt; font-weight: bold; color: #64748b; margin-top: 2px; }
          .company-info { font-size: 8.5pt; color: #000000; margin-top: 6px; line-height: 1.4; }
          
          .report-title { font-size: 13pt; font-weight: bold; color: #0e2a47; text-align: right; }
          .meta-label { font-size: 8.5pt; font-weight: bold; color: #475569; }
          .meta-val { font-size: 8.5pt; font-weight: bold; color: #000000; }
          
          .divider-line { border-bottom: 2px solid #0e2a47; margin-top: 8px; margin-bottom: 12px; }
          
          .info-box-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .statement-to-box { width: 50%; border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; background-color: #ffffff; }
          .statement-account-box { width: 45%; border: 1.5px solid #0e2a47; padding: 0; vertical-align: top; background-color: #ffffff; }
          
          .stat-header { background-color: #0e2a47; color: #ffffff; font-size: 9.5pt; font-weight: bold; padding: 6px 8px; text-align: center; }
          .stat-cell-lbl { font-size: 8.5pt; font-weight: bold; padding: 4px 8px; border-bottom: 1px solid #cbd5e1; background-color: #f8fafc; }
          .stat-cell-val { font-size: 8.5pt; font-weight: bold; padding: 4px 8px; border-bottom: 1px solid #cbd5e1; text-align: right; font-family: monospace; }
          
          .ledger-table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; border: 1px solid #000000; }
          .ledger-table th { background-color: #0e2a47; color: #ffffff; font-size: 8.5pt; font-weight: bold; padding: 6px 4px; border: 1px solid #000000; text-align: center; }
          .ledger-table td { font-size: 8pt; padding: 5px 4px; border: 1px solid #cbd5e1; vertical-align: middle; }
          .ledger-table tr:nth-child(even) td { background-color: #f8fafc; }
          
          .ledger-total-row td { background-color: #e2e8f0; font-weight: bold; font-size: 8.5pt; border-top: 2px solid #0e2a47; border-bottom: 2px solid #0e2a47; }
          
          .aging-table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; border: 1px solid #000000; }
          .aging-table th { background-color: #1e293b; color: #ffffff; font-size: 8pt; font-weight: bold; padding: 5px; border: 1px solid #000000; text-align: center; }
          .aging-table td { font-size: 8pt; font-weight: bold; padding: 6px; border: 1px solid #000000; text-align: center; font-family: monospace; }
          
          .words-box { border: 1.5px solid #000000; padding: 6px 8px; font-size: 8.5pt; font-weight: bold; background-color: #f8fafc; margin-top: 10px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td style="width: 55%;">
              <div class="company-title">${companyProfile.name}</div>
              ${isMarineFastenersCompany(companyProfile) ? `<div class="company-subtitle">(SOLE PROPRIETORSHIP)</div>` : (companyProfile.tagline ? `<div class="company-subtitle">${companyProfile.tagline}</div>` : '')}
              <div class="company-info">
                Add: ${companyProfile.address}<br/>
                Telephone: ${companyProfile.phone || '—'} | Email: ${companyProfile.email || '—'}<br/>
                Website: ${companyProfile.website || '—'}<br/>
                TRN: ${companyProfile.trn || '—'}
              </div>
            </td>
            <td style="width: 45%; text-align: right;">
              <div class="report-title">${reportTitle}</div>
              <div style="margin-top: 10px;">
                <span class="meta-label">Statement Date:</span> <span class="meta-val">${formattedDate}</span>
              </div>
              <div style="margin-top: 4px;">
                <span class="meta-label">Currency:</span> <span class="meta-val">AED</span>
              </div>
            </td>
          </tr>
        </table>

        <div class="divider-line"></div>

        <table class="info-box-table">
          <tr>
            <td class="statement-to-box">
              <div style="font-weight: bold; font-size: 8.5pt; margin-bottom: 3px;">Statement to:</div>
              <div style="font-size: 11pt; font-weight: bold; color: #000000; margin-bottom: 4px;">
                ${singleParty ? singleParty.companyName : (isPayables ? 'ALL SUPPLIERS' : 'ALL CUSTOMERS')}
              </div>
              <div style="font-size: 8.5pt; line-height: 1.4;">
                Address: ${singleParty?.address || 'UNITED ARAB EMIRATES'}<br/>
                Phone: ${singleParty?.phone || '—'}<br/>
                P.O. Box: ${singleParty?.poBox || '—'}<br/>
                TRN: ${singleParty?.trn || '—'}
              </div>
            </td>
            <td style="width: 5%;"></td>
            <td class="statement-account-box">
              <div class="stat-header">Outstanding Balance Summary</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td class="stat-cell-lbl">Total Invoice Amount</td>
                  <td class="stat-cell-val">AED &nbsp; ${formatCurrLoc(totalSales)}</td>
                </tr>
                <tr>
                  <td class="stat-cell-lbl">Amount Paid</td>
                  <td class="stat-cell-val">AED &nbsp; ${formatCurrLoc(totalPaid)}</td>
                </tr>
                <tr>
                  <td class="stat-cell-lbl">Net Outstanding / Due</td>
                  <td class="stat-cell-val" style="color: #92400e;">AED &nbsp; ${formatCurrLoc(totalPending)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table class="ledger-table">
          <thead>
            ${isPending ? `
              <tr>
                <th style="width: 4%;">#</th>
                <th style="width: 8%;">Date</th>
                <th style="width: 9%;">Payment Terms</th>
                <th style="width: 7%;">Overdue Days</th>
                <th style="width: 22%;">${partyLabel}</th>
                <th style="width: 10%;">LPO Ref</th>
                <th style="width: 10%;">Invoice Ref</th>
                ${isPayables ? '' : '<th style="width: 8%;">W/O Ref</th>'}
                <th style="width: 11%;">Total Amount (AED)</th>
                <th style="width: 11%;">Paid Amount (AED)</th>
                <th style="width: 11%;">Pending Balance (AED)</th>
              </tr>
            ` : `
              <tr>
                <th style="width: 4%;">#</th>
                <th style="width: 7%;">Date</th>
                <th style="width: 7%;">Payment Terms</th>
                <th style="width: 6%;">Overdue Days</th>
                <th style="width: 18%;">${partyLabel}</th>
                <th style="width: 8%;">LPO Ref</th>
                <th style="width: 9%;">Invoice Ref</th>
                ${isPayables ? '' : '<th style="width: 7%;">W/O Ref</th>'}
                <th style="width: 9%;">Total Amount (AED)</th>
                <th style="width: 7%;">Date Paid</th>
                <th style="width: 8%;">Receipt No</th>
                <th style="width: 7%;">Pay Mode</th>
                <th style="width: 9%;">Amount Paid (AED)</th>
                <th style="width: 9%;">Balance (AED)</th>
              </tr>
            `}
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="${isPending ? (isPayables ? 10 : 11) : (isPayables ? 13 : 14)}" style="text-align: center; color: #64748b; padding: 15px;">No records found.</td></tr>`}

            ${isPending ? `
              <tr class="ledger-total-row">
                <td colspan="${emptyColSpan}" style="text-align: right; font-weight: bold; padding: 6px 4px;">Total Outstandings AED</td>
                <td style="text-align: right; font-weight: bold; font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(totalSales)}</td>
                <td style="text-align: right; font-weight: bold; font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(totalPaid)}</td>
                <td style="text-align: right; font-weight: bold; font-family: monospace; background-color: #fde68a; color: #78350f; border: 1px solid #000000;">${formatCurrLoc(totalPending)}</td>
              </tr>
            ` : `
              <tr class="ledger-total-row">
                <td colspan="${emptyColSpan}" style="text-align: right; font-weight: bold; padding: 6px 4px;">Total Outstandings AED</td>
                <td style="text-align: right; font-weight: bold; font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(totalSales)}</td>
                <td colspan="3" style="background-color: #e2e8f0; border: 1px solid #000000;"></td>
                <td style="text-align: right; font-weight: bold; font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(totalPaid)}</td>
                <td style="text-align: right; font-weight: bold; font-family: monospace; background-color: #fde68a; color: #78350f; border: 1px solid #000000;">${formatCurrLoc(totalPending)}</td>
              </tr>
            `}
          </tbody>
        </table>

        <div style="font-size: 8.5pt; font-weight: bold; margin-top: 15px; margin-bottom: 4px; color: #0e2a47;">
          INVOICE AGING BREAKDOWN
        </div>
        <table class="aging-table">
          <thead>
            <tr>
              <th style="width: 14%;">Current</th>
              <th style="width: 14%;">1-30 Days</th>
              <th style="width: 14%;">31-60 Days</th>
              <th style="width: 14%;">61-90 Days</th>
              <th style="width: 14%;">91-120 Days</th>
              <th style="width: 14%;">Over 120 Days</th>
              <th style="width: 16%; background-color: #ffffff; color: #000000;">Total Balance AED</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(ageCurrent)}</td>
              <td style="font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(age1_30)}</td>
              <td style="font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(age31_60)}</td>
              <td style="font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(age61_90)}</td>
              <td style="font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(age91_120)}</td>
              <td style="font-family: monospace; border: 1px solid #000000;">${formatCurrLoc(ageOver120)}</td>
              <td style="font-family: monospace; font-weight: bold; background-color: #fef3c7; color: #92400e; border: 1px solid #000000;">${formatCurrLoc(totalAgingBalance)}</td>
            </tr>
          </tbody>
        </table>

        <div class="words-box">
          Balance Amount in Words: <span style="font-weight: bold; color: #1e3a8a;">${convertAmountToWordsAED(totalPending)}</span>
        </div>

        <div style="font-size: 8pt; font-style: italic; color: #64748b; margin-top: 15px; text-align: center;">
          This is an official computer-generated statement exported from ${companyProfile.name} ERP system.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL ? URL.createObjectURL(blob) : (window as any).webkitURL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReceivablesToExcel = (mode: 'pending' | 'full') => {
    const filename = mode === 'pending'
      ? `MFI_Receivables_Pending_Report_${new Date().toISOString().split('T')[0]}`
      : `MFI_Receivables_Full_Statement_${new Date().toISOString().split('T')[0]}`;
    exportFormattedXLS(mode === 'pending' ? 'receivables_pending' : 'receivables_full', filename);
  };

  const exportPayablesToExcel = (mode: 'pending' | 'full') => {
    const filename = mode === 'pending'
      ? `MFI_Payables_Pending_Report_${new Date().toISOString().split('T')[0]}`
      : `MFI_Payables_Full_Statement_${new Date().toISOString().split('T')[0]}`;
    exportFormattedXLS(mode === 'pending' ? 'payables_pending' : 'payables_full', filename);
  };

  const handlePreviewTaxInvoice = (cust: any, tx: SoaTransaction) => {
    let doc = null;
    try {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        const list = JSON.parse(saved);
        doc = list.find((d: any) => 
          (d.invoiceNo && tx.invoiceRef && d.invoiceNo.trim().toUpperCase() === tx.invoiceRef.trim().toUpperCase()) ||
          (d.id && tx.invoiceRef && d.id === tx.invoiceRef)
        );
      }
    } catch (e) {}

    const isSupplier = cust?.id?.startsWith('supp-') || cust?.companyName?.toUpperCase().includes('SUPPLIER');

    if (!doc) {
      const invNo = tx.invoiceRef && tx.invoiceRef !== '—' ? tx.invoiceRef : (isSupplier ? `SUPP-INV-${Date.now().toString().slice(-5)}` : `INV-${Date.now().toString().slice(-5)}`);
      const grossAmt = Number(tx.amount) || 0;
      const netAmt = grossAmt / 1.05;
      const vatAmt = grossAmt - netAmt;

      if (isSupplier) {
        doc = {
          id: tx.id || 'inv-temp',
          invoiceNo: invNo,
          date: tx.date || new Date().toISOString().split('T')[0],
          documentType: 'SUPPLIER TAX INVOICE',
          buyerName: cust?.companyName || 'SUPPLIER ACCOUNT',
          buyerAddress: cust?.address || 'UNITED ARAB EMIRATES',
          buyerTrn: cust?.trn || '100440509600003',
          buyerPoBox: cust?.poBox || '—',
          buyerPhone: cust?.phone || '—',
          lpoNo: tx.lpoRef || '—',
          workOrderNo: tx.woRef || '—',
          paymentTerms: tx.paymentTerms || '30 Days',
          currency: 'AED',
          items: [
            {
              id: 'item-1',
              sn: 1,
              description: `SUPPLIER TAX INVOICE FOR PURCHASED MATERIALS / GOODS - REF: ${invNo}`,
              qty: 1,
              unit: 'LOT',
              unitPrice: netAmt,
              unitPriceWOVAT: netAmt,
              vatRate: 5,
              amount: netAmt
            }
          ],
          discountAmt: 0,
          freightAmt: 0,
          subTotal: netAmt,
          vatAmount: vatAmt,
          grandTotal: grossAmt,
          amountPaid: tx.amountPaid || 0,
          balance: grossAmt - (tx.amountPaid || 0),
          status: 'approved'
        };
      } else {
        doc = {
          id: tx.id || 'inv-temp',
          invoiceNo: invNo,
          date: tx.date || new Date().toISOString().split('T')[0],
          documentType: 'TAX INVOICE',
          buyerName: cust?.companyName || 'CUSTOMER ACCOUNT',
          buyerAddress: cust?.address || 'UNITED ARAB EMIRATES',
          buyerTrn: cust?.trn || '—',
          buyerPoBox: cust?.poBox || '—',
          buyerPhone: cust?.phone || '—',
          lpoNo: tx.lpoRef || '—',
          workOrderNo: tx.woRef || '—',
          paymentTerms: tx.paymentTerms || '30 Days',
          currency: 'AED',
          items: [
            {
              id: 'item-1',
              sn: 1,
              description: `TAX INVOICE FOR DELIVERED MATERIALS / SERVICES - REF: ${invNo}`,
              qty: 1,
              unit: 'LOT',
              unitPrice: netAmt,
              unitPriceWOVAT: netAmt,
              vatRate: 5,
              amount: netAmt
            }
          ],
          discountAmt: 0,
          freightAmt: 0,
          subTotal: netAmt,
          vatAmount: vatAmt,
          grandTotal: grossAmt,
          amountPaid: tx.amountPaid || 0,
          balance: grossAmt - (tx.amountPaid || 0),
          status: 'approved'
        };
      }
    }

    const docTypeLabel = isSupplier ? 'PURCHASE INVOICE' : 'TAX INVOICE';
    const htmlContent = generateHighFidelityDocHtml(doc, docTypeLabel, undefined, { singleCopy: true });

    setDocPreviewModal({
      show: true,
      title: `${isSupplier ? 'Purchase Invoice' : 'Tax Invoice'} Print Preview — ${doc.invoiceNo} (${cust?.companyName || ''})`,
      htmlContent
    });
  };
  const handleAddTransaction = (customerId: string) => {
    const amt = parseFloat(txAmount) || 0;
    const pd = parseFloat(txAmtPaid) || 0;
    
    const newTx: SoaTransaction = {
      id: 'tx-' + Date.now(),
      date: txDate,
      paymentTerms: txPaymentTerms || '60 Days',
      overdueDays: parseInt(txOverdueDays, 10) || 0,
      lpoRef: txLpo || '—',
      invoiceRef: txInvoice || '—',
      woRef: txWo || '—',
      deliveryDates: txDelivery || txDate,
      amount: amt,
      datePaid: txDatePaid || '—',
      receiptNo: txReceiptNo || '—',
      paymentMode: txMode || '—',
      amountPaid: pd
    };

    const existingArr = customerTransactions[customerId] || [];
    const updatedLedger = {
      ...customerTransactions,
      [customerId]: [...existingArr, newTx]
    };

    setCustomerTransactions(updatedLedger);
    
    // Clear inputs
    setTxLpo('');
    setTxInvoice('');
    setTxWo('');
    setTxDelivery('');
    setTxAmount('');
    setTxAmtPaid('');

    // Dynamically update the default aging buckets state based on new numbers only if there was an active override
    if (agingOverrides[customerId]) {
      const currentOver = agingOverrides[customerId];
      const balance = amt - pd;
      if (balance > 0) {
        const updatedAging = { ...currentOver };
        const age = parseInt(txOverdueDays, 10) || 0;
        if (age <= 0) {
          updatedAging.current += balance;
        } else if (age <= 30) {
          updatedAging.days1to30 += balance;
        } else if (age <= 60) {
          updatedAging.days31to60 += balance;
        } else if (age <= 90) {
          updatedAging.days61to90 += balance;
        } else if (age <= 120) {
          updatedAging.days91to120 += balance;
        } else {
          updatedAging.over120 += balance;
        }
        setAgingOverrides({
          ...agingOverrides,
          [customerId]: updatedAging
        });
      }
    }
  };

  // Handle Delete a transaction row
  const handleDeleteTransaction = (customerId: string, txId: string) => {
    const list = customerTransactions[customerId] || [];
    const tx = list.find(t => t.id === txId);
    if (tx && (tx.purchaseId || tx.id.startsWith('supp-tx-'))) {
      syncSupplierPurchaseStatus(tx.purchaseId || tx.id.replace('supp-tx-', ''), tx.invoiceRef, 0, tx.amount || 0);
    }
    const filtered = list.filter(t => t.id !== txId);
    setCustomerTransactions({
      ...customerTransactions,
      [customerId]: filtered
    });
  };

  // Helper: Calculate grand totals for all customers
  const getGrandTotalsForAll = () => {
    return getSellerGrandTotals('ALL');
  };

  // Helper mapping to count customer lists per seller
  const sellerGrand = getGrandTotalsForAll();

  // Active customer objects
  const activeSellerCustomers = customers.filter(cust => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return cust.companyName.toLowerCase().includes(query) || 
           (cust.contactPerson && cust.contactPerson.toLowerCase().includes(query)) ||
           cust.address.toLowerCase().includes(query);
  });

  // Unassigned customers or customers of OTHER sellers that we can assign/reassign
  const allOtherCustomers = customers.filter(c => customerSellerMap[c.id] !== activeSellerCode);

  const activeSellerName = sellers.find(s => s.code === activeSellerCode)?.name || activeSellerCode;

  const activeCustomer = customers.find(c => c.id === selectedCustomerIdForSoa);
  const isCurrentSupplier = selectedCustomerIdForSoa?.startsWith('supp-') || (activeCustomer?.companyName || '').toUpperCase().includes('SUPPLIER');
  const activeCustomerTxs = selectedCustomerIdForSoa ? getFilteredTransactions(selectedCustomerIdForSoa) : [];
  const activeCustomerTotals = selectedCustomerIdForSoa ? getCustomerTotals(selectedCustomerIdForSoa) : { totalSales: 0, totalPaid: 0, pending: 0 };
  const activeCustomerAging = selectedCustomerIdForSoa 
    ? getCustomerAgingObj(selectedCustomerIdForSoa)
    : { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };

  const manualTotalAmount = stmtTxs.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const manualTotalPaid = stmtTxs.reduce((acc, t) => acc + (Number(t.amountPaid) || 0), 0);
  const manualTotalOutstanding = manualTotalAmount - manualTotalPaid;
  const manualTotalAgingBalance = (Number(stmtAging.current) || 0) +
                                  (Number(stmtAging.days1to30) || 0) +
                                  (Number(stmtAging.days31to60) || 0) +
                                  (Number(stmtAging.days61to90) || 0) +
                                  (Number(stmtAging.days91to120) || 0) +
                                  (Number(stmtAging.over120) || 0);

  const triggerCurrentFormPrint = () => {
    const compiled: CustomStatement = {
      id: 'stmt-temp-print',
      createdAt: new Date().toISOString(),
      statementDate: stmtDate,
      periodFrom: stmtPeriodFrom,
      periodTo: stmtPeriodTo,
      customerCode: stmtCustomerCode || 'MFI-TEMP',
      companyName: stmtCompanyName.trim().toUpperCase() || 'SUPER ENGINEERING INDUSTRY',
      address: stmtAddress,
      phone: stmtPhone,
      trn: stmtTrn,
      poBox: stmtPoBox,
      sellerCode: stmtSellerCode,
      currency: stmtCurrency,
      transactions: stmtTxs,
      aging: stmtAging,
      bankDetails: { ...stmtBankDetails },
      showDeliveryDate: stmtShowDeliveryDate
    };
    triggerCustomStatementPrint(compiled);
  };

    const printCustomerSoaById = (targetCustomerId?: string | null, balanceOnly = false) => {
    const companyProfile = getCompanyProfile();
    const custId = targetCustomerId || selectedCustomerIdForSoa || activeCustomer?.id || (customers.length > 0 ? customers[0].id : null);
    if (!custId) return;

    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    const sellerCode = customerSellerMap[cust.id] || 'FSL';
    const custTxs = getFilteredTransactions(cust.id);
    const custTotals = getCustomerTotals(cust.id);
    const custAging = getCustomerAgingObj(cust.id);

    const printYear = filterYear === 'ALL' ? '2026' : filterYear;
    const printPeriod = `01/01/${printYear} - 31/12/${printYear}`;

    // Formatting date helper relative to current selected statement date
    const parsedDate = parseRobustDate(stmtDate) || new Date();
    const formattedDate = parsedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Formatting currency values
    const formatCurr = (val: number) => {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    };

    const isSupp = cust.id.startsWith('supp-') || cust.companyName.toUpperCase().includes('SUPPLIER');
    const hasDeliveryDate = showDeliveryDateInLedger;

    // Filter transactions if balanceOnly is enabled
    const txsToRender = balanceOnly
      ? custTxs.filter(t => (Number(t.amount || 0) - Number(t.amountPaid || 0)) > 0.01)
      : custTxs;

    // Calculate dynamic rows
    const hasLinkedReceiptRows = txsToRender.some(t => t.isLinkedReceipt && Number(t.amountPaid || 0) > 0);

    let runningBalance = 0;
    const txRowsHtml = txsToRender.map(t => {
      if (!t.isLinkedReceipt) {
        if (!hasLinkedReceiptRows) {
          runningBalance += Number(t.amount || 0);
          runningBalance -= Number(t.amountPaid || 0);
        } else {
          runningBalance += Number(t.amount || 0);
        }
      } else {
        runningBalance -= Number(t.amountPaid || 0);
      }
      const pendingAmt = Number(t.amount || 0) - Number(t.amountPaid || 0);

      if (balanceOnly) {
        return `
          <tr style="font-size: 11px; font-family: monospace;">
            <td style="border-bottom: 0.5px solid #000000; padding: 6px 4px; text-align: left;">${t.date || '—'}</td>
            <td style="border-bottom: 0.5px solid #000000; padding: 6px 4px;">${t.paymentTerms || '—'}</td>
            <td style="border-bottom: 0.5px solid #000000; padding: 6px 4px; color: ${t.overdueDays > getTermsLimit(t.paymentTerms) ? '#b91c1c' : '#16a34a'}; font-weight: bold;">${t.overdueDays || '0'}</td>
            <td style="border-bottom: 0.5px solid #000000; padding: 6px 4px;">${t.lpoRef || '—'}</td>
            <td style="border-bottom: 0.5px solid #000000; padding: 6px 4px; font-weight: bold;">${t.invoiceRef || '—'}</td>
            ${isSupp ? '' : `<td style="border-bottom: 0.5px solid #000000; padding: 6px 4px;">${t.woRef || '—'}</td>`}
            ${hasDeliveryDate ? `<td style="border-bottom: 0.50px solid #000000; padding: 6px 4px;">${t.deliveryDates || '—'}</td>` : ''}
            <td style="border-bottom: 0.50px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold;">${formatCurr(t.amount)}</td>
            <td style="border-bottom: 0.50px solid #000000; padding: 6px 4px; text-align: right; font-weight: bold; background-color: #fafafa; color: #854d0e;">${formatCurr(pendingAmt)}</td>
          </tr>
        `;
      }

      return `
        <tr style="font-size: 11px; font-family: monospace;">
          <td style="border-bottom: 0.5px solid #000000; padding: 6px 3px; text-align: left;">${t.date || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 6px 3px;">${t.paymentTerms || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 6px 3px; color: ${t.overdueDays > getTermsLimit(t.paymentTerms) ? '#b91c1c' : '#16a34a'}; font-weight: bold;">${t.overdueDays || '0'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 6px 3px;">${t.lpoRef || '—'}</td>
          <td style="border-bottom: 0.5px solid #000000; padding: 6px 3px; font-weight: bold;">${t.invoiceRef || '—'}</td>
          ${isSupp ? '' : `<td style="border-bottom: 0.5px solid #000000; padding: 6px 3px;">${t.woRef || '—'}</td>`}
          ${hasDeliveryDate ? `<td style="border-bottom: 0.50px solid #000000; padding: 6px 3px;">${t.deliveryDates || '—'}</td>` : ''}
          <td style="border-bottom: 0.50px solid #000000; padding: 6px 3px; text-align: right; font-weight: bold;">${formatCurr(t.amount)}</td>
          <td style="border-bottom: 0.50px solid #000000; padding: 6px 3px;">${t.datePaid || '—'}</td>
          <td style="border-bottom: 0.50px solid #000000; padding: 6px 3px;">${t.receiptNo || '—'}</td>
          <td style="border-bottom: 0.50px solid #000000; padding: 6px 3px;">${t.paymentMode || '—'}</td>
          <td style="border-bottom: 0.50px solid #000000; padding: 6px 3px; text-align: right; color: #15803d;">${formatCurr(t.amountPaid)}</td>
          <td style="border-bottom: 0.50px solid #000000; padding: 6px 3px; text-align: right; font-weight: bold; background-color: #fafafa;">${formatCurr(runningBalance)}</td>
        </tr>
      `;
    }).join('');

    const totalAgingBalance = custAging.current + custAging.days1to30 + custAging.days31to60 + custAging.days61to90 + custAging.days91to120 + custAging.over120;

    const shouldPageBreakBank = custTxs.length > 7;

    const pageReportTitle = isSupp
      ? (balanceOnly ? 'ACCOUNTS PAYABLE OUTSTANDING REPORT' : 'ACCOUNTS PAYABLE STATEMENT OF ACCOUNT')
      : (balanceOnly ? 'ACCOUNTS RECEIVABLE OUTSTANDING REPORT' : 'STATEMENT OF ACCOUNT');

    const htmlContent = `
      <html>
      <head>
        <title>${pageReportTitle} - ${cust.companyName}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Arial MT', Arial, 'Helvetica Neue', Helvetica, sans-serif;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 15mm;
            font-size: 8.5px;
            line-height: 1.45;
          }
          .title-area, .subtitle-area, .meta-val, .stat-header, th, .ledger-total-row td, .aging-table th, b, strong, .font-bold {
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
            font-weight: bold;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
          }
          .title-area {
            color: #000000;
            font-weight: 850;
            font-size: 14.5px;
            letter-spacing: 0.1px;
            margin: 0;
            padding: 0;
            line-height: 1.1;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
          }
          .subtitle-area {
            font-size: 8px;
            color: #000000;
            font-weight: bold;
            margin-top: 1px;
            text-transform: uppercase;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
          }
          .meta-label {
            font-size: 8.5px;
            font-weight: normal;
            color: #000000;
            font-family: 'Arial MT', Arial, sans-serif;
          }
          .meta-val {
            font-size: 8.5px;
            font-weight: bold;
            color: #000000;
            font-family: 'Arial MT Bold', 'Arial MT', Arial, sans-serif;
          }
          .divider-line {
            border-top: 1.5px solid #000000;
            margin: 12px 0 15px 0;
          }
          .info-box-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }
          .statement-to-box {
            vertical-align: top;
            width: 58%;
            font-size: 8.5px;
            color: #000000;
            line-height: 1.4;
          }
          .statement-account-box {
            border: 1px solid #000000;
            vertical-align: top;
            width: 37%;
            background-color: #ffffff;
          }
          .stat-header {
            border-bottom: 1px solid #000000;
            color: #000000;
            font-weight: 850;
            text-align: center;
            padding: 4px;
            font-size: 9.5px;
            letter-spacing: 0.2px;
            font-family: sans-serif;
          }
          .stat-cell-lbl {
            padding: 4.5px 8px;
            font-weight: normal;
            font-size: 8.5px;
            color: #000000;
          }
          .stat-cell-val {
            padding: 4.5px 8px;
            text-align: right;
            font-weight: bold;
            font-size: 8.5px;
          }
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 5px;
          }
          .ledger-table th {
            color: #000000;
            font-weight: bold;
            font-size: 11.5px;
            padding: 6px 3px;
            text-align: center;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
            font-family: sans-serif;
          }
          .ledger-table td {
            border-bottom: 0.5px solid #000000;
            padding: 8px 3px;
            font-size: 11px;
            text-align: center;
          }
          .ledger-total-row td {
            font-weight: bold;
            font-size: 11.5px;
            padding: 8px 3px;
            border-top: 2px solid #000000;
            border-bottom: 2px solid #000000;
          }
          .aging-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
            margin-bottom: 15px;
            border: 1px solid #000000;
          }
          .aging-table th {
            border: 1px solid #000000;
            padding: 4px 5px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            color: #000000;
            font-family: sans-serif;
          }
          .aging-table td {
            border: 1px solid #000000;
            padding: 5px;
            font-size: 8px;
            text-align: center;
            font-weight: bold;
          }
          .bank-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 8.5px;
          }
          .bank-grid td {
            padding: 2.5px 0;
            vertical-align: top;
          }
          @media print {
            body {
               padding: 15mm;
               padding-bottom: 2.2cm;
            }
            thead {
              display: table-header-group !important;
            }
            tr {
              page-break-inside: avoid !important;
            }
            .print-footer {
              position: fixed;
              bottom: 0.8cm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 8px;
              color: #000000;
              font-weight: bold;
              font-style: italic;
              font-family: sans-serif;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header Section -->
        <table class="header-table">
          <tr>
            <td style="width: 55%; vertical-align: top;">
              <h1 class="title-area">${companyProfile.name}</h1>
              ${isMarineFastenersCompany(companyProfile) ? `<div class="subtitle-area">(SOLE PROPRIETORSHIP)</div>` : (companyProfile.tagline ? `<div class="subtitle-area">${companyProfile.tagline}</div>` : '')}
              <div style="font-size: 8.5px; color: #000000; margin-top: 8px; line-height: 1.45;">
                Add: ${companyProfile.address}<br/>
                Telephone: ${companyProfile.phone || '—'}<br/>
                Email: ${companyProfile.email || '—'}<br/>
                Website: ${companyProfile.website || '—'}<br/>
                TRN: ${companyProfile.trn || '—'}
              </div>
            </td>
            <td style="width: 45%; text-align: right; vertical-align: top; line-height: 1.45;">
              <div style="height: 15px;"></div>
              <div><span class="meta-label">Statement Date :</span> <span class="meta-val">&nbsp; &nbsp; &nbsp; &nbsp; ${formattedDate}</span></div>
              <div style="height: 15px;"></div>
              <div style="display: inline-block; width: 100%; text-align: right; padding-bottom: 4px;">
                <div><span class="meta-label">${isSupp ? 'Supplier code :' : 'Customer code :'}</span> <span class="meta-val">${isSupp ? cust.id.replace('supp-', 'SUPP-').toUpperCase() : cust.id.replace('cust-ocr-', 'MFI-')}</span></div>
                <div><span class="meta-label">${isSupp ? 'Buyer :' : 'Seller :'}</span> <span class="meta-val">${isSupp ? companyProfile.name : (sellerCode || '—')}</span></div>
                <div><span class="meta-label">Currency :</span> <span class="meta-val">&nbsp; AED &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span></div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Divider full-width solid line -->
        <div class="divider-line"></div>

        <!-- Info Boxes (Statement To & Statement Account Summary) -->
        <table class="info-box-table">
          <tr>
            <td class="statement-to-box">
              <div style="font-weight: bold; margin-bottom: 3px; font-size: 8.5px;">Statement to:</div>
              <div style="font-size: 11.5px; font-weight: 900; color: #000000; line-height: 1.25; margin-bottom: 5px;">${cust.companyName}</div>
              <div style="font-size: 8.5px; line-height: 1.45;">
                Address : ${cust.address || '—'}<br/>
                Phone : ${cust.phone || '—'}<br/>
                Fax : —<br/>
                P.O. Box : ${cust.poBox || '—'}<br/>
                TRN : ${cust.trn || '—'}
              </div>
            </td>
            <td style="width: 5%;"></td>
            <td class="statement-account-box">
              <div class="stat-header">Outstanding Balance</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 0.5px solid #000000;">
                  <td class="stat-cell-lbl">Total Amount</td>
                  <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(custTotals.totalSales)}</td>
                </tr>
                <tr style="border-bottom: 0.5px solid #000000;">
                  <td class="stat-cell-lbl">Amount Paid</td>
                  <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(custTotals.totalPaid)}</td>
                </tr>
                <tr>
                  <td class="stat-cell-lbl">Amount Due</td>
                  <td class="stat-cell-val" style="font-family: monospace;">AED &nbsp; &nbsp; ${formatCurr(custTotals.pending)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Period display -->
        ${balanceOnly ? "" : `
        <div style="margin-top: 10px; margin-bottom: 5px; text-align: right; font-weight: bold; font-size: 8px;">
          Period: ${printPeriod}
        </div>
        `}

        <table class="ledger-table">
          <thead>
            ${balanceOnly ? `
              <tr>
                <th style="width: 10%; text-align: left;">Date</th>
                <th style="width: 10%;">Payment<br/>Terms</th>
                <th style="width: 8%;">Overdue<br/>Days</th>
                <th style="width: 12%;">LPO Ref</th>
                <th style="width: 12%;">Invoice Ref</th>
                ${isSupp ? '' : '<th style="width: 10%;">W/O Ref</th>'}
                ${hasDeliveryDate ? '<th style="width: 10%;">Delivery<br/>Dates</th>' : ''}
                <th style="width: 14%; text-align: right;">Amount</th>
                <th style="width: 14%; text-align: right;">Pending Due</th>
              </tr>
            ` : `
              <tr>
                <th style="width: 8%; text-align: left;">Date</th>
                <th style="width: 8%;">Payment<br/>Terms</th>
                <th style="width: 6%;">Overdue<br/>Days</th>
                <th style="width: 8%;">LPO Ref</th>
                <th style="width: 9%;">Invoice Ref</th>
                ${isSupp ? '' : '<th style="width: 6%;">W/O Ref</th>'}
                ${hasDeliveryDate ? '<th style="width: 9%;">Delivery<br/>Dates</th>' : ''}
                <th style="width: 9%; text-align: right;">Amount</th>
                <th style="width: 9%;">Date Paid</th>
                <th style="width: 9%;">Receipt No</th>
                <th style="width: 9%;">Pay Mode</th>
                <th style="width: 10%; text-align: right;">Amount<br/>Paid</th>
                <th style="width: 10%; text-align: right;">Balance</th>
              </tr>
            `}
          </thead>
          <tbody>
            ${txRowsHtml || `<tr><td colspan="${balanceOnly ? (5 + (isSupp ? 0 : 1) + (hasDeliveryDate ? 1 : 0) + 2) : (5 + (isSupp ? 0 : 1) + (hasDeliveryDate ? 1 : 0) + 6)}" style="text-align: center; color: #64748b; padding: 15px; font-style: italic;">No ledger records found for this period.</td></tr>`}
            
            ${balanceOnly ? `
              <tr class="ledger-total-row">
                <td colspan="${5 + (isSupp ? 0 : 1) + (hasDeliveryDate ? 1 : 0)}" style="text-align: right; font-weight: bold; padding: 6px 4px;">Total Pending Outstandings</td>
                <td style="text-align: right; font-weight: bold; padding: 6px 4px; font-family: monospace;">${formatCurr(custTotals.totalSales)}</td>
                <td style="text-align: right; font-weight: bold; padding: 6px 4px; font-family: monospace; background-color: #fef3c7; color: #92400e;">${formatCurr(custTotals.pending)}</td>
              </tr>
            ` : `
              <tr class="ledger-total-row">
                <td colspan="${5 + (isSupp ? 0 : 1) + (hasDeliveryDate ? 1 : 0)}" style="text-align: right; font-weight: bold; padding: 5px 2px;">Total Outstandings</td>
                <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(custTotals.totalSales)}</td>
                <td colspan="3" style="border-bottom: 2px solid #000000;"></td>
                <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(custTotals.totalPaid)}</td>
                <td style="text-align: right; font-weight: bold; padding: 5px 2px; font-family: monospace;">${formatCurr(custTotals.pending)}</td>
              </tr>
            `}
          </tbody>
        </table>

        <div style="${shouldPageBreakBank ? 'page-break-before: always; margin-top: 15px;' : 'margin-top: 15px;'}">
          <table class="aging-table">
            <thead>
              <tr>
                <th style="width: 14%;">Current</th>
                <th style="width: 14%;">1-30 Days</th>
                <th style="width: 14%;">31-60 Days</th>
                <th style="width: 14%;">61-90 Days</th>
                <th style="width: 14%;">91-120 Days</th>
                <th style="width: 14%;">Over 120 Days</th>
                <th style="width: 16%; background-color: #ffffff; color: #000000;">Total Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${formatCurr(custAging.current)}</td>
                <td>${formatCurr(custAging.days1to30)}</td>
                <td>${formatCurr(custAging.days31to60)}</td>
                <td>${formatCurr(custAging.days61to90)}</td>
                <td>${formatCurr(custAging.days91to120)}</td>
                <td>${formatCurr(custAging.over120)}</td>
                <td style="font-weight: bold;">${formatCurr(totalAgingBalance)}</td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 8.5px; font-weight: bold; border: 1.5px solid #000000; padding: 5px; margin-top: 15px; margin-bottom: 15px; background-color: #f8fafc; font-family: sans-serif; text-transform: uppercase;">
            Balance Amount in Words: <span style="font-weight: 900; color: #1e3a8a;">${convertAmountToWordsAED(custTotals.pending)}</span>
          </div>

          <!-- Bank Details Section -->
          <div style="margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <div style="font-weight: bold; font-size: 8.5px; color: #000000; margin-bottom: 8px; font-family: sans-serif;">
              Please make any payment due, either by electronic transfer to our bank account or by cheque payable to
            </div>
            <table class="bank-grid">
              <tr>
                <td style="width: 18%; font-weight: bold; color: #000000;">Beneficiary</td>
                <td style="width: 82%; font-weight: bold;">${companyProfile.name}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">Bank Name</td>
                <td>RAK BANK</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">Account Number</td>
                <td style="font-weight: bold;">0242715908001</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">Branch</td>
                <td>KING FAISAL STREET, SHARJAH</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">Country</td>
                <td>UNITED ARAB EMIRATES</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">IBAN</td>
                <td>AE 940400000242715908001</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">Swift Code</td>
                <td>NRAKAEAK</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #000000;">Address</td>
                <td>RAK BANK, P.O.BOX: 1531, DUBAI, UAE</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="print-footer">
          This is computer generated statement, no signature required
        </div>
      </body>
      </html>
    `;

    setDocPreviewModal({
      show: true,
      title: `Statement of Account — ${cust.companyName}`,
      htmlContent
    });
  };

  const triggerPdfPrint = (balanceOnly = false) => {
    printCustomerSoaById(selectedCustomerIdForSoa, balanceOnly);
  };

  const currentAvailableYears = ['2026', '2025', '2024', 'ALL'];
  const currentMonths = [
    { value: 'ALL', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  return (
    <div className="space-y-3 select-none font-sans text-slate-800">
      
      {/* 1. TOP HEADER NAVIGATION - STATEMENT OF ACCOUNTS */}
      <div className="bg-white text-slate-800 p-2 px-3 rounded-lg shadow-3xs border border-slate-200 flex flex-wrap justify-between items-center gap-2 no-print">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#0e2a47] text-white rounded-md shadow-3xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-[#0e2a47] uppercase tracking-wide">
              Statement of Accounts
            </h2>
          </div>
        </div>

        {/* TWO PRIMARY BUTTONS: Outstandings & Statistics */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMainReportSection('outstandings');
              setActiveMainTab('ledgers');
            }}
            className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              mainReportSection === 'outstandings'
                ? 'bg-[#0e2a47] text-white shadow-3xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" /> Outstandings
          </button>

          <button
            type="button"
            onClick={() => setMainReportSection('statistics')}
            className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              mainReportSection === 'statistics'
                ? 'bg-[#0e2a47] text-white shadow-3xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Statistics
          </button>
        </div>
      </div>

      {/* 2. SUB NAVIGATION WHEN OUTSTANDINGS IS ACTIVE (SHOWS RECEIVABLES & PAYABLES BUTTONS) */}
      {mainReportSection === 'outstandings' && (
        <div className="bg-slate-50 p-2 px-3 rounded-lg border border-slate-200 no-print">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* TWO SUB-BUTTONS / ICONS: RECEIVABLES & PAYABLES */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setOutstandingsSubSection('receivables');
                  setStmtType('receivables_outstanding');
                }}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
                  outstandingsSubSection === 'receivables'
                    ? 'bg-[#f37021] text-white border-[#f37021] shadow-3xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-300" />
                <span>Receivables</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOutstandingsSubSection('payables');
                  setStmtType('payables_outstanding');
                }}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
                  outstandingsSubSection === 'payables'
                    ? 'bg-indigo-700 text-white border-indigo-700 shadow-3xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-300" />
                <span>Payables</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATEMENT OF ACCOUNTS STATISTICS VIEW (TALLY ENTERPRISE REDESIGN) */}
      {mainReportSection === 'statistics' && (
        <div className="no-print my-2">
          <SoaStatisticsView
            onQuit={() => {
              setMainReportSection('outstandings');
              setActiveMainTab('ledgers');
            }}
            activeCompany={activeCompany}
          />
        </div>
      )}



      {/* 2. DYNAMIC SELLER DROPDOWN SELECTOR & GRAND METRICS (ONLY ACTIVE WHEN OUTSTANDINGS LEDGERS DESK VISIBLE) */}
      {mainReportSection === 'outstandings' && activeMainTab === 'ledgers' && (
        <>
          {!selectedCustomerIdForSoa ? (
            /* SCREEN A: ITEMIZATION LIST FOR RECEIVABLES OR PAYABLES (FOCUS ERP STYLE) */
            <div className="space-y-4 no-print font-sans">
              {outstandingsSubSection === 'receivables' ? (
                /* RECEIVABLES TAX INVOICE ORDERS & MATRIX TABLE (FOCUS ERP STYLE) */
                <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
                  {/* Clean Corporate Toolbar */}
                  <div className="bg-slate-100 border-b border-slate-300 text-slate-900 p-2 px-3 flex flex-wrap items-center justify-between gap-2">
                    {/* Integrated Controls & Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-lg border border-slate-300 shadow-3xs w-full">
                      {/* Search Input Box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={outstandingsSearchQuery}
                          onChange={(e) => {
                            setOutstandingsSearchQuery(e.target.value);
                            setRecPage(1);
                          }}
                          placeholder="Search Voucher / Ref..."
                          className="w-28 sm:w-36 bg-white border border-slate-300 rounded pl-7 pr-2 py-1 text-[10.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2b5876]"
                        />
                      </div>

                      {/* From & To Calendar Filters */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[10px]">
                        <span className="text-slate-500 font-bold uppercase text-[9px]">From:</span>
                        <input
                          type="date"
                          value={reportFromDate}
                          onChange={(e) => { setReportFromDate(e.target.value); setRecPage(1); }}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none cursor-pointer"
                        />
                        <span className="text-slate-500 font-bold uppercase text-[9px] ml-1">To:</span>
                        <input
                          type="date"
                          value={reportToDate}
                          onChange={(e) => { setReportToDate(e.target.value); setRecPage(1); }}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none cursor-pointer"
                        />
                        {(reportFromDate || reportToDate) && (
                          <button
                            type="button"
                            onClick={() => { setReportFromDate(''); setReportToDate(''); setRecPage(1); }}
                            className="text-rose-600 hover:text-rose-800 font-bold px-1 text-xs"
                            title="Clear date filter"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Filter Customer Dropdown List */}
                      <select
                        value={customerFilterId}
                        onChange={(e) => {
                          setCustomerFilterId(e.target.value);
                          setRecPage(1);
                        }}
                        className="bg-white border border-slate-300 rounded text-[10.5px] text-slate-800 px-2 py-1 font-semibold focus:outline-none cursor-pointer max-w-[170px] truncate"
                      >
                        <option value="ALL">All Customers</option>
                        {customers.filter(c => !c.id?.startsWith('supp-') && !c.companyName.toUpperCase().includes('SUPPLIER')).map(c => (
                          <option key={c.id} value={c.id}>{c.companyName}</option>
                        ))}
                      </select>

                      {/* Filter Seller / Rep */}
                      <select
                        value={reportSellerCode}
                        onChange={(e) => {
                          setReportSellerCode(e.target.value);
                          setRecPage(1);
                        }}
                        className="bg-white border border-slate-300 rounded text-[10.5px] text-slate-800 px-1.5 py-1 font-semibold focus:outline-none cursor-pointer max-w-[110px] truncate"
                      >
                        <option value="ALL">All Sellers</option>
                        {sellers.map(s => (
                          <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                        ))}
                      </select>

                      <div className="h-4 w-px bg-slate-300 mx-0.5 hidden sm:block" />

                      {/* PRINT PDF BUTTONS (ICON ONLY) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (customerFilterId === 'ALL') {
                            printAllCustomersMasterSoaReport('pending', false);
                          } else {
                            printCustomerSoaById(customerFilterId, true);
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-amber-600 flex items-center justify-center gap-1"
                        title="Preview & Print Pending Balance Statement PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-950" />
                        <span className="text-[9.5px] font-black uppercase">Pending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (customerFilterId === 'ALL') {
                            printAllCustomersMasterSoaReport('full', false);
                          } else {
                            printCustomerSoaById(customerFilterId, false);
                          }
                        }}
                        className="bg-[#f37021] hover:bg-[#d65a12] text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-orange-600 flex items-center justify-center gap-1"
                        title="Preview & Print Full Statement PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span className="text-[9.5px] font-black uppercase">Full</span>
                      </button>

                      {/* Excel Export Buttons */}
                      <button
                        type="button"
                        onClick={() => exportReceivablesToExcel('pending')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-emerald-800 flex items-center justify-center gap-1"
                        title="Export Pending Receivables to Excel CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span className="text-[9.5px] font-black uppercase">XLS Pending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportReceivablesToExcel('full')}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-emerald-900 flex items-center justify-center gap-1"
                        title="Export Full Receivables Statement to Excel CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span className="text-[9.5px] font-black uppercase">XLS Full</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOutstandingsSearchQuery('');
                          setCustomerFilterId('ALL');
                          setReportFromDate('');
                          setReportToDate('');
                          setRecPage(1);
                        }}
                        title="Refresh Data"
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer border border-slate-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean Flat List Accounts Receivable Table - Scrollable with Compact Height */}
                  {(() => {
                    const allItems = receivablesViewMode === 'pending' ? getPendingReceivablesInvoices() : getAllReceivablesInvoices();

                    return (
                      <div className="flex flex-col gap-2">
                        {customerFilterId === 'ALL' && (
                          <div className="py-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">ALL CUSTOMERS SELECTED</span>
                              <span className="text-slate-600 font-medium">Total Pending Outstanding across all accounts:</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="font-mono font-bold text-slate-900 text-[12px]">
                                AED {allItems.reduce((sum, item) => sum + Number(item.pendingAmount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <button
                                type="button"
                                onClick={() => printAllCustomersMasterSoaReport('pending', false)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs border border-amber-600"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-950" />
                                <span>PRINT ALL CUSTOMERS PDF</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto relative border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse font-sans text-[10.5px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[10px] uppercase tracking-wider sticky top-0 z-10 shadow-3xs">
                              <th className="py-1.5 px-2 text-center w-8 border-r border-slate-200">#</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">Date</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">Invoice No</th>
                              <th className="py-1.5 px-2 border-r border-slate-200">Customer Name</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">LPO / PO No</th>
                              <th className="py-1.5 px-2 text-right border-r border-slate-200">Pending Amount</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">Currency</th>
                              <th className="py-1.5 px-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white font-sans">
                            {allItems.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-4 text-center text-slate-500 italic bg-slate-50/50">
                                  No accounts receivable records found matching your filters.
                                </td>
                              </tr>
                            ) : (
                              allItems.map((item, idx) => {
                                const rowNum = idx + 1;
                                const isEven = idx % 2 === 0;

                                return (
                                  <tr
                                    key={item.customer.id + '-' + item.tx.id + '-' + idx}
                                    className={`${isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100/70 transition-colors border-b border-slate-200 text-slate-800`}
                                  >
                                    <td className="py-1 px-2 text-center font-mono text-slate-500 text-[10px] border-r border-slate-200">
                                      {rowNum}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-700 text-[10px] border-r border-slate-200">
                                      {item.tx.date || '—'}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono font-bold text-slate-900 text-[10.5px] border-r border-slate-200">
                                      {item.tx.invoiceRef || '—'}
                                    </td>
                                    <td 
                                      onClick={() => setSelectedCustomerIdForSoa(item.customer.id)}
                                      title="Click to view Customer Ledger"
                                      className="py-1 px-2 font-bold text-[#0e2a47] hover:underline cursor-pointer text-[10.5px] border-r border-slate-200"
                                    >
                                      {item.customer.companyName}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-600 text-[10px] border-r border-slate-200">
                                      {item.tx.lpoRef || item.tx.woRef || '—'}
                                    </td>
                                    <td className="py-1 px-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200 text-[11px]">
                                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.pendingAmount)}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-600 text-[10px] border-r border-slate-200">
                                      AED
                                    </td>
                                    <td className="py-1 px-2 text-center flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handlePreviewTaxInvoice(item.customer, item.tx)}
                                        title="View Original Tax Invoice Print Preview"
                                        className="p-1 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded inline-flex items-center justify-center transition-all cursor-pointer shadow-3xs active:scale-95"
                                      >
                                        <FileText className="w-4 h-4 text-slate-200" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>

                          {/* Grand Totals Footer */}
                          {allItems.length > 0 && (
                            <tfoot className="sticky bottom-0 z-10">
                              <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300 text-[10.5px] font-mono">
                                <td colSpan={5} className="py-1.5 px-2 text-right uppercase tracking-wider font-sans font-bold text-slate-700">
                                  Total Accounts Receivable ({allItems.length} Invoices):
                                </td>
                                <td className="py-1.5 px-2 text-right font-bold text-slate-900 text-[11.5px] border-r border-slate-200">
                                  AED {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                                    allItems.reduce((acc, i) => acc + i.pendingAmount, 0)
                                  )}
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  );
                  })()}
                </div>
              ) : (
                /* ACCOUNTS PAYABLE SUPPLIER COMMITMENTS (REDESIGNED MATCHING RECEIVABLES) */
                <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
                  {/* Clean Corporate Toolbar matching Receivables */}
                  <div className="bg-slate-100 border-b border-slate-300 text-slate-900 p-2 px-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-lg border border-slate-300 shadow-3xs w-full">
                      {/* Search Input Box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={outstandingsSearchQuery}
                          onChange={(e) => setOutstandingsSearchQuery(e.target.value)}
                          placeholder="Search Supplier / Invoice Ref..."
                          className="w-28 sm:w-36 bg-white border border-slate-300 rounded pl-7 pr-2 py-1 text-[10.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2b5876]"
                        />
                      </div>

                      {/* From & To Calendar Filters */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[10px]">
                        <span className="text-slate-500 font-bold uppercase text-[9px]">From:</span>
                        <input
                          type="date"
                          value={payablesFromDate}
                          onChange={(e) => setPayablesFromDate(e.target.value)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none cursor-pointer"
                        />
                        <span className="text-slate-500 font-bold uppercase text-[9px] ml-1">To:</span>
                        <input
                          type="date"
                          value={payablesToDate}
                          onChange={(e) => setPayablesToDate(e.target.value)}
                          className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[10px] text-slate-800 focus:outline-none cursor-pointer"
                        />
                      </div>

                      {/* Supplier Selector Dropdown */}
                      <select
                        value={supplierFilterId}
                        onChange={(e) => setSupplierFilterId(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 text-[10.5px] rounded px-2 py-1 focus:outline-none max-w-[150px] font-sans"
                      >
                        <option value="ALL">All Suppliers</option>
                        {customers
                          .filter(c => c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER'))
                          .map(s => (
                            <option key={s.id} value={s.id}>{s.companyName}</option>
                          ))}
                      </select>

                      {/* Print Buttons: Pending & Full */}
                      <button
                        type="button"
                        onClick={() => handlePrintPayablesPDF('pending')}
                        className="bg-[#2b5876] hover:bg-[#1e3c52] text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-slate-700 flex items-center justify-center gap-1 ml-auto"
                        title="Preview & Print Pending Payables Statement PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span className="text-[9.5px] font-black uppercase">Pending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintPayablesPDF('full')}
                        className="bg-[#f37021] hover:bg-[#d65a12] text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-orange-600 flex items-center justify-center gap-1"
                        title="Preview & Print Full Payables Statement PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span className="text-[9.5px] font-black uppercase">Full</span>
                      </button>

                      {/* Excel Export Buttons */}
                      <button
                        type="button"
                        onClick={() => exportPayablesToExcel('pending')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-emerald-800 flex items-center justify-center gap-1"
                        title="Export Pending Payables to Excel CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span className="text-[9.5px] font-black uppercase">XLS Pending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportPayablesToExcel('full')}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white p-1 px-1.5 rounded transition-all shadow-3xs cursor-pointer active:scale-95 border border-emerald-900 flex items-center justify-center gap-1"
                        title="Export Full Payables Statement to Excel CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span className="text-[9.5px] font-black uppercase">XLS Full</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOutstandingsSearchQuery('');
                          setSupplierFilterId('ALL');
                          setPayablesFromDate('');
                          setPayablesToDate('');
                        }}
                        title="Refresh Data"
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer border border-slate-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean Flat List Accounts Payable Table matching Receivables */}
                  {(() => {
                    const payItems = getPendingPayablesInvoices();

                    return (
                      <div className="flex flex-col gap-2 p-2">
                        {supplierFilterId === 'ALL' && (
                          <div className="py-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#2b5876] text-white px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider">ALL SUPPLIERS SELECTED</span>
                              <span className="text-slate-600 font-medium">Total Pending Payables across all accounts:</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="font-mono font-bold text-slate-900 text-[12px]">
                                AED {payItems.reduce((sum, item) => sum + Number(item.pendingAmount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <button
                                type="button"
                                onClick={() => printAllCustomersMasterSoaReport('pending', true)}
                                className="bg-[#2b5876] hover:bg-[#1e3c52] text-white font-black px-2.5 py-1 rounded text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs border border-slate-700"
                              >
                                <Printer className="w-3.5 h-3.5 text-white" />
                                <span>PRINT ALL SUPPLIERS PDF</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto relative border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse font-sans text-[10.5px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[10px] uppercase tracking-wider sticky top-0 z-10 shadow-3xs">
                              <th className="py-1.5 px-2 text-center w-8 border-r border-slate-200">#</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">Date</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">Supplier Tax Invoice Ref</th>
                              <th className="py-1.5 px-2 border-r border-slate-200">Supplier Name</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">LPO / Ref No</th>
                              <th className="py-1.5 px-2 text-right border-r border-slate-200">Pending Amount</th>
                              <th className="py-1.5 px-2 text-center border-r border-slate-200">Currency</th>
                              <th className="py-1.5 px-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white font-sans">
                            {payItems.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-4 text-center text-slate-500 italic bg-slate-50/50">
                                  No accounts payable supplier invoice records found matching your filters.
                                </td>
                              </tr>
                            ) : (
                              payItems.map((item, idx) => {
                                const rowNum = idx + 1;
                                const isEven = idx % 2 === 0;

                                return (
                                  <tr
                                    key={item.supplier.id + '-' + item.tx.id + '-' + idx}
                                    className={`${isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100/70 transition-colors border-b border-slate-200 text-slate-800`}
                                  >
                                    <td className="py-1 px-2 text-center font-mono text-slate-500 text-[10px] border-r border-slate-200">
                                      {rowNum}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-700 text-[10px] border-r border-slate-200">
                                      {item.tx.date || '—'}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono font-bold text-slate-900 text-[10.5px] border-r border-slate-200">
                                      {item.tx.invoiceRef || '—'}
                                    </td>
                                    <td 
                                      onClick={() => setSelectedCustomerIdForSoa(item.supplier.id)}
                                      title="Click to view Supplier Ledger"
                                      className="py-1 px-2 font-bold text-[#0e2a47] hover:underline cursor-pointer text-[10.5px] border-r border-slate-200"
                                    >
                                      {item.supplier.companyName}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-600 text-[10px] border-r border-slate-200">
                                      {item.tx.lpoRef || '—'}
                                    </td>
                                    <td className="py-1 px-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200 text-[11px]">
                                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.pendingAmount)}
                                    </td>
                                    <td className="py-1 px-2 text-center font-mono text-slate-600 text-[10px] border-r border-slate-200">
                                      AED
                                    </td>
                                    <td className="py-1 px-2 text-center flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handlePreviewTaxInvoice(item.supplier, item.tx)}
                                        title="View Supplier Tax Invoice Print Preview"
                                        className="p-1 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded inline-flex items-center justify-center transition-all cursor-pointer shadow-3xs active:scale-95"
                                      >
                                        <FileText className="w-4 h-4 text-slate-200" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>

                          {/* Grand Totals Footer */}
                          {payItems.length > 0 && (
                            <tfoot className="sticky bottom-0 z-10">
                              <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300 text-[10.5px] font-mono">
                                <td colSpan={5} className="py-1.5 px-2 text-right uppercase tracking-wider font-sans font-bold text-slate-700">
                                  Total Accounts Payable ({payItems.length} Invoices):
                                </td>
                                <td className="py-1.5 px-2 text-right font-bold text-indigo-950 text-[11.5px] border-r border-slate-200">
                                  AED {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                                    payItems.reduce((acc, i) => acc + i.pendingAmount, 0)
                                  )}
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  );
                  })()}
                </div>
              )}
            </div>
          ) : (
        /* SCREEN B: CUSTOMER SOA DETAILED DOCUMENT VIEW & LEDGER COMPILING SYSTEM (Screenshot 3 style) */
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 border border-slate-200 rounded-xl no-print">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setSelectedCustomerIdForSoa(null)}
                className="group hover:text-blue-600 transition-colors text-xs font-bold text-slate-600 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                BACK TO CUSTOMER LIST
              </button>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-[#f37021] text-[9px] uppercase font-bold">Ledger Filters:</span>
                
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={showUnpaidOnly}
                    onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                    className="rounded text-[#f37021] focus:ring-[#f37021] w-3.5 h-3.5 cursor-pointer accent-[#f37021]"
                  />
                  Unpaid Only
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 select-none" title="Bypasses year & month filters so all outstanding/pending bills are always visible">
                  <input
                    type="checkbox"
                    checked={ignoreDateForUnpaid}
                    onChange={(e) => setIgnoreDateForUnpaid(e.target.checked)}
                    className="rounded text-[#f37021] focus:ring-[#f37021] w-3.5 h-3.5 cursor-pointer accent-[#f37021]"
                  />
                  Bypass Date for Outstanding Bills
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 select-none" title="Toggles whether delivery dates are displayed or blank in both screen and printable reports">
                  <input
                    type="checkbox"
                    checked={showDeliveryDateInLedger}
                    onChange={(e) => setShowDeliveryDateInLedger(e.target.checked)}
                    className="rounded text-[#f37021] focus:ring-[#f37021] w-3.5 h-3.5 cursor-pointer accent-[#f37021]"
                  />
                  Show Delivery Date
                </label>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (activeCustomer) {
                    handleImportExistingCustomer(activeCustomer.id);
                    setActiveMainTab('create_new_statement');
                    alert(`Successfully imported the live ledger for "${activeCustomer.companyName}" into the custom WYSIWYG statement sheet editor!`);
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                title="Load this active ledger into the custom WYSIWYG statement sheet editor"
              >
                <Edit2 className="w-4 h-4 text-white" /> CUSTOM COMPILER SHEET
              </button>

              <button
                onClick={() => setSoaPdfPreview(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                title="Open real-time high-fidelity A4 Statement of Account PDF preview"
              >
                <FileText className="w-4 h-4 text-white" /> VIEW PDF PREVIEW
              </button>

              <button
                onClick={() => setStatementPrintModal({ show: true, isCustomCompiled: false })}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
              >
                <Printer className="w-4 h-4" /> PRINT SOA & DOWNLOAD PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* COLUMN 1: INTERACTIVE DOCUMENT PREVIEW (HIGH-FIDELITY SCHEME MATCHING SCREENSHOT 3) */}
            <div className="xl:col-span-2 space-y-4">
              {/* PRINT STYLE OUTER BOARD */}
              <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm print-doc overflow-auto">
                {/* Statement header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5 uppercase">
                  <div className="space-y-1">
                    <h1 className="text-sm font-bold text-[#1e3a8a] leading-none tracking-tight">
                      {activeCompany.name}
                    </h1>
                    {isMarineFastenersCompany(activeCompany) ? (
                      <span className="text-[10px] text-slate-400 font-bold block">(SOLE PROPRIETORSHIP)</span>
                    ) : (
                      activeCompany.tagline && <span className="text-[10px] text-slate-400 font-bold block">{activeCompany.tagline}</span>
                    )}
                    <div className="text-[8.5px] text-slate-500 font-medium normal-case mt-3 leading-relaxed space-y-0.5">
                      <div><strong>Add:</strong> {activeCompany.address}</div>
                      <div><strong>Telephone:</strong> {activeCompany.phone || '—'} &nbsp;|&nbsp; <strong>Email:</strong> {activeCompany.email || '—'}</div>
                      <div><strong>Website:</strong> {activeCompany.website || '—'}</div>
                      <div><strong>TRN:</strong> {activeCompany.trn || '—'}</div>
                    </div>
                  </div>
                  
                  <div className="text-right text-[9.5px] flex flex-col items-end gap-1 select-none">
                    <h2 className="text-sm font-bold text-slate-900 mb-2 font-mono tracking-wider text-right w-full">
                      {isCurrentSupplier ? 'PAYABLES OUTSTANDING STATEMENT' : 'STATEMENT OF ACCOUNT'}
                    </h2>
                    
                    {/* Interactive Statement Date inline with custom styling */}
                    <div className="flex items-center justify-end gap-1.5 no-print mb-0.5">
                      <strong className="text-slate-650 hover:text-slate-800">Statement Date:</strong>
                      <input 
                        type="date" 
                        value={stmtDate} 
                        onChange={(e) => setStmtDate(e.target.value)}
                        className="border border-slate-200 hover:border-slate-350 bg-slate-50 px-1.5 py-0.5 font-bold font-mono rounded text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer"
                      />
                    </div>
                    {/* Print-only beautifully formatted date */}
                    <div className="hidden print:block font-bold">
                      <strong>Statement Date :</strong> {new Date(stmtDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>

                    <div><strong>{isCurrentSupplier ? 'Supplier Code :' : 'Customer Code :'}</strong> {activeCustomer ? activeCustomer.id.replace('cust-ocr-', 'MFI-') : '—'}</div>
                    {!isCurrentSupplier && <div><strong>Seller :</strong> {activeSellerCode}</div>}
                    <div><strong>Currency :</strong> AED</div>
                  </div>
                </div>

                {/* Sub headers billing and dynamic totals box */}
                {activeCustomer && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-4">
                    <div className="md:col-span-7 border border-slate-200 p-3 rounded-lg bg-white">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">
                        Statement to:
                      </div>
                      <div className="text-sm font-bold text-[#1e3a8a]">{activeCustomer.companyName}</div>
                      
                      <div className="text-[9.5px] mt-1 space-y-0.5 leading-relaxed text-slate-500">
                        <div><strong>Address:</strong> {activeCustomer.address}</div>
                        <div><strong>Phone:</strong> {activeCustomer.phone} | <strong>Fax:</strong> —</div>
                        <div><strong>P.O. Box:</strong> {activeCustomer.poBox || '—'} &nbsp;|&nbsp; <strong>TRN:</strong> {activeCustomer.trn || '—'}</div>
                      </div>
                    </div>

                    <div className="md:col-span-5 border border-[#1e3a8a] rounded-lg overflow-hidden bg-slate-50/55 flex flex-col justify-between">
                      <div className="bg-[#1e3a8a] text-white text-center text-[10px] font-bold p-1.5 uppercase">
                        {isCurrentSupplier ? 'Payables Outstanding' : 'Statement of Account'}
                      </div>
                      <div className="p-3 text-[10px] space-y-2 font-mono">
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                          <span className="font-bold text-slate-500">Total Amount</span>
                          <span className="font-semibold text-slate-900">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.totalSales)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1 text-emerald-600">
                          <span className="font-bold">Amount Paid</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.totalPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between text-rose-600 pt-0.5 text-xs font-bold">
                          <span>Amount Due</span>
                          <span>
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.pending)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Period string matching PDF */}
                {receivablesViewMode !== 'pending' && (
                  <div className="text-right text-[10px] font-bold text-slate-600 mb-2 font-mono">
                    Period: 01/01/{filterYear === 'ALL' ? '2026' : filterYear} - 31/12/{filterYear === 'ALL' ? '2026' : filterYear}
                  </div>
                )}

                {/* Statement interactive list table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 text-[8px] uppercase font-semibold tracking-wider font-mono border border-slate-300">
                        <th className="p-2 border border-slate-200">Date</th>
                        <th className="p-2 border border-slate-200">Payment Terms</th>
                        <th className="p-2 border border-slate-200">Overdue Days</th>
                        <th className="p-2 border border-slate-200">LPO Ref</th>
                        <th className="p-2 border border-slate-200">Invoice Ref</th>
                        {!isCurrentSupplier && <th className="p-2 border border-slate-200">W/O Ref</th>}
                        {showDeliveryDateInLedger && <th className="p-2 border border-slate-200">Delivery Dates</th>}
                        <th className="p-2 border border-slate-200 text-right">Amount</th>
                        <th className="p-2 border border-slate-200">Date Paid</th>
                        <th className="p-2 border border-slate-200">Receipt No</th>
                        <th className="p-2 border border-slate-200">Payment Mode</th>
                        <th className="p-2 border border-slate-200 text-right">Amount Paid</th>
                        <th className="p-2 border border-slate-200 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250">
                      {activeCustomerTxs.length > 0 ? (() => {
                        let runningBalance = 0;
                        return activeCustomerTxs.map((t) => {
                          runningBalance += Number(t.amount || 0);
                          runningBalance -= Number(t.amountPaid || 0);
                          return (
                            <tr key={t.id} className="text-[9.5px] font-mono font-medium hover:bg-slate-50 transition-colors">
                              <td className="p-1 text-slate-700 whitespace-nowrap">{t.date}</td>
                              <td className="p-1 text-slate-500">{t.paymentTerms}</td>
                              <td className="p-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                                  t.overdueDays > getTermsLimit(t.paymentTerms) 
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {t.overdueDays}
                                </span>
                              </td>
                              <td className="p-1 text-slate-600">{t.lpoRef}</td>
                              <td className="p-1 font-semibold text-[#111827]">
                                <div className="flex items-center gap-1.5">
                                  <span>{t.invoiceRef}</span>
                                  {t.invoiceRef && t.invoiceRef !== '—' && (
                                    <button
                                      type="button"
                                      onClick={() => handlePreviewTaxInvoice(activeCustomer, t)}
                                      className="p-0.5 hover:bg-[#0e2a47]/10 text-[#0e2a47] rounded transition-all cursor-pointer shadow-3xs"
                                      title="View & Print Original Tax Invoice"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-blue-700" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              {!isCurrentSupplier && <td className="p-1 text-slate-500">{t.woRef}</td>}
                              {showDeliveryDateInLedger && <td className="p-1 text-slate-600">{t.deliveryDates}</td>}
                              <td className="p-1 text-right font-bold text-slate-900">
                                {new Intl.NumberFormat('en-US').format(t.amount)}
                              </td>
                              <td className="p-1 text-slate-600">{t.datePaid}</td>
                              <td className="p-1 text-slate-600 font-mono">
                                <div className="flex items-center justify-center gap-1">
                                  <span>{t.receiptNo}</span>
                                  {t.isLinkedReceipt && (
                                    <button
                                      type="button"
                                      onClick={() => handlePrintReceipt(t.receiptRawData)}
                                      className="p-0.5 hover:bg-orange-100 text-[#f37021] rounded transition-all cursor-pointer shadow-3xs"
                                      title="View / Print Receipt Voucher PDF"
                                    >
                                      <Receipt className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-1 text-slate-500">{t.paymentMode}</td>
                              <td className="p-1 text-right font-bold text-emerald-700">
                                {new Intl.NumberFormat('en-US').format(t.amountPaid)}
                              </td>
                              <td className="p-1 text-right font-semibold text-[#1e293b] bg-slate-50/80">
                                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(runningBalance)}
                              </td>
                            </tr>
                          );
                        });
                      })() : (
                        <tr>
                          <td colSpan={isCurrentSupplier ? (showDeliveryDateInLedger ? 12 : 11) : (showDeliveryDateInLedger ? 13 : 12)} className="p-6 text-center text-slate-400 italic">
                            No ledger records found for this period. Use form on the right to compile!
                          </td>
                        </tr>
                      )}
                      
                      {/* Outstandings Summary footer row */}
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-[10px]">
                        <td colSpan={(isCurrentSupplier ? 5 : 6) + (showDeliveryDateInLedger ? 1 : 0)} className="p-1.5 text-right uppercase tracking-wider font-semibold">
                          Total Outstandings:
                        </td>
                        <td className="p-1.5 text-right font-bold text-slate-900">
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.totalSales)}
                        </td>
                        <td colSpan={3} className="p-1"></td>
                        <td className="p-1.5 text-right font-bold text-emerald-700">
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.totalPaid)}
                        </td>
                        <td className="p-1.5 text-right font-bold text-rose-700 underline underline-offset-2 decoration-double">
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.pending)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Aging analysis block exactly as visual format 3 */}
                <div className="mt-6 space-y-2">
                  <div className="grid grid-cols-7 border border-slate-300 font-mono text-center rounded-lg overflow-hidden">
                    <div className="bg-slate-50 border-r border-b border-slate-300 p-1 text-[8px] font-bold text-slate-500 uppercase">
                      Current
                    </div>
                    <div className="bg-slate-50 border-r border-b border-slate-300 p-1 text-[8px] font-bold text-slate-500 uppercase">
                      1-30 Days
                    </div>
                    <div className="bg-slate-50 border-r border-b border-slate-300 p-1 text-[8px] font-bold text-slate-500 uppercase">
                      31-60 Days
                    </div>
                    <div className="bg-slate-50 border-r border-b border-slate-300 p-1 text-[8px] font-bold text-slate-500 uppercase">
                      61-90 Days
                    </div>
                    <div className="bg-slate-50 border-r border-b border-slate-300 p-1 text-[8px] font-bold text-slate-500 uppercase">
                      91-120 Days
                    </div>
                    <div className="bg-slate-50 border-r border-b border-slate-300 p-1 text-[8px] font-bold text-slate-500 uppercase">
                      Over 120 Days
                    </div>
                    <div className="bg-slate-100 border-b border-slate-300 p-1 text-[8.5px] font-semibold text-slate-800 uppercase">
                      Total Balance
                    </div>

                    <div className="p-2 border-r border-slate-200 text-xs text-slate-800 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerAging.current)}
                    </div>
                    <div className="p-2 border-r border-slate-200 text-xs text-slate-800 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerAging.days1to30)}
                    </div>
                    <div className="p-2 border-r border-slate-200 text-xs text-slate-800 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerAging.days31to60)}
                    </div>
                    <div className="p-2 border-r border-slate-200 text-xs text-slate-800 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerAging.days61to90)}
                    </div>
                    <div className="p-2 border-r border-slate-200 text-xs text-slate-800 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerAging.days91to120)}
                    </div>
                    <div className="p-2 border-r border-slate-200 text-xs text-slate-800 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerAging.over120)}
                    </div>
                    <div className="p-2 text-xs text-rose-700 bg-slate-50/80 font-bold">
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                        activeCustomerAging.current + activeCustomerAging.days1to30 + activeCustomerAging.days31to60 + activeCustomerAging.days61to90 + activeCustomerAging.days91to120 + activeCustomerAging.over120
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50/40 border border-blue-200/50 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-[#1e3a8a] font-mono text-[9.5px]">Balance Amount in Words:</span>
                    <strong className="font-mono text-blue-900 uppercase text-right">{convertAmountToWordsAED(activeCustomerTotals.pending)}</strong>
                  </div>
                </div>

                {/* Bank account details footer exactly as PDF */}
                {!isCurrentSupplier && (
                  <div className="mt-8 pt-5 border-t border-dashed border-slate-300 font-sans text-slate-500">
                    <div className="text-[9.5px] font-bold text-slate-600 mb-2.5">
                      Please make any payment due, either by electronic transfer to our bank account or by cheque payable to:
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] font-medium leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <div className="space-y-1">
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Beneficiary</span> <strong>{activeCompany.name}</strong></div>
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Bank Name</span> RAK BANK</div>
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Account Number</span> <strong className="font-mono text-slate-900">0242715908001</strong></div>
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Branch</span> KING FAISAL STREET, SHARJAH</div>
                      </div>
                      <div className="space-y-1">
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Country</span> UNITED ARAB EMIRATES</div>
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">IBAN Code</span> <strong className="font-mono text-slate-900 tracking-wide text-xs">AE 940400000242715908001</strong></div>
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Swift Code</span> <strong className="font-mono text-slate-800">NRAKAEAK</strong></div>
                        <div><span className="font-bold text-slate-400 font-mono uppercase tracking-wider text-[8px] block">Address</span> RAK BANK, P.O.BOX: 1531, DUBAI, UAE.</div>
                      </div>
                    </div>
                    
                    <div className="text-center text-[8px] text-slate-400 font-semibold italic mt-6">
                      This is computer generated invoice, no signature required
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: LEDGER ROW MANAGER & AGING OVERRIDES (no-print PANEL) */}
            <div className="space-y-6 no-print">
              
              {/* Box A: Add New Transaction Form Row */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-150 pb-2">
                  <Plus className="w-4 h-4 text-[#f37021]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Add Transaction Row
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Date</label>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Payment Terms</label>
                    <input
                      type="text"
                      value={txPaymentTerms}
                      onChange={(e) => setTxPaymentTerms(e.target.value)}
                      placeholder="60 Days"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Overdue Days</label>
                    <input
                      type="number"
                      value={txOverdueDays}
                      onChange={(e) => setTxOverdueDays(e.target.value)}
                      placeholder="0"
                      className={`w-full p-1.5 border rounded font-mono font-bold transition-all duration-200 outline-none focus:ring-2 ${
                        (parseInt(txOverdueDays, 10) || 0) > 0 
                          ? 'bg-rose-50 border-rose-350 text-rose-700 focus:ring-rose-300' 
                          : (parseInt(txOverdueDays, 10) || 0) < 0 
                            ? 'bg-emerald-50 border-emerald-350 text-emerald-700 focus:ring-emerald-300' 
                            : 'bg-slate-50 border-slate-300 text-slate-600 focus:ring-slate-300'
                      }`}
                    />
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(parseInt(txOverdueDays, 10) || 0) > 0 ? (
                        <span className="text-[8.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 uppercase tracking-tight font-sans">
                          ⚠ Late by {txOverdueDays} days
                        </span>
                      ) : (parseInt(txOverdueDays, 10) || 0) < 0 ? (
                        <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-tight font-sans">
                          ✔ Active (Remaining: {Math.abs(parseInt(txOverdueDays, 10))} days)
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tight font-sans">
                          Due Today
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">LPO Ref</label>
                    <input
                      type="text"
                      value={txLpo}
                      onChange={(e) => setTxLpo(e.target.value)}
                      placeholder="LPO Ref"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Invoice Ref *</label>
                    <input
                      type="text"
                      value={txInvoice}
                      onChange={(e) => setTxInvoice(e.target.value)}
                      placeholder="INV-9580"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-bold text-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">W/O Ref</label>
                    <input
                      type="text"
                      value={txWo}
                      onChange={(e) => setTxWo(e.target.value)}
                      placeholder="WO-115"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Delivery Date</label>
                    <input
                      type="text"
                      value={txDelivery}
                      onChange={(e) => setTxDelivery(e.target.value)}
                      placeholder="Date or —"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Invoice Amount (AED) *</label>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      placeholder="3500.00"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-slate-800 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Date Paid</label>
                    <input
                      type="text"
                      value={txDatePaid}
                      onChange={(e) => setTxDatePaid(e.target.value)}
                      placeholder="—"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Receipt No</label>
                    <input
                      type="text"
                      value={txReceiptNo}
                      onChange={(e) => setTxReceiptNo(e.target.value)}
                      placeholder="—"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Payment Mode</label>
                    <select
                      value={txMode}
                      onChange={(e) => setTxMode(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    >
                      <option value="—">—</option>
                      <option value="BANK WIRE">BANK WIRE</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="CASH">CASH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-0.5">Amount Paid (AED)</label>
                    <input
                      type="number"
                      value={txAmtPaid}
                      onChange={(e) => setTxAmtPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-emerald-800 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddTransaction(activeCustomer.id)}
                  className="w-full bg-blue-650 hover:bg-blue-700 bg-blue-600 text-white font-semibold p-2 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-1 shadow-3xs"
                >
                  <Plus className="w-4 h-4" /> APPEND NEW ENTRY
                </button>
              </div>

              {/* Box B: Dynamic Tweak Aging Numbers Manual Overrides */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Edit2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Override Aging Buckets (AED)
                    </h3>
                  </div>
                  {activeCustomer && agingOverrides[activeCustomer.id] && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...agingOverrides };
                        delete updated[activeCustomer.id];
                        setAgingOverrides(updated);
                      }}
                      className="text-[9.5px] text-blue-650 hover:text-blue-800 font-semibold uppercase bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-all font-mono"
                      title="Clear static values and recalculate dynamically from ledger transactions"
                    >
                      Reset to Auto
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                  Values here are printed in the "AMOUNTS IN AED" aging grid block. Tweak them to precisely match audited ledgers.
                </p>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono font-bold">
                  <div>
                    <label className="block text-[8.5px] font-semibold text-slate-500 uppercase">Current</label>
                    <input
                      type="number"
                      value={activeCustomerAging.current}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAgingOverrides({
                          ...agingOverrides,
                          [activeCustomer.id]: { ...activeCustomerAging, current: val }
                        });
                      }}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-semibold text-slate-500 uppercase">1-30 Days</label>
                    <input
                      type="number"
                      value={activeCustomerAging.days1to30}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAgingOverrides({
                          ...agingOverrides,
                          [activeCustomer.id]: { ...activeCustomerAging, days1to30: val }
                        });
                      }}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-semibold text-slate-500 uppercase">31-60 Days</label>
                    <input
                      type="number"
                      value={activeCustomerAging.days31to60}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAgingOverrides({
                          ...agingOverrides,
                          [activeCustomer.id]: { ...activeCustomerAging, days31to60: val }
                        });
                      }}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-semibold text-slate-500 uppercase">61-90 Days</label>
                    <input
                      type="number"
                      value={activeCustomerAging.days61to90 ?? 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAgingOverrides({
                          ...agingOverrides,
                          [activeCustomer.id]: { ...activeCustomerAging, days61to90: val }
                        });
                      }}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-semibold text-slate-500 uppercase">91-120 Days</label>
                    <input
                      type="number"
                      value={activeCustomerAging.days91to120}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAgingOverrides({
                          ...agingOverrides,
                          [activeCustomer.id]: { ...activeCustomerAging, days91to120: val }
                        });
                      }}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] font-semibold text-slate-500 uppercase">Over 120 Days</label>
                    <input
                      type="number"
                      value={activeCustomerAging.over120}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setAgingOverrides({
                          ...agingOverrides,
                          [activeCustomer.id]: { ...activeCustomerAging, over120: val }
                        });
                      }}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Box C: Quick Delete Manager Row entries */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-150 pb-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Delete / Edit Rows
                  </h3>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activeCustomerTxs.map(t => (
                    <div key={t.id} className="flex justify-between items-center text-[10.5px] font-mono p-1 bg-slate-50 rounded border border-slate-200">
                      <div>
                        <strong>{t.invoiceRef}</strong>
                        <span className="text-slate-400 ml-1.5 text-[9.5px]">({t.date})</span>
                        <div className="text-[9px] text-slate-500">Amt: AED {t.amount} | Overdue: {t.overdueDays} Days</div>
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(activeCustomer.id, t.id)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                        title="Delete this row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {activeCustomerTxs.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-medium italic text-center py-4">No transactions configured</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 4. 'CREATE NEW STATEMENT' SHEET-ORIENTED WYSIWYG COMPILER VIEW */}
      {activeMainTab === 'create_new_statement' && (
        <div className="space-y-6 no-print">
          {/* TOP CONTROLS BAR */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 no-print">
            {/* Show Delivery Date Checkbox */}
            <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-3xs select-none cursor-pointer">
              <input
                type="checkbox"
                id="top-show-delivery-date"
                checked={stmtShowDeliveryDate}
                onChange={(e) => setStmtShowDeliveryDate(e.target.checked)}
                className="rounded text-[#f37021] focus:ring-[#f37021] w-3.5 h-3.5 cursor-pointer accent-[#f37021]"
              />
              <label htmlFor="top-show-delivery-date" className="text-[10.5px] font-semibold text-slate-700 cursor-pointer uppercase tracking-wider">
                Show Delivery Date
              </label>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleResetStmtForm}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10.5px] px-3.5 py-2 rounded-lg shadow-3xs transition-all transform active:scale-95 flex items-center gap-1 cursor-pointer"
              title="Reset paper document"
            >
              Reset Sheet
            </button>

            <button
              type="button"
              onClick={triggerCurrentFormPrint}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-2 rounded-lg shadow-3xs transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer text-xs"
              title="Direct Print PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Form</span>
            </button>

            {stmtType === 'receivables_outstanding' ? (
              <button
                type="button"
                onClick={() => {
                  handleCompileAndSaveStatement('receivables_outstanding');
                }}
                className="bg-[#f37021] hover:bg-orange-600 text-white font-bold px-3.5 py-2 rounded-lg shadow-3xs transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer text-xs"
                title="Save as Receivables Outstanding"
              >
                <Save className="w-4 h-4" />
                <span>Create Receivables Outstanding</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleCompileAndSaveStatement('payables_outstanding');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-lg shadow-3xs transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer text-xs"
                title="Save as Payables Outstanding"
              >
                <Save className="w-4 h-4" />
                <span>Create Payables Outstanding</span>
              </button>
            )}
          </div>

          {/* DYNAMIC SHEET FRAME */}
          <div className="p-1 pb-10 overflow-x-auto">
            <div 
              className="bg-white text-black p-10 md:p-12 shadow-2xl rounded border border-slate-300 transition-all font-sans relative min-w-[850px] max-w-[950px] mx-auto"
              style={{ minHeight: '11in' }}
            >
              {/* LETTERHEAD TOP HEADER BLOCK */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5 uppercase">
                <div className="space-y-1">
                  <h1 className="text-base font-semibold text-slate-950 leading-none tracking-tight">
                    {activeCompany.name}
                  </h1>
                  {isMarineFastenersCompany(activeCompany) ? (
                    <span className="text-[10px] text-slate-500 font-bold tracking-wide block">(SOLE PROPRIETORSHIP)</span>
                  ) : (
                    activeCompany.tagline && <span className="text-[10px] text-slate-500 font-bold tracking-wide block">{activeCompany.tagline}</span>
                  )}
                  <div className="text-[8.5px] text-slate-500 font-semibold normal-case mt-3 leading-relaxed space-y-0.5">
                    <div><strong>Add:</strong> {activeCompany.address}</div>
                    <div><strong>Telephone:</strong> {activeCompany.phone || '—'} &nbsp;|&nbsp; <strong>Email:</strong> {activeCompany.email || '—'}</div>
                    <div><strong>Website:</strong> {activeCompany.website || '—'}</div>
                    <div><strong>TRN:</strong> {activeCompany.trn || '—'}</div>
                  </div>
                </div>
                
                {/* Statement controls */}
                <div className="text-right text-[10.5px] space-y-1">
                  <h2 className="text-sm font-bold text-slate-950 mb-3 tracking-wider font-mono">
                    {stmtType === 'payables_outstanding' ? 'PAYABLES OUTSTANDING STATEMENT' : 'STATEMENT OF ACCOUNT'}
                  </h2>
                  
                  <div className="flex items-center justify-end gap-1.5">
                    <strong className="text-slate-600">Statement Date :</strong>
                    <input 
                      type="date" 
                      value={stmtDate} 
                      onChange={(e) => setStmtDate(e.target.value)}
                      className="border border-slate-200 hover:border-slate-300 focus:border-slate-400 bg-slate-50 px-1 py-0.5 font-bold rounded text-[10.5px] focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-1.5">
                    <strong className="text-slate-600">
                      {stmtType === 'payables_outstanding' ? 'Supplier Code :' : 'Customer Code :'}
                    </strong>
                    <input 
                      type="text" 
                      placeholder={stmtType === 'payables_outstanding' ? 'S-203' : 'C-203'}
                      value={stmtCustomerCode} 
                      onChange={(e) => setStmtCustomerCode(e.target.value)}
                      className="border border-slate-200 hover:border-slate-300 focus:border-slate-400 bg-slate-50 px-1 py-0.5 font-bold rounded text-[10.5px] focus:outline-none max-w-[110px]"
                    />
                  </div>

                  {stmtType !== 'payables_outstanding' && (
                    <div className="flex items-center justify-end gap-1.5 font-medium">
                      <strong className="text-slate-600">Seller :</strong>
                      <select
                        value={stmtSellerCode}
                        onChange={(e) => setStmtSellerCode(e.target.value)}
                        className="border border-slate-200 hover:border-slate-300 focus:border-slate-400 bg-slate-50 px-1 py-0.5 font-bold rounded text-[10.5px] focus:outline-none"
                      >
                        {sellers.map(s => (
                          <option key={s.code} value={s.code}>[{s.code}] - {s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1.5">
                    <strong className="text-slate-600">Currency :</strong>
                    <input 
                      type="text" 
                      value={stmtCurrency} 
                      onChange={(e) => setStmtCurrency(e.target.value)}
                      className="border border-slate-200 hover:border-slate-300 focus:border-slate-400 bg-slate-50 px-1 py-0.5 font-bold rounded text-[10.5px] focus:outline-none max-w-[70px]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1 no-print">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 select-none">
                      <input
                        type="checkbox"
                        checked={stmtShowDeliveryDate}
                        onChange={(e) => setStmtShowDeliveryDate(e.target.checked)}
                        className="rounded text-[#f37021] focus:ring-[#f37021] w-3.5 h-3.5 cursor-pointer accent-[#f37021]"
                      />
                      <strong className="text-slate-600">Show Delivery Date</strong>
                    </label>
                  </div>
                </div>
              </div>

              {/* HEAVY BLACK LINE */}
              <div className="border-t-2 border-slate-950 my-5"></div>

              {/* CLIENT BILLING / RECAP TABLES SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
                {/* Statement To: block */}
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 p-1 bg-amber-50 rounded-md border border-amber-200 no-print mb-3 max-w-[450px]">
                    <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider px-1">IMPORT:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleImportExistingCustomer(e.target.value);
                        }
                      }}
                      className="flex-1 text-[10px] bg-white border border-slate-200 rounded px-1.5 py-1 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {stmtType === 'payables_outstanding' 
                          ? '-- Load Registered Supplier Profile (S) --' 
                          : '-- Load Registered Customer Profile (C) --'}
                      </option>
                      {customers
                        .filter((c) => {
                          const isSupplier = c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER');
                          return stmtType === 'payables_outstanding' ? isSupplier : !isSupplier;
                        })
                        .map((c) => {
                          const isSupplier = c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER');
                          return (
                            <option key={c.id} value={c.id}>
                              [{isSupplier ? 'S' : 'C'}] {c.companyName}
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Statement To:</div>
                  
                  <div className="relative">
                    <input 
                      type="text"
                      value={stmtCompanyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStmtCompanyName(val);
                        setCompanySearchQuery(val);
                        setShowCompanySuggestions(true);
                      }}
                      onFocus={() => {
                        setCompanySearchQuery(stmtCompanyName);
                        setShowCompanySuggestions(true);
                      }}
                      onBlur={() => {
                        // Allow small delay for click handler to register on suggestions list before hiding
                        setTimeout(() => setShowCompanySuggestions(false), 250);
                      }}
                      placeholder="SUPER ENGINEERING INDUSTRY (Type company keyword...)"
                      className="w-full text-sm font-semibold uppercase placeholder-slate-350 border border-slate-200 focus:border-slate-400 bg-white hover:bg-slate-50 p-1.5 rounded focus:outline-none"
                    />

                    {/* Autocomplete floating suggestions box */}
                    {showCompanySuggestions && companySearchQuery.trim().length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border-2 border-slate-900 rounded-md shadow-lg divide-y divide-slate-100 no-print">
                        {customers
                          .filter(c => {
                            const query = companySearchQuery.toLowerCase();
                            const isSupplier = c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER');
                            const typeMatches = stmtType === 'payables_outstanding' ? isSupplier : !isSupplier;
                            return (
                              typeMatches &&
                              (c.companyName.toLowerCase().includes(query) ||
                               (c.id && c.id.toLowerCase().includes(query)) ||
                               (c.trn && c.trn.toLowerCase().includes(query)))
                            );
                          })
                          .map(c => {
                            const isSupplier = c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER');
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onMouseDown={() => {
                                  // Auto fill all fields!
                                  setStmtCompanyName(c.companyName);
                                  setStmtCustomerCode('');
                                  setStmtAddress(c.address || '');
                                  setStmtPhone(c.phone || '');
                                  setStmtPoBox(c.poBox || '');
                                  setStmtTrn(c.trn || '');
                                  setStmtSellerCode(customerSellerMap[c.id] || 'FSL');
                                  
                                  // Also load ledger if available
                                  const ledgers = getFilteredTransactions(c.id).map(t => ({
                                    ...t,
                                    overdueDays: calculateOverdueDaysFromTerms(t.deliveryDates, t.date, t.paymentTerms, stmtDate)
                                  }));
                                  setStmtTxs(ledgers);

                                  const currentOver = agingOverrides[c.id] || { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days91to120: 0, over120: 0 };
                                  setStmtAging({ ...currentOver });

                                  setShowCompanySuggestions(false);
                                  setCompanySearchQuery('');
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 cursor-pointer flex flex-col gap-0.5 transition-all text-slate-900"
                              >
                                <span className="font-bold uppercase flex items-center justify-between">
                                  <span>{c.companyName}</span>
                                  {isSupplier ? (
                                    <span className="text-[7.5px] bg-purple-50 text-purple-700 border border-purple-200 px-1 rounded-xs font-mono font-bold">S</span>
                                  ) : (
                                    <span className="text-[7.5px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded-xs font-mono font-bold">C</span>
                                  )}
                                </span>
                                <span className="text-[9.5px] text-slate-500 font-mono flex justify-between">
                                  {c.trn && <span>TRN: {c.trn}</span>}
                                </span>
                              </button>
                            );
                          })}
                        {customers.filter(c => {
                          const query = companySearchQuery.toLowerCase();
                          const isSupplier = c.id?.startsWith('supp-') || c.companyName.toUpperCase().includes('SUPPLIER');
                          const typeMatches = stmtType === 'payables_outstanding' ? isSupplier : !isSupplier;
                          return (
                            typeMatches &&
                            (c.companyName.toLowerCase().includes(query) ||
                             (c.id && c.id.toLowerCase().includes(query)) ||
                             (c.trn && c.trn.toLowerCase().includes(query)))
                          );
                        }).length === 0 && (
                          <div className="p-3 text-center text-xs text-slate-400 italic">
                            No registered {stmtType === 'payables_outstanding' ? 'supplier' : 'customer'} matches "{companySearchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-1">
                      <span className="text-slate-500 font-bold min-w-[70px] text-[10px]">Address :</span>
                      <textarea
                        rows={2}
                        value={stmtAddress}
                        onChange={(e) => setStmtAddress(e.target.value)}
                        placeholder="Company address"
                        className="flex-1 text-[10.5px] font-semibold placeholder-slate-350 border border-transparent hover:border-slate-200 focus:border-slate-350 bg-transparent hover:bg-slate-50 p-0.5 rounded focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[70px] text-[10px]">Phone :</span>
                      <input
                        type="text"
                        value={stmtPhone}
                        onChange={(e) => setStmtPhone(e.target.value)}
                        placeholder="Phone detail"
                        className="flex-1 text-[10.5px] font-bold placeholder-slate-350 border border-transparent hover:border-slate-200 focus:border-slate-350 bg-transparent hover:bg-slate-50 p-0.5 rounded focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[70px] text-[10px]">P.O. Box :</span>
                      <input
                        type="text"
                        value={stmtPoBox}
                        onChange={(e) => setStmtPoBox(e.target.value)}
                        placeholder="Po box detail"
                        className="flex-1 text-[10.5px] font-bold placeholder-slate-350 border border-transparent hover:border-slate-200 focus:border-slate-350 bg-transparent hover:bg-slate-50 p-0.5 rounded focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[70px] text-[10px]">TRN :</span>
                      <input
                        type="text"
                        value={stmtTrn}
                        onChange={(e) => setStmtTrn(e.target.value)}
                        placeholder="Tax registration number"
                        className="flex-1 text-[10.5px] font-bold placeholder-slate-350 border border-transparent hover:border-slate-200 focus:border-slate-350 bg-transparent hover:bg-slate-50 p-0.5 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SUMMARY TABLE SECTION (matching screenshot right-side box) */}
                <div className="md:col-span-2 col-span-1">
                  <div className="border border-slate-950 rounded overflow-hidden text-[11px] bg-white">
                    <div className="bg-slate-950 text-white font-bold text-center py-1 bg-black text-xs uppercase tracking-wider font-mono">
                      Statement of Account
                    </div>
                    <div className="flex border-b border-slate-950 divide-x divide-slate-950">
                      <div className="w-1/2 p-1 px-2 text-slate-750">Total Amount</div>
                      <div className="w-1/2 p-1 px-2 text-right font-bold text-slate-900 font-mono">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(manualTotalAmount)}
                      </div>
                    </div>
                    <div className="flex border-b border-slate-950 divide-x divide-slate-950">
                      <div className="w-1/2 p-1 px-2 text-slate-755">Amount Paid</div>
                      <div className="w-1/2 p-1 px-2 text-right font-bold text-emerald-700 font-mono">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(manualTotalPaid)}
                      </div>
                    </div>
                    <div className="flex divide-x divide-slate-950 bg-slate-50/50">
                      <div className="w-1/2 p-1 px-2 font-bold text-slate-800">Amount Due</div>
                      <div className="w-1/2 p-1 px-2 text-right font-bold text-rose-700 font-mono">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(manualTotalOutstanding)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATEMENT PERIOD SECTOR */}
              <div className="text-right text-[10px] font-bold mt-6 mb-3 flex items-center justify-end gap-1.5 font-mono text-slate-800">
                <span>Period :</span>
                <input 
                  type="date"
                  value={stmtPeriodFrom}
                  onChange={(e) => setStmtPeriodFrom(e.target.value)}
                  className="border border-slate-200 bg-slate-50 p-0.5 rounded focus:outline-none"
                />
                <span>-</span>
                <input 
                  type="date"
                  value={stmtPeriodTo}
                  onChange={(e) => setStmtPeriodTo(e.target.value)}
                  className="border border-slate-200 bg-slate-50 p-0.5 rounded focus:outline-none"
                />
              </div>

              {/* PRIMARY INTERACTIVE TRANSACTIONS GRID */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-center text-[10px] border-collapse font-sans min-w-[850px]" onKeyDown={handleGridKeyDown}>
                  <thead>
                    <tr className="border-t-2 border-b-2 border-slate-950 text-[10px] font-bold">
                      <th className="p-1 px-1.5 text-left w-[85px]">Date</th>
                      <th className="p-1 px-1.5">Payment Terms</th>
                      <th className="p-1 px-1.5 w-[60px]">Overdue Days</th>
                      <th className="p-1 px-1.5">LPO Ref</th>
                      <th className="p-1 px-1.5">Invoice Ref</th>
                      {stmtType !== 'payables_outstanding' && <th className="p-1 px-1.5 font-bold">W/O Ref</th>}
                      <th className="p-1 px-1.5">Delivery Dates</th>
                      <th className="p-1 px-1.5 text-right w-[95px]">Amount</th>
                      <th className="p-1 px-1.5">Date Paid</th>
                      <th className="p-1 px-1.5">Receipt No</th>
                      <th className="p-1 px-1.5">Payment Mode</th>
                      <th className="p-1 px-1.5 text-right w-[90px]">Amount Paid</th>
                      <th className="p-1 px-1.5 text-right w-[95px]">Balance</th>
                      <th className="p-1 px-1.5 text-center no-print w-[35px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* EXISTING ROWS LIST */}
                    {stmtTxs.map((t, idx) => {
                      const bal = Number(t.amount || 0) - Number(t.amountPaid || 0);
                      if (t.isLinkedReceipt) {
                        return (
                          <tr key={t.id || idx} className="border-b border-orange-100 bg-orange-50/20 hover:bg-orange-50/45 group transition-colors">
                            {/* Date */}
                            <td className="p-1 text-left text-[9.5px] font-mono text-slate-700 select-none">
                              {t.date}
                            </td>
                            {/* Terms */}
                            <td className="p-1 text-center text-[9.5px]">
                              <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold font-sans text-[8px] tracking-wider uppercase">
                                RECEIPT
                              </span>
                            </td>
                            {/* Overdue Days */}
                            <td className="p-1 text-center text-[9.5px] text-slate-400 font-mono select-none">—</td>
                            {/* LPO */}
                            <td className="p-1 text-center text-[9.5px] text-slate-600 font-mono">{t.lpoRef}</td>
                            {/* Invoice */}
                            <td className="p-1 text-center text-[9.5px] text-slate-400 font-mono">—</td>
                            {/* W/O */}
                            {stmtType !== 'payables_outstanding' && (
                              <td className="p-1 text-center text-[9.5px] text-slate-600 font-mono font-bold text-orange-700">{t.woRef}</td>
                            )}
                            {/* Delivery Dates */}
                            <td className="p-1 text-center text-[9.5px] text-slate-400 font-mono">—</td>
                            {/* Amount */}
                            <td className="p-1 text-right text-[9.5px] text-slate-400 font-mono">0.00</td>
                            {/* Date Paid */}
                            <td className="p-1 text-center text-[9.5px] text-slate-700 font-mono">{t.datePaid}</td>
                            {/* Receipt */}
                            <td className="p-1 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[9.5px] font-mono font-bold text-slate-800 bg-white px-1 py-0.5 rounded border border-orange-200 shadow-2xs">{t.receiptNo}</span>
                                <button
                                  type="button"
                                  onClick={() => handlePrintReceipt(t.receiptRawData)}
                                  className="p-1 hover:bg-orange-100 text-[#f37021] rounded transition-all cursor-pointer shadow-3xs"
                                  title="View / Print Receipt Voucher PDF"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            {/* Mode */}
                            <td className="p-1 text-center text-[9.5px] font-bold text-slate-700 uppercase">{t.paymentMode}</td>
                            {/* Amount Paid */}
                            <td className="p-1 text-right text-[9.5px] font-bold text-emerald-700 font-mono">
                              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(t.amountPaid)}
                            </td>
                            {/* Balance */}
                            <td className="p-1 text-right font-bold text-slate-800 font-mono select-none">
                              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(bal)}
                            </td>
                            
                            {/* Remove Action */}
                            <td className="p-0.5 text-center no-print">
                              <button
                                type="button"
                                onClick={() => setStmtTxs(stmtTxs.filter(row => row.id !== t.id))}
                                className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                                title="Remove linked receipt from view"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={t.id || idx} className="border-b border-slate-150 hover:bg-slate-50/50 group">
                          {/* Date */}
                          <td className="p-0.5 text-left">
                            <input 
                              type="date"
                              value={getFormattedDateInput(t.date)}
                              onChange={(e) => updateStmtRow(t.id, 'date', e.target.value)}
                              data-row={idx}
                              data-col={0}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-left w-full outline-none font-mono rounded"
                            />
                          </td>
                          {/* Terms */}
                          <td className="p-0.5">
                            <input 
                              type="text"
                              value={t.paymentTerms || ''}
                              onChange={(e) => updateStmtRow(t.id, 'paymentTerms', e.target.value)}
                              data-row={idx}
                              data-col={1}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded"
                            />
                          </td>
                          {/* Overdue Days */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-od-${t.overdueDays}`}
                              type="number"
                              defaultValue={t.overdueDays}
                              onBlur={(e) => updateStmtRow(t.id, 'overdueDays', parseInt(e.target.value) || 0)}
                              data-row={idx}
                              data-col={2}
                              className={`text-[9.5px] p-0.5 text-center w-full outline-none rounded font-mono font-bold border transition-colors ${
                                t.overdueDays > getTermsLimit(t.paymentTerms) 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            />
                          </td>
                          {/* LPO */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-lpo-${t.lpoRef}`}
                              type="text"
                              defaultValue={t.lpoRef}
                              onBlur={(e) => updateStmtRow(t.id, 'lpoRef', e.target.value)}
                              data-row={idx}
                              data-col={3}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded"
                            />
                          </td>
                          {/* Invoice */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-inv-${t.invoiceRef}`}
                              type="text"
                              defaultValue={t.invoiceRef}
                              onBlur={(e) => updateStmtRow(t.id, 'invoiceRef', e.target.value)}
                              data-row={idx}
                              data-col={4}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full font-bold outline-none rounded font-mono"
                            />
                          </td>
                          {/* W/O */}
                          {stmtType !== 'payables_outstanding' && (
                            <td className="p-0.5">
                              <input 
                                key={`${t.id}-wo-${t.woRef}`}
                                type="text"
                                defaultValue={t.woRef}
                                onBlur={(e) => updateStmtRow(t.id, 'woRef', e.target.value)}
                                data-row={idx}
                                data-col={5}
                                className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded"
                              />
                            </td>
                          )}
                          {/* Delivery Dates */}
                          <td className="p-0.5">
                            {stmtShowDeliveryDate ? (
                              <input 
                                key={`${t.id}-dd-${t.deliveryDates}`}
                                type="text"
                                defaultValue={t.deliveryDates}
                                onBlur={(e) => updateStmtRow(t.id, 'deliveryDates', e.target.value)}
                                data-row={idx}
                                data-col={6}
                                className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded"
                              />
                            ) : (
                              <span className="text-slate-400 font-mono select-none block text-center">—</span>
                            )}
                          </td>
                          {/* Amount */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-amt-${t.amount}`}
                              type="number"
                              defaultValue={t.amount}
                              onBlur={(e) => updateStmtRow(t.id, 'amount', parseFloat(e.target.value) || 0)}
                              data-row={idx}
                              data-col={7}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-right font-bold w-full outline-none rounded font-mono"
                            />
                          </td>
                          {/* Date Paid */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-dp-${t.datePaid}`}
                              type="text"
                              defaultValue={t.datePaid}
                              onBlur={(e) => updateStmtRow(t.id, 'datePaid', e.target.value)}
                              data-row={idx}
                              data-col={8}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded"
                            />
                          </td>
                          {/* Receipt */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-rn-${t.receiptNo}`}
                              type="text"
                              defaultValue={t.receiptNo}
                              onBlur={(e) => updateStmtRow(t.id, 'receiptNo', e.target.value)}
                              data-row={idx}
                              data-col={9}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded font-mono"
                            />
                          </td>
                          {/* Mode */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-pm-${t.paymentMode}`}
                              type="text"
                              defaultValue={t.paymentMode}
                              onBlur={(e) => updateStmtRow(t.id, 'paymentMode', e.target.value)}
                              data-row={idx}
                              data-col={10}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-center w-full outline-none rounded"
                            />
                          </td>
                          {/* Amount Paid */}
                          <td className="p-0.5">
                            <input 
                              key={`${t.id}-paid-${t.amountPaid}`}
                              type="number"
                              defaultValue={t.amountPaid}
                              onBlur={(e) => updateStmtRow(t.id, 'amountPaid', parseFloat(e.target.value) || 0)}
                              data-row={idx}
                              data-col={11}
                              className="bg-transparent hover:bg-slate-100/80 focus:bg-white text-[9.5px] p-0.5 text-right w-full outline-none rounded font-mono"
                            />
                          </td>
                          {/* Balance */}
                          <td className="p-0.5 text-right font-bold text-slate-800 font-mono select-none">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(bal)}
                          </td>
                          
                          {/* Remove Action */}
                          <td className="p-0.5 text-center no-print">
                            <button
                              onClick={() => setStmtTxs(stmtTxs.filter(row => row.id !== t.id))}
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* APPEND ROW BUILDER BLOCK */}
                    <tr className="bg-slate-100/60 font-medium border-b-2 border-slate-950 text-slate-600 border-t">
                      {/* Date */}
                      <td className="p-1 text-left">
                        <input 
                          type="date"
                          value={stmtRowDate}
                          onChange={(e) => setStmtRowDate(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={0}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5Focus font-mono"
                        />
                      </td>
                      {/* Terms */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="60 Days"
                          value={stmtRowTerms}
                          onChange={(e) => setStmtRowTerms(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={1}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center"
                        />
                      </td>
                      {/* Overdue */}
                      <td className="p-1">
                        <input 
                          type="number"
                          placeholder="0"
                          value={stmtRowOverdue}
                          onChange={(e) => setStmtRowOverdue(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={2}
                          className={`w-full text-[9px] rounded p-0.5 text-center font-mono font-bold border transition-colors ${
                            (parseInt(stmtRowOverdue, 10) || 0) > getTermsLimit(stmtRowTerms)
                              ? 'bg-rose-50 text-rose-700 border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-500' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                          }`}
                        />
                      </td>
                      {/* LPO Ref */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="LPO"
                          value={stmtRowLpo}
                          onChange={(e) => setStmtRowLpo(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={3}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center"
                        />
                      </td>
                      {/* Invoice Ref */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="INV-..."
                          value={stmtRowInvoice}
                          onChange={(e) => setStmtRowInvoice(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={4}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center font-bold"
                        />
                      </td>
                      {/* WO */}
                      {stmtType !== 'payables_outstanding' && (
                        <td className="p-1">
                          <input 
                            type="text"
                            placeholder="WO"
                            value={stmtRowWo}
                            onChange={(e) => setStmtRowWo(e.target.value)}
                            data-row={stmtTxs.length}
                            data-col={5}
                            className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center"
                          />
                        </td>
                      )}
                      {/* Delivery */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="Dates"
                          value={stmtRowDelivery}
                          onChange={(e) => setStmtRowDelivery(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={6}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center"
                        />
                      </td>
                      {/* Amount */}
                      <td className="p-1">
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={stmtRowAmount}
                          onChange={(e) => setStmtRowAmount(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={7}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-right font-bold font-mono"
                        />
                      </td>
                      {/* Date Paid */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="—"
                          value={stmtRowDatePaid}
                          onChange={(e) => setStmtRowDatePaid(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={8}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center"
                        />
                      </td>
                      {/* Receipt */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="—"
                          value={stmtRowReceipt}
                          onChange={(e) => setStmtRowReceipt(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={9}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center font-mono"
                        />
                      </td>
                      {/* Mode */}
                      <td className="p-1">
                        <input 
                          type="text"
                          placeholder="—"
                          value={stmtRowMode}
                          onChange={(e) => setStmtRowMode(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={10}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-center"
                        />
                      </td>
                      {/* Amount Paid */}
                      <td className="p-1">
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={stmtRowAmtPaid}
                          onChange={(e) => setStmtRowAmtPaid(e.target.value)}
                          data-row={stmtTxs.length}
                          data-col={11}
                          className="w-full text-[9px] bg-white border border-slate-200 rounded p-0.5 text-right font-mono"
                        />
                      </td>
                      {/* Empty display balance */}
                      <td className="p-1 text-right text-slate-350 text-[9px] font-mono select-none">
                        Pending
                      </td>
                      {/* Add Button */}
                      <td className="p-1 text-center no-print">
                        <button
                          onClick={handleStmtAddRow}
                          className="p-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded shadow-2xs hover:shadow transition-all flex items-center justify-center cursor-pointer mx-auto"
                          title="Append Invoice row to statement grid"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* OUTSTANDING TOTAL SECTION */}
              <div className="flex justify-end mt-4 mb-2">
                <div className="text-[11px] font-bold space-x-1 uppercase text-slate-900 border-b-2 border-double border-slate-950 pb-0.5">
                  <span>Total Outstandings :</span>
                  <span className="font-mono text-sm">
                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(manualTotalOutstanding)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <div className="text-[9.5px] font-bold uppercase text-slate-800 text-right">
                  <span>Amount in words: &nbsp;</span>
                  <span className="text-blue-900 font-mono underline decoration-dotted">{convertAmountToWordsAED(manualTotalOutstanding)}</span>
                </div>
              </div>

              {/* OVERRIDE AGING BUCKETS TABLE MODEL (matching printed statement layout) */}
              <div className="mt-1">
                <table className="w-full border-collapse border border-slate-950 text-center text-[10px] bg-white">
                  <thead>
                    <tr className="bg-slate-950 text-white divide-x divide-slate-800 font-bold border-b border-slate-950">
                      <th className="p-1.5 uppercase tracking-wide">Current</th>
                      <th className="p-1.5">1-30 Days</th>
                      <th className="p-1.5 font-bold">31-60 Days</th>
                      <th className="p-1.5">61-90 Days</th>
                      <th className="p-1.5">91-120 Days</th>
                      <th className="p-1.5">Over 120 Days</th>
                      <th className="p-1.5">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="divide-x divide-slate-300 font-bold text-slate-950">
                      <td className="p-0.5">
                        <input 
                          type="number"
                          value={stmtAging.current}
                          onChange={(e) => setStmtAging({ ...stmtAging, current: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center p-1 bg-transparent hover:bg-slate-100 font-bold text-[10px] focus:outline-none"
                        />
                      </td>
                      <td className="p-0.5">
                        <input 
                          type="number"
                          value={stmtAging.days1to30}
                          onChange={(e) => setStmtAging({ ...stmtAging, days1to30: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center p-1 bg-transparent hover:bg-slate-100 font-bold text-[10px] focus:outline-none"
                        />
                      </td>
                      <td className="p-0.5">
                        <input 
                          type="number"
                          value={stmtAging.days31to60}
                          onChange={(e) => setStmtAging({ ...stmtAging, days31to60: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center p-1 bg-transparent hover:bg-slate-100 font-bold text-[10px] focus:outline-none"
                        />
                      </td>
                      <td className="p-0.5">
                        <input 
                          type="number"
                          value={stmtAging.days61to90}
                          onChange={(e) => setStmtAging({ ...stmtAging, days61to90: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center p-1 bg-transparent hover:bg-slate-100 font-bold text-[10px] focus:outline-none"
                        />
                      </td>
                      <td className="p-0.5">
                        <input 
                          type="number"
                          value={stmtAging.days91to120}
                          onChange={(e) => setStmtAging({ ...stmtAging, days91to120: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center p-1 bg-transparent hover:bg-slate-100 font-bold text-[10px] focus:outline-none"
                        />
                      </td>
                      <td className="p-0.5">
                        <input 
                          type="number"
                          value={stmtAging.over120}
                          onChange={(e) => setStmtAging({ ...stmtAging, over120: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center p-1 bg-transparent hover:bg-slate-100 font-bold text-[10px] focus:outline-none"
                        />
                      </td>
                      <td className="p-1.5 select-none font-mono text-slate-900 bg-slate-50/50">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(manualTotalAgingBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PAYMENT REMARK AND BANK SPECIFICATION (matches screenshot bottom) */}
              {stmtType !== 'payables_outstanding' && (
                <div className="mt-8 text-[10.5px] border-t border-slate-200 pt-5 text-slate-800 space-y-4">
                  <p className="font-semibold text-slate-950">
                    Please make any payment due, either by electronic transfer to our bank account or by cheque payable to:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Beneficiary :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.beneficiary}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, beneficiary: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Bank Name :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.bankName}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, bankName: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Account Number :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.accountNo}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, accountNo: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Branch :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.branch}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, branch: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Country :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.country}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, country: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">IBAN :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.iban}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, iban: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Swift Code :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.swiftCode}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, swiftCode: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold min-w-[125px]">Address :</span>
                      <input 
                        type="text"
                        className="flex-1 bg-transparent hover:bg-slate-50 focus:bg-white p-0.5 border border-transparent hover:border-slate-200 rounded font-bold text-slate-950 text-[10.5px]"
                        value={stmtBankDetails.address}
                        onChange={(e) => setStmtBankDetails({ ...stmtBankDetails, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER CAPTION */}
              <div className="text-center italic text-slate-400 font-mono text-[9px] mt-12 border-t border-slate-100 pt-4">
                This is computer generated invoice, no signature required
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. 'CUSTOM RECORDS' ARCHIVE LOGS VIEW */}
      {activeMainTab === 'custom_records' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-3xs overflow-hidden no-print animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header removed as requested */}
          <div className="p-3 bg-slate-55 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
            {/* Category switch pills */}
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setRecordsCategory('customer')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all flex items-center gap-1.5 ${
                  recordsCategory === 'customer' ? 'bg-[#f37021] text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Customer SOA
              </button>
              <button
                type="button"
                onClick={() => setRecordsCategory('supplier')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all flex items-center gap-1.5 ${
                  recordsCategory === 'supplier' ? 'bg-slate-800 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Supplier SOA
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search records by company or client code..."
                value={recordsSearchQuery}
                onChange={(e) => setRecordsSearchQuery(e.target.value)}
                className="bg-white border text-xs border-slate-300 rounded-lg p-1.5 px-3 w-full focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Representative:</span>
                <select
                  value={recordsFilterSellerCode}
                  onChange={(e) => setRecordsFilterSellerCode(e.target.value)}
                  className="bg-white border text-xs border-slate-300 rounded-lg p-1.5 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer"
                >
                  <option value="ALL">🔍 All Sellers</option>
                  {sellers.map(s => (
                    <option key={s.code} value={s.code}>👨‍💼 {s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              {/* DEDICATED PDF BUTTON TO VIEW/PRINT ALL REPORTS AT ONCE */}
              <button
                type="button"
                onClick={() => {
                  const visibleStatements = mergedSavedStatements.filter((stmt) => {
                    const matchesCategory = recordsCategory === 'supplier'
                      ? (stmt.statementType === 'payables_outstanding' || (stmt.customerCode && stmt.customerCode.toLowerCase().startsWith('supp-')) || (stmt.companyName && stmt.companyName.toUpperCase().includes('SUPPLIER')))
                      : (stmt.statementType !== 'payables_outstanding' && !((stmt.customerCode && stmt.customerCode.toLowerCase().startsWith('supp-')) || (stmt.companyName && stmt.companyName.toUpperCase().includes('SUPPLIER'))));
                    const matchesSearch = stmt.companyName.toLowerCase().includes(recordsSearchQuery.toLowerCase()) || 
                                          stmt.customerCode.toLowerCase().includes(recordsSearchQuery.toLowerCase());
                    const matchesSeller = recordsFilterSellerCode === 'ALL' || stmt.sellerCode === recordsFilterSellerCode;
                    return matchesCategory && matchesSearch && matchesSeller;
                  });
                  triggerPrintAllCustomStatements(visibleStatements);
                }}
                className="bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-700 hover:to-red-700 text-white text-[10.5px] font-bold uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                title="Generate combined PDF of all visible statements"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>PDF: Print All Reports</span>
              </button>
            </div>
          </div>

          <div className="p-1">
            {(() => {
              const visibleStatements = mergedSavedStatements.filter((stmt) => {
                const matchesCategory = recordsCategory === 'supplier'
                  ? (stmt.statementType === 'payables_outstanding' || (stmt.customerCode && stmt.customerCode.toLowerCase().startsWith('supp-')) || (stmt.companyName && stmt.companyName.toUpperCase().includes('SUPPLIER')))
                  : (stmt.statementType !== 'payables_outstanding' && !((stmt.customerCode && stmt.customerCode.toLowerCase().startsWith('supp-')) || (stmt.companyName && stmt.companyName.toUpperCase().includes('SUPPLIER'))));
                const matchesSearch = stmt.companyName.toLowerCase().includes(recordsSearchQuery.toLowerCase()) || 
                                      stmt.customerCode.toLowerCase().includes(recordsSearchQuery.toLowerCase());
                const matchesSeller = recordsFilterSellerCode === 'ALL' || stmt.sellerCode === recordsFilterSellerCode;
                return matchesCategory && matchesSearch && matchesSeller;
              });

              if (visibleStatements.length > 0) {
                return (
                  <div className="overflow-x-auto overflow-y-auto max-h-[360px] border border-slate-300 rounded shadow-xs font-mono scrollbar-thin">
                    <table className="w-full text-left text-[10px] border-collapse min-w-[900px] border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 text-[9px] font-bold uppercase text-center h-9 border-b border-slate-400 font-sans">
                          <th className="p-2 text-left pl-3 border border-slate-300">CLIENT / TRADE PARTNER</th>
                          <th className="p-2 w-[100px] border border-slate-300">CLIENT CODE</th>
                          <th className="p-2 w-[100px] border border-slate-300">SELLER CODE</th>
                          <th className="p-2 w-[180px] border border-slate-300">STATEMENT PERIOD</th>
                          <th className="p-2 w-[110px] border border-slate-300">DATE COMPILED</th>
                          <th className="p-2 w-[140px] text-right pr-3 border border-slate-300">TOTAL DUE</th>
                          <th className="p-2 w-[150px] text-center border border-slate-300">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white text-[10px] divide-y divide-slate-200">
                        {visibleStatements.map((stmt) => {
                          const totalDue = stmt.transactions.reduce((acc, t) => acc + (Number(t.amount) - Number(t.amountPaid)), 0);
                          return (
                            <tr key={stmt.id} className="hover:bg-slate-50/70 h-10 transition-colors odd:bg-white even:bg-slate-50/30 font-sans">
                              <td className="p-2 pl-3 font-sans font-bold text-slate-900 border border-slate-200 truncate max-w-[220px]">
                                {stmt.companyName}
                              </td>
                              <td className="p-2 text-center border border-slate-200 font-semibold text-slate-600 font-mono">
                                <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 border border-slate-200 rounded-sm">
                                  {stmt.customerCode}
                                </span>
                              </td>
                              <td className="p-2 text-center border border-slate-200 font-mono">
                                <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded-sm">
                                  {stmt.sellerCode}
                                </span>
                              </td>
                              <td className="p-2 text-center border border-slate-200 text-slate-600 font-sans">
                                {stmt.periodFrom} <span className="text-slate-400">to</span> {stmt.periodTo}
                              </td>
                              <td className="p-2 text-center border border-slate-200 text-slate-500 font-sans">
                                {new Date(stmt.createdAt || Date.now()).toLocaleDateString()}
                              </td>
                              <td className="p-2 text-right pr-3 border border-slate-200 font-bold text-rose-700 font-mono">
                                AED {totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-2 text-center border border-slate-200 font-sans">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setStatementPrintModal({ show: true, isCustomCompiled: true, customStmt: stmt })}
                                    className="p-1 px-2.5 bg-slate-900 text-white text-[9px] font-sans font-bold uppercase rounded-sm border border-slate-900 hover:bg-black hover:border-black cursor-pointer shadow-3xs flex items-center gap-1"
                                    title="Print Statement Option"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#f37021]" />
                                    <span>PRINT</span>
                                  </button>
                                  <button
                                    onClick={() => handleLoadEditCustomStatement(stmt)}
                                    className="p-1.5 hover:bg-slate-150 text-blue-600 border border-slate-200 rounded-xs cursor-pointer transition-colors"
                                    title="Edit Custom Statement"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCustomStatement(stmt.id, stmt.companyName)}
                                    className="p-1.5 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xs cursor-pointer transition-colors"
                                    title="Delete statement"
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
                );
              } else {
                return (
                  <div className="p-12 text-center text-slate-400 italic text-[11px] space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>No compiled statement records match your selection criteria.</p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      {/* 6. ADVANCED DIALOG MODAL FOR MANAGING SALES REPS (COLORFUL & INTERACTIVE) */}
      {showManageSellerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 text-slate-800 flex justify-between items-center border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#f37021]" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                  General Representatives Register
                </h3>
              </div>
              <button 
                onClick={() => setShowManageSellerModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-5 text-xs">
              {/* Existing Sellers Register Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                    Currently Enrolled Representatives ({sellers.length})
                  </h4>
                  {/* Scroll Up and Scroll Down buttons */}
                  <div className="flex items-center gap-1.5 no-print">
                    <button
                      type="button"
                      onClick={() => scrollRepVertical('up')}
                      className="p-1 px-2 bg-slate-100 hover:bg-slate-250 hover:text-slate-800 text-slate-500 border border-slate-200 rounded text-[8.5px] font-bold cursor-pointer transition-all active:scale-90 flex items-center gap-1 shadow-3xs"
                      title="Scroll List Up"
                    >
                      ▲ <span className="font-sans text-[8px] font-semibold uppercase">UP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollRepVertical('down')}
                      className="p-1 px-2 bg-slate-100 hover:bg-slate-250 hover:text-slate-800 text-slate-500 border border-slate-200 rounded text-[8.5px] font-bold cursor-pointer transition-all active:scale-90 flex items-center gap-1 shadow-3xs"
                      title="Scroll List Down"
                    >
                      ▼ <span className="font-sans text-[8px] font-semibold uppercase">DOWN</span>
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={repVerticalModalRef}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scroll-smooth pr-1"
                >
                  {sellers.map((s, idx) => {
                    const assignedCount = customers.filter(c => customerSellerMap[c.id] === s.code).length;
                    
                    // Distinct background gradients for unique look
                    const colPresets = [
                      'from-blue-500 to-indigo-500',
                      'from-emerald-500 to-teal-500',
                      'from-purple-500 to-fuchsia-500',
                      'from-amber-500 to-orange-500',
                      'from-rose-500 to-red-500'
                    ];
                    const grad = colPresets[idx % colPresets.length];

                    return (
                      <div key={s.code} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} text-white flex items-center justify-center font-bold font-mono text-[11px]`}>
                            {s.code}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wide font-mono">
                              {assignedCount} CLIENT{assignedCount !== 1 ? 'S' : ''} ASSIGNED
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingSellerCode(s.code);
                              setEditingSellerName(s.name);
                            }}
                            className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg cursor-pointer transition-colors"
                            title="Edit Representative's Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSeller(s.code)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="Erase registry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-form Add or Edit Enrollee Row */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                {editingSellerCode ? (
                  <>
                    <h4 className="text-[9.5px] font-bold text-amber-700 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" /> Edit Representative: {editingSellerCode}
                    </h4>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editingSellerName.trim()) {
                          alert("Please provide a valid Representative Name!");
                          return;
                        }
                        const updated = sellers.map(s => {
                          if (s.code === editingSellerCode) {
                            return { ...s, name: editingSellerName.trim() };
                          }
                          return s;
                        });
                        setSellers(updated);
                        setEditingSellerCode(null);
                        setEditingSellerName('');
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-0.5 font-sans">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Code</label>
                          <input
                            type="text"
                            disabled
                            value={editingSellerCode}
                            className="w-full p-2 bg-slate-100 border border-slate-200 rounded font-bold text-slate-400 text-xs uppercase cursor-not-allowed"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Representative Name"
                            value={editingSellerName}
                            onChange={(e) => setEditingSellerName(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSellerCode(null);
                            setEditingSellerName('');
                          }}
                          className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold uppercase rounded-lg text-[10.5px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold tracking-wide uppercase rounded-lg shadow-3xs text-[10.5px] cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h4 className="text-[9.5px] font-bold text-[#f37021] uppercase tracking-wider font-mono flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" /> Register a New Representative
                    </h4>
                    
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSellerCode.trim() || !newSellerName.trim()) {
                          alert("Please provide valid Code and Name parameters!");
                          return;
                        }
                        if (sellers.some(s => s.code.toUpperCase() === newSellerCode.trim().toUpperCase())) {
                          alert("A representative with this code already exists on the registry!");
                          return;
                        }
                        const compiledSeller = {
                          code: newSellerCode.trim().toUpperCase(),
                          name: newSellerName.trim()
                        };
                        setSellers([...sellers, compiledSeller]);
                        setNewSellerCode('');
                        setNewSellerName('');
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 space-y-0.5 font-sans">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Code</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MFI"
                            value={newSellerCode}
                            onChange={(e) => setNewSellerCode(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-xs uppercase"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Representative Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Salim Al Hashimi"
                            value={newSellerName}
                            onChange={(e) => setNewSellerName(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-950 hover:to-slate-905 text-[#f37021] border border-slate-950 font-bold tracking-wide uppercase rounded-lg shadow-3xs text-[10.5px] cursor-pointer"
                      >
                        Enroll Representative
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Close controls */}
              <div className="flex justify-end pt-2 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowManageSellerModal(false)}
                  className="px-4 py-2 bg-[#f37021] hover:bg-[#d65a12] text-white font-bold uppercase rounded-lg shadow cursor-pointer text-[10px]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DIALOG MODAL FOR ADDING UNIQUE SELLER */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 text-slate-800 flex justify-between items-center border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wide font-mono text-slate-900">Create New Seller</h3>
              <button 
                onClick={() => setShowAddSellerModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddSeller} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Seller Code / Initials (Required)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MFI"
                  value={newSellerCode}
                  onChange={(e) => setNewSellerCode(e.target.value)}
                  maxLength={6}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-serif text-sm font-bold uppercase focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Full Seller Name (Required)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisal Shah"
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-800 font-bold focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSellerModal(false)}
                  className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f37021] hover:bg-[#d65a12] text-white font-semibold rounded"
                >
                  Create Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time high-fidelity A4 Statement of Account PDF Preview Modal overlay */}
      {soaPdfPreview && activeCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs z-50 flex flex-col overflow-y-auto p-4 md:p-8 select-none no-print">
          {/* Header Action Control Bar */}
          <div className="max-w-5xl w-full mx-auto bg-white border border-slate-200 text-slate-850 rounded-t-lg p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-sm font-sans">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-[#f37021]/15 rounded">
                <FileText className="w-5 h-5 text-[#f37021]" />
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  SOA Layout PDF Previewer
                </h3>
                <p className="text-[10px] text-slate-500 font-mono font-bold">
                  CUSTOMER: {activeCustomer.companyName} • SELLER CODE: {activeSellerCode}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSoaPdfPreview(false);
                  setTimeout(() => {
                    setStatementPrintModal({ show: true, isCustomCompiled: false });
                  }, 100);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 font-bold uppercase text-[10px] tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" /> Save / Print PDF
              </button>
              
              <button
                onClick={() => setSoaPdfPreview(false)}
                className="p-1 px-3 bg-slate-100 hover:bg-rose-600 hover:text-white rounded-lg border border-slate-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer transition-all flex items-center gap-1.5 shadow-3xs hover:border-rose-600"
              >
                <X className="w-3.5 h-3.5" /> Close Preview
              </button>
            </div>
          </div>

          {/* Simulated A4 Paper Sheet representation */}
          <div className="max-w-5xl w-full mx-auto bg-white text-[#0f172a] rounded-b-lg shadow-2xl p-6 md:p-12 relative overflow-hidden font-sans border-x border-b border-slate-200">
            {/* Watermark label */}
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] text-blue-600 opacity-[0.03] select-none pointer-events-none text-7xl md:text-9xl font-bold uppercase tracking-widest leading-none text-center">
              MFI LEDGER
            </div>

            {/* Upper Letterhead Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-250">
              <div className="text-left">
                <h1 className="text-slate-900 font-bold text-sm md:text-md uppercase tracking-tight leading-none text-[#1e3a8a]">
                  {activeCompany.name}
                </h1>
                {isMarineFastenersCompany(activeCompany) ? (
                  <p className="text-[10px] font-bold text-red-650 tracking-wider">
                    (SOLE PROPRIETORSHIP)
                  </p>
                ) : (
                  activeCompany.tagline && (
                    <p className="text-[10px] font-bold text-slate-600 tracking-wider">
                      {activeCompany.tagline}
                    </p>
                  )
                )}
                <p className="text-[8.5px] font-semibold text-slate-500 max-w-sm font-sans uppercase leading-tight mt-1">
                  {activeCompany.tagline || 'Manufacturer & Supplier of Fasteners, Fixing Accessories & Threaded Studs'}
                </p>
              </div>
              <div className="text-left md:text-right font-mono text-[8px] text-slate-500 space-y-0.5 leading-tight">
                <p className="font-sans font-bold text-[8.5px] uppercase text-slate-900">FACTORY OFFICE ADDRESS</p>
                <p>{activeCompany.address}</p>
                <p>Telephone: {activeCompany.phone || '—'}</p>
                <p>Email: {activeCompany.email || '—'} • TRN ID: {activeCompany.trn || '—'}</p>
              </div>
            </div>

            {/* Title and metadata block */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[8px] font-bold uppercase text-slate-400 block tracking-widest">Customer Recipient Ledger details</span>
                <p className="font-sans font-bold text-slate-900 text-sm uppercase mt-0.5">{activeCustomer.companyName}</p>
                <p className="text-[8.5px] text-slate-550 mt-1 leading-normal capitalize">
                  {activeCustomer.address || 'Ajman Industrial Zone 1, UAE'}<br />
                  {activeCustomer.phone && `Phone: ${activeCustomer.phone} | `}
                  {activeCustomer.trn && `Tax Reg TRN No: ${activeCustomer.trn}`}
                </p>
              </div>
              
              <div className="font-mono text-[8.5px] space-y-1 md:text-right md:justify-self-end text-slate-650 max-w-xs">
                <h2 className="text-[#f37021] font-sans font-bold uppercase tracking-wider text-[11px]">
                  {isCurrentSupplier ? 'PAYABLES OUTSTANDING STATEMENT' : 'STATEMENT OF ACCOUNT'}
                </h2>
                <p><strong>REPORT YEAR:</strong> {filterYear === 'ALL' ? '2026' : filterYear}</p>
                <p><strong>REPORT MONTH:</strong> {filterMonth}</p>
                <p><strong>DATED AS OF:</strong> {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p><strong>REPRESENTATIVE:</strong> {activeSellerCode} WORKLIST</p>
              </div>
            </div>

            {/* Table list of transactions */}
            <div className="border border-slate-300 rounded-lg overflow-hidden my-4 bg-white">
              <table className="w-full text-center text-[7.5px] uppercase font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-sans text-[7.5px] font-bold border-b border-black divide-x divide-slate-700 h-8">
                    <th className="p-1 text-left pl-2">Bill Date</th>
                    <th className="p-1">Terms</th>
                    <th className="p-1">O/D</th>
                    <th className="p-1">LPO Ref</th>
                    <th className="p-1">Invoice No</th>
                    <th className="p-1">Work Order</th>
                    {showDeliveryDateInLedger && <th className="p-1">Delivery</th>}
                    <th className="p-1 text-right pr-2">Total Amt</th>
                    <th className="p-1">Paid Date</th>
                    <th className="p-1">Receipt No</th>
                    <th className="p-1">Mode</th>
                    <th className="p-1 text-right pr-2">Amt Credited</th>
                    <th className="p-1 text-right pr-2 bg-slate-800 text-white">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center">
                  {(() => {
                    let runningBalance = 0;
                    return activeCustomerTxs.map((t, idx) => {
                      runningBalance += Number(t.amount || 0);
                      runningBalance -= Number(t.amountPaid || 0);
                      return (
                        <tr key={t.id + '-soa-row-' + idx} className="divide-x divide-slate-200 hover:bg-slate-50 h-7 text-slate-800 text-center">
                          <td className="p-1 text-left pl-2 leading-none">{t.date || '—'}</td>
                          <td className="p-1 text-center font-sans">{t.paymentTerms || '—'}</td>
                          <td className="p-1 text-center">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold font-sans leading-none ${
                              t.overdueDays > getTermsLimit(t.paymentTerms) 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {t.overdueDays || '0'}
                            </span>
                          </td>
                          <td className="p-1 text-center font-sans tracking-tight leading-none select-all text-slate-650 truncate max-w-[50px]">{t.lpoRef || '—'}</td>
                          <td className="p-1 text-center font-bold text-slate-950 select-all font-sans">{t.invoiceRef || '—'}</td>
                          <td className="p-1 text-center text-slate-500">{t.woRef || '—'}</td>
                          {showDeliveryDateInLedger && <td className="p-1 text-center text-slate-500 leading-none">{t.deliveryDates || '—'}</td>}
                          <td className="p-1 text-right pr-2 font-bold text-slate-900">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(t.amount)}
                          </td>
                          <td className="p-1 text-center leading-none">{t.datePaid || '—'}</td>
                          <td className="p-1 text-center font-sans">
                            <div className="flex items-center justify-center gap-1">
                              <span>{t.receiptNo || '—'}</span>
                              {t.isLinkedReceipt && (
                                <button
                                  type="button"
                                  onClick={() => handlePrintReceipt(t.receiptRawData)}
                                  className="p-0.5 hover:bg-orange-100 text-[#f37021] rounded transition-all cursor-pointer shadow-3xs"
                                  title="View / Print Receipt Voucher PDF"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-1 text-center font-sans text-slate-500">{t.paymentMode || '—'}</td>
                          <td className="p-1 text-right pr-2 text-emerald-700 font-bold">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(t.amountPaid)}
                          </td>
                          <td className="p-1 text-right pr-2 font-bold text-slate-950 bg-slate-50/70">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(runningBalance)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Aging metrics card & totals summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-left font-sans">
              {/* Net calculations box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-2 text-[9px] md:col-span-1">
                <div>
                  <span className="text-[7.5px] font-bold text-slate-400 block uppercase font-mono">Total Sales / Debits</span>
                  <span className="text-[10px] font-mono font-bold text-slate-900 leading-tight block mt-0.5">
                    AED {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.totalSales)}
                  </span>
                </div>
                <div>
                  <span className="text-[7.5px] font-bold text-slate-400 block uppercase font-mono">Amount Paid / Credits</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 leading-tight block mt-0.5">
                    AED {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.totalPaid)}
                  </span>
                </div>
                <div className="col-span-2 border-t border-slate-200 pt-1.5 mt-1">
                  <span className="text-[8px] font-bold text-[#1e3a8a] block uppercase font-mono">Total Outstanding Due Balance</span>
                  <span className="text-[12px] font-mono font-semibold text-blue-900 leading-none block mt-1">
                    AED {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(activeCustomerTotals.pending)}
                  </span>
                </div>
              </div>

              {/* Aging structure metrics */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 md:col-span-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider font-mono">Aged Invoice Receivables Analysis Block</span>
                
                <div className="grid grid-cols-6 gap-2 mt-1.5 text-center font-mono text-[8.5px]">
                  <div className="bg-white border border-slate-200 p-1.5 rounded">
                    <span className="text-[7px] text-slate-400 block uppercase font-sans font-bold">Current</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {new Intl.NumberFormat('en-US').format(activeCustomerAging.current)}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 p-1.5 rounded">
                    <span className="text-[7px] text-slate-400 block uppercase font-sans font-bold">1-30 Days</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {new Intl.NumberFormat('en-US').format(activeCustomerAging.days1to30)}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 p-1.5 rounded">
                    <span className="text-[7px] text-slate-400 block uppercase font-sans font-bold">31-60 Days</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {new Intl.NumberFormat('en-US').format(activeCustomerAging.days31to60)}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 p-1.5 rounded">
                    <span className="text-[7px] text-slate-400 block uppercase font-sans font-bold">61-90 Days</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {new Intl.NumberFormat('en-US').format(activeCustomerAging.days61to90)}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 p-1.5 rounded col-span-1">
                    <span className="text-[7px] text-slate-400 block uppercase font-sans font-bold text-rose-700">91-120 Days</span>
                    <span className="font-bold text-rose-800 mt-0.5 block">
                      {new Intl.NumberFormat('en-US').format(activeCustomerAging.days91to120)}
                    </span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-1.5 rounded col-span-1">
                    <span className="text-[7px] text-rose-500 block uppercase font-sans font-bold font-bold">Over 120D</span>
                    <span className="font-bold text-red-650 mt-0.5 block">
                      {new Intl.NumberFormat('en-US').format(activeCustomerAging.over120)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Payment Transfer Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-4 font-mono text-[8px] text-slate-500 grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-3 text-left">
              <div>
                <p className="font-sans font-bold text-[8.5px] uppercase text-slate-850 mb-1">Direct Wire Transfer Details</p>
                <p><strong>BENEFICIARY:</strong> {activeCompany.name}</p>
                <p><strong>BANK NAME:</strong> RAK BANK</p>
                <p><strong>ACCOUNT NUMBER:</strong> 0242715908001</p>
              </div>
              <div className="space-y-0.5 md:text-right">
                <p className="font-sans font-bold text-[8.5px] uppercase text-[#f37021] mb-1">Wire Transfer / IBAN Codes</p>
                <p><strong>IBAN NUMBER:</strong> AE 940400000242715908001</p>
                <p><strong>SWIFT CODE:</strong> NRAKAEAK</p>
                <p><strong>BRANCH / ADDRESS:</strong> KING FAISAL STREET, SHARJAH / P.O.BOX: 1531, DUBAI, UAE.</p>
              </div>
            </div>

            {/* Standard Signoffs */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-200 text-center font-sans text-[8px] text-slate-600 md:col-span-3">
              <div className="space-y-8">
                <span className="font-semibold uppercase text-slate-800 tracking-wider block">Accounts Department Signature</span>
                <span className="font-bold underline text-slate-500 block">CHIEF FINANCIAL AUDITOR • {activeCompany.name}</span>
              </div>
              <div className="space-y-8">
                <span className="font-semibold uppercase text-slate-800 tracking-wider block">Customer Receipt stamp seal</span>
                <span className="font-bold text-slate-350 block">------------------------------------------</span>
              </div>
            </div>

            <div className="text-center font-mono text-[7px] text-slate-400 uppercase mt-12 tracking-wider leading-relaxed border-t border-slate-200 pt-3 md:col-span-3">
              THIS IS A SECURE SYSTEM-GENERATED TRANSACTION JOURNAL COPY • {activeCompany.name}
            </div>
          </div>
        </div>
      )}

      {/* STATEMENT FORMAT SELECTION MODAL */}
      {statementPrintModal.show && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                  Select Statement Format
                </h3>
                <p className="text-[10px] text-slate-500 font-medium font-sans">
                  Choose how you would like to render this customer's financial statement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatementPrintModal({ show: false, isCustomCompiled: false })}
                className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <span className="text-sm font-bold leading-none">×</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Pending Balance Statement */}
              <button
                type="button"
                onClick={() => {
                  if (statementPrintModal.isCustomCompiled && statementPrintModal.customStmt) {
                    triggerCustomStatementPrint(statementPrintModal.customStmt, true);
                  } else {
                    triggerPdfPrint(true);
                  }
                  setStatementPrintModal({ show: false, isCustomCompiled: false });
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all cursor-pointer group flex items-start gap-3"
              >
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide group-hover:text-amber-800">
                    Pending Balance Statement
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 normal-case text-left">
                    Displays only unpaid or partially paid invoices with their remaining outstanding balances. Perfect for collection reminders.
                  </p>
                </div>
              </button>

              {/* Option 2: Full Ledger Balance Statement */}
              <button
                type="button"
                onClick={() => {
                  if (statementPrintModal.isCustomCompiled && statementPrintModal.customStmt) {
                    triggerCustomStatementPrint(statementPrintModal.customStmt, false);
                  } else {
                    triggerPdfPrint(false);
                  }
                  setStatementPrintModal({ show: false, isCustomCompiled: false });
                }}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-all cursor-pointer group flex items-start gap-3"
              >
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide group-hover:text-blue-800">
                    Full Ledger Balance Statement
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 normal-case text-left">
                    Chronologically displays all transaction debits and credit receipts alongside a professional running balance column.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStatementPrintModal({ show: false, isCustomCompiled: false })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIVABLES PRINT PDF CHOICE MODAL (PROMINENT ICONS) */}
      {showPrintPdfChoiceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Light Clean ERP Modal Header */}
            <div className="p-4 bg-slate-100 text-slate-900 flex justify-between items-center border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#f37021]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">Select PDF Report Type</h3>
                  <p className="text-[10px] text-slate-500">Accounts Receivable Statement Generator</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowPrintPdfChoiceModal(false)}
                className="text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-slate-200/80 hover:bg-slate-300 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 font-sans">
              <p className="text-xs text-slate-600 font-medium">
                Choose the desired format for the Accounts Receivable PDF report:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* OPTION 1: PENDING BALANCE REPORT */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCustomerIdForSoa || activeCustomer?.id) {
                      printCustomerSoaById(selectedCustomerIdForSoa || activeCustomer?.id, true);
                    } else {
                      handlePrintReceivablesPDF('pending');
                    }
                    setShowPrintPdfChoiceModal(false);
                  }}
                  className="w-full text-left p-4 rounded-xl border-2 border-amber-300 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-600 transition-all cursor-pointer group flex items-start gap-3.5 shadow-xs"
                >
                  <div className="p-3 bg-amber-500 text-slate-950 font-bold rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide group-hover:text-amber-900">
                        Pending Balance Report
                      </h4>
                      <span className="bg-amber-200 text-amber-900 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-amber-400">
                        Pending Only
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed mt-1">
                      Generates official <strong className="text-slate-900">Statement of Account</strong> containing only <strong className="text-amber-900">uncollected pending balances</strong>, aging breakdown box, and bank transfer details.
                    </p>
                  </div>
                </button>

                {/* OPTION 2: DETAILS REPORT / FULL LEDGER */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedCustomerIdForSoa || activeCustomer?.id) {
                      printCustomerSoaById(selectedCustomerIdForSoa || activeCustomer?.id, false);
                    } else {
                      handlePrintReceivablesPDF('full');
                    }
                    setShowPrintPdfChoiceModal(false);
                  }}
                  className="w-full text-left p-4 rounded-xl border-2 border-orange-300 bg-orange-50/60 hover:bg-orange-100 hover:border-orange-600 transition-all cursor-pointer group flex items-start gap-3.5 shadow-xs"
                >
                  <div className="p-3 bg-[#f37021] text-white rounded-xl group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide group-hover:text-orange-900">
                        Details Report (Full Ledger)
                      </h4>
                      <span className="bg-orange-200 text-orange-950 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-orange-400">
                        Full Details
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed mt-1">
                      Generates comprehensive <strong className="text-slate-900">Full Ledger Statement</strong> including all settled/paid invoices alongside pending transactions with aging summary.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrintPdfChoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ON-SCREEN PRINT PREVIEW MODAL */}
      {docPreviewModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-3xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
            {/* Modal Top Header Bar */}
            <div className="p-3 px-5 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-[#f37021]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                    {docPreviewModal.title || 'Statement & Tax Invoice Print Preview'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Live Document Report Preview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    printHtml(docPreviewModal.htmlContent, docPreviewModal.title || 'Statement_Report');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Download / Save as PDF"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printHtml(docPreviewModal.htmlContent, docPreviewModal.title || 'Statement_Report');
                  }}
                  className="bg-[#f37021] hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 uppercase tracking-wide"
                  title="Send to Printer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocPreviewModal({ show: false, title: '', htmlContent: '' })}
                  className="text-slate-400 hover:text-white transition-colors font-bold text-sm bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ml-1"
                  title="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body Frame */}
            <div className="flex-1 bg-slate-200/80 p-3 overflow-y-auto min-h-[500px]">
              <iframe
                title="Document Print Preview"
                srcDoc={docPreviewModal.htmlContent}
                className="w-full h-full min-h-[680px] bg-white rounded-lg shadow-md border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
