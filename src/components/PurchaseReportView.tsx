import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  ShoppingBag, 
  X, 
  Download, 
  Printer, 
  Filter, 
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { deriveWorkOrderNoFromInvoiceNo, InvoiceData } from './InvoiceDeliveryNoteForm';
import { getActiveCompany } from '../utils/companyProfile';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';

interface PurchaseItem {
  id: string;
  sn: number;
  description: string;
  unit: string;
  qty: number;
  unitPriceWOVAT: number;
  vatRate: number;
  total?: number;
}

interface PurchaseInvoice {
  id: string;
  supplierName: string;
  supplierTrn: string;
  invoiceNo: string;
  invoiceDate: string;
  lpoRef: string;
  category: string;
  items: PurchaseItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  remarks: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partial';
  paymentTerms?: string;
  deliveryDate?: string;
  deliveryNoteNo?: string;
  amountPaid?: number;
  dispatchBy?: string;
  deliveryMode?: string;
  countryOfOrigin?: string;
  hsCode?: string;
  placeOfSupply?: string;
  transporterName?: string;
  transporterDate?: string;
  airwayBillNo?: string;
  transporterAmount?: number;
  additionalNotes?: string;
}

interface PurchaseReportViewProps {
  triggerToast: (msg: string) => void;
  setActiveTab?: (tab: string) => void;
}

const normalizePurchaseToInvoiceData = (p: PurchaseInvoice): InvoiceData => {
  return {
    documentType: (p as any).isPurchaseRequest ? 'PURCHASE REQUEST' : (p.invoiceNo?.startsWith('PO') ? 'PURCHASE ORDER' : 'TAX INVOICE'),
    invoiceNo: p.invoiceNo,
    dated: p.invoiceDate,
    workOrderNo: p.invoiceNo ? deriveWorkOrderNoFromInvoiceNo(p.invoiceNo, p.invoiceDate) : '',
    quotationRef: p.lpoRef || '',
    sAcc: 'PUR',
    paymentTerms: p.paymentTerms || 'IMMEDIATE',
    deliveryTerms: (p as any).deliveryTerms || 'EX-WORKS',
    currency: (p as any).currency || 'AED',
    lpoNo: p.lpoRef || '',
    buyerName: p.supplierName,
    buyerAddress: (p as any).supplierAddress || '',
    buyerPhone: (p as any).supplierPhone || '',
    buyerFax: (p as any).supplierFax || '',
    buyerPoBox: (p as any).supplierPoBox || '',
    buyerTRN: p.supplierTrn || '',
    attentionTo: (p as any).supplierAttentionTo || '',
    placeOfSupply: 'AJMAN, UAE',
    termsConditions: p.remarks || '1. Material once sold will not be accepted back.',
    showPricesAndVat: true,
    isZeroRatedExport: false,
    items: (p.items || []).map((item, idx) => ({
      id: item.id || `item-${idx}`,
      sn: idx + 1,
      description: item.description || '',
      qty: item.qty || 0,
      unit: item.unit || 'PCS.',
      unitPriceWOVAT: item.unitPriceWOVAT !== undefined ? item.unitPriceWOVAT : ((item as any).unitPrice || 0),
      vatRate: item.vatRate !== undefined ? item.vatRate : 5,
      totalWeight: 0
    })),
    discountAmt: (p as any).discount || 0,
    freightAmt: (p as any).freightShipping || 0,
    preparedBy: (p as any).preparedByName || 'ADMIN',
    approvedBy: (p as any).approvedByName || 'MANAGER'
  };
};

export default function PurchaseReportView({ triggerToast, setActiveTab }: PurchaseReportViewProps) {
  // Load purchases from localStorage
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    let loaded: PurchaseInvoice[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loaded = parsed;
        }
      } catch (e) {
        console.error("Error loading saved purchases", e);
      }
    }
    // Filter out dummy/seed values
    return loaded.filter(p => p.id !== 'pur-1' && p.id !== 'pur-2' && p.id !== 'pur-3');
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [hiddenPurchaseIds, setHiddenPurchaseIds] = useState<string[]>([]);

  // Active Preview State
  const [previewPurchase, setPreviewPurchase] = useState<PurchaseInvoice | null>(null);

  // Real-time Storage Auto-Sync
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPurchases(parsed.filter((p: any) => 
              p.id !== 'pur-1' && p.id !== 'pur-2' && p.id !== 'pur-3'
            ));
          }
        } catch (e) {
          console.error("Error loading saved purchases inside storage listener", e);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    handleStorage();

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sync state back to localStorage
  const syncWithLocalStorage = (updated: PurchaseInvoice[]) => {
    localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // Delete Purchase
  const handleDeletePurchase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete purchase record ${id}? This action is irreversible.`);
    if (confirmDelete) {
      const updated = purchases.filter(p => p.id !== id);
      setPurchases(updated);
      syncWithLocalStorage(updated);
      triggerToast(`Purchase record ${id} deleted successfully.`);
      if (previewPurchase?.id === id) {
        setPreviewPurchase(null);
      }
    }
  };

  // Edit Purchase redirection
  const handleEditPurchase = (purchase: PurchaseInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    // Save draft for form loader
    localStorage.setItem('MFI_SUPPLIER_PURCHASE_FORM_DRAFT', JSON.stringify(purchase));
    
    if (setActiveTab) {
      setActiveTab('supplier_purchase');
      triggerToast(`Loaded purchase invoice ${purchase.invoiceNo} into form editor.`);
    } else {
      triggerToast(`Draft saved! Switch to Supplier Purchase Form to edit.`);
    }
  };

  // Direct High-Fidelity Print PDF
  const handlePrintPDFDocument = (p: PurchaseInvoice) => {
    const normData = normalizePurchaseToInvoiceData(p);
    const htmlContent = generateHighFidelityDocHtml(normData, normData.documentType as any, undefined, {
      printArea: 'ENTIRE',
      showUnitWeightInPrint: true,
      showTotalWeightInPrint: true,
      printPageSize: 'A4',
    });
    printHtml(htmlContent, `${normData.documentType} - ${p.invoiceNo}`);
  };

  // Extract unique suppliers
  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set<string>();
    purchases.forEach(p => {
      if (p.supplierName) suppliers.add(p.supplierName.trim().toUpperCase());
    });
    return Array.from(suppliers).sort();
  }, [purchases]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (hiddenPurchaseIds.includes(p.id)) return false;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (p.invoiceNo || '').toLowerCase().includes(searchLower) ||
        (p.lpoRef || '').toLowerCase().includes(searchLower) ||
        (p.supplierName || '').toLowerCase().includes(searchLower) ||
        (p.deliveryNoteNo || '').toLowerCase().includes(searchLower) ||
        (p.category || '').toLowerCase().includes(searchLower);

      const matchesSupplier = selectedSupplier === 'all' || 
        (p.supplierName || '').trim().toUpperCase() === selectedSupplier.toUpperCase();

      const matchesStatus = selectedStatus === 'all' ||
        (p.paymentStatus || '').toLowerCase() === selectedStatus.toLowerCase();

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && p.invoiceDate >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && p.invoiceDate <= endDate;
      }
      if (selectedMonth !== 'all') {
        const pMonth = p.invoiceDate ? p.invoiceDate.slice(5, 7) : '';
        if (pMonth !== selectedMonth) matchesDate = false;
      }
      if (selectedYear !== 'all') {
        const pYear = p.invoiceDate ? p.invoiceDate.slice(0, 4) : '';
        if (pYear !== selectedYear) matchesDate = false;
      }

      return matchesSearch && matchesSupplier && matchesStatus && matchesDate;
    });
  }, [purchases, searchQuery, selectedSupplier, selectedStatus, startDate, endDate, selectedMonth, selectedYear, hiddenPurchaseIds]);

  // Consolidated Financial Metrics
  const metrics = useMemo(() => {
    let totalExclVat = 0;
    let totalVat = 0;
    let totalInclVat = 0;
    let totalPending = 0;

    filteredPurchases.forEach(p => {
      totalExclVat += Number(p.subtotal || 0);
      totalVat += Number(p.vatAmount || 0);
      totalInclVat += Number(p.totalAmount || 0);
      
      const outstanding = Number(p.totalAmount || 0) - Number(p.amountPaid || 0);
      totalPending += Math.max(0, outstanding);
    });

    return {
      totalExclVat,
      totalVat,
      totalInclVat,
      totalPending,
      count: filteredPurchases.length
    };
  }, [filteredPurchases]);

  // Export helper
  const handleExportCSV = () => {
    if (filteredPurchases.length === 0) {
      triggerToast("No purchase data to export");
      return;
    }

    const headers = ['PO / LPO REF', 'INVOICE NO', 'DATE', 'SUPPLIER NAME', 'CATEGORY', 'STATUS', 'SUBTOTAL (AED)', 'VAT (AED)', 'TOTAL AMOUNT (AED)'];
    const csvRows = filteredPurchases.map(p => [
      `"${p.lpoRef || ''}"`,
      `"${p.invoiceNo || ''}"`,
      `"${p.invoiceDate || ''}"`,
      `"${(p.supplierName || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.paymentStatus || 'Pending'}"`,
      (p.subtotal || p.totalAmount / 1.05).toFixed(2),
      (p.vatAmount || p.totalAmount - (p.subtotal || p.totalAmount / 1.05)).toFixed(2),
      Number(p.totalAmount || 0).toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Supplier_Purchases_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Exported purchase ledger to CSV successfully.");
  };

  const handlePrintReport = () => {
    // Generate beautiful landscape table rows for each filtered purchase
    const rowsHtml = filteredPurchases.map((p, index) => {
      const invoiceAmt = p.subtotal || p.totalAmount / 1.05;
      const vatAmt = p.vatAmount || p.totalAmount - invoiceAmt;
      const totalAmt = Number(p.totalAmount || 0);

      return `
        <tr style="height: 22px; text-align: center;">
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold; color: #f37021; font-family: monospace;">${p.lpoRef || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #083c54;">${p.invoiceNo || '—'}</td>
          <td style="border: 1px solid #cbd5e1;">${p.invoiceDate || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding-left: 6px; font-weight: bold; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.supplierName || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace;">AED ${invoiceAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace;">AED ${vatAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace; font-weight: bold; color: #0f172a;">AED ${totalAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
      `;
    }).join('');

    const emptyRowsCount = Math.max(0, 10 - filteredPurchases.length);
    const emptyRowsHtml = Array.from({ length: emptyRowsCount }).map(() => `
      <tr style="height: 22px;">
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
      </tr>
    `).join('');

    const filtersApplied = [
      selectedSupplier !== 'all' ? `SUPPLIER: ${selectedSupplier}` : '',
      startDate ? `FROM: ${startDate}` : '',
      endDate ? `TO: ${endDate}` : '',
      searchQuery ? `SEARCH: "${searchQuery}"` : ''
    ].filter(Boolean).join(' | ') || 'ALL RECORDS';

    const activeComp = getActiveCompany();
    const compCode = (activeComp.code || activeComp.shortName || 'ERP').toUpperCase();
    const compName = (activeComp.name || 'COMPANY LLC').toUpperCase();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${compName} - Purchase Ledger Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;850;900&family=JetBrains+Mono:wght@700&display=swap');
            @page {
              size: A4 portrait;
              margin: 8mm 8mm 8mm 8mm !important;
            }
            body {
              font-family: "Inter", sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 8px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .container {
              width: 100%;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 6px;">
              <tr>
                <td style="vertical-align: top; width: 55%;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 30px; height: 30px; background: #0f172a; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #ffffff; font-size: 12px;">
                      ${compCode}
                    </div>
                    <div>
                      <h1 style="font-size: 11.5px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.01em;">${compName}</h1>
                    </div>
                  </div>
                  <p style="margin: 4px 0 0 0; font-size: 7.5px; color: #475569; font-weight: 600; text-transform: uppercase;">
                    FILTERS APPLIED: <span style="color: #083c54; font-weight: 800;">${filtersApplied}</span>
                  </p>
                </td>
                <td style="vertical-align: top; width: 45%; text-align: right;">
                  <h2 style="font-size: 12px; font-weight: 900; color: #083c54; margin: 0 0 3px 0; text-transform: uppercase; letter-spacing: 0.05em;">PURCHASE LEDGER REPORT</h2>
                  <p style="margin: 0; font-size: 7.5px; color: #64748b; font-weight: bold; font-family: monospace;">DATE GENERATED: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</p>
                </td>
              </tr>
            </table>

            <!-- Summary Box Simple -->
            <div style="display: flex; gap: 14px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; margin-bottom: 12px;">
              <div style="border-right: 1px solid #cbd5e1; padding-right: 14px;">
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Count</span>
                <span style="font-size: 11px; font-weight: 900; color: #083c54; font-family: monospace; display: block; margin-top: 2px;">${metrics.count}</span>
              </div>
              <div style="border-right: 1px solid #cbd5e1; padding-right: 14px;">
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Purchases (VAT Excl.)</span>
                <span style="font-size: 11px; font-weight: 900; color: #0f172a; font-family: monospace; display: block; margin-top: 2px;">AED ${metrics.totalExclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div style="border-right: 1px solid #cbd5e1; padding-right: 14px;">
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Input VAT (5%)</span>
                <span style="font-size: 11px; font-weight: 900; color: #0f172a; font-family: monospace; display: block; margin-top: 2px;">AED ${metrics.totalVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div>
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Total Spend (VAT Incl.)</span>
                <span style="font-size: 11px; font-weight: 900; color: #15803d; font-family: monospace; display: block; margin-top: 2px;">AED ${metrics.totalInclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>

            <!-- Ledger Table -->
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 7.5px; text-transform: uppercase; margin-bottom: 12px;">
              <thead>
                <tr style="background: #f1f5f9; font-weight: bold; border-bottom: 1.5px solid #0f172a; height: 24px; text-align: center; color: #475569;">
                  <th style="border: 1px solid #cbd5e1; width: 25px;">S.N.</th>
                  <th style="border: 1px solid #cbd5e1; width: 65px;">PO REF</th>
                  <th style="border: 1px solid #cbd5e1; width: 75px;">INVOICE NO</th>
                  <th style="border: 1px solid #cbd5e1; width: 55px;">DATE</th>
                  <th style="border: 1px solid #cbd5e1; text-align: left; padding-left: 6px;">SUPPLIER NAME</th>
                  <th style="border: 1px solid #cbd5e1; width: 75px; text-align: right; padding-right: 6px;">AMOUNT</th>
                  <th style="border: 1px solid #cbd5e1; width: 55px; text-align: right; padding-right: 6px;">VAT</th>
                  <th style="border: 1px solid #cbd5e1; width: 75px; text-align: right; padding-right: 6px;">TOTAL</th>
                </tr>
              </thead>
              <tbody style="color: #334155;">
                ${rowsHtml}
                ${emptyRowsHtml}
                <!-- Consolidated Totals Row -->
                <tr style="height: 24px; background-color: #f8fafc; font-weight: 900; border-top: 1.5px solid #0f172a; color: #0f172a; text-align: right;">
                  <td colspan="5" style="border: 1px solid #cbd5e1; text-align: left; padding-left: 6px; font-weight: 900;">CONSOLIDATED TOTALS</td>
                  <td style="border: 1px solid #cbd5e1; padding-right: 6px; font-family: monospace;">AED ${metrics.totalExclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding-right: 6px; font-family: monospace;">AED ${metrics.totalVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding-right: 6px; font-family: monospace; color: #15803d; font-size: 8.5px;">AED ${metrics.totalInclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 7px; font-weight: bold; color: #94a3b8; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">
              <span>SYSTEM GENERATED SUPPLIER PURCHASE RECORD</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `Supplier_Purchase_Ledger_Report`);
    triggerToast("Initiating page-fitted printed purchase ledger report...");
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans select-none">
      
      <div className="space-y-6 print:hidden">
        {/* Header section */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#083c54]" />
            Purchase Report
          </h2>
        </div>

      {/* Metrics Cards Grid - Styled like Sales Report View */}
      <div className="bg-slate-50 border border-[#A6C4DE]/60 p-2.5 shadow-3xs rounded flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="border-r border-slate-200 pr-5">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Count</span>
            <span className="text-sm font-black text-[#083c54] font-mono mt-0.5 block">{metrics.count}</span>
          </div>
          <div className="border-r border-slate-200 pr-5">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Purchases (VAT Excl.)</span>
            <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
              AED {metrics.totalExclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-r border-slate-200 pr-5">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Input VAT (5%)</span>
            <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">
              AED {metrics.totalVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-250/80 px-2 py-0.5 rounded shadow-3xs flex flex-col justify-center max-w-fit">
            <span className="text-[8px] font-bold text-emerald-600 block tracking-wider uppercase">Total spend (VAT Incl.)</span>
            <span className="text-xs font-black text-emerald-800 font-mono block">
              AED {metrics.totalInclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Inline Compact Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* General Search */}
          <div className="relative w-40">
            <input
              type="text"
              placeholder="SEARCH SUPPLIER, INVOICE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[9px] pl-5 pr-1.5 py-0.5 border border-slate-300 rounded font-sans uppercase font-bold focus:outline-none focus:border-[#083c54] h-6 bg-white"
            />
            <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1.5" />
          </div>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-[9px] px-1 border border-slate-300 rounded bg-white font-bold uppercase focus:outline-none focus:border-[#083c54] h-6"
          >
            <option value="all">MONTH</option>
            <option value="01">JAN</option>
            <option value="02">FEB</option>
            <option value="03">MAR</option>
            <option value="04">APR</option>
            <option value="05">MAY</option>
            <option value="06">JUN</option>
            <option value="07">JUL</option>
            <option value="08">AUG</option>
            <option value="09">SEP</option>
            <option value="10">OCT</option>
            <option value="11">NOV</option>
            <option value="12">DEC</option>
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-[9px] px-1 border border-slate-300 rounded bg-white font-bold uppercase focus:outline-none focus:border-[#083c54] h-6"
          >
            <option value="all">YEAR</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* From Date */}
          <div className="flex items-center gap-1">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase">FROM:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-[9px] px-1 py-0.5 border border-slate-300 rounded bg-white font-bold font-mono focus:outline-none focus:border-[#083c54] h-6 text-slate-800"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-1">
            <span className="text-[8.5px] font-bold text-slate-500 uppercase">TO:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-[9px] px-1 py-0.5 border border-slate-300 rounded bg-white font-bold font-mono focus:outline-none focus:border-[#083c54] h-6 text-slate-800"
            />
          </div>

          {/* Supplier Selection */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="text-[9px] px-1 border border-slate-300 rounded bg-white font-bold uppercase focus:outline-none focus:border-[#083c54] h-6 w-28"
          >
            <option value="all">SUPPLIER</option>
            {uniqueSuppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchQuery || selectedSupplier !== 'all' || selectedStatus !== 'all' || startDate || endDate || selectedMonth !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSupplier('all');
                setSelectedStatus('all');
                setStartDate('');
                setEndDate('');
                setSelectedMonth('all');
                setSelectedYear('all');
              }}
              className="text-[8.5px] font-bold text-red-650 hover:text-red-700 flex items-center gap-0.5 cursor-pointer h-6 px-1 bg-red-50 rounded border border-red-100"
            >
              <X className="w-2.5 h-2.5" /> CLEAR
            </button>
          )}

          {/* Print Filtered Report Icon */}
          <button
            onClick={handlePrintReport}
            className="p-1 text-[#083c54] hover:text-[#f37021] bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer flex items-center justify-center h-6 w-6"
            title="Print Filtered Report"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Export CSV Icon */}
          <button
            onClick={handleExportCSV}
            className="p-1 text-emerald-600 hover:text-emerald-750 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer flex items-center justify-center h-6 w-6"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </div>

      {/* List Table: styled EXACTLY like Sales Report View */}
      <div className="box-shaped overflow-x-auto bg-white">
        <table className="box-shaped-table w-full text-left font-sans text-[10px] uppercase table-fixed min-w-[900px] max-w-full">
          <colgroup>
            <col className="w-[100px]" />
            <col className="w-[110px]" />
            <col className="w-[85px]" />
            <col className="w-[180px]" />
            <col className="w-[110px]" />
            <col className="w-[90px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead>
            <tr className="h-8 text-center">
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">PO NUMBER</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">INVOICE NUMBER</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">DATE</th>
              <th className="p-1 py-1.5 text-left pl-3 border border-[#052a3a]">SUPPLIER NAME</th>
              <th className="p-1 py-1.5 text-right pr-3 border border-[#052a3a]">INVOICE AMOUNT</th>
              <th className="p-1 py-1.5 text-right pr-3 border border-[#052a3a]">VAT</th>
              <th className="p-1 py-1.5 text-right pr-3 border border-[#052a3a]">TOTAL AMOUNT</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[10px]">
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-500 italic bg-slate-50 font-sans">
                  No matching purchase records found in supplier ledger.
                </td>
              </tr>
            ) : (
              filteredPurchases.map((p, idx) => {
                const invoiceAmt = p.subtotal || p.totalAmount / 1.05;
                const vatAmt = p.vatAmount || (p.totalAmount - invoiceAmt);
                const isSelected = selectedRowIndex === idx;

                return (
                  <tr 
                    key={p.id + '-' + idx} 
                    onClick={() => setSelectedRowIndex(idx)}
                    className={`divide-x divide-slate-300 h-9 text-slate-900 transition-colors group border-b border-slate-300 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/90 ring-1 ring-indigo-400 ring-inset' : 'hover:bg-neutral-50 bg-white'
                    }`}
                  >
                    {/* 1. PO NUMBER */}
                    <td className="p-1 text-center font-sans">
                      <span className="text-[#f37021] font-bold text-[10px] font-mono tracking-wide">
                        {p.lpoRef || '—'}
                      </span>
                    </td>

                    {/* 2. INVOICE NUMBER */}
                    <td className="p-1 text-center font-sans text-slate-800 font-bold font-mono">
                      {p.invoiceNo || '—'}
                    </td>

                    {/* 3. DATE */}
                    <td className="p-1 text-center font-sans text-slate-700 font-medium">
                      {p.invoiceDate || '—'}
                    </td>

                    {/* 4. SUPPLIER NAME */}
                    <td className="p-1 text-left px-3 font-sans font-bold text-slate-800 max-w-[180px] truncate">
                      <div className="flex flex-col">
                        <span className="truncate">{p.supplierName || '—'}</span>
                        <span className="text-[7.5px] text-slate-400 font-normal tracking-wide truncate">
                          {p.category} {p.paymentStatus ? `| ${p.paymentStatus}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* 5. INVOICE AMOUNT (Subtotal) */}
                    <td className="p-1 text-right pr-3 font-sans font-semibold text-slate-700 font-mono">
                      AED {invoiceAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>

                    {/* 6. VAT */}
                    <td className="p-1 text-right pr-3 font-sans font-semibold text-rose-600 font-mono">
                      AED {vatAmt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>

                    {/* 7. TOTAL AMOUNT */}
                    <td className="p-1 text-right pr-3 font-sans font-black text-slate-900 font-mono">
                      AED {Number(p.totalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>

                    {/* 8. ACTION */}
                    <td className="p-1 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5 py-0.5">
                        {/* Eye / View Modal Preview button */}
                        <button
                          type="button"
                          onClick={() => setPreviewPurchase(p)}
                          className="p-1 bg-sky-50 hover:bg-sky-100 text-sky-750 border border-sky-150 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                          title="View Live Document Preview"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        {/* Direct Print PDF button */}
                        <button
                          type="button"
                          onClick={() => handlePrintPDFDocument(p)}
                          className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 border border-emerald-150 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                          title="Print High-Fidelity Tax Invoice PDF"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={(e) => handleEditPurchase(p, e)}
                          className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-150 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                          title="Edit Purchase Record"
                        >
                          <Edit className="w-3.5 h-3.5 shrink-0" />
                        </button>

                        {/* Delete/Trash icon */}
                        <button
                          type="button"
                          onClick={(e) => handleDeletePurchase(p.id, e)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-650 border border-red-150 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                          title="Delete Purchase Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
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

      {/* TALLY SHORTCUTS BAR */}
      <RecordsFooterShortcutsBar
        onQuit={() => {
          localStorage.setItem('mf_erp_active_tab', 'home');
          window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'home' }));
        }}
        onSelectColumn={() => {
          if (filteredPurchases.length > 0) {
            setSelectedRowIndex(prev => (prev + 1) % filteredPurchases.length);
          }
        }}
        selectColumnLabel="Select Row"
        onDrillDown={() => {
          const sel = filteredPurchases[selectedRowIndex];
          if (sel) {
            setPreviewPurchase(sel);
          }
        }}
        drillDownLabel="Drill Down (View)"
        fromDate={startDate}
        toDate={endDate}
        onDateRangeChange={(from, to) => {
          setStartDate(from);
          setEndDate(to);
        }}
        onRemoveLine={() => {
          if (hiddenPurchaseIds.length > 0) {
            setHiddenPurchaseIds([]);
            triggerToast?.('All hidden purchase records restored.');
          } else {
            const sel = filteredPurchases[selectedRowIndex];
            if (sel) {
              setHiddenPurchaseIds(prev => [...prev, sel.id]);
              triggerToast?.(`Purchase ${sel.invoiceNo || sel.lpoRef} hidden from view (Press U to restore).`);
            }
          }
        }}
        isLineRemoved={hiddenPurchaseIds.length > 0}
        removeLineLabel="Remove Line"
        restoreLineLabel="Restore Line"
        onPrint={() => {
          handlePrintReport();
        }}
        onExport={() => {
          handleExportCSV();
        }}
        totalRecordsCount={filteredPurchases.length}
      />

      {/* HIGH FIDELITY PURCHASE PREVIEW MODAL OVERLAY */}
      {previewPurchase && (() => {
        const normData = normalizePurchaseToInvoiceData(previewPurchase);
        const previewHtml = generateHighFidelityDocHtml(normData, normData.documentType as any, undefined, {
          printArea: 'ENTIRE',
          showUnitWeightInPrint: true,
          showTotalWeightInPrint: true,
          printPageSize: 'A4',
          isPreview: true,
        });

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-text print:bg-white print:p-0 print:static print:z-0">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-300 print:border-none print:shadow-none print:max-h-none print:w-full">
              {/* Modal Header */}
              <div className="bg-[#083c54] text-white p-3 px-4 flex items-center justify-between border-b border-[#052a3a] print:hidden">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    LIVE PURCHASE PREVIEW: {previewPurchase.invoiceNo} | {previewPurchase.supplierName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintPDFDocument(previewPurchase)}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Print Document"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    PRINT PDF
                  </button>
                  <button
                    onClick={() => setPreviewPurchase(null)}
                    className="p-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* High-Fidelity Render Frame */}
              <div className="p-4 overflow-y-auto flex-1 bg-slate-100 print:p-0 print:bg-white flex justify-center">
                <iframe
                  title={`Preview-${previewPurchase.invoiceNo}`}
                  srcDoc={previewHtml}
                  className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-md border border-slate-300 rounded print:shadow-none print:border-none"
                  style={{ height: '850px' }}
                />
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-2.5 px-4 flex justify-between items-center border-t border-slate-200 print:hidden">
                <div className="text-[10px] text-slate-500 font-mono">
                  SUPPLIER TRN: <span className="font-bold text-slate-800">{previewPurchase.supplierTrn || '—'}</span> | LPO REF: <span className="font-bold text-[#f37021]">{previewPurchase.lpoRef || '—'}</span>
                </div>
                <button
                  onClick={() => setPreviewPurchase(null)}
                  className="p-1.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
