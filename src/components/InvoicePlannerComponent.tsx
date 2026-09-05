import React, { useState, useEffect } from 'react';
import { 
  Printer, Plus, Save, Trash2, Check, FileText, RotateCcw, Info, Search, CreditCard, Percent, DollarSign, ArrowLeftRight
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getCompanyProfile } from '../utils/companyProfile';

interface InvoicePlannerProps {
  salesInvoices: any[];
  setSalesInvoices: (invoices: any[]) => void;
  clientDatabase: string[];
  triggerToast: (msg: string) => void;
}

const CUSTOMER_ADDRESS_LOOKUPS: { [key: string]: string } = {
  "ZAMIL HEAVY INDUSTRIES LTD": "7547 PRINCE SULTAN ROAD, AS SALAMAH, SAUDI ARABIA DIST. JEDDAH",
  "AL FANAR STEEL WORKS CO.": "P.O. BOX 40228, INDUSTRIAL AREA 12, SHARJAH, UAE",
  "GULF INTEGRATED MARINE SERVICES": "PORT KHALID, SECTOR 4, SHARJAH, UAE",
  "AJMAN SHIP REPAIRING YARD": "AL RASHIDIYA 3, NEAR AL MEERA PORT, AJMAN, UAE",
  "EMIRATES STEEL CO.": "INDUSTRIAL CITY OF ABU DHABI (ICAD), ABU DHABI, UAE"
};

// Convert number to words utility specifically for AED/USD totals
export function numberToWords(num: number, currency: string = 'AED'): string {
  const fixed = num.toFixed(2);
  const parts = fixed.split('.');
  const whole = parseInt(parts[0], 10);
  const decimals = parseInt(parts[1], 10);

  const units = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", 
                 "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const scales = ["", "THOUSAND", "MILLION", "BILLION"];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    let res = "";
    if (n >= 100) {
      res += units[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
    }
    if (n >= 20) {
      res += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      res += units[n] + " ";
    }
    return res.trim();
  }

  function convertNumber(n: number): string {
    if (n === 0) return "ZERO";
    let chunkCount = 0;
    let res = "";
    let temp = n;
    while (temp > 0) {
      const chunk = temp % 1000;
      if (chunk !== 0) {
        const chunkStr = convertLessThanThousand(chunk);
        res = chunkStr + " " + scales[chunkCount] + " " + res;
      }
      temp = Math.floor(temp / 1000);
      chunkCount++;
    }
    return res.trim();
  }

  const currencyLabel = currency === 'USD' ? 'US DOLLARS' : 'AED';
  const decimalLabel = currency === 'USD' ? 'CENTS' : 'FILS';

  const wholeWords = whole > 0 ? convertNumber(whole) + " " + currencyLabel : "";
  const decimalWords = decimals > 0 ? convertNumber(decimals) + " " + decimalLabel : "";

  if (wholeWords && decimalWords) {
    return `${wholeWords} AND ${decimalWords} ONLY`.replace(/\s+/g, ' ');
  } else if (wholeWords) {
    return `${wholeWords} ONLY`.replace(/\s+/g, ' ');
  } else if (decimalWords) {
    return `${decimalWords} ONLY`.replace(/\s+/g, ' ');
  }
  return `ZERO ${currencyLabel} ONLY`;
}

export const InvoicePlannerComponent: React.FC<InvoicePlannerProps> = ({
  salesInvoices,
  setSalesInvoices,
  clientDatabase,
  triggerToast
}) => {
  const [companyProfile, setCompanyProfile] = useState(() => getCompanyProfile());

  useEffect(() => {
    const handleSync = () => setCompanyProfile(getCompanyProfile());
    window.addEventListener('active_company_changed', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    return () => {
      window.removeEventListener('active_company_changed', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
    };
  }, []);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(salesInvoices[0] || {
    id: 'inv-new',
    invoiceNo: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
    dated: new Date().toISOString().substring(0, 10),
    customerName: 'ZAMIL HEAVY INDUSTRIES LTD',
    customerAddress: 'JEDDAH INDUSTRIAL ESTATE, AREA 4, SAUDI ARABIA',
    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    paymentTerms: 'NET 30 DAYS',
    shippingTerms: 'FOB PORT',
    currency: 'AED',
    exchangeRate: 1.0,
    taxRate: 5,
    items: []
  });

  const [invItemDesc, setInvItemDesc] = useState('');
  const [invItemSize, setInvItemSize] = useState('');
  const [invItemQty, setInvItemQty] = useState(1000);
  const [invItemUnit, setInvItemUnit] = useState('Pcs.');
  const [invItemPrice, setInvItemPrice] = useState(1.5);

  // Customer search suggest state
  const [custSearchTerm, setCustSearchTerm] = useState('');
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);

  const [deliveryNotesPending, setDeliveryNotesPending] = useState<any[]>(() => {
    const saved = localStorage.getItem('MFI_DELIVERY_NOTES_PENDING_INVOICE');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'DN-2026-801',
        sourceWoNo: 'WO-26-801',
        customerName: 'Hamriyah Heavy Fabrication',
        requestedDate: '2026-05-15',
        itemDescription: 'SS316 HIGH-TENSILE ANCHOR BOLTS WITH SPECIAL HEX ENDS',
        size: 'M24 x 180MM',
        qty: 800,
        unit: 'PCS',
        priority: 'High',
        requestedBy: 'Factory Floor Shipments Desk',
        status: 'Pending Invoice',
        notes: 'Delivery note signed by Hamriyah site office on receipt. Ready for tax billing.'
      },
      {
        id: 'DN-2026-802',
        sourceWoNo: 'WO-26-802',
        customerName: 'Abu Dhabi Structural Steel',
        requestedDate: '2026-05-20',
        itemDescription: 'HOT DIP GALVANIZED HEAVY NUTS DIN 934 CLASS 8',
        size: 'M20 HEAVY DENSITY',
        qty: 15000,
        unit: 'PCS',
        priority: 'Medium',
        requestedBy: 'Store Shipment Bay B',
        status: 'Pending Invoice',
        notes: 'Custom clearance completed. Dispatched on DDP terms.'
      },
      {
        id: 'DN-2026-803',
        sourceWoNo: 'WO-26-803',
        customerName: 'Fujairah Bunkering Services',
        requestedDate: '2026-05-25',
        itemDescription: 'STAINLESS STEEL SPRING WASHERS DIN 127B EXTRA DENSE A4',
        size: 'M12 PROFILE',
        qty: 25000,
        unit: 'PCS',
        priority: 'Low',
        requestedBy: 'Main Logistics Bay',
        status: 'Pending Invoice',
        notes: 'Pre-packed in corrugated box hex master shippers.'
      }
    ];
  });

  useEffect(() => {
    const saved = localStorage.getItem('MFI_DELIVERY_NOTES_PENDING_INVOICE');
    if (saved) {
      try {
        setDeliveryNotesPending(JSON.parse(saved));
      } catch (e) {}
    }
  }, [selectedInvoice.id]);

  useEffect(() => {
    setCustSearchTerm(selectedInvoice.customerName || '');
  }, [selectedInvoice.id, selectedInvoice.customerName]);

  const handleApproveDeliveryNote = (dn: any) => {
    const freshLine = {
      sn: selectedInvoice.items.length + 1,
      description: `DN ${dn.id}: ${dn.itemDescription}`.toUpperCase(),
      size: dn.size || '—',
      qty: dn.qty,
      unit: dn.unit,
      unitPrice: 2.25
    };

    const revisedInvoice = {
      ...selectedInvoice,
      items: [...selectedInvoice.items, freshLine]
    };
    setSelectedInvoice(revisedInvoice);

    const modifiedNotes = deliveryNotesPending.map(n => {
      if (n.id === dn.id) {
        return {
          ...n,
          status: 'Invoiced',
          invoiceNo: selectedInvoice.invoiceNo
        };
      }
      return n;
    });

    setDeliveryNotesPending(modifiedNotes);
    localStorage.setItem('MFI_DELIVERY_NOTES_PENDING_INVOICE', JSON.stringify(modifiedNotes));
    triggerToast(`Delivery Note ${dn.id} approved! Slashed & pushed as a line item in draft Tax Invoice ${selectedInvoice.invoiceNo}!`);
  };

  const handleDeclineDeliveryNote = (id: string) => {
    const revised = deliveryNotesPending.map(n => {
      if (n.id === id) {
        return { ...n, status: 'Declined' };
      }
      return n;
    });
    setDeliveryNotesPending(revised);
    localStorage.setItem('MFI_DELIVERY_NOTES_PENDING_INVOICE', JSON.stringify(revised));
    triggerToast(`Delivery Note ${id} marked as Declined.`);
  };

  const handleSaveInvoice = () => {
    const idx = salesInvoices.findIndex(item => item.id === selectedInvoice.id);
    
    let updated: any[] = [];
    if (idx >= 0) {
      updated = [...salesInvoices];
      updated[idx] = selectedInvoice;
    } else {
      updated = [selectedInvoice, ...salesInvoices];
    }
    setSalesInvoices(updated);
    localStorage.setItem('MF_SALES_INVOICES_EXCEL', JSON.stringify(updated));
    triggerToast(`Sales Tax Invoice ${selectedInvoice.invoiceNo} saved successfully!`);
  };

  const handleAddNewInvoiceLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invItemDesc.trim()) {
      alert("Please set a description.");
      return;
    }

    const freshLine = {
      sn: selectedInvoice.items.length + 1,
      description: invItemDesc.toUpperCase(),
      size: invItemSize.trim() || '—',
      qty: invItemQty,
      unit: invItemUnit,
      unitPrice: invItemPrice
    };

    setSelectedInvoice({
      ...selectedInvoice,
      items: [...selectedInvoice.items, freshLine]
    });

    setInvItemDesc('');
    setInvItemSize('');
    triggerToast("Line item pushed to tax invoice drafting table!");
  };

  const deleteInvoiceLine = (sn: number) => {
    const filtered = selectedInvoice.items.filter((it: any) => it.sn !== sn).map((it: any, idx: number) => ({
      ...it,
      sn: idx + 1
    }));
    setSelectedInvoice((prev: any) => ({
      ...prev,
      items: filtered
    }));
  };

  const printInvoiceSlip = () => {
    const companyProfile = getCompanyProfile();
    const subtotal = selectedInvoice.items.reduce((s: number, item: any) => s + (item.qty * item.unitPrice), 0);
    const vatAmount = subtotal * (selectedInvoice.taxRate / 100);
    const totalAmount = subtotal + vatAmount;
    const totalInAED = selectedInvoice.currency === 'USD' ? totalAmount * 3.67 : totalAmount;
    const wordsText = numberToWords(totalAmount, selectedInvoice.currency);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${selectedInvoice.invoiceNo}-IN-${(selectedInvoice.buyerName || companyProfile.name || '').trim().replace(/[/\\?%*:|"<>]/g, '')}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 30px; line-height: 1.4; }
          .header-container { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px; }
          .org-title { font-size: 16px; font-weight: 955; color: #000; text-transform: uppercase; margin-bottom: 3px; }
          .doc-title { font-size: 20px; font-weight: 955; color: #f37021; text-transform: uppercase; letter-spacing: 1px; }
          .doc-meta { font-size: 10px; color: #64748b; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          
          .invoice-brief { display: table; width: 100%; margin-bottom: 25px; border: 1.5px solid #000; border-collapse: collapse; }
          .brief-col { display: table-cell; width: 50%; padding: 12px; border: 1px solid #000; vertical-align: top; }
          .brief-hdr { font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
          .brief-val { font-size: 11px; font-weight: 900; color: #000; text-transform: uppercase; }
          
          table { width: 100%; border-collapse: collapse; border: 2.5px solid #000; margin-bottom: 20px; }
          th { border: 1.5px solid #000; background-color: #f1f5f9; padding: 10px 8px; font-size: 10px; font-weight: 950; text-transform: uppercase; text-align: center; color: #000; }
          td { border: 1px solid #000; padding: 10px 8px; font-size: 10px; text-align: center; vertical-align: middle; }
          .left { text-align: left; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          
          .calc-box { margin-left: auto; width: 45%; border-collapse: collapse; margin-bottom: 20px; }
          .calc-row { display: table-row; }
          .calc-lbl { display: table-cell; padding: 6px; text-align: right; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .calc-val { display: table-cell; padding: 6px; text-align: right; font-size: 11px; font-weight: 955; width: 100px; }

          .footer-notes { border-top: 1px solid #e2e8f0; font-size: 8px; color: #64748b; padding-top: 10px; margin-top: 45px; text-transform: uppercase; text-align: justify; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="org-title">MARINE FASTENERS INDUSTRIES L.L.C.</div>
          <div class="doc-title">Official Tax Invoice</div>
          <div class="doc-meta">MFI TRN: 100482910300003 | AJMAN INDUSTRIAL AREA 2, ARAB EMIRATES</div>
        </div>

        <div class="invoice-brief">
          <div class="brief-col">
            <div class="brief-hdr">Invoiced Customer Account Details:</div>
            <div class="brief-val" style="font-size:12px; margin-bottom:4px;">${selectedInvoice.customerName}</div>
            <div class="brief-val" style="font-size:10px; font-weight:normal; color:#475569;">${selectedInvoice.customerAddress}</div>
          </div>
          <div class="brief-col" style="background: #f8fafc;">
            <div class="brief-hdr">Tax Invoice Code:</div>
            <div class="brief-val" style="font-size:13px; color:#f37021; margin-bottom:5px;">${selectedInvoice.invoiceNo}</div>
            <div class="brief-hdr">Billing Dates:</div>
            <div class="brief-val" style="font-weight:normal; font-size:10.5px; margin-bottom:3px;">Dated: <strong>${selectedInvoice.dated}</strong></div>
            <div class="brief-val" style="font-weight:normal; font-size:10.5px; margin-bottom:3px;">Due on: <strong>${selectedInvoice.dueDate}</strong></div>
            <div class="brief-val" style="font-weight:normal; font-size:10.5px;">Terms: <strong>${selectedInvoice.paymentTerms}</strong> / <strong>${selectedInvoice.shippingTerms}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">S.N</th>
              <th class="left" style="width: 32%;">DESCRIPTION OF INDUSTRIAL FASTENERS</th>
              <th style="width: 15%;">SIZE SPEC</th>
              <th style="width: 10%;">QTY</th>
              <th style="width: 8%;">UNIT</th>
              <th class="right" style="width: 15%;">UNIT RATE (${selectedInvoice.currency})</th>
              <th class="right" style="width: 15%;">TOTAL AMOUNT (${selectedInvoice.currency})</th>
            </tr>
          </thead>
          <tbody>
            ${selectedInvoice.items.length === 0 ? `
              <tr>
                <td colSpan="7" style="padding:25px; color:#64748b; font-style:italic;">No billing lines drafted on this invoice.</td>
              </tr>
            ` : selectedInvoice.items.map((it: any) => `
              <tr>
                <td class="bold">${it.sn}</td>
                <td class="left bold" style="text-transform: uppercase;">${it.description}</td>
                <td class="bold" style="color:#ef4444; text-transform: uppercase;">${it.size || '—'}</td>
                <td>${it.qty.toLocaleString()}</td>
                <td style="text-transform: uppercase;">${it.unit}</td>
                <td class="right">${it.unitPrice.toFixed(2)}</td>
                <td class="right bold">${(it.qty * it.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: table; width: 100%;">
          <div style="display: table-cell; width: 50%; vertical-align: top; font-size: 8.5px; text-transform: uppercase; color:#475569; font-weight:bold; line-height: 1.6;">
            <strong>Declaration Notes:</strong><br/>
            1. Goods received on signed Delivery notes are subject to 5% VAT in accordance with Federal Tax Authority laws of the UAE.<br/>
            2. Please allocate payment referenced against <strong>${selectedInvoice.invoiceNo}</strong>.<br/>
            3. Interest penalties apply on overdue accounts post-due dates.
            <div style="margin-top: 15px; padding-top: 8px;">
               <strong style="color:#f37021;">AMOUNT IN WORDS:</strong><br/>
               <span style="font-size:10px; font-weight:900;">${wordsText}</span>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; vertical-align: top;">
            <table class="calc-box">
              <tr class="calc-row">
                <td class="calc-lbl" style="border:none;">SUBTOTAL:</td>
                <td class="calc-val" style="border:none;">${selectedInvoice.currency} ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr class="calc-row">
                <td class="calc-lbl" style="border:none; color: #f37021;">VAT (${selectedInvoice.taxRate}%):</td>
                <td class="calc-val" style="border:none; color: #f37021;">${selectedInvoice.currency} ${vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr class="calc-row" style="border-top: 1.5px solid #000;">
                <td class="calc-lbl" style="border:none; font-size:11px;">NET TAX INVOICE TOTAL:</td>
                <td class="calc-val" style="border:none; font-size:12px; color:#16a34a; font-weight:950;">${selectedInvoice.currency} ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
              ${selectedInvoice.currency === 'USD' ? `
                <tr class="calc-row" style="border-top:1px dashed #64748b;">
                  <td class="calc-lbl" style="border:none; font-size:9.5px; color:#475569;">EQUIVALENT IN AED:</td>
                  <td class="calc-val" style="border:none; font-size:10.5px; color:#475569; font-weight:bold;">AED ${totalInAED.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ` : ''}
            </table>
          </div>
        </div>

        <div style="display: table; width: 100%; margin-top: 40px; border:1px solid #000; font-size:9px; text-transform:uppercase; text-align:center;">
          <div style="display: table-cell; width: 50%; padding: 20px; border-right:1px solid #000;">
            Received by Customer Name / Signature
            <div style="margin-top:25px; border-bottom:1px dashed #000; width:80%; margin-left:auto; margin-right:auto;"></div>
          </div>
          <div style="display: table-cell; width: 50%; padding: 20px; background:#f8fafc font-weight:bold;">
            For ${companyProfile.name}
            <div style="margin-top:25px; border-bottom:1px dashed #000; width:80%; margin-left:auto; margin-right:auto;"></div>
          </div>
        </div>

        <div class="footer-notes">
          NOTICE: THIS COMPLIANCE STATEMENT COMPLIES WITH TAX LAWS MANDATED BY ARAB EMIRATES FEDERAL TAX AUTHORITIES.
        </div>
      </body>
      </html>
    `;
    printHtml(htmlContent, `${(companyProfile.code || 'ERP')}_Sales_Tax_Invoice_${selectedInvoice.invoiceNo}`);
  };

  const handleSelectCustomerSuggestion = (customerName: string) => {
    const matchedAddress = CUSTOMER_ADDRESS_LOOKUPS[customerName] || '';
    setSelectedInvoice((prev: any) => ({
      ...prev,
      customerName,
      customerAddress: matchedAddress
    }));
    setCustSearchTerm(customerName);
    setShowCustSuggestions(false);
    triggerToast(`Customer loaded: ${customerName}`);
  };

  const activeSubtotal = selectedInvoice.items.reduce((s: number, it: any) => s + (it.qty * it.unitPrice), 0);
  const activeVat = activeSubtotal * (selectedInvoice.taxRate / 100);
  const activeGrandTotal = activeSubtotal + activeVat;
  const activeWords = numberToWords(activeGrandTotal, selectedInvoice.currency);

  const filteredSuggestions = clientDatabase.filter(c => 
    c.toLowerCase().includes(custSearchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none font-sans text-xs">
      {/* Left Input Panel (Controls & Parameters) */}
      <div className="xl:col-span-12 lg:col-span-12 xl:hidden mb-2 font-bold text-center text-slate-450 uppercase py-1.5 bg-yellow-50 border border-yellow-200 rounded">
        📢 Manage tax billing contract below. Use standard client specifications model.
      </div>

      {/* Left Input Panel (Controls & Parameters) */}
      <div className="xl:col-span-5 space-y-6 no-print">
        {/* Card 1: Select Active Draft */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-[#f37021]" />
            <span className="text-xs text-slate-900 font-semibold uppercase tracking-widest block font-mono">Invoice Queue Selector</span>
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono text-xs font-semibold rounded-md outline-none cursor-pointer focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] appearance-none"
              value={selectedInvoice.id}
              onChange={(e) => {
                const found = salesInvoices.find(p => p.id === e.target.value);
                if (found) {
                  setSelectedInvoice(found);
                } else {
                  setSelectedInvoice({
                    id: 'inv-new',
                    invoiceNo: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
                    dated: new Date().toISOString().substring(0, 10),
                    customerName: 'ZAMIL HEAVY INDUSTRIES LTD',
                    customerAddress: 'JEDDAH INDUSTRIAL ESTATE, AREA 4, SAUDI ARABIA',
                    dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                    paymentTerms: 'NET 30 DAYS',
                    shippingTerms: 'FOB PORT',
                    currency: 'AED',
                    exchangeRate: 1.0,
                    taxRate: 5,
                    items: []
                  });
                }
              }}
            >
              <option value="new">+ Dynamic Draft Invoice</option>
              {salesInvoices.map(p => (
                <option key={p.id} value={p.id}>{p.invoiceNo} — {p.customerName}</option>
              ))}
            </select>
            <button 
              onClick={handleSaveInvoice}
              className="px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer font-mono rounded-md border border-slate-900 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#f37021]" /> Save
            </button>
          </div>
        </div>

        {/* Card 2: Meta Specifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#f37021]" />
              <span className="text-[10px] text-slate-800 font-bold uppercase tracking-wider block font-mono">1. Buyer &amp; Invoice Specifications</span>
            </div>
            <span className="bg-orange-50 text-[#f37021] text-[9px] font-bold px-2 py-0.5 rounded border border-orange-100 uppercase tracking-widest font-mono">VAT Compliant</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider mb-1">Invoice Reference No</label>
              <input 
                type="text" 
                value={selectedInvoice.invoiceNo} 
                onChange={(e) => setSelectedInvoice({...selectedInvoice, invoiceNo: e.target.value.toUpperCase()})}
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs uppercase font-semibold text-[#f37021] focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-455 font-bold uppercase block tracking-wider mb-1">Issue Date</label>
              <input 
                type="date" 
                value={selectedInvoice.dated} 
                onChange={(e) => setSelectedInvoice({...selectedInvoice, dated: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs text-slate-700 focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider mb-1">Payment Due Date</label>
              <input 
                type="date" 
                value={selectedInvoice.dueDate} 
                onChange={(e) => setSelectedInvoice({...selectedInvoice, dueDate: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs text-slate-700 focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
              />
            </div>

            {/* Smart Autosuggest Customer Account Name */}
            <div className="relative">
              <label className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider mb-1">Customer Account</label>
              <div className="relative">
                <input 
                  type="text"
                  value={custSearchTerm}
                  onChange={(e) => {
                    setCustSearchTerm(e.target.value);
                    setSelectedInvoice({...selectedInvoice, customerName: e.target.value.toUpperCase()});
                    setShowCustSuggestions(true);
                  }}
                  onFocus={() => setShowCustSuggestions(true)}
                  className="w-full p-2 pr-7 bg-slate-50 border border-slate-250 rounded font-mono text-xs uppercase font-bold text-slate-800 focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
                  placeholder="Type to search..."
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5" />
              </div>
              
              {showCustSuggestions && custSearchTerm.length >= 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-250 shadow-lg rounded-md z-20 max-h-40 overflow-y-auto font-mono text-[11px] divide-y divide-slate-105">
                  {filteredSuggestions.length === 0 ? (
                    <div className="p-2 text-slate-400 italic">No matches in client records</div>
                  ) : (
                    filteredSuggestions.map(cust => (
                      <button
                        key={cust}
                        type="button"
                        onClick={() => handleSelectCustomerSuggestion(cust)}
                        className="w-full text-left p-2 hover:bg-slate-50 text-slate-800 hover:text-[#f37021] uppercase font-bold transition-colors block"
                      >
                        🏢 {cust}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[9px] text-slate-450 font-bold uppercase block tracking-wider mb-1">Billing Location Address</label>
            <textarea 
              rows={2}
              value={selectedInvoice.customerAddress} 
              onChange={(e) => setSelectedInvoice({...selectedInvoice, customerAddress: e.target.value.toUpperCase()})}
              className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs font-bold uppercase resize-none leading-relaxed focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none text-slate-700"
              placeholder="Full location address details..."
            />
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block mb-1">Currency</label>
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs cursor-pointer focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
                value={selectedInvoice.currency}
                onChange={(e) => {
                  const nextCurr = e.target.value;
                  const nextRate = nextCurr === 'USD' ? 3.67 : 1.0;
                  setSelectedInvoice({...selectedInvoice, currency: nextCurr, exchangeRate: nextRate});
                }}
              >
                <option value="AED">AED (Dirhams)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block mb-1">Exchange Conversion</label>
              <input 
                type="number" 
                step="0.01"
                disabled={selectedInvoice.currency === 'AED'}
                value={selectedInvoice.exchangeRate} 
                onChange={(e) => setSelectedInvoice({...selectedInvoice, exchangeRate: parseFloat(e.target.value) || 1.0})}
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs text-right disabled:opacity-60 focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block mb-1">VAT Cargo Rate</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={selectedInvoice.taxRate} 
                  onChange={(e) => setSelectedInvoice({...selectedInvoice, taxRate: parseInt(e.target.value) || 0})}
                  className="w-full p-2 pr-6 bg-slate-50 border border-slate-250 rounded font-mono text-xs text-right focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
                />
                <Percent className="w-3 h-3 text-slate-400 absolute right-2 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block mb-1">Inco Trade Terms</label>
              <input 
                type="text" 
                placeholder="e.g. FOB HARBOR"
                value={selectedInvoice.shippingTerms} 
                onChange={(e) => setSelectedInvoice({...selectedInvoice, shippingTerms: e.target.value.toUpperCase()})}
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs uppercase focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-450 font-bold uppercase block mb-1">Payment Settlement Terms</label>
              <input 
                type="text" 
                placeholder="e.g. CAD AT SIGHT"
                value={selectedInvoice.paymentTerms} 
                onChange={(e) => setSelectedInvoice({...selectedInvoice, paymentTerms: e.target.value.toUpperCase()})}
                className="w-full p-2 bg-slate-50 border border-slate-250 rounded font-mono text-xs uppercase focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Form Scheduler Line Adder */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-indigo-50 pb-2">
            <Plus className="w-4 h-4 text-[#f37021]" />
            <span className="text-[10px] text-slate-800 font-semibold uppercase tracking-wide block font-mono">2. Add Customs Fastener Row Line</span>
          </div>
          
          <form onSubmit={handleAddNewInvoiceLine} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-tight mb-1">Fastener Description</label>
                <input 
                  type="text" 
                  placeholder="STAINLESS STEEL HEX NUTS..."
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-250 rounded font-sans text-xs uppercase font-semibold focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-tight mb-1">Diameter / Length Specs</label>
                <input 
                  type="text" 
                  placeholder="e.g. M14 x 80MM"
                  value={invItemSize}
                  onChange={(e) => setInvItemSize(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-250 rounded font-sans text-xs uppercase focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-tight mb-1">QTY</label>
                <input 
                  type="number" 
                  value={invItemQty} 
                  onChange={(e) => setInvItemQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-white border border-slate-250 rounded font-mono text-xs text-right font-bold focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-500 block uppercase font-bold tracking-tight mb-1">Unit</label>
                <input 
                  type="text" 
                  value={invItemUnit} 
                  onChange={(e) => setInvItemUnit(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-250 rounded font-sans text-xs uppercase text-center focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-[#f37021] block uppercase font-bold mb-1">Unit Price ({selectedInvoice.currency})</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={invItemPrice} 
                  onChange={(e) => setInvItemPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-250 rounded font-mono text-xs text-right font-bold focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] outline-none text-slate-900"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase text-xs font-bold cursor-pointer text-center rounded-lg transition-all border border-slate-900 hover:scale-[1.01]"
            >
              + Schedule Invoice Comp Row
            </button>
          </form>
        </div>
      </div>

      {/* Right Side Render layout (Beautiful preview with official double borders & signature box) */}
      <div className="xl:col-span-7">
        <div className="bg-white border-2 border-slate-300 p-6 md:p-8 text-black shadow-lg max-w-[640px] mx-auto relative overflow-hidden rounded-xl print:border-none print:shadow-none print:p-0">
          
          {/* Aesthetic Compliance Visual Watermark */}
          <div className="absolute right-4 top-24 pointer-events-none opacity-5 select-none transform rotate-12">
            <div className="border-4 border-slate-950 p-4 font-mono font-bold text-4xl uppercase tracking-widest text-center">
              DRAFT BILL
            </div>
          </div>

          {/* Header branding */}
          <div className="border-t-[5px] border-[#f37021] pt-3 flex justify-between items-start font-mono uppercase text-xs border-b border-dashed pb-3">
            <div>
              <span className="text-[8.5px] text-[#f37021] font-bold tracking-widest block font-mono">Sales &amp; Export Billing Department</span>
              <h3 className="font-semibold text-slate-950 text-sm leading-tight uppercase font-sans">{companyProfile.name}</h3>
              <p className="text-[9.5px] mt-0.5 text-slate-700 font-semibold font-mono">{companyProfile.address || 'Sales Department'}</p>
              <p className="text-[8px] mt-0.5 text-slate-500 font-bold font-mono">TRN: {companyProfile.trn || 'N/A'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-350 p-2 text-right min-w-[210px] rounded">
              <h4 className="text-xs font-bold tracking-widest text-[#f37021] block font-sans">TAX INVOICE (DRAFT)</h4>
              <p className="text-[10px] font-mono font-bold text-slate-950 mt-1 uppercase">Doc Ref: {selectedInvoice.invoiceNo}</p>
              <p className="text-[9px] font-mono uppercase">Issued: {selectedInvoice.dated}</p>
            </div>
          </div>

          {/* Customer details box */}
          <div className="border border-slate-300 grid grid-cols-12 mt-4 text-[11px] font-mono select-none rounded-lg overflow-hidden">
            <div className="col-span-7 p-3 border-r border-slate-300 leading-tight bg-white">
              <span className="text-[8.5px] text-slate-400 font-semibold block uppercase tracking-wide">Invoiced To / Ship To:</span>
              <h5 className="font-semibold text-slate-950 uppercase block mt-1">{selectedInvoice.customerName || "— NOT SPECIFIED —"}</h5>
              <p className="text-slate-500 block mt-0.5 text-[10px] uppercase leading-relaxed">{selectedInvoice.customerAddress || 'CLIENT COMPLIANCE SITE, UAE'}</p>
            </div>
            <div className="col-span-5 p-3 leading-tight bg-slate-50/80 text-[10px]">
              <span className="text-[8.5px] text-slate-400 font-bold block uppercase border-b border-slate-200 pb-1 tracking-wide">Shipping Terms &amp; Terms</span>
              <div className="space-y-1.5 mt-1.5 font-bold text-slate-600 uppercase">
                <p className="flex justify-between"><span>Incoterm:</span> <span className="text-slate-950 font-bold">{selectedInvoice.shippingTerms || 'EXW-WORKS'}</span></p>
                <p className="flex justify-between"><span>Payment:</span> <span className="text-[#f37021] font-semibold">{selectedInvoice.paymentTerms || 'NET 30 DAYS'}</span></p>
                <p className="flex justify-between"><span>Due date:</span> <span className="text-blue-700 font-bold">{selectedInvoice.dueDate}</span></p>
              </div>
            </div>
          </div>

          {/* Grid Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full border border-slate-300 border-collapse uppercase text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-left font-mono text-[9px] text-slate-900">
                  <th className="border-r border-slate-300 p-2 text-center w-8">S.N</th>
                  <th className="border-r border-slate-300 p-2 text-left">Industrial Fastener Item Class / Specification</th>
                  <th className="border-r border-slate-300 p-2 text-center w-14">Size</th>
                  <th className="border-r border-slate-300 p-2 text-center w-12">Unit</th>
                  <th className="border-r border-slate-300 p-2 text-center w-14">QTY</th>
                  <th className="border-r border-slate-300 p-2 text-right w-16">Price</th>
                  <th className="p-2 text-right w-24">Amount ({selectedInvoice.currency})</th>
                  <th className="p-1.5 text-center w-8 no-print border-l border-slate-300">Void</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[10px] font-sans">
                {selectedInvoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 italic text-slate-400 font-mono bg-slate-50/40">No draft tax lines scheduled. Add items using the parameters panel on the left side.</td>
                  </tr>
                ) : (
                  selectedInvoice.items.map((it: any) => (
                    <tr key={it.sn} className="hover:bg-slate-50/50 font-medium text-slate-900 font-mono">
                      <td className="border-r border-slate-300 p-2 text-center font-bold text-slate-500">{it.sn}</td>
                      <td className="border-r border-slate-300 p-2 text-left font-semibold text-slate-800 font-sans tracking-tight">{it.description}</td>
                      <td className="border-r border-slate-300 p-2 text-center font-bold text-rose-600">{it.size || '—'}</td>
                      <td className="border-r border-slate-300 p-2 text-center uppercase text-slate-600">{it.unit}</td>
                      <td className="border-r border-slate-300 p-2 text-center font-bold text-slate-950">{it.qty.toLocaleString()}</td>
                      <td className="border-r border-slate-300 p-2 text-right text-slate-705">{it.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold text-teal-850 bg-slate-50/30">
                        {(it.qty * it.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-center no-print border-l border-slate-300">
                        <button
                          onClick={() => deleteInvoiceLine(it.sn)}
                          className="text-slate-400 hover:text-rose-600 font-bold text-[13px] hover:scale-110 active:scale-95 transition-all cursor-pointer inline-block"
                          title="Void item line"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))
                )}

                {/* Total Calculations Block */}
                {selectedInvoice.items.length > 0 && (
                  <>
                    <tr className="border-t border-slate-300 bg-slate-50/50 border-r border-l">
                      <td colSpan={4} className="p-2 text-right font-mono text-[9px] uppercase font-bold text-slate-450">Scheduled Subtotal:</td>
                      <td className="p-2 text-center font-bold font-mono text-slate-950 bg-orange-50/30">{selectedInvoice.items.reduce((s: number, c: any) => s + c.qty, 0).toLocaleString()}</td>
                      <td className="p-2 border-r border-slate-300"></td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950">
                        {subtotalHeader(selectedInvoice.currency, activeSubtotal)}
                      </td>
                      <td className="p-1 text-center border-l no-print bg-slate-50/50"></td>
                    </tr>
                    <tr className="bg-slate-50/50 border-r border-l border-t">
                      <td colSpan={6} className="p-2 text-right font-mono text-[9px] uppercase font-bold text-[#f37021]">VAT Amount ({selectedInvoice.taxRate}%):</td>
                      <td className="p-2 text-right font-mono font-bold text-[#f37021]">
                        {subtotalHeader(selectedInvoice.currency, activeVat)}
                      </td>
                      <td className="p-1 text-center border-l no-print bg-slate-50/50"></td>
                    </tr>
                    <tr className="bg-slate-100 font-bold font-mono text-[10px] border-t-2 border-slate-800 border-b border-r border-l">
                      <td colSpan={4} className="p-2.5 text-right uppercase font-bold tracking-wide">Net Tax Invoice Total</td>
                      <td colSpan={2} className="p-2.5 text-right text-slate-500 font-mono text-[8.5px] uppercase">EXCHANGE: {selectedInvoice.exchangeRate}</td>
                      <td className="p-2.5 text-right font-mono text-teal-850 font-bold text-[12px] bg-teal-50/20">
                        {subtotalHeader(selectedInvoice.currency, activeGrandTotal)}
                      </td>
                      <td className="p-1 text-center border-l no-print bg-slate-100"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Amount In Words - Custom Unique Block */}
          {selectedInvoice.items.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 uppercase text-[10px] select-text">
              <span className="text-[9px] text-[#f37021] font-semibold block mb-1">TOTAL AMOUNT IN WORDS:</span>
              <span className="font-semibold text-slate-900 leading-normal font-mono block">
                {activeWords}
              </span>
              {selectedInvoice.currency === 'USD' && (
                <span className="text-[9px] text-slate-450 block mt-1.5 font-sans font-bold">
                  * EQUIVALENT ARAB EMIRATES AMOUNT: <strong className="text-slate-800">AED {(activeGrandTotal * 3.67).toLocaleString('en-US', { minimumFractionDigits: 2 })} ONLY</strong>
                </span>
              )}
            </div>
          )}

          {/* Official stamp section block */}
          <div className="grid grid-cols-2 mt-4 text-center text-[10px] divide-x divide-slate-300 border border-slate-300 h-24 font-mono select-none rounded-lg overflow-hidden">
            <div className="p-2.5 flex flex-col justify-between bg-white leading-none">
              <span className="text-[8px] text-slate-450 block uppercase font-bold tracking-wider">Planned Outward Accounts Desk</span>
              <span className="text-[10px] font-bold uppercase text-slate-800 border-t border-dashed pt-1.5 inline-block">Accounts Sign &amp; Date</span>
            </div>
            <div className="p-2.5 bg-slate-50 flex flex-col justify-between h-full leading-none">
              <span className="text-[8px] text-[#f37021] block uppercase font-bold tracking-wider">MFI CORPORATE COMPLIANCE</span>
              <span className="text-[10px] font-bold uppercase text-slate-900 border-t border-dashed pt-1.5 inline-block">Authorized Stamp Section</span>
            </div>
          </div>

          {/* Export Actions Panel */}
          <div className="mt-6 flex justify-end gap-2.5 no-print">
            <button 
              onClick={printInvoiceSlip}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-650 to-amber-600 bg-[#f37021] hover:bg-orange-600 font-semibold text-white text-[10.5px] uppercase flex items-center gap-2 cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-white" /> EXPORT COMPLIANCE Billing PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function subtotalHeader(currency: string, value: number) {
  return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}
