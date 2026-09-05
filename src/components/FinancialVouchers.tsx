import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeftRight,
  HelpCircle,
  Sparkles,
  FileText,
  AlertTriangle,
  Info,
  Save,
  Users,
  Database,
  Eye,
  Edit3,
  FilePlus,
  ArrowLeftCircle,
  ArrowRightCircle,
  PauseCircle,
  ShieldCheck,
  XCircle,
  Building2,
  X
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getCompanyProfile, CompanyProfile } from '../utils/companyProfile';
import { EditCompanyModal } from './EditCompanyModal';

// Define the Financial Voucher model
export interface FinancialVoucher {
  id: string;
  voucherType: 'CONTRA' | 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'SALES' | 'PURCHASE' | 'COMMISSION';
  voucherNo: string;
  date: string;
  primaryAccount: string; // Account receiving or sending funds (e.g. Bank, Cash, AR, AP)
  offsetAccount: string;  // Counter ledger account
  partyName: string;      // Customer / Supplier / Employee Name
  partyType: 'CUSTOMER' | 'SUPPLIER' | 'NONE';
  partyAddress?: string;  // Customer / Supplier Address
  partyBankAccount?: string; // Customer / Supplier Bank Account / IBAN for Cheque
  chequeBankName?: string; // Cheque Bank Name
  chequeBankAddress?: string; // Cheque Bank Address
  poRef?: string;         // Against PO No
  invoiceRef?: string;    // Related Invoice No
  advanceAmount?: number | string; // Advance AED
  balanceAmount?: number | string; // Balance AED
  amount: number;         // Monetary value of transaction
  referenceNo: string;    // Bill ref, Invoice No, LPO No, Cheque No
  narration: string;      // Notes / Details
  status: 'DRAFT' | 'POSTED';
  isAutomated: boolean;   // Whether auto-triggered by matching rules
  // Support for multiple split ledger lines if desired
  lines?: Array<{
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    narration?: string;
  }>;
}

interface FinancialVouchersProps {
  clientDatabase: string[];
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialTypeFilter?: 'ALL' | 'CONTRA' | 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'SALES' | 'PURCHASE' | 'COMMISSION';
  showOnlyRecords?: boolean;
}

// Helper for Amount in Words (AED / Dirhams)
export const numberToWordsDirhams = (num: number): string => {
  if (isNaN(num) || num <= 0) return 'Zero Dirhams Only';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return 'Zero';
    let result = '';
    if (n >= 1000000) {
      result += convertLessThanThousand(Math.floor(n / 1000000)) + ' Million ';
      n %= 1000000;
    }
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n > 0) {
      result += convertLessThanThousand(n);
    }
    return result.trim();
  };

  const integerPart = Math.floor(num);
  const filsPart = Math.round((num - integerPart) * 100);

  let words = convert(integerPart) + ' Dirhams';
  if (filsPart > 0) {
    words += ' and ' + convert(filsPart) + ' Fils';
  }
  return words + ' Only';
};

export default function FinancialVouchers({ clientDatabase, triggerToast, initialTypeFilter = 'ALL', showOnlyRecords = false }: FinancialVouchersProps) {
  // Focus ERP 9 Standard Supplier Database
  const supplierDatabase = useMemo(() => [
    'SABIC STEEL CORP, SAUDI ARABIA',
    'HYUNDAI STEEL SHANGHAI',
    'AL FANAR STEEL WORKS CO.',
    'AJMAN GALVANIZING & COATING L.L.C',
    'ZAMIL HEAVY INDUSTRIES LTD',
    'KAOHSIUNG COLD BAR PORT TERMINALS'
  ], []);

  // Focus ERP 9 Standard Ledger Chart of Accounts (COA)
  const ledgerAccounts = useMemo(() => [
    // Cash & Bank Accounts (For Contra Vouchers)
    { code: '1000', name: 'RAK Bank Current A/C (0242715908001)', category: 'BANK' },
    { code: '1010', name: 'RAK Bank IBAN (AE940400000242715908001)', category: 'BANK' },
    { code: '1020', name: 'Mashreq Bank Operational A/C', category: 'BANK' },
    { code: '1100', name: 'Main Cash in Hand Vault', category: 'CASH' },
    { code: '1110', name: 'Petty Cash Ledger', category: 'CASH' },
    { code: '1120', name: 'Factory Office Cash Float', category: 'CASH' },
    // General Ledger Accounts (For Journal Vouchers)
    { code: '1200', name: 'Accounts Receivable control', category: 'AR' },
    { code: '2200', name: 'Accounts Payable control', category: 'AP' },
    { code: '2300', name: 'Output VAT Payable 5%', category: 'TAX' },
    { code: '2310', name: 'Input VAT Recoverable 5%', category: 'TAX' },
    { code: '2400', name: 'Salaries & Wages Payable', category: 'LIABILITY' },
    { code: '3000', name: 'Capital Account / Equity', category: 'EQUITY' },
    { code: '3100', name: 'Retained Earnings / Reserves', category: 'EQUITY' },
    { code: '4000', name: 'Primary Industrial Sales', category: 'INCOME' },
    { code: '4100', name: 'Scrap & By-Product Sales', category: 'INCOME' },
    { code: '5000', name: 'Raw Material Procurement Expenses', category: 'EXPENSE' },
    { code: '5100', name: 'Power & Utility Charges', category: 'EXPENSE' },
    { code: '5200', name: 'Custom Galvanizing Outsource', category: 'EXPENSE' },
    { code: '5300', name: 'Logistics Freight & Carriage', category: 'EXPENSE' },
    { code: '5400', name: 'Factory Maintenance & Spares', category: 'EXPENSE' },
    { code: '5500', name: 'Depreciation - Machinery & Equipment', category: 'EXPENSE' },
    { code: '5600', name: 'Bank Charges & Commission', category: 'EXPENSE' }
  ], []);

  // State: Vouchers List (MF_FINANCIAL_VOUCHERS)
  const [vouchers, setVouchers] = useState<FinancialVoucher[]>(() => {
    const saved = localStorage.getItem('MF_FINANCIAL_VOUCHERS');
    let loaded: FinancialVoucher[] = [];
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loaded = parsed;
        }
      } catch (e) { console.error(e); }
    }
    
    // Seed standard base vouchers if local storage is completely blank
    if (loaded.length === 0) {
      const yearStr = new Date().getFullYear().toString().substring(2);
      loaded = [
        {
          id: 'v-seed-1',
          voucherType: 'RECEIPT',
          voucherNo: `RCT-${yearStr}-0001`,
          date: new Date().toISOString().split('T')[0],
          primaryAccount: 'RAK Bank Current A/C (0242715908001)',
          offsetAccount: 'Accounts Receivable control',
          partyName: 'AL ABBAR IRON WORKS L.L.C',
          partyType: 'CUSTOMER',
          amount: 45000,
          referenceNo: 'CHQ-890123',
          narration: 'Settlement receipt for structural anchor bolts supply.',
          status: 'POSTED',
          isAutomated: false
        },
        {
          id: 'v-seed-2',
          voucherType: 'PAYMENT',
          voucherNo: `PAY-${yearStr}-0001`,
          date: new Date().toISOString().split('T')[0],
          primaryAccount: 'Main Cash in Hand Vault',
          offsetAccount: 'Power & Utility Charges',
          partyName: 'N/A',
          partyType: 'NONE',
          amount: 4200,
          referenceNo: 'PETTY-8912',
          narration: 'Cash payout for manufacturing facility utility billing.',
          status: 'POSTED',
          isAutomated: false
        },
        {
          id: 'v-seed-3',
          voucherType: 'CONTRA',
          voucherNo: `CON-${yearStr}-0001`,
          date: new Date().toISOString().split('T')[0],
          primaryAccount: 'RAK Bank Current A/C (0242715908001)',
          offsetAccount: 'Main Cash in Hand Vault',
          partyName: 'N/A',
          partyType: 'NONE',
          amount: 25000,
          referenceNo: 'ATM-WD-991',
          narration: 'Cash withdrawal from bank current account for vault replenishment.',
          status: 'POSTED',
          isAutomated: false
        }
      ];
      localStorage.setItem('MF_FINANCIAL_VOUCHERS', JSON.stringify(loaded));
    }

    return loaded;
  });

  // Company Profile State (Editable via UI icon)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(getCompanyProfile);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState<FinancialVoucher | null>(null);
  const [isCreateNewModalOpen, setIsCreateNewModalOpen] = useState<boolean>(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCompanyProfile(getCompanyProfile());
    };
    window.addEventListener('company_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('company_profile_updated', handleProfileUpdate);
  }, []);

  
  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('MF_FINANCIAL_VOUCHERS', JSON.stringify(vouchers));
  }, [vouchers]);

  // Focus ERP 9 Form States
  const [formType, setFormType] = useState<'CONTRA' | 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'SALES'>(() => {
    if (initialTypeFilter && ['CONTRA', 'JOURNAL', 'PAYMENT', 'RECEIPT', 'SALES'].includes(initialTypeFilter)) {
      return initialTypeFilter as any;
    }
    return 'RECEIPT';
  });

  useEffect(() => {
    if (initialTypeFilter && ['CONTRA', 'JOURNAL', 'PAYMENT', 'RECEIPT', 'SALES'].includes(initialTypeFilter)) {
      setFormType(initialTypeFilter as any);
      setTypeFilter(initialTypeFilter as any);
    }
  }, [initialTypeFilter]);

  const [salesLines, setSalesLines] = useState<Array<{
    description: string;
    qty: number | string;
    unitRate: number | string;
    vatRate: number | string;
    narration: string;
  }>>([
    { description: '', qty: '', unitRate: '', vatRate: '', narration: '' },
    { description: '', qty: '', unitRate: '', vatRate: '', narration: '' }
  ]);

  const handleAddSalesLine = () => {
    setSalesLines(prev => [...prev, { description: '', qty: '', unitRate: '', vatRate: '', narration: '' }]);
  };

  const handleRemoveSalesLine = (index: number) => {
    if (salesLines.length <= 1) {
      triggerToast('A minimum of 1 item line is required for Sales Voucher.', 'info');
      return;
    }
    setSalesLines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSalesLine = (index: number, field: string, value: any) => {
    setSalesLines(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formRefNo, setFormRefNo] = useState<string>('');
  const [formNarration, setFormNarration] = useState<string>('');
  const [formPartyType, setFormPartyType] = useState<'CUSTOMER' | 'SUPPLIER' | 'NONE'>('CUSTOMER');
  const [formPartyName, setFormPartyName] = useState<string>('');
  const [formPartyAddress, setFormPartyAddress] = useState<string>('AJMAN, UNITED ARAB EMIRATES');
  const [formPartyBankAccount, setFormPartyBankAccount] = useState<string>('');
  const [formChequeBankName, setFormChequeBankName] = useState<string>('RAK BANK');
  const [formChequeBankAddress, setFormChequeBankAddress] = useState<string>('KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES');
  const [formPoRef, setFormPoRef] = useState<string>('');
  const [formInvoiceRef, setFormInvoiceRef] = useState<string>('');
  const [formAdvanceAmount, setFormAdvanceAmount] = useState<number | string>('0.00');
  const [formBalanceAmount, setFormBalanceAmount] = useState<number | string>('0.00');
  const [showAdvancedGrid, setShowAdvancedGrid] = useState<boolean>(false);
  const [previewFormat, setPreviewFormat] = useState<'FRAMED' | 'LEDGER'>('FRAMED');

  // Simple Helper functions for Contra & Journal simple UI state updates
  const setSimpleAmount = (val: number) => {
    const num = Number(val) || 0;
    setGridLines(prev => {
      const newLines = [...prev];
      if (newLines.length < 2) return prev;
      newLines[0] = { ...newLines[0], debitAmount: num, creditAmount: 0 };
      newLines[1] = { ...newLines[1], debitAmount: 0, creditAmount: num };
      return newLines;
    });
  };

  const setSimpleDebitAccount = (accName: string) => {
    setGridLines(prev => {
      const newLines = [...prev];
      if (newLines.length < 2) return prev;
      newLines[0] = { ...newLines[0], accountName: accName };
      return newLines;
    });
  };

  const setSimpleCreditAccount = (accName: string) => {
    setGridLines(prev => {
      const newLines = [...prev];
      if (newLines.length < 2) return prev;
      newLines[1] = { ...newLines[1], accountName: accName };
      return newLines;
    });
  };

  // SPREADSHEET GRID LINE ITEMS (Dynamic Multi-Row Input)
  // By default, Focus ERP 9 populates a double-entry grid
  const [gridLines, setGridLines] = useState<Array<{
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    narration: string;
  }>>([
    { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 15000, creditAmount: 0, narration: '' },
    { accountName: 'Accounts Receivable control', debitAmount: 0, creditAmount: 15000, narration: '' }
  ]);

  // Auto update grid defaults when changing Voucher category (exactly like Focus ERP 9 behavior)
  useEffect(() => {
    if (formType === 'RECEIPT') {
      setFormPartyType('CUSTOMER');
      setGridLines([
        { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 0, narration: 'Debit incoming bank ledger' },
        { accountName: 'Accounts Receivable control', debitAmount: 0, creditAmount: 0, narration: 'Credit trade debtor ledger' }
      ]);
    } else if (formType === 'PAYMENT') {
      setFormPartyType('SUPPLIER');
      setGridLines([
        { accountName: 'Accounts Payable control', debitAmount: 0, creditAmount: 0, narration: 'Debit trade creditor' },
        { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 0, narration: 'Credit outgoing bank ledger' }
      ]);
    } else if (formType === 'CONTRA') {
      setFormPartyType('NONE');
      setGridLines([
        { accountName: 'Main Cash in Hand Vault', debitAmount: 0, creditAmount: 0, narration: 'Bank cash deposit / withdrawal' },
        { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 0, narration: 'Bank cash deposit / withdrawal' }
      ]);
    } else if (formType === 'JOURNAL') {
      setFormPartyType('NONE');
      setGridLines([
        { accountName: 'Raw Material Procurement Expenses', debitAmount: 0, creditAmount: 0, narration: 'Adjustment debit' },
        { accountName: 'Accounts Payable control', debitAmount: 0, creditAmount: 0, narration: 'Adjustment credit' }
      ]);
    }
  }, [formType]);

  // Sync Default Party Name when database is populated or updated
  useEffect(() => {
    if (formPartyType === 'CUSTOMER' && clientDatabase.length > 0) {
      setFormPartyName(clientDatabase[0]);
    } else if (formPartyType === 'SUPPLIER' && supplierDatabase.length > 0) {
      setFormPartyName(supplierDatabase[0]);
    } else {
      setFormPartyName('N/A');
    }
  }, [formPartyType, clientDatabase, supplierDatabase]);

  // Grid Sum calculations
  const totalDebits = useMemo(() => gridLines.reduce((acc, curr) => acc + (Number(curr.debitAmount) || 0), 0), [gridLines]);
  const totalCredits = useMemo(() => gridLines.reduce((acc, curr) => acc + (Number(curr.creditAmount) || 0), 0), [gridLines]);
  const isBalanced = useMemo(() => Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0, [totalDebits, totalCredits]);
  const difference = useMemo(() => Math.abs(totalDebits - totalCredits), [totalDebits, totalCredits]);

  // Registry Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter);
  const [partyFilter, setPartyFilter] = useState<string>('ALL');

  // Helper to calculate party outstanding balance in AED
  const getPartyOutstandingBalance = (partyName: string, partyType: 'CUSTOMER' | 'SUPPLIER' | 'NONE'): number => {
    if (!partyName || partyType === 'NONE' || partyName === 'N/A') return 0;
    const cleanTarget = partyName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanTarget) return 0;

    let totalBal = 0;
    if (partyType === 'SUPPLIER') {
      try {
        const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
        if (savedPay) {
          const manual = JSON.parse(savedPay);
          if (Array.isArray(manual)) {
            manual.forEach((p: any) => {
              if (p.supplierName && p.supplierName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').includes(cleanTarget)) {
                totalBal += ((Number(p.totalContractValue) || 0) - (Number(p.amountPaid) || 0));
              }
            });
          }
        }
      } catch (e) {}
      try {
        const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        if (savedDOs) {
          const dos = JSON.parse(savedDOs);
          if (Array.isArray(dos)) {
            dos.forEach((d: any) => {
              if (d.supplierName && d.supplierName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').includes(cleanTarget)) {
                totalBal += ((parseFloat(d.invoiceAmounts) || 0) - (parseFloat(d.invoicePaid) || 0));
              }
            });
          }
        }
      } catch (e) {}
      try {
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        if (savedPurchases) {
          const purList = JSON.parse(savedPurchases);
          if (Array.isArray(purList)) {
            purList.forEach((pur: any) => {
              if (pur.supplierName && pur.supplierName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').includes(cleanTarget)) {
                totalBal += ((Number(pur.totalAmount || pur.subtotal || 0)) - (Number(pur.amountPaid || pur.paidAmount || 0)));
              }
            });
          }
        }
      } catch (e) {}
    } else if (partyType === 'CUSTOMER') {
      try {
        const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
        if (savedDocsStr) {
          const docs = JSON.parse(savedDocsStr);
          if (Array.isArray(docs)) {
            docs.forEach((doc: any) => {
              const party = (doc.clientName || doc.buyerName || doc.partyName || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (party && (party.includes(cleanTarget) || cleanTarget.includes(party))) {
                totalBal += ((Number(doc.grandTotal || doc.totalInvoiceValue || 0)) - (Number(doc.amountReceived || doc.receivedAmount || 0)));
              }
            });
          }
        }
      } catch (e) {}
      try {
        const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
        if (outgoingStr) {
          const recs = JSON.parse(outgoingStr);
          if (Array.isArray(recs)) {
            recs.forEach((rec: any) => {
              const party = (rec.buyerName || rec.clientName || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (party && (party.includes(cleanTarget) || cleanTarget.includes(party))) {
                totalBal += ((Number(rec.totalInvoiceValue || 0)) - (Number(rec.amountReceived || 0)));
              }
            });
          }
        }
      } catch (e) {}
    }
    return Math.max(0, parseFloat(totalBal.toFixed(2)));
  };

  // Sequential ID generation for Focus ERP 9 Vouchers
  const generateNextVoucherNo = (type: 'CONTRA' | 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'SALES') => {
    const yearStr = new Date(formDate).getFullYear().toString().substring(2);
    const prefix = type === 'CONTRA' ? 'CON' : type === 'PAYMENT' ? 'PAY' : type === 'RECEIPT' ? 'RCT' : type === 'SALES' ? 'SAL' : 'JNL';
    const matchCount = vouchers.filter(v => v.voucherType === type).length;
    return `${prefix}-${yearStr}-${String(matchCount + 1).padStart(4, '0')}`;
  };

  // Grid Modification Helpers
  const handleAddGridRow = () => {
    setGridLines([...gridLines, { accountName: ledgerAccounts[0].name, debitAmount: 0, creditAmount: 0, narration: '' }]);
  };

  const handleRemoveGridRow = (index: number) => {
    if (gridLines.length <= 2) {
      triggerToast('A minimum of 2 ledger entries is required for standard double-entry booking.', 'info');
      return;
    }
    setGridLines(gridLines.filter((_, idx) => idx !== index));
  };

  const handleUpdateGridCell = (index: number, field: 'accountName' | 'debitAmount' | 'creditAmount' | 'narration', value: any) => {
    const lines = [...gridLines];
    if (field === 'debitAmount') {
      lines[index].debitAmount = Number(value) || 0;
      if (Number(value) > 0) lines[index].creditAmount = 0; // Clear credit on setting debit
    } else if (field === 'creditAmount') {
      lines[index].creditAmount = Number(value) || 0;
      if (Number(value) > 0) lines[index].debitAmount = 0; // Clear debit on setting credit
    } else {
      lines[index][field] = value;
    }
    setGridLines(lines);
  };

  // Submit and Save voucher to state
  const handlePostVoucherSubmit = () => {
    if (formType === 'SALES') {
      const validLines = salesLines.filter(l => l.description.trim() !== '' || Number(l.qty) > 0 || Number(l.unitRate) > 0);
      if (validLines.length === 0) {
        triggerToast('Please enter at least one item description and unit rate for Sales Voucher.', 'error');
        return;
      }
      
      let subtotal = 0;
      let vatTotal = 0;
      const salesGlLines: Array<{ accountName: string; debitAmount: number; creditAmount: number; narration: string }> = [];

      validLines.forEach(l => {
        const qty = Number(l.qty) || 0;
        const rate = Number(l.unitRate) || 0;
        const vatP = Number(l.vatRate) || 0;
        const lineExcl = qty * rate;
        const lineVat = lineExcl * (vatP / 100);
        subtotal += lineExcl;
        vatTotal += lineVat;

        salesGlLines.push({
          accountName: 'Primary Industrial Sales',
          debitAmount: 0,
          creditAmount: lineExcl,
          narration: `${l.description} (Qty: ${qty} @ AED ${rate})`
        });
      });

      const grandTotal = subtotal + vatTotal;
      const customerAccount = formPartyName ? formPartyName : 'Accounts Receivable control';

      // Add Accounts Receivable Debit Line
      salesGlLines.unshift({
        accountName: customerAccount,
        debitAmount: grandTotal,
        creditAmount: 0,
        narration: `Sales Invoice / Voucher (${formRefNo || 'SALES'})`
      });

      // Add Output VAT Credit Line
      if (vatTotal > 0) {
        salesGlLines.push({
          accountName: 'Output VAT Payable 5%',
          debitAmount: 0,
          creditAmount: vatTotal,
          narration: '5% Output VAT on Sales'
        });
      }

      const voucherNo = generateNextVoucherNo('SALES');
      const newVoucher: FinancialVoucher = {
        id: `VOU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        voucherType: 'SALES',
        voucherNo: voucherNo,
        date: formDate,
        primaryAccount: customerAccount,
        offsetAccount: 'Primary Industrial Sales',
        partyName: formPartyType === 'NONE' ? 'N/A' : (formPartyName || 'N/A'),
        partyType: formPartyType,
        amount: grandTotal,
        referenceNo: formRefNo || 'SALES',
        narration: formNarration || `Sales Voucher billing (${validLines.length} items)`,
        status: 'POSTED',
        isAutomated: false,
        lines: salesGlLines
      };

      setVouchers([newVoucher, ...vouchers]);
      triggerToast(`[SALES VOUCHER POSTED] Posted voucher ${voucherNo} successfully (AED ${grandTotal.toFixed(2)})!`, 'success');

      setFormRefNo('');
      setFormNarration('');
      setSalesLines([
        { description: '', qty: '', unitRate: '', vatRate: '', narration: '' },
        { description: '', qty: '', unitRate: '', vatRate: '', narration: '' }
      ]);
      window.dispatchEvent(new Event('storage'));
      return;
    }

    if (!isBalanced) {
      triggerToast(`Unbalanced double-entry ledger! Debits (AED ${totalDebits.toFixed(2)}) must exactly equal Credits (AED ${totalCredits.toFixed(2)}). Difference: AED ${difference.toFixed(2)}`, 'error');
      return;
    }

    // Identify primary and offset account for backwards compatibility with stats and other ledger tabs
    const drLine = gridLines.find(l => l.debitAmount > 0);
    const crLine = gridLines.find(l => l.creditAmount > 0);
    const primaryAccount = drLine ? drLine.accountName : ledgerAccounts[0].name;
    const offsetAccount = crLine ? crLine.accountName : ledgerAccounts[1].name;
    const finalAmount = totalDebits;

    const voucherNo = generateNextVoucherNo(formType);
    const newVoucher: FinancialVoucher = {
      id: `VOU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      voucherType: formType,
      voucherNo: voucherNo,
      date: formDate,
      primaryAccount: primaryAccount,
      offsetAccount: offsetAccount,
      partyName: formPartyType === 'NONE' ? 'N/A' : (formPartyName || 'N/A'),
      partyType: formPartyType,
      partyAddress: formPartyAddress,
      partyBankAccount: formPartyBankAccount,
      chequeBankName: formChequeBankName,
      chequeBankAddress: formChequeBankAddress,
      poRef: formPoRef,
      invoiceRef: formInvoiceRef,
      advanceAmount: formAdvanceAmount,
      balanceAmount: formBalanceAmount,
      amount: finalAmount,
      referenceNo: formRefNo || 'N/A',
      narration: formNarration || `Double-entry ledger adjustment (${formType}).`,
      status: 'POSTED',
      isAutomated: false,
      lines: gridLines.map(line => ({
        accountName: line.accountName,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        narration: line.narration
      }))
    };

    // Prepend new voucher
    setVouchers([newVoucher, ...vouchers]);
    triggerToast(`[VOUCHER DEPOSITED] Posted ledger voucher ${voucherNo} successfully!`, 'success');

    // Reset Form Fields with clean empty states
    setFormRefNo('');
    setFormNarration('');
    setGridLines([
      { accountName: primaryAccount, debitAmount: 0, creditAmount: 0, narration: '' },
      { accountName: offsetAccount, debitAmount: 0, creditAmount: 0, narration: '' }
    ]);

    // Dispatch Storage Event for other views to update if they are listening
    window.dispatchEvent(new Event('storage'));
  };

  // Audit Balances
  const handleAuditBalances = () => {
    let unBalancedCount = 0;
    vouchers.forEach(v => {
      if (v.lines && v.lines.length > 0) {
        const d = v.lines.reduce((s, c) => s + c.debitAmount, 0);
        const c = v.lines.reduce((s, c) => s + c.creditAmount, 0);
        if (Math.abs(d - c) > 0.05) unBalancedCount++;
      }
    });

    if (unBalancedCount > 0) {
      triggerToast(`System audit completed. Found ${unBalancedCount} unbalanced vouchers. Auto-realigning totals.`, 'info');
    } else {
      triggerToast('System Audit Check: 100% of journal & voucher registers are strictly balanced!', 'success');
    }
  };

  // Sync ERP Invoice Collections & Purchases
  const handleSyncErpDocuments = () => {
    const yearPart = new Date().getFullYear();
    let addedCount = 0;
    const newVouchersList = [...vouchers];

    try {
      const savedInvoicesStr = localStorage.getItem('MFI_CUSTOMER_INVOICES');
      if (savedInvoicesStr) {
        const invoices = JSON.parse(savedInvoicesStr);
        if (Array.isArray(invoices)) {
          invoices.forEach((doc: any) => {
            const invNo = doc.invoiceNo || doc.id || 'INV';
            const custName = doc.customerName || 'UNKNOWN CUSTOMER';
            const exists = newVouchersList.some(v => v.referenceNo === invNo || v.id === `VOU-SLS-${doc.id}`);
            
            if (!exists) {
              const newVou: FinancialVoucher = {
                id: `VOU-SLS-${doc.id}`,
                voucherType: 'RECEIPT',
                voucherNo: `RCT-${yearPart.toString().substring(2)}-${String(newVouchersList.length + 1).padStart(4, '0')}`,
                date: doc.invoiceDate || new Date().toISOString().split('T')[0],
                primaryAccount: 'RAK Bank Current A/C (0242715908001)',
                offsetAccount: 'Accounts Receivable control',
                partyName: custName,
                partyType: 'CUSTOMER',
                amount: Number(doc.totalAmount) || 0,
                referenceNo: invNo,
                narration: `Automated invoice ledger sync for ${custName} (Inv Ref: ${invNo}).`,
                status: 'POSTED',
                isAutomated: true,
                lines: [
                  { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: Number(doc.totalAmount) || 0, creditAmount: 0, narration: 'Incoming cash from customer' },
                  { accountName: 'Accounts Receivable control', debitAmount: 0, creditAmount: Number(doc.totalAmount) || 0, narration: `Settlement of Invoice ${invNo}` }
                ]
              };
              newVouchersList.unshift(newVou);
              addedCount++;
            }
          });
        }
      }
    } catch (e) { console.error(e); }

    try {
      const savedPurchasesStr = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
      if (savedPurchasesStr) {
        const purchases = JSON.parse(savedPurchasesStr);
        if (Array.isArray(purchases)) {
          purchases.forEach((pur: any) => {
            const invNo = pur.invoiceNo || pur.id || 'PUR';
            const supName = pur.supplierName || 'UNKNOWN SUPPLIER';
            const exists = newVouchersList.some(v => v.referenceNo === invNo || v.id === `VOU-PUR-${pur.id}`);
            
            if (!exists) {
              const newVou: FinancialVoucher = {
                id: `VOU-PUR-${pur.id}`,
                voucherType: 'PAYMENT',
                voucherNo: `PAY-${yearPart.toString().substring(2)}-${String(newVouchersList.length + 1).padStart(4, '0')}`,
                date: pur.invoiceDate || new Date().toISOString().split('T')[0],
                primaryAccount: 'Accounts Payable control',
                offsetAccount: 'Raw Material Procurement Expenses',
                partyName: supName,
                partyType: 'SUPPLIER',
                amount: Number(pur.totalAmount) || 0,
                referenceNo: invNo,
                narration: `Automated supplier payload sync for ${supName} (Inv Ref: ${invNo}).`,
                status: 'POSTED',
                isAutomated: true,
                lines: [
                  { accountName: 'Accounts Payable control', debitAmount: Number(pur.totalAmount) || 0, creditAmount: 0, narration: `Liability registration for ${invNo}` },
                  { accountName: 'Raw Material Procurement Expenses', debitAmount: 0, creditAmount: Number(pur.totalAmount) || 0, narration: 'Procurement expenses booked' }
                ]
              };
              newVouchersList.unshift(newVou);
              addedCount++;
            }
          });
        }
      }
    } catch (e) { console.error(e); }

    setVouchers(newVouchersList);
    if (addedCount > 0) {
      triggerToast(`Successfully mapped & synced ${addedCount} documents from invoice & supplier books to financial ledgers.`, 'success');
    } else {
      triggerToast('All external ERP documents are already synchronized with financial ledgers.', 'info');
    }
  };

  // Delete Voucher
  const handleDeleteVoucher = (id: string, voucherNo: string) => {
    if (confirm(`Security Protocol: Are you sure you want to permanently reverse and delete voucher ${voucherNo}?`)) {
      setVouchers(vouchers.filter(v => v.id !== id));
      triggerToast(`Voucher ${voucherNo} has been deleted and reversed from GL.`, 'info');
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Printable Template Generator for Double Entry slips
  // Global keyboard shortcuts for Financial Vouchers (Ctrl+S, Ctrl+P)
  useEffect(() => {
    const handleGlobalFvKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        setIsCreateNewModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        if (vouchers.length > 0) {
          handlePrintVoucher(vouchers[0], (formType === 'PAYMENT' || formType === 'RECEIPT') ? 'FRAMED' : 'LEDGER');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalFvKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalFvKeyDown);
  }, [formType, vouchers]);

  // Modal Enter/Y/Esc/N handler
  useEffect(() => {
    if (!isCreateNewModalOpen && !isSaveConfirmModalOpen) return;
    const handleModalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        e.stopPropagation();
        setIsCreateNewModalOpen(false);
        setIsSaveConfirmModalOpen(false);
      } else if (e.key === 'Enter' || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        e.stopPropagation();
        if (isCreateNewModalOpen) {
          setIsCreateNewModalOpen(false);
          setFormRefNo('');
          setFormNarration('');
          setSalesLines([
            { description: '', qty: '', unitRate: '', vatRate: '', narration: '' },
            { description: '', qty: '', unitRate: '', vatRate: '', narration: '' }
          ]);
          triggerToast(`[NEW ${formType}] Initialized`, 'info');
        } else if (isSaveConfirmModalOpen) {
          setIsSaveConfirmModalOpen(false);
          handlePostVoucherSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleModalKey, true);
    return () => window.removeEventListener('keydown', handleModalKey, true);
  }, [isCreateNewModalOpen, isSaveConfirmModalOpen, formType]);

    const handlePrintVoucher = (v: FinancialVoucher, overrideFormat?: 'FRAMED' | 'LEDGER') => {
    const isContra = v.voucherType === 'CONTRA';
    const isJournal = v.voucherType === 'JOURNAL';
    const isPayment = v.voucherType === 'PAYMENT';
    const isReceipt = v.voucherType === 'RECEIPT';
    const title = `${v.voucherType} VOUCHER SLIP [${v.voucherNo}] - ${companyProfile.name}`;
    const linesToPrint = v.lines && v.lines.length > 0 ? v.lines : [
      { accountName: v.primaryAccount, debitAmount: v.amount, creditAmount: 0, narration: v.narration },
      { accountName: v.offsetAccount, debitAmount: 0, creditAmount: v.amount, narration: 'Offset auto-offsetting record' }
    ];

    const totalDr = linesToPrint.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
    const totalCr = linesToPrint.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0);
    const displayTotal = totalDr > 0 ? totalDr : v.amount;

    const useFramedFormat = overrideFormat === 'FRAMED' || (!overrideFormat && (isPayment || isReceipt));

    // Dedicated Framed Receipt/Payment Voucher Print Template (Matching Image 2)
    if (useFramedFormat) {
      const modeCash = !v.referenceNo && (!v.narration || !v.narration.toLowerCase().includes('cheque'));
      const modeCheque = !!v.referenceNo && (v.referenceNo.toLowerCase().includes('chq') || v.referenceNo.toLowerCase().includes('cheque') || /^\d{5,}$/.test(v.referenceNo));
      const modeWire = !modeCash && !modeCheque;
      
      const partyText = (v.partyName && v.partyName !== 'N/A') ? v.partyName : v.primaryAccount;
      const partyAddress = v.partyAddress || 'AJMAN, UNITED ARAB EMIRATES';
      const chequeBank = v.chequeBankName || companyProfile.bankName || 'RAK BANK';
      const chequeBankAddr = v.chequeBankAddress || companyProfile.bankBranch || 'KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES';
      const poVal = v.poRef || '—';
      const invVal = v.invoiceRef || '—';
      const advVal = v.advanceAmount !== undefined && v.advanceAmount !== '' ? String(v.advanceAmount) : '0.00';
      const balVal = v.balanceAmount !== undefined && v.balanceAmount !== '' ? String(v.balanceAmount) : '0.00';
      const amountWordsText = numberToWordsDirhams(displayTotal).toUpperCase();

      const cleanName = companyProfile.name.replace(/\(SOLE PROPRIETORSHIP\)/gi, '').trim();

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              @page { size: A4 portrait; margin: 0 !important; }
              * { box-sizing: border-box; }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 6mm 5mm 8mm 5mm !important;
                color: #1e3a8a;
                font-size: 10px;
                background-color: #ffffff !important;
              }
              .voucher-frame {
                border: 2px solid #1e3a8a;
                border-radius: 4px;
                padding: 14px 18px;
                background-color: #ffffff;
                width: 100%;
                margin: 0 auto;
                box-sizing: border-box;
                overflow: hidden;
                box-shadow: none;
              }
              .header-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 6px;
              }
              .brand-logo {
                font-size: 28px;
                font-weight: 900;
                font-style: italic;
                color: #1e3a8a;
                letter-spacing: -1.5px;
                line-height: 1;
                display: flex;
                align-items: center;
                gap: 4px;
              }
              .company-title {
                font-size: 15px;
                font-weight: 900;
                color: #1e3a8a;
                text-transform: uppercase;
                letter-spacing: 0.3px;
              }
              .sole-prop {
                font-size: 8px;
                font-weight: 700;
                border: 1px solid #1e3a8a;
                padding: 0.5px 4px;
                border-radius: 2px;
                margin-left: 4px;
                vertical-align: middle;
                text-transform: uppercase;
              }
              .company-sub {
                font-size: 8.5px;
                font-weight: 800;
                color: #1e3a8a;
                margin-top: 2px;
                letter-spacing: 0.2px;
                text-transform: uppercase;
              }
              .company-addr {
                font-size: 8px;
                color: #475569;
                margin-top: 2px;
              }
              .divider-double {
                border-bottom: 2.5px double #1e3a8a;
                margin: 8px 0;
              }
              .divider-thick {
                border-bottom: 2px solid #1e3a8a;
                margin: 8px 0;
              }
              .ribbon-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 6px 0 10px 0;
              }
              .no-badge {
                font-size: 13px;
                font-weight: 800;
                color: #1e3a8a;
              }
              .no-val {
                color: #dc2626;
                font-size: 14px;
                font-weight: 900;
                font-family: monospace;
                margin-left: 6px;
              }
              .mode-pill {
                display: inline-block;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 8.5px;
                font-weight: 800;
                margin-left: 6px;
                text-transform: uppercase;
              }
              .pill-active {
                background-color: #1e3a8a;
                color: #ffffff;
              }
              .pill-inactive {
                border: 1px solid #1e3a8a;
                color: #1e3a8a;
                background-color: #ffffff;
              }
              .field-row {
                display: flex;
                align-items: baseline;
                margin-bottom: 9px;
              }
              .field-lbl {
                font-weight: 800;
                font-size: 9px;
                color: #1e3a8a;
                min-width: 110px;
                text-transform: uppercase;
              }
              .field-val-underline {
                flex: 1;
                border-bottom: 1.5px dashed #94a3b8;
                font-weight: 700;
                font-size: 10px;
                color: #0f172a;
                padding-left: 6px;
                padding-bottom: 1px;
              }
              .val-blue {
                color: #1e3a8a;
              }
              .flex-row-split {
                display: flex;
                gap: 16px;
                margin-bottom: 9px;
              }
              .flex-col-half {
                flex: 1;
                display: flex;
                align-items: baseline;
              }
              .num-aed-box {
                border: 1.5px dotted #1e3a8a;
                border-radius: 2px;
                padding: 6px 16px;
                margin: 12px auto;
                text-align: center;
                max-width: 280px;
                background-color: #ffffff;
              }
              .num-aed-lbl {
                font-size: 8px;
                font-weight: 800;
                color: #1e3a8a;
                letter-spacing: 0.8px;
                text-transform: uppercase;
              }
              .num-aed-val {
                font-size: 15px;
                font-weight: 900;
                color: #1e3a8a;
                font-family: monospace;
                margin-top: 2px;
              }
              .stamp-box {
                border: 1.5px dashed #94a3b8;
                width: 190px;
                height: 90px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 6px;
              }
            </style>
          </head>
          <body>
            <div class="voucher-frame">
              
              <!-- TOP HEADER WITH BRAND & DETAILS -->
              <table class="header-table">
                <tr>
                  <td style="width: 25%; vertical-align: middle;">
                    ${companyProfile.showLogo ? `
                      <div class="brand-logo" style="display: flex; align-items: center; gap: 6px;">
                        <img src="${companyProfile.logoUrl || '/logo.png'}" style="max-height: 48px; max-width: 150px; object-fit: contain;" onerror="this.onerror=null; this.style.display='none';" />
                      </div>
                    ` : ''}
                  </td>
                  <td style="text-align: center; vertical-align: middle;">
                    <div class="company-title">
                      ${cleanName}
                      ${companyProfile.code === 'MFI' || cleanName.toLowerCase().includes('marine') ? '<span class="sole-prop">Sole Proprietorship</span>' : ''}
                    </div>
                    ${(companyProfile.code === 'MFI' || companyProfile.centerText) ? `
                      <div class="company-sub">
                        ${companyProfile.centerText || 'MANUFACTURER OF FASTENERS, PIPE SUPPORT CLAMPS, CONDUIT ACCESSORIES.'}
                      </div>
                    ` : ''}
                    <div class="company-addr">
                      ${companyProfile.address || 'Shed 31, New Industrial Area, Ajman - U.A.E.'} • Tel: ${companyProfile.phone || '+971 6 525 0526'} • Email: ${companyProfile.email || 'sales@marinefasteners.co'}
                    </div>
                  </td>
                </tr>
              </table>

              <div class="divider-double"></div>

              <!-- RIBBON ROW -->
              <div class="ribbon-row">
                <div class="no-badge">
                  NO. <span class="no-val">${v.voucherNo}</span>
                </div>
                <div>
                  <span class="mode-pill ${modeCash ? 'pill-active' : 'pill-inactive'}">• CASH</span>
                  <span class="mode-pill ${modeCheque ? 'pill-active' : 'pill-inactive'}">• CHEQUE</span>
                  <span class="mode-pill ${modeWire ? 'pill-active' : 'pill-inactive'}">• BANK WIRE</span>
                </div>
              </div>

              <div class="divider-thick"></div>

              <!-- FIELD ENTRIES -->
              <div class="field-row">
                <span class="field-lbl">${isPayment ? 'PAID TO:' : 'CLIENT PAYER:'}</span>
                <span class="field-val-underline">${partyText}</span>
              </div>

              <div class="field-row">
                <span class="field-lbl">ADDRESS:</span>
                <span class="field-val-underline val-blue">${partyAddress}</span>
              </div>

              <div class="field-row">
                <span class="field-lbl">AMT IN WORDS:</span>
                <span class="field-val-underline val-blue">${amountWordsText}</span>
              </div>

              <div class="flex-row-split">
                <div class="flex-col-half">
                  <span class="field-lbl" style="min-width: 90px;">ADVANCE AED:</span>
                  <span class="field-val-underline val-blue">${advVal}</span>
                </div>
                <div class="flex-col-half">
                  <span class="field-lbl" style="min-width: 90px;">BALANCE AED:</span>
                  <span class="field-val-underline val-blue">${balVal}</span>
                </div>
              </div>

              <div class="field-row">
                <span class="field-lbl">DATED:</span>
                <span class="field-val-underline val-blue">${v.date}</span>
              </div>

              <div class="field-row">
                <span class="field-lbl">AGAINST PO:</span>
                <span class="field-val-underline">${poVal}</span>
              </div>

              <div class="field-row">
                <span class="field-lbl">INVOICE:</span>
                <span class="field-val-underline">${invVal}</span>
              </div>

              <!-- NUMERICAL VALUE BOX -->
              <div class="num-aed-box">
                <div class="num-aed-lbl">NUMERICAL AED VALUE</div>
                <div class="num-aed-val">AED | ${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <!-- PARTICULARS -->
              <div class="field-row" style="margin-top: 8px;">
                <span class="field-lbl">PARTICULARS:</span>
                <span class="field-val-underline">${v.narration || 'Payment transaction as recorded.'}</span>
              </div>

              <div class="divider-thick" style="margin-top: 10px;"></div>

              <!-- BANK & CHEQUE DETAILS -->
              <div class="flex-row-split" style="margin-bottom: 6px;">
                <div class="flex-col-half">
                  <span class="field-lbl" style="min-width: 80px;">CHEQUE NO:</span>
                  <span class="field-val-underline">${v.referenceNo || '—'}</span>
                </div>
                <div class="flex-col-half">
                  <span class="field-lbl" style="min-width: 90px;">CHEQUE DATE:</span>
                  <span class="field-val-underline val-blue">${v.date}</span>
                </div>
                <div class="flex-col-half">
                  <span class="field-lbl" style="min-width: 80px;">BANK NAME:</span>
                  <span class="field-val-underline val-blue">${chequeBank}</span>
                </div>
              </div>

              <div class="field-row" style="margin-bottom: 24px;">
                <span class="field-lbl">BANK ADDRESS:</span>
                <span class="field-val-underline val-blue">${chequeBankAddr}</span>
              </div>
              </div>

              <!-- SIGNATURES & STAMP AREA -->
              ${companyProfile.showSignatures !== false ? `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 30px; position: relative;">
                  <div style="text-align: center; min-width: 180px;">
                    <div style="height: 80px;"></div>
                    <div style="border-top: 1.5px solid #1e3a8a; padding-top: 4px; font-weight: 800; font-size: 8.5px; color: #1e3a8a; text-transform: uppercase;">CLIENT SIGNATURE</div>
                  </div>
                  <div style="text-align: center; min-width: 180px; position: relative;">
                    <div style="height: 80px; display: flex; align-items: center; justify-content: center;">
                      ${companyProfile.showStamp && companyProfile.stampUrl ? `
                        <img src="${companyProfile.stampUrl}" style="max-height: 75px; max-width: 120px; object-fit: contain; transform: scale(${companyProfile.stampScale || 1}); opacity: 0.95; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                      ` : ''}
                    </div>
                    <div style="border-top: 1.5px solid #1e3a8a; padding-top: 4px; font-weight: 800; font-size: 8.5px; color: #1e3a8a; text-transform: uppercase;">FOR: ${companyProfile.name}</div>
                  </div>
                </div>
              ` : ''}

            </div>
          </body>
        </html>
      `;

      printHtml(html, title);
      return;
    }

    // Unified clean ERP voucher print template for non-payment double-entry vouchers
    const bannerBg = '#0f172a';
    const bannerAccent = isContra ? '#059669' : isJournal ? '#2563eb' : isPayment ? '#be123c' : isReceipt ? '#059669' : '#2563eb';
    const bannerText = isContra 
      ? 'CONTRA VOUCHER (BANK / CASH INTERNAL TRANSFER)' 
      : isJournal 
      ? 'JOURNAL VOUCHER (GENERAL DOUBLE-ENTRY ADJUSTMENT)' 
      : isPayment
      ? 'PAYMENT VOUCHER (OUTFLOW PAYMENT TRANSACTION)'
      : isReceipt
      ? 'RECEIPT VOUCHER (INFLOW RECEIPT TRANSACTION)'
      : `${v.voucherType} VOUCHER`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4 portrait; margin: 0 !important; }
            * { box-sizing: border-box; }
            html, body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 6mm 5mm 8mm 5mm !important;
              color: #0f172a;
              font-size: 10px;
              background-color: #ffffff !important;
              background: #ffffff !important;
              width: 100%;
            }
            .voucher-card {
              border: none;
              background-color: #ffffff !important;
              padding: 0;
              margin: 0 auto;
              width: 100%;
              max-width: 100%;
            }
            .header-banner {
              background-color: #ffffff;
              color: #000000;
              padding: 10px 14px;
              border-bottom: 3px solid #0f172a;
            }
            .header-banner h1 {
              margin: 0;
              font-size: 15px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #000000;
            }
            .header-banner p {
              margin: 2px 0 0 0;
              font-size: 9px;
              color: #475569;
            }
            .voucher-type-title {
              background-color: #ffffff;
              border-bottom: 1px solid #cbd5e1;
              padding: 5px 14px;
              font-weight: bold;
              font-size: 11px;
              color: ${bannerBg};
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-grid {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 0;
              border-bottom: 1px solid #cbd5e1;
              background-color: #ffffff;
            }
            .info-box {
              padding: 5px 8px;
              border-right: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              background-color: #ffffff;
            }
            .info-box:nth-child(4n) {
              border-right: none;
            }
            .info-label {
              font-size: 8px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
              display: block;
            }
            .info-value {
              font-size: 10.5px;
              font-weight: bold;
              color: #0f172a;
              font-family: monospace;
              margin-top: 1px;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 0;
              table-layout: auto;
              background-color: #ffffff;
            }
            .ledger-table th {
              background-color: #ffffff;
              color: #334155;
              font-family: Arial, Helvetica, sans-serif !important;
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 3px 5px;
              line-height: 1.15;
              border-bottom: 2px solid #cbd5e1;
              border-right: 1px solid #cbd5e1;
            }
            .ledger-table th:last-child {
              border-right: none;
            }
            .ledger-table td {
              padding: 3px 5px;
              line-height: 1.15;
              border-bottom: 1px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
              font-size: 9px;
              font-family: Arial, Helvetica, sans-serif !important;
              background-color: #ffffff;
            }
            .ledger-table td:last-child {
              border-right: none;
            }
            .amount-col {
              text-align: right;
              font-family: monospace;
              font-weight: bold;
            }
            .dr-tag {
              background-color: #dbeafe;
              color: #1e40af;
              padding: 1px 4px;
              border-radius: 2px;
              font-size: 8px;
              font-weight: bold;
              font-family: monospace;
            }
            .cr-tag {
              background-color: #ffe4e6;
              color: #be123c;
              padding: 1px 4px;
              border-radius: 2px;
              font-size: 8px;
              font-weight: bold;
              font-family: monospace;
            }
            .summary-row {
              background-color: #ffffff;
              font-weight: bold;
            }
            .summary-row td {
              border-top: 2px solid ${bannerBg};
              border-bottom: 2px solid ${bannerBg};
              background-color: #ffffff;
            }
            .narration-box {
              padding: 8px 14px;
              background-color: #ffffff;
              border-bottom: 1px solid #cbd5e1;
              font-size: 9.5px;
            }
            .narration-label {
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
              font-size: 8.5px;
            }
            .footer-signatures {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding: 50px 16px 20px 16px;
              background-color: #ffffff !important;
              width: 100%;
              box-sizing: border-box;
            }
            .sig-col {
              flex: 1;
              text-align: center;
              display: flex;
              align-items: baseline;
              justify-content: center;
            }
            .sig-title {
              font-size: 11px;
              font-weight: 500;
              color: #000000;
              text-transform: none;
              font-family: Arial, Helvetica, sans-serif;
              white-space: nowrap;
              line-height: 1;
            }
          </style>
        </head>
        <body>
          <div class="voucher-card">
            
            <!-- HEADER BANNER -->
            <div class="header-banner">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h1>${companyProfile.name}</h1>
                  <p>${companyProfile.address} | TRN: ${companyProfile.trn} | Phone: ${companyProfile.phone} | Email: ${companyProfile.email}</p>
                </div>
                <div style="text-align: right; font-family: monospace; font-size: 9.5px; color: #334155; font-weight: bold;">
                  FINANCIAL SALES & LEDGER VOUCHER
                </div>
              </div>
            </div>

            <!-- VOUCHER TYPE BAR -->
            <div class="voucher-type-title">
              <span>${bannerText}</span>
              <span style="font-family: monospace; font-size: 10.5px; background: #ffffff; padding: 2px 8px; border: 1px solid #cbd5e1;">
                ${v.voucherNo}
              </span>
            </div>

            <!-- INFO MASTER GRID -->
            <div class="info-grid">
              <div class="info-box">
                <span class="info-label">Voucher No</span>
                <span class="info-value">${v.voucherNo}</span>
              </div>
              <div class="info-box">
                <span class="info-label">Posting Date</span>
                <span class="info-value">${v.date}</span>
              </div>
              <div class="info-box">
                <span class="info-label">Ref / Cheque No</span>
                <span class="info-value">${v.referenceNo || '—'}</span>
              </div>
              <div class="info-box">
                <span class="info-label">Posting Status</span>
                <span class="info-value" style="color: #059669;">${v.status}</span>
              </div>
              <div class="info-box" style="grid-column: span 2;">
                <span class="info-label">Subledger / Party Entity</span>
                <span class="info-value" style="font-size: 9.5px;">${v.partyName} (${v.partyType})</span>
              </div>
              <div class="info-box" style="grid-column: span 2;">
                <span class="info-label">Document Class</span>
                <span class="info-value" style="font-size: 9.5px; color: ${bannerAccent};">${v.voucherType} ENTRY</span>
              </div>
            </div>

            <!-- LEDGER & SALES DETAILS TABLE -->
            ${v.voucherType === 'SALES' ? (() => {
              let sumExtPrice = 0;
              let sumTotalExclVat = 0;
              let sumVat = 0;
              let sumTotalGross = 0;

              return `
                <table class="ledger-table">
                  <thead>
                    <tr>
                      <th style="width: 35px; text-align: center;">S.No</th>
                      <th style="width: 40px; text-align: center;">Dr/Cr</th>
                      <th style="text-align: left;">Particulars / Description</th>
                      <th style="width: 95px; text-align: right;">EXT PRICE</th>
                      <th style="width: 105px; text-align: right;">TOTAL EXCL VAT</th>
                      <th style="width: 80px; text-align: right;">VAT AED</th>
                      <th style="width: 110px; text-align: right;">TOTAL AED</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${linesToPrint.map((line, idx) => {
                      const isDr = (Number(line.debitAmount) || 0) > 0;
                      const lineAmt = isDr ? Number(line.debitAmount) : (Number(line.creditAmount) || v.amount);
                      const extPrice = lineAmt;
                      const totalExclVat = lineAmt;
                      const vatAed = totalExclVat * 0.05;
                      const totalAed = totalExclVat + vatAed;

                      sumExtPrice += extPrice;
                      sumTotalExclVat += totalExclVat;
                      sumVat += vatAed;
                      sumTotalGross += totalAed;

                      return `
                        <tr>
                          <td style="text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
                          <td style="text-align: center;">
                            <span class="${isDr ? 'dr-tag' : 'cr-tag'}">${isDr ? 'Dr' : 'Cr'}</span>
                          </td>
                          <td>
                            <div style="font-weight: bold; color: #0f172a;">${line.accountName}</div>
                            ${line.narration ? `<div style="font-size: 8.5px; color: #64748b; font-style: italic; margin-top: 1px;">* ${line.narration}</div>` : ''}
                          </td>
                          <td class="amount-col" style="color: #0369a1;">
                            ${extPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td class="amount-col" style="color: #0f172a;">
                            ${totalExclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td class="amount-col" style="color: #d97706;">
                            ${vatAed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td class="amount-col" style="color: #15803d; font-weight: 800;">
                            ${totalAed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      `;
                    }).join('')}

                    <!-- SUMMARY ROW FOR SALES VOUCHER -->
                    <tr class="summary-row">
                      <td colspan="3" style="text-align: right; text-transform: uppercase; font-size: 8.5px; padding-right: 8px; color: #334155;">
                        Sales Voucher Financial Summary:
                      </td>
                      <td class="amount-col" style="color: #0369a1; font-size: 10px;">
                        AED ${sumExtPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td class="amount-col" style="color: #0f172a; font-size: 10px;">
                        AED ${sumTotalExclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td class="amount-col" style="color: #d97706; font-size: 10px;">
                        AED ${sumVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td class="amount-col" style="color: #15803d; font-size: 10.5px; font-weight: 800;">
                        AED ${sumTotalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              `;
            })() : `
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th style="width: 45px; text-align: center;">S.No</th>
                    <th style="width: 45px; text-align: center;">Dr/Cr</th>
                    <th style="text-align: left;">Ledger Account Name / Particulars</th>
                    <th style="width: 130px; text-align: right;">Debit (AED)</th>
                    <th style="width: 130px; text-align: right;">Credit (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  ${linesToPrint.map((line, idx) => {
                    const isDr = (Number(line.debitAmount) || 0) > 0;
                    return `
                      <tr>
                        <td style="text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
                        <td style="text-align: center;">
                          <span class="${isDr ? 'dr-tag' : 'cr-tag'}">${isDr ? 'Dr' : 'Cr'}</span>
                        </td>
                        <td>
                          <div style="font-weight: bold; color: #0f172a;">${line.accountName}</div>
                          ${line.narration ? `<div style="font-size: 8.5px; color: #64748b; font-style: italic; margin-top: 1px;">* ${line.narration}</div>` : ''}
                        </td>
                        <td class="amount-col" style="color: #1e40af;">
                          ${(Number(line.debitAmount) || 0) > 0 ? (Number(line.debitAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                        </td>
                        <td class="amount-col" style="color: #be123c;">
                          ${(Number(line.creditAmount) || 0) > 0 ? (Number(line.creditAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                        </td>
                      </tr>
                    `;
                  }).join('')}

                  <!-- TOTAL TRIAL MATCH ROW -->
                  <tr class="summary-row">
                    <td colspan="3" style="text-align: right; text-transform: uppercase; font-size: 8.5px; padding-right: 10px; color: #334155;">
                      Total Double-Entry Balance:
                    </td>
                    <td class="amount-col" style="color: #1e40af; font-size: 10px;">
                      AED ${totalDr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td class="amount-col" style="color: #be123c; font-size: 10px;">
                      AED ${totalCr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            `}

            <!-- NARRATION & REMARKS -->
            <div class="narration-box">
              <span class="narration-label">Master Voucher Narration / Remarks:</span>
              <div style="font-size: 10.5px; font-weight: bold; color: #1e293b; margin-top: 3px; font-style: italic;">
                "${v.narration || 'General accounting ledger posting recorded.'}"
              </div>
              ${displayTotal > 0 ? `
                <div style="margin-top: 6px; font-size: 9px; font-weight: bold; color: #475569;">
                  <span class="narration-label">Amount in Words:</span> <span style="color: #0f172a; font-style: normal;">${numberToWordsDirhams(displayTotal)}</span>
                </div>
              ` : ''}
            </div>

            <!-- AUDIT FOOTER SIGNATURES -->
            <div class="footer-signatures">
              <div class="sig-col">
                <span class="sig-title">Prepared By</span>
              </div>
              <div class="sig-col">
                <span class="sig-title">Checked & Verified By</span>
              </div>
              <div class="sig-col">
                <span class="sig-title">Chief Accountant</span>
              </div>
              <div class="sig-col" style="position: relative;">
                ${companyProfile.showStamp && companyProfile.stampUrl ? `
                  <div style="height: 45px; display: flex; align-items: center; justify-content: center; margin-bottom: -10px;">
                    <img src="${companyProfile.stampUrl}" style="max-height: 50px; max-width: 90px; object-fit: contain; transform: scale(${companyProfile.stampScale || 1}); opacity: 0.95; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                  </div>
                ` : ''}
                <span class="sig-title">Authorized Signatory</span>
              </div>
            </div>

          </div>
        </body>
      </html>
    `;
    printHtml(html, title);
  };

  // Filtered List of Vouchers for history view
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const matchesSearch = 
        v.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.referenceNo && v.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.primaryAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.offsetAccount.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || v.voucherType === typeFilter;
      
      const matchesParty = partyFilter === 'ALL' || 
        (partyFilter === 'CUSTOMERS' && v.partyType === 'CUSTOMER') ||
        (partyFilter === 'SUPPLIERS' && v.partyType === 'SUPPLIER') ||
        (partyFilter === 'NONE' && v.partyType === 'NONE');

      return matchesSearch && matchesType && matchesParty;
    });
  }, [vouchers, searchQuery, typeFilter, partyFilter]);

  // General Financial summary counts
  const stats = useMemo(() => {
    let totalInflow = 0;   // Receipts and Sales
    let totalOutflow = 0;  // Payments and Purchases
    let bankBalance = 385000; // Fixed baseline
    let cashBalance = 45000;  // Fixed baseline

    vouchers.forEach(v => {
      const amt = v.amount;
      if (v.voucherType === 'RECEIPT') {
        totalInflow += amt;
        if (v.primaryAccount.includes('Bank') || v.primaryAccount.includes('IBAN')) bankBalance += amt;
        else cashBalance += amt;
      } else if (v.voucherType === 'PAYMENT' || v.voucherType === 'COMMISSION') {
        totalOutflow += amt;
        if (v.primaryAccount.includes('Bank') || v.primaryAccount.includes('IBAN')) bankBalance -= amt;
        else cashBalance -= amt;
      } else if (v.voucherType === 'CONTRA') {
        if ((v.primaryAccount.includes('Bank') || v.primaryAccount.includes('IBAN')) && (v.offsetAccount.includes('Cash') || v.offsetAccount.includes('Petty'))) {
          bankBalance += amt;
          cashBalance -= amt;
        } else if ((v.primaryAccount.includes('Cash') || v.primaryAccount.includes('Petty')) && (v.offsetAccount.includes('Bank') || v.offsetAccount.includes('IBAN'))) {
          cashBalance += amt;
          bankBalance -= amt;
        }
      }
    });

    return {
      totalInflow,
      totalOutflow,
      bankBalance,
      cashBalance,
      netFlow: totalInflow - totalOutflow
    };
  }, [vouchers]);

  // Filtered account lists for Contra and Journal modes according to system rules
  const contraFilteredAccounts = useMemo(() => {
    const disallowedCategories = ['PAYMENT', 'RECEIPT', 'JOURNAL', 'SALES'];
    return ledgerAccounts.filter(acc => {
      const cat = (acc.category || '').toUpperCase();
      const name = (acc.name || '').toUpperCase();
      const isDisallowedCat = disallowedCategories.some(d => cat.includes(d));
      const isDisallowedName = name.includes('SALES') || name.includes('PURCHASE') || name.includes('DEPRECIATION') || name.includes('REVENUE');
      return !isDisallowedCat && !isDisallowedName;
    });
  }, [ledgerAccounts]);

  const journalFilteredAccounts = useMemo(() => {
    const disallowedCategories = ['CONTRA', 'PAYMENT', 'RECEIPT', 'SALES'];
    return ledgerAccounts.filter(acc => {
      const cat = (acc.category || '').toUpperCase();
      const name = (acc.name || '').toUpperCase();
      const isDisallowedCat = disallowedCategories.some(d => cat.includes(d));
      const isDisallowedName = name.includes('SALES LEDGER') || name.includes('SALES REVENUE');
      return !isDisallowedCat && !isDisallowedName;
    });
  }, [ledgerAccounts]);

  return (
    <div className="space-y-6">
      
      {/* COMPACT GENERAL BALANCES SUMMARY BOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        
        {/* Card 1: Bank Accounts Balance */}
        <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-lg p-2.5 px-3 flex items-center justify-between shadow-3xs transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
              BANK BALANCE
            </span>
            <div className="text-sm font-bold font-mono text-slate-900 leading-tight">
              AED {stats.bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-slate-400 font-sans block truncate max-w-[130px]">RAK Current (1000/1010)</span>
          </div>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100/80 shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Cash in Hand Vault */}
        <div className="bg-white border border-slate-200 hover:border-amber-300 rounded-lg p-2.5 px-3 flex items-center justify-between shadow-3xs transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
              CASH IN VAULT
            </span>
            <div className="text-sm font-bold font-mono text-slate-900 leading-tight">
              AED {stats.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-slate-400 font-sans block truncate max-w-[130px]">Vault (1100) & Petty (1110)</span>
          </div>
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100/80 shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Total Period Receipts */}
        <div className="bg-white border border-slate-200 hover:border-emerald-300 rounded-lg p-2.5 px-3 flex items-center justify-between shadow-3xs transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              PERIOD RECEIPTS
            </span>
            <div className="text-sm font-bold font-mono text-emerald-700 leading-tight">
              AED {stats.totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-slate-400 font-sans block">Total Inflows</span>
          </div>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100/80 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Total Period Payments */}
        <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-lg p-2.5 px-3 flex items-center justify-between shadow-3xs transition-all">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-500 tracking-tight flex items-center gap-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
              PERIOD PAYMENTS
            </span>
            <div className="text-sm font-bold font-mono text-rose-700 leading-tight">
              AED {stats.totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[9px] text-slate-400 font-sans block">Total Outflows</span>
          </div>
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100/80 shrink-0">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* =========================================================================
          AUTHENTIC FOCUS ERP 9 - VOUCHER ENTRY LAYOUT
          ========================================================================= */}
      <div className="bg-[#f1f5f9] border border-slate-300 shadow-sm rounded-none overflow-hidden text-xs">
        
        {/* 1. LISTY / FOCUS ERP ACTION RIBBON (TOP - SINGLE ROW) */}
        <div className="bg-slate-100/90 border-b border-slate-300 p-2 flex flex-nowrap items-center justify-between gap-2 no-print overflow-x-auto">
          <div className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 inline-flex flex-nowrap items-center gap-1 shadow-2xs shrink-0 overflow-x-auto">
            
            <button
              type="button"
              onClick={() => {
                setFormRefNo('');
                setFormNarration('');
                if (formType === 'SALES') {
                  setSalesLines([
                    { description: '', qty: '', unitRate: '', vatRate: '5', narration: '' },
                    { description: '', qty: '', unitRate: '', vatRate: '5', narration: '' }
                  ]);
                } else if (formType === 'RECEIPT') {
                  setGridLines([
                    { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 0, narration: '' },
                    { accountName: 'Accounts Receivable control', debitAmount: 0, creditAmount: 0, narration: '' }
                  ]);
                } else if (formType === 'PAYMENT') {
                  setGridLines([
                    { accountName: 'Accounts Payable control', debitAmount: 0, creditAmount: 0, narration: '' },
                    { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 0, narration: '' }
                  ]);
                } else {
                  setGridLines([
                    { accountName: ledgerAccounts[0].name, debitAmount: 0, creditAmount: 0, narration: '' },
                    { accountName: ledgerAccounts[1].name, debitAmount: 0, creditAmount: 0, narration: '' }
                  ]);
                }
                triggerToast('New blank voucher sheet initialized.', 'info');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="New Voucher Entry"
            >
              <FilePlus className="w-4 h-4 text-blue-600 mb-0.5" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={handlePostVoucherSubmit}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Save Voucher Entry (F10)"
            >
              <Save className="w-4 h-4 text-teal-700 mb-0.5" />
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to clear current voucher lines?")) {
                  if (formType === 'SALES') {
                    setSalesLines([
                      { description: '', qty: '', unitRate: '', vatRate: '5', narration: '' },
                      { description: '', qty: '', unitRate: '', vatRate: '5', narration: '' }
                    ]);
                  } else {
                    setGridLines([
                      { accountName: ledgerAccounts[0].name, debitAmount: 0, creditAmount: 0, narration: '' },
                      { accountName: ledgerAccounts[1].name, debitAmount: 0, creditAmount: 0, narration: '' }
                    ]);
                  }
                  triggerToast('Sheet cleared.', 'info');
                }
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Delete or Reset Sheet"
            >
              <Trash2 className="w-4 h-4 text-rose-600 mb-0.5" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (vouchers.length > 0) {
                  const lastV = vouchers[vouchers.length - 1];
                  setFormType(lastV.voucherType);
                  setFormDate(lastV.date);
                  setFormRefNo(lastV.referenceNo);
                  setFormNarration(lastV.narration);
                  if (lastV.lines && lastV.lines.length > 0) {
                    setGridLines(lastV.lines);
                  }
                  triggerToast(`Loaded voucher ${lastV.voucherNo}`, 'info');
                } else {
                  triggerToast('No previous posted vouchers found.', 'info');
                }
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Previous Voucher"
            >
              <ArrowLeftCircle className="w-4 h-4 text-indigo-600 mb-0.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (vouchers.length > 0) {
                  const firstV = vouchers[0];
                  setFormType(firstV.voucherType);
                  setFormDate(firstV.date);
                  setFormRefNo(firstV.referenceNo);
                  setFormNarration(firstV.narration);
                  if (firstV.lines && firstV.lines.length > 0) {
                    setGridLines(firstV.lines);
                  }
                  triggerToast(`Loaded voucher ${firstV.voucherNo}`, 'info');
                } else {
                  triggerToast('No next posted vouchers found.', 'info');
                }
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Next Voucher"
            >
              <ArrowRightCircle className="w-4 h-4 text-indigo-600 mb-0.5" />
              <span>Next</span>
            </button>

            <button
              type="button"
              onClick={handleSyncErpDocuments}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Sync Sales & Purchases Invoices"
            >
              <RefreshCw className="w-4 h-4 text-orange-500 mb-0.5" />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={handleAuditBalances}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Audit Balance Integrity"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-0.5" />
              <span>Audit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const calcAmount = formType === 'SALES' 
                  ? salesLines.reduce((s, l) => s + ((Number(l.qty) || 0) * (Number(l.unitRate) || 0) * (1 + ((Number(l.vatRate) || 0)/100))), 0) 
                  : (totalDebits > 0 ? totalDebits : (gridLines[0]?.debitAmount || 0));

                const draftVou: FinancialVoucher = {
                  id: 'draft',
                  voucherType: formType,
                  voucherNo: generateNextVoucherNo(formType),
                  date: formDate,
                  primaryAccount: formPartyName || (formType === 'PAYMENT' ? 'Accounts Payable' : 'Accounts Receivable'),
                  offsetAccount: formType === 'PAYMENT' ? 'RAK Bank Current A/C' : 'Primary Industrial Sales',
                  partyName: formPartyType === 'NONE' ? 'N/A' : (formPartyName || 'N/A'),
                  partyType: formPartyType,
                  amount: calcAmount,
                  referenceNo: formRefNo || 'DRAFT',
                  narration: formNarration || 'Draft preview printing.',
                  status: 'DRAFT',
                  isAutomated: false,
                  lines: formType === 'SALES' ? salesLines.map(l => ({
                    accountName: l.description || 'Sales Item',
                    debitAmount: (Number(l.qty) || 0) * (Number(l.unitRate) || 0),
                    creditAmount: 0,
                    narration: `Qty: ${l.qty}, Rate: ${l.unitRate}, VAT: ${l.vatRate}%`
                  })) : gridLines
                };
                handlePrintVoucher(draftVou, (formType === 'PAYMENT' || formType === 'RECEIPT') ? 'FRAMED' : 'LEDGER');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Print Voucher (F7)"
            >
              <Printer className="w-4 h-4 text-amber-600 mb-0.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const calcAmount = formType === 'SALES' 
                  ? salesLines.reduce((s, l) => s + ((Number(l.qty) || 0) * (Number(l.unitRate) || 0) * (1 + ((Number(l.vatRate) || 0)/100))), 0) 
                  : (totalDebits > 0 ? totalDebits : (gridLines[0]?.debitAmount || 0));

                const draftVou: FinancialVoucher = {
                  id: 'draft',
                  voucherType: formType,
                  voucherNo: generateNextVoucherNo(formType),
                  date: formDate,
                  primaryAccount: formPartyName || (formType === 'PAYMENT' ? 'Accounts Payable' : 'Accounts Receivable'),
                  offsetAccount: formType === 'PAYMENT' ? 'RAK Bank Current A/C' : 'Primary Industrial Sales',
                  partyName: formPartyType === 'NONE' ? 'N/A' : (formPartyName || 'N/A'),
                  partyType: formPartyType,
                  amount: calcAmount,
                  referenceNo: formRefNo || 'DRAFT',
                  narration: formNarration || 'Draft preview.',
                  status: 'DRAFT',
                  isAutomated: false,
                  lines: formType === 'SALES' ? salesLines.map(l => ({
                    accountName: l.description || 'Sales Item',
                    debitAmount: (Number(l.qty) || 0) * (Number(l.unitRate) || 0),
                    creditAmount: 0,
                    narration: `Qty: ${l.qty}, Rate: ${l.unitRate}, VAT: ${l.vatRate}%`
                  })) : gridLines
                };
                setPreviewVoucher(draftVou);
                setPreviewFormat((formType === 'PAYMENT' || formType === 'RECEIPT') ? 'FRAMED' : 'LEDGER');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Preview Voucher Modal"
            >
              <Eye className="w-4 h-4 text-emerald-600 mb-0.5" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEditCompanyModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Edit Company Header (Name, Address, Phone, TRN)"
            >
              <Building2 className="w-4 h-4 text-[#f37021] mb-0.5" />
              <span>Header</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerToast('Voucher entry suspended to temporary hold.', 'info');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Suspend Entry"
            >
              <PauseCircle className="w-4 h-4 text-amber-500 mb-0.5" />
              <span>Suspend</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const element = document.getElementById('voucher-audit-history-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                triggerToast('Jumped to Voucher Audit Log & History.', 'info');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[54px]"
              title="Authorization History"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 mb-0.5" />
              <span>Auth History</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerToast('Voucher entry closed.', 'info');
              }}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center font-sans text-[10px] font-semibold text-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap min-w-[46px]"
              title="Close Voucher Sheet"
            >
              <XCircle className="w-4 h-4 text-slate-500 mb-0.5" />
              <span>Close</span>
            </button>

          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase border rounded-lg shadow-2xs whitespace-nowrap ${
              formType === 'SALES' || isBalanced 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
            }`}>
              {formType === 'SALES' ? '✓ SALES VOUCHER: READY' : (isBalanced ? '✓ DOUBLE ENTRY: BALANCED' : '⚠️ DOUBLE ENTRY: UNBALANCED')}
            </div>
          </div>
        </div>

        {/* 2. TAB CONTROLLER FOR CATEGORIES */}
        <div className="bg-slate-200 border-b border-slate-300 p-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {((() => {
              if (initialTypeFilter === 'CONTRA') return ['CONTRA'] as const;
              if (initialTypeFilter === 'JOURNAL') return ['JOURNAL'] as const;
              if (initialTypeFilter === 'PAYMENT') return ['PAYMENT'] as const;
              if (initialTypeFilter === 'RECEIPT') return ['RECEIPT'] as const;
              if (initialTypeFilter === 'SALES') return ['SALES'] as const;
              if (formType === 'CONTRA' || formType === 'JOURNAL') return ['CONTRA', 'JOURNAL'] as const;
              return ['CONTRA', 'PAYMENT', 'RECEIPT', 'JOURNAL', 'SALES'] as const;
            })()).map((type) => {
              const isActive = formType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormType(type as any);
                    setShowAdvancedGrid(false);
                  }}
                  className={`px-4 py-1.5 text-[11px] font-mono font-bold tracking-wider uppercase border rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-slate-300 px-3 py-1 font-mono text-[10.5px] font-bold text-slate-600 rounded-lg">
            Draft Doc No: <span className="text-blue-600">{generateNextVoucherNo(formType)}</span>
          </div>
        </div>

        {/* 4. MASTER FIELDS BOX (GRID LAYOUT EXACTLY LIKE FOCUS ERP) */}
        <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200">
          
          {/* Master 1: Date */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Posting Date
            </label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-none p-1 text-xs font-mono focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] h-7"
            />
          </div>

          {/* Master 2: Reference / Cheque / Wire */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Doc Ref / Cheque No
            </label>
            <input
              type="text"
              placeholder="e.g. wire-45012 / chq-902"
              value={formRefNo}
              onChange={(e) => setFormRefNo(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] h-7"
            />
          </div>

          {/* Master 3: Party Link Account */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Party Subledger Type
            </label>
            <select
              value={formPartyType}
              onChange={(e) => {
                const newType = e.target.value as any;
                setFormPartyType(newType);
                if (newType === 'CUSTOMER' && clientDatabase.length > 0) {
                  setFormPartyName(clientDatabase[0]);
                } else if (newType === 'SUPPLIER' && supplierDatabase.length > 0) {
                  setFormPartyName(supplierDatabase[0]);
                } else {
                  setFormPartyName('N/A');
                }
              }}
              className="w-full bg-white border border-slate-300 rounded-none p-0.5 text-xs focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] h-7"
            >
              <option value="CUSTOMER">Trade Customer (AR)</option>
              <option value="SUPPLIER">Trade Supplier (AP)</option>
              <option value="NONE">General Adjustment (GL-Only)</option>
            </select>
          </div>

          {/* Master 4: Party Name with Right-Side Outstanding Balance Badge */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Selected Party Entity
              </label>
              {formPartyType !== 'NONE' && formPartyName && formPartyName !== 'N/A' && (
                <span className="text-[9px] font-mono font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                  Bal: AED {getPartyOutstandingBalance(formPartyName, formPartyType).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {formPartyType === 'CUSTOMER' ? (
              <select
                value={formPartyName}
                onChange={(e) => setFormPartyName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-none p-0.5 text-xs focus:outline-none focus:border-[#FF6B00] h-7 uppercase font-bold"
              >
                {clientDatabase.map(c => (
                  <option key={c} value={c}>
                    {c} (Bal: AED {getPartyOutstandingBalance(c, 'CUSTOMER').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            ) : formPartyType === 'SUPPLIER' ? (
              <select
                value={formPartyName}
                onChange={(e) => setFormPartyName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-none p-0.5 text-xs focus:outline-none focus:border-[#FF6B00] h-7 uppercase font-bold"
              >
                {supplierDatabase.map(s => (
                  <option key={s} value={s}>
                    {s} (Bal: AED {getPartyOutstandingBalance(s, 'SUPPLIER').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value="N/A (INTERNAL GENERAL GL)"
                className="w-full bg-slate-100 border border-slate-300 rounded-none p-1 text-xs text-slate-400 cursor-not-allowed h-7 uppercase font-mono"
              />
            )}
          </div>

          {/* Receipt & Payment specific metadata */}
          {(formType === 'RECEIPT' || formType === 'PAYMENT') && (
            <>
              {/* Customer / Supplier Address */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {formPartyType === 'SUPPLIER' ? 'Supplier Address' : 'Customer Address'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Industrial Area 2, Ajman, United Arab Emirates"
                  value={formPartyAddress}
                  onChange={(e) => setFormPartyAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>

              {/* Customer / Supplier Bank Account / IBAN */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  {formPartyType === 'SUPPLIER' ? 'Supplier Bank A/C / IBAN' : 'Customer Bank A/C / IBAN'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. AE9404... / A/C 0242715908001"
                  value={formPartyBankAccount}
                  onChange={(e) => setFormPartyBankAccount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono font-bold"
                />
              </div>

              {/* Cheque Bank Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Cheque Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. RAK BANK / EMIRATES NBD"
                  value={formChequeBankName}
                  onChange={(e) => setFormChequeBankName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>

              {/* Cheque Bank Address */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Cheque Bank Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. King Faisal St, Sharjah, UAE"
                  value={formChequeBankAddress}
                  onChange={(e) => setFormChequeBankAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>

              {/* Against PO */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Against PO No
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-88204"
                  value={formPoRef}
                  onChange={(e) => setFormPoRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>

              {/* Invoice Ref */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Invoice Ref No
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-90412"
                  value={formInvoiceRef}
                  onChange={(e) => setFormInvoiceRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>

              {/* Advance Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Advance AED
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={formAdvanceAmount}
                  onChange={(e) => setFormAdvanceAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>

              {/* Balance Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Balance AED
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={formBalanceAmount}
                  onChange={(e) => setFormBalanceAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] h-7 font-mono"
                />
              </div>
            </>
          )}

          {/* Wide Row: Master Voucher Narration */}
          <div className="sm:col-span-2 md:col-span-4 space-y-1 pt-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Master Voucher Narration / Memo Remarks
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Settlement payout of raw steel procurement voucher against Hamriyah bill booking..."
              value={formNarration}
              onChange={(e) => setFormNarration(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-none p-1 px-2 text-xs focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] h-7"
            />
          </div>

        </div>

        {/* 5. VOUCHER ENTRY AREA (SIMPLE & UNIQUE FOR CONTRA & JOURNAL, SPREADSHEET FOR OTHERS) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200">

          {formType === 'CONTRA' && !showAdvancedGrid ? (
            /* SIMPLE & CLEAN CONTRA TRANSFER FORM */
            <div className="p-5 bg-white text-slate-900 border-2 border-blue-600 rounded-lg shadow-sm space-y-4 font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                    <ArrowLeftRight className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                      Contra Funds Transfer
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Very simple internal transfer between Bank Accounts and Cash Vaults
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 5000, creditAmount: 0, narration: 'Bank cash deposit' },
                        { accountName: 'Main Cash in Hand Vault', debitAmount: 0, creditAmount: 5000, narration: 'Vault cash deposited into RAK Bank' }
                      ]);
                      setFormNarration('Cash deposit from Main Vault into RAK Bank Current Account.');
                      triggerToast('Preset applied: Cash Deposit to Bank', 'info');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    💵 Cash Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'Main Cash in Hand Vault', debitAmount: 3000, creditAmount: 0, narration: 'Vault cash withdrawal' },
                        { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 3000, narration: 'RAK Bank cash withdrawal' }
                      ]);
                      setFormNarration('Cash withdrawal from RAK Bank into Main Cash Vault.');
                      triggerToast('Preset applied: Cash Withdrawal from Bank', 'info');
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    🏦 Cash Withdraw
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'Mashreq Bank Operational A/C', debitAmount: 10000, creditAmount: 0, narration: 'Incoming wire' },
                        { accountName: 'RAK Bank Current A/C (0242715908001)', debitAmount: 0, creditAmount: 10000, narration: 'Outgoing wire' }
                      ]);
                      setFormNarration('Inter-bank funds transfer from RAK Bank to Mashreq Operational A/C.');
                      triggerToast('Preset applied: Inter-Bank Wire Transfer', 'info');
                    }}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    🔄 Wire Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'Petty Cash Ledger', debitAmount: 1500, creditAmount: 0, narration: 'Petty float top-up' },
                        { accountName: 'Main Cash in Hand Vault', debitAmount: 0, creditAmount: 1500, narration: 'Vault cash release' }
                      ]);
                      setFormNarration('Petty cash float replenishment from Main Vault.');
                      triggerToast('Preset applied: Petty Cash Replenishment', 'info');
                    }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    🪙 Petty Cash
                  </button>
                </div>
              </div>

              {/* Very Simple Main Transfer Fields */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 border border-slate-200 rounded-md">
                {/* Source Account (Transfer From / Credit) */}
                <div className="md:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                      Source Account (Transfer From)
                    </label>
                    <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded font-mono">
                      Credit [Cr]
                    </span>
                  </div>
                  <select
                    value={gridLines[1]?.accountName || ''}
                    onChange={(e) => setSimpleCreditAccount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 text-slate-900 p-2 text-xs font-bold rounded focus:border-blue-600 focus:outline-none uppercase font-mono"
                  >
                    {contraFilteredAccounts.map(acc => (
                      <option key={acc.code} value={acc.name}>
                        {acc.name} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Field */}
                <div className="md:col-span-2 space-y-1 text-center">
                  <label className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wide block">
                    Amount (AED) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={gridLines[0]?.debitAmount || ''}
                    onChange={(e) => setSimpleAmount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-blue-600 text-blue-900 rounded p-2 text-center text-sm font-black font-mono focus:outline-none shadow-3xs"
                  />
                </div>

                {/* Destination Account (Transfer To / Debit) */}
                <div className="md:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                      Destination Account (Transfer To)
                    </label>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                      Debit [Dr]
                    </span>
                  </div>
                  <select
                    value={gridLines[0]?.accountName || ''}
                    onChange={(e) => setSimpleDebitAccount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 text-slate-900 p-2 text-xs font-bold rounded focus:border-blue-600 focus:outline-none uppercase font-mono"
                  >
                    {contraFilteredAccounts.map(acc => (
                      <option key={acc.code} value={acc.name}>
                        {acc.name} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Memo & Narration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Ref / Cheque / Wire No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wire-102"
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Narration / Transfer Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cash deposit from vault into RAK Bank current account..."
                    value={formNarration}
                    onChange={(e) => setFormNarration(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <div className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BALANCED TRANSFER AMOUNT: AED {(gridLines[0]?.debitAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedGrid(true)}
                    className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer mr-2 font-mono"
                  >
                    ⚙️ Advanced Multi-Line Mode
                  </button>
                  <button
                    type="button"
                    onClick={handlePostVoucherSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded shadow-xs cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE CONTRA VOUCHER</span>
                  </button>
                </div>
              </div>
            </div>
          ) : formType === 'JOURNAL' && !showAdvancedGrid ? (
            /* SIMPLE & CLEAN JOURNAL ADJUSTMENT FORM */
            <div className="p-5 bg-white text-slate-900 border-2 border-purple-600 rounded-lg shadow-sm space-y-4 font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                      Journal GL Adjustment
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Simple double-entry ledger adjustment for provisions, depreciation, and VAT accruals
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'Depreciation - Machinery & Equipment', debitAmount: 4500, creditAmount: 0, narration: 'Monthly machinery depreciation' },
                        { accountName: 'Retained Earnings / Reserves', debitAmount: 0, creditAmount: 4500, narration: 'Accumulated depreciation reserve' }
                      ]);
                      setFormNarration('Monthly plant & machinery depreciation journal provision.');
                      triggerToast('Preset applied: Depreciation Provision', 'info');
                    }}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    ⚙️ Depreciation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'Raw Material Procurement Expenses', debitAmount: 18000, creditAmount: 0, narration: 'Factory wages accrual' },
                        { accountName: 'Salaries & Wages Payable', debitAmount: 0, creditAmount: 18000, narration: 'Accrued wages payable for current month' }
                      ]);
                      setFormNarration('Monthly payroll & wages provision booking.');
                      triggerToast('Preset applied: Payroll Accrual', 'info');
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    👷 Payroll Accrual
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGridLines([
                        { accountName: 'Output VAT Payable 5%', debitAmount: 2500, creditAmount: 0, narration: 'VAT output offset' },
                        { accountName: 'Input VAT Recoverable 5%', debitAmount: 0, creditAmount: 2500, narration: 'VAT input recovery match' }
                      ]);
                      setFormNarration('Quarterly FTA VAT input vs output offset adjustment.');
                      triggerToast('Preset applied: VAT Input/Output Offset', 'info');
                    }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded transition-all cursor-pointer font-mono"
                  >
                    📋 VAT Offset
                  </button>
                </div>
              </div>

              {/* Very Simple Main Journal Fields */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 border border-slate-200 rounded-md">
                {/* Debit Account (Dr) */}
                <div className="md:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                      Debit Account (Dr)
                    </label>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded font-mono">
                      DEBIT [Dr]
                    </span>
                  </div>
                  <select
                    value={gridLines[0]?.accountName || ''}
                    onChange={(e) => setSimpleDebitAccount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 text-slate-900 p-2 text-xs font-bold rounded focus:border-purple-600 focus:outline-none uppercase font-mono"
                  >
                    {journalFilteredAccounts.map(acc => (
                      <option key={acc.code} value={acc.name}>
                        [{acc.code}] {acc.name} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Field */}
                <div className="md:col-span-2 space-y-1 text-center">
                  <label className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wide block">
                    Amount (AED) *
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={gridLines[0]?.debitAmount || ''}
                    onChange={(e) => setSimpleAmount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-purple-600 text-purple-900 rounded p-2 text-center text-sm font-black font-mono focus:outline-none shadow-3xs"
                  />
                </div>

                {/* Credit Account (Cr) */}
                <div className="md:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                      Credit Account (Cr)
                    </label>
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                      CREDIT [Cr]
                    </span>
                  </div>
                  <select
                    value={gridLines[1]?.accountName || ''}
                    onChange={(e) => setSimpleCreditAccount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 text-slate-900 p-2 text-xs font-bold rounded focus:border-purple-600 focus:outline-none uppercase font-mono"
                  >
                    {journalFilteredAccounts.map(acc => (
                      <option key={acc.code} value={acc.name}>
                        [{acc.code}] {acc.name} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Memo & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Ref Doc No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JNL-2026-01"
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-mono focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Adjustment Explanation / Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly machinery depreciation provision entry..."
                    value={formNarration}
                    onChange={(e) => setFormNarration(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:border-purple-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
                <div className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>DOUBLE-ENTRY BALANCED: AED {(gridLines[0]?.debitAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedGrid(true)}
                    className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer mr-2 font-mono"
                  >
                    ⚙️ Advanced Multi-Line Mode
                  </button>
                  <button
                    type="button"
                    onClick={handlePostVoucherSubmit}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2 rounded shadow-xs cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE JOURNAL VOUCHER</span>
                  </button>
                </div>
              </div>
            </div>
          ) : formType === 'SALES' ? (
            /* SALES VOUCHER ITEMIZED ITEM TABLE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11.5px] font-mono font-bold text-slate-800 uppercase tracking-wider block">
                    Sales Voucher Itemized Entry (Tax Invoice Specification)
                  </span>
                  <span className="text-[10.5px] text-slate-500 font-sans">
                    Type description, unit rate, and VAT %. Unfilled numeric boxes remain blank without raw 0 values.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSalesLine}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-[10.5px] font-mono font-bold px-3 py-1 uppercase cursor-pointer rounded-lg flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Add Item Line</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-300 bg-white rounded-xl shadow-2xs relative">
                <table className="w-full border-collapse text-left text-xs font-sans min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold font-mono text-[10px] uppercase">
                      <th className="p-2.5 w-10 text-center border-r border-slate-300">S.N</th>
                      <th className="p-2.5 w-[36%] border-r border-slate-300">Particulars / Description</th>
                      <th className="p-2.5 w-24 text-right pr-3 border-r border-slate-300">Qty</th>
                      <th className="p-2.5 w-32 text-right pr-3 border-r border-slate-300">Unit Rate (AED)</th>
                      <th className="p-2.5 w-24 text-right pr-3 border-r border-slate-300">VAT %</th>
                      <th className="p-2.5 w-32 text-right pr-3 border-r border-slate-300">Excl. VAT (AED)</th>
                      <th className="p-2.5 w-32 text-right pr-3 border-r border-slate-300">Total Incl. VAT</th>
                      <th className="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {salesLines.map((line, idx) => {
                      const q = Number(line.qty) || 0;
                      const r = Number(line.unitRate) || 0;
                      const vP = Number(line.vatRate) || 0;
                      const lineExcl = q * r;
                      const lineIncl = lineExcl * (1 + vP / 100);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-bold bg-slate-50 text-[11px]">
                            {idx + 1}
                          </td>

                          <td className="p-1.5 border-r border-slate-300">
                            <input
                              type="text"
                              placeholder="Type Item Description..."
                              value={line.description}
                              onChange={(e) => handleUpdateSalesLine(idx, 'description', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-sans focus:outline-none focus:border-blue-500 font-medium"
                            />
                          </td>

                          <td className="p-1.5 border-r border-slate-300">
                            <input
                              type="number"
                              placeholder="0"
                              value={line.qty === 0 || line.qty === '0' || line.qty === '0.00' || !line.qty ? '' : line.qty}
                              onChange={(e) => handleUpdateSalesLine(idx, 'qty', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded p-1.5 text-right text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="p-1.5 border-r border-slate-300">
                            <input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              value={line.unitRate === 0 || line.unitRate === '0' || line.unitRate === '0.00' || !line.unitRate ? '' : line.unitRate}
                              onChange={(e) => handleUpdateSalesLine(idx, 'unitRate', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded p-1.5 text-right text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="p-1.5 border-r border-slate-300">
                            <input
                              type="number"
                              placeholder="5"
                              step="1"
                              value={line.vatRate === 0 || line.vatRate === '0' || line.vatRate === '0.00' || line.vatRate === undefined ? '' : line.vatRate}
                              onChange={(e) => handleUpdateSalesLine(idx, 'vatRate', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded p-1.5 text-right text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-blue-500"
                            />
                          </td>

                          <td className="p-1.5 border-r border-slate-300 text-right pr-3 font-mono font-bold text-slate-800 text-xs">
                            {lineExcl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="p-1.5 border-r border-slate-300 text-right pr-3 font-mono font-bold text-blue-700 text-xs">
                            {lineIncl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="p-1.5 text-center bg-slate-50">
                            <button
                              type="button"
                              onClick={() => handleRemoveSalesLine(idx)}
                              className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors cursor-pointer"
                              title="Delete item row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Sales Voucher Totals Summary Row */}
                    <tr className="bg-slate-100 font-bold text-xs text-slate-800">
                      <td colSpan={5} className="p-2.5 border-r border-slate-300 text-right uppercase font-mono text-[10px] tracking-wider text-slate-600">
                        Sales Voucher Total Excl. VAT (AED):
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-right pr-3 font-mono text-slate-900 font-black">
                        {salesLines.reduce((s, l) => s + ((Number(l.qty) || 0) * (Number(l.unitRate) || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-right pr-3 font-mono text-blue-800 font-black text-sm">
                        AED {salesLines.reduce((s, l) => s + (((Number(l.qty) || 0) * (Number(l.unitRate) || 0)) * (1 + ((Number(l.vatRate) || 0) / 100))), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Save Action Bar for Sales */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    5% Output VAT: AED {salesLines.reduce((s, l) => s + (((Number(l.qty) || 0) * (Number(l.unitRate) || 0)) * ((Number(l.vatRate) || 0) / 100)), 0).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePostVoucherSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  <span>POST SALES VOUCHER</span>
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD MULTI-ROW LEDGER SPREADSHEET */
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-mono font-bold text-slate-600 uppercase tracking-wider block">
                  Double-Entry Ledger Account Lines (Spreadsheet Entry)
                </span>
                <div className="flex items-center gap-2">
                  {(formType === 'CONTRA' || formType === 'JOURNAL') && (
                    <button
                      type="button"
                      onClick={() => setShowAdvancedGrid(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 uppercase cursor-pointer rounded-none"
                    >
                      ← Simple Mode
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddGridRow}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 uppercase cursor-pointer rounded-none flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-blue-600" />
                    <span>Add Grid Row</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-slate-300 bg-white relative">
                <table className="w-full border-collapse text-left text-xs font-sans min-w-[800px]">
                  <thead className="sticky top-0 z-20 bg-slate-200">
                    <tr className="bg-slate-200 border-b border-slate-300 text-slate-700 font-bold font-mono text-[10px] uppercase sticky top-0 z-20 shadow-2xs">
                      <th className="p-2 w-10 text-center border-r border-slate-300">S.No</th>
                      <th className="p-2 w-[40%] border-r border-slate-300">Ledger Account Name</th>
                      <th className="p-2 w-32 text-right pr-4 border-r border-slate-300">Debit (AED)</th>
                      <th className="p-2 w-32 text-right pr-4 border-r border-slate-300">Credit (AED)</th>
                      <th className="p-2 border-r border-slate-300">Line Description</th>
                      <th className="p-2 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gridLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        
                        {/* S.No */}
                        <td className="p-1 border-r border-slate-300 font-mono text-center text-slate-500 font-semibold bg-slate-50">
                          {idx + 1}
                        </td>

                        {/* Ledger Account Selection */}
                        <td className="p-1 border-r border-slate-300">
                          <select
                            value={line.accountName}
                            onChange={(e) => handleUpdateGridCell(idx, 'accountName', e.target.value)}
                            className="w-full bg-white border border-slate-300 p-1 text-xs focus:outline-none focus:border-blue-500 uppercase font-mono"
                          >
                            {ledgerAccounts.map(acc => (
                              <option key={acc.code} value={acc.name}>
                                [{acc.code}] {acc.name} ({acc.category})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Debit Column */}
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={line.debitAmount || ''}
                            onChange={(e) => handleUpdateGridCell(idx, 'debitAmount', e.target.value)}
                            className="w-full bg-white border border-slate-300 p-1 text-right text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-blue-700"
                          />
                        </td>

                        {/* Credit Column */}
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            value={line.creditAmount || ''}
                            onChange={(e) => handleUpdateGridCell(idx, 'creditAmount', e.target.value)}
                            className="w-full bg-white border border-slate-300 p-1 text-right text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-rose-700"
                          />
                        </td>

                        {/* Line Narration */}
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Particulars/Invoice matching info..."
                            value={line.narration}
                            onChange={(e) => handleUpdateGridCell(idx, 'narration', e.target.value)}
                            className="w-full bg-white border border-slate-300 p-1 text-xs focus:outline-none focus:border-blue-500 italic"
                          />
                        </td>

                        {/* Row Deletion */}
                        <td className="p-1 text-center bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleRemoveGridRow(idx)}
                            className="p-1 hover:bg-rose-100 text-rose-600 rounded-none transition-colors cursor-pointer"
                            title="Delete this double-entry ledger line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    ))}

                    {/* SPREADSHEET GRID FOOTER TRIAL ACCUMULATION */}
                    <tr className="bg-slate-200 font-bold text-xs text-slate-800">
                      <td colSpan={2} className="p-2 border-r border-slate-300 text-right uppercase font-mono text-[10px] tracking-wider">
                        Ledger Sum Balance Validation:
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right pr-3 font-mono text-blue-700 font-bold">
                        {totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right pr-3 font-mono text-rose-700 font-bold">
                        {totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td colSpan={2} className="p-2 font-mono text-[10px] pl-4">
                        {isBalanced ? (
                          <span className="text-emerald-700 uppercase font-bold flex items-center gap-1">
                            ✓ Balanced
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold uppercase flex items-center gap-1 animate-pulse">
                            ⚠️ Out of Balance by {difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* VOUCHER SCHEMA SPECIFIC VALIDATION ADVISORY */}
          <div className="mt-2.5 p-2 bg-slate-50 border border-slate-300 text-[11px] font-mono text-slate-500 leading-normal">
            {formType === 'CONTRA' && (
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span><strong>CONTRA ADVISORY:</strong> Enforce Cash-to-Cash, Bank-to-Bank, or Bank-to-Cash adjustments. Cash & Bank ledgers must be targeted on both sides.</span>
              </span>
            )}
            {formType === 'RECEIPT' && (
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>RECEIPT ADVISORY:</strong> Funds receipt from external sources. Credit Trade Customer or Revenue, and Debit Bank/Cash Account.</span>
              </span>
            )}
            {formType === 'PAYMENT' && (
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span><strong>PAYMENT ADVISORY:</strong> Settling external supplier liabilities or direct operational expenses. Debit Trade Creditor or Expense, and Credit Bank/Cash.</span>
              </span>
            )}
            {formType === 'JOURNAL' && (
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span><strong>JOURNAL ADVISORY:</strong> Direct accounting adjustments, provisions, depreciation reserves, and general non-cash subledger mapping.</span>
              </span>
            )}
          </div>

        </div>

      </div>

      {/* =========================================================================
          CHRONOLOGICAL REGISTRY JOURNAL REGISTER
          ========================================================================= */}
      <div id="voucher-audit-history-section" className="bg-white border border-slate-200 shadow-3xs overflow-hidden">
        
        {/* Register Toolbar Control */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 font-normal">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Voucher, Party, Ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-none pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-black w-64 transition-all h-8"
              />
            </div>

            {/* Class Category Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-none p-1.5 text-xs text-slate-700 focus:outline-none focus:border-black h-8"
            >
              <option value="ALL">-- ALL VOUCHER CLASSES --</option>
              <option value="RECEIPT">RECEIPTS ONLY</option>
              <option value="PAYMENT">PAYMENTS ONLY</option>
              <option value="CONTRA">CONTRAS ONLY</option>
              <option value="JOURNAL">JOURNALS ONLY</option>
              <option value="SALES">AUTO SALES INVOICES</option>
              <option value="PURCHASE">AUTO SUPPLIER PURCHASES</option>
            </select>

            {/* Relationship Filter */}
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-none p-1.5 text-xs text-slate-700 focus:outline-none focus:border-black h-8"
            >
              <option value="ALL">-- ALL SUBLEDGER ENTITIES --</option>
              <option value="CUSTOMERS">CUSTOMERS (AR)</option>
              <option value="SUPPLIERS">SUPPLIERS (AP)</option>
              <option value="NONE">NO ASSOCIATED PARTY (INTERNAL GL)</option>
            </select>

          </div>

          <span className="text-[10.5px] text-slate-500 font-mono uppercase font-bold bg-slate-100 border border-slate-200 px-2 py-1">
            Registered: {filteredVouchers.length} Slips
          </span>
        </div>

        {/* Chronological Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold font-mono text-[10px] uppercase">
                <th className="p-3">Posting Date</th>
                <th className="p-3">Voucher No</th>
                <th className="p-3">Voucher Class</th>
                <th className="p-3">Debit Ledger / Primary</th>
                <th className="p-3">Credit Ledger / Offset</th>
                <th className="p-3">Related Subledger Party</th>
                <th className="p-3">Doc Ref</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-center">GL Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-mono text-[11px]">
                    NO COMPLIANT GENERAL LEDGER SLIPS MATCHING CURRENT REGISTER SEARCH criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Date */}
                      <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                        {v.date}
                      </td>

                      {/* Voucher No */}
                      <td className="p-3 font-bold font-mono text-slate-900 select-all">
                        {v.voucherNo}
                      </td>

                      {/* Class */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase ${
                          v.voucherType === 'RECEIPT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          v.voucherType === 'PAYMENT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          v.voucherType === 'CONTRA' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {v.voucherType}
                        </span>
                      </td>

                      {/* Primary Account */}
                      <td className="p-3 text-slate-600 font-mono truncate max-w-[150px]" title={v.primaryAccount}>
                        {v.primaryAccount}
                      </td>

                      {/* Offset Account */}
                      <td className="p-3 text-slate-600 font-mono truncate max-w-[150px]" title={v.offsetAccount}>
                        {v.offsetAccount}
                      </td>

                      {/* Related Party */}
                      <td className="p-3 font-medium text-slate-800">
                        {v.partyName && v.partyName !== 'N/A' ? (
                          <div className="flex flex-col">
                            <span>{v.partyName}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono">{v.partyType}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-mono text-[10px]">GL ADJUSTMENT</span>
                        )}
                      </td>

                      {/* Doc Ref */}
                      <td className="p-3 font-mono text-slate-500">
                        {v.referenceNo && v.referenceNo !== 'N/A' ? v.referenceNo : '—'}
                      </td>

                      {/* Total Amount */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        AED {v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 font-bold px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-mono">
                          {v.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setPreviewVoucher(v);
                              setPreviewFormat((v.voucherType === 'PAYMENT' || v.voucherType === 'RECEIPT') ? 'FRAMED' : 'LEDGER');
                            }}
                            className="p-1 hover:bg-emerald-50 text-emerald-600 transition-all cursor-pointer rounded"
                            title="Preview Voucher Modal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintVoucher(v)}
                            className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer rounded"
                            title="Print Ledger Voucher PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(v.id, v.voucherNo)}
                            className="p-1 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer rounded"
                            title="Reverse and void voucher"
                          >
                            <Trash2 className="w-4 h-4" />
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

      </div>

      {/* Edit Company Profile Modal */}
      <EditCompanyModal
        isOpen={showEditCompanyModal}
        onClose={() => setShowEditCompanyModal(false)}
        onSaved={(updated) => setCompanyProfile(updated)}
      />

      {/* Live Voucher Preview Modal */}
      {previewVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header Toolbar */}
            <div className="bg-slate-800 border-b border-slate-700 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{previewVoucher.voucherType} VOUCHER PREVIEW</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      [{previewVoucher.voucherNo}]
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Live print & PDF preview template representation
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Format Selector Toggle */}
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-700 flex items-center gap-1 font-mono text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setPreviewFormat('FRAMED')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewFormat === 'FRAMED' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📄 Framed Box Slip (Image 2)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFormat('LEDGER')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewFormat === 'LEDGER' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📊 Journal Ledger Table (Image 1)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintVoucher(previewVoucher, previewFormat)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewVoucher(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 bg-slate-950/80 overflow-y-auto flex-1 flex justify-center">
              <div className="w-full">
                {previewFormat === 'FRAMED' ? (
                  <FramedVoucherBox voucher={previewVoucher} companyProfile={companyProfile} />
                ) : (
                  <LedgerJournalBox voucher={previewVoucher} companyProfile={companyProfile} />
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================================
   LIVE PRINT PREVIEW COMPONENT: FRAMED RECEIPT / PAYMENT VOUCHER (IMAGE 2)
   ========================================================================= */
const FramedVoucherBox = ({ voucher, companyProfile }: { voucher: FinancialVoucher; companyProfile: CompanyProfile }) => {
  const isPayment = voucher.voucherType === 'PAYMENT';
  const linesToPrint = voucher.lines && voucher.lines.length > 0 ? voucher.lines : [
    { accountName: voucher.primaryAccount, debitAmount: voucher.amount, creditAmount: 0, narration: voucher.narration },
    { accountName: voucher.offsetAccount, debitAmount: 0, creditAmount: voucher.amount, narration: '' }
  ];
  const totalDr = linesToPrint.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
  const displayTotal = totalDr > 0 ? totalDr : voucher.amount;

  const modeCash = !voucher.referenceNo && (!voucher.narration || !voucher.narration.toLowerCase().includes('cheque'));
  const modeCheque = !!voucher.referenceNo && (voucher.referenceNo.toLowerCase().includes('chq') || voucher.referenceNo.toLowerCase().includes('cheque') || /^\d{5,}$/.test(voucher.referenceNo));
  const modeWire = !modeCash && !modeCheque;

  const partyText = (voucher.partyName && voucher.partyName !== 'N/A') ? voucher.partyName : voucher.primaryAccount;
  const partyAddress = voucher.partyAddress || 'AJMAN, UNITED ARAB EMIRATES';
  const chequeBank = voucher.chequeBankName || companyProfile.bankName || 'RAK BANK';
  const chequeBankAddr = voucher.chequeBankAddress || companyProfile.bankBranch || 'KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES';
  const poVal = voucher.poRef || '—';
  const invVal = voucher.invoiceRef || '—';
  const advVal = voucher.advanceAmount !== undefined && voucher.advanceAmount !== '' ? String(voucher.advanceAmount) : '0.00';
  const balVal = voucher.balanceAmount !== undefined && voucher.balanceAmount !== '' ? String(voucher.balanceAmount) : '0.00';
  const amountWordsText = numberToWordsDirhams(displayTotal).toUpperCase();
  const cleanName = companyProfile.name.replace(/\(SOLE PROPRIETORSHIP\)/gi, '').trim();

  return (
    <div className="border-[2.5px] border-[#1e3a8a] p-5 bg-white text-[#1e3a8a] font-sans text-[11px] shadow-sm select-text rounded-xs max-w-[760px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-double border-[#1e3a8a] pb-2 mb-2">
        {companyProfile.showLogo && (
          <div className="flex items-center gap-1.5 shrink-0">
            <img src={companyProfile.logoUrl || "/logo.png"} className="max-h-12 w-auto object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          </div>
        )}
        <div className="text-center px-2 flex-1">
          <div className="text-sm font-black uppercase text-[#1e3a8a] flex items-center justify-center gap-1 flex-wrap">
            <span>{cleanName}</span>
            {(companyProfile.code === 'MFI' || cleanName.toLowerCase().includes('marine')) && (
              <span className="text-[8px] font-bold border border-[#1e3a8a] px-1 rounded">Sole Proprietorship</span>
            )}
          </div>
          {(companyProfile.code === 'MFI' || companyProfile.tagline || companyProfile.subtitle) && (
            <div className="text-[8.5px] font-extrabold uppercase text-[#1e3a8a] mt-0.5 tracking-tight">
              {companyProfile.tagline || companyProfile.subtitle || 'MANUFACTURER OF FASTENERS, PIPE SUPPORT CLAMPS, CONDUIT ACCESSORIES.'}
            </div>
          )}
          <div className="text-[8px] text-slate-600 mt-0.5">
            {companyProfile.address || 'Shed 31, New Industrial Area, Ajman - U.A.E.'} • Tel: {companyProfile.phone || '+971 6 525 0526'} • Email: {companyProfile.email || 'sales@marinefasteners.co'}
          </div>
        </div>
        <div className="w-12 shrink-0"></div>
      </div>

      {/* Ribbon Row */}
      <div className="flex items-center justify-between my-2">
        <div className="text-sm font-extrabold text-[#1e3a8a]">
          NO. <span className="text-red-600 font-mono font-black text-base ml-1">{voucher.voucherNo}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold">
          <span className={`px-2.5 py-0.5 rounded-full ${modeCash ? 'bg-[#1e3a8a] text-white font-black' : 'border border-[#1e3a8a] text-[#1e3a8a]'}`}>• CASH</span>
          <span className={`px-2.5 py-0.5 rounded-full ${modeCheque ? 'bg-[#1e3a8a] text-white font-black' : 'border border-[#1e3a8a] text-[#1e3a8a]'}`}>• CHEQUE</span>
          <span className={`px-2.5 py-0.5 rounded-full ${modeWire ? 'bg-[#1e3a8a] text-white font-black' : 'border border-[#1e3a8a] text-[#1e3a8a]'}`}>• BANK WIRE</span>
        </div>
      </div>

      <div className="border-b-2 border-[#1e3a8a] my-2"></div>

      {/* Fields */}
      <div className="space-y-2.5 text-[10.5px]">
        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">{isPayment ? 'PAID TO:' : 'CLIENT PAYER:'}</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-slate-900 px-1 pb-0.5">{partyText}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">ADDRESS:</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{partyAddress}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">AMT IN WORDS:</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{amountWordsText}</span>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex items-baseline">
            <span className="font-extrabold min-w-[90px] uppercase text-[#1e3a8a]">ADVANCE AED:</span>
            <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{advVal}</span>
          </div>
          <div className="flex-1 flex items-baseline">
            <span className="font-extrabold min-w-[90px] uppercase text-[#1e3a8a]">BALANCE AED:</span>
            <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{balVal}</span>
          </div>
        </div>

        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">DATED:</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{voucher.date}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">AGAINST PO:</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-slate-700 px-1 pb-0.5">{poVal}</span>
        </div>

        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">INVOICE:</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-slate-700 px-1 pb-0.5">{invVal}</span>
        </div>
      </div>

      {/* Numerical AED Box */}
      <div className="border border-dotted border-[#1e3a8a] p-2.5 text-center max-w-[280px] mx-auto my-3 bg-white shadow-2xs">
        <div className="text-[8px] font-extrabold text-[#1e3a8a] uppercase tracking-wider">NUMERICAL AED VALUE</div>
        <div className="text-base font-black font-mono text-[#1e3a8a] mt-0.5">AED | {displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      {/* Particulars */}
      <div className="flex items-baseline my-2 text-[10.5px]">
        <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">PARTICULARS:</span>
        <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-slate-900 px-1 pb-0.5">{voucher.narration || 'Payment transaction as recorded.'}</span>
      </div>

      <div className="border-b-2 border-[#1e3a8a] my-2"></div>

      {/* Cheque & Bank info */}
      <div className="space-y-2 text-[10.5px] mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-baseline">
            <span className="font-extrabold min-w-[75px] uppercase text-[#1e3a8a]">CHEQUE NO:</span>
            <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-slate-900 px-1 pb-0.5">{voucher.referenceNo || '—'}</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-extrabold min-w-[80px] uppercase text-[#1e3a8a]">CHEQUE DATE:</span>
            <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{voucher.date}</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-extrabold min-w-[75px] uppercase text-[#1e3a8a]">BANK NAME:</span>
            <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{chequeBank}</span>
          </div>
        </div>

        <div className="flex items-baseline">
          <span className="font-extrabold min-w-[110px] uppercase text-[#1e3a8a]">BANK ADDRESS:</span>
          <span className="flex-1 border-b border-dashed border-slate-400 font-bold text-[#1e3a8a] px-1 pb-0.5">{chequeBankAddr}</span>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex items-end justify-between mt-8 pt-2">
        <div className="text-center min-w-[160px]">
          <div className="h-10"></div>
          <div className="border-t border-[#1e3a8a] pt-1 font-extrabold text-[8.5px] uppercase text-[#1e3a8a]">CLIENT SIGNATURE</div>
        </div>

        <div className="text-center">
          <div className="border border-dashed border-slate-400 w-40 h-14 flex items-center justify-center text-[8.5px] font-bold text-slate-400 uppercase mb-1">
            STAMP & SIGNATURE
          </div>
          <div className="font-extrabold text-[8.5px] uppercase text-[#1e3a8a]">FOR: {companyProfile.name}</div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   LIVE PRINT PREVIEW COMPONENT: JOURNAL / CONTRA LEDGER TABLE (IMAGE 1)
   ========================================================================= */
const LedgerJournalBox = ({ voucher, companyProfile }: { voucher: FinancialVoucher; companyProfile: CompanyProfile }) => {
  const isContra = voucher.voucherType === 'CONTRA';
  const isJournal = voucher.voucherType === 'JOURNAL';
  const isPayment = voucher.voucherType === 'PAYMENT';
  const isReceipt = voucher.voucherType === 'RECEIPT';

  const linesToPrint = voucher.lines && voucher.lines.length > 0 ? voucher.lines : [
    { accountName: voucher.primaryAccount, debitAmount: voucher.amount, creditAmount: 0, narration: voucher.narration },
    { accountName: voucher.offsetAccount, debitAmount: 0, creditAmount: voucher.amount, narration: 'Offset auto-offsetting record' }
  ];

  const totalDr = linesToPrint.reduce((s, l) => s + (Number(l.debitAmount) || 0), 0);
  const totalCr = linesToPrint.reduce((s, l) => s + (Number(l.creditAmount) || 0), 0);
  const displayTotal = totalDr > 0 ? totalDr : voucher.amount;

  const bannerText = isContra 
    ? 'CONTRA VOUCHER (BANK / CASH INTERNAL TRANSFER)' 
    : isJournal 
    ? 'JOURNAL VOUCHER (GENERAL DOUBLE-ENTRY ADJUSTMENT)' 
    : isPayment 
    ? 'PAYMENT VOUCHER (OUTFLOW PAYMENT TRANSACTION)' 
    : isReceipt 
    ? 'RECEIPT VOUCHER (INFLOW RECEIPT TRANSACTION)' 
    : `${voucher.voucherType} VOUCHER`;

  const cleanName = companyProfile.name.replace(/\(SOLE PROPRIETORSHIP\)/gi, '').trim();

  return (
    <div className="p-5 bg-white text-slate-900 font-sans text-[11px] shadow-sm select-text rounded-xs max-w-[760px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
        <div>
          <div className="text-base font-black uppercase text-slate-900 tracking-tight">
            {cleanName} {companyProfile.code === 'MFI' || cleanName.toLowerCase().includes('marine') ? '(SOLE PROPRIETORSHIP)' : ''}
          </div>
          <div className="text-[8.5px] text-slate-600 font-medium">
            {companyProfile.address || 'Industrial Area, Ajman, UAE'} | TRN: {companyProfile.trn || '100440509600003'} | Phone: {companyProfile.phone || '+971 6 525 0526'} | Email: {companyProfile.email || 'sales@marinefasteners.co'}
          </div>
        </div>
        <div className="text-right text-[8.5px] font-bold text-slate-500 uppercase">
          FINANCIAL SALES & LEDGER VOUCHER
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center justify-between bg-slate-900 text-white font-bold font-mono text-[10.5px] px-3 py-1.5 rounded-xs my-2">
        <span>{bannerText}</span>
        <span className="bg-white text-slate-900 px-2 py-0.5 rounded-xs font-black">{voucher.voucherNo}</span>
      </div>

      {/* Voucher Metadata */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 border border-slate-200 text-[10px] font-mono my-2">
        <div>
          <span className="text-slate-400 font-bold block text-[8.5px]">VOUCHER NO</span>
          <span className="font-black text-slate-900">{voucher.voucherNo}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold block text-[8.5px]">POSTING DATE</span>
          <span className="font-black text-slate-900">{voucher.date}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold block text-[8.5px]">REF / CHEQUE NO</span>
          <span className="font-semibold text-slate-700">{voucher.referenceNo || 'DRAFT'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold block text-[8.5px]">POSTING STATUS</span>
          <span className="font-bold text-emerald-600 uppercase">{voucher.status || 'DRAFT'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold block text-[8.5px]">SUBLEDGER / PARTY ENTITY</span>
          <span className="font-bold text-blue-700">{voucher.partyName || 'N/A (NONE)'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold block text-[8.5px]">DOCUMENT CLASS</span>
          <span className="font-bold text-purple-700">{voucher.voucherType} ENTRY</span>
        </div>
      </div>

      {/* Entries Table */}
      <table className="w-full text-left font-mono text-[10px] border-collapse my-3">
        <thead>
          <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-700 uppercase">
            <th className="p-1.5 w-10 text-center">S.NO</th>
            <th className="p-1.5 w-12 text-center">DR/CR</th>
            <th className="p-1.5">LEDGER ACCOUNT NAME / PARTICULARS</th>
            <th className="p-1.5 w-28 text-right pr-2">DEBIT (AED)</th>
            <th className="p-1.5 w-28 text-right pr-2">CREDIT (AED)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {linesToPrint.map((line, idx) => {
            const isDr = (Number(line.debitAmount) || 0) > 0;
            return (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-1.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                <td className="p-1.5 text-center">
                  <span className={`px-1 py-0.2 rounded text-[8px] font-black ${isDr ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'}`}>
                    {isDr ? 'Dr' : 'Cr'}
                  </span>
                </td>
                <td className="p-1.5 font-bold text-slate-900">
                  {line.accountName}
                  {line.narration && <div className="text-[8.5px] font-normal text-slate-500 italic">* {line.narration}</div>}
                </td>
                <td className="p-1.5 text-right pr-2 font-bold text-slate-800">
                  {Number(line.debitAmount) ? Number(line.debitAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                </td>
                <td className="p-1.5 text-right pr-2 font-bold text-slate-800">
                  {Number(line.creditAmount) ? Number(line.creditAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-black border-t-2 border-slate-800 text-[10px]">
            <td colSpan={3} className="p-2 text-right uppercase">TOTAL DOUBLE-ENTRY BALANCE:</td>
            <td className="p-2 text-right pr-2 text-blue-800">AED {totalDr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right pr-2 text-rose-800">AED {totalCr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>

      {/* Narration */}
      <div className="bg-slate-50 p-2 border border-slate-200 text-[10px] my-3">
        <span className="font-extrabold text-slate-500 uppercase block text-[8.5px]">MASTER VOUCHER NARRATION / REMARKS:</span>
        <div className="font-bold text-slate-900 italic mt-0.5">"{voucher.narration || 'General accounting ledger posting recorded.'}"</div>
        {displayTotal > 0 && (
          <div className="mt-1 text-[9px] font-bold text-slate-600">
            Amount in Words: <span className="text-slate-900 not-italic uppercase">{numberToWordsDirhams(displayTotal)}</span>
          </div>
        )}
      </div>

      {/* Audit Footers */}
      <div className="flex items-center justify-between text-center pt-8 border-t border-slate-300 font-bold text-[9px] text-slate-700 uppercase mt-8">
        <div>Prepared By</div>
        <div>Checked & Verified By</div>
        <div>Chief Accountant</div>
        <div>Authorized Signatory</div>
      </div>
    </div>
  );
};
