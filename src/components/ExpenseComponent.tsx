import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Printer, 
  Calendar, 
  Tag, 
  FileText, 
  X, 
  TrendingDown, 
  Coins, 
  CheckCircle2,
  DollarSign,
  Layers,
  ListFilter
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile, getCompanyIsoText } from '../utils/companyProfile';

export interface ExpenseVoucher {
  id: string;
  date: string;
  category: string;
  particular: string;
  voucherNo: string;
  amount: number;
  paymentMethod: string;
}

const INITIAL_EXPENSES: ExpenseVoucher[] = [
  { id: '1', date: '2026-07-10', category: 'Freight/ Transportation', particular: 'Logistics cargo charges - Al Naboodah Transports', voucherNo: 'EXP-2026-001', amount: 4850.00, paymentMethod: 'Bank Transfer' },
  { id: '2', date: '2026-07-12', category: 'Petty Cash', particular: 'Ajman factory daily pantry supplies & refreshments', voucherNo: 'EXP-2026-002', amount: 350.00, paymentMethod: 'Petty Cash' },
  { id: '3', date: '2026-07-13', category: 'Gov Fees / Legal Fees', particular: 'Ministry of Human Resources (MOHRE) visa renewal fee', voucherNo: 'EXP-2026-003', amount: 3750.00, paymentMethod: 'Bank Transfer' },
  { id: '4', date: '2026-07-14', category: 'Maintenance Charges', particular: 'Monthly CNC hydraulic threading machine maintenance', voucherNo: 'EXP-2026-004', amount: 1200.00, paymentMethod: 'Cheque' },
  { id: '5', date: '2026-07-15', category: 'Commission', particular: 'Sales agent incentive payout - Dubai Marine Region', voucherNo: 'EXP-2026-005', amount: 6500.00, paymentMethod: 'Bank Transfer' },
  { id: '6', date: '2026-07-16', category: 'Depreciation Expenses', particular: 'Monthly asset amortization - Production Line #3', voucherNo: 'EXP-2026-006', amount: 2800.00, paymentMethod: 'Journal Entry' }
];

const CATEGORIES = [
  'Petty Cash',
  'Freight/ Transportation',
  'Commission',
  'Gov Fees / Legal Fees',
  'Marketing Expenditure',
  'Leave & Annual Settlement',
  'Accommodation expenses',
  'Bill Payments',
  'Tools & Equipment Expenses',
  'Work Order / Jobwork Charges',
  'Other Operational Expenses',
  'Health & Medical Expenses',
  'Maintenance Charges',
  'Depreciation Expenses'
];

export const ExpenseComponent: React.FC = () => {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());

  // Sync active company from localStorage / events
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

  const [expenses, setExpenses] = useState<ExpenseVoucher[]>(() => {
    const saved = localStorage.getItem('MFI_EXPENSES');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('MFI_EXPENSE_CATEGORIES');
    return saved ? JSON.parse(saved) : [
      'Petty Cash',
      'Freight/ Transportation',
      'Commission',
      'Gov Fees / Legal Fees',
      'Marketing Expenditure',
      'Leave & Annual Settlement',
      'Accommodation expenses',
      'Bill Payments',
      'Tools & Equipment Expenses',
      'Work Order / Jobwork Charges',
      'Other Operational Expenses',
      'Health & Medical Expenses',
      'Maintenance Charges',
      'Depreciation Expenses'
    ];
  });

  const [showAddCategoryInline, setShowAddCategoryInline] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Sync categories with LocalStorage
  useEffect(() => {
    localStorage.setItem('MFI_EXPENSE_CATEGORIES', JSON.stringify(categories));
  }, [categories]);

  // Left Sidebar - selected active category filter
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Search/Filters State
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(() => categories[0] || 'Petty Cash');
  const [particular, setParticular] = useState('');
  const [voucherNo, setVoucherNo] = useState(() => `EXP-2026-${String(Math.floor(100 + Math.random() * 900))}`);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Petty Cash');

  // Preview Voucher State
  const [previewExpense, setPreviewExpense] = useState<ExpenseVoucher | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('MFI_EXPENSES', JSON.stringify(expenses));
    window.dispatchEvent(new Event('mfi_expenses_updated'));
    window.dispatchEvent(new Event('storage'));
  }, [expenses]);

  // When activeCategory changes, sync modal's category selection for convenience
  useEffect(() => {
    if (activeCategory !== 'ALL' && categories.includes(activeCategory)) {
      setCategory(activeCategory);
    }
  }, [activeCategory, categories]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    
    // Check for duplicates (case-insensitive)
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category already exists.');
      return;
    }

    setCategories([...categories, trimmed]);
    setNewCategoryName('');
    setShowAddCategoryInline(false);
  };

  const handlePrintCategoryLedger = (catName: string) => {
    // filter vouchers for this category
    const list = expenses.filter(item => {
      return catName === 'ALL' || item.category === catName;
    });

    const total = list.reduce((sum, item) => sum + item.amount, 0);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const rowsHtml = list.length === 0 
      ? `<tr><td colspan="6" style="text-align: center; padding: 15px; color: #64748b; font-style: italic;">No transaction records found for this ledger category.</td></tr>`
      : list.map((v, idx) => `
        <tr>
          <td style="text-align: center; font-family: monospace;">${idx + 1}</td>
          <td style="text-align: center; font-family: monospace;">${v.date}</td>
          <td style="font-weight: 650; color: #083c54; font-family: monospace; font-size: 8.5px;">${v.voucherNo}</td>
          <td style="font-weight: 500; font-size: 8.5px; line-height: 1.3;">
            <div style="font-weight: bold; color: #0f172a;">${v.particular}</div>
            <div style="font-size: 7.5px; color: #64748b; font-weight: bold; margin-top: 2px;">CATEGORY: ${v.category.toUpperCase()}</div>
          </td>
          <td style="text-align: center; font-size: 8px; font-weight: 600; text-transform: uppercase; color: #334155;">${v.paymentMethod}</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold; font-size: 9px;">AED ${v.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

    const html = `
      <html>
        <head>
          <title>Expense Ledger - ${catName === 'ALL' ? 'ALL CATEGORIES' : catName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 10mm 10mm 10mm;
            }
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 8.5px;
              line-height: 1.25;
            }
            .header-container {
              border-bottom: 1.5px solid #002D62;
              padding-bottom: 6px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-info {
              text-align: left;
            }
            .company-name {
              font-size: 11px;
              font-weight: 800;
              color: #002D62;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company-address {
              font-size: 7px;
              color: #475569;
              margin: 2px 0 0 0;
              font-weight: 500;
              line-height: 1.2;
              max-width: 420px;
            }
            .trn-badge {
              display: inline-block;
              margin-top: 3px;
              font-size: 7px;
              font-weight: 700;
              color: #0f172a;
              background: #f1f5f9;
              padding: 1px 4px;
              border: 0.5px solid #cbd5e1;
            }
            .document-title-box {
              text-align: right;
            }
            .document-title {
              font-size: 10px;
              font-weight: 800;
              color: #f37021;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .document-meta {
              font-size: 7px;
              color: #64748b;
              margin-top: 2px;
              font-family: monospace;
              font-weight: 600;
            }
            .ledger-summary-banner {
              background: #002D62;
              color: white;
              padding: 6px 10px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-left: 3px solid #f37021;
            }
            .summary-title {
              font-size: 8px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .summary-total {
              font-size: 10px;
              font-weight: 800;
              font-family: monospace;
              color: #f37021;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              font-family: monospace;
              font-size: 7.5px;
              font-weight: bold;
              text-transform: uppercase;
              padding: 4px 5px;
              border: 0.5px solid #334155;
              text-align: left;
            }
            td {
              padding: 4px 5px;
              border-bottom: 0.5px solid #e2e8f0;
              border-left: 0.5px solid #f1f5f9;
              border-right: 0.5px solid #f1f5f9;
              font-size: 7.5px;
              vertical-align: top;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .total-row {
              background-color: #f1f5f9 !important;
              font-weight: bold;
              border-top: 1.2px solid #002D62;
              border-bottom: 1.2px solid #002D62;
            }
            .total-row td {
              font-size: 8px;
              padding: 5px;
            }
            .signature-section {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              gap: 20px;
              page-break-inside: avoid;
            }
            .signature-box {
              flex: 1;
              border-top: 0.5px solid #94a3b8;
              text-align: center;
              padding-top: 3px;
              font-size: 7px;
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .footer-info {
              text-align: center;
              font-size: 6.5px;
              color: #94a3b8;
              margin-top: 20px;
              border-top: 0.5px solid #f1f5f9;
              padding-top: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="company-info">
              <h1 class="company-name">${activeCompany.name}</h1>
              <p class="company-address">
                ${activeCompany.address || 'Industrial Area, Ajman, United Arab Emirates.'}<br>
                Phone: ${activeCompany.phone || '+971 6 525 0526'} | Email: ${activeCompany.email || 'info@company.com'} | TRN: ${activeCompany.trn || '100440509600003'}
              </p>
              <div class="trn-badge">TRN: ${activeCompany.trn || '100440509600003'}</div>
            </div>
            
            <div class="document-title-box">
              <h2 class="document-title">Expense Ledger Report</h2>
              <div class="document-meta">
                Ledger Category: ${catName === 'ALL' ? 'ALL REGISTERED LEDGERS' : catName.toUpperCase()}<br>
                Generated On: ${dateStr}<br>
                Total Matches: ${list.length} Entries
              </div>
            </div>
          </div>

          <div class="ledger-summary-banner">
            <span class="summary-title">${activeCompany.code || 'MFI'} Ledger Statement Summary: ${catName === 'ALL' ? 'All Active Accounts' : catName}</span>
            <span class="summary-total">Total Outlay: AED ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center; border: 0.5px solid #334155;">S/L</th>
                <th style="width: 11%; text-align: center; border: 0.5px solid #334155;">Date</th>
                <th style="width: 15%; text-align: left; border: 0.5px solid #334155;">Voucher No</th>
                <th style="width: 42%; text-align: left; border: 0.5px solid #334155;">Particular / Transaction Narrative</th>
                <th style="width: 13%; text-align: center; border: 0.5px solid #334155;">Disbursement</th>
                <th style="width: 14%; text-align: right; border: 0.5px solid #334155;">Amount (AED)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Grand Total Ledger Balance:</td>
                <td style="text-align: center; font-weight: 800; text-transform: uppercase; font-size: 7.5px;">${list.length} Logs</td>
                <td style="text-align: right; font-family: monospace; font-weight: 900; color: #002D62;">AED ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="signature-section">
            <div class="signature-box">Compiled By (Finance Clerk)</div>
            <div class="signature-box">Checked By (Internal Auditor)</div>
            <div class="signature-box">Authorized Signatory (${activeCompany.shortName || activeCompany.name})</div>
          </div>

          <div class="footer-info">
            This is a system generated digital expense ledger from ${activeCompany.name} cloud workspace.
          </div>
        </body>
      </html>
    `;
    printHtml(html, `${activeCompany.code || 'EXP'}-Ledger-Statement-${catName.replace(/\s+/g, '-')}`);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!particular.trim() || !amount.trim() || !voucherNo.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    const newExpense: ExpenseVoucher = {
      id: String(Date.now()),
      date,
      category,
      particular: particular.trim(),
      voucherNo: voucherNo.trim(),
      amount: parsedAmount,
      paymentMethod
    };

    setExpenses([newExpense, ...expenses]);
    
    // Reset and Close
    setParticular('');
    setAmount('');
    setVoucherNo(`EXP-2026-${String(Math.floor(100 + Math.random() * 900))}`);
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this expense record?')) {
      setExpenses(expenses.filter(item => item.id !== id));
    }
  };

  // Filter & Search Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const matchesSearch = 
        item.particular.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [expenses, activeCategory, searchQuery]);

  // Totals & KPI Metrics
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // High-fidelity Voucher Printing using corporate theme
  const handlePrintVoucher = (v: ExpenseVoucher, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const html = `
      <html>
        <head>
          <title>${activeCompany.code || 'MFI'} Expense Voucher - ${v.voucherNo}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; background-color: #ffffff; }
            .border-wrap { border: 2px solid #083c54; padding: 30px; position: relative; }
            .header { border-bottom: 2px solid #083c54; padding-bottom: 15px; margin-bottom: 25px; text-align: center; }
            .company-name { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #083c54; margin: 0; }
            .company-sub { font-size: 11px; font-weight: 600; color: #64748b; margin-top: 4px; uppercase; letter-spacing: 0.5px; }
            .voucher-title { font-size: 16px; font-weight: 800; color: #f37021; margin: 12px 0 0 0; text-transform: uppercase; letter-spacing: 2px; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; font-size: 12px; }
            .detail-box { padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
            .label { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; margin-bottom: 4px; }
            .value { font-size: 12.5px; font-weight: 700; color: #083c54; font-family: monospace; }
            .value-std { font-size: 12.5px; font-weight: 700; color: #1e293b; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            .table th { background: #083c54; color: #ffffff; padding: 10px 12px; font-size: 10px; text-transform: uppercase; text-align: left; letter-spacing: 0.5px; }
            .table td { padding: 14px 12px; border-bottom: 1px solid #cbd5e1; font-size: 12px; }
            .amount-box { text-align: right; font-size: 16px; font-weight: 800; color: #083c54; margin-top: 15px; }
            .amount-val { background: #f8fafc; padding: 6px 14px; border: 1px solid #083c54; font-family: monospace; font-size: 15px; }
            .signatures { margin-top: 60px; display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 30px; }
            .sig-line { border-top: 1px solid #94a3b8; text-align: center; padding-top: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; }
          </style>
        </head>
        <body>
          <div class="border-wrap">
            <div class="header">
              <h1 class="company-name">${activeCompany.name}</h1>
              <div class="company-sub">TRN: ${activeCompany.trn || '100440509600003'} | ${activeCompany.address || 'AJMAN INDUSTRIAL AREA, UAE'}</div>
              <div class="voucher-title">Expense Payment Voucher</div>
            </div>
            
            <div class="details-grid">
              <div class="detail-box">
                <div class="label">Voucher Number</div>
                <div class="value">${v.voucherNo}</div>
              </div>
              <div class="detail-box">
                <div class="label">Disbursement Date</div>
                <div class="value-std">${v.date}</div>
              </div>
              <div class="detail-box">
                <div class="label">Expense Category</div>
                <div class="value-std" style="color: #f37021; text-transform: uppercase;">${v.category}</div>
              </div>
              <div class="detail-box">
                <div class="label">Settlement Mode</div>
                <div class="value-std">${v.paymentMethod}</div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th style="width: 75%;">Transaction Particulars / Narration / Payee Details</th>
                  <th style="width: 25%; text-align: right;">Amount Charged</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600; color: #1e293b; line-height: 1.6;">${v.particular}</td>
                  <td style="text-align: right; font-weight: 800; font-family: monospace; color: #083c54; font-size: 13px;">AED ${v.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <div class="amount-box">
              <span style="font-size: 11px; text-transform: uppercase; color: #475569; margin-right: 8px;">Total Debited:</span>
              <span class="amount-val">AED ${v.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div class="signatures">
              <div class="sig-line">Prepared By</div>
              <div class="sig-line">Finance Controller</div>
              <div class="sig-line">Managing Director</div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `Expense-Voucher-${v.voucherNo}`);
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen text-slate-800 p-0 space-y-6 box-shaped" id="expense-main-view">
      
      {/* Banner & Summary Header */}
      <div className="bg-white border border-[#A6C4DE] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-100 border border-slate-300 text-[#083c54]">
              <TrendingDown className="w-5 h-5" />
            </span>
            <h1 className="text-base font-bold text-[#002D62] uppercase tracking-tight">
              Operational Expenditures Hub
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">
            Track, categorize, and archive petty cash distributions, freight fees, and structural corporate payouts
          </p>
        </div>
        
        {/* Total Expense Summary Badge */}
        <div className="bg-[#083c54] text-white p-3 border border-[#05293a] flex items-center gap-4 min-w-[240px]">
          <span className="p-2 bg-slate-900 border border-white/10 text-[#f37021]">
            <Coins className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              Filtered Total Outlay
            </div>
            <div className="text-base font-mono font-bold text-[#f37021] mt-0.5">
              AED {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Categories Sidebar (redesigned with dynamic creation and ledger PDF print triggers) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white border border-[#A6C4DE] p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ListFilter className="w-3.5 h-3.5 text-[#002D62]" />
                <h2 className="text-[10px] font-bold text-[#002D62] uppercase tracking-wider">
                  Expense Categories
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryInline(!showAddCategoryInline)}
                className="p-1 text-[#002D62] hover:text-[#f37021] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                title="Add New Expense Category"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddCategoryInline && (
              <form onSubmit={handleCreateCategory} className="mb-3 p-3 bg-slate-50 border border-slate-250 space-y-2 rounded-xs">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">New Category Name:</div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Fees"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 text-[10.5px] rounded-none focus:border-[#f37021] focus:outline-none"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryInline(false)}
                    className="px-2 py-1 text-[9px] font-bold border border-slate-300 text-slate-600 hover:bg-slate-100 cursor-pointer uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[9px] font-bold bg-[#f37021] text-white hover:bg-orange-600 cursor-pointer uppercase"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
            
            <div className="flex flex-col border border-slate-200 overflow-hidden">
              {/* All Ledger Categories Row */}
              <div 
                className={`flex items-center justify-between px-3 py-2.5 text-[10.5px] uppercase tracking-wider font-semibold border-b border-slate-200 transition-all cursor-pointer ${
                  activeCategory === 'ALL'
                    ? 'bg-[#083c54] text-white font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setActiveCategory('ALL')}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs shrink-0">📁</span>
                  <span className="truncate">All Categories</span>
                </div>
                
                {/* Print PDF Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrintCategoryLedger('ALL');
                  }}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    activeCategory === 'ALL'
                      ? 'text-[#f37021] hover:bg-white/10 hover:text-white'
                      : 'text-slate-400 hover:text-[#f37021] hover:bg-slate-100'
                  }`}
                  title="Print All Categories Ledger PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Individual Category Rows */}
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <div
                    key={cat}
                    className={`flex items-center justify-between px-3 py-2 text-[10.5px] font-semibold border-b border-slate-200 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 border-l-3 border-l-[#f37021] text-slate-900'
                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Tag className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#f37021]' : 'text-slate-400'}`} />
                      <span className="truncate uppercase tracking-tight">{cat}</span>
                    </div>

                    {/* Print PDF Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintCategoryLedger(cat);
                      }}
                      className={`p-1 rounded transition-all cursor-pointer ${
                        isSelected
                          ? 'text-[#f37021] hover:bg-slate-200'
                          : 'text-slate-400 hover:text-[#f37021] hover:bg-slate-100'
                      }`}
                      title={`Print ${cat} Ledger PDF`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: "Expenses Box" Records Table (Matches requested visual structure) */}
        <div className="lg:col-span-9 space-y-4">
          
          <div className="bg-white border border-[#A6C4DE] p-5 space-y-4">
            
            {/* Table Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xs font-bold text-[#002D62] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#f37021]" />
                  Ledger Vouchers: {activeCategory === 'ALL' ? 'ALL CATEGORIES' : activeCategory}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  Showing {filteredExpenses.length} transaction vouchers matched
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative min-w-[200px] h-[28px]">
                  <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ledger particular..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 text-[11px] h-[28px]"
                  />
                </div>

                {/* Log New Expense Trigger */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-1.5 bg-[#002D62] text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:bg-opacity-90 h-[28px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </button>
              </div>
            </div>

            {/* Core Box-Shaped Expenses Table */}
            <div className="overflow-x-auto shadow-xs border border-[#A6C4DE]">
              <table className="box-shaped-table m-0 w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-mono uppercase text-[10px] tracking-wide">
                    <th className="py-2.5 px-3 text-center w-[8%] border border-slate-700">S/L</th>
                    <th className="py-2.5 px-3 text-center w-[12%] border border-slate-700">Date</th>
                    <th className="py-2.5 px-3 text-left w-[42%] border border-slate-700">Particular</th>
                    <th className="py-2.5 px-3 text-center w-[16%] border border-slate-700">Voucher No</th>
                    <th className="py-2.5 px-3 text-right w-[14%] border border-slate-700">Amounts</th>
                    <th className="py-2.5 px-3 text-center w-[8%] border border-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold uppercase text-[10px]">
                        No matching operational voucher entries found in this category
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-all border-b border-slate-200">
                        {/* S/L */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {v.date}
                        </td>

                        {/* Particular */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 tracking-tight leading-snug">
                            {v.particular}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block px-1.5 py-0.2 bg-slate-100 text-slate-600 font-bold text-[8.5px] uppercase border border-slate-200">
                              {v.category}
                            </span>
                            <span className="text-[8.5px] text-slate-400 font-mono font-semibold uppercase">
                              via {v.paymentMethod}
                            </span>
                          </div>
                        </td>

                        {/* Voucher No */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#083c54]">
                          {v.voucherNo}
                        </td>

                        {/* Amounts */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-[12px]">
                          AED {v.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Action with Preview & Print Icons */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Preview Icon */}
                            <button
                              type="button"
                              onClick={() => setPreviewExpense(v)}
                              className="p-1 hover:bg-slate-100 text-slate-600 hover:text-[#002D62] cursor-pointer"
                              title="Preview Voucher"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Print PDF Icon */}
                            <button
                              type="button"
                              onClick={(e) => handlePrintVoucher(v, e)}
                              className="p-1 hover:bg-slate-100 text-[#f37021] cursor-pointer"
                              title="Print Voucher PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Icon */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteExpense(v.id, e)}
                              className="p-1 hover:bg-red-50 text-red-650 hover:text-red-700 cursor-pointer"
                              title="Delete Record"
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

      </div>

      {/* Add Expense Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#083c54] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#083c54] text-white">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-slate-900 border border-white/10 text-[#f37021]">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Log Corporate Expense Entry
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Expense Disbursement Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-1 bg-white border border-slate-300 text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Voucher Number
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="EXP-2026-001"
                      value={voucherNo}
                      onChange={e => setVoucherNo(e.target.value)}
                      className="w-full pl-9 pr-3 py-1 bg-white border border-slate-300 font-mono font-bold text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Settlement Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 text-[11px] font-bold"
                  >
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Journal Entry">Journal Entry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Expense Ledger Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-1 bg-white border border-slate-300 text-[11px] font-bold"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Amount Charged (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1 text-[11px] font-bold text-slate-400">AED</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-11 pr-3 py-1 bg-white border border-slate-300 font-mono font-bold text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Particulars / Narrative Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide precise transaction log details..."
                  value={particular}
                  onChange={e => setParticular(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 text-[11px] font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 text-[11px] font-bold uppercase hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] text-white text-[11px] font-bold uppercase hover:bg-opacity-90 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Voucher Slip Preview Modal */}
      {previewExpense && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#083c54] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#083c54] text-white">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-slate-900 border border-white/10 text-[#f37021]">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                  Preview Voucher: {previewExpense.voucherNo}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setPreviewExpense(null)}
                className="text-white hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Slip Contents */}
            <div className="p-6 space-y-5">
              
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="font-extrabold uppercase tracking-wide text-slate-900 text-xs">
                  {activeCompany.name}
                </h3>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mt-0.5 font-bold">
                  TRN: {activeCompany.trn || '100440509600003'} | {activeCompany.address || 'Ajman, UAE'}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[8.5px] font-bold uppercase">
                  OFFICIAL EXPENSE VOUCHER
                </span>
              </div>

              {/* Grid values */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                    Voucher Number
                  </span>
                  <span className="font-mono font-bold text-[#083c54] text-sm">
                    {previewExpense.voucherNo}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                    Disbursed Date
                  </span>
                  <span className="font-bold text-slate-800">
                    {previewExpense.date}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                    Expense Category
                  </span>
                  <span className="font-bold text-[#f37021] uppercase">
                    {previewExpense.category}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                    Payment Method
                  </span>
                  <span className="font-bold text-slate-800">
                    {previewExpense.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Narration */}
              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="block text-[8px] uppercase font-bold text-slate-400 mb-1">
                  Particulars / Narration
                </span>
                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                  {previewExpense.particular}
                </p>
              </div>

              {/* Big amount box */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white">
                <div>
                  <span className="block text-[8px] uppercase font-bold text-slate-400">
                    Disbursed Amount
                  </span>
                  <span className="text-[9.5px] text-slate-300 font-semibold uppercase">
                    MFI Finance Debited
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-mono font-black text-[#f37021]">
                    AED {previewExpense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewExpense(null)}
                className="px-3 py-1 bg-white border border-slate-300 text-slate-600 text-[11px] font-bold uppercase hover:bg-slate-100 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePrintVoucher(previewExpense);
                  setPreviewExpense(null);
                }}
                className="px-3 py-1 bg-[#f37021] text-white hover:bg-opacity-90 text-[11px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
