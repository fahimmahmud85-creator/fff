import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Eye, 
  Edit, 
  Truck, 
  Trash2, 
  Search, 
  Calendar, 
  TrendingUp, 
  X, 
  Download, 
  Printer, 
  Filter, 
  CheckCircle,
  FileText,
  ClipboardList,
  Mail,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { numberToAEDWords } from './InvoiceDeliveryNoteForm';
import { getFormattedDocTitle } from './DocumentPrintGenerator';
import { generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';
import { UaeEInvoiceModal } from './UaeEInvoiceModal';
import { AppUser } from '../types';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';

interface InvoiceItem {
  id: string;
  sn: number;
  description: string;
  unit: string;
  qty: number;
  unitPriceWOVAT: number;
  vatRate: number;
  total?: number;
}

interface InvoiceData {
  invoiceNo: string;
  associatedInvoiceNo?: string;
  associatedWorkOrderNo?: string;
  associatedDeliveryNoteNo?: string;
  dated: string;
  workOrderNo: string;
  quotationRef?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  lpoNo: string;
  dispatchBy?: string;
  deliveryMode?: string;
  currency?: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerTRN: string;
  placeOfSupply: string;
  items: InvoiceItem[];
  discountAmt: number;
  freightAmt: number;
  documentType: string;
  showPricesAndVat: boolean;
  isZeroRatedExport: boolean;
  status?: 'active' | 'cancelled';
}

interface SalesReportViewProps {
  triggerToast: (msg: string) => void;
  setActiveTab?: (tab: string) => void;
  currentUser?: AppUser | null;
}

export default function SalesReportView({ triggerToast, setActiveTab, currentUser }: SalesReportViewProps) {
  // Load sales documents from localStorage
  const [documents, setDocuments] = useState<InvoiceData[]>(() => {
    const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out dummy/seed values if necessary
          return parsed.filter((doc: any) => 
            doc.invoiceNo !== 'DN260401' && 
            doc.invoiceNo !== 'DN260402' && 
            doc.invoiceNo !== 'DN260403' && 
            doc.invoiceNo !== 'DN260404' && 
            doc.invoiceNo !== 'DN260405'
          );
        }
      } catch (e) {
        console.error("Error loading saved documents", e);
      }
    }
    return [];
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [hiddenDocNos, setHiddenDocNos] = useState<string[]>([]);

  // Active Preview State
  const [previewDoc, setPreviewDoc] = useState<InvoiceData | null>(null);
  const [previewType, setPreviewType] = useState<'TAX INVOICE' | 'DELIVERY NOTE' | 'WORK ORDER'>('TAX INVOICE');
  const [isPdfEditable, setIsPdfEditable] = useState<boolean>(false);
  const [isEInvoiceModalOpen, setIsEInvoiceModalOpen] = useState(false);
  const [eInvoiceDoc, setEInvoiceDoc] = useState<any>(null);

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null);
    setIsPdfEditable(false);
  }, []);

  // Keyboard shortcut (Escape) to close preview modal smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (isEInvoiceModalOpen) {
          setIsEInvoiceModalOpen(false);
        } else if (previewDoc) {
          handleClosePreview();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewDoc, isEInvoiceModalOpen, handleClosePreview]);

  const handleOpenEInvoice = (doc: any) => {
    setEInvoiceDoc(doc);
    setIsEInvoiceModalOpen(true);
  };

  // Active Company Context
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());

  // Real-time Storage Auto-Sync & Company sync
  useEffect(() => {
    const handleCompanySync = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('company_profile_updated', handleCompanySync);
    window.addEventListener('active_company_changed', handleCompanySync);

    const handleStorage = () => {
      setActiveCompany(getActiveCompany());
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setDocuments(parsed.filter((doc: any) => 
              doc.invoiceNo !== 'DN260401' && 
              doc.invoiceNo !== 'DN260402' && 
              doc.invoiceNo !== 'DN260403' && 
              doc.invoiceNo !== 'DN260404' && 
              doc.invoiceNo !== 'DN260405'
            ));
          }
        } catch (e) {
          console.error("Error loading saved documents inside storage listener", e);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    handleStorage();

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sync state back to localStorage if needed or trigger storage update events
  const syncWithLocalStorage = (updatedDocs: InvoiceData[]) => {
    localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updatedDocs));
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  // Delete Document
  const handleDeleteDoc = (invoiceNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete document ${invoiceNo}? This action is irreversible.`);
    if (confirmDelete) {
      const updated = documents.filter(doc => doc.invoiceNo !== invoiceNo);
      setDocuments(updated);
      syncWithLocalStorage(updated);
      triggerToast(`Document ${invoiceNo} deleted successfully.`);
      if (previewDoc?.invoiceNo === invoiceNo) {
        setPreviewDoc(null);
      }
    }
  };

  // Edit Document redirection
  const handleEditDoc = (doc: InvoiceData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const docType = doc.documentType || 'TAX INVOICE';
    
    // Save current active document under the type form and generic key
    localStorage.setItem(`MF_ACTIVE_DOCUMENT_FORM_${docType}`, JSON.stringify(doc));
    localStorage.setItem(`MF_ACTIVE_DOCUMENT_FORM_ALL`, JSON.stringify(doc));
    
    // Map documentType to the correct ERP editor active tab
    let targetTab = 'invoice';
    if (docType === 'DELIVERY NOTE') {
      targetTab = 'quotation';
    } else if (docType === 'WORK ORDER') {
      targetTab = 'work_orders_suite';
    } else if (docType === 'PACKING LIST') {
      targetTab = 'packing_list';
    } else if (docType === 'PURCHASE REQUEST') {
      targetTab = 'purchase';
    }

    localStorage.setItem('mf_erp_active_tab', targetTab);
    window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: targetTab }));
    window.dispatchEvent(new CustomEvent('mf_load_document_to_editor', { detail: doc }));

    if (setActiveTab) {
      setActiveTab(targetTab);
    }
    triggerToast(`Loaded ${invoiceNoLabel(docType)} ${doc.invoiceNo} into active editor for editing.`);
  };

  const invoiceNoLabel = (type: string) => {
    if (type === 'TAX INVOICE') return 'Invoice';
    if (type === 'DELIVERY NOTE') return 'Delivery Note';
    if (type === 'WORK ORDER') return 'Work Order';
    if (type === 'PACKING LIST') return 'Packing List';
    return type;
  };

  // Extract unique buyers list
  const uniqueBuyers = useMemo(() => {
    const buyers = new Set<string>();
    documents.forEach(doc => {
      if (doc.buyerName) buyers.add(doc.buyerName.trim().toUpperCase());
    });
    return Array.from(buyers).sort();
  }, [documents]);

  // Extract unique document types
  const uniqueDocTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach(doc => {
      if (doc.documentType) types.add(doc.documentType);
    });
    return Array.from(types).sort();
  }, [documents]);

  // Extract unique seller codes (from documents)
  const uniqueSellers = useMemo(() => {
    const sellers = new Set<string>();
    documents.forEach((doc: any) => {
      if (!doc) return;
      const isTaxInvoice = doc.documentType === 'TAX INVOICE' || doc.documentType === 'TAX INVOICE & DELIVERY NOTE';
      if (isTaxInvoice && doc.sAcc) {
        sellers.add(String(doc.sAcc).trim().toUpperCase());
      }
    });
    // Add default core sellers if not already present
    ['CAS', 'ASF', 'RRE', 'FSL', 'FHM'].forEach(c => sellers.add(c));
    return Array.from(sellers).sort();
  }, [documents]);

  // Role-based seller clearance
  const isAdmin = useMemo(() => {
    if (!currentUser) return true;
    return currentUser.role === 'Admin';
  }, [currentUser]);

  // Match current user to their assigned seller code
  const userSellerCode = useMemo(() => {
    if (!currentUser) return 'all';
    const fullName = `${currentUser.firstName || ''} ${currentUser.secondName || ''}`.trim().toUpperCase();
    const uId = String(currentUser.uniqueId || '').toUpperCase();
    const email = String(currentUser.email || '').toUpperCase();

    // 1. Direct match by uniqueId or code in unique sellers list
    const matchCode = uniqueSellers.find(s => 
      s.toUpperCase() === uId || 
      (uId && uId.includes(s.toUpperCase()))
    );
    if (matchCode) return matchCode;

    // 2. Match by known employee keywords
    if (fullName.includes('FAHIM') || email.includes('FAHIM')) return 'FHM';
    if (fullName.includes('ASIF') || fullName.includes('AHMED') || email.includes('ASIF')) return 'ASF';
    if (fullName.includes('CARLOS') || email.includes('CARLOS')) return 'CAS';
    if (fullName.includes('RAHUL') || email.includes('RAHUL')) return 'RRE';

    return uId || (currentUser.firstName ? String(currentUser.firstName).toUpperCase().slice(0, 3) : 'FSL');
  }, [currentUser, uniqueSellers]);

  // When not Admin, strictly lock the selected seller to user's assigned seller code
  useEffect(() => {
    if (!isAdmin && userSellerCode && userSellerCode !== 'all') {
      setSelectedSeller(userSellerCode);
    }
  }, [isAdmin, userSellerCode]);

  // Calculations for each document helper
  const getDocTotals = (doc: any) => {
    if (!doc) return { itemSum: 0, discount: 0, freight: 0, netTaxable: 0, vat: 0, totalInclVat: 0 };
    const items = Array.isArray(doc.items) ? doc.items : [];
    const itemSum = items.reduce((sum: number, item: any) => {
      if (!item) return sum;
      const q = parseFloat(String(item.qty ?? item.quantity ?? 0)) || 0;
      const p = parseFloat(String(item.unitPriceWOVAT ?? item.unitPrice ?? item.rate ?? item.price ?? 0)) || 0;
      const d = parseFloat(String(item.discount ?? item.discountAmt ?? 0)) || 0;
      const directAmt = parseFloat(String(item.amount ?? item.total ?? 0)) || 0;
      const lineTotal = (directAmt > 0 && p === 0) ? directAmt : Math.max(0, (q * p) - d);
      return sum + lineTotal;
    }, 0);
    
    const discount = parseFloat(String(doc.discountAmt ?? doc.discount ?? 0)) || 0;
    const freight = parseFloat(String(doc.freightAmt ?? doc.freight ?? 0)) || 0;
    
    let netTaxable = Math.max(0, itemSum - discount);
    if (netTaxable === 0 && doc.netTaxableAmount) {
      netTaxable = parseFloat(String(doc.netTaxableAmount)) || 0;
    } else if (netTaxable === 0 && doc.subtotal) {
      netTaxable = parseFloat(String(doc.subtotal)) || 0;
    }

    const vatRate = doc.isZeroRatedExport ? 0 : 0.05;
    let vat = doc.vatAmount !== undefined ? (parseFloat(String(doc.vatAmount)) || 0) : (netTaxable * vatRate);
    if (vat === 0 && !doc.isZeroRatedExport && netTaxable > 0) {
      vat = netTaxable * 0.05;
    }

    let totalInclVat = doc.grandTotal !== undefined ? (parseFloat(String(doc.grandTotal)) || 0) : (netTaxable + freight + vat);
    if (totalInclVat === 0 && doc.totalAmount) {
      totalInclVat = parseFloat(String(doc.totalAmount)) || 0;
    } else if (totalInclVat === 0 && doc.total) {
      totalInclVat = parseFloat(String(doc.total)) || 0;
    } else if (totalInclVat === 0) {
      totalInclVat = netTaxable + freight + vat;
    }

    // Deduce net and vat if only grand total exists
    if (totalInclVat > 0 && netTaxable === 0) {
      netTaxable = totalInclVat / (1 + vatRate);
      vat = totalInclVat - netTaxable;
    }

    return { itemSum, discount, freight, netTaxable, vat, totalInclVat };
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: any) => {
      if (!doc) return false;
      if (hiddenDocNos.includes(doc.invoiceNo)) return false;
      // Company isolation filter
      if (doc.companyId) {
        if (doc.companyId !== activeCompany?.id) return false;
      } else if (doc.providerTRN && activeCompany?.trn) {
        if (String(doc.providerTRN).replace(/\s+/g, '') !== String(activeCompany.trn).replace(/\s+/g, '')) return false;
      } else if (doc.providerName && activeCompany?.name) {
        const isMatched = (String(doc.providerName).toLowerCase().includes(activeCompany.shortName?.toLowerCase() || '') ||
                           String(activeCompany.name).toLowerCase().includes(String(doc.providerName).toLowerCase()));
        if (!isMatched && activeCompany?.id !== 'comp-mfi') return false;
      } else {
        if (activeCompany?.id && activeCompany.id !== 'comp-mfi') return false;
      }

      // Sales report only show tax invoice reports
      const isTaxInvoice = doc.documentType === 'TAX INVOICE' || doc.documentType === 'TAX INVOICE & DELIVERY NOTE';
      if (!isTaxInvoice) return false;

      // Search text match
      const searchLower = (searchQuery || '').toLowerCase();
      const matchesSearch = !searchLower || (
        String(doc.invoiceNo || '').toLowerCase().includes(searchLower) ||
        String(doc.associatedInvoiceNo || '').toLowerCase().includes(searchLower) ||
        String(doc.associatedDeliveryNoteNo || '').toLowerCase().includes(searchLower) ||
        String(doc.deliveryNoteNo || '').toLowerCase().includes(searchLower) ||
        String(doc.doNo || '').toLowerCase().includes(searchLower) ||
        String(doc.lpoNo || '').toLowerCase().includes(searchLower) ||
        String(doc.buyerName || '').toLowerCase().includes(searchLower) ||
        String(doc.customerName || '').toLowerCase().includes(searchLower) ||
        String(doc.companyName || '').toLowerCase().includes(searchLower) ||
        String(doc.workOrderNo || '').toLowerCase().includes(searchLower)
      );

      // Buyer filter
      const matchesBuyer = selectedBuyer === 'all' || 
        String(doc.buyerName || '').trim().toUpperCase() === selectedBuyer.toUpperCase();

      // Date Range filter
      let matchesDateRange = true;
      if (startDate) {
        matchesDateRange = matchesDateRange && (String(doc.dated || '') >= startDate);
      }
      if (endDate) {
        matchesDateRange = matchesDateRange && (String(doc.dated || '') <= endDate);
      }

      // Seller filter - strictly enforced for sellers, open for admin
      const effectiveSeller = (!isAdmin && userSellerCode && userSellerCode !== 'all') ? userSellerCode : selectedSeller;
      const matchesSeller = effectiveSeller === 'all' || 
        String(doc.sAcc || '').trim().toUpperCase() === effectiveSeller.toUpperCase();

      return matchesSearch && matchesBuyer && matchesDateRange && matchesSeller;
    });
  }, [documents, activeCompany?.id, activeCompany?.trn, activeCompany?.name, activeCompany?.shortName, searchQuery, selectedBuyer, startDate, endDate, selectedSeller]);

  // Consolidated Financial Metrics
  const metrics = useMemo(() => {
    let totalExclVat = 0;
    let totalVat = 0;
    let totalInclVat = 0;

    filteredDocuments.forEach(doc => {
      const { itemSum, discount, vat, totalInclVat: docTotal } = getDocTotals(doc);
      totalExclVat += (itemSum - discount);
      totalVat += vat;
      totalInclVat += docTotal;
    });

    return {
      totalExclVat,
      totalVat,
      totalInclVat,
      count: filteredDocuments.length
    };
  }, [filteredDocuments]);

  // Export helper
  const handleExportCSV = () => {
    if (filteredDocuments.length === 0) {
      triggerToast("No data to export");
      return;
    }
    
    // UTF-8 BOM so Excel opens special characters correctly
    let csvContent = "\uFEFF";
    csvContent += "WORK ORDER NO,DATE,LPO NO,INVOICE NO,COMPANY DETAILS,SELLER CODE,TAXABLE AMOUNT (AED),VAT AMOUNT (AED),TOTAL AMOUNT (AED)\r\n";
    
    filteredDocuments.forEach(doc => {
      const { itemSum, discount, vat, totalInclVat } = getDocTotals(doc);
      const displayInv = doc.invoiceNo;
      const invoiceNoStr = doc.documentType === 'TAX INVOICE' ? displayInv : (doc.associatedInvoiceNo || '—');
      const workOrderNoStr = doc.workOrderNo || doc.associatedWorkOrderNo || '—';
      const companyDetailsStr = doc.buyerName || '—';
      const sellerCodeStr = doc.sAcc || '—';

      const row = [
        `"${String(workOrderNoStr || '').replace(/"/g, '""')}"`,
        `"${String(doc.dated || '').replace(/"/g, '""')}"`,
        `"${String(doc.lpoNo || '').replace(/"/g, '""')}"`,
        `"${String(invoiceNoStr || '').replace(/"/g, '""')}"`,
        `"${String(companyDetailsStr || '').replace(/"/g, '""')}"`,
        `"${String(sellerCodeStr || '').replace(/"/g, '""')}"`,
        (itemSum - discount).toFixed(2),
        vat.toFixed(2),
        totalInclVat.toFixed(2)
      ].join(",");
      csvContent += row + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Sales report exported successfully as CSV.");
  };

  const handlePrintPDFDocument = (doc: any, type: 'TAX INVOICE' | 'DELIVERY NOTE' | 'WORK ORDER') => {
    const htmlContent = generateHighFidelityDocHtml(doc, type, undefined, {
      printArea: 'ENTIRE',
      showUnitWeightInPrint: true,
      showTotalWeightInPrint: true,
      printPageSize: 'A4',
    });
    printHtml(htmlContent, `${type} - ${doc.invoiceNo}`);
  };

  const handlePrintPDFDocument_OLD = (doc: any, type: 'TAX INVOICE' | 'DELIVERY NOTE' | 'WORK ORDER') => {
    const financials = getDocTotals(doc);
    const amountInWords = numberToAEDWords(financials.totalInclVat, doc.currency || 'AED');
    const itemsList = doc.items || [];
    
    const itemsHtml = itemsList.map((item: any, index: number) => {
      const safeQty = Number(item.qty) || 0;
      const safePrice = Number(item.unitPriceWOVAT) || 0;
      const safeVatRate = doc.isZeroRatedExport ? 0 : (item.vatRate !== undefined ? Number(item.vatRate) : 5);
      const netItem = safeQty * safePrice;
      const taxVal = netItem * (safeVatRate / 100);
      const grossAmt = netItem + taxVal;
      return `
        <tr style="border-bottom: 1px solid #000000; font-size: 8px; height: 22px; font-weight: 600; font-family: 'Inter', sans-serif;">
          <td style="border-right: 1px solid #000000; text-align: center; font-weight: 900; padding: 2px;">${index + 1}</td>
          <td style="border-right: 1px solid #000000; text-align: left; padding: 2px 5px; font-weight: bold; text-transform: uppercase; word-break: break-all; line-height: 1.25;">${item.description}</td>
          <td style="border-right: 1px solid #000000; text-align: right; padding: 2px 5px; font-family: 'JetBrains Mono', monospace; font-weight: bold;">${safeQty.toLocaleString()}</td>
          <td style="border-right: 1px solid #000000; text-align: center; font-weight: bold; text-transform: uppercase;">${item.unit || 'PCS.'}</td>
          <td style="border-right: 1px solid #000000; text-align: right; padding: 2px 5px; font-family: 'JetBrains Mono', monospace; font-weight: bold;">${safePrice.toFixed(4)}</td>
          <td style="border-right: 1px solid #000000; text-align: center; font-weight: bold; text-transform: lowercase; color: #64748b;">${item.per || item.unit?.toLowerCase() || 'pcs'}</td>
          <td style="border-right: 1px solid #000000; text-align: right; padding: 2px 5px; font-family: 'JetBrains Mono', monospace; font-weight: 900;">${netItem.toFixed(2)}</td>
          <td style="border-right: 1px solid #000000; text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: bold; background-color: rgba(245, 158, 11, 0.03);">${safeVatRate}%</td>
          <td style="border-right: 1px solid #000000; text-align: right; padding: 2px 5px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #dc2626; background-color: rgba(239, 68, 68, 0.03);">${taxVal.toFixed(2)}</td>
          <td style="text-align: right; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #1e3a8a; background-color: rgba(59, 130, 246, 0.03);">${grossAmt.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const emptyRowsCount = Math.max(0, 4 - itemsList.length);
    const emptyRowsHtml = Array.from({ length: emptyRowsCount }).map((_, i) => `
      <tr style="border-bottom: 1px solid #000000; height: 22px;">
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td style="border-right: 1px solid #000000;"></td>
        <td></td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${getFormattedDocTitle(type, doc)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            body {
              font-family: "Inter", sans-serif;
              color: #000000;
              background-color: #ffffff;
              margin: 0 !important;
              padding: 5mm 8mm 5mm 8mm !important;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 9px;
              line-height: 1.25;
            }
            .page-container {
              position: relative;
              width: 100%;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <!-- Background Watermark -->
            <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); color: #dc2626; opacity: 0.025; pointer-events: none; text-align: center; font-size: 75px; font-weight: 900; letter-spacing: 6px; text-transform: uppercase; font-family: sans-serif; white-space: nowrap; z-index: 0;">
              ${activeCompany.code || 'MFI'} ORIGINAL
            </div>

            <!-- Header / Letterhead Block -->
            <div style="display: table; width: 100%; border-bottom: 1px solid #000000; padding-bottom: 6px; box-sizing: border-box; z-index: 1; position: relative;">
              <div style="display: table-row;">
                <!-- Left Supplier Details -->
                <div style="display: table-cell; width: 58%; vertical-align: top; text-align: left;">
                  <span style="display: block; font-size: 7.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px;">
                    SUPPLIER / EXPORTER :
                  </span>
                  <h1 style="font-size: 11px; font-weight: 900; color: #000000; line-height: 1.3; margin: 0 0 4px 0; text-transform: uppercase;">
                    ${(activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.').toUpperCase()}
                  </h1>
                  <div style="font-size: 8px; text-transform: uppercase; color: #334155; line-height: 1.35; font-family: 'JetBrains Mono', monospace;">
                    <div style="margin-bottom: 2px;"><strong>ADD:</strong> ${(activeCompany.address || 'PLOT NUMBER #0654, SHED NO # 31, NEW INDUSTRIAL AREA AJMAN, UNITED ARAB EMIRATES.').toUpperCase()}</div>
                    <div><strong>TELEPHONE:</strong> ${activeCompany.phone || '+971-6-525-0526'} &nbsp;|&nbsp; <strong>EMAIL:</strong> ${(activeCompany.email || 'ADMIN@MARINEFASTENERS.CO').toUpperCase()}</div>
                    <div style="color: #0284c7; margin-top: 1px;"><strong>WEBSITE:</strong> ${(activeCompany.website || 'WWW.MARINEFASTENERS.CO').toUpperCase()}</div>
                    <div style="margin-top: 3px; font-weight: bold; color: #000000; font-size: 8.5px;">TRN: ${activeCompany.trn || '100440509600003'}</div>
                  </div>
                </div>

                <!-- Right Metadata Details -->
                <div style="display: table-cell; width: 42%; vertical-align: top; padding-left: 10px;">
                  <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-family: 'JetBrains Mono', monospace; font-size: 8px; text-align: left; line-height: 1.2;">
                    <tr style="border-bottom: 1.5px solid #000000;">
                      <td style="padding: 2.5px 4px; width: 50%; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">INVOICE NO</span>
                        <span style="font-weight: 900; color: #000000; font-size: 9px;">${doc.invoiceNo || '—'}</span>
                      </td>
                      <td style="padding: 2.5px 4px; width: 50%; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">DATED</span>
                        <span style="font-weight: 900; color: #000000; font-size: 9px;">${doc.dated || '—'}</span>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1.5px solid #000000;">
                      <td style="padding: 2.5px 4px; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">WORK ORDER NO</span>
                        <span style="font-weight: bold; color: #000000;">${doc.workOrderNo || '—'}</span>
                      </td>
                      <td style="padding: 2.5px 4px; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">QUOTATION REF</span>
                        <span style="font-weight: bold; color: #000000;">${doc.quotationRef || '—'}</span>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1.5px solid #000000;">
                      <td style="padding: 2.5px 4px; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">SELLER</span>
                        <span style="font-weight: bold; color: #000000;">${doc.sAcc || '—'}</span>
                      </td>
                      <td style="padding: 2.5px 4px; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">LPO/PO NUMBER</span>
                        <span style="font-weight: bold; color: #000000;">${doc.lpoNo || '—'}</span>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1.5px solid #000000;">
                      <td style="padding: 2.5px 4px; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">PAYMENT TERMS</span>
                        <span style="font-weight: bold; color: #000000; text-transform: uppercase;">${doc.paymentTerms || '30 DAYS'}</span>
                      </td>
                      <td style="padding: 2.5px 4px; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">PR NO.</span>
                        <span style="font-weight: bold; color: #000000;">${doc.prNo || '—'}</span>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1.5px solid #000000;">
                      <td style="padding: 2.5px 4px; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">RFQ NO.</span>
                        <span style="font-weight: bold; color: #000000;">${doc.rfqNo || '—'}</span>
                      </td>
                      <td style="padding: 2.5px 4px; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">DISPATCH BY</span>
                        <span style="font-weight: bold; color: #000000; text-transform: uppercase;">${doc.dispatchBy || 'BY ROAD/MIX MOOD'}</span>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1.5px solid #000000;">
                      <td style="padding: 2.5px 4px; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">DELIVERY MOOD.</span>
                        <span style="font-weight: bold; color: #000000; text-transform: uppercase;">${doc.deliveryMode || 'CARGO'}</span>
                      </td>
                      <td style="padding: 2.5px 4px; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">CURRENCY</span>
                        <span style="font-weight: bold; color: #000000; text-transform: uppercase;">${doc.currency || 'AED'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 2.5px 4px; border-right: 1.5px solid #000000; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">MADE IN.</span>
                        <span style="font-weight: bold; color: #000000;">UAE</span>
                      </td>
                      <td style="padding: 2.5px 4px; vertical-align: top;">
                        <span style="display: block; font-size: 7px; font-family: sans-serif; font-weight: bold; color: #64748b; text-transform: uppercase;">HS CODE</span>
                        <span style="font-weight: bold; color: #000000;">73181500</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>

            <!-- Centered Document Title -->
            <div style="text-align: center; margin: 10px 0;">
              <h2 style="font-size: 16px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; margin: 0; font-family: sans-serif; color: #000000; line-height: 1.2;">
                ${type}
              </h2>
            </div>

            <!-- Client / Buyer Box -->
            <div style="border: 1.5px solid #000000; border-radius: 6px; padding: 8px; background-color: #ffffff; margin-bottom: 10px; display: table; width: 100%; box-sizing: border-box; text-align: left;">
              <div style="display: table-row;">
                <div style="display: table-cell; width: 58%; vertical-align: top;">
                  <span style="display: block; font-size: 7px; font-family: monospace; font-weight: bold; color: #000000; text-transform: uppercase; margin-bottom: 2px;">CLIENT / BUYER:</span>
                  <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; line-height: 1.2; font-family: sans-serif;">${doc.buyerName}</div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #334155; white-space: pre-wrap; line-height: 1.35; margin-top: 4px; text-transform: uppercase; font-family: sans-serif;">
                    ${doc.buyerAddress || '—'}
                  </div>
                </div>
                <div style="display: table-cell; width: 42%; vertical-align: middle; border-left: 1.5px solid #000000; padding-left: 12px; font-family: monospace; font-size: 8px; line-height: 1.45; box-sizing: border-box;">
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1.5px;">
                    <span>Phone No:</span>
                    <span style="font-weight: 900; color: #0f172a;">${doc.buyerPhone || '—'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1.5px; margin-top: 2px;">
                    <span>Fax No:</span>
                    <span style="font-weight: 900; color: #0f172a;">${doc.buyerFax || '—'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1.5px; margin-top: 2px;">
                    <span>P.O. Box:</span>
                    <span style="font-weight: 900; color: #ea580c;">${doc.buyerPoBox || '—'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1.5px; margin-top: 2px;">
                    <span>TRN:</span>
                    <span style="font-weight: 900; color: #0d9488; letter-spacing: 0.3px;">${doc.buyerTRN || '—'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 2px;">
                    <span>Supply Place:</span>
                    <span style="font-weight: 900; color: #0f172a; text-transform: uppercase;">${doc.placeOfSupply || 'DUBAI, UAE'}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 10-COLUMN ITEMS TABLE -->
            <div style="border: 1.5px solid #000000; border-radius: 6px; overflow: hidden; margin-bottom: 10px;">
              <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8px; text-transform: uppercase; font-family: monospace;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 2px solid #000000; height: 26px; color: #000000; font-family: sans-serif; font-weight: bold;">
                    <th style="border-right: 1px solid #000000; width: 4%; font-weight: 900; padding: 2px;">S.NO.</th>
                    <th style="border-right: 1px solid #000000; width: 33%; font-weight: 900; text-align: left; padding: 2px 5px;">ITEM DESCRIPTION</th>
                    <th style="border-right: 1px solid #000000; width: 7%; font-weight: 900; text-align: right; padding: 2px 5px;">QTY</th>
                    <th style="border-right: 1px solid #000000; width: 7%; font-weight: 900; padding: 2px;">UNIT</th>
                    <th style="border-right: 1px solid #000000; width: 9%; font-weight: 900; text-align: right; padding: 2px 5px;">RATE (AED)</th>
                    <th style="border-right: 1px solid #000000; width: 7%; font-weight: 900; padding: 2px;">PER</th>
                    <th style="border-right: 1px solid #000000; width: 9%; font-weight: 900; text-align: right; padding: 2px 5px;">AMOUNT</th>
                    <th style="border-right: 1px solid #000000; width: 6%; font-weight: 900; padding: 2px;">VAT %</th>
                    <th style="border-right: 1px solid #000000; width: 9%; font-weight: 900; text-align: right; padding: 2px 5px;">TAX AMT</th>
                    <th style="width: 9%; font-weight: 900; text-align: right; padding: 2px 6px;">LINE TOTAL</th>
                  </tr>
                </thead>
                <tbody style="font-family: sans-serif; color: #000000;">
                  ${itemsHtml}
                  ${emptyRowsHtml}
                </tbody>
              </table>
            </div>

            <!-- Financial Totals & Bank Details Block -->
            <div style="border: 1.5px solid #000000; border-radius: 6px; overflow: hidden; display: table; width: 100%; box-sizing: border-box; background-color: #ffffff; text-align: left; margin-bottom: 8px;">
              <div style="display: table-row;">
                <!-- Left side (Words + Bank Details) -->
                <div style="display: table-cell; width: 58%; vertical-align: top; border-right: 1.5px solid #000000; padding: 6px; box-sizing: border-box;">
                  <div>
                    <span style="display: block; font-size: 7px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Amount in Words:</span>
                    <div style="font-family: monospace; font-weight: 900; font-size: 8.5px; color: #0f172a; text-transform: uppercase; word-break: break-all; line-height: 1.3;">
                      ${amountInWords}
                    </div>
                  </div>
                  <div style="border-top: 1px dashed #cbd5e1; margin-top: 5px; padding-top: 5px; font-size: 7.5px; line-height: 1.4; color: #000000;">
                    <div style="font-weight: 900; color: #1e3a8a; font-size: 8px; margin-bottom: 2px;">🏦 BANK DETAILS</div>
                    <div>Beneficiary: <strong>${activeCompany.bankBeneficiary || activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.'}</strong> | Bank: <strong>${activeCompany.bankName || 'RAK BANK'}</strong></div>
                    <div>Account: <strong>${activeCompany.accountNo || '0242715908001'}</strong> | IBAN: <strong>${activeCompany.iban || 'AE 940400000242715908001'}</strong> | Swift: <strong>${activeCompany.swift || 'NRAKAEAK'}</strong></div>
                  </div>
                </div>

                <!-- Right side (Totals breakdown + NET payable box) -->
                <div style="display: table-cell; width: 42%; vertical-align: top; padding: 6px; box-sizing: border-box; font-family: monospace; font-size: 8.5px; line-height: 1.45;">
                  <div style="font-weight: 600;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5px;">
                      <span>Subtotal Excl. VAT</span>
                      <span>${financials.netTaxable.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5px;">
                      <span>Discount</span>
                      <span style="color: #b91c1c;">(${financials.discount.toFixed(2)})</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5px;">
                      <span>VAT Value (5%)</span>
                      <span>${financials.vat.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span>Freight</span>
                      <span>${financials.freight.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style="margin-top: 4px;">
                    <div style="background-color: #f0fdf4; border: 2px double #0d9488; border-radius: 4px; padding: 4px; text-align: center;">
                      <span style="color: #0f766e; font-size: 7.5px; font-weight: 900; text-transform: uppercase; tracking-wider: 0.3px; display: block; margin-bottom: 1.5px;">NET AMOUNT PAYABLE</span>
                      <span style="font-size: 12px; font-weight: 900; color: #0f172a; display: block; font-family: monospace;">
                        ${doc.currency || 'AED'} : ${financials.totalInclVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Terms and Conditions Disclaimer -->
            <div style="text-align: left; font-size: 7px; color: #64748b; font-family: sans-serif; font-weight: 600; text-transform: uppercase; line-height: 1.3; margin-bottom: 12px;">
              <span style="font-weight: bold; color: #334155; display: block;">Terms & Conditions</span>
              1. GOODS RECEIVED IN PERFECT SOLID CONDITION AND CORRECT SPECIFICATION IS NOT REFUNDABLE.<br/>
              2. PAYMENT TO BE CREDITED TO ${activeCompany.bankName || 'RAK BANK INT'}, DUBAI, UAE.<br/>
              3. INTEREST RATE OF 12% PER ANNUM SHALL APPLY ON OVERDUE BILLS.
            </div>

            <!-- Acknowledgement and Signatures Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <p style="font-size: 8px; font-weight: 900; color: #000000; text-transform: uppercase; margin-bottom: 12px; text-align: left;">
                Acknowledgement:- Received the above goods in correct Quantity & Quality
              </p>

              <div style="display: table; width: 100%; font-size: 8px; font-family: sans-serif; margin-top: 15px;">
                <div style="display: table-row;">
                  <div style="display: table-cell; width: 45%; border-top: 1px solid #cbd5e1; text-align: center; vertical-align: top; padding-top: 4px;">
                    <p style="font-weight: bold; color: #1e293b; margin: 0; text-transform: uppercase;">CUSTOMER'S SEAL AND SIGNATURE</p>
                  </div>
                  <div style="display: table-cell; width: 10%;"></div>
                  <div style="display: table-cell; width: 45%; border-top: 1px solid #cbd5e1; text-align: center; vertical-align: top; padding-top: 4px;">
                    <p style="font-weight: bold; color: #1e293b; margin: 0; text-transform: uppercase; line-height: 1.25;">
                      FOR ${(activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.').toUpperCase()}
                    </p>
                    <p style="font-weight: 900; color: #0f172a; font-size: 8.5px; margin: 10px 0 0 0; letter-spacing: 0.3px; text-transform: uppercase;">
                      AUTHORIZED SIGNATORY
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom system footer -->
            <div style="text-align: center; font-size: 6.5px; color: #94a3b8; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 4px;">
              SYSTEM GENERATED RECORD
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `${type} - ${doc.invoiceNo}`);
  };

  const handlePrintReport = () => {
    // Generate beautiful landscape table rows for each filtered document
    const rowsHtml = filteredDocuments.map((doc, index) => {
      const { itemSum, discount, vat, totalInclVat } = getDocTotals(doc);
      const netTaxable = itemSum - discount;
      const displayInv = doc.invoiceNo;
      const invoiceNoStr = doc.documentType === 'TAX INVOICE' ? displayInv : (doc.associatedInvoiceNo || '—');
      const workOrderNoStr = doc.workOrderNo || doc.associatedWorkOrderNo || '—';
      const companyDetailsStr = doc.buyerName || '—';
      const sellerCodeStr = doc.sAcc || '—';

      return `
        <tr style="height: 22px; text-align: center;">
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">${workOrderNoStr}</td>
          <td style="border: 1px solid #cbd5e1;">${doc.dated || '—'}</td>
          <td style="border: 1px solid #cbd5e1;">${doc.lpoNo || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #dc2626;">${invoiceNoStr}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding-left: 6px; font-weight: bold; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${companyDetailsStr}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: 800; color: #4338ca; font-family: monospace;">${sellerCodeStr}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace;">${netTaxable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace;">${vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace; font-weight: bold; color: #0f172a;">${totalInclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
      `;
    }).join('');

    const emptyRowsCount = Math.max(0, 10 - filteredDocuments.length);
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
        <td style="border: 1px solid #e2e8f0;"></td>
        <td style="border: 1px solid #e2e8f0;"></td>
      </tr>
    `).join('');

    const filtersApplied = [
      selectedBuyer !== 'all' ? `BUYER: ${selectedBuyer}` : '',
      startDate ? `FROM: ${startDate}` : '',
      endDate ? `TO: ${endDate}` : '',
      selectedSeller !== 'all' ? `SELLER: ${selectedSeller.toUpperCase()}` : '',
      searchQuery ? `SEARCH: "${searchQuery}"` : ''
    ].filter(Boolean).join(' | ') || 'ALL RECORDS';

    const activeComp = activeCompany || getActiveCompany();
    const compCode = (activeComp?.code || activeComp?.shortName || 'ERP').toUpperCase();
    const compName = (activeComp?.name || 'COMPANY LLC').toUpperCase();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${compName} - Sales Ledger Report</title>
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
              font-size: 7.5px;
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
                  <h2 style="font-size: 12px; font-weight: 900; color: #083c54; margin: 0 0 3px 0; text-transform: uppercase; letter-spacing: 0.05em;">SALES & LEDGER REPORT</h2>
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
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Sales (VAT Excl.)</span>
                <span style="font-size: 11px; font-weight: 900; color: #0f172a; font-family: monospace; display: block; margin-top: 2px;">AED ${metrics.totalExclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div style="border-right: 1px solid #cbd5e1; padding-right: 14px;">
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Output VAT (5%)</span>
                <span style="font-size: 11px; font-weight: 900; color: #0f172a; font-family: monospace; display: block; margin-top: 2px;">AED ${metrics.totalVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div>
                <span style="font-size: 6.5px; font-weight: bold; color: #94a3b8; text-transform: uppercase; tracking-wider; display: block;">Revenue (VAT Incl.)</span>
                <span style="font-size: 11px; font-weight: 900; color: #15803d; font-family: monospace; display: block; margin-top: 2px;">AED ${metrics.totalInclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>

            <!-- Ledger Table -->
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 7.5px; text-transform: uppercase; margin-bottom: 12px;">
              <thead>
                <tr style="background: #f1f5f9; font-weight: bold; border-bottom: 1.5px solid #0f172a; height: 24px; text-align: center; color: #475569;">
                  <th style="border: 1px solid #cbd5e1; width: 22px;">S.N.</th>
                  <th style="border: 1px solid #cbd5e1; width: 55px;">WO NO</th>
                  <th style="border: 1px solid #cbd5e1; width: 48px;">DATE</th>
                  <th style="border: 1px solid #cbd5e1; width: 52px;">LPO NO</th>
                  <th style="border: 1px solid #cbd5e1; width: 58px;">INVOICE</th>
                  <th style="border: 1px solid #cbd5e1; text-align: left; padding-left: 5px;">COMPANY DETAILS</th>
                  <th style="border: 1px solid #cbd5e1; width: 38px;">SELLER</th>
                  <th style="border: 1px solid #cbd5e1; width: 62px; text-align: right; padding-right: 5px;">TAXABLE</th>
                  <th style="border: 1px solid #cbd5e1; width: 45px; text-align: right; padding-right: 5px;">VAT</th>
                  <th style="border: 1px solid #cbd5e1; width: 65px; text-align: right; padding-right: 5px;">TOTAL</th>
                </tr>
              </thead>
              <tbody style="color: #334155;">
                ${rowsHtml}
                ${emptyRowsHtml}
                <!-- Consolidated Totals Row -->
                <tr style="height: 24px; background-color: #f8fafc; font-weight: 900; border-top: 1.5px solid #0f172a; color: #0f172a; text-align: right;">
                  <td colspan="7" style="border: 1px solid #cbd5e1; text-align: left; padding-left: 5px; font-weight: 900;">CONSOLIDATED TOTALS</td>
                  <td style="border: 1px solid #cbd5e1; padding-right: 5px; font-family: monospace;">AED ${metrics.totalExclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding-right: 5px; font-family: monospace;">AED ${metrics.totalVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding-right: 5px; font-family: monospace; color: #15803d; font-size: 8.5px;">AED ${metrics.totalInclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 20px; display: flex; justify-content: space-between; font-size: 7px; font-weight: bold; color: #94a3b8; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">
              <span>SYSTEM GENERATED SALES RECORD</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `Sales_Ledger_Report`);
    triggerToast("Initiating page-fitted printed sales ledger report...");
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans select-none">
      
      <div className="space-y-6 print:hidden">
        {/* Header section */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#083c54]" />
            Sales Report
          </h2>
        </div>

      {/* Metrics Cards Grid - Simplified & Compact (Revenue Box Simple) */}
      <div className="bg-slate-50 border border-[#A6C4DE]/60 p-2.5 shadow-3xs rounded flex flex-wrap gap-x-6 gap-y-2 items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="border-r border-slate-200 pr-5">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Count</span>
            <span className="text-sm font-black text-[#083c54] font-mono mt-0.5 block">{metrics.count}</span>
          </div>
          <div className="border-r border-slate-200 pr-5">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Sales (VAT Excl.)</span>
            <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
              AED {metrics.totalExclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-r border-slate-200 pr-5">
            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">Output VAT (5%)</span>
            <span className="text-sm font-black text-slate-800 font-mono mt-0.5 block">
              AED {metrics.totalVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-250/80 px-2 py-0.5 rounded shadow-3xs flex flex-col justify-center max-w-fit">
            <span className="text-[8px] font-bold text-emerald-600 block tracking-wider uppercase">Revenue (VAT Incl.)</span>
            <span className="text-xs font-black text-emerald-800 font-mono block">
              AED {metrics.totalInclVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Inline Compact Search & Filters (Moved next to Revenue) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* General Search */}
          <div className="relative w-40">
            <input
              type="text"
              placeholder="SEARCH CLIENT, INVOICE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[9px] pl-5 pr-1.5 py-0.5 border border-slate-300 rounded font-sans uppercase font-bold focus:outline-none focus:border-[#083c54] h-6 bg-white"
            />
            <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1.5" />
          </div>

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

          {/* Seller Selection / Clearance */}
          {isAdmin ? (
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="text-[9px] px-1 border border-slate-300 rounded bg-white font-bold uppercase focus:outline-none focus:border-[#083c54] h-6 w-24"
            >
              <option value="all">SELLER (ALL)</option>
              {uniqueSellers.map(seller => (
                <option key={seller} value={seller}>{seller}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-900 px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono h-6" title="Restricted to your own seller reports">
              <ShieldCheck className="w-3 h-3 text-amber-700 shrink-0" />
              <span>SELLER: {userSellerCode}</span>
            </div>
          )}

          {/* Clear Filters */}
          {(searchQuery || selectedBuyer !== 'all' || startDate || endDate || (isAdmin && selectedSeller !== 'all')) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBuyer('all');
                setStartDate('');
                setEndDate('');
                if (isAdmin) {
                  setSelectedSeller('all');
                } else {
                  setSelectedSeller(userSellerCode);
                }
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

      {/* List Table: styled EXACTLY like the screenshot */}
      <div className="box-shaped overflow-x-auto bg-white">
        <table className="box-shaped-table w-full text-left font-sans text-[10px] uppercase table-fixed min-w-[850px] max-w-full">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[70px]" />
            <col className="w-[75px]" />
            <col className="w-[80px]" />
            <col className="w-[150px]" />
            <col className="w-[60px]" />
            <col className="w-[95px]" />
            <col className="w-[85px]" />
            <col className="w-[95px]" />
            <col className="w-[65px]" />
          </colgroup>
          <thead>
            <tr className="h-8 text-center">
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">WORK ORDER NO</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">DATE</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">LPO NO</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">INVOICE NO</th>
              <th className="p-1 py-1.5 text-left pl-3 border border-[#052a3a]">COMPANY DETAILS</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">SELLER CODE</th>
              <th className="p-1 py-1.5 text-right pr-3 border border-[#052a3a]">TAXABLE AMOUNT</th>
              <th className="p-1 py-1.5 text-right pr-3 border border-[#052a3a]">VAT AMOUNT</th>
              <th className="p-1 py-1.5 text-right pr-3 border border-[#052a3a]">TOTAL AMOUNT</th>
              <th className="p-1 py-1.5 text-center border border-[#052a3a]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[10px]">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-10 text-center text-slate-500 italic bg-slate-50 font-sans">
                  No matching sales records found in terminal registry.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc, idx) => {
                const { itemSum, discount, netTaxable, vat, totalInclVat } = getDocTotals(doc);
                const displayDN = doc.associatedDeliveryNoteNo || doc.associatedInvoiceNo || doc.invoiceNo;
                const displayInv = doc.invoiceNo;

                const isSelected = selectedRowIndex === idx;

                return (
                  <tr 
                    key={doc.invoiceNo + '-' + idx} 
                    onClick={() => setSelectedRowIndex(idx)}
                    className={`divide-x divide-slate-300 h-9 text-slate-900 transition-colors group border-b border-slate-300 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/90 ring-1 ring-indigo-400 ring-inset' : 'hover:bg-neutral-50 bg-white'
                    }`}
                  >
                    {/* 1. WORK ORDER NO (Orange colored as requested) */}
                    <td className="p-1 text-center font-sans">
                      <span className="text-[#f37021] font-bold text-[10px] font-mono tracking-wide">
                        {doc.workOrderNo || doc.associatedWorkOrderNo || 'WO-260246'}
                      </span>
                    </td>

                    {/* 2. DATE */}
                    <td className="p-1 text-center font-sans text-slate-700 font-medium">
                      {doc.dated || '—'}
                    </td>

                    {/* 3. LPO NO */}
                    <td className="p-1 text-center font-sans text-slate-700 font-medium">
                      {doc.lpoNo || '—'}
                    </td>

                    {/* 4. INVOICE NO */}
                    <td className="p-1 text-center font-sans text-slate-800 font-bold font-mono">
                      {doc.documentType === 'TAX INVOICE' ? displayInv : (doc.associatedInvoiceNo || '—')}
                    </td>

                    {/* 5. COMPANY DETAILS */}
                    <td className="p-1 text-left px-3 font-sans font-bold text-slate-800 max-w-[150px] truncate">
                      <div className="flex flex-col">
                        <span className="truncate">{doc.buyerName || '—'}</span>
                      </div>
                    </td>

                    {/* 5b. SELLER CODE */}
                    <td className="p-1 text-center font-sans font-extrabold text-indigo-700 font-mono text-[10.5px]">
                      {doc.sAcc || '—'}
                    </td>

                    {/* 6. TAXABLE AMOUNT */}
                    <td className="p-1 text-right pr-3 font-sans font-semibold text-slate-700 font-mono">
                      AED {netTaxable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>

                    {/* 7. VAT AMOUNT */}
                    <td className="p-1 text-right pr-3 font-sans font-semibold text-rose-600 font-mono">
                      AED {vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>

                    {/* 8. TOTAL AMOUNT */}
                    <td className="p-1 text-right pr-3 font-sans font-black text-slate-900 font-mono">
                      AED {totalInclVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>

                    {/* 9. ACTIONS (TAX INVOICE PRINT, DELETE) */}
                    <td className="p-1 text-center font-sans">
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        
                        {/* Tax Invoice Print PDF button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                            setPreviewType('TAX INVOICE');
                          }}
                          className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 border border-emerald-150 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                          title="Print/Preview Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        </button>

                        {/* E-Invoice Compliance Modal */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEInvoice(doc);
                          }}
                          className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                          title="UAE FTA E-Invoice (UBL 2.1 XML / QR / Validation)"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        </button>

                        {/* Trash/Delete icon */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDoc(doc.invoiceNo, e)}
                          className="p-1 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                          title="Delete Document Record"
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
          if (filteredDocuments.length > 0) {
            setSelectedRowIndex(prev => (prev + 1) % filteredDocuments.length);
          }
        }}
        selectColumnLabel="Select Row"
        onDrillDown={() => {
          const sel = filteredDocuments[selectedRowIndex];
          if (sel) {
            setPreviewDoc(sel);
            setPreviewType('TAX INVOICE');
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
          if (hiddenDocNos.length > 0) {
            setHiddenDocNos([]);
            triggerToast?.('All hidden invoice lines restored.');
          } else {
            const sel = filteredDocuments[selectedRowIndex];
            if (sel) {
              setHiddenDocNos(prev => [...prev, sel.invoiceNo]);
              triggerToast?.(`Invoice ${sel.invoiceNo} hidden from view (Press U to restore).`);
            }
          }
        }}
        isLineRemoved={hiddenDocNos.length > 0}
        removeLineLabel="Remove Line"
        restoreLineLabel="Restore Line"
        onPrint={() => {
          handlePrintReport();
        }}
        onExport={() => {
          handleExportCSV();
        }}
        totalRecordsCount={filteredDocuments.length}
      />
      </div>

      {/* DOCUMENT PREVIEW MODAL OVERLAY (HIGH FIDELITY COPIED FROM ACTIVE DESIGNS) */}
      {previewDoc && (() => {
        const activeType = previewType;
        const displayDocNo = previewDoc.invoiceNo;
        const financials = getDocTotals(previewDoc);
        const amountInWords = numberToAEDWords(financials.totalInclVat, previewDoc.currency || 'AED');
        const previewItems = previewDoc.items || [];
        const totalQty = previewItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
        
        return (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClosePreview();
              }
            }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex flex-col overflow-y-auto p-4 md:p-8 select-text no-print"
          >
            {/* Header Action Control Bar */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 text-white p-4 rounded-t-lg max-w-4xl w-full mx-auto border-x border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl select-none sticky top-0 z-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-teal-400 border border-slate-700 shadow-inner flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase tracking-wider text-teal-400 font-mono">
                    PDF Layout Previewer ({activeType})
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                    DOC NO: <span className="text-white font-bold">{displayDocNo}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Save / Print PDF */}
                <button
                  type="button"
                  onClick={() => handlePrintPDFDocument(previewDoc, 'TAX INVOICE')}
                  className="p-2 w-9 h-9 bg-red-600 hover:bg-red-700 text-white border border-red-700 rounded transition-all cursor-pointer flex items-center justify-center shadow-xs"
                  title="Save / Print PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Export Excel (Export CSV) */}
                <button
                  type="button"
                  onClick={() => handleExportCSV()}
                  className="p-2 w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded transition-all cursor-pointer flex items-center justify-center shadow-xs"
                  title="Export Sales Report"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>

                {/* Email Sharing */}
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(`Tax Invoice ${previewDoc.invoiceNo}`);
                    const body = encodeURIComponent(`Dear Sir,\n\nPlease find attached Tax Invoice No. ${previewDoc.invoiceNo} for your reference.\n\nBest Regards,\nMarine Fasteners Industries L.L.C.`);
                    window.location.href = `mailto:${previewDoc.buyerPhone || ''}?subject=${subject}&body=${body}`;
                    triggerToast(`Email client opened for ${previewDoc.buyerName}`);
                  }}
                  className="p-2 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded transition-all cursor-pointer flex items-center justify-center shadow-xs"
                  title="Send via Email"
                >
                  <Mail className="w-4 h-4 text-white" />
                </button>

                {/* UAE FTA E-Invoice Compliance & XML */}
                <button
                  type="button"
                  onClick={() => handleOpenEInvoice(previewDoc)}
                  className="p-2 w-9 h-9 bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 rounded transition-all cursor-pointer flex items-center justify-center shadow-xs"
                  title="UAE FTA E-Invoice (PEPPOL UBL 2.1 XML / QR / Validation)"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClosePreview();
                  }}
                  className="p-2 w-9 h-9 bg-slate-750 hover:bg-red-650 text-white border border-slate-600 rounded cursor-pointer transition-colors flex items-center justify-center shadow-xs"
                  title="Close Preview Window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Frame Area - exactly copied from high fidelity designs */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full mx-auto bg-white text-[#0f172a] shadow-2xl p-6 md:p-12 relative overflow-hidden font-sans border-x border-b border-slate-200 rounded-b-lg"
            >
              {/* Background Watermark */}
              <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] text-red-600 opacity-[0.03] select-none pointer-events-none text-7xl md:text-9xl font-bold uppercase tracking-widest leading-none text-center font-sans">
                {activeCompany.code || 'MFI'} ORIGINAL
              </div>

              {/* Header / Letterhead Block */}
              <div className="space-y-4">
                {/* Visual Header Grid */}
                <div className="flex flex-col md:flex-row md:items-stretch justify-between items-start gap-4 pb-4 border-b border-black text-left">
                    <div className="flex-1 min-w-[200px]">
                    <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-1">
                      SUPPLIER / EXPORTER :
                    </span>
                    <h1 className="text-[14px] font-extrabold text-black leading-snug m-0 uppercase font-sans">
                      {activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.'}
                    </h1>
                    <div className="text-[9.5px] text-slate-700 leading-normal mt-2 uppercase font-mono space-y-0.5">
                      <div>
                        <strong>ADD:</strong> {activeCompany.address || 'PLOT NUMBER #0654, SHED NO # 31, NEW INDUSTRIAL AREA AJMAN, UNITED ARAB EMIRATES.'}
                      </div>
                      <div>
                        <strong>TELEPHONE:</strong> {activeCompany.phone || '+971-6-525-0526'} | <strong>EMAIL:</strong> {activeCompany.email || 'ADMIN@MARINEFASTENERS.CO'}
                      </div>
                      <div className="text-slate-950 font-bold text-[10.5px] mt-1">
                        TRN: {activeCompany.trn || '100440509600003'}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px] max-w-md w-full md:pl-4">
                    <div className="border-[1.5px] border-black rounded-lg overflow-hidden bg-white">
                      <table className="w-full border-collapse text-[9.5px] font-mono text-left">
                        <tbody>
                          <tr className="border-b-[1.5px] border-black divide-x-[1.5px] divide-black">
                            <td className="p-1.5 w-1/2">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">INVOICE NO</span>
                              <span className="font-extrabold text-black">{previewDoc.invoiceNo || '—'}</span>
                            </td>
                            <td className="p-1.5 w-1/2">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">DATE</span>
                              <span className="font-extrabold text-black">{previewDoc.dated || '—'}</span>
                            </td>
                          </tr>
                          <tr className="border-b-[1.5px] border-black divide-x-[1.5px] divide-black">
                            <td className="p-1.5">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">WORK ORDER NO</span>
                              <span className="font-bold text-black">{previewDoc.workOrderNo || '—'}</span>
                            </td>
                            <td className="p-1.5">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">PO NO</span>
                              <span className="font-bold text-black">{previewDoc.lpoNo || '—'}</span>
                            </td>
                          </tr>
                          <tr className="border-b-[1.5px] border-black divide-x-[1.5px] divide-black">
                            <td className="p-1.5">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">MADE IN</span>
                              <span className="font-bold text-black">UAE</span>
                            </td>
                            <td className="p-1.5">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">PLACE OF SUPPLY</span>
                              <span className="font-bold text-black uppercase">{previewDoc.placeOfSupply || 'AJMAN, UAE'}</span>
                            </td>
                          </tr>
                          <tr className="divide-x-[1.5px] divide-black">
                            <td className="p-1.5">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">CURRENCY</span>
                              <span className="font-extrabold text-orange-600">{previewDoc.currency || 'AED'}</span>
                            </td>
                            <td className="p-1.5">
                              <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase mb-0.5">SELLER</span>
                              <span className="font-bold text-black">{previewDoc.sAcc || '—'}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Centered large document title */}
                <div className="text-center my-6">
                  <h2 className="text-[24px] sm:text-[26px] font-black tracking-[0.15em] uppercase m-0 text-black font-sans select-text">
                    TAX INVOICE
                  </h2>
                </div>

                {/* Client / Buyer Box */}
                <div className="border-[1.5px] border-black p-3 rounded-lg bg-white my-3 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-7">
                      <span className="block text-[8px] font-mono font-bold text-black uppercase mb-1">CLIENT / BUYER:</span>
                      <div className="text-[13px] font-black text-blue-900 uppercase leading-tight font-sans">{previewDoc.buyerName || '—'}</div>
                      <div className="text-[10px] font-bold text-slate-700 whitespace-pre-wrap leading-normal mt-1 uppercase font-sans">
                        {previewDoc.buyerAddress || '—'}
                      </div>
                    </div>
                    <div className="md:col-span-5 border-t md:border-t-0 md:border-l-[1.5px] border-black pt-2 md:pt-0 md:pl-4 space-y-1 text-[9.5px] flex flex-col justify-center font-mono">
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
                        <span>Phone:</span>
                        <span className="font-black text-slate-900">{previewDoc.buyerPhone || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
                        <span>P.O. Box:</span>
                        <span className="font-black text-orange-600">{previewDoc.buyerPoBox || '—'}</span>
                      </div>
                      {previewDoc.buyerTRN && (
                        <div className="flex justify-between bg-teal-50/50 border border-dashed border-teal-300 p-0.5 px-1 rounded items-center mt-1">
                          <span className="text-teal-700 font-bold text-[8.5px]">TRN:</span>
                          <span className="font-black text-teal-800 tracking-wider text-[11px]">{previewDoc.buyerTRN}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 10-COLUMN ITEMS TABLE */}
                <div className="overflow-x-auto my-4 border-[1.5px] border-black rounded-lg">
                  <table className="w-full text-center text-[8.5px] uppercase font-mono border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-[2px] border-black divide-x divide-black h-8 text-black font-sans font-bold">
                        <th className="w-[4%] p-1 font-black">S.NO.</th>
                        <th className="w-[33%] p-1 text-left pl-2 font-black">ITEM DESCRIPTION</th>
                        <th className="w-[7%] p-1 text-right pr-1 font-black">QTY</th>
                        <th className="w-[7%] p-1 font-black">UNIT</th>
                        <th className="w-[9%] p-1 text-right pr-1 font-black">RATE (AED)</th>
                        <th className="w-[7%] p-1 font-black">PER</th>
                        <th className="w-[9%] p-1 text-right pr-1 font-black">AMOUNT</th>
                        <th className="w-[6%] p-1 font-black">VAT %</th>
                        <th className="w-[9%] p-1 text-right pr-1 font-black">TAX AMT</th>
                        <th className="w-[9%] p-1 text-right pr-2 font-black">LINE TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-sans text-black">
                      {previewItems.map((item, index) => {
                        const safeQty = Number(item.qty) || 0;
                        const safePrice = Number(item.unitPriceWOVAT) || 0;
                        const safeVatRate = previewDoc.isZeroRatedExport ? 0 : (item.vatRate !== undefined ? Number(item.vatRate) : 5);
                        const netItem = safeQty * safePrice;
                        const taxVal = netItem * (safeVatRate / 100);
                        const grossAmt = netItem + taxVal;
                        return (
                          <tr key={item.id || index} className="divide-x divide-black text-[9px] h-7 font-semibold font-sans text-black odd:bg-white even:bg-slate-50/10">
                            <td className="p-1 text-center font-black">{index + 1}</td>
                            <td className="p-1 text-left font-bold pl-2 leading-tight uppercase break-words">{item.description}</td>
                            <td className="p-1 text-right pr-1 font-mono font-bold">{safeQty.toLocaleString()}</td>
                            <td className="p-1 text-center font-bold uppercase">{item.unit || 'PCS.'}</td>
                            <td className="p-1 text-right pr-1 font-mono font-bold">{safePrice.toFixed(4)}</td>
                            <td className="p-1 text-center font-bold lowercase text-slate-500">{item.per || item.unit?.toLowerCase() || 'pcs'}</td>
                            <td className="p-1 text-right pr-1 font-mono font-black">{netItem.toFixed(2)}</td>
                            <td className="p-1 text-center font-mono font-bold bg-amber-50/10">{safeVatRate}%</td>
                            <td className="p-1 text-right pr-1 font-mono font-black text-red-600 bg-red-50/10">{taxVal.toFixed(2)}</td>
                            <td className="p-1 text-right pr-2 font-mono font-black text-blue-900 bg-blue-50/10">{grossAmt.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {/* Pad with empty rows to look professional if items count is low */}
                      {Array.from({ length: Math.max(0, 4 - previewItems.length) }).map((_, i) => (
                        <tr key={`empty-pad-${i}`} className="divide-x divide-black h-7">
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                          <td className="p-1"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals & Bank Details Block */}
                <div className="border-[1.5px] border-black rounded-lg mt-4 overflow-hidden bg-white text-left flex flex-col md:flex-row font-sans">
                  <div className="flex-1 md:w-[58%] border-b md:border-b-0 md:border-r-[1.5px] border-black p-3 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Amount in Words:</span>
                      <div className="font-mono font-extrabold text-[9.5px] text-slate-900 uppercase break-words leading-relaxed">{amountInWords}</div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-2 text-[8px] leading-relaxed text-black">
                      <div className="font-extrabold text-[#1e3a8a] text-[8.5px] mb-1">🏦 BANK DETAILS</div>
                      <div>Beneficiary: <strong>{activeCompany.bankBeneficiary || activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.'}</strong> | Bank: <strong>{activeCompany.bankName || 'RAK BANK'}</strong></div>
                      <div>Account: <strong>{activeCompany.accountNo || '0242715908001'}</strong> | IBAN: <strong>{activeCompany.iban || 'AE 940400000242715908001'}</strong> | Swift: <strong>{activeCompany.swift || 'NRAKAEAK'}</strong></div>
                    </div>
                  </div>
                  <div className="md:w-[42%] p-3 text-[10px] font-mono divide-y divide-slate-100 flex flex-col justify-between">
                    <div className="space-y-1 pb-1.5 font-semibold">
                      <div className="flex justify-between">
                        <span>Subtotal Excl. VAT</span>
                        <span>{financials.netTaxable.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span className="text-rose-650">({financials.discount.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Value (5%)</span>
                        <span>{financials.vat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Freight</span>
                        <span>{financials.freight.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="pt-1.5">
                      <div className="bg-teal-50 border-[2px] border-double border-teal-600 rounded p-2 text-center">
                        <span className="text-teal-800 text-[8px] font-black uppercase tracking-wider block mb-0.5">NET AMOUNT PAYABLE</span>
                        <span className="text-[14px] font-black text-slate-900 block font-mono">
                          {previewDoc.currency || 'AED'} : {financials.totalInclVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Disclaimer */}
                <div className="text-left text-[8px] text-slate-500 font-sans mt-3 font-semibold uppercase leading-normal">
                  <span className="font-bold text-slate-700 block uppercase">Terms & Conditions</span>
                  1. GOODS RECEIVED IN PERFECT SOLID CONDITION AND CORRECT SPECIFICATION IS NOT REFUNDABLE.<br/>
                  2. PAYMENT TO BE CREDITED TO {activeCompany.bankName || 'RAK BANK INT'}, DUBAI, UAE.<br/>
                  3. INTEREST RATE OF 12% PER ANNUM SHALL APPLY ON OVERDUE BILLS.
                </div>

                {/* Acknowledgement and Signatures Footer */}
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <p className="text-[9.5px] font-extrabold text-black uppercase mb-8 text-left">
                    Acknowledgement:- Received the above goods in correct Quantity & Quality
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[9.5px] font-sans mt-12">
                    <div className="text-left border-t border-slate-300 pt-3">
                      <p className="font-bold text-slate-800 uppercase">CUSTOMER'S SEAL AND SIGNATURE</p>
                    </div>
                    <div className="text-center pt-3">
                      {/* empty space in between */}
                    </div>
                    <div className="text-center border-t border-slate-300 pt-3 flex flex-col items-center justify-between min-h-[4rem]">
                      <p className="font-bold text-slate-800 uppercase">
                        FOR {activeCompany.name || 'MARINE FASTENERS INDUSTRIES L.L.C.'}
                      </p>
                      <p className="font-black text-slate-900 text-[10px] mt-6 tracking-wider uppercase">
                        AUTHORIZED SIGNATORY
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom line */}
                <div className="text-center text-[7px] text-slate-400 font-mono uppercase tracking-widest mt-12 pt-4 border-t border-slate-100">
                  SYSTEM GENERATED RECORD
                </div>

                {/* Bottom Modal Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClosePreview();
                    }}
                    className="p-2 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Close Preview</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* UAE FTA E-Invoice Compliance Modal */}
      {isEInvoiceModalOpen && (eInvoiceDoc || previewDoc) && (
        <UaeEInvoiceModal
          isOpen={isEInvoiceModalOpen}
          onClose={() => setIsEInvoiceModalOpen(false)}
          invoiceData={eInvoiceDoc || previewDoc}
          company={activeCompany}
        />
      )}

    </div>
  );
}
