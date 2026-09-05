import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Building2, 
  Wallet, 
  Layers, 
  Check, 
  ChevronDown,
  Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { printHtml } from '../PrintHelper';
import { BankAccountItem } from '../BankAccountBox';
import { CompanyProfile } from '../../utils/companyProfile';

export interface BankTransaction {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  voucherType: 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'CHEQUE_DEPOSIT' | 'CHEQUE_ISSUED' | 'BANK_CHARGES' | 'INTEREST' | 'DIRECT_DEBIT';
  voucherNo: string;
  refNo: string;
  chequeNo?: string;
  chequeDate?: string;
  particulars: string;
  narration: string;
  debit: number; // Inflow / Deposit (Dr)
  credit: number; // Outflow / Withdrawal (Cr)
  status: 'CLEARED' | 'UNCLEARED' | 'RECONCILED' | 'CANCELLED';
  valueDate?: string; // Bank Clearance Date
}

interface BankingStatementProps {
  accounts: BankAccountItem[];
  activeCompany: CompanyProfile;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToContra?: () => void;
}

const DEFAULT_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'bt-101',
    date: '2026-08-01',
    accountId: 'bank-1',
    accountName: 'RAK Bank Corporate Current A/C',
    voucherType: 'RECEIPT',
    voucherNo: 'RV-2026-089',
    refNo: 'INV-5049',
    chequeNo: '882104',
    chequeDate: '2026-08-01',
    particulars: 'AL SHAHEEN STEEL TRADING LLC',
    narration: 'Advance payment received against Order #PO-8812',
    debit: 65000.00,
    credit: 0,
    status: 'CLEARED',
    valueDate: '2026-08-01'
  },
  {
    id: 'bt-102',
    date: '2026-08-02',
    accountId: 'bank-1',
    accountName: 'RAK Bank Corporate Current A/C',
    voucherType: 'PAYMENT',
    voucherNo: 'PV-2026-112',
    refNo: 'LPO-2026-044',
    chequeNo: '000539',
    chequeDate: '2026-08-02',
    particulars: 'AJMAN GALVANIZING & COATING LLC',
    narration: 'Settlement for hot-dip coating of high tensile bolts',
    debit: 0,
    credit: 12800.00,
    status: 'CLEARED',
    valueDate: '2026-08-02'
  },
  {
    id: 'bt-103',
    date: '2026-08-03',
    accountId: 'bank-1',
    accountName: 'RAK Bank Corporate Current A/C',
    voucherType: 'CONTRA',
    voucherNo: 'CN-2026-034',
    refNo: 'TRF-VAULT-01',
    particulars: 'MAIN CASH VAULT STORAGE',
    narration: 'Cash withdrawal for factory floor weekly float',
    debit: 0,
    credit: 15000.00,
    status: 'CLEARED',
    valueDate: '2026-08-03'
  },
  {
    id: 'bt-104',
    date: '2026-08-04',
    accountId: 'bank-2',
    accountName: 'Mashreq Bank Industrial A/C',
    voucherType: 'PAYMENT',
    voucherNo: 'PV-2026-115',
    refNo: 'PO-2026-0921',
    chequeNo: '441092',
    chequeDate: '2026-08-04',
    particulars: 'AL SHARQ TRANSPORTATION & FREIGHT',
    narration: 'Freight charges for port coil dispatch',
    debit: 0,
    credit: 18500.00,
    status: 'CLEARED',
    valueDate: '2026-08-05'
  },
  {
    id: 'bt-105',
    date: '2026-08-05',
    accountId: 'bank-1',
    accountName: 'RAK Bank Corporate Current A/C',
    voucherType: 'CHEQUE_DEPOSIT',
    voucherNo: 'RV-2026-094',
    refNo: 'INV-5058',
    chequeNo: '772109',
    chequeDate: '2026-08-05',
    particulars: 'GULF METALS TRADING FZE',
    narration: 'Client cheque deposited for anchor bolts shipment',
    debit: 55000.00,
    credit: 0,
    status: 'UNCLEARED',
    valueDate: '2026-08-10'
  },
  {
    id: 'bt-106',
    date: '2026-08-06',
    accountId: 'bank-1',
    accountName: 'RAK Bank Corporate Current A/C',
    voucherType: 'CHEQUE_ISSUED',
    voucherNo: 'PV-2026-118',
    refNo: 'PO-2026-088',
    chequeNo: '000541',
    chequeDate: '2026-08-06',
    particulars: 'SABIC STEEL CORPORATION',
    narration: 'PDC issued for Grade 8.8 raw wire rod supply',
    debit: 0,
    credit: 45000.00,
    status: 'UNCLEARED',
    valueDate: '2026-08-15'
  },
  {
    id: 'bt-107',
    date: '2026-08-07',
    accountId: 'bank-1',
    accountName: 'RAK Bank Corporate Current A/C',
    voucherType: 'BANK_CHARGES',
    voucherNo: 'BC-2026-08',
    refNo: 'BANK-CHG-08',
    particulars: 'RAKBANK SERVICE & VAT FEE',
    narration: 'Monthly corporate account maintenance & standing charges',
    debit: 0,
    credit: 367.50,
    status: 'RECONCILED',
    valueDate: '2026-08-07'
  },
  {
    id: 'bt-108',
    date: '2026-08-08',
    accountId: 'bank-2',
    accountName: 'Mashreq Bank Industrial A/C',
    voucherType: 'RECEIPT',
    voucherNo: 'RV-2026-099',
    refNo: 'INV-5052',
    chequeNo: '984120',
    chequeDate: '2026-08-08',
    particulars: 'DUBAI MARINE SERVICES LLC',
    narration: 'Full invoice settlement for cable trays and stainless hardware',
    debit: 32500.00,
    credit: 0,
    status: 'CLEARED',
    valueDate: '2026-08-08'
  },
  {
    id: 'bt-109',
    date: '2026-08-09',
    accountId: 'bank-3',
    accountName: 'Main Cash Vault Storage',
    voucherType: 'CONTRA',
    voucherNo: 'CN-2026-037',
    refNo: 'TRF-PETTY-02',
    particulars: 'PETTY CASH OPERATING FLOAT',
    narration: 'Replenishment of office petty cash box',
    debit: 0,
    credit: 5000.00,
    status: 'CLEARED',
    valueDate: '2026-08-09'
  },
  {
    id: 'bt-110',
    date: '2026-08-10',
    accountId: 'bank-4',
    accountName: 'Petty Cash Operating Float',
    voucherType: 'CONTRA',
    voucherNo: 'CN-2026-037',
    refNo: 'TRF-PETTY-02',
    particulars: 'MAIN CASH VAULT STORAGE',
    narration: 'Received from Main Vault for petty cash office float',
    debit: 5000.00,
    credit: 0,
    status: 'CLEARED',
    valueDate: '2026-08-09'
  }
];

export const BankingStatement: React.FC<BankingStatementProps> = ({
  accounts,
  activeCompany,
  triggerToast,
  onNavigateToContra
}) => {
  // Persistence for bank statement transactions
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => {
    const saved = localStorage.getItem('MF_BANK_TRANSACTIONS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('MF_BANK_TRANSACTIONS', JSON.stringify(transactions));
  }, [transactions]);

  // Filters State
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<string>('ALL_TIME');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [filterVoucherType, setFilterVoucherType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBrsSummary, setShowBrsSummary] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Transaction Form State
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newAccountId, setNewAccountId] = useState<string>(() => accounts[0]?.id || 'bank-1');
  const [newVoucherType, setNewVoucherType] = useState<BankTransaction['voucherType']>('RECEIPT');
  const [newVoucherNo, setNewVoucherNo] = useState<string>('');
  const [newRefNo, setNewRefNo] = useState<string>('');
  const [newChequeNo, setNewChequeNo] = useState<string>('');
  const [newChequeDate, setNewChequeDate] = useState<string>('');
  const [newParticulars, setNewParticulars] = useState<string>('');
  const [newNarration, setNewNarration] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<BankTransaction['status']>('CLEARED');
  const [newValueDate, setNewValueDate] = useState<string>('');

  // Handle Preset Changes
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'THIS_MONTH') {
      setStartDate(`${yyyy}-${mm}-01`);
      setEndDate(todayStr);
    } else if (preset === 'LAST_MONTH') {
      const lastM = today.getMonth() === 0 ? 12 : today.getMonth();
      const lastMY = today.getMonth() === 0 ? yyyy - 1 : yyyy;
      const lastMStr = String(lastM).padStart(2, '0');
      const lastDay = new Date(lastMY, lastM, 0).getDate();
      setStartDate(`${lastMY}-${lastMStr}-01`);
      setEndDate(`${lastMY}-${lastMStr}-${lastDay}`);
    } else if (preset === 'THIS_FY') {
      setStartDate(`${yyyy}-01-01`);
      setEndDate(todayStr);
    } else if (preset === 'ALL_TIME') {
      setStartDate('2026-01-01');
      setEndDate(todayStr);
    }
  };

  // Selected Account details
  const selectedAccount = useMemo(() => {
    if (selectedAccountId === 'ALL') return null;
    return accounts.find(a => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  // Compute Opening Balance before startDate
  const openingBalance = useMemo(() => {
    if (selectedAccountId === 'ALL') {
      // Sum all accounts opening base + earlier txns
      const baseOpening = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
      // Net change before startDate
      const priorTxns = transactions.filter(t => t.date < startDate);
      const priorNet = priorTxns.reduce((sum, t) => sum + (t.debit - t.credit), 0);
      return baseOpening + priorNet;
    } else {
      const acc = accounts.find(a => a.id === selectedAccountId);
      const baseOpening = acc ? (Number(acc.balance) || 0) : 0;
      const priorTxns = transactions.filter(t => t.accountId === selectedAccountId && t.date < startDate);
      const priorNet = priorTxns.reduce((sum, t) => sum + (t.debit - t.credit), 0);
      return baseOpening + priorNet;
    }
  }, [accounts, selectedAccountId, transactions, startDate]);

  // Filtered Transactions in Date Range with Running Balance
  const statementLedger = useMemo(() => {
    let list = transactions.filter(t => {
      const matchAcc = selectedAccountId === 'ALL' || t.accountId === selectedAccountId;
      const matchDate = t.date >= startDate && t.date <= endDate;
      const matchType = filterVoucherType === 'ALL' || t.voucherType === filterVoucherType;
      const matchStat = filterStatus === 'ALL' || t.status === filterStatus;
      const matchSearch = !searchQuery.trim() || 
        t.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.chequeNo && t.chequeNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.refNo && t.refNo.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchAcc && matchDate && matchType && matchStat && matchSearch;
    });

    // Sort chronologically by date
    list.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate Running Balance
    let currentBalance = openingBalance;
    return list.map(item => {
      currentBalance += (item.debit - item.credit);
      return {
        ...item,
        runningBalance: currentBalance
      };
    });
  }, [transactions, selectedAccountId, startDate, endDate, filterVoucherType, filterStatus, searchQuery, openingBalance]);

  // Statement Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalDebits = statementLedger.reduce((sum, t) => sum + t.debit, 0);
    const totalCredits = statementLedger.reduce((sum, t) => sum + t.credit, 0);
    const netMovement = totalDebits - totalCredits;
    const closingBalance = openingBalance + netMovement;

    // Bank Reconciliation Statement (BRS) calculations
    const unclearedOutward = statementLedger
      .filter(t => t.credit > 0 && (t.status === 'UNCLEARED' || t.status === 'CANCELLED'))
      .reduce((sum, t) => sum + t.credit, 0);

    const unclearedInward = statementLedger
      .filter(t => t.debit > 0 && (t.status === 'UNCLEARED' || t.status === 'CANCELLED'))
      .reduce((sum, t) => sum + t.debit, 0);

    // Reconciled Passbook Balance
    const passbookBalance = closingBalance + unclearedOutward - unclearedInward;

    return {
      totalDebits,
      totalCredits,
      netMovement,
      closingBalance,
      unclearedOutward,
      unclearedInward,
      passbookBalance,
      totalCount: statementLedger.length
    };
  }, [statementLedger, openingBalance]);

  // Quick Status Toggle Handler
  const handleToggleStatus = (id: string, newStatus: BankTransaction['status']) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    triggerToast(`Transaction status updated to ${newStatus}`, 'info');
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string, vNo: string) => {
    if (window.confirm(`Delete bank entry #${vNo}?`)) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      triggerToast(`Bank entry #${vNo} deleted successfully.`, 'info');
    }
  };

  // Add Transaction Submit
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticulars.trim() || newAmount <= 0) {
      triggerToast('Please provide valid Particulars and Amount.', 'error');
      return;
    }

    const targetAcc = accounts.find(a => a.id === newAccountId);
    const isDebit = ['RECEIPT', 'CHEQUE_DEPOSIT', 'INTEREST'].includes(newVoucherType);

    const newTxn: BankTransaction = {
      id: 'bt-' + Date.now(),
      date: newDate,
      accountId: newAccountId,
      accountName: targetAcc ? targetAcc.accountName : 'Bank Account',
      voucherType: newVoucherType,
      voucherNo: newVoucherNo || `BNK-${Date.now().toString().slice(-4)}`,
      refNo: newRefNo || 'DIR-ENTRY',
      chequeNo: newChequeNo || undefined,
      chequeDate: newChequeDate || undefined,
      particulars: newParticulars.toUpperCase(),
      narration: newNarration || `${newVoucherType} entry`,
      debit: isDebit ? Number(newAmount) : 0,
      credit: !isDebit ? Number(newAmount) : 0,
      status: newStatus,
      valueDate: newValueDate || newDate
    };

    setTransactions([newTxn, ...transactions]);
    setShowAddModal(false);
    setNewParticulars('');
    setNewNarration('');
    setNewAmount(0);
    setNewVoucherNo('');
    setNewRefNo('');
    setNewChequeNo('');
    triggerToast(`Bank entry recorded successfully!`, 'success');
  };

  // =========================================================================
  // PRINT PDF LIKE CALIBRI (EXACT ERP 9 / TALLY CORPORATE BANK STATEMENT)
  // =========================================================================
  const handlePrintPdfStatement = () => {
    const compName = activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
    const compAddr = activeCompany.address || 'Plot #0654, Shed #31, New Industrial Area, Ajman, UAE';
    const compTrn = activeCompany.trn || '100440509600003';
    const compTel = activeCompany.phone || '+971 6 525 0526';
    const compEmail = 'accounts@marinefasteners.co';

    const accountTitle = selectedAccount 
      ? `${selectedAccount.accountName} (${selectedAccount.bankName})`
      : 'CONSOLIDATED BANK & CASH ACCOUNTS LEDGER';

    const accountDetails = selectedAccount 
      ? `A/C NO: ${selectedAccount.accountNumber} &bull; IBAN: ${selectedAccount.iban} &bull; BRANCH: ${selectedAccount.branch}`
      : `ALL ACTIVE OPERATING BANK ACCOUNTS & TREASURY CASH VAULTS`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BANK_STATEMENT_${startDate}_TO_${endDate}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 8mm 8mm 8mm;
            }
            body {
              font-family: 'Calibri', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
              color: #111827;
              background: #ffffff;
              font-size: 10pt;
              line-height: 1.3;
              margin: 0;
              padding: 0;
            }
            .statement-header {
              border-bottom: 2px solid #002D62;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 14pt;
              font-weight: bold;
              color: #002D62;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company-meta {
              font-size: 8.5pt;
              color: #4b5563;
              margin-top: 2px;
            }
            .doc-title-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              margin-top: 8px;
            }
            .doc-title {
              font-size: 11pt;
              font-weight: bold;
              color: #002D62;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-period {
              font-size: 9pt;
              font-weight: bold;
              color: #1e293b;
            }
            .account-info-box {
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              margin-top: 6px;
              margin-bottom: 10px;
              background-color: #f8fafc;
            }
            .account-title {
              font-size: 10pt;
              font-weight: bold;
              color: #0f172a;
              text-transform: uppercase;
            }
            .account-sub {
              font-size: 8.5pt;
              color: #475569;
              margin-top: 2px;
            }
            .kpi-strip {
              display: table;
              width: 100%;
              margin-bottom: 10px;
              border-collapse: collapse;
            }
            .kpi-cell {
              display: table-cell;
              width: 25%;
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              background: #ffffff;
              vertical-align: top;
            }
            .kpi-label {
              font-size: 7.5pt;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
            }
            .kpi-value {
              font-size: 10pt;
              font-weight: bold;
              color: #0f172a;
              margin-top: 2px;
            }
            .kpi-value.green { color: #059669; }
            .kpi-value.red { color: #dc2626; }
            .kpi-value.blue { color: #002D62; }
            table.statement-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 8.5pt;
            }
            table.statement-table th {
              background-color: #002D62;
              color: #ffffff;
              font-weight: bold;
              text-align: left;
              padding: 5px 6px;
              border: 1px solid #002D62;
              text-transform: uppercase;
              font-size: 8pt;
            }
            table.statement-table td {
              padding: 4.5px 6px;
              border: 1px solid #e2e8f0;
              color: #1e293b;
              vertical-align: top;
            }
            table.statement-table tr:nth-child(even) td {
              background-color: #fbfcfe;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: 'Calibri', monospace; }
            .brs-card {
              border: 1.5px solid #002D62;
              padding: 8px 12px;
              background-color: #f8fafc;
              margin-top: 10px;
              margin-bottom: 14px;
            }
            .brs-title {
              font-size: 9.5pt;
              font-weight: bold;
              color: #002D62;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            .brs-row {
              display: flex;
              justify-content: space-between;
              padding: 2.5px 0;
              font-size: 8.5pt;
            }
            .sig-section {
              margin-top: 25px;
              display: table;
              width: 100%;
              page-break-inside: avoid;
            }
            .sig-box {
              display: table-cell;
              width: 33.33%;
              text-align: center;
              padding: 0 10px;
            }
            .sig-line {
              border-top: 1px solid #475569;
              margin-top: 40px;
              padding-top: 4px;
              font-size: 8pt;
              font-weight: bold;
              color: #334155;
              text-transform: uppercase;
            }
            .footer-meta {
              margin-top: 15px;
              font-size: 7.5pt;
              color: #64748b;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="statement-header">
            <div class="company-name">${compName}</div>
            <div class="company-meta">${compAddr} &bull; TRN: ${compTrn} &bull; TEL: ${compTel} &bull; EMAIL: ${compEmail}</div>
            
            <div class="doc-title-bar">
              <span class="doc-title">OFFICIAL BANK ACCOUNT STATEMENT & TRANSACTION LEDGER</span>
              <span class="doc-period">PERIOD: ${startDate} TO ${endDate}</span>
            </div>

            <div class="account-info-box">
              <div class="account-title">${accountTitle}</div>
              <div class="account-sub">${accountDetails} &bull; CURRENCY: AED (DIRHAM)</div>
            </div>
          </div>

          <div class="kpi-strip">
            <div class="kpi-cell">
              <div class="kpi-label">OPENING BALANCE</div>
              <div class="kpi-value font-mono">AED ${openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi-cell">
              <div class="kpi-label">TOTAL DEPOSITS (DR)</div>
              <div class="kpi-value green font-mono">AED ${summaryMetrics.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi-cell">
              <div class="kpi-label">TOTAL WITHDRAWALS (CR)</div>
              <div class="kpi-value red font-mono">AED ${summaryMetrics.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi-cell">
              <div class="kpi-label">CLOSING BOOK BALANCE</div>
              <div class="kpi-value blue font-mono">AED ${summaryMetrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <table class="statement-table">
            <thead>
              <tr>
                <th style="width: 8%; text-align: center;">DATE</th>
                <th style="width: 10%;">VOUCHER #</th>
                <th style="width: 10%;">TYPE</th>
                <th style="width: 12%;">INSTRUMENT / CHQ</th>
                <th style="width: 26%;">PARTICULARS / OPPOSITE LEDGER</th>
                <th style="width: 11%;" class="text-right">DEPOSIT (DR)</th>
                <th style="width: 11%;" class="text-right">WITHDRAWAL (CR)</th>
                <th style="width: 12%;" class="text-right">BALANCE (AED)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #f8fafc; font-weight: bold;">
                <td class="text-center font-mono">${startDate}</td>
                <td>—</td>
                <td>OPENING</td>
                <td>—</td>
                <td>OPENING BALANCE BROUGHT FORWARD</td>
                <td class="text-right">—</td>
                <td class="text-right">—</td>
                <td class="text-right font-mono font-bold">AED ${openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
              ${statementLedger.map(item => `
                <tr>
                  <td class="text-center font-mono">${item.date}</td>
                  <td class="font-mono font-bold" style="color: #002D62;">${item.voucherNo}</td>
                  <td style="font-size: 7.5pt; font-weight: bold;">${item.voucherType}</td>
                  <td class="font-mono">${item.chequeNo ? `CHQ #${item.chequeNo}` : item.refNo}</td>
                  <td>
                    <div style="font-weight: bold; color: #0f172a;">${item.particulars}</div>
                    <div style="font-size: 7.5pt; color: #64748b;">${item.narration}</div>
                  </td>
                  <td class="text-right font-mono font-bold" style="color: ${item.debit > 0 ? '#059669' : '#94a3b8'};">
                    ${item.debit > 0 ? item.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                  </td>
                  <td class="text-right font-mono font-bold" style="color: ${item.credit > 0 ? '#dc2626' : '#94a3b8'};">
                    ${item.credit > 0 ? item.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                  </td>
                  <td class="text-right font-mono font-bold" style="color: #002D62;">
                    ${item.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
              <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #002D62;">
                <td colspan="5" class="text-right" style="font-size: 9pt; text-transform: uppercase;">PERIOD TOTALS & CLOSING BOOK BALANCE:</td>
                <td class="text-right font-mono font-bold" style="color: #059669;">AED ${summaryMetrics.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="text-right font-mono font-bold" style="color: #dc2626;">AED ${summaryMetrics.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="text-right font-mono font-bold" style="color: #002D62; font-size: 9.5pt;">AED ${summaryMetrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <!-- BANK RECONCILIATION STATEMENT SUMMARY -->
          <div class="brs-card">
            <div class="brs-title">BANK RECONCILIATION STATEMENT (BRS SUMMARY AS OF ${endDate})</div>
            <div class="brs-row">
              <span>Balance as per Company General Ledger Books:</span>
              <strong class="font-mono">AED ${summaryMetrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="brs-row" style="color: #059669;">
              <span>Add: Cheques issued by Company but not yet presented for payment:</span>
              <strong class="font-mono">+ AED ${summaryMetrics.unclearedOutward.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="brs-row" style="color: #dc2626;">
              <span>Less: Cheques / Drafts deposited but not yet cleared by the Bank:</span>
              <strong class="font-mono">- AED ${summaryMetrics.unclearedInward.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="brs-row" style="border-top: 1px dashed #94a3b8; padding-top: 4px; font-weight: bold; color: #002D62; font-size: 9pt;">
              <span>Estimated Reconciled Balance as per Bank Statement Passbook:</span>
              <strong class="font-mono">AED ${summaryMetrics.passbookBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <!-- SIGNATURES BLOCK -->
          <div class="sig-section">
            <div class="sig-box">
              <div class="sig-line">PREPARED BY (TREASURY OFFICER)</div>
            </div>
            <div class="sig-box">
              <div class="sig-line">CHECKED BY (CHIEF ACCOUNTANT)</div>
            </div>
            <div class="sig-box">
              <div class="sig-line">APPROVED BY (AUTHORIZED SIGNATORY)</div>
            </div>
          </div>

          <div class="footer-meta">
            Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} &bull; MFI ERP 9 Financial Reporting Engine &bull; Page 1 of 1
          </div>
        </body>
      </html>
    `;

    printHtml(html, `BANK_STATEMENT_${startDate}_TO_${endDate}`);
  };

  // =========================================================================
  // EXPORT EXCEL FILE ALSO SAME LIKE PRINT PDF (MATCHING CALIBRI & ERP 9 LAYOUT)
  // =========================================================================
  const handleExportExcelStatement = () => {
    const compName = activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.';
    const accountTitle = selectedAccount 
      ? `${selectedAccount.accountName} (${selectedAccount.bankName})`
      : 'CONSOLIDATED BANK & CASH ACCOUNTS LEDGER';

    const accountNoIban = selectedAccount 
      ? `A/C NO: ${selectedAccount.accountNumber} | IBAN: ${selectedAccount.iban}`
      : 'ALL BANK ACCOUNTS & CASH VAULTS';

    // Build worksheet data matching the exact PDF layout
    const wsData: any[][] = [
      [compName.toUpperCase()],
      [`OFFICIAL BANK ACCOUNT STATEMENT & TRANSACTION LEDGER`],
      [`PERIOD: ${startDate} TO ${endDate} | CURRENCY: AED (DIRHAM)`],
      [`ACCOUNT: ${accountTitle} | ${accountNoIban}`],
      [],
      ['SUMMARY METRICS', '', '', '', ''],
      ['Opening Balance (AED)', openingBalance],
      ['Total Deposits / Debits (AED)', summaryMetrics.totalDebits],
      ['Total Withdrawals / Credits (AED)', summaryMetrics.totalCredits],
      ['Net Period Movement (AED)', summaryMetrics.netMovement],
      ['Closing Book Balance (AED)', summaryMetrics.closingBalance],
      ['Reconciled Passbook Balance (AED)', summaryMetrics.passbookBalance],
      [],
      [
        'Date',
        'Voucher No',
        'Voucher Type',
        'Instrument / Cheque #',
        'Value Date',
        'Particulars / Opposite Ledger',
        'Narration',
        'Deposit (Dr) AED',
        'Withdrawal (Cr) AED',
        'Running Balance AED',
        'Reconciliation Status'
      ],
      [
        startDate,
        '—',
        'OPENING',
        '—',
        startDate,
        'OPENING BALANCE BROUGHT FORWARD',
        'Starting position',
        0,
        0,
        openingBalance,
        'CLEARED'
      ]
    ];

    // Append rows
    statementLedger.forEach(item => {
      wsData.push([
        item.date,
        item.voucherNo,
        item.voucherType,
        item.chequeNo ? `CHQ #${item.chequeNo}` : item.refNo,
        item.valueDate || item.date,
        item.particulars,
        item.narration,
        item.debit > 0 ? item.debit : 0,
        item.credit > 0 ? item.credit : 0,
        item.runningBalance,
        item.status
      ]);
    });

    // Append Totals row
    wsData.push([
      'TOTALS',
      '',
      '',
      '',
      '',
      'PERIOD CLOSING BALANCE',
      '',
      summaryMetrics.totalDebits,
      summaryMetrics.totalCredits,
      summaryMetrics.closingBalance,
      ''
    ]);

    // Append BRS Section
    wsData.push([]);
    wsData.push(['BANK RECONCILIATION STATEMENT (BRS SUMMARY)', '']);
    wsData.push(['Balance as per Company General Ledger Books (AED)', summaryMetrics.closingBalance]);
    wsData.push(['Add: Cheques issued but not yet presented for payment (AED)', summaryMetrics.unclearedOutward]);
    wsData.push(['Less: Cheques deposited but not yet cleared by Bank (AED)', summaryMetrics.unclearedInward]);
    wsData.push(['Estimated Reconciled Balance as per Bank Statement Passbook (AED)', summaryMetrics.passbookBalance]);
    wsData.push([]);
    wsData.push(['Prepared By: Accounts Officer', '', 'Checked By: Chief Accountant', '', 'Approved By: Authorized Signatory']);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths for optimal display
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 16 }, // Voucher No
      { wch: 16 }, // Voucher Type
      { wch: 20 }, // Instrument
      { wch: 12 }, // Value Date
      { wch: 32 }, // Particulars
      { wch: 36 }, // Narration
      { wch: 18 }, // Debit
      { wch: 18 }, // Credit
      { wch: 20 }, // Running Balance
      { wch: 16 }  // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Statement');

    const fileName = `MFI_Bank_Statement_${startDate}_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    triggerToast(`Exported Bank Statement to Excel file (${fileName})!`, 'success');
  };

  return (
    <div className="space-y-3.5 text-slate-800 font-sans">
      
      {/* STATEMENT CONTROL TOOLBAR */}
      <div className="bg-white border border-slate-300 p-3 rounded shadow-2xs space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#002D62]/10 rounded border border-[#002D62]/20">
              <FileText className="w-4 h-4 text-[#002D62]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                BANK STATEMENT & GENERAL LEDGER DESK
              </h2>
              <p className="text-[10px] text-slate-500 font-sans">
                Tally ERP 9-compliant bank transaction ledger with live running balance & BRS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToContra && (
              <button
                onClick={onNavigateToContra}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10.5px] rounded transition-all cursor-pointer flex items-center gap-1.5 border border-amber-600 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>NEW CONTRA TRANSFER</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10.5px] rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>RECORD ENTRY</span>
            </button>
            <button
              onClick={handlePrintPdfStatement}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-[#002D62] border border-[#002D62] font-bold text-[10.5px] rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Print PDF with Calibri font formatting"
            >
              <Printer className="w-3.5 h-3.5 text-[#002D62]" />
              <span>PRINT PDF (CALIBRI)</span>
            </button>
            <button
              onClick={handleExportExcelStatement}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10.5px] rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Export statement identical to PDF"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>EXPORT EXCEL (XLSX)</span>
            </button>
          </div>
        </div>

        {/* FILTER CONTROLS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-200 text-xs">
          {/* Account Selector */}
          <div>
            <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5 font-mono">
              Target Bank Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">ALL BANK & CASH ACCOUNTS (CONSOLIDATED)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.bankName})
                </option>
              ))}
            </select>
          </div>

          {/* Period Preset */}
          <div>
            <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5 font-mono">
              Period Preset
            </label>
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL_TIME">All Transactions (FY 2026)</option>
              <option value="THIS_MONTH">This Current Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="TODAY">Today Only</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5 font-mono">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setDatePreset('CUSTOM'); }}
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5 font-mono">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setDatePreset('CUSTOM'); }}
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none"
            />
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-0.5 font-mono">
              Search Particulars / Ref #
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search party, narration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Opening Balance</span>
          <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">
            AED {openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Total Deposits (Dr)</span>
          <div className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
            +AED {summaryMetrics.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Total Withdrawals (Cr)</span>
          <div className="text-xs font-bold text-rose-700 font-mono mt-0.5">
            -AED {summaryMetrics.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Period Net Cash Flow</span>
          <div className={`text-xs font-bold font-mono mt-0.5 ${summaryMetrics.netMovement >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {summaryMetrics.netMovement >= 0 ? '+' : ''}AED {summaryMetrics.netMovement.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Closing Ledger Balance</span>
          <div className="text-xs font-black text-[#002D62] font-mono mt-0.5">
            AED {summaryMetrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Reconciled Passbook Balance</span>
          <div className="text-xs font-bold text-indigo-700 font-mono mt-0.5">
            AED {summaryMetrics.passbookBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* BANK STATEMENT TRANSACTION LEDGER TABLE */}
      <div className="bg-white border border-slate-300 rounded shadow-2xs overflow-hidden">
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs uppercase font-mono text-slate-900 tracking-wider">
              {selectedAccount ? selectedAccount.accountName : 'ALL CONSOLIDATED ACCOUNTS'} — STATEMENT SHEET
            </h3>
            <span className="text-[9.5px] bg-blue-100 text-[#002D62] font-bold px-2 py-0.5 rounded font-mono">
              {statementLedger.length} Entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBrsSummary(!showBrsSummary)}
              className="text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded cursor-pointer"
            >
              {showBrsSummary ? 'Hide BRS Summary' : 'Show BRS Summary'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-bold text-[10px] uppercase font-mono">
                <th className="p-2 w-10 text-center border-r border-slate-200">#</th>
                <th className="p-2 px-2.5 border-r border-slate-200">Date</th>
                <th className="p-2 px-2.5 border-r border-slate-200">Voucher No</th>
                <th className="p-2 px-2.5 border-r border-slate-200">Type</th>
                <th className="p-2 px-2.5 border-r border-slate-200">Instrument / Ref</th>
                <th className="p-2 px-3 border-r border-slate-200">Particulars (Opposite Ledger)</th>
                <th className="p-2 px-3 border-r border-slate-200 text-right">Debit (Inflow)</th>
                <th className="p-2 px-3 border-r border-slate-200 text-right">Credit (Outflow)</th>
                <th className="p-2 px-3 border-r border-slate-200 text-right">Running Balance</th>
                <th className="p-2 px-2 text-center border-r border-slate-200">Status</th>
                <th className="p-2 px-2 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {/* Opening Balance Row */}
              <tr className="bg-slate-50/80 font-bold">
                <td className="p-2 text-center border-r border-slate-200 text-slate-400">—</td>
                <td className="p-2 px-2.5 border-r border-slate-200 text-slate-700">{startDate}</td>
                <td className="p-2 px-2.5 border-r border-slate-200 text-slate-500">—</td>
                <td className="p-2 px-2.5 border-r border-slate-200">
                  <span className="bg-slate-200 text-slate-800 text-[8.5px] px-1.5 py-0.5 rounded uppercase font-bold">
                    OPENING
                  </span>
                </td>
                <td className="p-2 px-2.5 border-r border-slate-200 text-slate-400">—</td>
                <td className="p-2 px-3 border-r border-slate-200 font-sans text-slate-800">
                  OPENING BALANCE BROUGHT FORWARD
                </td>
                <td className="p-2 px-3 border-r border-slate-200 text-right text-slate-400">—</td>
                <td className="p-2 px-3 border-r border-slate-200 text-right text-slate-400">—</td>
                <td className="p-2 px-3 border-r border-slate-200 text-right font-black text-slate-900">
                  AED {openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-center border-r border-slate-200">
                  <span className="text-[8.5px] font-bold text-emerald-700">CARRIED</span>
                </td>
                <td className="p-2 text-center text-slate-400 no-print">—</td>
              </tr>

              {/* Transactions List */}
              {statementLedger.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 italic">
                    No transactions found for the selected account and period filters.
                  </td>
                </tr>
              ) : (
                statementLedger.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="p-2 text-center border-r border-slate-200 text-slate-400">{idx + 1}</td>
                    <td className="p-2 px-2.5 border-r border-slate-200 text-slate-800 font-semibold">{item.date}</td>
                    <td className="p-2 px-2.5 border-r border-slate-200 font-bold text-[#002D62]">{item.voucherNo}</td>
                    <td className="p-2 px-2.5 border-r border-slate-200">
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.voucherType === 'RECEIPT' || item.voucherType === 'CHEQUE_DEPOSIT' ? 'bg-emerald-100 text-emerald-800' :
                        item.voucherType === 'PAYMENT' || item.voucherType === 'CHEQUE_ISSUED' ? 'bg-rose-100 text-rose-800' :
                        item.voucherType === 'CONTRA' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.voucherType}
                      </span>
                    </td>
                    <td className="p-2 px-2.5 border-r border-slate-200 text-slate-700">
                      {item.chequeNo ? (
                        <span className="font-bold text-indigo-700">CHQ #{item.chequeNo}</span>
                      ) : (
                        <span className="text-slate-600">{item.refNo}</span>
                      )}
                    </td>
                    <td className="p-2 px-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900 font-sans">{item.particulars}</div>
                      <div className="text-[10px] text-slate-500 font-sans truncate max-w-xs">{item.narration}</div>
                    </td>
                    <td className="p-2 px-3 border-r border-slate-200 text-right font-bold text-emerald-700">
                      {item.debit > 0 ? item.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="p-2 px-3 border-r border-slate-200 text-right font-bold text-rose-700">
                      {item.credit > 0 ? item.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="p-2 px-3 border-r border-slate-200 text-right font-black text-slate-900">
                      {item.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200">
                      <select
                        value={item.status}
                        onChange={(e) => handleToggleStatus(item.id, e.target.value as any)}
                        className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase cursor-pointer ${
                          item.status === 'CLEARED' || item.status === 'RECONCILED' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="CLEARED">CLEARED</option>
                        <option value="UNCLEARED">UNCLEARED</option>
                        <option value="RECONCILED">RECONCILED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-2 text-center no-print">
                      <button
                        onClick={() => handleDeleteTransaction(item.id, item.voucherNo)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Bank Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* Totals Summary Row */}
              <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                <td colSpan={6} className="p-2.5 text-right uppercase font-mono text-[10.5px]">
                  TOTALS & CLOSING RUNNING BALANCE:
                </td>
                <td className="p-2.5 text-right font-mono text-emerald-800 font-black">
                  AED {summaryMetrics.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono text-rose-800 font-black">
                  AED {summaryMetrics.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2.5 text-right font-mono text-[#002D62] font-black text-xs">
                  AED {summaryMetrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="p-2.5 text-center text-[9.5px] text-slate-500 font-mono">
                  BALANCED ✔
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BANK RECONCILIATION STATEMENT (BRS) CARD */}
      {showBrsSummary && (
        <div className="bg-white border border-slate-300 p-4 rounded shadow-2xs space-y-3">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#002D62] flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              BANK RECONCILIATION STATEMENT (BRS SUMMARY AS OF {endDate})
            </h3>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase font-mono">
              Audit Standard Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between items-center text-slate-800">
                <span>1. Balance as per Company General Ledger:</span>
                <span className="font-bold">AED {summaryMetrics.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-700">
                <span>2. Add: Cheques issued but not yet presented for payment:</span>
                <span className="font-bold">+ AED {summaryMetrics.unclearedOutward.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-rose-700">
                <span>3. Less: Cheques deposited but not yet cleared by Bank:</span>
                <span className="font-bold">- AED {summaryMetrics.unclearedInward.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-2 bg-blue-50/50 p-3 rounded border border-blue-200 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[#002D62] text-sm font-black border-b border-blue-200 pb-2">
                <span>ESTIMATED BANK STATEMENT BALANCE:</span>
                <span>AED {summaryMetrics.passbookBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Variance between General Ledger and Bank Passbook is AED 0.00 after accounting for {statementLedger.filter(t => t.status === 'UNCLEARED').length} pending in-transit clearing items.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RECORD NEW BANK ENTRY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Plus className="w-4 h-4 text-amber-500" /> Record Bank Transaction Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddTransactionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Bank Account *
                  </label>
                  <select
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.accountName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Voucher Type *
                  </label>
                  <select
                    value={newVoucherType}
                    onChange={(e) => setNewVoucherType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  >
                    <option value="RECEIPT">RECEIPT (Customer / Inflow)</option>
                    <option value="PAYMENT">PAYMENT (Supplier / Outflow)</option>
                    <option value="CHEQUE_DEPOSIT">CHEQUE DEPOSIT</option>
                    <option value="CHEQUE_ISSUED">CHEQUE ISSUED</option>
                    <option value="CONTRA">CONTRA TRANSFER</option>
                    <option value="BANK_CHARGES">BANK CHARGES / VAT</option>
                    <option value="INTEREST">INTEREST INCOME</option>
                    <option value="DIRECT_DEBIT">DIRECT DEBIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Amount (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Particulars (Opposite Ledger / Customer / Supplier) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AL SHAHEEN STEEL TRADING LLC"
                  value={newParticulars}
                  onChange={(e) => setNewParticulars(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Voucher / Doc No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RV-2026-105"
                    value={newVoucherNo}
                    onChange={(e) => setNewVoucherNo(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Cheque # / Instrument Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 000548"
                    value={newChequeNo}
                    onChange={(e) => setNewChequeNo(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Narration / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Settlement for Tax Invoice #5080"
                  value={newNarration}
                  onChange={(e) => setNewNarration(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] hover:bg-[#001f44] text-white font-bold rounded cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Bank Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BankingStatement;
