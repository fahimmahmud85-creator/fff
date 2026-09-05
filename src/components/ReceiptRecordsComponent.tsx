import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Eye, Printer, Receipt, Check, X } from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, isMarineFastenersCompany } from '../utils/companyProfile';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';

const numberToWordsDirhams = (num: number): string => {
  if (num === 0) return 'ZERO DIRHAMS ONLY';
  
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];

  const convertSection = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str;
  };

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  let result = '';

  if (wholePart > 0) {
    let temp = wholePart;
    let scaleIndex = 0;
    while (temp > 0) {
      const section = temp % 1000;
      if (section > 0) {
        result = convertSection(section) + (scales[scaleIndex] ? scales[scaleIndex] + ' ' : '') + result;
      }
      temp = Math.floor(temp / 1000);
      scaleIndex++;
    }
    result += 'DIRHAMS ';
  }

  if (decimalPart > 0) {
    if (wholePart > 0) result += 'AND ';
    result += convertSection(decimalPart) + 'FILS ';
  }

  result += 'ONLY';
  return result.replace(/\s+/g, ' ');
};

export const handlePrintVoucher = (rcToPrint: any) => {
  const words = numberToWordsDirhams(rcToPrint.amountReceived);
  const activeComp = getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeComp);
  const compCode = (activeComp.code || (isMfi ? 'MFI' : 'ERP')).toUpperCase();

  const logoHtml = activeComp.showLogo && activeComp.logoUrl && activeComp.logoUrl !== '/logo.png'
    ? `<img src="${activeComp.logoUrl}" style="max-height: 38px; max-width: 90px; object-fit: contain;" />`
    : isMfi
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" style="height: 28px; width: auto; display: block;">
        <g transform="skewX(-16) translate(40, 10)">
          <g fill="#1e3a8a">
            <path d="M 85,30 Q 55,30 5,34 Q 55,38 85,38 Z" />
            <path d="M 80,48 Q 50,48 12,52 Q 50,56 80,56 Z" />
            <path d="M 75,66 Q 45,66 20,70 Q 45,74 75,74 Z" />
          </g>
          <path d="M 100,25 L 142,25 L 165,85 L 188,25 L 230,25 L 230,155 L 194,155 L 194,75 L 172,130 L 158,130 L 136,75 L 136,155 L 100,155 Z" fill="#1e3a8a" />
          <path d="M 235,25 L 315,25 L 315,58 L 269,58 L 269,85 L 305,85 L 305,115 L 269,115 L 269,155 L 233,155 Z" fill="#1e3a8a" />
          <path d="M 75,160 L 332,160 L 322,198 L 65,198 Z" fill="#0f172d" />
          <text x="193" y="187" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="20" text-anchor="middle" fill="#ffffff" letter-spacing="1">MARINE FASTENERS</text>
        </g>
      </svg>`
    : `<div style="background: #1e3a8a; color: #fff; font-weight: 900; font-size: 14px; padding: 4px 8px; border-radius: 4px;">${compCode}</div>`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${(activeComp.name || 'COMPANY LLC').toUpperCase()} Cash/Cheque Receipt Voucher #${rcToPrint.voucherNo}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;750;900&family=JetBrains+Mono:wght@400;700;900&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: "Plus Jakarta Sans", "Helvetica Neue", sans-serif;
          padding: 20px;
          color: #0f172a;
          background-color: #f1f5f9;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        
        .voucher-container {
          width: 7in;
          min-height: 5.3in;
          height: auto;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .double-ring-border {
          border: 3px double #1e3a8a;
          border-radius: 4px;
          padding: 10px;
          min-height: calc(5.3in - 16px);
          height: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .header-box {
          border: 1px solid #1e3a8a;
          padding: 4px;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-left {
          width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .header-mid {
          flex: 1;
          text-align: center;
          padding: 0 5px;
        }
        
        .company-title-en {
          font-size: 11px;
          font-weight: 900;
          color: #1e3a8a;
          letter-spacing: 0.2px;
          text-transform: uppercase;
        }
        
        .company-title-sp {
          font-size: 5.5px;
          border: 1px solid #1e3a8a;
          padding: 0.5px 2px;
          font-weight: 900;
          color: #1e3a8a;
          vertical-align: middle;
          display: inline-block;
          margin-left: 3px;
        }
        
        .company-title-ar {
          font-size: 13.5px;
          font-weight: bold;
          color: #1e3a8a;
          font-family: serif;
          margin-top: 1px;
          direction: rtl;
          line-height: 1;
        }
        
        .company-subtitle {
          font-size: 7px;
          color: #0d1e4a;
          font-weight: 800;
          margin-top: 2px;
          border-top: 1px solid #1e3a8a;
          padding-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.1px;
        }
        
        .company-contact {
          font-size: 5.8px;
          color: #475569;
          margin-top: 1.5px;
          line-height: 1.2;
          font-weight: 500;
        }
        
        .title-strip {
          border-top: 2px solid #1e3a8a;
          border-bottom: 2px solid #1e3a8a;
          padding: 4px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          background-color: #ffffff;
        }
        
        .voucher-no-label {
          font-size: 11px;
          font-weight: 900;
          color: #1e3a8a;
          text-transform: uppercase;
        }
        
        .voucher-no-val {
          font-size: 13px;
          font-weight: 950;
          color: #be123c;
          font-family: 'JetBrains Mono', monospace;
          margin-left: 6px;
          border-bottom: 1px solid #f43f5e;
          padding-bottom: 0.5px;
          display: inline-block;
          min-width: 50px;
        }
        
        .payment-badges-group {
          display: flex;
          gap: 8px;
        }
        
        .payment-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #1e3a8a;
          border-radius: 9999px;
          padding: 1.5px 8px;
          font-size: 8.5px;
          font-weight: 900;
          color: #1e3a8a;
          background-color: #ffffff;
          text-transform: uppercase;
        }
        
        .payment-badge.active {
          background-color: #1e3a8a;
          color: #ffffff;
          border-color: #1e3a8a;
        }
        
        .payment-badge .bullet {
          font-size: 7px;
          line-height: 1;
        }
        
        .main-grid {
          display: grid;
          grid-template-cols: 1.35fr 1fr;
          gap: 16px;
          margin-bottom: 4px;
        }
        
        .field-row {
          display: flex;
          align-items: flex-end;
          margin-bottom: 6px;
          font-size: 9.5px;
          line-height: 1.3;
        }
        
        .field-label {
          font-weight: 900;
          color: #1e293b;
          min-width: 90px;
          text-transform: uppercase;
          font-size: 8.5px;
          white-space: nowrap;
        }
        
        .field-value {
          flex: 1;
          border-bottom: 1px dotted #1e3a8a;
          padding-bottom: 0.5px;
          font-weight: 700;
          color: #1e3a8a;
          font-size: 9.5px;
          text-transform: uppercase;
          margin-left: 4px;
          min-height: 14px;
          display: flex;
          align-items: flex-end;
          position: relative;
        }
        
        .num-box-container {
          border: 1.2px dashed #1e3a8a;
          border-radius: 4px;
          padding: 4px;
          text-align: center;
          background-color: #fafafa;
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .num-title {
          font-size: 7.5px;
          font-weight: 900;
          color: #1e3a8a;
          text-transform: uppercase;
          margin-bottom: 3px;
          letter-spacing: 0.2px;
        }
        
        .num-box {
          border: 1.5px solid #1e3a8a;
          padding: 2px 10px;
          font-size: 12.5px;
          font-weight: 900;
          color: #1e3a8a;
          font-family: "JetBrains Mono", monospace;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #ffffff;
          line-height: 1;
        }
        
        .num-ccy {
          border-right: 1px solid #1e3a8a;
          padding-right: 8px;
          font-weight: 900;
          font-size: 9px;
        }
        
        .cheque-section {
          margin-top: 4px;
          border-top: 1.2px solid #1e3a8a;
          padding-top: 6px;
        }
        
        .footer-signatures {
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 8.5px;
        }
        
        .sig-client {
          text-align: center;
          border-top: 1.2px dotted #1e3a8a;
          width: 140px;
          padding-top: 3px;
          font-weight: 800;
          text-transform: uppercase;
          color: #475569;
        }
        
        .sig-mfi {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          width: 180px;
        }
        
        .stamp-space {
          border: 1.5px dashed rgba(30, 58, 138, 0.45);
          border-radius: 4px;
          width: 140px;
          height: 65px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(30, 58, 138, 0.7);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          background-color: #f8fafc;
        }
        
        .sig-line {
          border-top: 1.2px solid #1e3a8a;
          padding-top: 3.5px;
          font-weight: 950;
          text-transform: uppercase;
          color: #1e3a8a;
          text-align: center;
          width: 100%;
        }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5in 0.5in;
          }
          body {
            padding: 0;
            margin: 0;
            background-color: transparent;
            display: block;
          }
          .voucher-container {
            width: 100% !important;
            max-width: 7.2in !important;
            min-height: 5.3in !important;
            height: auto !important;
            border: none;
            box-shadow: none;
            padding: 0;
            margin: 0 auto;
            page-break-inside: avoid;
          }
          .double-ring-border {
            border: 3px double #1e3a8a;
            border-radius: 4px;
            padding: 12px;
            box-sizing: border-box;
            min-height: 5.3in;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        }
      </style>
    </head>
    <body>
      <div class="voucher-container">
        <div class="double-ring-border">
          <div class="header-box">
            <div class="header-left">
              ${logoHtml}
            </div>
            <div class="header-mid">
              <div>
                <span class="company-title-en">${(activeComp.name || 'COMPANY LLC').toUpperCase()}</span>
              </div>
              <div class="company-subtitle">${activeComp.subtitle || 'Industrial Trading & Manufacturing Division'}</div>
              <div class="company-contact">
                ${activeComp.address || 'Industrial Area, UAE'} &bull; Tel: ${activeComp.phone || '—'} &bull; Email: ${activeComp.email || '—'}
              </div>
            </div>
          </div>

          <div class="title-strip">
            <div>
              <span class="voucher-no-label">No.</span>
              <span class="voucher-no-val">${rcToPrint.voucherNo || ''}</span>
            </div>
            
            <div class="payment-badges-group">
              <div class="payment-badge ${rcToPrint.paymentMode === 'CASH' ? 'active' : ''}">
                <span class="bullet">●</span> Cash
              </div>
              <div class="payment-badge ${rcToPrint.paymentMode === 'CHEQUE' ? 'active' : ''}">
                <span class="bullet">●</span> Cheque
              </div>
              <div class="payment-badge ${rcToPrint.paymentMode === 'BANK TRANSFER' ? 'active' : ''}">
                <span class="bullet">●</span> Bank Wire
              </div>
            </div>
          </div>

          <div class="main-grid">
            <div>
              <div class="field-row">
                <span class="field-label">${rcToPrint.accountCategory === 'PAYABLES' ? 'Payee:' : 'Client Payer:'}</span>
                <div class="field-value">${rcToPrint.clientName || ''}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Address:</span>
                <div class="field-value">${rcToPrint.clientAddress || ''}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Amt In Words:</span>
                <div class="field-value" style="font-size: 8.5px; font-weight: 800; line-height: 1.2;">${words}</div>
              </div>
              <div class="field-row">
                <span class="field-label" style="min-width: 65px;">Advance AED:</span>
                <div class="field-value" style="text-align: center; justify-content: center; font-weight: 800;">
                  ${rcToPrint.advance ? rcToPrint.advance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <span class="field-label" style="min-width: 65px; margin-left: 10px;">Balance AED:</span>
                <div class="field-value" style="text-align: center; justify-content: center; font-weight: 800;">
                  ${rcToPrint.balance ? rcToPrint.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="field-row">
                  <span class="field-label" style="min-width: 55px;">Dated:</span>
                  <div class="field-value" style="font-family: 'JetBrains Mono', monospace; font-weight: 800;">
                    ${rcToPrint.dated || ''}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="height: 11px; width: 11px; margin-left: auto; opacity: 0.85;">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                </div>
                <div class="field-row">
                  <span class="field-label" style="min-width: 65px;">Against PO:</span>
                  <div class="field-value" style="text-align: center; justify-content: center;">${rcToPrint.receivedAgainstPo || ''}</div>
                </div>
                <div class="field-row">
                  <span class="field-label" style="min-width: 65px;">Invoice:</span>
                  <div class="field-value" style="text-align: center; justify-content: center;">${rcToPrint.receivedAgainstInvoice || ''}</div>
                </div>
              </div>

              <div class="num-box-container">
                <span class="num-title">Numerical AED Value</span>
                <div class="num-box">
                  <span class="num-ccy">AED</span>
                  <span style="font-size: 14px; font-weight: 900; letter-spacing: 0.5px;">
                    ${rcToPrint.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="field-row" style="margin-bottom: 4px;">
            <span class="field-label">Particulars:</span>
            <div class="field-value" style="font-size: 8.5px; font-weight: 600; color: #334155;">${rcToPrint.narration || ''}</div>
          </div>

          <div class="cheque-section">
            <div style="display: flex; gap: 10px; margin-bottom: 4px;">
              <div class="field-row" style="flex: 1; margin-bottom: 0;">
                <span class="field-label" style="min-width: 65px;">${rcToPrint.paymentMode === 'BANK TRANSFER' ? 'TT Ref No:' : 'Cheque No:'}</span>
                <div class="field-value">${rcToPrint.paymentMode !== 'CASH' ? (rcToPrint.chequeNoDetails || '') : ''}</div>
              </div>
              <div class="field-row" style="flex: 1; margin-bottom: 0;">
                <span class="field-label" style="min-width: 70px;">${rcToPrint.paymentMode === 'BANK TRANSFER' ? 'Received Date:' : 'Cheque Date:'}</span>
                <div class="field-value" style="font-family: 'JetBrains Mono', monospace;">
                  ${rcToPrint.paymentMode !== 'CASH' ? (rcToPrint.chequeDate || '') : ''}
                  ${rcToPrint.paymentMode !== 'CASH' ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="height: 9px; width: 9px; margin-left: auto; opacity: 0.85;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>' : ''}
                </div>
              </div>
              <div class="field-row" style="flex: 1; margin-bottom: 0;">
                <span class="field-label" style="min-width: 65px;">Bank Name:</span>
                <div class="field-value">${rcToPrint.paymentMode !== 'CASH' ? (rcToPrint.bankName || '') : ''}</div>
              </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 4px; margin-bottom: 0;">
              <div class="field-row" style="flex: 1; margin-bottom: 0;">
                <span class="field-label" style="min-width: 85px;">${rcToPrint.accountCategory === 'PAYABLES' ? 'Payee Bank A/C:' : 'Party Bank A/C:'}</span>
                <div class="field-value" style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${rcToPrint.clientBankAccount || '—'}</div>
              </div>
              <div class="field-row" style="flex: 1.2; margin-bottom: 0;">
                <span class="field-label" style="min-width: 75px;">Bank Branch:</span>
                <div class="field-value">${rcToPrint.paymentMode !== 'CASH' ? (rcToPrint.bankAddress || '—') : '—'}</div>
              </div>
            </div>
          </div>

          <div class="footer-signatures">
            <div class="sig-client">
              Client Signature
            </div>
            <div class="sig-mfi">
              <div class="stamp-space">
                Stamp & Signature
              </div>
              <div class="sig-line">
                For: ${(activeComp.name || 'COMPANY LLC').toUpperCase()}
              </div>
            </div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
  
  printHtml(htmlContent, `MFI_Receipt_Voucher_${rcToPrint.voucherNo}`);
};

interface ReceiptVoucher {
  id: string;
  voucherNo: string;
  dated: string;
  clientName: string;
  amountReceived: number;
  paymentMode: 'CASH' | 'CHEQUE' | 'BANK TRANSFER';
  chequeNoDetails: string;
  bankName: string;
  narration: string;
  invoiceAllocated: string;
  clientAddress?: string;
  receivedAgainstPo?: string;
  receivedAgainstInvoice?: string;
  advance?: number;
  balance?: number;
  chequeDate?: string;
  bankAddress?: string;
  accountCategory?: 'RECEIVABLES' | 'PAYABLES';
  targetCustomerId?: string;
  autoPostToLedger?: boolean;
}

interface ReceiptRecordsProps {
  receiptRegisters: ReceiptVoucher[];
  setReceiptRegisters: (registers: ReceiptVoucher[]) => void;
  setActiveReceiptId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  triggerToast: (msg: string) => void;
}

export const ReceiptRecordsComponent: React.FC<ReceiptRecordsProps> = ({
  receiptRegisters,
  setReceiptRegisters,
  setActiveReceiptId,
  setActiveTab,
  triggerToast
}) => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [hiddenReceiptIds, setHiddenReceiptIds] = useState<string[]>([]);

  const filteredReceipts = useMemo(() => {
    return receiptRegisters.filter(rc => {
      if (hiddenReceiptIds.includes(rc.id)) return false;
      const matchesMode = filterMode === 'ALL' || rc.paymentMode === filterMode;
      const str = `${rc.voucherNo} ${rc.clientName} ${rc.bankName} ${rc.chequeNoDetails} ${rc.invoiceAllocated || ''}`.toUpperCase();
      const matchesSearch = !search || str.includes(search.trim().toUpperCase());
      
      let matchesDate = true;
      if (fromDate) {
        matchesDate = matchesDate && rc.dated >= fromDate;
      }
      if (toDate) {
        matchesDate = matchesDate && rc.dated <= toDate;
      }

      return matchesMode && matchesSearch && matchesDate;
    });
  }, [receiptRegisters, filterMode, search, fromDate, toDate, hiddenReceiptIds]);

  const handleDeleteReceipt = (id: string, voucherNo: string) => {
    if (window.confirm(`Are you sure you want to permanently delete Cash/Cheque Receipt Voucher #${voucherNo}?`)) {
      const revised = receiptRegisters.filter(rc => rc.id !== id);
      setReceiptRegisters(revised);
      localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(revised));
      triggerToast(`Receipt Voucher #${voucherNo} has been deleted.`);
    }
  };

  const handleSelectReceipt = (id: string) => {
    setActiveReceiptId(id);
    setActiveTab('receipt');
    triggerToast(`Loaded Receipt Voucher in primary desk context.`);
  };

  const handlePrintReceiptsLedger = () => {
    if (filteredReceipts.length === 0) {
      triggerToast('No receipt vouchers available in current filter to print.');
      return;
    }
    triggerToast(`Preparing Official Receipt Vouchers Ledger Printout (${filteredReceipts.length} records)...`);

    const rowsHtml = filteredReceipts.map((r, idx) => {
      const mode = r.paymentMode || 'CASH';
      const ref = r.chequeNoDetails || r.bankName || '—';
      const amt = Number(r.amountReceived || 0);

      return `
        <tr style="border-bottom: 1px solid #cbd5e1; height: 26px; font-size: 10px; text-align: center; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #083c54;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: 900; color: #059669;">${r.voucherNo || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${r.dated || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 4px 8px; font-weight: bold; text-transform: uppercase;">${r.clientName || 'UNTITLED CLIENT'}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold; color: #0284c7;">${mode}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 4px 6px; font-size: 9px; font-family: monospace;">${ref}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace; font-weight: bold; color: #0f172a;">AED ${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const totalAmt = filteredReceipts.reduce((s, r) => s + Number(r.amountReceived || 0), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Official Receipt Vouchers Ledger</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm !important;
            }
            body {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              color: #000;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-box {
              border: 2px solid #083c54;
              padding: 10px 16px;
              background-color: #f0f7fa;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .title {
              font-size: 16px;
              font-weight: 900;
              color: #083c54;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin: 0;
            }
            .subtitle {
              font-size: 9.5px;
              color: #64748b;
              font-weight: 700;
              margin: 2px 0 0 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background-color: #083c54;
              color: #ffffff;
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 6px 4px;
              border: 1px solid #05293a;
              text-align: center;
            }
            tfoot td {
              background-color: #f1f5f9;
              font-weight: 900;
              font-size: 10px;
              padding: 6px 8px;
              border: 1.5px solid #083c54;
            }
            .footer {
              margin-top: 14px;
              border-top: 1.5px dashed #94a3b8;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              font-weight: 700;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <h1 class="title">Marine Fasteners Industries LLC</h1>
              <div class="subtitle">OFFICIAL RECEIPT VOUCHERS REPOSITORY & FINANCIAL COLLECTION AUDIT LOG</div>
            </div>
            <div style="text-align: right; font-size: 9px; font-family: monospace; font-weight: bold;">
              <div>Records: <strong>${filteredReceipts.length}</strong></div>
              <div>Period: ${fromDate || 'Start'} to ${toDate || 'Present'}</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%;">SN</th>
                <th style="width: 15%;">VOUCHER NO</th>
                <th style="width: 11%;">DATE</th>
                <th style="width: 32%; text-align: left; padding-left: 8px;">RECEIVED FROM CLIENT / CUSTOMER</th>
                <th style="width: 10%;">MODE</th>
                <th style="width: 16%; text-align: left; padding-left: 6px;">BANK / CHEQUE / REF</th>
                <th style="width: 12%; text-align: right; padding-right: 8px;">AMOUNT (AED)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right; font-weight: 900;">TOTAL COLLECTIONS (AED):</td>
                <td style="text-align: right; font-family: monospace; color: #083c54;">AED ${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <span>OFFICIAL MFI FINANCIAL RECEIPT LOG</span>
            <span>DUBAI, UNITED ARAB EMIRATES</span>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `MFI_Receipt_Vouchers_Ledger_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm text-black font-mono select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3 gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Receipt className="w-5 h-5 text-orange-500" />
            <h3 className="font-sans text-sm font-bold uppercase text-slate-900 leading-none">
              Cash & Cheque Receipt Records Ledger
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Master repository of payments received, cheque clearances, and bank telex deposit logs.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-slate-900 text-white font-bold border rounded uppercase text-[10px]">
          Vouchers Count: {receiptRegisters.length}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl no-print text-[10px]">
        {/* Search input with small search button */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search voucher #, client, bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 py-1 px-2.5 pl-7 text-[10px] uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-slate-500 rounded font-bold font-sans"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
          </div>
          <button
            type="button"
            className="bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95"
            title="Search"
          >
            <Search className="w-3 h-3 text-orange-400" />
            <span>Search</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />

        {/* From Date Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[9.5px] font-bold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* To Date Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[9.5px] font-bold font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="h-4 w-[1px] bg-slate-300 hidden md:block" />

        {/* Payment Mode Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-white border border-slate-300 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Mode: All</option>
            <option value="CASH">Cash Receipts</option>
            <option value="CHEQUE">Cheque Deposits</option>
            <option value="BANK TRANSFER">Bank Transfers</option>
          </select>
        </div>

        {/* Reset Filters button */}
        {(search || fromDate || toDate || filterMode !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFromDate('');
              setToDate('');
              setFilterMode('ALL');
            }}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-2 py-0.5 rounded text-[8.5px] font-bold uppercase cursor-pointer transition-all shrink-0 ml-auto"
          >
            Reset
          </button>
        )}
      </div>

      <div className="box-shaped overflow-x-auto">
        <table className="box-shaped-table w-full text-left font-mono text-[10.5px] bg-white">
          <thead>
            <tr>
              <th className="p-2.5 text-[9.5px]">Receipt No</th>
              <th className="p-2.5 text-[9.5px]">Dated</th>
              <th className="p-2.5 text-[9.5px]">Client / Payee / Payer</th>
              <th className="p-2.5 text-[9.5px] text-center">Payment Mode</th>
              <th className="p-2.5 text-[9.5px] text-right">Amount (AED)</th>
              <th className="p-2.5 text-center text-[9.5px] w-[120px]">View Receipt</th>
              <th className="p-2.5 text-center text-[9.5px] w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 italic font-mono uppercase">
                  No payment vouchers match the selected filter parameters.
                </td>
              </tr>
            ) : (
              filteredReceipts.map((rc, idx) => {
                const isSelected = selectedRowIndex === idx;
                return (
                  <tr 
                    key={rc.id} 
                    onClick={() => setSelectedRowIndex(idx)}
                    className={`font-bold transition-all text-slate-800 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 ring-1 ring-indigo-300 ring-inset' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-2.5 text-amber-600">{rc.voucherNo}</td>
                    <td className="p-2.5 whitespace-nowrap">{rc.dated}</td>
                    <td className="p-2.5 text-[#1e293b] leading-tight select-all">
                      {rc.clientName ? rc.clientName : 'UNTITLED PAYER'}
                      <span className="block text-[8px] text-slate-400 uppercase tracking-tight max-w-[200px] truncate font-sans font-medium">
                        Allocated Inv: {rc.invoiceAllocated || '—'} | PO Ref: {rc.receivedAgainstPo || '—'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-[8px] font-bold tracking-wider uppercase border ${
                        rc.paymentMode === 'CASH' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : rc.paymentMode === 'CHEQUE' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}>
                        {rc.paymentMode}
                      </span>
                      {rc.paymentMode !== 'CASH' && (
                        <span className="block text-[7px] text-slate-400 font-sans font-medium tracking-tight mt-0.5 truncate max-w-[120px] mx-auto">
                          {rc.bankName} | {rc.chequeNoDetails}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right text-emerald-700 font-semibold select-all">
                      AED {rc.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handlePrintVoucher(rc)}
                        className="inline-flex items-center justify-center p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded cursor-pointer transition-all shadow-xs hover:scale-105 mx-auto"
                        title="View & Print Official Receipt Voucher PDF"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    </td>
                    <td className="p-2.5 flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSelectReceipt(rc.id)}
                        title="Open and Edit Voucher"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 font-bold uppercase cursor-pointer rounded-md transition-all flex items-center justify-center shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => handlePrintVoucher(rc)}
                        title="Direct Print Slip"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-1.5 font-bold uppercase cursor-pointer rounded-md transition-all flex items-center justify-center shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirmId === rc.id ? (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-250 p-0.5 rounded shadow-2xs font-sans">
                          <span className="text-[8px] font-bold text-red-600 tracking-tight ml-0.5 font-mono">SURE?</span>
                          <button
                            onClick={() => {
                              const revised = receiptRegisters.filter(item => item.id !== rc.id);
                              setReceiptRegisters(revised);
                              localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(revised));
                              triggerToast(`Receipt Voucher #${rc.voucherNo} has been deleted.`);
                              setDeleteConfirmId(null);
                            }}
                            className="p-1 text-red-750 hover:text-red-900 hover:bg-red-105 rounded transition-all cursor-pointer font-bold"
                            title="Confirm Delete"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-105 rounded transition-all cursor-pointer font-bold"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(rc.id)}
                          title="Delete Voucher"
                          className="bg-slate-105 hover:bg-rose-100 text-red-650 p-1.5 font-bold uppercase cursor-pointer rounded-md border border-slate-300 hover:border-red-300 flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      )}
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
          setActiveTab('home');
        }}
        onSelectColumn={() => {
          if (filteredReceipts.length > 0) {
            setSelectedRowIndex(prev => (prev + 1) % filteredReceipts.length);
          }
        }}
        selectColumnLabel="Select Row"
        onDrillDown={() => {
          const sel = filteredReceipts[selectedRowIndex];
          if (sel) {
            handlePrintVoucher(sel);
          }
        }}
        drillDownLabel="Drill Down (PDF)"
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={(from, to) => {
          setFromDate(from);
          setToDate(to);
        }}
        onRemoveLine={() => {
          if (hiddenReceiptIds.length > 0) {
            setHiddenReceiptIds([]);
            triggerToast('All hidden receipt voucher lines restored.');
          } else {
            const sel = filteredReceipts[selectedRowIndex];
            if (sel) {
              setHiddenReceiptIds(prev => [...prev, sel.id]);
              triggerToast(`Voucher ${sel.voucherNo} hidden from view (Press U to restore).`);
            }
          }
        }}
        isLineRemoved={hiddenReceiptIds.length > 0}
        removeLineLabel="Remove Line"
        restoreLineLabel="Restore Line"
        onPrint={handlePrintReceiptsLedger}
        onExport={() => {
          const csvHeader = 'Voucher No,Date,Client Name,Mode,Bank,Cheque/Ref,Amount\n';
          const csvRows = filteredReceipts.map(r => `"${r.voucherNo}","${r.dated || ''}","${(r.clientName || '').replace(/"/g, '""')}","${r.paymentMode || ''}","${(r.bankName || '').replace(/"/g, '""')}","${(r.chequeNoDetails || '').replace(/"/g, '""')}",${r.amountReceived}`).join('\n');
          const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `MFI_Receipt_Vouchers_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        totalRecordsCount={filteredReceipts.length}
      />
    </div>
  );
};
