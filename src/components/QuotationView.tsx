import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileCheck, Home, Users, FileText, ClipboardList, LogIn, Lock, Mail, 
  Hash, Key, CheckCircle, Search, Plus, Trash2, Printer, Save, Download, 
  RotateCcw, Eye, ShieldCheck, DollarSign, ChevronRight, Edit, X, HelpCircle,
  Building, Phone, Calendar, ArrowRight, AlertCircle, ExternalLink, Check,
  Percent, ArrowUpRight, Clock, Star, Copy, MousePointer, Undo, Redo, FilePlus, Sliders, Upload,
  UserPlus, UserCheck, Contact
} from 'lucide-react';
import { CustomerRecord, QuotationRecord, ContactPerson, INITIAL_CUSTOMERS, INITIAL_QUOTATIONS } from '../customerData';
import { printHtml, downloadPdfFromHtml } from './PrintHelper';
import QuotationRecordsComponent from './QuotationRecordsComponent';
import { getActiveCompany, getCompanyProfile, isMarineFastenersCompany, getCompanyIsoText, CompanyProfile } from '../utils/companyProfile';
import { syncCustomerToAllDatabases } from '../utils/customerSupplierSync';

// --- LOGO SVG DEFINITIONS FOR PRINT PDF & PREVIEW ---
const COMPANY_LOGO_SVG_HTML = `
<svg viewBox="0 0 340 125" xmlns="http://www.w3.org/2000/svg" style="width: 120px; height: auto; max-height: 52px;">
  <defs>
    <linearGradient id="mfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#f1f5f9"/>
      <stop offset="70%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>
  <g transform="skewX(-14)">
    <path d="M12,28 L62,32 L28,36 Z" fill="#0f172a"/>
    <path d="M8,40 L65,44 L22,48 Z" fill="#0f172a"/>
    <path d="M5,52 L68,56 L18,60 Z" fill="#0f172a"/>
    <path d="M2,64 L72,68 L14,72 Z" fill="#0f172a"/>
    <path d="M5,76 L75,80 L20,84 Z" fill="#0f172a"/>
    <path d="M10,88 L78,92 L25,95 Z" fill="#0f172a"/>
    <text x="50" y="92" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="92" fill="#0f172a" stroke="#0f172a" stroke-width="12" stroke-linejoin="miter" letter-spacing="-5">MF</text>
    <text x="50" y="92" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="92" fill="url(#mfGrad)" stroke="#334155" stroke-width="2" letter-spacing="-5">MF</text>
    <rect x="46" y="90" width="182" height="22" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" rx="1"/>
    <text x="137" y="105" font-family="Arial, sans-serif" font-weight="bold" font-style="italic" font-size="12" fill="#0f172a" text-anchor="middle" letter-spacing="0.5">MARINE FASTENERS</text>
  </g>
</svg>
`;

const IAF_LOGO_SVG_HTML = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 30px; height: 30px; display: inline-block;">
  <circle cx="50" cy="50" r="48" fill="#0b417d"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-width="1.2"/>
  <path id="iafArcTop" d="M 10 50 A 40 40 0 0 1 90 50" fill="none"/>
  <text font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">
    <textPath href="#iafArcTop" startOffset="50%" text-anchor="middle">MEMBER OF MULTILATERAL</textPath>
  </text>
  <path id="iafArcBot" d="M 90 50 A 40 40 0 0 1 10 50" fill="none"/>
  <text font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">
    <textPath href="#iafArcBot" startOffset="50%" text-anchor="middle">RECOGNITION ARRANGEMENT</textPath>
  </text>
  <circle cx="50" cy="50" r="27" fill="#1d61ab" stroke="#ffffff" stroke-width="0.8"/>
  <ellipse cx="50" cy="50" rx="27" ry="11" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.7"/>
  <ellipse cx="50" cy="50" rx="11" ry="27" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.7"/>
  <line x1="23" y1="50" x2="77" y2="50" stroke="#ffffff" stroke-width="0.7" opacity="0.7"/>
  <text x="50" y="58" font-family="'Arial Black', sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="1">IAF</text>
</svg>
`;

const EIAC_LOGO_SVG_HTML = `
<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" style="width: 42px; height: 28px; display: inline-block;">
  <text x="2" y="28" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="26" fill="#00569d" letter-spacing="-1">eiac</text>
  <circle cx="45" cy="10" r="2.8" fill="#00569d"/>
  <text x="118" y="38" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#003865" text-anchor="end">مركز الإمارات العالمي للاعتماد</text>
  <text x="118" y="48" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#444444" text-anchor="end">Emirates International Accreditation Centre</text>
  <text x="118" y="58" font-family="Arial, sans-serif" font-size="4.5" font-weight="bold" fill="#00569d" text-anchor="end">CB-QMS-099</text>
</svg>
`;

const getVeritasLogoSvg = (isoCode: string) => {
  const safeId = isoCode.replace(/[^a-zA-Z0-9]/g, '');
  return `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px; display: inline-block;">
    <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0b417d" stroke-width="2.2"/>
    <circle cx="50" cy="50" r="42" fill="#0b417d"/>
    <circle cx="50" cy="50" r="38" fill="#ffffff"/>
    <path d="M50,15 L64,22 V38 C64,49 50,58 50,58 C50,58 36,49 36,38 V22 Z" fill="#0b417d"/>
    <path d="M43,35 L48,40 L57,28" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="vArc_${safeId}" d="M 14 50 A 36 36 0 0 1 86 50" fill="none"/>
    <text font-family="Arial, sans-serif" font-size="4.8" font-weight="bold" fill="#0b417d">
      <textPath href="#vArc_${safeId}" startOffset="50%" text-anchor="middle">VERITAS ASSURANCE</textPath>
    </text>
    <text x="50" y="74" font-family="Arial, sans-serif" font-size="5.2" font-weight="bold" fill="#0b417d" text-anchor="middle">${isoCode}</text>
    <text x="50" y="82" font-family="Arial, sans-serif" font-size="4.2" font-weight="bold" fill="#e25810" text-anchor="middle">REGISTERED</text>
  </svg>
  `;
};

interface QuotationItem {
  id: string;
  sn: number;
  description: string;
  finish: string;
  unit: string;
  qty: number | string;
  unitPrice: number | string;
  unitWeight?: number | string;
  totalWeight?: number;
  extPrice?: number;
  discount?: number | string;
  totalExclVat?: number;
  amount: number;
  taxAmount: number;
  netAmount: number;
}

interface QuotationViewProps {
  currentUser?: any;
  triggerToast?: (msg: string) => void;
  onNavigate?: (tab: string) => void;
}

export default function QuotationView({ currentUser, triggerToast, onNavigate }: QuotationViewProps) {
  // Authentication State for Quotation Module
  const [quotationAuth, setQuotationAuth] = useState<any>(() => {
    if (currentUser) return currentUser;
    const saved = localStorage.getItem('mf_quotation_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (currentUser && !quotationAuth) {
      setQuotationAuth(currentUser);
    }
  }, [currentUser]);

  // Login Form States (Matching ERP Login screenshot)
  const [loginUniqueId, setLoginUniqueId] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Sub-Tab Navigation: Home, Customer, Quotation, Records
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'customer' | 'quotation' | 'records'>('home');

  // Quotation Document View Modal State
  const [previewModalQuote, setPreviewModalQuote] = useState<QuotationRecord | null>(null);
  const [openedFromRecords, setOpenedFromRecords] = useState<boolean>(false);

  // Month filter for Records
  const [recordMonthFilter, setRecordMonthFilter] = useState<string>('June');
  const [recordsSearchQuery, setRecordsSearchQuery] = useState('');

  // Master Data Stores
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem('mf_customers_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CUSTOMERS;
  });

  const [quotationRecords, setQuotationRecords] = useState<QuotationRecord[]>(() => {
    const saved = localStorage.getItem('mf_quotations_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_QUOTATIONS;
  });

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('mf_customers_list', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    const handleSyncCustomers = () => {
      const saved = localStorage.getItem('mf_customers_list');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCustomers(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleSyncCustomers);
    window.addEventListener('mf_customers_updated', handleSyncCustomers);
    window.addEventListener('mfi_customers_updated', handleSyncCustomers);
    window.addEventListener('erp_customer_updated', handleSyncCustomers);
    return () => {
      window.removeEventListener('storage', handleSyncCustomers);
      window.removeEventListener('mf_customers_updated', handleSyncCustomers);
      window.removeEventListener('mfi_customers_updated', handleSyncCustomers);
      window.removeEventListener('erp_customer_updated', handleSyncCustomers);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('mf_quotations_list', JSON.stringify(quotationRecords));
  }, [quotationRecords]);

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUniqueId.trim() || !loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter Unique ID, Email, and Password');
      return;
    }

    const authUser = {
      uniqueId: loginUniqueId.trim().toUpperCase(),
      email: loginEmail.trim().toLowerCase(),
      name: loginEmail.split('@')[0].toUpperCase(),
      role: 'Sales Manager',
      loginTime: new Date().toISOString()
    };

    setQuotationAuth(authUser);
    if (staySignedIn) {
      localStorage.setItem('mf_quotation_auth', JSON.stringify(authUser));
    }
    if (triggerToast) triggerToast(`Logged in successfully as ${authUser.name}`);
  };

  const handleQuickDemoLogin = (name: string, email: string, uid: string) => {
    const authUser = {
      uniqueId: uid,
      email: email,
      name: name,
      role: 'Sales Executive',
      loginTime: new Date().toISOString()
    };
    setQuotationAuth(authUser);
    localStorage.setItem('mf_quotation_auth', JSON.stringify(authUser));
    if (triggerToast) triggerToast(`Quick logged in as ${name}`);
  };

  const handleLogout = () => {
    setQuotationAuth(null);
    localStorage.removeItem('mf_quotation_auth');
    if (triggerToast) triggerToast('Logged out of Quotation Module');
  };

  // --- QUOTATION GENERATOR FORM STATES ---
  const [quotationDate, setQuotationDate] = useState('24-Jul-26');
  const [quotationRefNum, setQuotationRefNum] = useState('MFI:J-0719/07/2026');
  const [rfqNo, setRfqNo] = useState('IND-SEI-SH-26-102');
  const [rfqDate, setRfqDate] = useState('23-Jul-26');
  const [tenderNo, setTenderNo] = useState('');
  const [tenderDate, setTenderDate] = useState('');
  const [sAcc, setSAcc] = useState('FHM');
  const [offerValidity, setOfferValidity] = useState('5 Days from the date of quotation');

  // Client Info
  const [clientName, setClientName] = useState('Super Engineering Industry L.L.C');
  const [clientAddress, setClientAddress] = useState('I Cad-1, Musaffah M41, Abu Dhabi, UAE');
  const [clientPoBox, setClientPoBox] = useState('9050');
  const [clientPhone, setClientPhone] = useState('+971 2 550 1366');
  const [clientTrn, setClientTrn] = useState('100046686000003');

  // Purchaser Contact Info
  const [purchaserContactPerson, setPurchaserContactPerson] = useState('Mr. G Mohammed Irfan');
  const [purchaserDesignation, setPurchaserDesignation] = useState('Procurement');
  const [purchaserPhone, setPurchaserPhone] = useState('+971 2 550 1366');
  const [purchaserMobile, setPurchaserMobile] = useState('+971 55 224 6344');
  const [purchaserEmail, setPurchaserEmail] = useState('store@SuperEng.ae');

  // Commercial Terms
  const [deliveryMood, setDeliveryMood] = useState('By Road');
  const [deliveryTerms, setDeliveryTerms] = useState('Ex Works');
  const [deliveryLeadTime, setDeliveryLeadTime] = useState('3-4 Working Days');
  const [paymentTerms, setPaymentTerms] = useState('Standard TT');
  const [packingMood, setPackingMood] = useState('Standard');
  const [currency, setCurrency] = useState('AED');
  const [madeIn, setMadeIn] = useState('U.A.E.');
  const [hsCode, setHsCode] = useState('73181500');

  // Seller Details
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);
  const [sellerCompany, setSellerCompany] = useState(() => getActiveCompany().name);
  const [sellerCorporateTrn, setSellerCorporateTrn] = useState('100440509600001');
  const [sellerVatTrn, setSellerVatTrn] = useState(() => getActiveCompany().trn);

  useEffect(() => {
    const handleCompanyUpdate = () => {
      const active = getActiveCompany();
      setActiveCompany(active);
      setSellerCompany(active.name);
      setSellerVatTrn(active.trn);
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

  // Customer List View Mode: 'list' | 'tiles'
  const [customerViewMode, setCustomerViewMode] = useState<'list' | 'tiles'>('list');

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Print Margin & Page Layout System
  const [printTopMargin, setPrintTopMargin] = useState<number>(5);
  const [printBottomMargin, setPrintBottomMargin] = useState<number>(5);
  const [printSideMargin, setPrintSideMargin] = useState<number>(7);
  const [printPage2TopGap, setPrintPage2TopGap] = useState<number>(0); // Gap for Page 2 / subsequent pages (default 0 for minimal gap)
  const [printItemsCount, setPrintItemsCount] = useState<number>(0); // 0 = All items

  // Totals adjustments
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [freightAmount, setFreightAmount] = useState<number>(0);

  // Sales Executive Info
  const [salesExecName, setSalesExecName] = useState('Mr. Fahim');
  const [salesExecTitle, setSalesExecTitle] = useState('Sales Executive');
  const [salesExecMobile, setSalesExecMobile] = useState('+971-52-3627048 / 056-4857501');
  const [salesExecPhone, setSalesExecPhone] = useState('+971-6-5250526');
  const [salesExecEmail, setSalesExecEmail] = useState('sales@marinefasteners.co');

  // Customer Registration Modal State
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerModalForm, setCustomerModalForm] = useState({
    companyName: '',
    address: '',
    poBox: '',
    trn: '',
    phone: '',
    contactPerson: '',
    designation: 'Procurement Specialist',
    email: '',
    mobile: '',
    directPhone: ''
  });

  // Purchaser Add Modal State
  const [isAddPurchaserModalOpen, setIsAddPurchaserModalOpen] = useState(false);
  const [targetCustomerForPurchaser, setTargetCustomerForPurchaser] = useState<CustomerRecord | null>(null);
  const [purchaserModalForm, setPurchaserModalForm] = useState({
    name: '',
    code: '',
    designation: 'Procurement / Buyer',
    email: '',
    mobile: '',
    phone: ''
  });

  // Active user and role identification
  const activeUser = currentUser || quotationAuth;
  const isAdmin = !activeUser || activeUser.role === 'Admin';
  const isViewer = activeUser?.role === 'Viewer';
  const isEditor = activeUser?.role === 'Editor';

  // Check if a customer is assigned/owned by the logged-in user
  const isCustomerOwnedByUser = (c: CustomerRecord): boolean => {
    if (isAdmin) return true;
    if (!activeUser) return true;

    const userKeywords = [
      activeUser.firstName,
      activeUser.secondName,
      `${activeUser.firstName || ''} ${activeUser.secondName || ''}`.trim(),
      activeUser.uniqueId,
      activeUser.email,
      activeUser.position
    ].filter(Boolean).map(k => String(k).toLowerCase());

    const cSeller = (c.assignedSeller || c.seller || '').toLowerCase();
    if (cSeller) {
      return userKeywords.some(keyword => keyword && (cSeller.includes(keyword) || keyword.includes(cSeller)));
    }
    return false;
  };

  // Visible customers isolated by active company and scoped by seller/user (Seller views his customers only)
  const visibleCustomers = useMemo(() => {
    const isMfi = isMarineFastenersCompany(activeCompany);
    return customers.filter(c => {
      const companyMatch = isMfi 
        ? (!c.companyId || c.companyId === 'comp-mfi')
        : (c.companyId === activeCompany.id);
      if (!companyMatch) return false;

      // Scoping: seller can view only his mentioned customer
      if (!isAdmin && !isCustomerOwnedByUser(c)) {
        return false;
      }
      return true;
    });
  }, [customers, activeCompany, isAdmin, activeUser]);

  // Filtered customer directory with search support across name, TRN, contact, email, phone, etc.
  const filteredCustomerDirectory = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return visibleCustomers;
    return visibleCustomers.filter(c => {
      const compMatch = (c.companyName || '').toLowerCase().includes(q);
      const trnMatch = (c.trn || '').toLowerCase().includes(q);
      const addrMatch = (c.address || '').toLowerCase().includes(q) || (c.poBox || '').toLowerCase().includes(q);
      const contactMatch = (c.contactPerson || '').toLowerCase().includes(q) || (c.designation || '').toLowerCase().includes(q);
      const emailMatch = (c.email || '').toLowerCase().includes(q);
      const phoneMatch = (c.phone || '').toLowerCase().includes(q) || (c.mobile || '').toLowerCase().includes(q);
      const sellerMatch = (c.assignedSeller || c.seller || '').toLowerCase().includes(q);
      const concernMatch = (c.concernPersons || []).some(cp => 
        (cp.name || '').toLowerCase().includes(q) ||
        (cp.email || '').toLowerCase().includes(q) ||
        (cp.mobile || '').toLowerCase().includes(q) ||
        (cp.designation || '').toLowerCase().includes(q)
      );
      return compMatch || trnMatch || addrMatch || contactMatch || emailMatch || phoneMatch || sellerMatch || concernMatch;
    });
  }, [visibleCustomers, customerSearchQuery]);

  // Active matched customer in Quotation Form based on current clientName
  const activeMatchedCustomer = visibleCustomers.find(c =>
    c.companyName.toLowerCase().trim() === clientName.toLowerCase().trim() ||
    (c.trn && clientTrn && c.trn.trim() === clientTrn.trim())
  );

  // Handle Client Registration with Company Name + TRN Matching Logic
  const handleRegisterOrUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerModalForm.companyName.trim()) {
      if (triggerToast) triggerToast('Please enter company name');
      return;
    }

    const currentSellerName = activeUser 
      ? (`${activeUser.firstName || ''} ${activeUser.secondName || ''}`.trim() || activeUser.uniqueId || activeUser.firstName || 'SELLER')
      : (sAcc || 'ADMIN');

    const normalizedComp = customerModalForm.companyName.toLowerCase().trim();
    const normalizedTrn = customerModalForm.trn.trim();

    // Check if client already exists by Company Name AND/OR TRN
    const existingIdx = customers.findIndex(c => {
      const sameName = c.companyName.toLowerCase().trim() === normalizedComp;
      const sameTrn = normalizedTrn && c.trn && c.trn.trim() === normalizedTrn;
      return (sameName && sameTrn) || sameName || (Boolean(normalizedTrn) && Boolean(sameTrn));
    });

    const newContact: ContactPerson = {
      id: `cp-${Date.now()}`,
      name: customerModalForm.contactPerson.trim() || 'Procurement Contact',
      designation: customerModalForm.designation.trim() || 'Procurement',
      email: customerModalForm.email.trim() || '',
      mobile: customerModalForm.mobile.trim() || '',
      phone: customerModalForm.directPhone.trim() || customerModalForm.phone.trim() || ''
    };

    if (existingIdx >= 0) {
      // Company and/or TRN matches existing client! Update client and register contact person
      const existing = customers[existingIdx];
      const currentConcern = existing.concernPersons && existing.concernPersons.length > 0
        ? [...existing.concernPersons]
        : [{
            id: 'cp-primary',
            name: existing.contactPerson || customerModalForm.contactPerson.trim() || 'Procurement Contact',
            designation: existing.designation || customerModalForm.designation.trim() || 'Procurement',
            email: existing.email || customerModalForm.email.trim() || '',
            mobile: existing.mobile || customerModalForm.mobile.trim() || '',
            phone: existing.phone || customerModalForm.directPhone.trim() || customerModalForm.phone.trim() || ''
          }];

      const personExists = currentConcern.some(cp => cp.name.toLowerCase().trim() === newContact.name.toLowerCase().trim());
      const updatedConcern = personExists ? currentConcern : [...currentConcern, newContact];

      const updatedCust: CustomerRecord = {
        ...existing,
        companyName: customerModalForm.companyName.trim() || existing.companyName,
        address: customerModalForm.address.trim() || existing.address,
        poBox: customerModalForm.poBox.trim() || existing.poBox,
        phone: customerModalForm.phone.trim() || existing.phone,
        trn: customerModalForm.trn.trim() || existing.trn,
        companyId: existing.companyId || activeCompany.id,
        assignedSeller: existing.assignedSeller || existing.seller || currentSellerName,
        seller: existing.seller || existing.assignedSeller || currentSellerName,
        concernPersons: updatedConcern
      };

      const nextList = [...customers];
      nextList[existingIdx] = updatedCust;
      setCustomers(nextList);
      localStorage.setItem('mf_customers_list', JSON.stringify(nextList));

      // Global ERP sync
      syncCustomerToAllDatabases({
        id: updatedCust.id,
        companyName: updatedCust.companyName,
        trn: updatedCust.trn,
        address: updatedCust.address,
        poBox: updatedCust.poBox,
        phone: updatedCust.phone,
        email: customerModalForm.email || updatedCust.email,
        mobile: customerModalForm.mobile || updatedCust.mobile,
        contactPerson: customerModalForm.contactPerson || updatedCust.contactPerson,
        designation: customerModalForm.designation || updatedCust.designation,
        seller: currentSellerName,
        companyId: activeCompany.id
      });

      setIsAddCustomerModalOpen(false);

      if (triggerToast) {
        triggerToast(`Matched existing client (Company & TRN: ${existing.trn || 'Yes'}). Contact person "${newContact.name}" registered to ${existing.companyName}!`);
      }
    } else {
      // New Client registration
      const newCust: CustomerRecord = {
        id: `cust-${Date.now()}`,
        companyName: customerModalForm.companyName.trim(),
        address: customerModalForm.address.trim() || 'UAE',
        poBox: customerModalForm.poBox.trim() || '',
        trn: customerModalForm.trn.trim() || '',
        phone: customerModalForm.phone.trim() || '',
        contactPerson: customerModalForm.contactPerson.trim() || 'Procurement Officer',
        designation: customerModalForm.designation.trim() || 'Procurement',
        email: customerModalForm.email.trim() || '',
        mobile: customerModalForm.mobile.trim() || '',
        companyId: activeCompany.id || 'comp-mfi',
        assignedSeller: currentSellerName,
        seller: currentSellerName,
        concernPersons: [newContact]
      };
      const nextList = [newCust, ...customers];
      setCustomers(nextList);
      localStorage.setItem('mf_customers_list', JSON.stringify(nextList));

      // Global ERP sync
      syncCustomerToAllDatabases({
        id: newCust.id,
        companyName: newCust.companyName,
        trn: newCust.trn,
        address: newCust.address,
        poBox: newCust.poBox,
        phone: newCust.phone,
        email: newCust.email,
        mobile: newCust.mobile,
        contactPerson: newCust.contactPerson,
        designation: newCust.designation,
        seller: currentSellerName,
        companyId: activeCompany.id
      });

      setIsAddCustomerModalOpen(false);
      if (triggerToast) triggerToast(`Successfully registered new client: ${newCust.companyName}`);
    }
  };

  // Handle adding more purchaser to a specific client
  const handleSavePurchaserToCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomerForPurchaser) return;
    if (!purchaserModalForm.name.trim()) {
      if (triggerToast) triggerToast('Please enter purchaser contact name');
      return;
    }

    const newContact: ContactPerson = {
      id: `cp-${Date.now()}`,
      name: purchaserModalForm.name.trim(),
      code: purchaserModalForm.code.trim() || undefined,
      designation: purchaserModalForm.designation.trim() || 'Procurement',
      email: purchaserModalForm.email.trim() || '',
      mobile: purchaserModalForm.mobile.trim() || '',
      phone: purchaserModalForm.phone.trim() || targetCustomerForPurchaser.phone || ''
    };

    const custIdx = customers.findIndex(c => c.id === targetCustomerForPurchaser.id);
    if (custIdx >= 0) {
      const existing = customers[custIdx];
      const currentConcern = existing.concernPersons && existing.concernPersons.length > 0
        ? [...existing.concernPersons]
        : [{
            id: 'cp-primary',
            name: existing.contactPerson,
            designation: existing.designation,
            email: existing.email,
            mobile: existing.mobile,
            phone: existing.phone
          }];

      const updatedCust: CustomerRecord = {
        ...existing,
        concernPersons: [...currentConcern, newContact]
      };

      const nextList = [...customers];
      nextList[custIdx] = updatedCust;
      setCustomers(nextList);
      localStorage.setItem('mf_customers_list', JSON.stringify(nextList));

      // Global ERP sync
      syncCustomerToAllDatabases({
        id: updatedCust.id,
        companyName: updatedCust.companyName,
        trn: updatedCust.trn,
        address: updatedCust.address,
        poBox: updatedCust.poBox,
        phone: updatedCust.phone,
        email: newContact.email || updatedCust.email,
        mobile: newContact.mobile || updatedCust.mobile,
        contactPerson: newContact.name,
        designation: newContact.designation,
        seller: updatedCust.assignedSeller || updatedCust.seller,
        companyId: activeCompany.id
      });

      // If this customer is currently active in the quotation form, update purchaser fields too
      if (clientName.toLowerCase().trim() === existing.companyName.toLowerCase().trim()) {
        setPurchaserContactPerson(newContact.name);
        setPurchaserDesignation(newContact.designation);
        setPurchaserEmail(newContact.email);
        setPurchaserMobile(newContact.mobile);
        if (newContact.phone) setPurchaserPhone(newContact.phone);
      }

      setIsAddPurchaserModalOpen(false);
      if (triggerToast) triggerToast(`Added purchaser "${newContact.name}" to ${existing.companyName}!`);
    }
  };

  // Auto-Suggest dropdown state for Client Company Name
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const clientInputContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientInputContainerRef.current && !clientInputContainerRef.current.contains(event.target as Node)) {
        setShowClientSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notes Clauses
  const [notesList, setNotesList] = useState<string[]>([
    '5% Vat to be charged Extra for local Sales and overseas if export Bayan unable to provide!',
    'Offered rates are based on a complete closed order only.',
    'Availability subject to prior sales.',
    'BS EN 10204,3.1 Material Test Certificates shall be given.',
    'Any Repeated Order on Old supplied price,subject to prior approval!'
  ]);

  // Line items state
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'q-item-1',
      sn: 1,
      description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 40MM',
      finish: 'HDG',
      unit: 'SETS',
      qty: 20,
      unitPrice: 1.90,
      unitWeight: 0.18,
      totalWeight: 3.60,
      amount: 38.00,
      taxAmount: 1.90,
      netAmount: 39.90
    },
    {
      id: 'q-item-2',
      sn: 2,
      description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 45MM',
      finish: 'HDG',
      unit: 'SETS',
      qty: 80,
      unitPrice: 2.05,
      unitWeight: 0.20,
      totalWeight: 16.00,
      amount: 164.00,
      taxAmount: 8.20,
      netAmount: 172.20
    },
    {
      id: 'q-item-3',
      sn: 3,
      description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 50MM',
      finish: 'HDG',
      unit: 'SETS',
      qty: 250,
      unitPrice: 2.10,
      unitWeight: 0.22,
      totalWeight: 55.00,
      amount: 525.00,
      taxAmount: 26.25,
      netAmount: 551.25
    },
    {
      id: 'q-item-4',
      sn: 4,
      description: 'GRADE 8.8 HEX BOLT, M16 X 70MM',
      finish: 'HDG',
      unit: 'PCS',
      qty: 20,
      unitPrice: 1.80,
      unitWeight: 0.15,
      totalWeight: 3.00,
      amount: 36.00,
      taxAmount: 1.80,
      netAmount: 37.80
    },
    {
      id: 'q-item-5',
      sn: 5,
      description: 'GRADE 8.8 HEX BOLT, M16 X 50MM',
      finish: 'HDG',
      unit: 'PCS',
      qty: 50,
      unitPrice: 1.45,
      unitWeight: 0.12,
      totalWeight: 6.00,
      amount: 72.50,
      taxAmount: 3.63,
      netAmount: 76.13
    },
    {
      id: 'q-item-6',
      sn: 6,
      description: 'GRADE 8.8 HEX BOLT WITH 1 WASHER, M20 X 45MM',
      finish: 'HDG',
      unit: 'SETS',
      qty: 30,
      unitPrice: 2.60,
      unitWeight: 0.35,
      totalWeight: 10.50,
      amount: 78.00,
      taxAmount: 3.90,
      netAmount: 81.90
    }
  ]);

  // Create New Blank Quotation
  const handleCreateNewQuotation = () => {
    const newSeq = String(Math.floor(1000 + Math.random() * 9000));
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = monthNames[now.getMonth()];
    const yearNum = now.getFullYear();
    const monthMM = String(now.getMonth() + 1).padStart(2, '0');
    const newRef = `MFI:J-${newSeq}/${monthMM}/${yearNum}`;

    setQuotationRefNum(newRef);
    setQuotationDate(`${day}-${monthStr}-${yearNum.toString().slice(-2)}`);
    setRfqNo('');
    setRfqDate(`${day}-${monthStr}-${yearNum.toString().slice(-2)}`);
    setTenderNo('');
    setTenderDate('');

    // Reset Client Company Details to BLANK
    setClientName('');
    setClientAddress('');
    setClientPoBox('');
    setClientPhone('');
    setClientTrn('');

    // Reset Purchaser Details to BLANK
    setPurchaserContactPerson('');
    setPurchaserDesignation('');
    setPurchaserPhone('');
    setPurchaserMobile('');
    setPurchaserEmail('');

    // Reset Line items to 1 empty row
    setItems([{
      id: `q-item-${Date.now()}`,
      sn: 1,
      description: '',
      finish: 'HDG',
      unit: 'PCS',
      qty: '',
      unitPrice: '',
      unitWeight: '',
      extPrice: 0,
      discount: '',
      totalExclVat: 0,
      amount: 0,
      taxAmount: 0,
      netAmount: 0
    }]);

    setDiscountAmount(0);
    setFreightAmount(0);

    if (triggerToast) triggerToast('New blank quotation table created! Client Name is now blank.');
  };

  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowIndex: number } | null>(null);

  // Undo / Redo history state
  const [pastItems, setPastItems] = useState<QuotationItem[][]>([]);
  const [futureItems, setFutureItems] = useState<QuotationItem[][]>([]);

  // Cell range selection state (Excel style)
  interface CellCoord {
    row: number;
    col: number;
  }

  interface CellRange {
    anchor: CellCoord;
    focus: CellCoord;
  }

  const [selectedCellRange, setSelectedCellRange] = useState<CellRange | null>(null);

  // Refs for accurate event handling in keydown listeners
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const pastItemsRef = useRef(pastItems);
  pastItemsRef.current = pastItems;
  const futureItemsRef = useRef(futureItems);
  futureItemsRef.current = futureItems;
  const selectedRowIdsRef = useRef(selectedRowIds);
  selectedRowIdsRef.current = selectedRowIds;
  const selectedCellRangeRef = useRef(selectedCellRange);
  selectedCellRangeRef.current = selectedCellRange;

  const isShiftNavigatingRef = useRef(false);
  const isMouseDownCellRef = useRef(false);

  const editingCellOriginalItemsRef = useRef<QuotationItem[] | null>(null);

  const pushToHistory = (currentItemsState: QuotationItem[]) => {
    setPastItems(prev => [...prev.slice(-49), JSON.parse(JSON.stringify(currentItemsState))]);
    setFutureItems([]);
  };

  const handleUndo = () => {
    if (pastItemsRef.current.length === 0) {
      if (triggerToast) triggerToast('Nothing to undo');
      return;
    }
    const previousState = pastItemsRef.current[pastItemsRef.current.length - 1];
    const newPast = pastItemsRef.current.slice(0, pastItemsRef.current.length - 1);
    setFutureItems(prev => [JSON.parse(JSON.stringify(itemsRef.current)), ...prev]);
    setPastItems(newPast);
    setItems(previousState);
    if (triggerToast) triggerToast('Undo applied!');
  };

  const handleRedo = () => {
    if (futureItemsRef.current.length === 0) {
      if (triggerToast) triggerToast('Nothing to redo');
      return;
    }
    const nextState = futureItemsRef.current[0];
    const newFuture = futureItemsRef.current.slice(1);
    setPastItems(prev => [...prev, JSON.parse(JSON.stringify(itemsRef.current))]);
    setFutureItems(newFuture);
    setItems(nextState);
    if (triggerToast) triggerToast('Redo applied!');
  };

  const deleteSelectedCellsData = () => {
    const range = selectedCellRangeRef.current || selectedCellRange;
    if (!range) return;
    const minRow = Math.min(range.anchor.row, range.focus.row);
    const maxRow = Math.max(range.anchor.row, range.focus.row);
    const minCol = Math.min(range.anchor.col, range.focus.col);
    const maxCol = Math.max(range.anchor.col, range.focus.col);

    pushToHistory(itemsRef.current);
    setItems(prev => prev.map((item, rIdx) => {
      if (rIdx < minRow || rIdx > maxRow) return item;
      const updated = { ...item };
      for (let c = minCol; c <= maxCol; c++) {
        const field = COLUMN_SEQUENCE[c];
        if (['description', 'finish', 'unit', 'qty', 'unitPrice', 'unitWeight', 'discount'].includes(field)) {
          (updated as any)[field] = '';
        }
      }
      const qty = Number(updated.qty) || 0;
      const uPrice = Number(updated.unitPrice) || 0;
      const uWeight = Number(updated.unitWeight) || 0;
      const totalWeight = Number((qty * uWeight).toFixed(3));
      const extPrice = qty * uPrice;
      const disc = Number(updated.discount) || 0;
      const totalExclVat = Math.max(0, extPrice - disc);
      const tax = totalExclVat * 0.05;
      const net = totalExclVat + tax;

      return {
        ...updated,
        totalWeight,
        extPrice: Number(extPrice.toFixed(2)),
        totalExclVat: Number(totalExclVat.toFixed(2)),
        amount: Number(totalExclVat.toFixed(2)),
        taxAmount: Number(tax.toFixed(2)),
        netAmount: Number(net.toFixed(2))
      };
    }));
    if (triggerToast) triggerToast('Cleared cell data in selection!');
  };

  const COLUMN_SEQUENCE: string[] = [
    'sn',
    'description',
    'finish',
    'unit',
    'qty',
    'unitPrice',
    'extPrice',
    'unitWeight',
    'totalWeight',
    'discount',
    'totalExcl',
    'vat',
    'total'
  ];

  const getCellValue = (r: number, f: string): string => {
    const item = items[r];
    if (!item) return '';
    const q = Number(item.qty) || 0;
    const up = Number(item.unitPrice) || 0;
    const uw = Number(item.unitWeight) || 0;
    const tw = q * uw;
    const ext = q * up;
    const disc = Number(item.discount) || 0;
    const totalExcl = Math.max(0, ext - disc);
    const vat = totalExcl * 0.05;
    const tot = totalExcl + vat;

    switch (f) {
      case 'sn':
        return String(item.sn || r + 1);
      case 'description':
        return item.description || '';
      case 'finish':
        return item.finish || '';
      case 'unit':
        return item.unit || '';
      case 'qty':
        return item.qty !== undefined && item.qty !== '' ? String(item.qty) : '';
      case 'unitPrice':
        return item.unitPrice !== undefined && item.unitPrice !== '' ? String(item.unitPrice) : '';
      case 'extPrice':
        return ext ? ext.toFixed(2) : '0.00';
      case 'unitWeight':
        return item.unitWeight !== undefined && item.unitWeight !== '' ? String(item.unitWeight) : '';
      case 'totalWeight':
        return tw ? tw.toFixed(2) : '0.00';
      case 'discount':
        return item.discount !== undefined && item.discount !== '' ? String(item.discount) : '';
      case 'totalExcl':
        return totalExcl ? totalExcl.toFixed(2) : '0.00';
      case 'vat':
        return vat ? vat.toFixed(2) : '0.00';
      case 'total':
        return tot ? tot.toFixed(2) : '0.00';
      default:
        return String((item as any)[f] ?? '');
    }
  };

  const getHeaderName = (colKey: string) => {
    switch (colKey) {
      case 'sn': return 'S/L';
      case 'description': return 'ITEM DESCRIPTION';
      case 'finish': return 'FINISH';
      case 'unit': return 'UNIT';
      case 'qty': return 'QTY';
      case 'unitPrice': return 'U. PRICE';
      case 'extPrice': return 'EXT. PRICE';
      case 'unitWeight': return 'U. WEIGHT (KG)';
      case 'totalWeight': return 'T. WEIGHT (KG)';
      case 'discount': return 'DISCOUNT';
      case 'totalExcl': return 'TOTAL EXCL. VAT';
      case 'vat': return `VAT (${currency || 'AED'})`;
      case 'total': return `TOTAL (${currency || 'AED'})`;
      default: return colKey;
    }
  };

  const copyCellRangeToClipboard = () => {
    if (!selectedCellRange) return;
    const minRow = Math.min(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const maxRow = Math.max(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const minCol = Math.min(selectedCellRange.anchor.col, selectedCellRange.focus.col);
    const maxCol = Math.max(selectedCellRange.anchor.col, selectedCellRange.focus.col);

    const lines: string[] = [];
    
    // Header row
    const headerCells: string[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      headerCells.push(getHeaderName(COLUMN_SEQUENCE[c]));
    }
    lines.push(headerCells.join('\t'));

    // Data rows
    for (let r = minRow; r <= maxRow; r++) {
      const rowCells: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        rowCells.push(getCellValue(r, COLUMN_SEQUENCE[c]));
      }
      lines.push(rowCells.join('\t'));
    }

    navigator.clipboard.writeText(lines.join('\n'));
    if (triggerToast) triggerToast('Copied selected cells including table header!');
  };

  const updateCellSelection = (
    isShift: boolean,
    currentRow: number,
    currentCol: number,
    nextRow: number,
    nextCol: number
  ) => {
    if (isShift) {
      isShiftNavigatingRef.current = true;
      setSelectedCellRange(prev => {
        const anchor = prev ? prev.anchor : { row: currentRow, col: currentCol };
        return {
          anchor,
          focus: { row: nextRow, col: nextCol }
        };
      });
    } else {
      isShiftNavigatingRef.current = false;
      setSelectedCellRange({
        anchor: { row: nextRow, col: nextCol },
        focus: { row: nextRow, col: nextCol }
      });
    }
  };

  const isCellInSelectedRange = (row: number, col: number) => {
    if (!selectedCellRange) return false;
    const minRow = Math.min(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const maxRow = Math.max(selectedCellRange.anchor.row, selectedCellRange.focus.row);
    const minCol = Math.min(selectedCellRange.anchor.col, selectedCellRange.focus.col);
    const maxCol = Math.max(selectedCellRange.anchor.col, selectedCellRange.focus.col);

    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const isCellAnchor = (row: number, col: number) => {
    if (!selectedCellRange) return false;
    return selectedCellRange.anchor.row === row && selectedCellRange.anchor.col === col;
  };

  const isMultiCellSelection = () => {
    if (!selectedCellRange) return false;
    return (
      selectedCellRange.anchor.row !== selectedCellRange.focus.row ||
      selectedCellRange.anchor.col !== selectedCellRange.focus.col
    );
  };

  const getInputCellClass = (rowIndex: number, colIndex: number, defaultExtra: string = 'border-slate-300') => {
    if (isCellInSelectedRange(rowIndex, colIndex)) {
      if (isMultiCellSelection()) {
        if (isCellAnchor(rowIndex, colIndex)) {
          return '!bg-white !ring-2 !ring-emerald-600 !border-emerald-600 font-bold z-10 shadow-xs';
        }
        return '!bg-emerald-100/90 !text-emerald-950 !border-emerald-400 font-bold shadow-3xs';
      }
      return '!bg-emerald-50/90 !ring-2 !ring-emerald-600 !border-emerald-600 font-bold z-10 shadow-3xs';
    }
    return defaultExtra;
  };

  // Global keyboard shortcuts (Escape, Delete/Backspace for selected rows or cells, Ctrl+Z/Y for Undo/Redo)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRowIds(new Set());
        setSelectedCellRange(null);
        setContextMenu(null);
        return;
      }

      // Ctrl+Z / Cmd+Z for Undo, Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y for Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Global Delete / Backspace handler when row(s) or cell range are selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeEl = document.activeElement as HTMLElement | null;
        const activeTag = activeEl ? activeEl.tagName.toLowerCase() : '';
        const isEditingInput = activeTag === 'input' || activeTag === 'textarea';
        const isSnOrReadOnly = activeEl && activeEl.id && (
          activeEl.id.startsWith('item-sn-') ||
          activeEl.id.startsWith('item-extPrice-') ||
          activeEl.id.startsWith('item-totalWeight-') ||
          activeEl.id.startsWith('item-totalExcl-') ||
          activeEl.id.startsWith('item-vat-') ||
          activeEl.id.startsWith('item-total-')
        );

        if (selectedRowIdsRef.current.size > 0 && (!isEditingInput || isSnOrReadOnly)) {
          e.preventDefault();
          deleteSelectedRows();
        } else if (selectedCellRangeRef.current || selectedCellRange) {
          const isMultiCell = isMultiCellSelection();
          let isFullySelectedInput = false;
          if (activeEl && activeEl instanceof HTMLInputElement) {
            try {
              if (activeEl.selectionStart === 0 && activeEl.selectionEnd === activeEl.value.length) {
                isFullySelectedInput = true;
              }
            } catch {}
          }

          if (isMultiCell || isSnOrReadOnly || isFullySelectedInput || !isEditingInput || e.key === 'Delete') {
            e.preventDefault();
            deleteSelectedCellsData();
          }
        }
      }
    };

    const handleGlobalClick = () => setContextMenu(null);
    const handleGlobalMouseUp = () => { isMouseDownCellRef.current = false; };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const insertRowAbove = (idx: number) => {
    pushToHistory(items);
    setItems(prev => {
      const next = [...prev];
      const newItem: QuotationItem = {
        id: `q-item-${Date.now()}`,
        sn: idx + 1,
        description: '',
        finish: 'HDG',
        unit: 'PCS',
        qty: '',
        unitPrice: '',
        unitWeight: '',
        extPrice: 0,
        discount: '',
        totalExclVat: 0,
        amount: 0,
        taxAmount: 0,
        netAmount: 0
      };
      next.splice(idx, 0, newItem);
      return next.map((it, i) => ({ ...it, sn: i + 1 }));
    });
    setContextMenu(null);
    if (triggerToast) triggerToast(`Inserted new row above Row #${idx + 1}!`);
  };

  const insertRowBelow = (idx: number) => {
    pushToHistory(items);
    setItems(prev => {
      const next = [...prev];
      const newItem: QuotationItem = {
        id: `q-item-${Date.now()}`,
        sn: idx + 2,
        description: '',
        finish: 'HDG',
        unit: 'PCS',
        qty: '',
        unitPrice: '',
        unitWeight: '',
        extPrice: 0,
        discount: '',
        totalExclVat: 0,
        amount: 0,
        taxAmount: 0,
        netAmount: 0
      };
      next.splice(idx + 1, 0, newItem);
      return next.map((it, i) => ({ ...it, sn: i + 1 }));
    });
    setContextMenu(null);
    if (triggerToast) triggerToast(`Inserted new row below Row #${idx + 1}!`);
  };

  const duplicateRow = (idx: number) => {
    const target = items[idx];
    if (!target) return;
    pushToHistory(items);
    setItems(prev => {
      const next = [...prev];
      const newItem: QuotationItem = {
        ...target,
        id: `q-item-${Date.now()}`,
        sn: idx + 2
      };
      next.splice(idx + 1, 0, newItem);
      return next.map((it, i) => ({ ...it, sn: i + 1 }));
    });
    setContextMenu(null);
    if (triggerToast) triggerToast(`Duplicated Row #${idx + 1}!`);
  };

  const deleteContextMenuRow = (idx: number) => {
    if (items.length <= 1) {
      if (triggerToast) triggerToast('At least one row is required!');
      setContextMenu(null);
      return;
    }
    pushToHistory(items);
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((it, i) => ({ ...it, sn: i + 1 }));
    });
    setSelectedRowIds(new Set());
    setContextMenu(null);
    if (triggerToast) triggerToast(`Deleted Row #${idx + 1}!`);
  };

  const deleteSelectedRows = () => {
    const targetSet = selectedRowIdsRef.current.size > 0 ? selectedRowIdsRef.current : selectedRowIds;
    if (targetSet.size === 0) return;
    pushToHistory(itemsRef.current);
    if (itemsRef.current.length <= targetSet.size) {
      setItems([{
        id: `q-item-${Date.now()}`,
        sn: 1,
        description: '',
        finish: 'HDG',
        unit: 'PCS',
        qty: '',
        unitPrice: '',
        unitWeight: '',
        extPrice: 0,
        discount: '',
        totalExclVat: 0,
        amount: 0,
        taxAmount: 0,
        netAmount: 0
      }]);
    } else {
      const filtered = itemsRef.current.filter(it => !targetSet.has(it.id)).map((it, idx) => ({ ...it, sn: idx + 1 }));
      setItems(filtered);
    }
    setSelectedRowIds(new Set());
    if (triggerToast) triggerToast('Selected row(s) deleted!');
  };

  // Recalculate row amount when qty, price, discount, or unitWeight changes
  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    if (editingCellOriginalItemsRef.current) {
      pushToHistory(editingCellOriginalItemsRef.current);
      editingCellOriginalItemsRef.current = null;
    }
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;

      // Automatically convert leading decimals e.g. .15 -> 0.15, .20 -> 0.20, .22 -> 0.22
      let processedVal = value;
      if (['unitPrice', 'unitWeight', 'discount', 'qty'].includes(field as string)) {
        if (typeof value === 'string' && value.trim().startsWith('.')) {
          processedVal = '0' + value.trim();
        }
      }

      const updated = { ...it, [field]: processedVal };
      
      const qty = Number(updated.qty) || 0;
      const uPrice = Number(updated.unitPrice) || 0;
      const uWeight = Number(updated.unitWeight) || 0;
      const totalWeight = Number((qty * uWeight).toFixed(3));
      const extPrice = qty * uPrice;
      const disc = Number(updated.discount) || 0;
      const totalExclVat = Math.max(0, extPrice - disc);
      const tax = totalExclVat * 0.05;
      const net = totalExclVat + tax;

      return {
        ...updated,
        totalWeight,
        extPrice: Number(extPrice.toFixed(2)),
        discount: updated.discount,
        totalExclVat: Number(totalExclVat.toFixed(2)),
        amount: Number(totalExclVat.toFixed(2)),
        taxAmount: Number(tax.toFixed(2)),
        netAmount: Number(net.toFixed(2))
      };
    }));
  };

  const addItemRow = () => {
    pushToHistory(items);
    const nextSn = items.length + 1;
    const newItem: QuotationItem = {
      id: `q-item-${Date.now()}`,
      sn: nextSn,
      description: '',
      finish: '',
      unit: '',
      qty: '',
      unitPrice: '',
      unitWeight: '',
      extPrice: 0,
      discount: '',
      totalExclVat: 0,
      amount: 0,
      taxAmount: 0,
      netAmount: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItemRow = (id: string) => {
    if (items.length <= 1) return;
    pushToHistory(items);
    const filtered = items.filter(it => it.id !== id).map((it, idx) => ({ ...it, sn: idx + 1 }));
    setItems(filtered);
  };

  // Reference for Excel Table mouse selection
  const tableRef = useRef<HTMLTableElement | null>(null);

  const handleSelectTableForExcel = () => {
    if (tableRef.current) {
      const range = document.createRange();
      range.selectNodeContents(tableRef.current);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      if (triggerToast) triggerToast('Items table selected! You can drag with mouse or press Ctrl+C to copy.');
    }
  };

  const handleCopyTableForExcel = () => {
    const headers = ['S.N.', 'ITEM DESCRIPTION', 'FINISH', 'UNIT', 'QTY', 'U. PRICE', 'EXT. PRICE', 'U. WEIGHT (KG)', 'T. WEIGHT (KG)', 'DISCOUNT', 'TOTAL EXCL. VAT', `VAT (${currency})`, `TOTAL (${currency})`].join('\t');
    const rows = items.map(it => {
      const q = Number(it.qty) || 0;
      const up = Number(it.unitPrice) || 0;
      const uw = Number(it.unitWeight) || 0;
      const tw = q * uw;
      const ext = q * up;
      const disc = Number(it.discount) || 0;
      const totalExcl = Math.max(0, ext - disc);
      const vat = totalExcl * 0.05;
      const tot = totalExcl + vat;
      return [
        it.sn,
        it.description || '',
        it.finish || '',
        it.unit || '',
        q || '',
        up || '',
        ext ? ext.toFixed(2) : '',
        uw || '',
        tw ? tw.toFixed(2) : '',
        disc || '',
        totalExcl ? totalExcl.toFixed(2) : '',
        vat ? vat.toFixed(2) : '',
        tot ? tot.toFixed(2) : ''
      ].join('\t');
    });

    // Summary totals calculation for footer row
    const totalExtPrice = items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0);
    const calcSubtotalAmount = items.reduce((s, it) => {
      const q = Number(it.qty) || 0;
      const up = Number(it.unitPrice) || 0;
      const ext = q * up;
      const disc = Number(it.discount) || 0;
      return s + Math.max(0, ext - disc);
    }, 0);
    const calcTotalTaxAmount = calcSubtotalAmount * 0.05;
    const calcTotalWeightKg = items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.unitWeight) || 0)), 0);
    const calcTotalDiscount = items.reduce((s, it) => s + (Number(it.discount) || 0), 0);
    const calcGrandTotal = calcSubtotalAmount + calcTotalTaxAmount;

    const summaryRow = [
      'TOTAL:',
      '',
      '',
      '',
      '',
      totalExtPrice.toFixed(2),
      totalExtPrice.toFixed(2),
      'TOTAL WT',
      `${calcTotalWeightKg.toFixed(2)} KG`,
      calcTotalDiscount.toFixed(2),
      calcSubtotalAmount.toFixed(2),
      calcTotalTaxAmount.toFixed(2),
      calcGrandTotal.toFixed(2)
    ].join('\t');

    const tsvText = [headers, ...rows, summaryRow].join('\n');

    const htmlTable = `<table border="1" style="border-collapse: collapse;">
      <thead>
        <tr style="background-color: #083c54; color: #ffffff; font-weight: bold;">
          <th>S.N.</th>
          <th>ITEM DESCRIPTION</th>
          <th>FINISH</th>
          <th>UNIT</th>
          <th>QTY</th>
          <th>U. PRICE</th>
          <th>EXT. PRICE</th>
          <th>U. WEIGHT (KG)</th>
          <th>T. WEIGHT (KG)</th>
          <th>DISCOUNT</th>
          <th>TOTAL EXCL. VAT</th>
          <th>VAT (${currency})</th>
          <th>TOTAL (${currency})</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it => {
          const q = Number(it.qty) || 0;
          const up = Number(it.unitPrice) || 0;
          const uw = Number(it.unitWeight) || 0;
          const tw = q * uw;
          const ext = q * up;
          const disc = Number(it.discount) || 0;
          const totalExcl = Math.max(0, ext - disc);
          const vat = totalExcl * 0.05;
          const tot = totalExcl + vat;
          return `<tr>
            <td>${it.sn}</td>
            <td>${it.description || ''}</td>
            <td>${it.finish || ''}</td>
            <td>${it.unit || ''}</td>
            <td>${q || ''}</td>
            <td>${up || ''}</td>
            <td>${ext ? ext.toFixed(2) : ''}</td>
            <td>${uw || ''}</td>
            <td>${tw ? tw.toFixed(2) : ''}</td>
            <td>${disc || ''}</td>
            <td>${totalExcl ? totalExcl.toFixed(2) : ''}</td>
            <td>${vat ? vat.toFixed(2) : ''}</td>
            <td>${tot ? tot.toFixed(2) : ''}</td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot>
        <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
          <td colspan="5" style="text-align: right; padding: 6px;">TOTAL:</td>
          <td style="text-align: right; padding: 6px;">${totalExtPrice.toFixed(2)}</td>
          <td style="text-align: right; padding: 6px;">${totalExtPrice.toFixed(2)}</td>
          <td style="text-align: center; padding: 6px; background-color: #fef3c7; color: #78350f; font-weight: bold;">TOTAL WT</td>
          <td style="text-align: center; padding: 6px; background-color: #fde68a; color: #451a03; font-weight: bold;">${calcTotalWeightKg.toFixed(2)} KG</td>
          <td style="text-align: right; padding: 6px;">${calcTotalDiscount.toFixed(2)}</td>
          <td style="text-align: right; padding: 6px; font-weight: bold;">${calcSubtotalAmount.toFixed(2)}</td>
          <td style="text-align: right; padding: 6px;">${calcTotalTaxAmount.toFixed(2)}</td>
          <td style="text-align: right; padding: 6px; font-weight: bold; color: #083c54;">${calcGrandTotal.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>`;

    if (navigator.clipboard && window.ClipboardItem) {
      const textBlob = new Blob([tsvText], { type: 'text/plain' });
      const htmlBlob = new Blob([htmlTable], { type: 'text/html' });
      navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob
        })
      ]).then(() => {
        if (triggerToast) triggerToast('Items table copied! Open Excel and press Ctrl+V to paste exact layout.');
      }).catch(() => {
        navigator.clipboard.writeText(tsvText);
        if (triggerToast) triggerToast('Items table copied! Open Excel and press Ctrl+V to paste exact layout.');
      });
    } else {
      navigator.clipboard.writeText(tsvText);
      if (triggerToast) triggerToast('Items table copied! Open Excel and press Ctrl+V to paste exact layout.');
    }
  };

  // Calculations
  const subtotalAmount = items.reduce((s, it) => s + (it.amount || 0), 0);
  const totalTaxAmount = items.reduce((s, it) => s + (it.taxAmount || 0), 0);
  const totalWeightKg = items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.unitWeight) || 0)), 0);
  const totalBeforeTax = Math.max(0, subtotalAmount - discountAmount);
  const totalVatCalculated = totalBeforeTax * 0.05;
  const totalInvoiceAmount = totalBeforeTax + totalVatCalculated + freightAmount;

  // Save Quotation Form to Records & Persist Customer Data
  const handleSaveQuotationRecord = () => {
    const isTenderOnly = tenderNo.trim() !== '' && !rfqNo.trim();
    const activeTenderDate = tenderDate || (isTenderOnly ? rfqDate : '');
    const activeRfqDate = isTenderOnly ? '' : rfqDate;
    const activeRfqNumber = isTenderOnly ? '' : rfqNo;

    const currentSellerName = activeUser 
      ? (`${activeUser.firstName || ''} ${activeUser.secondName || ''}`.trim() || activeUser.uniqueId || activeUser.firstName || 'SELLER')
      : (sAcc || 'ADMIN');

    // 1. AUTO-SAVE OR UPDATE CUSTOMER IN QUOTATION CUSTOMER DATABASE
    if (clientName && clientName.trim()) {
      const normalizedComp = clientName.toLowerCase().trim();
      const normalizedTrn = (clientTrn || '').trim();

      const existingIdx = customers.findIndex(c => {
        const sameName = c.companyName.toLowerCase().trim() === normalizedComp;
        const sameTrn = normalizedTrn && c.trn && c.trn.trim() === normalizedTrn;
        return (sameName && sameTrn) || sameName || (Boolean(normalizedTrn) && Boolean(sameTrn));
      });

      const newContact: ContactPerson = {
        id: `cp-${Date.now()}`,
        name: purchaserContactPerson.trim() || 'Procurement Contact',
        designation: purchaserDesignation.trim() || 'Procurement',
        email: purchaserEmail.trim() || '',
        mobile: purchaserMobile.trim() || '',
        phone: purchaserPhone.trim() || clientPhone.trim() || ''
      };

      let updatedCustomerList: CustomerRecord[];

      if (existingIdx >= 0) {
        // Matched existing customer -> update details
        const existing = customers[existingIdx];
        const currentConcern = existing.concernPersons && existing.concernPersons.length > 0
          ? [...existing.concernPersons]
          : [{
              id: 'cp-primary',
              name: existing.contactPerson || purchaserContactPerson.trim() || 'Procurement Contact',
              designation: existing.designation || purchaserDesignation.trim() || 'Procurement',
              email: existing.email || purchaserEmail.trim() || '',
              mobile: existing.mobile || purchaserMobile.trim() || '',
              phone: existing.phone || purchaserPhone.trim() || clientPhone.trim() || ''
            }];

        const personExistsIdx = currentConcern.findIndex(
          cp => cp.name.toLowerCase().trim() === (purchaserContactPerson.trim() || '').toLowerCase()
        );

        let updatedConcern: ContactPerson[];
        if (purchaserContactPerson.trim()) {
          if (personExistsIdx >= 0) {
            updatedConcern = [...currentConcern];
            updatedConcern[personExistsIdx] = {
              ...updatedConcern[personExistsIdx],
              designation: purchaserDesignation.trim() || updatedConcern[personExistsIdx].designation,
              email: purchaserEmail.trim() || updatedConcern[personExistsIdx].email,
              mobile: purchaserMobile.trim() || updatedConcern[personExistsIdx].mobile,
              phone: purchaserPhone.trim() || clientPhone.trim() || updatedConcern[personExistsIdx].phone
            };
          } else {
            updatedConcern = [...currentConcern, newContact];
          }
        } else {
          updatedConcern = currentConcern;
        }

        const updatedCust: CustomerRecord = {
          ...existing,
          companyName: clientName.trim() || existing.companyName,
          address: clientAddress.trim() || existing.address,
          poBox: clientPoBox.trim() || existing.poBox,
          phone: clientPhone.trim() || existing.phone,
          trn: clientTrn.trim() || existing.trn,
          companyId: existing.companyId || activeCompany.id,
          assignedSeller: existing.assignedSeller || existing.seller || currentSellerName,
          seller: existing.seller || existing.assignedSeller || currentSellerName,
          contactPerson: purchaserContactPerson.trim() || existing.contactPerson,
          designation: purchaserDesignation.trim() || existing.designation,
          email: purchaserEmail.trim() || existing.email,
          mobile: purchaserMobile.trim() || existing.mobile,
          concernPersons: updatedConcern
        };

        updatedCustomerList = [...customers];
        updatedCustomerList[existingIdx] = updatedCust;
      } else {
        // Create new customer
        const newCust: CustomerRecord = {
          id: `cust-${Date.now()}`,
          companyName: clientName.trim(),
          address: clientAddress.trim() || 'UAE',
          poBox: clientPoBox.trim() || '',
          trn: clientTrn.trim() || '',
          phone: clientPhone.trim() || purchaserPhone.trim() || '',
          contactPerson: purchaserContactPerson.trim() || 'Procurement Contact',
          designation: purchaserDesignation.trim() || 'Procurement',
          email: purchaserEmail.trim() || '',
          mobile: purchaserMobile.trim() || '',
          companyId: activeCompany.id || 'comp-mfi',
          assignedSeller: currentSellerName,
          seller: currentSellerName,
          concernPersons: purchaserContactPerson.trim() ? [newContact] : []
        };

        updatedCustomerList = [newCust, ...customers];
      }

      setCustomers(updatedCustomerList);
      localStorage.setItem('mf_customers_list', JSON.stringify(updatedCustomerList));

      // Global ERP sync
      syncCustomerToAllDatabases({
        companyName: clientName,
        trn: clientTrn,
        address: clientAddress,
        poBox: clientPoBox,
        phone: clientPhone || purchaserPhone,
        email: purchaserEmail,
        mobile: purchaserMobile,
        contactPerson: purchaserContactPerson,
        designation: purchaserDesignation,
        seller: currentSellerName,
        companyId: activeCompany.id
      });
    }

    const newRecord: QuotationRecord = {
      id: `quote-${Date.now()}`,
      rfqDate: activeRfqDate,
      rfqNumber: activeRfqNumber,
      tenderNo: tenderNo.trim(),
      tenderDate: activeTenderDate,
      quotationRef: quotationRefNum || `MFI:J-${Date.now().toString().slice(-4)}`,
      quotationDate: quotationDate || new Date().toLocaleDateString('en-GB'),
      amount: Number(totalInvoiceAmount.toFixed(2)),
      client: clientName || 'GENERAL CLIENT',
      inquiryBy: purchaserContactPerson || 'PROCUREMENT',
      email: purchaserEmail || 'sales@marinefasteners.co',
      mobile: purchaserMobile || '',
      phone: purchaserPhone || '',
      steelOpen: true,
      closed: false,
      win: false,
      lost: false,
      notes: notesList[0] || 'Quotation saved from generator',
      month: recordMonthFilter,
      seller: currentSellerName,
      companyId: activeCompany.id || 'comp-mfi'
    };

    const nextRecords = [newRecord, ...quotationRecords];
    setQuotationRecords(nextRecords);
    localStorage.setItem('mf_quotations_list', JSON.stringify(nextRecords));
    if (triggerToast) triggerToast(`Quotation ${newRecord.quotationRef} and Customer "${clientName}" saved successfully!`);
    setActiveSubTab('records');
  };

  // Load an existing record into the quotation generator form
  const handleLoadQuoteRecordToForm = (quote: QuotationRecord) => {
    setOpenedFromRecords(true);
    setQuotationRefNum(quote.quotationRef);
    setQuotationDate(quote.quotationDate);
    setRfqNo(quote.rfqNumber || '');
    setRfqDate(quote.rfqDate || '');
    setTenderNo(quote.tenderNo || '');
    setTenderDate(quote.tenderDate || '');
    setClientName(quote.client);
    setPurchaserContactPerson(quote.inquiryBy || '');
    setPurchaserEmail(quote.email || '');
    setPurchaserMobile(quote.mobile || '');
    setPurchaserPhone(quote.phone || '');

    const match = customers.find(c => c.companyName.toLowerCase().trim() === quote.client.toLowerCase().trim());
    if (match) {
      if (match.address) setClientAddress(match.address);
      if (match.poBox) setClientPoBox(match.poBox);
      if (match.trn) setClientTrn(match.trn);
      if (match.phone && !quote.phone) setClientPhone(match.phone);
    }

    setActiveSubTab('quotation');
    if (triggerToast) triggerToast(`Loaded quotation ${quote.quotationRef} into Quotation Form!`);
  };

  // Helper to clean codes like (AK) from print PDF text
  const cleanPdfText = (str: string) => {
    if (!str) return '';
    return str.replace(/\s*\([a-zA-Z0-9-]+\)/gi, '').trim();
  };

  // Keyboard navigation for header form fields (Enter key)
  const handleHeaderNav = (e: React.KeyboardEvent<HTMLInputElement>, nextId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextEl = document.getElementById(nextId) as HTMLInputElement;
      if (nextEl) {
        nextEl.focus();
        if (nextEl.select) nextEl.select();
      }
    }
  };

  // Header key navigation
  const handleHeaderKeyDown = (
    e: React.KeyboardEvent<HTMLTableCellElement>,
    field: string
  ) => {
    const currIdx = COLUMN_SEQUENCE.indexOf(field);

    if (e.key === 'ArrowDown' || (e.shiftKey && e.key === 'ArrowDown') || e.key === 'Enter') {
      e.preventDefault();
      const firstEl = document.getElementById(`item-${field}-0`) as HTMLElement;
      if (firstEl) {
        firstEl.focus();
        if ('select' in firstEl && typeof (firstEl as HTMLInputElement).select === 'function') {
          (firstEl as HTMLInputElement).select();
        }
      }
      return;
    }

    if (e.key === 'ArrowRight' || (e.shiftKey && e.key === 'ArrowRight')) {
      e.preventDefault();
      if (currIdx < COLUMN_SEQUENCE.length - 1) {
        const nextField = COLUMN_SEQUENCE[currIdx + 1];
        const nextHeader = document.getElementById(`header-${nextField}`);
        if (nextHeader) nextHeader.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft' || (e.shiftKey && e.key === 'ArrowLeft')) {
      e.preventDefault();
      if (currIdx > 0) {
        const prevField = COLUMN_SEQUENCE[currIdx - 1];
        const prevHeader = document.getElementById(`header-${prevField}`);
        if (prevHeader) prevHeader.focus();
      }
      return;
    }
  };

  // Read-only cell keyboard navigation & selection (S/L, calculated fields: EXT. PRICE, T. WEIGHT, TOTAL EXCL. VAT, VAT, TOTAL)
  const handleReadOnlyCellKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedRowIds(new Set());
      setSelectedCellRange(null);
      setContextMenu(null);
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (selectedRowIds.size > 0) {
        deleteSelectedRows();
      } else if (selectedCellRange && isMultiCellSelection()) {
        deleteSelectedCellsData();
      } else if (rowIndex !== undefined && items[rowIndex]) {
        const targetId = items[rowIndex].id;
        pushToHistory(items);
        if (items.length <= 1) {
          setItems([{
            id: targetId,
            sn: 1,
            description: '',
            finish: 'HDG',
            unit: 'PCS',
            qty: '',
            unitPrice: '',
            unitWeight: '',
            extPrice: 0,
            discount: '',
            totalExclVat: 0,
            amount: 0,
            taxAmount: 0,
            netAmount: 0
          }]);
          if (triggerToast) triggerToast('Row cleared!');
        } else {
          setItems(prev => {
            const next = prev.filter((_, i) => i !== rowIndex);
            return next.map((it, i) => ({ ...it, sn: i + 1 }));
          });
          if (triggerToast) triggerToast(`Deleted Row #${rowIndex + 1}!`);
        }
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      copyCellRangeToClipboard();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (colIndex < COLUMN_SEQUENCE.length - 1) {
        const nextCol = colIndex + 1;
        const nextField = COLUMN_SEQUENCE[nextCol];
        const nextEl = document.getElementById(`item-${nextField}-${rowIndex}`) as HTMLElement;
        if (nextEl) {
          updateCellSelection(e.shiftKey, rowIndex, colIndex, rowIndex, nextCol);
          nextEl.focus();
          if ('select' in nextEl && typeof (nextEl as HTMLInputElement).select === 'function') {
            (nextEl as HTMLInputElement).select();
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (colIndex > 0) {
        const prevCol = colIndex - 1;
        const prevField = COLUMN_SEQUENCE[prevCol];
        const prevEl = document.getElementById(`item-${prevField}-${rowIndex}`) as HTMLElement;
        if (prevEl) {
          updateCellSelection(e.shiftKey, rowIndex, colIndex, rowIndex, prevCol);
          prevEl.focus();
          if ('select' in prevEl && typeof (prevEl as HTMLInputElement).select === 'function') {
            (prevEl as HTMLInputElement).select();
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = rowIndex + 1;
      if (nextIdx < items.length) {
        const field = COLUMN_SEQUENCE[colIndex];
        const nextEl = document.getElementById(`item-${field}-${nextIdx}`) as HTMLElement;
        if (nextEl) {
          updateCellSelection(e.shiftKey, rowIndex, colIndex, nextIdx, colIndex);
          nextEl.focus();
          if ('select' in nextEl && typeof (nextEl as HTMLInputElement).select === 'function') {
            (nextEl as HTMLInputElement).select();
          }
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = rowIndex - 1;
      if (prevIdx >= 0) {
        const field = COLUMN_SEQUENCE[colIndex];
        const prevEl = document.getElementById(`item-${field}-${prevIdx}`) as HTMLElement;
        if (prevEl) {
          updateCellSelection(e.shiftKey, rowIndex, colIndex, prevIdx, colIndex);
          prevEl.focus();
          if ('select' in prevEl && typeof (prevEl as HTMLInputElement).select === 'function') {
            (prevEl as HTMLInputElement).select();
          }
        }
      } else {
        const headerEl = document.getElementById(`header-${COLUMN_SEQUENCE[colIndex]}`);
        if (headerEl) headerEl.focus();
      }
      return;
    }
  };

  const handleSnKeyDown = (
    e: React.KeyboardEvent<HTMLTableCellElement>,
    rowIndex: number
  ) => {
    handleReadOnlyCellKeyDown(e, rowIndex, 0);
  };

  // Keyboard navigation & Auto-copy for line items table (Enter key, Arrow keys, Escape key, Delete key)
  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: keyof QuotationItem
  ) => {
    const rowId = items[rowIndex]?.id;
    const currIdx = COLUMN_SEQUENCE.indexOf(field as string);
    const inputEl = e.currentTarget;

    // Escape key: clear row selections and cell range
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedRowIds(new Set());
      setSelectedCellRange(null);
      setContextMenu(null);
      return;
    }

    // Ctrl+C / Cmd+C on cell range
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && isMultiCellSelection()) {
      e.preventDefault();
      copyCellRangeToClipboard();
      return;
    }

    // ArrowRight / Shift + ArrowRight: move focus 1 column right and select cell content
    if (e.key === 'ArrowRight') {
      let isAtEnd = true;
      let isFullySelected = true;
      try {
        if (inputEl.selectionStart !== null && inputEl.selectionEnd !== null) {
          isAtEnd = inputEl.selectionEnd === inputEl.value.length && inputEl.selectionStart === inputEl.value.length;
          isFullySelected = inputEl.selectionStart === 0 && inputEl.selectionEnd === inputEl.value.length;
        }
      } catch {
        isAtEnd = true;
        isFullySelected = true;
      }

      if (e.shiftKey || isAtEnd || isFullySelected) {
        e.preventDefault();
        if (currIdx < COLUMN_SEQUENCE.length - 1) {
          const nextCol = currIdx + 1;
          const nextField = COLUMN_SEQUENCE[nextCol];
          const nextEl = document.getElementById(`item-${nextField}-${rowIndex}`) as HTMLElement;
          if (nextEl) {
            updateCellSelection(e.shiftKey, rowIndex, currIdx, rowIndex, nextCol);
            nextEl.focus();
            if ('select' in nextEl && typeof (nextEl as HTMLInputElement).select === 'function') {
              (nextEl as HTMLInputElement).select();
            }
          }
        }
        return;
      }
    }

    // ArrowLeft / Shift + ArrowLeft: move focus 1 column left and select cell content
    if (e.key === 'ArrowLeft') {
      let isAtStart = true;
      let isFullySelected = true;
      try {
        if (inputEl.selectionStart !== null && inputEl.selectionEnd !== null) {
          isAtStart = inputEl.selectionStart === 0 && inputEl.selectionEnd === 0;
          isFullySelected = inputEl.selectionStart === 0 && inputEl.selectionEnd === inputEl.value.length;
        }
      } catch {
        isAtStart = true;
        isFullySelected = true;
      }

      if (e.shiftKey || isAtStart || isFullySelected) {
        e.preventDefault();
        if (currIdx > 0) {
          const prevCol = currIdx - 1;
          const prevField = COLUMN_SEQUENCE[prevCol];
          const prevEl = document.getElementById(`item-${prevField}-${rowIndex}`) as HTMLElement;
          if (prevEl) {
            updateCellSelection(e.shiftKey, rowIndex, currIdx, rowIndex, prevCol);
            prevEl.focus();
            if ('select' in prevEl && typeof (prevEl as HTMLInputElement).select === 'function') {
              (prevEl as HTMLInputElement).select();
            }
          }
        }
        return;
      }
    }

    // ArrowDown / Shift + ArrowDown: move focus straight DOWN to the same column in the row below
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = rowIndex + 1;
      if (nextIdx < items.length) {
        const nextEl = document.getElementById(`item-${field}-${nextIdx}`) as HTMLInputElement;
        if (nextEl) {
          updateCellSelection(e.shiftKey, rowIndex, currIdx, nextIdx, currIdx);
          nextEl.focus();
          if (nextEl.select) nextEl.select();
        }
      }
      return;
    }

    // ArrowUp / Shift + ArrowUp: move focus straight UP to the same column in the row above (or to header if at row 0)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = rowIndex - 1;
      if (prevIdx >= 0) {
        const prevEl = document.getElementById(`item-${field}-${prevIdx}`) as HTMLInputElement;
        if (prevEl) {
          updateCellSelection(e.shiftKey, rowIndex, currIdx, prevIdx, currIdx);
          prevEl.focus();
          if (prevEl.select) prevEl.select();
        }
      } else {
        const headerEl = document.getElementById(`header-${field}`);
        if (headerEl) {
          headerEl.focus();
        }
      }
      return;
    }

    // Delete or Backspace on selected row or Shift+Delete: delete entire row
    if ((e.key === 'Delete' || e.key === 'Backspace') && (e.shiftKey || (rowId && selectedRowIds.has(rowId)))) {
      e.preventDefault();
      const targetIds = selectedRowIds.size > 0 ? selectedRowIds : new Set([rowId]);
      if (items.length <= targetIds.size) {
        setItems([{
          id: `q-item-${Date.now()}`,
          sn: 1,
          description: '',
          finish: 'HDG',
          unit: 'PCS',
          qty: '',
          unitPrice: '',
          unitWeight: '',
          extPrice: 0,
          discount: '',
          totalExclVat: 0,
          amount: 0,
          taxAmount: 0,
          netAmount: 0
        }]);
      } else {
        const filtered = items.filter(it => !targetIds.has(it.id)).map((it, idx) => ({ ...it, sn: idx + 1 }));
        setItems(filtered);
      }
      setSelectedRowIds(new Set());
      if (triggerToast) triggerToast('Row deleted!');
      return;
    }

    // Delete key or Backspace on selected box or cell range: clear cell data
    if (e.key === 'Delete' || (e.key === 'Backspace' && (isMultiCellSelection() || (inputEl.selectionStart === 0 && inputEl.selectionEnd === inputEl.value.length)))) {
      if (selectedCellRangeRef.current || selectedCellRange) {
        e.preventDefault();
        deleteSelectedCellsData();
        return;
      }
    }

    // Ctrl+D or Cmd+D: Copy top text from row above for this cell ONLY
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      if (rowIndex > 0) {
        const prevRow = items[rowIndex - 1];
        if (prevRow && prevRow[field] !== undefined) {
          updateItem(items[rowIndex].id, field, prevRow[field]);
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const currentValue = String(e.currentTarget.value || '').trim();

      // If in description box and user hasn't typed anything: DO NOT AUTOFILL, DO NOT MOVE RIGHT
      if (field === 'description' && currentValue === '') {
        return;
      }

      const sequence: (keyof QuotationItem)[] = ['description', 'finish', 'unit', 'qty', 'unitPrice', 'unitWeight', 'discount'];
      const currIdx = sequence.indexOf(field);

      if (currIdx < sequence.length - 1) {
        // Move focus right to next field in current row
        const nextField = sequence[currIdx + 1];
        const nextEl = document.getElementById(`item-${nextField}-${rowIndex}`) as HTMLInputElement;
        if (nextEl) {
          nextEl.focus();
          if (nextEl.select) nextEl.select();
        }
      } else {
        // At end of row (discount) -> move focus to description of next row
        const nextRow = rowIndex + 1;
        if (nextRow < items.length) {
          const nextEl = document.getElementById(`item-description-${nextRow}`) as HTMLInputElement;
          if (nextEl) {
            nextEl.focus();
            if (nextEl.select) nextEl.select();
          }
        } else {
          // Automatically create a new row if at the end of the last row
          const nextSn = items.length + 1;
          const newItem: QuotationItem = {
            id: `q-item-${Date.now()}`,
            sn: nextSn,
            description: '',
            finish: '',
            unit: '',
            qty: '',
            unitPrice: '',
            unitWeight: '',
            discount: '',
            amount: 0,
            taxAmount: 0,
            netAmount: 0
          };
          setItems(prev => [...prev, newItem]);
          setTimeout(() => {
            const nextEl = document.getElementById(`item-description-${nextRow}`) as HTMLInputElement;
            if (nextEl) {
              nextEl.focus();
              if (nextEl.select) nextEl.select();
            }
          }, 50);
        }
      }
    }
  };

  // Handle uploading .xlsx / .xls / .csv Excel files directly into quotation items


  // Handle Pasting multi-row / tab-delimited items copied from Excel, Sheets, Emails or text workbooks
  const handleItemPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startRowIndex: number
  ) => {
    const pasteText = e.clipboardData.getData('text');
    if (!pasteText) return;

    // Check if paste text contains multiple lines or tab delimiters
    const hasNewlines = pasteText.includes('\n') || pasteText.includes('\r');
    const hasTabs = pasteText.includes('\t');

    // If simple single-cell text without tabs or newlines, allow standard single input paste behavior
    if (!hasNewlines && !hasTabs) {
      return;
    }

    // Intercept paste event for multi-line / tabular paste!
    e.preventDefault();

    const lines = pasteText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    let newItems = [...items];
    let parsedCount = 0;

    lines.forEach((line, lineIdx) => {
      const rawCols = line.split('\t').map(c => c.trim());

      // Skip table header lines ONLY if it's line 0 and contains explicit multi-column header words
      const isHeaderLine = lineIdx === 0 && (
        (/^(s\.?n\.?|sl\.?no|#|sn|sr\.?no\.?)$/i.test(rawCols[0]) && /^(item|description|particulars|finish|unit|qty|price)/i.test(rawCols[1] || '')) ||
        (/^(item|description|particulars)$/i.test(rawCols[0]) && /^(finish|size|unit|qty|quantity|price|rate)/i.test(rawCols[1] || ''))
      );

      if (isHeaderLine) {
        return;
      }

      let cols = [...rawCols];

      // Shift serial number column ONLY when there are at least 3 columns (SN, Description, Qty/Price)
      if (
        cols.length >= 3 &&
        /^\d+[\.\)]?$/.test(cols[0]) &&
        isNaN(Number(cols[1]))
      ) {
        // First column is serial number, drop it so col 0 is description
        cols.shift();
      }

      const targetIndex = startRowIndex + parsedCount;
      parsedCount++;

      let desc = '';
      let finish = 'HDG';
      let unit = 'PCS';
      let qty: number | string = '';
      let unitPrice: number | string = '';
      let unitWeight: number | string = '';
      let discount: number | string = '';

      if (cols.length >= 6) {
        desc = cols[0];
        finish = cols[1] || 'HDG';
        unit = cols[2] || 'PCS';
        qty = cols[3] || '';
        unitPrice = cols[4] || '';
        unitWeight = cols[5] || '';
        discount = cols[6] || '';
      } else if (cols.length === 5) {
        desc = cols[0];
        finish = cols[1] || 'HDG';
        unit = cols[2] || 'PCS';
        qty = cols[3] || '';
        unitPrice = cols[4] || '';
      } else if (cols.length === 4) {
        desc = cols[0];
        if (!isNaN(Number(cols[2]))) {
          finish = cols[1];
          qty = cols[2];
          unitPrice = cols[3];
        } else {
          finish = cols[1];
          unit = cols[2];
          qty = cols[3];
        }
      } else if (cols.length === 3) {
        desc = cols[0];
        qty = cols[1];
        unitPrice = cols[2];
      } else if (cols.length === 2) {
        desc = cols[0];
        if (!isNaN(Number(cols[1]))) {
          qty = cols[1];
        } else {
          finish = cols[1];
        }
      } else {
        // Single column line from email / text list
        desc = line.replace(/^\d+[\.\)]\s*/, '');
      }

      const numericQty = Number(qty) || 0;
      const numericUnitPrice = Number(unitPrice) || 0;
      const numericUnitWeight = Number(unitWeight) || 0;
      const numericDiscount = Number(discount) || 0;

      const totalWeight = Number((numericQty * numericUnitWeight).toFixed(3));
      const extPrice = numericQty * numericUnitPrice;
      const totalExclVat = Math.max(0, extPrice - numericDiscount);
      const amount = totalExclVat;
      const taxAmount = totalExclVat * 0.05;
      const netAmount = totalExclVat + taxAmount;

      const existingItem = targetIndex < newItems.length ? newItems[targetIndex] : null;

      let finalDescription = desc;
      if (existingItem && existingItem.description && existingItem.description.trim()) {
        const oldDesc = existingItem.description.trim();
        const newDesc = desc ? desc.trim() : '';
        if (newDesc && !oldDesc.toUpperCase().includes(newDesc.toUpperCase())) {
          finalDescription = `${oldDesc}\n${newDesc}`;
        } else if (!newDesc) {
          finalDescription = oldDesc;
        } else {
          finalDescription = oldDesc;
        }
      }

      const itemObj: QuotationItem = {
        id: existingItem ? existingItem.id : `q-item-${Date.now()}-${targetIndex}`,
        sn: targetIndex + 1,
        description: finalDescription,
        finish: finish || (existingItem ? existingItem.finish : 'HDG'),
        unit: unit || (existingItem ? existingItem.unit : 'PCS'),
        qty: qty !== '' ? qty : (existingItem ? existingItem.qty : ''),
        unitPrice: unitPrice !== '' ? unitPrice : (existingItem ? existingItem.unitPrice : ''),
        unitWeight: unitWeight !== '' ? unitWeight : (existingItem ? existingItem.unitWeight : ''),
        extPrice: Number(extPrice.toFixed(2)),
        discount: discount !== '' ? discount : (existingItem ? existingItem.discount : ''),
        totalWeight,
        totalExclVat: Number(totalExclVat.toFixed(2)),
        amount: Number(amount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        netAmount: Number(netAmount.toFixed(2))
      };

      if (targetIndex < newItems.length) {
        newItems[targetIndex] = itemObj;
      } else {
        newItems.push(itemObj);
      }
    });

    pushToHistory(itemsRef.current);
    setItems(newItems);

    if (triggerToast) {
      triggerToast(`Auto-pasted & generated ${parsedCount} quotation item rows!`);
    }
  };

  // Populate form from Customer selection (with specific contact/concern person)
  const handleSelectCustomerForQuote = (cust: CustomerRecord) => {
    setClientName(cust.companyName);
    setClientAddress(cust.address);
    setClientPoBox(cust.poBox);
    setClientPhone(cust.phone);
    setClientTrn(cust.trn);
    setPurchaserContactPerson(cust.contactPerson);
    setPurchaserDesignation(cust.designation);
    setPurchaserPhone(cust.phone);
    setPurchaserMobile(cust.mobile);
    setPurchaserEmail(cust.email);
    setActiveSubTab('quotation');
    if (triggerToast) triggerToast(`Loaded details for ${cust.companyName}`);
  };

  const handleSelectCustomerContactForQuote = (cust: CustomerRecord, cp?: any) => {
    setClientName(cust.companyName);
    setClientAddress(cust.address);
    setClientPoBox(cust.poBox);
    setClientPhone(cust.phone);
    setClientTrn(cust.trn);

    if (cp) {
      setPurchaserContactPerson(cp.name);
      setPurchaserDesignation(cp.designation);
      setPurchaserPhone(cp.phone || cust.phone);
      setPurchaserMobile(cp.mobile);
      setPurchaserEmail(cp.email);
    } else {
      setPurchaserContactPerson(cust.contactPerson);
      setPurchaserDesignation(cust.designation);
      setPurchaserPhone(cust.phone);
      setPurchaserMobile(cust.mobile);
      setPurchaserEmail(cust.email);
    }

    setActiveSubTab('quotation');
    if (triggerToast) triggerToast(`Loaded quote details for ${cust.companyName} (${cp ? cp.name : cust.contactPerson})`);
  };

  // Load sample data from PDF
  const handleLoadPdfSample = () => {
    setQuotationDate('24-Jul-26');
    setQuotationRefNum('MFI:J-0719/07/2026');
    setRfqNo('IND-SEI-SH-26-102');
    setRfqDate('23-Jul-26');
    setSAcc('FHM');
    setOfferValidity('5 Days from the date of quotation');

    setClientName('Super Engineering Industry L.L.C');
    setClientAddress('I Cad-1, Musaffah M41, Abu Dhabi, UAE');
    setClientPoBox('9050');
    setClientPhone('+971 2 550 1366');
    setClientTrn('100046686000003');

    setPurchaserContactPerson('Mr. G Mohammed Irfan');
    setPurchaserDesignation('Procurement');
    setPurchaserPhone('+971 2 550 1366');
    setPurchaserMobile('+971 55 224 6344');
    setPurchaserEmail('store@SuperEng.ae');

    setDeliveryMood('By Road');
    setDeliveryTerms('Ex Works');
    setDeliveryLeadTime('3-4 Working Days');
    setPaymentTerms('Standard TT');
    setPackingMood('Standard');
    setCurrency('AED');
    setMadeIn('U.A.E.');
    setHsCode('73181500');

    setItems([
      { id: '1', sn: 1, description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 40MM', finish: 'HDG', unit: 'SETS', qty: 20, unitPrice: 1.90, amount: 38.00, taxAmount: 1.90, netAmount: 39.90 },
      { id: '2', sn: 2, description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 45MM', finish: 'HDG', unit: 'SETS', qty: 80, unitPrice: 2.05, amount: 164.00, taxAmount: 8.20, netAmount: 172.20 },
      { id: '3', sn: 3, description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 50MM', finish: 'HDG', unit: 'SETS', qty: 250, unitPrice: 2.10, amount: 525.00, taxAmount: 26.25, netAmount: 551.25 },
      { id: '4', sn: 4, description: 'GRADE 8.8 HEX BOLT, M16 X 70MM', finish: 'HDG', unit: 'PCS', qty: 20, unitPrice: 1.80, amount: 36.00, taxAmount: 1.80, netAmount: 37.80 },
      { id: '5', sn: 5, description: 'GRADE 8.8 HEX BOLT, M16 X 50MM', finish: 'HDG', unit: 'PCS', qty: 50, unitPrice: 1.45, amount: 72.50, taxAmount: 3.63, netAmount: 76.13 },
      { id: '6', sn: 6, description: 'GRADE 8.8 HEX BOLT WITH 1 WASHER, M20 X 45MM', finish: 'HDG', unit: 'SETS', qty: 30, unitPrice: 2.60, amount: 78.00, taxAmount: 3.90, netAmount: 81.90 }
    ]);
    if (triggerToast) triggerToast('Loaded Quotation sample!');
  };

  // Helper to paginate items into pages cleanly with maximum page utilization (no paper waste)
  const getItemUnits = (it: Record<string, any>) => {
    const desc = (it.description || '').trim();
    if (desc.length > 90) return 2.2;
    if (desc.length > 45) return 1.5;
    return 1.0;
  };

  const paginateItems = <T extends Record<string, any>>(allItems: T[]) => {
    const total = allItems.length;
    if (total === 0) {
      return [{ pageNum: 1, items: [], isLast: true, startIdx: 0 }];
    }

    const totalUnits = allItems.reduce((acc, it) => acc + getItemUnits(it), 0);

    // Page 1 capacity with summary block = 12 units
    if (totalUnits <= 12) {
      return [{ pageNum: 1, items: allItems, isLast: true, startIdx: 0 }];
    }

    const pages: { pageNum: number; items: T[]; isLast: boolean; startIdx: number }[] = [];
    let currIdx = 0;
    let pageNum = 1;

    while (currIdx < total) {
      const remainingItems = allItems.slice(currIdx);
      const remCount = remainingItems.length;
      const remUnits = remainingItems.reduce((acc, it) => acc + getItemUnits(it), 0);

      const isFirstPage = (pageNum === 1);
      const maxUnitsNoSum = isFirstPage ? 22 : 23;
      const maxUnitsWithSum = isFirstPage ? 12 : 13;

      // If remaining items fit with summary block on this page
      if (remUnits <= maxUnitsWithSum) {
        pages.push({
          pageNum,
          items: remainingItems,
          isLast: true,
          startIdx: currIdx
        });
        break;
      }

      // Fill page up to maxUnitsNoSum
      let accUnits = 0;
      let takeCount = 0;

      for (let i = 0; i < remCount; i++) {
        const u = getItemUnits(remainingItems[i]);
        if (accUnits + u > maxUnitsNoSum) {
          break;
        }
        accUnits += u;
        takeCount++;
      }

      if (takeCount === 0) takeCount = 1;

      const leftCount = remCount - takeCount;

      // If taking takeCount leaves 0 items for the next page, but summary couldn't fit here (since remUnits > maxUnitsWithSum),
      // leave 3-4 items for the next page so summary isn't alone on a page.
      if (leftCount === 0) {
        const leaveForLast = Math.min(4, Math.floor(takeCount / 2));
        takeCount = Math.max(1, takeCount - leaveForLast);
      } else if (leftCount <= 2 && takeCount > 4) {
        // If leftCount is only 1 or 2 items, shift 2 items to give the last page a healthier 3-4 items
        takeCount -= 2;
      }

      pages.push({
        pageNum,
        items: allItems.slice(currIdx, currIdx + takeCount),
        isLast: false,
        startIdx: currIdx
      });

      currIdx += takeCount;
      pageNum++;
    }

    return pages;
  };

  // Generate Print HTML matching attached PDF screenshot
  const generateQuotationHtml = (customTitle?: string) => {
    const cleanClient = cleanPdfText(clientName);
    const cleanContact = cleanPdfText(purchaserContactPerson);

    // Filter out items without a description so empty/new rows are omitted from PDF!
    const validItemsRaw = items.filter(it => it.description && it.description.trim().length > 0);
    const validItems = (printItemsCount > 0 && printItemsCount < validItemsRaw.length)
      ? validItemsRaw.slice(0, printItemsCount)
      : validItemsRaw;

    const printSubtotal = validItems.reduce((s, it) => s + (it.amount || 0), 0);
    const printBeforeTax = Math.max(0, printSubtotal - discountAmount);
    const printVat = printBeforeTax * 0.05;
    const printInvoiceTotal = printBeforeTax + printVat + freightAmount;

    const pagesArr = paginateItems(validItems);
    const docTotalPages = pagesArr.length;

    const defaultTitle = getStructuredFileName();
    const docTitle = customTitle || defaultTitle;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 0 !important; }
          * { box-sizing: border-box; }
          html, body { width: 100%; margin: 0; padding: 0 6mm 10mm 6mm !important; font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; line-height: 1.3; }
          
          .header-title { font-size: 13.5px; font-weight: bold; color: #083c54; text-align: center; margin: 6px 0 3px 0; letter-spacing: 0.8px; text-decoration: underline; }
          .intro-text { font-size: 9.5px; font-weight: bold; font-style: italic; color: #000; margin: 3px 0 6px 0; text-align: left; }
          
          .meta-container { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; margin-top: 0 !important; margin-bottom: 4px; table-layout: fixed; page-break-inside: avoid; break-inside: avoid-page; }
          .meta-box { padding: 4px 5px !important; vertical-align: top; word-wrap: break-word; font-size: 9px; line-height: 1.3; background: #fff; box-sizing: border-box; }
          .meta-box table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
          .meta-box table td { border: none !important; padding: 0.5px 0 !important; font-size: 8.5px !important; vertical-align: top; }
          
          .grid-table { width: 100%; border-collapse: collapse; margin-top: 0 !important; margin-bottom: 4px; font-size: 9px; table-layout: fixed; }
          .grid-table thead { display: table-header-group; margin: 0 !important; padding: 0 !important; }
          .grid-table tfoot { display: table-footer-group; }
          .grid-table tfoot tr { page-break-inside: avoid !important; break-inside: avoid-page !important; }
          .grid-table tfoot td { border: none !important; background: transparent !important; padding: 0 !important; }
          .grid-table tr { page-break-inside: avoid !important; break-inside: avoid-page !important; }
          .grid-table th { border: 1px solid #000; background-color: #f2f2f2; padding: 3px 2px; text-align: center; font-weight: bold; word-wrap: break-word; font-size: 8.5px; }
          .grid-table tr.repeating-meta-row { margin: 0 !important; padding: 0 !important; }
          .grid-table tr.repeating-meta-row th { border: none !important; background: transparent !important; padding: 8mm 0 2px 0 !important; margin: 0 !important; font-weight: normal !important; text-align: left !important; vertical-align: top !important; }
          .grid-table > tbody > tr > td { border: 1px solid #000; padding: 3px 4px; word-wrap: break-word; overflow-wrap: break-word; font-size: 9px; }
          
          /* Unified summary footer block containing Notes, Totals, Purchaser Contact, and For Marine Fasteners */
          .summary-footer-block { width: 100%; margin-top: 2px; margin-bottom: 2mm; page-break-inside: avoid !important; break-inside: avoid-page !important; }
          .summary-table { width: 100%; border-collapse: collapse; margin-top: 0; font-size: 9px; table-layout: fixed; }
          .summary-table td { padding: 3px 5px; border: 1px solid #000; word-wrap: break-word; }
          
          .notes-box { font-size: 8.5px; border: 1px solid #000; padding: 5px; margin-top: 0; line-height: 1.35; }
          .notes-box ul { margin: 2px 0; padding-left: 12px; }
          
          .sig-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9px; table-layout: fixed; }
          .sig-table td { width: 50%; border: 1px solid #000; padding: 6px; vertical-align: top; word-wrap: break-word; }
        </style>
      </head>
      <body>
        ${pagesArr.map((pageObj, pageIdx) => `
        <div style="${pageIdx > 0 ? 'page-break-before: always; break-before: page; margin-top: 45px; padding-top: 30px;' : ''}">
          <!-- Items Table for Page ${pageObj.pageNum} -->
          <table class="grid-table">
            <colgroup>
              <col style="width: 4%;" />
              <col style="width: 27%;" />
              <col style="width: 8%;" />
              <col style="width: 6%;" />
              <col style="width: 6%;" />
              <col style="width: 8%;" />
              <col style="width: 9%;" />
              <col style="width: 7%;" />
              <col style="width: 9%;" />
              <col style="width: 8%;" />
              <col style="width: 8%;" />
            </colgroup>
            <thead>
              <tr class="repeating-meta-row">
                <th colspan="11">
                  <table class="meta-container">
                    <tr>
                      <!-- Left: Client & Seller Details -->
                      <td style="width: 53%; vertical-align: top; padding: 4px 6px; border-right: 1px solid #000;">
                        <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">SUPPLIER / EXPORTER:</div>
                        <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">${activeCompany.name}</div>
                        ${(activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}<br/>
                        Telephone: ${activeCompany.phone || '—'} | Email: ${activeCompany.email || '—'}<br/>
                        <b>VAT TRN:</b> ${activeCompany.trn}
                        <hr style="margin: 3px 0; border: 0; border-top: 1px solid #ccc;"/>
                        <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">CLIENT / BUYER:</div>
                        <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">M/s. ${cleanClient}</div>
                        Address: ${clientAddress}<br/>
                        PO Box: ${clientPoBox} | Phone: ${clientPhone}<br/>
                        TRN: ${clientTrn}
                      </td>

                      <!-- Right: Quote Ref & Commercial Terms -->
                      <td style="width: 47%; vertical-align: top; padding: 4px 6px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 8.5px;">
                          <tr><td style="width: 45%; font-weight: bold;">DATE:</td><td><b>${quotationDate}</b></td></tr>
                          <tr><td style="font-weight: bold;">Quotation Ref Num:</td><td><b>${quotationRefNum}</b></td></tr>
                          ${tenderNo.trim() !== '' && !rfqNo.trim() ? `
                            <tr><td style="font-weight: bold;">Tender No.:</td><td><b>${tenderNo}</b></td></tr>
                            <tr><td style="font-weight: bold;">Tender Date:</td><td><b>${tenderDate || rfqDate}</b></td></tr>
                          ` : tenderNo.trim() !== '' && rfqNo.trim() !== '' ? `
                            <tr><td style="font-weight: bold;">RFQ No.:</td><td>${rfqNo}</td></tr>
                            <tr><td style="font-weight: bold;">RFQ Date:</td><td>${rfqDate}</td></tr>
                            <tr><td style="font-weight: bold;">Tender No.:</td><td><b>${tenderNo}</b></td></tr>
                            <tr><td style="font-weight: bold;">Tender Date:</td><td><b>${tenderDate || rfqDate}</b></td></tr>
                          ` : `
                            <tr><td style="font-weight: bold;">RFQ No.:</td><td>${rfqNo}</td></tr>
                            <tr><td style="font-weight: bold;">RFQ Date:</td><td>${rfqDate}</td></tr>
                          `}
                          <tr><td style="font-weight: bold;">S.ACC.:</td><td>${sAcc}</td></tr>
                          <tr><td colspan="2"><hr style="margin: 2px 0; border: 0; border-top: 1px solid #aaa;"/></td></tr>
                          <tr><td style="font-weight: bold;">Offer Validity:</td><td>${offerValidity}</td></tr>
                          <tr><td>Delivery Terms:</td><td>${deliveryTerms}</td></tr>
                          <tr><td>Delivery Lead Time:</td><td>${deliveryLeadTime}</td></tr>
                          <tr><td>Payment Terms:</td><td>${paymentTerms}</td></tr>
                          <tr><td>Currency:</td><td><b>${currency}</b></td></tr>
                          <tr><td>Country of Origin:</td><td><b>${madeIn}</b></td></tr>
                          <tr><td>H.S. CODE:</td><td>${hsCode}</td></tr>
                          <tr><td style="font-weight: bold; white-space: nowrap;">PAGE NO.:</td><td style="font-weight: bold; white-space: nowrap;">Page ${pageObj.pageNum} of ${docTotalPages}</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- QUOTATION LINE DESIGN -->
                  <div style="display: flex; align-items: center; width: 100%; margin: 6px 0 4px 0;">
                    <div style="flex: 1; border-top: 3px double #083c54; margin-right: 12px;"></div>
                    <span style="font-size: 13.5px; font-weight: bold; font-style: italic; color: #083c54; white-space: nowrap; padding: 0 4px;">Quotation</span>
                    <div style="width: 75px; border-top: 3px double #083c54; margin-left: 12px;"></div>
                  </div>

                  ${pageObj.pageNum === 1 ? `
                  <div style="font-size: 9.5px; font-weight: bold; font-style: italic; color: #000; text-align: left; margin: 3px 0 2px 0;">
                    We are pleased to quote our best prices as below:
                  </div>
                  ` : ''}
                </th>
              </tr>

              <!-- Table Column Headers -->
              <tr>
                <th style="width: 4%;">S/L</th>
                <th style="width: 27%;">ITEM DESCRIPTION</th>
                <th style="width: 8%;">FINISH</th>
                <th style="width: 6%;">UNIT</th>
                <th style="width: 6%;">QTY</th>
                <th style="width: 8%;">U. PRICE</th>
                <th style="width: 9%;">EXT. PRICE</th>
                <th style="width: 7%;">DISCOUNT</th>
                <th style="width: 9%;">TOTAL EXCL. VAT</th>
                <th style="width: 8%;">VAT (${currency})</th>
                <th style="width: 8%;">TOTAL (${currency})</th>
              </tr>
            </thead>
            <tbody>
              ${pageObj.items.map((it, idx) => {
                const q = Number(it.qty) || 0;
                const up = Number(it.unitPrice) || 0;
                const ext = q * up;
                const disc = Number(it.discount) || 0;
                const totalExcl = Math.max(0, ext - disc);
                const vat = totalExcl * 0.05;
                const tot = totalExcl + vat;
                const serialNo = pageObj.startIdx + idx + 1;
                return `
                <tr>
                  <td style="text-align: center;">${serialNo}</td>
                  <td style="font-weight: bold;">${it.description}</td>
                  <td style="text-align: center;">${it.finish || 'HDG'}</td>
                  <td style="text-align: center;">${it.unit || 'PCS'}</td>
                  <td style="text-align: center; font-weight: bold;">${q}</td>
                  <td style="text-align: right;">${up.toFixed(2)}</td>
                  <td style="text-align: right;">${ext.toFixed(2)}</td>
                  <td style="text-align: right;">${disc.toFixed(2)}</td>
                  <td style="text-align: right;">${totalExcl.toFixed(2)}</td>
                  <td style="text-align: right;">${vat.toFixed(2)}</td>
                  <td style="text-align: right; font-weight: bold;">${tot.toFixed(2)}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${pageObj.isLast ? `
          <!-- Unified Summary & Signature Footer Block: Kept 100% together without splitting across pages -->
          <div class="summary-footer-block">
            <table style="width: 100%; border-collapse: collapse; font-size: 7.5px;">
              <tr>
                <td style="width: 58%; vertical-align: top; padding-right: 5px;">
                  <div class="notes-box">
                    <b>Notes:-</b>
                    <ul>
                      ${notesList.map(n => `<li>${n}</li>`).join('')}
                    </ul>
                  </div>
                </td>
                <td style="width: 42%; vertical-align: top;">
                  <table class="summary-table">
                    <tr><td style="font-weight: bold;">TOTAL IN ${currency} :</td><td style="text-align: right; font-weight: bold;">${printSubtotal.toFixed(2)}</td></tr>
                    <tr><td>DISCOUNT IN ${currency} :</td><td style="text-align: right;">${discountAmount.toFixed(2)}</td></tr>
                    <tr><td>FREIGHT/EXTRA CHARGES IN ${currency} :</td><td style="text-align: right;">${freightAmount.toFixed(2)}</td></tr>
                    <tr><td style="font-weight: bold;">TOTAL ${currency} BEFORE TAX :</td><td style="text-align: right; font-weight: bold;">${printBeforeTax.toFixed(2)}</td></tr>
                    <tr><td>5% TAX AMOUNT IN ${currency} :</td><td style="text-align: right;">${printVat.toFixed(2)}</td></tr>
                    <tr style="background-color: #f2f2f2;"><td style="font-weight: bold; font-size: 8.5px;">TOTAL AMOUNT IN ${currency} :</td><td style="text-align: right; font-weight: bold; font-size: 9px; color: #003366;">${printInvoiceTotal.toFixed(2)}</td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <div style="font-size: 7.5px; text-align: right; font-weight: bold; margin-top: 8px; margin-bottom: 3px;">E. & O.E</div>

            <!-- Signature Footer -->
            <table class="sig-table">
              <tr>
                <td>
                  <b>Purchaser Contact Info:-</b><br/><br/>
                  <b>${cleanContact}</b><br/>
                  ${purchaserDesignation}<br/>
                  Phone: ${purchaserPhone}<br/>
                  Mobile: ${purchaserMobile}<br/>
                  Email: ${purchaserEmail}
                </td>
                <td>
                  <b>For : ${activeCompany.name}</b><br/><br/>
                  <b>${salesExecName}</b> (${salesExecTitle})<br/>
                  Mobile: ${salesExecMobile}<br/>
                  Phone: ${activeCompany.phone || salesExecPhone}<br/>
                  Email: ${salesExecEmail}<br/>
                  Website: ${activeCompany.website || 'www.marinefasteners.ae'}
                </td>
              </tr>
            </table>
          </div>
          ` : ''}
        </div>
        `).join('')}
      </body>
      </html>
    `;

    return { html, docTitle };
  };

  const handlePrintQuotation = (customTitle?: string) => {
    const title = customTitle || getStructuredFileName();
    const { html, docTitle } = generateQuotationHtml(title);
    printHtml(html, docTitle);
  };

  // Download PDF handler with automated structured filename matching organization folder rules
  const getStructuredFileName = () => {
    // Extract quote ref number removing MFI: and J- or J: prefix and /MM/YYYY or /MM/YY suffix
    let refCode = quotationRefNum || '0719';
    // Remove MFI: prefix
    refCode = refCode.replace(/^MFI\s*:\s*/i, '');
    // Remove J- or J: prefix
    refCode = refCode.replace(/^J\s*[-:]?\s*/i, '');
    // Remove Month & Year suffix like /07/2026 or /07/26
    refCode = refCode.replace(/\/\d{1,2}\/\d{2,4}$/, '');
    refCode = refCode.trim();
    if (!refCode) refCode = '0719';

    // Clean company / client name e.g. "SUPER ENGINEERING"
    let cleanClient = (clientName || 'CLIENT')
      .replace(/^M\/s\.?\s*/i, '')
      .replace(/[\/\\:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanClient) cleanClient = 'CLIENT';

    return `${refCode} - ${cleanClient.toUpperCase()}`;
  };

  const handleDownloadPdf = async () => {
    const fileName = getStructuredFileName();
    const { html } = generateQuotationHtml(fileName);
    if (triggerToast) {
      triggerToast(`Opening Save Location dialog for "${fileName}.pdf"...`);
    }
    await downloadPdfFromHtml(html, fileName);
  };

  // --- RENDER 1: ERP LOGIN SCREEN (If not logged into Quotation Module) ---
  if (!quotationAuth && !currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 antialiased">
        <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-xs shadow-xl overflow-hidden font-sans">
          {/* Header Banner */}
          <div className="bg-[#083c54] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#f37021]">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-sm font-black uppercase tracking-wider font-mono">ERP QUOTATION PORTAL</h1>
                <p className="text-[10px] text-slate-300">Authorized Sales & Pricing Portal • {activeCompany.name}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-mono uppercase font-bold rounded-xs">
              SECURE ACCESS
            </span>
          </div>

          <div className="p-8">
            {/* Quick Demo Fill Accounts Bar */}
            <div className="mb-6 bg-slate-50 border border-slate-200 p-3 rounded-xs text-[10px]">
              <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-2 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Sign-In Demo Profiles (1-Click Access)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Faisal Mahmud', 'faisal@marinefasteners.co', 'MF-FSL01')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-800 font-bold font-mono text-[9px] cursor-pointer shadow-3xs"
                >
                  ⚡ FAISAL MAHMUD (MF-FSL01)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Sales Manager', 'mfi@marinefasteners.co', 'MFASIF-2026')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-800 font-bold font-mono text-[9px] cursor-pointer shadow-3xs"
                >
                  ⚡ MR. ASIF AWAN (MFASIF-2026)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Store Manager', 'store.marinefasteners2018@gmail.com', 'MF-STR01')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-800 font-bold font-mono text-[9px] cursor-pointer shadow-3xs"
                >
                  ⚡ STORE MANAGER (MF-STR01)
                </button>
              </div>
            </div>

            {/* ERP Login Form matching page 2 PDF layout */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-lg mx-auto font-sans">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Unique id field */}
              <div className="flex items-center gap-3">
                <label className="w-28 text-right text-xs font-semibold text-slate-700 font-mono">
                  Unique id
                </label>
                <input
                  type="text"
                  value={loginUniqueId}
                  onChange={(e) => setLoginUniqueId(e.target.value)}
                  placeholder="e.g. MF-FSL01"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xs text-xs font-mono focus:border-[#083c54] focus:outline-hidden"
                />
              </div>

              {/* Email field */}
              <div className="flex items-center gap-3">
                <label className="w-28 text-right text-xs font-semibold text-slate-700 font-mono">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. sales@marinefasteners.co"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xs text-xs font-mono focus:border-[#083c54] focus:outline-hidden"
                />
              </div>

              {/* Password field */}
              <div className="flex items-center gap-3">
                <label className="w-28 text-right text-xs font-semibold text-slate-700 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xs text-xs font-mono focus:border-[#083c54] focus:outline-hidden"
                />
              </div>

              {/* Checkbox and Sign In button row */}
              <div className="flex items-center justify-between pt-2 pl-31">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none font-mono">
                  <input
                    type="checkbox"
                    checked={staySignedIn}
                    onChange={(e) => setStaySignedIn(e.target.checked)}
                    className="rounded border-slate-300 text-[#083c54] focus:ring-0"
                  />
                  <span>Stay signed in</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#f37021] font-bold text-xs uppercase font-mono rounded-xs cursor-pointer shadow-3xs transition-all border-slate-400"
                >
                  Sign In
                </button>
              </div>

              {/* Forget Password link */}
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-slate-700 hover:text-slate-900 hover:underline font-mono"
                >
                  Forget Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Forget Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-300 max-w-md w-full p-6 rounded-xs shadow-2xl font-mono">
              <h3 className="text-sm font-bold uppercase text-slate-900 mb-2">Password Recovery</h3>
              <p className="text-xs text-slate-600 mb-4">Enter your registered email address to receive password reset instruction code.</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="sales@marinefasteners.co"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    if (triggerToast) triggerToast("Reset instructions sent to your registered email.");
                  }}
                  className="px-4 py-1.5 bg-[#083c54] text-white text-xs font-bold uppercase rounded cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER 2: MAIN QUOTATION MODULE (LOGGED IN) ---
  return (
    <div className="space-y-4 font-sans antialiased">
      {/* TOP MENU BAR WITH 4 BUTTON CARDS: HOME, CUSTOMER, QUOTATION, RECORDS */}
      <div className="bg-slate-50/90 border border-slate-200 p-2 rounded-lg shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200 rounded-lg">
          {/* HOME */}
          <button
            type="button"
            onClick={() => setActiveSubTab('home')}
            className={`border rounded-md px-3.5 py-1.5 min-w-[72px] h-[52px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95 ${
              activeSubTab === 'home'
                ? 'bg-[#083c54] text-white border-[#083c54] shadow-xs font-bold scale-[1.02]'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Home className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeSubTab === 'home' ? 'text-amber-400' : 'text-amber-500'}`} />
            <span className="text-[11px] font-semibold font-sans uppercase leading-none">Home</span>
          </button>

          {/* CUSTOMER */}
          <button
            type="button"
            onClick={() => setActiveSubTab('customer')}
            className={`border rounded-md px-3.5 py-1.5 min-w-[76px] h-[52px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95 ${
              activeSubTab === 'customer'
                ? 'bg-[#083c54] text-white border-[#083c54] shadow-xs font-bold scale-[1.02]'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Users className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeSubTab === 'customer' ? 'text-emerald-300' : 'text-emerald-600'}`} />
            <span className="text-[11px] font-semibold font-sans uppercase leading-none">Customer</span>
          </button>

          {/* QUOTATION */}
          <button
            type="button"
            onClick={() => setActiveSubTab('quotation')}
            className={`border rounded-md px-3.5 py-1.5 min-w-[80px] h-[52px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95 ${
              activeSubTab === 'quotation'
                ? 'bg-[#f37021] text-white border-[#d85d14] shadow-xs font-bold scale-[1.02]'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <FileText className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeSubTab === 'quotation' ? 'text-white' : 'text-[#f37021]'}`} />
            <span className="text-[11px] font-semibold font-sans uppercase leading-none">Quotation</span>
          </button>

          {/* RECORDS LOG */}
          <button
            type="button"
            onClick={() => setActiveSubTab('records')}
            className={`border rounded-md px-3.5 py-1.5 min-w-[90px] h-[52px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95 relative ${
              activeSubTab === 'records'
                ? 'bg-rose-800 text-white border-rose-900 shadow-xs font-bold scale-[1.02]'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
            }`}
            title="Quotation Log & Spreadsheet Records"
          >
            <div className="flex items-center gap-1">
              <ClipboardList className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeSubTab === 'records' ? 'text-rose-200' : 'text-rose-600'}`} />
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                activeSubTab === 'records' ? 'bg-white text-rose-900' : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {quotationRecords.length}
              </span>
            </div>
            <span className="text-[11px] font-semibold font-sans uppercase leading-none">Records Log</span>
          </button>
        </div>

        {/* User Account Indicator & Logout */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold uppercase rounded-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{quotationAuth.name || 'AUTHENTICATED USER'}</span>
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold uppercase rounded-xs cursor-pointer transition-colors"
            title="Log out of Quotation Portal"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: HOME (DASHBOARD) */}
      {activeSubTab === 'home' && (
        <div className="space-y-4">
          {/* Executive Metrics Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="text-[9px] font-mono font-bold uppercase text-slate-500">Active Sales Quotations Value</div>
              <div className="text-xl font-bold font-mono text-[#083c54] mt-1">AED 3,450,900.00</div>
              <div className="text-[8.5px] font-mono text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+12.4% VS LAST MONTH</span>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 shadow-xs">
              <div className="text-[9px] font-mono font-bold uppercase text-slate-500">Total Quotations Issued</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{quotationRecords.length} Documents</div>
              <div className="text-[8.5px] font-mono text-slate-500 mt-1">June - July Active Cycle</div>
            </div>

            <div className="bg-white p-4 border border-slate-200 shadow-xs">
              <div className="text-[9px] font-mono font-bold uppercase text-slate-500">Proposal Win Rate</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {((quotationRecords.filter(r => r.win).length / (quotationRecords.length || 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-[8.5px] font-mono text-slate-500 mt-1">
                {quotationRecords.filter(r => r.win).length} Won / {quotationRecords.filter(r => r.lost).length} Lost
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 shadow-xs">
              <div className="text-[9px] font-mono font-bold uppercase text-slate-500">Steel Open Enquiries</div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {quotationRecords.filter(r => r.steelOpen).length} Pending
              </div>
              <div className="text-[8.5px] font-mono text-slate-500 mt-1">Awaiting client decision</div>
            </div>
          </div>

          {/* Quick Sales Operations Cards */}
          <div className="bg-white border border-slate-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase font-mono text-slate-800 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#f37021]" />
              <span>Quick Sales Operations & Actions</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('quotation')}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs uppercase text-slate-900 group-hover:text-[#f37021]">Draft Sales Quotation</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#f37021]" />
                </div>
                <p className="text-[10px] text-slate-600">Issue official MFI price proposal & tax breakdown matching PDF format</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('records')}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs uppercase text-slate-900 group-hover:text-[#083c54]">Quotation Records Log</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#083c54]" />
                </div>
                <p className="text-[10px] text-slate-600">View spreadsheet log with status toggles (Steel Open, Closed, Win, Lost)</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('customer')}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs uppercase text-slate-900 group-hover:text-emerald-700">Customer Directory</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </div>
                <p className="text-[10px] text-slate-600">Manage corporate clients, TRN, contact details & custom quote history</p>
              </button>
            </div>
          </div>

          {/* Recent Quotations List Table */}
          <div className="bg-white border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase font-mono text-slate-800">Recent Quotation Log</h3>
              <button
                type="button"
                onClick={() => setActiveSubTab('records')}
                className="text-[10px] font-mono font-bold text-[#f37021] hover:underline uppercase"
              >
                View All Records →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase">
                    <th className="p-2">Ref No</th>
                    <th className="p-2">RFQ Date</th>
                    <th className="p-2">Client</th>
                    <th className="p-2 text-right">Amount (AED)</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotationRecords.slice(0, 5).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-[#083c54]">{q.quotationRef}</td>
                      <td className="p-2 text-slate-600">{q.rfqDate}</td>
                      <td className="p-2 font-semibold text-slate-900">{q.client}</td>
                      <td className="p-2 text-right font-bold text-slate-950">{q.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 text-center">
                        {q.win ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[8px] uppercase rounded">WIN</span>
                        ) : q.lost ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[8px] uppercase rounded">LOST</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[8px] uppercase rounded">OPEN</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CUSTOMER DIRECTORY */}
      {activeSubTab === 'customer' && (
        <div className="bg-white border border-slate-200 p-4 shadow-xs space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
                <span>Corporate Customer Directory</span>
                <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                  {visibleCustomers.length} Clients
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-sans">Manage client contact info, TRN, and launch direct quotation proposals</p>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 border border-slate-300 rounded-xs text-[9.5px]">
                <button
                  type="button"
                  onClick={() => setCustomerViewMode('list')}
                  className={`px-2.5 py-1 font-bold uppercase rounded-xs cursor-pointer transition-all ${
                    customerViewMode === 'list'
                      ? 'bg-[#083c54] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  List View
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerViewMode('tiles')}
                  className={`px-2.5 py-1 font-bold uppercase rounded-xs cursor-pointer transition-all ${
                    customerViewMode === 'tiles'
                      ? 'bg-[#083c54] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tiles View
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomerModalForm({
                    companyName: '',
                    address: '',
                    poBox: '',
                    trn: '',
                    phone: '',
                    contactPerson: '',
                    designation: 'Procurement Specialist',
                    email: '',
                    mobile: '',
                    directPhone: ''
                  });
                  setIsAddCustomerModalOpen(true);
                }}
                className="px-3 py-1.5 bg-[#083c54] text-white text-[10px] font-bold font-mono uppercase rounded-xs hover:bg-[#0a4a68] cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Client</span>
              </button>
            </div>
          </div>

          {/* SEARCH BOX BEFORE LIST VIEW */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative flex-1 min-w-[240px] max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="quotation-customer-search-input"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search clients by Company Name, TRN, Contact Person, Phone, Email, Address..."
                className="w-full bg-white border border-slate-300 rounded pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#083c54] focus:ring-1 focus:ring-[#083c54]"
              />
              {customerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCustomerSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-slate-600 font-mono">
              <span>
                Showing <strong className="text-slate-900">{filteredCustomerDirectory.length}</strong> of <strong className="text-slate-900">{visibleCustomers.length}</strong> clients
              </span>
              {customerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCustomerSearchQuery('')}
                  className="text-[#083c54] underline hover:text-[#0a4a68] font-bold cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* TYPE 1: LIST VIEW TABLE (Default) */}
          {customerViewMode === 'list' ? (
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-[9.5px] border-collapse">
                <thead>
                  <tr className="bg-[#083c54] text-white font-extrabold uppercase text-[9px]">
                    <th className="p-2 border-r border-slate-700 w-8 text-center">#</th>
                    <th className="p-2 border-r border-slate-700 w-[160px]">Company Name</th>
                    <th className="p-2 border-r border-slate-700 w-[115px]">TRN</th>
                    <th className="p-2 border-r border-slate-700 w-[190px]">Address & PO Box</th>
                    <th className="p-2 border-r border-slate-700 w-[260px]">
                      <div className="flex items-center justify-between">
                        <span>Concern Persons / Purchasers</span>
                        <span className="text-[8px] font-normal text-sky-200">(+ Add More)</span>
                      </div>
                    </th>
                    <th className="p-2 text-center w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCustomerDirectory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-sans text-xs">
                        No clients found matching "{customerSearchQuery}". Try a different keyword or{' '}
                        <button
                          type="button"
                          onClick={() => setCustomerSearchQuery('')}
                          className="text-[#083c54] font-bold underline cursor-pointer"
                        >
                          clear filter
                        </button>
                        .
                      </td>
                    </tr>
                  ) : (
                    filteredCustomerDirectory.map((c, idx) => {
                      const contactsToRender = (c.concernPersons && c.concernPersons.length > 0)
                        ? c.concernPersons
                        : [{
                            id: 'primary',
                            name: c.contactPerson,
                            designation: c.designation,
                            email: c.email,
                            mobile: c.mobile,
                            phone: c.phone
                          }];

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-400 text-[9.5px]">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-extrabold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-[#083c54] shrink-0" />
                              <span className="text-[9.5px] leading-tight">{c.companyName}</span>
                            </div>
                            {(c.assignedSeller || c.seller) && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200 font-mono font-bold">
                                  Seller: {c.assignedSeller || c.seller}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-bold text-amber-800 text-[9.5px]">
                            {c.trn || '—'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-700 text-[9px]">
                            <p>{c.address}</p>
                            <p className="text-[8.5px] text-slate-500 font-mono mt-0.5">PO Box: {c.poBox} | Tel: {c.phone}</p>
                          </td>
                          <td className="p-1.5 border-r border-slate-200">
                            <div className="space-y-1">
                              {contactsToRender.map((cp, cIdx) => (
                                <div key={cp.id || cIdx} className="flex items-center justify-between gap-1.5 bg-slate-100 p-1.5 rounded border border-slate-200 text-[9px] leading-tight">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-slate-900 flex items-center gap-1">
                                      <span>👤 {cp.name}</span>
                                      {cp.designation && <span className="text-slate-500 font-normal">({cp.designation})</span>}
                                    </div>
                                    <div className="text-[8.5px] text-slate-600">✉️ {cp.email} | 📱 {cp.mobile}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCustomerContactForQuote(c, cp)}
                                    className="px-2 py-0.5 bg-[#f37021] hover:bg-[#d85e13] text-white text-[8px] font-bold uppercase rounded cursor-pointer shrink-0 ml-1"
                                    title="Create quotation for this purchaser"
                                  >
                                    Quote
                                  </button>
                                </div>
                              ))}
                              {/* Icon to Add More Purchaser */}
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetCustomerForPurchaser(c);
                                  setPurchaserModalForm({
                                    name: '',
                                    code: '',
                                    designation: 'Procurement Specialist',
                                    email: '',
                                    mobile: '',
                                    phone: c.phone || ''
                                  });
                                  setIsAddPurchaserModalOpen(true);
                                }}
                                className="w-full py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-dashed border-sky-300 rounded text-[8.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                title="Add another purchaser contact for this company"
                              >
                                <UserPlus className="w-3 h-3 text-sky-700" />
                                <span>+ Add More Purchaser</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-2 text-center align-middle">
                            <div className="flex flex-col gap-1 items-center">
                              <button
                                type="button"
                                onClick={() => handleSelectCustomerForQuote(c)}
                                className="w-full px-2.5 py-1 bg-[#083c54] hover:bg-[#0a4a68] text-white text-[8.5px] font-bold uppercase rounded cursor-pointer shadow-3xs whitespace-nowrap"
                              >
                                Select Client
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetCustomerForPurchaser(c);
                                  setPurchaserModalForm({
                                    name: '',
                                    code: '',
                                    designation: 'Procurement Specialist',
                                    email: '',
                                    mobile: '',
                                    phone: c.phone || ''
                                  });
                                  setIsAddPurchaserModalOpen(true);
                                }}
                                className="w-full px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[8px] font-bold rounded cursor-pointer flex items-center justify-center gap-1"
                                title="Add purchaser"
                              >
                                <UserPlus className="w-2.5 h-2.5 text-slate-600" />
                                <span>+ Purchaser</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* TYPE 2: TILES VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCustomerDirectory.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-500 font-sans text-xs bg-slate-50 border border-slate-200 rounded">
                  No clients found matching "{customerSearchQuery}". Try a different keyword or{' '}
                  <button
                    type="button"
                    onClick={() => setCustomerSearchQuery('')}
                    className="text-[#083c54] font-bold underline cursor-pointer"
                  >
                    clear filter
                  </button>
                  .
                </div>
              ) : (
                filteredCustomerDirectory.map((c) => {
                  const contactsToRender = (c.concernPersons && c.concernPersons.length > 0)
                    ? c.concernPersons
                    : [{
                        id: 'primary',
                        name: c.contactPerson,
                        designation: c.designation,
                        email: c.email,
                        mobile: c.mobile,
                        phone: c.phone
                      }];

                  return (
                    <div key={c.id} className="border border-slate-300 p-3.5 rounded-xs bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3">
                      <div className="flex items-start justify-between border-b border-slate-200 pb-2">
                        <div>
                          <h3 className="text-xs font-black font-mono text-slate-900 uppercase flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[#083c54]" />
                            <span>{c.companyName}</span>
                          </h3>
                          <p className="text-[10px] text-slate-600 font-mono mt-0.5">{c.address}</p>
                          {(c.assignedSeller || c.seller) && (
                            <p className="text-[8.5px] text-slate-500 font-mono mt-0.5 font-bold">
                              👤 Seller: {c.assignedSeller || c.seller}
                            </p>
                          )}
                        </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8.5px] font-mono bg-slate-200 border border-slate-300 px-1.5 py-0.5 rounded font-bold text-slate-800 shrink-0">
                          TRN: {c.trn}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetCustomerForPurchaser(c);
                            setPurchaserModalForm({
                              name: '',
                              code: '',
                              designation: 'Procurement Specialist',
                              email: '',
                              mobile: '',
                              phone: c.phone || ''
                            });
                            setIsAddPurchaserModalOpen(true);
                          }}
                          className="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 text-[8px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3 h-3 text-sky-700" />
                          <span>+ Add Purchaser</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[8.5px] font-bold font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Concern Persons / Purchasers ({contactsToRender.length}):</span>
                        <span className="text-[8px] text-slate-400 font-normal">Select person to quote</span>
                      </div>

                      {contactsToRender.map((cp, idx) => (
                        <div key={cp.id || idx} className="p-2 bg-white border border-slate-200 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono hover:border-amber-400 transition-colors">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>{cp.name}</span>
                              <span className="text-[8.5px] font-normal text-slate-500">({cp.designation})</span>
                            </div>
                            <div className="text-slate-600 text-[9px] flex flex-wrap gap-2 pl-4">
                              <span>✉️ {cp.email}</span>
                              <span>📱 {cp.mobile}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectCustomerContactForQuote(c, cp)}
                            className="px-2.5 py-1 bg-[#f37021] hover:bg-[#d85e13] text-white text-[8.5px] font-mono font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shrink-0 self-end sm:self-center shadow-3xs"
                            title={`Create Quotation for ${cp.name}`}
                          >
                            <FileText className="w-3 h-3 text-sky-200" />
                            <span>Create Quote</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: QUOTATION GENERATOR (FORM MATCHING ATTACHED PDF) */}
      {activeSubTab === 'quotation' && (
        <div className="bg-white border border-slate-300 p-4 sm:p-6 shadow-md space-y-6 font-sans">
          {/* Header Action Toolbar (Redesigned Button Bar matching screenshot) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 bg-slate-50/90 -mx-4 -mt-4 p-3.5 rounded-t-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono uppercase text-[#083c54]">MFI QUOTATION GENERATOR</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200 rounded-lg shadow-2xs">
              {/* New */}
              <button
                type="button"
                onClick={handleCreateNewQuotation}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-md px-3.5 py-1.5 min-w-[65px] h-[52px] flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition-all text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer group"
                title="Create a new blank quotation"
              >
                <FilePlus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium font-sans text-slate-800 leading-none">New</span>
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={handleSaveQuotationRecord}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-md px-3.5 py-1.5 min-w-[65px] h-[52px] flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition-all text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer group"
                title="Save quotation to records"
              >
                <Save className="w-4 h-4 text-[#083c54] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium font-sans text-slate-800 leading-none">Save</span>
              </button>

              {/* Delete Selected Rows (Visible when rows selected) */}
              {selectedRowIds.size > 0 && (
                <button
                  type="button"
                  onClick={deleteSelectedRows}
                  className="bg-red-50 hover:bg-red-100/80 border border-red-300 rounded-md px-3.5 py-1.5 min-w-[65px] h-[52px] flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition-all text-red-700 hover:text-red-900 active:scale-95 cursor-pointer group"
                  title="Delete Selected Rows"
                >
                  <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-medium font-sans text-red-800 leading-none">Delete ({selectedRowIds.size})</span>
                </button>
              )}

              {/* Print */}
              <button
                type="button"
                onClick={() => handlePrintQuotation()}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-md px-3.5 py-1.5 min-w-[65px] h-[52px] flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition-all text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer group"
                title="Print or Export PDF"
              >
                <Printer className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium font-sans text-slate-800 leading-none">Print</span>
              </button>

              {/* Preview */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-md px-3.5 py-1.5 min-w-[65px] h-[52px] flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition-all text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer group"
                title="Preview quotation document"
              >
                <Eye className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium font-sans text-slate-800 leading-none">Preview</span>
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab(openedFromRecords ? 'records' : 'records');
                  setOpenedFromRecords(false);
                }}
                className="bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 rounded-md px-3.5 py-1.5 min-w-[65px] h-[52px] flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition-all text-slate-700 hover:text-rose-700 active:scale-95 cursor-pointer group"
                title="Close Quotation Form (Return to Records Log)"
              >
                <X className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium font-sans text-slate-800 group-hover:text-rose-700 leading-none">Close</span>
              </button>
            </div>
          </div>

          {/* Letterhead Banner */}
          <div className="border border-slate-200 p-3.5 bg-white shadow-xs rounded-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-base font-black text-[#083c54] tracking-tight uppercase">{activeCompany.name}</h1>
                <p className="text-[10px] text-slate-600 font-mono">
                  {(activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')} • Telephone: {activeCompany.phone || '—'} • Email: {activeCompany.email || '—'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[9.5px] font-mono font-bold">
                  <span className="text-[#f37021]">TRN: {activeCompany.trn}</span>
                  {Boolean(getCompanyIsoText(activeCompany)) && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">{getCompanyIsoText(activeCompany)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] border-l border-slate-200 pl-4 hidden md:block">
              <div><span className="text-slate-400 font-semibold">QUOTATION TITLE:</span> <strong className="text-[#083c54]">PRICE PROPOSAL</strong></div>
              <div><span className="text-slate-400 font-semibold">CURRENCY:</span> <strong>AED (UNITED ARAB EMIRATES DIRHAM)</strong></div>
            </div>
          </div>

          {/* Metadata Grid (Client Left, Document Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Left Box: Client / Purchaser Details */}
            <div className="border border-slate-300 rounded-xs p-3.5 space-y-2 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-[#083c54]">
                  CLIENT / PURCHASER DETAILS
                </h3>
                <span className="text-[8px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  AUTO-SUGGEST ACTIVE
                </span>
              </div>

              <div className="space-y-1.5">
                <div ref={clientInputContainerRef} className="relative">
                  <label className="text-[9px] text-slate-500 uppercase font-bold flex items-center justify-between">
                    <span>M/s. (Client Company Name)</span>
                    <span className="text-[8px] text-blue-600 font-bold uppercase tracking-wider">Auto-Suggest Active</span>
                  </label>
                  <div className="relative mt-0.5">
                    <input
                      id="header-client-name"
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setShowClientSuggestions(true);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                        setShowClientSuggestions(true);
                      }}
                      onKeyDown={(e) => handleHeaderNav(e, 'header-client-address')}
                      placeholder="Type company name to auto-suggest..."
                      className="w-full px-2.5 py-1.5 pr-6 border border-slate-300 rounded-xs text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    {clientName && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientName('');
                          setShowClientSuggestions(true);
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] p-0.5"
                        title="Clear Client Name"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Auto-suggest Dropdown */}
                  {showClientSuggestions && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs font-sans">
                      <div className="px-2.5 py-1 bg-slate-100 text-[9px] font-bold text-slate-600 uppercase font-mono flex justify-between items-center">
                        <span>Matching Companies ({visibleCustomers.filter(c => !clientName.trim() || c.companyName.toLowerCase().includes(clientName.toLowerCase().trim()) || (c.code && c.code.toLowerCase().includes(clientName.toLowerCase().trim()))).length})</span>
                        <span className="text-[8px] text-blue-600">Click to Auto-Fill</span>
                      </div>
                      {visibleCustomers
                        .filter(c => !clientName.trim() || c.companyName.toLowerCase().includes(clientName.toLowerCase().trim()) || (c.code && c.code.toLowerCase().includes(clientName.toLowerCase().trim())))
                        .map((cust) => (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              setClientName(cust.companyName);
                              setClientAddress(cust.address || '');
                              setClientPoBox(cust.poBox || '');
                              setClientPhone(cust.phone || '');
                              setClientTrn(cust.trn || '');
                              if (cust.contactPerson) setPurchaserContactPerson(cust.contactPerson);
                              if (cust.designation) setPurchaserDesignation(cust.designation);
                              if (cust.phone) setPurchaserPhone(cust.phone);
                              if (cust.mobile) setPurchaserMobile(cust.mobile);
                              if (cust.email) setPurchaserEmail(cust.email);
                              setShowClientSuggestions(false);
                              if (triggerToast) triggerToast(`Selected ${cust.companyName} - Details auto-filled!`);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50/90 transition-colors cursor-pointer flex flex-col gap-0.5"
                          >
                            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                              <span>{cust.companyName}</span>
                              <span className="text-[9px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-mono font-bold">{cust.code}</span>
                            </div>
                            <div className="text-[9.5px] text-slate-500 truncate flex items-center gap-1.5 font-mono">
                              <span>👤 {cust.contactPerson || 'Procurement'}</span>
                              <span>•</span>
                              <span>📍 {cust.address || 'UAE'}</span>
                              {cust.trn && (
                                <>
                                  <span>•</span>
                                  <span>TRN: {cust.trn}</span>
                                </>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">Address</label>
                  <input
                    id="header-client-address"
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-pobox')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block font-bold">PO Box</label>
                    <input
                      id="header-pobox"
                      type="text"
                      value={clientPoBox}
                      onChange={(e) => setClientPoBox(e.target.value)}
                      onKeyDown={(e) => handleHeaderNav(e, 'header-phone')}
                      className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block font-bold">Phone</label>
                    <input
                      id="header-phone"
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      onKeyDown={(e) => handleHeaderNav(e, 'header-trn')}
                      className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block font-bold">TRN</label>
                    <input
                      id="header-trn"
                      type="text"
                      value={clientTrn}
                      onChange={(e) => setClientTrn(e.target.value)}
                      onKeyDown={(e) => handleHeaderNav(e, 'header-contact')}
                      className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Purchaser Contact & Multi-Purchaser Dropdown */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                      <span>Purchaser Contact</span>
                      {activeMatchedCustomer && activeMatchedCustomer.concernPersons && activeMatchedCustomer.concernPersons.length > 1 && (
                        <span className="text-[8px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded font-mono">
                          {activeMatchedCustomer.concernPersons.length} Purchasers On File
                        </span>
                      )}
                    </label>
                    {activeMatchedCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetCustomerForPurchaser(activeMatchedCustomer);
                          setPurchaserModalForm({
                            name: '',
                            code: '',
                            designation: 'Procurement Specialist',
                            email: '',
                            mobile: '',
                            phone: activeMatchedCustomer.phone || ''
                          });
                          setIsAddPurchaserModalOpen(true);
                        }}
                        className="text-[8.5px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Register a new purchaser contact under this client"
                      >
                        <UserPlus className="w-3 h-3 text-blue-600" />
                        <span>+ Add Purchaser</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Selector if multiple or saved purchasers exist */}
                  {activeMatchedCustomer && activeMatchedCustomer.concernPersons && activeMatchedCustomer.concernPersons.length > 0 && (
                    <div className="bg-sky-50/60 border border-sky-200 rounded p-1.5">
                      <div className="text-[8px] text-sky-800 font-bold uppercase mb-0.5 flex items-center justify-between">
                        <span>Select Purchaser from Dropdown:</span>
                      </div>
                      <select
                        value={
                          activeMatchedCustomer.concernPersons.find(cp => cp.name.toLowerCase().trim() === purchaserContactPerson.toLowerCase().trim())?.name || ''
                        }
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const cp = activeMatchedCustomer.concernPersons?.find(p => p.name === selectedName);
                          if (cp) {
                            setPurchaserContactPerson(cp.name);
                            setPurchaserDesignation(cp.designation);
                            setPurchaserEmail(cp.email);
                            setPurchaserMobile(cp.mobile);
                            if (cp.phone || activeMatchedCustomer.phone) setPurchaserPhone(cp.phone || activeMatchedCustomer.phone || '');
                            if (triggerToast) triggerToast(`Loaded purchaser: ${cp.name}`);
                          }
                        }}
                        className="w-full px-2 py-1 bg-white border border-sky-300 rounded text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500/30"
                      >
                        <option value="">-- Choose Purchaser ({activeMatchedCustomer.concernPersons.length} available) --</option>
                        {activeMatchedCustomer.concernPersons.map(cp => (
                          <option key={cp.id} value={cp.name}>
                            {cp.name} {cp.designation ? `— ${cp.designation}` : ''} {cp.email ? `(${cp.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block font-bold">Purchaser Name</label>
                      <input
                        id="header-contact"
                        type="text"
                        value={purchaserContactPerson}
                        onChange={(e) => setPurchaserContactPerson(e.target.value)}
                        onKeyDown={(e) => handleHeaderNav(e, 'header-email')}
                        placeholder="e.g. Mr. Akil Kumar"
                        className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 uppercase block font-bold">Purchaser Email</label>
                      <input
                        id="header-email"
                        type="email"
                        value={purchaserEmail}
                        onChange={(e) => setPurchaserEmail(e.target.value)}
                        onKeyDown={(e) => handleHeaderNav(e, 'item-description-0')}
                        placeholder="e.g. store@client.ae"
                        className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Quotation Meta & Commercial Terms */}
            <div className="border border-slate-300 rounded-xs p-3.5 space-y-2 bg-white shadow-xs">
              <div className="border-b border-slate-200 pb-1.5">
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-[#083c54]">
                  QUOTATION REFERENCES & TERMS
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">Quotation Ref Num</label>
                  <input
                    id="header-quotation-ref"
                    type="text"
                    value={quotationRefNum}
                    onChange={(e) => setQuotationRefNum(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-quotation-date')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-bold text-amber-800 bg-amber-50/30"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">Date</label>
                  <input
                    id="header-quotation-date"
                    type="text"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-rfq-no')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">RFQ No.</label>
                  <input
                    id="header-rfq-no"
                    type="text"
                    value={rfqNo}
                    onChange={(e) => setRfqNo(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-tender-no')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-amber-900 uppercase block font-bold flex items-center justify-between">
                    <span>Tender No.</span>
                    {tenderNo.trim() !== '' && !rfqNo.trim() && (
                      <span className="text-[8px] text-amber-700 bg-amber-100 px-1 rounded font-extrabold">REPLACES RFQ</span>
                    )}
                  </label>
                  <input
                    id="header-tender-no"
                    type="text"
                    value={tenderNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTenderNo(val);
                      if (val.trim() !== '' && !rfqNo.trim() && !tenderDate) {
                        setTenderDate(rfqDate || '23-Jul-26');
                      }
                    }}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-rfq-date')}
                    className="w-full px-2 py-1 border border-amber-300 rounded-xs text-xs bg-amber-50/20 font-medium"
                    placeholder="e.g. TND-2026-001"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase block font-bold">
                    {tenderNo.trim() !== '' && !rfqNo.trim() ? (
                      <span className="text-amber-900 font-extrabold flex items-center gap-1">
                        <span>TENDER DATE</span>
                        <span className="text-[8px] bg-amber-200 text-amber-900 px-1 rounded font-normal">(Replaced RFQ Date)</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">RFQ Date</span>
                    )}
                  </label>
                  <input
                    id="header-rfq-date"
                    type="text"
                    value={tenderNo.trim() !== '' && !rfqNo.trim() ? (tenderDate || rfqDate) : rfqDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (tenderNo.trim() !== '' && !rfqNo.trim()) {
                        setTenderDate(val);
                        setRfqDate(val);
                      } else {
                        setRfqDate(val);
                        if (tenderNo.trim() !== '') setTenderDate(val);
                      }
                    }}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-sacc')}
                    className={`w-full px-2 py-1 border rounded-xs text-xs ${
                      tenderNo.trim() !== '' && !rfqNo.trim()
                        ? 'border-amber-400 bg-amber-50/40 font-bold text-amber-950'
                        : 'border-slate-300'
                    }`}
                  />
                </div>

                {tenderNo.trim() !== '' && rfqNo.trim() !== '' && (
                  <div>
                    <label className="text-[9px] text-amber-900 uppercase block font-bold">Tender Date</label>
                    <input
                      id="header-tender-date"
                      type="text"
                      value={tenderDate || rfqDate}
                      onChange={(e) => setTenderDate(e.target.value)}
                      onKeyDown={(e) => handleHeaderNav(e, 'header-sacc')}
                      className="w-full px-2 py-1 border border-amber-300 rounded-xs text-xs bg-amber-50/30 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[9px] text-[#083c54] uppercase block font-bold">S. ACC. (Sales Account Ref)</label>
                  <input
                    id="header-sacc"
                    type="text"
                    value={sAcc}
                    onChange={(e) => setSAcc(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-validity')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-bold text-slate-900 bg-blue-50/20"
                    placeholder="FHM"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">Offer Validity</label>
                  <input
                    id="header-validity"
                    type="text"
                    value={offerValidity}
                    onChange={(e) => setOfferValidity(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-payment')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">Payment Terms</label>
                  <input
                    id="header-payment"
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-delivery')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">Delivery Terms / Lead Time</label>
                  <input
                    id="header-delivery"
                    type="text"
                    value={deliveryLeadTime}
                    onChange={(e) => setDeliveryLeadTime(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-hscode')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-bold">H.S. CODE</label>
                  <input
                    id="header-hscode"
                    type="text"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'item-description-0')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-[#083c54] uppercase block font-bold">Currency</label>
                  <input
                    id="header-currency"
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'header-madein')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs font-bold text-slate-900 bg-amber-50/20"
                    placeholder="AED"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-[#083c54] uppercase block font-bold">Country of Origin</label>
                  <input
                    id="header-madein"
                    type="text"
                    value={madeIn}
                    onChange={(e) => setMadeIn(e.target.value)}
                    onKeyDown={(e) => handleHeaderNav(e, 'item-description-0')}
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs text-slate-900"
                    placeholder="U.A.E."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Spreadsheet Table */}
          <div className="space-y-2 font-mono text-xs">
            {/* Double Line QUOTATION Section Title */}
            <div className="relative my-4 flex items-center justify-center select-none">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-b-2 border-[#083c54] h-1" />
              </div>
              <div className="relative bg-[#083c54] text-white px-8 py-1 rounded-xs shadow-xs border-2 border-white">
                <span className="font-black tracking-widest text-base sm:text-lg uppercase italic">
                  QUOTATION
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-xs border border-slate-300">
              <div className="text-[11px] font-extrabold text-[#083c54] font-mono flex items-center gap-1.5 px-1">
                <span>LINE ITEMS ({items.length})</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedRowIds.size > 0 && (
                  <button
                    type="button"
                    onClick={deleteSelectedRows}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-[10.5px] font-medium font-sans rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete ({selectedRowIds.size})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={pastItems.length === 0}
                  className={`px-2.5 py-1 text-[10.5px] font-medium font-sans rounded-xs flex items-center gap-1 transition-all ${
                    pastItems.length > 0
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs'
                      : 'bg-slate-100/60 text-slate-300 border border-slate-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Undo last change (Ctrl+Z)"
                >
                  <Undo className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={futureItems.length === 0}
                  className={`px-2.5 py-1 text-[10.5px] font-medium font-sans rounded-xs flex items-center gap-1 transition-all ${
                    futureItems.length > 0
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs'
                      : 'bg-slate-100/60 text-slate-300 border border-slate-200 cursor-not-allowed opacity-50'
                  }`}
                  title="Redo last change (Ctrl+Y)"
                >
                  <Redo className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Redo</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyTableForExcel}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[10.5px] font-medium font-sans rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Copy table formatted for Excel"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-600" />
                  <span>Excel Copy</span>
                </button>

                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-3 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-[11px] font-sans rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-colors"
                  title="Add new item row"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Add Row</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-300">
              <table id="quotation-items-table" ref={tableRef} className="w-full text-left text-[10px] border-collapse select-text">
                <thead>
                  <tr className="bg-[#083c54] text-white font-bold uppercase text-[9px]">
                    <th
                      id="header-sn"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'sn')}
                      className="p-2 text-center w-10 select-none outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      S/L
                    </th>
                    <th
                      id="header-description"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'description')}
                      className="p-2 min-w-[200px] outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      ITEM DESCRIPTION
                    </th>
                    <th
                      id="header-finish"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'finish')}
                      className="p-2 w-16 text-center outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      FINISH
                    </th>
                    <th
                      id="header-unit"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'unit')}
                      className="p-2 w-16 text-center outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      UNIT
                    </th>
                    <th
                      id="header-qty"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'qty')}
                      className="p-2 w-16 text-center outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      QTY
                    </th>
                    <th
                      id="header-unitPrice"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'unitPrice')}
                      className="p-2 w-20 text-right outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      U. PRICE
                    </th>
                    <th
                      id="header-extPrice"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'extPrice')}
                      className="p-2 w-20 text-right outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      EXT. PRICE
                    </th>
                    <th
                      id="header-unitWeight"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'unitWeight')}
                      className="p-2 w-20 text-center text-amber-200 bg-[#0a4864] outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                      title="Unit weight in KG (Click or use Arrow keys to navigate)"
                    >
                      U. WEIGHT (KG)
                    </th>
                    <th
                      id="header-totalWeight"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'totalWeight')}
                      className="p-2 w-20 text-center text-amber-200 bg-[#0a4864] outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                      title="Total weight in KG (Click or use Arrow keys to navigate)"
                    >
                      T. WEIGHT (KG)
                    </th>
                    <th
                      id="header-discount"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'discount')}
                      className="p-2 w-18 text-right outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      DISCOUNT
                    </th>
                    <th
                      id="header-totalExcl"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'totalExcl')}
                      className="p-2 w-20 text-right outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      TOTAL EXCL. VAT
                    </th>
                    <th
                      id="header-vat"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'vat')}
                      className="p-2 w-18 text-right outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      VAT ({currency})
                    </th>
                    <th
                      id="header-total"
                      tabIndex={0}
                      onKeyDown={(e) => handleHeaderKeyDown(e, 'total')}
                      className="p-2 w-22 text-right outline-none focus:ring-2 focus:ring-amber-300 focus:bg-[#0a4864] cursor-pointer"
                      title="Click or use Arrow keys to navigate header"
                    >
                      TOTAL ({currency})
                    </th>
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => {
                    const q = Number(it.qty) || 0;
                    const up = Number(it.unitPrice) || 0;
                    const uw = Number(it.unitWeight) || 0;
                    const tw = q * uw;
                    const ext = q * up;
                    const disc = Number(it.discount) || 0;
                    const totalExcl = Math.max(0, ext - disc);
                    const vat = totalExcl * 0.05;
                    const tot = totalExcl + vat;
                    return (
                      <tr
                        key={it.id}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            rowIndex: idx
                          });
                        }}
                        className={`transition-colors ${
                          selectedRowIds.has(it.id)
                            ? 'bg-blue-100/90 ring-2 ring-blue-500/60 font-bold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td
                          id={`item-sn-${idx}`}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.shiftKey) {
                              updateCellSelection(true, idx, 0, idx, 0);
                            } else if (e.ctrlKey || e.metaKey) {
                              setSelectedRowIds(prev => {
                                const next = new Set(prev);
                                if (next.has(it.id)) next.delete(it.id);
                                else next.add(it.id);
                                return next;
                              });
                            } else {
                              setSelectedRowIds(prev => (prev.has(it.id) && prev.size === 1 ? new Set() : new Set([it.id])));
                              updateCellSelection(false, idx, 0, idx, 0);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (e.button === 0) {
                              isMouseDownCellRef.current = true;
                              updateCellSelection(e.shiftKey, idx, 0, idx, 0);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                              updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 0);
                            }
                          }}
                          onFocus={() => {
                            if (!isShiftNavigatingRef.current) {
                              setSelectedCellRange({ anchor: { row: idx, col: 0 }, focus: { row: idx, col: 0 } });
                            }
                            isShiftNavigatingRef.current = false;
                          }}
                          onKeyDown={(e) => handleSnKeyDown(e, idx)}
                          className={`p-1.5 text-center font-bold cursor-pointer select-none transition-colors outline-none focus:ring-2 focus:ring-amber-400 ${
                            isCellInSelectedRange(idx, 0)
                              ? isMultiCellSelection()
                                ? isCellAnchor(idx, 0)
                                  ? '!bg-white !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                                  : '!bg-emerald-100/90 !text-emerald-950 font-extrabold !border !border-emerald-400'
                                : '!bg-emerald-50/90 !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                              : selectedRowIds.has(it.id) ? 'bg-blue-600 text-white font-black' : 'text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to select cell (or use Shift+Arrow keys to select range)"
                        >
                          {it.sn}
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-description-${idx}`}
                            type="text"
                            value={it.description || ''}
                            onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 1 }, focus: { row: idx, col: 1 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 1, idx, 1);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 1);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 1, idx, 1);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'description')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1.5 py-1 border rounded-xs text-[10px] font-bold text-slate-900 ${getInputCellClass(idx, 1)}`}
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-finish-${idx}`}
                            type="text"
                            value={it.finish || ''}
                            onChange={(e) => updateItem(it.id, 'finish', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 2 }, focus: { row: idx, col: 2 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 2, idx, 2);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 2);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 2, idx, 2);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'finish')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1.5 py-1 border rounded-xs text-[10px] text-center ${getInputCellClass(idx, 2)}`}
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-unit-${idx}`}
                            type="text"
                            value={it.unit || ''}
                            onChange={(e) => updateItem(it.id, 'unit', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 3 }, focus: { row: idx, col: 3 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 3, idx, 3);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 3);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 3, idx, 3);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'unit')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1.5 py-1 border rounded-xs text-[10px] text-center uppercase ${getInputCellClass(idx, 3)}`}
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-qty-${idx}`}
                            type="number"
                            value={it.qty === 0 || it.qty === '' || it.qty === undefined ? '' : it.qty}
                            onChange={(e) => updateItem(it.id, 'qty', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 4 }, focus: { row: idx, col: 4 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 4, idx, 4);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 4);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 4, idx, 4);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'qty')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1.5 py-1 border rounded-xs text-[10px] text-center font-bold text-slate-900 ${getInputCellClass(idx, 4)}`}
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            id={`item-unitPrice-${idx}`}
                            type="number"
                            step="0.01"
                            value={it.unitPrice === 0 || it.unitPrice === '' || it.unitPrice === undefined ? '' : it.unitPrice}
                            onChange={(e) => updateItem(it.id, 'unitPrice', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 5 }, focus: { row: idx, col: 5 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 5, idx, 5);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 5);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 5, idx, 5);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'unitPrice')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1.5 py-1 border rounded-xs text-[10px] text-right font-bold text-slate-900 ${getInputCellClass(idx, 5)}`}
                          />
                        </td>
                        <td
                          id={`item-extPrice-${idx}`}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.shiftKey) {
                              updateCellSelection(true, idx, 6, idx, 6);
                            } else {
                              updateCellSelection(false, idx, 6, idx, 6);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (e.button === 0) {
                              isMouseDownCellRef.current = true;
                              updateCellSelection(e.shiftKey, idx, 6, idx, 6);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                              updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 6);
                            }
                          }}
                          onFocus={() => {
                            if (!isShiftNavigatingRef.current) {
                              setSelectedCellRange({ anchor: { row: idx, col: 6 }, focus: { row: idx, col: 6 } });
                            }
                            isShiftNavigatingRef.current = false;
                          }}
                          onKeyDown={(e) => handleReadOnlyCellKeyDown(e, idx, 6)}
                          className={`p-1.5 text-right font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 select-none ${
                            isCellInSelectedRange(idx, 6)
                              ? isMultiCellSelection()
                                ? isCellAnchor(idx, 6)
                                  ? '!bg-white !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10 shadow-xs'
                                  : '!bg-emerald-100/90 !text-emerald-950 font-extrabold !border !border-emerald-400'
                                : '!bg-emerald-50/90 !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                          title="Calculated EXT. PRICE (Click or use Shift+Arrow keys to select range)"
                        >
                          {ext.toFixed(2)}
                        </td>
                        
                        {/* Freight Calculation Columns (Internal - Hidden from PDF) */}
                        <td className="p-1.5 bg-amber-50/20">
                          <input
                            id={`item-unitWeight-${idx}`}
                            type="number"
                            step="0.001"
                            placeholder=""
                            value={it.unitWeight === 0 || it.unitWeight === '' || it.unitWeight === undefined ? '' : it.unitWeight}
                            onChange={(e) => updateItem(it.id, 'unitWeight', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 7 }, focus: { row: idx, col: 7 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 7, idx, 7);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 7);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 7, idx, 7);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'unitWeight')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1 py-1 border rounded-xs text-[10px] text-center font-bold ${getInputCellClass(idx, 7, 'border-amber-300 bg-amber-50/40 text-amber-900')}`}
                            title="Unit weight in KG (for internal freight calculation)"
                          />
                        </td>
                        <td
                          id={`item-totalWeight-${idx}`}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.shiftKey) {
                              updateCellSelection(true, idx, 8, idx, 8);
                            } else {
                              updateCellSelection(false, idx, 8, idx, 8);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (e.button === 0) {
                              isMouseDownCellRef.current = true;
                              updateCellSelection(e.shiftKey, idx, 8, idx, 8);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                              updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 8);
                            }
                          }}
                          onFocus={() => {
                            if (!isShiftNavigatingRef.current) {
                              setSelectedCellRange({ anchor: { row: idx, col: 8 }, focus: { row: idx, col: 8 } });
                            }
                            isShiftNavigatingRef.current = false;
                          }}
                          onKeyDown={(e) => handleReadOnlyCellKeyDown(e, idx, 8)}
                          className={`p-1.5 text-center font-extrabold cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 select-none ${
                            isCellInSelectedRange(idx, 8)
                              ? isMultiCellSelection()
                                ? isCellAnchor(idx, 8)
                                  ? '!bg-white !text-amber-950 !ring-2 !ring-emerald-600 font-bold z-10'
                                  : '!bg-emerald-100/90 !text-emerald-950 font-extrabold !border !border-emerald-400'
                                : '!bg-emerald-50/90 !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                              : 'text-amber-900 bg-amber-50/40 hover:bg-amber-100/60 border-x border-amber-200/50'
                          }`}
                          title="Calculated T. WEIGHT (Click or use Shift+Arrow keys to select range)"
                        >
                          {tw ? tw.toFixed(2) : '0.00'}
                        </td>

                        <td className="p-1.5">
                          <input
                            id={`item-discount-${idx}`}
                            type="number"
                            step="0.01"
                            value={it.discount === 0 || it.discount === '' || it.discount === undefined ? '' : it.discount}
                            onChange={(e) => updateItem(it.id, 'discount', e.target.value)}
                            onFocus={(e) => {
                              e.target.select();
                              if (!isShiftNavigatingRef.current) {
                                setSelectedCellRange({ anchor: { row: idx, col: 9 }, focus: { row: idx, col: 9 } });
                              }
                              isShiftNavigatingRef.current = false;
                              editingCellOriginalItemsRef.current = JSON.parse(JSON.stringify(itemsRef.current));
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                isMouseDownCellRef.current = true;
                                updateCellSelection(e.shiftKey, idx, 9, idx, 9);
                              }
                            }}
                            onMouseEnter={() => {
                              if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                                updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 9);
                              }
                            }}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                updateCellSelection(true, idx, 9, idx, 9);
                              }
                            }}
                            onKeyDown={(e) => handleItemKeyDown(e, idx, 'discount')}
                            onPaste={(e) => handleItemPaste(e, idx)}
                            className={`w-full px-1 py-1 border rounded-xs text-[10px] text-right font-bold text-slate-900 ${getInputCellClass(idx, 9)}`}
                          />
                        </td>
                        <td
                          id={`item-totalExcl-${idx}`}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.shiftKey) {
                              updateCellSelection(true, idx, 10, idx, 10);
                            } else {
                              updateCellSelection(false, idx, 10, idx, 10);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (e.button === 0) {
                              isMouseDownCellRef.current = true;
                              updateCellSelection(e.shiftKey, idx, 10, idx, 10);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                              updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 10);
                            }
                          }}
                          onFocus={() => {
                            if (!isShiftNavigatingRef.current) {
                              setSelectedCellRange({ anchor: { row: idx, col: 10 }, focus: { row: idx, col: 10 } });
                            }
                            isShiftNavigatingRef.current = false;
                          }}
                          onKeyDown={(e) => handleReadOnlyCellKeyDown(e, idx, 10)}
                          className={`p-1.5 text-right font-bold cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 select-none ${
                            isCellInSelectedRange(idx, 10)
                              ? isMultiCellSelection()
                                ? isCellAnchor(idx, 10)
                                  ? '!bg-white !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                                  : '!bg-emerald-100/90 !text-emerald-950 font-extrabold !border !border-emerald-400'
                                : '!bg-emerald-50/90 !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                              : 'text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Calculated TOTAL EXCL. VAT (Click or use Shift+Arrow keys to select range)"
                        >
                          {totalExcl.toFixed(2)}
                        </td>
                        <td
                          id={`item-vat-${idx}`}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.shiftKey) {
                              updateCellSelection(true, idx, 11, idx, 11);
                            } else {
                              updateCellSelection(false, idx, 11, idx, 11);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (e.button === 0) {
                              isMouseDownCellRef.current = true;
                              updateCellSelection(e.shiftKey, idx, 11, idx, 11);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                              updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 11);
                            }
                          }}
                          onFocus={() => {
                            if (!isShiftNavigatingRef.current) {
                              setSelectedCellRange({ anchor: { row: idx, col: 11 }, focus: { row: idx, col: 11 } });
                            }
                            isShiftNavigatingRef.current = false;
                          }}
                          onKeyDown={(e) => handleReadOnlyCellKeyDown(e, idx, 11)}
                          className={`p-1.5 text-right font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 select-none ${
                            isCellInSelectedRange(idx, 11)
                              ? isMultiCellSelection()
                                ? isCellAnchor(idx, 11)
                                  ? '!bg-white !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                                  : '!bg-emerald-100/90 !text-emerald-950 font-extrabold !border !border-emerald-400'
                                : '!bg-emerald-50/90 !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Calculated VAT (Click or use Shift+Arrow keys to select range)"
                        >
                          {vat.toFixed(2)}
                        </td>
                        <td
                          id={`item-total-${idx}`}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.shiftKey) {
                              updateCellSelection(true, idx, 12, idx, 12);
                            } else {
                              updateCellSelection(false, idx, 12, idx, 12);
                            }
                          }}
                          onMouseDown={(e) => {
                            if (e.button === 0) {
                              isMouseDownCellRef.current = true;
                              updateCellSelection(e.shiftKey, idx, 12, idx, 12);
                            }
                          }}
                          onMouseEnter={() => {
                            if (isMouseDownCellRef.current && selectedCellRangeRef.current) {
                              updateCellSelection(true, selectedCellRangeRef.current.anchor.row, selectedCellRangeRef.current.anchor.col, idx, 12);
                            }
                          }}
                          onFocus={() => {
                            if (!isShiftNavigatingRef.current) {
                              setSelectedCellRange({ anchor: { row: idx, col: 12 }, focus: { row: idx, col: 12 } });
                            }
                            isShiftNavigatingRef.current = false;
                          }}
                          onKeyDown={(e) => handleReadOnlyCellKeyDown(e, idx, 12)}
                          className={`p-1.5 text-right font-extrabold cursor-pointer outline-none focus:ring-2 focus:ring-amber-400 select-none ${
                            isCellInSelectedRange(idx, 12)
                              ? isMultiCellSelection()
                                ? isCellAnchor(idx, 12)
                                  ? '!bg-white !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                                  : '!bg-emerald-100/90 !text-emerald-950 font-extrabold !border !border-emerald-400'
                                : '!bg-emerald-50/90 !text-slate-900 !ring-2 !ring-emerald-600 font-bold z-10'
                              : 'text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Calculated TOTAL (Click or use Shift+Arrow keys to select range)"
                        >
                          {tot.toFixed(2)}
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(it.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-[10px] uppercase font-mono">
                  <tr>
                    <td colSpan={5} className="p-2 text-right text-slate-600">TOTAL:</td>
                    <td className="p-2 text-right text-slate-800">
                      {items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-slate-800">
                      {items.reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-center text-amber-900 bg-amber-100/70 font-black border-x border-amber-300 text-[9px]">TOTAL WT</td>
                    <td className="p-2 text-center text-amber-950 bg-amber-200 font-black border-x border-amber-400 text-[11px] shadow-3xs" title="Calculated Total Weight in KG">
                      {totalWeightKg.toFixed(2)} KG
                    </td>
                    <td className="p-2 text-right text-slate-800">
                      {items.reduce((s, it) => s + (Number(it.discount) || 0), 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-slate-900 font-black">
                      {subtotalAmount.toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-slate-700">
                      {totalTaxAmount.toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-[#083c54] font-black text-[11px]">
                      {(subtotalAmount + totalTaxAmount).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
            {/* Notes Clauses */}
            <div className="border border-slate-300 p-3 bg-slate-50/50 space-y-2">
              <h4 className="font-bold text-[10px] uppercase text-slate-800">Quotation Terms & Notes</h4>
              <ul className="space-y-1.5 text-[9.5px] text-slate-700">
                {notesList.map((n, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#f37021] font-bold">•</span>
                    <input
                      type="text"
                      value={n}
                      onChange={(e) => {
                        const updated = [...notesList];
                        updated[idx] = e.target.value;
                        setNotesList(updated);
                      }}
                      className="flex-1 bg-transparent border-b border-slate-200 text-[9.5px]"
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Calculations Box */}
            <div className="border border-slate-300 p-3 bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 font-bold text-slate-800">
                <span>TOTAL IN {currency} :</span>
                <span>{subtotalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-600">
                <span>DISCOUNT IN {currency} :</span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-24 px-1 py-0.5 border border-slate-300 text-right text-xs"
                />
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-600">
                <span>FREIGHT/EXTRA CHARGES IN {currency} :</span>
                <input
                  type="number"
                  value={freightAmount}
                  onChange={(e) => setFreightAmount(Number(e.target.value))}
                  className="w-24 px-1 py-0.5 border border-slate-300 text-right text-xs"
                />
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 text-amber-900 bg-amber-50/60 px-1 font-bold">
                <span>ESTIMATED TOTAL WEIGHT (KG) :</span>
                <span>{totalWeightKg.toFixed(2)} KG</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 font-bold text-slate-900">
                <span>TOTAL {currency} BEFORE TAX :</span>
                <span>{totalBeforeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 text-slate-700">
                <span>5% TAX AMOUNT IN {currency} :</span>
                <span>{totalVatCalculated.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-amber-50 px-2 border-t-2 border-[#083c54] text-sm font-black text-[#083c54]">
                <span>TOTAL AMOUNT IN {currency} :</span>
                <span>{totalInvoiceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: QUOTATION RECORDS (COMPACT SPREADSHEET LOG DESIGN) */}
      {activeSubTab === 'records' && (
        <QuotationRecordsComponent
          quotationRecords={quotationRecords}
          setQuotationRecords={setQuotationRecords}
          customers={visibleCustomers}
          onNavigateToQuoteForm={() => setActiveSubTab('quotation')}
          onLoadQuoteIntoForm={handleLoadQuoteRecordToForm}
          onViewQuotePreview={(q) => setPreviewModalQuote(q)}
          triggerToast={triggerToast}
          currentUser={activeUser}
        />
      )}

      {/* VIEW QUOTATION MODAL DIALOG WITH CLOSE BUTTON */}
      {previewModalQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
          <div className="bg-white border-2 border-slate-900 rounded-xs shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#083c54] text-white p-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#f37021]" />
                <span className="font-extrabold text-xs uppercase tracking-tight">
                  Quotation Proposal Details: {previewModalQuote.quotationRef}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setPreviewModalQuote(null);
                  setActiveSubTab('records');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-rose-700 text-white font-black text-[10px] uppercase rounded-xs cursor-pointer flex items-center gap-1 transition-colors border border-slate-700"
                title="Close Quotation View (Return to Records Log)"
              >
                <X className="w-3.5 h-3.5" />
                <span>CLOSE</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 bg-slate-50/50">
              {/* Client & Date Info */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 bg-white">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">CLIENT / BUYER</span>
                  <p className="font-extrabold text-sm text-[#083c54]">{cleanPdfText(previewModalQuote.client)}</p>
                  <p className="text-[10px] text-slate-600 mt-1">Inquiry Contact: <strong>{cleanPdfText(previewModalQuote.inquiryBy)}</strong></p>
                  <p className="text-[10px] text-slate-600">Email: {previewModalQuote.email}</p>
                </div>

                <div className="text-right space-y-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">QUOTATION REF</span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      {previewModalQuote.quotationRef}
                    </span>
                  </div>
                  <div className="text-[10px] space-y-0.5">
                    {previewModalQuote.tenderNo ? (
                      <div>
                        <span className="text-amber-800 font-bold">Tender No:</span> <strong>{previewModalQuote.tenderNo}</strong>
                        {previewModalQuote.tenderDate && <> | <span className="text-amber-800 font-bold">Tender Date:</span> <strong>{previewModalQuote.tenderDate}</strong></>}
                        {previewModalQuote.rfqNumber && <> | <span className="text-slate-500">RFQ No:</span> <strong>{previewModalQuote.rfqNumber}</strong></>}
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-500">RFQ No:</span> <strong>{previewModalQuote.rfqNumber || '—'}</strong>
                        {previewModalQuote.rfqDate && <> | <span className="text-slate-500">RFQ Date:</span> <strong>{previewModalQuote.rfqDate}</strong></>}
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Quotation Date:</span> <strong>{previewModalQuote.quotationDate}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border border-slate-300 p-4 bg-white space-y-2">
                <div className="flex items-center justify-between text-slate-700 pb-2 border-b border-slate-200">
                  <span>Gross Quotation Amount:</span>
                  <span className="font-bold">AED {previewModalQuote.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-[#083c54] font-black text-sm pt-1">
                  <span>Total Net Value (Incl VAT):</span>
                  <span className="text-base text-[#f37021]">AED {previewModalQuote.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase pt-1">
                <span className={`px-2 py-1 rounded border ${previewModalQuote.steelOpen ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  Steel Open: {previewModalQuote.steelOpen ? 'YES' : 'NO'}
                </span>
                <span className={`px-2 py-1 rounded border ${previewModalQuote.win ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  Status: {previewModalQuote.win ? 'WON DEAL' : previewModalQuote.lost ? 'LOST' : 'PENDING'}
                </span>
                <span className={`px-2 py-1 rounded border ${previewModalQuote.closed ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  Closed: {previewModalQuote.closed ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            {/* Modal Footer Toolbar */}
            <div className="bg-slate-100 p-3 border-t border-slate-300 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (previewModalQuote) {
                    handleLoadQuoteRecordToForm(previewModalQuote);
                  }
                  setPreviewModalQuote(null);
                }}
                className="px-3 py-1.5 bg-[#f37021] hover:bg-[#d85e13] text-white font-bold text-xs uppercase rounded-xs cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Load Into Form & Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewModalQuote(null);
                  setActiveSubTab('records');
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs uppercase rounded-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Close Quotation View (Return to Records Log)"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>CLOSE VIEW</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE A4 QUOTATION PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto antialiased">
          <div className="bg-white border-2 border-slate-700 w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl rounded-xs overflow-hidden">
            {/* Modal Header Bar */}
            <div className="bg-[#083c54] text-white p-3 flex items-center justify-between border-b border-slate-700 font-mono shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wide">
                  Live Document Preview — Quotation Ref: {quotationRefNum}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase rounded cursor-pointer flex items-center justify-center shadow-2xs border border-blue-400/30"
                  title="Direct Download PDF"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrintQuotation();
                  }}
                  className="px-3 py-1.5 bg-[#f37021] hover:bg-[#d85e13] text-white font-bold text-xs uppercase rounded cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    if (openedFromRecords) {
                      setActiveSubTab('records');
                    }
                  }}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Document Preview Body */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-200/80 flex justify-center flex-1">
              {/* Outer A4 Visual Sheet Frame */}
              <div className="relative bg-white border border-slate-300 shadow-xl w-full max-w-[210mm] text-slate-900 font-sans text-[11px] leading-tight p-6 sm:p-8 space-y-3">
                
                {/* Client & Commercial Details */}
                <div className="border border-slate-900 grid grid-cols-1 sm:grid-cols-2 text-[10px]">
                    <div className="p-2 space-y-1 sm:border-r border-slate-900">
                      <div className="font-bold underline text-[#083c54]">SUPPLIER/EXPORTER:</div>
                      <div className="font-black text-[11.5px] text-slate-900 mb-0.5 uppercase">{activeCompany.name}</div>
                      <div className="text-slate-600">{(activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}</div>
                      <div><b>VAT TRN:</b> {activeCompany.trn}</div>
                      <hr className="my-1 border-slate-300" />
                      <div className="font-bold underline text-[#083c54]">CLIENT / BUYER:</div>
                      <div className="font-bold text-slate-900">M/s. {cleanPdfText(clientName)}</div>
                      <div>Address: {clientAddress}</div>
                      <div>PO Box: {clientPoBox} | Phone: {clientPhone}</div>
                      <div><b>TRN:</b> {clientTrn}</div>
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        <span className="font-bold">DATE:</span> <span className="font-bold">{quotationDate}</span>
                        <span className="font-bold">Quotation Ref:</span> <span className="font-bold text-amber-800">{quotationRefNum}</span>
                        {tenderNo.trim() !== '' && !rfqNo.trim() ? (
                          <>
                            <span className="font-bold text-amber-900">Tender No.:</span> <span className="font-bold text-amber-900">{tenderNo}</span>
                            <span className="font-bold text-amber-900">Tender Date:</span> <span className="font-bold text-amber-900">{tenderDate || rfqDate}</span>
                          </>
                        ) : tenderNo.trim() !== '' && rfqNo.trim() !== '' ? (
                          <>
                            <span className="font-bold">RFQ No.:</span> <span>{rfqNo}</span>
                            <span className="font-bold">RFQ Date:</span> <span>{rfqDate}</span>
                            <span className="font-bold text-amber-900">Tender No.:</span> <span className="font-bold text-amber-900">{tenderNo}</span>
                            <span className="font-bold text-amber-900">Tender Date:</span> <span className="font-bold text-amber-900">{tenderDate || rfqDate}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold">RFQ No.:</span> <span>{rfqNo || '—'}</span>
                            <span className="font-bold">RFQ Date:</span> <span>{rfqDate || '—'}</span>
                          </>
                        )}
                        <span className="font-bold">S.ACC.:</span> <span className="font-bold text-slate-900">{sAcc}</span>
                        <span className="font-bold">Offer Validity:</span> <span>{offerValidity}</span>
                      </div>
                      <hr className="my-1 border-slate-300" />
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700">
                        <span>Delivery Terms:</span> <span>{deliveryTerms}</span>
                        <span>Lead Time:</span> <span>{deliveryLeadTime}</span>
                        <span>Payment Terms:</span> <span>{paymentTerms}</span>
                        <span>Currency:</span> <span className="font-bold text-slate-900">{currency}</span>
                        <span>Country of Origin:</span> <span className="font-bold text-slate-900">{madeIn}</span>
                        <span>H.S. CODE:</span> <span className="font-mono">{hsCode}</span>
                        {(() => {
                          const validItemsRaw = items.filter(it => it.description && it.description.trim().length > 0);
                          const activeDisplayItems = (printItemsCount > 0 && printItemsCount < validItemsRaw.length)
                            ? validItemsRaw.slice(0, printItemsCount)
                            : validItemsRaw;
                          const previewPages = paginateItems(activeDisplayItems);
                          const totalPages = previewPages.length;
                          return (
                            <>
                              <span className="font-bold text-slate-900">Page No:</span> <span className="font-bold font-mono text-slate-900">1/{totalPages}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Quotation Line Design matching double line specification */}
                  <div className="flex items-center my-3 w-full">
                    <div className="flex-1 border-t-3 border-double border-[#083c54] mr-3" style={{ borderTop: '3px double #083c54' }}></div>
                    <span className="font-bold italic text-[#083c54] text-xs sm:text-sm whitespace-nowrap px-1">
                      Quotation
                    </span>
                    <div className="w-16 sm:w-24 border-t-3 border-double border-[#083c54] ml-3" style={{ borderTop: '3px double #083c54' }}></div>
                  </div>

                  <div className="font-bold italic text-slate-900 text-[10px] sm:text-[11px] mb-1">
                    We are pleased to quote our best prices as below:
                  </div>

                  {/* Items Table - Filtering blank items & respecting printItemsCount limit */}
                  <div className="overflow-x-auto border border-slate-900">
                    <table className="w-full text-left border-collapse text-[9.5px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-900 font-bold uppercase text-[8.5px]">
                          <th className="p-1 border-r border-slate-900 text-center w-8">S/L</th>
                          <th className="p-1 border-r border-slate-900 min-w-[140px]">ITEM DESCRIPTION</th>
                          <th className="p-1 border-r border-slate-900 text-center w-12">FINISH</th>
                          <th className="p-1 border-r border-slate-900 text-center w-10">UNIT</th>
                          <th className="p-1 border-r border-slate-900 text-center w-10">QTY</th>
                          <th className="p-1 border-r border-slate-900 text-right w-14">U. Price</th>
                          <th className="p-1 border-r border-slate-900 text-right w-16">Ext. Price</th>
                          <th className="p-1 border-r border-slate-900 text-right w-12">Discount</th>
                          <th className="p-1 border-r border-slate-900 text-right w-16">Total Exl. Vat</th>
                          <th className="p-1 border-r border-slate-900 text-right w-14">VAT ({currency})</th>
                          <th className="p-1 text-right w-16">Total ({currency})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {(() => {
                          const validItemsRaw = items.filter(it => it.description && it.description.trim().length > 0);
                          const activeDisplayItems = (printItemsCount > 0 && printItemsCount < validItemsRaw.length)
                            ? validItemsRaw.slice(0, printItemsCount)
                            : validItemsRaw;
                          const previewPages = paginateItems(activeDisplayItems);
                          const pageStartIndices = new Set(previewPages.filter(p => p.pageNum > 1).map(p => p.startIdx));

                          return activeDisplayItems.map((it, idx) => {
                            const serialNo = idx + 1;
                            const isPageBreak = pageStartIndices.has(idx);
                            const q = Number(it.qty) || 0;
                            const up = Number(it.unitPrice) || 0;
                            const ext = q * up;
                            const disc = Number(it.discount) || 0;
                            const totalExcl = Math.max(0, ext - disc);
                            const vat = totalExcl * 0.05;
                            const tot = totalExcl + vat;
                            return (
                              <React.Fragment key={it.id || idx}>
                                {isPageBreak && (
                                  <tr className="bg-amber-100/90 text-amber-900 font-mono text-[9px] font-bold border-y-2 border-amber-500 print:break-before-page">
                                    <td colSpan={11} className="py-1 px-2 text-center uppercase tracking-wider">
                                      --- PAGE BREAK AT SERIAL NO {serialNo} (MOVED TO NEXT PAGE) ---
                                    </td>
                                  </tr>
                                )}
                                <tr className={`hover:bg-slate-50 ${isPageBreak ? 'print:break-before-page' : ''}`}>
                                  <td className="p-1 border-r border-slate-900 text-center font-bold text-slate-500">{serialNo}</td>
                                  <td className="p-1 border-r border-slate-900 font-bold text-slate-900">{it.description}</td>
                                  <td className="p-1 border-r border-slate-900 text-center">{it.finish || 'HDG'}</td>
                                  <td className="p-1 border-r border-slate-900 text-center">{it.unit || 'PCS'}</td>
                                  <td className="p-1 border-r border-slate-900 text-center font-bold">{q}</td>
                                  <td className="p-1 border-r border-slate-900 text-right">{up.toFixed(2)}</td>
                                  <td className="p-1 border-r border-slate-900 text-right">{ext.toFixed(2)}</td>
                                  <td className="p-1 border-r border-slate-900 text-right">{disc.toFixed(2)}</td>
                                  <td className="p-1 border-r border-slate-900 text-right font-semibold">{totalExcl.toFixed(2)}</td>
                                  <td className="p-1 border-r border-slate-900 text-right text-slate-600">{vat.toFixed(2)}</td>
                                  <td className="p-1 text-right font-extrabold text-[#083c54]">{tot.toFixed(2)}</td>
                                </tr>
                              </React.Fragment>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Unified Summary & Signature Footer Block */}
                  <div className="space-y-2 break-inside-avoid">
                    {/* Totals & Notes Section */}
                    {(() => {
                      const validItemsRaw = items.filter(it => it.description && it.description.trim().length > 0);
                      const validItems = (printItemsCount > 0 && printItemsCount < validItemsRaw.length)
                        ? validItemsRaw.slice(0, printItemsCount)
                        : validItemsRaw;

                      const pSubtotal = validItems.reduce((s, it) => s + (it.amount || 0), 0);
                      const pBeforeTax = Math.max(0, pSubtotal - discountAmount);
                      const pVat = pBeforeTax * 0.05;
                      const pInvoiceTotal = pBeforeTax + pVat + freightAmount;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                          <div className="border border-slate-900 p-2 font-sans space-y-1">
                            <div className="font-bold underline text-slate-900">Notes & Terms:-</div>
                            <ul className="list-disc pl-3 text-[9px] text-slate-700 space-y-0.5">
                              {notesList.map((n, idx) => (
                                <li key={idx}>{n}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="border border-slate-900 p-1.5 font-mono text-[10px] space-y-1">
                            <div className="flex justify-between font-bold"><span>TOTAL IN {currency} :</span><span>{pSubtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-600"><span>DISCOUNT IN {currency} :</span><span>{discountAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-600"><span>FREIGHT/EXTRA CHARGES IN {currency} :</span><span>{freightAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold border-t border-slate-300 pt-0.5"><span>TOTAL {currency} BEFORE TAX :</span><span>{pBeforeTax.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-600"><span>5% TAX AMOUNT IN {currency} :</span><span>{pVat.toFixed(2)}</span></div>
                            <div className="flex justify-between font-black bg-slate-100 p-1 border-t border-slate-900 text-xs text-[#083c54]">
                              <span>TOTAL AMOUNT IN {currency} :</span>
                              <span>{pInvoiceTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="text-[8px] text-right font-bold mt-2.5 mb-1 text-slate-800">E. & O.E</div>

                    {/* Signature Footer */}
                    <div className="grid grid-cols-2 gap-2 border border-slate-900 p-2 text-[9.5px]">
                      <div>
                        <div className="font-bold underline mb-1">Purchaser Contact Info:-</div>
                        <div className="font-bold text-slate-900">{cleanPdfText(purchaserContactPerson)}</div>
                        <div>{purchaserDesignation}</div>
                        <div>Phone: {purchaserPhone} | Mobile: {purchaserMobile}</div>
                        <div>Email: {purchaserEmail}</div>
                      </div>
                      <div>
                        <div className="font-bold underline mb-1">For : {activeCompany.name}</div>
                        <div className="font-bold text-slate-900">{salesExecName} ({salesExecTitle})</div>
                        <div>Mobile: {salesExecMobile} | Phone: {activeCompany.phone || salesExecPhone}</div>
                        <div>Email: {salesExecEmail}</div>
                        <div>Website: {activeCompany.website || 'www.marinefasteners.ae'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-3 border-t border-slate-300 flex items-center justify-between font-mono shrink-0">
              <span className="text-[10px] text-slate-600 font-bold uppercase">
                {items.filter(it => it.description && it.description.trim().length > 0).length} Line Items Ready for PDF Export
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrintQuotation();
                    setIsPreviewOpen(false);
                  }}
                  className="px-4 py-1.5 bg-[#f37021] hover:bg-[#d85e13] text-white font-bold text-xs uppercase rounded cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right-Click Context Menu for Spreadsheet Table Row Insertion / Duplication */}
      {/* Modal 1: Client Registration Modal (with Company & TRN matching logic) */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#083c54] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Register Client / Add Company</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smart Matching Explanation Banner */}
            <div className="bg-sky-50 border-b border-sky-200 px-5 py-2.5 text-[11px] text-sky-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Smart Client Verification:</span> If the <strong>Company Name</strong> and <strong>TRN</strong> match an existing client, the system will update the client's information and register the contact person under that client record.
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterOrUpdateClient} className="p-5 space-y-4 overflow-y-auto font-sans text-xs">
              <div>
                <h4 className="font-extrabold text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2 border-b pb-1">
                  1. Company Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={customerModalForm.companyName}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, companyName: e.target.value })}
                      placeholder="e.g. GULF FASTENERS TRADING L.L.C"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">VAT TRN (Tax Registration #)</label>
                    <input
                      type="text"
                      value={customerModalForm.trn}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, trn: e.target.value })}
                      placeholder="e.g. 100440509600003"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company Phone</label>
                    <input
                      type="text"
                      value={customerModalForm.phone}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, phone: e.target.value })}
                      placeholder="e.g. +971-6-5250526"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Address / Location</label>
                    <input
                      type="text"
                      value={customerModalForm.address}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, address: e.target.value })}
                      placeholder="e.g. Industrial Area 1, Ajman, UAE"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">P.O. Box</label>
                    <input
                      type="text"
                      value={customerModalForm.poBox}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, poBox: e.target.value })}
                      placeholder="e.g. 2145"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-2 border-b pb-1">
                  2. Purchaser / Concern Person Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Purchaser / Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={customerModalForm.contactPerson}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, contactPerson: e.target.value })}
                      placeholder="e.g. Mr. Akil Kumar"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Designation</label>
                    <input
                      type="text"
                      value={customerModalForm.designation}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, designation: e.target.value })}
                      placeholder="e.g. Procurement Specialist"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerModalForm.email}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, email: e.target.value })}
                      placeholder="e.g. purchaser@client.ae"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mobile / WhatsApp</label>
                    <input
                      type="text"
                      value={customerModalForm.mobile}
                      onChange={(e) => setCustomerModalForm({ ...customerModalForm, mobile: e.target.value })}
                      placeholder="e.g. +971-50-1234567"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#083c54] hover:bg-[#0a4a68] text-white rounded font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Register / Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Purchaser to Customer Modal */}
      {isAddPurchaserModalOpen && targetCustomerForPurchaser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#083c54] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Add Purchaser Contact</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPurchaserModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Client Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-800">{targetCustomerForPurchaser.companyName}</span>
              </div>
              {targetCustomerForPurchaser.trn && (
                <span className="text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono font-bold text-amber-800">
                  TRN: {targetCustomerForPurchaser.trn}
                </span>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSavePurchaserToCustomer} className="p-5 space-y-3 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Purchaser Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={purchaserModalForm.name}
                    onChange={(e) => setPurchaserModalForm({ ...purchaserModalForm, name: e.target.value })}
                    placeholder="e.g. Mr. Tariq Mansoor"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Short Code / Tag</label>
                  <input
                    type="text"
                    value={purchaserModalForm.code}
                    onChange={(e) => setPurchaserModalForm({ ...purchaserModalForm, code: e.target.value })}
                    placeholder="e.g. TM, Buyer-2"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={purchaserModalForm.designation}
                    onChange={(e) => setPurchaserModalForm({ ...purchaserModalForm, designation: e.target.value })}
                    placeholder="e.g. Senior Buyer / Procurement"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={purchaserModalForm.email}
                    onChange={(e) => setPurchaserModalForm({ ...purchaserModalForm, email: e.target.value })}
                    placeholder="e.g. tariq@client.ae"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={purchaserModalForm.mobile}
                    onChange={(e) => setPurchaserModalForm({ ...purchaserModalForm, mobile: e.target.value })}
                    placeholder="e.g. +971-50-9876543"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPurchaserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#083c54] hover:bg-[#0a4a68] text-white rounded font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Purchaser</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-white border border-slate-300 shadow-2xl rounded-md py-1.5 w-52 text-xs font-sans text-slate-800 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between bg-slate-50">
            <span>Row #{contextMenu.rowIndex + 1} Options</span>
            <button
              type="button"
              onClick={() => setContextMenu(null)}
              className="text-slate-400 hover:text-slate-600 text-[10px]"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={() => insertRowAbove(contextMenu.rowIndex)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Insert Row Above</span>
            </button>
            <button
              type="button"
              onClick={() => insertRowBelow(contextMenu.rowIndex)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Insert Row Below</span>
            </button>
            <button
              type="button"
              onClick={() => duplicateRow(contextMenu.rowIndex)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-slate-800 flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Copy className="w-3.5 h-3.5 text-amber-600" />
              <span>Duplicate Row</span>
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => deleteContextMenuRow(contextMenu.rowIndex)}
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete Row</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
