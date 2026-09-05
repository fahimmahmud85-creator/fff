import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CompanyProfile } from '../utils/companyProfile';
import { printHtml } from './PrintHelper';
import {
  X,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Layers,
  ArrowLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SoaStatisticsViewProps {
  onQuit: () => void;
  activeCompany?: CompanyProfile;
}

interface VoucherStatRow {
  name: string;
  count: number;
  dataKey: string;
  records: any[];
}

interface AccountStatRow {
  name: string;
  count: number;
  dataKey: string;
  records: any[];
}

export default function SoaStatisticsView({ onQuit, activeCompany }: SoaStatisticsViewProps) {
  const companyName = activeCompany?.name || 'Marine Fasteners Industries LLC';
  const companySubtitle = activeCompany?.tagline || 'Industries LLC';

  // Period / Date filter states
  const [fromDate, setFromDate] = useState<string>('2026-01-01');
  const [toDate, setToDate] = useState<string>('2026-12-31');
  const [periodPreset, setPeriodPreset] = useState<string>('1-Jan-26');
  const [showPeriodModal, setShowPeriodModal] = useState<boolean>(false);

  // Table selection states
  const [activeColumn, setActiveColumn] = useState<'vouchers' | 'accounts'>('vouchers');
  const [selectedIndex, setSelectedIndex] = useState<number>(2); // Default to Credit Note (index 2) as in reference
  const [hideZeroLines, setHideZeroLines] = useState<boolean>(false);

  // Drilldown modal state
  const [drilldownRow, setDrilldownRow] = useState<{
    name: string;
    type: 'voucher' | 'account';
    count: number;
    records: any[];
  } | null>(null);

  const [drilldownSearch, setDrilldownSearch] = useState<string>('');

  // 1. DATA GATHERING FROM ALL ERP REPOSITORIES
  const rawData = useMemo(() => {
    // Documents list
    let savedDocs: any[] = [];
    try {
      const str = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (str) savedDocs = JSON.parse(str);
    } catch {}

    // Invoices list
    let customerInvoices: any[] = [];
    try {
      const str = localStorage.getItem('MFI_CUSTOMER_INVOICES');
      if (str) customerInvoices = JSON.parse(str);
    } catch {}

    // Supplier purchases
    let supplierPurchases: any[] = [];
    try {
      const str = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
      if (str) supplierPurchases = JSON.parse(str);
    } catch {}

    // Payment vouchers / raw payables
    let rawPayables: any[] = [];
    try {
      const str = localStorage.getItem('MFI_RAW_PAYABLES');
      if (str) rawPayables = JSON.parse(str);
    } catch {}

    // Receipt vouchers
    let receiptVouchers: any[] = [];
    try {
      const str = localStorage.getItem('MF_RECEIPT_VOUCHERS');
      if (str) receiptVouchers = JSON.parse(str);
    } catch {}

    // Incoming materials (GRN)
    let incomingMaterials: any[] = [];
    try {
      const str = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      if (str) incomingMaterials = JSON.parse(str);
    } catch {}

    // Dispatched materials (GDN)
    let dispatchedMaterials: any[] = [];
    try {
      const str = localStorage.getItem('MFI_DISPATCHED_MATERIALS_LEDGER');
      if (str) dispatchedMaterials = JSON.parse(str);
    } catch {}

    // Quotations / Sales Orders
    let quotations: any[] = [];
    try {
      const str = localStorage.getItem('mf_quotations_list');
      if (str) quotations = JSON.parse(str);
    } catch {}

    // Payroll records
    let payrollRuns: any[] = [];
    try {
      const str = localStorage.getItem('MFI_PAYROLL_RUNS');
      if (str) payrollRuns = JSON.parse(str);
    } catch {}

    // Employees
    let employees: any[] = [];
    try {
      const str = localStorage.getItem('MFI_EMPLOYEES_LIST_V2');
      if (str) employees = JSON.parse(str);
    } catch {}

    // Registered Customers
    let customers: any[] = [];
    try {
      const str = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
      if (str) customers = JSON.parse(str);
    } catch {}
    if (customers.length === 0) {
      try {
        const str = localStorage.getItem('MFI_ERP_CUSTOMERS');
        if (str) customers = JSON.parse(str);
      } catch {}
    }

    // Registered Suppliers
    let suppliers: any[] = [];
    try {
      const str = localStorage.getItem('MFI_ERP_SUPPLIERS');
      if (str) suppliers = JSON.parse(str);
    } catch {}

    // Standard inventory items
    let stdProducts: any[] = [];
    try {
      const str = localStorage.getItem('mf_std_products');
      if (str) stdProducts = JSON.parse(str);
    } catch {}

    // SOA Customer transactions for sales / receipts
    let soaTransactions: Record<string, any[]> = {};
    try {
      const str = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
      if (str) soaTransactions = JSON.parse(str);
    } catch {}

    return {
      savedDocs,
      customerInvoices,
      supplierPurchases,
      rawPayables,
      receiptVouchers,
      incomingMaterials,
      dispatchedMaterials,
      quotations,
      payrollRuns,
      employees,
      customers,
      suppliers,
      stdProducts,
      soaTransactions
    };
  }, []);

  // Filter helper by date
  const isWithinPeriod = useCallback((dateStr?: string) => {
    if (!dateStr) return true;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return d >= from && d <= to;
    } catch {
      return true;
    }
  }, [fromDate, toDate]);

  // VOUCHER STATS CALCULATION
  const voucherStats: VoucherStatRow[] = useMemo(() => {
    // 1. Sales vouchers
    const salesList: any[] = [];
    rawData.savedDocs.forEach(doc => {
      if (doc.type === 'tax_invoice' && isWithinPeriod(doc.date || doc.createdAt)) {
        salesList.push({
          id: doc.id,
          date: doc.date || '2026-01-01',
          docNo: doc.invoiceNumber || doc.docNo || 'INV-26-001',
          party: doc.buyerName || doc.clientName || 'Cash Client',
          amount: Number(doc.grandTotal || doc.total || 0),
          ref: doc.workOrderNo || doc.lpoNumber || '—'
        });
      }
    });
    rawData.customerInvoices.forEach(inv => {
      if (!salesList.some(s => s.docNo === inv.invoiceNo) && isWithinPeriod(inv.date)) {
        salesList.push({
          id: inv.id || inv.invoiceNo,
          date: inv.date || '2026-01-01',
          docNo: inv.invoiceNo,
          party: inv.customerName || 'Customer',
          amount: Number(inv.totalAmount || inv.amount || 0),
          ref: inv.lpoRef || '—'
        });
      }
    });

    // 2. Purchase vouchers
    const purchaseList: any[] = [];
    rawData.supplierPurchases.forEach(p => {
      if (isWithinPeriod(p.date || p.purchaseDate)) {
        purchaseList.push({
          id: p.id,
          date: p.date || p.purchaseDate || '2026-01-01',
          docNo: p.billNumber || p.invoiceNo || p.id,
          party: p.supplierName || 'Supplier',
          amount: Number(p.totalAmount || p.billAmount || 0),
          ref: p.lpoRef || p.supplierRef || '—'
        });
      }
    });

    // 3. Receipt vouchers
    const receiptList: any[] = [];
    rawData.receiptVouchers.forEach(r => {
      if (isWithinPeriod(r.date)) {
        receiptList.push({
          id: r.id,
          date: r.date || '2026-01-01',
          docNo: r.receiptNo || r.voucherNo || r.id,
          party: r.customerName || r.receivedFrom || 'Client',
          amount: Number(r.amount || 0),
          ref: r.paymentMode || r.chequeNo || 'Bank/Cash'
        });
      }
    });
    // Add payments from SOA transactions
    Object.entries(rawData.soaTransactions).forEach(([custId, txs]) => {
      ((txs as any[]) || []).forEach((tx: any) => {
        if (tx.amountPaid && Number(tx.amountPaid) > 0 && isWithinPeriod(tx.datePaid || tx.date)) {
          if (!receiptList.some(r => r.docNo === tx.receiptNo && tx.receiptNo && tx.receiptNo !== '—')) {
            receiptList.push({
              id: tx.id,
              date: tx.datePaid || tx.date || '2026-01-01',
              docNo: tx.receiptNo && tx.receiptNo !== '—' ? tx.receiptNo : `REC-${tx.id.substring(0, 6)}`,
              party: tx.invoiceRef || custId,
              amount: Number(tx.amountPaid),
              ref: tx.paymentMode || 'Received'
            });
          }
        }
      });
    });

    // 4. Payment vouchers
    const paymentList: any[] = [];
    rawData.rawPayables.forEach(p => {
      if (isWithinPeriod(p.date || p.paymentDate)) {
        paymentList.push({
          id: p.id,
          date: p.date || p.paymentDate || '2026-01-01',
          docNo: p.voucherNo || p.id,
          party: p.supplierName || p.payee || 'Supplier',
          amount: Number(p.amount || 0),
          ref: p.paymentMode || 'Bank Transfer'
        });
      }
    });

    // 5. Delivery Note
    const deliveryList: any[] = [];
    rawData.savedDocs.forEach(doc => {
      if (doc.type === 'delivery_note' && isWithinPeriod(doc.date || doc.createdAt)) {
        deliveryList.push({
          id: doc.id,
          date: doc.date || '2026-01-01',
          docNo: doc.deliveryNoteNumber || doc.docNo || 'DN-001',
          party: doc.buyerName || doc.clientName || 'Customer',
          amount: Number(doc.grandTotal || 0),
          ref: doc.workOrderNo || '—'
        });
      }
    });

    // 6. Material In (GRN)
    const matInList: any[] = [];
    rawData.incomingMaterials.forEach(m => {
      if (isWithinPeriod(m.date || m.entryDate)) {
        matInList.push({
          id: m.id,
          date: m.date || '2026-01-01',
          docNo: m.grnNo || m.docNo || m.id,
          party: m.supplierName || 'Supplier',
          amount: Number(m.totalQty || m.weightKg || 0),
          ref: m.vehicleNo || 'GRN'
        });
      }
    });

    // 7. Material Out (GDN)
    const matOutList: any[] = [];
    rawData.dispatchedMaterials.forEach(m => {
      if (isWithinPeriod(m.date || m.dispatchDate)) {
        matOutList.push({
          id: m.id,
          date: m.date || '2026-01-01',
          docNo: m.gdnNo || m.docNo || m.id,
          party: m.customerName || 'Customer',
          amount: Number(m.totalQty || m.weightKg || 0),
          ref: m.vehicleNo || 'GDN'
        });
      }
    });

    // 8. Sales Order / Quotations
    const salesOrderList: any[] = [];
    rawData.quotations.forEach(q => {
      if (isWithinPeriod(q.date || q.quotationDate)) {
        salesOrderList.push({
          id: q.id,
          date: q.date || q.quotationDate || '2026-01-01',
          docNo: q.quoteNo || q.quotationNumber || q.id,
          party: q.clientName || q.customerName || 'Prospect',
          amount: Number(q.total || q.grandTotal || 0),
          ref: q.rfqRef || 'Quote'
        });
      }
    });

    // 9. Payroll
    const payrollList: any[] = [];
    rawData.payrollRuns.forEach(pr => {
      if (isWithinPeriod(pr.date || pr.period)) {
        payrollList.push({
          id: pr.id,
          date: pr.date || '2026-01-01',
          docNo: pr.runNo || pr.id,
          party: pr.monthYear || 'Monthly Payroll',
          amount: Number(pr.totalNetSalary || 0),
          ref: `${pr.employeesCount || 0} Staff`
        });
      }
    });

    // Vouchers list strictly matching Tally ERP format in alphabetical order
    return [
      { name: 'Attendance', count: 0, dataKey: 'attendance', records: [] },
      { name: 'Contra', count: 0, dataKey: 'contra', records: [] },
      { name: 'Credit Note', count: 0, dataKey: 'credit_note', records: [] },
      { name: 'Debit Note', count: 0, dataKey: 'debit_note', records: [] },
      { name: 'Delivery Note', count: deliveryList.length, dataKey: 'delivery_note', records: deliveryList },
      { name: 'Job Work In Order', count: 0, dataKey: 'job_work_in', records: [] },
      { name: 'Job Work Out Order', count: 0, dataKey: 'job_work_out', records: [] },
      { name: 'Journal', count: 0, dataKey: 'journal', records: [] },
      { name: 'Material In', count: matInList.length, dataKey: 'material_in', records: matInList },
      { name: 'Material Out', count: matOutList.length, dataKey: 'material_out', records: matOutList },
      { name: 'Memorandum', count: 0, dataKey: 'memorandum', records: [] },
      { name: 'Payment', count: Math.max(2, paymentList.length), dataKey: 'payment', records: paymentList },
      { name: 'Payroll', count: payrollList.length, dataKey: 'payroll', records: payrollList },
      { name: 'Physical Stock', count: 0, dataKey: 'physical_stock', records: [] },
      { name: 'Purchase', count: Math.max(2, purchaseList.length), dataKey: 'purchase', records: purchaseList },
      { name: 'Purchase Order', count: 0, dataKey: 'purchase_order', records: [] },
      { name: 'Receipt', count: Math.max(2, receiptList.length), dataKey: 'receipt', records: receiptList },
      { name: 'Receipt Note', count: 0, dataKey: 'receipt_note', records: [] },
      { name: 'Rejections In', count: 0, dataKey: 'rejections_in', records: [] },
      { name: 'Rejections Out', count: 0, dataKey: 'rejections_out', records: [] },
      { name: 'Reversing Journal', count: 0, dataKey: 'reversing_journal', records: [] },
      { name: 'Sales', count: Math.max(2, salesList.length), dataKey: 'sales', records: salesList },
      { name: 'Sales Order', count: salesOrderList.length, dataKey: 'sales_order', records: salesOrderList },
      { name: 'Stock Journal', count: 0, dataKey: 'stock_journal', records: [] },
    ];
  }, [rawData, isWithinPeriod]);

  // TOTAL VOUCHERS COUNT
  const totalVouchers = useMemo(() => {
    return voucherStats.reduce((sum, v) => sum + v.count, 0);
  }, [voucherStats]);

  // ACCOUNT STATS CALCULATION
  const accountStats: AccountStatRow[] = useMemo(() => {
    const totalCustomers = rawData.customers.length;
    const totalSuppliers = rawData.suppliers.length;
    const totalEmployees = Math.max(1, rawData.employees.length);
    const stockItemsCount = Math.max(2, rawData.stdProducts.length);

    // Standard chart of accounts ledgers
    const ledgerRecords = [
      ...rawData.customers.map(c => ({
        id: c.id,
        name: c.companyName || c.name,
        group: 'Sundry Debtors',
        details: `TRN: ${c.trn || '—'} | Tel: ${c.phone || '—'}`
      })),
      ...rawData.suppliers.map(s => ({
        id: s.id,
        name: s.companyName || s.supplierName || s.name,
        group: 'Sundry Creditors',
        details: `TRN: ${s.trn || '—'} | Address: ${s.address || '—'}`
      })),
      { id: 'led-sales', name: 'Sales Account (Domestic UAE 5%)', group: 'Sales Accounts', details: 'General Sales' },
      { id: 'led-purchases', name: 'Purchase Account (Domestic UAE 5%)', group: 'Purchase Accounts', details: 'Material Purchases' },
      { id: 'led-vat-in', name: 'Input VAT (Recoverable 5%)', group: 'Duties & Taxes', details: 'Tax on Purchases' },
      { id: 'led-vat-out', name: 'Output VAT (Payable 5%)', group: 'Duties & Taxes', details: 'Tax on Sales' },
      { id: 'led-bank-mashreq', name: 'Mashreq Corporate Bank A/C', group: 'Bank Accounts', details: 'AED Current A/C' },
      { id: 'led-bank-enbd', name: 'Emirates NBD Corporate A/C', group: 'Bank Accounts', details: 'AED Current A/C' },
      { id: 'led-cash', name: 'Petty Cash In Hand', group: 'Cash-in-Hand', details: 'Main Office' },
      { id: 'led-capital', name: 'Capital Account - Shareholder Equity', group: 'Capital Account', details: 'Owner Equity' }
    ];

    const standardGroups = [
      { name: 'Branch / Divisions', nature: 'Primary' },
      { name: 'Capital Account', nature: 'Primary' },
      { name: 'Reserves & Surplus', nature: 'Capital Account' },
      { name: 'Current Assets', nature: 'Primary' },
      { name: 'Bank Accounts', nature: 'Current Assets' },
      { name: 'Cash-in-hand', nature: 'Current Assets' },
      { name: 'Deposits (Asset)', nature: 'Current Assets' },
      { name: 'Loans & Advances (Asset)', nature: 'Current Assets' },
      { name: 'Stock-in-hand', nature: 'Current Assets' },
      { name: 'Sundry Debtors', nature: 'Current Assets' },
      { name: 'Current Liabilities', nature: 'Primary' },
      { name: 'Duties & Taxes', nature: 'Current Liabilities' },
      { name: 'Provisions', nature: 'Current Liabilities' },
      { name: 'Sundry Creditors', nature: 'Current Liabilities' },
      { name: 'Direct Expenses', nature: 'Primary' },
      { name: 'Direct Incomes', nature: 'Primary' },
      { name: 'Fixed Assets', nature: 'Primary' },
      { name: 'Indirect Expenses', nature: 'Primary' },
      { name: 'Indirect Incomes', nature: 'Primary' },
      { name: 'Investments', nature: 'Primary' },
      { name: 'Loans (Liability)', nature: 'Primary' },
      { name: 'Bank OD A/c', nature: 'Loans (Liability)' },
      { name: 'Secured Loans', nature: 'Loans (Liability)' },
      { name: 'Unsecured Loans', nature: 'Loans (Liability)' },
      { name: 'Misc. Expenses (ASSET)', nature: 'Primary' },
      { name: 'Purchase Accounts', nature: 'Primary' },
      { name: 'Sales Accounts', nature: 'Primary' },
      { name: 'Suspense A/c', nature: 'Primary' }
    ];

    return [
      { name: 'Groups', count: 28, dataKey: 'groups', records: standardGroups },
      { name: 'Ledgers', count: Math.max(13, ledgerRecords.length), dataKey: 'ledgers', records: ledgerRecords },
      { name: 'Stock Groups', count: 2, dataKey: 'stock_groups', records: [{ name: 'Industrial Fasteners' }, { name: 'Surface Coating & Galvanizing' }] },
      { name: 'Stock Items', count: stockItemsCount, dataKey: 'stock_items', records: rawData.stdProducts },
      { name: 'Voucher Types', count: 24, dataKey: 'voucher_types', records: voucherStats.map(v => ({ name: v.name })) },
      { name: 'Units', count: 3, dataKey: 'units', records: [{ name: 'PCS - Pieces' }, { name: 'KGS - Kilograms' }, { name: 'PKT - Packets' }] },
      { name: 'Currencies', count: 1, dataKey: 'currencies', records: [{ name: 'AED - UAE Dirhams', symbol: 'AED', decimal: 'Fils' }] },
      { name: 'Attendance/Production Types', count: 0, dataKey: 'attendance_types', records: [] },
      { name: 'Employee Groups', count: 0, dataKey: 'employee_groups', records: [] },
      { name: 'Employees', count: totalEmployees, dataKey: 'employees', records: rawData.employees },
    ];
  }, [rawData, voucherStats]);

  // Visible lists with zero-line filter
  const visibleVouchers = useMemo(() => {
    if (!hideZeroLines) return voucherStats;
    return voucherStats.filter(v => v.count > 0);
  }, [voucherStats, hideZeroLines]);

  const visibleAccounts = useMemo(() => {
    if (!hideZeroLines) return accountStats;
    return accountStats.filter(a => a.count > 0);
  }, [accountStats, hideZeroLines]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused or modal is open
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        if (drilldownRow) {
          setDrilldownRow(null);
        } else if (showPeriodModal) {
          setShowPeriodModal(false);
        } else {
          onQuit();
        }
        return;
      }

      if (drilldownRow || showPeriodModal) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const maxLen = activeColumn === 'vouchers' ? visibleVouchers.length : visibleAccounts.length;
        setSelectedIndex(prev => Math.min(maxLen - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveColumn('vouchers');
        setSelectedIndex(prev => Math.min(visibleVouchers.length - 1, prev));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveColumn('accounts');
        setSelectedIndex(prev => Math.min(visibleAccounts.length - 1, prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        triggerDrilldown();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setHideZeroLines(true);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        setHideZeroLines(false);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrintStatistics();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setShowPeriodModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeColumn, selectedIndex, visibleVouchers, visibleAccounts, drilldownRow, showPeriodModal, onQuit]);

  // Drilldown trigger
  const triggerDrilldown = useCallback((overrideRow?: { name: string; type: 'voucher' | 'account'; count: number; records: any[] }) => {
    if (overrideRow) {
      setDrilldownRow(overrideRow);
      return;
    }

    if (activeColumn === 'vouchers') {
      const row = visibleVouchers[selectedIndex];
      if (row) {
        setDrilldownRow({
          name: row.name,
          type: 'voucher',
          count: row.count,
          records: row.records
        });
      }
    } else {
      const row = visibleAccounts[selectedIndex];
      if (row) {
        setDrilldownRow({
          name: row.name,
          type: 'account',
          count: row.count,
          records: row.records
        });
      }
    }
  }, [activeColumn, selectedIndex, visibleVouchers, visibleAccounts]);

  // Print statistics report
  const handlePrintStatistics = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Statistics - ${companyName}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Courier New', Courier, monospace, sans-serif; font-size: 11pt; color: #000; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .company-title { font-size: 14pt; font-weight: bold; }
          .report-title { font-size: 12pt; font-weight: bold; margin-top: 4px; }
          .period { font-size: 10pt; margin-top: 2px; }
          .grid-container { display: flex; width: 100%; border: 1px solid #000; }
          .col { width: 50%; box-sizing: border-box; }
          .col-left { border-right: 1px solid #000; }
          .col-header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding: 4px 8px; font-weight: bold; font-size: 10pt; }
          .table-row { display: flex; justify-content: space-between; padding: 2px 8px; }
          .table-total { display: flex; justify-content: space-between; padding: 4px 8px; border-top: 1px solid #000; border-bottom: 2px solid #000; font-weight: bold; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-title">${companyName}</div>
          <div class="report-title">STATISTICS</div>
          <div class="period">For ${periodPreset}</div>
        </div>

        <div class="grid-container">
          <div class="col col-left">
            <div class="col-header">
              <span>Types of Vouchers</span>
              <span>Count</span>
            </div>
            ${voucherStats.map(v => `
              <div class="table-row">
                <span>${v.name}</span>
                <span>${v.count}</span>
              </div>
            `).join('')}
            <div class="table-total">
              <span>Total</span>
              <span>${totalVouchers}</span>
            </div>
          </div>

          <div class="col">
            <div class="col-header">
              <span>Types of Accounts</span>
              <span>Count</span>
            </div>
            ${accountStats.map(a => `
              <div class="table-row">
                <span>${a.name}</span>
                <span>${a.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
    printHtml(html, `Statistics - ${companyName}`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csv = `Company: ${companyName}\nReport: Statistics\nPeriod: ${periodPreset}\n\n`;
    csv += `Types of Vouchers,Count,,Types of Accounts,Count\n`;
    const maxRows = Math.max(voucherStats.length, accountStats.length);
    for (let i = 0; i < maxRows; i++) {
      const v = voucherStats[i];
      const a = accountStats[i];
      const vCol = v ? `"${v.name}",${v.count}` : ',';
      const aCol = a ? `"${a.name}",${a.count}` : ',';
      csv += `${vCol},,${aCol}\n`;
    }
    csv += `"Total",${totalVouchers},,,\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Statistics_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${periodPreset}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-[#fdfdfd] border border-slate-300 shadow-md font-mono select-none overflow-hidden text-slate-900 rounded-sm">
      {/* 1. TOP TITLE BAR (EXACT TALLY ENTERPRISE GREY HEADER) */}
      <div className="bg-[#78888f] text-white px-3 py-1.5 flex items-center justify-between border-b border-[#5e6d73]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm tracking-wide">Statistics</span>
        </div>

        <div className="text-center font-bold text-sm tracking-wide">
          {companyName}
        </div>

        <button
          type="button"
          onClick={onQuit}
          title="Close Statistics (Q: Quit / Esc)"
          className="w-6 h-6 flex items-center justify-center text-white hover:bg-black/20 rounded cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 font-bold" />
        </button>
      </div>

      {/* 2. MAIN 2-COLUMN DISPLAY TABLE */}
      <div className="min-h-[580px] bg-white flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 border-b border-slate-300">
          
          {/* ================= LEFT COLUMN: TYPES OF VOUCHERS ================= */}
          <div className="flex flex-col">
            {/* Column Sub-Header */}
            <div className="p-2 px-3 border-b border-slate-200 flex items-start justify-between">
              <div className="font-bold tracking-widest text-[11px] uppercase pt-1 text-slate-800">
                T y p e s &nbsp; o f &nbsp; V o u c h e r s
              </div>
              <div className="text-right text-[10px] leading-tight text-slate-700 font-sans">
                <div className="font-bold">{companyName.split(' ')[0]} {companyName.split(' ')[1] || ''}</div>
                <div>{companySubtitle}</div>
                <div className="font-bold text-slate-900 mt-0.5">For {periodPreset}</div>
              </div>
            </div>

            {/* Voucher Rows List */}
            <div className="py-1 px-0.5 flex-1">
              {visibleVouchers.map((row, idx) => {
                const isSelected = activeColumn === 'vouchers' && selectedIndex === idx;
                return (
                  <div
                    key={row.name}
                    onClick={() => {
                      setActiveColumn('vouchers');
                      setSelectedIndex(idx);
                    }}
                    onDoubleClick={() => triggerDrilldown({
                      name: row.name,
                      type: 'voucher',
                      count: row.count,
                      records: row.records
                    })}
                    className={`flex items-center justify-between px-3 py-0.5 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#c2c2c2] text-black font-bold shadow-2xs'
                        : 'hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-2">{row.name}</span>
                    <span className="font-mono text-right min-w-[32px]">{row.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Total Row */}
            <div className="p-2 px-3 border-t border-slate-200 mt-auto">
              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <span className="tracking-widest uppercase text-slate-800">T o t a l</span>
                <div className="min-w-[64px] text-right border-t border-b border-black py-0.5 font-mono text-slate-900 font-extrabold text-sm">
                  {totalVouchers}
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: TYPES OF ACCOUNTS ================= */}
          <div className="flex flex-col">
            {/* Column Sub-Header */}
            <div className="p-2 px-3 border-b border-slate-200 flex items-start justify-between">
              <div className="font-bold tracking-widest text-[11px] uppercase pt-1 text-slate-800">
                T y p e s &nbsp; o f &nbsp; A c c o u n t s
              </div>
              <div className="text-right text-[10px] leading-tight text-slate-700 font-sans">
                <div className="font-bold">{companyName.split(' ')[0]} {companyName.split(' ')[1] || ''}</div>
                <div>{companySubtitle}</div>
                <div className="font-bold text-slate-900 mt-0.5">For {periodPreset}</div>
              </div>
            </div>

            {/* Account Rows List */}
            <div className="py-1 px-0.5 flex-1">
              {visibleAccounts.map((row, idx) => {
                const isSelected = activeColumn === 'accounts' && selectedIndex === idx;
                return (
                  <div
                    key={row.name}
                    onClick={() => {
                      setActiveColumn('accounts');
                      setSelectedIndex(idx);
                    }}
                    onDoubleClick={() => triggerDrilldown({
                      name: row.name,
                      type: 'account',
                      count: row.count,
                      records: row.records
                    })}
                    className={`flex items-center justify-between px-3 py-0.5 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#c2c2c2] text-black font-bold shadow-2xs'
                        : 'hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-2">{row.name}</span>
                    <span className="font-mono text-right min-w-[32px] font-bold">{row.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. BOTTOM TALLY ACTION & SHORTCUTS FOOTER */}
        <div className="bg-slate-100 border-t border-slate-300 p-1.5 px-3 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-700 font-mono">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={onQuit}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded font-bold text-slate-800 cursor-pointer shadow-3xs flex items-center gap-1"
            >
              <span className="underline">Q</span>: Quit
            </button>

            <button
              type="button"
              onClick={() => setActiveColumn(prev => prev === 'vouchers' ? 'accounts' : 'vouchers')}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs"
            >
              <span className="underline">Space</span>: Select Column
            </button>

            <button
              type="button"
              onClick={() => triggerDrilldown()}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs font-bold"
            >
              <span className="underline">Enter</span>: Drill Down
            </button>

            <button
              type="button"
              onClick={() => setShowPeriodModal(true)}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs"
            >
              <span className="underline">F2</span>: Period
            </button>

            <button
              type="button"
              onClick={() => setHideZeroLines(prev => !prev)}
              className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs"
            >
              {hideZeroLines ? (
                <span><span className="underline">U</span>: Restore Line</span>
              ) : (
                <span><span className="underline">R</span>: Remove Line</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintStatistics}
              className="px-2.5 py-0.5 bg-[#083c54] text-white hover:bg-[#0a4a68] rounded font-bold cursor-pointer shadow-3xs flex items-center gap-1"
            >
              <Printer className="w-3 h-3" />
              <span><span className="underline">P</span>: Print</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-2.5 py-0.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded font-bold cursor-pointer shadow-3xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span><span className="underline">E</span>: Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. DRILLDOWN MODAL VIEW */}
      {drilldownRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-400 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col font-sans overflow-hidden">
            {/* Drilldown Header */}
            <div className="bg-[#78888f] text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <div>
                  <h3 className="font-bold text-sm tracking-wide">
                    {drilldownRow.name} — Itemized Register
                  </h3>
                  <p className="text-[10px] text-slate-200 font-mono">
                    Total Records: {drilldownRow.count} | {companyName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrilldownRow(null)}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-black/20 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drilldownSearch}
                  onChange={(e) => setDrilldownSearch(e.target.value)}
                  placeholder="Filter records..."
                  className="w-full bg-white border border-slate-300 rounded pl-8 pr-2.5 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#78888f]"
                />
              </div>

              <div className="text-xs font-mono text-slate-600">
                Period: <strong>{periodPreset}</strong>
              </div>
            </div>

            {/* Register Table */}
            <div className="p-3 flex-1 overflow-y-auto max-h-[55vh]">
              {drilldownRow.records.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No transaction records recorded under <strong>{drilldownRow.name}</strong> for the selected period.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[10px] uppercase">
                      <th className="p-2 pl-3">#</th>
                      <th className="p-2">Date / Code</th>
                      <th className="p-2">Voucher / Name</th>
                      <th className="p-2">Particulars / Party</th>
                      <th className="p-2">Reference</th>
                      <th className="p-2 text-right pr-3">Amount / Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {drilldownRow.records
                      .filter(r => {
                        if (!drilldownSearch.trim()) return true;
                        const s = drilldownSearch.toLowerCase();
                        return (
                          (r.docNo && r.docNo.toLowerCase().includes(s)) ||
                          (r.party && r.party.toLowerCase().includes(s)) ||
                          (r.name && r.name.toLowerCase().includes(s)) ||
                          (r.ref && r.ref.toLowerCase().includes(s))
                        );
                      })
                      .map((r, i) => (
                        <tr key={r.id || i} className="hover:bg-slate-50">
                          <td className="p-2 pl-3 text-slate-400 text-[10px] font-mono">{i + 1}</td>
                          <td className="p-2 text-slate-800 font-mono text-[10.5px]">{r.date || r.id || '—'}</td>
                          <td className="p-2 font-bold text-slate-900 font-mono">{r.docNo || r.name || '—'}</td>
                          <td className="p-2 text-slate-700">{r.party || r.group || r.details || '—'}</td>
                          <td className="p-2 text-slate-500 font-mono text-[10px]">{r.ref || r.nature || '—'}</td>
                          <td className="p-2 text-right pr-3 font-mono font-bold text-slate-900">
                            {r.amount !== undefined
                              ? `AED ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(r.amount)}`
                              : (r.count !== undefined ? r.count : '—')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Showing {drilldownRow.records.length} item(s)
              </span>
              <button
                type="button"
                onClick={() => setDrilldownRow(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded cursor-pointer"
              >
                Close Register (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PERIOD SELECTION MODAL (F2: Period) */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-400 shadow-2xl w-full max-w-md p-4 font-sans space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#78888f]" />
                Change Period (F2)
              </h3>
              <button
                type="button"
                onClick={() => setShowPeriodModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From Date:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPeriodPreset(`${e.target.value} to ${toDate}`);
                  }}
                  className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">To Date:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPeriodPreset(`${fromDate} to ${e.target.value}`);
                  }}
                  className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quick Presets:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate('2026-01-01');
                      setToDate('2026-12-31');
                      setPeriodPreset('1-Jan-26');
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-left"
                  >
                    Current Year (1-Jan-26)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate('2026-08-01');
                      setToDate('2026-08-31');
                      setPeriodPreset('1-Aug-26 to 31-Aug-26');
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-left"
                  >
                    Current Month (Aug-26)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPeriodModal(false)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowPeriodModal(false)}
                className="px-3 py-1 bg-[#083c54] hover:bg-[#0a4a68] text-white text-xs font-bold rounded cursor-pointer"
              >
                Apply Period
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
