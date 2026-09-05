import React, { useState, useEffect, useMemo } from 'react';
import { 
  Landmark, 
  CreditCard, 
  Plus, 
  Copy, 
  Check, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Building2, 
  Wallet, 
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Eye,
  Trash2,
  Edit3,
  Printer,
  Calendar,
  Clock,
  BookOpen,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  Settings,
  BarChart3
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile, updateCompany } from '../utils/companyProfile';
import { BankingStatement } from './banking/BankingStatement';
import { BankingStatistics } from './banking/BankingStatistics';

export interface BankAccountItem {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
  branch: string;
  currency: string;
  balance: number;
  isPrimary: boolean;
  type: 'CURRENT' | 'SAVINGS' | 'VAULT' | 'PETTY_CASH';
  notes?: string;
}

export interface ChequeRecord {
  id: string;
  chequeNo: string;
  bankName: string;
  issueDate: string;
  dueDate: string;
  payeeOrDrawer: string;
  amount: number;
  direction: 'INWARD' | 'OUTWARD';
  status: 'PENDING' | 'CLEARED' | 'BOUNCED' | 'POST_DATED' | 'CANCELLED';
  remarks?: string;
  relatedDocNo?: string;
}

interface BankAccountBoxProps {
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToContra?: () => void;
}

// Helper for Amount in Words (AED Dirhams)
const numberToWordsDirhams = (num: number): string => {
  if (isNaN(num) || num <= 0) return 'ZERO DIRHAMS ONLY';
  const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return 'ZERO';
    let result = '';
    if (n >= 1000000) {
      result += convertLessThanThousand(Math.floor(n / 1000000)) + ' MILLION ';
      n %= 1000000;
    }
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + ' THOUSAND ';
      n %= 1000;
    }
    if (n > 0) {
      result += convertLessThanThousand(n);
    }
    return result.trim();
  };

  const dirhams = Math.floor(num);
  const fils = Math.round((num - dirhams) * 100);

  let str = convert(dirhams) + ' DIRHAMS';
  if (fils > 0) {
    str += ' AND ' + convert(fils) + ' FILS';
  } else {
    str += ' ONLY';
  }
  return str;
};

export default function BankAccountBox({ triggerToast, onNavigateToContra }: BankAccountBoxProps) {
  // Active Banking Sub-Tab
  const [bankingSubTab, setBankingSubTab] = useState<'STATEMENT' | 'STATISTICS' | 'BANK_ACCOUNT' | 'CHEQUE_PRINTING' | 'CHEQUE_REGISTER' | 'POST_DATED_SUMMARY'>('STATEMENT');

  // Bank Accounts State
  const [accounts, setAccounts] = useState<BankAccountItem[]>(() => {
    const saved = localStorage.getItem('MF_BANK_ACCOUNTS');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }

    return [
      {
        id: 'bank-1',
        accountName: 'RAK Bank Corporate Current A/C',
        bankName: 'Ras Al Khaimah National Bank (RAKBANK)',
        accountNumber: '0242715908001',
        iban: 'AE940400000242715908001',
        swiftCode: 'RAKBAE3Axxx',
        branch: 'Ajman Main Branch, UAE',
        currency: 'AED',
        balance: 385000.00,
        isPrimary: true,
        type: 'CURRENT',
        notes: 'Primary operating account for client sales receipts & supplier transfers'
      },
      {
        id: 'bank-2',
        accountName: 'Mashreq Bank Industrial A/C',
        bankName: 'Mashreq Bank PSC',
        accountNumber: '019283746501',
        iban: 'AE120330000192837465012',
        swiftCode: 'MSHQAEADxxx',
        branch: 'Ajman Industrial Zone Branch',
        currency: 'AED',
        balance: 142500.00,
        isPrimary: false,
        type: 'CURRENT',
        notes: 'Secondary bank account for raw materials procurement'
      },
      {
        id: 'bank-3',
        accountName: 'Main Cash Vault Storage',
        bankName: 'Factory Main Secure Vault',
        accountNumber: 'VAULT-AJM-01',
        iban: 'N/A (PHYSICAL VAULT)',
        swiftCode: 'N/A',
        branch: 'Shed 31, New Industrial Area, Ajman',
        currency: 'AED',
        balance: 45000.00,
        isPrimary: false,
        type: 'VAULT',
        notes: 'On-site vault cash for daily manufacturing float'
      },
      {
        id: 'bank-4',
        accountName: 'Petty Cash Operating Float',
        bankName: 'Factory Petty Cash Office',
        accountNumber: 'PETTY-OFFICE-02',
        iban: 'N/A (PETTY FLOAT)',
        swiftCode: 'N/A',
        branch: 'Admin Office, Ajman',
        currency: 'AED',
        balance: 12500.00,
        isPrimary: false,
        type: 'PETTY_CASH',
        notes: 'Petty cash float for local dispatch freight & utility expenses'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('MF_BANK_ACCOUNTS', JSON.stringify(accounts));
  }, [accounts]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);

  // Active Company Profile
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());

  // Editable Header State
  const [headerCompanyName, setHeaderCompanyName] = useState(activeCompany.name);
  const [headerAddress, setHeaderAddress] = useState(activeCompany.address);
  const [headerPhone, setHeaderPhone] = useState(activeCompany.phone);
  const [headerTrn, setHeaderTrn] = useState(activeCompany.trn);
  const [headerSubtitle, setHeaderSubtitle] = useState(activeCompany.subtitle || '');

  useEffect(() => {
    const handleCompChange = (e: any) => {
      const comp = e.detail || getActiveCompany();
      setActiveCompany(comp);
      setHeaderCompanyName(comp.name);
      setHeaderAddress(comp.address);
      setHeaderPhone(comp.phone);
      setHeaderTrn(comp.trn);
      setHeaderSubtitle(comp.subtitle || '');
    };
    window.addEventListener('active_company_changed', handleCompChange);
    window.addEventListener('company_profile_updated', handleCompChange);
    return () => {
      window.removeEventListener('active_company_changed', handleCompChange);
      window.removeEventListener('company_profile_updated', handleCompChange);
    };
  }, []);

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyProfile = {
      ...activeCompany,
      name: headerCompanyName,
      address: headerAddress,
      phone: headerPhone,
      trn: headerTrn,
      subtitle: headerSubtitle
    };
    updateCompany(updated);
    setActiveCompany(updated);
    setShowHeaderModal(false);
    triggerToast('Bank account header details updated successfully!', 'success');
  };

  // Form State for Adding New Bank Account
  const [newAccName, setNewAccName] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newAccNo, setNewAccNo] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newSwift, setNewSwift] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newBalance, setNewBalance] = useState<number>(0);
  const [newType, setNewType] = useState<'CURRENT' | 'SAVINGS' | 'VAULT' | 'PETTY_CASH'>('CURRENT');

  // Form State for Editing Bank Account
  const [editingAccount, setEditingAccount] = useState<BankAccountItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccountItem | null>(null);
  const [chequeToDelete, setChequeToDelete] = useState<ChequeRecord | null>(null);
  const [editAccName, setEditAccName] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editAccNo, setEditAccNo] = useState('');
  const [editIban, setEditIban] = useState('');
  const [editSwift, setEditSwift] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editType, setEditType] = useState<'CURRENT' | 'SAVINGS' | 'VAULT' | 'PETTY_CASH'>('CURRENT');
  const [editIsPrimary, setEditIsPrimary] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEditAccount = (acc: BankAccountItem) => {
    setEditingAccount(acc);
    setEditAccName(acc.accountName);
    setEditBankName(acc.bankName);
    setEditAccNo(acc.accountNumber);
    setEditIban(acc.iban);
    setEditSwift(acc.swiftCode);
    setEditBranch(acc.branch);
    setEditBalance(acc.balance);
    setEditType(acc.type);
    setEditIsPrimary(acc.isPrimary);
    setEditNotes(acc.notes || '');
    setShowEditModal(true);
  };

  const handleSaveEditAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!editAccName || !editBankName) {
      triggerToast('Please provide Account Name and Bank Name', 'error');
      return;
    }

    const updatedList = accounts.map(a => {
      if (a.id === editingAccount.id) {
        return {
          ...a,
          accountName: editAccName,
          bankName: editBankName,
          accountNumber: editAccNo || 'N/A',
          iban: editIban || 'N/A',
          swiftCode: editSwift || 'N/A',
          branch: editBranch || 'Ajman Branch, UAE',
          balance: Number(editBalance) || 0,
          type: editType,
          isPrimary: editIsPrimary,
          notes: editNotes
        };
      }
      if (editIsPrimary) {
        return { ...a, isPrimary: false };
      }
      return a;
    });

    setAccounts(updatedList);
    setShowEditModal(false);
    setEditingAccount(null);
    triggerToast(`Bank account "${editAccName}" details updated successfully!`, 'success');
  };

  // =========================================================================
  // CHEQUE PRINTING STATE
  // =========================================================================
  const [chqBankTemplate, setChqBankTemplate] = useState('RAKBANK');
  const [chqPayeeName, setChqPayeeName] = useState('SABIC STEEL CORPORATION');
  const [chqDate, setChqDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [chqAmount, setChqAmount] = useState<number>(45000.00);
  const [chqChequeNo, setChqChequeNo] = useState('000542');
  const [chqIsCrossed, setChqIsCrossed] = useState(true);
  const [chqIsNotOver, setChqIsNotOver] = useState(true);
  const [chqNotOverAmount, setChqNotOverAmount] = useState<number>(50000.00);

  // =========================================================================
  // CHEQUE REGISTER & PDC STATE
  // =========================================================================
  const [cheques, setCheques] = useState<ChequeRecord[]>(() => {
    const saved = localStorage.getItem('MFI_CHEQUE_REGISTER');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'chq-101',
        chequeNo: '000541',
        bankName: 'Ras Al Khaimah National Bank (RAKBANK)',
        issueDate: '2026-08-01',
        dueDate: '2026-08-15',
        payeeOrDrawer: 'SABIC STEEL CORPORATION',
        amount: 45000.00,
        direction: 'OUTWARD',
        status: 'POST_DATED',
        remarks: 'PDC issued for raw coil shipment',
        relatedDocNo: 'PO-2026-0921'
      },
      {
        id: 'chq-102',
        chequeNo: '984120',
        bankName: 'Emirates NBD',
        issueDate: '2026-08-03',
        dueDate: '2026-08-20',
        payeeOrDrawer: 'DUBAI MARINE SERVICES LLC',
        amount: 32500.00,
        direction: 'INWARD',
        status: 'POST_DATED',
        remarks: 'Customer PDC received for Tax Invoice #5052',
        relatedDocNo: 'INV-5052'
      },
      {
        id: 'chq-103',
        chequeNo: '000539',
        bankName: 'Ras Al Khaimah National Bank (RAKBANK)',
        issueDate: '2026-07-28',
        dueDate: '2026-08-02',
        payeeOrDrawer: 'AJMAN GALVANIZING & COATING LLC',
        amount: 12800.00,
        direction: 'OUTWARD',
        status: 'CLEARED',
        remarks: 'Coating charges payment cleared',
        relatedDocNo: 'PV-8821'
      },
      {
        id: 'chq-104',
        chequeNo: '441092',
        bankName: 'Mashreq Bank',
        issueDate: '2026-08-04',
        dueDate: '2026-09-01',
        payeeOrDrawer: 'AL SHARQ TRANSPORTATION & FREIGHT',
        amount: 18500.00,
        direction: 'OUTWARD',
        status: 'POST_DATED',
        remarks: 'PDC for August freight charges',
        relatedDocNo: 'TRP-8812'
      },
      {
        id: 'chq-105',
        chequeNo: '772109',
        bankName: 'First Abu Dhabi Bank (FAB)',
        issueDate: '2026-08-05',
        dueDate: '2026-08-10',
        payeeOrDrawer: 'GULF METALS TRADING FZE',
        amount: 55000.00,
        direction: 'INWARD',
        status: 'PENDING',
        remarks: 'Customer advance cheque pending deposit',
        relatedDocNo: 'INV-5058'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('MFI_CHEQUE_REGISTER', JSON.stringify(cheques));
  }, [cheques]);

  const [chqFilterDirection, setChqFilterDirection] = useState<'ALL' | 'INWARD' | 'OUTWARD'>('ALL');
  const [chqFilterStatus, setChqFilterStatus] = useState<string>('ALL');
  const [showAddChequeModal, setShowAddChequeModal] = useState(false);

  // Add New Cheque state
  const [newChqNo, setNewChqNo] = useState('');
  const [newChqBank, setNewChqBank] = useState('Ras Al Khaimah National Bank (RAKBANK)');
  const [newChqIssueDate, setNewChqIssueDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newChqDueDate, setNewChqDueDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newChqPayee, setNewChqPayee] = useState('');
  const [newChqAmount, setNewChqAmount] = useState<number>(0);
  const [newChqDirection, setNewChqDirection] = useState<'INWARD' | 'OUTWARD'>('OUTWARD');
  const [newChqStatus, setNewChqStatus] = useState<'PENDING' | 'CLEARED' | 'BOUNCED' | 'POST_DATED' | 'CANCELLED'>('POST_DATED');
  const [newChqRemarks, setNewChqRemarks] = useState('');

  // Copy details helper
  const handleCopyDetails = (acc: BankAccountItem) => {
    const details = `BANK ACCOUNT DETAILS - ${(activeCompany.name || 'MARINE FASTENERS INDUSTRIES LLC').toUpperCase()}
Bank Name: ${acc.bankName}
Account Name: ${acc.accountName}
Account Number: ${acc.accountNumber}
IBAN: ${acc.iban}
SWIFT / BIC: ${acc.swiftCode}
Branch: ${acc.branch}
Currency: ${acc.currency}`;

    navigator.clipboard.writeText(details);
    setCopiedId(acc.id);
    triggerToast(`Bank details for ${acc.accountName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Print Bank Details Sheet
  const handlePrintBankDetails = (acc: BankAccountItem) => {
    const compName = activeCompany.name || 'Marine Fasteners Industries LLC';
    const compAddr = activeCompany.address || 'Industrial Area, Ajman, UAE';
    const compTrn = activeCompany.trn || '100440509600003';
    const compPhone = activeCompany.phone || '+971 6 525 0526';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeCompany.code || 'MFI'} Bank Account Information Sheet - ${acc.accountName}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: 'Arial MT', Arial, sans-serif; padding: 15px; color: #000000; font-size: 11px; margin: 0; }
            .header { border-bottom: 2px solid #000000; padding-bottom: 6px; margin-bottom: 12px; }
            .company { font-size: 15px; font-weight: bold; color: #000000; text-transform: uppercase; font-family: 'Arial MT Bold', Arial, sans-serif; }
            .sub { font-size: 9px; color: #333333; margin-top: 2px; }
            .card { border: 1.5px solid #000000; padding: 14px; background-color: #ffffff; }
            .title { font-size: 11.5px; font-weight: bold; color: #000000; margin-bottom: 10px; border-bottom: 1px solid #000000; padding-bottom: 5px; text-transform: uppercase; font-family: 'Arial MT Bold', Arial, sans-serif; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 10.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
            .label { font-weight: bold; color: #000000; width: 170px; text-transform: uppercase; }
            .value { font-weight: bold; color: #000000; font-family: monospace; flex: 1; }
            .footer { margin-top: 20px; font-size: 8px; color: #555555; text-align: center; border-top: 1px solid #000000; padding-top: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${compName}</div>
            <div class="sub">${compAddr} | TRN: ${compTrn} | TEL: ${compPhone}</div>
          </div>
          <div class="card">
            <div class="title">OFFICIAL BANK ACCOUNT REMITTANCE DETAILS</div>
            <div class="row"><span class="label">Beneficiary Name:</span><span class="value">${compName.toUpperCase()}</span></div>
            <div class="row"><span class="label">Account Description:</span><span class="value">${acc.accountName}</span></div>
            <div class="row"><span class="label">Banking Institution:</span><span class="value">${acc.bankName}</span></div>
            <div class="row"><span class="label">Account Number:</span><span class="value">${acc.accountNumber}</span></div>
            <div class="row"><span class="label">IBAN Number:</span><span class="value">${acc.iban}</span></div>
            <div class="row"><span class="label">SWIFT / BIC Code:</span><span class="value">${acc.swiftCode}</span></div>
            <div class="row"><span class="label">Branch Name:</span><span class="value">${acc.branch}</span></div>
            <div class="row"><span class="label">Account Currency:</span><span class="value">${acc.currency}</span></div>
          </div>
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} &bull; Official Remittance Information Sheet for ${compName}
          </div>
        </body>
      </html>
    `;
    printHtml(html, `${activeCompany.code || 'MFI'}_Bank_Details_${acc.accountName}`);
  };

  // Print Cheque Leaf Generator
  const handlePrintChequeLeaf = () => {
    const words = numberToWordsDirhams(chqAmount);
    const formattedDate = chqDate ? new Date(chqDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '') : 'DDMMYYYY';
    const compName = activeCompany.name || 'MARINE FASTENERS INDUSTRIES LLC';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeCompany.code || 'MFI'} Cheque Leaf Print - ${chqChequeNo}</title>
          <style>
            @page { size: 203mm 92mm landscape; margin: 0; }
            body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 10px; background: #fff; color: #000; font-weight: bold; }
            .cheque-box {
              width: 195mm;
              height: 85mm;
              border: 1.5px solid #334155;
              position: relative;
              padding: 15px;
              box-sizing: border-box;
              background-color: #f8fafc;
            }
            .cross-stamp {
              position: absolute;
              top: 15px;
              left: 15px;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 2px 10px;
              font-size: 11px;
              font-weight: 900;
              transform: rotate(-12deg);
              letter-spacing: 1px;
            }
            .bank-header {
              text-align: right;
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: 900;
              color: #0f172a;
            }
            .date-box {
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 14px;
              letter-spacing: 4px;
              border: 1px solid #94a3b8;
              padding: 3px 8px;
              background: #fff;
            }
            .payee-line {
              margin-top: 35px;
              font-size: 14px;
            }
            .words-line {
              margin-top: 15px;
              font-size: 12px;
              line-height: 1.6;
              max-width: 130mm;
            }
            .amount-box {
              position: absolute;
              top: 45mm;
              right: 20px;
              border: 2px solid #000;
              padding: 6px 12px;
              font-size: 16px;
              font-weight: 900;
              background: #fff;
            }
            .not-over-stamp {
              position: absolute;
              bottom: 25mm;
              left: 20px;
              font-size: 10px;
              color: #be123c;
              border: 1px dashed #be123c;
              padding: 2px 6px;
            }
            .sig-area {
              position: absolute;
              bottom: 12mm;
              right: 20px;
              text-align: center;
              font-size: 10px;
              width: 50mm;
              border-top: 1px solid #000;
              padding-top: 4px;
            }
            .micr-line {
              position: absolute;
              bottom: 3mm;
              left: 20mm;
              font-family: monospace;
              font-size: 13px;
              letter-spacing: 5px;
            }
          </style>
        </head>
        <body>
          <div class="cheque-box">
            ${chqIsCrossed ? '<div class="cross-stamp">A/C PAYEE ONLY</div>' : ''}
            <div class="bank-header">${chqBankTemplate === 'RAKBANK' ? 'RAS AL KHAIMAH NATIONAL BANK' : chqBankTemplate === 'MASHREQ' ? 'MASHREQ BANK PSC' : 'EMIRATES NBD'}</div>
            <div class="date-box">${formattedDate}</div>

            <div class="payee-line">
              <span>PAY : </span>
              <strong style="text-decoration: underline;">*** ${chqPayeeName.toUpperCase()} ***</strong>
            </div>

            <div class="words-line">
              <span>DIRHAMS : </span>
              <strong>*** ${words} ***</strong>
            </div>

            <div class="amount-box">
              AED **${chqAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**
            </div>

            ${chqIsNotOver ? `<div class="not-over-stamp">NOT OVER AED ${chqNotOverAmount.toLocaleString()} /-</div>` : ''}

            <div class="sig-area">
              FOR ${compName.toUpperCase()}<br/>
              <span style="font-size: 8px; font-weight: normal; color: #64748b;">AUTHORIZED SIGNATORY</span>
            </div>

            <div class="micr-line">
              ⑈${chqChequeNo}⑈  0242715908001⑈  0012026⑈ 10
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `Cheque_Print_${chqChequeNo}`);
  };

  // Add Bank Account Submit
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newBankName) {
      triggerToast('Please provide Account Name and Bank Name', 'error');
      return;
    }

    const newAcc: BankAccountItem = {
      id: `bank-${Date.now()}`,
      accountName: newAccName,
      bankName: newBankName,
      accountNumber: newAccNo || 'N/A',
      iban: newIban || 'N/A',
      swiftCode: newSwift || 'N/A',
      branch: newBranch || 'Ajman Branch, UAE',
      currency: 'AED',
      balance: Number(newBalance) || 0,
      isPrimary: accounts.length === 0,
      type: newType,
      notes: 'Added to MFI Bank Accounts Box'
    };

    setAccounts([...accounts, newAcc]);
    setShowAddModal(false);
    setNewAccName('');
    setNewBankName('');
    setNewAccNo('');
    setNewIban('');
    setNewSwift('');
    setNewBranch('');
    setNewBalance(0);
    triggerToast(`New bank account "${newAccName}" added successfully!`, 'success');
  };

  // Add New Cheque Record Submit
  const handleAddChequeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChqNo || !newChqPayee || newChqAmount <= 0) {
      triggerToast('Please provide Cheque No, Payee/Drawer and valid Amount.', 'error');
      return;
    }

    const rec: ChequeRecord = {
      id: 'chq-' + Date.now(),
      chequeNo: newChqNo,
      bankName: newChqBank,
      issueDate: newChqIssueDate,
      dueDate: newChqDueDate,
      payeeOrDrawer: newChqPayee.toUpperCase(),
      amount: Number(newChqAmount) || 0,
      direction: newChqDirection,
      status: newChqStatus,
      remarks: newChqRemarks || 'Filed via Cheque Register'
    };

    setCheques([rec, ...cheques]);
    setShowAddChequeModal(false);
    setNewChqNo('');
    setNewChqPayee('');
    setNewChqAmount(0);
    setNewChqRemarks('');
    triggerToast(`Filed Cheque #${newChqNo} in Cheque Register!`, 'success');
  };

  // Update Cheque Status
  const handleUpdateChequeStatus = (id: string, newStatus: ChequeRecord['status']) => {
    setCheques(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    triggerToast(`Updated Cheque status to ${newStatus}`, 'info');
  };

  // Delete account handlers
  const handleConfirmDeleteAccount = () => {
    if (!accountToDelete) return;
    const targetId = accountToDelete.id;
    const targetName = accountToDelete.accountName;
    setAccounts(prev => prev.filter(a => a.id !== targetId));
    setAccountToDelete(null);
    if (showEditModal && editingAccount?.id === targetId) {
      setShowEditModal(false);
      setEditingAccount(null);
    }
    triggerToast(`Bank account "${targetName}" removed successfully.`, 'info');
  };

  const handleDeleteAccount = (id: string, name: string) => {
    const target = accounts.find(a => a.id === id);
    if (target) {
      setAccountToDelete(target);
    } else {
      setAccounts(prev => prev.filter(a => a.id !== id));
      triggerToast(`Bank account ${name} removed.`, 'info');
    }
  };

  // Delete Cheque handler
  const handleConfirmDeleteCheque = () => {
    if (!chequeToDelete) return;
    const targetId = chequeToDelete.id;
    const targetNo = chequeToDelete.chequeNo;
    setCheques(prev => prev.filter(c => c.id !== targetId));
    setChequeToDelete(null);
    triggerToast(`Cheque #${targetNo} deleted from register.`, 'info');
  };

  // Total Liquid Funds
  const totalFunds = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => 
      a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.iban.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  // Filtered Cheques for Register
  const filteredCheques = useMemo(() => {
    return cheques.filter(c => {
      const matchDir = chqFilterDirection === 'ALL' || c.direction === chqFilterDirection;
      const matchStat = chqFilterStatus === 'ALL' || c.status === chqFilterStatus;
      const matchSearch = !searchTerm.trim() || 
        c.chequeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.payeeOrDrawer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bankName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDir && matchStat && matchSearch;
    });
  }, [cheques, chqFilterDirection, chqFilterStatus, searchTerm]);

  // Post Dated Cheques (PDC) Summary Calculations
  const pdcStats = useMemo(() => {
    const pdcList = cheques.filter(c => c.status === 'POST_DATED' || (new Date(c.dueDate) > new Date() && c.status === 'PENDING'));
    const pdcReceivables = pdcList.filter(c => c.direction === 'INWARD').reduce((sum, c) => sum + c.amount, 0);
    const pdcPayables = pdcList.filter(c => c.direction === 'OUTWARD').reduce((sum, c) => sum + c.amount, 0);
    
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const dueIn7Days = pdcList.filter(c => {
      const d = new Date(c.dueDate);
      return d >= today && d <= next7Days;
    }).reduce((sum, c) => sum + c.amount, 0);

    return {
      pdcList,
      pdcReceivables,
      pdcPayables,
      netExposure: pdcReceivables - pdcPayables,
      dueIn7Days,
      totalCount: pdcList.length
    };
  }, [cheques]);

  return (
    <div className="space-y-3.5 text-slate-800">
      
      {/* OFFICIAL CORPORATE REPORT HEADER BANNER */}
      <div className="bg-white border border-slate-300 p-4 shadow-xs rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-wide text-slate-900 font-sans uppercase">
              {activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.'}
            </h1>
            <button
              onClick={() => {
                setHeaderCompanyName(activeCompany.name);
                setHeaderAddress(activeCompany.address);
                setHeaderPhone(activeCompany.phone);
                setHeaderTrn(activeCompany.trn);
                setHeaderSubtitle(activeCompany.subtitle || '');
                setShowHeaderModal(true);
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[9.5px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-all"
              title="Add / Edit Company Header Details for Bank Accounts"
            >
              <Edit3 className="w-3 h-3 text-slate-600" />
              <span>EDIT HEADER</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
            {activeCompany.address ? `${activeCompany.address.toUpperCase()} | ` : ''}
            TEL: {activeCompany.phone || '+971 6 5250526'} | TRN: {activeCompany.trn || '100440509600003'}
          </p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-xs font-black text-[#002D62] uppercase tracking-wider font-mono bg-blue-50 px-2.5 py-1 border border-blue-200">
              BANK ACCOUNT & TREASURY CHEQUE REGISTER
            </span>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-600 space-y-1">
          <div className="bg-slate-100 border border-slate-300 px-3 py-1 font-bold text-slate-800 uppercase">
            AS OF DATE: {new Date().toISOString().split('T')[0]}
          </div>
          <div className="font-bold text-slate-700">CURRENCY: AED (DIRHAM)</div>
        </div>
      </div>

      {/* HEADER BANNER - SIMPLE NEUTRAL FITTED */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-200/80 rounded">
              <Landmark className="w-4 h-4 text-slate-700" />
            </div>
            <h1 className="text-xs font-bold tracking-wider uppercase font-mono text-slate-900">
              BANK ACCOUNT
            </h1>
            <span className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
              Treasury Hub
            </span>
          </div>
          <p className="text-[10.5px] text-slate-500">
            Central management of company current accounts, cheque printing, cheque register & post dated summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToContra && (
            <button
              onClick={onNavigateToContra}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10.5px] rounded transition-all cursor-pointer flex items-center gap-1.5 border border-amber-600 shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>NEW CONTRA TRANSFER</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[10.5px] rounded transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300 shadow-2xs"
          >
            <Plus className="w-3 h-3 text-slate-600" />
            <span>ADD BANK ACCOUNT</span>
          </button>
        </div>
      </div>

      {/* TOP BANKING SUB-TABS NAVIGATION BAR - CLEAN FITTED LIGHT */}
      <div className="bg-slate-100 border border-slate-200 p-1 rounded-md text-slate-800 flex flex-wrap items-center justify-between gap-1.5 no-print">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setBankingSubTab('STATEMENT')}
            className={`px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              bankingSubTab === 'STATEMENT' ? 'bg-[#002D62] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Statement (Ledger & BRS)
          </button>
          <button
            onClick={() => setBankingSubTab('STATISTICS')}
            className={`px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              bankingSubTab === 'STATISTICS' ? 'bg-[#002D62] text-white shadow-2xs' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" /> Statistics & Analytics
          </button>
          <button
            onClick={() => setBankingSubTab('BANK_ACCOUNT')}
            className={`px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              bankingSubTab === 'BANK_ACCOUNT' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-slate-600" /> Bank Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setBankingSubTab('CHEQUE_PRINTING')}
            className={`px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              bankingSubTab === 'CHEQUE_PRINTING' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" /> Cheque Printing
          </button>
          <button
            onClick={() => setBankingSubTab('CHEQUE_REGISTER')}
            className={`px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              bankingSubTab === 'CHEQUE_REGISTER' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" /> Cheque Register ({cheques.length})
          </button>
          <button
            onClick={() => setBankingSubTab('POST_DATED_SUMMARY')}
            className={`px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              bankingSubTab === 'POST_DATED_SUMMARY' ? 'bg-white text-slate-900 shadow-2xs border border-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" /> Post Dated Summary ({pdcStats.totalCount})
          </button>
        </div>

        <span className="text-[9.5px] font-mono font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300 uppercase">
          {activeCompany.shortName || activeCompany.name} Treasury
        </span>
      </div>

      {/* =========================================================================
          TAB: BANK STATEMENT & GENERAL LEDGER DESK
          ========================================================================= */}
      {bankingSubTab === 'STATEMENT' && (
        <BankingStatement
          accounts={accounts}
          activeCompany={activeCompany}
          triggerToast={triggerToast}
          onNavigateToContra={onNavigateToContra}
        />
      )}

      {/* =========================================================================
          TAB: BANKING STATISTICS & TREASURY ANALYTICS
          ========================================================================= */}
      {bankingSubTab === 'STATISTICS' && (
        <BankingStatistics
          accounts={accounts}
          cheques={cheques}
          activeCompany={activeCompany}
          triggerToast={triggerToast}
        />
      )}

      {/* =========================================================================
          TAB 1: BANK ACCOUNTS OVERVIEW
          ========================================================================= */}
      {bankingSubTab === 'BANK_ACCOUNT' && (
        <div className="space-y-3.5">
          {/* SUMMARY METRICS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono">Total Liquid Bank Funds</span>
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-base font-bold text-slate-900 font-mono">
                AED {totalFunds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                Sum across {accounts.length} registered accounts & cash vaults
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono">Primary Operational Bank</span>
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                RAKBANK Corporate A/C
              </div>
              <p className="text-[9.5px] text-slate-500 mt-0.5 font-mono">
                IBAN: AE94 0400 0002 4271 5908 001
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-2.5 rounded shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono">System Treasury Status</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>ALL ACCOUNTS COMPLIANT</span>
              </div>
              <p className="text-[9.5px] text-slate-400 mt-0.5 font-mono">
                Central Bank Audit Validated
              </p>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="bg-white border border-slate-200 p-2 rounded flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search by Bank, IBAN, Account No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border border-slate-300 rounded text-[11px] font-sans focus:outline-none focus:border-slate-500"
              />
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              Showing {filteredAccounts.length} of {accounts.length} Bank Accounts
            </div>
          </div>

          {/* BANK ACCOUNTS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAccounts.map((acc) => (
              <div 
                key={acc.id}
                className={`bg-white border rounded p-3.5 relative space-y-2.5 transition-all ${
                  acc.isPrimary ? 'border border-slate-400 shadow-2xs' : 'border-slate-200'
                }`}
              >
                {/* Card Top Banner */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-slate-900">{acc.accountName}</h3>
                      {acc.isPrimary && (
                        <span className="bg-emerald-100 text-emerald-800 text-[8.5px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                          PRIMARY A/C
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{acc.bankName}</p>
                    <p className="text-[9.5px] text-slate-400">{acc.branch}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[8.5px] font-mono text-slate-400 uppercase block">Current Balance</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      AED {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Account Credentials Table */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50/80 p-2.5 rounded border border-slate-200 font-mono">
                  <div>
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block">Account Number</span>
                    <span className="font-bold text-slate-800 select-all">{acc.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block">SWIFT / BIC Code</span>
                    <span className="font-bold text-slate-700">{acc.swiftCode}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60">
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block">IBAN Number</span>
                    <span className="font-bold text-slate-900 text-[11px] tracking-wider select-all block">{acc.iban}</span>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center justify-between pt-0.5 text-[10.5px]">
                  <button
                    onClick={() => handleCopyDetails(acc)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                  >
                    {copiedId === acc.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    <span>{copiedId === acc.id ? 'Copied!' : 'Copy Details'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                      title="Edit Bank Account Details & Balance"
                    >
                      <Edit3 className="w-3 h-3 text-amber-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handlePrintBankDetails(acc)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded flex items-center gap-1 transition-all cursor-pointer text-[10px]"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Print Info Sheet</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id, acc.accountName)}
                      className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer transition-colors"
                      title={`Remove ${acc.accountName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CHEQUE PRINTING ENGINE
          ========================================================================= */}
      {bankingSubTab === 'CHEQUE_PRINTING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT PANEL: CHEQUE CONFIGURATION FORM */}
          <div className="lg:col-span-5 bg-white border border-slate-300 p-5 rounded-lg shadow-2xs space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#002D62] flex items-center gap-1.5 font-mono">
                <Printer className="w-4 h-4 text-amber-500" /> Cheque Printing Parameters
              </h3>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase font-mono">
                UAE Bank Standard
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Bank Cheque Format
                </label>
                <select
                  value={chqBankTemplate}
                  onChange={(e) => setChqBankTemplate(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold text-slate-800 focus:outline-[#002D62]"
                >
                  <option value="RAKBANK">Ras Al Khaimah National Bank (RAKBANK)</option>
                  <option value="MASHREQ">Mashreq Bank PSC</option>
                  <option value="ENBD">Emirates NBD Corporate</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Payee Name (Pay to the order of)
                </label>
                <input
                  type="text"
                  value={chqPayeeName}
                  onChange={(e) => setChqPayeeName(e.target.value)}
                  placeholder="e.g. SABIC STEEL CORPORATION"
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Cheque Date
                  </label>
                  <input
                    type="date"
                    value={chqDate}
                    onChange={(e) => setChqDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Cheque No
                  </label>
                  <input
                    type="text"
                    value={chqChequeNo}
                    onChange={(e) => setChqChequeNo(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Amount in AED (Figures)
                </label>
                <input
                  type="number"
                  value={chqAmount || ''}
                  onChange={(e) => setChqAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 text-sm font-mono font-bold text-emerald-700"
                />
              </div>

              {/* Amount in words auto preview */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Auto-Generated Amount in Words:</span>
                <span className="text-[11px] font-bold text-slate-800 font-mono block mt-0.5">
                  *** {numberToWordsDirhams(chqAmount)} ***
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chqIsCrossed}
                    onChange={(e) => setChqIsCrossed(e.target.checked)}
                    className="rounded border-slate-300 text-[#002D62] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-700">Cross Cheque ("A/C PAYEE ONLY")</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chqIsNotOver}
                    onChange={(e) => setChqIsNotOver(e.target.checked)}
                    className="rounded border-slate-300 text-[#002D62] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-700">Print Limit Stamp ("NOT OVER AED...")</span>
                </label>

                {chqIsNotOver && (
                  <input
                    type="number"
                    value={chqNotOverAmount}
                    onChange={(e) => setChqNotOverAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Limit Amount"
                    className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono mt-1"
                  />
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePrintChequeLeaf}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider rounded cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Cheque Leaf Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE GRAPHIC CHEQUE PREVIEW */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-300 p-4 rounded-lg shadow-2xs">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-3">
                Live Cheque Graphic Alignment Preview (Actual Print Scale)
              </span>

              {/* Graphic Cheque Card */}
              <div className="border-2 border-slate-700 bg-[#fdfbf7] p-6 rounded-lg relative font-mono text-slate-900 shadow-md min-h-[260px] select-none">
                {/* Cross Stamp */}
                {chqIsCrossed && (
                  <div className="absolute top-4 left-6 border-t-2 border-b-2 border-slate-900 px-3 py-0.5 text-[10px] font-black -rotate-12 tracking-widest bg-white/80">
                    A/C PAYEE ONLY
                  </div>
                )}

                {/* Bank Header & Date */}
                <div className="flex justify-between items-start">
                  <div className="text-left font-sans pl-28">
                    <h4 className="font-black text-sm text-[#002D62] tracking-wider uppercase">
                      {chqBankTemplate === 'RAKBANK' ? 'RAS AL KHAIMAH NATIONAL BANK' : chqBankTemplate === 'MASHREQ' ? 'MASHREQ BANK PSC' : 'EMIRATES NBD'}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-bold block">Ajman Corporate Branch, United Arab Emirates</span>
                  </div>

                  <div className="border border-slate-800 bg-white px-3 py-1 font-mono font-bold text-sm tracking-widest shadow-2xs">
                    DATE: {chqDate ? new Date(chqDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '') : 'DDMMYYYY'}
                  </div>
                </div>

                {/* Payee Line */}
                <div className="mt-8 text-sm">
                  <span className="text-slate-500 font-sans font-bold">PAY TO THE ORDER OF : </span>
                  <strong className="text-slate-900 text-base underline decoration-slate-400 font-extrabold uppercase">
                    *** {chqPayeeName || 'PAYEE NAME'} ***
                  </strong>
                </div>

                {/* Words Line */}
                <div className="mt-4 text-xs max-w-lg leading-relaxed">
                  <span className="text-slate-500 font-sans font-bold">THE SUM OF DIRHAMS : </span>
                  <strong className="text-slate-900 font-bold uppercase">
                    *** {numberToWordsDirhams(chqAmount)} ***
                  </strong>
                </div>

                {/* Amount Box */}
                <div className="absolute bottom-16 right-6 border-2 border-slate-900 bg-white px-4 py-2 font-black text-lg text-emerald-800 shadow-xs">
                  AED **{chqAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**
                </div>

                {/* Limit Stamp */}
                {chqIsNotOver && (
                  <div className="absolute bottom-16 left-6 text-[10px] font-black text-rose-700 border border-dashed border-rose-600 px-2 py-0.5">
                    NOT OVER AED {chqNotOverAmount.toLocaleString()} /-
                  </div>
                )}

                {/* Signature Box */}
                <div className="absolute bottom-4 right-6 text-center border-t border-slate-900 w-48 pt-1 text-[9px] font-sans font-bold text-slate-600">
                  FOR {(activeCompany.name || 'COMPANY LLC').toUpperCase()}<br/>
                  <span className="text-[8px] font-normal text-slate-400">AUTHORIZED SIGNATORY</span>
                </div>

                {/* MICR Code Line */}
                <div className="absolute bottom-2 left-12 font-mono text-xs tracking-widest text-slate-700 select-all">
                  ⑈{chqChequeNo}⑈ 0242715908001⑈ 0012026⑈ 10
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CHEQUE REGISTER
          ========================================================================= */}
      {bankingSubTab === 'CHEQUE_REGISTER' && (
        <div className="space-y-4">
          {/* TOOLBAR & CONTROLS */}
          <div className="bg-white border border-slate-200 p-3 rounded-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={chqFilterDirection}
                onChange={(e) => setChqFilterDirection(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">ALL DIRECTIONS (IN & OUT)</option>
                <option value="OUTWARD">OUTWARD (PAID TO SUPPLIERS)</option>
                <option value="INWARD">INWARD (RECEIVED FROM CLIENTS)</option>
              </select>

              <select
                value={chqFilterStatus}
                onChange={(e) => setChqFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="POST_DATED">POST DATED (PDC)</option>
                <option value="PENDING">PENDING DEPOSIT</option>
                <option value="CLEARED">CLEARED</option>
                <option value="BOUNCED">BOUNCED / RETURNED</option>
              </select>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Cheque #, Payee, Bank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setShowAddChequeModal(true)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>FILE NEW CHEQUE</span>
            </button>
          </div>

          {/* CHEQUE REGISTER TABLE */}
          <div className="bg-white border border-slate-300 rounded-none overflow-x-auto shadow-2xs">
            <table className="w-full text-left font-sans text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold text-[10.5px] uppercase">
                  <th className="p-2 w-10 border-r border-slate-300 text-center">#</th>
                  <th className="p-2 px-3 border-r border-slate-300">Cheque No</th>
                  <th className="p-2 px-3 border-r border-slate-300">Bank Institution</th>
                  <th className="p-2 px-3 border-r border-slate-300">Issue Date</th>
                  <th className="p-2 px-3 border-r border-slate-300">Maturity Date</th>
                  <th className="p-2 px-3 border-r border-slate-300">Payee / Drawer Party</th>
                  <th className="p-2 px-3 border-r border-slate-300">Direction</th>
                  <th className="p-2 px-3 border-r border-slate-300 text-right">Amount (AED)</th>
                  <th className="p-2 px-3 border-r border-slate-300 text-center">Status</th>
                  <th className="p-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {filteredCheques.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                      No cheques found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCheques.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 text-center border-r border-slate-200 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="p-2 px-3 border-r border-slate-200 font-extrabold text-[#002D62] hover:underline cursor-pointer">{c.chequeNo}</td>
                      <td className="p-2 px-3 border-r border-slate-200 font-sans text-slate-800 truncate max-w-[160px]">{c.bankName}</td>
                      <td className="p-2 px-3 border-r border-slate-200 text-slate-700">{c.issueDate}</td>
                      <td className="p-2 px-3 border-r border-slate-200 font-bold text-rose-700">{c.dueDate}</td>
                      <td className="p-2 px-3 border-r border-slate-200 font-sans font-bold text-[#002D62] hover:underline cursor-pointer">{c.payeeOrDrawer}</td>
                      <td className="p-2 px-3 border-r border-slate-200">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          c.direction === 'OUTWARD' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {c.direction}
                        </span>
                      </td>
                      <td className="p-2 px-3 border-r border-slate-200 text-right font-black text-slate-900">
                        {c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 px-3 border-r border-slate-200 text-center">
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateChequeStatus(c.id, e.target.value as any)}
                          className={`text-[9.5px] font-bold px-2 py-1 rounded border uppercase ${
                            c.status === 'CLEARED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            c.status === 'POST_DATED' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            c.status === 'BOUNCED' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="POST_DATED">POST DATED</option>
                          <option value="PENDING">PENDING DEPOSIT</option>
                          <option value="CLEARED">CLEARED</option>
                          <option value="BOUNCED">BOUNCED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setChqChequeNo(c.chequeNo);
                              setChqPayeeName(c.payeeOrDrawer);
                              setChqAmount(c.amount);
                              setChqDate(c.dueDate);
                              setBankingSubTab('CHEQUE_PRINTING');
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded cursor-pointer"
                          >
                            Print Leaf
                          </button>
                          <button
                            onClick={() => setChequeToDelete(c)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer transition-colors"
                            title={`Delete Cheque #${c.chequeNo}`}
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
      )}

      {/* =========================================================================
          TAB 4: POST DATED SUMMARY (PDC)
          ========================================================================= */}
      {bankingSubTab === 'POST_DATED_SUMMARY' && (
        <div className="space-y-5">
          {/* PDC KPI SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-md shadow-2xs">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Total PDC Receivables</span>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                AED {pdcStats.pdcReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Inward Client Cheques</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-md shadow-2xs">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Total PDC Payables</span>
              <div className="text-xl font-black text-rose-700 font-mono mt-1">
                AED {pdcStats.pdcPayables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Outward Supplier Cheques</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-md shadow-2xs">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Net PDC Cash Exposure</span>
              <div className={`text-xl font-black font-mono mt-1 ${pdcStats.netExposure >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                AED {pdcStats.netExposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Net Treasury Liquidity Impact</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-md shadow-2xs">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase block">Maturing in Next 7 Days</span>
              <div className="text-xl font-black text-amber-600 font-mono mt-1">
                AED {pdcStats.dueIn7Days.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Immediate Clearance Target</span>
            </div>
          </div>

          {/* PDC CHRONOLOGICAL MATURITY SCHEDULE TABLE */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-xs uppercase text-[#002D62] flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-amber-500" /> Chronological Post Dated Cheques Clearance Schedule
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                Total PDC Active Items: {pdcStats.pdcList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold font-mono text-[10px] uppercase">
                    <th className="p-3">Maturity Date</th>
                    <th className="p-3">Days Remaining</th>
                    <th className="p-3">Cheque No</th>
                    <th className="p-3">Bank Institution</th>
                    <th className="p-3">Party Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-xs">
                  {pdcStats.pdcList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        No active post-dated cheques registered.
                      </td>
                    </tr>
                  ) : (
                    pdcStats.pdcList.map((c) => {
                      const today = new Date();
                      const dueDate = new Date(c.dueDate);
                      const diffTime = dueDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-rose-700">{c.dueDate}</td>
                          <td className="p-3 font-bold">
                            {diffDays < 0 ? (
                              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">OVERDUE ({Math.abs(diffDays)} DAYS)</span>
                            ) : diffDays === 0 ? (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-black animate-pulse">MATURING TODAY</span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">DUE IN {diffDays} DAYS</span>
                            )}
                          </td>
                          <td className="p-3 font-extrabold text-slate-900">{c.chequeNo}</td>
                          <td className="p-3 text-slate-700 truncate max-w-[150px] font-sans">{c.bankName}</td>
                          <td className="p-3 font-sans font-bold text-slate-900">{c.payeeOrDrawer}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                              c.direction === 'OUTWARD' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {c.direction}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">
                            {c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD BANK ACCOUNT
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Landmark className="w-4 h-4 text-amber-500" /> Add Corporate Bank Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Account Description Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. RAKBANK Operations Current A/C"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Bank / Vault Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ras Al Khaimah National Bank (RAKBANK)"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="0242715908001"
                    value={newAccNo}
                    onChange={(e) => setNewAccNo(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Opening Balance (AED)
                  </label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  IBAN Number (UAE Standard)
                </label>
                <input
                  type="text"
                  placeholder="AE940400000242715908001"
                  value={newIban}
                  onChange={(e) => setNewIban(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    placeholder="RAKBAE3Axxx"
                    value={newSwift}
                    onChange={(e) => setNewSwift(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Account Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                  >
                    <option value="CURRENT">Corporate Current</option>
                    <option value="SAVINGS">Savings Account</option>
                    <option value="VAULT">Physical Cash Vault</option>
                    <option value="PETTY_CASH">Petty Cash Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Branch Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ajman Main Branch, UAE"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
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
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Bank Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: FILE NEW CHEQUE RECORD
          ========================================================================= */}
      {showAddChequeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-[#002D62] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <BookOpen className="w-4 h-4 text-amber-500" /> File Cheque in Register
              </h3>
              <button
                onClick={() => setShowAddChequeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddChequeSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Cheque Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 000545"
                    value={newChqNo}
                    onChange={(e) => setNewChqNo(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Direction
                  </label>
                  <select
                    value={newChqDirection}
                    onChange={(e) => setNewChqDirection(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  >
                    <option value="OUTWARD">OUTWARD (Paid to Supplier)</option>
                    <option value="INWARD">INWARD (Received from Client)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Payee / Drawer Party Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. SABIC STEEL CORPORATION"
                  value={newChqPayee}
                  onChange={(e) => setNewChqPayee(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newChqIssueDate}
                    onChange={(e) => setNewChqIssueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Maturity / Due Date
                  </label>
                  <input
                    type="date"
                    value={newChqDueDate}
                    onChange={(e) => setNewChqDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={newChqBank}
                  onChange={(e) => setNewChqBank(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Amount (AED)
                  </label>
                  <input
                    type="number"
                    value={newChqAmount || ''}
                    onChange={(e) => setNewChqAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newChqStatus}
                    onChange={(e) => setNewChqStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  >
                    <option value="POST_DATED">POST DATED (PDC)</option>
                    <option value="PENDING">PENDING DEPOSIT</option>
                    <option value="CLEARED">CLEARED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Remarks / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. LPO-8812 Advance Payment"
                  value={newChqRemarks}
                  onChange={(e) => setNewChqRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChequeModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] hover:bg-[#001f44] text-white font-bold rounded cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>File Cheque Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CORPORATE HEADER MODAL */}
      {showHeaderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 border border-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#002D62]" />
                <h3 className="font-bold text-sm text-slate-800 uppercase">
                  Edit Bank Account & Corporate Header Details
                </h3>
              </div>
              <button
                onClick={() => setShowHeaderModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="mt-4 space-y-3 font-sans">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={headerCompanyName}
                  onChange={(e) => setHeaderCompanyName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Company Subtitle / Division
                </label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Registered Address
                </label>
                <input
                  type="text"
                  value={headerAddress}
                  onChange={(e) => setHeaderAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    TRN Number
                  </label>
                  <input
                    type="text"
                    value={headerTrn}
                    onChange={(e) => setHeaderTrn(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    Telephone / Fax
                  </label>
                  <input
                    type="text"
                    value={headerPhone}
                    onChange={(e) => setHeaderPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowHeaderModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Header Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BANK ACCOUNT MODAL */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-800 uppercase">
                  Edit Bank Account Details
                </h3>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingAccount(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAccount} className="mt-4 space-y-3 font-sans">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Account Name / Title *
                </label>
                <input
                  type="text"
                  value={editAccName}
                  onChange={(e) => setEditAccName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Account Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  >
                    <option value="CURRENT">Current Account</option>
                    <option value="SAVINGS">Savings Account</option>
                    <option value="VAULT">Main Safe Vault</option>
                    <option value="PETTY_CASH">Petty Cash Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={editAccNo}
                    onChange={(e) => setEditAccNo(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={editSwift}
                    onChange={(e) => setEditSwift(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  IBAN Number (UAE)
                </label>
                <input
                  type="text"
                  value={editIban}
                  onChange={(e) => setEditIban(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Branch / Location
                  </label>
                  <input
                    type="text"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Current Balance (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editBalance}
                    onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Notes / Usage Remarks
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Primary operating account..."
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsPrimary}
                    onChange={(e) => setEditIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Set as Primary Operating Account</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingAccount) {
                      setAccountToDelete(editingAccount);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Account</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingAccount(null); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Bank Account</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 border border-slate-300">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Delete Bank Account?
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  This operation removes the record permanently.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono mb-4 space-y-1">
              <div className="font-bold text-slate-900">{accountToDelete.accountName}</div>
              <div className="text-[11px] text-slate-600">{accountToDelete.bankName}</div>
              <div className="text-[10px] text-slate-500">A/C: {accountToDelete.accountNumber}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CHEQUE CONFIRMATION MODAL */}
      {chequeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 border border-slate-300">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Delete Cheque Record?
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Remove Cheque #{chequeToDelete.chequeNo} from the register.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono mb-4 space-y-1">
              <div className="font-bold text-slate-900">{chequeToDelete.payeeOrDrawer}</div>
              <div className="text-[11px] text-slate-600">Bank: {chequeToDelete.bankName}</div>
              <div className="text-[10px] text-slate-500">Amount: AED {chequeToDelete.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChequeToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCheque}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Cheque</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
