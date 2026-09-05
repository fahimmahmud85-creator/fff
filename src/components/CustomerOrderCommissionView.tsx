import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, Printer, Save, Check, Award,
  ChevronRight, Calendar, Landmark, User, DollarSign, Database, Search, Edit2, Building2, RotateCcw
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { EditCompanyModal } from './EditCompanyModal';
import { getActiveCompany } from '../utils/companyProfile';

export interface CommissionItem {
  id: string;
  description: string;
  qty: number;
  netUnitPrice: number;
  commissionAmount: number;
}

export interface CustomerOrderCommission {
  id: string;
  invoiceDate: string;
  
  // Section 1
  incentiveCompany: string;
  poNumber: string;
  invoiceNo: string;
  payVia: string;
  transactionNumber: string;
  senderRef: string;
  designation: string;
  
  // Section 2
  receiverName: string;
  position: string;
  contactNo: string;
  ttRef: string;
  actualValue: number;
  poValueSection2: number;
  paidAmount: number;
  
  // Section 3: Grid Items
  items: CommissionItem[];
  
  // Section 4: Sign-offs
  checkedBy: string;
  representedBy: string;
}

const INITIAL_COMMISSIONS: CustomerOrderCommission[] = [];

export function CustomerOrderCommissionView({ activeSubView = 'editor' }: { activeSubView?: 'editor' | 'records' }) {
  const [commissions, setCommissions] = useState<CustomerOrderCommission[]>(() => {
    const saved = localStorage.getItem('MF_CUSTOMER_COMMISSIONS');
    let loaded: CustomerOrderCommission[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loaded = parsed;
        }
      } catch (e) {}
    } else {
      loaded = INITIAL_COMMISSIONS;
    }
    return loaded.filter(c => c.id !== 'coc-1');
  });

  const [activeTab, setActiveTabInner] = useState<'editor' | 'records'>(activeSubView);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeCompany, setActiveCompany] = useState(() => getActiveCompany());

  useEffect(() => {
    const handleSync = () => setActiveCompany(getActiveCompany());
    window.addEventListener('active_company_changed', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    return () => {
      window.removeEventListener('active_company_changed', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
    };
  }, []);

  // Editable Form state
  const [invoiceDate, setInvoiceDate] = useState('2026-03-20');
  
  // Section 1
  const [incentiveCompany, setIncentiveCompany] = useState('Professional Mechanical Engineering (Du)');
  const [poNumber, setPoNumber] = useState('Mail Confirm');
  const [invoiceNo, setInvoiceNo] = useState('505');
  const [payVia, setPayVia] = useState('Cash');
  const [transactionNumber, setTransactionNumber] = useState('Cash');
  const [senderRef, setSenderRef] = useState('FHM');
  const [designation, setDesignation] = useState('Sales Executive');

  // Section 2
  const [receiverName, setReceiverName] = useState('Mr. Durai');
  const [position, setPosition] = useState('Production');
  const [contactNo, setContactNo] = useState('+971 52 521 3596');
  const [ttRef, setTtRef] = useState('-');
  const [actualValue, setActualValue] = useState(413.00);
  const [poValueSection2, setPoValueSection2] = useState(455.00);
  const [paidAmount, setPaidAmount] = useState(42.00);

  // Section 3
  const [items, setItems] = useState<CommissionItem[]>([
    {
      id: 'item-1',
      description: 'B7 THREADED ROD 1-1/8" X 3660MM',
      qty: 2,
      netUnitPrice: 162.50,
      commissionAmount: 9.00
    }
  ]);

  // Section 4
  const [checkedBy, setCheckedBy] = useState('');
  const [representedBy, setRepresentedBy] = useState('');

  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    if (activeSubView) {
      setActiveTabInner(activeSubView);
    }
  }, [activeSubView]);

  // Synchronize dynamic lists
  useEffect(() => {
    localStorage.setItem('MF_CUSTOMER_COMMISSIONS', JSON.stringify(commissions));
  }, [commissions]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Auto-calculated totals helper
  const netCommissionTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.commissionAmount), 0);
  }, [items]);

  const poValueTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.netUnitPrice), 0);
  }, [items]);

  const handleAddItemRow = () => {
    const newItem: CommissionItem = {
      id: 'item-' + Date.now() + Math.floor(Math.random() * 100),
      description: '',
      qty: 1,
      netUnitPrice: 0,
      commissionAmount: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length <= 1) {
      triggerToast("Must retain at least 1 commission item item row.");
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemValueChange = (id: string, field: keyof CommissionItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: val
        };
      }
      return item;
    }));
  };

  const handleExportPDF = () => {
    const activeCompany = getActiveCompany();
    const formattedInvoiceDate = invoiceDate 
      ? new Date(invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) 
      : 'Pending';

    const itemsRowsHtml = items.map((item, index) => {
      const poVal = item.qty * item.netUnitPrice;
      const netComm = item.qty * item.commissionAmount;
      return `
        <tr style="border-bottom: 1px solid black; font-size: 10px; height: 26px;">
          <td style="border-right: 1px solid black; text-align: center; font-weight: bold; padding: 4px;">${index + 1}</td>
          <td style="border-right: 1px solid black; text-align: left; padding: 4px 8px; font-weight: bold; text-transform: uppercase;">${item.description || '-'}</td>
          <td style="border-right: 1px solid black; text-align: center; padding: 4px; font-weight: bold;">${item.qty}</td>
          <td style="border-right: 1px solid black; text-align: right; padding: 4px 8px;">
            <div style="display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace;">
              <span style="color: #888;">AED</span>
              <span>${item.netUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </td>
          <td style="border-right: 1px solid black; text-align: right; padding: 4px 8px;">
            <div style="display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace;">
              <span style="color: #888;">AED</span>
              <span>${item.commissionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </td>
          <td style="border-right: 1px solid black; text-align: right; padding: 4px 8px; font-weight: bold; font-family: 'JetBrains Mono', monospace; background-color: #fafafa;">
            AED ${poVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
          <td style="border-right: 1px solid black; text-align: right; padding: 4px 8px; font-weight: bold; color: #7f1d1d; font-family: 'JetBrains Mono', monospace; background-color: #fafafa;">
            AED ${netComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
          <td style="text-align: right; padding: 4px 8px; font-weight: bold; color: #7f1d1d; font-family: 'JetBrains Mono', monospace;">
            AED ${netComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Order Commission Settlement Register - ${invoiceNo || 'New'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          
          body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            background-color: #ffffff;
            color: #000000;
            margin: 0;
            padding: 4mm;
            font-size: 8.5px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-wrapper {
            max-width: 100%;
            margin: 0 auto;
            position: relative;
          }

          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
          }

          .company-title {
            font-size: 15px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
          }

          .subtitle {
            font-size: 9px;
            color: #555;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }

          .date-box {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 900;
            color: #b91c1c;
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
            padding-right: 4px;
            padding-left: 4px;
          }

          .section-banner {
            background-color: #1e293b;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 8px;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
            border-radius: 2px 2px 0 0;
          }

          .standard-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
            font-size: 10px;
            margin-bottom: 12px;
          }

          .standard-table th {
            background-color: #f1f5f9 !important;
            border-bottom: 1px solid black;
            border-right: 1px solid black;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 4px;
            text-align: center;
          }

          .standard-table th:last-child {
            border-right: none;
          }

          .standard-table td {
            padding: 5px;
            vertical-align: middle;
          }

          .field-inputs-row td {
            height: 32px;
            text-transform: uppercase;
          }

          .mono-txt {
            font-family: 'JetBrains Mono', monospace;
          }

          .footer-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
          }

          .signature-box {
            display: flex;
            flex-direction: column;
          }

          .signature-line {
            width: 220px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            font-family: 'Inter', sans-serif;
            font-style: italic;
            font-weight: bold;
            color: #334155;
            text-align: center;
            margin-top: 15px;
          }

          .signature-title {
            font-size: 9px;
            color: #64748b;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          
          <!-- Quotation Format Title Bar -->
          <div style="display: flex; align-items: center; width: 100%; margin: 2px 0 6px 0;">
            <div style="flex: 1; border-top: 3px double #083c54; margin-right: 12px;"></div>
            <span style="font-size: 13.5px; font-weight: bold; font-style: italic; color: #083c54; white-space: nowrap; padding: 0 4px;">
              Customer Order Commission Settlement Register
            </span>
            <div style="width: 75px; border-top: 3px double #083c54; margin-left: 12px;"></div>
          </div>

          <!-- Page Header -->
          <table class="header-table">
            <tr>
              ${activeCompany.showLogo && activeCompany.logoUrl ? `
                <td style="width: 70px; vertical-align: middle; padding: 4px;">
                  <img src="${activeCompany.logoUrl}" style="max-height: 48px; max-width: 70px; object-fit: contain;" />
                </td>
              ` : ''}
              <td style="text-align: left; padding: 4px;">
                <div class="company-title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address} | VAT TRN: ${activeCompany.trn || '—'}</div>
              </td>
              <td style="text-align: right; padding: 4px; font-size: 9px; font-weight: bold;">
                <span style="text-transform: uppercase;">INVOICE DATE: </span>
                <span class="date-box">${formattedInvoiceDate}</span>
                <div class="subtitle" style="font-size: 8px; color: #555; font-weight: bold; margin-top: 4px;">SYSTEM REF: COC-${activeRecordId ? activeRecordId.slice(-4) : 'NEW'}</div>
              </td>
            </tr>
          </table>

          <!-- SECTION 1 -->
          <div class="section-banner">SECTION 1: INCENTIVE & PAYEE REGISTERED DETAILS</div>
          <table class="standard-table">
            <thead>
              <tr>
                <th style="width: 32px;">S/L.</th>
                <th>INCENTIVE RECEIVED COMPANY</th>
                <th>PO NUMBER</th>
                <th>INVOICE NO</th>
                <th>PAY VIA</th>
                <th>TRANSACTION NUMBER</th>
                <th>SENDER REF</th>
                <th>DESIGNATION</th>
              </tr>
            </thead>
            <tbody>
              <tr class="field-inputs-row" style="text-align: center; font-weight: bold;">
                <td style="border-right: 1px solid black; background-color: #f8fafc;">1</td>
                <td style="border-right: 1px solid black; padding: 4px;">${incentiveCompany || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${poNumber || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px; color: #b91c1c; font-weight: 900;">${invoiceNo || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${payVia || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${transactionNumber || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${senderRef || '-'}</td>
                <td style="padding: 4px;">${designation || '-'}</td>
              </tr>
            </tbody>
          </table>

          <!-- SECTION 2 -->
          <div class="section-banner">SECTION 2: RECIPIENT HANDLER & MONETARY VALUES</div>
          <table class="standard-table">
            <thead>
              <tr>
                <th style="width: 32px;">S/L.</th>
                <th>RECEIVER NAME</th>
                <th>POSITION</th>
                <th>CONTACT NO</th>
                <th>TT REF</th>
                <th>ACTUAL VALUE</th>
                <th>PO VALUE</th>
                <th>PAID AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr class="field-inputs-row" style="text-align: center; font-weight: bold;">
                <td style="border-right: 1px solid black; background-color: #f8fafc;">1</td>
                <td style="border-right: 1px solid black; padding: 4px;">${receiverName || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${position || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${contactNo || '-'}</td>
                <td style="border-right: 1px solid black; padding: 4px;">${ttRef || '-'}</td>
                <td style="border-right: 1px solid black; text-align: right; padding: 4px 8px; font-family: 'JetBrains Mono', monospace;">AED ${actualValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="border-right: 1px solid black; text-align: right; padding: 4px 8px; color: #9a3412; font-family: 'JetBrains Mono', monospace;">AED ${poValueSection2.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right; padding: 4px 8px; color: #047857; font-family: 'JetBrains Mono', monospace;">AED ${paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <!-- SECTION 3 -->
          <div class="section-banner">SECTION 3: COMMISSION PARAMETERS AND VALUES</div>
          <table class="standard-table">
            <thead>
              <tr>
                <th style="width: 32px;">S/L.</th>
                <th style="width: 36%; min-width: 260px; text-align: left; padding-left: 10px;">DESCRIPTION</th>
                <th style="width: 35px;">QTY</th>
                <th style="width: 85px; text-align: right; padding-right: 6px;">NET UNIT PRICE</th>
                <th style="width: 85px; text-align: right; padding-right: 6px;">COMMISION AMOUNT</th>
                <th style="width: 95px; text-align: right; padding-right: 6px;">PO VALUE</th>
                <th style="width: 110px; text-align: right; padding-right: 6px;">NET COMMISION</th>
                <th style="width: 110px; text-align: right; padding-right: 6px;">GROSS COMMISION</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
              
              <!-- Total summary matching excel exactly -->
              <tr style="border-top: 2px solid black; font-weight: 900; background-color: #f8fafc; font-size: 10px; height: 30px;">
                <td colspan="5" style="border-right: 1px solid black; text-align: right; padding-right: 15px; text-transform: uppercase;">TOTAL SUMS</td>
                <td style="border-right: 1px solid black; text-align: right; padding-right: 8px; font-family: 'JetBrains Mono', monospace;">
                  AED ${poValueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style="border-right: 1px solid black; text-align: right; padding-right: 8px; color: #7f1d1d; font-family: 'JetBrains Mono', monospace;">
                  AED ${netCommissionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style="text-align: right; padding-right: 8px; color: #7f1d1d; font-family: 'JetBrains Mono', monospace;">
                  AED ${netCommissionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Signoffs -->
          <div class="footer-section">
            <div class="signature-box" style="text-align: left;">
              <div class="signature-line">${checkedBy.trim() ? checkedBy.trim() : '&nbsp;'}</div>
              <div class="signature-title">Checked By</div>
            </div>
            <div class="signature-box" style="text-align: right; align-items: flex-end;">
              <div class="signature-line" style="text-align: center;">${representedBy.trim() ? representedBy.trim() : '&nbsp;'}</div>
              <div class="signature-title" style="text-align: right; width: 100%;">Represented by</div>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    printHtml(htmlContent, `MFI_Customer_Commission_Register_${invoiceNo || 'Draft'}`);
  };

  // Reset form to clear or predefined default
  const getNextDocNumber = (currentNo: string, prefixFallback: string) => {
    if (currentNo && typeof currentNo === 'string') {
      const match = currentNo.match(/^(.*?)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const numStr = match[2];
        const nextNum = (parseInt(numStr, 10) + 1).toString().padStart(numStr.length, '0');
        return prefix + nextNum;
      }
    }
    return prefixFallback + Math.floor(Math.random() * 900 + 100);
  };

  const handleResetForm = () => {
    setInvoiceDate(new Date().toISOString().substring(0, 10));
    setIncentiveCompany('');
    setPoNumber('');
    setInvoiceNo(getNextDocNumber(invoiceNo || (commissions[0]?.invoiceNo ?? '505'), '505'));
    setPayVia('Cash');
    setTransactionNumber('');
    setSenderRef('');
    setDesignation('Sales Executive');
    setReceiverName('');
    setPosition('');
    setContactNo('');
    setTtRef('-');
    setActualValue(0);
    setPoValueSection2(0);
    setPaidAmount(0);
    setItems([
      {
        id: 'item-1',
        description: '',
        qty: 1,
        netUnitPrice: 0,
        commissionAmount: 0
      }
    ]);
    setCheckedBy('');
    setRepresentedBy('');
    setActiveRecordId('');
    triggerToast("Cleared form details and incremented to next case number.");
  };

  // Save current record
  const handleSaveCommission = () => {
    if (!incentiveCompany.trim()) {
      triggerToast("Please input Incentive Received Company value to log record.");
      return;
    }

    const payload: CustomerOrderCommission = {
      id: activeRecordId || 'coc-' + Date.now(),
      invoiceDate,
      incentiveCompany,
      poNumber,
      invoiceNo,
      payVia,
      transactionNumber,
      senderRef,
      designation,
      receiverName,
      position,
      contactNo,
      ttRef,
      actualValue,
      poValueSection2,
      paidAmount,
      items,
      checkedBy,
      representedBy
    };

    if (activeRecordId) {
      // update
      setCommissions(prev => prev.map(item => item.id === activeRecordId ? payload : item));
      triggerToast("Updated existing Customer Commission record in memory.");
    } else {
      // create new
      setCommissions([payload, ...commissions]);
      setActiveRecordId(payload.id);
      triggerToast("Created & filed new Customer Commission record successfully.");
    }
  };

  // Edit action
  const handleEditCommissionRecord = (rec: CustomerOrderCommission) => {
    setActiveRecordId(rec.id);
    setInvoiceDate(rec.invoiceDate);
    setIncentiveCompany(rec.incentiveCompany);
    setPoNumber(rec.poNumber);
    setInvoiceNo(rec.invoiceNo);
    setPayVia(rec.payVia);
    setTransactionNumber(rec.transactionNumber);
    setSenderRef(rec.senderRef);
    setDesignation(rec.designation);
    setReceiverName(rec.receiverName);
    setPosition(rec.position);
    setContactNo(rec.contactNo);
    setTtRef(rec.ttRef);
    setActualValue(rec.actualValue);
    setPoValueSection2(rec.poValueSection2);
    setPaidAmount(rec.paidAmount);
    setItems(rec.items);
    setCheckedBy(rec.checkedBy);
    setRepresentedBy(rec.representedBy);
    setActiveTabInner('editor');
    triggerToast(`Opened Case #${rec.invoiceNo || rec.id} for interactive editing.`);
  };

  // Delete Action
  const handleDeleteCommissionRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently discard this historical commission record?")) {
      setCommissions(prev => prev.filter(item => item.id !== id));
      if (activeRecordId === id) {
        handleResetForm();
      }
      triggerToast("Historical commission record removed from registry.");
    }
  };

  // Filter commissions
  const filteredCommissions = useMemo(() => {
    if (!searchQuery.trim()) return commissions;
    const q = searchQuery.toLowerCase();
    return commissions.filter(c => 
      c.incentiveCompany.toLowerCase().includes(q) ||
      c.invoiceNo.toLowerCase().includes(q) ||
      c.poNumber.toLowerCase().includes(q) ||
      c.receiverName.toLowerCase().includes(q) ||
      c.senderRef.toLowerCase().includes(q)
    );
  }, [commissions, searchQuery]);

  return (
    <div className="space-y-6 select-none relative font-mono text-[10.5px]">
      
      {/* Dynamic Toast feedback banner */}
      {toast && (
        <div className="fixed top-4 right-4 bg-slate-900 border border-[#f37021] text-white px-4 py-3 rounded-md shadow-2xl flex items-center gap-2 animate-bounce z-50 text-[10px] font-bold">
          <Award className="w-4 h-4 text-[#f37021]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Primary tab heading navigation context */}
      <div className="bg-slate-900 border border-slate-950 p-2 text-white rounded-lg flex justify-between items-center no-print">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTabInner('editor')}
            className={`px-4 py-1.5 font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              activeTab === 'editor' ? 'bg-[#f37021] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Customer Order Commission Template
          </button>
          <button
            onClick={() => setActiveTabInner('records')}
            className={`px-4 py-1.5 font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded ${
              activeTab === 'records' ? 'bg-[#f37021] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Commission Case Records ({commissions.length})
          </button>
        </div>
        <div className="hidden sm:block text-[9px] text-slate-400 font-bold uppercase tracking-widest px-2- py-1">
          {activeCompany.shortName || activeCompany.name} Hub
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="flex flex-col gap-4">
          
          {/* Action and Configuration Toolbar */}
          <div className="no-print bg-slate-900 border border-slate-950 p-3 rounded-t-xl text-white flex flex-col sm:flex-row gap-4 items-center justify-between shadow-md">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#f37021]" />
                <span className="text-[10px] uppercase font-bold text-slate-350">Invoice Date:</span>
                <input 
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="bg-slate-800 text-white font-mono text-[11px] border border-slate-700 rounded px-2 py-1 focus:outline-[#f37021] focus:ring-0"
                />
              </div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/50">
                Active System ID: COC-{activeRecordId ? activeRecordId.slice(-4) : 'NEW'}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[62px] sm:min-w-[70px] h-[46px] transition-all cursor-pointer group shrink-0 shadow-2xs hover:shadow-xs"
                title="Reset Form & Start New Commission Case"
              >
                <RotateCcw className="w-4 h-4 text-amber-500 group-hover:rotate-180 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">+ Reset / New</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCommission}
                className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[62px] sm:min-w-[70px] h-[46px] transition-all cursor-pointer group shrink-0 shadow-2xs hover:shadow-xs"
                title="Save Commission Case Record"
              >
                <Save className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Save Case</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[62px] sm:min-w-[70px] h-[46px] transition-all cursor-pointer group shrink-0 shadow-2xs hover:shadow-xs"
                title="Export / Print Commission PDF"
              >
                <FileText className="w-4 h-4 text-rose-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Export PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg px-2.5 py-1 flex flex-col items-center justify-center gap-0.5 min-w-[58px] sm:min-w-[64px] h-[46px] transition-all cursor-pointer group shrink-0 shadow-2xs hover:shadow-xs"
                title="Edit Company Header (Name, Address, Phone, TRN)"
              >
                <Building2 className="w-4 h-4 text-sky-600 group-hover:scale-105 transition-transform" />
                <span className="text-[10.5px] font-semibold text-[#1e293b] tracking-tight whitespace-nowrap">Header</span>
              </button>
            </div>
          </div>

          {/* Full Width template sheet */}
          <div className="w-full bg-white border border-t-0 border-slate-300 p-6 md:p-8 rounded-b-xl shadow-sm text-slate-950 select-text overflow-x-auto print-container leading-relaxed">
            
            {/* Template Page Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest tracking-loose">{activeCompany.name}</h2>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5 select-none font-sans uppercase">Customer Order Commission Settlement Register</span>
              </div>
              <div className="text-right text-[10px] font-bold">
                <span className="text-slate-900 uppercase">INVOICE DATE : </span>
                <span className="border-b border-black pb-0.5 px-1 font-bold text-rose-700 font-mono">
                  {invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'Pending'}
                </span>
                <p className="text-[8.5px] text-slate-400 mt-1 select-none font-sans font-bold">SYSTEM REFERENCE: COC-{activeRecordId ? activeRecordId.slice(-4) : 'NEW'}</p>
              </div>
            </div>

            {/* SECTION 1 TABLE: Payee & Order parameters with grey title strip */}
            <div className="mb-4 overflow-x-auto">
              <div className="bg-slate-800 text-white font-sans text-[8.5px] font-semibold uppercase px-2 py-1 select-none tracking-wider mb-1 flex justify-between rounded-t">
                <span>SECTION 1: INCENTIVE & PAYEE REGISTERED DETAILS</span>
                <span className="text-slate-400 text-[8px] italic">Click cells to edit value directly</span>
              </div>
              <table className="w-full min-w-[700px] border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black text-center font-semibold text-[9px] uppercase tracking-wide select-none">
                    <th className="border-r border-black p-1 w-10">S/L.</th>
                    <th className="border-r border-black p-1">INCENTIVE RECEIVED COMPANY</th>
                    <th className="border-r border-black p-1">PO NUMBER</th>
                    <th className="border-r border-black p-1">INVOICE NO</th>
                    <th className="border-r border-black p-1">PAY VIA</th>
                    <th className="border-r border-black p-1">TRANSACTION NUMBER</th>
                    <th className="border-r border-black p-1">SENDER REF</th>
                    <th className="p-1">DESIGNATION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center font-bold text-slate-900 h-9">
                    <td className="border-r border-black p-1 pb-1.5 align-middle bg-slate-50/50 select-none">1</td>
                    <td className="border-r border-black p-0.5 max-w-[200px] align-middle">
                      <input 
                        type="text" 
                        value={incentiveCompany} 
                        onChange={(e) => setIncentiveCompany(e.target.value)} 
                        placeholder="Incentive Company..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={poNumber} 
                        onChange={(e) => setPoNumber(e.target.value)} 
                        placeholder="PO Number..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={invoiceNo} 
                        onChange={(e) => setInvoiceNo(e.target.value)} 
                        placeholder="Invoice No..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-rose-700 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={payVia} 
                        onChange={(e) => setPayVia(e.target.value)} 
                        placeholder="Pay Via..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={transactionNumber} 
                        onChange={(e) => setTransactionNumber(e.target.value)} 
                        placeholder="Trans No..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={senderRef} 
                        onChange={(e) => setSenderRef(e.target.value)} 
                        placeholder="Sender Ref..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={designation} 
                        onChange={(e) => setDesignation(e.target.value)} 
                        placeholder="Designation..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 2 TABLE: Receiver details */}
            <div className="mb-4 overflow-x-auto">
              <div className="bg-slate-800 text-white font-sans text-[8.5px] font-semibold uppercase px-2 py-1 select-none tracking-wider mb-1 flex justify-between rounded-t">
                <span>SECTION 2: RECIPIENT HANDLER & MONETARY VALUES</span>
                <span className="text-slate-400 text-[8px] italic">Edit directly below</span>
              </div>
              <table className="w-full min-w-[700px] border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black text-center font-semibold text-[9px] uppercase tracking-wide select-none">
                    <th className="border-r border-black p-1 w-10">S/L.</th>
                    <th className="border-r border-black p-1">RECEIVER NAME</th>
                    <th className="border-r border-black p-1">POSITION</th>
                    <th className="border-r border-black p-1">CONTACT NO</th>
                    <th className="border-r border-black p-1">TT REF</th>
                    <th className="border-r border-black p-1">ACTUAL VALUE</th>
                    <th className="border-r border-black p-1">PO VALUE</th>
                    <th className="p-1">PAID AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center font-bold text-slate-900 h-9">
                    <td className="border-r border-black p-1.5 align-middle bg-slate-50/50 select-none">1</td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={receiverName} 
                        onChange={(e) => setReceiverName(e.target.value)} 
                        placeholder="Receiver Name..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={position} 
                        onChange={(e) => setPosition(e.target.value)} 
                        placeholder="Position..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={contactNo} 
                        onChange={(e) => setContactNo(e.target.value)} 
                        placeholder="Contact..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle">
                      <input 
                        type="text" 
                        value={ttRef} 
                        onChange={(e) => setTtRef(e.target.value)} 
                        placeholder="TT Reference..."
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] px-1 py-1 font-bold uppercase text-center font-mono text-[10px] text-slate-900 rounded-sm"
                      />
                    </td>
                    <td className="border-r border-black p-0.5 align-middle text-right">
                      <div className="flex items-center justify-center px-1 font-mono text-[9px]">
                        <span className="text-slate-400 select-none mr-0.5">AED</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={actualValue} 
                          onChange={(e) => setActualValue(parseFloat(e.target.value) || 0)} 
                          className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold text-center font-mono text-[10px] w-full text-slate-900 rounded-sm"
                        />
                      </div>
                    </td>
                    <td className="border-r border-black p-0.5 align-middle text-right bg-amber-50/25">
                      <div className="flex items-center justify-center px-1 font-mono text-[9px]">
                        <span className="text-amber-550 select-none mr-0.5">AED</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={poValueSection2} 
                          onChange={(e) => setPoValueSection2(parseFloat(e.target.value) || 0)} 
                          className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold text-center font-mono text-[10px] w-full text-amber-800 rounded-sm"
                        />
                      </div>
                    </td>
                    <td className="p-0.5 align-middle text-right bg-emerald-50/25">
                      <div className="flex items-center justify-center px-1 font-mono text-[9px]">
                        <span className="text-emerald-600 select-none mr-0.5">AED</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={paidAmount} 
                          onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} 
                          className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold text-center font-mono text-[10px] w-full text-emerald-700 rounded-sm"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 3 ITEMS GRID: Items with calculated commission */}
            <div className="mb-4 overflow-x-auto">
              <span className="text-[8.5px] text-slate-400 font-semibold uppercase select-none tracking-widest block mb-1">SECTION 3: COMMISSION PARAMETERS AND VALUES</span>
              <table className="w-full min-w-[780px] border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black text-center font-semibold text-[9px] uppercase tracking-wide select-none">
                    <th className="border-r border-black p-1 w-10">S/L.</th>
                    <th className="border-r border-black p-1 text-left pl-3">DESCRIPTION</th>
                    <th className="border-r border-black p-1 w-12 text-center">QTY</th>
                    <th className="border-r border-black p-1 text-right w-28">NET UNIT PRICE</th>
                    <th className="border-r border-black p-1 text-right w-28">COMMISION AMOUNT</th>
                    <th className="border-r border-black p-1 text-right w-28">PO VALUE</th>
                    <th className="border-r border-black p-1 text-right w-36">NET COMMISION AMOUNT</th>
                    <th className="p-1 text-right w-36">GROSS COMMISION AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {items.map((item, index) => {
                    const rowPoValue = item.qty * item.netUnitPrice;
                    const rowNetCommission = item.qty * item.commissionAmount;
                    const rowGrossCommission = rowNetCommission; // mapping to net commission per the screenshot template

                    return (
                      <tr key={item.id} className="text-slate-900 border-b border-slate-300">
                        <td className="border-r border-black p-1 text-center font-bold bg-slate-50/50">{index + 1}</td>
                        <td className="border-r border-black p-1 font-bold">
                          <input 
                            type="text" 
                            value={item.description || ''}
                            onChange={(e) => handleItemValueChange(item.id, 'description', e.target.value)}
                            placeholder="e.g. B7 THREADED ROD 1-1/8' X 3660MM"
                            className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold uppercase w-full font-mono text-[10px] rounded-sm"
                          />
                        </td>
                        <td className="border-r border-black p-1 text-center">
                          <input 
                            type="number" 
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemValueChange(item.id, 'qty', parseInt(e.target.value, 10) || 1)}
                            className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold w-full text-center font-mono text-[10px] rounded-sm"
                          />
                        </td>
                        <td className="border-r border-black p-1 text-right font-mono text-[9px]">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-slate-400 select-none">AED</span>
                            <input 
                              type="number" 
                              step="0.01"
                              value={item.netUnitPrice}
                              onChange={(e) => handleItemValueChange(item.id, 'netUnitPrice', parseFloat(e.target.value) || 0)}
                              className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold text-right font-mono text-[10px] w-20 rounded-sm"
                            />
                          </div>
                        </td>
                        <td className="border-r border-black p-1 text-right font-mono text-[9px]">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-slate-400 select-none">AED</span>
                            <input 
                              type="number" 
                              step="0.01"
                              value={item.commissionAmount}
                              onChange={(e) => handleItemValueChange(item.id, 'commissionAmount', parseFloat(e.target.value) || 0)}
                              className="bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#f37021] p-1 font-bold text-right font-mono text-[10px] w-20 rounded-sm"
                            />
                          </div>
                        </td>
                        {/* Autocalculated cells */}
                        <td className="border-r border-black p-1 text-right font-bold pr-2 bg-slate-50/40">
                          AED {rowPoValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border-r border-black p-1 text-right font-bold pr-2 text-rose-750 bg-slate-50/40">
                          AED {rowNetCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-right font-bold pr-2 text-rose-750 bg-slate-100/10">
                          AED {rowGrossCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Add Row button handles - non-printed */}
                  <tr className="no-print">
                    <td colSpan={8} className="p-1.5 text-center bg-slate-50">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={handleAddItemRow}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-sans flex items-center gap-1 cursor-pointer font-bold text-[9px]"
                        >
                          <Plus className="w-3 h-3 text-[#f37021]" /> ADD LINE VALUE
                        </button>
                        <span className="text-slate-400 text-[8px] italic">Interactive row item formulas calculated instantly</span>
                      </div>
                    </td>
                  </tr>

                  {/* DOUBLE BOUNDARY SUMS UNDER GRIDS (Mimics Excel screenshot beautifully) */}
                  <tr className="border-t-2 border-black font-bold bg-slate-50 text-[10px]">
                    <td colSpan={5} className="border-r border-black text-right pr-4 py-1.5 uppercase select-none">TOTAL SUMS</td>
                    <td className="border-r border-black text-right pr-2 font-mono">
                      AED {poValueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border-r border-black text-right pr-2 text-rose-900 font-mono">
                      AED {netCommissionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right pr-2 text-rose-900 font-mono">
                      AED {netCommissionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom verified sign-offs block */}
            <div className="mt-12 pt-8 flex justify-between items-end border-t border-dashed border-slate-300 text-[10px] uppercase font-bold text-slate-805">
              <div className="text-left space-y-2">
                <span className="block text-slate-400 text-[8px] select-none">Checked By (Optional)</span>
                <div className="flex flex-col">
                  <input 
                    type="text" 
                    value={checkedBy}
                    onChange={(e) => setCheckedBy(e.target.value)}
                    className="w-44 border-b border-black pb-1 font-sans text-[10px] text-slate-900 placeholder:text-slate-300 font-bold bg-transparent focus:outline-none focus:ring-0"
                    placeholder="Type name / stamp..."
                  />
                  <span className="text-[9px] mt-1 text-slate-400 select-none">Checked By</span>
                </div>
              </div>
              <div className="text-right space-y-2">
                <span className="block text-slate-400 text-[8px] select-none text-right">Represented By (Optional)</span>
                <div className="flex flex-col items-end">
                  <input 
                    type="text" 
                    value={representedBy}
                    onChange={(e) => setRepresentedBy(e.target.value)}
                    className="w-56 border-b border-black pr-1 pb-1 font-sans text-[10px] text-slate-900 placeholder:text-slate-300 font-bold bg-transparent focus:outline-none focus:ring-0 text-center"
                    placeholder="Type representative..."
                  />
                  <span className="text-[9px] mt-1 text-slate-450 select-none">Represented by</span>
                </div>
              </div>
            </div>

            {/* Print & PDF Export triggers CTA */}
            <div className="no-print mt-10 p-3 bg-slate-50 rounded-xl flex flex-col sm:flex-row justify-between items-center border gap-3">
              <div className="text-[9px] text-slate-400 font-bold uppercase shrink-0">
                Settles standard customer order commissions
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center gap-1.5 font-bold uppercase rounded cursor-pointer active:scale-95 text-[10px] shadow-sm"
                >
                  <Printer className="w-4 h-4 text-slate-600" /> Print Native Screen
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white transition-all flex items-center gap-1.5 font-bold uppercase rounded cursor-pointer active:scale-95 text-[10px] shadow"
                >
                  <FileText className="w-4 h-4 text-rose-200" /> Save as PDF Document
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Historical records archive subview page block */
        <div className="bg-white border rounded-xl p-4 space-y-4 shadow-3xs leading-relaxed">
          <div className="border-b pb-2 flex flex-col md:flex-row md:justify-end md:items-center gap-2">
            {/* Search Filter input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by Company, PO, Invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-slate-900 border border-slate-300 py-1.5 pl-8 pr-3 font-mono text-[10px] uppercase placeholder:text-slate-400 focus:outline-[#f37021] rounded"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border border-slate-200 font-sans text-[11px] uppercase divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-900 text-white h-9 select-none text-[9px] font-semibold tracking-wide">
                  <th className="p-2 border-r border-slate-800">Date Filed</th>
                  <th className="p-2 border-r border-slate-800">Incentive Payee Company</th>
                  <th className="p-2 border-r border-slate-800 text-center">Invoice No</th>
                  <th className="p-2 border-r border-slate-800">PO Number</th>
                  <th className="p-2 border-r border-slate-800">Receiver / Position</th>
                  <th className="p-2 border-r border-slate-800 text-right">PO Overall Value</th>
                  <th className="p-2 border-r border-slate-800 text-right text-emerald-400">Total Net Commission</th>
                  <th className="p-2 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCommissions.map(rec => {
                  const itemsPoValueTotal = rec.items.reduce((sum, it) => sum + (it.qty * it.netUnitPrice), 0);
                  const itemsNetCommissionTotal = rec.items.reduce((sum, it) => sum + (it.qty * it.commissionAmount), 0);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 font-mono text-[10px]">
                      <td className="p-2.5 font-bold text-slate-600">{rec.invoiceDate}</td>
                      <td className="p-2.5 font-bold text-slate-900 text-[11px] max-w-[200px] truncate">{rec.incentiveCompany}</td>
                      <td className="p-2.5 text-center font-bold text-rose-700">{rec.invoiceNo || rec.id.slice(-4)}</td>
                      <td className="p-2.5 text-slate-650 font-bold">{rec.poNumber}</td>
                      <td className="p-2.5">
                        <span className="font-semibold text-indigo-900 block">{rec.receiverName}</span>
                        <span className="text-slate-400 text-[8px] block">{rec.position || 'N/A'}</span>
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        AED {itemsPoValueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-bold text-rose-800">
                        AED {itemsNetCommissionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-center font-sans space-x-1 flex items-center justify-center">
                        <button
                          onClick={() => handleEditCommissionRecord(rec)}
                          className="p-1 border border-slate-200 text-slate-600 hover:text-[#f37021] hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          title="Open in Creator Editor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCommissionRecord(rec.id, e)}
                          className="p-1 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          title="Wipe historical log record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredCommissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-12 text-slate-400 italic bg-slate-50">
                      No customer commission records found. Open template tab to add records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 border border-slate-950 p-2.5 rounded text-[9.5px] text-slate-300 leading-relaxed font-sans uppercase">
            * Recorded commissions adhere strictly to the validated Gulf logistics audit standards.
          </div>
        </div>
      )}

      {/* Company Header Edit Modal */}
      <EditCompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSaved={() => {
          if (triggerToast) triggerToast("Company Header details updated successfully!");
        }}
      />
    </div>
  );
}
