import React, { useState, useEffect, useMemo } from 'react';
import {
  Percent, FileText, ArrowUpDown, ShieldCheck, Download, Printer, Plus,
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw, Upload, Save,
  Building2, Hash, Calendar, DollarSign, ExternalLink, HelpCircle,
  Eye, Edit3, Trash2, ChevronRight, Check, X, FileSpreadsheet,
  Globe, Landmark, Layers, BookOpen, Clock, AlertTriangle, ArrowRight, Columns
} from 'lucide-react';
import {
  printFormVat201,
  printAdvanceReceiptSchedule,
  printRcmReport,
  printCustomsVatReport
} from './vat/VatPrintGenerator';
import {
  AddEditAdvanceReceiptModal,
  AddEditRcmModal,
  AddEditCustomsModal,
  AddEditTaxPaymentModal
} from './vat/VatModals';
import {
  CustomsColumnsModal,
  CustomsColumnsConfig,
  AddEditTaxRateModal,
  AddEditPartyModal
} from './vat/VatModalsExtra';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';

export interface Vat201Props {
  triggerToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  currentUser?: string;
  initialSubTab?: string;
}

export type VatSubTab = 
  | 'vat201_return'
  | 'advance_receipt'
  | 'reverse_charge'
  | 'vat_paid_customs'
  | 'return_transaction_book'
  | 'tax_payment_reconciliation'
  | 'tax_rate_setup'
  | 'update_party_trn'
  | 'import_party_trn';

export interface AdvanceReceiptRecord {
  id: string;
  voucherNo: string;
  date: string;
  customerName: string;
  customerTrn: string;
  placeOfSupply: string;
  advanceAmount: number; // Gross received
  taxableAmount: number; // Advance excluding VAT
  vatAmount: number;     // 5% VAT
  allocatedInvoiceNo?: string;
  allocationDate?: string;
  allocatedAmount?: number;
  status: 'UNADJUSTED' | 'PARTIALLY_ADJUSTED' | 'ADJUSTED';
  narration?: string;
}

export interface ReverseChargeRecord {
  id: string;
  refNo: string;
  date: string;
  supplierName: string;
  country: string;
  natureOfService: string;
  serviceCategory: 'IMPORT_SERVICES' | 'IMPORT_GOODS_NO_CUSTOMS' | 'SCRAP_METAL_RCM' | 'OTHER_RCM';
  taxableAmount: number;
  rcmOutputTax: number;
  recoverableInputTax: number;
  vatBox: 'BOX_3_OUTPUT' | 'BOX_10_INPUT' | 'BOTH_3_AND_10';
  documentRef?: string;
  remarks?: string;
}

export interface CustomsVatRecord {
  id: string;
  declarationNo: string;
  boeNo: string;
  customsPort: string;
  date: string;
  supplierName: string;
  cifValue: number;
  customsDuty: number;
  vatBaseAmount: number;
  vatAmountPaid: number;
  paymentMode: 'DIRECT_CUSTOMS_PAYMENT' | 'FTA_DEFERRED_ACCOUNT' | 'E_GUARANTEE';
  clearingAgent: string;
  reconciliationStatus: 'MATCHED' | 'AUTO_POPULATED_FTA' | 'MANUAL_DISCREPANCY';
  commercialInvoiceNo?: string;
  remarks?: string;
}

export interface ReturnTxItem {
  id: string;
  docDate: string;
  docType: 'TAX INVOICE' | 'SUPPLIER PURCHASE' | 'CREDIT NOTE' | 'DEBIT NOTE' | 'ADVANCE RECEIPT' | 'CUSTOMS IMPORT' | 'RCM ENTRY';
  docNo: string;
  partyName: string;
  partyTrn: string;
  emirate: string;
  taxTreatment: 'STANDARD_5' | 'ZERO_RATED' | 'EXEMPT' | 'OUT_OF_SCOPE' | 'RCM_5' | 'CUSTOMS_IMPORT';
  taxableAmount: number;
  taxRate: number;
  vatAmount: number;
  grossAmount: number;
  vatBoxCode: string;
  status: 'POSTED' | 'VERIFIED' | 'ADJUSTMENT';
}

export interface TaxPaymentRecord {
  id: string;
  taxPeriod: string;
  taxYear: string;
  returnDueDate: string;
  form201NetPayable: number;
  gibanRef: string;
  paymentDate?: string;
  paymentVoucherNo?: string;
  bankAccount?: string;
  amountPaid: number;
  penalties: number;
  interest: number;
  reconciliationStatus: 'SETTLED' | 'PENDING_PAYMENT' | 'OVERPAID_CREDIT' | 'PARTIAL';
  ftaRefNumber?: string;
  remarks?: string;
}

export interface TaxRateMaster {
  id: string;
  code: string;
  name: string;
  rate: number;
  category: 'STANDARD' | 'ZERO' | 'EXEMPT' | 'OUT_OF_SCOPE' | 'RCM' | 'DESIGNATED_ZONE';
  scope: string;
  outputGlAccount: string;
  inputGlAccount: string;
  effectiveFrom: string;
  isActive: boolean;
  isSystemDefault: boolean;
}

export interface PartyTrnMaster {
  id: string;
  partyCode: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'SUPPLIER' | 'CONTRACTOR';
  trn: string;
  placeOfSupply: string;
  tradeLicenseNo: string;
  taxTreatment: 'STANDARD_TAXABLE' | 'DESIGNATED_FREEZONE' | 'OVERSEAS_EXPORT' | 'GOVERNMENT_EXEMPT';
  contactPerson?: string;
  phone?: string;
  email?: string;
  isVerified: boolean;
}

const DEFAULT_TAX_RATES: TaxRateMaster[] = [
  {
    id: 'TR-01',
    code: 'SR-5%',
    name: 'Standard Rate (5.00%)',
    rate: 5.00,
    category: 'STANDARD',
    scope: 'Domestic supplies of goods & commercial services in UAE (Fasteners, Hardware, Fabrication)',
    outputGlAccount: 'VAT Output Tax Payable (5%) [GL-2200]',
    inputGlAccount: 'VAT Input Tax Recoverable (5%) [GL-1400]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'TR-02',
    code: 'ZR-EXP',
    name: 'Zero-Rated Direct/Indirect Exports (0.00%)',
    rate: 0.00,
    category: 'ZERO',
    scope: 'Exports of fasteners & steel supplies to outside GCC Implementing States (Official customs export exit cert required)',
    outputGlAccount: 'Zero Rated Sales Clearing [GL-4110]',
    inputGlAccount: 'VAT Input Tax Recoverable (5%) [GL-1400]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'TR-03',
    code: 'ZR-TRN',
    name: 'Zero-Rated International Transport (0.00%)',
    rate: 0.00,
    category: 'ZERO',
    scope: 'International sea, air and overland transport of goods & marine shipping services',
    outputGlAccount: 'International Transport Revenue [GL-4120]',
    inputGlAccount: 'VAT Input Tax Recoverable (5%) [GL-1400]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'TR-04',
    code: 'EX-FIN',
    name: 'Exempt Financial & Margin Supplies (0.00%)',
    rate: 0.00,
    category: 'EXEMPT',
    scope: 'Financial margin services, bank interest, local residential bare land transactions',
    outputGlAccount: 'Exempt Revenue Account [GL-4200]',
    inputGlAccount: 'Blocked / Non-Recoverable Input VAT [GL-5900]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'TR-05',
    code: 'RCM-5%',
    name: 'Reverse Charge Mechanism RCM (5.00%)',
    rate: 5.00,
    category: 'RCM',
    scope: 'Procurement of overseas services, legal/IT software licenses & domestic scrap metal RCM',
    outputGlAccount: 'RCM VAT Output Liability [GL-2210]',
    inputGlAccount: 'RCM VAT Input Recovery [GL-1410]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'TR-06',
    code: 'DZ-SUP',
    name: 'Designated Zone Bonded Transfers (0.00%)',
    rate: 0.00,
    category: 'DESIGNATED_ZONE',
    scope: 'Transfers of goods between fenced UAE Designated Free Zones (e.g. JAFZA, HFZA, DAFZA)',
    outputGlAccount: 'Designated Zone Supplies [GL-4130]',
    inputGlAccount: 'Designated Zone Purchases [GL-5130]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'TR-07',
    code: 'OOS-GEN',
    name: 'Out of Scope Transactions (N/A)',
    rate: 0.00,
    category: 'OUT_OF_SCOPE',
    scope: 'High-seas merchanting trade & drop shipments completely outside UAE territorial jurisdiction',
    outputGlAccount: 'Out of Scope Revenue [GL-4300]',
    inputGlAccount: 'Out of Scope Cost of Sales [GL-5300]',
    effectiveFrom: '2018-01-01',
    isActive: true,
    isSystemDefault: true,
  }
];

export const UaeVat201ManagerComponent: React.FC<Vat201Props> = ({
  triggerToast = (_msg: string, _type?: 'success' | 'error' | 'info' | 'warning') => {},
  currentUser = 'Accountant',
  initialSubTab = 'vat201_return'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<VatSubTab>((initialSubTab as VatSubTab) || 'vat201_return');
  
  // Date range filters for tax period
  const [taxPeriodFrom, setTaxPeriodFrom] = useState<string>('2026-01-01');
  const [taxPeriodTo, setTaxPeriodTo] = useState<string>('2026-12-31');
  const [selectedEmirate, setSelectedEmirate] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic Company profile synced with global company state
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const active = getActiveCompany();
    return {
      ...active,
      ftaGiban: active.ftaGiban || `AE82033000000${active.trn || '100440509600003'}`
    };
  });

  useEffect(() => {
    const handleSync = () => {
      const active = getActiveCompany();
      setCompanyProfile({
        ...active,
        ftaGiban: active.ftaGiban || `AE82033000000${active.trn || '100440509600003'}`
      });
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

  useEffect(() => {
    const active = getActiveCompany();
    setCompanyProfile({
      ...active,
      ftaGiban: active.ftaGiban || `AE82033000000${active.trn || '100440509600003'}`
    });
  }, [currentUser]);

  // State: Advance Receipts
  const [advanceReceipts, setAdvanceReceipts] = useState<AdvanceReceiptRecord[]>(() => {
    const saved = localStorage.getItem('MFI_VAT_ADVANCE_RECEIPTS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'adv-1',
        voucherNo: 'AR-2026-001',
        date: '2026-02-10',
        customerName: 'GULF PIPELINES CONTRACTING LLC',
        customerTrn: '100342918400003',
        placeOfSupply: 'Dubai',
        advanceAmount: 26250.00,
        taxableAmount: 25000.00,
        vatAmount: 1250.00,
        allocatedInvoiceNo: 'INV-2026-089',
        allocationDate: '2026-03-02',
        allocatedAmount: 26250.00,
        status: 'ADJUSTED',
        narration: 'Advance 50% for Custom Grade 8.8 Galvanized Stud Bolts production'
      },
      {
        id: 'adv-2',
        voucherNo: 'AR-2026-002',
        date: '2026-05-18',
        customerName: 'AL FANAR STEEL WORKS CO.',
        customerTrn: '100234598000003',
        placeOfSupply: 'Sharjah',
        advanceAmount: 10500.00,
        taxableAmount: 10000.00,
        vatAmount: 500.00,
        allocatedInvoiceNo: '',
        status: 'UNADJUSTED',
        narration: 'Token deposit for SS 316 Heavy Hex Nuts container shipment'
      },
      {
        id: 'adv-3',
        voucherNo: 'AR-2026-003',
        date: '2026-07-22',
        customerName: 'EMIRATES MARINE FABRICATION LLC',
        customerTrn: '100561284900003',
        placeOfSupply: 'Abu Dhabi',
        advanceAmount: 15750.00,
        taxableAmount: 15000.00,
        vatAmount: 750.00,
        allocatedInvoiceNo: '',
        status: 'UNADJUSTED',
        narration: 'Advance mobilization payment for anchor cage fabrication'
      }
    ];
  });

  // State: Reverse Charge Records
  const [reverseChargeList, setReverseChargeList] = useState<ReverseChargeRecord[]>(() => {
    const saved = localStorage.getItem('MFI_VAT_REVERSE_CHARGE');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'rcm-1',
        refNo: 'RCM-2026-01',
        date: '2026-01-20',
        supplierName: 'SOLIDWORKS CORP (DASSAULT SYSTÈMES)',
        country: 'France / USA',
        natureOfService: 'Engineering CAD 3D Fastener Design Software Cloud Licenses',
        serviceCategory: 'IMPORT_SERVICES',
        taxableAmount: 18500.00,
        rcmOutputTax: 925.00,
        recoverableInputTax: 925.00,
        vatBox: 'BOTH_3_AND_10',
        documentRef: 'SW-INV-992014',
        remarks: 'Box 3 Output tax accounted; 100% recovered under Box 10'
      },
      {
        id: 'rcm-2',
        refNo: 'RCM-2026-02',
        date: '2026-03-15',
        supplierName: 'TUV SUD GERMANY AG',
        country: 'Germany',
        natureOfService: 'Specialized Tensile & Salt Spray ISO 17025 Third-Party Lab Testing',
        serviceCategory: 'IMPORT_SERVICES',
        taxableAmount: 12000.00,
        rcmOutputTax: 600.00,
        recoverableInputTax: 600.00,
        vatBox: 'BOTH_3_AND_10',
        documentRef: 'TUV-DE-44120',
        remarks: 'Technical Metallurgy Verification Certs for ADNOC Project'
      },
      {
        id: 'rcm-3',
        refNo: 'RCM-2026-03',
        date: '2026-06-10',
        supplierName: 'AL ITTIHAD SCRAP RECYCLING FZE',
        country: 'United Arab Emirates',
        natureOfService: 'Local procurement of industrial metal scrap (Cabinet Decision No. 49 RCM on Scrap)',
        serviceCategory: 'SCRAP_METAL_RCM',
        taxableAmount: 34000.00,
        rcmOutputTax: 1700.00,
        recoverableInputTax: 1700.00,
        vatBox: 'BOTH_3_AND_10',
        documentRef: 'AIS-SCRAP-881',
        remarks: 'Domestic Scrap Reverse Charge mechanism applied'
      }
    ];
  });

  // State: VAT Paid to Customs
  const [customsVatList, setCustomsVatList] = useState<CustomsVatRecord[]>(() => {
    const saved = localStorage.getItem('MFI_VAT_CUSTOMS_PAID');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'cst-1',
        declarationNo: 'DEC-DXB-2026-99120',
        boeNo: 'BOE-JAP-88412',
        customsPort: 'Jebel Ali Port (Dubai Customs)',
        date: '2026-01-25',
        supplierName: 'JINAN FASTENER PRECISION CO. LTD',
        cifValue: 145000.00,
        customsDuty: 7250.00,
        vatBaseAmount: 152250.00,
        vatAmountPaid: 7612.50,
        paymentMode: 'DIRECT_CUSTOMS_PAYMENT',
        clearingAgent: 'KHALID MARITIME CLEARING SERVICES',
        reconciliationStatus: 'MATCHED',
        commercialInvoiceNo: 'JIN-EXP-2026-101',
        remarks: 'Standard 40ft container high tensile B7 threaded bars'
      },
      {
        id: 'cst-2',
        declarationNo: 'DEC-SHJ-2026-44310',
        boeNo: 'BOE-PKH-33910',
        customsPort: 'Port Khalid (Sharjah Customs)',
        date: '2026-03-12',
        supplierName: 'NINGBO DONGXIN BOLT MANUFACTURING',
        cifValue: 88000.00,
        customsDuty: 4400.00,
        vatBaseAmount: 92400.00,
        vatAmountPaid: 4620.00,
        paymentMode: 'DIRECT_CUSTOMS_PAYMENT',
        clearingAgent: 'AL NABOODAH LOGISTICS & CLEARING',
        reconciliationStatus: 'MATCHED',
        commercialInvoiceNo: 'NGB-2026-042',
        remarks: 'Hex bolts & heavy washers pallet consignment'
      },
      {
        id: 'cst-3',
        declarationNo: 'DEC-DXB-2026-11849',
        boeNo: 'BOE-JAP-90144',
        customsPort: 'Jebel Ali Port (Dubai Customs)',
        date: '2026-06-04',
        supplierName: 'POSCO STAINLESS STEEL CORP',
        cifValue: 210000.00,
        customsDuty: 10500.00,
        vatBaseAmount: 220500.00,
        vatAmountPaid: 11025.00,
        paymentMode: 'FTA_DEFERRED_ACCOUNT',
        clearingAgent: 'AL FAHIM FREIGHT SYSTEMS',
        reconciliationStatus: 'AUTO_POPULATED_FTA',
        commercialInvoiceNo: 'PSC-KR-9901',
        remarks: 'Import auto-cleared under TRN e-Guarantee deferred scheme (Box 6)'
      }
    ];
  });

  // State: Tax Payment Reconciliation Records
  const [taxPayments, setTaxPayments] = useState<TaxPaymentRecord[]>(() => {
    const saved = localStorage.getItem('MFI_VAT_TAX_PAYMENTS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'pay-1',
        taxPeriod: 'Q1 2026 (Jan - Mar 2026)',
        taxYear: '2026',
        returnDueDate: '2026-04-28',
        form201NetPayable: 14250.00,
        gibanRef: 'GIBAN-AE820330000001004405096',
        paymentDate: '2026-04-25',
        paymentVoucherNo: 'BPV-2026-049',
        bankAccount: 'RAKBANK CURRENT A/C',
        amountPaid: 14250.00,
        penalties: 0,
        interest: 0,
        reconciliationStatus: 'SETTLED',
        ftaRefNumber: 'FTA-PAY-2026-004491',
        remarks: 'Q1 VAT Paid on time through e-Services portal via RAKBANK direct debit'
      },
      {
        id: 'pay-2',
        taxPeriod: 'Q2 2026 (Apr - Jun 2026)',
        taxYear: '2026',
        returnDueDate: '2026-07-28',
        form201NetPayable: 18900.00,
        gibanRef: 'GIBAN-AE820330000001004405096',
        paymentDate: '2026-07-26',
        paymentVoucherNo: 'BPV-2026-088',
        bankAccount: 'RAKBANK CURRENT A/C',
        amountPaid: 18900.00,
        penalties: 0,
        interest: 0,
        reconciliationStatus: 'SETTLED',
        ftaRefNumber: 'FTA-PAY-2026-008912',
        remarks: 'Q2 VAT Return settled in full with FTA e-Guarantee cleared'
      },
      {
        id: 'pay-3',
        taxPeriod: 'Q3 2026 (Jul - Sep 2026)',
        taxYear: '2026',
        returnDueDate: '2026-10-28',
        form201NetPayable: 12400.00,
        gibanRef: 'GIBAN-AE820330000001004405096',
        paymentDate: '',
        paymentVoucherNo: '',
        bankAccount: 'RAKBANK CURRENT A/C',
        amountPaid: 0,
        penalties: 0,
        interest: 0,
        reconciliationStatus: 'PENDING_PAYMENT',
        ftaRefNumber: '',
        remarks: 'Pending Q3 quarter-end return filing & portal transfer'
      }
    ];
  });

  // State: Tax Rates Setup
  const [taxRates, setTaxRates] = useState<TaxRateMaster[]>(() => {
    const saved = localStorage.getItem('MFI_VAT_TAX_RATES');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_TAX_RATES;
  });

  // State: Party TRN Masters
  const [partyTrnList, setPartyTrnList] = useState<PartyTrnMaster[]>(() => {
    const saved = localStorage.getItem('MFI_PARTY_TRN_MASTERS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Pull registered customers if available
    const savedCust = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
    let loadedCusts: any[] = [];
    if (savedCust) {
      try { loadedCusts = JSON.parse(savedCust); } catch (e) {}
    }
    if (Array.isArray(loadedCusts) && loadedCusts.length > 0) {
      return loadedCusts.map((c, idx) => ({
        id: `party-${idx + 1}`,
        partyCode: `CUST-${1000 + idx}`,
        partyName: (c.companyName || c.name || 'CUSTOMER').toUpperCase(),
        partyType: 'CUSTOMER',
        trn: c.trn || '',
        placeOfSupply: c.placeOfSupply || 'Sharjah',
        tradeLicenseNo: c.tradeLicenseNo || `CN-${200000 + idx}`,
        taxTreatment: 'STANDARD_TAXABLE',
        contactPerson: c.contactPerson || 'Accounts Payable',
        phone: c.phone || '+971 6 534 0000',
        email: c.email || 'accounts@company.ae',
        isVerified: !!(c.trn && c.trn.length === 15 && c.trn.startsWith('100'))
      }));
    }
    return [
      {
        id: 'p-1',
        partyCode: 'CUST-1001',
        partyName: 'AL FANAR STEEL WORKS CO.',
        partyType: 'CUSTOMER',
        trn: '100234598000003',
        placeOfSupply: 'Sharjah',
        tradeLicenseNo: 'SHJ-88412',
        taxTreatment: 'STANDARD_TAXABLE',
        contactPerson: 'Finance Officer',
        phone: '+971 6 534 8822',
        email: 'ap@alfanarsteel.ae',
        isVerified: true
      },
      {
        id: 'p-2',
        partyCode: 'CUST-1002',
        partyName: 'GULF PIPELINES CONTRACTING LLC',
        partyType: 'CUSTOMER',
        trn: '100342918400003',
        placeOfSupply: 'Dubai',
        tradeLicenseNo: 'DXB-554199',
        taxTreatment: 'STANDARD_TAXABLE',
        contactPerson: 'Procurement Dept',
        phone: '+971 4 332 9901',
        email: 'procurement@gulfpipelines.ae',
        isVerified: true
      },
      {
        id: 'p-3',
        partyCode: 'CUST-1003',
        partyName: 'ZAMIL HEAVY INDUSTRIES LTD',
        partyType: 'CUSTOMER',
        trn: '300182764500003',
        placeOfSupply: 'KSA (EXEMPT EXPORT)',
        tradeLicenseNo: 'KSA-CR-1010482',
        taxTreatment: 'OVERSEAS_EXPORT',
        contactPerson: 'Zamil Purchase',
        phone: '+966 12 699 2411',
        email: 'procurement@zamilheavy.com',
        isVerified: true
      },
      {
        id: 'p-4',
        partyCode: 'SUPP-2001',
        partyName: 'EMIRATES STEEL INDUSTRIES PJSC',
        partyType: 'SUPPLIER',
        trn: '100112849000003',
        placeOfSupply: 'Abu Dhabi',
        tradeLicenseNo: 'AD-99412',
        taxTreatment: 'STANDARD_TAXABLE',
        contactPerson: 'Sales & Invoicing Dept',
        phone: '+971 2 550 1111',
        email: 'invoicing@emiratessteel.com',
        isVerified: true
      },
      {
        id: 'p-5',
        partyCode: 'SUPP-2002',
        partyName: 'JINAN FASTENER PRECISION CO. LTD',
        partyType: 'SUPPLIER',
        trn: '',
        placeOfSupply: 'China (Overseas Import)',
        tradeLicenseNo: 'CN-37010099',
        taxTreatment: 'OVERSEAS_EXPORT',
        contactPerson: 'Export Manager',
        phone: '+86 531 8841 0000',
        email: 'sales@jinanfastener.cn',
        isVerified: false
      }
    ];
  });

  // Modals state
  const [showAddAdvModal, setShowAddAdvModal] = useState(false);
  const [editingAdv, setEditingAdv] = useState<AdvanceReceiptRecord | null>(null);

  const [showAddRcmModal, setShowAddRcmModal] = useState(false);
  const [editingRcm, setEditingRcm] = useState<ReverseChargeRecord | null>(null);

  const [showAddCustomsModal, setShowAddCustomsModal] = useState(false);
  const [editingCustoms, setEditingCustoms] = useState<CustomsVatRecord | null>(null);
  const [showCustomsColumnsModal, setShowCustomsColumnsModal] = useState(false);
  const [customsColumns, setCustomsColumns] = useState<CustomsColumnsConfig>(() => {
    const saved = localStorage.getItem('MFI_VAT_CUSTOMS_COLS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      declarationNo: true,
      boeNo: true,
      date: true,
      customsPort: true,
      supplierName: true,
      cifValue: true,
      customsDuty: true,
      vatBaseAmount: true,
      vatAmountPaid: true,
      paymentMode: true,
      clearingAgent: true,
      reconciliationStatus: true,
      remarks: true
    };
  });

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<TaxPaymentRecord | null>(null);

  const [showAddTaxRateModal, setShowAddTaxRateModal] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRateMaster | null>(null);

  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [editingParty, setEditingParty] = useState<PartyTrnMaster | null>(null);

  const [showImportPartyModal, setShowImportPartyModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');

  useEffect(() => {
    localStorage.setItem('MFI_VAT_CUSTOMS_COLS', JSON.stringify(customsColumns));
  }, [customsColumns]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('MFI_VAT_ADVANCE_RECEIPTS', JSON.stringify(advanceReceipts));
  }, [advanceReceipts]);

  useEffect(() => {
    localStorage.setItem('MFI_VAT_REVERSE_CHARGE', JSON.stringify(reverseChargeList));
  }, [reverseChargeList]);

  useEffect(() => {
    localStorage.setItem('MFI_VAT_CUSTOMS_PAID', JSON.stringify(customsVatList));
  }, [customsVatList]);

  useEffect(() => {
    localStorage.setItem('MFI_VAT_TAX_PAYMENTS', JSON.stringify(taxPayments));
  }, [taxPayments]);

  useEffect(() => {
    localStorage.setItem('MFI_VAT_TAX_RATES', JSON.stringify(taxRates));
  }, [taxRates]);

  useEffect(() => {
    localStorage.setItem('MFI_PARTY_TRN_MASTERS', JSON.stringify(partyTrnList));
  }, [partyTrnList]);

  // Load Sales Invoices and Purchases from DB for real dynamic calculations
  const rawSalesDocs = useMemo(() => {
    const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((d: any) => d.documentType === 'TAX INVOICE');
        }
      } catch (e) {}
    }
    return [];
  }, []);

  const rawPurchases = useMemo(() => {
    const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  }, []);

  // Return Transaction Book items aggregation
  const returnTxBook = useMemo<ReturnTxItem[]>(() => {
    const items: ReturnTxItem[] = [];

    // 1. Sales Invoices
    rawSalesDocs.forEach((doc: any, idx: number) => {
      const net = Number(doc.totalBeforeVat || doc.subtotal || doc.netTotal || 0);
      const vat = Number(doc.vatAmount || (net * 0.05));
      const gross = Number(doc.totalWithVat || doc.grandTotal || (net + vat));
      const emirate = doc.placeOfSupply || doc.emirate || 'Sharjah';
      
      let boxCode = 'Box 1c (Sharjah)';
      if (emirate.includes('Abu Dhabi')) boxCode = 'Box 1a (Abu Dhabi)';
      else if (emirate.includes('Dubai')) boxCode = 'Box 1b (Dubai)';
      else if (emirate.includes('Ajman')) boxCode = 'Box 1d (Ajman)';
      else if (emirate.includes('Umm Al Quwain')) boxCode = 'Box 1e (UAQ)';
      else if (emirate.includes('Ras Al Khaimah')) boxCode = 'Box 1f (RAK)';
      else if (emirate.includes('Fujairah')) boxCode = 'Box 1g (Fujairah)';

      items.push({
        id: `tx-sale-${idx}`,
        docDate: doc.date || '2026-02-15',
        docType: 'TAX INVOICE',
        docNo: doc.invoiceNumber || `INV-${1000 + idx}`,
        partyName: (doc.customerName || doc.clientName || 'CUSTOMER').toUpperCase(),
        partyTrn: doc.customerTrn || doc.trn || '100234598000003',
        emirate: emirate,
        taxTreatment: 'STANDARD_5',
        taxableAmount: net,
        taxRate: 5,
        vatAmount: vat,
        grossAmount: gross,
        vatBoxCode: boxCode,
        status: 'POSTED'
      });
    });

    // 2. Purchases
    rawPurchases.forEach((pur: any, idx: number) => {
      const net = Number(pur.totalBeforeTax || pur.subtotal || pur.taxableAmount || 0);
      const vat = Number(pur.totalTaxAmount || pur.vatAmount || (net * 0.05));
      const gross = Number(pur.totalInvoiceAmount || pur.grandTotal || (net + vat));
      const isRcm = !!pur.isRcm;
      const isCustoms = !!pur.isCustomsImport;

      items.push({
        id: `tx-pur-${idx}`,
        docDate: pur.invoiceDate || pur.date || '2026-02-10',
        docType: 'SUPPLIER PURCHASE',
        docNo: pur.invoiceNumber || pur.billNo || `PUR-${2000 + idx}`,
        partyName: (pur.supplierName || 'SUPPLIER').toUpperCase(),
        partyTrn: pur.supplierTrn || pur.trn || '100112849000003',
        emirate: pur.emirate || 'Sharjah',
        taxTreatment: isRcm ? 'RCM_5' : isCustoms ? 'CUSTOMS_IMPORT' : 'STANDARD_5',
        taxableAmount: net,
        taxRate: 5,
        vatAmount: vat,
        grossAmount: gross,
        vatBoxCode: isRcm ? 'Box 10 (RCM Input)' : isCustoms ? 'Box 7 (Customs Import)' : 'Box 9 (Standard Input)',
        status: 'POSTED'
      });
    });

    // 3. Advance Receipts
    advanceReceipts.forEach((adv) => {
      items.push({
        id: `tx-adv-${adv.id}`,
        docDate: adv.date,
        docType: 'ADVANCE RECEIPT',
        docNo: adv.voucherNo,
        partyName: adv.customerName,
        partyTrn: adv.customerTrn,
        emirate: adv.placeOfSupply,
        taxTreatment: 'STANDARD_5',
        taxableAmount: adv.taxableAmount,
        taxRate: 5,
        vatAmount: adv.vatAmount,
        grossAmount: adv.advanceAmount,
        vatBoxCode: 'Box 1 (Advance Output)',
        status: adv.status === 'ADJUSTED' ? 'VERIFIED' : 'POSTED'
      });
    });

    // 4. Reverse Charge Entries
    reverseChargeList.forEach((rcm) => {
      items.push({
        id: `tx-rcm-${rcm.id}`,
        docDate: rcm.date,
        docType: 'RCM ENTRY',
        docNo: rcm.refNo,
        partyName: rcm.supplierName,
        partyTrn: 'NON-RESIDENT (RCM)',
        emirate: 'Sharjah',
        taxTreatment: 'RCM_5',
        taxableAmount: rcm.taxableAmount,
        taxRate: 5,
        vatAmount: rcm.rcmOutputTax,
        grossAmount: rcm.taxableAmount + rcm.rcmOutputTax,
        vatBoxCode: 'Box 3 (Output) / Box 10 (Input)',
        status: 'POSTED'
      });
    });

    return items.sort((a, b) => new Date(b.docDate).getTime() - new Date(a.docDate).getTime());
  }, [rawSalesDocs, rawPurchases, advanceReceipts, reverseChargeList]);

  // Aggregate stats for Form VAT 201
  const vatCalculations = useMemo(() => {
    // 7 Emirates Breakdown
    const emirateBreakdown: Record<string, { net: number; vat: number; count: number }> = {
      'Abu Dhabi': { net: 0, vat: 0, count: 0 },
      'Dubai': { net: 0, vat: 0, count: 0 },
      'Sharjah': { net: 0, vat: 0, count: 0 },
      'Ajman': { net: 0, vat: 0, count: 0 },
      'Umm Al Quwain': { net: 0, vat: 0, count: 0 },
      'Ras Al Khaimah': { net: 0, vat: 0, count: 0 },
      'Fujairah': { net: 0, vat: 0, count: 0 }
    };

    let totalStandardSalesNet = 0;
    let totalStandardSalesVat = 0;
    let totalPurchasesNet = 0;
    let totalPurchasesVat = 0;

    returnTxBook.forEach(item => {
      if (item.docType === 'TAX INVOICE' || item.docType === 'ADVANCE RECEIPT') {
        const emKey = Object.keys(emirateBreakdown).find(k => item.emirate.toLowerCase().includes(k.toLowerCase())) || 'Sharjah';
        emirateBreakdown[emKey].net += item.taxableAmount;
        emirateBreakdown[emKey].vat += item.vatAmount;
        emirateBreakdown[emKey].count += 1;
        totalStandardSalesNet += item.taxableAmount;
        totalStandardSalesVat += item.vatAmount;
      } else if (item.docType === 'SUPPLIER PURCHASE') {
        totalPurchasesNet += item.taxableAmount;
        totalPurchasesVat += item.vatAmount;
      }
    });

    // RCM Totals (Box 3 & Box 10)
    const rcmTaxable = reverseChargeList.reduce((acc, r) => acc + r.taxableAmount, 0);
    const rcmVat = reverseChargeList.reduce((acc, r) => acc + r.rcmOutputTax, 0);

    // Customs Import Totals (Box 6 & Box 7)
    const customsNet = customsVatList.reduce((acc, c) => acc + c.vatBaseAmount, 0);
    const customsVat = customsVatList.reduce((acc, c) => acc + c.vatAmountPaid, 0);

    // Total Output Tax (Box 1 + Box 3 + Box 6)
    const totalOutputVat = totalStandardSalesVat + rcmVat;

    // Total Recoverable Input Tax (Box 9 Standard Purchases + Box 10 RCM + Box 7 Customs)
    const totalRecoverableInputVat = totalPurchasesVat + rcmVat + customsVat;

    // Net Payable / (Refundable) (Box 14)
    const netVatPayable = totalOutputVat - totalRecoverableInputVat;

    return {
      emirateBreakdown,
      totalStandardSalesNet,
      totalStandardSalesVat,
      totalPurchasesNet,
      totalPurchasesVat,
      rcmTaxable,
      rcmVat,
      customsNet,
      customsVat,
      totalOutputVat,
      totalRecoverableInputVat,
      netVatPayable
    };
  }, [returnTxBook, reverseChargeList, customsVatList]);

  // Validation function for 15-digit TRN starting with 100...
  const validateTrn = (trnStr: string) => {
    const clean = trnStr.replace(/[^0-9]/g, '');
    return clean.length === 15 && clean.startsWith('100');
  };

  // Handle Export / Print
  const handlePrintReturn = () => {
    printFormVat201(companyProfile, taxPeriodFrom, taxPeriodTo, vatCalculations);
    triggerToast('Generated official UAE Form VAT 201 Return Document for Printing/PDF', 'success');
  };

  const handlePrintAdvanceSchedule = () => {
    printAdvanceReceiptSchedule(companyProfile, advanceReceipts);
    triggerToast('Generated Advance Receipt Tax Schedule for Printing/PDF', 'success');
  };

  const handlePrintRcm = () => {
    printRcmReport(companyProfile, reverseChargeList);
    triggerToast('Generated Reverse Charge Mechanism Report for Printing/PDF', 'success');
  };

  const handlePrintCustoms = () => {
    printCustomsVatReport(companyProfile, customsVatList);
    triggerToast('Generated Customs VAT Import Declaration Report for Printing/PDF', 'success');
  };

  const handlePrintTxBook = () => {
    const totalTaxable = returnTxBook.reduce((s, i) => s + i.taxableAmount, 0);
    const totalVat = returnTxBook.reduce((s, i) => s + i.vatAmount, 0);
    const totalGross = returnTxBook.reduce((s, i) => s + i.grossAmount, 0);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>RETURN_TRANSACTION_BOOK_${taxPeriodTo}</title>
          <style>
            @page { size: A4 landscape; margin: 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8px; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #000; padding: 3px 5px; }
            th { background: #f0f0f0; font-weight: bold; text-align: left; }
            .tot { font-weight: bold; background: #f9f9f9; border-top: 2px solid #000; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px;">
            <div>
              <div style="font-size: 13px; font-weight: bold;">UAE VAT RETURN TRANSACTION AUDIT REGISTER</div>
              <div style="font-size: 8.5px;"><b>${companyProfile.name}</b> | TRN: ${companyProfile.trn}</div>
            </div>
            <div style="text-align: right; font-size: 8px;">
              PERIOD: ${taxPeriodFrom} TO ${taxPeriodTo} | PRINTED: ${new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>TYPE</th>
                <th>DOC #</th>
                <th>PARTY NAME</th>
                <th>PARTY TRN</th>
                <th>EMIRATE</th>
                <th style="text-align: right;">TAXABLE (AED)</th>
                <th style="text-align: right;">VAT (AED)</th>
                <th style="text-align: right;">GROSS (AED)</th>
                <th>RETURN BOX</th>
              </tr>
            </thead>
            <tbody>
              ${returnTxBook.map(t => `
                <tr>
                  <td>${t.docDate}</td>
                  <td><b>${t.docType}</b></td>
                  <td>${t.docNo}</td>
                  <td>${t.partyName}</td>
                  <td>${t.partyTrn}</td>
                  <td>${t.emirate}</td>
                  <td style="text-align: right;">${t.taxableAmount.toFixed(2)}</td>
                  <td style="text-align: right; font-weight: bold;">${t.vatAmount.toFixed(2)}</td>
                  <td style="text-align: right; font-weight: bold;">${t.grossAmount.toFixed(2)}</td>
                  <td>${t.vatBoxCode}</td>
                </tr>
              `).join('')}
              <tr class="tot">
                <td colspan="6" style="text-align: right;">TOTALS:</td>
                <td style="text-align: right;">AED ${totalTaxable.toFixed(2)}</td>
                <td style="text-align: right;">AED ${totalVat.toFixed(2)}</td>
                <td style="text-align: right;">AED ${totalGross.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    printHtml(html, `RETURN_TRANSACTION_BOOK_${taxPeriodTo}`);
    triggerToast('Generated Return Transaction Book for Printing/PDF', 'success');
  };

  const handlePrintReconciliation = () => {
    const totalDue = taxPayments.reduce((s, p) => s + p.form201NetPayable, 0);
    const totalPaid = taxPayments.reduce((s, p) => s + p.amountPaid, 0);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TAX_PAYMENT_RECONCILIATION_REPORT</title>
          <style>
            @page { size: A4 landscape; margin: 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8.5px; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #000; padding: 4px 6px; }
            th { background: #f0f0f0; font-weight: bold; text-align: left; }
            .tot { font-weight: bold; background: #f9f9f9; border-top: 2px solid #000; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px;">
            <div>
              <div style="font-size: 13px; font-weight: bold;">FTA GIBAN TAX PAYMENT RECONCILIATION SCHEDULE</div>
              <div style="font-size: 8.5px;"><b>${companyProfile.name}</b> | TRN: ${companyProfile.trn} | GIBAN: ${companyProfile.ftaGiban}</div>
            </div>
            <div style="text-align: right; font-size: 8px;">
              DATE: ${new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>TAX PERIOD</th>
                <th>DUE DATE</th>
                <th style="text-align: right;">FORM 201 NET (AED)</th>
                <th>GIBAN ACCOUNT</th>
                <th>PAYMENT DATE</th>
                <th>BANK ACCOUNT</th>
                <th style="text-align: right;">AMOUNT PAID (AED)</th>
                <th style="text-align: center;">STATUS</th>
                <th>FTA REF #</th>
              </tr>
            </thead>
            <tbody>
              ${taxPayments.map(p => `
                <tr>
                  <td><b>${p.taxPeriod}</b></td>
                  <td>${p.returnDueDate}</td>
                  <td style="text-align: right; font-weight: bold;">${p.form201NetPayable.toFixed(2)}</td>
                  <td>${p.gibanRef}</td>
                  <td>${p.paymentDate || '—'}</td>
                  <td>${p.bankAccount || '—'}</td>
                  <td style="text-align: right; font-weight: bold;">${p.amountPaid.toFixed(2)}</td>
                  <td style="text-align: center;"><b>${p.reconciliationStatus}</b></td>
                  <td>${p.ftaRefNumber || '—'}</td>
                </tr>
              `).join('')}
              <tr class="tot">
                <td colspan="2" style="text-align: right;">TOTALS:</td>
                <td style="text-align: right;">AED ${totalDue.toFixed(2)}</td>
                <td colspan="3"></td>
                <td style="text-align: right;">AED ${totalPaid.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    printHtml(html, `TAX_PAYMENT_RECONCILIATION_REPORT`);
    triggerToast('Generated Tax Payment Reconciliation Report for Printing/PDF', 'success');
  };

  const handleExportFAF = () => {
    const fafXml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AE_1.00">
  <Header>
    <AuditFileVersion>2.0.0</AuditFileVersion>
    <AuditFileCountry>AE</AuditFileCountry>
    <AuditFileDateCreated>${new Date().toISOString().split('T')[0]}</AuditFileDateCreated>
    <Company>
      <Name>${companyProfile.name}</Name>
      <TRN>${companyProfile.trn}</TRN>
      <Address>${companyProfile.address}</Address>
      <Telephone>${companyProfile.phone}</Telephone>
    </Company>
    <DefaultCurrency>AED</DefaultCurrency>
  </Header>
  <TaxTable>
    ${taxRates.map(tr => `
    <TaxTableEntry>
      <TaxCode>${tr.code}</TaxCode>
      <Description>${tr.name}</Description>
      <TaxRate>${tr.rate}</TaxRate>
    </TaxTableEntry>`).join('')}
  </TaxTable>
  <GeneralLedgerEntries>
    <TotalDebit>${vatCalculations.totalOutputVat.toFixed(2)}</TotalDebit>
    <TotalCredit>${vatCalculations.totalRecoverableInputVat.toFixed(2)}</TotalCredit>
  </GeneralLedgerEntries>
  <VATDeclarationVAT201>
    <PeriodFrom>${taxPeriodFrom}</PeriodFrom>
    <PeriodTo>${taxPeriodTo}</PeriodTo>
    <Box1TotalOutputVAT>${vatCalculations.totalStandardSalesVat.toFixed(2)}</Box1TotalOutputVAT>
    <Box3RCMOutputVAT>${vatCalculations.rcmVat.toFixed(2)}</Box3RCMOutputVAT>
    <Box9StandardInputVAT>${vatCalculations.totalPurchasesVat.toFixed(2)}</Box9StandardInputVAT>
    <Box10RCMInputVAT>${vatCalculations.rcmVat.toFixed(2)}</Box10RCMInputVAT>
    <Box14NetVATPayable>${vatCalculations.netVatPayable.toFixed(2)}</Box14NetVATPayable>
  </VATDeclarationVAT201>
</AuditFile>`;

    const blob = new Blob([fafXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FTA_Audit_File_FAF_VAT201_${taxPeriodTo}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('FTA Accounting Audit File (FAF XML) downloaded successfully', 'success');
  };

  // Navigation Items matching the user screenshot perfectly!
  const menuSections = [
    {
      title: 'REPORTS',
      items: [
        { id: 'vat201_return', label: 'Form VAT 201 Return', shortKey: 'V2', icon: Percent },
        { id: 'advance_receipt', label: 'Advance Receipt Report', shortKey: 'AD', icon: Clock },
        { id: 'reverse_charge', label: 'Reverse Charge Report', shortKey: 'R', icon: ArrowUpDown },
        { id: 'vat_paid_customs', label: 'VAT Paid to Customs Report', shortKey: 'VAT', icon: Landmark }
      ]
    },
    {
      title: 'REGISTERS',
      items: [
        { id: 'return_transaction_book', label: 'Return Transaction Book', shortKey: 'RT', icon: BookOpen },
        { id: 'tax_payment_reconciliation', label: 'Tax Payment Reconciliation', shortKey: 'RC', icon: ShieldCheck }
      ]
    },
    {
      title: 'MASTERS',
      items: [
        { id: 'tax_rate_setup', label: 'Tax Rate Setup', shortKey: 'TX', icon: Layers },
        { id: 'update_party_trn', label: 'Update Party TRN', shortKey: 'U', icon: Edit3 },
        { id: 'import_party_trn', label: 'Import Party TRN', shortKey: 'I', icon: Upload }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      
      {/* TOP APEX HEADER */}
      <div className="bg-[#002D62] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md border-b-2 border-[#FF6B00]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B00] text-white rounded-lg shadow-sm">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wide font-mono uppercase">UAE VAT 201 TAX SUITE</h1>
              <span className="bg-[#FF6B00] text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest">
                FTA E-SERVICES READY
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans">
              {companyProfile.name} | TRN: {companyProfile.trn} | GIBAN: {companyProfile.ftaGiban}
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportFAF}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded text-[10.5px] font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export FAF (XML)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintReturn}
            className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-[10.5px] font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Form (PDF)</span>
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* LEFT NAV SIDEBAR (Matches Focus ERP / Tally UAE Edition) */}
        <div className="w-full md:w-64 bg-[#0a1e36] text-white border-r border-slate-700 flex flex-col shrink-0 p-3 space-y-4">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-1 flex justify-between items-center">
            <span>VAT 201 MODULES</span>
            <span className="text-[9px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded">v2026.1</span>
          </div>

          <div className="space-y-4">
            {menuSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <div className="text-[9.5px] font-mono font-bold text-sky-400 uppercase tracking-wider px-2 py-0.5">
                  {sec.title}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const isActive = activeSubTab === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSubTab(item.id as VatSubTab)}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                          isActive
                            ? 'bg-[#FF6B00] text-white shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}`} />
                          <span className="font-sans text-[11px]">{item.label}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.shortKey}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Pill in Sidebar */}
          <div className="mt-auto bg-slate-900/90 border border-slate-700 rounded-lg p-2.5 space-y-1 text-[10px] font-mono">
            <div className="text-slate-400 uppercase text-[9px] font-bold">NET VAT POSITION</div>
            <div className={`text-sm font-black ${vatCalculations.netVatPayable >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              AED {Math.abs(vatCalculations.netVatPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400">
              {vatCalculations.netVatPayable >= 0 ? '● NET PAYABLE TO FTA' : '● NET REFUND / CARRY FORWARD'}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT DISPLAY PANEL */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-80px)] space-y-4">
          
          {/* ========================================================= */}
          {/* 1. FORM VAT 201 STANDARD OFFICIAL RETURN VIEW             */}
          {/* ========================================================= */}
          {activeSubTab === 'vat201_return' && (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                    FORM VAT201 — OFFICIAL UAE TAX RETURN FILING SHEET
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Calculated in compliance with Federal Tax Authority (FTA) Executive Regulations & Standard Emirate Allocations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded text-xs font-mono font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{taxPeriodFrom} TO {taxPeriodTo}</span>
                  </div>
                </div>
              </div>

              {/* Bento Summary 4-Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white border-l-4 border-indigo-600 rounded-lg p-3 shadow-xs">
                  <div className="text-[9.5px] font-bold text-slate-500 uppercase">Total Taxable Sales (AED)</div>
                  <div className="text-base font-black text-indigo-900 mt-1 font-mono">
                    AED {vatCalculations.totalStandardSalesNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Box 1a-1g Supplies</div>
                </div>

                <div className="bg-white border-l-4 border-blue-600 rounded-lg p-3 shadow-xs">
                  <div className="text-[9.5px] font-bold text-slate-500 uppercase">Total Output VAT (5%)</div>
                  <div className="text-base font-black text-blue-900 mt-1 font-mono">
                    AED {vatCalculations.totalOutputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Includes Box 1 & Box 3 RCM</div>
                </div>

                <div className="bg-white border-l-4 border-emerald-600 rounded-lg p-3 shadow-xs">
                  <div className="text-[9.5px] font-bold text-slate-500 uppercase">Total Recoverable Input VAT</div>
                  <div className="text-base font-black text-emerald-900 mt-1 font-mono">
                    AED {vatCalculations.totalRecoverableInputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Box 9 + Box 10 RCM + Box 7 Customs</div>
                </div>

                <div className={`border-l-4 rounded-lg p-3 shadow-xs ${
                  vatCalculations.netVatPayable >= 0 
                    ? 'bg-amber-50 border-amber-600 text-amber-950' 
                    : 'bg-emerald-50 border-emerald-600 text-emerald-950'
                }`}>
                  <div className="text-[9.5px] font-bold uppercase">Net VAT Payable / (Credit)</div>
                  <div className="text-base font-black mt-1 font-mono">
                    AED {Math.abs(vatCalculations.netVatPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] font-bold mt-0.5">
                    {vatCalculations.netVatPayable >= 0 ? 'PAYABLE TO FTA (BOX 14)' : 'REFUND / CARRY FORWARD'}
                  </div>
                </div>
              </div>

              {/* Official 7 Emirates Breakdown Table (Box 1a to 1g) */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-[#002D62] text-white px-4 py-2 text-xs font-bold uppercase flex justify-between items-center">
                  <span>SECTION 1: VAT ON SALES AND ALL OTHER OUTPUTS (BOX 1a — 1g)</span>
                  <span className="text-[#FF6B00] font-mono">STANDARD RATE 5%</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center w-16">BOX</th>
                        <th className="p-2.5">EMIRATE / DESCRIPTION OF TAXABLE SUPPLIES</th>
                        <th className="p-2.5 text-center">VOUCHERS</th>
                        <th className="p-2.5 text-right font-mono">TAXABLE AMOUNT (AED)</th>
                        <th className="p-2.5 text-right font-mono">OUTPUT VAT (AED)</th>
                        <th className="p-2.5 text-center">RATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {[
                        { box: '1a', em: 'Abu Dhabi' },
                        { box: '1b', em: 'Dubai' },
                        { box: '1c', em: 'Sharjah' },
                        { box: '1d', em: 'Ajman' },
                        { box: '1e', em: 'Umm Al Quwain' },
                        { box: '1f', em: 'Ras Al Khaimah' },
                        { box: '1g', em: 'Fujairah' },
                      ].map(row => {
                        const data = vatCalculations.emirateBreakdown[row.em];
                        return (
                          <tr key={row.box} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-center font-bold text-[#002D62] bg-slate-50">{row.box}</td>
                            <td className="p-2.5 font-sans font-semibold text-slate-800">
                              Standard Rated Supplies in {row.em}
                              {row.em === 'Sharjah' && <span className="ml-2 text-[9px] bg-blue-100 text-[#002D62] font-bold px-1.5 py-0.5 rounded">Primary Head Office</span>}
                            </td>
                            <td className="p-2.5 text-center text-slate-500 font-sans">{data.count}</td>
                            <td className="p-2.5 text-right text-slate-700">{data.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right font-bold text-blue-900">{data.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-center text-slate-500">5.00%</td>
                          </tr>
                        );
                      })}
                      {/* Box 3 Reverse Charge */}
                      <tr className="bg-amber-50/50 hover:bg-amber-50">
                        <td className="p-2.5 text-center font-bold text-[#002D62] bg-amber-100/50">3</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-800">
                          Supplies Subject to Reverse Charge Provisions (RCM Imports & Scrap)
                        </td>
                        <td className="p-2.5 text-center text-slate-500 font-sans">{reverseChargeList.length}</td>
                        <td className="p-2.5 text-right text-slate-700">{vatCalculations.rcmTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-bold text-amber-900">{vatCalculations.rcmVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center text-slate-500">5.00%</td>
                      </tr>
                      {/* Box 8 Total Output */}
                      <tr className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="p-2.5 text-center text-[#002D62]">8</td>
                        <td className="p-2.5 font-sans uppercase">TOTAL VALUE OF OUTPUTS & DUE TAX (BOX 8)</td>
                        <td className="p-2.5 text-center font-sans">-</td>
                        <td className="p-2.5 text-right">{(vatCalculations.totalStandardSalesNet + vatCalculations.rcmTaxable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right text-blue-900 font-black">AED {vatCalculations.totalOutputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Input Tax Table (Box 9 to 13) */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-[#002D62] text-white px-4 py-2 text-xs font-bold uppercase flex justify-between items-center">
                  <span>SECTION 2: VAT ON EXPENSES AND ALL OTHER INPUTS (BOX 9 — 13)</span>
                  <span className="text-emerald-400 font-mono">RECOVERABLE TAX</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center w-16">BOX</th>
                        <th className="p-2.5">DESCRIPTION OF INPUT RECOVERIES</th>
                        <th className="p-2.5 text-right font-mono">TOTAL VALUE EXCL. VAT (AED)</th>
                        <th className="p-2.5 text-right font-mono">RECOVERABLE INPUT VAT (AED)</th>
                        <th className="p-2.5 text-center">RATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 text-center font-bold text-[#002D62] bg-slate-50">9</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-800">
                          Standard Rated Procurements, Factory Materials & Operational Expenses
                        </td>
                        <td className="p-2.5 text-right text-slate-700">{vatCalculations.totalPurchasesNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-900">{vatCalculations.totalPurchasesVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center text-slate-500">5.00%</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 text-center font-bold text-[#002D62] bg-slate-50">10</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-800">
                          Supplies Subject to Reverse Charge Provisions (RCM Input Tax Claimed)
                        </td>
                        <td className="p-2.5 text-right text-slate-700">{vatCalculations.rcmTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-900">{vatCalculations.rcmVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center text-slate-500">5.00%</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 text-center font-bold text-[#002D62] bg-slate-50">7/11</td>
                        <td className="p-2.5 font-sans font-semibold text-slate-800">
                          VAT Paid on Direct Customs Imports (Customs Bill of Entry Declarations)
                        </td>
                        <td className="p-2.5 text-right text-slate-700">{vatCalculations.customsNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-900">{vatCalculations.customsVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center text-slate-500">5.00%</td>
                      </tr>
                      <tr className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="p-2.5 text-center text-[#002D62]">13</td>
                        <td className="p-2.5 font-sans uppercase">TOTAL VALUE OF RECOVERABLE TAX (BOX 13)</td>
                        <td className="p-2.5 text-right">{(vatCalculations.totalPurchasesNet + vatCalculations.rcmTaxable + vatCalculations.customsNet).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right text-emerald-900 font-black">AED {vatCalculations.totalRecoverableInputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Net Payable / Refund Due (Box 14) */}
              <div className="bg-[#002D62] text-white p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <div className="text-xs text-[#FF6B00] font-bold uppercase tracking-wider font-mono">
                    BOX 14 — NET VAT DUE OR (RECOVERABLE) FOR THIS TAX PERIOD
                  </div>
                  <p className="text-[11px] text-slate-200 mt-1 max-w-xl font-sans">
                    Calculated as Total Output Tax (Box 8: AED {vatCalculations.totalOutputVat.toFixed(2)}) minus Total Recoverable Input Tax (Box 13: AED {vatCalculations.totalRecoverableInputVat.toFixed(2)}).
                  </p>
                </div>
                <div className="text-right bg-black/30 p-3 rounded-lg border border-white/20 min-w-56">
                  <div className="text-[10px] text-slate-300 font-mono">NET AMOUNT DUE:</div>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    AED {Math.abs(vatCalculations.netVatPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold mt-0.5">
                    {vatCalculations.netVatPayable >= 0 ? 'PAYABLE TO FTA GIBAN' : 'CREDIT CARRY FORWARD'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ADVANCE RECEIPT REPORT                                 */}
          {/* ========================================================= */}
          {activeSubTab === 'advance_receipt' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                      ADVANCE RECEIPT TAX REPORT (ARTICLE 25 TAX POINT TRACKER)
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-[#002D62] font-bold px-2 py-0.5 rounded">
                      {advanceReceipts.length} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Under UAE VAT Executive Regulations, receiving an advance creates a tax point requiring 5% Output VAT declaration.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintAdvanceSchedule}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Schedule</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAdv(null);
                      setShowAddAdvModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Advance Receipt</span>
                  </button>
                </div>
              </div>

              {/* Table of Advance Receipts */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">VOUCHER #</th>
                        <th className="p-2.5">RECEIPT DATE</th>
                        <th className="p-2.5">CUSTOMER NAME</th>
                        <th className="p-2.5">CUSTOMER TRN</th>
                        <th className="p-2.5">PLACE OF SUPPLY</th>
                        <th className="p-2.5 text-right font-mono">GROSS RECEIVED (AED)</th>
                        <th className="p-2.5 text-right font-mono">TAXABLE (AED)</th>
                        <th className="p-2.5 text-right font-mono">5% VAT (AED)</th>
                        <th className="p-2.5 text-center">STATUS (CLICK TO TOGGLE)</th>
                        <th className="p-2.5">ALLOCATED INVOICE</th>
                        <th className="p-2.5 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {advanceReceipts.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-6 text-center text-slate-400 font-sans">
                            No advance receipts recorded yet. Click "+ Record Advance Receipt" above.
                          </td>
                        </tr>
                      ) : (
                        advanceReceipts.map(adv => (
                          <tr key={adv.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 font-bold text-[#002D62]">{adv.voucherNo}</td>
                            <td className="p-2.5 text-slate-600">{adv.date}</td>
                            <td className="p-2.5 font-sans font-semibold text-slate-800">{adv.customerName}</td>
                            <td className="p-2.5 text-slate-600">{adv.customerTrn || '—'}</td>
                            <td className="p-2.5 font-sans">{adv.placeOfSupply}</td>
                            <td className="p-2.5 text-right font-bold text-slate-900">{adv.advanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right text-slate-700">{adv.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right font-bold text-blue-900">{adv.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-center font-sans">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextStatus = adv.status === 'ADJUSTED' ? 'UNADJUSTED' : 'ADJUSTED';
                                  setAdvanceReceipts(prev => prev.map(a => a.id === adv.id ? {
                                    ...a,
                                    status: nextStatus,
                                    allocatedInvoiceNo: nextStatus === 'ADJUSTED' ? (a.allocatedInvoiceNo || 'INV-2026-AUTO') : undefined
                                  } : a));
                                  triggerToast(`Updated ${adv.voucherNo} status to ${nextStatus}`, 'info');
                                }}
                                title="Click to toggle Adjusted / Unadjusted"
                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors shadow-xs ${
                                  adv.status === 'ADJUSTED'
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {adv.status} ↺
                              </button>
                            </td>
                            <td className="p-2.5 text-slate-600 font-sans">
                              {adv.allocatedInvoiceNo ? (
                                <span className="text-[#002D62] font-bold font-mono">{adv.allocatedInvoiceNo}</span>
                              ) : (
                                <span className="text-amber-600 text-[10px] font-bold">Unallocated (Open Liability)</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-sans">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAdv(adv);
                                    setShowAddAdvModal(true);
                                  }}
                                  title="Edit Advance Receipt"
                                  className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#002D62] rounded cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete advance receipt ${adv.voucherNo}?`)) {
                                      setAdvanceReceipts(prev => prev.filter(a => a.id !== adv.id));
                                      triggerToast(`Deleted ${adv.voucherNo}`, 'info');
                                    }
                                  }}
                                  title="Delete Record"
                                  className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. REVERSE CHARGE REPORT (RCM)                            */}
          {/* ========================================================= */}
          {activeSubTab === 'reverse_charge' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                      REVERSE CHARGE MECHANISM (RCM) REPORT — BOX 3 & BOX 10
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-[#002D62] font-bold px-2 py-0.5 rounded">
                      {reverseChargeList.length} Declarations
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Tracks import of services/goods where the recipient accounts for both Output Tax (Box 3) and Recoverable Input Tax (Box 10).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintRcm}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print RCM Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRcm(null);
                      setShowAddRcmModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add RCM Declaration</span>
                  </button>
                </div>
              </div>

              {/* RCM List Table */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">REF #</th>
                        <th className="p-2.5">DATE</th>
                        <th className="p-2.5">SUPPLIER / OVERSEAS VENDOR</th>
                        <th className="p-2.5">ORIGIN</th>
                        <th className="p-2.5">NATURE OF PROCUREMENT</th>
                        <th className="p-2.5 text-right font-mono">TAXABLE (AED)</th>
                        <th className="p-2.5 text-right font-mono">RCM OUTPUT (5%)</th>
                        <th className="p-2.5 text-right font-mono">RCM INPUT (5%)</th>
                        <th className="p-2.5 text-center">NET CASH</th>
                        <th className="p-2.5">VAT BOX</th>
                        <th className="p-2.5 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {reverseChargeList.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-6 text-center text-slate-400 font-sans">
                            No Reverse Charge declarations recorded. Click "+ Add RCM Declaration" above.
                          </td>
                        </tr>
                      ) : (
                        reverseChargeList.map(rcm => (
                          <tr key={rcm.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 font-bold text-[#002D62]">{rcm.refNo}</td>
                            <td className="p-2.5 text-slate-600">{rcm.date}</td>
                            <td className="p-2.5 font-sans font-semibold text-slate-800">{rcm.supplierName}</td>
                            <td className="p-2.5 font-sans text-slate-600">{rcm.country}</td>
                            <td className="p-2.5 font-sans text-slate-700">{rcm.natureOfService}</td>
                            <td className="p-2.5 text-right font-bold text-slate-900">{rcm.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right text-blue-900 font-bold">{rcm.rcmOutputTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right text-emerald-900 font-bold">{rcm.recoverableInputTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-center text-emerald-700 font-bold font-sans">AED 0.00</td>
                            <td className="p-2.5 text-slate-600 text-[10px]">{rcm.vatBox}</td>
                            <td className="p-2.5 text-center font-sans">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRcm(rcm);
                                    setShowAddRcmModal(true);
                                  }}
                                  title="Edit RCM Declaration"
                                  className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#002D62] rounded cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete RCM Declaration ${rcm.refNo}?`)) {
                                      setReverseChargeList(prev => prev.filter(r => r.id !== rcm.id));
                                      triggerToast(`Deleted ${rcm.refNo}`, 'info');
                                    }
                                  }}
                                  title="Delete Record"
                                  className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. VAT PAID TO CUSTOMS REPORT                             */}
          {/* ========================================================= */}
          {activeSubTab === 'vat_paid_customs' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                      VAT PAID TO CUSTOMS REPORT (BOX 6 & BOX 7 IMPORT AUDIT)
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-[#002D62] font-bold px-2 py-0.5 rounded">
                      {customsVatList.length} Declarations
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Reconciles Customs Bill of Entry (BOE) import declarations paid at UAE ports with FTA e-Guarantee clearance records.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomsColumnsModal(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Columns className="w-3.5 h-3.5 text-[#002D62]" />
                    <span>+ Add Columns / Customize</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintCustoms}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustoms(null);
                      setShowAddCustomsModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Customs Declaration</span>
                  </button>
                </div>
              </div>

              {/* Customs Table with Dynamic Columns */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        {customsColumns.declarationNo && <th className="p-2.5">DECLARATION #</th>}
                        {customsColumns.boeNo && <th className="p-2.5">BOE #</th>}
                        {customsColumns.date && <th className="p-2.5">DATE</th>}
                        {customsColumns.customsPort && <th className="p-2.5">CUSTOMS PORT</th>}
                        {customsColumns.supplierName && <th className="p-2.5">OVERSEAS EXPORTER</th>}
                        {customsColumns.cifValue && <th className="p-2.5 text-right font-mono">CIF VALUE (AED)</th>}
                        {customsColumns.customsDuty && <th className="p-2.5 text-right font-mono">DUTY (5%)</th>}
                        {customsColumns.vatBaseAmount && <th className="p-2.5 text-right font-mono">VAT BASE (AED)</th>}
                        {customsColumns.vatAmountPaid && <th className="p-2.5 text-right font-mono">VAT PAID (5%)</th>}
                        {customsColumns.paymentMode && <th className="p-2.5 text-center">SCHEME / MODE</th>}
                        {customsColumns.clearingAgent && <th className="p-2.5">CLEARING AGENT</th>}
                        {customsColumns.reconciliationStatus && <th className="p-2.5 text-center">STATUS</th>}
                        {customsColumns.remarks && <th className="p-2.5">REMARKS</th>}
                        <th className="p-2.5 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {customsVatList.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="p-6 text-center text-slate-400 font-sans">
                            No Customs declarations recorded. Click "+ Add Customs Declaration" above.
                          </td>
                        </tr>
                      ) : (
                        customsVatList.map(cst => (
                          <tr key={cst.id} className="hover:bg-slate-50 transition-colors">
                            {customsColumns.declarationNo && <td className="p-2.5 font-bold text-[#002D62]">{cst.declarationNo}</td>}
                            {customsColumns.boeNo && <td className="p-2.5 text-slate-700">{cst.boeNo}</td>}
                            {customsColumns.date && <td className="p-2.5 text-slate-600">{cst.date}</td>}
                            {customsColumns.customsPort && <td className="p-2.5 font-sans text-slate-800 font-semibold">{cst.customsPort}</td>}
                            {customsColumns.supplierName && <td className="p-2.5 font-sans text-slate-700">{cst.supplierName}</td>}
                            {customsColumns.cifValue && <td className="p-2.5 text-right text-slate-700">{cst.cifValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
                            {customsColumns.customsDuty && <td className="p-2.5 text-right text-slate-700">{cst.customsDuty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
                            {customsColumns.vatBaseAmount && <td className="p-2.5 text-right text-slate-700">{(cst.vatBaseAmount || (cst.cifValue + cst.customsDuty)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
                            {customsColumns.vatAmountPaid && <td className="p-2.5 text-right font-bold text-emerald-900">{cst.vatAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
                            {customsColumns.paymentMode && <td className="p-2.5 text-center font-sans text-[9px] text-slate-600">{cst.paymentMode}</td>}
                            {customsColumns.clearingAgent && <td className="p-2.5 font-sans text-slate-600 text-[10px]">{cst.clearingAgent || '—'}</td>}
                            {customsColumns.reconciliationStatus && (
                              <td className="p-2.5 text-center">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-sans ${
                                  cst.reconciliationStatus === 'MATCHED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {cst.reconciliationStatus}
                                </span>
                              </td>
                            )}
                            {customsColumns.remarks && <td className="p-2.5 font-sans text-slate-500 text-[10px]">{cst.remarks || '—'}</td>}
                            <td className="p-2.5 text-center font-sans">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCustoms(cst);
                                    setShowAddCustomsModal(true);
                                  }}
                                  title="Edit Customs Declaration"
                                  className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#002D62] rounded cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete declaration ${cst.declarationNo}?`)) {
                                      setCustomsVatList(prev => prev.filter(c => c.id !== cst.id));
                                      triggerToast(`Deleted ${cst.declarationNo}`, 'info');
                                    }
                                  }}
                                  title="Delete Record"
                                  className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. RETURN TRANSACTION BOOK                                */}
          {/* ========================================================= */}
          {activeSubTab === 'return_transaction_book' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                      RETURN TRANSACTION BOOK (COMPREHENSIVE TAX AUDIT REGISTER)
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-[#002D62] font-bold px-2 py-0.5 rounded">
                      {returnTxBook.length} Transactions
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Voucher-by-voucher audit register of all Invoices, Purchases, Credit Notes, and Advances mapped to VAT 201 Return Boxes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search Party, Doc No, TRN..."
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#002D62] w-52 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handlePrintTxBook}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Register</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">DATE</th>
                        <th className="p-2.5">TYPE</th>
                        <th className="p-2.5">DOC #</th>
                        <th className="p-2.5">PARTY NAME</th>
                        <th className="p-2.5">PARTY TRN</th>
                        <th className="p-2.5">PLACE OF SUPPLY</th>
                        <th className="p-2.5 text-right font-mono">TAXABLE (AED)</th>
                        <th className="p-2.5 text-right font-mono">VAT (AED)</th>
                        <th className="p-2.5 text-right font-mono">GROSS (AED)</th>
                        <th className="p-2.5">RETURN BOX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {returnTxBook
                        .filter(item => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            item.docNo.toLowerCase().includes(q) ||
                            item.partyName.toLowerCase().includes(q) ||
                            item.partyTrn.toLowerCase().includes(q)
                          );
                        })
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-slate-600">{item.docDate}</td>
                            <td className="p-2.5 font-sans font-bold text-[10px] text-slate-700">{item.docType}</td>
                            <td className="p-2.5 font-bold text-[#002D62]">{item.docNo}</td>
                            <td className="p-2.5 font-sans font-semibold text-slate-800 max-w-xs truncate">{item.partyName}</td>
                            <td className="p-2.5 text-slate-600">{item.partyTrn || '—'}</td>
                            <td className="p-2.5 font-sans text-slate-700">{item.emirate}</td>
                            <td className="p-2.5 text-right text-slate-700">{item.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right font-bold text-blue-900">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-right font-bold text-slate-900">{item.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-2.5 text-[10px] text-[#002D62] font-semibold">{item.vatBoxCode}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. TAX PAYMENT RECONCILIATION                             */}
          {/* ========================================================= */}
          {activeSubTab === 'tax_payment_reconciliation' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                      TAX PAYMENT RECONCILIATION & FTA CLEARING LEDGER
                    </h2>
                    <span className="text-[10px] bg-blue-100 text-[#002D62] font-bold px-2 py-0.5 rounded">
                      {taxPayments.length} Tax Periods
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Reconciles Net VAT Payable from Form VAT 201 returns with bank payment vouchers and FTA e-Services transaction receipts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintReconciliation}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Schedule</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPayment(null);
                      setShowAddPaymentModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record FTA Payment</span>
                  </button>
                </div>
              </div>

              {/* Tax Payments Table */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">TAX PERIOD</th>
                        <th className="p-2.5">DUE DATE</th>
                        <th className="p-2.5 text-right font-mono">FORM 201 NET (AED)</th>
                        <th className="p-2.5">GIBAN / PAYMENT REF</th>
                        <th className="p-2.5">PAID DATE</th>
                        <th className="p-2.5">BANK ACCOUNT</th>
                        <th className="p-2.5 text-right font-mono">AMOUNT PAID (AED)</th>
                        <th className="p-2.5 text-center">STATUS</th>
                        <th className="p-2.5">FTA RECEIPT #</th>
                        <th className="p-2.5 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {taxPayments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold text-[#002D62] font-sans">{pay.taxPeriod}</td>
                          <td className="p-2.5 text-slate-600">{pay.returnDueDate}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{pay.form201NetPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-slate-600 text-[10px]">{pay.gibanRef}</td>
                          <td className="p-2.5 text-slate-600">{pay.paymentDate || '—'}</td>
                          <td className="p-2.5 font-sans text-slate-700">{pay.bankAccount || '—'}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-900">{pay.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = pay.reconciliationStatus === 'SETTLED' ? 'UNSETTLED' : 'SETTLED';
                                setTaxPayments(prev => prev.map(p => p.id === pay.id ? {
                                  ...p,
                                  reconciliationStatus: nextStatus,
                                  amountPaid: nextStatus === 'SETTLED' ? (p.amountPaid || p.form201NetPayable) : 0,
                                  paymentDate: nextStatus === 'SETTLED' ? (p.paymentDate || new Date().toISOString().split('T')[0]) : ''
                                } : p));
                                triggerToast(`Updated payment status for ${pay.taxPeriod}`, 'info');
                              }}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded font-sans cursor-pointer transition-colors shadow-xs ${
                                pay.reconciliationStatus === 'SETTLED'
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {pay.reconciliationStatus} ↺
                            </button>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[10px]">{pay.ftaRefNumber || '—'}</td>
                          <td className="p-2.5 text-center font-sans">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPayment(pay);
                                  setShowAddPaymentModal(true);
                                }}
                                title="Edit FTA Payment"
                                className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#002D62] rounded cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete tax payment record ${pay.taxPeriod}?`)) {
                                    setTaxPayments(prev => prev.filter(p => p.id !== pay.id));
                                    triggerToast(`Deleted ${pay.taxPeriod}`, 'info');
                                  }
                                }}
                                title="Delete Record"
                                className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. TAX RATE SETUP (MASTERS)                               */}
          {/* ========================================================= */}
          {activeSubTab === 'tax_rate_setup' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                    UAE TAX RATE SETUP & CHART OF ACCOUNTS MAPPING
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Master configuration for Standard 5%, Zero-Rated, Exempt, RCM, and Designated Freezone tax treatments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaxRate(null);
                    setShowAddTaxRateModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tax Rate Code</span>
                </button>
              </div>

              {/* Tax Rate Table */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">TAX CODE</th>
                        <th className="p-2.5">RATE NAME</th>
                        <th className="p-2.5 text-center font-mono">RATE %</th>
                        <th className="p-2.5">CATEGORY / SCOPE</th>
                        <th className="p-2.5">OUTPUT GL ACCOUNT</th>
                        <th className="p-2.5">INPUT GL ACCOUNT</th>
                        <th className="p-2.5 text-center">STATUS</th>
                        <th className="p-2.5 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {taxRates.map(tr => (
                        <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold text-[#002D62]">{tr.code}</td>
                          <td className="p-2.5 font-sans font-bold text-slate-900">{tr.name}</td>
                          <td className="p-2.5 text-center font-bold text-blue-900">{tr.rate.toFixed(2)}%</td>
                          <td className="p-2.5 font-sans text-slate-600 max-w-sm">{tr.scope}</td>
                          <td className="p-2.5 font-sans text-slate-700 text-[10.5px]">{tr.outputGlAccount}</td>
                          <td className="p-2.5 font-sans text-slate-700 text-[10.5px]">{tr.inputGlAccount}</td>
                          <td className="p-2.5 text-center">
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans">
                              ACTIVE
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-sans">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTaxRate(tr);
                                  setShowAddTaxRateModal(true);
                                }}
                                title="Edit Tax Rate"
                                className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#002D62] rounded cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete tax rate code ${tr.code}?`)) {
                                    setTaxRates(prev => prev.filter(t => t.id !== tr.id));
                                    triggerToast(`Deleted ${tr.code}`, 'info');
                                  }
                                }}
                                title="Delete Rate"
                                className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. UPDATE PARTY TRN (MASTERS)                             */}
          {/* ========================================================= */}
          {activeSubTab === 'update_party_trn' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                    UPDATE PARTY TAX REGISTRATION NUMBERS (TRN MASTER)
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Directly verify, update, and validate 15-digit UAE TRNs for all Customer and Supplier accounts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingParty(null);
                      setShowAddPartyModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Register Party TRN</span>
                  </button>
                </div>
              </div>

              {/* Party TRN Table with Fast In-Place Editing */}
              <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">PARTY CODE</th>
                        <th className="p-2.5">PARTY LEGAL NAME</th>
                        <th className="p-2.5">TYPE</th>
                        <th className="p-2.5">15-DIGIT UAE TRN</th>
                        <th className="p-2.5 text-center">VALIDATION</th>
                        <th className="p-2.5">PLACE OF SUPPLY</th>
                        <th className="p-2.5">TRADE LICENSE</th>
                        <th className="p-2.5 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {partyTrnList.map(party => {
                        const isValid = validateTrn(party.trn);
                        return (
                          <tr key={party.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 font-bold text-[#002D62]">{party.partyCode}</td>
                            <td className="p-2.5 font-sans font-bold text-slate-900">{party.partyName}</td>
                            <td className="p-2.5 font-sans text-slate-600">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                party.partyType === 'CUSTOMER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {party.partyType}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={party.trn}
                                onChange={e => {
                                  const val = e.target.value.trim();
                                  setPartyTrnList(prev => prev.map(p => p.id === party.id ? { ...p, trn: val, isVerified: validateTrn(val) } : p));
                                }}
                                placeholder="100XXXXXXXXX003"
                                className="px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs w-44 bg-white focus:outline-none focus:border-[#002D62]"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              {party.trn ? (
                                isValid ? (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-sans">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid 15-Digit
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-sans">
                                    <AlertCircle className="w-3 h-3 text-rose-600" /> Invalid Format
                                  </span>
                                )
                              ) : (
                                <span className="text-[9.5px] text-slate-400 font-sans">Missing TRN</span>
                              )}
                            </td>
                            <td className="p-2.5 font-sans text-slate-700">{party.placeOfSupply}</td>
                            <td className="p-2.5 text-slate-600">{party.tradeLicenseNo || '—'}</td>
                            <td className="p-2.5 text-center font-sans">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => triggerToast(`Saved TRN for ${party.partyName}`, 'success')}
                                  className="px-2 py-1 bg-slate-100 hover:bg-[#002D62] hover:text-white text-slate-700 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingParty(party);
                                    setShowAddPartyModal(true);
                                  }}
                                  title="Edit Party Details"
                                  className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#002D62] rounded cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete party record ${party.partyName}?`)) {
                                      setPartyTrnList(prev => prev.filter(p => p.id !== party.id));
                                      triggerToast(`Deleted ${party.partyName}`, 'info');
                                    }
                                  }}
                                  title="Delete Party"
                                  className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
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
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. IMPORT PARTY TRN (MASTERS)                             */}
          {/* ========================================================= */}
          {activeSubTab === 'import_party_trn' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-sm font-black text-[#002D62] uppercase tracking-wide">
                    IMPORT PARTY TRN (BATCH CSV / EXCEL SPREADSHEET IMPORTER)
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Paste rows directly from Excel or upload a CSV file to batch-update TRNs, Trade Licenses, and Emirates in 1 click.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sample = `Party Name,Party Type,TRN,Place of Supply,Trade License
AL FANAR STEEL WORKS CO.,CUSTOMER,100234598000003,Sharjah,SHJ-88412
GULF PIPELINES CONTRACTING LLC,CUSTOMER,100342918400003,Dubai,DXB-554199
EMIRATES STEEL INDUSTRIES PJSC,SUPPLIER,100112849000003,Abu Dhabi,AD-99412`;
                    setImportCsvText(sample);
                    triggerToast('Sample CSV loaded into text box', 'info');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Load Sample CSV</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Paste Tab-Delimited or CSV Data (Columns: Party Name, Party Type, TRN, Place of Supply, Trade License)
                </label>
                <textarea
                  rows={8}
                  value={importCsvText}
                  onChange={e => setImportCsvText(e.target.value)}
                  placeholder="Paste table data here..."
                  className="w-full border border-slate-300 rounded p-3 text-xs font-mono focus:outline-none focus:border-[#002D62]"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!importCsvText.trim()) {
                        triggerToast('Please paste CSV data first', 'warning');
                        return;
                      }
                      const lines = importCsvText.trim().split('\n');
                      let addedCount = 0;
                      const newParties = [...partyTrnList];

                      lines.forEach((line, idx) => {
                        if (idx === 0 && line.toLowerCase().includes('party name')) return;
                        const parts = line.split(/[,\t]/).map(s => s.trim());
                        if (parts.length >= 3) {
                          const pName = parts[0];
                          const pType = (parts[1]?.toUpperCase() === 'SUPPLIER' ? 'SUPPLIER' : 'CUSTOMER') as 'CUSTOMER' | 'SUPPLIER';
                          const trn = parts[2] || '';
                          const pos = parts[3] || 'Sharjah';
                          const tl = parts[4] || '';

                          const existingIdx = newParties.findIndex(p => p.partyName.toLowerCase() === pName.toLowerCase());
                          if (existingIdx >= 0) {
                            newParties[existingIdx].trn = trn;
                            newParties[existingIdx].placeOfSupply = pos;
                            newParties[existingIdx].tradeLicenseNo = tl;
                            newParties[existingIdx].isVerified = validateTrn(trn);
                          } else {
                            newParties.push({
                              id: `imp-${Date.now()}-${idx}`,
                              partyCode: `${pType === 'CUSTOMER' ? 'CUST' : 'SUPP'}-${2000 + newParties.length}`,
                              partyName: pName.toUpperCase(),
                              partyType: pType,
                              trn: trn,
                              placeOfSupply: pos,
                              tradeLicenseNo: tl,
                              taxTreatment: 'STANDARD_TAXABLE',
                              isVerified: validateTrn(trn)
                            });
                          }
                          addedCount++;
                        }
                      });

                      setPartyTrnList(newParties);
                      setImportCsvText('');
                      triggerToast(`Successfully processed and updated ${addedCount} parties!`, 'success');
                      setActiveSubTab('update_party_trn');
                    }}
                    className="px-4 py-2 bg-[#002D62] hover:bg-[#001f44] text-white rounded text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Apply Batch Import to Masters</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALS RENDER SECTION                                     */}
      {/* ========================================================= */}

      {/* 1. Advance Receipt Modal */}
      <AddEditAdvanceReceiptModal
        isOpen={showAddAdvModal}
        onClose={() => {
          setShowAddAdvModal(false);
          setEditingAdv(null);
        }}
        editingItem={editingAdv}
        onSave={savedAdv => {
          if (editingAdv) {
            setAdvanceReceipts(prev => prev.map(a => a.id === savedAdv.id ? savedAdv : a));
            triggerToast(`Updated advance receipt ${savedAdv.voucherNo}`, 'success');
          } else {
            setAdvanceReceipts(prev => [savedAdv, ...prev]);
            triggerToast(`Recorded advance receipt ${savedAdv.voucherNo}`, 'success');
          }
          setShowAddAdvModal(false);
          setEditingAdv(null);
        }}
      />

      {/* 2. RCM Modal */}
      <AddEditRcmModal
        isOpen={showAddRcmModal}
        onClose={() => {
          setShowAddRcmModal(false);
          setEditingRcm(null);
        }}
        editingItem={editingRcm}
        onSave={savedRcm => {
          if (editingRcm) {
            setReverseChargeList(prev => prev.map(r => r.id === savedRcm.id ? savedRcm : r));
            triggerToast(`Updated RCM declaration ${savedRcm.refNo}`, 'success');
          } else {
            setReverseChargeList(prev => [savedRcm, ...prev]);
            triggerToast(`Added RCM declaration ${savedRcm.refNo}`, 'success');
          }
          setShowAddRcmModal(false);
          setEditingRcm(null);
        }}
      />

      {/* 3. Customs Declaration Modal */}
      <AddEditCustomsModal
        isOpen={showAddCustomsModal}
        onClose={() => {
          setShowAddCustomsModal(false);
          setEditingCustoms(null);
        }}
        editingItem={editingCustoms}
        onSave={savedCustoms => {
          if (editingCustoms) {
            setCustomsVatList(prev => prev.map(c => c.id === savedCustoms.id ? savedCustoms : c));
            triggerToast(`Updated customs declaration ${savedCustoms.declarationNo}`, 'success');
          } else {
            setCustomsVatList(prev => [savedCustoms, ...prev]);
            triggerToast(`Added customs declaration ${savedCustoms.declarationNo}`, 'success');
          }
          setShowAddCustomsModal(false);
          setEditingCustoms(null);
        }}
      />

      {/* 4. Customs Columns Configuration Modal */}
      <CustomsColumnsModal
        isOpen={showCustomsColumnsModal}
        onClose={() => setShowCustomsColumnsModal(false)}
        columnsConfig={customsColumns}
        onSave={newCols => {
          setCustomsColumns(newCols);
          setShowCustomsColumnsModal(false);
          triggerToast('Customs report column configuration saved!', 'success');
        }}
      />

      {/* 5. Tax Payment Reconciliation Modal */}
      <AddEditTaxPaymentModal
        isOpen={showAddPaymentModal}
        onClose={() => {
          setShowAddPaymentModal(false);
          setEditingPayment(null);
        }}
        editingItem={editingPayment}
        onSave={savedPay => {
          if (editingPayment) {
            setTaxPayments(prev => prev.map(p => p.id === savedPay.id ? savedPay : p));
            triggerToast(`Updated tax payment for ${savedPay.taxPeriod}`, 'success');
          } else {
            setTaxPayments(prev => [savedPay, ...prev]);
            triggerToast(`Recorded FTA payment for ${savedPay.taxPeriod}`, 'success');
          }
          setShowAddPaymentModal(false);
          setEditingPayment(null);
        }}
      />

      {/* 6. Tax Rate Master Modal */}
      <AddEditTaxRateModal
        isOpen={showAddTaxRateModal}
        onClose={() => {
          setShowAddTaxRateModal(false);
          setEditingTaxRate(null);
        }}
        editingItem={editingTaxRate}
        onSave={savedRate => {
          if (editingTaxRate) {
            setTaxRates(prev => prev.map(r => r.id === savedRate.id ? savedRate : r));
            triggerToast(`Updated tax rate ${savedRate.code}`, 'success');
          } else {
            setTaxRates(prev => [savedRate, ...prev]);
            triggerToast(`Added tax rate ${savedRate.code}`, 'success');
          }
          setShowAddTaxRateModal(false);
          setEditingTaxRate(null);
        }}
      />

      {/* 7. Party TRN Master Modal */}
      <AddEditPartyModal
        isOpen={showAddPartyModal}
        onClose={() => {
          setShowAddPartyModal(false);
          setEditingParty(null);
        }}
        editingItem={editingParty}
        onSave={savedParty => {
          if (editingParty) {
            setPartyTrnList(prev => prev.map(p => p.id === savedParty.id ? savedParty : p));
            triggerToast(`Updated party ${savedParty.partyName}`, 'success');
          } else {
            setPartyTrnList(prev => [savedParty, ...prev]);
            triggerToast(`Registered party ${savedParty.partyName}`, 'success');
          }
          setShowAddPartyModal(false);
          setEditingParty(null);
        }}
      />

    </div>
  );
};
export default UaeVat201ManagerComponent;
